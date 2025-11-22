// Dashboard do Gestor - Sistema Minerva ERP
'use client';

import { useMemo } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  UserPlus,
  Target
} from 'lucide-react';
import { MetricCard } from './metric-card';
import { OSStatusChart } from './os-status-chart';
import { RecentOSList } from './recent-os-list';
import { OrdemServico, Delegacao, User, normalizeSetorOS } from '../../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface DashboardGestorProps {
  currentUser: User;
  ordensServico: OrdemServico[];
  delegacoes: Delegacao[];
  onOSClick?: (os: OrdemServico) => void;
  onViewAllOS?: () => void;
  onDelegarClick?: () => void;
}

export function DashboardGestor({
  currentUser,
  ordensServico,
  delegacoes,
  onOSClick,
  onViewAllOS,
  onDelegarClick,
}: DashboardGestorProps) {
  // Filtrar OS do setor do gestor
  const osDoSetor = useMemo(() => {
    return ordensServico.filter(os => {
      // Fallback para encontrar o setor, já que a interface pode não ter o campo explícito
      const setorOS = (os as any).setor || (os as any).tipoOS?.setor;
      return normalizeSetorOS(setorOS) === normalizeSetorOS(currentUser.setor);
    });
  }, [ordensServico, currentUser]);

  // Calcular métricas
  const metrics = useMemo(() => {
    const total = osDoSetor.length;
    const emAndamento = osDoSetor.filter(os =>
      (os as any).status === 'em_andamento' || (os as any).status === 'em_execucao'
    ).length;
    const concluidas = osDoSetor.filter(os => (os as any).status === 'concluido').length;
    const minhasOS = osDoSetor.filter(os => os.responsavel_id === currentUser.id).length;

    // Delegações enviadas pelo gestor
    const delegacoesEnviadas = delegacoes.filter(d =>
      d.delegante_id === currentUser.id
    );
    const delegacoesAtivas = delegacoesEnviadas.filter(d =>
      d.status_delegacao === 'pendente' || d.status_delegacao === 'aceita'
    ).length;
    const aguardandoAprovacao = delegacoesEnviadas.filter(d =>
      d.status_delegacao === 'concluida'
    ).length;

    // Taxa de conclusão do setor
    const taxaConclusao = total > 0
      ? Math.round((concluidas / total) * 100)
      : 0;

    return {
      total,
      emAndamento,
      concluidas,
      minhasOS,
      delegacoesAtivas,
      aguardandoAprovacao,
      taxaConclusao,
    };
  }, [osDoSetor, delegacoes, currentUser]);

  // Equipe (delegações)
  const equipe = useMemo(() => {
    const colaboradoresMap = new Map<string, { nome: string; tarefas: number; concluidas: number }>();

    delegacoes
      .filter(d => d.delegante_id === currentUser.id)
      .forEach(d => {
        const existing = colaboradoresMap.get(d.delegado_id) || {
          nome: d.delegado_nome || 'Desconhecido',
          tarefas: 0,
          concluidas: 0,
        };

        existing.tarefas++;
        if (d.status_delegacao === 'concluida') {
          existing.concluidas++;
        }

        colaboradoresMap.set(d.delegado_id, existing);
      });

    return Array.from(colaboradoresMap.entries())
      .map(([id, data]) => ({
        id,
        ...data,
        performance: data.tarefas > 0
          ? Math.round((data.concluidas / data.tarefas) * 100)
          : 0,
      }))
      .sort((a, b) => b.performance - a.performance);
  }, [delegacoes, currentUser]);

  const getSetorLabel = (setor: string) => {
    const labels: Record<string, string> = {
      COM: 'Comercial',
      ASS: 'Assessoria',
      OBR: 'Obras',
    };
    return labels[setor] || setor;
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold mb-2">
          Dashboard - {getSetorLabel(currentUser.setor || '')}
        </h1>
        <p className="text-neutral-600">
          Gerencie as ordens de serviço do seu setor
        </p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title={`OS do ${getSetorLabel(currentUser.setor || '')}`}
          value={metrics.total}
          icon={FileText}
          variant="primary"
          description="Total de ordens no setor"
          onClick={onViewAllOS}
        />

        <MetricCard
          title="Em Andamento"
          value={metrics.emAndamento}
          icon={Clock}
          variant="default"
          description="OS ativas no momento"
        />

        <MetricCard
          title="Minhas OS"
          value={metrics.minhasOS}
          icon={Users}
          variant="default"
          description="Sob minha responsabilidade"
        />

        <MetricCard
          title="Taxa de Conclusão"
          value={`${metrics.taxaConclusao}%`}
          icon={Target}
          variant={metrics.taxaConclusao >= 80 ? 'success' : 'warning'}
          description="Performance do setor"
          trend={metrics.taxaConclusao >= 80 ? {
            value: 5,
            label: 'vs. mês anterior',
            direction: 'up',
          } : undefined}
        />
      </div>

      {/* Métricas de Delegação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Tarefas Delegadas"
          value={metrics.delegacoesAtivas}
          icon={UserPlus}
          variant="default"
          description="Em andamento na equipe"
          onClick={onDelegarClick}
        />

        <MetricCard
          title="Aguardando Aprovação"
          value={metrics.aguardandoAprovacao}
          icon={CheckCircle2}
          variant={metrics.aguardandoAprovacao > 0 ? 'warning' : 'success'}
          description="Tarefas para revisar"
        />

        <MetricCard
          title="Concluídas"
          value={metrics.concluidas}
          icon={CheckCircle2}
          variant="success"
          description="OS finalizadas"
        />
      </div>

      {/* Gráficos e Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OSStatusChart
          ordensServico={osDoSetor}
          title={`Status - ${getSetorLabel(currentUser.setor || '')}`}
          height={300}
        />

        <RecentOSList
          ordensServico={osDoSetor}
          limit={6}
          title="OS Recentes do Setor"
          onOSClick={onOSClick}
          onViewAll={onViewAllOS}
        />
      </div>

      {/* Performance da Equipe */}
      {equipe.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance da Equipe</CardTitle>
            <p className="text-sm text-neutral-600">
              Colaboradores com tarefas delegadas
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {equipe.map((colaborador) => (
                <div
                  key={colaborador.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getInitials(colaborador.nome)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate mb-1">
                      {colaborador.nome}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {colaborador.concluidas} de {colaborador.tarefas} tarefas concluídas
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`
                        ${colaborador.performance >= 80 ? 'bg-green-50 text-green-700 border-green-200' : ''}
                        ${colaborador.performance >= 50 && colaborador.performance < 80 ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                        ${colaborador.performance < 50 ? 'bg-red-50 text-red-700 border-red-200' : ''}
                      `}
                    >
                      {colaborador.performance}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas e Ações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aprovações Pendentes */}
        {metrics.aguardandoAprovacao > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-1">
                  {metrics.aguardandoAprovacao} {metrics.aguardandoAprovacao === 1 ? 'Tarefa' : 'Tarefas'} para Aprovar
                </h3>
                <p className="text-sm text-amber-700 mb-3">
                  Sua equipe concluiu tarefas que aguardam sua aprovação.
                </p>
                <button className="text-sm font-medium text-amber-900 hover:text-amber-700 underline">
                  Revisar aprovações →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delegar Tarefas */}
        <div
          className="bg-primary/5 border border-primary/20 rounded-lg p-6 cursor-pointer hover:bg-primary/10 transition-colors"
          onClick={onDelegarClick}
        >
          <div className="flex items-start gap-3">
            <UserPlus className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">
                Delegar Tarefas
              </h3>
              <p className="text-sm text-neutral-700 mb-3">
                Distribua ordens de serviço para sua equipe e acompanhe o progresso.
              </p>
              <span className="text-sm font-medium text-primary">
                Criar nova delegação →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
