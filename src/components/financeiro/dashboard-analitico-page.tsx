/**
 * DashboardAnaliticoPage - Dashboard Analítico Financeiro
 * 
 * Painel de Bordo da Diretoria e Coordenação Administrativa com:
 * - Filtros de período e setor
 * - KPIs segmentados (Lucro, Receita, Custo por setor)
 * - Gráfico de evolução mensal
 * - Tabela de custos por categoria
 * - Tabela de análise por Centro de Custo
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  PiggyBank,
  Building2,
  HardHat,
  BarChart3,
  ArrowLeft,
  Download,
  RefreshCw,
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Bar,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';
import { useNavigate, Link } from '@tanstack/react-router';
import { 
  useDashboardAnaliticoKPIs, 
  useEvolucaoMensal, 
  useCustosPorCategoria,
  useAnaliseCentroCusto,
  useTotaisConsolidados,
  getPeriodoPreset,
  type PeriodoFiltro,
  type SetorFiltro,
} from '@/lib/hooks/use-dashboard-analitico';
import { PeriodoSelector } from './periodo-selector';
import { KPICardComparativo, KPIGrid } from './kpi-card-comparativo';

// ============================================================
// HELPERS
// ============================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrencyCompact(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return formatCurrency(value);
}

// ============================================================
// COMPONENT
// ============================================================

export function DashboardAnaliticoPage() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<PeriodoFiltro>(getPeriodoPreset('thisMonth'));
  const [setorFiltro, setSetorFiltro] = useState<SetorFiltro>('TODOS');

  // Data Hooks
  const { data: kpis, isLoading: kpisLoading, refetch } = useDashboardAnaliticoKPIs({ periodo });
  const { data: totais, isLoading: totaisLoading } = useTotaisConsolidados({ periodo });
  const { data: evolucao, isLoading: evolucaoLoading } = useEvolucaoMensal(12);
  const { data: custosPorCategoria, isLoading: custosLoading } = useCustosPorCategoria({ 
    periodo, 
    setor: setorFiltro 
  });
  const { data: analiseCC, isLoading: ccLoading } = useAnaliseCentroCusto({ 
    setor: setorFiltro 
  });

  const isLoading = kpisLoading || totaisLoading;

  // Extrair valores por setor
  const kpiASS = kpis?.find(k => k.setor === 'ASS');
  const kpiOBRAS = kpis?.find(k => k.setor === 'OBRAS');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/financeiro">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Dashboard Analítico</h1>
            <p className="text-sm text-muted-foreground">
              Visão consolidada para Diretoria e Coordenação
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Período:</span>
              <PeriodoSelector value={periodo} onChange={setPeriodo} showPresets />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Setor:</span>
              <Select value={setorFiltro} onValueChange={(v) => setSetorFiltro(v as SetorFiltro)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="ASS">Assessoria</SelectItem>
                  <SelectItem value="OBRAS">Obras</SelectItem>
                  <SelectItem value="ADM">Administrativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Principais */}
      <KPIGrid columns={3}>
        <KPICardComparativo
          title="Lucro"
          icon={TrendingUp}
          total={totais?.lucro_realizado ?? 0}
          ass={kpiASS?.lucro_realizado}
          obras={kpiOBRAS?.lucro_realizado}
          variant={totais && totais.lucro_realizado > 0 ? 'success' : 'danger'}
          loading={isLoading}
          showPercentage
        />
        
        <KPICardComparativo
          title="Receita"
          icon={DollarSign}
          total={totais?.receita_realizada ?? 0}
          ass={kpiASS?.receita_realizada}
          obras={kpiOBRAS?.receita_realizada}
          variant="primary"
          loading={isLoading}
          showPercentage
        />
        
        <KPICardComparativo
          title="Custo Total"
          icon={Receipt}
          total={totais?.custo_pago ?? 0}
          ass={(kpiASS?.custo_operacional_pago ?? 0) + (kpiASS?.custo_mo ?? 0)}
          obras={(kpiOBRAS?.custo_operacional_pago ?? 0) + (kpiOBRAS?.custo_mo ?? 0)}
          variant="warning"
          loading={isLoading}
          showPercentage
        />
      </KPIGrid>

      {/* Gráfico de Evolução e Tabelas */}
      <Tabs defaultValue="evolucao" className="space-y-4">
        <TabsList>
          <TabsTrigger value="evolucao" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Evolução Mensal
          </TabsTrigger>
          <TabsTrigger value="custos" className="gap-2">
            <Receipt className="h-4 w-4" />
            Custos por Categoria
          </TabsTrigger>
          <TabsTrigger value="cc" className="gap-2">
            <PiggyBank className="h-4 w-4" />
            Análise por CC
          </TabsTrigger>
        </TabsList>

        {/* Tab: Evolução Mensal */}
        <TabsContent value="evolucao">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal de Lucro e Receita</CardTitle>
              <CardDescription>Comparativo dos últimos 12 meses</CardDescription>
            </CardHeader>
            <CardContent>
              {evolucaoLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={evolucao || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="mes_label" className="text-xs" />
                      <YAxis 
                        tickFormatter={(value) => formatCurrencyCompact(value)}
                        className="text-xs"
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `Mês: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="receita_ass" name="Receita ASS" fill="hsl(var(--primary))" stackId="receita" />
                      <Bar dataKey="receita_obras" name="Receita OBRAS" fill="hsl(var(--primary) / 0.6)" stackId="receita" />
                      <Line 
                        type="monotone" 
                        dataKey="lucro_total" 
                        name="Lucro Total" 
                        stroke="hsl(var(--success))" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Custos por Categoria */}
        <TabsContent value="custos">
          <Card>
            <CardHeader>
              <CardTitle>Custos por Categoria</CardTitle>
              <CardDescription>
                Agrupamento de despesas conforme classificação
              </CardDescription>
            </CardHeader>
            <CardContent>
              {custosLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Setor</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead className="text-right">Valor Pago</TableHead>
                      <TableHead className="text-right">Lançamentos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(custosPorCategoria || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nenhuma despesa encontrada no período
                        </TableCell>
                      </TableRow>
                    ) : (
                      custosPorCategoria?.map((item) => (
                        <TableRow key={`${item.categoria_id}-${item.setor}`}>
                          <TableCell className="font-medium">{item.categoria_nome}</TableCell>
                          <TableCell className="text-muted-foreground">{item.codigo_plano}</TableCell>
                          <TableCell>
                            <Badge variant={item.setor === 'OBRAS' ? 'default' : item.setor === 'ASS' ? 'secondary' : 'outline'}>
                              {item.setor}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.valor_total)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatCurrency(item.valor_pago)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {item.total_lancamentos}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Análise por Centro de Custo */}
        <TabsContent value="cc">
          <Card>
            <CardHeader>
              <CardTitle>Análise por Centro de Custo</CardTitle>
              <CardDescription>
                Lucratividade por CC com breakdown de receita, custo e margem
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ccLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Setor</TableHead>
                      <TableHead>Centro de Custo</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Receita</TableHead>
                      <TableHead className="text-right">Custo</TableHead>
                      <TableHead className="text-right">Lucro</TableHead>
                      <TableHead className="text-right">Margem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(analiseCC || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          Nenhum centro de custo encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      analiseCC?.map((cc) => (
                        <TableRow 
                          key={cc.cc_id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate({ to: '/financeiro/centro-custo/$ccId', params: { ccId: cc.cc_id } })}
                        >
                          <TableCell>
                            <Badge variant={cc.setor === 'OBRAS' ? 'default' : cc.setor === 'ASS' ? 'secondary' : 'outline'}>
                              {cc.setor === 'OBRAS' && <HardHat className="h-3 w-3 mr-1" />}
                              {cc.setor === 'ASS' && <Building2 className="h-3 w-3 mr-1" />}
                              {cc.setor}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{cc.cc_nome}</TableCell>
                          <TableCell className="text-muted-foreground max-w-[150px] truncate">
                            {cc.cliente_nome || '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(cc.receita)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatCurrency(cc.custo)}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${cc.lucro >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {formatCurrency(cc.lucro)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={cc.margem_pct >= 20 ? 'default' : cc.margem_pct >= 0 ? 'secondary' : 'destructive'}>
                              {cc.margem_pct.toFixed(1)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
