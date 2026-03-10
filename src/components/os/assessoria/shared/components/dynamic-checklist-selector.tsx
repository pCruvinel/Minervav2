/**
 * DynamicChecklistSelector — Orchestrator Component
 *
 * Central intelligent component that:
 * 1. Shows config inputs based on finalidadeInspecao (SPDA or SPCI)
 * 2. On "Gerar Formulários", initializes useForm with the correct Zod schema
 * 3. Renders the dynamic form with Tab-based navigation per block
 * 4. Wraps everything in FormProvider for child components
 *
 * Performance:
 * - Only the active tab's content is mounted (Radix Tabs default behavior)
 * - All sub-components are React.memo'd
 * - Global sections rendered outside the tab array
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Building2,
  Layers,
  Zap,
  Flame,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

import {
  SPDA_GLOBAL_SECTIONS,
  SPCI_GLOBAL_SECTIONS,
  getBlocoLabel,
} from '../schemas/checklist-definitions';
import {
  spdaDynamicSchema,
  createSPDAFormDefaults,
  type SPDADynamicFormData,
} from '../schemas/spda-dynamic-schema';
import {
  spciDynamicSchema,
  createSPCIFormDefaults,
  type SPCIDynamicFormData,
} from '../schemas/spci-dynamic-schema';
import { ChecklistSectionRenderer } from './checklist-section-renderer';
import { SPDABlocoForm } from './spda-bloco-form';
import { SPCIBlocoForm } from './spci-bloco-form';

import type { FinalidadeInspecao } from '../types/visita-tecnica-types';

// =====================================================
// TYPES
// =====================================================

interface DynamicChecklistSelectorProps {
  /** The selected inspection purpose (laudo_spda or laudo_spci) */
  finalidadeInspecao: Extract<FinalidadeInspecao, 'laudo_spda' | 'laudo_spci'>;
  /** Called when form data changes (for external save logic) */
  onDataChange?: (data: SPDADynamicFormData | SPCIDynamicFormData) => void;
  /** Whether the form is read-only */
  readOnly?: boolean;
  /** Initial data to populate (for editing/resuming) */
  initialData?: SPDADynamicFormData | SPCIDynamicFormData;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function DynamicChecklistSelector({
  finalidadeInspecao,
  onDataChange,
  readOnly = false,
  initialData,
}: DynamicChecklistSelectorProps) {
  const isSPDA = finalidadeInspecao === 'laudo_spda';
  const isSPCI = finalidadeInspecao === 'laudo_spci';

  // Config state (before form generation)
  const [quantidadeBlocos, setQuantidadeBlocos] = useState<number>(
    initialData?.config?.quantidadeBlocos ?? 1,
  );
  const [quantidadePavimentos, setQuantidadePavimentos] = useState<number>(
    isSPCI ? ((initialData as SPCIDynamicFormData)?.config?.quantidadePavimentos ?? 1) : 1,
  );
  const [isGenerated, setIsGenerated] = useState(!!initialData);

  if (isSPDA) {
    return (
      <SPDADynamicForm
        quantidadeBlocos={quantidadeBlocos}
        setQuantidadeBlocos={setQuantidadeBlocos}
        isGenerated={isGenerated}
        setIsGenerated={setIsGenerated}
        onDataChange={onDataChange as ((data: SPDADynamicFormData) => void) | undefined}
        readOnly={readOnly}
        initialData={initialData as SPDADynamicFormData | undefined}
      />
    );
  }

  if (isSPCI) {
    return (
      <SPCIDynamicForm
        quantidadeBlocos={quantidadeBlocos}
        setQuantidadeBlocos={setQuantidadeBlocos}
        quantidadePavimentos={quantidadePavimentos}
        setQuantidadePavimentos={setQuantidadePavimentos}
        isGenerated={isGenerated}
        setIsGenerated={setIsGenerated}
        onDataChange={onDataChange as ((data: SPCIDynamicFormData) => void) | undefined}
        readOnly={readOnly}
        initialData={initialData as SPCIDynamicFormData | undefined}
      />
    );
  }

  return null;
}

// =====================================================
// SPDA DYNAMIC FORM
// =====================================================

interface SPDADynamicFormProps {
  quantidadeBlocos: number;
  setQuantidadeBlocos: (n: number) => void;
  isGenerated: boolean;
  setIsGenerated: (v: boolean) => void;
  onDataChange?: (data: SPDADynamicFormData) => void;
  readOnly?: boolean;
  initialData?: SPDADynamicFormData;
}

function SPDADynamicForm({
  quantidadeBlocos,
  setQuantidadeBlocos,
  isGenerated,
  setIsGenerated,
  onDataChange,
  readOnly = false,
  initialData,
}: SPDADynamicFormProps) {
  const [activeTab, setActiveTab] = useState('global');

  const methods = useForm<SPDADynamicFormData>({
    resolver: zodResolver(spdaDynamicSchema),
    defaultValues: initialData ?? createSPDAFormDefaults(quantidadeBlocos),
    mode: 'onBlur',
  });

  const { fields: blocoFields } = useFieldArray({
    control: methods.control,
    name: 'blocos',
  });

  const handleGenerate = useCallback(() => {
    const defaults = createSPDAFormDefaults(quantidadeBlocos);
    methods.reset(defaults);
    setIsGenerated(true);
    setActiveTab('global');
  }, [quantidadeBlocos, methods, setIsGenerated]);

  const handleRegenerate = useCallback(() => {
    setIsGenerated(false);
  }, [setIsGenerated]);

  // Notify parent on changes via subscription (does NOT trigger re-renders)
  const onDataChangeRef = useRef(onDataChange);
  onDataChangeRef.current = onDataChange;
  useEffect(() => {
    if (!isGenerated || !onDataChangeRef.current) return;
    const subscription = methods.watch(() => {
      onDataChangeRef.current?.(methods.getValues());
    });
    return () => subscription.unsubscribe();
  }, [isGenerated, methods]);

  return (
    <div className="space-y-6">
      {/* Config card */}
      <ConfigCard
        icon={<Zap className="h-5 w-5 text-amber-500" />}
        title="Configuração SPDA"
        subtitle="Sistema de Proteção contra Descargas Atmosféricas"
        color="amber"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="spda-blocos" className="text-sm font-medium">
              <Building2 className="inline h-4 w-4 mr-1" />
              Quantos blocos na edificação?
            </Label>
            <Input
              id="spda-blocos"
              type="number"
              min={1}
              max={20}
              value={quantidadeBlocos}
              onChange={(e) => setQuantidadeBlocos(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={readOnly || isGenerated}
              className="max-w-[120px]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          {!isGenerated ? (
            <Button onClick={handleGenerate} disabled={readOnly}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Gerar Formulários
            </Button>
          ) : (
            <>
              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                {blocoFields.length} bloco(s) gerado(s)
              </Badge>
              {!readOnly && (
                <Button variant="outline" size="sm" onClick={handleRegenerate}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Reconfigurar
                </Button>
              )}
            </>
          )}
        </div>
      </ConfigCard>

      {/* Dynamic form */}
      {isGenerated && (
        <FormProvider {...methods}>
          <form className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex-wrap h-auto gap-1">
                <TabsTrigger value="global" className="text-xs">
                  📋 Global
                </TabsTrigger>
                {blocoFields.map((field, index) => (
                  <TabsTrigger key={field.id} value={`bloco-${index}`} className="text-xs">
                    <Building2 className="h-3.5 w-3.5 mr-1" />
                    {getBlocoLabel(index)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Global tab */}
              <TabsContent value="global">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Seções Globais (toda a edificação)
                  </h3>
                  {SPDA_GLOBAL_SECTIONS.map((section) => (
                    <ChecklistSectionRenderer
                      key={section.id}
                      section={section}
                      fieldPrefix={`global.${section.id}`}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* Block tabs */}
              {blocoFields.map((field, index) => (
                <TabsContent key={field.id} value={`bloco-${index}`}>
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      {getBlocoLabel(index)} — Seções por Bloco
                    </h3>
                    <SPDABlocoForm blocoIndex={index} readOnly={readOnly} />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </form>
        </FormProvider>
      )}
    </div>
  );
}

// =====================================================
// SPCI DYNAMIC FORM
// =====================================================

interface SPCIDynamicFormProps {
  quantidadeBlocos: number;
  setQuantidadeBlocos: (n: number) => void;
  quantidadePavimentos: number;
  setQuantidadePavimentos: (n: number) => void;
  isGenerated: boolean;
  setIsGenerated: (v: boolean) => void;
  onDataChange?: (data: SPCIDynamicFormData) => void;
  readOnly?: boolean;
  initialData?: SPCIDynamicFormData;
}

function SPCIDynamicForm({
  quantidadeBlocos,
  setQuantidadeBlocos,
  quantidadePavimentos,
  setQuantidadePavimentos,
  isGenerated,
  setIsGenerated,
  onDataChange,
  readOnly = false,
  initialData,
}: SPCIDynamicFormProps) {
  const [activeTab, setActiveTab] = useState('global');

  const methods = useForm<SPCIDynamicFormData>({
    resolver: zodResolver(spciDynamicSchema),
    defaultValues: initialData ?? createSPCIFormDefaults(quantidadeBlocos, quantidadePavimentos),
    mode: 'onBlur',
  });

  const { fields: blocoFields } = useFieldArray({
    control: methods.control,
    name: 'blocos',
  });

  const handleGenerate = useCallback(() => {
    const defaults = createSPCIFormDefaults(quantidadeBlocos, quantidadePavimentos);
    methods.reset(defaults);
    setIsGenerated(true);
    setActiveTab('global');
  }, [quantidadeBlocos, quantidadePavimentos, methods, setIsGenerated]);

  const handleRegenerate = useCallback(() => {
    setIsGenerated(false);
  }, [setIsGenerated]);

  // Notify parent on changes via subscription (does NOT trigger re-renders)
  const onDataChangeRef = useRef(onDataChange);
  onDataChangeRef.current = onDataChange;
  useEffect(() => {
    if (!isGenerated || !onDataChangeRef.current) return;
    const subscription = methods.watch(() => {
      onDataChangeRef.current?.(methods.getValues());
    });
    return () => subscription.unsubscribe();
  }, [isGenerated, methods]);

  // Compute total items for info badge
  const totalItemsEstimate = useMemo(() => {
    const globalItems = SPCI_GLOBAL_SECTIONS.reduce((sum, s) => sum + s.items.length, 0);
    const blockItems = 7; // saídas de emergência
    const floorItems = 42; // 6 sections × ~7 items
    return globalItems + (quantidadeBlocos * blockItems) + (quantidadeBlocos * quantidadePavimentos * floorItems);
  }, [quantidadeBlocos, quantidadePavimentos]);

  return (
    <div className="space-y-6">
      {/* Config card */}
      <ConfigCard
        icon={<Flame className="h-5 w-5 text-red-500" />}
        title="Configuração SPCI"
        subtitle="Sistema de Proteção e Combate a Incêndio"
        color="red"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="spci-blocos" className="text-sm font-medium">
              <Building2 className="inline h-4 w-4 mr-1" />
              Quantos blocos na edificação?
            </Label>
            <Input
              id="spci-blocos"
              type="number"
              min={1}
              max={20}
              value={quantidadeBlocos}
              onChange={(e) => setQuantidadeBlocos(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={readOnly || isGenerated}
              className="max-w-[120px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spci-pavimentos" className="text-sm font-medium">
              <Layers className="inline h-4 w-4 mr-1" />
              Quantos pavimentos em cada bloco?
            </Label>
            <Input
              id="spci-pavimentos"
              type="number"
              min={1}
              max={50}
              value={quantidadePavimentos}
              onChange={(e) => setQuantidadePavimentos(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={readOnly || isGenerated}
              className="max-w-[120px]"
            />
          </div>
        </div>

        {/* Items estimate warning */}
        {!isGenerated && quantidadeBlocos > 0 && quantidadePavimentos > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Estimativa: ~{totalItemsEstimate} itens de checklist serão gerados
            ({quantidadeBlocos} bloco(s) × {quantidadePavimentos} pavimento(s))
          </p>
        )}

        <div className="flex items-center gap-3 mt-4">
          {!isGenerated ? (
            <Button onClick={handleGenerate} disabled={readOnly}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Gerar Formulários
            </Button>
          ) : (
            <>
              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                {blocoFields.length} bloco(s) × {quantidadePavimentos} pavimento(s)
              </Badge>
              {!readOnly && (
                <Button variant="outline" size="sm" onClick={handleRegenerate}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Reconfigurar
                </Button>
              )}
            </>
          )}
        </div>
      </ConfigCard>

      {/* Dynamic form */}
      {isGenerated && (
        <FormProvider {...methods}>
          <form className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex-wrap h-auto gap-1">
                <TabsTrigger value="global" className="text-xs">
                  📋 Global
                </TabsTrigger>
                {blocoFields.map((field, index) => (
                  <TabsTrigger key={field.id} value={`bloco-${index}`} className="text-xs">
                    <Building2 className="h-3.5 w-3.5 mr-1" />
                    {getBlocoLabel(index)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Global tab */}
              <TabsContent value="global">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Seções Globais (toda a edificação)
                  </h3>
                  {SPCI_GLOBAL_SECTIONS.map((section) => (
                    <ChecklistSectionRenderer
                      key={section.id}
                      section={section}
                      fieldPrefix={`global.${section.id}`}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* Block tabs */}
              {blocoFields.map((field, index) => (
                <TabsContent key={field.id} value={`bloco-${index}`}>
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      {getBlocoLabel(index)}
                    </h3>
                    <SPCIBlocoForm blocoIndex={index} readOnly={readOnly} />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </form>
        </FormProvider>
      )}
    </div>
  );
}

// =====================================================
// CONFIG CARD (shared layout)
// =====================================================

interface ConfigCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: 'amber' | 'red';
  children: React.ReactNode;
}

function ConfigCard({ icon, title, subtitle, color, children }: ConfigCardProps) {
  return (
    <div
      className={cn(
        'border rounded-lg p-5',
        color === 'amber' && 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800',
        color === 'red' && 'bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-800',
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h3
          className={cn(
            'font-semibold',
            color === 'amber' && 'text-amber-800 dark:text-amber-200',
            color === 'red' && 'text-red-800 dark:text-red-200',
          )}
        >
          {title}
        </h3>
      </div>
      <p
        className={cn(
          'text-xs mb-4',
          color === 'amber' && 'text-amber-600 dark:text-amber-400',
          color === 'red' && 'text-red-600 dark:text-red-400',
        )}
      >
        {subtitle}
      </p>
      {children}
    </div>
  );
}
