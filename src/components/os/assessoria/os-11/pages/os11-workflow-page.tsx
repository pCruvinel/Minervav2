import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { WorkflowStepper, WorkflowStep } from '@/components/os/shared/components/workflow-stepper';
import { WorkflowFooter } from '@/components/os/shared/components/workflow-footer';
import { FeedbackTransferencia } from '@/components/os/shared/components/feedback-transferencia';
import { LeadCadastro, LeadCadastroHandle, LeadCompleto } from '@/components/os/shared/lead-cadastro';
import { StepAgendarVisita, StepAgendarVisitaHandle } from '@/components/os/assessoria/os-11/steps/step-agendar-visita';
import { StepRealizarVisita, StepRealizarVisitaHandle } from '@/components/os/assessoria/os-11/steps/step-realizar-visita';
import { StepAnexarRT, StepAnexarRTHandle } from '@/components/os/assessoria/os-11/steps/step-anexar-rt';
import { StepFormularioPosVisita, StepFormularioPosVisitaHandle } from '@/components/os/assessoria/os-11/steps/step-formulario-pos-visita';
import { StepGerarDocumento, StepGerarDocumentoHandle } from '@/components/os/assessoria/os-11/steps/step-gerar-documento';
import { StepEnviarCliente } from '@/components/os/assessoria/os-11/steps/step-enviar-cliente';
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '@/lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
import { useAuth } from '@/lib/contexts/auth-context';
import { useCreateOSWorkflow } from '@/lib/hooks/use-os-workflows';
import { useCentroCusto } from '@/lib/hooks/use-centro-custo';
import { logger } from '@/lib/utils/logger';
import { useTransferenciaSetor } from '@/lib/hooks/use-transferencia-setor';
import { TransferenciaInfo } from '@/types/os-setor-config';
import { OSHeaderDelegacao } from '@/components/os/shared/components/os-header-delegacao';
import { StepReadOnlyWithAdendos } from '@/components/os/shared/components/step-readonly-with-adendos';

// Sistema de Aprovação
import { AprovacaoModal } from '@/components/os/shared/components/aprovacao-modal';
import { useAprovacaoEtapa } from '@/lib/hooks/use-aprovacao-etapa';

const steps: WorkflowStep[] = [
    { id: 1, title: 'Cadastrar Cliente', short: 'Cliente', responsible: 'Assessoria', status: 'active' },
    { id: 2, title: 'Agendar Visita', short: 'Agendar', responsible: 'Assessoria', status: 'pending' },
    { id: 3, title: 'Realizar Visita', short: 'Visita', responsible: 'Técnico', status: 'pending' },
    { id: 4, title: 'Anexar RT', short: 'RT', responsible: 'Técnico', status: 'pending' },
    { id: 5, title: 'Questionário Pós-Visita', short: 'Pós-Visita', responsible: 'Engenharia', status: 'pending' },
    { id: 6, title: 'Gerar Documento', short: 'PDF', responsible: 'Sistema', status: 'pending' },
    { id: 7, title: 'Enviar ao Cliente', short: 'Envio', responsible: 'Sistema', status: 'pending' },
];

interface OS11WorkflowPageProps {
    onBack?: () => void;
    osId?: string;
    parentOSId?: string;
    clienteId?: string;
    /** Step to navigate to when opening from OS Details */
    initialStep?: number;
}

export function OS11WorkflowPage({ onBack, osId: propOsId, clienteId: propClienteId, initialStep }: OS11WorkflowPageProps) {
    // Estado interno para osId (criado na Etapa 1 quando o cliente for selecionado/cadastrado)
    const [internalOsId, setInternalOsId] = useState<string | undefined>(propOsId);
    const finalOsId = propOsId || internalOsId;
    const [isCreatingOS, setIsCreatingOS] = useState(false);

    // Estado para feedback de transferência de setor
    const [isTransferenciaModalOpen, setIsTransferenciaModalOpen] = useState(false);
    const [transferenciaInfo, setTransferenciaInfo] = useState<TransferenciaInfo | null>(null);

    // Estado para modal de aprovação
    const [isAprovacaoModalOpen, setIsAprovacaoModalOpen] = useState(false);
    const [etapaNomeParaAprovacao, setEtapaNomeParaAprovacao] = useState('');

    // Hook de transferência
    const { executarTransferencia } = useTransferenciaSetor();

    // Refs para validação imperativa de steps
    const leadCadastroRef = useRef<LeadCadastroHandle>(null);
    const stepAgendarVisitaRef = useRef<StepAgendarVisitaHandle>(null);
    const stepRealizarVisitaRef = useRef<StepRealizarVisitaHandle>(null);
    const stepAnexarRTRef = useRef<StepAnexarRTHandle>(null);
    const stepFormularioPosVisitaRef = useRef<StepFormularioPosVisitaHandle>(null);
    const stepGerarDocumentoRef = useRef<StepGerarDocumentoHandle>(null);

    // Obter usuário atual para delegação
    const { currentUser } = useAuth();

    // Hook para criar OS (com etapas)
    const { mutate: createOSWorkflow } = useCreateOSWorkflow();

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

            // Mapear etapas para o formato esperado pela API
            const etapasPayload = steps.map(step => ({
                nome_etapa: step.title,
                ordem: step.id,
                status: step.id === 1 ? 'concluida' : 'pendente', // Force Step 1 as completed on creation
                dados_etapa: step.id === 1 ? { leadId: clienteId } : {} // Save minimal data for Step 1
            }));

            // 1. Criar OS + Etapas (passando ccId como string vazia inicialmente)
            const result = await createOSWorkflow({
                tipoOSCodigo: 'OS-11',
                clienteId,
                ccId: '', // Será atualizado após criar o CC
                responsavelId: currentUser?.id || null,
                descricao: 'OS-11: Laudo Pontual Assessoria',
                metadata: {},
                etapas: etapasPayload
            });

            // O hook useCreateOSWorkflow (useMutation) retorna o resultado do apiCall que é Promise<{ os: ..., etapas: ... }>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newOS = result.os as any;

            logger.log(`[OS11WorkflowPage] ✅ OS criada: ${newOS.codigo_os} (ID: ${newOS.id})`);

            // 2. Criar Centro de Custo com MESMO ID da OS
            logger.log('[OS11WorkflowPage] 🏗️ Criando Centro de Custo com ID:', newOS.id);
            const cc = await createCentroCustoWithId(
                newOS.id as string, // CC terá o mesmo ID da OS
                newOS.tipo_os_id as string,
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

            // 4. Force update Step 1 to 'concluida' IMMEDIATELY (Pattern from OS 5-6)
            // This ensures the database reflects the completion even before navigation
            const etapa1 = (result.etapas as Array<{ id: string; ordem: number }>)?.find(e => e.ordem === 1);
            if (etapa1?.id) {
                await supabase.from('os_etapas').update({
                    status: 'concluida',
                    // Save full data if available, or minimal
                    dados_etapa: formDataByStep[1] || { leadId: clienteId }, 
                    data_conclusao: new Date().toISOString(),
                }).eq('id', etapa1.id);
                logger.log('[OS11WorkflowPage] ✅ Etapa 1 marcada como concluída via update direto');
            }

            setInternalOsId(newOS.id as string);
            return newOS.id as string;
        } catch (err) {
            logger.error('[OS11WorkflowPage] ❌ Erro ao criar OS:', err);
            // Toast já exibido pelo hook
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
        totalSteps: steps.length,
        initialStep
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

    // Hook de aprovação de etapa (depois que currentStep é definido)
    const { aprovacaoInfo } = useAprovacaoEtapa(finalOsId, currentStep);

    // Estado para o leadId selecionado (CadastrarLead)
    // ✅ Pré-selecionar cliente se vier da OS pai
    const [selectedLeadId, setSelectedLeadId] = useState<string>(formDataByStep[1]?.leadId || propClienteId || '');

    // Pré-selecionar cliente quando clienteId é fornecido via prop (vindo de OS pai)
    const hasPreselectedClient = useRef(false);
    useEffect(() => {
        if (propClienteId && !hasPreselectedClient.current && !selectedLeadId) {
            logger.log('🔗 [OS11] Pré-selecionando cliente da OS pai:', propClienteId);
            setSelectedLeadId(propClienteId);
            setStepData(1, { ...formDataByStep[1], leadId: propClienteId });
            hasPreselectedClient.current = true;
        }
    }, [propClienteId]);

    // Etapa 1: LeadCadastro Data
    const etapa1Data = formDataByStep[1] || null;

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

    // Etapa 5: Questionário Pós-Visita (NOVA com FinalidadeInspecao)
    const etapa5Data = formDataByStep[5] || {
        finalidadeInspecao: '',
        pontuacaoEngenheiro: '',
        pontuacaoMorador: '',
        areaVistoriada: '',
        manifestacaoPatologica: '',
        recomendacoesPrevias: '',
        gravidade: '',
        origemNBR: '',
        observacoesGerais: '',
        resultadoVisita: '',
        justificativa: '',
        fotosLocal: [],
        checklistRecebimento: undefined,
    };

    // Etapa 6: Gerar Documento (ANTIGA 5)
    const etapa6Data = formDataByStep[6] || {
        documentoGerado: false,
        documentoUrl: '',
    };

    // Etapa 7: Enviar ao Cliente (ANTIGA 6)
    const etapa7Data = formDataByStep[7] || {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setEtapa7Data = (d: any) => setStepData(7, d);

    const completionRules = useMemo(() => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        1: (d: any) => !!(d?.identificacao?.nome && d?.identificacao?.cpfCnpj && selectedLeadId),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        2: (d: any) => !!(d.dataVisita && d.tecnicoResponsavel),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        3: (d: any) => !!(d.visitaRealizada),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        4: (d: any) => !!(d.arquivoRT && d.numeroRT),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        5: (d: any) => {
             // Validação básica se é recebimento ou parecer
            const isRecebimento = d.finalidadeInspecao === 'recebimento_unidade';
             if (isRecebimento) {
                 // Verificar se checklist tem itens (se checklistRecebimento existe)
                 // A validação rigorosa é feita no componente, aqui apenas checamos a presença do objeto
                 return !!d.checklistRecebimento; 
             }
             // Se for parecer, verificar campos obrigatórios
             return !!(d.manifestacaoPatologica && d.gravidade);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        6: (d: any) => !!(d.documentoGerado),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        7: (d: any) => !!(d.enviado),
    }), [selectedLeadId]);

    const { completedSteps } = useWorkflowCompletion({
        currentStep,
        formDataByStep,
        completionRules,
        completedStepsFromHook
    });


    // Handler customizado para o avanço da etapa 1 (criar OS com cliente)
    const handleCustomNextStep = async () => {
        logger.log(`[OS11WorkflowPage] 🚀 handleCustomNextStep chamado. Step: ${currentStep}`);
        
        // Validação da Etapa 2
        // Validação e Salvamento da Etapa 2
        if (currentStep === 2 && stepAgendarVisitaRef.current) {
            if (!stepAgendarVisitaRef.current.validate()) return;
            
            // Salvar dados da etapa 2 explicitamente
            // Nota: Se o componente StepAgendarVisita tiver método salvar(), use-o.
            // Caso contrário, use saveStep(2).
            // Olhando o código, StepAgendarVisita expõe validate() e isFormValid().
            // Então usamos saveStep(2) global.
            await saveStep(2, false); // FIX: Mark as completed (isDraft=false)
        }

        // Validação da Etapa 3
        if (currentStep === 3 && stepRealizarVisitaRef.current) {
            if (!stepRealizarVisitaRef.current.validate()) return;
        }

        // Validação da Etapa 4
        if (currentStep === 4 && stepAnexarRTRef.current) {
            if (!stepAnexarRTRef.current.validate()) return;
        }

        // Na Etapa 1, precisamos criar a OS antes de avançar
        if (currentStep === 1) {
            if (!leadCadastroRef.current) return;

            const saved = await leadCadastroRef.current.save();
            if (!saved) return;

            // Se for string, é o ID (novo ou existente)
            const savedId = saved;

            if (savedId && !finalOsId) {
                const createdId = await createOSWithClient(savedId);
                if (!createdId) return;
                
                // Atualizar ID interno
                if (!propOsId) setInternalOsId(createdId);

                // CRITICAL FIX: Avançar manualmente o estado para evitar que handleNextStep()
                // chame onSaveStep() com o osId antigo (null/undefined) devido ao atraso do React State.
                // Como createOSWithClient já salva os dados iniciais no banco, não precisamos salvar de novo agora.
                setCurrentStep((prev) => prev + 1);
                setLastActiveStep((prev) => Math.max((prev || 0), currentStep + 1));
                
                // NOTA: Ao renderizar o Step 2, ele usará o internalOsId que acabamos de setar? 
                // O React pode não refletir 'internalOsId' na próxima linha de renderização síncrona,
                // mas o setter dispara um re-render.
                // Se setCurrentStep também dispara re-render, teremos updates em batch ou sequenciais.
                // O componente da página vai re-renderizar com currentStep=2 e finalOsId=createdId.
                return; 
            }
            
            // Se já tínhamos OS (edição), aí sim salvamos explicitamente e usamos navegação padrão
            if (finalOsId) {
                await saveStep(1, false); // FIX: Mark as completed (isDraft=false)
                handleNextStep(); 
            }
        }
        
        // Na Etapa 5 (Pós-Visita), garantir validação, salvamento e uploads antes de prosseguir
        if (currentStep === 5 && stepFormularioPosVisitaRef.current) {
             const isValid = stepFormularioPosVisitaRef.current.validate();
             if (!isValid) return;

             const salvoComSucesso = await stepFormularioPosVisitaRef.current.salvar();
             if (!salvoComSucesso) return;
        }

        // Validação da Etapa 6
        if (currentStep === 6 && stepGerarDocumentoRef.current) {
             if (!stepGerarDocumentoRef.current.validate()) return;
        }

        // Verificar transferência de setor (OS-11 não tem handoffs, mas mantemos por consistência)
        if (finalOsId && currentStep < steps.length) {
            const nextStep = currentStep + 1;
            const resultado = await executarTransferencia({
                osId: finalOsId,
                osType: 'OS-11',
                etapaAtual: currentStep,
                proximaEtapa: nextStep,
                clienteNome: (etapa1Data?.nome as string) || 'Cliente',
                codigoOS: undefined
            });

            if (resultado.success && resultado.transferencia) {
                setTransferenciaInfo(resultado.transferencia);
                setIsTransferenciaModalOpen(true);
                return;
            }
        }

        // Verificação de Aprovação
        if (aprovacaoInfo?.requerAprovacao && aprovacaoInfo.statusAprovacao !== 'aprovada') {
            const etapaNome = steps.find(s => s.id === currentStep)?.title || `Etapa ${currentStep}`;

            if (aprovacaoInfo.statusAprovacao === 'pendente' || aprovacaoInfo.statusAprovacao === 'rejeitada') {
                setEtapaNomeParaAprovacao(etapaNome);
                setIsAprovacaoModalOpen(true);
                return;
            }

            if (aprovacaoInfo.statusAprovacao === 'solicitada') {
                toast.info('Aguardando aprovação do Coordenador.');
                return;
            }
        }

        // Chamar o handler normal de navegação
        handleNextStep();
    };
    
    const handleSaveStep = async () => {
        try {
            if (finalOsId) {
                // Se for etapa 5 (Pós-Visita), chamar o save do ref para garantir upload
                if (currentStep === 5 && stepFormularioPosVisitaRef.current) {
                    await stepFormularioPosVisitaRef.current.salvar();
                }
                
                await saveStep(currentStep, true);
                toast.success('Dados salvos com sucesso!');
            }
        } catch {
            toast.error('Erro ao salvar dados');
        }
    };

    // Renderiza o conteúdo do step atual
    const renderStepContent = () => {
        if (isLoadingData) {
            return (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            );
        }

        /* 
           Lógica de Read-Only e Histórico:
           - Se a etapa já foi completada (está no array completedSteps) OU a OS inteira é readOnly -> isGlobalReadOnly = true
           - Se a etapa tem um ID (já foi salva no banco), envolvemos com StepReadOnlyWithAdendos para mostrar histórico
        */
        const isStepCompleted = completedStepsFromHook.includes(currentStep);
        const isGlobalReadOnly = isHistoricalNavigation || isStepCompleted;

        // Buscar dados da etapa atual para ter o ID (necessário para Adendos)
        const stepEtapa = formDataByStep[currentStep]?.id 
            ? { id: formDataByStep[currentStep].id } 
            : null;
        
        // Helper para envolver com Adendos
        const withAdendos = (content: React.ReactNode) => {
            if (stepEtapa?.id) {
                return (
                    <StepReadOnlyWithAdendos
                        etapaId={stepEtapa.id}
                        readonly={isGlobalReadOnly}
                    >
                        {content}
                    </StepReadOnlyWithAdendos>
                );
            }
            return content;
        };

        switch (currentStep) {
            case 1:
                return withAdendos(
                    <LeadCadastro
                        ref={leadCadastroRef}
                        selectedLeadId={selectedLeadId}
                        onLeadChange={(leadId: string, leadData?: LeadCompleto) => {
                            setSelectedLeadId(leadId);
                            if (leadData) {
                                setStepData(1, {
                                    ...etapa1Data,
                                    leadId,
                                    leadData,
                                    nome: leadData.identificacao.nome,
                                    email: leadData.identificacao.email,
                                    telefone: leadData.identificacao.telefone,
                                    cpfCnpj: leadData.identificacao.cpfCnpj
                                });
                            } else {
                                setStepData(1, { ...etapa1Data, leadId });
                            }
                        }}
                        initialData={etapa1Data}
                        readOnly={isGlobalReadOnly}
                        statusFilter="cliente"
                    />
                );
            case 2:
                // Se já temos OS criada (Step 1 passou), passamos o ID para o calendário saber
                return withAdendos(
                    <StepAgendarVisita
                        ref={stepAgendarVisitaRef}
                        data={etapa2Data}
                        onDataChange={setEtapa2Data}
                        readOnly={isGlobalReadOnly}
                        osId={finalOsId || undefined}
                    />
                );
            case 3:
                return withAdendos(
                    <StepRealizarVisita
                        ref={stepRealizarVisitaRef}
                        data={etapa3Data}
                        onDataChange={setEtapa3Data}
                        readOnly={isGlobalReadOnly}
                        osId={finalOsId || undefined}
                    />
                );
            case 4:
                return withAdendos(
                    <StepAnexarRT
                        ref={stepAnexarRTRef}
                        data={etapa4Data}
                        onDataChange={setEtapa4Data}
                        readOnly={isGlobalReadOnly}
                    />
                );
            case 5:
                return withAdendos(
                    <StepFormularioPosVisita
                        ref={stepFormularioPosVisitaRef}
                        data={etapa5Data}
                        onDataChange={setEtapa5Data}
                        readOnly={isGlobalReadOnly}
                        osId={finalOsId || undefined} 
                    />
                );
            case 6:
                return withAdendos(
                    <StepGerarDocumento
                        ref={stepGerarDocumentoRef}
                        data={etapa6Data}
                        onDataChange={setEtapa6Data}
                        readOnly={isGlobalReadOnly}
                        osId={finalOsId || undefined}
                        etapa1Data={etapa1Data}
                        etapa2Data={etapa2Data}
                        etapa5Data={etapa5Data}
                    />
                );
            case 7: 
                return withAdendos(
                    <StepEnviarCliente
                        data={etapa7Data}
                        onDataChange={setEtapa7Data}
                        readOnly={isGlobalReadOnly}
                        clienteEmail={etapa1Data?.email}
                        documentoUrl={etapa6Data.documentoUrl}
                    />
                );
            default:
                return <div>Etapa não encontrada</div>;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="bg-white border-b border-border">
                <div className="px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {onBack && (
                                <Button
                                    variant="ghost"
                                    onClick={onBack}
                                    className="flex items-center gap-2"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    <span>Voltar</span>
                                </Button>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold">OS-11: Laudo Pontual Assessoria</h1>
                                {finalOsId && <p className="text-muted-foreground">OS #{finalOsId}</p>}
                                <p className="text-sm text-muted-foreground">Emissão de Laudo Técnico Pontual</p>
                            </div>
                        </div>

                        {finalOsId && (
                            <div className="min-w-[280px]">
                                <OSHeaderDelegacao
                                    osId={finalOsId}
                                    tipoOS="OS-11"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative border-t border-border/50">
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
                        {renderStepContent()}
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
                isFormInvalid={false} // Validation is now imperative via toast
            />

            {/* Modal de Feedback de Transferência */}
            {transferenciaInfo && (
                <FeedbackTransferencia
                    isOpen={isTransferenciaModalOpen}
                    onClose={() => setIsTransferenciaModalOpen(false)}
                    transferencia={transferenciaInfo}
                    osId={finalOsId || ''}
                />
            )}

            {/* Modal de Aprovação de Etapa */}
            {finalOsId && (
                <AprovacaoModal
                    open={isAprovacaoModalOpen}
                    onOpenChange={setIsAprovacaoModalOpen}
                    osId={finalOsId}
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