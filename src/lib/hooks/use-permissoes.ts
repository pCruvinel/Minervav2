/**
 * Hook: use-permissoes
 *
 * Hook customizado para gerenciar permissões de usuários no sistema Minerva.
 * Fornece acesso fácil às permissões baseadas no cargo do usuário autenticado.
 *
 * @example
 * ```tsx
 * function ComponenteFinanceiro() {
 *   const { podeAcessarFinanceiro, permissoes } = usePermissoes();
 *
 *   if (!podeAcessarFinanceiro) {
 *     return <div>Acesso negado</div>;
 *   }
 *
 *   return <div>Módulo Financeiro</div>;
 * }
 * ```
 *
 * @see docs/technical/USUARIOS_SCHEMA.md - Documentação de permissões
 */

import { useAuth } from '../contexts/auth-context';
import {
  getPermissoes,
  podeAcessarFinanceiro as checkFinanceiro,
  podeDelegar as checkDelegar,
  podeAprovar as checkAprovar,
  podeGerenciarUsuarios as checkGerenciarUsuarios,
  podeVerTodasOS as checkVerTodasOS,
  podeVerSetor as checkVerSetor,
  getNivelHierarquico,
  isGestor as checkGestor,
  isAdminOuDiretoria as checkAdminOuDiretoria,
  type Permissoes,
  type SetorSlug
} from '../types';

/**
 * Interface do retorno do hook usePermissoes
 */
export interface UsePermissoesReturn {
  /** Objeto completo com todas as permissões do usuário */
  permissoes: Permissoes;

  /** Nível hierárquico do usuário (0-10) */
  nivel: number;

  /** Pode acessar módulo financeiro */
  podeAcessarFinanceiro: boolean;

  /** Pode delegar tarefas */
  podeDelegar: boolean;

  /** Pode aprovar etapas */
  podeAprovar: boolean;

  /** Pode gerenciar usuários */
  podeGerenciarUsuarios: boolean;

  /** Pode ver todas as OSs */
  podeVerTodasOS: boolean;

  /** Pode criar OSs */
  podeCriarOS: boolean;

  /** Pode cancelar OSs */
  podeCancelarOS: boolean;

  /** É gestor (nível >= 5) */
  isGestor: boolean;

  /** É admin ou diretoria (nível >= 9) */
  isAdminOuDiretoria: boolean;

  /** Função para verificar se pode ver um setor específico */
  podeVerSetor: (setor: SetorSlug) => boolean;
}

/**
 * Hook para acessar permissões do usuário autenticado
 *
 * @returns Objeto com permissões e funções helper
 *
 * @example
 * ```tsx
 * const { podeAcessarFinanceiro, isGestor, podeVerSetor } = usePermissoes();
 *
 * if (podeAcessarFinanceiro) {
 *   // Mostrar módulo financeiro
 * }
 *
 * if (isGestor) {
 *   // Mostrar opções de gestão
 * }
 *
 * if (podeVerSetor('obras')) {
 *   // Mostrar OSs de obras
 * }
 * ```
 */
export function usePermissoes(): UsePermissoesReturn {
  const { currentUser } = useAuth();

  const permissoes = getPermissoes(currentUser);
  const nivel = getNivelHierarquico(currentUser);

  return {
    permissoes,
    nivel,
    podeAcessarFinanceiro: checkFinanceiro(currentUser),
    podeDelegar: checkDelegar(currentUser),
    podeAprovar: checkAprovar(currentUser),
    podeGerenciarUsuarios: checkGerenciarUsuarios(currentUser),
    podeVerTodasOS: checkVerTodasOS(currentUser),
    podeCriarOS: permissoes.pode_criar_os,
    podeCancelarOS: permissoes.pode_cancelar_os,
    isGestor: checkGestor(currentUser),
    isAdminOuDiretoria: checkAdminOuDiretoria(currentUser),
    podeVerSetor: (setor: SetorSlug) => checkVerSetor(currentUser, setor)
  };
}
