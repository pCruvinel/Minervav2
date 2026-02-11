import { createFileRoute, useRouter, Navigate } from '@tanstack/react-router'
import { useOrdemServico } from '@/lib/hooks/use-ordens-servico'
import { isValidUUID } from '@/lib/utils/os-workflow-helpers'

// Import de todas as páginas de workflow
import { OS14WorkflowPage } from '@/components/os/obras/os-1-4/pages/os-1-4-workflow-page'
import { OSDetailsAssessoriaPage } from '@/components/os/assessoria/os-5-6/pages/os-details-assessoria-page'
import { OS56WorkflowPage } from '@/components/os/assessoria/os-5-6/pages/os-5-6-workflow-page'
import { OS07WorkflowPage } from '@/components/os/assessoria/os-7/pages/os07-workflow-page'
import { OS08WorkflowPage } from '@/components/os/assessoria/os-8/pages/os08-workflow-page'
import { OS09WorkflowPage } from '@/components/os/administrativo/os-9/pages/os09-workflow-page'
import { OS10WorkflowPage } from '@/components/os/administrativo/os-10/pages/os10-workflow-page'
import { OS13WorkflowPage } from '@/components/os/obras/os-13/pages/os13-workflow-page'

/**
 * Feature Flag: Usar novo sistema de Accordion para OS 5-6
 * Defina como `true` para usar o novo componente
 * Defina como `false` para rollback ao componente legado
 */
const USE_OS56_ACCORDION = true;

export const Route = createFileRoute('/_auth/os/details-workflow/$id')({
  component: OSDetailsWorkflowRoute,
  validateSearch: (search: Record<string, unknown>): {
    step?: number;
    readonly?: boolean;
  } => {
    return {
      step: Number(search.step) || undefined,
      readonly: search.readonly === true || search.readonly === 'true',
    }
  },
})

/**
 * Rota dinâmica de workflow que renderiza o componente correto
 * baseado no tipo de OS (campo tipos_os.codigo no banco)
 */
function OSDetailsWorkflowRoute() {
  const { id } = Route.useParams()
  const { step, readonly } = Route.useSearch()
  const router = useRouter()

  // Validar id como UUID válido
  if (!id || !isValidUUID(id)) {
    console.error('[Workflow Route] id inválido:', id)
    return <Navigate to="/os" />
  }

  // Buscar dados da OS para determinar o tipo
  const { data: os, isLoading, error } = useOrdemServico(id)

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

  // Callback comum para voltar
  const handleBack = () => router.history.back()

  // Usar tipo_os_codigo que é definido pelo hook useOrdemServico (e.g., 'OS-01', 'OS-09')
  const tipoOSCodigo = os.tipo_os_codigo || ''

  // Extrair número do tipo (ex: 'OS-09' -> 9)
  const osNumberMatch = tipoOSCodigo.match(/OS-?(\d{1,2})/i)
  const osNumber = osNumberMatch ? parseInt(osNumberMatch[1], 10) : 0

  // Log para debug
  console.log(`[Workflow Route] tipo_os_codigo=${tipoOSCodigo}, osNumber=${osNumber}`)

  switch (osNumber) {
    case 1:
    case 2:
    case 3:
    case 4:
      // OS 1-4: Obras (15 etapas)
      return (
        <OS14WorkflowPage
          osId={id}
          initialStep={step}
          readonly={readonly}
          onBack={handleBack}
        />
      )

    case 5:
    case 6:
      // OS 5-6: Assessoria Lead (12 etapas)
      // Feature Flag: USE_OS56_ACCORDION
      return USE_OS56_ACCORDION ? (
        <OS56WorkflowPage
          osId={id}
          tipoOS={osNumber === 5 ? 'OS-05' : 'OS-06'}
          initialStep={step}
          readonly={readonly}
          codigoOS={os.codigo_os}
          tipoOSNome={os.tipo_os_nome}
          onBack={handleBack}
        />
      ) : (
        <OSDetailsAssessoriaPage
          osId={id}
          tipoOS={osNumber === 5 ? 'OS-05' : 'OS-06'}
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
          osId={id}
          initialStep={step}
          readonly={readonly}
          codigoOS={os.codigo_os}
          tipoOSNome={os.tipo_os_nome}
          onBack={handleBack}
        />
      )

    case 9:
      // OS 9: Requisição de Compras (3 etapas)
      return (
        <OS09WorkflowPage
          osId={id}
          onBack={handleBack}
        />
      )

    case 10:
      // OS 10: Requisição de Mão de Obra (4 etapas)
      return (
        <OS10WorkflowPage
          osId={id}
          onBack={handleBack}
        />
      )

    case 13:
      // OS 13: Contrato de Obra (17 etapas)
      return (
        <OS13WorkflowPage
          osId={id}
          initialStep={step}
          onBack={handleBack}
        />
      )

    default:
      // Fallback: usar página de workflow padrão de Obras
      console.warn(`[Workflow Route] Tipo de OS não mapeado: ${tipoOSCodigo}, usando fallback`)
      return (
        <OS14WorkflowPage
          osId={id}
          initialStep={step}
          readonly={readonly}
          onBack={handleBack}
        />
      )
  }
}
