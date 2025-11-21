import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OS08WorkflowPage } from '../../../../components/os/os08-workflow-page'

export const Route = createFileRoute('/_auth/os/criar/vistoria')({
  component: VistoriaRoute,
})

function VistoriaRoute() {
  const router = useRouter()

  return (
    <OS08WorkflowPage
      onBack={() => router.history.back()}
    />
  )
}
