/**
 * Tests for use-categoria-comportamento.ts
 *
 * Tests the pure functions getBehavior and getDefaultBehavior.
 * The useCategoriaBehavior hook itself requires Supabase mocking (integration test).
 */

import { describe, it, expect } from 'vitest';
import {
  getBehavior,
  getDefaultBehavior,
  type CategoriaBehaviorMap,
  type CategoriaBehavior,
} from '../use-categoria-comportamento';

describe('getDefaultBehavior', () => {
  it('returns all true fields and isDescartavel false', () => {
    const def = getDefaultBehavior();
    expect(def.exigeSetor).toBe(true);
    expect(def.exigeCC).toBe(true);
    expect(def.exigeAnexo).toBe(true);
    expect(def.exigeDetalhamento).toBe(true);
    expect(def.isDescartavel).toBe(false);
  });

  it('returns a new object each call (no shared mutation)', () => {
    const a = getDefaultBehavior();
    const b = getDefaultBehavior();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

describe('getBehavior', () => {
  const sampleMap: CategoriaBehaviorMap = {
    'cat-escritorio': {
      exigeSetor: false,
      exigeCC: false,
      exigeAnexo: true,
      exigeDetalhamento: false,
      isDescartavel: false,
    },
    'cat-aplicacao': {
      exigeSetor: false,
      exigeCC: false,
      exigeAnexo: false,
      exigeDetalhamento: false,
      isDescartavel: true,
    },
    'cat-mao-de-obra': {
      exigeSetor: false,
      exigeCC: false,
      exigeAnexo: false,
      exigeDetalhamento: false,
      isDescartavel: false,
    },
  };

  it('returns correct behavior for a known category', () => {
    const result = getBehavior(sampleMap, 'cat-escritorio');
    expect(result.exigeSetor).toBe(false);
    expect(result.exigeCC).toBe(false);
    expect(result.exigeAnexo).toBe(true);
    expect(result.exigeDetalhamento).toBe(false);
    expect(result.isDescartavel).toBe(false);
  });

  it('returns descartável:true for Aplicação category', () => {
    const result = getBehavior(sampleMap, 'cat-aplicacao');
    expect(result.isDescartavel).toBe(true);
    expect(result.exigeAnexo).toBe(false);
  });

  it('returns Mão de Obra behavior: all false, not descartável', () => {
    const result = getBehavior(sampleMap, 'cat-mao-de-obra');
    expect(result.exigeSetor).toBe(false);
    expect(result.exigeCC).toBe(false);
    expect(result.exigeAnexo).toBe(false);
    expect(result.exigeDetalhamento).toBe(false);
    expect(result.isDescartavel).toBe(false);
  });

  it('returns DEFAULT behavior for unknown category ID', () => {
    const result = getBehavior(sampleMap, 'cat-desconhecida');
    expect(result.exigeSetor).toBe(true);
    expect(result.exigeCC).toBe(true);
    expect(result.exigeAnexo).toBe(true);
    expect(result.exigeDetalhamento).toBe(true);
    expect(result.isDescartavel).toBe(false);
  });

  it('returns DEFAULT behavior when map is undefined', () => {
    const result = getBehavior(undefined, 'cat-any');
    expect(result).toEqual(getDefaultBehavior());
  });

  it('returns DEFAULT behavior when categoriaId is empty string', () => {
    const result = getBehavior(sampleMap, '');
    expect(result).toEqual(getDefaultBehavior());
  });

  it('returns DEFAULT behavior when both args are empty/undefined', () => {
    const result = getBehavior(undefined, '');
    expect(result).toEqual(getDefaultBehavior());
  });

  it('all known categories have exactly 5 boolean fields', () => {
    for (const [key, behavior] of Object.entries(sampleMap)) {
      const keys = Object.keys(behavior);
      expect(keys).toHaveLength(5);
      expect(keys).toContain('exigeSetor');
      expect(keys).toContain('exigeCC');
      expect(keys).toContain('exigeAnexo');
      expect(keys).toContain('exigeDetalhamento');
      expect(keys).toContain('isDescartavel');
    }
  });
});
