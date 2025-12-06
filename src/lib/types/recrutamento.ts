/**
 * Types para o módulo de Recrutamento (Kanban de Vagas OS-10)
 */

/**
 * Status das colunas do Kanban de recrutamento
 */
export type RecruitmentColumnStatus =
  | 'pendente_aprovacao'
  | 'em_divulgacao'
  | 'entrevistas'
  | 'finalizado';

/**
 * Vaga de recrutamento (tabela os_vagas_recrutamento)
 */
export interface VagaRecrutamento {
  id: string;
  os_id: string;
  cargo_funcao: string;
  quantidade: number;
  salario_base: number | null;
  habilidades_necessarias: string | null;
  perfil_comportamental: string | null;
  experiencia_minima: string | null;
  escolaridade_minima: string | null;
  status: 'aberta' | 'em_selecao' | 'preenchida' | 'cancelada';
  urgencia: 'baixa' | 'normal' | 'alta' | 'critica';
  data_limite_contratacao: string | null;
  created_at: string;
  updated_at?: string;
}

/**
 * Centro de custo simplificado para join
 */
export interface CentroCustoSimples {
  id: string;
  nome: string;
}

/**
 * Solicitante simplificado para join
 */
export interface SolicitanteSimples {
  id: string;
  nome_completo: string;
  avatar_url: string | null;
}

/**
 * Metadata da OS-10
 */
export interface OS10Metadata {
  solicitante?: string;
  departamento?: string;
  urgencia?: 'baixa' | 'normal' | 'alta' | 'critica';
  justificativa?: string;
}

/**
 * Requisição de Mão de Obra (OS-10 com vagas e joins)
 */
export interface RequisicaoMaoDeObra {
  id: string;
  codigo_os: string;
  status_geral: string;
  descricao: string;
  data_entrada: string;
  cc_id: string | null;
  criado_por_id: string | null;
  metadata?: OS10Metadata;
  updated_at?: string;
  // Dados de joins
  centro_custo: CentroCustoSimples | null;
  solicitante: SolicitanteSimples | null;
  vagas: VagaRecrutamento[];
  // Campos computados
  total_vagas: number;
  kanban_status: RecruitmentColumnStatus;
}

/**
 * Configuração de coluna do Kanban
 */
export interface KanbanColumnConfig {
  id: RecruitmentColumnStatus;
  title: string;
  icon: string;
  variant: 'warning' | 'info' | 'primary' | 'success';
  emptyMessage: string;
}
