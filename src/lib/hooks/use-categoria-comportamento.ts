/**
 * use-categoria-comportamento.ts
 *
 * Hook data-driven para regras de UX por categoria financeira.
 * Busca a tabela `categoria_comportamento` e retorna um mapa
 * de categoriaId → regras (setor, CC, anexo, detalhamento, descartável).
 *
 * Categorias sem registro na tabela usam comportamento PADRÃO (tudo habilitado).
 *
 * @example
 * ```tsx
 * const { data: behaviorMap } = useCategoriaBehavior();
 * const behavior = getBehavior(behaviorMap, categoriaIdSelecionada);
 * // behavior.exigeSetor → true/false
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';

// ============================================================
// TYPES
// ============================================================

export interface CategoriaBehavior {
  exigeSetor: boolean;
  exigeCC: boolean;
  exigeAnexo: boolean;
  exigeDetalhamento: boolean;
  isDescartavel: boolean;
}

export type CategoriaBehaviorMap = Record<string, CategoriaBehavior>;

// Comportamento padrão: formulário completo, não descartável
const DEFAULT_BEHAVIOR: CategoriaBehavior = {
  exigeSetor: true,
  exigeCC: true,
  exigeAnexo: true,
  exigeDetalhamento: true,
  isDescartavel: false,
};

// ============================================================
// PURE FUNCTIONS (testáveis sem Supabase)
// ============================================================

/**
 * Retorna o comportamento da categoria ou o padrão se não encontrada.
 * Exportado para uso em componentes e testes.
 */
export function getBehavior(
  map: CategoriaBehaviorMap | undefined,
  categoriaId: string,
): CategoriaBehavior {
  if (!map || !categoriaId) return DEFAULT_BEHAVIOR;
  return map[categoriaId] ?? DEFAULT_BEHAVIOR;
}

/**
 * Retorna o comportamento padrão (tudo habilitado).
 * Útil para testes e estados iniciais.
 */
export function getDefaultBehavior(): CategoriaBehavior {
  return { ...DEFAULT_BEHAVIOR };
}

// ============================================================
// HOOK
// ============================================================

/**
 * Busca as regras de UX de categorias da tabela `categoria_comportamento`.
 * Retorna um mapa de `categoriaId → CategoriaBehavior`.
 * Cache de 10 minutos — muda raramente.
 */
export function useCategoriaBehavior() {
  return useQuery({
    queryKey: ['categoria-comportamento'],
    queryFn: async (): Promise<CategoriaBehaviorMap> => {
      const { data, error } = await supabase
        .from('categoria_comportamento')
        .select('categoria_id, exige_setor, exige_cc, exige_anexo, exige_detalhamento, is_descartavel');

      if (error) throw error;

      const map: CategoriaBehaviorMap = {};
      for (const row of data ?? []) {
        map[row.categoria_id] = {
          exigeSetor: row.exige_setor,
          exigeCC: row.exige_cc,
          exigeAnexo: row.exige_anexo,
          exigeDetalhamento: row.exige_detalhamento,
          isDescartavel: row.is_descartavel,
        };
      }
      return map;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos — configuração muda raramente
  });
}
