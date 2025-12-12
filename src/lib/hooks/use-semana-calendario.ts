/**
 * Hook: useSemanaCalendario
 * 
 * Combina turnos e agendamentos para uma semana específica,
 * processando recorrência e disponibilidade de vagas.
 * Otimizado para 2 queries apenas (turnos + agendamentos).
 */

import { useMemo } from 'react';
import { useApi } from './use-api';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { dateStringToSaoPaulo } from '@/lib/utils/timezone';

// =====================================================
// TYPES
// =====================================================

export interface TurnoProcessado {
  id: string;
  horaInicio: string;      // "08:00"
  horaFim: string;         // "12:00"
  vagasTotal: number;
  vagasOcupadas: number;
  vagasPorSetor: Record<string, number>;  // { "Obras": 2, "Assessoria": 1 }
  setores: string[];
  cor: 'verde' | 'verm' | 'azul';
  ativo: boolean;
}

export interface AgendamentoProcessado {
  id: string;
  turnoId: string;
  horarioInicio: string;
  horarioFim: string;
  categoria: string;
  setor: string;
  status: string;
  usuarioNome?: string;
  usuarioAvatarUrl?: string;
  osCodigo?: string;
}

export interface CelulaData {
  data: string;            // "2025-12-02"
  diaSemana: number;       // 0-6 (0=Dom)
  hora: number;            // 6-20
  turno: TurnoProcessado | null;
  agendamentos: AgendamentoProcessado[];
  podeAgendar: boolean;
}

export interface SemanaData {
  dataInicio: string;
  dataFim: string;
  dias: string[];          // 7 datas da semana
  turnos: Map<string, TurnoProcessado[]>;  // key: "2025-12-02"
  agendamentos: Map<string, AgendamentoProcessado[]>;
  celulas: Map<string, CelulaData>;  // key: "2025-12-02-09"
}

// =====================================================
// API FUNCTIONS
// =====================================================

const semanaAPI = {
  /**
   * Buscar dados completos de uma semana
   */
  async getSemana(dataInicio: string, dataFim: string): Promise<SemanaData> {
    // 1. Buscar todos os turnos ativos (1 query)
    const { data: turnosDB, error: errorTurnos } = await supabase
      .from('turnos')
      .select('*')
      .eq('ativo', true);

    if (errorTurnos) throw errorTurnos;

    // 2. Buscar agendamentos da semana (1 query)
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
        responsavel:responsavel_id (nome_completo, avatar_url),
        ordens_servico:os_id (codigo_os)
      `)
      .gte('data', dataInicio)
      .lte('data', dataFim)
      .in('status', ['confirmado', 'realizado']);

    if (errorAgendamentos) throw errorAgendamentos;

    // 3. Gerar array de datas da semana (timezone SP)
    const dias: string[] = [];
    const current = dateStringToSaoPaulo(dataInicio);
    const end = dateStringToSaoPaulo(dataFim);

    while (current <= end) {
      const ano = current.getFullYear();
      const mes = String(current.getMonth() + 1).padStart(2, '0');
      const dia = String(current.getDate()).padStart(2, '0');
      dias.push(`${ano}-${mes}-${dia}`);
      current.setDate(current.getDate() + 1);
    }

    // 4. Processar turnos por dia (calcular recorrência)
    const turnosPorDia = new Map<string, TurnoProcessado[]>();

    dias.forEach(dataStr => {
      const data = dateStringToSaoPaulo(dataStr);
      const diaSemana = data.getDay(); // 0=Dom, 6=Sáb

      const turnosDoDia = turnosDB
        .filter(turno => {
          // Validar disponibilidade
          if (turno.tipo_recorrencia === 'uteis' && diaSemana >= 1 && diaSemana <= 5) return true;
          if (turno.tipo_recorrencia === 'recorrente' && turno.dias_semana?.includes(diaSemana)) return true;
          if (turno.tipo_recorrencia === 'custom') return true; // Custom = período específico, válido em qualquer dia do range
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
          horaInicio: turno.hora_inicio.slice(0, 5), // "08:00:00" → "08:00"
          horaFim: turno.hora_fim.slice(0, 5),
          vagasTotal: turno.vagas_total,
          vagasOcupadas: 0, // Será calculado com agendamentos
          vagasPorSetor: turno.vagas_por_setor || {}, // Vagas específicas por setor
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
        usuarioNome: (agend.responsavel as any)?.nome_completo,
        usuarioAvatarUrl: (agend.responsavel as any)?.avatar_url,
        osCodigo: (agend.ordens_servico as any)?.codigo_os,
      };

      const lista = agendamentosPorDia.get(agend.data) || [];
      lista.push(agendamento);
      agendamentosPorDia.set(agend.data, lista);
    });

    // 6. Calcular vagas ocupadas por turno
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

    // 7. Criar células otimizadas (mapeamento rápido)
    const celulas = new Map<string, CelulaData>();

    dias.forEach(dataStr => {
      const data = dateStringToSaoPaulo(dataStr);
      const diaSemana = data.getDay();
      const turnosDoDia = turnosPorDia.get(dataStr) || [];
      const agendamentosDoDia = agendamentosPorDia.get(dataStr) || [];

      // Criar células para horários 6h-20h
      for (let hora = 6; hora <= 20; hora++) {
        // Encontrar turno para este horário
        const turno = turnosDoDia.find(t => {
          const [hInicio] = t.horaInicio.split(':').map(Number);
          const [hFim] = t.horaFim.split(':').map(Number);
          return hora >= hInicio && hora < hFim;
        }) || null;

        // Encontrar agendamentos para este horário
        const agendamentosHora = agendamentosDoDia.filter(a => {
          const [hInicio] = a.horarioInicio.split(':').map(Number);
          const [hFim] = a.horarioFim.split(':').map(Number);
          return hora >= hInicio && hora < hFim;
        });

        const celula: CelulaData = {
          data: dataStr,
          diaSemana,
          hora,
          turno,
          agendamentos: agendamentosHora,
          podeAgendar: turno !== null && turno.vagasOcupadas < turno.vagasTotal && agendamentosHora.length === 0,
        };

        celulas.set(`${dataStr}-${hora}`, celula);
      }
    });

    return {
      dataInicio,
      dataFim,
      dias,
      turnos: turnosPorDia,
      agendamentos: agendamentosPorDia,
      celulas,
    };
  },
};

// =====================================================
// HOOK
// =====================================================

/**
 * Hook para carregar dados de uma semana do calendário
 */
export function useSemanaCalendario(dataInicio: string, dataFim: string) {
  const { data, loading, error, refetch } = useApi(
    () => semanaAPI.getSemana(dataInicio, dataFim),
    {
      deps: [dataInicio, dataFim],
      onError: (error) => {
        console.error('❌ Erro ao carregar semana:', error);
        toast.error(`Erro ao carregar calendário: ${error.message}`);
      },
    }
  );

  const semanaData = useMemo(() => data || null, [data]);

  return { semanaData, loading, error, refetch };
}