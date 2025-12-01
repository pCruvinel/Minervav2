"use client";

import React from 'react';
import { Check, Lock, ArrowLeft } from 'lucide-react';
import { cn } from '../ui/utils';

/**
 * Interface para definição de uma etapa do workflow
 */
export interface WorkflowStep {
  id: number;
  title: string;
  short: string;
  responsible?: string;
  status?: 'pending' | 'active' | 'completed';
}

export interface WorkflowStepperProps {
  /** Array de etapas do workflow */
  steps: WorkflowStep[];
  /** ID da etapa atual */
  currentStep: number;
  /** Callback executado ao clicar em uma etapa acessível */
  // eslint-disable-next-line
  onStepClick?: (_stepId: number) => void;
  /** Classes adicionais para o container */
  className?: string;
  /** Array de IDs de etapas concluídas */
  completedSteps: number[];
  /** ID da última etapa ativa (antes de navegação histórica) */
  lastActiveStep?: number;
}

/**
 * Componente de Stepper Horizontal para Workflows de OS
 * 
 * Exibe o progresso visual do fluxo de trabalho com:
 * - Etapas completadas (checkmark verde)
 * - Etapa atual (círculo dourado)
 * - Etapas futuras bloqueadas (cadeado cinza)
 * - Navegação clicável para etapas acessíveis
 * - Layout responsivo que se ajusta à largura da tela
 * 
 * @example
 * ```tsx
 * const steps = [
 *   { id: 1, title: 'Identificação', short: 'Lead', responsible: 'ADM' },
 *   { id: 2, title: 'Seleção do Tipo', short: 'Tipo OS', responsible: 'ADM' },
 * ];
 * 
 * <WorkflowStepper 
 *   steps={steps} 
 *   currentStep={2}
 *   completedSteps={[1]}
 *   onStepClick={(stepId) => logger.log(`Navegando para etapa ${stepId}`)}
 * />
 * ```
 */
export function WorkflowStepper({
  steps,
  currentStep,
  onStepClick,
  className,
  completedSteps = [], // Valor padrão para evitar erro
  lastActiveStep
}: WorkflowStepperProps) {

  const handleStepClick = (stepId: number, isAccessible: boolean) => {
    if (isAccessible && onStepClick) {
      onStepClick(stepId);
    }
  };

  return (
    <div className={cn("border-b border-border px-6 py-2", className)}>
      <div className="w-full flex items-center">
        {steps.map((step, index) => {
          // Lógica de estado baseada na etapa atual
          const isCompleted = completedSteps.includes(step.id); // Usar completedSteps para determinar se está concluída
          const isCurrent = step.id === currentStep;
          const isLastActive = lastActiveStep === step.id && currentStep !== step.id;
          // Permite acessar: etapas concluídas, etapa atual, OU qualquer etapa anterior à atual
          const isAccessible = isCompleted || isCurrent || step.id < currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step Button */}
              <button
                onClick={() => handleStepClick(step.id, isAccessible)}
                disabled={!isAccessible}
                className={cn(
                  "flex flex-col items-center gap-0.5 flex-1 min-w-0 p-1.5 rounded-md transition-all",
                  isAccessible && "hover:bg-muted cursor-pointer",
                  !isAccessible && "opacity-50 cursor-not-allowed"
                )}
                aria-label={`${step.title} - Etapa ${step.id}`}
                aria-current={isCurrent ? 'step' : undefined}
                title={isCompleted ? "Clique para visualizar dados preenchidos" : undefined}
              >
                {/* Circle with icon */}
                <div className="relative">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0",
                    isLastActive && "bg-warning border-2 border-warning/30 animate-pulse",
                    !isLastActive && isCompleted && "bg-success/10",
                    !isLastActive && isCurrent && !isCompleted && "bg-primary/20",
                    !isLastActive && !isCompleted && !isCurrent && "bg-muted"
                  )}>
                    {isLastActive ? (
                      <ArrowLeft className="h-3 w-3 text-white" />
                    ) : isCompleted ? (
                      <Check className="h-3.5 w-3.5 text-success" />
                    ) : isCurrent ? (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    ) : (
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>

                  {/* Indicador "Você estava aqui" */}
                  {isLastActive && (
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] text-warning font-semibold whitespace-nowrap">
                      Estava aqui
                    </span>
                  )}
                </div>

                {/* Step info */}
                <div className={cn(
                  "text-center",
                  isLastActive && "mt-2"
                )}>
                  <div className="text-[9px] font-medium">
                    E{step.id}
                  </div>
                  <div className="text-[9px] text-muted-foreground line-clamp-2 leading-tight">
                    {step.short}
                  </div>
                </div>
              </button>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={cn(
                  "h-0.5 flex-1 min-w-[8px] transition-colors",
                  isCompleted ? "bg-success" : "bg-muted"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}