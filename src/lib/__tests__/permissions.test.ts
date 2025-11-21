/**
 * Testes para Sistema de Permissões RBAC
 *
 * Testa todas as funções helper de permissões e a matriz PERMISSOES_POR_ROLE
 * @module __tests__/permissions
 */

import { describe, it, expect } from 'vitest';
import {
  type User,
  type Permissoes,
  type RoleLevel,
  PERMISSOES_POR_ROLE,
  getPermissoes,
  podeAcessarFinanceiro,
  podeDelegar,
  podeAprovar,
  podeGerenciarUsuarios,
  podeVerTodasOS,
  podeCriarOS,
  podeCancelarOS,
  getNivelHierarquico,
  podeVerSetor,
} from '../types';

// ============================================================
// HELPERS PARA CRIAR USUÁRIOS DE TESTE
// ============================================================

function createTestUser(cargo_slug: RoleLevel, setor_slug = 'obras'): User {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    nome_completo: 'Usuário Teste',
    cargo_slug,
    setor_slug: setor_slug as any,
    role_nivel: cargo_slug,
    setor: setor_slug,
    ativo: true,
  };
}

// ============================================================
// TESTES: MATRIZ PERMISSOES_POR_ROLE
// ============================================================

describe('PERMISSOES_POR_ROLE', () => {
  it('deve ter 7 roles definidos', () => {
    const roles = Object.keys(PERMISSOES_POR_ROLE);
    expect(roles).toHaveLength(7);
    expect(roles).toEqual([
      'admin',
      'diretoria',
      'gestor_administrativo',
      'gestor_obras',
      'gestor_assessoria',
      'colaborador',
      'mao_de_obra',
    ]);
  });

  it('admin deve ter nível 10 e todas as permissões', () => {
    const admin = PERMISSOES_POR_ROLE.admin;
    expect(admin.nivel).toBe(10);
    expect(admin.pode_ver_todas_os).toBe(true);
    expect(admin.pode_acessar_financeiro).toBe(true);
    expect(admin.pode_delegar).toBe(true);
    expect(admin.pode_aprovar).toBe(true);
    expect(admin.pode_gerenciar_usuarios).toBe(true);
    expect(admin.pode_criar_os).toBe(true);
    expect(admin.pode_cancelar_os).toBe(true);
    expect(admin.setores_visiveis).toBe('todos');
  });

  it('diretoria deve ter nível 9 e acesso financeiro', () => {
    const diretoria = PERMISSOES_POR_ROLE.diretoria;
    expect(diretoria.nivel).toBe(9);
    expect(diretoria.pode_acessar_financeiro).toBe(true);
    expect(diretoria.pode_ver_todas_os).toBe(true);
    expect(diretoria.pode_aprovar).toBe(true);
  });

  it('gestor_administrativo deve ter nível 5 e acesso financeiro', () => {
    const gestor = PERMISSOES_POR_ROLE.gestor_administrativo;
    expect(gestor.nivel).toBe(5);
    expect(gestor.pode_acessar_financeiro).toBe(true);
    expect(gestor.pode_ver_todas_os).toBe(true);
    expect(gestor.pode_criar_os).toBe(true);
    expect(gestor.pode_cancelar_os).toBe(true);
  });

  it('gestor_obras deve ter nível 5 e ver setor obras', () => {
    const gestor = PERMISSOES_POR_ROLE.gestor_obras;
    expect(gestor.nivel).toBe(5);
    expect(gestor.pode_delegar).toBe(true);
    expect(gestor.pode_aprovar).toBe(true);
    expect(gestor.pode_criar_os).toBe(true);
    expect(gestor.pode_cancelar_os).toBe(true);
    expect(gestor.setores_visiveis).toEqual(['obras']);
  });

  it('gestor_assessoria deve ter nível 5 e ver setor assessoria', () => {
    const gestor = PERMISSOES_POR_ROLE.gestor_assessoria;
    expect(gestor.nivel).toBe(5);
    expect(gestor.pode_criar_os).toBe(true);
    expect(gestor.pode_cancelar_os).toBe(true);
    expect(gestor.setores_visiveis).toEqual(['assessoria']);
  });

  it('colaborador deve ter nível 1 e permissões limitadas', () => {
    const colab = PERMISSOES_POR_ROLE.colaborador;
    expect(colab.nivel).toBe(1);
    expect(colab.pode_criar_os).toBe(true);
    expect(colab.pode_delegar).toBe(false);
    expect(colab.pode_aprovar).toBe(false);
    expect(colab.pode_acessar_financeiro).toBe(false);
    expect(colab.pode_cancelar_os).toBe(false);
  });

  it('mao_de_obra deve ter nível 0 e nenhuma permissão', () => {
    const mao = PERMISSOES_POR_ROLE.mao_de_obra;
    expect(mao.nivel).toBe(0);
    expect(mao.pode_ver_todas_os).toBe(false);
    expect(mao.pode_acessar_financeiro).toBe(false);
    expect(mao.pode_delegar).toBe(false);
    expect(mao.pode_aprovar).toBe(false);
    expect(mao.pode_gerenciar_usuarios).toBe(false);
    expect(mao.pode_criar_os).toBe(false);
    expect(mao.pode_cancelar_os).toBe(false);
  });
});

// ============================================================
// TESTES: getPermissoes()
// ============================================================

describe('getPermissoes()', () => {
  it('deve retornar permissões de admin para user admin', () => {
    const user = createTestUser('admin');
    const perms = getPermissoes(user);
    expect(perms).toEqual(PERMISSOES_POR_ROLE.admin);
  });

  it('deve retornar permissões de colaborador para user colaborador', () => {
    const user = createTestUser('colaborador');
    const perms = getPermissoes(user);
    expect(perms).toEqual(PERMISSOES_POR_ROLE.colaborador);
  });

  it('deve retornar permissões padrão para user null (mao_de_obra)', () => {
    const perms = getPermissoes(null);
    // getPermissoes retorna 'mao_de_obra' para null (sem permissões)
    expect(perms.nivel).toBe(0); // mao_de_obra tem nível 0
    expect(perms.pode_criar_os).toBe(false);
    expect(perms.pode_acessar_financeiro).toBe(false);
  });

  it('deve usar cargo_slug para obter permissões', () => {
    const user = createTestUser('gestor_obras');
    const perms = getPermissoes(user);
    expect(perms.nivel).toBe(5); // gestor_obras tem nível 5
    expect(perms.pode_delegar).toBe(true);
  });
});

// ============================================================
// TESTES: podeAcessarFinanceiro()
// ============================================================

describe('podeAcessarFinanceiro()', () => {
  it('deve retornar true para admin', () => {
    const user = createTestUser('admin');
    expect(podeAcessarFinanceiro(user)).toBe(true);
  });

  it('deve retornar true para diretoria', () => {
    const user = createTestUser('diretoria');
    expect(podeAcessarFinanceiro(user)).toBe(true);
  });

  it('deve retornar true para gestor_administrativo', () => {
    const user = createTestUser('gestor_administrativo');
    expect(podeAcessarFinanceiro(user)).toBe(true);
  });

  it('deve retornar false para gestor_obras', () => {
    const user = createTestUser('gestor_obras');
    expect(podeAcessarFinanceiro(user)).toBe(false);
  });

  it('deve retornar false para colaborador', () => {
    const user = createTestUser('colaborador');
    expect(podeAcessarFinanceiro(user)).toBe(false);
  });

  it('deve retornar false para user null', () => {
    expect(podeAcessarFinanceiro(null)).toBe(false);
  });
});

// ============================================================
// TESTES: podeDelegar()
// ============================================================

describe('podeDelegar()', () => {
  it('deve retornar true para admin', () => {
    const user = createTestUser('admin');
    expect(podeDelegar(user)).toBe(true);
  });

  it('deve retornar true para gestor_obras', () => {
    const user = createTestUser('gestor_obras');
    expect(podeDelegar(user)).toBe(true);
  });

  it('deve retornar false para colaborador', () => {
    const user = createTestUser('colaborador');
    expect(podeDelegar(user)).toBe(false);
  });

  it('deve retornar false para user null', () => {
    expect(podeDelegar(null)).toBe(false);
  });
});

// ============================================================
// TESTES: podeAprovar()
// ============================================================

describe('podeAprovar()', () => {
  it('deve retornar true para admin', () => {
    const user = createTestUser('admin');
    expect(podeAprovar(user)).toBe(true);
  });

  it('deve retornar true para diretoria', () => {
    const user = createTestUser('diretoria');
    expect(podeAprovar(user)).toBe(true);
  });

  it('deve retornar true para gestor_obras', () => {
    const user = createTestUser('gestor_obras');
    expect(podeAprovar(user)).toBe(true);
  });

  it('deve retornar false para colaborador', () => {
    const user = createTestUser('colaborador');
    expect(podeAprovar(user)).toBe(false);
  });

  it('deve retornar false para user null', () => {
    expect(podeAprovar(null)).toBe(false);
  });
});

// ============================================================
// TESTES: podeGerenciarUsuarios()
// ============================================================

describe('podeGerenciarUsuarios()', () => {
  it('deve retornar true para admin', () => {
    const user = createTestUser('admin');
    expect(podeGerenciarUsuarios(user)).toBe(true);
  });

  it('deve retornar true para diretoria (pode gerenciar usuarios)', () => {
    const user = createTestUser('diretoria');
    // Diretoria também pode gerenciar usuarios segundo a matriz atual
    expect(podeGerenciarUsuarios(user)).toBe(true);
  });

  it('deve retornar false para gestor_obras', () => {
    const user = createTestUser('gestor_obras');
    expect(podeGerenciarUsuarios(user)).toBe(false);
  });

  it('deve retornar false para user null', () => {
    expect(podeGerenciarUsuarios(null)).toBe(false);
  });
});

// ============================================================
// TESTES: podeVerTodasOS()
// ============================================================

describe('podeVerTodasOS()', () => {
  it('deve retornar true para admin', () => {
    const user = createTestUser('admin');
    expect(podeVerTodasOS(user)).toBe(true);
  });

  it('deve retornar true para diretoria', () => {
    const user = createTestUser('diretoria');
    expect(podeVerTodasOS(user)).toBe(true);
  });

  it('deve retornar false para colaborador', () => {
    const user = createTestUser('colaborador');
    expect(podeVerTodasOS(user)).toBe(false);
  });

  it('deve retornar false para user null', () => {
    expect(podeVerTodasOS(null)).toBe(false);
  });
});

// ============================================================
// TESTES: podeCriarOS()
// ============================================================

describe('podeCriarOS()', () => {
  it('deve retornar true para admin', () => {
    const user = createTestUser('admin');
    expect(podeCriarOS(user)).toBe(true);
  });

  it('deve retornar true para colaborador', () => {
    const user = createTestUser('colaborador');
    expect(podeCriarOS(user)).toBe(true);
  });

  it('deve retornar false para mao_de_obra', () => {
    const user = createTestUser('mao_de_obra');
    expect(podeCriarOS(user)).toBe(false);
  });

  it('deve retornar false para user null (mao_de_obra sem permissão)', () => {
    // getPermissoes(null) retorna mao_de_obra, que NÃO pode criar OS
    expect(podeCriarOS(null)).toBe(false);
  });
});

// ============================================================
// TESTES: podeCancelarOS()
// ============================================================

describe('podeCancelarOS()', () => {
  it('deve retornar true para admin', () => {
    const user = createTestUser('admin');
    expect(podeCancelarOS(user)).toBe(true);
  });

  it('deve retornar true para diretoria', () => {
    const user = createTestUser('diretoria');
    expect(podeCancelarOS(user)).toBe(true);
  });

  it('deve retornar false para colaborador', () => {
    const user = createTestUser('colaborador');
    expect(podeCancelarOS(user)).toBe(false);
  });

  it('deve retornar false para user null (mao_de_obra sem permissão)', () => {
    // getPermissoes(null) retorna mao_de_obra, que NÃO pode cancelar OS
    expect(podeCancelarOS(null)).toBe(false);
  });
});

// ============================================================
// TESTES: getNivelHierarquico()
// ============================================================

describe('getNivelHierarquico()', () => {
  it('deve retornar 10 para admin', () => {
    const user = createTestUser('admin');
    expect(getNivelHierarquico(user)).toBe(10);
  });

  it('deve retornar 9 para diretoria', () => {
    const user = createTestUser('diretoria');
    expect(getNivelHierarquico(user)).toBe(9);
  });

  it('deve retornar 5 para gestor_obras', () => {
    const user = createTestUser('gestor_obras');
    expect(getNivelHierarquico(user)).toBe(5);
  });

  it('deve retornar 1 para colaborador', () => {
    const user = createTestUser('colaborador');
    expect(getNivelHierarquico(user)).toBe(1);
  });

  it('deve retornar 0 para user null (fallback mao_de_obra)', () => {
    // getPermissoes(null) retorna mao_de_obra com nível 0
    expect(getNivelHierarquico(null)).toBe(0);
  });
});

// ============================================================
// TESTES: podeVerSetor()
// ============================================================

describe('podeVerSetor()', () => {
  it('admin deve ver todos os setores', () => {
    const user = createTestUser('admin');
    expect(podeVerSetor(user, 'obras')).toBe(true);
    expect(podeVerSetor(user, 'assessoria')).toBe(true);
    expect(podeVerSetor(user, 'administrativo')).toBe(true);
    expect(podeVerSetor(user, 'diretoria')).toBe(true);
  });

  it('gestor_obras deve ver apenas setor obras', () => {
    const user = createTestUser('gestor_obras');
    expect(podeVerSetor(user, 'obras')).toBe(true);
    expect(podeVerSetor(user, 'assessoria')).toBe(false);
    expect(podeVerSetor(user, 'administrativo')).toBe(false);
  });

  it('gestor_assessoria deve ver apenas setor assessoria', () => {
    const user = createTestUser('gestor_assessoria');
    expect(podeVerSetor(user, 'assessoria')).toBe(true);
    expect(podeVerSetor(user, 'obras')).toBe(false);
  });

  it('gestor_administrativo deve ver múltiplos setores', () => {
    const user = createTestUser('gestor_administrativo');
    expect(podeVerSetor(user, 'administrativo')).toBe(true);
    expect(podeVerSetor(user, 'obras')).toBe(true);
    expect(podeVerSetor(user, 'assessoria')).toBe(true);
  });

  it('colaborador não deve ver nenhum setor (lista vazia)', () => {
    const user = createTestUser('colaborador', 'obras');
    // Colaborador tem setores_visiveis: [], vê apenas OSs delegadas/responsáveis
    expect(podeVerSetor(user, 'obras')).toBe(false);
    expect(podeVerSetor(user, 'assessoria')).toBe(false);
  });

  it('deve retornar false para user null', () => {
    expect(podeVerSetor(null, 'obras')).toBe(false);
  });
});
