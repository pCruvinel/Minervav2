/**
 * Hook para buscar hierarquia de uma Ordem de Serviço
 * 
 * Retorna:
 * - parent: OS origem (se existir)
 * - children: OSs derivadas desta OS
 * - loading: Estado de carregamento
 * - error: Erro, se houver
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import type { OrdemServico } from '@/lib/types';
import { logger } from '@/lib/utils/logger';

interface OSHierarchyResult {
  parent: OrdemServico | null;
  children: OrdemServico[];
  loading: boolean;
  error: Error | null;
}

export function useOSHierarchy(osId: string | undefined): OSHierarchyResult {
  const [parent, setParent] = useState<OrdemServico | null>(null);
  const [children, setChildren] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!osId) {
      setLoading(false);
      return;
    }

    async function fetchHierarchy() {
      try {
        setLoading(true);
        setError(null);

        // 1. Buscar OS atual para obter parent_os_id
        const { data: currentOS, error: currentError } = await supabase
          .from('ordens_servico')
          .select('parent_os_id')
          .eq('id', osId)
          .single();

        if (currentError) throw currentError;

        // 2. Buscar OS pai (se existir)
        if (currentOS?.parent_os_id) {
          const { data: parentOS, error: parentError } = await supabase
            .from('ordens_servico')
            .select(`
              id,
              codigo_os,
              status_geral,
              data_entrada,
              tipo_os_id,
              tipos_os:tipo_os_id (
                nome,
                codigo
              )
            `)
            .eq('id', currentOS.parent_os_id)
            .single();

          if (parentError) {
            logger.error('Erro ao buscar OS pai:', parentError);
          } else {
            setParent(parentOS as unknown as OrdemServico);
          }
        }

        // 3. Buscar OSs filhas
        const { data: childrenOS, error: childrenError } = await supabase
          .from('ordens_servico')
          .select(`
            id,
            codigo_os,
            status_geral,
            data_entrada,
            tipo_os_id,
            tipos_os:tipo_os_id (
              nome,
              codigo
            )
          `)
          .eq('parent_os_id', osId)
          .order('data_entrada', { ascending: false });

        if (childrenError) {
          logger.error('Erro ao buscar OSs filhas:', childrenError);
        } else {
          setChildren((childrenOS as unknown as OrdemServico[]) || []);
        }

      } catch (err) {
        const error = err as Error;
        logger.error('Erro ao buscar hierarquia da OS:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchHierarchy();
  }, [osId]);

  return { parent, children, loading, error };
}
