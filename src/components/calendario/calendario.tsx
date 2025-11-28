import { logger } from '@/lib/utils/logger';
import { useState, useMemo, lazy, Suspense, memo } from 'react';
import { Button } from '../ui/button';
import { TurnoComVagas } from '../../lib/hooks/use-turnos';
import { SkeletonTurnoGrid } from '../ui/skeleton';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import dayGridMonthPlugin from '@fullcalendar/daygrid';
import './fullcalendar-custom.css';

// Lazy load modais para melhor performance (carregam só quando abertos)
const ModalNovoAgendamento = lazy(() => import('./modal-novo-agendamento').then(m => ({ default: m.ModalNovoAgendamento })));
const ModalDetalhesAgendamento = lazy(() => import('./modal-detalhes-agendamento').then(m => ({ default: m.ModalDetalhesAgendamento })));

interface CalendarioSemanaProps {
  dataAtual: Date;
  turnosPorDia: Map<string, TurnoComVagas[]> | null;
  agendamentos: any[];
  loading: boolean;
  error: Error | null;
  onRefresh: () => void;
  onTurnoClick?: (turno: TurnoComVagas, dia: Date) => void;
}

function CalendarioComponent({
  dataAtual,
  turnosPorDia,
  agendamentos,
  loading,
  error,
  onRefresh,
  onTurnoClick
}: CalendarioSemanaProps) {
  const [modalAgendamento, setModalAgendamento] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [turnoSelecionado, setTurnoSelecionado] = useState<any>(null);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<any>(null);

  // TODO: implementar verificação real de admin
  const isAdmin = false;

  const handleRefresh = onRefresh;

  // Preparar eventos para o FullCalendar
  const calendarEvents = useMemo((): EventInput[] => {
    const events: EventInput[] = [];

    if (!turnosPorDia) return events;

    // Mapear turnos como background events
    turnosPorDia.forEach((turnos, dataStr) => {
      turnos.forEach(turno => {
        if (turno.ativo === false) return; // Pular turnos desabilitados

        // Background event para o turno
        events.push({
          id: `turno-${turno.id}`,
          start: `${dataStr}T${turno.horaInicio}`,
          end: `${dataStr}T${turno.horaFim}`,
          display: 'background',
          backgroundColor: turno.cor,
          extendedProps: {
            type: 'turno',
            turno: turno
          }
        });
      });
    });

    // Mapear agendamentos como eventos normais
    agendamentos.forEach(agendamento => {
      if (agendamento.status === 'cancelado') return; // Não mostrar cancelados

      events.push({
        id: `agendamento-${agendamento.id}`,
        title: agendamento.categoria,
        start: `${agendamento.data}T${agendamento.horarioInicio}`,
        end: `${agendamento.data}T${agendamento.horarioFim}`,
        backgroundColor: '#3B82F6', // Azul
        borderColor: '#2563EB',
        textColor: '#FFFFFF',
        extendedProps: {
          type: 'agendamento',
          agendamento: agendamento
        }
      });
    });

    return events;
  }, [turnosPorDia, agendamentos]);

  // Verificar se há turno em um horário específico
  const encontrarTurnoNoHorario = (data: Date, hora: number): TurnoComVagas | null => {
    if (!turnosPorDia) return null;

    const dataStr = data.toISOString().split('T')[0];
    const turnosDoDia = turnosPorDia.get(dataStr) || [];

    return turnosDoDia.find(turno => {
      if (turno.ativo === false) return false;

      const [horaInicio] = turno.horaInicio.split(':').map(Number);
      const [horaFim] = turno.horaFim.split(':').map(Number);

      return hora >= horaInicio && hora < horaFim;
    }) || null;
  };

  // Handlers do FullCalendar
  const handleDateClick = (arg: any) => {
    // Se for admin, pode criar turno
    if (isAdmin) {
      // TODO: abrir modal de criar turno
      console.log('Criar turno em:', arg.date);
    } else {
      // Verificar se há turno neste horário
      const turno = encontrarTurnoNoHorario(arg.date, arg.date.getHours());
      if (turno) {
        // Abrir modal de agendamento
        setTurnoSelecionado(turno);
        setModalAgendamento(true);
      }
    }
  };

  const handleEventClick = (arg: EventClickArg) => {
    const { type, agendamento, turno } = arg.event.extendedProps;

    if (type === 'agendamento') {
      // Abrir modal de detalhes do agendamento
      setAgendamentoSelecionado(agendamento);
      setModalDetalhes(true);
    } else if (type === 'turno') {
      // Verificar se pode agendar neste turno
      if (turno.vagasOcupadas < turno.vagasTotal) {
        setTurnoSelecionado(turno);
        setModalAgendamento(true);
      }
    }
  };

  const handleClickTurno = (turno: TurnoComVagas) => {
    if (turno.vagasOcupadas < turno.vagasTotal) {
      if (onTurnoClick) {
        // TODO: passar a data correta
        onTurnoClick(turno, new Date());
      } else {
        setTurnoSelecionado(turno);
        setModalAgendamento(true);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="border border-neutral-200 rounded-lg overflow-hidden p-6">
          <SkeletonTurnoGrid count={5} />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-medium">Erro ao carregar turnos</p>
          <p className="text-sm mt-1">{error.message}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="mt-2"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        {/* FullCalendar */}
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            initialDate={dataAtual}
            events={calendarEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            contentHeight="auto"
            aspectRatio={1.0}
            slotMinTime="08:00:00"
            slotMaxTime="18:00:00"
            slotDuration="01:00:00"
            slotLabelInterval="01:00:00"
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            dayHeaderFormat={{
              weekday: 'short',
              day: 'numeric',
              month: 'numeric'
            }}
            dayMaxEvents={3}
            moreLinkClick="popover"
            locale="pt-br"
            firstDay={1} // Segunda-feira
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            buttonText={{
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia'
            }}
            allDaySlot={false}
            nowIndicator={true}
            editable={false}
            selectable={true}
            selectMirror={true}
            eventDisplay="block"
            displayEventTime={false}
          />
        </div>
      </div>

      {/* Modais */}
      <Suspense fallback={null}>
        <ModalNovoAgendamento
          open={modalAgendamento}
          onClose={() => setModalAgendamento(false)}
          turno={turnoSelecionado}
          dia={new Date()} // TODO: passar data correta
          onSuccess={handleRefresh}
        />
        <ModalDetalhesAgendamento
          open={modalDetalhes}
          onClose={() => setModalDetalhes(false)}
          agendamento={agendamentoSelecionado}
        />
      </Suspense>
    </>
  );
}

// Memoize component para evitar re-renders desnecessários
export const Calendario = memo(CalendarioComponent);