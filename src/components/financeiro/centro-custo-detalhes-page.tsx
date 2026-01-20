import { useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableFooter, TableHeader, TableRow } from '@/components/ui/table';
import { CompactTableWrapper, CompactTableHead, CompactTableCell, CompactTableRow } from '@/components/shared/compact-table';
import {
    ArrowLeft,
    Building2,
    Receipt,
    Users,
    FileText,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Percent,
    ExternalLink,
    Download,
    AlertCircle,
    Loader2,
    Paperclip
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
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { KPICardFinanceiro, KPIFinanceiroGrid } from './kpi-card-financeiro';
import { useLucratividadeCC } from '@/lib/hooks/use-lucratividade-cc';
import { useCustoMODetalhado } from '@/lib/hooks/use-custo-mo';

// ============================================================
// MOCK DATA - FRONTEND-ONLY MODE
// SCHEMA: Usar dados de centros_custo via hook useCC
// ============================================================

const mockCentroCusto = {
    id: 'cc-13001',
    codigo: 'CC13001-SOLAR_I',
    nome: 'Condomínio Solar I',
    cliente: 'Construtora Silva Ltda',
    clienteId: 'cli-001',
    osOrigem: 'OS13-00142',
    osOrigemId: 'os-142',
    tipo: 'Obra',
    status: 'ativo' as const,
    dataInicio: '2024-06-15',
    dataFim: null,
    receitaPrevista: 128000,
    receitaRealizada: 98500,
    despesaPrevista: 82000,
    despesaRealizada: 67800,
    lucroRealizado: 30700,
    margemRealizada: 31.2,
    custosPorCategoria: [
        { categoria: 'Mão de Obra', previsto: 35000, realizado: 32500, percentual: 47.9 },
        { categoria: 'Material', previsto: 28000, realizado: 22300, percentual: 32.9 },
        { categoria: 'Equipamento', previsto: 12000, realizado: 8000, percentual: 11.8 },
        { categoria: 'Transporte', previsto: 5000, realizado: 3500, percentual: 5.2 },
        { categoria: 'Outros', previsto: 2000, realizado: 1500, percentual: 2.2 },
    ],
    evolucaoMensal: [
        { mes: 'Jun', receita: 15000, despesa: 8500 },
        { mes: 'Jul', receita: 18000, despesa: 12000 },
        { mes: 'Ago', receita: 22000, despesa: 14500 },
        { mes: 'Set', receita: 20500, despesa: 13800 },
        { mes: 'Out', receita: 12500, despesa: 10500 },
        { mes: 'Nov', receita: 10500, despesa: 8500 },
    ],
};

const mockLancamentos = [
    { id: 1, data: '2024-11-15', descricao: 'Pagamento parcela 5/12', tipo: 'Receita', valor: 10500, status: 'Conciliado' },
    { id: 2, data: '2024-11-10', descricao: 'Material - Cimento x 50 sacos', tipo: 'Despesa', valor: 2500, status: 'Conciliado' },
    { id: 3, data: '2024-11-08', descricao: 'MO - Pedreiros (semana 45)', tipo: 'Despesa', valor: 4200, status: 'Conciliado' },
    { id: 4, data: '2024-11-05', descricao: 'Aluguel betoneira', tipo: 'Despesa', valor: 800, status: 'Pendente' },
    { id: 5, data: '2024-11-01', descricao: 'Transporte materiais', tipo: 'Despesa', valor: 650, status: 'Conciliado' },
];

const mockPresencas = [
    { id: 1, colaborador: 'João Silva', cargo: 'Pedreiro', diasTrabalhados: 22, custoDia: 271.59, custoTotal: 5975 },
    { id: 2, colaborador: 'Maria Santos', cargo: 'Servente', diasTrabalhados: 22, custoDia: 174.45, custoTotal: 3838 },
    { id: 3, colaborador: 'Pedro Oliveira', cargo: 'Eletricista', diasTrabalhados: 15, custoDia: 320.00, custoTotal: 4800 },
    { id: 4, colaborador: 'Ana Costa', cargo: 'Engenheira', diasTrabalhados: 8, custoDia: 450.00, custoTotal: 3600 },
];

const mockDocumentos = [
    { id: 1, nome: 'Contrato Assinado', tipo: 'PDF', uploadedAt: '2024-06-15', obrigatorio: true, status: 'ok' },
    { id: 2, nome: 'ART de Execução', tipo: 'PDF', uploadedAt: '2024-06-20', obrigatorio: true, status: 'ok' },
    { id: 3, nome: 'Termo de Entrega', tipo: 'PDF', uploadedAt: null, obrigatorio: true, status: 'pendente' },
    { id: 4, nome: 'Atestado Capacidade Técnica', tipo: 'PDF', uploadedAt: null, obrigatorio: true, status: 'pendente' },
    { id: 5, nome: 'Relatório Fotográfico', tipo: 'ZIP', uploadedAt: '2024-11-10', obrigatorio: false, status: 'ok' },
];

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#71717a'];

// ============================================================
// COMPONENT
// ============================================================

/**
 * CentroCustoDetalhesPage - Visão 360° do Centro de Custo
 * 
 * Exibe todos os dados financeiros de um CC específico:
 * - KPIs de receita, despesa, lucro e margem
 * - Gráficos de evolução e distribuição
 * - Tabs: Resumo, Receitas, Despesas, Mão de Obra, Documentos
 */
export function CentroCustoDetalhesPage() {
    const navigate = useNavigate();
    const { ccId } = useParams({ strict: false });
    const [activeTab, setActiveTab] = useState('resumo');

    // ========== SORTING STATE ==========
    const [sortCategoria, setSortCategoria] = useState<{ field: string, dir: 'asc' | 'desc' } | null>(null);
    const [sortReceitas, setSortReceitas] = useState<{ field: string, dir: 'asc' | 'desc' } | null>(null);
    const [sortDespesas, setSortDespesas] = useState<{ field: string, dir: 'asc' | 'desc' } | null>(null);
    const [sortMO, setSortMO] = useState<{ field: string, dir: 'asc' | 'desc' } | null>(null);
    const [sortDocs, setSortDocs] = useState<{ field: string, dir: 'asc' | 'desc' } | null>(null);

    // ========== HOOKS DE DADOS REAIS ==========
    // TODO: Integrar quando API de useCentroCusto for atualizada
    // const { data: centroCusto, isLoading: ccLoading } = useCentroCusto(ccId);
    const { data: lucratividade, isLoading: lucroLoading } = useLucratividadeCC(ccId);
    const { data: custosMO, isLoading: moLoading } = useCustoMODetalhado({ ccId: ccId ?? undefined });

    const isLoading = lucroLoading || moLoading;

    // Usar mock data enquanto não há integração completa
    const cc = {
        ...mockCentroCusto,
        // Sobrescrever com dados reais da view de lucratividade quando disponíveis
        ...(lucratividade && {
            receitaPrevista: Number(lucratividade.receita_prevista ?? 0),
            receitaRealizada: Number(lucratividade.receita_realizada ?? 0),
            despesaPrevista: Number(lucratividade.despesa_operacional_total ?? 0),
            despesaRealizada: Number(lucratividade.despesa_operacional_paga ?? 0),
            lucroRealizado: Number(lucratividade.lucro_bruto_realizado ?? 0),
            margemRealizada: Number(lucratividade.margem_realizada_pct ?? 0),
        }),
    };

    // Agrupar custos MO por colaborador quando dados reais disponíveis
    const presencasReais = custosMO && custosMO.length > 0
        ? Object.values(
            custosMO.reduce((acc, item) => {
                const key = item.colaborador_id;
                if (!acc[key]) {
                    acc[key] = {
                        id: key,
                        colaborador: item.colaborador_nome,
                        cargo: '-',
                        diasTrabalhados: 0,
                        custoDia: Number(item.salario_base) / 22,
                        custoTotal: 0,
                    };
                }
                acc[key].diasTrabalhados++;
                acc[key].custoTotal += Number(item.custo_alocado || 0);
                return acc;
            }, {} as Record<string, { id: string; colaborador: string; cargo: string; diasTrabalhados: number; custoDia: number; custoTotal: number }>)
        )
        : mockPresencas;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* ========== Header ========== */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate({ to: '/financeiro/prestacao-contas' })}
                        className="hover:bg-primary/10"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-neutral-900">{cc.codigo}</h1>
                            <Badge
                                className={cc.status === 'ativo'
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-neutral-100 text-neutral-600'
                                }
                            >
                                {cc.status === 'ativo' ? '🟢 Ativo' : '⚪ Encerrado'}
                            </Badge>
                        </div>
                        <p className="text-neutral-600 mt-1">
                            <Button
                                variant="link"
                                className="p-0 h-auto text-neutral-600 hover:text-primary font-medium"
                                onClick={() => navigate({ to: '/contatos/$id', params: { id: cc.clienteId } })}
                            >
                                {cc.cliente}
                            </Button>
                            <span className="ml-1">•</span>
                            <span className="ml-2">OS: {cc.osOrigem}</span> •
                            <span className="ml-2">Tipo: {cc.tipo}</span>
                        </p>
                        <p className="text-sm text-neutral-500 mt-1">
                            Início: {formatDate(cc.dataInicio)}
                            {cc.dataFim && ` • Término: ${formatDate(cc.dataFim)}`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                    </Button>
                    <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver OS
                    </Button>
                </div>
            </div>

            {/* ========== KPIs ========== */}
            <KPIFinanceiroGrid columns={4}>
                <KPICardFinanceiro
                    title="Receita Realizada"
                    value={cc.receitaRealizada}
                    icon={<TrendingUp className="w-6 h-6" />}
                    variant="success"
                    subtitle={`Previsto: ${formatCurrency(cc.receitaPrevista)}`}
                    loading={isLoading}
                />
                <KPICardFinanceiro
                    title="Despesas Realizadas"
                    value={cc.despesaRealizada}
                    icon={<TrendingDown className="w-6 h-6" />}
                    variant="destructive"
                    subtitle={`Previsto: ${formatCurrency(cc.despesaPrevista)}`}
                    loading={isLoading}
                />
                <KPICardFinanceiro
                    title="Lucro Realizado"
                    value={cc.lucroRealizado}
                    icon={<DollarSign className="w-6 h-6" />}
                    variant="primary"
                    trend={{
                        value: cc.lucroRealizado > 0 ? 'Positivo' : 'Negativo',
                        isPositive: cc.lucroRealizado > 0
                    }}
                    loading={isLoading}
                />
                <KPICardFinanceiro
                    title="Margem"
                    value={`${cc.margemRealizada.toFixed(1)}%`}
                    icon={<Percent className="w-6 h-6" />}
                    variant={cc.margemRealizada >= 25 ? 'success' : cc.margemRealizada >= 15 ? 'warning' : 'destructive'}
                    loading={isLoading}
                />
            </KPIFinanceiroGrid>

            {/* ========== Tabs ========== */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-5 w-full max-w-2xl">
                    <TabsTrigger value="resumo" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Resumo</span>
                    </TabsTrigger>
                    <TabsTrigger value="receitas" className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="hidden sm:inline">Receitas</span>
                    </TabsTrigger>
                    <TabsTrigger value="despesas" className="flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        <span className="hidden sm:inline">Despesas</span>
                    </TabsTrigger>
                    <TabsTrigger value="mao-de-obra" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline">MO</span>
                    </TabsTrigger>
                    <TabsTrigger value="documentos" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">Docs</span>
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Resumo */}
                <TabsContent value="resumo" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Gráfico de Evolução */}
                        <Card className="shadow-card">
                            <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                                <CardTitle className="text-base font-semibold">Evolução Mensal</CardTitle>
                                <CardDescription>Receitas vs Despesas</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart data={cc.evolucaoMensal}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="mes" stroke="#71717a" />
                                            <YAxis
                                                stroke="#71717a"
                                                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                                            />
                                            <Tooltip
                                                formatter={(value: number) => formatCurrency(value)}
                                                contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px 0 rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Legend />
                                            <Bar dataKey="receita" name="Receita" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="despesa" name="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        {/* Gráfico de Distribuição */}
                        <Card className="shadow-card">
                            <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                                <CardTitle className="text-base font-semibold">Distribuição de Custos</CardTitle>
                                <CardDescription>Por categoria</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie
                                                data={cc.custosPorCategoria}
                                                dataKey="realizado"
                                                nameKey="categoria"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={95}
                                                label={({ categoria, percentual }) => `${categoria}: ${percentual}%`}
                                                labelLine={false}
                                            >
                                                {cc.custosPorCategoria.map((entry, index) => (
                                                    <Cell key={entry.categoria} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabela de Detalhamento */}
                    <CompactTableWrapper
                        title="Detalhamento por Categoria"
                        totalItems={cc.custosPorCategoria.length}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <CompactTableHead
                                        onSort={() => {
                                            setSortCategoria(prev =>
                                                prev?.field === 'categoria'
                                                    ? { field: 'categoria', dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                                                    : { field: 'categoria', dir: 'asc' }
                                            );
                                        }}
                                        sortDirection={sortCategoria?.field === 'categoria' ? sortCategoria.dir : null}
                                    >Categoria</CompactTableHead>
                                    <CompactTableHead className="text-right">Previsto</CompactTableHead>
                                    <CompactTableHead
                                        className="text-right"
                                        onSort={() => {
                                            setSortCategoria(prev =>
                                                prev?.field === 'realizado'
                                                    ? { field: 'realizado', dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                                                    : { field: 'realizado', dir: 'desc' }
                                            );
                                        }}
                                        sortDirection={sortCategoria?.field === 'realizado' ? sortCategoria.dir : null}
                                    >Realizado</CompactTableHead>
                                    <CompactTableHead className="text-right">Variação</CompactTableHead>
                                    <CompactTableHead className="text-right">% Total</CompactTableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cc.custosPorCategoria.map((cat) => {
                                    const variacao = cat.realizado - cat.previsto;
                                    const variacaoPercent = ((variacao / cat.previsto) * 100).toFixed(1);
                                    return (
                                        <CompactTableRow key={cat.categoria}>
                                            <CompactTableCell className="font-medium">{cat.categoria}</CompactTableCell>
                                            <CompactTableCell className="text-right">{formatCurrency(cat.previsto)}</CompactTableCell>
                                            <CompactTableCell className="text-right">{formatCurrency(cat.realizado)}</CompactTableCell>
                                            <CompactTableCell className={`text-right font-medium ${variacao > 0 ? 'text-destructive' : 'text-success'}`}>
                                                {variacao > 0 ? '+' : ''}{formatCurrency(variacao)} ({variacaoPercent}%)
                                            </CompactTableCell>
                                            <CompactTableCell className="text-right">{cat.percentual}%</CompactTableCell>
                                        </CompactTableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CompactTableWrapper>
                </TabsContent>

                {/* Tab: Receitas */}
                <TabsContent value="receitas" className="mt-6">
                    <CompactTableWrapper
                        title="Lançamentos de Receita"
                        subtitle="Parcelas e entradas vinculadas"
                        totalItems={mockLancamentos.filter(l => l.tipo === 'Receita').length}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <CompactTableHead
                                        onSort={() => {
                                            setSortReceitas(prev =>
                                                prev?.field === 'data'
                                                    ? { field: 'data', dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                                                    : { field: 'data', dir: 'asc' }
                                            );
                                        }}
                                        sortDirection={sortReceitas?.field === 'data' ? sortReceitas.dir : null}
                                    >Data</CompactTableHead>
                                    <CompactTableHead
                                        onSort={() => {
                                            setSortReceitas(prev =>
                                                prev?.field === 'descricao'
                                                    ? { field: 'descricao', dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                                                    : { field: 'descricao', dir: 'asc' }
                                            );
                                        }}
                                        sortDirection={sortReceitas?.field === 'descricao' ? sortReceitas.dir : null}
                                    >Descrição</CompactTableHead>
                                    <CompactTableHead
                                        className="text-right"
                                        onSort={() => {
                                            setSortReceitas(prev =>
                                                prev?.field === 'valor'
                                                    ? { field: 'valor', dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                                                    : { field: 'valor', dir: 'desc' }
                                            );
                                        }}
                                        sortDirection={sortReceitas?.field === 'valor' ? sortReceitas.dir : null}
                                    >Valor</CompactTableHead>
                                    <CompactTableHead>Status</CompactTableHead>
                                    <CompactTableHead>Observação</CompactTableHead>
                                    <CompactTableHead className="text-center w-[60px]">Anexo</CompactTableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockLancamentos.filter(l => l.tipo === 'Receita').map((lanc) => (
                                    <CompactTableRow key={lanc.id}>
                                        <CompactTableCell>{formatDate(lanc.data)}</CompactTableCell>
                                        <CompactTableCell>{lanc.descricao}</CompactTableCell>
                                        <CompactTableCell className="text-right text-success font-medium">
                                            {formatCurrency(lanc.valor)}
                                        </CompactTableCell>
                                        <CompactTableCell>
                                            <Badge className={lanc.status === 'Conciliado' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>
                                                {lanc.status}
                                            </Badge>
                                        </CompactTableCell>
                                        <CompactTableCell className="text-muted-foreground text-xs max-w-[150px] truncate">
                                            -
                                        </CompactTableCell>
                                        <CompactTableCell className="text-center">
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled>
                                                <Paperclip className="w-4 h-4 text-muted-foreground" />
                                            </Button>
                                        </CompactTableCell>
                                    </CompactTableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow className="bg-muted/60 font-semibold">
                                    <CompactTableCell colSpan={2} className="text-right">Total Receitas</CompactTableCell>
                                    <CompactTableCell className="text-right text-success font-bold">
                                        {formatCurrency(mockLancamentos.filter(l => l.tipo === 'Receita').reduce((acc, l) => acc + l.valor, 0))}
                                    </CompactTableCell>
                                    <CompactTableCell colSpan={3} />
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </CompactTableWrapper>
                </TabsContent>

                {/* Tab: Despesas */}
                <TabsContent value="despesas" className="mt-6">
                    <CompactTableWrapper
                        title="Lançamentos de Despesa"
                        subtitle="Custos operacionais"
                        totalItems={mockLancamentos.filter(l => l.tipo === 'Despesa').length}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <CompactTableHead
                                        onSort={() => {
                                            setSortDespesas(prev =>
                                                prev?.field === 'data'
                                                    ? { field: 'data', dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                                                    : { field: 'data', dir: 'asc' }
                                            );
                                        }}
                                        sortDirection={sortDespesas?.field === 'data' ? sortDespesas.dir : null}
                                    >Data</CompactTableHead>
                                    <CompactTableHead
                                        onSort={() => {
                                            setSortDespesas(prev =>
                                                prev?.field === 'descricao'
                                                    ? { field: 'descricao', dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                                                    : { field: 'descricao', dir: 'asc' }
                                            );
                                        }}
                                        sortDirection={sortDespesas?.field === 'descricao' ? sortDespesas.dir : null}
                                    >Descrição</CompactTableHead>
                                    <CompactTableHead
                                        className="text-right"
                                        onSort={() => {
                                            setSortDespesas(prev =>
                                                prev?.field === 'valor'
                                                    ? { field: 'valor', dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                                                    : { field: 'valor', dir: 'desc' }
                                            );
                                        }}
                                        sortDirection={sortDespesas?.field === 'valor' ? sortDespesas.dir : null}
                                    >Valor</CompactTableHead>
                                    <CompactTableHead>Status</CompactTableHead>
                                    <CompactTableHead>Observação</CompactTableHead>
                                    <CompactTableHead className="text-center w-[60px]">Anexo</CompactTableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockLancamentos.filter(l => l.tipo === 'Despesa').map((lanc) => (
                                    <CompactTableRow key={lanc.id}>
                                        <CompactTableCell>{formatDate(lanc.data)}</CompactTableCell>
                                        <CompactTableCell>{lanc.descricao}</CompactTableCell>
                                        <CompactTableCell className="text-right text-destructive font-medium">
                                            {formatCurrency(lanc.valor)}
                                        </CompactTableCell>
                                        <CompactTableCell>
                                            <Badge className={lanc.status === 'Conciliado' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>
                                                {lanc.status}
                                            </Badge>
                                        </CompactTableCell>
                                        <CompactTableCell className="text-muted-foreground text-xs max-w-[150px] truncate">
                                            -
                                        </CompactTableCell>
                                        <CompactTableCell className="text-center">
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled>
                                                <Paperclip className="w-4 h-4 text-muted-foreground" />
                                            </Button>
                                        </CompactTableCell>
                                    </CompactTableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow className="bg-muted/60 font-semibold">
                                    <CompactTableCell colSpan={2} className="text-right">Total Despesas</CompactTableCell>
                                    <CompactTableCell className="text-right text-destructive font-bold">
                                        {formatCurrency(mockLancamentos.filter(l => l.tipo === 'Despesa').reduce((acc, l) => acc + l.valor, 0))}
                                    </CompactTableCell>
                                    <CompactTableCell colSpan={3} />
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </CompactTableWrapper>
                </TabsContent>

                {/* Tab: Mão de Obra */}
                <TabsContent value="mao-de-obra" className="mt-6">
                    <CompactTableWrapper
                        title="Custo de Mão de Obra"
                        subtitle="Baseado no registro de presença"
                        totalItems={mockPresencas.length}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <CompactTableHead
                                        onSort={() => {
                                            setSortMO(prev =>
                                                prev?.field === 'colaborador'
                                                    ? { field: 'colaborador', dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                                                    : { field: 'colaborador', dir: 'asc' }
                                            );
                                        }}
                                        sortDirection={sortMO?.field === 'colaborador' ? sortMO.dir : null}
                                    >Colaborador</CompactTableHead>
                                    <CompactTableHead>Cargo</CompactTableHead>
                                    <CompactTableHead
                                        className="text-right"
                                        onSort={() => {
                                            setSortMO(prev =>
                                                prev?.field === 'dias'
                                                    ? { field: 'dias', dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                                                    : { field: 'dias', dir: 'desc' }
                                            );
                                        }}
                                        sortDirection={sortMO?.field === 'dias' ? sortMO.dir : null}
                                    >Dias</CompactTableHead>
                                    <CompactTableHead className="text-right">Custo/Dia</CompactTableHead>
                                    <CompactTableHead
                                        className="text-right"
                                        onSort={() => {
                                            setSortMO(prev =>
                                                prev?.field === 'total'
                                                    ? { field: 'total', dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                                                    : { field: 'total', dir: 'desc' }
                                            );
                                        }}
                                        sortDirection={sortMO?.field === 'total' ? sortMO.dir : null}
                                    >Total</CompactTableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockPresencas.map((p) => (
                                    <CompactTableRow key={p.id}>
                                        <CompactTableCell className="font-medium">{p.colaborador}</CompactTableCell>
                                        <CompactTableCell>{p.cargo}</CompactTableCell>
                                        <CompactTableCell className="text-right">{p.diasTrabalhados}</CompactTableCell>
                                        <CompactTableCell className="text-right">{formatCurrency(p.custoDia)}</CompactTableCell>
                                        <CompactTableCell className="text-right font-medium">{formatCurrency(p.custoTotal)}</CompactTableCell>
                                    </CompactTableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow className="bg-muted/60 font-semibold">
                                    <CompactTableCell colSpan={4} className="text-right font-bold">Total Mão de Obra</CompactTableCell>
                                    <CompactTableCell className="text-right font-bold">
                                        {formatCurrency(mockPresencas.reduce((acc, p) => acc + p.custoTotal, 0))}
                                    </CompactTableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </CompactTableWrapper>
                </TabsContent>

                {/* Tab: Documentos */}
                <TabsContent value="documentos" className="mt-6">
                    <CompactTableWrapper
                        title="Documentos do Projeto"
                        subtitle="Documentos obrigatórios para encerramento"
                        totalItems={mockDocumentos.length}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <CompactTableHead
                                        onSort={() => {
                                            setSortDocs(prev =>
                                                prev?.field === 'nome'
                                                    ? { field: 'nome', dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                                                    : { field: 'nome', dir: 'asc' }
                                            );
                                        }}
                                        sortDirection={sortDocs?.field === 'nome' ? sortDocs.dir : null}
                                    >Documento</CompactTableHead>
                                    <CompactTableHead>Tipo</CompactTableHead>
                                    <CompactTableHead
                                        onSort={() => {
                                            setSortDocs(prev =>
                                                prev?.field === 'enviado'
                                                    ? { field: 'enviado', dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                                                    : { field: 'enviado', dir: 'desc' }
                                            );
                                        }}
                                        sortDirection={sortDocs?.field === 'enviado' ? sortDocs.dir : null}
                                    >Enviado</CompactTableHead>
                                    <CompactTableHead>Obrigatório</CompactTableHead>
                                    <CompactTableHead>Status</CompactTableHead>
                                    <CompactTableHead className="w-[80px]"></CompactTableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockDocumentos.map((doc) => (
                                    <CompactTableRow key={doc.id}>
                                        <CompactTableCell className="font-medium">{doc.nome}</CompactTableCell>
                                        <CompactTableCell>{doc.tipo}</CompactTableCell>
                                        <CompactTableCell>{doc.uploadedAt ? formatDate(doc.uploadedAt) : '-'}</CompactTableCell>
                                        <CompactTableCell>
                                            {doc.obrigatorio ? (
                                                <Badge variant="secondary">Obrigatório</Badge>
                                            ) : (
                                                <span className="text-muted-foreground">Opcional</span>
                                            )}
                                        </CompactTableCell>
                                        <CompactTableCell>
                                            {doc.status === 'ok' ? (
                                                <Badge className="bg-success/10 text-success">✓ Enviado</Badge>
                                            ) : (
                                                <Badge className="bg-warning/10 text-warning">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    Pendente
                                                </Badge>
                                            )}
                                        </CompactTableCell>
                                        <CompactTableCell>
                                            {doc.status === 'ok' ? (
                                                <Button variant="ghost" size="sm">
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            ) : (
                                                <Button variant="outline" size="sm">
                                                    Upload
                                                </Button>
                                            )}
                                        </CompactTableCell>
                                    </CompactTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CompactTableWrapper>
                </TabsContent>
            </Tabs>
        </div>
    );
}
