# ✅ CHECKLIST DE DEPLOY - Supabase Backend

Use este checklist para fazer o deploy do backend passo a passo.

---

## 🎯 ESCOLHA SEU CAMINHO

### [ ] Caminho A: Deploy via CLI (5-10 min) - RECOMENDADO
### [ ] Caminho B: Deploy via Dashboard (10-15 min)
### [ ] Caminho C: Continuar Modo Mock (0 min) - JÁ FUNCIONA

---

## 🟢 CAMINHO A: Deploy via CLI

### Pré-requisitos
- [ ] Node.js instalado (verificar: `node --version`)
- [ ] NPM instalado (verificar: `npm --version`)
- [ ] Terminal aberto

### Passo 1: Instalar Supabase CLI
```bash
npm install -g supabase
```
- [ ] Comando executado sem erros
- [ ] Verificar instalação: `supabase --version`

### Passo 2: Fazer Login
```bash
supabase login
```
- [ ] Browser abriu automaticamente
- [ ] Login realizado com sucesso
- [ ] Mensagem de confirmação no terminal

### Passo 3: Linkar ao Projeto
```bash
supabase link --project-ref zxfevlkssljndqqhxkjb
```
- [ ] Projeto linkado com sucesso
- [ ] Mensagem de confirmação exibida

### Passo 4: Deploy da Function
```bash
cd supabase/functions
supabase functions deploy server
```
- [ ] Deploy iniciado
- [ ] Upload do código realizado
- [ ] Deploy concluído com sucesso
- [ ] URL da function exibida

### Passo 5: Testar Health Check
```bash
curl https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/make-server-5ad7fd2c/health \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZmV2bGtzc2xqbmRxcWh4a2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDkxNTcsImV4cCI6MjA3ODIyNTE1N30.cODYFIRpNluf8tUZqyL8y0GC46GCEGxELHVxrKcAH7c"
```
- [ ] Resposta: `{"status":"ok"}`
- [ ] Sem erros 403 ou 404

### ✅ Caminho A Completo!
**Próximo:** Ir para "Configuração do Banco de Dados" abaixo.

---

## 🟡 CAMINHO B: Deploy via Dashboard

### Passo 1: Acessar Supabase
- [ ] Acesse https://app.supabase.com
- [ ] Faça login
- [ ] Selecione projeto: `zxfevlkssljndqqhxkjb`

### Passo 2: Criar Edge Function
- [ ] Menu lateral → **Edge Functions**
- [ ] Clique **New Function**
- [ ] Nome: `server`
- [ ] Clique **Create Function**

### Passo 3: Copiar Código
- [ ] Abra o arquivo `/supabase/functions/server/index.tsx` localmente
- [ ] Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
- [ ] Cole no editor do Supabase Dashboard

### Passo 4: Configurar Variáveis
No dashboard, adicione as variáveis:

- [ ] `SUPABASE_URL` = `https://zxfevlkssljndqqhxkjb.supabase.co`
- [ ] `SUPABASE_ANON_KEY` = (copie de `/utils/supabase/info.tsx`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = (Settings > API > service_role key)

### Passo 5: Deploy
- [ ] Clique **Deploy** no dashboard
- [ ] Aguarde finalizar (~30 seg)
- [ ] Status: **Deployed**

### Passo 6: Testar
- [ ] Vá em **Logs** na function
- [ ] Faça uma requisição de teste (veja Caminho A, Passo 5)
- [ ] Verifique logs - deve aparecer requisição

### ✅ Caminho B Completo!
**Próximo:** Ir para "Configuração do Banco de Dados" abaixo.

---

## 🔵 CAMINHO C: Continuar Modo Mock

### Já Está Funcionando!
- [ ] Sistema já operacional
- [ ] Todos os módulos funcionando
- [ ] Dados mock abundantes

### Ativar Banner de Modo Frontend (Opcional)
Edite `/components/layout/frontend-mode-banner.tsx` (linha 10):
```typescript
const isFrontendMode = true; // Mostrar banner
```
- [ ] Banner ativado (opcional)

### Manter Configurações
**IMPORTANTE:** Não precisa fazer nada! O sistema já funciona.

### Quando Habilitar Backend
Volte aqui e escolha Caminho A ou B quando precisar de:
- Persistência de dados
- Upload real de arquivos
- Múltiplos usuários simultâneos

### ✅ Caminho C Completo!
**Sistema pronto para uso imediato.**

---

## 📦 CONFIGURAÇÃO DO BANCO DE DADOS

### Após Deploy (Caminhos A ou B)

### Passo 1: Acessar SQL Editor
- [ ] Acesse https://app.supabase.com
- [ ] Projeto: `zxfevlkssljndqqhxkjb`
- [ ] Menu lateral → **SQL Editor**
- [ ] Clique **New Query**

### Passo 2: Copiar SQL
- [ ] Abra `/COMANDOS_SUPABASE.md`
- [ ] Role até "SQL para Criar Tabelas"
- [ ] Copie TODO o SQL (incluindo comentários)

### Passo 3: Executar SQL
- [ ] Cole no SQL Editor
- [ ] Clique **Run** (ou Ctrl+Enter)
- [ ] Aguarde conclusão (~5 seg)
- [ ] Verifique: "Success. No rows returned"

### Passo 4: Verificar Tabelas
- [ ] Menu lateral → **Table Editor**
- [ ] Verifique se existe:
  - [ ] `colaboradores`
  - [ ] `clientes`
  - [ ] `tipos_os`
  - [ ] `ordens_servico`
  - [ ] `os_etapas`

### Passo 5: Verificar Tipos de OS
- [ ] Clique na tabela `tipos_os`
- [ ] Deve ter 13 registros (OS-01 até OS-13)
- [ ] Se não tiver, execute novamente o INSERT do SQL

### ✅ Banco Configurado!

---

## 📤 CONFIGURAÇÃO DO STORAGE

### Passo 1: Criar Bucket
- [ ] Menu lateral → **Storage**
- [ ] Clique **New Bucket**
- [ ] Nome: `uploads`
- [ ] Público: **Sim** (para leitura)
- [ ] Clique **Create Bucket**

### Passo 2: Configurar Permissões
- [ ] Clique no bucket `uploads`
- [ ] Vá em **Policies**
- [ ] Adicione política:
  - **Nome:** Public read access
  - **Allowed operation:** SELECT
  - **Policy definition:** `(bucket_id = 'uploads')`

### Passo 3: Teste de Upload
No console do browser (F12), execute:
```javascript
// Teste será adicionado após upload real
console.log('Storage configurado!');
```
- [ ] Sem erros

### ✅ Storage Configurado!

---

## 👥 POPULAR USUÁRIOS DE TESTE

### Via API (Recomendado)
```bash
curl -X POST https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/make-server-5ad7fd2c/seed-usuarios \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZmV2bGtzc2xqbmRxcWh4a2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDkxNTcsImV4cCI6MjA3ODIyNTE1N30.cODYFIRpNluf8tUZqyL8y0GC46GCEGxELHVxrKcAH7c" \
  -H "Content-Type: application/json"
```

- [ ] Comando executado
- [ ] Resposta com `success: true`
- [ ] 5 Usuários criados:
  - [ ] diretoria@minerva.com
  - [ ] gestor.adm@minerva.com
  - [ ] gestor.obras@minerva.com
  - [ ] gestor.assessoria@minerva.com
  - [ ] colaborador@minerva.com

### Verificar Criação
- [ ] Menu lateral → **Authentication** → **Users**
- [ ] Deve ter 5 usuários listados

### ✅ Usuários Criados!

---

## 🧪 TESTE FINAL COMPLETO

### Teste 1: Login
- [ ] Abra o sistema no navegador
- [ ] Faça logout (se estiver logado)
- [ ] Tente login: `colaborador@minerva.com` / `colaborador123`
- [ ] Login bem-sucedido
- [ ] Dashboard carregou

### Teste 2: API
```javascript
// No console do browser (F12)
fetch('https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/make-server-5ad7fd2c/clientes', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
  .then(r => r.json())
  .then(console.log);
```
- [ ] Resposta: array (vazio ou com dados)
- [ ] Sem erro 403 ou 500

### Teste 3: Criar Cliente
```javascript
// No console do browser (F12)
fetch('https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/make-server-5ad7fd2c/clientes', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGci...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nome: 'Teste Cliente',
    email: 'teste@example.com',
    tipo: 'LEAD',
    status: 'LEAD'
  })
})
  .then(r => r.json())
  .then(console.log);
```
- [ ] Cliente criado
- [ ] Resposta com ID do cliente

### ✅ TESTES PASSARAM!

---

## 🎉 DEPLOY COMPLETO!

### Checklist Final

- [ ] Edge Function deployada
- [ ] Health check respondendo
- [ ] Banco de dados configurado
- [ ] Tabelas criadas
- [ ] Storage bucket criado
- [ ] Usuários populados
- [ ] Testes passaram

### Sistema Está Agora:
✅ Backend funcionando  
✅ Dados persistem  
✅ Upload de arquivos real  
✅ Autenticação funcionando  
✅ Múltiplos usuários  
✅ Pronto para produção  

---

## 📚 Próximos Passos

### Uso Normal
1. Fazer login com qualquer usuário de teste
2. Navegar pelos módulos
3. Criar OS, clientes, leads
4. Upload de documentos
5. Aprovar etapas

### Desenvolvimento
1. Adicionar novos recursos
2. Customizar workflows
3. Integrar com APIs externas
4. Criar relatórios

### Produção
1. Trocar usuários de teste por reais
2. Configurar domínio customizado
3. Configurar backup
4. Monitorar logs

---

## ❓ PROBLEMAS?

### Erro 403 Ainda Aparece
→ Veja `/SOLUCAO_ERRO_403.md`

### Tabelas Não Aparecem
→ Re-execute SQL do `/COMANDOS_SUPABASE.md`

### Login Não Funciona
→ Verifique se executou `/seed-usuarios`

### Outros Erros
→ Veja `/docs/TROUBLESHOOTING.md`

---

**Data:** 17/11/2025  
**Sistema:** ERP Minerva Engenharia  
**Versão:** 1.0.0
