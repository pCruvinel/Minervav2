
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, AlertTriangle, DollarSign, BarChart3 } from 'lucide-react';
import { mockKPIsObras, mockEvolucaoFisicaGeral } from '@/lib/mock-data-gestores';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * DASHBOARD GESTOR DE OBRAS (Nível 3)
 * Exibe KPIs específicos para gestão de obras e cronogramas
 */

export function DashboardGestorObras() {
  const kpis = mockKPIsObras;
  const dadosGrafico = mockEvolucaoFisicaGeral;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Dashboard Gestor de Obras</h1>
        <p className="text-muted-foreground">
          Visão macro da gestão de obras e cronogramas
        </p>
      </div>

      {/* KPI Cards - Linha 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Obras em Andamento */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Obras em Andamento</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="font-mono" style={{ fontSize: '2rem' }}>{kpis.obrasEmAndamento}</div>
              <Badge variant="secondary">Ativas</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Obras em execução (OS 01-04, 13)
            </p>
          </CardContent>
        </Card>

        {/* Medições Pendentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Medições Pendentes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="font-mono" style={{ fontSize: '2rem' }}>{kpis.medicoesPendentes}</div>
              <Badge variant="default" className="bg-primary hover:bg-primary/90">
                Ação requerida
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Aguardando validação para faturamento
            </p>
          </CardContent>
        </Card>

        {/* Atrasos no Cronograma */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Atrasos no Cronograma</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="font-mono" style={{ fontSize: '2rem' }}>{kpis.atrasosNoCronograma}</div>
              <Badge variant="destructive">Crítico</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Obras com status "ATRASADO"
            </p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards - Linha 2 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Percentual Médio de Execução */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>% Médio de Execução</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="font-mono" style={{ fontSize: '2rem' }}>{kpis.percentualMedioExecucao.toFixed(1)}%</div>
              <Badge variant="outline">Todas as obras</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Evolução física média das obras ativas
            </p>
          </CardContent>
        </Card>

        {/* Valor Total Contratos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Valor Total Contratos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="font-mono" style={{ fontSize: '1.5rem' }}>
                R$ {(kpis.valorTotalContratos / 1000000).toFixed(2)}M
              </div>
              <Badge variant="outline">Total</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Soma de todos os contratos ativos
            </p>
          </CardContent>
        </Card>

        {/* Valor Total Medido */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Valor Total Medido</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="font-mono" style={{ fontSize: '1.5rem' }}>
                R$ {(kpis.valorTotalMedido / 1000000).toFixed(2)}M
              </div>
              <Badge variant="outline" className="border-success text-success">
                Executado
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {((kpis.valorTotalMedido / kpis.valorTotalContratos) * 100).toFixed(1)}% do total contratado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução Física Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Física Geral - Todas as Obras</CardTitle>
          <CardDescription>
            Comparativo entre planejado vs executado (últimos 6 meses)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis label={{ value: '% Execução', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="planejado"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Planejado"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="executado"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                name="Executado"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão à Vista - Obras</CardTitle>
          <CardDescription>
            Indicadores consolidados de desempenho
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taxa de Conclusão Média</span>
                <span className="font-mono">{kpis.percentualMedioExecucao.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Obras no Prazo</span>
                <span className="font-mono">{kpis.obrasEmAndamento - kpis.atrasosNoCronograma}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Obras Atrasadas</span>
                <span className="font-mono text-destructive">{kpis.atrasosNoCronograma}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Saldo a Executar</span>
                <span className="font-mono">
                  R$ {((kpis.valorTotalContratos - kpis.valorTotalMedido) / 1000000).toFixed(2)}M
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Medições Aprovadas (Mês)</span>
                <span className="font-mono">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Medições Aguardando</span>
                <span className="font-mono text-primary">{kpis.medicoesPendentes}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
