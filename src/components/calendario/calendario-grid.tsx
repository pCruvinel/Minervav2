import { memo } from 'react';
import { CelulaData } from '@/lib/hooks/use-semana-calendario';
import { CelulaCalendario } from './celula-calendario';
import { cn } from '@/lib/utils';
import { nowInSaoPaulo, dateStringToSaoPaulo } from '@/lib/utils/timezone';

interface CalendarioGridProps {
    dias: string[];          // 7 datas ["2025-12-01", ...]
    celulas: Map<string, CelulaData>;
    onClickCelula: (celula: CelulaData) => void;
    ehAdmin: boolean;
}

/**
 * CalendarioGrid - Grid semanal do calendário
 * 
 * Layout: 8 colunas (horários + 7 dias) x 16 linhas (header + 15 horas)
 */
function CalendarioGridComponent({ dias, celulas, onClickCelula, ehAdmin }: CalendarioGridProps) {
    const horas = Array.from({ length: 15 }, (_, i) => i + 6); // 6-20

    // Verificar se uma data é hoje
    const ehHoje = (data: string): boolean => {
        const hoje = nowInSaoPaulo();
        const dataComparar = dateStringToSaoPaulo(data);
        return (
            hoje.getDate() === dataComparar.getDate() &&
            hoje.getMonth() === dataComparar.getMonth() &&
            hoje.getFullYear() === dataComparar.getFullYear()
        );
    };

    // Formatar nome do dia
    const formatarDia = (dataStr: string) => {
        const data = new Date(dataStr + 'T00:00:00');
        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const dia = data.getDate();
        const mes = data.getMonth() + 1;
        return {
            nome: diasSemana[data.getDay()],
            data: `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`
        };
    };

    return (
        <div className="overflow-auto">
            <div className="inline-block min-w-full">
                {/* Grid: 8 colunas x 11 linhas */}
                <div
                    className="grid bg-[hsl(40,25%,95%)] rounded-lg overflow-hidden"
                    style={{
                        gridTemplateColumns: '80px repeat(7, minmax(140px, 1fr))',
                        gridTemplateRows: 'auto repeat(15, 60px)',
                        gap: '1px',  // Aumentado de 0.5px para 1px
                    }}
                >
                    {/* Header: Horários (vazio) */}
                    <div className="bg-card p-2 font-semibold text-sm text-muted-foreground">
                        Horário
                    </div>

                    {/* Header: Dias da semana */}
                    {dias.map((dataStr) => {
                        const { nome, data } = formatarDia(dataStr);
                        const isToday = ehHoje(dataStr);

                        return (
                            <div
                                key={dataStr}
                                className={cn(
                                    'bg-card p-2 text-center',
                                    isToday && 'bg-primary/5 ring-2 ring-primary ring-inset'
                                )}
                            >
                                <div className={cn(
                                    'font-semibold text-sm',
                                    isToday ? 'text-primary' : 'text-foreground'
                                )}>
                                    {nome}
                                </div>
                                <div className={cn(
                                    'text-xs',
                                    isToday ? 'text-primary' : 'text-muted-foreground'
                                )}>
                                    {data}
                                </div>
                            </div>
                        );
                    })}

                    {/* Grid: Horários × Dias */}
                    {horas.map((hora) => (
                        <div key={`grid-hora-${hora}`} className="contents">
                            {/* Coluna de horários */}
                            <div className="bg-[hsl(30,20%,98%)] p-2 flex items-center justify-center font-medium text-sm text-muted-foreground border-r border-[hsl(40,20%,85%)]">
                                {String(hora).padStart(2, '0')}:00
                            </div>

                            {/* Células de cada dia */}
                            {dias.map((dataStr) => {
                                const chaveCelula = `${dataStr}-${hora}`;
                                const celula = celulas.get(chaveCelula);
                                const { nome } = formatarDia(dataStr);

                                if (!celula) {
                                    return (
                                        <div
                                            key={chaveCelula}
                                            className="bg-card"
                                            title="Dados não disponíveis"
                                        />
                                    );
                                }

                                return (
                                    <CelulaCalendario
                                        key={chaveCelula}
                                        celula={celula}
                                        onClick={onClickCelula}
                                        ehAdmin={ehAdmin}
                                        ehFimDeSemana={nome === 'Sáb' || nome === 'Dom'}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export const CalendarioGrid = memo(CalendarioGridComponent);