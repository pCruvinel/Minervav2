/**
 * use-receitas-recorrentes.ts
 * 
 * Hooks para gerenciar receitas recorrentes de contratos,
 * parcelas pendentes e projeções de faturamento.
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useReceitasRecorrentes();
 * const { data: parcelas } = useParcelasPendentes();
 * ```
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

// ============================================================
// TYPES
// ============================================================

export interface ReceitaRecorrente {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  contrato_id: string;
  contrato_numero: string;
  valor_mensal: number;
  dia_vencimento: number;
  parcelas_pagas: number;
  parcelas_total: number;
  status: 'em_dia' | 'atrasado' | 'parcial';
  proxima_cobranca: string;
}

export interface ParcelaPendente {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  contrato_id: string;
  os_id: string | null;
  cc_id: string | null;
  descricao: string;
  valor_previsto: number;
  valor_recebido: number;
  vencimento: string;
  status: string;
  dias_atraso: number;
  parcela_num: number;
  total_parcelas: number;
}

export interface ReceitasKPIs {
  totalReceitasMes: number;
  recebidoMes: number;
  pendenteMes: number;
  atrasadoMes: number;
  contratosAtivos: number;
  ticketMedio: number;
}

// ============================================================
// HOOKS
// ============================================================

/**
 * Hook para listar contratos ativos com receitas recorrentes
 */
export function useReceitasRecorrentes() {
  return useQuery({
    queryKey: ['receitas-recorrentes'],
    queryFn: async (): Promise<ReceitaRecorrente[]> => {
      // Query contratos ativos com join em clientes
      const { data: contratos, error } = await supabase
        .from('contratos')
        .select(`
          id,
          numero_contrato,
          valor_total,
          parcelas_total,
          dia_vencimento,
          data_inicio,
          data_fim,
          status,
          cliente_id,
          clientes!inner (
            id,
            nome_razao_social
          )
        `)
        .in('status', ['ativo', 'em_andamento'])
        .order('data_inicio', { ascending: false });

      if (error) throw error;

      // Para cada contrato, calcular parcelas pagas
      const receitasPromises = (contratos || []).map(async (contrato) => {
        const { count: parcelasPagas } = await supabase
          .from('faturas')
          .select('*', { count: 'exact', head: true })
          .eq('contrato_id', contrato.id)
          .eq('status', 'pago');

        const clienteData = Array.isArray(contrato.clientes) 
          ? contrato.clientes[0] as unknown as { id: string; nome_razao_social: string }
          : contrato.clientes as unknown as { id: string; nome_razao_social: string } | null;
        const valorMensal = contrato.parcelas_total > 0 
          ? Number(contrato.valor_total) / contrato.parcelas_total 
          : Number(contrato.valor_total);

        // Determinar status
        const hoje = new Date();
        const diaVenc = contrato.dia_vencimento || 5;
        const proximaCobranca = new Date(hoje.getFullYear(), hoje.getMonth(), diaVenc);
        if (proximaCobranca <= hoje) {
          proximaCobranca.setMonth(proximaCobranca.getMonth() + 1);
        }

        let status: 'em_dia' | 'atrasado' | 'parcial' = 'em_dia';
        // Check for overdue payments
        const { count: atrasadas } = await supabase
          .from('faturas')
          .select('*', { count: 'exact', head: true })
          .eq('contrato_id', contrato.id)
          .lt('vencimento', hoje.toISOString().split('T')[0])
          .in('status', ['pendente', 'em_aberto']);

        if ((atrasadas ?? 0) > 0) {
          status = 'atrasado';
        }

        return {
          id: contrato.id,
          cliente_id: clienteData?.id ?? '',
          cliente_nome: clienteData?.nome_razao_social ?? 'Cliente',
          contrato_id: contrato.id,
          contrato_numero: contrato.numero_contrato || `#${contrato.id.slice(0, 8)}`,
          valor_mensal: valorMensal,
          dia_vencimento: diaVenc,
          parcelas_pagas: parcelasPagas ?? 0,
          parcelas_total: contrato.parcelas_total,
          status,
          proxima_cobranca: proximaCobranca.toISOString().split('T')[0],
        };
      });

      return Promise.all(receitasPromises);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para listar parcelas pendentes de recebimento
 */
export function useParcelasPendentes() {
  return useQuery({
    queryKey: ['parcelas-pendentes'],
    queryFn: async (): Promise<ParcelaPendente[]> => {
      const hoje = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('faturas')
        .select(`
          id,
          cliente_id,
          contrato_id,
          parcela_descricao,
          valor_original,
          valor_final,
          vencimento,
          status,
          parcela_num,
          clientes!inner (
            nome_razao_social
          ),
          contratos (
            parcelas_total,
            cc_id
          )
        `)
        .in('status', ['pendente', 'em_aberto', 'parcial'])
        .order('vencimento', { ascending: true })
        .limit(50);

      if (error) throw error;

      return (data || []).map((item) => {
        const vencDate = new Date(item.vencimento);
        const hojeDate = new Date(hoje);
        const diffTime = hojeDate.getTime() - vencDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const clienteData = Array.isArray(item.clientes)
          ? item.clientes[0] as unknown as { nome_razao_social: string } 
          : item.clientes as unknown as { nome_razao_social: string } | null;

        const contratoData = Array.isArray(item.contratos)
          ? item.contratos[0] as unknown as { parcelas_total: number; cc_id: string | null }
          : item.contratos as unknown as { parcelas_total: number; cc_id: string | null } | null;

        return {
          id: item.id,
          cliente_id: item.cliente_id,
          cliente_nome: clienteData?.nome_razao_social ?? 'Cliente',
          contrato_id: item.contrato_id,
          os_id: null,
          cc_id: contratoData?.cc_id ?? null,
          descricao: item.parcela_descricao || 'Parcela',
          valor_previsto: Number(item.valor_original),
          valor_recebido: Number(item.valor_final || 0),
          vencimento: item.vencimento,
          status: item.status,
          dias_atraso: diffDays > 0 ? diffDays : 0,
          parcela_num: item.parcela_num,
          total_parcelas: contratoData?.parcelas_total ?? 0,
        };
      });
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook para listar TODAS as parcelas de um contrato específico
 */
export function useParcelasContrato(contratoId: string) {
  return useQuery({
    queryKey: ['parcelas-contrato', contratoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faturas')
        .select(`
          id,
          parcela_num,
          vencimento,
          valor_original,
          status,
          data_pagamento,
          contrato_id,
          contratos (
            parcelas_total
          )
        `)
        .eq('contrato_id', contratoId)
        .order('parcela_num', { ascending: true });

      if (error) throw error;

      return (data || []).map((item) => {
        const contratoData = Array.isArray(item.contratos)
          ? item.contratos[0] as unknown as { parcelas_total: number }
          : item.contratos as unknown as { parcelas_total: number } | null;

        return {
          id: item.id,
          parcela: `${item.parcela_num}/${contratoData?.parcelas_total ?? '?'}`,
          vencimento: item.vencimento,
          valor: Number(item.valor_original),
          status: item.status,
          dataPagamento: item.data_pagamento,
        };
      });
    },
    enabled: !!contratoId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para KPIs de receitas
 */
export function useReceitasKPIs() {
  return useQuery({
    queryKey: ['receitas-kpis'],
    queryFn: async (): Promise<ReceitasKPIs> => {
      const hoje = new Date();
      const firstDayOfMonth = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
      const lastDayOfMonth = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];

      // Receitas do mês (faturas)
      const { data: receitasMes } = await supabase
        .from('faturas')
        .select('valor_original, valor_final, status')
        .gte('vencimento', firstDayOfMonth)
        .lte('vencimento', lastDayOfMonth);

      // Contratos ativos
      const { count: contratosAtivos } = await supabase
        .from('contratos')
        .select('*', { count: 'exact', head: true })
        .in('status', ['ativo', 'em_andamento']);

      const totalReceitasMes = receitasMes?.reduce((acc, r) => acc + Number(r.valor_original || 0), 0) ?? 0;
      const recebidoMes = receitasMes?.reduce((acc, r) => acc + Number(r.valor_final || 0), 0) ?? 0;
      const pendenteMes = receitasMes
        ?.filter(r => r.status !== 'pago')
        .reduce((acc, r) => acc + (Number(r.valor_original) - Number(r.valor_final || 0)), 0) ?? 0;

      // Valores atrasados
      const { data: atrasados } = await supabase
        .from('faturas')
        .select('valor_original, valor_final')
        .lt('vencimento', hoje.toISOString().split('T')[0])
        .in('status', ['pendente', 'em_aberto']);

      const atrasadoMes = atrasados?.reduce((acc, r) => 
        acc + (Number(r.valor_original) - Number(r.valor_final || 0)), 0) ?? 0;

      return {
        totalReceitasMes,
        recebidoMes,
        pendenteMes,
        atrasadoMes,
        contratosAtivos: contratosAtivos ?? 0,
        ticketMedio: (contratosAtivos ?? 0) > 0 ? totalReceitasMes / contratosAtivos! : 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para marcar parcela como recebida
 */
export function useMarcarRecebido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ parcelaId, valorRecebido }: { parcelaId: string; valorRecebido: number }) => {
      const { error } = await supabase
        .from('faturas')
        .update({
          valor_final: valorRecebido,
          status: 'pago',
          data_pagamento: new Date().toISOString(),
        })
        .eq('id', parcelaId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Recebimento registrado!');
      queryClient.invalidateQueries({ queryKey: ['parcelas-pendentes'] });
      queryClient.invalidateQueries({ queryKey: ['receitas-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['financeiro-dashboard'] });
    },
    onError: (error) => {
      toast.error(`Erro ao registrar recebimento: ${error.message}`);
    },
  });
}
