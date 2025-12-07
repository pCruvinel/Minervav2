import { useMemo, useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from '@/lib/utils/safe-toast';
import { WorkflowStepper, WorkflowStep } from '@/components/os/shared/components/workflow-stepper';
import { WorkflowFooterWithDelegation } from '@/components/os/shared/components/workflow-footer-with-delegation';
import { StepCadastroClienteContrato, type StepCadastroClienteContratoHandle } from '@/components/os/assessoria/os-12/steps/step-cadastro-cliente-contrato';
import { StepDefinicaoSLA } from '@/components/os/assessoria/os-12/steps/step-definicao-sla';
import { StepSetupRecorrencia } from '@/components/os/assessoria/os-12/steps/step-setup-recorrencia';
import { StepAlocacaoEquipe } from '@/components/os/assessoria/os-12/steps/step-alocacao-equipe';
import { StepConfigCalendario } from '@/components/os/assessoria/os-12/steps/step-config-calendario';
import { StepInicioServicos } from '@/components/os/assessoria/os-12/steps/step-inicio-servicos';
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
    { id: 1, title: 'Cadastro do Cliente', short: 'Cliente', responsible: 'Assessoria', status: 'active' },
    { id: 2, title: 'Definição de SLA', short: 'SLA', responsible: 'Gestor', status: 'pending' },
    { id: 3, title: 'Setup de Recorrência', short: 'Recorrência', responsible: 'ADM', status: 'pending' },
    { id: 4, title: 'Alocação de Equipe', short: 'Equipe', responsible: 'Gestor', status: 'pending' },
    { id: 5, title: 'Configuração Calendário', short: 'Calendário', responsible: 'Sistema', status: 'pending' },
    { id: 6, title: 'Início dos Serviços', short: 'Início', responsible: 'Sistema', status: 'pending' },
];

interface OS12WorkflowPageProps {
    onBack?: () => void;
    osId?: string;
}

export function OS12WorkflowPage({ onBack, osId: propOsId }: OS12WorkflowPageProps) {
    // Estado interno para osId (criado na Etapa 1 quando o cliente for selecionado/cadastrado)
    const [internalOsId, setInternalOsId] = useState<string | undefined>(propOsId);
    const finalOsId = propOsId || internalOsId;
    const [isCreatingOS, setIsCreatingOS] = useState(false);

    // Ref para validação da Etapa 1
    const stepCadastroRef = useRef<StepCadastroClienteContratoHandle>(null);

    // Obter usuário atual para delegação
    const { currentUser } = useAuth();

    // Hook para criar OS
    const { mutate: createOS } = useCreateOrdemServico();

    // Atualizar internalOsId se prop mudar
    useEffect(() => {
        if (propOsId) setInternalOsId(propOsId);
    }, [propOsId]);

    // Função para criar OS quando o cliente for selecionado na Etapa 1
    const createOSWithClient = async (clienteId: string): Promise<string | null> => {
        if (finalOsId) return finalOsId; // Já existe uma OS

        try {
            setIsCreatingOS(true);
            logger.log('[OS12WorkflowPage] 🔧 Criando OS com cliente:', clienteId);

            // Buscar tipo de OS
            const tiposOS = await ordensServicoAPI.getTiposOS();
            const tipo = tiposOS.find((t: { codigo: string }) => t.codigo === 'OS-12');

            if (!tipo) {
                throw new Error('Tipo de OS OS-12 não encontrado no sistema');
            }

            // Criar OS com o cliente real (não o genérico)
            const osData = {
                tipo_os_id: tipo.id,
                status_geral: 'em_triagem' as const,
                descricao: 'OS-12: Assessoria Técnica Mensal/Anual',
                criado_por_id: currentUser?.id,
                cliente_id: clienteId,
                data_entrada: new Date().toISOString()
            };

            const newOS = await createOS(osData);
            logger.log(`[OS12WorkflowPage] ✅ OS criada: ${newOS.codigo_os} (ID: ${newOS.id})`);
            setInternalOsId(newOS.id);
            return newOS.id;
        } catch (err) {
            logger.error('[OS12WorkflowPage] ❌ Erro ao criar OS:', err);
            toast.error('Erro ao criar ordem de serviço');
            return null;
        } finally {
            setIsCreatingOS(false);
        }
    };

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

    // Etapa 1: Cadastro do Cliente (agora com leadId)
    const etapa1Data = formDataByStep[1] || {
        leadId: '',
        clienteId: '',
        tipoContrato: 'mensal',
        dataInicioContrato: '',
        dataFimContrato: '',
        valorMensal: '',
    };

    // Etapa 2: Definição de SLA
    const etapa2Data = formDataByStep[2] || {
        tempoResposta: '',
        visitasSemanais: 1,
        diasAtendimento: [],
        horarioInicio: '',
        horarioFim: '',
        servicosIncluidos: [],
        penalidades: '',
    };

    // Etapa 3: Setup de Recorrência
    const etapa3Data = formDataByStep[3] || {
        frequenciaCobranca: 'mensal',
        diaPagamento: '',
        formaPagamento: '',
        valorContrato: '',
        reajusteAnual: true,
        percentualReajuste: '5',
        parcelasGeradas: [],
    };

    // Etapa 4: Alocação de Equipe
    const etapa4Data = formDataByStep[4] || {
        tecnicoResponsavel: '',
        equipeSuporteIds: [],
        coordenadorId: '',
    };

    // Etapa 5: Configuração do Calendário
    const etapa5Data = formDataByStep[5] || {
        visitasAgendadas: [],
        diasSemana: [],
        horarioVisita: '',
        alertasConfigurados: true,
    };

    // Etapa 6: Início dos Serviços
    const etapa6Data = formDataByStep[6] || {
        contratoAtivado: false,
        dataAtivacao: '',
        primeiraVisitaAgendada: false,
        observacoes: '',
    };

    const setEtapa1Data = (d: any) => setStepData(1, d);
    const setEtapa2Data = (d: any) => setStepData(2, d);
    const setEtapa3Data = (d: any) => setStepData(3, d);
    const setEtapa4Data = (d: any) => setStepData(4, d);
    const setEtapa5Data = (d: any) => setStepData(5, d);
    const setEtapa6Data = (d: any) => setStepData(6, d);

    const completionRules = useMemo(() => ({
        1: (d: any) => !!((d.leadId || d.clienteId) && d.tipoContrato && d.valorMensal),
        2: (d: any) => !!(d.visitasSemanais && d.diasAtendimento?.length > 0),
        3: (d: any) => !!(d.frequenciaCobranca && d.valorContrato),
        4: (d: any) => !!(d.tecnicoResponsavel),
        5: (d: any) => !!(d.diasSemana?.length > 0),
        6: (d: any) => !!(d.contratoAtivado),
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

    // Handler customizado para o avanço da etapa 1 (criar OS com cliente)
    const handleCustomNextStep = async () => {
        // Na Etapa 1, precisamos criar a OS antes de avançar
        if (currentStep === 1 && !finalOsId) {
            const clienteId = etapa1Data.leadId || etapa1Data.clienteId;
            if (!clienteId) {
                toast.error('Selecione um cliente antes de continuar');
                return;
            }

            const newOsId = await createOSWithClient(clienteId);
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
                            <h1 className="text-2xl">OS-12: Assessoria Técnica Mensal/Anual</h1>
                            {finalOsId && <p className="text-muted-foreground">OS #{finalOsId}</p>}
                            <p className="text-sm text-muted-foreground">Contrato de Assessoria Recorrente</p>
                        </div>
                    </div>
                </div>

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


            <div className="px-6 py-6">
                <Card className="max-w-5xl mx-auto">
                    <div className="p-6">
                        {currentStep === 1 && (
                            <StepCadastroClienteContrato 
                                ref={stepCadastroRef}
                                data={etapa1Data} 
                                onDataChange={setEtapa1Data} 
                                readOnly={isHistoricalNavigation} 
                            />
                        )}
                        {currentStep === 2 && (
                            <StepDefinicaoSLA data={etapa2Data} onDataChange={setEtapa2Data} readOnly={isHistoricalNavigation} />
                        )}
                        {currentStep === 3 && (
                            <StepSetupRecorrencia
                                data={etapa3Data}
                                onDataChange={setEtapa3Data}
                                readOnly={isHistoricalNavigation}
                                valorMensal={etapa1Data.valorMensal}
                                dataInicio={etapa1Data.dataInicioContrato}
                            />
                        )}
                        {currentStep === 4 && (
                            <StepAlocacaoEquipe data={etapa4Data} onDataChange={setEtapa4Data} readOnly={isHistoricalNavigation} />
                        )}
                        {currentStep === 5 && (
                            <StepConfigCalendario
                                data={etapa5Data}
                                onDataChange={setEtapa5Data}
                                readOnly={isHistoricalNavigation}
                                slaData={etapa2Data}
                            />
                        )}
                        {currentStep === 6 && (
                            <StepInicioServicos
                                data={etapa6Data}
                                onDataChange={setEtapa6Data}
                                readOnly={isHistoricalNavigation}
                                clienteData={etapa1Data}
                                slaData={etapa2Data}
                            />
                        )}
                    </div>
                </Card>
            </div>

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
                osType="OS-12"
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