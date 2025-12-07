/**
 * Hook: useAniversarios
 *
 * Busca aniversários de colaboradores e clientes para exibição no calendário.
 * Retorna um Map com chave no formato MM-DD e lista de aniversariantes.
 */

import { useMemo } from 'react';
import { useApi } from './use-api';
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
    const mesStr = String(mes).padStart(2, '0');

    // Buscar colaboradores com data de nascimento no mês
    const { data: colaboradores, error: errColabs } = await supabase
      .from('colaboradores')
      .select('id, nome_completo, data_nascimento, avatar_url, funcao')
      .eq('ativo', true)
      .not('data_nascimento', 'is', null);

    if (errColabs) throw errColabs;

    // Buscar clientes (se tiverem campo de data de aniversário/fundação)
    // Por enquanto, clientes não têm data de nascimento no schema, mas preparamos a estrutura
    // const { data: clientes, error: errClientes } = await supabase
    //   .from('clientes')
    //   .select('id, nome_razao_social, data_fundacao')
    //   .eq('status', 'ativo')
    //   .not('data_fundacao', 'is', null);

    // Processar aniversários
    const aniversariosPorDia = new Map<string, AniversarioCalendario[]>();

    // Processar colaboradores
    (colaboradores || []).forEach(colab => {
      if (!colab.data_nascimento) return;

      // Extrair mês e dia da data de nascimento
      const dataNasc = new Date(colab.data_nascimento + 'T00:00:00');
      const mesNasc = dataNasc.getMonth() + 1;
      const diaNasc = dataNasc.getDate();

      // Verificar se é do mês solicitado
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

    return aniversariosPorDia;
  },

  /**
   * Buscar todos os aniversários de um período (para exibição mensal com overflow)
   */
  async getByPeriodo(dataInicio: string, dataFim: string): Promise<Map<string, AniversarioCalendario[]>> {
    // Extrair meses únicos do período
    const [anoInicio, mesInicio] = dataInicio.split('-').map(Number);
    const [anoFim, mesFim] = dataFim.split('-').map(Number);

    // Coletar meses únicos
    const meses = new Set<number>();
    let current = new Date(anoInicio, mesInicio - 1, 1);
    const end = new Date(anoFim, mesFim - 1, 1);

    while (current <= end) {
      meses.add(current.getMonth() + 1);
      current.setMonth(current.getMonth() + 1);
    }

    // Buscar aniversários de todos os meses
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
