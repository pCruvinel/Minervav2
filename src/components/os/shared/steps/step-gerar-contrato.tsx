import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, Upload, Download, Loader2, X } from 'lucide-react';
import { toast } from '@/lib/utils/safe-toast';
import { supabase } from '@/lib/supabase-client';

interface StepGerarContratoProps {
  data: {
    contratoFile?: File | null;
    contratoUrl?: string;
    dataUpload?: string;
    // Dados necessários para o modelo
    osId: string;
    codigoOS: string;
    numeroContrato?: string;
    clienteNome: string;
    clienteCpfCnpj: string;
    valorContrato: number;
    dataInicio: string;
    objetoContrato?: string;
    [key: string]: unknown;
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export function StepGerarContrato({ data, onDataChange, readOnly = false }: StepGerarContratoProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Upload para Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `contrato-${Date.now()}.${fileExt}`;
      const filePath = `os/${data.osId}/contratos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      onDataChange({
        ...data,
        contratoFile: file,
        contratoUrl: urlData.publicUrl,
        dataUpload: new Date().toISOString().split('T')[0]
      });

      toast.success('Contrato enviado com sucesso!');

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar contrato. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadModelo = () => {
    // Aqui você pode implementar o download do modelo de contrato
    // Por exemplo, um PDF template hospedado no Supabase Storage
    toast.info('Baixando modelo de contrato...');
    
    // Exemplo: link para modelo
    const modeloUrl = '/modelos/modelo-contrato.pdf';
    const link = document.createElement('a');
    link.href = modeloUrl;
    link.download = 'modelo-contrato.pdf';
    link.click();
  };

  const handleRemoveFile = async () => {
    if (!data.contratoUrl) return;

    try {
      // Extrair path do URL
      const urlParts = data.contratoUrl.split('/uploads/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        
        const { error } = await supabase.storage
          .from('uploads')
          .remove([filePath]);

        if (error) throw error;
      }

      onDataChange({
        ...data,
        contratoFile: null,
        contratoUrl: undefined,
        dataUpload: undefined
      });

      toast.success('Contrato removido com sucesso');
    } catch (error: any) {
      console.error('Erro ao remover arquivo:', error);
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
      {!data.contratoUrl && (
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
              disabled={readOnly}
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Modelo
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center max-w-md">
            Formatos aceitos: PDF, DOC, DOCX • Tamanho máximo: 10MB
          </p>
        </div>
      )}

      {/* Contrato Anexado */}
      {data.contratoUrl && (
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
                    href={data.contratoUrl}
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
