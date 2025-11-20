import { useMemo } from 'react';

interface UseWorkflowCompletionProps {
  currentStep: number;
  formDataByStep: Record<number, any>;
  completionRules: Record<number, (data: any) => boolean>;
  completedStepsFromHook?: number[];
}

export function useWorkflowCompletion({
  currentStep,
  formDataByStep,
  completionRules,
  completedStepsFromHook = []
}: UseWorkflowCompletionProps) {
  
  const completedSteps = useMemo(() => {
    // If we have completed steps from the backend/hook, use them as a base or override
    // Ideally, we merge them or use the backend source of truth if available.
    // For now, the pattern in the pages is: if hook has data, use it; else calculate.
    if (completedStepsFromHook.length > 0) return completedStepsFromHook;

    const completed: number[] = [];

    Object.entries(completionRules).forEach(([stepIdStr, rule]) => {
      const stepId = parseInt(stepIdStr, 10);
      const stepData = formDataByStep[stepId] || {};
      
      if (rule(stepData)) {
        completed.push(stepId);
      }
    });

    return completed;
  }, [completedStepsFromHook, formDataByStep, completionRules]);

  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);

  const progressPercentage = useMemo(() => {
    const totalSteps = Object.keys(completionRules).length;
    if (totalSteps === 0) return 0;
    return Math.round((completedSteps.length / totalSteps) * 100);
  }, [completedSteps, completionRules]);

  return {
    completedSteps,
    isStepCompleted,
    progressPercentage
  };
}
