/**
 * Hook: use-dashboard-data
 * 
 * Hook central para dados do Dashboard com filtragem RBAC.
 * Retorna múltiplos conjuntos de dados baseados no cargo do usuário.
 * 
 * NOVO (v2): Inclui monitoramento setorial completo e visibilidade transversal
 * para OSs filhas em outros setores.
 * 
 * @see docs/technical/USUARIOS_SCHEMA.md
 */

import { useMemo } from 'react';
import { useOrdensServico } from './use-ordens-servico';
import { useAuth } from '../contexts/auth-context';
import { getPermissoes, type OrdemServico, type SetorSlug } from '../types';

// ============================================================
// TIPOS
// ============================================================

export interface OSComEtapa extends OrdemServico {
  /** Data do prazo da etapa atual */
  prazoEtapa?: string;
  /** Se o prazo está vencido */
  prazoVencido: boolean;
  /** Nome do responsável da etapa atual */
  responsavelEtapaNome?: string;
  /** ID do responsável da etapa atual */
  responsavelEtapaId?: string;
  /** Status da etapa atual */
  statusEtapa?: 'pendente' | 'em_andamento' | 'concluida' | 'bloqueada';
  /** Setor da OS (via tipo_os) */
  setorSlug?: SetorSlug;
  /** 🆕 Setor do responsável atual da etapa */
  responsavelSetorSlug?: SetorSlug;
  /** 🆕 Avatar do responsável */
  responsavel_avatar_url?: string;
  /** 🆕 ID da OS pai (para visibilidade transversal) */
  parentOsId?: string;
  /** 🆕 Setor da OS pai (para OSs filhas) */
  parentOsSetorSlug?: SetorSlug;
}

export interface DashboardData {
  /** OSs onde responsavel_id === user.id E etapa pendente/em_andamento */
  minhasPendencias: OSComEtapa[];
  
  /** OSs onde a etapa pertence ao setor do usuário */
  pendenciasSetor: OSComEtapa[];
  
  /** Todas as OSs ativas (apenas admin/diretor) */
  visaoGlobal: OSComEtapa[];
  
  /** 🆕 MONITORAMENTO SETORIAL: Todas as OSs do setor (independente de responsável) + OSs filhas externas */
  monitoramentoSetor: OSComEtapa[];
  
  /** 🆕 OSs FILHAS EXTERNAS: OSs cujo parent é do setor do usuário, mas que estão em outro setor */
  osFilhasExternas: OSComEtapa[];
  
  /** 🆕 AGUARDANDO TERCEIROS: OSs criadas pelo usuário que estão com outros */
  aguardandoTerceiros: OSComEtapa[];
  
  /** Contadores para KPIs */
  contadores: {
    urgentes: number;
    minhaVez: number;
    emAndamento: number;
    aguardando: number;
    totalSetor: number;
    totalGlobal: number;
    /** 🆕 OSs do setor que estão em outros setores */
    filhasExternas: number;
    /** 🆕 Total do monitoramento (setor + filhas externas) */
    totalMonitoramento: number;
  };
  
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Verifica se um prazo está vencido
 */
function isPrazoVencido(prazo: string | undefined | null): boolean {
  if (!prazo) return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataPrazo = new Date(prazo);
  dataPrazo.setHours(0, 0, 0, 0);
  return dataPrazo < hoje;
}

/**
 * Extrai dados da etapa atual de uma OS
 */
function extrairDadosEtapaAtual(os: any): Partial<OSComEtapa> {
  const etapas = os.os_etapas || [];
  if (!etapas.length) return { prazoVencido: false };
  
  // Ordenar por ordem crescente
  const etapasOrdenadas = [...etapas].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  
  // Buscar etapa em andamento ou primeira pendente
  const etapaAtual = etapasOrdenadas.find(e => e.status === 'em_andamento') 
    || etapasOrdenadas.find(e => e.status === 'pendente')
    || etapasOrdenadas[etapasOrdenadas.length - 1];
  
  if (!etapaAtual) return { prazoVencido: false };
  
  // Extrair setor do responsável da etapa (via join setores:setor_id)
  const responsavelSetorSlug = etapaAtual.responsavel?.setores?.slug 
    || etapaAtual.responsavel?.setor_slug  // fallback
    || etapaAtual.responsavel?.setor
    || undefined;
  
  return {
    prazoEtapa: etapaAtual.data_prazo || os.data_prazo,
    prazoVencido: isPrazoVencido(etapaAtual.data_prazo || os.data_prazo),
    responsavelEtapaNome: etapaAtual.responsavel?.nome_completo,
    responsavelEtapaId: etapaAtual.responsavel_id,
    statusEtapa: etapaAtual.status,
    responsavelSetorSlug: responsavelSetorSlug ? normalizarSetor(responsavelSetorSlug) : undefined,
  };
}

/**
 * Normaliza setor para comparação
 */
function normalizarSetor(setor: string | undefined | null): SetorSlug {
  if (!setor) return 'obras';
  const s = setor.toLowerCase().trim();
  if (s.includes('admin') || s.includes('comercial')) return 'administrativo';
  if (s.includes('assess')) return 'assessoria';
  if (s.includes('obra')) return 'obras';
  if (s.includes('diretor')) return 'diretoria';
  if (s.includes('ti')) return 'ti';
  return 'obras';
}

// ============================================================
// HOOK PRINCIPAL
// ============================================================

export function useDashboardData(): DashboardData {
  const { currentUser } = useAuth();
  const { ordensServico, loading, error, refetch } = useOrdensServico();
  
  const permissoes = getPermissoes(currentUser);
  const userId = currentUser?.id;
  const userSetorSlug = normalizarSetor(currentUser?.setor_slug || currentUser?.setor);
  
  // Processar OSs com dados de etapa
  const osProcessadas = useMemo<OSComEtapa[]>(() => {
    if (!ordensServico) return [];
    
    return ordensServico
      .filter(os => os.status_geral !== 'cancelado' && os.status_geral !== 'concluido')
      .map((os: any) => {
        const dadosEtapa = extrairDadosEtapaAtual(os);
        const setorOS = normalizarSetor(os.tipos_os?.setores?.slug || os.setor_nome);
        
        // Extrair setor da OS pai (se existir) para visibilidade transversal
        const parentOsId = os.parent_os_id || undefined;
        const parentOsSetorSlug = os.parent_os?.tipos_os?.setores?.slug 
          ? normalizarSetor(os.parent_os.tipos_os.setores.slug)
          : undefined;
        
        return {
          ...os,
          ...dadosEtapa,
          setorSlug: setorOS,
          parentOsId,
          parentOsSetorSlug,
          responsavel_avatar_url: os.responsavel?.avatar_url || os.responsavel_avatar_url,
        } as OSComEtapa;
      });
  }, [ordensServico]);
  
  // ========== MINHAS PENDÊNCIAS ==========
  // OSs onde responsavel_id === user.id E etapa pendente/em_andamento
  const minhasPendencias = useMemo<OSComEtapa[]>(() => {
    if (!userId) return [];
    
    return osProcessadas.filter(os => {
      // Responsável da etapa atual OU responsável da OS é o usuário
      const souResponsavel = os.responsavelEtapaId === userId || os.responsavel_id === userId;
      // Etapa está pendente ou em andamento
      const etapaAtiva = os.statusEtapa === 'pendente' || os.statusEtapa === 'em_andamento';
      
      return souResponsavel && etapaAtiva;
    });
  }, [osProcessadas, userId]);
  
  // ========== PENDÊNCIAS DO SETOR (legado - mantido para compatibilidade) ==========
  const pendenciasSetor = useMemo<OSComEtapa[]>(() => {
    if (permissoes.escopo_visao === 'proprio') return [];
    if (permissoes.escopo_visao === 'nenhuma') return [];
    
    return osProcessadas.filter(os => os.setorSlug === userSetorSlug);
  }, [osProcessadas, permissoes.escopo_visao, userSetorSlug]);
  
  // ========== 🆕 MONITORAMENTO SETORIAL COMPLETO ==========
  // TODAS as OSs do setor (independente de quem é o responsável atual)
  // + OSs filhas de OSs do setor que estão em outros setores
  const monitoramentoSetor = useMemo<OSComEtapa[]>(() => {
    // Apenas para coordenadores e gestores
    if (permissoes.escopo_visao === 'proprio' || permissoes.escopo_visao === 'nenhuma') {
      return [];
    }
    
    // 1. OSs diretamente do setor
    const osDoSetor = osProcessadas.filter(os => os.setorSlug === userSetorSlug);
    
    // 2. OSs filhas: OSs cujo PARENT pertence ao setor do usuário
    // (Ex: OS de Compras cujo parent é uma OS de Obras)
    // Primeiro, pegamos IDs de todas OSs do setor
    const idsOsDoSetor = new Set(osDoSetor.map(os => os.id));
    
    // Depois, procuramos OSs que têm parent_os_id apontando para alguma OS do setor
    const osFilhas = osProcessadas.filter(os => 
      os.parentOsId && 
      idsOsDoSetor.has(os.parentOsId) && 
      os.setorSlug !== userSetorSlug // Não está no setor do usuário
    );
    
    // 3. Combinar e deduplicar
    const todasOs = [...osDoSetor];
    for (const filha of osFilhas) {
      if (!todasOs.find(o => o.id === filha.id)) {
        todasOs.push(filha);
      }
    }
    
    return todasOs;
  }, [osProcessadas, permissoes.escopo_visao, userSetorSlug]);
  
  // ========== 🆕 OSs FILHAS EXTERNAS ==========
  // OSs do setor do usuário que estão atualmente em outros setores
  const osFilhasExternas = useMemo<OSComEtapa[]>(() => {
    if (permissoes.escopo_visao === 'proprio' || permissoes.escopo_visao === 'nenhuma') {
      return [];
    }
    
    // OSs do setor do usuário, mas cujo responsável atual está em outro setor
    return osProcessadas.filter(os => 
      os.setorSlug === userSetorSlug && 
      os.responsavelSetorSlug && 
      os.responsavelSetorSlug !== userSetorSlug
    );
  }, [osProcessadas, permissoes.escopo_visao, userSetorSlug]);
  
  // ========== 🆕 AGUARDANDO TERCEIROS ==========
  // OSs que o usuário criou ou delegou, mas que não estão mais sob sua responsabilidade
  const aguardandoTerceiros = useMemo<OSComEtapa[]>(() => {
    if (!userId) return [];
    
    return osProcessadas.filter(os => 
      os.criado_por_id === userId && 
      os.responsavel_id !== userId && 
      os.responsavelEtapaId !== userId &&
      os.statusEtapa !== 'concluida'
    );
  }, [osProcessadas, userId]);
  
  // ========== VISÃO GLOBAL ==========
  // Todas as OSs ativas (apenas admin/diretor)
  const visaoGlobal = useMemo<OSComEtapa[]>(() => {
    if (permissoes.escopo_visao !== 'global') return [];
    return osProcessadas;
  }, [osProcessadas, permissoes.escopo_visao]);
  
  // ========== CONTADORES ==========
  const contadores = useMemo(() => {
    // Urgentes: prazo vencido nas minhas pendências
    const urgentes = minhasPendencias.filter(os => os.prazoVencido).length;
    
    // Minha vez: pendentes (não em andamento) que são meus
    const minhaVez = minhasPendencias.filter(os => 
      os.statusEtapa === 'pendente' && !os.prazoVencido
    ).length;
    
    // Em andamento: já iniciei
    const emAndamento = minhasPendencias.filter(os => 
      os.statusEtapa === 'em_andamento'
    ).length;
    
    // Aguardando terceiros
    const aguardando = aguardandoTerceiros.length;
    
    // 🆕 Filhas externas
    const filhasExternas = osFilhasExternas.length;
    
    // 🆕 Total monitoramento
    const totalMonitoramento = monitoramentoSetor.length;
    
    return {
      urgentes,
      minhaVez,
      emAndamento,
      aguardando,
      totalSetor: pendenciasSetor.length,
      totalGlobal: visaoGlobal.length,
      filhasExternas,
      totalMonitoramento,
    };
  }, [minhasPendencias, aguardandoTerceiros, pendenciasSetor, visaoGlobal, osFilhasExternas, monitoramentoSetor]);
  
  return {
    minhasPendencias,
    pendenciasSetor,
    visaoGlobal,
    monitoramentoSetor,
    osFilhasExternas,
    aguardandoTerceiros,
    contadores,
    loading,
    error: error as Error | null,
    refetch,
  };
}
