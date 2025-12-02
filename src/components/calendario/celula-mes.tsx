import { memo } from 'react';
import { CelulaDia } from '@/lib/hooks/use-mes-calendario';
import { turnoColors } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

interface CelulaMesProps {
  celula: CelulaDia;
  onClick: (data: string) => void;
}

/**
 * CelulaMes - Célula individual da view mensal
 *
 * Renderiza um dia do mês com:
 * - Número do dia
 * - Indicadores de turnos (dots coloridos)
 * - Contador de agendamentos confirmados
 */
function CelulaMesComponent({ celula, onClick }: CelulaMesProps) {
  const { data, turnos, agendamentos, isOutsideMonth, isToday } = celula;

  const dia = parseInt(data.split('-')[2]);
  const agendamentosConfirmados = agendamentos.filter(
    a => a.status === 'confirmado'
  ).length;

  // Turnos únicos por cor (evitar dots duplicados)
  const turnosUnicos = turnos.reduce((acc, turno) => {
    if (!acc.some(t => t.cor === turno.cor)) {
      acc.push(turno);
    }
    return acc;
  }, [] as typeof turnos);

  return (
    <button
      onClick={() => onClick(data)}
      className={cn(
        'aspect-square p-2 rounded-lg border border-border/40',
        'hover:ring-2 hover:ring-primary transition-all',
        'flex flex-col items-start justify-start',
        'min-h-[80px]',
        isOutsideMonth && 'opacity-30',
        isToday && 'ring-2 ring-primary bg-primary/5',
        !turnos.length && 'bg-[hsl(30,20%,98%)]'  // Branco pérola
      )}
    >
      {/* Número do dia */}
      <span
        className={cn(
          'text-sm font-semibold',
          isToday && 'text-primary',
          !isToday && 'text-foreground'
        )}
      >
        {dia}
      </span>

      {/* Indicadores de turnos (dots coloridos) */}
      {turnos.length > 0 && (
        <div className="flex gap-1 mt-1 flex-wrap">
          {turnosUnicos.slice(0, 3).map((turno, i) => {
            const cor = turnoColors[turno.cor as keyof typeof turnoColors] || turnoColors.verde;
            return (
              <div
                key={`${turno.id}-${i}`}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cor.solid }}
                title={`Turno ${turno.cor}: ${turno.horaInicio}-${turno.horaFim}`}
              />
            );
          })}
          {turnosUnicos.length > 3 && (
            <span className="text-[10px] text-muted-foreground">
              +{turnosUnicos.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Contador de agendamentos */}
      {agendamentosConfirmados > 0 && (
        <span className="text-[10px] text-muted-foreground mt-auto">
          {agendamentosConfirmados} agend.
        </span>
      )}

      {/* Indicador de vagas disponíveis */}
      {turnos.length > 0 && !isOutsideMonth && (
        <div className="text-[9px] text-muted-foreground/70 mt-0.5">
          {turnos.reduce((acc, t) => acc + (t.vagasTotal - t.vagasOcupadas), 0)} vagas
        </div>
      )}
    </button>
  );
}

export const CelulaMes = memo(CelulaMesComponent);
