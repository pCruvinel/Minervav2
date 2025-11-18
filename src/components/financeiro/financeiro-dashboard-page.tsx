import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Mock data - Em produção virá do Supabase
const mockKPIs = {
  previsaoReceitaMes: 248000,
  previsaoFaturasMes: 114000,
  aReceberHoje: 22987,
  aPagarHoje: 6785,
  lucroMes: 134000, // Calculado: Receita - Despesas
  totalClientesMes: 47
};

// Dados de comparação mensal (últimos 6 meses)
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

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconBgColor?: string;
}

function KPICard({ title, value, icon, trend, iconBgColor = 'bg-primary/10' }: KPICardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl mb-2">{value}</h3>
            {trend && (
              <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span>{trend.value}</span>
              </div>
            )}
          </div>
          <div className={`${iconBgColor} rounded-full p-3`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface FinanceiroDashboardPageProps {
  onNavigate?: (page: string) => void;
}

export function FinanceiroDashboardPage({ onNavigate }: FinanceiroDashboardPageProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="p-6 space-y-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Dashboard Financeiro</h1>
        <p className="text-muted-foreground">
          Painel de Bordo da Diretoria - Visão Consolidada de Receitas, Despesas e Indicadores
        </p>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          title="Previsão Total de Receita (Mês)"
          value={formatCurrency(mockKPIs.previsaoReceitaMes)}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          iconBgColor="bg-primary/10"
          trend={{ value: '+8.5% vs mês anterior', isPositive: true }}
        />

        <KPICard
          title="Previsão de Faturas (Mês)"
          value={formatCurrency(mockKPIs.previsaoFaturasMes)}
          icon={<Wallet className="h-5 w-5 text-orange-600" />}
          iconBgColor="bg-orange-100"
          trend={{ value: '+3.2% vs mês anterior', isPositive: true }}
        />

        <KPICard
          title="A Receber HOJE"
          value={formatCurrency(mockKPIs.aReceberHoje)}
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          iconBgColor="bg-green-100"
        />

        <KPICard
          title="A Pagar HOJE"
          value={formatCurrency(mockKPIs.aPagarHoje)}
          icon={<Calendar className="h-5 w-5 text-red-600" />}
          iconBgColor="bg-red-100"
        />

        <KPICard
          title="Lucro (Mês)"
          value={formatCurrency(mockKPIs.lucroMes)}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          iconBgColor="bg-primary/10"
          trend={{ value: '+12.8% vs mês anterior', isPositive: true }}
        />

        <KPICard
          title="Total Clientes (Mês)"
          value={mockKPIs.totalClientesMes.toString()}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          iconBgColor="bg-blue-100"
          trend={{ value: '+5 novos clientes', isPositive: true }}
        />
      </div>

      {/* Gráficos de Comparação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico: Receitas - Previsto vs. Realizado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Receitas - Previsto vs. Realizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockReceitasComparacao}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="mes" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '14px' }}
                  formatter={(value) => value === 'previsto' ? 'Previsto' : 'Realizado'}
                />
                <Bar dataKey="previsto" fill="#D3AF37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="realizado" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico: Despesas - Previsto vs. Realizado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Despesas - Previsto vs. Realizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockDespesasComparacao}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="mes" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '14px' }}
                  formatter={(value) => value === 'previsto' ? 'Previsto' : 'Realizado'}
                />
                <Bar dataKey="previsto" fill="#DDC063" radius={[4, 4, 0, 0]} />
                <Bar dataKey="realizado" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Variação */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Variação (Mês Atual)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Variação de Receitas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="text-sm">Receitas</span>
                <span className="text-sm text-muted-foreground">Dez/2024</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Previsto:</span>
                  <span className="font-medium">{formatCurrency(248000)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Realizado:</span>
                  <span className="font-medium">{formatCurrency(241000)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm">Variação:</span>
                  <span className="font-medium text-red-600">-{formatCurrency(7000)} (-2.8%)</span>
                </div>
              </div>
            </div>

            {/* Variação de Despesas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="text-sm">Despesas</span>
                <span className="text-sm text-muted-foreground">Dez/2024</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Previsto:</span>
                  <span className="font-medium">{formatCurrency(114000)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Realizado:</span>
                  <span className="font-medium">{formatCurrency(107000)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm">Variação:</span>
                  <span className="font-medium text-green-600">-{formatCurrency(7000)} (-6.1%)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Prestação de Contas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Prestação de Contas
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Relatórios detalhados de lucratividade por projeto
              </p>
            </div>
            {onNavigate && (
              <Button onClick={() => onNavigate('prestacao-contas')}>
                Ver Relatório Completo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card: Obras */}
            <div className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                 onClick={() => onNavigate && onNavigate('prestacao-contas')}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Obras</h4>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Lucro calculado após encerramento do contrato
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-medium text-green-600">R$ 45.5k</span>
                <span className="text-xs text-muted-foreground">(1 projeto encerrado)</span>
              </div>
            </div>

            {/* Card: Assessoria Anual */}
            <div className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                 onClick={() => onNavigate && onNavigate('prestacao-contas')}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Assessoria Anual</h4>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Lucro calculado mensalmente
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-medium text-green-600">R$ 24.2k</span>
                <span className="text-xs text-muted-foreground">(mês atual)</span>
              </div>
            </div>

            {/* Card: Laudo Pontual */}
            <div className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                 onClick={() => onNavigate && onNavigate('prestacao-contas')}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Laudo Pontual</h4>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Lucro calculado após encerramento
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl text-muted-foreground">Em andamento</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}