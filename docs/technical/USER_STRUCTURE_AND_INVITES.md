# 📋 Documentação Técnica: Estrutura de Usuários e Fluxo de Convites

**Última Atualização:** 2026-01-05  
**Versão:** v1.1 (Bug Fix: Callback Token Processing)  
**Status Implementação:** 100% ✅  
**Sistema:** Minerva ERP - Autenticação e RBAC

---

## 📌 Visão Geral

O sistema de autenticação e gerenciamento de usuários do Minerva ERP é construído sobre o **Supabase Auth**, com uma camada de RBAC (Role-Based Access Control) customizada para atender às necessidades de escritórios de engenharia.

### Tipos de Usuário

| Tipo | Tabela de Perfil | Descrição | Acesso ao Sistema |
|------|------------------|-----------|-------------------|
| **Colaborador** | `public.colaboradores` | Funcionário interno (staff) | Dashboard Principal (`/`) |
| **Cliente** | `public.clientes` | Cliente externo | Portal do Cliente (`/portal`) |

> **Chave de Design:** O `auth.users.id` do Supabase é a chave primária em `colaboradores`, mas é referenciado via `auth_user_id` em `clientes`.

---

## 🏗 Arquitetura do Sistema

### 🗂 Estrutura de Arquivos

```
src/
├── routes/auth/
│   ├── callback.tsx                    # Handler de retorno do Supabase Auth (167 linhas)
│   ├── setup-password.tsx              # Tela de definição de senha (283 linhas)
│   └── login.tsx                       # Tela de login
│
├── components/colaboradores/
│   └── modal-convite-colaborador.tsx   # Modal de envio de convites (263 linhas)
│
├── lib/
│   ├── services/
│   │   └── client-invite-service.ts    # Serviço de convite de clientes (267 linhas)
│   └── supabase-client.ts              # Cliente Supabase configurado
│
supabase/
├── functions/
│   ├── invite-user/                    # Edge Function para colaboradores
│   │   └── index.ts                    # (179 linhas)
│   └── invite-client/                  # Edge Function para clientes
│       └── index.ts                    # (174 linhas)
│
└── migrations/
    ├── 20250105_refactor_roles_sectors.sql   # Estrutura de cargos e setores
    └── 20250105_fix_existing_users_roles.sql # Correção de roles existentes
```

---

## 🗄 Modelo de Dados

### Diagrama de Relacionamentos

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         MODELO DE DADOS - AUTH                            │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ┌──────────────────┐                                                    │
│   │   auth.users     │   (Gerenciado pelo Supabase)                       │
│   │   ─────────────  │                                                    │
│   │   id (PK)        │──────────────────────────────────────────┐         │
│   │   email          │                                          │         │
│   │   raw_user_meta  │  ←── { full_name, cargo_slug, setor_id,  │         │
│   │   created_at     │       is_client, cliente_id }            │         │
│   └────────┬─────────┘                                          │         │
│            │                                                    │         │
│            │ (1:1) FK: id                                       │ (1:1)   │
│            ▼                                                    ▼         │
│   ┌──────────────────┐                              ┌──────────────────┐  │
│   │  colaboradores   │                              │     clientes     │  │
│   │  ─────────────── │                              │  ─────────────── │  │
│   │  id (PK=auth.id) │                              │  id (PK)         │  │
│   │  nome_completo   │                              │  auth_user_id FK │  │
│   │  cargo_id FK     │──┐                           │  nome            │  │
│   │  setor_id FK     │  │                           │  email           │  │
│   │  email           │  │                           │  portal_ativo    │  │
│   │  telefone        │  │                           │  portal_convidado│  │
│   │  cpf             │  │                           └──────────────────┘  │
│   └──────────────────┘  │                                                 │
│                         │                                                 │
│            ┌────────────┘                                                 │
│            ▼                                                              │
│   ┌──────────────────┐           ┌──────────────────┐                     │
│   │     cargos       │           │     setores      │                     │
│   │  ─────────────── │           │  ─────────────── │                     │
│   │  id (PK)         │           │  id (PK)         │                     │
│   │  nome            │           │  nome            │                     │
│   │  slug            │◄──────────│  slug            │                     │
│   │  setor_id FK     │──────────►│  descricao       │                     │
│   │  nivel_acesso    │           │  ativo           │                     │
│   │  acesso_financeiro│          └──────────────────┘                     │
│   │  escopo_visao    │                                                    │
│   └──────────────────┘                                                    │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

### Tabela: `colaboradores`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK (= `auth.users.id`) |
| `nome_completo` | TEXT | Nome exibido no sistema |
| `email` | TEXT | Email único |
| `cargo_id` | UUID FK | Referência para `cargos` |
| `setor_id` | UUID FK | Referência para `setores` |
| `cpf` | TEXT | Documento (opcional) |
| `telefone` | TEXT | Contato (opcional) |
| `avatar_url` | TEXT | URL do avatar |
| `ativo` | BOOLEAN | Status do colaborador |
| `created_at` | TIMESTAMP | Data de criação |

---

### Tabela: `cargos`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único |
| `nome` | TEXT | Nome exibido (ex: "Coordenador de Obras") |
| `slug` | TEXT | Identificador único (ex: `coord_obras`) |
| `setor_id` | UUID FK | Setor padrão do cargo |
| `nivel_acesso` | INTEGER | Hierarquia (0-10) |
| `acesso_financeiro` | BOOLEAN | Acesso a módulos financeiros |
| `escopo_visao` | TEXT | `'global'`, `'setorial'`, `'proprio'`, `'nenhuma'` |
| `descricao` | TEXT | Descrição do cargo |

#### Cargos Padrão do Sistema

| Slug | Nome | Nível | Setor | Financeiro | Escopo |
|------|------|:-----:|-------|:----------:|--------|
| `admin` | Admin | 10 | TI | ✅ | Global |
| `diretor` | Diretor | 9 | Diretoria | ✅ | Global |
| `coord_administrativo` | Coord. Administrativo | 6 | Administrativo | ✅ | Global |
| `coord_assessoria` | Coord. de Assessoria | 5 | Assessoria | ❌ | Setorial |
| `coord_obras` | Coord. de Obras | 5 | Obras | ❌ | Setorial |
| `operacional_admin` | Operacional Admin | 3 | Administrativo | ❌ | Setorial |
| `operacional_comercial` | Operacional Comercial | 3 | Administrativo | ❌ | Setorial |
| `operacional_assessoria` | Operacional Assessoria | 2 | Assessoria | ❌ | Setorial |
| `operacional_obras` | Operacional Obras | 2 | Obras | ❌ | Setorial |
| `colaborador_obra` | Colaborador Obra | 0 | Obras | ❌ | Nenhuma |

> **Nota:** `colaborador_obra` e `mao_de_obra` (nível 0) **não têm acesso ao sistema**.

---

### Tabela: `setores`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único |
| `nome` | TEXT | Nome exibido (ex: "Setor de Obras") |
| `slug` | TEXT | Identificador único (ex: `obras`) |
| `descricao` | TEXT | Descrição opcional |
| `ativo` | BOOLEAN | Status do setor |

#### Setores Padrão do Sistema

| Slug | Nome |
|------|------|
| `diretoria` | Diretoria |
| `administrativo` | Administrativo |
| `assessoria` | Assessoria |
| `obras` | Obras |
| `ti` | TI |

---

### Tabela: `clientes`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único |
| `auth_user_id` | UUID FK | Referência para `auth.users` (nullable) |
| `nome` | TEXT | Nome ou Razão Social |
| `email` | TEXT | Email de contato |
| `cpf_cnpj` | TEXT | CPF ou CNPJ |
| `tipo` | TEXT | `'fisica'` ou `'juridica'` |
| `portal_convidado_em` | TIMESTAMP | Data do convite |
| `portal_ativo` | BOOLEAN | Acesso ao portal habilitado |

---

## 🔄 Fluxo de Convite: Colaboradores

### Diagrama de Sequência

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  FLUXO DE CONVITE - COLABORADORES                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────┐│
│  │  Admin/     │      │   Edge Fn   │      │  Supabase   │      │  Novo   ││
│  │  Coord.     │      │ invite-user │      │    Auth     │      │ Usuário ││
│  └─────┬───────┘      └──────┬──────┘      └──────┬──────┘      └────┬────┘│
│        │                     │                    │                   │     │
│        │ 1. Preenche Modal   │                    │                   │     │
│        │    (Nome + Email)   │                    │                   │     │
│        ├────────────────────►│                    │                   │     │
│        │                     │                    │                   │     │
│        │                     │ 2. inviteUserByEmail()                 │     │
│        │                     ├───────────────────►│                   │     │
│        │                     │    + user_metadata │                   │     │
│        │                     │                    │                   │     │
│        │                     │                    │ 3. INSERT         │     │
│        │                     │                    │    auth.users     │     │
│        │                     │                    │                   │     │
│        │                     │                    │ 4. TRIGGER        │     │
│        │                     │                    │    INSERT colab   │     │
│        │                     │                    │                   │     │
│        │                     │                    │ 5. Send Email     │     │
│        │                     │                    ├──────────────────►│     │
│        │                     │                    │    (Magic Link)   │     │
│        │                     │                    │                   │     │
│        │                     │◄───────────────────┤                   │     │
│        │                     │   { user_id }      │                   │     │
│        │                     │                    │                   │     │
│        │◄────────────────────┤                    │                   │     │
│        │  Toast: "Enviado!"  │                    │                   │     │
│        │                     │                    │                   │     │
│        │                     │                    │ 6. Clica no Link  │     │
│        │                     │                    │◄──────────────────┤     │
│        │                     │                    │                   │     │
│        │                     │                    │ 7. Redirect       │     │
│        │                     │                    │    /auth/callback │     │
│        │                     │                    ├──────────────────►│     │
│        │                     │                    │                   │     │
│        │                     │                    │ 8. Redirect       │     │
│        │                     │                    │    /setup-password│     │
│        │                     │                    ├──────────────────►│     │
│        │                     │                    │                   │     │
│        │                     │                    │ 9. updateUser()   │     │
│        │                     │                    │◄──────────────────┤     │
│        │                     │                    │    { password }   │     │
│        │                     │                    │                   │     │
│        │                     │                    │ 10. Redirect /    │     │
│        │                     │                    ├──────────────────►│     │
│        │                     │                    │                   │     │
│  └─────┴───────┘      └──────┴──────┘      └──────┴──────┘      └────┴────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Passo a Passo Detalhado

#### 1️⃣ Disparo do Convite (Frontend)

**Componente:** `ModalConviteColaborador` (`src/components/colaboradores/modal-convite-colaborador.tsx`)

```typescript
// Linha 93-121
const handleEnviarConvites = async () => {
    // Filtrar convites com email preenchido
    const convitesValidos = convites
        .filter(c => c.email && c.email.includes('@'))
        .map(c => ({
            email: c.email.trim().toLowerCase(),
            nome: c.nome.trim() || null,
        }));

    // Chamar Edge Function
    const { data, error } = await supabase.functions.invoke('invite-user', {
        body: {
            invites: convitesValidos,
            redirectTo: `${window.location.origin}/auth/callback`
        }
    });
};
```

**Payload da Requisição:**
```json
{
  "invites": [
    { "email": "joao.silva@empresa.com", "nome": "João Silva" },
    { "email": "maria.souza@empresa.com", "nome": "Maria Souza" }
  ],
  "redirectTo": "https://app.minerva.com/auth/callback"
}
```

---

#### 2️⃣ Processamento na Edge Function

**Arquivo:** `supabase/functions/invite-user/index.ts`

```typescript
// Linha 129-164
for (const invite of invites) {
    const { email: inviteEmail, nome, cargo_id, setor_id } = invite;

    const userData = {
        full_name: nome || '',
        cargo_id: cargo_id || null,
        setor_id: setor_id || null,
    };

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(
        inviteEmail,
        {
            redirectTo: redirectTo || getDefaultRedirectTo(),
            data: userData  // ← Salvo em raw_user_meta_data
        }
    );
}
```

**Resposta da Edge Function:**
```json
{
  "success": true,
  "message": "2 convite(s) enviado(s) com sucesso",
  "results": {
    "success": [
      { "email": "joao.silva@empresa.com", "user_id": "uuid-xxx" }
    ],
    "failed": []
  }
}
```

---

#### 3️⃣ Callback de Autenticação

**Arquivo:** `src/routes/auth/callback.tsx`

> **Importante:** O cliente Supabase está configurado com `detectSessionInUrl: false` para permitir o processamento manual dos tokens e preservar o parâmetro `type`.

```typescript
// Capturar type ANTES de processar a sessão
const type = hashParams.get('type') || searchParams.get('type');

// Extrair e processar tokens manualmente
const accessToken = hashParams.get('access_token');
const refreshToken = hashParams.get('refresh_token');

if (accessToken && refreshToken) {
    // Setar sessão manualmente
    await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
    });
}

// Redirect baseado no type PRESERVADO
if (type === 'invite' || type === 'signup') {
    navigate({ to: '/auth/setup-password' });
} else if (type === 'recovery') {
    navigate({ to: '/auth/setup-password' });
} else {
    // Verificar tipo de usuário
    const { data: clienteData } = await supabase
        .from('clientes')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

    if (clienteData) {
        navigate({ to: '/portal' });
    } else {
        navigate({ to: '/' });
    }
}
```

---

#### 4️⃣ Definição de Senha

**Arquivo:** `src/routes/auth/setup-password.tsx`

```typescript
const handleSubmit = async (e: React.FormEvent) => {
    // Atualizar senha E marcar flag no user_metadata
    const { error } = await supabase.auth.updateUser({ 
        password,
        data: {
            senha_definida: true,
            senha_definida_em: new Date().toISOString()
        }
    });

    if (error) {
        toast.error(error.message);
        return;
    }

    toast.success('Senha definida com sucesso!');

    // Verificar tipo de usuário para redirect correto
    const { data: { user } } = await supabase.auth.getUser();

    // Verificar se é cliente
    const { data: clienteData } = await supabase
        .from('clientes')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

    if (clienteData) {
        navigate({ to: '/portal' });
        return;
    }

    // Verificar se é colaborador
    const { data: colaboradorData } = await supabase
        .from('colaboradores')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

    if (colaboradorData) {
        navigate({ to: '/' });
        return;
    }

    // Fallback
    navigate({ to: '/login' });
};
```

---

## 🔄 Fluxo de Convite: Clientes (Portal)

### Diagrama de Sequência

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   FLUXO DE CONVITE - CLIENTES (PORTAL)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────┐│
│  │  Operador   │      │   Service   │      │  Edge Fn    │      │ Cliente ││
│  │  (Staff)    │      │ ClientInvite│      │invite-client│      │         ││
│  └─────┬───────┘      └──────┬──────┘      └──────┬──────┘      └────┬────┘│
│        │                     │                    │                   │     │
│        │ 1. Botão "Convidar" │                    │                   │     │
│        │    (cliente-page)   │                    │                   │     │
│        ├────────────────────►│                    │                   │     │
│        │                     │                    │                   │     │
│        │                     │ 2. sendClientInvite()                  │     │
│        │                     │    (clienteId, email, nome)            │     │
│        │                     ├───────────────────►│                   │     │
│        │                     │                    │                   │     │
│        │                     │                    │ 3. inviteUserByEmail()  │
│        │                     │                    │    + { is_client: true }│
│        │                     │                    │                   │     │
│        │                     │                    │ 4. UPDATE clientes      │
│        │                     │                    │    SET auth_user_id,    │
│        │                     │                    │    portal_convidado_em  │
│        │                     │                    │                   │     │
│        │                     │                    │ 5. Send Email     │     │
│        │                     │                    ├──────────────────►│     │
│        │                     │                    │                   │     │
│        │                     │◄───────────────────┤                   │     │
│        │◄────────────────────┤                    │                   │     │
│        │  Toast: "Enviado!"  │                    │                   │     │
│        │                     │                    │                   │     │
│        │                     │                    │ 6. Clica no Link  │     │
│        │                     │                    │◄──────────────────┤     │
│        │                     │                    │                   │     │
│        │                     │                    │ 7. /auth/callback │     │
│        │                     │                    │    ?type=cliente  │     │
│        │                     │                    ├──────────────────►│     │
│        │                     │                    │                   │     │
│        │                     │                    │ 8. /setup-password│     │
│        │                     │                    ├──────────────────►│     │
│        │                     │                    │                   │     │
│        │                     │                    │ 9. Define senha   │     │
│        │                     │                    │    → /portal      │     │
│        │                     │                    ├──────────────────►│     │
│        │                     │                    │                   │     │
│  └─────┴───────┘      └──────┴──────┘      └──────┴──────┘      └────┴────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Serviço de Convite de Clientes

**Arquivo:** `src/lib/services/client-invite-service.ts`

```typescript
// Linha 40-139
export async function sendClientInvite(payload: InviteClientPayload): Promise<InviteClientResponse> {
    // 1. Verificar se usuário já existe
    const { data: existingUser } = await supabase
        .rpc('find_auth_user_by_email', { user_email: payload.email });

    // Se usuário já existe, apenas vincular
    if (existingUser && existingUser.length > 0) {
        await supabase
            .from('clientes')
            .update({
                portal_convidado_em: new Date().toISOString(),
                auth_user_id: existingUser[0].id
            })
            .eq('id', payload.clienteId);

        return {
            success: true,
            message: 'Usuário já possui conta. Acesso ao portal vinculado!'
        };
    }

    // 2. Usar Edge Function para novo convite
    const { data, error } = await supabase.functions.invoke('invite-client', {
        body: {
            clienteId: payload.clienteId,
            email: payload.email,
            nomeCliente: payload.nomeCliente,
            osId: payload.osId
        }
    });

    // 3. Atualizar cliente com auth_user_id
    if (data?.success) {
        await supabase
            .from('clientes')
            .update({
                portal_convidado_em: new Date().toISOString(),
                auth_user_id: data.user.id
            })
            .eq('id', payload.clienteId);
    }

    return { success: true, message: 'Convite enviado!' };
}
```

---

### Edge Function: invite-client

**Arquivo:** `supabase/functions/invite-client/index.ts`

```typescript
// Linha 101-114
const { data, error } = await supabase.auth.admin.inviteUserByEmail(
    email,
    {
        redirectTo: getPortalRedirectTo(),  // /auth/callback?type=cliente
        data: {
            account_type: 'cliente',
            is_client: true,
            cargo_slug: 'cliente',
            cliente_id: clienteId,
            full_name: nomeCliente,
        }
    }
);
```

---

## 🎣 Hooks e Serviços

### ClientInviteService

**Arquivo:** `src/lib/services/client-invite-service.ts`

```typescript
export const ClientInviteService = {
    sendInvite: sendClientInvite,      // Enviar convite
    checkStatus: checkClientInviteStatus,  // Verificar status
    resendInvite: resendClientInvite,  // Reenviar convite
    togglePortalAccess: togglePortalAccess  // Ativar/desativar acesso
};
```

**Exemplo de Uso:**
```typescript
import { ClientInviteService } from '@/lib/services/client-invite-service';

// Verificar status
const status = await ClientInviteService.checkStatus(clienteId);
// { hasInvite: true, inviteAccepted: true, portalAtivo: true }

// Enviar convite
await ClientInviteService.sendInvite({
    clienteId: '...',
    email: 'cliente@empresa.com',
    nomeCliente: 'Empresa ABC'
});

// Toggle acesso ao portal
await ClientInviteService.togglePortalAccess(clienteId, false);  // Desativar
```

---

## 🛡 Permissões e RLS

### Row Level Security (RLS)

| Tabela | RLS Habilitado | Políticas |
|--------|:--------------:|-----------|
| `colaboradores` | ✅ | Visualização baseada em `escopo_visao` do cargo |
| `clientes` | ✅ | Staff vê todos; Cliente vê apenas próprio registro |
| `cargos` | ❌ | Público (somente leitura) |
| `setores` | ❌ | Público (somente leitura) |

### Níveis de Acesso

```typescript
// Exemplo de verificação de permissão
const canAccessFinanceiro = (cargo: Cargo): boolean => {
    return cargo.acesso_financeiro === true;
};

const canViewAllOS = (cargo: Cargo): boolean => {
    return cargo.escopo_visao === 'global';
};

const canViewSectorOS = (cargo: Cargo): boolean => {
    return ['global', 'setorial'].includes(cargo.escopo_visao);
};
```

---

## ⚠️ Tratamento de Erros

### Erros Comuns

| Código | Mensagem | Causa | Solução |
|--------|----------|-------|---------|
| `USER_EXISTS` | "Este e-mail já possui uma conta" | Email já registrado | Usar `resendInvite` ou vincular manualmente |
| `INVALID_EMAIL` | "Email inválido" | Formato incorreto | Validar antes de enviar |
| `EXPIRED_LINK` | "O link expirou" | Magic link expirado (24h) | Reenviar convite |

---

## 📁 Arquivos Relacionados

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/routes/auth/callback.tsx` | Handler de retorno do Supabase Auth |
| `src/routes/auth/setup-password.tsx` | Tela de definição de senha |
| `src/components/colaboradores/modal-convite-colaborador.tsx` | Modal de convite em lote |
| `src/lib/services/client-invite-service.ts` | Serviço de convite de clientes |
| `supabase/functions/invite-user/index.ts` | Edge Function para colaboradores |
| `supabase/functions/invite-client/index.ts` | Edge Function para clientes |
| `supabase/migrations/20250105_refactor_roles_sectors.sql` | Seed de cargos e setores |

---

## 🔮 Próximos Passos (Roadmap)

- [ ] Trigger de banco para criação automática de `colaboradores` (atualmente via metadata)
- [ ] Notificações por email customizadas (templates)
- [ ] Expiração de convites com reativação automática
- [ ] Histórico de convites na timeline do colaborador
