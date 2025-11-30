/**
 * AgendamentoOS - Componente para gerenciar agendamentos em etapas de OS
 *
 * Componente wrapper que integra o sistema de calendário centralizado
 * nas etapas de Ordem de Serviço que requerem agendamento.
 *
 * @example
 * ```tsx
 * <AgendamentoOS
 *   osId={osId}
 *   categoria="Vistoria Técnica"
 *   setorSlug="comercial"
 *   agendamentoId={data.agendamentoId}
 *   onAgendamentoChange={(id) => onDataChange({ agendamentoId: id })}
 *   readOnly={false}
 * />
 * ```
 */

import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarioSemana } from '@/components/calendario/calendario-semana';
import { ModalNovoAgendamento } from '@/components/calendario/modal-novo-agendamento';
import {
  Calendar,
  CalendarCheck,
  CalendarX,
  Clock,
  MapPin,
  AlertCircle,
  Loader2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useAgendamento, useCancelarAgendamento, useAgendamentos } from '@/lib/hooks/use-agendamentos';
import { useTurnosPorSemana } from '@/lib/hooks/use-turnos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

// =====================================================
// TYPES
// =====================================================

interface AgendamentoOSProps {
  osId: string;
  categoria: 'Apresentação de Proposta' | 'Vistoria Técnica' | 'Vistoria Inicial' | 'Vistoria Final';
  setorSlug: string;
  agendamentoId?: string;
  onAgendamentoChange: (agendamentoId: string | null) => void;
  readOnly?: boolean;
  dataLegacy?: string; // Campo antigo para compatibilidade
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export function AgendamentoOS({
  osId,
  categoria,
  setorSlug,
  agendamentoId,
  onAgendamentoChange,
  readOnly = false,
  dataLegacy,
}: AgendamentoOSProps) {
  // Estados
  const [modalAgendamentoAberto, setModalAgendamentoAberto] = useState(false);
  const [turnoSelecionado, setTurnoSelecionado] = useState<any>(null);
  const [diaSelecionado, setDiaSelecionado] = useState<Date>(new Date());

  // Calcular período para buscar dados do calendário (60 dias atrás até 60 dias à frente)
  const hoje = useMemo(() => new Date(), []);
  const dataInicio = useMemo(() => {
    const data = new Date(hoje);
    data.setDate(data.getDate() - 60);
    return data.toISOString().split('T')[0];
  }, [hoje]);

  const dataFim = useMemo(() => {
    const data = new Date(hoje);
    data.setDate(data.getDate() + 60);
    return data.toISOString().split('T')[0];
  }, [hoje]);

  // Hooks
  const { data: agendamento, loading: loadingAgendamento, refetch: refetchAgendamento } = useAgendamento(agendamentoId);
  const { mutate: cancelarAgendamento, loading: cancelando } = useCancelarAgendamento();

  // Hooks para dados do calendário
  const { turnosPorDia, loading: loadingTurnos, error: errorTurnos, refetch: refetchTurnos } = useTurnosPorSemana(
    dataInicio,
    dataFim
  );

  const { agendamentos, loading: loadingAgendamentos, refetch: refetchAgendamentos } = useAgendamentos({
    dataInicio,
    dataFim,
  });

  // Loading e error combinados
  const loading = loadingTurnos || loadingAgendamentos;
  const error = errorTurnos;

  // Função de refresh unificada
  const handleRefresh = useCallback(() => {
    refetchTurnos();
    refetchAgendamentos();
  }, [refetchTurnos, refetchAgendamentos]);

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleTurnoClick = (turno: any, dia: Date) => {
    if (readOnly) return;
    setTurnoSelecionado(turno);
    setDiaSelecionado(dia);
    setModalAgendamentoAberto(true);
  };

  const handleAgendamentoSuccess = () => {
    setModalAgendamentoAberto(false);
    toast.success('Agendamento criado com sucesso!');
    refetchAgendamento();
    handleRefresh();
    // O callback onAgendamentoChange será chamado pelo ModalNovoAgendamento
  };

  const handleCancelarAgendamento = () => {
    if (!agendamentoId) return;

    const motivo = prompt('Digite o motivo do cancelamento:');
    if (!motivo) return;

    cancelarAgendamento(
      { id: agendamentoId, motivo },
      {
        onSuccess: () => {
          onAgendamentoChange(null);
          toast.success('Agendamento cancelado com sucesso!');
        },
      }
    );
  };

  // =====================================================
  // RENDER: MODO LEGACY
  // =====================================================

  if (!agendamentoId && dataLegacy) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-amber-800 mb-1">
                Agendamento em Modo Legado
              </h4>
              <p className="text-sm text-amber-700 mb-2">
                Este agendamento foi criado no sistema antigo.
              </p>
              <div className="flex items-center gap-2 text-sm text-amber-800">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">
                  {new Date(dataLegacy).toLocaleString('pt-BR')}
                </span>
              </div>
              {!readOnly && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAbrirCalendario}
                  className="mt-4 border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Agendamento no Sistema Novo
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // =====================================================
  // RENDER: CARREGANDO
  // =====================================================

  if (loadingAgendamento) {
    return (
      <Card className="border-neutral-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // =====================================================
  // RENDER: AGENDAMENTO EXISTENTE
  // =====================================================

  if (agendamento) {
    const dataAgendamento = new Date(agendamento.data);
    const isCancelado = agendamento.status === 'cancelado';

    return (
      <div className="space-y-6">
        {/* Card de Status do Agendamento */}
        <Card className={isCancelado ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: isCancelado ? '#ef4444' : '#10b981' }}
              >
                {isCancelado ? (
                  <CalendarX className="w-6 h-6 text-white" />
                ) : (
                  <CalendarCheck className="w-6 h-6 text-white" />
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-base font-medium mb-3">
                  {isCancelado ? 'Agendamento Cancelado' : 'Agendamento Confirmado'}
                </h3>

                <div className="space-y-2">
                  {/* Data e Horário */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-neutral-600" />
                    <span className="font-medium">
                      {format(dataAgendamento, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-neutral-600" />
                    <span>
                      {agendamento.horarioInicio} - {agendamento.horarioFim} ({agendamento.duracaoHoras}h)
                    </span>
                  </div>

                  {/* Categoria e Setor */}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-neutral-600" />
                    <span>{agendamento.categoria} - {agendamento.setor}</span>
                  </div>

                  {/* Motivo de Cancelamento */}
                  {isCancelado && agendamento.canceladoMotivo && (
                    <Alert className="mt-3 bg-red-100 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-sm text-red-800">
                        <strong>Motivo:</strong> {agendamento.canceladoMotivo}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Ações */}
                  {!readOnly && !isCancelado && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelarAgendamento}
                        disabled={cancelando}
                        className="border-red-300 text-red-700 hover:bg-red-100"
                      >
                        {cancelando ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Cancelando...
                          </>
                        ) : (
                          <>
                            <CalendarX className="h-4 w-4 mr-2" />
                            Cancelar Agendamento
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendário para Visualização e Novos Agendamentos */}
        {!isCancelado && (
          <Card className="border-neutral-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium">Calendário de Agendamentos</h4>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  className="border-neutral-300"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <CalendarioSemana
                dataAtual={hoje}
                turnosPorDia={turnosPorDia}
                agendamentos={agendamentos}
                loading={loading}
                error={error}
                onRefresh={handleRefresh}
                onTurnoClick={handleTurnoClick}
              />
            </CardContent>
          </Card>
        )}

        {/* Modal de Criação de Agendamento */}
        {turnoSelecionado && (
          <ModalNovoAgendamento
            open={modalAgendamentoAberto}
            onClose={() => setModalAgendamentoAberto(false)}
            turno={turnoSelecionado}
            dia={diaSelecionado}
            onSuccess={handleAgendamentoSuccess}
          />
        )}
      </div>
    );
  }

  // =====================================================
  // RENDER: SEM AGENDAMENTO (CALENDÁRIO INTEGRADO)
  // =====================================================

  return (
    <div className="space-y-6">
      {/* Card de Status */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#3b82f6' }}
              >
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Agendamento Pendente</h3>
                <p className="text-sm text-neutral-600">
                  Selecione um turno disponível no calendário abaixo para criar o agendamento.
                </p>
              </div>
            </div>

            {!readOnly && (
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={loading}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calendário Integrado */}
      <Card className="border-neutral-200">
        <CardContent className="p-6">
          <CalendarioSemana
            dataAtual={hoje}
            turnosPorDia={turnosPorDia}
            agendamentos={agendamentos}
            loading={loading}
            error={error}
            onRefresh={handleRefresh}
            onTurnoClick={handleTurnoClick}
          />
        </CardContent>
      </Card>

      {/* Modal de Criação de Agendamento */}
      {turnoSelecionado && (
        <ModalNovoAgendamento
          open={modalAgendamentoAberto}
          onClose={() => setModalAgendamentoAberto(false)}
          turno={turnoSelecionado}
          dia={diaSelecionado}
          onSuccess={handleAgendamentoSuccess}
        />
      )}
    </div>
  );
}
