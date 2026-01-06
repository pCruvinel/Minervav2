/**
 * CalendarioIntegracao - Wrapper do CalendarioSemanaCustom para OS
 *
 * Encapsula o calendário novo para uso em etapas de agendamento de Ordens de Serviço.
 * Gerencia validação e pré-seleção de agendamentos existentes.
 *
 * @example
 * ```tsx
 * const calendarioRef = useRef<CalendarioIntegracaoHandle>(null);
 *
 * <CalendarioIntegracao
 *   ref={calendarioRef}
 *   osId={osId}
 *   categoria="visita"
 *   agendamentoExistente={formData?.agendamento}
 *   onAgendamentoChange={(agendamento) => onDataChange({ agendamento })}
 *   readOnly={false}
 * />
 *
 * // Validar
 * if (!calendarioRef.current?.isAgendamentoConfirmado()) {
 *   toast.error('Selecione um agendamento')
 * }
 * ```
 */

import {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { CalendarioSemanaCustom } from '@/components/calendario/calendario-semana-custom';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  CalendarCheck,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  User,
  Bell,
} from 'lucide-react';
import { logger } from '@/lib/utils/logger';

// =====================================================
// TYPES
// =====================================================

export interface Agendamento {
  id: string;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  duracaoHoras: number;
  turnoId: string;
  categoria: string;
  setor: string;
  status: 'confirmado' | 'cancelado';
  // Novos campos para UX melhorada
  agendadoPorId?: string;
  agendadoPorNome?: string;
  agendadoEm?: string;
  responsavelId?: string;
  responsavelNome?: string;
  notificacaoEnviada?: boolean;
}

export interface CalendarioIntegracaoHandle {
  /**
   * Retorna o agendamento selecionado no calendário
   */
  getAgendamento(): Agendamento | null;

  /**
   * Valida se um agendamento foi confirmado
   */
  isAgendamentoConfirmado(): boolean;

  /**
   * Retorna dados do agendamento para salvar no formulário
   */
  getAgendamentoData(): {
    agendamentoId: string | null;
    dataAgendamento?: string;
  };
}

export interface CalendarioIntegracaoProps {
  osId: string;
  categoria: 'visita' | 'apresentacao' | string;
  setorSlug?: string;
  agendamentoExistente?: Agendamento;
  onAgendamentoChange?: (agendamento: Agendamento | null) => void;
  readOnly?: boolean;
  dataInicial?: Date;
  /** Filtro de setor para restringir vagas disponíveis (usado em OS) */
  setorFiltro?: string;
}

// =====================================================
// COMPONENTE
// =====================================================

export const CalendarioIntegracao = forwardRef<
  CalendarioIntegracaoHandle,
  CalendarioIntegracaoProps
>(
  (
    {
      agendamentoExistente,
      onAgendamentoChange,
      readOnly = false,
      dataInicial,
      setorFiltro,
    },
    ref
  ) => {
    // Estado de agendamento selecionado
    const [agendamentoSelecionado, setAgendamentoSelecionado] =
      useState<Agendamento | null>(agendamentoExistente || null);

    // Ref do calendário para triggerar refresh
    const calendarioRef = useRef<HTMLDivElement>(null);

    // =====================================================
    // EFEITOS
    // =====================================================

    // Sincronizar com agendamentoExistente quando ele mudar
    useEffect(() => {
      if (agendamentoExistente?.id) {
        logger.log('📅 CalendarioIntegracao: Carregando agendamento existente:', {
          id: agendamentoExistente.id,
          data: agendamentoExistente.data,
          horario: `${agendamentoExistente.horarioInicio} - ${agendamentoExistente.horarioFim}`,
        });
        setAgendamentoSelecionado(agendamentoExistente);
      }
    }, [agendamentoExistente?.id]);

    // =====================================================
    // HANDLERS
    // =====================================================

    const handleAgendamentoChange = useCallback(
      (agendamento: Agendamento | null) => {
        setAgendamentoSelecionado(agendamento);
        onAgendamentoChange?.(agendamento);

        if (agendamento) {
          logger.log(
            `Agendamento selecionado: ${agendamento.horarioInicio} - ${agendamento.horarioFim}`
          );
        }
      },
      [onAgendamentoChange]
    );

    // =====================================================
    // REF IMPERATIVO
    // =====================================================

    useImperativeHandle(
      ref,
      () => ({
        getAgendamento: () => agendamentoSelecionado,

        isAgendamentoConfirmado: () => {
          return agendamentoSelecionado !== null;
        },

        getAgendamentoData: () => ({
          agendamentoId: agendamentoSelecionado?.id || null,
          dataAgendamento: agendamentoSelecionado?.data,
        }),
      }),
      [agendamentoSelecionado]
    );

    // =====================================================
    // RENDER
    // =====================================================

    return (
      <div className="space-y-6" ref={calendarioRef}>
        {/* Card de Status */}
        <Card
          className={
            agendamentoSelecionado
              ? 'border-success/20 bg-success/5'
              : 'border-primary/20 bg-primary/5'
          }
        >
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: agendamentoSelecionado
                    ? 'var(--success)'
                    : 'var(--primary)',
                }}
              >
                {agendamentoSelecionado ? (
                  <CalendarCheck className="w-6 h-6 text-white" />
                ) : (
                  <Calendar className="w-6 h-6 text-white" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base font-medium">
                    {agendamentoSelecionado
                      ? 'Agendamento Confirmado'
                      : 'Agendamento Pendente'}
                  </h3>
                  {agendamentoSelecionado && (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  )}
                </div>

                {agendamentoSelecionado ? (
                  <div className="space-y-3">
                    {/* Data e Hora do agendamento */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {new Date(
                          agendamentoSelecionado.data
                        ).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {agendamentoSelecionado.horarioInicio} -{' '}
                        {agendamentoSelecionado.horarioFim} (
                        {agendamentoSelecionado.duracaoHoras}h)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{agendamentoSelecionado.setor}</span>
                    </div>

                    {/* Novas informações: Quem agendou, quando e responsável */}
                    {agendamentoSelecionado.agendadoPorNome && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Agendado por: <strong>{agendamentoSelecionado.agendadoPorNome}</strong>
                        </span>
                      </div>
                    )}

                    {agendamentoSelecionado.agendadoEm && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Em: {new Date(agendamentoSelecionado.agendadoEm).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}

                    {agendamentoSelecionado.responsavelNome && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Responsável: <strong>{agendamentoSelecionado.responsavelNome}</strong>
                        </span>
                      </div>
                    )}

                    {/* Mensagem de confirmação de calendário e notificação */}
                    <div className="mt-3 pt-3 border-t border-success/20 space-y-2">
                      <p className="text-xs text-success font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Agendamento concluído com sucesso!
                      </p>
                      {agendamentoSelecionado.notificacaoEnviada !== false && (
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Adicionado ao calendário do responsável e notificação enviada.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Selecione um turno disponível no calendário abaixo para
                    criar o agendamento.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendário Integrado - OCULTAR APÓS CONFIRMAÇÃO */}
        {!readOnly && !agendamentoSelecionado && (
          <Card className="border-border">
            <CardContent className="p-6">
              <CalendarioSemanaCustom
                dataInicial={dataInicial}
                setorFiltro={setorFiltro}
                onAgendamentoCriado={handleAgendamentoChange}
              />
            </CardContent>
          </Card>
        )}

        {/* Modo Read-Only */}
        {readOnly && agendamentoSelecionado && (
          <Card className="border-border bg-muted/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Agendamento em modo visualização</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
);

CalendarioIntegracao.displayName = 'CalendarioIntegracao';
