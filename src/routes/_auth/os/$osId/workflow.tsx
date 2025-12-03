import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OSDetailsWorkflowPage } from '@/components/os/shared/pages/os-details-workflow-page'

export const Route = createFileRoute('/_auth/os/$osId/workflow')({
  component: OSWorkflowRoute,
})

function OSWorkflowRoute() {
  const { osId } = Route.useParams()
  const router = useRouter()

  return (
    <OSDetailsWorkflowPage
      osId={osId}
      onBack={() => router.history.back()}
    />
  )
}
