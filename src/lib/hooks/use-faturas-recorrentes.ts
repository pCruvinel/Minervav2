/**
 * use-faturas-recorrentes.ts
 * 
 * Hooks para gerenciar faturas recorrentes (despesas fixas),
 * incluindo salários e contas a pagar mensais.
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useFaturasRecorrentes();
 * const { data: salarios } = useSalariosPrevistos();
 * ```
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';

// ============================================================
// TYPES
// ============================================================

export interface FaturaRecorrente {
  id: string;
  descricao: string;
  fornecedor: string;
  categoria: string;
  valor: number;
  dia_vencimento: number;
  cc_id: string | null;
  cc_nome: string | null;
  status: 'pendente' | 'pago' | 'atrasado';
  vencimento: string;
  frequencia: 'mensal' | 'trimestral' | 'anual' | 'unica';
  tipo: 'fixa' | 'variavel';
}

export interface SalarioPrevisto {
  colaborador_id: string;
  colaborador_nome: string;
  cargo: string;
  setor: string;
  salario_base: number;
  encargos_estimados: number;
  beneficios: number;
  custo_total: number;
  data_pagamento: string;
  status: 'pendente' | 'pago';
}

export interface FaturasKPIs {
  totalFaturasMes: number;
  pagoMes: number;
  pendenteMes: number;
  atrasadoMes: number;
  folhaPagamento: number;
  contasFixas: number;
}

// ============================================================
// HOOKS
// ============================================================

/**
 * Hook para listar faturas a pagar do mês (e atrasadas)
 */
export function useFaturasRecorrentes(referenceDate: Date = new Date()) {
  return useQuery({
    queryKey: ['faturas-recorrentes', referenceDate.toISOString().slice(0, 7)], // Cache por mês (YYYY-MM)
    queryFn: async (): Promise<FaturaRecorrente[]> => {
      const year = referenceDate.getFullYear();
      const month = referenceDate.getMonth();
      
      const firstDayOfMonth = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDayOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0];

      // Query: (Vencimento no mês) OU (Vencimento anterior E status != pago)
      // Supabase .or syntax: "and(vencimento.gte.X,vencimento.lte.Y),and(vencimento.lt.X,status.neq.pago)"
      const orQuery = `and(vencimento.gte.${firstDayOfMonth},vencimento.lte.${lastDayOfMonth}),and(vencimento.lt.${firstDayOfMonth},status.neq.pago)`;

      const { data, error } = await supabase
        .from('contas_pagar')
        .select(`
          id,
          descricao,
          favorecido_fornecedor,
          categoria,
          valor,
          vencimento,
          status,
          cc_id,
          tipo
        `)
        .or(orQuery)
        .order('vencimento', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar contas_pagar:', error);
        throw error;
      }

      return (data || []).map((item) => {
        const hojeDate = new Date();
        hojeDate.setHours(0, 0, 0, 0);
        const vencDate = new Date(item.vencimento);
        
        // Identificar atraso: não pago E data < hoje
        const isAtrasado = item.status !== 'pago' && vencDate < hojeDate;

        return {
          id: item.id,
          descricao: item.descricao || 'Fatura',
          fornecedor: item.favorecido_fornecedor || '-',
          categoria: item.categoria || 'Outros',
          valor: Number(item.valor),
          dia_vencimento: vencDate.getDate(),
          cc_id: item.cc_id,
          cc_nome: null,
          status: isAtrasado ? 'atrasado' : (item.status as 'pendente' | 'pago'),
          vencimento: item.vencimento,
          frequencia: 'mensal' as const, // Simplificação
          tipo: item.tipo as 'fixa' | 'variavel',
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para listar salários previstos do mês
 */
export function useSalariosPrevistos() {
  return useQuery({
    queryKey: ['salarios-previstos'],
    queryFn: async (): Promise<SalarioPrevisto[]> => {
      // Query simplificada sem joins problemáticos
      const { data: colaboradores, error } = await supabase
        .from('colaboradores')
        .select(`
          id,
          nome_completo,
          salario_base,
          setor,
          funcao
        `)
        .eq('ativo', true)
        .not('salario_base', 'is', null);

      if (error) {
        logger.error('Erro ao buscar colaboradores:', error);
        throw error;
      }

      // Filtrar manualmente os que tem salário > 0
      const colaboradoresComSalario = (colaboradores || []).filter(
        col => col.salario_base && Number(col.salario_base) > 0
      );

      return colaboradoresComSalario.map((col) => {
        const salarioBase = Number(col.salario_base);
        const encargos = Math.round(salarioBase * 0.46); // 46% encargos
        const beneficios = 450; // valor fixo default

        return {
          colaborador_id: col.id,
          colaborador_nome: col.nome_completo || 'Colaborador',
          cargo: col.funcao || '-',
          setor: col.setor || '-',
          salario_base: salarioBase,
          encargos_estimados: encargos,
          beneficios,
          custo_total: salarioBase + encargos + beneficios,
          data_pagamento: '', // 5º dia útil típico
          status: 'pendente' as const,
        };
      });
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para KPIs de faturas
 */
export function useFaturasKPIs(referenceDate: Date = new Date()) {
  return useQuery({
    queryKey: ['faturas-kpis', referenceDate.toISOString().slice(0, 7)],
    queryFn: async (): Promise<FaturasKPIs> => {
      const year = referenceDate.getFullYear();
      const month = referenceDate.getMonth();
      const hojeStr = new Date().toISOString().split('T')[0];

      const firstDayOfMonth = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDayOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0];

      // Busca unificada: Mes Corrente + Atrasados
      const orQuery = `and(vencimento.gte.${firstDayOfMonth},vencimento.lte.${lastDayOfMonth}),and(vencimento.lt.${firstDayOfMonth},status.neq.pago)`;

      const { data: faturas, error: faturasError } = await supabase
        .from('contas_pagar')
        .select('valor, status, vencimento')
        .or(orQuery);

      if (faturasError) {
        logger.error('Erro ao buscar faturas do mês:', faturasError);
      }

      // Colaboradores ativos para folha (não depende do mês por enquanto, assume fixo)
      const { data: colaboradores, error: colabError } = await supabase
        .from('colaboradores')
        .select('salario_base')
        .eq('ativo', true)
        .not('salario_base', 'is', null);

      if (colabError) {
        logger.error('Erro ao buscar colaboradores:', colabError);
      }

      const colaboradoresComSalario = (colaboradores || []).filter(
        c => c.salario_base && Number(c.salario_base) > 0
      );

      // Cálculos
      // 1. Total Faturas Mês (considera apenas o que vence NO MÊS selecionado, ignorando atrasados antigos para esta métrica específica, ou inclui?)
      // Geralmente "Total do Mês" = Expectativa do mês. "Total a Pagar" = Mês + Atrasados.
      // O tipo return FaturasKPIs tem campos limitados. Vamos adaptar.
      
      const faturasDoMes = faturas?.filter(f => f.vencimento >= firstDayOfMonth && f.vencimento <= lastDayOfMonth) || [];
      const faturasAtrasadasAntigas = faturas?.filter(f => f.vencimento < firstDayOfMonth) || [];

      const totalFaturasMes = faturasDoMes.reduce((acc, f) => acc + Number(f.valor || 0), 0);
      
      const pagoMes = faturasDoMes
        .filter(f => f.status === 'pago')
        .reduce((acc, f) => acc + Number(f.valor), 0);
        
      // Pendente mês: o que vence no mês e não tá pago
      const pendenteMes = faturasDoMes
        .filter(f => f.status !== 'pago')
        .reduce((acc, f) => acc + Number(f.valor), 0);

      // Atrasado: (Vencimento < Hoje E Não Pago) -> ISSO independe do mês selecionado se queremos alertar
      // Mas se estamos navegando no passado, "atrasado" é relativo?
      // Vamos manter o conceito absoluto de atraso (vencido e não pago).
      // O hook traz (Mes Selecionado) + (Atrasados Antigos).
      // Se atrasado antigo está pago (não deve vir na query), ok.
      // Entao todos faturasAtrasadasAntigas são atrasadas.
      // E das faturasDoMes, as que vencimento < hoje e status != pago também são atrasadas.
      
      const atrasadoAntigoVal = faturasAtrasadasAntigas.reduce((acc, f) => acc + Number(f.valor), 0);
      
      const atrasadoMesVal = faturasDoMes
         .filter(f => f.status !== 'pago' && f.vencimento < hojeStr)
         .reduce((acc, f) => acc + Number(f.valor), 0);
      
      const totalAtrasado = atrasadoAntigoVal + atrasadoMesVal;

      // Folha de pagamento (salários + 46% encargos)
      const folhaPagamento = colaboradoresComSalario.reduce((acc, c) => {
        const salario = Number(c.salario_base);
        return acc + salario + Math.round(salario * 0.46) + 450;
      }, 0);

      return {
        totalFaturasMes: totalFaturasMes + folhaPagamento,
        pagoMes,
        pendenteMes: pendenteMes + folhaPagamento, // Folha conta como pendente se não tiver lógica de baixa
        atrasadoMes: totalAtrasado,
        folhaPagamento,
        contasFixas: totalFaturasMes,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para marcar fatura como paga
 */
export function useMarcarPago() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ faturaId, valorPago, dataPagamento, comprovanteUrl, observacoes }: { 
      faturaId: string; 
      valorPago: number; 
      dataPagamento: Date;
      comprovanteUrl?: string;
      observacoes?: string;
    }) => {
      const { error } = await supabase
        .from('contas_pagar')
        .update({
          status: 'pago',
          data_pagamento: dataPagamento.toISOString().split('T')[0],
          valor: valorPago, // Update value if changed? Assuming yes
          comprovante_url: comprovanteUrl,
          observacoes: observacoes
        })
        .eq('id', faturaId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Pagamento registrado!');
      queryClient.invalidateQueries({ queryKey: ['faturas-recorrentes'] });
      queryClient.invalidateQueries({ queryKey: ['faturas-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['financeiro-dashboard'] });
    },
    onError: (error) => {
      toast.error(`Erro ao registrar pagamento: ${error.message}`);
    },
  });
}

/**
 * Hook para criar nova despesa
 */
export function useCreateDespesa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados: {
      descricao: string;
      fornecedor: string;
      valor: number;
      categoria: string;
      recorrencia: 'MENSAL' | 'SEMANAL' | 'ANUAL' | 'UNICA';
      vencimentoData?: Date;
      diaVencimento?: number;
      centroCustoId?: string;
      parcelar?: boolean;
      numeroParcelas?: number;
    }) => {
      const {
        descricao,
        fornecedor,
        valor,
        categoria,
        recorrencia,
        vencimentoData,
        diaVencimento,
        centroCustoId,
        parcelar,
        numeroParcelas
      } = dados;

      // Tratamento de CC ID
      const ccId = centroCustoId && centroCustoId.length > 0 ? centroCustoId : null;

      // CASO 1: Recorrência Única
      if (recorrencia === 'UNICA') {
        const dataBase = vencimentoData || new Date();
        
        // Parcelamento
        if (parcelar && numeroParcelas && numeroParcelas > 1) {
          const valorParcela = Math.floor((valor / numeroParcelas) * 100) / 100;
          const diferenca = Math.round((valor - (valorParcela * numeroParcelas)) * 100) / 100;
          
          const parcelas = [];
          
          for (let i = 0; i < numeroParcelas; i++) {
            const vencimento = new Date(dataBase);
            vencimento.setMonth(vencimento.getMonth() + i);
            
            // Ajuste na última parcela para centavos
            const valorFinal = i === numeroParcelas - 1 ? valorParcela + diferenca : valorParcela;

            parcelas.push({
              descricao: `${descricao} (${i + 1}/${numeroParcelas})`,
              favorecido_fornecedor: fornecedor,
              valor: valorFinal,
              categoria,
              vencimento: vencimento.toISOString().split('T')[0],
              status: 'em_aberto',
              cc_id: ccId,
              recorrente: false,
              forma_pagamento: 'boleto',
              tipo: 'variavel', // Única/Parcelada = variavel
            });
          }

          const { error } = await supabase.from('contas_pagar').insert(parcelas);
          if (error) throw error;

        } else {
          // Despesa Única Simples
          const { error } = await supabase.from('contas_pagar').insert({
            descricao,
            favorecido_fornecedor: fornecedor,
            valor,
            categoria,
            vencimento: dataBase.toISOString().split('T')[0],
            status: 'em_aberto',
            cc_id: ccId,
            recorrente: false,
            forma_pagamento: 'boleto',
            tipo: 'variavel', // Única = variavel
          });
          if (error) throw error;
        }

      } else {
        // CASO 2: Recorrência Periódica (Mensal, Semanal, Anual)
        // Calcular próximo vencimento baseado no dia
        const hoje = new Date();
        let proximoVencimento = new Date();
        const diaTarget = diaVencimento || 5;

        proximoVencimento.setDate(diaTarget);
        
        // Se o dia já passou neste mês, joga para o próximo
        if (proximoVencimento < hoje) {
           proximoVencimento.setMonth(proximoVencimento.getMonth() + 1);
        }

        // Map recorrencia to valid DB values
        const frequenciaMap: Record<string, string> = {
          'mensal': 'mensal',
          'semanal': 'semanal',
          'anual': 'mensal', // Anual é tratado como mensal no DB
        };
        const frequenciaDB = frequenciaMap[recorrencia.toLowerCase()] || 'mensal';

        const { error } = await supabase.from('contas_pagar').insert({
          descricao,
          favorecido_fornecedor: fornecedor,
          valor,
          categoria,
          vencimento: proximoVencimento.toISOString().split('T')[0],
          status: 'em_aberto',
          cc_id: ccId,
          recorrente: true,
          recorrencia_frequencia: frequenciaDB,
          forma_pagamento: 'boleto',
          tipo: 'fixa', // Mensal/Semanal/Anual = fixa
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Despesa salva com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['faturas-recorrentes'] });
      queryClient.invalidateQueries({ queryKey: ['faturas-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['financeiro-dashboard'] });
    },
    onError: (error) => {
      logger.error('Erro ao salvar despesa:', error);
      toast.error('Erro ao salvar despesa. Verifique os dados.');
    },
  });
}
