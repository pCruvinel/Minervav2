/**
 * Handlers para os endpoints da API do Banco Cora
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
} from './types.ts';

// URL base da API do Cora (pode variar entre sandbox e produção)
const CORA_API_BASE_URL = Deno.env.get('CORA_API_URL') || 'https://api.cora.com.br/v1';

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

    const response = await coraAuthenticatedFetch(`${CORA_API_BASE_URL}/boletos`, {
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
      `${CORA_API_BASE_URL}/boletos/${boletoId}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          codigo: errorData.codigo || 'CORA_API_ERROR',
          mensagem: errorData.mensagem || `Erro HTTP ${response.status}`,
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
      `${CORA_API_BASE_URL}/boletos/${boletoId}/cancelar`,
      { method: 'POST' }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          codigo: errorData.codigo || 'CORA_API_ERROR',
          mensagem: errorData.mensagem || `Erro HTTP ${response.status}`,
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

    // Construir query string
    const queryParams = new URLSearchParams({
      dataInicio: params.dataInicio,
      dataFim: params.dataFim,
    });

    if (params.tipo) queryParams.append('tipo', params.tipo);
    if (params.page) queryParams.append('page', String(params.page));
    if (params.pageSize) queryParams.append('pageSize', String(params.pageSize));

    const response = await coraAuthenticatedFetch(
      `${CORA_API_BASE_URL}/extrato?${queryParams.toString()}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          codigo: errorData.codigo || 'CORA_API_ERROR',
          mensagem: errorData.mensagem || `Erro HTTP ${response.status}`,
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
