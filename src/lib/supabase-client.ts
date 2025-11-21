/**
 * Supabase Client Configuration
 *
 * Cliente Supabase configurado para autenticação e operações de banco de dados.
 * Utiliza variáveis de ambiente para maior segurança.
 *
 * @module supabase-client
 */

import { createClient } from '@supabase/supabase-js';

// Obter credenciais das variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação de credenciais
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Credenciais do Supabase não configuradas. Verifique se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas no arquivo .env'
  );
}

/**
 * Cliente Supabase singleton
 *
 * Instância compartilhada do cliente Supabase para uso em toda a aplicação.
 * Configurado com:
 * - Auth: Persistência de sessão automática
 * - Database: Acesso às tabelas via RLS
 * - Storage: Upload de arquivos
 *
 * @example
 * ```typescript
 * import { supabase } from './supabase-client';
 *
 * // Autenticação
 * const { data, error } = await supabase.auth.signInWithPassword({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 *
 * // Query de banco de dados
 * const { data: users } = await supabase
 *   .from('usuarios')
 *   .select('*');
 * ```
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persistir sessão no localStorage
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Log de inicialização (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('✅ Supabase Client inicializado');
  console.log(`📍 URL: ${supabaseUrl}`);
}

/**
 * Helper: Verificar se há sessão ativa
 *
 * @returns {Promise<boolean>} True se há usuário autenticado
 */
export async function hasActiveSession(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

/**
 * Helper: Obter usuário atual
 *
 * @returns {Promise<User | null>} Usuário autenticado ou null
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Helper: Fazer logout
 *
 * @returns {Promise<void>}
 */
export async function signOut() {
  await supabase.auth.signOut();
}

export default supabase;
