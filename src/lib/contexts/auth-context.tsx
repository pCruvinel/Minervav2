// Contexto de Autenticação - Sistema Hierárquico Minerva ERP
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { PERMISSOES_POR_ROLE } from '../types';
import { supabase } from '@/lib/supabase';
import { toast } from '../utils/safe-toast';

// ============================================================
// INTERFACE DO CONTEXTO
// ============================================================

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

// ============================================================
// CRIAÇÃO DO CONTEXTO
// ============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// PROVIDER DO CONTEXTO
// ============================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar usuário do Supabase ao iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        // 1. Verificar sessão atual do Supabase Auth
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session?.user) {
          // Tentar recuperar do localStorage como fallback (apenas para dev/mock)
          // ou limpar estado se não houver sessão
          const storedUser = localStorage.getItem('minerva_current_user');
          if (storedUser) {
             // Opcional: Validar se o token ainda é válido ou apenas limpar
             // Por segurança, se não tem sessão no Supabase, melhor limpar
             localStorage.removeItem('minerva_current_user');
          }
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }

        // 2. Buscar dados detalhados na tabela de usuários
        await fetchUserDetails(session.user.id);

      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Escutar mudanças na autenticação (login/logout em outras abas ou expirado)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserDetails(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        localStorage.removeItem('minerva_current_user');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Função auxiliar para buscar e formatar dados do usuário
  const fetchUserDetails = async (userId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (userData) {
        // Enriquecer com permissões baseadas no role
        const userWithPermissions = enrichUserWithPermissions(userData);
        setCurrentUser(userWithPermissions);
        localStorage.setItem('minerva_current_user', JSON.stringify(userWithPermissions));
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do usuário:', error);
      // Se falhar ao buscar detalhes, talvez o usuário não exista na tabela 'usuarios'
      // mas exista no Auth. Nesse caso, deslogar ou mostrar erro.
      toast.error('Erro ao carregar perfil do usuário');
    }
  };

  // Função auxiliar para adicionar permissões
  const enrichUserWithPermissions = (user: any): User => {
    // Garantir que role_nivel é válido
    const role = user.role_nivel as keyof typeof PERMISSOES_POR_ROLE;
    const permissoes = PERMISSOES_POR_ROLE[role] || PERMISSOES_POR_ROLE['COLABORADOR_ADMINISTRATIVO'];

    return {
      ...user,
      pode_delegar: permissoes.pode_delegar_para.length > 0 && permissoes.pode_delegar_para[0] !== '',
      pode_aprovar: permissoes.pode_aprovar_setores.length > 0 && permissoes.pode_aprovar_setores[0] !== '',
      setores_acesso: permissoes.acesso_setores.includes('*' as any) 
        ? ['ADMINISTRATIVO', 'ASSESSORIA', 'OBRAS'] 
        : permissoes.acesso_setores as any,
      modulos_acesso: {
        administrativo: permissoes.acesso_modulos.includes('administrativo'),
        financeiro: permissoes.acesso_modulos.includes('financeiro'),
        operacional: permissoes.acesso_modulos.includes('operacional'),
        recursos_humanos: permissoes.acesso_modulos.includes('recursos_humanos'),
      }
    };
  };

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Login com Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await fetchUserDetails(data.user.id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro durante login:', error);
      toast.error('Falha no login. Verifique suas credenciais.');
      setIsLoading(false);
      return false;
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      localStorage.removeItem('minerva_current_user');
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Função para atualizar usuário (localmente e se necessário no banco)
  const updateUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('minerva_current_user', JSON.stringify(user));
  };

  const value: AuthContextType = {
    currentUser,
    isLoading,
    isAuthenticated: currentUser !== null,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================
// HOOK PARA USAR O CONTEXTO
// ============================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}

// ============================================================
// HOOK SIMPLIFICADO PARA VERIFICAR AUTENTICAÇÃO
// ============================================================

export function useRequireAuth(): User {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    throw new Error('Carregando autenticação...');
  }

  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  return currentUser;
}
