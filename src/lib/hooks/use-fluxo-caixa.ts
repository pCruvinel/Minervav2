/**
 * use-fluxo-caixa.ts
 * 
 * Hooks para análise de fluxo de caixa, projeções temporais
 * e calendário financeiro.
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useFluxoCaixa();
 * const { data: calendario } = useCalendarioFinanceiro();
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';

// ============================================================
// TYPES
// ============================================================

export interface FluxoCaixaDia {
  data: string;
  dataFormatada: string;
  entradas: number;
  saidas: number;
  saldo: number;
  saldoAcumulado: number;
}

export interface FluxoCaixaKPIs {
  saldoAtual: number;
  saldoProjetado30Dias: number;
  entradasProximos30Dias: number;
  saidasProximos30Dias: number;
  diasCriticos: number; // dias com saldo negativo projetado
}

export interface EventoCalendario {
  id: string;
  data: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  cliente_ou_fornecedor: string;
  status: string;
}

// ============================================================
// HOOKS
// ============================================================

/**
 * Hook para projeção de fluxo de caixa diário
 */
export function useFluxoCaixa(diasProjecao: number = 30) {
  return useQuery({
    queryKey: ['fluxo-caixa', diasProjecao],
    queryFn: async (): Promise<FluxoCaixaDia[]> => {
      const hoje = new Date();
      const dataFim = new Date(hoje);
      dataFim.setDate(dataFim.getDate() + diasProjecao);

      const hojeStr = hoje.toISOString().split('T')[0];
      const fimStr = dataFim.toISOString().split('T')[0];

      // Buscar receitas previstas
      const { data: receitas } = await supabase
        .from('contas_receber')
        .select('vencimento, valor_previsto, status')
        .gte('vencimento', hojeStr)
        .lte('vencimento', fimStr);

      // Buscar despesas previstas
      const { data: despesas } = await supabase
        .from('contas_pagar')
        .select('vencimento, valor, status')
        .gte('vencimento', hojeStr)
        .lte('vencimento', fimStr);

      // Agregar por dia
      const fluxoPorDia: Record<string, { entradas: number; saidas: number }> = {};

      // Inicializar todos os dias
      for (let i = 0; i <= diasProjecao; i++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() + i);
        const dataStr = data.toISOString().split('T')[0];
        fluxoPorDia[dataStr] = { entradas: 0, saidas: 0 };
      }

      // Agregar receitas
      receitas?.forEach((r) => {
        if (fluxoPorDia[r.vencimento]) {
          fluxoPorDia[r.vencimento].entradas += Number(r.valor_previsto);
        }
      });

      // Agregar despesas
      despesas?.forEach((d) => {
        if (fluxoPorDia[d.vencimento]) {
          fluxoPorDia[d.vencimento].saidas += Number(d.valor);
        }
      });

      // Converter para array com saldo acumulado
      const dias = Object.keys(fluxoPorDia).sort();
      let saldoAcumulado = 0;

      return dias.map((data) => {
        const { entradas, saidas } = fluxoPorDia[data];
        const saldo = entradas - saidas;
        saldoAcumulado += saldo;

        const dataObj = new Date(data + 'T00:00:00');
        const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
        });

        return {
          data,
          dataFormatada,
          entradas,
          saidas,
          saldo,
          saldoAcumulado,
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para KPIs de fluxo de caixa
 */
export function useFluxoCaixaKPIs() {
  return useQuery({
    queryKey: ['fluxo-caixa-kpis'],
    queryFn: async (): Promise<FluxoCaixaKPIs> => {
      const hoje = new Date();
      const data30Dias = new Date(hoje);
      data30Dias.setDate(data30Dias.getDate() + 30);

      const hojeStr = hoje.toISOString().split('T')[0];
      const fim30Str = data30Dias.toISOString().split('T')[0];

      // Entradas próximos 30 dias
      const { data: receitas } = await supabase
        .from('contas_receber')
        .select('valor_previsto, vencimento, status')
        .gte('vencimento', hojeStr)
        .lte('vencimento', fim30Str)
        .in('status', ['em_aberto', 'pendente']);

      // Saídas próximos 30 dias
      const { data: despesas } = await supabase
        .from('contas_pagar')
        .select('valor, vencimento, status')
        .gte('vencimento', hojeStr)
        .lte('vencimento', fim30Str)
        .in('status', ['em_aberto', 'pendente']);

      // Saldo atual (receitas recebidas - despesas pagas até hoje)
      const { data: recebidos } = await supabase
        .from('contas_receber')
        .select('valor_recebido')
        .lte('vencimento', hojeStr)
        .eq('status', 'pago');

      const { data: pagos } = await supabase
        .from('contas_pagar')
        .select('valor')
        .lte('vencimento', hojeStr)
        .eq('status', 'pago');

      const totalRecebido = recebidos?.reduce((acc, r) => acc + Number(r.valor_recebido || 0), 0) ?? 0;
      const totalPago = pagos?.reduce((acc, p) => acc + Number(p.valor), 0) ?? 0;
      const saldoAtual = totalRecebido - totalPago;

      const entradasProximos30Dias = receitas?.reduce((acc, r) => acc + Number(r.valor_previsto), 0) ?? 0;
      const saidasProximos30Dias = despesas?.reduce((acc, d) => acc + Number(d.valor), 0) ?? 0;
      const saldoProjetado30Dias = saldoAtual + entradasProximos30Dias - saidasProximos30Dias;

      // Calcular dias críticos (com saldo negativo projetado)
      let saldoTemp = saldoAtual;
      let diasCriticos = 0;
      const fluxoPorDia: Record<string, { entradas: number; saidas: number }> = {};

      receitas?.forEach((r) => {
        fluxoPorDia[r.vencimento] = fluxoPorDia[r.vencimento] || { entradas: 0, saidas: 0 };
        fluxoPorDia[r.vencimento].entradas += Number(r.valor_previsto);
      });

      despesas?.forEach((d) => {
        fluxoPorDia[d.vencimento] = fluxoPorDia[d.vencimento] || { entradas: 0, saidas: 0 };
        fluxoPorDia[d.vencimento].saidas += Number(d.valor);
      });

      Object.keys(fluxoPorDia).sort().forEach((data) => {
        saldoTemp += fluxoPorDia[data].entradas - fluxoPorDia[data].saidas;
        if (saldoTemp < 0) diasCriticos++;
      });

      return {
        saldoAtual,
        saldoProjetado30Dias,
        entradasProximos30Dias,
        saidasProximos30Dias,
        diasCriticos,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para calendário financeiro (próximos 7 dias)
 */
export function useCalendarioFinanceiro(dias: number = 7) {
  return useQuery({
    queryKey: ['calendario-financeiro', dias],
    queryFn: async (): Promise<EventoCalendario[]> => {
      const hoje = new Date();
      const dataFim = new Date(hoje);
      dataFim.setDate(dataFim.getDate() + dias);

      const hojeStr = hoje.toISOString().split('T')[0];
      const fimStr = dataFim.toISOString().split('T')[0];

      // Receitas
      const { data: receitas } = await supabase
        .from('contas_receber')
        .select(`
          id,
          vencimento,
          descricao,
          valor_previsto,
          status,
          clientes (nome_razao_social)
        `)
        .gte('vencimento', hojeStr)
        .lte('vencimento', fimStr)
        .in('status', ['em_aberto', 'pendente']);

      // Despesas
      const { data: despesas } = await supabase
        .from('contas_pagar')
        .select('id, vencimento, descricao, valor, status, fornecedor')
        .gte('vencimento', hojeStr)
        .lte('vencimento', fimStr)
        .in('status', ['em_aberto', 'pendente']);

      const eventos: EventoCalendario[] = [];

      receitas?.forEach((r) => {
        const clienteData = r.clientes as { nome_razao_social: string } | null;
        eventos.push({
          id: r.id,
          data: r.vencimento,
          tipo: 'receita',
          descricao: r.descricao || 'Receita',
          valor: Number(r.valor_previsto),
          cliente_ou_fornecedor: clienteData?.nome_razao_social ?? 'Cliente',
          status: r.status,
        });
      });

      despesas?.forEach((d) => {
        eventos.push({
          id: d.id,
          data: d.vencimento,
          tipo: 'despesa',
          descricao: d.descricao || 'Despesa',
          valor: Number(d.valor),
          cliente_ou_fornecedor: d.fornecedor ?? 'Fornecedor',
          status: d.status,
        });
      });

      // Ordenar por data
      return eventos.sort((a, b) => a.data.localeCompare(b.data));
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================================
// DETALHES DO DIA (para modal)
// ============================================================

export interface TransacaoDia {
  id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  cliente_ou_fornecedor: string;
  cc_codigo: string | null;
  status: string;
  parcela: string | null;
}

/**
 * Hook para buscar detalhes de transações de um dia específico
 */
export function useDetalhesDia(data: string | null) {
  return useQuery({
    queryKey: ['detalhes-dia', data],
    queryFn: async (): Promise<TransacaoDia[]> => {
      if (!data) return [];

      const transacoes: TransacaoDia[] = [];

      // Receitas do dia (query simples sem joins problemáticos)
      const { data: receitas, error: receitasError } = await supabase
        .from('contas_receber')
        .select(`
          id,
          contrato_numero,
          parcela,
          valor_previsto,
          status,
          cliente_id,
          cc_id
        `)
        .eq('vencimento', data);

      if (receitasError) {
        console.error('Erro ao buscar receitas:', receitasError);
      }

      // Buscar nomes dos clientes separadamente se necessário
      const clienteIds = receitas?.map(r => r.cliente_id).filter(Boolean) ?? [];
      let clientesMap: Record<string, string> = {};
      
      if (clienteIds.length > 0) {
        const { data: clientes } = await supabase
          .from('clientes')
          .select('id, nome_razao_social')
          .in('id', clienteIds);
        
        clientes?.forEach(c => {
          clientesMap[c.id] = c.nome_razao_social;
        });
      }

      receitas?.forEach((r) => {
        transacoes.push({
          id: r.id,
          tipo: 'receita',
          descricao: r.contrato_numero || 'Receita',
          valor: Number(r.valor_previsto),
          cliente_ou_fornecedor: clientesMap[r.cliente_id] ?? 'Cliente',
          cc_codigo: r.cc_id ?? null,
          status: r.status,
          parcela: r.parcela,
        });
      });

      // Despesas do dia
      const { data: despesas, error: despesasError } = await supabase
        .from('contas_pagar')
        .select(`
          id,
          descricao,
          valor,
          status,
          tipo,
          favorecido_fornecedor,
          cc_id
        `)
        .eq('vencimento', data);

      if (despesasError) {
        console.error('Erro ao buscar despesas:', despesasError);
      }

      despesas?.forEach((d) => {
        transacoes.push({
          id: d.id,
          tipo: 'despesa',
          descricao: d.descricao || d.tipo || 'Despesa',
          valor: Number(d.valor),
          cliente_ou_fornecedor: d.favorecido_fornecedor ?? 'Fornecedor',
          cc_codigo: d.cc_id ?? null,
          status: d.status,
          parcela: null,
        });
      });

      // Ordenar: receitas primeiro, depois despesas
      return transacoes.sort((a, b) => {
        if (a.tipo !== b.tipo) return a.tipo === 'receita' ? -1 : 1;
        return b.valor - a.valor;
      });
    },
    enabled: !!data,
    staleTime: 1 * 60 * 1000,
  });
}

