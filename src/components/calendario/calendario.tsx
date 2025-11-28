import { memo } from 'react';

interface CalendarioProps {
  dataAtual: Date;
  turnosPorDia: Map<string, any[]> | null;
  agendamentos: any[];
  loading: boolean;
  error: Error | null;
  onRefresh: () => void;
  onTurnoClick?: (turno: any, dia: Date) => void;
}

function CalendarioComponent(_props: CalendarioProps) {
  // Componente removido - FullCalendar foi completamente removido do projeto
  return (
    <div className="p-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          Calendário Indisponível
        </h3>
        <p className="text-yellow-700">
          O componente FullCalendar foi removido do projeto.
          Use a visualização por semana ou dia para gerenciar turnos e agendamentos.
        </p>
      </div>
    </div>
  );
}

// Memoize component para evitar re-renders desnecessários
export const Calendario = memo(CalendarioComponent);