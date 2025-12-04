import { useMemo, useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from '@/lib/utils/safe-toast';
import { WorkflowStepper, WorkflowStep } from '@/components/os/shared/components/workflow-stepper';
import { WorkflowFooter } from '@/components/os/shared/components/workflow-footer';
import {
  CadastrarClienteObra,
  type CadastrarClienteObraHandle,
  StepAnexarART,
  StepRelatorioFotografico,
  StepImagemAreas,
  StepCronogramaObra,
  StepAgendarVisitaInicial,
  StepRealizarVisitaInicial,
  StepHistograma,
  StepPlacaObra,
  StepRequisicaoCompras,
  StepRequisicaoMaoObra,
  StepEvidenciaMobilizacao,
  StepDiarioObra,
  StepSeguroObras,
  StepDocumentosSST,
  StepAgendarVisitaFinal,
  StepRealizarVisitaFinal
} from '@/components/os/obras/os-13/steps';
import { cadastrarClienteObraDefaults, type CadastrarClienteObraData } from '@/lib/validations/cadastrar-cliente-obra-schema';
import { ChevronLeft, Info } from 'lucide-react';
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '@/lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';

export const steps: WorkflowStep[] = [
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
  parentOSId?: string;
}

export function OS13WorkflowPage({ onBack, osId: propOsId, parentOSId }: OS13WorkflowPageProps) {
  const stepLeadRef = useRef<CadastrarClienteObraHandle>(null);
  const stepAgendarVisitaInicialRef = useRef<unknown>(null);
  const stepAgendarVisitaFinalRef = useRef<unknown>(null);
  const [internalOsId, setInternalOsId] = useState<string | undefined>(propOsId);

  // Atualizar internalOsId se prop mudar
  useEffect(() => {
    if (propOsId) setInternalOsId(propOsId);
  }, [propOsId]);

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
    osId: internalOsId,
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
    console.log('🔍 handleNextStep chamado', { currentStep, formDataByStep1: formDataByStep[1] });

    // Etapa 1: Validar e salvar componente CadastrarClienteObra
    if (currentStep === 1) {
      console.log('✅ Etapa 1 detectada, iniciando validação e salvamento...');

      if (stepLeadRef.current) {
        // Validar
        console.log('🔍 Validando via stepLeadRef...');
        const isValid = stepLeadRef.current.validate();
        console.log('📋 Resultado da validação:', isValid);

        if (!isValid) {
          console.log('❌ Validação falhou');
          toast.error('Preencha todos os campos obrigatórios antes de continuar');
          return;
        }
        console.log('✅ Validação passou');

        // Salvar dados (cliente, documentos, centro de custo, metadata)
        console.log('💾 Salvando dados da obra...');
        const savedOsId = await stepLeadRef.current.saveData();

        if (!savedOsId) {
          console.log('❌ Salvamento falhou');
          return;
        }
        console.log('✅ Dados salvos com sucesso. ID:', savedOsId);

        // Se foi criado um novo ID, atualizar estado
        if (savedOsId && savedOsId !== internalOsId) {
          setInternalOsId(savedOsId);
          // Pequeno delay para garantir que o estado atualizou antes de salvar a etapa
          await new Promise(resolve => window.setTimeout(resolve, 100));
        }
      }

      // Salvar a etapa no banco (marcar como concluída)
      console.log('💾 Salvando etapa 1 no banco...');
      try {
        // Se tivermos um novo ID, vamos atualizar a etapa diretamente para garantir
        if (stepLeadRef.current && typeof stepLeadRef.current.saveData === 'function') {
          // Já salvamos os dados. Agora só precisamos marcar a etapa como completa.
          // O saveStep do hook pode não funcionar se o osId for undefined no render atual.
        }

        await saveStep(1, true); // true = mark as complete
        console.log('✅ Etapa 1 salva no banco');
      } catch (error) {
        console.error('❌ Erro ao salvar etapa:', error);
        toast.error('Erro ao salvar dados. Tente novamente.');
        return;
      }
    } else {
      // ✅ FIX: Salvar etapas 2-17
      console.log(`💾 Salvando etapa ${currentStep} no banco...`);
      try {
        await saveStep(currentStep, true);
        console.log(`✅ Etapa ${currentStep} salva no banco`);
      } catch (error) {
        console.error(`❌ Erro ao salvar etapa ${currentStep}:`, error);
        toast.error('Erro ao salvar dados. Tente novamente.');
        return; // Não avançar se falhar
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

  // Etapa 1: Dados do Cliente (novo componente CadastrarClienteObra)
  const etapa1Data: CadastrarClienteObraData = formDataByStep[1] || cadastrarClienteObraDefaults;
  const setEtapa1Data = (data: CadastrarClienteObraData) => setStepData(1, data);

  const etapa2Data = formDataByStep[2] || { arquivos: [] };
  const etapa3Data = formDataByStep[3] || { relatorioAnexado: '' };
  const etapa4Data = formDataByStep[4] || { imagemAnexada: '' };
  const etapa5Data = formDataByStep[5] || { cronogramaAnexado: '' };
  const etapa6Data = formDataByStep[6] || { dataVisita: '', agendamentoId: '' };
  const etapa7Data = formDataByStep[7] || { visitaRealizada: false };
  const etapa8Data = formDataByStep[8] || { histogramaAnexado: '' };
  const etapa9Data = formDataByStep[9] || { placaAnexada: '' };
  const etapa10Data = formDataByStep[10] || { os09Criada: false, os09Id: '' };
  const etapa11Data = formDataByStep[11] || { os10Criada: false, os10Id: '' };
  const etapa12Data = formDataByStep[12] || { evidenciaAnexada: '' };
  const etapa13Data = formDataByStep[13] || { diarioAnexado: '' };
  const etapa14Data = formDataByStep[14] || { decisaoSeguro: '' };
  const etapa15Data = formDataByStep[15] || { arquivos: [] };
  const etapa16Data = formDataByStep[16] || { dataVisitaFinal: '', agendamentoId: '' };
  const etapa17Data = formDataByStep[17] || { visitaFinalRealizada: false };

  // Setters wrappers
  const setEtapa2Data = (data: unknown) => setStepData(2, data);
  const setEtapa3Data = (data: unknown) => setStepData(3, data);
  const setEtapa4Data = (data: unknown) => setStepData(4, data);
  const setEtapa5Data = (data: unknown) => setStepData(5, data);
  const setEtapa6Data = (data: unknown) => setStepData(6, data);
  const setEtapa7Data = (data: unknown) => setStepData(7, data);
  const setEtapa8Data = (data: unknown) => setStepData(8, data);
  const setEtapa9Data = (data: unknown) => setStepData(9, data);
  const setEtapa10Data = (data: unknown) => setStepData(10, data);
  const setEtapa11Data = (data: unknown) => setStepData(11, data);
  const setEtapa12Data = (data: unknown) => setStepData(12, data);
  const setEtapa13Data = (data: unknown) => setStepData(13, data);
  const setEtapa14Data = (data: unknown) => setStepData(14, data);
  const setEtapa15Data = (data: unknown) => setStepData(15, data);
  const setEtapa16Data = (data: unknown) => setStepData(16, data);
  const setEtapa17Data = (data: unknown) => setStepData(17, data);

  /**
   * Cálculo dinâmico de etapas completadas
   */
  // Regras de completude
  const completionRules = useMemo(() => ({
    1: () => true, // Validação detalhada é feita no handleNextStep ao clicar em Avançar
    2: (data: Record<string, any>) => !!(data.arquivos && data.arquivos.length > 0),
    3: (data: Record<string, any>) => !!data.relatorioAnexado,
    4: (data: Record<string, any>) => !!data.imagemAnexada,
    5: (data: Record<string, any>) => !!data.cronogramaAnexado,
    6: (data: Record<string, any>) => !!(data.agendamentoId || data.dataVisita),
    7: (data: Record<string, any>) => !!data.visitaRealizada,
    8: (data: Record<string, any>) => !!data.histogramaAnexado,
    9: (data: Record<string, any>) => !!data.placaAnexada,
    10: (data: Record<string, any>) => !!(data.os09Criada && data.os09Id),
    11: (data: Record<string, any>) => !!(data.os10Criada && data.os10Id),
    12: (data: Record<string, any>) => !!data.evidenciaAnexada,
    13: (data: Record<string, any>) => !!data.diarioAnexado,
    14: (data: Record<string, any>) => !!data.decisaoSeguro,
    15: (data: Record<string, any>) => !!(data.arquivos && data.arquivos.length > 0),
    16: (data: Record<string, any>) => !!(data.agendamentoId || data.dataVisitaFinal),
    17: (data: Record<string, any>) => !!data.visitaFinalRealizada,
  }), [formDataByStep]);

  const { completedSteps } = useWorkflowCompletion({
    currentStep,
    formDataByStep,
    completionRules,
    completedStepsFromHook
  });

  // =====================================================
  // Cálculo de Validação - Bloqueio de Progresso
  // =====================================================

  const isCurrentStepInvalid = useMemo(() => {
    // Não validar em modo histórico (read-only)
    if (isHistoricalNavigation) return false;

    // Switch por etapa para validação específica
    switch (currentStep) {
      case 6: // Agendar Visita Inicial - opcional
        return false;
      case 16: // Agendar Visita Final - opcional
        return false;
    }

    // Para outras etapas, usar verificação de completedSteps
    return !completedSteps.includes(currentStep);
  }, [currentStep, isHistoricalNavigation, completedSteps]);

  const handleSaveStep = async () => {
    try {
      await saveStep(currentStep, true);
      toast.success('Dados salvos com sucesso!');
    } catch {
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
              <h1 className="text-2xl">OS-13: Start de Contrato de Obra</h1>
              {internalOsId && <p className="text-muted-foreground">OS #{internalOsId}</p>}
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
            {currentStep === 1 && (
              <CadastrarClienteObra
                ref={stepLeadRef}
                data={etapa1Data}
                onDataChange={setEtapa1Data}
                readOnly={isHistoricalNavigation}
                osId={internalOsId || ''}
                parentOSId={parentOSId}
              />
            )}
            {currentStep === 2 && <StepAnexarART data={etapa2Data} onDataChange={setEtapa2Data} readOnly={isHistoricalNavigation} />}
            {currentStep === 3 && <StepRelatorioFotografico data={etapa3Data} onDataChange={setEtapa3Data} readOnly={isHistoricalNavigation} osId={internalOsId} />}
            {currentStep === 4 && <StepImagemAreas data={etapa4Data} onDataChange={setEtapa4Data} readOnly={isHistoricalNavigation} osId={internalOsId} />}
            {currentStep === 5 && <StepCronogramaObra data={etapa5Data} onDataChange={setEtapa5Data} readOnly={isHistoricalNavigation} osId={internalOsId} />}
            {currentStep === 6 && internalOsId && <StepAgendarVisitaInicial ref={stepAgendarVisitaInicialRef} osId={internalOsId} data={etapa6Data} onDataChange={setEtapa6Data} readOnly={isHistoricalNavigation} />}
            {currentStep === 7 && <StepRealizarVisitaInicial data={etapa7Data} onDataChange={setEtapa7Data} readOnly={isHistoricalNavigation} />}
            {currentStep === 8 && <StepHistograma data={etapa8Data} onDataChange={setEtapa8Data} readOnly={isHistoricalNavigation} osId={internalOsId} />}
            {currentStep === 9 && <StepPlacaObra data={etapa9Data} onDataChange={setEtapa9Data} readOnly={isHistoricalNavigation} osId={internalOsId} />}
            {currentStep === 10 && <StepRequisicaoCompras data={etapa10Data} onDataChange={setEtapa10Data} readOnly={isHistoricalNavigation} parentOSId={internalOsId} clienteId={etapa1Data?.clienteId} ccId={etapa1Data?.centroCusto} />}
            {currentStep === 11 && <StepRequisicaoMaoObra data={etapa11Data} onDataChange={setEtapa11Data} readOnly={isHistoricalNavigation} parentOSId={internalOsId} clienteId={etapa1Data?.clienteId} ccId={etapa1Data?.centroCusto} />}
            {currentStep === 12 && <StepEvidenciaMobilizacao data={etapa12Data} onDataChange={setEtapa12Data} readOnly={isHistoricalNavigation} osId={internalOsId} />}
            {currentStep === 13 && <StepDiarioObra data={etapa13Data} onDataChange={setEtapa13Data} readOnly={isHistoricalNavigation} osId={internalOsId} />}
            {currentStep === 14 && <StepSeguroObras data={etapa14Data} onDataChange={setEtapa14Data} readOnly={isHistoricalNavigation} />}
            {currentStep === 15 && <StepDocumentosSST data={etapa15Data} onDataChange={setEtapa15Data} readOnly={isHistoricalNavigation} />}
            {currentStep === 16 && internalOsId && <StepAgendarVisitaFinal ref={stepAgendarVisitaFinalRef} osId={internalOsId} data={etapa16Data} onDataChange={setEtapa16Data} readOnly={isHistoricalNavigation} />}
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
        isFormInvalid={isCurrentStepInvalid}
        invalidFormMessage={currentStep === 6 || currentStep === 16 ? "Por favor, selecione um horário no calendário para continuar" : "Complete todos os campos obrigatórios desta etapa antes de continuar"}
      />
    </div>
  );
}
