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
 * v2.0: Agora mostra indicadores por setor e aniversários
 *
 * Renderiza um dia do mês com:
 * - Número do dia
 * - Indicadores de turnos (dots coloridos)
 * - Contador de agendamentos por setor
 * - Aniversários
 */
function CelulaMesComponent({ celula, onClick }: CelulaMesProps) {
  const { data, turnos, agendamentos, aniversarios = [], isOutsideMonth, isToday } = celula;

  const dia = parseInt(data.split('-')[2]);
  
  // v2.0: Agrupar agendamentos por setor
  const agendamentosPorSetor = useMemo(() => {
    const confirmados = agendamentos.filter(a => a.status === 'confirmado');
    const porSetor = new Map<string, number>();
    
    confirmados.forEach(a => {
      porSetor.set(a.setor, (porSetor.get(a.setor) || 0) + 1);
    });
    
    return porSetor;
  }, [agendamentos]);

  const totalAgendamentos = agendamentos.filter(a => a.status === 'confirmado').length;

  // Turnos únicos por cor
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
        !turnos.length && 'bg-[hsl(30,20%,98%)]'
      )}
    >
      {/* Número do dia */}
      <div className="flex items-center justify-between w-full">
        <span
          className={cn(
            'text-sm font-semibold',
            isToday && 'text-primary',
            !isToday && 'text-foreground'
          )}
        >
          {dia}
        </span>
        
        {/* Indicador de aniversários */}
        {aniversarios.length > 0 && (
          <span className="text-xs" title={aniversarios.map(a => a.nome).join(', ')}>
            🎂
          </span>
        )}
      </div>

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

      {/* v2.0: Indicadores de agendamentos por setor */}
      {agendamentosPorSetor.size > 0 && (
        <div className="flex gap-1 mt-1 flex-wrap">
          {Array.from(agendamentosPorSetor.entries()).slice(0, 3).map(([setor, count]) => {
            const corSetor = getSetorColor(setor);
            return (
              <div
                key={setor}
                className="text-[9px] px-1 rounded-full font-medium"
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
            <span className="text-[9px] text-muted-foreground">
              +{agendamentosPorSetor.size - 3}
            </span>
          )}
        </div>
      )}

      {/* Contador total e vagas */}
      <div className="mt-auto w-full">
        {totalAgendamentos > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {totalAgendamentos} agend.
          </span>
        )}
        
        {turnos.length > 0 && !isOutsideMonth && (
          <div className="text-[9px] text-muted-foreground/70">
            {turnos.reduce((acc, t) => acc + (t.vagasTotal - t.vagasOcupadas), 0)} vagas
          </div>
        )}
      </div>
    </button>
  );
}

export const CelulaMes = memo(CelulaMesComponent);
