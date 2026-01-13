import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import nodemailer from "npm:nodemailer@6.9.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { to, subject, html, text, attachments } = await req.json();

    if (!to || !subject || (!html && !text)) {
      throw new Error('Campos obrigatórios: to, subject, html/text');
    }

    // 1. Buscar configurações de SMTP do banco de dados (app_settings)
    const { data: settingsData, error: settingsError } = await supabaseClient
      .from('app_settings')
      .select('key, value')
      .in('key', [
        'smtp_host',
        'smtp_port',
        'smtp_user',
        'smtp_password',
        'smtp_secure',
        'email_sender_name',
        'email_sender_address'
      ]);

    if (settingsError) throw new Error(`Erro ao buscar configurações: ${settingsError.message}`);

    const settings: Record<string, string> = {};
    settingsData.forEach((s: { key: string; value: string }) => {
      settings[s.key] = s.value;
    });

    if (!settings['smtp_host'] || !settings['smtp_user'] || !settings['smtp_password']) {
      throw new Error('Configurações de SMTP incompletas no sistema.');
    }

    // 2. Configurar Transporter
    const transporter = nodemailer.createTransport({
      host: settings['smtp_host'],
      port: parseInt(settings['smtp_port'] || '587'),
      secure: settings['smtp_secure'] === 'true', // true for 465, false for other ports
      auth: {
        user: settings['smtp_user'],
        pass: settings['smtp_password'],
      },
    });

    // 3. Configurar Remetente
    const senderName = settings['email_sender_name'] || 'Minerva ERP';
    const senderAddress = settings['email_sender_address'] || settings['smtp_user'];
    const from = `"${senderName}" <${senderAddress}>`;

    // 4. Enviar Email
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
      attachments: attachments || [], // Expects array of { filename, content, contentType } etc.
    });

    // 5. Retornar sucesso
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: info.messageId,
        response: info.response 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
