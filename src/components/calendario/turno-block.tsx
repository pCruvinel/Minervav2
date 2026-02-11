/**
 * TurnoBlock - Bloco visual simplificado de um turno no calendário
 * 
 * Mostra apenas os setores com contagem de vagas: "Setor: ocupadas/total"
 */

import { memo, useMemo } from 'react';
import { TurnoProcessado, AgendamentoProcessado } from '@/lib/hooks/use-semana-calendario';
import { getSetorColor } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

interface VagaSetor {
  setor: string;
  vagasTotal: number;
  vagasOcupadas: number;
}

interface TurnoBlockProps {
  turno: TurnoProcessado;
  agendamentos: AgendamentoProcessado[];
  data: string;
  onClick?: () => void;
  ehAdmin?: boolean;
  bloqueado?: boolean;
  vagasPorSetor?: Record<string, number>;
}

// =====================================================
// HELPERS
// =====================================================

/**
 * Calcula a altura do bloco em pixels baseado na duração
 */
function calcularAltura(horaInicio: string, horaFim: string): number {
  const [hInicio, mInicio] = horaInicio.split(':').map(Number);
  const [hFim, mFim] = horaFim.split(':').map(Number);
  const duracaoMinutos = (hFim * 60 + mFim) - (hInicio * 60 + mInicio);
  return (duracaoMinutos / 60) * 60;  // 60px por hora
}

/**
 * Calcula posição top do bloco
 */
function calcularTop(horaInicio: string, horaBase: number = 6): number {
  const [h, m] = horaInicio.split(':').map(Number);
  const horasDesdeBase = h - horaBase;
  const minutosExtra = m / 60;
  return (horasDesdeBase + minutosExtra) * 60;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

function TurnoBlockComponent({
  turno,
  agendamentos,
  onClick,
  bloqueado = false,
  vagasPorSetor = {},
}: TurnoBlockProps) {
  const altura = calcularAltura(turno.horaInicio, turno.horaFim);
  const top = calcularTop(turno.horaInicio);

  // Calcular vagas por setor
  const setoresComVagas = useMemo((): VagaSetor[] => {
    return turno.setores.map(setor => {
      const vagasDoSetor = vagasPorSetor[setor] || Math.ceil(turno.vagasTotal / turno.setores.length);
      const agendamentosDoSetor = agendamentos.filter(a => a.setor === setor);
      
      return {
        setor,
        vagasTotal: vagasDoSetor,
        vagasOcupadas: agendamentosDoSetor.length,
      };
    });
  }, [turno, agendamentos, vagasPorSetor]);

  // Bloqueado
  if (bloqueado) {
    return (
      <div
        className="absolute left-1 right-1 rounded-md border-2 border-dashed border-gray-400 cursor-not-allowed flex items-center justify-center"
        style={{
          top: `${top}px`,
          height: `${Math.max(altura, 40)}px`,
          backgroundColor: 'rgba(156, 163, 175, 0.4)',
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 6px,
            rgba(156, 163, 175, 0.25) 6px,
            rgba(156, 163, 175, 0.25) 12px
          )`,
        }}
      >
        <span className="text-gray-500 text-xs font-medium">🔒 Bloqueado</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute left-1 right-1 rounded-md overflow-hidden",
        "border border-amber-300/40 shadow-sm",
        "transition-all",
        onClick && "cursor-pointer hover:shadow-md hover:border-amber-400/60"
      )}
      style={{
        top: `${top}px`,
        height: `${Math.max(altura, 40)}px`,
        backgroundColor: 'rgba(254, 240, 138, 0.2)', // Amarelo post-it com 20% transparência
      }}
      onClick={onClick}
      title={`Turno ${turno.horaInicio} - ${turno.horaFim}`}
    >
      {/* Conteúdo: Lista de setores com vagas */}
      <div className="h-full p-2 flex flex-col justify-center gap-0.5">
        {setoresComVagas.map((item) => {
          const cor = getSetorColor(item.setor);
          const cheio = item.vagasOcupadas >= item.vagasTotal;
          
          // Agendamentos deste setor para badges OS e status
          const agendamentosSetor = agendamentos.filter(a => a.setor === item.setor);
          const osCodigos = agendamentosSetor
            .filter(a => a.osCodigo)
            .map(a => a.osCodigo!);
          const temRealizado = agendamentosSetor.some(a => a.status === 'realizado');
          
          return (
            <div 
              key={item.setor} 
              className="flex items-center gap-1.5 text-xs"
            >
              {/* Bolinha colorida do setor */}
              <div 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: cor.bgSolid }}
              />
              
              {/* Nome do setor + contagem */}
              <span 
                className={cn(
                  "font-medium truncate",
                  cheio ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {item.setor}:
              </span>
              <span 
                className={cn(
                  "font-semibold",
                  cheio ? "text-red-500" : "text-emerald-600"
                )}
              >
                {item.vagasOcupadas}/{item.vagasTotal}
              </span>

              {/* Badge OS (ex: OS1300001) */}
              {osCodigos.length > 0 && (
                <span className="text-[9px] bg-primary/10 text-primary px-1 rounded font-medium truncate max-w-[60px]" title={osCodigos.join(', ')}>
                  {osCodigos[0]}{osCodigos.length > 1 && `+${osCodigos.length - 1}`}
                </span>
              )}

              {/* Indicador de Realizado */}
              {temRealizado && (
                <span className="text-success flex-shrink-0" title="Realizado">✅</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Horário no canto */}
      <div className="absolute bottom-0.5 right-1 text-[9px] text-muted-foreground bg-white/90 px-1 rounded">
        {turno.horaInicio}-{turno.horaFim}
      </div>
    </div>
  );
}

export const TurnoBlock = memo(TurnoBlockComponent);
