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
          .from('contas_receber')
          .select('*', { count: 'exact', head: true })
          .eq('contrato_id', contrato.id)
          .eq('status', 'pago');

        const clienteData = contrato.clientes as { id: string; nome_razao_social: string } | null;
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
          .from('contas_receber')
          .select('*', { count: 'exact', head: true })
          .eq('contrato_id', contrato.id)
          .lt('vencimento', hoje.toISOString().split('T')[0])
          .in('status', ['em_aberto', 'pendente']);

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
        .from('contas_receber')
        .select(`
          id,
          cliente_id,
          contrato_id,
          os_id,
          cc_id,
          parcela,
          valor_previsto,
          valor_recebido,
          vencimento,
          status,
          parcela_num,
          total_parcelas,
          clientes!inner (
            nome_razao_social
          )
        `)
        .in('status', ['em_aberto', 'pendente', 'parcial'])
        .order('vencimento', { ascending: true })
        .limit(50);

      if (error) throw error;

      return (data || []).map((item) => {
        const vencDate = new Date(item.vencimento);
        const hojeDate = new Date(hoje);
        const diffTime = hojeDate.getTime() - vencDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const clienteData = item.clientes as { nome_razao_social: string } | null;

        return {
          id: item.id,
          cliente_id: item.cliente_id,
          cliente_nome: clienteData?.nome_razao_social ?? 'Cliente',
          contrato_id: item.contrato_id,
          os_id: item.os_id,
          cc_id: item.cc_id,
          descricao: item.parcela || 'Parcela',
          valor_previsto: Number(item.valor_previsto),
          valor_recebido: Number(item.valor_recebido || 0),
          vencimento: item.vencimento,
          status: item.status,
          dias_atraso: diffDays > 0 ? diffDays : 0,
          parcela_num: item.parcela_num,
          total_parcelas: item.total_parcelas,
        };
      });
    },
    staleTime: 2 * 60 * 1000,
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

      // Receitas do mês
      const { data: receitasMes } = await supabase
        .from('contas_receber')
        .select('valor_previsto, valor_recebido, status')
        .gte('vencimento', firstDayOfMonth)
        .lte('vencimento', lastDayOfMonth);

      // Contratos ativos
      const { count: contratosAtivos } = await supabase
        .from('contratos')
        .select('*', { count: 'exact', head: true })
        .in('status', ['ativo', 'em_andamento']);

      const totalReceitasMes = receitasMes?.reduce((acc, r) => acc + Number(r.valor_previsto || 0), 0) ?? 0;
      const recebidoMes = receitasMes?.reduce((acc, r) => acc + Number(r.valor_recebido || 0), 0) ?? 0;
      const pendenteMes = receitasMes
        ?.filter(r => r.status !== 'pago')
        .reduce((acc, r) => acc + (Number(r.valor_previsto) - Number(r.valor_recebido || 0)), 0) ?? 0;

      // Valores atrasados
      const { data: atrasados } = await supabase
        .from('contas_receber')
        .select('valor_previsto, valor_recebido')
        .lt('vencimento', hoje.toISOString().split('T')[0])
        .in('status', ['em_aberto', 'pendente']);

      const atrasadoMes = atrasados?.reduce((acc, r) => 
        acc + (Number(r.valor_previsto) - Number(r.valor_recebido || 0)), 0) ?? 0;

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
        .from('contas_receber')
        .update({
          valor_recebido: valorRecebido,
          status: 'pago',
          data_recebimento: new Date().toISOString(),
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
