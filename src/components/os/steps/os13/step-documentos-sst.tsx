import React from 'react';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUploadUnificado } from '@/components/ui/file-upload-unificado';
import { FileWithComment } from '@/components/ui/file-upload-unificado';

export interface StepDocumentosSSTProps {
  data: { arquivos?: FileWithComment[] };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
  osId?: string;
}

export function StepDocumentosSST({ data, onDataChange, readOnly, osId }: StepDocumentosSSTProps) {
  const arquivos = data.arquivos || [];
  const isComplete = arquivos.length >= 2;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Gerar Documentos SST</h2>
        <p className="text-sm text-neutral-600">
          Anexe os documentos de Segurança e Saúde do Trabalho (PGR e PCMSO)
        </p>
      </div>

      {/* Status */}
      <div className="border border-neutral-200 rounded-lg p-6 bg-neutral-50">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: isComplete ? '#10b981' : '#DDC063' }}
          >
            {isComplete ? (
              <CheckCircle2 className="w-6 h-6 text-white" />
            ) : (
              <FileText className="w-6 h-6 text-white" />
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-base mb-2">
              {isComplete ? 'Documentos SST anexados!' : 'Aguardando documentos SST'}
            </h3>
            <p className="text-sm text-neutral-600">
              {arquivos.length} de 2 documentos anexados (PGR e PCMSO)
            </p>
          </div>
        </div>
      </div>

      <FileUploadUnificado
        label="Anexar Documentos SST (PGR e PCMSO)"
        files={arquivos}
        onFilesChange={(files) => onDataChange({ arquivos: files })}
        disabled={readOnly}
        osId={osId}
        maxFiles={10}
        acceptedTypes={['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']}
      />

      {isComplete ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Documentos SST completos! PGR e PCMSO anexados com sucesso.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            É obrigatório anexar o PGR (Programa de Gerenciamento de Riscos) e o PCMSO (Programa de Controle Médico de Saúde Ocupacional).
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
