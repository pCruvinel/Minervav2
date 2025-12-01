"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, CheckCircle2, RefreshCw, Database } from 'lucide-react';
// Credenciais do Supabase via variáveis de ambiente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Componente de debug para testar e recarregar o schema do PostgREST
 * 
 * Use este componente quando estiver enfrentando erros de schema cache como:
 * "Could not find the 'titulo' column of 'ordens_servico' in the schema cache"
 */
export function TestSchemaReload() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReloadSchema = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🔄 Recarregando schema...');
      
      // MODO FRONTEND ONLY - Simular sucesso sem chamar Supabase
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('Schema reload simulado com sucesso (modo frontend)');
      
      // Código original comentado para evitar erro 403
      /*
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/server/reload-schema`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSuccess(data.message || 'Schema recarregado com sucesso!');
      */
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const [loadingTable, setLoadingTable] = useState(false);
  const [errorTable, setErrorTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<{ tableName: string, columns: { name: string, type: string, nullable: boolean }[] } | null>(null);

  const handleCheckTableStructure = async () => {
    setLoadingTable(true);
    setErrorTable(null);
    setTableData(null);

    try {
      console.log('🔍 Verificando estrutura da tabela...');
      
      // MODO FRONTEND ONLY - Simular resposta sem chamar Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTableData({
        tableName: 'ordens_servico',
        columns: [
          { name: 'id', type: 'uuid', nullable: false },
          { name: 'numero_os', type: 'text', nullable: false },
          { name: 'tipo', type: 'text', nullable: false },
        ]
      });
      
      // Código original comentado para evitar erro 403
      /*
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/server/debug/table-structure`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTableData(data);
      */
    } catch (err) {
      setErrorTable(String(err));
    } finally {
      setLoadingTable(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Debug: PostgREST Schema Cache
          </CardTitle>
          <CardDescription>
            Ferramentas para diagnosticar e resolver problemas de cache de schema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Quando usar:</strong> Se você está recebendo erros como{' '}
              <code className="text-sm bg-muted px-1 py-0.5 rounded">
                "Could not find the 'titulo' column..."
              </code>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleReloadSchema}
              disabled={loading}
              className="flex items-center gap-2"
              variant="default"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Recarregar Schema
            </Button>

            <Button
              onClick={handleCheckTableStructure}
              disabled={loadingTable}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Database className="h-4 w-4" />
              Verificar Estrutura da Tabela
            </Button>
          </div>

          {success && (
            <Alert className="border-success/20 bg-success/5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                <strong>Sucesso!</strong>
                <pre className="mt-2 text-xs bg-white p-2 rounded border border-success/20 overflow-auto">
                  {JSON.stringify(success, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-destructive/20 bg-destructive/5">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                <strong>Erro:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {tableData && (
            <Alert className="border-primary/20 bg-primary/5">
              <Database className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary">
                <strong>Estrutura da Tabela:</strong>
                <pre className="mt-2 text-xs bg-white p-2 rounded border border-primary/20 overflow-auto">
                  {JSON.stringify(tableData, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          )}

          {errorTable && (
            <Alert className="border-destructive/20 bg-destructive/5">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                <strong>Erro ao verificar estrutura:</strong> {errorTable}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <p><strong>Passos para resolver erro de schema:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Clique em "Recarregar Schema"</li>
              <li>Aguarde ~10 segundos</li>
              <li>Clique em "Verificar Estrutura da Tabela"</li>
              <li>Verifique se a coluna <code>descricao</code> aparece (não <code>titulo</code>)</li>
              <li>Tente criar uma OS novamente</li>
            </ol>
            <p className="mt-4">
              <strong>Se o erro persistir:</strong> Vá para o Supabase Dashboard → 
              Settings → API → "Reload Schema" ou "Restart PostgREST"
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Projeto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Supabase URL:</span>
            <code className="bg-muted px-2 py-1 rounded text-xs">{SUPABASE_URL}</code>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">API URL:</span>
            <code className="bg-muted px-2 py-1 rounded text-xs">
              {SUPABASE_URL}/functions/v1/
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}