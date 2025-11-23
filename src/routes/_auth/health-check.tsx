/**
 * Página de Health Check do Sistema
 *
 * Exibe o status de saúde de todos os componentes do sistema de autenticação.
 * Apenas acessível para administradores.
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { supabase } from '@/lib/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from '@/lib/utils/safe-toast';

export const Route = createFileRoute('/_auth/health-check')({
  component: HealthCheckPage,
});

interface CheckResult {
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: any;
  duration_ms?: number;
}

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: CheckResult;
    metadata_functions: CheckResult;
    rls_policies: CheckResult;
    triggers: CheckResult;
    performance: CheckResult;
  };
  summary: {
    total_checks: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

function HealthCheckPage() {
  const { currentUser } = useAuth();
  const [healthData, setHealthData] = useState<HealthCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar se usuário é admin
  const isAdmin = currentUser?.cargo_slug === 'admin' || currentUser?.cargo_slug === 'diretoria';

  useEffect(() => {
    if (isAdmin) {
      runHealthCheck();
    }
  }, [isAdmin]);

  const runHealthCheck = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Obter token de autenticação
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      // Chamar Edge Function de Health Check
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/health-check`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setHealthData(data);

      // Notificar baseado no status
      if (data.status === 'healthy') {
        toast.success('Todos os sistemas operacionais');
      } else if (data.status === 'degraded') {
        toast.warning('Sistema operacional com avisos');
      } else {
        toast.error('Sistema com problemas críticos');
      }
    } catch (err: any) {
      console.error('Erro ao executar health check:', err);
      setError(err.message);
      toast.error('Erro ao executar diagnóstico');
    } finally {
      setIsLoading(false);
    }
  };

  // Restrição de acesso
  if (!isAdmin) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertCircle className="w-5 h-5" />
              Acesso Restrito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-800">
              Esta página é acessível apenas para administradores do sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health Check</h1>
          <p className="text-neutral-600 mt-1">
            Diagnóstico completo do sistema de autenticação
          </p>
        </div>
        <Button
          onClick={runHealthCheck}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Executando...' : 'Executar Diagnóstico'}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="w-5 h-5" />
              Erro ao Executar Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-800 font-mono text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      {healthData && (
        <Card
          className={
            healthData.status === 'healthy'
              ? 'border-green-200 bg-green-50'
              : healthData.status === 'degraded'
              ? 'border-yellow-200 bg-yellow-50'
              : 'border-red-200 bg-red-50'
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {healthData.status === 'healthy' && (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
              {healthData.status === 'degraded' && (
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              )}
              {healthData.status === 'unhealthy' && (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
              <span>
                Status:{' '}
                <span className="uppercase font-bold">{healthData.status}</span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{healthData.summary.total_checks}</p>
                <p className="text-sm text-neutral-600">Total de Testes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {healthData.summary.passed}
                </p>
                <p className="text-sm text-neutral-600">Aprovados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {healthData.summary.warnings}
                </p>
                <p className="text-sm text-neutral-600">Avisos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {healthData.summary.failed}
                </p>
                <p className="text-sm text-neutral-600">Falhas</p>
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-4">
              Última execução: {new Date(healthData.timestamp).toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Individual Checks */}
      {healthData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(healthData.checks).map(([key, check]) => (
            <CheckCard key={key} name={key} check={check} />
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && !healthData && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-neutral-600">Executando diagnóstico...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Component for individual check cards
function CheckCard({ name, check }: { name: string; check: CheckResult }) {
  const statusIcon =
    check.status === 'pass' ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : check.status === 'warn' ? (
      <AlertTriangle className="w-5 h-5 text-yellow-600" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-600" />
    );

  const statusColor =
    check.status === 'pass'
      ? 'border-green-200 bg-green-50'
      : check.status === 'warn'
      ? 'border-yellow-200 bg-yellow-50'
      : 'border-red-200 bg-red-50';

  return (
    <Card className={statusColor}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            {statusIcon}
            {name.replace(/_/g, ' ').toUpperCase()}
          </span>
          {check.duration_ms !== undefined && (
            <span className="flex items-center gap-1 text-xs font-normal text-neutral-600">
              <Clock className="w-3 h-3" />
              {check.duration_ms}ms
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2">{check.message}</p>
        {check.details && (
          <details className="text-xs">
            <summary className="cursor-pointer text-neutral-600 hover:text-neutral-900">
              Ver detalhes
            </summary>
            <pre className="mt-2 p-2 bg-white rounded border border-neutral-200 overflow-x-auto">
              {JSON.stringify(check.details, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
