/**
 * SPDABlocoForm — Single SPDA Block Renderer
 *
 * Renders all per-block checklist sections for one SPDA block.
 * Uses useFormContext to bind to `blocos.{blocoIndex}.sections.{sectionId}`.
 */

import { memo } from 'react';
import { SPDA_PER_BLOCK_SECTIONS } from '../schemas/checklist-definitions';
import { ChecklistSectionRenderer } from './checklist-section-renderer';

interface SPDABlocoFormProps {
  blocoIndex: number;
  readOnly?: boolean;
}

export const SPDABlocoForm = memo(function SPDABlocoForm({
  blocoIndex,
  readOnly = false,
}: SPDABlocoFormProps) {
  return (
    <div className="space-y-3">
      {SPDA_PER_BLOCK_SECTIONS.map((section) => (
        <ChecklistSectionRenderer
          key={section.id}
          section={section}
          fieldPrefix={`blocos.${blocoIndex}.sections.${section.id}`}
          readOnly={readOnly}
          defaultCollapsed
          replicationScope={{ type: 'bloco', blocoIdx: blocoIndex, formType: 'spda' }}
        />
      ))}
    </div>
  );
});
