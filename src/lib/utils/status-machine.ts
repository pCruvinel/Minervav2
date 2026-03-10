/**
 * Status Machine — Transições válidas de status para vagas e OS
 *
 * Defesa em profundidade: este módulo é a camada TS.
 * O banco possui um trigger `BEFORE UPDATE` equivalente (T4.3.2).
 *
 * @module utils/status-machine
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Status possíveis para uma vaga de recrutamento */
export type VagaStatus = 'aberta' | 'em_selecao' | 'preenchida' | 'cancelada';

/** Status geral de uma OS */
export type OSStatusGeral =
  | 'em_triagem'
  | 'em_andamento'
  | 'aguardando_info'
  | 'concluido'
  | 'cancelado'
  | 'aguardando_aprovacao';

/** Status de candidatura na junção candidato ↔ vaga */
export type CandidaturaStatus =
  | 'inscrito'
  | 'em_analise'
  | 'entrevista'
  | 'aprovado'
  | 'reprovado'
  | 'desistiu';

/** Status do Kanban (derivado, não persistido) */
export type KanbanStatus =
  | 'pendente_aprovacao'
  | 'em_divulgacao'
  | 'entrevistas'
  | 'finalizado';

// ---------------------------------------------------------------------------
// Transition Maps
// ---------------------------------------------------------------------------

/**
 * Transições válidas para o status de uma vaga.
 * Chave = status atual, valor = array de status destino permitidos.
 */
export const VAGA_TRANSITIONS: Readonly<Record<VagaStatus, readonly VagaStatus[]>> = {
  aberta: ['em_selecao', 'cancelada'],
  em_selecao: ['preenchida', 'cancelada', 'aberta'],
  preenchida: [],       // terminal
  cancelada: ['aberta'], // reabertura
} as const;

/**
 * Transições válidas para o status geral de uma OS.
 */
export const OS_TRANSITIONS: Readonly<Record<OSStatusGeral, readonly OSStatusGeral[]>> = {
  em_triagem: ['em_andamento', 'cancelado'],
  em_andamento: ['concluido', 'cancelado', 'aguardando_info'],
  aguardando_info: ['em_andamento', 'cancelado'],
  aguardando_aprovacao: ['em_andamento', 'cancelado'],
  concluido: [],    // terminal
  cancelado: [],    // terminal
} as const;

/**
 * Transições válidas entre colunas do Kanban.
 * Mantém o fluxo visual alinhado com o processo de recrutamento.
 */
export const KANBAN_TRANSITIONS: Readonly<Record<KanbanStatus, readonly KanbanStatus[]>> = {
  pendente_aprovacao: ['em_divulgacao'],
  em_divulgacao: ['entrevistas'],
  entrevistas: ['finalizado'],
  finalizado: [], // terminal
} as const;

/**
 * Mapeamento: KanbanStatus → ação necessária (VagaStatus + OSStatusGeral)
 * Usado pelo DnD para saber quais mutations disparar ao mover um card.
 */
export const KANBAN_TO_MUTATIONS: Readonly<
  Record<KanbanStatus, { vagaStatus: VagaStatus; osStatus?: OSStatusGeral }>
> = {
  pendente_aprovacao: { vagaStatus: 'aberta', osStatus: 'em_triagem' },
  em_divulgacao: { vagaStatus: 'aberta', osStatus: 'em_andamento' },
  entrevistas: { vagaStatus: 'em_selecao' },
  finalizado: { vagaStatus: 'preenchida', osStatus: 'concluido' },
} as const;

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

/**
 * Verifica se uma transição de status é válida.
 *
 * @param current - Status atual
 * @param target - Status destino pretendido
 * @param map - Mapa de transições (VAGA_TRANSITIONS ou OS_TRANSITIONS)
 * @returns `true` se a transição é permitida
 *
 * @example
 * ```ts
 * isValidTransition('aberta', 'em_selecao', VAGA_TRANSITIONS); // true
 * isValidTransition('preenchida', 'aberta', VAGA_TRANSITIONS);  // false
 * ```
 */
export const isValidTransition = <T extends string>(
  current: T,
  target: T,
  map: Readonly<Record<T, readonly T[]>>
): boolean => {
  if (current === target) return true; // sem mudança é sempre válido
  const allowed = map[current];
  if (!allowed) return false;
  return (allowed as readonly string[]).includes(target);
};

/**
 * Retorna os próximos estados possíveis a partir do estado atual.
 *
 * @example
 * ```ts
 * getAvailableTransitions('aberta', VAGA_TRANSITIONS);
 * // => ['em_selecao', 'cancelada']
 * ```
 */
export const getAvailableTransitions = <T extends string>(
  current: T,
  map: Readonly<Record<T, readonly T[]>>
): readonly T[] => {
  return map[current] ?? [];
};

/**
 * Verifica se um status é terminal (sem transições de saída).
 */
export const isTerminalStatus = <T extends string>(
  status: T,
  map: Readonly<Record<T, readonly T[]>>
): boolean => {
  const transitions = map[status];
  return !transitions || transitions.length === 0;
};

/**
 * Labels amigáveis para status de vaga (PT-BR)
 */
export const VAGA_STATUS_LABELS: Readonly<Record<VagaStatus, string>> = {
  aberta: 'Aberta',
  em_selecao: 'Em Seleção',
  preenchida: 'Preenchida',
  cancelada: 'Cancelada',
} as const;

/**
 * Labels amigáveis para status geral de OS (PT-BR)
 */
export const OS_STATUS_LABELS: Readonly<Record<OSStatusGeral, string>> = {
  em_triagem: 'Em Triagem',
  em_andamento: 'Em Andamento',
  aguardando_info: 'Aguardando Informação',
  aguardando_aprovacao: 'Aguardando Aprovação',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
} as const;
