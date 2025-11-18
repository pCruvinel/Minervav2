import React, { useState } from 'react';
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

interface Cliente {
  id: string;
  codigoCC: string;
  nomeRazaoSocial: string;
  tipoContrato: 'OBRAS' | 'ASSESSORIA';
  status: 'ATIVO' | 'INATIVO';
  dataInicio: string;
  valorMensal: number;
  proximaFatura: string;
  responsavel: string;
  cnpj?: string;
  cpf?: string;
}

// Mock de clientes
const mockClientes: Cliente[] = [
  {
    id: 'cli-1',
    codigoCC: 'CC-001',
    nomeRazaoSocial: 'Empreendimentos ABC S.A.',
    tipoContrato: 'ASSESSORIA',
    status: 'ATIVO',
    dataInicio: '2024-01-01',
    valorMensal: 4200.00,
    proximaFatura: '2024-12-05',
    responsavel: 'Carlos Eduardo Silva',
    cnpj: '12.345.678/0001-90',
  },
  {
    id: 'cli-2',
    codigoCC: 'CC-002',
    nomeRazaoSocial: 'Shopping Norte Ltda',
    tipoContrato: 'OBRAS',
    status: 'ATIVO',
    dataInicio: '2024-08-15',
    valorMensal: 95000.00,
    proximaFatura: '2024-12-10',
    responsavel: 'Marina Costa',
    cnpj: '98.765.432/0001-11',
  },
  {
    id: 'cli-3',
    codigoCC: 'CC-003',
    nomeRazaoSocial: 'Construtora Silva Ltda',
    tipoContrato: 'OBRAS',
    status: 'ATIVO',
    dataInicio: '2024-06-01',
    valorMensal: 128000.00,
    proximaFatura: '2024-11-30',
    responsavel: 'João Silva',
    cnpj: '11.222.333/0001-44',
  },
  {
    id: 'cli-4',
    codigoCC: 'CC-004',
    nomeRazaoSocial: 'Administradora Central',
    tipoContrato: 'ASSESSORIA',
    status: 'ATIVO',
    dataInicio: '2024-10-01',
    valorMensal: 15000.00,
    proximaFatura: '2024-12-15',
    responsavel: 'Ana Paula Santos',
    cnpj: '55.666.777/0001-88',
  },
  {
    id: 'cli-5',
    codigoCC: 'CC-005',
    nomeRazaoSocial: 'Condomínio Residencial Vista Linda',
    tipoContrato: 'ASSESSORIA',
    status: 'INATIVO',
    dataInicio: '2023-03-01',
    valorMensal: 3800.00,
    proximaFatura: '-',
    responsavel: 'Roberto Alves',
    cnpj: '22.333.444/0001-55',
  },
  {
    id: 'cli-6',
    codigoCC: 'CC-006',
    nomeRazaoSocial: 'Indústria Moderna S.A.',
    tipoContrato: 'OBRAS',
    status: 'INATIVO',
    dataInicio: '2023-09-01',
    valorMensal: 250000.00,
    proximaFatura: '-',
    responsavel: 'Fernando Costa',
    cnpj: '33.444.555/0001-66',
  },
];

interface ClientesListaPageProps {
  onClienteClick?: (clienteId: string) => void;
  onNovoContrato?: () => void;
}

export function ClientesListaPage({ onClienteClick, onNovoContrato }: ClientesListaPageProps) {
  const [clientes] = useState(mockClientes);
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
  const clientesFiltrados = clientes.filter((c) => {
    if (filtro && !c.nomeRazaoSocial.toLowerCase().includes(filtro.toLowerCase()) &&
        !c.codigoCC.toLowerCase().includes(filtro.toLowerCase())) {
      return false;
    }

    if (filtroTipo && c.tipoContrato !== filtroTipo) return false;
    if (filtroStatus && c.status !== filtroStatus) return false;

    return true;
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
                  <SelectTrigger>
                    <SelectValue placeholder="Status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATIVO">Ativo</SelectItem>
                    <SelectItem value="INATIVO">Inativo</SelectItem>
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
