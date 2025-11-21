// Hook customizado para verificação de permissões - Sistema Hierárquico Minerva ERP

import { useMemo } from 'react';
import { User, Setor, OrdemServico } from '../types';
import { PermissaoUtil } from '../auth-utils';

/**
 * Hook para gerenciar permissões do usuário atual
 * @param currentUser - Usuário logado atualmente
 */
export function usePermissoes(currentUser: User | null) {
  
  const permissoes = useMemo(() => {
    if (!currentUser) {
      return {
        // Quando não há usuário logado, todas as permissões são negadas
        podeDelegarPara: () => false,
        podeAprovarTarefa: () => false,
        obterSetoresAcesso: () => [],
        temAcessoModulo: () => false,
        ehDiretoria: false,
        ehGestor: false,
        ehColaborador: false,
        ehMobra: false,
        temAcessoAOS: () => false,
        podeEditarOS: () => false,
        podeReabrirOS: () => false,
        podeCriarOS: false,
        podeGerenciarUsuarios: false,
        podeAcessarFinanceiro: false,
        podeAcessarAdministrativo: false,
        obterSetoresDelegacao: () => [],
        validarDelegacao: () => ({ valido: false, mensagem: 'Usuário não autenticado' }),
        obterResumoPermissoes: () => null,
        usuario: null,
      };
    }

    return {
      /**
       * Verifica se pode delegar para um setor/colaborador específico
       */
      podeDelegarPara: (setor: Setor, colaborador: User) =>
        PermissaoUtil.podeDelegarPara(currentUser, setor, colaborador),

      /**
       * Verifica se pode aprovar tarefas de um setor
       */
      podeAprovarTarefa: (setor: Setor) =>
        PermissaoUtil.podeAprovarTarefa(currentUser, setor),

      /**
       * Obtém lista de setores que o usuário pode acessar
       */
      obterSetoresAcesso: () =>
        PermissaoUtil.obterSetoresAcesso(currentUser),

      /**
       * Verifica se tem acesso a um módulo específico
       */
      temAcessoModulo: (modulo: string) =>
        PermissaoUtil.temAcessoModulo(currentUser, modulo),

      /**
       * Verifica se é Diretoria
       */
      ehDiretoria: PermissaoUtil.ehDiretoria(currentUser),

      /**
       * Verifica se é Gestor (qualquer tipo)
       */
      ehGestor: PermissaoUtil.ehGestor(currentUser),

      /**
       * Verifica se é Colaborador (qualquer tipo)
       */
      ehColaborador: PermissaoUtil.ehColaborador(currentUser),

      /**
       * Verifica se é MOBRA (sem acesso ao sistema)
       */
      ehMobra: PermissaoUtil.ehMobra(currentUser),

      /**
       * Verifica se tem acesso a visualizar uma OS específica
       */
      temAcessoAOS: (os: OrdemServico) =>
        PermissaoUtil.temAcessoAOS(currentUser, os),

      /**
       * Verifica se pode editar uma OS
       */
      podeEditarOS: (os: OrdemServico) =>
        PermissaoUtil.podeEditarOS(currentUser, os),

      /**
       * Verifica se pode reabrir uma OS concluída
       */
      podeReabrirOS: (os: OrdemServico) =>
        PermissaoUtil.podeReabrirOS(currentUser, os),

      /**
       * Verifica se pode criar novas OS
       */
      podeCriarOS: PermissaoUtil.podeCriarOS(currentUser),

      /**
       * Verifica se pode gerenciar usuários
       */
      podeGerenciarUsuarios: PermissaoUtil.podeGerenciarUsuarios(currentUser),

      /**
       * Verifica se pode acessar módulo financeiro
       */
      podeAcessarFinanceiro: PermissaoUtil.podeAcessarFinanceiro(currentUser),

      /**
       * Verifica se pode acessar módulo administrativo
       */
      podeAcessarAdministrativo: PermissaoUtil.podeAcessarAdministrativo(currentUser),

      /**
       * Obtém lista de setores para os quais pode delegar
       */
      obterSetoresDelegacao: () =>
        PermissaoUtil.obterSetoresDelegacao(currentUser),

      /**
       * Valida se uma delegação é permitida
       */
      validarDelegacao: (delegado: User, os: OrdemServico) =>
        PermissaoUtil.validarDelegacao(currentUser, delegado, os),

      /**
       * Obtém resumo completo das permissões
       */
      obterResumoPermissoes: () =>
        PermissaoUtil.obterResumoPermissoes(currentUser),

      /**
       * Usuário atual
       */
      usuario: currentUser,
    };
  }, [currentUser]);

  return permissoes;
}

/**
 * Hook simplificado para verificar permissões básicas
 */
export function usePermissoesBasicas(currentUser: User | null) {
  return useMemo(() => ({
    podeAcessarSistema: currentUser !== null && !PermissaoUtil.ehMobra(currentUser),
    ehAdmin: currentUser !== null && PermissaoUtil.ehDiretoria(currentUser),
    ehGestor: currentUser !== null && PermissaoUtil.ehGestor(currentUser),
    podeCriarOS: currentUser !== null && PermissaoUtil.podeCriarOS(currentUser),
    podeAcessarFinanceiro: currentUser !== null && PermissaoUtil.podeAcessarFinanceiro(currentUser),
  }), [currentUser]);
}

/**
 * Hook para filtrar lista de OS baseado nas permissões do usuário
 */
export function useFiltrarOSPorPermissao(
  ordens: OrdemServico[],
  currentUser: User | null
): OrdemServico[] {
  return useMemo(() => {
    if (!currentUser) return [];
    
    return ordens.filter(os => PermissaoUtil.temAcessoAOS(currentUser, os));
  }, [ordens, currentUser]);
}

/**
 * Hook para filtrar colaboradores que o usuário pode gerenciar/visualizar
 */
export function useFiltrarColaboradoresPorPermissao(
  colaboradores: User[],
  currentUser: User | null
): User[] {
  return useMemo(() => {
    if (!currentUser) return [];

    // Diretoria vê todos
    if (PermissaoUtil.ehDiretoria(currentUser)) {
      return colaboradores;
    }

    // Gestor Comercial vê todos
    if (currentUser.role_nivel === 'GESTOR_ADMINISTRATIVO') {
      return colaboradores;
    }

    // Gestor de Setor vê apenas seu setor
    if (PermissaoUtil.ehGestor(currentUser)) {
      return colaboradores.filter(c => c.setor === currentUser.setor);
    }

    // Colaborador vê apenas ele mesmo
    if (PermissaoUtil.ehColaborador(currentUser)) {
      return colaboradores.filter(c => c.id === currentUser.id);
    }

    return [];
  }, [colaboradores, currentUser]);
}
