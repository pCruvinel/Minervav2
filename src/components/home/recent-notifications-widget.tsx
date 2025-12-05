/**
 * RecentNotificationsWidget - Últimas Notificações
 * 
 * Exibe as 5 últimas notificações não lidas
 */
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { supabase } from '@/lib/supabase-client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
    Bell,
    ArrowRight,
    FileText,
    UserCheck,
    AlertCircle,
    CheckCircle,
    Clock
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================================
// TIPOS
// ============================================================

interface Notificacao {
    id: string;
    tipo: string;
    titulo: string;
    mensagem: string;
    lida: boolean;
    created_at: string;
}

const TIPO_ICONS: Record<string, any> = {
    'os_criada': FileText,
    'os_atribuida': UserCheck,
    'prazo_proximo': Clock,
    'prazo_vencido': AlertCircle,
    'tarefa_concluida': CheckCircle,
    'default': Bell
};

// ============================================================
// COMPONENTE
// ============================================================

export function RecentNotificationsWidget() {
    const { currentUser } = useAuth();
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNotificacoes() {
            if (!currentUser?.id) return;

            try {
                const { data, error } = await supabase
                    .from('notificacoes')
                    .select('id, tipo, titulo, mensagem, lida, created_at')
                    .eq('usuario_id', currentUser.id)
                    .eq('lida', false)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (error) throw error;
                setNotificacoes(data || []);
            } catch (err) {
                console.warn('[RecentNotificationsWidget] Erro ao carregar:', err);
                setNotificacoes([]);
            } finally {
                setLoading(false);
            }
        }

        fetchNotificacoes();
    }, [currentUser?.id]);

    // Skeleton loader
    if (loading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Bell className="h-5 w-5 text-primary" />
                        Notificações
                    </CardTitle>
                    {notificacoes.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {notificacoes.length} não lida{notificacoes.length > 1 ? 's' : ''}
                        </Badge>
                    )}
                </div>
                <CardDescription>
                    Atualizações recentes
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 overflow-auto">
                {notificacoes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                        <Bell className="h-10 w-10 mb-2 opacity-30" />
                        <p className="text-sm">Nenhuma notificação pendente</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notificacoes.map((notif) => {
                            const Icon = TIPO_ICONS[notif.tipo] || TIPO_ICONS.default;

                            return (
                                <div
                                    key={notif.id}
                                    className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer border-l-2 border-primary"
                                >
                                    <div className="flex items-start gap-2">
                                        <Icon className="h-4 w-4 mt-0.5 text-primary" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {notif.titulo}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                {notif.mensagem}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDistanceToNow(new Date(notif.created_at), {
                                                    addSuffix: true,
                                                    locale: ptBR
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-2 border-t">
                <Link
                    to="/notificacoes"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                    Ver Todas
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </CardFooter>
        </Card>
    );
}
