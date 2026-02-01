// Types para o módulo Colaborador
import { RoleLevel, SetorSlug, OSStatus, ClienteStatus } from "@/lib/types";

export type UserRole = RoleLevel;
export type UserSetor = SetorSlug;

export interface Usuario {
  id: string;
  nome: string;
  nome_completo?: string;
  email?: string;
  role_nivel?: UserRole;
  setor?: UserSetor;
  telefone?: string;
  avatar?: string;
  
  // Campos adicionais para compatibilidade
  cargo_slug?: RoleLevel;
  setor_slug?: SetorSlug;
  cargo_id?: string;
  setor_id?: string;
  ativo?: boolean;
  data_admissao?: Date | string;
  cpf?: string;
  
  // Novos campos (Migration 20251130000008)
  tipo_contratacao?: 'CLT' | 'PJ' | 'ESTAGIO' | string;
  salario_base?: number;
  custo_dia?: number;
  custo_mensal?: number;
  funcao?: string;
  avatar_url?: string;

  // Campos adicionais (Migration 20251130_add_colaborador_fields)
  data_nascimento?: string;
  endereco?: string;
  email_pessoal?: string;
  email_profissional?: string;
  telefone_pessoal?: string;
  telefone_profissional?: string;
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
  disponibilidade_dias?: string[];
  turno?: string[];
  qualificacao?: string;
  gestor?: string;
  remuneracao_contratual?: number;
  dia_vencimento?: number;
  rateio_fixo?: string;
  bloqueado_sistema?: boolean;

  // Campos de endereço detalhado
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;

  rateio_fixo_id?: string;
  role_id?: string;

  // Dados bancários
  banco?: string;
  agencia?: string;
  conta?: string;
  chave_pix?: string;

  // Documentos e convite
  documentos_obrigatorios?: Record<string, any>;
  status_convite?: string;
  auth_user_id?: string;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export type Colaborador = Usuario;

// Ordem de Serviço
export type TipoOS = 
  | "OS_01" | "OS_02" | "OS_03" | "OS_04" 
  | "OS_05" | "OS_06" | "OS_07" | "OS_08" 
  | "OS_09" | "OS_10" | "OS_11" | "OS_12" | "OS_13";

export type StatusOS = OSStatus | "AGUARDANDO_APROVACAO" | "ATRASADO" | "PENDENTE";

export type Prioridade = "ALTA" | "MEDIA" | "BAIXA";

export type EtapaOS = 
  | "IDENTIFICACAO_LEAD"
  | "FOLLOW_UP_1"
  | "FOLLOW_UP_2"
  | "FOLLOW_UP_3"
  | "VISITA_TECNICA"
  | "ELABORACAO_PROPOSTA"
  | "NEGOCIACAO"
  | "APROVACAO_CLIENTE"
  | "FORMALIZACAO_CONTRATO"
  | "VISTORIA"
  | "ANALISE_TECNICA"
  | "ELABORACAO_PROJETO"
  | "APROVACAO_ORGAOS"
  | "EXECUCAO"
  | "FINALIZACAO";

export interface OrdemServico {
  id: string;
  codigo: string;
  tipo: TipoOS;
  cliente: string;
  endereco: string;
  telefone?: string;
  etapaAtual: EtapaOS;
  status: StatusOS;
  prioridade: Prioridade;
  prazo: string; // ISO date string
  responsavel: string;
  descricao?: string;
  criadoEm: string; // ISO date string
  atualizadoEm?: string; // ISO date string
}

// Cliente
export type TipoCliente = "PESSOA_FISICA" | "PESSOA_JURIDICA";
// Usando ClienteStatus do types.ts mas mantendo compatibilidade se necessário
export type StatusCliente = ClienteStatus | "PROSPECTO";

export interface Cliente {
  id: string;
  nome: string;
  cpf?: string;
  cnpj?: string;
  endereco: string;
  cep: string;
  telefone: string;
  email: string;
  tipo: TipoCliente;
  status: StatusCliente;
  observacoes?: string;
}

// Eventos/Agenda
export type TipoEvento = 
  | "VISTORIA" 
  | "REUNIAO" 
  | "FOLLOW_UP" 
  | "VISITA_TECNICA" 
  | "ENTREGA";

export interface EventoAgenda {
  id: string;
  titulo: string;
  osId: string;
  osCodigo: string;
  cliente: string;
  endereco: string;
  data: string; // ISO date string
  horaInicio: string; // HH:MM
  horaFim: string; // HH:MM
  tipo: TipoEvento;
  responsavel: string;
  observacoes?: string;
}

// Leads (Comercial)
export type OrigemLead = 
  | "SITE" 
  | "TELEFONE" 
  | "EMAIL" 
  | "INDICACAO" 
  | "REDES_SOCIAIS"
  | "EVENTO"
  | "PARCEIRO";

export type StatusLead = 
  | "NOVO" 
  | "EM_CONTATO" 
  | "QUALIFICADO" 
  | "NAO_QUALIFICADO" 
  | "CONVERTIDO"
  | "PERDIDO";

export type PotencialLead = "ALTO" | "MEDIO" | "BAIXO";

export interface Lead {
  id: string;
  nome: string; // Nome da empresa
  contato: string; // Nome do contato
  telefone: string;
  email: string;
  origem: OrigemLead;
  status: StatusLead;
  potencial: PotencialLead;
  observacoes?: string;
  criadoPor: string;
  criadoEm: string; // ISO date string
  atualizadoEm?: string; // ISO date string
}

// Formulário de Execução
export interface ChecklistVistoria {
  estrutura: boolean;
  instalacoes: boolean;
  acabamento: boolean;
  seguranca: boolean;
  acessibilidade: boolean;
}

export interface FormularioExecucao {
  osId: string;
  etapa: EtapaOS;
  observacoes: string;
  checklistItems?: ChecklistVistoria;
  medicoes?: string;
  fotos?: File[];
  dataConclusao?: string;
}

// KPIs Dashboard
export interface KPIsColaborador {
  osEmAberto: number;
  tarefasHoje: number;
  prazosVencidos: number;
  tarefasConcluidas?: number;
  produtividade?: number; // percentual
}

// Navigation
export interface NavigationCard {
  id: string;
  title: string;
  description: string;
  icon: any; // Lucide icon component
  href: string;
  color: string;
  available: boolean;
  badge?: string;
}

