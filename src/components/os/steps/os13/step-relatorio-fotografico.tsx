import React from 'react';
import { FileUploadUnificado } from '@/components/ui/file-upload-unificado';
import { FileWithComment } from '@/components/ui/file-upload-unificado';

export interface StepRelatorioFotograficoProps {
  data: { relatorioAnexado: string };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
  osId?: string;
}

export function StepRelatorioFotografico({ data, onDataChange, readOnly, osId }: StepRelatorioFotograficoProps) {
  // Converter string única para array de arquivos (compatibilidade)
  const arquivos: FileWithComment[] = data.relatorioAnexado ? [{
    id: 'relatorio-fotografico',
    name: 'Relatório Fotográfico Pré-Obra',
    url: data.relatorioAnexado,
    path: '',
    size: 0,
    type: 'application/pdf',
    uploadedAt: new Date().toISOString(),
    comment: ''
  }] : [];

  const handleFilesChange = (newFiles: FileWithComment[]) => {
    // Converter array de volta para string única (compatibilidade)
    const fileUrl = newFiles.length > 0 ? newFiles[0].url : '';
    onDataChange({ relatorioAnexado: fileUrl });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Anexar Relatório Fotográfico Pré-Obra</h2>
        <p className="text-sm text-muted-foreground">
          Anexe o relatório fotográfico da vistoria cautelar realizada antes do início da obra
        </p>
      </div>

      <FileUploadUnificado
        label="Relatório Fotográfico Pré-Obra"
        files={arquivos}
        onFilesChange={handleFilesChange}
        disabled={readOnly}
        osId={osId}
        maxFiles={1}
        acceptedTypes={['application/pdf']}
      />

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-primary mt-0.5">ℹ️</div>
          <div>
            <p className="text-sm text-primary">
              <strong>Importante:</strong> O relatório fotográfico pré-obra é essencial para documentar o estado inicial da edificação e áreas adjacentes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
