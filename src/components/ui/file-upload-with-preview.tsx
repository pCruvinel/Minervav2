import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Label } from './label';
import { Textarea } from './textarea';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import {
    Upload,
    FileText,
    Image as ImageIcon,
    ExternalLink,
    Trash2,
    Edit3,
    Check,
    X,
    Loader2
} from 'lucide-react';
import { toast } from '@/lib/utils/safe-toast';
import { supabase } from '@/lib/supabase-client';

export interface FileWithComment {
    id: string;
    name: string;
    url: string;
    path: string;
    size: number;
    type: string;
    uploadedAt: string;
    comment: string;
}

interface FileUploadWithPreviewProps {
    label: string;
    files: FileWithComment[];
    onFilesChange: (files: FileWithComment[]) => void;
    accept?: string;
    disabled?: boolean;
    osId?: string;
    maxFiles?: number;
    maxFileSize?: number; // in MB
    allowedTypes?: string[];
}

export function FileUploadWithPreview({
    label,
    files,
    onFilesChange,
    accept = "image/*,.pdf,.doc,.docx",
    disabled = false,
    osId,
    maxFiles = 10,
    maxFileSize = 10, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}: FileUploadWithPreviewProps) {
    const [uploading, setUploading] = useState(false);
    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [tempComment, setTempComment] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);

        if (selectedFiles.length === 0) return;

        // Check file limits
        if (files.length + selectedFiles.length > maxFiles) {
            toast.error(`Máximo de ${maxFiles} arquivos permitidos`);
            return;
        }

        // Validate files
        for (const file of selectedFiles) {
            if (file.size > maxFileSize * 1024 * 1024) {
                toast.error(`Arquivo ${file.name} é muito grande. Máximo: ${maxFileSize}MB`);
                return;
            }

            if (!allowedTypes.includes(file.type)) {
                toast.error(`Tipo de arquivo não permitido: ${file.name}`);
                return;
            }
        }

        setUploading(true);

        try {
            const uploadedFiles: FileWithComment[] = [];

            for (const file of selectedFiles) {
                // Upload to Supabase Storage
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = osId ? `os/${osId}/${fileName}` : `temp/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('os-files')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                // Get public URL
                const { data: urlData } = supabase.storage
                    .from('os-files')
                    .getPublicUrl(filePath);

                const fileWithComment: FileWithComment = {
                    id: Date.now().toString() + Math.random().toString(36).substring(2),
                    name: file.name,
                    url: urlData.publicUrl,
                    path: filePath,
                    size: file.size,
                    type: file.type,
                    uploadedAt: new Date().toISOString(),
                    comment: ''
                };

                uploadedFiles.push(fileWithComment);
            }

            onFilesChange([...files, ...uploadedFiles]);
            toast.success(`${uploadedFiles.length} arquivo(s) enviado(s) com sucesso`);

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            toast.error('Erro ao enviar arquivo. Tente novamente.');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = (file: FileWithComment) => {
        // Abrir em nova aba para visualização
        window.open(file.url, '_blank');
    };

    const handleDelete = async (fileToDelete: FileWithComment) => {
        try {
            // Delete from Supabase Storage
            const { error } = await supabase.storage
                .from('os-files')
                .remove([fileToDelete.path]);

            if (error) throw error;

            // Remove from local state
            onFilesChange(files.filter(f => f.id !== fileToDelete.id));
            toast.success('Arquivo removido com sucesso');
        } catch (error) {
            console.error('Erro ao deletar arquivo:', error);
            toast.error('Erro ao remover arquivo. Tente novamente.');
        }
    };

    const startEditingComment = (fileId: string, currentComment: string) => {
        setEditingComment(fileId);
        setTempComment(currentComment);
    };

    const saveComment = (fileId: string) => {
        const updatedFiles = files.map(file =>
            file.id === fileId ? { ...file, comment: tempComment } : file
        );
        onFilesChange(updatedFiles);
        setEditingComment(null);
        setTempComment('');
    };

    const cancelEditingComment = () => {
        setEditingComment(null);
        setTempComment('');
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith('image/')) {
            return <ImageIcon className="h-8 w-8 text-primary" />;
        }
        return <FileText className="h-8 w-8 text-muted-foreground" />;
    };

    const getFilePreview = (file: FileWithComment) => {
        // Preview para imagens (PNG, JPEG, GIF, WebP)
        if (file.type.startsWith('image/')) {
            return (
                <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(file.url, '_blank')}
                />
            );
        }

        // Preview para PDFs
        if (file.type === 'application/pdf') {
            return (
                <div 
                    className="w-full h-32 relative rounded overflow-hidden cursor-pointer group"
                    onClick={() => window.open(file.url, '_blank')}
                >
                    {/* Embed do PDF como preview */}
                    <object
                        data={`${file.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                        type="application/pdf"
                        className="w-full h-full pointer-events-none"
                    >
                        {/* Fallback se o browser não suportar object */}
                        <div className="w-full h-full bg-red-50 flex items-center justify-center">
                            <FileText className="h-10 w-10 text-red-500" />
                        </div>
                    </object>
                    {/* Overlay para indicar que é clicável */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
                            <FileText className="h-5 w-5 text-red-600" />
                        </div>
                    </div>
                    {/* Badge PDF no canto */}
                    <Badge 
                        variant="secondary" 
                        className="absolute top-1 left-1 text-[10px] px-1 py-0 bg-red-100 text-red-700 border-red-200"
                    >
                        PDF
                    </Badge>
                </div>
            );
        }

        // Fallback para outros tipos de arquivo
        return (
            <div
                className="w-full h-32 bg-muted rounded flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => window.open(file.url, '_blank')}
            >
                {getFileIcon(file.type)}
                <span className="text-xs text-muted-foreground mt-2">
                    {file.name.split('.').pop()?.toUpperCase()}
                </span>
            </div>
        );
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-medium">{label}</Label>
                <Badge variant="outline" className="text-xs">
                    {files.length}/{maxFiles} arquivos
                </Badge>
            </div>

            {/* Upload Area */}
            <Card className={`border-2 border-dashed transition-colors ${disabled ? 'border-border bg-background' : 'border-border hover:border-primary'}`}>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={accept}
                            onChange={handleFileSelect}
                            disabled={disabled || uploading || files.length >= maxFiles}
                            className="hidden"
                        />

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled || uploading || files.length >= maxFiles}
                            className="mb-4"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Selecionar Arquivos
                                </>
                            )}
                        </Button>

                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>Formatos aceitos: PDF, PNG, JPG, DOC, DOCX</p>
                            <p>Tamanho máximo: {maxFileSize}MB por arquivo</p>
                            <p>Máximo de {maxFiles} arquivos</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Files List */}
            {files.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {files.map((file) => (
                        <Card key={file.id} className="overflow-hidden">
                            <CardContent className="p-4">
                                {/* File Preview */}
                                <div className="mb-3">
                                    {getFilePreview(file)}
                                </div>

                                {/* File Info */}
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate" title={file.name}>
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                        <div className="flex gap-1 ml-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownload(file)}
                                                title="Abrir em nova aba"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                            {!disabled && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(file)}
                                                    title="Remover"
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Comment Section */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium">Comentário:</Label>
                                        {editingComment === file.id ? (
                                            <div className="space-y-2">
                                                <Textarea
                                                    value={tempComment}
                                                    onChange={(e) => setTempComment(e.target.value)}
                                                    placeholder="Adicione um comentário..."
                                                    rows={2}
                                                    className="text-xs"
                                                />
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => saveComment(file.id)}
                                                        className="h-6 px-2"
                                                    >
                                                        <Check className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={cancelEditingComment}
                                                        className="h-6 px-2"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-start gap-2">
                                                <p className="text-xs text-muted-foreground flex-1 min-h-[2rem] bg-background p-2 rounded">
                                                    {file.comment || 'Sem comentário'}
                                                </p>
                                                {!disabled && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => startEditingComment(file.id, file.comment)}
                                                        title="Editar comentário"
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <Edit3 className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {files.length === 0 && (
                <Card className="bg-background border-dashed">
                    <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                        Nenhum arquivo enviado ainda
                    </CardContent>
                </Card>
            )}
        </div>
    );
}