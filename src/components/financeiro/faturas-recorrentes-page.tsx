import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Receipt,
    Users,
    Building2,
    DollarSign,
    Plus,
    Search,
    CalendarDays,
    Briefcase,
    AlertTriangle,
    CheckCircle,
    Clock,
    XCircle,
    Calendar,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { KPICardFinanceiro, KPIFinanceiroGrid } from './kpi-card-financeiro';
import { CompactTableWrapper, CompactTableHead, CompactTableCell, CompactTableRow } from '@/components/shared/compact-table';
import { NovaDespesaModal } from '@/components/financeiro/modals/nova-despesa-modal';
import { PagarDespesaModal } from '@/components/financeiro/modals/pagar-despesa-modal';
import {
    useFaturasRecorrentes,
    useSalariosPrevistos,
    useFaturasKPIs
} from '@/lib/hooks/use-faturas-recorrentes';

// ============================================================
// MOCK DATA - FRONTEND-ONLY MODE
// ============================================================

const mockKPIs = {
    totalMensal: 57500,
    totalSalarios: 45000,
    totalContasFixas: 12500,
    colaboradoresAtivos: 15,
    proximoVencimento: '2025-01-05',
    contasVencidas: 2,
    valorVencido: 8500,
};

const mockSalarios = [
    {
        id: 'sal-001', colaborador: 'João Silva', cargo: 'Pedreiro', setor: 'Obras',
        salarioBase: 4095, encargos: 1884, beneficios: 450, custoTotal: 6429, vencimento: 5, status: 'ativo'
    },
    {
        id: 'sal-002', colaborador: 'Maria Santos', cargo: 'Servente', setor: 'Obras',
        salarioBase: 2628, encargos: 1209, beneficios: 450, custoTotal: 4287, vencimento: 5, status: 'ativo'
    },
    {
        id: 'sal-003', colaborador: 'Pedro Oliveira', cargo: 'Eletricista', setor: 'Obras',
        salarioBase: 5200, encargos: 2392, beneficios: 450, custoTotal: 8042, vencimento: 5, status: 'ativo'
    },
    {
        id: 'sal-004', colaborador: 'Ana Costa', cargo: 'Engenheira', setor: 'Assessoria',
        salarioBase: 8500, encargos: 3910, beneficios: 800, custoTotal: 13210, vencimento: 5, status: 'ativo'
    },
    {
        id: 'sal-005', colaborador: 'Carlos Lima', cargo: 'Auxiliar Administrativo', setor: 'Administrativo',
        salarioBase: 2200, encargos: 1012, beneficios: 450, custoTotal: 3662, vencimento: 5, status: 'ativo'
    },
];



// ============================================================
// COMPONENT
// ============================================================

/**
 * FaturasRecorrentesPage - Gestão de Despesas
 * 
 * Consolida:
 * - Salários (folha de pagamento)
 * - Contas fixas (despesas recorrentes)
 * - Contas a pagar pendentes (antes em contas-pagar)
 */
export function FaturasRecorrentesPage() {
    const [activeTab, setActiveTab] = useState('salarios');
    const [modalNovaDespesaOpen, setModalNovaDespesaOpen] = useState(false);
    const [modalPagarOpen, setModalPagarOpen] = useState(false);
    const [faturaParaPagar, setFaturaParaPagar] = useState<{ id: string; descricao: string; fornecedor: string; valor: number } | null>(null);

    // State para navegação de meses
    const [dataVisualizacao, setDataVisualizacao] = useState(new Date());

    // Handlers de navegação
    const handlePreviousMonth = () => {
        setDataVisualizacao(prev => {
            const d = new Date(prev);
            d.setMonth(d.getMonth() - 1);
            return d;
        });
    };

    const handleNextMonth = () => {
        setDataVisualizacao(prev => {
            const d = new Date(prev);
            d.setMonth(d.getMonth() + 1);
            return d;
        });
    };

    const monthLabel = dataVisualizacao.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    const capitalizedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

    // Filtros
    const [buscaSalarios, setBuscaSalarios] = useState('');
    const [buscaContasFixas, setBuscaContasFixas] = useState('');
    const [buscaContasVariaveis, setBuscaContasVariaveis] = useState('');
    const [buscaPendentes, setBuscaPendentes] = useState('');
    const [statusFiltro, setStatusFiltro] = useState<string>('todos');

    // Paginação
    const [pageSalarios, setPageSalarios] = useState(1);
    const [pageSizeSalarios, setPageSizeSalarios] = useState(10);
    const [pageContas, setPageContas] = useState(1);
    const [pageSizeContas, setPageSizeContas] = useState(10);
    const [pageContasVariaveis, setPageContasVariaveis] = useState(1);
    const [pageSizeContasVariaveis, setPageSizeContasVariaveis] = useState(10);
    const [pagePendentes, setPagePendentes] = useState(1);
    const [pageSizePendentes, setPageSizePendentes] = useState(10);

    // Ordenação
    const [sortFieldSalarios, setSortFieldSalarios] = useState<string | null>(null);
    const [sortDirSalarios, setSortDirSalarios] = useState<'asc' | 'desc' | null>(null);
    const [sortFieldContasFixas, setSortFieldContasFixas] = useState<string | null>(null);
    const [sortDirContasFixas, setSortDirContasFixas] = useState<'asc' | 'desc' | null>(null);
    const [sortFieldContasVariaveis, setSortFieldContasVariaveis] = useState<string | null>(null);
    const [sortDirContasVariaveis, setSortDirContasVariaveis] = useState<'asc' | 'desc' | null>(null);
    const [sortFieldPendentes, setSortFieldPendentes] = useState<string | null>(null);
    const [sortDirPendentes, setSortDirPendentes] = useState<'asc' | 'desc' | null>(null);

    // ========== HOOKS DE DADOS REAIS ==========
    const { data: faturasData, isLoading: faturasLoading } = useFaturasRecorrentes(dataVisualizacao);
    const { data: salariosData, isLoading: salariosLoading } = useSalariosPrevistos();
    const { data: kpisData, isLoading: kpisLoading } = useFaturasKPIs(dataVisualizacao);

    const isLoading = faturasLoading || salariosLoading || kpisLoading;

    // Dados com fallback para mock
    const salarios = salariosData && salariosData.length > 0
        ? salariosData.map(s => ({
            id: s.colaborador_id,
            colaborador: s.colaborador_nome,
            cargo: s.cargo,
            setor: s.setor,
            salarioBase: s.salario_base,
            encargos: s.encargos_estimados,
            beneficios: s.beneficios,
            custoTotal: s.custo_total,
            vencimento: 5,
            status: s.status,
        }))
        : mockSalarios;

    const contasFixas = faturasData
        ?.filter(f => f.tipo === 'fixa')
        .map(f => ({
            id: f.id,
            fornecedor: f.fornecedor,
            descricao: f.descricao,
            categoria: f.categoria,
            valor: f.valor,
            vencimento: f.dia_vencimento,
            status: f.status,
            tipo: f.tipo
        })) || [];

    const contasVariaveis = faturasData
        ?.filter(f => f.tipo === 'variavel')
        .map(f => ({
            id: f.id,
            fornecedor: f.fornecedor,
            descricao: f.descricao,
            categoria: f.categoria,
            valor: f.valor,
            vencimento: f.dia_vencimento,
            status: f.status,
            tipo: f.tipo
        })) || [];

    // Derivando pendentes de faturasData (status != 'pago') 
    // Nota: Isso pega apenas do mês atual conforme hook. Ideal seria endpoint específico de pendências globais.
    const contasPendentes = faturasData
        ?.filter(f => f.status !== 'pago')
        .map(f => ({
            id: f.id,
            fornecedor: f.fornecedor,
            descricao: f.descricao,
            categoria: f.categoria,
            tipo: f.tipo === 'fixa' ? 'Conta Fixa' : 'Variável',
            vencimento: f.vencimento,
            valor: f.valor,
            status: f.status,
            ccCodigo: f.cc_id ? 'CC-' + f.cc_id.slice(0, 4) : null // Mock CC code
        })) || [];

    const kpis = kpisData ?? mockKPIs;

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

    const salariosFiltrados = salarios.filter(s =>
        s.colaborador.toLowerCase().includes(buscaSalarios.toLowerCase()) ||
        s.cargo.toLowerCase().includes(buscaSalarios.toLowerCase())
    );

    const contasFixasFiltradas = contasFixas.filter(c =>
        c.fornecedor.toLowerCase().includes(buscaContasFixas.toLowerCase()) ||
        c.descricao.toLowerCase().includes(buscaContasFixas.toLowerCase())
    );

    const contasVariaveisFiltradas = contasVariaveis.filter(c =>
        c.fornecedor.toLowerCase().includes(buscaContasVariaveis.toLowerCase()) ||
        c.descricao.toLowerCase().includes(buscaContasVariaveis.toLowerCase())
    );

    const contasPendentesFiltradas = contasPendentes.filter(c => {
        const matchBusca = c.fornecedor.toLowerCase().includes(buscaPendentes.toLowerCase()) ||
            c.descricao.toLowerCase().includes(buscaPendentes.toLowerCase());
        const matchStatus = statusFiltro === 'todos' || c.status === statusFiltro;
        return matchBusca && matchStatus;
    });

    // Função de Ordenação Genérica
    const sortData = <T,>(data: T[], field: string | null, direction: 'asc' | 'desc' | null) => {
        if (!field || !direction) return data;

        return [...data].sort((a, b) => {
            const aValue = a[field as keyof T];
            const bValue = b[field as keyof T];

            if (aValue === bValue) return 0;

            const comparison = aValue < bValue ? -1 : 1;
            return direction === 'asc' ? comparison : -comparison;
        });
    };

    // Dados Ordenados
    const salariosSorted = sortData(salariosFiltrados, sortFieldSalarios, sortDirSalarios);
    const contasFixasSorted = sortData(contasFixasFiltradas, sortFieldContasFixas, sortDirContasFixas);
    const contasVariaveisSorted = sortData(contasVariaveisFiltradas, sortFieldContasVariaveis, sortDirContasVariaveis);
    const pendentesSorted = sortData(contasPendentesFiltradas, sortFieldPendentes, sortDirPendentes);

    // Dados Paginados
    const paginatedSalarios = salariosSorted.slice((pageSalarios - 1) * pageSizeSalarios, pageSalarios * pageSizeSalarios);
    const paginatedContasFixas = contasFixasSorted.slice((pageContas - 1) * pageSizeContas, pageContas * pageSizeContas);
    const paginatedContasVariaveis = contasVariaveisSorted.slice((pageContasVariaveis - 1) * pageSizeContasVariaveis, pageContasVariaveis * pageSizeContasVariaveis);
    const paginatedPendentes = pendentesSorted.slice((pagePendentes - 1) * pageSizePendentes, pagePendentes * pageSizePendentes);

    const totalSalarios = salariosFiltrados.reduce((acc, s) => acc + s.custoTotal, 0);
    const totalContasFixas = contasFixasFiltradas.reduce((acc, c) => acc + c.valor, 0);
    const totalContasVariaveis = contasVariaveisFiltradas.reduce((acc, c) => acc + c.valor, 0);
    const totalPendentes = contasPendentesFiltradas.reduce((acc, c) => acc + c.valor, 0);
    const totalAtrasado = contasPendentes.filter(c => c.status === 'atrasado').reduce((acc, c) => acc + c.valor, 0);

    // Handlers de Ordenação
    const handleSortSalarios = (field: string) => {
        if (sortFieldSalarios === field) {
            setSortDirSalarios(sortDirSalarios === 'asc' ? 'desc' : 'asc');
        } else {
            setSortFieldSalarios(field);
            setSortDirSalarios('asc');
        }
    };

    const handleSortContasFixas = (field: string) => {
        if (sortFieldContasFixas === field) {
            setSortDirContasFixas(sortDirContasFixas === 'asc' ? 'desc' : 'asc');
        } else {
            setSortFieldContasFixas(field);
            setSortDirContasFixas('asc');
        }
    };

    const handleSortContasVariaveis = (field: string) => {
        if (sortFieldContasVariaveis === field) {
            setSortDirContasVariaveis(sortDirContasVariaveis === 'asc' ? 'desc' : 'asc');
        } else {
            setSortFieldContasVariaveis(field);
            setSortDirContasVariaveis('asc');
        }
    };

    const handleSortPendentes = (field: string) => {
        if (sortFieldPendentes === field) {
            setSortDirPendentes(sortDirPendentes === 'asc' ? 'desc' : 'asc');
        } else {
            setSortFieldPendentes(field);
            setSortDirPendentes('asc');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pago':
                return <Badge className="bg-success/10 text-success"><CheckCircle className="w-3 h-3 mr-1" />Pago</Badge>;
            case 'atrasado':
                return <Badge className="bg-destructive/10 text-destructive"><XCircle className="w-3 h-3 mr-1" />Atrasado</Badge>;
            case 'em_aberto':
                return <Badge className="bg-warning/10 text-warning"><Clock className="w-3 h-3 mr-1" />Em Aberto</Badge>;
            case 'futuro':
                return <Badge className="bg-muted text-muted-foreground"><Calendar className="w-3 h-3 mr-1" />Futuro</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTipoBadge = (tipo: string) => {
        switch (tipo) {
            case 'Salário':
                return <Badge className="bg-primary/10 text-primary">{tipo}</Badge>;
            case 'Conta Fixa':
                return <Badge className="bg-secondary/10 text-secondary">{tipo}</Badge>;
            case 'Material':
                return <Badge className="bg-warning/10 text-warning">{tipo}</Badge>;
            case 'Imposto':
                return <Badge className="bg-destructive/10 text-destructive">{tipo}</Badge>;
            default:
                return <Badge variant="outline">{tipo}</Badge>;
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* ========== Header ========== */}
            <PageHeader
                title="Despesas"
                subtitle="Salários, contas fixas e contas a pagar"
                showBackButton
            >
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-card border rounded-md p-1 shadow-sm">
                        <Button variant="ghost" size="icon" onClick={handlePreviousMonth} className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[140px] text-center font-medium capitalize text-sm">
                            {capitalizedMonth}
                        </span>
                        <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button onClick={() => setModalNovaDespesaOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Despesa
                    </Button>
                </div>
            </PageHeader>

            {/* ========== Alerta de Contas Vencidas ========== */}
            {totalAtrasado > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
                    <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">
                        <span className="font-semibold">{contasPendentes.filter(c => c.status === 'atrasado').length} conta(s) vencida(s)</span>
                        {' '}totalizando <span className="font-semibold">{formatCurrency(totalAtrasado)}</span>.
                        Veja na aba "Contas Pendentes".
                    </p>
                </div>
            )}

            {/* ========== KPIs ========== */}
            <KPIFinanceiroGrid columns={4}>
                <KPICardFinanceiro
                    title="Total Mensal"
                    value={'totalFaturasMes' in kpis ? kpis.totalFaturasMes : kpis.totalMensal}
                    icon={<DollarSign className="w-6 h-6" />}
                    variant="destructive"
                    subtitle="Despesas fixas"
                    loading={isLoading}
                />
                <KPICardFinanceiro
                    title="Salários"
                    value={'folhaPagamento' in kpis ? kpis.folhaPagamento : kpis.totalSalarios}
                    icon={<Users className="w-6 h-6" />}
                    variant="primary"
                    subtitle={`${salarios.length} colaboradores`}
                    loading={isLoading}
                />
                <KPICardFinanceiro
                    title="Contas Fixas"
                    value={'contasFixas' in kpis ? kpis.contasFixas : kpis.totalContasFixas}
                    icon={<Receipt className="w-6 h-6" />}
                    variant="warning"
                    subtitle={`${contasFixas.length} fornecedores`}
                    loading={isLoading}
                />
                <KPICardFinanceiro
                    title="Vencido"
                    value={totalAtrasado}
                    icon={<AlertTriangle className="w-6 h-6" />}
                    variant={totalAtrasado > 0 ? "destructive" : "neutral"}
                    subtitle={totalAtrasado > 0 ? "Pendente pagamento" : "Nada vencido"}
                    loading={isLoading}
                />
            </KPIFinanceiroGrid>

            {/* ========== Tabs ========== */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="salarios" className="gap-2">
                        <Briefcase className="w-4 h-4" />
                        Salários ({salarios.length})
                    </TabsTrigger>
                    <TabsTrigger value="contas-fixas" className="gap-2">
                        <Building2 className="w-4 h-4" />
                        Contas Fixas ({contasFixas.length})
                    </TabsTrigger>
                    <TabsTrigger value="contas-variaveis" className="gap-2">
                        <DollarSign className="w-4 h-4" />
                        Contas Variáveis ({contasVariaveis.length})
                    </TabsTrigger>
                    <TabsTrigger value="pendentes" className="gap-2">
                        <Clock className="w-4 h-4" />
                        Contas Pendentes ({contasPendentes.length})
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Salários */}
                {/* Tab: Salários */}
                <TabsContent value="salarios" className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar colaborador..."
                                value={buscaSalarios}
                                onChange={(e) => setBuscaSalarios(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <CompactTableWrapper
                        title="Folha de Pagamento"
                        subtitle="Vencimento: Dia 05 | Encargos CLT: 46%"
                        totalItems={salariosFiltrados.length}
                        page={pageSalarios}
                        pageSize={pageSizeSalarios}
                        onPageChange={setPageSalarios}
                        onPageSizeChange={setPageSizeSalarios}
                        isLoading={isLoading}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <CompactTableHead
                                        onSort={() => handleSortSalarios('colaborador')}
                                        sortDirection={sortFieldSalarios === 'colaborador' ? sortDirSalarios : null}
                                    >Colaborador</CompactTableHead>
                                    <CompactTableHead
                                        onSort={() => handleSortSalarios('cargo')}
                                        sortDirection={sortFieldSalarios === 'cargo' ? sortDirSalarios : null}
                                    >Cargo</CompactTableHead>
                                    <CompactTableHead>Setor</CompactTableHead>
                                    <CompactTableHead className="text-right">Salário Base</CompactTableHead>
                                    <CompactTableHead className="text-right">Encargos</CompactTableHead>
                                    <CompactTableHead className="text-right">Benefícios</CompactTableHead>
                                    <CompactTableHead
                                        className="text-right"
                                        onSort={() => handleSortSalarios('custoTotal')}
                                        sortDirection={sortFieldSalarios === 'custoTotal' ? sortDirSalarios : null}
                                    >Custo Total</CompactTableHead>
                                    <CompactTableHead>Status</CompactTableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedSalarios.map((sal) => (
                                    <CompactTableRow key={sal.id}>
                                        <CompactTableCell className="font-medium">{sal.colaborador}</CompactTableCell>
                                        <CompactTableCell>{sal.cargo}</CompactTableCell>
                                        <CompactTableCell>
                                            <Badge variant="outline">{sal.setor}</Badge>
                                        </CompactTableCell>
                                        <CompactTableCell className="text-right">{formatCurrency(sal.salarioBase)}</CompactTableCell>
                                        <CompactTableCell className="text-right text-neutral-500">
                                            {formatCurrency(sal.encargos)}
                                        </CompactTableCell>
                                        <CompactTableCell className="text-right text-neutral-500">
                                            {formatCurrency(sal.beneficios)}
                                        </CompactTableCell>
                                        <CompactTableCell className="text-right font-bold text-destructive">
                                            {formatCurrency(sal.custoTotal)}
                                        </CompactTableCell>
                                        <CompactTableCell>
                                            <Badge className="bg-success/10 text-success">Ativo</Badge>
                                        </CompactTableCell>
                                    </CompactTableRow>
                                ))}
                            </TableBody>
                            <TableFooter className="bg-muted/50 font-medium">
                                <TableRow>
                                    <CompactTableCell colSpan={6} className="text-right p-4 uppercase text-xs text-muted-foreground">Total Mensal</CompactTableCell>
                                    <CompactTableCell className="text-right p-4 font-bold text-destructive">
                                        {formatCurrency(totalSalarios)}
                                    </CompactTableCell>
                                    <CompactTableCell></CompactTableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </CompactTableWrapper>
                </TabsContent>

                {/* Tab: Contas Fixas */}
                <TabsContent value="contas-fixas" className="space-y-4">
                    {/* Tab: Contas Fixas */}
                    <TabsContent value="contas-fixas" className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar conta..."
                                    value={buscaContasFixas}
                                    onChange={(e) => setBuscaContasFixas(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <CompactTableWrapper
                            title="Despesas Fixas Mensais"
                            subtitle="Contas recorrentes com fornecedores"
                            totalItems={contasFixasFiltradas.length}
                            page={pageContas}
                            pageSize={pageSizeContas}
                            onPageChange={setPageContas}
                            onPageSizeChange={setPageSizeContas}
                            isLoading={isLoading}
                        >
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40">
                                        <CompactTableHead
                                            onSort={() => handleSortContasFixas('fornecedor')}
                                            sortDirection={sortFieldContasFixas === 'fornecedor' ? sortDirContasFixas : null}
                                        >Fornecedor</CompactTableHead>
                                        <CompactTableHead
                                            onSort={() => handleSortContasFixas('descricao')}
                                            sortDirection={sortFieldContasFixas === 'descricao' ? sortDirContasFixas : null}
                                        >Descrição</CompactTableHead>
                                        <CompactTableHead
                                            onSort={() => handleSortContasFixas('categoria')}
                                            sortDirection={sortFieldContasFixas === 'categoria' ? sortDirContasFixas : null}
                                        >Categoria</CompactTableHead>
                                        <CompactTableHead
                                            className="text-center"
                                            onSort={() => handleSortContasFixas('vencimento')}
                                            sortDirection={sortFieldContasFixas === 'vencimento' ? sortDirContasFixas : null}
                                        >Vencimento</CompactTableHead>
                                        <CompactTableHead
                                            className="text-right"
                                            onSort={() => handleSortContasFixas('valor')}
                                            sortDirection={sortFieldContasFixas === 'valor' ? sortDirContasFixas : null}
                                        >Valor</CompactTableHead>
                                        <CompactTableHead>Status</CompactTableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedContasFixas.map((conta) => (
                                        <CompactTableRow key={conta.id}>
                                            <CompactTableCell className="font-medium">{conta.fornecedor}</CompactTableCell>
                                            <CompactTableCell>{conta.descricao}</CompactTableCell>
                                            <CompactTableCell>
                                                <Badge variant="secondary">{conta.categoria}</Badge>
                                            </CompactTableCell>
                                            <CompactTableCell className="text-center">
                                                <Badge variant="outline">Dia {conta.vencimento}</Badge>
                                            </CompactTableCell>
                                            <CompactTableCell className="text-right font-bold text-destructive">
                                                {formatCurrency(conta.valor)}
                                            </CompactTableCell>
                                            <CompactTableCell>
                                                <Badge className="bg-success/10 text-success">Ativo</Badge>
                                            </CompactTableCell>
                                        </CompactTableRow>
                                    ))}
                                </TableBody>
                                <TableFooter className="bg-muted/50 font-medium">
                                    <TableRow>
                                        <CompactTableCell colSpan={4} className="text-right p-4 uppercase text-xs text-muted-foreground">Total Mensal</CompactTableCell>
                                        <CompactTableCell className="text-right p-4 font-bold text-destructive">
                                            {formatCurrency(totalContasFixas)}
                                        </CompactTableCell>
                                        <CompactTableCell></CompactTableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </CompactTableWrapper>
                    </TabsContent>
                </TabsContent>

                <TabsContent value="contas-variaveis" className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar variável..."
                                value={buscaContasVariaveis}
                                onChange={(e) => setBuscaContasVariaveis(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <CompactTableWrapper
                        title="Despesas Variáveis"
                        subtitle="Contas avulsas ou parceladas"
                        totalItems={contasVariaveisFiltradas.length}
                        page={pageContasVariaveis}
                        pageSize={pageSizeContasVariaveis}
                        onPageChange={setPageContasVariaveis}
                        onPageSizeChange={setPageSizeContasVariaveis}
                        isLoading={isLoading}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <CompactTableHead
                                        onSort={() => handleSortContasVariaveis('fornecedor')}
                                        sortDirection={sortFieldContasVariaveis === 'fornecedor' ? sortDirContasVariaveis : null}
                                    >Fornecedor</CompactTableHead>
                                    <CompactTableHead
                                        onSort={() => handleSortContasVariaveis('descricao')}
                                        sortDirection={sortFieldContasVariaveis === 'descricao' ? sortDirContasVariaveis : null}
                                    >Descrição</CompactTableHead>
                                    <CompactTableHead>Categoria</CompactTableHead>
                                    <CompactTableHead
                                        className="text-center"
                                        onSort={() => handleSortContasVariaveis('vencimento')}
                                        sortDirection={sortFieldContasVariaveis === 'vencimento' ? sortDirContasVariaveis : null}
                                    >Vencimento</CompactTableHead>
                                    <CompactTableHead
                                        className="text-right"
                                        onSort={() => handleSortContasVariaveis('valor')}
                                        sortDirection={sortFieldContasVariaveis === 'valor' ? sortDirContasVariaveis : null}
                                    >Valor</CompactTableHead>
                                    <CompactTableHead>Status</CompactTableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedContasVariaveis.map((conta) => (
                                    <CompactTableRow key={conta.id}>
                                        <CompactTableCell className="font-medium">{conta.fornecedor}</CompactTableCell>
                                        <CompactTableCell>{conta.descricao}</CompactTableCell>
                                        <CompactTableCell>
                                            <Badge variant="secondary">{conta.categoria}</Badge>
                                        </CompactTableCell>
                                        <CompactTableCell className="text-center">
                                            <Badge variant="outline">Dia {conta.vencimento}</Badge>
                                        </CompactTableCell>
                                        <CompactTableCell className="text-right font-bold text-destructive">
                                            {formatCurrency(conta.valor)}
                                        </CompactTableCell>
                                        <CompactTableCell>
                                            <Badge className="bg-success/10 text-success">Ativo</Badge>
                                        </CompactTableCell>
                                    </CompactTableRow>
                                ))}
                            </TableBody>
                            <TableFooter className="bg-muted/50 font-medium">
                                <TableRow>
                                    <CompactTableCell colSpan={4} className="text-right p-4 uppercase text-xs text-muted-foreground">Total Variável</CompactTableCell>
                                    <CompactTableCell className="text-right p-4 font-bold text-destructive">
                                        {formatCurrency(totalContasVariaveis)}
                                    </CompactTableCell>
                                    <CompactTableCell></CompactTableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </CompactTableWrapper>
                </TabsContent>

                <TabsContent value="pendentes" className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar..."
                                    value={buscaPendentes}
                                    onChange={(e) => setBuscaPendentes(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos</SelectItem>
                                    <SelectItem value="atrasado">Atrasado</SelectItem>
                                    <SelectItem value="em_aberto">Em Aberto</SelectItem>
                                    <SelectItem value="futuro">Futuro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <CompactTableWrapper
                        title="Contas a Pagar"
                        subtitle={`${contasPendentesFiltradas.length} conta(s) pendente(s)`}
                        totalItems={contasPendentesFiltradas.length}
                        page={pagePendentes}
                        pageSize={pageSizePendentes}
                        onPageChange={setPagePendentes}
                        onPageSizeChange={setPageSizePendentes}
                        isLoading={isLoading}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <CompactTableHead
                                        onSort={() => handleSortPendentes('fornecedor')}
                                        sortDirection={sortFieldPendentes === 'fornecedor' ? sortDirPendentes : null}
                                    >Fornecedor</CompactTableHead>
                                    <CompactTableHead
                                        onSort={() => handleSortPendentes('descricao')}
                                        sortDirection={sortFieldPendentes === 'descricao' ? sortDirPendentes : null}
                                    >Descrição</CompactTableHead>
                                    <CompactTableHead>Tipo</CompactTableHead>
                                    <CompactTableHead>Centro de Custo</CompactTableHead>
                                    <CompactTableHead
                                        onSort={() => handleSortPendentes('vencimento')}
                                        sortDirection={sortFieldPendentes === 'vencimento' ? sortDirPendentes : null}
                                    >Vencimento</CompactTableHead>
                                    <CompactTableHead
                                        className="text-right"
                                        onSort={() => handleSortPendentes('valor')}
                                        sortDirection={sortFieldPendentes === 'valor' ? sortDirPendentes : null}
                                    >Valor</CompactTableHead>
                                    <CompactTableHead>Status</CompactTableHead>
                                    <CompactTableHead>Ações</CompactTableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedPendentes.map((conta) => (
                                    <CompactTableRow
                                        key={conta.id}
                                        className={conta.status === 'atrasado' ? 'bg-destructive/5 hover:bg-destructive/10' : ''}
                                    >
                                        <CompactTableCell className="font-medium">{conta.fornecedor}</CompactTableCell>
                                        <CompactTableCell>{conta.descricao}</CompactTableCell>
                                        <CompactTableCell>{getTipoBadge(conta.tipo)}</CompactTableCell>
                                        <CompactTableCell>
                                            {conta.ccCodigo ? (
                                                <Badge variant="outline">{conta.ccCodigo}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </CompactTableCell>
                                        <CompactTableCell>
                                            <span className="flex items-center gap-1">
                                                <CalendarDays className="w-3 h-3 text-muted-foreground" />
                                                {formatDate(conta.vencimento)}
                                            </span>
                                        </CompactTableCell>
                                        <CompactTableCell className="text-right font-bold text-destructive">
                                            {formatCurrency(conta.valor)}
                                        </CompactTableCell>
                                        <CompactTableCell>{getStatusBadge(conta.status)}</CompactTableCell>
                                        <CompactTableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8"
                                                onClick={() => {
                                                    setFaturaParaPagar({
                                                        id: conta.id,
                                                        descricao: conta.descricao,
                                                        fornecedor: conta.fornecedor,
                                                        valor: conta.valor
                                                    });
                                                    setModalPagarOpen(true);
                                                }}
                                            >
                                                Pagar
                                            </Button>
                                        </CompactTableCell>
                                    </CompactTableRow>
                                ))}
                            </TableBody>
                            <TableFooter className="bg-muted/50 font-medium">
                                <TableRow>
                                    <CompactTableCell colSpan={6} className="text-right p-4 uppercase text-xs text-muted-foreground">Total Pendente</CompactTableCell>
                                    <CompactTableCell className="text-right p-4 font-bold text-destructive">
                                        {formatCurrency(totalPendentes)}
                                    </CompactTableCell>
                                    <CompactTableCell></CompactTableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </CompactTableWrapper>
                </TabsContent>
            </Tabs>

            <NovaDespesaModal
                open={modalNovaDespesaOpen}
                onOpenChange={setModalNovaDespesaOpen}
            />

            <PagarDespesaModal
                open={modalPagarOpen}
                onOpenChange={setModalPagarOpen}
                fatura={faturaParaPagar}
                onSuccess={() => {
                    // Refresh data happens via react-query invalidation in hook
                }}
            />
        </div>
    );
}
