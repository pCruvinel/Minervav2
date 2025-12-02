import { memo } from 'react';
import { CelulaData } from '@/lib/hooks/use-semana-calendario';
import { turnoColors } from '@/lib/design-tokens';
import { Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CelulaCalendarioProps {
    celula: CelulaData;
    onClick: (celula: CelulaData) => void;
    ehAdmin: boolean;
}

/**
 * CelulaCalendario - Célula individual do grid
 * 
 * Renderiza uma célula de 1 hora com:
 * - Cor de fundo se houver turno
 * - Indicador de vagas
 * - Badges de agendamentos
 */
function CelulaCalendarioComponent({ celula, onClick, ehAdmin }: CelulaCalendarioProps) {
    const { turno, agendamentos, podeAgendar } = celula;

    // Determinar se a célula é clicável
    const ehClicavel = ehAdmin || podeAgendar;

    // Obter cor do turno
    const corTurno = turno ? turnoColors[turno.cor as keyof typeof turnoColors] : null;

    // Determinar classes CSS
    const celulaClasses = cn(
        'relative border border-border min-h-[60px] p-1 transition-all',
        {
            // Com turno
            'bg-opacity-20': !!turno,
            'cursor-pointer hover:ring-2 hover:ring-primary hover:z-10': ehClicavel,
            'cursor-not-allowed opacity-50': turno && !podeAgendar && !ehAdmin,
            // Sem turno - branco pérola
            'bg-[hsl(30,20%,98%)]': !turno,
        }
    );

    // Estilo inline para cor do turno
    const celulaStyle = turno && corTurno ? {
        backgroundColor: corTurno.bg,
    } : undefined;

    return (
        <div
            className={celulaClasses}
            style={celulaStyle}
            onClick={() => ehClicavel && onClick(celula)}
            title={turno ? `${turno.horaInicio}-${turno.horaFim} - ${turno.vagasTotal - turno.vagasOcupadas}/${turno.vagasTotal} vagas` : 'Sem turno'}
        >
            {/* Indicador de vagas (se houver turno) */}
            {turno && (
                <div className="absolute top-1 right-1 flex items-center gap-1 text-xs">
                    <Users className="h-3 w-3" style={{ color: corTurno?.solid }} />
                    <span
                        className="font-semibold"
                        style={{ color: corTurno?.solid }}
                    >
                        {turno.vagasTotal - turno.vagasOcupadas}/{turno.vagasTotal}
                    </span>
                </div>
            )}

            {/* Badges de agendamentos */}
            {agendamentos.length > 0 && (
                <div className="mt-5 space-y-1">
                    {agendamentos.slice(0, 2).map((agend) => (
                        <div
                            key={agend.id}
                            className="text-xs p-1 rounded bg-primary/10 border border-primary/20 truncate"
                            title={`${agend.categoria} - ${agend.usuarioNome || 'Sem usuário'}`}
                        >
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 shrink-0" />
                                <span className="truncate">{agend.categoria}</span>
                            </div>
                        </div>
                    ))}
                    {agendamentos.length > 2 && (
                        <div className="text-xs text-center text-muted-foreground">
                            +{agendamentos.length - 2} mais
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export const CelulaCalendario = memo(CelulaCalendarioComponent);