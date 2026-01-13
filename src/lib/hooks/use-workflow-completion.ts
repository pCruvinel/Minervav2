import { useMemo } from 'react';

interface UseWorkflowCompletionProps {
  currentStep: number;
  formDataByStep: Record<number, any>;
  completionRules: Record<number, (data: any) => boolean>;
  completedStepsFromHook?: number[];
}

/**
 * Hook para gerenciar estado de completude de etapas do workflow
 * 
 * @param completedStepsFromHook - Etapas realmente concluídas (salvas no banco com status='concluida')
 * @param completionRules - Regras para verificar se dados locais permitem avançar
 * 
 * @returns 
 * - completedSteps: Etapas realmente concluídas (do banco)
 * - readyToAdvanceSteps: Etapas com dados preenchidos que permitem avançar
 * - isStepCompleted: Verifica se etapa está concluída no banco
 * - canAdvanceFromStep: Verifica se dados locais permitem avançar de uma etapa
 */
export function useWorkflowCompletion({
  currentStep: _currentStep,
  formDataByStep,
  completionRules,
  completedStepsFromHook = []
}: UseWorkflowCompletionProps) {
  
  // ✅ FIX: completedSteps agora é APENAS do banco (etapas realmente salvas como concluídas)
  const completedSteps = useMemo(() => {
    return [...completedStepsFromHook].sort((a, b) => a - b);
  }, [completedStepsFromHook]);

  // readyToAdvanceSteps: etapas com dados locais que satisfazem as regras (permite avançar)
  const readyToAdvanceSteps = useMemo(() => {
    const ready: number[] = [];

    Object.entries(completionRules).forEach(([stepIdStr, rule]) => {
      const stepId = parseInt(stepIdStr, 10);
      const stepData = formDataByStep[stepId] || {};
      
      try {
        if (rule(stepData)) {
          ready.push(stepId);
        }
      } catch (error) {
        console.warn(`Erro ao validar etapa ${stepId}:`, error);
      }
    });

    return ready.sort((a, b) => a - b);
  }, [formDataByStep, completionRules]);

  // ✅ FIX: isStepCompleted verifica apenas o banco
  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);

  // canAdvanceFromStep: verifica se dados locais permitem avançar
  const canAdvanceFromStep = (stepId: number) => readyToAdvanceSteps.includes(stepId);

  const progressPercentage = useMemo(() => {
    const totalSteps = Object.keys(completionRules).length;
    if (totalSteps === 0) return 0;
    return Math.round((completedSteps.length / totalSteps) * 100);
  }, [completedSteps, completionRules]);

  return {
    completedSteps,
    readyToAdvanceSteps,
    isStepCompleted,
    canAdvanceFromStep,
    progressPercentage
  };
}

