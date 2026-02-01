// OS 07: Termo de Comunicação de Reforma - Sistema Minerva ERP
// Padrão: Stepper Horizontal (WORKFLOW_SUMMARY_DISPLAY_GUIDE v3.0)
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowLeft, Link as LinkIcon, CheckCircle2, Clock, Loader2, User, Building, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { LeadCadastro, type LeadCadastroHandle } from '@/components/os/shared/lead-cadastro';
import { type LeadCompleto } from '@/components/os/shared/lead-cadastro/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/utils/safe-toast';
import { ordensServicoAPI } from '@/lib/api-client';
import { useAuth } from '@/lib/contexts/auth-context';
import { WorkflowStepper } from '@/components/os/shared/components/workflow-stepper';
import { StepReadOnlyWithAdendos } from '@/components/os/shared/components/step-readonly-with-adendos';
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
import { useEtapas } from '@/lib/hooks/use-etapas';
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';
import { logger } from '@/lib/utils/logger';
import { supabase } from '@/lib/supabase-client';

// Componente compartilhado de detalhes de reforma
import { 
  FormDetalhesReforma, 
  FormDetalhesReformaRef,
  DetalhesReformaData, 
  EMPTY_REFORMA_DATA,
  temIntervencaoCritica,
  SISTEMAS_REFORMA,
} from '../shared/form-detalhes-reforma';

interface OS07WorkflowPageProps {
  onBack?: () => void;
  osId?: string;
}

// Interface para dados do solicitante (do formulário público)
interface DadosSolicitante {
  nome: string;
  whatsapp: string;
  email: string;
  condominioNome: string;
  bloco: string;
  unidade: string;
}

/**
 * Definição das etapas da OS-07 v3.4
 * Quando a OS vem do formulário público, os dados já estão preenchidos na Etapa 1
 * Etapa 1 = Detalhes da Solicitação (com dados do solicitante se veio do form público)
 * Etapa 2 = Identificação do Cliente (LeadCadastro - vincular ao cadastro)
 * Etapa 3 = Análise e Parecer
 * Etapa 4 = Gerar PDF
 * Etapa 5 = Concluída
 */
const steps = [
  { id: 1, title: 'Detalhes da Solicitação', short: 'Detalhes', setor: 'administrativo' as const, setorNome: 'Administrativo' },
  { id: 2, title: 'Identificação do Cliente', short: 'Cliente', setor: 'administrativo' as const, setorNome: 'Administrativo' },
  { id: 3, title: 'Análise e Parecer', short: 'Análise', setor: 'assessoria' as const, setorNome: 'Assessoria' },
  { id: 4, title: 'Gerar PDF', short: 'PDF', setor: 'administrativo' as const, setorNome: 'Administrativo' },
  { id: 5, title: 'Concluída', short: 'Fim', setor: 'administrativo' as const, setorNome: 'Administrativo' },
];

export function OS07WorkflowPage({ onBack, osId: propOsId }: OS07WorkflowPageProps) {
  // Estado interno para osId
  const [internalOsId, setInternalOsId] = useState<string | undefined>(propOsId);
  const finalOsId = propOsId || internalOsId;
  const [isCreatingOS, setIsCreatingOS] = useState(false);

  // Estado para LeadCadastro
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const stepLeadRef = useRef<LeadCadastroHandle>(null);

  // Ref para validação do formulário de reforma
  const formRef = useRef<FormDetalhesReformaRef>(null);

  // Estado para FormDetalhesReforma
  const [reformaData, setReformaData] = useState<DetalhesReformaData>(EMPTY_REFORMA_DATA);

  // Estado para dados do solicitante (do formulário público)
  const [dadosSolicitante, setDadosSolicitante] = useState<DadosSolicitante | null>(null);
  const [isFromPublicForm, setIsFromPublicForm] = useState(false);

  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id || 'user-unknown';

  const [clienteNome, setClienteNome] = useState('');

  // Atualizar internalOsId se prop mudar
  useEffect(() => {
    if (propOsId) setInternalOsId(propOsId);
  }, [propOsId]);

  // Carregar dados da OS (dados_publicos) se existir
  useEffect(() => {
    async function loadOSData() {
      if (!finalOsId) return;

      try {
        const { data: os, error } = await supabase
          .from('ordens_servico')
          .select('dados_publicos')
          .eq('id', finalOsId)
          .single();

        if (error) {
          logger.error('[OS07] Erro ao carregar OS:', error);
          return;
        }

        if (os?.dados_publicos) {
          const dados = os.dados_publicos as Record<string, unknown>;
          
          // Verificar se veio do formulário público
          if (dados.origemFormularioPublico) {
            setIsFromPublicForm(true);
            
            // Carregar dados do solicitante
            if (dados.solicitante) {
              setDadosSolicitante(dados.solicitante as DadosSolicitante);
              setClienteNome((dados.solicitante as DadosSolicitante).condominioNome || '');
            }

            // Carregar dados da reforma
            const reformaFromPublic: DetalhesReformaData = {
              intervencoesSelecionadas: (dados.intervencoes as string[]) || [],
              discriminacoes: (dados.discriminacoes as DetalhesReformaData['discriminacoes']) || [],
              planoDescarte: (dados.planoDescarte as string) || '',
              executores: (dados.executores as DetalhesReformaData['executores']) || [],
              arquivosART: [],
              arquivosProjeto: [],
            };
            setReformaData(reformaFromPublic);
          }
        }
      } catch (err) {
        logger.error('[OS07] Erro ao carregar dados:', err);
      }
    }

    loadOSData();
  }, [finalOsId]);

  // Hook de Estado do Workflow
  const {
    currentStep,
    setCurrentStep,
    formDataByStep,
    setStepData,
    saveStep,
    completedSteps: completedStepsFromHook,
    isLoading: isLoadingData,
    etapas,
    refreshEtapas,
  } = useWorkflowState({
    osId: finalOsId,
    totalSteps: steps.length
  });

  // Hook para gerenciar etapas
  const { createEtapasBatch } = useEtapas();

  // Hook para geração de PDF
  const { generate: generatePDF, generating: isGeneratingPDF } = usePDFGeneration();

  // Mapeamento de dados
  const etapa1Data = formDataByStep[1] || null;
  const etapa4Data = formDataByStep[4] as { pdfGerado?: boolean; pdfUrl?: string } || { pdfGerado: false, pdfUrl: '' };

  // Setters
  const setEtapa1Data = (data: unknown) => setStepData(1, data);
  const setEtapa3Data = (data: unknown) => setStepData(3, data);

  // Carregar dados de reforma do etapa1Data se existir
  useEffect(() => {
    if (etapa1Data?.reformaData) {
      setReformaData(etapa1Data.reformaData);
    }
  }, [etapa1Data]);

  // Regras de completude
  const completionRules = useMemo(() => ({
    1: (data: Record<string, unknown>) => {
      // Se veio do formulário público, já está preenchido
      if (isFromPublicForm) return true;
      return !!(data?.reformaData && (data.reformaData as DetalhesReformaData)?.intervencoesSelecionadas?.length > 0);
    },
    2: (data: Record<string, unknown>) => !!(data?.leadId),
    3: (data: Record<string, unknown>) => !!(data?.analiseConcluida),
    4: (data: Record<string, unknown>) => !!(data?.pdfGerado && data?.pdfUrl),
    5: (data: Record<string, unknown>) => !!(data?.concluida),
  }), [isFromPublicForm]);

  const { completedSteps } = useWorkflowCompletion({
    currentStep,
    formDataByStep,
    completionRules,
    completedStepsFromHook
  });

  // Informação da etapa atual
  const currentStepInfo = steps.find(s => s.id === currentStep);

  // Handler para mudança no LeadCadastro
  const handleLeadChange = (id: string, data?: LeadCompleto) => {
    setSelectedLeadId(id);
    if (data) {
      setClienteNome(data.identificacao.nome);
    }
  };

  // =====================================================
  // Handlers de Ações
  // =====================================================

  // Etapa 1: Salvar Detalhes da Solicitação (ou confirmar se veio do form público)
  const handleSalvarDetalhes = async () => {
    // Se não veio do formulário público, validar via componente
    if (!isFromPublicForm) {
      const isValid = formRef.current?.validate();
      if (!isValid) {
        toast.error('Verifique os campos obrigatórios');
        return false;
      }
    }

    // Salvar dados
    setEtapa1Data({ reformaData, solicitante: dadosSolicitante });
    
    if (finalOsId) {
      await saveStep(1, true);
      await refreshEtapas();
    }
    
    setCurrentStep(2);
    toast.success('Dados confirmados!');
    return true;
  };

  // Etapa 2: Identificar Cliente e vincular ao cadastro
  const handleIdentificarCliente = async () => {
    if (!stepLeadRef.current) return false;

    // Validar ART se necessário
    const critico = temIntervencaoCritica(reformaData.intervencoesSelecionadas);
    if (critico && reformaData.arquivosART.length === 0) {
      toast.error('ART/RRT é obrigatório para o tipo de intervenção selecionado');
      return false;
    }

    try {
      setIsCreatingOS(true);

      // Salvar/Recuperar ID do Cliente
      const leadIdFinal = await stepLeadRef.current.save();

      if (!leadIdFinal) {
        setIsCreatingOS(false);
        return false;
      }

      // Salvar vínculo do cliente
      setStepData(2, { leadId: leadIdFinal });
      
      if (finalOsId) {
        // Atualizar cliente_id na OS
        await supabase
          .from('ordens_servico')
          .update({ cliente_id: leadIdFinal })
          .eq('id', finalOsId);

        await saveStep(2, true);
        await refreshEtapas();
      }

      setCurrentStep(3);
      toast.success('Cliente vinculado com sucesso!');
      return true;
    } catch (error) {
      logger.error('Erro ao vincular cliente:', error);
      toast.error('Erro ao vincular cliente');
      return false;
    } finally {
      setIsCreatingOS(false);
    }
  };

  // =====================================================
  // Navegação
  // =====================================================

  const handleStepChange = (step: number) => {
    if (completedSteps.includes(step) || step === currentStep || step < currentStep) {
      setCurrentStep(step);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handler para geração de PDF do parecer
  const handleGerarPDF = async () => {
    if (!finalOsId) {
      toast.error('ID da OS não encontrado');
      return;
    }

    try {
      const dadosParecer = {
        codigoOS: finalOsId,
        cliente: {
          nome: clienteNome || dadosSolicitante?.condominioNome || 'Cliente',
        },
        dadosReforma: reformaData,
        solicitante: dadosSolicitante,
      };

      const result = await generatePDF('parecer-reforma', finalOsId, dadosParecer);

      if (result?.success) {
        setStepData(4, { pdfGerado: true, pdfUrl: result.url });
        await saveStep(4, false);
        await refreshEtapas();
        setCurrentStep(5);
        toast.success('PDF gerado com sucesso!');
      } else {
        toast.error('Erro ao gerar PDF');
      }
    } catch (error) {
      logger.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  // Handler centralizado para Salvar e Avançar
  const handleSaveAndAdvance = async (): Promise<boolean> => {
    try {
      if (currentStep === 1) {
        return await handleSalvarDetalhes();
      }

      if (currentStep === 2) {
        return await handleIdentificarCliente();
      }

      if (currentStep === 3) {
        // Navegar para análise técnica ou marcar como concluída
        setEtapa3Data({ analiseConcluida: true, dataAnalise: new Date().toISOString() });
        await saveStep(3, true);
        await refreshEtapas();
        setCurrentStep(4);
        return true;
      }

      if (currentStep === 4) {
        if (!etapa4Data?.pdfGerado) {
          await handleGerarPDF();
          return !!etapa4Data?.pdfGerado;
        }
        setCurrentStep(5);
        return true;
      }

      if (currentStep === 5) {
        await handleConcluirOS();
        return true;
      }

      return false;
    } catch (error) {
      logger.error(`Erro ao salvar etapa ${currentStep}:`, error);
      return false;
    }
  };

  // Handler para concluir a OS
  const handleConcluirOS = async () => {
    if (!finalOsId) return;

    try {
      setStepData(5, { concluida: true, dataConclusao: new Date().toISOString() });
      await saveStep(5, false);
      await refreshEtapas();
      
      // Atualizar status da OS
      await supabase
        .from('ordens_servico')
        .update({ status_geral: 'concluida' })
        .eq('id', finalOsId);

      toast.success('OS concluída com sucesso!');
    } catch (error) {
      logger.error('Erro ao concluir OS:', error);
      toast.error('Erro ao concluir OS');
    }
  };

  // =====================================================
  // Renderização da Etapa Atual
  // =====================================================

  const stepEtapa = etapas?.find(e => e.ordem === currentStep);

  // Card de Identificação do Solicitante (dados do formulário público)
  const renderSolicitanteCard = () => {
    if (!dadosSolicitante) return null;

    return (
      <Card className="border-info/30 bg-info/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-info" />
            Identificação do Solicitante
          </CardTitle>
          <CardDescription>Dados preenchidos pelo cliente no formulário externo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" /> Nome
              </p>
              <p className="font-medium">{dadosSolicitante.nome || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3" /> WhatsApp
              </p>
              <p className="font-medium">{dadosSolicitante.whatsapp || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3" /> E-mail
              </p>
              <p className="font-medium">{dadosSolicitante.email || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-1">
                <Building className="w-3 h-3" /> Condomínio
              </p>
              <p className="font-medium">{dadosSolicitante.condominioNome || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Bloco
              </p>
              <p className="font-medium">{dadosSolicitante.bloco || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Unidade
              </p>
              <p className="font-medium">{dadosSolicitante.unidade || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Card de resumo dos dados de reforma (read-only)
  const renderResumoReformaCard = () => {
    if (reformaData.intervencoesSelecionadas.length === 0 && reformaData.discriminacoes.length === 0) {
      return null;
    }

    return (
      <div className="space-y-4">
        {/* Discriminações */}
        {reformaData.discriminacoes.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Discriminação das Alterações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reformaData.discriminacoes.map((disc, idx) => (
                  <div key={disc.id || idx} className="bg-muted/50 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline">
                        {SISTEMAS_REFORMA.find(s => s.id === disc.sistema)?.label || disc.sistema}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {disc.previsaoInicio} - {disc.previsaoFim}
                      </span>
                    </div>
                    <p>{disc.item}</p>
                    {disc.geraRuido && (
                      <Badge variant="secondary" className="mt-1 text-xs">Gera Ruído</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plano de Descarte */}
        {reformaData.planoDescarte && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Plano de Descarte</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{reformaData.planoDescarte}</p>
            </CardContent>
          </Card>
        )}

        {/* Executores */}
        {reformaData.executores.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Executores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reformaData.executores.map((exec, idx) => (
                  <div key={exec.id || idx} className="flex items-center justify-between text-sm bg-muted/50 rounded p-2">
                    <span>{exec.nome}</span>
                    <span className="text-muted-foreground font-mono">{exec.cpf}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderCurrentStepForm = () => {
    const isReadOnly = completedSteps.includes(currentStep);

    const formContent = (() => {
      switch (currentStep) {
        case 1:
          // Etapa 1: Detalhes da Solicitação
          return (
            <div className="space-y-6">
              {/* Se veio do formulário público, mostrar dados do solicitante */}
              {isFromPublicForm && renderSolicitanteCard()}
              
              {/* Se veio do formulário público, mostrar resumo read-only */}
              {isFromPublicForm ? (
                <>
                  {renderResumoReformaCard()}
                  <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <p className="text-sm text-success font-medium">
                        Dados recebidos do formulário externo. Revise e avance para identificar o cliente.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                /* Se não veio do form público, mostrar formulário editável */
                <FormDetalhesReforma
                  ref={formRef}
                  data={reformaData}
                  onDataChange={setReformaData}
                  readOnly={isReadOnly}
                />
              )}
            </div>
          );

        case 2:
          // Etapa 2: Identificação do Cliente
          return (
            <div className="space-y-6">
              {/* Se tem dados do solicitante, mostrar para referência */}
              {dadosSolicitante && (
                <div className="bg-info/5 border border-info/20 rounded-lg p-4">
                  <p className="text-sm text-info mb-2 font-medium">ℹ️ Referência do Solicitante:</p>
                  <p className="text-sm">
                    <strong>{dadosSolicitante.nome}</strong> - {dadosSolicitante.condominioNome}
                    {dadosSolicitante.bloco && ` / Bloco ${dadosSolicitante.bloco}`}
                    {dadosSolicitante.unidade && ` / Unidade ${dadosSolicitante.unidade}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dadosSolicitante.email} | {dadosSolicitante.whatsapp}
                  </p>
                </div>
              )}

              <LeadCadastro
                ref={stepLeadRef}
                selectedLeadId={selectedLeadId}
                onLeadChange={handleLeadChange}
                showEdificacao={true}
                showEndereco={true}
                statusFilter={['lead', 'ativo']}
                readOnly={isReadOnly}
              />
            </div>
          );

        case 3:
          // Etapa 3: Análise e Parecer
          return (
            <div className="space-y-4">
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <h4 className="font-medium mb-2">Análise Técnica</h4>
                <p className="text-sm text-muted-foreground">
                  Revise os dados da solicitação e emita o parecer técnico.
                  Clique em "Avançar" para confirmar a análise.
                </p>
              </div>
              {renderResumoReformaCard()}
            </div>
          );

        case 4:
          // Etapa 4: Gerar PDF
          return (
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Geração do PDF do Parecer Técnico</h4>
              <p className="text-sm text-muted-foreground">
                Clique no botão "Gerar PDF" para criar o documento.
              </p>
            </div>
          );

        case 5:
          // Etapa 5: Concluída
          return (
            <div className="bg-success/5 border border-success/20 rounded-lg p-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-success mb-2">OS Concluída!</h3>
              <p className="text-sm text-muted-foreground">
                O Termo de Comunicação de Reforma foi processado com sucesso.
              </p>
            </div>
          );

        default:
          return null;
      }
    })();

    // Wrapper com adendos quando etapa existe no banco
    if (stepEtapa?.id && isReadOnly) {
      return (
        <StepReadOnlyWithAdendos etapaId={stepEtapa.id} readonly={true}>
          {formContent}
        </StepReadOnlyWithAdendos>
      );
    }

    return formContent;
  };

  // Botão de ação dinâmico
  const getActionButtonText = () => {
    switch (currentStep) {
      case 1: return isFromPublicForm ? 'Confirmar e Avançar' : 'Salvar e Avançar';
      case 2: return 'Vincular Cliente e Avançar';
      case 3: return 'Confirmar Análise';
      case 4: return 'Gerar PDF';
      case 5: return 'Concluir OS';
      default: return 'Avançar';
    }
  };

  const isLoading = isLoadingData || isCreatingOS || isGeneratingPDF;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {onBack ? (
              <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </button>
            ) : (
              <Link to="/os" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </Link>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-info" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">OS 07: Termo de Comunicação de Reforma</h1>
                  <p className="text-sm text-muted-foreground">
                    {isFromPublicForm ? 'Solicitação recebida do formulário externo' : 'Fluxo interno de reforma'}
                  </p>
                </div>
              </div>
            </div>
            <Badge variant="outline">
              {completedSteps.length} / {steps.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stepper Horizontal */}
      <div className="bg-card border-b">
        <div className="max-w-5xl mx-auto">
          <WorkflowStepper
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepChange}
          />
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Etapa {currentStep}: {currentStepInfo?.title}</CardTitle>
                  <CardDescription>Setor: {currentStepInfo?.setorNome}</CardDescription>
                </div>
                <Badge variant={completedSteps.includes(currentStep) ? 'default' : 'secondary'}>
                  {completedSteps.includes(currentStep) ? (
                    <><CheckCircle2 className="w-3 h-3 mr-1" />Concluída</>
                  ) : (
                    <><Clock className="w-3 h-3 mr-1" />Em andamento</>
                  )}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {renderCurrentStepForm()}
            </CardContent>

            {/* Footer com Ações */}
            <div className="border-t bg-muted/30 px-6 py-4">
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={handlePrevStep} disabled={currentStep === 1 || isLoading}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Etapa Anterior
                </Button>
                <Button onClick={handleSaveAndAdvance} disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processando...</>
                  ) : (
                    getActionButtonText()
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
