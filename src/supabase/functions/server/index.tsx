import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
};

// Helper: Normalizar status de etapa para corresponder ao enum do Postgres
const normalizeEtapaStatus = (status: string | undefined): string | undefined => {
  if (!status) return status;
  
  // Remover acentos
  const removeAccents = (str: string) => 
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Converter para o padrão: MAIÚSCULAS + SNAKE_CASE
  const normalized = removeAccents(status)
    .toUpperCase()
    .trim()
    .replace(/\s+/g, '_');
  
  // Valores válidos do enum os_etapa_status
  const validValues = [
    'PENDENTE',
    'EM_ANDAMENTO',
    'AGUARDANDO_APROVACAO',
    'APROVADA',
    'REJEITADA'
  ];
  
  // Se já está no formato correto, retornar
  if (validValues.includes(normalized)) {
    return normalized;
  }
  
  // Mapeamento de valores antigos para novos
  const legacyMap: Record<string, string> = {
    'CONCLUIDA': 'APROVADA', // Etapa concluída = aprovada
    'REPROVADA': 'REJEITADA',
  };
  
  return legacyMap[normalized] || normalized;
};

// Helper: Normalizar status geral de OS para corresponder ao enum do Postgres
const normalizeOsStatusGeral = (status: string | undefined): string | undefined => {
  if (!status) return status;
  
  // Remover acentos
  const removeAccents = (str: string) => 
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Converter para o padrão: MAIÚSCULAS + SNAKE_CASE
  const normalized = removeAccents(status)
    .toUpperCase()
    .trim()
    .replace(/\s+/g, '_');
  
  // Valores válidos do enum os_status_geral
  const validValues = [
    'EM_TRIAGEM',
    'AGUARDANDO_INFORMACOES',
    'EM_ANDAMENTO',
    'EM_VALIDACAO',
    'ATRASADA',
    'CONCLUIDA',
    'CANCELADA'
  ];
  
  // Se já está no formato correto, retornar
  if (validValues.includes(normalized)) {
    return normalized;
  }
  
  // Mapeamento de valores antigos para novos
  const legacyMap: Record<string, string> = {
    'AGUARDANDO_APROVACAO': 'EM_VALIDACAO',
    'PAUSADA': 'EM_ANDAMENTO', // Status "Pausada" não existe mais
  };
  
  return legacyMap[normalized] || normalized;
};

// Helper: Normalizar status de cliente para corresponder ao enum do Postgres
const normalizeClienteStatus = (status: string | undefined): string | undefined => {
  if (!status) return status;
  
  // Remover acentos
  const removeAccents = (str: string) => 
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Converter para o padrão: MAIÚSCULAS + SNAKE_CASE
  const normalized = removeAccents(status)
    .toUpperCase()
    .trim()
    .replace(/\s+/g, '_');
  
  // Valores válidos do enum cliente_status
  const validValues = [
    'LEAD',
    'CLIENTE_ATIVO',
    'CLIENTE_INATIVO'
  ];
  
  // Se já está no formato correto, retornar
  if (validValues.includes(normalized)) {
    return normalized;
  }
  
  // Mapeamento de valores antigos para novos
  const legacyMap: Record<string, string> = {
    'ATIVO': 'CLIENTE_ATIVO',
    'INATIVO': 'CLIENTE_INATIVO',
  };
  
  return legacyMap[normalized] || normalized;
};

// Health check endpoint
app.get("/make-server-5ad7fd2c/health", (c) => {
  return c.json({ status: "ok" });
});

// Debug: Schema reload endpoint
app.post("/make-server-5ad7fd2c/reload-schema", async (c) => {
  try {
    const supabase = getSupabaseClient();
    
    // Force PostgREST to reload schema cache
    // This is done by making a request to the root endpoint with prefer header
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Prefer': 'schema-reload'
      }
    });
    
    return c.json({ 
      status: "ok", 
      message: "Schema reload signal sent",
      response: response.status
    });
  } catch (error) {
    console.error('Error reloading schema:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Debug: Check table structure
app.get("/make-server-5ad7fd2c/debug/table-structure", async (c) => {
  try {
    const supabase = getSupabaseClient();
    
    // Query information schema to get actual column names
    const { data, error } = await supabase
      .rpc('exec_sql', { 
        query: `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'ordens_servico' 
          ORDER BY ordinal_position;
        ` 
      });
    
    if (error) {
      // If RPC doesn't exist, try direct query
      console.log('RPC not available, trying alternative method...');
      
      // Try to create and read a test record to see what columns exist
      const { error: testError } = await supabase
        .from('ordens_servico')
        .select('*')
        .limit(1);
      
      return c.json({ 
        message: "Table exists",
        error: testError?.message || null,
        hint: testError?.hint || null,
        details: testError?.details || null
      });
    }
    
    return c.json({ columns: data });
  } catch (error) {
    console.error('Error checking table structure:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ==================== CLIENTES/LEADS ROUTES ====================

// Listar todos os leads/clientes
app.get("/make-server-5ad7fd2c/clientes", async (c) => {
  try {
    const supabase = getSupabaseClient();
    const { status } = c.req.query();
    
    console.log('📥 GET /clientes - Filtro status recebido:', status);
    
    // SOLUÇÃO EMERGENCIAL: Buscar TODOS os clientes SEM filtro
    // para evitar erro de enum até que o banco seja corrigido
    const query = supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });
    
    // NÃO aplicar filtro de status até corrigir o enum no banco
    // if (status) {
    //   query = query.eq('status', normalizeClienteStatus(status));
    // }
    
    console.log('🔄 Executando query SEM filtro de status...');
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Erro ao buscar clientes:', error);
      return c.json({ error: error.message }, 500);
    }
    
    console.log(`✅ ${data?.length || 0} clientes retornados`);
    
    // Se um filtro de status foi solicitado, filtrar no código (temporário)
    let filteredData = data;
    if (status && data) {
      const normalizedStatus = normalizeClienteStatus(status);
      console.log(`🔍 Filtrando clientes no código: status = ${normalizedStatus}`);
      
      filteredData = data.filter(cliente => {
        // Comparar de forma case-insensitive e ignorando espaços
        const clienteStatus = String(cliente.status || '')
          .toUpperCase()
          .trim()
          .replace(/\s+/g, '_');
        
        return clienteStatus === normalizedStatus;
      });
      
      console.log(`✅ ${filteredData.length} clientes após filtro`);
    }
    
    return c.json(filteredData);
  } catch (error) {
    console.error('❌ Erro no endpoint /clientes:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Buscar cliente por ID
app.get("/make-server-5ad7fd2c/clientes/:id", async (c) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = c.req.param();
    
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar cliente:', error);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(data);
  } catch (error) {
    console.error('Erro no endpoint /clientes/:id:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Criar novo cliente/lead
app.post("/make-server-5ad7fd2c/clientes", async (c) => {
  try {
    const supabase = getSupabaseClient();
    const body = await c.req.json();
    
    const { data, error } = await supabase
      .from('clientes')
      .insert([body])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar cliente:', error);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(data, 201);
  } catch (error) {
    console.error('Erro no endpoint POST /clientes:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Atualizar cliente
app.put("/make-server-5ad7fd2c/clientes/:id", async (c) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = c.req.param();
    const body = await c.req.json();
    
    const { data, error } = await supabase
      .from('clientes')
      .update(body)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar cliente:', error);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(data);
  } catch (error) {
    console.error('Erro no endpoint PUT /clientes/:id:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ==================== ORDENS DE SERVIÇO ROUTES ====================

// Listar todas as OS
app.get("/make-server-5ad7fd2c/ordens-servico", async (c) => {
  try {
    console.log('📥 GET /ordens-servico - Iniciando busca...');
    const supabase = getSupabaseClient();
    const { status, tipo } = c.req.query();
    
    console.log('🔍 Filtros recebidos:', { status, tipo });
    
    let query = supabase
      .from('ordens_servico')
      .select(`
        *,
        cliente:clientes(*),
        tipo_os:tipos_os(*),
        responsavel:colaboradores!ordens_servico_responsavel_id_fkey(*)
      `)
      .order('data_entrada', { ascending: false });
    
    if (status) {
      query = query.eq('status_geral', normalizeOsStatusGeral(status));
    }
    
    console.log('🔄 Executando query no Supabase...');
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Erro ao buscar OS:', error);
      return c.json({ error: error.message }, 500);
    }
    
    // Buscar etapa atual de cada OS (etapa em andamento ou a primeira pendente)
    const ordensComEtapa = await Promise.all(
      (data || []).map(async (os) => {
        const { data: etapas } = await supabase
          .from('os_etapas')
          .select('numero_etapa, titulo, status')
          .eq('os_id', os.id)
          .order('numero_etapa', { ascending: true });
        
        // Buscar primeira etapa EM_ANDAMENTO ou PENDENTE
        const etapaAtual = etapas?.find(e => 
          e.status === 'EM_ANDAMENTO' || e.status === 'PENDENTE'
        ) || etapas?.[0];
        
        return {
          ...os,
          etapa_atual: etapaAtual || null
        };
      })
    );
    
    console.log(`✅ Busca bem-sucedida: ${ordensComEtapa?.length || 0} registros encontrados`);
    return c.json(ordensComEtapa);
  } catch (error) {
    console.error('❌ Erro no endpoint /ordens-servico:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Buscar OS por ID
app.get("/make-server-5ad7fd2c/ordens-servico/:id", async (c) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = c.req.param();
    
    const { data, error } = await supabase
      .from('ordens_servico')
      .select(`
        *,
        cliente:clientes(*),
        tipo_os:tipos_os(*),
        responsavel:colaboradores!ordens_servico_responsavel_id_fkey(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar OS:', error);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(data);
  } catch (error) {
    console.error('Erro no endpoint /ordens-servico/:id:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Criar nova OS
app.post("/make-server-5ad7fd2c/ordens-servico", async (c) => {
  try {
    const supabase = getSupabaseClient();
    const body = await c.req.json();
    
    console.log('📝 POST /ordens-servico - Dados recebidos:', JSON.stringify(body, null, 2));
    
    // Se criado_por_id não foi fornecido ou é inválido, buscar/criar colaborador "Sistema"
    if (!body.criado_por_id || body.criado_por_id === '00000000-0000-0000-0000-000000000000') {
      console.log('⚠️ criado_por_id não fornecido ou inválido, usando colaborador Sistema');
      
      // Buscar colaborador "Sistema" existente
      const { data: sistemaColaborador, error: searchError } = await supabase
        .from('colaboradores')
        .select('id')
        .eq('nome_completo', 'Sistema Minerva')
        .single();
      
      if (sistemaColaborador) {
        body.criado_por_id = sistemaColaborador.id;
        console.log('✅ Usando colaborador Sistema existente:', sistemaColaborador.id);
      } else {
        console.log('📝 Colaborador Sistema não existe, tentando criar...');
        
        // Criar usuário no auth.users primeiro (necessário para FK)
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: 'sistema@minerva.com',
          password: crypto.randomUUID(),
          email_confirm: true,
          user_metadata: { 
            nome_completo: 'Sistema Minerva',
            sistema: true 
          }
        });
        
        if (authError) {
          console.error('❌ Erro ao criar usuário auth:', authError);
          return c.json({ 
            error: 'Erro ao criar usuário Sistema. Configure um colaborador válido no banco.',
            details: authError 
          }, 500);
        }
        
        // Criar colaborador Sistema
        const { data: novoSistema, error: createError } = await supabase
          .from('colaboradores')
          .insert([{
            id: authUser.user.id,
            nome_completo: 'Sistema Minerva',
            role_nivel: 'COLABORADOR',
            ativo: true
          }])
          .select()
          .single();
        
        if (createError) {
          console.error('❌ Erro ao criar colaborador Sistema:', createError);
          return c.json({ 
            error: 'Erro ao criar colaborador Sistema no banco.',
            details: createError 
          }, 500);
        }
        
        body.criado_por_id = novoSistema.id;
        console.log('✅ Colaborador Sistema criado:', novoSistema.id);
      }
    }
    
    // Gerar código da OS automaticamente
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('ordens_servico')
      .select('*', { count: 'exact', head: true })
      .like('codigo_os', `OS-${year}-%`);
    
    const nextNumber = (count || 0) + 1;
    const codigo_os = `OS-${year}-${String(nextNumber).padStart(3, '0')}`;
    
    console.log(`🔢 Código gerado: ${codigo_os}`);
    
    const dataToInsert = { ...body, codigo_os };
    console.log('💾 Dados a inserir:', JSON.stringify(dataToInsert, null, 2));
    
    const { data, error } = await supabase
      .from('ordens_servico')
      .insert([dataToInsert])
      .select(`
        *,
        cliente:clientes(*),
        tipo_os:tipos_os(*),
        responsavel:colaboradores!ordens_servico_responsavel_id_fkey(*)
      `)
      .single();
    
    if (error) {
      console.error('❌ Erro ao criar OS:', error);
      console.error('❌ Erro detalhado:', JSON.stringify(error, null, 2));
      return c.json({ error: error.message, details: error }, 500);
    }
    
    console.log('✅ OS criada com sucesso:', data.codigo_os);
    return c.json(data, 201);
  } catch (error) {
    console.error('❌ Erro no endpoint POST /ordens-servico:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Atualizar OS
app.put("/make-server-5ad7fd2c/ordens-servico/:id", async (c) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = c.req.param();
    const body = await c.req.json();
    
    const { data, error } = await supabase
      .from('ordens_servico')
      .update(body)
      .eq('id', id)
      .select(`
        *,
        cliente:clientes(*),
        tipo_os:tipos_os(*),
        responsavel:colaboradores!ordens_servico_responsavel_id_fkey(*)
      `)
      .single();
    
    if (error) {
      console.error('Erro ao atualizar OS:', error);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(data);
  } catch (error) {
    console.error('Erro no endpoint PUT /ordens-servico/:id:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ==================== ETAPAS DE OS ROUTES ====================

// Listar etapas de uma OS
app.get("/make-server-5ad7fd2c/ordens-servico/:osId/etapas", async (c) => {
  try {
    const supabase = getSupabaseClient();
    const { osId } = c.req.param();
    
    const { data, error } = await supabase
      .from('os_etapas')
      .select(`
        *,
        responsavel:colaboradores!responsavel_id(*),
        aprovador:colaboradores!aprovador_id(*)
      `)
      .eq('os_id', osId)
      .order('ordem', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar etapas:', error);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(data);
  } catch (error) {
    console.error('Erro no endpoint /ordens-servico/:osId/etapas:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Criar etapa
app.post("/make-server-5ad7fd2c/ordens-servico/:osId/etapas", async (c) => {
  try {
    const supabase = getSupabaseClient();
    const { osId } = c.req.param();
    const body = await c.req.json();
    
    // Normalizar status para corresponder ao enum do Postgres
    if (body.status) {
      body.status = normalizeEtapaStatus(body.status);
    }
    
    console.log(`➕ Criando etapa na OS ${osId}:`, {
      ordem: body.ordem,
      nome_etapa: body.nome_etapa,
      status: body.status
    });
    
    const { data, error } = await supabase
      .from('os_etapas')
      .insert([{ ...body, os_id: osId }])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao criar etapa:', error);
      console.error('Body enviado:', body);
      return c.json({ error: error.message }, 500);
    }
    
    console.log(`✅ Etapa criada: ${data.nome_etapa}`);
    return c.json(data, 201);
  } catch (error) {
    console.error('❌ Erro no endpoint POST /ordens-servico/:osId/etapas:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Atualizar etapa
app.put("/make-server-5ad7fd2c/etapas/:id", async (c) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = c.req.param();
    const body = await c.req.json();
    
    // Normalizar status para corresponder ao enum do Postgres
    if (body.status) {
      body.status = normalizeEtapaStatus(body.status);
    }
    
    console.log(`💾 Atualizando etapa ${id}:`, {
      status: body.status,
      campos: Object.keys(body)
    });
    
    const { data, error } = await supabase
      .from('os_etapas')
      .update(body)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao atualizar etapa:', error);
      return c.json({ error: error.message }, 500);
    }
    
    console.log(`✅ Etapa atualizada: ${data.nome_etapa}`);
    return c.json(data);
  } catch (error) {
    console.error('❌ Erro no endpoint PUT /etapas/:id:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ==================== TIPOS DE OS ROUTES ====================

// Listar tipos de OS
app.get("/make-server-5ad7fd2c/tipos-os", async (c) => {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('tipos_os')
      .select('*')
      .order('codigo', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar tipos de OS:', error);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(data);
  } catch (error) {
    console.error('Erro no endpoint /tipos-os:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ==================== SEED/SETUP ROUTES ====================

// Seed inicial de usuários com diferentes cargos
app.post("/make-server-5ad7fd2c/seed-usuarios", async (c) => {
  try {
    console.log('🌱 Iniciando seed de usuários...');
    const supabase = getSupabaseClient();
    
    const usuarios = [
      {
        email: 'diretoria@minerva.com',
        password: 'diretoria123',
        nome_completo: 'Carlos Diretor',
        role_nivel: 'DIRETORIA',
        setor: 'ADM'
      },
      {
        email: 'gestor.adm@minerva.com',
        password: 'gestor123',
        nome_completo: 'Maria Gestora ADM',
        role_nivel: 'GESTOR_ADM',
        setor: 'ADM'
      },
      {
        email: 'gestor.obras@minerva.com',
        password: 'gestor123',
        nome_completo: 'João Gestor de Obras',
        role_nivel: 'GESTOR_SETOR',
        setor: 'OBRAS'
      },
      {
        email: 'gestor.assessoria@minerva.com',
        password: 'gestor123',
        nome_completo: 'Paula Gestora de Assessoria',
        role_nivel: 'GESTOR_SETOR',
        setor: 'ASSESSORIA'
      },
      {
        email: 'colaborador@minerva.com',
        password: 'colaborador123',
        nome_completo: 'Ana Colaboradora',
        role_nivel: 'COLABORADOR',
        setor: 'OBRAS'
      }
    ];
    
    const resultados = [];
    const erros = [];
    
    for (const usuario of usuarios) {
      try {
        console.log(`📝 Processando usuário: ${usuario.email}...`);
        
        // 1. Buscar usuário existente no auth por email
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingAuthUser = existingUsers?.users?.find(u => u.email === usuario.email);
        
        let authUserId: string;
        let authUserCreated = false;
        
        if (existingAuthUser) {
          console.log(`✓ Usuário auth já existe: ${existingAuthUser.id}`);
          authUserId = existingAuthUser.id;
        } else {
          // Criar usuário no auth.users
          console.log(`→ Criando usuário auth...`);
          const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: usuario.email,
            password: usuario.password,
            email_confirm: true,
            user_metadata: {
              nome_completo: usuario.nome_completo,
              role_nivel: usuario.role_nivel
            }
          });
          
          if (authError) {
            throw new Error(`Erro ao criar usuário auth: ${authError.message}`);
          }
          
          authUserId = authUser.user.id;
          authUserCreated = true;
          console.log(`✅ Usuário auth criado: ${authUserId}`);
        }
        
        // 2. Verificar se colaborador já existe
        const { data: existingColaborador } = await supabase
          .from('colaboradores')
          .select('id, nome_completo')
          .eq('id', authUserId)
          .single();
        
        if (existingColaborador) {
          console.log(`✓ Colaborador já existe: ${existingColaborador.nome_completo}`);
          resultados.push({
            email: usuario.email,
            nome: existingColaborador.nome_completo,
            role: usuario.role_nivel,
            setor: usuario.setor,
            status: 'already_exists',
            id: authUserId,
            message: 'Usuário e colaborador já existem no sistema'
          });
          continue;
        }
        
        // 3. Criar colaborador
        console.log(`→ Criando colaborador...`);
        const { data: colaborador, error: colaboradorError } = await supabase
          .from('colaboradores')
          .insert([{
            id: authUserId,
            nome_completo: usuario.nome_completo,
            role_nivel: usuario.role_nivel,
            setor: usuario.setor,
            ativo: true
          }])
          .select()
          .single();
        
        if (colaboradorError) {
          // Se falhar ao criar colaborador e o auth user foi criado agora, deletar
          if (authUserCreated) {
            console.log(`⚠️ Revertendo criação do auth user...`);
            await supabase.auth.admin.deleteUser(authUserId);
          }
          throw new Error(`Erro ao criar colaborador: ${colaboradorError.message}`);
        }
        
        console.log(`✅ Colaborador criado: ${colaborador.nome_completo}`);
        
        resultados.push({
          email: usuario.email,
          nome: usuario.nome_completo,
          role: usuario.role_nivel,
          setor: usuario.setor,
          status: authUserCreated ? 'created' : 'created_colaborador_only',
          id: authUserId,
          message: authUserCreated 
            ? 'Usuário e colaborador criados com sucesso' 
            : 'Colaborador criado (auth user já existia)'
        });
        
      } catch (error) {
        console.error(`❌ Erro ao criar ${usuario.email}:`, error);
        erros.push({
          email: usuario.email,
          error: String(error)
        });
      }
    }
    
    console.log(`✅ Seed concluído! ${resultados.length} usuários processados`);
    
    return c.json({
      success: true,
      message: 'Seed de usuários concluído',
      resultados,
      erros: erros.length > 0 ? erros : undefined,
      summary: {
        total: usuarios.length,
        criados: resultados.filter(r => r.status === 'created' || r.status === 'created_colaborador_only').length,
        existentes: resultados.filter(r => r.status === 'already_exists').length,
        erros: erros.length
      }
    }, 201);
    
  } catch (error) {
    console.error('❌ Erro no seed de usuários:', error);
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);