# 🔧 SOLUÇÃO DEFINITIVA: Erro 403 no Deploy Supabase

## ❌ O Problema

```
Error while deploying: XHR for "/api/integrations/supabase/.../deploy" failed with status 403
```

Este erro ocorre quando o **Figma Make tenta fazer deploy automático** das Edge Functions do Supabase, mas não tem permissão.

---

## ✅ SOLUÇÃO 1: Deploy Manual via Supabase CLI (RECOMENDADO)

### Passo 1: Instalar Supabase CLI

**Windows (PowerShell):**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Mac:**
```bash
brew install supabase/tap/supabase
```

**Linux:**
```bash
brew install supabase/tap/supabase
```

**NPM (Qualquer plataforma):**
```bash
npm install -g supabase
```

### Passo 2: Fazer Login
```bash
supabase login
```

Isso abrirá o browser para autenticação.

### Passo 3: Link ao Projeto
```bash
supabase link --project-ref zxfevlkssljndqqhxkjb
```

### Passo 4: Deploy da Function
```bash
cd supabase/functions
supabase functions deploy server
```

### Passo 5: Verificar
```bash
curl https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/make-server-5ad7fd2c/health \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Resposta esperada:**
```json
{"status":"ok"}
```

---

## ✅ SOLUÇÃO 2: Deploy via Supabase Dashboard

### Passo 1: Acessar Edge Functions
1. Acesse https://app.supabase.com
2. Selecione o projeto `zxfevlkssljndqqhxkjb`
3. Vá em **Edge Functions** no menu lateral

### Passo 2: Criar Nova Function
1. Clique em **New Function**
2. Nome: `server`
3. Cole o código de `/supabase/functions/server/index.tsx`

### Passo 3: Configurar Variáveis de Ambiente
No dashboard, adicione:
- `SUPABASE_URL` = `https://zxfevlkssljndqqhxkjb.supabase.co`
- `SUPABASE_ANON_KEY` = (copie de `/utils/supabase/info.tsx`)
- `SUPABASE_SERVICE_ROLE_KEY` = (busque em Settings > API no dashboard)

### Passo 4: Deploy
Clique em **Deploy** no dashboard.

---

## ✅ SOLUÇÃO 3: Desabilitar Deploy Automático no Figma Make

Se nenhuma das soluções acima funcionar, você pode desabilitar o deploy automático:

### Opção A: Remover a Pasta Edge Functions
1. Mova a pasta `/supabase/functions/` para fora do projeto
2. O Figma Make não tentará fazer deploy
3. Use deploy manual (Solução 1 ou 2)

### Opção B: Criar .supabaseignore
Crie um arquivo `/.supabaseignore`:
```
supabase/functions/
```

Isso fará o Figma Make ignorar as Edge Functions.

---

## ✅ SOLUÇÃO 4: Continuar em Modo Frontend Only

Se o deploy das Edge Functions não for urgente:

### Manter Modo Frontend Only Temporariamente

**`/lib/api-client.ts`**:
```typescript
const FRONTEND_ONLY_MODE = true; // Voltar ao modo mock
```

**`/lib/utils/supabase-storage.ts`**:
```typescript
const FRONTEND_ONLY_MODE = true; // Upload local
```

**`/components/layout/frontend-mode-banner.tsx`**:
```typescript
const isFrontendMode = true; // Mostrar banner
```

### Vantagens:
- ✅ Sistema funciona imediatamente
- ✅ Sem necessidade de backend
- ✅ Ideal para demonstrações e testes

### Desvantagens:
- ❌ Dados não persistem
- ❌ Arquivos não são salvos
- ❌ Sem autenticação real

---

## 🔍 Por Que o Erro 403 Acontece?

### Possível Causa 1: Permissões do Projeto
- O projeto Supabase pode ter **permissões restritas**
- O token usado pelo Figma Make pode estar **expirado**
- Solução: Desconectar e reconectar o Supabase no Figma Make

### Possível Causa 2: Limite do Plano
- Plano gratuito do Supabase tem **limites**
- Pode ter atingido limite de **Edge Functions**
- Solução: Verificar uso em Settings > Billing

### Possível Causa 3: Rate Limiting
- Supabase pode ter **limite de deploys por minuto**
- Muitos deploys seguidos causam bloqueio temporário
- Solução: Aguardar 5-10 minutos e tentar novamente

### Possível Causa 4: Configuração do Figma Make
- A integração Supabase do Figma Make pode ter **bug**
- Deploy automático pode não funcionar para Edge Functions grandes
- Solução: Usar deploy manual (Solução 1 ou 2)

---

## 📊 Checklist de Resolução

- [ ] Tentei aguardar 5 minutos e fazer deploy novamente
- [ ] Verifiquei se o projeto Supabase está ativo
- [ ] Confirmei que o plano não atingiu limites
- [ ] Tentei desconectar e reconectar o Supabase no Figma Make
- [ ] Tentei deploy manual via CLI (Solução 1)
- [ ] Tentei deploy via Dashboard (Solução 2)
- [ ] Considerei continuar em modo frontend only (Solução 4)

---

## 🎯 Recomendação

### Para Teste Imediato:
**Use a Solução 4** - Continuar em modo frontend only até resolver o deploy.

### Para Produção:
**Use a Solução 1** - Deploy manual via CLI é a forma mais confiável.

### Para Evitar o Problema:
**Use a Solução 2** - Deploy via Dashboard permite controle total.

---

## 📞 Quando Pedir Ajuda

Se nenhuma solução funcionar:

1. **Supabase Discord**: https://discord.supabase.com
2. **Supabase Support**: support@supabase.com
3. **Figma Make Support**: Reportar bug na integração

---

## 🎉 Depois de Resolver

Quando o deploy funcionar:

1. ✅ Teste o health check (veja `/TEST_API_CONNECTION.md`)
2. ✅ Configure o banco de dados (veja `/DATABASE_SCHEMA.md`)
3. ✅ Configure o storage bucket
4. ✅ Popule usuários de teste (`/seed-usuarios`)

---

**Data:** 17/11/2025  
**Status:** Sistema configurado para backend, aguardando deploy das Edge Functions  
**Alternativa:** Modo frontend only funcionando perfeitamente
