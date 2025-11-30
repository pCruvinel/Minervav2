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

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ModalHeaderPadrao } from '@/components/ui/modal-header-padrao';
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
  // Estados
  const [modalCalendarioAberto, setModalCalendarioAberto] = useState(false);
  const [modalAgendamentoAberto, setModalAgendamentoAberto] = useState(false);
  const [turnoSelecionado, setTurnoSelecionado] = useState<any>(null);
  const [diaSelecionado, setDiaSelecionado] = useState<Date>(new Date());

  // Hooks
  const { data: agendamento, loading, refetch } = useAgendamento(agendamentoId || '');
  const { mutate: cancelarAgendamento, loading: cancelando } = useCancelarAgendamento();

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleAbrirCalendario = () => {
    if (readOnly) return;
    setModalCalendarioAberto(true);
  };

  const handleTurnoClick = (turno: any, dia: Date) => {
    setTurnoSelecionado(turno);
    setDiaSelecionado(dia);
    setModalCalendarioAberto(false);
    setModalAgendamentoAberto(true);
  };

  const handleAgendamentoSuccess = () => {
    setModalAgendamentoAberto(false);
    toast.success('Agendamento criado com sucesso!');
    refetch();
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

  if (loading) {
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
    );
  }

  // =====================================================
  // RENDER: SEM AGENDAMENTO (CRIAR NOVO)
  // =====================================================

  return (
    <>
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#3b82f6' }}
            >
              <Calendar className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-lg font-medium mb-2">Nenhum Agendamento Criado</h3>
            <p className="text-sm text-neutral-600 mb-6">
              Crie um agendamento no sistema de calendário para prosseguir.
            </p>

            {!readOnly && (
              <Button
                onClick={handleAbrirCalendario}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Agendamento
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Seleção de Turno (Calendário Semanal) */}
      <Dialog open={modalCalendarioAberto} onOpenChange={setModalCalendarioAberto}>
        <DialogContent className="max-w-6xl p-0">
          <ModalHeaderPadrao
            title="Selecione um Turno Disponível"
            description="Escolha o dia e o horário para o agendamento"
            icon={Calendar}
            theme="info"
          />

          <div className="p-6">
            <CalendarioSemana
              dataAtual={new Date()}
              onTurnoClick={handleTurnoClick}
            />
          </div>
        </DialogContent>
      </Dialog>

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
    </>
  );
}
