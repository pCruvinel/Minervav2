import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/utils/logger';

/**
 * Cache em memória para IDs de tipos de OS.
 * Evita múltiplas queries ao banco para a mesma informação imutável.
 */
const tipoOSCache = new Map<string, string>();

/**
 * Busca o UUID do tipo de OS pelo código (e.g. 'OS-10'),
 * com cache em memória por sessão.
 *
 * @param codigo - Código do tipo de OS (ex: 'OS-10')
 * @returns UUID do tipo de OS
 * @throws Error se o tipo não for encontrado
 */
export async function getTipoOSId(codigo: string): Promise<string> {
  const cached = tipoOSCache.get(codigo);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('tipos_os')
    .select('id')
    .eq('codigo', codigo)
    .single();

  if (error || !data) {
    logger.error(`[os-helpers] Tipo ${codigo} não encontrado:`, error);
    throw new Error(`Tipo ${codigo} não encontrado no sistema`);
  }

  tipoOSCache.set(codigo, data.id);
  return data.id;
}

/**
 * Atalho para buscar o ID do tipo OS-10.
 * @returns UUID do tipo OS-10
 */
export async function getOS10TipoId(): Promise<string> {
  return getTipoOSId('OS-10');
}
