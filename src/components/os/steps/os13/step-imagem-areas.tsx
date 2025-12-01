import React from 'react';
import { FileUploadUnificado } from '@/components/ui/file-upload-unificado';
import { FileWithComment } from '@/components/ui/file-upload-unificado';

export interface StepImagemAreasProps {
  data: { imagemAnexada: string };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
  osId?: string;
}

export function StepImagemAreas({ data, onDataChange, readOnly, osId }: StepImagemAreasProps) {
  // Converter string única para array de arquivos (compatibilidade)
  const arquivos: FileWithComment[] = data.imagemAnexada ? [{
    id: 'imagem-areas',
    name: 'Imagem de Referência de Áreas',
    url: data.imagemAnexada,
    path: '',
    size: 0,
    type: 'image/png',
    uploadedAt: new Date().toISOString(),
    comment: ''
  }] : [];

  const handleFilesChange = (newFiles: FileWithComment[]) => {
    // Converter array de volta para string única (compatibilidade)
    const fileUrl = newFiles.length > 0 ? newFiles[0].url : '';
    onDataChange({ imagemAnexada: fileUrl });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Anexar Imagem de Referência de Áreas</h2>
        <p className="text-sm text-muted-foreground">
          Anexe a imagem de referência das áreas vinculada ao cronograma da obra
        </p>
      </div>

      <FileUploadUnificado
        label="Imagem de Referência de Áreas"
        files={arquivos}
        onFilesChange={handleFilesChange}
        disabled={readOnly}
        osId={osId}
        maxFiles={1}
        acceptedTypes={['application/pdf', 'image/png', 'image/jpg', 'image/jpeg']}
      />

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-primary mt-0.5">ℹ️</div>
          <div>
            <p className="text-sm text-primary">
              <strong>Importante:</strong> Esta imagem deve conter a identificação clara das áreas que serão trabalhadas, servindo como referência para o cronograma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
