// Types para o módulo Colaborador

export type UserRole = 1 | 2 | 3 | 4;
export type UserSetor = "ADMINISTRATIVO" | "ASSESSORIA" | "OBRAS";

export interface Usuario {
  id: number;
  nome: string;
  email?: string;
  role_nivel: UserRole;
  setor: UserSetor;
  telefone?: string;
  avatar?: string;
}

// Ordem de Serviço
export type TipoOS = 
  | "OS_01" | "OS_02" | "OS_03" | "OS_04" 
  | "OS_05" | "OS_06" | "OS_07" | "OS_08" 
  | "OS_09" | "OS_10" | "OS_11" | "OS_12" | "OS_13";

export type StatusOS = 
  | "PENDENTE" 
  | "EM_ANDAMENTO" 
  | "ATRASADO" 
  | "CONCLUIDO" 
  | "CANCELADO"
  | "AGUARDANDO_APROVACAO";

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
  id: number;
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
export type StatusCliente = "ATIVO" | "INATIVO" | "PROSPECTO";

export interface Cliente {
  id: number;
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
  id: number;
  titulo: string;
  osId: number;
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
  id: number;
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
  osId: number;
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
