/**
 * TimelineReportCard – Card individual de RDO no feed da Timeline.
 *
 * Twitter-inspired layout:
 * - Avatar de iniciais + nome do autor + data relativa
 * - Clima do dia (ícones ☀️🌧️☁️)
 * - Atividades (texto expandível)
 * - Mão de obra e equipamentos (tags compactas)
 * - Ocorrências (alertas)
 * - Galeria de fotos
 * - Link para PDF
 * - Status badge
 */

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ChevronDown,
  ChevronUp,
  FileDown,
  HardHat,
  Wrench,
  AlertTriangle,
  Package,
  Video,
  CloudSun,
  Sun,
  CloudRain,
  Cloud,
  CloudLightning,
  CloudDrizzle,
  Moon,
} from 'lucide-react'
import { TimelinePhotoGallery } from './timeline-photo-gallery'
import type { RelatorioDetalhe } from '@/lib/hooks/use-diario-obra'

// ==================== HELPERS ====================

/** Returns relative time string in Portuguese */
function relativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `${diffDays} dias atrás`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem. atrás`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`
  return `${Math.floor(diffDays / 365)} anos atrás`
}

/** Formats a date string to DD/MM/YYYY */
function formatDateBR(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Returns initials from a name */
function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

/** Maps weather strings from the API to icons */
function WeatherIcon({ condition, className }: { condition?: string; className?: string }) {
  if (!condition) return null
  const c = condition.toLowerCase()
  if (c.includes('sol') || c.includes('limpo') || c.includes('ensolarado'))
    return <Sun className={className} />
  if (c.includes('chuva forte') || c.includes('tempest'))
    return <CloudLightning className={className} />
  if (c.includes('chuva') || c.includes('chuvoso'))
    return <CloudRain className={className} />
  if (c.includes('garoa') || c.includes('chuvisco'))
    return <CloudDrizzle className={className} />
  if (c.includes('nublado') || c.includes('encoberto'))
    return <Cloud className={className} />
  if (c.includes('parcial'))
    return <CloudSun className={className} />
  return <Cloud className={className} />
}

/** Status → color map */
const STATUS_COLORS: Record<string, string> = {
  'Aprovado': 'bg-success/10 text-success border-success/20',
  'Em revisão': 'bg-warning/10 text-warning border-warning/20',
  'Revisado': 'bg-info/10 text-info border-info/20',
  'Aguardando revisão': 'bg-warning/10 text-warning border-warning/20',
}

// ==================== COMPONENT ====================

interface TimelineReportCardProps {
  relatorio: RelatorioDetalhe
}

export function TimelineReportCard({ relatorio }: TimelineReportCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [materiaisExpanded, setMateriaisExpanded] = useState(false)

  const initials = useMemo(() => getInitials(relatorio.usuario.nome), [relatorio.usuario.nome])
  const relative = useMemo(() => relativeTime(relatorio.data), [relatorio.data])

  const hasContent = !!(
    relatorio.atividades ||
    relatorio.maoDeObra?.length ||
    relatorio.equipamentos?.length ||
    relatorio.galeriaDeFotos?.length ||
    relatorio.ocorrencias?.length
  )

  const statusColor =
    STATUS_COLORS[relatorio.status?.descricao] || 'bg-muted text-muted-foreground border-border'

  return (
    <Card className="border-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-5 pb-4 space-y-3">
        {/* ====== Header: Avatar + Author + Date + Status ====== */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">{initials}</span>
            </div>

            {/* Name + Date */}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {relatorio.usuario.nome}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span title={formatDateBR(relatorio.data)}>{relative}</span>
                <span>•</span>
                <span>{formatDateBR(relatorio.data)}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <Badge variant="outline" className={`text-xs flex-shrink-0 ${statusColor}`}>
            {relatorio.status?.descricao || 'Sem status'}
          </Badge>
        </div>

        {/* ====== Weather ====== */}
        {relatorio.clima && (relatorio.clima.manha || relatorio.clima.tarde || relatorio.clima.noite) && (
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-info/5 border border-info/10 text-xs text-info">
            {relatorio.clima.manha && (
              <span className="flex items-center gap-1" title={`Manhã: ${relatorio.clima.manha}`}>
                <WeatherIcon condition={relatorio.clima.manha} className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Manhã</span>
              </span>
            )}
            {relatorio.clima.tarde && (
              <span className="flex items-center gap-1" title={`Tarde: ${relatorio.clima.tarde}`}>
                <WeatherIcon condition={relatorio.clima.tarde} className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tarde</span>
              </span>
            )}
            {relatorio.clima.noite && (
              <span className="flex items-center gap-1" title={`Noite: ${relatorio.clima.noite}`}>
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Noite</span>
              </span>
            )}
          </div>
        )}

        {/* ====== Activities Text ====== */}
        {relatorio.atividades && (
          <div className="text-sm text-foreground leading-relaxed">
            {relatorio.atividades.length > 300 && !expanded ? (
              <>
                <p className="whitespace-pre-wrap">{relatorio.atividades.slice(0, 300)}…</p>
                <button
                  type="button"
                  className="text-primary text-xs font-medium mt-1 hover:underline"
                  onClick={() => setExpanded(true)}
                >
                  Ver mais
                </button>
              </>
            ) : (
              <p className="whitespace-pre-wrap">{relatorio.atividades}</p>
            )}
            {relatorio.atividades.length > 300 && expanded && (
              <button
                type="button"
                className="text-primary text-xs font-medium mt-1 hover:underline"
                onClick={() => setExpanded(false)}
              >
                Ver menos
              </button>
            )}
          </div>
        )}

        {/* ====== Workforce ====== */}
        {relatorio.maoDeObra && relatorio.maoDeObra.length > 0 && (
          <div className="flex items-start gap-2 text-xs">
            <HardHat className="w-3.5 h-3.5 text-warning mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {relatorio.maoDeObra.map((mdo, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20"
                >
                  {mdo.quantidade}× {mdo.descricao}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ====== Equipment ====== */}
        {relatorio.equipamentos && relatorio.equipamentos.length > 0 && (
          <div className="flex items-start gap-2 text-xs">
            <Wrench className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {relatorio.equipamentos.map((eq, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border"
                >
                  {eq.quantidade}× {eq.descricao}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ====== Occurrences ====== */}
        {relatorio.ocorrencias && relatorio.ocorrencias.length > 0 && (
          <div className="space-y-1.5">
            {relatorio.ocorrencias.map((oc, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/10 text-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-destructive">{oc.tipo}</span>
                  {oc.descricao && (
                    <p className="text-destructive/80 mt-0.5">{oc.descricao}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ====== Photos ====== */}
        {relatorio.galeriaDeFotos && relatorio.galeriaDeFotos.length > 0 && (
          <TimelinePhotoGallery fotos={relatorio.galeriaDeFotos} />
        )}

        {/* ====== Videos ====== */}
        {relatorio.galeriaDeVideos && relatorio.galeriaDeVideos.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Video className="w-3.5 h-3.5" />
            <span>{relatorio.galeriaDeVideos.length} vídeo(s) anexado(s)</span>
            {relatorio.galeriaDeVideos.map((v, i) => (
              <a
                key={i}
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Assistir #{i + 1}
              </a>
            ))}
          </div>
        )}

        {/* ====== Materials (Collapsible) ====== */}
        {relatorio.controleDeMaterial && relatorio.controleDeMaterial.length > 0 && (
          <div className="border border-border/50 rounded-lg overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/30 transition-colors"
              onClick={() => setMateriaisExpanded(!materiaisExpanded)}
            >
              <span className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                Materiais ({relatorio.controleDeMaterial.length})
              </span>
              {materiaisExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            {materiaisExpanded && (
              <div className="px-3 pb-2 space-y-1">
                {relatorio.controleDeMaterial.map((mat, i) => (
                  <div key={i} className="flex justify-between text-xs py-1 border-t border-border/30">
                    <span className="text-foreground">{mat.descricao}</span>
                    <span className="text-muted-foreground font-mono">
                      {mat.quantidade} {mat.unidade || 'un'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====== Comments ====== */}
        {relatorio.comentarios && (
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2.5 border border-border/30 italic">
            "{relatorio.comentarios}"
          </div>
        )}

        {/* ====== Footer: PDF + No Content ====== */}
        <div className="flex items-center justify-between pt-1">
          {relatorio.linkPdf && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 gap-1.5 text-muted-foreground hover:text-primary"
              asChild
            >
              <a href={relatorio.linkPdf} target="_blank" rel="noopener noreferrer">
                <FileDown className="w-3.5 h-3.5" />
                Download PDF
              </a>
            </Button>
          )}

          {!hasContent && (
            <p className="text-xs text-muted-foreground italic">Relatório sem conteúdo detalhado.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
