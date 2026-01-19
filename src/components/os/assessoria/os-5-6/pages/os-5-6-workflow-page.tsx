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
import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Download, Eye } from 'lucide-react';
import { toast } from '@/lib/utils/safe-toast';
import { supabase } from '@/lib/supabase-client';

// Componentes de Workflow (Accordion Pattern)
import { WorkflowAccordion, type WorkflowStepDefinition } from '@/components/os/shared/components/workflow-accordion';
import { WorkflowStepSummary, type SummaryField } from '@/components/os/shared/components/workflow-step-summary';
import { StepReadOnlyWithAdendos } from '@/components/os/shared/components/step-readonly-with-adendos';
import { LeadSummaryWithTabs } from '@/components/os/shared/components/lead-summary-with-tabs';

// Hooks de Workflow
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
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

// NOTA: Sistema de aprovação removido - OS 5-6 não requer mais aprovação

// Types
import type { TransferenciaInfo } from '@/types/os-setor-config';

// ============================================================
// CONSTANTES
// ============================================================

/**
 * Definição das 12 etapas do workflow de Assessoria Lead com responsabilidade v3.1
 */
const STEPS: WorkflowStepDefinition[] = [
    { id: 1, title: 'Identifique o Lead', short: 'Lead', setor: 'administrativo', setorNome: 'Administrativo', responsible: 'ADM' },
    { id: 2, title: 'Seleção do Tipo de OS', short: 'Tipo OS', setor: 'administrativo', setorNome: 'Administrativo', responsible: 'ADM' },
    { id: 3, title: 'Follow-up 1 (Entrevista Inicial)', short: 'Follow-up 1', setor: 'administrativo', setorNome: 'Administrativo', responsible: 'ADM' },
    { id: 4, title: 'Formulário Memorial (Escopo e Prazos)', short: 'Escopo', setor: 'assessoria', setorNome: 'Assessoria', responsible: 'Assessoria' },
    { id: 5, title: 'Precificação (Formulário Financeiro)', short: 'Precificação', setor: 'assessoria', setorNome: 'Assessoria', responsible: 'Assessoria' },
    { id: 6, title: 'Gerar Proposta Comercial', short: 'Proposta', setor: 'administrativo', setorNome: 'Administrativo', responsible: 'ADM' },
    { id: 7, title: 'Agendar Visita (Apresentação)', short: 'Agendar', setor: 'administrativo', setorNome: 'Administrativo', responsible: 'ADM' },
    { id: 8, title: 'Realizar Visita (Apresentação)', short: 'Apresentação', setor: 'administrativo', setorNome: 'Administrativo', responsible: 'ADM' },
    { id: 9, title: 'Follow-up 3 (Pós-Apresentação)', short: 'Follow-up 3', setor: 'administrativo', setorNome: 'Administrativo', responsible: 'ADM' },
    { id: 10, title: 'Gerar Contrato (Upload)', short: 'Contrato', setor: 'administrativo', setorNome: 'Administrativo', responsible: 'ADM' },
    { id: 11, title: 'Contrato Assinado', short: 'Assinatura', setor: 'administrativo', setorNome: 'Administrativo', responsible: 'ADM' },
    { id: 12, title: 'Ativar Contrato', short: 'Ativação', setor: 'administrativo', setorNome: 'Administrativo', responsible: 'Sistema' },
];

/**
 * ✅ v3.2: Configuração COMPLETA de summary para todas as etapas OS 5-6
 * 
 * IMPORTANTE: Os nomes das chaves devem coincidir EXATAMENTE com os nomes
 * usados nos componentes de step (ex: motivo_contato, não motivoProcura)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OS_56_SUMMARY_CONFIG: Record<number, (data: any) => SummaryField[]> = {
    // Etapa 1: Identificar o Lead (resumo - detalhes via LeadSummaryWithTabs)
    1: (data) => [
        { label: 'Nome/Razão Social', value: data?.nome || data?.nomeFantasia },
        { label: 'CPF/CNPJ', value: data?.cpfCnpj },
        { label: 'Email', value: data?.email },
        { label: 'Telefone', value: data?.telefone },
    ],

    // Etapa 2: Selecionar Tipo de OS
    2: (data) => [
        { label: 'Tipo de OS', value: data?.tipoOS === 'OS-05' ? 'Assessoria Mensal (OS-05)' : 'Assessoria Avulsa (OS-06)' },
    ],

    // ✅ Etapa 3: Follow-up 1 - CORRIGIDO com chaves reais do step-followup-1-os5.tsx
    3: (data) => [
        { label: 'Idade da Edificação', value: data?.idadeEdificacao },
        { label: 'Motivo do Contato', value: data?.motivo_contato, fullWidth: true },
        { label: 'Histórico/Tempo', value: data?.historico_tempo, fullWidth: true },
        { label: 'Ações Realizadas', value: data?.acoes_realizadas, fullWidth: true },
        { label: 'Previsão Orçamentária', value: data?.previsao_orcamentaria, type: 'currency' as const },
        { label: 'Agendamento Proposta', value: data?.agendamento_proposta },
        { label: 'Anexos', value: data?.anexos, type: 'files' as const },
    ].filter(f => f.value !== undefined && f.value !== null && f.value !== ''),

    // ✅ Etapa 4: Escopo - CORRIGIDO para tratar especificacoesTecnicas como array de objetos
    4: (data) => {
        // Extrair descrições das especificações técnicas (array de {descricao: string})
        const specs = data?.especificacoesTecnicas;
        let specsFormatted: string | undefined;
        if (Array.isArray(specs) && specs.length > 0) {
            specsFormatted = specs
                .map((s: { descricao?: string }) => s?.descricao || '')
                .filter(Boolean)
                .join('; ');
        }

        // Campos base
        const fields: SummaryField[] = [
            { label: 'Objetivo', value: data?.objetivo, fullWidth: true },
            { label: 'Especificações Técnicas', value: specsFormatted, fullWidth: true },
            { label: 'Metodologia', value: data?.metodologia, fullWidth: true },
            { label: 'Garantia', value: data?.garantia, fullWidth: true },
        ];

        // Campos de prazo - depende do tipo de OS
        const prazo = data?.prazo;
        if (prazo) {
            // OS-05 (Anual): Horário de funcionamento
            if (prazo.horarioInicio || prazo.horarioFim || prazo.diasSemana) {
                fields.push({
                    label: 'Horário de Atendimento',
                    value: `${prazo.diasSemana || ''} de ${prazo.horarioInicio || ''} às ${prazo.horarioFim || ''}`.trim() || undefined
                });
                if (prazo.suporteEmergencial) {
                    fields.push({ label: 'Suporte Emergencial', value: prazo.suporteEmergencial, fullWidth: true });
                }
            }

            // OS-06 (Pontual): Dias úteis
            if (prazo.planejamentoInicial || prazo.composicaoLaudo) {
                const prazoParts = [];
                if (prazo.planejamentoInicial) prazoParts.push(`Planejamento: ${prazo.planejamentoInicial}d`);
                if (prazo.logisticaTransporte) prazoParts.push(`Logística: ${prazo.logisticaTransporte}d`);
                if (prazo.levantamentoCampo) prazoParts.push(`Levantamento: ${prazo.levantamentoCampo}d`);
                if (prazo.composicaoLaudo) prazoParts.push(`Composição: ${prazo.composicaoLaudo}d`);
                if (prazo.apresentacaoCliente) prazoParts.push(`Apresentação: ${prazo.apresentacaoCliente}d`);
                if (prazoParts.length > 0) {
                    fields.push({ label: 'Prazo (Dias Úteis)', value: prazoParts.join(', '), fullWidth: true });
                }
            }
        }

        return fields.filter(f => f.value !== undefined && f.value !== null && f.value !== '');
    },

    // ✅ Etapa 5: Precificação - COMPLETO com todos os campos
    5: (data) => [
        { label: 'Custo Base', value: data?.custoBase, type: 'currency' as const },
        { label: '% Imprevisto', value: data?.percentualImprevisto ? `${data.percentualImprevisto}%` : undefined },
        { label: 'Valor Imprevisto', value: data?.valorImprevisto, type: 'currency' as const },
        { label: '% Lucro', value: data?.percentualLucro ? `${data.percentualLucro}%` : undefined },
        { label: 'Valor Lucro', value: data?.valorLucro, type: 'currency' as const },
        { label: '% Imposto (ISS)', value: data?.percentualImposto ? `${data.percentualImposto}%` : undefined },
        { label: 'Valor Imposto', value: data?.valorImposto, type: 'currency' as const },
        { label: 'Valor Total', value: data?.valorTotal, type: 'currency' as const },
        { label: '% Entrada', value: data?.percentualEntrada ? `${data.percentualEntrada}%` : undefined },
        { label: 'Valor Entrada', value: data?.valorEntrada, type: 'currency' as const },
        { label: 'Nº Parcelas', value: data?.numeroParcelas },
        { label: 'Valor Parcela', value: data?.valorParcela, type: 'currency' as const },
    ].filter(f => f.value !== undefined && f.value !== null && f.value !== ''),

    // Etapa 6: Gerar Proposta (tratamento especial via PropostaSummary, mas fallback aqui)
    6: (data) => [
        { label: 'Proposta Gerada', value: data?.propostaGerada, type: 'boolean' as const },
        { label: 'Data de Geração', value: data?.dataGeracao, type: 'date' as const },
        { label: 'Valor Total', value: data?.valorTotal, type: 'currency' as const },
    ].filter(f => f.value !== undefined && f.value !== null),

    // ✅ Etapa 7: Agendar Apresentação - COMPLETO
    7: (data) => [
        { label: 'Data do Agendamento', value: data?.dataAgendamento, type: 'date' as const },
        { label: 'Horário', value: data?.horarioInicio && data?.horarioFim ? `${data.horarioInicio} - ${data.horarioFim}` : undefined },
        { label: 'Duração', value: data?.duracaoHoras ? `${data.duracaoHoras}h` : undefined },
        { label: 'Responsável', value: data?.responsavelAgendamentoNome },
        { label: 'Agendado Por', value: data?.agendadoPorNome },
        { label: 'Notificação Enviada', value: data?.notificacaoEnviada, type: 'boolean' as const },
    ].filter(f => f.value !== undefined && f.value !== null && f.value !== ''),

    // ✅ Etapa 8: Realizar Apresentação - CORRIGIDO com chaves reais
    8: (data) => [
        { label: 'Apresentação Realizada', value: data?.apresentacaoRealizada, type: 'boolean' as const },
        { label: 'Data da Apresentação', value: data?.dataApresentacao, type: 'datetime' as const },
        { label: 'Observações', value: data?.observacoes, fullWidth: true },
    ].filter(f => f.value !== undefined && f.value !== null && f.value !== ''),

    // ✅ Etapa 9: Análise/Relatório - COMPLETO com todos os 8 campos
    9: (data) => [
        { label: 'Proposta Apresentada', value: data?.propostaApresentada, fullWidth: true },
        { label: 'Método de Apresentação', value: data?.metodoApresentacao },
        { label: 'Opinião sobre Proposta', value: data?.clienteAchouProposta, fullWidth: true },
        { label: 'Opinião sobre Contrato', value: data?.clienteAchouContrato, fullWidth: true },
        { label: 'Dores Não Atendidas', value: data?.doresNaoAtendidas, fullWidth: true },
        { label: 'Indicador de Fechamento', value: data?.indicadorFechamento },
        { label: 'Participantes', value: data?.quemEstavaNaApresentacao, fullWidth: true },
        { label: 'Nível de Satisfação', value: data?.nivelSatisfacao },
    ].filter(f => f.value !== undefined && f.value !== null && f.value !== ''),

    // ✅ Etapa 10: Gerar Contrato - CORRIGIDO para usar contratoUrl/contratoPath
    10: (data) => [
        { label: 'Contrato Enviado', value: !!(data?.contratoUrl || data?.contratoPath), type: 'boolean' as const },
        { label: 'Data de Upload', value: data?.dataUpload, type: 'date' as const },
    ].filter(f => f.value !== undefined && f.value !== null),

    // ✅ Etapa 11: Contrato Assinado - COMPLETO
    11: (data) => [
        { label: 'Contrato Assinado', value: data?.contratoAssinado, type: 'boolean' as const },
        { label: 'Data da Assinatura', value: data?.dataAssinatura, type: 'datetime' as const },
        { label: 'Confirmado Por', value: data?.usuarioConfirmacao },
    ].filter(f => f.value !== undefined && f.value !== null && f.value !== ''),

    // Etapa 12: Ativar Contrato (etapa de ação, sem dados persistidos)
    12: () => [
        { label: 'Status', value: 'Contrato Ativado' },
    ],
};

/**
 * Componente de resumo customizado para Etapa 6 (Gerar Proposta)
 * Exibe: Data/Hora, Responsável, botões de Visualizar e Baixar PDF
 */
function PropostaSummary({ data, pdfUrl, responsavel }: {
    data: Record<string, unknown>;
    pdfUrl?: string;
    responsavel?: string;
}) {
    // Formatar data/hora no formato dd/mm/yy HH:mm
    const formatDateTime = (dateStr?: string | unknown) => {
        if (!dateStr || typeof dateStr !== 'string') return '-';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '-';

            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            return `${day}/${month}/${year} ${hours}:${minutes}`;
        } catch {
            return '-';
        }
    };

    const handleVisualizarPDF = () => {
        if (pdfUrl) {
            window.open(pdfUrl, '_blank');
        }
    };

    const handleBaixarPDF = () => {
        if (pdfUrl) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = 'proposta.pdf';
            link.click();
        }
    };

    const propostaGerada = !!data?.propostaGerada;
    const dataGeracao = formatDateTime(data?.dataGeracao as string);

    return (
        <div className="space-y-4">
            {/* Info Row */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">Data e Hora</p>
                    <p className="text-sm font-medium">{dataGeracao}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Responsável</p>
                    <p className="text-sm font-medium">{responsavel || '-'}</p>
                </div>
            </div>

            {/* PDF Actions */}
            {propostaGerada && pdfUrl && (
                <div className="flex gap-3 pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleVisualizarPDF}
                        className="gap-2"
                    >
                        <Eye className="h-4 w-4" />
                        Visualizar PDF
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBaixarPDF}
                        className="gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Baixar PDF
                    </Button>
                </div>
            )}

            {/* Estado se não gerado */}
            {!propostaGerada && (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Proposta ainda não gerada</span>
                </div>
            )}
        </div>
    );
}

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
    const { currentUser } = useAuth();

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
        refreshEtapas, // ✅ FIX: Adicionado para sincronizar estado após saves
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

    // NOTA: Adendos agora são gerenciados pelo StepReadOnlyWithAdendos wrapper

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

    // NOTA: Handler de adendo removido temporariamente
    // Será reimplementado quando integrarmos adendos diretamente aos componentes read-only


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
                            dados_etapa: { leadId, ...etapa1Data }, // 🐛 FIX: Usar etapa1Data (local) em vez de formDataByStep
                            data_conclusao: new Date().toISOString(),
                        }).eq('id', etapa1.id);

                        // Sync local state to workflow state
                        setStepData(1, { leadId, ...etapa1Data });
                    }

                    logger.log('✅ OS criada:', newOsId);
                } catch (error) {
                    logger.error('❌ Erro ao criar OS:', error);
                    toast.error('Não foi possível criar a OS');
                    return;
                }
            } else {
                // Se OS já existe e estamos na etapa 1, salvar dados explicitamente
                logger.log('💾 Salvando edição da Etapa 1...');
                await saveStep(1, false, { leadId, ...etapa1Data });
            }
        } else {
            // Outras etapas: salvar dados com dados explícitos para evitar race conditions
            try {
                const currentData = formDataByStep[currentStep] || {};
                logger.log(`💾 Salvando Etapa ${currentStep} com ${Object.keys(currentData).length} campos`);
                await saveStep(currentStep, false, currentData);

                // ✅ FIX: Sincronizar estado após salvar
                await refreshEtapas();
            } catch (error) {
                logger.error('❌ Erro ao salvar etapa:', error);
                toast.error('Erro ao salvar dados');
                return;
            }
        }

        // NOTA: Sistema de aprovação removido - avanço direto sem verificação

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
                                // ✅ FIX: Incluir TODOS os dados do lead (identificacao + edificacao + endereco)
                                setStepData(1, {
                                    ...etapa1Data,
                                    leadId: id,
                                    // Dados de Identificação
                                    nome: data.identificacao?.nome,
                                    cpfCnpj: data.identificacao?.cpfCnpj,
                                    email: data.identificacao?.email,
                                    telefone: data.identificacao?.telefone,
                                    tipo: data.identificacao?.tipo,
                                    nomeResponsavel: data.identificacao?.nomeResponsavel,
                                    cargoResponsavel: data.identificacao?.cargoResponsavel,
                                    // Dados de Edificação
                                    tipoEdificacao: data.edificacao?.tipoEdificacao,
                                    qtdBlocos: data.edificacao?.qtdBlocos,
                                    qtdUnidades: data.edificacao?.qtdUnidades,
                                    qtdPavimentos: data.edificacao?.qtdPavimentos,
                                    tipoTelhado: data.edificacao?.tipoTelhado,
                                    possuiElevador: data.edificacao?.possuiElevador,
                                    possuiPiscina: data.edificacao?.possuiPiscina,
                                    // Dados de Endereço
                                    cep: data.endereco?.cep,
                                    rua: data.endereco?.rua,
                                    numero: data.endereco?.numero,
                                    complemento: data.endereco?.complemento,
                                    bairro: data.endereco?.bairro,
                                    cidade: data.endereco?.cidade,
                                    estado: data.endereco?.estado,
                                    // Manter estrutura aninhada para compatibilidade com LeadSummaryWithTabs
                                    identificacao: data.identificacao,
                                    edificacao: data.edificacao,
                                    endereco: data.endereco,
                                });
                                logger.log(`✅ Lead ${id} carregado com dados completos`);
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
     * Renderiza o resumo de uma etapa concluída usando COMPONENTES ORIGINAIS em modo read-only
     * 
     * ✅ FIX v2.0: Arquitetura Read-Only Unificada
     * - Usa os mesmos componentes do formulário com readOnly=true
     * - Resolve problemas de [object Object] em anexos e especificações técnicas
     * - Mantém consistência visual entre edição e visualização
     * 
     * ✅ FIX v2.1: Integração de Adendos
     * - Cada etapa concluída (exceto etapa 1) tem seção de adendos
     * - Wrapper StepReadOnlyWithAdendos gerencia hook de adendos
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderSummary = (step: number, data: any) => {
        // Obter etapa do banco para ter acesso ao ID
        const stepEtapa = etapas?.find(e => e.ordem === step);
        const etapaId = stepEtapa?.id;

        // 🆕 Etapa 1 (Identifique o Lead): Exibição especial com tabs, SEM adendos
        if (step === 1) {
            return <LeadSummaryWithTabs data={data} />;
        }

        // 🆕 Etapa 2 (Tipo de OS): Exibição simples COM adendos
        if (step === 2) {
            return (
                <StepReadOnlyWithAdendos etapaId={etapaId} readonly={readonly}>
                    <StepSelecaoTipoAssessoria
                        data={data}
                        onDataChange={() => { }} // No-op em read-only
                        readOnly={true}
                    />
                </StepReadOnlyWithAdendos>
            );
        }

        // 🆕 Etapa 3 (Follow-up 1): Componente original com anexos
        if (step === 3) {
            const FollowupComponent = tipoOS === 'OS-05' ? StepFollowup1OS5 : StepFollowup1OS6;
            return (
                <StepReadOnlyWithAdendos etapaId={etapaId} readonly={readonly}>
                    <FollowupComponent
                        data={data}
                        onDataChange={() => { }} // No-op em read-only
                        readOnly={true}
                        osId={finalOsId || undefined}
                    />
                </StepReadOnlyWithAdendos>
            );
        }

        // 🆕 Etapa 4 (Escopo): Componente original com tabela de especificações
        if (step === 4) {
            return (
                <StepReadOnlyWithAdendos etapaId={etapaId} readonly={readonly}>
                    <StepEscopoAssessoria
                        data={data}
                        onDataChange={() => { }} // No-op em read-only
                        readOnly={true}
                        tipoOS={tipoOS}
                    />
                </StepReadOnlyWithAdendos>
            );
        }

        // 🆕 Etapa 5 (Precificação): Componente original com campos monetários
        if (step === 5) {
            return (
                <StepReadOnlyWithAdendos etapaId={etapaId} readonly={readonly}>
                    <StepPrecificacaoAssessoria
                        data={data}
                        onDataChange={() => { }} // No-op em read-only
                        readOnly={true}
                    />
                </StepReadOnlyWithAdendos>
            );
        }

        // 🆕 Etapa 6 (Gerar Proposta): Exibição com PDF preview e botões
        if (step === 6) {
            return (
                <StepReadOnlyWithAdendos etapaId={etapaId} readonly={readonly}>
                    <PropostaSummary
                        data={data}
                        pdfUrl={data?.pdfUrl as string}
                        responsavel={currentUser?.nome_completo || currentUser?.email || '-'}
                    />
                </StepReadOnlyWithAdendos>
            );
        }

        // 🆕 Etapa 7 (Agendar Apresentação)
        if (step === 7) {
            return (
                <StepReadOnlyWithAdendos etapaId={etapaId} readonly={readonly}>
                    <StepAgendarApresentacao
                        osId={finalOsId || ''}
                        data={data}
                        onDataChange={() => { }} // No-op em read-only
                        readOnly={true}
                    />
                </StepReadOnlyWithAdendos>
            );
        }

        // 🆕 Etapa 8 (Realizar Apresentação)
        if (step === 8) {
            return (
                <StepReadOnlyWithAdendos etapaId={etapaId} readonly={readonly}>
                    <StepRealizarApresentacao
                        data={data}
                        onDataChange={() => { }} // No-op em read-only
                        readOnly={true}
                    />
                </StepReadOnlyWithAdendos>
            );
        }

        // 🆕 Etapa 9 (Análise e Relatório)
        if (step === 9) {
            return (
                <StepReadOnlyWithAdendos etapaId={etapaId} readonly={readonly}>
                    <StepAnaliseRelatorio
                        data={data}
                        onDataChange={() => { }} // No-op em read-only
                        readOnly={true}
                    />
                </StepReadOnlyWithAdendos>
            );
        }

        // 🆕 Etapa 10 (Gerar Contrato): Com PDF
        if (step === 10) {
            return (
                <StepReadOnlyWithAdendos etapaId={etapaId} readonly={readonly}>
                    <StepGerarContrato
                        data={{
                            ...data,
                            osId: finalOsId || '',
                            codigoOS: os?.codigo_os || '',
                        }}
                        onDataChange={() => { }} // No-op em read-only
                        readOnly={true}
                    />
                </StepReadOnlyWithAdendos>
            );
        }

        // 🆕 Etapa 11 (Contrato Assinado)
        if (step === 11) {
            return (
                <StepReadOnlyWithAdendos etapaId={etapaId} readonly={readonly}>
                    <StepContratoAssinado
                        data={data}
                        onDataChange={() => { }} // No-op em read-only
                        readOnly={true}
                    />
                </StepReadOnlyWithAdendos>
            );
        }

        // 🆕 Etapa 12 (Ativar Contrato): Botão final
        if (step === 12) {
            return (
                <StepReadOnlyWithAdendos etapaId={etapaId} readonly={readonly}>
                    <StepAtivarContratoAssessoria
                        tipoOS={tipoOS}
                        onAtivarContrato={() => { }} // No-op em read-only
                        readOnly={true}
                    />
                </StepReadOnlyWithAdendos>
            );
        }

        // Fallback: usar WorkflowStepSummary (legacy)
        const configFn = OS_56_SUMMARY_CONFIG[step];
        if (!configFn) return null;
        return <WorkflowStepSummary fields={configFn(data)} />;
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
        </div>
    );
}

export type { OS56WorkflowPageProps };
