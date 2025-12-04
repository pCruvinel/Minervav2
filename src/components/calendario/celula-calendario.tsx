import { memo } from 'react';
import { CelulaData } from '@/lib/hooks/use-semana-calendario';
import { turnoColors, badgeColors } from '@/lib/design-tokens';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CelulaCalendarioProps {
    celula: CelulaData;
    onClick: (celula: CelulaData) => void;
    ehAdmin: boolean;
    ehFimDeSemana?: boolean;
}

/**
 * CelulaCalendario - Célula individual do grid
 * 
 * Renderiza uma célula de 1 hora com:
 * - Cor de fundo se houver turno (75% opacidade)
 * - Badges de agendamentos (Cores tríades, full size)
 */
function CelulaCalendarioComponent({ celula, onClick, ehAdmin, ehFimDeSemana }: CelulaCalendarioProps) {
    const { turno, agendamentos, podeAgendar } = celula;

    // Determinar se a célula é clicável
    const ehClicavel = ehAdmin || podeAgendar;

    // Obter cor do turno
    const corTurno = turno ? turnoColors[turno.cor as keyof typeof turnoColors] : null;

    // Obter cor do badge (tríade)
    const corBadge = turno ? badgeColors[turno.cor as keyof typeof badgeColors] : null;

    // Determinar classes CSS
    const celulaClasses = cn(
        'relative min-h-[60px] p-1 transition-all flex flex-col', // p-1 para dar um respiro
        'border border-[hsl(40,20%,85%)] rounded-md',
        {
            'cursor-pointer hover:ring-2 hover:ring-primary hover:z-10': ehClicavel,
            'cursor-not-allowed opacity-50': turno && !podeAgendar && !ehAdmin,
            // Sem turno: Branco dias úteis, Pérola fds
            'bg-white': !turno && !ehFimDeSemana,
            'bg-[hsl(30,20%,98%)]': !turno && ehFimDeSemana,
        }
    );

    // Aplicar cor de fundo do turno
    const celulaStyle = turno && corTurno ? {
        backgroundColor: corTurno.bg,
    } : undefined;

    return (
        <div
            className={celulaClasses}
            style={celulaStyle}
            onClick={() => ehClicavel && onClick(celula)}
            title={turno ? `${turno.horaInicio}-${turno.horaFim}` : 'Sem turno'}
        >
            {/* Indicador de cor do turno (dot colorido) - Mantido para referência visual rápida */}
            {turno && corTurno && (
                <div
                    className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full opacity-50"
                    style={{ backgroundColor: corTurno.solid }}
                />
            )}

            {/* Badges de agendamentos - Full Size */}
            {agendamentos.length > 0 && (
                <div className="flex-1 flex flex-col gap-1 mt-1">
                    {agendamentos.map((agend) => (
                        <div
                            key={agend.id}
                            className="flex-1 p-1 rounded text-xs font-medium truncate flex items-center gap-1 shadow-sm"
                            style={corBadge ? {
                                backgroundColor: corBadge.bg,
                                color: corBadge.text,
                                border: `1px solid ${corBadge.border}`
                            } : undefined}
                            title={`${agend.categoria} - ${agend.usuarioNome || 'Sem usuário'}`}
                        >
                            <Clock className="h-3 w-3 shrink-0" />
                            <span className="truncate">{agend.categoria}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export const CelulaCalendario = memo(CelulaCalendarioComponent);