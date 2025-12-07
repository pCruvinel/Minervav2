import { useState, useEffect } from 'react';
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
    DropdownMenuTrigger
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
    FileCode
} from 'lucide-react';
import { toast } from '@/lib/utils/safe-toast';
import { useOSDocumentUpload, OSDocumento } from '@/lib/hooks/use-os-document-upload';
import { supabase } from '@/lib/supabase-client';

interface OSDocumentsTabProps {
    osId: string;
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

export function OSDocumentsTab({ osId }: OSDocumentsTabProps) {
    const {
        listDocuments,
        uploadDocument,
        deleteDocument,
        isUploading,
        uploadProgress
    } = useOSDocumentUpload(osId);

    const [documents, setDocuments] = useState<OSDocumento[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Upload Form State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [docType, setDocType] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        loadDocuments();
    }, [osId]);

    const loadDocuments = async () => {
        try {
            setIsLoading(true);
            const docs = await listDocuments();

            // Enriquecer com nomes de usuários (se necessário, o hook já poderia trazer, 
            // mas vamos garantir que o array esteja seguro)
            setDocuments(docs || []);
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
                descricao: description
            });

            toast.success('Documento enviado com sucesso!');
            setIsUploadModalOpen(false);

            // Reset form
            setSelectedFile(null);
            setDocType('');
            setDescription('');

            // Reload list
            loadDocuments();

        } catch (error) {
            console.error('Erro no upload:', error);
            toast.error('Erro ao enviar documento. Tente novamente.');
        }
    };

    const handleDelete = async (docId: string) => {
        if (!confirm('Tem certeza que deseja excluir este documento?')) return;

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

    const filteredDocuments = documents.filter(doc =>
        doc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <Card className="border-border rounded-lg shadow-sm">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <CardTitle className="text-xl font-semibold">Drive</CardTitle>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Input
                                placeholder="Buscar documentos..."
                                className="w-full sm:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button onClick={() => setIsUploadModalOpen(true)}>
                                <Upload className="w-4 h-4 mr-2" />
                                Novo Documento
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
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Baixar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(doc.id)}
                                                            className="text-red-600 focus:text-red-600"
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
                <DialogContent>
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
                            <Label>Descrição (Opcional)</Label>
                            <Input
                                placeholder="Ex: Assinado pelo cliente..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
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
