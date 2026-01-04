/**
 * useSlaConfig - Hook para gerenciar configuração de SLA por etapa de OS
 *
 * Gerencia prazos (em dias úteis) de cada etapa de cada tipo de OS.
 * Os dados são persistidos na tabela `os_etapas_config` do Supabase.
 *
 * @example
 * ```tsx
 * const { etapas, isLoading, updatePrazo, tiposOs } = useSlaConfig();
 * 
 * // Filtrar por tipo de OS
 * const { etapas } = useSlaConfig('uuid-do-tipo-os');
 * ```
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';

// ============================================================
// TIPOS
// ============================================================

export interface TipoOs {
  id: string;
  nome: string;
  codigo: string;
  ativo: boolean;
}

export interface EtapaConfig {
  id: string;
  tipo_os_id: string;
  etapa_numero: number;
  etapa_nome: string;
  etapa_nome_curto: string | null;
  prazo_dias_uteis: number;
  setor_responsavel_id: string | null;
  setor_nome?: string | null;
  requer_aprovacao: boolean;
  ativo: boolean;
  updated_at: string;
}

export interface AuditLog {
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

export function useSlaConfig(tipoOsId?: string) {
  const [tiposOs, setTiposOs] = useState<TipoOs[]>([]);
  const [etapas, setEtapas] = useState<EtapaConfig[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ------------------------------------------------------
  // Carregar tipos de OS
  // ------------------------------------------------------
  const fetchTiposOs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tipos_os')
        .select('id, nome, codigo, ativo')
        .eq('ativo', true)
        .order('codigo');

      if (error) throw error;
      setTiposOs(data || []);
    } catch (err) {
      logger.error('Erro ao carregar tipos de OS:', err);
      toast.error('Erro ao carregar tipos de OS');
    }
  }, []);

  // ------------------------------------------------------
  // Carregar etapas por tipo de OS
  // ------------------------------------------------------
  const fetchEtapas = useCallback(async (osId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('os_etapas_config')
        .select(`
          id,
          tipo_os_id,
          etapa_numero,
          etapa_nome,
          etapa_nome_curto,
          prazo_dias_uteis,
          setor_responsavel_id,
          requer_aprovacao,
          ativo,
          updated_at,
          setores:setor_responsavel_id(nome)
        `)
        .eq('tipo_os_id', osId)
        .eq('ativo', true)
        .order('etapa_numero');

      if (error) throw error;

      const etapasFormatadas = (data || []).map((e) => ({
        ...e,
        setor_nome: (e.setores as unknown as { nome: string } | null)?.nome || null,
      }));

      setEtapas(etapasFormatadas);
    } catch (err) {
      logger.error('Erro ao carregar configuração de etapas:', err);
      toast.error('Erro ao carregar configuração de etapas');
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
        .from('os_etapas_config_audit')
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
  // Atualizar exigência de aprovação
  // ------------------------------------------------------
  const updateAprovacao = useCallback(async (
    configId: string,
    requerAprovacao: boolean,
    alteradoPorId?: string
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      // Buscar valor anterior
      const etapaAtual = etapas.find(e => e.id === configId);
      if (!etapaAtual) throw new Error('Etapa não encontrada');

      const valorAnterior = etapaAtual.requer_aprovacao;

      // Atualizar
      const { error: updateError } = await supabase
        .from('os_etapas_config')
        .update({ requer_aprovacao: requerAprovacao })
        .eq('id', configId);

      if (updateError) throw updateError;

      // Auditoria
      if (valorAnterior !== requerAprovacao) {
        await supabase.from('os_etapas_config_audit').insert({
          config_id: configId,
          campo_alterado: 'requer_aprovacao',
          valor_anterior: valorAnterior ? 'true' : 'false',
          valor_novo: requerAprovacao ? 'true' : 'false',
          alterado_por_id: alteradoPorId || null,
        });
      }

      // Atualizar estado local
      setEtapas((prev) =>
        prev.map((e) =>
          e.id === configId
            ? { ...e, requer_aprovacao: requerAprovacao, updated_at: new Date().toISOString() }
            : e
        )
      );

      toast.success(`Aprovação ${requerAprovacao ? 'ativada' : 'desativada'} com sucesso`);
      return true;
    } catch (err) {
      logger.error('Erro ao atualizar aprovação:', err);
      toast.error('Erro ao atualizar aprovação');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [etapas]);

  // ------------------------------------------------------
  // Atualizar prazo de uma etapa
  // ------------------------------------------------------
  const updatePrazo = useCallback(async (
    configId: string,
    novoPrazo: number,
    alteradoPorId?: string
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      // Buscar valor anterior para auditoria
      const { data: configAtual } = await supabase
        .from('os_etapas_config')
        .select('prazo_dias_uteis')
        .eq('id', configId)
        .single();

      const valorAnterior = configAtual?.prazo_dias_uteis;

      // Atualizar prazo
      const { error: updateError } = await supabase
        .from('os_etapas_config')
        .update({ prazo_dias_uteis: novoPrazo })
        .eq('id', configId);

      if (updateError) throw updateError;

      // Registrar auditoria manualmente (trigger pode não capturar alterado_por_id)
      if (valorAnterior !== novoPrazo) {
        await supabase.from('os_etapas_config_audit').insert({
          config_id: configId,
          campo_alterado: 'prazo_dias_uteis',
          valor_anterior: valorAnterior?.toString() || null,
          valor_novo: novoPrazo.toString(),
          alterado_por_id: alteradoPorId || null,
        });
      }

      // Atualizar estado local
      setEtapas((prev) =>
        prev.map((e) =>
          e.id === configId
            ? { ...e, prazo_dias_uteis: novoPrazo, updated_at: new Date().toISOString() }
            : e
        )
      );

      toast.success('Prazo atualizado com sucesso');
      return true;
    } catch (err) {
      logger.error('Erro ao atualizar prazo:', err);
      toast.error('Erro ao atualizar prazo');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // ------------------------------------------------------
  // Atualizar múltiplos prazos de uma vez
  // ------------------------------------------------------
  const updateMultiplosPrazos = useCallback(async (
    alteracoes: Array<{ configId: string; novoPrazo: number }>,
    alteradoPorId?: string
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      for (const { configId, novoPrazo } of alteracoes) {
        // Buscar valor anterior
        const etapaAtual = etapas.find(e => e.id === configId);
        if (!etapaAtual || etapaAtual.prazo_dias_uteis === novoPrazo) continue;

        // Atualizar
        const { error } = await supabase
          .from('os_etapas_config')
          .update({ prazo_dias_uteis: novoPrazo })
          .eq('id', configId);

        if (error) throw error;

        // Auditoria
        await supabase.from('os_etapas_config_audit').insert({
          config_id: configId,
          campo_alterado: 'prazo_dias_uteis',
          valor_anterior: etapaAtual.prazo_dias_uteis.toString(),
          valor_novo: novoPrazo.toString(),
          alterado_por_id: alteradoPorId || null,
        });
      }

      toast.success(`${alteracoes.length} prazo(s) atualizado(s)`);
      return true;
    } catch (err) {
      logger.error('Erro ao atualizar prazos:', err);
      toast.error('Erro ao atualizar prazos');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [etapas]);

  // ------------------------------------------------------
  // Restaurar prazos padrão (2 dias)
  // ------------------------------------------------------
  const restaurarPadrao = useCallback(async (
    tipoOsId: string,
    alteradoPorId?: string
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      // Buscar todas as etapas desse tipo
      const { data: etapasAtuais, error: fetchError } = await supabase
        .from('os_etapas_config')
        .select('id, prazo_dias_uteis')
        .eq('tipo_os_id', tipoOsId);

      if (fetchError) throw fetchError;

      // Atualizar todas para 2 dias
      for (const etapa of etapasAtuais || []) {
        if (etapa.prazo_dias_uteis !== 2) {
          await supabase
            .from('os_etapas_config')
            .update({ prazo_dias_uteis: 2 })
            .eq('id', etapa.id);

          await supabase.from('os_etapas_config_audit').insert({
            config_id: etapa.id,
            campo_alterado: 'prazo_dias_uteis',
            valor_anterior: etapa.prazo_dias_uteis.toString(),
            valor_novo: '2',
            alterado_por_id: alteradoPorId || null,
          });
        }
      }

      // Recarregar etapas
      await fetchEtapas(tipoOsId);
      toast.success('Prazos restaurados para o padrão (2 dias)');
      return true;
    } catch (err) {
      logger.error('Erro ao restaurar prazos:', err);
      toast.error('Erro ao restaurar prazos');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [fetchEtapas]);

  // ------------------------------------------------------
  // Effects
  // ------------------------------------------------------
  useEffect(() => {
    fetchTiposOs();
  }, [fetchTiposOs]);

  useEffect(() => {
    if (tipoOsId) {
      fetchEtapas(tipoOsId);
    }
  }, [tipoOsId, fetchEtapas]);

  return {
    tiposOs,
    etapas,
    auditLogs,
    isLoading,
    isSaving,
    fetchEtapas,
    fetchAuditLogs,
    updatePrazo,
    updateAprovacao,
    updateMultiplosPrazos,
    restaurarPadrao,
  };
}
