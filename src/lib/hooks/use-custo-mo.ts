/**
 * use-custo-mo.ts
 * 
 * Hooks para consultar custos de mão de obra por Centro de Custo
 * usando a view view_custo_mo_detalhado_os.
 * 
 * @example
 * ```tsx
 * // Custo detalhado por OS
 * const { data: custos } = useCustoMODetalhado();
 * 
 * // Custo agrupado por CC
 * const { data: custoPorCC } = useCustoMOPorCC();
 * 
 * // Custo agrupado por colaborador
 * const { data: custoPorColaborador } = useCustoMOPorColaborador();
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';

// ============================================================
// TYPES
// ============================================================

export interface CustoMODetalhado {
  os_id: string;
  cc_id: string;
  cc_nome: string;
  colaborador_id: string;
  colaborador_nome: string;
  salario_base: number;
  data_trabalho: string;
  status_presenca: string;
  percentual_alocado: number;
  custo_alocado: number;
}

export interface CustoMOPorCC {
  cc_id: string;
  cc_nome: string;
  custo_total: number;
  alocacoes: number;
  colaboradores_distintos: number;
  percentual: number;
}

export interface CustoMOPorColaborador {
  colaborador_id: string;
  colaborador_nome: string;
  salario_base: number;
  custo_total: number;
  dias_trabalhados: number;
  ccs_distintos: number;
  ccs: string[];
}

// ============================================================
// HOOKS
// ============================================================

/**
 * Busca custo de MO detalhado por OS
 */
export function useCustoMODetalhado(options?: {
  osId?: string;
  ccId?: string;
  periodo?: { inicio: string; fim: string };
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['custo-mo-detalhado', options?.osId, options?.ccId, options?.periodo],
    queryFn: async (): Promise<CustoMODetalhado[]> => {
      let query = supabase
        .from('view_custo_mo_detalhado_os')
        .select('*');

      if (options?.osId) {
        query = query.eq('os_id', options.osId);
      }

      if (options?.ccId) {
        query = query.eq('cc_id', options.ccId);
      }

      if (options?.periodo) {
        query = query
          .gte('data_trabalho', options.periodo.inicio)
          .lte('data_trabalho', options.periodo.fim);
      }

      const { data, error } = await query.order('data_trabalho', { ascending: false });

      if (error) throw error;
      return (data ?? []) as CustoMODetalhado[];
    },
    enabled: options?.enabled !== false,
  });
}

/**
 * Busca custo de MO agrupado por Centro de Custo
 */
export function useCustoMOPorCC(options?: {
  periodo?: { inicio: string; fim: string };
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['custo-mo-por-cc', options?.periodo],
    queryFn: async (): Promise<CustoMOPorCC[]> => {
      let query = supabase
        .from('view_custo_mo_detalhado_os')
        .select('cc_id, cc_nome, custo_alocado, colaborador_id');

      if (options?.periodo) {
        query = query
          .gte('data_trabalho', options.periodo.inicio)
          .lte('data_trabalho', options.periodo.fim);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Agrupar por CC
      const grouped: Record<string, {
        cc_nome: string;
        total: number;
        count: number;
        colaboradores: Set<string>;
      }> = {};

      for (const item of data ?? []) {
        const key = item.cc_id || 'sem-cc';
        if (!grouped[key]) {
          grouped[key] = {
            cc_nome: item.cc_nome || 'Sem CC',
            total: 0,
            count: 0,
            colaboradores: new Set(),
          };
        }
        grouped[key].total += Number(item.custo_alocado || 0);
        grouped[key].count++;
        if (item.colaborador_id) {
          grouped[key].colaboradores.add(item.colaborador_id);
        }
      }

      // Calcular total para percentuais
      const totalGeral = Object.values(grouped).reduce((acc, v) => acc + v.total, 0);

      return Object.entries(grouped).map(([id, v]) => ({
        cc_id: id,
        cc_nome: v.cc_nome,
        custo_total: v.total,
        alocacoes: v.count,
        colaboradores_distintos: v.colaboradores.size,
        percentual: totalGeral > 0 ? Math.round((v.total / totalGeral) * 1000) / 10 : 0,
      })).sort((a, b) => b.custo_total - a.custo_total);
    },
    enabled: options?.enabled !== false,
  });
}

/**
 * Busca custo de MO agrupado por Colaborador
 */
export function useCustoMOPorColaborador(options?: {
  periodo?: { inicio: string; fim: string };
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['custo-mo-por-colaborador', options?.periodo],
    queryFn: async (): Promise<CustoMOPorColaborador[]> => {
      let query = supabase
        .from('view_custo_mo_detalhado_os')
        .select('colaborador_id, colaborador_nome, salario_base, custo_alocado, cc_nome, data_trabalho');

      if (options?.periodo) {
        query = query
          .gte('data_trabalho', options.periodo.inicio)
          .lte('data_trabalho', options.periodo.fim);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Agrupar por colaborador
      const grouped: Record<string, {
        nome: string;
        salario_base: number;
        total: number;
        datas: Set<string>;
        ccs: Set<string>;
      }> = {};

      for (const item of data ?? []) {
        const key = item.colaborador_id;
        if (!key) continue;
        
        if (!grouped[key]) {
          grouped[key] = {
            nome: item.colaborador_nome || 'Desconhecido',
            salario_base: Number(item.salario_base || 0),
            total: 0,
            datas: new Set(),
            ccs: new Set(),
          };
        }
        grouped[key].total += Number(item.custo_alocado || 0);
        if (item.data_trabalho) {
          grouped[key].datas.add(item.data_trabalho);
        }
        if (item.cc_nome) {
          grouped[key].ccs.add(item.cc_nome);
        }
      }

      return Object.entries(grouped).map(([id, v]) => ({
        colaborador_id: id,
        colaborador_nome: v.nome,
        salario_base: v.salario_base,
        custo_total: v.total,
        dias_trabalhados: v.datas.size,
        ccs_distintos: v.ccs.size,
        ccs: Array.from(v.ccs),
      })).sort((a, b) => b.custo_total - a.custo_total);
    },
    enabled: options?.enabled !== false,
  });
}

/**
 * Busca KPIs agregados de custo de MO
 */
export function useCustoMOKPIs(options?: {
  periodo?: { inicio: string; fim: string };
}) {
  const { data: custosPorCC } = useCustoMOPorCC(options);
  const { data: custosPorColaborador } = useCustoMOPorColaborador(options);

  const custoTotal = custosPorCC?.reduce((acc, c) => acc + c.custo_total, 0) ?? 0;
  const totalAlocacoes = custosPorCC?.reduce((acc, c) => acc + c.alocacoes, 0) ?? 0;
  const ccsAtivos = custosPorCC?.filter(c => c.cc_id !== 'sem-cc').length ?? 0;
  const colaboradoresAtivos = custosPorColaborador?.length ?? 0;
  const custoDiaMedio = totalAlocacoes > 0 ? custoTotal / totalAlocacoes : 0;

  return {
    custoTotal,
    custoDiaMedio: Math.round(custoDiaMedio * 100) / 100,
    totalAlocacoes,
    ccsAtivos,
    colaboradoresAtivos,
    custosPorCC,
    custosPorColaborador,
  };
}
