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
  dia_vencimento: number;
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

export interface DespesaMaster {
  id: string
  descricao: string
  valor: number
  vencimento: string // ISO Date
  status: 'em_aberto' | 'pago' | 'atrasado' | 'cancelado'
  tipo: 'fixa' | 'variavel' | 'salario' | 'imposto'
  categoria_nome: string
  categoria_cor?: string
  favorecido_nome: string
  favorecido_tipo: 'fornecedor' | 'colaborador'
  favorecido_id?: string
  cc_nome: string
  cc_codigo?: never // Deprecated/Removed from DB
  rateio?: any[] // JSONB
  comprovante_url?: string
  is_atrasado: boolean
}

// ============================================================
// HOOKS
// ============================================================

/**
 * Hook Principal do Master Ledger de Despesas
 * Busca unificada com filtros e paginação (futura)
 */
export function useDespesasMasterLedger(filters?: {
  status?: string[], // 'em_aberto', 'atrasado', 'pago'
  categoria_tipo?: string, // 'salario', 'fixa', 'variavel'
  month?: Date | string
}) {
  return useQuery({
    queryKey: ['despesas-master', {
        ...filters,
        month: filters?.month instanceof Date ? filters.month.toISOString() : filters?.month
    }],
    retry: false, // Prevent freeze loops on error
    staleTime: 30000, // 30s cache to prevent fetch loops
    queryFn: async (): Promise<DespesaMaster[]> => {
      console.log('[DEBUG] Fetching Despesas...', filters);
      let query = supabase
        .from('contas_pagar')
        .select(`
          *,
          centros_custo ( nome ),
          favorecido_colaborador:colaboradores!contas_pagar_favorecido_colaborador_id_fkey ( nome_completo ),
          categoria_rel:categorias_financeiras ( nome )
        `)
        .order('vencimento', { ascending: true });

      // Filtro de Status
      if (filters?.status && filters.status.length > 0) {
        if (filters.status.includes('pendente')) {
           query = query.neq('status', 'pago');
        } else {
           // Caso genérico (ex: 'pago', 'cancelado')
           query = query.in('status', filters.status);
        }
      }

      // Filtro de Mês
      if (filters?.month) {
        const date = typeof filters.month === 'string' ? new Date(filters.month) : filters.month;
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
        const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];
        
        // Se filtro status inclui 'pendente', NÃO filtra por mês (busca global)
        if (!filters.status?.includes('pendente')) {
             query = query.gte('vencimento', firstDay).lte('vencimento', lastDay);
        }
      }

      // Filtro de Tipo (Salário, Fixa, Variável)
      // Filtro de Tipo (Salário, Fixa, Variável)
      if (filters?.categoria_tipo) {
         if (filters.categoria_tipo === 'salario') {
             // TODO: Buscar ID da categoria 'Salários' ou filtrar por join
             // Por enquanto, vamos ignorar para não quebrar a query com coluna inexistente
             console.warn('Filtro de Salário temporariamente desabilitado aguardando ID fixo');
         } else if (filters.categoria_tipo === 'fixa') {
             query = query.eq('tipo', 'fixa');
         } else if (filters.categoria_tipo === 'variavel') {
             query = query.eq('tipo', 'variavel');
         }
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Erro ao buscar despesas master:', error);
        throw error;
      }

      const hoje = new Date();
      hoje.setHours(0,0,0,0);

      return (data || []).map((item: any) => {
        // Ajuste de fuso horário simples para comparação de data (vencimento é yyyy-mm-dd)
        const vencimentoStr = item.vencimento; 
        // Comparação de string yyyy-mm-dd funciona bem
        const hojeStr = hoje.toISOString().split('T')[0];
        
        const isAtrasado = item.status !== 'pago' && vencimentoStr < hojeStr;
        
        // Resolver Favorecido
        let favorecidoNome = item.favorecido_fornecedor || 'Desconhecido';
        let favorecidoTipo: 'fornecedor' | 'colaborador' = 'fornecedor';
        let favorecidoId = undefined;

        if (item.favorecido_colaborador) {
            favorecidoNome = item.favorecido_colaborador.nome_completo;
            favorecidoTipo = 'colaborador';
            favorecidoId = item.favorecido_colaborador_id;
        }

        // Resolver Categoria
        const categoriaNome = item.categoria_rel?.nome || item.categoria || 'Sem Categoria';

        // Resolver CC
        const ccNome = item.centros_custo?.nome || 'Sem Centro de Custo';
        const ccCodigo = undefined; // Campo codigo não existe mais no banco

        // Status visual
        let statusVisual: DespesaMaster['status'] = item.status as any;
        if (isAtrasado) statusVisual = 'atrasado';
        if (item.status === 'cancelado') statusVisual = 'cancelado'; 
        // Se status vier do banco diferente, default para o que veio ou em_aberto

        return {
            id: item.id,
            descricao: item.descricao,
            valor: item.valor,
            vencimento: item.vencimento,
            status: statusVisual,
            tipo: item.tipo,
            categoria_nome: categoriaNome,
            categoria_cor: 'gray', // Placeholder, mapear depois
            favorecido_nome: favorecidoNome,
            favorecido_tipo: favorecidoTipo,
            favorecido_id: favorecidoId,
            cc_nome: ccNome,
            cc_codigo: ccCodigo,
            rateio: item.rateio, // JSONB array
            comprovante_url: item.comprovante_url,
            is_atrasado: isAtrasado
        };
      });
    },
     // staleTime: 5 * 60 * 1000 // Removido em favor do 30s lá em cima
  });
}

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
          remuneracao_contratual,
          tipo_contratacao,
          setor,
          tipo_contratacao,
          setor,
          funcao,
          dia_vencimento
        `)
        .eq('ativo', true);

      if (error) {
        logger.error('Erro ao buscar colaboradores:', error);
        throw error;
      }

      // Filtrar manualmente os que tem algum tipo de remuneração > 0
      const colaboradoresComSalario = (colaboradores || []).filter(
        col => {
          const salario = Number(col.salario_base || 0);
          const contrato = Number(col.remuneracao_contratual || 0);
          return salario > 0 || contrato > 0;
        }
      );

      return colaboradoresComSalario.map((col) => {
        // Determinar valor base (prioriza salário base se existir, senão usa remuneração contratual)
        const salarioBase = Number(col.salario_base || 0);
        const remuneracaoContratual = Number(col.remuneracao_contratual || 0);
        
        // Se for CLT, usa salário base. Se for PJ/Contrato, usa remuneração contratual.
        // Se ambos existirem (raro), prioriza lógica baseada no tipo ou o que for maior > 0
        const valorBase = salarioBase > 0 ? salarioBase : remuneracaoContratual;
        
        // Encargos apenas para CLT (aprox 46%)
        // Se tipo_contratacao for nulo, assume CLT se tiver salario_base, senão sem encargos
        const isCLT = col.tipo_contratacao === 'CLT' || (salarioBase > 0 && !col.tipo_contratacao);
        const encargos = isCLT ? Math.round(valorBase * 0.46) : 0;
        
        const beneficios = isCLT ? 450 : 0; // Benefícios padrão apenas para CLT

        return {
          colaborador_id: col.id,
          colaborador_nome: col.nome_completo || 'Colaborador',
          cargo: col.funcao || '-',
          setor: col.setor || '-',
          salario_base: valorBase,
          encargos_estimados: encargos,
          beneficios,
          custo_total: valorBase + encargos + beneficios,
          // Calcula data de pagamento estimada baseado no dia de vencimento (mês atual)
          // Se hoje é dia 20 e vencimento é 5, provavelmente é mês seguinte? 
          // Por simplificação, vamos assumir o dia de vencimento no mês corrente ou próximo 5º dia útil
          data_pagamento: col.dia_vencimento ? col.dia_vencimento.toString() : '5', 
          dia_vencimento: col.dia_vencimento || 5,
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
      queryClient.invalidateQueries({ queryKey: ['despesas-master'] });
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
      vencimentoData: Date; // Agora obrigatório
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
        centroCustoId,
        parcelar,
        numeroParcelas
      } = dados;

      // Tratamento de CC ID
      const ccId = centroCustoId && centroCustoId.length > 0 ? centroCustoId : null;
      
      // Data base é sempre a escolhida pelo usuário
      const dataBase = vencimentoData;

      // CASO 1: Recorrência Única
      if (recorrencia === 'UNICA') {
        
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
              categoria_id: categoria,
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
            categoria_id: categoria,
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
        // Usa a data fornecida como a PRIMEIRA instância.
        // A trigger ou job de recorrência do banco usará o dia desta data para criar as próximas.
        
        // Map recorrencia to valid DB values
        const frequenciaMap: Record<string, string> = {
          'mensal': 'mensal',
          'semanal': 'semanal',
          'anual': 'mensal', // Anual é tratado como mensal no DB
        };
        const frequenciaDB = frequenciaMap[recorrencia.toLowerCase()] || 'mensal';

        // Dia fixo para recorrência
        const diaVencimento = dataBase.getDate();

        const { error } = await supabase.from('contas_pagar').insert({
          descricao,
          favorecido_fornecedor: fornecedor,
          valor,
          categoria_id: categoria,
          vencimento: dataBase.toISOString().split('T')[0], // Primeira data explícita
          status: 'em_aberto',
          cc_id: ccId,
          recorrente: true,
          recorrencia_frequencia: frequenciaDB,
          dia_vencimento: diaVencimento, // Salva o dia para referência futura
          forma_pagamento: 'boleto',
          tipo: 'fixa', // Mensal/Semanal/Anual = fixa
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Despesa salva com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['faturas-recorrentes'] });
      queryClient.invalidateQueries({ queryKey: ['despesas-master'] });
      queryClient.invalidateQueries({ queryKey: ['faturas-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['financeiro-dashboard'] });
    },
    onError: (error) => {
      logger.error('Erro ao salvar despesa:', error);
      toast.error('Erro ao salvar despesa. Verifique os dados.');
    },
  });
}
