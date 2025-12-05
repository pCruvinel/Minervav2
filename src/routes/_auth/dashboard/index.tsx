/**
 * Rota: /dashboard
 * 
 * Dashboard Operacional - Kanban e Tabelas de OS
 * Renderiza DashboardPage (conteúdo movido da raiz)
 */
import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '@/components/dashboard/dashboard-page'

export const Route = createFileRoute('/_auth/dashboard/')({
  component: DashboardRoute,
})

function DashboardRoute() {
  return (
    <div className="content-wrapper">
      <DashboardPage />
    </div>
  )
}
