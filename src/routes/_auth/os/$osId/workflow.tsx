import { createFileRoute, useRouter, Navigate } from '@tanstack/react-router'
import { isValidUUID } from '@/lib/utils/os-workflow-helpers'
import { useOrdemServico } from '@/lib/hooks/use-ordens-servico'
import { getOSRouteConfigWithFallback } from '@/lib/constants/os-routing-config'

// Import de todas as páginas de workflow
import { OS14WorkflowPage } from '@/components/os/obras/os-1-4/pages/os-1-4-workflow-page'
import { OSDetailsAssessoriaPage } from '@/components/os/assessoria/os-5-6/pages/os-details-assessoria-page'
import { OS07WorkflowPage } from '@/components/os/assessoria/os-7/pages/os07-workflow-page'
import { OS08WorkflowPage } from '@/components/os/assessoria/os-8/pages/os08-workflow-page'
import { OS09WorkflowPage } from '@/components/os/administrativo/os-9/pages/os09-workflow-page'
import { OS10WorkflowPage } from '@/components/os/administrativo/os-10/pages/os10-workflow-page'

export const Route = createFileRoute('/_auth/os/$osId/workflow')({
  component: OSWorkflowRoute,
  validateSearch: (search: Record<string, unknown>): {
    step?: number;
  } => {
    return {
      step: Number(search.step) || undefined,
    }
  },
})

/**
 * Rota dinâmica de workflow que renderiza o componente correto
 * baseado no tipo de OS (código no formato OS-XX)
 */
function OSWorkflowRoute() {
  const { osId } = Route.useParams()
  const { step } = Route.useSearch()
  const router = useRouter()

  // Validar osId como UUID válido
  if (!osId || !isValidUUID(osId)) {
    console.error('[Workflow Route] osId inválido:', osId)
    return <Navigate to="/os" />
  }

  // Buscar dados da OS para determinar o tipo
  const { data: os, isLoading, error } = useOrdemServico(osId)

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Error state
  if (error || !os) {
    console.error('[Workflow Route] Erro ao carregar OS:', error)
    return <Navigate to="/os" />
  }

  // Determinar o tipo de OS baseado no código
  const osCodigo = os.codigo_os || ''
  const routeConfig = getOSRouteConfigWithFallback(osCodigo)

  // Callback comum para voltar
  const handleBack = () => router.history.back()

  // Renderizar componente baseado no tipo de OS
  // Extrair número da OS do código (ex: "OS09-2026-001" -> 9)
  const osNumberMatch = osCodigo.match(/OS-?(\d{1,2})/i)
  const osNumber = osNumberMatch ? parseInt(osNumberMatch[1], 10) : 0

  switch (osNumber) {
    case 1:
    case 2:
    case 3:
    case 4:
      // OS 1-4: Obras (15 etapas)
      return (
        <OS14WorkflowPage
          osId={osId}
          initialStep={step}
          onBack={handleBack}
        />
      )

    case 5:
    case 6:
      // OS 5-6: Assessoria Lead (12 etapas)
      return (
        <OSDetailsAssessoriaPage
          osId={osId}
          onBack={handleBack}
        />
      )

    case 7:
      // OS 7: Solicitação de Reforma (5 etapas)
      return (
        <OS07WorkflowPage
          onBack={handleBack}
        />
      )

    case 8:
      // OS 8: Visita Técnica (7 etapas)
      return (
        <OS08WorkflowPage
          osId={osId}
          onBack={handleBack}
        />
      )

    case 9:
      // OS 9: Requisição de Compras (3 etapas)
      return (
        <OS09WorkflowPage
          osId={osId}
          onBack={handleBack}
        />
      )

    case 10:
      // OS 10: Requisição de Mão de Obra (4 etapas)
      return (
        <OS10WorkflowPage
          osId={osId}
          onBack={handleBack}
        />
      )

    default:
      // Fallback: usar página de workflow padrão de Obras
      console.warn(`[Workflow Route] Tipo de OS não mapeado: ${osCodigo}, usando fallback`)
      return (
        <OS14WorkflowPage
          osId={osId}
          initialStep={step}
          onBack={handleBack}
        />
      )
  }
}
