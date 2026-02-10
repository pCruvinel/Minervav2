import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';

export interface ColaboradorSelectOption {
    id: string;
    nome_completo: string;
    setor?: string;
    rateio_fixo_id?: string;
}

export function useColaboradoresSelect() {
    return useQuery({
        queryKey: ['colaboradores-select'],
        queryFn: async (): Promise<ColaboradorSelectOption[]> => {
            const { data, error } = await supabase
                .from('colaboradores')
                .select('id, nome_completo, rateio_fixo_id, setores(nome)')
                .eq('ativo', true)
                .order('nome_completo');

            if (error) throw error;
            
            // Map the joined setor name to the setor field
            return (data || []).map(item => ({
                id: item.id,
                nome_completo: item.nome_completo,
                setor: (item.setores as { nome?: string } | null)?.nome || undefined,
                rateio_fixo_id: item.rateio_fixo_id
            }));
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}
