import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase-client';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
    id: string;
    titulo: string;
    mensagem: string;
    tipo: 'info' | 'atencao' | 'sucesso' | 'tarefa' | 'aprovacao';
    created_at: string;
    lida: boolean;
    link_acao?: string;
}

interface OSNotificationsCardProps {
    osId: string;
    codigoOS: string;
}

/**
 * OSNotificationsCard - Exibe notificações relacionadas a uma OS
 * 
 * Segue o mesmo padrão visual dos cards "Detalhes" e "Progresso":
 * - Card com `border-border rounded-lg shadow-sm`
 * - Header com `bg-muted/40 border-b border-border/50`
 * - Ícone com `text-primary`
 * - Itens internos com `p-4 rounded-lg bg-muted/30 border border-border/50`
 */
export function OSNotificationsCard({ osId, codigoOS }: OSNotificationsCardProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, [osId, codigoOS]);

    const loadNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notificacoes')
                .select('*')
                .or(`link_acao.ilike.%${osId}%,titulo.ilike.%${codigoOS}%,mensagem.ilike.%${codigoOS}%`)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error('Erro ao buscar notificações da OS:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case 'atencao':
                return <AlertTriangle className="w-4 h-4 text-warning" />;
            case 'sucesso':
            case 'aprovacao':
                return <CheckCircle className="w-4 h-4 text-success" />;
            case 'tarefa':
                return <Clock className="w-4 h-4 text-primary" />;
            default:
                return <Info className="w-4 h-4 text-info" />;
        }
    };

    // Padrão do card Progresso: border-border rounded-lg shadow-sm
    if (loading) {
        return (
            <Card className="border-border rounded-lg shadow-sm flex flex-col">
                <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Bell className="w-5 h-5 text-primary" />
                        Notificações
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 flex items-center justify-center min-h-[120px]">
                    <span className="text-sm text-muted-foreground">Carregando...</span>
                </CardContent>
            </Card>
        );
    }

    if (notifications.length === 0) {
        return (
            <Card className="border-border rounded-lg shadow-sm flex flex-col">
                <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Bell className="w-5 h-5 text-primary" />
                        Notificações
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[120px] text-center">
                    <Bell className="w-8 h-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhuma notificação registrada</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border rounded-lg shadow-sm flex flex-col flex-1 h-full">
            <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Notificações
                    <span className="ml-auto text-xs font-normal text-muted-foreground">
                        {notifications.length} registro(s)
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-4 flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1">
                    <div className="space-y-3 pr-4">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex gap-3 items-start">
                                    <div className="mt-0.5 flex-shrink-0">
                                        {getIcon(notif.tipo)}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-medium text-foreground leading-tight">
                                                {notif.titulo}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: ptBR })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {notif.mensagem}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
