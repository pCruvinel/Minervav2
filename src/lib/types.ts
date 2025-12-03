// Types for the Minerva ERP System - ARQUITETURA HIERÁRQUICA COMPLETA v2.0
// Atualizado para sincronizar com o Schema do Banco de Dados (Minúsculo)

// ============================================================
// TIPOS DE ROLES HIERÁRQUICOS (Baseado nos Slugs do Banco)
// ============================================================

export type RoleLevel =
  | 'admin'
  | 'diretoria'
  | 'gestor_administrativo'
  | 'gestor_assessoria'
  | 'gestor_obras'
  | 'colaborador'
  | 'mao_de_obra';

// ============================================================
// TIPOS DE SETORES (Baseado nos Slugs do Banco)
// ============================================================

export type SetorSlug = 'administrativo' | 'assessoria' | 'obras' | 'diretoria';

// Alias para compatibilidade com código legado
export type Setor = 'COM' | 'ASS' | 'OBR';

export type NivelHierarquico = number;

// ============================================================
// ENUMS DO BANCO DE DADOS (MINÚSCULOS - CRUCIAL)
// ============================================================

export type OSStatus =
  | 'em_triagem'
  | 'em_andamento'
  | 'aguardando_aprovacao'
  | 'concluida'
  | 'cancelada';

export type EtapaStatus =
  | 'pendente'
  | 'em_andamento'
  | 'concluida'
  | 'bloqueada'
  | 'cancelada';

export interface Etapa {
  id: string;
  os_id: string;
  nome_etapa: string;
  status: EtapaStatus;
  ordem: number;
  responsavel_id?: string;
  created_at: string;
  updated_at: string;
}

export type ClienteStatus =
  | 'lead'
  | 'ativo'
  | 'inativo'
  | 'blacklist';

export type DelegacaoStatus =
  | 'pendente'
  | 'aceita'
  | 'concluida'
  | 'recusada';

export type FinanceiroTipo = 
  | 'receita' 
  | 'despesa';

export type AgendamentoStatus =
  | 'agendado'
  | 'confirmado'
  | 'realizado'
  | 'cancelado';

// ============================================================
// INTERFACES PRINCIPAIS
// ============================================================

export interface User {
  id: string;
  email: string;
  nome_completo: string;
  
  // Novos campos da V2 (via Join)
  cargo_slug?: RoleLevel;
  setor_slug?: SetorSlug;
  
  // Campos mantidos para compatibilidade com código legado (mas mapeados para os novos valores)
  role_nivel?: RoleLevel; 
  setor?: string;

  avatar_url?: string;
  ativo: boolean;
  data_admissao?: Date;
  telefone?: string;
  cpf?: string;
  
  // Permissões calculadas (Frontend Helper)
  pode_delegar?: boolean;
  pode_aprovar?: boolean;
}

/**
 * Interface para Ordem de Serviço
 *
 * Campos diretos do banco (tabela ordens_servico):
 * - id, codigo_os, status_geral, descricao
 * - cliente_id, tipo_os_id, responsavel_id, criado_por_id, cc_id
 * - valor_proposta, valor_contrato
 * - data_entrada, data_prazo, data_conclusao, created_at, updated_at
 *
 * Campos vindos de Joins (quando select incluir relacionamentos):
 * - cliente_nome (via join com clientes.nome_razao_social)
 * - tipo_os_nome (via join com tipos_os.nome)
 * - responsavel_nome (via join com colaboradores.nome_completo)
 * - setor_nome (via join com setores.nome através de tipos_os.setor_padrao_id)
 */
export interface OrdemServico {
  // ========== CAMPOS DIRETOS DO BANCO ==========
  id: string;
  codigo_os: string;
  status_geral: OSStatus;
  descricao: string;

  cliente_id: string;
  tipo_os_id: string;
  responsavel_id?: string;
  criado_por_id?: string;
  cc_id?: string;
  
  // 🆕 Relacionamento Hierárquico (Migration 2025-12-02)
  parent_os_id?: string | null; // ID da OS origem/pai

  valor_proposta?: number;
  valor_contrato?: number;

  data_entrada?: string;
  data_prazo?: string;
  data_conclusao?: string;
  created_at?: string;
  updated_at?: string;

  // ========== CAMPOS VINDOS DE JOINS ==========
  // Estes campos só existem quando a query SELECT inclui os relacionamentos
  cliente_nome?: string;        // join: clientes.nome_razao_social
  tipo_os_nome?: string;         // join: tipos_os.nome
  responsavel_nome?: string;     // join: colaboradores.nome_completo
  setor_nome?: string;           // join: setores.nome (via tipos_os.setor_padrao_id)

  // ========== CAMPOS LEGADOS (COMPATIBILIDADE) ==========
  setor?: string;                // Legado: substituído por setor_nome
  delegada_para_id?: string;     // Legado: usar tabela delegacoes
  responsavel?: User;            // Legado: usar responsavel_id + join

  // ========== CAMPOS COMPUTADOS (FRONTEND) ==========
  etapaAtual?: {
    numero: number;
    titulo: string;
    status: string;
  };
  
  // Objeto completo do cliente (opcional, vindo de joins/API)
  cliente?: Cliente;
}

export interface Delegacao {
  id: string;
  os_id: string;
  delegante_id: string;
  delegado_id: string;
  status_delegacao: DelegacaoStatus;
  descricao_tarefa: string;
  observacoes?: string;
  data_prazo?: string;

  // Campos de visualização (Join/View)
  delegante_nome?: string;
  delegado_nome?: string;

  // Timestamps do banco
  created_at: string;
  updated_at: string;

  // Campos legados/compatibilidade (mapeados para created_at/updated_at)
  data_delegacao?: string;
  data_criacao?: string;
  data_atualizacao?: string;
}

export interface Cliente {
  id: string;
  nome_razao_social: string;
  cpf_cnpj?: string;
  email?: string;
  telefone?: string;
  status: ClienteStatus;
  responsavel_id?: string;
  endereco?: any; // JSONB
  observacoes?: string;
}

export interface FinanceiroLancamento {
  id: string;
  descricao: string;
  valor: number;
  tipo: FinanceiroTipo;
  data_vencimento: string;
  data_pagamento?: string;
  conciliado: boolean;
  cc_id?: string;
  cliente_id?: string;
}

export type FinanceiroCategoria =
  | 'mao_de_obra'
  | 'material'
  | 'equipamento'
  | 'aplicacao'
  | 'escritorio'
  | 'impostos'
  | 'outros';

export type ContaPagarTipo = 'salario' | 'conta_fixa' | 'despesa_variavel';

export type ContaPagarStatus = 'em_aberto' | 'pago' | 'atrasado';

export type ContaReceberStatus = 'em_aberto' | 'conciliado' | 'inadimplente';

export interface ContaPagar {
  id: string;
  favorecido: string;
  tipoFavorecido: 'colaborador' | 'fornecedor';
  descricao: string;
  tipo: ContaPagarTipo;
  vencimento: string;
  valor: number;
  valorPago?: number;
  status: ContaPagarStatus;
  dataPagamento?: string;
  comprovanteId?: string;
  recorrente: boolean;
  categoria?: FinanceiroCategoria;
}

export interface ContaReceber {
  id: string;
  cliente: string;
  centroCusto: string;
  contrato: string;
  parcela: string;
  vencimento: string;
  valorPrevisto: number;
  valorRecebido?: number;
  status: ContaReceberStatus;
  dataConciliacao?: string;
  comprovanteId?: string;
}

// ============================================================
// HELPERS DE EXIBIÇÃO (Labels para UI)
// ============================================================

export const ROLE_LABELS: Record<RoleLevel, string> = {
  'admin': 'Admin do Sistema',
  'diretoria': 'Diretoria',
  'gestor_administrativo': 'Gestor Administrativo',
  'gestor_assessoria': 'Gestor Assessoria',
  'gestor_obras': 'Gestor Obras',
  'colaborador': 'Colaborador',
  'mao_de_obra': 'Mão de Obra',
};

export const STATUS_LABELS: Record<OSStatus, string> = {
  'em_triagem': 'Em Triagem',
  'em_andamento': 'Em Andamento',
  'concluida': 'Concluída',
  'cancelada': 'Cancelada',
  'aguardando_aprovacao': 'Aguardando Aprovação',
};

export const CLIENTE_STATUS_LABELS: Record<ClienteStatus, string> = {
  'lead': 'Lead (Potencial)',
  'ativo': 'Ativo',
  'inativo': 'Inativo',
  'blacklist': 'Bloqueado',
};

export const DELEGACAO_STATUS_LABELS: Record<DelegacaoStatus, string> = {
  'pendente': 'Pendente',
  'aceita': 'Aceita',
  'concluida': 'Concluída',
  'recusada': 'Recusada',
};

// ============================================================
// FUNÇÃO DE COMPATIBILIDADE (LEGADO -> NOVO)
// Use isso se tiver dados antigos no LocalStorage ou Cache
// ============================================================
export const normalizeStatusOS = (status: string): OSStatus => {
  const s = status.toLowerCase();
  if (s.includes('triagem')) return 'em_triagem';
  if (s.includes('andamento')) return 'em_andamento';
  if (s.includes('conclui') || s.includes('concluida')) return 'concluida';
  if (s.includes('cancel')) return 'cancelada';
  if (s.includes('aguardando')) return 'aguardando_aprovacao';
  return 'em_triagem'; // Default seguro
};

// ============================================================
// MATRIZ DE PERMISSÕES POR ROLE (RBAC)
// ============================================================

/**
 * Interface que define as permissões de um cargo no sistema
 * Baseada na documentação: docs/technical/USUARIOS_SCHEMA.md
 */
export interface Permissoes {
  /** Nível hierárquico (10=Admin, 9=Diretoria, 5=Gestor, 1=Colaborador, 0=Sem acesso) */
  nivel: number;

  /** Pode ver todas as OSs ou apenas as delegadas/responsáveis */
  pode_ver_todas_os: boolean;

  /** Pode acessar módulo financeiro (contas a pagar/receber, conciliação) */
  pode_acessar_financeiro: boolean;

  /** Pode delegar tarefas para outros usuários */
  pode_delegar: boolean;

  /** Pode aprovar etapas de workflow */
  pode_aprovar: boolean;

  /** Pode gerenciar usuários (criar, editar, desativar) */
  pode_gerenciar_usuarios: boolean;

  /** Pode criar novas OSs */
  pode_criar_os: boolean;

  /** Pode cancelar OSs */
  pode_cancelar_os: boolean;

  /** Setores que este cargo pode visualizar */
  setores_visiveis: SetorSlug[] | 'todos';

  /** Descrição do cargo */
  descricao: string;
}

/**
 * Matriz de Permissões por Role
 * Define o que cada cargo pode fazer no sistema
 *
 * @see docs/technical/USUARIOS_SCHEMA.md - Seção "Matriz de Permissões"
 */
export const PERMISSOES_POR_ROLE: Record<RoleLevel, Permissoes> = {
  admin: {
    nivel: 10,
    pode_ver_todas_os: true,
    pode_acessar_financeiro: true,
    pode_delegar: true,
    pode_aprovar: true,
    pode_gerenciar_usuarios: true,
    pode_criar_os: true,
    pode_cancelar_os: true,
    setores_visiveis: 'todos',
    descricao: 'Acesso total ao sistema para manutenção e desenvolvimento'
  },

  diretoria: {
    nivel: 9,
    pode_ver_todas_os: true,
    pode_acessar_financeiro: true,
    pode_delegar: true,
    pode_aprovar: true,
    pode_gerenciar_usuarios: true,
    pode_criar_os: true,
    pode_cancelar_os: true,
    setores_visiveis: 'todos',
    descricao: 'Visão estratégica completa - Acessa todos os módulos e setores'
  },

  gestor_administrativo: {
    nivel: 5,
    pode_ver_todas_os: true,
    pode_acessar_financeiro: true,
    pode_delegar: true,
    pode_aprovar: true,
    pode_gerenciar_usuarios: false,
    pode_criar_os: true,
    pode_cancelar_os: true,
    setores_visiveis: 'todos',
    descricao: 'Gerente geral - Supervisiona Financeiro, Obras e Assessoria'
  },

  gestor_obras: {
    nivel: 5,
    pode_ver_todas_os: true, // Mas filtrado por setor no RLS
    pode_acessar_financeiro: false,
    pode_delegar: true,
    pode_aprovar: true,
    pode_gerenciar_usuarios: false,
    pode_criar_os: true,
    pode_cancelar_os: true,
    setores_visiveis: ['obras'],
    descricao: 'Gerencia execução de obras - Sem acesso financeiro'
  },

  gestor_assessoria: {
    nivel: 5,
    pode_ver_todas_os: true, // Mas filtrado por setor no RLS
    pode_acessar_financeiro: false,
    pode_delegar: true,
    pode_aprovar: true,
    pode_gerenciar_usuarios: false,
    pode_criar_os: true,
    pode_cancelar_os: true,
    setores_visiveis: ['assessoria'],
    descricao: 'Gerencia laudos e assessoria - Sem acesso financeiro'
  },

  colaborador: {
    nivel: 1,
    pode_ver_todas_os: false,
    pode_acessar_financeiro: false,
    pode_delegar: false,
    pode_aprovar: false,
    pode_gerenciar_usuarios: false,
    pode_criar_os: true,
    pode_cancelar_os: false,
    setores_visiveis: [], // Vê apenas OSs delegadas ou onde é responsável
    descricao: 'Operacional - Vê apenas tarefas delegadas ou onde é responsável'
  },

  mao_de_obra: {
    nivel: 0,
    pode_ver_todas_os: false,
    pode_acessar_financeiro: false,
    pode_delegar: false,
    pode_aprovar: false,
    pode_gerenciar_usuarios: false,
    pode_criar_os: false,
    pode_cancelar_os: false,
    setores_visiveis: [],
    descricao: 'Sem acesso ao sistema - Usado apenas para presença e custos'
  }
};

// ============================================================
// FUNÇÕES HELPER DE PERMISSÕES
// ============================================================

/**
 * Retorna as permissões de um usuário baseado em seu cargo
 * @param user - Usuário do sistema
 * @returns Objeto com as permissões do cargo
 */
export function getPermissoes(user: User | null): Permissoes {
  if (!user) {
    return PERMISSOES_POR_ROLE.mao_de_obra; // Sem permissões
  }

  const role = user.cargo_slug || user.role_nivel || 'colaborador';
  return PERMISSOES_POR_ROLE[role] || PERMISSOES_POR_ROLE.colaborador;
}

/**
 * Verifica se o usuário pode acessar o módulo financeiro
 * @param user - Usuário do sistema
 * @returns true se pode acessar financeiro
 */
export function podeAcessarFinanceiro(user: User | null): boolean {
  return getPermissoes(user).pode_acessar_financeiro;
}

/**
 * Verifica se o usuário pode delegar tarefas
 * @param user - Usuário do sistema
 * @returns true se pode delegar
 */
export function podeDelegar(user: User | null): boolean {
  return getPermissoes(user).pode_delegar;
}

/**
 * Verifica se o usuário pode aprovar etapas
 * @param user - Usuário do sistema
 * @returns true se pode aprovar
 */
export function podeAprovar(user: User | null): boolean {
  return getPermissoes(user).pode_aprovar;
}

/**
 * Verifica se o usuário pode gerenciar outros usuários
 * @param user - Usuário do sistema
 * @returns true se pode gerenciar usuários
 */
export function podeGerenciarUsuarios(user: User | null): boolean {
  return getPermissoes(user).pode_gerenciar_usuarios;
}

/**
 * Verifica se o usuário pode ver todas as OSs (sem filtro de setor)
 * @param user - Usuário do sistema
 * @returns true se pode ver todas as OSs
 */
export function podeVerTodasOS(user: User | null): boolean {
  return getPermissoes(user).pode_ver_todas_os;
}

/**
 * Verifica se o usuário pode criar OSs
 * @param user - Usuário do sistema
 * @returns true se pode criar OSs
 */
export function podeCriarOS(user: User | null): boolean {
  return getPermissoes(user).pode_criar_os;
}

/**
 * Verifica se o usuário pode cancelar OSs
 * @param user - Usuário do sistema
 * @returns true se pode cancelar OSs
 */
export function podeCancelarOS(user: User | null): boolean {
  return getPermissoes(user).pode_cancelar_os;
}

/**
 * Verifica se o usuário pode ver um setor específico
 * @param user - Usuário do sistema
 * @param setor - Slug do setor a verificar
 * @returns true se pode ver o setor
 */
export function podeVerSetor(user: User | null, setor: SetorSlug): boolean {
  const permissoes = getPermissoes(user);

  if (permissoes.setores_visiveis === 'todos') {
    return true;
  }

  return permissoes.setores_visiveis.includes(setor);
}

/**
 * Retorna o nível hierárquico do usuário
 * @param user - Usuário do sistema
 * @returns Nível de 0 a 10
 */
export function getNivelHierarquico(user: User | null): number {
  return getPermissoes(user).nivel;
}

/**
 * Verifica se o usuário é gestor (nível >= 5)
 * @param user - Usuário do sistema
 * @returns true se é gestor
 */
export function isGestor(user: User | null): boolean {
  return getNivelHierarquico(user) >= 5;
}

/**
 * Verifica se o usuário é admin ou diretoria (nível >= 9)
 * @param user - Usuário do sistema
 * @returns true se é admin ou diretoria
 */
export function isAdminOuDiretoria(user: User | null): boolean {
  return getNivelHierarquico(user) >= 9;
}

/**
 * Normaliza setor para o padrão do banco (lowercase)
 *
 * Converte valores legados, aliases e sinônimos para os 4 setores oficiais:
 * - obras
 * - administrativo
 * - assessoria
 * - diretoria
 *
 * @param setor - Setor a ser normalizado (pode ser undefined)
 * @returns Setor normalizado (default: 'obras')
 *
 * @example
 * ```ts
 * normalizeSetorOS('OBRAS') // -> 'obras'
 * normalizeSetorOS('Laboratório') // -> 'obras'
 * normalizeSetorOS('adm') // -> 'administrativo'
 * normalizeSetorOS('comercial') // -> 'administrativo'
 * normalizeSetorOS('ass') // -> 'assessoria'
 * normalizeSetorOS(undefined) // -> 'obras'
 * ```
 */
export function normalizeSetorOS(setor: string | undefined | null): SetorSlug {
  // Default para obras se não informado
  if (!setor) return 'obras';

  const trimmed = setor.trim();
  const setorNormalizado = trimmed
    .toLowerCase()
    .normalize('NFD') // Normalizar unicode
    .replace(/[\u0300-\u036f]/g, ''); // Remover acentos

  const setorMap: Record<string, SetorSlug> = {
    // Valores corretos do banco
    'obras': 'obras',
    'administrativo': 'administrativo',
    'assessoria': 'assessoria',
    'diretoria': 'diretoria',

    // Aliases e sinônimos -> obras
    'laboratorio': 'obras',

    // Aliases e sinônimos -> administrativo
    'adm': 'administrativo',
    'comercial': 'administrativo',
    'financeiro': 'administrativo',

    // Aliases e sinônimos -> assessoria
    'ass': 'assessoria',
  };

  return setorMap[setorNormalizado] || 'obras';
}

// ============================================================
// TIPOS AUXILIARES (UI/COMPONENTS)
// ============================================================

export interface Comentario {
  id: string;
  texto: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  os_id?: string;
  user_id?: string;
}

export interface Documento {
  id: string;
  nome: string;
  url?: string;
  uploadedBy: string;
  uploadedAt: string;
  tipo?: string;
  tamanho?: number;
}

export interface HistoricoItem {
  id: string;
  tipo: 'status' | 'comentario' | 'documento' | 'atribuicao' | 'criacao' | 'edicao';
  descricao: string;
  userName: string;
  createdAt: string;
  metadados?: any;
}

// ============================================================
// CONSTANTES LEGADAS PARA COMPATIBILIDADE
// ============================================================

export const ROLE_PARA_NIVEL: Record<RoleLevel, NivelHierarquico> = {
  'admin': 10,
  'diretoria': 9,
  'gestor_administrativo': 5,
  'gestor_assessoria': 5,
  'gestor_obras': 5,
  'colaborador': 1,
  'mao_de_obra': 0,
};

export const SETOR_NAMES: Record<Setor, string> = {
  'COM': 'Comercial',
  'ASS': 'Assessoria',
  'OBR': 'Obras',
};

export const ROLE_NAMES: Record<RoleLevel, string> = ROLE_LABELS;

// Interface de Permissões Legada (para auth-utils.ts)
export interface PermissoesLegadas {
  acesso_setores: Setor[] | ['*'];
  pode_delegar_para: Setor[] | ['*'];
  pode_aprovar_setores: Setor[] | ['*'];
  acesso_modulos: string[];
}

export const PERMISSOES_POR_ROLE_LEGADO: Record<RoleLevel, PermissoesLegadas> = {
  'admin': {
    acesso_setores: ['*'],
    pode_delegar_para: ['*'],
    pode_aprovar_setores: ['*'],
    acesso_modulos: ['*'],
  },
  'diretoria': {
    acesso_setores: ['*'],
    pode_delegar_para: ['*'],
    pode_aprovar_setores: ['*'],
    acesso_modulos: ['financeiro', 'administrativo', 'comercial', 'obras', 'assessoria'],
  },
  'gestor_administrativo': {
    acesso_setores: ['*'],
    pode_delegar_para: ['*'],
    pode_aprovar_setores: ['*'],
    acesso_modulos: ['financeiro', 'administrativo', 'comercial', 'obras', 'assessoria'],
  },
  'gestor_obras': {
    acesso_setores: ['OBR'],
    pode_delegar_para: ['OBR'],
    pode_aprovar_setores: ['OBR'],
    acesso_modulos: ['obras'],
  },
  'gestor_assessoria': {
    acesso_setores: ['ASS'],
    pode_delegar_para: ['ASS'],
    pode_aprovar_setores: ['ASS'],
    acesso_modulos: ['assessoria'],
  },
  'colaborador': {
    acesso_setores: [],
    pode_delegar_para: [],
    pode_aprovar_setores: [],
    acesso_modulos: ['tarefas'],
  },
  'mao_de_obra': {
    acesso_setores: [],
    pode_delegar_para: [],
    pode_aprovar_setores: [],
    acesso_modulos: [],
  },
};

// ============================================================
// TIPOS PARA GERAÇÃO DE PDFs
// ============================================================

export type PDFType = 'proposta' | 'contrato' | 'memorial' | 'documento-sst' | 'parecer-reforma' | 'visita-tecnica' | 'laudo-tecnico';

export interface PDFGenerationRequest {
  tipo: PDFType;
  osId: string;
  dados: Record<string, unknown>;
}

export interface PDFGenerationResponse {
  success: boolean;
  url?: string;
  error?: string;
  metadata?: {
    filename: string;
    size: number;
    tipo: PDFType;
  };
}