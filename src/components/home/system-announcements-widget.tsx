/**
 * SystemAnnouncementsWidget - Quadro de Avisos
 * 
 * Exibe avisos do sistema (tabela sistema_avisos)
 */
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Megaphone, AlertTriangle, Info, CheckCircle } from 'lucide-react';

// ============================================================
// TIPOS
// ============================================================

interface Aviso {
    id: string;
    titulo: string;
    mensagem: string;
    tipo: 'info' | 'alert' | 'warning' | 'success';
    created_at: string;
}

const TIPO_CONFIG = {
    info: {
        icon: Info,
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-700 dark:text-blue-400'
    },
    alert: {
        icon: AlertTriangle,
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-700 dark:text-red-400'
    },
    warning: {
        icon: AlertTriangle,
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-700 dark:text-yellow-400'
    },
    success: {
        icon: CheckCircle,
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        text: 'text-green-700 dark:text-green-400'
    }
};

// ============================================================
// COMPONENTE
// ============================================================

export function SystemAnnouncementsWidget() {
    const [avisos, setAvisos] = useState<Aviso[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAvisos() {
            try {
                const { data, error } = await supabase
                    .from('sistema_avisos')
                    .select('id, titulo, mensagem, tipo, created_at')
                    .eq('ativo', true)
                    .or(`validade.is.null,validade.gte.${new Date().toISOString().split('T')[0]}`)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (error) throw error;
                setAvisos(data || []);
            } catch (err) {
                console.warn('[SystemAnnouncementsWidget] Erro ao carregar:', err);
                setAvisos([]);
            } finally {
                setLoading(false);
            }
        }

        fetchAvisos();
    }, []);

    // Skeleton loader
    if (loading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Megaphone className="h-5 w-5 text-primary" />
                    Quadro de Avisos
                </CardTitle>
                <CardDescription>
                    Comunicados importantes
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 overflow-auto">
                {avisos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                        <Megaphone className="h-10 w-10 mb-2 opacity-30" />
                        <p className="text-sm">Sem avisos recentes</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {avisos.map((aviso) => {
                            const config = TIPO_CONFIG[aviso.tipo] || TIPO_CONFIG.info;
                            const Icon = config.icon;

                            return (
                                <div
                                    key={aviso.id}
                                    className={`p-3 rounded-lg border ${config.bg} ${config.border}`}
                                >
                                    <div className="flex items-start gap-2">
                                        <Icon className={`h-5 w-5 mt-0.5 ${config.text}`} />
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-medium text-sm ${config.text}`}>
                                                {aviso.titulo}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {aviso.mensagem}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
