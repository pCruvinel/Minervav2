/**
 * Hook: use-dashboard-data
 * 
 * Hook central para dados do Dashboard com filtragem RBAC.
 * Retorna 3 conjuntos de dados baseados no cargo do usuário.
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
}

export interface DashboardData {
  /** OSs onde responsavel_id === user.id E etapa pendente/em_andamento */
  minhasPendencias: OSComEtapa[];
  
  /** OSs onde a etapa pertence ao setor do usuário */
  pendenciasSetor: OSComEtapa[];
  
  /** Todas as OSs ativas (apenas admin/diretor) */
  visaoGlobal: OSComEtapa[];
  
  /** Contadores para KPIs */
  contadores: {
    urgentes: number;
    minhaVez: number;
    emAndamento: number;
    aguardando: number;
    totalSetor: number;
    totalGlobal: number;
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
  
  return {
    prazoEtapa: etapaAtual.data_prazo || os.data_prazo,
    prazoVencido: isPrazoVencido(etapaAtual.data_prazo || os.data_prazo),
    responsavelEtapaNome: etapaAtual.responsavel?.nome_completo,
    responsavelEtapaId: etapaAtual.responsavel_id,
    statusEtapa: etapaAtual.status,
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
        
        return {
          ...os,
          ...dadosEtapa,
          setorSlug: setorOS,
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
  
  // ========== PENDÊNCIAS DO SETOR ==========
  // OSs onde a etapa pertence ao setor do usuário
  const pendenciasSetor = useMemo<OSComEtapa[]>(() => {
    // Se escopo é 'proprio', retorna apenas minhasPendencias
    if (permissoes.escopo_visao === 'proprio') return [];
    
    // Se escopo é 'nenhuma', retorna vazio
    if (permissoes.escopo_visao === 'nenhuma') return [];
    
    // Se escopo é 'global', retorna todas (mas vamos usar visaoGlobal para isso)
    if (permissoes.escopo_visao === 'global') {
      return osProcessadas.filter(os => os.setorSlug === userSetorSlug);
    }
    
    // Escopo 'setorial': filtra pelo setor do usuário
    return osProcessadas.filter(os => os.setorSlug === userSetorSlug);
  }, [osProcessadas, permissoes.escopo_visao, userSetorSlug]);
  
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
    
    // Aguardando terceiros: criei ou participei mas não sou mais responsável
    const aguardando = osProcessadas.filter(os => 
      os.criado_por_id === userId && 
      os.responsavel_id !== userId && 
      os.responsavelEtapaId !== userId
    ).length;
    
    return {
      urgentes,
      minhaVez,
      emAndamento,
      aguardando,
      totalSetor: pendenciasSetor.length,
      totalGlobal: visaoGlobal.length,
    };
  }, [minhasPendencias, osProcessadas, pendenciasSetor, visaoGlobal, userId]);
  
  return {
    minhasPendencias,
    pendenciasSetor,
    visaoGlobal,
    contadores,
    loading,
    error: error as Error | null,
    refetch,
  };
}
