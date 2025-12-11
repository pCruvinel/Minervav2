import { useMemo, useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from '@/lib/utils/safe-toast';
import { WorkflowStepper, WorkflowStep } from '@/components/os/shared/components/workflow-stepper';
import { WorkflowFooter } from '@/components/os/shared/components/workflow-footer';
import { CadastrarLead, CadastrarLeadHandle, FormDataCompleto } from '@/components/os/shared/steps/cadastrar-lead';
import { StepAgendarVisita } from '@/components/os/assessoria/os-11/steps/step-agendar-visita';
import { StepRealizarVisita } from '@/components/os/assessoria/os-11/steps/step-realizar-visita';
import { StepAnexarRT } from '@/components/os/assessoria/os-11/steps/step-anexar-rt';
import { StepGerarDocumento } from '@/components/os/assessoria/os-11/steps/step-gerar-documento';
import { StepEnviarCliente } from '@/components/os/assessoria/os-11/steps/step-enviar-cliente';
import { ChevronLeft } from 'lucide-react';
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '@/lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
import { useAuth } from '@/lib/contexts/auth-context';
import { useCreateOrdemServico } from '@/lib/hooks/use-ordens-servico';
import { useCentroCusto } from '@/lib/hooks/use-centro-custo';
import { ordensServicoAPI } from '@/lib/api-client';
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
    // Estado interno para osId (criado na Etapa 1 quando o cliente for selecionado/cadastrado)
    const [internalOsId, setInternalOsId] = useState<string | undefined>(propOsId);
    const finalOsId = propOsId || internalOsId;
    const [isCreatingOS, setIsCreatingOS] = useState(false);

    // Refs para validação imperativa de steps
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stepAgendarVisitaRef = useRef<any>(null);
    const cadastrarLeadRef = useRef<CadastrarLeadHandle>(null);

    // Estado para CadastrarLead
    const [showCombobox, setShowCombobox] = useState(false);
    const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);

    // Obter usuário atual para delegação
    const { currentUser } = useAuth();

    // Hook para criar OS
    const { mutate: createOS } = useCreateOrdemServico();

    // Atualizar internalOsId se prop mudar
    useEffect(() => {
        if (propOsId) setInternalOsId(propOsId);
    }, [propOsId]);

    // Função para criar OS quando o cliente for selecionado na Etapa 1
    const { createCentroCustoWithId } = useCentroCusto();

    const createOSWithClient = async (clienteId: string): Promise<string | null> => {
        if (finalOsId) return finalOsId; // Já existe uma OS

        try {
            setIsCreatingOS(true);
            logger.log('[OS11WorkflowPage] 🔧 Criando OS com cliente:', clienteId);

            // Buscar tipo de OS
            const tiposOS = await ordensServicoAPI.getTiposOS();
            const tipo = tiposOS.find((t: { codigo: string }) => t.codigo === 'OS-11');

            if (!tipo) {
                throw new Error('Tipo de OS OS-11 não encontrado no sistema');
            }

            // 1. Criar OS primeiro (sem cc_id)
            const osData = {
                tipo_os_id: tipo.id,
                status_geral: 'em_triagem' as const,
                descricao: 'OS-11: Laudo Pontual Assessoria',
                criado_por_id: currentUser?.id,
                cliente_id: clienteId,
                data_entrada: new Date().toISOString()
            };

            const newOS = await createOS(osData);
            logger.log(`[OS11WorkflowPage] ✅ OS criada: ${newOS.codigo_os} (ID: ${newOS.id})`);

            // 2. Criar Centro de Custo com MESMO ID da OS
            logger.log('[OS11WorkflowPage] 🏗️ Criando Centro de Custo com ID:', newOS.id);
            const cc = await createCentroCustoWithId(
                newOS.id, // CC terá o mesmo ID da OS
                tipo.id,
                clienteId,
                'Laudo Pontual Assessoria'
            );
            logger.log('[OS11WorkflowPage] ✅ Centro de Custo criado:', cc.nome);

            // 3. Atualizar OS com cc_id
            const { supabase } = await import('@/lib/supabase-client');
            await supabase
                .from('ordens_servico')
                .update({ cc_id: cc.id })
                .eq('id', newOS.id);

            setInternalOsId(newOS.id);
            return newOS.id;
        } catch (err) {
            logger.error('[OS11WorkflowPage] ❌ Erro ao criar OS:', err);
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
            if (!selectedLeadId) {
                toast.error('Selecione um cliente antes de continuar');
                return;
            }

            const newOsId = await createOSWithClient(selectedLeadId);
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

            <WorkflowFooter
                currentStep={currentStep}
                totalSteps={steps.length}
                onPrevStep={handlePrevStep}
                onNextStep={handleCustomNextStep}
                onSaveDraft={handleSaveStep}
                readOnlyMode={isHistoricalNavigation}
                onReturnToActive={handleReturnToActive}
                isLoading={isLoadingData || isCreatingOS}
                isFormInvalid={isCurrentStepInvalid}
                invalidFormMessage="Por favor, selecione um horário no calendário e um técnico responsável para continuar"
            />
        </div>
    );
}