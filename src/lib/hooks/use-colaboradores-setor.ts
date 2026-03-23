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
  cargo_slug?: string;
  setor_id: string;
  setor_slug?: string;
  setor_nome?: string;
  funcao?: string;
}

// =====================================================
// HOOK
// =====================================================

/**
 * Busca colaboradores ativos de um setor específico, opcionalmente filtrados por cargo
 * @param setorSlug - Slug do setor (ex: 'obras', 'assessoria', 'comercial')
 * @param cargoSlugs - Slugs de cargos para filtrar (ex: ['coord_obras', 'coord_assessoria'])
 */
export function useColaboradoresPorSetor(setorSlug?: string, cargoSlugs?: string[]) {
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
            nome,
            slug
          ),
          funcao,
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
      let filtered = (colaboradores || [])
        .filter((c: any) => c.setor?.slug === setorSlug);

      // Filtrar por cargo slugs se fornecido (ex: apenas coordenadores)
      if (cargoSlugs && cargoSlugs.length > 0) {
        filtered = filtered.filter((c: any) =>
          cargoSlugs.includes(c.cargo?.slug)
        );
      }

      const result = filtered.map((c: any): ColaboradorSetor => ({
          id: c.id,
          nome_completo: c.nome_completo,
          email: c.email,
          avatar_url: c.avatar_url,
          cargo_id: c.cargo_id,
          cargo_nome: c.cargo?.nome,
          cargo_slug: c.cargo?.slug,
          setor_id: c.setor_id,
          setor_slug: c.setor?.slug,
          setor_nome: c.setor?.nome,
          funcao: c.funcao,
        }));

      return result;
    },
    {
      deps: [setorSlug, cargoSlugs?.join(',')],
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
