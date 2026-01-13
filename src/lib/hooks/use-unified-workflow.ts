/**
 * useUnifiedWorkflow - Hook para buscar workflow unificado de hierarquia de OS
 *
 * Combina etapas de OS Lead (1-4) + OS Contrato (13) em uma única lista,
 * permitindo visualização da jornada completa na página de detalhes.
 *
 * @example
 * ```tsx
 * const { phases, loading, currentPhase, totalSteps } = useUnifiedWorkflow(osId);
 * ```
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/utils/logger';
import { useOSHierarchy } from './use-os-hierarchy';

// ============================================================
// TIPOS
// ============================================================

export interface UnifiedStep {
  /** ID único da etapa no banco */
  id: string;
  /** Nome da etapa */
  nome_etapa: string;
  /** Status da etapa */
  status: 'pendente' | 'em_andamento' | 'concluida' | 'bloqueada' | 'cancelada';
  /** Ordem dentro da OS original (1-15 ou 1-17) */
  ordemOriginal: number;
  /** Ordem na lista unificada (1-32) */
  ordemUnificada: number;
  /** ID da OS a que pertence */
  osId: string;
  /** Código da OS (ex: OS-02-0001) */
  osCodigo: string;
  /** Tipo da OS (ex: OS-02 ou OS-13) */
  tipoOS: string;
  /** Fase (LEAD ou CONTRATO) */
  fase: 'LEAD' | 'CONTRATO' | 'SATELITE';
  /** Responsável pela etapa */
  responsavelId?: string;
  /** Última atualização */
  ultimaAtualizacao?: string;
  /** Dados salvos na etapa */
  dadosEtapa?: Record<string, unknown>;
  /** Quantidade de adendos nesta etapa */
  adendosCount?: number;
}

export interface WorkflowPhase {
  /** Identificador da fase */
  id: 'LEAD' | 'CONTRATO' | 'SATELITE';
  /** Nome amigável */
  nome: string;
  /** ID da OS */
  osId: string;
  /** Código da OS */
  osCodigo: string;
  /** Tipo da OS */
  tipoOS: string;
  /** Status geral da OS */
  statusOS: string;
  /** Etapas desta fase */
  etapas: UnifiedStep[];
  /** Se esta fase está completa */
  isCompleta: boolean;
  /** Se esta é a fase ativa */
  isAtiva: boolean;
}

export interface UnifiedWorkflowResult {
  /** Fases do workflow (LEAD, CONTRATO) */
  phases: WorkflowPhase[];
  /** Todas as etapas unificadas */
  allSteps: UnifiedStep[];
  /** Fase atualmente ativa */
  currentPhase: WorkflowPhase | null;
  /** Etapa atualmente ativa */
  currentStep: UnifiedStep | null;
  /** Total de etapas */
  totalSteps: number;
  /** Etapas concluídas */
  completedSteps: number;
  /** Loading state */
  loading: boolean;
  /** Erro, se houver */
  error: Error | null;
  /** Função para atualizar dados */
  refetch: () => void;
  /** OS pai (se satélite) */
  parentOS: { id: string; codigo: string; tipo: string } | null;
  /** OS filhas (satélites) */
  childrenOS: Array<{ id: string; codigo: string; tipo: string; status: string }>;
}

// ============================================================
// CONSTANTES
// ============================================================

const LEAD_OS_CODES = ['OS-01', 'OS-02', 'OS-03', 'OS-04', 'OS-05', 'OS-06'];
const CONTRACT_OS_CODES = ['OS-12', 'OS-13'];
const SATELLITE_OS_CODES = ['OS-09', 'OS-10'];

// ============================================================
// HELPERS
// ============================================================

function isLeadOS(tipoOSCodigo: string): boolean {
  return LEAD_OS_CODES.includes(tipoOSCodigo);
}

function isContractOS(tipoOSCodigo: string): boolean {
  return CONTRACT_OS_CODES.includes(tipoOSCodigo);
}

function isSatelliteOS(tipoOSCodigo: string): boolean {
  return SATELLITE_OS_CODES.includes(tipoOSCodigo);
}

function getFaseFromTipo(tipoOSCodigo: string): 'LEAD' | 'CONTRATO' | 'SATELITE' {
  if (isLeadOS(tipoOSCodigo)) return 'LEAD';
  if (isContractOS(tipoOSCodigo)) return 'CONTRATO';
  return 'SATELITE';
}

// ============================================================
// HOOK PRINCIPAL
// ============================================================

export function useUnifiedWorkflow(osId: string | undefined): UnifiedWorkflowResult {
  const [phases, setPhases] = useState<WorkflowPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Usar hook de hierarquia existente
  const {
    parent,
    children,
    rootLead,
    isContract,
    loading: hierarchyLoading,
    refetch: refetchHierarchy
  } = useOSHierarchy(osId);

  const fetchWorkflow = useCallback(async () => {
    if (!osId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Buscar dados da OS atual
      const { data: currentOS, error: osError } = await supabase
        .from('ordens_servico')
        .select(`
          id,
          codigo_os,
          status_geral,
          tipos_os:tipo_os_id (
            codigo,
            nome
          )
        `)
        .eq('id', osId)
        .single();

      if (osError) throw osError;
      if (!currentOS) throw new Error('OS não encontrada');

      const tipoOSCodigo = (currentOS.tipos_os as any)?.codigo || '';
      const phasesArray: WorkflowPhase[] = [];

      // 2. Determinar qual é a OS Lead e qual é a OS Contrato
      let leadOSId: string | null = null;
      let contractOSId: string | null = null;
      let leadOSData: any = null;
      let contractOSData: any = null;

      if (isLeadOS(tipoOSCodigo)) {
        // A OS atual é um Lead
        leadOSId = osId;
        leadOSData = currentOS;

        // Buscar contrato filho (se existir)
        if (children && children.length > 0) {
          const contractChild = children.find((c) =>
            isContractOS((c.tipos_os as any)?.codigo || '')
          );
          if (contractChild) {
            contractOSId = contractChild.id;
            // Buscar dados completos do contrato
            const { data: contractData } = await supabase
              .from('ordens_servico')
              .select(`
                id,
                codigo_os,
                status_geral,
                tipos_os:tipo_os_id (codigo, nome)
              `)
              .eq('id', contractChild.id)
              .single();
            contractOSData = contractData;
          }
        }
      } else if (isContractOS(tipoOSCodigo)) {
        // A OS atual é um Contrato
        contractOSId = osId;
        contractOSData = currentOS;

        // Buscar Lead pai (se existir)
        if (parent) {
          leadOSId = parent.id;
          const { data: leadData } = await supabase
            .from('ordens_servico')
            .select(`
              id,
              codigo_os,
              status_geral,
              tipos_os:tipo_os_id (codigo, nome)
            `)
            .eq('id', parent.id)
            .single();
          leadOSData = leadData;
        }
      }

      // 3. Buscar etapas do Lead (se existir)
      let leadStepsOffset = 0;
      if (leadOSId && leadOSData) {
        const { data: leadSteps, error: leadStepsError } = await supabase
          .from('os_etapas')
          .select('*')
          .eq('os_id', leadOSId)
          .order('ordem');

        if (!leadStepsError && leadSteps) {
          // Buscar contagem de adendos para cada etapa
          const stepIds = leadSteps.map(s => s.id);
          const { data: adendosData } = await supabase
            .from('os_etapas_adendos')
            .select('etapa_id')
            .in('etapa_id', stepIds);
          
          const adendosCounts: Record<string, number> = {};
          adendosData?.forEach(a => {
            adendosCounts[a.etapa_id] = (adendosCounts[a.etapa_id] || 0) + 1;
          });

          const leadTipo = (leadOSData.tipos_os as any)?.codigo || '';
          const leadEtapas: UnifiedStep[] = leadSteps.map((step, index) => ({
            id: step.id,
            nome_etapa: step.nome_etapa,
            status: step.status,
            ordemOriginal: step.ordem,
            ordemUnificada: index + 1,
            osId: leadOSId!,
            osCodigo: leadOSData.codigo_os,
            tipoOS: leadTipo,
            fase: 'LEAD' as const,
            responsavelId: step.responsavel_id,
            ultimaAtualizacao: step.ultima_atualizacao,
            dadosEtapa: step.dados_etapa,
            adendosCount: adendosCounts[step.id] || 0
          }));

          leadStepsOffset = leadEtapas.length;

          const isLeadCompleta = leadEtapas.every((e) => e.status === 'concluida');
          const isLeadAtiva = !isLeadCompleta && leadEtapas.some((e) =>
            e.status === 'em_andamento' || e.status === 'pendente'
          );

          phasesArray.push({
            id: 'LEAD',
            nome: 'Fase Lead',
            osId: leadOSId,
            osCodigo: leadOSData.codigo_os,
            tipoOS: leadTipo,
            statusOS: leadOSData.status_geral,
            etapas: leadEtapas,
            isCompleta: isLeadCompleta,
            isAtiva: isLeadAtiva
          });
        }
      }

      // 4. Buscar etapas do Contrato (se existir)
      if (contractOSId && contractOSData) {
        const { data: contractSteps, error: contractStepsError } = await supabase
          .from('os_etapas')
          .select('*')
          .eq('os_id', contractOSId)
          .order('ordem');

        if (!contractStepsError && contractSteps) {
          // Buscar contagem de adendos para cada etapa
          const stepIds = contractSteps.map(s => s.id);
          const { data: adendosData } = await supabase
            .from('os_etapas_adendos')
            .select('etapa_id')
            .in('etapa_id', stepIds);
          
          const adendosCounts: Record<string, number> = {};
          adendosData?.forEach(a => {
            adendosCounts[a.etapa_id] = (adendosCounts[a.etapa_id] || 0) + 1;
          });

          const contractTipo = (contractOSData.tipos_os as any)?.codigo || '';
          const contractEtapas: UnifiedStep[] = contractSteps.map((step, index) => ({
            id: step.id,
            nome_etapa: step.nome_etapa,
            status: step.status,
            ordemOriginal: step.ordem,
            ordemUnificada: leadStepsOffset + index + 1,
            osId: contractOSId!,
            osCodigo: contractOSData.codigo_os,
            tipoOS: contractTipo,
            fase: 'CONTRATO' as const,
            responsavelId: step.responsavel_id,
            ultimaAtualizacao: step.ultima_atualizacao,
            dadosEtapa: step.dados_etapa,
            adendosCount: adendosCounts[step.id] || 0
          }));

          const isContractCompleta = contractEtapas.every((e) => e.status === 'concluida');
          const leadPhaseComplete = phasesArray[0]?.isCompleta ?? true;
          const isContractAtiva = leadPhaseComplete && !isContractCompleta;

          phasesArray.push({
            id: 'CONTRATO',
            nome: 'Fase Contrato',
            osId: contractOSId,
            osCodigo: contractOSData.codigo_os,
            tipoOS: contractTipo,
            statusOS: contractOSData.status_geral,
            etapas: contractEtapas,
            isCompleta: isContractCompleta,
            isAtiva: isContractAtiva
          });
        }
      }

      // 5. Se não houver hierarquia (OS órfã), criar fase única
      if (phasesArray.length === 0) {
        const { data: soloSteps } = await supabase
          .from('os_etapas')
          .select('*')
          .eq('os_id', osId)
          .order('ordem');

        if (soloSteps) {
          // Buscar contagem de adendos para cada etapa
          const stepIds = soloSteps.map(s => s.id);
          const { data: adendosData } = await supabase
            .from('os_etapas_adendos')
            .select('etapa_id')
            .in('etapa_id', stepIds);
          
          const adendosCounts: Record<string, number> = {};
          adendosData?.forEach(a => {
            adendosCounts[a.etapa_id] = (adendosCounts[a.etapa_id] || 0) + 1;
          });

          const soloEtapas: UnifiedStep[] = soloSteps.map((step) => ({
            id: step.id,
            nome_etapa: step.nome_etapa,
            status: step.status,
            ordemOriginal: step.ordem,
            ordemUnificada: step.ordem,
            osId: osId,
            osCodigo: currentOS.codigo_os,
            tipoOS: tipoOSCodigo,
            fase: getFaseFromTipo(tipoOSCodigo),
            responsavelId: step.responsavel_id,
            ultimaAtualizacao: step.ultima_atualizacao,
            dadosEtapa: step.dados_etapa,
            adendosCount: adendosCounts[step.id] || 0
          }));

          const isCompleta = soloEtapas.every((e) => e.status === 'concluida');

          phasesArray.push({
            id: getFaseFromTipo(tipoOSCodigo),
            nome: isSatelliteOS(tipoOSCodigo) ? 'Satélite' : tipoOSCodigo,
            osId: osId,
            osCodigo: currentOS.codigo_os,
            tipoOS: tipoOSCodigo,
            statusOS: currentOS.status_geral,
            etapas: soloEtapas,
            isCompleta: isCompleta,
            isAtiva: !isCompleta
          });
        }
      }

      setPhases(phasesArray);

    } catch (err) {
      const error = err as Error;
      logger.error('Erro ao buscar workflow unificado:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [osId, parent, children]);

  // Trigger fetch quando osId ou hierarquia mudar
  useEffect(() => {
    if (!hierarchyLoading) {
      fetchWorkflow();
    }
  }, [fetchWorkflow, hierarchyLoading]);

  // Computed values
  const allSteps = useMemo(() => {
    return phases.flatMap((p) => p.etapas);
  }, [phases]);

  const currentPhase = useMemo(() => {
    return phases.find((p) => p.isAtiva) || phases[phases.length - 1] || null;
  }, [phases]);

  const currentStep = useMemo(() => {
    for (const phase of phases) {
      const activeStep = phase.etapas.find(
        (e) => e.status === 'em_andamento' || e.status === 'pendente'
      );
      if (activeStep) return activeStep;
    }
    return null;
  }, [phases]);

  const totalSteps = useMemo(() => allSteps.length, [allSteps]);

  const completedSteps = useMemo(() => {
    return allSteps.filter((s) => s.status === 'concluida').length;
  }, [allSteps]);

  // Parent OS info
  const parentOS = useMemo(() => {
    if (!parent) return null;
    return {
      id: parent.id,
      codigo: parent.codigo_os,
      tipo: (parent.tipos_os as any)?.codigo || ''
    };
  }, [parent]);

  // Children OS info
  const childrenOS = useMemo(() => {
    if (!children) return [];
    return children.map((c) => ({
      id: c.id,
      codigo: c.codigo_os,
      tipo: (c.tipos_os as any)?.codigo || '',
      status: c.status_geral
    }));
  }, [children]);

  const refetch = useCallback(() => {
    refetchHierarchy();
    fetchWorkflow();
  }, [refetchHierarchy, fetchWorkflow]);

  return {
    phases,
    allSteps,
    currentPhase,
    currentStep,
    totalSteps,
    completedSteps,
    loading: loading || hierarchyLoading,
    error,
    refetch,
    parentOS,
    childrenOS
  };
}
