import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/contexts/auth-context';
import { NotificationService, Notification, CreateNotificationParams } from '@/lib/services/notifications-service';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';

export function useNotifications() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar notificações iniciais
  const loadNotifications = useCallback(async () => {
    if (!currentUser?.id) return;
    
    setIsLoading(true);
    try {
      // Carrega as 50 mais recentes
      const data = await NotificationService.list(currentUser.id, 50);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.lida).length);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Efeito Realtime
  useEffect(() => {
    if (!currentUser?.id) return;

    loadNotifications();

    // Inscrever no canal realtime
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes',
          filter: `usuario_id=eq.${currentUser.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Toast visual (opcional, já que teremos o sino)
          // Mas bom para alertar se o usuário estiver em outra aba
          if (newNotification.tipo === 'atencao' || newNotification.tipo === 'tarefa') {
            toast(newNotification.titulo, {
              description: newNotification.mensagem,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, loadNotifications]);

  // Ações
  const markAsRead = async (id: string) => {
    // Otimistic update
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, lida: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    await NotificationService.markAsRead(id);
  };

  const markAllAsRead = async () => {
    if (!currentUser?.id) return;
    
    setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
    setUnreadCount(0);

    await NotificationService.markAllAsRead(currentUser.id);
  };

  // Função utilitária para enviar notificação (usada por quem delega, por exemplo)
  const sendNotification = async (params: CreateNotificationParams) => {
    return await NotificationService.create(params);
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    sendNotification,
    refresh: loadNotifications
  };
}
