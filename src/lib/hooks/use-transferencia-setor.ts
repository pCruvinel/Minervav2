/**
 * ============================================================================
 * HOOK: TRANSFERÊNCIA DE SETOR
 * ============================================================================
 * 
 * Hook principal para o sistema de transferência automática de setor.
 * Detecta mudança de setor entre etapas e executa transferência completa:
 * - Verifica se há handoff point entre etapas
 * - Registra transferência no banco (os_transferencias)
 * - Notifica coordenador do setor destino
 * - Registra na timeline (os_atividades)
 * - Atualiza setor_atual_id na OS
 * 
 * @module use-transferencia-setor
 * @author Minerva ERP
 */

import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import {
  getHandoffPoint,
  getStepOwner,
  SetorSlug
} from '@/lib/constants/os-ownership-rules';
import {
  TransferenciaInfo,
  TransferenciaResult,
  SETOR_NOMES,
  NotificacaoTransferenciaPayload
} from '@/types/os-setor-config';
import { useNotificarCoordenador } from './use-notificar-coordenador';
import { useAuth } from '@/lib/contexts/auth-context';
import { logger } from '@/lib/utils/logger';

// ============================================================================
// TIPOS
// ============================================================================

export interface ExecutarTransferenciaParams {
  osId: string;
  osType: string; // 'OS-01', 'OS-13', etc.
  codigoOS?: string;
  clienteNome?: string;
  etapaAtual: number;
  proximaEtapa: number;
  nomeProximaEtapa?: string;
}

// ============================================================================
// HOOK
// ============================================================================

export function useTransferenciaSetor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { currentUser } = useAuth();
  const { notificarCoordenador, buscarCoordenador } = useNotificarCoordenador();

  /**
   * Busca o ID do setor pelo slug
   */
  const getSetorId = useCallback(async (setorSlug: SetorSlug): Promise<string | null> => {
    const { data, error } = await supabase
      .from('setores')
      .select('id')
      .eq('slug', setorSlug)
      .single();

    if (error) {
      logger.error(`Erro ao buscar setor ${setorSlug}:`, error);
      return null;
    }

    return data?.id || null;
  }, []);

  /**
   * Verifica se há mudança de setor entre duas etapas
   */
  const verificarMudancaSetor = useCallback((
    osType: string,
    etapaAtual: number,
    proximaEtapa: number
  ): { houveTransferencia: boolean; handoff: ReturnType<typeof getHandoffPoint> } => {
    const handoff = getHandoffPoint(osType, etapaAtual, proximaEtapa);

    if (handoff) {
      logger.log(`🔄 Handoff detectado: Etapa ${etapaAtual} → ${proximaEtapa} (Setor: ${handoff.toSetor})`);
      return { houveTransferencia: true, handoff };
    }

    return { houveTransferencia: false, handoff: null };
  }, []);

  /**
   * Executa a transferência completa de setor
   */
  const executarTransferencia = useCallback(async ({
    osId,
    osType,
    codigoOS,
    clienteNome,
    etapaAtual,
    proximaEtapa,
    nomeProximaEtapa = `Etapa ${proximaEtapa}`,
  }: ExecutarTransferenciaParams): Promise<TransferenciaResult> => {
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Verificar se há mudança de setor
      const { houveTransferencia, handoff } = verificarMudancaSetor(osType, etapaAtual, proximaEtapa);

      if (!houveTransferencia || !handoff) {
        logger.log('✅ Sem mudança de setor, avanço normal');
        return { success: true, transferencia: undefined };
      }

      const setorDestinoSlug = handoff.toSetor;
      const setorOrigemOwner = getStepOwner(osType, etapaAtual);
      const setorOrigemSlug = setorOrigemOwner?.setor || 'administrativo';

      logger.log(`🔀 Executando transferência: ${setorOrigemSlug} → ${setorDestinoSlug}`);

      // 2. Buscar IDs dos setores
      const [setorOrigemId, setorDestinoId] = await Promise.all([
        getSetorId(setorOrigemSlug),
        getSetorId(setorDestinoSlug),
      ]);

      // 3. Buscar coordenador do setor destino
      const coordenador = await buscarCoordenador(setorDestinoSlug);

      // 4. Criar registro de transferência
      const { data: transferenciaData, error: transferenciaError } = await supabase
        .from('os_transferencias')
        .insert({
          os_id: osId,
          etapa_origem: etapaAtual,
          etapa_destino: proximaEtapa,
          setor_origem_id: setorOrigemId,
          setor_destino_id: setorDestinoId,
          transferido_por_id: currentUser?.id,
          coordenador_notificado_id: coordenador?.id || null,
          motivo: 'avanço_etapa',
          metadados: {
            osType,
            codigoOS,
            clienteNome,
            nomeProximaEtapa,
          },
        })
        .select('id')
        .single();

      if (transferenciaError) {
        throw new Error(`Erro ao registrar transferência: ${transferenciaError.message}`);
      }

      logger.log(`📝 Transferência registrada (ID: ${transferenciaData.id})`);

      // 5. Atualizar setor_atual_id e responsavel_id na OS
      const { error: updateOsError } = await supabase
        .from('ordens_servico')
        .update({
          setor_atual_id: setorDestinoId,
          etapa_atual_ordem: proximaEtapa,
          responsavel_id: coordenador?.id || null, // Novo responsável = coordenador do setor destino
        })
        .eq('id', osId);

      if (updateOsError) {
        logger.error('Erro ao atualizar setor_atual_id e responsavel_id:', updateOsError);
        // Não falhar por isso, continuar
      }

      // 6. Registrar na timeline (os_atividades)
      // ✅ FIX: Wrap in try-catch to prevent errors from breaking the transfer flow
      // ✅ FIX: Use correct field names from actual DB schema: 'tipo', 'metadados', 'criado_em'
      try {
        const { error: atividadeError } = await supabase.from('os_atividades').insert({
          os_id: osId,
          etapa_id: null, // Não temos etapa_id no contexto de transferência
          usuario_id: currentUser?.id || null, // Ensure null instead of undefined
          tipo: 'transferencia_setor', // ✅ Campo correto é 'tipo', não 'tipo_atividade'
          descricao: `Transferido para setor ${SETOR_NOMES[setorDestinoSlug]} (Etapa ${proximaEtapa})`,
          metadados: { // ✅ Campo correto é 'metadados', não 'dados_adicionais'
            etapa_origem: etapaAtual,
            etapa_destino: proximaEtapa,
            setor_origem: setorOrigemSlug || 'indefinido',
            setor_destino: setorDestinoSlug,
            coordenador_notificado: coordenador?.nome_completo || null,
          },
        });

        if (atividadeError) {
          logger.warn('⚠️ Erro ao registrar atividade (não crítico):', atividadeError);
        }
      } catch (atividadeErr) {
        logger.warn('⚠️ Exceção ao registrar atividade (não crítico):', atividadeErr);
        // Continue - o registro de atividade é opcional
      }

      // 7. Notificar coordenador
      if (coordenador) {
        const payload: NotificacaoTransferenciaPayload = {
          osId,
          codigoOS: codigoOS || osId,
          tipoOS: osType,
          clienteNome: clienteNome || 'Cliente',
          etapaNumero: proximaEtapa,
          etapaNome: nomeProximaEtapa,
          setorDestinoSlug,
          setorDestinoNome: SETOR_NOMES[setorDestinoSlug],
          linkOS: `/os/${osId}`,
        };

        await notificarCoordenador(payload);
      }

      // 8. Montar resultado de sucesso
      const transferencia: TransferenciaInfo = {
        houveTransferencia: true,
        setorOrigem: setorOrigemSlug,
        setorOrigemNome: SETOR_NOMES[setorOrigemSlug],
        setorDestino: setorDestinoSlug,
        setorDestinoNome: SETOR_NOMES[setorDestinoSlug],
        etapaConcluida: etapaAtual,
        proximaEtapa,
        nomeProximaEtapa,
        coordenadorNotificadoId: coordenador?.id,
        coordenadorNotificadoNome: coordenador?.nome_completo,
      };

      logger.log('✅ Transferência concluída com sucesso:', transferencia);

      return {
        success: true,
        transferencia,
        transferenciaId: transferenciaData.id,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      logger.error('❌ Erro na transferência:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  }, [
    currentUser?.id,
    verificarMudancaSetor,
    getSetorId,
    buscarCoordenador,
    notificarCoordenador,
  ]);

  return {
    verificarMudancaSetor,
    executarTransferencia,
    isProcessing,
    error,
  };
}
