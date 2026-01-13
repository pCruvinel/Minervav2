'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, LayoutTemplate, History } from 'lucide-react';
import { WhatsAppEmailTab } from './whatsapp-email-tab';
import { TemplatesManager } from './templates-manager';
import { MessageHistory } from './message-history';

export function SistemaPage() {
    const [activeTab, setActiveTab] = useState('conexoes');

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-neutral-900">Configurações do Sistema</h1>
                <p className="text-neutral-600">
                    Gerencie integrações, templates de mensagens e parâmetros globais do sistema.
                </p>
            </div>

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
