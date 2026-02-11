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
 * Para CLT: (salario_base * 1.46) / dias_uteis_mes
 * Para PJ/outros: custo_dia manual
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
