import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { useCreateTurno } from '../../lib/hooks/use-turnos';
import { Loader2, AlertCircle } from 'lucide-react';
import { useSetores } from '../../lib/hooks/use-setores';

interface ModalCriarTurnoProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const coresTurno = [
  { nome: 'Azul', valor: '#93C5FD' },
  { nome: 'Verde', valor: '#86EFAC' },
  { nome: 'Amarelo', valor: '#FDE047' },
  { nome: 'Rosa', valor: '#F9A8D4' },
  { nome: 'Roxo', valor: '#C4B5FD' },
  { nome: 'Dourado', valor: '#D3AF37' }
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
  const [numeroVagas, setNumeroVagas] = useState('5');
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

      // Validar duração (30 min a 4 horas)
      const [inicioH, inicioM] = horaInicio.split(':').map(Number);
      const [fimH, fimM] = horaFim.split(':').map(Number);
      const duracao = (fimH + fimM / 60) - (inicioH + inicioM / 60);
      if (duracao < 0.5) {
        erros.horaFim = 'Duração mínima é 30 minutos';
      } else if (duracao > 4) {
        erros.horaFim = 'Duração máxima é 4 horas';
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

    if (!numeroVagas) {
      erros.numeroVagas = 'Número de vagas é obrigatório';
    } else {
      const vagas = parseInt(numeroVagas);
      if (isNaN(vagas) || vagas <= 0) {
        erros.numeroVagas = 'Deve ser um número positivo';
      } else if (vagas > 50) {
        erros.numeroVagas = 'Máximo 50 vagas';
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

  // Validar formulário completo
  const validarFormulario = (): boolean => {
    const validHorarios = validarHorarios();
    const validDatas = validarDatas();
    const validVagas = validarVagas();
    const validSetores = validarSetores();

    return validHorarios && validDatas && validVagas && validSetores;
  };

  // Verificar se formulário está válido
  const isFormValid = useMemo(() => {
    const temErros = Object.keys(errors).length > 0;
    const camposPreenchidos =
      horaInicio && horaFim && numeroVagas && (todosSetores || setoresSelecionados.length > 0);

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
        vagasTotal: parseInt(numeroVagas),
        setores: todosSetores ? setoresDisponiveis.map(s => s.slug) : setoresSelecionados,
        cor: corSelecionada,
        tipoRecorrencia: recorrencia,
        dataInicio: recorrencia === 'custom' ? dataInicio : undefined,
        dataFim: recorrencia === 'custom' ? dataFim : undefined,
      });

      // Resetar formulário
      setHoraInicio('09:00');
      setHoraFim('11:00');
      setRecorrencia('uteis');
      setDataInicio('');
      setDataFim('');
      setNumeroVagas('5');
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Novo Turno</DialogTitle>
          <DialogDescription>
            Configure os detalhes do turno para os funcionários.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Horários */}
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
                className={errors.horaInicio ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.horaInicio && (
                <p className="text-sm text-red-500 flex items-center gap-1">
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
                className={errors.horaFim ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.horaFim && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.horaFim}
                </p>
              )}
            </div>
          </div>

          {/* Recorrência */}
          <div className="space-y-3">
            <Label>Recorrência</Label>
            <RadioGroup value={recorrencia} onValueChange={(v: any) => setRecorrencia(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="todos" id="todos" />
                <Label htmlFor="todos" className="cursor-pointer font-normal">
                  Todos os dias
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="uteis" id="uteis" />
                <Label htmlFor="uteis" className="cursor-pointer font-normal">
                  Dias úteis (Seg-Sex)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="cursor-pointer font-normal">
                  Definir datas
                </Label>
              </div>
            </RadioGroup>

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
                    className={errors.dataInicio ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors.dataInicio && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
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
                    className={errors.dataFim ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors.dataFim && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.dataFim}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Número de Vagas */}
          <div className="space-y-2">
            <Label htmlFor="numeroVagas">Número de Vagas</Label>
            <Input
              id="numeroVagas"
              type="number"
              min="1"
              max="50"
              value={numeroVagas}
              onChange={(e) => {
                setNumeroVagas(e.target.value);
                setErrors((prev) => {
                  const novo = { ...prev };
                  delete novo.numeroVagas;
                  return novo;
                });
              }}
              className={`max-w-[150px] ${errors.numeroVagas ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            {errors.numeroVagas && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.numeroVagas}
              </p>
            )}
          </div>

          {/* Cor do Turno */}
          <div className="space-y-3">
            <Label>Cor do Turno</Label>
            <div className="flex gap-3">
              {coresTurno.map((cor) => (
                <button
                  key={cor.valor}
                  type="button"
                  onClick={() => setCorSelecionada(cor.valor)}
                  className={`
                    w-12 h-12 rounded-lg border-2 transition-all
                    ${corSelecionada === cor.valor ? 'border-neutral-900 scale-110' : 'border-neutral-300'}
                  `}
                  style={{ backgroundColor: cor.valor }}
                  title={cor.nome}
                />
              ))}
            </div>
          </div>

          {/* Limitar Setores */}
          <div className={`space-y-3 p-4 rounded-lg ${errors.setores ? 'bg-red-50 border border-red-200' : 'bg-neutral-50'}`}>
            <Label className={errors.setores ? 'text-red-700' : ''}>Limitar Setores</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="todos-setores"
                  checked={todosSetores}
                  onCheckedChange={(checked: boolean | string) => {
                    handleTodosSetores(checked === true);
                    setErrors((prev) => {
                      const novo = { ...prev };
                      delete novo.setores;
                      return novo;
                    });
                  }}
                />
                <Label htmlFor="todos-setores" className="cursor-pointer font-normal">
                  Todos
                </Label>
              </div>
              {loadingSetores ? (
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Carregando setores...
                </div>
              ) : (
                setoresDisponiveis.map((setor) => (
                  <div key={setor.id} className="flex items-center space-x-2">
                    <Checkbox
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
                    <Label htmlFor={setor.id} className="cursor-pointer font-normal">
                      {setor.nome}
                    </Label>
                  </div>
                ))
              )}
            </div>
            {errors.setores && (
              <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
                <AlertCircle className="h-4 w-4" />
                {errors.setores}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={criando}>
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
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