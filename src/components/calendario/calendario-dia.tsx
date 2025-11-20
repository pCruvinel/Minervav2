import { useState } from 'react';
import { BlocoTurno } from './bloco-turno';
import { ModalCriarTurno } from './modal-criar-turno';
import { ModalNovoAgendamento } from './modal-novo-agendamento';
import { Button } from '../ui/button';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { TurnoComVagas } from '../../lib/hooks/use-turnos';
import { Alert, AlertDescription } from '../ui/alert';

interface CalendarioDiaProps {
  dataAtual: Date;
  turnosPorDia: Map<string, TurnoComVagas[]> | null;
  agendamentos: any[];
  loading: boolean;
  error: Error | null;
  onRefresh: () => void;
}

export function CalendarioDia({
  dataAtual,
  turnosPorDia,
  agendamentos,
  loading,
  error,
  onRefresh
}: CalendarioDiaProps) {
  const [modalCriarTurno, setModalCriarTurno] = useState(false);
  const [modalAgendamento, setModalAgendamento] = useState(false);
  const [turnoSelecionado, setTurnoSelecionado] = useState<TurnoComVagas | null>(null);

  // Obter turnos do dia atual
  const dataStr = dataAtual.toISOString().split('T')[0];
  const turnosDia = turnosPorDia?.get(dataStr) || [];

  // Horários (08:00 - 18:00)
  const horarios = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const ALTURA_SLOT = 100; // Altura de cada slot de horário em pixels

  // Calcular posição e altura do turno
  const calcularEstiloTurno = (turno: TurnoComVagas) => {
    const [horaInicio] = turno.horaInicio.split(':').map(Number);
    const [horaFim] = turno.horaFim.split(':').map(Number);

    const indexInicio = horarios.findIndex(h => h === turno.horaInicio);
    const duracao = horaFim - horaInicio;

    return {
      top: `${indexInicio * ALTURA_SLOT}px`,
      height: `${duracao * ALTURA_SLOT - 8}px` // -8 para padding
    };
  };

  const handleRefresh = onRefresh;

  const formatarDia = (data: Date) => {
    return data.toLocaleDateString('pt-BR', { 
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleClickTurno = (turno: TurnoComVagas) => {
    if (turno.vagasOcupadas < turno.vagasTotal) {
      setTurnoSelecionado(turno);
      setModalAgendamento(true);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-neutral-600">Carregando turnos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar turnos: {error instanceof Error ? error.message : String(error)}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        {/* Cabeçalho do Dia */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">Visualizando</p>
            <h2 className="capitalize">{formatarDia(dataAtual)}</h2>
          </div>
          <Button
            onClick={() => setModalCriarTurno(true)}
            className="bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Configurar Novo Turno
          </Button>
        </div>

        {/* Grade de Horários */}
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-[100px_1fr]">
            {/* Coluna de horários */}
            <div>
              {horarios.map((horario) => (
                <div
                  key={horario}
                  className="h-[100px] p-3 border-r border-b last:border-b-0 border-neutral-200 bg-neutral-50 flex items-start"
                >
                  <span className="text-sm text-neutral-600">{horario}</span>
                </div>
              ))}
            </div>

            {/* Coluna de conteúdo */}
            <div className="border-neutral-200 relative">
              {/* Grid de fundo com horários */}
              {horarios.map((horario) => (
                <div
                  key={horario}
                  className="h-[100px] border-b last:border-b-0 border-neutral-200"
                />
              ))}

              {/* Turnos posicionados absolutamente */}
              <div className="absolute inset-0 p-3 pointer-events-none">
                {turnosDia.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-neutral-400">
                    <p>Sem turnos cadastrados para este dia</p>
                  </div>
                ) : (
                  turnosDia.map(turno => {
                    const estilo = calcularEstiloTurno(turno);
                    return (
                      <div
                        key={turno.id}
                        className="absolute left-3 right-3 max-w-2xl pointer-events-auto"
                        style={estilo}
                      >
                        <BlocoTurno
                          turno={turno}
                          onClick={() => handleClickTurno(turno)}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
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
        dia={dataAtual}
        onSuccess={handleRefresh}
      />
    </>
  );
}