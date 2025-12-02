import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { CalendarioSemana } from './calendario-semana';
import { useTurnosPorSemana } from '../../lib/hooks/use-turnos';
import { useAgendamentos } from '../../lib/hooks/use-agendamentos';
import { useAuth } from '../../lib/contexts/auth-context';
import { PermissaoUtil } from '../../lib/auth-utils';

// Importar CSS customizado
import './calendario-custom.css';

// Lazy load modal
const ModalCriarTurno = lazy(() => import('./modal-criar-turno').then(m => ({ default: m.ModalCriarTurno })));

export function CalendarioPage() {
  const { currentUser } = useAuth();
  const [modalCriarTurno, setModalCriarTurno] = useState(false);

  // Verificar se usuário pode gerenciar turnos (admin/diretoria)
  const podeGerenciarTurnos = currentUser && PermissaoUtil.ehDiretoria(currentUser);

  // Buscar dados para um período amplo (FullCalendar gerencia a navegação)
  const [hoje] = useState(() => new Date());
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Botão Adicionar Turno - Apenas para admin/diretoria */}
        {podeGerenciarTurnos && (
          <div className="flex justify-end mb-6">
            <Button
              onClick={() => setModalCriarTurno(true)}
              className="
                bg-primary hover:bg-primary/90
                text-primary-foreground px-6 py-3
                shadow-lg hover:shadow-xl
                rounded-lg
                font-medium
                transition-all duration-200
                transform hover:scale-105
              "
            >
              <Plus className="h-5 w-5 mr-2" />
              Adicionar Turno
            </Button>
          </div>
        )}

        {/* Calendário FullCalendar */}
        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
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
