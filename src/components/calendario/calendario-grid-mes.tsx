import { CelulaDia } from '@/lib/hooks/use-mes-calendario';
import { CelulaMes } from './celula-mes';

interface CalendarioGridMesProps {
  celulas: CelulaDia[];
  onCelulaClick: (data: string) => void;
}

/**
 * CalendarioGridMes - Grid mensal 7×6
 *
 * v5.0: Viewport-fit with auto-fill rows + sticky weekday header
 */
export function CalendarioGridMes({ celulas, onCelulaClick }: CalendarioGridMesProps) {
  const diasSemanaShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const diasSemanaFull = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <div className="w-full h-full flex flex-col px-2 lg:px-4 pb-2">
      {/* Header com dias da semana */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-1 sticky top-0 z-10 bg-card pt-1 flex-shrink-0">
        {diasSemanaShort.map((dia, i) => (
          <div
            key={dia}
            className={`text-center font-semibold text-[11px] lg:text-xs py-1.5 rounded-md ${
              i === 0 || i === 6
                ? 'text-muted-foreground/60'
                : 'text-muted-foreground'
            }`}
          >
            <span className="lg:hidden">{dia}</span>
            <span className="hidden lg:inline">{diasSemanaFull[i]}</span>
          </div>
        ))}
      </div>

      {/* Grid de células — rows preenchem espaço disponível */}
      <div
        className="grid grid-cols-7 gap-1 md:gap-1.5 flex-1 min-h-0"
        style={{ gridTemplateRows: 'repeat(6, 1fr)' }}
      >
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
