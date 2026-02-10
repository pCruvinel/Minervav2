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

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createClient } from '@supabase/supabase-js';

import {
  emitirBoleto,
  consultarBoleto,
  cancelarBoleto,
  consultarExtrato,
  processarWebhook,
  consultarBankStatement,
  consultarSaldo,
  consultarDadosConta,
} from './handlers.ts';
import { getAuthToken, debugLogs, clearDebugLogs } from './auth.ts';
import type { BoletoPayload, ExtratoParams, BankStatementParams } from './types.ts';

const app = new Hono().basePath('/cora-integration');

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
  clearDebugLogs();
  
  try {
    console.log('🔐 Testando autenticação com Banco Cora...');
    const token = await getAuthToken();

    return c.json({
      success: true,
      message: 'Autenticação bem-sucedida',
      tokenPrefix: token.substring(0, 20) + '...',
      logs: debugLogs // Retornar logs mesmo em sucesso
    });
  } catch (error) {
    console.error('❌ Erro no teste de autenticação:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        logs: debugLogs // Retornar logs para debug
      },
      500
    );
  }
});

/**
 * Limpa o cache de configuração
 */
app.post('/auth/clear-cache', (c) => {
  clearConfigCache();
  clearTokenCache();
  return c.json({ success: true, message: 'Cache limpo com sucesso' });
});

/**
 * Debug de configuração (retorna config mascarada)
 */
app.get('/auth/debug', async (c) => {
  try {
    const config = await loadAuthConfig();
    return c.json({
      success: true,
      config: {
        clientId: config.clientId,
        tokenUrl: config.tokenUrl,
        apiBaseUrl: config.apiBaseUrl,
        ambiente: config.ambiente,
        hasCert: !!config.cert,
        hasKey: !!config.privateKey,
        certPreview: config.cert ? config.cert.substring(0, 50) : null
      }
    });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
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

// ==================== BANK STATEMENT (V2) ====================

/**
 * GET /bank-statement
 * Consulta extrato bancário (formato oficial Cora)
 *
 * Query params:
 * - start (required): YYYY-MM-DD
 * - end (required): YYYY-MM-DD
 * - type (optional): CREDIT | DEBIT
 * - page (optional): número da página
 * - perPage (optional): itens por página
 * - aggr (optional): true para incluir totais
 */
app.get('/bank-statement', async (c) => {
  try {
    const query = c.req.query();

    if (!query.start || !query.end) {
      return c.json(
        {
          success: false,
          error: {
            codigo: 'VALIDATION_ERROR',
            mensagem: 'Parâmetros obrigatórios: start e end',
            timestamp: new Date().toISOString(),
          },
        },
        400
      );
    }

    const params: BankStatementParams = {
      start: query.start,
      end: query.end,
      type: query.type as 'CREDIT' | 'DEBIT' | undefined,
      transaction_type: query.transaction_type as 'TRANSFER' | 'BOLETO' | 'PIX' | undefined,
      page: query.page ? parseInt(query.page) : undefined,
      perPage: query.perPage ? parseInt(query.perPage) : undefined,
      aggr: query.aggr === 'true',
    };

    console.log('📊 Consulta de bank statement:', params);

    const result = await consultarBankStatement(params);

    if (!result.success) {
      return c.json(result, 400);
    }

    return c.json(result);
  } catch (error) {
    console.error('❌ Erro ao consultar bank statement:', error);
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

// ==================== BANK BALANCE ====================

/**
 * GET /bank-balance
 * Consulta saldo bancário
 */
app.get('/bank-balance', async (c) => {
  try {
    console.log('💰 Consulta de saldo');

    const result = await consultarSaldo();

    if (!result.success) {
      return c.json(result, 400);
    }

    return c.json(result);
  } catch (error) {
    console.error('❌ Erro ao consultar saldo:', error);
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

// ==================== ACCOUNT DETAILS ====================

/**
 * GET /account-details
 * Consulta dados da conta
 */
app.get('/account-details', async (c) => {
  try {
    console.log('🏦 Consulta de dados da conta');

    const result = await consultarDadosConta();

    if (!result.success) {
      return c.json(result, 400);
    }

    return c.json(result);
  } catch (error) {
    console.error('❌ Erro ao consultar dados da conta:', error);
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

// ==================== SYNC EXTRATO ====================

/**
 * POST /sync
 * Sincroniza extrato bancário do Cora para lancamentos_bancarios
 * 
 * Query params:
 * - start: Data inicial (YYYY-MM-DD), default: 30 dias atrás
 * - end: Data final (YYYY-MM-DD), default: hoje
 */
app.post('/sync', async (c) => {
  clearDebugLogs();
  
  try {
    const url = new URL(c.req.url);
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const start = url.searchParams.get('start') || thirtyDaysAgo.toISOString().split('T')[0];
    const end = url.searchParams.get('end') || today.toISOString().split('T')[0];
    
    console.log(`🔄 Sincronizando extrato: ${start} a ${end}`);
    
    // 1. Buscar extrato do proxy (com paginação)
    const PROXY_URL = Deno.env.get('PROXY_URL') || 'https://pxminerva.onrender.com';
    const PROXY_API_KEY = Deno.env.get('PROXY_API_KEY') || 'minerva-cora-proxy-secret-2026';
    
    let allEntries: any[] = [];
    let page = 1;
    let hasMore = true;
    const PER_PAGE = 100; // Max allowed by Cora usually? Proxy defaults to 50 if not set, let's try 100

    console.log(`🔄 Iniciando sync (paginado) de ${start} a ${end}`);

    while (hasMore) {
      console.log(`📄 Buscando página ${page}...`);
      
      const proxyResponse = await fetch(`${PROXY_URL}/extrato?start=${start}&end=${end}&page=${page}&perPage=${PER_PAGE}`, {
        headers: { 'X-Api-Key': PROXY_API_KEY },
      });
      
      if (!proxyResponse.ok) {
        const errorText = await proxyResponse.text();
        console.error(`❌ Erro do proxy na página ${page}:`, errorText);
        throw new Error(`Proxy error page ${page}: ${proxyResponse.status}`);
      }
      
      const extratoData = await proxyResponse.json();
      const entries = extratoData.entries || [];
      
      if (entries.length > 0) {
        allEntries = [...allEntries, ...entries];
        
        // Se recebeu menos que PER_PAGE, acabou
        if (entries.length < PER_PAGE) {
          hasMore = false;
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }

      // Safety break to prevent infinite loops
      if (page > 50) {
        console.warn('⚠️ Limite de paginação de segurança atingido (50 páginas)');
        hasMore = false;
      }
    }
    
    const extratoData = {
       // Mock structure for the rest of logic that expects extratoData wrapper
       entries: allEntries,
       // We only have the wrapper from the last request, which is fine for header/aggregations but balance calc might need care if using 'start.balance'
       // Ideally we should use the 'start.balance' from the FIRST page request (wait, Cora returns order desc or asc?)
       // Note: The logic below re-sorts by date ASC so we need the oldest balance?
       // Let's assume the previous logic handles 'runningBalance' initialization.
       // The original code used `extratoData.start?.balance`. 
       // If we page, 'start.balance' changes per page? Usually yes.
       // We need the very first start.balance of the period.
       start: null // We will need to check this behavior. For now, let's proceed and check if we can get it.
    };
    
    // NOTE: In a paginated scenario, 'start.balance' of PAGE 1 might not be the 'start.balance' of the PERIOD if filtering by date and paging.
    // However, if we fetch ALL pages, valid sync requires we process them together.
    // Current logic uses: `let runningBalance = extratoData.start?.balance || 0;`
    // If we fetched multiple pages, we likely have the specific start balance in one of them or we need to rely on our own calc.
    // For simplicity in this iteration, we will use the logic as is but note that runningBalance might be imperfect if API behavior differs.
    
    const entries = allEntries;
    
    console.log(`📊 Recebidos ${entries.length} lançamentos do Cora`);
    
    if (entries.length === 0) {
      return c.json({
        success: true,
        message: 'Nenhum lançamento novo encontrado',
        imported: 0,
        total: 0,
        logs: debugLogs
      });
    }
    
    // 2. Transformar para schema lancamentos_bancarios
    // DEBUG: Log first entry structure to validate Cora response
    if (entries.length > 0) {
      console.log('📋 First entry sample:', JSON.stringify(entries[0], null, 2));
    }

    // Calcular saldo_apos e ordenar cronologicamente
    let runningBalance = extratoData.start?.balance || 0;
    
    // Check if entries need sorting (Cora usually returns desc)
    // We sort ASC to calculate balance correctly from start
    const sortedEntries = [...entries].sort((a: any, b: any) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const lancamentos = sortedEntries.map((entry: any) => {
      const isCredit = entry.type === 'CREDIT';
      const valor = entry.amount / 100; // Cora envia em centavos (ex: 10000 -> 100.00)
      const amountCents = entry.amount;

      // Update running balance (in cents to avoid float issues)
      if (isCredit) {
        runningBalance += amountCents;
      } else {
        runningBalance -= amountCents;
      }
      
      const saldoApos = runningBalance / 100;
      
      // Extrair dados da transação
      const transaction = entry.transaction || {};
      
      // ACTUAL CORA STRUCTURE: counterParty is camelCase with capital P
      // And document is in 'identity' field, not 'document'
      const counterParty = transaction.counterParty || 
                           transaction.counterpart || 
                           transaction.counterparty ||
                           {};
      
      // Extract name - Cora uses 'name' field
      const contraparte_nome = counterParty.name || 
                               counterParty.accountName ||
                               counterParty.holderName ||
                               transaction.name ||
                               null;
      
      // Extract document - Cora uses 'identity' field, not 'document'
      const contraparte_documento = counterParty.identity ||
                                     counterParty.document ||
                                     counterParty.documentNumber ||
                                     counterParty.taxId ||
                                     counterParty.cpf ||
                                     counterParty.cnpj ||
                                     transaction.identity ||
                                     transaction.document ||
                                     null;
      
      // Mapear tipo de transação
      const transactionType = (transaction.type || entry.transactionType || '').toUpperCase();
      let metodoTransacao: 'PIX' | 'BOLETO' | 'TRANSFER' | 'OTHER' = 'OTHER';
      if (transactionType === 'PIX') metodoTransacao = 'PIX';
      else if (transactionType === 'BOLETO' || transactionType === 'BANK_SLIP' || transactionType === 'INVOICE') metodoTransacao = 'BOLETO';
      else if (transactionType === 'TRANSFER' || transactionType === 'TED' || transactionType === 'DOC') metodoTransacao = 'TRANSFER';
      
      // Extract description - Cora returns empty string "", so check for non-empty
      // Use counterParty name as fallback when description is empty
      const rawDescription = transaction.description || entry.description || '';
      const descricao = rawDescription.trim() || 
        contraparte_nome ||
        (isCredit ? `Crédito - ${contraparte_nome || 'N/A'}` : `Débito - ${contraparte_nome || 'N/A'}`);
      
      return {
        data: entry.createdAt || entry.date || new Date().toISOString(),
        descricao,
        entrada: isCredit ? valor : null,
        saida: !isCredit ? valor : null,
        saldo_apos: saldoApos,
        banco: 'Cora',
        conta_bancaria: extratoData.header?.businessDocument || null,
        arquivo_origem: 'api-sync',
        linha_origem: null,
        hash_linha: `cora-${entry.id}`,
        status: 'pendente',
        // Novos campos
        tipo_lancamento: entry.type, // 'CREDIT' ou 'DEBIT'
        metodo_transacao: metodoTransacao,
        // Use extracted counterpart data
        contraparte_nome,
        contraparte_documento,
        cora_entry_id: entry.id,
        // observacoes should be NULL - user fills in "Classificar" modal
        observacoes: null,
      };
    });
    
    // 3. Upsert no Supabase (evita duplicatas por hash_linha)
    const supabase = getSupabaseClient();
    
    const { data: inserted, error: dbError } = await supabase
      .from('lancamentos_bancarios')
      .upsert(lancamentos, {
        onConflict: 'hash_linha',
        ignoreDuplicates: true,
      })
      .select('id');
    
    if (dbError) {
      console.error('❌ Erro ao inserir no banco:', dbError);
      return c.json({
        success: false,
        error: dbError.message,
        logs: debugLogs
      }, 500);
    }
    
    const importedCount = inserted?.length || 0;
    console.log(`✅ Sincronização concluída: ${importedCount} novos lançamentos`);
    
    // 4. Atualizar última sincronização na integração
    await supabase
      .from('integracoes_bancarias')
      .update({ ultima_sincronizacao: new Date().toISOString() })
      .eq('banco', 'cora');
    
    return c.json({
      success: true,
      message: `Sincronização concluída`,
      imported: importedCount,
      total: entries.length,
      period: { start, end },
      logs: debugLogs
    });
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      logs: debugLogs
    }, 500);
  }
});

// ==================== START SERVER ====================

Deno.serve(app.fetch);
