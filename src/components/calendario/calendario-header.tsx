import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { dateStringToSaoPaulo, TIMEZONE_SP } from '@/lib/utils/timezone';

interface CalendarioHeaderProps {
    dataInicio: string;
    dataFim: string;
    onSemanaAnterior: () => void;
    onProximaSemana: () => void;
    onHoje: () => void;
}

/**
 * CalendarioHeader - Navegação de semana
 */
export function CalendarioHeader({
    dataInicio,
    dataFim,
    onSemanaAnterior,
    onProximaSemana,
    onHoje
}: CalendarioHeaderProps) {
    // Formatar período da semana no timezone de São Paulo
    const formatarPeriodo = () => {
        const inicio = dateStringToSaoPaulo(dataInicio);
        const fim = dateStringToSaoPaulo(dataFim);

        const mesInicio = inicio.toLocaleDateString('pt-BR', {
            month: 'long',
            timeZone: TIMEZONE_SP
        });
        const mesFim = fim.toLocaleDateString('pt-BR', {
            month: 'long',
            timeZone: TIMEZONE_SP
        });
        const ano = inicio.getFullYear();

        if (mesInicio === mesFim) {
            return `${mesInicio.charAt(0).toUpperCase() + mesInicio.slice(1)} ${ano}`;
        }

        return `${mesInicio.charAt(0).toUpperCase() + mesInicio.slice(1)} - ${mesFim.charAt(0).toUpperCase() + mesFim.slice(1)} ${ano}`;
    };

    return (
        <div className="flex items-center justify-between p-4 border-b bg-card">
            <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                    {formatarPeriodo()}
                </h2>
                <span className="text-sm text-muted-foreground">
                    {dataInicio.split('-').reverse().join('/')} - {dataFim.split('-').reverse().join('/')}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onSemanaAnterior}
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
                    onClick={onProximaSemana}
                    className="h-9"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}