import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { Calendar, Clock, Loader2, AlertCircle, Shield } from 'lucide-react';
import { logger } from '../../lib/utils/logger';
import { useCreateAgendamento, useVerificarDisponibilidade } from '../../lib/hooks/use-agendamentos';
import { useSetores } from '../../lib/hooks/use-setores';

interface ModalNovoAgendamentoProps {
  open: boolean;
  onClose: () => void;
  turno: any;
  dia: Date;
  onSuccess?: () => void;
}

const categorias = [
  'Vistoria Inicial',
  'Apresentação de Proposta',
  'Vistoria Técnica',
  'Visita Semanal'
];



interface ValidationErrors {
  categoria?: string;
  setor?: string;
  horarioInicio?: string;
  duracao?: string;
}

export function ModalNovoAgendamento({ open, onClose, turno, dia, onSuccess }: ModalNovoAgendamentoProps) {
  const [categoria, setCategoria] = useState('');
  const [setor, setSetor] = useState('');
  const [horarioInicio, setHorarioInicio] = useState('');
  const [duracao, setDuracao] = useState('1');
  const [errors, setErrors] = useState<ValidationErrors>({});

  const { mutate: criarAgendamento, loading: criando } = useCreateAgendamento();
  const { setores: setoresDisponiveis, loading: loadingSetores } = useSetores();
  const verificarDisponibilidade = useVerificarDisponibilidade();

  // Resetar horário de início quando o modal abrir
  useEffect(() => {
    if (open && turno) {
      setHorarioInicio(turno.horaInicio);
      setErrors({});
    }
  }, [open, turno]);

  // Validar categoria
  const validarCategoria = (): boolean => {
    const erros: ValidationErrors = {};

    if (!categoria) {
      erros.categoria = 'Selecione uma categoria';
    } else if (!categorias.includes(categoria)) {
      erros.categoria = 'Categoria inválida';
    }

    setErrors((prev) => ({ ...prev, ...erros }));
    return Object.keys(erros).length === 0;
  };

  // Validar setor
  const validarSetor = (): boolean => {
    const erros: ValidationErrors = {};

    if (!setor) {
      erros.setor = 'Selecione um setor';
    } else if (!turno?.setores?.includes(setor)) {
      erros.setor = `O setor ${setor} não está permitido neste turno`;
    }

    setErrors((prev) => ({ ...prev, ...erros }));
    return Object.keys(erros).length === 0;
  };

  // Validar horário de início
  const validarHorarioInicio = (): boolean => {
    const erros: ValidationErrors = {};

    if (!horarioInicio) {
      erros.horarioInicio = 'Selecione o horário de início';
    } else if (!turno) {
      erros.horarioInicio = 'Turno inválido';
    } else {
      const [horaInicio] = horarioInicio.split(':').map(Number);
      const [horaInicioTurno] = turno.horaInicio.split(':').map(Number);
      const [horaFimTurno] = turno.horaFim.split(':').map(Number);

      if (horaInicio < horaInicioTurno || horaInicio >= horaFimTurno) {
        erros.horarioInicio = 'O horário deve estar dentro do turno';
      }
    }

    setErrors((prev) => ({ ...prev, ...erros }));
    return Object.keys(erros).length === 0;
  };

  // Validar duração
  const validarDuracao = (): boolean => {
    const erros: ValidationErrors = {};

    if (!duracao) {
      erros.duracao = 'Selecione a duração';
    } else if (!turno || !horarioInicio) {
      // Skip se turno ou horário não estiverem prontos
      return true;
    } else {
      const durationValue = parseInt(duracao);
      const [horaInicio] = horarioInicio.split(':').map(Number);
      const [horaFimTurno] = turno.horaFim.split(':').map(Number);
      const horaFimAgendamento = horaInicio + durationValue;

      if (horaFimAgendamento > horaFimTurno) {
        erros.duracao = `Duração máxima é ${horaFimTurno - horaInicio}h para este horário`;
      }
    }

    setErrors((prev) => ({ ...prev, ...erros }));
    return Object.keys(erros).length === 0;
  };

  // Validar formulário completo
  const validarFormulario = (): boolean => {
    const validCategoria = validarCategoria();
    const validSetor = validarSetor();
    const validHorarioInicio = validarHorarioInicio();
    const validDuracao = validarDuracao();

    return validCategoria && validSetor && validHorarioInicio && validDuracao;
  };

  // Verificar se formulário está válido para o submit button
  const isFormValid = useMemo(() => {
    const temErros = Object.keys(errors).length > 0;
    const camposPreenchidos = categoria && setor && horarioInicio && duracao;
    return camposPreenchidos && !temErros;
  }, [categoria, setor, horarioInicio, duracao, errors]);

  const formatarData = (data: Date) => {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = String(data.getFullYear()).slice(-2);
    return `${dia}-${mes}-${ano}`;
  };

  const calcularHorarioFim = () => {
    if (!horarioInicio) return '--:--';
    const [horas, minutos] = horarioInicio.split(':').map(Number);
    const horaFim = horas + parseInt(duracao);
    return `${String(horaFim).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
  };

  // Gerar horários disponíveis dentro do turno
  const gerarHorariosDisponiveis = () => {
    if (!turno) return [];

    const [horaInicio] = turno.horaInicio.split(':').map(Number);
    const [horaFim] = turno.horaFim.split(':').map(Number);

    const horarios = [];
    for (let h = horaInicio; h < horaFim; h++) {
      horarios.push(`${String(h).padStart(2, '0')}:00`);
    }
    return horarios;
  };

  // Gerar durações disponíveis baseado no horário de início selecionado
  const gerarDuracoesDisponiveis = () => {
    if (!turno || !horarioInicio) return [1];

    const [horaInicio] = horarioInicio.split(':').map(Number);
    const [horaFimTurno] = turno.horaFim.split(':').map(Number);

    const maxDuracao = horaFimTurno - horaInicio;
    const duracoes = [];

    for (let d = 1; d <= maxDuracao; d++) {
      duracoes.push(d);
    }
    return duracoes;
  };



  const handleConfirmar = async () => {
    // Validar formulário completo
    if (!validarFormulario()) {
      toast.error('Corrija os erros antes de confirmar');
      return;
    }

    if (!turno?.id) {
      toast.error('Turno inválido');
      return;
    }

    try {
      const horarioFim = calcularHorarioFim();
      const dataFormatada = dia.toISOString().split('T')[0];

      // Verificar disponibilidade antes de criar
      const disponivel = await verificarDisponibilidade(
        turno.id,
        dataFormatada,
        horarioInicio,
        horarioFim
      );

      if (!disponivel) {
        toast.error('Não há vagas disponíveis neste horário');
        return;
      }

      // Criar agendamento via hook
      await criarAgendamento({
        turnoId: turno.id,
        data: dataFormatada,
        horarioInicio,
        horarioFim,
        duracaoHoras: parseInt(duracao),
        categoria,
        setor,
      });

      // Resetar campos
      setCategoria('');
      setSetor('');
      setHorarioInicio('');
      setDuracao('1');
      setErrors({});

      // Callback de sucesso
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Erro ao criar agendamento. Tente novamente.');
      logger.error('Erro ao criar agendamento:', error);
    }
  };

  const handleFechar = () => {
    setCategoria('');
    setSetor('');
    setHorarioInicio('');
    setDuracao('1');
    setErrors({});
    onClose();
  };

  if (!turno) return null;

  return (
    <Dialog open={open} onOpenChange={handleFechar}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Confirme os detalhes do agendamento para o turno selecionado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Confirmação do Turno */}
          <div className="bg-neutral-100 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-neutral-600" />
              <span>
                Data: {formatarData(dia)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-neutral-600" />
              <span>
                Turno Selecionado: {turno.horaInicio} - {turno.horaFim}
              </span>
            </div>
            <div className="text-sm text-neutral-600">
              Vagas disponíveis: {turno.vagasTotal - turno.vagasOcupadas} de {turno.vagasTotal}
            </div>
          </div>

          {/* Mensagem de restrição de setores */}
          {turno.setores && turno.setores.length < 10 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800 mb-1">
                    Este horário é exclusivo
                  </h4>
                  <p className="text-sm text-amber-700">
                    Setores permitidos: <strong>{turno.setores.join(', ')}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Categoria */}
            <div className={`space-y-2 p-3 rounded-lg ${errors.categoria ? 'bg-red-50 border border-red-200' : ''}`}>
              <Label htmlFor="categoria" className={errors.categoria ? 'text-red-700' : ''}>
                Categoria *
              </Label>
              <Select value={categoria} onValueChange={(value: string) => {
                setCategoria(value);
                setErrors((prev) => {
                  const novo = { ...prev };
                  delete novo.categoria;
                  return novo;
                });
              }}>
                <SelectTrigger id="categoria" className={errors.categoria ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoria && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.categoria}
                </p>
              )}
            </div>

            {/* Setor */}
            <div className={`space-y-2 p-3 rounded-lg ${errors.setor ? 'bg-red-50 border border-red-200' : ''}`}>
              <Label htmlFor="setor" className={errors.setor ? 'text-red-700' : ''}>
                Setor *
              </Label>
              <Select value={setor} onValueChange={(value: string) => {
                setSetor(value);
                setErrors((prev) => {
                  const novo = { ...prev };
                  delete novo.setor;
                  return novo;
                });
              }} disabled={loadingSetores}>
                <SelectTrigger id="setor" className={errors.setor ? 'border-red-500' : ''}>
                  <SelectValue placeholder={loadingSetores ? "Carregando..." : "Selecione o setor"} />
                </SelectTrigger>
                <SelectContent>
                  {setoresDisponiveis
                    .filter(s => turno.setores.includes(s.slug))
                    .map((set) => (
                      <SelectItem key={set.id} value={set.slug}>
                        {set.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {/* <p className="text-xs text-neutral-600">
                Setores permitidos: {turno.setores.join(', ')}
              </p> */}
              {errors.setor && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.setor}
                </p>
              )}
            </div>

            {/* Horário de Início */}
            <div className={`space-y-2 p-3 rounded-lg ${errors.horarioInicio ? 'bg-red-50 border border-red-200' : ''}`}>
              <Label htmlFor="horarioInicio" className={errors.horarioInicio ? 'text-red-700' : ''}>
                Horário de Início *
              </Label>
              <Select value={horarioInicio} onValueChange={(value: string) => {
                setHorarioInicio(value);
                setErrors((prev) => {
                  const novo = { ...prev };
                  delete novo.horarioInicio;
                  return novo;
                });
              }}>
                <SelectTrigger id="horarioInicio" className={errors.horarioInicio ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  {gerarHorariosDisponiveis().map((hora) => (
                    <SelectItem key={hora} value={hora}>
                      {hora}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.horarioInicio && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.horarioInicio}
                </p>
              )}
            </div>

            {/* Duração */}
            <div className={`space-y-2 p-3 rounded-lg ${errors.duracao ? 'bg-red-50 border border-red-200' : ''}`}>
              <Label htmlFor="duracao" className={errors.duracao ? 'text-red-700' : ''}>
                Duração (horas) *
              </Label>
              <Select value={duracao} onValueChange={(value: string) => {
                setDuracao(value);
                setErrors((prev) => {
                  const novo = { ...prev };
                  delete novo.duracao;
                  return novo;
                });
              }}>
                <SelectTrigger id="duracao" className={errors.duracao ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a duração" />
                </SelectTrigger>
                <SelectContent>
                  {gerarDuracoesDisponiveis().map((d) => (
                    <SelectItem key={d} value={`${d}`}>
                      {`${d}h`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.duracao && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.duracao}
                </p>
              )}
            </div>
          </div>

          {/* Preview do Horário Calculado */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-neutral-600">Horário do agendamento</p>
                  <p className="font-medium">
                    {horarioInicio ? `${horarioInicio} - ${calcularHorarioFim()}` : '--:--'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-600">Duração</p>
                <p className="font-medium">{duracao}h</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleFechar} disabled={criando}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={criando || !isFormValid}
            title={!isFormValid ? 'Corrija os erros antes de confirmar' : ''}
          >
            {criando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirmando...
              </>
            ) : (
              'Confirmar Agendamento'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}