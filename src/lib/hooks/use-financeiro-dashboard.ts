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
        .eq('status', 'ativo');

      if (errClientes) throw errClientes;

      // Query 6: OS ativas
      const { count: totalOS, error: errOS } = await supabase
        .from('ordens_servico')
        .select('*', { count: 'exact', head: true })
        .in('status_geral', ['em_andamento', 'em_triagem', 'aguardando_info', 'aguardando_aprovacao']);

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

// ============================================================
// ANÁLISE DE VARIAÇÃO (PREVISTO VS REALIZADO)
// ============================================================

export interface AnaliseVariacao {
  receitas: {
    previsto: number;
    realizado: number;
    variacao: number;
    percentual: number;
  };
  despesas: {
    previsto: number;
    realizado: number;
    variacao: number;
    percentual: number;
  };
  periodo: string;
}

/**
 * Hook para análise de variação mensal (previsto vs realizado)
 * Usado no card "Análise de Variação - Este Mês"
 */
export function useAnaliseVariacao() {
  return useQuery({
    queryKey: ['analise-variacao'],
    queryFn: async (): Promise<AnaliseVariacao> => {
      const { firstDayOfMonth, lastDayOfMonth } = getMonthBounds();
      const hoje = new Date();
      const periodo = hoje.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

      // Receitas do mês
      const { data: receitas } = await supabase
        .from('contas_receber')
        .select('valor_previsto, valor_recebido, status')
        .gte('vencimento', firstDayOfMonth)
        .lte('vencimento', lastDayOfMonth);

      // Despesas do mês
      const { data: despesas } = await supabase
        .from('contas_pagar')
        .select('valor, status')
        .gte('vencimento', firstDayOfMonth)
        .lte('vencimento', lastDayOfMonth);

      // Calcular receitas
      const receitaPrevisto = receitas?.reduce((acc, r) => acc + Number(r.valor_previsto || 0), 0) ?? 0;
      const receitaRealizado = receitas?.reduce((acc, r) => acc + Number(r.valor_recebido || 0), 0) ?? 0;
      const receitaVariacao = receitaRealizado - receitaPrevisto;
      const receitaPercentual = receitaPrevisto > 0 ? (receitaVariacao / receitaPrevisto) * 100 : 0;

      // Calcular despesas
      const despesaPrevisto = despesas?.reduce((acc, d) => acc + Number(d.valor || 0), 0) ?? 0;
      const despesaRealizado = despesas
        ?.filter(d => d.status === 'pago')
        .reduce((acc, d) => acc + Number(d.valor || 0), 0) ?? 0;
      const despesaVariacao = despesaRealizado - despesaPrevisto;
      const despesaPercentual = despesaPrevisto > 0 ? (despesaVariacao / despesaPrevisto) * 100 : 0;

      return {
        receitas: {
          previsto: receitaPrevisto,
          realizado: receitaRealizado,
          variacao: receitaVariacao,
          percentual: Math.round(receitaPercentual * 10) / 10,
        },
        despesas: {
          previsto: despesaPrevisto,
          realizado: despesaRealizado,
          variacao: despesaVariacao,
          percentual: Math.round(despesaPercentual * 10) / 10,
        },
        periodo,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================
// PRESTAÇÃO DE CONTAS (LUCRATIVIDADE POR TIPO)
// ============================================================

export interface PrestacaoContasTipo {
  tipo: string;
  lucroTotal: number;
  projetosCount: number;
  projetosEmAndamento: number;
}

/**
 * Hook para prestação de contas por tipo de projeto
 * Usado no card "Prestação de Contas"
 */
export function usePrestacaoContas() {
  return useQuery({
    queryKey: ['prestacao-contas'],
    queryFn: async (): Promise<PrestacaoContasTipo[]> => {
      // Buscar contratos ativos com tipo e centro de custo
      const { data: contratos } = await supabase
        .from('contratos')
        .select(`
          id,
          tipo,
          status,
          valor_total,
          cc_id
        `)
        .in('status', ['ativo', 'concluido']);

      // Buscar receitas realizadas
      const { data: receitas } = await supabase
        .from('contas_receber')
        .select('contrato_id, valor_recebido')
        .in('status', ['pago', 'recebido', 'conciliado']);

      // Buscar despesas realizadas - usando cc_id (contas_pagar não tem contrato_id)
      const { data: despesas } = await supabase
        .from('contas_pagar')
        .select('cc_id, valor')
        .eq('status', 'pago');

      // Agregar por tipo
      const tiposMap: Record<string, {
        lucro: number;
        count: number;
        emAndamento: number;
      }> = {
        'Obra': { lucro: 0, count: 0, emAndamento: 0 },
        'Assessoria Anual': { lucro: 0, count: 0, emAndamento: 0 },
        'Laudo Pontual': { lucro: 0, count: 0, emAndamento: 0 },
      };

      // Mapear receitas por contrato
      const receitasPorContrato: Record<string, number> = {};
      receitas?.forEach(r => {
        if (r.contrato_id) {
          receitasPorContrato[r.contrato_id] = (receitasPorContrato[r.contrato_id] || 0) + Number(r.valor_recebido || 0);
        }
      });

      // Mapear despesas por centro de custo (cc_id)
      const despesasPorCC: Record<string, number> = {};
      despesas?.forEach(d => {
        if (d.cc_id) {
          despesasPorCC[d.cc_id] = (despesasPorCC[d.cc_id] || 0) + Number(d.valor || 0);
        }
      });

      // Calcular lucro por tipo
      contratos?.forEach(contrato => {
        const tipo = contrato.tipo || 'Outros';
        const tipoNormalizado = tipo.includes('Obra') ? 'Obra' :
          tipo.includes('Assessoria') ? 'Assessoria Anual' :
            tipo.includes('Laudo') ? 'Laudo Pontual' : tipo;

        if (!tiposMap[tipoNormalizado]) {
          tiposMap[tipoNormalizado] = { lucro: 0, count: 0, emAndamento: 0 };
        }

        const receita = receitasPorContrato[contrato.id] || 0;
        // Despesas são vinculadas via cc_id do contrato
        const despesa = contrato.cc_id ? (despesasPorCC[contrato.cc_id] || 0) : 0;
        const lucro = receita - despesa;

        tiposMap[tipoNormalizado].lucro += lucro;
        tiposMap[tipoNormalizado].count += 1;
        if (contrato.status === 'ativo') {
          tiposMap[tipoNormalizado].emAndamento += 1;
        }
      });

      return Object.entries(tiposMap)
        .map(([tipo, data]) => ({
          tipo,
          lucroTotal: data.lucro,
          projetosCount: data.count,
          projetosEmAndamento: data.emAndamento,
        }))
        .filter(t => t.projetosCount > 0 || ['Obra', 'Assessoria Anual', 'Laudo Pontual'].includes(t.tipo));
    },
    staleTime: 10 * 60 * 1000,
  });
}
