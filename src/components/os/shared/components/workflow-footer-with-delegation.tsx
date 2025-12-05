/**
 * ============================================================================
 * WORKFLOW FOOTER COM DELEGAÇÃO
 * ============================================================================
 * 
 * Versão estendida do WorkflowFooter que incorpora verificação
 * automática de delegação de responsabilidade entre etapas.
 * 
 * @module workflow-footer-with-delegation
 * @author Minerva ERP
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, Check, Loader2, AlertCircle } from 'lucide-react';
import { DelegationModal } from './delegation-modal';
import { useDelegation } from '@/lib/hooks/use-delegation';
import { HandoffPoint, CargoSlug, checkDelegationRequired } from '@/lib/constants/os-ownership-rules';

// ============================================================================
// TIPOS
// ============================================================================

interface WorkflowFooterWithDelegationProps {
    currentStep: number;
    totalSteps: number;
    onPrevStep: () => void;
    onNextStep: () => void;
    onSaveDraft?: () => void;
    prevButtonText?: string;
    nextButtonText?: string;
    finalButtonText?: string;
    disablePrev?: boolean;
    disableNext?: boolean;
    showDraftButton?: boolean;
    isLoading?: boolean;
    loadingText?: string;
    readOnlyMode?: boolean;
    onReturnToActive?: () => void;
    isFormInvalid?: boolean;
    invalidFormMessage?: string;

    // Props de delegação (obrigatórias para habilitar delegação)
    /** Código do tipo de OS (ex: "OS-01", "OS-13") */
    osType?: string;
    /** ID da OS */
    osId?: string;
    /** ID do responsável atual da OS */
    currentOwnerId?: string;
    /** Slug do cargo do usuário logado */
    currentUserCargoSlug?: CargoSlug;
    /** Callback após delegação bem sucedida */
    onDelegationComplete?: (newOwnerId: string) => void;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export function WorkflowFooterWithDelegation({
    currentStep,
    totalSteps,
    onPrevStep,
    onNextStep,
    onSaveDraft,
    prevButtonText = 'Etapa Anterior',
    nextButtonText = 'Salvar e Continuar',
    finalButtonText = 'Concluir OS',
    disablePrev = false,
    disableNext = false,
    showDraftButton = true,
    isLoading = false,
    loadingText = 'Processando...',
    readOnlyMode = false,
    onReturnToActive,
    isFormInvalid = false,
    invalidFormMessage = 'Preencha todos os campos obrigatórios para continuar',
    // Props de delegação
    osType,
    osId,
    currentOwnerId,
    currentUserCargoSlug,
    onDelegationComplete,
}: WorkflowFooterWithDelegationProps) {
    // Estado do modal de delegação
    const [isDelegationModalOpen, setIsDelegationModalOpen] = useState(false);
    const [pendingHandoff, setPendingHandoff] = useState<HandoffPoint | null>(null);

    const isLastStep = currentStep === totalSteps;
    const shouldDisableNext = disableNext || isLoading || isFormInvalid;

    // Verificar se delegação está habilitada
    const isDelegationEnabled = !!(osType && osId && currentOwnerId && currentUserCargoSlug);

    /**
     * Handler interceptado para o botão Próximo
     * Verifica se delegação é necessária antes de avançar
     */
    const handleNextClick = useCallback(() => {
        // Se delegação não está habilitada, avança normal
        if (!isDelegationEnabled) {
            onNextStep();
            return;
        }

        const nextStep = currentStep + 1;

        // Verificar se delegação é necessária
        const handoff = checkDelegationRequired(
            osType!,
            currentStep,
            nextStep,
            currentUserCargoSlug!
        );

        if (handoff) {
            // Delegação necessária - abrir modal
            setPendingHandoff(handoff);
            setIsDelegationModalOpen(true);
        } else {
            // Sem delegação - avança normal
            onNextStep();
        }
    }, [
        isDelegationEnabled,
        osType,
        currentStep,
        currentUserCargoSlug,
        onNextStep,
    ]);

    /**
     * Handler após delegação bem sucedida
     */
    const handleDelegationComplete = useCallback((newOwnerId: string) => {
        // Fechar modal
        setIsDelegationModalOpen(false);
        setPendingHandoff(null);

        // Notificar componente pai
        onDelegationComplete?.(newOwnerId);

        // Avançar para próxima etapa
        onNextStep();
    }, [onDelegationComplete, onNextStep]);

    /**
     * Handler para fechar modal sem delegar
     */
    const handleDelegationCancel = useCallback(() => {
        setIsDelegationModalOpen(false);
        setPendingHandoff(null);
    }, []);

    return (
        <>
            <div className="flex-shrink-0 border-t border-border px-6 py-4 bg-background">
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={onPrevStep}
                        disabled={disablePrev || currentStep === 1 || isLoading}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        {prevButtonText}
                    </Button>

                    <span className="text-sm">
                        <span className="font-semibold">{currentStep}</span> / {totalSteps}
                    </span>

                    <div className="flex gap-2 items-center">
                        {readOnlyMode ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground italic">
                                    Visualizando dados salvos
                                </span>
                                {onReturnToActive && (
                                    <Button
                                        onClick={onReturnToActive}
                                        className="bg-warning text-white hover:bg-warning/90"
                                    >
                                        <ChevronRight className="h-4 w-4 mr-2" />
                                        Voltar para onde estava
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                {showDraftButton && (
                                    <Button variant="outline" onClick={onSaveDraft} disabled={isLoading}>
                                        Salvar Rascunho
                                    </Button>
                                )}
                                {isLastStep ? (
                                    <TooltipProvider>
                                        <Tooltip open={isFormInvalid ? undefined : false}>
                                            <TooltipTrigger asChild>
                                                <span>
                                                    <PrimaryButton
                                                        onClick={handleNextClick}
                                                        disabled={shouldDisableNext}
                                                    >
                                                        {isLoading ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                {loadingText}
                                                            </>
                                                        ) : (
                                                            <>
                                                                {finalButtonText}
                                                                <Check className="h-4 w-4 ml-2" />
                                                            </>
                                                        )}
                                                    </PrimaryButton>
                                                </span>
                                            </TooltipTrigger>
                                            {isFormInvalid && (
                                                <TooltipContent side="top" className="bg-destructive text-white border-destructive">
                                                    <div className="flex items-center gap-2">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>{invalidFormMessage}</span>
                                                    </div>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>
                                ) : (
                                    <TooltipProvider>
                                        <Tooltip open={isFormInvalid ? undefined : false}>
                                            <TooltipTrigger asChild>
                                                <span>
                                                    <PrimaryButton
                                                        onClick={handleNextClick}
                                                        disabled={shouldDisableNext}
                                                    >
                                                        {isLoading ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                {loadingText}
                                                            </>
                                                        ) : (
                                                            <>
                                                                {nextButtonText}
                                                                <ChevronRight className="h-4 w-4 ml-2" />
                                                            </>
                                                        )}
                                                    </PrimaryButton>
                                                </span>
                                            </TooltipTrigger>
                                            {isFormInvalid && (
                                                <TooltipContent side="top" className="bg-destructive text-white border-red-700">
                                                    <div className="flex items-center gap-2">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>{invalidFormMessage}</span>
                                                    </div>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Delegação */}
            {isDelegationEnabled && pendingHandoff && (
                <DelegationModal
                    isOpen={isDelegationModalOpen}
                    onClose={handleDelegationCancel}
                    onDelegationComplete={handleDelegationComplete}
                    osId={osId!}
                    currentOwnerId={currentOwnerId!}
                    handoff={pendingHandoff}
                />
            )}
        </>
    );
}

export default WorkflowFooterWithDelegation;
