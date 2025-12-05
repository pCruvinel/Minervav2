/**
 * ============================================================================
 * ⚠️ ARQUIVO DEPRECADO - NÃO USE PARA NOVO CÓDIGO
 * ============================================================================
 * 
 * Este arquivo contém lógica de permissões LEGADA baseada em `role_nivel`.
 * 
 * Para novo código, use:
 * - Hook: `usePermissoes()` de '@/lib/hooks/use-permissoes'
 * - Função: `getPermissoes(user)` de '@/lib/types'
 * 
 * Sistema novo usa `cargo_slug` e `escopo_visao` ao invés de `role_nivel`.
 * 
 * @deprecated Migrar para sistema RBAC v3.0
 * @see docs/technical/USUARIOS_SCHEMA.md
 * ============================================================================
 */

// Utilitários de Autenticação e Permissões - Sistema Hierárquico Minerva ERP
// ⚠️ DEPRECADO: Use usePermissoes() ou getPermissoes() para novo código

import {
  User,
  RoleLevel,
  Setor,
  NivelHierarquico,
  ROLE_PARA_NIVEL,
  PERMISSOES_POR_ROLE_LEGADO,
  ROLE_NAMES,
  SETOR_NAMES,
  OrdemServico
} from './types';

// ============================================================
// CLASSE DE UTILIDADES DE PERMISSÃO
// ============================================================

export class PermissaoUtil {

  /**
   * Verifica se um usuário pode delegar uma OS para outro colaborador
   */
  static podeDelegarPara(
    delegante: User,
    setorDelegado: Setor,
    colaboradorDelegado: User
  ): boolean {
    const permissoes = PERMISSOES_POR_ROLE_LEGADO[delegante.role_nivel];

    // Mão de obra não pode delegar
    if (delegante.role_nivel === 'mao_de_obra') {
      return false;
    }

    // Colaboradores não podem delegar
    if (delegante.role_nivel === 'colaborador') {
      return false;
    }

    // Diretoria pode delegar para qualquer um
    if (delegante.role_nivel === 'diretoria') {
      return true;
    }

    // Gestor Comercial pode delegar para qualquer setor
    if (delegante.role_nivel === 'gestor_administrativo') {
      return true;
    }

    // Gestor Assessoria pode delegar apenas para ASS
    if (delegante.role_nivel === 'gestor_assessoria') {
      return setorDelegado === 'ASS' && colaboradorDelegado.setor === 'ASS';
    }

    // Gestor Obras pode delegar apenas para OBR
    if (delegante.role_nivel === 'gestor_obras') {
      return setorDelegado === 'OBR' && colaboradorDelegado.setor === 'OBR';
    }

    return false;
  }

  /**
   * Verifica se um usuário pode aprovar uma tarefa de determinado setor
   */
  static podeAprovarTarefa(usuario: User, tarefaSetor: Setor): boolean {
    const permissoes = PERMISSOES_POR_ROLE_LEGADO[usuario.role_nivel];

    // Verifica se pode aprovar todos os setores (*)
    if (permissoes.pode_aprovar_setores.includes('*' as any)) {
      return true;
    }

    // Verifica se pode aprovar o setor específico
    return permissoes.pode_aprovar_setores.includes(tarefaSetor);
  }

  /**
   * Retorna os setores que um usuário pode visualizar
   */
  static obterSetoresAcesso(usuario: User): Setor[] {
    const permissoes = PERMISSOES_POR_ROLE_LEGADO[usuario.role_nivel];

    // Se tem acesso a todos (*), retorna todos os setores
    if (permissoes.acesso_setores.includes('*' as any)) {
      return ['COM', 'ASS', 'OBR'];
    }

    return permissoes.acesso_setores as Setor[];
  }

  /**
   * Verifica se um usuário tem acesso a um módulo específico
   */
  static temAcessoModulo(usuario: User, modulo: string): boolean {
    const permissoes = PERMISSOES_POR_ROLE_LEGADO[usuario.role_nivel];
    return permissoes.acesso_modulos.includes(modulo) || permissoes.acesso_modulos.includes('*');
  }

  /**
   * Retorna o nível hierárquico numérico do usuário
   */
  static obterNivelHierarquico(usuario: User): NivelHierarquico {
    return ROLE_PARA_NIVEL[usuario.role_nivel];
  }

  /**
   * Verifica se um usuário é superior hierárquico a outro
   */
  static ehSuperior(usuario1: User, usuario2: User): boolean {
    const nivel1 = this.obterNivelHierarquico(usuario1);
    const nivel2 = this.obterNivelHierarquico(usuario2);
    return nivel1 > nivel2;
  }

  /**
   * Verifica se um usuário é supervisor direto de outro
   */
  static ehSupervisorDireto(supervisor: User, colaborador: User): boolean {
    return colaborador.supervisor_id === supervisor.id;
  }

  /**
   * Obtém o nome legível do role
   */
  static obterNomeRole(role: RoleLevel): string {
    return ROLE_NAMES[role];
  }

  /**
   * Obtém o nome legível do setor
   */
  static obterNomeSetor(setor: Setor): string {
    return SETOR_NAMES[setor];
  }

  /**
   * Verifica se é Diretoria ou Admin (níveis hierárquicos superiores)
   */
  static ehDiretoria(usuario: User): boolean {
    return usuario.role_nivel === 'diretoria' || usuario.role_nivel === 'admin';
  }

  /**
   * Verifica se é Gestor (qualquer tipo)
   */
  static ehGestor(usuario: User): boolean {
    const role = usuario.role_nivel;
    return role === 'gestor_obras' || role === 'gestor_assessoria' || role === 'gestor_administrativo';
  }

  /**
   * Verifica se é Colaborador
   */
  static ehColaborador(usuario: User): boolean {
    return usuario.role_nivel === 'colaborador';
  }

  /**
   * Verifica se é mão de obra (sem acesso ao sistema)
   */
  static ehMobra(usuario: User): boolean {
    return usuario.role_nivel === 'mao_de_obra';
  }

  /**
   * Verifica se um usuário tem acesso a visualizar uma OS específica
   */
  static temAcessoAOS(usuario: User, os: OrdemServico): boolean {
    // MOBRA não tem acesso ao sistema
    if (this.ehMobra(usuario)) {
      return false;
    }

    // Diretoria tem acesso a todas as OS
    if (this.ehDiretoria(usuario)) {
      return true;
    }

    // Gestor Administrativo tem acesso a todas as OS
    if (usuario.role_nivel === 'gestor_administrativo') {
      return true;
    }

    // Gestor de Setor tem acesso apenas às OS do seu setor
    if (this.ehGestor(usuario)) {
      return os.setor === usuario.setor;
    }

    // Colaborador tem acesso apenas às OS delegadas para ele
    if (this.ehColaborador(usuario)) {
      return os.delegada_para_id === usuario.id || 
             os.responsavel?.id === usuario.id;
    }

    return false;
  }

  /**
   * Verifica se um usuário pode editar uma OS
   */
  static podeEditarOS(usuario: User, os: OrdemServico): boolean {
    // MOBRA não pode editar
    if (this.ehMobra(usuario)) {
      return false;
    }

    // Diretoria pode editar qualquer OS
    if (this.ehDiretoria(usuario)) {
      return true;
    }

    // Gestor Administrativo pode editar qualquer OS
    if (usuario.role_nivel === 'gestor_administrativo') {
      return true;
    }

    // Gestor de Setor pode editar OS do seu setor
    if (this.ehGestor(usuario)) {
      return os.setor === usuario.setor;
    }

    // Colaborador não pode editar OS
    return false;
  }

  /**
   * Verifica se um usuário pode reabrir uma OS concluída
   * (apenas Diretoria com justificativa)
   */
  static podeReabrirOS(usuario: User, os: OrdemServico): boolean {
    return this.ehDiretoria(usuario) && os.status === 'concluido';
  }

  /**
   * Verifica se um usuário pode criar novas OS
   */
  static podeCriarOS(usuario: User): boolean {
    // MOBRA e Colaboradores não podem criar OS
    if (this.ehMobra(usuario) || this.ehColaborador(usuario)) {
      return false;
    }

    // Gestores e Diretoria podem criar OS
    return this.ehGestor(usuario) || this.ehDiretoria(usuario);
  }

  /**
   * Verifica se um usuário pode gerenciar outros usuários
   */
  static podeGerenciarUsuarios(usuario: User): boolean {
    return this.ehDiretoria(usuario);
  }

  /**
   * Verifica se um usuário pode acessar módulo financeiro
   */
  static podeAcessarFinanceiro(usuario: User): boolean {
    return this.temAcessoModulo(usuario, 'financeiro');
  }

  /**
   * Verifica se um usuário pode acessar módulo administrativo
   */
  static podeAcessarAdministrativo(usuario: User): boolean {
    return this.temAcessoModulo(usuario, 'administrativo');
  }

  /**
   * Retorna lista de setores para os quais um usuário pode delegar
   */
  static obterSetoresDelegacao(usuario: User): Setor[] {
    const permissoes = PERMISSOES_POR_ROLE_LEGADO[usuario.role_nivel];

    if (permissoes.pode_delegar_para.includes('*' as any)) {
      return ['COM', 'ASS', 'OBR'];
    }

    return permissoes.pode_delegar_para as Setor[];
  }

  /**
   * Valida se uma delegação é permitida
   */
  static validarDelegacao(
    delegante: User,
    delegado: User,
    os: OrdemServico
  ): { valido: boolean; mensagem?: string } {
    // Verifica se delegante pode delegar
    if (!this.ehGestor(delegante) && !this.ehDiretoria(delegante)) {
      return {
        valido: false,
        mensagem: 'Apenas gestores e diretoria podem delegar tarefas'
      };
    }

    // Verifica se delegado pode receber delegações
    if (this.ehMobra(delegado)) {
      return {
        valido: false,
        mensagem: 'Não é possível delegar para mão de obra (MOBRA)'
      };
    }

    // Verifica se delegante pode delegar para o setor do delegado
    if (!this.podeDelegarPara(delegante, delegado.setor, delegado)) {
      return {
        valido: false,
        mensagem: `Você não tem permissão para delegar para o setor ${this.obterNomeSetor(delegado.setor)}`
      };
    }

    // Verifica se delegado está ativo
    if (delegado.status_colaborador !== 'ativo') {
      return {
        valido: false,
        mensagem: 'Não é possível delegar para colaborador inativo'
      };
    }

    return { valido: true };
  }

  /**
   * Retorna um resumo das permissões do usuário
   */
  static obterResumoPermissoes(usuario: User): {
    nivel: string;
    role: string;
    setor: string;
    pode_criar_os: boolean;
    pode_delegar: boolean;
    pode_aprovar: boolean;
    pode_reabrir_os: boolean;
    pode_gerenciar_usuarios: boolean;
    setores_acesso: string[];
    modulos_acesso: string[];
  } {
    return {
      nivel: `Nível ${this.obterNivelHierarquico(usuario)}`,
      role: this.obterNomeRole(usuario.role_nivel),
      setor: usuario.setor ? this.obterNomeSetor(usuario.setor as Setor) : 'N/A',
      pode_criar_os: this.podeCriarOS(usuario),
      pode_delegar: usuario.pode_delegar || false,
      pode_aprovar: usuario.pode_aprovar || false,
      pode_reabrir_os: false, // Apenas em OS específica
      pode_gerenciar_usuarios: this.podeGerenciarUsuarios(usuario),
      setores_acesso: this.obterSetoresAcesso(usuario).map(s => this.obterNomeSetor(s)),
      modulos_acesso: PERMISSOES_POR_ROLE_LEGADO[usuario.role_nivel].acesso_modulos,
    };
  }
}

// ============================================================
// FUNÇÕES AUXILIARES DE VALIDAÇÃO
// ============================================================

/**
 * Valida se um email é válido
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida se um CPF é válido (formato)
 */
export function validarCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cpfLimpo = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpfLimpo.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpfLimpo)) {
    return false;
  }

  return true;
}

/**
 * Formata CPF para exibição
 */
export function formatarCPF(cpf: string): string {
  const cpfLimpo = cpf.replace(/[^\d]/g, '');
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata telefone para exibição
 */
export function formatarTelefone(telefone: string): string {
  const telefoneLimpo = telefone.replace(/[^\d]/g, '');
  
  if (telefoneLimpo.length === 11) {
    return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (telefoneLimpo.length === 10) {
    return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return telefone;
}

/**
 * Gera uma senha aleatória segura
 */
export function gerarSenhaAleatoria(tamanho: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let senha = '';
  
  for (let i = 0; i < tamanho; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return senha;
}
