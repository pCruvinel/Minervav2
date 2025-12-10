/**
 * Rota: /dashboard/kanban
 * 
 * Sub-página do Dashboard com ActionKanban (tarefas pessoais)
 * 
 * @version 2.0 - Adiciona seção colapsável "Aguardando Terceiros"
 */
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/lib/contexts/auth-context'
import { useDashboardData } from '@/lib/hooks/use-dashboard-data'
import { ActionKanban } from '@/components/dashboard/action-kanban'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Loader2, ChevronDown, ChevronUp, Clock, ExternalLink } from 'lucide-react'

export const Route = createFileRoute('/_auth/dashboard/kanban')({
  component: KanbanRoute,
})

function KanbanRoute() {
  const { currentUser, isLoading: isLoadingAuth } = useAuth()
  const { minhasPendencias, aguardandoTerceiros, loading: isLoadingData } = useDashboardData()
  const [isWaitingOpen, setIsWaitingOpen] = useState(false)

  // Loading
  if (isLoadingAuth || isLoadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  // Helper para formatar data
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

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
          <div>
            <h1 className="text-2xl font-semibold">Minhas Tarefas</h1>
            <p className="text-sm text-muted-foreground">
              Foco no que você precisa fazer agora
            </p>
          </div>
        </div>

        {/* ActionKanban Principal */}
        <ActionKanban
          minhasPendencias={minhasPendencias}
          aguardandoTerceiros={[]} // Removido daqui, será exibido separadamente
          title=""
        />

        {/* 🆕 Seção Colapsável: Aguardando Terceiros */}
        {aguardandoTerceiros.length > 0 && (
          <Collapsible open={isWaitingOpen} onOpenChange={setIsWaitingOpen}>
            <Card className="border-warning/20">
              <CardHeader className="pb-3">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto hover:bg-transparent"
                  >
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="h-5 w-5 text-warning" />
                      ⏳ Aguardando Terceiros
                      <Badge variant="secondary" className="ml-2">
                        {aguardandoTerceiros.length}
                      </Badge>
                    </CardTitle>
                    {isWaitingOpen ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <p className="text-sm text-muted-foreground mt-1">
                  OSs que você criou ou delegou e estão com outras pessoas
                </p>
              </CardHeader>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="divide-y">
                    {aguardandoTerceiros.map((os) => (
                      <div
                        key={os.id}
                        className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-primary">
                              {os.codigo_os}
                            </span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm">
                              {os.tipo_os_nome}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>
                              Com: <span className="text-foreground">{os.responsavel_nome || 'Não atribuído'}</span>
                            </span>
                            {os.prazoEtapa && (
                              <>
                                <span>•</span>
                                <span className={os.prazoVencido ? 'text-destructive' : ''}>
                                  Prazo: {formatDate(os.prazoEtapa)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={os.prazoVencido
                              ? 'bg-destructive/10 text-destructive border-destructive/20'
                              : 'bg-warning/10 text-warning border-warning/20'
                            }
                          >
                            {os.statusEtapa === 'em_andamento' ? 'Em Andamento' : 'Pendente'}
                          </Badge>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to="/os/$osId" params={{ osId: os.id }}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}
      </div>
    </div>
  )
}
