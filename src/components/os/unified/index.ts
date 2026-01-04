/**
 * Unified OS Components
 *
 * Componentes para visualização unificada de hierarquia de OS
 * (Lead → Contrato → Satélites).
 */

// Hook principal
export { useUnifiedWorkflow } from '@/lib/hooks/use-unified-workflow';
export type {
  UnifiedStep,
  WorkflowPhase,
  UnifiedWorkflowResult
} from '@/lib/hooks/use-unified-workflow';

// Componentes
export { UnifiedWorkflowStepper } from './unified-workflow-stepper';
export type { UnifiedWorkflowStepperProps } from './unified-workflow-stepper';

export { QuickActionsPanel } from './quick-actions-panel';
export type { QuickActionsPanelProps } from './quick-actions-panel';
