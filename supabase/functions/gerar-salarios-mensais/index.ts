
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Calcular datas
    // Default: Next Month (Provisão normal)
    // Override: via body { "targetDate": "2026-02-01" }
    
    let targetMonthDate = new Date();
    targetMonthDate.setMonth(targetMonthDate.getMonth() + 1); // Default: next month
    targetMonthDate.setDate(1);

    try {
        const body = await req.json();
        if (body.targetDate) {
            targetMonthDate = new Date(body.targetDate);
            // Garantir dia 1 para lógica de range funcionar
            targetMonthDate.setDate(1); 
            console.log(`[Job] Manual override. Target date adjusted to: ${targetMonthDate.toISOString()}`);
        }
    } catch {
        // Body reading error usually means no body, ignore
    }

    const targetMonthStr = targetMonthDate.toISOString().slice(0, 7); // YYYY-MM
    
    console.log(`[Job] Iniciando geração de salários para: ${targetMonthStr}`);

    // 2. Definir Categoria (ID fornecido pelo usuário)
    const categoriaId = '843f5fef-fb6a-49bd-bec3-b0917c2d4204';
    const categoriaNome = 'Folha de Pagamento e Encargos Sociais';

    // 3. Buscar Colaboradores Ativos com Salário Base definido
    const { data: colaboradores, error: colError } = await supabase
      .from('colaboradores')
      .select('id, nome_completo, salario_base, dia_vencimento, rateio_fixo_id')
      .eq('ativo', true)
      .gt('salario_base', 0);

    if (colError) throw colError;
    
    console.log(`[Job] ${colaboradores.length} colaboradores elegíveis encontrados.`);

    const results = {
      generated: 0,
      skipped: 0,
      errors: 0
    };

    // 4. Iterar e criar despesas
    for (const colab of colaboradores) {
        try {
            const vencimentoDia = colab.dia_vencimento || 5; 
            
            const vencimentoDate = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth(), vencimentoDia);
            const vencimentoIso = vencimentoDate.toISOString().split('T')[0];

            const monthStart = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth(), 1).toISOString().split('T')[0];
            const monthEnd = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth() + 1, 0).toISOString().split('T')[0];

            const { data: existing } = await supabase
                .from('contas_pagar')
                .select('id')
                .eq('favorecido_colaborador_id', colab.id)
                .gte('vencimento', monthStart)
                .lte('vencimento', monthEnd)
                .eq('categoria_id', categoriaId)
                .maybeSingle();

            if (existing) {
                console.log(`[Skip] ${colab.nome_completo} já tem registro para ${targetMonthStr}`);
                results.skipped++;
                continue;
            }

            let rateioJson = null;
            let ccId = null;
            
            if (colab.rateio_fixo_id) {
                ccId = colab.rateio_fixo_id; 
                rateioJson = [{
                    cc_id: colab.rateio_fixo_id,
                    percentual: 100,
                    valor: colab.salario_base
                }];
            }

            const { error: insertError } = await supabase
                .from('contas_pagar')
                .insert({
                    descricao: `Salário - ${colab.nome_completo}`,
                    valor: colab.salario_base,
                    vencimento: vencimentoIso,
                    status: 'em_aberto',
                    tipo: 'fixa',
                    favorecido_colaborador_id: colab.id,
                    categoria_id: categoriaId,
                    categoria: categoriaNome,
                    origem: 'salario_auto',
                    recorrente: true,
                    recorrencia_frequencia: 'MENSAL',
                    cc_id: ccId,
                    rateio: rateioJson,
                });

            if (insertError) throw insertError;

            console.log(`[OK] Gerado para ${colab.nome_completo} (${vencimentoIso})`);
            results.generated++;

        } catch (err) {
            console.error(`[Error] Falha ao processar ${colab.nome_completo}:`, err);
            results.errors++;
        }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Processamento concluído', 
        target_month: targetMonthStr,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro geral:', error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
