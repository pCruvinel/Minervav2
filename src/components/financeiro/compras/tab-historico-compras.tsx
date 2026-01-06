import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  History,
  ChevronDown,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  useHistoricoRequisicoes,
  type RequisicaoCompra,
  type RequisicaoFilters,
} from '@/lib/hooks/use-aprovacao-requisicoes';
import { SheetDetalhesRequisicao } from './sheet-detalhes-requisicao';

const STATUS_OPTIONS = [
  { value: 'em_triagem', label: 'Em Criação' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
];

/**
 * Aba de histórico de requisições com filtros e paginação
 */
export function TabHistoricoCompras() {
  const {
    requisicoes,
    loading,
    pagination,
    setPage,
    filters,
    setFilters,
    refetch,
  } = useHistoricoRequisicoes(10);

  const [showFilters, setShowFilters] = useState(false);
  const [selectedRequisicao, setSelectedRequisicao] = useState<RequisicaoCompra | null>(null);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      em_triagem: { label: 'Em Criação', variant: 'outline' },
      em_andamento: { label: 'Em Andamento', variant: 'default' },
      concluido: { label: 'Concluído', variant: 'secondary' },
      cancelado: { label: 'Cancelado', variant: 'destructive' },
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' as const };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleFilterChange = (key: keyof RequisicaoFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1); // Voltar para primeira página ao filtrar
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some((v) =>
    Array.isArray(v) ? v.length > 0 : !!v
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Requisições
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Limpar filtros
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filtros
                <ChevronDown
                  className={`h-4 w-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                />
              </Button>
            </div>
          </div>

          {/* Painel de Filtros */}
          <Collapsible open={showFilters}>
            <CollapsibleContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filters.status?.[0] || 'all'}
                    onValueChange={(value) =>
                      handleFilterChange('status', value === 'all' ? [] : [value])
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Data Inicial</Label>
                  <Input
                    id="startDate"
                    type="text"
                    placeholder="dd/mm/aaaa"
                    maxLength={10}
                    value={filters.start_date || ''}
                    onChange={(e) => {
                      const masked = e.target.value
                        .replace(/\D/g, '')
                        .replace(/(\d{2})(\d)/, '$1/$2')
                        .replace(/(\d{2})(\d)/, '$1/$2')
                        .replace(/(\/\d{4})\d+?$/, '$1');
                      handleFilterChange('start_date', masked || undefined);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Data Final</Label>
                  <Input
                    id="endDate"
                    type="text"
                    placeholder="dd/mm/aaaa"
                    maxLength={10}
                    value={filters.end_date || ''}
                    onChange={(e) => {
                      const masked = e.target.value
                        .replace(/\D/g, '')
                        .replace(/(\d{2})(\d)/, '$1/$2')
                        .replace(/(\d{2})(\d)/, '$1/$2')
                        .replace(/(\/\d{4})\d+?$/, '$1');
                      handleFilterChange('end_date', masked || undefined);
                    }}
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={() => refetch()} className="w-full">
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : requisicoes.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Nenhuma requisição encontrada
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Centro de Custo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Itens</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requisicoes.map((req) => (
                    <TableRow
                      key={req.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedRequisicao(req)}
                    >
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {req.codigo_os}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {req.data_entrada
                          ? format(new Date(req.data_entrada), 'dd/MM/yyyy', { locale: ptBR })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {req.criado_por?.nome_completo
                                ? getInitials(req.criado_por.nome_completo)
                                : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {req.criado_por?.nome_completo || '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {req.centro_custo?.nome || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(req.status_geral)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{req.qtdItens}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(req.valorTotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Página {pagination.page} de {pagination.totalPages} ({pagination.totalCount} registros)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <SheetDetalhesRequisicao
        open={!!selectedRequisicao}
        onClose={() => setSelectedRequisicao(null)}
        requisicao={selectedRequisicao}
        readOnly={selectedRequisicao?.status_geral !== 'concluido'}
      />
    </>
  );
}
