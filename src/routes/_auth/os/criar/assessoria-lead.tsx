import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OSDetailsAssessoriaPage } from '@/components/os/assessoria/os-5-6/pages/os-details-assessoria-page'
import { OS56WorkflowPage } from '@/components/os/assessoria/os-5-6/pages/os-5-6-workflow-page'

/**
 * Feature Flag: Usar novo sistema de Accordion para OS 5-6
 * Defina como `true` para usar o novo componente
 * Defina como `false` para rollback ao componente legado
 */
const USE_OS56_ACCORDION = true

export const Route = createFileRoute('/_auth/os/criar/assessoria-lead')({
  component: AssessoriaLeadRoute,
})

function AssessoriaLeadRoute() {
  const router = useRouter()

  return USE_OS56_ACCORDION ? (
    <OS56WorkflowPage
      tipoOS="OS-05"
      onBack={() => router.history.back()}
    />
  ) : (
    <OSDetailsAssessoriaPage
      onBack={() => router.history.back()}
    />
  )
}
