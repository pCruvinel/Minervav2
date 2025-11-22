/**
 * Edge Function: Integração com Banco Cora
 *
 * Endpoints:
 * - POST /boleto - Emitir boleto
 * - GET /boleto/:id - Consultar boleto
 * - DELETE /boleto/:id - Cancelar boleto
 * - GET /extrato - Consultar extrato
 * - POST /webhook - Receber webhooks do Cora
 * - GET /health - Health check
 */

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';

import {
  emitirBoleto,
  consultarBoleto,
  cancelarBoleto,
  consultarExtrato,
  processarWebhook,
} from './handlers.ts';
import { getAuthToken } from './auth.ts';
import type { BoletoPayload, ExtratoParams } from './types.ts';

const app = new Hono();

// ==================== MIDDLEWARE ====================

// Logger
app.use('*', logger(console.log));

// CORS
app.use(
  '/*',
  cors({
    origin: '*',
    allowHeaders: ['Content-Type', 'Authorization', 'X-Cora-Signature'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
  })
);

// Supabase client helper
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
};

// ==================== HEALTH CHECK ====================

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'cora-integration',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ==================== AUTENTICAÇÃO ====================

/**
 * Teste de autenticação - obtém token do Cora
 * Útil para validar credenciais
 */
app.get('/auth/test', async (c) => {
  try {
    console.log('🔐 Testando autenticação com Banco Cora...');
    const token = await getAuthToken();

    return c.json({
      success: true,
      message: 'Autenticação bem-sucedida',
      tokenPrefix: token.substring(0, 20) + '...',
    });
  } catch (error) {
    console.error('❌ Erro no teste de autenticação:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      500
    );
  }
});

// ==================== BOLETOS ====================

/**
 * POST /boleto
 * Emite um novo boleto
 *
 * Body: BoletoPayload
 */
app.post('/boleto', async (c) => {
  try {
    const payload: BoletoPayload = await c.req.json();

    console.log('📥 Requisição para emitir boleto:', {
      numeroDocumento: payload.numeroDocumento,
      valor: payload.valor,
    });

    const result = await emitirBoleto(payload);

    if (!result.success) {
      return c.json(result, 400);
    }

    // Salvar boleto no banco de dados (opcional)
    if (result.data) {
      const supabase = getSupabaseClient();

      const { error: dbError } = await supabase.from('cora_boletos').insert({
        cora_boleto_id: result.data.id,
        nosso_numero: result.data.nossoNumero,
        linha_digitavel: result.data.linhaDigitavel,
        codigo_barras: result.data.codigoBarras,
        qr_code: result.data.qrCode,
        url_boleto: result.data.urlBoleto,
        valor: result.data.valor,
        vencimento: result.data.vencimento,
        status: result.data.status,
        numero_documento: payload.numeroDocumento,
        pagador_nome: payload.pagador.nome,
        pagador_cpf_cnpj: payload.pagador.cpfCnpj,
      });

      if (dbError) {
        console.error('⚠️ Erro ao salvar boleto no banco:', dbError);
        // Não falhar a requisição se o salvamento no banco falhar
      } else {
        console.log('✅ Boleto salvo no banco de dados');
      }
    }

    return c.json(result, 201);
  } catch (error) {
    console.error('❌ Erro ao processar requisição de boleto:', error);
    return c.json(
      {
        success: false,
        error: {
          codigo: 'INTERNAL_ERROR',
          mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
          timestamp: new Date().toISOString(),
        },
      },
      500
    );
  }
});

/**
 * GET /boleto/:id
 * Consulta um boleto pelo ID
 */
app.get('/boleto/:id', async (c) => {
  try {
    const { id } = c.req.param();
    console.log(`📥 Consulta de boleto: ${id}`);

    const result = await consultarBoleto(id);

    if (!result.success) {
      return c.json(result, result.error?.codigo === 'NOT_FOUND' ? 404 : 400);
    }

    return c.json(result);
  } catch (error) {
    console.error('❌ Erro ao consultar boleto:', error);
    return c.json(
      {
        success: false,
        error: {
          codigo: 'INTERNAL_ERROR',
          mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
          timestamp: new Date().toISOString(),
        },
      },
      500
    );
  }
});

/**
 * DELETE /boleto/:id
 * Cancela um boleto
 */
app.delete('/boleto/:id', async (c) => {
  try {
    const { id } = c.req.param();
    console.log(`📥 Cancelamento de boleto: ${id}`);

    const result = await cancelarBoleto(id);

    if (!result.success) {
      return c.json(result, 400);
    }

    // Atualizar status no banco de dados
    const supabase = getSupabaseClient();
    await supabase
      .from('cora_boletos')
      .update({ status: 'CANCELADO' })
      .eq('cora_boleto_id', id);

    return c.json(result);
  } catch (error) {
    console.error('❌ Erro ao cancelar boleto:', error);
    return c.json(
      {
        success: false,
        error: {
          codigo: 'INTERNAL_ERROR',
          mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
          timestamp: new Date().toISOString(),
        },
      },
      500
    );
  }
});

// ==================== EXTRATO ====================

/**
 * GET /extrato
 * Consulta extrato bancário
 *
 * Query params:
 * - dataInicio (required): YYYY-MM-DD
 * - dataFim (required): YYYY-MM-DD
 * - tipo (optional): ENTRADA | SAIDA | TODOS
 * - page (optional): número da página
 * - pageSize (optional): tamanho da página
 */
app.get('/extrato', async (c) => {
  try {
    const query = c.req.query();

    if (!query.dataInicio || !query.dataFim) {
      return c.json(
        {
          success: false,
          error: {
            codigo: 'VALIDATION_ERROR',
            mensagem: 'Parâmetros obrigatórios: dataInicio e dataFim',
            timestamp: new Date().toISOString(),
          },
        },
        400
      );
    }

    const params: ExtratoParams = {
      dataInicio: query.dataInicio,
      dataFim: query.dataFim,
      tipo: query.tipo as 'ENTRADA' | 'SAIDA' | 'TODOS' | undefined,
      page: query.page ? parseInt(query.page) : undefined,
      pageSize: query.pageSize ? parseInt(query.pageSize) : undefined,
    };

    console.log('📥 Consulta de extrato:', params);

    const result = await consultarExtrato(params);

    if (!result.success) {
      return c.json(result, 400);
    }

    return c.json(result);
  } catch (error) {
    console.error('❌ Erro ao consultar extrato:', error);
    return c.json(
      {
        success: false,
        error: {
          codigo: 'INTERNAL_ERROR',
          mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
          timestamp: new Date().toISOString(),
        },
      },
      500
    );
  }
});

// ==================== WEBHOOKS ====================

/**
 * POST /webhook
 * Recebe webhooks do Banco Cora
 *
 * Headers esperados:
 * - X-Cora-Signature: assinatura HMAC-SHA256 do payload
 */
app.post('/webhook', async (c) => {
  try {
    const signature = c.req.header('X-Cora-Signature');
    const payloadText = await c.req.text();

    console.log('📨 Webhook recebido do Banco Cora');

    const result = await processarWebhook(payloadText, signature || null);

    if (!result.valid) {
      console.error('❌ Webhook inválido:', result.error);
      return c.json(
        {
          success: false,
          error: result.error,
        },
        400
      );
    }

    const event = result.event!;

    // Processar evento baseado no tipo
    const supabase = getSupabaseClient();

    switch (event.tipo) {
      case 'BOLETO_PAGO': {
        const boletoData = event.data as any;
        console.log(`💰 Boleto pago: ${boletoData.nossoNumero}`);

        // Atualizar status no banco
        await supabase
          .from('cora_boletos')
          .update({
            status: 'PAGO',
            valor_pago: boletoData.valorPago,
            data_pagamento: boletoData.dataPagamento,
          })
          .eq('cora_boleto_id', boletoData.boletoId);

        // TODO: Processar pagamento no sistema (atualizar OS, etc.)
        break;
      }

      case 'BOLETO_CANCELADO':
      case 'BOLETO_EXPIRADO': {
        const boletoData = event.data as any;
        console.log(`🚫 Boleto ${event.tipo}: ${boletoData.nossoNumero}`);

        await supabase
          .from('cora_boletos')
          .update({ status: event.tipo === 'BOLETO_CANCELADO' ? 'CANCELADO' : 'EXPIRADO' })
          .eq('cora_boleto_id', boletoData.boletoId);
        break;
      }

      case 'PIX_RECEBIDO': {
        const pixData = event.data as any;
        console.log(`💸 PIX recebido: R$ ${pixData.valor / 100}`);

        // TODO: Registrar recebimento de PIX no sistema
        break;
      }

      default:
        console.log(`ℹ️ Evento não processado: ${event.tipo}`);
    }

    // Salvar evento no banco para auditoria
    await supabase.from('cora_webhook_events').insert({
      event_id: event.id,
      event_type: event.tipo,
      event_data: event.data,
      processed_at: new Date().toISOString(),
    });

    return c.json({ success: true, eventId: event.id });
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      500
    );
  }
});

// ==================== START SERVER ====================

Deno.serve(app.fetch);
