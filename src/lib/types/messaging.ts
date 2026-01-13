/**
 * Tipos para o sistema de mensagens unificado (WhatsApp e Email)
 */

export type MessageChannel = 'whatsapp' | 'email';

export type MessageStatus = 'pendente' | 'enviado' | 'entregue' | 'lido' | 'falhou';

export type ContextType = 'os' | 'cliente' | 'proposta' | 'contrato' | 'laudo';

export type DestinatarioTipo = 'cliente' | 'colaborador' | 'fornecedor' | 'outro';

export interface Attachment {
  filename: string;
  content: string; // Base64
  contentType: string;
  encoding?: string; // 'base64'
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: Attachment[];
}

export interface SendMessagePayload {
  canal: MessageChannel;
  destinatario: {
    tipo: DestinatarioTipo;
    id?: string;
    contato: string; // Email ou Telefone
    nome?: string;
  };
  conteudo: {
    templateId?: string;
    assunto?: string; // Obrigatório para Email
    corpo: string;
    variaveis?: Record<string, string>;
  };
  contexto?: {
    tipo: ContextType;
    id: string;
    codigo?: string;
  };
  anexos?: Attachment[];
}

export interface MensagemEnviada {
  id: string;
  canal: MessageChannel;
  destinatario_nome: string;
  destinatario_contato: string;
  assunto?: string;
  corpo: string;
  status: MessageStatus;
  enviado_em: string;
  erro_mensagem?: string;
}
