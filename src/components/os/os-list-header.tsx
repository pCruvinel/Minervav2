import React from 'react';
import { PrimaryButton } from '../ui/primary-button';
import { Plus } from 'lucide-react';

interface OSListHeaderProps {
  onCreateClick: () => void;
}

export function OSListHeader({ onCreateClick }: OSListHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1>Ordens de Serviço</h1>
      <PrimaryButton onClick={onCreateClick}>
        <Plus className="h-4 w-4 mr-2" />
        Criar Nova OS
      </PrimaryButton>
    </div>
  );
}
