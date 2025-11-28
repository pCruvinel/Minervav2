import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { CalendarioSemana } from './calendario-semana';
import { useTurnosPorSemana } from '../../lib/hooks/use-turnos';
import { useAgendamentos } from '../../lib/hooks/use-agendamentos';

// Lazy load modal
const ModalCriarTurno = lazy(() => import('./modal-criar-turno').then(m => ({ default: m.ModalCriarTurno })));

export function CalendarioPage() {
  const [modalCriarTurno, setModalCriarTurno] = useState(false);

  // Buscar dados para um período amplo (FullCalendar gerencia a navegação)
  const hoje = new Date();
  const dataInicio = useMemo(() => {
    const data = new Date(hoje);
    data.setDate(data.getDate() - 60); // 60 dias atrás
    return data.toISOString().split('T')[0];
  }, []);

  const dataFim = useMemo(() => {
    const data = new Date(hoje);
    data.setDate(data.getDate() + 60); // 60 dias à frente
    return data.toISOString().split('T')[0];
  }, []);

  // Buscar turnos e agendamentos para período amplo
  const { turnosPorDia, loading, error, refetch } = useTurnosPorSemana(
    dataInicio,
    dataFim
  );

  const { agendamentos, refetch: refetchAgendamentos } = useAgendamentos({
    dataInicio,
    dataFim,
  });

  // Criar refetch unificado para ambos hooks
  const handleRefetch = useCallback(() => {
    refetch();
    refetchAgendamentos();
  }, [refetch, refetchAgendamentos]);

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Botão Adicionar Turno */}
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => setModalCriarTurno(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Turno
          </Button>
        </div>

        {/* Calendário Schedule-X */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          <CalendarioSemana
            dataAtual={hoje}
            turnosPorDia={turnosPorDia}
            agendamentos={agendamentos}
            loading={loading}
            error={error}
            onRefresh={handleRefetch}
          />
        </div>

        {/* Modais */}
        <Suspense fallback={null}>
          <ModalCriarTurno
            open={modalCriarTurno}
            onClose={() => setModalCriarTurno(false)}
            onSuccess={handleRefetch}
          />
        </Suspense>
      </div>
    </div>
  );
}
