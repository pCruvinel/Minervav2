import React, { useState } from 'react';
import { Upload, File, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadFile } from '@/lib/utils/supabase-storage';
import { toast } from '@/lib/utils/safe-toast';

interface ArquivoComComentario {
  id: string;
  name: string;
  url: string;
  path: string;
  size: number;
  type: string;
  uploadedAt: string;
  comment: string;
}

interface FileUploadSectionProps {
  label: string;
  files: ArquivoComComentario[];
  onFilesChange: (files: ArquivoComComentario[]) => void;
  accept?: string;
  multiple?: boolean;
  required?: boolean;
  disabled?: boolean;
  osId?: string;
  colaboradorId?: string;
}

export function FileUploadSection({
  label,
  files,
  onFilesChange,
  accept = '*',
  multiple = true,
  required = false,
  disabled = false,
  osId,
  colaboradorId,
  // New props for deferred upload
  pendingFiles = [],
  onPendingFilesChange,
}: FileUploadSectionProps & {
  pendingFiles?: File[];
  onPendingFilesChange?: (files: File[]) => void;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

  // Helper to upload a single file (used for immediate upload or deferred)
  const uploadFileToStorage = async (file: File): Promise<ArquivoComComentario> => {
    if (!osId || !colaboradorId) {
      throw new Error('OS ID e Colaborador ID são necessários para upload');
    }

    try {
      const uploadedFile = await uploadFile({
        file,
        osNumero: `os${osId}`,
        etapa: 'follow-up1',
        osId,
        colaboradorId,
      });

      return {
        id: uploadedFile.id,
        name: uploadedFile.name,
        url: uploadedFile.url,
        path: uploadedFile.path,
        size: uploadedFile.size,
        type: uploadedFile.type,
        uploadedAt: uploadedFile.uploadedAt,
        comment: '',
      };
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      throw error;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    // If deferred mode is active (onPendingFilesChange provided)
    if (onPendingFilesChange) {
      const newFiles = Array.from(selectedFiles);
      onPendingFilesChange([...pendingFiles, ...newFiles]);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Immediate upload mode (Legacy behavior)
    if (!osId || !colaboradorId) {
      toast.error('Não é possível anexar arquivos: OS ou Colaborador não identificados.');
      console.error('Missing IDs for upload:', { osId, colaboradorId });
      return;
    }

    // Marcar arquivos como uploading
    const fileNames = Array.from(selectedFiles).map(f => f.name);
    setUploadingFiles(prev => new Set([...prev, ...fileNames]));

    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        try {
          const uploadedFile = await uploadFileToStorage(file);
          return uploadedFile;
        } catch (error) {
          console.error(`Erro ao fazer upload de ${file.name}:`, error);
          try {
            toast.error(`Erro ao fazer upload de ${file.name}`);
          } catch (toastError) {
            console.error('Erro ao exibir toast:', toastError);
          }
          return null;
        }
      });

      const uploadedFiles = (await Promise.all(uploadPromises)).filter(Boolean) as ArquivoComComentario[];

      if (uploadedFiles.length > 0) {
        onFilesChange([...files, ...uploadedFiles]);
        try {
          toast.success(`${uploadedFiles.length} arquivo(s) enviado(s) com sucesso`);
        } catch (toastError) {
          console.error('Erro ao exibir toast de sucesso:', toastError);
        }
      }
    } finally {
      // Remover arquivos da lista de uploading
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        fileNames.forEach(name => newSet.delete(name));
        return newSet;
      });

      // Resetar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    // TODO: Optionally delete file from storage when removed
  };

  const handleRemovePendingFile = (index: number) => {
    if (onPendingFilesChange) {
      const newPending = pendingFiles.filter((_, i) => i !== index);
      onPendingFilesChange(newPending);
    }
  };

  const handleCommentChange = (index: number, comment: string) => {
    const newFiles = [...files];
    newFiles[index] = { ...newFiles[index], comment };
    onFilesChange(newFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    // Mesmo processo que handleFileSelect
    await handleFileSelect({ target: { files: droppedFiles } } as any);
  };

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {/* Área de Upload */}
      <div
        className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Clique para selecionar ou arraste arquivos aqui
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {multiple ? 'Múltiplos arquivos permitidos' : 'Arquivo único'} • Você poderá adicionar comentários após o upload
        </p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
        />
      </div>

      {/* Lista de Arquivos Pendentes (Ainda não enviados) */}
      {pendingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-warning mb-2">Arquivos aguardando envio:</p>
          {pendingFiles.map((file, index) => (
            <div key={`pending-${index}`} className="border border-warning/20 bg-warning/5 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-warning" />
                  <span className="text-sm text-warning">{file.name}</span>
                  <span className="text-xs text-warning">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePendingFile(index)}
                  disabled={disabled}
                  className="text-warning hover:text-warning hover:bg-warning/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de Arquivos Já Enviados */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">Arquivos anexados:</p>
          {files.map((item, index) => (
            <div key={index} className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-primary" />
                  <span className="text-sm">{item.name}</span>
                  {uploadingFiles.has(item.name) && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  disabled={disabled || uploadingFiles.has(item.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Adicionar comentário..."
                value={item.comment}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleCommentChange(index, e.target.value)
                }
                disabled={disabled}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
