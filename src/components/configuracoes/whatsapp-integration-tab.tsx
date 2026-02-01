/**
 * WhatsApp Integration Tab - Placeholder
 */

import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function WhatsAppIntegrationTab() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
        <MessageSquare className="h-8 w-8 text-emerald-500" />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-xl font-semibold">Integração WhatsApp</h3>
          <Badge variant="secondary">Em breve</Badge>
        </div>
        
        <p className="text-muted-foreground max-w-md">
          Envie notificações automáticas, lembretes de pagamento e 
          atualizações de status via WhatsApp para seus clientes.
        </p>
      </div>

      <div className="pt-4 text-sm text-muted-foreground">
        <p>Funcionalidades planejadas:</p>
        <ul className="mt-2 space-y-1">
          <li>• Notificações de boletos</li>
          <li>• Lembretes de vencimento</li>
          <li>• Atualizações de OS</li>
        </ul>
      </div>
    </div>
  );
}
