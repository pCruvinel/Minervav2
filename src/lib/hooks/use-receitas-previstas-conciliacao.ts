/**
 * use-receitas-previstas-conciliacao.ts
 *
 * Hook e funções puras para listar receitas previstas (contas_receber)
 * pendentes para uso na conciliação bancária de Entradas.
 *
 * @example
 * ```tsx
 * const { data: receitas } = useReceitasPrevistasConciliacao();
 * const filtradas = filtrarReceitasPorBusca(receitas, 'Solar');
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';

// ============================================================
// TYPES
// ============================================================

export interface ReceitaPrevistaConciliacao {
  id: string;
  descricaoFormatada: string;
  valor_previsto: number;
  valor_recebido: number;
  vencimento: string;
  status: string;
  dias_atraso: number;
  cliente_nome: string | undefined;
  cc_nome: string | null;
  cc_id: string | null;
  parcela_num: number;
  total_parcelas: number;
  contrato_id: string | null;
}

// ============================================================
// PURE FUNCTIONS (testable without Supabase)
// ============================================================

/**
 * Formata a descrição de uma parcela para exibição.
 * Exemplo: "Parcela 3 de 10 — Solar Engenharia"
 */
export function formatarDescricaoParcela(
  parcelaNum: number,
  totalParcelas: number,
  clienteNome?: string,
): string {
  const base = `Parcela ${parcelaNum} de ${totalParcelas}`;
  if (clienteNome && clienteNome.trim().length > 0) {
    return `${base} — ${clienteNome}`;
  }
  return base;
}

/**
 * Filtra receitas previstas por termo de busca.
 * Busca em cliente_nome, cc_nome e descricaoFormatada.
 */
export function filtrarReceitasPorBusca(
  receitas: ReceitaPrevistaConciliacao[],
  searchTerm: string,
): ReceitaPrevistaConciliacao[] {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return receitas;
  }
  const term = searchTerm.toLowerCase();
  return receitas.filter((r) => {
    const clienteMatch = r.cliente_nome?.toLowerCase().includes(term) ?? false;
    const ccMatch = r.cc_nome?.toLowerCase().includes(term) ?? false;
    const descMatch = r.descricaoFormatada.toLowerCase().includes(term);
    return clienteMatch || ccMatch || descMatch;
  });
}

/**
 * Calcula quantos dias de atraso uma parcela tem.
 * Retorna 0 se ainda não venceu.
 */
export function calcularDiasAtraso(vencimento: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const vencDate = new Date(vencimento + 'T00:00:00');
  const diffMs = hoje.getTime() - vencDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

// ============================================================
// HOOK
// ============================================================

/**
 * Hook para listar receitas previstas pendentes para conciliação de Entradas.
 * Busca contas_receber com status pendente, formata com descrição amigável.
 */
export function useReceitasPrevistasConciliacao(enabled: boolean = true) {
  return useQuery({
    queryKey: ['receitas-previstas-conciliacao'],
    queryFn: async (): Promise<ReceitaPrevistaConciliacao[]> => {
      const { data, error } = await supabase
        .from('contas_receber')
        .select(`
          id,
          cliente_id,
          parcela,
          parcela_num,
          total_parcelas,
          valor_previsto,
          valor_recebido,
          vencimento,
          status,
          cc_id,
          contrato_id,
          clientes!inner ( nome_razao_social ),
          centro_custo:centros_custo ( nome )
        `)
        .in('status', ['em_aberto', 'inadimplente', 'parcial', 'pendente'])
        .order('vencimento', { ascending: true })
        .limit(100);

      if (error) throw error;

      return (data || []).map((item: Record<string, unknown>) => {
        const clienteData = item.clientes as { nome_razao_social?: string } | null;
        const ccData = item.centro_custo as { nome?: string } | null;
        const clienteNome = clienteData?.nome_razao_social;
        const parcelaNum = item.parcela_num as number;
        const totalParcelas = item.total_parcelas as number;

        return {
          id: item.id as string,
          descricaoFormatada: formatarDescricaoParcela(parcelaNum, totalParcelas, clienteNome),
          valor_previsto: Number(item.valor_previsto),
          valor_recebido: Number(item.valor_recebido || 0),
          vencimento: item.vencimento as string,
          status: item.status as string,
          dias_atraso: calcularDiasAtraso(item.vencimento as string),
          cliente_nome: clienteNome,
          cc_nome: ccData?.nome || null,
          cc_id: item.cc_id as string | null,
          parcela_num: parcelaNum,
          total_parcelas: totalParcelas,
          contrato_id: item.contrato_id as string | null,
        };
      });
    },
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}
