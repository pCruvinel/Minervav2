import { logger } from '@/lib/utils/logger';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Calendar as CalendarIcon,
  Filter,
  FileText,
  FileSpreadsheet,
  Search,
  Edit,
  Check,
  X,
  Paperclip,
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

const SETORES = [
  'ADM',
  'OBRAS',
  'ASSESSORIA_TECNICA'
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
  const [filtroDataInicial, setFiltroDataInicial] = useState<Date>();
  const [filtroDataFinal, setFiltroDataFinal] = useState<Date>();
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroSetor, setFiltroSetor] = useState<string>('');
  const [filtroCentroCusto, setFiltroCentroCusto] = useState<string>('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<LancamentoBancario>>({});

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
      'ADM': 'Administrativo',
      'OBRAS': 'Obras',
      'ASSESSORIA_TECNICA': 'Assessoria Técnica'
    };
    return map[setor] || setor;
  };

  const handleIniciarClassificacao = (lancamento: LancamentoBancario) => {
    // Abrir modal de classificação avançada
    setLancamentoSelecionado({
      id: lancamento.id,
      descricao: lancamento.descricao,
      valor: lancamento.entrada || lancamento.saida || 0,
      tipo: lancamento.entrada ? 'ENTRADA' : 'SAIDA'
    });
    setModalClassificarOpen(true);
  };

  const handleSalvarClassificacaoModal = (dados: any) => {
    if (!lancamentoSelecionado) return;

    // Atualizar lançamento com dados do rateio
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

  const handleSalvarCustoFlutuante = (dados: any) => {
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

  const handleCancelarEdicao = () => {
    setEditandoId(null);
    setEditForm({});
  };

  const handleExportarPDF = () => {
    toast.info('Funcionalidade de exportação para PDF será implementada com biblioteca específica');
  };

  const handleExportarExcel = () => {
    toast.info('Funcionalidade de exportação para Excel será implementada com biblioteca específica');
  };

  // Aplicar filtros
  const lancamentosFiltrados = lancamentos.filter(lanc => {
    if (filtroDataInicial && new Date(lanc.data) < filtroDataInicial) return false;
    if (filtroDataFinal && new Date(lanc.data) > filtroDataFinal) return false;
    if (filtroTipo && lanc.tipo !== filtroTipo) return false;
    if (filtroSetor && lanc.setor !== filtroSetor) return false;
    if (filtroCentroCusto && !lanc.centroCusto?.toLowerCase().includes(filtroCentroCusto.toLowerCase())) return false;
    return true;
  });

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
    <div className="container mx-auto p-6 space-y-6">
      {/* ========== Header ========== */}
      <PageHeader
        title="Conciliação Bancária"
        subtitle="Classificação e rateio de lançamentos financeiros importados"
        showBackButton
      />

      {/* ========== Filtros Avançados ========== */}
      <Card className="shadow-card">
        <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filtros Avançados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Filtro: Data Inicial */}
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start font-normal",
                      !filtroDataInicial && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filtroDataInicial ? format(filtroDataInicial, 'dd/MM/yyyy', { locale: ptBR }) : "Selecione..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filtroDataInicial}
                    onSelect={setFiltroDataInicial}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtro: Data Final */}
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start font-normal",
                      !filtroDataFinal && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filtroDataFinal ? format(filtroDataFinal, 'dd/MM/yyyy', { locale: ptBR }) : "Selecione..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filtroDataFinal}
                    onSelect={setFiltroDataFinal}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtro: Tipo */}
            <div className="space-y-2">
              <Label>Tipo de Custo</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_CUSTO.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>
                      {formatTipo(tipo)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro: Setor */}
            <div className="space-y-2">
              <Label>Setor</Label>
              <Select value={filtroSetor} onValueChange={setFiltroSetor}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os setores" />
                </SelectTrigger>
                <SelectContent>
                  {SETORES.map(setor => (
                    <SelectItem key={setor} value={setor}>
                      {formatSetor(setor)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro: Centro de Custo */}
            <div className="space-y-2">
              <Label>Centro de Custo</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por CC..."
                  value={filtroCentroCusto}
                  onChange={(e) => setFiltroCentroCusto(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Botões de Exportação */}
          <div className="flex gap-3 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={handleExportarPDF}>
              <FileText className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={handleExportarExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ========== Resumo Financeiro (KPIs) ========== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-neutral-500">Total de Entradas</p>
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-success">{formatCurrency(totais.entradas)}</h3>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-neutral-500">Total de Saídas</p>
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingDown className="h-4 w-4 text-destructive" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-destructive">{formatCurrency(totais.saidas)}</h3>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-neutral-500">Saldo do Período</p>
              <div className={`p-2 rounded-lg ${saldo >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                <DollarSign className={`h-4 w-4 ${saldo >= 0 ? 'text-success' : 'text-destructive'}`} />
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${saldo >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(saldo)}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* ========== Tabela de Lançamentos ========== */}
      <Card className="shadow-card">
        <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
          <CardTitle className="text-base font-semibold">Lançamentos Bancários ({lancamentosFiltrados.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Data</TableHead>
                  <TableHead className="min-w-[250px]">Descrição (Banco)</TableHead>
                  <TableHead className="w-[120px] text-right">Entrada</TableHead>
                  <TableHead className="w-[120px] text-right">Saída</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[150px]">Tipo</TableHead>
                  <TableHead className="w-[150px]">Setor</TableHead>
                  <TableHead className="min-w-[200px]">Centro de Custo</TableHead>
                  <TableHead className="w-[100px]">Anexo NF</TableHead>
                  <TableHead className="w-[120px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lancamentosFiltrados.map((lancamento) => {
                  const isEditando = editandoId === lancamento.id;

                  return (
                    <TableRow key={lancamento.id}>
                      <TableCell className="font-medium">
                        {format(new Date(lancamento.data), 'dd/MM/yy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {lancamento.descricao}
                      </TableCell>
                      <TableCell className="text-right">
                        {lancamento.entrada ? (
                          <span className="text-success font-medium">
                            {formatCurrency(lancamento.entrada)}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {lancamento.saida ? (
                          <span className="text-destructive font-medium">
                            {formatCurrency(lancamento.saida)}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            lancamento.status === 'CLASSIFICADO'
                              ? 'default'
                              : lancamento.status === 'RATEADO'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {lancamento.status === 'CLASSIFICADO'
                            ? 'Classificado'
                            : lancamento.status === 'RATEADO'
                              ? 'Rateado'
                              : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isEditando ? (
                          <Select
                            value={editForm.tipo}
                            onValueChange={(value) => setEditForm({ ...editForm, tipo: value as FinanceiroCategoria })}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {TIPOS_CUSTO.map(tipo => (
                                <SelectItem key={tipo} value={tipo}>
                                  {formatTipo(tipo)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm">
                            {lancamento.tipo ? formatTipo(lancamento.tipo) : '-'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditando ? (
                          <Select
                            value={editForm.setor}
                            onValueChange={(value) => setEditForm({ ...editForm, setor: value })}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {SETORES.map(setor => (
                                <SelectItem key={setor} value={setor}>
                                  {formatSetor(setor)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm">
                            {lancamento.setor ? formatSetor(lancamento.setor) : '-'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditando ? (
                          <Input
                            placeholder="Digite o CC..."
                            value={editForm.centroCusto}
                            onChange={(e) => setEditForm({ ...editForm, centroCusto: e.target.value })}
                            className="h-8"
                          />
                        ) : (
                          <span className="text-sm">{lancamento.centroCusto || '-'}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditando ? (
                          <Button variant="outline" size="sm" className="h-8">
                            <Paperclip className="h-3 w-3" />
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {lancamento.anexoNF || '-'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditando ? (
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => handleCancelarEdicao()}
                            >
                              <Check className="h-4 w-4 text-success" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={handleCancelarEdicao}
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ) : lancamento.status === 'PENDENTE' ? (
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleIniciarClassificacao(lancamento)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Classificar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleIniciarClassificacao(lancamento)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {lancamentosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum lançamento encontrado com os filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>

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