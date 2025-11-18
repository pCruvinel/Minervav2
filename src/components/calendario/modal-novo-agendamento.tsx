import React, { useState, useEffect } from 'react';
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
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { useCreateAgendamento, useVerificarDisponibilidade } from '../../lib/hooks/use-agendamentos';

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

const setores = ['Assessoria', 'Comercial', 'Obras'];

export function ModalNovoAgendamento({ open, onClose, turno, dia, onSuccess }: ModalNovoAgendamentoProps) {
  const [categoria, setCategoria] = useState('');
  const [setor, setSetor] = useState('');
  const [horarioInicio, setHorarioInicio] = useState('');
  const [duracao, setDuracao] = useState('1');

  const { mutate: criarAgendamento, loading: criando } = useCreateAgendamento();
  const verificarDisponibilidade = useVerificarDisponibilidade();

  // Resetar horário de início quando o modal abrir
  useEffect(() => {
    if (open && turno) {
      setHorarioInicio(turno.horaInicio);
    }
  }, [open, turno]);

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

  const validarHorario = () => {
    if (!turno) return null;
    
    const [horaInicio] = horarioInicio.split(':').map(Number);
    const [horaInicioTurno] = turno.horaInicio.split(':').map(Number);
    const [horaFimTurno] = turno.horaFim.split(':').map(Number);
    const horaFim = horaInicio + parseInt(duracao);
    
    if (horaInicio < horaInicioTurno || horaInicio >= horaFimTurno) {
      return 'O horário de início deve estar dentro do turno';
    }
    
    if (horaFim > horaFimTurno) {
      return 'O agendamento ultrapassa o horário de fim do turno';
    }
    
    return null;
  };

  const handleConfirmar = async () => {
    // Validações
    if (!categoria) {
      toast.error('Selecione uma categoria');
      return;
    }

    if (!setor) {
      toast.error('Selecione um setor');
      return;
    }

    if (!horarioInicio) {
      toast.error('Selecione o horário de início');
      return;
    }

    const erroHorario = validarHorario();
    if (erroHorario) {
      toast.error(erroHorario);
      return;
    }

    // Validar se o setor está permitido no turno
    if (turno && !turno.setores.includes(setor)) {
      toast.error(`O setor ${setor} não está permitido neste turno`);
      return;
    }

    if (!turno?.id) {
      toast.error('Turno inválido');
      return;
    }

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

    // Callback de sucesso
    onSuccess?.();
    onClose();
  };

  const handleFechar = () => {
    setCategoria('');
    setSetor('');
    setHorarioInicio('');
    setDuracao('1');
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

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger id="categoria">
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
          </div>

          {/* Setor */}
          <div className="space-y-2">
            <Label htmlFor="setor">Setor *</Label>
            <Select value={setor} onValueChange={setSetor}>
              <SelectTrigger id="setor">
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                {setores
                  .filter(s => turno.setores.includes(s)) // Filtrar apenas setores permitidos
                  .map((set) => (
                    <SelectItem key={set} value={set}>
                      {set}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-neutral-600">
              Setores permitidos: {turno.setores.join(', ')}
            </p>
          </div>

          {/* Horário de Início */}
          <div className="space-y-2">
            <Label htmlFor="horarioInicio">Horário de Início *</Label>
            <Select value={horarioInicio} onValueChange={setHorarioInicio}>
              <SelectTrigger id="horarioInicio">
                <SelectValue placeholder="Selecione o horário de início" />
              </SelectTrigger>
              <SelectContent>
                {gerarHorariosDisponiveis().map((hora) => (
                  <SelectItem key={hora} value={hora}>
                    {hora}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duração */}
          <div className="space-y-2">
            <Label htmlFor="duracao">Duração (horas) *</Label>
            <Select value={duracao} onValueChange={setDuracao}>
              <SelectTrigger id="duracao">
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
          </div>

          {/* Preview do Horário Calculado */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-neutral-600">Horário do agendamento</p>
                  <p className="font-medium">
                    {horarioInicio} - {calcularHorarioFim()}
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
          <Button onClick={handleConfirmar} className="bg-primary hover:bg-primary/90" disabled={criando}>
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