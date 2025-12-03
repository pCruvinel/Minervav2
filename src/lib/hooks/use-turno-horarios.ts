import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/utils/logger';

export interface HorarioSlot {
  hora: string;          // "09:00"
  horaFim: string;       // "10:00"
  disponivel: boolean;   // true/false
  agendamentos: number;  // Quantidade de agendamentos neste slot
}

/**
 * useTurnoHorariosDisponiveis - Hook para buscar horários disponíveis/ocupados
 *
 * Busca agendamentos confirmados do turno no dia especificado e
 * retorna array de slots de 1 hora com status disponível/ocupado.
 *
 * @param turnoId - ID do turno
 * @param data - Data no formato YYYY-MM-DD
 * @param horaInicio - Hora de início do turno (ex: "08:00")
 * @param horaFim - Hora de fim do turno (ex: "18:00")
 */
export function useTurnoHorariosDisponiveis(
  turnoId: string | undefined,
  data: string | undefined,
  horaInicio: string | undefined,
  horaFim: string | undefined
) {
  const [slots, setSlots] = useState<HorarioSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Validar parâmetros obrigatórios
    if (!turnoId || !data || !horaInicio || !horaFim) {
      setSlots([]);
      setLoading(false);
      return;
    }

    async function fetchHorarios() {
      try {
        setLoading(true);
        setError(null);

        logger.log('Buscando horários disponíveis:', {
          turnoId,
          data,
          horaInicio,
          horaFim,
        });

        // Buscar agendamentos confirmados/realizados do turno naquele dia
        const { data: agendamentos, error: fetchError } = await supabase
          .from('agendamentos')
          .select('horario_inicio, horario_fim')
          .eq('turno_id', turnoId)
          .eq('data', data)
          .in('status', ['confirmado', 'realizado']);

        if (fetchError) {
          throw new Error(`Erro ao buscar agendamentos: ${fetchError.message}`);
        }

        logger.log('Agendamentos encontrados:', agendamentos || []);

        // Gerar slots de 1 hora
        const [hInicio] = horaInicio.split(':').map(Number);
        const [hFim] = horaFim.split(':').map(Number);

        const slotsGerados: HorarioSlot[] = [];

        for (let h = hInicio; h < hFim; h++) {
          const hora = `${String(h).padStart(2, '0')}:00`;
          const horaFimSlot = `${String(h + 1).padStart(2, '0')}:00`;

          // Verificar se há agendamento neste horário
          const ocupado = (agendamentos || []).some((a) => {
            const [aInicio] = a.horario_inicio.split(':').map(Number);
            const [aFim] = a.horario_fim.split(':').map(Number);
            // Slot está ocupado se há overlap: hora atual >= início agendamento E hora atual < fim agendamento
            return h >= aInicio && h < aFim;
          });

          slotsGerados.push({
            hora,
            horaFim: horaFimSlot,
            disponivel: !ocupado,
            agendamentos: ocupado ? 1 : 0,
          });
        }

        logger.log('Slots gerados:', slotsGerados);
        setSlots(slotsGerados);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido ao buscar horários';
        logger.error('Erro em useTurnoHorariosDisponiveis:', errorMessage);
        setError(new Error(errorMessage));
        setSlots([]);
      } finally {
        setLoading(false);
      }
    }

    fetchHorarios();
  }, [turnoId, data, horaInicio, horaFim]);

  return {
    slots,
    loading,
    error,
  };
}
