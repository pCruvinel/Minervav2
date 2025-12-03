import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { CelulaData } from '@/lib/hooks/use-semana-calendario';
import { turnoColors } from '@/lib/design-tokens';
import { Clock, Users, Calendar, Plus, ClipboardList } from 'lucide-react';
import { useState, lazy, Suspense } from 'react';
import { dateStringToSaoPaulo } from '@/lib/utils/timezone';

// Lazy load modal de novo agendamento
const ModalNovoAgendamento = lazy(() =>
  import('./modal-novo-agendamento').then(m => ({ default: m.ModalNovoAgendamento }))
);

interface ModalDetalhesCelulaProps {
  open: boolean;
  onClose: () => void;
  celula?: CelulaData;
  onSuccess?: () => void;
}

/**
 * ModalDetalhesCelula - Modal com detalhes de uma célula/horário específico
 *
 * Mostra:
 * - Data e horário formatados
 * - Turno disponível (se houver)
 * - Lista de agendamentos
 * - Botão para criar novo agendamento
 */
export function ModalDetalhesCelula({ open, onClose, celula, onSuccess }: ModalDetalhesCelulaProps) {
  const [modalNovoAgendamento, setModalNovoAgendamento] = useState(false);

  if (!celula) return null;

  const { data, hora, turno, agendamentos } = celula;

  // Formatar data e hora
  const dataFormatada = dateStringToSaoPaulo(data).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const horarioFormatado = `${String(hora).padStart(2, '0')}:00 - ${String(hora + 1).padStart(2, '0')}:00`;

  const agendamentosConfirmados = agendamentos.filter(a => a.status === 'confirmado');

  const handleNovoAgendamento = () => {
    setModalNovoAgendamento(true);
  };

  const handleSuccessAgendamento = () => {
    setModalNovoAgendamento(false);
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
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4" />
              {horarioFormatado}
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Turno disponível */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                Turno Disponível
              </h3>

              {!turno ? (
                <p className="text-sm text-muted-foreground">Nenhum turno disponível neste horário.</p>
              ) : (
                <div className="space-y-2">
                  {(() => {
                    const cor = turnoColors[turno.cor as keyof typeof turnoColors] || turnoColors.verde;
                    const vagasDisponiveis = turno.vagasTotal - turno.vagasOcupadas;

                    return (
                      <div
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
                            {turno.setores && turno.setores.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Setores: {turno.setores.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleNovoAgendamento}
                          disabled={vagasDisponiveis === 0}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Agendar
                        </Button>
                      </div>
                    );
                  })()}
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
          onClose={() => setModalNovoAgendamento(false)}
          turno={turno as any}
          dia={dateStringToSaoPaulo(data)}
          onSuccess={handleSuccessAgendamento}
        />
      </Suspense>
    </>
  );
}
