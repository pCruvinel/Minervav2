import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OSDetailsWorkflowPage } from '../../../components/os/os-details-workflow-page'

export const Route = createFileRoute('/_auth/os/details-workflow/$id')({
  component: OSDetailsWorkflowRoute,
  validateSearch: (search: Record<string, unknown>): { step?: number } => {
    return {
      step: Number(search.step) || undefined,
    }
  },
})

function OSDetailsWorkflowRoute() {
  const { id } = Route.useParams()
  const { step } = Route.useSearch()
  const router = useRouter()

  return (
    <OSDetailsWorkflowPage
      osId={id}
      initialStep={step}
      onBack={() => router.history.back()}
    />
  )
}
