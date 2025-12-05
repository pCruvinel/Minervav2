import { useState, useCallback } from 'react';
import { toast } from '@/lib/utils/safe-toast';
import { logger } from '@/lib/utils/logger';
import { removeMask, validarCEP } from '@/components/ui/form-masked-input';
import type { ViaCEPResponse } from '@/lib/types';

export interface UseViaCEPReturn {
  loading: boolean;
  error: string | null;
  data: ViaCEPResponse | null;
  fetchCEP: (cep: string) => Promise<ViaCEPResponse | null>;
  clearData: () => void;
}

/**
 * Hook para integração com API ViaCEP
 *
 * @example
 * ```tsx
 * const { fetchCEP, loading } = useViaCEP();
 *
 * const handleCEPBlur = async (cep: string) => {
 *   const endereco = await fetchCEP(cep);
 *   if (endereco) {
 *     setFormData({
 *       ...formData,
 *       logradouro: endereco.logradouro,
 *       bairro: endereco.bairro,
 *       cidade: endereco.localidade,
 *       uf: endereco.uf
 *     });
 *   }
 * };
 * ```
 */
export function useViaCEP(): UseViaCEPReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ViaCEPResponse | null>(null);

  const fetchCEP = useCallback(async (cep: string): Promise<ViaCEPResponse | null> => {
    setError(null);
    setData(null);

    const cepClean = removeMask(cep);

    if (!validarCEP(cep)) {
      const errorMsg = 'CEP inválido. Digite 8 dígitos.';
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    }

    try {
      setLoading(true);
      logger.log(`🔍 Buscando CEP: ${cepClean}`);

      const response = await fetch(`https://viacep.com.br/ws/${cepClean}/json/`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const viaCepData: ViaCEPResponse = await response.json();

      if (viaCepData.erro) {
        const errorMsg = 'CEP não encontrado';
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      }

      toast.success('Endereço encontrado!');
      logger.log(`✅ CEP encontrado:`, viaCepData);

      setData(viaCepData);
      return viaCepData;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao buscar CEP';
      setError(errorMsg);
      toast.error(`Erro ao buscar CEP: ${errorMsg}`);
      logger.error('❌ Erro ao buscar CEP:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { loading, error, data, fetchCEP, clearData };
}
