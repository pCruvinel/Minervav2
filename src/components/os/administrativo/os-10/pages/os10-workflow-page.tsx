import { useMemo } from 'react';
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
import { ChevronLeft, Info } from 'lucide-react';
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '@/lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
import { useAuth } from '@/lib/contexts/auth-context';
import { CargoSlug } from '@/lib/constants/os-ownership-rules';

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

export function OS10WorkflowPage({ onBack, osId }: OS10WorkflowPageProps) {
    // Obter usuário atual para delegação
    const { currentUser } = useAuth();

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
                            {osId && <p className="text-muted-foreground">OS #{osId}</p>}
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
                osId={osId}
                currentOwnerId={currentUser?.id}
                currentUserCargoSlug={currentUser?.cargo_slug as CargoSlug}
                onDelegationComplete={() => {
                    toast.success('Responsabilidade transferida com sucesso!');
                }}
            />
        </div>
    );
}