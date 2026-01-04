/**
 * ClientInviteService - Serviço para gerenciar convites de acesso ao portal de clientes
 * 
 * Integra com Edge Function 'invite-client' para enviar convites por e-mail
 */

import { supabase } from '../supabase-client';
import { logger } from '../utils/logger';

export interface InviteClientPayload {
  clienteId: string;
  email: string;
  nomeCliente: string;
  osId?: string;
}

export interface InviteClientResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: {
    id: string;
    email: string;
    created_at: string;
  };
}

export interface InviteStatus {
  hasInvite: boolean;
  invitedAt?: string;
  inviteAccepted: boolean;
  authUserId?: string;
  portalAtivo: boolean;
}

/**
 * Envia convite de acesso ao portal para o cliente
 * Usa a Edge Function 'invite-user' com flag is_client para evitar criação de colaborador
 */
export async function sendClientInvite(payload: InviteClientPayload): Promise<InviteClientResponse> {
  try {
    logger.log('📧 Enviando convite ao cliente:', payload.email);

    // Primeiro, verificar se usuário já existe via RPC
    const { data: existingUser } = await supabase
      .rpc('find_auth_user_by_email', { user_email: payload.email });

    // Se usuário já existe, apenas vincular
    if (existingUser && existingUser.length > 0) {
      const authUserId = existingUser[0].id;
      logger.log('👤 Usuário já existe, vinculando ao cliente:', authUserId);

      const { error: updateError } = await supabase
        .from('clientes')
        .update({
          portal_convidado_em: new Date().toISOString(),
          auth_user_id: authUserId
        })
        .eq('id', payload.clienteId);

      if (updateError) {
        logger.error('❌ Erro ao vincular usuário ao cliente:', updateError);
        return {
          success: false,
          error: 'Erro ao vincular usuário existente ao cliente'
        };
      }

      return {
        success: true,
        message: 'Usuário já possui conta. Acesso ao portal vinculado!',
        user: {
          id: authUserId,
          email: payload.email,
          created_at: new Date().toISOString()
        }
      };
    }

    // Usar invite-client (função específica para portal de clientes)
    const { data, error } = await supabase.functions.invoke('invite-client', {
      body: {
        clienteId: payload.clienteId,
        email: payload.email,
        nomeCliente: payload.nomeCliente,
        osId: payload.osId
      }
    });

    if (error) {
      logger.error('❌ Erro ao enviar convite:', error);
      return {
        success: false,
        error: error.message || 'Erro ao enviar convite'
      };
    }

    // Verificar se o convite foi enviado com sucesso
    // invite-client retorna { success: true, message: "...", user: { id: "...", ... } }
    if (data?.success) {
      const userId = data.user.id;

      // Atualizar cliente com auth_user_id
      await supabase
        .from('clientes')
        .update({
          portal_convidado_em: new Date().toISOString(),
          auth_user_id: userId
        })
        .eq('id', payload.clienteId);

      logger.log('✅ Convite enviado com sucesso:', data);
      return {
        success: true,
        message: 'Convite enviado com sucesso! O cliente receberá um email.',
        user: {
          id: userId,
          email: payload.email,
          created_at: new Date().toISOString()
        }
      };
    }

    // Se falhou, retornar erro
    const failedReason = data?.results?.failed?.[0]?.error || 'Erro desconhecido';
    logger.error('❌ Falha ao enviar convite:', failedReason);
    return {
      success: false,
      error: failedReason
    };

  } catch (err) {
    logger.error('❌ Erro inesperado ao enviar convite:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro inesperado'
    };
  }
}

/**
 * Verifica se cliente já possui convite/acesso ao portal
 */
export async function checkClientInviteStatus(clienteId: string): Promise<InviteStatus> {
  try {
    // Tentar buscar com portal_ativo (se a coluna existir)
    let data;
    let error;

    // Primeiro tenta com portal_ativo
    const result = await supabase
      .from('clientes')
      .select('auth_user_id, portal_convidado_em, portal_ativo')
      .eq('id', clienteId)
      .single();

    // Se der erro 42703 (coluna não existe), tenta sem portal_ativo
    if (result.error?.code === '42703') {
      logger.log('⚠️ Coluna portal_ativo não existe ainda, usando fallback');
      const fallback = await supabase
        .from('clientes')
        .select('auth_user_id, portal_convidado_em')
        .eq('id', clienteId)
        .single();

      data = fallback.data;
      error = fallback.error;
    } else {
      data = result.data;
      error = result.error;
    }

    if (error) {
      logger.warn('⚠️ Erro ao verificar status do convite:', error);
      return { hasInvite: false, inviteAccepted: false, portalAtivo: true };
    }

    const hasInvite = !!data?.portal_convidado_em;
    const inviteAccepted = !!data?.auth_user_id;
    // portal_ativo defaults to true if not set or column doesn't exist
    const portalAtivo = (data as any)?.portal_ativo !== false;

    return {
      hasInvite,
      invitedAt: data?.portal_convidado_em,
      inviteAccepted,
      authUserId: data?.auth_user_id,
      portalAtivo
    };

  } catch (err) {
    logger.error('❌ Erro ao verificar status do convite:', err);
    return { hasInvite: false, inviteAccepted: false, portalAtivo: true };
  }
}

/**
 * Reenvia convite para cliente que já foi convidado mas não aceitou
 */
export async function resendClientInvite(payload: InviteClientPayload): Promise<InviteClientResponse> {
  try {
    // Verificar se já existe convite aceito
    const status = await checkClientInviteStatus(payload.clienteId);

    if (status.inviteAccepted) {
      return {
        success: false,
        error: 'Cliente já possui acesso ao portal'
      };
    }

    // Reenviar convite
    return sendClientInvite(payload);

  } catch (err) {
    logger.error('❌ Erro ao reenviar convite:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro inesperado'
    };
  }
}

/**
 * Toggle de acesso ao portal do cliente (ativar/desativar)
 */
export async function togglePortalAccess(
  clienteId: string,
  ativo: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    logger.log(`🔄 Toggle acesso portal: ${ativo ? 'ATIVANDO' : 'DESATIVANDO'}`, { clienteId });

    const { error } = await supabase
      .from('clientes')
      .update({ portal_ativo: ativo })
      .eq('id', clienteId);

    if (error) {
      logger.error('❌ Erro ao atualizar acesso ao portal:', error);
      return {
        success: false,
        error: error.message
      };
    }

    logger.log(`✅ Acesso ao portal ${ativo ? 'ativado' : 'desativado'} com sucesso`);
    return { success: true };

  } catch (err) {
    logger.error('❌ Erro inesperado ao toggle acesso:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro inesperado'
    };
  }
}

export const ClientInviteService = {
  sendInvite: sendClientInvite,
  checkStatus: checkClientInviteStatus,
  resendInvite: resendClientInvite,
  togglePortalAccess: togglePortalAccess
};

export default ClientInviteService;
