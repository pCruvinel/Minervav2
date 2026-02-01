import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  Wallet,
  FileText,
  ArrowRight,
  CalendarDays,
  Receipt,
  Banknote,
  Building2,
  ClipboardList,
  Loader2,
  BarChart3
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { KPICardFinanceiro, KPIFinanceiroGrid } from './kpi-card-financeiro';
import {
  useFinanceiroDashboard,
  useReceitasComparacao,
  useDespesasComparacao,
  useAnaliseVariacao,
  usePrestacaoContas
} from '@/lib/hooks/use-financeiro-dashboard';

// ============================================================
// MOCK DATA - Em produção virá do Supabase
// FRONTEND-ONLY MODE: Substituir por hooks reais
// ============================================================

const mockKPIs = {
  previsaoReceitaMes: 248000,
  receitaRealizadaMes: 241000,
  previsaoFaturasMes: 114000,
  faturasPagasMes: 107000,
  aReceberHoje: 22987,
  aPagarHoje: 6785,
  lucroMes: 134000,
  margemMes: 55.5,
  totalClientesAtivos: 47,
  totalOSAtivas: 12,
};

const mockReceitasComparacao = [
  { mes: 'Jul', previsto: 180000, realizado: 175000 },
  { mes: 'Ago', previsto: 195000, realizado: 198000 },
  { mes: 'Set', previsto: 210000, realizado: 205000 },
  { mes: 'Out', previsto: 225000, realizado: 232000 },
  { mes: 'Nov', previsto: 240000, realizado: 235000 },
  { mes: 'Dez', previsto: 248000, realizado: 241000 }
];

const mockDespesasComparacao = [
  { mes: 'Jul', previsto: 95000, realizado: 92000 },
  { mes: 'Ago', previsto: 102000, realizado: 105000 },
  { mes: 'Set', previsto: 108000, realizado: 106000 },
  { mes: 'Out', previsto: 115000, realizado: 118000 },
  { mes: 'Nov', previsto: 112000, realizado: 110000 },
  { mes: 'Dez', previsto: 114000, realizado: 107000 }
];

// ============================================================
// TYPES
// ============================================================

type PeriodoFiltro = 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear';

interface FinanceiroDashboardPageProps {
  onNavigate?: (page: string) => void;
}

const periodoLabels: Record<PeriodoFiltro, string> = {
  thisMonth: 'Este Mês',
  lastMonth: 'Mês Anterior',
  thisQuarter: 'Este Trimestre',
  thisYear: 'Este Ano',
};

// ============================================================
// COMPONENT
// ============================================================

/**
 * FinanceiroDashboardPage - Dashboard Financeiro
 * 
 * Painel de Bordo da Diretoria com visão consolidada de:
 * - KPIs de receitas, despesas e lucratividade
 * - Gráficos comparativos (previsto vs realizado)
 * - Análise de variação mensal
 * - Acesso rápido aos módulos financeiros
 */
export function FinanceiroDashboardPage({ onNavigate }: FinanceiroDashboardPageProps) {
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('thisMonth');

  // ========== HOOKS DE DADOS REAIS ==========
  const { data: dashboardKPIs, isLoading: kpisLoading } = useFinanceiroDashboard();
  const { data: receitasComparacao, isLoading: receitasLoading } = useReceitasComparacao();
  const { data: despesasComparacao, isLoading: despesasLoading } = useDespesasComparacao();
  const { data: analiseVariacao, isLoading: variacaoLoading } = useAnaliseVariacao();
  const { data: prestacaoContas, isLoading: prestacaoLoading } = usePrestacaoContas();

  const isLoading = kpisLoading || receitasLoading || despesasLoading || variacaoLoading || prestacaoLoading;

  // Dados com fallback para mock
  const kpis = dashboardKPIs ?? mockKPIs;
  const dadosReceitas = receitasComparacao ?? mockReceitasComparacao;
  const dadosDespesas = despesasComparacao ?? mockDespesasComparacao;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ========== Header com Filtro de Período ========== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Dashboard Financeiro"
          subtitle="Painel de Bordo da Diretoria - Visão Consolidada"
          showBackButton
        />
        <div className="flex items-center gap-3">
          <Select value={periodo} onValueChange={(v) => setPeriodo(v as PeriodoFiltro)}>
            <SelectTrigger className="w-[180px]">
              <CalendarDays className="w-4 h-4 mr-2 text-neutral-500" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">Este Mês</SelectItem>
              <SelectItem value="lastMonth">Mês Anterior</SelectItem>
              <SelectItem value="thisQuarter">Este Trimestre</SelectItem>
              <SelectItem value="thisYear">Este Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ========== KPIs Principais ========== */}
      <KPIFinanceiroGrid columns={3}>
        <KPICardFinanceiro
          title="Previsão de Receita"
          value={kpis.previsaoReceitaMes}
          icon={<TrendingUp className="w-6 h-6" />}
          variant="success"
          trend={{ value: `${periodoLabels[periodo]}`, isPositive: true }}
          onClick={() => handleNavigate('receitas-recorrentes')}
          loading={isLoading}
        />

        <KPICardFinanceiro
          title="Previsão de Faturas"
          value={kpis.previsaoFaturasMes}
          icon={<Receipt className="w-6 h-6" />}
          variant="warning"
          trend={{ value: `${periodoLabels[periodo]}`, isPositive: true }}
          onClick={() => handleNavigate('faturas-recorrentes')}
          loading={isLoading}
        />

        <KPICardFinanceiro
          title="Lucro Projetado"
          value={kpis.lucroMes}
          icon={<Banknote className="w-6 h-6" />}
          variant="primary"
          trend={{ value: `Margem: ${kpis.margemMes ?? 0}%`, isPositive: (kpis.margemMes ?? 0) > 0 }}
          onClick={() => handleNavigate('fluxo-caixa')}
          loading={isLoading}
        />
      </KPIFinanceiroGrid>

      {/* ========== Segunda linha de KPIs ========== */}
      <KPIFinanceiroGrid columns={3}>
        <KPICardFinanceiro
          title="A Receber Hoje"
          value={kpis.aReceberHoje}
          icon={<DollarSign className="w-6 h-6" />}
          variant="success"
          subtitle="Vencimento hoje"
          onClick={() => handleNavigate('receitas-recorrentes')}
          loading={isLoading}
        />

        <KPICardFinanceiro
          title="A Pagar Hoje"
          value={kpis.aPagarHoje}
          icon={<Calendar className="w-6 h-6" />}
          variant="destructive"
          subtitle="Vencimento hoje"
          onClick={() => handleNavigate('faturas-recorrentes')}
          loading={isLoading}
        />

        <KPICardFinanceiro
          title="Clientes Ativos"
          value={(kpis.totalClientesAtivos ?? 0).toString()}
          icon={<Users className="w-6 h-6" />}
          variant="info"
          subtitle={`${kpis.totalOSAtivas ?? 0} OS ativas`}
          loading={isLoading}
        />
      </KPIFinanceiroGrid>

      {/* ========== Ações Rápidas ========== */}
      <Card>
        <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
          <CardTitle className="text-base font-semibold">Acesso Rápido</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Button
              variant="default"
              className="h-auto py-4 flex flex-col items-center gap-2 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
              onClick={() => handleNavigate('dashboard-analitico')}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-medium">Analítico</span>
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
              <span className="text-sm">Compras</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:shadow-card-hover hover:border-primary/30 transition-all"
              onClick={() => handleNavigate('receitas-recorrentes')}
            >
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm">Receitas</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:shadow-card-hover hover:border-primary/30 transition-all"
              onClick={() => handleNavigate('fluxo-caixa')}
            >
              <Building2 className="w-5 h-5 text-primary" />
              <span className="text-sm">Fluxo de Caixa</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ========== Gráficos de Comparação ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico: Receitas */}
        <Card className="shadow-card">
          <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Receitas - Previsto vs. Realizado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-neutral-600">Carregando...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dadosReceitas}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="mes"
                    stroke="#71717a"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#71717a"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px 0 rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '14px' }}
                    formatter={(value) => value === 'previsto' ? 'Previsto' : 'Realizado'}
                  />
                  <Bar dataKey="previsto" fill="#d3af37" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="realizado" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gráfico: Despesas */}
        <Card className="shadow-card">
          <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Despesas - Previsto vs. Realizado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-neutral-600">Carregando...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dadosDespesas}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="mes"
                    stroke="#71717a"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#71717a"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px 0 rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '14px' }}
                    formatter={(value) => value === 'previsto' ? 'Previsto' : 'Realizado'}
                  />
                  <Bar dataKey="previsto" fill="#d3af37" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="realizado" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ========== Análise de Variação ========== */}
      <Card className="shadow-card">
        <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
          <CardTitle className="text-base font-semibold">
            Análise de Variação - {analiseVariacao?.periodo ?? periodoLabels[periodo]}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {variacaoLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Variação de Receitas */}
              <div className="space-y-3 p-4 rounded-lg bg-success/5 border border-success/20">
                <div className="flex items-center justify-between pb-2 border-b border-success/20">
                  <span className="text-sm font-semibold text-success">Receitas</span>
                  <span className="text-sm text-success/80">{analiseVariacao?.periodo ?? 'Este mês'}</span>
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
                    <span className={`font-bold ${(analiseVariacao?.receitas.variacao ?? 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {(analiseVariacao?.receitas.variacao ?? 0) >= 0 ? '+' : ''}
                      {formatCurrency(analiseVariacao?.receitas.variacao ?? 0)} ({analiseVariacao?.receitas.percentual ?? 0}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Variação de Despesas */}
              <div className="space-y-3 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="flex items-center justify-between pb-2 border-b border-destructive/20">
                  <span className="text-sm font-semibold text-destructive">Despesas</span>
                  <span className="text-sm text-destructive/80">{analiseVariacao?.periodo ?? 'Este mês'}</span>
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

      {/* ========== Prestação de Contas ========== */}
      <Card className="shadow-card">
        <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-base font-semibold">Prestação de Contas</CardTitle>
                <CardDescription>Lucratividade por tipo de projeto</CardDescription>
              </div>
            </div>
            <Button onClick={() => handleNavigate('prestacao-contas')}>
              Ver Relatório
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {prestacaoLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(prestacaoContas ?? []).map((item) => (
                <div
                  key={item.tipo}
                  className="p-4 border rounded-lg hover:shadow-card-hover hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => handleNavigate('prestacao-contas')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground">{item.tipo}</h4>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.projetosEmAndamento > 0 ? 'Em andamento' : 'Lucro após encerramento'}
                  </p>
                  <div className="flex items-baseline gap-2">
                    {item.lucroTotal > 0 ? (
                      <>
                        <span className="text-2xl font-bold text-success">
                          {formatCurrency(item.lucroTotal)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({item.projetosCount} {item.projetosCount === 1 ? 'projeto' : 'projetos'})
                        </span>
                      </>
                    ) : item.projetosEmAndamento > 0 ? (
                      <span className="text-lg text-muted-foreground">
                        {item.projetosEmAndamento} em andamento
                      </span>
                    ) : (
                      <span className="text-lg text-muted-foreground">Sem dados</span>
                    )}
                  </div>
                </div>
              ))}
              {/* Fallback se não houver dados */}
              {(!prestacaoContas || prestacaoContas.length === 0) && (
                <div className="col-span-3 text-center py-8 text-muted-foreground">
                  Nenhum dado de prestação de contas disponível
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}