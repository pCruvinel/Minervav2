'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, LayoutTemplate, History } from 'lucide-react';
import { WhatsAppEmailTab } from './whatsapp-email-tab';
import { TemplatesManager } from './templates-manager';
import { MessageHistory } from './message-history';

import { PageHeader } from '@/components/shared/page-header';

export function SistemaPage() {
    const [activeTab, setActiveTab] = useState('conexoes');

    return (
        <div className="container mx-auto p-6 space-y-6">
            <PageHeader
                title="Configurações do Sistema"
                subtitle="Gerencie integrações, templates de mensagens e parâmetros globais do sistema."
                showBackButton
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-muted/30 p-1 border border-border/50 rounded-lg">
                    <TabsTrigger value="conexoes" className="gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Conexão
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="gap-2">
                        <LayoutTemplate className="w-4 h-4" />
                        Templates
                    </TabsTrigger>
                    <TabsTrigger value="historico" className="gap-2">
                        <History className="w-4 h-4" />
                        Histórico de Envios
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="conexoes" className="space-y-6 animate-fade-in">
                        <WhatsAppEmailTab />
                    </TabsContent>

                    <TabsContent value="templates" className="animate-fade-in">
                        <TemplatesManager />
                    </TabsContent>

                    <TabsContent value="historico" className="animate-fade-in">
                        <MessageHistory />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
