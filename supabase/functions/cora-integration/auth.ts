/**
 * Módulo de Autenticação mTLS para Banco Cora
 *
 * Implementa autenticação usando:
 * - Client Certificates (mTLS)
 * - JWT assinado com private key
 * - Troca do JWT por Access Token OAuth2
 */

import type { CoraAuthConfig, CoraTokenResponse } from './types.ts';

// Cache do token em memória (válido por 1 hora tipicamente)
let cachedToken: string | null = null;
let tokenExpiresAt: number | null = null;

/**
 * Carrega configuração de autenticação das variáveis de ambiente
 */
export function loadAuthConfig(): CoraAuthConfig {
  const clientId = Deno.env.get('CORA_CLIENT_ID');
  const privateKey = Deno.env.get('CORA_PRIVATE_KEY');
  const cert = Deno.env.get('CORA_CERT');
  const tokenUrl = Deno.env.get('CORA_TOKEN_URL') || 'https://auth.cora.com.br/oauth2/token';

  if (!clientId || !privateKey || !cert) {
    throw new Error(
      'Configuração incompleta. Variáveis necessárias: CORA_CLIENT_ID, CORA_PRIVATE_KEY, CORA_CERT'
    );
  }

  return {
    clientId,
    privateKey,
    cert,
    tokenUrl,
  };
}

/**
 * Gera um JWT assinado com a private key do cliente
 *
 * O JWT contém:
 * - iss: Client ID
 * - sub: Client ID
 * - aud: Token URL
 * - exp: Timestamp de expiração (5 minutos)
 * - iat: Timestamp de criação
 */
async function generateClientAssertion(config: CoraAuthConfig): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const payload = {
    iss: config.clientId,
    sub: config.clientId,
    aud: config.tokenUrl,
    exp: now + 300, // Expira em 5 minutos
    iat: now,
    jti: crypto.randomUUID(), // ID único do JWT
  };

  try {
    // Importar a private key
    const pemKey = config.privateKey
      .replace(/\\n/g, '\n')
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .trim();

    const binaryKey = Uint8Array.from(atob(pemKey), c => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryKey,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );

    // Criar JWT
    const encoder = new TextEncoder();
    const headerB64 = btoa(JSON.stringify(header))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    const payloadB64 = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const message = `${headerB64}.${payloadB64}`;
    const messageBytes = encoder.encode(message);

    // Assinar
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      messageBytes
    );

    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return `${message}.${signatureB64}`;
  } catch (error) {
    console.error('❌ Erro ao gerar client assertion JWT:', error);
    throw new Error(`Falha ao gerar JWT: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Obtém Access Token do Banco Cora
 *
 * Usa o fluxo OAuth2 client_credentials com client assertion JWT
 */
async function fetchAccessToken(config: CoraAuthConfig): Promise<CoraTokenResponse> {
  try {
    const clientAssertion = await generateClientAssertion(config);

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: clientAssertion,
      scope: 'boletos:read boletos:write extrato:read webhooks:write',
    });

    console.log('🔐 Solicitando token ao Banco Cora...');

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na autenticação Cora:', errorText);
      throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
    }

    const tokenData: CoraTokenResponse = await response.json();
    console.log('✅ Token obtido com sucesso');

    return tokenData;
  } catch (error) {
    console.error('❌ Erro ao buscar access token:', error);
    throw error;
  }
}

/**
 * Obtém um token válido (do cache ou renovando)
 */
export async function getAuthToken(): Promise<string> {
  const now = Date.now();

  // Verifica se há token em cache válido (com margem de 5 minutos)
  if (cachedToken && tokenExpiresAt && tokenExpiresAt > now + 5 * 60 * 1000) {
    console.log('✓ Usando token em cache');
    return cachedToken;
  }

  console.log('🔄 Renovando token...');
  const config = loadAuthConfig();
  const tokenResponse = await fetchAccessToken(config);

  cachedToken = tokenResponse.access_token;
  tokenExpiresAt = now + (tokenResponse.expires_in * 1000);

  return cachedToken;
}

/**
 * Limpa o cache do token (útil em caso de erro 401)
 */
export function clearTokenCache(): void {
  console.log('🗑️ Cache de token limpo');
  cachedToken = null;
  tokenExpiresAt = null;
}

/**
 * Faz uma requisição autenticada para a API do Cora
 *
 * Automaticamente:
 * - Adiciona o token de autenticação
 * - Retry em caso de 401 (token expirado)
 * - Tratamento de erros
 */
export async function coraAuthenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let token = await getAuthToken();

  const makeRequest = async (authToken: string): Promise<Response> => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  };

  let response = await makeRequest(token);

  // Se 401, tentar renovar token e fazer nova requisição
  if (response.status === 401) {
    console.log('⚠️ Token expirado, renovando...');
    clearTokenCache();
    token = await getAuthToken();
    response = await makeRequest(token);
  }

  return response;
}
