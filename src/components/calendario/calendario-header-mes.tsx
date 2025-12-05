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
 * CalendarioHeaderMes - Navegação mensal
 *
 * Header para navegação entre meses com formatação pt-BR.
 */
export function CalendarioHeaderMes({
  mesInicio,
  onMesAnterior,
  onProximoMes,
  onHoje
}: CalendarioHeaderMesProps) {
  // Formatar mês e ano
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
    <div className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">
          {formatarMes()}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onMesAnterior}
          className="h-9"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onHoje}
          className="h-9 px-4"
        >
          Hoje
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onProximoMes}
          className="h-9"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
