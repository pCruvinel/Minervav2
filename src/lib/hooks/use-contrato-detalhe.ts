/**
 * Hook para detalhes de um contrato específico
 *
 * Busca dados completos do contrato com joins para:
 * - Cliente (nome_razao_social, cpf_cnpj)
 * - OS (codigo_os)
 * - Centro de Custo (nome)
 * - Faturas vinculadas (todas)
 *
 * Inclui mutation para gerar faturas a partir do contrato.
 *
 * @example
 * ```tsx
 * const { contrato, faturas, gerarFatura, isLoading } = useContratoDetalhe(contratoId);
 * ```
 */

import { supabase } from '@/lib/supabase-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/utils/logger';
import type { ContratoTipo, ContratoStatus } from './use-contratos';

// ===========================================
// TIPOS E INTERFACES
// ===========================================

export type FaturaStatus = 'pendente' | 'vencida' | 'pago' | 'recebido' | 'conciliado' | 'cancelado';

export interface FaturaItem {
  id: string;
  numero_fatura: string;
  parcela_num: number;
  parcela_descricao: string | null;
  valor_original: number;
  valor_juros: number;
  valor_multa: number;
  valor_desconto: number;
  valor_final: number | null;
  vencimento: string;
  data_pagamento: string | null;
  status: FaturaStatus;
  url_boleto: string | null;
  pix_copia_cola: string | null;
  observacoes: string | null;
  notificacao_enviada: boolean;
  created_at: string;
}

export interface ContratoDetalhe {
  id: string;
  numero_contrato: string;
  cliente_id: string;
  cliente_nome: string;
  cliente_cpf_cnpj: string | null;
  os_id: string | null;
  os_codigo: string | null;
  cc_id: string | null;
  cc_nome: string | null;
  tipo: ContratoTipo;
  valor_total: number;
  valor_mensal: number | null;
  valor_entrada: number;
  parcelas_total: number;
  data_inicio: string;
  data_fim: string | null;
  dia_vencimento: number;
  status: ContratoStatus;
  condicoes_pagamento: Record<string, unknown> | null;
  observacoes: string | null;
  arquivo_url: string | null;
  signature_hash: string | null;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContratoDetalheResumo {
  totalFaturado: number;
  totalPago: number;
  totalPendente: number;
  totalVencido: number;
  qtdFaturas: number;
  percentualPago: number;
}

// ===========================================
// FETCH FUNCTIONS
// ===========================================

const fetchContratoDetalhe = async (contratoId: string): Promise<ContratoDetalhe> => {
  logger.log('📋 Buscando detalhes do contrato:', contratoId);

  const { data, error } = await supabase
    .from('contratos')
    .select(`
      id,
      numero_contrato,
      cliente_id,
      os_id,
      cc_id,
      tipo,
      valor_total,
      valor_mensal,
      valor_entrada,
      parcelas_total,
      data_inicio,
      data_fim,
      dia_vencimento,
      status,
      condicoes_pagamento,
      observacoes,
      arquivo_url,
      signature_hash,
      signed_at,
      created_at,
      updated_at,
      clientes!contratos_cliente_id_fkey(nome_razao_social, cpf_cnpj),
      ordens_servico!contratos_os_id_fkey(codigo_os),
      centros_custo!contratos_cc_id_fkey(nome)
    `)
    .eq('id', contratoId)
    .single();

  if (error) {
    logger.error('❌ Erro ao buscar contrato:', error);
    throw error;
  }

  const c = data as any;
  return {
    id: c.id,
    numero_contrato: c.numero_contrato,
    cliente_id: c.cliente_id,
    cliente_nome: c.clientes?.nome_razao_social || 'Cliente não encontrado',
    cliente_cpf_cnpj: c.clientes?.cpf_cnpj || null,
    os_id: c.os_id,
    os_codigo: c.ordens_servico?.codigo_os || null,
    cc_id: c.cc_id,
    cc_nome: c.centros_custo?.nome || null,
    tipo: c.tipo,
    valor_total: c.valor_total || 0,
    valor_mensal: c.valor_mensal,
    valor_entrada: c.valor_entrada || 0,
    parcelas_total: c.parcelas_total || 1,
    data_inicio: c.data_inicio,
    data_fim: c.data_fim,
    dia_vencimento: c.dia_vencimento || 5,
    status: c.status,
    condicoes_pagamento: c.condicoes_pagamento,
    observacoes: c.observacoes,
    arquivo_url: c.arquivo_url,
    signature_hash: c.signature_hash,
    signed_at: c.signed_at,
    created_at: c.created_at,
    updated_at: c.updated_at,
  };
};

const fetchFaturasPorContrato = async (contratoId: string): Promise<FaturaItem[]> => {
  logger.log('💰 Buscando faturas do contrato:', contratoId);

  const { data, error } = await supabase
    .from('faturas')
    .select(`
      id,
      numero_fatura,
      parcela_num,
      parcela_descricao,
      valor_original,
      valor_juros,
      valor_multa,
      valor_desconto,
      valor_final,
      vencimento,
      data_pagamento,
      status,
      url_boleto,
      pix_copia_cola,
      observacoes,
      notificacao_enviada,
      created_at
    `)
    .eq('contrato_id', contratoId)
    .order('parcela_num', { ascending: true });

  if (error) {
    logger.error('❌ Erro ao buscar faturas:', error);
    throw error;
  }

  return (data || []).map((f: any) => ({
    id: f.id,
    numero_fatura: f.numero_fatura,
    parcela_num: f.parcela_num,
    parcela_descricao: f.parcela_descricao,
    valor_original: f.valor_original || 0,
    valor_juros: f.valor_juros || 0,
    valor_multa: f.valor_multa || 0,
    valor_desconto: f.valor_desconto || 0,
    valor_final: f.valor_final,
    vencimento: f.vencimento,
    data_pagamento: f.data_pagamento,
    status: f.status,
    url_boleto: f.url_boleto,
    pix_copia_cola: f.pix_copia_cola,
    observacoes: f.observacoes,
    notificacao_enviada: f.notificacao_enviada || false,
    created_at: f.created_at,
  }));
};

/**
 * Calcula resumo financeiro das faturas
 */
const calculateResumo = (faturas: FaturaItem[]): ContratoDetalheResumo => {
  const ativas = faturas.filter(f => f.status !== 'cancelado');

  const totalFaturado = ativas.reduce((sum, f) => sum + f.valor_original, 0);
  const totalPago = ativas
    .filter(f => ['pago', 'recebido', 'conciliado'].includes(f.status))
    .reduce((sum, f) => sum + (f.valor_final ?? f.valor_original), 0);
  const totalPendente = ativas
    .filter(f => f.status === 'pendente')
    .reduce((sum, f) => sum + f.valor_original, 0);
  const totalVencido = ativas
    .filter(f => f.status === 'vencida')
    .reduce((sum, f) => sum + f.valor_original, 0);

  return {
    totalFaturado,
    totalPago,
    totalPendente,
    totalVencido,
    qtdFaturas: ativas.length,
    percentualPago: totalFaturado > 0 ? Math.round((totalPago / totalFaturado) * 100) : 0,
  };
};

// ===========================================
// GERAR FATURA MUTATION
// ===========================================

interface GerarFaturaInput {
  contratoId: string;
  clienteId: string;
  parcelaNum: number;
  valorOriginal: number;
  vencimento: string; // YYYY-MM-DD
  descricao?: string;
}

const gerarFaturaFn = async (input: GerarFaturaInput): Promise<FaturaItem> => {
  logger.log('📝 Gerando fatura:', input);

  // Gerar número da fatura: FAT-{ano}{mes}-{parcela}
  const now = new Date();
  const numero = `FAT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(input.parcelaNum).padStart(3, '0')}`;

  const { data, error } = await supabase
    .from('faturas')
    .insert({
      contrato_id: input.contratoId,
      cliente_id: input.clienteId,
      numero_fatura: numero,
      parcela_num: input.parcelaNum,
      parcela_descricao: input.descricao || `Parcela ${input.parcelaNum}`,
      valor_original: input.valorOriginal,
      vencimento: input.vencimento,
      status: 'pendente',
    })
    .select()
    .single();

  if (error) {
    logger.error('❌ Erro ao gerar fatura:', error);
    throw error;
  }

  return data as FaturaItem;
};

// ===========================================
// HOOK PRINCIPAL
// ===========================================

export function useContratoDetalhe(contratoId: string) {
  const queryClient = useQueryClient();

  // Query: contrato
  const contratoQuery = useQuery({
    queryKey: ['contrato', contratoId],
    queryFn: () => fetchContratoDetalhe(contratoId),
    enabled: !!contratoId,
    staleTime: 2 * 60 * 1000,
  });

  // Query: faturas
  const faturasQuery = useQuery({
    queryKey: ['contrato-faturas', contratoId],
    queryFn: () => fetchFaturasPorContrato(contratoId),
    enabled: !!contratoId,
    staleTime: 60 * 1000,
  });

  // Mutation: gerar fatura
  const gerarFaturaMutation = useMutation({
    mutationFn: gerarFaturaFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contrato-faturas', contratoId] });
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
    },
  });

  const faturas = faturasQuery.data || [];
  const resumo = calculateResumo(faturas);

  return {
    // Dados
    contrato: contratoQuery.data || null,
    faturas,
    resumo,

    // Estado
    isLoading: contratoQuery.isLoading || faturasQuery.isLoading,
    isLoadingContrato: contratoQuery.isLoading,
    isLoadingFaturas: faturasQuery.isLoading,
    error: contratoQuery.error || faturasQuery.error,

    // Ações
    gerarFatura: gerarFaturaMutation.mutateAsync,
    isGerandoFatura: gerarFaturaMutation.isPending,
    refetch: () => {
      contratoQuery.refetch();
      faturasQuery.refetch();
    },
  };
}

// ===========================================
// FATURA HELPERS
// ===========================================

export const FATURA_STATUS_LABELS: Record<FaturaStatus, string> = {
  pendente: 'Pendente',
  vencida: 'Vencida',
  pago: 'Pago',
  recebido: 'Recebido',
  conciliado: 'Conciliado',
  cancelado: 'Cancelado',
};

export const FATURA_STATUS_COLORS: Record<FaturaStatus, string> = {
  pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  vencida: 'bg-red-100 text-red-800 border-red-200',
  pago: 'bg-green-100 text-green-800 border-green-200',
  recebido: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  conciliado: 'bg-blue-100 text-blue-800 border-blue-200',
  cancelado: 'bg-gray-100 text-gray-600 border-gray-200',
};
