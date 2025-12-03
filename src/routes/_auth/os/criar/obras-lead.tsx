import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OSDetailsWorkflowPage } from '@/components/os/shared/pages/os-details-workflow-page'

export const Route = createFileRoute('/_auth/os/criar/obras-lead')({
  component: ObrasLeadRoute,
})

function ObrasLeadRoute() {
  const router = useRouter()

  return (
    <OSDetailsWorkflowPage
      onBack={() => router.history.back()}
    />
  )
}
