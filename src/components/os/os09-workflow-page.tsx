import React, { useState, useMemo } from 'react';
import { Card } from '../ui/card';
import { toast } from '../../lib/utils/safe-toast';
import { WorkflowStepper, WorkflowStep } from './workflow-stepper';
import { WorkflowFooter } from './workflow-footer';
import { StepRequisicaoCompra } from './steps/os09/step-requisicao-compra';
import { StepUploadOrcamentos } from './steps/os09/step-upload-orcamentos';
import { ChevronLeft, Info } from 'lucide-react';
import { useWorkflowState } from '../../lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '../../lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '../../lib/hooks/use-workflow-completion';

const steps: WorkflowStep[] = [
  { id: 1, title: 'Requisição de Compra', short: 'Requisição', responsible: 'Solicitante', status: 'active' },
  { id: 2, title: 'Upload de Orçamentos', short: 'Orçamentos', responsible: 'Compras', status: 'pending' },
];

interface OS09WorkflowPageProps {
  onBack?: () => void;
  osId?: string;
}

export function OS09WorkflowPage({ onBack, osId }: OS09WorkflowPageProps) {
  // Hook de Estado do Workflow
  const {
    currentStep,
    setCurrentStep,
    lastActiveStep,
    setLastActiveStep,
    isHistoricalNavigation,
    setIsHistoricalNavigation,
    formDataByStep,
    setStepData,
    saveStep,
    completedSteps: completedStepsFromHook,
    isLoading: isLoadingData
  } = useWorkflowState({
    osId,
    totalSteps: steps.length
  });

  // Hook de Navegação
  const {
    handleStepClick,
    handleReturnToActive,
    handleNextStep,
    handlePrevStep
  } = useWorkflowNavigation({
    totalSteps: steps.length,
    currentStep,
    setCurrentStep,
    lastActiveStep,
    setLastActiveStep,
    isHistoricalNavigation,
    setIsHistoricalNavigation,
    onSaveStep: (step) => saveStep(step, false)
  });

  // Mapeamento de dados para compatibilidade
  const etapa1Data = formDataByStep[1] || {
    cnpj: '',
    centroCusto: '',
    tipo: '',
    descricaoMaterial: '',
    quantidade: '',
    parametroPreco: '',
    linkProduto: '',
    localEntrega: '',
    prazoEntrega: '',
    observacoes: '',
    sistema: '',
    item: '',
    geraRuido: '',
    dataPrevistaInicio: '',
    dataPrevistaFim: '',
  };

  const etapa2Data = formDataByStep[2] || {
    orcamentosAnexados: [],
  };

  // Setters wrappers
  const setEtapa1Data = (data: any) => setStepData(1, data);
  const setEtapa2Data = (data: any) => setStepData(2, data);

  /**
   * Cálculo dinâmico de etapas completadas
   */
  // Regras de completude
  const completionRules = useMemo(() => ({
    1: (data: any) => !!(data.cnpj && data.centroCusto && data.tipo && data.descricaoMaterial),
    2: (data: any) => !!(data.orcamentosAnexados && data.orcamentosAnexados.length > 0),
  }), []);

  const { completedSteps } = useWorkflowCompletion({
    currentStep,
    formDataByStep,
    completionRules,
    completedStepsFromHook
  });

  const handleSaveStep = async () => {
    try {
      await saveStep(currentStep, true);
      toast.success('Dados salvos com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar dados');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Voltar</span>
              </button>
            )}
            <div>
              <h1 className="text-2xl">OS-09: Requisição de Compras</h1>
              {osId && <p className="text-muted-foreground">OS #{osId}</p>}
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="relative">
          <WorkflowStepper 
            steps={steps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
            completedSteps={completedSteps}
            lastActiveStep={lastActiveStep || undefined}
          />
          
          {/* Botão de retorno rápido */}
          {isHistoricalNavigation && lastActiveStep && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10">
              <button
                onClick={handleReturnToActive}
                className="bg-warning hover:bg-warning text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all hover:shadow-xl font-medium"
                title="Voltar para a etapa em que estava trabalhando"
              >
                <ChevronLeft className="w-4 h-4 rotate-180" />
                <span className="font-semibold text-sm">Voltar para Etapa {lastActiveStep}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Banner de navegação histórica */}
      {isHistoricalNavigation && (
        <div className="mt-4 bg-primary/5 border-l-4 border-primary p-4 mx-6 rounded-r-lg flex items-start gap-3">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-primary text-sm">
              Modo de Visualização Histórica
            </h4>
            <p className="text-primary text-sm">
              Você está visualizando dados de uma etapa já concluída.
              {lastActiveStep && (
                <> Você estava trabalhando na <strong>Etapa {lastActiveStep}</strong>.</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Conteúdo das Etapas */}
      <div className="px-6 py-6">
        <Card className="max-w-5xl mx-auto">
          <div className="p-6">
            {/* ETAPA 1: Requisição de Compra */}
            {currentStep === 1 && (
              <StepRequisicaoCompra
                data={etapa1Data}
                onDataChange={setEtapa1Data}
                readOnly={isHistoricalNavigation}
              />
            )}

            {/* ETAPA 2: Upload de Orçamentos */}
            {currentStep === 2 && (
              <StepUploadOrcamentos
                data={etapa2Data}
                onDataChange={setEtapa2Data}
                readOnly={isHistoricalNavigation}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Footer com botões de navegação */}
      <WorkflowFooter
        currentStep={currentStep}
        totalSteps={steps.length}
        onPrevStep={handlePrevStep}
        onNextStep={handleNextStep}
        onSaveDraft={handleSaveStep}
        readOnlyMode={isHistoricalNavigation}
        onReturnToActive={handleReturnToActive}
        isLoading={isLoadingData}
      />
    </div>
  );
}
