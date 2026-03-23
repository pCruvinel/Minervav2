/**
 * Edge Function: Diário de Obra — Sync Engine
 *
 * Syncs RDO data from the external Diário de Obra API into local
 * Supabase tables for instant reads. Supports incremental sync
 * (only new/updated reports since last sync) and detail fetch.
 *
 * Routes:
 * - POST /sync/:configId                      → Trigger sync
 * - POST /sync/:configId/detail/:externoId     → Fetch + store single RDO detail
 * - GET  /status/:configId                     → Last sync status
 * - GET  /health                               → Health check
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
  last_synced_at: string | null;
  sync_enabled: boolean;
}

interface ExternalRelatorio {
  _id: string;
  data: string;
  usuario: string | { nome: string };
  status: { descricao: string };
  clima?: { manha?: string; tarde?: string; noite?: string };
  [key: string]: unknown;
}

// ==================== RATE LIMITER ====================

const RATE_LIMIT_MAX = 120;
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

// ==================== SUPABASE CLIENT ====================

const getSupabaseClient = () =>
  createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

// ==================== API HELPERS ====================

const API_BASE_URL = 'https://apiexterna.diariodeobra.app/v1';

async function fetchExternalApi(
  token: string,
  path: string,
  queryParams?: Record<string, string>
): Promise<{ ok: boolean; status: number; data?: unknown; error?: string }> {
  if (!checkRateLimit()) {
    const { resetMs } = getRateLimitInfo();
    return {
      ok: false,
      status: 429,
      error: `Rate limit exceeded. Retry in ${Math.ceil(resetMs / 1000)}s.`,
    };
  }

  const url = new URL(`${API_BASE_URL}${path}`);
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    }
  }

  console.log(`🔗 [sync] ${url.toString()}`);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { token },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    return { ok: false, status: response.status, error: text || `HTTP ${response.status}` };
  }

  const data = await response.json();
  return { ok: true, status: 200, data };
}

async function getConfig(configId: string): Promise<DiarioObraConfig | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('diarios_obra_config')
    .select('*')
    .eq('id', configId)
    .eq('ativo', true)
    .single();

  if (error || !data) return null;
  return data as DiarioObraConfig;
}

function extractUsuarioNome(usuario: string | { nome: string } | undefined): string | null {
  if (!usuario) return null;
  if (typeof usuario === 'string') return usuario;
  return usuario.nome || null;
}

// ==================== HONO APP ====================

const app = new Hono().basePath('/diario-obra-sync');

app.use('*', logger(console.log));
app.use(
  '/*',
  cors({
    origin: '*',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    maxAge: 600,
  })
);

// ==================== ROUTES ====================

// Health check
app.get('/health', (c) =>
  c.json({
    status: 'ok',
    service: 'diario-obra-sync',
    timestamp: new Date().toISOString(),
    rateLimit: getRateLimitInfo(),
  })
);

// Get last sync status for a config
app.get('/status/:configId', async (c) => {
  try {
    const { configId } = c.req.param();
    const supabase = getSupabaseClient();

    const { data: logs, error } = await supabase
      .from('diarios_obra_sync_log')
      .select('*')
      .eq('config_id', configId)
      .order('started_at', { ascending: false })
      .limit(5);

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    const { data: config } = await supabase
      .from('diarios_obra_config')
      .select('last_synced_at, sync_enabled')
      .eq('id', configId)
      .single();

    return c.json({
      success: true,
      data: {
        lastSyncedAt: config?.last_synced_at || null,
        syncEnabled: config?.sync_enabled ?? true,
        recentLogs: logs || [],
      },
    });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Trigger sync for a config
app.post('/sync/:configId', async (c) => {
  const { configId } = c.req.param();
  const supabase = getSupabaseClient();

  try {
    // 1. Get config
    const config = await getConfig(configId);
    if (!config) {
      return c.json({ success: false, error: 'NO_CONFIG', message: 'Configuração não encontrada ou inativa.' }, 404);
    }

    // 2. Create sync log entry
    const syncType = config.last_synced_at ? 'incremental' : 'full';
    const { data: logEntry, error: logError } = await supabase
      .from('diarios_obra_sync_log')
      .insert({
        config_id: configId,
        sync_type: syncType,
        status: 'running',
      })
      .select()
      .single();

    if (logError || !logEntry) {
      return c.json({ success: false, error: 'Failed to create sync log' }, 500);
    }

    // 3. Build query params for external API
    const params: Record<string, string> = {
      limite: '500',
      ordem: 'desc',
    };

    if (config.last_synced_at && syncType === 'incremental') {
      const lastSync = new Date(config.last_synced_at);
      lastSync.setDate(lastSync.getDate() - 1);
      params.dataInicio = lastSync.toISOString().split('T')[0];
    }

    // 4. Fetch RDO list from external API
    const result = await fetchExternalApi(
      config.api_token,
      `/obras/${config.obra_externa_id}/relatorios`,
      params
    );

    if (!result.ok) {
      await supabase
        .from('diarios_obra_sync_log')
        .update({
          status: 'error',
          error_message: result.error || `API returned ${result.status}`,
          completed_at: new Date().toISOString(),
        })
        .eq('id', logEntry.id);

      return c.json({
        success: false,
        error: 'API_ERROR',
        message: result.error,
        syncLogId: logEntry.id,
      }, result.status === 429 ? 429 : 500);
    }

    // 5. Process and upsert RDOs
    const relatorios = (Array.isArray(result.data) ? result.data : []) as ExternalRelatorio[];
    let syncedCount = 0;

    for (const rel of relatorios) {
      const { error: upsertError } = await supabase
        .from('diarios_obra_relatorios')
        .upsert(
          {
            config_id: configId,
            contrato_id: config.contrato_id,
            relatorio_externo_id: rel._id,
            data: rel.data ? rel.data.split('T')[0] : null,
            usuario_nome: extractUsuarioNome(rel.usuario),
            status_descricao: rel.status?.descricao || null,
            clima_manha: rel.clima?.manha || null,
            clima_tarde: rel.clima?.tarde || null,
            clima_noite: rel.clima?.noite || null,
            synced_at: new Date().toISOString(),
          },
          { onConflict: 'config_id,relatorio_externo_id' }
        );

      if (!upsertError) syncedCount++;
      else console.error(`⚠️ Upsert error for ${rel._id}:`, upsertError.message);
    }

    // 6. Update config's last_synced_at
    await supabase
      .from('diarios_obra_config')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', configId);

    // 7. Update sync log with success
    await supabase
      .from('diarios_obra_sync_log')
      .update({
        status: 'success',
        relatorios_synced: syncedCount,
        completed_at: new Date().toISOString(),
      })
      .eq('id', logEntry.id);

    return c.json({
      success: true,
      data: {
        syncLogId: logEntry.id,
        syncType,
        relatoriosSynced: syncedCount,
        totalFromApi: relatorios.length,
      },
    });
  } catch (error) {
    console.error('❌ Sync error:', error);

    try {
      await supabase
        .from('diarios_obra_sync_log')
        .update({
          status: 'error',
          error_message: String(error),
          completed_at: new Date().toISOString(),
        })
        .eq('config_id', configId)
        .eq('status', 'running');
    } catch { /* best effort */ }

    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Fetch and store a single RDO detail
app.post('/sync/:configId/detail/:relatorioExternoId', async (c) => {
  const { configId, relatorioExternoId } = c.req.param();
  const supabase = getSupabaseClient();

  try {
    // 1. Get config
    const config = await getConfig(configId);
    if (!config) {
      return c.json({ success: false, error: 'NO_CONFIG' }, 404);
    }

    // 2. Fetch full RDO detail from external API
    const result = await fetchExternalApi(
      config.api_token,
      `/obras/${config.obra_externa_id}/relatorios/${relatorioExternoId}`
    );

    if (!result.ok) {
      return c.json({
        success: false,
        error: 'API_ERROR',
        message: result.error,
      }, result.status === 429 ? 429 : 500);
    }

    // 3. Store detail in local table
    const { error: updateError } = await supabase
      .from('diarios_obra_relatorios')
      .update({
        detalhe: result.data,
        detalhe_synced_at: new Date().toISOString(),
      })
      .eq('config_id', configId)
      .eq('relatorio_externo_id', relatorioExternoId);

    if (updateError) {
      console.error('❌ Detail update error:', updateError.message);
      const rel = result.data as ExternalRelatorio;
      await supabase
        .from('diarios_obra_relatorios')
        .upsert(
          {
            config_id: configId,
            contrato_id: config.contrato_id,
            relatorio_externo_id: relatorioExternoId,
            data: rel?.data ? String(rel.data).split('T')[0] : new Date().toISOString().split('T')[0],
            usuario_nome: extractUsuarioNome(rel?.usuario),
            status_descricao: rel?.status?.descricao || null,
            clima_manha: rel?.clima?.manha || null,
            clima_tarde: rel?.clima?.tarde || null,
            clima_noite: rel?.clima?.noite || null,
            detalhe: result.data,
            detalhe_synced_at: new Date().toISOString(),
            synced_at: new Date().toISOString(),
          },
          { onConflict: 'config_id,relatorio_externo_id' }
        );
    }

    return c.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('❌ Detail sync error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== SERVE ====================

Deno.serve(app.fetch);
