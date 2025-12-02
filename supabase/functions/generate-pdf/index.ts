import { createClient } from '@supabase/supabase-js';

// Handlers
import { handlePropostaGeneration } from './handlers/proposta-handler.ts';
import { handleContratoGeneration } from './handlers/contrato-handler.ts';
import { handleMemorialGeneration } from './handlers/memorial-handler.ts';
import { handleDocumentoSSTGeneration } from './handlers/documento-sst-handler.ts';
import { handleParecerReformaGeneration } from './handlers/parecer-reforma-handler.ts';
import { handleVisitaTecnicaGeneration } from './handlers/visita-tecnica-handler.ts';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Types
export type PDFType = 'proposta' | 'contrato' | 'memorial' | 'documento-sst' | 'parecer-reforma' | 'visita-tecnica';

export interface PDFGenerationRequest {
  tipo: PDFType;
  osId: string;
  dados: Record<string, unknown>;
}

export interface PDFGenerationResponse {
  success: boolean;
  url?: string;
  error?: string;
  metadata?: {
    filename: string;
    size: number;
    tipo: PDFType;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // Health check endpoint
    if (path.endsWith('/health')) {
      return new Response(
        JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Main generate endpoint
    if (path.endsWith('/generate') && req.method === 'POST') {
      // Get request body
      const body = await req.json() as PDFGenerationRequest;
      const { tipo, osId, dados } = body;

      // Get auth header
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Authorization header missing'
          } as PDFGenerationResponse),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
          }
        );
      }

      // Create Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      });

      // Route to appropriate handler
      let result: PDFGenerationResponse;

      switch (tipo) {
        case 'proposta':
          result = await handlePropostaGeneration(supabase, osId, dados);
          break;
        case 'contrato':
          result = await handleContratoGeneration(supabase, osId, dados);
          break;
        case 'memorial':
          result = await handleMemorialGeneration(supabase, osId, dados);
          break;
        case 'documento-sst':
          result = await handleDocumentoSSTGeneration(supabase, osId, dados);
          break;
        case 'parecer-reforma':
          result = await handleParecerReformaGeneration(supabase, osId, dados);
          break;
        case 'visita-tecnica':
          result = await handleVisitaTecnicaGeneration(supabase, osId, dados);
          break;
        default:
          return new Response(
            JSON.stringify({
              success: false,
              error: `Tipo de PDF inválido: ${tipo}`
            } as PDFGenerationResponse),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
      }

      return new Response(
        JSON.stringify(result),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: result.success ? 200 : 500,
        }
      );
    }

    // 404 for unknown paths
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      }
    );
  } catch (error) {
    console.error('Error in PDF generation function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      } as PDFGenerationResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
