import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OS12WorkflowPage } from '@/components/os/assessoria/os-12/pages/os12-workflow-page'

export const Route = createFileRoute('/_auth/os/criar/assessoria-recorrente')({
    validateSearch: (search: Record<string, unknown>) => {
        return {
            parentOSId: search.parentOSId as string | undefined,
            clienteId: search.clienteId as string | undefined,
        }
    },
    component: AssessoriaRecorrenteRoute,
})

function AssessoriaRecorrenteRoute() {
    const router = useRouter()
    const { parentOSId, clienteId } = Route.useSearch()

    return (
        <OS12WorkflowPage
            onBack={() => router.history.back()}
            parentOSId={parentOSId}
            clienteId={clienteId}
        />
    )
}