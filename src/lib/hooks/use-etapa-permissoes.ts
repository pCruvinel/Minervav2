/**
 * ============================================================================
 * HOOK: useEtapaPermissoes
 * ============================================================================
 * 
 * Hook simplificado para verificar permissões de uma etapa específica.
 * Usa useOSResponsabilidade internamente mas expõe interface mais simples.
 * 
 * @example
 * ```tsx
 * const { podeEditar, responsavel, setor } = useEtapaPermissoes(osId, 3);
 * 
 * if (!podeEditar) {
 *   return <ReadOnlyView />;
 * }
 * ```
 * 
 * @module use-etapa-permissoes
 * @author Minerva ERP
 */

import { useMemo } from 'react';
import { useOSResponsabilidade } from './use-os-responsabilidade';
import type { UseEtapaPermissoesReturn } from '@/lib/types/os-responsabilidade';

export function useEtapaPermissoes(osId: string, etapaOrdem: number): UseEtapaPermissoesReturn {
  const {
    getResponsavelEtapa,
    podeEditarEtapa,
    isLoading,
  } = useOSResponsabilidade(osId);

  return useMemo(() => {
    const responsabilidade = getResponsavelEtapa(etapaOrdem);
    const podeEditar = podeEditarEtapa(etapaOrdem);

    if (!responsabilidade) {
      return {
        podeEditar: false,
        podeAvancar: false,
        podeDelegar: false,
        responsavel: null,
        setor: null,
        motivoBloqueio: 'Etapa não encontrada',
        isLoading,
      };
    }

    return {
      podeEditar,
      podeAvancar: podeEditar, // Por enquanto igual
      podeDelegar: responsabilidade.pode_delegar,
      responsavel: responsabilidade.responsavel_atual,
      setor: responsabilidade.setor,
      motivoBloqueio: podeEditar ? undefined : 'Você não tem permissão para editar esta etapa',
      isLoading,
    };
  }, [etapaOrdem, getResponsavelEtapa, podeEditarEtapa, isLoading]);
}
