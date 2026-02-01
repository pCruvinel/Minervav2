import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';

export interface CategoriaFinanceira {
  id: string;
  nome: string;
  codigo: string;
  tipo: 'pagar' | 'receber' | 'ambos';
  ativo: boolean;
  setor_padrao?: {
    id: string;
    slug: string;
    nome: string;
  } | null;
}

export function useCategoriasFinanceiras(tipo?: 'pagar' | 'receber') {
  return useQuery({
    queryKey: ['categorias-financeiras', tipo],
    queryFn: async (): Promise<CategoriaFinanceira[]> => {
      let query = supabase
        .from('categorias_financeiras')
        .select(`
          id, nome, codigo, tipo, ativo,
          setor_padrao:setores!setor_padrao_id (id, slug, nome)
        `)
        .eq('ativo', true)
        .order('codigo');

      if (tipo) {
        // Incluir 'ambos' além do tipo específico
        query = query.in('tipo', [tipo, 'ambos']);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Processar setor_padrao que pode vir como array para objeto único
      return (data ?? []).map(item => ({
        ...item,
        setor_padrao: Array.isArray(item.setor_padrao) 
          ? item.setor_padrao[0] ?? null 
          : item.setor_padrao
      })) as CategoriaFinanceira[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

