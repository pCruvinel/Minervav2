/**
 * ExecutiveDashboard - Container Principal
 * 
 * Dashboard Executivo com 3 abas:
 * - Visão Geral (KPIs)
 * - Controladoria (Kanban de Carga)
 * - Auditoria (Logs)
 * 
 * Acesso restrito: admin, diretor, diretoria
 */
'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExecutiveOverview } from './executive-overview';
import { WorkloadKanban } from './workload-kanban';
import { SystemAuditLog } from './system-audit-log';
import {
    ShieldAlert,
    BarChart3,
    Users,
    FileSearch,
    Loader2
} from 'lucide-react';

// ============================================================
// CONSTANTES
// ============================================================

const ALLOWED_ROLES = ['admin', 'diretor', 'diretoria'];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function ExecutiveDashboard() {
    const { currentUser, isLoading } = useAuth();

    // Loading
    if (isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Verificar acesso
    const userRole = currentUser?.cargo_slug || currentUser?.role_nivel || '';
    const hasAccess = ALLOWED_ROLES.includes(userRole);

    if (!hasAccess) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center max-w-md space-y-4">
                    <ShieldAlert className="h-16 w-16 mx-auto text-destructive opacity-50" />
                    <h2 className="text-xl font-semibold">Acesso Restrito</h2>
                    <p className="text-muted-foreground">
                        Este dashboard é exclusivo para Diretoria e Administradores.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-semibold mb-2">Dashboard Executivo</h1>
                <p className="text-muted-foreground">
                    Governança, Controladoria e Auditoria do Sistema
                </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span className="hidden sm:inline">Visão Geral</span>
                        <span className="sm:hidden">KPIs</span>
                    </TabsTrigger>
                    <TabsTrigger value="workload" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Controladoria</span>
                        <span className="sm:hidden">Carga</span>
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="flex items-center gap-2">
                        <FileSearch className="h-4 w-4" />
                        <span className="hidden sm:inline">Auditoria</span>
                        <span className="sm:hidden">Logs</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <ExecutiveOverview />
                </TabsContent>

                <TabsContent value="workload">
                    <WorkloadKanban />
                </TabsContent>

                <TabsContent value="audit">
                    <SystemAuditLog />
                </TabsContent>
            </Tabs>
        </div>
    );
}
