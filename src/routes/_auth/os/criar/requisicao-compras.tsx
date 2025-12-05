import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OS09WorkflowPage } from '@/components/os/administrativo/os-9/pages/os09-workflow-page'

export const Route = createFileRoute('/_auth/os/criar/requisicao-compras')({
  component: RequisicaoComprasRoute,
  validateSearch: (search: Record<string, unknown>) => ({
    osId: (search.osId as string) || undefined
  })
})

function RequisicaoComprasRoute() {
  const router = useRouter()
  const { osId } = Route.useSearch()

  return (
    <OS09WorkflowPage
      onBack={() => router.history.back()}
      osId={osId}
    />
  )
}
