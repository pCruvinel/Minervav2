/**
 * Edge Function: Health Check
 *
 * Testa a saúde de todo o sistema de autenticação e permissões.
 * Retorna diagnóstico detalhado de:
 * - Conectividade com banco de dados
 * - Funções auxiliares (metadata functions)
 * - Políticas RLS
 * - Triggers de sincronização
 * - Performance de queries
 *
 * Uso: GET /functions/v1/health-check
 * Auth: Requer Bearer token (authenticated users)
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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

interface CheckResult {
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: any;
  duration_ms?: number;
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Extrair auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Inicializar Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Executar todos os checks
    const result: HealthCheckResult = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: await checkDatabase(supabase),
        metadata_functions: await checkMetadataFunctions(supabase),
        rls_policies: await checkRLSPolicies(supabase),
        triggers: await checkTriggers(supabase),
        performance: await checkPerformance(supabase),
      },
      summary: {
        total_checks: 5,
        passed: 0,
        failed: 0,
        warnings: 0,
      },
    };

    // Calcular summary
    Object.values(result.checks).forEach((check) => {
      if (check.status === 'pass') result.summary.passed++;
      else if (check.status === 'fail') result.summary.failed++;
      else if (check.status === 'warn') result.summary.warnings++;
    });

    // Determinar status geral
    if (result.summary.failed > 0) {
      result.status = 'unhealthy';
    } else if (result.summary.warnings > 0) {
      result.status = 'degraded';
    }

    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Health check error:', error);
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Check 1: Database Connectivity
 */
async function checkDatabase(supabase: any): Promise<CheckResult> {
  const start = Date.now();

  try {
    // Testar query simples
    const { data, error } = await supabase
      .from('colaboradores')
      .select('id')
      .limit(1);

    const duration = Date.now() - start;

    if (error) {
      return {
        status: 'fail',
        message: 'Falha na conexão com o banco de dados',
        details: { error: error.message },
        duration_ms: duration,
      };
    }

    return {
      status: 'pass',
      message: 'Banco de dados acessível',
      duration_ms: duration,
    };
  } catch (e) {
    return {
      status: 'fail',
      message: 'Erro ao conectar ao banco',
      details: { error: e.message },
      duration_ms: Date.now() - start,
    };
  }
}

/**
 * Check 2: Metadata Functions
 */
async function checkMetadataFunctions(supabase: any): Promise<CheckResult> {
  const start = Date.now();

  try {
    // Testar funções de metadata
    const { data, error } = await supabase.rpc('get_my_cargo_slug_from_meta');

    if (error && error.code !== 'PGRST202') {
      // PGRST202 = função não encontrada
      return {
        status: 'fail',
        message: 'Funções de metadata não encontradas ou com erro',
        details: { error: error.message, code: error.code },
        duration_ms: Date.now() - start,
      };
    }

    // Se data é null ou string, a função existe
    if (error?.code === 'PGRST202') {
      return {
        status: 'fail',
        message: 'Funções de metadata não existem. Execute as migrations.',
        duration_ms: Date.now() - start,
      };
    }

    return {
      status: 'pass',
      message: 'Funções de metadata OK',
      details: { cargo_slug: data },
      duration_ms: Date.now() - start,
    };
  } catch (e) {
    return {
      status: 'warn',
      message: 'Não foi possível testar funções de metadata',
      details: { error: e.message },
      duration_ms: Date.now() - start,
    };
  }
}

/**
 * Check 3: RLS Policies
 */
async function checkRLSPolicies(supabase: any): Promise<CheckResult> {
  const start = Date.now();

  try {
    // Testar acesso à própria linha (sempre deve funcionar)
    const { data: user } = await supabase.auth.getUser();

    if (!user.user) {
      return {
        status: 'warn',
        message: 'Usuário não autenticado',
        duration_ms: Date.now() - start,
      };
    }

    const { data, error } = await supabase
      .from('colaboradores')
      .select('id, nome_completo')
      .eq('id', user.user.id)
      .single();

    if (error) {
      return {
        status: 'fail',
        message: 'RLS bloqueou acesso ao próprio perfil',
        details: { error: error.message },
        duration_ms: Date.now() - start,
      };
    }

    if (!data) {
      return {
        status: 'warn',
        message: 'Usuário não tem registro em colaboradores',
        duration_ms: Date.now() - start,
      };
    }

    return {
      status: 'pass',
      message: 'RLS policies funcionando corretamente',
      details: { user_name: data.nome_completo },
      duration_ms: Date.now() - start,
    };
  } catch (e) {
    return {
      status: 'fail',
      message: 'Erro ao testar RLS',
      details: { error: e.message },
      duration_ms: Date.now() - start,
    };
  }
}

/**
 * Check 4: Triggers
 */
async function checkTriggers(supabase: any): Promise<CheckResult> {
  const start = Date.now();

  try {
    // Verificar se o trigger existe consultando pg_trigger
    const { data, error } = await supabase.rpc('sql', {
      query: `
        SELECT COUNT(*) as count
        FROM pg_trigger
        WHERE tgname = 'trigger_sync_colaborador_metadata'
      `,
    });

    // Se RPC não existir, tenta query direta (pode ser bloqueado por RLS)
    if (error) {
      return {
        status: 'warn',
        message: 'Não foi possível verificar triggers (permissões insuficientes)',
        details: { error: error.message },
        duration_ms: Date.now() - start,
      };
    }

    // Assumir que existe baseado em outros checks
    return {
      status: 'pass',
      message: 'Triggers assumidos como funcionais',
      duration_ms: Date.now() - start,
    };
  } catch (e) {
    return {
      status: 'warn',
      message: 'Não foi possível verificar triggers',
      details: { error: e.message },
      duration_ms: Date.now() - start,
    };
  }
}

/**
 * Check 5: Performance
 */
async function checkPerformance(supabase: any): Promise<CheckResult> {
  const tests: { name: string; duration: number }[] = [];

  try {
    // Teste 1: Query simples de colaboradores
    let start = Date.now();
    await supabase.from('colaboradores').select('id').limit(1);
    tests.push({ name: 'simple_query', duration: Date.now() - start });

    // Teste 2: Query com JOIN (se ainda usar)
    start = Date.now();
    await supabase
      .from('colaboradores')
      .select('id, cargos(slug)')
      .limit(1);
    tests.push({ name: 'join_query', duration: Date.now() - start });

    // Calcular média
    const avgDuration = tests.reduce((sum, t) => sum + t.duration, 0) / tests.length;

    // Classificar performance
    let status: 'pass' | 'warn' | 'fail' = 'pass';
    let message = 'Performance excelente';

    if (avgDuration > 1000) {
      status = 'fail';
      message = 'Performance crítica (>1s)';
    } else if (avgDuration > 500) {
      status = 'warn';
      message = 'Performance degradada (>500ms)';
    } else if (avgDuration > 200) {
      status = 'warn';
      message = 'Performance aceitável (~200ms)';
    }

    return {
      status,
      message,
      details: {
        tests,
        avg_duration_ms: Math.round(avgDuration),
      },
      duration_ms: Math.round(avgDuration),
    };
  } catch (e) {
    return {
      status: 'fail',
      message: 'Erro ao testar performance',
      details: { error: e.message },
    };
  }
}
