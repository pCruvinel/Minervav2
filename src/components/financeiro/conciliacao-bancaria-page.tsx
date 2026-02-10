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
  useCoraBalance,
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
  
  // 1. Hook de Lançamentos (Lista)
  const { data: lancamentosReais = [], isLoading } = useLancamentosBancarios({
    status: statusFilter,
    dataInicio: dateRange?.start ? new Date(dateRange.start).toISOString().split('T')[0] : undefined,
    dataFim: dateRange?.end ? new Date(dateRange.end).toISOString().split('T')[0] : undefined,
    // TODO: Adicionar filtro de CC na lista principal se o hook suportar
  });

  // 2. Hook de Stats (KPIs Filtrados)
  const { data: stats } = useLancamentosBancariosStats({
    status: statusFilter,
    dataInicio: dateRange?.start ? new Date(dateRange.start).toISOString().split('T')[0] : undefined,
    dataFim: dateRange?.end ? new Date(dateRange.end).toISOString().split('T')[0] : undefined,
    // cc_id: filtroCCs.length === 1 ? filtroCCs[0] : undefined // Exemplo simples
  });
  
  // 3. Hook de Saldo Real (Banco)
  // Como useCoraBalance não foi exportado no import original, assumindo que foi adicionado ao arquivo
  // Precisamos importar ele. Como é o mesmo arquivo, vou adicionar na lista de imports manuais se necessário
  // mas aqui estamos editando o componente. Vou usar via import atualizado.
  const { data: saldoBanco, isLoading: isLoadingSaldo } = useCoraBalance();

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

  // Calcular totais (agora vindo dos stats filtrados do backend ou fallback zero)
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

      {/* Cartão de Saldo Real (Banco Cora) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="md:col-span-1 rounded-xl border bg-card text-card-foreground shadow-sm p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
               <DollarSign className="w-16 h-16 text-primary" />
            </div>
            <div>
               <p className="text-sm text-muted-foreground font-medium mb-1">Saldo Atual</p>
               {isLoadingSaldo ? (
                 <div className="h-8 w-32 bg-muted animate-pulse rounded" />
               ) : (
                 <h2 className="text-2xl font-bold text-primary">{formatCurrency(saldoBanco?.disponivel ?? 0)}</h2>
               )}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
               <div className={`w-2 h-2 rounded-full ${saldoBanco ? 'bg-success' : 'bg-warning'}`} />
               {saldoBanco ? 'Sincronizado' : 'Verificando...'}
            </div>
         </div>

         {/* KPIs Filtrados */}
         <div className="md:col-span-3 grid grid-cols-3 gap-4">
             <div className="rounded-xl border bg-card/50 p-4 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                   <div className="p-1 rounded bg-success/10">
                      <TrendingUp className="h-4 w-4 text-success" />
                   </div>
                   <span className="text-sm font-medium text-muted-foreground">Entradas (Período)</span>
                </div>
                <span className="text-xl font-semibold text-success">{formatCurrency(totais.entradas)}</span>
             </div>

             <div className="rounded-xl border bg-card/50 p-4 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                   <div className="p-1 rounded bg-destructive/10">
                      <TrendingDown className="h-4 w-4 text-destructive" />
                   </div>
                   <span className="text-sm font-medium text-muted-foreground">Saídas (Período)</span>
                </div>
                <span className="text-xl font-semibold text-destructive">{formatCurrency(totais.saidas)}</span>
             </div>

             <div className="rounded-xl border bg-card/50 p-4 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                   <div className="p-1 rounded bg-primary/10">
                      <DollarSign className="h-4 w-4 text-primary" />
                   </div>
                   <span className="text-sm font-medium text-muted-foreground">Resultado (Período)</span>
                </div>
                <span className={cn("text-xl font-semibold", saldo >= 0 ? "text-primary" : "text-destructive")}>
                   {formatCurrency(saldo)}
                </span>
             </div>
         </div>
      </div>

      {/* Filtros Compactos */}
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

            {/* Busca CC */}
            <MultiSelect
              options={ccOptions}
              selected={filtroCCs}
              onChange={setFiltroCCs}
              placeholder="Centros de Custo"
              className="min-w-[180px] h-9" 
            />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Sync + Export Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => syncMutation.mutate({
                  start: dateRange?.start ? new Date(dateRange.start).toISOString().split('T')[0] : undefined,
                  end: dateRange?.end ? new Date(dateRange.end).toISOString().split('T')[0] : undefined,
                })} 
                disabled={syncMutation.isPending}
                className="h-9 gap-2"
                title="Sincronizar com Banco Cora (Período Selecionado)"
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLancamentos.map((lancamento) => (
              <CompactTableRow 
                key={lancamento.id}
                className={`cursor-pointer transition-colors ${
                  lancamento.status === 'conciliado' ? 'bg-muted/50 hover:bg-muted/70 opacity-60' : 'hover:bg-muted/60'
                }`}
                onClick={() => handleRowClick(lancamento)}
              >
                {/* DATA + HORA - Formato horizontal */}
                <CompactTableCell>
                  <span>{format(new Date(lancamento.data), 'dd/MM/yy - HH:mm:ss', { locale: ptBR })}</span>
                </CompactTableCell>
                
                {/* IDENTIFICAÇÃO - Nome do Remetente/Destinatário (SEMPRE MAIÚSCULO) */}
                <CompactTableCell className="truncate max-w-[180px]" title={(lancamento.contraparte_nome || lancamento.descricao || '').toUpperCase()}>
                  {(lancamento.contraparte_nome || lancamento.descricao || '').toUpperCase()}
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
                    className={`text-[10px] py-0 px-1.5 w-fit rounded-full ${
                      lancamento.status === 'conciliado' ? 'bg-blue-600 text-white hover:bg-blue-700 border-none' :
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
                
                {/* CENTRO DE CUSTO - Mostrar do rateio se não houver cc_id direto */}
                <CompactTableCell className="truncate max-w-[100px]" title={lancamento.centro_custo?.nome || lancamento.rateios?.[0]?.cc_nome}>
                  {lancamento.centro_custo?.nome || lancamento.rateios?.[0]?.cc_nome || '-'}
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
                
              </CompactTableRow>
            ))}

            {paginatedLancamentos.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
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