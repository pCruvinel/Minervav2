/**
 * TDD Tests — useReceitasPrevistasConciliacao
 * 
 * Testes para funções puras extraídas do hook de receitas previstas
 * para conciliação bancária de Entradas.
 */
import { describe, it, expect } from 'vitest';
import {
  formatarDescricaoParcela,
  filtrarReceitasPorBusca,
  calcularDiasAtraso,
  type ReceitaPrevistaConciliacao,
} from '../use-receitas-previstas-conciliacao';

// ============================================================
// FIXTURES
// ============================================================

const criarReceita = (overrides: Partial<ReceitaPrevistaConciliacao> = {}): ReceitaPrevistaConciliacao => ({
  id: 'rec-1',
  descricaoFormatada: '',
  valor_previsto: 5000,
  valor_recebido: 0,
  vencimento: '2026-02-15',
  status: 'em_aberto',
  dias_atraso: 0,
  cliente_nome: 'Solar Engenharia',
  cc_nome: 'CC13001-SOLAR_I',
  cc_id: 'cc-1',
  parcela_num: 3,
  total_parcelas: 10,
  contrato_id: 'contrato-1',
  ...overrides,
});

// ============================================================
// formatarDescricaoParcela
// ============================================================

describe('formatarDescricaoParcela', () => {
  it('formata corretamente parcela com cliente', () => {
    const resultado = formatarDescricaoParcela(3, 10, 'Solar Engenharia');
    expect(resultado).toBe('Parcela 3 de 10 — Solar Engenharia');
  });

  it('formata corretamente quando cliente é undefined', () => {
    const resultado = formatarDescricaoParcela(1, 5, undefined);
    expect(resultado).toBe('Parcela 1 de 5');
  });

  it('formata corretamente quando cliente é string vazia', () => {
    const resultado = formatarDescricaoParcela(7, 12, '');
    expect(resultado).toBe('Parcela 7 de 12');
  });

  it('formata parcela 1 de 1 (parcela única)', () => {
    const resultado = formatarDescricaoParcela(1, 1, 'Condomínio Primavera');
    expect(resultado).toBe('Parcela 1 de 1 — Condomínio Primavera');
  });
});

// ============================================================
// calcularDiasAtraso
// ============================================================

describe('calcularDiasAtraso', () => {
  it('retorna 0 para vencimento no futuro', () => {
    const futuro = new Date();
    futuro.setDate(futuro.getDate() + 5);
    const vencimento = futuro.toISOString().split('T')[0];
    expect(calcularDiasAtraso(vencimento)).toBe(0);
  });

  it('retorna 0 para vencimento hoje', () => {
    const hoje = new Date().toISOString().split('T')[0];
    expect(calcularDiasAtraso(hoje)).toBe(0);
  });

  it('retorna dias corretos para vencimento no passado', () => {
    const passado = new Date();
    passado.setDate(passado.getDate() - 10);
    const vencimento = passado.toISOString().split('T')[0];
    const resultado = calcularDiasAtraso(vencimento);
    // Tolerância de 1 dia por timezone edge cases
    expect(resultado).toBeGreaterThanOrEqual(9);
    expect(resultado).toBeLessThanOrEqual(11);
  });
});

// ============================================================
// filtrarReceitasPorBusca
// ============================================================

describe('filtrarReceitasPorBusca', () => {
  const receitas: ReceitaPrevistaConciliacao[] = [
    criarReceita({
      id: 'rec-1',
      cliente_nome: 'Solar Engenharia',
      cc_nome: 'CC13001-SOLAR_I',
      descricaoFormatada: 'Parcela 3 de 10 — Solar Engenharia',
    }),
    criarReceita({
      id: 'rec-2',
      cliente_nome: 'Condomínio Primavera',
      cc_nome: 'CC05002-PRIMAVERA',
      descricaoFormatada: 'Parcela 1 de 5 — Condomínio Primavera',
    }),
    criarReceita({
      id: 'rec-3',
      cliente_nome: 'Residencial Aurora',
      cc_nome: null,
      descricaoFormatada: 'Parcela 2 de 3 — Residencial Aurora',
    }),
  ];

  it('retorna todas quando searchTerm é vazio', () => {
    const resultado = filtrarReceitasPorBusca(receitas, '');
    expect(resultado).toHaveLength(3);
  });

  it('filtra por nome de cliente (case insensitive)', () => {
    const resultado = filtrarReceitasPorBusca(receitas, 'solar');
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe('rec-1');
  });

  it('filtra por CC nome', () => {
    const resultado = filtrarReceitasPorBusca(receitas, 'PRIMAVERA');
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe('rec-2');
  });

  it('filtra por descrição formatada', () => {
    const resultado = filtrarReceitasPorBusca(receitas, 'Parcela 2 de 3');
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe('rec-3');
  });

  it('retorna vazio quando nada corresponde', () => {
    const resultado = filtrarReceitasPorBusca(receitas, 'inexistente xyz');
    expect(resultado).toHaveLength(0);
  });

  it('funciona quando cc_nome é null', () => {
    const resultado = filtrarReceitasPorBusca(receitas, 'Aurora');
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe('rec-3');
  });
});
