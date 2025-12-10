import { useState, useMemo, useEffect } from 'react';
import { useEtapas } from './use-etapas';
import { toast } from '../utils/safe-toast';
import { getStepDefaults } from '@/lib/utils/schema-defaults';
import { logger } from '@/lib/utils/logger';

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

  // ✅ FIX: Sync currentStep when initialStep prop changes (e.g., from URL navigation)
  // O useState só usa initialStep na primeira montagem, então precisamos sincronizar manualmente
  useEffect(() => {
    if (initialStep !== undefined && initialStep !== currentStep) {
      logger.log(`🔄 Sync currentStep from initialStep prop: ${initialStep} (was: ${currentStep})`);
      setCurrentStep(initialStep);
    }
  }, [initialStep]);

  // ✅ FIX: Clear formDataByStep when osId changes to prevent data leakage between OSs
  useEffect(() => {
    if (osId) {
      logger.log(`🧹 Clearing form data for new OS: ${osId}`);
      setFormDataByStep({});
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
  // ✅ FIX: Added explicitData parameter to bypass React state timing issues
  const saveStep = async (
    step: number,
    isDraft: boolean | any = false,
    explicitData?: any
  ) => {
    // ❌ CORREÇÃO CRÍTICA: Não permitir avanço sem OS ID
    // A OS deve ser criada obrigatoriamente na Etapa 1 antes de avançar
    if (!osId) {
      logger.warn(`⚠️ saveStep(${step}): Sem osId - impossível salvar etapa. A OS deve ser criada primeiro!`);
      return false; // ✅ Bloquear avanço ao invés de permitir "modo demonstração"
    }

    // Use explicit data if provided, otherwise read from state
    let data: any;
    if (explicitData !== undefined) {
      data = explicitData;
      logger.log(`💾 saveStep(${step}): Using explicit data (${Object.keys(data || {}).length} fields)`);
    } else {
      data = getStepData(step);
      logger.log(`💾 saveStep(${step}): Using state data (${Object.keys(data || {}).length} fields)`);
    }

    const etapa = etapas?.find(e => e.ordem === step);

    if (etapa) {
      await saveFormData(etapa.id, data, !isDraft);
      return true;
    }
    
    logger.warn(`⚠️ saveStep(${step}): Etapa não encontrada no banco. Verifique se a OS foi criada corretamente.`);
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
    saveFormData, // ✅ Exposed for auto-save in useEffect
    createEtapa, // Exposed for complex workflows
    updateEtapa, // Exposed for complex workflows
    refreshEtapas: () => osId && fetchEtapas(osId)
  };
}
