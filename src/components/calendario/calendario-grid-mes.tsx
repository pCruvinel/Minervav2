import { CelulaDia } from '@/lib/hooks/use-mes-calendario';
import { CelulaMes } from './celula-mes';

interface CalendarioGridMesProps {
  celulas: CelulaDia[];
  onCelulaClick: (data: string) => void;
}

/**
 * CalendarioGridMes - Grid mensal 7×6
 *
 * Renderiza 42 células (6 semanas) para cobrir qualquer mês.
 * Grid responsivo com header de dias da semana.
 */
export function CalendarioGridMes({ celulas, onCelulaClick }: CalendarioGridMesProps) {
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="w-full">
      {/* Header com dias da semana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {diasSemana.map(dia => (
          <div
            key={dia}
            className="text-center font-semibold text-sm text-muted-foreground py-2"
          >
            {dia}
          </div>
        ))}
      </div>

      {/* Grid de células (42 dias = 6 semanas) */}
      <div className="grid grid-cols-7 gap-2">
        {celulas.map(celula => (
          <CelulaMes
            key={celula.data}
            celula={celula}
            onClick={onCelulaClick}
          />
        ))}
      </div>
    </div>
  );
}
