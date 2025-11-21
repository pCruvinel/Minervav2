import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OSDetailsAssessoriaPage } from '../../../components/os/os-details-assessoria-page'

export const Route = createFileRoute('/_auth/os/criar/assessoria-lead')({
  component: AssessoriaLeadRoute,
})

function AssessoriaLeadRoute() {
  const router = useRouter()

  return (
    <OSDetailsAssessoriaPage
      onBack={() => router.history.back()}
    />
  )
}
