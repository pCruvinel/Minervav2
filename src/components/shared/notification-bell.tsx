import React from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/lib/hooks/use-notifications';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router';

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
    const [isOpen, setIsOpen] = React.useState(false);

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case 'atencao': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'sucesso': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'tarefa': return <Info className="w-4 h-4 text-blue-500" />; // Ou outro ícone de tarefa
            default: return <Info className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-600 border-2 border-white" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold text-sm">Notificações</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto py-1 px-2"
                            onClick={() => markAllAsRead()}
                        >
                            Marcar lidas
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[300px]">
                    {isLoading && notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Carregando...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            Nenhuma notificação recente
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 border-b last:border-0 hover:bg-muted/50 transition-colors relative group",
                                        !notification.lida && "bg-muted/30"
                                    )}
                                >
                                    <div className="flex gap-3 items-start">
                                        <div className="mt-1 flex-shrink-0">
                                            {getIcon(notification.tipo)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className={cn("text-sm font-medium leading-none", !notification.lida && "text-foreground")}>
                                                {notification.titulo}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notification.mensagem}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(notification.created_at).toLocaleDateString()}
                                                </span>
                                                {notification.link_acao && (
                                                    <Link to={notification.link_acao} className="text-[10px] flex items-center text-primary hover:underline">
                                                        Ver <ExternalLink className="w-3 h-3 ml-1" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                        {!notification.lida && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(notification.id);
                                                }}
                                                title="Marcar como lida"
                                            >
                                                <Check className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
