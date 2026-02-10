
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

export interface CustoVariavelColaborador {
  id: string;
  colaborador_id: string;
  lancamento_bancario_id?: string;
  mes_referencia: string;
  tipo_custo: 'flutuante' | 'geral';
  descricao: string;
  valor: number;
  rateio_origem: boolean;
  total_colaboradores?: number;
  valor_original?: number;
  created_at: string;
  created_by?: string;
  colaborador?: {
    nome_completo: string;
  };
}

export interface CreateCustoVariavelParams {
  colaborador_id: string;
  lancamento_bancario_id?: string;
  mes_referencia: string;
  tipo_custo: 'flutuante' | 'geral';
  descricao: string;
  valor: number;
  rateio_origem?: boolean;
  total_colaboradores?: number;
  valor_original?: number;
}

export function useCustosVariaveisColaborador(colaboradorId?: string, mesReferencia?: string) {
  return useQuery({
    queryKey: ['custos-variaveis', colaboradorId, mesReferencia],
    queryFn: async (): Promise<CustoVariavelColaborador[]> => {
      let query = supabase
        .from('custos_variaveis_colaborador')
        .select(`
          *,
          colaborador:colaboradores(nome_completo)
        `)
        .order('created_at', { ascending: false });

      if (colaboradorId) {
        query = query.eq('colaborador_id', colaboradorId);
      }

      if (mesReferencia) {
        // Assume mesReferencia is YYYY-MM
        const startOfMonth = `${mesReferencia}-01`;
        // Calculate end of month roughly or use date_trunc in query if needed, 
        // but exact match on mes_referencia (which is DATE) is better if we store it as first day of month
        // Ideally mes_referencia in DB should be the first day of the month for simpler filtering
        // Let's filter by the exact date stored or range
        query = query.gte('mes_referencia', startOfMonth);
        // Add logic for end of month if necessary, typically we just filter by month equality
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!colaboradorId || !!mesReferencia,
  });
}

export function useCreateCustoVariavel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateCustoVariavelParams) => {
      const { data, error } = await supabase
        .from('custos_variaveis_colaborador')
        .insert(params)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custos-variaveis'] });
      queryClient.invalidateQueries({ queryKey: ['colaborador-detalhes'] }); // Hypothetical key for collaborator details
      toast.success('Custo variável registrado com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao registrar custo: ${error.message}`);
    },
  });
}

// Hook to get total consolidated cost (view)
export interface CustoTotalMensal {
  colaborador_id: string;
  nome_completo: string;
  mes: string;
  custo_fixo: number;
  custo_variavel: number;
  custo_total: number;
  custo_dia_calculado: number;
}

export interface UseCustoTotalMensalParams {
    colaboradorId?: string;
    mes?: string;
    startMonth?: string;
    endMonth?: string;
}

export function useCustoTotalMensal(params?: UseCustoTotalMensalParams) {
    return useQuery({
        queryKey: ['custo-total-mensal', params],
        queryFn: async (): Promise<CustoTotalMensal[]> => {
            let query = supabase
                .from('vw_custo_total_colaborador_mensal')
                .select('*')
                .order('mes', { ascending: false });

            if (params?.colaboradorId) {
                query = query.eq('colaborador_id', params.colaboradorId);
            }

            if (params?.mes) {
                query = query.eq('mes', `${params.mes}-01`);
            }

            if (params?.startMonth) {
                query = query.gte('mes', `${params.startMonth}-01`);
            }
            
            if (params?.endMonth) {
                query = query.lte('mes', `${params.endMonth}-01`);
            }

            const { data, error } = await query;
            
            if (error) throw error;
            return data || [];
        },
        enabled: !!params?.colaboradorId // At least collaborator needs to be known usually, or unrestricted fetch
    });
}

/**
 * Busca custos variáveis de colaborador por lançamento bancário ID
 * Usado no modal read-only para exibir detalhes de rateio MO
 */
export function useCustosVariaveisPorLancamento(lancamentoBancarioId?: string) {
  return useQuery({
    queryKey: ['custos-variaveis-lancamento', lancamentoBancarioId],
    queryFn: async (): Promise<CustoVariavelColaborador[]> => {
      if (!lancamentoBancarioId) return [];

      const { data, error } = await supabase
        .from('custos_variaveis_colaborador')
        .select(`
          *,
          colaborador:colaboradores(nome_completo)
        `)
        .eq('lancamento_bancario_id', lancamentoBancarioId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!lancamentoBancarioId,
    staleTime: 1000 * 60 * 5,
  });
}
