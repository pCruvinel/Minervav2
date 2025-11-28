import { Temporal } from '@js-temporal/polyfill';

/**
 * Converte uma data/hora string para Temporal.PlainDateTime para Schedule-X
 * @param dateStr Data no formato "YYYY-MM-DD"
 * @param timeStr Hora no formato "HH:MM" ou "HH:MM:SS"
 * @returns Objeto Temporal.PlainDateTime
 */
export function convertToScheduleXDateTime(dateStr: string, timeStr: string): Temporal.PlainDateTime {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute = 0] = timeStr.split(':').map(Number);

  return Temporal.PlainDateTime.from({
    year,
    month,
    day,
    hour,
    minute
  });
}
