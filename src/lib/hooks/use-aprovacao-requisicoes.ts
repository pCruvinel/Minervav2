import { useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useApi, useMutation } from './use-api';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';

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
 * O fetchItemsByOsId foi removido, pois agora o backend calcula N+1 via v_requisicoes_com_valor.
 */

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
        .from('v_requisicoes_com_valor')
        .select('*')
        .eq('status_geral', 'em_andamento')
        .eq('status_situacao', 'aguardando_aprovacao')
        .order('data_entrada', { ascending: false });

      if (error) throw error;

      return (data || []) as RequisicaoCompra[];
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
    async ({ osId, observacao, documentoId, codigoOS }: {
      osId: string;
      codigoOS: string;
      observacao?: string;
      documentoId?: string;
    }) => {
      logger.log(`✅ Aprovando requisição ${codigoOS}...`);

      const { data, error } = await supabase.rpc('aprovar_requisicao_compra', {
        p_os_id: osId,
        p_observacao: observacao || null,
        p_documento_id: documentoId || null
      });

      if (error) throw error;

      logger.log(`✅ Requisição ${codigoOS} aprovada com sucesso! Despesa ID: ${data}`);
      return data;
    },
    {
      onSuccess: () => {
        toast.success('Requisição aprovada!', {
          description: 'A OS foi finalizada e a conta a pagar criada automaticamente.'
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
    async ({ osId, motivo, codigoOS, criadoPorId }: {
      osId: string;
      motivo: string;
      codigoOS: string;
      criadoPorId?: string;
    }) => {
      logger.log(`❌ Recusando requisição ${codigoOS}...`);

      const { error: updateError } = await supabase
        .from('ordens_servico')
        .update({
          status_geral: 'cancelado',
          status_situacao: 'recusado',
          observacoes: `RECUSADA: ${motivo}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', osId);

      if (updateError) throw updateError;

      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('os_atividades').insert({
        os_id: osId,
        tipo: 'rejeicao',
        descricao: `Requisição de compras recusada. Motivo: ${motivo}`,
        dados: { observacao: motivo },
        criado_por_id: user?.id || null,
      });

      if (criadoPorId) {
        await supabase.from('notificacoes').insert({
          usuario_id: criadoPorId,
          titulo: 'Requisição Recusada',
          mensagem: `Sua requisição de compras ${codigoOS} foi recusada. Motivo: ${motivo}`,
          tipo: 'erro',
          lida: false,
          dados: { os_id: osId },
        });
      }

      logger.log(`❌ Requisição ${codigoOS} recusada.`);
    },
    {
      onSuccess: () => {
        toast.success('Requisição recusada', {
          description: 'O solicitante será notificado do motivo da recusa.'
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
        .from('v_requisicoes_com_valor')
        .select('*', { count: 'exact' });

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

      return {
        requisicoes: (data || []) as RequisicaoCompra[],
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

      // Buscar da view que já possui os valores pré-calculados
      const { data: allOS, error: osError } = await supabase
        .from('v_requisicoes_com_valor')
        .select('id, status_geral, status_situacao, data_entrada, valorTotal');

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

      // Calcular valor total das pendentes (sem n+1, valor já está na view)
      const osPendentes = (allOS || []).filter(os => 
        os.status_geral === 'em_andamento' && os.status_situacao === 'aguardando_aprovacao'
      );
      
      const valorTotalPendente = osPendentes.reduce((sum, os) => sum + (Number(os.valorTotal) || 0), 0);

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
