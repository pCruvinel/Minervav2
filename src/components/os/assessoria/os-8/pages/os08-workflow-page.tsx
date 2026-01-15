import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from '@/lib/utils/safe-toast';
import { WorkflowAccordion, WorkflowStepDefinition } from '@/components/os/shared/components/workflow-accordion';
import { OSHeaderDelegacao } from '@/components/os/shared/components/os-header-delegacao';
import { WorkflowStepSummary, OS_08_SUMMARY_CONFIG } from '@/components/os/shared/components/workflow-step-summary';
import { FieldWithAdendos } from '@/components/os/shared/components/field-with-adendos';
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
import { ArrowLeft } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
import { useEtapaAdendos } from '@/lib/hooks/use-etapa-adendos';
import { useAuth } from '@/lib/contexts/auth-context';
import { useCreateOrdemServico } from '@/lib/hooks/use-ordens-servico';
import { ordensServicoAPI } from '@/lib/api-client';
import { logger } from '@/lib/utils/logger';

/**
 * Definição das etapas da OS-08 com campos de responsabilidade v3.1
 * Os campos setor/setorNome são usados para exibição do novo header
 * O campo responsible é mantido para compatibilidade (deprecated)
 */
const steps: WorkflowStepDefinition[] = [
  { id: 1, title: 'Identificação do Cliente', short: 'Cliente', setor: 'administrativo', setorNome: 'Administrativo', responsible: 'ADM' },
  { id: 2, title: 'Detalhes da Solicitação', short: 'Solicitação', setor: 'administrativo', setorNome: 'Administrativo', responsible: 'ADM' },
  { id: 3, title: 'Agendar Visita', short: 'Agendar', setor: 'administrativo', setorNome: 'Administrativo', responsible: 'ADM' },
  { id: 4, title: 'Realizar Visita', short: 'Visita', setor: 'assessoria', setorNome: 'Assessoria', responsible: 'Obras' },
  { id: 5, title: 'Formulário Pós-Visita', short: 'Formulário', setor: 'assessoria', setorNome: 'Assessoria', responsible: 'Obras' },
  { id: 6, title: 'Gerar Documento', short: 'Documento', setor: 'administrativo', setorNome: 'Administrativo', responsible: 'ADM' },
  { id: 7, title: 'Enviar ao Cliente', short: 'Enviar', setor: 'administrativo', setorNome: 'Administrativo', responsible: 'ADM' },
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
    createEtapasBatch, // ✅ Usar do hook para manter estado sincronizado
    refreshEtapas
  } = useWorkflowState({
    osId: finalOsId,
    totalSteps: steps.length,
    initialStep: initialStep // ✅ Passar etapa inicial da URL para o hook
  });

  // Obter etapa atual para adendos
  const currentEtapa = etapas?.find(e => e.ordem === currentStep);
  const { adendos, addAdendo, getAdendosByCampo } = useEtapaAdendos(currentEtapa?.id);

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
    if (completedSteps.includes(step) || step === currentStep) {
      setCurrentStep(step);
    }
  };

  const handleSaveStep = async () => {
    try {
      if (finalOsId) {
        await saveStep(currentStep, true);
        toast.success('Dados salvos com sucesso!');
      }
    } catch {
      toast.error('Erro ao salvar dados');
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = async () => {
    // Etapa 1: Salvar Lead e Criar OS se não existir
    if (currentStep === 1) {
      if (!leadCadastroRef.current) return;

      const savedId = await leadCadastroRef.current.save();
      if (!savedId) return;

      if (!finalOsId) {
        const newOsId = await createOSWithClient(savedId);
        if (!newOsId) return;

        try {
          const stepsData = steps.map(step => ({
            ordem: step.id,
            nome_etapa: step.title,
            status: step.id === 1 ? 'concluida' : 'pendente',
            dados_etapa: step.id === 1 ? { ...etapa1Data, leadId: savedId } : {}
          }));

          await createEtapasBatch(newOsId, stepsData as any);
          logger.log('[OS08WorkflowPage] ✅ Etapas criadas com sucesso!');
        } catch (error) {
          logger.error('[OS08WorkflowPage] ❌ Erro ao criar etapas:', error);
          toast.error('Erro ao inicializar etapas da OS');
          return;
        }
      } else {
        // ✅ FIX: isDraft=false marca como concluída
        await saveStep(1, false);
      }
    }

    // Etapa 2 em diante: Comportamento padrão
    if (currentStep > 1) {
      // ✅ FIX: isDraft=false marca como concluída  
      await saveStep(currentStep, false);
    }

    // ✅ FIX: Atualizar lista de etapas para refletir novo status
    await refreshEtapas();

    // Avançar para próxima etapa
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      toast.success('Etapa concluída!', { icon: '✅' });
    }
  };

  // =====================================================
  // Renderização de Formulários e Resumos
  // =====================================================

  const renderForm = (step: number) => {
    const isReadOnly = completedSteps.includes(step) && step !== currentStep;

    switch (step) {
      case 1:
        return (
          <LeadCadastro
            ref={leadCadastroRef}
            initialData={etapa1Data}
            selectedLeadId={etapa1Data?.identificacao?.id}
            onLeadChange={(_id: string, data: LeadCompleto) => setEtapa1Data(data)}
            statusFilter="cliente"
            readOnly={isReadOnly}
          />
        );
      case 2:
        return (
          <StepDetalhesSolicitacao
            data={etapa2Data}
            onDataChange={setEtapa2Data}
            readOnly={isReadOnly}
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
            readOnly={isReadOnly}
          />
        ) : null;
      case 4:
        return (
          <StepRealizarVisita
            data={etapa4Data}
            onDataChange={setEtapa4Data}
            readOnly={isReadOnly}
          />
        );
      case 5:
        return (
          <StepFormularioPosVisita
            data={etapa5Data}
            onDataChange={setEtapa5Data}
            readOnly={isReadOnly}
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
            readOnly={isReadOnly}
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
            readOnly={isReadOnly}
          />
        );
      default:
        return null;
    }
  };

  // Handler para adicionar adendo
  const handleAddAdendo = useCallback(async (campoKey: string, conteudo: string): Promise<boolean> => {
    const result = await addAdendo(campoKey, conteudo);
    return !!result;
  }, [addAdendo]);

  const renderSummary = (step: number, data: any) => {
    const configFn = OS_08_SUMMARY_CONFIG[step];
    if (!configFn) return null;

    const fields = configFn(data);
    const stepEtapa = etapas?.find(e => e.ordem === step);
    const isCompleted = completedSteps.includes(step);
    const canAddAdendo = isCompleted && !!stepEtapa?.id;

    // Para etapas concluídas, exibir campos com suporte a adendos
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

    // Para etapas não concluídas, exibir resumo simples
    return <WorkflowStepSummary fields={fields} />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Botão Voltar - navega para Detalhes da OS */}
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

            {/* Título no formato da página de detalhes */}
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                {codigoOS || 'Nova OS-08'}
              </h1>
              <p className="text-sm text-neutral-600">
                {tipoOSNome || 'Visita Técnica / Parecer Técnico'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🆕 Painel de Delegação no Header */}
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

      {/* Conteúdo com Accordion */}
      <div className="px-6 py-6">
        <Card className="max-w-5xl mx-auto">
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
      />
    </div>
  );
}
