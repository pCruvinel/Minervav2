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
   * Se não encontrar, faz fallback para admin/diretor
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
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        logger.log(`✅ Coordenador encontrado: ${data.nome_completo}`);
        return {
          id: data.id,
          nome_completo: data.nome_completo,
          email: data.email,
        };
      }

      // ✅ FALLBACK: Se não encontrar coordenador específico, buscar admin/diretor
      logger.warn(`⚠️ Coordenador de ${setorSlug} não encontrado, buscando fallback (admin/diretor)...`);
      
      const { data: fallback, error: fallbackError } = await supabase
        .from('colaboradores')
        .select(`
          id,
          nome_completo,
          email,
          cargo:cargos!inner(slug)
        `)
        .in('cargos.slug', ['admin', 'diretor'])
        .eq('ativo', true)
        .limit(1)
        .maybeSingle();

      if (fallbackError) {
        throw fallbackError;
      }

      if (fallback) {
        const cargoData = fallback.cargo as unknown as { slug: string } | null;
        logger.log(`✅ Fallback encontrado: ${fallback.nome_completo} (${cargoData?.slug || 'N/A'})`);
        return {
          id: fallback.id,
          nome_completo: fallback.nome_completo,
          email: fallback.email,
        };
      }

      logger.warn(`⚠️ Nenhum coordenador ou fallback encontrado para o setor ${setorSlug}`);
      return null;
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
        titulo: `📍 Nova Visita Técnica - ${payload.setorDestinoNome}`,
        mensagem: `OS ${payload.codigoOS} (${payload.clienteNome}) aguarda sua confirmação de execução na Etapa ${payload.etapaNumero}.`,
        link_acao: payload.linkOS,
        tipo: 'tarefa',
      };

      logger.log('📧 Criando notificação para coordenador:', notificacao);

      const { error } = await supabase
        .from('notificacoes')
        .insert(notificacao);

      if (error) {
        throw error;
      }

      logger.log('✅ Notificação enviada para fila');

      return {
        success: true,
        coordenador,
        notificacaoId: 'sent-async',
      };
    } catch (error) {
      // ✅ FIX: Log error but don't break the flow - notifications are not critical
      const errorObj = error as { code?: string; message?: string };
      logger.error('Erro ao notificar coordenador:', error);
      
      // Return success=false but with more context
      return {
        success: false,
        error: `Falha ao criar notificação: ${errorObj?.message || 'Erro desconhecido'}. ` +
               `Código: ${errorObj?.code || 'N/A'}. ` +
               'A transferência de OS foi concluída, mas a notificação não foi enviada.',
      };
    }
  }, [buscarCoordenador]);

  return {
    buscarCoordenador,
    notificarCoordenador,
  };
}
