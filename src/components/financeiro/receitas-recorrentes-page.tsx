import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableFooter, TableHeader, TableRow } from '@/components/ui/table';
import {
    TrendingUp,
    Calendar,
    DollarSign,
    Plus,
    Search,
    RefreshCw,
    Eye,
    Building2,
    FileText,
    Loader2,
    AlertTriangle,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { KPICardFinanceiro, KPIFinanceiroGrid } from './kpi-card-financeiro';
import { CompactTableWrapper, CompactTableHead, CompactTableCell, CompactTableRow } from '@/components/shared/compact-table';
import { useNavigate } from '@tanstack/react-router';
import {
    useReceitasRecorrentes,
    useParcelasPendentes,
    useReceitasKPIs,
} from '@/lib/hooks/use-receitas-recorrentes';

// ============================================================
// TYPES LOCAIS
// ============================================================

/** Tipo local para receita mapeada dos hooks */
interface ReceitaMapeada {
    id: string;
    ccId: string;
    ccCodigo: string;
    cliente: string;
    tipo: string;
    valorMensal: number;
    frequencia: string;
    dataInicio: string;
    dataFim: string | null;
    parcelasPagas: number;
    parcelasTotal: number;
    proximoVencimento: string;
    reajusteAnual: number;
    status: string;
}

// Mock para parcelas do contrato (usado no Dialog de detalhes)
const mockParcelasContrato = [
    { parcela: 1, vencimento: '2024-02-05', valor: 4200, status: 'Pago', dataPagamento: '2024-02-03' },
    { parcela: 2, vencimento: '2024-03-05', valor: 4200, status: 'Pago', dataPagamento: '2024-03-05' },
    { parcela: 3, vencimento: '2024-04-05', valor: 4200, status: 'Pago', dataPagamento: '2024-04-04' },
    { parcela: 4, vencimento: '2024-05-05', valor: 4200, status: 'Pago', dataPagamento: '2024-05-06' },
    { parcela: 5, vencimento: '2024-06-05', valor: 4200, status: 'Pago', dataPagamento: '2024-06-05' },
    { parcela: 6, vencimento: '2024-07-05', valor: 4200, status: 'Pago', dataPagamento: '2024-07-04' },
    { parcela: 7, vencimento: '2024-08-05', valor: 4200, status: 'Pago', dataPagamento: '2024-08-05' },
    { parcela: 8, vencimento: '2024-09-05', valor: 4200, status: 'Pago', dataPagamento: '2024-09-05' },
    { parcela: 9, vencimento: '2024-10-05', valor: 4200, status: 'Pago', dataPagamento: '2024-10-07' },
    { parcela: 10, vencimento: '2024-11-05', valor: 4200, status: 'Pago', dataPagamento: '2024-11-05' },
    { parcela: 11, vencimento: '2024-12-05', valor: 4200, status: 'Pendente', dataPagamento: null },
    { parcela: 12, vencimento: '2025-01-05', valor: 4284, status: 'Futuro', dataPagamento: null },
];

// ============================================================
// COMPONENT
// ============================================================

/**
 * ReceitasRecorrentesPage - Gestão de Receitas Recorrentes (Refatorada)
 * 
 * Design System v2.0:
 * - Alerta minimalista inline
 * - Filtros compactos sem card wrapper
 * - CompactTableWrapper com linha de totais
 */
export function ReceitasRecorrentesPage() {
    const navigate = useNavigate();
    const [busca, setBusca] = useState('');
    const [tipoFiltro, setTipoFiltro] = useState<string>('todos');
    const [statusParcela, setStatusParcela] = useState<string>('todos');
    const [parcelasDialogOpen, setParcelasDialogOpen] = useState(false);
    const [selectedReceita, setSelectedReceita] = useState<ReceitaMapeada | null>(null);

    // Paginação
    const [pageContratos, setPageContratos] = useState(1);
    const [pageParcelas, setPageParcelas] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Sorting - Contratos
    type SortFieldContratos = 'ccCodigo' | 'cliente' | 'tipo' | 'proximoVencimento' | 'valorMensal';
    const [sortFieldContratos, setSortFieldContratos] = useState<SortFieldContratos | null>(null);
    const [sortDirContratos, setSortDirContratos] = useState<'asc' | 'desc'>('asc');

    // Sorting - Parcelas
    type SortFieldParcelas = 'cliente' | 'ccCodigo' | 'vencimento' | 'valor' | 'status';
    const [sortFieldParcelas, setSortFieldParcelas] = useState<SortFieldParcelas | null>(null);
    const [sortDirParcelas, setSortDirParcelas] = useState<'asc' | 'desc'>('asc');

    // ========== HOOKS DE DADOS REAIS ==========
    const { data: receitasData, isLoading: receitasLoading } = useReceitasRecorrentes();
    const { data: parcelasData, isLoading: parcelasLoading } = useParcelasPendentes();
    const { data: kpisData, isLoading: kpisLoading } = useReceitasKPIs();

    const isLoading = receitasLoading || parcelasLoading || kpisLoading;

    // Dados reais mapeados (sem fallback para mock)
    const receitas = (receitasData || []).map(r => ({
        id: r.id,
        ccId: r.contrato_id,
        ccCodigo: r.contrato_numero,
        cliente: r.cliente_nome,
        tipo: 'Contrato',
        valorMensal: r.valor_mensal,
        frequencia: 'Mensal',
        dataInicio: '',
        dataFim: null,
        parcelasPagas: r.parcelas_pagas,
        parcelasTotal: r.parcelas_total,
        proximoVencimento: r.proxima_cobranca,
        reajusteAnual: 0,
        status: r.status,
    }));

    const parcelas = (parcelasData || []).map(p => ({
        id: p.id,
        cliente: p.cliente_nome,
        ccCodigo: p.descricao,
        ccId: p.cc_id ?? p.contrato_id,
        contrato: `Parcela ${p.parcela_num}/${p.total_parcelas}`,
        parcela: `${p.parcela_num}/${p.total_parcelas}`,
        vencimento: p.vencimento,
        valor: p.valor_previsto,
        status: p.dias_atraso > 0 ? 'inadimplente' : p.status === 'pendente' ? 'em_aberto' : p.status,
    }));

    // KPIs com valores default quando não há dados
    const kpis = kpisData ?? {
        totalReceitasMes: 0,
        recebidoMes: 0,
        pendenteMes: 0,
        atrasadoMes: 0,
        contratosAtivos: 0,
        ticketMedio: 0,
    };

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

    const isInadimplente = (vencimento: string, status: string) => {
        if (status === 'conciliado' || status === 'pago') return false;
        return new Date() > new Date(vencimento);
    };

    const receitasFiltradas = receitas.filter(r => {
        const matchBusca = r.cliente.toLowerCase().includes(busca.toLowerCase()) ||
            r.ccCodigo.toLowerCase().includes(busca.toLowerCase());
        const matchTipo = tipoFiltro === 'todos' || r.tipo === tipoFiltro;
        return matchBusca && matchTipo;
    });

    const parcelasFiltradas = parcelas.filter(p => {
        const matchBusca = p.cliente.toLowerCase().includes(busca.toLowerCase()) ||
            p.ccCodigo.toLowerCase().includes(busca.toLowerCase());
        const matchStatus = statusParcela === 'todos' || p.status === statusParcela;
        return matchBusca && matchStatus;
    });

    const totalInadimplente = parcelas
        .filter(p => p.status === 'inadimplente')
        .reduce((acc, p) => acc + p.valor, 0);

    const totalValorReceitas = receitasFiltradas.reduce((acc, r) => acc + r.valorMensal, 0);
    const totalValorParcelas = parcelasFiltradas.reduce((acc, p) => acc + p.valor, 0);

    // Sorting helper
    const handleSortContratos = (field: SortFieldContratos) => {
        if (sortFieldContratos === field) {
            setSortDirContratos(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortFieldContratos(field);
            setSortDirContratos('asc');
        }
    };

    const handleSortParcelas = (field: SortFieldParcelas) => {
        if (sortFieldParcelas === field) {
            setSortDirParcelas(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortFieldParcelas(field);
            setSortDirParcelas('asc');
        }
    };

    // Sorted data
    const receitasOrdenadas = [...receitasFiltradas].sort((a, b) => {
        if (!sortFieldContratos) return 0;
        const multiplier = sortDirContratos === 'asc' ? 1 : -1;
        switch (sortFieldContratos) {
            case 'ccCodigo':
            case 'cliente':
            case 'tipo':
                return a[sortFieldContratos].localeCompare(b[sortFieldContratos]) * multiplier;
            case 'proximoVencimento':
                return (new Date(a.proximoVencimento || '').getTime() - new Date(b.proximoVencimento || '').getTime()) * multiplier;
            case 'valorMensal':
                return (a.valorMensal - b.valorMensal) * multiplier;
            default:
                return 0;
        }
    });

    const parcelasOrdenadas = [...parcelasFiltradas].sort((a, b) => {
        if (!sortFieldParcelas) return 0;
        const multiplier = sortDirParcelas === 'asc' ? 1 : -1;
        switch (sortFieldParcelas) {
            case 'cliente':
            case 'ccCodigo':
            case 'status':
                return a[sortFieldParcelas].localeCompare(b[sortFieldParcelas]) * multiplier;
            case 'vencimento':
                return (new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime()) * multiplier;
            case 'valor':
                return (a.valor - b.valor) * multiplier;
            default:
                return 0;
        }
    });

    // Paginação com dados ordenados
    const paginatedReceitas = receitasOrdenadas.slice((pageContratos - 1) * itemsPerPage, pageContratos * itemsPerPage);
    const paginatedParcelas = parcelasOrdenadas.slice((pageParcelas - 1) * itemsPerPage, pageParcelas * itemsPerPage);

    const handleVerParcelas = (receita: ReceitaMapeada) => {
        setSelectedReceita(receita);
        setParcelasDialogOpen(true);
    };

    const handleVerCC = (ccId: string) => {
        navigate({ to: '/financeiro/centro-custo/$ccId', params: { ccId } });
    };

    const getStatusBadge = (status: string, vencimento?: string) => {
        const isOverdue = vencimento ? isInadimplente(vencimento, status) : false;
        const finalStatus = isOverdue ? 'inadimplente' : status;

        switch (finalStatus) {
            case 'pago':
            case 'conciliado':
                return <Badge className="bg-success/10 text-success"><CheckCircle className="w-3 h-3 mr-1" />Pago</Badge>;
            case 'inadimplente':
                return <Badge className="bg-destructive/10 text-destructive"><XCircle className="w-3 h-3 mr-1" />Inadimplente</Badge>;
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
            case 'Obra':
                return <Badge className="bg-primary/10 text-primary">{tipo}</Badge>;
            case 'Assessoria Anual':
                return <Badge className="bg-success/10 text-success">{tipo}</Badge>;
            default:
                return <Badge className="bg-warning/10 text-warning">{tipo}</Badge>;
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* ========== Header ========== */}
            <PageHeader
                title="Receitas"
                subtitle="Contratos ativos, parcelas e gestão de inadimplência"
                showBackButton
            >
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Receita
                </Button>
            </PageHeader>

            {/* ========== Alerta Minimalista de Inadimplência ========== */}
            {totalInadimplente > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
                    <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">
                        <span className="font-semibold">{parcelas.filter(p => p.status === 'inadimplente').length} parcela(s) inadimplente(s)</span>
                        {' '}totalizando <span className="font-semibold">{formatCurrency(totalInadimplente)}</span>.
                        Veja na aba "Parcelas".
                    </p>
                </div>
            )}

            {/* ========== KPIs ========== */}
            <KPIFinanceiroGrid columns={4}>
                <KPICardFinanceiro
                    title="Total Mensal"
                    value={kpis.totalReceitasMes}
                    icon={<DollarSign className="w-6 h-6" />}
                    variant="success"
                    subtitle="Previsto"
                    loading={isLoading}
                />
                <KPICardFinanceiro
                    title="Recebido"
                    value={kpis.recebidoMes}
                    icon={<TrendingUp className="w-6 h-6" />}
                    variant="primary"
                    subtitle="Este mês"
                    loading={isLoading}
                />
                <KPICardFinanceiro
                    title="Parcelas Pendentes"
                    value={parcelasFiltradas.length.toString()}
                    icon={<Clock className="w-6 h-6" />}
                    variant="warning"
                    loading={isLoading}
                />
                <KPICardFinanceiro
                    title="Inadimplente"
                    value={totalInadimplente}
                    icon={<AlertTriangle className="w-6 h-6" />}
                    variant="destructive"
                    loading={isLoading}
                />
            </KPIFinanceiroGrid>

            {/* ========== Tabs ========== */}
            <Tabs defaultValue="contratos" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="contratos" className="gap-2">
                        <FileText className="w-4 h-4" />
                        Contratos ({receitasFiltradas.length})
                    </TabsTrigger>
                    <TabsTrigger value="parcelas" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        Parcelas Pendentes ({parcelasFiltradas.length})
                    </TabsTrigger>
                </TabsList>

                {/* ========== Tab: Contratos ========== */}
                <TabsContent value="contratos" className="space-y-4">
                    {/* Filtros Inline (sem card wrapper) */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <Input
                                placeholder="Buscar por cliente ou CC..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className="pl-10 h-9"
                            />
                        </div>
                        <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                            <SelectTrigger className="w-full md:w-[180px] h-9">
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos os Tipos</SelectItem>
                                <SelectItem value="Obra">Obra</SelectItem>
                                <SelectItem value="Assessoria Anual">Assessoria Anual</SelectItem>
                                <SelectItem value="Laudo Pontual">Laudo Pontual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tabela Compacta de Contratos */}
                    <CompactTableWrapper
                        title="Receitas Programadas"
                        totalItems={receitasFiltradas.length}
                        currentCount={paginatedReceitas.length}
                        page={pageContratos}
                        totalPages={Math.ceil(receitasFiltradas.length / itemsPerPage)}
                        onPageChange={setPageContratos}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={setItemsPerPage}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <span className="ml-3 text-neutral-600">Carregando...</span>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40">
                                        <CompactTableHead
                                            onSort={() => handleSortContratos('ccCodigo')}
                                            sortDirection={sortFieldContratos === 'ccCodigo' ? sortDirContratos : null}
                                        >Centro de Custo</CompactTableHead>
                                        <CompactTableHead
                                            onSort={() => handleSortContratos('cliente')}
                                            sortDirection={sortFieldContratos === 'cliente' ? sortDirContratos : null}
                                        >Cliente</CompactTableHead>
                                        <CompactTableHead
                                            onSort={() => handleSortContratos('tipo')}
                                            sortDirection={sortFieldContratos === 'tipo' ? sortDirContratos : null}
                                        >Tipo</CompactTableHead>
                                        <CompactTableHead
                                            onSort={() => handleSortContratos('proximoVencimento')}
                                            sortDirection={sortFieldContratos === 'proximoVencimento' ? sortDirContratos : null}
                                        >Próx. Vcto</CompactTableHead>
                                        <CompactTableHead>Parcelas</CompactTableHead>
                                        <CompactTableHead
                                            className="text-right"
                                            onSort={() => handleSortContratos('valorMensal')}
                                            sortDirection={sortFieldContratos === 'valorMensal' ? sortDirContratos : null}
                                        >Valor/Mês</CompactTableHead>
                                        <CompactTableHead className="text-center w-[100px]">Ações</CompactTableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedReceitas.length === 0 ? (
                                        <TableRow>
                                            <CompactTableCell colSpan={7} className="text-center py-12">
                                                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                                    <FileText className="w-12 h-12 opacity-50" />
                                                    <div>
                                                        <p className="font-medium">Nenhum contrato encontrado</p>
                                                        <p className="text-sm">Cadastre contratos com receitas recorrentes para visualizá-los aqui.</p>
                                                    </div>
                                                </div>
                                            </CompactTableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedReceitas.map((receita) => (
                                            <CompactTableRow key={receita.id}>
                                                <CompactTableCell className="font-medium">
                                                    <Button
                                                        variant="link"
                                                        className="p-0 h-auto text-primary hover:underline font-semibold"
                                                        onClick={() => handleVerCC(receita.ccId)}
                                                    >
                                                        {receita.ccCodigo}
                                                    </Button>
                                                </CompactTableCell>
                                                <CompactTableCell>{receita.cliente}</CompactTableCell>
                                                <CompactTableCell>{getTipoBadge(receita.tipo)}</CompactTableCell>
                                                <CompactTableCell>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-muted-foreground" />
                                                        {formatDate(receita.proximoVencimento)}
                                                    </span>
                                                </CompactTableCell>
                                                <CompactTableCell>
                                                    <span className="flex items-center gap-1">
                                                        {receita.parcelasPagas}/{receita.parcelasTotal}
                                                        {receita.reajusteAnual > 0 && (
                                                            <span className="text-primary text-xs ml-1">
                                                                <RefreshCw className="w-3 h-3 inline" />
                                                                +{receita.reajusteAnual}%
                                                            </span>
                                                        )}
                                                    </span>
                                                </CompactTableCell>
                                                <CompactTableCell className="text-right font-bold text-success">
                                                    {formatCurrency(receita.valorMensal)}
                                                </CompactTableCell>
                                                <CompactTableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleVerParcelas(receita)}>
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleVerCC(receita.ccId)}>
                                                            <Building2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </CompactTableCell>
                                            </CompactTableRow>
                                        ))
                                    )}
                                </TableBody>
                                {/* Linha de Total */}
                                {paginatedReceitas.length > 0 && (
                                <TableFooter>
                                    <TableRow className="bg-muted/60 font-semibold">
                                        <CompactTableCell colSpan={5} className="text-right">
                                            Total ({receitasFiltradas.length} contratos)
                                        </CompactTableCell>
                                        <CompactTableCell className="text-right font-bold text-success">
                                            {formatCurrency(totalValorReceitas)}
                                        </CompactTableCell>
                                        <CompactTableCell />
                                    </TableRow>
                                </TableFooter>
                                )}
                            </Table>
                        )}
                    </CompactTableWrapper>
                </TabsContent>

                {/* ========== Tab: Parcelas Pendentes ========== */}
                <TabsContent value="parcelas" className="space-y-4">
                    {/* Filtros Inline */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <Input
                                placeholder="Buscar por cliente ou CC..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className="pl-10 h-9"
                            />
                        </div>
                        <Select value={statusParcela} onValueChange={setStatusParcela}>
                            <SelectTrigger className="w-full md:w-[180px] h-9">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
                                <SelectItem value="inadimplente">Inadimplente</SelectItem>
                                <SelectItem value="em_aberto">Em Aberto</SelectItem>
                                <SelectItem value="futuro">Futuro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tabela Compacta de Parcelas */}
                    <CompactTableWrapper
                        title="Parcelas a Receber"
                        totalItems={parcelasFiltradas.length}
                        currentCount={paginatedParcelas.length}
                        page={pageParcelas}
                        totalPages={Math.ceil(parcelasFiltradas.length / itemsPerPage)}
                        onPageChange={setPageParcelas}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={setItemsPerPage}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <CompactTableHead
                                        onSort={() => handleSortParcelas('cliente')}
                                        sortDirection={sortFieldParcelas === 'cliente' ? sortDirParcelas : null}
                                    >Cliente</CompactTableHead>
                                    <CompactTableHead
                                        onSort={() => handleSortParcelas('ccCodigo')}
                                        sortDirection={sortFieldParcelas === 'ccCodigo' ? sortDirParcelas : null}
                                    >Centro de Custo</CompactTableHead>
                                    <CompactTableHead>Parcela</CompactTableHead>
                                    <CompactTableHead
                                        onSort={() => handleSortParcelas('vencimento')}
                                        sortDirection={sortFieldParcelas === 'vencimento' ? sortDirParcelas : null}
                                    >Vencimento</CompactTableHead>
                                    <CompactTableHead
                                        className="text-right"
                                        onSort={() => handleSortParcelas('valor')}
                                        sortDirection={sortFieldParcelas === 'valor' ? sortDirParcelas : null}
                                    >Valor</CompactTableHead>
                                    <CompactTableHead
                                        className="text-center"
                                        onSort={() => handleSortParcelas('status')}
                                        sortDirection={sortFieldParcelas === 'status' ? sortDirParcelas : null}
                                    >Status</CompactTableHead>
                                    <CompactTableHead className="text-center w-[60px]"></CompactTableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedParcelas.length === 0 ? (
                                    <TableRow>
                                        <CompactTableCell colSpan={7} className="text-center py-12">
                                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                                <Calendar className="w-12 h-12 opacity-50" />
                                                <div>
                                                    <p className="font-medium">Nenhuma parcela pendente</p>
                                                    <p className="text-sm">Todas as parcelas estão quitadas ou não há parcelas cadastradas.</p>
                                                </div>
                                            </div>
                                        </CompactTableCell>
                                    </TableRow>
                                ) : (
                                    paginatedParcelas.map((parcela) => (
                                        <CompactTableRow
                                            key={parcela.id}
                                            className={parcela.status === 'inadimplente' ? 'bg-destructive/5 border-l-2 border-l-destructive' : ''}
                                        >
                                            <CompactTableCell className="font-medium">{parcela.cliente}</CompactTableCell>
                                            <CompactTableCell>
                                                <Button
                                                    variant="link"
                                                    className="p-0 h-auto text-primary hover:underline"
                                                    onClick={() => handleVerCC(parcela.ccId)}
                                                >
                                                    {parcela.ccCodigo}
                                                </Button>
                                            </CompactTableCell>
                                            <CompactTableCell>{parcela.parcela}</CompactTableCell>
                                            <CompactTableCell>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                                    {formatDate(parcela.vencimento)}
                                                </span>
                                            </CompactTableCell>
                                            <CompactTableCell className="text-right font-bold text-success">
                                                {formatCurrency(parcela.valor)}
                                            </CompactTableCell>
                                            <CompactTableCell className="text-center">
                                                {getStatusBadge(parcela.status, parcela.vencimento)}
                                            </CompactTableCell>
                                            <CompactTableCell className="text-center">
                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleVerCC(parcela.ccId)}>
                                                    <Building2 className="w-4 h-4" />
                                                </Button>
                                            </CompactTableCell>
                                        </CompactTableRow>
                                    ))
                                )}
                            </TableBody>
                            {/* Linha de Total */}
                            {paginatedParcelas.length > 0 && (
                            <TableFooter>
                                <TableRow className="bg-muted/60 font-semibold">
                                    <CompactTableCell colSpan={4} className="text-right">
                                        Total ({parcelasFiltradas.length} parcelas)
                                    </CompactTableCell>
                                    <CompactTableCell className="text-right font-bold text-success">
                                        {formatCurrency(totalValorParcelas)}
                                    </CompactTableCell>
                                    <CompactTableCell colSpan={2} />
                                </TableRow>
                            </TableFooter>
                            )}
                        </Table>
                    </CompactTableWrapper>
                </TabsContent>
            </Tabs>

            {/* ========== Dialog de Parcelas do Contrato ========== */}
            <Dialog open={parcelasDialogOpen} onOpenChange={setParcelasDialogOpen}>
                <DialogContent className="max-w-2xl shadow-modal">
                    <DialogHeader>
                        <DialogTitle>Parcelas - {selectedReceita?.ccCodigo}</DialogTitle>
                        <DialogDescription>
                            Cliente: {selectedReceita?.cliente}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[400px] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <CompactTableHead>Parcela</CompactTableHead>
                                    <CompactTableHead>Vencimento</CompactTableHead>
                                    <CompactTableHead className="text-right">Valor</CompactTableHead>
                                    <CompactTableHead className="text-center">Status</CompactTableHead>
                                    <CompactTableHead>Data Pgto</CompactTableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockParcelasContrato.map((p) => (
                                    <CompactTableRow key={p.parcela}>
                                        <CompactTableCell>{p.parcela}/{mockParcelasContrato.length}</CompactTableCell>
                                        <CompactTableCell>{formatDate(p.vencimento)}</CompactTableCell>
                                        <CompactTableCell className="text-right font-medium">{formatCurrency(p.valor)}</CompactTableCell>
                                        <CompactTableCell className="text-center">
                                            <Badge
                                                className={
                                                    p.status === 'Pago'
                                                        ? 'bg-success/10 text-success'
                                                        : p.status === 'Pendente'
                                                            ? 'bg-warning/10 text-warning'
                                                            : 'bg-muted text-muted-foreground'
                                                }
                                            >
                                                {p.status}
                                            </Badge>
                                        </CompactTableCell>
                                        <CompactTableCell>{p.dataPagamento ? formatDate(p.dataPagamento) : '-'}</CompactTableCell>
                                    </CompactTableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow className="bg-muted/60 font-semibold">
                                    <CompactTableCell colSpan={2} className="text-right">Total</CompactTableCell>
                                    <CompactTableCell className="text-right font-bold">
                                        {formatCurrency(mockParcelasContrato.reduce((acc, p) => acc + p.valor, 0))}
                                    </CompactTableCell>
                                    <CompactTableCell colSpan={2} />
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
