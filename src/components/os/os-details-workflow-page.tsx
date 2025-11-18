"use client";

import React, { useState, useMemo, useEffect } from 'react';
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
  Info
} from 'lucide-react';
import { Separator } from '../ui/separator';
import { WorkflowStepper, WorkflowStep } from './workflow-stepper';
import { WorkflowFooter } from './workflow-footer';
import { StepIdentificacaoLeadCompleto } from './steps/shared/step-identificacao-lead-completo';
import { StepMemorialEscopo } from './steps/shared/step-memorial-escopo';
import { StepPrecificacao } from './steps/shared/step-precificacao';
import { StepGerarPropostaOS0104 } from './steps/shared/step-gerar-proposta-os01-04';
import { useEtapas } from '../../lib/hooks/use-etapas';
import { ordensServicoAPI, clientesAPI } from '../../lib/api-client';
import { toast } from '../../lib/utils/safe-toast';
import { ErrorBoundary } from '../error-boundary';
import { uploadFile, deleteFile, formatFileSize, getFileUrl } from '../../lib/utils/supabase-storage';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [showLeadCombobox, setShowLeadCombobox] = useState(false);
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
  
  // Estado interno para armazenar osId criada (diferente da prop osIdProp)
  const [internalOsId, setInternalOsId] = useState<string | null>(null);
  
  // Estado de loading para criação de OS (Etapa 2 → 3)
  const [isCreatingOS, setIsCreatingOS] = useState(false);
  
  // Usar osIdProp (editando OS existente) ou internalOsId (criando nova OS)
  const osId = osIdProp || internalOsId;
  
  // Hook para gerenciar etapas
  const { etapas, isLoading, fetchEtapas, createEtapa, updateEtapa, saveFormData, getEtapaData } = useEtapas();
  
  // Estados de navegação histórica
  const [lastActiveStep, setLastActiveStep] = useState<number | null>(null);
  const [isHistoricalNavigation, setIsHistoricalNavigation] = useState(false);
  
  // Calcular quais etapas estão concluídas (status = APROVADA)
  const completedSteps = useMemo(() => {
    if (!etapas || etapas.length === 0) return [];
    
    return etapas
      .filter((etapa: any) => etapa.status === 'APROVADA')
      .map((etapa: any) => etapa.numero_etapa);
  }, [etapas]);
  
  // Estados dos formulários de cada etapa
  const [etapa1Data, setEtapa1Data] = useState({ leadId: '' });
  const [etapa2Data, setEtapa2Data] = useState({ tipoOS: '' });
  const [etapa3Data, setEtapa3Data] = useState({
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
    anexos: [] as Array<{
      id: string;
      name: string;
      path: string;
      size: number;
      type: string;
      url: string;
      uploadedAt: string;
    }>,
  });
  
  // Estado para controlar upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [etapa4Data, setEtapa4Data] = useState({ dataAgendamento: '' });
  const [etapa5Data, setEtapa5Data] = useState({ visitaRealizada: false });
  const [etapa6Data, setEtapa6Data] = useState({
    // Momento 1: Perguntas Durante a Visita - Respostas do Cliente
    outrasEmpresas: '',
    comoEsperaResolver: '',
    expectativaCliente: '',
    estadoAncoragem: '',
    fotosAncoragem: [] as Array<{ file: File; comment: string }>,
    // Momento 2: Avaliação Geral da Visita
    quemAcompanhou: '',
    avaliacaoVisita: '',
    // Momento 3: Respostas do Engenheiro
    estadoGeralEdificacao: '',
    servicoResolver: '',
    arquivosGerais: [] as Array<{ file: File; comment: string }>,
  });
  const [etapa8Data, setEtapa8Data] = useState({
    objetivo: '',
    etapasPrincipais: [] as Array<{
      nome: string;
      subetapas: Array<{
        nome: string;
        m2: string;
        diasUteis: string;
        total: string;
      }>;
    }>,
    planejamentoInicial: '',
    logisticaTransporte: '',
    preparacaoArea: '',
  });
  const [etapa9Data, setEtapa9Data] = useState({
    percentualImprevisto: '',
    percentualLucro: '',
    percentualImposto: '',
    percentualEntrada: '',
    numeroParcelas: '',
  });
  const [etapa10Data, setEtapa10Data] = useState({
    propostaGerada: false,
    dataGeracao: '',
    codigoProposta: '',
    validadeDias: '',
    garantiaMeses: '',
  });
  const [etapa11Data, setEtapa11Data] = useState({ dataAgendamento: '' });
  const [etapa12Data, setEtapa12Data] = useState({ apresentacaoRealizada: false });
  const [etapa13Data, setEtapa13Data] = useState({
    propostaApresentada: '',
    metodoApresentacao: '',
    clienteAchouProposta: '',
    clienteAchouContrato: '',
    doresNaoAtendidas: '',
    indicadorFechamento: '',
    quemEstavaNaApresentacao: '',
    nivelSatisfacao: '',
  });
  const [etapa14Data, setEtapa14Data] = useState({ contratoFile: null as File | null });
  const [etapa15Data, setEtapa15Data] = useState({ contratoAssinado: false });

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
    // Custo Base (soma dos totais das sub-etapas)
    const custoBase = etapa8Data.etapasPrincipais.reduce((total, etapa) => {
      return total + etapa.subetapas.reduce((subtotal, sub) => {
        return subtotal + (parseFloat(sub.total) || 0);
      }, 0);
    }, 0);

    // Percentuais
    const percImprevisto = parseFloat(etapa9Data.percentualImprevisto) || 0;
    const percLucro = parseFloat(etapa9Data.percentualLucro) || 0;
    const percImposto = parseFloat(etapa9Data.percentualImposto) || 0;
    const percEntrada = parseFloat(etapa9Data.percentualEntrada) || 0;
    const numParcelas = parseFloat(etapa9Data.numeroParcelas) || 1;

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
  }, [etapa8Data.etapasPrincipais, etapa9Data]);

  // Funções de upload de arquivos
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!osId) {
      toast.error('É necessário criar a OS antes de anexar arquivos');
      return;
    }
    
    // TODO: Pegar colaboradorId do usuário logado (por enquanto usando mock)
    const colaboradorId = 'user-123';
    
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
        anexos: [...prev.anexos, ...uploadedFiles],
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
        anexos: prev.anexos.filter(f => f.id !== fileId),
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

  const handleStepClick = (stepId: number) => {
    // Só permite voltar para etapas concluídas ou a etapa atual
    if (stepId <= currentStep) {
      // Se está navegando para uma etapa anterior, salva a posição atual
      if (stepId < currentStep && !isHistoricalNavigation) {
        setLastActiveStep(currentStep);
        setIsHistoricalNavigation(true);
        
        toast.info('Visualizando etapa anterior. Seus dados foram salvos.', { icon: '👁️' });
      }
      
      // Se está voltando para a última etapa ativa, limpa o modo histórico
      if (stepId === lastActiveStep) {
        setIsHistoricalNavigation(false);
        setLastActiveStep(null);
        
        toast.success('Voltou para onde estava!', { icon: '🎯' });
      }
      
      setCurrentStep(stepId);
    } else {
      toast.warning('Complete as etapas anteriores primeiro', { icon: '🔒' });
    }
  };

  const handleReturnToActive = () => {
    if (lastActiveStep) {
      setCurrentStep(lastActiveStep);
      setIsHistoricalNavigation(false);
      setLastActiveStep(null);
      toast.success('Voltou para onde estava!', { icon: '🎯' });
    }
  };

  const handleSelectLead = (leadId: string) => {
    try {
      console.log('🎯 handleSelectLead chamado com ID:', leadId);
      
      // Validar leadId
      if (!leadId || typeof leadId !== 'string') {
        console.error('❌ leadId inválido:', leadId);
        return;
      }
      
      setSelectedLeadId(leadId);
      setEtapa1Data({ leadId });
      
      console.log('✅ Lead ID salvo com sucesso:', leadId);
      // Nota: O formData é preenchido pelo componente StepIdentificacaoLeadCompleto
      // quando um lead é selecionado do banco de dados
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

  // Carregar etapas ao montar o componente (se osIdProp fornecido - modo edição)
  useEffect(() => {
    if (osIdProp && osIdProp.trim() !== '') {
      console.log(`📋 Modo Edição: Carregando etapas da OS ${osIdProp}...`);
      loadEtapas();
    } else {
      console.log('ℹ️ Modo Criação: osId não fornecido, OS será criada ao avançar da etapa 2 para 3');
    }
  }, [osIdProp]);

  // Carregar dados da etapa atual ao navegar (navegação histórica)
  useEffect(() => {
    if (etapas && etapas.length > 0 && osId) {
      carregarDadosEtapaAtual();
    }
  }, [currentStep, etapas]);

  /**
   * Carregar dados salvos da etapa atual
   * (Usado na navegação histórica)
   */
  const carregarDadosEtapaAtual = () => {
    const dadosSalvos = getEtapaData(currentStep);
    
    if (!dadosSalvos) {
      console.log(`ℹ️ Etapa ${currentStep} sem dados salvos`);
      return;
    }
    
    console.log(`📥 Carregando dados da etapa ${currentStep}:`, dadosSalvos);
    
    // Carregar dados no estado correspondente
    switch (currentStep) {
      case 1:
        setEtapa1Data(prev => ({ ...prev, ...dadosSalvos }));
        break;
      case 2:
        setEtapa2Data(prev => ({ ...prev, ...dadosSalvos }));
        break;
      case 3:
        setEtapa3Data(prev => ({ ...prev, ...dadosSalvos }));
        break;
      case 4:
        setEtapa4Data(prev => ({ ...prev, ...dadosSalvos }));
        break;
      case 5:
        setEtapa5Data(prev => ({ ...prev, ...dadosSalvos }));
        break;
      case 6:
        setEtapa6Data(prev => ({ ...prev, ...dadosSalvos }));
        break;
      case 7:
        // Etapa 7 (Memorial Escopo) usa etapa8Data
        setEtapa8Data(prev => ({ ...prev, ...dadosSalvos }));
        break;
      case 8:
        setEtapa8Data(prev => ({ ...prev, ...dadosSalvos }));
        break;
      case 9:
        setEtapa9Data(prev => ({ ...prev, ...dadosSalvos }));
        break;
      case 10:
        setEtapa10Data(prev => ({ ...prev, ...dadosSalvos }));
        break;
      case 11:
        setEtapa11Data(prev => ({ ...prev, ...dadosSalvos }));
        break;
      case 12:
        setEtapa12Data(prev => ({ ...prev, ...dadosSalvos }));
        break;
      case 13:
        setEtapa13Data(prev => ({ ...prev, ...dadosSalvos }));
        break;
      case 14:
        setEtapa14Data(prev => ({ ...prev, ...dadosSalvos }));
        break;
      case 15:
        setEtapa15Data(prev => ({ ...prev, ...dadosSalvos }));
        break;
    }
  };

  /**
   * Carregar etapas do banco e preencher estados locais
   */
  const loadEtapas = async () => {
    if (!osId || osId.trim() === '') {
      console.warn('⚠️ loadEtapas: osId inválido ou vazio');
      return;
    }
    
    try {
      await fetchEtapas(osId);
      console.log('✅ Etapas carregadas:', etapas);
      
      // Preencher estados locais com dados do banco
      if (etapas) {
        etapas.forEach((etapa) => {
          if (etapa.dados_etapa) {
            switch (etapa.ordem) {
              case 1:
                setEtapa1Data(etapa.dados_etapa);
                break;
              case 2:
                setEtapa2Data(etapa.dados_etapa);
                break;
              case 3:
                setEtapa3Data(etapa.dados_etapa);
                break;
              case 4:
                setEtapa4Data(etapa.dados_etapa);
                break;
              case 5:
                setEtapa5Data(etapa.dados_etapa);
                break;
              case 6:
                setEtapa6Data(etapa.dados_etapa);
                break;
              case 8:
                setEtapa8Data(etapa.dados_etapa);
                break;
              case 9:
                setEtapa9Data(etapa.dados_etapa);
                break;
              case 10:
                setEtapa10Data(etapa.dados_etapa);
                break;
              case 11:
                setEtapa11Data(etapa.dados_etapa);
                break;
              case 12:
                setEtapa12Data(etapa.dados_etapa);
                break;
              case 13:
                setEtapa13Data(etapa.dados_etapa);
                break;
              case 14:
                setEtapa14Data(etapa.dados_etapa);
                break;
              case 15:
                setEtapa15Data(etapa.dados_etapa);
                break;
            }
          }
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar etapas:', error);
      try {
        toast.error('Erro ao carregar dados das etapas');
      } catch (toastError) {
        console.error('❌ Erro ao exibir toast de erro (fetchEtapas):', toastError);
      }
    }
  };

  /**
   * Obter dados da etapa atual
   */
  const getCurrentStepData = () => {
    switch (currentStep) {
      case 1: return etapa1Data;
      case 2: return etapa2Data;
      case 3: return etapa3Data;
      case 4: return etapa4Data;
      case 5: return etapa5Data;
      case 6: return etapa6Data;
      case 8: return etapa8Data;
      case 9: return etapa9Data;
      case 10: return etapa10Data;
      case 11: return etapa11Data;
      case 12: return etapa12Data;
      case 13: return etapa13Data;
      case 14: return etapa14Data;
      case 15: return etapa15Data;
      default: return {};
    }
  };

  /**
   * Validar campos obrigatórios da etapa atual
   * @returns true se válido, false se há campos faltando
   */
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1: // Identificação do Lead
        return !!etapa1Data.leadId;
      
      case 2: // Seleção do Tipo de OS
        return !!etapa2Data.tipoOS;
      
      case 3: // Follow-up 1
        return !!(
          etapa3Data.idadeEdificacao &&
          etapa3Data.motivoProcura &&
          etapa3Data.quandoAconteceu &&
          etapa3Data.grauUrgencia &&
          etapa3Data.apresentacaoProposta &&
          etapa3Data.nomeContatoLocal &&
          etapa3Data.telefoneContatoLocal
        );
      // Adicionar validações para outras etapas conforme necessário
      default:
        return true; // Etapas sem validação específica
    }
  };

  /**
   * Salvar dados da etapa no banco
   */
  const saveCurrentStepData = async (markAsComplete: boolean = true) => {
    if (!osId || !etapas) {
      console.warn('⚠️ Não é possível salvar: osId ou etapas não disponíveis');
      return;
    }

    try {
      const etapaAtual = etapas.find((e) => e.ordem === currentStep);
      
      if (!etapaAtual) {
        console.warn(`⚠️ Etapa ${currentStep} não encontrada no banco`);
        try {
          toast.error('Etapa não encontrada');
        } catch (toastError) {
          console.error('❌ Erro ao exibir toast (etapa não encontrada):', toastError);
        }
        return;
      }

      console.log(`💾 Salvando etapa ${currentStep}...`);
      
      await saveFormData(
        etapaAtual.id,
        getCurrentStepData(),
        markAsComplete
      );

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
        await fetchEtapas(novaOsId);
        
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
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

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
      
      {/* Stepper Horizontal */}
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
                    selectedLeadId={selectedLeadId}
                    onSelectLead={handleSelectLead}
                    showCombobox={showLeadCombobox}
                    onShowComboboxChange={setShowLeadCombobox}
                    showNewLeadDialog={showNewLeadDialog}
                    onShowNewLeadDialogChange={setShowNewLeadDialog}
                    formData={formData}
                    onFormDataChange={setFormData}
                    onSaveNewLead={handleSaveNewLead}
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
                <div className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Realize a entrevista inicial com o lead/cliente para levantar informações sobre o projeto.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="idadeEdificacao">
                        1. Qual a idade da edificação? <span className="text-destructive">*</span>
                      </Label>
                      <Select 
                        value={etapa3Data.idadeEdificacao} 
                        onValueChange={(value) => setEtapa3Data({ ...etapa3Data, idadeEdificacao: value })}
                      >
                        <SelectTrigger id="idadeEdificacao">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ainda não foi entregue">Ainda não foi entregue</SelectItem>
                          <SelectItem value="0 a 3 anos">0 a 3 anos</SelectItem>
                          <SelectItem value="3 a 5 anos">3 a 5 anos</SelectItem>
                          <SelectItem value="5 a 10 anos">5 a 10 anos</SelectItem>
                          <SelectItem value="10 a 20 anos">10 a 20 anos</SelectItem>
                          <SelectItem value="Acima de 20 anos">Acima de 20 anos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="motivoProcura">
                        2. Qual o motivo fez você nos procurar? Quais problemas existentes? <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="motivoProcura"
                        rows={4}
                        value={etapa3Data.motivoProcura}
                        onChange={(e) => setEtapa3Data({ ...etapa3Data, motivoProcura: e.target.value })}
                        placeholder="Descreva os problemas e motivações..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quandoAconteceu">
                        3. Quando aconteceu? Há quanto tempo vem acontecendo? <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="quandoAconteceu"
                        rows={3}
                        value={etapa3Data.quandoAconteceu}
                        onChange={(e) => setEtapa3Data({ ...etapa3Data, quandoAconteceu: e.target.value })}
                        placeholder="Descreva o histórico do problema..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="oqueFeitoARespeito">
                        4. O que já foi feito a respeito disso?
                      </Label>
                      <Textarea
                        id="oqueFeitoARespeito"
                        rows={3}
                        value={etapa3Data.oqueFeitoARespeito}
                        onChange={(e) => setEtapa3Data({ ...etapa3Data, oqueFeitoARespeito: e.target.value })}
                        placeholder="Descreva as ações já realizadas..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="existeEscopo">
                        5. Existe um escopo de serviços ou laudo com diagnóstico do problema?
                      </Label>
                      <Textarea
                        id="existeEscopo"
                        rows={2}
                        value={etapa3Data.existeEscopo}
                        onChange={(e) => setEtapa3Data({ ...etapa3Data, existeEscopo: e.target.value })}
                        placeholder="Sim/Não e detalhes..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="previsaoOrcamentaria">
                        6. Existe previsão orçamentária para este serviço? Ou você precisa de parâmetro para taxa extra?
                      </Label>
                      <Textarea
                        id="previsaoOrcamentaria"
                        rows={2}
                        value={etapa3Data.previsaoOrcamentaria}
                        onChange={(e) => setEtapa3Data({ ...etapa3Data, previsaoOrcamentaria: e.target.value })}
                        placeholder="Informe o orçamento dispon��vel..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grauUrgencia">
                        7. Qual o grau de urgência para executar esse serviço? <span className="text-destructive">*</span>
                      </Label>
                      <Select 
                        value={etapa3Data.grauUrgencia} 
                        onValueChange={(value) => setEtapa3Data({ ...etapa3Data, grauUrgencia: value })}
                      >
                        <SelectTrigger id="grauUrgencia">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30 dias">30 dias</SelectItem>
                          <SelectItem value="3 meses">3 meses</SelectItem>
                          <SelectItem value="6 meses ou mais">6 meses ou mais</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apresentacaoProposta">
                        8. Nossas propostas são apresentadas, nós não enviamos orçamento. Você concorda? Deseja que faça o orçamento? Se sim, qual dia e horário sugeridos para apresentação da proposta comercial dessa visita técnica? <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="apresentacaoProposta"
                        rows={3}
                        value={etapa3Data.apresentacaoProposta}
                        onChange={(e) => setEtapa3Data({ ...etapa3Data, apresentacaoProposta: e.target.value })}
                        placeholder="Resposta do cliente..."
                      />
                    </div>

                    <Separator />

                    <h3 className="text-sm font-medium">Dados do Contato no Local</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nomeContatoLocal">
                          9. Nome (Contato no Local) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="nomeContatoLocal"
                          value={etapa3Data.nomeContatoLocal}
                          onChange={(e) => setEtapa3Data({ ...etapa3Data, nomeContatoLocal: e.target.value })}
                          placeholder="Nome completo"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefoneContatoLocal">
                          10. Contato (Telefone) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="telefoneContatoLocal"
                          value={etapa3Data.telefoneContatoLocal}
                          onChange={(e) => setEtapa3Data({ ...etapa3Data, telefoneContatoLocal: e.target.value })}
                          placeholder="(00) 00000-0000"
                        />
                      </div>

                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="cargoContatoLocal">
                          11. Cargo (Contato no Local)
                        </Label>
                        <Input
                          id="cargoContatoLocal"
                          value={etapa3Data.cargoContatoLocal}
                          onChange={(e) => setEtapa3Data({ ...etapa3Data, cargoContatoLocal: e.target.value })}
                          placeholder="Ex: Síndico, Zelador, Gerente..."
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Anexar Arquivos (escopo, laudo, fotos)</Label>
                      <div 
                        className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                        onClick={() => document.getElementById('file-upload-etapa3')?.click()}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        <input
                          id="file-upload-etapa3"
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.doc,.xls"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          className="hidden"
                        />
                        {isUploading ? (
                          <>
                            <Loader2 className="h-8 w-8 mx-auto mb-2 text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground">
                              Enviando arquivos... {Math.round(uploadProgress)}%
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Clique para selecionar ou arraste arquivos aqui
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PDF, JPG, PNG, DOCX, XLSX (máx. 10MB)
                            </p>
                          </>
                        )}
                      </div>
                      
                      {/* Lista de arquivos anexados */}
                      {etapa3Data.anexos.length > 0 && (
                        <div className="space-y-2 mt-4">
                          <Label className="text-sm">Arquivos Anexados ({etapa3Data.anexos.length})</Label>
                          <div className="space-y-2">
                            {etapa3Data.anexos.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <FileText className="h-5 w-5 text-primary" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleString('pt-BR')}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(file.url, '_blank')}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFileDelete(file.id, file.path)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
                      {etapa6Data.fotosAncoragem.length > 0 && (
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
                      {etapa6Data.arquivosGerais.length > 0 && (
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
              {currentStep === 7 && (
                <StepMemorialEscopo
                  data={etapa8Data}
                  onDataChange={setEtapa8Data}
                />
              )}

              {/* ETAPA 8: Precificação */}
              {currentStep === 8 && (
                <StepPrecificacao
                  etapa8Data={etapa8Data}
                  etapa9Data={etapa9Data}
                  onEtapa9DataChange={setEtapa9Data}
                />
              )}

              {/* ETAPA 9: Gerar Proposta Comercial */}
              {currentStep === 9 && (
                <StepGerarPropostaOS0104
                  etapa1Data={formData}
                  etapa2Data={etapa2Data}
                  etapa7Data={etapa8Data}
                  etapa8Data={etapa9Data}
                  valorTotal={valoresPrecificacao.valorTotal}
                  valorEntrada={valoresPrecificacao.valorEntrada}
                  valorParcela={valoresPrecificacao.valorParcela}
                  data={etapa10Data}
                  onDataChange={setEtapa10Data}
                />
              )}

              {/* ETAPA 10: Agendar Visita (Apresentação) */}
              {currentStep === 10 && (
                <div className="space-y-6">
                  <Alert>
                    <Calendar className="h-4 w-4" />
                    <AlertDescription>
                      Agende a visita para apresentação da proposta comercial ao cliente.
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-col items-center justify-center py-12 gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-10 w-10 text-primary" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium mb-2">Agendar Apresentação da Proposta</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Selecione a data e horário para apresentar a proposta comercial.
                      </p>
                      <Button style={{ backgroundColor: '#f97316', color: 'white' }}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Agendar no Calendário
                      </Button>
                    </div>
                  </div>

                  {etapa11Data.dataAgendamento && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">Apresentação agendada para:</p>
                            <p className="text-sm text-muted-foreground">{etapa11Data.dataAgendamento}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* ETAPA 11: Realizar Visita (Apresentação) */}
              {currentStep === 11 && (
                <div className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Confirme a realização da apresentação da proposta comercial.
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-col items-center justify-center py-12 gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-10 w-10 text-primary" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium mb-2">Confirmar Realização da Apresentação</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Marque a caixa abaixo para confirmar que a apresentação foi realizada.
                      </p>
                      <div className="flex items-center space-x-3 justify-center">
                        <Switch
                          id="apresentacaoRealizada"
                          checked={etapa12Data.apresentacaoRealizada}
                          onCheckedChange={(checked) => {
                            setEtapa12Data((prev) => ({ ...prev, apresentacaoRealizada: checked }));
                          }}
                        />
                        <Label htmlFor="apresentacaoRealizada" className="cursor-pointer">
                          Apresentação realizada
                        </Label>
                      </div>
                    </div>
                  </div>

                  {etapa12Data.apresentacaoRealizada && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">Apresentação confirmada!</p>
                            <p className="text-sm text-muted-foreground">Data: {new Date().toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
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

                  {/* Momento 1: Apresentaç��o */}
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
                        value={etapa13Data.propostaApresentada}
                        onChange={(e) => setEtapa13Data({ ...etapa13Data, propostaApresentada: e.target.value })}
                        placeholder="Descreva a proposta apresentada..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="metodoApresentacao">
                        2. Qual o método de apresentação? <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="metodoApresentacao"
                        rows={2}
                        value={etapa13Data.metodoApresentacao}
                        onChange={(e) => setEtapa13Data({ ...etapa13Data, metodoApresentacao: e.target.value })}
                        placeholder="Ex: Presencial, Online, Slides..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clienteAchouProposta">
                        3. O que o cliente achou da proposta? <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="clienteAchouProposta"
                        rows={3}
                        value={etapa13Data.clienteAchouProposta}
                        onChange={(e) => setEtapa13Data({ ...etapa13Data, clienteAchouProposta: e.target.value })}
                        placeholder="Descreva a reação e comentários do cliente..."
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
                        value={etapa13Data.clienteAchouContrato}
                        onChange={(e) => setEtapa13Data({ ...etapa13Data, clienteAchouContrato: e.target.value })}
                        placeholder="Descreva a opinião do cliente sobre o contrato..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doresNaoAtendidas">
                        5. Quais as dores do cliente não atendidas?
                      </Label>
                      <Textarea
                        id="doresNaoAtendidas"
                        rows={3}
                        value={etapa13Data.doresNaoAtendidas}
                        onChange={(e) => setEtapa13Data({ ...etapa13Data, doresNaoAtendidas: e.target.value })}
                        placeholder="Liste possíveis objeções ou pontos não atendidos..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="indicadorFechamento">
                        6. Qual o indicador de fechamento da proposta? <span className="text-destructive">*</span>
                      </Label>
                      <Select 
                        value={etapa13Data.indicadorFechamento} 
                        onValueChange={(value) => setEtapa13Data({ ...etapa13Data, indicadorFechamento: value })}
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
                        value={etapa13Data.quemEstavaNaApresentacao}
                        onChange={(e) => setEtapa13Data({ ...etapa13Data, quemEstavaNaApresentacao: e.target.value })}
                        placeholder="Liste os participantes da reunião..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        8. Qual o nível de satisfação do cliente? <span className="text-destructive">*</span>
                      </Label>
                      <RadioGroup 
                        value={etapa13Data.nivelSatisfacao} 
                        onValueChange={(value) => setEtapa13Data({ ...etapa13Data, nivelSatisfacao: value })}
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
                <div className="space-y-6">
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-700">
                      <strong>Atenção:</strong> Esta etapa requer aprovação do Gestor ADM.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Coluna 1: Download do Modelo */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">1. Baixar Modelo</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center justify-center py-8 gap-4">
                        <Download className="h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground text-center">
                          Baixe o modelo de contrato padrão
                        </p>
                        <PrimaryButton variant="secondary">
                          <Download className="h-4 w-4 mr-2" />
                          Baixar Modelo de Contrato (.docx)
                        </PrimaryButton>
                      </CardContent>
                    </Card>

                    {/* Coluna 2: Upload da Minuta */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">2. Upload da Minuta</CardTitle>
                      </CardHeader>
                      <CardContent className="py-8">
                        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-1">
                            Fazer Upload da Minuta do Contrato
                          </p>
                          <p className="text-xs text-muted-foreground">
                            DOCX, PDF (máx. 15MB)
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {etapa14Data.contratoFile && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-green-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Minuta do contrato anexada:</p>
                            <p className="text-sm text-muted-foreground">{etapa14Data.contratoFile.name}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* ETAPA 14: Contrato Assinado */}
              {currentStep === 14 && (
                <div className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Confirme que o contrato foi assinado pelo cliente para prosseguir.
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-col items-center justify-center py-12 gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-10 w-10 text-primary" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium mb-2">Contrato Assinado pelo Cliente</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Marque a caixa abaixo para confirmar que o contrato foi assinado.
                      </p>
                      <div className="flex items-center space-x-3 justify-center">
                        <Switch
                          id="contratoAssinado"
                          checked={etapa15Data.contratoAssinado}
                          onCheckedChange={(checked) => {
                            setEtapa15Data((prev) => ({ ...prev, contratoAssinado: checked }));
                          }}
                        />
                        <Label htmlFor="contratoAssinado" className="cursor-pointer">
                          Contrato Assinado pelo Cliente
                        </Label>
                      </div>
                    </div>
                  </div>

                  {etapa15Data.contratoAssinado && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">Contrato assinado confirmado!</p>
                            <p className="text-sm text-muted-foreground">
                              O lead será convertido em cliente e uma OS-13 será gerada automaticamente.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
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
                      <PrimaryButton size="lg">
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
              onSaveDraft={handleSaveRascunho}
              showDraftButton={[3, 6, 7, 8].includes(currentStep)} // Mostrar apenas em etapas com formulários extensos
              disableNext={isLoading}
              isLoading={isCreatingOS}
              loadingText={currentStep === 2 ? 'Criando OS no Supabase...' : 'Processando...'}
              readOnlyMode={isHistoricalNavigation}
              onReturnToActive={handleReturnToActive}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
