// Dashboard da Diretoria - Sistema Minerva ERP
'use client';

import { useMemo } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Building2,
  TrendingUp
} from 'lucide-react';
import { MetricCard } from './metric-card';
import { OSStatusChart } from './os-status-chart';
import { OSSetorChart } from './os-setor-chart';
import { RecentOSList } from './recent-os-list';
import { OrdemServico, Delegacao, normalizeSetorOS } from '../../lib/types';

interface DashboardDiretoriaProps {
  ordensServico: OrdemServico[];
  delegacoes: Delegacao[];
  onOSClick?: (os: OrdemServico) => void;
  onViewAllOS?: () => void;
}

export function DashboardDiretoria({
  ordensServico,
  delegacoes,
  onOSClick,
  onViewAllOS,
}: DashboardDiretoriaProps) {
  // Calcular métricas
  const metrics = useMemo(() => {
    const total = ordensServico.length;
    const emAndamento = ordensServico.filter(os =>
      (os as any).status === 'em_andamento' || (os as any).status === 'em_execucao'
    ).length;
    const concluidas = ordensServico.filter(os => (os as any).status === 'concluido').length;
    const atrasadas = ordensServico.filter(os => {
      // Considerar atrasadas: pendentes há mais de 7 dias
      if ((os as any).status === 'pendente' || (os as any).status === 'em_triagem') {
        const createdAt = new Date(os.created_at || (os as any).data_criacao || 0);
        const daysSince = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return daysSince > 7;
      }
      return false;
    }).length;

    // Delegações pendentes que precisam de aprovação
    const delegacoesPendentes = delegacoes.filter(d =>
      d.status_delegacao === 'concluida'
    ).length;

    // Taxa de conclusão (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const osUltimos30Dias = ordensServico.filter(os => {
      const createdAt = new Date(os.created_at || (os as any).data_criacao || 0);
      return createdAt >= thirtyDaysAgo;
    });

    const concluidasUltimos30 = osUltimos30Dias.filter(os => (os as any).status === 'concluido').length;
    const taxaConclusao = osUltimos30Dias.length > 0
      ? Math.round((concluidasUltimos30 / osUltimos30Dias.length) * 100)
      : 0;

    return {
      total,
      emAndamento,
      concluidas,
      atrasadas,
      delegacoesPendentes,
      taxaConclusao,
    };
  }, [ordensServico, delegacoes]);

  // Dividir OS por setor
  const osPorSetor = useMemo(() => {
    return {
      comercial: ordensServico.filter(os => {
        const setor = (os as any).setor || (os as any).tipoOS?.setor;
        return normalizeSetorOS(setor) === 'administrativo'; // Comercial -> Administrativo
      }),
      assessoria: ordensServico.filter(os => {
        const setor = (os as any).setor || (os as any).tipoOS?.setor;
        return normalizeSetorOS(setor) === 'assessoria';
      }),
      obras: ordensServico.filter(os => {
        const setor = (os as any).setor || (os as any).tipoOS?.setor;
        return normalizeSetorOS(setor) === 'obras';
      }),
    };
  }, [ordensServico]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold mb-2">Dashboard Executivo</h1>
        <p className="text-neutral-600">
          Visão geral completa do sistema • Atualizado em tempo real
        </p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de OS"
          value={metrics.total}
          icon={FileText}
          variant="primary"
          description="Todas as ordens de serviço"
          onClick={onViewAllOS}
        />

        <MetricCard
          title="Em Andamento"
          value={metrics.emAndamento}
          icon={Clock}
          variant="default"
          description="OS ativas no momento"
          trend={{
            value: 12,
            label: 'vs. mês anterior',
            direction: 'up',
          }}
        />

        <MetricCard
          title="Concluídas"
          value={metrics.concluidas}
          icon={CheckCircle2}
          variant="success"
          description={`Taxa de ${metrics.taxaConclusao}% (30 dias)`}
          trend={{
            value: 8,
            label: 'vs. mês anterior',
            direction: 'up',
          }}
        />

        <MetricCard
          title="Atrasadas"
          value={metrics.atrasadas}
          icon={AlertTriangle}
          variant={metrics.atrasadas > 0 ? 'danger' : 'success'}
          description="Mais de 7 dias pendentes"
          trend={metrics.atrasadas > 0 ? {
            value: -5,
            label: 'vs. mês anterior',
            direction: 'down',
          } : undefined}
        />
      </div>

      {/* Métricas por Setor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Comercial"
          value={osPorSetor.comercial.length}
          icon={Users}
          variant="default"
          description={`${osPorSetor.comercial.filter(os => (os as any).status === 'em_andamento').length} em andamento`}
        />

        <MetricCard
          title="Assessoria"
          value={osPorSetor.assessoria.length}
          icon={Building2}
          variant="default"
          description={`${osPorSetor.assessoria.filter(os => (os as any).status === 'em_andamento').length} em andamento`}
        />

        <MetricCard
          title="Obras"
          value={osPorSetor.obras.length}
          icon={TrendingUp}
          variant="default"
          description={`${osPorSetor.obras.filter(os => (os as any).status === 'em_andamento').length} em andamento`}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OSStatusChart ordensServico={ordensServico} height={350} />
        <OSSetorChart ordensServico={ordensServico} height={350} />
      </div>

      {/* Lista de OS Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOSList
          ordensServico={ordensServico}
          limit={5}
          onOSClick={onOSClick}
          onViewAll={onViewAllOS}
        />

        {/* Aprovações Pendentes */}
        {metrics.delegacoesPendentes > 0 && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-1">
                  {metrics.delegacoesPendentes} {metrics.delegacoesPendentes === 1 ? 'Aprovação Pendente' : 'Aprovações Pendentes'}
                </h3>
                <p className="text-sm text-amber-700 mb-4">
                  Tarefas delegadas foram concluídas e aguardam sua aprovação.
                </p>
                <button className="text-sm font-medium text-amber-900 hover:text-amber-700 underline">
                  Ver delegações →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Insights e Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OS Atrasadas */}
        {metrics.atrasadas > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">
                  Atenção: OS Atrasadas
                </h3>
                <p className="text-sm text-red-700">
                  Existem {metrics.atrasadas} ordens de serviço pendentes há mais de 7 dias.
                  Revise e tome ações necessárias.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Performance do Mês */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">
                Performance do Mês
              </h3>
              <p className="text-sm text-green-700">
                Taxa de conclusão de {metrics.taxaConclusao}% nos últimos 30 dias.
                {metrics.taxaConclusao >= 80 ? ' Excelente desempenho!' : ' Continue melhorando!'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
