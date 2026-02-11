/**
 * ModalCriarTurno - Modal stepper para criar turnos
 *
 * 3 passos: Horários → Disponibilidade → Setores/Vagas + Confirmação
 * Validação Zod + useFieldValidation (green/red rings)
 */

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '../ui/dialog';
import { ModalHeaderPadrao } from '../ui/modal-header-padrao';
import { Button } from '../ui/button';
import { FormInput } from '../ui/form-input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { useCreateTurno } from '../../lib/hooks/use-turnos';
import { useSetores } from '../../lib/hooks/use-setores';
import { useFieldValidation } from '../../lib/hooks/use-field-validation';
import { turnoStep1Schema } from '../../lib/validations/turno-schema';
import {
  Loader2,
  AlertCircle,
  Clock,
  Calendar,
  Users,
  Briefcase,
  Check,
  Info,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { getSetorColor } from '../../lib/design-tokens';
import { logger } from '../../lib/utils/logger';
import type { VagasPorSetor } from '../../lib/types';

interface ModalCriarTurnoProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Dias da semana começando por Segunda (padrão BR)
const diasSemanaConfig = [
  { label: 'S', value: 1, fullLabel: 'Segunda' },
  { label: 'T', value: 2, fullLabel: 'Terça' },
  { label: 'Q', value: 3, fullLabel: 'Quarta' },
  { label: 'Q', value: 4, fullLabel: 'Quinta' },
  { label: 'S', value: 5, fullLabel: 'Sexta' },
  { label: 'S', value: 6, fullLabel: 'Sábado' },
  { label: 'D', value: 0, fullLabel: 'Domingo' },
];

const STEP_LABELS = ['Horários', 'Disponibilidade', 'Vagas e Setores'];

export function ModalCriarTurno({ open, onClose, onSuccess }: ModalCriarTurnoProps) {
  const [step, setStep] = useState(0);

  // Step 1: Horários
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFim, setHoraFim] = useState('11:00');

  // Step 2: Disponibilidade
  const [disponibilidade, setDisponibilidade] = useState<'uteis' | 'recorrente' | 'custom'>('uteis');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [diasSemana, setDiasSemana] = useState<number[]>([]);

  // Step 3: Setores + Vagas
  const [setoresSelecionados, setSetoresSelecionados] = useState<string[]>([]);
  const [todosSetores, setTodosSetores] = useState(false);
  const [vagasPorSetor, setVagasPorSetor] = useState<VagasPorSetor>({});

  // Validation
  const step1Validation = useFieldValidation(turnoStep1Schema);

  const { mutate: criarTurno, loading: criando } = useCreateTurno();
  const { setores: setoresDisponiveis, loading: loadingSetores } = useSetores();

  // Calcular duração
  const duracao = useMemo(() => {
    if (!horaInicio || !horaFim) return null;
    const [inicioH, inicioM] = horaInicio.split(':').map(Number);
    const [fimH, fimM] = horaFim.split(':').map(Number);
    const d = (fimH + fimM / 60) - (inicioH + inicioM / 60);
    return d > 0 ? d : null;
  }, [horaInicio, horaFim]);

  const totalVagas = useMemo(() => {
    return Object.values(vagasPorSetor).reduce((sum, v) => sum + v, 0);
  }, [vagasPorSetor]);

  // Step validation conditions
  const canAdvanceStep0 = horaInicio && horaFim && horaFim > horaInicio && duracao && duracao >= 1 && duracao <= 12;
  const canAdvanceStep1 = useMemo(() => {
    if (disponibilidade === 'uteis') return true;
    if (disponibilidade === 'recorrente') return diasSemana.length > 0;
    if (disponibilidade === 'custom') return dataInicio && dataFim && dataFim >= dataInicio;
    return false;
  }, [disponibilidade, diasSemana.length, dataInicio, dataFim]);

  const isFormValid = useMemo(() => {
    const temSetores = todosSetores || setoresSelecionados.length > 0;
    const temVagas = Object.keys(vagasPorSetor).length > 0 && Object.values(vagasPorSetor).every(v => v > 0);
    return temSetores && temVagas;
  }, [todosSetores, setoresSelecionados.length, vagasPorSetor]);

  // Handlers
  const handleToggleSetor = (slug: string) => {
    if (setoresSelecionados.includes(slug)) {
      setSetoresSelecionados(setoresSelecionados.filter(s => s !== slug));
      const novasVagas = { ...vagasPorSetor };
      delete novasVagas[slug];
      setVagasPorSetor(novasVagas);
    } else {
      setSetoresSelecionados([...setoresSelecionados, slug]);
      setVagasPorSetor({ ...vagasPorSetor, [slug]: 1 });
    }
    setTodosSetores(false);
  };

  const handleTodosSetores = (checked: boolean) => {
    setTodosSetores(checked);
    if (checked) {
      const slugs = setoresDisponiveis.map(s => s.slug);
      setSetoresSelecionados(slugs);
      const novasVagas: VagasPorSetor = {};
      slugs.forEach(slug => { novasVagas[slug] = 1; });
      setVagasPorSetor(novasVagas);
    } else {
      setSetoresSelecionados([]);
      setVagasPorSetor({});
    }
  };

  const handleVagasSetor = (setor: string, delta: number) => {
    const atual = vagasPorSetor[setor] || 1;
    setVagasPorSetor({ ...vagasPorSetor, [setor]: Math.max(1, Math.min(10, atual + delta)) });
  };

  const handleSetVagasSetor = (setor: string, valor: number) => {
    setVagasPorSetor({ ...vagasPorSetor, [setor]: Math.max(1, Math.min(10, valor)) });
  };

  const handleToggleDia = (dia: number) => {
    if (diasSemana.includes(dia)) {
      setDiasSemana(diasSemana.filter(d => d !== dia));
    } else {
      setDiasSemana([...diasSemana, dia].sort());
    }
  };

  const handleNext = () => {
    if (step === 0) {
      step1Validation.markAllTouched();
      const valid = step1Validation.validateAll({ horaInicio, horaFim });
      if (!valid || !canAdvanceStep0) return;
      setStep(1);
    } else if (step === 1) {
      if (!canAdvanceStep1) return;
      setStep(2);
    }
  };

  const handleBack = () => setStep(Math.max(0, step - 1));

  const getDisponibilidadeLabel = () => {
    switch (disponibilidade) {
      case 'uteis': return 'Dias úteis (Seg-Sex)';
      case 'recorrente': {
        const nomes = diasSemana.sort().map(d => diasSemanaConfig.find(c => c.value === d)?.fullLabel || '').filter(Boolean);
        return nomes.length > 0 ? nomes.join(', ') : 'Recorrente';
      }
      case 'custom': return 'Período personalizado';
      default: return '';
    }
  };

  const handleSalvar = async () => {
    try {
      const setoresFinais = todosSetores ? setoresDisponiveis.map(s => s.slug) : setoresSelecionados;

      await criarTurno({
        horaInicio,
        horaFim,
        vagasTotal: totalVagas,
        vagasPorSetor,
        setores: setoresFinais,
        cor: 'verde',
        tipoRecorrencia: disponibilidade,
        dataInicio: disponibilidade === 'custom' ? dataInicio : undefined,
        dataFim: disponibilidade === 'custom' ? dataFim : undefined,
        diasSemana: (disponibilidade === 'recorrente' || disponibilidade === 'custom') ? diasSemana : undefined,
      });

      // Reset
      setStep(0);
      setHoraInicio('09:00');
      setHoraFim('11:00');
      setDisponibilidade('uteis');
      setDataInicio('');
      setDataFim('');
      setDiasSemana([]);
      setVagasPorSetor({});
      setSetoresSelecionados([]);
      setTodosSetores(false);

      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Erro ao criar turno. Tente novamente.');
      logger.error('Erro ao criar turno:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStep(0);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <ModalHeaderPadrao
          title="Configurar Novo Turno"
          description={`Passo ${step + 1} de 3 — ${STEP_LABELS[step]}`}
          icon={Briefcase}
          theme="create"
        />

        {/* Stepper indicator */}
        <div className="px-6 pt-2">
          <div className="flex items-center gap-2">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                    i < step && 'bg-primary text-primary-foreground',
                    i === step && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    i > step && 'bg-muted text-muted-foreground'
                  )}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={cn(
                  'text-xs font-medium hidden sm:block',
                  i <= step ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {label}
                </span>
                {i < STEP_LABELS.length - 1 && (
                  <div className={cn(
                    'flex-1 h-0.5 rounded-full',
                    i < step ? 'bg-primary' : 'bg-muted'
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 min-h-[320px]">
          {/* Step 0: Horários */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Horários do Turno</h3>
                  <p className="text-xs text-muted-foreground">Defina o período de trabalho</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  id="horaInicio"
                  label="Hora de Início"
                  type="time"
                  required
                  value={horaInicio}
                  onChange={(e) => {
                    setHoraInicio(e.target.value);
                    if (step1Validation.touched.horaInicio) step1Validation.validateField('horaInicio', e.target.value);
                  }}
                  onBlur={() => {
                    step1Validation.markFieldTouched('horaInicio');
                    step1Validation.validateField('horaInicio', horaInicio);
                  }}
                  error={step1Validation.touched.horaInicio ? step1Validation.errors.horaInicio : undefined}
                  success={step1Validation.touched.horaInicio && !step1Validation.errors.horaInicio && !!horaInicio}
                />
                <FormInput
                  id="horaFim"
                  label="Hora de Fim"
                  type="time"
                  required
                  value={horaFim}
                  onChange={(e) => {
                    setHoraFim(e.target.value);
                    if (step1Validation.touched.horaFim) step1Validation.validateField('horaFim', e.target.value);
                  }}
                  onBlur={() => {
                    step1Validation.markFieldTouched('horaFim');
                    step1Validation.validateField('horaFim', horaFim);
                  }}
                  error={
                    step1Validation.touched.horaFim
                      ? step1Validation.errors.horaFim || (horaFim <= horaInicio ? 'Deve ser após início' : undefined)
                      : undefined
                  }
                  success={step1Validation.touched.horaFim && !step1Validation.errors.horaFim && horaFim > horaInicio}
                />
              </div>

              {duracao && duracao > 0 && (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Duração: <span className="font-medium text-foreground">{duracao} hora{duracao !== 1 ? 's' : ''}</span>
                  </span>
                  {(duracao < 1 || duracao > 12) && (
                    <span className="text-xs text-destructive ml-2">
                      (Permitido: 1h - 12h)
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 1: Disponibilidade */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Disponibilidade</h3>
                  <p className="text-xs text-muted-foreground">Quando o turno estará disponível</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'uteis', label: 'Dias úteis', desc: 'Seg a Sex' },
                  { id: 'recorrente', label: 'Recorrência', desc: 'Escolher dias' },
                  { id: 'custom', label: 'Personalizado', desc: 'Período específico' },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setDisponibilidade(option.id as typeof disponibilidade);
                      if (option.id === 'uteis') setDiasSemana([]);
                    }}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all duration-200',
                      disponibilidade === option.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{option.label}</span>
                      {disponibilidade === option.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{option.desc}</span>
                  </button>
                ))}
              </div>

              {/* Recorrente: dias da semana */}
              {disponibilidade === 'recorrente' && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50">
                  <Label className="text-sm font-medium">Selecione os dias da semana</Label>
                  <p className="text-xs text-muted-foreground">O turno será recorrente nesses dias</p>
                  <div className="flex gap-2 justify-center">
                    {diasSemanaConfig.map((dia) => (
                      <button
                        key={dia.value}
                        type="button"
                        onClick={() => handleToggleDia(dia.value)}
                        title={dia.fullLabel}
                        className={cn(
                          'h-11 w-11 rounded-full font-semibold text-sm transition-all duration-200 border-2',
                          diasSemana.includes(dia.value)
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-background border-muted-foreground/20 text-muted-foreground hover:bg-muted hover:border-muted-foreground/40'
                        )}
                      >
                        {dia.label}
                      </button>
                    ))}
                  </div>
                  {disponibilidade === 'recorrente' && diasSemana.length === 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Selecione ao menos um dia
                    </p>
                  )}
                </div>
              )}

              {/* Personalizado: datas */}
              {disponibilidade === 'custom' && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      id="dataInicio"
                      label="Data de Início"
                      type="text"
                      required
                      placeholder="dd/mm/aaaa"
                      maxLength={10}
                      value={dataInicio}
                      onChange={(e) => {
                        const masked = e.target.value
                          .replace(/\D/g, '')
                          .replace(/(\d{2})(\d)/, '$1/$2')
                          .replace(/(\d{2})(\d)/, '$1/$2')
                          .replace(/(\/\d{4})\d+?$/, '$1');
                        setDataInicio(masked);
                      }}
                    />
                    <FormInput
                      id="dataFim"
                      label="Data de Fim"
                      type="text"
                      required
                      placeholder="dd/mm/aaaa"
                      maxLength={10}
                      value={dataFim}
                      onChange={(e) => {
                        const masked = e.target.value
                          .replace(/\D/g, '')
                          .replace(/(\d{2})(\d)/, '$1/$2')
                          .replace(/(\d{2})(\d)/, '$1/$2')
                          .replace(/(\/\d{4})\d+?$/, '$1');
                        setDataFim(masked);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Setores + Vagas + Preview */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Setores */}
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Vagas por Setor</h3>
                  <p className="text-xs text-muted-foreground">Defina quantos agendamentos simultâneos</p>
                </div>
                {totalVagas > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                    <span className="text-xl font-bold text-primary">{totalVagas}</span>
                    <span className="text-xs text-muted-foreground">total</span>
                  </div>
                )}
              </div>

              {/* Switch Todos */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <Label htmlFor="todos-setores" className="cursor-pointer font-medium text-sm">
                  Todos os setores
                </Label>
                <Switch
                  id="todos-setores"
                  checked={todosSetores}
                  onCheckedChange={(checked: boolean) => handleTodosSetores(checked)}
                />
              </div>

              {/* Seleção de setores */}
              {!todosSetores && (
                <>
                  {loadingSetores ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Carregando setores...
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {setoresDisponiveis.map((setor) => (
                        <button
                          key={setor.id}
                          type="button"
                          onClick={() => handleToggleSetor(setor.slug)}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-lg border transition-all duration-200 text-left',
                            setoresSelecionados.includes(setor.slug)
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <span className="font-medium text-sm">{setor.nome}</span>
                          {setoresSelecionados.includes(setor.slug) && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Vagas por setor selecionado */}
              {setoresSelecionados.length > 0 && (
                <div className="space-y-3">
                  {setoresSelecionados.map(slug => {
                    const setor = setoresDisponiveis.find(s => s.slug === slug);
                    const vagas = vagasPorSetor[slug] || 1;
                    const corSetor = getSetorColor(slug);

                    return (
                      <div
                        key={slug}
                        className="flex items-center justify-between p-3 rounded-lg border"
                        style={{ backgroundColor: corSetor.bg, borderColor: corSetor.border }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-8 rounded-full" style={{ backgroundColor: corSetor.bgSolid }} />
                          <span className="font-medium text-sm" style={{ color: corSetor.text }}>
                            {setor?.nome || slug}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleVagasSetor(slug, -1)}
                            disabled={vagas <= 1}
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                              'bg-white/80 hover:bg-white border shadow-sm',
                              vagas <= 1 && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={vagas}
                            onChange={(e) => handleSetVagasSetor(slug, parseInt(e.target.value) || 1)}
                            className="w-12 h-8 text-center font-bold text-lg bg-white/80 border rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => handleVagasSetor(slug, 1)}
                            disabled={vagas >= 10}
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                              'bg-white/80 hover:bg-white border shadow-sm',
                              vagas >= 10 && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <span className="text-xs text-muted-foreground ml-1 w-10">
                            vaga{vagas !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Resumo do turno */}
              {isFormValid && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Resumo do Turno
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{horaInicio} - {horaFim}</span>
                        {duracao && (
                          <Badge variant="secondary" className="text-xs">{duracao}h</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{getDisponibilidadeLabel()}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{totalVagas} vaga{totalVagas !== 1 ? 's' : ''} total</span>
                      </div>
                    </div>
                  </div>
                  {setoresSelecionados.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">Capacidade por setor:</p>
                      <div className="flex flex-wrap gap-2">
                        {setoresSelecionados.map(slug => {
                          const setor = setoresDisponiveis.find(s => s.slug === slug);
                          const vagas = vagasPorSetor[slug] || 1;
                          const corSetor = getSetorColor(slug);
                          return (
                            <Badge
                              key={slug}
                              variant="outline"
                              className="text-xs px-2 py-1"
                              style={{
                                backgroundColor: corSetor.bg,
                                borderColor: corSetor.border,
                                color: corSetor.text,
                              }}
                            >
                              {setor?.nome || slug}: {vagas} vaga{vagas !== 1 ? 's' : ''}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-muted/30 border-t border-border/50">
          {step > 0 ? (
            <Button variant="outline" onClick={handleBack} disabled={criando} className="mr-auto">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Voltar
            </Button>
          ) : (
            <Button variant="outline" onClick={onClose} disabled={criando}>
              Cancelar
            </Button>
          )}

          {step < 2 ? (
            <Button
              onClick={handleNext}
              disabled={step === 0 ? !canAdvanceStep0 : !canAdvanceStep1}
            >
              Próximo
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSalvar} disabled={criando || !isFormValid}>
              {criando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Turno'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
