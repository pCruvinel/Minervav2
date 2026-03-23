/**
 * use-limpeza-dados.ts
 * 
 * KOD-78: Hook para limpeza de dados de teste.
 * Executa soft-delete via RPC `limpar_dados_teste`.
 * Suporta dry-run para preview antes de executar.
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

// =====================================================
// TYPES
// =====================================================

interface RegistroTeste {
  id: string;
  nome?: string;
  email?: string;
  cpf_cnpj?: string;
  telefone?: string;
}

interface ResultadoLimpeza {
  dry_run: boolean;
  tabelas: string[];
  timestamp: string;
  leads: RegistroTeste[];
  clientes: RegistroTeste[];
  colaboradores: RegistroTeste[];
  total_encontrados: number;
}

type TabelaLimpeza = 'leads' | 'clientes' | 'colaboradores';

// =====================================================
// HOOK
// =====================================================

export function useLimpezaDados() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoLimpeza | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Preview: mostra o que seria limpo sem executar
   */
  const preview = useCallback(async (tabelas: TabelaLimpeza[] = ['leads', 'clientes', 'colaboradores']) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('limpar_dados_teste', {
        p_dry_run: true,
        p_tabelas: tabelas,
      });

      if (rpcError) throw rpcError;

      const result = data as ResultadoLimpeza;
      setResultado(result);

      if (result.total_encontrados === 0) {
        toast.info('Nenhum dado de teste encontrado.');
      } else {
        toast.success(`${result.total_encontrados} registro(s) de teste encontrado(s).`);
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar dados de teste';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Executar: soft-delete dos dados identificados
   */
  const executar = useCallback(async (tabelas: TabelaLimpeza[] = ['leads', 'clientes', 'colaboradores']) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('limpar_dados_teste', {
        p_dry_run: false,
        p_tabelas: tabelas,
      });

      if (rpcError) throw rpcError;

      const result = data as ResultadoLimpeza;
      setResultado(result);

      toast.success(`Limpeza concluída: ${result.total_encontrados} registro(s) desativado(s).`);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao limpar dados de teste';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const limpar = useCallback(() => {
    setResultado(null);
    setError(null);
  }, []);

  return {
    loading,
    resultado,
    error,
    preview,
    executar,
    limpar,
  };
}
