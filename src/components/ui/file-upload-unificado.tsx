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
    Download,
    Trash2,
    Edit3,
    Check,
    X,
    Loader2,
    Plus
} from 'lucide-react';
import { toast } from '../../lib/utils/safe-toast';
import { supabase } from '../../lib/supabase-client';

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

interface FileUploadUnificadoProps {
    label: string;
    files: FileWithComment[];
    onFilesChange: (files: FileWithComment[]) => void;
    disabled?: boolean;
    osId?: string;
    maxFiles?: number;
    maxFileSize?: number; // in MB
    acceptedTypes?: string[];
}

const DEFAULT_ACCEPTED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc (formato antigo)
    'image/jpeg',
    'image/png',
    'image/jpg' // alguns browsers usam este
];

const DEFAULT_ACCEPTED_EXTENSIONS = '.pdf,.docx,.jpg,.jpeg,.png';

export function FileUploadUnificado({
    label,
    files,
    onFilesChange,
    disabled = false,
    osId,
    maxFiles = 10,
    maxFileSize = 10, // 10MB default
    acceptedTypes = DEFAULT_ACCEPTED_TYPES
}: FileUploadUnificadoProps) {
    const [uploading, setUploading] = useState(false);
    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [tempComment, setTempComment] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (selectedFiles: FileList | null) => {
        if (!selectedFiles || selectedFiles.length === 0) return;

        const filesArray = Array.from(selectedFiles);

        // Check file limits
        if (files.length + filesArray.length > maxFiles) {
            toast.error(`Máximo de ${maxFiles} arquivos permitidos`);
            return;
        }

        // Validate files
        for (const file of filesArray) {
            if (file.size > maxFileSize * 1024 * 1024) {
                toast.error(`Arquivo ${file.name} é muito grande. Máximo: ${maxFileSize}MB`);
                return;
            }

            // Verificar por MIME type ou extensão
            const fileExtension = file.name.toLowerCase().split('.').pop();
            const allowedExtensions = ['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png'];

            const isValidType = acceptedTypes.includes(file.type) || allowedExtensions.includes(fileExtension || '');

            if (!isValidType) {
                toast.error(`Tipo de arquivo não permitido: ${file.name}. Use apenas: PDF, DOC, DOCX, JPG, PNG`);
                return;
            }
        }

        setUploading(true);

        try {
            const uploadedFiles: FileWithComment[] = [];

            for (const file of filesArray) {
                // Upload to Supabase Storage
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = osId ? `os/${osId}/${fileName}` : `temp/${fileName}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('uploads')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                // Get public URL
                const { data: urlData } = supabase.storage
                    .from('uploads')
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
        } catch (error: any) {
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
                .from('uploads')
                .remove([fileToDelete.path]);

            if (error) throw error;

            // Remove from local state
            onFilesChange(files.filter(f => f.id !== fileToDelete.id));
            toast.success('Arquivo removido com sucesso');
        } catch (error: any) {
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
            return <ImageIcon className="h-8 w-8 text-blue-500" />;
        }
        return <FileText className="h-8 w-8 text-gray-500" />;
    };

    const getFilePreview = (file: FileWithComment) => {
        if (file.type.startsWith('image/')) {
            return (
                <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleDownload(file)}
                />
            );
        }

        return (
            <div
                className="w-full h-32 bg-gray-100 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleDownload(file)}
            >
                {getFileIcon(file.type)}
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

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setDragOver(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);

        if (disabled) return;

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
            handleFileSelect(droppedFiles);
        }
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
            <Card
                className={`border-2 border-dashed transition-colors ${dragOver
                    ? 'border-primary bg-primary/5'
                    : disabled
                        ? 'border-gray-200 bg-gray-50'
                        : 'border-gray-300 hover:border-primary'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <CardContent className="pt-6">
                    <div className="text-center">
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={DEFAULT_ACCEPTED_EXTENSIONS}
                            onChange={(e) => handleFileSelect(e.target.files)}
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
                                    <Plus className="mr-2 h-4 w-4" />
                                    Selecionar Arquivos
                                </>
                            )}
                        </Button>

                        <div className="text-sm text-gray-600 space-y-1">
                            <p>Clique para selecionar ou arraste arquivos aqui</p>
                            <p>Formatos aceitos: PDF, DOC, DOCX, JPG, PNG</p>
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
                                            <p className="text-xs text-gray-500">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                        <div className="flex gap-1 ml-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownload(file)}
                                                title="Download"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            {!disabled && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(file)}
                                                    title="Remover"
                                                    className="text-red-500 hover:text-red-700"
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
                                                <p className="text-xs text-gray-600 flex-1 min-h-[2rem] bg-gray-50 p-2 rounded">
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
                <Card className="bg-gray-50 border-dashed">
                    <CardContent className="pt-6 text-center text-sm text-gray-500">
                        Nenhum arquivo enviado ainda
                    </CardContent>
                </Card>
            )}
        </div>
    );
}