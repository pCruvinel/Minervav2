/**
 * ClienteTabHistoricoOS - Aba de Histórico de Ordens de Serviço
 *
 * Exibe lista de todas as OS vinculadas ao cliente.
 *
 * @example
 * ```tsx
 * <ClienteTabHistoricoOS ordensServico={ordensServico} isLoading={isLoading} />
 * ```
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  Eye,
  Calendar,
  User,
  Building2,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { OrdemServico } from '@/lib/hooks/use-cliente-historico';

interface ClienteTabHistoricoOSProps {
  ordensServico: OrdemServico[];
  isLoading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  em_triagem: 'bg-gray-100 text-gray-800',
  em_andamento: 'bg-blue-100 text-blue-800',
  concluido: 'bg-success/10 text-success',
  cancelado: 'bg-destructive/10 text-destructive',
  aguardando_aprovacao: 'bg-warning/10 text-warning',
};

const STATUS_LABELS: Record<string, string> = {
  em_triagem: 'Em Triagem',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  aguardando_aprovacao: 'Aguardando Aprovação',
};

export function ClienteTabHistoricoOS({ ordensServico, isLoading }: ClienteTabHistoricoOSProps) {
  const navigate = useNavigate();

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number | undefined) => {
    if (value == null) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleVerOS = (osId: string) => {
    navigate({ to: '/os/$osId', params: { osId } });
  };

  if (isLoading) {
    return <HistoricoOSLoading />;
  }

  if (ordensServico.length === 0) {
    return <EmptyHistoricoOS />;
  }

  // Estatísticas
  const stats = {
    total: ordensServico.length,
    emAndamento: ordensServico.filter(os => os.status_geral === 'em_andamento').length,
    concluidas: ordensServico.filter(os => os.status_geral === 'concluido').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total de OS</p>
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold">{stats.total}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Em Andamento</p>
              <Calendar className="h-4 w-4 text-blue-500" />
            </div>
            <h3 className="text-2xl font-semibold text-blue-600">{stats.emAndamento}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Concluídas</p>
              <FileText className="h-4 w-4 text-success" />
            </div>
            <h3 className="text-2xl font-semibold text-success">{stats.concluidas}</h3>
          </CardContent>
        </Card>
      </div>

      {/* OS Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data Entrada</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Centro de Custo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordensServico.map((os) => (
              <TableRow key={os.id}>
                <TableCell className="font-mono font-medium">
                  {os.codigo_os}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{os.tipo_os_nome}</span>
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_COLORS[os.status_geral] || 'bg-gray-100'}>
                    {STATUS_LABELS[os.status_geral] || os.status_geral}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(os.data_entrada)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{os.responsavel_nome || '-'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {os.centro_custo ? (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm truncate max-w-[150px]" title={os.centro_custo.nome}>
                        {os.centro_custo.nome}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(os.valor_contrato || os.valor_proposta)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVerOS(os.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function HistoricoOSLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="py-4">
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-12 w-full mb-2" />
          <Skeleton className="h-12 w-full mb-2" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyHistoricoOS() {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Nenhuma OS encontrada</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Este cliente ainda não possui ordens de serviço registradas.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
