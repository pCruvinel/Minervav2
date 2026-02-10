/**
 * use-lucratividade-cc.ts
 * 
 * Hooks para consultar lucratividade por Centro de Custo e por Cliente
 * usando as views criadas no módulo financeiro.
 * 
 * @example
 * ```tsx
 * // Lucratividade de todas as OS
 * const { data: resumos } = useLucratividadeOS();
 * 
 * // Lucratividade de um CC específico
 * const { data: resumo } = useLucratividadeCC(ccId);
 * 
 * // Ranking de clientes por margem
 * const { data: clientes } = useLucratividadeCliente();
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';

// ============================================================
// TYPES
// ============================================================

export interface FinanceiroOSResumo {
  os_id: string;
  os_numero: string;
  titulo: string;
  os_status: string;
  cliente_nome: string;
  cc_id: string | null;
  cc_nome: string | null;
  receita_prevista: number;
  receita_realizada: number;
  receita_em_atraso: number;
  parcelas_recebidas: number;
  total_parcelas: number;
  despesa_operacional_total: number;
  despesa_operacional_paga: number;
  despesa_operacional_a_pagar: number;
  custo_mo_total: number;
  colaboradores_alocados: number;
  total_alocacoes_presenca: number;
  custo_total: number;
  lucro_bruto_previsto: number;
  lucro_bruto_realizado: number;
  margem_prevista_pct: number;
  margem_realizada_pct: number;
}

export interface FinanceiroClienteResumo {
  cliente_id: string;
  cliente_nome: string;
  cliente_tipo: string;
  total_os: number;
  os_concluidas: number;
  os_ativas: number;
  receita_total_prevista: number;
  receita_total_realizada: number;
  custo_total: number;
  lucro_total_previsto: number;
  lucro_total_realizado: number;
  margem_media_pct: number;
}

// ============================================================
// HOOKS
// ============================================================

export interface LucratividadeCC {
  cc_id: string;
  nome: string;
  contrato_global: number;
  
  receita_prevista: number;
  receita_realizada: number;
  
  custo_op_previsto: number;
  custo_op_realizado: number;
  
  custo_mo_total: number;
  custo_overhead_total: number;
  
  custo_total_previsto: number;
  custo_total_realizado: number;
  
  lucro_previsto: number;
  lucro_realizado: number;
  
  margem_realizada_pct: number;
}

// ... existing FinanceiroOSResumo or keep it if used by other hooks ...

/**
 * Busca resumo financeiro de todas as OS
 */
export function useLucratividadeOS(options?: {
  clienteId?: string;
  status?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['lucratividade-os', options?.clienteId, options?.status],
    queryFn: async (): Promise<FinanceiroOSResumo[]> => {
      let query = supabase
        .from('view_financeiro_os_resumo')
        .select('*');

      if (options?.status) {
        query = query.eq('os_status', options.status);
      }

      const { data, error } = await query.order('lucro_bruto_previsto', { ascending: false });

      if (error) throw error;
      return (data ?? []) as FinanceiroOSResumo[];
    },
    enabled: options?.enabled !== false,
  });
}

/**
 * Busca resumo financeiro de um Centro de Custo específico
 * Usa a nova view vw_lucratividade_cc
 */
export function useLucratividadeCC(ccId: string | undefined | null) {
  return useQuery({
    queryKey: ['lucratividade-cc-v2', ccId],
    queryFn: async (): Promise<LucratividadeCC | null> => {
      if (!ccId) return null;

      const { data, error } = await supabase
        .from('vw_lucratividade_cc')
        .select('*')
        .eq('cc_id', ccId)
        .maybeSingle();

      if (error) throw error;
      return data as LucratividadeCC | null;
    },
    enabled: !!ccId,
  });
}

/**
 * Busca resumo financeiro agregado por cliente
 */
export function useLucratividadeCliente(options?: {
  minOS?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['lucratividade-cliente', options?.minOS],
    queryFn: async (): Promise<FinanceiroClienteResumo[]> => {
      let query = supabase
        .from('view_financeiro_cliente_resumo')
        .select('*');

      if (options?.minOS) {
        query = query.gte('total_os', options.minOS);
      }

      const { data, error } = await query.order('margem_media_pct', { ascending: false });

      if (error) throw error;
      return (data ?? []) as FinanceiroClienteResumo[];
    },
    enabled: options?.enabled !== false,
  });
}

/**
 * Busca KPIs agregados de lucratividade
 */
export function useLucratividadeKPIs() {
  return useQuery({
    queryKey: ['lucratividade-kpis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('view_financeiro_os_resumo')
        .select('*');

      if (error) throw error;
      
      const resumos = (data ?? []) as FinanceiroOSResumo[];

      // Calcular KPIs agregados
      const totalReceita = resumos.reduce((acc, r) => acc + Number(r.receita_prevista || 0), 0);
      const totalCusto = resumos.reduce((acc, r) => acc + Number(r.custo_total || 0), 0);
      const totalLucro = resumos.reduce((acc, r) => acc + Number(r.lucro_bruto_previsto || 0), 0);
      const margemMedia = totalReceita > 0 ? (totalLucro / totalReceita) * 100 : 0;

      const osComLucro = resumos.filter(r => Number(r.lucro_bruto_previsto) > 0).length;
      const osComPrejuizo = resumos.filter(r => Number(r.lucro_bruto_previsto) < 0).length;

      return {
        totalOS: resumos.length,
        totalReceita,
        totalCusto,
        totalLucro,
        margemMedia: Math.round(margemMedia * 100) / 100,
        osComLucro,
        osComPrejuizo,
      };
    },
  });
}
