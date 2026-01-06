/**
 * Step de Precificação para Assessoria (OS 5-6)
 * 
 * Versão simplificada onde o Custo Base é editável manualmente
 * (não calculado automaticamente a partir de sub-etapas)
 * Atualizado para incluir Imprevisto e Lucro configuráveis.
 */

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, DollarSign } from 'lucide-react';
import { usePrecificacaoConfig } from '@/lib/hooks/use-precificacao-config';

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
        percentualImprevisto?: string;
        percentualLucro?: string;
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
    // ------------------------------------------------------
    // Integração com Configurações Dinâmicas
    // ------------------------------------------------------
    const { configs, isLoading: isLoadingConfig } = usePrecificacaoConfig('OS-05-06');
    const hasInitialized = useRef(false);

    // Parsear valores
    const custoBase = parseMoeda(data.custoBase || '0');
    const percentualImprevisto = parseFloat(data.percentualImprevisto || '0') || 0;
    const percentualLucro = parseFloat(data.percentualLucro || '0') || 0;
    const percentualImposto = parseFloat(data.percentualImposto || '0') || 0;
    const percentualEntrada = parseFloat(data.percentualEntrada || '40') || 40;
    const numeroParcelas = parseInt(data.numeroParcelas || '2') || 2;

    // Helper para buscar config
    const getConfig = (campo: string) => configs.find(c => c.campo_nome === campo);

    // Inicializar valores padrão da config
    useEffect(() => {
        if (!isLoadingConfig && configs.length > 0 && !hasInitialized.current) {
            hasInitialized.current = true;

            const imprevistoConfig = getConfig('percentual_imprevisto');
            const lucroConfig = getConfig('percentual_lucro');
            const impostoConfig = getConfig('percentual_imposto');

            const updates: any = {};
            let hasUpdates = false;

            // Só aplica padrão se o valor não existir no data
            if (!data.percentualImprevisto && imprevistoConfig) {
                updates.percentualImprevisto = imprevistoConfig.valor_padrao.toString();
                hasUpdates = true;
            }
            if (!data.percentualLucro && lucroConfig) {
                updates.percentualLucro = lucroConfig.valor_padrao.toString();
                hasUpdates = true;
            }
            if (!data.percentualImposto && impostoConfig) {
                updates.percentualImposto = impostoConfig.valor_padrao.toString();
                hasUpdates = true;
            }

            // Garantir defaults de entrada/parcelas se não existirem
            if (!data.percentualEntrada) {
                updates.percentualEntrada = '40';
                hasUpdates = true;
            }
            if (!data.numeroParcelas) {
                updates.numeroParcelas = '2';
                hasUpdates = true;
            }

            if (hasUpdates) {
                // Ao atualizar defaults, precisamos recalcular os totais
                // Mas o handleChange já fará isso quando os valores mudarem via update
                // Como estamos atualizando via parent, passamos o objeto completo
                const mergedData = { ...data, ...updates };
                const newCusto = parseMoeda(mergedData.custoBase || '0');
                const newImp = parseFloat(mergedData.percentualImprevisto || '0');
                const newLuc = parseFloat(mergedData.percentualLucro || '0');
                const newIss = parseFloat(mergedData.percentualImposto || '0');

                const vImprevisto = newCusto * (newImp / 100);
                const vLucro = newCusto * (newLuc / 100);
                const vImposto = newCusto * (newIss / 100);
                const vTotal = newCusto + vImprevisto + vLucro + vImposto;
                const vEntrada = vTotal * (parseFloat(mergedData.percentualEntrada) / 100);
                const vParcela = (vTotal - vEntrada) / parseInt(mergedData.numeroParcelas);

                onDataChange({
                    ...mergedData,
                    valorImprevisto: vImprevisto.toFixed(2),
                    valorLucro: vLucro.toFixed(2),
                    valorImposto: vImposto.toFixed(2),
                    valorTotal: vTotal.toFixed(2),
                    valorEntrada: vEntrada.toFixed(2),
                    valorParcela: vParcela.toFixed(2),
                });
            }
        }
    }, [configs, isLoadingConfig, data, onDataChange]);


    // Calcular valores derivados
    const valorImprevisto = custoBase * (percentualImprevisto / 100);
    const valorLucro = custoBase * (percentualLucro / 100);
    const valorImposto = custoBase * (percentualImposto / 100);

    // Total = Custo + Taxas
    const valorTotal = custoBase + valorImprevisto + valorLucro + valorImposto;

    const valorEntrada = valorTotal * (percentualEntrada / 100);
    const valorRemanescente = valorTotal - valorEntrada;
    const valorParcela = numeroParcelas > 0 ? valorRemanescente / numeroParcelas : 0;

    // Handler para mudanças
    const handleChange = (field: string, value: string) => {
        // Criar objeto temporário para cálculo
        const tempValues = {
            ...data,
            [field]: value
        };

        const tCusto = parseMoeda(field === 'custoBase' ? value : (tempValues.custoBase || '0'));
        const tImprevisto = parseFloat(field === 'percentualImprevisto' ? value : (tempValues.percentualImprevisto || '0')) || 0;
        const tLucro = parseFloat(field === 'percentualLucro' ? value : (tempValues.percentualLucro || '0')) || 0;
        const tImposto = parseFloat(field === 'percentualImposto' ? value : (tempValues.percentualImposto || '0')) || 0;
        const tEntradaPct = parseFloat(field === 'percentualEntrada' ? value : (tempValues.percentualEntrada || '0')) || 0;
        const tParcelas = parseInt(field === 'numeroParcelas' ? value : (tempValues.numeroParcelas || '1')) || 1;

        const vImprevisto = tCusto * (tImprevisto / 100);
        const vLucro = tCusto * (tLucro / 100);
        const vImposto = tCusto * (tImposto / 100);
        const vTotal = tCusto + vImprevisto + vLucro + vImposto;
        const vEntrada = vTotal * (tEntradaPct / 100);
        const vParcela = tParcelas > 0 ? (vTotal - vEntrada) / tParcelas : 0;

        onDataChange({
            ...tempValues,
            // Persistir valores calculados para facilitar exibição em outras etapas
            valorImprevisto: vImprevisto.toFixed(2),
            valorLucro: vLucro.toFixed(2),
            valorImposto: vImposto.toFixed(2),
            valorTotal: vTotal.toFixed(2),
            valorEntrada: vEntrada.toFixed(2),
            valorParcela: vParcela.toFixed(2),
        });
    };

    // Helper de editabilidade
    const isFieldReadOnly = (campo: string) => {
        if (readOnly) return true;
        const config = getConfig(campo);
        return config ? !config.campo_editavel : false;
    };

    return (
        <div className="space-y-6">
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Defina o valor do serviço e as taxas aplicáveis. O valor total é calculado somando custo base + taxas.
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
                                    const value = e.target.value.replace(/[^\d,.]/g, '');
                                    handleChange('custoBase', value);
                                }}
                                placeholder="0,00"
                                disabled={readOnly}
                                className="pl-10 text-lg font-medium"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Informe o valor parcial do serviço (antes das taxas)
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Imprevisto */}
                        <div className="space-y-2">
                            <Label htmlFor="percentualImprevisto">% Imprevisto</Label>
                            <Input
                                id="percentualImprevisto"
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={data.percentualImprevisto || ''}
                                onChange={(e) => handleChange('percentualImprevisto', e.target.value)}
                                placeholder={isLoadingConfig ? "..." : "0"}
                                disabled={isFieldReadOnly('percentual_imprevisto')}
                            />
                            <p className="text-xs text-muted-foreground">
                                Valor: {formatarMoeda(valorImprevisto)}
                            </p>
                        </div>

                        {/* Lucro */}
                        <div className="space-y-2">
                            <Label htmlFor="percentualLucro">% Lucro</Label>
                            <Input
                                id="percentualLucro"
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={data.percentualLucro || ''}
                                onChange={(e) => handleChange('percentualLucro', e.target.value)}
                                placeholder={isLoadingConfig ? "..." : "0"}
                                disabled={isFieldReadOnly('percentual_lucro')}
                            />
                            <p className="text-xs text-muted-foreground">
                                Valor: {formatarMoeda(valorLucro)}
                            </p>
                        </div>

                        {/* Imposto */}
                        <div className="space-y-2">
                            <Label htmlFor="percentualImposto">% Imposto (ISS)</Label>
                            <Input
                                id="percentualImposto"
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={data.percentualImposto || ''}
                                onChange={(e) => handleChange('percentualImposto', e.target.value)}
                                placeholder={isLoadingConfig ? "..." : "14"}
                                disabled={isFieldReadOnly('percentual_imposto')}
                            />
                            <p className="text-xs text-muted-foreground">
                                Valor: {formatarMoeda(valorImposto)}
                            </p>
                        </div>
                    </div>

                    {/* Total com Impostos */}
                    <Card className="bg-success/10 border-success/30">
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Valor Total (com taxas):</span>
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
                        <span className="text-sm text-muted-foreground">Imprevisto ({percentualImprevisto}%):</span>
                        <span className="text-sm font-medium">{formatarMoeda(valorImprevisto)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Lucro ({percentualLucro}%):</span>
                        <span className="text-sm font-medium">{formatarMoeda(valorLucro)}</span>
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
