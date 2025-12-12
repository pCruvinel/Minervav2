/**
 * ============================================================================
 * HOOK: NOTIFICAR COORDENADOR
 * ============================================================================
 * 
 * Hook para notificar o coordenador de um setor quando uma OS é
 * transferida para sua responsabilidade.
 * 
 * @module use-notificar-coordenador
 * @author Minerva ERP
 */

import { useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { SetorSlug } from '@/lib/constants/os-ownership-rules';
import { COORDENADOR_POR_SETOR, SETOR_NOMES, NotificacaoTransferenciaPayload } from '@/types/os-setor-config';
import { logger } from '@/lib/utils/logger';

// ============================================================================
// TIPOS
// ============================================================================

interface CoordenadorInfo {
  id: string;
  nome_completo: string;
  email: string;
}

interface NotificarResult {
  success: boolean;
  coordenador?: CoordenadorInfo;
  notificacaoId?: string;
  error?: string;
}

// ============================================================================
// HOOK
// ============================================================================

export function useNotificarCoordenador() {
  /**
   * Busca o coordenador ativo de um setor
   */
  const buscarCoordenador = useCallback(async (setorSlug: SetorSlug): Promise<CoordenadorInfo | null> => {
    try {
      const cargoSlug = COORDENADOR_POR_SETOR[setorSlug];

      logger.log(`🔍 Buscando coordenador do setor ${setorSlug} (cargo: ${cargoSlug})`);

      const { data, error } = await supabase
        .from('colaboradores')
        .select(`
          id,
          nome_completo,
          email,
          cargo:cargos!inner(slug)
        `)
        .eq('cargos.slug', cargoSlug)
        .eq('ativo', true)
        .limit(1)
        .maybeSingle(); // ✅ FIX: Use maybeSingle to avoid 406/PGRST116 errors

      if (error) {
        throw error;
      }

      if (!data) {
        logger.warn(`⚠️ Nenhum coordenador encontrado para o setor ${setorSlug}`);
        return null;
      }

      logger.log(`✅ Coordenador encontrado: ${data.nome_completo}`);

      return {
        id: data.id,
        nome_completo: data.nome_completo,
        email: data.email,
      };
    } catch (error) {
      logger.error('Erro ao buscar coordenador:', error);
      return null;
    }
  }, []);

  /**
   * Notifica o coordenador sobre uma transferência de OS
   */
  const notificarCoordenador = useCallback(async (
    payload: NotificacaoTransferenciaPayload
  ): Promise<NotificarResult> => {
    try {
      // 1. Buscar coordenador do setor destino
      const coordenador = await buscarCoordenador(payload.setorDestinoSlug);

      if (!coordenador) {
        logger.warn(`⚠️ Sem coordenador para notificar no setor ${payload.setorDestinoSlug}`);
        return {
          success: false,
          error: `Nenhum coordenador ativo encontrado para o setor ${SETOR_NOMES[payload.setorDestinoSlug]}`,
        };
      }

      // 2. Criar notificação
      const notificacao = {
        usuario_id: coordenador.id,
        titulo: `Nova OS para ${payload.setorDestinoNome}`,
        mensagem: `${payload.codigoOS} - ${payload.clienteNome} está na Etapa ${payload.etapaNumero}: ${payload.etapaNome}`,
        link_acao: payload.linkOS,
        tipo: 'tarefa',
      };

      logger.log('📧 Criando notificação para coordenador:', notificacao);

      const { data, error } = await supabase
        .from('notificacoes')
        .insert(notificacao)
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      logger.log(`✅ Notificação criada com sucesso (ID: ${data.id})`);

      return {
        success: true,
        coordenador,
        notificacaoId: data.id,
      };
    } catch (error) {
      logger.error('Erro ao notificar coordenador:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }, [buscarCoordenador]);

  return {
    buscarCoordenador,
    notificarCoordenador,
  };
}
