import React from 'react';
import { FileUploadUnificado } from '@/components/ui/file-upload-unificado';
import { FileWithComment } from '@/components/ui/file-upload-unificado';

export interface StepPlacaObraProps {
  data: { placaAnexada: string };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
  osId?: string;
}

export function StepPlacaObra({ data, onDataChange, readOnly, osId }: StepPlacaObraProps) {
  // Converter string única para array de arquivos (compatibilidade)
  const arquivos: FileWithComment[] = data.placaAnexada ? [{
    id: 'placa-obra',
    name: 'Placa de Obra',
    url: data.placaAnexada,
    path: '',
    size: 0,
    type: 'application/pdf',
    uploadedAt: new Date().toISOString(),
    comment: ''
  }] : [];

  const handleFilesChange = (newFiles: FileWithComment[]) => {
    // Converter array de volta para string única (compatibilidade)
    const fileUrl = newFiles.length > 0 ? newFiles[0].url : '';
    onDataChange({ placaAnexada: fileUrl });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Gerar Placa de Obra</h2>
        <p className="text-sm text-neutral-600">
          Anexe o arquivo da placa de obra que será instalada no local
        </p>
      </div>

      <FileUploadUnificado
        label="Placa de Obra"
        files={arquivos}
        onFilesChange={handleFilesChange}
        disabled={readOnly}
        osId={osId}
        maxFiles={1}
        acceptedTypes={['application/pdf', 'image/png', 'image/jpg', 'image/jpeg']}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-blue-600 mt-0.5">ℹ️</div>
          <div>
            <p className="text-sm text-blue-800">
              <strong>Importante:</strong> A placa de obra deve conter informações sobre a empresa responsável, engenheiro, ART e demais dados obrigatórios conforme legislação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
