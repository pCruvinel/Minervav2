import { useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useApi, useMutation } from './use-api';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';

/** ID fixo do tipo OS-09 (Requisição de Compras) no banco */
const OS_09_ID = 'cd5c6c3a-0d00-4edd-8b06-d8ea48eadbd8';

/** Interface para filtros do histórico de requisições */
export interface RequisicaoFilters {
  status?: string[];
  centro_custo_id?: string;
  solicitante_id?: string;
  start_date?: string;
  end_date?: string;
}

/** Interface para dados de requisição com valores calculados */
/**
 * Helper: Busca itens de uma OS via os_etapa_id (etapa ordem 1)
 * Items são salvos com os_etapa_id, não os_id diretamente
 */
async function fetchItemsByOsId(osId: string): Promise<{ quantidade: number; preco_unitario: number }[]> {
  // Primeiro, buscar o ID da etapa 1 desta OS
  const { data: etapa } = await supabase
    .from('os_etapas')
    .select('id')
    .eq('os_id', osId)
    .eq('ordem', 1)
    .single();

  if (!etapa?.id) return [];

  // Buscar itens pela etapa
  const { data: items } = await supabase
    .from('os_requisition_items')
    .select('quantidade, preco_unitario')
    .eq('os_etapa_id', etapa.id);

  return items || [];
}

export interface RequisicaoCompra {
  id: string;
  codigo_os: string;
  status_geral: string;
  data_entrada: string;
  descricao?: string;
  cc_id?: string;
  criado_por_id?: string;
  responsavel_id?: string;
  observacoes?: string;
  tipo_os?: { codigo: string; nome: string };
  criado_por?: { nome_completo: string; email: string; avatar_url?: string };
  responsavel?: { nome_completo: string };
  centro_custo?: {
    id: string;
    nome: string;
    cliente?: { nome_razao_social: string }
  };
  valorTotal: number;
  qtdItens: number;
}

/**
 * Hook para listar requisições de compra pendentes de aprovação
 */
export function useRequisicoesPendentes() {
  const { data, loading, error, refetch } = useApi(
    async () => {
      logger.log('📋 Buscando requisições pendentes...');

      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
          *,
          tipo_os:tipo_os_id (codigo, nome),
          criado_por:criado_por_id (nome_completo, email),
          responsavel:responsavel_id (nome_completo),
          centro_custo:cc_id (nome, cliente:cliente_id (nome_razao_social))
        `)
        .eq('tipo_os_id', OS_09_ID)
        .eq('status_geral', 'em_andamento')
        .eq('status_situacao', 'aguardando_aprovacao') // Aguardando aprovação do Financeiro
        .order('data_entrada', { ascending: false });

      if (error) throw error;

      // Buscar itens e calcular valor total para cada OS
      const osComValores = await Promise.all(
        (data || []).map(async (os) => {
          const items = await fetchItemsByOsId(os.id);

          const valorTotal = items?.reduce(
            (sum, item) => sum + (item.quantidade * item.preco_unitario),
            0
          ) || 0;

          return { ...os, valorTotal, qtdItens: items?.length || 0 };
        })
      );

      return osComValores as RequisicaoCompra[];
    },
    {
      onError: (error) => {
        logger.error('Erro ao carregar requisições:', error);
        toast.error('Erro ao carregar requisições pendentes');
      }
    }
  );

  return { requisicoes: data || [], loading, error, refetch };
}

/**
 * Hook para aprovar uma requisição de compra
 */
export function useAprovarRequisicao() {
  return useMutation(
    async ({ osId, valorTotal, ccId, codigoOS }: {
      osId: string;
      valorTotal: number;
      ccId: string;
      codigoOS: string;
    }) => {
      logger.log(`✅ Aprovando requisição ${codigoOS}...`);

      // 1. Criar conta a pagar
      const { error: contaError } = await supabase
        .from('contas_pagar')
        .insert({
          descricao: `Aprovação de Compra - ${codigoOS}`,
          tipo: 'despesa_variavel',
          valor: valorTotal,
          vencimento: new Date().toISOString().split('T')[0], // Hoje
          status: 'em_aberto',
          cc_id: ccId,
          favorecido_fornecedor: 'A definir (cotação)',
        });

      if (contaError) throw contaError;

      // 2. Atualizar status da OS
      const { error: osError } = await supabase
        .from('ordens_servico')
        .update({
          status_geral: 'em_andamento', // Aprovada, indo para compras
          updated_at: new Date().toISOString()
        })
        .eq('id', osId);

      if (osError) throw osError;

      logger.log(`✅ Requisição ${codigoOS} aprovada com sucesso!`);
    },
    {
      onSuccess: () => {
        toast.success('Requisição aprovada!', {
          description: 'Conta a pagar criada automaticamente.'
        });
      },
      onError: (error) => {
        logger.error('Erro ao aprovar requisição:', error);
        toast.error(`Erro ao aprovar: ${error.message}`);
      }
    }
  );
}

/**
 * Hook para recusar uma requisição de compra
 */
export function useRecusarRequisicao() {
  return useMutation(
    async ({ osId, motivo, codigoOS }: {
      osId: string;
      motivo: string;
      codigoOS: string;
    }) => {
      logger.log(`❌ Recusando requisição ${codigoOS}...`);

      const { error } = await supabase
        .from('ordens_servico')
        .update({
          status_geral: 'cancelado',
          observacoes: `RECUSADA: ${motivo}`, // Salvar motivo
          updated_at: new Date().toISOString()
        })
        .eq('id', osId);

      if (error) throw error;

      logger.log(`❌ Requisição ${codigoOS} recusada.`);
    },
    {
      onSuccess: () => {
        toast.success('Requisição recusada', {
          description: 'Solicitante será notificado.'
        });
      },
      onError: (error) => {
        logger.error('Erro ao recusar requisição:', error);
        toast.error(`Erro ao recusar: ${error.message}`);
      }
    }
  );
}

/**
 * Hook para buscar histórico de requisições com filtros e paginação
 */
export function useHistoricoRequisicoes(pageSize = 10) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<RequisicaoFilters>({});

  const { data, loading, error, refetch } = useApi(
    async () => {
      logger.log('📋 Buscando histórico de requisições...');

      let query = supabase
        .from('ordens_servico')
        .select(`
          *,
          tipo_os:tipo_os_id (codigo, nome),
          criado_por:criado_por_id (nome_completo, email, avatar_url),
          responsavel:responsavel_id (nome_completo),
          centro_custo:cc_id (id, nome, cliente:cliente_id (nome_razao_social))
        `, { count: 'exact' })
        .eq('tipo_os_id', OS_09_ID)
        .order('data_entrada', { ascending: false });

      // Aplicar filtros
      if (filters.status?.length) {
        query = query.in('status_geral', filters.status);
      }
      if (filters.centro_custo_id) {
        query = query.eq('cc_id', filters.centro_custo_id);
      }
      if (filters.solicitante_id) {
        query = query.eq('criado_por_id', filters.solicitante_id);
      }
      if (filters.start_date) {
        query = query.gte('data_entrada', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('data_entrada', filters.end_date);
      }

      // Paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Buscar valores totais para cada OS
      const osComValores = await Promise.all(
        (data || []).map(async (os) => {
          const items = await fetchItemsByOsId(os.id);

          const valorTotal = items?.reduce(
            (sum, item) => sum + (item.quantidade * item.preco_unitario),
            0
          ) || 0;

          return { ...os, valorTotal, qtdItens: items?.length || 0 };
        })
      );

      return {
        requisicoes: osComValores as RequisicaoCompra[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    },
    {
      deps: [page, JSON.stringify(filters)],
      onError: (error) => {
        logger.error('Erro ao carregar histórico:', error);
        toast.error('Erro ao carregar histórico de requisições');
      }
    }
  );

  return {
    requisicoes: data?.requisicoes || [],
    loading,
    error,
    pagination: {
      page,
      totalPages: data?.totalPages || 1,
      totalCount: data?.totalCount || 0
    },
    setPage,
    filters,
    setFilters,
    refetch
  };
}

/**
 * Hook para buscar itens de uma requisição específica
 */
export function useRequisitionItemsByOS(osId?: string) {
  const { data, loading, error, refetch } = useApi(
    async () => {
      if (!osId) return [];

      const { data, error } = await supabase
        .from('os_requisition_items')
        .select('*')
        .eq('os_id', osId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    {
      deps: [osId],
      onError: (error) => {
        logger.error('Erro ao carregar itens:', error);
      }
    }
  );

  return { items: data || [], loading, error, refetch };
}

/**
 * Hook para buscar KPIs do módulo de compras
 */
export function useComprasKPIs() {
  const { data, loading, error, refetch } = useApi(
    async () => {
      logger.log('📊 Calculando KPIs de compras...');

      // Buscar todas as OS-09
      const { data: allOS, error: osError } = await supabase
        .from('ordens_servico')
        .select('id, status_geral, status_situacao, data_entrada')
        .eq('tipo_os_id', OS_09_ID);

      if (osError) throw osError;

      // Contar por status
      const pendentes = (allOS || []).filter(os => 
        os.status_geral === 'em_andamento' && os.status_situacao === 'aguardando_aprovacao'
      ).length;
      const emAndamento = (allOS || []).filter(os => 
        os.status_geral === 'em_andamento' && os.status_situacao !== 'aguardando_aprovacao'
      ).length;
      const canceladas = (allOS || []).filter(os => os.status_geral === 'cancelado').length;

      // Aprovadas este mês
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      const aprovadasMes = (allOS || []).filter(os => {
        if (os.status_geral !== 'concluido') return false; // OS totalmente concluídas
        const dataOS = new Date(os.data_entrada);
        return dataOS >= inicioMes;
      }).length;

      // Calcular valor total das pendentes
      const osPendentes = (allOS || []).filter(os => 
        os.status_geral === 'em_andamento' && os.status_situacao === 'aguardando_aprovacao'
      );
      let valorTotalPendente = 0;

      for (const os of osPendentes) {
        const items = await fetchItemsByOsId(os.id);

        valorTotalPendente += items?.reduce(
          (sum, item) => sum + (item.quantidade * item.preco_unitario),
          0
        ) || 0;
      }

      return {
        pendentes,
        emAndamento,
        canceladas,
        aprovadasMes,
        valorTotalPendente
      };
    },
    {
      onError: (error) => {
        logger.error('Erro ao calcular KPIs:', error);
      }
    }
  );

  return { kpis: data, loading, error, refetch };
}
