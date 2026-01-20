/**
 * use-financeiro-dashboard.ts
 * 
 * Hooks para o dashboard financeiro, agregando dados de contas_receber,
 * contas_pagar e views de lucratividade.
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useFinanceiroDashboard();
 * // data.previsaoReceitaMes, data.previsaoFaturasMes, etc.
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';

// ============================================================
// TYPES
// ============================================================

export interface DashboardKPIs {
  previsaoReceitaMes: number;
  receitaRealizadaMes: number;
  previsaoFaturasMes: number;
  faturasPagasMes: number;
  aReceberHoje: number;
  aPagarHoje: number;
  lucroMes: number;
  margemMes: number;
  totalClientesAtivos: number;
  totalOSAtivas: number;
}

export interface ComparacaoMensal {
  mes: string;
  previsto: number;
  realizado: number;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getMonthBounds(date: Date = new Date()) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    firstDayOfMonth: firstDay.toISOString().split('T')[0],
    lastDayOfMonth: lastDay.toISOString().split('T')[0],
  };
}

function formatToday() {
  return new Date().toISOString().split('T')[0];
}

// ============================================================
// HOOKS
// ============================================================

/**
 * Hook principal do dashboard financeiro
 */
export function useFinanceiroDashboard() {
  return useQuery({
    queryKey: ['financeiro-dashboard'],
    queryFn: async (): Promise<DashboardKPIs> => {
      const { firstDayOfMonth, lastDayOfMonth } = getMonthBounds();
      const today = formatToday();

      // Query 1: Receitas do mês
      const { data: receitasMes, error: errReceitas } = await supabase
        .from('contas_receber')
        .select('valor_previsto, valor_recebido, status')
        .gte('vencimento', firstDayOfMonth)
        .lte('vencimento', lastDayOfMonth);

      if (errReceitas) throw errReceitas;

      // Query 2: Despesas do mês
      const { data: despesasMes, error: errDespesas } = await supabase
        .from('contas_pagar')
        .select('valor, status')
        .gte('vencimento', firstDayOfMonth)
        .lte('vencimento', lastDayOfMonth);

      if (errDespesas) throw errDespesas;

      // Query 3: A receber hoje
      const { data: receitasHoje, error: errHoje } = await supabase
        .from('contas_receber')
        .select('valor_previsto')
        .eq('vencimento', today)
        .in('status', ['em_aberto', 'pendente']);

      if (errHoje) throw errHoje;

      // Query 4: A pagar hoje
      const { data: despesasHoje, error: errPagarHoje } = await supabase
        .from('contas_pagar')
        .select('valor')
        .eq('vencimento', today)
        .in('status', ['em_aberto', 'pendente']);

      if (errPagarHoje) throw errPagarHoje;

      // Query 5: Clientes ativos
      const { count: totalClientes, error: errClientes } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .eq('cliente_ativo', true);

      if (errClientes) throw errClientes;

      // Query 6: OS ativas
      const { count: totalOS, error: errOS } = await supabase
        .from('ordens_servico')
        .select('*', { count: 'exact', head: true })
        .in('status_geral', ['em_andamento', 'pausada']);

      if (errOS) throw errOS;

      // Agregar valores
      const previsaoReceitaMes = receitasMes?.reduce((acc, r) => acc + Number(r.valor_previsto || 0), 0) ?? 0;
      const receitaRealizadaMes = receitasMes?.reduce((acc, r) => acc + Number(r.valor_recebido || 0), 0) ?? 0;
      const previsaoFaturasMes = despesasMes?.reduce((acc, d) => acc + Number(d.valor || 0), 0) ?? 0;
      const faturasPagasMes = despesasMes
        ?.filter(d => d.status === 'pago')
        .reduce((acc, d) => acc + Number(d.valor || 0), 0) ?? 0;
      const aReceberHoje = receitasHoje?.reduce((acc, r) => acc + Number(r.valor_previsto || 0), 0) ?? 0;
      const aPagarHoje = despesasHoje?.reduce((acc, d) => acc + Number(d.valor || 0), 0) ?? 0;
      const lucroMes = receitaRealizadaMes - faturasPagasMes;
      const margemMes = receitaRealizadaMes > 0 ? (lucroMes / receitaRealizadaMes) * 100 : 0;

      return {
        previsaoReceitaMes,
        receitaRealizadaMes,
        previsaoFaturasMes,
        faturasPagasMes,
        aReceberHoje,
        aPagarHoje,
        lucroMes,
        margemMes: Math.round(margemMes * 10) / 10,
        totalClientesAtivos: totalClientes ?? 0,
        totalOSAtivas: totalOS ?? 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para comparação mensal de receitas (últimos 6 meses)
 */
export function useReceitasComparacao() {
  return useQuery({
    queryKey: ['receitas-comparacao'],
    queryFn: async (): Promise<ComparacaoMensal[]> => {
      const hoje = new Date();
      const meses: ComparacaoMensal[] = [];

      for (let i = 5; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const { firstDayOfMonth, lastDayOfMonth } = getMonthBounds(data);
        const mesNome = data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

        const { data: receitas } = await supabase
          .from('contas_receber')
          .select('valor_previsto, valor_recebido')
          .gte('vencimento', firstDayOfMonth)
          .lte('vencimento', lastDayOfMonth);

        meses.push({
          mes: mesNome.charAt(0).toUpperCase() + mesNome.slice(1),
          previsto: receitas?.reduce((acc, r) => acc + Number(r.valor_previsto || 0), 0) ?? 0,
          realizado: receitas?.reduce((acc, r) => acc + Number(r.valor_recebido || 0), 0) ?? 0,
        });
      }

      return meses;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para comparação mensal de despesas (últimos 6 meses)
 */
export function useDespesasComparacao() {
  return useQuery({
    queryKey: ['despesas-comparacao'],
    queryFn: async (): Promise<ComparacaoMensal[]> => {
      const hoje = new Date();
      const meses: ComparacaoMensal[] = [];

      for (let i = 5; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const { firstDayOfMonth, lastDayOfMonth } = getMonthBounds(data);
        const mesNome = data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

        const { data: despesas } = await supabase
          .from('contas_pagar')
          .select('valor, status')
          .gte('vencimento', firstDayOfMonth)
          .lte('vencimento', lastDayOfMonth);

        meses.push({
          mes: mesNome.charAt(0).toUpperCase() + mesNome.slice(1),
          previsto: despesas?.reduce((acc, d) => acc + Number(d.valor || 0), 0) ?? 0,
          realizado: despesas?.filter(d => d.status === 'pago').reduce((acc, d) => acc + Number(d.valor || 0), 0) ?? 0,
        });
      }

      return meses;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}
