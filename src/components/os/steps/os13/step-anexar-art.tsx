import React from 'react';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUploadUnificado } from '@/components/ui/file-upload-unificado';
import { toast } from '@/lib/utils/safe-toast';
import { useOSDocumentUpload } from '@/lib/hooks/use-os-document-upload';

import { FileWithComment } from '@/components/ui/file-upload-unificado';

export interface StepAnexarARTProps {
  data: { arquivos?: FileWithComment[] };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
  osId?: string;
}

export function StepAnexarART({ data, onDataChange, readOnly, osId }: StepAnexarARTProps) {
  const arquivos = data.arquivos || [];
  const isComplete = arquivos.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Anexar ART</h2>
        <p className="text-sm text-neutral-600">
          Anexe a Anotação de Responsabilidade Técnica (ART) da obra
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
              {isComplete ? 'ART anexada com sucesso!' : 'Aguardando anexo da ART'}
            </h3>
            <p className="text-sm text-neutral-600">
              {isComplete
                ? 'A ART foi anexada e está pronta para ser validada.'
                : 'Anexe o arquivo da ART em formato PDF.'
              }
            </p>
          </div>
        </div>
      </div>

      <FileUploadUnificado
        label="Anexar ART da Obra"
        files={arquivos}
        onFilesChange={(files) => onDataChange({ arquivos: files })}
        disabled={readOnly}
        osId={osId}
        maxFiles={1}
        acceptedTypes={['application/pdf']}
      />

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          A ART é obrigatória para o início da obra. Certifique-se de que o arquivo está legível e contém todas as informações necessárias.
        </AlertDescription>
      </Alert>
    </div>
  );
}
