import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { useComprasKPIs } from '@/lib/hooks/use-aprovacao-requisicoes';
import { TabPendentesAprovacao } from './compras/tab-pendentes-aprovacao';
import { TabHistoricoCompras } from './compras/tab-historico-compras';

/**
 * GestaoComprasPage - Hub de Gestão de Compras (Procurement)
 *
 * Página principal para gerenciamento de requisições de compra (OS-09).
 * Inclui aprovação de requisições pendentes e histórico completo.
 *
 * @example
 * ```tsx
 * <GestaoComprasPage />
 * ```
 */
export function GestaoComprasPage() {
  const { kpis, loading: loadingKPIs } = useComprasKPIs();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Compras</h1>
          <p className="text-muted-foreground">
            Aprovação de requisições e histórico de aquisições
          </p>
        </div>
        <Button asChild>
          <Link to="/os/criar/requisicao-compras" search={{ osId: undefined }}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Requisição
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                {loadingKPIs ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{kpis?.pendentes || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                {loadingKPIs ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{kpis?.emAndamento || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aprovadas (Mês)</p>
                {loadingKPIs ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{kpis?.aprovadasMes || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-destructive/10">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recusadas</p>
                {loadingKPIs ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{kpis?.canceladas || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-chart-1/10">
                <DollarSign className="h-6 w-6 text-chart-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Pendente</p>
                {loadingKPIs ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-xl font-bold">
                    {formatCurrency(kpis?.valorTotalPendente || 0)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pendentes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pendentes" className="gap-2">
            <Clock className="h-4 w-4" />
            Pendentes de Aprovação
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Histórico e Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes">
          <TabPendentesAprovacao />
        </TabsContent>

        <TabsContent value="historico">
          <TabHistoricoCompras />
        </TabsContent>
      </Tabs>
    </div>
  );
}
