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
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';
import { useCreateTurno } from '../../lib/hooks/use-turnos';
import { Loader2, AlertCircle, Clock, Calendar, Users, Palette, Briefcase } from 'lucide-react';
import { useSetores } from '../../lib/hooks/use-setores';
import { logger } from '../../lib/utils/logger';
import { designTokens } from '@/lib/design-tokens';

interface ModalCriarTurnoProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const coresTurno = [
  { nome: 'Dourado', valor: 'var(--primary)' },
  { nome: 'Rosa', valor: 'var(--secondary)' },
  { nome: 'Verde', valor: 'var(--success)' },
  { nome: 'Amarelo', valor: 'var(--warning)' },
  { nome: 'Vermelho', valor: 'var(--error)' },
  { nome: 'Azul', valor: 'var(--info)' }
];

interface ValidationErrors {
  horaInicio?: string;
  horaFim?: string;
  dataInicio?: string;
  dataFim?: string;
  numeroVagas?: string;
  setores?: string;
}

export function ModalCriarTurno({ open, onClose, onSuccess }: ModalCriarTurnoProps) {
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFim, setHoraFim] = useState('11:00');
  const [recorrencia, setRecorrencia] = useState<'todos' | 'uteis' | 'custom'>('uteis');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [diasSemana, setDiasSemana] = useState<number[]>([]); // 0=Domingo, 6=Sábado
  const [numeroVagas, setNumeroVagas] = useState([5]);
  const [corSelecionada, setCorSelecionada] = useState(coresTurno[0].valor);
  const [setoresSelecionados, setSetoresSelecionados] = useState<string[]>([]);
  const [todosSetores, setTodosSetores] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const { mutate: criarTurno, loading: criando } = useCreateTurno();
  const { setores: setoresDisponiveis, loading: loadingSetores } = useSetores();

  // Validar horários
  const validarHorarios = (): boolean => {
    const erros: ValidationErrors = {};

    // Validar horaInicio
    if (!horaInicio) {
      erros.horaInicio = 'Hora de início é obrigatória';
    } else if (!/^\d{2}:\d{2}$/.test(horaInicio)) {
      erros.horaInicio = 'Formato inválido (use HH:MM)';
    } else {
      const [horas] = horaInicio.split(':').map(Number);
      if (horas < 8 || horas > 18) {
        erros.horaInicio = 'Deve estar entre 08:00 e 18:00';
      }
    }

    // Validar horaFim
    if (!horaFim) {
      erros.horaFim = 'Hora de fim é obrigatória';
    } else if (!/^\d{2}:\d{2}$/.test(horaFim)) {
      erros.horaFim = 'Formato inválido (use HH:MM)';
    } else if (horaFim <= horaInicio) {
      erros.horaFim = 'Deve ser após a hora de início';
    } else {
      const [horas] = horaFim.split(':').map(Number);
      if (horas > 18) {
        erros.horaFim = 'Deve ser até 18:00';
      }

      // Validar duração (1h a 12h)
      const [inicioH, inicioM] = horaInicio.split(':').map(Number);
      const [fimH, fimM] = horaFim.split(':').map(Number);
      const duracao = (fimH + fimM / 60) - (inicioH + inicioM / 60);
      if (duracao < 1) {
        erros.horaFim = 'Duração mínima é 1 hora';
      } else if (duracao > 12) {
        erros.horaFim = 'Duração máxima é 12 horas';
      }
    }

    setErrors((prev) => ({ ...prev, ...erros }));
    return Object.keys(erros).length === 0;
  };

  // Validar datas (se recorrência = custom)
  const validarDatas = (): boolean => {
    if (recorrencia !== 'custom') return true;

    const erros: ValidationErrors = {};
    const hoje = new Date().toISOString().split('T')[0];

    if (!dataInicio) {
      erros.dataInicio = 'Data de início é obrigatória';
    } else if (dataInicio < hoje) {
      erros.dataInicio = 'Deve ser uma data futura';
    }

    if (!dataFim) {
      erros.dataFim = 'Data de fim é obrigatória';
    } else if (dataFim < dataInicio) {
      erros.dataFim = 'Deve ser após a data de início';
    } else {
      // Verificar se intervalo é <= 30 dias
      const difDias = Math.floor(
        (new Date(dataFim).getTime() - new Date(dataInicio).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (difDias > 30) {
        erros.dataFim = 'Intervalo máximo é 30 dias';
      }
    }

    setErrors((prev) => ({ ...prev, ...erros }));
    return Object.keys(erros).length === 0;
  };

  // Validar número de vagas
  const validarVagas = (): boolean => {
    const erros: ValidationErrors = {};

    if (!numeroVagas || numeroVagas.length === 0) {
      erros.numeroVagas = 'Número de vagas é obrigatório';
    } else {
      const vagas = numeroVagas[0];
      if (vagas <= 0) {
        erros.numeroVagas = 'Deve ser um número positivo';
      } else if (vagas > 10) {
        erros.numeroVagas = 'Máximo 10 vagas';
      }
    }

    setErrors((prev) => ({ ...prev, ...erros }));
    return Object.keys(erros).length === 0;
  };

  // Validar setores
  const validarSetores = (): boolean => {
    const erros: ValidationErrors = {};

    if (!todosSetores && setoresSelecionados.length === 0) {
      erros.setores = 'Selecione ao menos um setor';
    }

    setErrors((prev) => ({ ...prev, ...erros }));
    return Object.keys(erros).length === 0;
  };

  // Validar dias da semana (para recorrência custom)
  const validarDiasSemana = (): boolean => {
    const erros: ValidationErrors = {};

    if (recorrencia === 'custom' && diasSemana.length === 0) {
      erros.setores = 'Selecione ao menos um dia da semana para recorrência personalizada';
    }

    setErrors((prev) => ({ ...prev, ...erros }));
    return Object.keys(erros).length === 0;
  };

  // Validar formulário completo
  const validarFormulario = (): boolean => {
    const validHorarios = validarHorarios();
    const validDatas = validarDatas();
    const validVagas = validarVagas();
    const validSetores = validarSetores();
    const validDiasSemana = validarDiasSemana();

    return validHorarios && validDatas && validVagas && validSetores && validDiasSemana;
  };

  // Verificar se formulário está válido
  const isFormValid = useMemo(() => {
    const temErros = Object.keys(errors).length > 0;
    const camposPreenchidos =
      horaInicio && horaFim && numeroVagas.length > 0 && (todosSetores || setoresSelecionados.length > 0);

    if (recorrencia === 'custom') {
      return camposPreenchidos && dataInicio && dataFim && !temErros;
    }

    return camposPreenchidos && !temErros;
  }, [horaInicio, horaFim, numeroVagas, setoresSelecionados, todosSetores, dataInicio, dataFim, recorrencia, errors]);

  const handleToggleSetor = (setor: string) => {
    if (setoresSelecionados.includes(setor)) {
      setSetoresSelecionados(setoresSelecionados.filter(s => s !== setor));
    } else {
      setSetoresSelecionados([...setoresSelecionados, setor]);
    }
  };

  const handleTodosSetores = (checked: boolean) => {
    setTodosSetores(checked);
    if (checked) {
      setSetoresSelecionados(setoresDisponiveis.map(s => s.slug));
    } else {
      setSetoresSelecionados([]);
    }
  };

  const handleSalvar = async () => {
    // Validar formulário completo
    if (!validarFormulario()) {
      toast.error('Corrija os erros antes de salvar');
      return;
    }

    try {
      // Criar turno via hook
      await criarTurno({
        horaInicio,
        horaFim,
        vagasTotal: numeroVagas[0],
        setores: todosSetores ? setoresDisponiveis.map(s => s.slug) : setoresSelecionados,
        cor: corSelecionada,
        tipoRecorrencia: recorrencia,
        dataInicio: recorrencia === 'custom' ? dataInicio : undefined,
        dataFim: recorrencia === 'custom' ? dataFim : undefined,
        diasSemana: recorrencia === 'custom' ? diasSemana : undefined,
      });

      // Resetar formulário
      setHoraInicio('09:00');
      setHoraFim('11:00');
      setRecorrencia('uteis');
      setDataInicio('');
      setDataFim('');
      setDiasSemana([]);
      setNumeroVagas([5]);
      setCorSelecionada(coresTurno[0].valor);
      setSetoresSelecionados([]);
      setTodosSetores(false);
      setErrors({});

      // Callback de sucesso
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Erro ao criar turno. Tente novamente.');
      logger.error('Erro ao criar turno:', error);
    }
  };

  // Resetar errors ao fechar modal
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header com Gradiente */}
        <ModalHeaderPadrao
          title="Configurar Novo Turno"
          description="Configure os detalhes do turno para os funcionários."
          icon={Briefcase}
          theme="create"
        />

        <div className="space-y-6 p-6">
          {/* Horários */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Clock className="h-5 w-5 text-primary" />
              <span>Horários</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="horaInicio">Hora de Início</Label>
                <Input
                  id="horaInicio"
                  type="time"
                  value={horaInicio}
                  onChange={(e) => {
                    setHoraInicio(e.target.value);
                    setErrors((prev) => {
                      const novo = { ...prev };
                      delete novo.horaInicio;
                      return novo;
                    });
                  }}
                  className={errors.horaInicio ? 'border-destructive focus:border-destructive' : ''}
                />
                {errors.horaInicio && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.horaInicio}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaFim">Hora de Fim</Label>
                <Input
                  id="horaFim"
                  type="time"
                  value={horaFim}
                  onChange={(e) => {
                    setHoraFim(e.target.value);
                    setErrors((prev) => {
                      const novo = { ...prev };
                      delete novo.horaFim;
                      return novo;
                    });
                  }}
                  className={errors.horaFim ? 'border-destructive focus:border-destructive' : ''}
                />
                {errors.horaFim && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.horaFim}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recorrência */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Recorrência</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="todos" className="cursor-pointer font-normal">
                  Todos os dias
                </Label>
                <Switch
                  id="todos"
                  checked={recorrencia === 'todos'}
                  onCheckedChange={(checked) => checked && setRecorrencia('todos')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="uteis" className="cursor-pointer font-normal">
                  Dias úteis (Seg-Sex)
                </Label>
                <Switch
                  id="uteis"
                  checked={recorrencia === 'uteis'}
                  onCheckedChange={(checked) => checked && setRecorrencia('uteis')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="custom" className="cursor-pointer font-normal">
                  Definir datas
                </Label>
                <Switch
                  id="custom"
                  checked={recorrencia === 'custom'}
                  onCheckedChange={(checked) => checked && setRecorrencia('custom')}
                />
              </div>
            </div>

            {/* Campos de datas (aparecem apenas se "Definir datas" for selecionado) */}
            {recorrencia === 'custom' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data de Início</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => {
                      setDataInicio(e.target.value);
                      setErrors((prev) => {
                        const novo = { ...prev };
                        delete novo.dataInicio;
                        return novo;
                      });
                    }}
                    className={errors.dataInicio ? 'border-destructive focus:border-destructive' : ''}
                  />
                  {errors.dataInicio && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.dataInicio}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataFim">Data de Fim</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={dataFim}
                    onChange={(e) => {
                      setDataFim(e.target.value);
                      setErrors((prev) => {
                        const novo = { ...prev };
                        delete novo.dataFim;
                        return novo;
                      });
                    }}
                    className={errors.dataFim ? 'border-destructive focus:border-destructive' : ''}
                  />
                  {errors.dataFim && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.dataFim}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Seleção de Dias da Semana (apenas para custom) */}
            {recorrencia === 'custom' && (
              <div className="space-y-3 pt-2">
                <Label className="text-sm font-medium">Dias da Semana</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Dom', value: 0 },
                    { label: 'Seg', value: 1 },
                    { label: 'Ter', value: 2 },
                    { label: 'Qua', value: 3 },
                    { label: 'Qui', value: 4 },
                    { label: 'Sex', value: 5 },
                    { label: 'Sáb', value: 6 },
                  ].map((dia) => (
                    <div key={dia.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`dia-${dia.value}`}
                        checked={diasSemana.includes(dia.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setDiasSemana([...diasSemana, dia.value].sort());
                          } else {
                            setDiasSemana(diasSemana.filter(d => d !== dia.value));
                          }
                        }}
                      />
                      <Label
                        htmlFor={`dia-${dia.value}`}
                        className="cursor-pointer font-normal text-sm"
                      >
                        {dia.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {recorrencia === 'custom' && diasSemana.length === 0 && (
                  <p className="text-sm text-warning flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Selecione ao menos um dia da semana
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Número de Vagas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Users className="h-5 w-5 text-primary" />
                <span>Número de Vagas</span>
              </div>
              <span className="text-lg font-semibold text-primary">{numeroVagas[0]}</span>
            </div>
            <Slider
              value={numeroVagas}
              onValueChange={(value) => {
                setNumeroVagas(value);
                setErrors((prev) => {
                  const novo = { ...prev };
                  delete novo.numeroVagas;
                  return novo;
                });
              }}
              min={1}
              max={10}
              step={1}
              className={errors.numeroVagas ? 'border-destructive' : ''}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>10</span>
            </div>
            {errors.numeroVagas && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.numeroVagas}
              </p>
            )}
          </div>

          {/* Cor do Turno */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Palette className="h-5 w-5 text-primary" />
              <span>Cor do Turno</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              {coresTurno.map((cor) => (
                <button
                  key={cor.valor}
                  type="button"
                  onClick={() => setCorSelecionada(cor.valor)}
                  className={`
                    relative w-12 h-12 rounded-full transition-all
                    hover:scale-110 shadow-sm border-2
                    ${corSelecionada === cor.valor ? 'ring-2 ring-offset-2 ring-primary scale-110 border-transparent' : 'border-border'}
                  `}
                  style={{ backgroundColor: cor.valor }}
                  title={cor.nome}
                >
                  {corSelecionada === cor.valor && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Limitar Setores */}
          <div className={`space-y-4 p-5 rounded-xl ${errors.setores ? 'bg-destructive/10 border-2 border-destructive/20' : 'bg-muted border border-border'}`}>
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Briefcase className={`h-5 w-5 ${errors.setores ? 'text-destructive' : 'text-primary'}`} />
              <span className={errors.setores ? 'text-destructive' : ''}>Setores</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="todos-setores" className="cursor-pointer font-normal">
                  Todos
                </Label>
                <Switch
                  id="todos-setores"
                  checked={todosSetores}
                  onCheckedChange={(checked: boolean) => {
                    handleTodosSetores(checked);
                    setErrors((prev) => {
                      const novo = { ...prev };
                      delete novo.setores;
                      return novo;
                    });
                  }}
                />
              </div>
              {loadingSetores ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Carregando setores...
                </div>
              ) : (
                setoresDisponiveis.map((setor) => (
                  <div key={setor.id} className="flex items-center justify-between">
                    <Label htmlFor={setor.id} className="cursor-pointer font-normal">
                      {setor.nome}
                    </Label>
                    <Switch
                      id={setor.id}
                      checked={setoresSelecionados.includes(setor.slug)}
                      onCheckedChange={() => {
                        handleToggleSetor(setor.slug);
                        setErrors((prev) => {
                          const novo = { ...prev };
                          delete novo.setores;
                          return novo;
                        });
                      }}
                    />
                  </div>
                ))
              )}
            </div>
            {errors.setores && (
              <p className="text-sm text-destructive flex items-center gap-1 mt-2">
                <AlertCircle className="h-4 w-4" />
                {errors.setores}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 bg-muted/50 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={criando}
            className="px-6 hover:bg-muted"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            className="
              bg-primary hover:bg-primary/90
              text-primary-foreground px-8
              shadow-lg hover:shadow-xl
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
            disabled={criando || !isFormValid}
            title={!isFormValid ? 'Corrija os erros antes de salvar' : ''}
          >
            {criando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Turno'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}