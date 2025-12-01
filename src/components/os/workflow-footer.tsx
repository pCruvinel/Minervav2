
import { Button } from '../ui/button';
import { PrimaryButton } from '../ui/primary-button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { ChevronLeft, ChevronRight, Check, Loader2, Info, AlertCircle } from 'lucide-react';

interface WorkflowFooterProps {
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
  /** Se true, mostra que o formulário está inválido e bloqueia o botão */
  isFormInvalid?: boolean;
  /** Mensagem customizada para tooltip quando formulário inválido */
  invalidFormMessage?: string;
}

export function WorkflowFooter({
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
}: WorkflowFooterProps) {
  const isLastStep = currentStep === totalSteps;
  const shouldDisableNext = disableNext || isLoading || isFormInvalid;

  return (
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
                          onClick={onNextStep}
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
                          onClick={onNextStep}
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
  );
}