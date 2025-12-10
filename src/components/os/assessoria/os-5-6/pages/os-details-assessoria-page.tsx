"use client";

import { logger } from '@/lib/utils/logger';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkflowStepper, WorkflowStep } from '@/components/os/shared/components/workflow-stepper';
import { WorkflowFooter } from '@/components/os/shared/components/workflow-footer';
import { toast } from '@/lib/utils/safe-toast';
import { supabase } from '@/lib/supabase-client';
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '@/lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
import { useCreateOSWorkflow } from '@/lib/hooks/use-os-workflows';
import { useOS } from '@/lib/hooks/use-os';

// Componentes compartilhados
import { CadastrarLead, type CadastrarLeadHandle } from '@/components/os/shared/steps/cadastrar-lead';
import { StepFollowup1, type StepFollowup1Handle } from '@/components/os/shared/steps/step-followup-1';
import { StepFollowup1OS5, type StepFollowup1OS5Handle } from '@/components/os/shared/steps/step-followup-1-os5';
import { StepFollowup1OS6, type StepFollowup1OS6Handle } from '@/components/os/shared/steps/step-followup-1-os6';
import { StepPrecificacaoAssessoria } from '@/components/os/shared/steps/step-precificacao-assessoria';
import { StepGerarProposta } from '@/components/os/shared/steps/step-gerar-proposta';
import { StepAgendarApresentacao } from '@/components/os/shared/steps/step-agendar-apresentacao';
import { StepRealizarApresentacao } from '@/components/os/shared/steps/step-realizar-apresentacao';
import { StepFollowup3 } from '@/components/os/shared/steps/step-followup-3';
import { StepGerarContrato } from '@/components/os/shared/steps/step-gerar-contrato';
import { StepContratoAssinado } from '@/components/os/shared/steps/step-contrato-assinado';

// Componentes específicos de Assessoria
import { StepSelecaoTipoAssessoria } from '@/components/os/assessoria/os-5-6/steps/step-selecao-tipo-assessoria';
import { StepAtivarContratoAssessoria } from '@/components/os/assessoria/os-5-6/steps/step-ativar-contrato-assessoria';
import { StepEscopoAssessoria, type StepEscopoAssessoriaHandle, type StepEscopoAssessoriaData } from '@/components/os/shared/steps/step-escopo-assessoria';

// Definição das 12 etapas do fluxo OS 05-06
const steps: WorkflowStep[] = [
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

interface OSDetailsAssessoriaPageProps {
  onBack?: () => void;
  tipoOS?: 'OS-05' | 'OS-06';
  osId?: string; // ID da OS para persistência
}

export function OSDetailsAssessoriaPage({ onBack, tipoOS = 'OS-05', osId: osIdProp }: OSDetailsAssessoriaPageProps) {
  // Estado interno para armazenar osId criada dinamicamente
  const [internalOsId, setInternalOsId] = useState<string | null>(null);

  // Usar osIdProp (editando OS existente) ou internalOsId (criando nova OS)
  const osId = osIdProp || internalOsId;

  // Hooks de integração
  const { os } = useOS(osId || undefined);
  const createOSMutationHook = useCreateOSWorkflow();

  // Hook de Estado do Workflow
  // Converter osId de null para undefined para compatibilidade com o hook
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
    osId: osId || undefined,
    totalSteps: steps.length
  });

  // Hook de Navegação (SEM handleNextStep automático)
  const {
    handleStepClick,
    handleReturnToActive,
    handlePrevStep
  } = useWorkflowNavigation({
    totalSteps: steps.length,
    currentStep,
    setCurrentStep,
    lastActiveStep,
    setLastActiveStep,
    isHistoricalNavigation,
    setIsHistoricalNavigation,
    // ❌ NÃO usar onSaveStep aqui - vamos implementar handleNextStep customizado
  });

  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [showLeadCombobox, setShowLeadCombobox] = useState(false);
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refs para componentes com validação imperativa
  const stepLeadRef = useRef<CadastrarLeadHandle>(null);
  const stepFollowup1Ref = useRef<StepFollowup1Handle>(null);
  const stepFollowup1OS5Ref = useRef<StepFollowup1OS5Handle>(null);
  const stepFollowup1OS6Ref = useRef<StepFollowup1OS6Handle>(null);
  const stepEscopoRef = useRef<StepEscopoAssessoriaHandle>(null);

  // Mapeamento de dados para compatibilidade com componentes existentes
  const etapa1Data = formDataByStep[1] || { leadId: '' };
  const etapa2Data = formDataByStep[2] || { tipoOS: '' };
  const etapa3Data = formDataByStep[3] || {
    idadeEdificacao: '',
    motivoProcura: '',
    quandoAconteceu: '',
    oqueFeitoARespeito: '',
    existeEscopo: '',
    previsaoOrcamentaria: '',
    grauUrgencia: '',
    apresentacaoProposta: '',
    nomeContatoLocal: '',
    telefoneContatoLocal: '',
    cargoContatoLocal: '',
  };
  const etapa4Data: Partial<StepEscopoAssessoriaData> = formDataByStep[4] || {
    objetivo: '',
    especificacoesTecnicas: [],
    metodologia: '',
    prazo: {
      planejamentoInicial: '',
      logisticaTransporte: '',
      levantamentoCampo: '',
      composicaoLaudo: '',
      apresentacaoCliente: '',
    },
    garantia: '',
  };
  const etapa5Data = formDataByStep[5] || {
    custoBase: '',
    percentualImposto: '14',
    percentualEntrada: '40',
    numeroParcelas: '2',
  };
  const etapa6Data = formDataByStep[6] || {
    propostaGerada: false,
    dataGeracao: '',
  };
  const etapa7Data = formDataByStep[7] || { dataAgendamento: '' };
  const etapa8Data = formDataByStep[8] || { apresentacaoRealizada: false };
  const etapa9Data = formDataByStep[9] || {
    interesseCliente: '',
    pontosDuvida: '',
    proximosPassos: '',
    dataRetorno: '',
  };
  const etapa10Data = formDataByStep[10] || {
    contratoFile: null as File | null,
    dataUpload: '',
  };
  const etapa11Data = formDataByStep[11] || {
    contratoAssinado: false,
    dataAssinatura: '',
  };

  // Setters wrappers
  const setEtapa1Data = (data: any) => setStepData(1, data);
  const setEtapa2Data = (data: any) => setStepData(2, data);
  const setEtapa3Data = (data: any) => setStepData(3, data);
  const setEtapa4Data = (data: any) => setStepData(4, data);
  const setEtapa5Data = (data: any) => setStepData(5, data);
  const setEtapa6Data = (data: any) => setStepData(6, data);
  const setEtapa7Data = (data: any) => setStepData(7, data);
  const setEtapa8Data = (data: any) => setStepData(8, data);
  const setEtapa9Data = (data: any) => setStepData(9, data);
  const setEtapa10Data = (data: any) => setStepData(10, data);
  const setEtapa11Data = (data: any) => setStepData(11, data);

  // ============================================================================
  // HANDLER CUSTOMIZADO: Criar OS obrigatória na Etapa 1
  // ============================================================================
  const handleNextStep = async () => {
    logger.log('🔍 [Assessoria] handleNextStep chamado', {
      currentStep,
      osId,
      hasLeadId: !!etapa1Data.leadId
    });

    // ETAPA 1: VALIDAR E CRIAR OS OBRIGATORIAMENTE
    if (currentStep === 1) {
      logger.log('✅ Etapa 1 detectada - Criação de OS obrigatória');

      // Validar que o lead foi selecionado
      if (!stepLeadRef.current) {
        toast.error('Erro: Componente de cadastro não inicializado');
        return;
      }

      // Validar formulário
      const isValid = stepLeadRef.current.validate();
      if (!isValid) {
        toast.error('Preencha todos os campos obrigatórios antes de continuar');
        return;
      }

      // Salvar dados do lead (validação)
      logger.log('💾 Validando dados do Lead...');
      const leadId = await stepLeadRef.current.saveData();

      if (!leadId) {
        logger.error('❌ Falha ao validar Lead na Etapa 1');
        toast.error('Selecione um lead antes de continuar.');
        return;
      }

      logger.log('✅ Lead validado:', leadId);

      // Criar a OS vinculada ao lead
      // Nota: O tipo de OS será definido na Etapa 2, então criamos com um tipo padrão (OS-05)
      logger.log('🔧 Criando OS para o lead...');
      const tipoOS = etapa2Data.tipoOS || 'OS-05';

      try {
        // Buscar o usuário atual para definir como responsável
        const user = (await supabase.auth.getUser()).data.user;
        const responsavelId = user?.id || null;

        // Criar a OS usando o mutation hook
        const result = await createOSMutationHook.mutate({
          tipoOSCodigo: tipoOS,
          clienteId: leadId,
          ccId: '', // Será definido depois
          responsavelId: responsavelId,
          descricao: `${tipoOS === 'OS-05' ? 'Assessoria Técnica' : 'Assessoria Pericial'} - Lead em análise`,
          metadata: {
            leadId: leadId,
            origem: 'workflow_assessoria'
          },
          etapas: steps.map((step, index) => ({
            nome_etapa: step.title,
            ordem: index + 1,
            dados_etapa: {}
          }))
        });

        if (!result?.os?.id) {
          throw new Error('OS criada mas sem ID retornado');
        }

        const newOsId = result.os.id as string;
        logger.log('✅ OS criada com sucesso. ID:', newOsId);

        // Marcar etapa 1 como concluída diretamente (não depender do estado React)
        const etapa1 = (result.etapas as Array<{ id: string; ordem: number }>)?.find(e => e.ordem === 1);
        if (etapa1?.id) {
          logger.log('📝 Marcando etapa 1 como concluída...');
          const { error: updateError } = await supabase
            .from('os_etapas')
            .update({
              status: 'concluida',
              dados_etapa: {
                leadId: leadId,
                ...formDataByStep[1]
              },
              data_conclusao: new Date().toISOString()
            })
            .eq('id', etapa1.id);

          if (updateError) {
            logger.error('❌ Erro ao marcar etapa 1 como concluída:', updateError);
          } else {
            logger.log('✅ Etapa 1 marcada como concluída');
          }
        }

        // Atualizar estado interno com o novo ID
        setInternalOsId(newOsId);
        // Pequeno delay para garantir que o estado atualizou
        await new Promise(resolve => window.setTimeout(resolve, 100));
      } catch (error) {
        logger.error('❌ Erro ao criar OS:', error);
        toast.error('Não foi possível criar a Ordem de Serviço. Tente novamente.');
        return;
      }
    }

    // ETAPAS 2-12: Validação específica por etapa
    else {
      // Etapa 3: Validar Follow-up 1
      if (currentStep === 3 && stepFollowup1Ref.current) {
        if (!stepFollowup1Ref.current.isFormValid()) {
          toast.error('Preencha todos os campos obrigatórios do Follow-up 1');
          return;
        }
      }

      // Etapa 4: Validar Escopo de Assessoria
      if (currentStep === 4 && stepEscopoRef.current) {
        if (!stepEscopoRef.current.isFormValid()) {
          toast.error('Preencha todos os campos obrigatórios do Escopo de Assessoria');
          return;
        }
      }

      // Salvar etapa atual
      try {
        await saveStep(currentStep, false);
        logger.log(`✅ Etapa ${currentStep} salva no banco`);
      } catch (error) {
        logger.error(`❌ Erro ao salvar etapa ${currentStep}:`, error);
        toast.error('Erro ao salvar dados. Tente novamente.');
        return;
      }
    }

    // Avançar para próxima etapa
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setLastActiveStep(currentStep + 1);
      logger.log('✅ Avançado para etapa:', currentStep + 1);
      toast.success('Etapa concluída!', { icon: '✅' });
    }
  };

  // Estado do formulário de novo lead
  const [formData, setFormData] = useState({
    nome: '',
    cpfCnpj: '',
    tipo: '',
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
  });

  // ✅ FIX: Wrapper para sincronizar formData com formDataByStep[1]
  // Quando o usuário edita campos no formulário, precisamos atualizar ambos os estados
  const handleFormDataChange = (newFormData: typeof formData) => {
    setFormData(newFormData);

    // Sincronizar com formDataByStep[1] para garantir que os dados sejam salvos
    setEtapa1Data({
      ...newFormData,
      leadId: selectedLeadId || etapa1Data?.leadId || '',
    });
  };

  // Sincronizar selectedLeadId com etapa1Data
  useEffect(() => {
    if (etapa1Data.leadId && etapa1Data.leadId !== selectedLeadId) {
      setSelectedLeadId(etapa1Data.leadId);
    }
  }, [etapa1Data.leadId]);

  // Calcular quais etapas estão concluídas
  // Combinar lógica local (preenchimento) com lógica do hook (status APROVADA)
  // Regras de completude
  const completionRules = useMemo(() => ({
    1: (data: any) => !!data.leadId,
    2: (data: any) => !!data.tipoOS,
    3: (data: any) => !!(data.motivoProcura && data.idadeEdificacao),
    4: (data: any) => !!(data.objetivo && data.especificacoesTecnicas?.length > 0), // Novo formato de escopo assessoria
    5: (data: any) => !!data.custoBase && parseFloat(data.custoBase.replace(/[^\d,.-]/g, '').replace(',', '.')) > 0,
    6: (data: any) => !!data.propostaGerada,
    7: (data: any) => !!data.dataAgendamento,
    8: (data: any) => !!data.apresentacaoRealizada,
    9: (data: any) => !!data.interesseCliente,
    10: (data: any) => !!data.contratoFile,
    11: (data: any) => !!data.contratoAssinado,
  }), []);

  const { completedSteps } = useWorkflowCompletion({
    currentStep,
    formDataByStep,
    completionRules,
    completedStepsFromHook
  });

  // Verificar se o formulário da etapa atual está inválido
  const isCurrentStepInvalid = useMemo(() => {
    if (isHistoricalNavigation) return false;

    switch (currentStep) {
      case 1:
        // Apenas verificar se tem leadId, não validar formulário completo
        return !etapa1Data.leadId;
      case 3:
        return stepFollowup1Ref.current?.isFormValid() === false;
      case 4:
        return stepEscopoRef.current?.isFormValid() === false;
      default:
        return false;
    }
  }, [currentStep, isHistoricalNavigation, etapa1Data.leadId]);

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    setEtapa1Data({ ...etapa1Data, leadId });
  };

  // Handler para finalizar etapa e criar OS filha
  const handleConcluirEtapa = async () => {
    try {
      setIsSaving(true);

      // 1. Salvar Step 12 como concluída
      const saved = await saveStep(currentStep, false);
      if (!saved && osId) {
        toast.error('Erro ao salvar etapa final');
        return;
      }

      // 2. Obter tipo de OS selecionado na Step 2
      const tipoOSSelecionado = formDataByStep[2]?.tipoOS || tipoOS;

      // 3. Determinar OS filha a criar
      const osFilhaCodigo = tipoOSSelecionado === 'OS-05' ? 'OS-12' : 'OS-11';
      const osFilhaNome = tipoOSSelecionado === 'OS-05'
        ? 'Execução de Assessoria Mensal'
        : 'Execução de Laudo Pontual';

      // 4. Se não tem osId, apenas simula
      if (!osId || !os) {
        toast.success(`Contrato ativado! ${osFilhaCodigo} seria criada automaticamente.`);
        if (onBack) onBack();
        return;
      }

      // 5. Preparar dados para criação da OS filha
      const clienteId = formDataByStep[1]?.leadId || os.cliente_id;
      const ccId = os.cc_id ?? null;
      const responsavelId = os.responsavel_id ?? null;
      const codigoOS = os.codigo_os;

      // 6. Definir etapas iniciais da OS filha
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

      // 7. Criar OS filha
      logger.log(`🔗 Criando ${osFilhaCodigo} vinculada à ${codigoOS}...`);

      try {
        const resultData = await createOSMutationHook.mutate({
          tipoOSCodigo: osFilhaCodigo,
          clienteId,
          ccId: ccId || '',
          responsavelId,
          descricao: `${osFilhaNome} - Gerado automaticamente a partir de ${codigoOS}`,
          metadata: {
            parentOSId: osId,
            contratoOrigem: codigoOS,
            tipoContratoOrigem: tipoOSSelecionado,
            dataGeracao: new Date().toISOString(),
          },
          etapas: etapasFilha,
          parentOSId: osId,
        });

        logger.log(`✅ ${osFilhaCodigo} criada com sucesso:`, resultData);

        // 8. Atualizar status da OS atual para "concluido"
        const { error: updateError } = await supabase
          .from('ordens_servico')
          .update({
            status_geral: 'concluido',
            updated_at: new Date().toISOString()
          })
          .eq('id', osId);

        if (updateError) {
          logger.error('Erro ao atualizar status da OS:', updateError);
          toast.error('OS filha criada, mas houve erro ao atualizar status da OS pai');
        } else {
          logger.log('✅ Status da OS atualizado para concluido');
        }

        toast.success(`Contrato ativado! ${osFilhaCodigo} criada automaticamente.`);
        if (onBack) onBack();
      } catch (mutationError) {
        const errorMsg = mutationError instanceof Error ? mutationError.message : 'Erro desconhecido';
        logger.error(`❌ Erro ao criar ${osFilhaCodigo}:`, mutationError);
        toast.error(`Erro ao criar ${osFilhaCodigo}: ${errorMsg}`);
      }
    } catch (error) {
      logger.error('Erro ao ativar contrato:', error);
      toast.error('Erro ao ativar contrato');
    } finally {
      setIsSaving(false);
    }
  };

  // Wrapper para salvar rascunho
  const handleSaveDraft = async () => {
    setIsSaving(true);
    await saveStep(currentStep, true);
    setIsSaving(false);
    toast.success('Rascunho salvo com sucesso!');
  };

  // ✅ Calcular valores financeiros da etapa 5 (Precificação)
  const valoresFinanceiros = useMemo(() => {
    const precoFinal = parseFloat(etapa5Data?.precoFinal || etapa5Data?.valorBase || '0');
    const percentualEntrada = parseFloat(etapa5Data?.percentualEntrada || '0');
    const numeroParcelas = parseFloat(etapa5Data?.numeroParcelas || '1') || 1;

    const valorTotal = precoFinal;
    const valorEntrada = valorTotal * (percentualEntrada / 100);
    const valorParcela = numeroParcelas > 0 ? (valorTotal - valorEntrada) / numeroParcelas : 0;

    return { valorTotal, valorEntrada, valorParcela };
  }, [etapa5Data]);

  // ✅ FIX: Enriquecer dados da Step 6 (Proposta) com dados de etapas anteriores
  const etapa6DataEnriquecido = useMemo(() => ({
    ...etapa6Data,
    osId: osId || '',
    codigoOS: os?.codigo_os || '',
    clienteNome: formDataByStep[1]?.nome || os?.cliente?.nome_razao_social || '',
    clienteCpfCnpj: formDataByStep[1]?.cpfCnpj || os?.cliente?.cpf_cnpj || '',
    clienteEmail: formDataByStep[1]?.email || os?.cliente?.email || '',
    clienteTelefone: formDataByStep[1]?.telefone || os?.cliente?.telefone || '',
    descricaoServico: formDataByStep[4]?.descricaoServico || '',
    valorProposta: valoresFinanceiros.valorTotal,
  }), [etapa6Data, osId, os, formDataByStep, valoresFinanceiros]);

  // ✅ FIX: Enriquecer dados da Step 10 (Contrato) com dados compilados
  const etapa10DataEnriquecido = useMemo(() => ({
    ...etapa10Data,
    osId: osId || '',
    codigoOS: os?.codigo_os || '',
    numeroContrato: os?.codigo_os || '',
    clienteNome: formDataByStep[1]?.nome || os?.cliente?.nome_razao_social || '',
    clienteCpfCnpj: formDataByStep[1]?.cpfCnpj || os?.cliente?.cpf_cnpj || '',
    valorContrato: parseFloat(formDataByStep[5]?.valorBase || '0'),
    dataInicio: new Date().toISOString().split('T')[0],
    objetoContrato: formDataByStep[4]?.descricaoServico || '',
  }), [etapa10Data, osId, os, formDataByStep]);

  return (
    <div className="h-screen flex flex-col bg-background">

      {/* Stepper Horizontal */}
      <div className="relative">
        <WorkflowStepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          completedSteps={completedSteps}
          lastActiveStep={lastActiveStep || undefined}
        />

      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                </div>
                <Badge variant="outline" className="border-primary text-primary">
                  Etapa {currentStep} de {steps.length}
                </Badge>
              </div>

            </CardHeader>
            <CardContent className="space-y-6 flex-1 overflow-y-auto">

              {/* ETAPA 1: Identificação do Cliente/Lead */}
              {currentStep === 1 && (
                <CadastrarLead
                  ref={stepLeadRef}
                  selectedLeadId={selectedLeadId}
                  onSelectLead={handleSelectLead}
                  showCombobox={showLeadCombobox}
                  onShowComboboxChange={setShowLeadCombobox}
                  showNewLeadDialog={showNewLeadDialog}
                  onShowNewLeadDialogChange={setShowNewLeadDialog}
                  formData={formData}
                  onFormDataChange={handleFormDataChange}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 2: Seleção do Tipo de OS */}
              {currentStep === 2 && (
                <StepSelecaoTipoAssessoria
                  data={etapa2Data}
                  onDataChange={setEtapa2Data}
                />
              )}

              {/* ETAPA 3: Follow-up 1 (Entrevista Inicial) */}
              {currentStep === 3 && (
                tipoOS === 'OS-05' ? (
                  <StepFollowup1OS5
                    ref={stepFollowup1OS5Ref}
                    data={etapa3Data}
                    onDataChange={setEtapa3Data}
                    readOnly={isHistoricalNavigation}
                    osId={osId || undefined}
                  />
                ) : tipoOS === 'OS-06' ? (
                  <StepFollowup1OS6
                    ref={stepFollowup1OS6Ref}
                    data={etapa3Data}
                    onDataChange={setEtapa3Data}
                    readOnly={isHistoricalNavigation}
                    osId={osId || undefined}
                  />
                ) : (
                  <StepFollowup1
                    ref={stepFollowup1Ref}
                    data={etapa3Data}
                    onDataChange={setEtapa3Data}
                    readOnly={isHistoricalNavigation}
                  />
                )
              )}

              {/* ETAPA 4: Escopo de Assessoria (Objetivo, Especificações, Prazo) */}
              {currentStep === 4 && (
                <StepEscopoAssessoria
                  ref={stepEscopoRef}
                  data={etapa4Data}
                  onDataChange={setEtapa4Data}
                  readOnly={isHistoricalNavigation}
                  tipoOS={tipoOS}
                />
              )}

              {/* ETAPA 5: Precificação (Custo Base Editável) */}
              {currentStep === 5 && (
                <StepPrecificacaoAssessoria
                  data={etapa5Data}
                  onDataChange={setEtapa5Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 6: Gerar Proposta Comercial */}
              {currentStep === 6 && (
                <StepGerarProposta
                  osId={osId || ''}
                  tipoOS={formDataByStep[2]?.tipoOS || tipoOS}
                  etapa1Data={formDataByStep[1] || {}}
                  etapa2Data={formDataByStep[2] || {}}
                  etapa7Data={etapa4Data} // Escopo de Assessoria (etapa 4)
                  etapa8Data={etapa5Data} // Precificação (etapa 5)
                  valorTotal={valoresFinanceiros.valorTotal}
                  valorEntrada={valoresFinanceiros.valorEntrada}
                  valorParcela={valoresFinanceiros.valorParcela}
                  data={etapa6DataEnriquecido}
                  onDataChange={setEtapa6Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 7: Agendar Visita (Apresentação) */}
              {currentStep === 7 && (
                <StepAgendarApresentacao
                  osId={osId || ''}
                  data={etapa7Data}
                  onDataChange={setEtapa7Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 8: Realizar Visita (Apresentação) */}
              {currentStep === 8 && (
                <StepRealizarApresentacao
                  data={etapa8Data}
                  onDataChange={setEtapa8Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 9: Follow-up 3 (Pós-Apresentação) */}
              {currentStep === 9 && (
                <StepFollowup3
                  data={etapa9Data}
                  onDataChange={setEtapa9Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 10: Gerar Contrato (Upload) */}
              {currentStep === 10 && (
                <StepGerarContrato
                  data={etapa10DataEnriquecido}
                  onDataChange={setEtapa10Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 11: Contrato Assinado */}
              {currentStep === 11 && (
                <StepContratoAssinado
                  data={etapa11Data}
                  onDataChange={setEtapa11Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 12: Ativar Contrato */}
              {currentStep === 12 && (
                <StepAtivarContratoAssessoria
                  tipoOS={tipoOS}
                  onAtivarContrato={handleConcluirEtapa}
                  readOnly={isHistoricalNavigation}
                />
              )}
            </CardContent>

            <WorkflowFooter
              currentStep={currentStep}
              totalSteps={steps.length}
              onPrevStep={handlePrevStep}
              onNextStep={currentStep === steps.length ? handleConcluirEtapa : handleNextStep}
              onSaveDraft={handleSaveDraft}
              prevButtonText="Anterior"
              nextButtonText="Salvar e Avançar"
              finalButtonText="Ativar Contrato"
              readOnlyMode={isHistoricalNavigation}
              onReturnToActive={handleReturnToActive}
              isFormInvalid={isCurrentStepInvalid}
              invalidFormMessage="Preencha todos os campos obrigatórios para continuar"
              isLoading={isSaving || isLoadingData}
              loadingText={isSaving ? "Salvando..." : "Processando..."}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
