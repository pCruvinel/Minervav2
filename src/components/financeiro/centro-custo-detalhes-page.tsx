import { useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { KPICardFinanceiro, KPIFinanceiroGrid } from './kpi-card-financeiro';

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
    const [isLoading] = useState(false);

    const cc = mockCentroCusto; // Em produção: useCentroCusto(ccId)

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
                            <span className="font-medium">{cc.cliente}</span> •
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
                    <Card className="shadow-card">
                        <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                            <CardTitle className="text-base font-semibold">Detalhamento por Categoria</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Categoria</TableHead>
                                        <TableHead className="text-right">Previsto</TableHead>
                                        <TableHead className="text-right">Realizado</TableHead>
                                        <TableHead className="text-right">Variação</TableHead>
                                        <TableHead className="text-right">% Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cc.custosPorCategoria.map((cat) => {
                                        const variacao = cat.realizado - cat.previsto;
                                        const variacaoPercent = ((variacao / cat.previsto) * 100).toFixed(1);
                                        return (
                                            <TableRow key={cat.categoria}>
                                                <TableCell className="font-medium">{cat.categoria}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(cat.previsto)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(cat.realizado)}</TableCell>
                                                <TableCell className={`text-right font-medium ${variacao > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {variacao > 0 ? '+' : ''}{formatCurrency(variacao)} ({variacaoPercent}%)
                                                </TableCell>
                                                <TableCell className="text-right">{cat.percentual}%</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Receitas */}
                <TabsContent value="receitas" className="mt-6">
                    <Card className="shadow-card">
                        <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                            <CardTitle className="text-base font-semibold">Lançamentos de Receita</CardTitle>
                            <CardDescription>Parcelas e entradas vinculadas</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead className="text-right">Valor</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockLancamentos.filter(l => l.tipo === 'Receita').map((lanc) => (
                                        <TableRow key={lanc.id}>
                                            <TableCell>{formatDate(lanc.data)}</TableCell>
                                            <TableCell>{lanc.descricao}</TableCell>
                                            <TableCell className="text-right text-green-600 font-medium">
                                                {formatCurrency(lanc.valor)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={lanc.status === 'Conciliado' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}>
                                                    {lanc.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Despesas */}
                <TabsContent value="despesas" className="mt-6">
                    <Card className="shadow-card">
                        <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                            <CardTitle className="text-base font-semibold">Lançamentos de Despesa</CardTitle>
                            <CardDescription>Custos operacionais</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead className="text-right">Valor</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockLancamentos.filter(l => l.tipo === 'Despesa').map((lanc) => (
                                        <TableRow key={lanc.id}>
                                            <TableCell>{formatDate(lanc.data)}</TableCell>
                                            <TableCell>{lanc.descricao}</TableCell>
                                            <TableCell className="text-right text-red-600 font-medium">
                                                {formatCurrency(lanc.valor)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={lanc.status === 'Conciliado' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}>
                                                    {lanc.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Mão de Obra */}
                <TabsContent value="mao-de-obra" className="mt-6">
                    <Card className="shadow-card">
                        <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                            <CardTitle className="text-base font-semibold">Custo de Mão de Obra</CardTitle>
                            <CardDescription>Baseado no registro de presença</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Colaborador</TableHead>
                                        <TableHead>Cargo</TableHead>
                                        <TableHead className="text-right">Dias</TableHead>
                                        <TableHead className="text-right">Custo/Dia</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockPresencas.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium">{p.colaborador}</TableCell>
                                            <TableCell>{p.cargo}</TableCell>
                                            <TableCell className="text-right">{p.diasTrabalhados}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(p.custoDia)}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(p.custoTotal)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="bg-muted/50">
                                        <TableCell colSpan={4} className="font-bold">Total</TableCell>
                                        <TableCell className="text-right font-bold">
                                            {formatCurrency(mockPresencas.reduce((acc, p) => acc + p.custoTotal, 0))}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Documentos */}
                <TabsContent value="documentos" className="mt-6">
                    <Card className="shadow-card">
                        <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                            <CardTitle className="text-base font-semibold">Documentos do Projeto</CardTitle>
                            <CardDescription>
                                Documentos obrigatórios para encerramento
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Documento</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Enviado</TableHead>
                                        <TableHead>Obrigatório</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockDocumentos.map((doc) => (
                                        <TableRow key={doc.id}>
                                            <TableCell className="font-medium">{doc.nome}</TableCell>
                                            <TableCell>{doc.tipo}</TableCell>
                                            <TableCell>{doc.uploadedAt ? formatDate(doc.uploadedAt) : '-'}</TableCell>
                                            <TableCell>
                                                {doc.obrigatorio ? (
                                                    <Badge variant="secondary">Obrigatório</Badge>
                                                ) : (
                                                    <span className="text-neutral-500">Opcional</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {doc.status === 'ok' ? (
                                                    <Badge className="bg-green-100 text-green-600">✓ Enviado</Badge>
                                                ) : (
                                                    <Badge className="bg-yellow-100 text-yellow-600">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        Pendente
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {doc.status === 'ok' ? (
                                                    <Button variant="ghost" size="sm">
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                ) : (
                                                    <Button variant="outline" size="sm">
                                                        Upload
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
