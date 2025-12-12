/**
 * Hook para gerenciamento do histórico completo do cliente
 *
 * Implementa as regras de negócio:
 * - Cliente pode ter múltiplas OS (1:N)
 * - Cada OS tem exatamente 1 centro de custo
 * - Histórico consolidado: OS + contratos + leads + documentos
 *
 * @example
 * ```tsx
 * const { cliente, resumo, ordensServico, isLoading } = useClienteHistorico(clienteId);
 * ```
 */

import { supabase } from '@/lib/supabase-client';
import { useQuery } from '@tanstack/react-query';
import { logger } from '@/lib/utils/logger';

// ===========================================
// TIPOS E INTERFACES
// ===========================================

export interface Cliente {
  id: string;
  nome_razao_social: string;
  cpf_cnpj: string;
  status: 'lead' | 'ativo' | 'inativo' | 'blacklist';
  email?: string;
  telefone?: string;
  endereco?: any;
  observacoes?: string;
  nome_responsavel?: string;
  tipo_cliente?: 'PESSOA_FISICA' | 'PESSOA_JURIDICA';
  tipo_empresa?: 'ADMINISTRADORA' | 'CONDOMINIO' | 'CONSTRUTORA' | 'INCORPORADORA' | 'INDUSTRIA' | 'COMERCIO' | 'OUTROS';
  responsavel_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ResumoCliente {
  totalOS: number;
  osAtivas: number;
  osConcluidas: number;
  osCanceladas: number;
  valorTotalContratos: number;
  ultimoContato: string;
  totalDocumentos: number;
}

export interface OrdemServico {
  id: string;
  codigo_os: string;
  tipo_os_id: string;
  tipo_os_nome: string;
  status_geral: string;
  descricao?: string;
  valor_proposta?: number;
  valor_contrato?: number;
  data_entrada: string;
  data_prazo?: string;
  data_conclusao?: string;
  responsavel_nome: string;
  centro_custo: {
    id: string;
    nome: string;
    valor_global: number;
  } | null;
}

export interface TimelineItem {
  id: string;
  tipo: 'os_criada' | 'contrato_assinado' | 'proposta_enviada' | 'lead_convertido' | 'visita_realizada' | 'documento_anexado';
  titulo: string;
  descricao?: string;
  data: string;
  status?: string;
  valor?: number;
  responsavel_nome?: string;
  metadata?: any;
}

// ===========================================
// QUERIES
// ===========================================

/**
 * Busca dados básicos do cliente
 */
const fetchCliente = async (clienteId: string): Promise<Cliente> => {
  logger.log('📊 Buscando dados do cliente:', clienteId);

  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', clienteId)
    .single();

  if (error) {
    logger.error('❌ Erro ao buscar cliente:', error);
    throw error;
  }

  return data;
};

/**
 * Busca resumo consolidado do cliente
 */
const fetchResumoCliente = async (clienteId: string): Promise<ResumoCliente> => {
  logger.log('📈 Calculando resumo do cliente:', clienteId);

  // Buscar OS do cliente
  const { data: oss, error: osError } = await supabase
    .from('ordens_servico')
    .select('status_geral, valor_contrato, updated_at')
    .eq('cliente_id', clienteId);

  if (osError) throw osError;

  // Buscar contratos
  const { data: contratos, error: contratosError } = await supabase
    .from('contratos')
    .select('valor_total')
    .eq('cliente_id', clienteId);

  if (contratosError) throw contratosError;

  // Buscar documentos
  const { count: totalDocumentos, error: docsError } = await supabase
    .from('os_documentos')
    .select('*, ordens_servico!inner(cliente_id)', { count: 'exact', head: true })
    .eq('ordens_servico.cliente_id', clienteId);

  if (docsError) throw docsError;

  // Calcular resumo
  const ultimoContato = oss?.length
    ? oss.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0].updated_at
    : '';

  const resumo: ResumoCliente = {
    totalOS: oss?.length || 0,
    osAtivas: oss?.filter((os: any) => os.status_geral === 'em_andamento').length || 0,
    osConcluidas: oss?.filter((os: any) => os.status_geral === 'concluido').length || 0,
    osCanceladas: oss?.filter((os: any) => os.status_geral === 'cancelado').length || 0,
    valorTotalContratos: contratos?.reduce((sum: number, ctr: any) => sum + (ctr.valor_total || 0), 0) || 0,
    ultimoContato,
    totalDocumentos: totalDocumentos || 0,
  };

  return resumo;
};

/**
 * Busca ordens de serviço do cliente
 */
const fetchOrdensServicoCliente = async (clienteId: string): Promise<OrdemServico[]> => {
  logger.log('🏗️ Buscando OS do cliente:', clienteId);

  const { data, error } = await supabase
    .from('ordens_servico')
    .select(`
      *,
      tipos_os!ordens_servico_tipo_os_id_fkey(nome),
      colaboradores!ordens_servico_responsavel_id_fkey(nome_completo),
      centros_custo!ordens_servico_cc_id_fkey(id, nome, valor_global)
    `)
    .eq('cliente_id', clienteId)
    .order('data_entrada', { ascending: false });

  if (error) {
    logger.error('❌ Erro ao buscar OS:', error);
    throw error;
  }

  return data.map((os: any) => ({
    id: os.id,
    codigo_os: os.codigo_os,
    tipo_os_id: os.tipo_os_id,
    tipo_os_nome: os.tipos_os?.nome || '',
    status_geral: os.status_geral,
    descricao: os.descricao,
    valor_proposta: os.valor_proposta,
    valor_contrato: os.valor_contrato,
    data_entrada: os.data_entrada,
    data_prazo: os.data_prazo,
    data_conclusao: os.data_conclusao,
    responsavel_nome: os.colaboradores?.nome_completo || '',
    centro_custo: os.centros_custo ? {
      id: os.centros_custo.id,
      nome: os.centros_custo.nome,
      valor_global: os.centros_custo.valor_global || 0,
    } : null,
  }));
};

/**
 * Busca timeline básica do cliente (últimas 20 interações)
 */
const fetchTimelineCliente = async (clienteId: string): Promise<TimelineItem[]> => {
  logger.log('📅 Buscando timeline do cliente:', clienteId);

  // Buscar OS do cliente (últimas 20)
  const { data: oss, error: osError } = await supabase
    .from('ordens_servico')
    .select(`
      'os_criada' as tipo,
      id,
      codigo_os as titulo,
      descricao,
      data_entrada as data,
      status_geral as status,
      valor_proposta as valor,
      colaboradores!ordens_servico_responsavel_id_fkey(nome_completo)
    `)
    .eq('cliente_id', clienteId)
    .order('data_entrada', { ascending: false })
    .limit(20);

  if (osError) throw osError;

  const timelineItems: TimelineItem[] = (oss || []).map((item: any) => ({
    id: item.id,
    tipo: 'os_criada',
    titulo: item.titulo,
    descricao: item.descricao,
    data: item.data,
    status: item.status,
    valor: item.valor,
    responsavel_nome: item.colaboradores?.nome_completo,
  }));

  return timelineItems;
};

// ===========================================
// HOOK PRINCIPAL
// ===========================================

export function useClienteHistorico(clienteId: string) {
  // Query para dados básicos do cliente
  const clienteQuery = useQuery({
    queryKey: ['cliente', clienteId],
    queryFn: () => fetchCliente(clienteId),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Query para resumo consolidado
  const resumoQuery = useQuery({
    queryKey: ['cliente-resumo', clienteId],
    queryFn: () => fetchResumoCliente(clienteId),
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: !!clienteId,
  });

  // Query para timeline básica
  const timelineQuery = useQuery({
    queryKey: ['cliente-timeline', clienteId],
    queryFn: () => fetchTimelineCliente(clienteId),
    staleTime: 1 * 60 * 1000, // 1 minuto
    enabled: !!clienteId,
  });

  // Query para ordens de serviço
  const osQuery = useQuery({
    queryKey: ['cliente-os', clienteId],
    queryFn: () => fetchOrdensServicoCliente(clienteId),
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: !!clienteId,
  });

  // Estado consolidado
  const isLoading = clienteQuery.isLoading || resumoQuery.isLoading || timelineQuery.isLoading || osQuery.isLoading;
  const error = clienteQuery.error || resumoQuery.error || timelineQuery.error || osQuery.error;

  return {
    // Dados
    cliente: clienteQuery.data,
    resumo: resumoQuery.data,
    timeline: timelineQuery.data || [],
    ordensServico: osQuery.data || [],

    // Estado
    isLoading,
    error,

    // Ações
    refetch: () => {
      clienteQuery.refetch();
      resumoQuery.refetch();
      timelineQuery.refetch();
      osQuery.refetch();
    },
  };
}