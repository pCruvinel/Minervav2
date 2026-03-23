import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';

/**
 * Perfil completo de um colaborador para uso em selects, delegação e filtros.
 * Substitui `mockUsers` com dados reais do Supabase.
 */
export interface ColaboradorPerfil {
  id: string;
  nome_completo: string;
  email: string | null;
  cargo_slug: string | null;
  cargo_nome: string | null;
  setor_slug: string | null;
  setor_nome: string | null;
  avatar_url: string | null;
  role_slug: string | null;
  role_nivel: number | null;
  pode_delegar: boolean;
  pode_aprovar: boolean;
  /** Iniciais do nome (ex: "CA" para "Carlos Alberto") */
  avatar: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Hook que busca colaboradores ativos com dados de perfil completos
 * (cargo, setor, role, avatar) do Supabase.
 * 
 * Substitui imports de `mockUsers` de `@/lib/mock-data`.
 * 
 * @param options.includeInactive - Se true, inclui inativos (default: false)
 */
export function useColaboradoresPerfil(options?: { includeInactive?: boolean }) {
  const includeInactive = options?.includeInactive ?? false;

  return useQuery({
    queryKey: ['colaboradores-perfil', { includeInactive }],
    queryFn: async (): Promise<ColaboradorPerfil[]> => {
      let query = supabase
        .from('colaboradores')
        .select(`
          id,
          nome_completo,
          email,
          avatar_url,
          cargo_id,
          setor_id,
          role_id,
          cargos(nome, slug:id),
          setores(nome, slug:id),
          roles!colaboradores_role_id_fkey(slug, nivel, nome, pode_delegar, pode_aprovar)
        `)
        .order('nome_completo');

      if (!includeInactive) {
        query = query.eq('ativo', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase join return types are complex and unpredictable
      return (data || []).map((item: any) => {
        const role = item.roles as { slug?: string; nivel?: number; nome?: string; pode_delegar?: boolean; pode_aprovar?: boolean } | null;
        const cargo = item.cargos as { nome?: string; slug?: string } | null;
        const setor = item.setores as { nome?: string; slug?: string } | null;

        return {
          id: item.id as string,
          nome_completo: item.nome_completo as string,
          email: (item.email as string) || null,
          avatar_url: (item.avatar_url as string) || null,
          cargo_slug: cargo?.slug || null,
          cargo_nome: cargo?.nome || null,
          setor_slug: setor?.slug || null,
          setor_nome: setor?.nome || null,
          role_slug: role?.slug || null,
          role_nivel: role?.nivel ?? null,
          pode_delegar: role?.pode_delegar ?? false,
          pode_aprovar: role?.pode_aprovar ?? false,
          avatar: getInitials((item.nome_completo as string) || '??'),
        };
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
