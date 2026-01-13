# Diagnóstico: Fluxo de Convite de Colaboradores

**Data:** 2026-01-05  
**Status:** 🔴 Bug Identificado  
**Ambiente:** Produção + Localhost

---

## 📌 Problema Relatado

> "Ao clicar no botão do email, ao invés de ser redirecionado para CRIAR UMA SENHA, já acessei o sistema diretamente, e não consegui refazer a senha."

**Comportamento Esperado:**
1. Usuário clica no link do email
2. Redireciona para `/auth/callback`
3. Callback detecta `type=invite`
4. Redireciona para `/auth/setup-password`
5. Usuário define senha
6. Redireciona para Dashboard

**Comportamento Atual:**
1. Usuário clica no link do email
2. Supabase client processa token automaticamente
3. Sessão é criada
4. Callback detecta sessão ativa
5. Redireciona direto para Dashboard ❌

---

## 🔍 Causa Raiz Identificada

### Problema Principal: `detectSessionInUrl: true`

**Arquivo:** `src/lib/supabase-client.ts` (linha 54)

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,  // ← PROBLEMA
  },
});
```

**O que acontece:**
1. Quando o usuário clica no link do email, a URL contém tokens no hash/query
2. A opção `detectSessionInUrl: true` faz o Supabase client processar esses tokens **automaticamente** assim que a página carrega
3. Isso acontece **ANTES** do componente `callback.tsx` rodar seu `useEffect`
4. Quando o callback roda, a sessão já está ativa e o `type` pode não estar mais disponível

### Fluxo Detalhado do Bug

```
┌───────────────────────────────────────────────────────────────────────────┐
│                        FLUXO ATUAL (BUGADO)                               │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  1. Email enviado com link:                                               │
│     https://project.supabase.co/auth/v1/verify?token=XXX&type=invite      │
│     &redirect_to=http://localhost:3000/auth/callback                      │
│                                                                           │
│  2. Supabase Auth server processa → Redirect 303 para:                    │
│     http://localhost:3000/auth/callback#access_token=...&type=invite      │
│                                                                           │
│  3. Browser carrega /auth/callback                                        │
│                                                                           │
│  4. ⚡ supabase-client.ts inicializa com detectSessionInUrl: true         │
│     ├─ Lê access_token do hash                                            │
│     ├─ Cria sessão automaticamente                                        │
│     └─ Limpa o hash da URL                                                │
│                                                                           │
│  5. callback.tsx useEffect roda:                                          │
│     ├─ hashParams.get('type') → null (hash foi limpo!)                    │
│     └─ Vai para bloco "else" → Redireciona para Dashboard                 │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 🔎 Evidências nos Logs

### Log de Auth (Supabase MCP)

```json
{
  "error": "One-time token not found",
  "msg": "403: Email link is invalid or has expired",
  "path": "/verify",
  "timestamp": 1767620224000000
}
```

> **Interpretação:** O token do email está sendo consumido, mas o fluxo não está respeitando o `type=invite`.

---

## ✅ Correções Propostas

### Correção 1: Preservar `type` antes do processamento automático

**Estratégia:** Salvar o `type` no `sessionStorage` antes que o Supabase client processe o token.

**Arquivo a modificar:** `src/routes/auth/callback.tsx`

```typescript
// ANTES do useEffect principal, capturar o type imediatamente
const hashParams = new URLSearchParams(window.location.hash.substring(1));
const searchParams = new URLSearchParams(window.location.search);
const initialType = hashParams.get('type') || searchParams.get('type');

// Salvar para uso posterior
if (initialType) {
  sessionStorage.setItem('supabase_auth_type', initialType);
}
```

**Prós:**
- Não requer mudança no supabase-client
- Preserva o `type` para uso no callback

**Contras:**
- Depende de timing (pode não funcionar se o client processar muito rápido)

---

### Correção 2: Desabilitar `detectSessionInUrl` (Recomendada)

**Estratégia:** Desabilitar detecção automática e processar manualmente no callback.

**Arquivo a modificar:** `src/lib/supabase-client.ts`

```diff
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
-   detectSessionInUrl: true,
+   detectSessionInUrl: false,  // ← Processar manualmente no callback
  },
});
```

**Arquivo a modificar:** `src/routes/auth/callback.tsx`

```typescript
useEffect(() => {
    const handleCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);

        // Capturar type ANTES de processar a sessão
        const type = hashParams.get('type') || searchParams.get('type');
        logger.log('[AuthCallback] Callback type:', type);

        // Processar tokens manualmente da URL
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Setar sessão manualmente
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            logger.error('[AuthCallback] Session error:', sessionError);
            setErrorMessage('Erro ao processar autenticação');
            setStatus('error');
            return;
          }
        }

        // Agora verificar o type PRESERVADO
        if (type === 'invite' || type === 'signup') {
          navigate({ to: '/auth/setup-password' });
        } else if (type === 'recovery') {
          navigate({ to: '/auth/setup-password' });
        } else {
          // ... resto do código
        }
      } catch (err) { /* ... */ }
    };

    handleCallback();
}, [navigate]);
```

**Prós:**
- Controle total sobre o fluxo
- Garante que o `type` seja capturado
- Solução robusta e definitiva

**Contras:**
- Requer mais código no callback
- Pode afetar outros fluxos de login (magic link, login social)

---

### Correção 3: Verificar `user_metadata` do usuário

**Estratégia:** Ao invés de depender do `type` na URL, verificar se o usuário definiu senha.

**Arquivo a modificar:** `src/routes/auth/callback.tsx`

```typescript
// Após obter a sessão
const { data: { user } } = await supabase.auth.getUser();

if (user) {
  // Verificar se usuário nunca fez login (invited_at existe, last_sign_in_at não)
  const isFirstLogin = !user.last_sign_in_at || 
                       (user.invited_at && user.last_sign_in_at === user.invited_at);
  
  // Ou verificar user_metadata para flag de senhaDefinida
  const senhaDefinida = user.user_metadata?.senha_definida === true;

  if (!senhaDefinida && isFirstLogin) {
    navigate({ to: '/auth/setup-password' });
    return;
  }
}
```

**Arquivo a modificar:** `src/routes/auth/setup-password.tsx`

```typescript
// Após definir senha com sucesso, marcar no metadata
await supabase.auth.updateUser({
  password,
  data: {
    senha_definida: true
  }
});
```

**Prós:**
- Não depende do `type` na URL
- Funciona mesmo se o usuário fechar e reabrir o link
- Estado persistente no banco

**Contras:**
- Requer migração para usuários existentes
- Adiciona campo em `user_metadata`

---

## 🎯 Recomendação Final

### Implementar Correção 2 + 3 (Híbrida)

1. **Desabilitar `detectSessionInUrl`** para controle total
2. **Processar tokens manualmente** no callback
3. **Adicionar flag `senha_definida`** como backup

---

## 📋 Checklist de Implementação

### Correções Críticas (Bug Fix)
- [ ] Alterar `detectSessionInUrl: false` em `supabase-client.ts`
- [ ] Atualizar `callback.tsx` para processar tokens manualmente
- [ ] Atualizar `setup-password.tsx` para marcar `senha_definida: true`
- [ ] Testar fluxo de convite (novo colaborador)
- [ ] Testar fluxo de login normal (não deve quebrar)
- [ ] Testar fluxo de recuperação de senha
- [ ] Testar fluxo de magic link (se usado)

### Melhorias Futuras
- [ ] Expiração de convites com reativação automática
- [ ] Histórico de convites na timeline do colaborador

---

## 🧪 Plano de Testes

### Teste 1: Novo Convite de Colaborador
1. Acessar `/colaboradores`
2. Clicar em "Convidar Colaboradores"
3. Inserir email novo
4. Enviar convite
5. Abrir email e clicar no link
6. **Esperado:** Redirecionar para `/auth/setup-password`
7. Definir senha
8. **Esperado:** Redirecionar para Dashboard

### Teste 2: Login Normal
1. Fazer logout
2. Acessar `/login`
3. Inserir credenciais de usuário existente
4. **Esperado:** Redirecionar para Dashboard

### Teste 3: Recuperação de Senha
1. Acessar `/login`
2. Clicar em "Esqueci minha senha"
3. Inserir email
4. Abrir email e clicar no link
5. **Esperado:** Redirecionar para `/auth/setup-password`
6. Definir nova senha
7. **Esperado:** Redirecionar para Dashboard

---

## 📁 Arquivos Afetados

| Arquivo | Alteração |
|---------|-----------|
| `src/lib/supabase-client.ts` | `detectSessionInUrl: false` |
| `src/routes/auth/callback.tsx` | Processamento manual de tokens |
| `src/routes/auth/setup-password.tsx` | Flag `senha_definida` |

---

## ⚠️ Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Quebrar login normal | Testar extensivamente antes de deploy |
| Usuários existentes sem flag | Flag só é verificada para primeiro login |
| Performance | Impacto mínimo (apenas callback) |

---

## 📚 Referências

- [Supabase Auth - Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase Auth - Configuration](https://supabase.com/docs/reference/javascript/initializing)
- [Issue: OTP expires after email_confirm update](https://github.com/orgs/supabase/discussions/34841)
