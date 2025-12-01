import React from 'react';
import { FileUploadUnificado } from '@/components/ui/file-upload-unificado';
import { FileWithComment } from '@/components/ui/file-upload-unificado';

export interface StepCronogramaObraProps {
  data: { cronogramaAnexado: string };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
  osId?: string;
}

export function StepCronogramaObra({ data, onDataChange, readOnly, osId }: StepCronogramaObraProps) {
  // Converter string única para array de arquivos (compatibilidade)
  const arquivos: FileWithComment[] = data.cronogramaAnexado ? [{
    id: 'cronograma-obra',
    name: 'Cronograma de Obra',
    url: data.cronogramaAnexado,
    path: '',
    size: 0,
    type: 'application/pdf',
    uploadedAt: new Date().toISOString(),
    comment: ''
  }] : [];

  const handleFilesChange = (newFiles: FileWithComment[]) => {
    // Converter array de volta para string única (compatibilidade)
    const fileUrl = newFiles.length > 0 ? newFiles[0].url : '';
    onDataChange({ cronogramaAnexado: fileUrl });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Anexar Cronograma de Obra</h2>
        <p className="text-sm text-muted-foreground">
          Anexe o cronograma detalhado da obra em formato MS Project ou PDF
        </p>
      </div>

      <FileUploadUnificado
        label="Cronograma de Obra"
        files={arquivos}
        onFilesChange={handleFilesChange}
        disabled={readOnly}
        osId={osId}
        maxFiles={1}
        acceptedTypes={['application/pdf', 'application/vnd.ms-project', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']}
      />

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-primary mt-0.5">ℹ️</div>
          <div>
            <p className="text-sm text-primary">
              <strong>Importante:</strong> O cronograma deve conter todas as etapas da obra com datas previstas de início e término, incluindo marcos importantes e dependências entre atividades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
