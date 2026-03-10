import { createFileRoute } from '@tanstack/react-router'
import { PresencaHistoricoColaboradorPage } from '@/components/colaboradores/presenca-historico-colaborador-page'

export const Route = createFileRoute(
  '/_auth/colaboradores/presenca-detalhes/$colaboradorId',
)({
  component: PresencaHistoricoColaboradorRoute,
})

function PresencaHistoricoColaboradorRoute() {
  return (
    <div className="content-wrapper">
      <PresencaHistoricoColaboradorPage />
    </div>
  )
}
