import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OS12WorkflowPage } from '../../../../components/os/os12-workflow-page'

export const Route = createFileRoute('/_auth/os/criar/assessoria-recorrente')({
    component: AssessoriaRecorrenteRoute,
})

function AssessoriaRecorrenteRoute() {
    const router = useRouter()

    return (
        <OS12WorkflowPage
            onBack={() => router.history.back()}
        />
    )
}