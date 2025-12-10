/**
 * Offline Cache Manager
 *
 * Gerencia persistência de dados para uso offline
 * - Cache com versionamento
 * - TTL (Time To Live) para dados
 * - Sincronização inteligente ao conectar
 * - Limite de tamanho de armazenamento
 *
 * @module offline-cache
 */

import { logger } from '@/lib/utils/logger';

// =====================================================
// TYPES
// =====================================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
  checksum?: string;
}

export interface CacheConfig {
  ttl?: number; // TTL em ms (padrão: 30 minutos)
  maxSize?: number; // Tamanho máximo em bytes (padrão: 5MB)
  version?: number;
}

export interface CacheStats {
  size: number;
  entries: number;
  ttlExpired: number;
}

// =====================================================
// CONSTANTS
// =====================================================

const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutos
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const CACHE_PREFIX = 'minerva_cache_';
const STORAGE_KEY = 'minerva_cache_metadata';

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Calcula checksum simples para detectar mudanças
 */
function calculateChecksum(data: any): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Estima tamanho em bytes de um objeto
 */
function estimateSize(obj: any): number {
  return new Blob([JSON.stringify(obj)]).size;
}

/**
 * Gera chave única do cache
 */
function getCacheKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

// =====================================================
// OFFLINE CACHE CLASS
// =====================================================

export class OfflineCache {
  private ttl: number;
  private maxSize: number;
  private version: number;
  private metadata: Map<string, CacheEntry<any>> = new Map();

  constructor(config?: CacheConfig) {
    this.ttl = config?.ttl || DEFAULT_TTL;
    this.maxSize = config?.maxSize || DEFAULT_MAX_SIZE;
    this.version = config?.version || 1;
    this.loadMetadata();
  }

  /**
   * Salva dado em cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    try {
      const finalTTL = ttl || this.ttl;
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version: this.version,
        checksum: calculateChecksum(data),
      };

      const cacheKey = getCacheKey(key);

      // Verificar tamanho
      const size = estimateSize(entry);
      if (size > this.maxSize) {
        logger.warn(`⚠️ Cache entry muito grande (${size} bytes)`);
        return;
      }

      // Salvar em localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(cacheKey, JSON.stringify(entry));
        this.metadata.set(key, entry);
        this.saveMetadata();
      }
    } catch (error) {
      logger.warn('⚠️ Erro ao salvar em cache:', error);
      // Handle quota exceeded
      if (error instanceof DOMException && error.code === 22) {
        this.clearExpired();
        this.set(key, data, ttl);
      }
    }
  }

  /**
   * Recupera dado do cache
   */
  get<T>(key: string): T | null {
    try {
      const cacheKey = getCacheKey(key);

      if (typeof window !== 'undefined' && window.localStorage) {
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;

        const entry: CacheEntry<T> = JSON.parse(cached);

        // Verificar TTL
        if (Date.now() - entry.timestamp > this.ttl) {
          this.remove(key);
          return null;
        }

        // Verificar versionamento
        if (entry.version !== this.version) {
          this.remove(key);
          return null;
        }

        return entry.data;
      }
    } catch (error) {
      logger.warn('⚠️ Erro ao recuperar do cache:', error);
    }

    return null;
  }

  /**
   * Verifica se chave existe e é válida
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove entrada do cache
   */
  remove(key: string): void {
    try {
      const cacheKey = getCacheKey(key);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(cacheKey);
        this.metadata.delete(key);
        this.saveMetadata();
      }
    } catch (error) {
      logger.warn('⚠️ Erro ao remover do cache:', error);
    }
  }

  /**
   * Limpa cache inteiro
   */
  clear(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        for (const key of this.metadata.keys()) {
          const cacheKey = getCacheKey(key);
          localStorage.removeItem(cacheKey);
        }
        this.metadata.clear();
        this.saveMetadata();
      }
    } catch (error) {
      logger.warn('⚠️ Erro ao limpar cache:', error);
    }
  }

  /**
   * Remove entradas expiradas
   */
  clearExpired(): void {
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];

      for (const [key, entry] of this.metadata) {
        if (now - entry.timestamp > this.ttl) {
          keysToRemove.push(key);
        }
      }

      for (const key of keysToRemove) {
        this.remove(key);
      }

      logger.log(`🧹 Limpeza de cache: ${keysToRemove.length} entradas expiradas removidas`);
    } catch (error) {
      logger.warn('⚠️ Erro ao limpar cache expirado:', error);
    }
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats(): CacheStats {
    let totalSize = 0;
    let ttlExpired = 0;
    const now = Date.now();

    for (const entry of this.metadata.values()) {
      totalSize += estimateSize(entry);
      if (now - entry.timestamp > this.ttl) {
        ttlExpired++;
      }
    }

    return {
      size: totalSize,
      entries: this.metadata.size,
      ttlExpired,
    };
  }

  /**
   * Exporta estado do cache para sincronização
   */
  export(): Record<string, CacheEntry<any>> {
    const exported: Record<string, CacheEntry<any>> = {};

    for (const [key, entry] of this.metadata) {
      exported[key] = entry;
    }

    return exported;
  }

  /**
   * Importa estado do cache após sincronização
   */
  import(data: Record<string, CacheEntry<any>>): void {
    try {
      for (const [key, entry] of Object.entries(data)) {
        if (entry.version === this.version) {
          this.metadata.set(key, entry);
          const cacheKey = getCacheKey(key);
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(cacheKey, JSON.stringify(entry));
          }
        }
      }
      this.saveMetadata();
    } catch (error) {
      logger.warn('⚠️ Erro ao importar cache:', error);
    }
  }

  /**
   * Salva metadados em localStorage
   */
  private saveMetadata(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const metadata = Array.from(this.metadata.entries());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));
      }
    } catch (error) {
      logger.warn('⚠️ Erro ao salvar metadados:', error);
    }
  }

  /**
   * Carrega metadados do localStorage
   */
  private loadMetadata(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const metadata = JSON.parse(stored);
          this.metadata = new Map(metadata);
        }
      }
    } catch (error) {
      logger.warn('⚠️ Erro ao carregar metadados:', error);
    }
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

let offlineCacheInstance: OfflineCache | null = null;

/**
 * Retorna instância singleton do cache
 */
export function getOfflineCache(config?: CacheConfig): OfflineCache {
  if (!offlineCacheInstance) {
    offlineCacheInstance = new OfflineCache(config);
  }
  return offlineCacheInstance;
}

/**
 * Reseta a instância singleton
 */
export function resetOfflineCache(): void {
  offlineCacheInstance = null;
}

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

/**
 * Salva dados com namespace automático
 */
export function cacheSave<T>(namespace: string, key: string, data: T, ttl?: number): void {
  const cache = getOfflineCache();
  cache.set(`${namespace}:${key}`, data, ttl);
}

/**
 * Recupera dados com namespace automático
 */
export function cacheGet<T>(namespace: string, key: string): T | null {
  const cache = getOfflineCache();
  return cache.get<T>(`${namespace}:${key}`);
}

/**
 * Remove dados com namespace automático
 */
export function cacheRemove(namespace: string, key: string): void {
  const cache = getOfflineCache();
  cache.remove(`${namespace}:${key}`);
}

/**
 * Verifica se dados existem e são válidos
 */
export function cacheHas(namespace: string, key: string): boolean {
  const cache = getOfflineCache();
  return cache.has(`${namespace}:${key}`);
}

/**
 * Limpa todo o cache de um namespace
 */
export function cacheClearNamespace(namespace: string): void {
  const cache = getOfflineCache();
  const exported = cache.export();

  for (const key of Object.keys(exported)) {
    if (key.startsWith(`${namespace}:`)) {
      cache.remove(key);
    }
  }
}
