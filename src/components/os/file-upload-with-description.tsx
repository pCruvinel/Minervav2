import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from '../../lib/utils/safe-toast';
import { useOSDocumentUpload, type OSDocumento } from '../../lib/hooks/use-os-document-upload';

export interface FileUploadWithDescriptionProps {
    /** ID da ordem de serviço */
    osId?: string;
    /** ID da etapa (opcional) */
    etapaId?: string;
    /** Tipo de documento (ex: 'ART', 'RELATORIO_FOTOGRAFICO', etc) */
    tipoDocumento: string;
    /** Título exibido no componente */
    titulo?: string;
    /** Descrição/instrução para o usuário */
    instrucao?: string;
    /** Tipos de arquivo aceitos (ex: '.pdf', '.pdf,.jpg,.png') */
    acceptedFileTypes?: string;
    /** Tamanho máximo do arquivo em MB */
    maxFileSizeMB?: number;
    /** Callback chamado quando upload é concluído */
    onUploadComplete?: (documento: OSDocumento) => void;
    /** Callback chamado quando arquivo é removido */
    onFileRemove?: (documentoId: string) => void;
    /** Se true, permite múltiplos uploads */
    multiple?: boolean;
    /** Documentos já anexados */
    documentos?: OSDocumento[];
    /** Modo somente leitura */
    readOnly?: boolean;
}

export function FileUploadWithDescription({
    osId,
    etapaId,
    tipoDocumento,
    titulo = 'Upload de Arquivo',
    instrucao = 'Clique para selecionar ou arraste o arquivo',
    acceptedFileTypes = '.pdf,.jpg,.jpeg,.png',
    maxFileSizeMB = 10,
    onUploadComplete,
    onFileRemove,
    multiple = false,
    documentos = [],
    readOnly = false
}: FileUploadWithDescriptionProps) {
    const { uploadDocument, deleteDocument, isUploading } = useOSDocumentUpload(osId || '');
    const [descricao, setDescricao] = useState('');
    const [showDescriptionInput, setShowDescriptionInput] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamanho
        if (file.size > maxFileSizeMB * 1024 * 1024) {
            toast.error(`Arquivo muito grande. Tamanho máximo: ${maxFileSizeMB}MB`);
            return;
        }

        // Guardar arquivo e mostrar input de descrição
        setPendingFile(file);
        setShowDescriptionInput(true);
    };

    const handleCancelUpload = () => {
        setPendingFile(null);
        setShowDescriptionInput(false);
        setDescricao('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleConfirmUpload = async () => {
        if (!pendingFile) return;

        if (!osId) {
            toast.error('Erro: OS ainda não foi criada. Salve a etapa anterior primeiro.');
            return;
        }

        try {
            const documento = await uploadDocument({
                file: pendingFile,
                tipoDocumento,
                etapaId,
                descricao: descricao || undefined,
                metadata: {
                    etapa: tipoDocumento,
                }
            });

            toast.success('Arquivo enviado com sucesso!');

            if (onUploadComplete) {
                onUploadComplete(documento);
            }

            // Limpar estado
            handleCancelUpload();
        } catch (error) {
            console.error('Erro no upload:', error);
            toast.error('Erro ao fazer upload do arquivo');
        }
    };

    const handleRemove = async (documento: OSDocumento) => {
        if (readOnly) return;

        try {
            await deleteDocument(documento.id);
            toast.success('Arquivo removido com sucesso');

            if (onFileRemove) {
                onFileRemove(documento.id);
            }
        } catch (error) {
            console.error('Erro ao remover:', error);
            toast.error('Erro ao remover arquivo');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-4">
            {/* Título e Instrução */}
            <div>
                <h3 className="text-base font-medium mb-1">{titulo}</h3>
                <p className="text-sm text-muted-foreground">{instrucao}</p>
            </div>

            {/* Área de Upload */}
            {!showDescriptionInput && !readOnly && (
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-neutral-400 transition-colors">
                    <input
                        ref={fileInputRef}
                        type="file"
                        id={`file-upload-${tipoDocumento}`}
                        className="hidden"
                        accept={acceptedFileTypes}
                        onChange={handleFileSelect}
                        disabled={isUploading || readOnly}
                        multiple={multiple}
                    />
                    <label htmlFor={`file-upload-${tipoDocumento}`} className="cursor-pointer">
                        {isUploading ? (
                            <>
                                <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                                <p className="text-sm text-neutral-600 mb-2">Enviando arquivo...</p>
                            </>
                        ) : (
                            <>
                                <Upload className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                                <p className="text-sm text-neutral-600 mb-2">
                                    Clique para selecionar ou arraste o arquivo
                                </p>
                                <p className="text-xs text-neutral-500">
                                    Tipos aceitos: {acceptedFileTypes.replace(/\./g, '').toUpperCase()} • Máx: {maxFileSizeMB}MB
                                </p>
                            </>
                        )}
                    </label>
                </div>
            )}

            {/* Input de Descrição */}
            {showDescriptionInput && pendingFile && (
                <div className="border border-neutral-200 rounded-lg p-4 space-y-4 bg-neutral-50">
                    <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">{pendingFile.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(pendingFile.size)}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="descricao">Observação (opcional)</Label>
                        <Textarea
                            id="descricao"
                            placeholder="Adicione uma observação sobre este arquivo..."
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={handleCancelUpload}
                            disabled={isUploading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleConfirmUpload}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                'Confirmar Upload'
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Lista de Arquivos Anexados */}
            {documentos.length > 0 && (
                <div className="space-y-2">
                    <Label>Arquivos Anexados</Label>
                    {documentos.map((doc) => (
                        <div
                            key={doc.id}
                            className="flex items-start gap-3 p-3 bg-white border border-neutral-200 rounded-lg"
                        >
                            <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{doc.nome}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatFileSize(doc.tamanho_bytes)}
                                </p>
                                {doc.metadados?.descricao && (
                                    <p className="text-xs text-neutral-600 mt-1 italic">
                                        "{doc.metadados.descricao as string}"
                                    </p>
                                )}
                            </div>
                            {!readOnly && (
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => handleRemove(doc)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Alerta se não tem osId */}
            {!osId && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        A OS precisa ser criada antes de fazer upload de arquivos. Complete e salve a etapa anterior.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
