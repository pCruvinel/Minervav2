import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAprovarRequisicao, useRecusarRequisicao } from '@/lib/hooks/use-aprovacao-requisicoes';
import { toast } from 'sonner';

interface ModalAprovarRequisicaoProps {
  open: boolean;
  onClose: () => void;
  requisicao: {
    id: string;
    codigo_os: string;
    criado_por: { nome_completo: string };
    centro_custo: { id: string; nome: string };
    data_entrada: string;
    valorTotal: number;
  };
  onSuccess: () => void;
}

export function ModalAprovarRequisicao({
  open,
  onClose,
  requisicao,
  onSuccess
}: ModalAprovarRequisicaoProps) {
  const [motivoRecusa, setMotivoRecusa] = useState('');
  const [modoRecusa, setModoRecusa] = useState(false);

  const { mutate: aprovar, loading: loadingAprovar } = useAprovarRequisicao();
  const { mutate: recusar, loading: loadingRecusar } = useRecusarRequisicao();

  const handleAprovar = async () => {
    await aprovar({
      osId: requisicao.id,
      valorTotal: requisicao.valorTotal,
      ccId: requisicao.centro_custo?.id,
      codigoOS: requisicao.codigo_os
    });
    onSuccess();
    onClose();
  };

  const handleRecusar = async () => {
    if (!motivoRecusa.trim()) {
      toast.error('Por favor, informe o motivo da recusa');
      return;
    }
    await recusar({
      osId: requisicao.id,
      motivo: motivoRecusa,
      codigoOS: requisicao.codigo_os
    });
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Aprovar Requisição - {requisicao.codigo_os}
          </DialogTitle>
          <DialogDescription>
            Revise os detalhes antes de aprovar ou recusar a requisição.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info Header */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Solicitante</Label>
              <p className="font-medium">{requisicao.criado_por?.nome_completo}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Data</Label>
              <p className="font-medium">
                {new Date(requisicao.data_entrada).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Centro de Custo</Label>
              <p className="font-medium">{requisicao.centro_custo?.nome}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Valor Total</Label>
              <p className="text-xl font-bold text-primary">
                R$ {requisicao.valorTotal.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
          </div>

          <Separator />

          {/* Modo Recusa */}
          {modoRecusa && (
            <div className="space-y-2">
              <Label htmlFor="motivo">
                Motivo da Recusa <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="motivo"
                value={motivoRecusa}
                onChange={(e) => setMotivoRecusa(e.target.value)}
                placeholder="Explique o motivo da recusa..."
                rows={4}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>

          {!modoRecusa ? (
            <>
              <Button
                variant="destructive"
                onClick={() => setModoRecusa(true)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Recusar
              </Button>
              <Button
                onClick={handleAprovar}
                disabled={loadingAprovar}
              >
                {loadingAprovar ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Aprovar Requisição
              </Button>
            </>
          ) : (
            <Button
              variant="destructive"
              onClick={handleRecusar}
              disabled={loadingRecusar || !motivoRecusa.trim()}
            >
              {loadingRecusar ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Confirmar Recusa
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
