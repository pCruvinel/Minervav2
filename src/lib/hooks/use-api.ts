/**
 * Hook: use-api
 *
 * Hook genérico para gerenciar chamadas à API com estados de loading/error.
 * Fornece controle automático de estado, tratamento de erros e refetch.
 *
 * @module hooks/use-api
 * @see {@link docs/frontend/QUERY_PATTERNS.md} - Padrões de query recomendados
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

/**
 * Opções de configuração para o hook useApi
 * @template T - Tipo de dado retornado pela API
 */
interface UseApiOptions<T> {
  /** Dados iniciais antes da primeira requisição */
  initialData?: T;

  /** Callback executado quando a requisição tem sucesso */
  onSuccess?: (data: T) => void;

  /** Callback executado quando a requisição falha */
  onError?: (error: Error) => void;

  /** Array de dependências que dispara refetch quando mudam */
  deps?: any[];
}

/**
 * Retorno do hook useApi
 * @template T - Tipo de dado retornado pela API
 */
interface UseApiReturn<T> {
  /** Dados retornados pela API (null enquanto loading ou em caso de erro) */
  data: T | null;

  /** Indica se a requisição está em andamento */
  loading: boolean;

  /** Erro ocorrido durante a requisição (null se sucesso) */
  error: Error | null;

  /** Função para refazer a requisição manualmente */
  refetch: () => Promise<void>;

  /** Função para atualizar os dados localmente sem fazer nova requisição */
  mutate: (newData: T) => void;
}

/**
 * Hook para fazer chamadas à API com gerenciamento automático de estado
 *
 * @template T - Tipo de dado retornado pela API
 * @param apiCall - Função que retorna uma Promise com os dados da API
 * @param options - Opções de configuração do hook
 * @returns Objeto com data, loading, error, refetch e mutate
 *
 * @example
 * ```tsx
 * // Exemplo básico
 * const { data: users, loading, error } = useApi(() =>
 *   supabase.from('colaboradores').select('*')
 * );
 *
 * // Com callbacks
 * const { data, refetch } = useApi(
 *   () => ordensServicoAPI.list({ status: 'em_andamento' }),
 *   {
 *     onSuccess: (data) => toast.success(`${data.length} OSs carregadas`),
 *     onError: (error) => toast.error(`Erro: ${error.message}`),
 *     deps: [status] // Refetch quando status mudar
 *   }
 * );
 *
 * // Atualização otimista
 * const { data, mutate } = useApi(() => api.getUser(userId));
 * mutate({ ...data, nome: 'Novo Nome' }); // Atualiza sem refetch
 * ```
 */
// Stable empty array constant to prevent infinite loops when deps is not provided
const EMPTY_DEPS: any[] = [];

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const { initialData = null, onSuccess, onError, deps } = options;
  
  // Use stable empty array if deps not provided
  const stableDeps = deps ?? EMPTY_DEPS;
  
  const [data, setData] = useState<T | null>(initialData as T | null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Usar refs para armazenar as funções sem causar re-render
  const apiCallRef = useRef(apiCall);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  
  // Atualizar refs quando as funções mudarem
  useEffect(() => {
    apiCallRef.current = apiCall;
  }, [apiCall]);
  
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);
  
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      logger.log('🔄 Iniciando requisição API...');
      
      // Add timeout of 30 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - servidor não respondeu em 30s')), 30000);
      });
      
      const result = await Promise.race([apiCallRef.current(), timeoutPromise]);
      
      logger.log('✅ API Response received:', result);
      setData(result);
      onSuccessRef.current?.(result);
    } catch (err) {
      let error: Error;

      // Criar mensagem de erro mais descritiva
      if (err instanceof Error) {
        error = err;

        // Adicionar contexto para erros comuns
        if (error.message.includes('500')) {
          error = new Error(
            `Erro no servidor (500): ${error.message}. ` +
            'Verifique se as funções RPC do Supabase têm SECURITY DEFINER configurado corretamente.'
          );
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          error = new Error(
            `Erro de autenticação (401): ${error.message}. ` +
            'Faça login novamente ou verifique suas permissões.'
          );
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          error = new Error(
            `Acesso negado (403): ${error.message}. ` +
            'Você não tem permissão para acessar este recurso.'
          );
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          error = new Error(
            `Recurso não encontrado (404): ${error.message}. ` +
            'Verifique se o endpoint ou ID está correto.'
          );
        } else if (error.message.includes('timeout')) {
          error = new Error(
            `Timeout: ${error.message}. ` +
            'O servidor demorou muito para responder. Tente novamente.'
          );
        }
      } else {
        // Tratar erros que não são instâncias de Error
        const errorObj = err as any;

        // Se for um erro do Supabase/PostgREST
        if (errorObj?.code && errorObj?.message) {
          error = new Error(
            `Erro ${errorObj.code}: ${errorObj.message}. ` +
            (errorObj.hint ? `Dica: ${errorObj.hint}` : '')
          );
        } else {
          error = new Error(String(err));
        }
      }

      logger.error('❌ API Error:', {
        message: error.message,
        originalError: err,
        stack: error.stack,
      });

      setError(error);
      onErrorRef.current?.(error);
    } finally {
      setLoading(false);
    }
  }, []); // fetchData agora é estável, não depende de nada
  
  // Executar apenas uma vez quando o componente montar ou stableDeps mudarem
  useEffect(() => {
    logger.log('🚀 useApi: Executando fetch inicial');
    fetchData();
  }, stableDeps); // stableDeps is a stable reference when empty
  
  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);
  
  return { data, loading, error, refetch: fetchData, mutate };
}

/**
 * Hook para operações de mutação (POST, PUT, DELETE)
 *
 * Diferente do useApi, useMutation não executa automaticamente.
 * A requisição só é feita quando você chama a função `mutate`.
 *
 * @template T - Tipo de dado retornado pela API
 * @template V - Tipo de variáveis/dados enviados para a API
 * @param apiCall - Função que recebe variáveis e retorna Promise com resultado
 * @param options - Callbacks de sucesso/erro
 * @returns Objeto com mutate (função para disparar), data, loading e error
 *
 * @example
 * ```tsx
 * // Criar OS
 * const { mutate: createOS, loading } = useMutation(
 *   (data) => ordensServicoAPI.create(data),
 *   {
 *     onSuccess: (os) => {
 *       toast.success(`OS ${os.codigo_os} criada!`);
 *       navigate(`/os/${os.id}`);
 *     },
 *     onError: (error) => toast.error(error.message)
 *   }
 * );
 *
 * // Disparar mutation
 * await createOS({
 *   cliente_id: '123',
 *   tipo_os_id: '456',
 *   descricao: 'Nova OS'
 * });
 *
 * // Atualizar OS
 * const { mutate: updateOS } = useMutation(
 *   (data) => ordensServicoAPI.update(osId, data)
 * );
 * await updateOS({ status_geral: 'concluido' });
 * ```
 */
export function useMutation<T, V = any>(
  apiCall: (variables: V) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const { onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const mutate = useCallback(async (variables: V) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(variables);
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      let error: Error;

      // Criar mensagem de erro mais descritiva
      if (err instanceof Error) {
        error = err;

        // Adicionar contexto para erros comuns
        if (error.message.includes('500')) {
          error = new Error(
            `Erro no servidor (500): ${error.message}. ` +
            'Verifique se as funções RPC do Supabase têm SECURITY DEFINER configurado corretamente.'
          );
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          error = new Error(
            `Erro de autenticação (401): ${error.message}. ` +
            'Faça login novamente ou verifique suas permissões.'
          );
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          error = new Error(
            `Acesso negado (403): ${error.message}. ` +
            'Você não tem permissão para acessar este recurso.'
          );
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          error = new Error(
            `Recurso não encontrado (404): ${error.message}. ` +
            'Verifique se o endpoint ou ID está correto.'
          );
        }
      } else {
        // Tratar erros que não são instâncias de Error
        const errorObj = err as any;

        // Se for um erro do Supabase/PostgREST
        if (errorObj?.code && errorObj?.message) {
          error = new Error(
            `Erro ${errorObj.code}: ${errorObj.message}. ` +
            (errorObj.hint ? `Dica: ${errorObj.hint}` : '')
          );
        } else {
          error = new Error(String(err));
        }
      }

      logger.error('❌ Mutation Error:', {
        message: error.message,
        originalError: err,
        stack: error.stack,
      });

      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError]);
  
  return { mutate, data, loading, error };
}
