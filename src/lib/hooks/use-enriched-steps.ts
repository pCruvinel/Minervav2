/**
 * ============================================================================
 * HOOK: useEnrichedSteps
 * ============================================================================
 * 
 * Hook que enriquece um array de WorkflowStepDefinition com dados de 
 * responsabilidade em tempo real, conectando os steps estáticos com 
 * os dados dinâmicos do banco.
 * 
 * @example
 * ```tsx
 * const steps = OS_08_STEPS;
 * const enrichedSteps = useEnrichedSteps(osId, steps);
 * 
 * <WorkflowAccordion steps={enrichedSteps} ... />
 * ```
 * 
 * @module use-enriched-steps
 * @author Minerva ERP
 */

import { useMemo } from 'react';
import { useOSResponsabilidade } from './use-os-responsabilidade';
import { getStepOwner } from '@/lib/constants/os-ownership-rules';
import { SETOR_NOMES } from '@/lib/types/os-responsabilidade';
import type { WorkflowStepDefinition } from '@/components/os/shared/components/workflow-accordion';

/**
 * Enriquece steps com dados de responsabilidade dinâmicos
 * 
 * @param osId ID da OS
 * @param steps Array de steps estáticos
 * @param tipoOs Tipo da OS (ex: 'OS-08') para buscar ownership rules
 * @returns Steps enriquecidos com dados de responsabilidade
 */
export function useEnrichedSteps(
  osId: string,
  steps: WorkflowStepDefinition[],
  tipoOs: string
): WorkflowStepDefinition[] {
  const {
    getResponsavelEtapa,
    podeEditarEtapa,
    podeDelegar,
    isLoading,
  } = useOSResponsabilidade(osId);

  const enrichedSteps = useMemo<WorkflowStepDefinition[]>(() => {
    if (!osId || isLoading) {
      // Enquanto carrega, retorna steps com dados de ownership estáticos
      return steps.map((step) => {
        const stepOwner = getStepOwner(tipoOs, step.id);
        return {
          ...step,
          setor: stepOwner?.setor,
          setorNome: stepOwner ? SETOR_NOMES[stepOwner.setor] : undefined,
        };
      });
    }

    // Após carregar, enriquecer com dados dinâmicos
    return steps.map((step) => {
      const responsabilidade = getResponsavelEtapa(step.id);
      const stepOwner = getStepOwner(tipoOs, step.id);

      if (responsabilidade) {
        return {
          ...step,
          setor: responsabilidade.setor.slug,
          setorNome: responsabilidade.setor.nome,
          responsavelId: responsabilidade.responsavel_atual.id,
          responsavelNome: responsabilidade.responsavel_atual.nome,
          responsavelCargo: responsabilidade.responsavel_atual.cargo,
          responsavelAvatar: responsabilidade.responsavel_atual.avatar_url,
          isDelegado: responsabilidade.responsavel_atual.is_delegado,
          podeEditar: responsabilidade.pode_editar,
          podeDelegar: responsabilidade.pode_delegar,
        };
      }

      // Fallback para dados estáticos
      return {
        ...step,
        setor: stepOwner?.setor,
        setorNome: stepOwner ? SETOR_NOMES[stepOwner.setor] : undefined,
        podeEditar: podeEditarEtapa(step.id),
        podeDelegar: stepOwner ? podeDelegar(stepOwner.setor) : false,
      };
    });
  }, [osId, steps, tipoOs, isLoading, getResponsavelEtapa, podeEditarEtapa, podeDelegar]);

  return enrichedSteps;
}
