/**
 * Hooks for the Diário de Obra integration.
 *
 * Architecture: LOCAL-FIRST reads from Supabase tables with background sync.
 *
 * - useObraConfig         → reads diarios_obra_config (unchanged)
 * - useRelatorios         → reads from local diarios_obra_relatorios table
 * - useRelatorioDetalhe   → reads local detalhe JSONB; triggers sync if null
 * - useObraDetalhes       → calls proxy (infrequent, kept live)
 * - useTarefas            → calls proxy (infrequent, kept live)
 * - useSyncRelatorios     → mutation: triggers background sync
 * - useSyncRelatorioDetalhe → mutation: fetches + stores single detail
 * - useSyncStatus         → reads diarios_obra_sync_log
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase-client'

// ==================== TYPES ====================

/** Configuration linking a contract to an external obra */
export interface DiarioObraConfig {
  id: string
  api_token: string
  obra_externa_id: string
  contrato_id: string
  obra_nome: string | null
  ativo: boolean
  last_synced_at: string | null
  sync_enabled: boolean
  created_at: string
  updated_at: string
}

/** Locally synced RDO row */
export interface RelatorioLocal {
  id: string
  config_id: string
  contrato_id: string
  relatorio_externo_id: string
  data: string
  usuario_nome: string | null
  status_descricao: string | null
  clima_manha: string | null
  clima_tarde: string | null
  clima_noite: string | null
  detalhe: RelatorioDetalhe | null
  detalhe_synced_at: string | null
  synced_at: string
}

/** External API obra details */
export interface ObraDetalhes {
  _id: string
  nome: string
  endereco?: string
  status?: { descricao: string }
  prazo?: { contratual: number; decorrido: number }
  dataInicio?: string
  usuarioResponsavel?: { nome: string }
  visaoGeral?: {
    total: {
      relatorios: number
      fotos: number
      videos: number
      anexos: number
      tarefasCronograma: number
    }
  }
}

/** RDO list item (summary) — shaped for backward-compat with existing components */
export interface RelatorioResumo {
  _id: string
  data: string
  usuario: string
  status: { descricao: string }
  clima?: { manha?: string; tarde?: string; noite?: string }
}

/** Full RDO detail */
export interface RelatorioDetalhe {
  _id: string
  data: string
  usuario: { nome: string; email?: string }
  status: { descricao: string }
  clima: { manha?: string; tarde?: string; noite?: string }
  maoDeObra: Array<{
    descricao: string
    quantidade: number
    categoria?: { descricao: string }
  }>
  equipamentos: Array<{
    descricao: string
    quantidade: number
    condicao?: string
  }>
  atividades: string
  ocorrencias: Array<{
    tipo: string
    descricao: string
  }>
  controleDeMaterial: Array<{
    descricao: string
    quantidade: number
    unidade?: string
  }>
  galeriaDeFotos: Array<{
    id: string
    arquivo: string
    descricao?: string
    url: string
  }>
  galeriaDeVideos: Array<{
    id: string
    arquivo: string
    url: string
    urlFoto?: string
    duracao?: string
    descricao?: string | null
  }>
  anexos: Array<{
    arquivo: string
    descricao?: string
    url: string
    extensao?: string
  }>
  comentarios?: string
  linkPdf?: string
}

/** Task tree node */
export interface TarefaCronograma {
  _id: string
  item: string
  descricao: string
  porcentagem: number
  subItens?: TarefaCronograma[]
  controleDeProducao?: { unidade: string; total: number }
}

/** Filters for the relatorios list */
export interface RelatoriosFiltros {
  limite?: number
  usuarioId?: string
  statusId?: number
  modeloDeRelatorioId?: string
  dataInicio?: string // YYYY-MM-DD
  dataFim?: string // YYYY-MM-DD
  ordem?: 'asc' | 'desc'
}

/** Sync log entry */
export interface SyncLogEntry {
  id: string
  config_id: string
  sync_type: string
  status: string
  relatorios_synced: number
  error_message: string | null
  started_at: string
  completed_at: string | null
}

/** Sync status data */
export interface SyncStatusData {
  lastSyncedAt: string | null
  syncEnabled: boolean
  recentLogs: SyncLogEntry[]
}

// ==================== CACHE CONFIG ====================

const STALE_TIME = 5 * 60 * 1000 // 5 minutes
const GC_TIME = 30 * 60 * 1000 // 30 minutes
const AUTO_SYNC_INTERVAL_MS = 60 * 60 * 1000 // 1 hour — auto-sync if data is older

// ==================== PROXY HELPER (for obra details + tarefas) ====================

async function callProxy<T>(path: string): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData?.session?.access_token

  if (!token) {
    throw new Error('Usuário não autenticado')
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const url = `${supabaseUrl}/functions/v1/diario-obra-proxy${path}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (response.status === 429) {
    const errorData = await response.json()
    throw new Error(
      `Rate limit excedido. Tente novamente em ${Math.ceil((errorData.retryAfterMs || 60000) / 1000)}s.`
    )
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Erro na API: ${response.status}`)
  }

  const result = await response.json()
  if (!result.success) {
    throw new Error(result.message || result.error || 'Erro desconhecido')
  }

  return result.data as T
}

// ==================== SYNC PROXY HELPER ====================

async function callSyncEndpoint<T>(
  method: 'GET' | 'POST',
  path: string
): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData?.session?.access_token

  if (!token) {
    throw new Error('Usuário não autenticado')
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const url = `${supabaseUrl}/functions/v1/diario-obra-sync${path}`

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || errorData.error || `Erro no sync: ${response.status}`
    )
  }

  const result = await response.json()
  if (!result.success) {
    throw new Error(result.message || result.error || 'Erro desconhecido')
  }

  return result.data as T
}

// ==================== LOCAL → RESUMO MAPPER ====================

function localToResumo(local: RelatorioLocal): RelatorioResumo {
  return {
    _id: local.relatorio_externo_id,
    data: local.data,
    usuario: local.usuario_nome || 'Sem autor',
    status: { descricao: local.status_descricao || 'Sem status' },
    clima: {
      manha: local.clima_manha || undefined,
      tarde: local.clima_tarde || undefined,
      noite: local.clima_noite || undefined,
    },
  }
}

// ==================== HOOKS ====================

/**
 * Checks if a contract has a linked Diário de Obra configuration.
 * Queries Supabase directly (no proxy needed).
 */
export function useObraConfig(contratoId: string | undefined) {
  return useQuery({
    queryKey: ['diario-obra-config', contratoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diarios_obra_config')
        .select('*')
        .eq('contrato_id', contratoId!)
        .eq('ativo', true)
        .maybeSingle()

      if (error) throw error
      return data as DiarioObraConfig | null
    },
    enabled: !!contratoId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}

/**
 * Lists RDOs from local Supabase table (instant, no external API call).
 * Supports client-side filtering by date range and ordering.
 * Triggers background sync if data is stale.
 */
export function useRelatorios(
  contratoId: string | undefined,
  filtros?: RelatoriosFiltros,
  enabled = true
) {
  return useQuery({
    queryKey: ['diario-obra-relatorios', contratoId, filtros],
    queryFn: async () => {
      let query = supabase
        .from('diarios_obra_relatorios')
        .select('*')
        .eq('contrato_id', contratoId!)

      // Apply date filters
      if (filtros?.dataInicio) {
        query = query.gte('data', filtros.dataInicio)
      }
      if (filtros?.dataFim) {
        query = query.lte('data', filtros.dataFim)
      }

      // Ordering
      const ascending = filtros?.ordem === 'asc'
      query = query.order('data', { ascending })

      // Limit
      if (filtros?.limite) {
        query = query.limit(filtros.limite)
      }

      const { data, error } = await query
      if (error) throw error

      // Map local rows to RelatorioResumo shape for backward compat
      return (data as RelatorioLocal[]).map(localToResumo)
    },
    enabled: !!contratoId && enabled,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}

/**
 * Fetches the full detail of a single RDO.
 * Reads from local `detalhe` JSONB first. If null, triggers detail sync.
 */
export function useRelatorioDetalhe(
  contratoId: string | undefined,
  relatorioExternoId: string | undefined,
  enabled = true
) {
  const syncTriggeredRef = useRef(false)

  const query = useQuery({
    queryKey: ['diario-obra-relatorio', contratoId, relatorioExternoId],
    queryFn: async () => {
      // 1. Try to read local detail
      const { data, error } = await supabase
        .from('diarios_obra_relatorios')
        .select('detalhe, config_id')
        .eq('contrato_id', contratoId!)
        .eq('relatorio_externo_id', relatorioExternoId!)
        .maybeSingle()

      if (error) throw error

      // 2. If detail exists locally, return it
      if (data?.detalhe) {
        return data.detalhe as RelatorioDetalhe
      }

      // 3. If no detail yet, fetch via sync endpoint
      if (data?.config_id) {
        const detail = await callSyncEndpoint<RelatorioDetalhe>(
          'POST',
          `/sync/${data.config_id}/detail/${relatorioExternoId}`
        )
        return detail
      }

      // 4. Fallback: try direct proxy (for RDOs not yet synced locally)
      return callProxy<RelatorioDetalhe>(
        `/obra/${contratoId}/relatorios/${relatorioExternoId}`
      )
    },
    enabled: !!contratoId && !!relatorioExternoId && enabled,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })

  // Reset sync trigger when relatorio changes
  useEffect(() => {
    syncTriggeredRef.current = false
  }, [relatorioExternoId])

  return query
}

/**
 * Fetches the external obra details for a given contract.
 * Kept as live proxy call (infrequent, data changes rarely).
 */
export function useObraDetalhes(
  contratoId: string | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: ['diario-obra-detalhes', contratoId],
    queryFn: () => callProxy<ObraDetalhes>(`/obra/${contratoId}`),
    enabled: !!contratoId && enabled,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}

/**
 * Fetches the task/schedule tree for a contract's obra.
 * Kept as live proxy call (infrequent).
 */
export function useTarefas(
  contratoId: string | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: ['diario-obra-tarefas', contratoId],
    queryFn: () => callProxy<TarefaCronograma[]>(`/obra/${contratoId}/tarefas`),
    enabled: !!contratoId && enabled,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}

// ==================== SYNC HOOKS ====================

/**
 * Mutation that triggers a background sync for a config.
 * Invalidates the relatorios query on success.
 */
export function useSyncRelatorios() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (configId: string) => {
      return callSyncEndpoint<{
        syncLogId: string
        syncType: string
        relatoriosSynced: number
        totalFromApi: number
      }>('POST', `/sync/${configId}`)
    },
    onSuccess: () => {
      // Invalidate all relatorio queries to refetch from local table
      queryClient.invalidateQueries({
        queryKey: ['diario-obra-relatorios'],
      })
      // Invalidate sync status
      queryClient.invalidateQueries({
        queryKey: ['diario-obra-sync-status'],
      })
    },
  })
}

/**
 * Mutation that fetches and stores a single RDO detail via the sync endpoint.
 */
export function useSyncRelatorioDetalhe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      configId,
      relatorioExternoId,
    }: {
      configId: string
      relatorioExternoId: string
      contratoId: string
    }) => {
      return callSyncEndpoint<RelatorioDetalhe>(
        'POST',
        `/sync/${configId}/detail/${relatorioExternoId}`
      )
    },
    onSuccess: (data, variables) => {
      // Update the specific detail query cache
      queryClient.setQueryData(
        ['diario-obra-relatorio', variables.contratoId, variables.relatorioExternoId],
        data
      )
    },
  })
}

/**
 * Gets the last sync status for a config.
 * Reads from the sync_log table via the sync Edge Function.
 */
export function useSyncStatus(configId: string | undefined) {
  return useQuery({
    queryKey: ['diario-obra-sync-status', configId],
    queryFn: async () => {
      // Read directly from Supabase for faster response
      const { data: logs, error: logError } = await supabase
        .from('diarios_obra_sync_log')
        .select('*')
        .eq('config_id', configId!)
        .order('started_at', { ascending: false })
        .limit(5)

      if (logError) throw logError

      const { data: config, error: configError } = await supabase
        .from('diarios_obra_config')
        .select('last_synced_at, sync_enabled')
        .eq('id', configId!)
        .single()

      if (configError) throw configError

      return {
        lastSyncedAt: config?.last_synced_at || null,
        syncEnabled: config?.sync_enabled ?? true,
        recentLogs: (logs || []) as SyncLogEntry[],
      } as SyncStatusData
    },
    enabled: !!configId,
    staleTime: 30_000, // 30 seconds — sync status should be fairly fresh
    gcTime: GC_TIME,
  })
}

/**
 * Hook that auto-triggers sync when data is stale.
 * Should be called once per TimelineObra instance.
 */
export function useAutoSync(config: DiarioObraConfig | null | undefined) {
  const syncMutation = useSyncRelatorios()
  const hasTriggered = useRef(false)

  const triggerSyncIfNeeded = useCallback(() => {
    if (!config || hasTriggered.current || syncMutation.isPending) return

    const lastSynced = config.last_synced_at
      ? new Date(config.last_synced_at).getTime()
      : 0
    const now = Date.now()

    // Sync if never synced OR data is older than AUTO_SYNC_INTERVAL
    if (!lastSynced || now - lastSynced > AUTO_SYNC_INTERVAL_MS) {
      hasTriggered.current = true
      syncMutation.mutate(config.id)
    }
  }, [config, syncMutation])

  useEffect(() => {
    triggerSyncIfNeeded()
  }, [triggerSyncIfNeeded])

  return syncMutation
}
