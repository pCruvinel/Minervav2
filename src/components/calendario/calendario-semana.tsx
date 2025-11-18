import React, { useState, useMemo } from 'react';
import { BlocoTurno } from './bloco-turno';
import { ModalCriarTurno } from './modal-criar-turno';
import { ModalNovoAgendamento } from './modal-novo-agendamento';
import { Button } from '../ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useTurnosPorSemana } from '../../lib/hooks/use-turnos';
import { useAgendamentos } from '../../lib/hooks/use-agendamentos';

interface CalendarioSemanaProps {
  dataAtual: Date;
}

export function CalendarioSemana({ dataAtual }: CalendarioSemanaProps) {
  const [modalCriarTurno, setModalCriarTurno] = useState(false);
  const [modalAgendamento, setModalAgendamento] = useState(false);
  const [turnoSelecionado, setTurnoSelecionado] = useState<any>(null);

  // Calcular dias da semana atual
  const diasDaSemana = useMemo(() => {
    const dias = [];
    const primeiroDia = new Date(dataAtual);
    const diaSemana = primeiroDia.getDay();
    const diff = diaSemana === 0 ? -6 : 1 - diaSemana;
    primeiroDia.setDate(primeiroDia.getDate() + diff);

    for (let i = 0; i < 5; i++) {
      const dia = new Date(primeiroDia);
      dia.setDate(dia.getDate() + i);
      dias.push(dia);
    }
    return dias;
  }, [dataAtual]);

  const startDate = diasDaSemana[0]?.toISOString().split('T')[0] || '';
  const endDate = diasDaSemana[4]?.toISOString().split('T')[0] || '';

  // Buscar turnos da semana
  const { turnosPorDia, loading: loadingTurnos, refetch: refetchTurnos } = useTurnosPorSemana(startDate, endDate);

  // Buscar agendamentos da semana
  const { agendamentos, loading: loadingAgendamentos, refetch: refetchAgendamentos } = useAgendamentos({
    dataInicio: startDate,
    dataFim: endDate,
  });

  const loading = loadingTurnos || loadingAgendamentos;

  const handleRefresh = () => {
    refetchTurnos();
    refetchAgendamentos();
  };

  // Dias da semana (Seg - Sex)
  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
  
  // Horários (08:00 - 18:00)
  const horarios = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const ALTURA_SLOT = 80; // Altura de cada slot de horário em pixels

  // Calcular posição e altura do turno
  const calcularEstiloTurno = (turno: any) => {
    const [horaInicio] = turno.horaInicio.split(':').map(Number);
    const [horaFim] = turno.horaFim.split(':').map(Number);
    
    const indexInicio = horarios.findIndex(h => h === turno.horaInicio);
    const duracao = horaFim - horaInicio;
    
    return {
      top: `${indexInicio * ALTURA_SLOT}px`,
      height: `${duracao * ALTURA_SLOT - 8}px` // -8 para padding
    };
  };
  
  // Preparar dados para renderização
  const turnosPorDiaIndex = useMemo(() => {
    if (!turnosPorDia) return new Map();

    const mapPorIndex = new Map<number, any[]>();

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

  const handleClickTurno = (turno: any) => {
    if (turno.vagasOcupadas < turno.vagasTotal) {
      setTurnoSelecionado(turno);
      setModalAgendamento(true);
    }
  };

  return (
    <>
      <div className="p-6">
        {/* Botão Admin */}
        <div className="mb-4 flex justify-end">
          <Button
            onClick={() => setModalCriarTurno(true)}
            className="bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Configurar Novo Turno
          </Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && (
          <>
            {/* Grade do Calendário */}
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
          {/* Cabeçalho com dias da semana */}
          <div className="grid grid-cols-[100px_repeat(5,1fr)] bg-neutral-100 border-b border-neutral-200">
            <div className="p-3 border-r border-neutral-200"></div>
            {diasSemana.map((dia, index) => (
              <div key={dia} className="p-3 text-center border-r last:border-r-0 border-neutral-200">
                <div>{dia}</div>
                <div className="text-sm text-neutral-600">
                  {diasDaSemana[index].getDate()}/{diasDaSemana[index].getMonth() + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Grade de horários */}
          <div className="grid grid-cols-[100px_repeat(5,1fr)]">
            {/* Coluna de horários */}
            <div>
              {horarios.map((horario) => (
                <div
                  key={horario}
                  className="h-[80px] p-3 border-r border-b last:border-b-0 border-neutral-200 bg-neutral-50 flex items-start"
                >
                  <span className="text-sm text-neutral-600">{horario}</span>
                </div>
              ))}
            </div>

            {/* Colunas para cada dia */}
            {[0, 1, 2, 3, 4].map((diaIndex) => (
              <div key={diaIndex} className="border-r last:border-r-0 border-neutral-200 relative">
                {/* Grid de fundo com horários */}
                {horarios.map((horario) => (
                  <div
                    key={horario}
                    className="h-[80px] border-b last:border-b-0 border-neutral-200"
                  />
                ))}

                {/* Turnos posicionados absolutamente */}
                <div className="absolute inset-0 p-2 pointer-events-none">
                  {(turnosPorDiaIndex.get(diaIndex) || []).map(turno => {
                    const estilo = calcularEstiloTurno(turno);
                    return (
                      <div
                        key={turno.id}
                        className="absolute left-2 right-2 pointer-events-auto"
                        style={estilo}
                      >
                        <BlocoTurno
                          turno={turno}
                          onClick={() => handleClickTurno(turno)}
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

      {/* Modais */}
      <ModalCriarTurno
        open={modalCriarTurno}
        onClose={() => setModalCriarTurno(false)}
        onSuccess={handleRefresh}
      />

      <ModalNovoAgendamento
        open={modalAgendamento}
        onClose={() => setModalAgendamento(false)}
        turno={turnoSelecionado}
        dia={turnoSelecionado ? diasDaSemana[turnoSelecionado.dia] : new Date()}
        onSuccess={handleRefresh}
      />
    </>
  );
}