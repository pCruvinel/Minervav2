import { useMemo, useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from '@/lib/utils/safe-toast';
import { WorkflowStepper, WorkflowStep } from '@/components/os/shared/components/workflow-stepper';
import { WorkflowFooterWithDelegation } from '@/components/os/shared/components/workflow-footer-with-delegation';
import { CadastrarLead, CadastrarLeadHandle, FormDataCompleto } from '@/components/os/shared/steps/cadastrar-lead';
import { StepAgendarVisita } from '@/components/os/assessoria/os-11/steps/step-agendar-visita';
import { StepRealizarVisita } from '@/components/os/assessoria/os-11/steps/step-realizar-visita';
import { StepAnexarRT } from '@/components/os/assessoria/os-11/steps/step-anexar-rt';
import { StepGerarDocumento } from '@/components/os/assessoria/os-11/steps/step-gerar-documento';
import { StepEnviarCliente } from '@/components/os/assessoria/os-11/steps/step-enviar-cliente';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '@/lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
import { useAuth } from '@/lib/contexts/auth-context';
import { CargoSlug } from '@/lib/constants/os-ownership-rules';
import { useAutoCreateOS } from '@/lib/hooks/use-auto-create-os';
import { logger } from '@/lib/utils/logger';

const steps: WorkflowStep[] = [
    { id: 1, title: 'Cadastrar Cliente', short: 'Cliente', responsible: 'Assessoria', status: 'active' },
    { id: 2, title: 'Agendar Visita', short: 'Agendar', responsible: 'Assessoria', status: 'pending' },
    { id: 3, title: 'Realizar Visita', short: 'Visita', responsible: 'Técnico', status: 'pending' },
    { id: 4, title: 'Anexar RT', short: 'RT', responsible: 'Técnico', status: 'pending' },
    { id: 5, title: 'Gerar Documento', short: 'PDF', responsible: 'Sistema', status: 'pending' },
    { id: 6, title: 'Enviar ao Cliente', short: 'Envio', responsible: 'Sistema', status: 'pending' },
];

interface OS11WorkflowPageProps {
    onBack?: () => void;
    osId?: string;
}

export function OS11WorkflowPage({ onBack, osId: propOsId }: OS11WorkflowPageProps) {
    // Estado interno para osId (para auto-criação)
    const [internalOsId, setInternalOsId] = useState<string | undefined>(propOsId);
    const finalOsId = propOsId || internalOsId;

    // Refs para validação imperativa de steps
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stepAgendarVisitaRef = useRef<any>(null);
    const cadastrarLeadRef = useRef<CadastrarLeadHandle>(null);

    // Estado para CadastrarLead
    const [showCombobox, setShowCombobox] = useState(false);
    const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);

    // Obter usuário atual para delegação
    const { currentUser } = useAuth();

    // Hook de Auto-Criação de OS
    const {
        createOSWithFirstStep,
        isCreating: isCreatingOS,
        createdOsId
    } = useAutoCreateOS({
        tipoOS: 'OS-11',
        nomeEtapa1: 'Cadastrar Cliente',
        enabled: !finalOsId
    });

    // Auto-criar OS na montagem (se não tiver osId)
    useEffect(() => {
        if (!finalOsId && !isCreatingOS) {
            logger.log('[OS11WorkflowPage] 📦 Montado sem osId, iniciando auto-criação...');
            createOSWithFirstStep().catch((err) => {
                logger.error('[OS11WorkflowPage] ❌ Erro na auto-criação:', err);
            });
        }
    }, [finalOsId, isCreatingOS, createOSWithFirstStep]);

    // Atualizar estado quando OS for criada
    useEffect(() => {
        if (createdOsId && !finalOsId) {
            logger.log(`[OS11WorkflowPage] ✅ OS criada: ${createdOsId}`);
            setInternalOsId(createdOsId);
        }
    }, [createdOsId, finalOsId]);

    // Atualizar internalOsId se prop mudar
    useEffect(() => {
        if (propOsId) setInternalOsId(propOsId);
    }, [propOsId]);

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

    // Estado para o leadId selecionado (CadastrarLead)
    const [selectedLeadId, setSelectedLeadId] = useState<string>(formDataByStep[1]?.leadId || '');

    // Etapa 1: Cadastrar Lead (compatível com CadastrarLead)
    const etapa1Data: FormDataCompleto = formDataByStep[1] || {
        nome: '',
        cpfCnpj: '',
        tipo: '',
        tipoEmpresa: '',
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
    };

    // Etapa 2: Agendar Visita
    const etapa2Data = formDataByStep[2] || {
        dataVisita: '',
        horarioVisita: '',
        tecnicoResponsavel: '',
        duracaoEstimada: '',
        instrucoes: '',
    };

    // Etapa 3: Realizar Visita
    const etapa3Data = formDataByStep[3] || {
        visitaRealizada: false,
        dataRealizacao: '',
        horaChegada: '',
        horaSaida: '',
        respostas: {},
        fotos: [],
        observacoesVisita: '',
    };

    // Etapa 4: Anexar RT
    const etapa4Data = formDataByStep[4] || {
        arquivoRT: null,
        numeroRT: '',
        dataRT: '',
        profissionalResponsavel: '',
        crea: '',
    };

    // Etapa 5: Gerar Documento
    const etapa5Data = formDataByStep[5] || {
        documentoGerado: false,
        urlDocumento: '',
        dataGeracao: '',
        templateUsado: 'laudo-tecnico',
    };

    // Etapa 6: Enviar ao Cliente
    const etapa6Data = formDataByStep[6] || {
        enviado: false,
        dataEnvio: '',
        emailEnviado: '',
        confirmacaoRecebimento: false,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setEtapa2Data = (d: any) => setStepData(2, d);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setEtapa3Data = (d: any) => setStepData(3, d);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setEtapa4Data = (d: any) => setStepData(4, d);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setEtapa5Data = (d: any) => setStepData(5, d);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setEtapa6Data = (d: any) => setStepData(6, d);

    const completionRules = useMemo(() => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        1: (d: any) => !!(d.nome && d.cpfCnpj && d.endereco && selectedLeadId),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        2: (d: any) => !!(d.dataVisita && d.tecnicoResponsavel),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        3: (d: any) => !!(d.visitaRealizada),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        4: (d: any) => !!(d.arquivoRT && d.numeroRT),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        5: (d: any) => !!(d.documentoGerado),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        6: (d: any) => !!(d.enviado),
    }), [selectedLeadId]);

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
            case 2: // Agendar Visita - opcional
                return false;
            default:
                return false;
        }
    }, [currentStep, isHistoricalNavigation]);

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
                        <h2 className="text-xl font-semibold">Preparando Laudo Pontual...</h2>
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
                            <h1 className="text-2xl">OS-11: Laudo Pontual Assessoria</h1>
                            {finalOsId && <p className="text-muted-foreground">OS #{finalOsId}</p>}
                            <p className="text-sm text-muted-foreground">Emissão de Laudo Técnico Pontual</p>
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
                            <CadastrarLead
                                ref={cadastrarLeadRef}
                                selectedLeadId={selectedLeadId}
                                onSelectLead={(leadId, leadData) => {
                                    setSelectedLeadId(leadId);
                                    setStepData(1, { ...etapa1Data, leadId, leadData });
                                }}
                                showCombobox={showCombobox}
                                onShowComboboxChange={setShowCombobox}
                                showNewLeadDialog={showNewLeadDialog}
                                onShowNewLeadDialogChange={setShowNewLeadDialog}
                                formData={etapa1Data}
                                onFormDataChange={(data) => setStepData(1, { ...data, leadId: selectedLeadId })}
                                readOnly={isHistoricalNavigation}
                            />
                        )}
                        {currentStep === 2 && finalOsId && (
                            <StepAgendarVisita ref={stepAgendarVisitaRef} osId={finalOsId} data={etapa2Data} onDataChange={setEtapa2Data} readOnly={isHistoricalNavigation} />
                        )}
                        {currentStep === 3 && (
                            <StepRealizarVisita data={etapa3Data} onDataChange={setEtapa3Data} readOnly={isHistoricalNavigation} />
                        )}
                        {currentStep === 4 && (
                            <StepAnexarRT data={etapa4Data} onDataChange={setEtapa4Data} readOnly={isHistoricalNavigation} />
                        )}
                        {currentStep === 5 && (
                            <StepGerarDocumento
                                data={etapa5Data}
                                onDataChange={setEtapa5Data}
                                readOnly={isHistoricalNavigation}
                                clienteData={etapa1Data}
                                visitaData={etapa3Data}
                                rtData={etapa4Data}
                            />
                        )}
                        {currentStep === 6 && (
                            <StepEnviarCliente
                                data={etapa6Data}
                                onDataChange={setEtapa6Data}
                                readOnly={isHistoricalNavigation}
                                clienteEmail={etapa1Data.email}
                                documentoUrl={etapa5Data.urlDocumento}
                            />
                        )}
                    </div>
                </Card>
            </div>

            <WorkflowFooterWithDelegation
                currentStep={currentStep}
                totalSteps={steps.length}
                onPrevStep={handlePrevStep}
                onNextStep={handleNextStep}
                onSaveDraft={handleSaveStep}
                readOnlyMode={isHistoricalNavigation}
                onReturnToActive={handleReturnToActive}
                isLoading={isLoadingData}
                isFormInvalid={isCurrentStepInvalid}
                invalidFormMessage="Por favor, selecione um horário no calendário e um técnico responsável para continuar"
                // Props de delegação
                osType="OS-11"
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