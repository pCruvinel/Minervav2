// Types for the Minerva ERP System - ARQUITETURA HIERÁRQUICA COMPLETA

// ============================================================
// TIPOS DE ROLES HIERÁRQUICOS (4 NÍVEIS)
// ============================================================

export type RoleLevel =
  | 'DIRETORIA'
  | 'GESTOR_ADMINISTRATIVO'
  | 'GESTOR_ASSESSORIA'
  | 'GESTOR_OBRAS'
  | 'COLABORADOR_ADMINISTRATIVO'
  | 'COLABORADOR_ASSESSORIA'
  | 'COLABORADOR_OBRAS'
  | 'MOBRA';

// ============================================================
// TIPOS DE SETORES
// ============================================================

export type Setor = 'ADMINISTRATIVO' | 'ASSESSORIA' | 'OBRAS';

// Compatibilidade com código legado
export type SetorLegacy = 'assessoria' | 'obras';

export type OSStatus = 
  | 'EM_TRIAGEM' 
  | 'AGUARDANDO_INFORMACOES' 
  | 'EM_ANDAMENTO' 
  | 'EM_VALIDACAO' 
  | 'ATRASADA' 
  | 'CONCLUIDA' 
  | 'CANCELADA';

export type EtapaStatus = 
  | 'PENDENTE' 
  | 'EM_ANDAMENTO' 
  | 'AGUARDANDO_APROVACAO' 
  | 'APROVADA' 
  | 'REJEITADA';

export interface User {
  id: string;
  email: string;
  nome_completo: string;
  role_nivel: RoleLevel;
  setor: Setor;
  avatar_url?: string;
  avatar?: string; // Compatibilidade
  supervisor_id?: string;
  supervisor_nome?: string;
  status_colaborador?: 'ativo' | 'inativo';
  data_admissao?: Date;
  telefone?: string;
  cpf?: string;
  
  // Permissões calculadas
  pode_delegar: boolean;
  pode_aprovar: boolean;
  setores_acesso: Setor[];
  modulos_acesso: {
    administrativo: boolean;
    financeiro: boolean;
    operacional: boolean;
    recursos_humanos: boolean;
  };
}

export interface Delegacao {
  id: string;
  os_id: string;
  delegante_id: string;
  delegado_id: string;
  descricao_tarefa: string;
  data_prazo: string;
  status_delegacao: 'pendente' | 'concluida' | 'atrasada';
  delegante_nome?: string;
  delegado_nome?: string;
  observacoes?: string;
  data_atualizacao?: string;
  created_at: string;
  data_criacao?: string;
}

export interface Aprovacao {
  id: string;
  os_id: string;
  aprovador_id: string;
  status_aprovacao: 'aprovada' | 'reprovada';
  data_aprovacao: string;
  observacoes?: string;
}

// ============================================================
// ENUMS PARA CONSTANTES
// ============================================================

export enum NivelHierarquico {
  MOBRA = 1,
  COLABORADOR = 2,
  GESTOR = 3,
  DIRETORIA = 4,
}

export const ROLE_PARA_NIVEL: Record<RoleLevel, NivelHierarquico> = {
  'MOBRA': NivelHierarquico.MOBRA,
  'COLABORADOR_ADMINISTRATIVO': NivelHierarquico.COLABORADOR,
  'COLABORADOR_ASSESSORIA': NivelHierarquico.COLABORADOR,
  'COLABORADOR_OBRAS': NivelHierarquico.COLABORADOR,
  'GESTOR_ADMINISTRATIVO': NivelHierarquico.GESTOR,
  'GESTOR_ASSESSORIA': NivelHierarquico.GESTOR,
  'GESTOR_OBRAS': NivelHierarquico.GESTOR,
  'DIRETORIA': NivelHierarquico.DIRETORIA,
};

// ============================================================
// DEFINIÇÃO DE PERMISSÕES POR ROLE
// ============================================================

export const PERMISSOES_POR_ROLE: Record<RoleLevel, {
  pode_delegar_para: Setor[] | ['*'];
  pode_aprovar_setores: Setor[] | ['*'];
  acesso_modulos: string[];
  acesso_setores: Setor[] | ['*'];
}> = {
  'DIRETORIA': {
    pode_delegar_para: ['*'],
    pode_aprovar_setores: ['*'],
    acesso_modulos: ['administrativo', 'financeiro', 'operacional', 'recursos_humanos'],
    acesso_setores: ['*'],
  },

  'GESTOR_ADMINISTRATIVO': {
    pode_delegar_para: ['*'],
    pode_aprovar_setores: ['ADMINISTRATIVO'],
    acesso_modulos: ['administrativo', 'financeiro'],
    acesso_setores: ['*'],
  },

  'GESTOR_ASSESSORIA': {
    pode_delegar_para: ['ASSESSORIA'],
    pode_aprovar_setores: ['ASSESSORIA'],
    acesso_modulos: ['operacional'],
    acesso_setores: ['ASSESSORIA'],
  },

  'GESTOR_OBRAS': {
    pode_delegar_para: ['OBRAS'],
    pode_aprovar_setores: ['OBRAS'],
    acesso_modulos: ['operacional'],
    acesso_setores: ['OBRAS'],
  },

  'COLABORADOR_ADMINISTRATIVO': {
    pode_delegar_para: [],
    pode_aprovar_setores: [],
    acesso_modulos: ['operacional'],
    acesso_setores: ['ADMINISTRATIVO'],
  },

  'COLABORADOR_ASSESSORIA': {
    pode_delegar_para: [],
    pode_aprovar_setores: [],
    acesso_modulos: ['operacional'],
    acesso_setores: ['ASSESSORIA'],
  },

  'COLABORADOR_OBRAS': {
    pode_delegar_para: [],
    pode_aprovar_setores: [],
    acesso_modulos: ['operacional'],
    acesso_setores: ['OBRAS'],
  },

  'MOBRA': {
    pode_delegar_para: [],
    pode_aprovar_setores: [],
    acesso_modulos: [],
    acesso_setores: [],
  },
};

// ============================================================
// NOMES LEGÍVEIS DOS ROLES
// ============================================================

export const ROLE_NAMES: Record<RoleLevel, string> = {
  'DIRETORIA': 'Diretoria',
  'GESTOR_ADMINISTRATIVO': 'Gestor Administrativo',
  'GESTOR_ASSESSORIA': 'Gestor Assessoria Técnica',
  'GESTOR_OBRAS': 'Gestor de Obras',
  'COLABORADOR_ADMINISTRATIVO': 'Colaborador Administrativo',
  'COLABORADOR_ASSESSORIA': 'Colaborador Assessoria',
  'COLABORADOR_OBRAS': 'Colaborador Obras',
  'MOBRA': 'Mão de Obra',
};

export const SETOR_NAMES: Record<Setor, string> = {
  'ADMINISTRATIVO': 'Administrativo',
  'ASSESSORIA': 'Assessoria Técnica',
  'OBRAS': 'Obras',
};

// ============================================================
// INTERFACES EXISTENTES (COMPATIBILIDADE)
// ============================================================

// Informação resumida de etapa
export interface EtapaInfo {
  numero: number;
  titulo: string;
  status: EtapaStatus;
}

export interface OrdemServico {
  id: string;
  codigo: string;
  cliente: string;
  tipo: string;
  titulo: string;
  descricao: string;
  status: OSStatus;
  setor: Setor;
  responsavel: User;
  prazoInicio: string;
  prazoFim: string;
  createdAt: string;
  updatedAt: string;

  // Campos de etapa atual
  numeroEtapaAtual?: number;
  statusEtapaAtual?: EtapaStatus;
  etapaAtual?: EtapaInfo;

  // Novos campos para delegação
  delegado_por_id?: string;
  delegada_para_id?: string;
  data_delegacao?: Date;
  requer_aprovacao?: boolean;
  aprovado_por_id?: string;
  data_aprovacao?: Date;
  justificativa_reabertura?: string;
  data_reabertura?: Date;
  reaberta_por_id?: string;
  status_aprovacao?: 'nao_aplicavel' | 'pendente' | 'aprovada' | 'reprovada';
}

export interface Comentario {
  id: string;
  osId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  texto: string;
  createdAt: string;
}

export interface Documento {
  id: string;
  osId: string;
  nome: string;
  tipo: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface HistoricoItem {
  id: string;
  osId: string;
  tipo: 'status' | 'comentario' | 'documento' | 'atribuicao';
  descricao: string;
  userName: string;
  createdAt: string;
}

// ============================================================
// INTERFACE DE AUDITORIA
// ============================================================

export interface AuditoriaAcao {
  id: string;
  usuario_id: string;
  acao: string;
  entidade_tipo: string;
  entidade_id: string;
  detalhes_antes?: object;
  detalhes_depois?: object;
  ip_origem?: string;
  data_acao: Date;
}

// ============================================================
// MAPEAMENTO DE STATUS (LEGADO → PADRONIZADO)
// ============================================================

// Mapeamento de status legado para novo formato
export const mapLegacyStatusToStandard = (legacyStatus: string): OSStatus => {
  const statusMap: Record<string, OSStatus> = {
    'triagem': 'EM_TRIAGEM',
    'em-andamento': 'EM_ANDAMENTO',
    'em-validacao': 'EM_VALIDACAO',
    'concluida': 'CONCLUIDA',
    'rejeitada': 'CANCELADA',
    'TRIAGEM': 'EM_TRIAGEM',
    'EM_ANDAMENTO': 'EM_ANDAMENTO',
    'EM_VALIDACAO': 'EM_VALIDACAO',
    'CONCLUIDA': 'CONCLUIDA',
    'REJEITADA': 'CANCELADA',
  };

  return statusMap[legacyStatus] || 'EM_TRIAGEM';
};

// Mapeamento de status padronizado para exibição
export const getStatusLabel = (status: OSStatus): string => {
  const labels: Record<OSStatus, string> = {
    'EM_TRIAGEM': 'Em Triagem',
    'AGUARDANDO_INFORMACOES': 'Aguardando Informações',
    'EM_ANDAMENTO': 'Em Andamento',
    'EM_VALIDACAO': 'Em Validação',
    'ATRASADA': 'Atrasada',
    'CONCLUIDA': 'Concluída',
    'CANCELADA': 'Cancelada',
  };

  return labels[status] || status;
};

// Mapeamento de status de etapa para exibição
export const getEtapaStatusLabel = (status: EtapaStatus): string => {
  const labels: Record<EtapaStatus, string> = {
    'PENDENTE': 'Pendente',
    'EM_ANDAMENTO': 'Em Andamento',
    'AGUARDANDO_APROVACAO': 'Aguardando Aprovação',
    'APROVADA': 'Aprovada',
    'REJEITADA': 'Rejeitada',
  };

  return labels[status] || status;
};
