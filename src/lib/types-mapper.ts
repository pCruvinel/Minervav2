/**
 * ============================================================
 * TYPES MAPPER - Mapeamento Seguro de Tipos do Banco de Dados
 * ============================================================
 *
 * Este arquivo fornece funções utilitárias para converter strings
 * do banco de dados para tipos TypeScript corretos com fallbacks
 * de segurança.
 *
 * PRINCÍPIOS:
 * - O banco de dados é a fonte da verdade
 * - TypeScript se adapta ao banco, não o contrário
 * - Nunca use 'any' ou 'as string'
 * - Sempre forneça fallbacks seguros
 *
 * ATUALIZAÇÃO:
 * Execute 'npm run update-types' sempre que houver mudanças
 * nos ENUMs do banco de dados.
 * ============================================================
 */

import { Database } from '../types/supabase';

// ============================================================
// TIPOS BASE
// ============================================================

type ClienteStatus = Database['public']['Enums']['cliente_status'];
type TipoCliente = Database['public']['Enums']['tipo_cliente'];
type OSStatusGeral = Database['public']['Enums']['os_status_geral'];
type OSEtapaStatus = Database['public']['Enums']['os_etapa_status'];
type AgendamentoStatus = Database['public']['Enums']['agendamento_status'];
type PresencaStatus = Database['public']['Enums']['presenca_status'];
type PerformanceAvaliacao = Database['public']['Enums']['performance_avaliacao'];
type FinanceiroTipo = Database['public']['Enums']['financeiro_tipo'];
type CCTipo = Database['public']['Enums']['cc_tipo'];
type UserRoleNivel = Database['public']['Enums']['user_role_nivel'];
type UserSetor = Database['public']['Enums']['user_setor'];
type DelegacaoStatus = Database['public']['Enums']['delegacao_status'];

// ============================================================
// LISTAS DE VALORES VÁLIDOS
// ============================================================

const CLIENTE_STATUS_VALUES: ClienteStatus[] = [
  'LEAD',
  'CLIENTE_ATIVO',
  'CLIENTE_INATIVO'
];

const TIPO_CLIENTE_VALUES: TipoCliente[] = [
  'PESSOA_FISICA',
  'CONDOMINIO',
  'CONSTRUTORA',
  'INCORPORADORA',
  'INDUSTRIA',
  'COMERCIO',
  'OUTRO'
];

const OS_STATUS_GERAL_VALUES: OSStatusGeral[] = [
  'EM_TRIAGEM',
  'AGUARDANDO_INFORMACOES',
  'EM_ANDAMENTO',
  'EM_VALIDACAO',
  'ATRASADA',
  'CONCLUIDA',
  'CANCELADA',
  'PAUSADA',
  'AGUARDANDO_CLIENTE'
];

const OS_ETAPA_STATUS_VALUES: OSEtapaStatus[] = [
  'PENDENTE',
  'EM_ANDAMENTO',
  'AGUARDANDO_APROVACAO',
  'APROVADA',
  'REJEITADA'
];

const AGENDAMENTO_STATUS_VALUES: AgendamentoStatus[] = [
  'AGENDADO',
  'CONFIRMADO',
  'REALIZADO',
  'CANCELADO'
];

const PRESENCA_STATUS_VALUES: PresencaStatus[] = [
  'PRESENTE',
  'ATRASO',
  'FALTA_JUSTIFICADA',
  'FALTA_INJUSTIFICADA',
  'FERIAS',
  'FOLGA',
  'ATESTADO',
  'LICENCA'
];

const PERFORMANCE_AVALIACAO_VALUES: PerformanceAvaliacao[] = [
  'EXCELENTE',
  'BOM',
  'REGULAR',
  'INSATISFATORIO'
];

const FINANCEIRO_TIPO_VALUES: FinanceiroTipo[] = [
  'RECEITA',
  'DESPESA'
];

const CC_TIPO_VALUES: CCTipo[] = [
  'ASSESSORIA',
  'OBRA',
  'INTERNO',
  'ADMINISTRATIVO',
  'LABORATORIO',
  'COMERCIAL',
  'GERAL'
];

const USER_ROLE_NIVEL_VALUES: UserRoleNivel[] = [
  'MOBRA',
  'COLABORADOR_COMERCIAL',
  'COLABORADOR_ASSESSORIA',
  'COLABORADOR_OBRAS',
  'GESTOR_COMERCIAL',
  'GESTOR_ASSESSORIA',
  'GESTOR_OBRAS',
  'DIRETORIA',
  'GESTOR_ADMINISTRATIVO',
  'COLABORADOR_ADMINISTRATIVO'
];

const USER_SETOR_VALUES: UserSetor[] = [
  'COMERCIAL',
  'ASSESSORIA',
  'OBRAS',
  'ADMINISTRATIVO'
];

const DELEGACAO_STATUS_VALUES: DelegacaoStatus[] = [
  'PENDENTE',
  'EM_PROGRESSO',
  'CONCLUIDA',
  'REPROVADA'
];

// ============================================================
// FUNÇÕES DE MAPEAMENTO
// ============================================================

/**
 * Converte string para ClienteStatus com fallback seguro
 * @param status - Status do banco de dados
 * @returns ClienteStatus válido (padrão: 'LEAD')
 */
export const safeClienteStatus = (status: string | null | undefined): ClienteStatus => {
  if (!status) return 'LEAD';
  const normalized = status.toUpperCase().replace(/\s+/g, '_') as ClienteStatus;
  return CLIENTE_STATUS_VALUES.includes(normalized) ? normalized : 'LEAD';
};

/**
 * Converte string para TipoCliente com fallback seguro
 * @param tipo - Tipo do banco de dados
 * @returns TipoCliente válido (padrão: 'OUTRO')
 */
export const safeTipoCliente = (tipo: string | null | undefined): TipoCliente => {
  if (!tipo) return 'OUTRO';
  const normalized = tipo.toUpperCase().replace(/\s+/g, '_') as TipoCliente;
  return TIPO_CLIENTE_VALUES.includes(normalized) ? normalized : 'OUTRO';
};

/**
 * Converte string para OSStatusGeral com fallback seguro
 * @param status - Status do banco de dados
 * @returns OSStatusGeral válido (padrão: 'EM_TRIAGEM')
 */
export const safeOSStatusGeral = (status: string | null | undefined): OSStatusGeral => {
  if (!status) return 'EM_TRIAGEM';
  const normalized = status.toUpperCase().replace(/\s+/g, '_') as OSStatusGeral;
  return OS_STATUS_GERAL_VALUES.includes(normalized) ? normalized : 'EM_TRIAGEM';
};

/**
 * Converte string para OSEtapaStatus com fallback seguro
 * @param status - Status do banco de dados
 * @returns OSEtapaStatus válido (padrão: 'PENDENTE')
 */
export const safeOSEtapaStatus = (status: string | null | undefined): OSEtapaStatus => {
  if (!status) return 'PENDENTE';
  const normalized = status.toUpperCase().replace(/\s+/g, '_') as OSEtapaStatus;
  return OS_ETAPA_STATUS_VALUES.includes(normalized) ? normalized : 'PENDENTE';
};

/**
 * Converte string para AgendamentoStatus com fallback seguro
 * @param status - Status do banco de dados
 * @returns AgendamentoStatus válido (padrão: 'AGENDADO')
 */
export const safeAgendamentoStatus = (status: string | null | undefined): AgendamentoStatus => {
  if (!status) return 'AGENDADO';
  const normalized = status.toUpperCase().replace(/\s+/g, '_') as AgendamentoStatus;
  return AGENDAMENTO_STATUS_VALUES.includes(normalized) ? normalized : 'AGENDADO';
};

/**
 * Converte string para PresencaStatus com fallback seguro
 * @param status - Status do banco de dados
 * @returns PresencaStatus válido (padrão: 'PRESENTE')
 */
export const safePresencaStatus = (status: string | null | undefined): PresencaStatus => {
  if (!status) return 'PRESENTE';
  const normalized = status.toUpperCase().replace(/\s+/g, '_') as PresencaStatus;
  return PRESENCA_STATUS_VALUES.includes(normalized) ? normalized : 'PRESENTE';
};

/**
 * Converte string para PerformanceAvaliacao com fallback seguro
 * @param avaliacao - Avaliação do banco de dados
 * @returns PerformanceAvaliacao válido (padrão: 'REGULAR')
 */
export const safePerformanceAvaliacao = (avaliacao: string | null | undefined): PerformanceAvaliacao => {
  if (!avaliacao) return 'REGULAR';
  const normalized = avaliacao.toUpperCase().replace(/\s+/g, '_') as PerformanceAvaliacao;
  return PERFORMANCE_AVALIACAO_VALUES.includes(normalized) ? normalized : 'REGULAR';
};

/**
 * Converte string para FinanceiroTipo com fallback seguro
 * @param tipo - Tipo do banco de dados
 * @returns FinanceiroTipo válido (padrão: 'DESPESA')
 */
export const safeFinanceiroTipo = (tipo: string | null | undefined): FinanceiroTipo => {
  if (!tipo) return 'DESPESA';
  const normalized = tipo.toUpperCase().replace(/\s+/g, '_') as FinanceiroTipo;
  return FINANCEIRO_TIPO_VALUES.includes(normalized) ? normalized : 'DESPESA';
};

/**
 * Converte string para CCTipo com fallback seguro
 * @param tipo - Tipo do banco de dados
 * @returns CCTipo válido (padrão: 'GERAL')
 */
export const safeCCTipo = (tipo: string | null | undefined): CCTipo => {
  if (!tipo) return 'GERAL';
  const normalized = tipo.toUpperCase().replace(/\s+/g, '_') as CCTipo;
  return CC_TIPO_VALUES.includes(normalized) ? normalized : 'GERAL';
};

/**
 * Converte string para UserRoleNivel com fallback seguro
 * @param role - Role do banco de dados
 * @returns UserRoleNivel válido (padrão: 'COLABORADOR_ADMINISTRATIVO')
 */
export const safeUserRoleNivel = (role: string | null | undefined): UserRoleNivel => {
  if (!role) return 'COLABORADOR_ADMINISTRATIVO';
  const normalized = role.toUpperCase().replace(/\s+/g, '_') as UserRoleNivel;
  return USER_ROLE_NIVEL_VALUES.includes(normalized) ? normalized : 'COLABORADOR_ADMINISTRATIVO';
};

/**
 * Converte string para UserSetor com fallback seguro
 * @param setor - Setor do banco de dados
 * @returns UserSetor válido (padrão: 'ADMINISTRATIVO')
 */
export const safeUserSetor = (setor: string | null | undefined): UserSetor => {
  if (!setor) return 'ADMINISTRATIVO';
  const normalized = setor.toUpperCase().replace(/\s+/g, '_') as UserSetor;
  return USER_SETOR_VALUES.includes(normalized) ? normalized : 'ADMINISTRATIVO';
};

/**
 * Converte string para DelegacaoStatus com fallback seguro
 * @param status - Status do banco de dados
 * @returns DelegacaoStatus válido (padrão: 'PENDENTE')
 */
export const safeDelegacaoStatus = (status: string | null | undefined): DelegacaoStatus => {
  if (!status) return 'PENDENTE';
  const normalized = status.toUpperCase().replace(/\s+/g, '_') as DelegacaoStatus;
  return DELEGACAO_STATUS_VALUES.includes(normalized) ? normalized : 'PENDENTE';
};

// ============================================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================================

/**
 * Verifica se um valor é um ClienteStatus válido
 */
export const isValidClienteStatus = (value: unknown): value is ClienteStatus => {
  return typeof value === 'string' && CLIENTE_STATUS_VALUES.includes(value as ClienteStatus);
};

/**
 * Verifica se um valor é um TipoCliente válido
 */
export const isValidTipoCliente = (value: unknown): value is TipoCliente => {
  return typeof value === 'string' && TIPO_CLIENTE_VALUES.includes(value as TipoCliente);
};

/**
 * Verifica se um valor é um OSStatusGeral válido
 */
export const isValidOSStatusGeral = (value: unknown): value is OSStatusGeral => {
  return typeof value === 'string' && OS_STATUS_GERAL_VALUES.includes(value as OSStatusGeral);
};

/**
 * Verifica se um valor é um OSEtapaStatus válido
 */
export const isValidOSEtapaStatus = (value: unknown): value is OSEtapaStatus => {
  return typeof value === 'string' && OS_ETAPA_STATUS_VALUES.includes(value as OSEtapaStatus);
};

// ============================================================
// EXPORTAÇÕES DE CONSTANTES
// ============================================================

export {
  CLIENTE_STATUS_VALUES,
  TIPO_CLIENTE_VALUES,
  OS_STATUS_GERAL_VALUES,
  OS_ETAPA_STATUS_VALUES,
  AGENDAMENTO_STATUS_VALUES,
  PRESENCA_STATUS_VALUES,
  PERFORMANCE_AVALIACAO_VALUES,
  FINANCEIRO_TIPO_VALUES,
  CC_TIPO_VALUES,
  USER_ROLE_NIVEL_VALUES,
  USER_SETOR_VALUES,
  DELEGACAO_STATUS_VALUES,
};

// ============================================================
// TIPOS EXPORTADOS
// ============================================================

export type {
  ClienteStatus,
  TipoCliente,
  OSStatusGeral,
  OSEtapaStatus,
  AgendamentoStatus,
  PresencaStatus,
  PerformanceAvaliacao,
  FinanceiroTipo,
  CCTipo,
  UserRoleNivel,
  UserSetor,
  DelegacaoStatus,
};
