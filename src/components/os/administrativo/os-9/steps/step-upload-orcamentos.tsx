import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { FileUploadUnificado } from '@/components/ui/file-upload-unificado';
import { FileWithComment } from '@/components/ui/file-upload-unificado';

interface StepUploadOrcamentosProps {
  data: {
    arquivos?: FileWithComment[];
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
  osId?: string;
  etapaId?: string;
}

export function StepUploadOrcamentos({ data, onDataChange, readOnly, osId, etapaId }: StepUploadOrcamentosProps) {
  const arquivos = data.arquivos || [];
  const isComplete = arquivos.length === 3;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Upload de Orçamentos</h2>
        <p className="text-sm text-muted-foreground">
          Anexe 3 orçamentos de fornecedores diferentes para comparação
        </p>
      </div>

      {/* Status dos Uploads */}
      <div className="border border-border rounded-lg p-6 bg-background">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: isComplete ? 'var(--success)' : 'var(--primary)' }}
          >
            {isComplete ? (
              <CheckCircle2 className="w-6 h-6 text-white" />
            ) : (
              <FileText className="w-6 h-6 text-white" />
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-base mb-2">
              {isComplete ? 'Todos os orçamentos foram anexados!' : 'Progresso do Upload'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isComplete
                ? 'Você anexou os 3 orçamentos necessários. Revise os arquivos antes de avançar.'
                : `Você anexou ${arquivos.length} de 3 orçamentos obrigatórios.`
              }
            </p>

            {/* Barra de Progresso */}
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(arquivos.length / 3) * 100}%`,
                  backgroundColor: isComplete ? 'var(--success)' : 'var(--primary)',
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {arquivos.length} / 3 orçamentos
            </p>
          </div>
        </div>
      </div>

      <FileUploadUnificado
        label="Anexar Orçamentos (3 obrigatórios)"
        files={arquivos}
        onFilesChange={(files) => onDataChange({ arquivos: files })}
        disabled={readOnly}
        osId={osId}
        etapaId={etapaId}
        etapaNome="Upload de Orçamentos"
        maxFiles={3}
        acceptedTypes={['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/jpg', 'image/png']}
      />

      {/* Alertas */}
      {isComplete ? (
        <Alert className="bg-success/5 border-success/20">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            Todos os 3 orçamentos foram anexados com sucesso! Você pode avançar para a próxima etapa
            ou revisar os arquivos anexados.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            É obrigatório anexar exatamente 3 orçamentos de fornecedores diferentes.
            Certifique-se de que os arquivos estão legíveis e contêm todas as informações necessárias.
          </AlertDescription>
        </Alert>
      )}

      {/* Informações Adicionais */}
      <div className="border border-border rounded-lg p-4 bg-background">
        <h4 className="text-sm mb-3">📋 Informações Importantes</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Os orçamentos devem ser de fornecedores diferentes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Certifique-se de que os valores e especificações estão claros</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Os arquivos devem estar em formato PDF ou imagem (PNG, JPG)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Valide os prazos de validade dos orçamentos</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
