import { supabase } from '@/lib/supabase-client';
import { useApi, useMutation } from './use-api';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';

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
        .eq('tipo_os_id', 'cd5c6c3a-0d00-4edd-8b06-d8ea48eadbd8') // OS-09 ID verificado
        .eq('status_geral', 'concluido') // Concluídas mas não aprovadas
        .order('data_entrada', { ascending: false });

      if (error) throw error;

      // Buscar itens e calcular valor total para cada OS
      const osComValores = await Promise.all(
        (data || []).map(async (os) => {
          const { data: items } = await supabase
            .from('os_requisition_items')
            .select('quantidade, preco_unitario')
            .eq('os_id', os.id);

          const valorTotal = items?.reduce(
            (sum, item) => sum + (item.quantidade * item.preco_unitario),
            0
          ) || 0;

          return { ...os, valorTotal };
        })
      );

      return osComValores;
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
