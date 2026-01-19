import { createFileRoute } from '@tanstack/react-router'
import { ReceitasRecorrentesPage } from '../../../components/financeiro/receitas-recorrentes-page'

export const Route = createFileRoute('/_auth/financeiro/receitas-recorrentes')({
    component: ReceitasRecorrentesRoute,
})

function ReceitasRecorrentesRoute() {
    return <ReceitasRecorrentesPage />
}
