import React from 'react';
import { Button } from '../../../ui/button';
import { PrimaryButton } from '../../../ui/primary-button';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Send, CheckCircle2, Download, Eye, AlertCircle, Loader2, Mail } from 'lucide-react';
import { toast } from '../../../../lib/utils/safe-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StepEnviarDocumentoProps {
  data: {
    documentoEnviado: boolean;
    dataEnvio: string;
  };
  onDataChange: (data: any) => void;
}

export function StepEnviarDocumento({ data, onDataChange }: StepEnviarDocumentoProps) {
  const [isSending, setIsSending] = React.useState(false);

  const handleEnviarDocumento = async () => {
    setIsSending(true);
    
    try {
      // Simular envio de documento (substituir com lógica real)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      onDataChange({
        ...data,
        documentoEnviado: true,
        dataEnvio: new Date().toISOString(),
      });
      
      toast.success('Documento enviado ao cliente com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar documento');
    } finally {
      setIsSending(false);
    }
  };

  const handleVisualizarDocumento = () => {
    toast.info('Abrindo documento...');
    // Lógica para abrir documento
  };

  const handleBaixarDocumento = () => {
    toast.success('Download iniciado!');
    // Lógica de download
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Enviar Documento ao Cliente</h2>
        <p className="text-sm text-neutral-600">
          Gere e envie o documento final ao cliente
        </p>
      </div>

      {!data.documentoEnviado ? (
        <div className="space-y-4">
          {/* Card Informativo */}
          <div className="border border-neutral-200 rounded-lg p-6 bg-neutral-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D3AF37' }}>
                <Mail className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-base mb-2">Documento para o Cliente</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Este documento será enviado diretamente ao cliente com o parecer técnico
                  e as recomendações da visita realizada.
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D3AF37' }}></div>
                    <span>Parecer técnico formatado para o cliente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D3AF37' }}></div>
                    <span>Recomendações e próximos passos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D3AF37' }}></div>
                    <span>Registro fotográfico selecionado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D3AF37' }}></div>
                    <span>Informações de contato e suporte</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Cliente */}
          <div className="border border-neutral-200 rounded-lg p-4">
            <h3 className="text-sm mb-3" style={{ color: '#D3AF37' }}>
              Destinatário
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Cliente:</span>
                <span>Informações da Etapa 2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Solicitante:</span>
                <span>Informações da Etapa 1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">E-mail:</span>
                <span>cliente@exemplo.com</span>
              </div>
            </div>
          </div>

          {/* Ações de Pré-visualização */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleVisualizarDocumento}
              variant="outline"
            >
              <Eye className="w-4 h-4 mr-2" />
              Visualizar Documento
            </Button>
            
            <Button
              onClick={handleBaixarDocumento}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
          </div>

          {/* Botão de Enviar */}
          <div className="flex flex-col items-center gap-4 py-8 border-t border-neutral-200">
            <PrimaryButton
              onClick={handleEnviarDocumento}
              disabled={isSending}
              className="px-8 py-3"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Enviando Documento...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Enviar Documento ao Cliente
                </>
              )}
            </PrimaryButton>
            
            <p className="text-sm text-neutral-600 text-center max-w-md">
              O cliente receberá o documento por e-mail e também poderá acessá-lo
              através do portal do cliente.
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Certifique-se de revisar o documento antes de enviar ao cliente.
              O envio registrará automaticamente a conclusão desta OS.
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Confirmação de Envio */}
          <div className="border border-green-200 rounded-lg p-6 bg-green-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg mb-1 text-green-900">Documento Enviado com Sucesso!</h3>
                <p className="text-sm text-green-700 mb-2">
                  O documento foi enviado ao cliente em{' '}
                  {data.dataEnvio &&
                    format(new Date(data.dataEnvio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
                <p className="text-sm text-green-700 mb-4">
                  Esta Ordem de Serviço foi concluída com sucesso.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleVisualizarDocumento}
                    className="bg-white border border-green-600 text-green-700 hover:bg-green-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar Enviado
                  </Button>
                  
                  <Button
                    onClick={handleBaixarDocumento}
                    className="bg-white border border-green-600 text-green-700 hover:bg-green-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo da OS */}
          <div className="border border-neutral-200 rounded-lg p-6">
            <h3 className="text-base mb-4" style={{ color: '#D3AF37' }}>
              Resumo da OS-08
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">Tipo de OS:</span>
                <span>Visita Técnica / Parecer Técnico</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">Status:</span>
                <span className="text-green-600">Concluída</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">Documento Interno:</span>
                <span className="text-green-600">✓ Gerado</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">Documento Cliente:</span>
                <span className="text-green-600">✓ Enviado</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-neutral-600">Concluída em:</span>
                <span>
                  {data.dataEnvio &&
                    format(new Date(data.dataEnvio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>

          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              A OS-08 foi concluída com sucesso! O cliente foi notificado e o documento
              está disponível para consulta no sistema.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
