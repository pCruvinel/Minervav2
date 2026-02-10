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
  is_aplicacao: boolean;
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
  // Novos campos para Mão de Obra
  tipo_custo_mo: 'flutuante' | 'geral' | null;
  colaborador_ids: string[] | null;
  is_rateio_colaboradores: boolean | null;
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
  nota_fiscal_url?: string;
  // Novos parametros para Mão de Obra
  tipo_custo_mo?: 'flutuante' | 'geral';
  colaborador_ids?: string[];
  is_rateio_colaboradores?: boolean;
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
    is_aplicacao: false,
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
    tipo_custo_mo: null,
    colaborador_ids: null,
    is_rateio_colaboradores: null,
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
    is_aplicacao: false,
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
    tipo_custo_mo: null,
    colaborador_ids: null,
    is_rateio_colaboradores: null,
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
    is_aplicacao: false,
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
    tipo_custo_mo: null,
    colaborador_ids: null,
    is_rateio_colaboradores: null,
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
    is_aplicacao: false,
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
    tipo_custo_mo: null,
    colaborador_ids: null,
    is_rateio_colaboradores: null,
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
    is_aplicacao: false,
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
    tipo_custo_mo: null,
    colaborador_ids: null,
    is_rateio_colaboradores: null,
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
export interface LancamentosStatsFilters {
  status?: LancamentoBancarioStatus | LancamentoBancarioStatus[];
  dataInicio?: string;
  dataFim?: string;
  banco?: string;
  setor_id?: string; // Aproximado, pois setor está via join
  cc_id?: string;    // Aproximado, pois cc está via join
}

/**
 * Busca estatísticas resumidas dos lançamentos (com suporte a filtros)
 */
export function useLancamentosBancariosStats(filters?: LancamentosStatsFilters) {
  return useQuery({
    queryKey: ['lancamentos-bancarios-stats', filters],
    queryFn: async () => {
      let query = supabase
        .from('lancamentos_bancarios')
        .select('id, status, entrada, saida, cc_id, setor_id');

      // 1. Filtro de Status
      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          query = query.in('status', filters.status);
        } else {
          query = query.eq('status', filters.status);
        }
      }

      // 2. Filtro de Data
      if (filters?.dataInicio) {
        query = query.gte('data', filters.dataInicio);
      }
      if (filters?.dataFim) {
        // Ajuste para final do dia se for apenas data YYYY-MM-DD
        const fim = filters.dataFim.includes('T') ? filters.dataFim : `${filters.dataFim}T23:59:59`;
        query = query.lte('data', fim);
      }

      // 3. Filtro de Banco
      if (filters?.banco) {
        query = query.eq('banco', filters.banco);
      }
      
      // 4. Filtro de CC
       if (filters?.cc_id) {
        query = query.eq('cc_id', filters.cc_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const items = data ?? [];
      
      // Filtros em memória para relações complexas se necessário (ex: multi-select de setores/CCs que não está direto na query simples)
      // Mas por enquanto vamos assumir que o filtro principal é data/status
      
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
 * Hook para buscar saldo real da conta (Cora via Proxy)
 */
export function useCoraBalance() {
  return useQuery({
    queryKey: ['cora-balance'],
    queryFn: async () => {
      // Usar a edge function como proxy para autenticar corretamente
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/cora-integration/bank-balance`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro no saldo (Cora):', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Falha ao buscar saldo: ${errorText}`);
      }
      
      const result = await response.json(); 
      // Edge Function returns: { success: true, data: { available, blocked, total } } (EM CENTAVOS)
      // Unwrap nested data
      const balanceData = result.data || result;
      
      return {
        disponivel: (balanceData.available || 0) / 100,
        bloqueado: (balanceData.blocked || 0) / 100,
        total: (balanceData.total || 0) / 100
      };
    },
    // Atualizar a cada 1 minuto ou quando focar a janela
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 
  });
}

/**
 * Classifica um lançamento bancário (categoria, setor, CC ou rateio)
 */
/**
 * Classifica um lançamento bancário (categoria, setor, CC ou rateio)
 * USA RPC para garantir atomicidade: Cria a conta_pagar/receber e atualiza o extrato.
 */
export function useClassificarLancamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ClassificarLancamentoParams) => {
      const { id, rateios } = params;

      // Validate rateio sum matches transaction value (blocking)
      if (rateios && rateios.length > 0) {
        const totalPercentual = rateios.reduce((sum, r) => sum + (Number(r.percentual) || 0), 0);
        if (Math.abs(totalPercentual - 100) > 0.01) {
          throw new Error(`Rateio inválido: soma dos percentuais é ${totalPercentual.toFixed(2)}%, deve ser 100%`);
        }
      }

      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      // Call RPC
      const { data, error } = await supabase.rpc('classificar_transacao_bancaria', {
        p_lancamento_id: id,
        p_categoria_id: params.categoria_id || null,
        p_setor_id: params.setor_id || null,
        p_cc_id: params.cc_id || null,
        p_rateios: rateios || null,
        p_observacoes: params.observacoes || null,
        p_nota_fiscal_url: params.nota_fiscal_url || null,
        p_comprovante_url: params.comprovante_url || null,
        p_user_id: userId
      });

      if (error) throw error;

      // ==========================================================
      // Lógica Pós-RPC: Tratar Custos Variáveis de Colaborador
      // ==========================================================
      const { tipo_custo_mo, colaborador_ids, is_rateio_colaboradores, id: lancamentoId } = params;

      if (tipo_custo_mo && colaborador_ids && colaborador_ids.length > 0) {
        console.log('Classificando Mão de Obra:', { tipo_custo_mo, colaborador_ids, is_rateio_colaboradores });

        // 1. Atualizar campos extras no lancamento_bancario (que a RPC não conhece)
        const { error: updateError } = await supabase
          .from('lancamentos_bancarios')
          .update({
             tipo_custo_mo,
             colaborador_ids,
             is_rateio_colaboradores: !!is_rateio_colaboradores
          })
          .eq('id', lancamentoId);

        if (updateError) {
          console.error('Erro ao atualizar campos de MO no lançamento:', updateError);
          // Não lançar erro para não quebrar o fluxo principal, mas alertar?
          // toast.error('Erro ao salvar detalhes de MO');
        }

        // 2. Se for FLUTUANTE, criar registros na tabela de custos variáveis
        // OBS: "Geral/Tributo" só marca o lancamento, não cria custo extra (conforme regra de negocio)
        // MAS a regra diz "O registro serve apenas para conciliar... e não deve ser somado".
        // O user disse: "Você precisa criar uma lógica onde a Conciliação Bancária alimenta a tabela de custos extras".
        // Se for Salário Base, não cria custo extra. Mas podemos querer o registro histórico?
        // A regra diz: "não deve ser somado como um 'custo extra'".
        // Vamos criar APENAS para 'flutuante'.

        if (tipo_custo_mo === 'flutuante') {
           // Calcular valor por colaborador
           // Assumindo que o valor total é o do lançamento (entrada ou saida)
           // Precisamos pegar o valor atualizado do lançamento.
           // Mas params não tem o valor. Vamos pegar do retorno RPC ou assumir contexto?
           // O RPC retorna success e ID. Não retorna valor.
           // Vamos fazer um fetch rápido ou passar o valor no params?
           // Melhor passar o valor no params para evitar roundtrip, mas o hook original n pede valor.
           // Vamos buscar o lançamento atualizado.
           const { data: lancData } = await supabase
             .from('lancamentos_bancarios')
             .select('entrada, saida, data')
             .eq('id', lancamentoId)
             .single();
           
           if (lancData) {
             const valorTotal = (lancData.entrada || 0) + (lancData.saida || 0); // Um deles é null/0 normalmente.
             const numColaboradores = colaborador_ids.length;
             const valorPorColaborador = valorTotal / numColaboradores;
             const mesReferencia = lancData.data; // Data da transação define o mês de competência

             const inserts = colaborador_ids.map(colabId => ({
               colaborador_id: colabId,
               lancamento_bancario_id: lancamentoId,
               mes_referencia: mesReferencia, // Pode precisar ajustar para 1º do mês? O banco aceita DATE.
               tipo_custo: 'flutuante',
               descricao: params.observacoes || 'Custo flutuante via conciliação',
               valor: valorPorColaborador,
               rateio_origem: !!is_rateio_colaboradores,
               total_colaboradores: numColaboradores,
               valor_original: valorTotal,
               created_by: userId
             }));

             const { error: insertCustosError } = await supabase
               .from('custos_variaveis_colaborador')
               .insert(inserts);

             if (insertCustosError) {
               console.error('Erro ao inserir custos variáveis:', insertCustosError);
               toast.error('Erro ao gerar custos dos colaboradores');
             }
           }
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lancamentos-bancarios'] });
      queryClient.invalidateQueries({ queryKey: ['lancamentos-bancarios-stats'] });
      queryClient.invalidateQueries({ queryKey: ['custos-variaveis'] }); // Invalidate new hook query
      // Invalidar também queries de contas_pagar/receber pois novos registros foram criados
      queryClient.invalidateQueries({ queryKey: ['cc-despesas'] }); 
      queryClient.invalidateQueries({ queryKey: ['cc-receitas'] });
      toast.success('Lançamento classificado e registro financeiro criado!');
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

      // Obter usuário atual
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      const { data, error } = await supabase
        .from('lancamentos_bancarios')
        .update({
          conta_pagar_id,
          conta_receber_id,
          status: 'conciliado' as LancamentoBancarioStatus,
          classificado_em: new Date().toISOString(),
          classificado_por_id: userId,
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
