import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  CheckCircle,
  XCircle,
  Package,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  useRequisicoesPendentes,
  type RequisicaoCompra,
} from '@/lib/hooks/use-aprovacao-requisicoes';
import { AprovacaoRequisicaoModal } from './aprovacao-requisicao-modal';

/**
 * Aba de requisições pendentes de aprovação
 */
export function TabPendentesAprovacao() {
  const navigate = useNavigate();
  const { requisicoes, loading, refetch } = useRequisicoesPendentes();

  // Estado para o modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState<'aprovar' | 'recusar'>('aprovar');
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

  const handleOpenModal = (req: RequisicaoCompra, tipo: 'aprovar' | 'recusar') => {
    setSelectedRequisicao(req);
    setModalTipo(tipo);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Requisições Aguardando Aprovação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Requisições Aguardando Aprovação
            </CardTitle>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {requisicoes.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {requisicoes.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Nenhuma requisição pendente de aprovação
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Centro de Custo</TableHead>
                  <TableHead className="text-center">Itens</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requisicoes.map((req) => (
                  <TableRow
                    key={req.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate({ to: '/os/$osId', params: { osId: req.id } })}
                  >
                    <TableCell>
                      <div>
                        <Badge variant="outline" className="font-mono">
                          {req.codigo_os}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {req.data_entrada
                            ? format(new Date(req.data_entrada), 'dd/MM/yyyy', { locale: ptBR })
                            : '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-secondary text-secondary-foreground">
                        Aguard. Aprovação
                      </Badge>
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
                    <TableCell className="text-center">
                      <Badge variant="outline">{req.qtdItens}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(req.valorTotal)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleOpenModal(req, 'recusar')}
                          title="Recusar"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                          onClick={() => handleOpenModal(req, 'aprovar')}
                          title="Aprovar"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Aprovação/Rejeição */}
      <AprovacaoRequisicaoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        requisicao={selectedRequisicao}
        tipo={modalTipo}
        onSuccess={refetch}
      />
    </>
  );
}
