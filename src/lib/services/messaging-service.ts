import { supabase } from '@/lib/supabase-client';
import { SendEmailPayload } from '@/lib/types/messaging';

export const MessagingService = {
  /**
   * Envia um email usando a Edge Function 'send-email'
   */
  async sendEmail(payload: SendEmailPayload): Promise<{ success: boolean; data?: any; error?: string }> {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: payload,
    });

    if (error) {
      console.error('MessagingService: Error invoking send-email:', error);
      return { success: false, error: error.message };
    }

    return data;
  },

  /**
   * Envia uma mensagem de WhatsApp (Placeholder para implementação futura)
   */
  async sendWhatsApp(payload: any): Promise<{ success: boolean; data?: any; error?: string }> {
    console.warn('MessagingService: sendWhatsApp not implemented', payload);
    return { success: false, error: 'Not implemented' };
  }
};
