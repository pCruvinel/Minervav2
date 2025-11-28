import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card } from '../ui/card';
import { toast } from '../../lib/utils/safe-toast';
import { WorkflowStepper, WorkflowStep } from './workflow-stepper';
import { WorkflowFooter } from './workflow-footer';
import { StepIdentificacaoSolicitante } from './steps/os08/step-identificacao-solicitante';
import { StepAtribuirCliente } from './steps/os08/step-atribuir-cliente';
import { StepAgendarVisita } from './steps/os08/step-agendar-visita';
import { StepRealizarVisita } from './steps/os08/step-realizar-visita';
import { StepFormularioPosVisita } from './steps/os08/step-formulario-pos-visita';
import { StepGerarDocumento } from './steps/os08/step-gerar-documento';
import { StepEnviarDocumento } from './steps/os08/step-enviar-documento';
import { ChevronLeft, Info } from 'lucide-react';
import { useWorkflowState } from '../../lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '../../lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '../../lib/hooks/use-workflow-completion';

const steps: WorkflowStep[] = [
  { id: 1, title: 'Identificação do Solicitante', short: 'Solicitante', responsible: 'ADM', status: 'active' },
  { id: 2, title: 'Atribuir Cliente', short: 'Cliente', responsible: 'ADM', status: 'pending' },
  { id: 3, title: 'Agendar Visita', short: 'Agendar', responsible: 'ADM', status: 'pending' },
  { id: 4, title: 'Realizar Visita', short: 'Visita', responsible: 'Obras', status: 'pending' },
  { id: 5, title: 'Formulário Pós-Visita', short: 'Formulário', responsible: 'Obras', status: 'pending' },
  { id: 6, title: 'Gerar Documento', short: 'Documento', responsible: 'ADM', status: 'pending' },
  { id: 7, title: 'Enviar ao Cliente', short: 'Enviar', responsible: 'ADM', status: 'pending' },
];

interface OS08WorkflowPageProps {
  onBack?: () => void;
  osId?: string;
}

export function OS08WorkflowPage({ onBack, osId }: OS08WorkflowPageProps) {
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
    nomeCompleto: '',
    contatoWhatsApp: '',
    condominio: '',
    cargo: '',
    bloco: '',
    unidadeAutonoma: '',
    tipoArea: '',
    unidadesVistoriar: '',
    contatoUnidades: '',
    tipoDocumento: '',
    areaVistoriada: '',
    detalhesSolicitacao: '',
    tempoSituacao: '',
    primeiraVisita: '',
    fotosAnexadas: [],
  };

  const etapa2Data = formDataByStep[2] || { clienteId: '' };
  const etapa3Data = formDataByStep[3] || { dataAgendamento: '' };
  const etapa4Data = formDataByStep[4] || { visitaRealizada: false, dataRealizacao: '' };
  const etapa5Data = formDataByStep[5] || {
    pontuacaoEngenheiro: '',
    pontuacaoMorador: '',
    tipoDocumento: '',
    areaVistoriada: '',
    manifestacaoPatologica: '',
    recomendacoesPrevias: '',
    gravidade: '',
    origemNBR: '',
    observacoesGerais: '',
    fotosLocal: [],
    resultadoVisita: '',
    justificativa: '',
  };
  const etapa6Data = formDataByStep[6] || { documentoGerado: false, documentoUrl: '' };
  const etapa7Data = formDataByStep[7] || { documentoEnviado: false, dataEnvio: '' };

  // Setters wrappers
  const setEtapa1Data = (data: any) => setStepData(1, data);
  const setEtapa2Data = (data: any) => setStepData(2, data);
  const setEtapa3Data = (data: any) => setStepData(3, data);
  const setEtapa4Data = (data: any) => setStepData(4, data);
  const setEtapa5Data = (data: any) => setStepData(5, data);
  const setEtapa6Data = (data: any) => setStepData(6, data);
  const setEtapa7Data = (data: any) => setStepData(7, data);

  /**
   * Cálculo dinâmico de etapas completadas
   */
  // Regras de completude
  const completionRules = useMemo(() => ({
    1: (data: any) => !!(data.nomeCompleto && data.contatoWhatsApp && data.tipoDocumento),
    2: (data: any) => !!data.clienteId,
    3: (data: any) => !!data.dataAgendamento,
    4: (data: any) => !!(data.visitaRealizada && data.dataRealizacao),
    5: (data: any) => !!(data.resultadoVisita && data.tipoDocumento),
    6: (data: any) => !!(data.documentoGerado && data.documentoUrl),
    7: (data: any) => !!(data.documentoEnviado && data.dataEnvio),
  }), []);

  const { completedSteps } = useWorkflowCompletion({
    currentStep,
    formDataByStep,
    completionRules,
    completedStepsFromHook
  });

  const handleSaveStep = async () => {
    try {
      await saveStep(currentStep, true); // Salvar como rascunho explicitamente se clicado no botão salvar
      toast.success('Dados salvos com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar dados');
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
              <h1 className="text-2xl">OS-08: Visita Técnica / Parecer Técnico</h1>
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
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all hover:shadow-xl font-medium"
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
        <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 mx-6 rounded-r-lg flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 text-sm">
              Modo de Visualização Histórica
            </h4>
            <p className="text-blue-800 text-sm">
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
            {/* ETAPA 1: Identificação do Solicitante */}
            {currentStep === 1 && (
              <StepIdentificacaoSolicitante
                data={etapa1Data}
                onDataChange={setEtapa1Data}
                readOnly={isHistoricalNavigation}
              />
            )}

            {/* ETAPA 2: Atribuir Cliente */}
            {currentStep === 2 && (
              <StepAtribuirCliente
                data={etapa2Data}
                onDataChange={setEtapa2Data}
                readOnly={isHistoricalNavigation}
              />
            )}

            {/* ETAPA 3: Agendar Visita */}
            {currentStep === 3 && (
              <StepAgendarVisita
                data={etapa3Data}
                onDataChange={setEtapa3Data}
                readOnly={isHistoricalNavigation}
              />
            )}

            {/* ETAPA 4: Realizar Visita */}
            {currentStep === 4 && (
              <StepRealizarVisita
                data={etapa4Data}
                onDataChange={setEtapa4Data}
                readOnly={isHistoricalNavigation}
              />
            )}

            {/* ETAPA 5: Formulário Pós-Visita */}
            {currentStep === 5 && (
              <StepFormularioPosVisita
                data={etapa5Data}
                onDataChange={setEtapa5Data}
                readOnly={isHistoricalNavigation}
              />
            )}

            {/* ETAPA 6: Gerar Documento */}
            {currentStep === 6 && (
              <StepGerarDocumento
                osId={osId || ''}
                data={etapa6Data}
                onDataChange={setEtapa6Data}
                readOnly={isHistoricalNavigation}
              />
            )}

            {/* ETAPA 7: Enviar Documento */}
            {currentStep === 7 && (
              <StepEnviarDocumento
                data={etapa7Data}
                onDataChange={setEtapa7Data}
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
