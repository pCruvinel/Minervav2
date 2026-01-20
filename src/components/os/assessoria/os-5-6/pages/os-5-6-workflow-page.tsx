/**
 * OS56WorkflowPage - Workflow de Assessoria Lead (OS-05 e OS-06)
 * 
 * Implementa o Sistema de Stepper Horizontal para OS de Assessoria.
 * Padrão unificado baseado em OS-08.
 * 
 * @version 2.0.0 (Migração Stepper)
 * @date 2026-01-20
 */
"use client";

import { logger } from '@/lib/utils/logger';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/lib/utils/safe-toast';
import { supabase } from '@/lib/supabase-client';

// Componentes de Workflow
import { WorkflowStepper } from '@/components/os/shared/components/workflow-stepper';
import { WorkflowFooter } from '@/components/os/shared/components/workflow-footer';
import { OSHeaderDelegacao } from '@/components/os/shared/components/os-header-delegacao';
import { StepReadOnlyWithAdendos } from '@/components/os/shared/components/step-readonly-with-adendos';
import { type WorkflowStepDefinition } from '@/components/os/shared/components/workflow-accordion'; // Type reuse

// Hooks de Workflow
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
import { useCreateOSWorkflow } from '@/lib/hooks/use-os-workflows';
import { useOS } from '@/lib/hooks/use-os';
import { useTransferenciaSetor } from '@/lib/hooks/use-transferencia-setor';
// unused useAuth removed

// Componentes de Steps
import { LeadCadastro, type LeadCadastroHandle, type LeadCompleto } from '@/components/os/shared/lead-cadastro';
import { StepFollowup1OS5, type StepFollowup1OS5Handle } from '@/components/os/shared/steps/step-followup-1-os5';
import { StepFollowup1OS6, type StepFollowup1OS6Handle } from '@/components/os/shared/steps/step-followup-1-os6';
import { StepPrecificacaoAssessoria } from '@/components/os/shared/steps/step-precificacao-assessoria';
import { StepGerarProposta } from '@/components/os/shared/steps/step-gerar-proposta';
import { StepAgendarApresentacao } from '@/components/os/shared/steps/step-agendar-apresentacao';
import { StepRealizarApresentacao } from '@/components/os/shared/steps/step-realizar-apresentacao';
import { StepAnaliseRelatorio } from '@/components/os/shared/steps/step-analise-relatorio';
import { StepGerarContrato } from '@/components/os/shared/steps/step-gerar-contrato';
import { StepContratoAssinado } from '@/components/os/shared/steps/step-contrato-assinado';

// Componentes específicos de Assessoria
import { StepSelecaoTipoAssessoria } from '@/components/os/assessoria/os-5-6/steps/step-selecao-tipo-assessoria';
import { StepAtivarContratoAssessoria } from '@/components/os/assessoria/os-5-6/steps/step-ativar-contrato-assessoria';
import { StepEscopoAssessoria, type StepEscopoAssessoriaHandle, type StepEscopoAssessoriaData } from '@/components/os/shared/steps/step-escopo-assessoria';

// Types
import type { TransferenciaInfo } from '@/types/os-setor-config';
import type { WorkflowStep } from '@/components/os/shared/components/workflow-stepper';

// ============================================================
// CONSTANTES
// ============================================================

const STEPS: WorkflowStepDefinition[] = [
    { id: 1, title: 'Identifique o Lead', short: 'Lead', setor: 'administrativo' as const, setorNome: 'Administrativo', responsible: 'ADM' },
    { id: 2, title: 'Seleção do Tipo de OS', short: 'Tipo OS', setor: 'administrativo' as const, setorNome: 'Administrativo', responsible: 'ADM' },
    { id: 3, title: 'Follow-up 1 (Entrevista Inicial)', short: 'Follow-up 1', setor: 'administrativo' as const, setorNome: 'Administrativo', responsible: 'ADM' },
    { id: 4, title: 'Formulário Memorial (Escopo e Prazos)', short: 'Escopo', setor: 'assessoria' as const, setorNome: 'Assessoria', responsible: 'Assessoria' },
    { id: 5, title: 'Precificação (Formulário Financeiro)', short: 'Precificação', setor: 'assessoria' as const, setorNome: 'Assessoria', responsible: 'Assessoria' },
    { id: 6, title: 'Gerar Proposta Comercial', short: 'Proposta', setor: 'administrativo' as const, setorNome: 'Administrativo', responsible: 'ADM' },
    { id: 7, title: 'Agendar Visita (Apresentação)', short: 'Agendar', setor: 'administrativo' as const, setorNome: 'Administrativo', responsible: 'ADM' },
    { id: 8, title: 'Realizar Visita (Apresentação)', short: 'Apresentação', setor: 'administrativo' as const, setorNome: 'Administrativo', responsible: 'ADM' },
    { id: 9, title: 'Follow-up 3 (Pós-Apresentação)', short: 'Follow-up 3', setor: 'administrativo' as const, setorNome: 'Administrativo', responsible: 'ADM' },
    { id: 10, title: 'Gerar Contrato (Upload)', short: 'Contrato', setor: 'administrativo' as const, setorNome: 'Administrativo', responsible: 'ADM' },
    { id: 11, title: 'Contrato Assinado', short: 'Assinatura', setor: 'administrativo' as const, setorNome: 'Administrativo', responsible: 'ADM' },
    { id: 12, title: 'Ativar Contrato', short: 'Ativação', setor: 'administrativo' as const, setorNome: 'Administrativo', responsible: 'Sistema' },
];

// ============================================================
// INTERFACE
// ============================================================

interface OS56WorkflowPageProps {
    onBack?: () => void;
    tipoOS?: 'OS-05' | 'OS-06';
    osId?: string;
    initialStep?: number;
    readonly?: boolean;
    codigoOS?: string;
    tipoOSNome?: string;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function OS56WorkflowPage({
    onBack,
    tipoOS = 'OS-05',
    osId: osIdProp,
    initialStep,
    readonly = false,
    codigoOS,
    tipoOSNome,
}: OS56WorkflowPageProps) {
    // Estado interno para armazenar osId criada dinamicamente
    const [internalOsId, setInternalOsId] = useState<string | null>(null);
    const finalOsId = osIdProp || internalOsId;

    // Estado de salvamento
    const [isSaving, setIsSaving] = useState(false);

    // Hooks de integração
    const { os } = useOS(finalOsId || undefined);
    const createOSMutationHook = useCreateOSWorkflow();
    const { executarTransferencia } = useTransferenciaSetor();
    // unused currentUser removed

    // Estado de transferência
    const [, setIsTransferenciaModalOpen] = useState(false);
    const [, setTransferenciaInfo] = useState<TransferenciaInfo | null>(null);

    // Hook de Estado do Workflow
    const {
        currentStep,
        setCurrentStep,
        formDataByStep,
        setStepData,
        saveStep,
        completedSteps: completedStepsFromHook,
        etapas,
        refreshEtapas,
    } = useWorkflowState({
        osId: finalOsId || undefined,
        totalSteps: STEPS.length,
        initialStep,
    });

    // Regras de completude
    const completionRules = useMemo(() => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        1: (data: any) => !!data?.leadId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        2: (data: any) => !!data?.tipoOS,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        3: (data: any) => !!(data?.motivoProcura && data?.idadeEdificacao),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        4: (data: any) => !!(data?.objetivo && data?.especificacoesTecnicas?.length > 0),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        5: (data: any) => !!data?.custoBase && parseFloat(String(data.custoBase).replace(/[^\d,.-]/g, '').replace(',', '.')) > 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        6: (data: any) => !!data?.propostaGerada,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        7: (data: any) => !!data?.dataAgendamento,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        8: (data: any) => !!data?.apresentacaoRealizada,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        9: (data: any) => !!data?.indicadorFechamento && !!data?.propostaApresentada,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        10: (data: any) => !!data?.contratoFile,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        11: (data: any) => !!data?.contratoAssinado,
    }), []);

    // Hook de Completude
    const { completedSteps } = useWorkflowCompletion({
        currentStep,
        formDataByStep,
        completionRules,
        completedStepsFromHook,
    });

    // Refs para componentes com validação imperativa
    const stepLeadRef = useRef<LeadCadastroHandle>(null);
    const stepFollowup1OS5Ref = useRef<StepFollowup1OS5Handle>(null);
    const stepFollowup1OS6Ref = useRef<StepFollowup1OS6Handle>(null);
    const stepEscopoRef = useRef<StepEscopoAssessoriaHandle>(null);

    // Estado local para lead selecionado
    const [selectedLeadId, setSelectedLeadId] = useState<string>('');

    // Mapeamento de dados por etapa
    const etapa1Data = formDataByStep[1] || { leadId: '' };
    const etapa2Data = formDataByStep[2] || { tipoOS: '' };
    const etapa3Data = formDataByStep[3] || {};
    const etapa4Data: Partial<StepEscopoAssessoriaData> = formDataByStep[4] || {};
    const etapa5Data = formDataByStep[5] || {};
    const etapa6Data = formDataByStep[6] || {};
    const etapa7Data = formDataByStep[7] || {};
    const etapa8Data = formDataByStep[8] || {};
    const etapa9Data = formDataByStep[9] || {};
    const etapa10Data = formDataByStep[10] || {};
    const etapa11Data = formDataByStep[11] || {};

    // Sincronizar selectedLeadId com etapa1Data
    useEffect(() => {
        if (etapa1Data.leadId && etapa1Data.leadId !== selectedLeadId) {
            setSelectedLeadId(etapa1Data.leadId);
        }
    }, [etapa1Data.leadId, selectedLeadId]);

    // Calcular valores financeiros da etapa 5
    const valoresFinanceiros = useMemo(() => {
        const precoFinal = parseFloat(etapa5Data?.precoFinal || etapa5Data?.valorBase || '0');
        const percentualEntrada = parseFloat(etapa5Data?.percentualEntrada || '0');
        const numeroParcelas = parseFloat(etapa5Data?.numeroParcelas || '1') || 1;

        const valorTotal = precoFinal;
        const valorEntrada = valorTotal * (percentualEntrada / 100);
        const valorParcela = numeroParcelas > 0 ? (valorTotal - valorEntrada) / numeroParcelas : 0;

        return { valorTotal, valorEntrada, valorParcela };
    }, [etapa5Data]);

    // ============================================================
    // HANDLERS
    // ============================================================

    const handleNextStep = async () => {
        logger.log('🔍 [OS56] handleNextStep chamado', { currentStep, finalOsId });

        // ETAPA 1: VALIDAR E CRIAR OS
        if (currentStep === 1) {
            if (!stepLeadRef.current) {
                toast.error('Erro: Componente de cadastro não inicializado');
                return;
            }

            const isValid = stepLeadRef.current.validate();
            if (!isValid) {
                toast.error('Preencha todos os campos obrigatórios');
                return;
            }

            const leadId = await stepLeadRef.current.save();
            if (!leadId) {
                toast.error('Selecione um lead antes de continuar');
                return;
            }

            // Criar OS se ainda não existe
            if (!finalOsId) {
                try {
                    const user = (await supabase.auth.getUser()).data.user;
                    const result = await createOSMutationHook.mutate({
                        tipoOSCodigo: tipoOS,
                        clienteId: leadId,
                        ccId: '',
                        responsavelId: user?.id || null,
                        descricao: `${tipoOS === 'OS-05' ? 'Assessoria Técnica' : 'Assessoria Pericial'} - Lead em análise`,
                        metadata: { leadId, origem: 'workflow_assessoria' },
                        etapas: STEPS.map((step, index) => ({
                            nome_etapa: step.title,
                            ordem: index + 1,
                            dados_etapa: index === 0 ? { leadId, ...etapa1Data } : {},
                        })),
                    });

                    if (!result?.os?.id) throw new Error('OS criada mas sem ID');

                    const newOsId = result.os.id as string;
                    setInternalOsId(newOsId);

                    // Marcar etapa 1 como concluída
                    const etapa1 = (result.etapas as Array<{ id: string; ordem: number }>)?.find(e => e.ordem === 1);
                    if (etapa1?.id) {
                        await supabase.from('os_etapas').update({
                            status: 'concluida',
                            dados_etapa: { leadId, ...etapa1Data },
                            data_conclusao: new Date().toISOString(),
                        }).eq('id', etapa1.id);

                        setStepData(1, { leadId, ...etapa1Data });
                    }

                    logger.log('✅ OS criada:', newOsId);
                } catch (error) {
                    logger.error('❌ Erro ao criar OS:', error);
                    toast.error('Não foi possível criar a OS');
                    return;
                }
            } else {
                await saveStep(1, false, { leadId, ...etapa1Data });
            }
        } else {
            // Outras etapas: salvar dados com refresh
            try {
                const currentData = formDataByStep[currentStep] || {};
                await saveStep(currentStep, false, currentData);
                await refreshEtapas();
            } catch (error) {
                logger.error('❌ Erro ao salvar etapa:', error);
                toast.error('Erro ao salvar dados');
                return;
            }
        }

        // Avançar
        if (currentStep < STEPS.length) {
            const nextStep = currentStep + 1;

            // Verificar transferência de setor
            const osTypeCodigo = (formDataByStep[2]?.tipoOS || tipoOS) as string;
            if (finalOsId && osTypeCodigo) {
                const resultado = await executarTransferencia({
                    osId: finalOsId,
                    osType: osTypeCodigo,
                    etapaAtual: currentStep,
                    proximaEtapa: nextStep,
                    clienteNome: (etapa1Data.nome as string) || 'Cliente',
                    codigoOS: os?.codigo_os,
                });

                if (resultado.success && resultado.transferencia) {
                    setTransferenciaInfo(resultado.transferencia);
                    setIsTransferenciaModalOpen(true);
                    return;
                }
            }

            setCurrentStep(nextStep);
            toast.success('Etapa concluída!', { icon: '✅' });
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleConcluirEtapa = async () => {
        try {
            setIsSaving(true);
            await saveStep(currentStep, false);

            const tipoOSSelecionado = formDataByStep[2]?.tipoOS || tipoOS;
            const osFilhaCodigo = tipoOSSelecionado === 'OS-05' ? 'OS-12' : 'OS-11';
            const osFilhaNome = tipoOSSelecionado === 'OS-05' ? 'Execução de Assessoria Mensal' : 'Execução de Laudo Pontual';

            if (!finalOsId || !os) {
                toast.success(`Contrato ativado! ${osFilhaCodigo} seria criada.`);
                if (onBack) onBack();
                return;
            }

            const clienteId = formDataByStep[1]?.leadId || os.cliente_id;
            const etapasFilha = osFilhaCodigo === 'OS-12'
                ? [
                    { ordem: 1, nome_etapa: 'Cadastro do Cliente' },
                    { ordem: 2, nome_etapa: 'Definição de SLA' },
                    { ordem: 3, nome_etapa: 'Setup de Recorrência' },
                    { ordem: 4, nome_etapa: 'Alocação de Equipe' },
                    { ordem: 5, nome_etapa: 'Configuração de Calendário' },
                    { ordem: 6, nome_etapa: 'Início dos Serviços' },
                ]
                : [
                    { ordem: 1, nome_etapa: 'Cadastrar o Cliente' },
                    { ordem: 2, nome_etapa: 'Agendar Visita' },
                    { ordem: 3, nome_etapa: 'Realizar Visita e Questionário' },
                    { ordem: 4, nome_etapa: 'Anexar RT' },
                    { ordem: 5, nome_etapa: 'Gerar Documento Técnico' },
                    { ordem: 6, nome_etapa: 'Enviar ao Cliente' },
                ];

            await createOSMutationHook.mutate({
                tipoOSCodigo: osFilhaCodigo,
                clienteId,
                ccId: os.cc_id ?? '',
                responsavelId: os.responsavel_id ?? null,
                descricao: `${osFilhaNome} - Gerado de ${os.codigo_os}`,
                metadata: { parentOSId: finalOsId, contratoOrigem: os.codigo_os },
                etapas: etapasFilha,
                parentOSId: finalOsId,
            });

            await supabase.from('ordens_servico').update({
                status_geral: 'concluido',
                updated_at: new Date().toISOString(),
            }).eq('id', finalOsId);

            toast.success(`Contrato ativado! ${osFilhaCodigo} criada.`);
            if (onBack) onBack();
        } catch (error) {
            logger.error('Erro ao ativar contrato:', error);
            toast.error('Erro ao ativar contrato');
        } finally {
            setIsSaving(false);
        }
    };

    // ============================================================
    // RENDER FUNCTIONS
    // ============================================================

    const renderCurrentStepForm = () => {
        const stepEtapa = etapas?.find(e => e.ordem === currentStep);
        const isGlobalReadOnly = readonly || completedSteps.includes(currentStep);

        const formContent = (() => {
            switch (currentStep) {
                case 1:
                    return (
                        <LeadCadastro
                            ref={stepLeadRef}
                            selectedLeadId={selectedLeadId}
                            onLeadChange={(id: string, data?: LeadCompleto) => {
                                setSelectedLeadId(id);
                                if (data) {
                                    setStepData(1, {
                                        ...etapa1Data,
                                        leadId: id,
                                        nome: data.identificacao?.nome,
                                        cpfCnpj: data.identificacao?.cpfCnpj,
                                        email: data.identificacao?.email,
                                        telefone: data.identificacao?.telefone,
                                        tipo: data.identificacao?.tipo,
                                        nomeResponsavel: data.identificacao?.nomeResponsavel,
                                        cargoResponsavel: data.identificacao?.cargoResponsavel,
                                        tipoEdificacao: data.edificacao?.tipoEdificacao,
                                        qtdBlocos: data.edificacao?.qtdBlocos,
                                        qtdUnidades: data.edificacao?.qtdUnidades,
                                        qtdPavimentos: data.edificacao?.qtdPavimentos,
                                        tipoTelhado: data.edificacao?.tipoTelhado,
                                        possuiElevador: data.edificacao?.possuiElevador,
                                        possuiPiscina: data.edificacao?.possuiPiscina,
                                        cep: data.endereco?.cep,
                                        rua: data.endereco?.rua,
                                        numero: data.endereco?.numero,
                                        complemento: data.endereco?.complemento,
                                        bairro: data.endereco?.bairro,
                                        cidade: data.endereco?.cidade,
                                        estado: data.endereco?.estado,
                                        identificacao: data.identificacao,
                                        edificacao: data.edificacao,
                                        endereco: data.endereco,
                                    });
                                }
                            }}
                            readOnly={isGlobalReadOnly}
                            showEdificacao={true}
                            showEndereco={true}
                        />
                    );

                case 2:
                    return (
                        <StepSelecaoTipoAssessoria
                            data={etapa2Data}
                            onDataChange={(data) => setStepData(2, data)}
                        />
                    );

                case 3:
                    return tipoOS === 'OS-05' ? (
                        <StepFollowup1OS5
                            ref={stepFollowup1OS5Ref}
                            data={etapa3Data}
                            onDataChange={(data) => setStepData(3, data)}
                            readOnly={isGlobalReadOnly}
                            osId={finalOsId || undefined}
                        />
                    ) : (
                        <StepFollowup1OS6
                            ref={stepFollowup1OS6Ref}
                            data={etapa3Data}
                            onDataChange={(data) => setStepData(3, data)}
                            readOnly={isGlobalReadOnly}
                            osId={finalOsId || undefined}
                        />
                    );

                case 4:
                    return (
                        <StepEscopoAssessoria
                            ref={stepEscopoRef}
                            data={etapa4Data}
                            onDataChange={(data) => setStepData(4, data)}
                            readOnly={isGlobalReadOnly}
                            tipoOS={tipoOS}
                        />
                    );

                case 5:
                    return (
                        <StepPrecificacaoAssessoria
                            data={etapa5Data}
                            onDataChange={(data) => setStepData(5, data)}
                            readOnly={isGlobalReadOnly}
                        />
                    );

                case 6:
                    return (
                        <StepGerarProposta
                            osId={finalOsId || ''}
                            tipoOS={formDataByStep[2]?.tipoOS || tipoOS}
                            etapa1Data={formDataByStep[1] || {}}
                            etapa2Data={formDataByStep[2] || {}}
                            etapa7Data={etapa4Data}
                            etapa8Data={etapa5Data}
                            valorTotal={valoresFinanceiros.valorTotal}
                            valorEntrada={valoresFinanceiros.valorEntrada}
                            valorParcela={valoresFinanceiros.valorParcela}
                            data={etapa6Data}
                            onDataChange={(data) => setStepData(6, data)}
                            readOnly={isGlobalReadOnly}
                        />
                    );

                case 7:
                    return (
                        <StepAgendarApresentacao
                            data={etapa7Data}
                            onDataChange={(data) => setStepData(7, data)}
                            readOnly={isGlobalReadOnly}
                            osId={finalOsId || ''}
                        />
                    );

                case 8:
                    return (
                        <StepRealizarApresentacao
                            data={etapa8Data}
                            onDataChange={(data) => setStepData(8, data)}
                            readOnly={isGlobalReadOnly}
                        />
                    );

                case 9:
                    return (
                        <StepAnaliseRelatorio
                            data={etapa9Data}
                            onDataChange={(data) => setStepData(9, data)}
                            readOnly={isGlobalReadOnly}
                        />
                    );

                case 10:
                    return (
                        <StepGerarContrato
                            data={{
                                ...etapa10Data,
                                osId: finalOsId || '',
                                codigoOS: os?.codigo_os || '',
                                clienteNome: String(etapa1Data.nome || etapa1Data.nomeFantasia || ''),
                                clienteCpfCnpj: String(etapa1Data.cpfCnpj || ''),
                                valorContrato: valoresFinanceiros.valorTotal,
                                dataInicio: String(etapa6Data.dataInicio || new Date().toISOString()),
                            }}
                            etapaId={etapas?.find(e => e.ordem === 10)?.id}
                            onDataChange={(data) => setStepData(10, data)}
                            readOnly={isGlobalReadOnly}
                        />
                    );

                case 11:
                    return (
                        <StepContratoAssinado
                            data={etapa11Data}
                            onDataChange={(data) => setStepData(11, data)}
                            readOnly={isGlobalReadOnly}
                        />
                    );

                case 12:
                    return (
                        <StepAtivarContratoAssessoria
                            onAtivarContrato={handleConcluirEtapa}
                            isActivating={isSaving}
                            readOnly={isGlobalReadOnly}
                            tipoOS={formDataByStep[2]?.tipoOS || tipoOS}
                        />
                    );

                default:
                    return null;
            }
        })();

        // Wrapper de Adendos (se etapa existir no banco)
        if (stepEtapa?.id) {
            return (
                <StepReadOnlyWithAdendos
                    etapaId={stepEtapa.id}
                    readonly={isGlobalReadOnly}
                >
                    {formContent}
                </StepReadOnlyWithAdendos>
            );
        }

        return formContent;
    };

    // ============================================================
    // MAIN RENDER
    // ============================================================

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* 1. Header */}
            <div className="bg-background/95 backdrop-blur-sm border-b">
                <div className="max-w-5xl mx-auto flex items-center h-16 px-6 gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="-ml-2 hover:bg-muted/50 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-lg font-semibold text-foreground/90">
                                {tipoOSNome || (tipoOS === 'OS-05' ? 'Assessoria Mensal' : 'Assessoria Avulsa')}
                            </h1>
                            {codigoOS && (
                                <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-medium">
                                    {codigoOS}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Workflow de {STEPS.length} etapas
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. Header de Delegação */}
            {finalOsId && (
                <div className="bg-background max-w-5xl mx-auto w-full px-6">
                    <OSHeaderDelegacao
                        osId={finalOsId}
                        tipoOS={tipoOS}
                        steps={STEPS}
                    />
                </div>
            )}

            {/* 3. Stepper Horizontal */}
            <div className="bg-card border-b py-0">
                <div className="max-w-5xl mx-auto px-6">
                    <WorkflowStepper
                        steps={STEPS as unknown as WorkflowStep[]}
                        currentStep={currentStep}
                        completedSteps={completedSteps}
                        onStepClick={(step) => {
                            // Só permite navegar para etapas já completadas ou a atual
                            if (completedSteps.includes(step) || step === currentStep || completedSteps.includes(step - 1)) {
                                setCurrentStep(step);
                            }
                        }}
                    />
                </div>
            </div>

            {/* 4. Conteúdo Principal */}
            <main className="flex-1 max-w-5xl mx-auto w-full p-6">
                <Card className="flex flex-col">
                    <CardHeader className="flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>{STEPS[currentStep - 1]?.title}</CardTitle>
                            </div>
                            <Badge variant="outline" className="border-primary text-primary">
                                Etapa {currentStep} de {STEPS.length}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 flex-1">
                        {renderCurrentStepForm()}
                    </CardContent>

                    {/* Footer usando WorkflowFooter - Ocultar na etapa 12 (ativação) */}
                    {currentStep !== 12 && (
                        <WorkflowFooter
                            currentStep={currentStep}
                            totalSteps={STEPS.length}
                            onPrevStep={handlePrevStep}
                            onNextStep={handleNextStep}
                            disableNext={isSaving}
                            isLoading={isSaving}
                            loadingText="Processando..."
                            readOnlyMode={readonly}
                        />
                    )}

                    {/* Footer especial para etapa 12 (Ativar Contrato) */}
                    {currentStep === 12 && (
                        <div className="border-t bg-muted/10 p-4 flex items-center justify-between gap-4">
                            <Button
                                variant="ghost"
                                onClick={handlePrevStep}
                                disabled={isSaving}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Anterior
                            </Button>
                            <Button
                                onClick={handleConcluirEtapa}
                                disabled={isSaving || readonly}
                                className="bg-success hover:bg-success/90 text-success-foreground min-w-[140px] shadow-sm"
                            >
                                {isSaving ? 'Ativando...' : 'Ativar Contrato'}
                            </Button>
                        </div>
                    )}
                </Card>
            </main>
        </div>
    );
}

// Re-export for route usage
export default OS56WorkflowPage;
