import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OSDetailsWorkflowPage } from '@/components/os/shared/pages/os-details-workflow-page'

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

function OSDetailsWorkflowRoute() {
  const { id } = Route.useParams()
  const { step, readonly } = Route.useSearch()
  const router = useRouter()

  return (
    <OSDetailsWorkflowPage
      osId={id}
      initialStep={step}
      readonly={readonly}
      onBack={() => router.history.back()}
    />
  )
}
