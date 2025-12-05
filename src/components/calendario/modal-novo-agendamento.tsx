import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '../ui/dialog';
import { ModalHeaderPadrao } from '../ui/modal-header-padrao';
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
import { Calendar, Clock, Loader2, Tag, Briefcase } from 'lucide-react';
import { logger } from '@/lib/utils/logger';
import { useCreateAgendamento, useVerificarDisponibilidade } from '@/lib/hooks/use-agendamentos';
import { useSetores } from '@/lib/hooks/use-setores';
import { useTurnoHorariosDisponiveis } from '@/lib/hooks/use-turno-horarios';
import { HorarioSelector } from './horario-selector';


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
  'Visita Semanal',
  'Vistoria Final'
];

/**
 * ModalNovoAgendamento - Modal redesenhado para criação de agendamentos
 *
 * Novo design UX:
 * - Seleção visual de horários (grid interativo)
 * - Duração fixa de 1 hora
 * - Setor condicional (só aparece se múltiplos setores)
 * - Categoria obrigatória
 * - Resumo do agendamento
 */
export function ModalNovoAgendamento({ open, onClose, turno, dia, onSuccess }: ModalNovoAgendamentoProps) {
  const [categoria, setCategoria] = useState('');
  const [setor, setSetor] = useState('');
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);

  const { mutate: criarAgendamento, loading: criando } = useCreateAgendamento();
  const { setores: setoresDisponiveis, loading: loadingSetores } = useSetores();
  const verificarDisponibilidade = useVerificarDisponibilidade();

  // NOVO: Hook para buscar horários disponíveis/ocupados
  const dataFormatada = dia ? dia.toISOString().split('T')[0] : '';
  const { slots, loading: loadingSlots } = useTurnoHorariosDisponiveis(
    turno?.id,
    dataFormatada,
    turno?.horaInicio,
    turno?.horaFim
  );

  // Resetar campos quando modal abrir
  useEffect(() => {
    if (open) {
      setCategoria('');
      setSetor('');
      setHorarioSelecionado(null);
    }
  }, [open]);

  // Auto-selecionar setor se houver apenas um
  useEffect(() => {
    if (turno?.setores?.length === 1) {
      setSetor(turno.setores[0]);
    }
  }, [turno]);

  // Calcular horário de fim automaticamente (sempre 1 hora)
  const calcularHorarioFim = () => {
    if (!horarioSelecionado) return '--:--';
    const [h] = horarioSelecionado.split(':').map(Number);
    return `${String(h + 1).padStart(2, '0')}:00`;
  };

  // Validação simplificada
  const isFormValid = useMemo(() => {
    return !!(
      categoria &&
      (turno?.setores?.length === 1 || setor) &&  // Setor opcional se único
      horarioSelecionado
    );
  }, [categoria, setor, horarioSelecionado, turno]);

  const formatarDataCompleta = (data: Date) => {
    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleConfirmar = async () => {
    if (!isFormValid) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!turno?.id) {
      toast.error('Turno inválido');
      return;
    }

    try {
      const horarioFim = calcularHorarioFim();
      const dataFormatadaISO = dia.toISOString().split('T')[0];

      logger.log('Criando agendamento:', {
        turnoId: turno.id,
        data: dataFormatadaISO,
        horarioInicio: horarioSelecionado,
        horarioFim,
        categoria,
        setor: setor || turno.setores[0],
      });

      // Verificar disponibilidade antes de criar
      const disponivel = await verificarDisponibilidade(
        turno.id,
        dataFormatadaISO,
        horarioSelecionado!,
        horarioFim
      );

      if (!disponivel) {
        toast.error('Não há vagas disponíveis neste horário');
        return;
      }

      // Criar agendamento via hook
      await criarAgendamento({
        turnoId: turno.id,
        data: dataFormatadaISO,
        horarioInicio: horarioSelecionado!,
        horarioFim,
        duracaoHoras: 1,  // Sempre 1 hora
        categoria,
        setor: setor || turno.setores[0],  // Usar único se não selecionado
      });

      toast.success('Agendamento criado com sucesso!');

      // Resetar campos
      setCategoria('');
      setSetor('');
      setHorarioSelecionado(null);

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
    setHorarioSelecionado(null);
    onClose();
  };

  if (!turno) return null;

  // Verificar se há múltiplos setores
  const temMultiplosSetores = turno.setores && turno.setores.length > 1;

  return (
    <Dialog open={open} onOpenChange={handleFechar}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <ModalHeaderPadrao
          title="Novo Agendamento"
          description="Selecione o horário e preencha os detalhes"
          icon={Calendar}
          theme="confirm"
        />

        <div className="space-y-6 p-6">
          {/* Informações do Turno */}
          <div className="bg-muted/30 rounded-xl p-4 space-y-2 border border-border/50">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {formatarDataCompleta(dia)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                Turno: {turno.horaInicio} - {turno.horaFim}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Vagas disponíveis: {turno.vagasTotal - turno.vagasOcupadas} de {turno.vagasTotal}
            </div>
          </div>

          {/* NOVO: Seletor de Horário Visual */}
          {loadingSlots ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Carregando horários disponíveis...
              </span>
            </div>
          ) : (
            <HorarioSelector
              slots={slots}
              horarioSelecionado={horarioSelecionado}
              onSelect={setHorarioSelecionado}
            />
          )}

          {/* Setor - Só aparece se múltiplos */}
          {temMultiplosSetores && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <Label htmlFor="setor" className="font-medium">
                  Setor *
                </Label>
              </div>
              <Select value={setor} onValueChange={setSetor} disabled={loadingSetores}>
                <SelectTrigger id="setor">
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
            </div>
          )}

          {/* Categoria */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              <Label htmlFor="categoria" className="font-medium">
                Categoria *
              </Label>
            </div>
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

          {/* Resumo do Agendamento */}
          {horarioSelecionado && categoria && (
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Resumo do Agendamento
              </h4>
              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {horarioSelecionado} - {calcularHorarioFim()} (1 hora)
                </p>
                <p className="flex items-center gap-2">
                  <Tag className="h-3 w-3" />
                  {categoria}
                </p>
                {(setor || turno.setores?.length === 1) && (
                  <p className="flex items-center gap-2">
                    <Briefcase className="h-3 w-3" />
                    Setor: {setor || turno.setores[0]}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-muted/30 border-t border-border/50">
          <Button
            variant="outline"
            onClick={handleFechar}
            disabled={criando}
            className="px-6 hover:bg-muted/50"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            className="px-8 bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200"
            disabled={criando || !isFormValid}
            title={!isFormValid ? 'Preencha todos os campos obrigatórios' : ''}
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
