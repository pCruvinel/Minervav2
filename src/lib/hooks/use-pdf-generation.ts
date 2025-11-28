/**
 * Hook customizado para geração de PDFs via Edge Function
 */

import { useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { PDFType, PDFGenerationRequest, PDFGenerationResponse } from '@/lib/types';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';

interface UsePDFGenerationReturn {
  generating: boolean;
  error: Error | null;
  generate: (
    tipo: PDFType,
    osId: string,
    dados: Record<string, unknown>
  ) => Promise<PDFGenerationResponse | null>;
  reset: () => void;
}

/**
 * Hook para geração de PDFs
 *
 * @example
 * ```tsx
 * const { generating, error, generate } = usePDFGeneration();
 *
 * const handleGenerateProposta = async () => {
 *   const result = await generate('proposta', osId, {
 *     codigoOS: 'OS-001',
 *     clienteNome: 'João Silva',
 *     valorProposta: 1000
 *   });
 *
 *   if (result?.success) {
 *     console.log('PDF gerado:', result.url);
 *   }
 * };
 * ```
 */
export function usePDFGeneration(): UsePDFGenerationReturn {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generate = async (
    tipo: PDFType,
    osId: string,
    dados: Record<string, unknown>
  ): Promise<PDFGenerationResponse | null> => {
    setGenerating(true);
    setError(null);

    try {
      logger.log('[PDF Generation] Starting generation:', { tipo, osId });

      // Get auth token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Usuário não autenticado');
      }

      // Get Supabase URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('SUPABASE_URL não configurado');
      }

      // Call Edge Function
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/generate-pdf/generate`;

      const requestBody: PDFGenerationRequest = {
        tipo,
        osId,
        dados
      };

      logger.log('[PDF Generation] Calling Edge Function:', edgeFunctionUrl);

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      const result: PDFGenerationResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro desconhecido ao gerar PDF');
      }

      logger.log('[PDF Generation] Success:', result);
      toast.success('PDF gerado com sucesso!');

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido');
      logger.error('[PDF Generation] Error:', error);
      setError(error);
      toast.error(`Erro ao gerar PDF: ${error.message}`);
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const reset = () => {
    setGenerating(false);
    setError(null);
  };

  return {
    generating,
    error,
    generate,
    reset
  };
}
