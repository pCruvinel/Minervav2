/**
 * Hook para gerenciamento de aprovação de etapas
 * 
 * Este hook verifica se uma etapa requer aprovação, gerencia o status
 * de aprovação e fornece funções para solicitar, confirmar e rejeitar.
 * 
 * @example
 * ```tsx
 * const { statusAprovacao, solicitarAprovacao, confirmarAprovacao } = useAprovacaoEtapa(osId, etapaOrdem);
 * 
 * if (statusAprovacao === 'pendente') {
 *   await solicitarAprovacao('Proposta finalizada');
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { toast } from '@/lib/utils/safe-toast';
import { useAuth } from '@/lib/contexts/auth-context';

export type StatusAprovacao = 'nao_requer' | 'pendente' | 'solicitada' | 'aprovada' | 'rejeitada';

export interface AprovacaoInfo {
    requerAprovacao: boolean;
    statusAprovacao: StatusAprovacao;
    solicitanteId?: string;
    solicitanteNome?: string;
    solicitadoEm?: Date;
    aprovadorId?: string;
    aprovadorNome?: string;
    aprovadoEm?: Date;
    motivoRejeicao?: string;
}

interface UseAprovacaoEtapaReturn {
    aprovacaoInfo: AprovacaoInfo | null;
    isLoading: boolean;
    isProcessing: boolean;
    recarregar: () => Promise<void>;
    solicitarAprovacao: (justificativa?: string) => Promise<boolean>;
    confirmarAprovacao: () => Promise<boolean>;
    rejeitarAprovacao: (motivo: string) => Promise<boolean>;
    podeAprovar: boolean;
}

const CARGOS_APROVADORES = ['admin', 'diretor', 'coord_obras', 'coord_assessoria', 'coord_administrativo'];

export function useAprovacaoEtapa(osId: string | undefined, etapaOrdem: number): UseAprovacaoEtapaReturn {
    const { currentUser } = useAuth();
    const [aprovacaoInfo, setAprovacaoInfo] = useState<AprovacaoInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Verificar se usuário pode aprovar
    const podeAprovar = currentUser?.cargo_slug ? CARGOS_APROVADORES.includes(currentUser.cargo_slug) : false;

    // Buscar status de aprovação
    const verificarAprovacao = useCallback(async () => {
        if (!osId || etapaOrdem < 1) {
            setAprovacaoInfo(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            
            const { data, error } = await supabase.rpc('verificar_aprovacao_etapa', {
                p_os_id: osId,
                p_etapa_ordem: etapaOrdem
            });

            if (error) throw error;

            if (data && data.length > 0) {
                const row = data[0];
                setAprovacaoInfo({
                    requerAprovacao: row.requer_aprovacao,
                    statusAprovacao: row.status_aprovacao as StatusAprovacao,
                    solicitanteId: row.solicitante_id,
                    solicitanteNome: row.solicitante_nome,
                    solicitadoEm: row.solicitado_em ? new Date(row.solicitado_em) : undefined,
                    aprovadorId: row.aprovador_id,
                    aprovadorNome: row.aprovador_nome,
                    aprovadoEm: row.aprovado_em ? new Date(row.aprovado_em) : undefined,
                    motivoRejeicao: row.motivo_rejeicao
                });
            } else {
                setAprovacaoInfo({
                    requerAprovacao: false,
                    statusAprovacao: 'nao_requer'
                });
            }
        } catch (error) {
            console.error('Erro ao verificar aprovação:', error);
            setAprovacaoInfo(null);
        } finally {
            setIsLoading(false);
        }
    }, [osId, etapaOrdem]);

    // Carregar ao montar ou quando mudar osId/etapaOrdem
    useEffect(() => {
        verificarAprovacao();
    }, [verificarAprovacao]);

    // Solicitar aprovação
    const solicitarAprovacao = useCallback(async (justificativa?: string): Promise<boolean> => {
        if (!osId) return false;

        try {
            setIsProcessing(true);
            
            const { data, error } = await supabase.rpc('solicitar_aprovacao', {
                p_os_id: osId,
                p_etapa_ordem: etapaOrdem,
                p_justificativa: justificativa || null
            });

            if (error) throw error;

            if (data?.success) {
                toast.success('Aprovação solicitada! Aguardando coordenador.');
                await verificarAprovacao();
                return true;
            } else {
                toast.error(data?.error || 'Erro ao solicitar aprovação');
                return false;
            }
        } catch (error) {
            console.error('Erro ao solicitar aprovação:', error);
            toast.error('Erro ao solicitar aprovação');
            return false;
        } finally {
            setIsProcessing(false);
        }
    }, [osId, etapaOrdem, verificarAprovacao]);

    // Confirmar aprovação
    const confirmarAprovacao = useCallback(async (): Promise<boolean> => {
        if (!osId) return false;

        try {
            setIsProcessing(true);
            
            const { data, error } = await supabase.rpc('confirmar_aprovacao', {
                p_os_id: osId,
                p_etapa_ordem: etapaOrdem
            });

            if (error) throw error;

            if (data?.success) {
                toast.success('Aprovado! Etapa concluída e avançada.');
                await verificarAprovacao();
                return true;
            } else {
                toast.error(data?.error || 'Erro ao confirmar aprovação');
                return false;
            }
        } catch (error) {
            console.error('Erro ao confirmar aprovação:', error);
            toast.error('Erro ao confirmar aprovação');
            return false;
        } finally {
            setIsProcessing(false);
        }
    }, [osId, etapaOrdem, verificarAprovacao]);

    // Rejeitar aprovação
    const rejeitarAprovacao = useCallback(async (motivo: string): Promise<boolean> => {
        if (!osId || !motivo.trim()) {
            toast.error('Motivo da rejeição é obrigatório');
            return false;
        }

        try {
            setIsProcessing(true);
            
            const { data, error } = await supabase.rpc('rejeitar_aprovacao', {
                p_os_id: osId,
                p_etapa_ordem: etapaOrdem,
                p_motivo: motivo
            });

            if (error) throw error;

            if (data?.success) {
                toast.success('Aprovação rejeitada. Solicitante será notificado.');
                await verificarAprovacao();
                return true;
            } else {
                toast.error(data?.error || 'Erro ao rejeitar aprovação');
                return false;
            }
        } catch (error) {
            console.error('Erro ao rejeitar aprovação:', error);
            toast.error('Erro ao rejeitar aprovação');
            return false;
        } finally {
            setIsProcessing(false);
        }
    }, [osId, etapaOrdem, verificarAprovacao]);

    return {
        aprovacaoInfo,
        isLoading,
        isProcessing,
        recarregar: verificarAprovacao,
        solicitarAprovacao,
        confirmarAprovacao,
        rejeitarAprovacao,
        podeAprovar
    };
}
