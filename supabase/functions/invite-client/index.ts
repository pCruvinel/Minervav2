import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

/**
 * Returns the base URL for redirects based on environment.
 */
const getBaseUrl = (): string => {
  const siteUrl = Deno.env.get("SITE_URL");
  if (siteUrl) return siteUrl;
  return "http://localhost:3000";
};

/**
 * Portal redirect URL for client auth callbacks.
 */
const getPortalRedirectTo = (): string => {
  return `${getBaseUrl()}/auth/callback?type=cliente`;
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

// Initialize Supabase Admin Client
const getSupabaseAdmin = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, supabaseServiceKey);
};

// ==========================================================
// INTERFACES
// ==========================================================

interface InviteClientBody {
  clienteId: string;
  email: string;
  nomeCliente: string;
  osId?: string;
}

// ==========================================================
// MAIN ROUTE: POST /
// Send invitation to client to access their portal
// ==========================================================
app.post("/*", async (c) => {
  const supabase = getSupabaseAdmin();
  let body: InviteClientBody;

  try {
    body = await c.req.json();
  } catch (_e) {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { clienteId, email, nomeCliente, osId } = body;

  // Validate required fields
  if (!clienteId) {
    return c.json({ error: "clienteId is required" }, 400);
  }

  if (!email) {
    return c.json({ error: "email is required" }, 400);
  }

  if (!nomeCliente) {
    return c.json({ error: "nomeCliente is required" }, 400);
  }

  try {
    console.log(`📧 Sending client portal invite to ${email}...`);
    console.log(`🏢 Client: ${nomeCliente} (ID: ${clienteId})`);
    console.log(`🔗 Redirect URL: ${getPortalRedirectTo()}`);

    // Check if user already exists
    const { data: existingUsers } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      return c.json({
        error: "Este e-mail já possui uma conta no sistema",
        code: "USER_EXISTS"
      }, 400);
    }

    // Send invitation with client metadata
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: getPortalRedirectTo(),
        data: {
          account_type: 'cliente',
          is_client: true, // Necessário para Auth V3
          cargo_slug: 'cliente', // Necessário para Auth V3
          cliente_id: clienteId,
          full_name: nomeCliente,
        }
      }
    );

    if (error) {
      console.error("❌ Error inviting client:", error);
      return c.json({ error: error.message }, 400);
    }

    console.log("✅ Client invite sent successfully:", data.user.id);

    // Register activity in OS timeline if osId provided
    if (osId) {
      try {
        await supabase.from('os_atividades').insert({
          os_id: osId,
          tipo: 'sistema',
          descricao: `Convite de acesso ao portal enviado para ${email}`,
          dados: {
            clienteId,
            email,
            authUserId: data.user.id
          }
        });
        console.log("📝 Activity logged in OS timeline");
      } catch (logErr) {
        console.warn("⚠️ Failed to log activity:", logErr);
        // Don't fail the request if logging fails
      }
    }

    // Update cliente record with auth_user_id
    try {
      await supabase
        .from('clientes')
        .update({
          auth_user_id: data.user.id,
          portal_convidado_em: new Date().toISOString()
        })
        .eq('id', clienteId);
      console.log("✅ Cliente record updated with auth_user_id");
    } catch (updateErr) {
      console.warn("⚠️ Failed to update cliente record:", updateErr);
    }

    return c.json({
      success: true,
      message: "Convite enviado com sucesso",
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
});

Deno.serve(app.fetch);
