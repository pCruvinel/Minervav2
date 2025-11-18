import React, { useState } from 'react';
import { Card } from '../ui/card';
import { toast } from '../../lib/utils/safe-toast';
import { WorkflowStepper, WorkflowStep } from './workflow-stepper';
import { WorkflowFooter } from './workflow-footer';
import { StepDadosCliente } from './steps/os13/step-dados-cliente';
import { StepAnexarART } from './steps/os13/step-anexar-art';
import { StepRelatorioFotografico } from './steps/os13/step-relatorio-fotografico';
import { StepImagemAreas } from './steps/os13/step-imagem-areas';
import { StepCronogramaObra } from './steps/os13/step-cronograma-obra';
import { StepAgendarVisitaInicial } from './steps/os13/step-agendar-visita-inicial';
import { StepRealizarVisitaInicial } from './steps/os13/step-realizar-visita-inicial';
import { StepHistograma } from './steps/os13/step-histograma';
import { StepPlacaObra } from './steps/os13/step-placa-obra';
import { StepRequisicaoCompras } from './steps/os13/step-requisicao-compras';
import { StepRequisicaoMaoObra } from './steps/os13/step-requisicao-mao-obra';
import { StepEvidenciaMobilizacao } from './steps/os13/step-evidencia-mobilizacao';
import { StepDiarioObra } from './steps/os13/step-diario-obra';
import { StepSeguroObras } from './steps/os13/step-seguro-obras';
import { StepDocumentosSST } from './steps/os13/step-documentos-sst';
import { StepAgendarVisitaFinal } from './steps/os13/step-agendar-visita-final';
import { StepRealizarVisitaFinal } from './steps/os13/step-realizar-visita-final';
import { ChevronLeft } from 'lucide-react';

const steps: WorkflowStep[] = [
  { id: 1, title: 'Dados do Cliente', short: 'Cliente', responsible: 'Comercial', status: 'active' },
  { id: 2, title: 'Anexar ART', short: 'ART', responsible: 'Engenharia', status: 'pending' },
  { id: 3, title: 'Relatório Fotográfico', short: 'Fotos', responsible: 'Engenharia', status: 'pending' },
  { id: 4, title: 'Imagem de Áreas', short: 'Áreas', responsible: 'Engenharia', status: 'pending' },
  { id: 5, title: 'Cronograma', short: 'Cronograma', responsible: 'Engenharia', status: 'pending' },
  { id: 6, title: 'Agendar Visita Inicial', short: 'Ag. Visita', responsible: 'Engenharia', status: 'pending' },
  { id: 7, title: 'Realizar Visita Inicial', short: 'Visita', responsible: 'Engenharia', status: 'pending' },
  { id: 8, title: 'Histograma', short: 'Histograma', responsible: 'Engenharia', status: 'pending' },
  { id: 9, title: 'Placa de Obra', short: 'Placa', responsible: 'Engenharia', status: 'pending' },
  { id: 10, title: 'Requisição de Compras', short: 'Compras', responsible: 'Compras', status: 'pending' },
  { id: 11, title: 'Requisição de Mão de Obra', short: 'RH', responsible: 'RH', status: 'pending' },
  { id: 12, title: 'Evidência Mobilização', short: 'Mobilização', responsible: 'Engenharia', status: 'pending' },
  { id: 13, title: 'Diário de Obra', short: 'Diário', responsible: 'Engenharia', status: 'pending' },
  { id: 14, title: 'Seguro de Obras', short: 'Seguro', responsible: 'Financeiro', status: 'pending' },
  { id: 15, title: 'Documentos SST', short: 'SST', responsible: 'Segurança', status: 'pending' },
  { id: 16, title: 'Agendar Visita Final', short: 'Ag. Final', responsible: 'Engenharia', status: 'pending' },
  { id: 17, title: 'Realizar Visita Final', short: 'Visita Final', responsible: 'Engenharia', status: 'pending' },
];

interface OS13WorkflowPageProps {
  onBack?: () => void;
  osId?: string;
}

export function OS13WorkflowPage({ onBack, osId }: OS13WorkflowPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [lastActiveStep, setLastActiveStep] = useState<number | null>(null);
  const [isHistoricalNavigation, setIsHistoricalNavigation] = useState(false);

  // Estados de cada etapa
  const [etapa1Data, setEtapa1Data] = useState({
    cliente: '',
    tipoEdificacao: '',
    qtdPavimentos: '',
    tipoTelhado: '',
    possuiElevador: false,
    possuiPiscina: false,
    cnpj: '',
    cep: '',
    estado: '',
    cidade: '',
    endereco: '',
    bairro: '',
    responsavel: '',
    cargo: '',
    telefone: '',
    email: '',
  });

  const [etapa2Data, setEtapa2Data] = useState({ artAnexada: '' });
  const [etapa3Data, setEtapa3Data] = useState({ relatorioAnexado: '' });
  const [etapa4Data, setEtapa4Data] = useState({ imagemAnexada: '' });
  const [etapa5Data, setEtapa5Data] = useState({ cronogramaAnexado: '' });
  const [etapa6Data, setEtapa6Data] = useState({ dataVisita: '' });
  const [etapa7Data, setEtapa7Data] = useState({ visitaRealizada: false });
  const [etapa8Data, setEtapa8Data] = useState({ histogramaAnexado: '' });
  const [etapa9Data, setEtapa9Data] = useState({ placaAnexada: '' });
  const [etapa10Data, setEtapa10Data] = useState({ os09Criada: false, os09Id: '' });
  const [etapa11Data, setEtapa11Data] = useState({ os10Criada: false, os10Id: '' });
  const [etapa12Data, setEtapa12Data] = useState({ evidenciaAnexada: '' });
  const [etapa13Data, setEtapa13Data] = useState({ diarioAnexado: '' });
  const [etapa14Data, setEtapa14Data] = useState({ decisaoSeguro: '' });
  const [etapa15Data, setEtapa15Data] = useState({ documentosAnexados: [] as string[] });
  const [etapa16Data, setEtapa16Data] = useState({ dataVisitaFinal: '' });
  const [etapa17Data, setEtapa17Data] = useState({ visitaFinalRealizada: false });

  const handleNext = () => {
    if (currentStep < steps.length) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setLastActiveStep(currentStep + 1);
      setCurrentStep(currentStep + 1);
      setIsHistoricalNavigation(false);
      toast.success(`Avançado para etapa ${currentStep + 1}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      toast.info(`Voltou para etapa ${currentStep - 1}`);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (completedSteps.includes(stepId) || stepId === currentStep) {
      setIsHistoricalNavigation(stepId < (lastActiveStep || currentStep));
      setCurrentStep(stepId);
      if (stepId < (lastActiveStep || currentStep)) {
        toast.info(`📜 Visualizando etapa ${stepId} (histórico)`);
      }
    }
  };

  const handleReturnToActive = () => {
    if (lastActiveStep) {
      setCurrentStep(lastActiveStep);
      setIsHistoricalNavigation(false);
      toast.success(`Retornado à etapa ativa ${lastActiveStep}`);
    }
  };

  const handleSaveStep = async () => {
    try {
      toast.success('Dados salvos com sucesso!');
      console.log('Salvando etapa', currentStep);
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
              <h1 className="text-2xl">OS-13: Start de Contrato de Obra</h1>
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
            {currentStep === 1 && <StepDadosCliente data={etapa1Data} onDataChange={setEtapa1Data} />}
            {currentStep === 2 && <StepAnexarART data={etapa2Data} onDataChange={setEtapa2Data} />}
            {currentStep === 3 && <StepRelatorioFotografico data={etapa3Data} onDataChange={setEtapa3Data} />}
            {currentStep === 4 && <StepImagemAreas data={etapa4Data} onDataChange={setEtapa4Data} />}
            {currentStep === 5 && <StepCronogramaObra data={etapa5Data} onDataChange={setEtapa5Data} />}
            {currentStep === 6 && <StepAgendarVisitaInicial data={etapa6Data} onDataChange={setEtapa6Data} />}
            {currentStep === 7 && <StepRealizarVisitaInicial data={etapa7Data} onDataChange={setEtapa7Data} />}
            {currentStep === 8 && <StepHistograma data={etapa8Data} onDataChange={setEtapa8Data} />}
            {currentStep === 9 && <StepPlacaObra data={etapa9Data} onDataChange={setEtapa9Data} />}
            {currentStep === 10 && <StepRequisicaoCompras data={etapa10Data} onDataChange={setEtapa10Data} />}
            {currentStep === 11 && <StepRequisicaoMaoObra data={etapa11Data} onDataChange={setEtapa11Data} />}
            {currentStep === 12 && <StepEvidenciaMobilizacao data={etapa12Data} onDataChange={setEtapa12Data} />}
            {currentStep === 13 && <StepDiarioObra data={etapa13Data} onDataChange={setEtapa13Data} />}
            {currentStep === 14 && <StepSeguroObras data={etapa14Data} onDataChange={setEtapa14Data} />}
            {currentStep === 15 && <StepDocumentosSST data={etapa15Data} onDataChange={setEtapa15Data} />}
            {currentStep === 16 && <StepAgendarVisitaFinal data={etapa16Data} onDataChange={setEtapa16Data} />}
            {currentStep === 17 && <StepRealizarVisitaFinal data={etapa17Data} onDataChange={setEtapa17Data} />}
          </div>
        </Card>
      </div>

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
