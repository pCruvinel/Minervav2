import { WorkflowStep } from '../components/os/workflow-stepper';

/**
 * Definição das 15 etapas do fluxo OS 01-04
 * Cada etapa representa uma fase do processo comercial
 */
export const OS_WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 1, title: 'Identificação do Cliente/Lead', short: 'Lead', responsible: 'ADM', status: 'active' },
  { id: 2, title: 'Seleção do Tipo de OS', short: 'Tipo OS', responsible: 'ADM', status: 'pending' },
  { id: 3, title: 'Follow-up 1 (Entrevista Inicial)', short: 'Follow-up 1', responsible: 'ADM', status: 'pending' },
  { id: 4, title: 'Agendar Visita Técnica', short: 'Agendar', responsible: 'ADM', status: 'pending' },
  { id: 5, title: 'Realizar Visita', short: 'Visita', responsible: 'Obras', status: 'pending' },
  { id: 6, title: 'Follow-up 2 (Pós-Visita)', short: 'Follow-up 2', responsible: 'Obras', status: 'pending' },
  { id: 7, title: 'Formulário Memorial (Escopo)', short: 'Escopo', responsible: 'Obras', status: 'pending' },
  { id: 8, title: 'Precificação', short: 'Precificação', responsible: 'Obras', status: 'pending' },
  { id: 9, title: 'Gerar Proposta Comercial', short: 'Proposta', responsible: 'ADM', status: 'pending' },
  { id: 10, title: 'Agendar Visita (Apresentação)', short: 'Agendar', responsible: 'ADM', status: 'pending' },
  { id: 11, title: 'Realizar Visita (Apresentação)', short: 'Apresentação', responsible: 'ADM', status: 'pending' },
  { id: 12, title: 'Follow-up 3 (Pós-Apresentação)', short: 'Follow-up 3', responsible: 'ADM', status: 'pending' },
  { id: 13, title: 'Gerar Contrato (Upload)', short: 'Contrato', responsible: 'ADM', status: 'pending' },
  { id: 14, title: 'Contrato Assinado', short: 'Assinatura', responsible: 'ADM', status: 'pending' },
  { id: 15, title: 'Iniciar Contrato de Obra', short: 'Início Obra', responsible: 'Sistema', status: 'pending' },
];

/**
 * Mapeia nome amigável do tipo de OS para código do banco de dados
 */
export const OS_TYPE_CODE_MAP: Record<string, string> = {
  'OS 01: Perícia de Fachada': 'OS-01',
  'OS 02: Revitalização de Fachada': 'OS-02',
  'OS 03: Reforço Estrutural': 'OS-03',
  'OS 04: Outros': 'OS-04',
};

/**
 * Lista de tipos de OS disponíveis (para dropdown)
 */
export const OS_TYPES = [
  { value: 'OS 01: Perícia de Fachada', label: 'OS 01: Perícia de Fachada' },
  { value: 'OS 02: Revitalização de Fachada', label: 'OS 02: Revitalização de Fachada' },
  { value: 'OS 03: Reforço Estrutural', label: 'OS 03: Reforço Estrutural' },
  { value: 'OS 04: Outros', label: 'OS 04: Outros' },
];

/**
 * Etapas que permitem salvamento de rascunho
 */
export const DRAFT_ENABLED_STEPS = [3, 6, 7, 8];

/**
 * Número total de etapas no workflow
 */
export const TOTAL_WORKFLOW_STEPS = OS_WORKFLOW_STEPS.length;
