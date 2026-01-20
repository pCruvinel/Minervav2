import { logger } from '@/lib/utils/logger';
import { useState, useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { MultiSelect, MultiSelectOption } from '../ui/multi-select';
import {
  FileText,
  FileSpreadsheet,
  Edit,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { cn } from '../ui/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ModalClassificarLancamento } from './modal-classificar-lancamento';
import { ModalCustoFlutuante } from './modal-custo-flutuante';
import { toast } from 'sonner';
import {
  CompactTableWrapper,
  CompactTableHead,
  CompactTableRow,
  CompactTableCell
} from '@/components/shared/compact-table';
import { SearchInput, FilterSelect, DateRangePicker, type DateRange } from '@/components/shared/filters';

import { FinanceiroCategoria } from '../../lib/types';

const TIPOS_CUSTO: FinanceiroCategoria[] = [
  'mao_de_obra',
  'material',
  'equipamento',
  'aplicacao',
  'escritorio',
  'impostos',
  'outros'
];

const SETORES_OPTIONS: MultiSelectOption[] = [
  { label: 'Administrativo', value: 'ADM' },
  { label: 'Obras', value: 'OBRAS' },
  { label: 'Assessoria Técnica', value: 'ASSESSORIA_TECNICA' }
];

const CENTROS_CUSTO_OPTIONS: MultiSelectOption[] = [
  { label: 'Condomínio Jardim das Flores', value: 'cc-1' },
  { label: 'Obra Residencial Silva', value: 'cc-2' },
  { label: 'Despesas Administrativas', value: 'cc-3' },
  { label: 'Múltiplos CCs', value: 'cc-4' },
];

// Mock data - Lançamentos bancários importados
interface LancamentoBancario {
  id: string;
  data: string;
  descricao: string;
  entrada: number | null;
  saida: number | null;
  status: 'PENDENTE' | 'CLASSIFICADO' | 'RATEADO';
  tipo?: FinanceiroCategoria;
  setor?: string;
  centroCusto?: string;
  anexoNF?: string;
}

const mockLancamentos: LancamentoBancario[] = [
  {
    id: 'lanc-1',
    data: '2024-12-10',
    descricao: 'PIX RECEBIDO - CONDOMINIO JARDIM DAS FLORES',
    entrada: 5800.00,
    saida: null,
    status: 'CLASSIFICADO',
    tipo: 'mao_de_obra',
    setor: 'OBRAS',
    centroCusto: 'Condomínio Jardim das Flores',
  },
  {
    id: 'lanc-2',
    data: '2024-12-11',
    descricao: 'TED RECEBIDO - SILVA CONSTRUCOES LTDA',
    entrada: 12500.00,
    saida: null,
    status: 'CLASSIFICADO',
    tipo: 'material',
    setor: 'OBRAS',
    centroCusto: 'Obra Residencial Silva',
  },
  {
    id: 'lanc-3',
    data: '2024-12-12',
    descricao: 'DEBITO AUTOMATICO - ENERGIA ELETRICA CEMIG',
    entrada: null,
    saida: 1250.80,
    status: 'CLASSIFICADO',
    tipo: 'escritorio',
    setor: 'ADM',
    centroCusto: 'Despesas Administrativas',
  },
  {
    id: 'lanc-4',
    data: '2024-12-13',
    descricao: 'PIX ENVIADO - FORNECEDOR XYZ MATERIAIS',
    entrada: null,
    saida: 3400.00,
    status: 'PENDENTE',
  },
  {
    id: 'lanc-5',
    data: '2024-12-13',
    descricao: 'TED RECEBIDO - ASSESSORIA MENSAL - EMPREEND ABC',
    entrada: 4200.00,
    saida: null,
    status: 'PENDENTE',
  },
  {
    id: 'lanc-6',
    data: '2024-12-14',
    descricao: 'DEBITO - FOLHA PAGAMENTO FUNCIONARIOS',
    entrada: null,
    saida: 18500.00,
    status: 'RATEADO',
    tipo: 'mao_de_obra',
    setor: 'OBRAS',
    centroCusto: 'Múltiplos CCs (ver rateio)',
  },
  {
    id: 'lanc-7',
    data: '2024-12-14',
    descricao: 'PIX RECEBIDO - VISTORIA ESTRUTURAL - EDIFICIO CENTRAL',
    entrada: 2800.00,
    saida: null,
    status: 'PENDENTE',
  },
];

export function ConciliacaoBancariaPage() {
  const [lancamentos, setLancamentos] = useState(mockLancamentos);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroSetores, setFiltroSetores] = useState<string[]>([]);
  const [filtroCentrosCusto, setFiltroCentrosCusto] = useState<string[]>([]);
  const [buscaCC, setBuscaCC] = useState<string>('');

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

  // Estados dos modais
  const [modalClassificarOpen, setModalClassificarOpen] = useState(false);
  const [modalCustoFlutuanteOpen, setModalCustoFlutuanteOpen] = useState(false);
  const [lancamentoSelecionado, setLancamentoSelecionado] = useState<{
    id: string;
    descricao: string;
    valor: number;
    tipo: 'ENTRADA' | 'SAIDA';
  } | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTipo = (tipo: FinanceiroCategoria | string) => {
    const map: Record<string, string> = {
      'mao_de_obra': 'Mão de Obra',
      'material': 'Material',
      'equipamento': 'Equipamento',
      'aplicacao': 'Aplicação',
      'escritorio': 'Escritório',
      'impostos': 'Impostos',
      'outros': 'Outros'
    };
    return map[tipo] || tipo;
  };

  const formatSetor = (setor: string) => {
    const map: Record<string, string> = {
      'ADM': 'ADM',
      'OBRAS': 'Obras',
      'ASSESSORIA_TECNICA': 'Assessoria'
    };
    return map[setor] || setor;
  };

  const handleIniciarClassificacao = (lancamento: LancamentoBancario) => {
    setLancamentoSelecionado({
      id: lancamento.id,
      descricao: lancamento.descricao,
      valor: lancamento.entrada || lancamento.saida || 0,
      tipo: lancamento.entrada ? 'ENTRADA' : 'SAIDA'
    });
    setModalClassificarOpen(true);
  };

  const handleSalvarClassificacaoModal = (dados: { tipo: FinanceiroCategoria; setor: string; rateios: { centroCusto: string }[] }) => {
    if (!lancamentoSelecionado) return;

    setLancamentos(prev =>
      prev.map(lanc =>
        lanc.id === lancamentoSelecionado.id
          ? {
            ...lanc,
            tipo: dados.tipo,
            setor: dados.setor,
            centroCusto: dados.rateios.length > 1
              ? `Rateado entre ${dados.rateios.length} CCs`
              : dados.rateios[0]?.centroCusto,
            status: dados.rateios.length > 1 ? 'RATEADO' : 'CLASSIFICADO' as const
          }
          : lanc
      )
    );

    setModalClassificarOpen(false);
    setLancamentoSelecionado(null);

    toast.success('Lançamento classificado com sucesso!');
  };

  const handleAbrirCustoFlutuante = () => {
    setModalClassificarOpen(false);
    setModalCustoFlutuanteOpen(true);
  };

  const handleSalvarCustoFlutuante = (dados: { recalcularCustoDia?: boolean }) => {
    if (!lancamentoSelecionado) return;

    logger.log('Custo Flutuante salvo:', dados);

    setModalCustoFlutuanteOpen(false);
    setLancamentoSelecionado(null);

    toast.success(
      dados.recalcularCustoDia
        ? 'Custo flutuante registrado! Custo-Dia recalculado.'
        : 'Custo geral registrado com sucesso!'
    );
  };

  const handleExportarPDF = () => {
    toast.info('Funcionalidade de exportação para PDF será implementada');
  };

  const handleExportarExcel = () => {
    toast.info('Funcionalidade de exportação para Excel será implementada');
  };

  // Aplicar filtros
  const lancamentosFiltrados = useMemo(() => {
    return lancamentos.filter(lanc => {
      const lancDate = new Date(lanc.data);
      if (dateRange?.start && lancDate < dateRange.start) return false;
      if (dateRange?.end && lancDate > dateRange.end) return false;
      if (filtroTipo && lanc.tipo !== filtroTipo) return false;
      if (filtroSetores.length > 0 && lanc.setor && !filtroSetores.includes(lanc.setor)) return false;
      if (buscaCC && !lanc.centroCusto?.toLowerCase().includes(buscaCC.toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      if (!sortConfig) return 0;

      const { key, direction } = sortConfig;

      let aValue = a[key];
      let bValue = b[key];

      // Handle specifics like dates or nulls if needed, 
      // but for string/number simpler comparison works for now
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [lancamentos, dateRange, filtroTipo, filtroSetores, buscaCC, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(lancamentosFiltrados.length / itemsPerPage);
  const paginatedLancamentos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return lancamentosFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [lancamentosFiltrados, currentPage, itemsPerPage]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [dateRange, filtroTipo, filtroSetores, buscaCC]);

  // Calcular totais
  const totais = lancamentosFiltrados.reduce(
    (acc, lanc) => ({
      entradas: acc.entradas + (lanc.entrada || 0),
      saidas: acc.saidas + (lanc.saida || 0),
    }),
    { entradas: 0, saidas: 0 }
  );

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
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            {/* DateRangePicker unificado */}
            <DateRangePicker
              startDate={dateRange?.start}
              endDate={dateRange?.end}
              onChange={setDateRange}
              placeholder="Período"
            />

            {/* Tipo */}
            <FilterSelect
              value={filtroTipo || 'all'}
              onChange={(v) => setFiltroTipo(v === 'all' ? '' : v)}
              options={[
                { value: 'all', label: 'Todos' },
                ...TIPOS_CUSTO.map(tipo => ({ value: tipo, label: formatTipo(tipo) }))
              ]}
              placeholder="Tipo"
              width="w-[140px]"
            />

            {/* Setores - MultiSelect */}
            <MultiSelect
              options={SETORES_OPTIONS}
              selected={filtroSetores}
              onChange={setFiltroSetores}
              placeholder="Setores"
              className="w-40 h-9"
            />

            {/* Busca CC */}
            <SearchInput
              value={buscaCC}
              onChange={setBuscaCC}
              placeholder="Buscar CC..."
              className="min-w-[150px]"
            />

            {/* Spacer */}
            <div className="flex-1" />

            {/* KPIs Inline */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="p-1 rounded bg-success/10">
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                </div>
                <span className="text-muted-foreground">Entradas:</span>
                <span className="font-semibold text-success">{formatCurrency(totais.entradas)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="p-1 rounded bg-destructive/10">
                  <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                </div>
                <span className="text-muted-foreground">Saídas:</span>
                <span className="font-semibold text-destructive">{formatCurrency(totais.saidas)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={cn("p-1 rounded", saldo >= 0 ? "bg-success/10" : "bg-destructive/10")}>
                  <DollarSign className={cn("h-3.5 w-3.5", saldo >= 0 ? "text-success" : "text-destructive")} />
                </div>
                <span className="text-muted-foreground">Saldo:</span>
                <span className={cn("font-semibold", saldo >= 0 ? "text-success" : "text-destructive")}>
                  {formatCurrency(saldo)}
                </span>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportarPDF} className="h-9">
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportarExcel} className="h-9">
                <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
                Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Lançamentos - Compacta */}
      {/* Tabela de Lançamentos - Compacta */}
      <CompactTableWrapper
        title="Lançamentos Bancários"
        subtitle="Exibindo dados importados"
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
                className="min-w-[200px]"
                onSort={() => handleSort('descricao')}
                sortDirection={sortConfig?.key === 'descricao' ? sortConfig.direction : null}
              >
                Descrição
              </CompactTableHead>
              <CompactTableHead
                className="w-24 text-right"
                align="right"
                onSort={() => handleSort('entrada')}
                sortDirection={sortConfig?.key === 'entrada' ? sortConfig.direction : null}
              >
                Entrada
              </CompactTableHead>
              <CompactTableHead
                className="w-24 text-right"
                align="right"
                onSort={() => handleSort('saida')}
                sortDirection={sortConfig?.key === 'saida' ? sortConfig.direction : null}
              >
                Saída
              </CompactTableHead>
              <CompactTableHead
                className="w-20"
                onSort={() => handleSort('status')}
                sortDirection={sortConfig?.key === 'status' ? sortConfig.direction : null}
              >
                Status
              </CompactTableHead>
              <CompactTableHead className="w-20">Tipo</CompactTableHead>
              <CompactTableHead className="w-20">Setor</CompactTableHead>
              <CompactTableHead className="min-w-[120px]">CC</CompactTableHead>
              <CompactTableHead className="w-16 text-center" align="center">Ações</CompactTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLancamentos.map((lancamento) => (
              <CompactTableRow key={lancamento.id}>
                <CompactTableCell>
                  {format(new Date(lancamento.data), 'dd/MM', { locale: ptBR })}
                </CompactTableCell>
                <CompactTableCell className="truncate max-w-[250px]" title={lancamento.descricao}>
                  {lancamento.descricao}
                </CompactTableCell>
                <CompactTableCell className="text-right">
                  {lancamento.entrada ? (
                    <span className="text-success font-medium">
                      {formatCurrency(lancamento.entrada)}
                    </span>
                  ) : '-'}
                </CompactTableCell>
                <CompactTableCell className="text-right">
                  {lancamento.saida ? (
                    <span className="text-destructive font-medium">
                      {formatCurrency(lancamento.saida)}
                    </span>
                  ) : '-'}
                </CompactTableCell>
                <CompactTableCell>
                  <Badge
                    variant={
                      lancamento.status === 'CLASSIFICADO'
                        ? 'default'
                        : lancamento.status === 'RATEADO'
                          ? 'secondary'
                          : 'outline'
                    }
                    className="text-[10px] py-0 px-1.5"
                  >
                    {lancamento.status === 'CLASSIFICADO'
                      ? 'Classif.'
                      : lancamento.status === 'RATEADO'
                        ? 'Rateado'
                        : 'Pend.'}
                  </Badge>
                </CompactTableCell>
                <CompactTableCell>
                  {lancamento.tipo ? formatTipo(lancamento.tipo).slice(0, 8) : '-'}
                </CompactTableCell>
                <CompactTableCell>
                  {lancamento.setor ? formatSetor(lancamento.setor) : '-'}
                </CompactTableCell>
                <CompactTableCell className="truncate max-w-[120px]" title={lancamento.centroCusto}>
                  {lancamento.centroCusto || '-'}
                </CompactTableCell>
                <CompactTableCell className="text-center">
                  <Button
                    size="sm"
                    variant={lancamento.status === 'PENDENTE' ? 'outline' : 'ghost'}
                    className="h-6 w-6 p-0"
                    onClick={() => handleIniciarClassificacao(lancamento)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </CompactTableCell>
              </CompactTableRow>
            ))}

            {paginatedLancamentos.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Nenhum lançamento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CompactTableWrapper>

      {/* Modais */}
      <ModalClassificarLancamento
        open={modalClassificarOpen}
        onClose={() => {
          setModalClassificarOpen(false);
          setLancamentoSelecionado(null);
        }}
        lancamento={lancamentoSelecionado}
        onSalvar={handleSalvarClassificacaoModal}
        onAbrirCustoFlutuante={handleAbrirCustoFlutuante}
      />

      <ModalCustoFlutuante
        open={modalCustoFlutuanteOpen}
        onClose={() => {
          setModalCustoFlutuanteOpen(false);
          setLancamentoSelecionado(null);
        }}
        lancamento={lancamentoSelecionado}
        onSalvar={handleSalvarCustoFlutuante}
      />
    </div>
  );
}