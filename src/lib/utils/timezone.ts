import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';

/**
 * Timezone padrão do sistema: America/São_Paulo
 */
export const TIMEZONE_SP = 'America/Sao_Paulo';

/**
 * Converte data UTC para timezone de São Paulo
 *
 * @param date - Data em UTC ou string ISO
 * @returns Data no timezone de São Paulo
 *
 * @example
 * ```ts
 * const spTime = toSaoPauloTime(new Date());
 * ```
 */
export function toSaoPauloTime(date: Date | string): Date {
  return toZonedTime(date, TIMEZONE_SP);
}

/**
 * Converte data de São Paulo para UTC
 *
 * @param date - Data no timezone de São Paulo
 * @returns Data em UTC
 *
 * @example
 * ```ts
 * const utcTime = fromSaoPauloTime(new Date());
 * ```
 */
export function fromSaoPauloTime(date: Date): Date {
  return fromZonedTime(date, TIMEZONE_SP);
}

/**
 * Formata data no timezone de São Paulo
 *
 * @param date - Data a ser formatada
 * @param formatStr - String de formato (date-fns)
 * @returns String formatada
 *
 * @example
 * ```ts
 * formatInSaoPaulo(new Date(), 'yyyy-MM-dd HH:mm:ss')
 * // => "2025-12-02 14:30:00"
 * ```
 */
export function formatInSaoPaulo(date: Date, formatStr: string): string {
  return formatInTimeZone(date, TIMEZONE_SP, formatStr);
}

/**
 * Obtém data/hora atual em São Paulo
 *
 * @returns Data atual no timezone de São Paulo
 *
 * @example
 * ```ts
 * const now = nowInSaoPaulo();
 * console.log(now.toLocaleString('pt-BR'));
 * ```
 */
export function nowInSaoPaulo(): Date {
  return toSaoPauloTime(new Date());
}

/**
 * Converte string de data (YYYY-MM-DD) para Date no timezone de São Paulo
 *
 * @param dateStr - String no formato YYYY-MM-DD
 * @returns Data às 00:00:00 no timezone de São Paulo
 *
 * @example
 * ```ts
 * const date = dateStringToSaoPaulo('2025-12-25');
 * // => Date no timezone SP às 00:00:00
 * ```
 */
export function dateStringToSaoPaulo(dateStr: string): Date {
  return toSaoPauloTime(new Date(dateStr + 'T00:00:00'));
}

/**
 * Obtém data/hora atual formatada como YYYY-MM-DD no timezone de São Paulo
 *
 * @returns String no formato YYYY-MM-DD
 *
 * @example
 * ```ts
 * const today = todayInSaoPaulo();
 * // => "2025-12-02"
 * ```
 */
export function todayInSaoPaulo(): string {
  const now = nowInSaoPaulo();
  return formatInSaoPaulo(now, 'yyyy-MM-dd');
}
