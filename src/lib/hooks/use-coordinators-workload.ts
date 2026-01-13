/**
 * Hook: useCoordinatorsWorkload
 * 
 * Retorna a carga de trabalho de cada coordenador:
 * - Lista de OSs agrupadas por coordenador responsável
 * - Dados de prazo e progresso para cada OS
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';

// ============================================================
// TIPOS
// ============================================================

export interface WorkloadOS {
  id: string;
  codigo_os: string;
  cliente_nome: string;
  tipo_os_nome: string;
  status_geral: string;
  status_situacao: string;
  data_prazo: string | null;
  data_entrada: string;
  etapa_atual: {
    nome: string;
    status: string;
  } | null;
  prazoVencido: boolean;
  progresso: number; // 0-100
}

export interface CoordinatorWorkload {
  coordenador_id: string;
  coordenador_nome: string;
  cargo_slug: string;
  setor_nome: string;
  avatar_url?: string;
  os_ativas: WorkloadOS[];
  total: number;
  atrasadas: number;
}

interface UseCoordinatorsWorkloadReturn {
  workloads: CoordinatorWorkload[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// ============================================================
// COORDENADORES ALVO
// ============================================================

const COORDINATOR_SLUGS = ['coord_obras', 'coord_assessoria', 'coord_administrativo'];

// ============================================================
// HOOK
// ============================================================

export function useCoordinatorsWorkload(): UseCoordinatorsWorkloadReturn {
  const [workloads, setWorkloads] = useState<CoordinatorWorkload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWorkloads = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Buscar coordenadores
      const { data: coordenadores, error: coordError } = await supabase
        .from('colaboradores')
        .select(`
          id,
          nome_completo,
          avatar_url,
          cargo_id,
          cargos!inner(slug, nome),
          setor_id,
          setores!inner(nome)
        `)
        .in('cargos.slug', COORDINATOR_SLUGS)
        .eq('ativo', true);

      if (coordError) throw coordError;

      // 2. Buscar todas as OSs ativas usando a view os_detalhes_completos (mesma fonte da página de detalhes)
      const { data: osAtivas, error: osError } = await supabase
        .from('os_detalhes_completos')
        .select('*')
        .not('status_geral', 'in', '("concluido","cancelado")')
        .order('data_entrada', { ascending: false });

      if (osError) {
        // Se a view não existe, lançar erro (será tratado no catch)
        throw new Error(`Erro ao buscar OSs: ${osError.message}. A view os_detalhes_completos pode não estar disponível.`);
      }

      // 3. Buscar etapas atuais de todas as OSs ativas
      const osIds = (osAtivas || []).map((os: any) => os.id);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let etapasMap: Record<string, { nome: string; status: string }> = {};

      if (osIds.length > 0) {
        const { data: etapasData, error: etapasError } = await supabase
          .from('os_etapas')
          .select('os_id, nome_etapa, status, ordem')
          .in('os_id', osIds)
          .order('ordem', { ascending: true });

        if (!etapasError && etapasData) {
          // Para cada OS, encontrar a primeira etapa pendente ou em_andamento
          const etapasPorOS: Record<string, typeof etapasData> = {};
          etapasData.forEach((etapa) => {
            if (!etapasPorOS[etapa.os_id]) {
              etapasPorOS[etapa.os_id] = [];
            }
            etapasPorOS[etapa.os_id].push(etapa);
          });

          // Encontrar etapa atual para cada OS (primeira não concluída)
          Object.entries(etapasPorOS).forEach(([osId, etapas]) => {
            const etapaAtual = etapas.find(
              (e) => e.status === 'pendente' || e.status === 'em_andamento'
            );
            if (etapaAtual) {
              etapasMap[osId] = {
                nome: etapaAtual.nome_etapa,
                status: etapaAtual.status
              };
            }
          });
        }
      }

      // 4. Buscar status_situacao (não está na view os_detalhes_completos)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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


      const hoje = new Date();

      // 3. Agrupar OSs por coordenador
      const workloadMap: Record<string, CoordinatorWorkload> = {};

      (coordenadores || []).forEach(coord => {
        workloadMap[coord.id] = {
          coordenador_id: coord.id,
          coordenador_nome: coord.nome_completo,
          cargo_slug: coord.cargos?.slug || '',
          setor_nome: coord.setores?.nome || 'Sem Setor',
          avatar_url: coord.avatar_url,
          os_ativas: [],
          total: 0,
          atrasadas: 0
        };
      });

      // 4. Distribuir OSs (dados vêm da view os_detalhes_completos)
      (osAtivas || []).forEach((os: any) => {
        const respId = os.responsavel_id;
        if (!respId || !workloadMap[respId]) return;

        // Calcular prazo
        const prazoVencido = os.data_prazo ? new Date(os.data_prazo) < hoje : false;

        // Progresso vem da view: etapas_concluidas_count / etapas_total_count
        const totalEtapas = os.etapas_total_count || 0;
        const etapasConcluidas = os.etapas_concluidas_count || 0;
        const progresso = totalEtapas > 0
          ? Math.round((etapasConcluidas / totalEtapas) * 100)
          : 0;

        // Etapa atual vem do mapa de etapas (buscado separadamente)
        const etapaAtual = etapasMap[os.id] || null;

        const workloadOS: WorkloadOS = {
          id: os.id,
          codigo_os: os.codigo_os,
          cliente_nome: os.cliente_nome || 'Cliente não informado',
          tipo_os_nome: os.tipo_os_nome || 'Tipo não informado',
          status_geral: os.status_geral,
          status_situacao: statusSituacaoMap[os.id] || 'acao_pendente',
          data_prazo: os.data_prazo,
          data_entrada: os.data_entrada,
          etapa_atual: etapaAtual,
          prazoVencido,
          progresso
        };

        workloadMap[respId].os_ativas.push(workloadOS);
        workloadMap[respId].total++;
        if (prazoVencido) workloadMap[respId].atrasadas++;
      });

      // 5. Converter para array e ordenar por total
      const result = Object.values(workloadMap)
        .sort((a, b) => b.total - a.total);

      setWorkloads(result);
    } catch (err) {
      console.error('[useCoordinatorsWorkload] Erro:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkloads();
  }, []);

  return {
    workloads,
    loading,
    error,
    refetch: fetchWorkloads
  };
}
