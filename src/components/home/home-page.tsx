/**
 * HomePage - Hub de Informações Gerais (Mural Digital)
 * 
 * Grid responsivo com 4 widgets:
 * - Resumo Semanal (Calendário)
 * - Quadro de Avisos
 * - Notificações Recentes
 * - Aniversariantes do Mês
 */
'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { WeeklyCalendarWidget } from './weekly-calendar-widget';
import { SystemAnnouncementsWidget } from './system-announcements-widget';
import { RecentNotificationsWidget } from './recent-notifications-widget';
import { BirthdaysWidget } from './birthdays-widget';
import { Loader2 } from 'lucide-react';

// ============================================================
// COMPONENTE
// ============================================================

export function HomePage() {
    const { currentUser, isLoading } = useAuth();

    // Loading
    if (isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-semibold">
                    Olá, {currentUser?.nome_completo?.split(' ')[0] || 'Usuário'}! 👋
                </h1>
                <p className="text-muted-foreground mt-1">
                    Bem-vindo ao Minerva ERP - Seu painel de informações
                </p>
            </div>

            {/* Grid de Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Widget 1: Resumo Semanal */}
                <div className="min-h-[350px]">
                    <WeeklyCalendarWidget />
                </div>

                {/* Widget 2: Quadro de Avisos */}
                <div className="min-h-[350px]">
                    <SystemAnnouncementsWidget />
                </div>

                {/* Widget 3: Notificações */}
                <div className="min-h-[350px]">
                    <RecentNotificationsWidget />
                </div>

                {/* Widget 4: Aniversariantes */}
                <div className="min-h-[350px]">
                    <BirthdaysWidget />
                </div>
            </div>
        </div>
    );
}
