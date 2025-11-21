/**
 * Testes Unitários - Cálculos de Precificação
 *
 * Testa as funções de cálculo de valores, margens e precificação
 * usadas no fluxo de Ordem de Serviço
 */

import { describe, expect, it } from 'vitest';

// ============================================================
// FUNÇÕES DE CÁLCULO (inline para testes)
// ============================================================

/**
 * Calcula o valor total da proposta baseado em custos e margens
 */
export function calcularPrecificacao(params: {
  custoBase: number;
  percImprevisto: number;
  percLucro: number;
  percImposto: number;
}): {
  valorTotal: number;
  custoComImprevisto: number;
  valorLucro: number;
  valorImposto: number;
} {
  const { custoBase, percImprevisto, percLucro, percImposto } = params;

  // Adicionar imprevistos ao custo base
  const custoComImprevisto = custoBase * (1 + percImprevisto / 100);

  // Calcular divisor para lucro e imposto
  const divisor = 1 - (percLucro + percImposto) / 100;

  // Valor total
  const valorTotal = custoComImprevisto / divisor;

  // Valores individuais
  const valorLucro = valorTotal * (percLucro / 100);
  const valorImposto = valorTotal * (percImposto / 100);

  return {
    valorTotal,
    custoComImprevisto,
    valorLucro,
    valorImposto,
  };
}

/**
 * Calcula parcelamento baseado no valor total
 */
export function calcularParcelamento(params: {
  valorTotal: number;
  percEntrada: number;
  numParcelas: number;
}): {
  valorEntrada: number;
  valorParcelado: number;
  valorParcela: number;
} {
  const { valorTotal, percEntrada, numParcelas } = params;

  const valorEntrada = valorTotal * (percEntrada / 100);
  const valorParcelado = valorTotal - valorEntrada;
  const valorParcela = valorParcelado / numParcelas;

  return {
    valorEntrada,
    valorParcelado,
    valorParcela,
  };
}

/**
 * Calcula margem de lucro percentual
 */
export function calcularMargemLucro(params: {
  valorVenda: number;
  valorCusto: number;
}): number {
  const { valorVenda, valorCusto } = params;
  return ((valorVenda - valorCusto) / valorVenda) * 100;
}

// ============================================================
// TESTES
// ============================================================

describe('Cálculos de Precificação', () => {
  describe('calcularPrecificacao()', () => {
    it('calcula valor total corretamente com margens padrão', () => {
      const resultado = calcularPrecificacao({
        custoBase: 10000,
        percImprevisto: 10, // 10%
        percLucro: 20, // 20%
        percImposto: 15, // 15%
      });

      // Custo com imprevisto: 10000 * 1.10 = 11000
      // Divisor: 1 - (20 + 15)/100 = 1 - 0.35 = 0.65
      // Valor total: 11000 / 0.65 = 16923.08
      expect(resultado.custoComImprevisto).toBeCloseTo(11000, 2);
      expect(resultado.valorTotal).toBeCloseTo(16923.08, 2);
      expect(resultado.valorLucro).toBeCloseTo(3384.62, 2); // 20% de 16923.08
      expect(resultado.valorImposto).toBeCloseTo(2538.46, 2); // 15% de 16923.08
    });

    it('calcula valor total sem imprevistos', () => {
      const resultado = calcularPrecificacao({
        custoBase: 10000,
        percImprevisto: 0,
        percLucro: 20,
        percImposto: 15,
      });

      expect(resultado.custoComImprevisto).toBe(10000);
      expect(resultado.valorTotal).toBeCloseTo(15384.62, 2);
    });

    it('calcula valor total sem lucro nem imposto', () => {
      const resultado = calcularPrecificacao({
        custoBase: 10000,
        percImprevisto: 10,
        percLucro: 0,
        percImposto: 0,
      });

      expect(resultado.valorTotal).toBeCloseTo(11000, 2);
      expect(resultado.valorLucro).toBe(0);
      expect(resultado.valorImposto).toBe(0);
    });

    it('calcula com margens altas (80%)', () => {
      const resultado = calcularPrecificacao({
        custoBase: 10000,
        percImprevisto: 10,
        percLucro: 50,
        percImposto: 30,
      });

      // Divisor: 1 - 0.80 = 0.20
      // Valor total: 11000 / 0.20 = 55000
      expect(resultado.valorTotal).toBeCloseTo(55000, 2);
    });

    it('retorna valores positivos para custos positivos', () => {
      const resultado = calcularPrecificacao({
        custoBase: 5000,
        percImprevisto: 5,
        percLucro: 15,
        percImposto: 10,
      });

      expect(resultado.valorTotal).toBeGreaterThan(0);
      expect(resultado.custoComImprevisto).toBeGreaterThan(0);
      expect(resultado.valorLucro).toBeGreaterThan(0);
      expect(resultado.valorImposto).toBeGreaterThan(0);
    });

    it('lida com valores decimais de percentuais', () => {
      const resultado = calcularPrecificacao({
        custoBase: 10000,
        percImprevisto: 7.5,
        percLucro: 22.3,
        percImposto: 16.8,
      });

      // Valor calculado: 10750 / (1 - 0.391) = 17651.89
      expect(resultado.valorTotal).toBeCloseTo(17651.89, 2);
    });
  });

  describe('calcularParcelamento()', () => {
    it('calcula entrada e parcelas corretamente', () => {
      const resultado = calcularParcelamento({
        valorTotal: 10000,
        percEntrada: 30, // 30%
        numParcelas: 6,
      });

      expect(resultado.valorEntrada).toBeCloseTo(3000, 2);
      expect(resultado.valorParcelado).toBeCloseTo(7000, 2);
      expect(resultado.valorParcela).toBeCloseTo(1166.67, 2);
    });

    it('calcula sem entrada (0%)', () => {
      const resultado = calcularParcelamento({
        valorTotal: 10000,
        percEntrada: 0,
        numParcelas: 10,
      });

      expect(resultado.valorEntrada).toBe(0);
      expect(resultado.valorParcelado).toBe(10000);
      expect(resultado.valorParcela).toBe(1000);
    });

    it('calcula à vista (1 parcela)', () => {
      const resultado = calcularParcelamento({
        valorTotal: 10000,
        percEntrada: 100,
        numParcelas: 1,
      });

      expect(resultado.valorEntrada).toBe(10000);
      expect(resultado.valorParcelado).toBe(0);
      expect(resultado.valorParcela).toBe(0);
    });

    it('calcula com muitas parcelas (12x)', () => {
      const resultado = calcularParcelamento({
        valorTotal: 12000,
        percEntrada: 0,
        numParcelas: 12,
      });

      expect(resultado.valorParcela).toBe(1000);
    });

    it('calcula com entrada de 50%', () => {
      const resultado = calcularParcelamento({
        valorTotal: 20000,
        percEntrada: 50,
        numParcelas: 4,
      });

      expect(resultado.valorEntrada).toBe(10000);
      expect(resultado.valorParcelado).toBe(10000);
      expect(resultado.valorParcela).toBe(2500);
    });

    it('lida com valores decimais', () => {
      const resultado = calcularParcelamento({
        valorTotal: 15723.45,
        percEntrada: 35.5,
        numParcelas: 8,
      });

      expect(resultado.valorEntrada).toBeCloseTo(5581.82, 2);
      expect(resultado.valorParcela).toBeCloseTo(1267.70, 2);
    });
  });

  describe('calcularMargemLucro()', () => {
    it('calcula margem de lucro de 20%', () => {
      const margem = calcularMargemLucro({
        valorVenda: 10000,
        valorCusto: 8000,
      });

      // Margem: (10000 - 8000) / 10000 * 100 = 20%
      expect(margem).toBeCloseTo(20, 2);
    });

    it('calcula margem de lucro de 50%', () => {
      const margem = calcularMargemLucro({
        valorVenda: 10000,
        valorCusto: 5000,
      });

      expect(margem).toBeCloseTo(50, 2);
    });

    it('calcula margem zero quando venda = custo', () => {
      const margem = calcularMargemLucro({
        valorVenda: 10000,
        valorCusto: 10000,
      });

      expect(margem).toBe(0);
    });

    it('calcula margem negativa (prejuízo)', () => {
      const margem = calcularMargemLucro({
        valorVenda: 10000,
        valorCusto: 12000,
      });

      expect(margem).toBeCloseTo(-20, 2);
    });

    it('calcula margem com valores decimais', () => {
      const margem = calcularMargemLucro({
        valorVenda: 16923.08,
        valorCusto: 11000,
      });

      expect(margem).toBeCloseTo(35, 1);
    });
  });

  describe('Integração: Fluxo Completo de Precificação', () => {
    it('calcula fluxo completo de uma proposta', () => {
      // Cenário: Obra de R$ 50.000 de custo base
      const custoBase = 50000;

      // Passo 1: Calcular precificação
      const precificacao = calcularPrecificacao({
        custoBase,
        percImprevisto: 10,
        percLucro: 25,
        percImposto: 18,
      });

      expect(precificacao.valorTotal).toBeCloseTo(96491.23, 2);

      // Passo 2: Calcular parcelamento
      const parcelamento = calcularParcelamento({
        valorTotal: precificacao.valorTotal,
        percEntrada: 30,
        numParcelas: 6,
      });

      expect(parcelamento.valorEntrada).toBeCloseTo(28947.37, 2);
      expect(parcelamento.valorParcela).toBeCloseTo(11257.31, 2);

      // Passo 3: Verificar margem de lucro
      const margem = calcularMargemLucro({
        valorVenda: precificacao.valorTotal,
        valorCusto: precificacao.custoComImprevisto,
      });

      expect(margem).toBeCloseTo(43, 0); // ~43% de margem
    });

    it('valida que soma de parcelas + entrada = valor total', () => {
      const valorTotal = 25000;

      const parcelamento = calcularParcelamento({
        valorTotal,
        percEntrada: 40,
        numParcelas: 5,
      });

      const soma =
        parcelamento.valorEntrada + parcelamento.valorParcela * 5;

      expect(soma).toBeCloseTo(valorTotal, 2);
    });

    it('valida que lucro + imposto + custo = valor total', () => {
      const precificacao = calcularPrecificacao({
        custoBase: 10000,
        percImprevisto: 10,
        percLucro: 20,
        percImposto: 15,
      });

      const soma =
        precificacao.custoComImprevisto +
        precificacao.valorLucro +
        precificacao.valorImposto;

      expect(soma).toBeCloseTo(precificacao.valorTotal, 2);
    });
  });

  describe('Edge Cases e Validações', () => {
    it('lida com valores muito grandes (milhões)', () => {
      const resultado = calcularPrecificacao({
        custoBase: 5000000,
        percImprevisto: 10,
        percLucro: 20,
        percImposto: 15,
      });

      expect(resultado.valorTotal).toBeCloseTo(8461538.46, 2);
    });

    it('lida com valores muito pequenos (centavos)', () => {
      const resultado = calcularParcelamento({
        valorTotal: 10.5,
        percEntrada: 20,
        numParcelas: 3,
      });

      expect(resultado.valorEntrada).toBeCloseTo(2.1, 2);
      expect(resultado.valorParcela).toBeCloseTo(2.8, 2);
    });

    it('retorna 0 para custo base zero', () => {
      const resultado = calcularPrecificacao({
        custoBase: 0,
        percImprevisto: 10,
        percLucro: 20,
        percImposto: 15,
      });

      expect(resultado.valorTotal).toBe(0);
      expect(resultado.valorLucro).toBe(0);
      expect(resultado.valorImposto).toBe(0);
    });

    it('calcula corretamente com 1 parcela', () => {
      const resultado = calcularParcelamento({
        valorTotal: 5000,
        percEntrada: 0,
        numParcelas: 1,
      });

      expect(resultado.valorParcela).toBe(5000);
    });

    it('previne divisão por zero no cálculo de margem', () => {
      const margem = calcularMargemLucro({
        valorVenda: 0,
        valorCusto: 0,
      });

      // Margem indefinida (NaN ou Infinity)
      expect(isNaN(margem) || !isFinite(margem)).toBe(true);
    });
  });
});
