import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';

export interface CategoriaFinanceira {
  id: string;
  nome: string;
  codigo: string;
  tipo: 'pagar' | 'receber' | 'ambos';
  ativo: boolean;
}

export function useCategoriasFinanceiras(tipo?: 'pagar' | 'receber') {
  return useQuery({
    queryKey: ['categorias-financeiras', tipo],
    queryFn: async (): Promise<CategoriaFinanceira[]> => {
      let query = supabase
        .from('categorias_financeiras')
        .select(`
          id, nome, codigo, tipo, ativo
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
      return data as CategoriaFinanceira[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

