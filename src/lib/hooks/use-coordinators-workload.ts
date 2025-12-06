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

      // 2. Buscar todas as OSs ativas com responsável
      const { data: osAtivas, error: osError } = await supabase
        .from('ordens_servico')
        .select(`
          id,
          codigo_os,
          status_geral,
          data_prazo,
          data_entrada,
          responsavel_id,
          clientes!cliente_id(nome_razao_social),
          tipos_os!tipo_os_id(nome),
          os_etapas(
            nome_etapa,
            status,
            ordem
          )
        `)
        .not('status_geral', 'in', '("concluido","cancelado")')
        .order('data_entrada', { ascending: false });

      if (osError) throw osError;

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

      // 4. Distribuir OSs
      (osAtivas || []).forEach(os => {
        const respId = os.responsavel_id;
        if (!respId || !workloadMap[respId]) return;

        // Encontrar etapa atual (maior ordem não concluída)
        const etapas = os.os_etapas || [];
        const etapaAtual = etapas
          .filter((e: any) => e.status !== 'concluido')
          .sort((a: any, b: any) => a.ordem - b.ordem)[0];

        // Calcular prazo
        const prazoVencido = os.data_prazo ? new Date(os.data_prazo) < hoje : false;

        // Calcular progresso baseado nas etapas
        const totalEtapas = etapas.length;
        const etapasConcluidas = etapas.filter((e: any) => e.status === 'concluido').length;
        const progresso = totalEtapas > 0 ? Math.round((etapasConcluidas / totalEtapas) * 100) : 0;

        const workloadOS: WorkloadOS = {
          id: os.id,
          codigo_os: os.codigo_os,
          cliente_nome: os.clientes?.nome_razao_social || 'Cliente não informado',
          tipo_os_nome: os.tipos_os?.nome || 'Tipo não informado',
          status_geral: os.status_geral,
          data_prazo: os.data_prazo,
          data_entrada: os.data_entrada,
          etapa_atual: etapaAtual ? {
            nome: etapaAtual.nome_etapa,
            status: etapaAtual.status
          } : null,
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
