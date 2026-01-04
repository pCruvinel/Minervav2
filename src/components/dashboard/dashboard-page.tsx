/**
 * Página Principal de Dashboard - Sistema Minerva ERP
 * 
 * Hub de Dashboards com roteamento RBAC:
 * - Admin/Diretor: ManagerTable Global + KPIs
 * - Coordenadores: ManagerTable Setorial + ActionKanban pessoal (NOVO: Separação Ação x Monitoramento)
 * - Operacional: ActionKanban estritamente pessoal
 * 
 * @version 2.0 - Resolve "Ponto Cego" do Dashboard
 */
'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { useDashboardData } from '@/lib/hooks/use-dashboard-data';
import { getPermissoes, type RoleLevel } from '@/lib/types';
import { ActionKanban } from './action-kanban';
import { ManagerTable } from './manager-table';
import { MetricCard } from './metric-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@tanstack/react-router';
import {
  Loader2,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Users,
  LayoutGrid,
  ArrowRightLeft,
  Eye,
  Target
} from 'lucide-react';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function DashboardPage() {
  const { currentUser, isLoading: isLoadingAuth } = useAuth();
  const {
    minhasPendencias,
    visaoGlobal,
    monitoramentoSetor,
    aguardandoTerceiros,
    contadores,
    loading: isLoadingData,
    error
  } = useDashboardData();

  // Loading state
  if (isLoadingAuth || isLoadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Faça login para acessar o dashboard</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <h2 className="text-xl font-semibold mb-2">Erro ao carregar dados</h2>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  // Determinar cargo e permissões
  const cargoSlug = (currentUser.cargo_slug || currentUser.role_nivel || 'colaborador_obra') as RoleLevel;
  const permissoes = getPermissoes(currentUser);

  // ========== RENDERIZAÇÃO POR CARGO ==========

  // ADMIN/DIRETOR/DIRETORIA: ManagerTable Global + KPIs
  if (['admin', 'diretor', 'diretoria'].includes(cargoSlug)) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-600 mt-1">
            Visão geral completa do sistema • Atualizado em tempo real
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total de OS"
            value={contadores.totalGlobal}
            icon={FileText}
            variant="primary"
            description="OSs ativas no sistema"
          />
          <MetricCard
            title="Em Andamento"
            value={visaoGlobal.filter(os => os.status_geral === 'em_andamento').length}
            icon={Clock}
            variant="default"
            description="OSs em execução"
          />
          <MetricCard
            title="Urgentes"
            value={visaoGlobal.filter(os => os.prazoVencido).length}
            icon={AlertTriangle}
            variant={visaoGlobal.filter(os => os.prazoVencido).length > 0 ? 'danger' : 'success'}
            description="Prazos vencidos"
          />
          <MetricCard
            title="Aguardando Terceiros"
            value={contadores.aguardando}
            icon={Users}
            variant="default"
            description="OSs criadas por mim com outros"
          />
        </div>

        {/* Tabela Global */}
        <ManagerTable
          data={visaoGlobal}
          title="Todas as Ordens de Serviço"
          showSetorFilter={true}
        />
      </div>
    );
  }

  // COORDENADORES: ManagerTable Setorial + ActionKanban pessoal
  // NOVA ESTRUTURA: KPIs do Setor → Minhas Ações → Controle Geral do Setor
  if (cargoSlug.startsWith('coord_')) {
    const setorLabel = currentUser.setor_slug === 'assessoria' ? 'Assessoria'
      : currentUser.setor_slug === 'obras' ? 'Obras'
        : currentUser.setor_slug === 'administrativo' ? 'Administrativo'
          : 'Setor';

    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard - {setorLabel}</h1>
          <p className="text-neutral-600 mt-1">
            Gerencie as ordens de serviço do seu setor • Visão completa de monitoramento
          </p>
        </div>

        {/* KPIs DO SETOR */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title={`Total ${setorLabel}`}
            value={contadores.totalMonitoramento}
            icon={Eye}
            variant="primary"
            description="OSs no monitoramento"
          />
          <MetricCard
            title="Minhas Pendências"
            value={contadores.minhaVez + contadores.emAndamento}
            icon={Target}
            variant="default"
            description="Sob minha responsabilidade"
          />
          <MetricCard
            title="Aguardando Outros"
            value={contadores.filhasExternas}
            icon={ArrowRightLeft}
            variant={contadores.filhasExternas > 0 ? 'warning' : 'default'}
            description="OSs do setor em outros setores"
          />
          <MetricCard
            title="Urgentes"
            value={contadores.urgentes}
            icon={AlertTriangle}
            variant={contadores.urgentes > 0 ? 'danger' : 'success'}
            description="Prazos vencidos"
          />
        </div>

        {/* MINHAS AÇÕES IMEDIATAS */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              🎯 Minhas Ações Imediatas
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {contadores.urgentes > 0
                ? `⚠️ ${contadores.urgentes} urgente(s) + ${contadores.minhaVez} a fazer`
                : `${minhasPendencias.length} tarefa(s) sob sua responsabilidade`
              }
            </p>
          </CardHeader>
          <CardContent>
            {minhasPendencias.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-success" />
                <p>Nenhuma tarefa pendente para você agora!</p>
              </div>
            ) : (
              <>
                <ActionKanban
                  minhasPendencias={minhasPendencias}
                  aguardandoTerceiros={[]}
                  title=""
                />
                <div className="mt-4 text-center">
                  <Button variant="outline" asChild>
                    <Link to="/dashboard/kanban">
                      <LayoutGrid className="h-4 w-4 mr-2" />
                      Abrir Kanban Completo
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* CONTROLE GERAL DO SETOR */}
        <ManagerTable
          data={monitoramentoSetor}
          title={`Controle Geral - ${setorLabel}`}
          showSetorFilter={false}
        />

        {/* Performance placeholder */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Estatísticas do Setor</h3>
              <p className="text-sm text-muted-foreground">
                Em breve: métricas de performance e taxa de conclusão
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // OPERACIONAL: ActionKanban estritamente pessoal
  if (cargoSlug.startsWith('operacional_')) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header simples */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Minhas Tarefas</h1>
          <p className="text-neutral-600 mt-1">
            Foco total no que você precisa fazer agora
          </p>
        </div>

        {/* Mini KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Urgentes"
            value={contadores.urgentes}
            icon={AlertTriangle}
            variant={contadores.urgentes > 0 ? 'danger' : 'success'}
          />
          <MetricCard
            title="A Fazer"
            value={contadores.minhaVez}
            icon={Clock}
            variant="warning"
          />
          <MetricCard
            title="Em Andamento"
            value={contadores.emAndamento}
            icon={FileText}
            variant="primary"
          />
          <MetricCard
            title="Aguardando"
            value={contadores.aguardando}
            icon={Users}
            variant="default"
          />
        </div>

        {/* Kanban Pessoal */}
        <ActionKanban
          minhasPendencias={minhasPendencias}
          aguardandoTerceiros={aguardandoTerceiros}
        />
      </div>
    );
  }

  // FALLBACK: Colaborador de Obra ou outros sem acesso
  if (permissoes.escopo_visao === 'nenhuma') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Dashboard Não Disponível</h2>
          <p className="text-sm text-muted-foreground">
            Seu perfil não tem acesso ao dashboard. Entre em contato com o administrador.
          </p>
        </div>
      </div>
    );
  }

  // FALLBACK GENÉRICO: Mostrar apenas Kanban
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-1">Suas tarefas pendentes</p>
      </div>
      <ActionKanban
        minhasPendencias={minhasPendencias}
        aguardandoTerceiros={aguardandoTerceiros}
      />
    </div>
  );
}
