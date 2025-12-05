import { createFileRoute } from '@tanstack/react-router'
import { OS11WorkflowPage } from '@/components/os/assessoria/os-11/pages/os11-workflow-page'

export const Route = createFileRoute('/_auth/os/criar/laudo-pontual')({
  component: RouteComponent,
})

function RouteComponent() {
  return <OS11WorkflowPage />
}
