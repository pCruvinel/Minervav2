/**
 * ============================================================================
 * REGRAS DE OWNERSHIP (RESPONSABILIDADE) POR ETAPA
 * ============================================================================
 * 
 * Define quem é responsável por cada etapa de cada tipo de OS.
 * Quando há mudança de responsável (handoff), o sistema força delegação.
 * 
 * @module os-ownership-rules
 * @author Minerva ERP
 */

// ============================================================================
// TIPOS
// ============================================================================

/**
 * Slugs dos cargos que podem ser donos de etapas
 */
export type CargoSlug =
  | 'coord_administrativo'
  | 'coord_assessoria'
  | 'coord_obras'
  | 'operacional_admin'
  | 'operacional_assessoria'
  | 'operacional_obras';

/**
 * Slugs dos setores correspondentes
 */
export type SetorSlug = 'administrativo' | 'assessoria' | 'obras';

/**
 * Tipos especiais de iniciador
 */
export type InitiatorType = CargoSlug | 'CLIENTE' | 'LIVRE';

/**
 * Ponto de troca de responsabilidade (handoff)
 */
export interface HandoffPoint {
  /** Etapa de origem (completando) */
  fromStep: number;
  /** Etapa de destino (iniciando) */
  toStep: number;
  /** Cargo que assume a responsabilidade */
  toCargo: CargoSlug;
  /** Setor do cargo (para filtro de colaboradores) */
  toSetor: SetorSlug;
  /** Se retorna automaticamente ao responsável anterior */
  autoReturn?: boolean;
  /** Descrição amigável da transição (para UI) */
  description: string;
}

/**
 * Proprietários de intervalos de etapas
 */
export interface StageOwnership {
  /** Intervalo de etapas [início, fim] (inclusive) */
  range: [number, number];
  /** Cargo dono deste intervalo */
  cargo: CargoSlug;
  /** Setor correspondente */
  setor: SetorSlug;
}

/**
 * Regra completa de ownership para um tipo de OS
 */
export interface OSOwnershipRule {
  /** Código do tipo de OS (ex: "OS-01", "OS-13") */
  osType: string;
  /** Nome amigável do tipo de OS */
  osName: string;
  /** Quem pode iniciar esta OS */
  initiator: InitiatorType;
  /** Total de etapas deste tipo de OS */
  totalSteps: number;
  /** Mapeamento de etapas para cargos */
  stageOwners: StageOwnership[];
  /** Pontos de troca de responsabilidade */
  handoffPoints: HandoffPoint[];
}

// ============================================================================
// REGRAS DE OWNERSHIP POR TIPO DE OS
// ============================================================================

/**
 * OS 01-04: Obras (Perícia de Fachada, Revitalização, Reforço, Outros)
 * 
 * Fluxo: 15 etapas
 * - Etapas 1-4: Coord. Administrativo (Identificação, Tipo, Follow-up 1, Agendar)
 * - Etapas 5-8: Coord. Obras (Visita, Follow-up 2, Memorial, Precificação)
 * - Etapas 9-15: Coord. Administrativo (Proposta, Apresentação, Contrato)
 */
const OS_OBRAS_RULE: OSOwnershipRule = {
  osType: 'OS-01-04',
  osName: 'Obras (Perícia, Revitalização, Reforço, Outros)',
  initiator: 'coord_administrativo',
  totalSteps: 15,
  stageOwners: [
    { range: [1, 4], cargo: 'coord_administrativo', setor: 'administrativo' },
    { range: [5, 8], cargo: 'coord_obras', setor: 'obras' },
    { range: [9, 15], cargo: 'coord_administrativo', setor: 'administrativo' },
  ],
  handoffPoints: [
    {
      fromStep: 4,
      toStep: 5,
      toCargo: 'coord_obras',
      toSetor: 'obras',
      description: 'Transferir para Coordenação de Obras para realizar visita técnica',
    },
    {
      fromStep: 9,
      toStep: 9,
      toCargo: 'coord_administrativo',
      toSetor: 'administrativo',
      description: 'Transferir para Coordenação Administrativa para aprovação da proposta',
    },
    {
      fromStep: 9,
      toStep: 10,
      toCargo: 'coord_administrativo',
      toSetor: 'administrativo',
      description: 'Proposta aprovada - Transferir para Coordenação Administrativa',
    },
    {
      fromStep: 9,
      toStep: 7,
      toCargo: 'coord_obras',
      toSetor: 'obras',
      description: 'Retornar para Obras para revisão do memorial após rejeição',
    },
  ],
};

/**
 * OS 05-06: Assessoria Básica (Mensal e Laudo Pontual)
 * 
 * Fluxo: 12 etapas
 * - Todas as etapas: Coord. Administrativo (sem delegação)
 */
const OS_ASSESSORIA_BASICA_RULE: OSOwnershipRule = {
  osType: 'OS-05-06',
  osName: 'Assessoria Básica (Mensal / Laudo Pontual)',
  initiator: 'coord_administrativo',
  totalSteps: 12,
  stageOwners: [
    { range: [1, 12], cargo: 'coord_administrativo', setor: 'administrativo' },
  ],
  handoffPoints: [], // Sem handoffs - Coord. Admin faz tudo
};

/**
 * OS 07: Solicitação do Cliente (Reforma)
 * 
 * Fluxo: Iniciado pelo cliente via link externo
 * - Vai direto para Coord. Assessoria
 */
const OS_07_RULE: OSOwnershipRule = {
  osType: 'OS-07',
  osName: 'Solicitação do Cliente (Reforma)',
  initiator: 'CLIENTE',
  totalSteps: 10,
  stageOwners: [
    { range: [1, 10], cargo: 'coord_assessoria', setor: 'assessoria' },
  ],
  handoffPoints: [], // Cliente já abre direto para assessoria
};

/**
 * OS 08: Visita Técnica / Parecer Técnico
 * 
 * Fluxo: Cliente → Admin (Triagem) → Assessoria
 */
const OS_08_RULE: OSOwnershipRule = {
  osType: 'OS-08',
  osName: 'Visita Técnica / Parecer Técnico',
  initiator: 'CLIENTE',
  totalSteps: 8,
  stageOwners: [
    { range: [1, 2], cargo: 'coord_administrativo', setor: 'administrativo' }, // Triagem
    { range: [3, 8], cargo: 'coord_assessoria', setor: 'assessoria' },
  ],
  handoffPoints: [
    {
      fromStep: 2,
      toStep: 3,
      toCargo: 'coord_assessoria',
      toSetor: 'assessoria',
      description: 'Transferir para Coordenação de Assessoria após agendamento',
    },
  ],
};

/**
 * OS 09: Requisição de Compras/Materiais
 * 
 * Fluxo: Início livre → Coord. Admin
 */
const OS_09_RULE: OSOwnershipRule = {
  osType: 'OS-09',
  osName: 'Requisição de Compras/Materiais',
  initiator: 'LIVRE',
  totalSteps: 5,
  stageOwners: [
    { range: [1, 1], cargo: 'coord_obras', setor: 'obras' }, // Quem solicita
    { range: [2, 5], cargo: 'coord_administrativo', setor: 'administrativo' }, // Orçamentos e aprovação
  ],
  handoffPoints: [
    {
      fromStep: 1,
      toStep: 2,
      toCargo: 'coord_administrativo',
      toSetor: 'administrativo',
      description: 'Transferir para Coordenação Administrativa para orçamentos',
    },
  ],
};

/**
 * OS 10: Requisição de Mão de Obra
 * 
 * Fluxo: Início livre → Coord. Admin assume
 */
const OS_10_RULE: OSOwnershipRule = {
  osType: 'OS-10',
  osName: 'Requisição de Mão de Obra',
  initiator: 'LIVRE',
  totalSteps: 4,
  stageOwners: [
    { range: [1, 4], cargo: 'coord_administrativo', setor: 'administrativo' },
  ],
  handoffPoints: [], // Coord. Admin assume todo o processo
};

/**
 * OS 11: Execução de Laudo Pontual
 * 
 * Fluxo: Admin (Início) → Assessoria (após agendar)
 */
const OS_11_RULE: OSOwnershipRule = {
  osType: 'OS-11',
  osName: 'Execução de Laudo Pontual',
  initiator: 'coord_administrativo',
  totalSteps: 6,
  stageOwners: [
    { range: [1, 2], cargo: 'coord_administrativo', setor: 'administrativo' },
    { range: [3, 6], cargo: 'coord_assessoria', setor: 'assessoria' },
  ],
  handoffPoints: [
    {
      fromStep: 2,
      toStep: 3,
      toCargo: 'coord_assessoria',
      toSetor: 'assessoria',
      description: 'Transferir para Coordenação de Assessoria após agendamento',
    },
  ],
};

/**
 * OS 12: Execução de Assessoria Recorrente
 * 
 * Fluxo complexo com múltiplas trocas (8 etapas):
 * 1. Admin (Cadastro Cliente e Portal)
 * 2. Assessoria (Anexar ART)
 * 3. Assessoria (Plano de Manutenção)
 * 4. Admin (Agendar Visita)
 * 5. Admin (Realizar Visita)
 * 6. Admin (Agendar Visita Recorrente)
 * 7. Assessoria (Realizar Visita Recorrente)
 * 8. Assessoria (Concluir e Ativar Contrato)
 */
const OS_12_RULE: OSOwnershipRule = {
  osType: 'OS-12',
  osName: 'Execução de Assessoria Recorrente',
  initiator: 'coord_administrativo',
  totalSteps: 8,
  stageOwners: [
    { range: [1, 1], cargo: 'coord_administrativo', setor: 'administrativo' },  // Cadastro
    { range: [2, 3], cargo: 'coord_assessoria', setor: 'assessoria' },          // ART + Plano
    { range: [4, 6], cargo: 'coord_administrativo', setor: 'administrativo' },  // Agendar Visita + Realizar + Agendar Recorrente
    { range: [7, 8], cargo: 'coord_assessoria', setor: 'assessoria' },          // Realizar Recorrente + Concluir
  ],
  handoffPoints: [
    {
      fromStep: 1,
      toStep: 2,
      toCargo: 'coord_assessoria',
      toSetor: 'assessoria',
      description: 'Transferir para Assessoria para anexar ART',
    },
    {
      fromStep: 3,
      toStep: 4,
      toCargo: 'coord_administrativo',
      toSetor: 'administrativo',
      description: 'Retornar para Admin para agendar visita',
    },
    {
      fromStep: 6,
      toStep: 7,
      toCargo: 'coord_assessoria',
      toSetor: 'assessoria',
      description: 'Transferir para Assessoria para realizar visita recorrente',
    },
  ],
};


/**
 * OS 13: Obra Complexa
 * 
 * Fluxo mais complexo com 7 pontos de handoff:
 * 1. Admin (Cadastro Cliente/Obra)
 * 2. Obras (Anexar ART)
 * 3. Admin (Agendar Visita Inicial + Realizar)
 * 4. Obras (Histograma até Diário)
 * 5. Admin (Seguro)
 * 6. Obras (SST)
 * 7. Admin (Agendar Final)
 * 8. Obras (Realizar Final)
 */
const OS_13_RULE: OSOwnershipRule = {
  osType: 'OS-13',
  osName: 'Obra Complexa (Contrato)',
  initiator: 'coord_administrativo',
  totalSteps: 18,
  stageOwners: [
    { range: [1, 1], cargo: 'coord_administrativo', setor: 'administrativo' },   // Cadastro
    { range: [2, 2], cargo: 'coord_obras', setor: 'obras' },                      // ART
    { range: [3, 4], cargo: 'coord_administrativo', setor: 'administrativo' },   // Agendar + Realizar Visita Inicial
    { range: [5, 10], cargo: 'coord_obras', setor: 'obras' },                     // Histograma - Diário
    { range: [11, 11], cargo: 'coord_administrativo', setor: 'administrativo' }, // Seguro
    { range: [12, 12], cargo: 'coord_obras', setor: 'obras' },                    // SST
    { range: [13, 13], cargo: 'coord_administrativo', setor: 'administrativo' }, // Agendar Final
    { range: [14, 18], cargo: 'coord_obras', setor: 'obras' },                    // Realizar Final + Conclusão
  ],
  handoffPoints: [
    {
      fromStep: 1,
      toStep: 2,
      toCargo: 'coord_obras',
      toSetor: 'obras',
      description: 'Transferir para Coord. Obras para anexar ART',
    },
    {
      fromStep: 2,
      toStep: 3,
      toCargo: 'coord_administrativo',
      toSetor: 'administrativo',
      description: 'Retornar para Coord. Admin para agendar visita inicial',
    },
    {
      fromStep: 4,
      toStep: 5,
      toCargo: 'coord_obras',
      toSetor: 'obras',
      description: 'Transferir para Coord. Obras para Histograma e Diário',
    },
    {
      fromStep: 10,
      toStep: 11,
      toCargo: 'coord_administrativo',
      toSetor: 'administrativo',
      description: 'Retornar para Coord. Admin para providenciar Seguro',
    },
    {
      fromStep: 11,
      toStep: 12,
      toCargo: 'coord_obras',
      toSetor: 'obras',
      description: 'Transferir para Coord. Obras para documentos SST',
    },
    {
      fromStep: 12,
      toStep: 13,
      toCargo: 'coord_administrativo',
      toSetor: 'administrativo',
      description: 'Retornar para Coord. Admin para agendar visita final',
    },
    {
      fromStep: 13,
      toStep: 14,
      toCargo: 'coord_obras',
      toSetor: 'obras',
      description: 'Transferir para Coord. Obras para realizar visita final',
    },
  ],
};

// ============================================================================
// MAPA GERAL DE REGRAS
// ============================================================================

/**
 * Mapa de todas as regras de ownership indexadas por código de OS
 */
export const OS_OWNERSHIP_RULES: Record<string, OSOwnershipRule> = {
  'OS-01': OS_OBRAS_RULE,
  'OS-02': OS_OBRAS_RULE,
  'OS-03': OS_OBRAS_RULE,
  'OS-04': OS_OBRAS_RULE,
  'OS-05': OS_ASSESSORIA_BASICA_RULE,
  'OS-06': OS_ASSESSORIA_BASICA_RULE,
  'OS-07': OS_07_RULE,
  'OS-08': OS_08_RULE,
  'OS-09': OS_09_RULE,
  'OS-10': OS_10_RULE,
  'OS-11': OS_11_RULE,
  'OS-12': OS_12_RULE,
  'OS-13': OS_13_RULE,
};

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Obtém a regra de ownership para um tipo de OS
 */
export function getOwnershipRule(osType: string): OSOwnershipRule | null {
  return OS_OWNERSHIP_RULES[osType] || null;
}

/**
 * Obtém o cargo dono de uma etapa específica
 */
export function getStepOwner(osType: string, step: number): { cargo: CargoSlug; setor: SetorSlug } | null {
  const rule = getOwnershipRule(osType);
  if (!rule) return null;

  const owner = rule.stageOwners.find(
    (o) => step >= o.range[0] && step <= o.range[1]
  );

  return owner ? { cargo: owner.cargo, setor: owner.setor } : null;
}

/**
 * Verifica se há um ponto de handoff entre duas etapas
 */
export function getHandoffPoint(osType: string, fromStep: number, toStep: number): HandoffPoint | null {
  const rule = getOwnershipRule(osType);
  if (!rule) return null;

  return rule.handoffPoints.find(
    (h) => h.fromStep === fromStep && h.toStep === toStep
  ) || null;
}

/**
 * Verifica se a delegação é necessária ao avançar de uma etapa para outra
 * 
 * @param osType Código do tipo de OS (ex: "OS-01")
 * @param fromStep Etapa atual (que está sendo concluída)
 * @param toStep Próxima etapa (que será iniciada)
 * @param currentUserCargoSlug Slug do cargo do usuário atual
 * @returns O ponto de handoff se delegação for necessária, null caso contrário
 */
export function checkDelegationRequired(
  osType: string,
  fromStep: number,
  toStep: number,
  currentUserCargoSlug: CargoSlug
): HandoffPoint | null {
  // 1. Verificar se existe handoff definido
  const handoff = getHandoffPoint(osType, fromStep, toStep);
  if (!handoff) return null;

  // 2. Verificar se o usuário atual já é do cargo de destino
  // Se sim, não precisa delegar (ele mesmo pode assumir)
  if (handoff.toCargo === currentUserCargoSlug) {
    return null;
  }

  // 3. Existe handoff e o usuário não é do cargo de destino → precisa delegar
  return handoff;
}

/**
 * Retorna todos os pontos de handoff de um tipo de OS
 */
export function getAllHandoffPoints(osType: string): HandoffPoint[] {
  const rule = getOwnershipRule(osType);
  return rule?.handoffPoints || [];
}

/**
 * Verifica se um cargo pode iniciar um tipo de OS
 */
export function canInitiateOS(osType: string, cargoSlug: CargoSlug): boolean {
  const rule = getOwnershipRule(osType);
  if (!rule) return false;

  // OS iniciadas por CLIENTE ou LIVRE têm regras especiais
  if (rule.initiator === 'CLIENTE' || rule.initiator === 'LIVRE') {
    return true; // Qualquer um pode iniciar
  }

  return rule.initiator === cargoSlug;
}

/**
 * Mapa de cargos para setores (para uso em queries)
 */
export const CARGO_SETOR_MAP: Record<CargoSlug, SetorSlug> = {
  coord_administrativo: 'administrativo',
  coord_assessoria: 'assessoria',
  coord_obras: 'obras',
  operacional_admin: 'administrativo',
  operacional_assessoria: 'assessoria',
  operacional_obras: 'obras',
};
