import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

/**
 * Returns the base URL for redirects based on environment.
 * Uses SITE_URL secret in production, falls back to localhost for development.
 */
const getBaseUrl = (): string => {
  // eslint-disable-next-line no-undef
  const siteUrl = Deno.env.get("SITE_URL");
  if (siteUrl) return siteUrl;
  return "http://localhost:3000";
};

/**
 * Default redirect URL for auth callbacks.
 */
const getDefaultRedirectTo = (): string => {
  return `${getBaseUrl()}/auth/callback`;
};

// Enable CORS
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "x-client-info", "apikey"],
    allowMethods: ["POST", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// Explicit OPTIONS handler to ensure CORS works
app.options("/*", (c) => {
  return c.text("", 204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
  });
});

// Debug Logger
app.use("/*", async (c, next) => {
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.path}`);
  await next();
});

// Initialize Supabase Admin Client
const getSupabaseAdmin = () => {
  // eslint-disable-next-line no-undef
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  // eslint-disable-next-line no-undef
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, supabaseServiceKey);
};

// ============================================================
// ROTA PRINCIPAL: POST /
// Aceita convite unico, em lote ou criacao completa (create-full)
// ============================================================
app.post("/*", async (c) => {
  const supabase = getSupabaseAdmin();
  let body;

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { action, invites, redirectTo, email, options, email_acesso, enviar_convite, ...colaboradorData } = body;

  // Fluxo novo: Cadastro completo centralizado
  if (action === 'create-full') {
    let authUserId = null;
    let inviteStatus = 'nao_convidado';

    // 1. Criar usuario no auth (se aplicavel)
    if (enviar_convite && email_acesso) {
      console.log(`📧 Sending invite to ${email_acesso} for full registration...`);
      const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
        email_acesso,
        {
          redirectTo: redirectTo || getDefaultRedirectTo(),
          data: { full_name: colaboradorData.nome_completo }
        }
      );

      if (authError) {
        console.error("❌ Error inviting user:", authError);
        return c.json({ error: "Erro ao criar usuario de acesso: " + authError.message }, 400);
      }
      
      authUserId = authData.user.id;
      inviteStatus = 'convidado';
      console.log(`✅ Auth user created: ${authUserId}`);
    } else {
      console.log(`ℹ️ User creation skipped (No access or no email provided)`);
    }

    const restColaboradorData = { ...colaboradorData };
    delete restColaboradorData.documentos_obrigatorios;

    // 2. Inserir em public.colaboradores
    const insertData = {
      ...restColaboradorData,
      auth_user_id: authUserId,
      email: email_acesso || colaboradorData.email_profissional || colaboradorData.email_pessoal || null,
      status_convite: inviteStatus,
    };

    console.log(`💾 Inserting collaborator data...`);
    const { data: colabData, error: colabError } = await supabase
      .from('colaboradores')
      .insert([insertData])
      .select()
      .single();
    
    if (colabError) {
      console.error("❌ Error inserting into public.colaboradores:", colabError);
      return c.json({ error: "Usuario de acesso criado, mas erro ao salvar dados do colaborador: " + colabError.message }, 500);
    }

    console.log(`✅ Collaborator fully registered: ${colabData.id}`);
    return c.json({ success: true, colaborador: colabData });
  }

  // Fluxo novo: Gerar apenas o link de convite (para "Copiar Link")
  if (action === 'generate-invite-link') {
    if (!email) {
      return c.json({ error: "Email is required for link generation" }, 400);
    }
    
    try {
      console.log(`🔗 Generating invite link for ${email}...`);
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'invite',
        email: email,
        options: {
          redirectTo: redirectTo || getDefaultRedirectTo()
        }
      });

      if (linkError) {
        console.error("❌ Error generating link:", linkError);
        return c.json({ error: linkError.message }, 400);
      }

      console.log(`✅ Link generated for ${email}`);
      return c.json({ 
        success: true, 
        action_link: linkData.properties?.action_link || linkData.properties?.action_link 
      });
    } catch (err: unknown) {
      console.error(`❌ Unexpected error generating link for ${email}:`, err);
      return c.json({ error: (err as Error).message || "Unknown error" }, 500);
    }
  }

  // Se for convite unico (legado)
  if (email && !invites) {
    const inviteOptions = {
      redirectTo: options?.redirectTo || getDefaultRedirectTo(),
      data: options?.data || {},
    };

    try {
      console.log(`📧 Sending invite to ${email}...`);
      console.log(`🔗 Redirect URL: ${inviteOptions.redirectTo}`);

      const { data, error } = await supabase.auth.admin.inviteUserByEmail(
        email,
        inviteOptions
      );

      if (error) {
        console.error("❌ Error inviting user:", error);
        return c.json({ error: error.message }, 400);
      }

      console.log("✅ Invite sent successfully:", data.user.id);
      return c.json({
        success: true,
        message: "Invite sent successfully",
        user: {
          id: data.user.id,
          email: data.user.email,
          created_at: data.user.created_at
        }
      });

    } catch (err) {
      console.error("❌ Unexpected error:", err);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  }

  // Convites em lote (usado no reenvio de convite)
  if (!invites || !Array.isArray(invites) || invites.length === 0) {
    return c.json({ error: "invites array is required and cannot be empty" }, 400);
  }

  const defaultRedirect = getDefaultRedirectTo();
  console.log(`📧 Processing ${invites.length} invites...`);
  console.log(`🔗 Default redirect URL: ${redirectTo || defaultRedirect}`);

  const results: {
    success: Array<{ email: string; user_id: string }>;
    failed: Array<{ email: string; error: string }>;
  } = {
    success: [],
    failed: []
  };

  for (const invite of invites) {
    const { email: inviteEmail, nome, cargo_id, setor_id } = invite;

    if (!inviteEmail) {
      results.failed.push({ email: inviteEmail || 'undefined', error: "Email is required" });
      continue;
    }

    try {
      const userData = {
        full_name: nome || '',
        cargo_id: cargo_id || null,
        setor_id: setor_id || null,
      };

      const { data, error } = await supabase.auth.admin.inviteUserByEmail(
        inviteEmail,
        {
          redirectTo: redirectTo || getDefaultRedirectTo(),
          data: userData
        }
      );

      if (error) {
        console.error(`❌ Error inviting ${inviteEmail}:`, error.message);
        results.failed.push({ email: inviteEmail, error: error.message });
      } else {
        console.log(`✅ Invited ${inviteEmail} (ID: ${data.user.id})`);
        
        // Em reenvio de convite, tentamos atualizar o auth_user_id do colaborador
        await supabase.from('colaboradores')
          .update({ 
            auth_user_id: data.user.id,
            status_convite: 'convidado' 
          })
          .eq('email', inviteEmail);

        results.success.push({ email: inviteEmail, user_id: data.user.id });
      }

    } catch (err: unknown) {
      console.error(`❌ Unexpected error for ${inviteEmail}:`, err);
      results.failed.push({ email: inviteEmail, error: (err as Error).message || "Unknown error" });
    }
  }

  const totalSuccess = results.success.length;
  const totalFailed = results.failed.length;

  console.log(`📊 Results: ${totalSuccess} success, ${totalFailed} failed`);

  return c.json({
    success: totalFailed === 0,
    message: `${totalSuccess} convite(s) enviado(s) com sucesso${totalFailed > 0 ? `, ${totalFailed} falha(s)` : ''}`,
    results
  });
});

// eslint-disable-next-line no-undef
Deno.serve(app.fetch);
