/**
 * Modal para definir dia de vencimento em lote
 * 
 * Permite ao RH definir o mesmo dia de vencimento para
 * múltiplos colaboradores de uma vez.
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  colaboradores: Array<{ id: string; nome_completo: string; dia_vencimento?: number | null }>;
  onSuccess: () => void;
}

export function ModalVencimentoLote({ open, onClose, colaboradores, onSuccess }: Props) {
  const [diaVencimento, setDiaVencimento] = useState<number>(5);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecionarTodos, setSelecionarTodos] = useState(false);

  const handleToggleTodos = (checked: boolean) => {
    setSelecionarTodos(checked);
    setSelecionados(checked ? colaboradores.map(c => c.id) : []);
  };

  const handleToggle = (id: string) => {
    setSelecionados(prev => {
      const isSelected = prev.includes(id);
      const newSelected = isSelected 
        ? prev.filter(x => x !== id)
        : [...prev, id];
      
      // Atualizar estado do checkbox "todos" se necessário
      if (newSelected.length === colaboradores.length) setSelecionarTodos(true);
      else setSelecionarTodos(false);
      
      return newSelected;
    });
  };

  const handleSalvar = async () => {
    if (selecionados.length === 0) {
      toast.error('Selecione ao menos um colaborador');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('colaboradores')
        .update({ dia_vencimento: diaVencimento })
        .in('id', selecionados);

      if (error) throw error;

      toast.success(`Vencimento atualizado para ${selecionados.length} colaborador(es)`);
      onSuccess();
      onClose();
      setSelecionados([]);
      setSelecionarTodos(false);
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao atualizar vencimentos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Definir Vencimento em Lote</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-md mb-4">
              <p className="text-sm text-muted-foreground mb-4">
                  Selecione os colaboradores e defina o dia em que suas despesas devem aparecer na Folha de Pagamento.
              </p>
              
              {/* Seleção do dia */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Dia de Vencimento:</span>
                <Select
                  value={diaVencimento.toString()}
                  onValueChange={(v) => setDiaVencimento(parseInt(v))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 31}, (_, i) => i + 1).map(dia => (
                      <SelectItem key={dia} value={dia.toString()}>
                        Dia {dia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          </div>

          {/* Selecionar todos */}
          <div className="flex items-center gap-2 border-b pb-2">
            <Checkbox
              checked={selecionarTodos}
              onCheckedChange={(checked) => handleToggleTodos(checked as boolean)}
              id="select-all"
            />
            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
              Selecionar Todos ({colaboradores.length})
            </label>
            <span className="ml-auto text-xs text-muted-foreground">
                {selecionados.length} selecionados
            </span>
          </div>

          {/* Lista de colaboradores */}
          <div className="space-y-1 max-h-60 overflow-y-auto pr-2">
            {colaboradores.map(c => (
              <div 
                key={c.id} 
                className="flex items-center justify-between p-2 rounded hover:bg-muted/50 border border-transparent hover:border-border transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selecionados.includes(c.id)}
                    onCheckedChange={() => handleToggle(c.id)}
                    id={`colab-${c.id}`}
                  />
                  <label htmlFor={`colab-${c.id}`} className="text-sm cursor-pointer select-none">
                      {c.nome_completo}
                  </label>
                </div>
                <div className="text-xs">
                    {c.dia_vencimento ? (
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded">Dia {c.dia_vencimento}</span>
                    ) : (
                        <span className="text-muted-foreground">Não definido</span>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSalvar} disabled={loading || selecionados.length === 0}>
            {loading ? 'Salvando...' : `Salvar (${selecionados.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
