# ⚡ COMANDOS RÁPIDOS - Supabase

## 🚀 Deploy das Edge Functions

### Via CLI (Recomendado)
```bash
# 1. Instalar CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link ao projeto
supabase link --project-ref zxfevlkssljndqqhxkjb

# 4. Deploy
cd supabase/functions
supabase functions deploy server

# 5. Verificar
supabase functions list
```

---

## 🧪 Testes de API

### Health Check
```bash
curl https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/make-server-5ad7fd2c/health \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZmV2bGtzc2xqbmRxcWh4a2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDkxNTcsImV4cCI6MjA3ODIyNTE1N30.cODYFIRpNluf8tUZqyL8y0GC46GCEGxELHVxrKcAH7c"
```

### Listar Clientes
```bash
curl https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/make-server-5ad7fd2c/clientes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZmV2bGtzc2xqbmRxcWh4a2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDkxNTcsImV4cCI6MjA3ODIyNTE1N30.cODYFIRpNluf8tUZqyL8y0GC46GCEGxELHVxrKcAH7c"
```

### Seed de Usuários
```bash
curl -X POST https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/make-server-5ad7fd2c/seed-usuarios \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZmV2bGtzc2xqbmRxcWh4a2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDkxNTcsImV4cCI6MjA3ODIyNTE1N30.cODYFIRpNluf8tUZqyL8y0GC46GCEGxELHVxrKcAH7c" \
  -H "Content-Type: application/json"
```

---

## 🌐 Testes no Browser

### Copie e cole no Console (F12):

```javascript
// Configuração
const projectId = "zxfevlkssljndqqhxkjb";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZmV2bGtzc2xqbmRxcWh4a2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDkxNTcsImV4cCI6MjA3ODIyNTE1N30.cODYFIRpNluf8tUZqyL8y0GC46GCEGxELHVxrKcAH7c";
const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-5ad7fd2c`;

// Health Check
fetch(`${baseUrl}/health`, {
  headers: { 'Authorization': `Bearer ${publicAnonKey}` }
})
  .then(r => r.json())
  .then(data => console.log('✅ Health:', data))
  .catch(err => console.error('❌ Erro:', err));

// Listar Clientes
fetch(`${baseUrl}/clientes`, {
  headers: { 'Authorization': `Bearer ${publicAnonKey}` }
})
  .then(r => r.json())
  .then(data => console.log('✅ Clientes:', data))
  .catch(err => console.error('❌ Erro:', err));

// Seed Usuários
fetch(`${baseUrl}/seed-usuarios`, {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${publicAnonKey}`,
    'Content-Type': 'application/json'
  }
})
  .then(r => r.json())
  .then(data => console.log('✅ Seed:', data))
  .catch(err => console.error('❌ Erro:', err));
```

---

## 🗄️ SQL para Criar Tabelas

### Executar no SQL Editor do Supabase:

```sql
-- 1. Criar tabela de colaboradores (simplificada)
CREATE TABLE IF NOT EXISTS colaboradores (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  role_nivel TEXT NOT NULL,
  setor TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  tipo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'LEAD',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar tabela de tipos de OS
CREATE TABLE IF NOT EXISTS tipos_os (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Inserir tipos de OS padrão (OS 01-13)
INSERT INTO tipos_os (codigo, nome, descricao) VALUES
  ('OS-01', 'Assessoria Técnica', 'Assessoria técnica especializada'),
  ('OS-02', 'Perícia', 'Perícia técnica'),
  ('OS-03', 'Consultoria', 'Consultoria técnica'),
  ('OS-04', 'Projeto', 'Elaboração de projetos'),
  ('OS-05', 'Viabilidade de Reforma', 'Análise de viabilidade'),
  ('OS-06', 'Orçamento de Reforma', 'Orçamento detalhado'),
  ('OS-07', 'Laudo', 'Laudo técnico'),
  ('OS-08', 'Vistoria', 'Vistoria técnica'),
  ('OS-09', 'Aquisição de Materiais', 'Compra de materiais'),
  ('OS-10', 'Serviços Contratados', 'Contratação de serviços'),
  ('OS-11', 'Regularização', 'Regularização de obras'),
  ('OS-12', 'Demolição', 'Demolição controlada'),
  ('OS-13', 'Obra', 'Execução de obra')
ON CONFLICT (codigo) DO NOTHING;

-- 5. Criar tabela de ordens de serviço
CREATE TABLE IF NOT EXISTS ordens_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_os TEXT UNIQUE NOT NULL,
  tipo_os_id UUID REFERENCES tipos_os(id),
  cliente_id UUID REFERENCES clientes(id),
  responsavel_id UUID REFERENCES colaboradores(id),
  criado_por_id UUID REFERENCES colaboradores(id),
  status_geral TEXT NOT NULL DEFAULT 'EM_TRIAGEM',
  data_entrada TIMESTAMPTZ DEFAULT NOW(),
  prazo_entrega TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Criar tabela de etapas de OS
CREATE TABLE IF NOT EXISTS os_etapas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID REFERENCES ordens_servico(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  numero_etapa INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDENTE',
  responsavel_id UUID REFERENCES colaboradores(id),
  aprovador_id UUID REFERENCES colaboradores(id),
  data_inicio TIMESTAMPTZ,
  data_conclusao TIMESTAMPTZ,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Habilitar Row Level Security (RLS)
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_os ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_etapas ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas básicas (permitir tudo por enquanto)
CREATE POLICY "Enable all for authenticated users" ON colaboradores
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON clientes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read for all users" ON tipos_os
  FOR SELECT USING (true);

CREATE POLICY "Enable all for authenticated users" ON ordens_servico
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON os_etapas
  FOR ALL USING (auth.role() = 'authenticated');
```

---

## 🔄 Alternar Entre Modos

### Ativar Modo Backend
```typescript
// /lib/api-client.ts (linha 5)
const FRONTEND_ONLY_MODE = false;

// /lib/utils/supabase-storage.ts (linha 4)
const FRONTEND_ONLY_MODE = false;

// /components/layout/frontend-mode-banner.tsx (linha 10)
const isFrontendMode = false;
```

### Ativar Modo Frontend Only
```typescript
// /lib/api-client.ts (linha 5)
const FRONTEND_ONLY_MODE = true;

// /lib/utils/supabase-storage.ts (linha 4)
const FRONTEND_ONLY_MODE = true;

// /components/layout/frontend-mode-banner.tsx (linha 10)
const isFrontendMode = true;
```

---

## 🔑 Credenciais

```
Project ID: zxfevlkssljndqqhxkjb
URL: https://zxfevlkssljndqqhxkjb.supabase.co
Public Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Service Role Key:** Encontre em Settings > API no Supabase Dashboard

---

## 👥 Usuários de Teste

Depois de executar `/seed-usuarios`:

| Email | Senha | Role | Setor |
|-------|-------|------|-------|
| diretoria@minerva.com | diretoria123 | DIRETORIA | ADM |
| gestor.adm@minerva.com | gestor123 | GESTOR_ADM | ADM |
| gestor.obras@minerva.com | gestor123 | GESTOR_SETOR | OBRAS |
| gestor.assessoria@minerva.com | gestor123 | GESTOR_SETOR | ASSESSORIA |
| colaborador@minerva.com | colaborador123 | COLABORADOR | OBRAS |

---

## 📚 Documentação Relacionada

- `/RESUMO_SUPABASE.md` - Resumo executivo
- `/SUPABASE_CONECTADO.md` - Guia completo
- `/SOLUCAO_ERRO_403.md` - Resolver erro 403
- `/TEST_API_CONNECTION.md` - Testes detalhados
- `/DATABASE_SCHEMA.md` - Schema completo

---

**Data:** 17/11/2025
