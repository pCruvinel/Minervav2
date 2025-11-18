import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../../ui/alert';
import { toast } from '../../../../lib/utils/safe-toast';

interface StepAnexarArquivoGenericoProps {
  titulo: string;
  descricao: string;
  mensagemSucesso: string;
  mensagemPendente: string;
  mensagemAlerta: string;
  nomeArquivo: string;
  acceptFormats?: string;
  data: { [key: string]: string };
  dataKey: string;
  onDataChange: (data: any) => void;
}

export function StepAnexarArquivoGenerico({
  titulo,
  descricao,
  mensagemSucesso,
  mensagemPendente,
  mensagemAlerta,
  nomeArquivo,
  acceptFormats = '.pdf,.doc,.docx,.png,.jpg,.jpeg',
  data,
  dataKey,
  onDataChange,
}: StepAnexarArquivoGenericoProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileUrl = URL.createObjectURL(file);
      onDataChange({ [dataKey]: fileUrl });
      toast.success(mensagemSucesso);
    } catch (error) {
      toast.error('Erro ao fazer upload do arquivo');
    } finally {
      setUploading(false);
    }
  };

  const isComplete = !!data[dataKey];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">{titulo}</h2>
        <p className="text-sm text-neutral-600">{descricao}</p>
      </div>

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
              {isComplete ? mensagemSucesso : mensagemPendente}
            </h3>
            <p className="text-sm text-neutral-600">
              {isComplete 
                ? 'O arquivo foi anexado com sucesso.'
                : 'Aguardando anexo do arquivo.'
              }
            </p>
          </div>
        </div>
      </div>

      {!isComplete && (
        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-neutral-400 transition-colors">
          <input
            type="file"
            id={`file-upload-${dataKey}`}
            className="hidden"
            accept={acceptFormats}
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor={`file-upload-${dataKey}`} className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <p className="text-sm text-neutral-600 mb-2">
              Clique para selecionar ou arraste o arquivo
            </p>
            <p className="text-xs text-neutral-500">
              Formatos aceitos: {acceptFormats}
            </p>
          </label>
        </div>
      )}

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
              <p className="text-sm">{nomeArquivo}</p>
              <p className="text-xs text-neutral-500">Arquivo anexado</p>
            </div>
          </div>
          <button
            onClick={() => onDataChange({ [dataKey]: '' })}
            className="text-sm text-red-500 hover:underline"
          >
            Remover
          </button>
        </div>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{mensagemAlerta}</AlertDescription>
      </Alert>
    </div>
  );
}
