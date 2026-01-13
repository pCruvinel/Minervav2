import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/contexts/auth-context';
import { toast } from '@/lib/utils/safe-toast';
import { logger } from '@/lib/utils/logger';

/**
 * Interface para um adendo de etapa
 */
export interface EtapaAdendo {
  id: string;
  etapa_id: string;
  campo_referencia: string;
  conteudo: string;
  criado_por_id: string;
  criado_por_nome?: string;
  criado_em: string;
}

interface UseEtapaAdendosReturn {
  adendos: EtapaAdendo[];
  isLoading: boolean;
  error: Error | null;
  addAdendo: (campoReferencia: string, conteudo: string) => Promise<EtapaAdendo | null>;
  getAdendosByCampo: (campoReferencia: string) => EtapaAdendo[];
  refreshAdendos: () => Promise<void>;
}

/**
 * Hook para gerenciar adendos de uma etapa específica
 * 
 * Adendos são complementos append-only às respostas originais.
 * Uma vez inseridos, NÃO podem ser editados ou excluídos.
 * 
 * @example
 * ```tsx
 * const { adendos, addAdendo, getAdendosByCampo } = useEtapaAdendos(etapaId);
 * 
 * // Adicionar adendo
 * await addAdendo('motivoProcura', 'Cliente também mencionou infiltração no bloco B');
 * 
 * // Buscar adendos de um campo específico
 * const adendosMotivo = getAdendosByCampo('motivoProcura');
 * ```
 */
export function useEtapaAdendos(etapaId: string | undefined): UseEtapaAdendosReturn {
  const [adendos, setAdendos] = useState<EtapaAdendo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { currentUser } = useAuth();

  /**
   * Buscar todos os adendos da etapa
   */
  const fetchAdendos = useCallback(async () => {
    if (!etapaId) {
      setAdendos([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('os_etapas_adendos')
        .select(`
          id,
          etapa_id,
          campo_referencia,
          conteudo,
          criado_por_id,
          criado_em,
          colaborador:criado_por_id(nome_completo)
        `)
        .eq('etapa_id', etapaId)
        .order('criado_em', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      // Mapear dados com nome do criador
      const adendosComNome: EtapaAdendo[] = (data || []).map((adendo: any) => ({
        id: adendo.id,
        etapa_id: adendo.etapa_id,
        campo_referencia: adendo.campo_referencia,
        conteudo: adendo.conteudo,
        criado_por_id: adendo.criado_por_id,
        criado_por_nome: adendo.colaborador?.nome_completo || 'Usuário',
        criado_em: adendo.criado_em,
      }));

      setAdendos(adendosComNome);
      logger.log(`[useEtapaAdendos] 📋 Carregados ${adendosComNome.length} adendos para etapa ${etapaId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar adendos';
      logger.error('[useEtapaAdendos] ❌ Erro ao buscar adendos:', err);
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [etapaId]);

  // Carregar adendos quando etapaId mudar
  useEffect(() => {
    fetchAdendos();
  }, [fetchAdendos]);

  /**
   * Adicionar um novo adendo
   * @param campoReferencia - Chave do campo que está sendo complementado
   * @param conteudo - Texto do adendo
   * @returns O adendo criado ou null se falhar
   */
  const addAdendo = useCallback(async (
    campoReferencia: string,
    conteudo: string
  ): Promise<EtapaAdendo | null> => {
    if (!etapaId) {
      toast.error('Etapa não identificada');
      return null;
    }

    if (!currentUser?.id) {
      toast.error('Usuário não autenticado');
      return null;
    }

    const conteudoTrimmed = conteudo.trim();
    if (!conteudoTrimmed) {
      toast.error('O adendo não pode estar vazio');
      return null;
    }

    try {
      logger.log(`[useEtapaAdendos] ➕ Adicionando adendo para campo "${campoReferencia}"`);

      const { data, error: insertError } = await supabase
        .from('os_etapas_adendos')
        .insert({
          etapa_id: etapaId,
          campo_referencia: campoReferencia,
          conteudo: conteudoTrimmed,
          criado_por_id: currentUser.id,
        })
        .select(`
          id,
          etapa_id,
          campo_referencia,
          conteudo,
          criado_por_id,
          criado_em
        `)
        .single();

      if (insertError) {
        throw insertError;
      }

      const novoAdendo: EtapaAdendo = {
        ...data,
        criado_por_nome: currentUser.nome_completo || 'Você',
      };

      // Atualizar estado local otimisticamente
      setAdendos(prev => [...prev, novoAdendo]);

      toast.success('Adendo adicionado com sucesso!');
      logger.log(`[useEtapaAdendos] ✅ Adendo criado: ${novoAdendo.id}`);

      return novoAdendo;
    } catch (err) {
      logger.error('[useEtapaAdendos] ❌ Erro ao adicionar adendo:', err);
      toast.error('Erro ao adicionar adendo. Tente novamente.');
      return null;
    }
  }, [etapaId, currentUser]);

  /**
   * Filtrar adendos por campo de referência
   * @param campoReferencia - Chave do campo
   * @returns Lista de adendos desse campo, ordenados cronologicamente
   */
  const getAdendosByCampo = useCallback((campoReferencia: string): EtapaAdendo[] => {
    return adendos
      .filter(a => a.campo_referencia === campoReferencia)
      .sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime());
  }, [adendos]);

  return {
    adendos,
    isLoading,
    error,
    addAdendo,
    getAdendosByCampo,
    refreshAdendos: fetchAdendos,
  };
}
