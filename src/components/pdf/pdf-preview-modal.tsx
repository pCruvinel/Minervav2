/**
 * PDFPreviewModal - Modal para preview de PDFs antes de gerar
 *
 * @example
 * ```tsx
 * <PDFPreviewModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   tipo="proposta"
 *   osId="123"
 *   dados={propostaData}
 * />
 * ```
 */

import { useState } from 'react';
import { X, Download, Loader2, Eye, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PDFType } from '@/lib/types';
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';

export interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: PDFType;
  osId: string;
  dados: Record<string, unknown>;
  onSuccess?: (url: string) => void;
}

export function PDFPreviewModal({
  isOpen,
  onClose,
  tipo,
  osId,
  dados,
  onSuccess
}: PDFPreviewModalProps) {
  const { generating, generate } = usePDFGeneration();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showIframe, setShowIframe] = useState(false);

  const handleGenerate = async () => {
    const result = await generate(tipo, osId, dados);

    if (result?.success && result.url) {
      setPdfUrl(result.url);
      setShowIframe(true);
      onSuccess?.(result.url);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${tipo}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleClose = () => {
    setPdfUrl(null);
    setShowIframe(false);
    onClose();
  };

  const getTipoLabel = () => {
    const labels: Record<PDFType, string> = {
      'proposta': 'Proposta Comercial',
      'contrato': 'Contrato',
      'memorial': 'Memorial Descritivo',
      'documento-sst': 'Documento de Segurança do Trabalho'
    };
    return labels[tipo];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {getTipoLabel()}
          </DialogTitle>
          <DialogDescription>
            OS Nº {dados.codigoOS as string || osId}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-[500px]">
          {!pdfUrl ? (
            // Preview dos dados antes de gerar
            <div className="space-y-4 p-4 bg-neutral-50 rounded-lg">
              <h3 className="font-semibold text-neutral-800">
                Dados do Documento:
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(dados).map(([key, value]) => {
                  if (typeof value === 'object') return null;
                  return (
                    <div key={key} className="text-sm">
                      <span className="font-medium text-neutral-600">
                        {key}:
                      </span>{' '}
                      <span className="text-neutral-900">{String(value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : showIframe ? (
            // Preview do PDF gerado
            <iframe
              src={pdfUrl}
              className="w-full h-[500px] rounded-lg border border-neutral-200"
              title="PDF Preview"
            />
          ) : null}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={handleClose} disabled={generating}>
            <X className="w-4 h-4 mr-2" />
            Fechar
          </Button>

          <div className="flex gap-2">
            {!pdfUrl ? (
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Gerar Preview
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
