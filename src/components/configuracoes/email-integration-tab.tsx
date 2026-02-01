/**
 * Email Integration Tab - Placeholder
 */

import { Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function EmailIntegrationTab() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
        <Mail className="h-8 w-8 text-blue-500" />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-xl font-semibold">Integração E-mail</h3>
          <Badge variant="secondary">Em breve</Badge>
        </div>
        
        <p className="text-muted-foreground max-w-md">
          Configure templates de e-mail personalizados e automatize 
          a comunicação com seus clientes.
        </p>
      </div>

      <div className="pt-4 text-sm text-muted-foreground">
        <p>Funcionalidades planejadas:</p>
        <ul className="mt-2 space-y-1">
          <li>• Templates personalizáveis</li>
          <li>• Envio automático de boletos</li>
          <li>• Relatórios por e-mail</li>
        </ul>
      </div>
    </div>
  );
}
