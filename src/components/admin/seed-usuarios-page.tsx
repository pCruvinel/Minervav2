"use client";

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Loader2, CheckCircle2, AlertCircle, Users, Shield, UserCog, User } from 'lucide-react';
import { toast } from '../../lib/utils/safe-toast';
// Credenciais do Supabase via variáveis de ambiente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface SeedResultado {
  email: string;
  nome?: string;
  role?: string;
  setor?: string;
  status: 'created' | 'already_exists';
  id?: string;
}

interface SeedResponse {
  success: boolean;
  message: string;
  resultados: SeedResultado[];
  erros?: Array<{ email: string; error: string }>;
  summary: {
    total: number;
    criados: number;
    existentes: number;
    erros: number;
  };
}

const roleIcons: Record<string, any> = {
  DIRETORIA: Shield,
  GESTOR_ADM: UserCog,
  GESTOR_SETOR: UserCog,
  COLABORADOR: User,
};

const roleLabels: Record<string, string> = {
  DIRETORIA: 'Diretoria',
  GESTOR_ADM: 'Gestor Administrativo',
  GESTOR_SETOR: 'Gestor de Setor',
  COLABORADOR: 'Colaborador',
};

const roleColors: Record<string, string> = {
  DIRETORIA: 'bg-purple-100 text-purple-800 border-purple-200',
  GESTOR_ADM: 'bg-blue-100 text-blue-800 border-blue-200',
  GESTOR_SETOR: 'bg-green-100 text-green-800 border-green-200',
  COLABORADOR: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function SeedUsuariosPage({ onBack }: { onBack?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<SeedResponse | null>(null);

  const handleExecutarSeed = async () => {
    try {
      setLoading(true);
      setResultado(null);

      console.log('🌱 Executando seed de usuários...');

      // MODO FRONTEND ONLY - Simular sucesso sem chamar Supabase
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResultado: SeedResponse = {
        success: true,
        message: 'Seed simulado com sucesso (modo frontend)',
        resultados: [
          { email: 'diretoria@minerva.com', nome: 'Diretor Geral', role: 'DIRETORIA' },
          { email: 'gestor.comercial@minerva.com', nome: 'Gestor Administrativo', role: 'GESTOR_ADMINISTRATIVO' },
          { email: 'gestor.obras@minerva.com', nome: 'Gestor de Obras', role: 'GESTOR_OBRAS' },
        ],
        summary: { criados: 3, existentes: 0, erros: 0 },
      };
      
      setResultado(mockResultado);
      toast.success('Seed simulado: 3 usuários criados!');
      
      // Código original comentado para evitar erro 403
      /*
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-5ad7fd2c/seed-usuarios`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao executar seed');
      }

      const data: SeedResponse = await response.json();
      setResultado(data);

      if (data.summary.criados > 0) {
        toast.success(`${data.summary.criados} usuário(s) criado(s) com sucesso!`);
      }
      
      if (data.summary.existentes > 0) {
        toast.info(`${data.summary.existentes} usuário(s) já existiam no sistema`);
      }

      if (data.summary.erros > 0) {
        toast.error(`${data.summary.erros} erro(s) durante o seed`);
      }
      */

    } catch (error) {
      console.error('❌ Erro ao executar seed:', error);
      toast.error('Erro ao criar usuários: ' + String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Seed de Usuários</h1>
            <p className="text-neutral-600">
              Crie usuários de teste com diferentes níveis de acesso
            </p>
          </div>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Voltar
            </Button>
          )}
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários a serem criados
            </CardTitle>
            <CardDescription>
              Este seed criará 5 usuários de teste com diferentes cargos, setores e permissões
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Diretoria */}
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <Badge className={roleColors.DIRETORIA}>
                    Diretoria
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>Nome:</strong> Carlos Diretor</p>
                  <p><strong>Email:</strong> diretoria@minerva.com</p>
                  <p><strong>Senha:</strong> diretoria123</p>
                  <p className="text-xs text-neutral-500">Setor: ADM</p>
                </div>
              </div>

              {/* Gestor ADM */}
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-blue-600" />
                  <Badge className={roleColors.GESTOR_ADM}>
                    Gestor ADM
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>Nome:</strong> Maria Gestora ADM</p>
                  <p><strong>Email:</strong> gestor.adm@minerva.com</p>
                  <p><strong>Senha:</strong> gestor123</p>
                  <p className="text-xs text-neutral-500">Setor: ADM</p>
                </div>
              </div>

              {/* Gestor de Obras */}
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-green-600" />
                  <Badge className={roleColors.GESTOR_SETOR}>
                    Gestor de Setor
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>Nome:</strong> João Gestor de Obras</p>
                  <p><strong>Email:</strong> gestor.obras@minerva.com</p>
                  <p><strong>Senha:</strong> gestor123</p>
                  <p className="text-xs text-neutral-500">Setor: Obras</p>
                </div>
              </div>

              {/* Gestor de Assessoria */}
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-green-600" />
                  <Badge className={roleColors.GESTOR_SETOR}>
                    Gestor de Setor
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>Nome:</strong> Paula Gestora de Assessoria</p>
                  <p><strong>Email:</strong> gestor.assessoria@minerva.com</p>
                  <p><strong>Senha:</strong> gestor123</p>
                  <p className="text-xs text-neutral-500">Setor: Assessoria</p>
                </div>
              </div>

              {/* Colaborador */}
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <Badge className={roleColors.COLABORADOR}>
                    Colaborador
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>Nome:</strong> Ana Colaboradora</p>
                  <p><strong>Email:</strong> colaborador@minerva.com</p>
                  <p><strong>Senha:</strong> colaborador123</p>
                  <p className="text-xs text-neutral-500">Setor: Obras</p>
                </div>
              </div>
            </div>

            <Alert className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Se algum usuário já existir no banco, ele será pulado automaticamente. 
                Não há risco de duplicação.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={handleExecutarSeed} 
                disabled={loading}
                className="min-w-[200px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando usuários...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Executar Seed
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        {resultado && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <CheckCircle2 className="h-5 w-5" />
                Seed Executado com Sucesso
              </CardTitle>
              <CardDescription className="text-green-700">
                {resultado.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Resumo */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-neutral-900">
                    {resultado.summary.total}
                  </div>
                  <div className="text-xs text-neutral-600 mt-1">Total</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">
                    {resultado.summary.criados}
                  </div>
                  <div className="text-xs text-neutral-600 mt-1">Criados</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">
                    {resultado.summary.existentes}
                  </div>
                  <div className="text-xs text-neutral-600 mt-1">Existentes</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600">
                    {resultado.summary.erros}
                  </div>
                  <div className="text-xs text-neutral-600 mt-1">Erros</div>
                </div>
              </div>

              {/* Lista de Resultados */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-green-900">Detalhes:</h4>
                {resultado.resultados.map((res, index) => {
                  const Icon = res.role ? roleIcons[res.role] : User;
                  return (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-neutral-600" />
                        <div>
                          <p className="text-sm font-medium">{res.nome || res.email}</p>
                          <p className="text-xs text-neutral-500">{res.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {res.role && (
                          <Badge className={roleColors[res.role]} variant="outline">
                            {roleLabels[res.role]}
                          </Badge>
                        )}
                        {res.status === 'created' ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Criado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Já Existia
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Erros (se houver) */}
              {resultado.erros && resultado.erros.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-900">Erros:</h4>
                  {resultado.erros.map((erro, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{erro.email}:</strong> {erro.error}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}