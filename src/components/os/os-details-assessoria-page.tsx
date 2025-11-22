"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { ChevronLeft, AlertCircle, Info } from 'lucide-react';
import { cn } from '../ui/utils';
import { WorkflowStepper, WorkflowStep } from './workflow-stepper';
import { WorkflowFooter } from './workflow-footer';
import { toast } from '../../lib/utils/safe-toast';
import { supabase } from '@/lib/supabase-client';
import { useWorkflowState } from '../../lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '../../lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '../../lib/hooks/use-workflow-completion';

// Componentes compartilhados
import { StepIdentificacaoLeadCompleto, type StepIdentificacaoLeadCompletoHandle } from './steps/shared/step-identificacao-lead-completo';
import { StepFollowup1, type StepFollowup1Handle } from './steps/shared/step-followup-1';
import { StepPrecificacao } from './steps/shared/step-precificacao';
import { StepGerarProposta } from './steps/shared/step-gerar-proposta';
import { StepAgendarApresentacao } from './steps/shared/step-agendar-apresentacao';
import { StepRealizarApresentacao } from './steps/shared/step-realizar-apresentacao';
import { StepFollowup3 } from './steps/shared/step-followup-3';
import { StepGerarContrato } from './steps/shared/step-gerar-contrato';
import { StepContratoAssinado } from './steps/shared/step-contrato-assinado';

// Componentes específicos de Assessoria
import { StepSelecaoTipoAssessoria } from './steps/assessoria/step-selecao-tipo-assessoria';
import { StepMemorialEscopoAssessoria } from './steps/assessoria/step-memorial-escopo-assessoria';
import { StepAtivarContratoAssessoria } from './steps/assessoria/step-ativar-contrato-assessoria';

// Definição das 12 etapas do fluxo OS 05-06
const steps: WorkflowStep[] = [
  { id: 1, title: 'Identificação do Cliente/Lead', short: 'Lead', responsible: 'ADM' },
  { id: 2, title: 'Seleção do Tipo de OS', short: 'Tipo OS', responsible: 'ADM' },
  { id: 3, title: 'Follow-up 1 (Entrevista Inicial)', short: 'Follow-up 1', responsible: 'ADM' },
  { id: 4, title: 'Formulário Memorial (Escopo e Prazos)', short: 'Escopo', responsible: 'Assessoria' },
  { id: 5, title: 'Precificação (Formulário Financeiro)', short: 'Precificação', responsible: 'Assessoria' },
  { id: 6, title: 'Gerar Proposta Comercial', short: 'Proposta', responsible: 'ADM' },
  { id: 7, title: 'Agendar Visita (Apresentação)', short: 'Agendar', responsible: 'ADM' },
  { id: 8, title: 'Realizar Visita (Apresentação)', short: 'Apresentação', responsible: 'ADM' },
  { id: 9, title: 'Follow-up 3 (Pós-Apresentação)', short: 'Follow-up 3', responsible: 'ADM' },
  { id: 10, title: 'Gerar Contrato (Upload)', short: 'Contrato', responsible: 'ADM' },
  { id: 11, title: 'Contrato Assinado', short: 'Assinatura', responsible: 'ADM' },
  { id: 12, title: 'Ativar Contrato', short: 'Ativação', responsible: 'Sistema' },
];

interface OSDetailsAssessoriaPageProps {
  onBack?: () => void;
  tipoOS?: 'OS-05' | 'OS-06';
  osId?: string; // ID da OS para persistência
}

export function OSDetailsAssessoriaPage({ onBack, tipoOS = 'OS-05', osId }: OSDetailsAssessoriaPageProps) {
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
    onSaveStep: (step) => saveStep(step, false) // Salvar como concluído ao avançar
  });

  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [showLeadCombobox, setShowLeadCombobox] = useState(false);
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refs para componentes com validação imperativa
  const stepLeadRef = useRef<StepIdentificacaoLeadCompletoHandle>(null);
  const stepFollowup1Ref = useRef<StepFollowup1Handle>(null);

  // Mapeamento de dados para compatibilidade com componentes existentes
  const etapa1Data = formDataByStep[1] || { leadId: '' };
  const etapa2Data = formDataByStep[2] || { tipoOS: '' };
  const etapa3Data = formDataByStep[3] || {
    idadeEdificacao: '',
    motivoProcura: '',
    quandoAconteceu: '',
    oqueFeitoARespeito: '',
    existeEscopo: '',
    previsaoOrcamentaria: '',
    grauUrgencia: '',
    apresentacaoProposta: '',
    nomeContatoLocal: '',
    telefoneContatoLocal: '',
    cargoContatoLocal: '',
  };
  const etapa4Data = formDataByStep[4] || {
    descricaoServico: '',
    escopo: '',
    prazoEstimado: '',
    observacoes: '',
  };
  const etapa5Data = formDataByStep[5] || {
    valorBase: '',
    descontos: '',
    acrescimos: '',
    observacoesFinanceiras: '',
  };
  const etapa6Data = formDataByStep[6] || {
    propostaGerada: false,
    dataGeracao: '',
  };
  const etapa7Data = formDataByStep[7] || { dataAgendamento: '' };
  const etapa8Data = formDataByStep[8] || { apresentacaoRealizada: false };
  const etapa9Data = formDataByStep[9] || {
    interesseCliente: '',
    pontosDuvida: '',
    proximosPassos: '',
    dataRetorno: '',
  };
  const etapa10Data = formDataByStep[10] || {
    contratoFile: null as File | null,
    dataUpload: '',
  };
  const etapa11Data = formDataByStep[11] || {
    contratoAssinado: false,
    dataAssinatura: '',
  };

  // Setters wrappers
  const setEtapa1Data = (data: any) => setStepData(1, data);
  const setEtapa2Data = (data: any) => setStepData(2, data);
  const setEtapa3Data = (data: any) => setStepData(3, data);
  const setEtapa4Data = (data: any) => setStepData(4, data);
  const setEtapa5Data = (data: any) => setStepData(5, data);
  const setEtapa6Data = (data: any) => setStepData(6, data);
  const setEtapa7Data = (data: any) => setStepData(7, data);
  const setEtapa8Data = (data: any) => setStepData(8, data);
  const setEtapa9Data = (data: any) => setStepData(9, data);
  const setEtapa10Data = (data: any) => setStepData(10, data);
  const setEtapa11Data = (data: any) => setStepData(11, data);

  // Estado do formulário de novo lead
  const [formData, setFormData] = useState({
    nome: '',
    cpfCnpj: '',
    tipo: '',
    nomeResponsavel: '',
    cargoResponsavel: '',
    telefone: '',
    email: '',
    tipoEdificacao: '',
    qtdUnidades: '',
    qtdBlocos: '',
    qtdPavimentos: '',
    tipoTelhado: '',
    possuiElevador: false,
    possuiPiscina: false,
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });

  // Sincronizar selectedLeadId com etapa1Data
  useEffect(() => {
    if (etapa1Data.leadId && etapa1Data.leadId !== selectedLeadId) {
      setSelectedLeadId(etapa1Data.leadId);
    }
  }, [etapa1Data.leadId]);

  // Calcular quais etapas estão concluídas
  // Combinar lógica local (preenchimento) com lógica do hook (status APROVADA)
  // Regras de completude
  const completionRules = useMemo(() => ({
    1: (data: any) => !!data.leadId,
    2: (data: any) => !!data.tipoOS,
    3: (data: any) => !!(data.motivoProcura && data.idadeEdificacao),
    4: (data: any) => !!(data.descricaoServico && data.escopo),
    5: (data: any) => !!data.valorBase,
    6: (data: any) => !!data.propostaGerada,
    7: (data: any) => !!data.dataAgendamento,
    8: (data: any) => !!data.apresentacaoRealizada,
    9: (data: any) => !!data.interesseCliente,
    10: (data: any) => !!data.contratoFile,
    11: (data: any) => !!data.contratoAssinado,
  }), []);

  const { completedSteps } = useWorkflowCompletion({
    currentStep,
    formDataByStep,
    completionRules,
    completedStepsFromHook
  });

  // Verificar se o formulário da etapa atual está inválido
  const isCurrentStepInvalid = useMemo(() => {
    if (isHistoricalNavigation) return false;

    switch (currentStep) {
      case 1:
        return stepLeadRef.current?.isFormValid() === false;
      case 3:
        return stepFollowup1Ref.current?.isFormValid() === false;
      default:
        return false;
    }
  }, [currentStep, isHistoricalNavigation]);

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    setEtapa1Data({ ...etapa1Data, leadId });
  };

  const handleSaveNewLead = () => {
    console.log('Salvando novo lead:', formData);
    setShowNewLeadDialog(false);
    setSelectedLeadId('NEW');
    setEtapa1Data({ ...etapa1Data, leadId: 'NEW' });
  };

  // Handler para finalizar etapa
  const handleConcluirEtapa = async () => {
    const saved = await saveStep(currentStep, false);
    if (saved || !osId) { // Se salvou ou se não tem osId (modo simulação)
      const osDestino = tipoOS === 'OS-05' ? 'OS-12' : 'OS-11';
      alert(`Contrato ativado com sucesso! Criando ${osDestino}...`);
      if (onBack) onBack();
    }
  };

  // Wrapper para salvar rascunho
  const handleSaveDraft = async () => {
    setIsSaving(true);
    await saveStep(currentStep, true);
    setIsSaving(false);
    toast.success('Rascunho salvo com sucesso!');
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Botão Voltar */}
      {onBack && (
        <div className="border-b border-neutral-200 px-6 py-3 bg-white">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Voltar ao Hub de Criação
          </Button>
        </div>
      )}

      {/* Stepper Horizontal */}
      <div className="relative">
        <WorkflowStepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          completedSteps={completedSteps}
          lastActiveStep={lastActiveStep || undefined}
        />

        {/* Botão de Retorno Rápido */}
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Responsável: {steps[currentStep - 1].responsible}
                  </p>
                </div>
                <Badge variant="outline" className="border-primary text-primary">
                  Etapa {currentStep} de {steps.length}
                </Badge>
              </div>

              {/* Banner de Modo Histórico */}
              {isHistoricalNavigation && (
                <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg flex items-start gap-3">
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
            </CardHeader>
            <CardContent className="space-y-6 flex-1 overflow-y-auto">

              {/* ETAPA 1: Identificação do Cliente/Lead */}
              {currentStep === 1 && (
                <StepIdentificacaoLeadCompleto
                  ref={stepLeadRef}
                  selectedLeadId={selectedLeadId}
                  onSelectLead={handleSelectLead}
                  showCombobox={showLeadCombobox}
                  onShowComboboxChange={setShowLeadCombobox}
                  showNewLeadDialog={showNewLeadDialog}
                  onShowNewLeadDialogChange={setShowNewLeadDialog}
                  formData={formData}
                  onFormDataChange={setFormData}
                  onSaveNewLead={handleSaveNewLead}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 2: Seleção do Tipo de OS */}
              {currentStep === 2 && (
                <StepSelecaoTipoAssessoria
                  data={etapa2Data}
                  onDataChange={setEtapa2Data}
                />
              )}

              {/* ETAPA 3: Follow-up 1 (Entrevista Inicial) */}
              {currentStep === 3 && (
                <StepFollowup1
                  ref={stepFollowup1Ref}
                  data={etapa3Data}
                  onDataChange={setEtapa3Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 4: Formulário Memorial (Escopo e Prazos) */}
              {currentStep === 4 && (
                <StepMemorialEscopoAssessoria
                  data={etapa4Data}
                  onDataChange={setEtapa4Data}
                />
              )}

              {/* ETAPA 5: Precificação */}
              {currentStep === 5 && (
                <StepPrecificacao
                  memorialData={etapa4Data}
                  data={etapa5Data}
                  onDataChange={setEtapa5Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 6: Gerar Proposta Comercial */}
              {currentStep === 6 && (
                <StepGerarProposta
                  data={etapa6Data}
                  onDataChange={setEtapa6Data}
                />
              )}

              {/* ETAPA 7: Agendar Visita (Apresentação) */}
              {currentStep === 7 && (
                <StepAgendarApresentacao
                  data={etapa7Data}
                  onDataChange={setEtapa7Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 8: Realizar Visita (Apresentação) */}
              {currentStep === 8 && (
                <StepRealizarApresentacao
                  data={etapa8Data}
                  onDataChange={setEtapa8Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 9: Follow-up 3 (Pós-Apresentação) */}
              {currentStep === 9 && (
                <StepFollowup3
                  data={etapa9Data}
                  onDataChange={setEtapa9Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 10: Gerar Contrato (Upload) */}
              {currentStep === 10 && (
                <StepGerarContrato
                  data={etapa10Data}
                  onDataChange={setEtapa10Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 11: Contrato Assinado */}
              {currentStep === 11 && (
                <StepContratoAssinado
                  data={etapa11Data}
                  onDataChange={setEtapa11Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 12: Ativar Contrato */}
              {currentStep === 12 && (
                <StepAtivarContratoAssessoria
                  tipoOS={tipoOS}
                  onAtivarContrato={handleConcluirEtapa}
                  readOnly={isHistoricalNavigation}
                />
              )}
            </CardContent>

            <WorkflowFooter
              currentStep={currentStep}
              totalSteps={steps.length}
              onPrevStep={handlePrevStep}
              onNextStep={currentStep === steps.length ? handleConcluirEtapa : handleNextStep}
              onSaveDraft={handleSaveDraft}
              prevButtonText="Anterior"
              nextButtonText="Salvar e Avançar"
              finalButtonText="Ativar Contrato"
              readOnlyMode={isHistoricalNavigation}
              onReturnToActive={handleReturnToActive}
              isFormInvalid={isCurrentStepInvalid}
              invalidFormMessage="Preencha todos os campos obrigatórios para continuar"
              isLoading={isSaving || isLoadingData}
              loadingText="Salvando..."
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
