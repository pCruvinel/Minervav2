import { memo, useMemo } from 'react';
import { CelulaData } from '@/lib/hooks/use-semana-calendario';
import { getSetorColor } from '@/lib/design-tokens';
import { Clock, User, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CelulaCalendarioProps {
    celula: CelulaData;
    onClick: (celula: CelulaData) => void;
    ehAdmin: boolean;
    ehFimDeSemana?: boolean;
    bloqueado?: boolean;  // v2.0: Indica se a célula está bloqueada
}

/**
 * CelulaCalendario - Célula individual do grid
 * 
 * v2.0: Agora usa cores por setor para os agendamentos
 * v2.1: Suporte a bloqueios com cinza apagado
 * v2.2: Células sem turno = apagadas | Com turno = claras com cores dos setores
 * 
 * Renderiza uma célula de 1 hora com:
 * - Célula apagada (cinza escuro) se NÃO houver turno
 * - Célula clara com indicador de cores dos setores se houver turno
 * - Badges de agendamentos com cores por setor
 * - Overlay cinza se estiver bloqueado
 */
function CelulaCalendarioComponent({ celula, onClick, ehAdmin, ehFimDeSemana, bloqueado = false }: CelulaCalendarioProps) {
    const { turno, agendamentos, podeAgendar } = celula;

    // Determinar se a célula é clicável (não se estiver bloqueada e não sem turno)
    const ehClicavel = !bloqueado && turno && (ehAdmin || podeAgendar);

    // v2.2: Gerar fundo gradiente com cores dos setores do turno
    const fundoSetores = useMemo(() => {
        if (!turno || !turno.setores || turno.setores.length === 0) return null;
        
        // Criar gradiente com as cores dos setores
        const cores = turno.setores.map(setor => {
            const cor = getSetorColor(setor);
            return cor.bg;
        });
        
        if (cores.length === 1) {
            return cores[0];
        }
        
        // Gradiente horizontal com as cores dos setores
        const porcentagemPorCor = 100 / cores.length;
        const gradientStops = cores.map((cor, index) => {
            const inicio = index * porcentagemPorCor;
            const fim = (index + 1) * porcentagemPorCor;
            return `${cor} ${inicio}%, ${cor} ${fim}%`;
        }).join(', ');
        
        return `linear-gradient(to right, ${gradientStops})`;
    }, [turno]);

    // Determinar classes CSS
    const celulaClasses = cn(
        'relative min-h-[60px] p-1 transition-all flex flex-col',
        'border rounded-md',
        {
            // Com turno: clicável e borda mais visível
            'cursor-pointer hover:ring-2 hover:ring-primary hover:z-10': ehClicavel,
            'border-[hsl(40,20%,80%)]': turno && !bloqueado,
            
            // Sem turno: apagado e não clicável
            'cursor-not-allowed': !turno || bloqueado,
            'border-[hsl(220,10%,75%)]': !turno && !bloqueado,
            
            // Bloqueado
            'cursor-not-allowed': bloqueado,
        }
    );

    // v2.2: Aplicar cor de fundo baseado no estado
    const celulaStyle = useMemo(() => {
        // Bloqueado: cinza com listras
        if (bloqueado) {
            return {
                backgroundColor: 'rgba(156, 163, 175, 0.4)',
                backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 6px,
                    rgba(156, 163, 175, 0.25) 6px,
                    rgba(156, 163, 175, 0.25) 12px
                )`,
            };
        }
        
        // Sem turno: apagado (cinza escuro)
        if (!turno) {
            return {
                backgroundColor: ehFimDeSemana 
                    ? 'rgba(148, 163, 184, 0.35)'  // Cinza mais escuro fim de semana
                    : 'rgba(148, 163, 184, 0.25)', // Cinza apagado
            };
        }
        
        // Com turno: fundo claro com cores dos setores
        if (fundoSetores) {
            // Se for gradiente, usar background-image
            if (fundoSetores.startsWith('linear-gradient')) {
                return {
                    backgroundImage: fundoSetores,
                    backgroundColor: 'white',
                };
            }
            // Se for cor única
            return {
                backgroundColor: fundoSetores,
            };
        }
        
        // Fallback: branco
        return {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
        };
    }, [bloqueado, turno, fundoSetores, ehFimDeSemana]);

    return (
        <div
            className={celulaClasses}
            style={celulaStyle}
            onClick={() => ehClicavel && onClick(celula)}
            title={bloqueado ? 'Horário bloqueado' : turno ? `${turno.horaInicio}-${turno.horaFim} (${turno.setores.join(', ')})` : 'Sem turno disponível'}
        >
            {/* v2.1: Overlay de bloqueio */}
            {bloqueado && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="flex items-center gap-1 bg-white/90 px-2 py-1 rounded shadow-sm text-gray-500 text-xs font-medium">
                        <Lock className="h-3 w-3" />
                        <span>Bloqueado</span>
                    </div>
                </div>
            )}

            {/* v2.2: Indicador de "Sem turno" para células apagadas */}
            {!turno && !bloqueado && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] text-gray-400 font-medium">
                        —
                    </span>
                </div>
            )}

            {/* v2.2: Indicadores de setores no topo (mini badges) - ocultos se bloqueado */}
            {turno && !bloqueado && turno.setores && turno.setores.length > 0 && agendamentos.length === 0 && (
                <div className="flex gap-0.5 flex-wrap">
                    {turno.setores.slice(0, 3).map((setor) => {
                        const corSetor = getSetorColor(setor);
                        return (
                            <div
                                key={setor}
                                className="w-2 h-2 rounded-sm"
                                style={{ backgroundColor: corSetor.bgSolid }}
                                title={setor}
                            />
                        );
                    })}
                    {turno.setores.length > 3 && (
                        <span className="text-[8px] text-muted-foreground">+{turno.setores.length - 3}</span>
                    )}
                </div>
            )}

            {/* Badges de agendamentos - v2.0: Cores por Setor (ocultos se bloqueado) */}
            {!bloqueado && turno && agendamentos.length > 0 && (
                <div className="flex-1 flex flex-col gap-1 mt-1">
                    {agendamentos.map((agend) => {
                        // v2.0: Obter cor baseada no setor do agendamento
                        const corSetor = getSetorColor(agend.setor);
                        
                        return (
                            <div
                                key={agend.id}
                                className="flex-1 p-1.5 rounded text-xs font-medium truncate flex flex-col gap-0.5 shadow-sm"
                                style={{
                                    backgroundColor: corSetor.badge.bg,
                                    color: corSetor.badge.text,
                                    border: `1px solid ${corSetor.badge.border}`,
                                    borderLeft: `3px solid ${corSetor.bgSolid}`
                                }}
                                title={`${agend.categoria} - ${agend.setor} - ${agend.usuarioNome || 'Sem responsável'}`}
                            >
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{agend.categoria}</span>
                                </div>
                                {agend.usuarioNome && (
                                    <div className="flex items-center gap-1 opacity-80 text-[10px]">
                                        <User className="h-2.5 w-2.5 shrink-0" />
                                        <span className="truncate">{agend.usuarioNome}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Indicador de vagas (se admin e tem turno, oculto se bloqueado) */}
            {!bloqueado && turno && ehAdmin && agendamentos.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-[10px] text-muted-foreground">
                    {turno.vagasTotal - turno.vagasOcupadas} vaga{turno.vagasTotal - turno.vagasOcupadas !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
}

export const CelulaCalendario = memo(CelulaCalendarioComponent);