import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { toast } from '@/lib/utils/safe-toast';
import { WorkflowStepper, WorkflowStep } from '@/components/os/shared/components/workflow-stepper';
import { WorkflowFooter } from '@/components/os/shared/components/workflow-footer';
import {
  StepRequisicaoCompra,
  StepUploadOrcamentos
} from '@/components/os/administrativo/os-9/steps';
import { ChevronLeft } from 'lucide-react';
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '@/lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
import { useAuth } from '@/lib/contexts/auth-context';
import { useCreateOrdemServico } from '@/lib/hooks/use-ordens-servico';
import { ordensServicoAPI } from '@/lib/api-client';
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
  const [internalOsId, setInternalOsId] = useState<string | undefined>(osId || urlOsId);
  const finalOsId = osId || urlOsId || internalOsId;
  const navigate = useNavigate();
  const [isCreatingOS, setIsCreatingOS] = useState(false);

  // Obter usuário atual para delegação
  const { currentUser } = useAuth();

  // Hook para criar OS
  const { mutate: createOS } = useCreateOrdemServico();

  // Atualizar internalOsId se props mudarem
  useEffect(() => {
    if (osId) setInternalOsId(osId);
    else if (urlOsId) setInternalOsId(urlOsId);
  }, [osId, urlOsId]);

  // Função para criar OS quando o CC for selecionado na Etapa 1
  const createOSWithCC = async (centroCustoId: string): Promise<string | null> => {
    if (finalOsId) return finalOsId; // Já existe uma OS

    try {
      setIsCreatingOS(true);
      logger.log('[OS09WorkflowPage] 🔧 Criando OS com CC:', centroCustoId);

      // 1. Buscar cliente_id do Centro de Custo
      const { data: ccData, error: ccError } = await supabase
        .from('centros_custo')
        .select('cliente_id')
        .eq('id', centroCustoId)
        .single();

      if (ccError || !ccData?.cliente_id) {
        throw new Error('Centro de custo não encontrado ou sem cliente vinculado');
      }

      // 2. Buscar tipo de OS
      const tiposOS = await ordensServicoAPI.getTiposOS();
      const tipo = tiposOS.find((t: { codigo: string }) => t.codigo === 'OS-09');

      if (!tipo) {
        throw new Error('Tipo de OS OS-09 não encontrado no sistema');
      }

      // 3. Criar OS com o cliente do CC
      const osData = {
        tipo_os_id: tipo.id,
        status_geral: 'em_triagem' as const,
        descricao: 'OS-09: Requisição de Compras',
        criado_por_id: currentUser?.id,
        cliente_id: ccData.cliente_id,
        cc_id: centroCustoId,
        data_entrada: new Date().toISOString()
      };

      const newOS = await createOS(osData);
      logger.log(`[OS09WorkflowPage] ✅ OS criada: ${newOS.codigo_os} (ID: ${newOS.id})`);

      setInternalOsId(newOS.id);

      // Navegar para URL com osId
      navigate({
        to: '/os/criar/requisicao-compras',
        search: { osId: newOS.id },
        replace: true
      });

      return newOS.id;
    } catch (err) {
      logger.error('[OS09WorkflowPage] ❌ Erro ao criar OS:', err);
      toast.error('Erro ao criar ordem de serviço');
      return null;
    } finally {
      setIsCreatingOS(false);
    }
  };

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
    hasItems: false,
    centro_custo_id: undefined
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
      if (finalOsId) {
        await saveStep(currentStep, true);
        toast.success('Dados salvos com sucesso!');
      }
    } catch {
      toast.error('Erro ao salvar dados');
    }
  };

  // Handler customizado para o avanço da etapa 1 (criar OS com CC)
  const handleCustomNextStep = async () => {
    // Na Etapa 1, precisamos criar a OS antes de avançar
    if (currentStep === 1 && !finalOsId) {
      const ccId = etapa1Data.centro_custo_id;
      if (!ccId) {
        toast.error('Selecione um Centro de Custo antes de continuar');
        return;
      }

      const newOsId = await createOSWithCC(ccId);
      if (!newOsId) {
        return; // Erro na criação
      }

      // Salvar dados da etapa 1
      await saveStep(1, true);
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

        </div>
      </div>


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

      {/* Footer com botões de navegação */}
      <WorkflowFooter
        currentStep={currentStep}
        totalSteps={steps.length}
        onPrevStep={handlePrevStep}
        onNextStep={handleCustomNextStep}
        onSaveDraft={handleSaveStep}
        readOnlyMode={isHistoricalNavigation}
        onReturnToActive={handleReturnToActive}
        isLoading={isLoadingData || isCreatingOS}
      />
    </div>
  );
}
