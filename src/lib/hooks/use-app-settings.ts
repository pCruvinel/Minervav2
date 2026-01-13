/**
 * use-app-settings.ts
 * 
 * Hook para gerenciar configurações do sistema armazenadas na tabela app_settings.
 * Usado para Evolution API URL/Key e outras configurações globais.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/utils/logger';
import { toast } from 'sonner';

export interface AppSetting {
  key: string;
  value: string;
  description?: string;
  is_secret?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface UseAppSettingsReturn {
  settings: Record<string, string>;
  isLoading: boolean;
  error: Error | null;
  getSetting: (key: string) => string | undefined;
  setSetting: (key: string, value: string, description?: string, isSecret?: boolean) => Promise<boolean>;
  setMultipleSettings: (items: Array<{ key: string; value: string; description?: string; isSecret?: boolean }>) => Promise<boolean>;
  refetch: () => Promise<void>;
}

// Keys usadas para Evolution API
export const EVOLUTION_API_URL_KEY = 'evolution_api_url';
export const EVOLUTION_API_KEY_KEY = 'evolution_api_key';
export const EVOLUTION_INSTANCE_NAME_KEY = 'evolution_instance_name';

// Keys usadas para Email (SMTP)
export const EMAIL_SMTP_HOST_KEY = 'smtp_host';
export const EMAIL_SMTP_PORT_KEY = 'smtp_port';
export const EMAIL_SMTP_USER_KEY = 'smtp_user';
export const EMAIL_SMTP_PASS_KEY = 'smtp_password';
export const EMAIL_SMTP_SECURE_KEY = 'smtp_secure';
export const EMAIL_SENDER_NAME_KEY = 'email_sender_name';
export const EMAIL_SENDER_ADDR_KEY = 'email_sender_address';
export const EMAIL_PROVIDER_KEY = 'email_provider';

export function useAppSettings(keys?: string[]): UseAppSettingsReturn {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase.from('app_settings').select('*');
      
      if (keys && keys.length > 0) {
        query = query.in('key', keys);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      const settingsMap: Record<string, string> = {};
      (data || []).forEach((item: AppSetting) => {
        settingsMap[item.key] = item.value;
      });

      setSettings(settingsMap);
    } catch (err) {
      logger.error('[useAppSettings] Error fetching settings:', err);
      setError(err instanceof Error ? err : new Error('Erro ao carregar configurações'));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(keys)]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const getSetting = useCallback((key: string): string | undefined => {
    return settings[key];
  }, [settings]);

  const setSetting = useCallback(async (
    key: string,
    value: string,
    description?: string,
    isSecret?: boolean
  ): Promise<boolean> => {
    try {
      const { error: upsertError } = await supabase
        .from('app_settings')
        .upsert({
          key,
          value,
          description,
          is_secret: isSecret ?? false,
        }, { onConflict: 'key' });

      if (upsertError) {
        throw upsertError;
      }

      // Update local state
      setSettings(prev => ({ ...prev, [key]: value }));
      return true;
    } catch (err) {
      logger.error('[useAppSettings] Error setting value:', err);
      toast.error('Erro ao salvar configuração');
      return false;
    }
  }, []);

  const setMultipleSettings = useCallback(async (
    settingsToSave: Array<{ key: string; value: string; description?: string; isSecret?: boolean }>
  ): Promise<boolean> => {
    try {
      const records = settingsToSave.map(s => ({
        key: s.key,
        value: s.value,
        description: s.description,
        is_secret: s.isSecret ?? false,
      }));

      const { error: upsertError } = await supabase
        .from('app_settings')
        .upsert(records, { onConflict: 'key' });

      if (upsertError) {
        throw upsertError;
      }

      // Update local state
      const newSettings = { ...settings };
      settingsToSave.forEach(s => {
        newSettings[s.key] = s.value;
      });
      setSettings(newSettings);

      return true;
    } catch (err) {
      logger.error('[useAppSettings] Error setting multiple values:', err);
      toast.error('Erro ao salvar configurações');
      return false;
    }
  }, [settings]);

  return {
    settings,
    isLoading,
    error,
    getSetting,
    setSetting,
    setMultipleSettings,
    refetch: fetchSettings,
  };
}
