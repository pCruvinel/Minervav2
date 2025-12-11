/**
 * ============================================================================
 * TIPOS PARA SISTEMA DE TRANSFERÊNCIA DE SETOR
 * ============================================================================
 * 
 * Define tipos para o sistema de transferência automática de setor
 * entre etapas de OS.
 * 
 * @module os-setor-config
 * @author Minerva ERP
 */

import { SetorSlug } from '@/lib/constants/os-ownership-rules';

// ============================================================================
// TIPOS DE TRANSFERÊNCIA
// ============================================================================

/**
 * Informações sobre uma transferência de setor ocorrida
 */
export interface TransferenciaInfo {
  /** Se houve transferência de setor */
  houveTransferencia: boolean;
  /** Setor de origem */
  setorOrigem: SetorSlug;
  /** Nome do setor de origem */
  setorOrigemNome: string;
  /** Setor de destino */
  setorDestino: SetorSlug;
  /** Nome do setor de destino */
  setorDestinoNome: string;
  /** Etapa que foi concluída */
  etapaConcluida: number;
  /** Próxima etapa (destino) */
  proximaEtapa: number;
  /** Nome da próxima etapa */
  nomeProximaEtapa: string;
  /** ID do coordenador notificado */
  coordenadorNotificadoId?: string;
  /** Nome do coordenador notificado */
  coordenadorNotificadoNome?: string;
}

/**
 * Resultado de uma operação de transferência
 */
export interface TransferenciaResult {
  success: boolean;
  transferencia?: TransferenciaInfo;
  error?: string;
  /** ID do registro criado em os_transferencias */
  transferenciaId?: string;
}

/**
 * Payload para criar notificação de transferência
 */
export interface NotificacaoTransferenciaPayload {
  osId: string;
  codigoOS: string;
  tipoOS: string;
  clienteNome: string;
  etapaNumero: number;
  etapaNome: string;
  setorDestinoSlug: SetorSlug;
  setorDestinoNome: string;
  linkOS: string;
}

// ============================================================================
// TIPOS DE REGISTRO
// ============================================================================

/**
 * Registro de transferência no banco de dados
 */
export interface OSTransferencia {
  id: string;
  os_id: string;
  etapa_origem: number;
  etapa_destino: number;
  setor_origem_id: string | null;
  setor_destino_id: string | null;
  transferido_por_id: string;
  coordenador_notificado_id: string | null;
  transferido_em: string;
  motivo: 'avanço_etapa' | 'retorno_etapa' | 'manual';
  metadados: Record<string, unknown>;
}

// ============================================================================
// MAPEAMENTO DE SETORES
// ============================================================================

/**
 * Nomes amigáveis dos setores
 */
export const SETOR_NOMES: Record<SetorSlug, string> = {
  administrativo: 'Administrativo',
  assessoria: 'Assessoria',
  obras: 'Obras',
};

/**
 * Slugs dos cargos de coordenador por setor
 */
export const COORDENADOR_POR_SETOR: Record<SetorSlug, string> = {
  administrativo: 'coord_administrativo',
  assessoria: 'coord_assessoria',
  obras: 'coord_obras',
};
