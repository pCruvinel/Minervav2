import { ChevronLeft, ChevronRight, Calendar, Lock, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { dateStringToSaoPaulo, TIMEZONE_SP } from '@/lib/utils/timezone';

interface CalendarioHeaderProps {
    dataInicio: string;
    dataFim: string;
    onSemanaAnterior: () => void;
    onProximaSemana: () => void;
    onHoje: () => void;
    onCriarBloqueio?: () => void;
    onCriarTurno?: () => void;
    ehAdmin?: boolean;
}

/**
 * CalendarioHeader - Navegação de semana
 * 
 * v2.0: Inclui botões para criar bloqueios e turnos (admin)
 */
export function CalendarioHeader({
    dataInicio,
    dataFim,
    onSemanaAnterior,
    onProximaSemana,
    onHoje,
    onCriarBloqueio,
    onCriarTurno,
    ehAdmin = false
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
                {/* Botões de Admin */}
                {ehAdmin && (
                    <>
                        {onCriarTurno && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onCriarTurno}
                                className="h-9 gap-1.5"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Turno</span>
                            </Button>
                        )}
                        
                        {onCriarBloqueio && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onCriarBloqueio}
                                className="h-9 gap-1.5 text-destructive hover:text-destructive"
                            >
                                <Lock className="h-4 w-4" />
                                <span className="hidden sm:inline">Bloquear</span>
                            </Button>
                        )}
                        
                        <div className="w-px h-6 bg-border mx-1" />
                    </>
                )}
                
                {/* Navegação */}
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