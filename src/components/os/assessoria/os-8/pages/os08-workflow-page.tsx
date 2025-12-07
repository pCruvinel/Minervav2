import { useMemo, useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from '@/lib/utils/safe-toast';
import { WorkflowStepper, WorkflowStep } from '@/components/os/shared/components/workflow-stepper';
import { WorkflowFooterWithDelegation } from '@/components/os/shared/components/workflow-footer-with-delegation';
import {
  StepIdentificacaoSolicitante,
  StepAtribuirCliente,
  StepAgendarVisita,
  StepRealizarVisita,
  StepFormularioPosVisita,
  StepGerarDocumento,
  StepEnviarDocumento
} from '@/components/os/assessoria/os-8/steps';
import { ChevronLeft } from 'lucide-react';
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '@/lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
import { useAuth } from '@/lib/contexts/auth-context';
import { CargoSlug } from '@/lib/constants/os-ownership-rules';
import { useCreateOrdemServico } from '@/lib/hooks/use-ordens-servico';
import { ordensServicoAPI } from '@/lib/api-client';
import { logger } from '@/lib/utils/logger';

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

export function OS08WorkflowPage({ onBack, osId: propOsId }: OS08WorkflowPageProps) {
  // Estado interno para osId (criado na Etapa 2 quando o cliente for atribuído)
  const [internalOsId, setInternalOsId] = useState<string | undefined>(propOsId);
  const finalOsId = propOsId || internalOsId;
  const [isCreatingOS, setIsCreatingOS] = useState(false);

  // Refs para validação imperativa de steps
  const stepAgendarVisitaRef = useRef<any>(null);

  // Obter usuário atual para delegação
  const { currentUser } = useAuth();

  // Hook para criar OS
  const { mutate: createOS } = useCreateOrdemServico();

  // Atualizar internalOsId se prop mudar
  useEffect(() => {
    if (propOsId) setInternalOsId(propOsId);
  }, [propOsId]);

  // Função para criar OS quando o cliente for atribuído na Etapa 2
  const createOSWithClient = async (clienteId: string): Promise<string | null> => {
    if (finalOsId) return finalOsId; // Já existe uma OS

    try {
      setIsCreatingOS(true);
      logger.log('[OS08WorkflowPage] 🔧 Criando OS com cliente:', clienteId);

      // Buscar tipo de OS
      const tiposOS = await ordensServicoAPI.getTiposOS();
      const tipo = tiposOS.find((t: { codigo: string }) => t.codigo === 'OS-08');

      if (!tipo) {
        throw new Error('Tipo de OS OS-08 não encontrado no sistema');
      }

      // Criar OS com o cliente real
      const osData = {
        tipo_os_id: tipo.id,
        status_geral: 'em_triagem' as const,
        descricao: 'OS-08: Visita Técnica / Parecer Técnico',
        criado_por_id: currentUser?.id,
        cliente_id: clienteId,
        data_entrada: new Date().toISOString()
      };

      const newOS = await createOS(osData);
      logger.log(`[OS08WorkflowPage] ✅ OS criada: ${newOS.codigo_os} (ID: ${newOS.id})`);
      setInternalOsId(newOS.id);
      return newOS.id;
    } catch (err) {
      logger.error('[OS08WorkflowPage] ❌ Erro ao criar OS:', err);
      toast.error('Erro ao criar ordem de serviço');
      return null;
    } finally {
      setIsCreatingOS(false);
    }
  };

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
    osId: finalOsId,
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
  const etapa3Data = formDataByStep[3] || { dataAgendamento: '', agendamentoId: '' };
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
    3: (data: any) => !!(data.agendamentoId || data.dataAgendamento),
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

  // =====================================================
  // Cálculo de Validação - Bloqueio de Progresso
  // =====================================================

  const isCurrentStepInvalid = useMemo(() => {
    // Não validar em modo histórico (read-only)
    if (isHistoricalNavigation) return false;

    // Switch por etapa para validação específica
    switch (currentStep) {
      case 3: // Agendar Visita - opcional
        return false;
      default:
        return false;
    }
  }, [currentStep, isHistoricalNavigation]);

  const handleSaveStep = async () => {
    try {
      if (finalOsId) {
        await saveStep(currentStep, true); // Salvar como rascunho explicitamente se clicado no botão salvar
        toast.success('Dados salvos com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao salvar dados');
    }
  };

  // Handler customizado para o avanço da etapa 2 (criar OS com cliente)
  const handleCustomNextStep = async () => {
    // Na Etapa 2, precisamos criar a OS antes de avançar
    if (currentStep === 2 && !finalOsId) {
      const clienteId = etapa2Data.clienteId;
      if (!clienteId) {
        toast.error('Selecione um cliente antes de continuar');
        return;
      }

      const newOsId = await createOSWithClient(clienteId);
      if (!newOsId) {
        return; // Erro na criação
      }

      // Salvar dados das etapas 1 e 2
      await saveStep(1, true);
      await saveStep(2, true);
    }

    // Chamar o handler normal de navegação
    handleNextStep();
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
              <h1 className="text-2xl">OS-08: Visita Técnica / Parecer Técnico</h1>
              {finalOsId && <p className="text-muted-foreground">OS #{finalOsId}</p>}
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

        </div>
      </div>


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
            {currentStep === 3 && finalOsId && (
              <StepAgendarVisita
                ref={stepAgendarVisitaRef}
                osId={finalOsId}
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
                osId={finalOsId}
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

      {/* Footer com botões de navegação e delegação */}
      <WorkflowFooterWithDelegation
        currentStep={currentStep}
        totalSteps={steps.length}
        onPrevStep={handlePrevStep}
        onNextStep={handleCustomNextStep}
        onSaveDraft={handleSaveStep}
        readOnlyMode={isHistoricalNavigation}
        onReturnToActive={handleReturnToActive}
        isLoading={isLoadingData || isCreatingOS}
        isFormInvalid={isCurrentStepInvalid}
        invalidFormMessage="Por favor, selecione um horário no calendário para continuar"
        // Props de delegação (só funciona se já tem OS criada)
        osType="OS-08"
        osId={finalOsId}
        currentOwnerId={currentUser?.id}
        currentUserCargoSlug={currentUser?.cargo_slug as CargoSlug}
        onDelegationComplete={() => {
          toast.success('Responsabilidade transferida com sucesso!');
        }}
      />
    </div>
  );
}
