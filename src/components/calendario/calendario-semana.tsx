import { useState, useMemo, lazy, Suspense, memo, useEffect } from 'react';
import { ScheduleXCalendar, useCalendarApp } from '@schedule-x/react';
import { createViewWeek, createViewDay } from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls';
import '@schedule-x/theme-default/dist/index.css';
import { Temporal } from '@js-temporal/polyfill';
import { toast } from 'sonner';
import { TurnoComVagas } from '../../lib/hooks/use-turnos';
import { convertToScheduleXDateTime } from '../../lib/utils/temporal-helpers';

// Initialize Temporal polyfill globally
if (typeof (globalThis as any).Temporal === 'undefined') {
    (globalThis as any).Temporal = Temporal;
}

// Lazy load modal
const ModalNovoAgendamento = lazy(() => import('./modal-novo-agendamento').then(m => ({ default: m.ModalNovoAgendamento })));

interface CalendarioSemanaProps {
    dataAtual: Date;
    turnosPorDia: Map<string, TurnoComVagas[]> | null;
    agendamentos: any[];
    loading: boolean;
    error: Error | null;
    onRefresh: () => void;
    onTurnoClick?: (turno: TurnoComVagas, dia: Date) => void;
}

function CalendarioSemanaComponent({
    dataAtual,
    turnosPorDia,
    agendamentos,
    loading,
    error,
    onRefresh
}: CalendarioSemanaProps) {
    const [modalAgendamento, setModalAgendamento] = useState(false);
    const [turnoSelecionado, setTurnoSelecionado] = useState<TurnoComVagas | null>(null);
    const [isClientReady, setIsClientReady] = useState(false);

    // Initialize Temporal polyfill and mark client as ready
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (typeof (globalThis as any).Temporal === 'undefined') {
                (globalThis as any).Temporal = Temporal;
            }
            setIsClientReady(true);
        }
    }, []);

    // Helper para formatar data para Schedule-X
    const formatDateForScheduleX = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Preparar eventos para Schedule-X com conversão Temporal
    const calendarEvents = useMemo(() => {
        const events: any[] = [];

        if (!turnosPorDia) return events;

        // Mapear turnos como background events (janelas de disponibilidade)
        turnosPorDia.forEach((turnos, dataStr) => {
            turnos.forEach(turno => {
                if (turno.ativo === false) return;

                events.push({
                    id: `turno-${turno.id}`,
                    title: `Turno ${turno.horaInicio}-${turno.horaFim}`,
                    start: convertToScheduleXDateTime(dataStr, turno.horaInicio),
                    end: convertToScheduleXDateTime(dataStr, turno.horaFim),
                    _options: {
                        backgroundColor: turno.cor,
                        opacity: 0.3,
                        borderColor: turno.cor,
                        textColor: '#000000',
                        additionalClasses: ['turno-background']
                    },
                    _customContent: {
                        type: 'turno',
                        turno: turno
                    }
                });
            });
        });

        // Mapear agendamentos como eventos normais
        agendamentos.forEach(agendamento => {
            if (agendamento.status === 'cancelado') return;

            events.push({
                id: `agendamento-${agendamento.id}`,
                title: agendamento.categoria,
                start: convertToScheduleXDateTime(agendamento.data, agendamento.horarioInicio),
                end: convertToScheduleXDateTime(agendamento.data, agendamento.horarioFim),
                _options: {
                    backgroundColor: '#3B82F6',
                    borderColor: '#2563EB',
                    textColor: '#FFFFFF'
                },
                _customContent: {
                    type: 'agendamento',
                    agendamento: agendamento
                }
            });
        });

        return events;
    }, [turnosPorDia, agendamentos]);

    // Verificar se um horário específico tem um turno válido (lógica whitelist)
    const encontrarTurnoNoHorario = (dateTime: Date): TurnoComVagas | null => {
        if (!turnosPorDia) return null;

        const dataStr = dateTime.toISOString().split('T')[0];
        const hora = dateTime.getHours();
        const turnosDoDia = turnosPorDia.get(dataStr) || [];

        return turnosDoDia.find(turno => {
            if (turno.ativo === false) return false;

            const [horaInicio] = turno.horaInicio.split(':').map(Number);
            const [horaFim] = turno.horaFim.split(':').map(Number);

            return hora >= horaInicio && hora < horaFim;
        }) || null;
    };

    // Loading state
    if (loading) {
        return (
            <div className="p-6">
                <div className="border border-neutral-200 rounded-lg overflow-hidden p-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-neutral-200 rounded mb-4"></div>
                        <div className="grid grid-cols-7 gap-4">
                            {Array.from({ length: 35 }).map((_, i) => (
                                <div key={i} className="h-20 bg-neutral-100 rounded"></div>
                            ))}
                        </div>
                    </div>
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
                    <button
                        onClick={onRefresh}
                        className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    // Wrapper do calendário que só renderiza no client
    const ScheduleXCalendarWrapper = () => {
        const calendarApp = useCalendarApp({
            views: [createViewWeek(), createViewDay()],
            events: calendarEvents,
            selectedDate: formatDateForScheduleX(dataAtual),
            locale: 'pt-BR',
            firstDayOfWeek: 1,
            plugins: [
                createEventsServicePlugin(),
                createDragAndDropPlugin(),
                createEventModalPlugin(),
                createCalendarControlsPlugin()
            ],
            callbacks: {
                onEventClick: (event: any) => {
                    const customContent = event._customContent;
                    if (customContent?.type === 'agendamento') {
                        console.log('Detalhes do agendamento:', customContent.agendamento);
                    }
                },
                onClickDateTime: (dateTime: Date) => {
                    const turno = encontrarTurnoNoHorario(dateTime);
                    if (!turno) {
                        toast.error('Não há turnos abertos neste horário');
                        return;
                    }
                    setTurnoSelecionado(turno);
                    setModalAgendamento(true);
                }
            }
        });

        return <ScheduleXCalendar calendarApp={calendarApp} />;
    };

    return (
        <div className="p-6">
            {/* Calendário Schedule-X */}
            {isClientReady ? (
                <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
                    <ScheduleXCalendarWrapper />
                </div>
            ) : (
                <div className="border border-neutral-200 rounded-lg overflow-hidden p-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-neutral-200 rounded mb-4"></div>
                        <div className="grid grid-cols-7 gap-4">
                            {Array.from({ length: 35 }).map((_, i) => (
                                <div key={i} className="h-20 bg-neutral-100 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Agendamento com Turno Restrito */}
            <Suspense fallback={null}>
                <ModalNovoAgendamento
                    open={modalAgendamento}
                    onClose={() => setModalAgendamento(false)}
                    turno={turnoSelecionado}
                    dia={new Date()} // TODO: passar data correta do clique
                    onSuccess={onRefresh}
                />
            </Suspense>
        </div>
    );
}

// Memoize component para evitar re-renders desnecessários
export const CalendarioSemana = memo(CalendarioSemanaComponent);