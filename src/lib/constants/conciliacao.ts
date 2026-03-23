/**
 * Constantes compartilhadas para o módulo de Conciliação Bancária.
 * Single source of truth para setores, IDs de categorias especiais,
 * e configurações de UX.
 */

// ============================================================
// SETORES (usados tanto no filter da page quanto no form do modal)
// ============================================================

export const SETORES_CONCILIACAO = [
  { value: 'obras', label: 'Obras' },
  { value: 'assessoria', label: 'Assessoria' },
] as const;

export type SetorConciliacao = (typeof SETORES_CONCILIACAO)[number]['value'];

// Para uso em MultiSelect (page filters)
export const SETORES_CONCILIACAO_OPTIONS = SETORES_CONCILIACAO.map((s) => ({
  label: s.label,
  value: s.label, // filtro usa o nome, não o slug
}));

// ============================================================
// CATEGORIAS ESPECIAIS — IDs hardcoded (referência do banco)
// ============================================================

/** ID da categoria "Mão de Obra + Tributos de Mão de Obra" (D.01) */
export const CATEGORIA_MAO_DE_OBRA_ID = '843f5fef-fb6a-49bd-bec3-b0917c2d4204';

/** ID real da categoria "Aplicação" no banco (D.13) */
export const APLICACAO_DB_ID = 'eb4ef2eb-b24f-45d4-b42d-f3fcfe691200';

// IDs sintéticos para categorias extras no frontend (não existem no DB)
export const CATEGORIA_RESGATE_APLICACAO_ID = '__resgate_aplicacao__';
export const CATEGORIA_APLICACAO_ID = '__aplicacao__';
export const CATEGORIA_OUTROS_ID = '__outros__';

// Categorias cujo valor é descartado de relatórios e DRE
export const CATEGORIAS_DESCARTADAS_IDS = [
  CATEGORIA_RESGATE_APLICACAO_ID,
  CATEGORIA_APLICACAO_ID,
  APLICACAO_DB_ID,
];

// Nomes de categorias MO para detecção no read-only
export const MO_CATEGORY_NAMES = [
  'mão de obra',
  'mao de obra',
  'tributos de mão de obra',
  'tributos de mao de obra',
];

// Categorias fixas para Entradas (Receitas) avulsas
export const ENTRY_EXTRA_CATEGORIES = [
  {
    id: CATEGORIA_RESGATE_APLICACAO_ID,
    nome: 'Resgate de Aplicação',
    codigo: 'RESGATE',
    tipo: 'receber' as const,
    ativo: true,
  },
  {
    id: CATEGORIA_OUTROS_ID,
    nome: 'Outros',
    codigo: 'OUTROS',
    tipo: 'receber' as const,
    ativo: true,
  },
];

// Categorias fixas para Saídas (Despesas) avulsas
export const EXIT_EXTRA_CATEGORIES = [
  {
    id: CATEGORIA_APLICACAO_ID,
    nome: 'Aplicação',
    codigo: 'APLICACAO',
    tipo: 'pagar' as const,
    ativo: true,
  },
];
