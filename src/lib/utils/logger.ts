/**
 * Logger Utility - MinervaV2
 *
 * Sistema de logging condicional baseado em ambiente
 * - Logs de debug/info/warn apenas em desenvolvimento
 * - Logs de error sempre ativos (produção + desenvolvimento)
 * - Mantém API compatível com console.*
 *
 * @example
 * ```typescript
 * import { logger } from '@/lib/utils/logger'
 *
 * logger.log('Debug info')           // Apenas dev
 * logger.warn('Warning')             // Apenas dev
 * logger.error('Critical error')     // Dev + prod
 * logger.info('Info message')        // Apenas dev
 * ```
 */

// =====================================================
// TYPES
// =====================================================

type LogLevel = 'log' | 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel[];
  prefix?: string;
}

// =====================================================
// CONFIGURATION
// =====================================================

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

/**
 * Configuração padrão do logger
 * - Dev: todos os níveis habilitados
 * - Prod: apenas errors habilitados
 */
const defaultConfig: LoggerConfig = {
  enabled: true,
  level: isDevelopment
    ? ['log', 'debug', 'info', 'warn', 'error']
    : ['error'], // Produção: apenas errors
  prefix: '[Minerva]',
};

// =====================================================
// LOGGER IMPLEMENTATION
// =====================================================

/**
 * Verifica se um nível de log está habilitado
 */
function isLevelEnabled(level: LogLevel, config: LoggerConfig = defaultConfig): boolean {
  return config.enabled && config.level.includes(level);
}

/**
 * Formata mensagem com prefix e timestamp
 */
function formatMessage(level: LogLevel, args: any[]): any[] {
  if (!defaultConfig.prefix) return args;

  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = `${defaultConfig.prefix} [${level.toUpperCase()}] [${timestamp}]`;

  return [prefix, ...args];
}

/**
 * Logger principal
 */
export const logger = {
  /**
   * Log de debug (apenas desenvolvimento)
   * Use para debugging temporário
   */
  log: (...args: any[]) => {
    if (isLevelEnabled('log')) {
      console.log(...formatMessage('log', args));
    }
  },

  /**
   * Log de debug (apenas desenvolvimento)
   * Use para debugging detalhado
   */
  debug: (...args: any[]) => {
    if (isLevelEnabled('debug')) {
      console.debug(...formatMessage('debug', args));
    }
  },

  /**
   * Log de informação (apenas desenvolvimento)
   * Use para informações úteis durante desenvolvimento
   */
  info: (...args: any[]) => {
    if (isLevelEnabled('info')) {
      console.info(...formatMessage('info', args));
    }
  },

  /**
   * Log de aviso (apenas desenvolvimento)
   * Use para avisos não-críticos
   */
  warn: (...args: any[]) => {
    if (isLevelEnabled('warn')) {
      console.warn(...formatMessage('warn', args));
    }
  },

  /**
   * Log de erro (desenvolvimento + produção)
   * SEMPRE ativo - use para erros críticos
   */
  error: (...args: any[]) => {
    if (isLevelEnabled('error')) {
      console.error(...formatMessage('error', args));
    }
  },

  /**
   * Log de grupo (apenas desenvolvimento)
   * Agrupa logs relacionados
   */
  group: (label: string) => {
    if (isDevelopment) {
      console.group(label);
    }
  },

  /**
   * Fecha grupo de logs
   */
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },

  /**
   * Log de tabela (apenas desenvolvimento)
   * Exibe dados tabulares
   */
  table: (data: any) => {
    if (isDevelopment) {
      console.table(data);
    }
  },

  /**
   * Log de tempo (apenas desenvolvimento)
   * Inicia um timer
   */
  time: (label: string) => {
    if (isDevelopment) {
      console.time(label);
    }
  },

  /**
   * Finaliza timer
   */
  timeEnd: (label: string) => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  },
} as const;

// =====================================================
// ENVIRONMENT INFO
// =====================================================

/**
 * Informações do ambiente (apenas desenvolvimento)
 */
if (isDevelopment) {
  logger.info('Logger initialized', {
    environment: isProduction ? 'production' : 'development',
    enabledLevels: defaultConfig.level,
    viteMode: import.meta.env.MODE,
  });
}

// =====================================================
// LEGACY COMPATIBILITY
// =====================================================

/**
 * Substituto direto para console (não use em código novo)
 * Mantido para compatibilidade durante migração gradual
 *
 * @deprecated Use logger.* diretamente
 */
export const legacyConsole = {
  log: logger.log,
  debug: logger.debug,
  info: logger.info,
  warn: logger.warn,
  error: logger.error,
  group: logger.group,
  groupEnd: logger.groupEnd,
  table: logger.table,
  time: logger.time,
  timeEnd: logger.timeEnd,
} as const;

// =====================================================
// UTILS
// =====================================================

/**
 * Desabilita todos os logs (útil para testes)
 */
export function disableLogger() {
  defaultConfig.enabled = false;
}

/**
 * Habilita todos os logs
 */
export function enableLogger() {
  defaultConfig.enabled = true;
}

/**
 * Configura níveis de log customizados
 */
export function setLogLevel(levels: LogLevel[]) {
  defaultConfig.level = levels;
}

/**
 * Reseta configuração para padrão
 */
export function resetLogger() {
  defaultConfig.enabled = true;
  defaultConfig.level = isDevelopment
    ? ['log', 'debug', 'info', 'warn', 'error']
    : ['error'];
}
