import { useState, lazy, Suspense } from 'react';
import { BlocoTurno } from './bloco-turno';
import { Button } from '../ui/button';
import { Plus, AlertCircle } from 'lucide-react';
import { TurnoComVagas } from '../../lib/hooks/use-turnos';
import { Alert, AlertDescription } from '../ui/alert';
import { SkeletonTurnoGrid } from '../ui/skeleton';

// Lazy load modais para melhor performance (carregam só quando abertos)
const ModalCriarTurno = lazy(() => import('./modal-criar-turno').then(m => ({ default: m.ModalCriarTurno })));
const ModalNovoAgendamento = lazy(() => import('./modal-novo-agendamento').then(m => ({ default: m.ModalNovoAgendamento })));

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
      console.warn(`Turno fora do horário do calendário: ${turno.horaInicio} - ${turno.horaFim}`);
      return { top: '0px', height: '0px', display: 'none' };
    }

    return {
      top: `${offsetInicio * ALTURA_SLOT}px`,
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

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">Visualizando</p>
            <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-neutral-200 rounded animate-pulse" />
        </div>

        <div className="border border-neutral-200 rounded-lg overflow-hidden p-6">
          <SkeletonTurnoGrid count={4} />
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
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
          >
            Tentar novamente
          </Button>
        </div>
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
                  <div className="flex items-center justify-center h-full text-neutral-400 pointer-events-none">
                    <p>Sem turnos cadastrados para este dia</p>
                  </div>
                ) : (
                  turnosDia.map(turno => {
                    const estilo = calcularEstiloTurno(turno);
                    // Verificar se estilo.display === 'none' (turno fora do range)
                    if (estilo.display === 'none') return null;

                    return (
                      <div
                        key={turno.id}
                        className="absolute left-3 right-3 max-w-2xl pointer-events-auto z-10"
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

      {/* Modais - Lazy loaded para melhor performance */}
      <Suspense fallback={null}>
        <ModalCriarTurno
          open={modalCriarTurno}
          onClose={() => setModalCriarTurno(false)}
          onSuccess={handleRefresh}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ModalNovoAgendamento
          open={modalAgendamento}
          onClose={() => setModalAgendamento(false)}
          turno={turnoSelecionado}
          dia={dataAtual}
          onSuccess={handleRefresh}
        />
      </Suspense>
    </>
  );
}