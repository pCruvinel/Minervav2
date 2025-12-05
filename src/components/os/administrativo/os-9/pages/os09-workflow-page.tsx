import { useMemo, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { toast } from '@/lib/utils/safe-toast';
import { WorkflowStepper, WorkflowStep } from '@/components/os/shared/components/workflow-stepper';
import { WorkflowFooterWithDelegation } from '@/components/os/shared/components/workflow-footer-with-delegation';
import {
  StepRequisicaoCompra,
  StepUploadOrcamentos
} from '@/components/os/administrativo/os-9/steps';
import { ChevronLeft, Info, Loader2 } from 'lucide-react';
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '@/lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
import { useAuth } from '@/lib/contexts/auth-context';
import { CargoSlug } from '@/lib/constants/os-ownership-rules';
import { useAutoCreateOS } from '@/lib/hooks/use-auto-create-os';
import { Route } from '@/routes/_auth/os/criar/requisicao-compras';
import { logger } from '@/lib/utils/logger';
import { supabase } from '@/lib/supabase-client';

const steps: WorkflowStep[] = [
  { id: 1, title: 'Requisição de Compra', short: 'Requisição', responsible: 'Solicitante', status: 'active' },
  { id: 2, title: 'Upload de Orçamentos', short: 'Orçamentos', responsible: 'Compras', status: 'pending' },
];

interface OS09WorkflowPageProps {
  onBack?: () => void;
  osId?: string;
}

export function OS09WorkflowPage({ onBack, osId }: OS09WorkflowPageProps) {
  // 1. Consolidar osId (props > URL)
  const { osId: urlOsId } = Route.useSearch();
  const finalOsId = osId || urlOsId;
  const navigate = useNavigate();

  // Obter usuário atual para delegação
  const { currentUser } = useAuth();

  // 2. Hook de Auto-Criação
  const {
    createOSWithFirstStep,
    isCreating: isCreatingOS,
    createdOsId
  } = useAutoCreateOS({
    tipoOS: 'OS-09',
    nomeEtapa1: 'Requisição de Compra',
    enabled: !finalOsId
  });

  // 3. useEffect para auto-criar na montagem
  useEffect(() => {
    if (!finalOsId && !isCreatingOS) {
      logger.log('[OS09WorkflowPage] 📦 Montado sem osId, iniciando auto-criação...');
      createOSWithFirstStep().catch((err) => {
        logger.error('[OS09WorkflowPage] ❌ Erro na auto-criação:', err);
      });
    }
  }, [finalOsId, isCreatingOS, createOSWithFirstStep]);

  // 4. Navegar quando OS for criada
  useEffect(() => {
    if (createdOsId && !finalOsId) {
      logger.log(`[OS09WorkflowPage] 🔄 Navegando para osId=${createdOsId}...`);
      navigate({
        to: '/os/criar/requisicao-compras',
        search: { osId: createdOsId },
        replace: true
      });
    }
  }, [createdOsId, finalOsId, navigate]);

  // 5. Hook de Estado do Workflow (aguarda osId)
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
    isLoading: isLoadingData,
    etapas
  } = useWorkflowState({
    osId: finalOsId,
    totalSteps: steps.length
  });

  // Callback de conclusão do workflow
  const handleCompleteWorkflow = async (): Promise<boolean> => {
    if (!finalOsId) {
      toast.error('Erro: OS não identificada');
      return false;
    }

    try {
      // 1. Save current step
      const saved = await saveStep(currentStep, false);
      if (!saved) return false;

      // 2. Update OS status (IMPORTANTE: DB usa 'concluido' sem acento!)
      const { error } = await supabase
        .from('ordens_servico')
        .update({
          status_geral: 'concluido', // SEM acento!
          data_conclusao: new Date().toISOString()
        })
        .eq('id', finalOsId);

      if (error) throw error;

      logger.log('[OS09] ✅ Requisição concluída:', finalOsId);

      toast.success('Requisição de Compras concluída!', {
        icon: '🎉',
        description: 'Agora disponível para aprovação do Financeiro.'
      });

      // 3. Navigate to OS list after 2s
      setTimeout(() => navigate({ to: '/os' }), 2000);
      return true;

    } catch (error) {
      logger.error('[OS09] ❌ Erro ao concluir:', error);
      toast.error('Erro ao concluir requisição');
      return false;
    }
  };

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
    onSaveStep: (step) => saveStep(step, false),
    onCompleteWorkflow: handleCompleteWorkflow
  });

  // Mapeamento de dados para compatibilidade
  const etapa1Data = formDataByStep[1] || {
    totalItems: 0,
    valorTotal: 0,
    hasItems: false
  };

  const etapa2Data = formDataByStep[2] || {
    arquivos: [],
  };

  // Setters wrappers
  const setEtapa1Data = (data: any) => setStepData(1, data);
  const setEtapa2Data = (data: any) => setStepData(2, data);

  // 5. Buscar o ID da etapa 1 das etapas carregadas
  const etapa1Id = etapas?.find(e => e.ordem === 1)?.id;

  logger.log(`[OS09WorkflowPage] 📊 finalOsId=${finalOsId}, etapa1Id=${etapa1Id}, isCreating=${isCreatingOS}`);

  /**
   * Cálculo dinâmico de etapas completadas
   */
  // Regras de completude
  const completionRules = useMemo(() => ({
    1: (data: any) => !!(data.hasItems && data.totalItems > 0),
    2: (data: any) => !!(data.arquivos && data.arquivos.length >= 3),
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
    } catch {
      toast.error('Erro ao salvar dados');
    }
  };

  // 6. Loading state enquanto cria OS
  if (!finalOsId || isCreatingOS) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Preparando Requisição de Compras...</h2>
            <p className="text-sm text-muted-foreground">
              Isso levará apenas alguns segundos
            </p>
          </div>
        </Card>
      </div>
    );
  }

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
              <h1 className="text-2xl">OS-09: Requisição de Compras</h1>
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
            {/* ETAPA 1: Requisição de Compra */}
            {currentStep === 1 && (
              <StepRequisicaoCompra
                data={etapa1Data}
                onDataChange={setEtapa1Data}
                etapaId={etapa1Id}
                readOnly={isHistoricalNavigation}
              />
            )}

            {/* ETAPA 2: Upload de Orçamentos */}
            {currentStep === 2 && (
              <StepUploadOrcamentos
                data={etapa2Data}
                onDataChange={setEtapa2Data}
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
        onNextStep={handleNextStep}
        onSaveDraft={handleSaveStep}
        readOnlyMode={isHistoricalNavigation}
        onReturnToActive={handleReturnToActive}
        isLoading={isLoadingData}
        // Props de delegação
        osType="OS-09"
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
