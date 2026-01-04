/**
 * HomePage - Hub de Informações Gerais (Mural Digital)
 *

 * Grid responsivo com 2 widgets:
 * - Quadro de Avisos (primeira coluna)
 * - Minha Agenda + Aniversariantes (segunda coluna, empilhados)
 */
'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { WeeklyCalendarWidget } from './weekly-calendar-widget';
import { SystemAnnouncementsWidget } from './system-announcements-widget';
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
                    Olá, {currentUser?.nome_completo?.split(' ')[0] || 'Usuário'}!
                </h1>
                <p className="text-muted-foreground mt-1">
                    Bem-vindo ao Minerva ERP - Seu painel de informações
                </p>
            </div>

            {/* Grid de Widgets - 2 colunas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                {/* Widget 1: Quadro de Avisos - primeira coluna */}
                <div>
                    <SystemAnnouncementsWidget />
                </div>

                {/* Widget 2: Segunda coluna - Minha Agenda e Aniversariantes empilhados */}
                <div className="flex flex-col gap-6">
                    <div className="flex-1">
                        <WeeklyCalendarWidget />
                    </div>
                    <div className="flex-1">
                        <BirthdaysWidget />
                    </div>
                </div>
            </div>
        </div>
    );
}
