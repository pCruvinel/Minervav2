import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Building2,
  Search,
  Plus,
  Eye,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { useClientes } from '../../lib/hooks/use-clientes';

interface Cliente {
  id: string;
  codigoCC: string;
  nomeRazaoSocial: string;
  tipoContrato: 'OBRAS' | 'ASSESSORIA';
  status: 'ATIVO' | 'INATIVO' | 'LEAD' | 'BLACKLIST';
  dataInicio: string;
  valorMensal: number;
  proximaFatura: string;
  responsavel: string;
  cnpj?: string;
  cpf?: string;
}

interface ClientesListaPageProps {
  onClienteClick?: (clienteId: string) => void;
  onNovoContrato?: () => void;
}

export function ClientesListaPage({ onClienteClick, onNovoContrato }: ClientesListaPageProps) {
  // Carregar clientes do backend - filtrando apenas clientes ativos (não leads)
  const { clientes: clientesBackend } = useClientes('CLIENTE_ATIVO');

  // Mapear dados do backend para o formato esperado pelo componente
  const clientes: Cliente[] = clientesBackend.map((cliente: any) => ({
    id: cliente.id,
    codigoCC: cliente.codigo_cc || '-',
    nomeRazaoSocial: cliente.nome_razao_social || cliente.nome || 'Cliente sem nome',
    tipoContrato: 'ASSESSORIA', // SCHEMA: Adicionar campo tipo_contrato na tabela clientes
    status: cliente.status === 'CLIENTE_ATIVO' ? 'ATIVO' : 'INATIVO',
    dataInicio: cliente.created_at ? new Date(cliente.created_at).toLocaleDateString('pt-BR') : '-',
    valorMensal: 0, // SCHEMA: Adicionar campo valor_mensal na tabela clientes
    proximaFatura: '-', // SCHEMA: Calcular próxima fatura baseado em data_inicio + periodicidade
    responsavel: cliente.responsavel?.nome_completo || '-',
    cnpj: cliente.tipo_cliente !== 'PESSOA_FISICA' ? cliente.cpf_cnpj : undefined,
    cpf: cliente.tipo_cliente === 'PESSOA_FISICA' ? cliente.cpf_cnpj : undefined,
  }));
  const [filtro, setFiltro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (dateStr === '-') return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: Cliente['status']) => {
    if (status === 'ATIVO') {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Ativo
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <XCircle className="h-3 w-3 mr-1" />
        Inativo
      </Badge>
    );
  };

  const getTipoContratoBadge = (tipo: Cliente['tipoContrato']) => {
    if (tipo === 'OBRAS') {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          Obras
        </Badge>
      );
    }
    return (
      <Badge className="bg-purple-100 text-purple-800">
        Assessoria
      </Badge>
    );
  };

  // Aplicar filtros
  const clientesFiltrados = clientes.filter(cliente => {
    const searchTermLower = filtro.toLowerCase();
    const matchesSearch =
      cliente.nomeRazaoSocial.toLowerCase().includes(searchTermLower) ||
      cliente.codigoCC.toLowerCase().includes(searchTermLower) ||
      (cliente.cnpj && cliente.cnpj.includes(filtro)) ||
      (cliente.cpf && cliente.cpf.includes(filtro));

    const matchesStatus = !filtroStatus || cliente.status.toLowerCase() === filtroStatus.toLowerCase();
    const matchesTipo = !filtroTipo || cliente.tipoContrato.toLowerCase() === filtroTipo.toLowerCase();

    return matchesSearch && matchesStatus && matchesTipo;
  });

  // Calcular estatísticas
  const stats = {
    total: clientes.length,
    ativos: clientes.filter(c => c.status === 'ATIVO').length,
    obras: clientes.filter(c => c.tipoContrato === 'OBRAS' && c.status === 'ATIVO').length,
    assessoria: clientes.filter(c => c.tipoContrato === 'ASSESSORIA' && c.status === 'ATIVO').length,
    receitaMensal: clientes
      .filter(c => c.status === 'ATIVO')
      .reduce((acc, c) => acc + c.valorMensal, 0),
  };

  const handleClienteClick = (clienteId: string) => {
    if (onClienteClick) {
      onClienteClick(clienteId);
    }
  };

  const handleNovoContrato = () => {
    if (onNovoContrato) {
      onNovoContrato();
    }
  };

  return (
    <div className="p-6 space-y-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl mb-2">Gestão de Clientes</h1>
          <p className="text-muted-foreground">
            Contratos ativos e centros de custo
          </p>
        </div>
        <Button onClick={handleNovoContrato}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Contrato / Cliente
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-2xl">{stats.total}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.ativos} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Contratos Ativos</p>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-2xl text-green-600">{stats.ativos}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              em operação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Obras</p>
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-2xl text-blue-600">{stats.obras}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              contratos de obra
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Assessoria</p>
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
            <h3 className="text-2xl text-purple-600">{stats.assessoria}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              contratos de assessoria
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Receita Mensal</p>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-2xl text-primary">{formatCurrency(stats.receitaMensal)}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              contratos ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Clientes ({clientesFiltrados.length})</CardTitle>
            <div className="flex items-center gap-4">
              {/* Filtro de Tipo */}
              <div className="w-48">
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de contrato..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OBRAS">Obras</SelectItem>
                    <SelectItem value="ASSESSORIA">Assessoria</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Status */}
              <div className="w-48">
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="blacklist">Blacklist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Busca */}
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou código CC..."
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
                <TableHead>Código CC</TableHead>
                <TableHead>Cliente / Razão Social</TableHead>
                <TableHead>Tipo de Contrato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor Mensal</TableHead>
                <TableHead>Próxima Fatura</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesFiltrados.map((cliente) => (
                <TableRow
                  key={cliente.id}
                  className={cn(
                    "hover:bg-neutral-50 cursor-pointer",
                    cliente.status === 'INATIVO' && "opacity-60"
                  )}
                  onClick={() => handleClienteClick(cliente.id)}
                >
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {cliente.codigoCC}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{cliente.nomeRazaoSocial}</p>
                      <p className="text-xs text-muted-foreground">
                        Responsável: {cliente.responsavel}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getTipoContratoBadge(cliente.tipoContrato)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(cliente.status)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(cliente.valorMensal)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {cliente.proximaFatura !== '-' && (
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      )}
                      {formatDate(cliente.proximaFatura)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClienteClick(cliente.id);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {clientesFiltrados.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum cliente encontrado com os filtros aplicados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
