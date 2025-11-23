import React from 'react';
import { Upload, File, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface ArquivoComComentario {
  file: { name: string };
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
}

export function FileUploadSection({
  label,
  files,
  onFilesChange,
  accept = '*',
  multiple = true,
  required = false,
  disabled = false,
}: FileUploadSectionProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles: ArquivoComComentario[] = Array.from(selectedFiles).map(file => ({
      file: { name: file.name },
      comment: '',
    }));

    onFilesChange([...files, ...newFiles]);

    // Resetar input para permitir upload do mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    const newFiles: ArquivoComComentario[] = Array.from(droppedFiles).map(file => ({
      file: { name: file.name },
      comment: '',
    }));

    onFilesChange([...files, ...newFiles]);
  };

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {/* Área de Upload */}
      <div
        className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
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

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((item, index) => (
            <div key={index} className="border border-neutral-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-primary" />
                  <span className="text-sm">{item.file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  disabled={disabled}
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
