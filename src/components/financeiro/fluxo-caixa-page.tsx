import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    CalendarDays,
    ArrowUp,
    ArrowDown,
    AlertTriangle,
    Download,
    Loader2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
    Line
} from 'recharts';
import { PageHeader } from '@/components/shared/page-header';
import { KPICardFinanceiro, KPIFinanceiroGrid } from './kpi-card-financeiro';

// ============================================================
// MOCK DATA - FRONTEND-ONLY MODE
// ============================================================

const mockKPIs = {
    saldoAtual: 85000,
    entradasMes: 52400,
    saidasMes: 38500,
    saldoProjetado30Dias: 98900,
};

const mockFluxoMensal = [
    { mes: 'Jan', entradas: 48000, saidas: 35000, saldo: 13000, acumulado: 72000 },
    { mes: 'Fev', entradas: 52000, saidas: 42000, saldo: 10000, acumulado: 82000 },
    { mes: 'Mar', entradas: 45000, saidas: 38000, saldo: 7000, acumulado: 89000 },
    { mes: 'Abr', entradas: 55000, saidas: 45000, saldo: 10000, acumulado: 99000 },
    { mes: 'Mai', entradas: 48000, saidas: 52000, saldo: -4000, acumulado: 95000 },
    { mes: 'Jun', entradas: 62000, saidas: 48000, saldo: 14000, acumulado: 109000 },
    { mes: 'Jul', entradas: 58000, saidas: 42000, saldo: 16000, acumulado: 125000 },
    { mes: 'Ago', entradas: 52000, saidas: 45000, saldo: 7000, acumulado: 132000 },
    { mes: 'Set', entradas: 48000, saidas: 50000, saldo: -2000, acumulado: 130000 },
    { mes: 'Out', entradas: 55000, saidas: 42000, saldo: 13000, acumulado: 143000 },
    { mes: 'Nov', entradas: 50000, saidas: 38000, saldo: 12000, acumulado: 155000 },
    { mes: 'Dez', entradas: 52400, saidas: 38500, saldo: 13900, acumulado: 168900 },
];

const mockProximos7Dias = [
    { data: '2024-12-19', dia: 'Qui', entradas: [{ desc: 'Parcela Assessoria ABC', valor: 4200 }], saidas: [] },
    { data: '2024-12-20', dia: 'Sex', entradas: [{ desc: 'Parcela Obra Solar I', valor: 10666 }], saidas: [{ desc: 'Salários (Adiantamento)', valor: 15000 }] },
    { data: '2024-12-21', dia: 'Sáb', entradas: [], saidas: [] },
    { data: '2024-12-22', dia: 'Dom', entradas: [], saidas: [] },
    { data: '2024-12-23', dia: 'Seg', entradas: [], saidas: [{ desc: 'Aluguel Escritório', valor: 5500 }] },
    { data: '2024-12-24', dia: 'Ter', entradas: [], saidas: [{ desc: 'Fornecedor - Material', valor: 2800 }] },
    { data: '2024-12-25', dia: 'Qua', entradas: [], saidas: [] },
];

type VisualizacaoTipo = 'semanal' | 'mensal' | 'trimestral';

// ============================================================
// COMPONENT
// ============================================================

/**
 * FluxoCaixaPage - Projeção de Fluxo de Caixa
 * 
 * Visualização temporal de entradas e saídas com:
 * - KPIs de saldo atual e projetado
 * - Gráfico composto (barras + linha acumulada)
 * - Calendário financeiro de 7 dias
 * - Alertas automáticos de caixa
 */
export function FluxoCaixaPage() {
    const [visualizacao, setVisualizacao] = useState<VisualizacaoTipo>('mensal');
    const [isLoading] = useState(false);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    const totalEntradas7Dias = mockProximos7Dias.reduce(
        (acc, dia) => acc + dia.entradas.reduce((sum, e) => sum + e.valor, 0), 0
    );
    const totalSaidas7Dias = mockProximos7Dias.reduce(
        (acc, dia) => acc + dia.saidas.reduce((sum, s) => sum + s.valor, 0), 0
    );

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* ========== Header ========== */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader
                    title="Fluxo de Caixa"
                    subtitle="Projeção de recebimentos e pagamentos"
                    showBackButton
                />
                <div className="flex items-center gap-3">
                    <div className="flex rounded-lg border overflow-hidden">
                        <Button
                            variant={visualizacao === 'semanal' ? 'default' : 'ghost'}
                            size="sm"
                            className="rounded-none"
                            onClick={() => setVisualizacao('semanal')}
                        >
                            Semanal
                        </Button>
                        <Button
                            variant={visualizacao === 'mensal' ? 'default' : 'ghost'}
                            size="sm"
                            className="rounded-none border-x"
                            onClick={() => setVisualizacao('mensal')}
                        >
                            Mensal
                        </Button>
                        <Button
                            variant={visualizacao === 'trimestral' ? 'default' : 'ghost'}
                            size="sm"
                            className="rounded-none"
                            onClick={() => setVisualizacao('trimestral')}
                        >
                            Trimestral
                        </Button>
                    </div>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* ========== KPIs ========== */}
            <KPIFinanceiroGrid columns={4}>
                <KPICardFinanceiro
                    title="Saldo Atual"
                    value={mockKPIs.saldoAtual}
                    icon={<DollarSign className="w-6 h-6" />}
                    variant="primary"
                    loading={isLoading}
                />
                <KPICardFinanceiro
                    title="Entradas (Mês)"
                    value={mockKPIs.entradasMes}
                    icon={<TrendingUp className="w-6 h-6" />}
                    variant="success"
                    trend={{ value: '+8.5%', isPositive: true }}
                    loading={isLoading}
                />
                <KPICardFinanceiro
                    title="Saídas (Mês)"
                    value={mockKPIs.saidasMes}
                    icon={<TrendingDown className="w-6 h-6" />}
                    variant="destructive"
                    loading={isLoading}
                />
                <KPICardFinanceiro
                    title="Projeção 30 dias"
                    value={mockKPIs.saldoProjetado30Dias}
                    icon={<CalendarDays className="w-6 h-6" />}
                    variant={mockKPIs.saldoProjetado30Dias > mockKPIs.saldoAtual ? 'success' : 'warning'}
                    trend={{
                        value: `${mockKPIs.saldoProjetado30Dias > mockKPIs.saldoAtual ? '+' : ''}${formatCurrency(mockKPIs.saldoProjetado30Dias - mockKPIs.saldoAtual)}`,
                        isPositive: mockKPIs.saldoProjetado30Dias > mockKPIs.saldoAtual
                    }}
                    loading={isLoading}
                />
            </KPIFinanceiroGrid>

            {/* ========== Gráfico Principal ========== */}
            <Card className="shadow-card">
                <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                    <CardTitle className="text-base font-semibold">Evolução do Fluxo de Caixa</CardTitle>
                    <CardDescription>Entradas, Saídas e Saldo Acumulado - 2024</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <span className="ml-3 text-neutral-600">Carregando...</span>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={380}>
                            <ComposedChart data={mockFluxoMensal}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="mes" stroke="#71717a" />
                                <YAxis
                                    yAxisId="left"
                                    stroke="#71717a"
                                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="#71717a"
                                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    formatter={(value: number, name: string) => [
                                        formatCurrency(value),
                                        name === 'entradas' ? 'Entradas' :
                                            name === 'saidas' ? 'Saídas' :
                                                name === 'acumulado' ? 'Saldo Acumulado' : name
                                    ]}
                                    contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px 0 rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend
                                    formatter={(value) =>
                                        value === 'entradas' ? 'Entradas' :
                                            value === 'saidas' ? 'Saídas' :
                                                value === 'acumulado' ? 'Saldo Acumulado' : value
                                    }
                                />
                                <Bar yAxisId="left" dataKey="entradas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                <Bar yAxisId="left" dataKey="saidas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="acumulado"
                                    stroke="#d3af37"
                                    strokeWidth={2}
                                    dot={{ fill: '#d3af37' }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* ========== Calendário Financeiro ========== */}
            <Card className="shadow-card">
                <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 text-primary" />
                                Calendário Financeiro - Próximos 7 dias
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Entradas: <span className="text-green-600 font-medium">{formatCurrency(totalEntradas7Dias)}</span> |
                                Saídas: <span className="text-red-600 font-medium">{formatCurrency(totalSaidas7Dias)}</span> |
                                Saldo: <span className={`font-medium ${totalEntradas7Dias - totalSaidas7Dias >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(totalEntradas7Dias - totalSaidas7Dias)}
                                </span>
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-2">
                            {mockProximos7Dias.map((dia) => {
                                const totalEntradas = dia.entradas.reduce((sum, e) => sum + e.valor, 0);
                                const totalSaidas = dia.saidas.reduce((sum, s) => sum + s.valor, 0);
                                const saldoDia = totalEntradas - totalSaidas;
                                const temMovimentacao = dia.entradas.length > 0 || dia.saidas.length > 0;

                                return (
                                    <div
                                        key={dia.data}
                                        className={`p-3 rounded-lg border transition-all ${temMovimentacao
                                            ? 'bg-white hover:shadow-card-hover cursor-pointer border-border'
                                            : 'bg-muted/30 border-transparent'
                                            }`}
                                    >
                                        <div className="text-center mb-2">
                                            <p className="text-xs text-neutral-500">{dia.dia}</p>
                                            <p className="font-semibold text-neutral-900">{formatDate(dia.data)}</p>
                                        </div>

                                        {temMovimentacao ? (
                                            <div className="space-y-2">
                                                {dia.entradas.map((e, i) => (
                                                    <div key={i} className="flex items-center gap-1 text-xs">
                                                        <ArrowUp className="w-3 h-3 text-green-600 flex-shrink-0" />
                                                        <span className="truncate text-green-600 font-medium">
                                                            {formatCurrency(e.valor)}
                                                        </span>
                                                    </div>
                                                ))}
                                                {dia.saidas.map((s, i) => (
                                                    <div key={i} className="flex items-center gap-1 text-xs">
                                                        <ArrowDown className="w-3 h-3 text-red-600 flex-shrink-0" />
                                                        <span className="truncate text-red-600 font-medium">
                                                            {formatCurrency(s.valor)}
                                                        </span>
                                                    </div>
                                                ))}
                                                {(dia.entradas.length > 0 || dia.saidas.length > 0) && (
                                                    <div className={`text-xs font-bold text-center pt-1 border-t ${saldoDia >= 0 ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {saldoDia >= 0 ? '+' : ''}{formatCurrency(saldoDia)}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-center text-neutral-400">
                                                Sem movimentação
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ========== Alertas ========== */}
            {mockKPIs.saldoProjetado30Dias < mockKPIs.saldoAtual && (
                <Card className="border-yellow-300 bg-yellow-50/50 shadow-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-neutral-900">Atenção: Projeção de Caixa Reduzida</h4>
                                <p className="text-sm text-neutral-600">
                                    O saldo projetado para os próximos 30 dias é menor que o saldo atual.
                                    Verifique os vencimentos e considere ações de cobrança.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
