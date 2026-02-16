/**
 * ClienteTabFinanceiro - Aba de Dados Financeiros do Cliente
 *
 * Exibe:
 * 1. Resumo financeiro (KPIs: receita mensal, valor contratos, status)
 * 2. Detalhes de contratos ativos
 * 3. Histórico de Movimentações (Cora) — transações vinculadas ao cliente
 *
 * @example
 * ```tsx
 * <ClienteTabFinanceiro clienteId={clienteId} />
 * ```
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableHeader, TableRow } from '@/components/ui/table';
import {
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  FileText,
  ExternalLink,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  UserCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/components/ui/utils';
import { useClienteContratos, formatCurrency, formatDate } from '@/lib/hooks/use-cliente-contratos';
import { useMovimentacoesCliente } from '@/lib/hooks/use-vincular-pagador';
import {
  CompactTableHead,
  CompactTableRow,
  CompactTableCell,
} from '@/components/shared/compact-table';

// ============================================================
// TYPES
// ============================================================

interface ClienteTabFinanceiroProps {
  clienteId: string;
}

// ============================================================
// MATCH TYPE BADGE
// ============================================================

function MatchTypeBadge({ matchType }: { matchType: string | null }) {
  if (!matchType) return <span className="text-muted-foreground">—</span>;

  const config: Record<string, { label: string; className: string; icon: typeof UserCheck }> = {
    auto_direto: {
      label: 'Auto (CPF)',
      className: 'border-success/30 text-success bg-success/10',
      icon: Zap,
    },
    auto_terceiro: {
      label: 'Auto (3º)',
      className: 'border-primary/30 text-primary bg-primary/10',
      icon: Zap,
    },
    manual: {
      label: 'Manual',
      className: 'border-warning/30 text-warning bg-warning/10',
      icon: UserCheck,
    },
  };

  const cfg = config[matchType];
  if (!cfg) return <span className="text-muted-foreground">{matchType}</span>;

  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cn('text-[10px] py-0 px-1.5 gap-0.5', cfg.className)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function ClienteTabFinanceiro({ clienteId }: ClienteTabFinanceiroProps) {
  const navigate = useNavigate();
  const { contratos, summary, isLoading } = useClienteContratos(clienteId);
  const {
    data: movimentacoes = [],
    summary: movSummary,
    isLoading: loadingMov,
  } = useMovimentacoesCliente(clienteId);

  // Contracts
  const contratosAtivos = contratos.filter((c) => c.status === 'ativo');
  const valorTotalMensal = contratosAtivos
    .filter((c) => c.tipo === 'recorrente')
    .reduce((sum, c) => sum + (c.valor_mensal || 0), 0);
  const valorTotalContratos = contratosAtivos.reduce((sum, c) => sum + (c.valor_total || 0), 0);

  // Movimentações — pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(movimentacoes.length / itemsPerPage);

  const paginatedMov = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return movimentacoes.slice(start, start + itemsPerPage);
  }, [movimentacoes, currentPage]);

  const handleVerContasReceber = () => {
    navigate({ to: '/financeiro/contas-receber', search: { clienteId } });
  };

  const fmtCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (isLoading) {
    return <FinanceiroLoading />;
  }

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════
          SEÇÃO 1 — KPIs (Resumo Financeiro)
      ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Receita Mensal</p>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <h3 className="text-2xl font-semibold text-success">
              {formatCurrency(valorTotalMensal)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.contratosAtivos} contrato(s) ativo(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Valor Total Contratos</p>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold">
              {formatCurrency(valorTotalContratos)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Soma de todos os contratos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Status Financeiro</p>
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <Badge className="bg-success/10 text-success text-lg px-3 py-1">
              Em Dia
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Sem faturas em atraso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════
          SEÇÃO 2 — Detalhes dos Contratos
      ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Resumo por Contrato
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contratosAtivos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum contrato ativo
              </p>
            ) : (
              <div className="space-y-4">
                {contratosAtivos.map((contrato) => (
                  <div
                    key={contrato.id}
                    className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{contrato.numero_contrato}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {contrato.tipo}
                      </p>
                    </div>
                    <div className="text-right">
                      {contrato.tipo === 'recorrente' ? (
                        <>
                          <p className="font-medium text-success">
                            {formatCurrency(contrato.valor_mensal)}/mês
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Início: {formatDate(contrato.data_inicio)}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium">
                            {formatCurrency(contrato.valor_total)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Valor total
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximas Faturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">
                  Consulte as faturas detalhadas
                </p>
                <p className="text-sm">
                  Para visualizar todas as parcelas e faturas programadas deste cliente,
                  acesse a tela de Contas a Receber.
                </p>
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={handleVerContasReceber}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver Contas a Receber
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════
          SEÇÃO 3 — Histórico de Movimentações (Cora)
      ═══════════════════════════════════════════ */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Histórico de Movimentações (Cora)
            </CardTitle>
            {movimentacoes.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <ArrowDownRight className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium text-success">
                    {fmtCurrency(movSummary.totalRecebido)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowUpRight className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    {fmtCurrency(movSummary.totalSaida)}
                  </span>
                </div>
              </div>
            )}
          </div>
          {movimentacoes.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {movSummary.quantidadeEntradas} entrada(s) • {movSummary.quantidadeSaidas} saída(s) • {movSummary.total} transação(ões) total
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {loadingMov ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : movimentacoes.length === 0 ? (
            /* ── Empty State ── */
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <Wallet className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Nenhuma movimentação vinculada
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                As transações são vinculadas automaticamente pelo CPF/CNPJ ou manualmente na Conciliação Bancária.
              </p>
            </div>
          ) : (
            /* ── Tabela de Movimentações ── */
            <div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <CompactTableHead className="w-24">Data</CompactTableHead>
                      <CompactTableHead className="min-w-[160px]">Pagador</CompactTableHead>
                      <CompactTableHead className="min-w-[100px]">Descrição</CompactTableHead>
                      <CompactTableHead className="w-24">Vínculo</CompactTableHead>
                      <CompactTableHead className="w-28 text-right" align="right">
                        Valor
                      </CompactTableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedMov.map((mov) => {
                      const isEntrada = (mov.entrada ?? 0) > 0;
                      const valor = isEntrada ? (mov.entrada ?? 0) : (mov.saida ?? 0);

                      return (
                        <CompactTableRow key={mov.id}>
                          {/* DATA */}
                          <CompactTableCell>
                            {format(new Date(mov.data), 'dd/MM/yy', { locale: ptBR })}
                          </CompactTableCell>

                          {/* PAGADOR */}
                          <CompactTableCell className="max-w-[160px]">
                            <div className="truncate font-medium">
                              {(mov.contraparte_nome || '—').toUpperCase()}
                            </div>
                            {mov.contraparte_documento && (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {mov.contraparte_documento}
                              </span>
                            )}
                          </CompactTableCell>

                          {/* DESCRIÇÃO */}
                          <CompactTableCell
                            className="truncate max-w-[100px]"
                            title={mov.descricao || ''}
                          >
                            {mov.descricao || '—'}
                          </CompactTableCell>

                          {/* VÍNCULO */}
                          <CompactTableCell>
                            <MatchTypeBadge matchType={mov.match_type} />
                          </CompactTableCell>

                          {/* VALOR */}
                          <CompactTableCell className="text-right tabular-nums">
                            <span
                              className={cn(
                                'font-medium',
                                isEntrada ? 'text-success' : 'text-destructive'
                              )}
                            >
                              {isEntrada ? '+' : '-'}
                              {fmtCurrency(valor)}
                            </span>
                          </CompactTableCell>
                        </CompactTableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Footer — Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
                  <span className="text-xs text-muted-foreground">
                    Mostrando {paginatedMov.length} de {movimentacoes.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Página {currentPage} de {totalPages}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// LOADING SKELETON
// ============================================================

function FinanceiroLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
