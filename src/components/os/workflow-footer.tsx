import React from 'react';
import { Button } from '../ui/button';
import { PrimaryButton } from '../ui/primary-button';
import { ChevronLeft, ChevronRight, Check, Loader2, Info } from 'lucide-react';

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
}: WorkflowFooterProps) {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex-shrink-0 border-t border-neutral-200 px-6 py-4 bg-neutral-50">
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
              <span className="text-sm text-gray-500 italic">
                Visualizando dados salvos
              </span>
              {onReturnToActive && (
                <Button
                  onClick={onReturnToActive}
                  style={{ backgroundColor: '#f97316', color: 'white' }}
                  className="hover:opacity-90"
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
                <PrimaryButton 
                  onClick={onNextStep}
                  disabled={disableNext || isLoading}
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
              ) : (
                <PrimaryButton 
                  onClick={onNextStep}
                  disabled={disableNext || isLoading}
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
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}