import { memo } from 'react';
import { CelulaData } from '@/lib/hooks/use-semana-calendario';
import { CelulaCalendario } from './celula-calendario';

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
                    className="grid gap-px bg-border rounded-lg overflow-hidden"
                    style={{
                        gridTemplateColumns: '80px repeat(7, minmax(140px, 1fr))',
                        gridTemplateRows: 'auto repeat(15, 60px)',
                    }}
                >
                    {/* Header: Horários (vazio) */}
                    <div className="bg-card p-2 font-semibold text-sm text-muted-foreground">
                        Horário
                    </div>

                    {/* Header: Dias da semana */}
                    {dias.map((dataStr) => {
                        const { nome, data } = formatarDia(dataStr);
                        const hoje = new Date().toISOString().split('T')[0];
                        const ehHoje = dataStr === hoje;

                        return (
                            <div
                                key={dataStr}
                                className={`bg-card p-2 text-center ${ehHoje ? 'bg-primary/10' : ''}`}
                            >
                                <div className={`font-semibold text-sm ${ehHoje ? 'text-primary' : 'text-foreground'}`}>
                                    {nome}
                                </div>
                                <div className={`text-xs ${ehHoje ? 'text-primary/80' : 'text-muted-foreground'}`}>
                                    {data}
                                </div>
                            </div>
                        );
                    })}

                    {/* Grid: Horários × Dias */}
                    {horas.map((hora) => (
                        <div key={`grid-hora-${hora}`} className="contents">
                            {/* Coluna de horários */}
                            <div className="bg-muted/50 p-2 flex items-center justify-center font-medium text-sm text-muted-foreground">
                                {String(hora).padStart(2, '0')}:00
                            </div>

                            {/* Células de cada dia */}
                            {dias.map((dataStr) => {
                                const chaveCelula = `${dataStr}-${hora}`;
                                const celula = celulas.get(chaveCelula);

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