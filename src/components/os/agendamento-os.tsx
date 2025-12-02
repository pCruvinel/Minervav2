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
import { CalendarioSemanaCustom } from '@/components/calendario/calendario-semana-custom';
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
import { useAgendamento, useCancelarAgendamento } from '@/lib/hooks/use-agendamentos';
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
  // Estados (simplificado - calendário custom gerencia seus próprios modais)

  // Data atual para o calendário
  const hoje = useMemo(() => new Date(), []);

  // Hooks
  const { data: agendamento, loading: loadingAgendamento, refetch: refetchAgendamento } = useAgendamento(agendamentoId);
  const { mutate: cancelarAgendamento, loading: cancelando } = useCancelarAgendamento();

  // Função de refresh (simplificada - o calendário custom gerencia seus próprios dados)
  const handleRefresh = useCallback(() => {
    // O CalendarioSemanaCustom gerencia seu próprio refresh
  }, []);

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleAbrirCalendario = () => {
    // Função para abrir calendário no modo legado
    // Por enquanto, apenas mostra um toast
    toast.info('Funcionalidade em desenvolvimento');
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
      <Card className="border-warning/20 bg-warning/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-warning mb-1">
                Agendamento em Modo Legado
              </h4>
              <p className="text-sm text-warning mb-2">
                Este agendamento foi criado no sistema antigo.
              </p>
              <div className="flex items-center gap-2 text-sm text-warning">
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
                  className="mt-4 border-warning/30 text-warning hover:bg-warning/10"
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
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
        <Card className={isCancelado ? 'border-destructive/20 bg-destructive/5' : 'border-success/20 bg-success/5'}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: isCancelado ? 'var(--destructive)' : 'var(--success)' }}
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
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(dataAgendamento, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {agendamento.horarioInicio} - {agendamento.horarioFim} ({agendamento.duracaoHoras}h)
                    </span>
                  </div>

                  {/* Categoria e Setor */}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{agendamento.categoria} - {agendamento.setor}</span>
                  </div>

                  {/* Motivo de Cancelamento */}
                  {isCancelado && agendamento.canceladoMotivo && (
                    <Alert className="mt-3 bg-destructive/10 border-destructive/20">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <AlertDescription className="text-sm text-destructive">
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
                        className="border-destructive/30 text-destructive hover:bg-destructive/10"
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
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium">Calendário de Agendamentos</h4>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={false}
                  className="border-border"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <CalendarioSemanaCustom
                dataInicial={hoje}
                onRefresh={handleRefresh}
              />
            </CardContent>
          </Card>
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
      <Card className="border-primary/20 bg-primary/5">
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
                <p className="text-sm text-muted-foreground">
                  Selecione um turno disponível no calendário abaixo para criar o agendamento.
                </p>
              </div>
            </div>

            {!readOnly && (
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={false}
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calendário Integrado */}
      <Card className="border-border">
        <CardContent className="p-6">
          <CalendarioSemanaCustom
            dataInicial={hoje}
            onRefresh={handleRefresh}
          />
        </CardContent>
      </Card>

    </div>
  );
}
