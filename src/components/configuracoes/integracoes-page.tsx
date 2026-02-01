/**
 * Página de Integrações - Tabs: Banco Cora | WhatsApp | E-mail
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/page-header';
import { CoraIntegrationTab } from './cora-integration-tab';
import { WhatsAppIntegrationTab } from './whatsapp-integration-tab';
import { EmailIntegrationTab } from './email-integration-tab';
import { Building2, MessageSquare, Mail } from 'lucide-react';

export function IntegracoesPage() {
  const [activeTab, setActiveTab] = useState('cora');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader 
        title="Integrações" 
        subtitle="Gerencie conexões com serviços externos."
        showBackButton
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
          <TabsTrigger value="cora" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Banco</span> Cora
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            E-mail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cora" className="space-y-4">
          <CoraIntegrationTab />
        </TabsContent>

        <TabsContent value="whatsapp">
          <WhatsAppIntegrationTab />
        </TabsContent>

        <TabsContent value="email">
          <EmailIntegrationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
