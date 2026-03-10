/**
 * Checklist de Recebimento de Imóvel (Áreas Comuns) - Formato Tabela
 *
 * Renderiza o checklist de inspeção de áreas comuns do condomínio
 * em formato de tabelas agrupadas por seção.
 *
 * Reutiliza os componentes base de ChecklistRecebimentoTable:
 * - ChecklistBlocoTable (seção renderizada como tabela colapsável)
 * - PhotoUploadDialog (upload de fotos por item)
 * - STATUS_OPTIONS (C / NC / NA)
 *
 * Compartilhado entre OS-08 e OS-11.
 */

import { useMemo, useCallback } from 'react';
import {
  ChecklistBlocoTable,
  type ChecklistItemData,
  type ChecklistRecebimentoData,
} from './checklist-recebimento-table';
import { RECEBIMENTO_IMOVEL_SECTIONS } from '../schemas/recebimento-imovel-definitions';

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

interface ChecklistRecebimentoImovelTableProps {
  data: ChecklistRecebimentoData;
  onChange: (data: ChecklistRecebimentoData) => void;
  readOnly?: boolean;
  osId?: string;
}

export function ChecklistRecebimentoImovelTable({
  data,
  onChange,
  readOnly,
  osId,
}: ChecklistRecebimentoImovelTableProps) {
  // Inicializar dados de itens se não existirem
  const getItemData = useCallback(
    (itemId: string): ChecklistItemData => {
      return (
        data.items[itemId] || {
          id: itemId,
          status: '',
          observacao: '',
          fotos: [],
        }
      );
    },
    [data.items],
  );

  const handleItemChange = useCallback(
    (itemId: string, itemData: ChecklistItemData) => {
      onChange({
        ...data,
        items: {
          ...data.items,
          [itemId]: itemData,
        },
      });
    },
    [data, onChange],
  );

  // Estatísticas globais
  const globalStats = useMemo(() => {
    let total = 0;
    let conformes = 0;
    let naoConformes = 0;

    RECEBIMENTO_IMOVEL_SECTIONS.forEach((section) => {
      section.items.forEach((item) => {
        total++;
        const itemData = getItemData(item.id);
        if (itemData.status === 'C') conformes++;
        if (itemData.status === 'NC') naoConformes++;
      });
    });

    return { total, conformes, naoConformes };
  }, [data.items, getItemData]);

  return (
    <div className="space-y-4">
      {/* Header com estatísticas globais */}
      <div className="bg-muted/30 border rounded-lg p-4">
        <h3 className="font-semibold mb-3">
          Checklist de Recebimento de Imóvel — Áreas Comuns
        </h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span>
              Conformes: <strong>{globalStats.conformes}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span>
              Não Conformes: <strong>{globalStats.naoConformes}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground" />
            <span>
              Total: <strong>{globalStats.total}</strong> itens
            </span>
          </div>
        </div>
      </div>

      {/* Seções de tabelas */}
      <div className="space-y-3">
        {RECEBIMENTO_IMOVEL_SECTIONS.map((section) => (
          <ChecklistBlocoTable
            key={section.id}
            bloco={section}
            getItemData={getItemData}
            onItemChange={handleItemChange}
            readOnly={readOnly}
            osId={osId}
          />
        ))}
      </div>
    </div>
  );
}
