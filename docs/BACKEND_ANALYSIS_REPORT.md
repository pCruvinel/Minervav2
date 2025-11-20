# 📊 RELATÓRIO DE ANÁLISE COMPLETA DO BACKEND - MINERVA ERP

**Data:** 18/11/2024
**Analista:** Claude (Análise Automatizada)
**Escopo:** Backend completo e camada de dados
**Branch:** `claude/analyze-erp-backend-01DdK8mLg3LqCEMcDgRCed2h`

---

## 📋 SUMÁRIO EXECUTIVO

Este documento apresenta a análise completa do backend do sistema ERP Minerva, incluindo:
- Schema do banco de dados (Supabase/PostgreSQL)
- APIs e endpoints (rotas, validações, lógica de negócio)
- Autenticação e autorização (RLS, policies)
- Queries e performance
- Vulnerabilidades de segurança
- Funcionalidades incompletas

### Status Geral: ⚠️ **ATENÇÃO NECESSÁRIA**

**Resumo:**
- ✅ **Pontos Fortes:** Schema bem estruturado, uso de ENUMs, relacionamentos claros
- ⚠️ **Pontos de Atenção:** Validações ausentes, autenticação fraca, RLS permissivo
- ❌ **Crítico:** Secrets expostas, CORS aberto, N+1 problems, sem rate limiting

---

## 🗂️ 1. SCHEMA DO BANCO DE DADOS

### 1.1 Visão Geral

**Plataforma:** PostgreSQL no Supabase
**Total de Tabelas:** 16 tabelas principais + tabelas de relacionamento
**ENUMs:** 11 tipos customizados

### 1.2 Tabelas Principais

| Tabela | Registros Esperados | Status | Observações |
|--------|---------------------|--------|-------------|
| `colaboradores` | ~5-50 | ✅ Implementada | FK para auth.users |
| `clientes` | ~100-1000 | ✅ Implementada | Inclui leads |
| `tipos_os` | 13 fixos | ✅ Seed completo | OS-01 a OS-13 |
| `ordens_servico` | ~500-5000 | ✅ Implementada | Core do sistema |
| `os_etapas` | ~2500-25000 | ✅ Implementada | ~5 etapas/OS |
| `os_anexos` | ~5000-50000 | ✅ Implementada | Múltiplos/etapa |
| `centros_custo` | ~50-200 | ✅ Implementada | Obras + ADM |
| `agendamentos` | ~1000-10000 | ✅ Implementada | Calendário |
| `financeiro_lancamentos` | ~500-5000 | ✅ Implementada | Receitas/Despesas |
| `audit_log` | Crescente | ✅ Implementada | Auditoria completa |
| `kv_store_5ad7fd2c` | Variável | ✅ Implementada | Cache/config |

### 1.3 Diagrama ER

📄 **Arquivo completo:** `BACKEND_ANALYSIS_DIAGRAM_ER.md`

**Relacionamentos Principais:**
```
auth.users (1:1) colaboradores
colaboradores (1:N) clientes, ordens_servico, os_etapas
clientes (1:N) ordens_servico, centros_custo
tipos_os (1:N) ordens_servico
ordens_servico (1:N) os_etapas, os_anexos
os_etapas (1:N) os_anexos
centros_custo (1:N) financeiro_lancamentos, ordens_servico
```

### 1.4 ENUMs (Tipos Customizados)

✅ **Bem implementados** (UPPERCASE + SNAKE_CASE, sem acentos)

**11 ENUMs definidos:**
1. `user_role_nivel` - Hierarquia de usuários (4 níveis)
2. `setor_colaborador` - Setores (ADM, OBRAS, LABORATORIO, etc.)
3. `cliente_status` - Status de cliente/lead (3 opções)
4. `tipo_cliente` - Tipo de cliente (7 opções)
5. `os_status_geral` - Status geral de OS (7 opções)
6. `os_etapa_status` - Status de etapa (6 opções)
7. `agendamento_status` - Status de agendamento (4 opções)
8. `tipo_lancamento` - Tipo financeiro (2 opções)
9. `tipo_centro_custo` - Tipo de CC (5 opções)
10. `avaliacao_performance` - Avaliação (4 opções)
11. `status_presenca` - Presença (5 opções)

**Scripts de correção encontrados:**
- `FIX_ALL_ENUMS_AGORA.sql` - Correção emergencial
- `FIX_URGENT_CLIENTE_STATUS.sql`
- `FIX_URGENT_TIPO_CLIENTE.sql`

⚠️ **Problema:** Múltiplos scripts de correção indicam problemas históricos com ENUMs

### 1.5 Migrations e Seeds

#### Status: ⚠️ **PARCIAL - Sem Sistema de Migrations**

**Encontrado:**
- ❌ Nenhum diretório `/migrations/` ou `/supabase/migrations/`
- ❌ Sem controle de versão de schema
- ⚠️ Scripts SQL soltos na pasta `/src/` (má prática)

**Scripts SQL disponíveis:**
```
/src/FIX_ALL_ENUMS_AGORA.sql
/src/FIX_URGENT_CLIENTE_STATUS.sql
/src/FIX_URGENT_TIPO_CLIENTE.sql
/src/FIX_BANCO_AGORA.sql
/src/FIX_CLIENTE_STATUS_ENUM.sql
```

**Seed de dados:**
- ✅ Endpoint `/seed-usuarios` (criar 5 usuários padrão)
- ✅ 13 tipos de OS (OS-01 a OS-13)
- ⚠️ Sem seed para clientes de exemplo
- ⚠️ Sem seed para centros de custo

**Recomendação:** Implementar sistema de migrations com Supabase CLI

---

## 🔌 2. APIs E ENDPOINTS

### 2.1 Servidor API

**Tecnologia:** Deno Edge Functions + Hono Framework
**Arquivo Principal:** `/src/supabase/functions/server/index.tsx` (880 linhas)
**Base URL:** `https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/make-server-5ad7fd2c`

### 2.2 Endpoints Implementados

#### ✅ Clientes/Leads (4 endpoints)

| Método | Rota | Funcionalidade | Status |
|--------|------|----------------|--------|
| GET | `/clientes` | Listar todos (filtro por status) | ✅ Funcional |
| GET | `/clientes/:id` | Buscar por ID | ✅ Funcional |
| POST | `/clientes` | Criar novo | ⚠️ Sem validação |
| PUT | `/clientes/:id` | Atualizar | ⚠️ Sem validação |

**Problemas Identificados:**
- ❌ **Nenhuma validação de input** (linhas 298-344)
- ❌ Aceita qualquer campo no body
- ❌ Não valida formato de email, CPF/CNPJ, telefone
- ⚠️ Filtro por status desabilitado (workaround para bug de enum - linha 232)

**Código Problemático (linha 301):**
```typescript
app.post("/make-server-5ad7fd2c/clientes", async (c) => {
  const body = await c.req.json(); // ❌ SEM VALIDAÇÃO!

  const { data, error } = await supabase
    .from('clientes')
    .insert([body]) // Inserção direta sem verificação
    .select()
    .single();
```

#### ✅ Ordens de Serviço (5 endpoints)

| Método | Rota | Funcionalidade | Status |
|--------|------|----------------|--------|
| GET | `/ordens-servico` | Listar todas (com filtros) | ⚠️ N+1 Problem |
| GET | `/ordens-servico/:id` | Buscar por ID | ✅ Funcional |
| POST | `/ordens-servico` | Criar nova | ⚠️ Sem validação |
| PUT | `/ordens-servico/:id` | Atualizar | ⚠️ Sem validação |

**Problemas Identificados:**

1. **N+1 Problem Crítico** (linhas 381-399):
```typescript
// 1ª Query: Buscar TODAS as OS
const { data } = await query;

// N queries: Para CADA OS, buscar suas etapas
const ordensComEtapa = await Promise.all(
  (data || []).map(async (os) => {
    const { data: etapas } = await supabase  // ❌ QUERY POR OS!
      .from('os_etapas')
      .select('numero_etapa, titulo, status')
      .eq('os_id', os.id)
      .order('numero_etapa', { ascending: true });

    return { ...os, etapa_atual: etapaAtual };
  })
);
```

**Impacto:** Se houver 100 OS, serão executadas 101 queries (1 + 100)!

**Solução:** Usar JOIN ou buscar todas as etapas de uma vez com `.in()`

2. **Geração de código_os sem lock** (linhas 507-515):
```typescript
const { count } = await supabase
  .from('ordens_servico')
  .select('*', { count: 'exact', head: true })
  .like('codigo_os', `OS-${year}-%`);

const nextNumber = (count || 0) + 1;
const codigo_os = `OS-${year}-${String(nextNumber).padStart(3, '0')}`;
```

⚠️ **Race condition:** Múltiplas requisições simultâneas podem gerar o mesmo código!

**Solução:** Usar sequence do PostgreSQL ou lock

3. **Criação de usuário "Sistema" inline** (linhas 447-505):
```typescript
if (!body.criado_por_id) {
  // Buscar ou criar colaborador "Sistema"
  // ❌ Lógica complexa dentro do endpoint
  // ❌ Múltiplas queries sequenciais
  // ❌ Sem transação
}
```

⚠️ **Problema:** Lógica de negócio complexa misturada com controller

#### ✅ Etapas de OS (3 endpoints)

| Método | Rota | Funcionalidade | Status |
|--------|------|----------------|--------|
| GET | `/ordens-servico/:osId/etapas` | Listar etapas | ✅ Funcional |
| POST | `/ordens-servico/:osId/etapas` | Criar etapa | ⚠️ Sem validação |
| PUT | `/etapas/:id` | Atualizar etapa | ⚠️ Sem validação |

**Positivo:**
- ✅ Normalização de status implementada (linhas 32-66, 615-618, 654-656)

#### ✅ Tipos de OS (1 endpoint)

| Método | Rota | Funcionalidade | Status |
|--------|------|----------------|--------|
| GET | `/tipos-os` | Listar tipos | ✅ Funcional |

#### ⚠️ Utilitários (3 endpoints)

| Método | Rota | Funcionalidade | Status |
|--------|------|----------------|--------|
| GET | `/health` | Health check | ✅ Funcional |
| POST | `/reload-schema` | Recarregar schema | ⚠️ Debug only |
| GET | `/debug/table-structure` | Debug estrutura | ⚠️ Expõe schema |
| POST | `/seed-usuarios` | Seed inicial | ✅ Funcional |

⚠️ **Problema:** Endpoints de debug em produção (linhas 148-213)

### 2.3 Endpoints Ausentes/Incompletos

#### ❌ Funcionalidades Backend Incompletas

**Não implementados:**

1. **Colaboradores**
   - ❌ GET `/colaboradores` - Listar colaboradores
   - ❌ GET `/colaboradores/:id` - Buscar colaborador
   - ❌ POST `/colaboradores` - Criar colaborador
   - ❌ PUT `/colaboradores/:id` - Atualizar colaborador
   - ⚠️ Existe apenas seed inicial

2. **Centros de Custo**
   - ❌ GET `/centros-custo` - Listar CCs
   - ❌ POST `/centros-custo` - Criar CC
   - ❌ PUT `/centros-custo/:id` - Atualizar CC
   - ❌ Alocação de colaboradores a CCs

3. **Agendamentos**
   - ❌ GET `/agendamentos` - Listar agendamentos
   - ❌ POST `/agendamentos` - Criar agendamento
   - ❌ PUT `/agendamentos/:id` - Atualizar agendamento
   - ❌ DELETE `/agendamentos/:id` - Cancelar agendamento

4. **Financeiro**
   - ❌ GET `/lancamentos` - Listar lançamentos
   - ❌ POST `/lancamentos` - Criar lançamento
   - ❌ PUT `/lancamentos/:id/conciliar` - Conciliar lançamento
   - ❌ GET `/lancamentos/relatorio` - Relatórios

5. **Anexos/Upload**
   - ❌ POST `/anexos/upload` - Upload de arquivo
   - ❌ GET `/anexos/:id/download` - Download de arquivo
   - ❌ DELETE `/anexos/:id` - Deletar anexo
   - ⚠️ Existe apenas lógica frontend (`supabase-storage.ts`)

6. **Auditoria**
   - ❌ GET `/audit-log` - Buscar logs
   - ❌ GET `/audit-log/:registroId` - Histórico de um registro

7. **Presença e Performance**
   - ❌ POST `/presenca` - Registrar presença
   - ❌ GET `/presenca/:colaboradorId` - Buscar presenças
   - ❌ POST `/performance` - Criar avaliação
   - ❌ GET `/performance/:colaboradorId` - Buscar avaliações

8. **Dashboards**
   - ❌ GET `/dashboard/metricas` - Métricas gerais
   - ❌ GET `/dashboard/os-por-status` - Agregações
   - ❌ GET `/dashboard/financeiro` - Resumo financeiro

### 2.4 Validações

#### Status: ❌ **CRÍTICO - COMPLETAMENTE AUSENTE**

**Problemas:**

1. **Nenhuma biblioteca de validação**
   - ❌ Zod não instalado
   - ❌ Joi não instalado
   - ❌ Yup não instalado

2. **Validação manual inexistente**
   - ❌ Campos obrigatórios não verificados
   - ❌ Tipos de dados não validados
   - ❌ Formatos não validados (email, CPF, telefone)
   - ❌ Tamanhos máximos não verificados

3. **Única validação: normalização de ENUMs**
   - ✅ Função `normalizeEtapaStatus()` (linhas 32-66)
   - ✅ Função `normalizeOsStatusGeral()` (linhas 69-105)
   - ✅ Função `normalizeClienteStatus()` (linhas 108-140)

**Exemplo de código vulnerável:**
```typescript
app.post("/make-server-5ad7fd2c/clientes", async (c) => {
  const body = await c.req.json();
  // ❌ body pode conter:
  // - Campos faltando
  // - Tipos errados (número ao invés de string)
  // - Scripts maliciosos (<script>alert('xss')</script>)
  // - Campos extras não esperados

  await supabase.from('clientes').insert([body]); // Inserção direta!
});
```

**Recomendação URGENTE:** Implementar validação com Zod

---

## 🔐 3. AUTENTICAÇÃO E AUTORIZAÇÃO

### 3.1 Autenticação

#### Status: ⚠️ **FRACA - Implementação Parcial**

**Sistema Atual:**

1. **Frontend:** Supabase Auth (não analisado - fora do escopo)

2. **Backend:** Service Role Key
   ```typescript
   // index.tsx, linhas 24-29
   const getSupabaseClient = () => {
     return createClient(
       Deno.env.get('SUPABASE_URL')!,
       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // Bypassa RLS
     );
   };
   ```

**Problemas:**

1. **Nenhum middleware de autenticação**
   - ❌ Endpoints não verificam token JWT
   - ❌ Endpoints não verificam usuário autenticado
   - ❌ Qualquer um com o anon key pode fazer requisições

2. **Public Anon Key exposta no código**
   - ⚠️ Arquivo `/src/utils/supabase/info.tsx`:
   ```typescript
   export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```
   - ❌ **CRÍTICO:** Exposto no repositório Git público!
   - ❌ Qualquer pessoa pode fazer requests diretos

3. **Service Role Key bypassa RLS**
   - ⚠️ Servidor usa Service Role Key
   - ⚠️ Todas as policies RLS são ignoradas
   - ⚠️ Servidor tem acesso total ao banco

**Documentação encontrada:**
- `/src/SUPABASE_INTEGRATION.md` (linhas 224-237)
  > "⏳ Próximos Passos:
  > - [ ] Autenticação com Supabase Auth
  > - [ ] Row Level Security (RLS) policies
  > - [ ] Rate limiting
  > - [ ] Validação de schemas (Zod)"

⚠️ **Conclusão:** Autenticação planejada mas **NÃO IMPLEMENTADA**

### 3.2 Autorização

#### Status: ⚠️ **CRÍTICO - Apenas no Frontend**

**Sistema de Permissões:**

1. **Frontend (Client-side):**
   - Arquivo: `/src/lib/auth-utils.ts` (423 linhas)
   - Classe `PermissaoUtil` com métodos:
     ```typescript
     static podeDelegarPara(origem: User, destino: User): boolean
     static podeAprovarTarefa(usuario: User, setor: Setor): boolean
     static obterSetoresAcesso(usuario: User): Setor[]
     static temAcessoModulo(usuario: User, modulo: string): boolean
     static obterNivelHierarquico(role: RoleLevel): number
     static ehSuperior(role1: RoleLevel, role2: RoleLevel): boolean
     static temAcessoAOS(usuario: User, os: OrdemServico): boolean
     static podeEditarOS(usuario: User, os: OrdemServico): boolean
     static podeCriarOS(usuario: User): boolean
     static podeGerenciarUsuarios(usuario: User): boolean
     ```

   ❌ **CRÍTICO:** Toda lógica de permissões está no FRONTEND!
   - Pode ser bypassada com DevTools
   - Nenhuma validação server-side

2. **Backend (Server-side):**
   - ❌ **ZERO validações de permissão**
   - ❌ Endpoints não verificam role do usuário
   - ❌ Endpoints não verificam acesso ao recurso

### 3.3 RLS (Row Level Security)

#### Status: ⚠️ **ATIVO mas MUITO PERMISSIVO**

**Policies Encontradas:**

Arquivo: `/src/COMANDOS_SUPABASE.md` (linhas 172-194)

```sql
-- RLS habilitado nas tabelas principais
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_os ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_etapas ENABLE ROW LEVEL SECURITY;

-- Políticas PERMISSIVAS (permitem TUDO para authenticated)
CREATE POLICY "Enable all for authenticated users" ON colaboradores
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON clientes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON ordens_servico
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON os_etapas
  FOR ALL USING (auth.role() = 'authenticated');
```

**Problemas:**

1. **Policies permitem TUDO**
   - Qualquer usuário autenticado pode:
     - ✅ Ver TODOS os clientes
     - ✅ Ver TODAS as OS
     - ✅ Editar QUALQUER registro
     - ✅ Deletar QUALQUER registro

2. **Nenhuma validação por role_nivel**
   - Não há diferença entre DIRETOR e COLABORADOR
   - Sistema de hierarquia só existe no frontend

3. **Service Role Key ignora RLS**
   - Servidor usa Service Role Key
   - **TODAS as policies são ignoradas**
   - Servidor tem acesso irrestrito

**Documentação (não implementado):**

Arquivo: `/src/DATABASE_SCHEMA.md` (linhas 799-804)

```markdown
### RLS (Row Level Security)
Implementar políticas baseadas em `role_nivel`:
- COLABORADOR: vê apenas suas OS
- COORDENADOR: vê OS do seu setor
- GESTOR: vê todas as OS
- DIRETOR: acesso total
```

⚠️ **Status:** Documentado mas **NÃO IMPLEMENTADO**

**Recomendação URGENTE:** Implementar policies granulares por role

---

## 🚨 4. VULNERABILIDADES DE SEGURANÇA

### 4.1 Resumo de Vulnerabilidades

| ID | Vulnerabilidade | Severidade | Localização | Status |
|----|----------------|------------|-------------|--------|
| SEC-01 | Secrets expostas no Git | 🔴 Crítica | `/src/utils/supabase/info.tsx` | ❌ Ativa |
| SEC-02 | CORS permissivo (origin: "*") | 🟠 Alta | `index.tsx:14` | ❌ Ativa |
| SEC-03 | Sem validação de input | 🔴 Crítica | Todos endpoints POST/PUT | ❌ Ativa |
| SEC-04 | Sem sanitização XSS | 🔴 Crítica | Campos de texto | ❌ Ativa |
| SEC-05 | Sem rate limiting | 🟠 Alta | Todos endpoints | ❌ Ativa |
| SEC-06 | RLS muito permissivo | 🟠 Alta | Policies do banco | ❌ Ativa |
| SEC-07 | Sem autenticação server-side | 🔴 Crítica | Todos endpoints | ❌ Ativa |
| SEC-08 | Endpoints de debug em prod | 🟡 Média | `index.tsx:175-212` | ❌ Ativa |
| SEC-09 | Race condition em codigo_os | 🟡 Média | `index.tsx:507-515` | ❌ Ativa |
| SEC-10 | Service Role Key bypassa RLS | 🟠 Alta | `index.tsx:27` | ⚠️ Design |

### 4.2 Detalhamento das Vulnerabilidades

#### SEC-01: Secrets Expostas 🔴

**Arquivo:** `/src/utils/supabase/info.tsx`

```typescript
export const projectId = "zxfevlkssljndqqhxkjb"
export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZmV2bGtzc2xqbmRxcWh4a2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDkxNTcsImV4cCI6MjA3ODIyNTE1N30.cODYFIRpNluf8tUZqyL8y0GC46GCEGxELHVxrKcAH7c"
```

**Riscos:**
- ✅ Público pode identificar o projeto Supabase
- ✅ Público pode fazer requisições diretas ao banco
- ✅ Mesmo com RLS, há possibilidade de enumeração de dados

**Impacto:** Alto - Permite ataques diretos ao banco

**Solução:**
```typescript
// Usar variáveis de ambiente
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Adicionar ao .gitignore
src/utils/supabase/info.tsx
.env
.env.local
```

#### SEC-02: CORS Permissivo 🟠

**Arquivo:** `/src/supabase/functions/server/index.tsx:12-21`

```typescript
app.use("/*", cors({
  origin: "*", // ❌ PERMITE QUALQUER ORIGEM!
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
```

**Riscos:**
- ✅ Qualquer site pode chamar a API
- ✅ Permite ataques CSRF
- ✅ Permite scraping de dados

**Solução:**
```typescript
cors({
  origin: (origin) => {
    const allowed = [
      'https://minervav2.com',
      'https://app.minervav2.com',
    ];
    if (Deno.env.get('ENV') === 'development') {
      allowed.push('http://localhost:5173');
    }
    return allowed.includes(origin || '');
  },
  credentials: true,
})
```

#### SEC-03: Sem Validação de Input 🔴

**Exemplo:** `/src/supabase/functions/server/index.tsx:298-318`

```typescript
app.post("/make-server-5ad7fd2c/clientes", async (c) => {
  const body = await c.req.json(); // ❌ SEM VALIDAÇÃO!

  const { data, error } = await supabase
    .from('clientes')
    .insert([body]) // Inserção direta!
    .select()
    .single();
```

**Ataques possíveis:**
```json
{
  "nome_razao_social": "<script>alert('XSS')</script>",
  "email": "not-an-email",
  "cpf_cnpj": "abc123",
  "malicious_field": "injection",
  "__proto__": { "isAdmin": true }
}
```

**Solução:** Implementar Zod (ver seção 6)

#### SEC-04: Sem Sanitização XSS 🔴

**Campos vulneráveis:**
- `clientes.nome_razao_social`
- `clientes.observacoes`
- `ordens_servico.descricao`
- `os_etapas.dados_etapa` (JSONB)
- `os_etapas.comentarios_aprovacao`
- Todos campos de texto livre

**Solução:**
```typescript
import DOMPurify from "isomorphic-dompurify";

const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }
  // ... recursivo para objetos/arrays
};
```

#### SEC-05: Sem Rate Limiting 🟠

**Status:** ❌ Completamente ausente

**Busca realizada:**
```bash
grep -r "rate.?limit\|ratelimit" --include="*.ts" --include="*.tsx"
# Resultado: Nenhum arquivo encontrado
```

**Riscos:**
- ✅ DoS (Denial of Service)
- ✅ Brute force em login
- ✅ Criação em massa de registros
- ✅ Scraping ilimitado

**Endpoints críticos sem proteção:**
- POST `/clientes` (criação em massa)
- POST `/ordens-servico` (criação em massa)
- POST `/seed-usuarios` (criação de usuários)

**Solução:**
```typescript
import { rateLimiter } from "hono-rate-limiter";

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições
  keyGenerator: (c) => c.req.header('x-forwarded-for') || 'unknown',
});

app.use('/clientes/*', limiter);
app.use('/ordens-servico/*', limiter);
```

---

## ⚡ 5. QUERIES E PERFORMANCE

### 5.1 Problemas de Performance Identificados

#### PERF-01: N+1 Problem Crítico 🔴

**Localização:** `/src/supabase/functions/server/index.tsx:380-399`

```typescript
// GET /ordens-servico
const { data } = await query; // 1ª query: buscar todas OS

const ordensComEtapa = await Promise.all(
  (data || []).map(async (os) => {
    const { data: etapas } = await supabase  // ❌ N queries!
      .from('os_etapas')
      .select('numero_etapa, titulo, status')
      .eq('os_id', os.id)
      .order('numero_etapa', { ascending: true });

    return { ...os, etapa_atual: etapaAtual };
  })
);
```

**Impacto:**
- 10 OS = 11 queries (1 + 10)
- 100 OS = 101 queries (1 + 100)
- 1000 OS = 1001 queries (1 + 1000)

**Tempo estimado:**
- 100 OS × 50ms/query = **5 segundos!**
- 500 OS × 50ms/query = **25 segundos!!**

**Solução 1:** Usar JOIN
```typescript
const { data } = await supabase
  .from('ordens_servico')
  .select(`
    *,
    cliente:clientes(*),
    tipo_os:tipos_os(*),
    responsavel:colaboradores(*),
    etapas:os_etapas(*)
  `)
  .order('data_entrada', { ascending: false });

// Processar etapas no código
const ordensComEtapa = data.map(os => ({
  ...os,
  etapa_atual: os.etapas?.find(e =>
    e.status === 'EM_ANDAMENTO' || e.status === 'PENDENTE'
  ) || os.etapas?.[0]
}));
```

**Solução 2:** Buscar todas as etapas de uma vez
```typescript
const osIds = data.map(os => os.id);

const { data: todasEtapas } = await supabase
  .from('os_etapas')
  .select('*')
  .in('os_id', osIds);

// Agrupar por OS
const etapasPorOS = todasEtapas.reduce((acc, etapa) => {
  if (!acc[etapa.os_id]) acc[etapa.os_id] = [];
  acc[etapa.os_id].push(etapa);
  return acc;
}, {});
```

#### PERF-02: Índices Ausentes 🟠

**Status:** ❌ Nenhum índice customizado criado

**Documentação encontrada:** `/src/DATABASE_SCHEMA.md` (linhas 759-780)

```sql
-- Índices Recomendados (NÃO IMPLEMENTADOS)
CREATE INDEX idx_os_status ON ordens_servico(status_geral);
CREATE INDEX idx_os_cliente ON ordens_servico(cliente_id);
CREATE INDEX idx_os_responsavel ON ordens_servico(responsavel_id);
-- ... etc
```

⚠️ **Problema:** Recomendados mas **NÃO CRIADOS** no banco

**Impacto em queries comuns:**

1. **Buscar OS por cliente:**
   ```sql
   SELECT * FROM ordens_servico WHERE cliente_id = '...';
   ```
   ❌ Sem índice = **Full table scan**

2. **Buscar OS por status:**
   ```sql
   SELECT * FROM ordens_servico WHERE status_geral = 'EM_ANDAMENTO';
   ```
   ❌ Sem índice = **Full table scan**

3. **Buscar etapas de uma OS:**
   ```sql
   SELECT * FROM os_etapas WHERE os_id = '...';
   ```
   ❌ Sem índice em `os_id` = **Full table scan**

**Solução:** Executar script de criação de índices

```sql
-- Performance em queries de OS
CREATE INDEX idx_os_status ON ordens_servico(status_geral);
CREATE INDEX idx_os_cliente ON ordens_servico(cliente_id);
CREATE INDEX idx_os_responsavel ON ordens_servico(responsavel_id);
CREATE INDEX idx_os_created ON ordens_servico(data_entrada);
CREATE INDEX idx_os_tipo ON ordens_servico(tipo_os_id);

-- Performance em etapas
CREATE INDEX idx_etapas_os ON os_etapas(os_id);
CREATE INDEX idx_etapas_status ON os_etapas(status);
CREATE INDEX idx_etapas_responsavel ON os_etapas(responsavel_id);
CREATE INDEX idx_etapas_ordem ON os_etapas(os_id, ordem); -- Composto!

-- Performance em anexos
CREATE INDEX idx_anexos_os ON os_anexos(os_id);
CREATE INDEX idx_anexos_etapa ON os_anexos(etapa_id);

-- Performance em clientes
CREATE INDEX idx_clientes_status ON clientes(status);
CREATE INDEX idx_clientes_responsavel ON clientes(responsavel_id);
CREATE INDEX idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);

-- Performance em financeiro
CREATE INDEX idx_lancamentos_vencimento ON financeiro_lancamentos(data_vencimento);
CREATE INDEX idx_lancamentos_cc ON financeiro_lancamentos(cc_id);
CREATE INDEX idx_lancamentos_tipo ON financeiro_lancamentos(tipo);
CREATE INDEX idx_lancamentos_conciliado ON financeiro_lancamentos(conciliado);

-- Performance em auditoria
CREATE INDEX idx_audit_usuario ON audit_log(usuario_id);
CREATE INDEX idx_audit_tabela ON audit_log(tabela_afetada);
CREATE INDEX idx_audit_data ON audit_log(created_at);
```

**Ganho estimado:**
- Queries com `WHERE` em campos indexados: **10x-100x mais rápidas**
- Queries com `JOIN` em FKs indexadas: **5x-50x mais rápidas**

#### PERF-03: Select * em vez de campos específicos 🟡

**Exemplo:** `/src/supabase/functions/server/index.tsx:228-229`

```typescript
const query = supabase
  .from('clientes')
  .select('*') // ❌ Busca TODOS os campos
  .order('created_at', { ascending: false });
```

**Problema:**
- Trafega dados desnecessários (ex: campo `observacoes` pode ter textos longos)
- Aumenta uso de banda
- Aumenta tempo de resposta

**Solução:**
```typescript
.select('id, nome_razao_social, status, email, telefone, tipo_cliente')
```

#### PERF-04: Race Condition em Geração de Código 🟡

**Localização:** `/src/supabase/functions/server/index.tsx:507-515`

```typescript
const { count } = await supabase
  .from('ordens_servico')
  .select('*', { count: 'exact', head: true })
  .like('codigo_os', `OS-${year}-%`);

const nextNumber = (count || 0) + 1;
const codigo_os = `OS-${year}-${String(nextNumber).padStart(3, '0')}`;
```

**Problema:** Se 2 requisições executarem simultaneamente:
- Requisição A: count = 5, gera OS-2024-006
- Requisição B: count = 5, gera OS-2024-006 ❌ DUPLICADO!
- Constraint UNIQUE vai falhar em uma delas

**Solução:** Usar sequence do PostgreSQL
```sql
CREATE SEQUENCE os_sequence START 1;

-- No código:
SELECT nextval('os_sequence');
```

Ou usar lock:
```typescript
BEGIN;
SELECT ... FOR UPDATE;
INSERT ...;
COMMIT;
```

### 5.2 Queries Bem Implementadas ✅

**Positivo:**

1. **JOINs com embed do Supabase:**
   ```typescript
   .select(`
     *,
     cliente:clientes(*),
     tipo_os:tipos_os(*),
     responsavel:colaboradores(*)
   `)
   ```
   ✅ Eficiente, busca tudo em 1 query

2. **Filtros aplicados no banco:**
   ```typescript
   .eq('status_geral', status)
   .order('data_entrada', { ascending: false })
   ```
   ✅ Filtro server-side, não no código

3. **`.single()` para busca por ID:**
   ```typescript
   .eq('id', id)
   .single();
   ```
   ✅ Retorna apenas 1 registro

---

## 🔌 6. INTEGRAÇÕES EXTERNAS

### Status: ✅ **NENHUMA INTEGRAÇÃO EXTERNA ENCONTRADA**

**Busca realizada:**
```bash
grep -r "fetch\|axios\|http\.get" --include="*.tsx" src/supabase/functions/server/
```

**Resultado:** Apenas 1 uso de `fetch` interno (reload schema, linha 154)

**Conclusão:**
- ✅ Sistema não depende de APIs de terceiros
- ✅ Não há pontos de falha externos
- ✅ Não há riscos de vazamento de dados para terceiros

**Possíveis integrações futuras (não implementadas):**
- Pagamento (Stripe, PagSeguro)
- Email (SendGrid, Amazon SES)
- SMS (Twilio)
- Storage externo (AWS S3, Cloudinary)
- Monitoramento (Sentry, New Relic)

---

## 📦 7. ARMAZENAMENTO (Supabase Storage)

### Status: ⚠️ **PARCIAL - Apenas Frontend**

**Arquivo:** `/src/lib/utils/supabase-storage.ts` (230 linhas)

**Funcionalidades Implementadas (frontend only):**
- ✅ `uploadFile(osId, etapa, file, colaboradorId)`
- ✅ `deleteFile(path)`
- ✅ `getFileUrl(path)`
- ✅ Validação de tipo de arquivo (PDF, JPG, PNG, DOCX, XLSX)
- ✅ Validação de tamanho (máx 10MB)
- ✅ Estrutura de pastas: `uploads/{osNumero}/{etapa}/{arquivo}`

**Problema:**
- ❌ Nenhum endpoint backend para upload
- ❌ Upload feito direto do frontend para Supabase Storage
- ❌ Sem validação server-side de arquivos
- ❌ Sem registro de anexos em `os_anexos` via backend

**Recomendação:** Criar endpoint `POST /anexos/upload` no servidor

---

## 🎯 8. RECOMENDAÇÕES PRIORITÁRIAS

### Prioridade 1 - CRÍTICO (Implementar Imediatamente)

#### 1.1 Implementar Validação com Zod

```typescript
// Adicionar ao deno.json
"imports": {
  "zod": "https://deno.land/x/zod@v3.22.4/mod.ts"
}

// Criar schemas
import { z } from "zod";

const CreateClienteSchema = z.object({
  nome_razao_social: z.string().min(3).max(255),
  cpf_cnpj: z.string().regex(/^\d{11}$|^\d{14}$/),
  email: z.string().email(),
  telefone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/),
  status: z.enum(['LEAD', 'CLIENTE_ATIVO', 'CLIENTE_INATIVO']),
  tipo_cliente: z.enum(['PESSOA_FISICA', 'CONDOMINIO', 'CONSTRUTORA', ...]).optional(),
  endereco: z.object({
    rua: z.string(),
    numero: z.string(),
    cidade: z.string(),
    estado: z.string().length(2),
    cep: z.string().regex(/^\d{5}-\d{3}$/),
  }).optional(),
});

// Usar nos endpoints
app.post("/clientes", async (c) => {
  const body = await c.req.json();

  const validated = CreateClienteSchema.safeParse(body);
  if (!validated.success) {
    return c.json({
      error: 'Validação falhou',
      details: validated.error.errors
    }, 400);
  }

  // usar validated.data
  const { data, error } = await supabase
    .from('clientes')
    .insert([validated.data]);
});
```

#### 1.2 Adicionar Middleware de Autenticação

```typescript
const authMiddleware = async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return c.json({ error: 'Unauthorized - Token não fornecido' }, 401);
  }

  // Validar token JWT com Supabase
  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return c.json({ error: 'Unauthorized - Token inválido' }, 401);
  }

  // Buscar colaborador
  const { data: colaborador } = await supabase
    .from('colaboradores')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!colaborador || !colaborador.ativo) {
    return c.json({ error: 'Forbidden - Colaborador inativo' }, 403);
  }

  c.set('user', colaborador);
  await next();
};

// Aplicar em rotas protegidas
app.use('/clientes/*', authMiddleware);
app.use('/ordens-servico/*', authMiddleware);
app.use('/etapas/*', authMiddleware);
```

#### 1.3 Mover Secrets para Variáveis de Ambiente

```bash
# Criar .env.example
cat > .env.example << EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=your-project-id
EOF

# Adicionar ao .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "src/utils/supabase/info.tsx" >> .gitignore
```

```typescript
// src/utils/supabase/info.tsx
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!projectId || !publicAnonKey) {
  throw new Error('Variáveis de ambiente Supabase não configuradas!');
}
```

#### 1.4 Implementar RLS Policies Granulares

```sql
-- Remover policies permissivas
DROP POLICY "Enable all for authenticated users" ON ordens_servico;

-- Colaboradores: Ver apenas suas OS ou OS do seu setor
CREATE POLICY "colaboradores_ver_os_proprias_ou_setor" ON ordens_servico
  FOR SELECT
  USING (
    responsavel_id = auth.uid()
    OR criado_por_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM colaboradores c1
      JOIN tipos_os t ON t.id = tipo_os_id
      WHERE c1.id = auth.uid()
      AND c1.setor = t.setor_padrao
      AND c1.role_nivel IN ('COORDENADOR', 'GESTOR')
    )
  );

-- Gestores: Ver todas as OS
CREATE POLICY "gestores_ver_todas_os" ON ordens_servico
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM colaboradores
      WHERE id = auth.uid()
      AND role_nivel = 'GESTOR'
    )
  );

-- Diretoria: Acesso total
CREATE POLICY "diretoria_acesso_total" ON ordens_servico
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM colaboradores
      WHERE id = auth.uid()
      AND role_nivel = 'DIRETOR'
    )
  );

-- Colaboradores: Criar OS
CREATE POLICY "colaboradores_criar_os" ON ordens_servico
  FOR INSERT
  WITH CHECK (
    criado_por_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM colaboradores
      WHERE id = auth.uid()
      AND ativo = true
    )
  );

-- Colaboradores: Editar apenas suas OS
CREATE POLICY "colaboradores_editar_proprias_os" ON ordens_servico
  FOR UPDATE
  USING (
    responsavel_id = auth.uid()
    OR criado_por_id = auth.uid()
  );
```

### Prioridade 2 - ALTA (Implementar em 1-2 semanas)

#### 2.1 Corrigir N+1 Problem

```typescript
// Solução: Usar JOIN nativo do Supabase
app.get("/make-server-5ad7fd2c/ordens-servico", async (c) => {
  const { data, error } = await supabase
    .from('ordens_servico')
    .select(`
      *,
      cliente:clientes(*),
      tipo_os:tipos_os(*),
      responsavel:colaboradores!ordens_servico_responsavel_id_fkey(*),
      etapas:os_etapas(numero_etapa, titulo, status, ordem)
    `)
    .order('data_entrada', { ascending: false });

  // Processar etapas no código (rápido, já estão na memória)
  const ordensComEtapa = data.map(os => {
    const etapas = os.etapas || [];
    const etapaAtual = etapas
      .sort((a, b) => a.ordem - b.ordem)
      .find(e => e.status === 'EM_ANDAMENTO' || e.status === 'PENDENTE')
      || etapas[0];

    return { ...os, etapa_atual: etapaAtual };
  });

  return c.json(ordensComEtapa);
});
```

#### 2.2 Criar Índices no Banco

```sql
-- Executar script completo de índices (ver seção 5.1.2)
-- Tempo estimado: 1-5 minutos para executar
-- Ganho: 10x-100x em performance de queries
```

#### 2.3 Implementar Rate Limiting

```typescript
import { rateLimiter } from "hono-rate-limiter";

// Limiter geral (100 req/15min)
const generalLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (c) => c.req.header('x-forwarded-for') || 'unknown',
});

// Limiter estrito para criação (10 req/15min)
const createLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (c) => c.req.header('x-forwarded-for') || 'unknown',
});

// Aplicar
app.use('/clientes/*', generalLimiter);
app.use('/ordens-servico/*', generalLimiter);
app.post('/clientes', createLimiter);
app.post('/ordens-servico', createLimiter);
```

#### 2.4 Configurar CORS Restritivo

```typescript
const allowedOrigins = [
  'https://minervav2.com',
  'https://app.minervav2.com',
];

if (Deno.env.get('ENV') === 'development') {
  allowedOrigins.push('http://localhost:5173');
  allowedOrigins.push('http://localhost:5174');
}

app.use("/*", cors({
  origin: (origin) => allowedOrigins.includes(origin || ''),
  credentials: true,
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE"],
  maxAge: 600,
}));
```

### Prioridade 3 - MÉDIA (Implementar em 2-4 semanas)

#### 3.1 Implementar Endpoints Faltantes

**Colaboradores:**
- GET `/colaboradores`
- GET `/colaboradores/:id`
- POST `/colaboradores`
- PUT `/colaboradores/:id`

**Centros de Custo:**
- GET `/centros-custo`
- POST `/centros-custo`
- PUT `/centros-custo/:id`

**Agendamentos:**
- GET `/agendamentos`
- POST `/agendamentos`
- PUT `/agendamentos/:id`
- DELETE `/agendamentos/:id`

**Financeiro:**
- GET `/lancamentos`
- POST `/lancamentos`
- PUT `/lancamentos/:id/conciliar`
- GET `/lancamentos/relatorio`

**Upload:**
- POST `/anexos/upload`
- GET `/anexos/:id/download`
- DELETE `/anexos/:id`

#### 3.2 Implementar Sistema de Migrations

```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar migrations
supabase init
supabase migration new initial_schema

# Gerar migrations a partir do schema atual
supabase db diff --schema public > supabase/migrations/20241118_initial.sql

# Aplicar migrations
supabase db push
```

#### 3.3 Adicionar Logging Estruturado

```typescript
import { Logger } from "hono/logger";

// Logger estruturado
const log = {
  info: (msg: string, meta?: any) =>
    console.log(JSON.stringify({ level: 'info', msg, ...meta })),
  error: (msg: string, error?: Error) =>
    console.error(JSON.stringify({ level: 'error', msg, error: error?.message })),
  warn: (msg: string, meta?: any) =>
    console.warn(JSON.stringify({ level: 'warn', msg, ...meta })),
};

// Usar nos endpoints
app.get("/ordens-servico", async (c) => {
  log.info('GET /ordens-servico', { filters: c.req.query() });
  // ...
});
```

#### 3.4 Implementar Sanitização XSS

```typescript
import DOMPurify from "isomorphic-dompurify";

const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === 'object' && input !== null) {
    return Object.fromEntries(
      Object.entries(input).map(([k, v]) => [k, sanitizeInput(v)])
    );
  }

  return input;
};

// Middleware de sanitização
const sanitizeMiddleware = async (c, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(c.req.method)) {
    const body = await c.req.json();
    c.set('body', sanitizeInput(body));
  }
  await next();
};

app.use('/*', sanitizeMiddleware);
```

---

## 📊 9. RESUMO DE ACHADOS

### 9.1 Estatísticas

| Métrica | Valor |
|---------|-------|
| **Tabelas no banco** | 16 principais + 2 relacionamento |
| **ENUMs definidos** | 11 tipos |
| **Endpoints implementados** | 13 |
| **Endpoints faltantes** | ~25-30 |
| **Vulnerabilidades críticas** | 4 |
| **Vulnerabilidades altas** | 4 |
| **Vulnerabilidades médias** | 2 |
| **Problemas de performance** | 4 |
| **Índices criados** | 0 |
| **Índices recomendados** | 20+ |
| **Integrações externas** | 0 |

### 9.2 Matriz de Priorização

```
URGÊNCIA vs IMPACTO

Alta Urgência, Alto Impacto:
✅ Implementar validação com Zod
✅ Adicionar middleware de autenticação
✅ Mover secrets para .env
✅ Implementar RLS granular
✅ Configurar CORS restritivo

Alta Urgência, Médio Impacto:
✅ Corrigir N+1 problem
✅ Implementar rate limiting
✅ Criar índices no banco

Média Urgência, Alto Impacto:
⏳ Implementar endpoints faltantes
⏳ Sistema de migrations
⏳ Sanitização XSS

Média Urgência, Médio Impacto:
⏳ Logging estruturado
⏳ Remover endpoints de debug
⏳ Implementar soft delete
```

### 9.3 Estimativa de Esforço

| Tarefa | Esforço | Prioridade |
|--------|---------|------------|
| Validação Zod | 2-3 dias | 🔴 Crítica |
| Middleware Auth | 1-2 dias | 🔴 Crítica |
| Secrets → .env | 2-4 horas | 🔴 Crítica |
| RLS Policies | 3-5 dias | 🔴 Crítica |
| Corrigir N+1 | 4-6 horas | 🟠 Alta |
| Criar índices | 1-2 horas | 🟠 Alta |
| Rate limiting | 2-4 horas | 🟠 Alta |
| CORS restritivo | 1-2 horas | 🟠 Alta |
| Endpoints faltantes | 2-3 semanas | 🟡 Média |
| Sistema migrations | 1-2 dias | 🟡 Média |
| Sanitização XSS | 1-2 dias | 🟡 Média |

**Total estimado (Prioridades 1 e 2):** 2-3 semanas de desenvolvimento

---

## 📁 10. ARQUIVOS GERADOS

Como parte desta análise, foram gerados os seguintes documentos:

1. **BACKEND_ANALYSIS_DIAGRAM_ER.md**
   - Diagrama ER completo em Mermaid
   - Listagem de todas as tabelas e ENUMs
   - Relacionamentos detalhados
   - Índices recomendados

2. **BACKEND_ANALYSIS_REPORT.md** (este arquivo)
   - Análise completa do backend
   - Vulnerabilidades identificadas
   - Problemas de performance
   - Recomendações priorizadas

---

## ✅ 11. CHECKLIST DE AÇÕES

### Imediato (Esta Semana)

- [ ] Mover `publicAnonKey` e `projectId` para variáveis de ambiente
- [ ] Adicionar `.env.example` ao repositório
- [ ] Adicionar `src/utils/supabase/info.tsx` ao `.gitignore`
- [ ] Executar script de criação de índices no banco
- [ ] Configurar CORS para permitir apenas domínios específicos

### Curto Prazo (1-2 Semanas)

- [ ] Instalar e configurar Zod
- [ ] Implementar validação em todos os endpoints POST/PUT
- [ ] Criar middleware de autenticação
- [ ] Aplicar middleware em rotas protegidas
- [ ] Implementar RLS policies granulares por role
- [ ] Corrigir N+1 problem em `/ordens-servico`
- [ ] Implementar rate limiting
- [ ] Remover ou proteger endpoints de debug

### Médio Prazo (2-4 Semanas)

- [ ] Implementar endpoints de Colaboradores
- [ ] Implementar endpoints de Centros de Custo
- [ ] Implementar endpoints de Agendamentos
- [ ] Implementar endpoints de Financeiro
- [ ] Implementar endpoint de Upload (`POST /anexos/upload`)
- [ ] Configurar sistema de migrations com Supabase CLI
- [ ] Implementar sanitização XSS
- [ ] Adicionar logging estruturado

### Longo Prazo (1-2 Meses)

- [ ] Implementar dashboards e agregações
- [ ] Implementar auditoria completa
- [ ] Configurar monitoramento (Sentry, etc.)
- [ ] Implementar testes automatizados
- [ ] Documentar API com OpenAPI/Swagger
- [ ] Implementar cache (Redis, etc.)
- [ ] Otimizar queries com views materializadas

---

## 📞 12. CONTATO E SUPORTE

**Repositório:** pCruvinel/Minervav2
**Branch de Análise:** `claude/analyze-erp-backend-01DdK8mLg3LqCEMcDgRCed2h`

**Documentação Relacionada:**
- `DATABASE_SCHEMA.md` - Schema detalhado do banco
- `SUPABASE_INTEGRATION.md` - Guia de integração
- `COMANDOS_SUPABASE.md` - Comandos rápidos
- `BACKEND_ANALYSIS_DIAGRAM_ER.md` - Diagrama ER completo

---

**Relatório gerado em:** 18/11/2024
**Analista:** Claude (Análise Automatizada de Backend)
**Versão:** 1.0
