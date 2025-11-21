"use client";

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
  Download,
  AlertCircle,
  Trash2,
  Loader2,
  Info,
  X
} from 'lucide-react';
import { Separator } from '../ui/separator';
import { WorkflowStepper, WorkflowStep } from './workflow-stepper';
import { WorkflowFooter } from './workflow-footer';
import { StepIdentificacaoLeadCompleto, type StepIdentificacaoLeadCompletoHandle } from './steps/shared/step-identificacao-lead-completo';
import { StepFollowup1, type StepFollowup1Handle } from './steps/shared/step-followup-1';
import { StepMemorialEscopo, type StepMemorialEscopoHandle } from './steps/shared/step-memorial-escopo';
import { StepPrecificacao } from './steps/shared/step-precificacao';
import { StepGerarPropostaOS0104 } from './steps/shared/step-gerar-proposta-os01-04';
import { StepAgendarApresentacao } from './steps/shared/step-agendar-apresentacao';
import { StepRealizarApresentacao } from './steps/shared/step-realizar-apresentacao';
import { StepGerarContrato } from './steps/shared/step-gerar-contrato';
import { StepContratoAssinado } from './steps/shared/step-contrato-assinado';
import { ordensServicoAPI, clientesAPI } from '../../lib/api-client';
import { toast } from '../../lib/utils/safe-toast';
import { ErrorBoundary } from '../error-boundary';
import { uploadFile, deleteFile, formatFileSize, getFileUrl } from '../../lib/utils/supabase-storage';
import { validateStep, getStepValidationErrors, hasSchemaForStep } from '../../lib/validations/os-etapas-schema';
import { useAutoSave, useLocalStorageData } from '../../lib/hooks/use-auto-save';
import { AutoSaveStatus } from '../ui/auto-save-status';
import { useAuth } from '../../lib/contexts/auth-context';
import { useWorkflowState } from '../../lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '../../lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '../../lib/hooks/use-workflow-completion';

// Definição das 15 etapas do fluxo OS 01-04
const steps: WorkflowStep[] = [
  { id: 1, title: 'Identificação do Cliente/Lead', short: 'Lead', responsible: 'ADM', status: 'active' },
  { id: 2, title: 'Seleção do Tipo de OS', short: 'Tipo OS', responsible: 'ADM', status: 'pending' },
  { id: 3, title: 'Follow-up 1 (Entrevista Inicial)', short: 'Follow-up 1', responsible: 'ADM', status: 'pending' },
  { id: 4, title: 'Agendar Visita Técnica', short: 'Agendar', responsible: 'ADM', status: 'pending' },
  { id: 5, title: 'Realizar Visita', short: 'Visita', responsible: 'Obras', status: 'pending' },
  { id: 6, title: 'Follow-up 2 (Pós-Visita)', short: 'Follow-up 2', responsible: 'Obras', status: 'pending' },
  { id: 7, title: 'Formulário Memorial (Escopo)', short: 'Escopo', responsible: 'Obras', status: 'pending' },
  { id: 8, title: 'Precificação', short: 'Precificação', responsible: 'Obras', status: 'pending' },
  { id: 9, title: 'Gerar Proposta Comercial', short: 'Proposta', responsible: 'ADM', status: 'pending' },
  { id: 10, title: 'Agendar Visita (Apresentação)', short: 'Agendar', responsible: 'ADM', status: 'pending' },
  { id: 11, title: 'Realizar Visita (Apresentação)', short: 'Apresentação', responsible: 'ADM', status: 'pending' },
  { id: 12, title: 'Follow-up 3 (Pós-Apresentação)', short: 'Follow-up 3', responsible: 'ADM', status: 'pending' },
  { id: 13, title: 'Gerar Contrato (Upload)', short: 'Contrato', responsible: 'ADM', status: 'pending' },
  { id: 14, title: 'Contrato Assinado', short: 'Assinatura', responsible: 'ADM', status: 'pending' },
  { id: 15, title: 'Iniciar Contrato de Obra', short: 'Início Obra', responsible: 'Sistema', status: 'pending' },
];

interface OSDetailsWorkflowPageProps {
  onBack?: () => void;
  osId?: string; // ID da OS sendo editada
}

export function OSDetailsWorkflowPage({ onBack, osId: osIdProp }: OSDetailsWorkflowPageProps = {}) {
  // Estado interno para armazenar osId criada (diferente da prop osIdProp)
  const [internalOsId, setInternalOsId] = useState<string | null>(null);

  // Estado de loading para criação de OS (Etapa 2 → 3)
  const [isCreatingOS, setIsCreatingOS] = useState(false);

  // Usar osIdProp (editando OS existente) ou internalOsId (criando nova OS)
  const osId = osIdProp || internalOsId;

  // Obter ID do usuário logado (fixado TODO 3)
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id || 'user-unknown';

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
    totalSteps: steps.length
  });

  // Hook de Navegação
  const {
    handleStepClick,
    handleReturnToActive,
    handleNextStep: hookHandleNextStep,
    handlePrevStep
  } = useWorkflowNavigation({
    totalSteps: steps.length,
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
  const stepLeadRef = useRef<StepIdentificacaoLeadCompletoHandle>(null);
  const stepFollowup1Ref = useRef<StepFollowup1Handle>(null);
  const stepMemorialRef = useRef<StepMemorialEscopoHandle>(null);

  // Calcular quais etapas estão concluídas (status = APROVADA)
  // Regras de completude (Fallback para modo criação)
  const completionRules = useMemo(() => ({
    1: (data: any) => !!data.leadId,
    2: (data: any) => !!data.tipoOS,
  }), []);

  const { completedSteps } = useWorkflowCompletion({
    currentStep,
    formDataByStep,
    completionRules,
    completedStepsFromHook
  });

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
      case 7:
        return stepMemorialRef.current?.isFormValid() === false;
      default:
        return false; // Etapas sem validação obrigatória
    }
  }, [currentStep, isHistoricalNavigation]);

  // ========================================
  // ESTADO CONSOLIDADO DO FORMULÁRIO
  // ========================================
  // Armazena dados de todas as etapas em um único objeto
  // Estado para controlar upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ========================================
  // AUTO-SAVE CONFIG
  // ========================================
  // Recuperar dados salvos em localStorage (se existirem)
  const savedData = useLocalStorageData(`os_workflow_${osId || 'new'}`);

  // Inicializar formData com dados salvos
  useEffect(() => {
    if (savedData && Object.keys(savedData).length > 0) {
      // Se houver dados salvos localmente, mesclar com o estado do hook
      // Isso pode ser complexo, por enquanto apenas logamos
      console.log('📁 Dados recuperados do localStorage:', savedData);
      
      // Opcional: Atualizar o hook com dados locais se estiverem vazios
      // Mas o hook carrega do banco, então cuidado para não sobrescrever
    }
  }, [osId]); 

  // Auto-save quando dados mudam (com debounce de 1s)
  const { isSaving, isSaved, markDirty, saveiNow } = useAutoSave(
    async (data: any) => {
      // Se temos osId, salvar no banco de dados
      if (osId && etapas && etapas.length > 0) {
        try {
          // O data aqui é { [stepNum]: stepData }
          // Precisamos extrair o dado da etapa atual
          const stepData = data[currentStep];
          
          if (stepData) {
            // Usar saveStep do hook (mas ele pega do state, e o state pode não estar atualizado ainda se for muito rápido?)
            // Melhor usar saveFormData direto do useEtapas (que está dentro do useWorkflowState mas não exposto diretamente aqui, 
            // exceto via saveStep que usa getStepData).
            // Mas saveStep usa getStepData que lê de formDataByStep.
            // Se hookSetStepData atualizou o state, deve estar ok.
            
            // Mas para garantir, vamos usar o data passado para o callback
            const etapaAtual = etapas.find((e) => e.ordem === currentStep);
            if (etapaAtual) {
               // Precisamos acessar saveFormData. Como não temos acesso direto (está dentro do hook),
               // podemos usar saveStep se confiarmos no state, ou expor saveFormData do hook.
               // Vamos confiar no saveStep por enquanto, mas passando isDraft=true
               await saveStep(currentStep, true);
            }
          }
        } catch (error) {
          console.error('❌ Erro ao auto-salvar:', error);
          throw error;
        }
      }
    },
    {
      debounceMs: 1000,
      useLocalStorage: true,
      storageKey: `os_workflow_${osId || 'new'}`,
      onSaveSuccess: () => console.log('✅ Auto-save bem-sucedido'),
      onSaveError: (error) => console.error('❌ Auto-save falhou:', error),
    }
  );

  // ========================================
  // HELPERS PARA GERENCIAR FORMULÁRIO
  // ========================================

  // Buscar dados de uma etapa específica
  const getStepData = (stepNum: number) => {
    const data = formDataByStep[stepNum];

    if (!data) {
      // Retornar estruturas padrão para etapas que precisam de arrays inicializados
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
        6: { fotosAncoragem: [], arquivosGerais: [] },
        8: { etapasPrincipais: [] },
      };

      return defaults[stepNum] || {};
    }

    return data;
  };

  // Atualizar dados de uma etapa (com auto-save)
  const setStepData = (stepNum: number, data: any) => {
    hookSetStepData(stepNum, data);
    markDirty({ [stepNum]: data });
  };

  // Atualizar campo individual de uma etapa (com auto-save)
  const updateStepField = (stepNum: number, field: string, value: any) => {
    const currentData = formDataByStep[stepNum] || {};
    const newData = { ...currentData, [field]: value };
    
    hookSetStepData(stepNum, newData);
    markDirty({ [stepNum]: newData });
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
  const setEtapa12Data = (data: any) => setStepData(12, data);
  const setEtapa13Data = (data: any) => setStepData(13, data);
  const setEtapa14Data = (data: any) => setStepData(14, data);
  const setEtapa15Data = (data: any) => setStepData(15, data);

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

  // Cálculos de precificação (memoizados)
  const valoresPrecificacao = useMemo(() => {
    // Proteção contra undefined: usar array vazio como fallback
    const etapasPrincipais = etapa8Data?.etapasPrincipais || [];

    // Custo Base (soma dos totais das sub-etapas)
    const custoBase = etapasPrincipais.reduce((total, etapa) => {
      const subetapas = etapa?.subetapas || [];
      return total + subetapas.reduce((subtotal, sub) => {
        return subtotal + (parseFloat(sub?.total) || 0);
      }, 0);
    }, 0);

    // Percentuais (com valores padrão)
    const percImprevisto = parseFloat(etapa8Data?.percentualImprevisto) || 0;
    const percLucro = parseFloat(etapa8Data?.percentualLucro) || 0;
    const percImposto = parseFloat(etapa8Data?.percentualImposto) || 0;
    const percEntrada = parseFloat(etapa8Data?.percentualEntrada) || 0;
    const numParcelas = parseFloat(etapa8Data?.numeroParcelas) || 1;

    // Valor Total
    const valorTotal = custoBase * (1 + (percImprevisto + percLucro + percImposto) / 100);

    // Entrada e Parcelas
    const valorEntrada = valorTotal * (percEntrada / 100);
    const valorParcela = (valorTotal - valorEntrada) / numParcelas;

    return {
      custoBase,
      valorTotal,
      valorEntrada,
      valorParcela,
    };
  }, [etapa8Data]);

  // Funções de upload de arquivos
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!osId) {
      toast.error('É necessário criar a OS antes de anexar arquivos');
      return;
    }

    // Usar ID do usuário logado (FIXADO: TODO 3)
    const colaboradorId = currentUserId;
    if (colaboradorId === 'user-unknown') {
      toast.error('Usuário não identificado. Faça login novamente.');
      return;
    }
    
    // Determinar osNumero e etapa baseado na etapa atual
    const osNumero = 'os1'; // Sempre OS 1-4 neste componente
    
    // Mapear etapa atual para nome da pasta
    const etapaMap: Record<number, string> = {
      3: 'follow-up1',
      5: 'visita-tecnica',
      6: 'follow-up2',
      7: 'memorial-escopo',
      9: 'proposta-comercial',
      11: 'apresentacao-proposta',
      12: 'follow-up3',
    };
    
    const etapaNome = etapaMap[currentStep];
    if (!etapaNome) {
      toast.error('Esta etapa não permite upload de arquivos');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const uploadedFiles = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        console.log(`📤 Uploading file ${i + 1}/${files.length}: ${file.name} para ${osNumero}/${etapaNome}`);
        
        const uploadedFile = await uploadFile({
          file,
          osNumero: osNumero,
          etapa: etapaNome,
          osId: osId,
          colaboradorId: colaboradorId,
        });
        
        uploadedFiles.push(uploadedFile);
        setUploadProgress(((i + 1) / files.length) * 100);
      }
      
      // Adicionar arquivos ao estado
      setEtapa3Data(prev => ({
        ...prev,
        anexos: [...(prev.anexos || []), ...uploadedFiles],
      }));
      
      toast.success(`${uploadedFiles.length} arquivo(s) enviado(s) com sucesso!`);
      
    } catch (error) {
      console.error('❌ Error uploading files:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer upload dos arquivos');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleFileDelete = async (fileId: string, filePath: string) => {
    try {
      console.log(`🗑️ Deleting file: ${filePath}`);
      
      await deleteFile(filePath);
      
      // Remover do estado
      setEtapa3Data(prev => ({
        ...prev,
        anexos: (prev.anexos || []).filter(f => f.id !== fileId),
      }));
      
      toast.success('Arquivo removido com sucesso!');
      
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      toast.error('Erro ao remover arquivo');
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };



  // Função para validar UUID
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const handleSelectLead = (leadId: string, leadData?: any) => {
    try {
      console.log('🎯 handleSelectLead chamado com ID:', leadId);
      console.log('📊 leadData recebido:', leadData);

      // Validar leadId
      if (!leadId || typeof leadId !== 'string') {
        console.error('❌ leadId inválido:', leadId);
        console.error('❌ leadId deve ser uma string');
        return;
      }

      // Validar se é um UUID válido
      if (!isValidUUID(leadId)) {
        console.error('❌ leadId não é um UUID válido:', leadId);
        console.error('❌ O lead selecionado não foi criado corretamente no banco de dados');
        console.error('❌ UUID esperado: 8-4-4-4-12 hexadecimais (ex: 3acbed3a-7254-42b6-8a1b-9ad8a7d3da5d)');
        try {
          toast.error(`Lead inválido. UUID recebido: "${leadId}". Certifique-se de que foi criado corretamente no banco de dados.`);
        } catch (toastError) {
          console.error('❌ Erro ao exibir toast:', toastError);
        }
        return;
      }

      setSelectedLeadId(leadId);
      console.log('✅ selectedLeadId validado e atualizado:', leadId);

      // Se recebemos dados completos do lead, salvar tudo
      if (leadData) {
        const etapa1DataCompleta = {
          leadId,
          nome: leadData.nome_razao_social || '',
          cpfCnpj: leadData.cpf_cnpj || '',
          email: leadData.email || '',
          telefone: leadData.telefone || '',
          // Campos adicionais do lead
          tipo: leadData.tipo_cliente === 'PESSOA_FISICA' ? 'fisica' : 'juridica',
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

        console.log('📝 etapa1DataCompleta construída:', etapa1DataCompleta);
        setEtapa1Data(etapa1DataCompleta);
        console.log('✅ setEtapa1Data chamado com dados completos');
      } else {
        console.warn('⚠️ leadData não recebido, salvando apenas leadId');
        // Fallback: salvar apenas leadId (será preenchido depois se necessário)
        setEtapa1Data({ leadId });
        console.log('✅ setEtapa1Data chamado com apenas leadId');
      }
    } catch (error) {
      console.error('❌ Erro ao selecionar lead:', error);
      // NÃO usar toast aqui para evitar erro do Sonner
    }
  };

  const handleSaveNewLead = () => {
    // Aqui salvaria no backend
    console.log('Salvando novo lead:', formData);
    setShowNewLeadDialog(false);
    // Simular seleção do novo lead
    setSelectedLeadId('NEW');
    setEtapa1Data({ leadId: 'NEW' });
  };

  /**
   * Mapear nome do tipo de OS para código do banco
   */
  const mapearTipoOSParaCodigo = (nomeOS: string): string => {
    const mapeamento: Record<string, string> = {
      'OS 01: Perícia de Fachada': 'OS-01',
      'OS 02: Revitalização de Fachada': 'OS-02',
      'OS 03: Reforço Estrutural': 'OS-03',
      'OS 04: Outros': 'OS-04',
    };
    return mapeamento[nomeOS] || 'OS-01';
  };

  /**
   * Criar OS e todas as 15 etapas no banco
   */
  const criarOSComEtapas = async (): Promise<string> => {
    try {
      console.log('🚀 Iniciando criação da OS...');
      
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
        console.warn('⚠️ Não foi possível buscar nome do cliente, usando nome genérico');
      }

      // 3. Buscar UUID do tipo de OS pelo código
      console.log('🔍 Buscando tipo de OS...');
      const codigoTipoOS = mapearTipoOSParaCodigo(etapa2Data.tipoOS);
      const tiposOS = await ordensServicoAPI.getTiposOS();
      const tipoOSEncontrado = tiposOS.find((t: any) => t.codigo === codigoTipoOS);
      
      if (!tipoOSEncontrado) {
        throw new Error(`Tipo de OS não encontrado: ${codigoTipoOS}`);
      }

      console.log('✅ Tipo de OS encontrado:', tipoOSEncontrado);

      // 4. Criar OS no banco
      console.log('📝 Criando OS no banco...');
      const novaOS = await ordensServicoAPI.create({
        cliente_id: etapa1Data.leadId,
        tipo_os_id: tipoOSEncontrado.id,
        descricao: `${etapa2Data.tipoOS} - ${nomeCliente}`,
        // criado_por_id será preenchido automaticamente pelo servidor com colaborador "Sistema"
        status_geral: 'EM_ANDAMENTO', // Novo padrão: MAIÚSCULAS + SNAKE_CASE
      });

      console.log('✅ OS criada:', novaOS);
      try {
        toast.success(`OS ${novaOS.codigo_os} criada com sucesso!`);
      } catch (toastError) {
        console.error('❌ Erro ao exibir toast de sucesso (OS criada):', toastError);
      }

      // 5. Criar as 15 etapas
      console.log('📋 Criando 15 etapas...');
      const etapasCriadas = [];
      
      for (let i = 1; i <= 15; i++) {
        const statusEtapa = i <= 2 ? 'APROVADA' : (i === 3 ? 'EM_ANDAMENTO' : 'PENDENTE'); // Novo padrão: MAIÚSCULAS + SNAKE_CASE
        
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
        });
        
        etapasCriadas.push(etapa);
        console.log(`✅ Etapa ${i}/15 criada: ${etapa.nome_etapa}`);
      }

      console.log(`✅ Todas as 15 etapas criadas com sucesso!`);
      
      return novaOS.id;
    } catch (error) {
      console.error('❌ Erro ao criar OS:', error);
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
          console.error('❌ Erro ao exibir toast:', toastError);
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
            console.error('❌ Erro ao exibir toast de validação:', toastError);
          }
        }

        console.warn(`⚠️ Etapa ${currentStep} inválida:`, errors);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao validar etapa:', error);
      try {
        toast.error('Erro ao validar a etapa. Tente novamente.');
      } catch (toastError) {
        console.error('❌ Erro ao exibir toast:', toastError);
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
      console.warn('⚠️ Não é possível salvar: osId não disponível');
      return;
    }

    try {
      console.log(`💾 Salvando etapa ${currentStep}...`);
      
      await saveStep(currentStep, !markAsComplete); // saveStep recebe isDraft como segundo argumento

      const successMessage = markAsComplete 
        ? 'Etapa concluída e dados salvos!' 
        : 'Rascunho salvo com sucesso!';
      
      try {
        toast.success(successMessage);
      } catch (toastError) {
        console.error('❌ Erro ao exibir toast de sucesso (saveStep):', toastError);
      }
      console.log(`✅ ${successMessage}`);
    } catch (error) {
      console.error('❌ Erro ao salvar etapa:', error);
      try {
        toast.error('Erro ao salvar dados. Tente novamente.');
      } catch (toastError) {
        console.error('❌ Erro ao exibir toast de erro (saveStep):', toastError);
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
   * Avançar para próxima etapa (com validação e salvamento)
   */
  const handleNextStep = async () => {
    // ========================================
    // CASO ESPECIAL: Etapa 2 → 3 (Criar OS)
    // ========================================
    if (currentStep === 2 && !osId) {
      // Validar dados obrigatórios das etapas 1 e 2
      if (!etapa1Data.leadId) {
        try {
          toast.error('Selecione um lead antes de continuar');
        } catch (toastError) {
          console.error('❌ Erro ao exibir toast de validação (lead):', toastError);
        }
        return;
      }

      if (!etapa2Data.tipoOS) {
        try {
          toast.error('Selecione o tipo de OS antes de continuar');
        } catch (toastError) {
          console.error('❌ Erro ao exibir toast de validação (tipoOS):', toastError);
        }
        return;
      }

      try {
        // Ativar loading state
        setIsCreatingOS(true);

        console.log('🚀 Iniciando criação de OS no Supabase...');

        // Criar OS e 15 etapas no banco
        const novaOsId = await criarOSComEtapas();

        console.log('✅ OS criada com sucesso! ID:', novaOsId);

        // Salvar osId no estado interno
        setInternalOsId(novaOsId);

        // Recarregar etapas do banco
        console.log('📋 Carregando etapas...');
        await refreshEtapas();

        // Avançar para etapa 3
        setCurrentStep(3);

        try {
          toast.success('Agora você pode preencher o Follow-up 1!');
        } catch (toastError) {
          console.error('❌ Erro ao exibir toast de sucesso:', toastError);
        }

      } catch (error) {
        console.error('❌ Erro ao criar OS:', error);
        try {
          toast.error('Erro ao criar Ordem de Serviço. Tente novamente.');
        } catch (toastError) {
          console.error('❌ Erro ao exibir toast de erro:', toastError);
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
            console.error('❌ Erro ao exibir toast de validação (Etapa 3):', toastError);
          }
          return;
        }
      }

      // Se passou na validação, continuar com salvamento e avanço
      try {
        if (osId) {
          await saveCurrentStepData(true);
        }

        if (currentStep < steps.length) {
          setCurrentStep(currentStep + 1);
        }
      } catch (error) {
        console.error('❌ Não foi possível avançar devido a erro ao salvar');
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
        console.error('❌ Erro ao exibir toast de validação (campos):', toastError);
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
      console.error('❌ Não foi possível avançar devido a erro ao salvar');
    }
  };

  /**
   * Voltar para etapa anterior (sem salvar)
   */


  const isReadOnly = selectedLeadId !== 'NEW' && selectedLeadId !== '';

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
                  <StepIdentificacaoLeadCompleto
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
                      onValueChange={(value) => setEtapa2Data({ tipoOS: value })}
                      disabled={isCreatingOS}
                    >
                      <SelectTrigger id="tipoOS">
                        <SelectValue placeholder="Escolha o tipo de OS" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OS 01: Perícia de Fachada">OS 01: Perícia de Fachada</SelectItem>
                        <SelectItem value="OS 02: Revitalização de Fachada">OS 02: Revitalização de Fachada</SelectItem>
                        <SelectItem value="OS 03: Reforço Estrutural">OS 03: Reforço Estrutural</SelectItem>
                        <SelectItem value="OS 04: Outros">OS 04: Outros</SelectItem>
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
                />
              )}

              {/* ETAPA 4: Agendar Visita Técnica */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <Alert>
                    <Calendar className="h-4 w-4" />
                    <AlertDescription>
                      Agende a visita técnica ao local para avaliação presencial.
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-col items-center justify-center py-12 gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-10 w-10 text-primary" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium mb-2">Agendar Visita Técnica</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Selecione a data e horário para a visita técnica ao local.
                      </p>
                      <Button style={{ backgroundColor: '#f97316', color: 'white' }}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Agendar no Calendário
                      </Button>
                    </div>
                  </div>

                  {etapa4Data.dataAgendamento && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">Visita agendada para:</p>
                            <p className="text-sm text-muted-foreground">{etapa4Data.dataAgendamento}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
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
                          onCheckedChange={(checked) => {
                            setEtapa5Data((prev) => ({ ...prev, visitaRealizada: checked }));
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
                        onChange={(e) => setEtapa6Data({ ...etapa6Data, outrasEmpresas: e.target.value })}
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
                        onChange={(e) => setEtapa6Data({ ...etapa6Data, comoEsperaResolver: e.target.value })}
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
                        onChange={(e) => setEtapa6Data({ ...etapa6Data, expectativaCliente: e.target.value })}
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
                        onChange={(e) => setEtapa6Data({ ...etapa6Data, estadoAncoragem: e.target.value })}
                        placeholder="Descreva o estado atual do sistema de ancoragem..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>5. Anexar fotos do sistema de ancoragem</Label>
                      <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Clique para selecionar ou arraste fotos aqui
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Múltiplos arquivos permitidos • Você poderá adicionar comentários após o upload
                        </p>
                      </div>

                      {/* Lista de arquivos anexados com comentários */}
                      {(etapa6Data.fotosAncoragem?.length ?? 0) > 0 && (
                        <div className="mt-4 space-y-2">
                          {etapa6Data.fotosAncoragem.map((item, index) => (
                            <div key={index} className="border border-neutral-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <File className="h-4 w-4 text-primary" />
                                  <span className="text-sm">{item.file.name}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newFiles = etapa6Data.fotosAncoragem.filter((_, i) => i !== index);
                                    setEtapa6Data({ ...etapa6Data, fotosAncoragem: newFiles });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <Input
                                placeholder="Adicionar comentário..."
                                value={item.comment}
                                onChange={(e) => {
                                  const newFiles = [...etapa6Data.fotosAncoragem];
                                  newFiles[index].comment = e.target.value;
                                  setEtapa6Data({ ...etapa6Data, fotosAncoragem: newFiles });
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
                        onChange={(e) => setEtapa6Data({ ...etapa6Data, quemAcompanhou: e.target.value })}
                        placeholder="Descreva quem acompanhou a visita e suas funções..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        7. Avaliação da Visita <span className="text-destructive">*</span>
                      </Label>
                      <RadioGroup 
                        value={etapa6Data.avaliacaoVisita} 
                        onValueChange={(value) => setEtapa6Data({ ...etapa6Data, avaliacaoVisita: value })}
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
                        onChange={(e) => setEtapa6Data({ ...etapa6Data, estadoGeralEdificacao: e.target.value })}
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
                        onChange={(e) => setEtapa6Data({ ...etapa6Data, servicoResolver: e.target.value })}
                        placeholder="Descreva os serviços recomendados para resolver o problema..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>10. Anexar Arquivos (Fotos gerais, croquis, etc)</Label>
                      <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Clique para selecionar ou arraste arquivos aqui
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Múltiplos arquivos permitidos • Você poderá adicionar comentários após o upload
                        </p>
                      </div>

                      {/* Lista de arquivos anexados com comentários */}
                      {(etapa6Data.arquivosGerais?.length ?? 0) > 0 && (
                        <div className="mt-4 space-y-2">
                          {etapa6Data.arquivosGerais.map((item, index) => (
                            <div key={index} className="border border-neutral-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <File className="h-4 w-4 text-primary" />
                                  <span className="text-sm">{item.file.name}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newFiles = etapa6Data.arquivosGerais.filter((_, i) => i !== index);
                                    setEtapa6Data({ ...etapa6Data, arquivosGerais: newFiles });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <Input
                                placeholder="Adicionar comentário..."
                                value={item.comment}
                                onChange={(e) => {
                                  const newFiles = [...etapa6Data.arquivosGerais];
                                  newFiles[index].comment = e.target.value;
                                  setEtapa6Data({ ...etapa6Data, arquivosGerais: newFiles });
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
                  data={etapa9Data}
                  onDataChange={setEtapa9Data}
                  readOnly={isHistoricalNavigation}
                />
              )}

              {/* ETAPA 10: Agendar Visita (Apresentação) */}
              {currentStep === 10 && (
                <StepAgendarApresentacao
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
                        onValueChange={(value) => setEtapa12Data({ ...etapa12Data, indicadorFechamento: value })}
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
                        onValueChange={(value) => setEtapa12Data({ ...etapa12Data, nivelSatisfacao: value })}
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
                      <PrimaryButton size="lg" disabled={isHistoricalNavigation}>
                        <Send className="h-4 w-4 mr-2" />
                        Concluir OS e Gerar OS-13
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
              totalSteps={steps.length}
              onPrevStep={handlePrevStep}
              onNextStep={handleNextStep}
              nextButtonText="Avançar"
              onSaveDraft={handleSaveRascunho}
              showDraftButton={[3, 6, 7, 8].includes(currentStep)} // Mostrar apenas em etapas com formulários extensos
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
    </div>
  );
}
