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
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Info, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { useDiasUteisMes } from '@/lib/hooks/use-dias-uteis';

interface ModalCustoFlutuanteProps {
  open: boolean;
  onClose: () => void;
  lancamento: {
    id: string;
    descricao: string;
    valor: number;
  } | null;
  onSalvar: (dados: {
    colaboradorId: string;
    tipoCusto: 'CUSTO_FLUTUANTE' | 'CUSTO_GERAL';
    categoriaCusto?: 'EPI' | 'BONUS' | 'SALARIO' | 'OUTROS';
    recalcularCustoDia: boolean;
  }) => void;
}

// Mock de colaboradores - Em produção virá do Supabase
const mockColaboradores = [
  { id: 'col-1', nome: 'João Silva', cargo: 'Pedreiro', custoDiaAtual: 180.00 },
  { id: 'col-2', nome: 'Maria Santos', cargo: 'Engenheira Civil', custoDiaAtual: 450.00 },
  { id: 'col-3', nome: 'Pedro Oliveira', cargo: 'Auxiliar de Obras', custoDiaAtual: 120.00 },
  { id: 'col-4', nome: 'Ana Costa', cargo: 'Arquiteta', custoDiaAtual: 380.00 },
];

const TIPOS_CUSTO = [
  { value: 'CUSTO_GERAL', label: 'Custo Geral (Salário)' },
  { value: 'CUSTO_FLUTUANTE', label: 'Custo Flutuante (EPI, Bônus, etc.)' },
];

const CATEGORIAS_FLUTUANTE = [
  { value: 'EPI', label: 'EPI - Equipamento de Proteção Individual' },
  { value: 'BONUS', label: 'Bônus / Gratificação' },
  { value: 'OUTROS', label: 'Outros Custos Flutuantes' },
];

export function ModalCustoFlutuante({
  open,
  onClose,
  lancamento,
  onSalvar,
}: ModalCustoFlutuanteProps) {
  const [colaboradorId, setColaboradorId] = useState('');
  const now = new Date();
  const { data: diasUteisMes = 22 } = useDiasUteisMes(now.getFullYear(), now.getMonth() + 1);
  const [tipoCusto, setTipoCusto] = useState<'CUSTO_FLUTUANTE' | 'CUSTO_GERAL' | ''>('');
  const [categoriaCusto, setCategoriaCusto] = useState<'EPI' | 'BONUS' | 'SALARIO' | 'OUTROS' | ''>('');

  const colaboradorSelecionado = mockColaboradores.find(c => c.id === colaboradorId);
  const isCustoFlutuante = tipoCusto === 'CUSTO_FLUTUANTE';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Simulação de recálculo do Custo-Dia
  const calcularNovoCustoDia = () => {
    if (!colaboradorSelecionado || !lancamento) return 0;

    // Fórmula simplificada: Custo Atual + (Valor Lançamento / dias_úteis_mes)
    const incrementoPorDia = lancamento.valor / diasUteisMes;
    return colaboradorSelecionado.custoDiaAtual + incrementoPorDia;
  };

  const novoCustoDia = isCustoFlutuante ? calcularNovoCustoDia() : colaboradorSelecionado?.custoDiaAtual || 0;
  const diferencaCustoDia = isCustoFlutuante && colaboradorSelecionado
    ? novoCustoDia - colaboradorSelecionado.custoDiaAtual
    : 0;

  const handleSalvar = () => {
    if (!colaboradorId || !tipoCusto) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (isCustoFlutuante && !categoriaCusto) {
      toast.error('Selecione a categoria do custo flutuante');
      return;
    }

    onSalvar({
      colaboradorId,
      tipoCusto: tipoCusto as 'CUSTO_FLUTUANTE' | 'CUSTO_GERAL',
      categoriaCusto: categoriaCusto as 'EPI' | 'BONUS' | 'SALARIO' | 'OUTROS',
      recalcularCustoDia: isCustoFlutuante,
    });

    // Reset
    setColaboradorId('');
    setTipoCusto('');
    setCategoriaCusto('');
  };

  if (!lancamento) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Custo Flutuante - Mão de Obra</DialogTitle>
          <DialogDescription>
            Classifique o custo de mão de obra e associe a um colaborador específico
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Lançamento */}
          <div className="bg-background p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Descrição do Lançamento</p>
                <p className="font-medium">{lancamento.descricao}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-xl font-medium text-destructive">
                  {formatCurrency(lancamento.valor)}
                </p>
              </div>
            </div>
          </div>

          {/* Seleção de Colaborador */}
          <div className="space-y-2">
            <Label>Colaborador *</Label>
            <Select value={colaboradorId} onValueChange={setColaboradorId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o colaborador..." />
              </SelectTrigger>
              <SelectContent>
                {mockColaboradores.map(colaborador => (
                  <SelectItem key={colaborador.id} value={colaborador.id}>
                    {colaborador.nome} - {colaborador.cargo} (Custo/Dia: {formatCurrency(colaborador.custoDiaAtual)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Custo */}
          <div className="space-y-2">
            <Label>Tipo de Custo *</Label>
            <Select value={tipoCusto} onValueChange={(value) => setTipoCusto(value as 'CUSTO_FLUTUANTE' | 'CUSTO_GERAL')}>
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

          {/* Categoria do Custo Flutuante */}
          {isCustoFlutuante && (
            <div className="space-y-2">
              <Label>Categoria do Custo Flutuante *</Label>
              <Select value={categoriaCusto} onValueChange={(value) => setCategoriaCusto(value as 'EPI' | 'BONUS' | 'SALARIO' | 'OUTROS')}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_FLUTUANTE.map(categoria => (
                    <SelectItem key={categoria.value} value={categoria.value}>
                      {categoria.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Alerta de Custo Geral */}
          {tipoCusto === 'CUSTO_GERAL' && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Custo Geral (Salário):</strong> Este custo será contabilizado como despesa geral de folha de pagamento
                e não afetará o cálculo do Custo-Dia do colaborador.
              </AlertDescription>
            </Alert>
          )}

          {/* Cálculo do Novo Custo-Dia */}
          {isCustoFlutuante && colaboradorSelecionado && (
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Recálculo de Custo-Dia</h4>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atenção:</strong> Custos flutuantes (EPI, Bônus) são incorporados ao Custo-Dia do colaborador,
                  impactando o custo de alocação em obras futuras.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Custo-Dia Atual</p>
                  <p className="text-lg font-medium">{formatCurrency(colaboradorSelecionado.custoDiaAtual)}</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Incremento</p>
                  <p className="text-lg font-medium text-warning">+{formatCurrency(diferencaCustoDia)}</p>
                </div>
                <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary">
                  <p className="text-xs text-muted-foreground mb-1">Novo Custo-Dia</p>
                  <p className="text-lg font-medium text-primary">{formatCurrency(novoCustoDia)}</p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground mt-3 space-y-1">
                <p>📌 <strong>Fórmula:</strong> Custo-Dia Novo = Custo-Dia Atual + (Valor Lançamento ÷ 22 dias úteis)</p>
                <p>📌 Cálculo: {formatCurrency(colaboradorSelecionado.custoDiaAtual)} + ({formatCurrency(lancamento.valor)} ÷ 22) = {formatCurrency(novoCustoDia)}</p>
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
            disabled={!colaboradorId || !tipoCusto || (isCustoFlutuante && !categoriaCusto)}
          >
            Salvar e Recalcular
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
