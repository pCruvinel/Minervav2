/**
 * Hook: useTurnos
 *
 * Hook para gerenciar turnos do calendário
 * - Listar turnos disponíveis
 * - Criar novos turnos
 * - Atualizar turnos existentes
 * - Deletar turnos
 * - Verificar disponibilidade
 */

import { useCallback, useMemo } from 'react';
import { useApi, useMutation } from './use-api';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

// =====================================================
// TYPES
// =====================================================

export interface Turno {
  id: string;
  horaInicio: string;
  horaFim: string;
  vagasTotal: number;
  setores: string[];
  cor: string;
  tipoRecorrencia: 'todos' | 'uteis' | 'custom';
  dataInicio?: string;
  dataFim?: string;
  diasSemana?: number[];
  ativo: boolean;
  criadoPor?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface TurnoComVagas extends Turno {
  vagasOcupadas: number;
  agendamentos?: any[];
}

export interface CreateTurnoInput {
  horaInicio: string;
  horaFim: string;
  vagasTotal: number;
  setores: string[];
  cor: string;
  tipoRecorrencia: 'todos' | 'uteis' | 'custom';
  dataInicio?: string;
  dataFim?: string;
  diasSemana?: number[];
}

export interface UpdateTurnoInput extends Partial<CreateTurnoInput> {
  ativo?: boolean;
}

// =====================================================
// API FUNCTIONS
// =====================================================

const turnosAPI = {
  /**
   * Listar todos os turnos ativos
   */
  async list(): Promise<Turno[]> {
    const { data, error } = await supabase
      .from('turnos')
      .select('*')
      .eq('ativo', true)
      .order('hora_inicio');

    if (error) throw error;
    return (data || []).map(mapTurnoFromDB);
  },

  /**
   * Obter turnos disponíveis para uma data específica
   */
  async getByDate(data: string): Promise<TurnoComVagas[]> {
    const { data: result, error } = await supabase
      .rpc('obter_turnos_disponiveis', { p_data: data });

    if (error) throw error;

    return (result || []).map((item: any) => ({
      id: item.turno_id,
      horaInicio: item.hora_inicio,
      horaFim: item.hora_fim,
      vagasTotal: item.vagas_total,
      vagasOcupadas: Number(item.vagas_ocupadas),
      setores: item.setores,
      cor: item.cor,
      tipoRecorrencia: 'uteis' as const,
      ativo: true,
    }));
  },

  /**
   * Obter turnos de uma semana
   */
  async getByWeek(startDate: string, endDate: string): Promise<Map<string, TurnoComVagas[]>> {
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    const turnosPorDia = new Map<string, TurnoComVagas[]>();

    for (const date of dates) {
      const turnos = await turnosAPI.getByDate(date);
      turnosPorDia.set(date, turnos);
    }

    return turnosPorDia;
  },

  /**
   * Criar novo turno
   */
  async create(input: CreateTurnoInput): Promise<Turno> {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('turnos')
      .insert({
        hora_inicio: input.horaInicio,
        hora_fim: input.horaFim,
        vagas_total: input.vagasTotal,
        setores: input.setores,
        cor: input.cor,
        tipo_recorrencia: input.tipoRecorrencia,
        data_inicio: input.dataInicio,
        data_fim: input.dataFim,
        dias_semana: input.diasSemana,
        criado_por: user.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return mapTurnoFromDB(data);
  },

  /**
   * Atualizar turno existente
   */
  async update(id: string, input: UpdateTurnoInput): Promise<Turno> {
    const updateData: any = {};

    if (input.horaInicio) updateData.hora_inicio = input.horaInicio;
    if (input.horaFim) updateData.hora_fim = input.horaFim;
    if (input.vagasTotal) updateData.vagas_total = input.vagasTotal;
    if (input.setores) updateData.setores = input.setores;
    if (input.cor) updateData.cor = input.cor;
    if (input.tipoRecorrencia) updateData.tipo_recorrencia = input.tipoRecorrencia;
    if (input.dataInicio !== undefined) updateData.data_inicio = input.dataInicio;
    if (input.dataFim !== undefined) updateData.data_fim = input.dataFim;
    if (input.diasSemana !== undefined) updateData.dias_semana = input.diasSemana;
    if (input.ativo !== undefined) updateData.ativo = input.ativo;

    const { data, error } = await supabase
      .from('turnos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapTurnoFromDB(data);
  },

  /**
   * Deletar turno (soft delete)
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('turnos')
      .update({ ativo: false })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Verificar disponibilidade de vagas
   */
  async verificarDisponibilidade(
    turnoId: string,
    data: string,
    horarioInicio: string,
    horarioFim: string
  ): Promise<boolean> {
    const { data: result, error } = await supabase
      .rpc('verificar_vagas_turno', {
        p_turno_id: turnoId,
        p_data: data,
        p_horario_inicio: horarioInicio,
        p_horario_fim: horarioFim,
      });

    if (error) throw error;
    return result === true;
  },
};

// =====================================================
// HOOKS
// =====================================================

/**
 * Hook para listar todos os turnos
 */
export function useTurnos() {
  const { data, loading, error, refetch } = useApi(
    () => turnosAPI.list(),
    {
      onError: (error) => {
        console.error('❌ Erro ao carregar turnos:', error);
        toast.error(`Erro ao carregar turnos: ${error.message}`);
      },
    }
  );

  const turnos = useMemo(() => data || [], [data]);

  return { turnos, loading, error, refetch };
}

/**
 * Hook para obter turnos de uma data específica
 */
export function useTurnosPorData(data: string) {
  const { data: result, loading, error, refetch } = useApi(
    () => turnosAPI.getByDate(data),
    {
      deps: [data],
      onError: (error) => {
        console.error('❌ Erro ao carregar turnos da data:', error);
        toast.error(`Erro ao carregar turnos: ${error.message}`);
      },
    }
  );

  const turnos = useMemo(() => result || [], [result]);

  return { turnos, loading, error, refetch };
}

/**
 * Hook para obter turnos de uma semana
 */
export function useTurnosPorSemana(startDate: string, endDate: string) {
  const { data, loading, error, refetch } = useApi(
    () => turnosAPI.getByWeek(startDate, endDate),
    {
      deps: [startDate, endDate],
      onError: (error) => {
        console.error('❌ Erro ao carregar turnos da semana:', error);
        toast.error(`Erro ao carregar turnos: ${error.message}`);
      },
    }
  );

  return { turnosPorDia: data, loading, error, refetch };
}

/**
 * Hook para criar turno
 */
export function useCreateTurno() {
  return useMutation(turnosAPI.create, {
    onSuccess: (data) => {
      toast.success('Turno criado com sucesso!');
    },
    onError: (error) => {
      console.error('❌ Erro ao criar turno:', error);
      toast.error(`Erro ao criar turno: ${error.message}`);
    },
  });
}

/**
 * Hook para atualizar turno
 */
export function useUpdateTurno(turnoId: string) {
  return useMutation(
    (data: UpdateTurnoInput) => turnosAPI.update(turnoId, data),
    {
      onSuccess: () => {
        toast.success('Turno atualizado com sucesso!');
      },
      onError: (error) => {
        console.error('❌ Erro ao atualizar turno:', error);
        toast.error(`Erro ao atualizar turno: ${error.message}`);
      },
    }
  );
}

/**
 * Hook para deletar turno
 */
export function useDeleteTurno() {
  return useMutation(turnosAPI.delete, {
    onSuccess: () => {
      toast.success('Turno removido com sucesso!');
    },
    onError: (error) => {
      console.error('❌ Erro ao remover turno:', error);
      toast.error(`Erro ao remover turno: ${error.message}`);
    },
  });
}

/**
 * Hook para verificar disponibilidade
 */
export function useVerificarDisponibilidade() {
  return useCallback(
    async (
      turnoId: string,
      data: string,
      horarioInicio: string,
      horarioFim: string
    ): Promise<boolean> => {
      try {
        return await turnosAPI.verificarDisponibilidade(
          turnoId,
          data,
          horarioInicio,
          horarioFim
        );
      } catch (error: any) {
        console.error('❌ Erro ao verificar disponibilidade:', error);
        toast.error(`Erro ao verificar disponibilidade: ${error.message}`);
        return false;
      }
    },
    []
  );
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function mapTurnoFromDB(data: any): Turno {
  return {
    id: data.id,
    horaInicio: data.hora_inicio,
    horaFim: data.hora_fim,
    vagasTotal: data.vagas_total,
    setores: data.setores || [],
    cor: data.cor,
    tipoRecorrencia: data.tipo_recorrencia,
    dataInicio: data.data_inicio,
    dataFim: data.data_fim,
    diasSemana: data.dias_semana,
    ativo: data.ativo,
    criadoPor: data.criado_por,
    criadoEm: data.criado_em,
    atualizadoEm: data.atualizado_em,
  };
}
