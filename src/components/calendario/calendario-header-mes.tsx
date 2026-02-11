import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { dateStringToSaoPaulo, TIMEZONE_SP } from '@/lib/utils/timezone';

interface CalendarioHeaderMesProps {
  mesInicio: string;       // "2025-12-01"
  onMesAnterior: () => void;
  onProximoMes: () => void;
  onHoje: () => void;
}

/**
 * CalendarioHeaderMes - Navegação mensal com legenda
 *
 * v5.0: Gradient accent bar + refined spacing to match weekly header
 */
export function CalendarioHeaderMes({
  mesInicio,
  onMesAnterior,
  onProximoMes,
  onHoje
}: CalendarioHeaderMesProps) {
  const formatarMes = () => {
    const data = dateStringToSaoPaulo(mesInicio);
    const mes = data.toLocaleDateString('pt-BR', {
      month: 'long',
      timeZone: TIMEZONE_SP
    });
    const ano = data.getFullYear();
    return `${mes.charAt(0).toUpperCase() + mes.slice(1)} ${ano}`;
  };

  return (
    <div className="relative flex-shrink-0 border-b bg-card">
      {/* Gradient accent bar — matches weekly header */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/80 via-primary to-primary/60 rounded-b-full" />

      <div className="flex flex-col gap-2 p-3 lg:p-4 pt-4">
        {/* Top row: title + navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-base lg:text-lg font-semibold text-foreground tracking-tight">
              {formatarMes()}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onMesAnterior}
              className="h-8 w-8 p-0 hover:bg-primary/10 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onHoje}
              className="h-8 px-3 text-xs hover:bg-primary/10 transition-colors"
            >
              Hoje
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onProximoMes}
              className="h-8 w-8 p-0 hover:bg-primary/10 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bottom row: legend */}
        <div className="flex items-center gap-4 flex-wrap text-[10px] lg:text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-red-500/80" />
            <span>Feriado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-amber-500/80 border border-dashed border-amber-600/50" />
            <span>Ponto Facultativo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm leading-none">🎂</span>
            <span>Aniversário</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            <span>Turno</span>
          </div>
        </div>
      </div>
    </div>
  );
}
