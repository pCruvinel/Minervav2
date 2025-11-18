// Types for the Minerva ERP System - ARQUITETURA HIERÁRQUICA COMPLETA

// ============================================================
// TIPOS DE ROLES HIERÁRQUICOS (4 NÍVEIS)
// ============================================================

export type RoleLevel =
  | 'DIRETORIA'
  | 'GESTOR_COMERCIAL'
  | 'GESTOR_ASSESSORIA'
  | 'GESTOR_OBRAS'
  | 'COLABORADOR_COMERCIAL'
  | 'COLABORADOR_ASSESSORIA'
  | 'COLABORADOR_OBRAS'
  | 'MOBRA';

// ============================================================
// TIPOS DE SETORES
// ============================================================

export type Setor = 'COM' | 'ASS' | 'OBR';

// Compatibilidade com código legado
export type SetorLegacy = 'assessoria' | 'obras';

// ============================================================
// STATUS DE ORDEM DE SERVIÇO
// ============================================================

export type OSStatus = 
  | 'TRIAGEM' 
  | 'EM_ANDAMENTO' 
  | 'EM_VALIDACAO' 
  | 'CONCLUIDA' 
  | 'REJEITADA';

// ============================================================
// INTERFACE DE USUÁRIO EXPANDIDA
// ============================================================

export interface User {
  id: string;
  nome_completo: string;
  email: string;
  role_nivel: RoleLevel;
  setor: Setor;
  supervisor_id?: string;  // UUID do supervisor
  supervisor_nome?: string; // Nome do supervisor
  status_colaborador: 'ativo' | 'inativo' | 'suspenso';
  data_admissao: Date;
  telefone?: string;
  cpf?: string;
  endereco?: string;
  avatar?: string;

  // Metadados de controle (calculados dinamicamente)
  pode_delegar: boolean;
  pode_aprovar: boolean;
  setores_acesso: Setor[]; // Setores que pode visualizar
  modulos_acesso: {
    administrativo: boolean;
    financeiro: boolean;
    operacional: boolean;
    recursos_humanos: boolean;
  };
}

// ============================================================
// INTERFACE DE DELEGAÇÃO
// ============================================================

export interface Delegacao {
  id: string;
  os_id: string;
  delegante_id: string;
  delegante_nome: string;
  delegado_id: string;
  delegado_nome: string;
  data_delegacao: Date;
  data_prazo?: Date;
  status_delegacao: 'pendente' | 'em_progresso' | 'concluida' | 'reprovada';
  descricao_tarefa: string;
  observacoes?: string;
  data_atualizacao: Date;
}

// ============================================================
// INTERFACE DE APROVAÇÃO
// ============================================================

export interface Aprovacao {
  id: string;
  delegacao_id: string;
  responsavel_id: string;
  responsavel_nome: string;
  status_aprovacao: 'pendente' | 'aprovada' | 'reprovada';
  observacoes_aprovacao?: string;
  data_aprovacao?: Date;
  data_criacao: Date;
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
  'COLABORADOR_COMERCIAL': NivelHierarquico.COLABORADOR,
  'COLABORADOR_ASSESSORIA': NivelHierarquico.COLABORADOR,
  'COLABORADOR_OBRAS': NivelHierarquico.COLABORADOR,
  'GESTOR_COMERCIAL': NivelHierarquico.GESTOR,
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

  'GESTOR_COMERCIAL': {
    pode_delegar_para: ['*'],
    pode_aprovar_setores: ['COM'],
    acesso_modulos: ['administrativo', 'financeiro'],
    acesso_setores: ['*'],
  },

  'GESTOR_ASSESSORIA': {
    pode_delegar_para: ['ASS'],
    pode_aprovar_setores: ['ASS'],
    acesso_modulos: ['operacional'],
    acesso_setores: ['ASS'],
  },

  'GESTOR_OBRAS': {
    pode_delegar_para: ['OBR'],
    pode_aprovar_setores: ['OBR'],
    acesso_modulos: ['operacional'],
    acesso_setores: ['OBR'],
  },

  'COLABORADOR_COMERCIAL': {
    pode_delegar_para: [],
    pode_aprovar_setores: [],
    acesso_modulos: ['operacional'],
    acesso_setores: ['COM'],
  },

  'COLABORADOR_ASSESSORIA': {
    pode_delegar_para: [],
    pode_aprovar_setores: [],
    acesso_modulos: ['operacional'],
    acesso_setores: ['ASS'],
  },

  'COLABORADOR_OBRAS': {
    pode_delegar_para: [],
    pode_aprovar_setores: [],
    acesso_modulos: ['operacional'],
    acesso_setores: ['OBR'],
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
  'GESTOR_COMERCIAL': 'Gestor Comercial',
  'GESTOR_ASSESSORIA': 'Gestor Assessoria Técnica',
  'GESTOR_OBRAS': 'Gestor de Obras',
  'COLABORADOR_COMERCIAL': 'Colaborador Comercial',
  'COLABORADOR_ASSESSORIA': 'Colaborador Assessoria',
  'COLABORADOR_OBRAS': 'Colaborador Obras',
  'MOBRA': 'Mão de Obra',
};

export const SETOR_NAMES: Record<Setor, string> = {
  'COM': 'Comercial',
  'ASS': 'Assessoria Técnica',
  'OBR': 'Obras',
};

// ============================================================
// INTERFACES EXISTENTES (COMPATIBILIDADE)
// ============================================================

export interface OrdemServico {
  id: string;
  codigo: string;
  cliente: string;
  tipo: string;
  descricao: string;
  status: OSStatus;
  setor: Setor;
  responsavel: User;
  prazoInicio: string;
  prazoFim: string;
  createdAt: string;
  updatedAt: string;
  
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
