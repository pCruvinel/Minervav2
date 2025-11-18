# 🎭 MODO FRONTEND ONLY

Este projeto está configurado para funcionar **100% no frontend**, sem dependências de backend ou Supabase.

## ⚠️ Configuração Atual

### Arquivos Desabilitados
- ✅ `/utils/supabase/info.tsx` - Credenciais vazias
- ✅ `/lib/api-client.ts` - Flag `FRONTEND_ONLY_MODE = true`
- ✅ `/lib/utils/supabase-storage.ts` - Flag `FRONTEND_ONLY_MODE = true`
- ✅ `/components/admin/seed-usuarios-page.tsx` - Chamadas HTTP comentadas
- ✅ `/components/test-schema-reload.tsx` - Chamadas HTTP comentadas

### Edge Functions Ignoradas
- ❌ `/supabase/functions/` - Diretório ignorado (não será feito deploy)

## 🚀 Como Funciona

1. **Nenhuma chamada HTTP** é feita para APIs externas
2. **Todos os dados são mock** e armazenados em memória
3. **Arquivos uploaded** são armazenados no browser usando `URL.createObjectURL()`
4. **Nenhum dado persiste** após refresh da página

## 🔄 Para Reativar o Backend

Se no futuro você quiser conectar ao Supabase:

### 1. Restaurar Credenciais
Em `/utils/supabase/info.tsx`:
```typescript
export const projectId = "seu-project-id"
export const publicAnonKey = "sua-anon-key"
```

### 2. Desabilitar Modo Frontend
Altere em cada arquivo:

**`/lib/api-client.ts`** (linha 5):
```typescript
const FRONTEND_ONLY_MODE = false;
```

**`/lib/utils/supabase-storage.ts`** (linha 4):
```typescript
const FRONTEND_ONLY_MODE = false;
```

### 3. Descomentar Chamadas HTTP
Descomente os blocos marcados com `/* ... */` em:
- `/components/admin/seed-usuarios-page.tsx`
- `/components/test-schema-reload.tsx`

### 4. Remover Arquivo de Ignore
Delete: `/.supabaseignore`

## 📋 Limitações do Modo Frontend

- ❌ Dados não persistem entre sessões
- ❌ Arquivos ficam apenas na memória do browser
- ❌ Sem autenticação real
- ❌ Sem validações de servidor
- ❌ Sem sincronização entre múltiplos usuários

## ✅ Vantagens do Modo Frontend

- ✅ Deploy sem erros 403
- ✅ Funciona offline
- ✅ Não requer configuração de backend
- ✅ Perfeito para demonstrações e testes
- ✅ Desenvolvimento rápido sem depender de APIs

---

**Última atualização:** $(date)
**Status:** Frontend Only Mode **ATIVADO** 🟢
