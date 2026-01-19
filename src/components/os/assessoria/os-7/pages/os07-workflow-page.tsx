// OS 07: Termo de Comunicação de Reforma - Sistema Minerva ERP
'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { ArrowLeft, Link as LinkIcon, CheckCircle2, Copy, ExternalLink, Clock, Loader2 } from 'lucide-react';
import { LeadCadastro, type LeadCadastroHandle } from '@/components/os/shared/lead-cadastro';
import { type LeadCompleto } from '@/components/os/shared/lead-cadastro/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from '@/lib/utils/safe-toast';
import { ordensServicoAPI } from '@/lib/api-client';
import { useAuth } from '@/lib/contexts/auth-context';
import { WorkflowAccordion, WorkflowStepDefinition } from '@/components/os/shared/components/workflow-accordion';
import { WorkflowStepSummary, OS_07_SUMMARY_CONFIG } from '@/components/os/shared/components/workflow-step-summary';
import { StepReadOnlyWithAdendos } from '@/components/os/shared/components/step-readonly-with-adendos';
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';

import { useEtapas } from '@/lib/hooks/use-etapas';
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';
import { logger } from '@/lib/utils/logger';

interface OS07WorkflowPageProps {
  onBack?: () => void;
  osId?: string;
}

/**
 * Definição das etapas da OS-07 com campos de responsabilidade v3.1
 */
const steps: WorkflowStepDefinition[] = [
  { id: 1, title: 'Identificação do Cliente', short: 'Cliente', setor: 'administrativo', setorNome: 'Administrativo', responsible: 'ADM' },
  { id: 2, title: 'Coletar Dados do Cliente', short: 'Formulário', setor: 'administrativo', setorNome: 'Administrativo', responsible: 'ADM' },
  { id: 3, title: 'Análise e Parecer', short: 'Análise', setor: 'assessoria', setorNome: 'Assessoria', responsible: 'Obras' },
  { id: 4, title: 'Gerar PDF', short: 'PDF', setor: 'administrativo', setorNome: 'Administrativo', responsible: 'ADM' },
  { id: 5, title: 'Concluída', short: 'Fim', setor: 'administrativo', setorNome: 'Administrativo', responsible: 'ADM' },
];

export function OS07WorkflowPage({ onBack, osId: propOsId }: OS07WorkflowPageProps) {
  // Estado interno para osId
  const [internalOsId, setInternalOsId] = useState<string | undefined>(propOsId);
  const finalOsId = propOsId || internalOsId;
  const [isCreatingOS, setIsCreatingOS] = useState(false);

  // Estado do formulário/link
  const [linkFormulario, setLinkFormulario] = useState('');

  // Estado para LeadCadastro
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const stepLeadRef = useRef<LeadCadastroHandle>(null);

  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id || 'user-unknown';

  const [clienteNome, setClienteNome] = useState('');

  // Atualizar internalOsId se prop mudar
  useEffect(() => {
    if (propOsId) setInternalOsId(propOsId);
  }, [propOsId]);

  // Hook de Estado do Workflow
  const {
    currentStep,
    setCurrentStep,
    formDataByStep,
    setStepData,
    saveStep,
    completedSteps: completedStepsFromHook,
    isLoading: isLoadingData,
    etapas
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
  const etapa2Data = formDataByStep[2] || { linkFormulario: '', formularioEnviado: false };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const etapa3Data = formDataByStep[3] || { formularioRecebido: false, dataRecebimento: '' };
  const etapa4Data = formDataByStep[4] as { pdfGerado?: boolean; pdfUrl?: string } || { pdfGerado: false, pdfUrl: '' };
  const etapa5Data = formDataByStep[5] as { concluida?: boolean; dataConclusao?: string } || { concluida: false, dataConclusao: '' };

  // Setters - only used in some handlers
  const setEtapa1Data = (data: unknown) => setStepData(1, data);
  const setEtapa2Data = (data: unknown) => setStepData(2, data);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setEtapa3Data = (data: unknown) => setStepData(3, data);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setEtapa4Data = (data: unknown) => setStepData(4, data);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setEtapa5Data = (data: unknown) => setStepData(5, data);

  // Regras de completude
  const completionRules = useMemo(() => ({
    1: (data: any) => !!(data?.identificacao?.nome || data?.nome),
    2: (data: any) => !!(data?.linkFormulario),
    3: (data: any) => !!(data?.formularioRecebido),
    4: (data: any) => !!(data?.pdfGerado && data?.pdfUrl),
    5: (data: any) => !!(data?.concluida),
  }), []);

  const { completedSteps } = useWorkflowCompletion({
    currentStep,
    formDataByStep,
    completionRules,
    completedStepsFromHook
  });

  // Handler para mudança no LeadCadastro
  const handleLeadChange = (id: string, data?: LeadCompleto) => {
    setSelectedLeadId(id);
    setEtapa1Data(data || null);
    if (data) {
      setClienteNome(data.identificacao.nome);
    }
  };

  // =====================================================
  // Handlers de Ações
  // =====================================================

  // Etapa 1: Identificação do Cliente e Criação da OS
  const handleIdentificarCliente = async () => {
    if (!stepLeadRef.current) return;

    try {
      setIsCreatingOS(true);

      // Salvar/Recuperar ID do Cliente
      const leadIdFinal = await stepLeadRef.current.save();

      if (!leadIdFinal) {
        setIsCreatingOS(false);
        return;
      }

      // Criar OS no Supabase se não existir
      if (!finalOsId) {
        try {
          const tiposOS = await ordensServicoAPI.getTiposOS();
          const tipoOS07 = tiposOS.find((t: { codigo: string }) => t.codigo === 'OS-07');

          if (!tipoOS07) {
            throw new Error('Tipo de OS OS-07 não encontrado no sistema');
          }

          const novaOS = await ordensServicoAPI.create({
            cliente_id: leadIdFinal,
            tipo_os_id: tipoOS07.id,
            descricao: `OS 07: Termo de Comunicação de Reforma - ${clienteNome || 'Cliente'}`,
            criado_por_id: currentUserId,
            status_geral: 'em_andamento',
          });

          // Gerar link do formulário
          const baseUrl = window.location.origin;
          const novoLink = `${baseUrl}/reforma/${novaOS.id}`;

          setInternalOsId(novaOS.id);
          setLinkFormulario(novoLink);

          // Criar as 5 etapas da OS-07
          const stepsData = steps.map(step => ({
            ordem: step.id,
            nome_etapa: step.title,
            status: step.id === 1 ? 'concluida' : 'pendente',
            dados_etapa: step.id === 1
              ? { ...etapa1Data, leadId: leadIdFinal }
              : step.id === 2
                ? { linkFormulario: novoLink }
                : {}
          }));

          await createEtapasBatch(novaOS.id, stepsData as any);
          logger.log('[OS07WorkflowPage] ✅ Etapas criadas com sucesso!');

          // Atualizar dados da etapa 2 com o link
          setEtapa2Data({ linkFormulario: novoLink, formularioEnviado: false });

          // Avançar para etapa 2
          setCurrentStep(2);

          toast.success(`OS ${novaOS.codigo_os} criada! Copie o link e envie ao cliente.`);
        } catch (error) {
          logger.error('Erro ao criar OS:', error);
          toast.error('Erro ao criar Ordem de Serviço. Tente novamente.');
          setIsCreatingOS(false);
          return;
        }
      } else {
        // Se já existe OS, apenas salvar e avançar
        await saveStep(1, true);
        setCurrentStep(2);
      }
    } catch (error) {
      logger.error('Erro ao processar cliente:', error);
      toast.error('Erro ao processar dados do cliente');
    } finally {
      setIsCreatingOS(false);
    }
  };

  // Copiar link do formulário
  const handleCopiarLink = async () => {
    const link = linkFormulario || etapa2Data?.linkFormulario;
    if (!link) return;

    try {
      await window.navigator.clipboard.writeText(link);
      toast.success('Link copiado para a área de transferência!');
    } catch {
      toast.error('Erro ao copiar link. Tente novamente.');
    }
  };

  // Abrir link em nova aba
  const handleAbrirFormulario = () => {
    const link = linkFormulario || etapa2Data?.linkFormulario;
    if (link) {
      window.open(link, '_blank');
    }
  };

  // Simular recebimento do formulário (para demo)
  const handleSimularRecebimento = async () => {
    toast.success('Formulário recebido! Avançando para análise...');

    setEtapa3Data({
      formularioRecebido: true,
      dataRecebimento: new Date().toISOString()
    });

    if (finalOsId) {
      await saveStep(3, true);
    }

    window.setTimeout(() => {
      setCurrentStep(3);
    }, 1000);
  };

  // =====================================================
  // Navegação
  // =====================================================

  const handleStepChange = (step: number) => {
    if (completedSteps.includes(step) || step === currentStep) {
      setCurrentStep(step);
    }
  };

  // Handler para geração de PDF do parecer
  const handleGerarPDF = async () => {
    if (!finalOsId) {
      toast.error('ID da OS não encontrado');
      return;
    }

    try {
      // Coletar dados para o PDF
      const dadosParecer = {
        codigoOS: finalOsId,
        cliente: {
          nome: clienteNome || etapa1Data?.identificacao?.nome || 'Cliente',
          cpfCnpj: etapa1Data?.identificacao?.cpfCnpj || '',
        },
        endereco: etapa1Data?.endereco || {},
        dadosReforma: etapa2Data,
        observacoes: '',
      };

      const result = await generatePDF('parecer-reforma', finalOsId, dadosParecer);

      if (result?.success) {
        setStepData(4, { pdfGerado: true, pdfUrl: result.url });
        await saveStep(4, false);
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
  const handleSaveAndAdvance = async (step: number): Promise<boolean> => {
    try {
      if (step === 1) {
        await handleIdentificarCliente();
        return true;
      }

      if (step === 3) {
        // Navegar para análise técnica
        if (finalOsId) {
          window.location.href = `/os/07/analise/${finalOsId}`;
          return true;
        }
        return false;
      }

      if (step === 4) {
        if (!etapa4Data?.pdfGerado) {
          await handleGerarPDF();
          return !!etapa4Data?.pdfGerado; // Retorna sucesso se gerou
        }
        // Se já gerou, apenas avança
        setCurrentStep(5);
        return true;
      }

      if (step === 5) {
        await handleConcluirOS();
        return true;
      }

      // Default: Salvar e Avançar
      if (finalOsId) {
        await saveStep(step, true);
        if (step < steps.length) {
          setCurrentStep(step + 1);
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.error(`Erro ao salvar etapa ${step}:`, error);
      return false;
    }
  };

  // Handler para concluir a OS
  const handleConcluirOS = async () => {
    if (!finalOsId) return;

    try {
      setStepData(5, { concluida: true, dataConclusao: new Date().toISOString() });
      await saveStep(5, false);
      toast.success('OS concluída com sucesso!');
    } catch (error) {
      logger.error('Erro ao concluir OS:', error);
      toast.error('Erro ao concluir OS');
    }
  };

  // =====================================================
  // Renderização
  // =====================================================



  const renderForm = (step: number) => {
    const isReadOnly = completedSteps.includes(step) && step !== currentStep;

    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <LeadCadastro
              ref={stepLeadRef}
              selectedLeadId={selectedLeadId}
              onLeadChange={handleLeadChange}
              showEdificacao={true}
              showEndereco={true}
              statusFilter={['lead', 'ativo']}
              readOnly={isReadOnly}
            />


            {/* Botão Salvar e Avançar removido - agora no accordion */}
          </div>
        );

      case 2:
        const link = linkFormulario || etapa2Data?.linkFormulario;
        return (
          <div className="space-y-6">
            {/* Informações da OS */}
            <div className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm font-medium mb-1">Ordem de Serviço Criada</p>
                  <p className="text-xs text-muted-foreground">
                    Código: <span className="font-mono font-semibold">{finalOsId}</span>
                  </p>
                </div>
                <Badge variant="outline" className="bg-info/5 text-info border-info/20">
                  <Clock className="w-3 h-3 mr-1" />
                  Aguardando Cliente
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Condomínio: <span className="font-medium">{clienteNome}</span>
                </p>
              </div>
            </div>

            {/* Link do Formulário */}
            <div className="space-y-3">
              <Label>Link do Formulário Público</Label>

              <div className="bg-white border-2 border-info/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <LinkIcon className="w-5 h-5 text-info" />
                  <p className="text-sm font-medium text-info">
                    Formulário de Comunicação de Reforma
                  </p>
                </div>

                <div className="bg-background border border-border rounded p-3 mb-4">
                  <p className="text-sm font-mono text-muted-foreground break-all">
                    {link || 'Link será gerado após criar a OS'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleCopiarLink}
                    className="bg-info hover:bg-info text-white"
                    disabled={!link}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Link
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleAbrirFormulario}
                    disabled={!link}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir Formulário
                  </Button>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-primary font-medium mb-2">
                  📋 Instruções:
                </p>
                <ol className="text-sm text-primary space-y-1 ml-4 list-decimal">
                  <li>Copie o link do formulário usando o botão acima</li>
                  <li>Envie o link ao cliente/solicitante por WhatsApp ou Email</li>
                  <li>Aguarde o preenchimento e envio do formulário</li>
                  <li>A OS avançará automaticamente após o envio</li>
                </ol>
              </div>
            </div>

            {/* Botão de simulação (demo) */}
            <div className="pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={handleSimularRecebimento}
                className="text-success border-green-600 hover:bg-success/5"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Simular Recebimento (Demo)
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-success/5 border border-success/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-success mb-1">
                    Formulário Recebido com Sucesso
                  </p>
                  <p className="text-sm text-success">
                    O cliente preencheu e enviou todos os dados necessários.
                    Prossiga para a análise técnica.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Geração do PDF do Parecer Técnico</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Clique no botão "Salvar e Avançar" para gerar o documento PDF do Termo de Comunicação de Reforma.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-success/5 border border-success/20 rounded-lg p-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-success mb-2">OS Concluída!</h3>
              <p className="text-sm text-muted-foreground">
                O Termo de Comunicação de Reforma foi processado com sucesso.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSummary = (step: number, data: any) => {
    const stepEtapa = etapas?.find(e => e.ordem === step);
    const isCompleted = completedSteps.includes(step);
    const canAddAdendo = isCompleted && !!stepEtapa?.id;

    // Se não estiver completa ou sem etapa definida, fallback para o antigo
    if (!isCompleted || !stepEtapa) {
      const configFn = OS_07_SUMMARY_CONFIG[step];
      if (!configFn) return null;
      const fields = configFn(data);
      return <WorkflowStepSummary fields={fields} />;
    }

    let content = null;

    switch (step) {
      case 1:
        content = (
          <LeadCadastro
            ref={stepLeadRef}
            selectedLeadId={selectedLeadId}
            onLeadChange={() => { }}
            showEdificacao={true}
            showEndereco={true}
            statusFilter={['lead', 'ativo']}
            readOnly={true}
          />
        );
        break;

      case 2: {
        const link = linkFormulario || etapa2Data?.linkFormulario;
        content = (
          <div className="space-y-4">
            <div className="bg-background border border-border rounded-lg p-3">
              <Label className="text-xs text-muted-foreground">Link do Formulário</Label>
              <div className="flex items-center gap-2 mt-1">
                <LinkIcon className="w-4 h-4 text-info" />
                <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-info hover:underline truncate block">
                  {link || 'Link não gerado'}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={etapa2Data?.formularioEnviado ? "bg-green-100 text-green-700 border-green-200" : "bg-muted text-muted-foreground border-border"}>
                {etapa2Data?.formularioEnviado ? 'Formulário Enviado' : 'Aguardando Envio'}
              </Badge>
            </div>
          </div>
        );
        break;
      }

      case 3:
        content = (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium">Formulário Recebido</p>
                  <p className="text-xs text-muted-foreground">
                    {data?.dataRecebimento ? new Date(data.dataRecebimento).toLocaleString() : ''}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={`/os/07/analise/${finalOsId}`} target="_blank">
                  Ver Análise <ExternalLink className="w-3 h-3 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        );
        break;

      case 4:
        content = (
          <div className="space-y-3">
            {data?.pdfUrl ? (
              <div className="bg-muted/30 border border-border rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-red-600">PDF</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Parecer Técnico</p>
                    <p className="text-xs text-muted-foreground">Termo de Comunicação</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href={data.pdfUrl} target="_blank" rel="noopener noreferrer">
                    Baixar <ExternalLink className="w-3 h-3 ml-2" />
                  </a>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">PDF não gerado.</p>
            )}
          </div>
        );
        break;

      case 5:
        content = (
          <div className="flex items-center gap-3 bg-success/5 p-3 rounded-lg border border-success/20">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <div>
              <p className="text-sm font-medium text-success">OS Concluída</p>
              {data?.dataConclusao && (
                <p className="text-xs text-muted-foreground">
                  em {new Date(data.dataConclusao).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        );
        break;
    }

    if (!content) return null;

    return (
      <StepReadOnlyWithAdendos
        etapaId={stepEtapa.id}
        readonly={!canAddAdendo}
      >
        {content}
      </StepReadOnlyWithAdendos>
    );
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
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-info" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">OS 07: Termo de Comunicação de Reforma</h1>
                <p className="text-muted-foreground">
                  Fluxo de análise e aprovação de reformas em unidades
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo com Accordion */}
      <div className="px-6 py-6">
        <Card className="max-w-4xl mx-auto">
          <div className="p-6">
            <WorkflowAccordion
              steps={steps}
              currentStep={currentStep}
              formDataByStep={formDataByStep}
              completedSteps={completedSteps}
              onStepChange={handleStepChange}
              renderForm={renderForm}
              renderSummary={renderSummary}
              onSaveAndAdvance={handleSaveAndAdvance}
              saveButtonText="Salvar e Avançar"
              finalButtonText="Concluir OS"
              isSaving={isLoadingData || isCreatingOS || isGeneratingPDF}
            />
          </div>
        </Card>
      </div>

      {/* Footer removido em favor do WorkflowAccordion */}
    </div>
  );
}
