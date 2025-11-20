import React from 'react';
import { Clock, Users, Building2 } from 'lucide-react';

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

export function BlocoTurno({ turno, onClick }: BlocoTurnoProps) {
  const temVagasDisponiveis = turno.vagasOcupadas < turno.vagasTotal;
  
  return (
    <div
      onClick={onClick}
      className={`
        w-full h-full rounded-lg p-3 shadow-sm border
        flex flex-col justify-between
        ${temVagasDisponiveis ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all' : 'cursor-default opacity-75'}
      `}
      style={{ 
        backgroundColor: turno.cor,
        borderColor: turno.cor
      }}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              {turno.horaInicio} - {turno.horaFim}
            </span>
          </div>
          {!temVagasDisponiveis && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
              Lotado
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />
          <span>
            {turno.vagasOcupadas}/{turno.vagasTotal} vagas ocupadas
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {turno.setores.map(setor => (
            <span key={setor} className="text-xs bg-white/50 px-2 py-1 rounded">
              {setor}
            </span>
          ))}
        </div>
      </div>

      {/* Agendamentos */}
      {turno.agendamentos && turno.agendamentos.length > 0 && (
        <div className="mt-2 pt-2 border-t border-black/10 space-y-1">
          <p className="text-xs opacity-75">Agendamentos:</p>
          {turno.agendamentos.map((agendamento: any) => (
            <div key={agendamento.id} className="text-xs bg-white/40 rounded px-2 py-1">
              • {agendamento.categoria} - {agendamento.setor}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}