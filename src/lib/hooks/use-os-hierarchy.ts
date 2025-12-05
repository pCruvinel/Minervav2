/**
 * Hook para buscar hierarquia de uma Ordem de Serviço
 * 
 * Retorna:
 * - parent: OS origem (se existir)
 * - children: OSs derivadas desta OS
 * - rootLead: OS Lead raiz da árvore (se existir)
 * - isContract: Se a OS atual é um contrato (OS-12/OS-13)
 * - loading: Estado de carregamento
 * - error: Erro, se houver
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/utils/logger';

interface OSHierarchyData {
  id: string;
  codigo_os: string;
  status_geral: string;
  data_entrada: string;
  tipo_os_id: string;
  is_contract_active?: boolean;
  parent_os_id?: string;
  tipos_os?: {
    nome: string;
    codigo: string;
  };
  clientes?: {
    nome_razao_social: string;
  };
}

interface OSHierarchyResult {
  parent: OSHierarchyData | null;
  children: OSHierarchyData[];
  rootLead: OSHierarchyData | null;
  isContract: boolean;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

const OS_HIERARCHY_SELECT = `
  id,
  codigo_os,
  status_geral,
  data_entrada,
  tipo_os_id,
  is_contract_active,
  parent_os_id,
  tipos_os:tipo_os_id (
    nome,
    codigo
  ),
  clientes:cliente_id (
    nome_razao_social
  )
`;

export function useOSHierarchy(osId: string | undefined): OSHierarchyResult {
  const [parent, setParent] = useState<OSHierarchyData | null>(null);
  const [children, setChildren] = useState<OSHierarchyData[]>([]);
  const [rootLead, setRootLead] = useState<OSHierarchyData | null>(null);
  const [isContract, setIsContract] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHierarchy = useCallback(async () => {
    if (!osId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Buscar OS atual para obter parent_os_id e is_contract_active
      const { data: currentOS, error: currentError } = await supabase
        .from('ordens_servico')
        .select('parent_os_id, is_contract_active')
        .eq('id', osId)
        .single();

      if (currentError) throw currentError;

      setIsContract(currentOS?.is_contract_active || false);

      // 2. Buscar OS pai (se existir)
      if (currentOS?.parent_os_id) {
        const { data: parentOS, error: parentError } = await supabase
          .from('ordens_servico')
          .select(OS_HIERARCHY_SELECT)
          .eq('id', currentOS.parent_os_id)
          .single();

        if (parentError) {
          logger.error('Erro ao buscar OS pai:', parentError);
        } else {
          setParent(parentOS as unknown as OSHierarchyData);

          // 3. Se o pai tem parent_os_id, buscar o Lead raiz (recursivo até 3 níveis)
          if (parentOS?.parent_os_id) {
            const { data: grandparentOS } = await supabase
              .from('ordens_servico')
              .select(OS_HIERARCHY_SELECT)
              .eq('id', parentOS.parent_os_id)
              .single();

            if (grandparentOS) {
              setRootLead(grandparentOS as unknown as OSHierarchyData);
            }
          } else {
            // O pai é o Lead raiz
            setRootLead(parentOS as unknown as OSHierarchyData);
          }
        }
      }

      // 4. Buscar OSs filhas
      const { data: childrenOS, error: childrenError } = await supabase
        .from('ordens_servico')
        .select(OS_HIERARCHY_SELECT)
        .eq('parent_os_id', osId)
        .order('data_entrada', { ascending: false });

      if (childrenError) {
        logger.error('Erro ao buscar OSs filhas:', childrenError);
      } else {
        setChildren((childrenOS as unknown as OSHierarchyData[]) || []);
      }

    } catch (err) {
      const error = err as Error;
      logger.error('Erro ao buscar hierarquia da OS:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [osId]);

  useEffect(() => {
    fetchHierarchy();
  }, [fetchHierarchy]);

  return { parent, children, rootLead, isContract, loading, error, refetch: fetchHierarchy };
}
