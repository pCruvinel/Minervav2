/**
 * use-lancamentos-bancarios.ts
 * 
 * Hooks para gerenciamento de lançamentos bancários (conciliação).
 * Permite listar, classificar, ratear e vincular lançamentos do extrato
 * com contas_pagar e contas_receber do sistema.
 * 
 * @example
 * ```tsx
 * const { data: lancamentos } = useLancamentosBancarios({ status: 'pendente' });
 * const classificar = useClassificarLancamento();
 * const importar = useImportarExtrato();
 * ```
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

// ============================================================
// TYPES
// ============================================================

export type LancamentoBancarioStatus = 
  | 'pendente' 
  | 'conciliado' 
  | 'ignorado';

export type TipoLancamento = 'CREDIT' | 'DEBIT';
export type MetodoTransacao = 'PIX' | 'BOLETO' | 'TRANSFER' | 'OTHER';

export interface LancamentoBancario {
  id: string;
  data: string;
  descricao: string;
  entrada: number | null;
  saida: number | null;
  saldo_apos: number | null;
  banco: string | null;
  conta_bancaria: string | null;
  arquivo_origem: string | null;
  linha_origem: number | null;
  hash_linha: string | null;
  status: LancamentoBancarioStatus;
  categoria_id: string | null;
  setor_id: string | null;
  cc_id: string | null;
  rateios: RateioCentroCusto[] | null;
  conta_pagar_id: string | null;
  conta_receber_id: string | null;
  comprovante_url: string | null;
  nota_fiscal_url: string | null;
  observacoes: string | null;
  classificado_por_id: string | null;
  classificado_em: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Campos Cora
  tipo_lancamento: TipoLancamento | null;
  metodo_transacao: MetodoTransacao | null;
  contraparte_nome: string | null;
  contraparte_documento: string | null;
  cora_entry_id: string | null;
  // Joins
  categoria?: { id: string; nome: string; codigo: string } | null;
  setor?: { id: string; nome: string } | null;
  centro_custo?: { id: string; nome: string } | null;
  classificado_por?: { id: string; nome: string } | null;
}

export interface RateioCentroCusto {
  cc_id: string;
  cc_nome?: string;
  percentual: number;
  valor: number;
}

export interface ClassificarLancamentoParams {
  id: string;
  categoria_id?: string;
  setor_id?: string;
  cc_id?: string;
  rateios?: RateioCentroCusto[];
  observacoes?: string;
  comprovante_url?: string;
}

export interface ImportarExtratoParams {
  banco: string;
  conta_bancaria: string;
  arquivo_nome: string;
  linhas: {
    data: string;
    descricao: string;
    entrada: number | null;
    saida: number | null;
    saldo_apos?: number | null;
  }[];
}

export interface VincularContaParams {
  lancamento_id: string;
  conta_pagar_id?: string;
  conta_receber_id?: string;
}

// ============================================================
// MOCK DATA (Fallback quando integração não funcionar)
// ============================================================

export const MOCK_LANCAMENTOS: LancamentoBancario[] = [
  {
    id: 'mock-1',
    data: new Date().toISOString().split('T')[0],
    descricao: 'PIX RECEBIDO - CLIENTE SOLAR I - PARCELA 3/12',
    entrada: 15000,
    saida: null,
    saldo_apos: 45000,
    banco: 'Cora',
    conta_bancaria: '123456-7',
    arquivo_origem: null,
    linha_origem: null,
    hash_linha: null,
    status: 'pendente',
    categoria_id: null,
    setor_id: null,
    cc_id: null,
    rateios: null,
    conta_pagar_id: null,
    conta_receber_id: null,
    comprovante_url: null,
    nota_fiscal_url: null,
    observacoes: null,
    classificado_por_id: null,
    classificado_em: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categoria: null,
    setor: null,
    centro_custo: null,
    tipo_lancamento: 'CREDIT',
    metodo_transacao: 'PIX',
    contraparte_nome: 'CLIENTE SOLAR I',
    contraparte_documento: '12345678000100',
    cora_entry_id: null,
  },
  {
    id: 'mock-2',
    data: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    descricao: 'TED ENVIADA - FORNECEDOR MATERIAIS LTDA - NF 12345',
    entrada: null,
    saida: 8500,
    saldo_apos: 30000,
    banco: 'Cora',
    conta_bancaria: '123456-7',
    arquivo_origem: null,
    linha_origem: null,
    hash_linha: null,
    status: 'conciliado',
    categoria_id: null,
    setor_id: null,
    cc_id: null,
    rateios: null,
    conta_pagar_id: null,
    conta_receber_id: null,
    comprovante_url: null,
    nota_fiscal_url: 'https://example.com/nf12345.pdf',
    observacoes: 'Cimento e areia para obra Solar I',
    classificado_por_id: null,
    classificado_em: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categoria: { id: 'cat-1', nome: 'Material de Construção', codigo: 'MAT' },
    setor: { id: 'set-1', nome: 'Obras' },
    centro_custo: { id: 'cc-1', nome: 'CC13001-SOLAR_I' },
    tipo_lancamento: 'DEBIT',
    metodo_transacao: 'TRANSFER',
    contraparte_nome: 'FORNECEDOR MATERIAIS LTDA',
    contraparte_documento: '98765432000199',
    cora_entry_id: null,
  },
  {
    id: 'mock-3',
    data: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    descricao: 'PAGAMENTO BOLETO - CEMIG ENERGIA - REF 01/2026',
    entrada: null,
    saida: 1250,
    saldo_apos: 38500,
    banco: 'Cora',
    conta_bancaria: '123456-7',
    arquivo_origem: null,
    linha_origem: null,
    hash_linha: null,
    status: 'conciliado',
    categoria_id: null,
    setor_id: null,
    cc_id: null,
    rateios: null,
    conta_pagar_id: 'cp-mock-1',
    conta_receber_id: null,
    comprovante_url: 'https://example.com/comprovante.pdf',
    nota_fiscal_url: null,
    observacoes: null,
    classificado_por_id: null,
    classificado_em: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categoria: { id: 'cat-2', nome: 'Energia Elétrica', codigo: 'ENERGIA' },
    setor: { id: 'set-2', nome: 'Administrativo' },
    centro_custo: null,
    tipo_lancamento: 'DEBIT',
    metodo_transacao: 'BOLETO',
    contraparte_nome: 'CEMIG ENERGIA',
    contraparte_documento: '11223344000155',
    cora_entry_id: null,
  },
  {
    id: 'mock-4',
    data: new Date(Date.now() - 259200000).toISOString().split('T')[0],
    descricao: 'PIX RECEBIDO - ASSESSORIA MENSAL - COND PRIMAVERA',
    entrada: 4500,
    saida: null,
    saldo_apos: 39750,
    banco: 'Cora',
    conta_bancaria: '123456-7',
    arquivo_origem: null,
    linha_origem: null,
    hash_linha: null,
    status: 'pendente',
    categoria_id: null,
    setor_id: null,
    cc_id: null,
    rateios: null,
    conta_pagar_id: null,
    conta_receber_id: null,
    comprovante_url: null,
    nota_fiscal_url: null,
    observacoes: null,
    classificado_por_id: null,
    classificado_em: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categoria: null,
    setor: null,
    centro_custo: null,
    tipo_lancamento: 'CREDIT',
    metodo_transacao: 'PIX',
    contraparte_nome: 'COND PRIMAVERA',
    contraparte_documento: '55667788000122',
    cora_entry_id: null,
  },
  {
    id: 'mock-5',
    data: new Date(Date.now() - 345600000).toISOString().split('T')[0],
    descricao: 'FOLHA PAGAMENTO - COLABORADORES - REF 01/2026',
    entrada: null,
    saida: 25000,
    saldo_apos: 35250,
    banco: 'Cora',
    conta_bancaria: '123456-7',
    arquivo_origem: null,
    linha_origem: null,
    hash_linha: null,
    status: 'conciliado',
    categoria_id: null,
    setor_id: null,
    cc_id: null,
    rateios: [
      { cc_id: 'cc-1', cc_nome: 'CC13001-SOLAR_I', percentual: 40, valor: 10000 },
      { cc_id: 'cc-2', cc_nome: 'CC05002-PRIMAVERA', percentual: 60, valor: 15000 },
    ],
    conta_pagar_id: null,
    conta_receber_id: null,
    comprovante_url: null,
    nota_fiscal_url: null,
    observacoes: 'Rateio entre obras ativas',
    classificado_por_id: null,
    classificado_em: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categoria: { id: 'cat-3', nome: 'Folha de Pagamento', codigo: 'FOLHA' },
    setor: { id: 'set-1', nome: 'Obras' },
    centro_custo: null,
    tipo_lancamento: 'DEBIT',
    metodo_transacao: 'TRANSFER',
    contraparte_nome: 'FOLHA PGTO COLABORADORES',
    contraparte_documento: null,
    cora_entry_id: null,
  },
];

// ============================================================
// HOOKS
// ============================================================

/**
 * Busca lançamentos bancários com filtros opcionais
 */
export function useLancamentosBancarios(options?: {
  status?: LancamentoBancarioStatus | LancamentoBancarioStatus[];
  dataInicio?: string;
  dataFim?: string;
  banco?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['lancamentos-bancarios', options],
    queryFn: async (): Promise<LancamentoBancario[]> => {
      let query = supabase
        .from('lancamentos_bancarios')
        .select(`
          *,
          categoria:categorias_financeiras!categoria_id (id, nome, codigo),
          setor:setores!setor_id (id, nome),
          centro_custo:centros_custo!cc_id (id, nome)
        `)
        .order('data', { ascending: false });

      // Filtro por status
      if (options?.status) {
        if (Array.isArray(options.status)) {
          query = query.in('status', options.status);
        } else {
          query = query.eq('status', options.status);
        }
      }

      // Filtro por período
      if (options?.dataInicio) {
        query = query.gte('data', options.dataInicio);
      }
      if (options?.dataFim) {
        query = query.lte('data', options.dataFim);
      }

      // Filtro por banco
      if (options?.banco) {
        query = query.eq('banco', options.banco);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data ?? []) as LancamentoBancario[];
    },
    enabled: options?.enabled !== false,
  });
}

/**
 * Busca estatísticas resumidas dos lançamentos
 */
export function useLancamentosBancariosStats() {
  return useQuery({
    queryKey: ['lancamentos-bancarios-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lancamentos_bancarios')
        .select('id, status, entrada, saida');

      if (error) throw error;

      const items = data ?? [];
      
      const pendentes = items.filter(i => i.status === 'pendente');
      const conciliados = items.filter(i => i.status === 'conciliado');
      const ignorados = items.filter(i => i.status === 'ignorado');

      return {
        total: items.length,
        pendentes: pendentes.length,
        conciliados: conciliados.length,
        ignorados: ignorados.length,
        totalEntradas: items.reduce((acc, i) => acc + (Number(i.entrada) || 0), 0),
        totalSaidas: items.reduce((acc, i) => acc + (Number(i.saida) || 0), 0),
        percentualConciliado: items.length > 0 
          ? Math.round((conciliados.length / items.length) * 100) 
          : 0,
      };
    },
  });
}

/**
 * Classifica um lançamento bancário (categoria, setor, CC ou rateio)
 */
export function useClassificarLancamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ClassificarLancamentoParams) => {
      const { id, rateios, ...updateData } = params;
      
      // Determinar status (sempre conciliado ao salvar)
      const status: LancamentoBancarioStatus = 'conciliado';

      const { data, error } = await supabase
        .from('lancamentos_bancarios')
        .update({
          ...updateData,
          rateios: rateios ?? null,
          status,
          classificado_em: new Date().toISOString(),
          comprovante_url: updateData.comprovante_url
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lancamentos-bancarios'] });
      queryClient.invalidateQueries({ queryKey: ['lancamentos-bancarios-stats'] });
      toast.success('Lançamento classificado com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao classificar: ${error.message}`);
    },
  });
}

/**
 * Vincula lançamento bancário a uma conta_pagar ou conta_receber
 */
export function useVincularConta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: VincularContaParams) => {
      const { lancamento_id, conta_pagar_id, conta_receber_id } = params;

      const { data, error } = await supabase
        .from('lancamentos_bancarios')
        .update({
          conta_pagar_id,
          conta_receber_id,
          status: 'conciliado' as LancamentoBancarioStatus,
          classificado_em: new Date().toISOString(),
        })
        .eq('id', lancamento_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lancamentos-bancarios'] });
      queryClient.invalidateQueries({ queryKey: ['lancamentos-bancarios-stats'] });
      toast.success('Lançamento conciliado com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao conciliar: ${error.message}`);
    },
  });
}

/**
 * Ignora um lançamento bancário (não será conciliado)
 */
export function useIgnorarLancamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('lancamentos_bancarios')
        .update({
          status: 'ignorado' as LancamentoBancarioStatus,
          classificado_em: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lancamentos-bancarios'] });
      queryClient.invalidateQueries({ queryKey: ['lancamentos-bancarios-stats'] });
      toast.success('Lançamento ignorado');
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
}

/**
 * Importa lançamentos de um extrato bancário
 */
export function useImportarExtrato() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ImportarExtratoParams) => {
      const { banco, conta_bancaria, arquivo_nome, linhas } = params;

      // Gerar hash para cada linha para evitar duplicatas
      const generateHash = (linha: typeof linhas[0], index: number) => {
        const str = `${linha.data}|${linha.descricao}|${linha.entrada}|${linha.saida}|${index}`;
        // Simple hash for dedup (in production, use crypto.subtle)
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return `${arquivo_nome}-${hash.toString(16)}`;
      };

      const lancamentos = linhas.map((linha, index) => ({
        data: linha.data,
        descricao: linha.descricao,
        entrada: linha.entrada,
        saida: linha.saida,
        saldo_apos: linha.saldo_apos ?? null,
        banco,
        conta_bancaria,
        arquivo_origem: arquivo_nome,
        linha_origem: index + 1,
        hash_linha: generateHash(linha, index),
        status: 'pendente' as const,
      }));

      // Usar upsert para evitar duplicatas
      const { data, error } = await supabase
        .from('lancamentos_bancarios')
        .upsert(lancamentos, { 
          onConflict: 'hash_linha',
          ignoreDuplicates: true,
        })
        .select();

      if (error) throw error;
      return { 
        importados: data?.length ?? 0, 
        total: linhas.length 
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['lancamentos-bancarios'] });
      queryClient.invalidateQueries({ queryKey: ['lancamentos-bancarios-stats'] });
      toast.success(`${result.importados} lançamentos importados`);
    },
    onError: (error) => {
      toast.error(`Erro ao importar: ${error.message}`);
    },
  });
}

/**
 * Deleta um lançamento bancário
 */
export function useDeleteLancamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lancamentos_bancarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lancamentos-bancarios'] });
      queryClient.invalidateQueries({ queryKey: ['lancamentos-bancarios-stats'] });
      toast.success('Lançamento removido');
    },
    onError: (error) => {
      toast.error(`Erro ao remover: ${error.message}`);
    },
  });
}

/**
 * Sincroniza extrato bancário do Cora via Edge Function
 */
export function useSyncExtrato() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params?: { start?: string; end?: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Não autenticado');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const queryParams = new URLSearchParams();
      if (params?.start) queryParams.set('start', params.start);
      if (params?.end) queryParams.set('end', params.end);
      
      const url = `${supabaseUrl}/functions/v1/cora-integration/sync${queryParams.toString() ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }

      return await response.json() as {
        success: boolean;
        message: string;
        imported: number;
        total: number;
        period?: { start: string; end: string };
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['lancamentos-bancarios'] });
      queryClient.invalidateQueries({ queryKey: ['lancamentos-bancarios-stats'] });
      toast.success(`${result.imported} novos lançamentos sincronizados`);
    },
    onError: (error) => {
      toast.error(`Erro ao sincronizar: ${error.message}`);
    },
  });
}
