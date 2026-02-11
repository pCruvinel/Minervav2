/**
 * ModalCriarBloqueio - Modal stepper para criar bloqueios
 *
 * 3 passos: Motivo → Período → Escopo + Confirmação
 * Validação Zod + useFieldValidation (green/red rings)
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '../ui/dialog';
import { ModalHeaderPadrao } from '../ui/modal-header-padrao';
import { Button } from '../ui/button';
import { FormInput } from '../ui/form-input';
import { FormTextarea } from '../ui/form-textarea';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { DatePicker } from '../ui/date-picker';
import { toast } from 'sonner';
import { useCreateBloqueio } from '../../lib/hooks/use-bloqueios';
import { useSetores } from '../../lib/hooks/use-setores';
import { useFieldValidation } from '../../lib/hooks/use-field-validation';
import { bloqueioStep1Schema, bloqueioStep2Schema } from '../../lib/validations/bloqueio-schema';
import {
  Loader2,
  Lock,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Building2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { getBloqueioColor } from '../../lib/design-tokens';
import type { BloqueioMotivo, CreateBloqueioInput } from '../../lib/types';

interface ModalCriarBloqueioProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  dataInicial?: string;
}

// Motivos disponíveis para criação manual (sem 'feriado')
const MOTIVO_OPTIONS: { value: BloqueioMotivo; label: string; desc: string }[] = [
  { value: 'ponto_facultativo', label: 'Ponto Facultativo', desc: 'Dia opcional, não bloqueia agendamentos' },
  { value: 'manutencao', label: 'Manutenção', desc: 'Manutenção predial ou de equipamentos' },
  { value: 'evento', label: 'Evento', desc: 'Evento corporativo ou externo' },
  { value: 'ferias_coletivas', label: 'Férias Coletivas', desc: 'Recesso geral da empresa' },
  { value: 'outro', label: 'Outro', desc: 'Motivo não listado' },
];

const STEP_LABELS = ['Motivo', 'Período', 'Confirmação'];

export function ModalCriarBloqueio({
  open,
  onClose,
  onSuccess,
  dataInicial,
}: ModalCriarBloqueioProps) {
  // Step state
  const [step, setStep] = useState(0);

  // Form state
  const [motivo, setMotivo] = useState<BloqueioMotivo>('manutencao');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState(dataInicial || '');
  const [dataFim, setDataFim] = useState(dataInicial || '');
  const [diaInteiro, setDiaInteiro] = useState(true);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFim, setHoraFim] = useState('18:00');
  const [todosSetores, setTodosSetores] = useState(true);
  const [setorSelecionado, setSetorSelecionado] = useState<string | null>(null);

  // Validation hooks
  const step1 = useFieldValidation(bloqueioStep1Schema);
  const step2 = useFieldValidation(bloqueioStep2Schema);

  const { mutate: criarBloqueio, loading: criando } = useCreateBloqueio();
  const { setores: setoresDisponiveis, loading: loadingSetores } = useSetores();

  // Helpers
  const formatarDataBR = (dataStr: string): string => {
    if (!dataStr) return '';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const corMotivo = getBloqueioColor(motivo);

  // Step navigation
  const canAdvanceStep0 = motivo && descricao.length >= 3;
  const canAdvanceStep1 = dataInicio && dataFim && dataFim >= dataInicio &&
    (diaInteiro || (horaInicio && horaFim && horaFim > horaInicio));

  const handleNext = () => {
    if (step === 0) {
      step1.markAllTouched();
      const valid = step1.validateAll({ motivo, descricao });
      if (!valid) return;
      setStep(1);
    } else if (step === 1) {
      step2.markAllTouched();
      const valid = step2.validateAll({ dataInicio, dataFim, diaInteiro, horaInicio, horaFim });
      if (!valid) return;
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(Math.max(0, step - 1));
  };

  const handleSalvar = async () => {
    try {
      const input: CreateBloqueioInput = {
        dataInicio,
        dataFim,
        motivo,
        descricao,
        diaInteiro,
        horaInicio: diaInteiro ? undefined : horaInicio,
        horaFim: diaInteiro ? undefined : horaFim,
        setorId: todosSetores ? undefined : setorSelecionado || undefined,
      };

      await criarBloqueio(input);

      // Reset
      setStep(0);
      setMotivo('manutencao');
      setDescricao('');
      setDataInicio('');
      setDataFim('');
      setDiaInteiro(true);
      setHoraInicio('08:00');
      setHoraFim('18:00');
      setTodosSetores(true);
      setSetorSelecionado(null);

      onSuccess?.();
      onClose();
    } catch {
      toast.error('Erro ao criar bloqueio. Tente novamente.');
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <ModalHeaderPadrao
          title="Bloquear Horário/Dia"
          description={`Passo ${step + 1} de 3 — ${STEP_LABELS[step]}`}
          icon={Lock}
          theme="warning"
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

        <div className="p-6 min-h-[280px]">
          {/* Step 0: Motivo + Descrição */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Motivo do Bloqueio</h3>
                  <p className="text-xs text-muted-foreground">Selecione o tipo e descreva o motivo</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {MOTIVO_OPTIONS.map((option) => {
                  const cor = getBloqueioColor(option.value);
                  const isSelected = motivo === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setMotivo(option.value);
                        if (step1.touched.motivo) step1.validateField('motivo', option.value);
                      }}
                      className={cn(
                        'p-3 rounded-lg border-2 text-left transition-all',
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cor.icon}</span>
                        <span className="font-medium text-sm">{option.label}</span>
                        {isSelected && <Check className="h-4 w-4 text-primary ml-auto" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{option.desc}</p>
                    </button>
                  );
                })}
              </div>

              <FormTextarea
                id="descricao"
                label="Descrição"
                required
                value={descricao}
                onChange={(e) => {
                  setDescricao(e.target.value);
                  if (step1.touched.descricao) step1.validateField('descricao', e.target.value);
                }}
                onBlur={() => {
                  step1.markFieldTouched('descricao');
                  step1.validateField('descricao', descricao);
                }}
                error={step1.touched.descricao ? step1.errors.descricao : undefined}
                success={step1.touched.descricao && !step1.errors.descricao && descricao.length >= 3}
                placeholder="Ex: Manutenção predial no escritório central"
                className="h-20 resize-none"
                helperText="Mínimo 3 caracteres"
              />
            </div>
          )}

          {/* Step 1: Período */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Período do Bloqueio</h3>
                  <p className="text-xs text-muted-foreground">Quando o bloqueio estará ativo</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Data de Início <span className="text-destructive">*</span></Label>
                  <DatePicker
                    value={dataInicio}
                    onChange={(date) => {
                      setDataInicio(date);
                      if (!dataFim) setDataFim(date);
                      if (step2.touched.dataInicio) step2.validateField('dataInicio', date);
                    }}
                    placeholder="dd/mm/aaaa"
                    hasError={!!step2.touched.dataInicio && !!step2.errors.dataInicio}
                  />
                  {step2.touched.dataInicio && step2.errors.dataInicio && (
                    <p className="text-xs text-destructive">{step2.errors.dataInicio}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Data de Fim <span className="text-destructive">*</span></Label>
                  <DatePicker
                    value={dataFim}
                    onChange={(date) => {
                      setDataFim(date);
                      if (step2.touched.dataFim) step2.validateField('dataFim', date);
                    }}
                    placeholder="dd/mm/aaaa"
                    minDate={dataInicio}
                    hasError={!!step2.touched.dataFim && !!step2.errors.dataFim}
                  />
                  {step2.touched.dataFim && step2.errors.dataFim && (
                    <p className="text-xs text-destructive">{step2.errors.dataFim}</p>
                  )}
                </div>
              </div>

              {/* Toggle dia inteiro */}
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 mt-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Horários</h3>
                  <p className="text-xs text-muted-foreground">Bloquear dia inteiro ou faixa de horário</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <Label htmlFor="diaInteiro" className="cursor-pointer font-medium text-sm">
                  Dia inteiro
                </Label>
                <Switch id="diaInteiro" checked={diaInteiro} onCheckedChange={setDiaInteiro} />
              </div>

              {!diaInteiro && (
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    id="horaInicio"
                    label="Hora de Início"
                    type="time"
                    required
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                  />
                  <FormInput
                    id="horaFim"
                    label="Hora de Fim"
                    type="time"
                    required
                    value={horaFim}
                    onChange={(e) => setHoraFim(e.target.value)}
                    error={horaFim <= horaInicio && horaFim ? 'Deve ser após início' : undefined}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Escopo + Preview */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Escopo e Confirmação</h3>
                  <p className="text-xs text-muted-foreground">Revise e confirme o bloqueio</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <Label htmlFor="todosSetores" className="cursor-pointer font-medium text-sm">
                  Bloquear todos os setores
                </Label>
                <Switch
                  id="todosSetores"
                  checked={todosSetores}
                  onCheckedChange={(checked) => {
                    setTodosSetores(checked);
                    if (checked) setSetorSelecionado(null);
                  }}
                />
              </div>

              {!todosSetores && (
                <div className="space-y-2">
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
                          onClick={() => setSetorSelecionado(setor.id)}
                          className={cn(
                            'p-3 rounded-lg border text-left transition-all',
                            setorSelecionado === setor.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <span className="font-medium text-sm">{setor.nome}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Preview */}
              <div
                className="rounded-xl p-4 border-2"
                style={{
                  backgroundColor: corMotivo.bg,
                  borderColor: corMotivo.border,
                }}
              >
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <span>{corMotivo.icon}</span>
                  Resumo do Bloqueio
                </h4>
                <div className="text-sm space-y-1">
                  <p><strong>Motivo:</strong> {MOTIVO_OPTIONS.find(o => o.value === motivo)?.label}</p>
                  <p><strong>Descrição:</strong> {descricao}</p>
                  <p><strong>Período:</strong> {formatarDataBR(dataInicio)} até {formatarDataBR(dataFim)}</p>
                  <p><strong>Horário:</strong> {diaInteiro ? 'Dia inteiro' : `${horaInicio} - ${horaFim}`}</p>
                  <p><strong>Escopo:</strong> {todosSetores ? 'Todos os setores' : setoresDisponiveis.find(s => s.id === setorSelecionado)?.nome || 'Setor específico'}</p>
                </div>
              </div>
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
            <Button onClick={handleSalvar} disabled={criando}>
              {criando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Criar Bloqueio
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
