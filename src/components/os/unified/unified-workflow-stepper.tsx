/**
 * UnifiedWorkflowStepper - Stepper unificado para workflow hierárquico
 *
 * Exibe etapas de múltiplas OS (Lead → Contrato) em layout unificado,
 * separando por fases e permitindo navegação via Opção A (redirect).
 *
 * @example
 * ```tsx
 * <UnifiedWorkflowStepper
 *   osId="123-abc"
 *   onStepClick={(step, osId) => navigate(`/os/details-workflow/${osId}?step=${step.ordemOriginal}`)}
 * />
 * ```
 */

import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    useUnifiedWorkflow,
    type UnifiedStep,
    type WorkflowPhase
} from '@/lib/hooks/use-unified-workflow';
import {
    CheckCircle,
    Play,
    AlertCircle,
    Lock,
    X,
    ChevronDown,
    ChevronRight,
    Layers,
    ExternalLink,
    Loader2,
    MessageSquarePlus
} from 'lucide-react';
import { useState } from 'react';
import { getOSRouteConfigWithFallback } from '@/lib/constants/os-routing-config';

// ============================================================
// TIPOS
// ============================================================

interface UnifiedWorkflowStepperProps {
    /** ID da OS atual */
    osId: string;
    /** Callback quando uma etapa é clicada */
    onStepClick?: (step: UnifiedStep, targetOSId: string) => void;
    /** Se está em modo de navegação (loading state) */
    isNavigating?: boolean;
}

// ============================================================
// HELPERS
// ============================================================

function getStepStatusIcon(status: string) {
    switch (status) {
        case 'concluida':
            return <CheckCircle className="w-5 h-5 text-success" />;
        case 'em_andamento':
            return <Play className="w-5 h-5 text-primary" />;
        case 'bloqueada':
            return <Lock className="w-5 h-5 text-destructive" />;
        case 'cancelada':
            return <X className="w-5 h-5 text-destructive" />;
        default:
            return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
}

function getStepStatusColor(status: string) {
    switch (status) {
        case 'concluida':
            return 'bg-success/5 border-success/20 text-success';
        case 'em_andamento':
            return 'bg-primary/5 border-primary/20 text-primary';
        case 'bloqueada':
            return 'bg-destructive/5 border-destructive/20 text-destructive';
        case 'cancelada':
            return 'bg-destructive/5 border-destructive/20 text-destructive';
        default:
            return 'bg-background border-border text-foreground';
    }
}

function getPhaseStatusBadge(phase: WorkflowPhase) {
    if (phase.isCompleta) {
        return (
            <Badge className="bg-success/10 text-success border-success/20">
                <CheckCircle className="w-3 h-3 mr-1" />
                Concluída
            </Badge>
        );
    }
    if (phase.isAtiva) {
        return (
            <Badge className="bg-primary/10 text-primary border-primary/20">
                <Play className="w-3 h-3 mr-1" />
                Em Andamento
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="text-muted-foreground">
            Pendente
        </Badge>
    );
}

// ============================================================
// COMPONENTES INTERNOS
// ============================================================

interface StepItemProps {
    step: UnifiedStep;
    isCurrentOS: boolean;
    onClick: () => void;
    isNavigating?: boolean;
}

function StepItem({ step, isCurrentOS, onClick, isNavigating }: StepItemProps) {
    const canClick = step.status !== 'bloqueada';

    return (
        <div
            className={`
        flex items-center justify-between p-4 rounded-lg border transition-all
        ${canClick ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-60'}
        ${step.status === 'em_andamento' ? 'bg-primary/5 border-primary/20' : ''}
        ${step.status === 'concluida' ? 'bg-success/5 border-success/20' : ''}
        ${step.status === 'pendente' ? 'bg-card border-border' : ''}
        ${step.status === 'bloqueada' ? 'bg-muted/30 border-border' : ''}
      `}
            onClick={canClick ? onClick : undefined}
        >
            {/* Lado esquerdo: ícone + info */}
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-current">
                    {getStepStatusIcon(step.status)}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium">{step.nome_etapa}</h3>
                        {!isCurrentOS && (
                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Etapa {step.ordemUnificada}</span>
                        <span>•</span>
                        <span className="font-mono text-xs">{step.osCodigo}</span>
                    </div>
                </div>
            </div>

            {/* Lado direito: status + botão */}
            <div className="flex items-center gap-3">
                <Badge variant="outline" className={getStepStatusColor(step.status)}>
                    {step.status === 'concluida' ? 'Concluída' :
                        step.status === 'em_andamento' ? 'Em Andamento' :
                            step.status === 'bloqueada' ? 'Bloqueada' :
                                step.status === 'cancelada' ? 'Cancelada' : 'Pendente'}
                </Badge>

                {/* Badge Adendo - usando cor secondary para destaque */}
                {step.adendosCount && step.adendosCount > 0 && (
                    <Badge
                        variant="outline"
                        className="bg-secondary/20 text-secondary-foreground border-secondary/40"
                    >
                        <MessageSquarePlus className="w-3 h-3 mr-1" />
                        {step.adendosCount > 1 ? `${step.adendosCount} Adendos` : 'Adendo'}
                    </Badge>
                )}

                {canClick && (
                    <Button
                        variant={step.status === 'em_andamento' ? 'default' : 'outline'}
                        size="sm"
                        disabled={isNavigating}
                        onClick={(e) => {
                            e.stopPropagation(); // Evitar duplo click no div pai
                            onClick();
                        }}
                    >
                        {isNavigating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-1" />
                                {step.status === 'concluida' ? 'Ver' :
                                    step.status === 'em_andamento' ? 'Continuar' : 'Iniciar'}
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}

interface PhaseCardProps {
    phase: WorkflowPhase;
    currentOSId: string;
    onStepClick: (etapa: UnifiedStep) => void;
    defaultOpen?: boolean;
    isNavigating?: boolean;
}

function PhaseCard({ phase, currentOSId, onStepClick, defaultOpen = false, isNavigating }: PhaseCardProps) {
    // Fases completas iniciam minimizadas, ativas ou pendentes iniciam abertas
    const [isOpen, setIsOpen] = useState(phase.isCompleta ? false : (defaultOpen || phase.isAtiva));
    const completedCount = phase.etapas.filter((e) => e.status === 'concluida').length;
    const progressPercent = (completedCount / phase.etapas.length) * 100;

    const isCurrentPhaseOS = phase.osId === currentOSId;

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <Card className={`border ${phase.isAtiva ? 'border-primary/30' : 'border-border'}`}>
                <CollapsibleTrigger className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between py-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${phase.isCompleta ? 'bg-success/10' : phase.isAtiva ? 'bg-primary/10' : 'bg-muted'}
              `}>
                                <Layers className={`w-5 h-5 ${phase.isCompleta ? 'text-success' :
                                    phase.isAtiva ? 'text-primary' : 'text-muted-foreground'
                                    }`} />
                            </div>
                            <div className="text-left">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-base">{phase.nome}</CardTitle>
                                    <span className="text-xs font-mono text-muted-foreground">
                                        {phase.osCodigo}
                                    </span>
                                    {!isCurrentPhaseOS && (
                                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {completedCount} de {phase.etapas.length} etapas
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {getPhaseStatusBadge(phase)}
                            {isOpen ? (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            )}
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <CardContent className="pt-0 space-y-3">
                        {/* Progress bar */}
                        <div className="space-y-1">
                            <Progress value={progressPercent} className="h-2" />
                            <p className="text-xs text-muted-foreground text-right">
                                {Math.round(progressPercent)}% concluído
                            </p>
                        </div>

                        {/* Steps list */}
                        <div className="space-y-2">
                            {phase.etapas.map((step) => (
                                <StepItem
                                    key={step.id}
                                    step={step}
                                    isCurrentOS={isCurrentPhaseOS}
                                    onClick={() => onStepClick(step)}
                                    isNavigating={isNavigating}
                                />
                            ))}
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function UnifiedWorkflowStepper({
    osId,
    onStepClick,
    isNavigating = false
}: UnifiedWorkflowStepperProps) {
    const navigate = useNavigate();
    const {
        phases,
        totalSteps,
        completedSteps,
        loading,
        error,
        childrenOS
    } = useUnifiedWorkflow(osId);

    // Handler padrão de navegação
    // Determina a rota correta baseada no tipo de OS usando configuração centralizada
    const handleStepClick = (step: UnifiedStep) => {
        if (onStepClick) {
            onStepClick(step, step.osId);
            return;
        }

        // Obter configuração de rota usando tipoOS (ex: 'OS-01', 'OS-09')
        // tipoOS já vem normalizado do banco de dados
        const routeConfig = getOSRouteConfigWithFallback(step.tipoOS || '');

        switch (routeConfig.mode) {
            case 'WORKFLOW_PAGE':
                // Navegação para página de workflow (produção: /os/details-workflow/$id)
                navigate({
                    to: routeConfig.route,
                    params: { id: step.osId },
                    search: { step: step.ordemOriginal, readonly: false }
                });
                break;

            case 'CREATE_PAGE': {
                // Navegação para página de criação (OS-11, 12, 13)
                // Buscar clienteId da fase Lead OU da primeira etapa disponível
                const leadPhase = phases.find(p => p.id === 'LEAD');
                const firstPhase = phases[0];
                const targetPhase = leadPhase || firstPhase;
                const firstStep = targetPhase?.etapas[0];
                
                // Extrair clienteId de múltiplos campos possíveis
                const dadosEtapa = firstStep?.dadosEtapa as Record<string, string> | undefined;
                const clienteId = dadosEtapa?.leadId || dadosEtapa?.clienteId || dadosEtapa?.cliente_id || '';

                navigate({
                    to: routeConfig.route,
                    search: {
                        parentOSId: step.osId, // Usar a OS clicada como parent
                        clienteId,
                        step: step.ordemOriginal // Passar a etapa clicada para navegação
                    }
                });
                break;
            }

            case 'DETAILS_PAGE':
            default:
                // Fallback para página de detalhes genérica
                navigate({
                    to: routeConfig.route,
                    params: { osId: step.osId }
                });
                break;
        }
    };

    // Loading state
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32 mt-2" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
        );
    }

    // Error state
    if (error) {
        return (
            <Card className="border-destructive/30">
                <CardContent className="py-8 text-center">
                    <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                    <p className="text-destructive">Erro ao carregar workflow</p>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                </CardContent>
            </Card>
        );
    }

    // Empty state
    if (phases.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <Layers className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhuma etapa encontrada</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Fases */}
            {phases.map((phase, index) => (
                <PhaseCard
                    key={phase.id}
                    phase={phase}
                    currentOSId={osId}
                    onStepClick={handleStepClick}
                    defaultOpen={phase.isAtiva || (!phase.isCompleta && index === 0)}
                    isNavigating={isNavigating}
                />
            ))}

            {/* OS Satélites (se houver) */}
            {childrenOS.length > 0 && (
                <Card className="border-dashed border-primary/30">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-primary" />
                            Solicitações Vinculadas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-2">
                            {childrenOS.map((child) => (
                                <div
                                    key={child.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => navigate({
                                        to: '/os/details-workflow/$id',
                                        params: { id: child.id }
                                    })}
                                >
                                    <div>
                                        <span className="font-mono text-sm text-primary">
                                            {child.codigo}
                                        </span>
                                        <span className="text-sm text-muted-foreground ml-2">
                                            {child.tipo}
                                        </span>
                                    </div>
                                    <Badge variant="outline">
                                        {child.status === 'concluida' ? 'Concluída' :
                                            child.status === 'em_andamento' ? 'Em Andamento' : child.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export type { UnifiedWorkflowStepperProps };
