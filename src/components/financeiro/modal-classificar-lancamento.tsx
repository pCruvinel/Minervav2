import { useState } from 'react';
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
import { Trash2, Plus, Tags, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { useCategoriasFinanceiras } from '@/lib/hooks/use-categorias-financeiras';
import { useCentroCusto } from '@/lib/hooks/use-centro-custo';
import { useEffect } from 'react';

const SETORES = [
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'obras', label: 'Obras' },
  { value: 'assessoria', label: 'Assessoria' },
  { value: 'diretoria', label: 'Diretoria' },
  { value: 'ti', label: 'TI' },
];

interface RateioItem {
  id: string;
  centroCusto: string; // ID do CC
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
    categoriaId: string;
    setor: string;
    rateios: RateioItem[];
    anexoNF?: string;
  }) => void;
  onAbrirCustoFlutuante?: () => void;
}

export function ModalClassificarLancamento({
  open,
  onClose,
  lancamento,
  onSalvar,
}: ModalClassificarLancamentoProps) {
  const { data: categorias = [] } = useCategoriasFinanceiras(lancamento?.tipo === 'ENTRADA' ? 'receber' : 'pagar');
  const { listCentrosCusto } = useCentroCusto();
  const [centrosCusto, setCentrosCusto] = useState<{ id: string; nome: string }[]>([]);

  const [categoriaIdSelecionada, setCategoriaIdSelecionada] = useState('');
  const [setorSelecionado, setSetorSelecionado] = useState('');
  const [rateios, setRateios] = useState<RateioItem[]>([
    { id: '1', centroCusto: '', valor: lancamento?.valor || 0, percentual: 100 }
  ]);

  useEffect(() => {
    if (open) {
      listCentrosCusto().then(setCentrosCusto);
    }
  }, [open, listCentrosCusto]);

  // Reset inputs when modal closes or opens new methods
  useEffect(() => {
    if (open && lancamento) {
        setRateios([{ id: '1', centroCusto: '', valor: lancamento.valor || 0, percentual: 100 }]);
    }
  }, [open, lancamento]);

  // Auto-preencher setor quando categoria é selecionada
  useEffect(() => {
    if (categoriaIdSelecionada) {
      const categoriaSelecionada = categorias.find(cat => cat.id === categoriaIdSelecionada);
      if (categoriaSelecionada?.setor_padrao?.slug) {
        setSetorSelecionado(categoriaSelecionada.setor_padrao.slug);
      }
    }
  }, [categoriaIdSelecionada, categorias]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

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

  const handleAtualizarRateio = (id: string, campo: 'centroCusto' | 'valor' | 'percentual', valor: string | number) => {
    setRateios(rateios.map(r => {
      if (r.id === id) {
        if (campo === 'percentual') {
          const percentual = typeof valor === 'string' ? parseFloat(valor) || 0 : valor;
          const valorCalculado = (lancamento?.valor || 0) * (percentual / 100);
          return { ...r, percentual, valor: valorCalculado };
        } else if (campo === 'valor') {
          const valorNum = typeof valor === 'string' ? parseFloat(valor) || 0 : valor;
          const percentual = ((valorNum / (lancamento?.valor || 1)) * 100);
          return { ...r, valor: valorNum, percentual };
        } else {
          return { ...r, [campo]: String(valor) };
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
  const isRateioValido = Math.abs(totalPercentual - 100) < 0.1 && Math.abs(totalValor - (lancamento?.valor || 0)) < 0.1;

  const handleSalvar = () => {
    if (!categoriaIdSelecionada || !setorSelecionado) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!isRateioValido) {
      toast.error('A soma dos rateios deve ser igual a 100% do valor total');
      return;
    }

    onSalvar({
      categoriaId: categoriaIdSelecionada,
      setor: setorSelecionado,
      rateios: rateios,
    });

    // Reset handled by effect or parent logic generally
    setCategoriaIdSelecionada('');
    setSetorSelecionado('');
  };

  if (!lancamento) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
              <Tags className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">Classificar Lançamento</DialogTitle>
              <DialogDescription className="text-xs">
                Defina categoria, setor e distribuição por centro de custo
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Card de Informações do Lançamento */}
          <div className={`relative overflow-hidden rounded-xl border ${
            lancamento.tipo === 'ENTRADA' 
              ? 'bg-success/5 border-success/20' 
              : 'bg-destructive/5 border-destructive/20'
          }`}>
            <div className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {lancamento.tipo === 'ENTRADA' ? (
                      <ArrowDownRight className="h-4 w-4 text-success" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-destructive" />
                    )}
                    <Badge variant="outline" className={`text-[10px] ${
                      lancamento.tipo === 'ENTRADA' 
                        ? 'border-success/30 text-success bg-success/10' 
                        : 'border-destructive/30 text-destructive bg-destructive/10'
                    }`}>
                      {lancamento.tipo === 'ENTRADA' ? 'Crédito' : 'Débito'}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm truncate" title={lancamento.descricao}>
                    {lancamento.descricao}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Valor</p>
                  <p className={`text-xl font-semibold tabular-nums ${
                    lancamento.tipo === 'ENTRADA' ? 'text-success' : 'text-destructive'
                  }`}>
                    {lancamento.tipo === 'ENTRADA' ? '+' : '-'}{formatCurrency(lancamento.valor)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Custo (Categoria) *</Label>
              <Select value={categoriaIdSelecionada} onValueChange={setCategoriaIdSelecionada}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria..." />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nome}
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

          {/* Rateio por Centro de Custo */}
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
              {rateios.map((rateio) => (
                <div key={rateio.id} className="flex gap-2 items-start p-3 bg-background rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div className="col-span-1 space-y-1">
                      <Label className="text-xs">Centro de Custo</Label>
                      <Select 
                        value={rateio.centroCusto} 
                        onValueChange={(val) => handleAtualizarRateio(rateio.id, 'centroCusto', val)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecione o CC..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {centrosCusto.map(cc => (
                            <SelectItem key={cc.id} value={cc.id}>
                              {cc.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Percentual (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        className="h-9"
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
                        className="h-9"
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
                      <Trash2 className="h-4 w-4 text-destructive" />
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
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Rateado:</span>
                <div className="flex gap-4">
                  <Badge variant={isRateioValido ? 'default' : 'destructive'}>
                    {totalPercentual.toFixed(2)}%
                  </Badge>
                  <span className={`font-medium ${isRateioValido ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(totalValor)}
                  </span>
                </div>
              </div>
              {!isRateioValido && (
                <p className="text-xs text-destructive mt-2">
                  A soma deve ser exatamente 100% ({formatCurrency(lancamento.valor)})
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            disabled={!categoriaIdSelecionada || !setorSelecionado || !isRateioValido}
          >
            Salvar Classificação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
