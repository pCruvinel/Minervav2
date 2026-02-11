import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { CelulaDia } from '@/lib/hooks/use-mes-calendario';
import { turnoColors, getBloqueioColor } from '@/lib/design-tokens';
import { BLOQUEIO_MOTIVO_LABELS } from '@/lib/types';
import type { BloqueioMotivo } from '@/lib/types';
import { Clock, Users, Calendar, Plus, ClipboardList, AlertTriangle, Cake, User, FileText, CheckCircle2 } from 'lucide-react';
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
 * v4.0: Seções de feriados/ponto_facultativo e aniversários
 */
export function ModalDetalhesDia({ open, onClose, celula, onSuccess }: ModalDetalhesDiaProps) {
  const [modalNovoAgendamento, setModalNovoAgendamento] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [turnoSelecionado, setTurnoSelecionado] = useState<any>(null);

  if (!celula) return null;

  const { data, turnos, agendamentos, aniversarios = [], bloqueios = [] } = celula;

  // Formatar data
  const dataFormatada = dateStringToSaoPaulo(data).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const agendamentosVisiveis = agendamentos.filter(a => a.status !== 'cancelado');

  // Separate bloqueios
  const feriados = bloqueios.filter(b => b.motivo === 'feriado');
  const pontosFacultativos = bloqueios.filter(b => b.motivo === 'ponto_facultativo');
  const outrosBloqueios = bloqueios.filter(b => b.motivo !== 'feriado' && b.motivo !== 'ponto_facultativo');
  const todosEspeciais = [...feriados, ...pontosFacultativos, ...outrosBloqueios];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

          <div className="space-y-5 mt-4">
            {/* Bloqueios / Feriados / Ponto Facultativo */}
            {todosEspeciais.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  Feriados e Bloqueios
                </h3>
                <div className="space-y-1.5">
                  {todosEspeciais.map(bloq => {
                    const cor = getBloqueioColor(bloq.motivo);
                    const label = BLOQUEIO_MOTIVO_LABELS[bloq.motivo as BloqueioMotivo] || bloq.motivo;
                    return (
                      <div
                        key={bloq.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg border"
                        style={{ backgroundColor: cor.bg, borderColor: cor.border }}
                      >
                        <span className="text-lg">{cor.icon}</span>
                        <div>
                          <div className="text-sm font-medium" style={{ color: cor.text }}>
                            {bloq.descricao || label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Aniversários */}
            {aniversarios.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Cake className="h-4 w-4 text-pink-500" />
                  Aniversariantes ({aniversarios.length})
                </h3>
                <div className="space-y-1.5">
                  {aniversarios.map(aniv => (
                    <div
                      key={aniv.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-pink-50 dark:bg-pink-950/20 border border-pink-200/50 dark:border-pink-800/30"
                    >
                      {aniv.avatarUrl ? (
                        <img
                          src={aniv.avatarUrl}
                          alt={aniv.nome}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-pink-200 dark:bg-pink-800 flex items-center justify-center text-sm">
                          🎂
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-foreground">{aniv.nome}</div>
                        {aniv.cargo && (
                          <div className="text-xs text-muted-foreground">{aniv.cargo}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Turnos disponíveis */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">
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

            {/* Agendamentos */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                Agendamentos ({agendamentosVisiveis.length})
              </h3>

              {agendamentosVisiveis.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum agendamento neste dia.</p>
              ) : (
                <div className="space-y-2">
                  {agendamentosVisiveis.map(agend => (
                    <div
                      key={agend.id}
                      className="p-4 rounded-lg bg-card border border-border/40 hover:border-primary/40 transition-colors"
                    >
                      <div className="space-y-2.5">
                        {/* Header: Categoria + Status Badge */}
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">{agend.categoria}</div>
                          <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            agend.status === 'realizado'
                              ? 'bg-primary/10 text-primary'
                              : agend.status === 'cancelado'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-success/10 text-success'
                          }`}>
                            {agend.status === 'realizado' && '✅ '}
                            {agend.status}
                          </div>
                        </div>

                        {/* Horário */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {agend.horarioInicio} - {agend.horarioFim}
                        </div>

                        {/* OS Info */}
                        {agend.osCodigo && (
                          <div className="flex flex-col gap-1 p-2 rounded-md bg-primary/5 border border-primary/10">
                            <div className="flex items-center gap-2 text-xs">
                              <ClipboardList className="h-3 w-3 text-primary flex-shrink-0" />
                              <span className="font-medium text-primary">OS {agend.osCodigo}</span>
                            </div>
                            {agend.osNome && (
                              <div className="text-xs text-muted-foreground pl-5 truncate" title={agend.osNome}>
                                {agend.osNome}
                              </div>
                            )}
                            {agend.etapaNome && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-5">
                                <FileText className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate" title={agend.etapaNome}>Etapa: {agend.etapaNome}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Responsável */}
                        {agend.responsavelNome && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3 w-3 flex-shrink-0" />
                            <span>Responsável: {agend.responsavelNome}</span>
                          </div>
                        )}

                        {/* Descrição */}
                        {agend.descricao && (
                          <div className="text-xs text-muted-foreground border-t border-border/40 pt-2 mt-1">
                            {agend.descricao}
                          </div>
                        )}

                        {/* Criado por */}
                        {agend.usuarioNome && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                            <span>Por: {agend.usuarioNome}</span>
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
