/**
 * Hook: use-recrutamento
 *
 * Hook para gerenciar dados do módulo de Recrutamento (Kanban de Vagas OS-10).
 * Busca requisições de mão de obra e permite atualizar status.
 *
 * @module hooks/use-recrutamento
 */

import { useMemo } from 'react';
import { useApi, useMutation } from './use-api';
import { supabase } from '@/lib/supabase-client';
import { toast } from '@/lib/utils/safe-toast';
import { logger } from '@/lib/utils/logger';
import { getOS10TipoId } from '@/lib/utils/os-helpers';
import type {
  RequisicaoMaoDeObra,
  VagaRecrutamento,
  RecruitmentColumnStatus,
  CandidatoVaga,
} from '@/lib/types/recrutamento';
import { KANBAN_TO_MUTATIONS, type KanbanStatus } from '@/lib/utils/status-machine';

type RawCentroCusto = RequisicaoMaoDeObra['centro_custo'] | NonNullable<RequisicaoMaoDeObra['centro_custo']>[];
type RawSolicitante =
  | RequisicaoMaoDeObra['solicitante']
  | NonNullable<RequisicaoMaoDeObra['solicitante']>[];

interface RawRequisicaoMaoDeObraRecord {
  id: string;
  codigo_os: string;
  status_geral: string;
  descricao: string | null;
  data_entrada: string;
  cc_id: string | null;
  criado_por_id: string | null;
  metadata?: RequisicaoMaoDeObra['metadata'] | null;
  updated_at?: string;
  centro_custo: RawCentroCusto;
  solicitante: RawSolicitante;
  vagas: VagaRecrutamento[] | null;
}

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
    // Usar helper cacheado para buscar o ID do tipo OS-10
    const tipoOSId = await getOS10TipoId();

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
      .eq('tipo_os_id', tipoOSId)
      .neq('status_geral', 'cancelado')
      .order('data_entrada', { ascending: false });

    if (error) {
      logger.error('Erro ao buscar requisições:', error);
      throw error;
    }

    // Transformar dados para o formato esperado
    const records = (data ?? []) as RawRequisicaoMaoDeObraRecord[];

    return records.map((os) => {
      const vagas = (os.vagas || []) as VagaRecrutamento[];
      const totalVagas = vagas.reduce((sum, v) => sum + (v.quantidade || 1), 0);
      const centroCusto = Array.isArray(os.centro_custo)
        ? os.centro_custo[0] ?? null
        : os.centro_custo ?? null;
      const solicitante = Array.isArray(os.solicitante)
        ? os.solicitante[0] ?? null
        : os.solicitante ?? null;

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
        centro_custo: centroCusto,
        solicitante,
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
   * Atualiza o status de TODAS as vagas de uma OS em batch (1 query)
   */
  async updateAllVagasStatus(
    osId: string,
    status: VagaRecrutamento['status']
  ): Promise<void> {
    const { error } = await supabase
      .from('os_vagas_recrutamento')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('os_id', osId);

    if (error) {
      logger.error('Erro ao atualizar status das vagas em batch:', error);
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

  /**
   * Lista os candidatos vinculados a uma vaga
   */
  async listCandidatosByVaga(vagaId: string): Promise<CandidatoVaga[]> {
    const { data, error } = await supabase
      .from('candidato_vaga')
      .select(`
        id,
        candidato_id,
        vaga_id,
        status_candidatura,
        nota_entrevista,
        avaliacao,
        created_at,
        candidato:candidatos (*)
      `)
      .eq('vaga_id', vagaId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Erro ao buscar candidatos da vaga:', error);
      throw error;
    }

    return data as unknown as CandidatoVaga[];
  },

  /**
   * Adiciona um candidato (ou atualiza se já existir) e vincula à vaga
   */
  async addCandidato(payload: {
    vagaId: string;
    nome_completo: string;
    email?: string | null;
    telefone?: string | null;
    fonte?: string | null;
    observacoes?: string | null;
  }): Promise<void> {
    let candidatoId: string;

    if (payload.email) {
      const { data: existing } = await supabase
        .from('candidatos')
        .select('id')
        .eq('email', payload.email)
        .single();
        
      if (existing) {
        candidatoId = existing.id;
      } else {
        const { data, error } = await supabase
          .from('candidatos')
          .insert({
            nome_completo: payload.nome_completo,
            email: payload.email,
            telefone: payload.telefone,
            fonte: payload.fonte,
            observacoes: payload.observacoes
          })
          .select('id')
          .single();
          
        if (error) throw error;
        candidatoId = data.id;
      }
    } else {
      const { data, error } = await supabase
        .from('candidatos')
        .insert({
          nome_completo: payload.nome_completo,
          telefone: payload.telefone,
          fonte: payload.fonte,
          observacoes: payload.observacoes
        })
        .select('id')
        .single();
        
      if (error) throw error;
      candidatoId = data.id;
    }

    const { error: relError } = await supabase
      .from('candidato_vaga')
      .insert({
        candidato_id: candidatoId,
        vaga_id: payload.vagaId,
        status_candidatura: 'inscrito'
      });
      
    if (relError && relError.code !== '23505') {
      logger.error('Erro ao vincular candidato à vaga:', relError);
      throw relError;
    }
  },

  /**
   * Atualiza o status da candidatura na tabela de junção
   */
  async updateCandidaturaStatus(
    id: string,
    status_candidatura: CandidatoVaga['status_candidatura']
  ): Promise<void> {
    const { error } = await supabase
      .from('candidato_vaga')
      .update({ status_candidatura, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      logger.error('Erro ao atualizar status da candidatura:', error);
      throw error;
    }
  },

  /**
   * Move a OS e suas vagas baseadas na coluna destino do Kanban
   */
  async moveRequisicaoKanban({
    reqId,
    targetStatus,
  }: {
    reqId: string;
    targetStatus: KanbanStatus;
  }): Promise<void> {
    const mutations = KANBAN_TO_MUTATIONS[targetStatus];
    if (!mutations) {
      throw new Error(`Transição para ${targetStatus} não mapeada ou inválida.`);
    }

    if (mutations.vagaStatus) {
      await this.updateAllVagasStatus(reqId, mutations.vagaStatus);
    }
    if (mutations.osStatus) {
      await this.updateOSStatus(reqId, mutations.osStatus);
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

/**
 * Hook para atualizar status de TODAS as vagas de uma OS em batch
 *
 * @example
 * ```tsx
 * const { mutate: updateAllVagas, loading } = useUpdateAllVagasStatus();
 *
 * await updateAllVagas({ osId: '123', status: 'em_selecao' });
 * ```
 */
export function useUpdateAllVagasStatus() {
  return useMutation(
    ({ osId, status }: { osId: string; status: VagaRecrutamento['status'] }) =>
      recrutamentoAPI.updateAllVagasStatus(osId, status),
    {
      onSuccess: () => toast.success('Status das vagas atualizado!'),
      onError: (error) => toast.error(`Erro: ${error.message}`),
    }
  );
}

/**
 * Hook para buscar candidatos de uma vaga específica
 */
export function useCandidatosByVaga(vagaId: string | undefined) {
  const { data, loading, error, refetch } = useApi(
    () => {
      if (!vagaId) return Promise.resolve([]);
      return recrutamentoAPI.listCandidatosByVaga(vagaId);
    },
    {
      onError: (error) => {
        logger.error('Erro ao carregar candidatos:', error);
        toast.error('Erro ao carregar candidatos da vaga');
      },
    }
  );

  return {
    candidatos: data || [],
    loading,
    error,
    refetch,
  };
}

/**
 * Hook para adicionar/vincular um novo candidato
 */
export function useAddCandidato() {
  return useMutation(
    (payload: {
      vagaId: string;
      nome_completo: string;
      email?: string | null;
      telefone?: string | null;
      fonte?: string | null;
      observacoes?: string | null;
    }) => recrutamentoAPI.addCandidato(payload),
    {
      onSuccess: () => toast.success('Candidato cadastrado com sucesso!'),
      onError: (error) => toast.error(`Erro ao cadastrar: ${error.message}`),
    }
  );
}

/**
 * Hook para atualizar o status do candidato na vaga
 */
export function useUpdateCandidaturaStatus() {
  return useMutation(
    ({ id, status }: { id: string; status: CandidatoVaga['status_candidatura'] }) =>
      recrutamentoAPI.updateCandidaturaStatus(id, status),
    {
      onSuccess: () => toast.success('Status da candidatura atualizado!'),
      onError: (error) => toast.error(`Erro: ${error.message}`),
    }
  );
}

/**
 * Hook para mover uma requisição no Kanban (dnd)
 */
export function useMoveRequisicaoKanban() {
  return useMutation(
    (payload: { reqId: string; targetStatus: KanbanStatus }) =>
      recrutamentoAPI.moveRequisicaoKanban(payload),
    {
      onError: (error) => toast.error(`Erro ao mover req no kanban: ${error.message}`),
    }
  );
}

// ---------------------------------------------------------------------------
// Dashboard Metrics
// ---------------------------------------------------------------------------

export interface DashboardMetrics {
  totalVagas: number;
  vagasAbertas: number;
  vagasPreenchidas: number;
  tempoMedio: number;
  taxaConversao: number;
}

/**
 * Hook para calcular métricas do dashboard de recrutamento.
 *
 * Extrai, filtra (por período) e agrega dados das requisições de mão de obra.
 *
 * @param periodoDias - Filtro de período em dias (30, 60 ou 90). Default: 90.
 *
 * @example
 * ```tsx
 * const { metrics, loading, filteredRequisicoes } = useDashboardMetrics(60);
 * ```
 */
export function useDashboardMetrics(periodoDias: 30 | 60 | 90 = 90) {
  const { requisicoes, loading } = useRequisicoesMaoDeObra();

  const { metrics, filteredRequisicoes } = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - periodoDias);

    const filtered = requisicoes.filter(
      (r) => new Date(r.data_entrada) >= cutoff
    );

    let totalVagas = 0;
    let vagasAbertas = 0;
    let vagasPreenchidas = 0;
    const temposPreenchimento: number[] = [];

    filtered.forEach((req) => {
      req.vagas?.forEach((vaga) => {
        totalVagas += vaga.quantidade;
        if (vaga.status === 'aberta' || vaga.status === 'em_selecao') {
          vagasAbertas += vaga.quantidade;
        } else if (vaga.status === 'preenchida') {
          vagasPreenchidas += vaga.quantidade;

          if (vaga.updated_at && req.data_entrada) {
            const inicio = new Date(req.data_entrada).getTime();
            const fim = new Date(vaga.updated_at).getTime();
            const dias = Math.max(1, Math.round((fim - inicio) / (1000 * 60 * 60 * 24)));
            temposPreenchimento.push(dias);
          }
        }
      });
    });

    const tempoMedio =
      temposPreenchimento.length > 0
        ? Math.round(
            temposPreenchimento.reduce((a, b) => a + b, 0) /
              temposPreenchimento.length
          )
        : 0;

    const taxaConversao =
      totalVagas > 0 ? Math.round((vagasPreenchidas / totalVagas) * 100) : 0;

    return {
      metrics: {
        totalVagas,
        vagasAbertas,
        vagasPreenchidas,
        tempoMedio,
        taxaConversao,
      } satisfies DashboardMetrics,
      filteredRequisicoes: filtered,
    };
  }, [requisicoes, periodoDias]);

  return { metrics, loading, filteredRequisicoes };
}

export { recrutamentoAPI };
