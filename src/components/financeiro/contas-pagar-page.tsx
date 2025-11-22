import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import {
  TrendingDown,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Building2,
  Calendar,
  Link as LinkIcon,
} from 'lucide-react';
import { ModalNovaConta } from './modal-nova-conta';

import { ContaPagar, ContaPagarTipo } from '../../lib/types';

// Mock data - Contas a pagar
const mockContas: ContaPagar[] = [
  {
    id: 'pag-1',
    favorecido: 'João Silva',
    tipoFavorecido: 'COLABORADOR',
    descricao: 'Salário - Nov/2024',
    tipo: 'SALARIO',
    vencimento: '2024-11-05',
    valor: 4095.00,
    valorPago: 4095.00,
    status: 'PAGO',
    dataPagamento: '2024-11-05',
    comprovanteId: 'comp-sal-001',
    recorrente: true,
  },
  {
    id: 'pag-2',
    favorecido: 'Maria Santos',
    tipoFavorecido: 'COLABORADOR',
    descricao: 'Salário - Nov/2024',
    tipo: 'SALARIO',
    vencimento: '2024-11-05',
    valor: 2628.00,
    valorPago: 2628.00,
    status: 'PAGO',
    dataPagamento: '2024-11-05',
    comprovanteId: 'comp-sal-002',
    recorrente: true,
  },
  {
    id: 'pag-3',
    favorecido: 'Pedro Oliveira',
    tipoFavorecido: 'COLABORADOR',
    descricao: 'Salário - Nov/2024',
    tipo: 'SALARIO',
    vencimento: '2024-11-05',
    valor: 3120.00,
    status: 'ATRASADO',
    recorrente: true,
  },
  {
    id: 'pag-4',
    favorecido: 'Ana Costa',
    tipoFavorecido: 'COLABORADOR',
    descricao: 'Salário - Nov/2024',
    tipo: 'SALARIO',
    vencimento: '2024-11-05',
    valor: 4672.00,
    status: 'ATRASADO',
    recorrente: true,
  },
  {
    id: 'pag-5',
    favorecido: 'João Silva',
    tipoFavorecido: 'COLABORADOR',
    descricao: 'Salário - Dez/2024',
    tipo: 'SALARIO',
    vencimento: '2024-12-05',
    valor: 4095.00,
    status: 'EM_ABERTO',
    recorrente: true,
  },
  {
    id: 'pag-6',
    favorecido: 'Imobiliária Boa Vista',
    tipoFavorecido: 'FORNECEDOR',
    descricao: 'Aluguel Escritório - Nov/2024',
    tipo: 'CONTA_FIXA',
    vencimento: '2024-11-10',
    valor: 5500.00,
    valorPago: 5500.00,
    status: 'PAGO',
    dataPagamento: '2024-11-10',
    comprovanteId: 'comp-aluguel-001',
    recorrente: true,
  },
  {
    id: 'pag-7',
    favorecido: 'Imobiliária Boa Vista',
    tipoFavorecido: 'FORNECEDOR',
    descricao: 'Aluguel Escritório - Dez/2024',
    tipo: 'CONTA_FIXA',
    vencimento: '2024-12-10',
    valor: 5500.00,
    status: 'EM_ABERTO',
    recorrente: true,
  },
  {
    id: 'pag-8',
    favorecido: 'Companhia Elétrica',
    tipoFavorecido: 'FORNECEDOR',
    descricao: 'Energia Elétrica - Out/2024',
    tipo: 'CONTA_FIXA',
    vencimento: '2024-11-15',
    valor: 780.00,
    status: 'ATRASADO',
    recorrente: true,
  },
  {
    id: 'pag-9',
    favorecido: 'Provedora Internet Ltda',
    tipoFavorecido: 'FORNECEDOR',
    descricao: 'Internet Escritório - Nov/2024',
    tipo: 'CONTA_FIXA',
    vencimento: '2024-11-20',
    valor: 350.00,
    valorPago: 350.00,
    status: 'PAGO',
    dataPagamento: '2024-11-20',
    comprovanteId: 'comp-internet-001',
    recorrente: true,
  },
  {
    id: 'pag-10',
    favorecido: 'Fornecedor de Materiais XYZ',
    tipoFavorecido: 'FORNECEDOR',
    descricao: 'Materiais para Obra - Shopping Norte',
    tipo: 'DESPESA_VARIAVEL',
    vencimento: '2024-11-25',
    valor: 8500.00,
    status: 'EM_ABERTO',
    recorrente: false,
  },
];

export function ContasPagarPage() {
  const [contas, setContas] = useState(mockContas);
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [modalNovaContaOpen, setModalNovaContaOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const isAtrasado = (conta: ContaPagar) => {
    if (conta.status === 'PAGO') return false;
    const hoje = new Date();
    const vencimento = new Date(conta.vencimento);
    return hoje > vencimento;
  };

  const getStatusBadge = (conta: ContaPagar) => {
    // Atualizar status se atrasado
    const status = isAtrasado(conta) ? 'ATRASADO' : conta.status;

    switch (status) {
      case 'PAGO':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Pago
          </Badge>
        );
      case 'ATRASADO':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Atrasado
          </Badge>
        );
      case 'EM_ABERTO':
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Em Aberto
          </Badge>
        );
    }
  };

  const getTipoBadge = (tipo: ContaPagarTipo) => {
    const config = {
      SALARIO: { label: 'Salário', className: 'bg-blue-100 text-blue-800' },
      CONTA_FIXA: { label: 'Conta Fixa', className: 'bg-purple-100 text-purple-800' },
      DESPESA_VARIAVEL: { label: 'Despesa Variável', className: 'bg-amber-100 text-amber-800' },
    };

    const { label, className } = config[tipo];
    return (
      <Badge variant="secondary" className={className}>
        {label}
      </Badge>
    );
  };

  const getRowClassName = (conta: ContaPagar) => {
    if (isAtrasado(conta)) {
      return 'bg-red-50 border-l-4 border-l-red-500';
    }
    if (conta.status === 'PAGO') {
      return 'bg-green-50/50';
    }
    return '';
  };

  // Aplicar filtros
  const contasFiltradas = contas.filter((c) => {
    if (filtro && !c.favorecido.toLowerCase().includes(filtro.toLowerCase()) &&
      !c.descricao.toLowerCase().includes(filtro.toLowerCase())) {
      return false;
    }

    if (filtroStatus) {
      const statusAtual = isAtrasado(c) ? 'ATRASADO' : c.status;
      if (statusAtual !== filtroStatus) return false;
    }

    if (filtroTipo && c.tipo !== filtroTipo) return false;

    return true;
  });

  // Calcular totais
  const totais = contasFiltradas.reduce(
    (acc, c) => {
      const status = isAtrasado(c) ? 'ATRASADO' : c.status;
      return {
        total: acc.total + c.valor,
        pago: acc.pago + (c.valorPago || 0),
        emAberto: acc.emAberto + (status === 'EM_ABERTO' ? c.valor : 0),
        atrasado: acc.atrasado + (status === 'ATRASADO' ? c.valor : 0),
      };
    },
    { total: 0, pago: 0, emAberto: 0, atrasado: 0 }
  );

  const handleVerComprovante = (comprovanteId: string) => {
    alert(`Abrindo comprovante: ${comprovanteId}`);
  };

  const handleNovaConta = (dados: any) => {
    const novaConta: ContaPagar = {
      id: `pag-${contas.length + 1}`,
      favorecido: dados.favorecido,
      tipoFavorecido: 'FORNECEDOR',
      descricao: dados.descricao,
      tipo: 'CONTA_FIXA',
      vencimento: dados.vencimento,
      valor: parseFloat(dados.valor),
      status: 'EM_ABERTO',
      recorrente: dados.recorrente || false,
    };

    setContas([...contas, novaConta]);
    setModalNovaContaOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl mb-2">Contas a Pagar</h1>
          <p className="text-muted-foreground">
            Previsão de despesas - Salários e contas fixas/variáveis
          </p>
        </div>
        <Button onClick={() => setModalNovaContaOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Conta Manual
        </Button>
      </div>

      {/* Alerta de Contas Atrasadas */}
      {totais.atrasado > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> Existem {contasFiltradas.filter(c => isAtrasado(c)).length} conta(s) atrasada(s)
            totalizando {formatCurrency(totais.atrasado)}.
            As linhas atrasadas estão destacadas em <strong className="text-red-600">VERMELHO</strong>.
          </AlertDescription>
        </Alert>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Previsto</p>
              <TrendingDown className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-2xl">{formatCurrency(totais.total)}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {contasFiltradas.length} conta(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Pago</p>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-2xl text-green-600">{formatCurrency(totais.pago)}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {contasFiltradas.filter(c => c.status === 'PAGO').length} conciliada(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Em Aberto</p>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-2xl text-blue-600">{formatCurrency(totais.emAberto)}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {contasFiltradas.filter(c => c.status === 'EM_ABERTO' && !isAtrasado(c)).length} conta(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Atrasado</p>
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <h3 className="text-2xl text-red-600">{formatCurrency(totais.atrasado)}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {contasFiltradas.filter(c => isAtrasado(c)).length} atrasada(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Despesas Previstas ({contasFiltradas.length})</CardTitle>
            <div className="flex items-center gap-4">
              {/* Filtro de Tipo */}
              <div className="w-48">
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SALARIO">Salário</SelectItem>
                    <SelectItem value="CONTA_FIXA">Conta Fixa</SelectItem>
                    <SelectItem value="DESPESA_VARIAVEL">Despesa Variável</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Status */}
              <div className="w-48">
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EM_ABERTO">Em Aberto</SelectItem>
                    <SelectItem value="PAGO">Pago</SelectItem>
                    <SelectItem value="ATRASADO">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Busca */}
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por favorecido ou descrição..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Favorecido</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Valor Pago</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contasFiltradas.map((conta) => (
                <TableRow key={conta.id} className={getRowClassName(conta)}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {conta.tipoFavorecido === 'COLABORADOR' ? (
                        <User className="h-4 w-4 text-primary" />
                      ) : (
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">{conta.favorecido}</p>
                        <p className="text-xs text-muted-foreground">
                          {conta.tipoFavorecido === 'COLABORADOR' ? 'Colaborador' : 'Fornecedor'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{conta.descricao}</p>
                      {conta.recorrente && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Recorrente
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getTipoBadge(conta.tipo)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(conta.vencimento)}
                      {isAtrasado(conta) && (
                        <AlertTriangle className="h-4 w-4 text-red-600 ml-1" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(conta.valor)}
                  </TableCell>
                  <TableCell className="text-right">
                    {conta.valorPago ? (
                      <span className="text-green-600 font-medium">
                        {formatCurrency(conta.valorPago)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(conta)}</TableCell>
                  <TableCell className="text-center">
                    {conta.status === 'PAGO' && conta.comprovanteId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVerComprovante(conta.comprovanteId!)}
                        title="Ver comprovante de pagamento"
                      >
                        <LinkIcon className="h-4 w-4 text-primary" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {contasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhuma conta encontrada com os filtros aplicados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-3">Legenda de Status e Tipos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Status de Pagamento:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span><strong>Pago:</strong> Despesa já conciliada no módulo de Conciliação Bancária</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span><strong>Em Aberto:</strong> Conta ainda não vencida</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span><strong>Atrasado:</strong> Conta vencida e não paga (linha destacada em VERMELHO)</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Tipos de Despesa:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-primary" />
                  <span><strong>Salário:</strong> Gerado automaticamente pelo Cadastro de Colaborador</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span><strong>Conta Fixa:</strong> Aluguel, Energia, Internet (manual ou recorrente)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span><strong>Despesa Variável:</strong> Compras, materiais, serviços pontuais</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Nova Conta */}
      <ModalNovaConta
        open={modalNovaContaOpen}
        onClose={() => setModalNovaContaOpen(false)}
        onSalvar={handleNovaConta}
      />
    </div>
  );
}
