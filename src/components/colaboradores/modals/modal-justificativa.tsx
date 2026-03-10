import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Paperclip, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-client';

export interface ModalJustificativaProps {
  open: boolean;
  onClose: () => void;
  onSalvar: (justificativa: string, minutosAtraso?: number, anexoUrl?: string) => void;
  tipo: 'STATUS' | 'PERFORMANCE';
  colaboradorNome: string;
  colaboradorId?: string;
  status: 'OK' | 'ATRASADO' | 'FALTA';
}

export function ModalJustificativa({ open, onClose, onSalvar, tipo, colaboradorNome, colaboradorId, status }: ModalJustificativaProps) {
  const [justificativa, setJustificativa] = useState('');
  const [minutosAtraso, setMinutosAtraso] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Formato não suportado. Use PDF, JPG ou PNG.');
        e.target.value = '';
        return;
      }
      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 5MB.');
        e.target.value = '';
        return;
      }
      setArquivo(file);
    }
  };

  const handleSalvar = async () => {
    if (!justificativa.trim()) {
      toast.error('Preencha a justificativa');
      return;
    }

    if (status === 'ATRASADO' && tipo === 'STATUS') {
      const mins = parseInt(minutosAtraso);
      if (!minutosAtraso || isNaN(mins) || mins < 1) {
        toast.error('O campo minutos de atraso é obrigatório quando o status é ATRASADO. Informe um valor de pelo menos 1 minuto.');
        return;
      }
    }

    let anexoUrl: string | undefined;

    // Upload do arquivo se existir
    if (arquivo && colaboradorId) {
      setUploading(true);
      try {
        const fileName = `${colaboradorId}/${Date.now()}_${arquivo.name}`;

        const { error: uploadError } = await supabase.storage
          .from('comprovantes-presenca')
          .upload(fileName, arquivo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('comprovantes-presenca')
          .getPublicUrl(fileName);

        anexoUrl = publicUrl;
      } catch (error) {
        console.error('Erro ao fazer upload:', error);
        toast.error('Erro ao fazer upload do arquivo. Tente novamente.');
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    onSalvar(justificativa, minutosAtraso ? parseInt(minutosAtraso) : undefined, anexoUrl);
    setJustificativa('');
    setMinutosAtraso('');
    setArquivo(null);
  };

  const handleClose = () => {
    setJustificativa('');
    setMinutosAtraso('');
    setArquivo(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {tipo === 'STATUS' ? 'Justificativa Obrigatória' : 'Justifique a Performance'}
          </DialogTitle>
          <DialogDescription>
            {tipo === 'STATUS'
              ? `Informe o motivo da ${status === 'FALTA' ? 'falta' : 'chegada atrasada'} de ${colaboradorNome}`
              : `Explique por que a performance de ${colaboradorNome} foi avaliada como RUIM`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {status === 'ATRASADO' && tipo === 'STATUS' && (
            <div className="space-y-2">
              <Label>Minutos de Atraso *</Label>
              <Input
                type="number"
                min="1"
                placeholder="Ex: 30"
                value={minutosAtraso}
                onChange={(e) => setMinutosAtraso(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Justificativa *</Label>
            <Textarea
              placeholder="Descreva o motivo detalhadamente..."
              rows={4}
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
            />
          </div>

          {/* Campo de anexo - só para STATUS (falta/atraso) */}
          {tipo === 'STATUS' && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Anexar Comprovante (Opcional)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {arquivo && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setArquivo(null)}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {arquivo && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  {arquivo.name} ({(arquivo.size / 1024).toFixed(1)} KB)
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: PDF, JPG, PNG (máx. 5MB)
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={uploading}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Salvar Justificativa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
