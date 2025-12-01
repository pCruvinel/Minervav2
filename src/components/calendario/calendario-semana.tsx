import { useState, useMemo, lazy, Suspense, memo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import tippy from 'tippy.js';
import { toast } from 'sonner';
import type { EventClickArg, EventDropArg, EventMountArg, DateSelectArg } from '@fullcalendar/core';
import type { DateClickArg, EventResizeDoneArg } from '@fullcalendar/interaction';
import { TurnoComVagas } from '../../lib/hooks/use-turnos';
import { supabase } from '@/lib/supabase-client';
import { categoryColors } from '@/lib/design-tokens';

import 'tippy.js/dist/tippy.css';

// Lazy load modals
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

/**
 * CalendarioSemanaComponent - Calendário semanal com FullCalendar
 *
 * Exibe turnos disponíveis como eventos de fundo e agendamentos confirmados como eventos principais.
 * Permite criar novos agendamentos clicando em horários com turnos disponíveis.
 */
function CalendarioSemanaComponent({
    dataAtual,
    turnosPorDia,
    agendamentos,
    loading,
    error,
    onRefresh
}: CalendarioSemanaProps) {
    const [modalAgendamento, setModalAgendamento] = useState(false);
    const [modalDetalhes, setModalDetalhes] = useState(false);
    const [turnoSelecionado, setTurnoSelecionado] = useState<TurnoComVagas | null>(null);
    const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
    const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<any>(null);

    // Ref do calendário para controle imperativo
    const calendarRef = useRef<FullCalendar>(null);

    // Preparar eventos do FullCalendar
    const calendarEvents = useMemo(() => {
        const events: any[] = [];

        if (!turnosPorDia) return events;

        // Mapear turnos como background events (janelas de disponibilidade)
        turnosPorDia.forEach((turnos, dataStr) => {
            turnos.forEach(turno => {
                if (turno.ativo === false) return;

                // Converter cor hex para rgba com 20% de opacidade
                const hexToRgba = (hex: string, opacity: number = 0.2) => {
                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    if (!result) return hex;
                    const r = parseInt(result[1], 16);
                    const g = parseInt(result[2], 16);
                    const b = parseInt(result[3], 16);
                    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                };

                events.push({
                    id: `turno-${turno.id}`,
                    title: '', // Sem texto, apenas background colorido
                    start: `${dataStr}T${turno.horaInicio}`,
                    end: `${dataStr}T${turno.horaFim}`,
                    display: 'background',
                    backgroundColor: hexToRgba(turno.cor, 0.2), // 20% de opacidade
                    extendedProps: {
                        type: 'turno',
                        turno: turno
                    }
                });
            });
        });

        // Mapear agendamentos como eventos normais
        agendamentos.forEach(agendamento => {
            if (agendamento.status === 'cancelado') return;

            // Obter cores da categoria ou usar azul padrão
            const colors = categoryColors[agendamento.categoria as keyof typeof categoryColors] || {
                bg: 'hsl(var(--primary) / 0.2)',
                border: 'hsl(var(--primary))',
                text: 'hsl(var(--primary))'
            };

            events.push({
                id: `agendamento-${agendamento.id}`,
                title: agendamento.categoria,
                start: `${agendamento.data}T${agendamento.horarioInicio}`,
                end: `${agendamento.data}T${agendamento.horarioFim}`,
                backgroundColor: colors.bg,
                borderColor: colors.border,
                textColor: colors.text,
                className: `fc-event-categoria-${agendamento.categoria.replace(/\s+/g, '-')}`,
                extendedProps: {
                    type: 'agendamento',
                    agendamento: agendamento,
                    categoria: agendamento.categoria
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

    // Handler para seleção de intervalo
    const handleSelect = (selectInfo: DateSelectArg) => {
        const { start, end } = selectInfo;

        // Validar se todo o intervalo tem turno ativo
        const turnoInicio = encontrarTurnoNoHorario(start);
        const turnoFim = encontrarTurnoNoHorario(new Date(end.getTime() - 1));

        if (!turnoInicio || !turnoFim) {
            toast.error('Não há turnos abertos neste intervalo');
            selectInfo.view.calendar.unselect();
            return;
        }

        setTurnoSelecionado(turnoInicio);
        setDataSelecionada(start);
        setModalAgendamento(true);
    };

    // Handler para clique em evento
    const handleEventClick = (clickInfo: EventClickArg) => {
        const { type, agendamento } = clickInfo.event.extendedProps;

        if (type === 'agendamento') {
            setAgendamentoSelecionado(agendamento);
            setModalDetalhes(true);
        }
    };

    // Handler para clique em data/horário
    const handleDateClick = (arg: DateClickArg) => {
        const turno = encontrarTurnoNoHorario(arg.date);

        if (!turno) {
            toast.error('Não há turnos abertos neste horário');
            return;
        }

        setTurnoSelecionado(turno);
        setDataSelecionada(arg.date);
        setModalAgendamento(true);
    };

    // Handler para drag de evento
    const handleEventDrop = async (info: EventDropArg) => {
        const { event } = info;
        const { agendamento } = event.extendedProps;

        if (!agendamento) {
            info.revert();
            return;
        }

        // Validar se novo horário tem turno ativo
        const turno = encontrarTurnoNoHorario(event.start!);
        if (!turno) {
            toast.error('Não há turno disponível neste horário');
            info.revert();
            return;
        }

        try {
            // Atualizar agendamento no backend
            const { error } = await supabase
                .from('agendamentos')
                .update({
                    data: event.start!.toISOString().split('T')[0],
                    horarioInicio: event.start!.toTimeString().slice(0, 5),
                    horarioFim: event.end!.toTimeString().slice(0, 5)
                })
                .eq('id', agendamento.id);

            if (error) throw error;
            toast.success('Agendamento atualizado');
            onRefresh();
        } catch (error) {
            toast.error('Erro ao atualizar agendamento');
            info.revert();
        }
    };

    // Handler para resize de evento
    const handleEventResize = async (info: EventResizeDoneArg) => {
        const { event } = info;
        const { agendamento } = event.extendedProps;

        if (!agendamento) {
            info.revert();
            return;
        }

        // Validar turnos
        const turnoInicio = encontrarTurnoNoHorario(event.start!);
        const turnoFim = encontrarTurnoNoHorario(new Date(event.end!.getTime() - 1));

        if (!turnoInicio || !turnoFim) {
            toast.error('Não há turnos disponíveis neste intervalo');
            info.revert();
            return;
        }

        try {
            const { error } = await supabase
                .from('agendamentos')
                .update({
                    horarioInicio: event.start!.toTimeString().slice(0, 5),
                    horarioFim: event.end!.toTimeString().slice(0, 5)
                })
                .eq('id', agendamento.id);

            if (error) throw error;
            toast.success('Agendamento redimensionado');
            onRefresh();
        } catch (error) {
            toast.error('Erro ao redimensionar agendamento');
            info.revert();
        }
    };

    // Handler para montar evento com tooltip
    const handleEventDidMount = (info: EventMountArg) => {
        if (info.event.extendedProps.type === 'agendamento') {
            const { agendamento } = info.event.extendedProps;

            tippy(info.el, {
                content: `
                    <div style="
                        background: hsl(var(--popover));
                        padding: 0.75rem;
                        border-radius: 0.5rem;
                        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                        min-width: 200px;
                        border: 1px solid hsl(var(--border));
                    ">
                        <div style="
                            font-weight: 600;
                            color: hsl(var(--popover-foreground));
                            margin-bottom: 0.5rem;
                            font-size: 0.875rem;
                        ">${agendamento.categoria}</div>
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                            color: hsl(var(--muted-foreground));
                            font-size: 0.75rem;
                            margin-bottom: 0.25rem;
                        ">
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                            </svg>
                            <span>${agendamento.horarioInicio} - ${agendamento.horarioFim}</span>
                        </div>
                        ${agendamento.usuarioNome ? `
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 0.5rem;
                                color: hsl(var(--muted-foreground));
                                font-size: 0.75rem;
                            ">
                                <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                                </svg>
                                <span>${agendamento.usuarioNome}</span>
                            </div>
                        ` : ''}
                    </div>
                `,
                allowHTML: true,
                placement: 'top',
                arrow: true,
                theme: 'light',
                animation: 'scale',
                duration: [200, 150]
            });
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="p-6">
                <div className="border border-border rounded-lg overflow-hidden p-6 animate-pulse">
                    <div className="h-8 bg-muted rounded mb-4"></div>
                    <div className="grid grid-cols-7 gap-4">
                        {Array.from({ length: 35 }).map((_, i) => (
                            <div key={i} className="h-20 bg-muted/50 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-6">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                    <p className="font-medium">Erro ao carregar turnos</p>
                    <p className="text-sm mt-1">{error.message}</p>
                    <button
                        onClick={onRefresh}
                        className="mt-2 px-3 py-1 bg-destructive/20 hover:bg-destructive/30 rounded text-sm transition-colors"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="border border-border rounded-lg overflow-hidden bg-card">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    initialDate={dataAtual}
                    timeZone="America/Sao_Paulo"
                    locale="pt-br"
                    firstDay={1}
                    slotMinTime="08:00:00"
                    slotMaxTime="20:00:00"
                    slotDuration="01:00:00"
                    allDaySlot={false}
                    nowIndicator={true}
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    selectOverlap={false}
                    dayMaxEvents={true}
                    weekends={true}
                    events={calendarEvents}
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
                    select={handleSelect}
                    eventDrop={handleEventDrop}
                    eventResize={handleEventResize}
                    eventResizableFromStart={true}
                    eventDidMount={handleEventDidMount}
                    height="auto"
                    buttonText={{
                        today: 'Hoje',
                        month: 'Mês',
                        week: 'Semana',
                        day: 'Dia'
                    }}
                />
            </div>

            {/* Modal de Agendamento com Turno Restrito */}
            <Suspense fallback={null}>
                <ModalNovoAgendamento
                    open={modalAgendamento}
                    onClose={() => setModalAgendamento(false)}
                    turno={turnoSelecionado}
                    dia={dataSelecionada || new Date()}
                    onSuccess={onRefresh}
                />
            </Suspense>

            {/* Modal de Detalhes do Agendamento */}
            <Suspense fallback={null}>
                <ModalDetalhesAgendamento
                    open={modalDetalhes}
                    onClose={() => {
                        setModalDetalhes(false);
                        setAgendamentoSelecionado(null);
                    }}
                    agendamento={agendamentoSelecionado}
                />
            </Suspense>
        </div>
    );
}

// Memoize component para evitar re-renders desnecessários
export const CalendarioSemana = memo(CalendarioSemanaComponent);
