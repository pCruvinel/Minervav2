/**
 * ExecutiveOverview - Aba 1: Visão Geral
 * 
 * KPIs de alto nível para Dashboard Executivo:
 * - Valor Total em Carteira
 * - Saúde das Entregas
 * - Setor Gargalo
 * - Leads vs Contratos
 * - Gráfico de Evolução (6 meses)
 */
'use client';

import { useExecutiveMetrics } from '@/lib/hooks/use-executive-metrics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DollarSign,
    TrendingUp,
    AlertTriangle,
    Users,
    CheckCircle,
    XCircle,
    BarChart3
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function ExecutiveOverview() {
    const { metrics, evolution, loading, error } = useExecutiveMetrics();

    if (loading) {
        return <ExecutiveOverviewSkeleton />;
    }

    if (error) {
        return (
            <Card className="border-destructive">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        <span>Erro ao carregar métricas: {error.message}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Valor Total em Carteira */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Valor em Carteira
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(metrics.valorTotalCarteira)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Contratos ativos
                        </p>
                    </CardContent>
                </Card>

                {/* Saúde das Entregas */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Saúde das Entregas
                        </CardTitle>
                        {metrics.saudeEntregas.percentualNoPrazo >= 80 ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-2xl font-bold ${metrics.saudeEntregas.percentualNoPrazo >= 80
                                    ? 'text-emerald-600'
                                    : 'text-amber-600'
                                }`}>
                                {metrics.saudeEntregas.percentualNoPrazo}%
                            </span>
                            <span className="text-sm text-muted-foreground">no prazo</span>
                        </div>
                        <div className="flex gap-3 mt-2 text-xs">
                            <span className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle className="h-3 w-3" />
                                {metrics.saudeEntregas.noPrazo} OK
                            </span>
                            <span className="flex items-center gap-1 text-red-600">
                                <XCircle className="h-3 w-3" />
                                {metrics.saudeEntregas.atrasadas} atrasadas
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Setor Gargalo */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Gargalo Identificado
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        {metrics.setorGargalo ? (
                            <>
                                <div className="text-lg font-bold text-red-600">
                                    {metrics.setorGargalo.setor}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {metrics.setorGargalo.quantidade} OS paradas há +7 dias
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-lg font-bold text-emerald-600">
                                    Nenhum
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Sem gargalos identificados
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Leads vs Contratos */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Conversão (Mês)
                        </CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-blue-600">
                                {metrics.leadsVsContratos.taxaConversao}%
                            </span>
                        </div>
                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{metrics.leadsVsContratos.leads} leads</span>
                            <span>→</span>
                            <span>{metrics.leadsVsContratos.contratos} contratos</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Gráfico de Evolução */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Evolução de Contratos
                            </CardTitle>
                            <CardDescription>
                                Quantidade e valor total nos últimos 6 meses
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={evolution}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="mes"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    label={{ value: 'Quantidade', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    label={{ value: 'Valor (R$ mil)', angle: 90, position: 'insideRight', style: { fontSize: 11 } }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                    formatter={(value: any, name: string) => {
                                        if (name === 'Valor Total') {
                                            return [`R$ ${value}k`, name];
                                        }
                                        return [value, name];
                                    }}
                                />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="quantidade"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    dot={{ fill: 'hsl(var(--primary))' }}
                                    name="Qtd Contratos"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="valorTotal"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={{ fill: '#10b981' }}
                                    name="Valor Total"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// ============================================================
// SKELETON
// ============================================================

function ExecutiveOverviewSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-32 mb-2" />
                            <Skeleton className="h-3 w-20" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        </div>
    );
}

// ============================================================
// HELPERS
// ============================================================

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}
