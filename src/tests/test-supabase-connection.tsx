"use client";

/**
 * COMPONENTE DE TESTE - Supabase Connection
 * DESABILITADO - MODO FRONTEND ONLY
 * 
 * Este componente foi desabilitado para funcionar em modo frontend only.
 * Para reativar, altere FRONTEND_ONLY_MODE = false em /lib/api-client.ts
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Info } from 'lucide-react';

export function TestSupabaseConnection() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Conexão Supabase</CardTitle>
          <CardDescription>Status da conexão com o backend</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              <strong>Modo Frontend Only Ativado</strong>
              <p className="mt-2">
                O sistema está funcionando em modo frontend sem conexão com o Supabase.
                Todas as operações são simuladas localmente.
              </p>
              <p className="mt-2 text-sm">
                Para reativar a conexão com o Supabase, altere{' '}
                <code className="bg-primary/10 px-1 py-0.5 rounded">FRONTEND_ONLY_MODE = false</code>
                {' '}em <code className="bg-primary/10 px-1 py-0.5 rounded">/lib/api-client.ts</code>
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}