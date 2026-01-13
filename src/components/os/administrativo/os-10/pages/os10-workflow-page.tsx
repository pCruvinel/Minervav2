import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { toast } from '@/lib/utils/safe-toast';
import { WorkflowStepper, WorkflowStep } from '@/components/os/shared/components/workflow-stepper';
import { WorkflowFooter } from '@/components/os/shared/components/workflow-footer';
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
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/utils/logger';

// Sistema de Aprovação
import { AprovacaoModal } from '@/components/os/shared/components/aprovacao-modal';
import { useAprovacaoEtapa } from '@/lib/hooks/use-aprovacao-etapa';

// Definição das etapas da OS-10 (4 etapas) - para criação no banco
const OS10_ETAPAS = [
    { ordem: 1, nome_etapa: 'Abertura da Solicitação' },
    { ordem: 2, nome_etapa: 'Seleção do Centro de Custo' },
    { ordem: 3, nome_etapa: 'Gerenciador de Vagas' },
    { ordem: 4, nome_etapa: 'Revisão e Envio' },
];

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
    const navigate = useNavigate();

    // Estado para modal de aprovação
    const [isAprovacaoModalOpen, setIsAprovacaoModalOpen] = useState(false);
    const [etapaNomeParaAprovacao, setEtapaNomeParaAprovacao] = useState('');

    // Obter usuário atual para delegação
    const { currentUser } = useAuth();

    // Atualizar internalOsId se prop mudar
    useEffect(() => {
        if (propOsId) setInternalOsId(propOsId);
    }, [propOsId]);

    /**
     * ✅ FIX: Criar OS-10 com etapas usando Supabase diretamente
     * Similar ao padrão de OS-09 que funciona corretamente
     */
    const createOSWithCC = async (centroCustoId: string): Promise<string | null> => {
        if (finalOsId) return finalOsId; // Já existe uma OS

        try {
            setIsCreatingOS(true);
            logger.log('[OS10WorkflowPage] 🔧 Criando OS-10 com CC:', centroCustoId);

            // 1. Buscar dados do Centro de Custo (pode ser fixo ou variável)
            const { data: ccData, error: ccError } = await supabase
                .from('centros_custo')
                .select('cliente_id, tipo')
                .eq('id', centroCustoId)
                .single();

            if (ccError || !ccData) {
                throw new Error('Centro de custo não encontrado');
            }

            // CCs fixos não têm cliente_id, CCs variáveis têm
            const clienteId = ccData.cliente_id || null;

            // 2. Buscar tipo de OS-10
            const { data: tipoOS, error: tipoOSError } = await supabase
                .from('tipos_os')
                .select('*')
                .eq('codigo', 'OS-10')
                .single();

            if (tipoOSError || !tipoOS) {
                throw new Error('Tipo de OS OS-10 não encontrado no sistema');
            }

            // 3. Criar OS (cliente_id é opcional para CCs fixos)
            const { data: osData, error: osError } = await supabase
                .from('ordens_servico')
                .insert({
                    tipo_os_id: tipoOS.id,
                    status_geral: 'em_triagem',
                    descricao: 'OS-10: Requisição de Mão de Obra',
                    criado_por_id: currentUser?.id,
                    cliente_id: clienteId,
                    cc_id: centroCustoId,
                    data_entrada: new Date().toISOString()
                })
                .select()
                .single();

            if (osError) throw osError;

            logger.log(`[OS10WorkflowPage] ✅ OS criada: ${osData.codigo_os} (ID: ${osData.id})`);

            // 4. ✅ CRÍTICO: Criar etapas da OS-10
            const etapasParaInserir = OS10_ETAPAS.map((etapa, index) => ({
                os_id: osData.id,
                nome_etapa: etapa.nome_etapa,
                ordem: etapa.ordem,
                status: index === 0 ? 'em_andamento' : 'pendente',
                dados_etapa: {}
            }));

            const { error: etapasError } = await supabase
                .from('os_etapas')
                .insert(etapasParaInserir);

            if (etapasError) {
                logger.error('[OS10WorkflowPage] ❌ Erro ao criar etapas:', etapasError);
                throw etapasError;
            }

            logger.log(`[OS10WorkflowPage] ✅ ${etapasParaInserir.length} etapas criadas`);

            // 5. ✅ Salvar dados da etapa 1 (Abertura) com dados do solicitante
            const { data: etapa1Criada } = await supabase
                .from('os_etapas')
                .select('id')
                .eq('os_id', osData.id)
                .eq('ordem', 1)
                .single();

            if (etapa1Criada?.id) {
                const dadosEtapa1 = {
                    dataAbertura: new Date().toISOString(),
                    solicitante: currentUser?.nome_completo || '',
                    solicitanteId: currentUser?.id || '',
                    departamento: currentUser?.setor_slug || '',
                    urgencia: formDataByStep[1]?.urgencia || 'normal',
                    justificativa: formDataByStep[1]?.justificativa || ''
                };

                await supabase
                    .from('os_etapas')
                    .update({ dados_etapa: dadosEtapa1 })
                    .eq('id', etapa1Criada.id);

                logger.log('[OS10WorkflowPage] ✅ Dados da etapa 1 salvos');
            }

            // 6. ✅ Salvar dados da etapa 2 (Centro de Custo)
            const { data: etapa2Criada } = await supabase
                .from('os_etapas')
                .select('id')
                .eq('os_id', osData.id)
                .eq('ordem', 2)
                .single();

            if (etapa2Criada?.id) {
                const dadosEtapa2 = {
                    centroCusto: centroCustoId,
                    centroCustoNome: formDataByStep[2]?.centroCustoNome || '',
                    obraVinculada: formDataByStep[2]?.obraVinculada || ''
                };

                await supabase
                    .from('os_etapas')
                    .update({ dados_etapa: dadosEtapa2 })
                    .eq('id', etapa2Criada.id);

                logger.log('[OS10WorkflowPage] ✅ Dados da etapa 2 salvos');
            }

            setInternalOsId(osData.id);

            // 7. ✅ Navegar para URL com osId (forçar remontagem com etapas carregadas)
            navigate({
                to: '/os/criar/requisicao-mao-de-obra',
                search: { osId: osData.id },
                replace: true
            });

            return osData.id;
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

    // Hook de aprovação de etapa (depois que currentStep é definido)
    const { aprovacaoInfo } = useAprovacaoEtapa(finalOsId, currentStep);

    // Mapeamento de dados para compatibilidade - Etapa 1: Abertura
    const etapa1Data = formDataByStep[1] || {
        dataAbertura: new Date().toISOString(),
        solicitante: currentUser?.nome_completo || '',
        solicitanteId: currentUser?.id || '',
        departamento: currentUser?.setor_slug || '',
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

    // Handler customizado para o avanço de etapas
    const handleCustomNextStep = async () => {
        // Etapa 1: Avançar sem salvar (não existe OS ainda)
        // Validar campos obrigatórios
        if (currentStep === 1) {
            if (!etapa1Data.justificativa?.trim()) {
                toast.error('Preencha a justificativa da contratação');
                return;
            }
            // Avançar diretamente para Etapa 2 sem chamar handleNextStep
            // (handleNextStep chama onSaveStep que requer osId)
            setCurrentStep(2);
            toast.success('Etapa concluída!', { icon: '✅' });
            return;
        }

        // Etapa 2: Criar OS com CC selecionado
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

            // ✅ As etapas já foram criadas e salvas dentro de createOSWithCC
            // A navegação com replace: true já foi feita, o componente vai remontar
            toast.success('Solicitação criada! Agora você pode adicionar vagas.');
            return; // O navigate já foi feito em createOSWithCC
        }

        // Verificação de Aprovação (Etapa 2: Consolidação de Dados requer aprovação)
        if (aprovacaoInfo?.requerAprovacao && aprovacaoInfo.statusAprovacao !== 'aprovada') {
            const etapaNome = steps.find(s => s.id === currentStep)?.title || `Etapa ${currentStep}`;

            if (aprovacaoInfo.statusAprovacao === 'pendente' || aprovacaoInfo.statusAprovacao === 'rejeitada') {
                setEtapaNomeParaAprovacao(etapaNome);
                setIsAprovacaoModalOpen(true);
                return;
            }

            if (aprovacaoInfo.statusAprovacao === 'solicitada') {
                toast.info('Aguardando aprovação do RH.');
                return;
            }
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
                                currentUser={currentUser ? {
                                    id: currentUser.id,
                                    nome_completo: currentUser.nome_completo,
                                    setor_slug: currentUser.setor_slug
                                } : undefined}
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