import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { useComprasKPIs } from '@/lib/hooks/use-aprovacao-requisicoes';
import { TabPendentesAprovacao } from './compras/tab-pendentes-aprovacao';
import { TabHistoricoCompras } from './compras/tab-historico-compras';
import { KPICardFinanceiro, KPIFinanceiroGrid } from './kpi-card-financeiro';

/**
 * GestaoComprasPage - Hub de Gestão de Compras (Procurement)
 *
 * Página principal para gerenciamento de requisições de compra (OS-09).
 * Inclui aprovação de requisições pendentes e histórico completo.
 */
export function GestaoComprasPage() {
  const { kpis, loading: loadingKPIs } = useComprasKPIs();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ========== Header ========== */}
      <PageHeader
        title="Gestão de Compras"
        subtitle="Aprovação de requisições e histórico de aquisições"
        showBackButton
      >
        <Button asChild>
          <Link to="/os/criar/requisicao-compras" search={{ osId: undefined }}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Requisição
          </Link>
        </Button>
      </PageHeader>

      {/* ========== KPIs ========== */}
      <KPIFinanceiroGrid columns={5}>
        <KPICardFinanceiro
          title="Pendentes"
          value={kpis?.pendentes?.toString() || '0'}
          icon={<Clock className="w-6 h-6" />}
          variant="warning"
          loading={loadingKPIs}
        />
        <KPICardFinanceiro
          title="Em Andamento"
          value={kpis?.emAndamento?.toString() || '0'}
          icon={<TrendingUp className="w-6 h-6" />}
          variant="primary"
          loading={loadingKPIs}
        />
        <KPICardFinanceiro
          title="Aprovadas (Mês)"
          value={kpis?.aprovadasMes?.toString() || '0'}
          icon={<CheckCircle className="w-6 h-6" />}
          variant="success"
          loading={loadingKPIs}
        />
        <KPICardFinanceiro
          title="Recusadas"
          value={kpis?.canceladas?.toString() || '0'}
          icon={<XCircle className="w-6 h-6" />}
          variant="destructive"
          loading={loadingKPIs}
        />
        <KPICardFinanceiro
          title="Valor Pendente"
          value={formatCurrency(kpis?.valorTotalPendente || 0)}
          icon={<DollarSign className="w-6 h-6" />}
          variant="info"
          loading={loadingKPIs}
        />
      </KPIFinanceiroGrid>

      {/* ========== Tabs ========== */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <Tabs defaultValue="pendentes" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pendentes" className="gap-2">
                <Clock className="h-4 w-4" />
                Aguardando Aprovação
              </TabsTrigger>
              <TabsTrigger value="historico" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pendentes">
              <TabPendentesAprovacao />
            </TabsContent>

            <TabsContent value="historico">
              <TabHistoricoCompras />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
