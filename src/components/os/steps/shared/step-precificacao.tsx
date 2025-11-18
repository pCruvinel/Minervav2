import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Separator } from '../../../ui/separator';
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
  etapa8Data: {
    objetivo: string;
    etapasPrincipais: EtapaPrincipal[];
    planejamentoInicial: string;
    logisticaTransporte: string;
    preparacaoArea: string;
  };
  etapa9Data: {
    percentualImprevisto: string;
    percentualLucro: string;
    percentualImposto: string;
    percentualEntrada: string;
    numeroParcelas: string;
  };
  onEtapa9DataChange: (data: any) => void;
}

export function StepPrecificacao({
  etapa8Data,
  etapa9Data,
  onEtapa9DataChange,
}: StepPrecificacaoProps) {
  // Calcular Custo Base do Memorial
  const calcularCustoBase = (): number => {
    return etapa8Data.etapasPrincipais.reduce((total, etapa) => {
      return total + etapa.subetapas.reduce((subtotal, sub) => {
        return subtotal + (parseFloat(sub.total) || 0);
      }, 0);
    }, 0);
  };

  // Calcular Valor Atual (Total) com percentuais
  const calcularValorAtual = (): number => {
    const custoBase = calcularCustoBase();
    const imprevisto = parseFloat(etapa9Data.percentualImprevisto) || 0;
    const lucro = parseFloat(etapa9Data.percentualLucro) || 0;
    const imposto = parseFloat(etapa9Data.percentualImposto) || 0;

    // Fórmula: CustoBase * (1 + %Imprevisto/100 + %Lucro/100 + %Imposto/100)
    return custoBase * (1 + imprevisto / 100 + lucro / 100 + imposto / 100);
  };

  // Calcular Valor de Entrada
  const calcularValorEntrada = (): number => {
    const valorTotal = calcularValorAtual();
    const percentualEntrada = parseFloat(etapa9Data.percentualEntrada) || 0;
    return valorTotal * (percentualEntrada / 100);
  };

  // Calcular Valor de Cada Parcela
  const calcularValorParcela = (): number => {
    const valorTotal = calcularValorAtual();
    const valorEntrada = calcularValorEntrada();
    const numeroParcelas = parseFloat(etapa9Data.numeroParcelas) || 1;
    
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
          className="bg-neutral-100 text-lg"
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
              % Imprevisto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="percentualImprevisto"
              type="number"
              value={etapa9Data.percentualImprevisto}
              onChange={(e) => onEtapa9DataChange({ ...etapa9Data, percentualImprevisto: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="percentualLucro">
              % Lucro <span className="text-destructive">*</span>
            </Label>
            <Input
              id="percentualLucro"
              type="number"
              value={etapa9Data.percentualLucro}
              onChange={(e) => onEtapa9DataChange({ ...etapa9Data, percentualLucro: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="percentualImposto">
              % Imposto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="percentualImposto"
              type="number"
              value={etapa9Data.percentualImposto}
              onChange={(e) => onEtapa9DataChange({ ...etapa9Data, percentualImposto: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valorAtual">Valor Atual (Total)</Label>
            <Input
              id="valorAtual"
              type="text"
              value={`R$ ${calcularValorAtual().toFixed(2).replace('.', ',')}`}
              disabled
              className="bg-green-50 border-green-200 text-lg font-medium"
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
              value={etapa9Data.percentualEntrada}
              onChange={(e) => onEtapa9DataChange({ ...etapa9Data, percentualEntrada: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numeroParcelas">
              Nº de Parcelas <span className="text-destructive">*</span>
            </Label>
            <Input
              id="numeroParcelas"
              type="number"
              value={etapa9Data.numeroParcelas}
              onChange={(e) => onEtapa9DataChange({ ...etapa9Data, numeroParcelas: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valorEntrada">Valor de Entrada (Calculado)</Label>
            <Input
              id="valorEntrada"
              type="text"
              value={`R$ ${calcularValorEntrada().toFixed(2).replace('.', ',')}`}
              disabled
              className="bg-neutral-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valorParcela">Valor de Cada Parcela (Calculado)</Label>
            <Input
              id="valorParcela"
              type="text"
              value={`R$ ${calcularValorParcela().toFixed(2).replace('.', ',')}`}
              disabled
              className="bg-neutral-100"
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
              {etapa9Data.numeroParcelas}x de R$ {calcularValorParcela().toFixed(2).replace('.', ',')}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
