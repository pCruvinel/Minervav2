"use client";

import { logger } from '@/lib/utils/logger';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { PrimaryButton } from '../ui/primary-button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Switch } from '../ui/switch';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  Upload,
  FileText,
  File,
  Check,
  Calendar,
  Send,
  ChevronLeft,
  AlertCircle,
  Trash2,
  Loader2,
  Info,
  X
} from 'lucide-react';
import { Separator } from '../ui/separator';
import { WorkflowStepper, WorkflowStep } from './workflow-stepper';
import { WorkflowFooter } from './workflow-footer';
import { CadastrarLead, type CadastrarLeadHandle } from './steps/shared/cadastrar-lead';
import { StepFollowup1, type StepFollowup1Handle } from './steps/shared/step-followup-1';
import { StepMemorialEscopo, type StepMemorialEscopoHandle } from './steps/shared/step-memorial-escopo';
import { StepPrecificacao } from './steps/shared/step-precificacao';
import { StepGerarPropostaOS0104 } from './steps/shared/step-gerar-proposta-os01-04';
import { StepAgendarApresentacao } from './steps/shared/step-agendar-apresentacao';
import { StepRealizarApresentacao } from './steps/shared/step-realizar-apresentacao';
import { StepGerarContrato } from './steps/shared/step-gerar-contrato';
import { StepContratoAssinado } from './steps/shared/step-contrato-assinado';
import { CalendarioSemana } from '../calendario/calendario-semana';
import { ModalNovoAgendamento } from '../calendario/modal-novo-agendamento';
import { ordensServicoAPI, clientesAPI } from '../../lib/api-client';
import { useOrdemServico } from '../../lib/hooks/use-ordens-servico';
import { toast } from '../../lib/utils/safe-toast';
import { useTurnosPorSemana } from '../../lib/hooks/use-turnos';
import { useAgendamentos } from '../../lib/hooks/use-agendamentos';
import { ErrorBoundary } from '../error-boundary';
import { validateStep, getStepValidationErrors, hasSchemaForStep } from '../../lib/validations/os-etapas-schema';
import { useAuth } from '../../lib/contexts/auth-context';
import { useWorkflowState } from '../../lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '../../lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '../../lib/hooks/use-workflow-completion';
import { FileUploadUnificado } from '../ui/file-upload-unificado';
import { OS_WORKFLOW_STEPS, OS_TYPES, DRAFT_ENABLED_STEPS, TOTAL_WORKFLOW_STEPS } from '../../constants/os-workflow';
import { isValidUUID, mapearTipoOSParaCodigo, calcularValoresPrecificacao } from '../../lib/utils/os-workflow-helpers';

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
  comment: string;
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

interface OSDetailsWorkflowPageProps {
  onBack?: () => void;
  osId?: string; // ID da OS sendo editada
  initialStep?: number;
  readonly?: boolean;
}

export function OSDetailsWorkflowPage({
  onBack,
  osId: osIdProp,
  initialStep,
  readonly = false,
}: OSDetailsWorkflowPageProps = {}) {
  // DEBUG: Track component lifecycle
  React.useEffect(() => {
    logger.log('🎯 OSDetailsWorkflowPage mounted', {
      osId: osIdProp,
      initialStep,
      timestamp: new Date().toISOString()
    });

    return () => {
      logger.log('🗑️ OSDetailsWorkflowPage unmounted', {
        osId: osIdProp,
        timestamp: new Date().toISOString()
      });
    };
  }, [osIdProp, initialStep]);

  // DEBUG: Track component re-renders
  React.useEffect(() => {
    logger.log('🔄 OSDetailsWorkflowPage re-render', {
      osId: osIdProp,
      currentStep,
      isLoading,
      isCreatingOS,
      timestamp: new Date().toISOString()
    });
  });

  // Estado interno para armazenar osId criada (diferente da prop osIdProp)
  const [internalOsId, setInternalOsId] = useState<string | null>(null);

  // Estado de loading para criação de OS (Etapa 2 → 3)
  const [isCreatingOS, setIsCreatingOS] = useState(false);

  // Estado para modal de agendamento da Etapa 4
  const [modalAgendamentoAberto, setModalAgendamentoAberto] = useState(false);
  const [turnoSelecionado, setTurnoSelecionado] = useState<any>(null);
  const [diaSelecionado, setDiaSelecionado] = useState<Date>(new Date());
  const [agendamentoConfirmado, setAgendamentoConfirmado] = useState(false);

  // Estado para navegação de semanas na Etapa 4
  const [semanaAtualCalendario, setSemanaAtualCalendario] = useState(new Date());

  // Usar osIdProp (editando OS existente) ou internalOsId (criando nova OS)
  const osId = osIdProp || internalOsId;

  // Obter ID do usuário logado
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id || 'user-unknown';

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
    createEtapa,
    updateEtapa,
    completedSteps: completedStepsFromHook,
    isLoading: isLoading,
    etapas,
    refreshEtapas
  } = useWorkflowState({
    osId: osId || undefined,
    totalSteps: TOTAL_WORKFLOW_STEPS,
    initialStep: initialStep || 1
  });

  // Calcular datas da semana atual do calendário
  const datasSemanaCalendario = useMemo(() => {
    const datas: string[] = [];
    const data = new Date(semanaAtualCalendario);

    // Ir para segunda-feira da semana
    const dayOfWeek = data.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    data.setDate(data.getDate() + distanceToMonday);

    // Gerar 7 dias (segunda a domingo)
    for (let i = 0; i < 7; i++) {
      datas.push(data.toISOString().split('T')[0]);
      data.setDate(data.getDate() + 1);
    }

    return datas;
  }, [semanaAtualCalendario]);

  // Hooks para calendário na Etapa 4 - buscar um período maior para garantir que turnos recorrentes apareçam
  const dataInicioBusca = useMemo(() => {
    const data = new Date(semanaAtualCalendario);
    data.setDate(data.getDate() - 30); // Buscar 30 dias antes
    return data.toISOString().split('T')[0];
  }, [semanaAtualCalendario]);

  const dataFimBusca = useMemo(() => {
    const data = new Date(semanaAtualCalendario);
    data.setDate(data.getDate() + 30); // Buscar 30 dias depois
    return data.toISOString().split('T')[0];
  }, [semanaAtualCalendario]);

  const { turnosPorDia: turnosCalendario, loading: loadingTurnos, error: errorTurnos, refetch: refetchTurnos } = useTurnosPorSemana(
    dataInicioBusca,
    dataFimBusca
  );

  const { agendamentos: agendamentosCalendario, refetch: refetchAgendamentos } = useAgendamentos({
    dataInicio: datasSemanaCalendario[0],
    dataFim: datasSemanaCalendario[6],
  });

  // Hook de Navegação
  const {
    handleStepClick,
    handleReturnToActive,
    handleNextStep: hookHandleNextStep,
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
  const [showLeadCombobox, setShowLeadCombobox] = useState(false);
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);

  // Refs para componentes com validação imperativa
  const stepLeadRef = useRef<CadastrarLeadHandle>(null);
  const stepFollowup1Ref = useRef<StepFollowup1Handle>(null);
  const stepMemorialRef = useRef<StepMemorialEscopoHandle>(null);

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
  const getStepData = (stepNum: number) => {
    const data = formDataByStep[stepNum];

    if (!data) {
      // Retornar estruturas padrão para etapas que precisam de arrays inicializados
      // Garantir que todos os campos string sejam '' e não undefined para evitar warnings de uncontrolled/controlled
      const defaults: Record<number, any> = {
        3: {
          anexos: [],
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
        },
        6: {
          fotosAncoragem: [],
          arquivosGerais: [],
          outrasEmpresas: '',
          comoEsperaResolver: '',
          expectativaCliente: '',
          estadoAncoragem: '',
          quemAcompanhou: '',
          avaliacaoVisita: '',
          estadoGeralEdificacao: '',
          servicoResolver: '',
        },
        8: {
          etapasPrincipais: [],
          percentualImprevisto: '',
          percentualLucro: '',
          percentualImposto: '',
          percentualEntrada: '',
          numeroParcelas: '',
        },
        12: {
          propostaApresentada: '',
          metodoApresentacao: '',
          clienteAchouProposta: '',
          clienteAchouContrato: '',
          doresNaoAtendidas: '',
          indicadorFechamento: '',
          quemEstavaNaApresentacao: '',
          nivelSatisfacao: '',
        },
      };

      return defaults[stepNum] || {};
    }

    // Garantir que campos string nunca sejam undefined (evitar warnings uncontrolled/controlled)
    const defaults: Record<number, any> = {
      3: {
        anexos: [],
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
      },
      6: {
        fotosAncoragem: [],
        arquivosGerais: [],
        outrasEmpresas: '',
        comoEsperaResolver: '',
        expectativaCliente: '',
        estadoAncoragem: '',
        quemAcompanhou: '',
        avaliacaoVisita: '',
        estadoGeralEdificacao: '',
        servicoResolver: '',
      },
      8: {
        etapasPrincipais: [],
        percentualImprevisto: '',
        percentualLucro: '',
        percentualImposto: '',
        percentualEntrada: '',
        numeroParcelas: '',
      },
      12: {
        propostaApresentada: '',
        metodoApresentacao: '',
        clienteAchouProposta: '',
        clienteAchouContrato: '',
        doresNaoAtendidas: '',
        indicadorFechamento: '',
        quemEstavaNaApresentacao: '',
        nivelSatisfacao: '',
      },
    };

    // Merge data with defaults to ensure no undefined string fields
    const defaultData = defaults[stepNum] || {};
    return { ...defaultData, ...data };
  };

  // Atualizar dados de uma etapa
  const setStepData = (stepNum: number, data: EtapaData) => {
    logger.log('📝 setStepData called', {
      stepNum,
      dataKeys: Object.keys(data),
      hasOsId: !!osId,
      timestamp: new Date().toISOString()
    });
    hookSetStepData(stepNum, data);
  };

  // Atualizar campo individual de uma etapa
  const updateStepField = (stepNum: number, field: string, value: unknown) => {
    const currentData = formDataByStep[stepNum] || {};
    const newData = { ...currentData, [field]: value };

    hookSetStepData(stepNum, newData);
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
  const etapa15Data = useMemo(() => getStepData(15), [formDataByStep]);

  // Calcular valores financeiros para a proposta (Etapa 9)
  const { valorTotal, valorEntrada, valorParcela } = useMemo(() =>
    calcularValoresPrecificacao(etapa7Data, etapa8Data),
    [etapa7Data, etapa8Data]
  );

  const setEtapa1Data = (data: Etapa1Data) => setStepData(1, data);
  const setEtapa2Data = (data: Etapa2Data) => setStepData(2, data);
  const setEtapa3Data = (data: Etapa3Data) => setStepData(3, data);
  const setEtapa4Data = (data: Etapa4Data) => setStepData(4, data);
  const setEtapa5Data = (data: Etapa5Data | ((prev: Etapa5Data) => Etapa5Data)) => {
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
  const setEtapa15Data = (data: Etapa15Data) => setStepData(15, data);

  // Sync OS data to workflow state if missing (fallback for existing OSs)
  useEffect(() => {
    if (os && etapas && etapas.length > 0) {
      // Sync Step 1 (Client) - Complete client data
      if (os.cliente) {
        const clienteData = os.cliente;
        const syncedEtapa1Data = { ...etapa1Data };

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
          syncedEtapa1Data[key] !== etapa1Data[key]
        );

        if (hasChanges) {
          logger.log('🔄 Syncing complete Step 1 data from OS record:', syncedEtapa1Data);
          setEtapa1Data(syncedEtapa1Data);
        }
      }

      // Sync Step 2 (OS Type)
      if (!etapa2Data.tipoOS && os.tipo_os_nome) {
        logger.log('🔄 Syncing Step 2 data from OS record:', os.tipo_os_nome);
        setEtapa2Data({ ...etapa2Data, tipoOS: os.tipo_os_nome });
      }
    }
  }, [os, etapas, etapa1Data, etapa2Data.tipoOS]);

  // Funções para gerenciar agendamento na Etapa 4
  const handleSelecionarTurno = (turno: any, dia: Date) => {
    setTurnoSelecionado(turno);
    setDiaSelecionado(dia);
    setModalAgendamentoAberto(true);
  };

  const handleAgendamentoSucesso = () => {
    setModalAgendamentoAberto(false);
    setTurnoSelecionado(null);

    // Salvar dados do agendamento na Etapa 4
    if (turnoSelecionado && diaSelecionado) {
      const dataFormatada = diaSelecionado.toLocaleDateString('pt-BR');
      setEtapa4Data({
        dataAgendamento: `${dataFormatada} - ${turnoSelecionado.horaInicio} às ${turnoSelecionado.horaFim}`
      });
    }

    // Marcar agendamento como confirmado para mostrar confirmação visual
    setAgendamentoConfirmado(true);

    // Recarregar dados do calendário
    refetchTurnos();
    refetchAgendamentos();
  };

  const handleFecharModalAgendamento = () => {
    setModalAgendamentoAberto(false);
    setTurnoSelecionado(null);
  };

  // Funções para navegação entre semanas
  const handleSemanaAnterior = () => {
    const novaSemana = new Date(semanaAtualCalendario);
    novaSemana.setDate(novaSemana.getDate() - 7);
    setSemanaAtualCalendario(novaSemana);
  };

  const handleProximaSemana = () => {
    const novaSemana = new Date(semanaAtualCalendario);
    novaSemana.setDate(novaSemana.getDate() + 7);
    setSemanaAtualCalendario(novaSemana);
  };

  // Formatar período da semana para exibição
  const formatarPeriodoSemana = () => {
    const dataInicio = new Date(semanaAtualCalendario);
    const dayOfWeek = dataInicio.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    dataInicio.setDate(dataInicio.getDate() + distanceToMonday);

    const dataFim = new Date(dataInicio);
    dataFim.setDate(dataFim.getDate() + 6);

    const formatarData = (data: Date) => {
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      return `${dia}/${mes}`;
    };

    return `${formatarData(dataInicio)} - ${formatarData(dataFim)}`;
  };

  // Estado do formulário de novo lead (Dialog)
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




  const handleSelectLead = async (leadId: string, leadData?: {
    nome_razao_social?: string;
    cpf_cnpj?: string;
    email?: string;
    telefone?: string;
    tipo_cliente?: 'PESSOA_FISICA' | 'PESSOA_JURIDICA';
    nome_responsavel?: string;
    endereco?: {
      cargo_responsavel?: string;
      tipo_edificacao?: string;
      qtd_unidades?: string;
      qtd_blocos?: string;
      qtd_pavimentos?: string;
      tipo_telhado?: string;
      possui_elevador?: boolean;
      possui_piscina?: boolean;
      cep?: string;
      rua?: string;
      numero?: string;
      complemento?: string;
      bairro?: string;
      cidade?: string;
      estado?: string;
    };
  }) => {
    try {
      logger.log('🎯 handleSelectLead chamado com ID:', leadId);
      logger.log('📊 leadData recebido:', leadData);

      // Validar leadId
      if (!leadId || typeof leadId !== 'string') {
        logger.error('❌ leadId inválido:', leadId);
        logger.error('❌ leadId deve ser uma string');
        return;
      }

      // Validar se é um UUID válido
      if (!isValidUUID(leadId)) {
        logger.error('❌ leadId não é um UUID válido:', leadId);
        logger.error('❌ O lead selecionado não foi criado corretamente no banco de dados');
        logger.error('❌ UUID esperado: 8-4-4-4-12 hexadecimais (ex: 3acbed3a-7254-42b6-8a1b-9ad8a7d3da5d)');
        try {
          toast.error(`Lead inválido. UUID recebido: "${leadId}". Certifique-se de que foi criado corretamente no banco de dados.`);
        } catch (toastError) {
          logger.error('❌ Erro ao exibir toast:', toastError);
        }
        return;
      }

      setSelectedLeadId(leadId);
      logger.log('✅ selectedLeadId validado e atualizado:', leadId);

      // Se recebemos dados completos do lead, salvar tudo
      if (leadData) {
        const etapa1DataCompleta = {
          leadId,
          nome: leadData.nome_razao_social || '',
          cpfCnpj: leadData.cpf_cnpj || '',
          email: leadData.email || '',
          telefone: leadData.telefone || '',
          // Campos adicionais do lead
          tipo: leadData.tipo_cliente === 'PESSOA_FISICA' ? 'fisica' as const : 'juridica' as const,
          nomeResponsavel: leadData.nome_responsavel || '',
          cargoResponsavel: leadData.endereco?.cargo_responsavel || '',
          tipoEdificacao: leadData.endereco?.tipo_edificacao || '',
          qtdUnidades: leadData.endereco?.qtd_unidades || '',
          qtdBlocos: leadData.endereco?.qtd_blocos || '',
          qtdPavimentos: leadData.endereco?.qtd_pavimentos || '',
          tipoTelhado: leadData.endereco?.tipo_telhado || '',
          possuiElevador: leadData.endereco?.possui_elevador || false,
          possuiPiscina: leadData.endereco?.possui_piscina || false,
          cep: leadData.endereco?.cep || '',
          endereco: leadData.endereco?.rua || '',
          numero: leadData.endereco?.numero || '',
          complemento: leadData.endereco?.complemento || '',
          bairro: leadData.endereco?.bairro || '',
          cidade: leadData.endereco?.cidade || '',
          estado: leadData.endereco?.estado || '',
        };

        logger.log('📝 etapa1DataCompleta construída:', etapa1DataCompleta);
        setEtapa1Data(etapa1DataCompleta);
        logger.log('✅ setEtapa1Data chamado com dados completos');

        // Salvar dados imediatamente no banco para garantir persistência
        if (osId) {
          try {
            await saveStep(1, true); // Salva como rascunho para não bloquear avanço
            logger.log('✅ Dados da Etapa 1 salvos no banco');
          } catch (saveError) {
            logger.error('❌ Erro ao salvar dados da Etapa 1:', saveError);
          }
        }
      } else {
        logger.warn('⚠️ leadData não recebido, salvando apenas leadId');
        // Fallback: salvar apenas leadId (será preenchido depois se necessário)
        setEtapa1Data({ leadId });
        logger.log('✅ setEtapa1Data chamado com apenas leadId');
      }
    } catch (error) {
      logger.error('❌ Erro ao selecionar lead:', error);
      // NÃO usar toast aqui para evitar erro do Sonner
    }
  };

  const handleSaveNewLead = () => {
    // Aqui salvaria no backend
    logger.log('Salvando novo lead:', formData);
    setShowNewLeadDialog(false);
    // Simular seleção do novo lead
    setSelectedLeadId('NEW');
    setEtapa1Data({ leadId: 'NEW' });
  };

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
      } catch (error) {
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
      const novaOS = await ordensServicoAPI.create({
        cliente_id: etapa1Data.leadId,
        tipo_os_id: tipoOSEncontrado.id,
        descricao: `${etapa2Data.tipoOS} - ${nomeCliente}`,
        criado_por_id: currentUserId, // Enviar ID do usuário logado para evitar erro de "colaborador Sistema"
        status_geral: 'em_andamento',
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
          dadosEtapa = { leadId: etapa1Data.leadId };
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

      // Proteção contra dados undefined
      if (!currentStepData || Object.keys(currentStepData).length === 0) {
        try {
          toast.error(`Preencha os campos obrigatórios da etapa ${currentStep}`);
        } catch (toastError) {
          logger.error('❌ Erro ao exibir toast:', toastError);
        }
        return false;
      }

      // Validar usando schema Zod
      const { valid, errors } = validateStep(currentStep, currentStepData);

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
      logger.log(`💾 Salvando etapa ${currentStep}...`);

      await saveStep(currentStep, !markAsComplete); // saveStep recebe isDraft como segundo argumento

      const successMessage = markAsComplete
        ? 'Etapa concluída e dados salvos!'
        : 'Rascunho salvo com sucesso!';

      try {
        toast.success(successMessage);
      } catch (toastError) {
        logger.error('❌ Erro ao exibir toast de sucesso (saveStep):', toastError);
      }
      logger.log(`✅ ${successMessage}`);
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
    } catch (error) {
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

      // Atualizar OS para status "concluído"
      await ordensServicoAPI.update(osId, {
        status_geral: 'concluído',
        data_conclusao: new Date().toISOString(),
      });

      logger.log('✅ OS marcada como concluída:', osId);

      // Se houver cliente, converter de lead para cliente (se aplicável)
      if (os?.cliente_id) {
        try {
          await clientesAPI.update(os.cliente_id, {
            tipo: 'cliente', // Converter de 'lead' para 'cliente'
          });
          logger.log('✅ Cliente atualizado:', os.cliente_id);
        } catch (error) {
          logger.warn('⚠️ Erro ao atualizar cliente:', error);
          // Continuar mesmo se falhar
        }
      }

      toast.success('OS concluída com sucesso! Nova OS-13 será criada para o time de execução.');

      // Redirecionar para lista de OSs após 2 segundos
      setTimeout(() => {
        window.location.href = '/os';
      }, 2000);

    } catch (error) {
      logger.error('❌ Erro ao concluir OS:', error);
      toast.error('Erro ao concluir OS. Tente novamente.');
    } finally {
      setIsCreatingOS(false);
    }
  };

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
      // Usar validação imperativa do componente StepFollowup1
      if (stepFollowup1Ref.current) {
        const isValid = stepFollowup1Ref.current.validate();

        if (!isValid) {
          try {
            toast.error('Preencha todos os campos obrigatórios antes de avançar');
          } catch (toastError) {
            logger.error('❌ Erro ao exibir toast de validação (Etapa 3):', toastError);
          }
          return;
        }
      }

      // Se passou na validação, continuar com salvamento e avanço
      try {
        if (osId) {

          // Realizar upload dos arquivos pendentes
          let uploadedFiles = [];
          try {
            if (stepFollowup1Ref.current) {
              const ref = stepFollowup1Ref.current as any;
              if (ref.uploadPendingFiles && typeof ref.uploadPendingFiles === 'function') {
                uploadedFiles = await ref.uploadPendingFiles();
              }
            }
          } catch (uploadError) {
            logger.error('❌ Erro ao fazer upload dos arquivos:', uploadError);
            toast.error('Erro ao enviar arquivos anexados. Tente novamente.');
            return; // Interrompe o avanço se falhar o upload
          }

          // Se houver novos arquivos, atualizar os dados da etapa antes de salvar
          if (uploadedFiles.length > 0) {
            const currentData = getStepData(3);
            const currentAnexos = currentData.anexos || [];
            const newAnexos = [...currentAnexos, ...uploadedFiles];

            setStepData(3, { ...currentData, anexos: newAnexos });

            // Pequeno delay para garantir que o estado atualizou
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          await saveCurrentStepData(true);
        }

        if (currentStep < steps.length) {
          setCurrentStep(currentStep + 1);
        }
      } catch (error) {
        logger.error('❌ Não foi possível avançar devido a erro ao salvar', error);
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

      // Usar validação imperativa do componente CadastrarLead
      if (stepLeadRef.current) {
        // Primeiro validar identificação
        logger.log('🔍 Etapa 1: Validando identificação...');
        const isValid = stepLeadRef.current.validate();
        logger.log('✅ Etapa 1: Validação de identificação:', isValid);

        if (!isValid) {
          try {
            toast.error('Preencha todos os campos obrigatórios de identificação antes de avançar');
          } catch (toastError) {
            logger.error('❌ Erro ao exibir toast de validação (Etapa 1):', toastError);
          }
          logger.log('❌ Etapa 1: Bloqueado por validação de identificação');
          return;
        }

        // Depois validar dados de edificação
        logger.log('🔍 Etapa 1: Validando dados de edificação...');
        if (stepLeadRef.current.saveEdificacaoData) {
          const edificacaoValid = await stepLeadRef.current.saveEdificacaoData();
          logger.log('✅ Etapa 1: Validação de edificação:', edificacaoValid);

          if (!edificacaoValid) {
            // Erro já tratado no método saveEdificacaoData
            logger.log('❌ Etapa 1: Bloqueado por validação de edificação');
            return;
          }
        }
      } else {
        logger.log('⚠️ Etapa 1: stepLeadRef.current não disponível');
      }

      // Se passou na validação, continuar com salvamento e avanço
      logger.log('🚀 Etapa 1: Validações passaram, avançando...');
      try {
        if (osId) {
          logger.log('💾 Etapa 1: Salvando dados...');
          await saveCurrentStepData(true);
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

    // Salvar dados da etapa atual
    try {
      if (osId) {
        await saveCurrentStepData(true);
      }

      // Avançar para próxima etapa
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      // Não avança se houver erro ao salvar
      logger.error('❌ Não foi possível avançar devido a erro ao salvar');
    }

    const duration = performance.now() - startTime;
    logger.log('✅ handleNextStep completed', {
      duration: `${duration.toFixed(2)}ms`,
      newStep: currentStep,
      timestamp: new Date().toISOString()
    });
  };



  const isReadOnly = selectedLeadId !== 'NEW' && selectedLeadId !== '';

  // Verificar se o formulário da etapa atual está inválido
  const isCurrentStepInvalid = useMemo(() => {
    // Não validar em modo de navegação histórica (read-only)
    if (isHistoricalNavigation) return false;

    // Verificar validação para cada etapa com formulário
    switch (currentStep) {
      case 1:
        return stepLeadRef.current?.isFormValid() === false;
      case 3:
        return stepFollowup1Ref.current?.isFormValid() === false;
      case 4:
        // Etapa 4: Agendamento é recomendado mas não obrigatório
        // Permite avanço mesmo sem agendamento, mas mostra aviso
        return false; // Sempre válido - agendamento é opcional
      case 7:
        return stepMemorialRef.current?.isFormValid() === false;
      default:
        return false; // Etapas sem validação obrigatória
    }
  }, [currentStep, isHistoricalNavigation, stepLeadRef, stepFollowup1Ref, stepMemorialRef]);

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Botão Voltar (opcional) */}
      {onBack && (
        <div className="border-b border-neutral-200 px-6 py-3 bg-white">
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
        {isHistoricalNavigation && lastActiveStep && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={handleReturnToActive}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-lg whitespace-nowrap animate-pulse"
              style={{ backgroundColor: '#f97316', color: 'white' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ea580c';
                e.currentTarget.classList.remove('animate-pulse');
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f97316';
                e.currentTarget.classList.add('animate-pulse');
              }}
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <span className="font-semibold text-sm">Voltar para Etapa {lastActiveStep}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Responsável: {steps[currentStep - 1].responsible}
                  </p>
                </div>
                <Badge variant="outline" className="border-primary text-primary">
                  Etapa {currentStep} de {steps.length}
                </Badge>
              </div>
            </CardHeader>

            {/* Banner de Modo de Visualização Histórica */}
            {isHistoricalNavigation && (
              <div className="mx-6 mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-blue-900 font-semibold mb-1">
                    Modo de Visualização Histórica
                  </h4>
                  <p className="text-blue-800 text-sm">
                    Você está visualizando dados de uma etapa já concluída.
                    {lastActiveStep && (
                      <> Você estava trabalhando na <strong>Etapa {lastActiveStep}</strong>.</>
                    )}
                  </p>
                </div>
                <button
                  onClick={handleReturnToActive}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm underline whitespace-nowrap"
                >
                  Voltar agora
                </button>
              </div>
            )}

            <CardContent className="space-y-6 flex-1 overflow-y-auto">

              {/* ETAPA 1: Identificação do Cliente/Lead */}
              {currentStep === 1 && (
                <ErrorBoundary>
                  <CadastrarLead
                    ref={stepLeadRef}
                    selectedLeadId={selectedLeadId}
                    onSelectLead={handleSelectLead}
                    showCombobox={showLeadCombobox}
                    onShowComboboxChange={setShowLeadCombobox}
                    showNewLeadDialog={showNewLeadDialog}
                    onShowNewLeadDialogChange={setShowNewLeadDialog}
                    formData={formData}
                    onFormDataChange={setFormData}
                    onSaveNewLead={handleSaveNewLead}
                    readOnly={isHistoricalNavigation}
                  />
                </ErrorBoundary>
              )}

              {/* ETAPA 2: Seleção do Tipo de OS */}
              {currentStep === 2 && (
                <div className="space-y-6 relative">
                  {/* Overlay de Loading */}
                  {isCreatingOS && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <div className="text-center">
                          <p className="font-medium">Criando Ordem de Serviço</p>
                          <p className="text-sm text-muted-foreground">Aguarde enquanto criamos as 15 etapas no banco de dados...</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Defina qual tipo de OS será executada. Esta informação é obrigatória para prosseguir.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="tipoOS">
                      Selecione o Tipo de OS <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={etapa2Data.tipoOS}
                      onValueChange={(value: string) => setEtapa2Data({ tipoOS: value })}
                      disabled={isCreatingOS}
                    >
                      <SelectTrigger id="tipoOS">
                        <SelectValue placeholder="Escolha o tipo de OS" />
                      </SelectTrigger>
                      <SelectContent>
                        {OS_TYPES.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {etapa2Data.tipoOS && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">Tipo de OS selecionado:</p>
                            <p className="text-sm text-muted-foreground">{etapa2Data.tipoOS}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* ETAPA 3: Follow-up 1 (Entrevista Inicial) */}
              {currentStep === 3 && (
                <StepFollowup1
                  ref={stepFollowup1Ref}
                  data={etapa3Data}
                  onDataChange={setEtapa3Data}
                  readOnly={isHistoricalNavigation}
                  osId={osId || undefined}
                  colaboradorId={currentUserId}
                />
              )}

              {/* ETAPA 4: Agendar Visita Técnica */}
              {/* ETAPA 4: Agendar Apresentação */}
              {currentStep === 4 && osId && (
                <StepAgendarApresentacao
                  osId={osId}
                  data={etapa4Data}
                  onDataChange={setEtapa4Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 5: Realizar Visita */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Confirme a realização da visita técnica ao local.
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-col items-center justify-center py-12 gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-10 w-10 text-primary" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium mb-2">Confirmar Realização da Visita</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Marque a caixa abaixo para confirmar que a visita técnica foi realizada.
                      </p>
                      <div className="flex items-center space-x-3 justify-center">
                        <Switch
                          id="visitaRealizada"
                          checked={etapa5Data.visitaRealizada}
                          onCheckedChange={(checked: boolean) => {
                            setEtapa5Data((prev: Etapa5Data) => ({ ...prev, visitaRealizada: checked }));
                          }}
                        />
                        <Label htmlFor="visitaRealizada" className="cursor-pointer">
                          Visita técnica realizada
                        </Label>
                      </div>
                    </div>
                  </div>

                  {etapa5Data.visitaRealizada && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">Visita confirmada!</p>
                            <p className="text-sm text-muted-foreground">Data: {new Date().toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* ETAPA 6: Follow-up 2 (Pós-Visita) */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Preencha o formulário técnico dividido em três momentos com as informações coletadas durante e após a visita.
                    </AlertDescription>
                  </Alert>

                  {/* Momento 1: Perguntas Durante a Visita - Respostas do Cliente */}
                  <div className="space-y-4">
                    <div className="bg-neutral-100 px-4 py-2 rounded-md">
                      <h3 className="text-sm font-medium">Momento 1: Perguntas Durante a Visita - Respostas do Cliente</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="outrasEmpresas">
                        1. Há outras empresas realizando visita técnica? <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="outrasEmpresas"
                        rows={3}
                        value={etapa6Data.outrasEmpresas}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEtapa6Data({ ...etapa6Data, outrasEmpresas: e.target.value })}
                        placeholder="Descreva se há outras empresas realizando visita técnica e quais..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="comoEsperaResolver">
                        2. Como você espera resolver esse problema? (Solução, Material e metodologia) <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="comoEsperaResolver"
                        rows={4}
                        value={etapa6Data.comoEsperaResolver}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEtapa6Data({ ...etapa6Data, comoEsperaResolver: e.target.value })}
                        placeholder="Descreva as expectativas do cliente quanto à solução, materiais e metodologia..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expectativaCliente">
                        3. Qual a principal expectativa do cliente? (Solução, Material e metodologia) <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="expectativaCliente"
                        rows={4}
                        value={etapa6Data.expectativaCliente}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEtapa6Data({ ...etapa6Data, expectativaCliente: e.target.value })}
                        placeholder="Descreva as principais expectativas em relação à solução, materiais e metodologia..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estadoAncoragem">
                        4. Qual o estado do sistema de ancoragem? <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="estadoAncoragem"
                        rows={3}
                        value={etapa6Data.estadoAncoragem}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEtapa6Data({ ...etapa6Data, estadoAncoragem: e.target.value })}
                        placeholder="Descreva o estado atual do sistema de ancoragem..."
                      />
                    </div>

                    <FileUploadUnificado
                      label="5. Anexar fotos do sistema de ancoragem"
                      files={etapa6Data.fotosAncoragem || []}
                      onFilesChange={(files) => setEtapa6Data({ ...etapa6Data, fotosAncoragem: files })}
                      disabled={isHistoricalNavigation}
                      osId={osId || undefined}
                    />
                  </div>

                  <Separator />

                  {/* Momento 2: Avaliação Geral da Visita */}
                  <div className="space-y-4">
                    <div className="bg-neutral-100 px-4 py-2 rounded-md">
                      <h3 className="text-sm font-medium">Momento 2: Avaliação Geral da Visita</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quemAcompanhou">
                        6. Quem acompanhou a visita? <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="quemAcompanhou"
                        rows={3}
                        value={etapa6Data.quemAcompanhou}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEtapa6Data({ ...etapa6Data, quemAcompanhou: e.target.value })}
                        placeholder="Descreva quem acompanhou a visita e suas funções..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        7. Avaliação da Visita <span className="text-destructive">*</span>
                      </Label>
                      <RadioGroup
                        value={etapa6Data.avaliacaoVisita}
                        onValueChange={(value: string) => setEtapa6Data({ ...etapa6Data, avaliacaoVisita: value })}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Produtiva, cliente muito interessado" id="av1" />
                          <Label htmlFor="av1" className="cursor-pointer">Produtiva, cliente muito interessado</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Pouco produtiva" id="av2" />
                          <Label htmlFor="av2" className="cursor-pointer">Pouco produtiva</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Improdutiva" id="av3" />
                          <Label htmlFor="av3" className="cursor-pointer">Improdutiva</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <Separator />

                  {/* Momento 3: Respostas do Engenheiro */}
                  <div className="space-y-4">
                    <div className="bg-neutral-100 px-4 py-2 rounded-md">
                      <h3 className="text-sm font-medium">Momento 3: Respostas do Engenheiro</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estadoGeralEdificacao">
                        8. Qual o estado geral da edificação (Condições encontradas)? <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="estadoGeralEdificacao"
                        rows={4}
                        value={etapa6Data.estadoGeralEdificacao}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEtapa6Data({ ...etapa6Data, estadoGeralEdificacao: e.target.value })}
                        placeholder="Descreva detalhadamente as condições da edificação encontradas..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="servicoResolver">
                        9. Qual o serviço deve ser feito para resolver o problema? <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="servicoResolver"
                        rows={4}
                        value={etapa6Data.servicoResolver}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEtapa6Data({ ...etapa6Data, servicoResolver: e.target.value })}
                        placeholder="Descreva os serviços recomendados para resolver o problema..."
                      />
                    </div>

                    <FileUploadUnificado
                      label="10. Anexar Arquivos (Fotos gerais, croquis, etc)"
                      files={etapa6Data.arquivosGerais || []}
                      onFilesChange={(files) => setEtapa6Data({ ...etapa6Data, arquivosGerais: files })}
                      disabled={isHistoricalNavigation}
                      osId={osId || undefined}
                    />
                  </div>
                </div>
              )}

              {/* ETAPA 7: Formulário Memorial (Escopo e Prazos) */}
              {/* ETAPA 7: Formulário Memorial (Escopo) */}
              {currentStep === 7 && (
                <StepMemorialEscopo
                  ref={stepMemorialRef}
                  data={etapa7Data}
                  onDataChange={setEtapa7Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 8: Precificação */}
              {currentStep === 8 && (
                <StepPrecificacao
                  memorialData={etapa7Data}
                  data={etapa8Data}
                  onDataChange={setEtapa8Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 9: Gerar Proposta Comercial */}
              {currentStep === 9 && (
                <StepGerarPropostaOS0104
                  osId={osId!}
                  etapa1Data={etapa1Data}
                  etapa2Data={etapa2Data}
                  etapa7Data={etapa7Data}
                  etapa8Data={etapa8Data}
                  valorTotal={valorTotal}
                  valorEntrada={valorEntrada}
                  valorParcela={valorParcela}
                  data={etapa9Data}
                  onDataChange={setEtapa9Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 10: Agendar Visita (Apresentação) */}
              {currentStep === 10 && osId && (
                <StepAgendarApresentacao
                  osId={osId}
                  data={etapa10Data}
                  onDataChange={setEtapa10Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 11: Realizar Visita (Apresentação) */}
              {currentStep === 11 && (
                <StepRealizarApresentacao
                  data={etapa11Data}
                  onDataChange={setEtapa11Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 12: Follow-up 3 (Pós-Apresentação) */}
              {currentStep === 12 && (
                <div className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Documente a reação do cliente após a apresentação da proposta comercial.
                    </AlertDescription>
                  </Alert>

                  {/* Momento 1: Apresentação */}
                  <div className="space-y-4">
                    <div className="bg-neutral-100 px-4 py-2 rounded-md">
                      <h3 className="text-sm font-medium">Momento 1: Sobre a Apresentação</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="propostaApresentada">
                        1. Qual a proposta apresentada? <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="propostaApresentada"
                        rows={3}
                        value={etapa12Data.propostaApresentada}
                        onChange={(e) => setEtapa12Data({ ...etapa12Data, propostaApresentada: e.target.value })}
                        placeholder="Descreva a proposta apresentada..."
                        disabled={isHistoricalNavigation}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="metodoApresentacao">
                        2. Qual o método de apresentação? <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="metodoApresentacao"
                        rows={2}
                        value={etapa12Data.metodoApresentacao}
                        onChange={(e) => setEtapa12Data({ ...etapa12Data, metodoApresentacao: e.target.value })}
                        placeholder="Ex: Presencial, Online, Slides..."
                        disabled={isHistoricalNavigation}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clienteAchouProposta">
                        3. O que o cliente achou da proposta? <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="clienteAchouProposta"
                        rows={3}
                        value={etapa12Data.clienteAchouProposta}
                        onChange={(e) => setEtapa12Data({ ...etapa12Data, clienteAchouProposta: e.target.value })}
                        placeholder="Descreva a reação e comentários do cliente..."
                        disabled={isHistoricalNavigation}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Momento 2: Contrato e Dores */}
                  <div className="space-y-4">
                    <div className="bg-neutral-100 px-4 py-2 rounded-md">
                      <h3 className="text-sm font-medium">Momento 2: Contrato e Dores do Cliente</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clienteAchouContrato">
                        4. O que o cliente achou do contrato? <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="clienteAchouContrato"
                        rows={3}
                        value={etapa12Data.clienteAchouContrato}
                        onChange={(e) => setEtapa12Data({ ...etapa12Data, clienteAchouContrato: e.target.value })}
                        placeholder="Descreva a opinião do cliente sobre o contrato..."
                        disabled={isHistoricalNavigation}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doresNaoAtendidas">
                        5. Quais as dores do cliente não atendidas?
                      </Label>
                      <Textarea
                        id="doresNaoAtendidas"
                        rows={3}
                        value={etapa12Data.doresNaoAtendidas}
                        onChange={(e) => setEtapa12Data({ ...etapa12Data, doresNaoAtendidas: e.target.value })}
                        placeholder="Liste possíveis objeções ou pontos não atendidos..."
                        disabled={isHistoricalNavigation}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="indicadorFechamento">
                        6. Qual o indicador de fechamento da proposta? <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={etapa12Data.indicadorFechamento}
                        onValueChange={(value: string) => setEtapa12Data({ ...etapa12Data, indicadorFechamento: value })}
                        disabled={isHistoricalNavigation}
                      >
                        <SelectTrigger id="indicadorFechamento">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fechado">Fechado</SelectItem>
                          <SelectItem value="Quente">Quente</SelectItem>
                          <SelectItem value="Morno">Morno</SelectItem>
                          <SelectItem value="Frio">Frio</SelectItem>
                          <SelectItem value="Perdido">Perdido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Momento 3: Satisfação */}
                  <div className="space-y-4">
                    <div className="bg-neutral-100 px-4 py-2 rounded-md">
                      <h3 className="text-sm font-medium">Momento 3: Satisfação do Cliente</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quemEstavaNaApresentacao">
                        7. Quem estava na apresentação? <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="quemEstavaNaApresentacao"
                        rows={2}
                        value={etapa12Data.quemEstavaNaApresentacao}
                        onChange={(e) => setEtapa12Data({ ...etapa12Data, quemEstavaNaApresentacao: e.target.value })}
                        placeholder="Liste os participantes da reunião..."
                        disabled={isHistoricalNavigation}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        8. Qual o nível de satisfação do cliente? <span className="text-destructive">*</span>
                      </Label>
                      <RadioGroup
                        value={etapa12Data.nivelSatisfacao}
                        onValueChange={(value: string) => setEtapa12Data({ ...etapa12Data, nivelSatisfacao: value })}
                        disabled={isHistoricalNavigation}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Produtiva, cliente interessado" id="ns1" />
                          <Label htmlFor="ns1" className="cursor-pointer">Produtiva, cliente interessado</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Pouco produtiva" id="ns2" />
                          <Label htmlFor="ns2" className="cursor-pointer">Pouco produtiva</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Improdutiva" id="ns3" />
                          <Label htmlFor="ns3" className="cursor-pointer">Improdutiva</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              )}

              {/* ETAPA 13: Gerar Contrato (Upload) */}
              {currentStep === 13 && (
                <StepGerarContrato
                  data={etapa13Data}
                  onDataChange={setEtapa13Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 14: Contrato Assinado */}
              {currentStep === 14 && (
                <StepContratoAssinado
                  data={etapa14Data}
                  onDataChange={setEtapa14Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 15: Iniciar Contrato de Obra */}
              {currentStep === 15 && (
                <div className="space-y-6">
                  <Alert className="border-green-200 bg-green-50">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      <strong>Parabéns!</strong> Você chegou à última etapa do fluxo comercial.
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-col items-center justify-center py-12 gap-6">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                      <Send className="h-10 w-10 text-green-600" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium mb-2">Concluir OS e Gerar OS-13</h3>
                      <p className="text-sm text-muted-foreground mb-4 max-w-md">
                        Ao clicar no botão abaixo, esta OS será marcada como concluída, o lead será convertido em cliente e uma nova OS do tipo 13 (Contrato de Obra) será criada automaticamente para o time interno.
                      </p>
                      <PrimaryButton
                        size="lg"
                        disabled={isHistoricalNavigation || isCreatingOS}
                        onClick={handleConcluirOS}
                      >
                        {isCreatingOS ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Concluir OS e Gerar OS-13
                          </>
                        )}
                      </PrimaryButton>
                    </div>
                  </div>

                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-base">O que acontecerá:</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">OS atual marcada como "Concluída"</p>
                          <p className="text-xs text-muted-foreground">Esta OS-001 será arquivada com sucesso</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Lead convertido em Cliente</p>
                          <p className="text-xs text-muted-foreground">Status alterado de "lead" para "cliente" no sistema</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">OS-13 criada automaticamente</p>
                          <p className="text-xs text-muted-foreground">Nova OS do tipo 13 (Contrato de Obra) gerada para execução interna</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

            </CardContent>

            {/* Footer com botões de navegação */}
            <WorkflowFooter
              currentStep={currentStep}
              totalSteps={TOTAL_WORKFLOW_STEPS}
              onPrevStep={handlePrevStep}
              onNextStep={handleNextStep}
              nextButtonText={
                currentStep === 4 && !etapa4Data.dataAgendamento
                  ? "Avançar sem agendamento"
                  : "Avançar"
              }
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
          </Card>
        </div>
      </div>

      {/* Modal de Agendamento da Etapa 4 */}
      <ModalNovoAgendamento
        open={modalAgendamentoAberto}
        onClose={handleFecharModalAgendamento}
        turno={turnoSelecionado}
        dia={diaSelecionado}
        onSuccess={handleAgendamentoSucesso}
      />
    </div >
  );
}
