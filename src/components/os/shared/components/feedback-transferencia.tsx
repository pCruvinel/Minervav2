/**
 * ============================================================================
 * COMPONENTE: FEEDBACK DE TRANSFERÊNCIA
 * ============================================================================
 * 
 * Modal exibido após um avanço de etapa que resultou em transferência de setor.
 * Informa o usuário sobre a transferência e oferece navegação para OS Details.
 * Inclui timer de contagem regressiva para redirecionamento automático.
 * 
 * @module feedback-transferencia
 * @author Minerva ERP
 */

import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, User, ExternalLink, Timer } from 'lucide-react';
import { TransferenciaInfo } from '@/types/os-setor-config';
import { useNavigate } from '@tanstack/react-router';

// ============================================================================
// TIPOS
// ============================================================================

interface FeedbackTransferenciaProps {
    /** Se o modal está aberto */
    isOpen: boolean;
    /** Callback para fechar o modal */
    onClose: () => void;
    /** Informações da transferência */
    transferencia: TransferenciaInfo;
    /** ID da OS para navegação */
    osId: string;
    /** Tempo em segundos para redirecionamento automático (default: 5) */
    autoRedirectSeconds?: number;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export function FeedbackTransferencia({
    isOpen,
    onClose,
    transferencia,
    osId,
    autoRedirectSeconds = 5,
}: FeedbackTransferenciaProps) {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(autoRedirectSeconds);

    const handleIrParaDetalhes = useCallback(() => {
        onClose();
        navigate({ to: '/os/$osId', params: { osId } });
    }, [onClose, navigate, osId]);

    // Timer de contagem regressiva
    useEffect(() => {
        if (!isOpen) {
            // Reset countdown when modal closes
            setCountdown(autoRedirectSeconds);
            return;
        }

        // Iniciar contagem regressiva
        const timer = window.setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    window.clearInterval(timer);
                    handleIrParaDetalhes();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(timer);
    }, [isOpen, autoRedirectSeconds, handleIrParaDetalhes]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                        <CheckCircle className="h-10 w-10 text-success" />
                    </div>
                    <DialogTitle className="text-xl">
                        Etapa {transferencia.etapaConcluida} Concluída!
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        A OS foi transferida para outro setor
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Visualização da transferência */}
                    <div className="flex items-center justify-center gap-3 p-4 bg-muted/50 rounded-lg">
                        <Badge variant="outline" className="text-sm py-1 px-3">
                            {transferencia.setorOrigemNome}
                        </Badge>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        <Badge variant="default" className="text-sm py-1 px-3 bg-primary">
                            {transferencia.setorDestinoNome}
                        </Badge>
                    </div>

                    {/* Próxima etapa */}
                    <div className="text-center space-y-1">
                        <p className="text-sm text-muted-foreground">Próxima etapa:</p>
                        <p className="font-medium">
                            Etapa {transferencia.proximaEtapa} - {transferencia.nomeProximaEtapa}
                        </p>
                    </div>

                    {/* Coordenador notificado */}
                    {transferencia.coordenadorNotificadoNome && (
                        <div className="flex items-center justify-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                            <User className="h-4 w-4 text-primary" />
                            <span className="text-sm">
                                <strong>{transferencia.coordenadorNotificadoNome}</strong> foi notificado
                            </span>
                        </div>
                    )}

                    {/* Timer de redirecionamento */}
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Timer className="h-4 w-4 animate-pulse" />
                        <span className="text-sm">
                            Redirecionando em <strong className="text-foreground">{countdown}</strong>...
                        </span>
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <PrimaryButton
                        onClick={handleIrParaDetalhes}
                        className="w-full sm:w-auto"
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver detalhes
                    </PrimaryButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default FeedbackTransferencia;

