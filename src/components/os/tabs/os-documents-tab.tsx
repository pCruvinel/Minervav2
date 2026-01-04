import React, { useState, useEffect } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    FileText,
    Upload,
    MoreVertical,
    Download,
    Trash2,
    Loader2,
    File,
    Image as ImageIcon,
    FileSpreadsheet,
    Lock,
    Users,
    Globe,
    Link2,
    Eye
} from 'lucide-react';
import { toast } from '@/lib/utils/safe-toast';
import { useOSDocumentUpload, OSDocumento, VisibilidadeDocumento } from '@/lib/hooks/use-os-document-upload';
import { supabase } from '@/lib/supabase-client';

interface OSDocumentsTabProps {
    osId: string;
    /** IDs de OS relacionadas (Lead/Contrato) para buscar documentos unificados */
    relatedOsIds?: string[];
}

const DOCUMENT_TYPES = [
    { value: 'contrato', label: 'Contrato' },
    { value: 'proposta', label: 'Proposta' },
    { value: 'tecnico', label: 'Relatório Técnico' },
    { value: 'financeiro', label: 'Comprovante Financeiro' },
    { value: 'laudo', label: 'Laudo/Vistoria' },
    { value: 'planta', label: 'Planta/Projeto' },
    { value: 'imagem', label: 'Imagem/Foto' },
    { value: 'outros', label: 'Outros' }
];

// Tipo estendido para incluir origem, etapa e usuário
interface OSDocumentoWithOrigin extends OSDocumento {
    origemOsCodigo?: string;
    isFromRelatedOS?: boolean;
    descricao?: string;
    nomeEtapa?: string;
    enviadoPor?: string;
}

export function OSDocumentsTab({ osId, relatedOsIds = [] }: OSDocumentsTabProps) {
    const {
        uploadDocument,
        deleteDocument,
        updateDocumentVisibility,
        isUploading,
        uploadProgress
    } = useOSDocumentUpload(osId);

    const [documents, setDocuments] = useState<OSDocumentoWithOrigin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Upload Form State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [docType, setDocType] = useState('');
    const [description, setDescription] = useState('');
    const [visibilidade, setVisibilidade] = useState<VisibilidadeDocumento>('interno');

    // Combinar todas as OS para busca unificada
    const allOsIds = [osId, ...relatedOsIds].filter(Boolean);

    useEffect(() => {
        loadDocuments();
    }, [osId, relatedOsIds.join(',')]);

    const loadDocuments = async () => {
        try {
            setIsLoading(true);

            // Buscar documentos de todas as OS relacionadas com JOINs
            const { data: docs, error } = await supabase
                .from('os_documentos')
                .select(`
                    *,
                    ordens_servico:os_id (
                        codigo_os
                    ),
                    os_etapas:etapa_id (
                        nome_etapa
                    ),
                    colaboradores:uploaded_by (
                        nome_completo
                    )
                `)
                .in('os_id', allOsIds)
                .order('criado_em', { ascending: false });

            if (error) {
                console.error('Erro ao carregar documentos:', error);
                toast.error('Não foi possível carregar os documentos.');
                return;
            }

            // Enriquecer com informação de origem, etapa e usuário + URL pública
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const enrichedDocs: OSDocumentoWithOrigin[] = (docs || []).map((doc: any) => {
                const { data: urlData } = supabase.storage
                    .from('os-documents')
                    .getPublicUrl(doc.caminho_arquivo);

                return {
                    ...doc,
                    url: urlData.publicUrl,
                    origemOsCodigo: doc.ordens_servico?.codigo_os || '',
                    isFromRelatedOS: doc.os_id !== osId,
                    nomeEtapa: doc.os_etapas?.nome_etapa || '',
                    enviadoPor: doc.colaboradores?.nome_completo || ''
                };
            });

            setDocuments(enrichedDocs);
        } catch (error) {
            console.error('Erro ao carregar documentos:', error);
            toast.error('Não foi possível carregar os documentos.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            // Tentar inferir tipo
            const file = e.target.files[0];
            if (file.type.includes('image')) setDocType('imagem');
            else if (file.type.includes('pdf')) setDocType('outros');
        }
    };

    const handleUploadSubmit = async () => {
        if (!selectedFile || !docType) {
            toast.error('Selecione um arquivo e o tipo de documento.');
            return;
        }

        try {
            await uploadDocument({
                file: selectedFile,
                tipoDocumento: docType,
                descricao: description,
                visibilidade
            });

            toast.success('Documento enviado com sucesso!');
            setIsUploadModalOpen(false);

            // Reset form
            setSelectedFile(null);
            setDocType('');
            setDescription('');
            setVisibilidade('interno');

            // Reload list
            loadDocuments();

        } catch (error) {
            console.error('Erro no upload:', error);
            toast.error('Erro ao enviar documento. Tente novamente.');
        }
    };

    const handleDelete = async (docId: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este documento?')) return;

        try {
            await deleteDocument(docId);
            toast.success('Documento excluído.');
            loadDocuments();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            toast.error('Erro ao excluir documento.');
        }
    };

    const handleDownload = async (doc: OSDocumento) => {
        try {
            const { data, error } = await supabase.storage
                .from('os-documents')
                .download(doc.caminho_arquivo);

            if (error) throw error;

            const url = URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = url;
            link.download = doc.nome;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Erro baixar:', error);
            toast.error('Erro ao baixar arquivo.');
        }
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
        if (mimeType.includes('image')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
        return <File className="w-5 h-5 text-gray-500" />;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };



    const handleVisibilityChange = async (doc: OSDocumentoWithOrigin, novaVisibilidade: VisibilidadeDocumento) => {
        try {
            // Atualizar no banco
            await updateDocumentVisibility(doc.id, novaVisibilidade);

            // Atualizar estado local otimista
            setDocuments(prev => prev.map(d =>
                d.id === doc.id ? { ...d, visibilidade: novaVisibilidade } : d
            ));

            toast.success('Visibilidade atualizada com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar visibilidade:', error);
            toast.error('Erro ao atualizar visibilidade.');
        }
    };

    const filteredDocuments = documents.filter(doc =>
        doc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <Card className="border-border rounded-lg shadow-sm">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <CardTitle className="text-xl font-semibold">Todos os Anexos</CardTitle>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Input
                                placeholder="Buscar documentos..."
                                className="w-full sm:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button onClick={() => setIsUploadModalOpen(true)}>
                                <Upload className="w-4 h-4 mr-2" />
                                Adicionar
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            <File className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>Nenhum documento encontrado.</p>
                            <Button variant="link" onClick={() => setIsUploadModalOpen(true)}>
                                Clique aqui para enviar o primeiro arquivo
                            </Button>
                        </div>
                    ) : (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead>Arquivo</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead>Etapa</TableHead>
                                        <TableHead>Enviado por</TableHead>
                                        {relatedOsIds.length > 0 && (
                                            <TableHead>Origem</TableHead>
                                        )}
                                        <TableHead>Visibilidade</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Enviado em</TableHead>
                                        <TableHead className="w-[100px] text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDocuments.map(doc => (
                                        <TableRow key={doc.id}>
                                            <TableCell>
                                                {getFileIcon(doc.mime_type || '')}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div
                                                    className="hover:underline cursor-pointer"
                                                    onClick={() => handleDownload(doc)}
                                                >
                                                    {doc.nome}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {(doc.tamanho_bytes / 1024 / 1024).toFixed(2)} MB
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {doc.descricao || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {doc.nomeEtapa ? (
                                                    <span className="text-sm">{doc.nomeEtapa}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {doc.enviadoPor ? (
                                                    <span className="text-sm">{doc.enviadoPor}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            {relatedOsIds.length > 0 && (
                                                <TableCell>
                                                    <Badge
                                                        variant={doc.isFromRelatedOS ? "secondary" : "outline"}
                                                        className={doc.isFromRelatedOS ? "bg-primary/10 text-primary" : ""}
                                                    >
                                                        {doc.origemOsCodigo || '-'}
                                                    </Badge>
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                {doc.visibilidade === 'cliente' ? (
                                                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                                        Portal Cliente
                                                    </Badge>
                                                ) : doc.visibilidade === 'publico' ? (
                                                    <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                                                        Público
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground">
                                                        Interno
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {doc.tipo}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(doc.criado_em)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-9 w-9 p-0">
                                                            <MoreVertical className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Baixar
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Visibilidade
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent>
                                                                <DropdownMenuItem onClick={() => handleVisibilityChange(doc, 'interno')}>
                                                                    <Lock className="mr-2 h-4 w-4 text-primary" />
                                                                    Interno
                                                                    {doc.visibilidade === 'interno' && <span className="ml-2 text-xs text-muted-foreground">(Atual)</span>}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleVisibilityChange(doc, 'cliente')}>
                                                                    <Users className="mr-2 h-4 w-4 text-info" />
                                                                    Cliente
                                                                    {doc.visibilidade === 'cliente' && <span className="ml-2 text-xs text-muted-foreground">(Atual)</span>}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleVisibilityChange(doc, 'publico')}>
                                                                    <Globe className="mr-2 h-4 w-4 text-success" />
                                                                    Público
                                                                    {doc.visibilidade === 'publico' && <span className="ml-2 text-xs text-muted-foreground">(Atual)</span>}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>

                                                        <DropdownMenuSeparator />

                                                        {doc.visibilidade === 'publico' && doc.url && (
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    window.navigator.clipboard.writeText(doc.url || '');
                                                                    toast.success('Link copiado para a área de transferência');
                                                                }}
                                                            >
                                                                <Link2 className="mr-2 h-4 w-4" />
                                                                Copiar Link
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(doc.id)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Excluir
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Upload Modal */}
            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Novo Documento</DialogTitle>
                        <DialogDescription>
                            Envie um novo documento para esta Ordem de Serviço.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Arquivo</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="file"
                                    onChange={handleFileSelect}
                                    className="cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo de Documento</Label>
                            <Select value={docType} onValueChange={setDocType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOCUMENT_TYPES.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Input
                                placeholder="Ex: Assinado pelo cliente..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Visibilidade</Label>
                            <ToggleGroup
                                type="single"
                                value={visibilidade}
                                onValueChange={(v) => v && setVisibilidade(v as VisibilidadeDocumento)}
                                className="w-full"
                            >
                                <ToggleGroupItem value="interno" className="flex-1 gap-2">
                                    <Lock className={`w-4 h-4 ${visibilidade === 'interno' ? 'text-primary' : ''}`} />
                                    Interno
                                </ToggleGroupItem>
                                <ToggleGroupItem value="cliente" className="flex-1 gap-2">
                                    <Users className={`w-4 h-4 ${visibilidade === 'cliente' ? 'text-info' : ''}`} />
                                    Cliente
                                </ToggleGroupItem>
                                <ToggleGroupItem value="publico" className="flex-1 gap-2">
                                    <Globe className={`w-4 h-4 ${visibilidade === 'publico' ? 'text-success' : ''}`} />
                                    Público
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>

                        {isUploading && (
                            <div className="space-y-1">
                                <div className="text-xs flex justify-between">
                                    <span>Enviando...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleUploadSubmit} disabled={isUploading}>
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Enviar Documento
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
