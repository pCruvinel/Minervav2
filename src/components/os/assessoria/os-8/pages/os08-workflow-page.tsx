import { useMemo, useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/lib/utils/safe-toast';
import { WorkflowStepper } from '@/components/os/shared/components/workflow-stepper';
import { OSHeaderDelegacao } from '@/components/os/shared/components/os-header-delegacao';
import { StepReadOnlyWithAdendos } from '@/components/os/shared/components/step-readonly-with-adendos';
import { WorkflowFooter } from '@/components/os/shared/components/workflow-footer';
import {
  StepDetalhesSolicitacao,
  StepAgendarVisita,
  StepRealizarVisita,
  StepFormularioPosVisita,
  StepGerarDocumento,
  StepEnviarDocumento
} from '@/components/os/assessoria/os-8/steps';
import { LeadCadastro, LeadCadastroHandle, LeadCompleto } from '@/components/os/shared/lead-cadastro';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';

import { useAuth } from '@/lib/contexts/auth-context';
import { useCreateOrdemServico } from '@/lib/hooks/use-ordens-servico';
import { ordensServicoAPI } from '@/lib/api-client';
import { logger } from '@/lib/utils/logger';

/**
 * Definição das etapas da OS-08 com campos de responsabilidade v3.1
 * Os campos setor/setorNome são usados para exibição do novo header
 * O campo responsible é mantido para compatibilidade (deprecated)
 */
const steps = [
  { id: 1, title: 'Identificação do Cliente', short: 'Cliente', setor: 'administrativo' as const, setorNome: 'Administrativo', responsible: 'ADM' },
  { id: 2, title: 'Detalhes da Solicitação', short: 'Solicitação', setor: 'administrativo' as const, setorNome: 'Administrativo', responsible: 'ADM' },
  { id: 3, title: 'Agendar Visita', short: 'Agendar', setor: 'administrativo' as const, setorNome: 'Administrativo', responsible: 'ADM' },
  { id: 4, title: 'Realizar Visita', short: 'Visita', setor: 'assessoria' as const, setorNome: 'Assessoria', responsible: 'Obras' },
  { id: 5, title: 'Formulário Pós-Visita', short: 'Formulário', setor: 'assessoria' as const, setorNome: 'Assessoria', responsible: 'Obras' },
  { id: 6, title: 'Gerar Documento', short: 'Documento', setor: 'administrativo' as const, setorNome: 'Administrativo', responsible: 'ADM' },
  { id: 7, title: 'Enviar ao Cliente', short: 'Enviar', setor: 'administrativo' as const, setorNome: 'Administrativo', responsible: 'ADM' },
];

interface OS08WorkflowPageProps {
  onBack?: () => void;
  osId?: string;
  initialStep?: number;
  readonly?: boolean;
  codigoOS?: string;
  tipoOSNome?: string;
}

export function OS08WorkflowPage({
  onBack,
  osId: propOsId,
  initialStep,
  readonly,
  codigoOS,
  tipoOSNome
}: OS08WorkflowPageProps) {
  // Estado interno para osId (criado na Etapa 2 quando o cliente for atribuído)
  const [internalOsId, setInternalOsId] = useState<string | undefined>(propOsId);
  const finalOsId = propOsId || internalOsId;
  const [isCreatingOS, setIsCreatingOS] = useState(false);

  // Read-only mode
  const isReadOnly = readonly ?? false;

  // Refs para validação imperativa de steps
  const stepAgendarVisitaRef = useRef<any>(null);
  const leadCadastroRef = useRef<LeadCadastroHandle>(null);

  // Obter usuário atual para delegação
  const { currentUser } = useAuth();

  // Hook para criar OS
  const { mutate: createOS } = useCreateOrdemServico();

  // Atualizar internalOsId se prop mudar
  useEffect(() => {
    if (propOsId) setInternalOsId(propOsId);
  }, [propOsId]);

  // Função para criar OS quando o cliente for atribuído na Etapa 2
  const createOSWithClient = async (clienteId: string): Promise<string | null> => {
    if (finalOsId) return finalOsId; // Já existe uma OS

    try {
      setIsCreatingOS(true);
      logger.log('[OS08WorkflowPage] 🔧 Criando OS com cliente:', clienteId);

      // Buscar tipo de OS
      const tiposOS = await ordensServicoAPI.getTiposOS();
      const tipo = tiposOS.find((t: { codigo: string }) => t.codigo === 'OS-08');

      if (!tipo) {
        throw new Error('Tipo de OS OS-08 não encontrado no sistema');
      }

      // Criar OS com o cliente real
      const osData = {
        tipo_os_id: tipo.id,
        status_geral: 'em_triagem' as const,
        descricao: 'OS-08: Visita Técnica / Parecer Técnico',
        criado_por_id: currentUser?.id,
        cliente_id: clienteId,
        data_entrada: new Date().toISOString()
      };

      const newOS = await createOS(osData);
      logger.log(`[OS08WorkflowPage] ✅ OS criada: ${newOS.codigo_os} (ID: ${newOS.id})`);
      setInternalOsId(newOS.id);
      return newOS.id;
    } catch (err) {
      logger.error('[OS08WorkflowPage] ❌ Erro ao criar OS:', err);
      toast.error('Erro ao criar ordem de serviço');
      return null;
    } finally {
      setIsCreatingOS(false);
    }
  };

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
    createEtapasBatch,
    refreshEtapas
  } = useWorkflowState({
    osId: finalOsId,
    totalSteps: steps.length,
    initialStep: initialStep
  });

  // Mapeamento de dados para compatibilidade
  const etapa1Data = formDataByStep[1] || null;
  const etapa2Data = formDataByStep[2] || {
    finalidadeInspecao: '',
    tipoArea: '',
    unidadesVistoriar: '',
    contatoUnidades: '',
    tipoDocumento: '',
    areaVistoriada: '',
    detalhesSolicitacao: '',
    tempoSituacao: '',
    primeiraVisita: '',
    arquivos: [],
  };

  const etapa3Data = formDataByStep[3] || { dataAgendamento: '', agendamentoId: '' };
  const etapa4Data = formDataByStep[4] || { visitaRealizada: false, dataRealizacao: '' };
  const etapa5Data = formDataByStep[5] || {
    pontuacaoEngenheiro: '',
    pontuacaoMorador: '',
    tipoDocumento: '',
    areaVistoriada: '',
    manifestacaoPatologica: '',
    recomendacoesPrevias: '',
    gravidade: '',
    origemNBR: '',
    observacoesGerais: '',
    fotosLocal: [],
    resultadoVisita: '',
    justificativa: '',
  };
  const etapa6Data = formDataByStep[6] || { documentoGerado: false, documentoUrl: '' };
  const etapa7Data = formDataByStep[7] || { documentoEnviado: false, dataEnvio: '' };

  // Setters wrappers
  const setEtapa1Data = (data: any) => setStepData(1, data);
  const setEtapa2Data = (data: any) => setStepData(2, data);
  const setEtapa3Data = (data: any) => setStepData(3, data);
  const setEtapa4Data = (data: any) => setStepData(4, data);
  const setEtapa5Data = (data: any) => setStepData(5, data);
  const setEtapa6Data = (data: any) => setStepData(6, data);
  const setEtapa7Data = (data: any) => setStepData(7, data);

  // Regras de completude
  const completionRules = useMemo(() => ({
    1: (data: any) => !!(data?.identificacao?.nome && data?.identificacao?.cpfCnpj),
    2: (data: any) => !!(data.finalidadeInspecao && data.detalhesSolicitacao && data.areaVistoriada),
    3: (data: any) => !!(data.agendamentoId || data.dataAgendamento),
    4: (data: any) => !!(data.visitaRealizada && data.dataRealizacao),
    5: (data: any) => !!(data.resultadoVisita && data.tipoDocumento),
    6: (data: any) => !!(data.documentoGerado && data.documentoUrl),
    7: (data: any) => !!(data.documentoEnviado && data.dataEnvio),
  }), []);

  const { completedSteps } = useWorkflowCompletion({
    currentStep,
    formDataByStep,
    completionRules,
    completedStepsFromHook
  });

  // =====================================================
  // Handlers de Navegação
  // =====================================================

  const handleStepChange = (step: number) => {
    // Permitir navegação apenas para etapas concluídas ou etapa atual
    if (completedSteps.includes(step) || step === currentStep || step < currentStep) {
      setCurrentStep(step);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveAndAdvance = async (): Promise<boolean> => {
    const step = currentStep;

    // Etapa 1: Salvar Lead e Criar OS se não existir
    if (step === 1) {
      if (!leadCadastroRef.current) return false;

      const savedId = await leadCadastroRef.current.save();
      if (!savedId) return false;

      if (!finalOsId) {
        const newOsId = await createOSWithClient(savedId);
        if (!newOsId) return false;

        try {
          const stepsData = steps.map(s => ({
            ordem: s.id,
            nome_etapa: s.title,
            status: s.id === 1 ? 'concluida' : 'pendente',
            dados_etapa: s.id === 1 ? { ...etapa1Data, leadId: savedId } : {}
          }));

          await createEtapasBatch(newOsId, stepsData as any);
          logger.log('[OS08WorkflowPage] ✅ Etapas criadas com sucesso!');
          setCurrentStep(2);
          return true;
        } catch (error) {
          logger.error('[OS08WorkflowPage] ❌ Erro ao criar etapas:', error);
          toast.error('Erro ao inicializar etapas da OS');
          return false;
        }
      } else {
        await saveStep(1, false);
        setCurrentStep(2);
        return true;
      }
    }

    // Etapa 2 em diante: Comportamento padrão
    if (step > 1) {
      try {
        await saveStep(step, false);
        await refreshEtapas();

        // Avançar para próxima etapa
        if (step < steps.length) {
          setCurrentStep(step + 1);
        }
        toast.success('Etapa concluída!', { icon: '✅' });
        return true;
      } catch (error) {
        logger.error('Erro ao salvar etapa:', error);
        return false;
      }
    }

    return false;
  };

  // =====================================================
  // Renderização de Formulários
  // =====================================================

  // Determina se a etapa atual é uma visualização histórica (etapa concluída)
  const isHistoricalView = completedSteps.includes(currentStep) && currentStep < Math.max(...completedSteps, currentStep);
  const currentStepInfo = steps.find(s => s.id === currentStep);
  const stepEtapa = etapas?.find(e => e.ordem === currentStep);

  const renderCurrentStepForm = () => {
    // Se estamos visualizando uma etapa concluída, renderizar com suporte a adendos
    const viewingCompletedStep = completedSteps.includes(currentStep);

    const formContent = (() => {
      switch (currentStep) {
        case 1:
          return (
            <LeadCadastro
              ref={leadCadastroRef}
              initialData={etapa1Data}
              selectedLeadId={etapa1Data?.identificacao?.id}
              onLeadChange={(_id: string, data: LeadCompleto) => setEtapa1Data(data)}
              statusFilter="cliente"
              readOnly={viewingCompletedStep && isHistoricalView}
            />
          );
        case 2:
          return (
            <StepDetalhesSolicitacao
              data={etapa2Data}
              onDataChange={setEtapa2Data}
              readOnly={viewingCompletedStep && isHistoricalView}
              osId={finalOsId}
            />
          );
        case 3:
          return finalOsId ? (
            <StepAgendarVisita
              ref={stepAgendarVisitaRef}
              osId={finalOsId}
              data={etapa3Data}
              onDataChange={setEtapa3Data}
              readOnly={viewingCompletedStep && isHistoricalView}
            />
          ) : null;
        case 4:
          return (
            <StepRealizarVisita
              data={etapa4Data}
              onDataChange={setEtapa4Data}
              readOnly={viewingCompletedStep && isHistoricalView}
              agendamentoData={etapa3Data}
              clienteInfo={{
                nome: etapa1Data?.identificacao?.nome,
                edificacao: etapa1Data?.edificacao?.nome,
              }}
            />
          );
        case 5:
          return (
            <StepFormularioPosVisita
              data={etapa5Data}
              onDataChange={setEtapa5Data}
              readOnly={viewingCompletedStep && isHistoricalView}
              finalidadeInspecao={etapa2Data.finalidadeInspecao}
              osId={finalOsId}
            />
          );
        case 6:
          return (
            <StepGerarDocumento
              osId={finalOsId || ''}
              codigoOS={codigoOS}
              data={etapa6Data}
              onDataChange={setEtapa6Data}
              readOnly={viewingCompletedStep && isHistoricalView}
              etapa1Data={etapa1Data}
              etapa2Data={etapa2Data}
              etapa4Data={etapa4Data}
              etapa5Data={etapa5Data}
            />
          );
        case 7:
          return (
            <StepEnviarDocumento
              data={etapa7Data}
              onDataChange={setEtapa7Data}
              readOnly={viewingCompletedStep && isHistoricalView}
            />
          );
        default:
          return null;
      }
    })();

    // Sempre usar StepReadOnlyWithAdendos quando temos etapaId (permite adendos)
    if (stepEtapa?.id) {
      return (
        <StepReadOnlyWithAdendos
          etapaId={stepEtapa.id}
          readonly={isReadOnly}
        >
          {formContent}
        </StepReadOnlyWithAdendos>
      );
    }

    return formContent;
  };

  // Determinar texto do botão de ação
  const getActionButtonText = () => {
    if (currentStep === steps.length) return 'Concluir OS';
    if (isHistoricalView) return 'Voltar ao Progresso';
    return 'Salvar e Avançar';
  };

  const handleActionButtonClick = async () => {
    if (isHistoricalView) {
      // Voltar para a última etapa não concluída ou a próxima
      const nextStep = Math.max(...completedSteps) + 1;
      setCurrentStep(nextStep <= steps.length ? nextStep : steps.length);
    } else {
      await handleSaveAndAdvance();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-neutral-900">
                {codigoOS || 'OS-08: Visita Técnica e Parecer Diagnóstico'}
              </h1>
              <p className="text-sm text-neutral-600">
                {tipoOSNome || 'Gestão de Vistorias, Agendamentos e Relatórios Técnicos de Assessoria'}
              </p>
            </div>

            {/* Indicador de Progresso */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Progresso:</span>
              <Badge variant="outline" className="text-primary">
                {completedSteps.length} / {steps.length} etapas
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Painel de Delegação */}
      {finalOsId && !isReadOnly && (
        <div className="px-6 pt-4">
          <div className="max-w-5xl mx-auto">
            <OSHeaderDelegacao
              osId={finalOsId}
              tipoOS="OS-08"
              steps={steps}
            />
          </div>
        </div>
      )}

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

      {/* Conteúdo da Etapa Ativa */}
      <main className="flex-1 px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Etapa {currentStep}: {currentStepInfo?.title}
                    {completedSteps.includes(currentStep) && (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    Setor: {currentStepInfo?.setorNome}
                  </CardDescription>
                </div>
                {isHistoricalView && (
                  <Badge variant="secondary">Visualizando histórico</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {renderCurrentStepForm()}
            </CardContent>

            {/* Footer de Navegação - Dentro do Card */}
            {!isReadOnly && (
              <div className="border-t bg-muted/30 px-6 py-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Etapa Anterior
                  </Button>

                  <Button
                    onClick={handleActionButtonClick}
                    disabled={isLoadingData || isCreatingOS}
                  >
                    {isLoadingData || isCreatingOS ? 'Salvando...' : getActionButtonText()}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
