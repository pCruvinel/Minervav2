import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ModalNovaContaProps {
  open: boolean;
  onClose: () => void;
  onSalvar: (dados: any) => void;
}

export function ModalNovaConta({ open, onClose, onSalvar }: ModalNovaContaProps) {
  const [favorecido, setFavorecido] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [recorrente, setRecorrente] = useState(false);
  const [categoria, setCategoria] = useState('');

  const handleSalvar = () => {
    if (!favorecido || !descricao || !valor || !vencimento) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    onSalvar({
      favorecido,
      descricao,
      valor,
      vencimento,
      recorrente,
      categoria,
    });

    // Reset
    setFavorecido('');
    setDescricao('');
    setValor('');
    setVencimento('');
    setRecorrente(false);
    setCategoria('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Conta Manual</DialogTitle>
          <DialogDescription>
            Cadastre uma nova conta fixa ou despesa variável (Ex: Aluguel, Energia, Internet)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Favorecido (Fornecedor) *</Label>
            <Input
              placeholder="Nome do favorecido..."
              value={favorecido}
              onChange={(e) => setFavorecido(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Textarea
              placeholder="Ex: Aluguel Escritório - Dez/2024"
              rows={2}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALUGUEL">Aluguel</SelectItem>
                <SelectItem value="ENERGIA">Energia Elétrica</SelectItem>
                <SelectItem value="AGUA">Água</SelectItem>
                <SelectItem value="INTERNET">Internet</SelectItem>
                <SelectItem value="TELEFONE">Telefone</SelectItem>
                <SelectItem value="MATERIAIS">Materiais</SelectItem>
                <SelectItem value="SERVICOS">Serviços</SelectItem>
                <SelectItem value="OUTROS">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Vencimento *</Label>
              <Input
                type="date"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="recorrente"
              checked={recorrente}
              onCheckedChange={(checked) => setRecorrente(checked as boolean)}
            />
            <label
              htmlFor="recorrente"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Esta é uma conta recorrente (mensal)
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar}>Salvar Conta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
