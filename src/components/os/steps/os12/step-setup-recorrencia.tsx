import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, DollarSign, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/utils/safe-toast';

const FREQUENCIAS = [
    { value: 'mensal', label: 'Mensal' },
    { value: 'trimestral', label: 'Trimestral' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'anual', label: 'Anual (à vista)' },
];

const FORMAS_PAGAMENTO = [
    { value: 'boleto', label: 'Boleto Bancário' },
    { value: 'pix', label: 'PIX' },
    { value: 'cartao', label: 'Cartão de Crédito' },
    { value: 'transferencia', label: 'Transferência Bancária' },
];

interface Parcela {
    numero: number;
    valor: string;
    vencimento: string;
    status: 'pendente' | 'pago';
}

interface StepSetupRecorrenciaProps {
    data: {
        frequenciaCobranca: string;
        diaPagamento: string;
        formaPagamento: string;
        valorContrato: string;
        reajusteAnual: boolean;
        percentualReajuste: string;
        parcelasGeradas: Parcela[];
    };
    onDataChange: (d: any) => void;
    readOnly?: boolean;
    valorMensal?: string;
    dataInicio?: string;
}

export function StepSetupRecorrencia({
    data,
    onDataChange,
    readOnly,
    valorMensal,
    dataInicio
}: StepSetupRecorrenciaProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleInputChange = (field: string, value: any) => {
        if (readOnly) return;
        onDataChange({ ...data, [field]: value });
    };

    const formatCurrency = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        const amount = Number(numbers) / 100;
        return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const handleGerarParcelas = async () => {
        if (readOnly || !data.valorContrato || !data.diaPagamento) {
            toast.error('Preencha o valor e o dia de pagamento');
            return;
        }

        setIsGenerating(true);

        try {
            // Simular geração de parcelas
            await new Promise(resolve => window.setTimeout(resolve, 1000));

            const parcelas: Parcela[] = [];
            const baseDate = dataInicio ? new Date(dataInicio) : new Date();
            const numeroParcelas = data.frequenciaCobranca === 'anual' ? 1 : 12;

            for (let i = 0; i < numeroParcelas; i++) {
                const vencimento = new Date(baseDate);
                vencimento.setMonth(vencimento.getMonth() + i);
                vencimento.setDate(parseInt(data.diaPagamento));

                parcelas.push({
                    numero: i + 1,
                    valor: data.valorContrato,
                    vencimento: vencimento.toISOString(),
                    status: 'pendente',
                });
            }

            onDataChange({ ...data, parcelasGeradas: parcelas });
            toast.success(`${parcelas.length} parcela(s) gerada(s) com sucesso!`);
        } catch {
            toast.error('Erro ao gerar parcelas');
        } finally {
            setIsGenerating(false);
        }
    };

    const formatDate = (isoDate: string) => {
        if (!isoDate) return '-';
        return new Date(isoDate).toLocaleDateString('pt-BR');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl mb-1">Setup de Recorrência</h2>
                    <p className="text-sm text-muted-foreground">
                        Configure a geração automática de parcelas e cobranças recorrentes
                    </p>
                </div>
            </div>

            {/* Configuração de Cobrança */}
            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                    Configuração de Cobrança
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="valorContrato">Valor da Parcela <span className="text-destructive">*</span></Label>
                        <Input
                            id="valorContrato"
                            value={data.valorContrato || valorMensal || ''}
                            onChange={(e) => handleInputChange('valorContrato', formatCurrency(e.target.value))}
                            placeholder="R$ 0,00"
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="frequenciaCobranca">Frequência de Cobrança <span className="text-destructive">*</span></Label>
                        <Select
                            value={data.frequenciaCobranca}
                            onValueChange={(value) => handleInputChange('frequenciaCobranca', value)}
                            disabled={readOnly}
                        >
                            <SelectTrigger id="frequenciaCobranca">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                {FREQUENCIAS.map((f) => (
                                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="diaPagamento">Dia do Pagamento <span className="text-destructive">*</span></Label>
                        <Select
                            value={data.diaPagamento}
                            onValueChange={(value) => handleInputChange('diaPagamento', value)}
                            disabled={readOnly}
                        >
                            <SelectTrigger id="diaPagamento">
                                <SelectValue placeholder="Selecione o dia" />
                            </SelectTrigger>
                            <SelectContent>
                                {[...Array(28)].map((_, i) => (
                                    <SelectItem key={i + 1} value={String(i + 1)}>Dia {i + 1}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                        <Select
                            value={data.formaPagamento}
                            onValueChange={(value) => handleInputChange('formaPagamento', value)}
                            disabled={readOnly}
                        >
                            <SelectTrigger id="formaPagamento">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                {FORMAS_PAGAMENTO.map((f) => (
                                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Reajuste Automático */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={data.reajusteAnual}
                                onCheckedChange={(checked) => handleInputChange('reajusteAnual', checked)}
                                disabled={readOnly}
                            />
                            <div>
                                <Label className="text-base">Reajuste Anual Automático</Label>
                                <p className="text-sm text-muted-foreground">
                                    Sistema aplicará reajuste automaticamente após 12 meses
                                </p>
                            </div>
                        </div>
                        {data.reajusteAnual && (
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={data.percentualReajuste}
                                    onChange={(e) => handleInputChange('percentualReajuste', e.target.value)}
                                    className="w-20"
                                    disabled={readOnly}
                                />
                                <span className="text-sm">% ao ano</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Gerar Parcelas */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base" style={{ color: 'var(--primary)' }}>Parcelas do Contrato</h3>
                    <Button onClick={handleGerarParcelas} disabled={readOnly || isGenerating}>
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Gerando...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Gerar Parcelas
                            </>
                        )}
                    </Button>
                </div>

                {(data.parcelasGeradas || []).length > 0 ? (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center justify-between">
                                <span>Parcelas Geradas</span>
                                <Badge className="bg-success">{data.parcelasGeradas.length} parcela(s)</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-48 overflow-y-auto space-y-2">
                                {data.parcelasGeradas.slice(0, 6).map((parcela) => (
                                    <div key={parcela.numero} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                                        <span className="font-medium">Parcela {parcela.numero}</span>
                                        <span>{parcela.valor}</span>
                                        <span className="text-muted-foreground">{formatDate(parcela.vencimento)}</span>
                                        <Badge variant="outline">{parcela.status}</Badge>
                                    </div>
                                ))}
                                {data.parcelasGeradas.length > 6 && (
                                    <p className="text-xs text-muted-foreground text-center">
                                        + {data.parcelasGeradas.length - 6} parcelas
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
                        <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Clique em "Gerar Parcelas" para criar os lançamentos financeiros</p>
                    </div>
                )}
            </div>

            <Alert className="bg-primary/5 border-primary/20">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary">
                    <strong>Renovação Automática:</strong> Ao fim do contrato, o sistema detectará a necessidade
                    de renovação e gerará automaticamente +12 meses de parcelas com o reajuste configurado.
                </AlertDescription>
            </Alert>
        </div>
    );
}