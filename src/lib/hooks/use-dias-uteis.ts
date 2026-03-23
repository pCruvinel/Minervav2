/**
 * use-dias-uteis.ts
 *
 * Hook para consultar a quantidade de dias úteis de um mês,
 * usando a RPC `contar_dias_uteis_mes` que considera feriados
 * e bloqueios de calendário.
 *
 * @example
 * ```tsx
 * const { data: diasUteis } = useDiasUteisMes(2026, 2);
 * // diasUteis = 20
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';

/**
 * Retorna a quantidade de dias úteis de um mês/ano,
 * descontando fins de semana e feriados/bloqueios.
 */
export function useDiasUteisMes(ano: number, mes: number, enabled = true) {
  return useQuery({
    queryKey: ['dias-uteis', ano, mes],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc('contar_dias_uteis_mes', {
        p_ano: ano,
        p_mes: mes,
      });

      if (error) throw error;
      return (data as number) || 22; // fallback
    },
    enabled,
    staleTime: 1000 * 60 * 60 * 24, // 24h - dias úteis raramente mudam
  });
}

/**
 * Retorna o custo/dia calculado dinamicamente via RPC.
 * Para CLT: (salario_base * fator_encargos) / dias_uteis_mes
 * Para PJ/outros: custo_dia manual
 * 
 * Agora usa configuracoes_rh para fator de encargos e dias úteis (KOD-77)
 */
export function useCustoDia(
  salarioBase: number,
  tipoContratacao: string,
  custoDiaManual: number | null | undefined,
  ano: number,
  mes: number,
  enabled = true
) {
  return useQuery({
    queryKey: ['custo-dia', salarioBase, tipoContratacao, custoDiaManual, ano, mes],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc('calcular_custo_dia', {
        p_salario_base: salarioBase,
        p_tipo_contratacao: tipoContratacao,
        p_custo_dia_manual: custoDiaManual ?? 0,
        p_ano: ano,
        p_mes: mes,
      });

      if (error) throw error;
      return Number(data) || 0;
    },
    enabled,
    staleTime: 1000 * 60 * 60 * 24, // 24h
  });
}

// =====================================================
// KOD-77: Config dias úteis/mês (override manual do RH)
// =====================================================

interface ConfigRH {
  dias_uteis_mes: number;
  percentual_encargos_clt: number;
  valor_beneficio_padrao: number;
}

/**
 * Retorna as configurações de RH (dias úteis, encargos, benefícios).
 * Permite leitura e atualização do dias_uteis_mes.
 */
export function useConfiguracoesRH() {
  const query = useQuery({
    queryKey: ['configuracoes-rh'],
    queryFn: async (): Promise<ConfigRH> => {
      const { data, error } = await supabase
        .from('configuracoes_rh')
        .select('chave, valor');

      if (error) throw error;

      const configs: Record<string, string> = {};
      (data || []).forEach((c: { chave: string; valor: string }) => {
        configs[c.chave] = c.valor;
      });

      return {
        dias_uteis_mes: parseInt(configs.dias_uteis_mes || '22', 10),
        percentual_encargos_clt: parseFloat(configs.percentual_encargos_clt || '46'),
        valor_beneficio_padrao: parseFloat(configs.valor_beneficio_padrao || '450'),
      };
    },
    staleTime: 1000 * 60 * 60, // 1h
  });

  /**
   * Atualiza uma configuração de RH
   */
  const atualizarConfig = async (chave: string, valor: string) => {
    const { error } = await supabase
      .from('configuracoes_rh')
      .update({ valor, updated_at: new Date().toISOString() })
      .eq('chave', chave);

    if (error) throw error;
  };

  return {
    config: query.data,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    atualizarConfig,
  };
}
