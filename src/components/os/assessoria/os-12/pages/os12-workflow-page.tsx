/**
 * OS12WorkflowPage - Start de Contrato - Assessoria Anual
 * 
 * Workflow de 8 etapas:
 * 1. Cadastro do Cliente e Portal
 * 2. Upload de ART
 * 3. Upload de Plano de Manutenção
 * 4. Agendar Visita
 * 5. Realizar Visita
 * 6. Agendar Visita Recorrente
 * 7. Realizar Visita Recorrente
 * 8. Concluir e Transformar em Contrato
 */

import { useMemo, useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from '@/lib/utils/safe-toast';
import { WorkflowStepper, WorkflowStep } from '@/components/os/shared/components/workflow-stepper';
import { WorkflowFooter } from '@/components/os/shared/components/workflow-footer';
import { FeedbackTransferencia } from '@/components/os/shared/components/feedback-transferencia';
import {
    StepCadastroClientePortal,
    StepAnexarART,
    StepPlanoManutencao,
    StepAgendarVisita,
    StepRealizarVisita,
    StepAgendarVisitaRecorrente,
    StepRealizarVisitaRecorrente,
    StepConcluirContrato,
    type StepCadastroClientePortalHandle
} from '@/components/os/assessoria/os-12/steps';
import { ChevronLeft } from 'lucide-react';
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '@/lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
import { useAuth } from '@/lib/contexts/auth-context';
import { useCreateOrdemServico } from '@/lib/hooks/use-ordens-servico';
import { useCentroCusto } from '@/lib/hooks/use-centro-custo';
import { ordensServicoAPI } from '@/lib/api-client';
import { logger } from '@/lib/utils/logger';
import { useTransferenciaSetor } from '@/lib/hooks/use-transferencia-setor';
import { TransferenciaInfo } from '@/types/os-setor-config';

const steps: WorkflowStep[] = [
    { id: 1, title: 'Cadastro do Cliente e Portal', short: 'Cliente', responsible: 'Administrativo', status: 'active' },
    { id: 2, title: 'Upload de ART', short: 'ART', responsible: 'Assessoria', status: 'pending' },
    { id: 3, title: 'Upload de Plano de Manutenção', short: 'Plano', responsible: 'Assessoria', status: 'pending' },
    { id: 4, title: 'Agendar Visita', short: 'Agendar', responsible: 'Administrativo', status: 'pending' },
    { id: 5, title: 'Realizar Visita', short: 'Visita', responsible: 'Administrativo', status: 'pending' },
    { id: 6, title: 'Agendar Visita Recorrente', short: 'Recorrente', responsible: 'Administrativo', status: 'pending' },
    { id: 7, title: 'Realizar Visita Recorrente', short: 'Realizar', responsible: 'Assessoria', status: 'pending' },
    { id: 8, title: 'Concluir e Ativar Contrato', short: 'Concluir', responsible: 'Assessoria', status: 'pending' },
];

interface OS12WorkflowPageProps {
    onBack?: () => void;
    osId?: string;
    parentOSId?: string;
    clienteId?: string;
}

export function OS12WorkflowPage({ onBack, osId: propOsId, parentOSId: _parentOSId, clienteId: propClienteId }: OS12WorkflowPageProps) {
    // Estado interno para osId
    const [internalOsId, setInternalOsId] = useState<string | undefined>(propOsId);
    const finalOsId = propOsId || internalOsId;
    const [isCreatingOS, setIsCreatingOS] = useState(false);

    // Estado para feedback de transferência de setor
    const [isTransferenciaModalOpen, setIsTransferenciaModalOpen] = useState(false);
    const [transferenciaInfo, setTransferenciaInfo] = useState<TransferenciaInfo | null>(null);

    // Hook de transferência
    const { executarTransferencia } = useTransferenciaSetor();

    // Ref para validação da Etapa 1
    const stepCadastroRef = useRef<StepCadastroClientePortalHandle>(null);

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
        if (finalOsId) return finalOsId;

        try {
            setIsCreatingOS(true);
            logger.log('[OS12WorkflowPage] 🔧 Criando OS com cliente:', clienteId);

            const tiposOS = await ordensServicoAPI.getTiposOS();
            const tipo = tiposOS.find((t: { codigo: string }) => t.codigo === 'OS-12');

            if (!tipo) {
                throw new Error('Tipo de OS OS-12 não encontrado no sistema');
            }

            // 1. Criar OS primeiro (sem cc_id)
            const osData = {
                tipo_os_id: tipo.id,
                status_geral: 'em_triagem' as const,
                descricao: 'OS-12: Start de Contrato - Assessoria Anual',
                criado_por_id: currentUser?.id,
                cliente_id: clienteId,
                data_entrada: new Date().toISOString()
            };

            const newOS = await createOS(osData);
            logger.log(`[OS12WorkflowPage] ✅ OS criada: ${newOS.codigo_os} (ID: ${newOS.id})`);

            // 2. Criar Centro de Custo com MESMO ID da OS
            logger.log('[OS12WorkflowPage] 🏗️ Criando Centro de Custo com ID:', newOS.id);
            const cc = await createCentroCustoWithId(
                newOS.id, // CC terá o mesmo ID da OS
                tipo.id,
                clienteId,
                'Contrato Assessoria Anual'
            );
            logger.log('[OS12WorkflowPage] ✅ Centro de Custo criado:', cc.nome);

            // 3. Atualizar OS com cc_id
            const { supabase } = await import('@/lib/supabase-client');
            await supabase
                .from('ordens_servico')
                .update({ cc_id: cc.id })
                .eq('id', newOS.id);

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

    // Data para cada etapa
    // ✅ Pré-selecionar cliente se vier da OS pai
    const etapa1Data = formDataByStep[1] || { clienteId: propClienteId || '', senhaPortal: '', documentos: [] };

    // Pré-selecionar cliente quando clienteId é fornecido via prop (vindo de OS pai)
    const hasPreselectedClient = useRef(false);
    useEffect(() => {
        if (propClienteId && !hasPreselectedClient.current && !etapa1Data.clienteId) {
            logger.log('🔗 [OS12] Pré-selecionando cliente da OS pai:', propClienteId);
            setStepData(1, { ...formDataByStep[1], clienteId: propClienteId });
            hasPreselectedClient.current = true;
        }
    }, [propClienteId]);
    const etapa2Data = formDataByStep[2] || { arquivos: [] };
    const etapa3Data = formDataByStep[3] || { arquivos: [], descricao: '' };
    const etapa4Data = formDataByStep[4] || { dataVisita: '', horaVisita: '', localVisita: '' };
    const etapa5Data = formDataByStep[5] || { visitaRealizada: false, dataRealizacao: '', horaRealizacao: '' };
    const etapa6Data = formDataByStep[6] || { frequencia: '', proximaVisita: '', diasSemana: [] };
    const etapa7Data = formDataByStep[7] || { visitaAtualRealizada: false, historicoVisitas: [] };
    const etapa8Data = formDataByStep[8] || { contratoAtivo: false, confirmacaoTermos: false };

    const setEtapa1Data = (d: any) => setStepData(1, d);
    const setEtapa2Data = (d: any) => setStepData(2, d);
    const setEtapa3Data = (d: any) => setStepData(3, d);
    const setEtapa4Data = (d: any) => setStepData(4, d);
    const setEtapa5Data = (d: any) => setStepData(5, d);
    const setEtapa6Data = (d: any) => setStepData(6, d);
    const setEtapa7Data = (d: any) => setStepData(7, d);
    const setEtapa8Data = (d: any) => setStepData(8, d);

    // Regras de completude para cada etapa
    const completionRules = useMemo(() => ({
        1: (d: any) => !!(d.clienteId && d.senhaPortal && d.senhaPortal.length >= 8),
        2: (d: any) => !!(d.arquivos && d.arquivos.length > 0),
        3: (d: any) => !!(d.arquivos && d.arquivos.length > 0),
        4: (d: any) => !!(d.dataVisita && d.horaVisita),
        5: (d: any) => !!(d.visitaRealizada),
        6: (d: any) => !!(d.frequencia && d.proximaVisita),
        7: (d: any) => !!(d.visitaAtualRealizada || (d.historicoVisitas && d.historicoVisitas.length > 0)),
        8: (d: any) => !!(d.contratoAtivo && d.confirmacaoTermos),
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
            // Validar etapa 1
            if (stepCadastroRef.current && !stepCadastroRef.current.validate()) {
                return;
            }

            const clienteId = etapa1Data.clienteId;
            if (!clienteId) {
                toast.error('Selecione um cliente antes de continuar');
                return;
            }

            // Capturar dados antes de criar OS (importante! o hook reinicializa após osId mudar)
            const dadosEtapa1 = { ...etapa1Data };

            const newOsId = await createOSWithClient(clienteId);
            if (!newOsId) {
                return; // Erro na criação
            }

            // Aguardar um tick para o hook reconhecer o novo osId e criar etapas
            await new Promise(resolve => setTimeout(resolve, 500));

            // Salvar dados da etapa 1 passando explicitamente os dados capturados
            // O hook já suporta explicitData como 3º parâmetro
            // isDraft=false significa NÃO é rascunho → markAsComplete=true (concluída)
            await saveStep(1, false, dadosEtapa1);

            // Forçar avanço para etapa 2
            setCurrentStep(2);
            toast.success('Cliente cadastrado! Avançando para ART...', { icon: '✅' });
            return;
        }

        // Para outras etapas, verificar transferência de setor
        if (finalOsId && currentStep < steps.length) {
            const nextStep = currentStep + 1;
            const resultado = await executarTransferencia({
                osId: finalOsId,
                osType: 'OS-12',
                etapaAtual: currentStep,
                proximaEtapa: nextStep,
                clienteNome: (etapa1Data.clienteNome as string) || 'Cliente',
                codigoOS: undefined
            });

            if (resultado.success && resultado.transferencia) {
                setTransferenciaInfo(resultado.transferencia);
                setIsTransferenciaModalOpen(true);
                return;
            }
        }

        // Handler normal de navegação
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
                            <h1 className="text-2xl">OS-12: Start de Contrato - Assessoria Anual</h1>
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
                            <StepCadastroClientePortal
                                ref={stepCadastroRef}
                                data={etapa1Data}
                                onDataChange={setEtapa1Data}
                                readOnly={isHistoricalNavigation}
                                osId={finalOsId}
                            />
                        )}
                        {currentStep === 2 && (
                            <StepAnexarART
                                data={etapa2Data}
                                onDataChange={setEtapa2Data}
                                readOnly={isHistoricalNavigation}
                                osId={finalOsId}
                            />
                        )}
                        {currentStep === 3 && (
                            <StepPlanoManutencao
                                data={etapa3Data}
                                onDataChange={setEtapa3Data}
                                readOnly={isHistoricalNavigation}
                                osId={finalOsId}
                            />
                        )}
                        {currentStep === 4 && (
                            <StepAgendarVisita
                                data={etapa4Data}
                                onDataChange={setEtapa4Data}
                                readOnly={isHistoricalNavigation}
                            />
                        )}
                        {currentStep === 5 && (
                            <StepRealizarVisita
                                data={etapa5Data}
                                onDataChange={setEtapa5Data}
                                readOnly={isHistoricalNavigation}
                            />
                        )}
                        {currentStep === 6 && (
                            <StepAgendarVisitaRecorrente
                                data={etapa6Data}
                                onDataChange={setEtapa6Data}
                                readOnly={isHistoricalNavigation}
                            />
                        )}
                        {currentStep === 7 && (
                            <StepRealizarVisitaRecorrente
                                data={etapa7Data}
                                onDataChange={setEtapa7Data}
                                readOnly={isHistoricalNavigation}
                            />
                        )}
                        {currentStep === 8 && (
                            <StepConcluirContrato
                                data={etapa8Data}
                                onDataChange={setEtapa8Data}
                                readOnly={isHistoricalNavigation}
                                clienteNome={etapa1Data.clienteNome}
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
        </div>
    );
}