/**
 * PDFDownloadButton - Botão para download de PDFs com loading state
 *
 * @example
 * ```tsx
 * <PDFDownloadButton
 *   tipo="proposta"
 *   osId="123"
 *   dados={propostaData}
 *   onSuccess={(url) => console.log('PDF gerado:', url)}
 * />
 * ```
 */

import { useState } from 'react';
import { Download, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFType } from '@/lib/types';
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';

export interface PDFDownloadButtonProps {
  tipo: PDFType;
  osId: string;
  dados: Record<string, unknown>;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export function PDFDownloadButton({
  tipo,
  osId,
  dados,
  onSuccess,
  onError,
  variant = 'default',
  size = 'default',
  className,
  children
}: PDFDownloadButtonProps) {
  const { generating, generate } = usePDFGeneration();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    const result = await generate(tipo, osId, dados);

    if (result?.success && result.url) {
      setDownloadUrl(result.url);
      onSuccess?.(result.url);

      // Auto-download
      const link = document.createElement('a');
      link.href = result.url;
      link.download = result.metadata?.filename || `${tipo}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Reset after 3 seconds
      setTimeout(() => setDownloadUrl(null), 3000);
    } else if (result?.error) {
      onError?.(new Error(result.error));
    }
  };

  const getTipoLabel = () => {
    const labels: Record<PDFType, string> = {
      'proposta': 'Proposta',
      'contrato': 'Contrato',
      'memorial': 'Memorial',
      'documento-sst': 'Doc. SST'
    };
    return labels[tipo];
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={generating}
      variant={variant}
      size={size}
      className={className}
    >
      {generating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Gerando PDF...
        </>
      ) : downloadUrl ? (
        <>
          <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
          {children || `${getTipoLabel()} gerado!`}
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          {children || `Baixar ${getTipoLabel()}`}
        </>
      )}
    </Button>
  );
}
