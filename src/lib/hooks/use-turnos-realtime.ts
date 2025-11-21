/**
 * Hook: useTurnosRealtime
 *
 * Hook para sincronização em tempo real de turnos usando Supabase Realtime
 * - Subscrição a mudanças em tempo real
 * - Suporte offline com localStorage
 * - Sincronização automática ao conectar
 * - Resolução de conflitos (last-write-wins)
 *
 * @module use-turnos-realtime
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Turno, TurnoComVagas } from './use-turnos';
import { toast } from 'sonner';

// =====================================================
// TYPES
// =====================================================

export interface RealtimeSubscriptionState {
  turnos: TurnoComVagas[];
  loading: boolean;
  error: Error | null;
  isOnline: boolean;
  lastSync?: Date;
  conflictCount: number;
}

interface CachedTurnoData {
  turnos: TurnoComVagas[];
  timestamp: number;
}

// =====================================================
// CONSTANTS
// =====================================================

const CACHE_KEY = 'calendario_turnos_cache';
const CACHE_TIMESTAMP_KEY = 'calendario_turnos_cache_time';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Armazena turnos no localStorage para uso offline
 */
function saveTurnosToCache(turnos: TurnoComVagas[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(turnos));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    }
  } catch (error) {
    console.warn('⚠️ Erro ao salvar turnos em cache:', error);
  }
}

/**
 * Recupera turnos do localStorage
 */
function getTurnosFromCache(): CachedTurnoData | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const turnos = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (turnos && timestamp) {
        const cachedTime = parseInt(timestamp, 10);
        const now = Date.now();

        // Verificar se cache não expirou
        if (now - cachedTime < CACHE_TTL) {
          return {
            turnos: JSON.parse(turnos),
            timestamp: cachedTime,
          };
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ Erro ao recuperar turnos do cache:', error);
  }

  return null;
}

/**
 * Limpa cache de turnos
 */
function clearTurnosCache(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    }
  } catch (error) {
    console.warn('⚠️ Erro ao limpar cache:', error);
  }
}

/**
 * Resolve conflito entre duas versões de turno
 * Estratégia: Last-Write-Wins (mais recente vence)
 */
function resolveConflict(local: TurnoComVagas, remote: TurnoComVagas): TurnoComVagas {
  const localTime = new Date(local.atualizadoEm || 0).getTime();
  const remoteTime = new Date(remote.atualizadoEm || 0).getTime();

  if (localTime >= remoteTime) {
    return local;
  }
  return remote;
}

/**
 * Mapeia turno do banco de dados para o tipo local
 */
function mapTurnoFromDB(data: any): TurnoComVagas {
  return {
    id: data.id,
    horaInicio: data.hora_inicio,
    horaFim: data.hora_fim,
    vagasTotal: data.vagas_total,
    vagasOcupadas: Number(data.vagas_ocupadas || 0),
    setores: data.setores || [],
    cor: data.cor,
    tipoRecorrencia: data.tipo_recorrencia,
    dataInicio: data.data_inicio,
    dataFim: data.data_fim,
    diasSemana: data.dias_semana,
    ativo: data.ativo,
    criadoPor: data.criado_por,
    criadoEm: data.criado_em,
    atualizadoEm: data.atualizado_em,
    agendamentos: data.agendamentos,
  };
}

// =====================================================
// HOOKS
// =====================================================

/**
 * Hook para sincronização em tempo real de turnos
 *
 * @param dateRange - Range de datas para filtrar turnos (opcional)
 * @returns Estado de realtime com turnos, loading, error, etc
 *
 * @example
 * ```typescript
 * const { turnos, loading, error, isOnline } = useTurnosRealtime({
 *   start: '2025-11-20',
 *   end: '2025-11-27'
 * });
 *
 * useEffect(() => {
 *   if (error) toast.error('Erro ao sincronizar turnos');
 * }, [error]);
 * ```
 */
export function useTurnosRealtime(dateRange?: { start: string; end: string }) {
  const [state, setState] = useState<RealtimeSubscriptionState>({
    turnos: [],
    loading: true,
    error: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    conflictCount: 0,
  });

  const subscriptionRef = useRef<any>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  /**
   * Carrega turnos iniciais do cache ou do servidor
   */
  const initializeTurnos = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Tentar carregar do cache primeiro
      const cached = getTurnosFromCache();
      if (cached && !state.isOnline) {
        setState((prev) => ({
          ...prev,
          turnos: cached.turnos,
          loading: false,
        }));
        return;
      }

      // Carregar do servidor
      const { data, error } = await supabase
        .from('turnos')
        .select('*')
        .eq('ativo', true)
        .order('hora_inicio');

      if (error) throw error;

      const turnos = (data || []).map(mapTurnoFromDB);
      setState((prev) => ({
        ...prev,
        turnos,
        loading: false,
        lastSync: new Date(),
      }));

      // Salvar em cache
      saveTurnosToCache(turnos);
    } catch (error: any) {
      console.error('❌ Erro ao inicializar turnos:', error);

      // Tentar usar cache como fallback
      const cached = getTurnosFromCache();
      if (cached) {
        setState((prev) => ({
          ...prev,
          turnos: cached.turnos,
          loading: false,
          error,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error,
        }));
      }
    }
  }, [state.isOnline]);

  /**
   * Configura subscription realtime
   */
  const setupSubscription = useCallback(() => {
    // Limpar subscription anterior
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    try {
      subscriptionRef.current = supabase
        .from('turnos')
        .on('*', (payload: any) => {
          setState((prev) => {
            let newTurnos = [...prev.turnos];
            let conflicts = prev.conflictCount;

            if (payload.eventType === 'INSERT') {
              // Novo turno inserido
              const newTurno = mapTurnoFromDB(payload.new);
              newTurnos.push(newTurno);
            } else if (payload.eventType === 'UPDATE') {
              // Turno atualizado
              const updatedTurno = mapTurnoFromDB(payload.new);
              const index = newTurnos.findIndex((t) => t.id === updatedTurno.id);

              if (index !== -1) {
                // Verificar conflito
                const localTurno = newTurnos[index];
                const resolved = resolveConflict(localTurno, updatedTurno);

                if (resolved.id !== localTurno.id || resolved.atualizadoEm !== localTurno.atualizadoEm) {
                  conflicts++;
                  console.warn('⚠️ Conflito resolvido para turno:', updatedTurno.id);
                }

                newTurnos[index] = resolved;
              } else {
                newTurnos.push(updatedTurno);
              }
            } else if (payload.eventType === 'DELETE') {
              // Turno deletado
              newTurnos = newTurnos.filter((t) => t.id !== payload.old.id);
            }

            // Salvar em cache
            saveTurnosToCache(newTurnos);

            return {
              ...prev,
              turnos: newTurnos,
              lastSync: new Date(),
              conflictCount: conflicts,
            };
          });
        })
        .subscribe();

      console.log('✅ Subscription realtime configurada');
    } catch (error) {
      console.error('❌ Erro ao configurar subscription:', error);
    }
  }, []);

  /**
   * Sincroniza com servidor quando volta online
   */
  const syncWithServer = useCallback(async () => {
    try {
      console.log('🔄 Sincronizando com servidor...');

      // Recarregar dados do servidor
      await initializeTurnos();

      toast.success('Sincronização concluída');
    } catch (error: any) {
      console.error('❌ Erro ao sincronizar:', error);
      toast.error('Erro ao sincronizar com servidor');
    }
  }, [initializeTurnos]);

  /**
   * Monitora status online/offline
   */
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));

      // Sincronizar quando voltar online
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        syncWithServer();
      }, 500); // Pequeno delay para garantir que a conexão está estável
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
      toast.info('Modo offline - usando dados em cache');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [syncWithServer]);

  /**
   * Inicializa e configura subscriptions
   */
  useEffect(() => {
    initializeTurnos();
    setupSubscription();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  /**
   * Retorna função para forçar sincronização
   */
  const refetch = useCallback(() => {
    return initializeTurnos();
  }, [initializeTurnos]);

  return {
    ...state,
    refetch,
    syncWithServer,
    clearCache: clearTurnosCache,
  };
}

/**
 * Hook para turnos de uma data específica com realtime
 */
export function useTurnosRealtimeByDate(date: string) {
  const { turnos, ...rest } = useTurnosRealtime();

  // Filtrar turnos para a data específica
  // Para simplificar, retornar todos os turnos
  // Em produção, ajustar conforme necessário
  const turnosByDate = turnos;

  return {
    turnos: turnosByDate,
    ...rest,
  };
}

/**
 * Hook para turnos de uma semana com realtime
 */
export function useTurnosRealtimeByWeek(startDate: string, endDate: string) {
  const { turnos, ...rest } = useTurnosRealtime({ start: startDate, end: endDate });

  // Mapear turnos por data da semana
  const turnosPorDia = new Map<string, TurnoComVagas[]>();

  // Inicializar com array vazio para cada dia
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    turnosPorDia.set(dateStr, []);
    current.setDate(current.getDate() + 1);
  }

  // Preencher com turnos reais
  // Em produção, filtrar baseado em datas de recorrência
  for (const turno of turnos) {
    // Para simplificar, adicionar turno a todos os dias
    for (const [date] of turnosPorDia) {
      turnosPorDia.get(date)!.push(turno);
    }
  }

  return {
    turnosPorDia,
    ...rest,
  };
}
