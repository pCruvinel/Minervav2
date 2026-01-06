/**
 * OS Routing Configuration
 * 
 * Mapeamento centralizado de rotas por tipo de OS.
 * Usa o campo tipoOS da UnifiedStep (ex: 'OS-01', 'OS-09') diretamente.
 * 
 * @example
 * ```typescript
 * const config = getOSRouteConfig('OS-09');
 * // Returns: { osCode: 'OS-09', route: '/os/details-workflow/$id', ... }
 * ```
 */

// ============================================================
// TYPES
// ============================================================

export type NavigationMode = 'WORKFLOW_PAGE' | 'DETAILS_PAGE' | 'CREATE_PAGE';

export interface OSRouteConfig {
  /** Código do tipo (ex: 'OS-01', 'OS-09') - chave de busca */
  osCode: string;
  /** Rota de destino (usa $id como param, não $osId) */
  route: string;
  /** Modo de navegação */
  mode: NavigationMode;
  /** Descrição legível */
  description: string;
}

// ============================================================
// CONFIGURATION MAP (O(1) lookup)
// ============================================================

/**
 * Mapa de configurações de rota por código de tipo de OS.
 * Chave: código do tipo_os do banco (ex: 'OS-01', 'OS-09')
 * Valor: configuração de rota
 * 
 * NOTA: Rota de produção é /os/details-workflow/$id (com $id, não $osId)
 */
export const OS_ROUTING_MAP: Record<string, OSRouteConfig> = {
  // OS 1-4: Obras - Workflow dedicado (produção usa details-workflow)
  'OS-01': { osCode: 'OS-01', route: '/os/details-workflow/$id', mode: 'WORKFLOW_PAGE', description: 'Perícia de Fachada' },
  'OS-02': { osCode: 'OS-02', route: '/os/details-workflow/$id', mode: 'WORKFLOW_PAGE', description: 'Revitalização de Fachada' },
  'OS-03': { osCode: 'OS-03', route: '/os/details-workflow/$id', mode: 'WORKFLOW_PAGE', description: 'Reforço Estrutural' },
  'OS-04': { osCode: 'OS-04', route: '/os/details-workflow/$id', mode: 'WORKFLOW_PAGE', description: 'Outros (Obras)' },
  
  // OS 5-6: Assessoria Lead
  'OS-05': { osCode: 'OS-05', route: '/os/details-workflow/$id', mode: 'WORKFLOW_PAGE', description: 'Assessoria Recorrente Lead' },
  'OS-06': { osCode: 'OS-06', route: '/os/details-workflow/$id', mode: 'WORKFLOW_PAGE', description: 'Assessoria Pontual Lead' },
  
  // OS 7-8: Solicitações
  'OS-07': { osCode: 'OS-07', route: '/os/details-workflow/$id', mode: 'WORKFLOW_PAGE', description: 'Solicitação de Reforma' },
  'OS-08': { osCode: 'OS-08', route: '/os/details-workflow/$id', mode: 'WORKFLOW_PAGE', description: 'Visita Técnica' },
  
  // OS 9-10: Administrativo/RH
  'OS-09': { osCode: 'OS-09', route: '/os/details-workflow/$id', mode: 'WORKFLOW_PAGE', description: 'Requisição de Compras' },
  'OS-10': { osCode: 'OS-10', route: '/os/details-workflow/$id', mode: 'WORKFLOW_PAGE', description: 'Requisição Mão de Obra' },
  
  // OS 11-13: Contratos - Rotas de criação
  'OS-11': { osCode: 'OS-11', route: '/os/criar/laudo-pontual', mode: 'CREATE_PAGE', description: 'Laudo Pontual Assessoria' },
  'OS-12': { osCode: 'OS-12', route: '/os/criar/assessoria-recorrente', mode: 'CREATE_PAGE', description: 'Start Contrato Assessoria Anual' },
  'OS-13': { osCode: 'OS-13', route: '/os/criar/start-contrato-obra', mode: 'CREATE_PAGE', description: 'Start Contrato Obra' },
};

/**
 * Fallback route quando nenhuma configuração é encontrada
 */
export const FALLBACK_ROUTE_CONFIG: OSRouteConfig = {
  osCode: 'FALLBACK',
  route: '/os/$osId',
  mode: 'DETAILS_PAGE',
  description: 'Página de detalhes genérica'
};

// ============================================================
// FUNÇÕES DE BUSCA
// ============================================================

/**
 * Busca configuração de rota por código de tipo de OS.
 * 
 * @param tipoOS - Código do tipo da OS (ex: 'OS-01', 'OS-09')
 * @returns Configuração de rota ou undefined
 */
export function getOSRouteConfig(tipoOS: string): OSRouteConfig | undefined {
  if (!tipoOS) return undefined;
  return OS_ROUTING_MAP[tipoOS.toUpperCase()];
}

/**
 * Busca configuração com fallback garantido.
 * 
 * @param tipoOS - Código do tipo da OS
 * @returns Configuração de rota (nunca undefined)
 */
export function getOSRouteConfigWithFallback(tipoOS: string): OSRouteConfig {
  return getOSRouteConfig(tipoOS) || FALLBACK_ROUTE_CONFIG;
}

/**
 * Verifica se um tipo de OS tem configuração de rota.
 */
export function isValidOSCode(tipoOS: string): boolean {
  return getOSRouteConfig(tipoOS) !== undefined;
}
