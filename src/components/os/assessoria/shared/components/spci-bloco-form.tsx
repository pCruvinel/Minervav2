/**
 * SPCIBlocoForm — Single SPCI Block Renderer
 *
 * Renders a block's content:
 *  1. Block-level section: Saídas de Emergência
 *  2. Sub-tabs for each floor (Pavimento 1, 2, etc.)
 *
 * Uses useFormContext to bind to `blocos.{blocoIndex}.sections` and
 * delegates floor rendering to SPCIPavimentoForm.
 */

import { memo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  SPCI_PER_BLOCK_SECTIONS,
  getPavimentoLabel,
} from '../schemas/checklist-definitions';
import type { SPCIDynamicFormData } from '../schemas/spci-dynamic-schema';
import { ChecklistSectionRenderer } from './checklist-section-renderer';
import { SPCIPavimentoForm } from './spci-pavimento-form';

interface SPCIBlocoFormProps {
  blocoIndex: number;
  readOnly?: boolean;
}

export const SPCIBlocoForm = memo(function SPCIBlocoForm({
  blocoIndex,
  readOnly = false,
}: SPCIBlocoFormProps) {
  const { control } = useFormContext<SPCIDynamicFormData>();
  const pavimentos = useWatch({ control, name: `blocos.${blocoIndex}.pavimentos` as const });
  const [activePavimento, setActivePavimento] = useState('pav-0');

  return (
    <div className="space-y-6">
      {/* Block-level sections (Saídas de Emergência) */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
          Seções do Bloco
        </h4>
        <div className="space-y-3">
          {SPCI_PER_BLOCK_SECTIONS.map((section) => (
            <ChecklistSectionRenderer
              key={section.id}
              section={section}
              fieldPrefix={`blocos.${blocoIndex}.sections.${section.id}`}
              readOnly={readOnly}
              replicationScope={{ type: 'bloco', blocoIdx: blocoIndex, formType: 'spci' }}
            />
          ))}
        </div>
      </div>

      {/* Floor sub-tabs */}
      {pavimentos && pavimentos.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Pavimentos
          </h4>
          <Tabs value={activePavimento} onValueChange={setActivePavimento}>
            <TabsList className="flex-wrap h-auto gap-1">
              {pavimentos.map((_, pavIndex) => (
                <TabsTrigger
                  key={`pav-${pavIndex}`}
                  value={`pav-${pavIndex}`}
                  className="text-xs"
                >
                  {getPavimentoLabel(pavIndex)}
                </TabsTrigger>
              ))}
            </TabsList>

            {pavimentos.map((_, pavIndex) => (
              <TabsContent key={`pav-${pavIndex}`} value={`pav-${pavIndex}`}>
                <SPCIPavimentoForm
                  blocoIndex={blocoIndex}
                  pavimentoIndex={pavIndex}
                  readOnly={readOnly}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
});
