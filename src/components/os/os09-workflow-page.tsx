import React, { useState } from 'react';
import { Card } from '../ui/card';
import { toast } from '../../lib/utils/safe-toast';
import { WorkflowStepper, WorkflowStep } from './workflow-stepper';
import { WorkflowFooter } from './workflow-footer';
import { StepRequisicaoCompra } from './steps/os09/step-requisicao-compra';
import { StepUploadOrcamentos } from './steps/os09/step-upload-orcamentos';
import { ChevronLeft } from 'lucide-react';

const steps: WorkflowStep[] = [
  { id: 1, title: 'Requisição de Compra', short: 'Requisição', responsible: 'Solicitante', status: 'active' },
  { id: 2, title: 'Upload de Orçamentos', short: 'Orçamentos', responsible: 'Compras', status: 'pending' },
];

interface OS09WorkflowPageProps {
  onBack?: () => void;
  osId?: string;
}

export function OS09WorkflowPage({ onBack, osId }: OS09WorkflowPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [lastActiveStep, setLastActiveStep] = useState<number | null>(null);
  const [isHistoricalNavigation, setIsHistoricalNavigation] = useState(false);

  // Estados de cada etapa
  const [etapa1Data, setEtapa1Data] = useState({
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
  });

  const [etapa2Data, setEtapa2Data] = useState({
    orcamentosAnexados: [] as string[],
  });

  /**
   * Avançar para próxima etapa
   */
  const handleNext = () => {
    if (currentStep < steps.length) {
      // Marcar etapa atual como completa
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      
      // Atualizar último passo ativo
      setLastActiveStep(currentStep + 1);
      setCurrentStep(currentStep + 1);
      setIsHistoricalNavigation(false);
      
      toast.success(`Avançado para etapa ${currentStep + 1}`);
    }
  };

  /**
   * Voltar para etapa anterior
   */
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      toast.info(`Voltou para etapa ${currentStep - 1}`);
    }
  };

  /**
   * Navegar para uma etapa específica (histórico)
   */
  const handleStepClick = (stepId: number) => {
    if (completedSteps.includes(stepId) || stepId === currentStep) {
      setIsHistoricalNavigation(stepId < (lastActiveStep || currentStep));
      setCurrentStep(stepId);
      
      if (stepId < (lastActiveStep || currentStep)) {
        toast.info(`📜 Visualizando etapa ${stepId} (histórico)`);
      }
    }
  };

  /**
   * Retornar para última etapa ativa
   */
  const handleReturnToActive = () => {
    if (lastActiveStep) {
      setCurrentStep(lastActiveStep);
      setIsHistoricalNavigation(false);
      toast.success(`Retornado à etapa ativa ${lastActiveStep}`);
    }
  };

  /**
   * Salvar dados da etapa atual
   */
  const handleSaveStep = async () => {
    try {
      // Aqui você implementará a integração com o backend
      toast.success('Dados salvos com sucesso!');
      console.log('Salvando etapa', currentStep, {
        etapa1Data,
        etapa2Data,
      });
    } catch (error) {
      toast.error('Erro ao salvar dados');
      console.error('Erro:', error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Voltar</span>
              </button>
            )}
            <div>
              <h1 className="text-2xl">OS-09: Requisição de Compras</h1>
              {osId && <p className="text-neutral-600">OS #{osId}</p>}
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-lg whitespace-nowrap animate-pulse"
                style={{ backgroundColor: '#f97316', color: 'white' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ea580c';
                  e.currentTarget.classList.remove('animate-pulse');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f97316';
                  e.currentTarget.classList.add('animate-pulse');
                }}
              >
                <ChevronLeft className="w-4 h-4 rotate-180" />
                <span className="text-sm">Voltar para Etapa {lastActiveStep}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Banner de navegação histórica */}
      {isHistoricalNavigation && (
        <div className="bg-orange-50 border-b border-orange-200 px-6 py-3">
          <p className="text-orange-800 text-sm">
            📜 Você está visualizando uma etapa já concluída. As alterações serão salvas, mas não afetarão o progresso atual.
          </p>
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
              />
            )}

            {/* ETAPA 2: Upload de Orçamentos */}
            {currentStep === 2 && (
              <StepUploadOrcamentos
                data={etapa2Data}
                onDataChange={setEtapa2Data}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Footer com botões de navegação */}
      <WorkflowFooter
        currentStep={currentStep}
        totalSteps={steps.length}
        onBack={handleBack}
        onNext={handleNext}
        onSave={handleSaveStep}
        isFirstStep={currentStep === 1}
        isLastStep={currentStep === steps.length}
      />
    </div>
  );
}
