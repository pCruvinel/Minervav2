/**
 * CalendarioGridV2 - Grid semanal com blocos de turno
 * 
 * v2.0: Renderiza turnos como blocos contínuos ao invés de células de 1h.
 * Cada turno é um único elemento visual ocupando seu período completo.
 */

import { memo, useMemo } from 'react';
import { SemanaData, TurnoProcessado, AgendamentoProcessado } from '@/lib/hooks/use-semana-calendario';
import { TurnoBlock } from './turno-block';
import { cn } from '@/lib/utils';
import { nowInSaoPaulo, dateStringToSaoPaulo } from '@/lib/utils/timezone';
import type { CalendarioBloqueio } from '@/lib/types';
import { Lock } from 'lucide-react';

interface CalendarioGridV2Props {
  semanaData: SemanaData;
  bloqueios?: CalendarioBloqueio[];
  onClickTurno?: (turno: TurnoProcessado, data: string, agendamentos: AgendamentoProcessado[]) => void;
  ehAdmin: boolean;
}

/**
 * CalendarioGridV2 - Grid semanal com blocos de turno
 */
function CalendarioGridV2Component({ 
  semanaData, 
  bloqueios = [],
  onClickTurno,
  ehAdmin 
}: CalendarioGridV2Props) {
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

  // Verificar se um turno está bloqueado
  const verificarBloqueioPorTurno = useMemo(() => {
    return (data: string, turno: TurnoProcessado): boolean => {
      return bloqueios.some(bloqueio => {
        if (data < bloqueio.dataInicio || data > bloqueio.dataFim) {
          return false;
        }
        if (bloqueio.diaInteiro) {
          return true;
        }
        if (bloqueio.horaInicio && bloqueio.horaFim) {
          // Verificar sobreposição de horários
          return turno.horaInicio < bloqueio.horaFim && turno.horaFim > bloqueio.horaInicio;
        }
        return false;
      });
    };
  }, [bloqueios]);

  return (
    <div className="overflow-auto">
      <div className="inline-block min-w-full">
        {/* Container com estrutura de tabela para layout correto */}
        <div className="bg-[hsl(40,25%,95%)] rounded-lg overflow-hidden">
          {/* HEADER ROW */}
          <div 
            className="grid"
            style={{
              gridTemplateColumns: '70px repeat(7, minmax(140px, 1fr))',
              gap: '1px',
            }}
          >
            {/* Header: Horário */}
            <div className="bg-card p-2 font-semibold text-sm text-muted-foreground text-center sticky left-0 z-20">
              Horário
            </div>

            {/* Header: Dias da semana */}
            {semanaData.dias.map((dataStr) => {
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
          </div>

          {/* BODY: Horários + Colunas dos dias */}
          <div 
            className="grid"
            style={{
              gridTemplateColumns: '70px repeat(7, minmax(140px, 1fr))',
              gap: '1px',
            }}
          >
            {/* Coluna de horários (à esquerda) */}
            <div className="bg-[hsl(30,20%,98%)] sticky left-0 z-10">
              {horas.map((hora) => (
                <div
                  key={`hora-${hora}`}
                  className="p-2 flex items-start justify-center font-medium text-xs text-muted-foreground border-b border-[hsl(40,20%,85%)]"
                  style={{ height: '60px' }}
                >
                  {String(hora).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Colunas dos dias com blocos de turno */}
            {semanaData.dias.map((dataStr) => {
              const turnosDoDia = semanaData.turnos.get(dataStr) || [];
              const agendamentosDoDia = semanaData.agendamentos.get(dataStr) || [];
              const { nome } = formatarDia(dataStr);
              const ehFimDeSemana = nome === 'Sáb' || nome === 'Dom';

              return (
                <div
                  key={`col-${dataStr}`}
                  className={cn(
                    "relative",
                    ehFimDeSemana ? "bg-gray-100/50" : "bg-white"
                  )}
                  style={{ 
                    height: `${horas.length * 60}px`
                  }}
                >
                  {/* Linhas de hora (guias visuais) */}
                  {horas.map((hora, index) => (
                    <div
                      key={`line-${hora}`}
                      className="absolute left-0 right-0 border-b border-border/30"
                      style={{ top: `${index * 60}px`, height: '60px' }}
                    />
                  ))}

                  {/* Background apagado para horas sem turno */}
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundColor: turnosDoDia.length === 0 
                        ? 'rgba(148, 163, 184, 0.15)' 
                        : 'transparent'
                    }}
                  />

                  {/* Indicador de "sem turno" se não há turnos */}
                  {turnosDoDia.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-xs text-gray-400">Sem turnos</span>
                    </div>
                  )}

                  {/* Blocos de Turno */}
                  {turnosDoDia.map((turno) => {
                    const agendamentosDoTurno = agendamentosDoDia.filter(
                      a => a.turnoId === turno.id
                    );
                    const estaBloqueado = verificarBloqueioPorTurno(dataStr, turno);

                    return (
                      <TurnoBlock
                        key={turno.id}
                        turno={turno}
                        agendamentos={agendamentosDoTurno}
                        data={dataStr}
                        onClick={!estaBloqueado ? () => onClickTurno?.(turno, dataStr, agendamentosDoTurno) : undefined}
                        ehAdmin={ehAdmin}
                        bloqueado={estaBloqueado}
                        vagasPorSetor={turno.vagasPorSetor}
                      />
                    );
                  })}

                  {/* Overlay de bloqueio do dia inteiro */}
                  {bloqueios.some(b => 
                    dataStr >= b.dataInicio && 
                    dataStr <= b.dataFim && 
                    b.diaInteiro
                  ) && turnosDoDia.length === 0 && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        backgroundColor: 'rgba(156, 163, 175, 0.4)',
                        backgroundImage: `repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 8px,
                          rgba(156, 163, 175, 0.3) 8px,
                          rgba(156, 163, 175, 0.3) 16px
                        )`,
                      }}
                    >
                      <div className="flex items-center gap-1.5 bg-white/90 px-3 py-2 rounded shadow-sm text-gray-600 text-sm font-medium">
                        <Lock className="h-4 w-4" />
                        <span>Dia Bloqueado</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export const CalendarioGridV2 = memo(CalendarioGridV2Component);
