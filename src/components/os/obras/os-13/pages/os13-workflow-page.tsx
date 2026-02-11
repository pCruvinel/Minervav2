import { useMemo, useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/utils/safe-toast';
import { WorkflowStepper } from '@/components/os/shared/components/workflow-stepper';
import { WorkflowFooter } from '@/components/os/shared/components/workflow-footer';
import { FeedbackTransferencia } from '@/components/os/shared/components/feedback-transferencia';
import { StepReadOnlyWithAdendos } from '@/components/os/shared/components/step-readonly-with-adendos';
import { steps } from './constants';
import {
  CadastrarClienteObra,
  type CadastrarClienteObraHandle,
  StepAnexarART,
  StepRelatorioFotografico,
  StepImagemAreas,
  StepCronogramaObra,
  StepAgendarVisitaInicial,
  type StepAgendarVisitaInicialHandle,
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
  type StepAgendarVisitaFinalHandle,
  StepRealizarVisitaFinal
} from '@/components/os/obras/os-13/steps';
import { cadastrarClienteObraDefaults, type CadastrarClienteObraData } from '@/lib/validations/cadastrar-cliente-obra-schema';
import { ChevronLeft } from 'lucide-react';
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '@/lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
import { useAuth } from '@/lib/contexts/auth-context';
import { useTransferenciaSetor } from '@/lib/hooks/use-transferencia-setor';
import { TransferenciaInfo } from '@/types/os-setor-config';
import { logger } from '@/lib/utils/logger';
import { supabase } from '@/lib/supabase-client';

// Sistema de Aprovação
import { AprovacaoModal } from '@/components/os/shared/components/aprovacao-modal';
import { useAprovacaoEtapa } from '@/lib/hooks/use-aprovacao-etapa';


interface OS13WorkflowPageProps {
  onBack?: () => void;
  osId?: string;
  initialStep?: number;
  parentOSId?: string;
  clienteId?: string;
}

export function OS13WorkflowPage({ onBack, osId: propOsId, initialStep, parentOSId, clienteId }: OS13WorkflowPageProps) {
  const stepLeadRef = useRef<CadastrarClienteObraHandle>(null);
  const stepAgendarVisitaInicialRef = useRef<StepAgendarVisitaInicialHandle>(null);
  const stepAgendarVisitaFinalRef = useRef<StepAgendarVisitaFinalHandle>(null);
  const [internalOsId, setInternalOsId] = useState<string | undefined>(propOsId);

  // Estado para feedback de transferência de setor
  const [isTransferenciaModalOpen, setIsTransferenciaModalOpen] = useState(false);
  const [transferenciaInfo, setTransferenciaInfo] = useState<TransferenciaInfo | null>(null);

  // Estado para modal de aprovação
  const [isAprovacaoModalOpen, setIsAprovacaoModalOpen] = useState(false);
  const [etapaNomeParaAprovacao, setEtapaNomeParaAprovacao] = useState('');

  // Hook de transferência
  const { executarTransferencia } = useTransferenciaSetor();

  // Hook de autenticação removido - currentUser não é usado diretamente aqui
  useAuth();

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
    totalSteps: steps.length,
    initialStep: initialStep || 1
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

  // Hook de aprovação de etapa (deve vir depois de currentStep ser definido)
  const { aprovacaoInfo } = useAprovacaoEtapa(internalOsId, currentStep);

  // Handler customizado para validação da Etapa 1
  const handleNextStep = async () => {
    console.log('🔍 handleNextStep chamado', { currentStep, formDataByStep1: formDataByStep[1] });

    // Etapa 1: Validar e salvar componente CadastrarClienteObra
    let savedOsId: string | null = null;
    let savedData: CadastrarClienteObraData | null = null;

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
        const saveResult = await stepLeadRef.current.saveData();

        if (!saveResult) {
          console.log('❌ Salvamento falhou');
          return;
        }

        const { osId, data } = saveResult;
        savedOsId = osId;
        savedData = data;

        console.log('✅ Dados salvos com sucesso. ID:', savedOsId);

        // Se foi criado um novo ID, atualizar estado
        if (savedOsId && savedOsId !== internalOsId) {
          setInternalOsId(savedOsId);
          // Pequeno delay para garantir que o estado atualizou antes de salvar a etapa
          await new Promise(resolve => window.setTimeout(resolve, 100));
        }

        // ATUALIZAR STATE LOCAL IMEDIATAMENTE COM DADOS COMPLETOS
        // Isso garante que se o usuário navegar, o formDataByStep[1] estará atualizado
        setEtapa1Data(savedData);
      } else {
        // Fallback: se ref não existe (histórico), usar dados locais
        savedOsId = internalOsId!;
      }

      // Salvar a etapa no banco (marcar como concluída)
      // ✅ FIX: Usar dados retornados do salvamento, que incluem CC gerado e IDs
      logger.log('💾 Marcando etapa 1 como concluída no banco...');
      try {
        // Buscar a etapa 1 da OS recém-criada
        const { data: etapa1, error: fetchError } = await supabase
          .from('os_etapas')
          .select('id')
          .eq('os_id', savedOsId)
          .eq('ordem', 1)
          .single();

        if (fetchError || !etapa1) {
          logger.error('❌ Etapa 1 não encontrada:', fetchError);
          throw new Error('Etapa 1 não encontrada');
        }



        // Marcar como concluída
        const { error: updateError } = await supabase
          .from('os_etapas')
          .update({
            status: 'concluida',
            data_conclusao: new Date().toISOString(),
            dados_etapa: savedData || formDataByStep[1] || {}
          })
          .eq('id', etapa1.id);

        if (updateError) {
          logger.error('❌ Erro ao atualizar etapa 1:', updateError);
          throw updateError;
        }

        logger.log('✅ Etapa 1 marcada como concluída');
      } catch (error) {
        logger.error('❌ Erro ao salvar etapa:', error);
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

    // ============================================================================
    // VERIFICAÇÃO DE APROVAÇÃO (Etapas 3, 5, 8, 12, 15 requerem aprovação)
    // ============================================================================
    if (aprovacaoInfo?.requerAprovacao && aprovacaoInfo.statusAprovacao !== 'aprovada') {
      const etapaNome = steps.find(s => s.id === currentStep)?.title || `Etapa ${currentStep}`;

      if (aprovacaoInfo.statusAprovacao === 'pendente' || aprovacaoInfo.statusAprovacao === 'rejeitada') {
        setEtapaNomeParaAprovacao(etapaNome);
        setIsAprovacaoModalOpen(true);
        return;
      }

      if (aprovacaoInfo.statusAprovacao === 'solicitada') {
        toast.info('Aguardando aprovação do coordenador.');
        return;
      }
    }

    // Avançar para próxima etapa manualmente
    logger.log('➡️ Avançando para próxima etapa...');
    if (currentStep < steps.length) {
      const nextStep = currentStep + 1;

      // Verificar transferência de setor (OS-13 tem múltiplos handoffs)
      if (internalOsId) {
        const resultado = await executarTransferencia({
          osId: internalOsId,
          osType: 'OS-13',
          etapaAtual: currentStep,
          proximaEtapa: nextStep,
          clienteNome: (etapa1Data?.clienteNome as string) || 'Cliente',
          codigoOS: undefined
        });

        if (resultado.success && resultado.transferencia) {
          setTransferenciaInfo(resultado.transferencia);
          setIsTransferenciaModalOpen(true);
          return;
        }
      }

      setCurrentStep(nextStep);
      setLastActiveStep(nextStep);
      logger.log('✅ Avançado para etapa:', nextStep);
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
    2: (data: Record<string, unknown>) => !!(data.arquivos && Array.isArray(data.arquivos) && data.arquivos.length > 0),
    3: (data: Record<string, unknown>) => !!data.relatorioAnexado,
    4: (data: Record<string, unknown>) => !!data.imagemAnexada,
    5: (data: Record<string, unknown>) => !!data.cronogramaAnexado,
    6: (data: Record<string, unknown>) => !!(data.agendamentoId || data.dataVisita),
    7: (data: Record<string, unknown>) => !!data.visitaRealizada,
    8: (data: Record<string, unknown>) => !!data.histogramaAnexado,
    9: (data: Record<string, unknown>) => !!data.placaAnexada,
    10: (data: Record<string, unknown>) => !!(data.os09Criada && data.os09Id),
    11: (data: Record<string, unknown>) => !!(data.os10Criada && data.os10Id),
    12: (data: Record<string, unknown>) => !!data.evidenciaAnexada,
    13: (data: Record<string, unknown>) => !!data.diarioAnexado,
    14: (data: Record<string, unknown>) => !!data.decisaoSeguro,
    15: (data: Record<string, unknown>) => !!(data.arquivos && Array.isArray(data.arquivos) && data.arquivos.length > 0),
    16: (data: Record<string, unknown>) => !!(data.agendamentoId || data.dataVisitaFinal),
    17: (data: Record<string, unknown>) => !!data.visitaFinalRealizada,
  }), []);

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

    // Etapas com validação imperativa (via ref) — nunca bloquear o botão
    // A validação real acontece dentro de handleNextStep
    switch (currentStep) {
      case 1: // Dados do Cliente - validação via stepLeadRef
        return false;
      case 6: // Agendar Visita Inicial - agendamento opcional
        return false;
      case 16: // Agendar Visita Final - agendamento opcional
        return false;
    }

    // Para etapas com completionRules, verificar se os dados satisfazem a regra
    const rules = completionRules as Record<number, ((data: Record<string, unknown>) => boolean) | undefined>;
    const checkRule = rules[currentStep];
    if (checkRule) {
      const stepData = formDataByStep[currentStep];
      if (stepData && typeof checkRule === 'function') {
        return !checkRule(stepData);
      }
    }

    // Fallback: verificar se já está em completedSteps
    return !completedSteps.includes(currentStep);
  }, [currentStep, isHistoricalNavigation, completedSteps, formDataByStep, completionRules]);

  const currentStepInfo = steps.find(s => s.id === currentStep);
  const isReadOnly = isHistoricalNavigation;

  const handleSaveStep = async () => {
    try {
      await saveStep(currentStep, true);
      toast.success('Dados salvos com sucesso!');
    } catch {
      toast.error('Erro ao salvar dados');
    }
  };



  return (
    <div>
      {/* Header */}
      <div className="bg-background border-b border-border -mx-6 -mt-6">
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
            <div className="flex-1">
              <h1 className="text-2xl font-bold">OS-13: Start de Contrato de Obra</h1>
              {internalOsId && <p className="text-sm text-muted-foreground">OS #{internalOsId}</p>}
            </div>
            <Badge variant="outline">{completedSteps.length} / {steps.length}</Badge>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-card border-b">
          <div className="max-w-5xl mx-auto">
            <WorkflowStepper
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
              completedSteps={completedSteps}
              lastActiveStep={lastActiveStep || undefined}
            />
          </div>
        </div>
      </div>


      {/* Conteúdo das Etapas */}
      <main className="flex-1 px-6 py-6">
        <div className={`mx-auto ${currentStep === 6 || currentStep === 16 ? 'max-w-6xl' : 'max-w-5xl'}`}>
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Etapa {currentStep}: {currentStepInfo?.title}</CardTitle>
                  <CardDescription>Setor: {currentStepInfo?.setorNome || 'N/A'}</CardDescription>
                </div>
                <Badge variant="outline" className="border-primary text-primary">
                  Etapa {currentStep} de {steps.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <StepReadOnlyWithAdendos etapaId={undefined} readonly={isReadOnly}>
                {currentStep === 1 && (
                  <CadastrarClienteObra
                    ref={stepLeadRef}
                    data={etapa1Data}
                    onDataChange={setEtapa1Data}
                    readOnly={isReadOnly}
                    osId={internalOsId || ''}
                    parentOSId={parentOSId}
                    clienteId={clienteId}
                  />
                )}
                {currentStep === 2 && <StepAnexarART data={etapa2Data} onDataChange={setEtapa2Data} readOnly={isReadOnly} />}
                {currentStep === 3 && <StepRelatorioFotografico data={etapa3Data} onDataChange={setEtapa3Data} readOnly={isReadOnly} osId={internalOsId} />}
                {currentStep === 4 && <StepImagemAreas data={etapa4Data} onDataChange={setEtapa4Data} readOnly={isReadOnly} osId={internalOsId} />}
                {currentStep === 5 && <StepCronogramaObra data={etapa5Data} onDataChange={setEtapa5Data} readOnly={isReadOnly} osId={internalOsId} />}
                {currentStep === 6 && internalOsId && <StepAgendarVisitaInicial ref={stepAgendarVisitaInicialRef} osId={internalOsId} data={etapa6Data} onDataChange={setEtapa6Data} readOnly={isReadOnly} />}
                {currentStep === 7 && <StepRealizarVisitaInicial data={etapa7Data} onDataChange={setEtapa7Data} readOnly={isReadOnly} />}
                {currentStep === 8 && <StepHistograma data={etapa8Data} onDataChange={setEtapa8Data} readOnly={isReadOnly} osId={internalOsId} />}
                {currentStep === 9 && <StepPlacaObra data={etapa9Data} onDataChange={setEtapa9Data} readOnly={isReadOnly} osId={internalOsId} />}
                {currentStep === 10 && <StepRequisicaoCompras data={etapa10Data} onDataChange={setEtapa10Data} readOnly={isReadOnly} parentOSId={internalOsId} clienteId={etapa1Data?.clienteId} ccId={etapa1Data?.centroCusto?.id} />}
                {currentStep === 11 && <StepRequisicaoMaoObra data={etapa11Data} onDataChange={setEtapa11Data} readOnly={isReadOnly} parentOSId={internalOsId} clienteId={etapa1Data?.clienteId} ccId={etapa1Data?.centroCusto?.id} />}
                {currentStep === 12 && <StepEvidenciaMobilizacao data={etapa12Data} onDataChange={setEtapa12Data} readOnly={isReadOnly} osId={internalOsId} />}
                {currentStep === 13 && <StepDiarioObra data={etapa13Data} onDataChange={setEtapa13Data} readOnly={isReadOnly} osId={internalOsId} />}
                {currentStep === 14 && <StepSeguroObras data={etapa14Data} onDataChange={setEtapa14Data} readOnly={isReadOnly} />}
                {currentStep === 15 && <StepDocumentosSST data={etapa15Data} onDataChange={setEtapa15Data} readOnly={isReadOnly} />}
                {currentStep === 16 && internalOsId && <StepAgendarVisitaFinal ref={stepAgendarVisitaFinalRef} osId={internalOsId} data={etapa16Data} onDataChange={setEtapa16Data} readOnly={isReadOnly} />}
                {currentStep === 17 && <StepRealizarVisitaFinal data={etapa17Data} onDataChange={setEtapa17Data} readOnly={isReadOnly} />}
              </StepReadOnlyWithAdendos>
            </CardContent>

            {/* Footer de Ações - DENTRO do Card */}
            {!isReadOnly && (
              <div className="border-t bg-muted/30">
                <WorkflowFooter
                  currentStep={currentStep}
                  totalSteps={steps.length}
                  onPrevStep={handlePrevStep}
                  onNextStep={handleNextStep}
                  onSaveDraft={handleSaveStep}
                  readOnlyMode={isReadOnly}
                  onReturnToActive={handleReturnToActive}
                  isLoading={isLoadingData}
                  isFormInvalid={isCurrentStepInvalid}
                  invalidFormMessage={currentStep === 6 || currentStep === 16 ? "Por favor, selecione um horário no calendário para continuar" : "Complete todos os campos obrigatórios desta etapa antes de continuar"}
                />
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Footer movido para dentro do Card acima */}
      {isReadOnly && (
        <WorkflowFooter
          currentStep={currentStep}
          totalSteps={steps.length}
          onPrevStep={handlePrevStep}
          onNextStep={handleNextStep}
          onSaveDraft={handleSaveStep}
          readOnlyMode={isReadOnly}
          onReturnToActive={handleReturnToActive}
          isLoading={isLoadingData}
          isFormInvalid={false}
          invalidFormMessage=""
        />
      )}

      {/* Modal de Feedback de Transferência */}
      {transferenciaInfo && (
        <FeedbackTransferencia
          isOpen={isTransferenciaModalOpen}
          onClose={() => setIsTransferenciaModalOpen(false)}
          transferencia={transferenciaInfo}
          osId={internalOsId || ''}
        />
      )}

      {/* Modal de Aprovação de Etapa */}
      {internalOsId && (
        <AprovacaoModal
          open={isAprovacaoModalOpen}
          onOpenChange={setIsAprovacaoModalOpen}
          osId={internalOsId}
          etapaOrdem={currentStep}
          etapaNome={etapaNomeParaAprovacao}
          onAprovado={async () => {
            setCurrentStep(prev => prev + 1);
            setLastActiveStep(prev => Math.max(prev ?? 0, currentStep + 1));
          }}
        />
      )}
    </div>
  );
}
