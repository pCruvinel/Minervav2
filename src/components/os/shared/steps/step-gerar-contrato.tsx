import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, Upload, Download, Loader2, X } from 'lucide-react';
import { toast } from '@/lib/utils/safe-toast';
import { uploadAndRegisterDocument } from '@/lib/utils/upload-and-register';
import { logger } from '@/lib/utils/logger';
import { supabase } from '@/lib/supabase-client';

interface StepGerarContratoProps {
  data: {
    contratoFile?: File | null;
    contratoUrl?: string;
    contratoPath?: string;
    contratoDocumentoId?: string;
    dataUpload?: string;
    osId: string;
    codigoOS: string;
    tipoOsId?: string;
    [key: string]: unknown;
  };
  /** ID da etapa atual (para rastreabilidade) */
  etapaId?: string;
  onDataChange: (data: Record<string, unknown>) => void;
  readOnly?: boolean;
}

export function StepGerarContrato({ data, etapaId, onDataChange, readOnly = false }: StepGerarContratoProps) {
  const [uploading, setUploading] = useState(false);
  const [downloadingModelo, setDownloadingModelo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State local para URL de exibição (prioridade: URL assinada fresca > data.contratoUrl)
  const [displayUrl, setDisplayUrl] = useState<string | undefined>(data.contratoUrl);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    // Validar tipo
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Use apenas PDF ou DOC/DOCX');
      return;
    }

    setUploading(true);

    try {
      // Usar helper centralizado para upload + registro em os_documentos
      const result = await uploadAndRegisterDocument({
        osId: data.osId,
        etapaId,
        file,
        tipoDocumento: 'contrato',
        descricao: `Contrato - ${data.codigoOS || ''}`,
        visibilidade: 'cliente'
      });

      // Dupla persistência: salvar em dados_etapa também (compatibilidade)
      const newData = {
        ...data,
        contratoFile: file,
        contratoUrl: result.url,
        contratoPath: result.path,
        contratoDocumentoId: result.documentoId,
        dataUpload: new Date().toISOString().split('T')[0]
      };

      onDataChange(newData);

      toast.success('Contrato enviado com sucesso!');

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      logger.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar contrato. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  // Gerar URL assinada atualizada ao carregar
  useEffect(() => {
    const refreshUrl = async () => {
      if (data.contratoPath && !data.contratoFile) {
        try {
          const { data: signedData } = await supabase.storage
            .from('os-documents')
            .createSignedUrl(data.contratoPath, 3600);

          if (signedData?.signedUrl) {
            setDisplayUrl(signedData.signedUrl);
          }
        } catch (e) {
          console.error("Erro ao gerar URL assinada:", e);
        }
      } else if (data.contratoUrl) {
        setDisplayUrl(data.contratoUrl);
      }
    };

    refreshUrl();
  }, [data.contratoPath, data.contratoUrl, data.contratoFile]);

  // Baixar modelo de contrato cadastrado nas configurações (por tipo de OS)
  const handleDownloadModelo = async () => {
    if (!data.tipoOsId) {
      toast.error('Tipo de OS não identificado.');
      return;
    }

    setDownloadingModelo(true);

    try {
      // Buscar modelo cadastrado para este tipo de OS
      const { data: modelo, error } = await supabase
        .from('modelos_contrato')
        .select('arquivo_path, arquivo_nome')
        .eq('tipo_os_id', data.tipoOsId)
        .eq('ativo', true)
        .maybeSingle();

      if (error) {
        logger.error('Erro ao buscar modelo de contrato:', error);
        toast.error('Erro ao buscar modelo de contrato.');
        return;
      }

      if (!modelo?.arquivo_path) {
        toast.warning('Nenhum modelo de contrato cadastrado para este tipo de OS. Cadastre um modelo em Configurações → Ordens de Serviço → Contratos.');
        return;
      }

      // Gerar URL assinada e iniciar download
      const { data: signedData, error: signedError } = await supabase.storage
        .from('os-documents')
        .createSignedUrl(modelo.arquivo_path, 3600);

      if (signedError || !signedData?.signedUrl) {
        logger.error('Erro ao gerar URL para download:', signedError);
        toast.error('Erro ao gerar link de download.');
        return;
      }

      // Trigger download
      const link = document.createElement('a');
      link.href = signedData.signedUrl;
      link.download = modelo.arquivo_nome || 'modelo-contrato';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download iniciado!');
    } catch (err) {
      logger.error('Erro inesperado ao baixar modelo:', err);
      toast.error('Erro ao baixar modelo de contrato.');
    } finally {
      setDownloadingModelo(false);
    }
  };

  const handleRemoveFile = async () => {
    if (!data.contratoUrl) return;

    try {
      // Remove from storage if path is known
      if (data.contratoPath) {
        await supabase.storage
          .from('os-documents')
          .remove([data.contratoPath as string]);
      }

      // Remove from os_documentos table if registered
      if (data.contratoDocumentoId) {
        await supabase
          .from('os_documentos')
          .delete()
          .eq('id', data.contratoDocumentoId as string);
      }

      onDataChange({
        ...data,
        contratoFile: null,
        contratoUrl: undefined,
        contratoPath: undefined,
        contratoDocumentoId: undefined,
        dataUpload: undefined
      });

      setDisplayUrl(undefined);

      toast.success('Contrato removido com sucesso');
    } catch (error) {
      logger.error('Erro ao remover arquivo:', error);
      toast.error('Erro ao remover contrato');
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Faça upload do contrato de prestação de serviços assinado pelas partes ou baixe o modelo para edição.
        </AlertDescription>
      </Alert>

      {/* Área de Upload/Download */}
      {!displayUrl && (
        <div className="flex flex-col items-center justify-center py-12 gap-6 border-2 border-dashed rounded-lg bg-muted/20">
          <FileText className="h-16 w-16 text-muted-foreground" />

          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              disabled={uploading || readOnly}
              className="hidden"
            />

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || readOnly}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload de Contrato
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleDownloadModelo}
              disabled={readOnly || downloadingModelo}
            >
              {downloadingModelo ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Baixando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Modelo
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center max-w-md">
            Formatos aceitos: PDF, DOC, DOCX • Tamanho máximo: 10MB
          </p>
        </div>
      )}

      {/* Contrato Anexado */}
      {displayUrl && (
        <Card className="bg-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <div className="text-sm font-medium">Contrato anexado com sucesso!</div>
                  <div className="text-xs text-muted-foreground">
                    Data: {data.dataUpload}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a
                    href={displayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Visualizar
                  </a>
                </Button>
                {!readOnly && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
