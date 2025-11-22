/**
 * Types para integração com Banco Cora
 *
 * Baseado na API REST do Banco Cora
 * Documentação: https://developers.cora.com.br
 */

// ==================== AUTENTICAÇÃO ====================

export interface CoraAuthConfig {
  clientId: string;
  privateKey: string;
  cert: string;
  tokenUrl: string;
}

export interface CoraTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// ==================== BOLETO ====================

export interface BoletoPayload {
  // Dados do Pagador
  pagador: {
    nome: string;
    cpfCnpj: string;
    endereco?: {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      uf: string;
      cep: string;
    };
  };

  // Dados do Boleto
  valor: number; // Valor em centavos (ex: 10000 = R$ 100,00)
  vencimento: string; // Data no formato ISO 8601 (YYYY-MM-DD)
  numeroDocumento: string; // Número do documento (ex: OS-2024-001)

  // Dados Opcionais
  descricao?: string;
  multa?: {
    tipo: 'PERCENTUAL' | 'VALOR_FIXO';
    valor: number; // Percentual ou valor em centavos
    data?: string; // Data de início da multa
  };
  juros?: {
    tipo: 'PERCENTUAL_MENSAL' | 'VALOR_DIARIO';
    valor: number;
  };
  desconto?: {
    tipo: 'PERCENTUAL' | 'VALOR_FIXO';
    valor: number;
    dataLimite: string;
  };

  // Mensagens no Boleto
  instrucoes?: string[]; // Array de até 5 instruções
  mensagemBeneficiario?: string;
}

export interface BoletoResponse {
  id: string; // ID do boleto no Cora
  nossoNumero: string;
  linhaDigitavel: string;
  codigoBarras: string;
  qrCode?: string; // PIX Copia e Cola (se habilitado)
  urlBoleto: string; // URL para download do PDF
  valor: number;
  vencimento: string;
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'EXPIRADO';
  dataCriacao: string;
  dataPagamento?: string;
}

// ==================== EXTRATO ====================

export interface ExtratoParams {
  dataInicio: string; // YYYY-MM-DD
  dataFim: string; // YYYY-MM-DD
  tipo?: 'ENTRADA' | 'SAIDA' | 'TODOS';
  page?: number;
  pageSize?: number;
}

export interface TransacaoExtrato {
  id: string;
  data: string; // ISO 8601
  tipo: 'ENTRADA' | 'SAIDA';
  descricao: string;
  valor: number; // Em centavos
  saldo: number; // Saldo após a transação
  categoria?: string;
  origem?: {
    tipo: 'BOLETO' | 'PIX' | 'TED' | 'DOC' | 'TRANSFERENCIA';
    identificador?: string;
  };
}

export interface ExtratoResponse {
  saldoInicial: number;
  saldoFinal: number;
  periodo: {
    inicio: string;
    fim: string;
  };
  transacoes: TransacaoExtrato[];
  paginacao: {
    paginaAtual: number;
    totalPaginas: number;
    totalRegistros: number;
  };
}

// ==================== WEBHOOK ====================

export interface WebhookEvent {
  id: string;
  tipo: WebhookEventType;
  timestamp: string; // ISO 8601
  data: BoletoWebhookData | PixWebhookData | TransferenciaWebhookData;
}

export type WebhookEventType =
  | 'BOLETO_CRIADO'
  | 'BOLETO_PAGO'
  | 'BOLETO_CANCELADO'
  | 'BOLETO_EXPIRADO'
  | 'PIX_RECEBIDO'
  | 'TRANSFERENCIA_CONFIRMADA'
  | 'TRANSFERENCIA_REJEITADA';

export interface BoletoWebhookData {
  boletoId: string;
  nossoNumero: string;
  numeroDocumento: string;
  valor: number;
  valorPago?: number;
  dataPagamento?: string;
  pagador: {
    nome: string;
    cpfCnpj: string;
  };
}

export interface PixWebhookData {
  pixId: string;
  txId: string;
  valor: number;
  pagador: {
    nome: string;
    cpfCnpj: string;
    banco?: string;
  };
  mensagem?: string;
}

export interface TransferenciaWebhookData {
  transferenciaId: string;
  tipo: 'TED' | 'DOC' | 'PIX';
  valor: number;
  destinatario: {
    nome: string;
    cpfCnpj: string;
    banco: string;
  };
  status: 'CONFIRMADA' | 'REJEITADA';
  motivoRejeicao?: string;
}

// ==================== ERRO ====================

export interface CoraErrorResponse {
  codigo: string;
  mensagem: string;
  detalhes?: Record<string, unknown>;
  timestamp: string;
}

// ==================== REQUEST/RESPONSE GENÉRICOS ====================

export interface CoraApiResponse<T> {
  success: boolean;
  data?: T;
  error?: CoraErrorResponse;
}

export interface WebhookValidationResult {
  valid: boolean;
  event?: WebhookEvent;
  error?: string;
}
