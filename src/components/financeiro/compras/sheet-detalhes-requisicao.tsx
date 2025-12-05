import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  XCircle,
  Loader2,
  Package,
  User,
  Building2,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  useRequisitionItemsByOS,
  useAprovarRequisicao,
  useRecusarRequisicao,
  type RequisicaoCompra,
} from '@/lib/hooks/use-aprovacao-requisicoes';

interface SheetDetalhesRequisicaoProps {
  open: boolean;
  onClose: () => void;
  requisicao: RequisicaoCompra | null;
  onSuccess?: () => void;
  readOnly?: boolean;
}

/**
 * Sheet/Drawer lateral com detalhes completos de uma requisição de compra
 */
export function SheetDetalhesRequisicao({
  open,
  onClose,
  requisicao,
  onSuccess,
  readOnly = false,
}: SheetDetalhesRequisicaoProps) {
  const { items, loading: loadingItems } = useRequisitionItemsByOS(requisicao?.id);
  const { mutate: aprovar, loading: aprovando } = useAprovarRequisicao();
  const { mutate: recusar, loading: recusando } = useRecusarRequisicao();

  const [showRecusaForm, setShowRecusaForm] = useState(false);
  const [motivoRecusa, setMotivoRecusa] = useState('');

  const isPendente = requisicao?.status_geral === 'concluido';
  const canApprove = isPendente && !readOnly;

  const handleAprovar = async () => {
    if (!requisicao) return;

    await aprovar({
      osId: requisicao.id,
      valorTotal: requisicao.valorTotal,
      ccId: requisicao.cc_id || '',
      codigoOS: requisicao.codigo_os,
    });

    onSuccess?.();
    onClose();
  };

  const handleRecusar = async () => {
    if (!requisicao || !motivoRecusa.trim()) return;

    await recusar({
      osId: requisicao.id,
      motivo: motivoRecusa,
      codigoOS: requisicao.codigo_os,
    });

    setShowRecusaForm(false);
    setMotivoRecusa('');
    onSuccess?.();
    onClose();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      concluido: { label: 'Pendente', variant: 'secondary' },
      em_andamento: { label: 'Aprovada', variant: 'default' },
      cancelado: { label: 'Recusada', variant: 'destructive' },
      em_triagem: { label: 'Em Triagem', variant: 'outline' },
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' as const };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <SheetTitle>{requisicao?.codigo_os}</SheetTitle>
            {requisicao && getStatusBadge(requisicao.status_geral)}
          </div>
          <SheetDescription>
            Detalhes da requisição de compra
          </SheetDescription>
        </SheetHeader>

        {requisicao && (
          <div className="py-6 space-y-6">
            {/* Informações Principais */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <User className="h-4 w-4" />
                  <span>Solicitante</span>
                </div>
                <p className="font-medium">{requisicao.criado_por?.nome_completo || '-'}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>Data</span>
                </div>
                <p className="font-medium">
                  {requisicao.data_entrada
                    ? format(new Date(requisicao.data_entrada), 'dd/MM/yyyy', { locale: ptBR })
                    : '-'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Building2 className="h-4 w-4" />
                  <span>Centro de Custo</span>
                </div>
                <p className="font-medium">{requisicao.centro_custo?.nome || '-'}</p>
                {requisicao.centro_custo?.cliente?.nome_razao_social && (
                  <p className="text-xs text-muted-foreground">
                    {requisicao.centro_custo.cliente.nome_razao_social}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <DollarSign className="h-4 w-4" />
                  <span>Valor Total</span>
                </div>
                <p className="font-medium text-lg">{formatCurrency(requisicao.valorTotal)}</p>
              </div>
            </div>

            {/* Descrição */}
            {requisicao.descricao && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="text-sm">{requisicao.descricao}</p>
                </div>
              </>
            )}

            {/* Motivo da Recusa (se cancelado) */}
            {requisicao.status_geral === 'cancelado' && requisicao.observacoes && (
              <>
                <Separator />
                <div className="space-y-2 p-3 bg-destructive/10 rounded-lg">
                  <Label className="text-destructive">Motivo da Recusa</Label>
                  <p className="text-sm">{requisicao.observacoes.replace('RECUSADA: ', '')}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Lista de Itens */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Itens da Requisição
                </h4>
                <Badge variant="outline">{requisicao.qtdItens} itens</Badge>
              </div>

              {loadingItems ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum item encontrado
                </p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge variant="secondary" className="text-xs mb-1">
                            {item.tipo}
                          </Badge>
                          <p className="font-medium text-sm">{item.descricao}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {item.quantidade} {item.unidade_medida} × {formatCurrency(item.preco_unitario)}
                        </span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(item.quantidade * item.preco_unitario)}
                        </span>
                      </div>
                      {item.observacao && (
                        <p className="text-xs text-muted-foreground italic">
                          {item.observacao}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form de Recusa */}
            {showRecusaForm && (
              <>
                <Separator />
                <div className="space-y-3 p-3 bg-destructive/5 rounded-lg">
                  <Label htmlFor="motivo" className="text-destructive">
                    Motivo da Recusa *
                  </Label>
                  <Textarea
                    id="motivo"
                    placeholder="Descreva o motivo da recusa..."
                    value={motivoRecusa}
                    onChange={(e) => setMotivoRecusa(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowRecusaForm(false);
                        setMotivoRecusa('');
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRecusar}
                      disabled={recusando || !motivoRecusa.trim()}
                    >
                      {recusando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirmar Recusa
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer com Ações */}
        {canApprove && !showRecusaForm && (
          <SheetFooter className="border-t pt-4">
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setShowRecusaForm(true)}
                disabled={aprovando}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Recusar
              </Button>
              <Button
                className="flex-1"
                onClick={handleAprovar}
                disabled={aprovando}
              >
                {aprovando ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Aprovar
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
