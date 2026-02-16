/**
 * use-vincular-pagador.ts
 * 
 * Hook para vínculo manual de transações bancárias a clientes.
 * Suporta "lembrar" o pagador terceiro para auto-match futuro.
 * 
 * Fluxo:
 * 1. Operador seleciona lançamento sem vínculo
 * 2. Escolhe o cliente e marca "Lembrar pagador"
 * 3. Sistema vincula lançamento + cria mapeamento em cliente_pagadores_conhecidos
 * 4. Re-vincula retroativamente lançamentos antigos do mesmo documento
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

// ============================================================
// TYPES
// ============================================================

export interface VincularPagadorParams {
  lancamento_id: string;
  cliente_id: string;
  lembrar: boolean;         // Se deve criar mapeamento em pagadores_conhecidos
  relacao?: 'titular' | 'socio' | 'familiar' | 'terceiro';
  observacoes?: string;
}

export interface PagadorConhecido {
  id: string;
  cliente_id: string;
  documento: string;
  nome_pagador: string | null;
  relacao: string;
  criado_em: string;
  criado_por_id: string | null;
  observacoes: string | null;
  // Join
  cliente?: { id: string; nome_razao_social: string } | null;
}

// ============================================================
// HOOKS
// ============================================================

/**
 * Hook para vincular um lançamento bancário a um cliente.
 * Opcionalmente "lembra" o pagador para auto-match futuro.
 */
export function useVincularPagador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: VincularPagadorParams) => {
      const { lancamento_id, cliente_id, lembrar, relacao, observacoes } = params;

      // 1. Obter usuário atual
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      // 2. Buscar dados do lançamento (documento da contraparte)
      const { data: lancamento, error: fetchError } = await supabase
        .from('lancamentos_bancarios')
        .select('contraparte_documento, contraparte_nome')
        .eq('id', lancamento_id)
        .single();

      if (fetchError) throw new Error('Lançamento não encontrado');

      // 3. Vincular lançamento ao cliente
      const { error: updateError } = await supabase
        .from('lancamentos_bancarios')
        .update({
          cliente_id,
          match_type: 'manual',
          vinculado_por_id: userId || null,
          vinculado_em: new Date().toISOString(),
        })
        .eq('id', lancamento_id);

      if (updateError) throw updateError;

      let retroCount = 0;

      // 4. Se "lembrar", criar pagador conhecido e re-vincular retroativamente
      if (lembrar && lancamento.contraparte_documento) {
        // 4a. Upsert no mapeamento de pagadores
        const { error: pagadorError } = await supabase
          .from('cliente_pagadores_conhecidos')
          .upsert({
            documento: lancamento.contraparte_documento,
            cliente_id,
            nome_pagador: lancamento.contraparte_nome,
            relacao: relacao || 'terceiro',
            criado_por_id: userId || null,
            observacoes: observacoes || null,
          }, { onConflict: 'documento' });

        if (pagadorError) {
          console.error('Erro ao criar pagador conhecido:', pagadorError);
          // Não falhar o fluxo principal
        }

        // 4b. Re-vincular lançamentos antigos do mesmo documento
        const { data: retroData, error: retroError } = await supabase
          .from('lancamentos_bancarios')
          .update({
            cliente_id,
            match_type: 'auto_terceiro',
          })
          .eq('contraparte_documento', lancamento.contraparte_documento)
          .is('cliente_id', null)
          .neq('id', lancamento_id) // Excluir o próprio (já atualizado)
          .select('id');

        if (retroError) {
          console.error('Erro no re-vínculo retroativo:', retroError);
        } else {
          retroCount = retroData?.length || 0;
        }
      }

      return { 
        success: true, 
        retroCount,
        lembrar,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['lancamentos-bancarios'] });
      queryClient.invalidateQueries({ queryKey: ['lancamentos-bancarios-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pagadores-conhecidos'] });

      if (result.lembrar && result.retroCount > 0) {
        toast.success(`Cliente vinculado! ${result.retroCount} lançamento(s) anterior(es) também vinculado(s).`);
      } else {
        toast.success('Cliente vinculado ao lançamento!');
      }
    },
    onError: (error) => {
      toast.error(`Erro ao vincular: ${error.message}`);
    },
  });
}

/**
 * Hook para desvincular um lançamento de um cliente
 */
export function useDesvincularPagador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lancamento_id: string) => {
      const { error } = await supabase
        .from('lancamentos_bancarios')
        .update({
          cliente_id: null,
          match_type: null,
          vinculado_por_id: null,
          vinculado_em: null,
        })
        .eq('id', lancamento_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lancamentos-bancarios'] });
      queryClient.invalidateQueries({ queryKey: ['lancamentos-bancarios-stats'] });
      toast.success('Vínculo removido');
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
}

/**
 * Hook para listar pagadores conhecidos de um cliente
 */
export function usePagadoresConhecidos(clienteId?: string) {
  return useQuery({
    queryKey: ['pagadores-conhecidos', clienteId],
    queryFn: async (): Promise<PagadorConhecido[]> => {
      let query = supabase
        .from('cliente_pagadores_conhecidos')
        .select(`
          *,
          cliente:clientes!cliente_id (id, nome_razao_social)
        `)
        .order('criado_em', { ascending: false });

      if (clienteId) {
        query = query.eq('cliente_id', clienteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as PagadorConhecido[];
    },
    enabled: !!clienteId || clienteId === undefined, // Load all if no clienteId
  });
}

/**
 * Hook para buscar movimentações bancárias de um cliente específico.
 * Inclui transações diretas (cpf_cnpj do cliente) e vinculadas (pagadores terceiros).
 * Retorna dados + resumo financeiro calculado.
 */
export function useMovimentacoesCliente(clienteId?: string) {
  const query = useQuery({
    queryKey: ['movimentacoes-cliente', clienteId],
    queryFn: async () => {
      if (!clienteId) return [];

      const { data, error } = await supabase
        .from('lancamentos_bancarios')
        .select(`
          id, data, descricao, entrada, saida, metodo_transacao,
          contraparte_nome, contraparte_documento, match_type, status,
          cora_entry_id, vinculado_em
        `)
        .eq('cliente_id', clienteId)
        .order('data', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!clienteId,
  });

  // Computed summary from data
  const movimentacoes = query.data ?? [];
  const summary = {
    totalRecebido: movimentacoes
      .filter((m) => m.entrada && m.entrada > 0)
      .reduce((sum, m) => sum + (m.entrada || 0), 0),
    totalSaida: movimentacoes
      .filter((m) => m.saida && m.saida > 0)
      .reduce((sum, m) => sum + (m.saida || 0), 0),
    quantidadeEntradas: movimentacoes.filter((m) => m.entrada && m.entrada > 0).length,
    quantidadeSaidas: movimentacoes.filter((m) => m.saida && m.saida > 0).length,
    total: movimentacoes.length,
  };

  return { ...query, summary };
}

/**
 * Hook para remover um pagador conhecido
 */
export function useRemoverPagadorConhecido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cliente_pagadores_conhecidos')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagadores-conhecidos'] });
      toast.success('Pagador removido');
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
}
