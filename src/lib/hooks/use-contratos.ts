/**
 * Hook para gerenciamento de contratos (listagem geral)
 *
 * Busca todos os contratos do sistema com joins para:
 * - Cliente (nome_razao_social)
 * - Ordem de Serviço (codigo_os)
 * - Centro de Custo (nome)
 *
 * @example
 * ```tsx
 * const { contratos, summary, isLoading } = useContratos();
 * ```
 */

import { supabase } from '@/lib/supabase-client';
import { useQuery } from '@tanstack/react-query';
import { logger } from '@/lib/utils/logger';

// ===========================================
// TIPOS E INTERFACES
// ===========================================

export type ContratoTipo = 'avulso' | 'recorrente' | 'parceiro' | 'obra';
export type ContratoStatus = 'rascunho' | 'ativo' | 'suspenso' | 'encerrado' | 'cancelado';

export interface ContratoListItem {
  id: string;
  numero_contrato: string;
  cliente_id: string;
  cliente_nome: string;
  tipo: ContratoTipo;
  valor_total: number;
  valor_mensal: number | null;
  data_inicio: string;
  data_fim: string | null;
  status: ContratoStatus;
  os_id: string | null;
  os_codigo: string | null;
  arquivo_url: string | null;
  created_at: string;
}

export interface ContratosSummary {
  totalContratos: number;
  contratosAtivos: number;
  valorTotal: number;
  valorRecorrenteMensal: number;
}

// ===========================================
// LABELS E HELPERS
// ===========================================

export const CONTRATO_TIPO_LABELS: Record<ContratoTipo, string> = {
  avulso: 'Avulso',
  recorrente: 'Recorrente',
  parceiro: 'Parceiro',
  obra: 'Obra',
};

export const CONTRATO_STATUS_LABELS: Record<ContratoStatus, string> = {
  rascunho: 'Rascunho',
  ativo: 'Ativo',
  suspenso: 'Suspenso',
  encerrado: 'Encerrado',
  cancelado: 'Cancelado',
};

export const CONTRATO_TIPO_COLORS: Record<ContratoTipo, string> = {
  avulso: 'bg-gray-100 text-gray-800 border-gray-200',
  recorrente: 'bg-blue-100 text-blue-800 border-blue-200',
  parceiro: 'bg-purple-100 text-purple-800 border-purple-200',
  obra: 'bg-orange-100 text-orange-800 border-orange-200',
};

export const CONTRATO_STATUS_COLORS: Record<ContratoStatus, string> = {
  rascunho: 'bg-gray-100 text-gray-600 border-gray-200',
  ativo: 'bg-green-100 text-green-800 border-green-200',
  suspenso: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  encerrado: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelado: 'bg-red-100 text-red-800 border-red-200',
};

// ===========================================
// QUERIES
// ===========================================

/**
 * Busca todos os contratos com joins
 */
const fetchContratos = async (): Promise<ContratoListItem[]> => {
  logger.log('📋 Buscando todos os contratos...');

  const { data, error } = await supabase
    .from('contratos')
    .select(`
      id,
      numero_contrato,
      cliente_id,
      tipo,
      valor_total,
      valor_mensal,
      data_inicio,
      data_fim,
      status,
      os_id,
      arquivo_url,
      created_at,
      clientes!contratos_cliente_id_fkey(nome_razao_social),
      ordens_servico!contratos_os_id_fkey(codigo_os)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('❌ Erro ao buscar contratos:', error);
    throw error;
  }

  return (data || []).map((contrato: any) => ({
    id: contrato.id,
    numero_contrato: contrato.numero_contrato,
    cliente_id: contrato.cliente_id,
    cliente_nome: contrato.clientes?.nome_razao_social || 'Cliente não encontrado',
    tipo: contrato.tipo,
    valor_total: contrato.valor_total || 0,
    valor_mensal: contrato.valor_mensal,
    data_inicio: contrato.data_inicio,
    data_fim: contrato.data_fim,
    status: contrato.status,
    os_id: contrato.os_id,
    os_codigo: contrato.ordens_servico?.codigo_os || null,
    arquivo_url: contrato.arquivo_url,
    created_at: contrato.created_at,
  }));
};

/**
 * Calcula o resumo dos contratos
 */
const calculateSummary = (contratos: ContratoListItem[]): ContratosSummary => {
  const ativos = contratos.filter(c => c.status === 'ativo');

  // Soma valor mensal apenas dos contratos recorrentes ativos
  const valorRecorrenteMensal = ativos
    .filter(c => c.tipo === 'recorrente' && c.valor_mensal)
    .reduce((sum, c) => sum + (c.valor_mensal || 0), 0);

  // Soma valor total de todos os contratos
  const valorTotal = contratos.reduce((sum, c) => sum + (c.valor_total || 0), 0);

  return {
    totalContratos: contratos.length,
    contratosAtivos: ativos.length,
    valorTotal,
    valorRecorrenteMensal,
  };
};

// ===========================================
// HOOK PRINCIPAL
// ===========================================

export function useContratos() {
  const contratosQuery = useQuery({
    queryKey: ['contratos'],
    queryFn: fetchContratos,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  const contratos = contratosQuery.data || [];
  const summary = calculateSummary(contratos);

  return {
    // Dados
    contratos,
    summary,

    // Estado
    isLoading: contratosQuery.isLoading,
    error: contratosQuery.error,

    // Ações
    refetch: contratosQuery.refetch,
  };
}

// ===========================================
// HELPERS DE FORMATAÇÃO
// ===========================================

/**
 * Formata valor em moeda brasileira
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata data no padrão brasileiro
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('pt-BR');
}

