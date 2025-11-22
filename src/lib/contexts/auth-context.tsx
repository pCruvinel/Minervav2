/**
 * Contexto de Autenticação - MODO DE SEGURANÇA
 * Projetado para diagnosticar e recuperar falhas de login/banco.
 */
'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '@/lib/supabase-client'; // Forçando uso do client correto
import { toast } from '../utils/safe-toast';

export interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cache para evitar chamadas duplicadas
  const lastFetchRef = useRef<{ userId: string; timestamp: number } | null>(null);
  const currentUserRef = useRef<User | null>(null);
  const MIN_FETCH_INTERVAL = 30000; // 30 segundos entre chamadas para o mesmo usuário

  // Manter ref sincronizada com state
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // 1. Boot Inicial
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setIsLoading(false);
          return;
        }
        await safeFetchUser(session.user.id, 'INITIAL_LOAD');
      } catch (e) {
        console.error("[Auth] Boot Error:", e);
        setIsLoading(false);
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (evt, session) => {
      console.log(`[Auth] Event: ${evt}`, { hasSession: !!session });

      if (evt === 'SIGNED_IN' && session?.user) {
        // NÃO recarregar se já temos o mesmo usuário logado
        if (currentUserRef.current && currentUserRef.current.id === session.user.id) {
          console.log('[Auth] Usuário já carregado - ignorando SIGNED_IN duplicado');
          return;
        }
        // Só carrega se for usuário diferente ou primeiro login
        setIsLoading(true);
        await safeFetchUser(session.user.id, 'SIGNED_IN');
      } else if (evt === 'SIGNED_OUT') {
        lastFetchRef.current = null;
        setCurrentUser(null);
        setIsLoading(false);
      } else if (evt === 'INITIAL_SESSION' && session?.user) {
        // Sessão recuperada ao inicializar (usuário já logado anteriormente)
        if (!currentUserRef.current || currentUserRef.current.id !== session.user.id) {
          console.log('[Auth] Recuperando sessão existente');
          await safeFetchUser(session.user.id, 'INITIAL_SESSION');
        } else {
          console.log('[Auth] Sessão já carregada - ignorando INITIAL_SESSION');
        }
      } else if (evt === 'TOKEN_REFRESHED' && session?.user) {
        // Token refresh não precisa recarregar perfil (dados não mudam)
        console.log('[Auth] Token refreshed - mantendo perfil em cache');
      } else if (evt === 'USER_UPDATED' && session?.user) {
        // Atualização de dados do usuário - recarregar
        await safeFetchUser(session.user.id, 'USER_UPDATED');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Busca Segura com Timeout e Cache (Query em 2 etapas para evitar timeout)
  const safeFetchUser = async (userId: string, reason: string = 'UNKNOWN') => {
    // Verificar cache - evitar chamadas duplicadas em curto intervalo
    const now = Date.now();
    const lastFetch = lastFetchRef.current;

    if (lastFetch && lastFetch.userId === userId && (now - lastFetch.timestamp) < MIN_FETCH_INTERVAL) {
      console.log(`[Auth] Ignorando fetch duplicado (${reason}) - última chamada há ${now - lastFetch.timestamp}ms`);
      setIsLoading(false);
      return;
    }

    // Atualizar timestamp do cache
    lastFetchRef.current = { userId, timestamp: now };

    try {
      console.log(`[Auth] Buscando perfil (${reason})...`);

      // ETAPA 1: Query rápida sem joins (sempre funciona, mesmo com RLS complexa)
      const simpleTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB_TIMEOUT_SIMPLE")), 5000)
      );

      const simpleQuery = supabase
        .from('colaboradores')
        .select('*')
        .eq('id', userId)
        .single();

      let { data: userData, error: simpleError } = await Promise.race([simpleQuery, simpleTimeout]) as any;

      if (simpleError) throw simpleError;

      // ETAPA 2: Se tem cargo_id/setor_id, tenta enriquecer com joins (opcional)
      if (userData && (userData.cargo_id || userData.setor_id)) {
        try {
          console.log('[Auth] Enriquecendo com dados de cargo/setor...');
          const enrichedTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("DB_TIMEOUT_ENRICHED")), 10000)
          );

          const enrichedQuery = supabase
            .from('colaboradores')
            .select('*, cargos(*), setores(*)')
            .eq('id', userId)
            .single();

          const { data: enrichedData, error: enrichedError } = await Promise.race([enrichedQuery, enrichedTimeout]) as any;

          if (!enrichedError && enrichedData) {
            userData = enrichedData; // Usa versão enriquecida
            console.log('[Auth] Dados enriquecidos com sucesso');
          } else {
            console.warn('[Auth] Timeout ao enriquecer, usando dados básicos');
          }
        } catch (enrichError) {
          console.warn('[Auth] Falha ao enriquecer dados, usando versão básica:', enrichError);
          // Continua com userData simples (tem role_nivel e setor como fallback)
        }
      }

      if (userData) {
        const userFormatted = formatUser(userData);
        setCurrentUser(userFormatted);
        console.log(`[Auth] ✅ Perfil carregado (${reason}):`, userFormatted.email);
      }
    } catch (error: any) {
      console.error(`[Auth] ❌ Falha ao carregar perfil (${reason}):`, error);

      // FALLBACK DE EMERGÊNCIA: Se o banco falhar, permite login básico
      // Isso permite que você entre no sistema para corrigir coisas
      if (error.message?.includes("DB_TIMEOUT") || error.code === "PGRST116" || error.code === "42P17") {
        console.warn('[Auth] Ativando Fallback de Emergência');
        const fallbackUser: User = {
          id: userId,
          email: 'usuario@sistema.com', // Placeholder
          nome_completo: 'Usuário (Modo Segurança)',
          cargo_slug: 'colaborador',
          setor_slug: 'obras',
          role_nivel: 'colaborador',
          setor: 'OBRAS',
          ativo: true
        };
        setCurrentUser(fallbackUser);
        toast.warning('Sistema em modo de recuperação. Algumas funções podem estar limitadas.');
      }
    } finally {
      setIsLoading(false); // GARANTE QUE O LOADING PARE
    }
  };

  // 3. Formatador V2 (Suporta modelo relacional FK OU ENUMs diretos)
  const formatUser = (dbData: any): User => {
    // Prioridade 1: Tabelas relacionadas (cargos/setores via FK)
    // Prioridade 2: ENUMs diretos (role_nivel/setor)
    const cargoSlug = dbData.cargos?.slug || dbData.role_nivel || 'colaborador';
    const setorSlug = dbData.setores?.slug || (dbData.setor ? dbData.setor.toLowerCase() : 'obras');

    // Debug: qual sistema está sendo usado?
    console.log('[Auth] Fonte dos dados:', {
      usandoCargoFK: !!dbData.cargos?.slug,
      usandoSetorFK: !!dbData.setores?.slug,
      cargo: cargoSlug,
      setor: setorSlug
    });

    // Setor pode vir uppercase do ENUM ou lowercase do relacionamento
    const setorFormatado = setorSlug.toUpperCase();

    return {
      id: dbData.id,
      email: dbData.email,
      nome_completo: dbData.nome_completo,
      cargo_slug: cargoSlug,
      setor_slug: setorSlug.toLowerCase(),
      role_nivel: cargoSlug,
      setor: setorFormatado,
      ativo: dbData.ativo ?? true,
      avatar_url: dbData.avatar_url,
      pode_delegar: ['admin', 'diretoria'].includes(cargoSlug) || cargoSlug.startsWith('gestor'),
      pode_aprovar: ['admin', 'diretoria'].includes(cargoSlug) || cargoSlug.startsWith('gestor'),
    };
  };

  // 4. Login Robusto
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        await safeFetchUser(data.user.id, 'LOGIN');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('[Auth] Login Error:', error);
      toast.error(error.message || 'Falha no login');
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    lastFetchRef.current = null; // Limpa cache no logout
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const updateUser = (user: User) => setCurrentUser(user);

  // Força reload do perfil (bypassa cache)
  const refreshUser = async () => {
    if (!currentUserRef.current) {
      console.warn('[Auth] Nenhum usuário para recarregar');
      return;
    }
    console.log('[Auth] Forçando refresh do perfil...');
    lastFetchRef.current = null; // Limpa cache
    await safeFetchUser(currentUserRef.current.id, 'MANUAL_REFRESH');
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, isAuthenticated: !!currentUser, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function useRequireAuth() {
  const { currentUser, isLoading } = useAuth();
  if (isLoading) throw new Promise(() => { });
  if (!currentUser) throw new Error('Usuário não autenticado');
  return currentUser;
}