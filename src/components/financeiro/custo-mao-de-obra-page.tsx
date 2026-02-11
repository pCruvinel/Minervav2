import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
    Users,
    CalendarDays,
    DollarSign,
    Building2,
    TrendingUp,
    Download,
    Search,
    ChevronRight,
    Loader2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { KPICardFinanceiro, KPIFinanceiroGrid } from './kpi-card-financeiro';
import { useNavigate } from '@tanstack/react-router';
import { useCustoMOPorCC, useCustoMOPorColaborador, useCustoMOKPIs } from '@/lib/hooks/use-custo-mo';
import { useDiasUteisMes } from '@/lib/hooks/use-dias-uteis';
import { FATOR_ENCARGOS_CLT } from '@/lib/constants/colaboradores';

// ============================================================
// MOCK DATA - FRONTEND-ONLY MODE
// ============================================================

const mockKPIs = {
    custoTotalMO: 85000,
    custoDiaMedio: 385.45,
    totalPresencas: 220,
    ccsAtivos: 12,
    colaboradoresAtivos: 18,
};

const mockCustoPorCC = [
    { cc_id: 'cc-001', cc_nome: 'CC13001-SOLAR_I', custo: 24500, colaboradores: 4, percentual: 28.8 },
    { cc_id: 'cc-002', cc_nome: 'CC12005-EDIFICIO_CENTRAL', custo: 18200, colaboradores: 3, percentual: 21.4 },
    { cc_id: 'cc-003', cc_nome: 'CC13002-REFORMA_NORTE', custo: 15000, colaboradores: 2, percentual: 17.6 },
    { cc_id: 'cc-004', cc_nome: 'CC11008-ASSESSORIA_ABC', custo: 12300, colaboradores: 5, percentual: 14.5 },
    { cc_id: 'escritorio', cc_nome: 'Escritório (sem CC)', custo: 15000, colaboradores: 4, percentual: 17.6 },
];

const mockColaboradores = [
    {
        id: 'col-001', nome: 'João Silva', cargo: 'Pedreiro', setor: 'Obras',
        salarioBase: 4095, encargos: 1888, beneficios: 450, custosVariaveis: 120,
        custoDia: 271.59, diasTrabalhados: 22, custoTotal: 5975,
        ccs: ['CC13001-SOLAR_I', 'CC13002-REFORMA_NORTE'],
    },
    {
        id: 'col-002', nome: 'Maria Santos', cargo: 'Servente', setor: 'Obras',
        salarioBase: 2628, encargos: 1210, beneficios: 450, custosVariaveis: 80,
        custoDia: 174.45, diasTrabalhados: 22, custoTotal: 3838,
        ccs: ['CC13001-SOLAR_I', 'CC12005-EDIFICIO_CENTRAL'],
    },
    {
        id: 'col-003', nome: 'Pedro Oliveira', cargo: 'Eletricista', setor: 'Obras',
        salarioBase: 5200, encargos: 2392, beneficios: 450, custosVariaveis: 200,
        custoDia: 320.00, diasTrabalhados: 18, custoTotal: 5760,
        ccs: ['CC12005-EDIFICIO_CENTRAL'],
    },
    {
        id: 'col-004', nome: 'Ana Costa', cargo: 'Engenheira', setor: 'Assessoria',
        salarioBase: 8500, encargos: 3910, beneficios: 800, custosVariaveis: 350,
        custoDia: 450.00, diasTrabalhados: 22, custoTotal: 9900,
        ccs: ['CC11008-ASSESSORIA_ABC', 'CC13001-SOLAR_I'],
    },
    {
        id: 'col-005', nome: 'Carlos Lima', cargo: 'Auxiliar Administrativo', setor: 'Administrativo',
        salarioBase: 2200, encargos: 1012, beneficios: 450, custosVariaveis: 50,
        custoDia: 148.48, diasTrabalhados: 22, custoTotal: 3267,
        ccs: ['Escritório'],
    },
];

type PeriodoFiltro = 'thisMonth' | 'lastMonth' | 'last3Months';

// ============================================================
// COMPONENT
// ============================================================

/**
 * CustoMaoDeObraPage - Análise de Custo de Mão de Obra
 * 
 * Exibe distribuição de custos por CC e detalhamento por colaborador
 * com integração ao módulo de Presença.
 */
export function CustoMaoDeObraPage() {
    const navigate = useNavigate();
    const [periodo, setPeriodo] = useState<PeriodoFiltro>('thisMonth');
    const [busca, setBusca] = useState('');
    const [setorFiltro, setSetorFiltro] = useState<string>('todos');
    const now = new Date();
    const { data: diasUteisMes = 22 } = useDiasUteisMes(now.getFullYear(), now.getMonth() + 1);

    // ========== HOOKS DE DADOS REAIS ==========
    const kpis = useCustoMOKPIs();
    const { data: custoPorCC, isLoading: ccLoading } = useCustoMOPorCC();
    const { data: custoPorColaborador, isLoading: colabLoading } = useCustoMOPorColaborador();

    const isLoading = ccLoading || colabLoading;

    // Dados com fallback para mock
    const dadosCustoPorCC = custoPorCC && custoPorCC.length > 0 ? custoPorCC : mockCustoPorCC;
    const dadosColaboradores = custoPorColaborador && custoPorColaborador.length > 0
        ? custoPorColaborador.map(c => ({
            id: c.colaborador_id,
            nome: c.colaborador_nome,
            cargo: '-',
            setor: '-',
            salarioBase: c.salario_base,
            encargos: Math.round(c.salario_base * (FATOR_ENCARGOS_CLT - 1)),
            beneficios: 450,
            custosVariaveis: 0,
            custoDia: (c.salario_base * FATOR_ENCARGOS_CLT) / diasUteisMes,
            diasTrabalhados: c.dias_trabalhados,
            custoTotal: c.custo_total,
            ccs: c.ccs,
        }))
        : mockColaboradores;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const periodoLabels: Record<PeriodoFiltro, string> = {
        thisMonth: 'Dezembro 2024',
        lastMonth: 'Novembro 2024',
        last3Months: 'Últimos 3 meses',
    };

    const colaboradoresFiltrados = dadosColaboradores.filter(col => {
        const matchBusca = col.nome.toLowerCase().includes(busca.toLowerCase()) ||
            col.cargo.toLowerCase().includes(busca.toLowerCase());
        const matchSetor = setorFiltro === 'todos' || col.setor === setorFiltro;
        return matchBusca && matchSetor;
    });

    const handleVerCC = (ccId: string) => {
        if (ccId !== 'escritorio') {
            navigate({ to: '/financeiro/centro-custo/$ccId', params: { ccId } });
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* ========== Header ========== */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900">Custo de Mão de Obra</h1>
                    <p className="text-neutral-600 mt-1">
                        Análise de custos por presença e rateio por Centro de Custo
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={periodo} onValueChange={(v) => setPeriodo(v as PeriodoFiltro)}>
                        <SelectTrigger className="w-[180px]">
                            <CalendarDays className="w-4 h-4 mr-2 text-neutral-500" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="thisMonth">Este Mês</SelectItem>
                            <SelectItem value="lastMonth">Mês Anterior</SelectItem>
                            <SelectItem value="last3Months">Últimos 3 meses</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* ========== KPIs ========== */}
            <KPIFinanceiroGrid columns={4}>
                <KPICardFinanceiro
                    title="Custo Total MO"
                    value={kpis.custoTotal}
                    icon={<DollarSign className="w-6 h-6" />}
                    variant="primary"
                    subtitle={periodoLabels[periodo]}
                    loading={isLoading}
                />
                <KPICardFinanceiro
                    title="Custo/Dia Médio"
                    value={formatCurrency(kpis.custoDiaMedio)}
                    icon={<TrendingUp className="w-6 h-6" />}
                    variant="info"
                    subtitle="Por colaborador"
                    loading={isLoading}
                />
                <KPICardFinanceiro
                    title="Total Presenças"
                    value={kpis.totalAlocacoes.toString()}
                    icon={<CalendarDays className="w-6 h-6" />}
                    variant="success"
                    subtitle="Dias registrados"
                    loading={isLoading}
                />
                <KPICardFinanceiro
                    title="Colaboradores"
                    value={kpis.colaboradoresAtivos.toString()}
                    icon={<Users className="w-6 h-6" />}
                    variant="neutral"
                    subtitle={`em ${kpis.ccsAtivos} CCs`}
                    loading={isLoading}
                />
            </KPIFinanceiroGrid>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Custo por Centro de Custo */}
                <Card className="shadow-card">
                    <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            Custo por Centro de Custo
                        </CardTitle>
                        <CardDescription>Distribuição do custo de MO</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            dadosCustoPorCC.map((cc) => (
                                <div
                                    key={cc.cc_id}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 hover:shadow-card-hover cursor-pointer transition-all border border-transparent hover:border-primary/20"
                                    onClick={() => handleVerCC(cc.cc_id)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium truncate text-neutral-900">{cc.cc_nome}</span>
                                            <span className="font-bold text-primary">{formatCurrency('custo_total' in cc ? cc.custo_total : cc.custo)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                                            <Users className="w-3 h-3" />
                                            <span>{'colaboradores_distintos' in cc ? cc.colaboradores_distintos : cc.colaboradores} colaborador(es)</span>
                                            <span>•</span>
                                            <span>{'percentual' in cc ? cc.percentual : 0}%</span>
                                        </div>
                                        <Progress value={cc.percentual} className="h-2 mt-2" />
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Gráfico de Barras */}
                <Card className="shadow-card">
                    <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                        <CardTitle className="text-base font-semibold">Distribuição Visual</CardTitle>
                        <CardDescription>Custo de MO por Centro de Custo</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={dadosCustoPorCC.map(c => ({ ...c, custo: 'custo_total' in c ? c.custo_total : c.custo }))} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        type="number"
                                        stroke="#71717a"
                                        tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="cc_nome"
                                        stroke="#71717a"
                                        width={160}
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px 0 rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="custo" fill="#d3af37" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Detalhamento por Colaborador */}
            <Card className="shadow-card">
                <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-semibold">Detalhamento por Colaborador</CardTitle>
                            <CardDescription>Custo-Dia = Salário + Encargos (46%) + Benefícios + Variáveis</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <Input
                                    placeholder="Buscar colaborador..."
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={setorFiltro} onValueChange={setSetorFiltro}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Setor" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos</SelectItem>
                                    <SelectItem value="Obras">Obras</SelectItem>
                                    <SelectItem value="Assessoria">Assessoria</SelectItem>
                                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <span className="ml-3 text-neutral-600">Carregando...</span>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Colaborador</TableHead>
                                    <TableHead>Cargo</TableHead>
                                    <TableHead>Setor</TableHead>
                                    <TableHead className="text-right">Salário</TableHead>
                                    <TableHead className="text-right">Encargos</TableHead>
                                    <TableHead className="text-right">Benef.</TableHead>
                                    <TableHead className="text-right">Custo/Dia</TableHead>
                                    <TableHead className="text-right">Dias</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead>CCs</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {colaboradoresFiltrados.map((col) => (
                                    <TableRow key={col.id}>
                                        <TableCell className="font-medium">{col.nome}</TableCell>
                                        <TableCell>{col.cargo}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{col.setor}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{formatCurrency(col.salarioBase)}</TableCell>
                                        <TableCell className="text-right text-neutral-500">
                                            {formatCurrency(col.encargos)}
                                        </TableCell>
                                        <TableCell className="text-right text-neutral-500">
                                            {formatCurrency(col.beneficios)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(col.custoDia)}
                                        </TableCell>
                                        <TableCell className="text-right">{col.diasTrabalhados}</TableCell>
                                        <TableCell className="text-right font-bold text-primary">
                                            {formatCurrency(col.custoTotal)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{col.ccs.length} CC(s)</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="bg-muted/50">
                                    <TableCell colSpan={8} className="font-bold">Total</TableCell>
                                    <TableCell className="text-right font-bold text-primary">
                                        {formatCurrency(colaboradoresFiltrados.reduce((acc, col) => acc + col.custoTotal, 0))}
                                    </TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
