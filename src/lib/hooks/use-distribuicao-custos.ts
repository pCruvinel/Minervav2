/**
 * Hook para consultar a distribuição de custos departamentais
 * 
 * Consulta a view `vw_distribuicao_custos_departamentais` que calcula:
 * Custo_distribuído(cliente) = ((Custo_Escritório / 2) + Custo_do_Setor) / Qtd_Clientes_Ativos_no_Setor
 *
 * @example
 * ```tsx
 * const { data, loading } = useDistribuicaoCustos();
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/utils/logger';

export interface DistribuicaoCusto {
  setor_id: string;
  setor_nome: string;
  periodo: string;
  custo_escritorio: number;
  metade_escritorio: number;
  custo_setor: number;
  qtd_clientes_ativos: number;
  custo_distribuido_por_cliente: number;
}

export function useDistribuicaoCustos() {
  const [data, setData] = useState<DistribuicaoCusto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDistribuicao = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: rows, error: queryError } = await supabase
        .from('vw_distribuicao_custos_departamentais')
        .select('*')
        .order('periodo', { ascending: false });

      if (queryError) {
        throw new Error(`Erro ao buscar distribuição: ${queryError.message}`);
      }

      setData((rows || []) as DistribuicaoCusto[]);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      logger.error('❌ Erro ao buscar distribuição de custos:', errorObj);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDistribuicao();
  }, [fetchDistribuicao]);

  return {
    data,
    loading,
    error,
    refetch: fetchDistribuicao
  };
}
