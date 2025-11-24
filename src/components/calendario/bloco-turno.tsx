import { memo } from 'react';

interface Agendamento {
  id: string;
  categoria: string;
  setor: string;
}

interface Turno {
  id: string;
  horaInicio: string;
  horaFim: string;
  vagasOcupadas: number;
  vagasTotal: number;
  setores: string[];
  cor: string;
  agendamentos?: Agendamento[];
}

interface BlocoTurnoProps {
  turno: Turno;
  onClick: () => void;
}

function BlocoTurnoComponent({ turno, onClick }: BlocoTurnoProps) {
  const temVagasDisponiveis = turno.vagasOcupadas < turno.vagasTotal;

  return (
    <div
      onClick={onClick}
      className={`
        w-full h-full rounded-sm shadow-sm border flex flex-col
        ${temVagasDisponiveis ? 'cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all duration-200' : 'cursor-default opacity-75'}
      `}
      style={{
        backgroundColor: `${turno.cor}20`,
        borderColor: turno.cor
      }}
    >
      {/* Header com horário e vagas */}
      <div className="flex items-center justify-between p-2 border-b border-black/10">
        <span className="text-sm font-medium">
          {turno.horaInicio} - {turno.horaFim}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-sm">
            {turno.vagasOcupadas}/{turno.vagasTotal} vagas
          </span>
          {!temVagasDisponiveis && (
            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
              Lotado
            </span>
          )}
        </div>
      </div>

      {/* Lista de agendamentos */}
      <div className="flex-1 p-2 space-y-1">
        {turno.agendamentos && turno.agendamentos.length > 0 ? (
          turno.agendamentos.map((agendamento: any) => (
            <div
              key={agendamento.id}
              className="w-full bg-gray-100/80 rounded px-2 py-1 text-xs text-center truncate border border-gray-200/50"
              title={agendamento.categoria}
            >
              {agendamento.categoria}
            </div>
          ))
        ) : (
          // Espaçamento vazio quando não há agendamentos
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}

// Memoize component para evitar re-renders desnecessários
export const BlocoTurno = memo(BlocoTurnoComponent, (prevProps, nextProps) => {
  // Custom comparison: apenas re-render se turno.id ou vagas ocupadas mudarem
  return (
    prevProps.turno.id === nextProps.turno.id &&
    prevProps.turno.vagasOcupadas === nextProps.turno.vagasOcupadas
  );
});