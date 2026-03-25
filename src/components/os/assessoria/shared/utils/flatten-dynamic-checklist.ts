/**
 * Flatten Dynamic Checklist — Utility
 *
 * Transforms the nested SPDA/SPCI dynamic form data into the flat
 * ChecklistItem[] array expected by the PDF template (visita-tecnica-template.tsx).
 *
 * Data flow:
 *   SPDADynamicFormData  → flat ChecklistItem[]
 *   SPCIDynamicFormData  → flat ChecklistItem[]
 */

import type { ChecklistItem, StatusItem } from '@/lib/pdf/templates/visita-tecnica-template';
import type { ChecklistItemValues } from '../schemas/spda-dynamic-schema';
import type { SPDADynamicFormData } from '../schemas/spda-dynamic-schema';
import type { SPCIDynamicFormData } from '../schemas/spci-dynamic-schema';
import {
  SPDA_GLOBAL_SECTIONS,
  SPDA_PER_BLOCK_SECTIONS,
  SPCI_GLOBAL_SECTIONS,
  SPCI_PER_BLOCK_SECTIONS,
  SPCI_PER_FLOOR_SECTIONS,
  type ChecklistSectionDef,
} from '../schemas/checklist-definitions';
import { RECEBIMENTO_IMOVEL_SECTIONS } from '../schemas/recebimento-imovel-definitions';
import type { ChecklistRecebimentoData } from '../components/checklist-recebimento-table';

// =====================================================
// HELPERS
// =====================================================

/**
 * Extracts ChecklistItem[] from a sections record (keyed by sectionId → itemId → values).
 * Uses the section definitions to recover the human-readable labels.
 */
function extractItemsFromSections(
  sectionsData: Record<string, any>,
  sectionDefs: ChecklistSectionDef[],
  blocoLabel: string,
): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  for (const sectionDef of sectionDefs) {
    const sectionData = sectionsData[sectionDef.id];
    if (!sectionData) continue;

    // 1. Extrair os itens estáticos (definidos no checklist-definitions)
    for (const itemDef of sectionDef.items) {
      const itemData = sectionData[itemDef.id];
      if (!itemData || !itemData.status) continue;

      items.push({
        id: itemDef.id,
        bloco: blocoLabel,
        secao: sectionDef.titulo,
        label: itemDef.label,
        status: itemData.status as StatusItem,
        observacao: itemData.observacao || undefined,
        fotos: itemData.fotos || [],
      });
    }

    // 2. Extrair as linhas dinâmicas (criadas pelo usuário)
    if (sectionData._customItems && Array.isArray(sectionData._customItems)) {
      for (const customItem of sectionData._customItems) {
        if (!customItem || !customItem.status) continue;

        items.push({
          id: customItem.id,
          bloco: blocoLabel,
          secao: sectionDef.titulo,
          label: `${customItem.label} [Extra]`,
          status: customItem.status as StatusItem,
          observacao: customItem.observacao || undefined,
          fotos: customItem.fotos || [],
        });
      }
    }
  }

  return items;
}

// =====================================================
// SPDA FLATTENER
// =====================================================

export function flattenSPDAChecklist(
  data: SPDADynamicFormData,
): { items: ChecklistItem[]; estatisticas: { total: number; conformes: number; naoConformes: number; naoAplica: number } } {
  const allItems: ChecklistItem[] = [];

  // 1. Global sections → labeled as "Geral"
  const globalData = data.global as unknown as Record<string, Record<string, ChecklistItemValues>>;
  allItems.push(...extractItemsFromSections(globalData, SPDA_GLOBAL_SECTIONS, 'Geral'));

  // 2. Per-block sections → labeled as "Bloco A", "Bloco B", etc.
  for (const bloco of data.blocos) {
    const blocoSections = bloco.sections as unknown as Record<string, Record<string, ChecklistItemValues>>;
    allItems.push(...extractItemsFromSections(blocoSections, SPDA_PER_BLOCK_SECTIONS, bloco.nome));
  }

  // 3. Compute statistics
  const estatisticas = computeStatistics(allItems);

  return { items: allItems, estatisticas };
}

// =====================================================
// SPCI FLATTENER
// =====================================================

export function flattenSPCIChecklist(
  data: SPCIDynamicFormData,
): { items: ChecklistItem[]; estatisticas: { total: number; conformes: number; naoConformes: number; naoAplica: number } } {
  const allItems: ChecklistItem[] = [];

  // 1. Global sections → labeled as "Geral"
  const globalData = data.global as unknown as Record<string, Record<string, ChecklistItemValues>>;
  allItems.push(...extractItemsFromSections(globalData, SPCI_GLOBAL_SECTIONS, 'Geral'));

  // 2. Per-block sections + per-floor sections
  for (const bloco of data.blocos) {
    // 2a. Block-level sections (e.g. Saídas de Emergência) → labeled "Bloco A"
    const blocoSections = bloco.sections as unknown as Record<string, Record<string, ChecklistItemValues>>;
    allItems.push(...extractItemsFromSections(blocoSections, SPCI_PER_BLOCK_SECTIONS, bloco.nome));

    // 2b. Floor-level sections → labeled "Bloco A — Pavimento 1"
    for (const pavimento of bloco.pavimentos) {
      const pavSections = pavimento.sections as unknown as Record<string, Record<string, ChecklistItemValues>>;
      const floorLabel = `${bloco.nome} — ${pavimento.nome}`;
      allItems.push(...extractItemsFromSections(pavSections, SPCI_PER_FLOOR_SECTIONS, floorLabel));
    }
  }

  // 3. Compute statistics
  const estatisticas = computeStatistics(allItems);

  return { items: allItems, estatisticas };
}

// =====================================================
// RECEBIMENTO DE IMÓVEL FLATTENER
// =====================================================

export function flattenRecebimentoImovelChecklist(
  data: ChecklistRecebimentoData,
): { items: ChecklistItem[]; estatisticas: { total: number; conformes: number; naoConformes: number; naoAplica: number } } {
  const allItems: ChecklistItem[] = [];

  for (const sectionDef of RECEBIMENTO_IMOVEL_SECTIONS) {
    for (const itemDef of sectionDef.items) {
      const itemData = data.items?.[itemDef.id];
      if (!itemData || !itemData.status) continue;

      allItems.push({
        id: itemDef.id,
        bloco: sectionDef.titulo, // Section title maps to the "bloco" visually in PDF
        secao: sectionDef.titulo,
        label: itemDef.label,
        status: itemData.status as StatusItem,
        observacao: itemData.observacao || undefined,
        fotos: itemData.fotos || [],
      });
    }
  }

  const estatisticas = computeStatistics(allItems);

  return { items: allItems, estatisticas };
}

// =====================================================
// STATISTICS CALCULATOR
// =====================================================

function computeStatistics(items: ChecklistItem[]) {
  let conformes = 0;
  let naoConformes = 0;
  let naoAplica = 0;

  for (const item of items) {
    switch (item.status) {
      case 'C':
        conformes++;
        break;
      case 'NC':
        naoConformes++;
        break;
      case 'NA':
        naoAplica++;
        break;
    }
  }

  return {
    total: items.length,
    conformes,
    naoConformes,
    naoAplica,
  };
}
