/**
 * TDD Tests — Regra de desprezo Custo-Dia
 *
 * Testa funções puras que determinam se um custo variável
 * deve ser excluído do cálculo de custo-dia.
 */
import { describe, it, expect } from 'vitest';
import {
  deveExcluirDoCustoDia,
  calcularCustoDia,
} from '../custo-dia-utils';

// ============================================================
// deveExcluirDoCustoDia
// ============================================================

describe('deveExcluirDoCustoDia', () => {
  it('retorna true para tipo_custo "geral" (tributos/fixos já inclusos na base)', () => {
    expect(deveExcluirDoCustoDia('geral')).toBe(true);
  });

  it('retorna false para tipo_custo "flutuante" (soma ao custo-dia)', () => {
    expect(deveExcluirDoCustoDia('flutuante')).toBe(false);
  });

  it('retorna false para tipo desconhecido (segurança — inclui no cálculo)', () => {
    expect(deveExcluirDoCustoDia('outro' as 'flutuante' | 'geral')).toBe(false);
  });
});

// ============================================================
// calcularCustoDia
// ============================================================

describe('calcularCustoDia', () => {
  it('divide custo total por 22 dias úteis padrão', () => {
    expect(calcularCustoDia(4400, 0)).toBe(200);
  });

  it('soma custo fixo + variável antes de dividir', () => {
    // (3000 + 1400) / 22 = 200
    expect(calcularCustoDia(3000, 1400)).toBe(200);
  });

  it('aceita dias úteis customizados', () => {
    // 4400 / 20 = 220
    expect(calcularCustoDia(4400, 0, 20)).toBe(220);
  });

  it('retorna 0 quando ambos custos são 0', () => {
    expect(calcularCustoDia(0, 0)).toBe(0);
  });

  it('ignora custo variável negativo (safety)', () => {
    // 3000 + (-500) = 2500 / 22 = 113.6363... → trunc → 113.63
    expect(calcularCustoDia(3000, -500)).toBe(113.63);
  });

  it('trunca para 2 casas decimais (consistência com SQL)', () => {
    // (3333 + 0) / 22 = 151.5 → 151.5
    const result = calcularCustoDia(3333, 0);
    const decimals = result.toString().split('.')[1];
    expect(!decimals || decimals.length <= 2).toBe(true);
  });
});
