import { memo, useMemo } from 'react';
import { CelulaDia } from '@/lib/hooks/use-mes-calendario';
import { turnoColors, getSetorColor } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

interface CelulaMesProps {
  celula: CelulaDia;
  onClick: (data: string) => void;
}

/**
 * CelulaMes - Célula individual da view mensal
 *
 * v4.0: Redesign visual com melhor legibilidade
 *
 * Renderiza um dia do mês com:
 * - Número do dia (pill para hoje)
 * - Feriados nacionais (badge vermelho com 🏛️)
 * - Pontos facultativos (badge âmbar com ⚡)
 * - Aniversários (nome + 🎂)
 * - Turnos (dots coloridos)
 * - Agendamentos por setor (mini bar)
 */
function CelulaMesComponent({ celula, onClick }: CelulaMesProps) {
  const { data, turnos, agendamentos, aniversarios = [], bloqueios = [], isOutsideMonth, isToday, isBloqueado } = celula;

  const dia = parseInt(data.split('-')[2]);
  const diaSemana = new Date(data + 'T12:00:00').getDay(); // 0=Sun, 6=Sat
  const isWeekend = diaSemana === 0 || diaSemana === 6;

  // Separate feriados from ponto_facultativo from other bloqueios
  const feriados = useMemo(() => bloqueios.filter(b => b.motivo === 'feriado'), [bloqueios]);
  const pontosFacultativos = useMemo(() => bloqueios.filter(b => b.motivo === 'ponto_facultativo'), [bloqueios]);
  const outrosBloqueios = useMemo(() => bloqueios.filter(b => b.motivo !== 'feriado' && b.motivo !== 'ponto_facultativo'), [bloqueios]);

  // Group confirmed appointments by setor
  const agendamentosPorSetor = useMemo(() => {
    const confirmados = agendamentos.filter(a => a.status === 'confirmado');
    const porSetor = new Map<string, number>();
    confirmados.forEach(a => {
      porSetor.set(a.setor, (porSetor.get(a.setor) || 0) + 1);
    });
    return porSetor;
  }, [agendamentos]);

  const totalAgendamentos = agendamentos.filter(a => a.status === 'confirmado').length;

  // Unique shifts by color
  const turnosUnicos = turnos.reduce((acc, turno) => {
    if (!acc.some(t => t.cor === turno.cor)) {
      acc.push(turno);
    }
    return acc;
  }, [] as typeof turnos);

  // First name helper
  const primeiroNome = (nome: string) => nome.split(' ')[0];

  return (
    <button
      onClick={() => onClick(data)}
      className={cn(
        'p-1.5 lg:p-2 rounded-lg border cursor-pointer',
        'transition-all duration-200 ease-out',
        'hover:ring-2 hover:ring-primary/60 hover:shadow-md hover:scale-[1.02]',
        'active:scale-[0.98]',
        'flex flex-col items-start justify-start',
        'h-full min-h-0',
        'relative overflow-hidden',
        // Outside month
        isOutsideMonth && 'opacity-25 pointer-events-none',
        // Today
        isToday && 'ring-2 ring-primary bg-primary/5 border-primary/30 shadow-sm',
        // Feriado nacional
        !isToday && feriados.length > 0 && 'bg-red-50/80 border-red-200/60 dark:bg-red-950/20 dark:border-red-800/40',
        // Ponto facultativo
        !isToday && feriados.length === 0 && pontosFacultativos.length > 0 && 'bg-amber-50/60 border-amber-200/50 dark:bg-amber-950/15 dark:border-amber-800/30',
        // Blocked (other)
        !isToday && isBloqueado && feriados.length === 0 && pontosFacultativos.length === 0 && 'bg-destructive/5 border-destructive/20',
        // Weekend
        !isToday && !isBloqueado && feriados.length === 0 && pontosFacultativos.length === 0 && isWeekend && 'bg-muted/30 border-border/30',
        // Normal
        !isToday && !isBloqueado && feriados.length === 0 && pontosFacultativos.length === 0 && !isWeekend && 'bg-card border-border/40 hover:bg-accent/30'
      )}
    >
      {/* Row 1: Day number + birthday indicator */}
      <div className="flex items-center justify-between w-full mb-0.5">
        <span
          className={cn(
            'text-xs lg:text-sm font-bold leading-none',
            isToday && 'bg-primary text-primary-foreground rounded-full w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center',
            !isToday && feriados.length > 0 && 'text-red-700 dark:text-red-400',
            !isToday && feriados.length === 0 && pontosFacultativos.length > 0 && 'text-amber-700 dark:text-amber-400',
            !isToday && feriados.length === 0 && pontosFacultativos.length === 0 && 'text-foreground'
          )}
        >
          {dia}
        </span>

        {/* Birthday badge */}
        {aniversarios.length > 0 && (
          <span
            className="text-[10px] lg:text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-1 py-0.5 rounded-full leading-none flex items-center gap-0.5 max-w-[65%] truncate"
            title={aniversarios.map(a => a.nome).join(', ')}
          >
            🎂
            <span className="truncate hidden sm:inline">
              {aniversarios.length === 1
                ? primeiroNome(aniversarios[0].nome)
                : `${aniversarios.length}`}
            </span>
          </span>
        )}
      </div>

      {/* Row 2: Feriado badge */}
      {feriados.length > 0 && (
        <div className="w-full mt-0.5">
          {feriados.slice(0, 1).map(f => (
            <div
              key={f.id}
              className="text-[9px] lg:text-[10px] leading-tight px-1.5 py-0.5 rounded-md font-semibold truncate w-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
              title={f.descricao || 'Feriado Nacional'}
            >
              🏛️ {f.descricao || 'Feriado'}
            </div>
          ))}
        </div>
      )}

      {/* Row 2b: Ponto Facultativo badge */}
      {pontosFacultativos.length > 0 && feriados.length === 0 && (
        <div className="w-full mt-0.5">
          {pontosFacultativos.slice(0, 1).map(pf => (
            <div
              key={pf.id}
              className="text-[9px] lg:text-[10px] leading-tight px-1.5 py-0.5 rounded-md font-semibold truncate w-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200/50 border-dashed dark:border-amber-700/40"
              title={`${pf.descricao || 'Ponto Facultativo'} (não reduz dias úteis)`}
            >
              ⚡ {pf.descricao || 'Facultativo'}
            </div>
          ))}
        </div>
      )}

      {/* Row 2c: Other bloqueios */}
      {outrosBloqueios.length > 0 && feriados.length === 0 && pontosFacultativos.length === 0 && (
        <div
          className="text-[9px] lg:text-[10px] mt-0.5 px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 truncate w-full font-medium"
          title={outrosBloqueios.map(b => b.descricao || b.motivo).join(', ')}
        >
          🚫 {outrosBloqueios[0].descricao || outrosBloqueios[0].motivo}
        </div>
      )}

      {/* Row 3: Shift dots */}
      {turnos.length > 0 && (
        <div className="flex gap-1 mt-1 flex-wrap items-center">
          {turnosUnicos.slice(0, 4).map((turno, i) => {
            const cor = turnoColors[turno.cor as keyof typeof turnoColors] || turnoColors.verde;
            return (
              <div
                key={`${turno.id}-${i}`}
                className="w-2 h-2 rounded-full ring-1 ring-white/50"
                style={{ backgroundColor: cor.solid }}
                title={`Turno ${turno.cor}: ${turno.horaInicio}-${turno.horaFim}`}
              />
            );
          })}
          {turnosUnicos.length > 4 && (
            <span className="text-[9px] text-muted-foreground font-medium">
              +{turnosUnicos.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Row 4: Appointments by setor */}
      {agendamentosPorSetor.size > 0 && (
        <div className="flex gap-0.5 mt-1 flex-wrap items-center">
          {Array.from(agendamentosPorSetor.entries()).slice(0, 3).map(([setor, count]) => {
            const corSetor = getSetorColor(setor);
            return (
              <div
                key={setor}
                className="text-[8px] lg:text-[9px] px-1 py-0.5 rounded font-bold leading-none"
                style={{
                  backgroundColor: corSetor.badge.bg,
                  color: corSetor.badge.text
                }}
                title={`${count} agendamento(s) - ${setor}`}
              >
                {count}
              </div>
            );
          })}
          {agendamentosPorSetor.size > 3 && (
            <span className="text-[8px] text-muted-foreground font-medium">
              +{agendamentosPorSetor.size - 3}
            </span>
          )}
        </div>
      )}

      {/* Row 5: Footer - slots available */}
      <div className="mt-auto w-full pt-0.5">
        {totalAgendamentos > 0 && (
          <span className="text-[9px] lg:text-[10px] text-muted-foreground font-medium">
            {totalAgendamentos} agend.
          </span>
        )}

        {turnos.length > 0 && !isOutsideMonth && (
          <div className="text-[8px] lg:text-[9px] text-muted-foreground/60">
            {turnos.reduce((acc, t) => acc + (t.vagasTotal - t.vagasOcupadas), 0)} vagas
          </div>
        )}
      </div>
    </button>
  );
}

export const CelulaMes = memo(CelulaMesComponent);
