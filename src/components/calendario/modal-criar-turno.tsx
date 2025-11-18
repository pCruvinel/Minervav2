import React, { useState } from 'react';
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

interface ModalCriarTurnoProps {
  open: boolean;
  onClose: () => void;
}

const coresTurno = [
  { nome: 'Azul', valor: '#93C5FD' },
  { nome: 'Verde', valor: '#86EFAC' },
  { nome: 'Amarelo', valor: '#FDE047' },
  { nome: 'Rosa', valor: '#F9A8D4' },
  { nome: 'Roxo', valor: '#C4B5FD' },
  { nome: 'Dourado', valor: '#D3AF37' }
];

const setoresDisponiveis = ['Assessoria', 'Comercial', 'Obras'];

export function ModalCriarTurno({ open, onClose }: ModalCriarTurnoProps) {
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFim, setHoraFim] = useState('11:00');
  const [recorrencia, setRecorrencia] = useState<'todos' | 'uteis' | 'definir'>('uteis');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [numeroVagas, setNumeroVagas] = useState('5');
  const [corSelecionada, setCorSelecionada] = useState(coresTurno[0].valor);
  const [setoresSelecionados, setSetoresSelecionados] = useState<string[]>([]);
  const [todosSetores, setTodosSetores] = useState(false);

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
      setSetoresSelecionados(setoresDisponiveis);
    } else {
      setSetoresSelecionados([]);
    }
  };

  const handleSalvar = () => {
    // Validações
    if (!horaInicio || !horaFim) {
      toast.error('Preencha os horários de início e fim');
      return;
    }

    if (recorrencia === 'definir' && (!dataInicio || !dataFim)) {
      toast.error('Preencha as datas de início e fim');
      return;
    }

    if (!numeroVagas || parseInt(numeroVagas) <= 0) {
      toast.error('Número de vagas deve ser maior que zero');
      return;
    }

    if (setoresSelecionados.length === 0) {
      toast.error('Selecione pelo menos um setor');
      return;
    }

    // Aqui você faria a chamada para API/Supabase para salvar o turno
    console.log('Salvando turno:', {
      horaInicio,
      horaFim,
      recorrencia,
      dataInicio: recorrencia === 'definir' ? dataInicio : null,
      dataFim: recorrencia === 'definir' ? dataFim : null,
      numeroVagas: parseInt(numeroVagas),
      cor: corSelecionada,
      setores: setoresSelecionados
    });

    toast.success('Turno configurado com sucesso!');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
                onChange={(e) => setHoraInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horaFim">Hora de Fim</Label>
              <Input
                id="horaFim"
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
              />
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
                <RadioGroupItem value="definir" id="definir" />
                <Label htmlFor="definir" className="cursor-pointer font-normal">
                  Definir datas
                </Label>
              </div>
            </RadioGroup>

            {/* Campos de datas (aparecem apenas se "Definir datas" for selecionado) */}
            {recorrencia === 'definir' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data de Início (dd-mm-aa)</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataFim">Data de Fim (dd-mm-aa)</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
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
              value={numeroVagas}
              onChange={(e) => setNumeroVagas(e.target.value)}
              className="max-w-[150px]"
            />
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
          <div className="space-y-3">
            <Label>Limitar Setores</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="todos-setores"
                  checked={todosSetores}
                  onCheckedChange={handleTodosSetores}
                />
                <Label htmlFor="todos-setores" className="cursor-pointer font-normal">
                  Todos
                </Label>
              </div>
              {setoresDisponiveis.map((setor) => (
                <div key={setor} className="flex items-center space-x-2">
                  <Checkbox
                    id={setor}
                    checked={setoresSelecionados.includes(setor)}
                    onCheckedChange={() => handleToggleSetor(setor)}
                  />
                  <Label htmlFor={setor} className="cursor-pointer font-normal">
                    {setor}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} className="bg-primary hover:bg-primary/90">
            Salvar Turno
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}