/**
 * ChecklistSectionRenderer — Generic Section Table
 *
 * Renders a single checklist section as a collapsible table,
 * bound to react-hook-form via useFormContext.
 *
 * Used by both SPDABlocoForm and SPCIPavimentoForm to render
 * individual sections without duplicating table UI logic.
 */

import { memo, useState, useMemo } from 'react';
import { useParams } from '@tanstack/react-router';
import { useFormContext, Controller, useWatch, useFieldArray } from 'react-hook-form';
import { AddCustomItemButton } from './add-custom-item-button';
import { PhotoUploadDialog } from './checklist-recebimento-table';
import { type ReplicationScope } from '../hooks/use-dynamic-line-replication';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
  ChevronDown,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import type { ChecklistSectionDef } from '../schemas/checklist-definitions';

// =====================================================
// STATUS OPTIONS (reusable)
// =====================================================

const STATUS_OPTIONS = [
  { value: 'C', label: 'Conforme', icon: CheckCircle2, className: 'text-success' },
  { value: 'NC', label: 'Não Conforme', icon: AlertTriangle, className: 'text-destructive' },
  { value: 'NA', label: 'Não se Aplica', icon: MinusCircle, className: 'text-muted-foreground' },
] as const;

// =====================================================
// TYPES
// =====================================================

interface ChecklistSectionRendererProps {
  /** The section definition (items to render) */
  section: ChecklistSectionDef;
  /** react-hook-form field path prefix (e.g., "blocos.0.sections.captacao") */
  fieldPrefix: string;
  /** Whether the form is read-only */
  readOnly?: boolean;
  /** Start collapsed? Default: false (expanded) */
  defaultCollapsed?: boolean;
  /** To enable dynamic line replication */
  replicationScope?: ReplicationScope;
}

// =====================================================
// COMPONENT
// =====================================================

export const ChecklistSectionRenderer = memo(function ChecklistSectionRenderer({
  section,
  fieldPrefix,
  readOnly = false,
  defaultCollapsed = false,
  replicationScope,
}: ChecklistSectionRendererProps) {
  const [expanded, setExpanded] = useState(!defaultCollapsed);
  const { control } = useFormContext();
  const { osId } = useParams({ strict: false }) as { osId?: string };

  const customItemsArray = useFieldArray({
    control,
    name: `${fieldPrefix}._customItems`,
  });

  // useWatch instead of watch — only re-renders when THIS section's data changes
  const sectionData = useWatch({ control, name: fieldPrefix });

  const stats = useMemo(() => {
    let conformes = 0;
    let naoConformes = 0;
    let naoAplica = 0;
    let pendentes = 0;

    if (sectionData) {
      for (const item of section.items) {
        const itemData = sectionData[item.id];
        if (!itemData || !itemData.status) {
          pendentes++;
        } else {
          switch (itemData.status) {
            case 'C': conformes++; break;
            case 'NC': naoConformes++; break;
            case 'NA': naoAplica++; break;
            default: pendentes++;
          }
        }
      }
      if (sectionData._customItems) {
        for (const itemData of sectionData._customItems) {
          if (!itemData || !itemData.status) {
            pendentes++;
          } else {
            switch (itemData.status) {
              case 'C': conformes++; break;
              case 'NC': naoConformes++; break;
              case 'NA': naoAplica++; break;
              default: pendentes++;
            }
          }
        }
      }
    } else {
      pendentes = section.items.length;
    }

    return { conformes, naoConformes, naoAplica, pendentes };
  }, [sectionData, section.items]);

  const hasNonConformes = stats.naoConformes > 0;
  const isComplete = stats.pendentes === 0;

  return (
    <div
      className={cn(
        'border rounded-lg overflow-hidden',
        hasNonConformes && 'border-destructive/40',
        isComplete && !hasNonConformes && 'border-success/40',
      )}
    >
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 text-left',
          'hover:bg-muted/50 transition-colors',
          hasNonConformes && 'bg-destructive/5',
          isComplete && !hasNonConformes && 'bg-success/5',
        )}
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium text-sm">{section.titulo}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {stats.conformes > 0 && (
            <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
              {stats.conformes}C
            </Badge>
          )}
          {stats.naoConformes > 0 && (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
              {stats.naoConformes}NC
            </Badge>
          )}
          {stats.naoAplica > 0 && (
            <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
              {stats.naoAplica}N/A
            </Badge>
          )}
          {stats.pendentes > 0 && (
            <Badge variant="outline" className="text-muted-foreground text-xs">
              {stats.pendentes} pendentes
            </Badge>
          )}
        </div>
      </button>

      {/* Items table */}
      {expanded && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[40%]">Item</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[35%]">Observação</TableHead>
                <TableHead className="w-[80px] text-center">Fotos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {section.items.map((item) => (
                <ChecklistItemRow
                  key={item.id}
                  itemId={item.id}
                  label={item.label}
                  descricao={item.descricao}
                  fieldPrefix={fieldPrefix}
                  readOnly={readOnly}
                  osId={osId}
                />
              ))}
              {customItemsArray.fields.map((field, index) => (
                <CustomItemRow
                  key={field.id}
                  index={index}
                  fieldPrefix={fieldPrefix}
                  readOnly={readOnly}
                  onRemove={() => customItemsArray.remove(index)}
                  osId={osId}
                />
              ))}
            </TableBody>
          </Table>
          {!readOnly && replicationScope && (
            <div className="p-3 bg-muted/10 border-t border-dashed">
              <AddCustomItemButton scope={replicationScope} sectionId={section.id} />
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// =====================================================
// ITEM ROW (memoized for performance)
// =====================================================

interface ChecklistItemRowProps {
  itemId: string;
  label: string;
  descricao?: string;
  fieldPrefix: string;
  readOnly: boolean;
  osId?: string;
}

const ChecklistItemRow = memo(function ChecklistItemRow({
  itemId,
  label,
  descricao,
  fieldPrefix,
  readOnly,
  osId,
}: ChecklistItemRowProps) {
  const { control } = useFormContext();

  const statusPath = `${fieldPrefix}.${itemId}.status` as const;
  const observacaoPath = `${fieldPrefix}.${itemId}.observacao` as const;
  const fotosPath = `${fieldPrefix}.${itemId}.fotos` as const;

  // useWatch scoped to individual fields — only THIS row re-renders
  const currentStatus = useWatch({ control, name: statusPath });
  const currentObservacao = useWatch({ control, name: observacaoPath });
  const isNaoConforme = currentStatus === 'NC';
  const needsObservacao = isNaoConforme && !(currentObservacao || '').trim();

  return (
    <TableRow
      className={cn(
        isNaoConforme && 'bg-destructive/5',
        needsObservacao && 'bg-destructive/10',
      )}
    >
      {/* Item label */}
      <TableCell className="py-2">
        <div>
          <p className="font-medium text-sm">{label}</p>
          {descricao && (
            <p className="text-xs text-muted-foreground">{descricao}</p>
          )}
        </div>
      </TableCell>

      {/* Status select */}
      <TableCell className="py-2">
        <Controller
          name={statusPath}
          control={control}
          render={({ field }) => (
            <Select
              value={field.value || undefined}
              onValueChange={field.onChange}
              disabled={readOnly}
            >
              <SelectTrigger
                className={cn(
                  'h-8 text-xs',
                  field.value === 'C' && 'text-success border-success/50',
                  field.value === 'NC' && 'text-destructive border-destructive/50',
                  field.value === 'NA' && 'text-muted-foreground',
                )}
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className={cn('flex items-center gap-1.5', opt.className)}>
                      <opt.icon className="h-3.5 w-3.5" />
                      {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </TableCell>

      {/* Observação input */}
      <TableCell className="py-2">
        <Controller
          name={observacaoPath}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value || ''}
              placeholder={isNaoConforme ? 'Obrigatório para NC *' : 'Opcional...'}
              disabled={readOnly}
              className={cn(
                'h-8 text-xs',
                needsObservacao && 'border-destructive placeholder:text-destructive/70',
              )}
            />
          )}
        />
      </TableCell>

      {/* Fotos Upload */}
      <TableCell className="py-2 text-center">
        <Controller
          name={fotosPath}
          control={control}
          render={({ field }) => (
            <PhotoUploadDialog
                itemId={itemId}
                itemLabel={label}
                fotos={field.value || []}
                onFotosChange={field.onChange}
                disabled={readOnly}
                osId={osId}
            />
          )}
        />
      </TableCell>
    </TableRow>
  );
});

// =====================================================
// CUSTOM ITEM ROW (memoized)
// =====================================================

interface CustomItemRowProps {
  index: number;
  fieldPrefix: string;
  readOnly: boolean;
  onRemove: () => void;
  osId?: string;
}

const CustomItemRow = memo(function CustomItemRow({
  index,
  fieldPrefix,
  readOnly,
  onRemove,
  osId,
}: CustomItemRowProps) {
  const { control, getValues } = useFormContext();

  const basePath = `${fieldPrefix}._customItems.${index}`;
  const statusPath = `${basePath}.status` as const;
  const observacaoPath = `${basePath}.observacao` as const;
  const fotosPath = `${basePath}.fotos` as const;
  
  const label = getValues(`${basePath}.label`);

  // useWatch scoped to individual fields — only THIS row re-renders
  const currentStatus = useWatch({ control, name: statusPath });
  const currentObservacao = useWatch({ control, name: observacaoPath });
  const isNaoConforme = currentStatus === 'NC';
  const needsObservacao = isNaoConforme && !(currentObservacao || '').trim();

  return (
    <TableRow
      className={cn(
        isNaoConforme && 'bg-destructive/5',
        needsObservacao && 'bg-destructive/10',
      )}
    >
      {/* Item label */}
      <TableCell className="py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{label}</p>
            <Badge variant="secondary" className="text-[10px] py-0 h-4 uppercase">Extra</Badge>
          </div>
          {!readOnly && (
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive" onClick={onRemove} title="Remover">
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </TableCell>

      {/* Status select */}
      <TableCell className="py-2">
        <Controller
          name={statusPath}
          control={control}
          render={({ field }) => (
            <Select
              value={field.value || undefined}
              onValueChange={field.onChange}
              disabled={readOnly}
            >
              <SelectTrigger
                className={cn(
                  'h-8 text-xs',
                  field.value === 'C' && 'text-success border-success/50',
                  field.value === 'NC' && 'text-destructive border-destructive/50',
                  field.value === 'NA' && 'text-muted-foreground',
                )}
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className={cn('flex items-center gap-1.5', opt.className)}>
                      <opt.icon className="h-3.5 w-3.5" />
                      {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </TableCell>

      {/* Observação input */}
      <TableCell className="py-2">
        <Controller
          name={observacaoPath}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value || ''}
              placeholder={isNaoConforme ? 'Obrigatório para NC *' : 'Opcional...'}
              disabled={readOnly}
              className={cn(
                'h-8 text-xs',
                needsObservacao && 'border-destructive placeholder:text-destructive/70',
              )}
            />
          )}
        />
      </TableCell>
      
      {/* Fotos Upload */}
      <TableCell className="py-2 text-center">
        <Controller
          name={fotosPath}
          control={control}
          render={({ field }) => (
            <PhotoUploadDialog
                itemId={basePath}
                itemLabel={label}
                fotos={field.value || []}
                onFotosChange={field.onChange}
                disabled={readOnly}
                osId={osId}
            />
          )}
        />
      </TableCell>
    </TableRow>
  );
});
