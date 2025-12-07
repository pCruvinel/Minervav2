/**
 * ModalCriarBloqueio - Modal para criar bloqueios no calendário
 * 
 * Permite bloquear datas/horários específicos para impedir agendamentos.
 * Suporta bloqueios por setor ou para todos os setores.
 */

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '../ui/dialog';
import { ModalHeaderPadrao } from '../ui/modal-header-padrao';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { DatePicker } from '../ui/date-picker';
import { toast } from 'sonner';
import { useCreateBloqueio } from '../../lib/hooks/use-bloqueios';
import { useSetores } from '../../lib/hooks/use-setores';
import { 
  Loader2, 
  AlertCircle, 
  Calendar, 
  Clock, 
  Lock, 
  Check,
  Building2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { getBloqueioColor } from '../../lib/design-tokens';
import type { BloqueioMotivo, CreateBloqueioInput } from '../../lib/types';
import { BLOQUEIO_MOTIVO_OPTIONS } from '../../lib/types';

interface ModalCriarBloqueioProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  dataInicial?: string;  // Pré-preencher data se vier do calendário
}

interface ValidationErrors {
  dataInicio?: string;
  dataFim?: string;
  horaInicio?: string;
  horaFim?: string;
  motivo?: string;
}

export function ModalCriarBloqueio({ 
  open, 
  onClose, 
  onSuccess,
  dataInicial 
}: ModalCriarBloqueioProps) {
  const [dataInicio, setDataInicio] = useState(dataInicial || '');
  const [dataFim, setDataFim] = useState(dataInicial || '');
  const [diaInteiro, setDiaInteiro] = useState(true);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFim, setHoraFim] = useState('18:00');
  const [motivo, setMotivo] = useState<BloqueioMotivo>('feriado');
  const [descricao, setDescricao] = useState('');
  const [todosSetores, setTodosSetores] = useState(true);
  const [setorSelecionado, setSetorSelecionado] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const { mutate: criarBloqueio, loading: criando } = useCreateBloqueio();
  const { setores: setoresDisponiveis, loading: loadingSetores } = useSetores();

  // Helper para formatar data no padrão brasileiro
  const formatarDataBR = (dataStr: string): string => {
    if (!dataStr) return '';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  // Validações
  const validarFormulario = (): boolean => {
    const erros: ValidationErrors = {};
    const hoje = new Date().toISOString().split('T')[0];

    if (!dataInicio) {
      erros.dataInicio = 'Data de início é obrigatória';
    } else if (dataInicio < hoje) {
      erros.dataInicio = 'Deve ser uma data atual ou futura';
    }

    if (!dataFim) {
      erros.dataFim = 'Data de fim é obrigatória';
    } else if (dataFim < dataInicio) {
      erros.dataFim = 'Deve ser após a data de início';
    }

    if (!diaInteiro) {
      if (!horaInicio) {
        erros.horaInicio = 'Hora de início é obrigatória';
      }
      if (!horaFim) {
        erros.horaFim = 'Hora de fim é obrigatória';
      } else if (horaFim <= horaInicio) {
        erros.horaFim = 'Deve ser após a hora de início';
      }
    }

    if (!motivo) {
      erros.motivo = 'Selecione um motivo';
    }

    setErrors(erros);
    return Object.keys(erros).length === 0;
  };

  const isFormValid = useMemo(() => {
    const temCamposBasicos = dataInicio && dataFim && motivo;
    const temHorarios = diaInteiro || (horaInicio && horaFim && horaFim > horaInicio);
    // Verificar se há erros reais (não undefined)
    const temErros = Object.values(errors).some(v => v !== undefined);
    return temCamposBasicos && temHorarios && !temErros;
  }, [dataInicio, dataFim, motivo, diaInteiro, horaInicio, horaFim, errors]);

  const handleSalvar = async () => {
    if (!validarFormulario()) {
      toast.error('Corrija os erros antes de salvar');
      return;
    }

    try {
      const input: CreateBloqueioInput = {
        dataInicio,
        dataFim,
        motivo,
        descricao: descricao || undefined,
        diaInteiro,
        horaInicio: diaInteiro ? undefined : horaInicio,
        horaFim: diaInteiro ? undefined : horaFim,
        setorId: todosSetores ? undefined : setorSelecionado || undefined,
      };

      await criarBloqueio(input);

      // Resetar formulário
      setDataInicio('');
      setDataFim('');
      setDiaInteiro(true);
      setHoraInicio('08:00');
      setHoraFim('18:00');
      setMotivo('feriado');
      setDescricao('');
      setTodosSetores(true);
      setSetorSelecionado(null);
      setErrors({});

      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Erro ao criar bloqueio. Tente novamente.');
      console.error('Erro ao criar bloqueio:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setErrors({});
      onClose();
    }
  };

  const corMotivo = getBloqueioColor(motivo);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <ModalHeaderPadrao
          title="Bloquear Horário/Dia"
          description="Impede agendamentos no período selecionado"
          icon={Lock}
          theme="warning"
        />

        <div className="space-y-6 p-6">
          {/* Seção: Período */}
          <div className="space-y-4">
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
                <Label className="text-sm">Data de Início</Label>
                <DatePicker
                  value={dataInicio}
                  onChange={(date) => {
                    setDataInicio(date);
                    if (!dataFim) setDataFim(date);
                    setErrors(prev => ({ ...prev, dataInicio: undefined }));
                  }}
                  placeholder="dd/mm/aaaa"
                  hasError={!!errors.dataInicio}
                />
                {errors.dataInicio && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.dataInicio}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Data de Fim</Label>
                <DatePicker
                  value={dataFim}
                  onChange={(date) => {
                    setDataFim(date);
                    setErrors(prev => ({ ...prev, dataFim: undefined }));
                  }}
                  placeholder="dd/mm/aaaa"
                  minDate={dataInicio}
                  hasError={!!errors.dataFim}
                />
                {errors.dataFim && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.dataFim}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Seção: Horários */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Horários</h3>
                <p className="text-xs text-muted-foreground">Bloquear dia inteiro ou horários específicos</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <Label htmlFor="diaInteiro" className="cursor-pointer font-medium text-sm">
                Dia inteiro
              </Label>
              <Switch
                id="diaInteiro"
                checked={diaInteiro}
                onCheckedChange={setDiaInteiro}
              />
            </div>

            {!diaInteiro && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horaInicio" className="text-sm">Hora de Início</Label>
                  <Input
                    id="horaInicio"
                    type="time"
                    value={horaInicio}
                    onChange={(e) => {
                      setHoraInicio(e.target.value);
                      setErrors(prev => ({ ...prev, horaInicio: undefined }));
                    }}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaFim" className="text-sm">Hora de Fim</Label>
                  <Input
                    id="horaFim"
                    type="time"
                    value={horaFim}
                    onChange={(e) => {
                      setHoraFim(e.target.value);
                      setErrors(prev => ({ ...prev, horaFim: undefined }));
                    }}
                    className="h-11"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Seção: Motivo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Motivo do Bloqueio</h3>
                <p className="text-xs text-muted-foreground">Selecione o tipo de bloqueio</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {BLOQUEIO_MOTIVO_OPTIONS.map((option) => {
                const cor = getBloqueioColor(option.value);
                const isSelected = motivo === option.value;
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMotivo(option.value)}
                    className={cn(
                      "p-3 rounded-lg border-2 text-left transition-all flex items-center gap-2",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-lg">{cor.icon}</span>
                    <span className="font-medium text-sm">{option.label}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-sm">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Feriado nacional - Natal"
                className="h-20 resize-none"
              />
            </div>
          </div>

          {/* Seção: Setor */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Escopo do Bloqueio</h3>
                <p className="text-xs text-muted-foreground">Para quais setores o bloqueio se aplica</p>
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
                          "p-3 rounded-lg border text-left transition-all",
                          setorSelecionado === setor.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <span className="font-medium text-sm">{setor.nome}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview do Bloqueio */}
          {isFormValid && (
            <div 
              className="rounded-xl p-4 border-2"
              style={{ 
                backgroundColor: corMotivo.bg,
                borderColor: corMotivo.border
              }}
            >
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <span>{corMotivo.icon}</span>
                Preview do Bloqueio
              </h4>
              <div className="text-sm space-y-1">
                <p><strong>Período:</strong> {formatarDataBR(dataInicio)} até {formatarDataBR(dataFim)}</p>
                <p><strong>Horário:</strong> {diaInteiro ? 'Dia inteiro' : `${horaInicio} - ${horaFim}`}</p>
                <p><strong>Escopo:</strong> {todosSetores ? 'Todos os setores' : setoresDisponiveis.find(s => s.id === setorSelecionado)?.nome || 'Setor específico'}</p>
                {descricao && <p><strong>Descrição:</strong> {descricao}</p>}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-muted/30 border-t border-border/50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={criando}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            className="px-8"
            disabled={criando || !isFormValid}
          >
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
