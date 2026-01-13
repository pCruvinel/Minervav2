import { useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/utils/logger';
import {
  useAppSettings,
  EVOLUTION_API_URL_KEY,
  EVOLUTION_API_KEY_KEY,
  EVOLUTION_INSTANCE_NAME_KEY,
} from '@/lib/hooks/use-app-settings';

// ============================================================
// Types
// ============================================================

export interface SendWhatsAppPayload {
  telefone: string;
  mensagem: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'document' | 'audio' | 'video';
  fileName?: string;
}

export interface SendWhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface UseSendWhatsAppReturn {
  sendWhatsApp: (payload: SendWhatsAppPayload) => Promise<SendWhatsAppResult>;
  isLoading: boolean;
  isConnected: boolean;
  error: Error | null;
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Formata número de telefone para formato internacional
 * Remove caracteres especiais e adiciona código do país se necessário
 */
export function formatPhoneNumber(phone: string): string {
  // Remove tudo que não é número
  const digits = phone.replace(/\D/g, '');

  // Se começa com 0, remove
  let formatted = digits.startsWith('0') ? digits.slice(1) : digits;

  // Se não tem código do país (55), adiciona
  if (!formatted.startsWith('55') && formatted.length <= 11) {
    formatted = '55' + formatted;
  }

  return formatted;
}

// ============================================================
// Hook
// ============================================================

export function useSendWhatsApp(): UseSendWhatsAppReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { settings, isLoading: isLoadingSettings } = useAppSettings([
    EVOLUTION_API_URL_KEY,
    EVOLUTION_API_KEY_KEY,
    EVOLUTION_INSTANCE_NAME_KEY,
  ]);

  const apiUrl = settings[EVOLUTION_API_URL_KEY];
  const apiKey = settings[EVOLUTION_API_KEY_KEY];
  const instanceName = settings[EVOLUTION_INSTANCE_NAME_KEY];

  const isConnected = !!(apiUrl && apiKey && instanceName);

  const sendWhatsApp = async (payload: SendWhatsAppPayload): Promise<SendWhatsAppResult> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isConnected) {
        throw new Error('WhatsApp não configurado. Acesse Configurações > Sistema para configurar.');
      }

      const formattedPhone = formatPhoneNumber(payload.telefone);
      logger.log('[useSendWhatsApp] Sending message to:', formattedPhone);

      // Endpoint da Evolution API para envio de mensagem de texto
      const endpoint = `${apiUrl}/message/sendText/${instanceName}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
        },
        body: JSON.stringify({
          number: formattedPhone,
          text: payload.mensagem,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao enviar mensagem: ${response.status}`);
      }

      const data = await response.json();
      logger.log('[useSendWhatsApp] Message sent successfully:', data);

      // Registrar no banco de dados
      await registrarMensagemEnviada({
        canal: 'whatsapp',
        destinatario_nome: payload.telefone,
        destinatario_contato: formattedPhone,
        corpo: payload.mensagem,
        status: 'enviado',
      });

      return {
        success: true,
        messageId: data.key?.id,
      };
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Falha ao enviar WhatsApp');
      logger.error('[useSendWhatsApp] Error:', errorObj);
      setError(errorObj);
      return {
        success: false,
        error: errorObj.message,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendWhatsApp,
    isLoading: isLoading || isLoadingSettings,
    isConnected,
    error,
  };
}

// ============================================================
// Helper: Registrar Mensagem Enviada
// ============================================================

async function registrarMensagemEnviada(data: {
  canal: 'whatsapp' | 'email';
  destinatario_nome: string;
  destinatario_contato: string;
  assunto?: string;
  corpo: string;
  status: 'enviado' | 'falhou';
  erro_mensagem?: string;
  contexto_tipo?: string;
  contexto_id?: string;
}) {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    await supabase.from('mensagens_enviadas').insert({
      ...data,
      usuario_id: user?.user?.id,
      enviado_em: new Date().toISOString(),
    });

    logger.log('[registrarMensagemEnviada] Message logged to database');
  } catch (err) {
    logger.error('[registrarMensagemEnviada] Failed to log message:', err);
    // Não lançar erro aqui - o registro é secundário ao envio
  }
}

// Export para uso em outros hooks (email)
export { registrarMensagemEnviada };
