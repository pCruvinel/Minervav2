import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/lib/utils/safe-toast';

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
  readOnly?: boolean;
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
  readOnly,
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
        <p className="text-sm text-muted-foreground">{descricao}</p>
      </div>

      <div className="border border-border rounded-lg p-6 bg-background">
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: isComplete ? 'var(--success)' : 'var(--primary)' }}
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
            <p className="text-sm text-muted-foreground">
              {isComplete 
                ? 'O arquivo foi anexado com sucesso.'
                : 'Aguardando anexo do arquivo.'
              }
            </p>
          </div>
        </div>
      </div>

      {!isComplete && (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-border transition-colors">
          <input
            type="file"
            id={`file-upload-${dataKey}`}
            className="hidden"
            accept={acceptFormats}
            onChange={handleFileUpload}
            disabled={uploading || readOnly}
          />
          <label htmlFor={`file-upload-${dataKey}`} className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Clique para selecionar ou arraste o arquivo
            </p>
            <p className="text-xs text-muted-foreground">
              Formatos aceitos: {acceptFormats}
            </p>
          </label>
        </div>
      )}

      {isComplete && (
        <div className="flex items-center justify-between p-4 bg-white border border-border rounded-lg">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm">{nomeArquivo}</p>
              <p className="text-xs text-muted-foreground">Arquivo anexado</p>
            </div>
          </div>
          <button
            onClick={readOnly ? undefined : () => onDataChange({ [dataKey]: '' })}
            className={`text-sm text-destructive hover:underline ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={readOnly}
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
