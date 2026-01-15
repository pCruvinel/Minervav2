/**
 * Hook: useSetorWorkload
 * 
 * Retorna dados hierárquicos para a visualização de Workload por Setor:
 * - Nível 1: Setores (Obras, Assessoria, Administrativo)
 * - Nível 2: Colaboradores (Coordenador primeiro, depois operacionais)
 * - Nível 3: OSs ativas de cada colaborador
 * 
 * @see docs/technical/COLABORADORES_MODULE.md
 */
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/utils/logger';
import { type OSStatus, type StatusSituacao } from '@/lib/types';

// ============================================================
// TIPOS
// ============================================================

export interface OSWorkloadItem {
  id: string;
  codigo_os: string;
  cliente_nome: string;
  data_entrada: string;
  etapa_atual_nome: string;
  etapa_atual_ordem: number;
  status_geral: OSStatus;
  status_situacao: StatusSituacao | null;
  data_prazo: string | null;
  anexos_count: number;
  prazoVencido: boolean;
  tipo_os_nome: string;
}

export interface ColaboradorWorkload {
  id: string;
  nome_completo: string;
  avatar_url: string | null;
  cargo_nome: string;
  funcao: string;
  is_coordenador: boolean;
  os_ativas: OSWorkloadItem[];
  total_os: number;
  os_atrasadas: number;
}

export interface SetorWorkload {
  id: string;
  nome: string;
  slug: string;
  colaboradores: ColaboradorWorkload[];
  total_os: number;
  total_colaboradores: number;
}

interface UseSetorWorkloadReturn {
  setores: SetorWorkload[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// ============================================================
// CONSTANTES
// ============================================================

/** Slugs de funções consideradas coordenador (aparecem primeiro) */
const COORDINATOR_FUNCTIONS = ['coord_obras', 'coord_assessoria', 'coord_administrativo'];

/** Setores principais do sistema */
const SETORES_PRINCIPAIS = ['obras', 'assessoria', 'administrativo'];

// ============================================================
// HOOK
// ============================================================

export function useSetorWorkload(): UseSetorWorkloadReturn {
  const [setores, setSetores] = useState<SetorWorkload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Buscar setores principais
      const { data: setoresData, error: setoresError } = await supabase
        .from('setores')
        .select('id, nome, slug')
        .in('slug', SETORES_PRINCIPAIS)
        .order('nome');

      if (setoresError) throw setoresError;

      // 2. Buscar colaboradores ativos com cargo e setor
      const { data: colaboradoresData, error: colabError } = await supabase
        .from('colaboradores')
        .select(`
          id,
          nome_completo,
          avatar_url,
          funcao,
          setor_id,
          cargos:cargo_id(id, nome, slug),
          setores:setor_id(id, nome, slug)
        `)
        .eq('ativo', true)
        .not('setor_id', 'is', null);

      if (colabError) throw colabError;

      // 3. Buscar OSs ativas (não concluídas/canceladas) com responsável
      const { data: osData, error: osError } = await supabase
        .from('os_detalhes_completos')
        .select('*')
        .not('status_geral', 'in', '("concluido","cancelado")')
        .order('data_entrada', { ascending: false });

      if (osError) throw osError;

      // 4. Buscar status_situacao das OSs (não está na view)
      const osIds = (osData || []).map((os: any) => os.id);
      let statusSituacaoMap: Record<string, string> = {};
      
      if (osIds.length > 0) {
        const { data: statusData } = await supabase
          .from('ordens_servico')
          .select('id, status_situacao')
          .in('id', osIds);
        
        if (statusData) {
          statusData.forEach((item) => {
            statusSituacaoMap[item.id] = item.status_situacao;
          });
        }
      }

      // 5. Buscar contagem de anexos por OS
      let anexosMap: Record<string, number> = {};
      if (osIds.length > 0) {
        const { data: anexosData } = await supabase
          .from('os_documentos')
          .select('os_id')
          .in('os_id', osIds);
        
        if (anexosData) {
          anexosData.forEach((doc: any) => {
            anexosMap[doc.os_id] = (anexosMap[doc.os_id] || 0) + 1;
          });
        }
      }

      // 6. Buscar etapas atuais
      let etapasMap: Record<string, { nome: string; ordem: number }> = {};
      if (osIds.length > 0) {
        const { data: etapasData } = await supabase
          .from('os_etapas')
          .select('os_id, nome_etapa, ordem, status')
          .in('os_id', osIds)
          .order('ordem', { ascending: true });

        if (etapasData) {
          const etapasPorOS: Record<string, typeof etapasData> = {};
          etapasData.forEach((etapa) => {
            if (!etapasPorOS[etapa.os_id]) {
              etapasPorOS[etapa.os_id] = [];
            }
            etapasPorOS[etapa.os_id].push(etapa);
          });

          Object.entries(etapasPorOS).forEach(([osId, etapas]) => {
            const etapaAtual = etapas.find(
              (e) => e.status === 'pendente' || e.status === 'em_andamento'
            );
            if (etapaAtual) {
              etapasMap[osId] = {
                nome: etapaAtual.nome_etapa,
                ordem: etapaAtual.ordem
              };
            }
          });
        }
      }

      const hoje = new Date();

      // 7. Processar e agrupar dados hierarquicamente
      const result: SetorWorkload[] = (setoresData || []).map(setor => {
        // Filtrar colaboradores do setor
        const colaboradoresDoSetor = (colaboradoresData || [])
          .filter((colab: any) => colab.setores?.slug === setor.slug)
          .map((colab: any) => {
            const isCoordenador = COORDINATOR_FUNCTIONS.includes(colab.funcao);
            
            // Filtrar OSs do colaborador
            const osDoColaborador = (osData || [])
              .filter((os: any) => os.responsavel_id === colab.id)
              .map((os: any): OSWorkloadItem => {
                const prazoVencido = os.data_prazo 
                  ? new Date(os.data_prazo) < hoje 
                  : false;

                return {
                  id: os.id,
                  codigo_os: os.codigo_os,
                  cliente_nome: os.cliente_nome || 'Cliente não informado',
                  data_entrada: os.data_entrada,
                  etapa_atual_nome: etapasMap[os.id]?.nome || 'Sem etapa',
                  etapa_atual_ordem: etapasMap[os.id]?.ordem || 0,
                  status_geral: os.status_geral as OSStatus,
                  status_situacao: (statusSituacaoMap[os.id] || 'acao_pendente') as StatusSituacao,
                  data_prazo: os.data_prazo,
                  anexos_count: anexosMap[os.id] || 0,
                  prazoVencido,
                  tipo_os_nome: os.tipo_os_nome || 'Tipo não informado'
                };
              });

            const osAtrasadas = osDoColaborador.filter(os => os.prazoVencido).length;

            return {
              id: colab.id,
              nome_completo: colab.nome_completo,
              avatar_url: colab.avatar_url,
              cargo_nome: colab.cargos?.nome || 'Sem cargo',
              funcao: colab.funcao || '',
              is_coordenador: isCoordenador,
              os_ativas: osDoColaborador,
              total_os: osDoColaborador.length,
              os_atrasadas: osAtrasadas
            } as ColaboradorWorkload;
          })
          // Ordenar: coordenadores primeiro, depois por nome
          .sort((a, b) => {
            if (a.is_coordenador && !b.is_coordenador) return -1;
            if (!a.is_coordenador && b.is_coordenador) return 1;
            return a.nome_completo.localeCompare(b.nome_completo);
          });

        const totalOs = colaboradoresDoSetor.reduce((sum, c) => sum + c.total_os, 0);

        return {
          id: setor.id,
          nome: setor.nome,
          slug: setor.slug,
          colaboradores: colaboradoresDoSetor,
          total_os: totalOs,
          total_colaboradores: colaboradoresDoSetor.length
        };
      });

      setSetores(result);
    } catch (err) {
      logger.error('[useSetorWorkload] Erro:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    setores,
    loading,
    error,
    refetch: fetchData
  };
}
