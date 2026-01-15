/**
 * ============================================================================
 * HOOK: useOSResponsabilidade
 * ============================================================================
 * 
 * Hook principal para gestão de responsabilidade, participantes e delegação em OS.
 * 
 * @example
 * ```tsx
 * const {
 *   participantes,
 *   delegarEtapa,
 *   podeEditarEtapa,
 *   getResponsavelEtapa
 * } = useOSResponsabilidade(osId);
 * ```
 * 
 * @module use-os-responsabilidade
 * @author Minerva ERP
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { logger } from '@/lib/utils/logger';
import { toast } from 'sonner';
import {
  getStepOwner,
  getOwnershipRule,
  CARGO_SETOR_MAP,
  type SetorSlug,
  type CargoSlug,
} from '@/lib/constants/os-ownership-rules';
import type {
  OSParticipante,
  DelegacaoEtapa,
  SetorInfo,
  EtapaResponsabilidade,
  PapelParticipante,
  UseOSResponsabilidadeReturn,
} from '@/lib/types/os-responsabilidade';
import { SETOR_NOMES, COORDENADOR_SETOR } from '@/lib/types/os-responsabilidade';

// ============================================================================
// TIPOS INTERNOS
// ============================================================================

interface OSData {
  id: string;
  tipo_os: string;
  responsaveis_setores: Record<string, { coordenador_id: string }>;
}

interface EtapaData {
  id: string;
  ordem: number;
  os_id: string;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useOSResponsabilidade(osId: string): UseOSResponsabilidadeReturn {
  // Estado
  const [participantes, setParticipantes] = useState<OSParticipante[]>([]);
  const [delegacoes, setDelegacoes] = useState<DelegacaoEtapa[]>([]);
  const [osData, setOsData] = useState<OSData | null>(null);
  const [etapas, setEtapas] = useState<EtapaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { user } = useAuth();

  // ============================================================================
  // FETCH DE DADOS
  // ============================================================================

  const fetchOSData = useCallback(async () => {
    if (!osId) return;

    try {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('id, tipo_os, responsaveis_setores')
        .eq('id', osId)
        .single();

      if (error) throw error;
      setOsData(data);
    } catch (err) {
      logger.error('Erro ao buscar dados da OS:', err);
      setError(err as Error);
    }
  }, [osId]);

  const fetchEtapas = useCallback(async () => {
    if (!osId) return;

    try {
      const { data, error } = await supabase
        .from('os_etapas')
        .select('id, ordem, os_id')
        .eq('os_id', osId)
        .order('ordem');

      if (error) throw error;
      setEtapas(data || []);
    } catch (err) {
      logger.error('Erro ao buscar etapas:', err);
    }
  }, [osId]);

  const fetchParticipantes = useCallback(async () => {
    if (!osId) return;

    try {
      const { data, error } = await supabase
        .from('os_participantes')
        .select(`
          id,
          colaborador_id,
          papel,
          setor_id,
          etapas_permitidas,
          adicionado_em,
          observacao,
          colaborador:colaboradores!colaborador_id(nome, funcao, avatar_url),
          setor:setores!setor_id(nome)
        `)
        .eq('ordem_servico_id', osId);

      if (error) throw error;

      const mappedParticipantes: OSParticipante[] = (data || []).map((p) => ({
        id: p.id,
        colaborador_id: p.colaborador_id,
        colaborador_nome: (p.colaborador as any)?.nome || 'Desconhecido',
        colaborador_cargo: (p.colaborador as any)?.funcao || '',
        colaborador_avatar: (p.colaborador as any)?.avatar_url,
        papel: p.papel as PapelParticipante,
        setor_id: p.setor_id,
        setor_nome: (p.setor as any)?.nome,
        etapas_permitidas: p.etapas_permitidas,
        adicionado_em: p.adicionado_em,
        observacao: p.observacao,
      }));

      setParticipantes(mappedParticipantes);
    } catch (err) {
      logger.error('Erro ao buscar participantes:', err);
    }
  }, [osId]);

  const fetchDelegacoes = useCallback(async () => {
    if (!osId) return;

    try {
      const { data, error } = await supabase
        .from('os_etapas_responsavel')
        .select(`
          id,
          etapa_id,
          responsavel_id,
          delegado_por_id,
          delegado_em,
          motivo,
          ativo,
          etapa:os_etapas!etapa_id(ordem),
          responsavel:colaboradores!responsavel_id(nome),
          delegador:colaboradores!delegado_por_id(nome)
        `)
        .eq('ativo', true)
        .in('etapa_id', etapas.map(e => e.id));

      if (error) throw error;

      const mappedDelegacoes: DelegacaoEtapa[] = (data || []).map((d) => ({
        id: d.id,
        etapa_id: d.etapa_id,
        etapa_ordem: (d.etapa as any)?.ordem || 0,
        responsavel_id: d.responsavel_id,
        responsavel_nome: (d.responsavel as any)?.nome || 'Desconhecido',
        delegado_por_id: d.delegado_por_id,
        delegado_por_nome: (d.delegador as any)?.nome || 'Desconhecido',
        delegado_em: d.delegado_em,
        motivo: d.motivo,
        ativo: d.ativo,
      }));

      setDelegacoes(mappedDelegacoes);
    } catch (err) {
      logger.error('Erro ao buscar delegações:', err);
    }
  }, [osId, etapas]);

  // ============================================================================
  // REFRESH
  // ============================================================================

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchOSData(),
        fetchEtapas(),
        fetchParticipantes(),
      ]);
      // Delegações dependem de etapas, fetch separado
      if (etapas.length > 0) {
        await fetchDelegacoes();
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchOSData, fetchEtapas, fetchParticipantes, fetchDelegacoes, etapas.length]);

  // Fetch inicial
  useEffect(() => {
    refresh();
  }, [osId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch delegações quando etapas carregarem
  useEffect(() => {
    if (etapas.length > 0) {
      fetchDelegacoes();
    }
  }, [etapas, fetchDelegacoes]);

  // ============================================================================
  // RESPONSÁVEIS POR SETOR (COMPUTADO)
  // ============================================================================

  const responsaveisSetores = useMemo<SetorInfo[]>(() => {
    if (!osData) return [];

    const setores: SetorSlug[] = ['administrativo', 'obras', 'assessoria'];

    return setores.map((slug) => {
      const setorData = osData.responsaveis_setores?.[slug];
      
      return {
        slug,
        nome: SETOR_NOMES[slug],
        coordenador_id: setorData?.coordenador_id || null,
        coordenador_nome: null, // Seria necessário fazer join para obter
        coordenador_cargo: null,
        delegado_para_id: null,
        delegado_para_nome: null,
      };
    });
  }, [osData]);

  // ============================================================================
  // AÇÕES: DELEGAR ETAPA
  // ============================================================================

  const delegarEtapa = useCallback(async (
    etapaId: string,
    colaboradorId: string,
    motivo?: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('delegar_etapa', {
        p_etapa_id: etapaId,
        p_colaborador_id: colaboradorId,
        p_motivo: motivo || null,
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Etapa delegada com sucesso');
        await refresh();
        return true;
      } else {
        toast.error(data?.error || 'Erro ao delegar etapa');
        return false;
      }
    } catch (err) {
      logger.error('Erro ao delegar etapa:', err);
      toast.error('Erro ao delegar etapa');
      return false;
    }
  }, [refresh]);

  const revogarDelegacao = useCallback(async (etapaId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('revogar_delegacao', {
        p_etapa_id: etapaId,
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Delegação revogada');
        await refresh();
        return true;
      } else {
        toast.error(data?.error || 'Erro ao revogar delegação');
        return false;
      }
    } catch (err) {
      logger.error('Erro ao revogar delegação:', err);
      toast.error('Erro ao revogar delegação');
      return false;
    }
  }, [refresh]);

  // ============================================================================
  // AÇÕES: PARTICIPANTES
  // ============================================================================

  const adicionarParticipante = useCallback(async (
    colaboradorId: string,
    papel: PapelParticipante,
    setorId?: string,
    etapas_permitidas?: number[]
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('os_participantes')
        .insert({
          ordem_servico_id: osId,
          colaborador_id: colaboradorId,
          papel,
          setor_id: setorId,
          etapas_permitidas: etapas_permitidas || null,
          adicionado_por_id: user.id,
        });

      if (error) throw error;

      toast.success('Participante adicionado');
      await fetchParticipantes();
      return true;
    } catch (err) {
      logger.error('Erro ao adicionar participante:', err);
      toast.error('Erro ao adicionar participante');
      return false;
    }
  }, [osId, user, fetchParticipantes]);

  const removerParticipante = useCallback(async (participanteId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('os_participantes')
        .delete()
        .eq('id', participanteId);

      if (error) throw error;

      toast.success('Participante removido');
      await fetchParticipantes();
      return true;
    } catch (err) {
      logger.error('Erro ao remover participante:', err);
      toast.error('Erro ao remover participante');
      return false;
    }
  }, [fetchParticipantes]);

  // ============================================================================
  // QUERIES
  // ============================================================================

  const podeEditarEtapa = useCallback((etapaOrdem: number): boolean => {
    if (!user || !osData) return false;

    const userFuncao = user.funcao as CargoSlug;

    // Admin e diretor sempre podem
    if (['admin', 'diretor'].includes(userFuncao)) return true;

    // Verificar delegação
    const etapa = etapas.find(e => e.ordem === etapaOrdem);
    if (etapa) {
      const delegacao = delegacoes.find(d => d.etapa_id === etapa.id);
      if (delegacao && delegacao.responsavel_id === user.id) {
        return true;
      }
    }

    // Verificar se é participante
    const participante = participantes.find(p => p.colaborador_id === user.id);
    if (participante) {
      if (participante.papel === 'observador') return false;
      if (participante.etapas_permitidas === null) return true;
      return participante.etapas_permitidas.includes(etapaOrdem);
    }

    // Verificar se é coordenador do setor da etapa
    if (osData.tipo_os) {
      const stepOwner = getStepOwner(osData.tipo_os, etapaOrdem);
      if (stepOwner) {
        const userSetor = CARGO_SETOR_MAP[userFuncao];
        return userSetor === stepOwner.setor;
      }
    }

    return false;
  }, [user, osData, etapas, delegacoes, participantes]);

  const podeDelegar = useCallback((setorSlug: SetorSlug): boolean => {
    if (!user) return false;

    const userFuncao = user.funcao as CargoSlug;

    // Admin e diretor podem delegar qualquer setor
    if (['admin', 'diretor'].includes(userFuncao)) return true;

    // Coordenadores só podem delegar do seu setor
    const userSetor = COORDENADOR_SETOR[userFuncao];
    return userSetor === setorSlug;
  }, [user]);

  const getResponsavelEtapa = useCallback((etapaOrdem: number): EtapaResponsabilidade | null => {
    const etapa = etapas.find(e => e.ordem === etapaOrdem);
    if (!etapa || !osData) return null;

    const delegacao = delegacoes.find(d => d.etapa_id === etapa.id);
    const stepOwner = getStepOwner(osData.tipo_os, etapaOrdem);

    if (!stepOwner) return null;

    const setorInfo: SetorInfo = {
      slug: stepOwner.setor,
      nome: SETOR_NOMES[stepOwner.setor],
      coordenador_id: osData.responsaveis_setores?.[stepOwner.setor]?.coordenador_id || null,
      coordenador_nome: null,
      coordenador_cargo: stepOwner.cargo,
    };

    const responsavel = delegacao
      ? {
          id: delegacao.responsavel_id,
          nome: delegacao.responsavel_nome,
          cargo: 'Delegado',
          is_delegado: true,
        }
      : {
          id: setorInfo.coordenador_id || '',
          nome: setorInfo.coordenador_nome || 'Coordenador',
          cargo: stepOwner.cargo,
          is_delegado: false,
        };

    return {
      etapa_id: etapa.id,
      ordem: etapaOrdem,
      setor: setorInfo,
      responsavel_atual: responsavel,
      pode_editar: podeEditarEtapa(etapaOrdem),
      pode_delegar: podeDelegar(stepOwner.setor),
    };
  }, [etapas, osData, delegacoes, podeEditarEtapa, podeDelegar]);

  const getDelegacaoEtapa = useCallback((etapaId: string): DelegacaoEtapa | null => {
    return delegacoes.find(d => d.etapa_id === etapaId) || null;
  }, [delegacoes]);

  // ============================================================================
  // RETORNO
  // ============================================================================

  return {
    // Dados
    responsaveisSetores,
    participantes,
    delegacoes,

    // Estado
    isLoading,
    error,

    // Ações
    delegarEtapa,
    revogarDelegacao,
    adicionarParticipante,
    removerParticipante,

    // Queries
    podeEditarEtapa,
    podeDelegar,
    getResponsavelEtapa,
    getDelegacaoEtapa,

    // Refresh
    refresh,
  };
}
