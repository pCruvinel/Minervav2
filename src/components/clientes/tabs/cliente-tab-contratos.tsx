/**
 * ClienteTabContratos - Aba de Contratos do Cliente
 *
 * Exibe lista de contratos vinculados ao cliente com resumo consolidado.
 *
 * @example
 * ```tsx
 * <ClienteTabContratos clienteId={clienteId} />
 * ```
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileText,
  DollarSign,
  Plus,
  ChevronDown,
  Eye,
  FileSignature,
  AlertCircle,
  HardHat,
  ClipboardCheck,
  Wrench,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import {
  useClienteContratos,
  Contrato,
  CONTRATO_TIPO_LABELS,
  CONTRATO_STATUS_LABELS,
  CONTRATO_TIPO_COLORS,
  CONTRATO_STATUS_COLORS,
  formatCurrency,
  formatDate,
} from '@/lib/hooks/use-cliente-contratos';

interface ClienteTabContratosProps {
  clienteId: string;
}

export function ClienteTabContratos({ clienteId }: ClienteTabContratosProps) {
  const navigate = useNavigate();
  const { contratos, summary, isLoading, error } = useClienteContratos(clienteId);

  const handleNovoContrato = (route: string) => {
    navigate({ to: route, search: { clienteId } });
  };

  const handleVerContrato = (contrato: Contrato) => {
    // Navegar para detalhes do contrato ou abrir modal
    if (contrato.os_id) {
      navigate({ to: '/os/$osId', params: { osId: contrato.os_id } });
    }
  };

  if (isLoading) {
    return <ContratosLoading />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar contratos: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Contratos Ativos</p>
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold">{summary.contratosAtivos}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              de {summary.totalContratos} contratos totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Valor Recorrente Mensal</p>
              <DollarSign className="h-4 w-4 text-success" />
            </div>
            <h3 className="text-2xl font-semibold text-success">
              {formatCurrency(summary.valorRecorrenteMensal)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Total: {formatCurrency(summary.valorTotalContratos)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Lista de Contratos</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Contrato
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => handleNovoContrato('/os/criar/start-contrato-obra')}>
              <HardHat className="mr-2 h-4 w-4" />
              Contrato de Obras
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNovoContrato('/os/criar/laudo-pontual')}>
              <FileText className="mr-2 h-4 w-4" />
              Laudo Pontual
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNovoContrato('/os/criar/assessoria-recorrente')}>
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Assessoria Tecnica
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNovoContrato('/os/criar/vistoria')}>
              <Eye className="mr-2 h-4 w-4" />
              Parecer Tecnico
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNovoContrato('/os/criar/solicitacao-reforma')}>
              <Wrench className="mr-2 h-4 w-4" />
              Solicitacao de Reforma
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Contracts Table */}
      {contratos.length === 0 ? (
        <EmptyContratos />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contratos.map((contrato) => (
                <TableRow key={contrato.id}>
                  <TableCell className="font-mono font-medium">
                    {contrato.numero_contrato}
                  </TableCell>
                  <TableCell>
                    <Badge className={CONTRATO_TIPO_COLORS[contrato.tipo]}>
                      {CONTRATO_TIPO_LABELS[contrato.tipo]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={CONTRATO_STATUS_COLORS[contrato.status]}>
                      {CONTRATO_STATUS_LABELS[contrato.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(contrato.data_inicio)}</TableCell>
                  <TableCell className="text-right">
                    {contrato.tipo === 'recorrente' && contrato.valor_mensal ? (
                      <div>
                        <span className="font-medium">{formatCurrency(contrato.valor_mensal)}</span>
                        <span className="text-xs text-muted-foreground">/mês</span>
                      </div>
                    ) : (
                      <span className="font-medium">{formatCurrency(contrato.valor_total)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVerContrato(contrato)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

function ContratosLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function EmptyContratos() {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Nenhum contrato encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Este cliente ainda não possui contratos registrados.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
