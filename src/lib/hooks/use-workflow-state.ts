import { useState, useMemo, useEffect } from 'react';
import { useEtapas } from './use-etapas';
import { toast } from '../utils/safe-toast';
import { getStepDefaults } from '@/lib/utils/schema-defaults';

export interface WorkflowStateOptions {
  osId?: string;
  totalSteps: number;
  initialStep?: number;
}

export function useWorkflowState({ osId, totalSteps, initialStep = 1 }: WorkflowStateOptions) {
  // Navigation State
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [lastActiveStep, setLastActiveStep] = useState<number | null>(null);
  const [isHistoricalNavigation, setIsHistoricalNavigation] = useState(false);

  // Data State (Consolidated)
  const [formDataByStep, setFormDataByStep] = useState<Record<number, any>>({});

  // Integration with useEtapas for persistence
  const { 
    etapas, 
    isLoading: isLoadingEtapas, 
    fetchEtapas, 
    saveFormData,
    getEtapaData,
    createEtapa,
    updateEtapa
  } = useEtapas();

  // Load steps when osId changes
  useEffect(() => {
    if (osId) {
      fetchEtapas(osId);
    }
  }, [osId]);

  // Sync loaded steps into local state
  useEffect(() => {
    if (etapas && etapas.length > 0) {
      const newFormData: Record<number, any> = {};
      etapas.forEach((etapa) => {
        if (etapa.dados_etapa) {
          newFormData[etapa.ordem] = etapa.dados_etapa;
        }
      });
      setFormDataByStep(newFormData);
      
      // Determine last completed step to set current step if not in historical mode
      // This logic might need to be customized or optional
      const lastCompleted = etapas.reduce((max, step) => {
        return step.status === 'concluida' && step.ordem > max ? step.ordem : max;
      }, 0);

      if (lastCompleted > 0 && !isHistoricalNavigation) {
         // Only auto-advance if we are at the beginning or it's a fresh load
         // For now, let's rely on the component to decide initial step or use this logic carefully
         // setCurrentStep(Math.min(lastCompleted + 1, totalSteps));
      }
    }
  }, [etapas]);

  // Computed: Completed Steps
  const completedSteps = useMemo(() => {
    if (!etapas) return [];
    return etapas
      .filter(e => e.status === 'concluida')
      .map(e => e.ordem);
  }, [etapas]);

  // Helper: Get data for a specific step
  const getStepData = (step: number) => {
    const existingData = formDataByStep[step];

    // Se tem dados salvos, retorna eles
    if (existingData && Object.keys(existingData).length > 0) {
      return existingData;
    }

    // Caso contrário, retorna defaults baseados no schema
    return getStepDefaults(step);
  };

  // Helper: Update data for a specific step
  const setStepData = (step: number, data: any) => {
    setFormDataByStep(prev => ({
      ...prev,
      [step]: data
    }));
  };

  // Helper: Save current step data
  const saveStep = async (step: number, isDraft = false) => {
    if (!osId) return false;

    const data = getStepData(step);
    const etapa = etapas?.find(e => e.ordem === step);

    if (etapa) {
      await saveFormData(etapa.id, data, !isDraft);
      return true;
    }
    return false;
  };

  return {
    // State
    currentStep,
    setCurrentStep,
    lastActiveStep,
    setLastActiveStep,
    isHistoricalNavigation,
    setIsHistoricalNavigation,
    formDataByStep,
    setFormDataByStep,
    
    // Derived
    completedSteps,
    isLoading: isLoadingEtapas,
    etapas,

    // Actions
    getStepData,
    setStepData,
    saveStep,
    createEtapa, // Exposed for complex workflows
    updateEtapa, // Exposed for complex workflows
    refreshEtapas: () => osId && fetchEtapas(osId)
  };
}
