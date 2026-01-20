import { createFileRoute } from '@tanstack/react-router'
import { CentroCustoDetalhesPage } from '@/components/financeiro/centro-custo-detalhes-page'

export const Route = createFileRoute('/_auth/financeiro/centro-custo/$ccId')({
    component: CentroCustoDetalhesRoute,
})

function CentroCustoDetalhesRoute() {
    return (
        <div className="content-wrapper">
            <CentroCustoDetalhesPage />
        </div>
    )
}
