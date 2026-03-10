import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PlusCircle } from 'lucide-react';
import { useDynamicLineReplication, type ReplicationScope } from '../hooks/use-dynamic-line-replication';

interface AddCustomItemButtonProps {
  scope: ReplicationScope;
  sectionId: string;
}

export function AddCustomItemButton({ scope, sectionId }: AddCustomItemButtonProps) {
  const { addCustomItem } = useDynamicLineReplication();
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState('');

  const handleAdd = () => {
    if (!label.trim()) return;

    addCustomItem(scope, sectionId, label.trim());

    setLabel('');
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="mt-2 text-sm text-neutral-600 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar item extra
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Adicionar nova linha</h4>
          <p className="text-xs text-neutral-500">
            {scope.type === 'pavimento'
              ? 'Esta linha será replicada para todos os pavimentos deste bloco.'
              : 'Esta linha será replicada para todos os blocos.'}
          </p>
          <div className="flex gap-2">
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Teste de fumaça"
              className="flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <Button onClick={handleAdd} disabled={!label.trim()}>
              Adicionar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
