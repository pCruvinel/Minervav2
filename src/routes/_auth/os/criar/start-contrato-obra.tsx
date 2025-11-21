import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OS13WorkflowPage } from '../../../../components/os/os13-workflow-page'

export const Route = createFileRoute('/_auth/os/criar/start-contrato-obra')({
  component: StartContratoObraRoute,
})

function StartContratoObraRoute() {
  const router = useRouter()

  return (
    <OS13WorkflowPage
      onBack={() => router.history.back()}
    />
  )
}
