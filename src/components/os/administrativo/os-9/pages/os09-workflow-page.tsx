import { useMemo, useEffect, useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { toast } from '@/lib/utils/safe-toast';
import { WorkflowStepper, WorkflowStep } from '@/components/os/shared/components/workflow-stepper';
import { WorkflowFooter } from '@/components/os/shared/components/workflow-footer';
import {
  StepRequisicaoCompra,
  StepConfirmacaoRequisicao,
  StepUploadOrcamentos
} from '@/components/os/administrativo/os-9/steps';
import { useRequisitionItems } from '@/lib/hooks/use-requisition-items';
import { ChevronLeft } from 'lucide-react';
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '@/lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
import { useAuth } from '@/lib/contexts/auth-context';
import { logger } from '@/lib/utils/logger';
import { supabase } from '@/lib/supabase-client';

// Sistema de Aprovação
import { AprovacaoModal } from '@/components/os/shared/components/aprovacao-modal';
import { useAprovacaoEtapa } from '@/lib/hooks/use-aprovacao-etapa';

// Definição das etapas da OS-09 (3 etapas)
const OS09_ETAPAS = [
  { ordem: 1, nome_etapa: 'Requisição de Compra' },
  { ordem: 2, nome_etapa: 'Confirmação da Requisição' },
  { ordem: 3, nome_etapa: 'Upload de Orçamentos' },
];

const steps: WorkflowStep[] = [
  { id: 1, title: 'Requisição de Compra', short: 'Requisição', responsible: 'Solicitante', status: 'active' },
  { id: 2, title: 'Confirmação', short: 'Confirmar', responsible: 'Solicitante', status: 'pending' },
  { id: 3, title: 'Upload de Orçamentos', short: 'Orçamentos', responsible: 'Compras', status: 'pending' },
];

interface OS09WorkflowPageProps {
  onBack?: () => void;
  osId?: string;
}

export function OS09WorkflowPage({ onBack, osId }: OS09WorkflowPageProps) {
  // osId vem das props (quando chamado de details-workflow ou outros contextos)
  const [internalOsId, setInternalOsId] = useState<string | undefined>(osId);
  const finalOsId = osId || internalOsId;
  const navigate = useNavigate();
  const [isCreatingOS, setIsCreatingOS] = useState(false);

  // Estado para modal de aprovação
  const [isAprovacaoModalOpen, setIsAprovacaoModalOpen] = useState(false);
  const [etapaNomeParaAprovacao, setEtapaNomeParaAprovacao] = useState('');

  // Ref para chamar função de salvar itens do StepRequisicaoCompra antes de avançar
  const saveItemsRef = useRef<(() => Promise<void>) | undefined>();

  // Estado para controlar confirmação da etapa 2
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Obter usuário atual para delegação
  const { currentUser } = useAuth();

  // Atualizar internalOsId se props mudarem
  useEffect(() => {
    if (osId) setInternalOsId(osId);
  }, [osId]);

  /**
   * ✅ FIX: Criar OS-09 com etapas usando Supabase diretamente
   * Similar ao padrão de createOSComEtapas em use-os-workflows.ts
   */
  const createOSWithCC = async (centroCustoId: string): Promise<string | null> => {
    if (finalOsId) return finalOsId; // Já existe uma OS

    try {
      setIsCreatingOS(true);
      logger.log('[OS09WorkflowPage] 🔧 Criando OS-09 com CC:', centroCustoId);

      // 1. Buscar dados do Centro de Custo
      const { data: ccData, error: ccError } = await supabase
        .from('centros_custo')
        .select('cliente_id, tipo')
        .eq('id', centroCustoId)
        .single();

      if (ccError || !ccData) {
        throw new Error('Centro de custo não encontrado');
      }

      // CCs fixos (Escritório, Dept. Assessoria, Dept. Obras) não têm cliente_id
      const clienteId = ccData.cliente_id || null;

      // 2. Buscar tipo de OS-09
      const { data: tipoOS, error: tipoOSError } = await supabase
        .from('tipos_os')
        .select('*')
        .eq('codigo', 'OS-09')
        .single();

      if (tipoOSError || !tipoOS) {
        throw new Error('Tipo de OS OS-09 não encontrado no sistema');
      }

      // 3. Criar OS
      const { data: osData, error: osError } = await supabase
        .from('ordens_servico')
        .insert({
          tipo_os_id: tipoOS.id,
          status_geral: 'em_triagem',
          descricao: 'OS-09: Requisição de Compras',
          criado_por_id: currentUser?.id,
          cliente_id: clienteId,
          cc_id: centroCustoId,
          data_entrada: new Date().toISOString()
        })
        .select()
        .single();

      if (osError) throw osError;

      logger.log(`[OS09WorkflowPage] ✅ OS criada: ${osData.codigo_os} (ID: ${osData.id})`);

      // 4. ✅ CRÍTICO: Criar etapas da OS-09
      const etapasParaInserir = OS09_ETAPAS.map((etapa, index) => ({
        os_id: osData.id,
        nome_etapa: etapa.nome_etapa,
        ordem: etapa.ordem,
        status: index === 0 ? 'em_andamento' : 'pendente',
        dados_etapa: {}
      }));

      const { error: etapasError } = await supabase
        .from('os_etapas')
        .insert(etapasParaInserir);

      if (etapasError) {
        logger.error('[OS09WorkflowPage] ❌ Erro ao criar etapas:', etapasError);
        throw etapasError;
      }

      logger.log(`[OS09WorkflowPage] ✅ ${etapasParaInserir.length} etapas criadas`);

      // 5. ✅ CRÍTICO: Buscar o ID da etapa 1 recém-criada para salvar itens
      const { data: etapa1Criada } = await supabase
        .from('os_etapas')
        .select('id')
        .eq('os_id', osData.id)
        .eq('ordem', 1)
        .single();

      // 6. ✅ Salvar itens locais ANTES de navegar (evita perda ao remontar)
      if (etapa1Criada?.id && etapa1Data.itens && Array.isArray(etapa1Data.itens) && etapa1Data.itens.length > 0) {
        logger.log(`[OS09WorkflowPage] 💾 Salvando ${etapa1Data.itens.length} itens antes de navegar...`);

        for (const item of etapa1Data.itens) {
          // Validar campos obrigatórios
          if (!item.tipo || !item.descricao || !item.quantidade || !item.unidade_medida) {
            logger.warn('[OS09WorkflowPage] ⚠️ Item ignorado (campos faltando):', item);
            continue;
          }

          // Converter valores numéricos explicitamente para evitar overflow
          const quantidade = Number(item.quantidade) || 0;
          const precoUnitario = Number(item.preco_unitario) || 0;

          // Validar limites (numeric(10,2) e numeric(12,2))
          if (quantidade > 99999999.99 || precoUnitario > 9999999999.99) {
            logger.warn('[OS09WorkflowPage] ⚠️ Item ignorado (valores excedem limites):', { quantidade, precoUnitario });
            continue;
          }

          const { error: itemError } = await supabase
            .from('os_requisition_items')
            .insert({
              os_etapa_id: etapa1Criada.id,
              tipo: item.tipo,
              sub_tipo: item.sub_tipo || null,
              descricao: String(item.descricao),
              quantidade: quantidade,
              unidade_medida: item.unidade_medida,
              preco_unitario: precoUnitario,
              link_produto: item.link_produto || null,
              observacao: item.observacao || null
            });

          if (itemError) {
            logger.error('[OS09WorkflowPage] ❌ Erro ao salvar item:', itemError);
          } else {
            logger.log('[OS09WorkflowPage] ✅ Item salvo com sucesso');
          }
        }

        // ✅ Atualizar status após salvar itens: em_andamento + acao_pendente
        await supabase
          .from('ordens_servico')
          .update({
            status_geral: 'em_andamento',
          })
          .eq('id', osData.id);

        logger.log('[OS09WorkflowPage] ✅ Status atualizado para em_andamento + acao_pendente');
      }

      // 7. ✅ Salvar dados de endereço/prazo no dados_etapa para recuperação posterior
      if (etapa1Criada?.id) {
        const dadosEtapa = {
          centro_custo_id: etapa1Data.centro_custo_id,
          centro_custo_nome: etapa1Data.centro_custo_nome,
          prazo_necessidade: etapa1Data.prazo_necessidade,
          cep: etapa1Data.cep,
          logradouro: etapa1Data.logradouro,
          numero: etapa1Data.numero,
          complemento: etapa1Data.complemento,
          bairro: etapa1Data.bairro,
          cidade: etapa1Data.cidade,
          uf: etapa1Data.uf
        };

        const { error: dadosError } = await supabase
          .from('os_etapas')
          .update({ dados_etapa: dadosEtapa })
          .eq('id', etapa1Criada.id);

        if (dadosError) {
          logger.error('[OS09WorkflowPage] ❌ Erro ao salvar dados da etapa:', dadosError);
        } else {
          logger.log('[OS09WorkflowPage] ✅ Dados de endereço salvos na etapa 1');
        }
      }

      setInternalOsId(osData.id);

      // Navegar para URL com osId
      navigate({
        to: '/os/criar/requisicao-compras',
        search: { osId: osData.id },
        replace: true
      });

      return osData.id;
    } catch (err) {
      logger.error('[OS09WorkflowPage] ❌ Erro ao criar OS:', err);
      toast.error('Erro ao criar ordem de serviço');
      return null;
    } finally {
      setIsCreatingOS(false);
    }
  };

  // 5. Hook de Estado do Workflow (aguarda osId)
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
    isLoading: isLoadingData,
    etapas
  } = useWorkflowState({
    osId: finalOsId,
    totalSteps: steps.length
  });

  // Callback de conclusão do workflow
  const handleCompleteWorkflow = async (): Promise<boolean> => {
    if (!finalOsId) {
      toast.error('Erro: OS não identificada');
      return false;
    }

    try {
      // 1. Save current step
      const saved = await saveStep(currentStep, false);
      if (!saved) return false;

      // 2. Update OS status (IMPORTANTE: DB usa 'concluido' sem acento!)
      const { error } = await supabase
        .from('ordens_servico')
        .update({
          status_geral: 'concluido', // SEM acento!
          data_conclusao: new Date().toISOString()
        })
        .eq('id', finalOsId);

      if (error) throw error;

      logger.log('[OS09] ✅ Requisição concluída:', finalOsId);

      toast.success('Requisição de Compras concluída!', {
        icon: '🎉',
        description: 'Agora disponível para aprovação do Financeiro.'
      });

      // 3. Navigate to OS list after 2s
      window.setTimeout(() => navigate({ to: '/os' }), 2000);
      return true;

    } catch (error) {
      logger.error('[OS09] ❌ Erro ao concluir:', error);
      toast.error('Erro ao concluir requisição');
      return false;
    }
  };

  // Hook de Navegação
  const {
    handleStepClick,
    handleReturnToActive,
    handleNextStep,
    handlePrevStep
  } = useWorkflowNavigation({
    totalSteps: steps.length,
    currentStep,
    setCurrentStep,
    lastActiveStep,
    setLastActiveStep,
    isHistoricalNavigation,
    setIsHistoricalNavigation,
    onSaveStep: (step) => saveStep(step, false),
    onCompleteWorkflow: handleCompleteWorkflow
  });

  // Hook de aprovação de etapa (depois que currentStep é definido)
  const { aprovacaoInfo } = useAprovacaoEtapa(finalOsId, currentStep);

  // Mapeamento de dados para compatibilidade
  const etapa1Data = formDataByStep[1] || {
    totalItems: 0,
    valorTotal: 0,
    hasItems: false,
    centro_custo_id: undefined
  };

  const etapa3Data = formDataByStep[3] || {
    arquivos: [],
  };

  // Setters wrappers
  const setEtapa1Data = (data: Record<string, unknown>) => setStepData(1, data);
  const setEtapa3Data = (data: Record<string, unknown>) => setStepData(3, data);

  // 5. Buscar o ID da etapa 1 das etapas carregadas
  const etapa1Id = etapas?.find(e => e.ordem === 1)?.id;

  // 6. Buscar itens da requisição para etapa de confirmação
  const { items: requisitionItems, refetch: refetchItems } = useRequisitionItems(etapa1Id);

  // 7. Estado para armazenar dados da OS (código, data)
  const [osData, setOsData] = useState<{ codigo_os?: string; data_entrada?: string }>({});

  // 8. Buscar dados da OS quando osId estiver disponível
  useEffect(() => {
    if (!finalOsId) return;

    const fetchOsData = async () => {
      const { data } = await supabase
        .from('ordens_servico')
        .select('codigo_os, data_entrada')
        .eq('id', finalOsId)
        .single();

      if (data) {
        setOsData(data);
      }
    };

    fetchOsData();
  }, [finalOsId]);

  logger.log(`[OS09WorkflowPage] 📊 finalOsId=${finalOsId}, etapa1Id=${etapa1Id}, isCreating=${isCreatingOS}`);

  /**
   * Cálculo dinâmico de etapas completadas
   */
  // Regras de completude
  const completionRules = useMemo(() => ({
    1: () => (requisitionItems?.length ?? 0) > 0, // Só avança se tiver itens SALVOS no banco
    2: () => isConfirmed, // Só completa quando clicar em confirmar
    3: (data: Record<string, unknown>) => !!((data.arquivos as unknown[])?.length >= 3),
  }), [isConfirmed]);

  const { completedSteps } = useWorkflowCompletion({
    currentStep,
    formDataByStep,
    completionRules,
    completedStepsFromHook
  });

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

  // Handler customizado para o avanço da etapa 1 (criar OS com CC)
  const handleCustomNextStep = async () => {
    // Na Etapa 1, precisamos criar a OS antes de avançar
    if (currentStep === 1 && !finalOsId) {
      const ccId = etapa1Data.centro_custo_id;
      if (!ccId) {
        toast.error('Selecione um Centro de Custo antes de continuar');
        return;
      }

      const newOsId = await createOSWithCC(ccId);
      if (!newOsId) {
        return; // Erro na criação
      }

      // ✅ As etapas já foram criadas no banco dentro de createOSWithCC
      // O useEffect vai detectar a mudança de internalOsId e chamar fetchEtapas
      // A navegação com replace: true já foi feita, então o componente vai remontar
      // com as etapas carregadas. Não precisamos salvar aqui.

      toast.success('Requisição criada! Agora você pode adicionar itens.');
      return; // O navigate já foi feito em createOSWithCC
    }

    // Verificação de Aprovação (Etapa 2: Upload de Orçamentos requer aprovação)
    if (aprovacaoInfo?.requerAprovacao && aprovacaoInfo.statusAprovacao !== 'aprovada') {
      const etapaNome = steps.find(s => s.id === currentStep)?.title || `Etapa ${currentStep}`;

      if (aprovacaoInfo.statusAprovacao === 'pendente' || aprovacaoInfo.statusAprovacao === 'rejeitada') {
        setEtapaNomeParaAprovacao(etapaNome);
        setIsAprovacaoModalOpen(true);
        return;
      }

      if (aprovacaoInfo.statusAprovacao === 'solicitada') {
        toast.info('Aguardando aprovação do Financeiro.');
        return;
      }
    }

    // Etapa 1 -> 2: Salvar itens locais antes de avançar para confirmação
    if (currentStep === 1 && finalOsId) {
      // Salvar itens locais antes de mostrar confirmação
      if (saveItemsRef.current) {
        await saveItemsRef.current();
        // Atualizar itens no pai para exibir na confirmação
        await refetchItems();
      }
    }

    // Chamar o handler normal de navegação
    handleNextStep();
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
                <ChevronLeft className="w-5 h-5" />
                <span>Voltar</span>
              </button>
            )}
            <div>
              <h1 className="text-2xl">OS-09: Requisição de Compras</h1>
              {finalOsId && <p className="text-muted-foreground">OS #{finalOsId}</p>}
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="relative">
          <WorkflowStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
            completedSteps={completedSteps}
            lastActiveStep={lastActiveStep || undefined}
          />

        </div>
      </div>


      {/* Conteúdo das Etapas */}
      <div className="px-6 py-6">
        <Card className="max-w-5xl mx-auto">
          <div className="p-6">
            {/* ETAPA 1: Requisição de Compra */}
            {currentStep === 1 && (
              <StepRequisicaoCompra
                data={etapa1Data}
                onDataChange={setEtapa1Data}
                etapaId={etapa1Id}
                readOnly={isHistoricalNavigation}
                saveItemsRef={saveItemsRef}
                onCreateOS={() => createOSWithCC(etapa1Data.centro_custo_id as string)}
              />
            )}

            {/* ETAPA 2: Confirmação da Requisição */}
            {currentStep === 2 && (
              <StepConfirmacaoRequisicao
                data={{
                  solicitante: currentUser ? {
                    nome: currentUser.nome_completo || 'Usuário',
                    setor: currentUser.setor_slug,
                    cargo: currentUser.cargo_slug
                  } : undefined,
                  centro_custo_id: etapa1Data.centro_custo_id as string,
                  centro_custo_nome: etapa1Data.centro_custo_nome as string || 'Centro de Custo',
                  prazo_necessidade: etapa1Data.prazo_necessidade as string,
                  cep: etapa1Data.cep as string,
                  logradouro: etapa1Data.logradouro as string,
                  numero: etapa1Data.numero as string,
                  complemento: etapa1Data.complemento as string,
                  bairro: etapa1Data.bairro as string,
                  cidade: etapa1Data.cidade as string,
                  uf: etapa1Data.uf as string,
                  itens: requisitionItems,
                  codigo_os: osData?.codigo_os,
                  data_criacao: osData?.data_entrada
                }}
                etapaId={etapa1Id}
                onVoltar={() => {
                  setCurrentStep(1);
                }}
                onConfirmar={async () => {
                  setIsConfirmed(true);
                  // Salvar etapa 2 como concluída
                  await saveStep(2, false);

                  // ✅ Atualizar status_situacao para 'aguardando_aprovacao' na Etapa 3
                  // REMOVIDO: status_situacao é calculado automaticamente via view
                  /* if (finalOsId) {
                    await supabase
                      .from('ordens_servico')
                      .update({ status_situacao: 'aguardando_aprovacao' })
                      .eq('id', finalOsId);
                  } */

                  // Avançar para etapa 3
                  setCurrentStep(3);
                  setLastActiveStep(3);
                }}
                isLoading={isLoadingData}
              />
            )}

            {/* ETAPA 3: Upload de Orçamentos */}
            {currentStep === 3 && (
              <StepUploadOrcamentos
                data={etapa3Data}
                onDataChange={setEtapa3Data}
                readOnly={isHistoricalNavigation}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Footer com botões de navegação - Oculto na etapa 2 (tem botões próprios) */}
      {currentStep !== 2 && (
        <WorkflowFooter
          currentStep={currentStep}
          totalSteps={steps.length}
          onPrevStep={handlePrevStep}
          onNextStep={handleCustomNextStep}
          onSaveDraft={handleSaveStep}
          readOnlyMode={isHistoricalNavigation}
          onReturnToActive={handleReturnToActive}
          isLoading={isLoadingData || isCreatingOS}
        />
      )}

      {/* Modal de Aprovação de Etapa */}
      {finalOsId && (
        <AprovacaoModal
          open={isAprovacaoModalOpen}
          onOpenChange={setIsAprovacaoModalOpen}
          osId={finalOsId}
          etapaOrdem={currentStep}
          etapaNome={etapaNomeParaAprovacao}
          onAprovado={async () => {
            setCurrentStep(prev => prev + 1);
            setLastActiveStep(prev => Math.max(prev ?? 0, currentStep + 1));
          }}
        />
      )}
    </div>
  );
}
