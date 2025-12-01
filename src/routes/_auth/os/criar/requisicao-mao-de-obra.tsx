import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OS10WorkflowPage } from '../../../../components/os/os10-workflow-page'

export const Route = createFileRoute('/_auth/os/criar/requisicao-mao-de-obra')({
    component: RequisicaoMaoDeObraRoute,
})

function RequisicaoMaoDeObraRoute() {
    const router = useRouter()

    return (
        <OS10WorkflowPage
            onBack={() => router.history.back()}
        />
    )
}