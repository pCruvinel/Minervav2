/**
 * ClienteTabTimeline - Aba de Timeline / Diário de Obra
 *
 * Agrega os RDOs (Relatórios Diários de Obra) de TODOS os contratos
 * do cliente em uma timeline unificada. Para cada contrato que tenha
 * configuração de diário de obra, renderiza o componente TimelineObra.
 *
 * @example
 * ```tsx
 * <ClienteTabTimeline clienteId="uuid" />
 * ```
 */

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  AlertCircle,
  ClipboardList,
  HardHat,
  FileText,
} from 'lucide-react'
import { useClienteContratos } from '@/lib/hooks/use-cliente-contratos'
import { useObraConfig } from '@/lib/hooks/use-diario-obra'
import { TimelineObra } from '@/components/contratos/timeline-obra'

// ==================== SUB-COMPONENTS ====================

/**
 * Wrapper que verifica se um contrato tem configuração de diário de obra.
 * Só renderiza a timeline se houver configuração ativa.
 */
function ContratoTimelineSection({
  contratoId,
  contratoNumero,
  contratoTipo,
}: {
  contratoId: string
  contratoNumero: string
  contratoTipo: string
}) {
  const {
    data: config,
    isLoading: isLoadingConfig,
  } = useObraConfig(contratoId)

  // Loading — exibe skeleton inline
  if (isLoadingConfig) {
    return (
      <div className="space-y-3 py-2">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    )
  }

  // Sem configuração → contrato não tem diário de obra
  if (!config) {
    return null
  }

  // Com configuração → renderiza a timeline dentro de um accordion
  return (
    <AccordionItem value={contratoId} className="border rounded-xl px-1 [&[data-state=open]]:shadow-sm">
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <HardHat className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-medium text-foreground">
              {contratoNumero}
            </p>
            <p className="text-xs text-muted-foreground">
              {config.obra_nome || 'Obra vinculada'} • {contratoTipo}
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <TimelineObra contratoId={contratoId} />
      </AccordionContent>
    </AccordionItem>
  )
}

// ==================== MAIN COMPONENT ====================

interface ClienteTabTimelineProps {
  clienteId: string
}

export function ClienteTabTimeline({ clienteId }: ClienteTabTimelineProps) {
  const { contratos, isLoading, error } = useClienteContratos(clienteId)

  // Loading
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  // Erro
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar contratos: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  // Sem contratos
  if (contratos.length === 0) {
    return (
      <Card className="border-dashed border-2 border-border">
        <CardContent className="py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Nenhum contrato encontrado
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Este cliente não possui contratos vinculados. O diário de obra
              estará disponível quando um contrato for criado e vinculado a
              uma obra.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Contratos com possíveis timelines — filtrar apenas tipos relevantes (obra/parceiro)
  // mas mostramos todos para verificar config, o próprio componente oculta se não tiver config
  const contratosAtivos = contratos.filter(c => c.status === 'ativo' || c.status === 'suspenso')
  const contratosEncerrados = contratos.filter(c => c.status === 'encerrado' || c.status === 'cancelado')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Diário de Obra
            </h3>
            <p className="text-xs text-muted-foreground">
              Timeline de relatórios diários de todos os contratos
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          {contratos.length} contrato(s)
        </Badge>
      </div>

      {/* Contratos ativos com timeline */}
      {contratosAtivos.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Contratos Ativos
          </p>
          <Accordion
            type="multiple"
            defaultValue={contratosAtivos.length === 1 ? [contratosAtivos[0].id] : []}
            className="space-y-3"
          >
            {contratosAtivos.map((contrato) => (
              <ContratoTimelineSection
                key={contrato.id}
                contratoId={contrato.id}
                contratoNumero={contrato.numero_contrato}
                contratoTipo={contrato.tipo === 'obra' ? 'Obra' : contrato.tipo === 'parceiro' ? 'Parceiro' : contrato.tipo === 'recorrente' ? 'Recorrente' : 'Avulso'}
              />
            ))}
          </Accordion>
        </div>
      )}

      {/* Contratos encerrados com timeline */}
      {contratosEncerrados.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Contratos Encerrados
          </p>
          <Accordion type="multiple" className="space-y-3">
            {contratosEncerrados.map((contrato) => (
              <ContratoTimelineSection
                key={contrato.id}
                contratoId={contrato.id}
                contratoNumero={contrato.numero_contrato}
                contratoTipo={contrato.tipo === 'obra' ? 'Obra' : contrato.tipo === 'parceiro' ? 'Parceiro' : contrato.tipo === 'recorrente' ? 'Recorrente' : 'Avulso'}
              />
            ))}
          </Accordion>
        </div>
      )}

      {/* Nota informativa caso nenhum contrato tenha configuração */}
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">
          Apenas contratos com diário de obra vinculado são exibidos acima.
          Contratos sem configuração são automaticamente ocultados.
        </p>
      </div>
    </div>
  )
}
