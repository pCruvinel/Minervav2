// Contexto de Autenticação - Sistema Hierárquico Minerva ERP
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { PERMISSOES_POR_ROLE } from '../types';

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

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('minerva_current_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
        localStorage.removeItem('minerva_current_user');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // TODO: Integrar com Supabase Auth quando estiver pronto
      // Por enquanto, usar mock data para desenvolvimento
      
      const { mockUsers } = await import('../mock-data');
      const user = mockUsers.find(u => u.email === email);

      if (!user) {
        console.error('Usuário não encontrado');
        setIsLoading(false);
        return false;
      }

      // Em produção, validar senha com Supabase
      // Por enquanto, aceitar qualquer senha para desenvolvimento
      console.log('Login realizado para:', email);

      // Enriquecer usuário com permissões
      const permissoes = PERMISSOES_POR_ROLE[user.role_nivel];
      const userWithPermissions: User = {
        ...user,
        pode_delegar: permissoes.pode_delegar_para.length > 0 && permissoes.pode_delegar_para[0] !== '',
        pode_aprovar: permissoes.pode_aprovar_setores.length > 0 && permissoes.pode_aprovar_setores[0] !== '',
        setores_acesso: permissoes.acesso_setores.includes('*' as any) 
          ? ['COM', 'ASS', 'OBR'] 
          : permissoes.acesso_setores as any,
        modulos_acesso: {
          administrativo: permissoes.acesso_modulos.includes('administrativo'),
          financeiro: permissoes.acesso_modulos.includes('financeiro'),
          operacional: permissoes.acesso_modulos.includes('operacional'),
          recursos_humanos: permissoes.acesso_modulos.includes('recursos_humanos'),
        }
      };

      // Salvar no estado e localStorage
      setCurrentUser(userWithPermissions);
      localStorage.setItem('minerva_current_user', JSON.stringify(userWithPermissions));

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Erro durante login:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Função de logout
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('minerva_current_user');
    console.log('Logout realizado');
  };

  // Função para atualizar usuário
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
