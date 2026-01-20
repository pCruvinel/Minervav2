import { createFileRoute } from '@tanstack/react-router'
import { FaturasRecorrentesPage } from '../../../components/financeiro/faturas-recorrentes-page'

export const Route = createFileRoute('/_auth/financeiro/faturas-recorrentes')({
    component: FaturasRecorrentesRoute,
})

function FaturasRecorrentesRoute() {
    return (
        <div className="content-wrapper">
            <FaturasRecorrentesPage />
        </div>
    )
}
