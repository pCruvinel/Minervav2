/**
 * Módulo de Autenticação via Proxy para Banco Cora
 * 
 * O proxy Node.js (pxminerva.onrender.com) faz a conexão mTLS
 * Esta Edge Function apenas encaminha as requisições
 */

// =============================================================================
// CONFIGURAÇÃO DO PROXY
// =============================================================================

const PROXY_URL = 'https://pxminerva.onrender.com';
const PROXY_API_KEY = 'minerva-cora-proxy-secret-2026';

// =============================================================================
// DEBUG LOGS
// =============================================================================

export const debugLogs: string[] = [];

export function logDebug(msg: string) {
  console.log(msg);
  debugLogs.push(`[${new Date().toISOString().split('T')[1].slice(0, -1)}] ${msg}`);
}

export function clearDebugLogs() {
  debugLogs.length = 0;
}

// =============================================================================
// TOKEN (VIA PROXY)
// =============================================================================

let cachedToken: string | null = null;
let tokenExpiresAt: number | null = null;

/**
 * Obtém access token via proxy
 */
export async function getAuthToken(): Promise<string> {
  const now = Date.now();

  // Verifica cache (5 min de margem)
  if (cachedToken && tokenExpiresAt && tokenExpiresAt > now + 5 * 60 * 1000) {
    logDebug('✓ Usando token em cache');
    return cachedToken;
  }

  logDebug('🔄 Obtendo token via proxy...');
  logDebug(`📍 Proxy URL: ${PROXY_URL}/token`);

  try {
    const response = await fetch(`${PROXY_URL}/token`, {
      method: 'POST',
      headers: {
        'X-Api-Key': PROXY_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logDebug(`❌ Erro do proxy: ${errorText}`);
      throw new Error(`Proxy error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.access_token) {
      throw new Error('Proxy não retornou access_token');
    }

    cachedToken = data.access_token;
    tokenExpiresAt = now + 55 * 60 * 1000; // 55 minutos (típico Cora)
    
    logDebug('✅ Token obtido com sucesso via proxy');
    return cachedToken;
  } catch (error) {
    logDebug(`❌ Falha ao obter token: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

export function clearTokenCache(): void {
  logDebug('🗑️ Cache de token limpo');
  cachedToken = null;
  tokenExpiresAt = null;
}

// =============================================================================
// REQUISIÇÕES AUTENTICADAS (VIA PROXY)
// =============================================================================

/**
 * Faz requisição para a API Cora via proxy
 */
export async function coraAuthenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  logDebug(`🔐 Chamando proxy: ${endpoint}`);

  // Mapear endpoints para rotas do proxy
  let proxyEndpoint = endpoint;
  
  if (endpoint.includes('/bank-statement')) {
    proxyEndpoint = '/extrato';
  } else if (endpoint.includes('/bank-balance')) {
    proxyEndpoint = '/saldo';
  } else if (endpoint.includes('/invoice')) {
    proxyEndpoint = '/boletos';
  }

  const url = `${PROXY_URL}${proxyEndpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'X-Api-Key': PROXY_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    return response;
  } catch (error) {
    logDebug(`❌ Erro na requisição: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

// =============================================================================
// FUNÇÕES LEGADAS (MANTIDAS PARA COMPATIBILIDADE)
// =============================================================================

export async function loadAuthConfig() {
  // Não precisa mais carregar config - proxy faz tudo
  logDebug('ℹ️ Usando proxy - config local não necessária');
  return {
    clientId: 'via-proxy',
    privateKey: '',
    cert: '',
    tokenUrl: `${PROXY_URL}/token`,
    apiBaseUrl: PROXY_URL,
    ambiente: 'production' as const,
  };
}

export function clearConfigCache(): void {
  logDebug('🗑️ Cache de config limpo (noop - usando proxy)');
}
