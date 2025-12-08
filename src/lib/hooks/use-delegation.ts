/**
 * ============================================================================
 * HOOK DE DELEGAÇÃO DE RESPONSABILIDADE
 * ============================================================================
 * 
 * Hook para gerenciar delegação de responsabilidade entre etapas de OS.
 * Utiliza as regras definidas em os-ownership-rules.ts.
 * 
 * @module use-delegation
 * @author Minerva ERP
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';
import { 
  CargoSlug, 
  SetorSlug,
  HandoffPoint,
  checkDelegationRequired,
  getStepOwner,
  CARGO_SETOR_MAP
} from '@/lib/constants/os-ownership-rules';
import { NotificationService } from '@/lib/services/notifications-service';

// ============================================================================
// TIPOS
// ============================================================================

export interface EligibleDelegate {
  id: string;
  nome_completo: string;
  email: string;
  cargo_id: string;
  cargo_slug: string;
  cargo_nome: string;
  setor_id: string;
  setor_slug: string;
  setor_nome: string;
  avatar_url?: string;
}

export interface DelegationResult {
  success: boolean;
  message: string;
  newResponsavelId?: string;
  historicoId?: string;
}

export interface UseDelegationReturn {
  /** Se delegação é necessária para a transição atual */
  isDelegationRequired: boolean;
  /** Informações do handoff atual, se delegação for necessária */
  currentHandoff: HandoffPoint | null;
  /** Lista de colaboradores elegíveis para delegação */
  eligibleDelegates: EligibleDelegate[];
  /** Se está carregando colaboradores */
  isLoadingDelegates: boolean;
  /** Se está processando delegação */
  isProcessing: boolean;
  /** Erro se houver */
  error: string | null;
  
  // Ações
  /** Verifica se delegação é necessária */
  checkDelegation: (osType: string, fromStep: number, toStep: number, userCargoSlug: CargoSlug) => boolean;
  /** Carrega colaboradores elegíveis para o cargo de destino */
  loadEligibleDelegates: (targetCargoSlug: CargoSlug) => Promise<EligibleDelegate[]>;
  /** Executa a delegação */
  delegate: (osId: string, newOwnerId: string, oldOwnerId: string, description: string) => Promise<DelegationResult>;
  /** Limpa o estado de delegação */
  reset: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useDelegation(): UseDelegationReturn {
  // Estado
  const [isDelegationRequired, setIsDelegationRequired] = useState(false);
  const [currentHandoff, setCurrentHandoff] = useState<HandoffPoint | null>(null);
  const [eligibleDelegates, setEligibleDelegates] = useState<EligibleDelegate[]>([]);
  const [isLoadingDelegates, setIsLoadingDelegates] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Verifica se delegação é necessária para uma transição de etapas
   */
  const checkDelegation = useCallback((
    osType: string,
    fromStep: number,
    toStep: number,
    userCargoSlug: CargoSlug
  ): boolean => {
    const handoff = checkDelegationRequired(osType, fromStep, toStep, userCargoSlug);
    
    if (handoff) {
      setIsDelegationRequired(true);
      setCurrentHandoff(handoff);
      return true;
    }
    
    setIsDelegationRequired(false);
    setCurrentHandoff(null);
    return false;
  }, []);

  /**
   * Carrega colaboradores elegíveis para um cargo específico
   */
  const loadEligibleDelegates = useCallback(async (
    targetCargoSlug: CargoSlug
  ): Promise<EligibleDelegate[]> => {
    setIsLoadingDelegates(true);
    setError(null);

    try {
      logger.log(`📋 Buscando colaboradores com cargo: ${targetCargoSlug}`);

      // Query para buscar colaboradores ativos com o cargo específico
      const { data, error: queryError } = await supabase
        .from('colaboradores')
        .select(`
          id,
          nome_completo,
          email,
          avatar_url,
          cargo_id,
          setor_id,
          cargo:cargo_id (
            id,
            slug,
            nome
          ),
          setor:setor_id (
            id,
            slug,
            nome
          )
        `)
        .eq('ativo', true)
        .order('nome_completo');

      if (queryError) throw queryError;

      // Filtrar por cargo slug (já que não podemos fazer join com filtro no Supabase diretamente)
      const filtered = (data || [])
        .filter((c: any) => c.cargo?.slug === targetCargoSlug)
        .map((c: any): EligibleDelegate => ({
          id: c.id,
          nome_completo: c.nome_completo,
          email: c.email,
          avatar_url: c.avatar_url,
          cargo_id: c.cargo_id,
          cargo_slug: c.cargo?.slug || '',
          cargo_nome: c.cargo?.nome || '',
          setor_id: c.setor_id,
          setor_slug: c.setor?.slug || '',
          setor_nome: c.setor?.nome || '',
        }));

      logger.log(`✅ Encontrados ${filtered.length} colaboradores elegíveis`);
      setEligibleDelegates(filtered);
      return filtered;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar colaboradores';
      logger.error('❌ Erro ao buscar colaboradores:', err);
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setIsLoadingDelegates(false);
    }
  }, []);

  /**
   * Executa a delegação de responsabilidade
   */
  const delegate = useCallback(async (
    osId: string,
    newOwnerId: string,
    oldOwnerId: string,
    description: string
  ): Promise<DelegationResult> => {
    setIsProcessing(true);
    setError(null);

    try {
      logger.log('🔄 Iniciando delegação de responsabilidade:', {
        osId,
        newOwnerId,
        oldOwnerId,
        description,
      });

      // 1. Buscar dados dos colaboradores (incluindo auth_user_id para notificação)
      const { data: colaboradores, error: colabError } = await supabase
        .from('colaboradores')
        .select('id, nome_completo, auth_user_id')
        .in('id', [newOwnerId, oldOwnerId]);

      if (colabError) throw colabError;

      const oldOwner = colaboradores?.find(c => c.id === oldOwnerId);
      const newOwner = colaboradores?.find(c => c.id === newOwnerId);

      // 2. Atualizar responsavel_id na tabela ordens_servico
      const { error: updateError } = await supabase
        .from('ordens_servico')
        .update({ 
          responsavel_id: newOwnerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', osId);

      if (updateError) throw updateError;

      // 3. Registrar no histórico
      const historicoDescricao = `Responsabilidade transferida de ${oldOwner?.nome_completo || 'Não definido'} para ${newOwner?.nome_completo || 'Desconhecido'}. Motivo: ${description}`;

      const { data: { user } } = await supabase.auth.getUser();

      // Tentar inserir na tabela de histórico (delegacoes)
      // Só registra se delegante e delegado forem diferentes
      let historicoData = null;
      if (oldOwnerId && newOwnerId && oldOwnerId !== newOwnerId) {
        const { data: histData, error: historicoError } = await supabase
          .from('delegacoes')
          .insert({
            os_id: osId,
            delegante_id: oldOwnerId,
            delegado_id: newOwnerId,
            descricao_tarefa: description,
            observacoes: historicoDescricao,
            status_delegacao: 'aceita', // Já aceita ao delegar via handoff
            delegante_nome: oldOwner?.nome_completo || 'Não definido',
            delegado_nome: newOwner?.nome_completo || 'Desconhecido',
          })
          .select('id')
          .single();

        historicoData = histData;

        // Se houver erro na tabela delegacoes, não é erro crítico
        if (historicoError) {
          logger.warn('⚠️ Não foi possível registrar histórico:', historicoError);
        }
      } else {
        logger.log('ℹ️ Delegação não registrada: delegante igual ao delegado ou IDs inválidos');
      }

      // 4. Enviar Notificação para o Novo Responsável
      // IMPORTANTE: Usar auth_user_id (não colaborador.id) para compatibilidade com RLS
      if (newOwner?.auth_user_id) {
        await NotificationService.create({
          usuario_id: newOwner.auth_user_id, // ✅ Usar auth_user_id para RLS
          titulo: 'Nova Responsabilidade Atribuída',
          mensagem: `Você recebeu a responsabilidade pela OS. ${description ? `Obs: ${description}` : ''}`,
          link_acao: `/os/${osId}`,
          tipo: 'tarefa'
        });
      } else {
        logger.warn('⚠️ Colaborador destino sem auth_user_id - notificação não enviada:', newOwnerId);
      }

      logger.log('✅ Delegação concluída com sucesso');
      toast.success(`Responsabilidade transferida para ${newOwner?.nome_completo}`);

      return {
        success: true,
        message: historicoDescricao,
        newResponsavelId: newOwnerId,
        historicoId: historicoData?.id,
      };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao delegar responsabilidade';
      logger.error('❌ Erro na delegação:', err);
      setError(message);
      toast.error(message);
      
      return {
        success: false,
        message,
      };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Limpa o estado de delegação
   */
  const reset = useCallback(() => {
    setIsDelegationRequired(false);
    setCurrentHandoff(null);
    setEligibleDelegates([]);
    setError(null);
  }, []);

  return {
    // Estado
    isDelegationRequired,
    currentHandoff,
    eligibleDelegates,
    isLoadingDelegates,
    isProcessing,
    error,
    
    // Ações
    checkDelegation,
    loadEligibleDelegates,
    delegate,
    reset,
  };
}

// ============================================================================
// UTILITÁRIOS ADICIONAIS
// ============================================================================

/**
 * Hook simplificado para verificar ownership de uma etapa
 */
export function useStepOwnership(osType: string, step: number) {
  const owner = getStepOwner(osType, step);
  
  return {
    cargo: owner?.cargo || null,
    setor: owner?.setor || null,
    isOwned: !!owner,
  };
}

/**
 * Obtém setores que podem receber delegação para um tipo de OS
 */
export function getTargetSetoresForOS(osType: string): SetorSlug[] {
  const setor = new Set<SetorSlug>();
  
  // Isso poderia ser expandido baseado nas regras
  // Por enquanto, retorna todos os setores possíveis
  Object.values(CARGO_SETOR_MAP).forEach(s => setor.add(s));
  
  return Array.from(setor);
}
