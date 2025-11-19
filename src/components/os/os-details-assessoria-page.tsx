"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { ChevronLeft, AlertCircle, Info } from 'lucide-react';
import { cn } from '../ui/utils';
import { WorkflowStepper, WorkflowStep } from './workflow-stepper';
import { WorkflowFooter } from './workflow-footer';
import { toast } from '../../lib/utils/safe-toast';

// Componentes compartilhados
import { StepIdentificacaoLeadCompleto } from './steps/shared/step-identificacao-lead-completo';
import { StepFollowup1 } from './steps/shared/step-followup-1';
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
}

export function OSDetailsAssessoriaPage({ onBack, tipoOS = 'OS-05' }: OSDetailsAssessoriaPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [showLeadCombobox, setShowLeadCombobox] = useState(false);
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);

  // Estados de navegação histórica
  const [lastActiveStep, setLastActiveStep] = useState<number | null>(null);
  const [isHistoricalNavigation, setIsHistoricalNavigation] = useState(false);
  
  // Estados dos formulários de cada etapa
  const [etapa1Data, setEtapa1Data] = useState({ leadId: '' });
  const [etapa2Data, setEtapa2Data] = useState({ tipoOS: '' });
  const [etapa3Data, setEtapa3Data] = useState({
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
  });
  const [etapa4Data, setEtapa4Data] = useState({
    descricaoServico: '',
    escopo: '',
    prazoEstimado: '',
    observacoes: '',
  });
  const [etapa5Data, setEtapa5Data] = useState({
    valorBase: '',
    descontos: '',
    acrescimos: '',
    observacoesFinanceiras: '',
  });
  const [etapa6Data, setEtapa6Data] = useState({
    propostaGerada: false,
    dataGeracao: '',
  });
  const [etapa7Data, setEtapa7Data] = useState({ dataAgendamento: '' });
  const [etapa8Data, setEtapa8Data] = useState({ apresentacaoRealizada: false });
  const [etapa9Data, setEtapa9Data] = useState({
    interesseCliente: '',
    pontosDuvida: '',
    proximosPassos: '',
    dataRetorno: '',
  });
  const [etapa10Data, setEtapa10Data] = useState({
    contratoFile: null as File | null,
    dataUpload: '',
  });
  const [etapa11Data, setEtapa11Data] = useState({
    contratoAssinado: false,
    dataAssinatura: '',
  });

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

  // Calcular quais etapas estão concluídas (FIXADO: TODO 2)
  // Uma etapa é considerada completa quando tem dados mínimos preenchidos
  const completedSteps = useMemo(() => {
    const completed: number[] = [];

    // Etapa 1: Identificação do Lead
    if (etapa1Data.leadId) completed.push(1);

    // Etapa 2: Seleção do Tipo de Assessoria
    if (etapa2Data.tipoOS) completed.push(2);

    // Etapa 3: Follow-up 1
    if (etapa3Data.motivoProcura && etapa3Data.idadeEdificacao) completed.push(3);

    // Etapa 4: Memorial/Escopo
    if (etapa4Data.descricaoServico && etapa4Data.escopo) completed.push(4);

    // Etapa 5: Precificação
    if (etapa5Data.valorBase) completed.push(5);

    // Etapa 6: Gerar Proposta
    if (etapa6Data.propostaGerada) completed.push(6);

    // Etapa 7: Agendar Apresentação
    if (etapa7Data.dataAgendamento) completed.push(7);

    // Etapa 8: Realizar Apresentação
    if (etapa8Data.apresentacaoRealizada) completed.push(8);

    // Etapa 9: Follow-up 3
    if (etapa9Data.interesseCliente) completed.push(9);

    // Etapa 10: Gerar Contrato
    if (etapa10Data.contratoFile) completed.push(10);

    // Etapa 11: Contrato Assinado
    if (etapa11Data.contratoAssinado) completed.push(11);

    // Nota: Etapa 12 (Ativar Contrato) será completada ao finalizar

    return completed;
  }, [
    etapa1Data, etapa2Data, etapa3Data, etapa4Data, etapa5Data, etapa6Data,
    etapa7Data, etapa8Data, etapa9Data, etapa10Data, etapa11Data,
  ]);

  // Handlers para navegação
  const handleStepClick = (stepId: number) => {
    // Só permite voltar para etapas concluídas ou a etapa atual
    if (stepId <= currentStep) {
      // Se está navegando para uma etapa anterior, salva a posição atual
      if (stepId < currentStep && !isHistoricalNavigation) {
        setLastActiveStep(currentStep);
        setIsHistoricalNavigation(true);
      }

      // Se está voltando para a última etapa ativa, limpa o modo histórico
      if (stepId === lastActiveStep) {
        setIsHistoricalNavigation(false);
        setLastActiveStep(null);
      }

      setCurrentStep(stepId);
    }
  };

  // Handler para retornar à etapa ativa
  const handleReturnToActive = () => {
    if (lastActiveStep) {
      setCurrentStep(lastActiveStep);
      setIsHistoricalNavigation(false);
      setLastActiveStep(null);
      toast.success('Voltou para onde estava!', { icon: '🎯' });
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    setEtapa1Data({ leadId });
  };

  const handleSaveNewLead = () => {
    console.log('Salvando novo lead:', formData);
    setShowNewLeadDialog(false);
    setSelectedLeadId('NEW');
    setEtapa1Data({ leadId: 'NEW' });
  };

  // Handler para finalizar etapa
  const handleConcluirEtapa = () => {
    const osDestino = tipoOS === 'OS-05' ? 'OS-12' : 'OS-11';
    alert(`Contrato ativado com sucesso! Criando ${osDestino}...`);
    if (onBack) onBack();
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
                  data={etapa5Data}
                  onDataChange={setEtapa5Data}
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
                />
              )}

              {/* ETAPA 8: Realizar Visita (Apresentação) */}
              {currentStep === 8 && (
                <StepRealizarApresentacao
                  data={etapa8Data}
                  onDataChange={setEtapa8Data}
                />
              )}

              {/* ETAPA 9: Follow-up 3 (Pós-Apresentação) */}
              {currentStep === 9 && (
                <StepFollowup3
                  data={etapa9Data}
                  onDataChange={setEtapa9Data}
                />
              )}

              {/* ETAPA 10: Gerar Contrato (Upload) */}
              {currentStep === 10 && (
                <StepGerarContrato
                  data={etapa10Data}
                  onDataChange={setEtapa10Data}
                />
              )}

              {/* ETAPA 11: Contrato Assinado */}
              {currentStep === 11 && (
                <StepContratoAssinado
                  data={etapa11Data}
                  onDataChange={setEtapa11Data}
                />
              )}

              {/* ETAPA 12: Ativar Contrato */}
              {currentStep === 12 && (
                <StepAtivarContratoAssessoria
                  tipoOS={tipoOS}
                  onAtivarContrato={handleConcluirEtapa}
                />
              )}

            </CardContent>

            {/* Footer com botões de navegação */}
            <WorkflowFooter
              currentStep={currentStep}
              totalSteps={steps.length}
              onPrevStep={handlePrevStep}
              onNextStep={currentStep === steps.length ? handleConcluirEtapa : handleNextStep}
              onSaveDraft={() => console.log('Salvar rascunho - Assessoria')}
              prevButtonText="Anterior"
              nextButtonText="Próxima Etapa"
              finalButtonText="Ativar Contrato"
              readOnlyMode={isHistoricalNavigation}
              onReturnToActive={handleReturnToActive}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
