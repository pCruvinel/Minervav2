/**
 * Hook: useColaboradoresPorSetor
 *
 * Busca colaboradores ativos filtrados por setor.
 * Usado no AgendamentoOS para listar responsáveis elegíveis.
 */

import { useMemo } from 'react';
import { useApi } from './use-api';
import { supabase } from '@/lib/supabase-client';

// =====================================================
// TYPES
// =====================================================

export interface ColaboradorSetor {
  id: string;
  nome_completo: string;
  email: string;
  avatar_url?: string;
  cargo_id: string;
  cargo_nome?: string;
  setor_id: string;
  setor_slug?: string;
  setor_nome?: string;
}

// =====================================================
// HOOK
// =====================================================

/**
 * Busca colaboradores ativos de um setor específico
 * @param setorSlug - Slug do setor (ex: 'obras', 'assessoria', 'comercial')
 */
export function useColaboradoresPorSetor(setorSlug?: string) {
  const { data, loading, error, refetch } = useApi(
    async () => {
      if (!setorSlug) return [];

      const { data: colaboradores, error: queryError } = await supabase
        .from('colaboradores')
        .select(`
          id,
          nome_completo,
          email,
          avatar_url,
          cargo_id,
          setor_id,
          cargo:cargo_id (
            id,
            nome
          ),
          setor:setor_id (
            id,
            slug,
            nome
          )
        `)
        .eq('ativo', true)
        .order('nome_completo');

      if (queryError) throw queryError;

      // Filtrar por setor slug (o filtro é feito após o fetch pois Supabase não permite filter em join)
      const filtered = (colaboradores || [])
        .filter((c: any) => c.setor?.slug === setorSlug)
        .map((c: any): ColaboradorSetor => ({
          id: c.id,
          nome_completo: c.nome_completo,
          email: c.email,
          avatar_url: c.avatar_url,
          cargo_id: c.cargo_id,
          cargo_nome: c.cargo?.nome,
          setor_id: c.setor_id,
          setor_slug: c.setor?.slug,
          setor_nome: c.setor?.nome,
        }));

      return filtered;
    },
    {
      deps: [setorSlug],
    }
  );

  const colaboradores = useMemo(() => data || [], [data]);

  return {
    colaboradores,
    loading,
    error,
    refetch,
  };
}

/**
 * Busca todos os colaboradores ativos (sem filtro de setor)
 * Útil quando não há setor específico definido
 */
export function useColaboradoresAtivos() {
  const { data, loading, error, refetch } = useApi(
    async () => {
      const { data: colaboradores, error: queryError } = await supabase
        .from('colaboradores')
        .select(`
          id,
          nome_completo,
          email,
          avatar_url,
          cargo_id,
          setor_id,
          cargo:cargo_id (
            id,
            nome
          ),
          setor:setor_id (
            id,
            slug,
            nome
          )
        `)
        .eq('ativo', true)
        .order('nome_completo');

      if (queryError) throw queryError;

      return (colaboradores || []).map((c: any): ColaboradorSetor => ({
        id: c.id,
        nome_completo: c.nome_completo,
        email: c.email,
        avatar_url: c.avatar_url,
        cargo_id: c.cargo_id,
        cargo_nome: c.cargo?.nome,
        setor_id: c.setor_id,
        setor_slug: c.setor?.slug,
        setor_nome: c.setor?.nome,
      }));
    },
    {
      deps: [],
    }
  );

  const colaboradores = useMemo(() => data || [], [data]);

  return {
    colaboradores,
    loading,
    error,
    refetch,
  };
}
