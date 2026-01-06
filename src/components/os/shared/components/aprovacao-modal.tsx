/**
 * Modal para gerenciamento de aprovação de etapas
 * 
 * Este componente exibe um modal que permite:
 * - Operacionais: Solicitar aprovação com justificativa
 * - Coordenadores: Aprovar ou Rejeitar a solicitação
 * 
 * @example
 * ```tsx
 * <AprovacaoModal
 *   open={showModal}
 *   onOpenChange={setShowModal}
 *   osId={osId}
 *   etapaOrdem={currentStep}
 *   etapaNome="Gerar Proposta Comercial"
 *   onAprovado={() => handleNextStep()}
 * />
 * ```
 */

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock, Send } from 'lucide-react';
import { useAprovacaoEtapa, type StatusAprovacao } from '@/lib/hooks/use-aprovacao-etapa';

interface AprovacaoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    osId: string;
    etapaOrdem: number;
    etapaNome: string;
    onAprovado?: () => void;
    onRejeitado?: () => void;
    onSolicitado?: () => void;
}

export function AprovacaoModal({
    open,
    onOpenChange,
    osId,
    etapaOrdem,
    etapaNome,
    onAprovado,
    onRejeitado,
    onSolicitado
}: AprovacaoModalProps) {
    const [justificativa, setJustificativa] = useState('');
    const [motivoRejeicao, setMotivoRejeicao] = useState('');

    const {
        aprovacaoInfo,
        isLoading,
        isProcessing,
        solicitarAprovacao,
        confirmarAprovacao,
        rejeitarAprovacao,
        podeAprovar
    } = useAprovacaoEtapa(osId, etapaOrdem);

    const handleSolicitar = async () => {
        const success = await solicitarAprovacao(justificativa);
        if (success) {
            setJustificativa('');
            onOpenChange(false);
            onSolicitado?.();
        }
    };

    const handleAprovar = async () => {
        const success = await confirmarAprovacao();
        if (success) {
            onOpenChange(false);
            onAprovado?.();
        }
    };

    const handleRejeitar = async () => {
        const success = await rejeitarAprovacao(motivoRejeicao);
        if (success) {
            setMotivoRejeicao('');
            onOpenChange(false);
            onRejeitado?.();
        }
    };

    const getStatusBadge = (status: StatusAprovacao) => {
        switch (status) {
            case 'pendente':
                return <Badge variant="outline" className="bg-muted"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
            case 'solicitada':
                return <Badge variant="secondary" className="bg-warning/10 text-warning"><Clock className="w-3 h-3 mr-1" /> Aguardando Aprovação</Badge>;
            case 'aprovada':
                return <Badge variant="secondary" className="bg-success/10 text-success"><CheckCircle className="w-3 h-3 mr-1" /> Aprovada</Badge>;
            case 'rejeitada':
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejeitada</Badge>;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const status = aprovacaoInfo?.statusAprovacao || 'pendente';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Aprovação de Etapa
                        {getStatusBadge(status)}
                    </DialogTitle>
                    <DialogDescription>
                        Etapa: <strong>{etapaNome}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Status: Pendente - Operacional vê formulário de solicitação */}
                    {status === 'pendente' && !podeAprovar && (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Esta etapa requer aprovação do coordenador antes de avançar.
                            </p>
                            <div className="space-y-2">
                                <Label htmlFor="justificativa">Justificativa (opcional)</Label>
                                <Textarea
                                    id="justificativa"
                                    placeholder="Descreva o que foi realizado nesta etapa..."
                                    value={justificativa}
                                    onChange={(e) => setJustificativa(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    {/* Status: Pendente - Coordenador/Diretor vê opção de aprovar diretamente */}
                    {status === 'pendente' && podeAprovar && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                                <p className="text-sm font-medium">Aprovação Necessária</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Esta etapa requer aprovação antes de avançar.
                                    Como coordenador/diretor, você pode aprovar diretamente.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="motivoRejeicao">Motivo da Rejeição (se aplicável)</Label>
                                <Textarea
                                    id="motivoRejeicao"
                                    placeholder="Informe o motivo caso rejeite a aprovação..."
                                    value={motivoRejeicao}
                                    onChange={(e) => setMotivoRejeicao(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>
                    )}

                    {/* Status: Solicitada - Aguardando */}
                    {status === 'solicitada' && !podeAprovar && (
                        <div className="text-center py-4">
                            <Clock className="w-12 h-12 text-warning mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">
                                Solicitação enviada em {aprovacaoInfo?.solicitadoEm?.toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Aguardando aprovação do coordenador.
                            </p>
                        </div>
                    )}

                    {/* Status: Solicitada - Coordenador pode aprovar/rejeitar */}
                    {status === 'solicitada' && podeAprovar && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-muted/50 border">
                                <p className="text-sm font-medium">Solicitação de Aprovação</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Solicitada por <strong>{aprovacaoInfo?.solicitanteNome}</strong> em {aprovacaoInfo?.solicitadoEm?.toLocaleDateString('pt-BR')}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="motivoRejeicao">Motivo da Rejeição (se aplicável)</Label>
                                <Textarea
                                    id="motivoRejeicao"
                                    placeholder="Informe o motivo caso rejeite a aprovação..."
                                    value={motivoRejeicao}
                                    onChange={(e) => setMotivoRejeicao(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>
                    )}

                    {/* Status: Rejeitada */}
                    {status === 'rejeitada' && (
                        <div className="space-y-3">
                            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                                <p className="text-sm font-medium text-destructive">Aprovação Rejeitada</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Por: {aprovacaoInfo?.aprovadorNome} em {aprovacaoInfo?.aprovadoEm?.toLocaleDateString('pt-BR')}
                                </p>
                                {aprovacaoInfo?.motivoRejeicao && (
                                    <p className="text-sm mt-2">
                                        <strong>Motivo:</strong> {aprovacaoInfo.motivoRejeicao}
                                    </p>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Revise os dados da etapa e solicite novamente.
                            </p>
                            <div className="space-y-2">
                                <Label htmlFor="justificativa">Nova Justificativa</Label>
                                <Textarea
                                    id="justificativa"
                                    placeholder="Descreva as correções realizadas..."
                                    value={justificativa}
                                    onChange={(e) => setJustificativa(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    {/* Status: Aprovada */}
                    {status === 'aprovada' && (
                        <div className="text-center py-4">
                            <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                            <p className="text-sm font-medium text-success">Aprovação Confirmada!</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Por: {aprovacaoInfo?.aprovadorNome} em {aprovacaoInfo?.aprovadoEm?.toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    {/* Botões para operacional */}
                    {(status === 'pendente' || status === 'rejeitada') && !podeAprovar && (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSolicitar} disabled={isProcessing}>
                                {isProcessing ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4 mr-2" />
                                )}
                                Solicitar Aprovação
                            </Button>
                        </>
                    )}

                    {/* Botões para coordenador - pendente ou solicitada */}
                    {(status === 'pendente' || status === 'solicitada') && podeAprovar && (
                        <>
                            <Button
                                variant="destructive"
                                onClick={handleRejeitar}
                                disabled={isProcessing || !motivoRejeicao.trim()}
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <XCircle className="w-4 h-4 mr-2" />
                                )}
                                Rejeitar
                            </Button>
                            <Button onClick={handleAprovar} disabled={isProcessing}>
                                {isProcessing ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                )}
                                Aprovar e Avançar
                            </Button>
                        </>
                    )}

                    {/* Aguardando */}
                    {status === 'solicitada' && !podeAprovar && (
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Fechar
                        </Button>
                    )}

                    {/* Aprovada */}
                    {status === 'aprovada' && (
                        <Button onClick={() => onOpenChange(false)}>
                            Fechar
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
