import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { CelulaDia } from '@/lib/hooks/use-mes-calendario';
import { turnoColors } from '@/lib/design-tokens';
import { Clock, Users, Calendar, Plus, ClipboardList } from 'lucide-react';
import { useState, lazy, Suspense } from 'react';
import { dateStringToSaoPaulo } from '@/lib/utils/timezone';

// Lazy load modal de novo agendamento
const ModalNovoAgendamento = lazy(() =>
  import('./modal-novo-agendamento').then(m => ({ default: m.ModalNovoAgendamento }))
);

interface ModalDetalhesDiaProps {
  open: boolean;
  onClose: () => void;
  celula?: CelulaDia;
  onSuccess?: () => void;
}

/**
 * ModalDetalhesDia - Modal com detalhes de um dia específico
 *
 * Mostra:
 * - Data formatada
 * - Lista de turnos disponíveis
 * - Lista de agendamentos confirmados
 * - Botão para criar novo agendamento
 */
export function ModalDetalhesDia({ open, onClose, celula, onSuccess }: ModalDetalhesDiaProps) {
  const [modalNovoAgendamento, setModalNovoAgendamento] = useState(false);
  const [turnoSelecionado, setTurnoSelecionado] = useState<any>(null);

  if (!celula) return null;

  const { data, turnos, agendamentos } = celula;

  // Formatar data
  const dataFormatada = dateStringToSaoPaulo(data).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const agendamentosConfirmados = agendamentos.filter(a => a.status === 'confirmado');

  const handleNovoAgendamento = (turno?: any) => {
    setTurnoSelecionado(turno || null);
    setModalNovoAgendamento(true);
  };

  const handleSuccessAgendamento = () => {
    setModalNovoAgendamento(false);
    setTurnoSelecionado(null);
    onSuccess?.();
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Turnos disponíveis */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                Turnos Disponíveis ({turnos.length})
              </h3>

              {turnos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum turno disponível neste dia.</p>
              ) : (
                <div className="space-y-2">
                  {turnos.map(turno => {
                    const cor = turnoColors[turno.cor as keyof typeof turnoColors] || turnoColors.verde;
                    const vagasDisponiveis = turno.vagasTotal - turno.vagasOcupadas;

                    return (
                      <div
                        key={turno.id}
                        className="p-3 rounded-lg border border-border/40 flex items-center justify-between"
                        style={{ backgroundColor: cor.bg }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cor.solid }}
                          />
                          <div>
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Clock className="h-4 w-4" />
                              {turno.horaInicio} - {turno.horaFim}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Users className="h-3 w-3" />
                              {vagasDisponiveis} de {turno.vagasTotal} vagas disponíveis
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleNovoAgendamento(turno)}
                          disabled={vagasDisponiveis === 0}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Agendar
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Agendamentos confirmados */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                Agendamentos Confirmados ({agendamentosConfirmados.length})
              </h3>

              {agendamentosConfirmados.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum agendamento confirmado.</p>
              ) : (
                <div className="space-y-2">
                  {agendamentosConfirmados.map(agend => (
                    <div
                      key={agend.id}
                      className="p-4 rounded-lg bg-card border border-border/40 hover:border-primary/40 transition-colors"
                    >
                      <div className="space-y-2">
                        {/* Categoria e Status */}
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">{agend.categoria}</div>
                          <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
                            {agend.status}
                          </div>
                        </div>

                        {/* Horário */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {agend.horarioInicio} - {agend.horarioFim}
                        </div>

                        {/* OS e Cliente */}
                        {agend.osCodigo && (
                          <div className="flex items-start gap-2 text-xs">
                            <ClipboardList className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-primary">OS {agend.osCodigo}</span>
                              {agend.clienteNome && (
                                <span className="text-muted-foreground"> - {agend.clienteNome}</span>
                              )}
                              {agend.etapasAtivas !== undefined && agend.etapasAtivas > 0 && (
                                <div className="text-muted-foreground mt-0.5">
                                  {agend.etapasAtivas} etapa{agend.etapasAtivas > 1 ? 's' : ''} ativa{agend.etapasAtivas > 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Usuário responsável */}
                        {agend.usuarioNome && (
                          <div className="text-xs text-muted-foreground">
                            Por: {agend.usuarioNome}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de novo agendamento */}
      <Suspense fallback={null}>
        <ModalNovoAgendamento
          open={modalNovoAgendamento}
          onClose={() => {
            setModalNovoAgendamento(false);
            setTurnoSelecionado(null);
          }}
          turno={turnoSelecionado}
          dia={dateStringToSaoPaulo(data)}
          onSuccess={handleSuccessAgendamento}
        />
      </Suspense>
    </>
  );
}
