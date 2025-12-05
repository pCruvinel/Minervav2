import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Enable CORS
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
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

app.post("/invite-user", async (c) => {
  const supabase = getSupabaseAdmin();
  let body;

  try {
    body = await c.req.json();
  } catch (e) {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { email, options } = body;

  if (!email) {
    return c.json({ error: "Email is required" }, 400);
  }

  // Default options for inviteUserByEmail
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
      return c.json({ error: error.message }, 400); // 400 usually for Supabase Auth errors
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
});

Deno.serve(app.fetch);
