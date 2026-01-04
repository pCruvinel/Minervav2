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
import { useApi } from './use-api';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '../contexts/auth-context';
import { getPermissoes, type OrdemServico, type SetorSlug, normalizeStatusOS } from '../types';

// ============================================================
// TIPOS
// ============================================================

export interface OSComEtapa extends OrdemServico {
  /** Data do prazo da etapa atual */
  prazoEtapa?: string;
  /** Se o prazo está vencido (agora mapeado de is_atrasado) */
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

  // Novos campos da View
  status_situacao?: string;
  is_atrasado?: boolean;
  is_alerta_prazo?: boolean;
  is_em_validacao?: boolean;
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
  
  // Fetch direto da view otimizada
  const { data: rawData, loading, error, refetch } = useApi(async () => {
    const { data, error } = await supabase
      .from('vw_os_status_completo')
      .select('*')
      .order('data_entrada', { ascending: false });
      
    if (error) throw error;
    return data;
  });

  const permissoes = getPermissoes(currentUser);
  const userId = currentUser?.id;
  const userSetorSlug = normalizarSetor(currentUser?.setor_slug || currentUser?.setor);

  // Mapear dados da View para objeto OSComEtapa
  const osProcessadas = useMemo<OSComEtapa[]>(() => {
    if (!rawData) return [];

    return rawData.map((row: any) => {
      // Normalização de setor
      const setorOS = normalizarSetor(row.setor_slug);
      const parentOsSetorSlug = row.parent_os_setor_slug 
        ? normalizarSetor(row.parent_os_setor_slug)
        : undefined;

      // Construir objeto compatível com OrdemServico
      const os: OSComEtapa = {
        // Campos Core
        id: row.id,
        codigo: row.codigo_os,
        codigo_os: row.codigo_os,
        status_geral: row.status_geral,
        descricao: row.descricao,
        data_entrada: row.data_entrada,
        data_prazo: row.data_prazo,
        data_conclusao: row.data_conclusao,
        responsavel_id: row.responsavel_id,
        cliente_id: row.cliente_id,
        tipo_os_id: row.tipo_os_id,
        
        // Campos View (Flattened)
        cliente_nome: row.cliente_nome || 'Cliente não informado',
        tipo_os_nome: row.tipo_os_nome || 'Tipo não informado',
        responsavel_nome: row.responsavel_nome || 'Não atribuído',
        responsavel_avatar_url: row.responsavel_avatar_url,
        setor_nome: row.setor_nome || '-',
        
        // Campos Computados da View (Status Situacional)
        status_situacao: row.status_situacao,
        is_atrasado: row.is_atrasado,
        is_alerta_prazo: row.is_alerta_prazo,
        is_em_validacao: row.is_em_validacao,
        
        // Campos Legacy/Compatibilidade
        titulo: row.descricao || row.tipo_os_nome || 'Ordem de Serviço',
        status: normalizeStatusOS(row.status_geral),
        criadoEm: row.data_entrada,
        dataInicio: row.data_entrada,
        dataPrazo: row.data_prazo,

        // Objetos Aninhados (para compatibilidade com interface OrdemServico)
        cliente: {
            id: row.cliente_id,
            nome: row.cliente_nome || 'Cliente não informado',
            tipo: row.cliente_tipo,
            endereco: {
                cidade: row.cliente_cidade,
                uf: row.cliente_uf
            }
        },
        tipoOS: {
            id: row.tipo_os_id,
            nome: row.tipo_os_nome,
            codigo: row.tipo_os_codigo,
            setor: setorOS
        },
        responsavel: row.responsavel_id ? {
            id: row.responsavel_id,
            nome: row.responsavel_nome,
            avatar: row.responsavel_avatar_url
        } : undefined,

        // Dados Etapa (já computados na view!)
        etapaAtual: {
            numero: row.etapa_ativa_ordem || 0,
            titulo: row.etapa_ativa_nome || 'Sem etapa',
            status: row.etapa_status
        },
        
        // Campos específicos de OSComEtapa
        prazoEtapa: row.data_prazo, // View usa data_prazo geral como base para atraso
        prazoVencido: row.is_atrasado,
        responsavelEtapaId: row.etapa_responsavel_id,
        responsavelEtapaNome: row.etapa_responsavel_nome,
        statusEtapa: row.etapa_status,
        setorSlug: setorOS,
        responsavelSetorSlug: setorOS, // Assumindo mesmo setor por enquanto (simplificação)
        
        // Visibilidade Transversal
        parentOsId: row.parent_os_id,
        parentOsSetorSlug
      } as any; // Cast as any para evitar erros de tipagem estrita em campos legacy opcionais

      return os;
    });
  }, [rawData]);

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
