/**
 * TimelineObra – Feed estilo Twitter de Relatórios Diários de Obra (RDOs).
 *
 * Orquestra:
 * - Verificação de configuração (useObraConfig)
 * - Lista de relatórios com filtros (useRelatorios)
 * - Detalhes expandidos via useRelatorioDetalhe
 * - Detalhes da obra no header (useObraDetalhes)
 *
 * Estados:
 * - Sem configuração → empty state "Vincular Diário de Obra"
 * - Com configuração mas sem relatórios → empty state com instrução
 * - Com relatórios → feed de cards
 */

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Activity,
  AlertCircle,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardList,
  CloudOff,
  Filter,
  HardHat,
  Loader2,
  RefreshCw,
  Settings,
  X,
} from 'lucide-react'
import {
  useObraConfig,
  useObraDetalhes,
  useRelatorios,
  useRelatorioDetalhe,
  useAutoSync,
  useSyncRelatorios,
  useSyncStatus,
  type RelatorioResumo,
  type RelatoriosFiltros,
} from '@/lib/hooks/use-diario-obra'
import { TimelineReportCard } from './timeline-report-card'
import { toast } from 'sonner'

// ==================== SUB-COMPONENTS ====================

/** Inline detail card that loads full RDO when it becomes visible */
function ExpandableReportItem({
  resumo,
  contratoId,
}: {
  resumo: RelatorioResumo
  contratoId: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  const { data: detalhe, isLoading } = useRelatorioDetalhe(
    contratoId,
    resumo._id,
    isOpen // Only fetches when expanded
  )

  if (!isOpen) {
    // Compact summary row
    return (
      <button
        type="button"
        className="w-full text-left group"
        onClick={() => setIsOpen(true)}
      >
        <Card className="border-border/60 hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  RDO — {new Date(resumo.data).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {resumo.usuario} • {resumo.status?.descricao || 'Sem status'}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] flex-shrink-0">
              Expandir
            </Badge>
          </CardContent>
        </Card>
      </button>
    )
  }

  // Expanded: show full card or loading
  if (isLoading || !detalhe) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-6 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-48" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        onClick={() => setIsOpen(false)}
        title="Recolher"
      >
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
      <TimelineReportCard relatorio={detalhe} />
    </div>
  )
}

// ==================== MAIN COMPONENT ====================

interface TimelineObraProps {
  contratoId: string
}

export function TimelineObra({ contratoId }: TimelineObraProps) {

  // 1. Check config
  const {
    data: config,
    isLoading: isLoadingConfig,
    error: configError,
  } = useObraConfig(contratoId)

  const hasConfig = !!config

  // 2. Obra details (only if configured)
  const {
    data: obraDetalhes,
  } = useObraDetalhes(contratoId, hasConfig)

  // 3. Filters
  const [showFilters, setShowFilters] = useState(false)
  const [filtros, setFiltros] = useState<RelatoriosFiltros>({
    ordem: 'desc',
    limite: 50,
  })

  // 4. Reports list (reads from local Supabase table)
  const {
    data: relatorios,
    isLoading: isLoadingRelatorios,
    error: relatoriosError,
    isFetching,
  } = useRelatorios(contratoId, filtros, hasConfig)

  // 5. Sync — auto-trigger on mount if data is stale
  const autoSync = useAutoSync(config)
  const manualSync = useSyncRelatorios()
  const { data: syncStatus } = useSyncStatus(config?.id)

  // Sync status helpers
  const isSyncing = autoSync.isPending || manualSync.isPending
  const lastSyncedAt = syncStatus?.lastSyncedAt
  const lastSyncLabel = useMemo(() => {
    if (!lastSyncedAt) return null
    const diff = Date.now() - new Date(lastSyncedAt).getTime()
    const mins = Math.floor(diff / 60_000)
    if (mins < 1) return 'agora'
    if (mins < 60) return `${mins} min atrás`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h atrás`
    return new Date(lastSyncedAt).toLocaleDateString('pt-BR')
  }, [lastSyncedAt])

  const handleManualSync = () => {
    if (!config || isSyncing) return
    manualSync.mutate(config.id, {
      onSuccess: (data) => {
        toast.success(`${data.relatoriosSynced} relatório(s) sincronizado(s).`)
      },
      onError: (error) => {
        toast.error(error.message || 'Erro na sincronização')
      },
    })
  }

  // Stats for header
  const stats = useMemo(() => {
    if (!obraDetalhes?.visaoGeral?.total) return null
    return obraDetalhes.visaoGeral.total
  }, [obraDetalhes])

  // ===== Loading state (checking config) =====
  if (isLoadingConfig) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  // ===== No config → Empty State =====
  if (!hasConfig) {
    return (
      <Card className="border-dashed border-2 border-border">
        <CardContent className="py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
            <Settings className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Diário de Obra não vinculado
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Para visualizar a timeline de relatórios diários, é necessário vincular
              este contrato a uma obra no sistema Diário de Obra.
            </p>
          </div>
          <div className="pt-2">
            <p className="text-xs text-muted-foreground">
              Configure a vinculação na tabela{' '}
              <code className="px-1 py-0.5 rounded bg-muted text-xs font-mono">
                diarios_obra_config
              </code>{' '}
              com o token de API e o ID da obra externa.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ===== Config error =====
  if (configError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao verificar configuração: {configError.message}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* ====== Obra Summary Header ====== */}
      <Card className="border-border rounded-xl shadow-sm bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                <HardHat className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {config.obra_nome || obraDetalhes?.nome || 'Obra vinculada'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Diário de Obra • {config.obra_externa_id.slice(0, 8)}…
                </p>
              </div>
            </div>

            {/* Quick stats */}
            {stats && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1" title="Relatórios">
                  <ClipboardList className="w-3.5 h-3.5" />
                  {stats.relatorios}
                </span>
                <span className="flex items-center gap-1" title="Fotos">
                  <Camera className="w-3.5 h-3.5" />
                  {stats.fotos}
                </span>
                <span className="flex items-center gap-1" title="Tarefas">
                  <Activity className="w-3.5 h-3.5" />
                  {stats.tarefasCronograma}
                </span>
              </div>
            )}

            {/* Sync status + Actions */}
            <div className="flex items-center gap-2">
              {/* Sync status indicator */}
              {lastSyncLabel && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-default">
                      {isSyncing ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : manualSync.isError || autoSync.isError ? (
                        <CloudOff className="w-3 h-3 text-destructive" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-success" />
                      )}
                      {isSyncing ? 'Sincronizando…' : `Sync ${lastSyncLabel}`}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {isSyncing
                      ? 'Sincronização em andamento…'
                      : `Última sincronização: ${lastSyncLabel}`
                    }
                  </TooltipContent>
                </Tooltip>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'border-primary text-primary' : ''}
              >
                <Filter className="w-3.5 h-3.5 mr-1.5" />
                Filtrar
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleManualSync}
                    disabled={isSyncing}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Sincronizar relatórios
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* ====== Filters Row ====== */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Data Início
                </label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={filtros.dataInicio || ''}
                  onChange={(e) =>
                    setFiltros((f) => ({ ...f, dataInicio: e.target.value || undefined }))
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Data Fim
                </label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={filtros.dataFim || ''}
                  onChange={(e) =>
                    setFiltros((f) => ({ ...f, dataFim: e.target.value || undefined }))
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Ordenação
                </label>
                <Select
                  value={filtros.ordem || 'desc'}
                  onValueChange={(v) =>
                    setFiltros((f) => ({ ...f, ordem: v as 'asc' | 'desc' }))
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Mais recentes primeiro</SelectItem>
                    <SelectItem value="asc">Mais antigos primeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ====== Loading Reports ====== */}
      {isLoadingRelatorios && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ====== Error State ====== */}
      {relatoriosError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar relatórios: {relatoriosError.message}
          </AlertDescription>
        </Alert>
      )}

      {/* ====== Empty State ====== */}
      {!isLoadingRelatorios && !relatoriosError && relatorios && relatorios.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Nenhum relatório encontrado
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {filtros.dataInicio || filtros.dataFim
                  ? 'Tente ajustar os filtros de data.'
                  : 'Os relatórios diários aparecerão aqui quando forem preenchidos no Diário de Obra.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ====== Reports Feed ====== */}
      {!isLoadingRelatorios && relatorios && relatorios.length > 0 && (
        <div className="space-y-3">
          {/* Count indicator */}
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-muted-foreground">
              {relatorios.length} relatório(s)
              {filtros.dataInicio && ` a partir de ${filtros.dataInicio}`}
              {filtros.dataFim && ` até ${filtros.dataFim}`}
            </p>
            {isFetching && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Timeline connector line */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border/50 hidden md:block" />

            {/* Cards */}
            <div className="space-y-3 md:pl-2">
              {relatorios.map((resumo) => (
                <ExpandableReportItem
                  key={resumo._id}
                  resumo={resumo}
                  contratoId={contratoId}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
