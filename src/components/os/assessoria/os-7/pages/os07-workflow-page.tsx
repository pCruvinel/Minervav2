// OS 07: Termo de Comunicação de Reforma - Sistema Minerva ERP
'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
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
import { FieldWithAdendos } from '@/components/os/shared/components/field-with-adendos';
import { WorkflowFooter } from '@/components/os/shared/components/workflow-footer';
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
import { useEtapaAdendos } from '@/lib/hooks/use-etapa-adendos';
import { useEtapas } from '@/lib/hooks/use-etapas';
import { logger } from '@/lib/utils/logger';

interface OS07WorkflowPageProps {
  onBack?: () => void;
  osId?: string;
}

const steps: WorkflowStepDefinition[] = [
  { id: 1, title: 'Identificação do Cliente', short: 'Cliente', responsible: 'ADM' },
  { id: 2, title: 'Coletar Dados do Cliente', short: 'Formulário', responsible: 'ADM' },
  { id: 3, title: 'Análise e Parecer', short: 'Análise', responsible: 'Obras' },
  { id: 4, title: 'Gerar PDF', short: 'PDF', responsible: 'ADM' },
  { id: 5, title: 'Concluída', short: 'Fim', responsible: 'ADM' },
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

  // Obter etapa atual para adendos
  const currentEtapa = etapas?.find(e => e.ordem === currentStep);
  const { adendos, addAdendo, getAdendosByCampo } = useEtapaAdendos(currentEtapa?.id);

  // Hook para gerenciar etapas
  const { createEtapasBatch } = useEtapas();

  // Mapeamento de dados
  const etapa1Data = formDataByStep[1] || null;
  const etapa2Data = formDataByStep[2] || { linkFormulario: '', formularioEnviado: false };
  const etapa3Data = formDataByStep[3] || { formularioRecebido: false, dataRecebimento: '' };
  const etapa4Data = formDataByStep[4] || { pdfGerado: false, pdfUrl: '' };
  const etapa5Data = formDataByStep[5] || { concluida: false, dataConclusao: '' };

  // Setters
  const setEtapa1Data = (data: any) => setStepData(1, data);
  const setEtapa2Data = (data: any) => setStepData(2, data);
  const setEtapa3Data = (data: any) => setStepData(3, data);
  const setEtapa4Data = (data: any) => setStepData(4, data);
  const setEtapa5Data = (data: any) => setStepData(5, data);

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
  const handleLeadChange = (id: string, data: LeadCompleto | null) => {
    setSelectedLeadId(id);
    setEtapa1Data(data);
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

    setTimeout(() => {
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

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      await handleIdentificarCliente();
      return;
    }

    if (finalOsId) {
      await saveStep(currentStep, true);
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      toast.success('Etapa concluída!', { icon: '✅' });
    }
  };

  const handleSaveStep = async () => {
    if (finalOsId) {
      await saveStep(currentStep, true);
      toast.success('Dados salvos com sucesso!');
    }
  };

  // =====================================================
  // Renderização
  // =====================================================

  const handleAddAdendo = useCallback(async (campoKey: string, conteudo: string): Promise<boolean> => {
    const result = await addAdendo(campoKey, conteudo);
    return !!result;
  }, [addAdendo]);

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

            <PrimaryButton onClick={() => window.location.href = `/os/07/analise/${finalOsId}`}>
              Ir para Análise Técnica
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </PrimaryButton>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">Geração do PDF do parecer técnico.</p>
            {/* Conteúdo da etapa 4 */}
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
    const configFn = OS_07_SUMMARY_CONFIG[step];
    if (!configFn) return null;

    const fields = configFn(data);
    const stepEtapa = etapas?.find(e => e.ordem === step);
    const isCompleted = completedSteps.includes(step);
    const canAddAdendo = isCompleted && !!stepEtapa?.id;

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

    return <WorkflowStepSummary fields={fields} />;
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
            />
          </div>
        </Card>
      </div>

      {/* Footer com botões de navegação */}
      <WorkflowFooter
        currentStep={currentStep}
        totalSteps={steps.length}
        onPrevStep={handlePrevStep}
        onNextStep={handleNextStep}
        onSaveDraft={handleSaveStep}
        isLoading={isLoadingData || isCreatingOS}
        loadingText={currentStep === 1 ? 'Criando OS...' : 'Processando...'}
      />
    </div>
  );
}
