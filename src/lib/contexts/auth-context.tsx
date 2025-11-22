/**
 * Contexto de Autenticação - MODO DE SEGURANÇA
 * Projetado para diagnosticar e recuperar falhas de login/banco.
 */
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '@/lib/supabase-client'; // Forçando uso do client correto
import { toast } from '../utils/safe-toast';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Boot Inicial
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setIsLoading(false);
          return;
        }
        await safeFetchUser(session.user.id);
      } catch (e) {
        console.error("Boot Error:", e);
        setIsLoading(false);
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (evt, session) => {
      if (evt === 'SIGNED_IN' && session?.user) {
        setIsLoading(true);
        await safeFetchUser(session.user.id);
      } else if (evt === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Busca Segura com Timeout (Evita travamento eterno)
  const safeFetchUser = async (userId: string) => {
    // Timeout de 5 segundos para o banco responder
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("DB_TIMEOUT")), 5000)
    );

    try {
      console.log('[Auth] Tentando buscar perfil...');

      // Tenta query simples primeiro (sem JOINs complexos que podem travar RLS)
      const dbPromise = supabase
        .from('colaboradores')
        .select('*, cargos(slug), setores(slug)')
        .eq('id', userId)
        .single();

      const { data: userData, error } = await Promise.race([dbPromise, timeoutPromise]) as any;

      if (error) throw error;

      if (userData) {
        const userFormatted = formatUser(userData);
        setCurrentUser(userFormatted);
        console.log('[Auth] Perfil carregado:', userFormatted.email);
      }
    } catch (error: any) {
      console.error('[Auth] Falha ao carregar perfil:', error);

      // FALLBACK DE EMERGÊNCIA: Se o banco falhar, permite login básico
      // Isso permite que você entre no sistema para corrigir coisas
      if (error.message === "DB_TIMEOUT" || error.code === "PGRST116" || error.code === "42P17") {
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

  // 3. Formatador V2
  const formatUser = (dbData: any): User => {
    const cargoSlug = dbData.cargos?.slug || dbData.cargos?.[0]?.slug || 'colaborador';
    const setorSlug = dbData.setores?.slug || dbData.setores?.[0]?.slug || 'obras';

    return {
      id: dbData.id,
      email: dbData.email,
      nome_completo: dbData.nome_completo,
      cargo_slug: cargoSlug,
      setor_slug: setorSlug,
      role_nivel: cargoSlug,
      setor: setorSlug.toUpperCase(),
      ativo: dbData.ativo,
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
        await safeFetchUser(data.user.id);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login Error:', error);
      toast.error(error.message || 'Falha no login');
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const updateUser = (user: User) => setCurrentUser(user);

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, isAuthenticated: !!currentUser, login, logout, updateUser }}>
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