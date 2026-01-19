/**
 * Rota: /dashboard/kanban
 *
 * Sub-página do Dashboard com ActionKanban (tarefas pessoais)
 *
 * @version 2.1 - Aguardando Terceiros agora exibido na coluna do Kanban
 */
import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/lib/contexts/auth-context'
import { useDashboardData } from '@/lib/hooks/use-dashboard-data'
import { ActionKanban } from '@/components/dashboard/action-kanban'
import { PageHeader } from '@/components/shared/page-header'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/_auth/dashboard/kanban')({
  component: KanbanRoute,
})

function KanbanRoute() {
  const { isLoading: isLoadingAuth } = useAuth()
  const { minhasPendencias, aguardandoTerceiros, loading: isLoadingData } = useDashboardData()

  // Loading
  if (isLoadingAuth || isLoadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="content-wrapper">
      <div className="space-y-6">
        {/* Header com botão voltar */}
        {/* Header com botão voltar */}
        <PageHeader
          title="Minhas Tarefas"
          subtitle="Foco no que você precisa fazer agora"
          showBackButton
        />

        {/* ActionKanban Principal - Agora com Aguardando Terceiros na coluna do Kanban */}
        <ActionKanban
          minhasPendencias={minhasPendencias}
          aguardandoTerceiros={aguardandoTerceiros}
          title=""
        />
      </div>
    </div>
  )
}
