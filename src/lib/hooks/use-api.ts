import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  deps?: any[]; // Dependências para controlar quando refetch
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

/**
 * Hook para fazer chamadas à API com loading/error states
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const { initialData = null, onSuccess, onError, deps = [] } = options;
  
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
      
      console.log('🔄 Iniciando requisição API...');
      
      // Add timeout of 30 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - servidor não respondeu em 30s')), 30000);
      });
      
      const result = await Promise.race([apiCallRef.current(), timeoutPromise]);
      
      console.log('✅ API Response received:', result);
      setData(result);
      onSuccessRef.current?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('❌ API Error:', error.message, error);
      setError(error);
      onErrorRef.current?.(error);
    } finally {
      setLoading(false);
    }
  }, []); // fetchData agora é estável, não depende de nada
  
  // Executar apenas uma vez quando o componente montar ou deps mudarem
  useEffect(() => {
    console.log('🚀 useApi: Executando fetch inicial');
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps); // Apenas deps controlam quando re-executar
  
  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);
  
  return { data, loading, error, refetch: fetchData, mutate };
}

/**
 * Hook para mutations (POST, PUT, DELETE)
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
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError]);
  
  return { mutate, data, loading, error };
}
