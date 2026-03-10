import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    useReactTable, 
    getCoreRowModel, 
    getFilteredRowModel, 
    getPaginationRowModel, 
    getSortedRowModel,
    flexRender,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    Row,
    Cell,
    HeaderGroup,
    Header
} from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    CompactTableWrapper,
    CompactTableHead,
    CompactTableRow,
    CompactTableCell
} from '@/components/shared/compact-table';
import {
    Plus,
    Search,
    SlidersHorizontal,
    Filter,
    Clock,
    CheckCircle,
    AlertTriangle,
    FileText,
    MapPin,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { PeriodoSelector } from './periodo-selector';
import { getPeriodoPreset, type PeriodoFiltro } from '@/lib/hooks/use-dashboard-analitico';
import { useCentrosCusto } from '@/lib/hooks/use-os-workflows';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { KPICardFinanceiro, KPIFinanceiroGrid } from './kpi-card-financeiro';
import { NovaDespesaModal } from '@/components/financeiro/modals/nova-despesa-modal';
import { despesaColumns } from './despesa-columns';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useDespesasMasterLedger, useFaturasKPIs, type DespesaMaster } from '@/lib/hooks/use-faturas-recorrentes';
import { useCategoriasFinanceiras } from '@/lib/hooks/use-categorias-financeiras';
import { useAuth } from '@/lib/contexts/auth-context';

export function GestaoDespesasPage() {
    // States
    const [periodo, setPeriodo] = useState<PeriodoFiltro>('thisMonth');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [modalNovaDespesaOpen, setModalNovaDespesaOpen] = useState(false);
    
    // Detail modal state
    const [selectedDespesa, setSelectedDespesa] = useState<DespesaMaster | null>(null);

    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    
    // Filters States (Local UI)
    const [statusFilter, setStatusFilter] = useState<string>('todos'); // todos, pendente, pago, atrasado
    const [tipoFilter, setTipoFilter] = useState<string>('todos'); // todos, fixa, variavel, salario
    const [ccFilter, setCcFilter] = useState<string>('todos');
    const [categoriaFilter, setCategoriaFilter] = useState<string>('todos');

    // Dependencies
    const { data: centrosCusto } = useCentrosCusto();
    const { data: categoriasFinanceiras } = useCategoriasFinanceiras('pagar');
    const dataVisualizacao = useMemo(() => getPeriodoPreset(periodo).inicio, [periodo]);

    const filters = useMemo(() => ({
        month: dataVisualizacao,
        status: statusFilter === 'todos' ? undefined : [statusFilter],
        categoria_tipo: tipoFilter === 'todos' ? undefined : tipoFilter,
        cc_id: ccFilter === 'todos' ? undefined : ccFilter,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize
    }), [dataVisualizacao, statusFilter, tipoFilter, ccFilter, pagination]);
    
    // Hook Data
    const { data: response, isLoading } = useDespesasMasterLedger(filters);
    const despesas = response?.data || [];
    const totalCount = response?.totalCount || 0;

    const filteredDespesas = useMemo(() => {
        let result = despesas;
        if (ccFilter !== 'todos') {
            result = result.filter(d => {
                // Tenta achar rateio ou cc via join... logicamente deveria ser API
                // Mas farremos local filtering pro CC se o backend nao suportar cc_id nativamente no hook atual
                const hasCcName = d.cc_nome && centrosCusto?.find(c => c.id === ccFilter)?.nome === d.cc_nome;
                const hasRateio = d.rateio?.some(r => r.centro_custo_id === ccFilter);
                return hasCcName || hasRateio;
            });
        }
        if (categoriaFilter !== 'todos') {
            const catTarget = categoriasFinanceiras?.find(c => c.id === categoriaFilter)?.nome;
            if (catTarget) {
                result = result.filter(d => d.categoria_nome === catTarget);
            }
        }
        return result;
    }, [despesas, ccFilter, categoriaFilter, centrosCusto, categoriasFinanceiras]);

    // KPIs Calculation from API Hook (eliminates local manual reduce which lacked parity with backend)
    const { data: kpis, isLoading: kpisLoading } = useFaturasKPIs(new Date(dataVisualizacao));

    const totalMensal = kpis?.totalFaturasMes || 0;
    const totalPago = kpis?.pagoMes || 0;
    const totalPendente = kpis?.pendenteMes || 0;
    const totalAtrasado = kpis?.atrasadoMes || 0;

    const table = useReactTable({
        data: filteredDespesas,
        columns: despesaColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,
        manualPagination: true,
        pageCount: Math.ceil(totalCount / pagination.pageSize),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination
        },
    });

    const openDetail = (despesa: DespesaMaster) => {
        setSelectedDespesa(despesa);
    };

    const handleExportarCsv = () => {
        const selectedRows = table.getSelectedRowModel().rows;
        if (selectedRows.length === 0) return;
        
        const dataToExport = selectedRows.map(row => ({
            ID: row.original.id,
            Descricao: row.original.descricao,
            Favorecido: row.original.favorecido_nome,
            Categoria: row.original.categoria_nome,
            Data: row.original.vencimento,
            Valor: row.original.valor,
            Status: row.original.status
        }));
        
        const headers = Object.keys(dataToExport[0]).join(',');
        const csvContent = dataToExport.map(row => Object.values(row).join(',')).join('\n');
        const finalCsv = `${headers}\n${csvContent}`;
        
        const blob = new Blob([finalCsv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `despesas_export_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setRowSelection({});
        toast.success(`Exportado ${selectedRows.length} registro(s) com sucesso.`);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <PageHeader
                title="Gestão de Despesas"
                subtitle="Master Ledger unificado de todas as saídas financeiras"
                showBackButton
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <PeriodoSelector value={periodo} onChange={setPeriodo} />

                    {Object.keys(rowSelection).length > 0 && (
                        <Button variant="outline" className="border-primary text-primary" onClick={handleExportarCsv}>
                            Exportar CSV ({Object.keys(rowSelection).length})
                        </Button>
                    )}

                    <Button onClick={() => setModalNovaDespesaOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Despesa
                    </Button>
                    <Button variant="secondary" onClick={async () => {
                        const confirm = window.confirm('Deseja gerar a folha de pagamento para o mês atual?');
                        if (!confirm) return;
                        
                        try {
                            const { data, error } = await supabase.functions.invoke('gerar-salarios-mensais', {
                                body: {
                                    userId: currentUser?.id 
                                } 
                            });
                            if (error) throw error;
                            toast.success(`Folha gerada com sucesso! ${data.results?.generated} registros criados.`);
                            
                            // Invalida caches em vez de recarregar a tela inteira (bug resolvido: M6)
                            queryClient.invalidateQueries({ queryKey: ['despesas-master'] });
                            queryClient.invalidateQueries({ queryKey: ['faturas-kpis'] });
                            queryClient.invalidateQueries({ queryKey: ['faturas-recorrentes'] });
                        } catch (e: unknown) {
                            console.error(e);
                            toast.error('Erro ao gerar folha');
                        }
                    }}>
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Gerar Folha (Auto)
                    </Button>
                </div>
            </PageHeader>

            {/* KPIs */}
            <KPIFinanceiroGrid columns={4}>
                <KPICardFinanceiro
                    title="Total Mês"
                    value={totalMensal}
                    icon={<Filter className="w-6 h-6" />}
                    variant="neutral"
                    subtitle="Previsto total"
                    loading={isLoading}
                    formatter={formatCurrency}
                />
                <KPICardFinanceiro
                    title="Pago"
                    value={totalPago}
                    icon={<CheckCircle className="w-6 h-6" />}
                    variant="success"
                    subtitle="Realizado"
                    loading={isLoading}
                    formatter={formatCurrency}
                />
                <KPICardFinanceiro
                    title="Pendente"
                    value={totalPendente}
                    icon={<Clock className="w-6 h-6" />}
                    variant="warning"
                    subtitle="A pagar"
                    loading={isLoading}
                    formatter={formatCurrency}
                />
                <KPICardFinanceiro
                    title="Vencido"
                    value={totalAtrasado}
                    icon={<AlertTriangle className="w-6 h-6" />}
                    variant={totalAtrasado > 0 ? "destructive" : "neutral"}
                    subtitle="Atenção necessária"
                    loading={kpisLoading || isLoading}
                    formatter={formatCurrency}
                />
            </KPIFinanceiroGrid>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
                <div className="flex flex-1 items-center gap-4 w-full">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Filtrar por descrição ou favorecido..."
                            value={(table.getColumn("descricao")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("descricao")?.setFilterValue(event.target.value)
                            }
                            className="pl-10 h-9"
                        />
                    </div>
                    
                    {/* Select Filtros Secundários */}
                    <div className="w-[180px] hidden md:block">
                        <Select value={ccFilter} onValueChange={setCcFilter}>
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="Centro de Custo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos (CC)</SelectItem>
                                {centrosCusto?.map(cc => (
                                    <SelectItem key={cc.id} value={cc.id}>{cc.nome}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="w-[180px] hidden md:block">
                        <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="Categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todas (Cat)</SelectItem>
                                {categoriasFinanceiras?.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.nome} ({cat.codigo})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {/* Filter Pills Group */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                        <div className="flex items-center border-r pr-2 mr-2 gap-1">
                            <Badge 
                                variant={statusFilter === 'todos' ? "default" : "outline"} 
                                className="cursor-pointer"
                                onClick={() => setStatusFilter('todos')}
                            >
                                Todas
                            </Badge>
                            <Badge 
                                variant={statusFilter === 'pendente' ? "default" : "outline"} 
                                className="cursor-pointer"
                                onClick={() => setStatusFilter('pendente')}
                            >
                                Pendentes
                            </Badge>
                             <Badge 
                                variant={statusFilter === 'pago' ? "default" : "outline"} 
                                className="cursor-pointer"
                                onClick={() => setStatusFilter('pago')}
                            >
                                Pagas
                            </Badge>
                            <Badge 
                                variant={statusFilter === 'atrasado' ? "destructive" : "outline"} 
                                className="cursor-pointer"
                                onClick={() => setStatusFilter('atrasado')}
                            >
                                Atrasadas
                            </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                             <Badge 
                                variant={tipoFilter === 'todos' ? "secondary" : "outline"} 
                                className="cursor-pointer"
                                onClick={() => setTipoFilter('todos')}
                            >
                                Todos Tipos
                            </Badge>
                            <Badge 
                                variant={tipoFilter === 'salario' ? "secondary" : "outline"} 
                                className="cursor-pointer"
                                onClick={() => setTipoFilter('salario')}
                            >
                                Salários
                            </Badge>
                            <Badge 
                                variant={tipoFilter === 'fixa' ? "secondary" : "outline"} 
                                className="cursor-pointer"
                                onClick={() => setTipoFilter('fixa')}
                            >
                                Fixas
                            </Badge>
                            <Badge 
                                variant={tipoFilter === 'variavel' ? "secondary" : "outline"} 
                                className="cursor-pointer"
                                onClick={() => setTipoFilter('variavel')}
                            >
                                Variáveis
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="ml-auto">
                                <SlidersHorizontal className="w-4 h-4 mr-2" />
                                Colunas
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table */}
            <CompactTableWrapper
                title="Listagem de Despesas"
                subtitle="Visualize e gerencie suas despesas"
                totalItems={table.getFilteredRowModel().rows.length}
                page={table.getState().pagination.pageIndex + 1}
                totalPages={table.getPageCount()}
                onPageChange={(p) => table.setPageIndex(p - 1)}
                itemsPerPage={table.getState().pagination.pageSize}
                onItemsPerPageChange={table.setPageSize}
                currentCount={table.getRowModel().rows.length}
            >
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup: HeaderGroup<DespesaMaster>) => (
                            <TableRow key={headerGroup.id} className="bg-muted/40">
                                {headerGroup.headers.map((header: Header<DespesaMaster, unknown>) => {
                                    return (
                                        <CompactTableHead 
                                            key={header.id}
                                            onSort={header.column.getToggleSortingHandler()}
                                            sortDirection={header.column.getIsSorted()}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </CompactTableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={despesaColumns.length} className="h-24 text-center">
                                    <div className="flex flex-col space-y-3">
                                        <Skeleton className="h-[20px] w-full rounded-full" />
                                        <Skeleton className="h-[20px] w-full rounded-full" />
                                        <Skeleton className="h-[20px] w-full rounded-full" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row: Row<DespesaMaster>) => (
                                    <CompactTableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="cursor-pointer group"
                                        onClick={() => openDetail(row.original)}
                                    >
                                        {row.getVisibleCells().map((cell: Cell<DespesaMaster, unknown>) => (
                                            <CompactTableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </CompactTableCell>
                                        ))}
                                    </CompactTableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={despesaColumns.length}
                                    className="h-24 text-center"
                                >
                                    Nenhuma despesa encontrada.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CompactTableWrapper>
            
            {/* Paginação */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Anterior
                </Button>
                <div className="text-sm text-muted-foreground mx-4">
                    Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Próxima
                </Button>
            </div>

            {/* Nova Despesa Modal */}
            <NovaDespesaModal
                open={modalNovaDespesaOpen}
                onOpenChange={setModalNovaDespesaOpen}
            />

            {/* Detail Modal */}
            <Dialog open={!!selectedDespesa} onOpenChange={(open) => !open && setSelectedDespesa(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Detalhes da Despesa</DialogTitle>
                    </DialogHeader>
                    {selectedDespesa && (
                        <div className="space-y-6">
                            {/* Info Principal */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    Informações
                                </h4>
                                <div className="text-sm space-y-2 bg-muted/30 rounded-lg p-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Descrição:</span>
                                        <span className="font-medium text-right max-w-[200px] truncate">{selectedDespesa.descricao}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Valor:</span>
                                        <span className="font-semibold">{formatCurrency(selectedDespesa.valor)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Vencimento:</span>
                                        <span>{selectedDespesa.vencimento ? new Date(selectedDespesa.vencimento).toLocaleDateString('pt-BR') : '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        <Badge variant={selectedDespesa.status === 'pago' ? 'default' : selectedDespesa.status === 'atrasado' ? 'destructive' : 'outline'} className="capitalize">{selectedDespesa.status}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">ID Fatura:</span>
                                        <span className="font-mono text-xs">{selectedDespesa.id.split('-')[0]}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Favorecido:</span>
                                        <span className="capitalize">{selectedDespesa.favorecido_nome || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tipo:</span>
                                        <span className="capitalize">{selectedDespesa.tipo}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rateio / CC */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    Alocação (Centro de Custo)
                                </h4>
                                {selectedDespesa.rateio && selectedDespesa.rateio.length > 0 ? (
                                    <div className="space-y-2 border rounded-md p-3">
                                        {selectedDespesa.rateio.map((r: { centro_custo_nome?: string; porcentagem: number }, idx: number) => (
                                            <div key={idx} className="flex justify-between text-sm items-center">
                                                <span className="truncate max-w-[160px]" title={r.centro_custo_nome || 'N/A'}>
                                                    {r.centro_custo_nome || 'Centro Custo'}
                                                </span>
                                                <div className="text-right flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px]">{r.porcentagem}%</Badge>
                                                    <span className="font-medium text-xs">{formatCurrency((selectedDespesa.valor * r.porcentagem) / 100)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm border rounded-md p-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">100% Alocado:</span>
                                            <span className="font-medium">{selectedDespesa.cc_nome || '-'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Ações */}
                            <div className="flex gap-2">
                                {selectedDespesa.comprovante_url ? (
                                    <Button variant="outline" size="sm" asChild className="flex-1">
                                        <a href={selectedDespesa.comprovante_url} target="_blank" rel="noopener noreferrer">
                                            Visualizar Anexo
                                        </a>
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" disabled className="flex-1 opacity-50">
                                        Sem Comprovante
                                    </Button>
                                )}
                                <Button variant="secondary" size="sm" className="flex-1">Ver Logs</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
