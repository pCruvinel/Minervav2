import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { MultiSelect, MultiSelectOption } from '../ui/multi-select';
import {
  FileText,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Paperclip,
  Link2,
  RefreshCw
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { cn } from '../ui/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ModalConciliacao } from './modal-conciliacao';
import { toast } from 'sonner';
import {
  CompactTableWrapper,
  CompactTableHead,
  CompactTableRow,
  CompactTableCell
} from '@/components/shared/compact-table';
import { FilterSelect, DateRangePicker, type DateRange } from '@/components/shared/filters';

import {
  useLancamentosBancarios,
  useLancamentosBancariosStats,
  useSyncExtrato,
  MOCK_LANCAMENTOS,
  type LancamentoBancario,
  type LancamentoBancarioStatus
} from '@/lib/hooks/use-lancamentos-bancarios';

import { useCentroCusto } from '@/lib/hooks/use-centro-custo';
import { useQuery } from '@tanstack/react-query';

const SETORES_OPTIONS: MultiSelectOption[] = [
  { label: 'Administrativo', value: 'Administrativo' },
  { label: 'Obras', value: 'Obras' },
  { label: 'Assessoria', value: 'Assessoria' },
  { label: 'Diretoria', value: 'Diretoria' },
  { label: 'TI', value: 'TI' }
];

const STATUS_OPTIONS: { value: LancamentoBancarioStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'conciliado', label: 'Conciliado' },
  { value: 'ignorado', label: 'Ignorado' },
];

export function ConciliacaoBancariaPage() {
  // Filtros
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<LancamentoBancarioStatus | 'all'>('all');
  const [filtroSetores, setFiltroSetores] = useState<string[]>([]);
  const [filtroCCs, setFiltroCCs] = useState<string[]>([]);

  // Data fetching com hooks reais
  const statusFilter = filtroStatus === 'all' ? undefined : filtroStatus;
  const { data: lancamentosReais = [], isLoading } = useLancamentosBancarios({
    status: statusFilter,
    dataInicio: dateRange?.start ? new Date(dateRange.start).toISOString().split('T')[0] : undefined,
    dataFim: dateRange?.end ? new Date(dateRange.end).toISOString().split('T')[0] : undefined,
  });
  const { data: stats } = useLancamentosBancariosStats();
  const syncMutation = useSyncExtrato();

  // Buscar Centros de Custo para o filtro
  const { listCentrosCusto } = useCentroCusto();
  const { data: centrosCusto } = useQuery({
    queryKey: ['centros-custo-filter'],
    queryFn: listCentrosCusto,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const ccOptions: MultiSelectOption[] = (centrosCusto || []).map(cc => ({
    label: cc.nome,
    value: cc.id
  }));

  // Fallback para mock data quando não houver dados reais
  const isUsingMock = lancamentosReais.length === 0 && !isLoading;
  const lancamentos = isUsingMock ? MOCK_LANCAMENTOS : lancamentosReais;

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sorting
  const [sortConfig, setSortConfig] = useState<{
    key: keyof LancamentoBancario;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: keyof LancamentoBancario) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        if (current.direction === 'asc') return { key, direction: 'desc' };
        return null;
      }
      return { key, direction: 'asc' };
    });
  };

  // Estados dos modais - Simplificado para novo modal
  const [modalConciliacaoOpen, setModalConciliacaoOpen] = useState(false);
  const [lancamentoSelecionado, setLancamentoSelecionado] = useState<LancamentoBancario | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Handler para abrir modal ao clicar na linha
  const handleRowClick = (lancamento: LancamentoBancario) => {
    setLancamentoSelecionado(lancamento);
    setModalConciliacaoOpen(true);
  };

  const handleCloseModal = () => {
    setModalConciliacaoOpen(false);
    setLancamentoSelecionado(null);
  };

  const handleExportarPDF = () => {
    toast.info('Funcionalidade de exportação para PDF será implementada');
  };

  const handleExportarExcel = () => {
    toast.info('Funcionalidade de exportação para Excel será implementada');
  };

  // Aplicar filtros
  // Filters are applied in the hook (server-side mostly), but for client-side sorting/filtering of the current page:
  // (In a real scenario with pagination on server, we pass Sort/Filter params to the hook)
  
  const lancamentosFiltrados = useMemo(() => {
    // Client-side additional filtering if needed
    return lancamentos.filter(lanc => {
        if (filtroSetores.length > 0 && lanc.setor?.nome && !filtroSetores.includes(lanc.setor.nome)) return false;
        
        // Filtro de Centro de Custo (MultiSelect)
        if (filtroCCs.length > 0) {
          // Se não tem CC ou o CC não está na lista de selecionados, remove
          if (!lanc.centro_custo?.id || !filtroCCs.includes(lanc.centro_custo.id)) {
            return false;
          }
        }
        
        return true;
    }).sort((a, b) => {
      if (!sortConfig) return 0;

      const { key, direction } = sortConfig;
      
      // Handle nested properties if key matches (needs adjustment for real object structure)
      // For now simple top-level keys
      let aValue: string | number | null | undefined = a[key as keyof LancamentoBancario] as string | number | null | undefined;
      let bValue: string | number | null | undefined = b[key as keyof LancamentoBancario] as string | number | null | undefined;

      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [lancamentos, filtroSetores, filtroCCs, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(lancamentosFiltrados.length / itemsPerPage);
  const paginatedLancamentos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return lancamentosFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [lancamentosFiltrados, currentPage, itemsPerPage]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [dateRange, filtroStatus, filtroSetores, filtroCCs]);

  // Calcular totais
  const totais = useMemo(() => ({
    entradas: stats?.totalEntradas ?? 0,
    saidas: stats?.totalSaidas ?? 0,
  }), [stats]);

  const saldo = totais.entradas - totais.saidas;

  return (
    <div className="container mx-auto p-6 space-y-4">
      {/* Header */}
      <PageHeader
        title="Conciliação Bancária"
        subtitle="Classificação e rateio de lançamentos financeiros importados"
        showBackButton
      />

      {/* Filtros Compactos + KPIs */}
      {/* Filtros Compactos + KPIs */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-none">
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* DateRangePicker unificado */}
            <DateRangePicker
              startDate={dateRange?.start}
              endDate={dateRange?.end}
              onChange={setDateRange}
              placeholder="Período"
            />

            {/* Status */}
            <FilterSelect
              value={filtroStatus}
              onChange={(v) => setFiltroStatus(v as LancamentoBancarioStatus | 'all')}
              options={STATUS_OPTIONS}
              placeholder="Status"
              width="w-[140px]"
            />

            {/* Setores */}
            <MultiSelect
              options={SETORES_OPTIONS}
              selected={filtroSetores}
              onChange={setFiltroSetores}
              placeholder="Setores"
              className="w-40 h-9"
            />

            {/* Busca CC (Agora MultiSelect) */}
            <MultiSelect
              options={ccOptions}
              selected={filtroCCs}
              onChange={setFiltroCCs}
              placeholder="Centros de Custo"
              className="min-w-[180px] h-9" 
            />

            {/* Spacer */}
            <div className="flex-1" />

            {/* KPIs Inline */}
            <div className="flex items-center gap-4 text-sm px-4 py-1.5 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-success/10">
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">Entradas</span>
                  <span className="font-semibold text-success">{formatCurrency(totais.entradas)}</span>
                </div>
              </div>
              <div className="h-6 w-px bg-border/50" />
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-destructive/10">
                  <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">Saídas</span>
                  <span className="font-semibold text-destructive">{formatCurrency(totais.saidas)}</span>
                </div>
              </div>
              <div className="h-6 w-px bg-border/50" />
              <div className="flex items-center gap-2">
                <div className={cn("p-1 rounded", saldo >= 0 ? "bg-success/10" : "bg-destructive/10")}>
                  <DollarSign className={cn("h-3.5 w-3.5", saldo >= 0 ? "text-success" : "text-destructive")} />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">Saldo</span>
                  <span className={cn("font-semibold", saldo >= 0 ? "text-success" : "text-destructive")}>
                    {formatCurrency(saldo)}
                  </span>
                </div>
              </div>
            </div>

            {/* Sync + Export Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => syncMutation.mutate()} 
                disabled={syncMutation.isPending}
                className="h-9 gap-2"
                title="Sincronizar com Banco Cora"
              >
                <RefreshCw className={cn("h-4 w-4", syncMutation.isPending && "animate-spin")} />
                {syncMutation.isPending ? 'Sincronizando...' : 'Sincronizar'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportarPDF} className="h-9 w-9 p-0" title="Exportar PDF">
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportarExcel} className="h-9 w-9 p-0" title="Exportar Excel">
                <FileSpreadsheet className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Banner de Aviso Mock Data */}
      {isUsingMock && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-warning/50 bg-warning/10">
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
          <p className="text-sm text-warning-foreground">
            <span className="font-semibold">Modo demonstração:</span>{' '}
            Exibindo dados de exemplo. Configure a integração bancária para ver lançamentos reais.
          </p>
        </div>
      )}

      {/* Tabela de Lançamentos - Compacta */}
      <CompactTableWrapper
        title="Lançamentos Bancários"
        subtitle={isUsingMock ? "Exibindo dados de demonstração" : "Exibindo dados importados"}
        totalItems={lancamentosFiltrados.length}
        currentCount={paginatedLancamentos.length}
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <CompactTableHead
                className="w-20"
                onSort={() => handleSort('data')}
                sortDirection={sortConfig?.key === 'data' ? sortConfig.direction : null}
              >
                Data
              </CompactTableHead>
              <CompactTableHead
                className="min-w-[180px]"
                onSort={() => handleSort('descricao')}
                sortDirection={sortConfig?.key === 'descricao' ? sortConfig.direction : null}
              >
                Identificação
              </CompactTableHead>
              <CompactTableHead className="min-w-[120px]">Detalhamento</CompactTableHead>
              <CompactTableHead className="w-24">Tipo</CompactTableHead>
              <CompactTableHead className="w-24">Status</CompactTableHead>
              <CompactTableHead className="w-24">Setor</CompactTableHead>
              <CompactTableHead className="min-w-[100px]">CC</CompactTableHead>
              <CompactTableHead
                className="w-28 text-right"
                align="right"
              >
                Valor
              </CompactTableHead>
              <CompactTableHead className="w-14 text-center" align="center">Anexo</CompactTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLancamentos.map((lancamento) => (
              <CompactTableRow 
                key={lancamento.id}
                className="cursor-pointer hover:bg-muted/60 transition-colors"
                onClick={() => handleRowClick(lancamento)}
              >
                {/* DATA + HORA */}
                <CompactTableCell>
                  <div className="flex flex-col">
                    <span>{format(new Date(lancamento.data), 'dd/MM', { locale: ptBR })}</span>
                    <span className="text-[10px] text-muted-foreground">{format(new Date(lancamento.data), 'HH:mm')}</span>
                  </div>
                </CompactTableCell>
                
                {/* IDENTIFICAÇÃO - Nome do Remetente/Destinatário */}
                <CompactTableCell className="truncate max-w-[180px]" title={lancamento.contraparte_nome || lancamento.descricao}>
                  {lancamento.contraparte_nome || lancamento.descricao}
                </CompactTableCell>
                
                {/* DETALHAMENTO (categoria + observações) */}
                <CompactTableCell className="truncate max-w-[120px]" title={lancamento.categoria?.nome || lancamento.observacoes || '-'}>
                  {lancamento.categoria?.nome || lancamento.observacoes || '-'}
                </CompactTableCell>
                
                {/* TIPO (entrada/saída + status) */}
                <CompactTableCell>
                  <Badge
                    variant="outline"
                    className={`text-[10px] py-0 px-1.5 w-fit ${
                      lancamento.entrada 
                        ? 'border-success/30 text-success bg-success/10 hover:bg-success/20' 
                        : 'border-destructive/30 text-destructive bg-destructive/10 hover:bg-destructive/20'
                    }`}
                  >
                    {lancamento.entrada ? 'Entrada' : 'Saída'}
                  </Badge>
                </CompactTableCell>
                
                {/* STATUS */}
                <CompactTableCell>
                <Badge
                    variant="outline"
                    className={`text-[10px] py-0 px-1.5 w-fit ${
                      lancamento.status === 'conciliado' ? 'border-primary/30 text-primary bg-primary/10 hover:bg-primary/20' :
                      lancamento.status === 'pendente' ? 'border-warning/50 text-warning bg-warning/10 hover:bg-warning/20' :
                      'text-muted-foreground border-border bg-muted/50 hover:bg-muted/70'
                    }`}
                  >
                    {lancamento.status === 'pendente' ? 'Pendente' 
                      : lancamento.status === 'conciliado' ? 'Conciliado'
                      : 'Ignorado'}
                  </Badge>
                </CompactTableCell>
                
                {/* SETOR */}
                <CompactTableCell>
                  {lancamento.setor?.nome || '-'}
                </CompactTableCell>
                
                {/* CENTRO DE CUSTO */}
                <CompactTableCell className="truncate max-w-[100px]" title={lancamento.centro_custo?.nome}>
                  {lancamento.centro_custo?.nome || '-'}
                </CompactTableCell>
                
                {/* VALOR (consolidado) */}
                <CompactTableCell className="text-right">
                  {lancamento.entrada ? (
                    <span className="text-success font-medium">
                      +{formatCurrency(lancamento.entrada)}
                    </span>
                  ) : lancamento.saida ? (
                    <span className="text-destructive font-medium">
                      -{formatCurrency(lancamento.saida)}
                    </span>
                  ) : '-'}
                </CompactTableCell>
                
                {/* ANEXO */}
                <CompactTableCell className="text-center">
                {(lancamento.nota_fiscal_url || lancamento.comprovante_url) ? (
                    <a 
                      href={lancamento.nota_fiscal_url || lancamento.comprovante_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                      title={lancamento.nota_fiscal_url ? "Nota Fiscal" : "Comprovante"}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Paperclip className="h-3.5 w-3.5 inline" />
                    </a>
                  ) : lancamento.conta_pagar_id || lancamento.conta_receber_id ? (
                    <span title="Vinculado a conta do sistema">
                      <Link2 className="h-3.5 w-3.5 inline text-muted-foreground" />
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </CompactTableCell>
              </CompactTableRow>
            ))}

            {paginatedLancamentos.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Nenhum lançamento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CompactTableWrapper>

      {/* Modal de Conciliação */}
      <ModalConciliacao
        open={modalConciliacaoOpen}
        onClose={handleCloseModal}
        lancamento={lancamentoSelecionado}
      />
    </div>
  );
}