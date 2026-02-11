/**
 * Hook: useMesCalendario
 *
 * Busca e processa dados de um mês inteiro do calendário.
 * Retorna 42 células (6 semanas × 7 dias) para cobrir qualquer mês.
 * 
 * v2.0: Inclui aniversários de colaboradores e clientes
 */

import { useMemo } from 'react';
import { useApi } from './use-api';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { dateStringToSaoPaulo, todayInSaoPaulo } from '@/lib/utils/timezone';
import { TurnoProcessado, AgendamentoProcessado } from './use-semana-calendario';
import type { AniversarioCalendario } from '@/lib/types';

// =====================================================
// TYPES
// =====================================================

/** Lightweight bloqueio info for cell rendering */
export interface BloqueioCell {
  id: string;
  motivo: string;      // 'feriado' | 'manutencao' | etc.
  descricao?: string;
  cor?: string;
  diaInteiro: boolean;
}

export interface CelulaDia {
  data: string;             // "2025-12-15"
  turnos: TurnoProcessado[];
  agendamentos: AgendamentoProcessado[];
  aniversarios: AniversarioCalendario[];  // v2.0
  bloqueios: BloqueioCell[];              // v3.0: feriados + bloqueios
  isOutsideMonth: boolean;  // Dia pertence ao mês anterior/próximo
  isToday: boolean;
  isBloqueado: boolean;     // v3.0: true se dia inteiro bloqueado
}

export interface MesData {
  mes: string;              // "2025-12"
  celulas: CelulaDia[];     // 42 células (6 semanas)
  turnos: Map<string, TurnoProcessado[]>;
  agendamentos: Map<string, AgendamentoProcessado[]>;
  aniversarios: Map<string, AniversarioCalendario[]>;  // v2.0: key = "MM-DD"
  bloqueios: Map<string, BloqueioCell[]>;               // v3.0: key = "YYYY-MM-DD"
}

// =====================================================
// API FUNCTIONS
// =====================================================

const mesAPI = {
  /**
   * Buscar dados completos de um mês (42 dias)
   */
  async getMes(mesInicio: string): Promise<MesData> {
    // mesInicio = "2025-12-01"
    const [ano, mes] = mesInicio.split('-').map(Number);

    // Calcular primeiro e último dia do mês
    const primeiroDiaMes = dateStringToSaoPaulo(`${ano}-${String(mes).padStart(2, '0')}-01`);


    // Calcular início da grade (domingo antes do primeiro dia)
    const inicioDomingo = new Date(primeiroDiaMes);
    inicioDomingo.setDate(inicioDomingo.getDate() - primeiroDiaMes.getDay());

    // Calcular fim da grade (sábado após o último dia, completando 42 células)
    const fimSabado = new Date(inicioDomingo);
    fimSabado.setDate(fimSabado.getDate() + 41); // 42 dias (6 semanas)

    const dataInicioStr = inicioDomingo.toISOString().split('T')[0];
    const dataFimStr = fimSabado.toISOString().split('T')[0];

    // 1. Buscar todos os turnos ativos
    const { data: turnosDB, error: errorTurnos } = await supabase
      .from('turnos')
      .select('*')
      .eq('ativo', true);

    if (errorTurnos) throw errorTurnos;

    // 2. Buscar agendamentos do período (42 dias)
    const { data: agendamentosDB, error: errorAgendamentos } = await supabase
      .from('agendamentos')
      .select(`
        id,
        turno_id,
        data,
        horario_inicio,
        horario_fim,
        categoria,
        setor,
        status,
        descricao,
        responsavel:responsavel_id (nome_completo, avatar_url),
        colaborador:criado_por (nome_completo),
        ordens_servico:os_id (codigo_os, descricao),
        os_etapas:etapa_id (nome_etapa)
      `)
      .gte('data', dataInicioStr)
      .lte('data', dataFimStr)
      .in('status', ['confirmado', 'realizado']);

    if (errorAgendamentos) throw errorAgendamentos;

    // 2.1 v2.0: Buscar aniversários de colaboradores
    const { data: colaboradores, error: errorColabs } = await supabase
      .from('colaboradores')
      .select('id, nome_completo, data_nascimento, avatar_url, funcao')
      .eq('ativo', true)
      .not('data_nascimento', 'is', null);

    if (errorColabs) throw errorColabs;

    // 2.2 v3.0: Buscar bloqueios ativos do período (feriados, manutenção, etc.)
    const { data: bloqueiosDB, error: errorBloqueios } = await supabase
      .from('calendario_bloqueios')
      .select('id, data_inicio, data_fim, motivo, descricao, cor, dia_inteiro')
      .eq('ativo', true)
      .lte('data_inicio', dataFimStr)
      .gte('data_fim', dataInicioStr);

    if (errorBloqueios) throw errorBloqueios;

    // 3. Gerar array de 42 datas
    const datas: string[] = [];
    const current = new Date(inicioDomingo);

    for (let i = 0; i < 42; i++) {
      const ano = current.getFullYear();
      const mes = String(current.getMonth() + 1).padStart(2, '0');
      const dia = String(current.getDate()).padStart(2, '0');
      datas.push(`${ano}-${mes}-${dia}`);
      current.setDate(current.getDate() + 1);
    }

    // 4. Processar turnos por dia
    const turnosPorDia = new Map<string, TurnoProcessado[]>();

    datas.forEach(dataStr => {
      const data = dateStringToSaoPaulo(dataStr);
      const diaSemana = data.getDay();

      const turnosDoDia = (turnosDB || [])
        .filter(turno => {
          // Validar recorrência
          if (turno.tipo_recorrencia === 'todos') return true;
          if (turno.tipo_recorrencia === 'uteis' && diaSemana >= 1 && diaSemana <= 5) return true;
          if (turno.tipo_recorrencia === 'custom' && turno.dias_semana?.includes(diaSemana)) return true;
          return false;
        })
        .filter(turno => {
          // Validar datas (se custom)
          if (turno.data_inicio && dataStr < turno.data_inicio) return false;
          if (turno.data_fim && dataStr > turno.data_fim) return false;
          return true;
        })
        .map(turno => ({
          id: turno.id,
          horaInicio: turno.hora_inicio.slice(0, 5),
          horaFim: turno.hora_fim.slice(0, 5),
          vagasTotal: turno.vagas_total,
          vagasOcupadas: 0,
          setores: turno.setores,
          cor: turno.cor,
          ativo: turno.ativo,
        }));

      if (turnosDoDia.length > 0) {
        turnosPorDia.set(dataStr, turnosDoDia);
      }
    });

    // 5. Processar agendamentos por dia
    const agendamentosPorDia = new Map<string, AgendamentoProcessado[]>();

    (agendamentosDB || []).forEach(agend => {
      const agendamento: AgendamentoProcessado = {
        id: agend.id,
        turnoId: agend.turno_id,
        horarioInicio: agend.horario_inicio.slice(0, 5),
        horarioFim: agend.horario_fim.slice(0, 5),
        categoria: agend.categoria,
        setor: agend.setor,
        status: agend.status,
        descricao: agend.descricao,
        usuarioNome: (agend.colaborador as any)?.nome_completo,
        osCodigo: (agend.ordens_servico as any)?.codigo_os,
        osNome: (agend.ordens_servico as any)?.descricao,
        responsavelNome: (agend.responsavel as any)?.nome_completo,
        etapaNome: (agend.os_etapas as any)?.nome_etapa,
      };

      const lista = agendamentosPorDia.get(agend.data) || [];
      lista.push(agendamento);
      agendamentosPorDia.set(agend.data, lista);
    });

    // 6. Calcular vagas ocupadas
    agendamentosPorDia.forEach((agendamentos, dataStr) => {
      const turnos = turnosPorDia.get(dataStr);
      if (!turnos) return;

      agendamentos.forEach(agend => {
        const turno = turnos.find(t => t.id === agend.turnoId);
        if (turno) {
          turno.vagasOcupadas++;
        }
      });
    });

    // 6.1 v2.0: Processar aniversários
    const aniversariosPorDia = new Map<string, AniversarioCalendario[]>();

    (colaboradores || []).forEach(colab => {
      if (!colab.data_nascimento) return;

      // Extrair mês e dia da data de nascimento
      const dataNasc = new Date(colab.data_nascimento + 'T00:00:00');
      const mesNasc = dataNasc.getMonth() + 1;
      const diaNasc = dataNasc.getDate();

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

    // 6.2 v3.0: Processar bloqueios por dia
    const bloqueiosPorDia = new Map<string, BloqueioCell[]>();

    (bloqueiosDB || []).forEach(bloq => {
      const inicio = bloq.data_inicio;
      const fim = bloq.data_fim || bloq.data_inicio;
      // Expand date range into individual days
      const d = new Date(inicio + 'T00:00:00');
      const dFim = new Date(fim + 'T00:00:00');
      while (d <= dFim) {
        const key = d.toISOString().split('T')[0];
        const cell: BloqueioCell = {
          id: bloq.id,
          motivo: bloq.motivo,
          descricao: bloq.descricao,
          cor: bloq.cor,
          diaInteiro: bloq.dia_inteiro ?? true,
        };
        const lista = bloqueiosPorDia.get(key) || [];
        lista.push(cell);
        bloqueiosPorDia.set(key, lista);
        d.setDate(d.getDate() + 1);
      }
    });

    // 7. Criar células do mês
    const hoje = todayInSaoPaulo();
    const mesAtual = primeiroDiaMes.getMonth();

    const celulas: CelulaDia[] = datas.map(dataStr => {
      const data = dateStringToSaoPaulo(dataStr);
      const mesData = data.getMonth();
      const diaMes = data.getDate();
      const isOutsideMonth = mesData !== mesAtual;
      const isToday = dataStr === hoje;

      // v2.0: Buscar aniversários do dia
      const chaveDia = `${String(mesData + 1).padStart(2, '0')}-${String(diaMes).padStart(2, '0')}`;
      const aniversariosDoDia = aniversariosPorDia.get(chaveDia) || [];

      // v3.0: Buscar bloqueios do dia
      const bloqueiosDoDia = bloqueiosPorDia.get(dataStr) || [];
      const isBloqueado = bloqueiosDoDia.some(b => b.diaInteiro && b.motivo !== 'ponto_facultativo');

      return {
        data: dataStr,
        turnos: turnosPorDia.get(dataStr) || [],
        agendamentos: agendamentosPorDia.get(dataStr) || [],
        aniversarios: aniversariosDoDia,
        bloqueios: bloqueiosDoDia,
        isOutsideMonth,
        isToday,
        isBloqueado,
      };
    });

    return {
      mes: `${ano}-${String(mes).padStart(2, '0')}`,
      celulas,
      turnos: turnosPorDia,
      agendamentos: agendamentosPorDia,
      aniversarios: aniversariosPorDia,
      bloqueios: bloqueiosPorDia,
    };
  },
};

// =====================================================
// HOOK
// =====================================================

/**
 * Hook para carregar dados de um mês do calendário
 *
 * @param mesInicio - Primeiro dia do mês no formato YYYY-MM-DD (ex: "2025-12-01")
 */
export function useMesCalendario(mesInicio: string) {
  const { data, loading, error, refetch } = useApi(
    () => mesAPI.getMes(mesInicio),
    {
      deps: [mesInicio],
      onError: (error) => {
        console.error('❌ Erro ao carregar mês:', error);
        toast.error(`Erro ao carregar calendário: ${error.message}`);
      },
    }
  );

  const mesData = useMemo(() => data || null, [data]);

  return { mesData, loading, error, refetch };
}
