/**
 * Hook: useAuditLogs
 * 
 * Fornece logs de auditoria com paginação:
 * - Combina audit_log + os_atividades
 * - Suporta filtros por tipo, data, usuário
 * - Paginação para performance
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';

// ============================================================
// TIPOS
// ============================================================

export type AuditActionType = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'status_change' 
  | 'etapa_avanco' 
  | 'delegacao'
  | 'upload'
  | 'other';

export interface AuditEntry {
  id: string;
  timestamp: string;
  user_id: string;
  user_nome: string;
  user_avatar?: string;
  action: AuditActionType;
  action_label: string;
  entity_type: string; // 'os', 'cliente', 'colaborador', etc
  entity_id: string;
  entity_label: string; // Ex: "OS-2024-001"
  details: Record<string, any> | null;
  source: 'audit_log' | 'os_atividades';
}

export interface AuditFilters {
  action?: AuditActionType;
  entity_type?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
}

interface UseAuditLogsReturn {
  logs: AuditEntry[];
  loading: boolean;
  error: Error | null;
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  setPage: (page: number) => void;
  setFilters: (filters: AuditFilters) => void;
  filters: AuditFilters;
  refetch: () => void;
}

// ============================================================
// CONSTANTES
// ============================================================

const PAGE_SIZE = 50;

// Mapeamento de ações para labels amigáveis
const ACTION_LABELS: Record<string, string> = {
  'create': 'Criação',
  'update': 'Atualização',
  'delete': 'Exclusão',
  'status_change': 'Mudança de Status',
  'etapa_avanco': 'Avanço de Etapa',
  'delegacao': 'Delegação',
  'upload': 'Upload de Arquivo',
  'other': 'Outra Ação'
};

// ============================================================
// HOOK
// ============================================================

export function useAuditLogs(): UseAuditLogsReturn {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<AuditFilters>({});

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * PAGE_SIZE;
      const allLogs: AuditEntry[] = [];

      // 1. Buscar de audit_log
      try {
        let auditQuery = supabase
          .from('audit_log')
          .select(`
            id,
            created_at,
            usuario_id,
            acao,
            tabela_afetada,
            registro_id_afetado,
            dados_antigos,
            dados_novos,
            colaboradores!audit_log_usuario_id_fkey(nome_completo, avatar_url)
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);

        // Aplicar filtros
        if (filters.start_date) {
          auditQuery = auditQuery.gte('created_at', filters.start_date);
        }
        if (filters.end_date) {
          auditQuery = auditQuery.lte('created_at', filters.end_date);
        }
        if (filters.user_id) {
          auditQuery = auditQuery.eq('usuario_id', filters.user_id);
        }

        const { data: auditData, count: auditCount } = await auditQuery;

        if (auditData) {
          auditData.forEach(entry => {
            allLogs.push({
              id: entry.id,
              timestamp: entry.created_at,
              user_id: entry.usuario_id,
              user_nome: entry.colaboradores?.nome_completo || 'Sistema',
              user_avatar: entry.colaboradores?.avatar_url,
              action: mapAction(entry.acao),
              action_label: ACTION_LABELS[mapAction(entry.acao)] || entry.acao,
              entity_type: entry.tabela_afetada || 'sistema',
              entity_id: entry.registro_id_afetado || '',
              entity_label: formatEntityLabel(entry.tabela_afetada, entry.registro_id_afetado, entry.dados_novos),
              details: { old: entry.dados_antigos, new: entry.dados_novos },
              source: 'audit_log'
            });
          });
          setTotalCount(auditCount || 0);
        }
      } catch (auditErr) {
        console.warn('[useAuditLogs] audit_log não disponível:', auditErr);
      }

      // 2. Buscar de os_atividades
      try {
        let atividadesQuery = supabase
          .from('os_atividades')
          .select(`
            id,
            created_at,
            usuario_id,
            tipo_atividade,
            descricao,
            dados_adicionais,
            os_id,
            colaboradores!os_atividades_usuario_id_fkey(nome_completo, avatar_url),
            ordens_servico!os_atividades_os_id_fkey(codigo_os)
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);

        // Aplicar filtros
        if (filters.start_date) {
          atividadesQuery = atividadesQuery.gte('created_at', filters.start_date);
        }
        if (filters.end_date) {
          atividadesQuery = atividadesQuery.lte('created_at', filters.end_date);
        }
        if (filters.user_id) {
          atividadesQuery = atividadesQuery.eq('usuario_id', filters.user_id);
        }

        const { data: atividadesData, count: atividadesCount } = await atividadesQuery;

        if (atividadesData) {
          atividadesData.forEach(entry => {
            allLogs.push({
              id: `ativ-${entry.id}`,
              timestamp: entry.created_at,
              user_id: entry.usuario_id,
              user_nome: entry.colaboradores?.nome_completo || 'Sistema',
              user_avatar: entry.colaboradores?.avatar_url,
              action: mapAtividadeAction(entry.tipo_atividade),
              action_label: entry.descricao || entry.tipo_atividade,
              entity_type: 'os',
              entity_id: entry.os_id,
              entity_label: entry.ordens_servico?.codigo_os || `OS ${entry.os_id.slice(0, 8)}`,
              details: entry.dados_adicionais,
              source: 'os_atividades'
            });
          });
          
          // Somar totais
          setTotalCount(prev => prev + (atividadesCount || 0));
        }
      } catch (atividadesErr) {
        console.warn('[useAuditLogs] os_atividades não disponível:', atividadesErr);
      }

      // 3. Ordenar por timestamp
      allLogs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setLogs(allLogs.slice(0, PAGE_SIZE));
    } catch (err) {
      console.error('[useAuditLogs] Erro:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    error,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      totalCount,
      totalPages: Math.ceil(totalCount / PAGE_SIZE)
    },
    setPage,
    setFilters,
    filters,
    refetch: fetchLogs
  };
}

// ============================================================
// HELPERS
// ============================================================

function mapAction(action: string): AuditActionType {
  switch (action?.toLowerCase()) {
    case 'insert':
    case 'create':
      return 'create';
    case 'update':
      return 'update';
    case 'delete':
      return 'delete';
    default:
      return 'other';
  }
}

function mapAtividadeAction(tipo: string): AuditActionType {
  switch (tipo?.toLowerCase()) {
    case 'status_change':
    case 'mudanca_status':
      return 'status_change';
    case 'etapa_avanco':
    case 'avanco_etapa':
      return 'etapa_avanco';
    case 'delegacao':
      return 'delegacao';
    case 'upload':
    case 'anexo':
      return 'upload';
    case 'create':
    case 'criacao':
      return 'create';
    default:
      return 'other';
  }
}

function formatEntityLabel(tableName: string | null, recordId: string | null, newData: any): string {
  if (!tableName || !recordId) return 'Sistema';
  
  if (tableName === 'ordens_servico' && newData?.codigo_os) {
    return newData.codigo_os;
  }
  if (tableName === 'clientes' && newData?.nome) {
    return newData.nome;
  }
  if (tableName === 'colaboradores' && newData?.nome_completo) {
    return newData.nome_completo;
  }
  
  const prefix = tableName.charAt(0).toUpperCase();
  return `${prefix}-${recordId.slice(0, 8)}`;
}
