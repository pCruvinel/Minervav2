import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OS13WorkflowPage } from '../../../../components/os/os13-workflow-page'

export const Route = createFileRoute('/_auth/os/criar/start-contrato-obra')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      parentOSId: search.parentOSId as string | undefined,
    }
  },
  component: StartContratoObraRoute,
})

function StartContratoObraRoute() {
  const router = useRouter()
  const { parentOSId } = Route.useSearch()

  return (
    <OS13WorkflowPage
      onBack={() => router.history.back()}
      parentOSId={parentOSId}
    />
  )
}
