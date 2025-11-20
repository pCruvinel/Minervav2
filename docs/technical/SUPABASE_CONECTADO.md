# ✅ SUPABASE CONECTADO - Guia Completo

## 🎯 Status Atual

**Backend HABILITADO** - O sistema agora está conectado ao Supabase:

- ✅ Credenciais configuradas em `/utils/supabase/info.tsx`
- ✅ API client configurado em modo **backend ativo**
- ✅ Storage habilitado para upload de arquivos
- ✅ Edge Functions prontas para deploy
- ✅ Banner de "modo frontend" desabilitado

---

## 📋 Configurações Aplicadas

### 1. **Credenciais** (`/utils/supabase/info.tsx`)
```typescript
export const projectId = "zxfevlkssljndqqhxkjb"
export const publicAnonKey = "eyJhbGci..."
```

### 2. **API Client** (`/lib/api-client.ts`)
```typescript
const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-5ad7fd2c`;
const FRONTEND_ONLY_MODE = false; // ✅ Backend HABILITADO
```

### 3. **Storage** (`/lib/utils/supabase-storage.ts`)
```typescript
const FRONTEND_ONLY_MODE = false; // ✅ Upload ATIVO
const STORAGE_URL = `https://${projectId}.supabase.co/storage/v1`;
```

### 4. **Edge Functions** (`/supabase/functions/server/index.tsx`)
- ✅ Prefixo consistente: `/make-server-5ad7fd2c/`
- ✅ CORS configurado corretamente
- ✅ Rotas implementadas:
  - Health check
  - Clientes (CRUD)
  - Ordens de Serviço (CRUD)
  - Etapas de OS (CRUD)
  - Tipos de OS
  - Seed de usuários

---

## 🔧 PRÓXIMOS PASSOS NO SUPABASE DASHBOARD

### Passo 1: Criar o Schema do Banco de Dados

O sistema precisa das seguintes tabelas. Você pode executar o SQL no **SQL Editor** do Supabase:

#### Tabelas Necessárias:

1. **`clientes`** - Armazena clientes e leads
2. **`tipos_os`** - Tipos de Ordem de Serviço (OS 01-13)
3. **`ordens_servico`** - Ordens de Serviço
4. **`os_etapas`** - Etapas de cada OS
5. **`colaboradores`** - Usuários do sistema

**📄 Verifique o arquivo `/DATABASE_SCHEMA.md` para o SQL completo de criação das tabelas.**

### Passo 2: Configurar Storage

1. Acesse **Storage** no Supabase Dashboard
2. Crie um bucket chamado `uploads`
3. Configure as permissões:
   - **Público para leitura** (para visualizar arquivos)
   - **Autenticado para escrita** (para upload)

### Passo 3: Deploy das Edge Functions

As Edge Functions já estão implementadas em `/supabase/functions/server/`. 

**IMPORTANTE:** O erro 403 que você está enfrentando pode ser devido a:

#### ✅ Solução 1: Verificar Permissões do Projeto Supabase
1. Vá em **Settings** > **API** no Supabase Dashboard
2. Confirme que o `service_role_key` está correto
3. Verifique se não há limites de uso excedidos

#### ✅ Solução 2: Deploy Manual via CLI
Se o deploy automático do Figma Make não funcionar:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref zxfevlkssljndqqhxkjb

# Deploy das functions
supabase functions deploy server
```

#### ✅ Solução 3: Configurar no Dashboard
1. Acesse **Edge Functions** no Supabase Dashboard
2. Crie uma nova function chamada `server`
3. Copie o código de `/supabase/functions/server/index.tsx`
4. Configure as variáveis de ambiente:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Passo 4: Popular Dados Iniciais

Após o deploy funcionar, você pode criar usuários de teste acessando:

```
POST https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/make-server-5ad7fd2c/seed-usuarios
Authorization: Bearer [publicAnonKey]
```

Isso criará:
- 👔 Diretoria (diretoria@minerva.com / diretoria123)
- 🎯 Gestor ADM (gestor.adm@minerva.com / gestor123)
- 🏗️ Gestor Obras (gestor.obras@minerva.com / gestor123)
- 📋 Gestor Assessoria (gestor.assessoria@minerva.com / gestor123)
- 👷 Colaborador (colaborador@minerva.com / colaborador123)

---

## 🐛 TROUBLESHOOTING - Erro 403

### Possível Causa 1: Limites do Plano Supabase
- Verifique se o projeto está no **plano gratuito** e atingiu limites
- Vá em **Settings** > **Billing** para verificar uso

### Possível Causa 2: Permissões de Deploy
- O erro 403 geralmente indica **falta de permissão para deploy**
- Tente fazer logout e login novamente na integração Supabase do Figma Make

### Possível Causa 3: Tamanho da Edge Function
- A function `index.tsx` tem ~880 linhas
- Pode estar excedendo limite de tamanho
- **Solução:** Dividir em múltiplas functions (routes.ts, utils.ts, etc.)

### Possível Causa 4: CORS ou Rate Limiting
- Aguarde alguns minutos e tente novamente
- O Supabase pode ter limite de deploys por minuto

---

## 🔄 Para Voltar ao Modo Frontend Only

Se preferir voltar ao modo sem backend temporariamente:

### Passo 1: Desabilitar Backend
**`/lib/api-client.ts`** (linha 5):
```typescript
const FRONTEND_ONLY_MODE = true;
```

**`/lib/utils/supabase-storage.ts`** (linha 4):
```typescript
const FRONTEND_ONLY_MODE = true;
```

### Passo 2: Ativar Banner
**`/components/layout/frontend-mode-banner.tsx`** (linha 10):
```typescript
const isFrontendMode = true;
```

---

## 📊 Status das Rotas da API

| Rota | Método | Status | Descrição |
|------|--------|--------|-----------|
| `/health` | GET | ✅ | Health check |
| `/clientes` | GET | ✅ | Listar clientes |
| `/clientes/:id` | GET | ✅ | Buscar cliente |
| `/clientes` | POST | ✅ | Criar cliente |
| `/clientes/:id` | PUT | ✅ | Atualizar cliente |
| `/ordens-servico` | GET | ✅ | Listar OS |
| `/ordens-servico/:id` | GET | ✅ | Buscar OS |
| `/ordens-servico` | POST | ✅ | Criar OS |
| `/ordens-servico/:id` | PUT | ✅ | Atualizar OS |
| `/ordens-servico/:osId/etapas` | GET | ✅ | Listar etapas |
| `/ordens-servico/:osId/etapas` | POST | ✅ | Criar etapa |
| `/etapas/:id` | PUT | ✅ | Atualizar etapa |
| `/tipos-os` | GET | ✅ | Listar tipos de OS |
| `/seed-usuarios` | POST | ✅ | Popular usuários |

**Prefixo:** `/make-server-5ad7fd2c/`

---

## 🎉 RESULTADO ESPERADO

Quando tudo estiver configurado:

1. ✅ Sistema conecta ao Supabase
2. ✅ Dados persistem entre sessões
3. ✅ Upload de arquivos funciona
4. ✅ Autenticação funciona
5. ✅ Múltiplos usuários podem usar simultaneamente

---

## 📝 RECOMENDAÇÕES

### Para Teste Imediato:
- Sistema continua funcionando em **modo frontend** com dados mock
- Não precisa de Supabase para demonstrações

### Para Produção:
1. ✅ Resolver erro 403 (prioridade)
2. ✅ Criar schema do banco
3. ✅ Configurar storage
4. ✅ Deploy das edge functions
5. ✅ Popular dados iniciais

---

**Data:** 17/11/2025  
**Status:** ✅ BACKEND CONECTADO (aguardando deploy das Edge Functions)  
**Erro Atual:** 403 no deploy das Edge Functions (soluções listadas acima)
