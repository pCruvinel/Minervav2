import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Clock, Users, Target } from 'lucide-react';
import { useDashboardMetrics } from '@/lib/hooks/use-recrutamento';
import { VagasPorMesChart } from './charts/vagas-por-mes-chart';
import { FunilRecrutamentoChart } from './charts/funil-recrutamento-chart';
import { TempoPreenchimentoChart } from './charts/tempo-preenchimento-chart';

const PERIODO_OPTIONS = [
  { value: '30', label: 'Últimos 30 dias' },
  { value: '60', label: 'Últimos 60 dias' },
  { value: '90', label: 'Últimos 90 dias' },
] as const;

export function DashboardRecrutamento() {
  const [periodoDias, setPeriodoDias] = useState<30 | 60 | 90>(90);
  const { metrics, loading, filteredRequisicoes } = useDashboardMetrics(periodoDias);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Carregando métricas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtro de Período */}
      <div className="flex items-center justify-end">
        <Select
          value={String(periodoDias)}
          onValueChange={(v) => setPeriodoDias(Number(v) as 30 | 60 | 90)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            {PERIODO_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Vagas Request */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total de Vagas Demandadas</CardTitle>
            <Briefcase className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalVagas}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Nos últimos {periodoDias} dias
            </p>
          </CardContent>
        </Card>

        {/* Em Aberto */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Vagas em Aberto</CardTitle>
            <Users className="w-4 h-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{metrics.vagasAbertas}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Em seleção ou ativas
            </p>
          </CardContent>
        </Card>

        {/* Tempo Médio */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Tempo Médio de Fechamento</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.tempoMedio} dias</div>
            <p className="text-xs text-muted-foreground mt-1">
              Vagas já preenchidas
            </p>
          </CardContent>
        </Card>

        {/* Taxa de Conversão */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Taxa de Preenchimento</CardTitle>
            <Target className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{metrics.taxaConversao}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.vagasPreenchidas} preenchidas de {metrics.totalVagas}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Histórico de Demandas (Mensal)</CardTitle>
            <CardDescription>
              Volume de novas requisições de vagas criadas nos últimos {periodoDias} dias.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <VagasPorMesChart requisicoes={filteredRequisicoes} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Funil Geral de Candidaturas</CardTitle>
            <CardDescription>
              Visão macro dos candidatos em processo atual (aprovados omitidos no funil em curso).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FunilRecrutamentoChart requisicoes={filteredRequisicoes} />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
         <Card>
          <CardHeader>
            <CardTitle>SLA / Tempo de Fechamento</CardTitle>
            <CardDescription>
              Evolução do tempo médio em dias para preenchimento de posições, por mês.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TempoPreenchimentoChart requisicoes={filteredRequisicoes} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
