/**
 * ContratosSettingsTab - Aba de configuração de modelos de contrato
 *
 * Permite fazer UPLOAD de um arquivo de modelo de contrato
 * para cada tipo de Ordem de Serviço. Esse arquivo fica disponível
 * para download na etapa "Gerar Contrato" do workflow.
 */
'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Trash2, Loader2, CheckCircle, File } from 'lucide-react';
import { toast } from 'sonner';
import { useModelosContrato } from '@/lib/hooks/use-modelos-contrato';

export function ContratosSettingsTab() {
    const [selectedTipoOs, setSelectedTipoOs] = useState<string>('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        tiposOs,
        modelo,
        isLoading,
        isSaving,
        fetchModelo,
        uploadArquivo,
        deleteModelo,
    } = useModelosContrato();

    // When an OS type is selected, fetch its template
    const handleTipoOsChange = useCallback((value: string) => {
        setSelectedTipoOs(value);
        fetchModelo(value);
    }, [fetchModelo]);

    // File upload
    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedTipoOs) return;

        // Validate size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Arquivo muito grande. Tamanho máximo: 10MB');
            return;
        }

        // Validate type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Tipo de arquivo não permitido. Use apenas PDF ou DOC/DOCX');
            return;
        }

        await uploadArquivo(selectedTipoOs, file);

        // Clear input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [selectedTipoOs, uploadArquivo]);

    // Delete
    const handleDeleteConfirm = useCallback(async () => {
        setShowDeleteDialog(false);
        if (!selectedTipoOs) return;
        await deleteModelo(selectedTipoOs);
    }, [selectedTipoOs, deleteModelo]);

    const tipoSelecionadoLabel = tiposOs.find(t => t.id === selectedTipoOs)?.codigo;

    // File extension badge color
    const getExtBadge = (nome: string) => {
        const ext = nome.split('.').pop()?.toLowerCase() || '';
        if (ext === 'pdf') return 'destructive' as const;
        return 'secondary' as const;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Modelos de Contrato</CardTitle>
                            <CardDescription>
                                Faça upload do arquivo de modelo de contrato para cada tipo de OS.
                                Este arquivo ficará disponível para download na etapa de geração do contrato.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* OS type selector */}
                    <div className="max-w-md">
                        <Select value={selectedTipoOs} onValueChange={handleTipoOsChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de OS" />
                            </SelectTrigger>
                            <SelectContent>
                                {tiposOs.map((tipo) => (
                                    <SelectItem key={tipo.id} value={tipo.id}>
                                        <span className="font-mono text-primary mr-2">{tipo.codigo}</span>
                                        {tipo.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* File upload/display area */}
            {selectedTipoOs && !isLoading && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">
                            Modelo - <span className="text-primary font-mono">{tipoSelecionadoLabel}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* No file uploaded yet */}
                        {!modelo?.arquivo_path && (
                            <div className="flex flex-col items-center justify-center py-12 gap-4 border-2 border-dashed rounded-lg bg-muted/20">
                                <FileText className="h-16 w-16 text-muted-foreground/40" />
                                <p className="text-muted-foreground text-sm">
                                    Nenhum modelo de contrato cadastrado para este tipo de OS
                                </p>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileSelect}
                                    disabled={isSaving}
                                    className="hidden"
                                />

                                <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Fazer Upload do Modelo
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-muted-foreground">
                                    Formatos aceitos: PDF, DOC, DOCX • Tamanho máximo: 10MB
                                </p>
                            </div>
                        )}

                        {/* File uploaded — show info */}
                        {modelo?.arquivo_path && modelo?.arquivo_nome && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg border bg-success/5 border-success/20">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                                        <div className="flex items-center gap-2">
                                            <File className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{modelo.arquivo_nome}</span>
                                            <Badge variant={getExtBadge(modelo.arquivo_nome)} className="text-xs">
                                                {modelo.arquivo_nome.split('.').pop()?.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Replace file */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileSelect}
                                            disabled={isSaving}
                                            className="hidden"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Upload className="w-4 h-4 mr-2" />
                                            )}
                                            Substituir
                                        </Button>

                                        {/* Delete */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowDeleteDialog(true)}
                                            disabled={isSaving}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Loading */}
            {selectedTipoOs && isLoading && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Carregando modelo...</p>
                    </CardContent>
                </Card>
            )}

            {/* Empty state */}
            {!selectedTipoOs && (
                <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                        <p className="text-muted-foreground">
                            Selecione um tipo de OS acima para gerenciar o modelo de contrato
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Delete dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover modelo de contrato?</AlertDialogTitle>
                        <AlertDialogDescription>
                            O arquivo será removido permanentemente. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>
                            Confirmar Remoção
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
