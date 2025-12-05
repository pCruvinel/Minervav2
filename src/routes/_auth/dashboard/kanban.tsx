/**
 * Rota: /dashboard/kanban
 * 
 * Sub-página do Dashboard com ActionKanban (tarefas pessoais)
 */
import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/lib/contexts/auth-context'
import { useDashboardData } from '@/lib/hooks/use-dashboard-data'
import { ActionKanban } from '@/components/dashboard/action-kanban'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/_auth/dashboard/kanban')({
  component: KanbanRoute,
})

function KanbanRoute() {
  const { currentUser, isLoading: isLoadingAuth } = useAuth()
  const { minhasPendencias, visaoGlobal, loading: isLoadingData } = useDashboardData()

  // Loading
  if (isLoadingAuth || isLoadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  // Calcular OSs "aguardando terceiros"
  const aguardandoTerceiros = visaoGlobal.filter(os =>
    os.criado_por_id === currentUser?.id &&
    os.responsavel_id !== currentUser?.id &&
    os.responsavelEtapaId !== currentUser?.id
  )

  return (
    <div className="content-wrapper">
      <div className="space-y-6">
        {/* Header com botão voltar */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>

        {/* ActionKanban */}
        <ActionKanban
          minhasPendencias={minhasPendencias}
          aguardandoTerceiros={aguardandoTerceiros}
          title="Minhas Tarefas"
        />
      </div>
    </div>
  )
}
