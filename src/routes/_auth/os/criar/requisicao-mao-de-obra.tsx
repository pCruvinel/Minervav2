import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OS10WorkflowPage } from '@/components/os/administrativo/os-10/pages/os10-workflow-page'
import { z } from 'zod'

const searchSchema = z.object({
    osId: z.string().optional(),
})

export const Route = createFileRoute('/_auth/os/criar/requisicao-mao-de-obra')({
    component: RequisicaoMaoDeObraRoute,
    validateSearch: searchSchema,
})

function RequisicaoMaoDeObraRoute() {
    const router = useRouter()
    const { osId } = Route.useSearch()

    return (
        <OS10WorkflowPage
            onBack={() => router.history.back()}
            osId={osId}
        />
    )
}