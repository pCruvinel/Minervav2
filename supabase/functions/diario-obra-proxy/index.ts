/**
 * Edge Function: Diário de Obra API Proxy
 *
 * Proxies requests to the external Diário de Obra API
 * (https://apiexterna.diariodeobra.app/v1) through Supabase,
 * abstracting authentication and enforcing rate limits.
 *
 * Endpoints:
 * - GET /obra/:contratoId                    → Obra details
 * - GET /obra/:contratoId/relatorios         → RDO list (with filters)
 * - GET /obra/:contratoId/relatorios/:id     → Single RDO detail
 * - GET /obra/:contratoId/tarefas            → Task/schedule tree
 * - GET /obra/:contratoId/tarefas/:id        → Task detail
 * - GET /empresa                             → Company data
 * - GET /cadastros                           → Auxiliary tables
 * - GET /health                              → Health check
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createClient } from '@supabase/supabase-js';

// ==================== TYPES ====================

interface DiarioObraConfig {
  id: string;
  api_token: string;
  obra_externa_id: string;
  contrato_id: string;
  obra_nome: string | null;
  ativo: boolean;
}

// ==================== RATE LIMITER ====================

const RATE_LIMIT_MAX = 120; // Safety margin below the 150 req/min hard limit
const RATE_LIMIT_WINDOW_MS = 60_000;

let requestCount = 0;
let windowStart = Date.now();

function checkRateLimit(): boolean {
  const now = Date.now();
  if (now - windowStart > RATE_LIMIT_WINDOW_MS) {
    requestCount = 0;
    windowStart = now;
  }
  requestCount++;
  return requestCount <= RATE_LIMIT_MAX;
}

function getRateLimitInfo() {
  const now = Date.now();
  const elapsed = now - windowStart;
  const remaining = Math.max(0, RATE_LIMIT_MAX - requestCount);
  const resetMs = RATE_LIMIT_WINDOW_MS - elapsed;
  return { remaining, resetMs: Math.max(0, resetMs) };
}

// ==================== CONFIG CACHE ====================

const configCache = new Map<string, { config: DiarioObraConfig; cachedAt: number }>();
const CONFIG_CACHE_TTL_MS = 5 * 60_000; // 5 minutes

function getCachedConfig(contratoId: string): DiarioObraConfig | null {
  const entry = configCache.get(contratoId);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CONFIG_CACHE_TTL_MS) {
    configCache.delete(contratoId);
    return null;
  }
  return entry.config;
}

function setCachedConfig(contratoId: string, config: DiarioObraConfig) {
  configCache.set(contratoId, { config, cachedAt: Date.now() });
}

// ==================== SUPABASE CLIENT ====================

const getSupabaseClient = () =>
  createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

// ==================== API HELPER ====================

const API_BASE_URL = 'https://apiexterna.diariodeobra.app/v1';

async function fetchExternalApi(
  token: string,
  path: string,
  queryParams?: Record<string, string>
): Promise<Response> {
  if (!checkRateLimit()) {
    const { resetMs } = getRateLimitInfo();
    return new Response(
      JSON.stringify({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Retry in ${Math.ceil(resetMs / 1000)}s.`,
        retryAfterMs: resetMs,
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const url = new URL(`${API_BASE_URL}${path}`);
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    }
  }

  console.log(`🔗 [diario-obra-proxy] ${url.toString()}`);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { token },
  });

  return response;
}

async function getConfigForContrato(contratoId: string): Promise<DiarioObraConfig | null> {
  // Check cache first
  const cached = getCachedConfig(contratoId);
  if (cached) return cached;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('diarios_obra_config')
    .select('*')
    .eq('contrato_id', contratoId)
    .eq('ativo', true)
    .single();

  if (error || !data) {
    console.error(`❌ Config not found for contrato ${contratoId}:`, error?.message);
    return null;
  }

  setCachedConfig(contratoId, data as DiarioObraConfig);
  return data as DiarioObraConfig;
}

// ==================== HONO APP ====================

const app = new Hono().basePath('/diario-obra-proxy');

// Middleware
app.use('*', logger(console.log));
app.use(
  '/*',
  cors({
    origin: '*',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'OPTIONS'],
    maxAge: 600,
  })
);

// ==================== ROUTES ====================

// Health check
app.get('/health', (c) =>
  c.json({
    status: 'ok',
    service: 'diario-obra-proxy',
    timestamp: new Date().toISOString(),
    rateLimit: getRateLimitInfo(),
  })
);

// Company info (uses any active config's token)
app.get('/empresa', async (c) => {
  try {
    const supabase = getSupabaseClient();
    const { data: configs } = await supabase
      .from('diarios_obra_config')
      .select('api_token')
      .eq('ativo', true)
      .limit(1);

    if (!configs || configs.length === 0) {
      return c.json({ success: false, error: 'NO_CONFIG', message: 'Nenhuma configuração ativa encontrada.' }, 404);
    }

    const response = await fetchExternalApi(configs[0].api_token, '/empresa');
    if (response.status === 429) return c.json(await response.json(), 429);
    if (!response.ok) {
      return c.json({ success: false, error: 'API_ERROR', status: response.status }, response.status as any);
    }

    const data = await response.json();
    return c.json({ success: true, data });
  } catch (error) {
    console.error('❌ /empresa error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Auxiliary tables (uses any active config's token)
app.get('/cadastros', async (c) => {
  try {
    const supabase = getSupabaseClient();
    const { data: configs } = await supabase
      .from('diarios_obra_config')
      .select('api_token')
      .eq('ativo', true)
      .limit(1);

    if (!configs || configs.length === 0) {
      return c.json({ success: false, error: 'NO_CONFIG' }, 404);
    }

    const response = await fetchExternalApi(configs[0].api_token, '/cadastros');
    if (response.status === 429) return c.json(await response.json(), 429);
    if (!response.ok) {
      return c.json({ success: false, error: 'API_ERROR', status: response.status }, response.status as any);
    }

    const data = await response.json();
    return c.json({ success: true, data });
  } catch (error) {
    console.error('❌ /cadastros error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Obra details (by contratoId)
app.get('/obra/:contratoId', async (c) => {
  try {
    const { contratoId } = c.req.param();
    const config = await getConfigForContrato(contratoId);
    if (!config) {
      return c.json({ success: false, error: 'NO_CONFIG', message: 'Nenhuma obra vinculada a este contrato.' }, 404);
    }

    const response = await fetchExternalApi(config.api_token, `/obras/${config.obra_externa_id}`);
    if (response.status === 429) return c.json(await response.json(), 429);
    if (!response.ok) {
      return c.json({ success: false, error: 'API_ERROR', status: response.status }, response.status as any);
    }

    const data = await response.json();
    return c.json({ success: true, data });
  } catch (error) {
    console.error('❌ /obra/:contratoId error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// List RDOs for obra (by contratoId)
app.get('/obra/:contratoId/relatorios', async (c) => {
  try {
    const { contratoId } = c.req.param();
    const config = await getConfigForContrato(contratoId);
    if (!config) {
      return c.json({ success: false, error: 'NO_CONFIG' }, 404);
    }

    // Forward supported query params
    const query = c.req.query();
    const params: Record<string, string> = {};
    if (query.limite) params.limite = query.limite;
    if (query.usuarioId) params.usuarioId = query.usuarioId;
    if (query.statusId) params.statusId = query.statusId;
    if (query.modeloDeRelatorioId) params.modeloDeRelatorioId = query.modeloDeRelatorioId;
    if (query.dataInicio) params.dataInicio = query.dataInicio;
    if (query.dataFim) params.dataFim = query.dataFim;
    if (query.ordem) params.ordem = query.ordem;

    const response = await fetchExternalApi(
      config.api_token,
      `/obras/${config.obra_externa_id}/relatorios`,
      params
    );
    if (response.status === 429) return c.json(await response.json(), 429);
    if (!response.ok) {
      return c.json({ success: false, error: 'API_ERROR', status: response.status }, response.status as any);
    }

    const data = await response.json();
    return c.json({ success: true, data });
  } catch (error) {
    console.error('❌ /obra/:contratoId/relatorios error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Single RDO detail
app.get('/obra/:contratoId/relatorios/:relatorioId', async (c) => {
  try {
    const { contratoId, relatorioId } = c.req.param();
    const config = await getConfigForContrato(contratoId);
    if (!config) {
      return c.json({ success: false, error: 'NO_CONFIG' }, 404);
    }

    const response = await fetchExternalApi(
      config.api_token,
      `/obras/${config.obra_externa_id}/relatorios/${relatorioId}`
    );
    if (response.status === 429) return c.json(await response.json(), 429);
    if (!response.ok) {
      return c.json({ success: false, error: 'API_ERROR', status: response.status }, response.status as any);
    }

    const data = await response.json();
    return c.json({ success: true, data });
  } catch (error) {
    console.error('❌ /obra/:contratoId/relatorios/:relatorioId error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Task list for obra
app.get('/obra/:contratoId/tarefas', async (c) => {
  try {
    const { contratoId } = c.req.param();
    const config = await getConfigForContrato(contratoId);
    if (!config) {
      return c.json({ success: false, error: 'NO_CONFIG' }, 404);
    }

    const response = await fetchExternalApi(
      config.api_token,
      `/obras/${config.obra_externa_id}/lista-de-tarefas`
    );
    if (response.status === 429) return c.json(await response.json(), 429);
    if (!response.ok) {
      return c.json({ success: false, error: 'API_ERROR', status: response.status }, response.status as any);
    }

    const data = await response.json();
    return c.json({ success: true, data });
  } catch (error) {
    console.error('❌ /obra/:contratoId/tarefas error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Task detail
app.get('/obra/:contratoId/tarefas/:tarefaId', async (c) => {
  try {
    const { contratoId, tarefaId } = c.req.param();
    const config = await getConfigForContrato(contratoId);
    if (!config) {
      return c.json({ success: false, error: 'NO_CONFIG' }, 404);
    }

    const response = await fetchExternalApi(
      config.api_token,
      `/obras/${config.obra_externa_id}/lista-de-tarefas/${tarefaId}`
    );
    if (response.status === 429) return c.json(await response.json(), 429);
    if (!response.ok) {
      return c.json({ success: false, error: 'API_ERROR', status: response.status }, response.status as any);
    }

    const data = await response.json();
    return c.json({ success: true, data });
  } catch (error) {
    console.error('❌ /obra/:contratoId/tarefas/:tarefaId error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== SERVE ====================

Deno.serve(app.fetch);
