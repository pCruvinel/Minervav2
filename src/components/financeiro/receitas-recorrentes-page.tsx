import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { useNavigate } from '@tanstack/react-router';

// ============================================================
// MOCK DATA - FRONTEND-ONLY MODE
// ============================================================

const mockKPIs = {
    totalMensal: 52400,
    projecao12Meses: 628800,
    reajusteMedio: 2.0,
    contratosAtivos: 8,
    inadimplente: 21333.33,
    parcelasPendentes: 12,
};

const mockReceitasRecorrentes = [
    {
        id: 'rec-001', ccId: 'cc-13001', ccCodigo: 'CC13001-SOLAR_I',
        cliente: 'Construtora Silva Ltda', tipo: 'Obra', valorMensal: 10666.67,
        frequencia: 'Mensal', dataInicio: '2024-01-15', dataFim: '2024-12-15',
        parcelasPagas: 11, parcelasTotal: 12, proximoVencimento: '2025-01-15',
        reajusteAnual: 0, status: 'ativo',
    },
    {
        id: 'rec-002', ccId: 'cc-12005', ccCodigo: 'CC12005-EDIFICIO_CENTRAL',
        cliente: 'Administradora Central', tipo: 'Assessoria Anual', valorMensal: 4200,
        frequencia: 'Mensal', dataInicio: '2024-03-01', dataFim: '2025-02-28',
        parcelasPagas: 10, parcelasTotal: 12, proximoVencimento: '2025-01-05',
        reajusteAnual: 2.0, status: 'ativo',
    },
    {
        id: 'rec-003', ccId: 'cc-11008', ccCodigo: 'CC11008-ASSESSORIA_ABC',
        cliente: 'Condomínio ABC', tipo: 'Assessoria Anual', valorMensal: 3500,
        frequencia: 'Mensal', dataInicio: '2024-06-01', dataFim: '2025-05-31',
        parcelasPagas: 7, parcelasTotal: 12, proximoVencimento: '2025-01-10',
        reajusteAnual: 2.0, status: 'ativo',
    },
    {
        id: 'rec-004', ccId: 'cc-11009', ccCodigo: 'CC11009-RESIDENCIAL_FLORES',
        cliente: 'Residencial das Flores', tipo: 'Laudo Pontual', valorMensal: 8500,
        frequencia: 'Único', dataInicio: '2024-11-01', dataFim: null,
        parcelasPagas: 0, parcelasTotal: 1, proximoVencimento: '2025-01-20',
        reajusteAnual: 0, status: 'ativo',
    },
];

// Parcelas pendentes consolidadas (antes em contas-receber)
const mockParcelasPendentes = [
    { id: 'par-1', cliente: 'Construtora Silva Ltda', ccCodigo: 'CC13001-SOLAR_I', ccId: 'cc-13001', contrato: 'CNT-2024-003', parcela: '5/6', vencimento: '2024-11-01', valor: 21333.33, status: 'inadimplente' },
    { id: 'par-2', cliente: 'Construtora Silva Ltda', ccCodigo: 'CC13001-SOLAR_I', ccId: 'cc-13001', contrato: 'CNT-2024-003', parcela: '6/6', vencimento: '2024-11-30', valor: 21333.34, status: 'em_aberto' },
    { id: 'par-3', cliente: 'Administradora Central', ccCodigo: 'CC12005-EDIFICIO_CENTRAL', ccId: 'cc-12005', contrato: 'CNT-2024-001', parcela: '11/12', vencimento: '2024-12-05', valor: 4200, status: 'em_aberto' },
    { id: 'par-4', cliente: 'Administradora Central', ccCodigo: 'CC12005-EDIFICIO_CENTRAL', ccId: 'cc-12005', contrato: 'CNT-2024-001', parcela: '12/12', vencimento: '2025-01-05', valor: 4284, status: 'futuro' },
    { id: 'par-5', cliente: 'Condomínio ABC', ccCodigo: 'CC11008-ASSESSORIA_ABC', ccId: 'cc-11008', contrato: 'CNT-2024-005', parcela: '8/12', vencimento: '2025-01-10', valor: 3500, status: 'em_aberto' },
    { id: 'par-6', cliente: 'Residencial das Flores', ccCodigo: 'CC11009-RESIDENCIAL_FLORES', ccId: 'cc-11009', contrato: 'CNT-2024-008', parcela: '1/1', vencimento: '2025-01-20', valor: 8500, status: 'futuro' },
];

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
 * ReceitasRecorrentesPage - Gestão de Receitas Recorrentes
 * 
 * Visualização de contratos ativos com receitas programadas,
 * incluindo regras de reajuste e status de parcelas.
 * 
 * Consolida funcionalidade de:
 * - Receitas recorrentes (contratos)
 * - Contas a receber (parcelas pendentes)
 */
export function ReceitasRecorrentesPage() {
    const navigate = useNavigate();
    const [busca, setBusca] = useState('');
    const [tipoFiltro, setTipoFiltro] = useState<string>('todos');
    const [statusParcela, setStatusParcela] = useState<string>('todos');
    const [parcelasDialogOpen, setParcelasDialogOpen] = useState(false);
    const [selectedReceita, setSelectedReceita] = useState<typeof mockReceitasRecorrentes[0] | null>(null);
    const [isLoading] = useState(false);

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

    const receitasFiltradas = mockReceitasRecorrentes.filter(r => {
        const matchBusca = r.cliente.toLowerCase().includes(busca.toLowerCase()) ||
            r.ccCodigo.toLowerCase().includes(busca.toLowerCase());
        const matchTipo = tipoFiltro === 'todos' || r.tipo === tipoFiltro;
        return matchBusca && matchTipo;
    });

    const parcelasFiltradas = mockParcelasPendentes.filter(p => {
        const matchBusca = p.cliente.toLowerCase().includes(busca.toLowerCase()) ||
            p.ccCodigo.toLowerCase().includes(busca.toLowerCase());
        const matchStatus = statusParcela === 'todos' || p.status === statusParcela;
        return matchBusca && matchStatus;
    });

    const totalInadimplente = mockParcelasPendentes
        .filter(p => p.status === 'inadimplente')
        .reduce((acc, p) => acc + p.valor, 0);

    const handleVerParcelas = (receita: typeof mockReceitasRecorrentes[0]) => {
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

            {/* ========== Alerta de Inadimplência ========== */}
            {totalInadimplente > 0 && (
                <Alert className="border-destructive/30 bg-destructive/5">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="text-destructive">
                        <strong>Atenção:</strong> Existem {mockParcelasPendentes.filter(p => p.status === 'inadimplente').length} parcela(s) inadimplente(s)
                        totalizando <strong>{formatCurrency(totalInadimplente)}</strong>. Veja na aba "Parcelas Pendentes".
                    </AlertDescription>
                </Alert>
            )}

            {/* ========== KPIs ========== */}
            <KPIFinanceiroGrid columns={4}>
                <KPICardFinanceiro
                    title="Total Mensal"
                    value={mockKPIs.totalMensal}
                    icon={<DollarSign className="w-6 h-6" />}
                    variant="success"
                    subtitle="Previsto"
                    loading={isLoading}
                />
                <KPICardFinanceiro
                    title="Projeção 12 Meses"
                    value={mockKPIs.projecao12Meses}
                    icon={<TrendingUp className="w-6 h-6" />}
                    variant="primary"
                    subtitle="Considerando reajustes"
                    loading={isLoading}
                />
                <KPICardFinanceiro
                    title="Parcelas Pendentes"
                    value={mockKPIs.parcelasPendentes.toString()}
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
                    {/* Filtros */}
                    <Card className="shadow-card">
                        <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                            <CardTitle className="text-base font-semibold">Filtros</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <Input
                                        placeholder="Buscar por cliente ou centro de custo..."
                                        value={busca}
                                        onChange={(e) => setBusca(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                                    <SelectTrigger className="w-full md:w-[200px]">
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
                        </CardContent>
                    </Card>

                    {/* Lista de Contratos */}
                    <Card className="shadow-card">
                        <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                            <CardTitle className="text-base font-semibold">Receitas Programadas</CardTitle>
                            <CardDescription>{receitasFiltradas.length} contrato(s) encontrado(s)</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    <span className="ml-3 text-neutral-600">Carregando...</span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {receitasFiltradas.map((receita) => (
                                        <div
                                            key={receita.id}
                                            className="p-4 border rounded-lg hover:shadow-card-hover hover:border-primary/20 transition-all"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-bold text-lg text-neutral-900 truncate">{receita.ccCodigo}</h3>
                                                        <Badge
                                                            variant="secondary"
                                                            className={
                                                                receita.tipo === 'Obra' ? 'bg-primary/10 text-primary' :
                                                                    receita.tipo === 'Assessoria Anual' ? 'bg-success/10 text-success' :
                                                                        'bg-warning/10 text-warning'
                                                            }
                                                        >
                                                            {receita.tipo}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-neutral-600">
                                                        <span className="font-medium">{receita.cliente}</span>
                                                    </p>
                                                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-neutral-500">
                                                        <span>
                                                            <Calendar className="w-3 h-3 inline mr-1" />
                                                            Próx. vcto: {formatDate(receita.proximoVencimento)}
                                                        </span>
                                                        <span>
                                                            Parcelas: {receita.parcelasPagas}/{receita.parcelasTotal}
                                                        </span>
                                                        {receita.reajusteAnual > 0 && (
                                                            <span className="text-primary font-medium">
                                                                <RefreshCw className="w-3 h-3 inline mr-1" />
                                                                +{receita.reajusteAnual}%/ano
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-success">
                                                        {formatCurrency(receita.valorMensal)}
                                                        <span className="text-sm font-normal text-neutral-500">
                                                            /{receita.frequencia === 'Mensal' ? 'mês' : 'único'}
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleVerParcelas(receita)}>
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        Parcelas
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleVerCC(receita.ccId)}>
                                                        <Building2 className="w-4 h-4 mr-1" />
                                                        Ver CC
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ========== Tab: Parcelas Pendentes ========== */}
                <TabsContent value="parcelas" className="space-y-4">
                    {/* Filtros */}
                    <Card className="shadow-card">
                        <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                            <CardTitle className="text-base font-semibold">Filtros</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <Input
                                        placeholder="Buscar por cliente ou centro de custo..."
                                        value={busca}
                                        onChange={(e) => setBusca(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={statusParcela} onValueChange={setStatusParcela}>
                                    <SelectTrigger className="w-full md:w-[200px]">
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
                        </CardContent>
                    </Card>

                    {/* Tabela de Parcelas */}
                    <Card className="shadow-card">
                        <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                            <CardTitle className="text-base font-semibold">Parcelas a Receber</CardTitle>
                            <CardDescription>{parcelasFiltradas.length} parcela(s) encontrada(s)</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Centro de Custo</TableHead>
                                        <TableHead>Contrato</TableHead>
                                        <TableHead>Parcela</TableHead>
                                        <TableHead>Vencimento</TableHead>
                                        <TableHead className="text-right">Valor</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parcelasFiltradas.map((parcela) => (
                                        <TableRow
                                            key={parcela.id}
                                            className={parcela.status === 'inadimplente' ? 'bg-destructive/5 border-l-4 border-l-destructive' : ''}
                                        >
                                            <TableCell className="font-medium">{parcela.cliente}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="link"
                                                    className="p-0 h-auto text-primary hover:underline"
                                                    onClick={() => handleVerCC(parcela.ccId)}
                                                >
                                                    {parcela.ccCodigo}
                                                </Button>
                                            </TableCell>
                                            <TableCell><Badge variant="outline">{parcela.contrato}</Badge></TableCell>
                                            <TableCell>{parcela.parcela}</TableCell>
                                            <TableCell>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3 text-neutral-400" />
                                                    {formatDate(parcela.vencimento)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-success">
                                                {formatCurrency(parcela.valor)}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(parcela.status, parcela.vencimento)}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" onClick={() => handleVerCC(parcela.ccId)}>
                                                    <Building2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Parcela</TableHead>
                                <TableHead>Vencimento</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Data Pgto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockParcelasContrato.map((p) => (
                                <TableRow key={p.parcela}>
                                    <TableCell>{p.parcela}/{mockParcelasContrato.length}</TableCell>
                                    <TableCell>{formatDate(p.vencimento)}</TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(p.valor)}</TableCell>
                                    <TableCell>
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
                                    </TableCell>
                                    <TableCell>{p.dataPagamento ? formatDate(p.dataPagamento) : '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
            </Dialog>
        </div>
    );
}
