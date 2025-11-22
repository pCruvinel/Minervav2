import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import {
  TrendingUp,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Calendar,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '../ui/utils';

import { ContaReceber } from '../../lib/types';

// Mock data - Parcelas a receber
const mockParcelas: ContaReceber[] = [
  {
    id: 'rec-1',
    cliente: 'Empreendimentos ABC S.A.',
    centroCusto: 'CC-001 - Assessoria Anual ABC',
    contrato: 'CNT-2024-001',
    parcela: '11/12',
    vencimento: '2024-11-05',
    valorPrevisto: 4200.00,
    valorRecebido: 4200.00,
    status: 'CONCILIADO',
    dataConciliacao: '2024-11-05',
    comprovanteId: 'comp-001',
  },
  {
    id: 'rec-2',
    cliente: 'Empreendimentos ABC S.A.',
    centroCusto: 'CC-001 - Assessoria Anual ABC',
    contrato: 'CNT-2024-001',
    parcela: '12/12',
    vencimento: '2024-12-05',
    valorPrevisto: 4200.00,
    status: 'EM_ABERTO',
  },
  {
    id: 'rec-3',
    cliente: 'Shopping Norte Ltda',
    centroCusto: 'CC-002 - Reforma Shopping Norte',
    contrato: 'CNT-2024-005',
    parcela: '2/3',
    vencimento: '2024-11-10',
    valorPrevisto: 31666.67,
    status: 'INADIMPLENTE',
  },
  {
    id: 'rec-4',
    cliente: 'Shopping Norte Ltda',
    centroCusto: 'CC-002 - Reforma Shopping Norte',
    contrato: 'CNT-2024-005',
    parcela: '3/3',
    vencimento: '2024-12-10',
    valorPrevisto: 31666.66,
    status: 'EM_ABERTO',
  },
  {
    id: 'rec-5',
    cliente: 'Construtora Silva Ltda',
    centroCusto: 'CC-003 - Obra Jardim das Flores',
    contrato: 'CNT-2024-003',
    parcela: '5/6',
    vencimento: '2024-11-01',
    valorPrevisto: 21333.33,
    status: 'INADIMPLENTE',
  },
  {
    id: 'rec-6',
    cliente: 'Construtora Silva Ltda',
    centroCusto: 'CC-003 - Obra Jardim das Flores',
    contrato: 'CNT-2024-003',
    parcela: '6/6',
    vencimento: '2024-11-30',
    valorPrevisto: 21333.34,
    valorRecebido: 21333.34,
    status: 'CONCILIADO',
    dataConciliacao: '2024-11-30',
    comprovanteId: 'comp-002',
  },
  {
    id: 'rec-7',
    cliente: 'Administradora Central',
    centroCusto: 'CC-004 - Laudo Edifício Central',
    contrato: 'CNT-2024-008',
    parcela: '1/2',
    vencimento: '2024-11-15',
    valorPrevisto: 7500.00,
    valorRecebido: 7500.00,
    status: 'CONCILIADO',
    dataConciliacao: '2024-11-16',
    comprovanteId: 'comp-003',
  },
  {
    id: 'rec-8',
    cliente: 'Administradora Central',
    centroCusto: 'CC-004 - Laudo Edifício Central',
    contrato: 'CNT-2024-008',
    parcela: '2/2',
    vencimento: '2024-12-15',
    valorPrevisto: 7500.00,
    status: 'EM_ABERTO',
  },
];

export function ContasReceberPage() {
  const [parcelas] = useState(mockParcelas);
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');

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

  const isInadimplente = (parcela: ContaReceber) => {
    if (parcela.status === 'CONCILIADO') return false;
    const hoje = new Date();
    const vencimento = new Date(parcela.vencimento);
    return hoje > vencimento;
  };

  const getStatusBadge = (parcela: ContaReceber) => {
    // Atualizar status se inadimplente
    const status = isInadimplente(parcela) ? 'INADIMPLENTE' : parcela.status;

    switch (status) {
      case 'CONCILIADO':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Conciliado
          </Badge>
        );
      case 'INADIMPLENTE':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Inadimplente
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

  const getRowClassName = (parcela: ContaReceber) => {
    if (isInadimplente(parcela)) {
      return 'bg-red-50 border-l-4 border-l-red-500';
    }
    if (parcela.status === 'CONCILIADO') {
      return 'bg-green-50/50';
    }
    return '';
  };

  // Aplicar filtros
  const parcelasFiltradas = parcelas.filter((p) => {
    if (filtro && !p.cliente.toLowerCase().includes(filtro.toLowerCase()) &&
      !p.centroCusto.toLowerCase().includes(filtro.toLowerCase())) {
      return false;
    }

    if (filtroStatus) {
      const statusAtual = isInadimplente(p) ? 'INADIMPLENTE' : p.status;
      if (statusAtual !== filtroStatus) return false;
    }

    return true;
  });

  // Calcular totais
  const totais = parcelasFiltradas.reduce(
    (acc, p) => {
      const status = isInadimplente(p) ? 'INADIMPLENTE' : p.status;
      return {
        total: acc.total + p.valorPrevisto,
        recebido: acc.recebido + (p.valorRecebido || 0),
        emAberto: acc.emAberto + (status === 'EM_ABERTO' ? p.valorPrevisto : 0),
        inadimplente: acc.inadimplente + (status === 'INADIMPLENTE' ? p.valorPrevisto : 0),
      };
    },
    { total: 0, recebido: 0, emAberto: 0, inadimplente: 0 }
  );

  const handleVerComprovante = (comprovanteId: string) => {
    alert(`Abrindo comprovante: ${comprovanteId}`);
  };

  return (
    <div className="p-6 space-y-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl mb-2">Contas a Receber</h1>
          <p className="text-muted-foreground">
            Previsão de receitas - Parcelas geradas pelos contratos (OS Tipo 13)
          </p>
        </div>
      </div>

      {/* Alerta de Inadimplência */}
      {totais.inadimplente > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> Existem {parcelasFiltradas.filter(p => isInadimplente(p)).length} parcela(s) inadimplente(s)
            totalizando {formatCurrency(totais.inadimplente)}.
            As linhas inadimplentes estão destacadas em <strong className="text-red-600">VERMELHO</strong>.
          </AlertDescription>
        </Alert>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Previsto</p>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-2xl">{formatCurrency(totais.total)}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {parcelasFiltradas.length} parcela(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Recebido</p>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-2xl text-green-600">{formatCurrency(totais.recebido)}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {parcelasFiltradas.filter(p => p.status === 'CONCILIADO').length} conciliada(s)
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
              {parcelasFiltradas.filter(p => p.status === 'EM_ABERTO' && !isInadimplente(p)).length} parcela(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Inadimplente</p>
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <h3 className="text-2xl text-red-600">{formatCurrency(totais.inadimplente)}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {parcelasFiltradas.filter(p => isInadimplente(p)).length} atrasada(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Parcelas a Receber ({parcelasFiltradas.length})</CardTitle>
            <div className="flex items-center gap-4">
              {/* Filtro de Status */}
              <div className="w-48">
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EM_ABERTO">Em Aberto</SelectItem>
                    <SelectItem value="CONCILIADO">Conciliado</SelectItem>
                    <SelectItem value="INADIMPLENTE">Inadimplente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Busca */}
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente ou centro de custo..."
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
                <TableHead>Cliente / Centro de Custo</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Parcela</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Valor Previsto</TableHead>
                <TableHead className="text-right">Valor Recebido</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parcelasFiltradas.map((parcela) => (
                <TableRow key={parcela.id} className={getRowClassName(parcela)}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{parcela.cliente}</p>
                      <p className="text-xs text-muted-foreground">{parcela.centroCusto}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {parcela.contrato}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{parcela.parcela}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(parcela.vencimento)}
                      {isInadimplente(parcela) && (
                        <AlertTriangle className="h-4 w-4 text-red-600 ml-1" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(parcela.valorPrevisto)}
                  </TableCell>
                  <TableCell className="text-right">
                    {parcela.valorRecebido ? (
                      <span className="text-green-600 font-medium">
                        {formatCurrency(parcela.valorRecebido)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(parcela)}</TableCell>
                  <TableCell className="text-center">
                    {parcela.status === 'CONCILIADO' && parcela.comprovanteId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVerComprovante(parcela.comprovanteId!)}
                        title="Ver comprovante de conciliação"
                      >
                        <LinkIcon className="h-4 w-4 text-primary" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {parcelasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhuma parcela encontrada com os filtros aplicados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-3">Legenda de Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Conciliado</p>
                <p className="text-xs text-muted-foreground">
                  Receita já conciliada no módulo de Conciliação Bancária.
                  Link para comprovante disponível.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Em Aberto</p>
                <p className="text-xs text-muted-foreground">
                  Parcela ainda não vencida e aguardando recebimento.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg bg-red-50">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Inadimplente</p>
                <p className="text-xs text-muted-foreground">
                  Parcela vencida e não recebida. <strong>Linha destacada em VERMELHO.</strong>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
