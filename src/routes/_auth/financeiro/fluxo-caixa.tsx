import { createFileRoute } from '@tanstack/react-router'
import { FluxoCaixaPage } from '../../../components/financeiro/fluxo-caixa-page'

export const Route = createFileRoute('/_auth/financeiro/fluxo-caixa')({
    component: FluxoCaixaRoute,
})

function FluxoCaixaRoute() {
    return (
        <div className="content-wrapper">
            <FluxoCaixaPage />
        </div>
    )
}
