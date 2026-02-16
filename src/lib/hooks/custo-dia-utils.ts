/**
 * custo-dia-utils.ts
 *
 * Funções puras para regra de desprezo no cálculo de custo-dia.
 * Custos do tipo "geral" (tributos/encargos) são excluídos do cálculo
 * pois já fazem parte do custo base do colaborador.
 */

const DIAS_UTEIS_PADRAO = 22;

/**
 * Determina se um custo variável deve ser excluído do cálculo de custo-dia.
 * "geral" = tributos e encargos que já compõem o custo base → EXCLUI
 * "flutuante" = custos extras reais → INCLUI
 */
export function deveExcluirDoCustoDia(tipoCusto: 'flutuante' | 'geral'): boolean {
  return tipoCusto === 'geral';
}

/**
 * Calcula o custo-dia do colaborador.
 * (custoFixo + custoVariavel) / diasUteis, truncado a 2 casas decimais.
 * Espelha o cálculo da view: trunc(total / 22, 2)
 */
export function calcularCustoDia(
  custoFixo: number,
  custoVariavel: number,
  diasUteis: number = DIAS_UTEIS_PADRAO,
): number {
  const total = custoFixo + custoVariavel;
  if (total === 0 || diasUteis === 0) return 0;
  return Math.trunc((total / diasUteis) * 100) / 100;
}
