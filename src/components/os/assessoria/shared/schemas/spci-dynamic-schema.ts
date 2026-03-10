/**
 * SPCI Dynamic Schema — Zod + react-hook-form
 *
 * Data model for SPCI inspection with block + floor multipliers.
 * - Blocks get per-block sections (Saídas de Emergência)
 * - Floors (within blocks) get per-floor sections (Extintores, Sinalização, etc.)
 * - Global sections are evaluated once for the whole building.
 */

import { z } from 'zod';
import {
  SPCI_GLOBAL_SECTIONS,
  SPCI_PER_BLOCK_SECTIONS,
  SPCI_PER_FLOOR_SECTIONS,
  getBlocoLabel,
  getPavimentoLabel,
  type ChecklistSectionDef,
} from './checklist-definitions';
import { checklistItemValuesSchema, customItemSchema } from './spda-dynamic-schema';

// =====================================================
// HELPER: Build schemas from definitions
// =====================================================

function buildSectionSchema(section: ChecklistSectionDef) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const item of section.items) {
    shape[item.id] = checklistItemValuesSchema;
  }
  shape['_customItems'] = z.array(customItemSchema).default([]);
  return z.object(shape as any);
}

function buildSectionsSchema(sections: ChecklistSectionDef[]) {
  const shape: Record<string, ReturnType<typeof buildSectionSchema>> = {};
  for (const section of sections) {
    shape[section.id] = buildSectionSchema(section);
  }
  return z.object(shape);
}

// =====================================================
// SPCI PAVIMENTO (FLOOR) SCHEMA
// =====================================================

const spciPavimentoSectionsSchema = buildSectionsSchema(SPCI_PER_FLOOR_SECTIONS);

export const spciPavimentoSchema = z.object({
  nome: z.string(),
  sections: spciPavimentoSectionsSchema,
});

export type SPCIPavimentoData = z.infer<typeof spciPavimentoSchema>;

// =====================================================
// SPCI BLOCO SCHEMA (includes nested pavimentos)
// =====================================================

const spciBlocoSectionsSchema = buildSectionsSchema(SPCI_PER_BLOCK_SECTIONS);

export const spciBlocoSchema = z.object({
  nome: z.string(),
  sections: spciBlocoSectionsSchema,
  pavimentos: z.array(spciPavimentoSchema),
});

export type SPCIBlocoData = z.infer<typeof spciBlocoSchema>;

// =====================================================
// SPCI CONFIG SCHEMA
// =====================================================

export const spciConfigSchema = z.object({
  quantidadeBlocos: z.number().min(1).max(20),
  quantidadePavimentos: z.number().min(1).max(50),
});

// =====================================================
// FULL SPCI FORM SCHEMA
// =====================================================

export const spciDynamicSchema = z.object({
  config: spciConfigSchema,
  global: buildSectionsSchema(SPCI_GLOBAL_SECTIONS),
  blocos: z.array(spciBlocoSchema),
});

export type SPCIDynamicFormData = z.infer<typeof spciDynamicSchema>;

// =====================================================
// DEFAULT VALUE GENERATORS
// =====================================================

function createSectionDefaults(sections: ChecklistSectionDef[]) {
  const result: Record<string, Record<string, any>> = {};
  for (const section of sections) {
    const sectionItems: Record<string, any> = { _customItems: [] };
    for (const item of section.items) {
      sectionItems[item.id] = { status: '', observacao: '' };
    }
    result[section.id] = sectionItems;
  }
  return result;
}

export function createSPCIPavimentoDefaults(index: number): SPCIPavimentoData {
  return {
    nome: getPavimentoLabel(index),
    sections: createSectionDefaults(SPCI_PER_FLOOR_SECTIONS) as SPCIPavimentoData['sections'],
  };
}

export function createSPCIBlocoDefaults(
  blocoIndex: number,
  quantidadePavimentos: number,
): SPCIBlocoData {
  return {
    nome: getBlocoLabel(blocoIndex),
    sections: createSectionDefaults(SPCI_PER_BLOCK_SECTIONS) as SPCIBlocoData['sections'],
    pavimentos: Array.from({ length: quantidadePavimentos }, (_, i) =>
      createSPCIPavimentoDefaults(i),
    ),
  };
}

export function createSPCIFormDefaults(
  quantidadeBlocos: number,
  quantidadePavimentos: number,
): SPCIDynamicFormData {
  return {
    config: { quantidadeBlocos, quantidadePavimentos },
    global: createSectionDefaults(SPCI_GLOBAL_SECTIONS) as SPCIDynamicFormData['global'],
    blocos: Array.from({ length: quantidadeBlocos }, (_, i) =>
      createSPCIBlocoDefaults(i, quantidadePavimentos),
    ),
  };
}
