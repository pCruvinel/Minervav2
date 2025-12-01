import React from 'react';
import { Button } from '@/components/ui/button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Eye, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/lib/utils/safe-toast';
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';
import { logger } from '@/lib/utils/logger';

interface StepGerarDocumentoProps {
  osId: string;
  data: {
    documentoGerado: boolean;
    documentoUrl: string;
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export function StepGerarDocumento({ osId, data, onDataChange, readOnly }: StepGerarDocumentoProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { generating: generatingPDF, generate: generatePDF } = usePDFGeneration();

  const handleGerarDocumento = async () => {
    if (readOnly) return;
    setIsGenerating(true);

    try {
      logger.log('📄 Gerando documento de visita técnica para OS:', osId);

      // Gerar PDF de visita técnica
      const result = await generatePDF('visita-tecnica', osId, {});

      if (result?.success && result.url) {
        logger.log('✅ PDF de visita técnica gerado com sucesso:', result.url);

        onDataChange({
          ...data,
          documentoGerado: true,
          documentoUrl: result.url,
        });

        toast.success('Documento de visita técnica gerado com sucesso!');
      } else {
        throw new Error('Falha ao gerar PDF');
      }
    } catch (error) {
      logger.error('Erro ao gerar documento:', error);
      toast.error('Erro ao gerar documento. Verifique se todas as etapas anteriores foram concluídas.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVisualizarDocumento = () => {
    if (data.documentoUrl) {
      window.open(data.documentoUrl, '_blank');
      toast.info('Abrindo documento...');
    }
  };

  const handleBaixarDocumento = () => {
    if (data.documentoUrl) {
      // Lógica de download
      toast.success('Download iniciado!');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Gerar Documento Interno</h2>
        <p className="text-sm text-muted-foreground">
          Gere o documento técnico para uso interno da empresa
        </p>
      </div>

      {!data.documentoGerado ? (
        <div className="space-y-4">
          {/* Card Informativo */}
          <div className="border border-border rounded-lg p-6 bg-background">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary)' }}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-base mb-2">Documento de Visita Técnica</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  O documento será gerado com base nas informações coletadas durante a visita técnica.
                  Este documento é para uso interno e controle da empresa.
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></div>
                    <span>Parecer técnico completo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></div>
                    <span>Manifestações patológicas identificadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></div>
                    <span>Recomendações técnicas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></div>
                    <span>Registro fotográfico</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botão de Gerar */}
          <div className="flex flex-col items-center gap-4 py-8">
            <PrimaryButton
              onClick={handleGerarDocumento}
              disabled={isGenerating || generatingPDF || readOnly}
              className="px-8 py-3"
            >
              {(isGenerating || generatingPDF) ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {generatingPDF ? 'Gerando PDF...' : 'Processando...'}
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" />
                  Gerar Documento Interno
                </>
              )}
            </PrimaryButton>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Certifique-se de que todas as informações estão corretas antes de gerar o documento.
              Você poderá visualizar e baixar o documento após a geração.
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Confirmação de Documento Gerado */}
          <div className="border border-success/20 rounded-lg p-6 bg-success/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg mb-1 text-success">Documento Gerado com Sucesso!</h3>
                <p className="text-sm text-success mb-4">
                  O documento interno está pronto e disponível para visualização e download.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleVisualizarDocumento}
                    className="bg-white border border-green-600 text-success hover:bg-success/5"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  
                  <Button
                    onClick={handleBaixarDocumento}
                    className="bg-success text-white hover:bg-success"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Card com Preview */}
          <div className="border border-border rounded-lg p-6">
            <h3 className="text-base mb-4" style={{ color: 'var(--primary)' }}>
              Informações do Documento
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-muted-foreground">Tipo:</span>
                <span>Parecer Técnico Interno</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-muted-foreground">Formato:</span>
                <span>PDF</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-muted-foreground">Páginas:</span>
                <span>--</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Gerado em:</span>
                <span>{new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Avance para a próxima etapa para gerar e enviar o documento ao cliente.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
