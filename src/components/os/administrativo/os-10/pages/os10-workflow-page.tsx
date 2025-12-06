import { useMemo, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from '@/lib/utils/safe-toast';
import { WorkflowStepper, WorkflowStep } from '@/components/os/shared/components/workflow-stepper';
import { WorkflowFooterWithDelegation } from '@/components/os/shared/components/workflow-footer-with-delegation';
import {
    StepAberturaSolicitacao,
    StepSelecaoCentroCusto,
    StepGerenciadorVagas,
    StepRevisaoEnvio,
} from '@/components/os/administrativo/os-10/steps';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '@/lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
import { useAuth } from '@/lib/contexts/auth-context';
import { CargoSlug } from '@/lib/constants/os-ownership-rules';
import { useAutoCreateOS } from '@/lib/hooks/use-auto-create-os';
import { logger } from '@/lib/utils/logger';

const steps: WorkflowStep[] = [
    { id: 1, title: 'Abertura da Solicitação', short: 'Abertura', responsible: 'Solicitante', status: 'active' },
    { id: 2, title: 'Seleção do Centro de Custo', short: 'Centro Custo', responsible: 'RH', status: 'pending' },
    { id: 3, title: 'Gerenciador de Vagas', short: 'Vagas', responsible: 'RH', status: 'pending' },
    { id: 4, title: 'Revisão e Envio', short: 'Envio', responsible: 'RH', status: 'pending' },
];

interface OS10WorkflowPageProps {
    onBack?: () => void;
    osId?: string;
}

export function OS10WorkflowPage({ onBack, osId: propOsId }: OS10WorkflowPageProps) {
    // Estado interno para osId (para auto-criação)
    const [internalOsId, setInternalOsId] = useState<string | undefined>(propOsId);
    const finalOsId = propOsId || internalOsId;

    // Obter usuário atual para delegação
    const { currentUser } = useAuth();

    // Hook de Auto-Criação de OS
    const {
        createOSWithFirstStep,
        isCreating: isCreatingOS,
        createdOsId
    } = useAutoCreateOS({
        tipoOS: 'OS-10',
        nomeEtapa1: 'Abertura da Solicitação',
        enabled: !finalOsId
    });

    // Auto-criar OS na montagem (se não tiver osId)
    useEffect(() => {
        if (!finalOsId && !isCreatingOS) {
            logger.log('[OS10WorkflowPage] 📦 Montado sem osId, iniciando auto-criação...');
            createOSWithFirstStep().catch((err) => {
                logger.error('[OS10WorkflowPage] ❌ Erro na auto-criação:', err);
            });
        }
    }, [finalOsId, isCreatingOS, createOSWithFirstStep]);

    // Atualizar estado quando OS for criada
    useEffect(() => {
        if (createdOsId && !finalOsId) {
            logger.log(`[OS10WorkflowPage] ✅ OS criada: ${createdOsId}`);
            setInternalOsId(createdOsId);
        }
    }, [createdOsId, finalOsId]);

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

    // Mapeamento de dados para compatibilidade - Etapa 1: Abertura
    const etapa1Data = formDataByStep[1] || {
        dataAbertura: new Date().toISOString(),
        solicitante: '',
        departamento: '',
        urgencia: 'normal',
        justificativa: '',
    };

    // Etapa 2: Centro de Custo
    const etapa2Data = formDataByStep[2] || {
        centroCusto: '',
        centroCustoNome: '',
        obraVinculada: '',
    };

    // Etapa 3: Gerenciador de Vagas
    const etapa3Data = formDataByStep[3] || {
        vagas: [],
    };

    // Setters wrappers
    const setEtapa1Data = (data: any) => setStepData(1, data);
    const setEtapa2Data = (data: any) => setStepData(2, data);
    const setEtapa3Data = (data: any) => setStepData(3, data);

    // Regras de completude
    const completionRules = useMemo(() => ({
        1: (data: any) => !!(data.solicitante && data.departamento && data.justificativa),
        2: (data: any) => !!(data.centroCusto),
        3: (data: any) => !!(data.vagas && data.vagas.length > 0),
        4: () => true, // Revisão - sempre válido
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

    // Loading state enquanto cria OS
    if (!finalOsId || isCreatingOS) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="w-full max-w-md p-8">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <h2 className="text-xl font-semibold">Preparando Requisição de RH...</h2>
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
                            <h1 className="text-2xl">OS-10: Requisição de Mão de Obra</h1>
                            {finalOsId && <p className="text-muted-foreground">OS #{finalOsId}</p>}
                            <p className="text-sm text-muted-foreground">Recrutamento e Contratação de Colaboradores</p>
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
                        {/* ETAPA 1: Abertura da Solicitação */}
                        {currentStep === 1 && (
                            <StepAberturaSolicitacao
                                data={etapa1Data}
                                onDataChange={setEtapa1Data}
                                readOnly={isHistoricalNavigation}
                            />
                        )}

                        {/* ETAPA 2: Seleção do Centro de Custo */}
                        {currentStep === 2 && (
                            <StepSelecaoCentroCusto
                                data={etapa2Data}
                                onDataChange={setEtapa2Data}
                                readOnly={isHistoricalNavigation}
                            />
                        )}

                        {/* ETAPA 3: Gerenciador de Vagas */}
                        {currentStep === 3 && (
                            <StepGerenciadorVagas
                                data={etapa3Data}
                                onDataChange={setEtapa3Data}
                                readOnly={isHistoricalNavigation}
                            />
                        )}

                        {/* ETAPA 4: Revisão e Envio */}
                        {currentStep === 4 && (
                            <StepRevisaoEnvio
                                etapa1Data={etapa1Data}
                                etapa2Data={etapa2Data}
                                etapa3Data={etapa3Data}
                                readOnly={isHistoricalNavigation}
                            />
                        )}
                    </div>
                </Card>
            </div>

            {/* Footer com botões de navegação */}
            <WorkflowFooterWithDelegation
                currentStep={currentStep}
                totalSteps={steps.length}
                onPrevStep={handlePrevStep}
                onNextStep={handleNextStep}
                onSaveDraft={handleSaveStep}
                readOnlyMode={isHistoricalNavigation}
                onReturnToActive={handleReturnToActive}
                isLoading={isLoadingData}
                // Props de delegação (OS-10 não tem handoffs, mas mantemos consistência)
                osType="OS-10"
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