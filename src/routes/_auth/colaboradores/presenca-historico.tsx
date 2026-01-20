import { createFileRoute } from '@tanstack/react-router'
import { PresencaHistoricoPage } from '@/components/colaboradores/presenca-historico-page'

export const Route = createFileRoute('/_auth/colaboradores/presenca-historico')({
    component: PresencaHistoricoRoute,
})

function PresencaHistoricoRoute() {
    return (
        <div className="content-wrapper">
            <PresencaHistoricoPage />
        </div>
    )
}
