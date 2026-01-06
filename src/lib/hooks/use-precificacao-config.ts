/**
 * usePrecificacaoConfig - Hook para gerenciar configuração de precificação
 *
 * Gerencia valores padrão e editabilidade de campos percentuais (Imprevisto, Lucro, Imposto).
 * Os dados são persistidos na tabela `precificacao_config` do Supabase.
 */
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';

// ============================================================
// TIPOS
// ============================================================

export interface PrecificacaoConfig {
  id: string;
  tipo_os_codigo: string;
  campo_nome: string;
  valor_padrao: number;
  campo_editavel: boolean;
  ativo: boolean;
  updated_at: string;
}

export interface PrecificacaoAudit {
  id: string;
  config_id: string;
  campo_alterado: string;
  valor_anterior: string | null;
  valor_novo: string | null;
  alterado_por_id: string | null;
  alterado_em: string;
  colaborador_nome?: string;
}

// ============================================================
// HOOK
// ============================================================

export function usePrecificacaoConfig(tipoOsCodigo?: string) {
  const [configs, setConfigs] = useState<PrecificacaoConfig[]>([]);
  const [auditLogs, setAuditLogs] = useState<PrecificacaoAudit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ------------------------------------------------------
  // Carregar configurações
  // ------------------------------------------------------
  const fetchConfigs = useCallback(async (osCode: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('precificacao_config')
        .select('*')
        .eq('tipo_os_codigo', osCode)
        .eq('ativo', true)
        .order('campo_nome');

      if (error) throw error;
      setConfigs(data || []);
    } catch (err) {
      logger.error('Erro ao carregar configurações de precificação:', err);
      toast.error('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ------------------------------------------------------
  // Carregar histórico de auditoria
  // ------------------------------------------------------
  const fetchAuditLogs = useCallback(async (configId: string) => {
    try {
      const { data, error } = await supabase
        .from('precificacao_config_audit')
        .select(`
          id,
          config_id,
          campo_alterado,
          valor_anterior,
          valor_novo,
          alterado_por_id,
          alterado_em,
          colaboradores:alterado_por_id(nome)
        `)
        .eq('config_id', configId)
        .order('alterado_em', { ascending: false })
        .limit(10);

      if (error) throw error;

      const logsFormatados = (data || []).map((l) => ({
        ...l,
        colaborador_nome: (l.colaboradores as unknown as { nome: string } | null)?.nome || 'Sistema',
      }));

      setAuditLogs(logsFormatados);
    } catch (err) {
      logger.error('Erro ao carregar histórico:', err);
    }
  }, []);

  // ------------------------------------------------------
  // Atualizar Configuração (Valor ou Editabilidade)
  // ------------------------------------------------------
  const updateConfig = useCallback(async (
    configId: string,
    updates: { valor_padrao?: number; campo_editavel?: boolean },
    alteradoPorId?: string
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      // Buscar valor anterior
      const configAtual = configs.find(c => c.id === configId);
      if (!configAtual) throw new Error('Configuração não encontrada');

      // Atualizar
      const { error: updateError } = await supabase
        .from('precificacao_config')
        .update(updates)
        .eq('id', configId);

      if (updateError) throw updateError;

      // Auditoria
      if (updates.valor_padrao !== undefined && configAtual.valor_padrao !== updates.valor_padrao) {
        await supabase.from('precificacao_config_audit').insert({
          config_id: configId,
          campo_alterado: 'valor_padrao',
          valor_anterior: configAtual.valor_padrao.toString(),
          valor_novo: updates.valor_padrao.toString(),
          alterado_por_id: alteradoPorId || null,
        });
      }

      if (updates.campo_editavel !== undefined && configAtual.campo_editavel !== updates.campo_editavel) {
        await supabase.from('precificacao_config_audit').insert({
          config_id: configId,
          campo_alterado: 'campo_editavel',
          valor_anterior: configAtual.campo_editavel ? 'true' : 'false',
          valor_novo: updates.campo_editavel ? 'true' : 'false',
          alterado_por_id: alteradoPorId || null,
        });
      }

      // Atualizar estado local
      setConfigs((prev) =>
        prev.map((c) =>
          c.id === configId
            ? { ...c, ...updates, updated_at: new Date().toISOString() }
            : c
        )
      );

      toast.success('Configuração atualizada com sucesso');
      return true;
    } catch (err) {
      logger.error('Erro ao atualizar configuração:', err);
      toast.error('Erro ao atualizar configuração');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [configs]);

  // ------------------------------------------------------
  // Restaurar Padrões
  // ------------------------------------------------------
  const restaurarPadroes = useCallback(async (
    osCode: string,
    alteradoPorId?: string
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      // Definir padrões hardcoded baseado no tipo de OS
      const padroes = [
        { campo: 'percentual_imprevisto', valor: 10, editavel: true },
        { campo: 'percentual_lucro', valor: 40, editavel: true },
        { campo: 'percentual_imposto', valor: 15, editavel: true },
      ];

      const configsAtuais = await supabase
        .from('precificacao_config')
        .select('*')
        .eq('tipo_os_codigo', osCode);
        
      if (configsAtuais.error) throw configsAtuais.error;

      for (const padrao of padroes) {
        const config = configsAtuais.data?.find(c => c.campo_nome === padrao.campo);
        if (config) {
          // Se for diferente, atualizar
          if (config.valor_padrao !== padrao.valor || config.campo_editavel !== padrao.editavel) {
             await supabase
              .from('precificacao_config')
              .update({ 
                valor_padrao: padrao.valor,
                campo_editavel: padrao.editavel 
              })
              .eq('id', config.id);

             // Auditoria de Reset (simplificada, registra apenas que foi resetado)
             await supabase.from('precificacao_config_audit').insert({
                config_id: config.id,
                campo_alterado: 'RESET_PADRAO',
                valor_anterior: null,
                valor_novo: `Valor: ${padrao.valor}, Editável: ${padrao.editavel}`,
                alterado_por_id: alteradoPorId || null,
              });
          }
        }
      }

      await fetchConfigs(osCode);
      toast.success('Padrões restaurados com sucesso');
      return true;
    } catch (err) {
      logger.error('Erro ao restaurar padrões:', err);
      toast.error('Erro ao restaurar padrões');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [fetchConfigs]);

  // ------------------------------------------------------
  // Effects
  // ------------------------------------------------------
  useEffect(() => {
    if (tipoOsCodigo) {
      fetchConfigs(tipoOsCodigo);
    }
  }, [tipoOsCodigo, fetchConfigs]);

  return {
    configs,
    auditLogs,
    isLoading,
    isSaving,
    fetchConfigs,
    fetchAuditLogs,
    updateConfig,
    restaurarPadroes,
  };
}
