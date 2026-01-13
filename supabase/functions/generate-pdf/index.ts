/**
 * Edge Function: generate-pdf
 * ===========================
 * Router principal para geração de PDFs
 * 
 * Usa dynamic imports para evitar bundling de todos os handlers simultaneamente,
 * reduzindo tempo de processamento do bundler.
 */

import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export type PDFType =
  | 'proposta'
  | 'contrato'
  | 'memorial'
  | 'documento-sst'
  | 'parecer-reforma'
  | 'visita-tecnica'
  | 'proposta-ass-anual'
  | 'proposta-ass-pontual';

export interface PDFGenerationResponse {
  success: boolean;
  url?: string;
  error?: string;
  metadata?: {
    filename: string;
    size?: number;
    tipo: PDFType;
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    // Health check endpoint
    if (url.pathname.endsWith('/health')) {
      return new Response(
        JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only POST allowed for generation
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { tipo, osId, dados } = await req.json();

    if (!osId) {
      throw new Error('osId is required');
    }

    if (!tipo) {
      throw new Error('tipo is required');
    }

    // Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    console.log(`[generate-pdf] Generating PDF type=${tipo} for OS=${osId}`);

    let result: PDFGenerationResponse;

    // Dynamic imports para otimização de bundling
    switch (tipo as PDFType) {
      case 'proposta': {
        const { handlePropostaGeneration } = await import('./handlers/proposta-handler.ts');
        result = await handlePropostaGeneration(supabase, osId, dados);
        break;
      }
      case 'contrato': {
        const { handleContratoGeneration } = await import('./handlers/contrato-handler.ts');
        result = await handleContratoGeneration(supabase, osId, dados);
        break;
      }
      case 'memorial': {
        const { handleMemorialGeneration } = await import('./handlers/memorial-handler.ts');
        result = await handleMemorialGeneration(supabase, osId, dados);
        break;
      }
      case 'documento-sst': {
        const { handleDocumentoSSTGeneration } = await import('./handlers/documento-sst-handler.ts');
        result = await handleDocumentoSSTGeneration(supabase, osId, dados);
        break;
      }
      case 'parecer-reforma': {
        const { handleParecerReformaGeneration } = await import('./handlers/parecer-reforma-handler.ts');
        result = await handleParecerReformaGeneration(supabase, osId, dados);
        break;
      }
      case 'visita-tecnica': {
        const { handleVisitaTecnicaGeneration } = await import('./handlers/visita-tecnica-handler.ts');
        result = await handleVisitaTecnicaGeneration(supabase, osId, dados);
        break;
      }
      case 'proposta-ass-anual': {
        const { handlePropostaAssAnualGeneration } = await import('./handlers/proposta-ass-anual-handler.ts');
        result = await handlePropostaAssAnualGeneration(supabase, osId, dados);
        break;
      }
      case 'proposta-ass-pontual': {
        const { handlePropostaAssPontualGeneration } = await import('./handlers/proposta-ass-pontual-handler.ts');
        result = await handlePropostaAssPontualGeneration(supabase, osId, dados);
        break;
      }
      default:
        throw new Error(`Tipo de PDF não suportado: ${tipo}`);
    }

    console.log(`[generate-pdf] Result: success=${result.success}`);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[generate-pdf] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
