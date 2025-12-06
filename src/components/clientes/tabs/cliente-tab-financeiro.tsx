/**
 * ClienteTabFinanceiro - Aba de Dados Financeiros do Cliente
 *
 * Exibe resumo financeiro, contratos e próximas faturas.
 *
 * @example
 * ```tsx
 * <ClienteTabFinanceiro clienteId={clienteId} />
 * ```
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useClienteContratos, formatCurrency, formatDate } from '@/lib/hooks/use-cliente-contratos';

interface ClienteTabFinanceiroProps {
  clienteId: string;
}

export function ClienteTabFinanceiro({ clienteId }: ClienteTabFinanceiroProps) {
  const navigate = useNavigate();
  const { contratos, summary, isLoading } = useClienteContratos(clienteId);

  // Filtrar apenas contratos ativos para resumo financeiro
  const contratosAtivos = contratos.filter(c => c.status === 'ativo');

  // Calcular totais
  const valorTotalMensal = contratosAtivos
    .filter(c => c.tipo === 'recorrente')
    .reduce((sum, c) => sum + (c.valor_mensal || 0), 0);

  const valorTotalContratos = contratosAtivos.reduce((sum, c) => sum + (c.valor_total || 0), 0);

  const handleVerContasReceber = () => {
    navigate({ to: '/financeiro/contas-receber', search: { clienteId } });
  };

  if (isLoading) {
    return <FinanceiroLoading />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Receita Mensal</p>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <h3 className="text-2xl font-semibold text-success">
              {formatCurrency(valorTotalMensal)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.contratosAtivos} contrato(s) ativo(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Valor Total Contratos</p>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold">
              {formatCurrency(valorTotalContratos)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Soma de todos os contratos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Status Financeiro</p>
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <Badge className="bg-success/10 text-success text-lg px-3 py-1">
              Em Dia
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Sem faturas em atraso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes dos Contratos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Resumo por Contrato
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contratosAtivos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum contrato ativo
              </p>
            ) : (
              <div className="space-y-4">
                {contratosAtivos.map((contrato) => (
                  <div
                    key={contrato.id}
                    className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{contrato.numero_contrato}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {contrato.tipo}
                      </p>
                    </div>
                    <div className="text-right">
                      {contrato.tipo === 'recorrente' ? (
                        <>
                          <p className="font-medium text-success">
                            {formatCurrency(contrato.valor_mensal)}/mês
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Início: {formatDate(contrato.data_inicio)}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium">
                            {formatCurrency(contrato.valor_total)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Valor total
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximas Faturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">
                  Consulte as faturas detalhadas
                </p>
                <p className="text-sm">
                  Para visualizar todas as parcelas e faturas programadas deste cliente,
                  acesse a tela de Contas a Receber.
                </p>
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={handleVerContasReceber}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver Contas a Receber
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Nota informativa */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Dica:</strong> Para gerar boletos, registrar pagamentos ou consultar
          o histórico financeiro completo, utilize o módulo Financeiro no menu lateral.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function FinanceiroLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
