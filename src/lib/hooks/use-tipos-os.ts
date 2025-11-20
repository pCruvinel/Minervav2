/**
 * Hook para gerenciamento de tipos de OS
 * Integrado com backend Supabase via tiposOSAPI
 */

import { useState, useEffect } from 'react';
import { tiposOSAPI } from '../api-client';

export interface TipoOS {
  id: string;
  codigo: string;
  nome: string;
  setor_padrao: string;
  descricao?: string;
  ativo: boolean;
}

export function useTiposOS() {
  const [tiposOS, setTiposOS] = useState<TipoOS[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Carregando tipos de OS do backend...');

      // Chamar API real do backend
      const dados = await tiposOSAPI.list();

      console.log('✅ Tipos de OS carregados:', dados);
      setTiposOS(dados || []);
    } catch (err) {
      console.error('❌ Erro ao carregar tipos de OS:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setTiposOS([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { tiposOS, loading, error, refetch };
}
