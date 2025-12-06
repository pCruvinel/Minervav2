/**
 * Hook: use-recrutamento
 *
 * Hook para gerenciar dados do módulo de Recrutamento (Kanban de Vagas OS-10).
 * Busca requisições de mão de obra e permite atualizar status.
 *
 * @module hooks/use-recrutamento
 */

import { useApi, useMutation } from './use-api';
import { supabase } from '@/lib/supabase-client';
import { toast } from '@/lib/utils/safe-toast';
import { logger } from '@/lib/utils/logger';
import type {
  RequisicaoMaoDeObra,
  VagaRecrutamento,
  RecruitmentColumnStatus,
} from '@/lib/types/recrutamento';

/**
 * Determina o status do Kanban baseado no status da OS e das vagas
 */
function determineKanbanStatus(
  statusGeral: string,
  vagas: VagaRecrutamento[]
): RecruitmentColumnStatus {
  // Se OS está em triagem, aguarda aprovação
  if (statusGeral === 'em_triagem') {
    return 'pendente_aprovacao';
  }

  // Se OS está concluída ou todas as vagas preenchidas
  if (
    statusGeral === 'concluida' ||
    (vagas.length > 0 && vagas.every((v) => v.status === 'preenchida'))
  ) {
    return 'finalizado';
  }

  // Verificar status das vagas
  const hasEmSelecao = vagas.some((v) => v.status === 'em_selecao');
  const hasAberta = vagas.some((v) => v.status === 'aberta');

  // Se alguma vaga está em seleção (entrevistas)
  if (hasEmSelecao) {
    return 'entrevistas';
  }

  // Se há vagas abertas (em divulgação)
  if (hasAberta) {
    return 'em_divulgacao';
  }

  // Fallback: em divulgação
  return 'em_divulgacao';
}

/**
 * API para requisições de mão de obra
 */
const recrutamentoAPI = {
  /**
   * Lista todas as requisições de mão de obra (OS-10) com vagas
   */
  async listRequisicoes(): Promise<RequisicaoMaoDeObra[]> {
    // Primeiro, buscar o ID do tipo OS-10
    const { data: tipoOS, error: tipoError } = await supabase
      .from('tipos_os')
      .select('id')
      .eq('codigo', 'OS-10')
      .single();

    if (tipoError || !tipoOS) {
      logger.error('Tipo OS-10 não encontrado:', tipoError);
      throw new Error('Tipo OS-10 não encontrado no sistema');
    }

    // Buscar todas as OS-10 com dados relacionados
    const { data, error } = await supabase
      .from('ordens_servico')
      .select(
        `
        id,
        codigo_os,
        status_geral,
        descricao,
        data_entrada,
        cc_id,
        criado_por_id,
        metadata,
        updated_at,
        centro_custo:cc_id (id, nome),
        solicitante:criado_por_id (id, nome_completo, avatar_url),
        vagas:os_vagas_recrutamento (*)
      `
      )
      .eq('tipo_os_id', tipoOS.id)
      .neq('status_geral', 'cancelado')
      .order('data_entrada', { ascending: false });

    if (error) {
      logger.error('Erro ao buscar requisições:', error);
      throw error;
    }

    // Transformar dados para o formato esperado
    return (data || []).map((os: any) => {
      const vagas = (os.vagas || []) as VagaRecrutamento[];
      const totalVagas = vagas.reduce((sum, v) => sum + (v.quantidade || 1), 0);

      return {
        id: os.id,
        codigo_os: os.codigo_os,
        status_geral: os.status_geral,
        descricao: os.descricao || '',
        data_entrada: os.data_entrada,
        cc_id: os.cc_id,
        criado_por_id: os.criado_por_id,
        metadata: os.metadata || {},
        updated_at: os.updated_at,
        centro_custo: os.centro_custo || null,
        solicitante: os.solicitante || null,
        vagas,
        total_vagas: totalVagas,
        kanban_status: determineKanbanStatus(os.status_geral, vagas),
      } as RequisicaoMaoDeObra;
    });
  },

  /**
   * Atualiza o status de uma vaga
   */
  async updateVagaStatus(
    vagaId: string,
    status: VagaRecrutamento['status']
  ): Promise<void> {
    const { error } = await supabase
      .from('os_vagas_recrutamento')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', vagaId);

    if (error) {
      logger.error('Erro ao atualizar status da vaga:', error);
      throw error;
    }
  },

  /**
   * Atualiza o status geral de uma OS
   */
  async updateOSStatus(osId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('ordens_servico')
      .update({ status_geral: status, updated_at: new Date().toISOString() })
      .eq('id', osId);

    if (error) {
      logger.error('Erro ao atualizar status da OS:', error);
      throw error;
    }
  },
};

/**
 * Hook para buscar requisições de mão de obra (OS-10)
 *
 * @example
 * ```tsx
 * const { requisicoes, loading, error, refetch } = useRequisicoesMaoDeObra();
 *
 * // Agrupar por status do Kanban
 * const pendentes = requisicoes.filter(r => r.kanban_status === 'pendente_aprovacao');
 * ```
 */
export function useRequisicoesMaoDeObra() {
  const { data, loading, error, refetch } = useApi(
    recrutamentoAPI.listRequisicoes,
    {
      onError: (error) => {
        logger.error('Erro ao carregar requisições:', error);
        toast.error('Erro ao carregar requisições de mão de obra');
      },
    }
  );

  return {
    requisicoes: data || [],
    loading,
    error,
    refetch,
  };
}

/**
 * Hook para atualizar status de uma vaga
 *
 * @example
 * ```tsx
 * const { mutate: updateStatus, loading } = useUpdateVagaStatus();
 *
 * await updateStatus({ vagaId: '123', status: 'em_selecao' });
 * ```
 */
export function useUpdateVagaStatus() {
  return useMutation(
    ({ vagaId, status }: { vagaId: string; status: VagaRecrutamento['status'] }) =>
      recrutamentoAPI.updateVagaStatus(vagaId, status),
    {
      onSuccess: () => toast.success('Status da vaga atualizado!'),
      onError: (error) => toast.error(`Erro: ${error.message}`),
    }
  );
}

/**
 * Hook para atualizar status geral da OS
 *
 * @example
 * ```tsx
 * const { mutate: updateOSStatus, loading } = useUpdateOSStatus();
 *
 * await updateOSStatus({ osId: '123', status: 'em_andamento' });
 * ```
 */
export function useUpdateOSStatus() {
  return useMutation(
    ({ osId, status }: { osId: string; status: string }) =>
      recrutamentoAPI.updateOSStatus(osId, status),
    {
      onSuccess: () => toast.success('Status da OS atualizado!'),
      onError: (error) => toast.error(`Erro: ${error.message}`),
    }
  );
}

export { recrutamentoAPI };
