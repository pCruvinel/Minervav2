/**
 * Cora Integration Tab - Simplified Terminal-Style UI
 * 
 * Features:
 * - Connection status indicator
 * - Toggle to enable/disable integration
 * - Terminal-style connection log
 * - Test connection button
 */

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Terminal } from 'lucide-react';
import { useCoraIntegration } from '@/lib/hooks/use-cora-integration';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function CoraIntegrationTab() {
  const { config, isLoading, saveConfig, isSaving, testConnection, isTesting } = useCoraIntegration();
  const [logs, setLogs] = useState<string[]>([
    '$ Aguardando comando...',
  ]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setLogs(prev => [...prev.slice(-9), `[${timestamp}] ${message}`]);
  };

  const handleToggle = async (checked: boolean) => {
    try {
      addLog(checked ? '$ Ativando integração...' : '$ Desativando integração...');
      await saveConfig({ ativo: checked });
      addLog(checked ? '✓ Integração ativada' : '✓ Integração desativada');
      toast.success(checked ? 'Integração ativada' : 'Integração desativada');
    } catch (error) {
      addLog(`✗ Erro: ${error instanceof Error ? error.message : 'Falha ao salvar'}`);
      toast.error('Erro ao salvar configuração');
    }
  };

  const handleTestConnection = async () => {
    try {
      addLog('$ Testando conexão mTLS...');
      addLog('$ Conectando ao proxy...');
      
      const result = await testConnection();
      
      if (result?.success) {
        addLog('✓ Token obtido com sucesso');
        addLog(`✓ Conexão estabelecida`);
        toast.success('Conexão estabelecida com sucesso!');
      } else {
        throw new Error(result?.message || 'Falha na conexão');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      addLog(`✗ Falha: ${errorMsg}`);
      toast.error(`Falha na conexão: ${errorMsg}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isConnected = config?.ativo && config?.has_certificate && config?.has_private_key;

  return (
    <div className="space-y-4">
      {/* Header: Status + Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-3 h-3 rounded-full",
            isConnected ? "bg-emerald-500" : "bg-red-500"
          )} />
          <div>
            <p className="font-medium">
              Status: {isConnected ? 'Conectado' : 'Desconectado'}
            </p>
            <p className="text-xs text-muted-foreground">
              {config?.ambiente === 'production' ? 'Produção' : 'Homologação'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {config?.ativo ? 'Ativo' : 'Inativo'}
          </span>
          <Switch
            checked={config?.ativo || false}
            onCheckedChange={handleToggle}
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Terminal Log */}
      <div className="rounded-lg border bg-zinc-950 text-zinc-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800">
          <Terminal className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-mono text-zinc-400">Log de Conexão</span>
        </div>
        
        <div className="p-4 h-48 overflow-y-auto font-mono text-sm space-y-1">
          {logs.map((log, i) => (
            <div 
              key={i} 
              className={cn(
                "leading-relaxed",
                log.startsWith('✓') && "text-emerald-400",
                log.startsWith('✗') && "text-red-400",
                log.startsWith('$') && "text-zinc-300",
                log.startsWith('[') && "text-zinc-400"
              )}
            >
              {log}
            </div>
          ))}
          {isTesting && (
            <div className="flex items-center gap-2 text-amber-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Processando...</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={handleTestConnection}
        disabled={isTesting || !config?.ativo}
      >
        {isTesting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : isConnected ? (
          <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
        ) : (
          <XCircle className="mr-2 h-4 w-4 text-red-500" />
        )}
        Testar Conexão
      </Button>

      {/* Last sync info */}
      {config?.ultima_sincronizacao && (
        <p className="text-xs text-center text-muted-foreground">
          Última sincronização: {new Date(config.ultima_sincronizacao).toLocaleString('pt-BR')}
        </p>
      )}
    </div>
  );
}
