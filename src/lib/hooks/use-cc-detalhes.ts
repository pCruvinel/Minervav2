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

export interface CCOverhead {
  id: string;
  mes_referencia: string;
  custo_escritorio_rateado: number;
  custo_setor_rateado: number;
  valor_total_alocado: number;
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
/**
 * Busca custos agrupados por categoria para um Centro de Custo
 * Exibe TODAS as categorias ativas, mesmo com valor zerado.
 */
export function useCCCustosPorCategoria(ccId: string | undefined | null) {
  return useQuery({
    queryKey: ['cc-custos-categoria', ccId],
    queryFn: async (): Promise<CCCustoPorCategoria[]> => {
      if (!ccId) return [];

      // 1. Buscar todas as categorias ativas de despesa
      const { data: categorias, error: catError } = await supabase
        .from('categorias_financeiras')
        .select('id, nome, codigo')
        .eq('ativo', true)
        .in('tipo', ['pagar', 'ambos'])
        .order('nome');

      if (catError) throw catError;

      // 2. Buscar contas_pagar do CC
      const { data: despesas, error: despError } = await supabase
        .from('contas_pagar')
        .select(`
          valor,
          status,
          categoria_id
        `)
        .eq('cc_id', ccId);

      if (despError) throw despError;

      // 3. Inicializar mapa com todas as categorias zeradas
      const grouped: Record<string, {
        categoria_id: string | null;
        categoria_nome: string;
        codigo: string | null;
        valor_previsto: number;
        valor_realizado: number;
      }> = {};

      // Preencher com todas as categorias
      (categorias ?? []).forEach(cat => {
        grouped[cat.id] = {
          categoria_id: cat.id,
          categoria_nome: cat.nome,
          codigo: cat.codigo,
          valor_previsto: 0,
          valor_realizado: 0,
        };
      });

      // Adicionar categoria para "Sem Categoria" se necessário
      const SEM_CATEGORIA_KEY = 'sem_categoria';
      let hasSemCategoria = false;

      // 4. Somar valores das despesas
      let totalGeral = 0;

      (despesas ?? []).forEach((item) => {
        const catId = item.categoria_id;
        const valor = Number(item.valor ?? 0);
        const isPago = item.status === 'pago';

        // Se tem categoria conhecida, soma nela
        if (catId && grouped[catId]) {
          grouped[catId].valor_previsto += valor;
          if (isPago) grouped[catId].valor_realizado += valor;
        } else {
          // Se não tem categoria ou categoria não encontrada (inativa?), soma em "Sem Categoria"
          if (!hasSemCategoria) {
            grouped[SEM_CATEGORIA_KEY] = {
              categoria_id: null,
              categoria_nome: 'Sem Categoria',
              codigo: null,
              valor_previsto: 0,
              valor_realizado: 0,
            };
            hasSemCategoria = true;
          }
          grouped[SEM_CATEGORIA_KEY].valor_previsto += valor;
          if (isPago) grouped[SEM_CATEGORIA_KEY].valor_realizado += valor;
        }
        
        totalGeral += valor;
      });

      // 5. Calcular percentuais e retornar
      // Ordenação: Maior valor previsto primeiro, depois alfabética
      return Object.values(grouped)
        .map((cat) => ({
          ...cat,
          percentual_total: totalGeral > 0 
            ? Math.round((cat.valor_previsto / totalGeral) * 1000) / 10 
            : 0,
        }))
        .sort((a, b) => {
          // Valores maiores primeiro
          if (b.valor_previsto !== a.valor_previsto) {
            return b.valor_previsto - a.valor_previsto;
          }
          // Desempate alfabético
          return a.categoria_nome.localeCompare(b.categoria_nome);
        });
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
 * Busca histórico de Overhead alocado ao CC
 */
export function useCCOverhead(ccId: string | undefined | null) {
  return useQuery({
    queryKey: ['cc-overhead', ccId],
    queryFn: async (): Promise<CCOverhead[]> => {
      if (!ccId) return [];

      const { data, error } = await supabase
        .from('custos_overhead_mensal')
        .select('*')
        .eq('cc_id', ccId)
        .order('mes_referencia', { ascending: false });

      if (error) throw error;
      
      return (data ?? []).map((item) => ({
        id: item.id,
        mes_referencia: item.mes_referencia,
        custo_escritorio_rateado: Number(item.custo_escritorio_rateado),
        custo_setor_rateado: Number(item.custo_setor_rateado),
        valor_total_alocado: Number(item.valor_total_alocado)
      }));
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
  const overhead = useCCOverhead(ccId);

  return {
    receitas,
    despesas,
    custosPorCategoria,
    evolucaoMensal,
    overhead,
    isLoading: receitas.isLoading || despesas.isLoading || custosPorCategoria.isLoading || evolucaoMensal.isLoading || overhead.isLoading,
    isError: receitas.isError || despesas.isError || custosPorCategoria.isError || evolucaoMensal.isError || overhead.isError,
    refetchAll: () => {
      receitas.refetch();
      despesas.refetch();
      custosPorCategoria.refetch();
      evolucaoMensal.refetch();
      overhead.refetch();
    },
  };
}
