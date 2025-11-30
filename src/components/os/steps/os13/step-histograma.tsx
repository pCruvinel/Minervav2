import React from 'react';
import { FileUploadUnificado } from '@/components/ui/file-upload-unificado';
import { FileWithComment } from '@/components/ui/file-upload-unificado';

export interface StepHistogramaProps {
  data: { histogramaAnexado: string };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
  osId?: string;
}

export function StepHistograma({ data, onDataChange, readOnly, osId }: StepHistogramaProps) {
  // Converter string única para array de arquivos (compatibilidade)
  const arquivos: FileWithComment[] = data.histogramaAnexado ? [{
    id: 'histograma-obra',
    name: 'Histograma de Obra',
    url: data.histogramaAnexado,
    path: '',
    size: 0,
    type: 'application/pdf',
    uploadedAt: new Date().toISOString(),
    comment: ''
  }] : [];

  const handleFilesChange = (newFiles: FileWithComment[]) => {
    // Converter array de volta para string única (compatibilidade)
    const fileUrl = newFiles.length > 0 ? newFiles[0].url : '';
    onDataChange({ histogramaAnexado: fileUrl });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Histograma de Obra</h2>
        <p className="text-sm text-neutral-600">
          Anexe o histograma com a distribuição de recursos ao longo do tempo da obra
        </p>
      </div>

      <FileUploadUnificado
        label="Histograma de Obra"
        files={arquivos}
        onFilesChange={handleFilesChange}
        disabled={readOnly}
        osId={osId}
        maxFiles={1}
        acceptedTypes={['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/png', 'image/jpg', 'image/jpeg']}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-blue-600 mt-0.5">ℹ️</div>
          <div>
            <p className="text-sm text-blue-800">
              <strong>Importante:</strong> O histograma deve mostrar a distribuição de mão de obra, materiais e equipamentos ao longo das fases da obra.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
