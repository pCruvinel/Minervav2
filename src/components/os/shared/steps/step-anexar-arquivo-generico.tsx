/**
 * @deprecated Este componente está DEPRECADO. Use `FileUploadUnificado` ao invés.
 * Mantido apenas para compatibilidade histórica.
 * 
 * StepAnexarArquivoGenerico - Componente genérico para anexar arquivos em etapas de workflow
 * 
 * Agora faz upload real para Supabase Storage e registra em os_documentos.
 */
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/lib/utils/safe-toast';
import { uploadAndRegisterDocument, deleteRegisteredDocument } from '@/lib/utils/upload-and-register';
import { logger } from '@/lib/utils/logger';

interface StepAnexarArquivoGenericoProps {
  /** Título da etapa */
  titulo: string;
  /** Descrição da etapa */
  descricao: string;
  /** Mensagem exibida quando upload é bem sucedido */
  mensagemSucesso: string;
  /** Mensagem exibida enquanto aguarda upload */
  mensagemPendente: string;
  /** Mensagem de alerta/ajuda */
  mensagemAlerta: string;
  /** Nome de exibição do arquivo */
  nomeArquivo: string;
  /** Formatos aceitos */
  acceptFormats?: string;
  /** Dados da etapa */
  data: { [key: string]: string };
  /** Chave onde a URL do arquivo será salva */
  dataKey: string;
  /** Callback para atualizar dados */
  onDataChange: (data: Record<string, unknown>) => void;
  /** Modo somente leitura */
  readOnly?: boolean;
  /** ID da OS (necessário para upload) */
  osId: string;
  /** ID da etapa (para rastreabilidade) */
  etapaId?: string;
  /** Tipo do documento para registro */
  tipoDocumento?: string;
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
  osId,
  etapaId,
  tipoDocumento = 'documento',
}: StepAnexarArquivoGenericoProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que temos osId
    if (!osId) {
      toast.error('Erro: ID da OS não disponível para upload');
      logger.error('osId não fornecido para StepAnexarArquivoGenerico');
      return;
    }

    // Validar tamanho (máx 25MB para imagens/docs)
    if (file.size > 25 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Tamanho máximo: 25MB');
      return;
    }

    setUploading(true);
    try {
      // Upload real para Supabase + registro em os_documentos
      const result = await uploadAndRegisterDocument({
        osId,
        etapaId,
        file,
        tipoDocumento,
        descricao: `${titulo} - ${nomeArquivo}`,
        visibilidade: 'interno'
      });

      // Salvar URL e ID do documento nos dados da etapa
      onDataChange({
        [dataKey]: result.url,
        [`${dataKey}DocumentoId`]: result.documentoId
      });

      toast.success(mensagemSucesso);
    } catch (error) {
      logger.error('Erro ao fazer upload do arquivo:', error);
      toast.error('Erro ao fazer upload do arquivo. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (readOnly) return;

    const documentoId = data[`${dataKey}DocumentoId`];

    try {
      // Se temos o ID do documento, deletar do banco e storage
      if (documentoId) {
        await deleteRegisteredDocument(documentoId);
      }

      onDataChange({
        [dataKey]: '',
        [`${dataKey}DocumentoId`]: ''
      });

      toast.success('Arquivo removido');
    } catch (error) {
      logger.error('Erro ao remover arquivo:', error);
      toast.error('Erro ao remover arquivo');
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
            className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isComplete ? 'bg-success' : 'bg-primary'}`}
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : isComplete ? (
              <CheckCircle2 className="w-6 h-6 text-white" />
            ) : (
              <FileText className="w-6 h-6 text-white" />
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-base mb-2">
              {uploading ? 'Enviando arquivo...' : (isComplete ? mensagemSucesso : mensagemPendente)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {uploading
                ? 'Por favor, aguarde o upload.'
                : isComplete
                  ? 'O arquivo foi anexado com sucesso.'
                  : 'Aguardando anexo do arquivo.'
              }
            </p>
          </div>
        </div>
      </div>

      {!isComplete && (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            id={`file-upload-${dataKey}`}
            className="hidden"
            accept={acceptFormats}
            onChange={handleFileUpload}
            disabled={uploading || readOnly}
          />
          <label htmlFor={`file-upload-${dataKey}`} className={`cursor-pointer ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
            {uploading ? (
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
            ) : (
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            )}
            <p className="text-sm text-muted-foreground mb-2">
              {uploading ? 'Enviando...' : 'Clique para selecionar ou arraste o arquivo'}
            </p>
            <p className="text-xs text-muted-foreground">
              Formatos aceitos: {acceptFormats}
            </p>
          </label>
        </div>
      )}

      {isComplete && (
        <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm">{nomeArquivo}</p>
              <p className="text-xs text-muted-foreground">Arquivo anexado</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={data[dataKey]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Visualizar
            </a>
            {!readOnly && (
              <button
                onClick={handleRemoveFile}
                className="text-sm text-destructive hover:underline"
              >
                Remover
              </button>
            )}
          </div>
        </div>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{mensagemAlerta}</AlertDescription>
      </Alert>
    </div>
  );
}
