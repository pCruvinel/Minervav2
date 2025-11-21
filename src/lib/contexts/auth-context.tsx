/**
 * Contexto de Autenticação - Sistema Hierárquico Minerva ERP
 *
 * Gerencia autenticação de usuários via Supabase Auth e carrega
 * dados completos do perfil da tabela colaboradores.
 *
 * @module contexts/auth-context
 * @see {@link docs/technical/USUARIOS_SCHEMA.md} - Documentação de usuários
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getPermissoes, RoleLevel, SetorSlug } from '../types';
import { supabase } from '@/lib/supabase-client';
import { toast } from '../utils/safe-toast';

// ============================================================
// INTERFACE DO CONTEXTO
// ============================================================

/**
 * Interface do contexto de autenticação
 * Fornece estado e funções para gerenciar autenticação
 */
interface AuthContextType {
  /** Usuário autenticado atualmente (null se não autenticado) */
  currentUser: User | null;

  /** Indica se está carregando dados de autenticação */
  isLoading: boolean;

  /** Indica se há um usuário autenticado */
  isAuthenticated: boolean;

  /**
   * Realiza login com email e senha
   * @param email - Email do usuário
   * @param password - Senha do usuário
   * @returns Promise<boolean> - true se login bem-sucedido
   */
  login: (email: string, password: string) => Promise<boolean>;

  /** Realiza logout do usuário atual */
  logout: () => void;

  /**
   * Atualiza dados do usuário localmente
   * @param user - Dados atualizados do usuário
   */
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
    console.log('[Auth] Buscando detalhes do usuário:', userId);
    try {
      // QUERY ATUALIZADA PARA V2.1 (JOIN COM CARGOS E SETORES)
      // O Supabase faz o join automático se as FKs existirem
      const { data: userData, error } = await supabase
        .from('colaboradores')
        .select(`
          *,
          cargos ( slug ),
          setores ( slug )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Auth] Erro no select colaboradores:', error);
        throw error;
      }

      console.log('[Auth] Dados do usuário encontrados:', userData);

      if (userData) {
        const userWithPermissions = enrichUserWithPermissions(userData);
        setCurrentUser(userWithPermissions);
        localStorage.setItem('minerva_current_user', JSON.stringify(userWithPermissions));
        console.log('[Auth] Usuário atualizado no estado');
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do usuário:', error);
      // Se falhar ao buscar detalhes, talvez o usuário não exista na tabela 'usuarios'
      // mas exista no Auth. Nesse caso, deslogar ou mostrar erro.
      toast.error('Erro ao carregar perfil do usuário');
    }
  };

  // Adaptador: Banco de Dados -> Frontend
  const enrichUserWithPermissions = (dbData: any): User => {
    // Extrair slugs das tabelas relacionadas
    const cargoSlug = Array.isArray(dbData.cargos)
      ? dbData.cargos[0]?.slug
      : dbData.cargos?.slug;

    const setorSlug = Array.isArray(dbData.setores)
      ? dbData.setores[0]?.slug
      : dbData.setores?.slug;

    const userFormatted: User = {
      id: dbData.id,
      email: dbData.email,
      nome_completo: dbData.nome_completo,

      // Novos campos V2
      cargo_slug: cargoSlug as RoleLevel,
      setor_slug: setorSlug as SetorSlug,

      // Compatibilidade com código legado
      role_nivel: (cargoSlug || 'colaborador') as RoleLevel,
      setor: (setorSlug || 'obras').toUpperCase(),

      avatar_url: dbData.avatar_url,
      ativo: dbData.ativo,
      data_admissao: dbData.data_admissao ? new Date(dbData.data_admissao) : undefined,
      telefone: dbData.telefone,
      cpf: dbData.cpf,
    };

    // 🔒 GUARD: Bloquear acesso de mão de obra
    const role = userFormatted.cargo_slug || userFormatted.role_nivel;
    if (role === 'mao_de_obra') {
      throw new Error('ACESSO_NEGADO_MAO_DE_OBRA');
    }

    // Obter permissões da matriz centralizada
    const permissoes = getPermissoes(userFormatted);

    return {
      ...userFormatted,
      pode_delegar: permissoes.pode_delegar,
      pode_aprovar: permissoes.pode_aprovar,
    };
  };

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('[Auth] Iniciando login para:', email);
    setIsLoading(true);

    try {
      // Login com Supabase Auth
      console.log('[Auth] Chamando supabase.auth.signInWithPassword');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[Auth] Erro no signInWithPassword:', error);
        throw error;
      }

      console.log('[Auth] Login Supabase sucesso:', data.user?.id);

      if (data.user) {
        await fetchUserDetails(data.user.id);
        console.log('[Auth] Detalhes buscados, finalizando login');
        setIsLoading(false);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Erro durante login:', error);

      // Guard específico para mão de obra
      if (error?.message === 'ACESSO_NEGADO_MAO_DE_OBRA') {
        toast.error('Acesso negado. Este perfil não tem permissão para acessar o sistema.');
        await supabase.auth.signOut(); // Garantir logout
      } else {
        toast.error('Falha no login. Verifique suas credenciais.');
      }

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
