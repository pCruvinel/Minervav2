import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Edge Function: check-deadlines
 * 
 * Verifica OS com prazos próximos (≤2 dias) ou vencidos e cria notificações.
 * Deve ser executada diariamente via CRON.
 */

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface OSComPrazo {
  id: string;
  codigo_os: string;
  responsavel_id: string;
  etapa_atual: number;
  prazo_etapa_atual: string;
  cliente_nome: string;
  etapa_nome: string;
}

Deno.serve(async (req: Request) => {
  // Verificar método
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const hoje = new Date();
    const doisDiasDepois = new Date(hoje);
    doisDiasDepois.setDate(hoje.getDate() + 2);
    
    const hojeStr = hoje.toISOString().split('T')[0];
    const doisDiasStr = doisDiasDepois.toISOString().split('T')[0];

    console.log(`[check-deadlines] Verificando prazos: hoje=${hojeStr}, limite=${doisDiasStr}`);

    // 1. Buscar OS com prazo próximo (até 2 dias)
    const { data: osPrazoProximo, error: errProximo } = await supabase
      .from('ordens_servico')
      .select(`
        id,
        codigo_os,
        responsavel_id,
        etapa_atual,
        prazo_etapa_atual,
        clientes(nome_fantasia, nome_razao_social)
      `)
      .gte('prazo_etapa_atual', hojeStr)
      .lte('prazo_etapa_atual', doisDiasStr)
      .in('status_geral', ['em_andamento', 'em_triagem'])
      .not('responsavel_id', 'is', null);

    if (errProximo) {
      console.error('[check-deadlines] Erro ao buscar prazos próximos:', errProximo);
    }

    // 2. Buscar OS com prazo vencido
    const { data: osPrazoVencido, error: errVencido } = await supabase
      .from('ordens_servico')
      .select(`
        id,
        codigo_os,
        responsavel_id,
        etapa_atual,
        prazo_etapa_atual,
        clientes(nome_fantasia, nome_razao_social)
      `)
      .lt('prazo_etapa_atual', hojeStr)
      .in('status_geral', ['em_andamento', 'em_triagem'])
      .not('responsavel_id', 'is', null);

    if (errVencido) {
      console.error('[check-deadlines] Erro ao buscar prazos vencidos:', errVencido);
    }

    const notificacoesParaInserir: Array<{
      usuario_id: string;
      titulo: string;
      mensagem: string;
      link_acao: string;
      tipo: string;
      lida: boolean;
    }> = [];

    // 3. Processar prazos próximos
    if (osPrazoProximo && osPrazoProximo.length > 0) {
      for (const os of osPrazoProximo) {
        const prazoDate = new Date(os.prazo_etapa_atual);
        const diffTime = prazoDate.getTime() - hoje.getTime();
        const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const clienteObj = os.clientes as any;
        const clienteNome = clienteObj?.nome_fantasia || clienteObj?.nome_razao_social || 'Cliente';

        // Buscar nome da etapa
        const { data: etapaData } = await supabase
          .from('os_etapas')
          .select('nome')
          .eq('os_id', os.id)
          .eq('ordem', os.etapa_atual)
          .single();
        
        const etapaNome = etapaData?.nome || `Etapa ${os.etapa_atual}`;

        notificacoesParaInserir.push({
          usuario_id: os.responsavel_id,
          titulo: `⏰ Prazo em ${diasRestantes} dia(s): ${os.codigo_os}`,
          mensagem: `A etapa "${etapaNome}" da OS **${clienteNome}** vence em ${diasRestantes} dia(s). Priorize para evitar atrasos.`,
          link_acao: `/os/${os.id}`,
          tipo: 'atencao',
          lida: false,
        });
      }
    }

    // 4. Processar prazos vencidos
    if (osPrazoVencido && osPrazoVencido.length > 0) {
      for (const os of osPrazoVencido) {
        const prazoDate = new Date(os.prazo_etapa_atual);
        const diffTime = hoje.getTime() - prazoDate.getTime();
        const diasAtraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const clienteObj = os.clientes as any;
        const clienteNome = clienteObj?.nome_fantasia || clienteObj?.nome_razao_social || 'Cliente';

        // Buscar nome da etapa
        const { data: etapaData } = await supabase
          .from('os_etapas')
          .select('nome')
          .eq('os_id', os.id)
          .eq('ordem', os.etapa_atual)
          .single();
        
        const etapaNome = etapaData?.nome || `Etapa ${os.etapa_atual}`;

        notificacoesParaInserir.push({
          usuario_id: os.responsavel_id,
          titulo: `🚨 ATRASADO: ${os.codigo_os}`,
          mensagem: `A etapa "${etapaNome}" da OS **${clienteNome}** está atrasada há ${diasAtraso} dia(s)! Ação urgente necessária.`,
          link_acao: `/os/${os.id}`,
          tipo: 'atencao',
          lida: false,
        });
      }
    }

    // 5. Inserir notificações em lote
    let insertedCount = 0;
    if (notificacoesParaInserir.length > 0) {
      const { error: insertError } = await supabase
        .from('notificacoes')
        .insert(notificacoesParaInserir);

      if (insertError) {
        console.error('[check-deadlines] Erro ao inserir notificações:', insertError);
      } else {
        insertedCount = notificacoesParaInserir.length;
      }
    }

    console.log(`[check-deadlines] Processado: ${osPrazoProximo?.length || 0} próximos, ${osPrazoVencido?.length || 0} vencidos, ${insertedCount} notificações criadas`);

    return new Response(
      JSON.stringify({
        success: true,
        prazoProximo: osPrazoProximo?.length || 0,
        prazoVencido: osPrazoVencido?.length || 0,
        notificacoesCriadas: insertedCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('[check-deadlines] Erro geral:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
