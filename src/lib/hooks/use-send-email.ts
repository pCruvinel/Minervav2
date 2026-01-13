import { useState } from 'react';
import { MessagingService } from '@/lib/services/messaging-service';
import { logger } from '@/lib/utils/logger';
import { SendEmailPayload } from '@/lib/types/messaging';

export type { SendEmailPayload };

interface UseSendEmailReturn {
  sendEmail: (payload: SendEmailPayload) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}

export function useSendEmail(): UseSendEmailReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendEmail = async (payload: SendEmailPayload): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      logger.log('[useSendEmail] Sending email via MessagingService to:', payload.to);

      const result = await MessagingService.sendEmail(payload);

      if (!result.success) {
        throw new Error(result.error || 'Erro desconhecido ao enviar email');
      }

      logger.log('[useSendEmail] Email sent successfully:', result);
      return true;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Falha ao enviar email');
      logger.error('[useSendEmail] Error:', errorObj);
      setError(errorObj);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendEmail,
    isLoading,
    error,
  };
}
