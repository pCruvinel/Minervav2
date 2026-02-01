import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OS11WorkflowPage } from '@/components/os/assessoria/os-11/pages/os11-workflow-page'

export const Route = createFileRoute('/_auth/os/criar/laudo-pontual')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      parentOSId: search.parentOSId as string | undefined,
      clienteId: search.clienteId as string | undefined,
      step: search.step ? Number(search.step) : undefined,
      osId: search.osId as string | undefined,
    }
  },
  component: LaudoPontualRoute,
})

function LaudoPontualRoute() {
  const router = useRouter()
  const { parentOSId, clienteId, step, osId } = Route.useSearch()

  return (
    <OS11WorkflowPage
      onBack={() => router.history.back()}
      parentOSId={parentOSId}
      clienteId={clienteId}
      initialStep={step}
      osId={osId || parentOSId}
    />
  )
}
