import { useApi, useMutation } from './use-api';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';
import type { ItemRequisicao } from '@/lib/types';

const requisitionItemsAPI = {
  async list(etapaId: string): Promise<ItemRequisicao[]> {
    logger.log(`📋 Buscando itens da etapa ${etapaId}...`);

    const { data, error } = await supabase
      .from('os_requisition_items')
      .select('*')
      .eq('os_etapa_id', etapaId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(
    etapaId: string,
    item: Omit<ItemRequisicao, 'id' | 'os_etapa_id' | 'created_at' | 'updated_at'>
  ): Promise<ItemRequisicao> {
    logger.log(`➕ Criando item de requisição...`, item);

    // Normalizar valores numéricos para evitar overflow
    const normalizedItem = {
      ...item,
      quantidade: Number(item.quantidade) || 0,
      preco_unitario: Number(item.preco_unitario) || 0
    };

    const { data, error } = await supabase
      .from('os_requisition_items')
      .insert({ os_etapa_id: etapaId, ...normalizedItem })
      .select()
      .single();

    if (error) throw error;
    logger.log(`✅ Item criado com sucesso:`, data);
    return data;
  },

  async update(
    itemId: string,
    updates: Partial<Omit<ItemRequisicao, 'id' | 'os_etapa_id'>>
  ): Promise<ItemRequisicao> {
    logger.log(`📝 Atualizando item ${itemId}...`, updates);

    const { data, error } = await supabase
      .from('os_requisition_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    logger.log(`✅ Item atualizado com sucesso:`, data);
    return data;
  },

  async delete(itemId: string): Promise<void> {
    logger.log(`🗑️ Deletando item ${itemId}...`);

    const { error } = await supabase
      .from('os_requisition_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
    logger.log(`✅ Item deletado com sucesso`);
  }
};

/**
 * Hook para listar itens de requisição de uma etapa
 *
 * @param etapaId - ID da etapa da OS
 * @returns Lista de itens, loading state, error e função de refetch
 *
 * @example
 * ```tsx
 * const { items, loading, refetch } = useRequisitionItems(etapaId);
 * ```
 */
export function useRequisitionItems(etapaId?: string) {
  const { data, loading, error, refetch } = useApi(
    async () => {
      if (!etapaId) return [];
      return requisitionItemsAPI.list(etapaId);
    },
    {
      deps: [etapaId],
      onError: (error) => {
        logger.error('Erro ao carregar itens de requisição:', error);
        toast.error('Erro ao carregar itens de requisição');
      }
    }
  );

  return { items: data || [], loading, error, refetch };
}

/**
 * Hook para criar um novo item de requisição
 *
 * @returns Mutation para criar item
 *
 * @example
 * ```tsx
 * const { mutate: createItem, loading } = useCreateRequisitionItem();
 *
 * await createItem({
 *   etapaId: 'uuid',
 *   item: {
 *     tipo: 'Material',
 *     descricao: 'Cimento',
 *     // ... outros campos
 *   }
 * });
 * ```
 */
export function useCreateRequisitionItem() {
  return useMutation(
    (params: {
      etapaId: string;
      item: Omit<ItemRequisicao, 'id' | 'os_etapa_id' | 'created_at' | 'updated_at'>;
    }) => requisitionItemsAPI.create(params.etapaId, params.item),
    {
      onSuccess: () => toast.success('Item adicionado com sucesso!'),
      onError: (error) => {
        logger.error('Erro ao criar item:', error);
        toast.error(`Erro ao criar item: ${error.message}`);
      }
    }
  );
}

/**
 * Hook para atualizar um item de requisição existente
 *
 * @returns Mutation para atualizar item
 *
 * @example
 * ```tsx
 * const { mutate: updateItem } = useUpdateRequisitionItem();
 *
 * await updateItem({
 *   itemId: 'uuid',
 *   updates: { quantidade: 50 }
 * });
 * ```
 */
export function useUpdateRequisitionItem() {
  return useMutation(
    (params: {
      itemId: string;
      updates: Partial<Omit<ItemRequisicao, 'id' | 'os_etapa_id'>>;
    }) => requisitionItemsAPI.update(params.itemId, params.updates),
    {
      onSuccess: () => toast.success('Item atualizado com sucesso!'),
      onError: (error) => {
        logger.error('Erro ao atualizar item:', error);
        toast.error(`Erro ao atualizar item: ${error.message}`);
      }
    }
  );
}

/**
 * Hook para deletar um item de requisição
 *
 * @returns Mutation para deletar item
 *
 * @example
 * ```tsx
 * const { mutate: deleteItem } = useDeleteRequisitionItem();
 *
 * await deleteItem('item-uuid');
 * ```
 */
export function useDeleteRequisitionItem() {
  return useMutation(
    (itemId: string) => requisitionItemsAPI.delete(itemId),
    {
      onSuccess: () => toast.success('Item removido com sucesso!'),
      onError: (error) => {
        logger.error('Erro ao deletar item:', error);
        toast.error(`Erro ao deletar item: ${error.message}`);
      }
    }
  );
}
