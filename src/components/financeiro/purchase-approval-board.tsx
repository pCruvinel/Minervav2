import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, Clock, ShoppingCart } from 'lucide-react';
import { useRequisicoesPendentes } from '@/lib/hooks/use-aprovacao-requisicoes';
import { ModalAprovarRequisicao } from './modal-aprovar-requisicao';
import { Skeleton } from '@/components/ui/skeleton';

export function PurchaseApprovalBoard() {
  const { requisicoes, loading, refetch } = useRequisicoesPendentes();
  const [selectedRequisicao, setSelectedRequisicao] = useState<any>(null);

  const kpis = {
    pendentes: requisicoes.length,
    valorTotal: requisicoes.reduce((sum, r) => sum + r.valorTotal, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Aprovar Requisições de Compra</h1>
        <p className="text-muted-foreground">
          Gerencie e aprove requisições de compra da OS-09
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{kpis.pendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <ShoppingCart className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">
                  R$ {kpis.valorTotal.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Requisições Pendentes de Aprovação</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : requisicoes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma requisição pendente no momento</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Centro de Custo</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requisicoes.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">{req.codigo_os}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(req.data_entrada).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{req.criado_por?.nome_completo}</TableCell>
                    <TableCell>
                      <span className="text-sm">{req.centro_custo?.nome}</span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      R$ {req.valorTotal.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => setSelectedRequisicao(req)}
                      >
                        Revisar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {selectedRequisicao && (
        <ModalAprovarRequisicao
          open={!!selectedRequisicao}
          onClose={() => setSelectedRequisicao(null)}
          requisicao={selectedRequisicao}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
