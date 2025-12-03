import { createFileRoute, useRouter, Navigate } from '@tanstack/react-router'
import { OSDetailsWorkflowPage } from '@/components/os/shared/pages/os-details-workflow-page'
import { isValidUUID } from '@/lib/utils/os-workflow-helpers'

export const Route = createFileRoute('/_auth/os/$osId/workflow')({
  component: OSWorkflowRoute,
})

function OSWorkflowRoute() {
  const { osId } = Route.useParams()
  const router = useRouter()

  // ✅ FIX: Validar osId como UUID válido antes de renderizar
  // Previne erro "invalid input syntax for type uuid: undefined"
  if (!osId || !isValidUUID(osId)) {
    console.error('[Workflow Route] osId inválido:', osId)
    return <Navigate to="/os" />
  }

  return (
    <OSDetailsWorkflowPage
      osId={osId}
      onBack={() => router.history.back()}
    />
  )
}
