import { pdf } from '@react-pdf/renderer';
import { useState } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';
import { PDFType, PDFGenerationResponse } from '@/lib/types';
import { uploadPDFToStorage } from '@/lib/pdf/pdf-uploader';

// Templates imports
import PropostaTemplate from '@/lib/pdf/templates/proposta-template';
import { ContratoTemplate } from '@/lib/pdf/templates/contrato-template';
import { MemorialTemplate } from '@/lib/pdf/templates/memorial-template';
import { DocumentoSSTTemplate } from '@/lib/pdf/templates/documento-sst-template';
import ParecerReformaTemplate from '@/lib/pdf/templates/parecer-reforma-template';
import VisitaTecnicaTemplate from '@/lib/pdf/templates/visita-tecnica-template';
import PropostaAssAnualTemplate from '@/lib/pdf/templates/proposta-ass-anual';
import PropostaAssPontualTemplate from '@/lib/pdf/templates/proposta-ass-pontual';

interface UsePDFGenerationReturn {
  generating: boolean;
  error: Error | null;
  generate: (
    tipo: PDFType,
    osId: string,
    dados: any // Using specific types in templates, but versatile here
  ) => Promise<PDFGenerationResponse | null>;
  reset: () => void;
}

/**
 * Hook para geração de PDFs no Client-Side (Frontend)
 * Substitui a antiga Edge Function por renderização local usando @react-pdf/renderer
 */
export function usePDFGeneration(): UsePDFGenerationReturn {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generate = async (
    tipo: PDFType,
    osId: string,
    dados: any
  ): Promise<PDFGenerationResponse | null> => {
    setGenerating(true);
    setError(null);

    try {
      logger.log(`[PDF Generation] Starting generation for ${tipo} (OS: ${osId})`);

      // 1. Selecionar o componente do template apropriado com base no tipo
      let DocumentComponent: JSX.Element;

      switch (tipo) {
        case 'proposta':
          DocumentComponent = <PropostaTemplate data={dados} />;
          break;
        case 'contrato':
          DocumentComponent = <ContratoTemplate data={dados} />;
          break;
        case 'memorial':
          DocumentComponent = <MemorialTemplate data={dados} />;
          break;
        case 'documento-sst':
          DocumentComponent = <DocumentoSSTTemplate data={dados} />;
          break;
        case 'parecer-reforma':
          DocumentComponent = <ParecerReformaTemplate data={dados} />;
          break;
        case 'visita-tecnica':
          DocumentComponent = <VisitaTecnicaTemplate data={dados} />;
          break;
        case 'proposta-ass-anual':
          DocumentComponent = <PropostaAssAnualTemplate data={dados} />;
          break;
        case 'proposta-ass-pontual':
          DocumentComponent = <PropostaAssPontualTemplate data={dados} />;
          break;
        case 'laudo-tecnico':
          // Assuming laudo-tecnico uses PropostaAssPontualTemplate or similar for now,
          // or throws until template is created. 
          // Logic check: the user only listed 8 templates to migrate.
          // I will leave it to default or fallback if needed, or map it if I find it matches one.
          // For now, let's map it to PropostaAssPontualTemplate as a placeholder if legitimate,
          // or just leave it to default to error.
          throw new Error(`Template para laudo-tecnico não implementado.`);
        default:
          throw new Error(`Tipo de PDF não suportado: ${tipo}`);
      }

      // 2. Renderizar o PDF para um Blob
      // blob() retorna uma Promise que resolve com o Blob do PDF
      const blob = await pdf(DocumentComponent).toBlob();

      if (!blob) {
        throw new Error('Falha ao gerar o blob do PDF');
      }

      logger.log('[PDF Generation] PDF rendered successfully, starting upload...');

      // 3. Upload para o Supabase Storage
      const uploadResult = await uploadPDFToStorage(blob, tipo, osId);

      // If we get here, upload was successful (function throws on error)
      logger.log('[PDF Generation] Success:', uploadResult.path);
      toast.success('Documento gerado e salvo com sucesso!');

      return {
        success: true,
        url: uploadResult.publicUrl, // URL assinada e válida para download/visualização
        path: uploadResult.path,
        metadata: {
          filename: uploadResult.path.split('/').pop() || `${tipo}.pdf`,
          size: blob.size,
          tipo: tipo
        }
      };

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido na geração do PDF');
      logger.error('[PDF Generation] Error:', error);
      setError(error);
      toast.error(`Erro ao gerar documento: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
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
