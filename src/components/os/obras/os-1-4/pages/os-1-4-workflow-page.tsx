"use client";

/* eslint-disable no-undef */
// ✅ Declarar globals do navegador para ESLint
declare const performance: Performance;
declare const setTimeout: typeof globalThis.setTimeout;
declare const Promise: PromiseConstructor;

import { logger } from '@/lib/utils/logger';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
  ChevronLeft,
  Loader2
} from 'lucide-react';
import { WorkflowStepper } from '@/components/os/shared/components/workflow-stepper';
import { WorkflowFooter } from '@/components/os/shared/components/workflow-footer';
import { FeedbackTransferencia } from '@/components/os/shared/components/feedback-transferencia';
import { AprovacaoModal } from '@/components/os/shared/components/aprovacao-modal';

import { useTransferenciaSetor } from '@/lib/hooks/use-transferencia-setor';
import { TransferenciaInfo } from '@/types/os-setor-config';
import { LeadCadastro, type LeadCadastroHandle, type LeadCompleto } from '@/components/os/shared/lead-cadastro';
import { StepFollowup1, type StepFollowup1Handle } from '@/components/os/shared/steps/step-followup-1';
import { StepMemorialEscopo, type StepMemorialEscopoHandle } from '@/components/os/shared/steps/step-memorial-escopo';
import { StepPrecificacao } from '@/components/os/shared/steps/step-precificacao';
import { StepGerarProposta as StepGerarPropostaOS0104 } from '@/components/os/shared/steps/step-gerar-proposta';
import { StepAgendarApresentacao } from '@/components/os/shared/steps/step-agendar-apresentacao';
import { StepPrepararOrcamentos } from '@/components/os/shared/steps/step-preparar-orcamentos';
import { StepAnaliseRelatorio } from '@/components/os/shared/steps/step-analise-relatorio';
import { StepRealizarApresentacao } from '@/components/os/shared/steps/step-realizar-apresentacao';
import { StepGerarContrato } from '@/components/os/shared/steps/step-gerar-contrato';
import { StepContratoAssinado } from '@/components/os/shared/steps/step-contrato-assinado';
import { StepRealizarVisita } from '@/components/os/shared/steps/step-realizar-visita';
import { EtapaStartContrato } from '@/components/os/shared/components/etapa-start-contrato';
import { StepSelecaoTipoObras } from '@/components/os/shared/steps/step-selecao-tipo-obras';
import { StepReadOnlyWithAdendos } from '@/components/os/shared/components/step-readonly-with-adendos';
import { ordensServicoAPI, clientesAPI } from '@/lib/api-client';
import { useOrdemServico } from '@/lib/hooks/use-ordens-servico';
import { toast } from '@/lib/utils/safe-toast';
import { ErrorBoundary } from '@/components/error-boundary';
import { validateStep, getStepValidationErrors, hasSchemaForStep } from '@/lib/validations/os-etapas-schema';
import { useAuth } from '@/lib/contexts/auth-context';
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '@/lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
import { OS_WORKFLOW_STEPS, DRAFT_ENABLED_STEPS, TOTAL_WORKFLOW_STEPS } from '@/constants/os-workflow';
import { isValidUUID, mapearTipoOSParaCodigo } from '@/lib/utils/os-workflow-helpers';
import { getSetorIdBySlug, SETOR_SLUG_TO_ID } from '@/lib/constants/colaboradores';
import { supabase } from '@/lib/supabase-client';
import { useAprovacaoEtapa } from '@/lib/hooks/use-aprovacao-etapa';

// ============================================================
// INTERFACES DE DADOS DAS ETAPAS
// ============================================================

interface Etapa1Data {
  leadId?: string;
  nome?: string;
  cpfCnpj?: string;
  email?: string;
  telefone?: string;
  tipo?: 'fisica' | 'juridica';
  nomeResponsavel?: string;
  cargoResponsavel?: string;
  tipoEdificacao?: string;
  qtdUnidades?: string;
  qtdBlocos?: string;
  qtdPavimentos?: string;
  tipoTelhado?: string;
  possuiElevador?: boolean;
  possuiPiscina?: boolean;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

interface Etapa2Data {
  tipoOS?: string;
}

interface Etapa3Data {
  anexos?: ArquivoComComentario[];
  idadeEdificacao?: string;
  motivoProcura?: string;
  quandoAconteceu?: string;
  oqueFeitoARespeito?: string;
  existeEscopo?: string;
  previsaoOrcamentaria?: string;
  grauUrgencia?: string;
  apresentacaoProposta?: string;
  nomeContatoLocal?: string;
  telefoneContatoLocal?: string;
  cargoContatoLocal?: string;
}

interface Etapa4Data {
  dataAgendamento?: string;
}

interface Etapa5Data {
  visitaRealizada?: boolean;
}

interface ArquivoComComentario {
  id: string;
  name: string;
  url: string;
  path: string;
  size: number;
  type: string;
  uploadedAt: string;
  comentario: string;
}

interface Etapa6Data {
  outrasEmpresas?: string;
  comoEsperaResolver?: string;
  expectativaCliente?: string;
  estadoAncoragem?: string;
  fotosAncoragem?: ArquivoComComentario[];
  quemAcompanhou?: string;
  avaliacaoVisita?: string;
  estadoGeralEdificacao?: string;
  servicoResolver?: string;
  arquivosGerais?: ArquivoComComentario[];
}

interface Subetapa {
  nome: string;
  descricao: string;
  total: string;
}

interface EtapaPrincipal {
  nome: string;
  subetapas: Subetapa[];
}

interface Etapa7Data {
  objetivo?: string;
  etapasPrincipais?: EtapaPrincipal[];
  planejamentoInicial?: string;
  logisticaTransporte?: string;
  preparacaoArea?: string;
}

interface Etapa8Data {
  percentualImprevisto?: string;
  percentualLucro?: string;
  percentualImposto?: string;
  percentualEntrada?: string;
  numeroParcelas?: string;
  etapasPrincipais?: EtapaPrincipal[];
}

interface Etapa9Data {
  [key: string]: unknown;
}

interface Etapa10Data {
  [key: string]: unknown;
}

interface Etapa11Data {
  [key: string]: unknown;
}

interface Etapa12Data {
  propostaApresentada?: string;
  metodoApresentacao?: string;
  clienteAchouProposta?: string;
  clienteAchouContrato?: string;
  doresNaoAtendidas?: string;
  indicadorFechamento?: string;
  quemEstavaNaApresentacao?: string;
  nivelSatisfacao?: string;
}

interface Etapa13Data {
  [key: string]: unknown;
}

interface Etapa14Data {
  [key: string]: unknown;
}

interface Etapa15Data {
  [key: string]: unknown;
}

type EtapaData =
  | Etapa1Data
  | Etapa2Data
  | Etapa3Data
  | Etapa4Data
  | Etapa5Data
  | Etapa6Data
  | Etapa7Data
  | Etapa8Data
  | Etapa9Data
  | Etapa10Data
  | Etapa11Data
  | Etapa12Data
  | Etapa13Data
  | Etapa14Data
  | Etapa15Data;

// ============================================================
// DEFINIÇÃO DAS ETAPAS DO WORKFLOW
// ============================================================

// Usar constante importada de os-workflow.ts
const steps = OS_WORKFLOW_STEPS;

interface OS14WorkflowPageProps {
  onBack?: () => void;
  osId?: string;
  initialStep?: number;
  readonly?: boolean;
  parentOSId?: string;
}

export function OS14WorkflowPage({
  onBack,
  osId: osIdProp,
  initialStep,
  parentOSId,
}: OS14WorkflowPageProps = {}) {
  // DEBUG: Track component lifecycle
  React.useEffect(() => {
    logger.log('🎯 OS14WorkflowPage mounted', {
      osId: osIdProp,
      initialStep,
      parentOSId,
      timestamp: new Date().toISOString()
    });

    return () => {
      logger.log('🗑️ OSDetailsWorkflowPage unmounted', {
        osId: osIdProp,
        timestamp: new Date().toISOString()
      });
    };
  }, [osIdProp, initialStep, parentOSId]);

  // Estado interno para armazenar osId criada (diferente da prop osIdProp)
  const [internalOsId, setInternalOsId] = useState<string | null>(null);

  // Estado de loading para criação de OS (Etapa 2 → 3)
  const [isCreatingOS, setIsCreatingOS] = useState(false);

  // Usar osIdProp (editando OS existente) ou internalOsId (criando nova OS)
  const osId = osIdProp || internalOsId;

  // Obter ID do usuário logado
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id || 'user-unknown';

  // Hook de Transferência Automática de Setor
  const { executarTransferencia } = useTransferenciaSetor();

  // Fetch OS details to ensure we have client and type info (fallback for existing OSs)
  const { data: os } = useOrdemServico(osId as string);

  // Hook de Estado do Workflow
  const {
    currentStep,
    setCurrentStep,
    lastActiveStep,
    setLastActiveStep,
    isHistoricalNavigation,
    setIsHistoricalNavigation,
    formDataByStep,
    setStepData: hookSetStepData,
    saveStep,
    saveFormData, // ✅ Added for auto-save in useEffect
    createEtapa,
    completedSteps: completedStepsFromHook,
    isLoading: isLoading,
    etapas,
    refreshEtapas
  } = useWorkflowState({
    osId: osId || undefined,
    totalSteps: TOTAL_WORKFLOW_STEPS,
    initialStep: initialStep || 1
  });


  // Hook de Navegação
  const {
    handleStepClick,
    handleReturnToActive,
    handlePrevStep
  } = useWorkflowNavigation({
    totalSteps: TOTAL_WORKFLOW_STEPS,
    currentStep,
    setCurrentStep,
    lastActiveStep,
    setLastActiveStep,
    isHistoricalNavigation,
    setIsHistoricalNavigation,
    onSaveStep: async (step) => {
      // Se não tem OS ID e não é etapa 1 ou 2, não salva
      if (!osId && step > 2) return true;

      // Se tem OS ID, salva
      if (osId) {
        return await saveStep(step, false);
      }

      return true;
    }
  });

  const [selectedLeadId, setSelectedLeadId] = useState<string>('');


  // Estado para feedback de transferência de setor
  const [isTransferenciaModalOpen, setIsTransferenciaModalOpen] = useState(false);
  const [transferenciaInfo, setTransferenciaInfo] = useState<TransferenciaInfo | null>(null);

  // Estado para modal de aprovação de etapa
  const [isAprovacaoModalOpen, setIsAprovacaoModalOpen] = useState(false);
  const [etapaNomeParaAprovacao, setEtapaNomeParaAprovacao] = useState('');

  // Hook de aprovação de etapa (usando currentStep)
  const {
    aprovacaoInfo,
    podeAprovar,
    solicitarAprovacao,
  } = useAprovacaoEtapa(osId || undefined, currentStep);

  // Refs para componentes com validação imperativa
  const stepLeadRef = useRef<LeadCadastroHandle>(null);
  const stepFollowup1Ref = useRef<StepFollowup1Handle>(null);
  const stepMemorialRef = useRef<StepMemorialEscopoHandle>(null);
  const stepAgendarApresentacaoEtapa4Ref = useRef<any>(null);
  const stepAgendarApresentacaoEtapa10Ref = useRef<any>(null);

  // Calcular quais etapas estão concluídas (status = APROVADA)
  // Regras de completude (Fallback para modo criação)
  const completionRules = useMemo(() => ({
    1: (data: Etapa1Data) => !!data.leadId,
    2: (data: Etapa2Data) => !!data.tipoOS,
  }), []);

  const { completedSteps } = useWorkflowCompletion({
    currentStep,
    formDataByStep,
    completionRules,
    completedStepsFromHook
  });



  // ========================================
  // ESTADO CONSOLIDADO DO FORMULÁRIO
  // ========================================
  // Armazena dados de todas as etapas em um único objeto

  // ========================================
  // HELPERS PARA GERENCIAR FORMULÁRIO
  // ========================================

  // Buscar dados de uma etapa específica
  // Defaults de fields para evitar warnings uncontrolled/controlled
  const STEP_DEFAULTS: Record<number, Record<string, unknown>> = {
    2: { tipoOS: '' },
    3: {
      anexos: [],
      idadeEdificacao: '', motivoProcura: '', quandoAconteceu: '',
      oqueFeitoARespeito: '', existeEscopo: '', previsaoOrcamentaria: '',
      grauUrgencia: '', apresentacaoProposta: '',
      nomeContatoLocal: '', telefoneContatoLocal: '', cargoContatoLocal: '',
    },
    5: { visitaRealizada: false },
    6: {
      fotosAncoragem: [], arquivosGerais: [],
      outrasEmpresas: '', comoEsperaResolver: '', expectativaCliente: '',
      estadoAncoragem: '', quemAcompanhou: '', avaliacaoVisita: '',
      estadoGeralEdificacao: '', servicoResolver: '',
    },
    8: {
      etapasPrincipais: [],
      percentualImprevisto: '', percentualLucro: '',
      percentualImposto: '', percentualEntrada: '', numeroParcelas: '',
    },
    11: { visitaRealizada: false, observacoes: '' },
    12: {
      propostaApresentada: '', metodoApresentacao: '',
      clienteAchouProposta: '', clienteAchouContrato: '',
      doresNaoAtendidas: '', indicadorFechamento: '',
      quemEstavaNaApresentacao: '', nivelSatisfacao: '',
    },
    14: { contratoAssinado: false, dataAssinatura: '', observacoes: '' },
  };

  // Buscar dados de uma etapa específica
  const getStepData = (stepNum: number) => {
    const defaults = STEP_DEFAULTS[stepNum] || {};
    const data = formDataByStep[stepNum];
    return { ...defaults, ...(data || {}) };
  };

  // Atualizar dados de uma etapa (síncrono para inputs controlados)
  const setStepData = (stepNum: number, data: EtapaData) => {
    // Remover debounce no UI update - causa lag em inputs controlados!
    // O debounce deve ser apenas no salvamento (autosave), não no estado local.
    hookSetStepData(stepNum, data);
  };

  // Aliases para compatibilidade com código existente (memoizados para performance)
  const etapa1Data = useMemo(() => getStepData(1), [formDataByStep]);
  const etapa2Data = useMemo(() => getStepData(2), [formDataByStep]);
  const etapa3Data = useMemo(() => getStepData(3), [formDataByStep]);
  const etapa4Data = useMemo(() => getStepData(4), [formDataByStep]);
  const etapa5Data = useMemo(() => getStepData(5), [formDataByStep]);
  const etapa6Data = useMemo(() => getStepData(6), [formDataByStep]);
  const etapa7Data = useMemo(() => getStepData(7), [formDataByStep]);
  const etapa8Data = useMemo(() => getStepData(8), [formDataByStep]);
  const etapa9Data = useMemo(() => getStepData(9), [formDataByStep]);
  const etapa10Data = useMemo(() => getStepData(10), [formDataByStep]);
  const etapa11Data = useMemo(() => getStepData(11), [formDataByStep]);
  const etapa12Data = useMemo(() => getStepData(12), [formDataByStep]);
  const etapa13Data = useMemo(() => getStepData(13), [formDataByStep]);
  const etapa14Data = useMemo(() => getStepData(14), [formDataByStep]);

  // Valores financeiros agora são calculados diretamente na renderização da Etapa 9
  // para garantir consistência e evitar erros de parsing.

  const setEtapa1Data = (data: Etapa1Data) => setStepData(1, data);
  const setEtapa2Data = (data: Etapa2Data) => setStepData(2, data);
  const setEtapa3Data = (data: Etapa3Data) => setStepData(3, data);
  const setEtapa4Data = (data: Etapa4Data) => setStepData(4, data);
  const setEtapa5Data = (data: Etapa5Data | ((_: Etapa5Data) => Etapa5Data)) => {
    if (typeof data === 'function') {
      const currentData = getStepData(5) as Etapa5Data;
      setStepData(5, data(currentData));
    } else {
      setStepData(5, data);
    }
  };
  const setEtapa6Data = (data: Etapa6Data) => setStepData(6, data);
  const setEtapa7Data = (data: Etapa7Data) => setStepData(7, data);
  const setEtapa8Data = (data: Etapa8Data) => setStepData(8, data);
  const setEtapa9Data = (data: Etapa9Data) => setStepData(9, data);
  const setEtapa10Data = (data: Etapa10Data) => setStepData(10, data);
  const setEtapa11Data = (data: Etapa11Data) => setStepData(11, data);
  const setEtapa12Data = (data: Etapa12Data) => setStepData(12, data);
  const setEtapa13Data = (data: Etapa13Data) => setStepData(13, data);
  const setEtapa14Data = (data: Etapa14Data) => setStepData(14, data);

  // ✅ FIX: Use ref to track if we've already synced to prevent infinite loop
  const hasSyncedOSData = useRef(false);

  // Sync OS data to workflow state if missing (fallback for existing OSs)
  useEffect(() => {
    // ✅ FIX: Only sync once per OS load
    if (!os || !etapas || etapas.length === 0 || hasSyncedOSData.current) {
      return;
    }

    // ✅ FIX: Check if formDataByStep[1] already has complete data from dados_etapa
    // This prevents overwriting data that was correctly loaded from the database
    const existingEtapa1 = formDataByStep[1];
    const etapa1Status = etapas.find(e => e.ordem === 1)?.status;

    const hasCompleteData = (existingEtapa1 &&
      existingEtapa1.leadId &&
      existingEtapa1.nome &&
      Object.keys(existingEtapa1).length > 5) ||
      etapa1Status === 'concluida'; // ✅ CRITICAL FIX: If step is completed, NEVER overwrite

    if (hasCompleteData) {
      logger.log('✅ formDataByStep[1] already has complete data from dados_etapa, skipping sync from os.cliente');
      hasSyncedOSData.current = true;
      return;
    }

    // Sync Step 1 (Client) - Complete client data (fallback for legacy OSs without dados_etapa)
    if (os.cliente) {
      const clienteData = os.cliente;
      const currentEtapa1 = formDataByStep[1] || {};
      const syncedEtapa1Data = { ...currentEtapa1 };

      // Sync leadId if missing
      if (!syncedEtapa1Data.leadId && os.cliente_id) {
        syncedEtapa1Data.leadId = os.cliente_id;
      }

      // Sync client details if missing
      if (!syncedEtapa1Data.nome && clienteData.nome_razao_social) {
        syncedEtapa1Data.nome = clienteData.nome_razao_social;
      }
      if (!syncedEtapa1Data.cpfCnpj && clienteData.cpf_cnpj) {
        syncedEtapa1Data.cpfCnpj = clienteData.cpf_cnpj;
      }
      if (!syncedEtapa1Data.email && clienteData.email) {
        syncedEtapa1Data.email = clienteData.email;
      }
      if (!syncedEtapa1Data.telefone && clienteData.telefone) {
        syncedEtapa1Data.telefone = clienteData.telefone;
      }

      // Sync address data if missing
      if (clienteData.endereco) {
        const endereco = clienteData.endereco;
        if (!syncedEtapa1Data.endereco && endereco.rua) {
          syncedEtapa1Data.endereco = endereco.rua;
        }
        if (!syncedEtapa1Data.numero && endereco.numero) {
          syncedEtapa1Data.numero = endereco.numero;
        }
        if (!syncedEtapa1Data.complemento && endereco.complemento) {
          syncedEtapa1Data.complemento = endereco.complemento;
        }
        if (!syncedEtapa1Data.bairro && endereco.bairro) {
          syncedEtapa1Data.bairro = endereco.bairro;
        }
        if (!syncedEtapa1Data.cidade && endereco.cidade) {
          syncedEtapa1Data.cidade = endereco.cidade;
        }
        if (!syncedEtapa1Data.estado && endereco.estado) {
          syncedEtapa1Data.estado = endereco.estado;
        }
        if (!syncedEtapa1Data.cep && endereco.cep) {
          syncedEtapa1Data.cep = endereco.cep;
        }

        // Sync additional building data
        if (!syncedEtapa1Data.tipoEdificacao && endereco.tipo_edificacao) {
          syncedEtapa1Data.tipoEdificacao = endereco.tipo_edificacao;
        }
        if (!syncedEtapa1Data.qtdUnidades && endereco.qtd_unidades) {
          syncedEtapa1Data.qtdUnidades = endereco.qtd_unidades;
        }
        if (!syncedEtapa1Data.qtdBlocos && endereco.qtd_blocos) {
          syncedEtapa1Data.qtdBlocos = endereco.qtd_blocos;
        }
        if (!syncedEtapa1Data.qtdPavimentos && endereco.qtd_pavimentos) {
          syncedEtapa1Data.qtdPavimentos = endereco.qtd_pavimentos;
        }
        if (!syncedEtapa1Data.tipoTelhado && endereco.tipo_telhado) {
          syncedEtapa1Data.tipoTelhado = endereco.tipo_telhado;
        }
        if (syncedEtapa1Data.possuiElevador === undefined && endereco.possui_elevador !== undefined) {
          syncedEtapa1Data.possuiElevador = endereco.possui_elevador;
        }
        if (syncedEtapa1Data.possuiPiscina === undefined && endereco.possui_piscina !== undefined) {
          syncedEtapa1Data.possuiPiscina = endereco.possui_piscina;
        }
      }

      // Sync client type
      if (!syncedEtapa1Data.tipo && clienteData.tipo_cliente) {
        syncedEtapa1Data.tipo = clienteData.tipo_cliente === 'PESSOA_FISICA' ? 'fisica' : 'juridica';
      }

      // Sync responsible person
      if (!syncedEtapa1Data.nomeResponsavel && clienteData.nome_responsavel) {
        syncedEtapa1Data.nomeResponsavel = clienteData.nome_responsavel;
      }

      // Only update if there are changes
      const hasChanges = Object.keys(syncedEtapa1Data).some(key =>
        syncedEtapa1Data[key] !== currentEtapa1[key]
      );

      if (hasChanges) {
        logger.log('🔄 Syncing complete Step 1 data from OS record:', syncedEtapa1Data);
        setEtapa1Data(syncedEtapa1Data);

        // ✅ FIX: Auto-save synced data to fix existing broken OSs
        const etapa1 = etapas.find(e => e.ordem === 1);
        if (etapa1 && osId) {
          logger.log('💾 Auto-saving synced Etapa 1 data to fix incomplete record');
          saveFormData(etapa1.id, syncedEtapa1Data, false).catch(err => {
            logger.error('❌ Erro ao auto-salvar dados sincronizados:', err);
          });
        }
      }
    }

    // Sync Step 2 (OS Type)
    const currentEtapa2 = formDataByStep[2] || {};
    if (!currentEtapa2.tipoOS && os.tipo_os_nome) {
      logger.log('🔄 Syncing Step 2 data from OS record:', os.tipo_os_nome);
      setEtapa2Data({ ...currentEtapa2, tipoOS: os.tipo_os_nome });
    }

    // ✅ Mark as synced to prevent re-runs
    hasSyncedOSData.current = true;
  }, [os, etapas, osId, formDataByStep, saveFormData, setEtapa1Data, setEtapa2Data]);

  // ✅ Reset sync flag when OS changes
  useEffect(() => {
    hasSyncedOSData.current = false;
  }, [osId]);

  // Funções para gerenciar agendamento na Etapa 4





  /**
   * Criar OS e todas as 15 etapas no banco
   */
  const criarOSComEtapas = async (): Promise<string> => {
    try {
      logger.log('🚀 Iniciando criação da OS...');

      // 1. Validar dados obrigatórios
      if (!etapa1Data.leadId) {
        throw new Error('Lead não selecionado');
      }

      if (!etapa2Data.tipoOS) {
        throw new Error('Tipo de OS não selecionado');
      }

      // 2. Buscar nome do cliente para a descrição
      let nomeCliente = 'Cliente';
      try {
        const cliente = await clientesAPI.getById(etapa1Data.leadId);
        nomeCliente = cliente.nome_razao_social || cliente.nome || 'Cliente';
      } catch {
        logger.warn('⚠️ Não foi possível buscar nome do cliente, usando nome genérico');
      }

      // 3. Buscar UUID do tipo de OS pelo código
      logger.log('🔍 Buscando tipo de OS...');
      const codigoTipoOS = mapearTipoOSParaCodigo(etapa2Data.tipoOS);
      const tiposOS = await ordensServicoAPI.getTiposOS();
      const tipoOSEncontrado = tiposOS.find((t: { codigo: string; id: string }) => t.codigo === codigoTipoOS);

      if (!tipoOSEncontrado) {
        throw new Error(`Tipo de OS não encontrado: ${codigoTipoOS}`);
      }

      logger.log('✅ Tipo de OS encontrado:', tipoOSEncontrado);

      // 4. Criar OS no banco
      logger.log('📝 Criando OS no banco...');

      // Obter setor do usuário que está criando a OS
      const setorSolicitanteId = currentUser?.setor_slug
        ? getSetorIdBySlug(currentUser.setor_slug)
        : null;
      // Setor inicial é Administrativo (etapa 1 sempre começa com Admin)
      const setorAtualId = SETOR_SLUG_TO_ID['administrativo'];

      const novaOS = await ordensServicoAPI.create({
        cliente_id: etapa1Data.leadId,
        tipo_os_id: tipoOSEncontrado.id,
        descricao: `${etapa2Data.tipoOS} - ${nomeCliente}`,
        criado_por_id: currentUserId,
        responsavel_id: currentUserId,
        setor_solicitante_id: setorSolicitanteId, // Setor de quem abriu a OS
        setor_atual_id: setorAtualId, // Etapa 1 = Administrativo
        status_geral: 'em_andamento',
        parent_os_id: parentOSId
      });

      logger.log('✅ OS criada:', novaOS);
      try {
        toast.success(`OS ${novaOS.codigo_os} criada com sucesso!`);
      } catch (toastError) {
        logger.error('❌ Erro ao exibir toast de sucesso (OS criada):', toastError);
      }

      // 5. Criar as 15 etapas
      logger.log('📋 Criando 15 etapas...');
      const etapasCriadas = [];

      for (let i = 1; i <= 15; i++) {
        const statusEtapa = i <= 2 ? 'concluida' : (i === 3 ? 'em_andamento' : 'pendente');

        let dadosEtapa = {};
        if (i === 1) {
          // ✅ FIX: Salvar TODOS os dados da Etapa 1, não apenas leadId
          dadosEtapa = { ...etapa1Data };
          logger.log('📋 Etapa 1 - Salvando dados completos:', {
            fieldsCount: Object.keys(dadosEtapa).length,
            hasLeadId: !!etapa1Data.leadId,
            hasNome: !!etapa1Data.nome
          });
        } else if (i === 2) {
          dadosEtapa = { tipoOS: etapa2Data.tipoOS };
        }

        const etapa = await createEtapa(novaOS.id, {
          ordem: i,
          nome_etapa: steps[i - 1].title,
          status: statusEtapa,
          dados_etapa: dadosEtapa,
          responsavel_id: currentUserId, // Set current user as responsible for all steps
        });

        etapasCriadas.push(etapa);
        logger.log(`✅ Etapa ${i}/15 criada: ${etapa.nome_etapa}`);
      }

      logger.log(`✅ Todas as 15 etapas criadas com sucesso!`);

      return novaOS.id;
    } catch (error) {
      logger.error('❌ Erro ao criar OS:', error);
      throw error;
    }
  };



  /**
   * Obter dados da etapa atual (usa sistema consolidado)
   */
  const getCurrentStepData = () => {
    return getStepData(currentStep);
  };

  /**
   * Validar etapa atual usando schemas Zod
   * Exibe erros específicos em toast
   * @returns true se válido, false se há campos faltando
   */
  const validateCurrentStep = (): boolean => {
    // Se não existe schema para esta etapa, permite avançar
    if (!hasSchemaForStep(currentStep)) {
      return true;
    }

    try {
      // Obter dados da etapa atual
      const currentStepData = getCurrentStepData();

      // ✅ CORREÇÃO: Permitir dados vazios - o schema Zod decidirá se é válido
      // Se todos os campos são opcionais, dados vazios são válidos
      const dataToValidate = currentStepData || {};

      // Validar usando schema Zod
      const { valid, errors } = validateStep(currentStep, dataToValidate);

      if (!valid) {
        // Exibir erros de validação
        const errorList = getStepValidationErrors(currentStep, currentStepData);

        if (errorList.length > 0) {
          const errorMessage = errorList.slice(0, 3).join('\n');
          const moreErrors = errorList.length > 3 ? `\n... e mais ${errorList.length - 3} erro(s)` : '';

          try {
            toast.error(`Preencha os campos obrigatórios:\n\n${errorMessage}${moreErrors}`);
          } catch (toastError) {
            logger.error('❌ Erro ao exibir toast de validação:', toastError);
          }
        }

        logger.warn(`⚠️ Etapa ${currentStep} inválida:`, errors);
        return false;
      }
    } catch (error) {
      logger.error('❌ Erro ao validar etapa:', error);
      try {
        toast.error('Erro ao validar a etapa. Tente novamente.');
      } catch (toastError) {
        logger.error('❌ Erro ao exibir toast:', toastError);
      }
      return false;
    }

    return true;
  };

  /**
   * Salvar dados da etapa no banco
   */
  /**
   * Salvar dados da etapa no banco
   */
  const saveCurrentStepData = async (markAsComplete: boolean = true) => {
    if (!osId) {
      logger.warn('⚠️ Não é possível salvar: osId não disponível');
      return;
    }

    try {
      logger.log(`💾 Salvando etapa ${currentStep}, markAsComplete=${markAsComplete}`);

      const saveStartTime = performance.now();
      await saveStep(currentStep, !markAsComplete); // saveStep recebe isDraft como segundo argumento
      const saveDuration = performance.now() - saveStartTime;

      const successMessage = markAsComplete
        ? 'Etapa concluída e dados salvos!'
        : 'Rascunho salvo com sucesso!';

      try {
        toast.success(successMessage);
      } catch (toastError) {
        logger.error('❌ Erro ao exibir toast de sucesso (saveStep):', toastError);
      }
      logger.log(`✅ ${successMessage} (${saveDuration.toFixed(0)}ms)`);
    } catch (error) {
      logger.error('❌ Erro ao salvar etapa:', error);
      try {
        toast.error('Erro ao salvar dados. Tente novamente.');
      } catch (toastError) {
        logger.error('❌ Erro ao exibir toast de erro (saveStep):', toastError);
      }
      throw error;
    }
  };

  /**
   * Salvar rascunho (sem validação, sem avançar)
   */
  const handleSaveRascunho = async () => {
    try {
      await saveCurrentStepData(false);
    } catch {
      // Erro já tratado em saveCurrentStepData
    }
  };

  /**
   * Concluir OS (Etapa 15)
   * - Marca status como "concluído"
   * - Atualiza data_conclusao
   * - Converte lead em cliente
   * - Cria OS-13 automaticamente
   */
  const handleConcluirOS = async () => {
    try {
      if (!osId) {
        toast.error('ID da OS não encontrado');
        return;
      }

      setIsCreatingOS(true);

      // Marcar etapa 15 como concluída no workflow
      // ✅ FIX: Usar Supabase diretamente porque saveStep pode falhar silenciosamente
      try {
        // Buscar a etapa 15 da OS
        const { data: etapa15, error: fetchError } = await supabase
          .from('os_etapas')
          .select('id')
          .eq('os_id', osId)
          .eq('ordem', 15)
          .single();

        if (fetchError || !etapa15) {
          logger.warn('⚠️ Etapa 15 não encontrada, tentando via saveStep...', fetchError);
          await saveStep(15, true);
        } else {
          // Marcar como concluída diretamente
          const { error: updateError } = await supabase
            .from('os_etapas')
            .update({
              status: 'concluida',
              data_conclusao: new Date().toISOString()
            })
            .eq('id', etapa15.id);

          if (updateError) {
            logger.error('❌ Erro ao atualizar etapa 15:', updateError);
          } else {
            logger.log('✅ Etapa 15 marcada como concluída via Supabase');
          }
        }
      } catch (error) {
        logger.warn('⚠️ Erro ao marcar etapa 15 como concluída:', error);
        // Continuar mesmo se falhar
      }

      // Atualizar OS para status "concluido" (enum correto sem acento)
      await ordensServicoAPI.update(osId, {
        status_geral: 'concluido',
        data_conclusao: new Date().toISOString(),
      });

      logger.log('✅ OS marcada como concluída:', osId);

      // Se houver cliente, converter de lead para ativo (enum correto: 'status', não 'tipo')
      if (os?.cliente_id) {
        try {
          await clientesAPI.update(os.cliente_id, {
            status: 'ativo', // Converter de 'lead' para 'ativo'
          });
          logger.log('✅ Cliente convertido para status ativo:', os.cliente_id);
        } catch (error) {
          logger.warn('⚠️ Erro ao atualizar cliente:', error);
          // Continuar mesmo se falhar
        }
      }

      toast.success('OS concluída com sucesso! Nova OS-13 será criada para o time de execução.');

      // Redirecionar para criação de OS-13 (Start de Contrato) com parentOSId e clienteId
      // ✅ FIX: Buscar cliente_id diretamente do banco para evitar problemas de timing
      setTimeout(async () => {
        let clienteId = os?.cliente_id || '';

        // Se não tem cliente_id no state, buscar diretamente do banco
        if (!clienteId && osId) {
          logger.log('🔍 cliente_id não disponível no state, buscando do banco...');
          const { data: osData } = await supabase
            .from('ordens_servico')
            .select('cliente_id')
            .eq('id', osId)
            .single();

          if (osData?.cliente_id) {
            clienteId = osData.cliente_id;
            logger.log('✅ cliente_id recuperado do banco:', clienteId);
          }
        }

        logger.log('🔗 [REDIRECT]', { osId, clienteId });
        window.location.href = `/os/criar/start-contrato-obra?parentOSId=${osId}&clienteId=${clienteId}`;
      }, 2000);

    } catch (error) {
      logger.error('❌ Erro ao concluir OS:', error);
      toast.error('Erro ao concluir OS. Tente novamente.');
    } finally {
      setIsCreatingOS(false);
    }
  };

  // Auto-redirect removido (Requisito: Apenas clique manual)
  // const hasAutoCompletedStep15 = useRef(false);
  // useEffect removed to prevent auto-redirect

  /**
   * Avançar para próxima etapa (com validação e salvamento)
   */
  const handleNextStep = async () => {
    const startTime = performance.now();
    logger.log('🚀 handleNextStep started', {
      currentStep,
      hasOsId: !!osId,
      isCreatingOS,
      timestamp: new Date().toISOString()
    });

    // ========================================
    // CASO ESPECIAL: Etapa 2 → 3 (Criar OS)
    // ========================================
    if (currentStep === 2 && !osId) {
      // Validar dados obrigatórios das etapas 1 e 2
      if (!etapa1Data.leadId) {
        try {
          toast.error('Selecione um lead antes de continuar');
        } catch (toastError) {
          logger.error('❌ Erro ao exibir toast de validação (lead):', toastError);
        }
        return;
      }

      if (!etapa2Data.tipoOS) {
        try {
          toast.error('Selecione o tipo de OS antes de continuar');
        } catch (toastError) {
          logger.error('❌ Erro ao exibir toast de validação (tipoOS):', toastError);
        }
        return;
      }

      try {
        // Ativar loading state
        setIsCreatingOS(true);

        logger.log('🚀 Iniciando criação de OS no Supabase...');

        // Criar OS e 15 etapas no banco
        const novaOsId = await criarOSComEtapas();

        logger.log('✅ OS criada com sucesso! ID:', novaOsId);

        // Salvar osId no estado interno
        setInternalOsId(novaOsId);

        // Recarregar etapas do banco
        logger.log('📋 Carregando etapas...');
        await refreshEtapas();

        // Avançar para etapa 3
        setCurrentStep(3);

        try {
          toast.success('Agora você pode preencher o Follow-up 1!');
        } catch (toastError) {
          logger.error('❌ Erro ao exibir toast de sucesso:', toastError);
        }

      } catch (error) {
        logger.error('❌ Erro ao criar OS:', error);
        try {
          toast.error('Erro ao criar Ordem de Serviço. Tente novamente.');
        } catch (toastError) {
          logger.error('❌ Erro ao exibir toast de erro:', toastError);
        }
      } finally {
        // Desativar loading state
        setIsCreatingOS(false);
      }

      return;
    }

    // ========================================
    // CASO ESPECIAL: Etapa 3 (Follow-up 1) - Usar validação imperativa
    // ========================================
    if (currentStep === 3) {
      logger.log('🔍 [STEP 3→4] Iniciando fluxo de avanço');

      // Usar validação imperativa do componente StepFollowup1
      if (stepFollowup1Ref.current) {
        logger.log('🔍 [STEP 3→4] stepFollowup1Ref.current existe, iniciando validate()');
        const isValid = stepFollowup1Ref.current.validate();

        logger.log('🔍 [STEP 3→4] Resultado da validação:', { isValid });

        if (!isValid) {
          logger.warn('⚠️ [STEP 3→4] Validação falhou - bloqueando avanço');
          try {
            toast.error('Preencha todos os campos obrigatórios antes de avançar');
          } catch (toastError) {
            logger.error('❌ Erro ao exibir toast de validação (Etapa 3):', toastError);
          }
          return;
        }
      } else {
        logger.warn('⚠️ [STEP 3→4] stepFollowup1Ref.current é null/undefined!');
      }

      // Se passou na validação, continuar com salvamento e avanço
      try {
        logger.log('✅ [STEP 3→4] Passou validação, continuando com salvamento');

        if (osId) {
          logger.log('🔍 [STEP 3→4] osId disponível:', osId);

          // Realizar upload dos arquivos pendentes
          let uploadedFiles = [];
          try {
            logger.log('📁 [STEP 3→4] Tentando fazer upload de arquivos pendentes');
            if (stepFollowup1Ref.current) {
              const ref = stepFollowup1Ref.current as any;
              if (ref.uploadPendingFiles && typeof ref.uploadPendingFiles === 'function') {
                uploadedFiles = await ref.uploadPendingFiles();
                logger.log('📁 [STEP 3→4] Upload concluído:', { filesCount: uploadedFiles.length });
              } else {
                logger.log('📁 [STEP 3→4] uploadPendingFiles não é função ou não existe');
              }
            }
          } catch (uploadError) {
            logger.error('❌ [STEP 3→4] Erro ao fazer upload dos arquivos:', uploadError);
            toast.error('Erro ao enviar arquivos anexados. Tente novamente.');
            return; // Interrompe o avanço se falhar o upload
          }

          // Se houver novos arquivos, atualizar os dados da etapa antes de salvar
          if (uploadedFiles.length > 0) {
            logger.log('📁 [STEP 3→4] Atualizando dados com novos arquivos');
            const currentData = getStepData(3);
            const currentAnexos = currentData.anexos || [];
            const newAnexos = [...currentAnexos, ...uploadedFiles];

            setStepData(3, { ...currentData, anexos: newAnexos });

            // Pequeno delay para garantir que o estado atualizou
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          logger.log('💾 [STEP 3→4] Iniciando saveCurrentStepData');
          await saveCurrentStepData(true);
          logger.log('✅ [STEP 3→4] saveCurrentStepData concluído');
        } else {
          logger.warn('⚠️ [STEP 3→4] osId não disponível, pulando save');
        }

        if (currentStep < steps.length) {
          logger.log('📍 [STEP 3→4] Avançando para próxima etapa:', { from: currentStep, to: currentStep + 1 });
          setCurrentStep(currentStep + 1);
        } else {
          logger.warn('⚠️ [STEP 3→4] currentStep >= steps.length, não pode avançar');
        }
      } catch (error) {
        logger.error('❌ [STEP 3→4] Erro geral ao processar avanço:', error);
      }

      return;
    }

    // ========================================
    // CASO ESPECIAL: Etapa 1 - Validação de dados de edificação
    // ========================================
    if (currentStep === 1) {
      logger.log('🎯 Etapa 1: Iniciando validações...', {
        hasStepLeadRef: !!stepLeadRef.current,
        hasOsId: !!osId,
        etapa1Data: etapa1Data
      });

      // Usar validação imperativa do componente LeadCadastro
      if (stepLeadRef.current) {
        logger.log('🔍 Etapa 1: Validando lead...');
        const isValid = stepLeadRef.current.validate();
        logger.log('✅ Etapa 1: Validação:', isValid);

        if (!isValid) {
          try {
            toast.error('Preencha todos os campos obrigatórios antes de avançar');
          } catch (e) {
            logger.error('Erro toast', e);
          }
          return;
        }

        // Salvar dados no banco (LeadCadastro lida com tudo)
        const savedId = await stepLeadRef.current.save();
        if (!savedId) {
          logger.log('❌ Etapa 1: Falha ao salvar lead');
          return;
        }

        // Atualizar estado com ID salvo se for novo
        if (savedId !== selectedLeadId) {
          setSelectedLeadId(savedId);
          // Atualizar etapa1Data.leadId
          setEtapa1Data({ ...etapa1Data, leadId: savedId });
        }
      } else {
        logger.log('⚠️ Etapa 1: stepLeadRef.current não disponível');
      }

      // Se passou na validação, continuar com salvamento e avanço
      logger.log('🚀 Etapa 1: Validações passaram, avançando...');
      try {
        if (osId) {
          // ✅ FIX: Passar dados explícitos para evitar timing issue do React state
          // O getStepData lê do formDataByStep que pode não ter atualizado ainda
          const currentData = getStepData(1);
          logger.log('💾 Etapa 1: Salvando dados...', {
            fieldsCount: Object.keys(currentData || {}).length,
            hasLeadId: !!currentData?.leadId
          });
          await saveStep(1, false, currentData); // isDraft=false, passa explicitData
          logger.log('✅ Etapa 1: Dados salvos');
        } else {
          logger.log('⚠️ Etapa 1: Sem osId, pulando salvamento');
        }

        if (currentStep < steps.length) {
          logger.log('➡️ Etapa 1: Avançando para etapa 2');
          setCurrentStep(currentStep + 1);
        }
      } catch (error) {
        logger.error('❌ Não foi possível avançar devido a erro ao salvar', error);
      }

      return;
    }

    // ========================================
    // CASO NORMAL: Outras transições de etapa
    // ========================================

    // Validar campos obrigatórios
    if (!validateCurrentStep()) {
      try {
        toast.error('Preencha todos os campos obrigatórios antes de avançar');
      } catch (toastError) {
        logger.error('❌ Erro ao exibir toast de validação (campos):', toastError);
      }
      return;
    }

    // ========================================
    // SALVAR DADOS DA ETAPA ANTES DE VERIFICAR APROVAÇÃO
    // ========================================
    try {
      if (osId) {
        const currentData = getStepData(currentStep);
        logger.log(`💾 Etapa ${currentStep}: Salvando dados...`, {
          fieldsCount: Object.keys(currentData || {}).length
        });
        await saveStep(currentStep, false, currentData);

        // ✅ Atualizar valor_proposta na OS quando salvar etapa 9
        if (currentStep === 9 && currentData?.valorTotal) {
          const valorNumerico = typeof currentData.valorTotal === 'number'
            ? currentData.valorTotal
            : parseFloat(String(currentData.valorTotal).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

          if (valorNumerico > 0) {
            await supabase
              .from('ordens_servico')
              .update({ valor_proposta: valorNumerico })
              .eq('id', osId);
            logger.log(`💰 Etapa 9: valor_proposta atualizado para ${valorNumerico}`);
          }
        }
      }
    } catch (saveError) {
      logger.error('❌ Erro ao salvar dados da etapa:', saveError);
      toast.error('Erro ao salvar dados. Tente novamente.');
      return;
    }

    // ========================================
    // VERIFICAÇÃO DE APROVAÇÃO (APÓS SALVAR)
    // ========================================
    if (aprovacaoInfo?.requerAprovacao && osId) {
      const status = aprovacaoInfo.statusAprovacao;
      // podeAprovar já vem do hook useAprovacaoEtapa

      // 🔀 CASO 1: STATUS PENDENTE → SEMPRE TRANSFERE PRIMEIRO
      // Independente de quem está logado, quando status é 'pendente',
      // a proposta ainda não foi solicitada para aprovação
      if (status === 'pendente') {
        logger.log('🔀 Status pendente - Transferindo para aprovação');

        // Executar transferência para Admin (handoff 9→9)
        if (os?.tipo_os_codigo) {
          const resultado = await executarTransferencia({
            osId,
            osType: os.tipo_os_codigo,
            etapaAtual: currentStep,
            proximaEtapa: currentStep, // Mesma etapa, muda responsável
            clienteNome: os.cliente_nome || etapa1Data.nome,
            codigoOS: os.codigo_os,
            nomeProximaEtapa: `Aprovação: ${steps[currentStep - 1]?.title || `Etapa ${currentStep}`}`,
          });

          if (resultado.success && resultado.transferencia) {
            // Marcar status como 'solicitada' na base
            await solicitarAprovacao('Proposta pronta para revisão e aprovação');

            setTransferenciaInfo(resultado.transferencia);
            setIsTransferenciaModalOpen(true);
            return; // Modal de transferência vai redirecionar
          }
        }

        // Fallback se não houver handoff: Abrir modal de solicitação
        const stepInfo = steps[currentStep - 1];
        setEtapaNomeParaAprovacao(stepInfo?.title || `Etapa ${currentStep}`);
        setIsAprovacaoModalOpen(true);
        return;
      }

      // 🔀 CASO 2: STATUS SOLICITADA → USUÁRIO QUE PODE APROVAR VÊ MODAL
      // A proposta já foi solicitada, agora quem pode aprovar decide
      if (status === 'solicitada' && podeAprovar) {
        const stepInfo = steps[currentStep - 1];
        setEtapaNomeParaAprovacao(stepInfo?.title || `Etapa ${currentStep}`);
        setIsAprovacaoModalOpen(true);
        return;
      }

      // 🔀 CASO 3: STATUS SOLICITADA → USUÁRIO QUE NÃO PODE APROVAR AGUARDA
      if (status === 'solicitada' && !podeAprovar) {
        toast.info('Aguardando aprovação do coordenador para avançar.');
        return;
      }

      // 🔀 CASO 4: STATUS REJEITADA → TRANSFERE DE VOLTA PARA REVISÃO
      if (status === 'rejeitada') {
        logger.log('🔀 Status rejeitada - Transferindo para revisão');
        // Neste cenário, a lógica de rejeição já foi executada no onRejeitado
        // Apenas mostrar mensagem
        toast.info('Proposta rejeitada. Revise os itens indicados.');
        return;
      }

      // Se status === 'aprovada', continua normalmente
    }

    // ========================================
    // AVANÇAR PARA PRÓXIMA ETAPA (APÓS SALVAR E SEM APROVAÇÃO PENDENTE)
    // ========================================
    const nextStep = currentStep + 1;
    if (nextStep <= steps.length) {
      // Verificar se há transferência de setor
      if (osId && os?.tipo_os_codigo) {
        const resultado = await executarTransferencia({
          osId,
          osType: os.tipo_os_codigo,
          etapaAtual: currentStep,
          proximaEtapa: nextStep,
          clienteNome: os.cliente_nome || etapa1Data.nome,
          codigoOS: os.codigo_os,
          nomeProximaEtapa: steps[nextStep - 1]?.title || `Etapa ${nextStep}`,
        });

        if (resultado.success && resultado.transferencia) {
          // Mostrar modal de feedback
          setTransferenciaInfo(resultado.transferencia);
          setIsTransferenciaModalOpen(true);
          // O modal redireciona ao fechar, então não avançamos aqui
          return;
        }
      }

      // Fluxo normal (sem transferência)
      logger.log('✅ Sem mudança de setor, avanço normal');
      setCurrentStep(prev => prev + 1);
      setLastActiveStep(prev => Math.max(prev ?? 0, currentStep + 1));
    }

    const duration = performance.now() - startTime;
    logger.log('✅ handleNextStep completed', {
      duration: `${duration.toFixed(2)}ms`,
      newStep: currentStep,
      timestamp: new Date().toISOString()
    });
  };



  // Verificar se o formulário da etapa atual está inválido
  // A validação real acontece no handleNextStep, este é feedback visual para o footer
  const isCurrentStepInvalid = useMemo(() => {
    if (isHistoricalNavigation) return false;
    if (currentStep <= 2) return false; // Etapas 1-2 são via LeadCadastro/TipoOS
    return !completedSteps.includes(currentStep);
  }, [currentStep, isHistoricalNavigation, completedSteps]);

  // ✅ Calcular ID da etapa atual para passar aos componentes filhos
  const currentStepEtapa = etapas?.find(e => e.ordem === currentStep);
  const currentEtapaId = currentStepEtapa?.id;

  // ✅ FIX: ReadOnly deve ser ativado APENAS se:
  // 1. É navegação histórica (usuário vendo etapa anterior)
  // 2. A OS inteira está concluída (Etapa 15 finalizada)
  const isOsConcluded = etapas?.some(e => e.ordem === TOTAL_WORKFLOW_STEPS && e.status === 'concluida');
  const isReadOnly = isHistoricalNavigation || !!isOsConcluded;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Botão Voltar (opcional) */}
      {onBack && (
        <div className="border-b border-border px-6 py-3 bg-white">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Voltar ao Hub de Criação
          </Button>
        </div>
      )}



      {/* Stepper Horizontal com botão de retorno */}
      <div className="relative">
        <WorkflowStepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          completedSteps={completedSteps}
          lastActiveStep={lastActiveStep || undefined}
        />

        {/* Botão de retorno rápido - posicionado absolutamente no canto direito */}
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
              <StepReadOnlyWithAdendos etapaId={currentEtapaId} readonly={isReadOnly}>

                {/* ETAPA 1: Identificação do Cliente/Lead */}
                {currentStep === 1 && (
                  <ErrorBoundary>
                    <LeadCadastro
                      ref={stepLeadRef}
                      selectedLeadId={selectedLeadId}
                      onLeadChange={(id: string, data: LeadCompleto | null) => {
                        setSelectedLeadId(id);
                        if (data) {
                          setEtapa1Data({
                            ...etapa1Data,
                            leadId: id,
                            nome: data.identificacao.nome,
                            cpfCnpj: data.identificacao.cpfCnpj,
                            tipo: data.identificacao.tipo,
                            email: data.identificacao.email,
                            telefone: data.identificacao.telefone,
                            // Edificacao
                            tipoEdificacao: data.edificacao.tipoEdificacao,
                            tipoTelhado: data.edificacao.tipoTelhado,
                            qtdUnidades: data.edificacao.qtdUnidades,
                            qtdBlocos: data.edificacao.qtdBlocos,
                            qtdPavimentos: data.edificacao.qtdPavimentos,
                            possuiElevador: data.edificacao.possuiElevador,
                            possuiPiscina: data.edificacao.possuiPiscina,
                            // Endereco
                            cep: data.endereco.cep,
                            rua: data.endereco.rua,
                            numero: data.endereco.numero,
                            complemento: data.endereco.complemento,
                            bairro: data.endereco.bairro,
                            cidade: data.endereco.cidade,
                            estado: data.endereco.estado,
                          });
                        }
                      }}
                      readOnly={isReadOnly}
                      showEdificacao={true}
                      showEndereco={true}
                    />
                  </ErrorBoundary>
                )}

                {/* ETAPA 2: Seleção do Tipo de OS */}
                {currentStep === 2 && (
                  <div className="relative">
                    {/* Overlay de Loading */}
                    {isCreatingOS && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <div className="text-center">
                            <p className="font-medium">Criando Ordem de Serviço</p>
                            <p className="text-sm text-muted-foreground">Aguarde enquanto criamos as 15 etapas no banco de dados...</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <StepSelecaoTipoObras
                      data={etapa2Data}
                      onDataChange={setEtapa2Data}
                      disabled={isCreatingOS}
                    />
                  </div>
                )}

                {/* ETAPA 3: Follow-up 1 (Entrevista Inicial) */}
                {currentStep === 3 && (
                  <StepFollowup1
                    ref={stepFollowup1Ref}
                    data={etapa3Data}
                    onDataChange={setEtapa3Data}
                    readOnly={isReadOnly}
                    osId={osId || undefined}
                    colaboradorId={currentUserId}
                    etapaId={currentEtapaId}
                  />
                )}

                {/* ETAPA 4: Agendar Visita Técnica */}
                {/* ETAPA 4: Agendar Apresentação */}
                {currentStep === 4 && osId && (
                  <StepAgendarApresentacao
                    ref={stepAgendarApresentacaoEtapa4Ref}
                    osId={osId}
                    data={etapa4Data}
                    onDataChange={setEtapa4Data}
                    readOnly={isReadOnly}
                  />
                )}

                {/* ETAPA 5: Realizar Visita (Técnica) */}
                {currentStep === 5 && (
                  <StepRealizarVisita
                    data={etapa5Data}
                    onDataChange={setEtapa5Data}
                    readOnly={isReadOnly}
                    tipoVisita="tecnica"
                  />
                )}

                {/* ETAPA 6: Follow-up 2 (Pós-Visita) */}
                {/* ETAPA 6: Preparar Orçamentos (Formulário Técnico Pós-Visita) */}
                {currentStep === 6 && (
                  <StepPrepararOrcamentos
                    data={etapa6Data}
                    onDataChange={setEtapa6Data}
                    readOnly={isReadOnly}
                    osId={osId || undefined}
                  />
                )}

                {/* ETAPA 7: Formulário Memorial (Escopo e Prazos) */}
                {/* ETAPA 7: Formulário Memorial (Escopo) */}
                {currentStep === 7 && (
                  <StepMemorialEscopo
                    ref={stepMemorialRef}
                    data={etapa7Data}
                    onDataChange={setEtapa7Data}
                    readOnly={isReadOnly}
                  />
                )}

                {/* ETAPA 8: Precificação */}
                {currentStep === 8 && (
                  <StepPrecificacao
                    memorialData={etapa7Data}
                    data={etapa8Data}
                    onDataChange={setEtapa8Data}
                    readOnly={isReadOnly}
                  />
                )}

                {/* ETAPA 9: Gerar Proposta Comercial */}
                {currentStep === 9 && (
                  (() => {
                    // ✅ FIX: Parsing robusto dos valores financeiros da Etapa 8
                    const precoFinalStr = etapa8Data.precoFinal?.toString() || '0';
                    // Remove R$, espaços e converte vírgula para ponto se não houver ponto
                    const precoClean = precoFinalStr.replace(/[^\d,.-]/g, '').replace(',', '.');
                    const valorTotalCalc = parseFloat(precoClean) || 0;

                    const pcEntrada = parseFloat(etapa8Data.percentualEntrada?.toString() || '40');
                    const numParcelas = parseInt(etapa8Data.numeroParcelas?.toString() || '2');

                    const valorEntradaCalc = valorTotalCalc * (pcEntrada / 100);
                    const valorParcelaCalc = (valorTotalCalc - valorEntradaCalc) / (numParcelas || 1);

                    return (
                      <StepGerarPropostaOS0104
                        osId={osId!}
                        etapa1Data={etapa1Data}
                        etapa2Data={etapa2Data}
                        etapa7Data={etapa7Data}
                        etapa8Data={etapa8Data}
                        // Passar valores calculados para garantir consistência
                        valorTotal={valorTotalCalc}
                        valorEntrada={valorEntradaCalc}
                        valorParcela={valorParcelaCalc}
                        data={etapa9Data}
                        onDataChange={setEtapa9Data}
                        readOnly={isReadOnly}
                        etapaId={currentEtapaId}
                      />
                    );
                  })()
                )}

                {/* ETAPA 10: Agendar Visita (Apresentação) */}
                {currentStep === 10 && osId && (
                  <StepAgendarApresentacao
                    ref={stepAgendarApresentacaoEtapa10Ref}
                    osId={osId}
                    data={etapa10Data}
                    onDataChange={setEtapa10Data}
                    readOnly={isReadOnly}
                  />
                )}

                {/* ETAPA 11: Realizar Visita (Apresentação) */}
                {currentStep === 11 && (
                  <StepRealizarApresentacao
                    data={etapa11Data}
                    onDataChange={setEtapa11Data}
                    readOnly={isReadOnly}
                  />
                )}

                {/* ETAPA 12: Follow-up 3 (Pós-Apresentação) */}
                {/* ETAPA 12: Follow-up 3 (Análise e Relatório) */}
                {currentStep === 12 && (
                  <StepAnaliseRelatorio
                    data={etapa12Data}
                    onDataChange={setEtapa12Data}
                    readOnly={isReadOnly}
                  />
                )}

                {/* ETAPA 13: Gerar Contrato (Upload) */}
                {/* ETAPA 13: Gerar Contrato (Upload) */}
                {currentStep === 13 && (
                  (() => {
                    const precoFinalStr = etapa8Data.precoFinal?.toString() || '0';
                    const precoClean = precoFinalStr.replace(/[^\d,.-]/g, '').replace(',', '.');
                    const valorTotalCalc = parseFloat(precoClean) || 0;

                    return (
                      <StepGerarContrato
                        data={{
                          ...etapa13Data,
                          osId: osId!, // ✅ FIX: Passar osId para upload funcionar
                          codigoOS: os?.codigo_os || '',
                          clienteNome: etapa1Data?.nome || os?.cliente?.nome_razao_social || '',
                          clienteCpfCnpj: etapa1Data?.cpfCnpj || '',
                          valorContrato: valorTotalCalc,
                          dataInicio: new Date().toISOString().split('T')[0],
                        }}
                        onDataChange={setEtapa13Data}
                        readOnly={isReadOnly}
                        etapaId={currentEtapaId}
                      />
                    );
                  })()
                )}

                {/* ETAPA 14: Contrato Assinado */}
                {currentStep === 14 && (
                  <StepContratoAssinado
                    data={etapa14Data}
                    onDataChange={setEtapa14Data}
                    readOnly={isReadOnly}
                  />
                )}

                {/* ETAPA 15: Iniciar Contrato de Obra */}
                {currentStep === 15 && (
                  <EtapaStartContrato
                    onStart={handleConcluirOS}
                    isLoading={isCreatingOS}
                    isProcessing={isCreatingOS}
                    readOnly={isReadOnly}
                    isCompleted={os?.status === 'concluida'}
                    clienteNome={os?.cliente?.nome_razao_social || 'Cliente'}
                  />
                )}

              </StepReadOnlyWithAdendos>
            </CardContent>

            {/* Footer com botões de navegação */}
            {/* Ocultar footer na etapa 15 pois já tem o botão "Start de Contrato" dedicado */}
            {currentStep !== 15 && (
              <WorkflowFooter
                currentStep={currentStep}
                totalSteps={TOTAL_WORKFLOW_STEPS}
                onPrevStep={handlePrevStep}
                onNextStep={handleNextStep}
                onSaveDraft={handleSaveRascunho}
                showDraftButton={DRAFT_ENABLED_STEPS.includes(currentStep)}
                disableNext={isLoading}
                isLoading={isCreatingOS}
                loadingText={currentStep === 2 ? 'Criando OS no Supabase...' : 'Processando...'}
                readOnlyMode={isHistoricalNavigation}
                onReturnToActive={handleReturnToActive}
                isFormInvalid={isCurrentStepInvalid}
                invalidFormMessage="Preencha todos os campos obrigatórios para continuar"
              />
            )}
          </Card>
        </div>
      </div>

      {/* Modal de Feedback de Transferência de Setor - NÃO EXIBIR EM READONLY (Histórico ou OS Concluída) */}
      {osId && transferenciaInfo && !isReadOnly && (
        <FeedbackTransferencia
          isOpen={isTransferenciaModalOpen}
          onClose={() => {
            setIsTransferenciaModalOpen(false);
            setTransferenciaInfo(null);
          }}
          transferencia={transferenciaInfo}
          osId={osId}
        />
      )}

      {/* Modal de Aprovação de Etapa - NÃO EXIBIR EM READONLY */}
      {osId && !isReadOnly && (
        <AprovacaoModal
          open={isAprovacaoModalOpen}
          onOpenChange={setIsAprovacaoModalOpen}
          osId={osId}
          etapaOrdem={currentStep}
          etapaNome={etapaNomeParaAprovacao}
          onSolicitado={async () => {
            // 🚀 Transferir para Administrativo (Regra 9->9)
            if (osId && os?.tipo_os_codigo) {
              const resultado = await executarTransferencia({
                osId,
                osType: os.tipo_os_codigo,
                etapaAtual: 9,
                proximaEtapa: 9, // Transferência na mesma etapa
                clienteNome: os.cliente_nome || etapa1Data.nome,
                codigoOS: os.codigo_os,
                nomeProximaEtapa: 'Aprovação da Proposta',
              });

              if (resultado.success && resultado.transferencia) {
                setTransferenciaInfo(resultado.transferencia);
                setIsTransferenciaModalOpen(true);
              }
            }
            await refreshEtapas();
          }}
          onAprovado={async () => {
            // Recarregar etapas do banco (RPC já avançou)
            await refreshEtapas();

            // 🚀 Executar transferência 9→10 (Obras → Admin) após aprovação
            if (osId && os?.tipo_os_codigo) {
              const resultado = await executarTransferencia({
                osId,
                osType: os.tipo_os_codigo,
                etapaAtual: 9,
                proximaEtapa: 10,
                clienteNome: os.cliente_nome || etapa1Data.nome,
                codigoOS: os.codigo_os,
                nomeProximaEtapa: steps[9]?.title || 'Agendar Visita (Apresentação)',
              });

              if (resultado.success && resultado.transferencia) {
                setTransferenciaInfo(resultado.transferencia);
                setIsTransferenciaModalOpen(true);
                return; // Modal de transferência vai redirecionar
              }
            }

            // Avançar para próxima etapa no frontend (caso não haja transfer)
            setCurrentStep(prev => prev + 1);
            setLastActiveStep(prev => Math.max(prev ?? 0, currentStep + 1));
          }}
          onRejeitado={async () => {
            // 🚀 Transferir de volta para Obras (Regra 9->7)
            if (osId && os?.tipo_os_codigo) {
              await executarTransferencia({
                osId,
                osType: os.tipo_os_codigo,
                etapaAtual: 9,
                proximaEtapa: 7, // Retorno para etapa 7
                clienteNome: os.cliente_nome || etapa1Data.nome,
                codigoOS: os.codigo_os,
                nomeProximaEtapa: 'Memorial (Escopo) - Revisão',
              });
              // Não mostramos modal aqui pois vamos redirecionar
            }

            // Resetar status das etapas 7-9
            const { error } = await supabase
              .from('os_etapas')
              .update({ status: 'em_andamento' })
              .in('ordem', [7, 8, 9])
              .eq('os_id', osId);

            if (error) {
              logger.error('Erro ao resetar etapas:', error);
              toast.error('Erro ao resetar etapas para revisão');
              return;
            }

            toast.success('Proposta rejeitada. Retornando para revisão.');
            await refreshEtapas();
            setCurrentStep(7);
            setLastActiveStep(prev => Math.max(prev ?? 0, 7));
          }}
        />
      )}
    </div >
  );
}
