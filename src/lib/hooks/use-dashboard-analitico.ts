/**
 * use-dashboard-analitico.ts
 * 
 * Hooks para o Dashboard Analítico Financeiro com suporte a:
 * - Filtros de período (date range)
 * - Segmentação por setor (ASS, OBRAS, ADM)
 * - Evolução temporal (mensal)
 * - Análise por Centro de Custo
 * 
 * @example
 * ```tsx
 * const { data: kpis } = useDashboardAnaliticoKPIs({ periodo: { inicio: '2026-01-01', fim: '2026-01-31' } });
 * const { data: evolucao } = useEvolucaoMensal({ meses: 12 });
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';

// ============================================================
// TYPES
// ============================================================

export interface PeriodoFiltro {
  inicio: string; // YYYY-MM-DD
  fim: string;    // YYYY-MM-DD
}

export type SetorFiltro = 'TODOS' | 'ASS' | 'OBRAS' | 'ADM';

export interface DashboardAnaliticoFilters {
  periodo?: PeriodoFiltro;
  setor?: SetorFiltro;
}

export interface KPIsPorSetor {
  setor: string;
  receita_prevista: number;
  receita_realizada: number;
  custo_operacional: number;
  custo_operacional_pago: number;
  custo_mo: number;
  custo_total: number;
  lucro_realizado: number;
  margem_pct: number;
}

export interface EvolucoMensal {
  mes: string;
  mes_label: string;
  receita_ass: number;
  receita_obras: number;
  receita_total: number;
  custo_ass: number;
  custo_obras: number;
  custo_total: number;
  lucro_ass: number;
  lucro_obras: number;
  lucro_total: number;
}

export interface CustoPorCategoria {
  categoria_id: string;
  categoria_nome: string;
  codigo_plano: string;
  nome_plano: string;
  setor: string;
  valor_total: number;
  valor_pago: number;
  total_lancamentos: number;
}

export interface AnaliseCentroCusto {
  cc_id: string;
  cc_nome: string;
  setor: string;
  cliente_nome: string | null;
  receita: number;
  custo: number;
  lucro: number;
  margem_pct: number;
  status_os: string | null;
  cc_ativo: boolean;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getMonthBounds(date: Date = new Date()) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    inicio: firstDay.toISOString().split('T')[0],
    fim: lastDay.toISOString().split('T')[0],
  };
}

function getLastMonthBounds() {
  const hoje = new Date();
  const firstDay = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
  const lastDay = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
  return {
    inicio: firstDay.toISOString().split('T')[0],
    fim: lastDay.toISOString().split('T')[0],
  };
}

export function getPeriodoPreset(preset: 'thisMonth' | 'lastMonth' | 'lastQuarter' | 'thisYear' | 'last6Months'): PeriodoFiltro {
  const hoje = new Date();
  
  switch (preset) {
    case 'thisMonth':
      return getMonthBounds(hoje);
    case 'lastMonth':
      return getLastMonthBounds();
    case 'lastQuarter': {
      const quarterStart = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
      const quarterEnd = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
      return {
        inicio: quarterStart.toISOString().split('T')[0],
        fim: quarterEnd.toISOString().split('T')[0],
      };
    }
    case 'thisYear':
      return {
        inicio: `${hoje.getFullYear()}-01-01`,
        fim: hoje.toISOString().split('T')[0],
      };
    case 'last6Months': {
      const sixMonthsAgo = new Date(hoje.getFullYear(), hoje.getMonth() - 6, 1);
      return {
        inicio: sixMonthsAgo.toISOString().split('T')[0],
        fim: hoje.toISOString().split('T')[0],
      };
    }
  }
}

// ============================================================
// HOOKS
// ============================================================

/**
 * Hook principal: KPIs consolidados por setor
 */
export function useDashboardAnaliticoKPIs(filters?: DashboardAnaliticoFilters) {
  const periodo = filters?.periodo ?? getMonthBounds();
  
  return useQuery({
    queryKey: ['dashboard-analitico-kpis', periodo.inicio, periodo.fim, filters?.setor],
    queryFn: async (): Promise<KPIsPorSetor[]> => {
      // Query receitas do período
      const { data: receitas, error: errReceitas } = await supabase
        .from('vw_receitas_por_setor')
        .select('*')
        .gte('mes', periodo.inicio)
        .lte('mes', periodo.fim);
        
      if (errReceitas) throw errReceitas;

      // Query despesas do período
      const { data: despesas, error: errDespesas } = await supabase
        .from('vw_despesas_por_setor')
        .select('*')
        .gte('mes', periodo.inicio)
        .lte('mes', periodo.fim);
        
      if (errDespesas) throw errDespesas;

      // Agregar por setor
      const setores: Record<string, KPIsPorSetor> = {};
      
      // Inicializar setores
      ['ASS', 'OBRAS', 'ADM'].forEach(setor => {
        setores[setor] = {
          setor,
          receita_prevista: 0,
          receita_realizada: 0,
          custo_operacional: 0,
          custo_operacional_pago: 0,
          custo_mo: 0,
          custo_total: 0,
          lucro_realizado: 0,
          margem_pct: 0,
        };
      });

      // Somar receitas
      receitas?.forEach((r) => {
        const setor = r.setor || 'ADM';
        if (setores[setor]) {
          setores[setor].receita_prevista += Number(r.receita_prevista || 0);
          setores[setor].receita_realizada += Number(r.receita_realizada || 0);
        }
      });

      // Somar despesas
      despesas?.forEach((d) => {
        const setor = d.setor || 'ADM';
        if (setores[setor]) {
          setores[setor].custo_operacional += Number(d.despesa_total || 0);
          setores[setor].custo_operacional_pago += Number(d.despesa_paga || 0);
        }
      });

      // Calcular métricas derivadas
      Object.values(setores).forEach(s => {
        s.custo_total = s.custo_operacional + s.custo_mo;
        s.lucro_realizado = s.receita_realizada - s.custo_operacional_pago - s.custo_mo;
        s.margem_pct = s.receita_realizada > 0 
          ? Math.round((s.lucro_realizado / s.receita_realizada) * 1000) / 10
          : 0;
      });

      // Filtrar por setor se especificado
      let resultado = Object.values(setores);
      if (filters?.setor && filters.setor !== 'TODOS') {
        resultado = resultado.filter(s => s.setor === filters.setor);
      }

      return resultado;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para evolução mensal (últimos N meses)
 */
export function useEvolucaoMensal(meses: number = 12) {
  return useQuery({
    queryKey: ['evolucao-mensal', meses],
    queryFn: async (): Promise<EvolucoMensal[]> => {
      const hoje = new Date();
      const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - meses + 1, 1);
      
      // Query receitas
      const { data: receitas } = await supabase
        .from('vw_receitas_por_setor')
        .select('setor, mes, receita_realizada')
        .gte('mes', dataInicio.toISOString().split('T')[0])
        .order('mes', { ascending: true });

      // Query despesas
      const { data: despesas } = await supabase
        .from('vw_despesas_por_setor')
        .select('setor, mes, despesa_paga')
        .gte('mes', dataInicio.toISOString().split('T')[0])
        .order('mes', { ascending: true });

      // Agregar por mês
      const evolucaoPorMes: Record<string, EvolucoMensal> = {};
      
      // Inicializar todos os meses
      for (let i = 0; i < meses; i++) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - meses + 1 + i, 1);
        const mesKey = data.toISOString().slice(0, 7);
        const mesLabel = data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
        
        evolucaoPorMes[mesKey] = {
          mes: mesKey,
          mes_label: mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1),
          receita_ass: 0,
          receita_obras: 0,
          receita_total: 0,
          custo_ass: 0,
          custo_obras: 0,
          custo_total: 0,
          lucro_ass: 0,
          lucro_obras: 0,
          lucro_total: 0,
        };
      }

      // Somar receitas
      receitas?.forEach((r) => {
        const mesKey = r.mes?.slice(0, 7);
        if (evolucaoPorMes[mesKey]) {
          const valor = Number(r.receita_realizada || 0);
          if (r.setor === 'ASS') {
            evolucaoPorMes[mesKey].receita_ass += valor;
          } else if (r.setor === 'OBRAS') {
            evolucaoPorMes[mesKey].receita_obras += valor;
          }
          evolucaoPorMes[mesKey].receita_total += valor;
        }
      });

      // Somar despesas
      despesas?.forEach((d) => {
        const mesKey = d.mes?.slice(0, 7);
        if (evolucaoPorMes[mesKey]) {
          const valor = Number(d.despesa_paga || 0);
          if (d.setor === 'ASS') {
            evolucaoPorMes[mesKey].custo_ass += valor;
          } else if (d.setor === 'OBRAS') {
            evolucaoPorMes[mesKey].custo_obras += valor;
          }
          evolucaoPorMes[mesKey].custo_total += valor;
        }
      });

      // Calcular lucros
      Object.values(evolucaoPorMes).forEach(e => {
        e.lucro_ass = e.receita_ass - e.custo_ass;
        e.lucro_obras = e.receita_obras - e.custo_obras;
        e.lucro_total = e.receita_total - e.custo_total;
      });

      return Object.values(evolucaoPorMes);
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para custos agrupados por categoria
 */
export function useCustosPorCategoria(filters?: DashboardAnaliticoFilters) {
  const periodo = filters?.periodo ?? getLastMonthBounds(); // Default: mês anterior consolidado
  
  return useQuery({
    queryKey: ['custos-por-categoria', periodo.inicio, periodo.fim, filters?.setor],
    queryFn: async (): Promise<CustoPorCategoria[]> => {
      let query = supabase
        .from('vw_custos_por_categoria')
        .select('*')
        .gte('mes', periodo.inicio)
        .lte('mes', periodo.fim);

      if (filters?.setor && filters.setor !== 'TODOS') {
        query = query.eq('setor', filters.setor);
      }

      const { data, error } = await query.order('valor_total', { ascending: false });
      
      if (error) throw error;
      
      // Agregar por categoria (já que pode ter múltiplos meses)
      const agrupado: Record<string, CustoPorCategoria> = {};
      
      data?.forEach((item) => {
        const key = `${item.categoria_id}-${item.setor}`;
        if (!agrupado[key]) {
          agrupado[key] = {
            categoria_id: item.categoria_id,
            categoria_nome: item.categoria_nome,
            codigo_plano: item.codigo_plano,
            nome_plano: item.nome_plano,
            setor: item.setor,
            valor_total: 0,
            valor_pago: 0,
            total_lancamentos: 0,
          };
        }
        agrupado[key].valor_total += Number(item.valor_total || 0);
        agrupado[key].valor_pago += Number(item.valor_pago || 0);
        agrupado[key].total_lancamentos += Number(item.total_lancamentos || 0);
      });

      return Object.values(agrupado).sort((a, b) => b.valor_total - a.valor_total);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para análise por Centro de Custo
 */
export function useAnaliseCentroCusto(filters?: DashboardAnaliticoFilters) {
  return useQuery({
    queryKey: ['analise-centro-custo', filters?.setor],
    queryFn: async (): Promise<AnaliseCentroCusto[]> => {
      let query = supabase
        .from('vw_analise_centro_custo')
        .select('*');

      if (filters?.setor && filters.setor !== 'TODOS') {
        query = query.eq('setor', filters.setor);
      }

      const { data, error } = await query.order('lucro', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        cc_id: item.cc_id,
        cc_nome: item.cc_nome,
        setor: item.setor,
        cliente_nome: item.cliente_nome,
        receita: Number(item.receita || 0),
        custo: Number(item.custo || 0),
        lucro: Number(item.lucro || 0),
        margem_pct: Number(item.margem_pct || 0),
        status_os: item.status_os,
        cc_ativo: item.cc_ativo,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para totais consolidados (resumo geral)
 */
export function useTotaisConsolidados(filters?: DashboardAnaliticoFilters) {
  const { data: kpis, isLoading } = useDashboardAnaliticoKPIs(filters);
  
  if (isLoading || !kpis) {
    return {
      data: null,
      isLoading,
    };
  }

  const totais = kpis.reduce(
    (acc, setor) => ({
      receita_prevista: acc.receita_prevista + setor.receita_prevista,
      receita_realizada: acc.receita_realizada + setor.receita_realizada,
      custo_total: acc.custo_total + setor.custo_total,
      custo_pago: acc.custo_pago + setor.custo_operacional_pago + setor.custo_mo,
      lucro_realizado: acc.lucro_realizado + setor.lucro_realizado,
    }),
    { receita_prevista: 0, receita_realizada: 0, custo_total: 0, custo_pago: 0, lucro_realizado: 0 }
  );

  const margem_pct = totais.receita_realizada > 0
    ? Math.round((totais.lucro_realizado / totais.receita_realizada) * 1000) / 10
    : 0;

  return {
    data: { ...totais, margem_pct },
    isLoading: false,
  };
}
