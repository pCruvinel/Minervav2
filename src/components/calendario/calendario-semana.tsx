import { logger } from '@/lib/utils/logger';
import { useState, useMemo, lazy, Suspense, memo } from 'react';
import { BlocoTurno } from './bloco-turno';
import { Button } from '../ui/button';
import { TurnoComVagas } from '../../lib/hooks/use-turnos';
import { SkeletonTurnoGrid } from '../ui/skeleton';

// Lazy load modais para melhor performance (carregam só quando abertos)
const ModalNovoAgendamento = lazy(() => import('./modal-novo-agendamento').then(m => ({ default: m.ModalNovoAgendamento })));

interface CalendarioSemanaProps {
  dataAtual: Date;
  turnosPorDia: Map<string, TurnoComVagas[]> | null;
  agendamentos: any[];
  loading: boolean;
  error: Error | null;
  onRefresh: () => void;
}

function CalendarioSemanaComponent({
  dataAtual,
  turnosPorDia,
  agendamentos,
  loading,
  error,
  onRefresh
}: CalendarioSemanaProps) {
  const [modalAgendamento, setModalAgendamento] = useState(false);
  const [turnoSelecionado, setTurnoSelecionado] = useState<any>(null);

  // Calcular dias da semana atual (segunda a domingo, 7 dias)
  const diasDaSemana = useMemo(() => {
    const dias: Date[] = [];
    const data = new Date(dataAtual);
    const dayOfWeek = data.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

    // Ir para segunda-feira da semana
    // Se é segunda (1): 0 dias | Se é domingo (0): -6 dias
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    data.setDate(data.getDate() + distanceToMonday);

    // Gerar 7 dias (segunda a domingo)
    for (let i = 0; i < 7; i++) {
      const dia = new Date(data);
      dia.setDate(dia.getDate() + i);
      dias.push(dia);
    }
    return dias;
  }, [dataAtual]);

  const handleRefresh = onRefresh;

  // Dias da semana (Seg - Dom, 7 dias)
  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

  // Horários (08:00 - 18:00)
  const horarios = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const ALTURA_SLOT = 80; // Altura de cada slot de horário em pixels
  const HORA_INICIO_DIA = 8; // 08:00

  // Calcular posição e altura do turno baseado em horas decimais
  const calcularEstiloTurno = (turno: TurnoComVagas) => {
    // Parse hora:minuto para decimal (ex: "08:30" => 8.5)
    const parseHora = (horaStr: string): number => {
      const [hora, minuto] = horaStr.split(':').map(Number);
      return hora + minuto / 60;
    };

    const horaInicio = parseHora(turno.horaInicio);
    const horaFim = parseHora(turno.horaFim);

    // Calcular offset do início do dia (08:00)
    const offsetInicio = horaInicio - HORA_INICIO_DIA;
    const duracao = horaFim - horaInicio;

    // Se o turno começa antes das 8h ou depois das 18h, ajustar
    if (offsetInicio < 0 || horaInicio > 18) {
      logger.warn(`Turno fora do horário do calendário: ${turno.horaInicio} - ${turno.horaFim}`);
      return { top: '0px', height: '0px', display: 'none' };
    }

    return {
      top: `${offsetInicio * ALTURA_SLOT}px`,
      height: `${duracao * ALTURA_SLOT - 8}px` // -8 para padding
    };
  };

  // Preparar dados para renderização
  const turnosPorDiaIndex = useMemo(() => {
    if (!turnosPorDia) return new Map();

    const mapPorIndex = new Map<number, (TurnoComVagas & { dia: number })[]>();

    diasDaSemana.forEach((dia, index) => {
      const dataStr = dia.toISOString().split('T')[0];
      const turnosDoDia = turnosPorDia.get(dataStr) || [];

      // Adicionar agendamentos aos turnos
      const turnosComAgendamentos = turnosDoDia.map(turno => {
        const agendamentosDoTurno = agendamentos.filter(
          a => a.turnoId === turno.id && a.data === dataStr
        );

        return {
          ...turno,
          dia: index,
          agendamentos: agendamentosDoTurno.map(a => ({
            id: a.id,
            categoria: a.categoria,
            setor: a.setor,
          })),
        };
      });

      mapPorIndex.set(index, turnosComAgendamentos);
    });

    return mapPorIndex;
  }, [turnosPorDia, agendamentos, diasDaSemana]);

  const handleClickTurno = (turno: TurnoComVagas & { dia: number }) => {
    if (turno.vagasOcupadas < turno.vagasTotal) {
      setTurnoSelecionado(turno);
      setModalAgendamento(true);
    }
  };

  return (
    <>
      <div className="p-6">


        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-medium">Erro ao carregar turnos</p>
            <p className="text-sm mt-1">{error.message}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {loading && (
          <div className="border border-neutral-200 rounded-lg overflow-hidden p-6">
            <SkeletonTurnoGrid count={5} />
          </div>
        )}

        {!loading && (
          <>
            {/* Grade do Calendário */}
            <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white overflow-x-auto">
              {/* Cabeçalho com dias da semana */}
              <div
                className="grid bg-neutral-100 border-b border-neutral-200 min-w-[800px]"
                style={{ gridTemplateColumns: '100px repeat(7, 1fr)' }}
              >
                <div className="p-3 border-r border-neutral-200 sticky left-0 bg-neutral-100 z-20"></div>
                {diasSemana.map((dia, index) => (
                  <div key={dia} className="p-3 text-center border-r last:border-r-0 border-neutral-200">
                    <div className="font-medium">{dia}</div>
                    <div className="text-sm text-neutral-600">
                      {diasDaSemana[index].getDate()}/{diasDaSemana[index].getMonth() + 1}
                    </div>
                  </div>
                ))}
              </div>

              {/* Grade de horários */}
              <div
                className="grid min-w-[800px]"
                style={{ gridTemplateColumns: '100px repeat(7, 1fr)' }}
              >
                {/* Coluna de horários */}
                <div className="sticky left-0 bg-white z-20 border-r border-neutral-200">
                  {horarios.map((horario) => (
                    <div
                      key={horario}
                      className="h-[80px] p-3 border-b last:border-b-0 border-neutral-200 bg-neutral-50 flex items-start justify-center"
                    >
                      <span className="text-sm text-neutral-600 font-medium">{horario}</span>
                    </div>
                  ))}
                </div>

                {/* Colunas para cada dia */}
                {[0, 1, 2, 3, 4, 5, 6].map((diaIndex) => (
                  <div key={diaIndex} className="border-r last:border-r-0 border-neutral-200 relative bg-white">
                    {/* Grid de fundo com horários */}
                    {horarios.map((horario) => (
                      <div
                        key={horario}
                        className="h-[80px] border-b last:border-b-0 border-neutral-100"
                      />
                    ))}

                    {/* Turnos posicionados absolutamente */}
                    <div className="absolute inset-0 p-2 pointer-events-none">
                      {(turnosPorDiaIndex.get(diaIndex) || []).map((turno: TurnoComVagas & { dia: number }) => {
                        const estilo = calcularEstiloTurno(turno);
                        // Verificar se estilo.display === 'none' (turno fora do range)
                        if (estilo.display === 'none') return null;

                        return (
                          <div
                            key={turno.id}
                            className="absolute left-2 right-2 pointer-events-auto z-10"
                            style={estilo}
                          >
                            <BlocoTurno
                              turno={turno}
                              onClick={() => handleClickTurno(turno as TurnoComVagas & { dia: number })}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modais - Lazy loaded para melhor performance */}


      <Suspense fallback={null}>
        <ModalNovoAgendamento
          open={modalAgendamento}
          onClose={() => setModalAgendamento(false)}
          turno={turnoSelecionado}
          dia={turnoSelecionado ? diasDaSemana[turnoSelecionado.dia] : new Date()}
          onSuccess={handleRefresh}
        />
      </Suspense>
    </>
  );
}

// Memoize component para evitar re-renders desnecessários
export const CalendarioSemana = memo(CalendarioSemanaComponent);