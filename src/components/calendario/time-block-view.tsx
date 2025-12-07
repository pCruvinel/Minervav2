/**
 * TimeBlockView - Visualização de Time Blocks Contínuos
 * 
 * Renderiza turnos e agendamentos como blocos de tempo contínuos
 * estilo Google Calendar, com cores por setor e visualização
 * de capacidade.
 */

import { memo, useMemo } from 'react';
import { TurnoProcessado, AgendamentoProcessado } from '@/lib/hooks/use-semana-calendario';
import { getSetorColor, getBloqueioColor } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import { Clock, User, Building2, AlertTriangle } from 'lucide-react';
import type { CalendarioBloqueio, VagasPorSetor } from '@/lib/types';

// =====================================================
// TYPES
// =====================================================

export interface TimeBlockData {
  turno: TurnoProcessado & { vagasPorSetor?: VagasPorSetor };
  agendamentos: AgendamentoProcessado[];
  bloqueios?: CalendarioBloqueio[];
}

interface TimeBlockViewProps {
  data: string;              // "2025-12-02"
  timeBlocks: TimeBlockData[];
  bloqueios?: CalendarioBloqueio[];
  horaInicio?: number;       // Default: 6
  horaFim?: number;          // Default: 20
  onClickTurno?: (turno: TurnoProcessado, data: string) => void;
  onClickAgendamento?: (agendamento: AgendamentoProcessado) => void;
  ehAdmin?: boolean;
}

// =====================================================
// HELPERS
// =====================================================

/**
 * Converte horário HH:MM para posição percentual no grid
 */
function horaParaPercent(hora: string, horaInicioGrid: number, horaFimGrid: number): number {
  const [h, m] = hora.split(':').map(Number);
  const horasTotal = horaFimGrid - horaInicioGrid;
  const horaDecimal = h + m / 60;
  return ((horaDecimal - horaInicioGrid) / horasTotal) * 100;
}

/**
 * Calcula altura percentual baseada em duração
 */
function duracaoParaPercent(horaInicio: string, horaFim: string, horaInicioGrid: number, horaFimGrid: number): number {
  const [hInicio, mInicio] = horaInicio.split(':').map(Number);
  const [hFim, mFim] = horaFim.split(':').map(Number);
  const horasTotal = horaFimGrid - horaInicioGrid;
  const duracaoHoras = (hFim + mFim / 60) - (hInicio + mInicio / 60);
  return (duracaoHoras / horasTotal) * 100;
}

/**
 * Agrupa agendamentos por slot (para agendamentos simultâneos)
 */
function agruparAgendamentosPorSlot(agendamentos: AgendamentoProcessado[]): Map<string, AgendamentoProcessado[]> {
  const porSetor = new Map<string, AgendamentoProcessado[]>();
  
  agendamentos.forEach(agend => {
    const lista = porSetor.get(agend.setor) || [];
    lista.push(agend);
    porSetor.set(agend.setor, lista);
  });
  
  return porSetor;
}

// =====================================================
// SUB-COMPONENTS
// =====================================================

interface TimeBlockProps {
  turno: TurnoProcessado & { vagasPorSetor?: VagasPorSetor };
  agendamentos: AgendamentoProcessado[];
  topPercent: number;
  heightPercent: number;
  onClick?: () => void;
  ehAdmin?: boolean;
}

/**
 * Bloco de turno individual com seus agendamentos
 */
const TimeBlock = memo(function TimeBlock({
  turno,
  agendamentos,
  topPercent,
  heightPercent,
  onClick,
  ehAdmin = false,
}: TimeBlockProps) {
  // Agrupar agendamentos por setor
  const agendamentosPorSetor = useMemo(() => 
    agruparAgendamentosPorSlot(agendamentos), 
    [agendamentos]
  );

  // Calcular capacidade por setor
  const capacidadePorSetor = useMemo(() => {
    const vagasPorSetor = turno.vagasPorSetor || {};
    
    return turno.setores.map(setor => {
      const vagasTotal = vagasPorSetor[setor] || Math.ceil(turno.vagasTotal / turno.setores.length);
      const agendamentosSetor = agendamentosPorSetor.get(setor) || [];
      const vagasOcupadas = agendamentosSetor.length;
      
      return {
        setor,
        vagasTotal,
        vagasOcupadas,
        vagasDisponiveis: Math.max(0, vagasTotal - vagasOcupadas),
        agendamentos: agendamentosSetor,
      };
    });
  }, [turno, agendamentosPorSetor]);

  const totalSetores = capacidadePorSetor.length;

  return (
    <div
      className={cn(
        "absolute left-0 right-0 rounded-lg overflow-hidden transition-all",
        "border-2 shadow-sm hover:shadow-md",
        onClick && "cursor-pointer hover:ring-2 hover:ring-primary/50"
      )}
      style={{
        top: `${topPercent}%`,
        height: `${heightPercent}%`,
        minHeight: '40px',
      }}
      onClick={onClick}
    >
      {/* Renderizar slots por setor lado a lado */}
      <div className="flex h-full">
        {capacidadePorSetor.map((capacidade, index) => {
          const corSetor = getSetorColor(capacidade.setor);
          const isLastSlot = index === totalSetores - 1;
          
          return (
            <div
              key={capacidade.setor}
              className={cn(
                "flex-1 flex flex-col relative overflow-hidden",
                !isLastSlot && "border-r border-white/30"
              )}
              style={{ backgroundColor: corSetor.bg }}
            >
              {/* Header do slot com nome do setor e capacidade */}
              <div 
                className="px-2 py-1 text-xs font-medium flex items-center justify-between"
                style={{ 
                  backgroundColor: corSetor.bgSolid,
                  color: 'white'
                }}
              >
                <span className="truncate">{capacidade.setor}</span>
                <span className="text-[10px] opacity-80">
                  {capacidade.vagasOcupadas}/{capacidade.vagasTotal}
                </span>
              </div>
              
              {/* Agendamentos deste setor */}
              <div className="flex-1 p-1 space-y-1 overflow-hidden">
                {capacidade.agendamentos.map(agend => (
                  <AgendamentoCard
                    key={agend.id}
                    agendamento={agend}
                    corSetor={corSetor}
                  />
                ))}
                
                {/* Indicador de vagas disponíveis */}
                {capacidade.vagasDisponiveis > 0 && ehAdmin && (
                  <div 
                    className="text-[10px] text-center py-1 opacity-60 border border-dashed rounded"
                    style={{ borderColor: corSetor.border }}
                  >
                    +{capacidade.vagasDisponiveis} vaga{capacidade.vagasDisponiveis !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Indicador de horário */}
      <div className="absolute bottom-1 right-2 text-[10px] text-muted-foreground bg-white/80 px-1 rounded">
        {turno.horaInicio} - {turno.horaFim}
      </div>
    </div>
  );
});

interface AgendamentoCardProps {
  agendamento: AgendamentoProcessado;
  corSetor: ReturnType<typeof getSetorColor>;
}

/**
 * Card de agendamento individual
 */
const AgendamentoCard = memo(function AgendamentoCard({
  agendamento,
  corSetor,
}: AgendamentoCardProps) {
  return (
    <div
      className="p-1.5 rounded text-[11px] shadow-sm"
      style={{ 
        backgroundColor: corSetor.badge.bg,
        color: corSetor.badge.text,
        borderLeft: `3px solid ${corSetor.badge.border}`
      }}
      title={`${agendamento.categoria} - ${agendamento.usuarioNome || 'Sem responsável'}`}
    >
      <div className="font-medium truncate flex items-center gap-1">
        <Clock className="h-3 w-3 shrink-0" />
        <span>{agendamento.horarioInicio}</span>
      </div>
      <div className="truncate opacity-90">{agendamento.categoria}</div>
      {agendamento.usuarioNome && (
        <div className="truncate opacity-75 flex items-center gap-1">
          <User className="h-2.5 w-2.5" />
          {agendamento.usuarioNome}
        </div>
      )}
      {agendamento.osCodigo && (
        <div className="truncate opacity-75 flex items-center gap-1">
          <Building2 className="h-2.5 w-2.5" />
          {agendamento.osCodigo}
        </div>
      )}
    </div>
  );
});

interface BloqueioOverlayProps {
  bloqueio: CalendarioBloqueio;
  topPercent: number;
  heightPercent: number;
}

/**
 * Overlay de bloqueio - Sempre cinza apagado
 */
const BloqueioOverlay = memo(function BloqueioOverlay({
  bloqueio,
  topPercent,
  heightPercent,
}: BloqueioOverlayProps) {
  const corBloqueio = getBloqueioColor(bloqueio.motivo);
  
  // Cores fixas em cinza apagado para todos os bloqueios
  const cinzaBloqueio = {
    bg: 'rgba(156, 163, 175, 0.4)',      // Cinza apagado
    border: '#9CA3AF',                    // Borda cinza
    pattern: '#D1D5DB'                    // Padrão cinza claro
  };
  
  return (
    <div
      className={cn(
        "absolute left-0 right-0 rounded-lg overflow-hidden",
        "border-2 border-dashed flex items-center justify-center",
        "cursor-not-allowed pointer-events-auto"
      )}
      style={{
        top: `${topPercent}%`,
        height: `${heightPercent}%`,
        minHeight: '30px',
        backgroundColor: cinzaBloqueio.bg,
        borderColor: cinzaBloqueio.border,
        backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 8px,
            rgba(156, 163, 175, 0.3) 8px,
            rgba(156, 163, 175, 0.3) 16px
          )`,
      }}
      title={`${bloqueio.motivo}: ${bloqueio.descricao || 'Bloqueado'}`}
    >
      <div className="text-xs font-medium flex items-center gap-1.5 bg-white/90 px-2.5 py-1.5 rounded shadow-sm text-gray-600">
        <AlertTriangle className="h-3.5 w-3.5 text-gray-500" />
        <span>{corBloqueio.icon} Bloqueado</span>
      </div>
    </div>
  );
});

// =====================================================
// MAIN COMPONENT
// =====================================================

/**
 * TimeBlockView - Visualização principal de time blocks
 */
function TimeBlockViewComponent({
  data,
  timeBlocks,
  bloqueios = [],
  horaInicio = 6,
  horaFim = 20,
  onClickTurno,
  onClickAgendamento,
  ehAdmin = false,
}: TimeBlockViewProps) {
  // Gerar linhas de horário
  const horas = useMemo(() => {
    const arr = [];
    for (let h = horaInicio; h <= horaFim; h++) {
      arr.push(h);
    }
    return arr;
  }, [horaInicio, horaFim]);

  // Filtrar bloqueios que afetam esta data
  const bloqueiosDoDia = useMemo(() => {
    return bloqueios.filter(b => {
      return data >= b.dataInicio && data <= b.dataFim;
    });
  }, [bloqueios, data]);

  return (
    <div className="relative h-full bg-card">
      {/* Linhas de horário (guias visuais) */}
      <div className="absolute inset-0 pointer-events-none">
        {horas.map((hora, index) => (
          <div
            key={hora}
            className="absolute left-0 right-0 border-t border-border/30"
            style={{
              top: `${(index / (horas.length - 1)) * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Time Blocks (Turnos com Agendamentos) */}
      <div className="absolute inset-0 px-1">
        {timeBlocks.map(({ turno, agendamentos }) => {
          const topPercent = horaParaPercent(turno.horaInicio, horaInicio, horaFim);
          const heightPercent = duracaoParaPercent(turno.horaInicio, turno.horaFim, horaInicio, horaFim);

          return (
            <TimeBlock
              key={turno.id}
              turno={turno}
              agendamentos={agendamentos}
              topPercent={topPercent}
              heightPercent={heightPercent}
              onClick={onClickTurno ? () => onClickTurno(turno, data) : undefined}
              ehAdmin={ehAdmin}
            />
          );
        })}
      </div>

      {/* Overlays de Bloqueio */}
      <div className="absolute inset-0 pointer-events-none px-1">
        {bloqueiosDoDia.map(bloqueio => {
          const topPercent = bloqueio.diaInteiro || !bloqueio.horaInicio
            ? 0
            : horaParaPercent(bloqueio.horaInicio, horaInicio, horaFim);
          
          const heightPercent = bloqueio.diaInteiro || !bloqueio.horaInicio || !bloqueio.horaFim
            ? 100
            : duracaoParaPercent(bloqueio.horaInicio, bloqueio.horaFim, horaInicio, horaFim);

          return (
            <BloqueioOverlay
              key={bloqueio.id}
              bloqueio={bloqueio}
              topPercent={topPercent}
              heightPercent={heightPercent}
            />
          );
        })}
      </div>
    </div>
  );
}

export const TimeBlockView = memo(TimeBlockViewComponent);
