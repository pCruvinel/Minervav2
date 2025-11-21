/**
 * Hook: useAgendamentos
 *
 * Hook para gerenciar agendamentos do calendário
 * - Listar agendamentos
 * - Criar novos agendamentos
 * - Atualizar agendamentos existentes
 * - Cancelar agendamentos
 * - Buscar agendamentos por filtros
 */

import { useCallback, useMemo } from 'react';
import { useApi, useMutation } from './use-api';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// =====================================================
// TYPES
// =====================================================

export interface Agendamento {
  id: string;
  turnoId: string;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  duracaoHoras: number;
  categoria: string;
  setor: string;
  solicitanteNome?: string;
  solicitanteContato?: string;
  solicitanteObservacoes?: string;
  osId?: string;
  status: 'confirmado' | 'cancelado' | 'realizado' | 'ausente';
  criadoPor?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  canceladoEm?: string;
  canceladoMotivo?: string;
}

export interface AgendamentoComTurno extends Agendamento {
  turno?: {
    horaInicio: string;
    horaFim: string;
    cor: string;
    setores: string[];
  };
}

export interface CreateAgendamentoInput {
  turnoId: string;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  duracaoHoras: number;
  categoria: string;
  setor: string;
  solicitanteNome?: string;
  solicitanteContato?: string;
  solicitanteObservacoes?: string;
  osId?: string;
}

export interface UpdateAgendamentoInput {
  horarioInicio?: string;
  horarioFim?: string;
  duracaoHoras?: number;
  categoria?: string;
  setor?: string;
  solicitanteNome?: string;
  solicitanteContato?: string;
  solicitanteObservacoes?: string;
  status?: 'confirmado' | 'cancelado' | 'realizado' | 'ausente';
}

export interface CancelarAgendamentoInput {
  motivo: string;
}

export interface AgendamentoFilters {
  turnoId?: string;
  data?: string;
  dataInicio?: string;
  dataFim?: string;
  status?: string;
  setor?: string;
  osId?: string;
}

// =====================================================
// API FUNCTIONS
// =====================================================

const agendamentosAPI = {
  /**
   * Listar todos os agendamentos com filtros
   */
  async list(filters?: AgendamentoFilters): Promise<AgendamentoComTurno[]> {
    let query = supabase
      .from('agendamentos')
      .select(`
        *,
        turno:turno_id (
          hora_inicio,
          hora_fim,
          cor,
          setores
        )
      `)
      .order('data', { ascending: true })
      .order('horario_inicio', { ascending: true });

    if (filters?.turnoId) {
      query = query.eq('turno_id', filters.turnoId);
    }

    if (filters?.data) {
      query = query.eq('data', filters.data);
    }

    if (filters?.dataInicio) {
      query = query.gte('data', filters.dataInicio);
    }

    if (filters?.dataFim) {
      query = query.lte('data', filters.dataFim);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.setor) {
      query = query.eq('setor', filters.setor);
    }

    if (filters?.osId) {
      query = query.eq('os_id', filters.osId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(mapAgendamentoFromDB);
  },

  /**
   * Obter agendamentos de uma data específica
   */
  async getByDate(data: string): Promise<AgendamentoComTurno[]> {
    return agendamentosAPI.list({ data, status: 'confirmado' });
  },

  /**
   * Obter agendamentos de um turno específico
   */
  async getByTurno(turnoId: string, data?: string): Promise<Agendamento[]> {
    const filters: AgendamentoFilters = { turnoId };
    if (data) filters.data = data;

    return agendamentosAPI.list(filters);
  },

  /**
   * Obter um agendamento específico
   */
  async getById(id: string): Promise<AgendamentoComTurno> {
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        turno:turno_id (
          hora_inicio,
          hora_fim,
          cor,
          setores
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return mapAgendamentoFromDB(data);
  },

  /**
   * Criar novo agendamento
   */
  async create(input: CreateAgendamentoInput): Promise<Agendamento> {
    const { data: user } = await supabase.auth.getUser();

    // Validar disponibilidade antes de criar
    const { data: disponivel, error: errorDisponivel } = await supabase
      .rpc('verificar_vagas_turno', {
        p_turno_id: input.turnoId,
        p_data: input.data,
        p_horario_inicio: input.horarioInicio,
        p_horario_fim: input.horarioFim,
      });

    if (errorDisponivel) throw errorDisponivel;

    if (!disponivel) {
      throw new Error('Não há vagas disponíveis neste horário');
    }

    const { data, error } = await supabase
      .from('agendamentos')
      .insert({
        turno_id: input.turnoId,
        data: input.data,
        horario_inicio: input.horarioInicio,
        horario_fim: input.horarioFim,
        duracao_horas: input.duracaoHoras,
        categoria: input.categoria,
        setor: input.setor,
        solicitante_nome: input.solicitanteNome,
        solicitante_contato: input.solicitanteContato,
        solicitante_observacoes: input.solicitanteObservacoes,
        os_id: input.osId,
        criado_por: user.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return mapAgendamentoFromDB(data);
  },

  /**
   * Atualizar agendamento existente
   */
  async update(id: string, input: UpdateAgendamentoInput): Promise<Agendamento> {
    const updateData: any = {};

    if (input.horarioInicio) updateData.horario_inicio = input.horarioInicio;
    if (input.horarioFim) updateData.horario_fim = input.horarioFim;
    if (input.duracaoHoras) updateData.duracao_horas = input.duracaoHoras;
    if (input.categoria) updateData.categoria = input.categoria;
    if (input.setor) updateData.setor = input.setor;
    if (input.solicitanteNome !== undefined) updateData.solicitante_nome = input.solicitanteNome;
    if (input.solicitanteContato !== undefined) updateData.solicitante_contato = input.solicitanteContato;
    if (input.solicitanteObservacoes !== undefined) updateData.solicitante_observacoes = input.solicitanteObservacoes;
    if (input.status) updateData.status = input.status;

    const { data, error } = await supabase
      .from('agendamentos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapAgendamentoFromDB(data);
  },

  /**
   * Cancelar agendamento
   */
  async cancel(id: string, motivo: string): Promise<Agendamento> {
    const { data, error } = await supabase
      .from('agendamentos')
      .update({
        status: 'cancelado',
        cancelado_em: new Date().toISOString(),
        cancelado_motivo: motivo,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapAgendamentoFromDB(data);
  },

  /**
   * Marcar agendamento como realizado
   */
  async marcarRealizado(id: string): Promise<Agendamento> {
    const { data, error } = await supabase
      .from('agendamentos')
      .update({ status: 'realizado' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapAgendamentoFromDB(data);
  },

  /**
   * Marcar agendamento como ausente
   */
  async marcarAusente(id: string): Promise<Agendamento> {
    const { data, error } = await supabase
      .from('agendamentos')
      .update({ status: 'ausente' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapAgendamentoFromDB(data);
  },
};

// =====================================================
// HOOKS
// =====================================================

/**
 * Hook para listar agendamentos com filtros
 */
export function useAgendamentos(filters?: AgendamentoFilters) {
  const { data, loading, error, refetch } = useApi(
    () => agendamentosAPI.list(filters),
    {
      deps: [
        filters?.turnoId,
        filters?.data,
        filters?.dataInicio,
        filters?.dataFim,
        filters?.status,
        filters?.setor,
        filters?.osId,
      ],
      onError: (error) => {
        console.error('❌ Erro ao carregar agendamentos:', error);
        toast.error(`Erro ao carregar agendamentos: ${error.message}`);
      },
    }
  );

  const agendamentos = useMemo(() => data || [], [data]);

  return { agendamentos, loading, error, refetch };
}

/**
 * Hook para obter agendamentos de uma data específica
 */
export function useAgendamentosPorData(data: string) {
  const { data: result, loading, error, refetch } = useApi(
    () => agendamentosAPI.getByDate(data),
    {
      deps: [data],
      onError: (error) => {
        console.error('❌ Erro ao carregar agendamentos da data:', error);
        toast.error(`Erro ao carregar agendamentos: ${error.message}`);
      },
    }
  );

  const agendamentos = useMemo(() => result || [], [result]);

  return { agendamentos, loading, error, refetch };
}

/**
 * Hook para obter um agendamento específico
 */
export function useAgendamento(id: string) {
  return useApi(
    () => agendamentosAPI.getById(id),
    {
      deps: [id],
      onError: (error) => {
        console.error('❌ Erro ao carregar agendamento:', error);
        toast.error(`Erro ao carregar agendamento: ${error.message}`);
      },
    }
  );
}

/**
 * Hook para criar agendamento
 */
export function useCreateAgendamento() {
  return useMutation(agendamentosAPI.create, {
    onSuccess: () => {
      toast.success('Agendamento criado com sucesso!');
    },
    onError: (error) => {
      console.error('❌ Erro ao criar agendamento:', error);
      toast.error(`Erro ao criar agendamento: ${error.message}`);
    },
  });
}

/**
 * Hook para atualizar agendamento
 */
export function useUpdateAgendamento(agendamentoId: string) {
  return useMutation(
    (data: UpdateAgendamentoInput) => agendamentosAPI.update(agendamentoId, data),
    {
      onSuccess: () => {
        toast.success('Agendamento atualizado com sucesso!');
      },
      onError: (error) => {
        console.error('❌ Erro ao atualizar agendamento:', error);
        toast.error(`Erro ao atualizar agendamento: ${error.message}`);
      },
    }
  );
}

/**
 * Hook para cancelar agendamento
 */
export function useCancelarAgendamento() {
  return useMutation(
    ({ id, motivo }: { id: string; motivo: string }) => agendamentosAPI.cancel(id, motivo),
    {
      onSuccess: () => {
        toast.success('Agendamento cancelado com sucesso!');
      },
      onError: (error) => {
        console.error('❌ Erro ao cancelar agendamento:', error);
        toast.error(`Erro ao cancelar agendamento: ${error.message}`);
      },
    }
  );
}

/**
 * Hook para marcar como realizado
 */
export function useMarcarRealizado() {
  return useMutation(agendamentosAPI.marcarRealizado, {
    onSuccess: () => {
      toast.success('Agendamento marcado como realizado!');
    },
    onError: (error) => {
      console.error('❌ Erro ao marcar agendamento:', error);
      toast.error(`Erro ao marcar agendamento: ${error.message}`);
    },
  });
}

/**
 * Hook para marcar como ausente
 */
export function useMarcarAusente() {
  return useMutation(agendamentosAPI.marcarAusente, {
    onSuccess: () => {
      toast.success('Agendamento marcado como ausente!');
    },
    onError: (error) => {
      console.error('❌ Erro ao marcar agendamento:', error);
      toast.error(`Erro ao marcar agendamento: ${error.message}`);
    },
  });
}

/**
 * Hook para verificar disponibilidade de vagas em um turno
 * Retorna uma função assíncrona que verifica se há vagas disponíveis
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
        const { data: disponivel, error } = await supabase.rpc('verificar_vagas_turno', {
          p_turno_id: turnoId,
          p_data: data,
          p_horario_inicio: horarioInicio,
          p_horario_fim: horarioFim,
        });

        if (error) {
          console.error('❌ Erro ao verificar disponibilidade:', error);
          throw error;
        }

        return disponivel === true;
      } catch (error) {
        console.error('❌ Erro ao verificar disponibilidade:', error);
        return false;
      }
    },
    []
  );
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function mapAgendamentoFromDB(data: any): AgendamentoComTurno {
  const agendamento: AgendamentoComTurno = {
    id: data.id,
    turnoId: data.turno_id,
    data: data.data,
    horarioInicio: data.horario_inicio,
    horarioFim: data.horario_fim,
    duracaoHoras: data.duracao_horas,
    categoria: data.categoria,
    setor: data.setor,
    solicitanteNome: data.solicitante_nome,
    solicitanteContato: data.solicitante_contato,
    solicitanteObservacoes: data.solicitante_observacoes,
    osId: data.os_id,
    status: data.status,
    criadoPor: data.criado_por,
    criadoEm: data.criado_em,
    atualizadoEm: data.atualizado_em,
    canceladoEm: data.cancelado_em,
    canceladoMotivo: data.cancelado_motivo,
  };

  if (data.turno) {
    agendamento.turno = {
      horaInicio: data.turno.hora_inicio,
      horaFim: data.turno.hora_fim,
      cor: data.turno.cor,
      setores: data.turno.setores,
    };
  }

  return agendamento;
}
