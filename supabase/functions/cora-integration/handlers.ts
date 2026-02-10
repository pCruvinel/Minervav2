/**
 * Handlers para os endpoints da API do Banco Cora
 * 
 * IMPORTANTE: Integração Direta (mTLS)
 * Todas as chamadas usam coraAuthenticatedFetch() que automaticamente:
 * - Usa a URL correta (matls-clients.api.*.cora.com.br)
 * - Inclui certificados mTLS no handshake
 * - Adiciona Bearer token
 */

import { coraAuthenticatedFetch } from './auth.ts';
import type {
  BoletoPayload,
  BoletoResponse,
  CoraApiResponse,
  ExtratoParams,
  ExtratoResponse,
  WebhookEvent,
  WebhookValidationResult,
  BankStatementParams,
  BankStatementResponse,
  BankBalanceResponse,
  AccountDetailsResponse,
} from './types.ts';

// ==================== BOLETOS ====================

/**
 * Emite um novo boleto no Banco Cora
 *
 * @param payload - Dados do boleto a ser emitido
 * @returns Dados do boleto criado (linha digitável, código de barras, etc.)
 */
export async function emitirBoleto(
  payload: BoletoPayload
): Promise<CoraApiResponse<BoletoResponse>> {
  try {
    console.log('📄 Emitindo boleto:', {
      valor: payload.valor,
      vencimento: payload.vencimento,
      numeroDocumento: payload.numeroDocumento,
    });

    // Validação básica
    if (payload.valor <= 0) {
      return {
        success: false,
        error: {
          codigo: 'VALIDATION_ERROR',
          mensagem: 'Valor do boleto deve ser maior que zero',
          timestamp: new Date().toISOString(),
        },
      };
    }

    if (!payload.pagador?.cpfCnpj) {
      return {
        success: false,
        error: {
          codigo: 'VALIDATION_ERROR',
          mensagem: 'CPF/CNPJ do pagador é obrigatório',
          timestamp: new Date().toISOString(),
        },
      };
    }

    const response = await coraAuthenticatedFetch(`/v2/invoices`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Erro ao emitir boleto:', errorData);

      return {
        success: false,
        error: {
          codigo: errorData.codigo || 'CORA_API_ERROR',
          mensagem: errorData.mensagem || `Erro HTTP ${response.status}`,
          detalhes: errorData,
          timestamp: new Date().toISOString(),
        },
      };
    }

    const boletoData: BoletoResponse = await response.json();
    console.log('✅ Boleto emitido:', boletoData.nossoNumero);

    return {
      success: true,
      data: boletoData,
    };
  } catch (error) {
    console.error('❌ Erro ao emitir boleto:', error);
    return {
      success: false,
      error: {
        codigo: 'INTERNAL_ERROR',
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * Consulta um boleto existente pelo ID
 *
 * @param boletoId - ID do boleto no Cora
 */
export async function consultarBoleto(
  boletoId: string
): Promise<CoraApiResponse<BoletoResponse>> {
  try {
    console.log(`🔍 Consultando boleto: ${boletoId}`);

    const response = await coraAuthenticatedFetch(
      `/v2/invoices/${boletoId}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          codigo: errorData.codigo || 'CORA_API_ERROR',
          mensagem: errorData.mensagem || `Erro HTTP ${response.status}`,
          detalhes: errorData,
          timestamp: new Date().toISOString(),
        },
      };
    }

    const boletoData: BoletoResponse = await response.json();
    console.log(`✅ Boleto encontrado: ${boletoData.status}`);

    return {
      success: true,
      data: boletoData,
    };
  } catch (error) {
    console.error('❌ Erro ao consultar boleto:', error);
    return {
      success: false,
      error: {
        codigo: 'INTERNAL_ERROR',
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * Cancela um boleto existente
 *
 * @param boletoId - ID do boleto a cancelar
 */
export async function cancelarBoleto(
  boletoId: string
): Promise<CoraApiResponse<{ cancelado: boolean }>> {
  try {
    console.log(`🚫 Cancelando boleto: ${boletoId}`);

    const response = await coraAuthenticatedFetch(
      `/v2/invoices/${boletoId}/cancel`,
      { method: 'POST' }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          codigo: errorData.codigo || 'CORA_API_ERROR',
          mensagem: errorData.mensagem || `Erro HTTP ${response.status}`,
          detalhes: errorData,
          timestamp: new Date().toISOString(),
        },
      };
    }

    console.log('✅ Boleto cancelado');
    return {
      success: true,
      data: { cancelado: true },
    };
  } catch (error) {
    console.error('❌ Erro ao cancelar boleto:', error);
    return {
      success: false,
      error: {
        codigo: 'INTERNAL_ERROR',
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

// ==================== EXTRATO ====================

/**
 * Consulta extrato bancário
 *
 * @param params - Parâmetros de consulta (período, tipo, paginação)
 */
export async function consultarExtrato(
  params: ExtratoParams
): Promise<CoraApiResponse<ExtratoResponse>> {
  try {
    console.log('📊 Consultando extrato:', {
      periodo: `${params.dataInicio} a ${params.dataFim}`,
      tipo: params.tipo || 'TODOS',
    });

    // Validação de datas
    const inicio = new Date(params.dataInicio);
    const fim = new Date(params.dataFim);

    if (inicio > fim) {
      return {
        success: false,
        error: {
          codigo: 'VALIDATION_ERROR',
          mensagem: 'Data de início não pode ser posterior à data de fim',
          timestamp: new Date().toISOString(),
        },
      };
    }

    // Mapear parâmetros para o formato do novo endpoint /bank-statement/statement
    const bankStatementQuery = new URLSearchParams({
      start: params.dataInicio,
      end: params.dataFim,
    });
    
    // Mapear tipo ENTRADA/SAIDA se necessário, ou usar 'TODOS' (sem filtro)
    if (params.tipo === 'ENTRADA') bankStatementQuery.append('type', 'CREDIT');
    if (params.tipo === 'SAIDA') bankStatementQuery.append('type', 'DEBIT');
    
    if (params.page) bankStatementQuery.append('page', String(params.page));
    if (params.pageSize) bankStatementQuery.append('perPage', String(params.pageSize));

    const response = await coraAuthenticatedFetch(
      `/bank-statement/statement?${bankStatementQuery.toString()}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          codigo: errorData.codigo || 'CORA_API_ERROR',
          mensagem: errorData.mensagem || `Erro HTTP ${response.status}`,
          detalhes: errorData,
          timestamp: new Date().toISOString(),
        },
      };
    }

    const extratoData: ExtratoResponse = await response.json();
    console.log(
      `✅ Extrato consultado: ${extratoData.transacoes.length} transações encontradas`
    );

    return {
      success: true,
      data: extratoData,
    };
  } catch (error) {
    console.error('❌ Erro ao consultar extrato:', error);
    return {
      success: false,
      error: {
        codigo: 'INTERNAL_ERROR',
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

// ==================== BANK STATEMENT (V2 - conforme doc do usuário) ====================

/**
 * Consulta extrato bancário (endpoint oficial Cora)
 * GET /bank-statement/statement?start=YYYY-MM-DD&end=YYYY-MM-DD
 */
export async function consultarBankStatement(
  params: BankStatementParams
): Promise<CoraApiResponse<BankStatementResponse>> {
  try {
    console.log('📊 Consultando bank statement:', {
      periodo: `${params.start} a ${params.end}`,
      tipo: params.type || 'TODOS',
    });

    // Validação de datas
    const inicio = new Date(params.start);
    const fim = new Date(params.end);

    if (inicio > fim) {
      return {
        success: false,
        error: {
          codigo: 'VALIDATION_ERROR',
          mensagem: 'Data de início não pode ser posterior à data de fim',
          timestamp: new Date().toISOString(),
        },
      };
    }

    // Construir query string conforme API Cora
    const queryParams = new URLSearchParams({
      start: params.start,
      end: params.end,
    });

    if (params.type) queryParams.append('type', params.type);
    if (params.transaction_type) queryParams.append('transaction_type', params.transaction_type);
    if (params.page) queryParams.append('page', String(params.page));
    if (params.perPage) queryParams.append('perPage', String(params.perPage));
    if (params.aggr !== undefined) queryParams.append('aggr', String(params.aggr));

    const response = await coraAuthenticatedFetch(
      `/bank-statement/statement?${queryParams.toString()}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          codigo: errorData.code || 'CORA_API_ERROR',
          mensagem: errorData.message || `Erro HTTP ${response.status}`,
          timestamp: new Date().toISOString(),
        },
      };
    }

    const data: BankStatementResponse = await response.json();
    console.log(`✅ Bank statement consultado: ${data.entries?.length || 0} lançamentos`);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ Erro ao consultar bank statement:', error);
    return {
      success: false,
      error: {
        codigo: 'INTERNAL_ERROR',
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

// ==================== BANK BALANCE ====================

/**
 * Consulta saldo bancário
 * GET /bank-balance
 * 
 * Estratégia:
 * 1. Tenta /bank-balance direto (se Cora suportar)
 * 2. Fallback: extrai end.balance do extrato dos últimos 30 dias
 */
export async function consultarSaldo(): Promise<CoraApiResponse<BankBalanceResponse>> {
  try {
    console.log('💰 Consultando saldo bancário...');

    // === TENTATIVA 1: /bank-balance direto ===
    try {
      const response = await coraAuthenticatedFetch('/bank-balance');
      
      if (response.ok) {
        const rawData = await response.json();
        console.log('📊 [DIRETO] Raw balance response:', JSON.stringify(rawData));
        
        const available = rawData.available ?? rawData.balance ?? rawData.amount ?? 0;
        const blocked = rawData.blocked ?? rawData.blockedAmount ?? 0;
        const total = rawData.total ?? (available + blocked);

        if (available > 0 || total > 0) {
          const data: BankBalanceResponse = {
            available: typeof available === 'number' ? available : 0,
            total: typeof total === 'number' ? total : 0,
            blocked: typeof blocked === 'number' ? blocked : 0,
          };
          console.log(`✅ Saldo via /bank-balance: R$ ${(data.available / 100).toFixed(2)}`);
          return { success: true, data };
        }
        console.log('⚠️ /bank-balance retornou 0, tentando via extrato...');
      } else {
        console.log(`⚠️ /bank-balance falhou (HTTP ${response.status}), tentando via extrato...`);
      }
    } catch (err) {
      console.log('⚠️ /bank-balance indisponível, tentando via extrato...');
    }

    // === FALLBACK: Extrato dos últimos 30 dias ===
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const todayStr = today.toISOString().split('T')[0];
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    console.log(`📊 [EXTRATO] Buscando período ${thirtyDaysAgoStr} → ${todayStr}`);

    const result = await consultarBankStatement({
      start: thirtyDaysAgoStr,
      end: todayStr,
      perPage: 1
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || {
          codigo: 'BALANCE_FETCH_ERROR',
          mensagem: 'Não foi possível recuperar o saldo',
          timestamp: new Date().toISOString()
        }
      };
    }

    // Debug: log a resposta COMPLETA do extrato para ver a estrutura real
    console.log('📊 [EXTRATO] Keys do resultado:', Object.keys(result.data));
    console.log('📊 [EXTRATO] start:', JSON.stringify(result.data.start));
    console.log('📊 [EXTRATO] end:', JSON.stringify(result.data.end));
    console.log('📊 [EXTRATO] entries count:', result.data.entries?.length || 0);
    
    // Verificar se aggregations tem informação útil
    if (result.data.aggregations) {
      console.log('📊 [EXTRATO] aggregations:', JSON.stringify(result.data.aggregations));
    }

    // O saldo final do período = saldo atual
    const saldoAtual = result.data.end?.balance || 0;

    const data: BankBalanceResponse = {
      available: saldoAtual,
      total: saldoAtual,
      blocked: 0
    };

    console.log(`✅ Saldo via extrato: R$ ${(data.available / 100).toFixed(2)} (end.balance=${saldoAtual})`);

    return { success: true, data };
  } catch (error) {
    console.error('❌ Erro ao consultar saldo:', error);
    return {
      success: false,
      error: {
        codigo: 'INTERNAL_ERROR',
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
        detalhes: { error: String(error) },
        timestamp: new Date().toISOString(),
      },
    };
  }
}

// ==================== ACCOUNT DETAILS ====================

/**
 * Consulta dados da conta
 * GET /account-details
 */
export async function consultarDadosConta(): Promise<CoraApiResponse<AccountDetailsResponse>> {
  try {
    console.log('🏦 Consultando dados da conta...');

    const response = await coraAuthenticatedFetch(`/account-details`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          codigo: errorData.code || 'CORA_API_ERROR',
          mensagem: errorData.message || `Erro HTTP ${response.status}`,
          timestamp: new Date().toISOString(),
        },
      };
    }

    const data: AccountDetailsResponse = await response.json();
    console.log(`✅ Dados da conta: ${data.accountNumber}`);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ Erro ao consultar dados da conta:', error);
    return {
      success: false,
      error: {
        codigo: 'INTERNAL_ERROR',
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

// ==================== WEBHOOKS ====================

/**
 * Valida a assinatura de um webhook do Banco Cora
 *
 * O Cora envia um header X-Cora-Signature com o HMAC-SHA256 do payload
 *
 * @param payload - Body do webhook (string JSON)
 * @param signature - Header X-Cora-Signature
 */
async function validateWebhookSignature(
  payload: string,
  signature: string | null
): Promise<boolean> {
  if (!signature) {
    console.error('❌ Webhook sem assinatura');
    return false;
  }

  const webhookSecret = Deno.env.get('CORA_WEBHOOK_SECRET');
  if (!webhookSecret) {
    console.error('❌ CORA_WEBHOOK_SECRET não configurado');
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );

    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const isValid = expectedSignature === signature;

    if (!isValid) {
      console.error('❌ Assinatura do webhook inválida');
    }

    return isValid;
  } catch (error) {
    console.error('❌ Erro ao validar assinatura:', error);
    return false;
  }
}

/**
 * Processa evento de webhook do Banco Cora
 *
 * @param payloadText - Body do webhook (string JSON)
 * @param signature - Header X-Cora-Signature
 */
export async function processarWebhook(
  payloadText: string,
  signature: string | null
): Promise<WebhookValidationResult> {
  try {
    console.log('📨 Processando webhook do Banco Cora');

    // Validar assinatura
    const isValid = await validateWebhookSignature(payloadText, signature);
    if (!isValid) {
      return {
        valid: false,
        error: 'Assinatura inválida',
      };
    }

    // Parse do payload
    const event: WebhookEvent = JSON.parse(payloadText);

    console.log(`✅ Webhook válido recebido: ${event.tipo}`);

    return {
      valid: true,
      event,
    };
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Erro ao processar webhook',
    };
  }
}
