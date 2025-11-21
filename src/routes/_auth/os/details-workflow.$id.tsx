import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OSDetailsWorkflowPage } from '../../../components/os/os-details-workflow-page'

export const Route = createFileRoute('/_auth/os/details-workflow/$id')({
  component: OSDetailsWorkflowRoute,
})

function OSDetailsWorkflowRoute() {
  const { id } = Route.useParams()
  const router = useRouter()

  return (
    <OSDetailsWorkflowPage
      osId={id}
      onBack={() => router.history.back()}
    />
  )
}
