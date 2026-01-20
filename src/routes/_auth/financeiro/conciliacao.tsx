import { createFileRoute } from '@tanstack/react-router'
import { ConciliacaoBancariaPage } from '../../../components/financeiro/conciliacao-bancaria-page'

export const Route = createFileRoute('/_auth/financeiro/conciliacao')({
  component: ConciliacaoRoute,
})

function ConciliacaoRoute() {
  return (
    <div className="content-wrapper">
      <ConciliacaoBancariaPage />
    </div>
  )
}
