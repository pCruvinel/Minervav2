import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OS14WorkflowPage } from '@/components/os/obras/os-1-4/pages/os-1-4-workflow-page'

export const Route = createFileRoute('/_auth/os/criar/obras-lead')({
  component: ObrasLeadRoute,
})

function ObrasLeadRoute() {
  const router = useRouter()

  return (
    <OS14WorkflowPage
      onBack={() => router.history.back()}
    />
  )
}
