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
import { ChevronLeft } from 'lucide-react';
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '@/lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
import { useAuth } from '@/lib/contexts/auth-context';
import { CargoSlug } from '@/lib/constants/os-ownership-rules';
import { useCreateOrdemServico } from '@/lib/hooks/use-ordens-servico';
import { ordensServicoAPI } from '@/lib/api-client';
import { supabase } from '@/lib/supabase-client';
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
    // Estado interno para osId (criado na Etapa 2 quando o CC for selecionado)
    const [internalOsId, setInternalOsId] = useState<string | undefined>(propOsId);
    const finalOsId = propOsId || internalOsId;
    const [isCreatingOS, setIsCreatingOS] = useState(false);

    // Obter usuário atual para delegação
    const { currentUser } = useAuth();

    // Hook para criar OS
    const { mutate: createOS } = useCreateOrdemServico();

    // Atualizar internalOsId se prop mudar
    useEffect(() => {
        if (propOsId) setInternalOsId(propOsId);
    }, [propOsId]);

    // Função para criar OS quando o CC for selecionado na Etapa 2
    const createOSWithCC = async (centroCustoId: string): Promise<string | null> => {
        if (finalOsId) return finalOsId; // Já existe uma OS

        try {
            setIsCreatingOS(true);
            logger.log('[OS10WorkflowPage] 🔧 Criando OS com CC:', centroCustoId);

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
            const tipo = tiposOS.find((t: { codigo: string }) => t.codigo === 'OS-10');

            if (!tipo) {
                throw new Error('Tipo de OS OS-10 não encontrado no sistema');
            }

            // 3. Criar OS com o cliente do CC
            const osData = {
                tipo_os_id: tipo.id,
                status_geral: 'em_triagem' as const,
                descricao: 'OS-10: Requisição de Mão de Obra',
                criado_por_id: currentUser?.id,
                cliente_id: ccData.cliente_id,
                cc_id: centroCustoId,
                data_entrada: new Date().toISOString()
            };

            const newOS = await createOS(osData);
            logger.log(`[OS10WorkflowPage] ✅ OS criada: ${newOS.codigo_os} (ID: ${newOS.id})`);
            
            setInternalOsId(newOS.id);
            return newOS.id;
        } catch (err) {
            logger.error('[OS10WorkflowPage] ❌ Erro ao criar OS:', err);
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
            if (finalOsId) {
                await saveStep(currentStep, true);
                toast.success('Dados salvos com sucesso!');
            }
        } catch {
            toast.error('Erro ao salvar dados');
        }
    };

    // Handler customizado para o avanço da etapa 2 (criar OS com CC)
    const handleCustomNextStep = async () => {
        // Na Etapa 2, precisamos criar a OS antes de avançar (CC selecionado)
        if (currentStep === 2 && !finalOsId) {
            const ccId = etapa2Data.centroCusto;
            if (!ccId) {
                toast.error('Selecione um Centro de Custo antes de continuar');
                return;
            }

            const newOsId = await createOSWithCC(ccId);
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
                onNextStep={handleCustomNextStep}
                onSaveDraft={handleSaveStep}
                readOnlyMode={isHistoricalNavigation}
                onReturnToActive={handleReturnToActive}
                isLoading={isLoadingData || isCreatingOS}
                // Props de delegação (só funciona se já tem OS criada)
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