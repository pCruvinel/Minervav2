import { useState, useMemo } from 'react';
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
} from '@tanstack/react-table';
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
    CompactTableWrapper,
    CompactTableHead,
    CompactTableRow,
    CompactTableCell
} from '@/components/shared/compact-table';
import {
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    Filter,
    Clock,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { KPICardFinanceiro, KPIFinanceiroGrid } from './kpi-card-financeiro';
import { NovaDespesaModal } from '@/components/financeiro/modals/nova-despesa-modal';
import { despesaColumns } from './despesa-columns';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useDespesasMasterLedger } from '@/lib/hooks/use-faturas-recorrentes';
import { useAuth } from '@/lib/contexts/auth-context';

export function GestaoDespesasPage() {
    // States
    const [dataVisualizacao, setDataVisualizacao] = useState(new Date());
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [modalNovaDespesaOpen, setModalNovaDespesaOpen] = useState(false);
    const { currentUser } = useAuth();
    
    // Filters States (Local UI)
    const [statusFilter, setStatusFilter] = useState<string>('todos'); // todos, pendente, pago
    const [tipoFilter, setTipoFilter] = useState<string>('todos'); // todos, fixa, variavel, salario

    // Memoize filters to prevent infinite re-renders from object recreation
    // Memoize filters to prevent infinite re-renders from object recreation
    const filters = useMemo(() => ({
        month: undefined, // REMOVIDO: dataVisualizacao.toISOString(),
        status: statusFilter === 'todos' ? undefined : [statusFilter],
        categoria_tipo: tipoFilter === 'todos' ? undefined : tipoFilter
    }), [statusFilter, tipoFilter]);
    // Hook Data
    const { data: despesas = [], isLoading } = useDespesasMasterLedger(filters);

    // Client-side filtering removed - using server-side filtering via hook logic
    const filteredDespesas = despesas;

    // KPIs Calculation
    const totalMensal = useMemo(() => despesas.reduce((acc, d) => acc + d.valor, 0), [despesas]);
    const totalPago = useMemo(() => despesas.filter(d => d.status === 'pago').reduce((acc, d) => acc + d.valor, 0), [despesas]);
    const totalPendente = useMemo(() => despesas.filter(d => d.status !== 'pago').reduce((acc, d) => acc + d.valor, 0), [despesas]);
    const totalAtrasado = useMemo(() => despesas.filter(d => d.is_atrasado).reduce((acc, d) => acc + d.valor, 0), [despesas]);

    // Table Instance
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
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    });

    // Handlers
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

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <PageHeader
                title="Gestão de Despesas"
                subtitle="Master Ledger unificado de todas as saídas financeiras"
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
                            // Opcional: recarregar dados
                            window.location.reload(); 
                        } catch (e: any) {
                            console.error(e);
                            toast.error('Erro ao gerar folha: ' + e.message);
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
                    loading={isLoading}
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
                            className="pl-10"
                        />
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
                        {table.getHeaderGroups().map((headerGroup: any) => (
                            <TableRow key={headerGroup.id} className="bg-muted/40">
                                {headerGroup.headers.map((header: any) => {
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
                            table.getRowModel().rows.map((row: any) => (
                                <CompactTableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell: any) => (
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

            {/* Nova Despesa Modal */}
            <NovaDespesaModal
                open={modalNovaDespesaOpen}
                onOpenChange={setModalNovaDespesaOpen}
            /> 
        </div>
    );
}
