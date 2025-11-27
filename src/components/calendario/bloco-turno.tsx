import { memo } from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';

interface AgendamentoRealizado {
  id: string;
  categoria: string;
  setor: string;
  usuarioNome?: string;
  osCodigo?: string;
  clienteNome?: string;
  statusGeralOS?: string;
  etapasAtivas?: number;
}

interface Turno {
  id: string;
  vagasOcupadas: number;
  vagasTotal: number;
  setores: string[];
  cor: string;
  agendamentosRealizados?: AgendamentoRealizado[];
  etapasAtivas?: number;
}

interface BlocoTurnoProps {
  turno: Turno;
  onClick: () => void;
}

function BlocoTurnoComponent({ turno, onClick }: BlocoTurnoProps) {
  // Calcular disponibilidade baseada em etapas ativas
  const etapasAtivas = turno.etapasAtivas || 0;
  const ocupado = etapasAtivas > 0;
  const vagasDisponiveis = ocupado ? 0 : 1;
  const textoVagas = `${vagasDisponiveis}/${turno.vagasTotal}`;

  // Filtrar apenas agendamentos realizados (OS não cancelada)
  const agendamentosRealizados = turno.agendamentosRealizados || [];

  return (
    <div
      onClick={!ocupado ? onClick : undefined}
      className={`
        w-full h-full rounded-lg shadow-sm border-2 flex flex-col
        ${!ocupado ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200' : 'cursor-default opacity-75'}
      `}
      style={{
        backgroundColor: `${turno.cor}CC`,
        borderColor: ocupado ? `${turno.cor}88` : `${turno.cor}DD`
      }}
    >
      {/* Badge de agendamento realizado */}
      <div className="flex-1 p-3 flex items-center justify-center">
        {agendamentosRealizados.length > 0 ? (
          <Badge
            variant="secondary"
            className="bg-white/90 text-gray-800 border-white/50 flex items-center gap-2 px-3 py-2 shadow-sm"
          >
            <Avatar className="w-5 h-5 flex-shrink-0">
              <AvatarFallback className="bg-gray-200 text-xs font-medium text-gray-700">
                {agendamentosRealizados[0].usuarioNome?.substring(0, 2).toUpperCase() || '??'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium truncate">
              {agendamentosRealizados[0].categoria}
            </span>
          </Badge>
        ) : (
          <span className="text-white/60 text-xs">Disponível</span>
        )}
      </div>

      {/* Indicador de vagas */}
      <div className="px-3 pb-2">
        <div className="text-right">
          <span className="text-xs font-medium text-white bg-black/20 px-2 py-1 rounded">
            {textoVagas}
          </span>
        </div>
      </div>
    </div>
  );
}

// Memoize component para evitar re-renders desnecessários
export const BlocoTurno = memo(BlocoTurnoComponent, (prevProps, nextProps) => {
  // Custom comparison: apenas re-render se turno.id ou etapas ativas mudarem
  return (
    prevProps.turno.id === nextProps.turno.id &&
    prevProps.turno.etapasAtivas === nextProps.turno.etapasAtivas
  );
});