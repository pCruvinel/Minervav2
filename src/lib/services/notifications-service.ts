import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/utils/logger';

export interface Notification {
  id: string;
  usuario_id: string;
  titulo: string;
  mensagem: string;
  link_acao?: string;
  lida: boolean;
  tipo: 'info' | 'atencao' | 'sucesso' | 'tarefa';
  created_at: string;
}

export type CreateNotificationParams = Omit<Notification, 'id' | 'created_at' | 'lida'>;

export const NotificationService = {
  /**
   * Cria uma nova notificação para um usuário
   */
  async create(notification: CreateNotificationParams): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .insert(notification)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao criar notificação:', error);
      return null;
    }
  },

  /**
   * Lista notificações de um usuário
   */
  async list(userId: string, limit = 20, unreadOnly = false): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notificacoes')
        .select('*')
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (unreadOnly) {
        query = query.eq('lida', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Erro ao listar notificações:', error);
      return [];
    }
  },

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Erro ao marcar notificação como lida:', error);
      return false;
    }
  },

  /**
   * Marca todas as notificações de um usuário como lidas
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('usuario_id', userId)
        .eq('lida', false);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Erro ao marcar todas notificações como lidas:', error);
      return false;
    }
  },

  /**
   * Notifica sobre a criação de uma nova OS
   */
  async notifyOSCreated(params: {
    osId: string;
    codigoOS: string;
    tipoOS: string;
    clienteNome: string;
    criadoPorId: string;
    criadoPorNome: string;
    responsavelId: string;
  }): Promise<void> {
    await NotificationService.create({
      usuario_id: params.responsavelId,
      titulo: `🆕 Nova OS Criada: ${params.codigoOS}`,
      mensagem: `${params.criadoPorNome} criou uma nova ${params.tipoOS} para o cliente **${params.clienteNome}**. Aguardando sua ação.`,
      link_acao: `/os/${params.osId}`,
      tipo: 'tarefa',
    });
  },

  async notifyDocumentoAnexado(params: {
    osId: string;
    codigoOS: string;
    clienteNome: string;
    tipoDocumento: string;
    anexadoPorNome: string;
    responsavelId: string;
  }): Promise<void> {
    await NotificationService.create({
      usuario_id: params.responsavelId,
      titulo: `📎 Documento Anexado: ${params.codigoOS}`,
      mensagem: `${params.anexadoPorNome} anexou um(a) **${params.tipoDocumento}** na OS de **${params.clienteNome}**.`,
      link_acao: `/os/${params.osId}`,
      tipo: 'info',
    });
  },

  async notifyComentarioAdicionado(params: {
    osId: string;
    codigoOS: string;
    comentarioPor: string;
    comentarioPreview: string;
    destinatarioId: string;
  }): Promise<void> {
    await NotificationService.create({
      usuario_id: params.destinatarioId,
      titulo: `💬 Novo Comentário: ${params.codigoOS}`,
      mensagem: `${params.comentarioPor}: "${params.comentarioPreview}..."`,
      link_acao: `/os/${params.osId}`,
      tipo: 'info',
    });
  },

  async notifyChatMensagem(params: {
    osId: string;
    codigoOS: string;
    remetente: string;
    mensagemPreview: string;
    destinatarioId: string;
  }): Promise<void> {
    await NotificationService.create({
      usuario_id: params.destinatarioId,
      titulo: `💬 Nova Mensagem: ${params.codigoOS}`,
      mensagem: `${params.remetente}: "${params.mensagemPreview}"`,
      link_acao: `/os/${params.osId}`,
      tipo: 'info',
    });
  }
};
