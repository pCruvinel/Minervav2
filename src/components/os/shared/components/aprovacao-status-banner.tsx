/**
 * Banner de status de aprovação de etapa
 * 
 * Componente inline para exibir o status atual de aprovação de uma etapa.
 * Mostra informações diferentes baseado no status: pendente, solicitada, aprovada, rejeitada.
 * 
 * @example
 * ```tsx
 * <AprovacaoStatusBanner
 *   osId={osId}
 *   etapaOrdem={currentStep}
 *   onClickSolicitar={() => setShowAprovacaoModal(true)}
 * />
 * ```
 */

import { AlertCircle, CheckCircle, Clock, XCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAprovacaoEtapa } from '@/lib/hooks/use-aprovacao-etapa';

interface AprovacaoStatusBannerProps {
    osId: string;
    etapaOrdem: number;
    onClickSolicitar?: () => void;
    onClickAprovar?: () => void;
    compact?: boolean;
}

export function AprovacaoStatusBanner({
    osId,
    etapaOrdem,
    onClickSolicitar,
    onClickAprovar,
    compact = false
}: AprovacaoStatusBannerProps) {
    const { aprovacaoInfo, isLoading, podeAprovar } = useAprovacaoEtapa(osId, etapaOrdem);

    // Não mostrar se não requer aprovação ou está carregando
    if (isLoading || !aprovacaoInfo?.requerAprovacao) {
        return null;
    }

    const { statusAprovacao } = aprovacaoInfo;

    // Status: Aprovada - não mostrar banner (já passou)
    if (statusAprovacao === 'aprovada') {
        return null;
    }

    // Estilo compacto
    if (compact) {
        return (
            <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded-full ${statusAprovacao === 'pendente' ? 'bg-muted text-muted-foreground' :
                    statusAprovacao === 'solicitada' ? 'bg-warning/10 text-warning' :
                        statusAprovacao === 'rejeitada' ? 'bg-destructive/10 text-destructive' :
                            'bg-muted text-muted-foreground'
                }`}>
                {statusAprovacao === 'pendente' && <AlertCircle className="w-3 h-3" />}
                {statusAprovacao === 'solicitada' && <Clock className="w-3 h-3" />}
                {statusAprovacao === 'rejeitada' && <XCircle className="w-3 h-3" />}
                <span>
                    {statusAprovacao === 'pendente' && 'Requer Aprovação'}
                    {statusAprovacao === 'solicitada' && 'Aguardando Aprovação'}
                    {statusAprovacao === 'rejeitada' && 'Aprovação Rejeitada'}
                </span>
            </div>
        );
    }

    // Status: Pendente
    if (statusAprovacao === 'pendente') {
        return (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30">
                <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                        Esta etapa requer aprovação
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Antes de avançar, solicite aprovação do coordenador.
                    </p>
                    {onClickSolicitar && (
                        <Button size="sm" variant="outline" className="mt-2" onClick={onClickSolicitar}>
                            Solicitar Aprovação
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    // Status: Solicitada
    if (statusAprovacao === 'solicitada') {
        return (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-warning/30 bg-warning/5">
                <Clock className="w-5 h-5 text-warning mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                        Aguardando aprovação do coordenador
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Solicitada por <strong>{aprovacaoInfo.solicitanteNome}</strong> em {aprovacaoInfo.solicitadoEm?.toLocaleDateString('pt-BR')}
                    </p>
                    {podeAprovar && onClickAprovar && (
                        <Button size="sm" className="mt-2" onClick={onClickAprovar}>
                            <ShieldCheck className="w-4 h-4 mr-1" />
                            Revisar e Aprovar
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    // Status: Rejeitada
    if (statusAprovacao === 'rejeitada') {
        return (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                <XCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">
                        Aprovação rejeitada
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Por: {aprovacaoInfo.aprovadorNome} em {aprovacaoInfo.aprovadoEm?.toLocaleDateString('pt-BR')}
                    </p>
                    {aprovacaoInfo.motivoRejeicao && (
                        <p className="text-sm mt-1">
                            <strong>Motivo:</strong> {aprovacaoInfo.motivoRejeicao}
                        </p>
                    )}
                    {onClickSolicitar && (
                        <Button size="sm" variant="outline" className="mt-2" onClick={onClickSolicitar}>
                            Solicitar Novamente
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return null;
}
