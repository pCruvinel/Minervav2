/**
 * ClienteTabDocumentos - Aba de Documentos do Cliente
 *
 * Exibe lista de documentos vinculados ao cliente com opções de
 * visualização, download e upload.
 *
 * @example
 * ```tsx
 * <ClienteTabDocumentos clienteId={clienteId} />
 * ```
 */

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { ModalHeaderPadrao } from '@/components/ui/modal-header-padrao';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  MoreHorizontal,
  Plus,
  AlertCircle,
  FolderOpen,
  Image,
  File,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useClienteDocumentos,
  TipoDocumento,
  TIPO_DOCUMENTO_LABELS,
  TIPO_DOCUMENTO_ICONS,
} from '@/lib/hooks/use-cliente-documentos';

interface ClienteTabDocumentosProps {
  clienteId: string;
}

export function ClienteTabDocumentos({ clienteId }: ClienteTabDocumentosProps) {
  const {
    documentos,
    isLoading,
    error,
    isUploading,
    uploadDocumento,
    deleteDocumento,
    getDocumentoUrl,
    formatFileSize,
  } = useClienteDocumentos(clienteId);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoDocumento | ''>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentoToDelete, setDocumentoToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (mimeType?: string) => {
    if (mimeType?.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedTipo) {
      toast.error('Selecione o tipo de documento e o arquivo');
      return;
    }

    try {
      await uploadDocumento({ file: selectedFile, tipo: selectedTipo });
      toast.success('Documento enviado com sucesso!');
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setSelectedTipo('');
    } catch (err) {
      toast.error('Erro ao enviar documento');
    }
  };

  const handleDelete = async () => {
    if (!documentoToDelete) return;

    try {
      await deleteDocumento(documentoToDelete);
      toast.success('Documento removido com sucesso!');
      setDeleteDialogOpen(false);
      setDocumentoToDelete(null);
    } catch (err) {
      toast.error('Erro ao remover documento');
    }
  };

  const handleView = (caminho: string) => {
    const url = getDocumentoUrl(caminho);
    window.open(url, '_blank');
  };

  const handleDownload = (caminho: string, nomeArquivo: string) => {
    const url = getDocumentoUrl(caminho);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    link.click();
  };

  if (isLoading) {
    return <DocumentosLoading />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar documentos: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de upload */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Documentos do Cliente</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie contratos, comprovantes e outros documentos
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Enviar Documento
        </Button>
      </div>

      {/* Lista de documentos */}
      {documentos.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Nenhum documento</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Este cliente ainda não possui documentos anexados.
                </p>
              </div>
              <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Enviar Primeiro Documento
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Data de Upload</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentos.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.mime_type)}
                      <span className="font-medium">{doc.nome_arquivo}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {TIPO_DOCUMENTO_ICONS[doc.tipo_documento]}{' '}
                      {TIPO_DOCUMENTO_LABELS[doc.tipo_documento]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatFileSize(doc.tamanho_bytes)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(doc.uploaded_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(doc.caminho_storage)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownload(doc.caminho_storage, doc.nome_arquivo)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setDocumentoToDelete(doc.id);
                            setDeleteDialogOpen(true);
                          }}
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
        </Card>
      )}

      {/* Dialog de Upload - Modernizado */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-lg p-0">
          <ModalHeaderPadrao
            title="Enviar Documento"
            description="Selecione o tipo e o arquivo para enviar."
            icon={Upload}
            theme="create"
          />

          <div className="p-6 space-y-4">
            {/* Seção: Tipo de Documento */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Classificação</h3>
                  <p className="text-xs text-muted-foreground">Selecione o tipo de documento</p>
                </div>
              </div>

              <Select
                value={selectedTipo}
                onValueChange={(v) => setSelectedTipo(v as TipoDocumento)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_DOCUMENTO_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {TIPO_DOCUMENTO_ICONS[value as TipoDocumento]} {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seção: Upload */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Arquivo</h3>
                  <p className="text-xs text-muted-foreground">Arraste ou clique para selecionar</p>
                </div>
              </div>

              <div
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer 
                           hover:bg-muted/50 hover:border-primary/50 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Clique para selecionar um arquivo
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-0">
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={isUploading || !selectedFile || !selectedTipo}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Delete - Modernizado */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center">Excluir Documento</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DocumentosLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <Card>
        <CardContent className="pt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b last:border-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

