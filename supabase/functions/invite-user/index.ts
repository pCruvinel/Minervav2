import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

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

// Initialize Supabase Admin Client
const getSupabaseAdmin = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, supabaseServiceKey);
};

// ============================================================
// ROTA PRINCIPAL: POST /
// Aceita convite único (email) ou em lote (invites array)
// ============================================================
app.post("/*", async (c) => {
  const supabase = getSupabaseAdmin();
  let body;

  try {
    body = await c.req.json();
  } catch (_e) {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { invites, redirectTo, email, options } = body;

  // Se for convite único (legado)
  if (email && !invites) {
    const inviteOptions = {
      redirectTo: options?.redirectTo || undefined,
      data: options?.data || {},
    };

    try {
      console.log(`📧 Sending invite to ${email}...`);
      
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

  // Convites em lote
  if (!invites || !Array.isArray(invites) || invites.length === 0) {
    return c.json({ error: "invites array is required and cannot be empty" }, 400);
  }

  console.log(`📧 Processing ${invites.length} invites...`);

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
          redirectTo: redirectTo || undefined,
          data: userData
        }
      );

      if (error) {
        console.error(`❌ Error inviting ${inviteEmail}:`, error.message);
        results.failed.push({ email: inviteEmail, error: error.message });
      } else {
        console.log(`✅ Invited ${inviteEmail} (ID: ${data.user.id})`);
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

Deno.serve(app.fetch);
