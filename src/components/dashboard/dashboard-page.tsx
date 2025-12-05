/**
 * Página Principal de Dashboard - Sistema Minerva ERP
 * 
 * Hub de Dashboards com roteamento RBAC:
 * - Admin/Diretor: ManagerTable Global + KPIs
 * - Coordenadores: ManagerTable Setorial + ActionKanban pessoal
 * - Operacional: ActionKanban estritamente pessoal
 */
'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { useDashboardData } from '@/lib/hooks/use-dashboard-data';
import { getPermissoes, type RoleLevel } from '@/lib/types';
import { ActionKanban } from './action-kanban';
import { ManagerTable } from './manager-table';
import { MetricCard } from './metric-card';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { Loader2, FileText, Clock, AlertTriangle, CheckCircle2, TrendingUp, Users, LayoutGrid } from 'lucide-react';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function DashboardPage() {
  const { currentUser, isLoading: isLoadingAuth } = useAuth();
  const {
    minhasPendencias,
    pendenciasSetor,
    visaoGlobal,
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

  // Calcular OSs "aguardando terceiros" para o Kanban
  const aguardandoTerceiros = visaoGlobal.filter(os =>
    os.criado_por_id === currentUser.id &&
    os.responsavel_id !== currentUser.id &&
    os.responsavelEtapaId !== currentUser.id
  );

  // ========== RENDERIZAÇÃO POR CARGO ==========

  // ADMIN/DIRETOR/DIRETORIA: ManagerTable Global + KPIs
  if (['admin', 'diretor', 'diretoria'].includes(cargoSlug)) {
    return (
      <div className="content-wrapper">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-semibold mb-2">Dashboard Executivo</h1>
            <p className="text-muted-foreground">
              Visão geral completa do sistema • Atualizado em tempo real
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              title="Concluídas (30d)"
              value={0} // TODO: Implementar contador de concluídas
              icon={CheckCircle2}
              variant="success"
              description="Últimos 30 dias"
            />
          </div>

          {/* Tabela Global */}
          <ManagerTable
            data={visaoGlobal}
            title="Todas as Ordens de Serviço"
            showSetorFilter={true}
          />

          {/* Link para Kanban Pessoal */}
          {minhasPendencias.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
              <div>
                <h3 className="font-medium">Minhas Tarefas Pessoais</h3>
                <p className="text-sm text-muted-foreground">
                  Você tem {minhasPendencias.length} tarefa(s) pendente(s)
                </p>
              </div>
              <Button asChild>
                <Link to="/dashboard/kanban">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Abrir Kanban
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // COORDENADORES: ManagerTable Setorial + ActionKanban pessoal
  if (cargoSlug.startsWith('coord_')) {
    const setorLabel = currentUser.setor_slug === 'assessoria' ? 'Assessoria'
      : currentUser.setor_slug === 'obras' ? 'Obras'
        : currentUser.setor_slug === 'administrativo' ? 'Administrativo'
          : 'Setor';

    return (
      <div className="content-wrapper">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-semibold mb-2">Dashboard - {setorLabel}</h1>
            <p className="text-muted-foreground">
              Gerencie as ordens de serviço do seu setor
            </p>
          </div>

          {/* KPIs do Setor */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title={`OS do ${setorLabel}`}
              value={contadores.totalSetor}
              icon={FileText}
              variant="primary"
              description="Total no setor"
            />
            <MetricCard
              title="Minhas Pendências"
              value={contadores.minhaVez + contadores.emAndamento}
              icon={Users}
              variant="default"
              description="Sob minha responsabilidade"
            />
            <MetricCard
              title="Urgentes"
              value={contadores.urgentes}
              icon={AlertTriangle}
              variant={contadores.urgentes > 0 ? 'danger' : 'success'}
              description="Prazos vencidos"
            />
            <MetricCard
              title="Performance"
              value="--"
              icon={TrendingUp}
              variant="default"
              description="Taxa de conclusão"
            />
          </div>

          {/* Link para Kanban Pessoal */}
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div>
              <h3 className="font-medium">Minhas Tarefas</h3>
              <p className="text-sm text-muted-foreground">
                {contadores.urgentes > 0
                  ? `⚠️ ${contadores.urgentes} urgente(s) + ${contadores.minhaVez} a fazer`
                  : `${minhasPendencias.length} tarefa(s) pendente(s)`
                }
              </p>
            </div>
            <Button asChild>
              <Link to="/dashboard/kanban">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Abrir Kanban
              </Link>
            </Button>
          </div>

          {/* Tabela do Setor */}
          <ManagerTable
            data={pendenciasSetor}
            title={`Ordens de Serviço - ${setorLabel}`}
            showSetorFilter={false}
          />
        </div>
      </div>
    );
  }

  // OPERACIONAL: ActionKanban estritamente pessoal
  if (cargoSlug.startsWith('operacional_')) {
    return (
      <div className="content-wrapper">
        <div className="space-y-6">
          {/* Header simples */}
          <div>
            <h1 className="text-3xl font-semibold mb-2">Minhas Tarefas</h1>
            <p className="text-muted-foreground">
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
    <div className="content-wrapper">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Suas tarefas pendentes</p>
        </div>
        <ActionKanban
          minhasPendencias={minhasPendencias}
          aguardandoTerceiros={aguardandoTerceiros}
        />
      </div>
    </div>
  );
}

