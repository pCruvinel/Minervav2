# 🧪 Teste de Conexão com a API Supabase

## Como Testar a Conexão

### Teste 1: Health Check
```bash
curl https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/make-server-5ad7fd2c/health \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZmV2bGtzc2xqbmRxcWh4a2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDkxNTcsImV4cCI6MjA3ODIyNTE1N30.cODYFIRpNluf8tUZqyL8y0GC46GCEGxELHVxrKcAH7c"
```

**Resposta Esperada:**
```json
{
  "status": "ok"
}
```

### Teste 2: Listar Clientes
```bash
curl https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/make-server-5ad7fd2c/clientes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZmV2bGtzc2xqbmRxcWh4a2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDkxNTcsImV4cCI6MjA3ODIyNTE1N30.cODYFIRpNluf8tUZqyL8y0GC46GCEGxELHVxrKcAH7c"
```

**Resposta Esperada:**
```json
[]
```
(Array vazio se não houver clientes ainda)

### Teste 3: Criar Cliente
```bash
curl -X POST https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/make-server-5ad7fd2c/clientes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZmV2bGtzc2xqbmRxcWh4a2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDkxNTcsImV4cCI6MjA3ODIyNTE1N30.cODYFIRpNluf8tUZqyL8y0GC46GCEGxELHVxrKcAH7c" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "tipo": "LEAD",
    "status": "LEAD"
  }'
```

---

## Teste no Browser (Console)

Abra o Console do navegador (F12) e execute:

### Teste 1: Health Check
```javascript
const projectId = "zxfevlkssljndqqhxkjb";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZmV2bGtzc2xqbmRxcWh4a2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDkxNTcsImV4cCI6MjA3ODIyNTE1N30.cODYFIRpNluf8tUZqyL8y0GC46GCEGxELHVxrKcAH7c";

fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5ad7fd2c/health`, {
  headers: {
    'Authorization': `Bearer ${publicAnonKey}`
  }
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### Teste 2: Listar Clientes
```javascript
fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5ad7fd2c/clientes`, {
  headers: {
    'Authorization': `Bearer ${publicAnonKey}`
  }
})
  .then(r => r.json())
  .then(data => {
    console.log('✅ Clientes:', data);
  })
  .catch(error => {
    console.error('❌ Erro:', error);
  });
```

---

## Interpretando os Resultados

### ✅ Sucesso - Status 200
```
✅ API funcionando corretamente
Backend conectado ao Supabase
```

### ❌ Erro 403 Forbidden
```
Possíveis causas:
1. Edge Function não foi deployada
2. Credenciais incorretas
3. Permissões do projeto Supabase
```

**Solução:** Veja o arquivo `/SUPABASE_CONECTADO.md` para resolver.

### ❌ Erro 404 Not Found
```
Possíveis causas:
1. Rota incorreta
2. Prefixo /make-server-5ad7fd2c/ ausente
3. Edge Function não existe
```

**Solução:** Deploy da Edge Function necessário.

### ❌ Erro 500 Internal Server Error
```
Possíveis causas:
1. Erro no código da Edge Function
2. Banco de dados não configurado
3. Tabelas ausentes
```

**Solução:** Verificar logs no Supabase Dashboard > Edge Functions > Logs.

---

## Como Verificar Logs no Supabase

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione o projeto `zxfevlkssljndqqhxkjb`
3. Vá em **Edge Functions** no menu lateral
4. Selecione a function `server`
5. Clique em **Logs** para ver erros em tempo real

---

## Estado Atual do Sistema

### ✅ Configurações Prontas:
- Credenciais do Supabase
- API Client configurado
- Storage habilitado
- Edge Functions implementadas

### ⚠️ Pendente:
- Deploy das Edge Functions (erro 403)
- Schema do banco de dados
- Bucket de storage

---

**Data:** 17/11/2025
