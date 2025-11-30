import React from 'react';
import { FileUploadUnificado } from '@/components/ui/file-upload-unificado';
import { FileWithComment } from '@/components/ui/file-upload-unificado';

export interface StepDiarioObraProps {
  data: { diarioAnexado: string };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
  osId?: string;
}

export function StepDiarioObra({ data, onDataChange, readOnly, osId }: StepDiarioObraProps) {
  // Converter string única para array de arquivos (compatibilidade)
  const arquivos: FileWithComment[] = data.diarioAnexado ? [{
    id: 'diario-obra',
    name: 'Diário de Obra',
    url: data.diarioAnexado,
    path: '',
    size: 0,
    type: 'application/pdf',
    uploadedAt: new Date().toISOString(),
    comment: ''
  }] : [];

  const handleFilesChange = (newFiles: FileWithComment[]) => {
    // Converter array de volta para string única (compatibilidade)
    const fileUrl = newFiles.length > 0 ? newFiles[0].url : '';
    onDataChange({ diarioAnexado: fileUrl });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Cronograma de Obra (Diário de Obra)</h2>
        <p className="text-sm text-neutral-600">
          Anexe o arquivo do diário de obra para acompanhamento das atividades diárias
        </p>
      </div>

      <FileUploadUnificado
        label="Diário de Obra"
        files={arquivos}
        onFilesChange={handleFilesChange}
        disabled={readOnly}
        osId={osId}
        maxFiles={1}
        acceptedTypes={['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-blue-600 mt-0.5">ℹ️</div>
          <div>
            <p className="text-sm text-blue-800">
              <strong>Importante:</strong> O diário de obra deve ser atualizado regularmente com o registro das atividades executadas, mão de obra presente, condições climáticas e ocorrências relevantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
