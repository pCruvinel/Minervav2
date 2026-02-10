import { createFileRoute } from '@tanstack/react-router'
import { CentroCustoListaPage } from '@/components/financeiro/centro-custo-lista-page'

export const Route = createFileRoute('/_auth/financeiro/centros-custo')({
  component: CentroCustoListaRoute,
})

function CentroCustoListaRoute() {
  return (
    <div className="content-wrapper">
      <CentroCustoListaPage />
    </div>
  )
}
