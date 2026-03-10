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
  TrendingDown,
  DollarSign, 
  Receipt, 
  PiggyBank,
  Building2,
  HardHat,
  BarChart3,
  Calendar,
  AlertTriangle,
  Download,
  RefreshCw,
  Wallet,
  ClipboardList,
  CalendarDays,
  MapPin,
  FileText,
  MoreHorizontal,
  Loader2,
  Banknote,
  ArrowRight
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
import { useNavigate } from '@tanstack/react-router';

import { PageHeader } from '@/components/shared/page-header';

// Hooks Analíticos
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

// Hooks Fluxo de Caixa e Operacionais
import { useFinanceiroDashboard, useAnaliseVariacao } from '@/lib/hooks/use-financeiro-dashboard';
import { useFluxoCaixaKPIs, useFluxoMensal } from '@/lib/hooks/use-fluxo-caixa';

// Componentes
import { PeriodoSelector } from './periodo-selector';
import { KPICardComparativo, KPIGrid } from './kpi-card-comparativo';
import { KPICardFinanceiro } from './kpi-card-financeiro';
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils';

// ============================================================
// COMPONENT
// ============================================================

export function FinanceiroDashboardPage() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<PeriodoFiltro>(getPeriodoPreset('thisMonth'));
  const [setorFiltro, setSetorFiltro] = useState<SetorFiltro>('TODOS');

  // ==================== HOOKS ====================
  // 1. Analítico (Lucratividade, Receitas, Despesas)
  const { data: kpis, isLoading: kpisLoading, refetch: refetchAnalitico } = useDashboardAnaliticoKPIs({ periodo });
  const { data: totais, isLoading: totaisLoading } = useTotaisConsolidados({ periodo });
  const { data: evolucao, isLoading: evolucaoLoading } = useEvolucaoMensal(12);
  const { data: custosPorCategoria, isLoading: custosLoading } = useCustosPorCategoria({ periodo, setor: setorFiltro });
  const { data: analiseCC, isLoading: ccLoading } = useAnaliseCentroCusto({ setor: setorFiltro });
  
  // 2. Operacional (A Receber Hoje, A Pagar Hoje)
  const { data: dashboardKPIs, isLoading: dashboardLoading, refetch: refetchDashboard } = useFinanceiroDashboard();
  const { data: analiseVariacao, isLoading: variacaoLoading } = useAnaliseVariacao();
  
  // 3. Fluxo de Caixa (Saldo Atual, Projeção)
  const { data: fluxoKPIs, isLoading: fluxoKpisLoading, refetch: refetchFluxo } = useFluxoCaixaKPIs();
  const { data: fluxoMensalData, isLoading: fluxoMensalLoading } = useFluxoMensal(12);

  const isLoading = kpisLoading || totaisLoading || dashboardLoading || fluxoKpisLoading;

  const handleRefresh = () => {
    refetchAnalitico();
    refetchDashboard();
    refetchFluxo();
  };

  const handleNavigate = (page: string) => {
    navigate({ to: `/financeiro/${page === 'dashboard' || page === 'dashboard-analitico' ? '' : page}` });
  };

  // KPIs de Setor
  const kpiASS = kpis?.find(k => k.setor === 'ASS');
  const kpiOBRAS = kpis?.find(k => k.setor === 'OBRAS');

  // Top 5 CCs mais/menos lucrativos (ordenar por lucro)
  const topCCs = analiseCC ? [...analiseCC].sort((a, b) => b.lucro - a.lucro).slice(0, 5) : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ========== Header com Filtros ========== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Painel Financeiro"
          subtitle="Visão Consolidada Financeira e Operacional"
          showBackButton={false}
        />
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Exportar
          </Button>
        </div>
      </div>

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

      {/* ========== Alertas Críticos ========== */}
      {fluxoKPIs && fluxoKPIs.saldoProjetado30Dias < fluxoKPIs.saldoAtual && (
        <Card className="border-yellow-300 bg-yellow-50/50 shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900">Atenção: Projeção de Caixa Reduzida</h4>
                <p className="text-sm text-neutral-600">
                  O saldo projetado para os próximos 30 dias ({formatCurrency(fluxoKPIs.saldoProjetado30Dias)}) é menor que o saldo atual ({formatCurrency(fluxoKPIs.saldoAtual)}).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== Acesso Rápido ========== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2 hover:shadow-card-hover hover:border-primary/30 transition-all font-bold bg-primary/5 border-primary/20 text-primary"
          onClick={() => handleNavigate('receitas-recorrentes')}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm">Receitas</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2 hover:shadow-card-hover hover:border-primary/30 transition-all font-bold bg-destructive/5 border-destructive/20 text-destructive"
          onClick={() => handleNavigate('despesas')}
        >
          <TrendingDown className="w-5 h-5" />
          <span className="text-sm">Despesas</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2 hover:shadow-card-hover hover:border-primary/30 transition-all"
          onClick={() => handleNavigate('centros-custo')}
        >
          <Building2 className="w-5 h-5 text-primary" />
          <span className="text-sm">Centros de Custo</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2 hover:shadow-card-hover hover:border-primary/30 transition-all"
          onClick={() => handleNavigate('conciliacao')}
        >
          <Wallet className="w-5 h-5 text-primary" />
          <span className="text-sm">Conciliação</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2 hover:shadow-card-hover hover:border-primary/30 transition-all"
          onClick={() => handleNavigate('requisicoes')}
        >
          <ClipboardList className="w-5 h-5 text-primary" />
          <span className="text-sm">Compras (BETA)</span>
        </Button>
      </div>

      {/* ========== KPIs Principais (Analítico + Operacional) ========== */}
      <h3 className="text-lg font-semibold mt-8 mb-2 border-b pb-2">Visão Estratégica</h3>
      <KPIGrid columns={3}>
        <KPICardComparativo
          title="Lucro"
          icon={Banknote}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <KPICardFinanceiro
          title="Saldo Atual de Caixa"
          value={fluxoKPIs?.saldoAtual ?? 0}
          icon={<Wallet className="w-6 h-6" />}
          variant="primary"
          loading={isLoading}
        />
        <KPICardFinanceiro
          title="Projeção 30 Dias"
          value={fluxoKPIs?.saldoProjetado30Dias ?? 0}
          icon={<CalendarDays className="w-6 h-6" />}
          variant={fluxoKPIs && fluxoKPIs.saldoProjetado30Dias > fluxoKPIs.saldoAtual ? 'success' : 'warning'}
          trend={{
            value: fluxoKPIs ? `${fluxoKPIs.saldoProjetado30Dias > fluxoKPIs.saldoAtual ? '+' : ''}${formatCurrency(fluxoKPIs.saldoProjetado30Dias - fluxoKPIs.saldoAtual)} a.m.` : '',
            isPositive: fluxoKPIs ? fluxoKPIs.saldoProjetado30Dias > fluxoKPIs.saldoAtual : true
          }}
          loading={isLoading}
        />
        <KPICardFinanceiro
          title="A Receber Hoje"
          value={dashboardKPIs?.aReceberHoje ?? 0}
          icon={<TrendingUp className="w-6 h-6" />}
          variant="success"
          subtitle="Vencimento hoje"
          onClick={() => handleNavigate('receitas-recorrentes')}
          loading={isLoading}
        />
        <KPICardFinanceiro
          title="A Pagar Hoje"
          value={dashboardKPIs?.aPagarHoje ?? 0}
          icon={<Calendar className="w-6 h-6" />}
          variant="destructive"
          subtitle="Vencimento hoje"
          onClick={() => handleNavigate('despesas')}
          loading={isLoading}
        />
      </div>

      {/* ========== Tabs de Análise Profunda ========== */}
      <Tabs defaultValue="fluxo" className="space-y-4 mt-8">
        <TabsList className="bg-muted/50 w-full justify-start overflow-x-auto">
          <TabsTrigger value="fluxo" className="gap-2">
            <BarChart3 className="h-4 w-4" /> Evolução Financeira
          </TabsTrigger>
          <TabsTrigger value="cc" className="gap-2">
            <Building2 className="h-4 w-4" /> Top Centros de Custo
          </TabsTrigger>
          <TabsTrigger value="categorias" className="gap-2">
            <PiggyBank className="h-4 w-4" /> Custos por Categoria
          </TabsTrigger>
          <TabsTrigger value="variacao" className="gap-2">
            <AlertTriangle className="h-4 w-4" /> Variação Orçamentária
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fluxo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-card lg:col-span-2">
              <CardHeader className="pb-4 bg-muted/20 border-b border-border/50">
                <CardTitle className="text-base font-semibold">Projeção de Fluxo de Caixa (Mensal)</CardTitle>
                <CardDescription>Entradas vs Saídas com Saldo Acumulado projetado para 12 meses</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {fluxoMensalLoading ? (
                  <div className="h-[380px] flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={380}>
                    <ComposedChart data={fluxoMensalData || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
                      <XAxis dataKey="mesLabel" className="text-muted-foreground text-xs" />
                      <YAxis yAxisId="left" stroke="#71717a" className="text-xs" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                      <YAxis yAxisId="right" orientation="right" stroke="#71717a" className="text-xs" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="entradas" fill="#22c55e" name="Entradas (R$)" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="left" dataKey="saidas" fill="#ef4444" name="Saídas (R$)" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="acumulado" name="Saldo Acumulado" stroke="#d3af37" strokeWidth={2} dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card lg:col-span-2">
              <CardHeader className="pb-4 bg-muted/20 border-b border-border/50">
                <CardTitle className="text-base font-semibold">Evolução do Faturamento (Últimos 12 meses)</CardTitle>
                <CardDescription>Receita Faturada vs Lucro Total</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {evolucaoLoading ? (
                  <div className="h-[380px] flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={380}>
                    <ComposedChart data={evolucao || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="mes_label" className="text-xs" />
                      <YAxis tickFormatter={(value) => formatCurrencyCompact(value)} className="text-xs" />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="receita_ass" name="Receita ASS" fill="hsl(var(--primary))" stackId="receita" />
                      <Bar dataKey="receita_obras" name="Receita OBRAS" fill="hsl(var(--primary) / 0.6)" stackId="receita" />
                      <Line type="monotone" dataKey="lucro_total" name="Lucro Total" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cc">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Top 5 Centros de Custo (Mais Lucrativos)</CardTitle>
                <CardDescription>Análise rápida da lucratividade por projeto filtrada no período</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleNavigate('centros-custo')}>
                Ver Todos <ArrowRight className="w-4 h-4 ml-2"/>
              </Button>
            </CardHeader>
            <CardContent>
              {ccLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Setor</TableHead>
                      <TableHead>Centro de Custo</TableHead>
                      <TableHead className="text-right">Receita</TableHead>
                      <TableHead className="text-right">Custo</TableHead>
                      <TableHead className="text-right">Lucro</TableHead>
                      <TableHead className="text-right">Margem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCCs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum dado encontrado</TableCell>
                      </TableRow>
                    ) : (
                      topCCs.map((cc) => (
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
                          <TableCell className="text-right font-medium">{formatCurrency(cc.receita)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatCurrency(cc.custo)}</TableCell>
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

        <TabsContent value="categorias">
          <Card>
            <CardHeader>
              <CardTitle>Custos por Categoria</CardTitle>
              <CardDescription>Agrupamento de despesas conforme plano de contas</CardDescription>
            </CardHeader>
            <CardContent>
              {custosLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Categoria</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Setor</TableHead>
                      <TableHead className="text-right">Valor Pago</TableHead>
                      <TableHead className="text-right">Total (Previsto + Pago)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(custosPorCategoria || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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
                          <TableCell className="text-right font-medium">{formatCurrency(item.valor_pago)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatCurrency(item.valor_total)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variacao">
          <Card className="shadow-card">
            <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
              <CardTitle className="text-base font-semibold">
                Análise de Variação - Orçamento vs. Realizado
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {variacaoLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3 p-4 rounded-lg bg-success/5 border border-success/20">
                    <div className="flex items-center justify-between pb-2 border-b border-success/20">
                      <span className="text-sm font-semibold text-success">Receitas (Deste mês)</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Previsto:</span>
                        <span className="font-medium">{formatCurrency(analiseVariacao?.receitas.previsto ?? 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Realizado:</span>
                        <span className="font-medium">{formatCurrency(analiseVariacao?.receitas.realizado ?? 0)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-success/20">
                        <span className="text-sm font-medium">Variação:</span>
                        <span className={`font-bold ${(analiseVariacao?.receitas.variacao ?? 0) >= 0 ? 'text-success' : 'text-warning'}`}>
                          {(analiseVariacao?.receitas.variacao ?? 0) >= 0 ? '+' : ''}
                          {formatCurrency(analiseVariacao?.receitas.variacao ?? 0)} ({analiseVariacao?.receitas.percentual ?? 0}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div className="flex items-center justify-between pb-2 border-b border-destructive/20">
                      <span className="text-sm font-semibold text-destructive">Despesas (Deste mês)</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Previsto:</span>
                        <span className="font-medium">{formatCurrency(analiseVariacao?.despesas.previsto ?? 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Realizado:</span>
                        <span className="font-medium">{formatCurrency(analiseVariacao?.despesas.realizado ?? 0)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-destructive/20">
                        <span className="text-sm font-medium">Variação:</span>
                        <span className={`font-bold ${(analiseVariacao?.despesas.variacao ?? 0) <= 0 ? 'text-success' : 'text-destructive'}`}>
                          {(analiseVariacao?.despesas.variacao ?? 0) >= 0 ? '+' : ''}
                          {formatCurrency(analiseVariacao?.despesas.variacao ?? 0)} ({analiseVariacao?.despesas.percentual ?? 0}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}