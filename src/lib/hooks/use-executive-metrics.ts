/**
 * Hook: useExecutiveMetrics
 * 
 * Fornece métricas agregadas para o Dashboard Executivo:
 * - Valor Total em Carteira
 * - Saúde das Entregas (% no prazo)
 * - Setor Gargalo
 * - Dados para gráfico de evolução
 */
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase-client';

// ============================================================
// TIPOS
// ============================================================

export interface ExecutiveMetrics {
  valorTotalCarteira: number;
  saudeEntregas: {
    noPrazo: number;
    atrasadas: number;
    percentualNoPrazo: number;
  };
  setorGargalo: {
    setor: string;
    quantidade: number;
  } | null;
  leadsVsContratos: {
    leads: number;
    contratos: number;
    taxaConversao: number;
  };
}

export interface OSEvolution {
  mes: string;
  quantidade: number;
  valorTotal: number;
}

interface UseExecutiveMetricsReturn {
  metrics: ExecutiveMetrics;
  evolution: OSEvolution[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// ============================================================
// HOOK
// ============================================================

export function useExecutiveMetrics(): UseExecutiveMetricsReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [rawData, setRawData] = useState<{
    osAtivas: any[];
    osTotal: any[];
  }>({ osAtivas: [], osTotal: [] });

  // Fetch principal
  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Buscar todas as OSs ativas com dados relevantes
      const { data: osAtivas, error: osError } = await supabase
        .from('ordens_servico')
        .select(`
          id,
          codigo_os,
          status_geral,
          valor_contrato,
          data_prazo,
          data_entrada,
          is_contract_active,
          tipo_os_id,
          tipos_os!inner(
            setor_padrao_id,
            setores(slug, nome)
          )
        `)
        .not('status_geral', 'in', '("concluido","cancelado")');

      if (osError) throw osError;

      // 2. Buscar contratos dos últimos 6 meses para evolução
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: osTotal, error: totalError } = await supabase
        .from('ordens_servico')
        .select('id, status_geral, data_entrada, valor_contrato, is_contract_active')
        .eq('is_contract_active', true)
        .gte('data_entrada', sixMonthsAgo.toISOString());

      if (totalError) throw totalError;

      setRawData({ osAtivas: osAtivas || [], osTotal: osTotal || [] });
    } catch (err) {
      console.error('[useExecutiveMetrics] Erro:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Calcular métricas a partir dos dados brutos
  const metrics = useMemo<ExecutiveMetrics>(() => {
    const { osAtivas } = rawData;
    const hoje = new Date();

    // 1. Valor Total em Carteira
    const valorTotalCarteira = osAtivas
      .filter(os => os.is_contract_active)
      .reduce((sum, os) => sum + (os.valor_contrato || 0), 0);

    // 2. Saúde das Entregas
    const osComPrazo = osAtivas.filter(os => os.data_prazo);
    const noPrazo = osComPrazo.filter(os => new Date(os.data_prazo) >= hoje).length;
    const atrasadas = osComPrazo.filter(os => new Date(os.data_prazo) < hoje).length;
    const percentualNoPrazo = osComPrazo.length > 0 
      ? Math.round((noPrazo / osComPrazo.length) * 100) 
      : 100;

    // 3. Setor Gargalo (OS paradas > 7 dias)
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    const osParadas = osAtivas.filter(os => {
      const dataEntrada = os.data_entrada ? new Date(os.data_entrada) : null;
      return dataEntrada && dataEntrada < seteDiasAtras && os.status_geral === 'em_triagem';
    });

    // Agrupar por setor
    const porSetor: Record<string, number> = {};
    osParadas.forEach(os => {
      const setor = os.tipos_os?.setores?.nome || 'Sem Setor';
      porSetor[setor] = (porSetor[setor] || 0) + 1;
    });

    // Encontrar setor com mais OS paradas
    let setorGargalo: { setor: string; quantidade: number } | null = null;
    Object.entries(porSetor).forEach(([setor, quantidade]) => {
      if (!setorGargalo || quantidade > setorGargalo.quantidade) {
        setorGargalo = { setor, quantidade };
      }
    });

    // 4. Leads vs Contratos (mês atual)
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const osDoMes = osAtivas.filter(os => {
      const dataEntrada = os.data_entrada ? new Date(os.data_entrada) : null;
      return dataEntrada && dataEntrada >= inicioMes;
    });
    const leads = osDoMes.length;
    const contratos = osDoMes.filter(os => os.is_contract_active).length;
    const taxaConversao = leads > 0 ? Math.round((contratos / leads) * 100) : 0;

    return {
      valorTotalCarteira,
      saudeEntregas: { noPrazo, atrasadas, percentualNoPrazo },
      setorGargalo,
      leadsVsContratos: { leads, contratos, taxaConversao }
    };
  }, [rawData]);

  // Calcular evolução de contratos (últimos 6 meses)
  const evolution = useMemo<OSEvolution[]>(() => {
    const { osTotal } = rawData;
    const meses: OSEvolution[] = [];
    const hoje = new Date();

    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesLabel = data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      const inicioMes = new Date(data.getFullYear(), data.getMonth(), 1);
      const fimMes = new Date(data.getFullYear(), data.getMonth() + 1, 0);

      // Filtrar contratos criados neste mês
      const contratosMes = osTotal.filter(os => {
        const dataEntrada = os.data_entrada ? new Date(os.data_entrada) : null;
        return dataEntrada && dataEntrada >= inicioMes && dataEntrada <= fimMes;
      });

      const quantidade = contratosMes.length;
      const valorTotal = contratosMes.reduce((sum, os) => sum + (os.valor_contrato || 0), 0);

      meses.push({ 
        mes: mesLabel.replace('.', ''), 
        quantidade, 
        valorTotal: Math.round(valorTotal / 1000) // Converter para milhares
      });
    }

    return meses;
  }, [rawData]);

  return {
    metrics,
    evolution,
    loading,
    error,
    refetch: fetchMetrics
  };
}

