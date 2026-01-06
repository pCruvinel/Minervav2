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
                
                // ✅ NOTIFICAR: Coord Admin + Diretoria
                try {
                    // 1. Buscar dados para notificação
                    const { data: osData } = await supabase
                        .from('ordens_servico')
                        .select('codigo_os, cliente:clientes(nome_fantasia, nome_razao_social)')
                        .eq('id', osId)
                        .single();

                    const { data: etapaData } = await supabase
                        .from('os_etapas')
                        .select('nome')
                        .eq('os_id', osId)
                        .eq('ordem', Number(etapaOrdem))
                        .maybeSingle();
                    
                    const codigoOS = osData?.codigo_os || 'OS';
                    const clienteObj = osData?.cliente as any;
                    const clienteNome = clienteObj?.nome_fantasia || clienteObj?.nome_razao_social || 'Cliente';
                    const etapaNome = etapaData?.nome || `Etapa ${etapaOrdem}`;
                    const tipoDocumento = etapaNome;

                    const { data: destinatarios } = await supabase
                        .from('colaboradores')
                        .select('id, nome_completo')
                        .eq('ativo', true)
                        .in('funcao', ['coord_administrativo', 'diretor', 'admin']);
                    
                    if (destinatarios && destinatarios.length > 0) {
                        const notificacoes = destinatarios.map(dest => ({
                            usuario_id: dest.id,
                            titulo: `⚠️ Aprovação Pendente: ${tipoDocumento} | ${codigoOS}`,
                            mensagem: `${currentUser?.nome_completo || 'Usuário'} solicita aprovação de ${tipoDocumento} para o cliente **${clienteNome}**.${justificativa ? `\n💬 Justificativa: ${justificativa}` : ''}`,
                            link_acao: `/os/details-workflow/${osId}`,
                            tipo: 'aprovacao',
                            lida: false,
                        }));
                        
                        await supabase.from('notificacoes').insert(notificacoes);
                    }
                } catch (notifError) {
                    console.error('Erro ao enviar notificações (não bloqueante):', notifError);
                }
                
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
    }, [osId, etapaOrdem, verificarAprovacao, currentUser]);

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
                
                // ✅ NOTIFICAR: Coord Admin + Solicitante + Diretoria
                try {
                    // 1. Buscar dados para notificação
                    const { data: osData } = await supabase
                        .from('ordens_servico')
                        .select('codigo_os, descricao, cliente:clientes(nome_fantasia, nome_razao_social)')
                        .eq('id', osId)
                        .single();

                    const { data: etapaData } = await supabase
                        .from('os_etapas')
                        .select('nome')
                        .eq('os_id', osId)
                        .eq('ordem', Number(etapaOrdem))
                        .maybeSingle();
                        
                    const { data: proximaEtapaData } = await supabase
                        .from('os_etapas')
                        .select('nome')
                        .eq('os_id', osId)
                        .eq('ordem', Number(etapaOrdem) + 1)
                        .maybeSingle();
                    
                    const clienteObj = osData?.cliente as any;
                    const clienteNome = clienteObj?.nome_fantasia || clienteObj?.nome_razao_social || 'Cliente';
                    const osDescricao = osData?.descricao || 'OS';
                    const etapaNome = etapaData?.nome || `Etapa ${etapaOrdem}`;
                    const proximaEtapaNome = proximaEtapaData?.nome || 'próxima etapa';
                    const aprovadorNome = currentUser?.nome_completo || 'Coordenador';
                    const aprovadorCargo = currentUser?.cargo_slug?.replace(/_/g, ' ') || 'Coordenador';

                    const solicitanteId = aprovacaoInfo?.solicitanteId;
                    const { data: destinatarios } = await supabase
                        .from('colaboradores')
                        .select('id, nome_completo')
                        .eq('ativo', true)
                        .in('funcao', ['coord_administrativo', 'diretor', 'admin']);
                    
                    const idsParaNotificar = new Set<string>();
                    destinatarios?.forEach(d => idsParaNotificar.add(d.id));
                    if (solicitanteId) idsParaNotificar.add(solicitanteId);
                    
                    if (idsParaNotificar.size > 0) {
                        const notificacoes = Array.from(idsParaNotificar).map(id => ({
                            usuario_id: id,
                            titulo: `✅ ${etapaNome} Aprovada!`,
                            mensagem: `A ${etapaNome} de *${osDescricao}* para o cliente *${clienteNome}* foi aprovada por *${aprovadorNome}* - ${aprovadorCargo}. O processo agora pode seguir para a etapa de *${proximaEtapaNome}*.`,
                            link_acao: `/os/details-workflow/${osId}`,
                            tipo: 'aprovacao',
                            lida: false,
                        }));
                        
                        await supabase.from('notificacoes').insert(notificacoes);
                    }
                } catch (notifError) {
                    console.error('Erro ao enviar notificações (não bloqueante):', notifError);
                }
                
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
    }, [osId, etapaOrdem, verificarAprovacao, currentUser, aprovacaoInfo]);

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
                
                // ✅ NOTIFICAR: Coord Admin + Solicitante + Diretoria
                try {
                    // 1. Buscar dados para notificação
                    const { data: osData } = await supabase
                        .from('ordens_servico')
                        .select('codigo_os, cliente:clientes(nome_fantasia, nome_razao_social)')
                        .eq('id', osId)
                        .single();

                    const { data: etapaData } = await supabase
                        .from('os_etapas')
                        .select('nome')
                        .eq('os_id', osId)
                        .eq('ordem', Number(etapaOrdem))
                        .maybeSingle();
                    
                    const codigoOS = osData?.codigo_os || 'OS';
                    const clienteObj = osData?.cliente as any;
                    const clienteNome = clienteObj?.nome_fantasia || clienteObj?.nome_razao_social || 'Cliente';
                    const etapaNome = etapaData?.nome || `Etapa ${etapaOrdem}`;
                    const reprovadorNome = currentUser?.nome_completo || 'Coordenador';
                    const reprovadorCargo = currentUser?.cargo_slug?.replace(/_/g, ' ') || 'Coordenador';

                    const solicitanteId = aprovacaoInfo?.solicitanteId;
                    const { data: destinatarios } = await supabase
                        .from('colaboradores')
                        .select('id, nome_completo')
                        .eq('ativo', true)
                        .in('funcao', ['coord_administrativo', 'diretor', 'admin']);
                    
                    const idsParaNotificar = new Set<string>();
                    destinatarios?.forEach(d => idsParaNotificar.add(d.id));
                    if (solicitanteId) idsParaNotificar.add(solicitanteId);
                    
                    if (idsParaNotificar.size > 0) {
                        const notificacoes = Array.from(idsParaNotificar).map(id => ({
                            usuario_id: id,
                            titulo: `❌ Ajuste Necessário em ${etapaNome}`,
                            mensagem: `A ${etapaNome} de *${clienteNome}* - ${codigoOS} não foi aprovada por *${reprovadorNome}* - ${reprovadorCargo}.\n🚩 **Motivo:** ${motivo}`,
                            link_acao: `/os/details-workflow/${osId}`,
                            tipo: 'aprovacao',
                            lida: false,
                        }));
                        
                        await supabase.from('notificacoes').insert(notificacoes);
                    }
                } catch (notifError) {
                    console.error('Erro ao enviar notificações (não bloqueante):', notifError);
                }
                
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
    }, [osId, etapaOrdem, verificarAprovacao, currentUser, aprovacaoInfo]);

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
