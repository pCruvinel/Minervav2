/**
 * Rota: /dashboard/executivo
 * 
 * Dashboard Executivo para Diretoria e Admin
 * Governança, Controladoria e Auditoria
 */
import { createFileRoute } from '@tanstack/react-router'
import { ExecutiveDashboard } from '@/components/dashboard/executive/executive-dashboard'

export const Route = createFileRoute('/_auth/dashboard/executivo')({
  component: ExecutivoRoute,
})

function ExecutivoRoute() {
  return (
    <div className="content-wrapper">
      <ExecutiveDashboard />
    </div>
  )
}
