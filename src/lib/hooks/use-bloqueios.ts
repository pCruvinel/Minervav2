/**
 * Hook: useBloqueios
 *
 * Hook para gerenciar bloqueios do calendário
 * - Listar bloqueios ativos
 * - Criar novos bloqueios
 * - Atualizar bloqueios existentes
 * - Deletar bloqueios
 * - Verificar se data/horário está bloqueado
 */

import { useCallback, useMemo } from 'react';
import { useApi, useMutation } from './use-api';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import type { 
  CalendarioBloqueio, 
  CreateBloqueioInput, 
  BloqueioMotivo 
} from '@/lib/types';

// =====================================================
// TYPES
// =====================================================

export interface BloqueioFilters {
  dataInicio?: string;
  dataFim?: string;
  setorId?: string;
  motivo?: BloqueioMotivo;
  ativo?: boolean;
}

export interface UpdateBloqueioInput extends Partial<CreateBloqueioInput> {
  ativo?: boolean;
}

// =====================================================
// API FUNCTIONS
// =====================================================

const bloqueiosAPI = {
  /**
   * Listar bloqueios com filtros
   */
  async list(filters?: BloqueioFilters): Promise<CalendarioBloqueio[]> {
    let query = supabase
      .from('calendario_bloqueios')
      .select(`
        *,
        setor:setor_id (
          slug,
          nome
        ),
        criador:criado_por (
          nome_completo
        )
      `)
      .order('data_inicio', { ascending: true });

    // Aplicar filtros
    if (filters?.ativo !== undefined) {
      query = query.eq('ativo', filters.ativo);
    } else {
      query = query.eq('ativo', true);
    }

    if (filters?.dataInicio) {
      query = query.gte('data_fim', filters.dataInicio);
    }

    if (filters?.dataFim) {
      query = query.lte('data_inicio', filters.dataFim);
    }

    if (filters?.setorId) {
      query = query.or(`setor_id.eq.${filters.setorId},setor_id.is.null`);
    }

    if (filters?.motivo) {
      query = query.eq('motivo', filters.motivo);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(mapBloqueioFromDB);
  },

  /**
   * Obter bloqueios de um período específico
   */
  async getByPeriodo(dataInicio: string, dataFim: string): Promise<CalendarioBloqueio[]> {
    return bloqueiosAPI.list({ dataInicio, dataFim, ativo: true });
  },

  /**
   * Obter bloqueios de uma data específica
   */
  async getByDate(data: string): Promise<CalendarioBloqueio[]> {
    return bloqueiosAPI.list({ dataInicio: data, dataFim: data, ativo: true });
  },

  /**
   * Verificar se uma data/horário está bloqueado
   */
  async verificarBloqueio(
    data: string,
    horaInicio?: string,
    horaFim?: string,
    setorSlug?: string
  ): Promise<boolean> {
    const { data: bloqueado, error } = await supabase
      .rpc('verificar_bloqueio', {
        p_data: data,
        p_hora_inicio: horaInicio || null,
        p_hora_fim: horaFim || null,
        p_setor_slug: setorSlug || null,
      });

    if (error) throw error;
    return bloqueado === true;
  },

  /**
   * Criar novo bloqueio
   */
  async create(input: CreateBloqueioInput): Promise<CalendarioBloqueio> {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('calendario_bloqueios')
      .insert({
        data_inicio: input.dataInicio,
        data_fim: input.dataFim,
        hora_inicio: input.horaInicio || null,
        hora_fim: input.horaFim || null,
        setor_id: input.setorId || null,
        motivo: input.motivo,
        descricao: input.descricao,
        cor: input.cor || '#9CA3AF',
        dia_inteiro: input.diaInteiro ?? (!input.horaInicio && !input.horaFim),
        criado_por: user.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return mapBloqueioFromDB(data);
  },

  /**
   * Atualizar bloqueio existente
   */
  async update(id: string, input: UpdateBloqueioInput): Promise<CalendarioBloqueio> {
    const updateData: Record<string, unknown> = {};

    if (input.dataInicio) updateData.data_inicio = input.dataInicio;
    if (input.dataFim) updateData.data_fim = input.dataFim;
    if (input.horaInicio !== undefined) updateData.hora_inicio = input.horaInicio;
    if (input.horaFim !== undefined) updateData.hora_fim = input.horaFim;
    if (input.setorId !== undefined) updateData.setor_id = input.setorId;
    if (input.motivo) updateData.motivo = input.motivo;
    if (input.descricao !== undefined) updateData.descricao = input.descricao;
    if (input.cor) updateData.cor = input.cor;
    if (input.diaInteiro !== undefined) updateData.dia_inteiro = input.diaInteiro;
    if (input.ativo !== undefined) updateData.ativo = input.ativo;

    const { data, error } = await supabase
      .from('calendario_bloqueios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapBloqueioFromDB(data);
  },

  /**
   * Deletar bloqueio (soft delete - desativar)
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('calendario_bloqueios')
      .update({ ativo: false })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Deletar bloqueio permanentemente (hard delete)
   */
  async hardDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('calendario_bloqueios')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// =====================================================
// HOOKS
// =====================================================

/**
 * Hook para listar bloqueios com filtros
 */
export function useBloqueios(filters?: BloqueioFilters) {
  const { data, loading, error, refetch } = useApi(
    () => bloqueiosAPI.list(filters),
    {
      deps: [
        filters?.dataInicio,
        filters?.dataFim,
        filters?.setorId,
        filters?.motivo,
        filters?.ativo,
      ],
      onError: (error) => {
        console.error('❌ Erro ao carregar bloqueios:', error);
        toast.error(`Erro ao carregar bloqueios: ${error.message}`);
      },
    }
  );

  const bloqueios = useMemo(() => data || [], [data]);

  return { bloqueios, loading, error, refetch };
}

/**
 * Hook para obter bloqueios de um período
 */
export function useBloqueiosPorPeriodo(dataInicio: string, dataFim: string) {
  const { data, loading, error, refetch } = useApi(
    () => bloqueiosAPI.getByPeriodo(dataInicio, dataFim),
    {
      deps: [dataInicio, dataFim],
      onError: (error) => {
        console.error('❌ Erro ao carregar bloqueios do período:', error);
      },
    }
  );

  const bloqueios = useMemo(() => data || [], [data]);

  return { bloqueios, loading, error, refetch };
}

/**
 * Hook para verificar se data está bloqueada
 */
export function useVerificarBloqueio() {
  return useCallback(
    async (
      data: string,
      horaInicio?: string,
      horaFim?: string,
      setorSlug?: string
    ): Promise<boolean> => {
      try {
        return await bloqueiosAPI.verificarBloqueio(data, horaInicio, horaFim, setorSlug);
      } catch (error) {
        console.error('❌ Erro ao verificar bloqueio:', error);
        return false;
      }
    },
    []
  );
}

/**
 * Hook para criar bloqueio
 */
export function useCreateBloqueio() {
  return useMutation(bloqueiosAPI.create, {
    onSuccess: () => {
      toast.success('Bloqueio criado com sucesso!');
    },
    onError: (error) => {
      console.error('❌ Erro ao criar bloqueio:', error);
      toast.error(`Erro ao criar bloqueio: ${error.message}`);
    },
  });
}

/**
 * Hook para atualizar bloqueio
 */
export function useUpdateBloqueio(bloqueioId: string) {
  return useMutation(
    (data: UpdateBloqueioInput) => bloqueiosAPI.update(bloqueioId, data),
    {
      onSuccess: () => {
        toast.success('Bloqueio atualizado com sucesso!');
      },
      onError: (error) => {
        console.error('❌ Erro ao atualizar bloqueio:', error);
        toast.error(`Erro ao atualizar bloqueio: ${error.message}`);
      },
    }
  );
}

/**
 * Hook para deletar bloqueio
 */
export function useDeleteBloqueio() {
  return useMutation(bloqueiosAPI.delete, {
    onSuccess: () => {
      toast.success('Bloqueio removido com sucesso!');
    },
    onError: (error) => {
      console.error('❌ Erro ao remover bloqueio:', error);
      toast.error(`Erro ao remover bloqueio: ${error.message}`);
    },
  });
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function mapBloqueioFromDB(data: Record<string, unknown>): CalendarioBloqueio {
  const setor = data.setor as Record<string, unknown> | null;
  const criador = data.criador as Record<string, unknown> | null;

  return {
    id: data.id as string,
    dataInicio: data.data_inicio as string,
    dataFim: data.data_fim as string,
    horaInicio: data.hora_inicio as string | undefined,
    horaFim: data.hora_fim as string | undefined,
    setorId: data.setor_id as string | undefined,
    setorSlug: setor?.slug as string | undefined,
    motivo: data.motivo as BloqueioMotivo,
    descricao: data.descricao as string | undefined,
    cor: data.cor as string | undefined,
    ativo: data.ativo as boolean,
    diaInteiro: data.dia_inteiro as boolean,
    criadoPor: data.criado_por as string | undefined,
    criadoPorNome: criador?.nome_completo as string | undefined,
    createdAt: data.created_at as string | undefined,
    updatedAt: data.updated_at as string | undefined,
  };
}

// Export API para uso direto
export { bloqueiosAPI };
