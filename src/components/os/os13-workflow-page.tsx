import { useState, useMemo, useRef } from 'react';
import { Card } from '../ui/card';
import { toast } from '../../lib/utils/safe-toast';
import { WorkflowStepper, WorkflowStep } from './workflow-stepper';
import { WorkflowFooter } from './workflow-footer';
import { StepIdentificacaoLeadCompleto, type StepIdentificacaoLeadCompletoHandle } from './steps/shared/step-identificacao-lead-completo';
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
import { ChevronLeft, Info } from 'lucide-react';
import { useWorkflowState } from '../../lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '../../lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '../../lib/hooks/use-workflow-completion';

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
  // Estados para StepIdentificacaoLeadCompleto
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [showLeadCombobox, setShowLeadCombobox] = useState(false);
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
  const stepLeadRef = useRef<StepIdentificacaoLeadCompletoHandle>(null);

  // Estado do formulário de dados do lead
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

  // Handler customizado para validação da Etapa 1
  const handleNextStep = async () => {
    console.log('🔍 handleNextStep chamado', { currentStep, selectedLeadId, formDataByStep1: formDataByStep[1] });

    // Etapa 1: Validar componente de identificação de lead
    if (currentStep === 1) {
      console.log('✅ Etapa 1 detectada, iniciando validação...');

      if (stepLeadRef.current) {
        console.log('🔍 Validando via stepLeadRef...');
        const isValid = stepLeadRef.current.validate();
        console.log('📋 Resultado da validação:', isValid);

        if (!isValid) {
          console.log('❌ Validação falhou');
          toast.error('Preencha todos os campos obrigatórios antes de continuar');
          return;
        }
        console.log('✅ Validação passou');
      }

      // Verificar se há lead selecionado
      console.log('🔍 Verificando leadId:', { selectedLeadId, savedLeadId: formDataByStep[1]?.leadId });
      if (!selectedLeadId && !formDataByStep[1]?.leadId) {
        console.log('❌ Nenhum lead selecionado');
        toast.error('Selecione ou cadastre um cliente antes de continuar');
        return;
      }
      console.log('✅ Lead verificado');

      // Salvar leadId no formData da etapa 1 se ainda não foi salvo
      if (selectedLeadId && !formDataByStep[1]?.leadId) {
        console.log('💾 Salvando leadId no state:', selectedLeadId);
        await setStepData(1, { ...formDataByStep[1], leadId: selectedLeadId });
        console.log('✅ LeadId salvo no state');
      }

      // IMPORTANTE: Salvar a etapa no banco antes de avançar
      console.log('💾 Salvando etapa 1 no banco...');
      try {
        await saveStep(1, false);
        console.log('✅ Etapa 1 salva no banco');
      } catch (error) {
        console.error('❌ Erro ao salvar etapa:', error);
        toast.error('Erro ao salvar dados. Tente novamente.');
        return;
      }
    }

    // Avançar para próxima etapa manualmente
    console.log('➡️ Avançando para próxima etapa...');
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setLastActiveStep(currentStep + 1);
      console.log('✅ Avançado para etapa:', currentStep + 1);
    }
  };

  // Função para manipular seleção de lead (compatível com o componente)
  const handleSelectLead = (leadId: string, leadData?: any) => {
    setSelectedLeadId(leadId);

    // IMPORTANTE: Salvar leadId no formDataByStep para habilitar botão Avançar
    setStepData(1, { ...formDataByStep[1], leadId });

    if (leadData) {
      setFormData(prev => ({
        ...prev,
        nome: leadData.nome_razao_social || '',
        cpfCnpj: leadData.cpf_cnpj || '',
        email: leadData.email || '',
        telefone: leadData.telefone || '',
        tipo: leadData.tipo_cliente === 'PESSOA_FISICA' ? 'fisica' : 'juridica',
        nomeResponsavel: leadData.nome_responsavel || '',
        cargoResponsavel: leadData.endereco?.cargo_responsavel || '',
        tipoEdificacao: leadData.endereco?.tipo_edificacao || '',
        qtdUnidades: leadData.endereco?.qtd_unidades || '',
        qtdBlocos: leadData.endereco?.qtd_blocos || '',
        qtdPavimentos: leadData.endereco?.qtd_pavimentos || '',
        tipoTelhado: leadData.endereco?.tipo_telhado || '',
        possuiElevador: leadData.endereco?.possui_elevador || false,
        possuiPiscina: leadData.endereco?.possui_piscina || false,
        cep: leadData.endereco?.cep || '',
        endereco: leadData.endereco?.rua || '',
        numero: leadData.endereco?.numero || '',
        complemento: leadData.endereco?.complemento || '',
        bairro: leadData.endereco?.bairro || '',
        cidade: leadData.endereco?.cidade || '',
        estado: leadData.endereco?.estado || '',
      }));
    }
  };

  const handleSaveNewLead = () => {
    setShowNewLeadDialog(false);
  };

  const etapa2Data = formDataByStep[2] || { artAnexada: '' };
  const etapa3Data = formDataByStep[3] || { relatorioAnexado: '' };
  const etapa4Data = formDataByStep[4] || { imagemAnexada: '' };
  const etapa5Data = formDataByStep[5] || { cronogramaAnexado: '' };
  const etapa6Data = formDataByStep[6] || { dataVisita: '' };
  const etapa7Data = formDataByStep[7] || { visitaRealizada: false };
  const etapa8Data = formDataByStep[8] || { histogramaAnexado: '' };
  const etapa9Data = formDataByStep[9] || { placaAnexada: '' };
  const etapa10Data = formDataByStep[10] || { os09Criada: false, os09Id: '' };
  const etapa11Data = formDataByStep[11] || { os10Criada: false, os10Id: '' };
  const etapa12Data = formDataByStep[12] || { evidenciaAnexada: '' };
  const etapa13Data = formDataByStep[13] || { diarioAnexado: '' };
  const etapa14Data = formDataByStep[14] || { decisaoSeguro: '' };
  const etapa15Data = formDataByStep[15] || { documentosAnexados: [] };
  const etapa16Data = formDataByStep[16] || { dataVisitaFinal: '' };
  const etapa17Data = formDataByStep[17] || { visitaFinalRealizada: false };

  // Setters wrappers
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
  const setEtapa12Data = (data: any) => setStepData(12, data);
  const setEtapa13Data = (data: any) => setStepData(13, data);
  const setEtapa14Data = (data: any) => setStepData(14, data);
  const setEtapa15Data = (data: any) => setStepData(15, data);
  const setEtapa16Data = (data: any) => setStepData(16, data);
  const setEtapa17Data = (data: any) => setStepData(17, data);

  /**
   * Cálculo dinâmico de etapas completadas
   */
  // Regras de completude
  const completionRules = useMemo(() => ({
    1: () => !!(formDataByStep[1]?.leadId || selectedLeadId),
    2: (data: any) => !!data.artAnexada,
    3: (data: any) => !!data.relatorioAnexado,
    4: (data: any) => !!data.imagemAnexada,
    5: (data: any) => !!data.cronogramaAnexado,
    6: (data: any) => !!data.dataVisita,
    7: (data: any) => !!data.visitaRealizada,
    8: (data: any) => !!data.histogramaAnexado,
    9: (data: any) => !!data.placaAnexada,
    10: (data: any) => !!data.os09Criada,
    11: (data: any) => !!data.os10Criada,
    12: (data: any) => !!data.evidenciaAnexada,
    13: (data: any) => !!data.diarioAnexado,
    14: (data: any) => !!data.decisaoSeguro,
    15: (data: any) => !!(data.documentosAnexados && data.documentosAnexados.length > 0),
    16: (data: any) => !!data.dataVisitaFinal,
    17: (data: any) => !!data.visitaFinalRealizada,
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
            {currentStep === 2 && <StepAnexarART data={etapa2Data} onDataChange={setEtapa2Data} readOnly={isHistoricalNavigation} />}
            {currentStep === 3 && <StepRelatorioFotografico data={etapa3Data} onDataChange={setEtapa3Data} readOnly={isHistoricalNavigation} />}
            {currentStep === 4 && <StepImagemAreas data={etapa4Data} onDataChange={setEtapa4Data} readOnly={isHistoricalNavigation} />}
            {currentStep === 5 && <StepCronogramaObra data={etapa5Data} onDataChange={setEtapa5Data} readOnly={isHistoricalNavigation} />}
            {currentStep === 6 && <StepAgendarVisitaInicial data={etapa6Data} onDataChange={setEtapa6Data} readOnly={isHistoricalNavigation} />}
            {currentStep === 7 && <StepRealizarVisitaInicial data={etapa7Data} onDataChange={setEtapa7Data} readOnly={isHistoricalNavigation} />}
            {currentStep === 8 && <StepHistograma data={etapa8Data} onDataChange={setEtapa8Data} readOnly={isHistoricalNavigation} />}
            {currentStep === 9 && <StepPlacaObra data={etapa9Data} onDataChange={setEtapa9Data} readOnly={isHistoricalNavigation} />}
            {currentStep === 10 && <StepRequisicaoCompras data={etapa10Data} onDataChange={setEtapa10Data} readOnly={isHistoricalNavigation} />}
            {currentStep === 11 && <StepRequisicaoMaoObra data={etapa11Data} onDataChange={setEtapa11Data} readOnly={isHistoricalNavigation} />}
            {currentStep === 12 && <StepEvidenciaMobilizacao data={etapa12Data} onDataChange={setEtapa12Data} readOnly={isHistoricalNavigation} />}
            {currentStep === 13 && <StepDiarioObra data={etapa13Data} onDataChange={setEtapa13Data} readOnly={isHistoricalNavigation} />}
            {currentStep === 14 && <StepSeguroObras data={etapa14Data} onDataChange={setEtapa14Data} readOnly={isHistoricalNavigation} />}
            {currentStep === 15 && <StepDocumentosSST data={etapa15Data} onDataChange={setEtapa15Data} readOnly={isHistoricalNavigation} />}
            {currentStep === 16 && <StepAgendarVisitaFinal data={etapa16Data} onDataChange={setEtapa16Data} readOnly={isHistoricalNavigation} />}
            {currentStep === 17 && <StepRealizarVisitaFinal data={etapa17Data} onDataChange={setEtapa17Data} readOnly={isHistoricalNavigation} />}
          </div>
        </Card>
      </div>

      <WorkflowFooter
        currentStep={currentStep}
        totalSteps={steps.length}
        onPrevStep={handlePrevStep}
        onNextStep={handleNextStep}
        onSaveDraft={handleSaveStep}
        readOnlyMode={isHistoricalNavigation}
        onReturnToActive={handleReturnToActive}
        isLoading={isLoadingData}
        isFormInvalid={!completedSteps.includes(currentStep)}
        invalidFormMessage="Complete todos os campos obrigatórios desta etapa antes de continuar"
      />
    </div>
  );
}
