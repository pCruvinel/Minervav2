/**
 * Step de Precificação para Assessoria (OS 5-6)
 * 
 * Versão simplificada onde o Custo Base é editável manualmente
 * (não calculado automaticamente a partir de sub-etapas)
 */

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, DollarSign } from 'lucide-react';

// Função para formatar valores monetários no padrão brasileiro (R$ 30.000,00)
const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(valor);
};

// Função para parsear valor monetário string para número
const parseMoeda = (valor: string): number => {
    if (!valor) return 0;
    // Remove R$, pontos e substitui vírgula por ponto
    const cleaned = valor
        .replace(/R\$\s?/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
    return parseFloat(cleaned) || 0;
};

interface StepPrecificacaoAssessoriaProps {
    data: {
        custoBase?: string;
        percentualImposto?: string;
        percentualEntrada?: string;
        numeroParcelas?: string;
        observacoesFinanceiras?: string;
    };
    onDataChange: (data: any) => void;
    readOnly?: boolean;
}

export function StepPrecificacaoAssessoria({
    data,
    onDataChange,
    readOnly = false,
}: StepPrecificacaoAssessoriaProps) {
    // Ref para controlar se já sincronizamos os dados iniciais
    const hasInitialized = useRef(false);

    // Parsear custo base
    const custoBase = parseMoeda(data.custoBase || '0');
    const percentualImposto = parseFloat(data.percentualImposto || '14') || 14;
    const percentualEntrada = parseFloat(data.percentualEntrada || '40') || 40;
    const numeroParcelas = parseInt(data.numeroParcelas || '2') || 2;

    // Calcular valores
    const valorImposto = custoBase * (percentualImposto / 100);
    const valorTotal = custoBase + valorImposto;
    const valorEntrada = valorTotal * (percentualEntrada / 100);
    const valorRemanescente = valorTotal - valorEntrada;
    const valorParcela = numeroParcelas > 0 ? valorRemanescente / numeroParcelas : 0;

    // Sincronizar valores padrão quando componente monta
    // Isso garante que os dados sejam salvos mesmo se o usuário não editar nada
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;

            // Se não há dados, inicializar com padrões
            const shouldInitialize = !data.percentualImposto || !data.percentualEntrada || !data.numeroParcelas;

            if (shouldInitialize) {
                const initialData = {
                    custoBase: data.custoBase || '',
                    percentualImposto: data.percentualImposto || '14',
                    percentualEntrada: data.percentualEntrada || '40',
                    numeroParcelas: data.numeroParcelas || '2',
                    valorImposto: valorImposto.toFixed(2),
                    valorTotal: valorTotal.toFixed(2),
                    valorEntrada: valorEntrada.toFixed(2),
                    valorParcela: valorParcela.toFixed(2),
                };
                onDataChange(initialData);
            }
        }
    }, [data, onDataChange, valorImposto, valorTotal, valorEntrada, valorParcela]);

    // Handler para mudanças
    const handleChange = (field: string, value: string) => {
        onDataChange({
            ...data,
            [field]: value,
            // Sempre recalcular valores calculados
            valorImposto: valorImposto.toFixed(2),
            valorTotal: valorTotal.toFixed(2),
            valorEntrada: valorEntrada.toFixed(2),
            valorParcela: valorParcela.toFixed(2),
        });
    };

    return (
        <div className="space-y-6">
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Defina o valor do serviço e as condições de pagamento. O imposto é calculado automaticamente.
                </AlertDescription>
            </Alert>

            {/* Custo Base - EDITÁVEL */}
            <Card className="border-primary/30">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Valor do Serviço
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="custoBase" className="text-base">
                            Custo Base <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                            <Input
                                id="custoBase"
                                type="text"
                                value={data.custoBase || ''}
                                onChange={(e) => {
                                    // Permitir apenas números, vírgula e ponto
                                    const value = e.target.value.replace(/[^\d,.]/g, '');
                                    handleChange('custoBase', value);
                                }}
                                placeholder="0,00"
                                disabled={readOnly}
                                className="pl-10 text-lg font-medium"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Informe o valor parcial do serviço (antes dos impostos)
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="percentualImposto">% Imposto (ISS/NFSe)</Label>
                            <Input
                                id="percentualImposto"
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={data.percentualImposto || '14'}
                                onChange={(e) => handleChange('percentualImposto', e.target.value)}
                                placeholder="14"
                                disabled={readOnly}
                            />
                            <p className="text-xs text-muted-foreground">
                                Padrão: 14%
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="valorImposto">Valor do Imposto</Label>
                            <Input
                                id="valorImposto"
                                type="text"
                                value={formatarMoeda(valorImposto)}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                    </div>

                    {/* Total com Impostos */}
                    <Card className="bg-success/10 border-success/30">
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Valor Total (com impostos):</span>
                                <span className="text-xl font-bold text-success">
                                    {formatarMoeda(valorTotal)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>

            <Separator />

            {/* Condições de Pagamento */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Condições de Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="percentualEntrada">
                                % de Entrada <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="percentualEntrada"
                                type="number"
                                min="0"
                                max="100"
                                value={data.percentualEntrada || '40'}
                                onChange={(e) => handleChange('percentualEntrada', e.target.value)}
                                placeholder="40"
                                disabled={readOnly}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="numeroParcelas">
                                Nº de Parcelas (Valor Remanescente) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="numeroParcelas"
                                type="number"
                                min="1"
                                max="48"
                                value={data.numeroParcelas || '2'}
                                onChange={(e) => handleChange('numeroParcelas', e.target.value)}
                                placeholder="2"
                                disabled={readOnly}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="valorEntrada">Valor de Entrada</Label>
                            <Input
                                id="valorEntrada"
                                type="text"
                                value={formatarMoeda(valorEntrada)}
                                disabled
                                className="bg-muted"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="valorParcela">Valor de Cada Parcela</Label>
                            <Input
                                id="valorParcela"
                                type="text"
                                value={formatarMoeda(valorParcela)}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Resumo Financeiro */}
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-base">Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Custo Base:</span>
                        <span className="text-sm font-medium">{formatarMoeda(custoBase)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Impostos ({percentualImposto}%):</span>
                        <span className="text-sm font-medium">{formatarMoeda(valorImposto)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <span className="text-sm font-medium">Valor Total:</span>
                        <span className="text-sm font-bold text-primary">{formatarMoeda(valorTotal)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Entrada ({percentualEntrada}%):</span>
                        <span className="text-sm font-medium">{formatarMoeda(valorEntrada)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Parcelamento:</span>
                        <span className="text-sm font-medium">
                            {numeroParcelas}x de {formatarMoeda(valorParcela)}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
