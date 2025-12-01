import React from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Info } from 'lucide-react';

/**
 * Banner informativo indicando que o sistema está em modo frontend only
 */
export function FrontendModeBanner() {
  // Verificar se o sistema está em modo frontend
  const isFrontendMode = false; // Backend conectado ao Supabase
  
  if (!isFrontendMode) return null;
  
  return (
    <Alert className="border-primary/20 bg-primary/5 mb-4">
      <Info className="h-4 w-4 text-primary" />
      <AlertDescription className="text-primary text-sm">
        <strong>Modo Frontend:</strong> Sistema funcionando sem backend. 
        Todas as operações são simuladas localmente. 
        {' '}
        <span className="text-primary">Nenhum dado é persistido entre sessões.</span>
      </AlertDescription>
    </Alert>
  );
}