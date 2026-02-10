import { createFileRoute } from '@tanstack/react-router'
import { GestaoDespesasPage } from '../../../components/financeiro/gestao-despesas-page'

export const Route = createFileRoute('/_auth/financeiro/despesas')({
    component: GestaoDespesasRoute,
})

function GestaoDespesasRoute() {
    return (
        <div className="content-wrapper">
            <GestaoDespesasPage />
        </div>
    )
}
