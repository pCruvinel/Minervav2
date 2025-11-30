/**
 * Hook para gerenciamento de Centros de Custo
 *
 * Integrado com função PL/pgSQL `gerar_centro_custo` para geração automática
 * com naming convention CC{NUMERO_TIPO_OS}{SEQUENCIAL}
 *
 * @example
 * ```tsx
 * const { generateCentroCusto, loading } = useCentroCusto();
 *
 * const cc = await generateCentroCusto(
 *   tipoOsId,
 *   clienteId,
 *   'Descrição opcional'
 * );
 * console.log(cc.nome); // CC1300001
 * ```
 */

import { supabase } from '@/lib/supabase-client';
import { useState } from 'react';
import { logger } from '@/lib/utils/logger';

export interface CentroCusto {
  id: string;
  nome: string;
}

export function useCentroCusto() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Gera um novo Centro de Custo automaticamente
   *
   * @param tipoOsId - ID do tipo de OS (ex: OS-13)
   * @param clienteId - ID do cliente
   * @param descricao - Descrição opcional do Centro de Custo
   * @returns Objeto com id e nome do Centro de Custo gerado
   * @throws Error se a geração falhar
   */
  const generateCentroCusto = async (
    tipoOsId: string,
    clienteId: string,
    descricao?: string
  ): Promise<CentroCusto> => {
    try {
      setLoading(true);
      setError(null);

      logger.log('🏗️ Gerando Centro de Custo...', {
        tipoOsId,
        clienteId,
        descricao
      });

      const { data, error: rpcError } = await supabase.rpc('gerar_centro_custo', {
        p_tipo_os_id: tipoOsId,
        p_cliente_id: clienteId,
        p_descricao: descricao || null
      });

      if (rpcError) {
        logger.error('❌ Erro ao gerar Centro de Custo:', rpcError);
        throw rpcError;
      }

      if (!data || data.length === 0) {
        throw new Error('Nenhum Centro de Custo foi gerado');
      }

      const centroCusto: CentroCusto = {
        id: data[0].cc_id,
        nome: data[0].cc_nome
      };

      logger.log('✅ Centro de Custo gerado com sucesso:', centroCusto);

      return centroCusto;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      logger.error('❌ Falha ao gerar Centro de Custo:', errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateCentroCusto,
    loading,
    error
  };
}
