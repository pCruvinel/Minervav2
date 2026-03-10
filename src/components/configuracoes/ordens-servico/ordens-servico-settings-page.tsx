'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Timer, Percent } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { SlaSettingsTab } from './sla-settings-tab';
import { TaxasSettingsTab } from './taxas-settings-tab';

export function OrdensServicoSettingsPage() {
    const [activeTab, setActiveTab] = useState('sla');

    return (
        <div className="container mx-auto p-6 space-y-6">
            <PageHeader
                title="Ordens de Serviço"
                subtitle="Configure os prazos de SLA e as taxas de precificação para cada tipo de OS."
                showBackButton
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-muted/30 p-1 border border-border/50 rounded-lg">
                    <TabsTrigger value="sla" className="gap-2">
                        <Timer className="w-4 h-4" />
                        SLA por Etapa
                    </TabsTrigger>
                    <TabsTrigger value="taxas" className="gap-2">
                        <Percent className="w-4 h-4" />
                        Taxas de Precificação
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="sla" className="space-y-6 animate-fade-in">
                        <SlaSettingsTab />
                    </TabsContent>

                    <TabsContent value="taxas" className="animate-fade-in">
                        <TaxasSettingsTab />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
