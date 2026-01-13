/**
 * OS56WorkflowPage - Workflow de Assessoria Lead (OS-05 e OS-06)
 * 
 * Implementa o Sistema de Accordion com Adendos para OS de Assessoria.
 * Padrão baseado em OS-08 (Visita Técnica).
 * 
 * @version 1.0.0
 * @date 2026-01-13
 * 
 * @example
 * ```tsx
 * <OS56WorkflowPage
 *   osId="uuid"
 *   tipoOS="OS-05"
 *   initialStep={3}
 *   codigoOS="OS0500001"
 *   tipoOSNome="Assessoria Mensal"
 * />
 * ```
 */
"use client";

import { logger } from '@/lib/utils/logger';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/lib/utils/safe-toast';
import { supabase } from '@/lib/supabase-client';

// Componentes de Workflow (Accordion Pattern)
import { WorkflowAccordion, type WorkflowStepDefinition } from '@/components/os/shared/components/workflow-accordion';
import { WorkflowStepSummary, type SummaryField } from '@/components/os/shared/components/workflow-step-summary';
import { FieldWithAdendos } from '@/components/os/shared/components/field-with-adendos';
import { LeadSummaryWithTabs } from '@/components/os/shared/components/lead-summary-with-tabs';

// Hooks de Workflow
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
import { useEtapaAdendos } from '@/lib/hooks/use-etapa-adendos';
import { useCreateOSWorkflow } from '@/lib/hooks/use-os-workflows';
import { useOS } from '@/lib/hooks/use-os';
import { useTransferenciaSetor } from '@/lib/hooks/use-transferencia-setor';
import { useAuth } from '@/lib/contexts/auth-context';

// Componentes de Steps (Reutilizados do arquivo legado)
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

// Sistema de Aprovação
import { AprovacaoModal } from '@/components/os/shared/components/aprovacao-modal';
import { useAprovacaoEtapa } from '@/lib/hooks/use-aprovacao-etapa';

// Types
import type { TransferenciaInfo } from '@/types/os-setor-config';

// ============================================================
// CONSTANTES
// ============================================================

/**
 * Definição das 12 etapas do workflow de Assessoria Lead
 */
const STEPS: WorkflowStepDefinition[] = [
    { id: 1, title: 'Identifique o Lead', short: 'Lead', responsible: 'ADM' },
    { id: 2, title: 'Seleção do Tipo de OS', short: 'Tipo OS', responsible: 'ADM' },
    { id: 3, title: 'Follow-up 1 (Entrevista Inicial)', short: 'Follow-up 1', responsible: 'ADM' },
    { id: 4, title: 'Formulário Memorial (Escopo e Prazos)', short: 'Escopo', responsible: 'Assessoria' },
    { id: 5, title: 'Precificação (Formulário Financeiro)', short: 'Precificação', responsible: 'Assessoria' },
    { id: 6, title: 'Gerar Proposta Comercial', short: 'Proposta', responsible: 'ADM' },
    { id: 7, title: 'Agendar Visita (Apresentação)', short: 'Agendar', responsible: 'ADM' },
    { id: 8, title: 'Realizar Visita (Apresentação)', short: 'Apresentação', responsible: 'ADM' },
    { id: 9, title: 'Follow-up 3 (Pós-Apresentação)', short: 'Follow-up 3', responsible: 'ADM' },
    { id: 10, title: 'Gerar Contrato (Upload)', short: 'Contrato', responsible: 'ADM' },
    { id: 11, title: 'Contrato Assinado', short: 'Assinatura', responsible: 'ADM' },
    { id: 12, title: 'Ativar Contrato', short: 'Ativação', responsible: 'Sistema' },
];

/**
 * Configuração de resumo por etapa para WorkflowStepSummary
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OS_56_SUMMARY_CONFIG: Record<number, (data: any) => SummaryField[]> = {
    1: (data) => [
        { label: 'Nome/Razão Social', value: data?.nome },
        { label: 'CPF/CNPJ', value: data?.cpfCnpj },
        { label: 'Email', value: data?.email },
        { label: 'Telefone', value: data?.telefone },
    ],
    2: (data) => [
        { label: 'Tipo de OS Selecionado', value: data?.tipoOS === 'OS-05' ? 'Assessoria Mensal' : 'Assessoria Avulsa' },
    ],
    3: (data) => [
        { label: 'Idade da Edificação', value: data?.idadeEdificacao },
        { label: 'Motivo da Procura', value: data?.motivoProcura, fullWidth: true },
        { label: 'Grau de Urgência', value: data?.grauUrgencia },
        { label: 'Previsão Orçamentária', value: data?.previsaoOrcamentaria, type: 'currency' as const },
    ],
    4: (data) => [
        { label: 'Objetivo', value: data?.objetivo, fullWidth: true },
        { label: 'Especificações Técnicas', value: data?.especificacoesTecnicas?.join(', ') || '', fullWidth: true },
        { label: 'Metodologia', value: data?.metodologia },
    ],
    5: (data) => [
        { label: 'Custo Base', value: data?.custoBase, type: 'currency' as const },
        { label: 'Percentual Imposto', value: `${data?.percentualImposto || 14}%` },
        { label: 'Valor Final', value: data?.precoFinal || data?.valorBase, type: 'currency' as const },
    ],
    6: (data) => [
        { label: 'Proposta Gerada', value: data?.propostaGerada, type: 'boolean' as const },
        { label: 'Data de Geração', value: data?.dataGeracao, type: 'date' as const },
    ],
    7: (data) => [
        { label: 'Data do Agendamento', value: data?.dataAgendamento, type: 'datetime' as const },
    ],
    8: (data) => [
        { label: 'Apresentação Realizada', value: data?.apresentacaoRealizada, type: 'boolean' as const },
    ],
    9: (data) => [
        { label: 'Proposta Apresentada', value: data?.propostaApresentada },
        { label: 'Indicador de Fechamento', value: data?.indicadorFechamento },
        { label: 'Nível de Satisfação', value: data?.nivelSatisfacao },
    ],
    10: (data) => [
        { label: 'Contrato Enviado', value: !!data?.contratoFile, type: 'boolean' as const },
        { label: 'Data de Upload', value: data?.dataUpload, type: 'date' as const },
    ],
    11: (data) => [
        { label: 'Contrato Assinado', value: data?.contratoAssinado, type: 'boolean' as const },
        { label: 'Data da Assinatura', value: data?.dataAssinatura, type: 'date' as const },
    ],
    12: () => [
        { label: 'Status', value: 'Contrato Ativado' },
    ],
};

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

    // Estado para modal de aprovação
    const [isAprovacaoModalOpen, setIsAprovacaoModalOpen] = useState(false);
    const [etapaNomeParaAprovacao, setEtapaNomeParaAprovacao] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Hooks de integração
    const { os } = useOS(finalOsId || undefined);
    const createOSMutationHook = useCreateOSWorkflow();
    const { executarTransferencia } = useTransferenciaSetor();
    useAuth();

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

    // Hook de Adendos (para etapa atual)
    const currentEtapa = etapas?.find(e => e.ordem === currentStep);
    const { addAdendo, getAdendosByCampo } = useEtapaAdendos(currentEtapa?.id);

    // Hook de aprovação de etapa
    const { aprovacaoInfo } = useAprovacaoEtapa(finalOsId || undefined, currentStep);

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

    // Handler para adicionar adendo
    const handleAddAdendo = useCallback(async (campoKey: string, conteudo: string) => {
        const result = await addAdendo(campoKey, conteudo);
        return !!result;
    }, [addAdendo]);

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

    /**
     * Handler customizado para avançar etapa
     */
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
                            dados_etapa: {},
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
                            dados_etapa: { leadId, ...formDataByStep[1] },
                            data_conclusao: new Date().toISOString(),
                        }).eq('id', etapa1.id);
                    }

                    logger.log('✅ OS criada:', newOsId);
                } catch (error) {
                    logger.error('❌ Erro ao criar OS:', error);
                    toast.error('Não foi possível criar a OS');
                    return;
                }
            }
        } else {
            // Outras etapas: salvar dados
            try {
                await saveStep(currentStep, false);
            } catch (error) {
                logger.error('❌ Erro ao salvar etapa:', error);
                toast.error('Erro ao salvar dados');
                return;
            }
        }

        // Verificar aprovação
        if (aprovacaoInfo?.requerAprovacao && aprovacaoInfo.statusAprovacao !== 'aprovada') {
            setEtapaNomeParaAprovacao(STEPS.find(s => s.id === currentStep)?.title || '');
            setIsAprovacaoModalOpen(true);
            return;
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

    /**
     * Handler para etapa anterior
     */
    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    /**
     * Handler para ativar contrato (Etapa 12)
     */
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

    /**
     * Renderiza o formulário de uma etapa
     */
    const renderForm = (step: number) => {
        const isReadOnly = readonly || completedSteps.includes(step);

        switch (step) {
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
                                    nome: data.identificacao.nome,
                                    cpfCnpj: data.identificacao.cpfCnpj,
                                    email: data.identificacao.email,
                                    telefone: data.identificacao.telefone,
                                });
                            }
                        }}
                        readOnly={isReadOnly}
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
                        readOnly={isReadOnly}
                        osId={finalOsId || undefined}
                    />
                ) : (
                    <StepFollowup1OS6
                        ref={stepFollowup1OS6Ref}
                        data={etapa3Data}
                        onDataChange={(data) => setStepData(3, data)}
                        readOnly={isReadOnly}
                        osId={finalOsId || undefined}
                    />
                );

            case 4:
                return (
                    <StepEscopoAssessoria
                        ref={stepEscopoRef}
                        data={etapa4Data}
                        onDataChange={(data) => setStepData(4, data)}
                        readOnly={isReadOnly}
                        tipoOS={tipoOS}
                    />
                );

            case 5:
                return (
                    <StepPrecificacaoAssessoria
                        data={etapa5Data}
                        onDataChange={(data) => setStepData(5, data)}
                        readOnly={isReadOnly}
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
                        readOnly={isReadOnly}
                    />
                );

            case 7:
                return (
                    <StepAgendarApresentacao
                        osId={finalOsId || ''}
                        data={etapa7Data}
                        onDataChange={(data) => setStepData(7, data)}
                        readOnly={isReadOnly}
                    />
                );

            case 8:
                return (
                    <StepRealizarApresentacao
                        data={etapa8Data}
                        onDataChange={(data) => setStepData(8, data)}
                        readOnly={isReadOnly}
                    />
                );

            case 9:
                return (
                    <StepAnaliseRelatorio
                        data={etapa9Data}
                        onDataChange={(data) => setStepData(9, data)}
                        readOnly={isReadOnly}
                    />
                );

            case 10:
                return (
                    <StepGerarContrato
                        data={{
                            ...etapa10Data,
                            osId: finalOsId || '',
                            codigoOS: os?.codigo_os || '',
                        }}
                        onDataChange={(data) => setStepData(10, data)}
                        readOnly={isReadOnly}
                    />
                );

            case 11:
                return (
                    <StepContratoAssinado
                        data={etapa11Data}
                        onDataChange={(data) => setStepData(11, data)}
                        readOnly={isReadOnly}
                    />
                );

            case 12:
                return (
                    <StepAtivarContratoAssessoria
                        tipoOS={tipoOS}
                        onAtivarContrato={handleConcluirEtapa}
                        readOnly={isReadOnly}
                    />
                );

            default:
                return null;
        }
    };

    /**
     * Renderiza o resumo de uma etapa concluída com suporte a adendos
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderSummary = (step: number, data: any) => {
        // 🆕 Etapa 1 (Identifique o Lead): Exibição especial com tabs, SEM adendos
        if (step === 1) {
            return <LeadSummaryWithTabs data={data} />;
        }

        const configFn = OS_56_SUMMARY_CONFIG[step];
        if (!configFn) return null;

        const fields = configFn(data);
        const stepEtapa = etapas?.find(e => e.ordem === step);
        const isCompleted = completedSteps.includes(step);
        const canAddAdendo = isCompleted && !!stepEtapa?.id && !readonly;

        // Se etapa concluída, mostrar com FieldWithAdendos
        if (isCompleted && stepEtapa) {
            return (
                <div className="space-y-4">
                    {fields.map((field, idx) => (
                        <FieldWithAdendos
                            key={idx}
                            label={field.label}
                            campoKey={field.label.toLowerCase().replace(/\s+/g, '_')}
                            valorOriginal={field.value as string}
                            adendos={getAdendosByCampo(field.label.toLowerCase().replace(/\s+/g, '_'))}
                            etapaId={stepEtapa.id}
                            onAddAdendo={handleAddAdendo}
                            canAddAdendo={canAddAdendo}
                        />
                    ))}
                </div>
            );
        }

        // Resumo simples
        return <WorkflowStepSummary fields={fields} />;
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        {/* Botão Voltar */}
                        {finalOsId ? (
                            <Link to="/os/$osId" params={{ osId: finalOsId }}>
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Voltar
                                </Button>
                            </Link>
                        ) : onBack ? (
                            <Button variant="ghost" size="sm" className="gap-2" onClick={onBack}>
                                <ArrowLeft className="w-4 h-4" />
                                Voltar
                            </Button>
                        ) : null}

                        {/* Título */}
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900">
                                {codigoOS || 'Nova OS de Assessoria'}
                            </h1>
                            <p className="text-sm text-neutral-600">
                                {tipoOSNome || (tipoOS === 'OS-05' ? 'Assessoria Mensal' : 'Assessoria Avulsa')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-6">
                <Card>
                    <CardContent className="p-6">
                        <WorkflowAccordion
                            steps={STEPS}
                            currentStep={currentStep}
                            formDataByStep={formDataByStep}
                            completedSteps={completedSteps}
                            renderForm={renderForm}
                            renderSummary={renderSummary}
                            onSaveAndAdvance={async (step) => {
                                try {
                                    if (step === STEPS.length) {
                                        await handleConcluirEtapa();
                                    } else {
                                        await handleNextStep();
                                    }
                                    return true;
                                } catch (error) {
                                    logger.error('Erro ao salvar:', error);
                                    return false;
                                }
                            }}
                            saveButtonText="Salvar e Avançar"
                            finalButtonText="Ativar Contrato"
                            isSaving={isSaving}
                        />

                        {/* Navegação anterior (opcional) */}
                        {currentStep > 1 && !readonly && (
                            <div className="flex justify-start mt-4">
                                <Button
                                    variant="outline"
                                    onClick={handlePrevStep}
                                    className="gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Etapa Anterior
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal de Aprovação */}
            <AprovacaoModal
                open={isAprovacaoModalOpen}
                onOpenChange={setIsAprovacaoModalOpen}
                osId={finalOsId || ''}
                etapaOrdem={currentStep}
                etapaNome={etapaNomeParaAprovacao}
                onSolicitado={() => {
                    toast.info('Aprovação solicitada ao coordenador');
                    setIsAprovacaoModalOpen(false);
                }}
            />
        </div>
    );
}

export type { OS56WorkflowPageProps };
