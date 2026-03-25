/**
 * SPDA Dynamic Schema — Zod + react-hook-form
 *
 * Data model for SPDA inspection with block multipliers.
 * Each block gets its own copy of per-block checklist sections.
 * Global sections are evaluated once for the whole building.
 */

import { z } from 'zod';
import {
  SPDA_GLOBAL_SECTIONS,
  SPDA_PER_BLOCK_SECTIONS,
  getBlocoLabel,
  type ChecklistSectionDef,
} from './checklist-definitions';

// =====================================================
// BASE SCHEMA: Single checklist item values
// =====================================================

export const checklistItemValuesSchema = z.object({
  status: z.union([z.literal('C'), z.literal('NC'), z.literal('NA'), z.literal('')]),
  observacao: z.string(),
  fotos: z.array(z.any()).optional(),
});

export type ChecklistItemValues = z.infer<typeof checklistItemValuesSchema>;

export const customItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'A descrição é obrigatória'),
  origin: z.literal('user'),
  createdAt: z.string(),
  status: z.union([z.literal('C'), z.literal('NC'), z.literal('NA'), z.literal('')]),
  observacao: z.string(),
  fotos: z.array(z.any()).optional(),
});

export type CustomItemData = z.infer<typeof customItemSchema>;

// =====================================================
// HELPER: Build a record schema from section definitions
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
// SPDA BLOCO SCHEMA
// =====================================================

const spdaBlocoSectionsSchema = buildSectionsSchema(SPDA_PER_BLOCK_SECTIONS);

export const spdaBlocoSchema = z.object({
  nome: z.string(),
  sections: spdaBlocoSectionsSchema,
});

export type SPDABlocoData = z.infer<typeof spdaBlocoSchema>;

// =====================================================
// SPDA CONFIG SCHEMA
// =====================================================

export const spdaConfigSchema = z.object({
  quantidadeBlocos: z.number().min(1).max(20),
});

// =====================================================
// FULL SPDA FORM SCHEMA
// =====================================================

export const spdaDynamicSchema = z.object({
  config: spdaConfigSchema,
  global: buildSectionsSchema(SPDA_GLOBAL_SECTIONS),
  blocos: z.array(spdaBlocoSchema),
});

export type SPDADynamicFormData = z.infer<typeof spdaDynamicSchema>;

// =====================================================
// DEFAULT VALUE GENERATORS
// =====================================================

function createSectionDefaults(sections: ChecklistSectionDef[]) {
  const result: Record<string, Record<string, any>> = {};
  for (const section of sections) {
    const sectionItems: Record<string, any> = {
      _customItems: [],
    };
    for (const item of section.items) {
      sectionItems[item.id] = { status: '', observacao: '', fotos: [] };
    }
    result[section.id] = sectionItems;
  }
  return result;
}

export function createSPDABlocoDefaults(index: number): SPDABlocoData {
  return {
    nome: getBlocoLabel(index),
    sections: createSectionDefaults(SPDA_PER_BLOCK_SECTIONS) as SPDABlocoData['sections'],
  };
}

export function createSPDAFormDefaults(quantidadeBlocos: number): SPDADynamicFormData {
  return {
    config: { quantidadeBlocos },
    global: createSectionDefaults(SPDA_GLOBAL_SECTIONS) as SPDADynamicFormData['global'],
    blocos: Array.from({ length: quantidadeBlocos }, (_, i) => createSPDABlocoDefaults(i)),
  };
}
