// Dashboard do Colaborador - Sistema Minerva ERP
'use client';

import { useMemo } from 'react';
import {
  ListTodo,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  TrendingUp,
  Target,
  Award
} from 'lucide-react';
import { MetricCard } from './metric-card';
import { RecentOSList } from './recent-os-list';
import { OrdemServico, Delegacao, User } from '../../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { calcularDiasAtraso } from '../../lib/utils/date-utils';

interface DashboardColaboradorProps {
  currentUser: User;
  ordensServico: OrdemServico[];
  delegacoes: Delegacao[];
  onOSClick?: (os: OrdemServico) => void;
  onDelegacaoClick?: (delegacao: Delegacao) => void;
  onViewAllOS?: () => void;
}

export function DashboardColaborador({
  currentUser,
  ordensServico,
  delegacoes,
  onOSClick,
  onDelegacaoClick,
  onViewAllOS,
}: DashboardColaboradorProps) {
  // Filtrar OS e delegações do colaborador
  const minhasOS = useMemo(() => {
    return ordensServico.filter(os => os.responsavel_id === currentUser.id);
  }, [ordensServico, currentUser]);

  const minhasDelegacoes = useMemo(() => {
    return delegacoes.filter(d => d.delegado_id === currentUser.id);
  }, [delegacoes, currentUser]);

  // Calcular métricas
  const metrics = useMemo(() => {
    // OS
    const totalOS = minhasOS.length;
    const osEmAndamento = minhasOS.filter(os =>
      os.status_geral === 'em_andamento'
    ).length;
    const osConcluidas = minhasOS.filter(os => os.status_geral === 'concluido').length;

    // Delegações
    const totalDelegacoes = minhasDelegacoes.length;
    const delegacoesPendentes = minhasDelegacoes.filter(d =>
      d.status_delegacao === 'pendente'
    ).length;
    const delegacoesEmProgresso = minhasDelegacoes.filter(d =>
      d.status_delegacao === 'aceita'
    ).length;
    const delegacoesConcluidas = minhasDelegacoes.filter(d =>
      d.status_delegacao === 'concluida'
    ).length;

    // Tarefas atrasadas
    const delegacoesAtrasadas = minhasDelegacoes.filter(d => {
      if (d.status_delegacao === 'concluida' || d.status_delegacao === 'recusada') {
        return false;
      }
      const prazo = new Date(d.data_prazo || '');
      const hoje = new Date();
      return prazo < hoje;
    }).length;

    // Performance
    const taxaConclusao = totalDelegacoes > 0
      ? Math.round((delegacoesConcluidas / totalDelegacoes) * 100)
      : 0;

    return {
      totalOS,
      osEmAndamento,
      osConcluidas,
      totalDelegacoes,
      delegacoesPendentes,
      delegacoesEmProgresso,
      delegacoesConcluidas,
      delegacoesAtrasadas,
      taxaConclusao,
    };
  }, [minhasOS, minhasDelegacoes]);

  // Próximas tarefas (ordenadas por prazo)
  const proximasTarefas = useMemo(() => {
    return minhasDelegacoes
      .filter(d => d.status_delegacao === 'pendente' || d.status_delegacao === 'aceita')
      .sort((a, b) => {
        const dateA = new Date(a.data_prazo || '');
        const dateB = new Date(b.data_prazo || '');
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
  }, [minhasDelegacoes]);

  const getStatusBadge = (status: Delegacao['status_delegacao']) => {
    const configs = {
      pendente: {
        label: 'Pendente',
        className: 'bg-warning/10 text-warning border-warning/20',
      },
      aceita: {
        label: 'Em Progresso',
        className: 'bg-primary/10 text-primary border-primary/20',
      },
      concluida: {
        label: 'Concluída',
        className: 'bg-success/10 text-success border-success/20',
      },
      recusada: {
        label: 'Recusada',
        className: 'bg-destructive/10 text-destructive border-destructive/20',
      },
    };

    const config = configs[status];

    return (
      <Badge variant="outline" className={`${config.className} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const isPrazoProximo = (dataPrazo: string) => {
    const prazo = new Date(dataPrazo);
    const hoje = new Date();
    const diffDias = Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diffDias <= 3 && diffDias >= 0;
  };

  const isPrazoVencido = (dataPrazo: string) => {
    const prazo = new Date(dataPrazo);
    const hoje = new Date();
    return prazo < hoje;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold mb-2">Minhas Tarefas</h1>
        <p className="text-muted-foreground">
          Acompanhe suas ordens de serviço e delegações
        </p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Tarefas Ativas"
          value={metrics.delegacoesPendentes + metrics.delegacoesEmProgresso}
          icon={ListTodo}
          variant="primary"
          description="Pendentes + Em progresso"
        />

        <MetricCard
          title="Em Progresso"
          value={metrics.delegacoesEmProgresso}
          icon={Clock}
          variant="default"
          description="Tarefas que você iniciou"
        />

        <MetricCard
          title="Concluídas"
          value={metrics.delegacoesConcluidas}
          icon={CheckCircle2}
          variant="success"
          description="Tarefas finalizadas"
        />

        <MetricCard
          title="Atrasadas"
          value={metrics.delegacoesAtrasadas}
          icon={AlertCircle}
          variant={metrics.delegacoesAtrasadas > 0 ? 'danger' : 'success'}
          description="Atenção necessária"
        />
      </div>

      {/* Métricas Secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Minhas OS"
          value={metrics.totalOS}
          icon={Target}
          variant="default"
          description={`${metrics.osEmAndamento} em andamento`}
          onClick={onViewAllOS}
        />

        <MetricCard
          title="Performance"
          value={`${metrics.taxaConclusao}%`}
          icon={TrendingUp}
          variant={metrics.taxaConclusao >= 80 ? 'success' : 'warning'}
          description="Taxa de conclusão"
          trend={metrics.taxaConclusao >= 80 ? {
            value: 10,
            label: 'vs. mês anterior',
            direction: 'up',
          } : undefined}
        />

        <MetricCard
          title="Total de Tarefas"
          value={metrics.totalDelegacoes}
          icon={Award}
          variant="default"
          description="Delegações recebidas"
        />
      </div>

      {/* Próximas Tarefas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Próximas Tarefas
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tarefas ordenadas por prazo
          </p>
        </CardHeader>
        <CardContent>
          {proximasTarefas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mb-3 text-success" />
              <p className="text-sm font-medium">Nenhuma tarefa pendente</p>
              <p className="text-xs text-muted-foreground mt-1">
                Parabéns! Você está em dia com suas tarefas.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {proximasTarefas.map((delegacao) => {
                const prazoVencido = isPrazoVencido(delegacao.data_prazo || '');
                const prazoProximo = isPrazoProximo(delegacao.data_prazo || '');

                return (
                  <div
                    key={delegacao.id}
                    className={`
                      p-4 rounded-lg border-2 transition-all cursor-pointer
                      hover:border-primary hover:bg-primary/5
                      ${prazoVencido ? 'border-l-4 border-l-red-500 bg-destructive/5' : ''}
                      ${prazoProximo && !prazoVencido ? 'border-l-4 border-l-amber-500 bg-warning/5' : ''}
                      ${!prazoVencido && !prazoProximo ? 'border-border' : ''}
                    `}
                    onClick={() => onDelegacaoClick?.(delegacao)}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">
                            Delegado por {delegacao.delegante_nome}
                          </p>
                          {getStatusBadge(delegacao.status_delegacao)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {delegacao.descricao_tarefa}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Prazo: {delegacao.data_prazo ? new Date(delegacao.data_prazo).toLocaleDateString('pt-BR') : 'Sem prazo'}</span>
                        </div>

                        {prazoVencido && (
                          <Badge variant="outline" className="bg-destructive/5 text-destructive border-destructive/20 text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {calcularDiasAtraso(delegacao.data_prazo || '')} dias atrasado
                          </Badge>
                        )}

                        {prazoProximo && !prazoVencido && (
                          <Badge variant="outline" className="bg-warning/5 text-warning border-warning/20 text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Prazo próximo
                          </Badge>
                        )}
                      </div>

                      {delegacao.status_delegacao === 'pendente' && (
                        <Button size="sm" variant="outline">
                          Iniciar
                        </Button>
                      )}

                      {delegacao.status_delegacao === 'aceita' && (
                        <Button size="sm" className="bg-success hover:bg-success">
                          Concluir
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Minhas OS Recentes */}
      <RecentOSList
        ordensServico={minhasOS}
        limit={5}
        title="Minhas OS Recentes"
        onOSClick={onOSClick}
        onViewAll={onViewAllOS}
      />

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance */}
        {metrics.taxaConclusao >= 80 && (
          <div className="bg-success/5 border border-success/20 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-success mb-1">
                  Excelente Performance!
                </h3>
                <p className="text-sm text-success">
                  Você tem {metrics.taxaConclusao}% de taxa de conclusão. Continue o ótimo trabalho!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alerta de Tarefas Atrasadas */}
        {metrics.delegacoesAtrasadas > 0 && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive mb-1">
                  Atenção: Tarefas Atrasadas
                </h3>
                <p className="text-sm text-destructive">
                  Você tem {metrics.delegacoesAtrasadas} {metrics.delegacoesAtrasadas === 1 ? 'tarefa atrasada' : 'tarefas atrasadas'}.
                  Priorize sua conclusão.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
