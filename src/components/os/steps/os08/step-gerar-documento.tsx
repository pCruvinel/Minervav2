import React from 'react';
import { Button } from '../../../ui/button';
import { PrimaryButton } from '../../../ui/primary-button';
import { Alert, AlertDescription } from '../../../ui/alert';
import { FileText, Download, Eye, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '../../../../lib/utils/safe-toast';

interface StepGerarDocumentoProps {
  data: {
    documentoGerado: boolean;
    documentoUrl: string;
  };
  onDataChange: (data: any) => void;
}

export function StepGerarDocumento({ data, onDataChange }: StepGerarDocumentoProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGerarDocumento = async () => {
    setIsGenerating(true);
    
    try {
      // Simular geração de documento (substituir com lógica real)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const mockUrl = 'https://example.com/documento-visita-tecnica.pdf';
      
      onDataChange({
        ...data,
        documentoGerado: true,
        documentoUrl: mockUrl,
      });
      
      toast.success('Documento gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar documento');
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
        <p className="text-sm text-neutral-600">
          Gere o documento técnico para uso interno da empresa
        </p>
      </div>

      {!data.documentoGerado ? (
        <div className="space-y-4">
          {/* Card Informativo */}
          <div className="border border-neutral-200 rounded-lg p-6 bg-neutral-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#DDC063' }}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-base mb-2">Documento de Visita Técnica</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  O documento será gerado com base nas informações coletadas durante a visita técnica.
                  Este documento é para uso interno e controle da empresa.
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D3AF37' }}></div>
                    <span>Parecer técnico completo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D3AF37' }}></div>
                    <span>Manifestações patológicas identificadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D3AF37' }}></div>
                    <span>Recomendações técnicas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D3AF37' }}></div>
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
              disabled={isGenerating}
              className="px-8 py-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando Documento...
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
          <div className="border border-green-200 rounded-lg p-6 bg-green-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg mb-1 text-green-900">Documento Gerado com Sucesso!</h3>
                <p className="text-sm text-green-700 mb-4">
                  O documento interno está pronto e disponível para visualização e download.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleVisualizarDocumento}
                    className="bg-white border border-green-600 text-green-700 hover:bg-green-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  
                  <Button
                    onClick={handleBaixarDocumento}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Card com Preview */}
          <div className="border border-neutral-200 rounded-lg p-6">
            <h3 className="text-base mb-4" style={{ color: '#D3AF37' }}>
              Informações do Documento
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">Tipo:</span>
                <span>Parecer Técnico Interno</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">Formato:</span>
                <span>PDF</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">Páginas:</span>
                <span>--</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-neutral-600">Gerado em:</span>
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
