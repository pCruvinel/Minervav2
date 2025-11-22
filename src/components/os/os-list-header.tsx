import { Link } from '@tanstack/react-router';
import { PrimaryButton } from '../ui/primary-button';
import { Plus } from 'lucide-react';

interface OSListHeaderProps {
  // onCreateClick removed as it's handled internally by Link
}

export function OSListHeader({ }: OSListHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1>Ordens de Serviço</h1>
      <PrimaryButton asChild>
        <Link to="/os/criar">
          <Plus className="h-4 w-4 mr-2" />
          Criar Nova OS
        </Link>
      </PrimaryButton>
    </div>
  );
}
