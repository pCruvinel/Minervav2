import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FinanceiroDashboardPage } from '../../../components/financeiro/financeiro-dashboard-page'

export const Route = createFileRoute('/_auth/financeiro/')({
  component: FinanceiroIndexRoute,
})

function FinanceiroIndexRoute() {
  const navigate = useNavigate()

  return (
    <FinanceiroDashboardPage
      onNavigate={(page) => navigate({ to: `/financeiro/${page}` as any })}
    />
  )
}
