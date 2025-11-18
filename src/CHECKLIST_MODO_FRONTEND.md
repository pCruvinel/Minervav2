# ✅ CHECKLIST - MODO FRONTEND ONLY

Use este checklist para verificar que o sistema está corretamente configurado em modo frontend.

## 🔍 VERIFICAÇÕES DE ARQUIVOS

### 1. Credenciais Desabilitadas
- [ ] `/utils/supabase/info.tsx` - projectId e publicAnonKey vazios ("")

### 2. Flags de Modo Frontend
- [ ] `/lib/api-client.ts` - `FRONTEND_ONLY_MODE = true` (linha 5)
- [ ] `/lib/utils/supabase-storage.ts` - `FRONTEND_ONLY_MODE = true` (linha 4)

### 3. Chamadas HTTP Comentadas
- [ ] `/components/admin/seed-usuarios-page.tsx` - fetch comentado
- [ ] `/components/test-schema-reload.tsx` - fetch comentado (2 lugares)

### 4. Hooks Mock Criados
- [ ] `/lib/hooks/use-clientes.tsx` - existe e retorna dados mock

### 5. Componentes Desabilitados
- [ ] `/components/test-supabase-connection.tsx` - reescrito para modo frontend

### 6. Arquivo de Ignore
- [ ] `/.supabaseignore` - existe e contém `supabase/functions/`

---

## 🧪 TESTES FUNCIONAIS

### ✅ Sistema Deve Funcionar
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Listagem de OS funciona
- [ ] Criação de OS funciona
- [ ] Upload de arquivos funciona (localmente)
- [ ] Navegação entre páginas funciona
- [ ] Nenhum erro 403 aparece no console

### ✅ Console Deve Mostrar
- [ ] `🎭 MOCK API: GET /clientes` (ou similar)
- [ ] `🎭 MOCK Upload: ...` (ao fazer upload)
- [ ] `🎭 MOCK Delete: ...` (ao deletar arquivo)

### ❌ NÃO Deve Acontecer
- [ ] Erros de rede (fetch failed)
- [ ] Erros 403 Forbidden
- [ ] Tentativas de deploy de edge functions
- [ ] Chamadas para `*.supabase.co`

---

## 🔧 TROUBLESHOOTING

### Problema: Ainda vejo erro 403
**Solução:**
1. Verificar se `projectId` e `publicAnonKey` estão vazios em `/utils/supabase/info.tsx`
2. Verificar se `FRONTEND_ONLY_MODE = true` em ambos os arquivos
3. Limpar cache do browser (Ctrl+Shift+Delete)
4. Fazer hard reload (Ctrl+Shift+R)

### Problema: Dados não aparecem
**Solução:**
1. Verificar se `/lib/hooks/use-clientes.tsx` existe
2. Verificar se `mockDatabase` em `/lib/api-client.ts` está populado
3. Verificar console para mensagens `🎭 MOCK API`

### Problema: Upload não funciona
**Solução:**
1. Verificar se `FRONTEND_ONLY_MODE = true` em `/lib/utils/supabase-storage.ts`
2. Verificar console para mensagens `🎭 MOCK Upload`
3. Arquivos devem aparecer na lista (mas não persistem após refresh)

### Problema: Deploy falha
**Solução:**
1. Verificar se `/.supabaseignore` existe
2. Verificar se contém `supabase/functions/`
3. Tentar deploy novamente

---

## 📊 STATUS ESPERADO

Após todas as correções, o sistema deve:

| Funcionalidade | Status Esperado |
|----------------|-----------------|
| Login | ✅ Funciona |
| Dashboard | ✅ Funciona |
| Listagem OS | ✅ Funciona |
| Criação OS | ✅ Funciona |
| Upload Arquivos | ✅ Funciona (local) |
| Persistência Dados | ❌ Não funciona (esperado) |
| Erro 403 | ❌ Não acontece mais |
| Deploy | ✅ Sem erros |

---

## 🎯 COMO USAR

1. Marque cada item da checklist conforme verifica
2. Execute os testes funcionais
3. Verifique o console do browser
4. Confirme que nenhum erro 403 aparece
5. Se todos os itens estiverem ✅, o sistema está correto!

---

## 📞 SUPORTE

Se ainda houver problemas após seguir este checklist:

1. Verifique o arquivo `/FIX_ERRO_403_COMPLETO.md` para detalhes
2. Consulte `/MODO_FRONTEND_ONLY.md` para informações gerais
3. Verifique o console do browser para erros específicos

---

**Última atualização:** 17/11/2025  
**Versão:** 1.0 - Frontend Only Mode
