import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';

interface SubEtapa {
  nome: string;
  m2: string;
  diasUteis: string;
  total: string;
}

interface EtapaPrincipal {
  nome: string;
  subetapas: SubEtapa[];
}

interface StepPrecificacaoProps {
  memorialData: {
    objetivo: string;
    etapasPrincipais: EtapaPrincipal[];
    planejamentoInicial: string;
    logisticaTransporte: string;
    preparacaoArea: string;
  };
  data: {
    percentualImprevisto?: string;
    percentualLucro?: string;
    percentualImposto?: string;
    percentualEntrada?: string;
    numeroParcelas?: string;
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export function StepPrecificacao({
  memorialData,
  data,
  onDataChange,
  readOnly = false,
}: StepPrecificacaoProps) {

  // Função para atualizar dados incluindo campos obrigatórios do schema
  const handleDataChange = (newData: any) => {
    // Sempre incluir os campos obrigatórios do schema da Etapa 8
    const completeData = {
      ...newData,
      materialCusto: calcularCustoBase().toFixed(2), // Custo base do memorial
      maoObraCusto: '0.00', // Mão-de-obra adicional (pode ser editada depois)
      precoFinal: calcularValorAtual().toFixed(2), // Valor calculado final
    };

    onDataChange(completeData);
  };
  // Calcular Custo Base do Memorial
  const calcularCustoBase = (): number => {
    if (!memorialData || !memorialData.etapasPrincipais) return 0;

    return memorialData.etapasPrincipais.reduce((total, etapa) => {
      return total + etapa.subetapas.reduce((subtotal, sub) => {
        return subtotal + (parseFloat(sub.total) || 0);
      }, 0);
    }, 0);
  };

  // Calcular Valor Atual (Total) com percentuais
  const calcularValorAtual = (): number => {
    const custoBase = calcularCustoBase();
    const imprevisto = parseFloat(data.percentualImprevisto || '0') || 0;
    const lucro = parseFloat(data.percentualLucro || '0') || 0;
    const imposto = parseFloat(data.percentualImposto || '0') || 0;

    // Fórmula: CustoBase * (1 + %Imprevisto/100 + %Lucro/100 + %Imposto/100)
    return custoBase * (1 + imprevisto / 100 + lucro / 100 + imposto / 100);
  };

  // Calcular Valor de Entrada
  const calcularValorEntrada = (): number => {
    const valorTotal = calcularValorAtual();
    const percentualEntrada = parseFloat(data.percentualEntrada || '0') || 0;
    return valorTotal * (percentualEntrada / 100);
  };

  // Calcular Valor de Cada Parcela
  const calcularValorParcela = (): number => {
    const valorTotal = calcularValorAtual();
    const valorEntrada = calcularValorEntrada();
    const numeroParcelas = parseFloat(data.numeroParcelas || '1') || 1;

    if (numeroParcelas === 0) return 0;
    return (valorTotal - valorEntrada) / numeroParcelas;
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Defina a precificação final com base nos custos do memorial. Os valores são calculados automaticamente.
        </AlertDescription>
      </Alert>

      {/* Custo Base */}
      <div className="space-y-2">
        <Label htmlFor="custoBase">Custo Base (Memorial)</Label>
        <Input
          id="custoBase"
          type="text"
          value={`R$ ${calcularCustoBase().toFixed(2).replace('.', ',')}`}
          disabled
          className="bg-muted text-lg"
        />
        <p className="text-xs text-muted-foreground">
          Soma automática de todos os valores das sub-etapas do memorial
        </p>
      </div>

      <Separator />


      {/* Percentuais e Valor Total */}
      <div className="space-y-4">
        <Label className="text-base">Percentuais e Valor Total</Label>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="percentualImprevisto">
              % Imprevisto
            </Label>
            <Input
              id="percentualImprevisto"
              type="number"
              value={data.percentualImprevisto || ''}
              onChange={(e) => !readOnly && handleDataChange({ ...data, percentualImprevisto: e.target.value })}
              placeholder="0"
              disabled={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="percentualLucro">
              % Lucro
            </Label>
            <Input
              id="percentualLucro"
              type="number"
              value={data.percentualLucro || ''}
              onChange={(e) => !readOnly && handleDataChange({ ...data, percentualLucro: e.target.value })}
              placeholder="0"
              disabled={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="percentualImposto">
              % Imposto
            </Label>
            <Input
              id="percentualImposto"
              type="number"
              value={data.percentualImposto || ''}
              onChange={(e) => !readOnly && handleDataChange({ ...data, percentualImposto: e.target.value })}
              placeholder="0"
              disabled={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valorAtual">Valor Atual (Total)</Label>
            <Input
              id="valorAtual"
              type="text"
              value={`R$ ${calcularValorAtual().toFixed(2).replace('.', ',')}`}
              disabled
              className="bg-success/5 border-success/20 text-lg font-medium"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Condições de Pagamento */}
      <div className="space-y-4">
        <Label className="text-base">Condições de Pagamento</Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="percentualEntrada">
              % Entrada <span className="text-destructive">*</span>
            </Label>
            <Input
              id="percentualEntrada"
              type="number"
              value={data.percentualEntrada}
              onChange={(e) => !readOnly && handleDataChange({ ...data, percentualEntrada: e.target.value })}
              placeholder="0"
              disabled={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numeroParcelas">
              Nº de Parcelas <span className="text-destructive">*</span>
            </Label>
            <Input
              id="numeroParcelas"
              type="number"
              value={data.numeroParcelas}
              onChange={(e) => !readOnly && handleDataChange({ ...data, numeroParcelas: e.target.value })}
              placeholder="0"
              disabled={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valorEntrada">Valor de Entrada (Calculado)</Label>
            <Input
              id="valorEntrada"
              type="text"
              value={`R$ ${calcularValorEntrada().toFixed(2).replace('.', ',')}`}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valorParcela">Valor de Cada Parcela (Calculado)</Label>
            <Input
              id="valorParcela"
              type="text"
              value={`R$ ${calcularValorParcela().toFixed(2).replace('.', ',')}`}
              disabled
              className="bg-muted"
            />
          </div>
        </div>
      </div>


      {/* Resumo Financeiro */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-base">Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Custo Base:</span>
            <span className="text-sm font-medium">R$ {calcularCustoBase().toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Valor Total da Proposta:</span>
            <span className="text-sm font-medium">R$ {calcularValorAtual().toFixed(2).replace('.', ',')}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Entrada:</span>
            <span className="text-sm font-medium">R$ {calcularValorEntrada().toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Parcelas:</span>
            <span className="text-sm font-medium">
              {data.numeroParcelas || 1}x de R$ {calcularValorParcela().toFixed(2).replace('.', ',')}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
