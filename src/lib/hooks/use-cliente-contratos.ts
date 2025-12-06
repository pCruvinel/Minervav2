/**
 * Hook para gerenciamento de contratos do cliente
 *
 * Implementa as regras de negócio:
 * - Cliente pode ter múltiplos contratos (1:N)
 * - Contratos podem ser: avulso, recorrente, parceiro, obra
 * - Retorna resumo consolidado: total ativos, valor recorrente mensal
 *
 * @example
 * ```tsx
 * const { contratos, summary, isLoading } = useClienteContratos(clienteId);
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

export interface Contrato {
  id: string;
  numero_contrato: string;
  cliente_id: string;
  tipo: ContratoTipo;
  valor_total: number;
  valor_mensal: number | null;
  valor_entrada: number;
  parcelas_total: number;
  data_inicio: string;
  data_fim: string | null;
  dia_vencimento: number;
  status: ContratoStatus;
  cc_id: string | null;
  os_id: string | null;
  criado_por_id: string | null;
  observacoes: string | null;
  arquivo_url: string | null;
  created_at: string;
  updated_at: string;
  // Dados relacionados (joins)
  centro_custo?: {
    id: string;
    nome: string;
  } | null;
  ordem_servico?: {
    id: string;
    codigo_os: string;
  } | null;
  criado_por?: {
    id: string;
    nome_completo: string;
  } | null;
}

export interface ContratosSummary {
  totalContratos: number;
  contratosAtivos: number;
  contratosSuspensos: number;
  contratosEncerrados: number;
  valorRecorrenteMensal: number;
  valorTotalContratos: number;
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
  avulso: 'bg-gray-100 text-gray-800',
  recorrente: 'bg-blue-100 text-blue-800',
  parceiro: 'bg-purple-100 text-purple-800',
  obra: 'bg-orange-100 text-orange-800',
};

export const CONTRATO_STATUS_COLORS: Record<ContratoStatus, string> = {
  rascunho: 'bg-gray-100 text-gray-600',
  ativo: 'bg-success/10 text-success',
  suspenso: 'bg-warning/10 text-warning',
  encerrado: 'bg-muted text-muted-foreground',
  cancelado: 'bg-destructive/10 text-destructive',
};

// ===========================================
// QUERIES
// ===========================================

/**
 * Busca todos os contratos de um cliente
 */
const fetchContratosCliente = async (clienteId: string): Promise<Contrato[]> => {
  logger.log('📋 Buscando contratos do cliente:', clienteId);

  const { data, error } = await supabase
    .from('contratos')
    .select(`
      *,
      centros_custo!contratos_cc_id_fkey(id, nome),
      ordens_servico!contratos_os_id_fkey(id, codigo_os),
      colaboradores!contratos_criado_por_id_fkey(id, nome_completo)
    `)
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('❌ Erro ao buscar contratos:', error);
    throw error;
  }

  return (data || []).map((contrato: any) => ({
    id: contrato.id,
    numero_contrato: contrato.numero_contrato,
    cliente_id: contrato.cliente_id,
    tipo: contrato.tipo,
    valor_total: contrato.valor_total || 0,
    valor_mensal: contrato.valor_mensal,
    valor_entrada: contrato.valor_entrada || 0,
    parcelas_total: contrato.parcelas_total || 1,
    data_inicio: contrato.data_inicio,
    data_fim: contrato.data_fim,
    dia_vencimento: contrato.dia_vencimento || 5,
    status: contrato.status,
    cc_id: contrato.cc_id,
    os_id: contrato.os_id,
    criado_por_id: contrato.criado_por_id,
    observacoes: contrato.observacoes,
    arquivo_url: contrato.arquivo_url,
    created_at: contrato.created_at,
    updated_at: contrato.updated_at,
    centro_custo: contrato.centros_custo || null,
    ordem_servico: contrato.ordens_servico || null,
    criado_por: contrato.colaboradores || null,
  }));
};

/**
 * Calcula o resumo dos contratos
 */
const calculateSummary = (contratos: Contrato[]): ContratosSummary => {
  const ativos = contratos.filter(c => c.status === 'ativo');
  const suspensos = contratos.filter(c => c.status === 'suspenso');
  const encerrados = contratos.filter(c => c.status === 'encerrado');

  // Soma valor mensal apenas dos contratos recorrentes ativos
  const valorRecorrenteMensal = ativos
    .filter(c => c.tipo === 'recorrente' && c.valor_mensal)
    .reduce((sum, c) => sum + (c.valor_mensal || 0), 0);

  // Soma valor total de todos os contratos
  const valorTotalContratos = contratos.reduce((sum, c) => sum + (c.valor_total || 0), 0);

  return {
    totalContratos: contratos.length,
    contratosAtivos: ativos.length,
    contratosSuspensos: suspensos.length,
    contratosEncerrados: encerrados.length,
    valorRecorrenteMensal,
    valorTotalContratos,
  };
};

// ===========================================
// HOOK PRINCIPAL
// ===========================================

export function useClienteContratos(clienteId: string) {
  const contratosQuery = useQuery({
    queryKey: ['cliente-contratos', clienteId],
    queryFn: () => fetchContratosCliente(clienteId),
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: !!clienteId,
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
