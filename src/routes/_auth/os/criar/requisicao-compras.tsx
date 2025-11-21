import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OS09WorkflowPage } from '../../../components/os/os09-workflow-page'

export const Route = createFileRoute('/_auth/os/criar/requisicao-compras')({
  component: RequisicaoComprasRoute,
})

function RequisicaoComprasRoute() {
  const router = useRouter()

  return (
    <OS09WorkflowPage
      onBack={() => router.history.back()}
    />
  )
}
