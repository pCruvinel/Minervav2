import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, FileText, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';
import type { RequisicaoCompra } from '@/lib/hooks/use-aprovacao-requisicoes';

interface DocumentoOS {
    id: string;
    nome: string;
    tipo: string;
    caminho_arquivo: string;
    descricao?: string;
}

interface AprovacaoRequisicaoModalProps {
    open: boolean;
    onClose: () => void;
    requisicao: RequisicaoCompra | null;
    tipo: 'aprovar' | 'recusar';
    onSuccess: () => void;
}

/**
 * Modal de Aprovação/Rejeição de Requisição de Compras
 * 
 * Permite selecionar um documento e adicionar observação
 */
export function AprovacaoRequisicaoModal({
    open,
    onClose,
    requisicao,
    tipo,
    onSuccess,
}: AprovacaoRequisicaoModalProps) {
    const [documentos, setDocumentos] = useState<DocumentoOS[]>([]);
    const [selectedDocumento, setSelectedDocumento] = useState<string>('');
    const [observacao, setObservacao] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingDocumentos, setLoadingDocumentos] = useState(false);

    // Buscar documentos da OS quando abrir o modal
    useEffect(() => {
        if (open && requisicao?.id) {
            fetchDocumentos();
        }
    }, [open, requisicao?.id]);

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            setSelectedDocumento('');
            setObservacao('');
            setDocumentos([]);
        }
    }, [open]);

    const fetchDocumentos = async () => {
        if (!requisicao?.id) return;

        setLoadingDocumentos(true);
        try {
            const { data, error } = await supabase
                .from('os_documentos')
                .select('id, nome, tipo, caminho_arquivo, descricao')
                .eq('os_id', requisicao.id)
                .order('criado_em', { ascending: false });

            if (error) throw error;
            setDocumentos(data || []);
        } catch (error) {
            logger.error('Erro ao buscar documentos:', error);
            toast.error('Erro ao carregar documentos');
        } finally {
            setLoadingDocumentos(false);
        }
    };

    const handleSubmit = async () => {
        if (!requisicao?.id) return;

        // Validações
        if (tipo === 'recusar' && !observacao.trim()) {
            toast.error('Informe o motivo da rejeição');
            return;
        }

        setLoading(true);
        try {
            // Atualizar status da OS
            const novoStatus = tipo === 'aprovar' ? 'concluido' : 'cancelado';
            const novaSituacao = tipo === 'aprovar' ? 'finalizado' : 'finalizado';

            const { error: updateError } = await supabase
                .from('ordens_servico')
                .update({
                    status_geral: novoStatus,
                    status_situacao: novaSituacao,
                })
                .eq('id', requisicao.id);

            if (updateError) throw updateError;

            // Registrar atividade
            const { data: { user } } = await supabase.auth.getUser();

            await supabase.from('os_atividades').insert({
                os_id: requisicao.id,
                tipo: tipo === 'aprovar' ? 'aprovacao' : 'rejeicao',
                descricao: tipo === 'aprovar'
                    ? `Requisição de compras aprovada${selectedDocumento ? ' - Documento selecionado: ' + documentos.find(d => d.id === selectedDocumento)?.nome : ''}`
                    : `Requisição de compras recusada. Motivo: ${observacao}`,
                dados: {
                    documento_id: selectedDocumento || null,
                    observacao: observacao || null,
                },
                criado_por_id: user?.id || null,
            });

            // Criar notificação para o criador da OS
            if (requisicao.criado_por?.email) {
                await supabase.from('notificacoes').insert({
                    usuario_id: user?.id, // TODO: Buscar ID do criador
                    titulo: tipo === 'aprovar' ? 'Requisição Aprovada' : 'Requisição Recusada',
                    mensagem: tipo === 'aprovar'
                        ? `Sua requisição de compras ${requisicao.codigo_os} foi aprovada.`
                        : `Sua requisição de compras ${requisicao.codigo_os} foi recusada. Motivo: ${observacao}`,
                    tipo: tipo === 'aprovar' ? 'sucesso' : 'erro',
                    lida: false,
                    dados: { os_id: requisicao.id },
                });
            }

            toast.success(
                tipo === 'aprovar'
                    ? 'Requisição aprovada com sucesso!'
                    : 'Requisição recusada'
            );

            onSuccess();
            onClose();
        } catch (error) {
            logger.error('Erro ao processar ação:', error);
            toast.error('Erro ao processar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const isAprovar = tipo === 'aprovar';

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isAprovar ? (
                            <>
                                <CheckCircle className="h-5 w-5 text-success" />
                                Aprovar Requisição
                            </>
                        ) : (
                            <>
                                <XCircle className="h-5 w-5 text-destructive" />
                                Recusar Requisição
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {requisicao?.codigo_os} - Valor total: R$ {requisicao?.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Seleção de Documento */}
                    <div className="space-y-2">
                        <Label>Documento de Referência {isAprovar && '(Opcional)'}</Label>
                        {loadingDocumentos ? (
                            <Skeleton className="h-10 w-full" />
                        ) : documentos.length === 0 ? (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Nenhum documento encontrado para esta OS.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Select value={selectedDocumento} onValueChange={setSelectedDocumento}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um documento..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {documentos.map((doc) => (
                                        <SelectItem key={doc.id} value={doc.id}>
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span>{doc.nome}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Observação */}
                    <div className="space-y-2">
                        <Label>
                            {isAprovar ? 'Observação (Opcional)' : 'Motivo da Recusa *'}
                        </Label>
                        <Textarea
                            placeholder={
                                isAprovar
                                    ? 'Adicione uma observação se necessário...'
                                    : 'Informe o motivo da recusa...'
                            }
                            value={observacao}
                            onChange={(e) => setObservacao(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || (!isAprovar && !observacao.trim())}
                        className={isAprovar ? 'bg-success hover:bg-success/90' : 'bg-destructive hover:bg-destructive/90'}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processando...
                            </>
                        ) : isAprovar ? (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Aprovar
                            </>
                        ) : (
                            <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Recusar
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
