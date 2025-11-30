import React from 'react';
import { FileUploadUnificado } from '@/components/ui/file-upload-unificado';
import { FileWithComment } from '@/components/ui/file-upload-unificado';

export interface StepEvidenciaMobilizacaoProps {
  data: { evidenciaAnexada: string };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
  osId?: string;
}

export function StepEvidenciaMobilizacao({ data, onDataChange, readOnly, osId }: StepEvidenciaMobilizacaoProps) {
  // Converter string única para array de arquivos (compatibilidade)
  const arquivos: FileWithComment[] = data.evidenciaAnexada ? [{
    id: 'evidencia-mobilizacao',
    name: 'Evidências de Mobilização',
    url: data.evidenciaAnexada,
    path: '',
    size: 0,
    type: 'application/pdf',
    uploadedAt: new Date().toISOString(),
    comment: ''
  }] : [];

  const handleFilesChange = (newFiles: FileWithComment[]) => {
    // Converter array de volta para string única (compatibilidade)
    const fileUrl = newFiles.length > 0 ? newFiles[0].url : '';
    onDataChange({ evidenciaAnexada: fileUrl });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Evidência de Mobilização Concluída</h2>
        <p className="text-sm text-neutral-600">
          Anexe evidências fotográficas da mobilização: placa instalada, sinalização, caminho seguro e canteiro
        </p>
      </div>

      <FileUploadUnificado
        label="Evidências de Mobilização"
        files={arquivos}
        onFilesChange={handleFilesChange}
        disabled={readOnly}
        osId={osId}
        maxFiles={1}
        acceptedTypes={['application/pdf', 'application/zip', 'image/png', 'image/jpg', 'image/jpeg']}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-blue-600 mt-0.5">ℹ️</div>
          <div>
            <p className="text-sm text-blue-800">
              <strong>Importante:</strong> As evidências devem incluir fotos da placa de obra instalada, sinalização de segurança, caminhos seguros demarcados e canteiro de obras montado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
