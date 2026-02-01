/**
 * use-cc-detalhes.ts
 * 
 * Hooks para a página de Detalhes do Centro de Custo
 * Busca lançamentos, custos por categoria e evolução mensal.
 * 
 * @example
 * ```tsx
 * const { data: receitas } = useCCReceitas(ccId);
 * const { data: despesas } = useCCDespesas(ccId);
 * const { data: custosPorCategoria } = useCCCustosPorCategoria(ccId);
 * const { data: evolucao } = useCCEvolucaoMensal(ccId);
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';

// ============================================================
// TYPES
// ============================================================

export interface CCReceita {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  valor_recebido: number | null;
  status: string;
  parcela_num: number | null;
  total_parcelas: number | null;
  contrato_id: string | null;
  cliente_nome: string | null;
}

export interface CCDespesa {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  status: string;
  categoria_nome: string | null;
  categoria_codigo: string | null;
  fornecedor: string | null;
}

export interface CCCustoPorCategoria {
  categoria_id: string | null;
  categoria_nome: string;
  codigo: string | null;
  valor_previsto: number;
  valor_realizado: number;
  percentual_total: number;
}

export interface CCEvolucaoMensal {
  mes: string;
  mes_label: string;
  receita: number;
  despesa: number;
  lucro: number;
}

export interface CCDocumento {
  id: string;
  nome: string;
  tipo: string;
  url: string | null;
  uploaded_at: string | null;
  obrigatorio: boolean;
  status: 'ok' | 'pendente';
}

// ============================================================
// HOOKS
// ============================================================

/**
 * Busca receitas (contas_receber) vinculadas a um Centro de Custo
 */
export function useCCReceitas(ccId: string | undefined | null) {
  return useQuery({
    queryKey: ['cc-receitas', ccId],
    queryFn: async (): Promise<CCReceita[]> => {
      if (!ccId) return [];

      const { data, error } = await supabase
        .from('contas_receber')
        .select(`
          id,
          vencimento,
          parcela,
          valor_previsto,
          valor_recebido,
          status,
          parcela_num,
          total_parcelas,
          contrato_id,
          clientes:cliente_id (nome_razao_social)
        `)
        .eq('cc_id', ccId)
        .order('vencimento', { ascending: false });

      if (error) throw error;

      return (data ?? []).map((item) => ({
        id: item.id,
        data: item.vencimento ?? '',
        descricao: item.parcela ?? 'Parcela',
        valor: Number(item.valor_previsto ?? 0),
        valor_recebido: item.valor_recebido != null ? Number(item.valor_recebido) : null,
        status: item.status ?? 'pendente',
        parcela_num: item.parcela_num,
        total_parcelas: item.total_parcelas,
        contrato_id: item.contrato_id,
        cliente_nome: (item.clientes as { nome_razao_social?: string } | null)?.nome_razao_social ?? null,
      }));
    },
    enabled: !!ccId,
  });
}

/**
 * Busca despesas (contas_pagar) vinculadas a um Centro de Custo
 */
export function useCCDespesas(ccId: string | undefined | null) {
  return useQuery({
    queryKey: ['cc-despesas', ccId],
    queryFn: async (): Promise<CCDespesa[]> => {
      if (!ccId) return [];

      const { data, error } = await supabase
        .from('contas_pagar')
        .select(`
          id,
          vencimento,
          descricao,
          valor,
          status,
          favorecido_fornecedor,
          categorias_financeiras:categoria_id (
            nome,
            codigo
          )
        `)
        .eq('cc_id', ccId)
        .order('vencimento', { ascending: false });

      if (error) throw error;

      return (data ?? []).map((item) => {
        const cat = item.categorias_financeiras as { nome?: string; codigo?: string } | null;
        return {
          id: item.id,
          data: item.vencimento ?? '',
          descricao: item.descricao ?? '',
          valor: Number(item.valor ?? 0),
          status: item.status ?? 'pendente',
          categoria_nome: cat?.nome ?? null,
          categoria_codigo: cat?.codigo ?? null,
          fornecedor: item.favorecido_fornecedor ?? null,
        };
      });
    },
    enabled: !!ccId,
  });
}

/**
 * Busca custos agrupados por categoria para um Centro de Custo
 */
export function useCCCustosPorCategoria(ccId: string | undefined | null) {
  return useQuery({
    queryKey: ['cc-custos-categoria', ccId],
    queryFn: async (): Promise<CCCustoPorCategoria[]> => {
      if (!ccId) return [];

      // Buscar contas_pagar agrupadas por categoria
      const { data, error } = await supabase
        .from('contas_pagar')
        .select(`
          valor,
          status,
          categorias_financeiras:categoria_id (
            id,
            nome,
            codigo
          )
        `)
        .eq('cc_id', ccId);

      if (error) throw error;

      // Agrupar por categoria
      const grouped: Record<string, {
        categoria_id: string | null;
        categoria_nome: string;
        codigo: string | null;
        valor_previsto: number;
        valor_realizado: number;
      }> = {};

      let totalGeral = 0;

      (data ?? []).forEach((item) => {
        const cat = item.categorias_financeiras as { id?: string; nome?: string; codigo?: string } | null;
        const key = cat?.id ?? 'sem_categoria';
        const valor = Number(item.valor ?? 0);
        const isPago = item.status === 'pago';

        if (!grouped[key]) {
          grouped[key] = {
            categoria_id: cat?.id ?? null,
            categoria_nome: cat?.nome ?? 'Sem Categoria',
            codigo: cat?.codigo ?? null,
            valor_previsto: 0,
            valor_realizado: 0,
          };
        }

        grouped[key].valor_previsto += valor;
        if (isPago) {
          grouped[key].valor_realizado += valor;
        }
        totalGeral += valor;
      });

      // Calcular percentuais e retornar ordenado por valor
      return Object.values(grouped)
        .map((cat) => ({
          ...cat,
          percentual_total: totalGeral > 0 
            ? Math.round((cat.valor_previsto / totalGeral) * 1000) / 10 
            : 0,
        }))
        .sort((a, b) => b.valor_previsto - a.valor_previsto);
    },
    enabled: !!ccId,
  });
}

/**
 * Busca evolução mensal (últimos 6 meses) para um Centro de Custo
 */
export function useCCEvolucaoMensal(ccId: string | undefined | null, meses = 6) {
  return useQuery({
    queryKey: ['cc-evolucao-mensal', ccId, meses],
    queryFn: async (): Promise<CCEvolucaoMensal[]> => {
      if (!ccId) return [];

      // Buscar receitas e despesas
      const [receitasResult, despesasResult] = await Promise.all([
        supabase
          .from('contas_receber')
          .select('vencimento, valor_previsto, valor_recebido, status')
          .eq('cc_id', ccId),
        supabase
          .from('contas_pagar')
          .select('vencimento, valor, status')
          .eq('cc_id', ccId),
      ]);

      if (receitasResult.error) throw receitasResult.error;
      if (despesasResult.error) throw despesasResult.error;

      // Agrupar por mês
      const monthData: Record<string, { receita: number; despesa: number }> = {};
      const now = new Date();

      // Inicializar últimos N meses
      for (let i = meses - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthData[key] = { receita: 0, despesa: 0 };
      }

      // Processar receitas realizadas
      (receitasResult.data ?? []).forEach((item) => {
        if (!item.vencimento) return;
        const date = new Date(item.vencimento);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthData[key]) {
          const valor = item.status === 'pago' || item.status === 'recebido'
            ? Number(item.valor_recebido ?? item.valor_previsto ?? 0)
            : Number(item.valor_previsto ?? 0);
          monthData[key].receita += valor;
        }
      });

      // Processar despesas pagas
      (despesasResult.data ?? []).forEach((item) => {
        if (!item.vencimento) return;
        const date = new Date(item.vencimento);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthData[key] && item.status === 'pago') {
          monthData[key].despesa += Number(item.valor ?? 0);
        }
      });

      // Converter para array com labels
      const mesesPT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      return Object.entries(monthData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, values]) => {
          const [, month] = key.split('-');
          const monthIndex = parseInt(month, 10) - 1;
          return {
            mes: key,
            mes_label: mesesPT[monthIndex],
            receita: values.receita,
            despesa: values.despesa,
            lucro: values.receita - values.despesa,
          };
        });
    },
    enabled: !!ccId,
  });
}

/**
 * Hook combinado com todos os dados necessários para a página CC Detalhes
 */
export function useCCDetalhes(ccId: string | undefined | null) {
  const receitas = useCCReceitas(ccId);
  const despesas = useCCDespesas(ccId);
  const custosPorCategoria = useCCCustosPorCategoria(ccId);
  const evolucaoMensal = useCCEvolucaoMensal(ccId);

  return {
    receitas,
    despesas,
    custosPorCategoria,
    evolucaoMensal,
    isLoading: receitas.isLoading || despesas.isLoading || custosPorCategoria.isLoading || evolucaoMensal.isLoading,
    isError: receitas.isError || despesas.isError || custosPorCategoria.isError || evolucaoMensal.isError,
    refetchAll: () => {
      receitas.refetch();
      despesas.refetch();
      custosPorCategoria.refetch();
      evolucaoMensal.refetch();
    },
  };
}
