/**
 * SPCIPavimentoForm — Single SPCI Floor Renderer
 *
 * Renders all per-floor checklist sections for one floor within a block.
 * Uses useFormContext to bind to
 *   `blocos.{blocoIndex}.pavimentos.{pavimentoIndex}.sections.{sectionId}`.
 */

import { memo } from 'react';
import { SPCI_PER_FLOOR_SECTIONS } from '../schemas/checklist-definitions';
import { ChecklistSectionRenderer } from './checklist-section-renderer';

interface SPCIPavimentoFormProps {
  blocoIndex: number;
  pavimentoIndex: number;
  readOnly?: boolean;
}

export const SPCIPavimentoForm = memo(function SPCIPavimentoForm({
  blocoIndex,
  pavimentoIndex,
  readOnly = false,
}: SPCIPavimentoFormProps) {
  return (
    <div className="space-y-3">
      {SPCI_PER_FLOOR_SECTIONS.map((section) => (
        <ChecklistSectionRenderer
          key={section.id}
          section={section}
          fieldPrefix={`blocos.${blocoIndex}.pavimentos.${pavimentoIndex}.sections.${section.id}`}
          readOnly={readOnly}
          defaultCollapsed
          replicationScope={{ type: 'pavimento', blocoIdx: blocoIndex, pavIdx: pavimentoIndex, formType: 'spci' }}
        />
      ))}
    </div>
  );
});
