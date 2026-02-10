/**
 * use-registros-financeiros.ts
 *
 * Hooks para buscar Despesas (contas_pagar) e Receitas (contas_receber)
 * pendentes para vincular na conciliação bancária.
 *
 * @example
 * ```tsx
 * const { data: registros } = useRegistrosFinanceirosPendentes('pagar');
 * const { data: sugestoes } = useSugestoesConciliacao(17755.21, '2026-01-31', 'pagar');
 * ```
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/utils/logger';

// ============================================================
// TYPES
// ============================================================

export interface RegistroFinanceiro {
  id: string;
  tipo: 'pagar' | 'receber';
  descricao: string;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'pago' | 'recebido' | 'atrasado' | 'parcial';
  cc_id: string | null;
  cc_nome: string | null;
  categoria_id: string | null;
  categoria_nome: string | null;
  setor_id: string | null;
  setor_nome: string | null;
  fornecedor?: string;
  cliente_nome?: string;
  contrato_id?: string;
  // Match scoring
  matchScore?: number;
  matchReason?: string;
}

export interface SugestaoVinculo extends RegistroFinanceiro {
  matchScore: number;
  matchReason: string;
}

// ============================================================
// HOOKS
// ============================================================

/**
 * Hook para listar registros financeiros pendentes
 * @param tipo - 'pagar' para despesas, 'receber' para receitas
 */
export function useRegistrosFinanceirosPendentes(tipo: 'pagar' | 'receber') {
  return useQuery({
    queryKey: ['registros-financeiros-pendentes', tipo],
    queryFn: async (): Promise<RegistroFinanceiro[]> => {
      const tabela = tipo === 'pagar' ? 'contas_pagar' : 'contas_receber';

      // contas_pagar NÃO tem setor_id - apenas categoria_id e cc_id
      const selectFields = tipo === 'pagar'
        ? `id, descricao, valor, vencimento, status, cc_id, centro_custo:centros_custo(nome), categoria_id, categoria:categorias_financeiras(nome), favorecido_fornecedor`
        : `id, parcela, valor_previsto, vencimento, status, cc_id, centro_custo:centros_custo(nome), categoria_id, categoria:categorias_financeiras(nome), cliente:clientes(nome_razao_social)`;

      const { data, error } = await supabase
        .from(tabela)
        .select(selectFields)
        .in('status', tipo === 'pagar' 
          ? ['pendente', 'atrasado', 'parcial'] 
          : ['em_aberto', 'inadimplente'])
        .order('vencimento', { ascending: true })
        .limit(100);

      if (error) {
        logger.error(`Erro ao buscar ${tabela}:`, error);
        throw error;
      }

      return (data || []).map((item: Record<string, unknown>) => ({
        id: item.id as string,
        tipo,
        descricao: (tipo === 'pagar' ? item.descricao : item.parcela) as string,
        valor: (tipo === 'pagar' ? item.valor : item.valor_previsto) as number,
        vencimento: item.vencimento as string,
        status: item.status as RegistroFinanceiro['status'],
        cc_id: item.cc_id as string | null,
        cc_nome: (item.centro_custo as { nome?: string } | null)?.nome || null,
        categoria_id: item.categoria_id as string | null,
        categoria_nome: (item.categoria as { nome?: string } | null)?.nome || null,
        setor_id: null,
        setor_nome: null,
        fornecedor: (item.favorecido_fornecedor as string) || undefined,
        cliente_nome: (item.cliente as { nome_razao_social?: string } | null)?.nome_razao_social,
      }));
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para buscar sugestões de vinculação baseado em valor e data
 * @param valor - Valor do lançamento bancário
 * @param data - Data do lançamento bancário (YYYY-MM-DD)
 * @param tipo - 'pagar' ou 'receber'
 */
export function useSugestoesConciliacao(
  valor: number,
  data: string,
  tipo: 'pagar' | 'receber',
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['sugestoes-conciliacao', tipo, valor, data],
    queryFn: async (): Promise<SugestaoVinculo[]> => {
      const tabela = tipo === 'pagar' ? 'contas_pagar' : 'contas_receber';

      // Buscar registros pendentes com valor próximo (±10%)
      const margemValor = valor * 0.1;
      const valorMin = valor - margemValor;
      const valorMax = valor + margemValor;

      // Buscar vencimentos ±7 dias
      const dataBase = new Date(data);
      const dataMin = new Date(dataBase);
      dataMin.setDate(dataMin.getDate() - 7);
      const dataMax = new Date(dataBase);
      dataMax.setDate(dataMax.getDate() + 7);

      // contas_pagar NÃO tem setor_id
      const selectFields = tipo === 'pagar'
        ? `id, descricao, valor, vencimento, status, cc_id, centro_custo:centros_custo(nome), categoria_id, categoria:categorias_financeiras(nome), favorecido_fornecedor`
        : `id, parcela, valor_previsto, vencimento, status, cc_id, centro_custo:centros_custo(nome), categoria_id, categoria:categorias_financeiras(nome), cliente:clientes(nome_razao_social)`;

      const { data: registros, error } = await supabase
        .from(tabela)
        .select(selectFields)
        .in('status', tipo === 'pagar' 
          ? ['pendente', 'atrasado', 'parcial'] 
          : ['em_aberto', 'inadimplente'])
        .gte(tipo === 'pagar' ? 'valor' : 'valor_previsto', valorMin)
        .lte(tipo === 'pagar' ? 'valor' : 'valor_previsto', valorMax)
        .gte('vencimento', dataMin.toISOString().split('T')[0])
        .lte('vencimento', dataMax.toISOString().split('T')[0])
        .order('vencimento', { ascending: true })
        .limit(10);

      if (error) {
        logger.error('Erro ao buscar sugestões:', error);
        throw error;
      }

      // Calcular score de match
      return (registros || []).map((item: Record<string, unknown>) => {
        // Match por valor (0-50 pontos)
        const itemValor = item.valor as number;
        const diffValor = Math.abs(itemValor - valor);
        const percDiffValor = (diffValor / valor) * 100;
        const scoreValor = Math.max(0, 50 - percDiffValor * 5);

        // Match por data (0-50 pontos)
        const itemData = new Date(item.vencimento as string);
        const diffDias = Math.abs(Math.ceil((dataBase.getTime() - itemData.getTime()) / (1000 * 60 * 60 * 24)));
        const scoreData = Math.max(0, 50 - diffDias * 7);

        const matchScore = Math.round(scoreValor + scoreData);

        // Gerar motivo do match
        let matchReason = '';
        if (itemValor === valor) {
          matchReason = 'Valor exato';
        } else if (percDiffValor <= 1) {
          matchReason = `Valor ~${percDiffValor.toFixed(1)}% diferente`;
        } else {
          matchReason = `Valor ${percDiffValor.toFixed(0)}% diferente`;
        }

        if (diffDias === 0) {
          matchReason += ', mesma data';
        } else if (diffDias <= 3) {
          matchReason += `, ${diffDias}d diferença`;
        }

        return {
          id: item.id as string,
          tipo,
          descricao: (tipo === 'pagar' ? item.descricao : item.parcela) as string,
          valor: itemValor,
          vencimento: item.vencimento as string,
          status: item.status as RegistroFinanceiro['status'],
          cc_id: item.cc_id as string | null,
          cc_nome: (item.centro_custo as { nome?: string } | null)?.nome || null,
          categoria_id: item.categoria_id as string | null,
          categoria_nome: (item.categoria as { nome?: string } | null)?.nome || null,
          setor_id: null, // contas_pagar não tem setor_id
          setor_nome: null,
          fornecedor: (item.favorecido_fornecedor as string) || undefined,
          cliente_nome: (item.cliente as { nome_razao_social?: string } | null)?.nome_razao_social,
          matchScore,
          matchReason,
        };
      }).sort((a: SugestaoVinculo, b: SugestaoVinculo) => b.matchScore - a.matchScore);
    },
    enabled: enabled && valor > 0,
    staleTime: 1000 * 60, // 1 minuto
  });
}

/**
 * Hook para vincular lançamento bancário a conta existente
 */
export function useVincularLancamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lancamentoId,
      contaPagarId,
      contaReceberId,
      valorParcial,
    }: {
      lancamentoId: string;
      contaPagarId?: string;
      contaReceberId?: string;
      valorParcial?: number;
    }) => {
      // Atualizar lançamento bancário
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      const updateData: Record<string, any> = {
        status: 'conciliado',
        conciliado_em: new Date().toISOString(),
        classificado_em: new Date().toISOString(),
        classificado_por_id: userId,
      };

      if (contaPagarId) {
        updateData.conta_pagar_id = contaPagarId;
      }
      if (contaReceberId) {
        updateData.conta_receber_id = contaReceberId;
      }

      const { error: lancError } = await supabase
        .from('lancamentos_bancarios')
        .update(updateData)
        .eq('id', lancamentoId);

      if (lancError) {
        logger.error('Erro ao vincular lançamento:', lancError);
        throw lancError;
      }

      // Se valor parcial, atualizar status da conta para 'parcial'
      if (valorParcial) {
        const tabela = contaPagarId ? 'contas_pagar' : 'contas_receber';
        const contaId = contaPagarId || contaReceberId;

        const { error: contaError } = await supabase
          .from(tabela)
          .update({ status: 'parcial' })
          .eq('id', contaId);

        if (contaError) {
          logger.error('Erro ao atualizar status da conta:', contaError);
          // Não throw aqui, pois o vínculo já foi feito
        }
      } else {
        // Marcar conta como paga/recebida
        const tabela = contaPagarId ? 'contas_pagar' : 'contas_receber';
        const contaId = contaPagarId || contaReceberId;
        const statusFinal = contaPagarId ? 'pago' : 'conciliado';

        const { error: contaError } = await supabase
          .from(tabela)
          .update({ 
            status: statusFinal,
            data_pagamento: new Date().toISOString().split('T')[0]
          })
          .eq('id', contaId);

        if (contaError) {
          logger.error('Erro ao atualizar status da conta:', contaError);
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['lancamentos-bancarios'] });
      queryClient.invalidateQueries({ queryKey: ['registros-financeiros-pendentes'] });
      queryClient.invalidateQueries({ queryKey: ['sugestoes-conciliacao'] });
      queryClient.invalidateQueries({ queryKey: ['faturas-recorrentes'] });
      queryClient.invalidateQueries({ queryKey: ['receitas-recorrentes'] });
    },
  });
}
