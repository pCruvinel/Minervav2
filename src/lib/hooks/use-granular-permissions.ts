/**
 * Hook: use-granular-permissions
 * 
 * Sistema de permissões granulares baseado em banco de dados.
 * Substitui o antigo sistema hardcoded de permissions types.
 */

import { useApi } from './use-api';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '../contexts/auth-context';
import { Permissoes, SetorSlug } from '../types';

export interface ModulePermission {
  moduleCode: string;
  moduleName: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface GranularPermissions extends Permissoes {
  modulePermissions: ModulePermission[];
  isFromDatabase: boolean;
}

async function fetchUserPermissions(userId: string): Promise<GranularPermissions | null> {
  const { data, error } = await supabase
    .from('colaboradores')
    .select(`
      *,
      role:role_id (
        *,
        permissions:role_module_permissions (
          *,
          module:module_id (code, name)
        )
      )
    `)
    .eq('id', userId)
    .single();

  if (error || !data?.role) return null;

  const role = data.role as any;
  const permissionsData = role.permissions || [];

  // Parse dos dados para o formato de interface
  const modulePermissions: ModulePermission[] = permissionsData.map((p: any) => ({
    moduleCode: p.module?.code || '',
    moduleName: p.module?.name || '',
    canCreate: p.can_create,
    canRead: p.can_read,
    canUpdate: p.can_update,
    canDelete: p.can_delete,
  }));
  
  // Parse setores visíveis
  let setoresVisiveis: SetorSlug[] | 'todos' = [];
  if (role.escopo_visao === 'global') {
    setoresVisiveis = 'todos';
  } else if (role.escopo_visao === 'setorial') {
      // Se for setorial, precisamos saber qual o setor do colaborador
      const setorSlug = data.setor_legacy?.toLowerCase(); // Legacy column por enquanto
      // TODO: Buscar slug do setor via tabela setores quando migração total ocorrer
      if (setorSlug) {
        setoresVisiveis = [setorSlug as SetorSlug];
      }
  }

  return {
    nivel: role.nivel,
    pode_ver_todas_os: role.nivel >= 5, // Lógica baseada em nível mantida para workflow OS
    pode_acessar_financeiro: role.acesso_financeiro,
    pode_delegar: role.pode_delegar,
    pode_aprovar: role.pode_aprovar,
    pode_gerenciar_usuarios: role.pode_gerenciar_usuarios,
    pode_criar_os: role.nivel >= 2,
    pode_cancelar_os: role.nivel >= 5,
    setores_visiveis: setoresVisiveis,
    acesso_financeiro: role.acesso_financeiro,
    escopo_visao: role.escopo_visao,
    descricao: role.descricao || '',
    modulePermissions,
    isFromDatabase: true,
  };
}

export function useGranularPermissions() {
  const { currentUser } = useAuth();
  
  const { data, loading, refetch } = useApi(
    () => currentUser ? fetchUserPermissions(currentUser.id) : Promise.resolve(null),
    { 
      deps: [currentUser?.id],
      revalidateOnFocus: false 
    }
  );

  const permissions: GranularPermissions = data || {
    nivel: 0,
    pode_ver_todas_os: false,
    pode_acessar_financeiro: false,
    pode_delegar: false,
    pode_aprovar: false,
    pode_gerenciar_usuarios: false,
    pode_criar_os: false,
    pode_cancelar_os: false,
    setores_visiveis: [],
    acesso_financeiro: false,
    escopo_visao: 'nenhuma',
    descricao: 'Carregando ou sem permissão',
    modulePermissions: [],
    isFromDatabase: false,
  };

  /**
   * Verifica acesso a um módulo específico
   */
  const canAccessModule = (moduleCode: string, action: 'create' | 'read' | 'update' | 'delete' = 'read') => {
    // Super Admin Bypass
    if (permissions.nivel >= 10) return true;

    const modulePerm = permissions.modulePermissions.find(m => m.moduleCode === moduleCode);
    if (!modulePerm) return false; // Default deny
    
    switch (action) {
      case 'create': return modulePerm.canCreate;
      case 'read': return modulePerm.canRead;
      case 'update': return modulePerm.canUpdate;
      case 'delete': return modulePerm.canDelete;
    }
  };

  return {
    permissions,
    loading,
    canAccessModule,
    isFromDatabase: permissions.isFromDatabase,
    refetch
  };
}
