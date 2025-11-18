import React, { useState, useEffect } from 'react';
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
import { ChevronLeft } from 'lucide-react';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [lastActiveStep, setLastActiveStep] = useState<number | null>(null);
  const [isHistoricalNavigation, setIsHistoricalNavigation] = useState(false);

  // Estados de cada etapa
  const [etapa1Data, setEtapa1Data] = useState({
    nomeCompleto: '',
    contatoWhatsApp: '',
    condominio: '',
    cargo: '',
    bloco: '',
    unidadeAutonoma: '',
    tipoArea: '', // 'unidade_autonoma' | 'area_comum'
    unidadesVistoriar: '',
    contatoUnidades: '',
    tipoDocumento: '', // 'parecer' | 'escopo'
    areaVistoriada: '',
    detalhesSolicitacao: '',
    tempoSituacao: '',
    primeiraVisita: '',
    fotosAnexadas: [] as string[],
  });

  const [etapa2Data, setEtapa2Data] = useState({
    clienteId: '',
  });

  const [etapa3Data, setEtapa3Data] = useState({
    dataAgendamento: '',
  });

  const [etapa4Data, setEtapa4Data] = useState({
    visitaRealizada: false,
    dataRealizacao: '',
  });

  const [etapa5Data, setEtapa5Data] = useState({
    pontuacaoEngenheiro: '',
    pontuacaoMorador: '',
    tipoDocumento: '',
    areaVistoriada: '',
    manifestacaoPatologica: '',
    recomendacoesPrevias: '',
    gravidade: '',
    origemNBR: '',
    observacoesGerais: '',
    fotosLocal: [] as string[],
    resultadoVisita: '',
    justificativa: '',
  });

  const [etapa6Data, setEtapa6Data] = useState({
    documentoGerado: false,
    documentoUrl: '',
  });

  const [etapa7Data, setEtapa7Data] = useState({
    documentoEnviado: false,
    dataEnvio: '',
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
        etapa3Data,
        etapa4Data,
        etapa5Data,
        etapa6Data,
        etapa7Data,
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
            {/* ETAPA 1: Identificação do Solicitante */}
            {currentStep === 1 && (
              <StepIdentificacaoSolicitante
                data={etapa1Data}
                onDataChange={setEtapa1Data}
              />
            )}

            {/* ETAPA 2: Atribuir Cliente */}
            {currentStep === 2 && (
              <StepAtribuirCliente
                data={etapa2Data}
                onDataChange={setEtapa2Data}
              />
            )}

            {/* ETAPA 3: Agendar Visita */}
            {currentStep === 3 && (
              <StepAgendarVisita
                data={etapa3Data}
                onDataChange={setEtapa3Data}
              />
            )}

            {/* ETAPA 4: Realizar Visita */}
            {currentStep === 4 && (
              <StepRealizarVisita
                data={etapa4Data}
                onDataChange={setEtapa4Data}
              />
            )}

            {/* ETAPA 5: Formulário Pós-Visita */}
            {currentStep === 5 && (
              <StepFormularioPosVisita
                data={etapa5Data}
                onDataChange={setEtapa5Data}
              />
            )}

            {/* ETAPA 6: Gerar Documento */}
            {currentStep === 6 && (
              <StepGerarDocumento
                data={etapa6Data}
                onDataChange={setEtapa6Data}
              />
            )}

            {/* ETAPA 7: Enviar Documento */}
            {currentStep === 7 && (
              <StepEnviarDocumento
                data={etapa7Data}
                onDataChange={setEtapa7Data}
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
