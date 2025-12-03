import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '../../components/dashboard/dashboard-page'
import { mockOrdensServico } from '@/lib/mock-data'
import { useState } from 'react'
import { Delegacao } from '@/lib/types'

export const Route = createFileRoute('/_auth/')({
  component: DashboardRoute,
})

function DashboardRoute() {
  // Mock data state - ideally this should come from a query/loader
  const [ordensServico] = useState(mockOrdensServico)
  const [delegacoes] = useState<Delegacao[]>([]) // Empty for now or mock it

  return (
    <DashboardPage
      ordensServico={ordensServico}
      delegacoes={delegacoes}
      onOSClick={() => { }}
      onViewAllOS={() => { }}
      onDelegarClick={() => { }}
    />
  )
}
