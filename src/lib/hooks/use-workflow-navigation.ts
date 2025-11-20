import { toast } from '../utils/safe-toast';

export interface WorkflowNavigationOptions {
  totalSteps: number;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  lastActiveStep: number | null;
  setLastActiveStep: (step: number | null) => void;
  isHistoricalNavigation: boolean;
  setIsHistoricalNavigation: (isHistorical: boolean) => void;
  onSaveStep?: (step: number) => Promise<boolean>;
}

export function useWorkflowNavigation({
  totalSteps,
  currentStep,
  setCurrentStep,
  lastActiveStep,
  setLastActiveStep,
  isHistoricalNavigation,
  setIsHistoricalNavigation,
  onSaveStep
}: WorkflowNavigationOptions) {

  const handleStepClick = (stepId: number) => {
    // Only allow going back to completed steps or current step
    // This logic assumes stepId <= currentStep check is done by UI or here
    // But typically we allow clicking any previous step
    
    if (stepId <= currentStep || (lastActiveStep && stepId <= lastActiveStep)) {
      // If navigating to a previous step, save current position
      if (stepId < currentStep && !isHistoricalNavigation) {
        setLastActiveStep(currentStep);
        setIsHistoricalNavigation(true);
        toast.info('Modo de visualização histórica', { icon: '👁️' });
      }

      // If returning to the last active step
      if (lastActiveStep && stepId === lastActiveStep) {
        setIsHistoricalNavigation(false);
        setLastActiveStep(null);
        toast.success('Voltou para onde estava!', { icon: '🎯' });
      }

      setCurrentStep(stepId);
    } else {
      toast.warning('Complete as etapas anteriores primeiro', { icon: '🔒' });
    }
  };

  const handleReturnToActive = () => {
    if (lastActiveStep) {
      setCurrentStep(lastActiveStep);
      setIsHistoricalNavigation(false);
      setLastActiveStep(null);
      toast.success('Voltou para onde estava!', { icon: '🎯' });
    }
  };

  const handleNextStep = async () => {
    if (onSaveStep) {
      const saved = await onSaveStep(currentStep);
      if (!saved) return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      toast.success('Etapa concluída!', { icon: '✅' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return {
    handleStepClick,
    handleReturnToActive,
    handleNextStep,
    handlePrevStep
  };
}
