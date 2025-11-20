/**
 * Conflict Resolver
 *
 * Gerencia resolução de conflitos em sincronização de dados
 * - Multiple estratégias de resolução
 * - Logging detalhado de conflitos
 * - Webhooks para conflitos críticos
 * - Merge automático quando possível
 *
 * @module conflict-resolver
 */

// =====================================================
// TYPES
// =====================================================

export type ConflictStrategy = 'last-write-wins' | 'remote-wins' | 'local-wins' | 'merge';

export interface ConflictInfo<T> {
  id: string;
  local: T;
  remote: T;
  strategy: ConflictStrategy;
  resolved: T;
  timestamp: Date;
  mergeAttempted: boolean;
  criticalDataLost: boolean;
}

export interface ConflictStats {
  total: number;
  resolved: number;
  failed: number;
  criticalLosses: number;
  byStrategy: Record<ConflictStrategy, number>;
}

export type OnConflictCallback<T> = (info: ConflictInfo<T>) => void;

// =====================================================
// CONFLICT RESOLVER CLASS
// =====================================================

export class ConflictResolver<T extends { id: string; updatedAt?: string }> {
  private strategy: ConflictStrategy;
  private conflicts: ConflictInfo<T>[] = [];
  private stats: ConflictStats = {
    total: 0,
    resolved: 0,
    failed: 0,
    criticalLosses: 0,
    byStrategy: {
      'last-write-wins': 0,
      'remote-wins': 0,
      'local-wins': 0,
      'merge': 0,
    },
  };
  private onConflict?: OnConflictCallback<T>;
  private criticalFields: Set<string> = new Set();

  constructor(strategy: ConflictStrategy = 'last-write-wins', onConflict?: OnConflictCallback<T>) {
    this.strategy = strategy;
    this.onConflict = onConflict;
  }

  /**
   * Define campos críticos que não devem ser perdidos
   */
  setCriticalFields(fields: string[]): void {
    this.criticalFields = new Set(fields);
  }

  /**
   * Resolve conflito entre versões local e remota
   */
  resolve(id: string, local: T, remote: T): T {
    this.stats.total++;

    let resolved = local;
    let criticalLost = false;

    switch (this.strategy) {
      case 'last-write-wins':
        resolved = this.lastWriteWins(local, remote);
        break;
      case 'remote-wins':
        resolved = remote;
        break;
      case 'local-wins':
        resolved = local;
        break;
      case 'merge':
        const merged = this.merge(local, remote);
        if (merged) {
          resolved = merged;
        } else {
          resolved = this.lastWriteWins(local, remote);
        }
        break;
    }

    // Verificar se dados críticos foram perdidos
    criticalLost = this.checkCriticalDataLoss(local, remote, resolved);

    const conflict: ConflictInfo<T> = {
      id,
      local,
      remote,
      strategy: this.strategy,
      resolved,
      timestamp: new Date(),
      mergeAttempted: this.strategy === 'merge',
      criticalDataLost: criticalLost,
    };

    this.conflicts.push(conflict);
    this.stats.resolved++;
    this.stats.byStrategy[this.strategy]++;

    if (criticalLost) {
      this.stats.criticalLosses++;
      console.warn('⚠️ Dados críticos perdidos durante resolução de conflito:', conflict);
    }

    if (this.onConflict) {
      this.onConflict(conflict);
    }

    return resolved;
  }

  /**
   * Estratégia: Last-Write-Wins (último a escrever vence)
   */
  private lastWriteWins(local: T, remote: T): T {
    const localTime = this.getTimestamp(local);
    const remoteTime = this.getTimestamp(remote);

    if (localTime >= remoteTime) {
      return local;
    }
    return remote;
  }

  /**
   * Tenta fazer merge de campos não conflitantes
   */
  private merge(local: T, remote: T): T | null {
    try {
      const merged = { ...local };
      let hasMerges = false;

      // Iterar sobre campos do remoto
      for (const key of Object.keys(remote)) {
        if (key === 'id' || key === 'updatedAt') continue;

        // Se campo não existe em local, copiar do remote
        if (!(key in merged)) {
          (merged as any)[key] = (remote as any)[key];
          hasMerges = true;
          continue;
        }

        // Se campo é diferentes, usar last-write-wins
        if ((merged as any)[key] !== (remote as any)[key]) {
          const localVal = (merged as any)[key];
          const remoteVal = (remote as any)[key];

          // Se são objetos, tentar merge recursivo
          if (typeof localVal === 'object' && typeof remoteVal === 'object') {
            const localTime = (localVal as any)?.updatedAt || (local as any)?.updatedAt || 0;
            const remoteTime = (remoteVal as any)?.updatedAt || (remote as any)?.updatedAt || 0;
            (merged as any)[key] = localTime >= remoteTime ? localVal : remoteVal;
          } else {
            // Usar last-write-wins
            const localTime = this.getTimestamp(local);
            const remoteTime = this.getTimestamp(remote);
            (merged as any)[key] = localTime >= remoteTime ? localVal : remoteVal;
          }
          hasMerges = true;
        }
      }

      return hasMerges ? merged : null;
    } catch (error) {
      console.warn('❌ Erro durante merge:', error);
      return null;
    }
  }

  /**
   * Verifica se dados críticos foram perdidos
   */
  private checkCriticalDataLoss(local: T, remote: T, resolved: T): boolean {
    if (this.criticalFields.size === 0) return false;

    for (const field of this.criticalFields) {
      const localVal = (local as any)[field];
      const remoteVal = (remote as any)[field];
      const resolvedVal = (resolved as any)[field];

      // Se um dos dados tem valor crítico que foi perdido no resolved
      if ((localVal || remoteVal) && !resolvedVal) {
        return true;
      }
    }

    return false;
  }

  /**
   * Extrai timestamp de um objeto
   */
  private getTimestamp(obj: T): number {
    if (obj.updatedAt) {
      return new Date(obj.updatedAt).getTime();
    }
    return 0;
  }

  /**
   * Retorna histórico de conflitos
   */
  getConflictHistory(): ConflictInfo<T>[] {
    return [...this.conflicts];
  }

  /**
   * Retorna estatísticas
   */
  getStats(): Readonly<ConflictStats> {
    return { ...this.stats };
  }

  /**
   * Limpa histórico
   */
  clearHistory(): void {
    this.conflicts = [];
    this.stats = {
      total: 0,
      resolved: 0,
      failed: 0,
      criticalLosses: 0,
      byStrategy: {
        'last-write-wins': 0,
        'remote-wins': 0,
        'local-wins': 0,
        'merge': 0,
      },
    };
  }

  /**
   * Define estratégia de resolução
   */
  setStrategy(strategy: ConflictStrategy): void {
    this.strategy = strategy;
  }
}

// =====================================================
// FACTORY FUNCTIONS
// =====================================================

/**
 * Cria resolver com estratégia padrão para calendários (last-write-wins)
 */
export function createCalendarConflictResolver<T extends { id: string; updatedAt?: string }>(
  onConflict?: OnConflictCallback<T>
): ConflictResolver<T> {
  const resolver = new ConflictResolver<T>('last-write-wins', onConflict);
  resolver.setCriticalFields(['id', 'horaInicio', 'horaFim']);
  return resolver;
}

/**
 * Cria resolver com estratégia padrão para agendamentos (remote-wins)
 */
export function createAgendamentoConflictResolver<T extends { id: string; updatedAt?: string }>(
  onConflict?: OnConflictCallback<T>
): ConflictResolver<T> {
  const resolver = new ConflictResolver<T>('remote-wins', onConflict);
  resolver.setCriticalFields(['id', 'userId', 'status']);
  return resolver;
}

/**
 * Cria resolver com estratégia merge automático
 */
export function createMergeConflictResolver<T extends { id: string; updatedAt?: string }>(
  onConflict?: OnConflictCallback<T>
): ConflictResolver<T> {
  const resolver = new ConflictResolver<T>('merge', onConflict);
  resolver.setCriticalFields(['id']);
  return resolver;
}

// =====================================================
// BATCH CONFLICT RESOLVER
// =====================================================

/**
 * Resolve múltiplos conflitos com otimizações
 */
export function resolveBatchConflicts<T extends { id: string; updatedAt?: string }>(
  local: Map<string, T>,
  remote: Map<string, T>,
  resolver: ConflictResolver<T>
): Map<string, T> {
  const resolved = new Map(local);

  // Resolver conflitos em items que existem em ambos
  for (const remoteItem of remote.values()) {
    const localItem = local.get(remoteItem.id);

    if (localItem) {
      // Item existe em ambos - pode haver conflito
      const resolvedItem = resolver.resolve(remoteItem.id, localItem, remoteItem);
      resolved.set(remoteItem.id, resolvedItem);
    } else {
      // Item só existe remotamente - adicionar
      resolved.set(remoteItem.id, remoteItem);
    }
  }

  return resolved;
}

// =====================================================
// DIFF DETECTION
// =====================================================

/**
 * Detecta e lista mudanças entre duas versões
 */
export function detectChanges<T extends Record<string, any>>(
  local: T,
  remote: T
): Array<{ field: string; localValue: any; remoteValue: any }> {
  const changes: Array<{ field: string; localValue: any; remoteValue: any }> = [];

  const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);

  for (const key of allKeys) {
    const localVal = (local as any)[key];
    const remoteVal = (remote as any)[key];

    if (JSON.stringify(localVal) !== JSON.stringify(remoteVal)) {
      changes.push({
        field: key,
        localValue: localVal,
        remoteValue: remoteVal,
      });
    }
  }

  return changes;
}
