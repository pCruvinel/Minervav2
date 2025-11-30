/**
 * Hook: useOS
 *
 * Hook para buscar dados de uma Ordem de Serviço específica
 * Inclui informações do tipo de OS e setor associado
 */

import { useApi } from './use-api';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';

// =====================================================
// TYPES
// =====================================================

export interface OS {
  id: string;
  codigo_os: string;
  titulo: string;
  descricao?: string;
  status_geral: string;
  tipo_os_id: string;
  cliente_id: string;
  criado_em: string;
  atualizado_em: string;
  tipo_os?: {
    id: string;
    nome: string;
    codigo: string;
    setor_id?: string;
    setor?: {
      id: string;
      nome: string;
      slug: string;
    };
  };
  cliente?: {
    id: string;
    nome_razao_social: string;
  };
}

// =====================================================
// API FUNCTIONS
// =====================================================

const osAPI = {
  /**
   * Buscar OS por ID com dados relacionados
   */
  async getById(osId: string): Promise<OS> {
    const { data, error } = await supabase
      .from('ordens_servico')
      .select(`
        *,
        tipo_os:tipo_os_id (
          id,
          nome,
          codigo,
          setor_id,
          setor:setor_id (
            id,
            nome,
            slug
          )
        ),
        cliente:cliente_id (
          id,
          nome_razao_social
        )
      `)
      .eq('id', osId)
      .single();

    if (error) {
      logger.error('Erro ao buscar OS:', error);
      throw error;
    }

    return data as OS;
  },
};

// =====================================================
// HOOKS
// =====================================================

/**
 * Hook para buscar uma OS específica
 *
 * @example
 * ```tsx
 * const { os, loading, error } = useOS(osId);
 * const setorSlug = os?.tipo_os?.setor?.slug;
 * ```
 */
export function useOS(osId: string) {
  const { data, loading, error, refetch } = useApi(
    () => osAPI.getById(osId),
    {
      deps: [osId],
      onError: (error) => {
        logger.error('❌ Erro ao carregar OS:', error);
        toast.error(`Erro ao carregar OS: ${error.message}`);
      },
    }
  );

  return {
    os: data,
    loading,
    error,
    refetch,
  };
}
