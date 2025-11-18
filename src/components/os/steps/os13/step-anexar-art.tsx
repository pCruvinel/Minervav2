import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../../ui/alert';
import { toast } from '../../../../lib/utils/safe-toast';

interface StepAnexarARTProps {
  data: { artAnexada: string };
  onDataChange: (data: any) => void;
}

export function StepAnexarART({ data, onDataChange }: StepAnexarARTProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileUrl = URL.createObjectURL(file);
      onDataChange({ artAnexada: fileUrl });
      toast.success('ART anexada com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer upload do arquivo');
    } finally {
      setUploading(false);
    }
  };

  const isComplete = !!data.artAnexada;

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

      {/* Upload */}
      {!isComplete && (
        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-neutral-400 transition-colors">
          <input
            type="file"
            id="file-upload-art"
            className="hidden"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="file-upload-art" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <p className="text-sm text-neutral-600 mb-2">
              Clique para selecionar ou arraste o arquivo
            </p>
            <p className="text-xs text-neutral-500">
              Apenas arquivos PDF até 10MB
            </p>
          </label>
        </div>
      )}

      {/* Arquivo anexado */}
      {isComplete && (
        <div className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#DDC063' }}
            >
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm">ART da Obra</p>
              <p className="text-xs text-neutral-500">Arquivo anexado</p>
            </div>
          </div>
          <button
            onClick={() => onDataChange({ artAnexada: '' })}
            className="text-sm text-red-500 hover:underline"
          >
            Remover
          </button>
        </div>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          A ART é obrigatória para o início da obra. Certifique-se de que o arquivo está legível e contém todas as informações necessárias.
        </AlertDescription>
      </Alert>
    </div>
  );
}
