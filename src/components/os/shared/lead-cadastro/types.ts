/**
 * Lead/Cliente Types
 * 
 * Tipos e interfaces para os componentes de cadastro de Lead e Cliente.
 * 
 * Arquitetura:
 * - LeadCadastro: Identificação + Edificação + Endereço (OS comerciais 1-4, 5-6)
 * - ClienteCompletar: Documentos do Cliente (OS execução 11, 12, 13)
 */

// ===========================================
// IDENTIFICAÇÃO DO CLIENTE
// ===========================================

export type TipoCliente = 'fisica' | 'juridica';

export type TipoEmpresa = 
  | 'condominio'
  | 'empresa_privada'
  | 'orgao_publico'
  | 'associacao'
  | 'outro';

export interface LeadIdentificacao {
  id?: string;
  nome: string;
  cpfCnpj: string;
  tipo: TipoCliente;
  tipoEmpresa?: TipoEmpresa;
  nomeResponsavel: string;
  cargoResponsavel: string;
  telefone: string;
  email: string;
  apelido?: string;
}

// ===========================================
// EDIFICAÇÃO
// ===========================================

export type TipoEdificacao = 
  | 'Condomínio Comercial'
  | 'Condomínio Residencial - Casas'
  | 'Condomínio Residencial - Apartamentos'
  | 'Hotel'
  | 'Shopping'
  | 'Hospital'
  | 'Indústria'
  | 'Igreja'
  | 'Outro';

export type TipoTelhado = 
  | 'Laje impermeabilizada'
  | 'Telhado cerâmico'
  | 'Telhado fibrocimento'
  | 'Telhado metálico'
  | 'Não se aplica'
  | 'Outros';

export interface LeadEdificacao {
  tipoEdificacao: TipoEdificacao | string;
  qtdUnidades: string;
  qtdBlocos: string;
  qtdPavimentos: string;
  tipoTelhado: TipoTelhado | string;
  possuiElevador: boolean;
  possuiPiscina: boolean;
}

// ===========================================
// ENDEREÇO
// ===========================================

export interface LeadEndereco {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

// ===========================================
// LEAD COMPLETO (para uso interno)
// ===========================================

export interface LeadCompleto {
  identificacao: LeadIdentificacao;
  edificacao: LeadEdificacao;
  endereco: LeadEndereco;
}

// ===========================================
// PROPS DOS COMPONENTES
// ===========================================

/**
 * Props para o componente LeadCadastro
 */
export interface LeadCadastroProps {
  /** ID do lead selecionado (se editando) */
  selectedLeadId?: string;
  
  /** Callback quando o lead muda (seleção ou criação) */
  onLeadChange: (leadId: string, leadData?: LeadCompleto) => void;
  
  /** Se o formulário está em modo somente leitura */
  readOnly?: boolean;
  
  /** Se deve mostrar a seção de edificação (default: true) */
  showEdificacao?: boolean;
  
  /** Se deve mostrar a seção de endereço (default: true) */
  showEndereco?: boolean;
  
  /** Dados iniciais do formulário */
  initialData?: Partial<LeadCompleto>;

  /** Filtro de status para o seletor (ex: 'lead', 'cliente' ou ['lead', 'ativo']) */
  statusFilter?: string | string[];
}

/**
 * Handle exposto via ref pelo LeadCadastro
 */
export interface LeadCadastroHandle {
  /** Valida todos os campos e retorna se é válido */
  validate: () => boolean;
  
  /** Verifica se o formulário está válido (sem marcar campos como touched) */
  isValid: () => boolean;
  
  /** Salva os dados e retorna o leadId criado/atualizado */
  save: () => Promise<string | null>;
  
  /** Retorna os dados atuais do formulário */
  getData: () => LeadCompleto;
}

// ===========================================
// CLIENTE - DOCUMENTOS
// ===========================================

/**
 * Tipos de documento do cliente
 * Nota: ata_eleicao é para condomínios, contrato_social para empresas
 */
export type TipoDocumentoCliente = 
  | 'documento_foto'        // RG ou CNH do responsável
  | 'comprovante_residencia' // Comprovante de residência do responsável
  | 'contrato_social'       // Contrato social (empresas)
  | 'ata_eleicao'           // Ata de eleição do síndico (condomínios)
  | 'logo_cliente';         // Logo do cliente (opcional)

export interface ClienteDocumentoUpload {
  tipo: TipoDocumentoCliente;
  arquivo?: File;
  url?: string;
  path?: string;
  nome?: string;
}

/**
 * Props para o componente ClienteCompletar
 */
export interface ClienteCompletarProps {
  /** ID do cliente */
  clienteId: string;
  
  /** Tipo de cliente (PF ou PJ) - usado para condicional de documentos */
  tipoCliente?: TipoCliente;
  
  /** Tipo de empresa (condomínio, empresa, etc.) - usado para condicional de documentos */
  tipoEmpresa?: TipoEmpresa;
  
  /** Se o formulário está em modo somente leitura */
  readOnly?: boolean;
  
  /** Callback quando os documentos são atualizados */
  onDocumentosChange?: (documentos: ClienteDocumentoUpload[]) => void;
  
  /** Callback quando o aniversário do gestor é atualizado */
  onAniversarioChange?: (data: Date | undefined) => void;
}


/**
 * Handle exposto via ref pelo ClienteCompletar
 */
export interface ClienteCompletarHandle {
  /** Valida se todos os documentos obrigatórios foram enviados */
  validate: () => boolean;
  
  /** Salva os documentos e dados adicionais do cliente */
  save: () => Promise<boolean>;
}

// ===========================================
// FORM DATA (compatibilidade com componentes existentes)
// ===========================================

/**
 * Interface completa para formulário (compatibilidade com cadastrar-lead.tsx)
 */
export interface FormDataCompleto {
  // Identificação
  nome: string;
  cpfCnpj: string;
  tipo: string;
  tipoEmpresa?: string;
  nomeResponsavel: string;
  cargoResponsavel: string;
  telefone: string;
  email: string;
  
  // Edificação
  tipoEdificacao: string;
  qtdUnidades: string;
  qtdBlocos: string;
  qtdPavimentos: string;
  tipoTelhado: string;
  possuiElevador: boolean;
  possuiPiscina: boolean;
  
  // Endereço
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

// ===========================================
// UTILITÁRIOS
// ===========================================

/**
 * Converte FormDataCompleto para LeadCompleto
 */
export function formDataToLeadCompleto(formData: FormDataCompleto): LeadCompleto {
  return {
    identificacao: {
      nome: formData.nome,
      cpfCnpj: formData.cpfCnpj,
      tipo: formData.tipo as TipoCliente,
      tipoEmpresa: formData.tipoEmpresa as TipoEmpresa,
      nomeResponsavel: formData.nomeResponsavel,
      cargoResponsavel: formData.cargoResponsavel,
      telefone: formData.telefone,
      email: formData.email,
    },
    edificacao: {
      tipoEdificacao: formData.tipoEdificacao,
      qtdUnidades: formData.qtdUnidades,
      qtdBlocos: formData.qtdBlocos,
      qtdPavimentos: formData.qtdPavimentos,
      tipoTelhado: formData.tipoTelhado,
      possuiElevador: formData.possuiElevador,
      possuiPiscina: formData.possuiPiscina,
    },
    endereco: {
      cep: formData.cep,
      rua: formData.endereco,
      numero: formData.numero,
      complemento: formData.complemento,
      bairro: formData.bairro,
      cidade: formData.cidade,
      estado: formData.estado,
    },
  };
}

/**
 * Converte LeadCompleto para FormDataCompleto
 */
export function leadCompletoToFormData(lead: LeadCompleto): FormDataCompleto {
  return {
    nome: lead.identificacao.nome,
    cpfCnpj: lead.identificacao.cpfCnpj,
    tipo: lead.identificacao.tipo,
    tipoEmpresa: lead.identificacao.tipoEmpresa,
    nomeResponsavel: lead.identificacao.nomeResponsavel,
    cargoResponsavel: lead.identificacao.cargoResponsavel,
    telefone: lead.identificacao.telefone,
    email: lead.identificacao.email,
    tipoEdificacao: lead.edificacao.tipoEdificacao,
    qtdUnidades: lead.edificacao.qtdUnidades,
    qtdBlocos: lead.edificacao.qtdBlocos,
    qtdPavimentos: lead.edificacao.qtdPavimentos,
    tipoTelhado: lead.edificacao.tipoTelhado,
    possuiElevador: lead.edificacao.possuiElevador,
    possuiPiscina: lead.edificacao.possuiPiscina,
    cep: lead.endereco.cep,
    endereco: lead.endereco.rua,
    numero: lead.endereco.numero,
    complemento: lead.endereco.complemento,
    bairro: lead.endereco.bairro,
    cidade: lead.endereco.cidade,
    estado: lead.endereco.estado,
  };
}

/**
 * FormDataCompleto vazio para inicialização
 */
export const EMPTY_FORM_DATA: FormDataCompleto = {
  nome: '',
  cpfCnpj: '',
  tipo: '',
  tipoEmpresa: undefined,
  nomeResponsavel: '',
  cargoResponsavel: '',
  telefone: '',
  email: '',
  tipoEdificacao: '',
  qtdUnidades: '',
  qtdBlocos: '',
  qtdPavimentos: '',
  tipoTelhado: '',
  possuiElevador: false,
  possuiPiscina: false,
  cep: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
};
