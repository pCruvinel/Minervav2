/**
 * ============================================================================
 * TIPOS PARA SISTEMA DE RESPONSABILIDADE POR SETOR
 * ============================================================================
 * 
 * Define interfaces e tipos para gestão de participantes e delegação de etapas.
 * 
 * @module os-responsabilidade
 * @author Minerva ERP
 */

import type { SetorSlug, CargoSlug } from '@/lib/constants/os-ownership-rules';

// ============================================================================
// TIPOS BASE
// ============================================================================

/**
 * Papéis possíveis para um participante de OS
 */
export type PapelParticipante = 'responsavel' | 'participante' | 'observador';

/**
 * Informações de um setor com seu coordenador
 */
export interface SetorInfo {
  /** Slug do setor */
  slug: SetorSlug;
  /** Nome do setor formatado */
  nome: string;
  /** ID do coordenador padrão */
  coordenador_id: string | null;
  /** Nome do coordenador padrão */
  coordenador_nome: string | null;
  /** Cargo do coordenador */
  coordenador_cargo: CargoSlug | null;
  /** ID do colaborador para quem foi delegado (se houver) */
  delegado_para_id?: string | null;
  /** Nome do colaborador delegado */
  delegado_para_nome?: string | null;
}

/**
 * Informações de responsabilidade de uma etapa
 */
export interface EtapaResponsabilidade {
  /** ID da etapa (UUID) */
  etapa_id: string;
  /** Número da ordem da etapa */
  ordem: number;
  /** Informações do setor responsável */
  setor: SetorInfo;
  /** Responsável atual (coordenador ou delegado) */
  responsavel_atual: {
    id: string;
    nome: string;
    cargo: string;
    avatar_url?: string;
    is_delegado: boolean;
  };
  /** Se o usuário logado pode editar esta etapa */
  pode_editar: boolean;
  /** Se o usuário logado pode delegar esta etapa */
  pode_delegar: boolean;
  /** Motivo do bloqueio (se não pode editar) */
  motivo_bloqueio?: string;
}

/**
 * Participante de uma OS
 */
export interface OSParticipante {
  /** ID do registro de participante */
  id: string;
  /** ID do colaborador */
  colaborador_id: string;
  /** Nome do colaborador */
  colaborador_nome: string;
  /** Cargo/função do colaborador */
  colaborador_cargo: string;
  /** Avatar do colaborador */
  colaborador_avatar?: string;
  /** Papel na OS */
  papel: PapelParticipante;
  /** ID do setor (se restrito a um setor) */
  setor_id?: string;
  /** Nome do setor */
  setor_nome?: string;
  /** Etapas específicas que pode editar (null = todas do setor) */
  etapas_permitidas?: number[];
  /** Quando foi adicionado */
  adicionado_em: string;
  /** Observação sobre o participante */
  observacao?: string;
}

/**
 * Delegação de etapa
 */
export interface DelegacaoEtapa {
  /** ID da delegação */
  id: string;
  /** ID da etapa */
  etapa_id: string;
  /** Ordem da etapa */
  etapa_ordem: number;
  /** ID do responsável delegado */
  responsavel_id: string;
  /** Nome do responsável */
  responsavel_nome: string;
  /** ID de quem delegou */
  delegado_por_id: string;
  /** Nome de quem delegou */
  delegado_por_nome: string;
  /** Data da delegação */
  delegado_em: string;
  /** Motivo da delegação */
  motivo?: string;
  /** Se a delegação está ativa */
  ativo: boolean;
}

// ============================================================================
// TIPOS PARA PROPS DE COMPONENTES
// ============================================================================

/**
 * Props para o componente de cabeçalho de responsabilidade
 */
export interface StepResponsibilityHeaderProps {
  stepNumber: number;
  stepTitle: string;
  setor: SetorSlug;
  setorNome: string;
  responsavelId: string;
  responsavelNome: string;
  responsavelCargo: string;
  responsavelAvatar?: string;
  isDelegado: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  canEdit: boolean;
  canDelegate: boolean;
  onDelegate?: () => void;
}

/**
 * Props para o modal de delegação
 */
export interface DelegacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  etapaId: string;
  etapaNome: string;
  etapaOrdem: number;
  setorSlug: SetorSlug;
  onDelegate: (colaboradorId: string, motivo?: string) => Promise<boolean>;
  isLoading?: boolean;
}

/**
 * Props para o painel de participantes
 */
export interface OSParticipantesPanelProps {
  osId: string;
  participantes: OSParticipante[];
  canManage: boolean;
  onAddParticipante: (colaboradorId: string, papel: PapelParticipante, etapas?: number[]) => Promise<void>;
  onRemoveParticipante: (participanteId: string) => Promise<void>;
  onUpdateParticipante?: (participanteId: string, updates: Partial<OSParticipante>) => Promise<void>;
  isLoading?: boolean;
}

// ============================================================================
// TIPOS PARA HOOKS
// ============================================================================

/**
 * Retorno do hook useOSResponsabilidade
 */
export interface UseOSResponsabilidadeReturn {
  // Dados
  responsaveisSetores: SetorInfo[];
  participantes: OSParticipante[];
  delegacoes: DelegacaoEtapa[];
  
  // Estado
  isLoading: boolean;
  error: Error | null;
  
  // Ações
  delegarEtapa: (etapaId: string, colaboradorId: string, motivo?: string) => Promise<boolean>;
  revogarDelegacao: (etapaId: string) => Promise<boolean>;
  adicionarParticipante: (colaboradorId: string, papel: PapelParticipante, setorId?: string, etapas?: number[]) => Promise<boolean>;
  removerParticipante: (participanteId: string) => Promise<boolean>;
  
  // Queries
  podeEditarEtapa: (etapaOrdem: number) => boolean;
  podeDelegar: (setorSlug: SetorSlug) => boolean;
  getResponsavelEtapa: (etapaOrdem: number) => EtapaResponsabilidade | null;
  getDelegacaoEtapa: (etapaId: string) => DelegacaoEtapa | null;
  
  // Refresh
  refresh: () => Promise<void>;
}

/**
 * Retorno do hook useEtapaPermissoes
 */
export interface UseEtapaPermissoesReturn {
  podeEditar: boolean;
  podeAvancar: boolean;
  podeDelegar: boolean;
  responsavel: {
    id: string;
    nome: string;
    cargo: string;
    avatar_url?: string;
    is_delegado: boolean;
  } | null;
  setor: SetorInfo | null;
  motivoBloqueio?: string;
  isLoading: boolean;
}

// ============================================================================
// TIPOS PARA WORKFLOW STEP EXPANDIDO
// ============================================================================

/**
 * Definição de etapa de workflow expandida com responsabilidade
 * Estende WorkflowStepDefinition do workflow-accordion.tsx
 */
export interface WorkflowStepDefinitionV2 {
  id: number;
  title: string;
  short?: string;
  
  // Campos de responsabilidade (novos)
  setor: SetorSlug;
  setorNome: string;
  responsavelId?: string;
  responsavelNome?: string;
  responsavelCargo?: string;
  responsavelAvatar?: string;
  isDelegado?: boolean;
  podeEditar?: boolean;
  podeDelegar?: boolean;
}

// ============================================================================
// MAPAS DE REFERÊNCIA
// ============================================================================

/**
 * Mapa de slugs de setor para nomes formatados
 */
export const SETOR_NOMES: Record<SetorSlug, string> = {
  administrativo: 'Administrativo',
  obras: 'Obras',
  assessoria: 'Assessoria',
};

/**
 * Mapa de papéis para labels amigáveis
 */
export const PAPEL_LABELS: Record<PapelParticipante, string> = {
  responsavel: 'Responsável',
  participante: 'Participante',
  observador: 'Observador',
};

/**
 * Mapa de papéis para descrições
 */
export const PAPEL_DESCRICOES: Record<PapelParticipante, string> = {
  responsavel: 'Pode editar todas as etapas e delegar para outros',
  participante: 'Pode editar etapas específicas do seu setor',
  observador: 'Apenas visualização, sem permissão de edição',
};

/**
 * Mapa de cargos de coordenador para seus setores
 */
export const COORDENADOR_SETOR: Record<string, SetorSlug> = {
  coord_administrativo: 'administrativo',
  coord_obras: 'obras',
  coord_assessoria: 'assessoria',
};
