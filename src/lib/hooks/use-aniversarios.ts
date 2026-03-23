/**
 * Hook: useAniversarios
 *
 * Busca aniversários de colaboradores e clientes para exibição no calendário.
 * Retorna um Map com chave no formato MM-DD e lista de aniversariantes.
 * 
 * v2.0 (KOD-79): Inclui clientes + hook server-side useAniversariosSemana
 */

import { useMemo } from 'react';
import { useApi } from './use-api';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';
import type { AniversarioCalendario } from '@/lib/types';

// =====================================================
// API FUNCTIONS
// =====================================================

const aniversariosAPI = {
  /**
   * Buscar aniversários de colaboradores e clientes para um mês específico
   */
  async getByMes(mes: number): Promise<Map<string, AniversarioCalendario[]>> {
    // Buscar colaboradores com data de nascimento no mês
    const { data: colaboradores, error: errColabs } = await supabase
      .from('colaboradores')
      .select('id, nome_completo, data_nascimento, avatar_url, funcao')
      .eq('ativo', true)
      .not('data_nascimento', 'is', null);

    if (errColabs) throw errColabs;

    // v2.0: Buscar clientes com data_nascimento
    const { data: clientes, error: errClientes } = await supabase
      .from('clientes')
      .select('id, nome_razao_social, data_nascimento')
      .not('data_nascimento', 'is', null);

    if (errClientes) throw errClientes;

    // Processar aniversários
    const aniversariosPorDia = new Map<string, AniversarioCalendario[]>();

    // Processar colaboradores
    (colaboradores || []).forEach(colab => {
      if (!colab.data_nascimento) return;

      const dataNasc = new Date(colab.data_nascimento + 'T00:00:00');
      const mesNasc = dataNasc.getMonth() + 1;
      const diaNasc = dataNasc.getDate();

      if (mesNasc !== mes) return;

      const chaveDia = `${String(mesNasc).padStart(2, '0')}-${String(diaNasc).padStart(2, '0')}`;

      const aniversario: AniversarioCalendario = {
        id: colab.id,
        nome: colab.nome_completo || 'Colaborador',
        tipo: 'colaborador',
        data: chaveDia,
        dataCompleta: colab.data_nascimento,
        avatarUrl: colab.avatar_url,
        cargo: colab.funcao,
      };

      const lista = aniversariosPorDia.get(chaveDia) || [];
      lista.push(aniversario);
      aniversariosPorDia.set(chaveDia, lista);
    });

    // v2.0: Processar clientes
    (clientes || []).forEach(cliente => {
      if (!cliente.data_nascimento) return;

      const dataNasc = new Date(cliente.data_nascimento + 'T00:00:00');
      const mesNasc = dataNasc.getMonth() + 1;
      const diaNasc = dataNasc.getDate();

      if (mesNasc !== mes) return;

      const chaveDia = `${String(mesNasc).padStart(2, '0')}-${String(diaNasc).padStart(2, '0')}`;

      const aniversario: AniversarioCalendario = {
        id: cliente.id,
        nome: cliente.nome_razao_social || 'Cliente',
        tipo: 'cliente',
        data: chaveDia,
        dataCompleta: cliente.data_nascimento,
        empresa: cliente.nome_razao_social,
      };

      const lista = aniversariosPorDia.get(chaveDia) || [];
      lista.push(aniversario);
      aniversariosPorDia.set(chaveDia, lista);
    });

    return aniversariosPorDia;
  },

  /**
   * Buscar todos os aniversários de um período (para exibição mensal com overflow)
   */
  async getByPeriodo(dataInicio: string, dataFim: string): Promise<Map<string, AniversarioCalendario[]>> {
    const [anoInicio, mesInicio] = dataInicio.split('-').map(Number);
    const [anoFim, mesFim] = dataFim.split('-').map(Number);

    const meses = new Set<number>();
    let current = new Date(anoInicio, mesInicio - 1, 1);
    const end = new Date(anoFim, mesFim - 1, 1);

    while (current <= end) {
      meses.add(current.getMonth() + 1);
      current.setMonth(current.getMonth() + 1);
    }

    const aniversariosPorDia = new Map<string, AniversarioCalendario[]>();

    for (const mes of meses) {
      const anivMes = await aniversariosAPI.getByMes(mes);
      anivMes.forEach((lista, chaveDia) => {
        const existente = aniversariosPorDia.get(chaveDia) || [];
        aniversariosPorDia.set(chaveDia, [...existente, ...lista]);
      });
    }

    return aniversariosPorDia;
  },
};

// =====================================================
// HOOKS
// =====================================================

/**
 * Hook para buscar aniversários de um mês específico
 */
export function useAniversariosMes(mes: number) {
  const { data, loading, error, refetch } = useApi(
    () => aniversariosAPI.getByMes(mes),
    {
      deps: [mes],
      onError: (error) => {
        console.error('❌ Erro ao carregar aniversários:', error);
      },
    }
  );

  const aniversarios = useMemo(() => data || new Map(), [data]);

  return { aniversarios, loading, error, refetch };
}

/**
 * Hook para buscar aniversários de um período
 */
export function useAniversariosPeriodo(dataInicio: string, dataFim: string) {
  const { data, loading, error, refetch } = useApi(
    () => aniversariosAPI.getByPeriodo(dataInicio, dataFim),
    {
      deps: [dataInicio, dataFim],
      onError: (error) => {
        console.error('❌ Erro ao carregar aniversários do período:', error);
      },
    }
  );

  const aniversarios = useMemo(() => data || new Map(), [data]);

  return { aniversarios, loading, error, refetch };
}

/**
 * v2.0 (KOD-79): Hook server-side para buscar aniversários via RPC
 * Usa a function get_aniversarios_periodo do Supabase
 * Ideal para dashboard e widgets de notificação
 */
export function useAniversariosSemana(dataInicio?: string, dataFim?: string) {
  const hoje = new Date().toISOString().split('T')[0];
  const seteDias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const inicio = dataInicio || hoje;
  const fim = dataFim || seteDias;

  return useQuery({
    queryKey: ['aniversarios-semana', inicio, fim],
    queryFn: async (): Promise<AniversarioCalendario[]> => {
      const { data, error } = await supabase.rpc('get_aniversarios_periodo', {
        p_data_inicio: inicio,
        p_data_fim: fim,
      });

      if (error) throw error;

      // Map RPC result to AniversarioCalendario
      return (data || []).map((row: {
        id: string;
        nome: string;
        tipo: string;
        data_nascimento: string;
        avatar_url: string | null;
        cargo: string | null;
        empresa: string | null;
        dia_aniversario: string;
      }) => ({
        id: row.id,
        nome: row.nome,
        tipo: row.tipo as 'colaborador' | 'cliente',
        data: `${row.dia_aniversario.split('-')[1]}-${row.dia_aniversario.split('-')[2]}`,
        dataCompleta: row.data_nascimento,
        avatarUrl: row.avatar_url || undefined,
        cargo: row.cargo || undefined,
        empresa: row.empresa || undefined,
      }));
    },
    staleTime: 1000 * 60 * 60, // 1h cache
  });
}

/**
 * Helper para obter aniversários de uma data específica
 */
export function getAniversariosDia(
  aniversarios: Map<string, AniversarioCalendario[]>,
  data: string // YYYY-MM-DD
): AniversarioCalendario[] {
  const [, mes, dia] = data.split('-');
  const chaveDia = `${mes}-${dia}`;
  return aniversarios.get(chaveDia) || [];
}

// Export API para uso direto
export { aniversariosAPI };

