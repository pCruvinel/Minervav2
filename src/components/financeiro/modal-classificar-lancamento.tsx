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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Trash2, Plus, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface RateioItem {
  id: string;
  centroCusto: string;
  valor: number;
  percentual: number;
}

interface ModalClassificarLancamentoProps {
  open: boolean;
  onClose: () => void;
  lancamento: {
    id: string;
    descricao: string;
    valor: number;
    tipo: 'ENTRADA' | 'SAIDA';
  } | null;
  onSalvar: (dados: {
    tipo: string;
    setor: string;
    rateios: RateioItem[];
    anexoNF?: string;
  }) => void;
  onAbrirCustoFlutuante?: () => void;
}

const TIPOS_CUSTO = [
  { value: 'MAO_DE_OBRA', label: 'Mão de Obra' },
  { value: 'MATERIAL', label: 'Material' },
  { value: 'EQUIPAMENTO', label: 'Equipamento' },
  { value: 'APLICACAO', label: 'Aplicação' },
  { value: 'ESCRITORIO', label: 'Escritório' },
  { value: 'IMPOSTOS', label: 'Impostos' },
  { value: 'OUTROS', label: 'Outros' },
];

const SETORES = [
  { value: 'ADM', label: 'Administrativo' },
  { value: 'OBRAS', label: 'Obras' },
  { value: 'ASSESSORIA_TECNICA', label: 'Assessoria Técnica' },
];

export function ModalClassificarLancamento({
  open,
  onClose,
  lancamento,
  onSalvar,
  onAbrirCustoFlutuante,
}: ModalClassificarLancamentoProps) {
  const [tipoSelecionado, setTipoSelecionado] = useState('');
  const [setorSelecionado, setSetorSelecionado] = useState('');
  const [rateios, setRateios] = useState<RateioItem[]>([
    { id: '1', centroCusto: '', valor: lancamento?.valor || 0, percentual: 100 }
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Validações e regras de negócio
  const isTipoAplicacao = tipoSelecionado === 'APLICACAO';
  const isTipoEscritorio = tipoSelecionado === 'ESCRITORIO';
  const isTipoMaoDeObra = tipoSelecionado === 'MAO_DE_OBRA';
  const isSetorObras = setorSelecionado === 'OBRAS';
  
  // Bloquear CC se: Escritório OU (Setor Obras E Mão de Obra)
  const bloquearCentroCusto = isTipoEscritorio || (isSetorObras && isTipoMaoDeObra);

  const handleAdicionarRateio = () => {
    const novoRateio: RateioItem = {
      id: Date.now().toString(),
      centroCusto: '',
      valor: 0,
      percentual: 0
    };
    setRateios([...rateios, novoRateio]);
  };

  const handleRemoverRateio = (id: string) => {
    if (rateios.length > 1) {
      setRateios(rateios.filter(r => r.id !== id));
    }
  };

  const handleAtualizarRateio = (id: string, campo: 'centroCusto' | 'valor' | 'percentual', valor: any) => {
    setRateios(rateios.map(r => {
      if (r.id === id) {
        if (campo === 'percentual') {
          const percentual = parseFloat(valor) || 0;
          const valorCalculado = (lancamento?.valor || 0) * (percentual / 100);
          return { ...r, percentual, valor: valorCalculado };
        } else if (campo === 'valor') {
          const valorNum = parseFloat(valor) || 0;
          const percentual = ((valorNum / (lancamento?.valor || 1)) * 100);
          return { ...r, valor: valorNum, percentual };
        } else {
          return { ...r, [campo]: valor };
        }
      }
      return r;
    }));
  };

  const handleDistribuirIgualmente = () => {
    const percentualPorItem = 100 / rateios.length;
    const valorPorItem = (lancamento?.valor || 0) / rateios.length;
    
    setRateios(rateios.map(r => ({
      ...r,
      percentual: percentualPorItem,
      valor: valorPorItem
    })));
  };

  const totalPercentual = rateios.reduce((acc, r) => acc + r.percentual, 0);
  const totalValor = rateios.reduce((acc, r) => acc + r.valor, 0);
  const isRateioValido = Math.abs(totalPercentual - 100) < 0.01 && Math.abs(totalValor - (lancamento?.valor || 0)) < 0.01;

  const handleSalvar = () => {
    if (!tipoSelecionado || !setorSelecionado) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (isTipoAplicacao) {
      toast.error('Lançamentos do tipo "Aplicação" devem ser desprezados e não classificados.');
      return;
    }

    if (!bloquearCentroCusto && !isRateioValido) {
      toast.error('A soma dos rateios deve ser igual a 100% do valor total');
      return;
    }

    // Se for Mão de Obra, acionar modal de Custo Flutuante
    if (isTipoMaoDeObra && onAbrirCustoFlutuante) {
      onAbrirCustoFlutuante();
      return;
    }

    onSalvar({
      tipo: tipoSelecionado,
      setor: setorSelecionado,
      rateios: bloquearCentroCusto ? [{ ...rateios[0], centroCusto: 'N/A - Bloqueado' }] : rateios,
    });

    // Reset
    setTipoSelecionado('');
    setSetorSelecionado('');
    setRateios([{ id: '1', centroCusto: '', valor: lancamento?.valor || 0, percentual: 100 }]);
  };

  if (!lancamento) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Classificar Lançamento</DialogTitle>
          <DialogDescription>
            Classifique o lançamento selecionando tipo, setor e centro(s) de custo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Lançamento */}
          <div className="bg-neutral-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Descrição</p>
                <p className="font-medium">{lancamento.descricao}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className={`text-xl font-medium ${lancamento.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(lancamento.valor)}
                </p>
              </div>
            </div>
          </div>

          {/* Classificação Básica */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Custo *</Label>
              <Select value={tipoSelecionado} onValueChange={setTipoSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_CUSTO.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Setor *</Label>
              <Select value={setorSelecionado} onValueChange={setSetorSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor..." />
                </SelectTrigger>
                <SelectContent>
                  {SETORES.map(setor => (
                    <SelectItem key={setor.value} value={setor.value}>
                      {setor.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Alertas de Regras de Negócio */}
          {isTipoAplicacao && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Lançamentos do tipo "Aplicação" devem ser desprezados e não devem ser classificados no sistema.
              </AlertDescription>
            </Alert>
          )}

          {bloquearCentroCusto && !isTipoAplicacao && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Regra de Negócio:</strong> Para o tipo "{TIPOS_CUSTO.find(t => t.value === tipoSelecionado)?.label}" 
                {isSetorObras && ' no setor "Obras"'}, o campo Centro de Custo será bloqueado automaticamente.
              </AlertDescription>
            </Alert>
          )}

          {isTipoMaoDeObra && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Próxima Etapa:</strong> Após salvar, você será redirecionado para classificar este custo como 
                Custo Flutuante (EPI, Bônus) ou Custo Geral (Salário).
              </AlertDescription>
            </Alert>
          )}

          {/* Rateio por Centro de Custo */}
          {!bloquearCentroCusto && !isTipoAplicacao && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Rateio por Centro de Custo</Label>
                {rateios.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDistribuirIgualmente}
                  >
                    Distribuir Igualmente
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {rateios.map((rateio, index) => (
                  <div key={rateio.id} className="flex gap-2 items-start p-3 bg-neutral-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div className="col-span-1 space-y-1">
                        <Label className="text-xs">Centro de Custo</Label>
                        <Input
                          placeholder="Digite o CC..."
                          value={rateio.centroCusto}
                          onChange={(e) => handleAtualizarRateio(rateio.id, 'centroCusto', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Percentual (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={rateio.percentual.toFixed(2)}
                          onChange={(e) => handleAtualizarRateio(rateio.id, 'percentual', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Valor (R$)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={rateio.valor.toFixed(2)}
                          onChange={(e) => handleAtualizarRateio(rateio.id, 'valor', e.target.value)}
                        />
                      </div>
                    </div>
                    {rateios.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoverRateio(rateio.id)}
                        className="mt-6"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAdicionarRateio}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Centro de Custo
              </Button>

              {/* Totalizadores */}
              <div className="bg-neutral-100 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Rateado:</span>
                  <div className="flex gap-4">
                    <Badge variant={isRateioValido ? 'default' : 'destructive'}>
                      {totalPercentual.toFixed(2)}%
                    </Badge>
                    <span className={`font-medium ${isRateioValido ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(totalValor)}
                    </span>
                  </div>
                </div>
                {!isRateioValido && (
                  <p className="text-xs text-red-600 mt-2">
                    A soma deve ser exatamente 100% ({formatCurrency(lancamento.valor)})
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSalvar}
            disabled={!tipoSelecionado || !setorSelecionado || isTipoAplicacao || (!bloquearCentroCusto && !isRateioValido)}
          >
            {isTipoMaoDeObra ? 'Prosseguir para Custo Flutuante' : 'Salvar Classificação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
