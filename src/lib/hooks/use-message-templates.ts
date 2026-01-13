import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/utils/logger';
import { MessageChannel } from '@/lib/types/messaging';

// ============================================================
// Types
// ============================================================

export interface MensagemTemplate {
  id: string;
  nome: string;
  canal: MessageChannel;
  assunto: string | null;
  corpo: string;
  variaveis: string[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplatePayload {
  nome: string;
  canal: MessageChannel;
  assunto?: string;
  corpo: string;
  variaveis?: string[];
}

export interface UpdateTemplatePayload extends Partial<CreateTemplatePayload> {
  ativo?: boolean;
}

// ============================================================
// Variable Substitution Utility
// ============================================================

/**
 * Substitui variáveis no formato {{variavel}} pelo valor correspondente
 * @example
 * substituirVariaveis("Olá {{cliente_nome}}", { cliente_nome: "João" })
 * // Retorna: "Olá João"
 */
export function substituirVariaveis(
  texto: string,
  valores: Record<string, string>
): string {
  return texto.replace(/\{\{(\w+)\}\}/g, (match, variavel) => {
    return valores[variavel] ?? match;
  });
}

/**
 * Extrai variáveis de um texto no formato {{variavel}}
 * @example
 * extrairVariaveis("Olá {{cliente_nome}}, sua OS é {{os_codigo}}")
 * // Retorna: ["cliente_nome", "os_codigo"]
 */
export function extrairVariaveis(texto: string): string[] {
  const matches = texto.matchAll(/\{\{(\w+)\}\}/g);
  return [...new Set([...matches].map(m => m[1]))];
}

// ============================================================
// Hook
// ============================================================

interface UseMessageTemplatesReturn {
  templates: MensagemTemplate[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createTemplate: (payload: CreateTemplatePayload) => Promise<MensagemTemplate | null>;
  updateTemplate: (id: string, payload: UpdateTemplatePayload) => Promise<boolean>;
  deleteTemplate: (id: string) => Promise<boolean>;
  getTemplateById: (id: string) => MensagemTemplate | undefined;
  getTemplatesByCanal: (canal: MessageChannel) => MensagemTemplate[];
}

export function useMessageTemplates(): UseMessageTemplatesReturn {
  const [templates, setTemplates] = useState<MensagemTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('mensagem_templates')
        .select('*')
        .order('nome', { ascending: true });

      if (fetchError) throw fetchError;

      setTemplates(data || []);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erro ao carregar templates');
      logger.error('[useMessageTemplates] Fetch error:', errorObj);
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (payload: CreateTemplatePayload): Promise<MensagemTemplate | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('mensagem_templates')
        .insert({
          nome: payload.nome,
          canal: payload.canal,
          assunto: payload.assunto || null,
          corpo: payload.corpo,
          variaveis: payload.variaveis || extrairVariaveis(payload.corpo),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setTemplates(prev => [...prev, data]);
      logger.log('[useMessageTemplates] Template created:', data.id);
      return data;
    } catch (err) {
      logger.error('[useMessageTemplates] Create error:', err);
      return null;
    }
  };

  const updateTemplate = async (id: string, payload: UpdateTemplatePayload): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (payload.nome !== undefined) updateData.nome = payload.nome;
      if (payload.canal !== undefined) updateData.canal = payload.canal;
      if (payload.assunto !== undefined) updateData.assunto = payload.assunto;
      if (payload.corpo !== undefined) {
        updateData.corpo = payload.corpo;
        updateData.variaveis = payload.variaveis || extrairVariaveis(payload.corpo);
      }
      if (payload.ativo !== undefined) updateData.ativo = payload.ativo;

      const { error: updateError } = await supabase
        .from('mensagem_templates')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      setTemplates(prev => 
        prev.map(t => t.id === id ? { ...t, ...updateData, updated_at: new Date().toISOString() } as MensagemTemplate : t)
      );
      
      logger.log('[useMessageTemplates] Template updated:', id);
      return true;
    } catch (err) {
      logger.error('[useMessageTemplates] Update error:', err);
      return false;
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('mensagem_templates')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setTemplates(prev => prev.filter(t => t.id !== id));
      logger.log('[useMessageTemplates] Template deleted:', id);
      return true;
    } catch (err) {
      logger.error('[useMessageTemplates] Delete error:', err);
      return false;
    }
  };

  const getTemplateById = (id: string) => templates.find(t => t.id === id);
  
  const getTemplatesByCanal = (canal: MessageChannel) => 
    templates.filter(t => t.canal === canal && t.ativo);

  return {
    templates,
    isLoading,
    error,
    refetch: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    getTemplatesByCanal,
  };
}
