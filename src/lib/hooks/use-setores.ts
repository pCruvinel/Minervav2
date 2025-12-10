import { useState, useEffect } from 'react';
import { supabase } from '../supabase-client';
import { logger } from '../utils/logger';

export interface Setor {
  id: string;
  nome: string;
  slug: string;
}

export function useSetores() {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSetores() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('setores')
          .select('id, nome, slug')
          .order('nome');

        if (error) throw error;

        setSetores(data || []);
      } catch (err: any) {
        logger.error('Erro ao buscar setores:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSetores();
  }, []);

  return { setores, loading, error };
}
