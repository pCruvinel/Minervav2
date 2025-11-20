# ✅ Checklist de Execução - Migrations Minerva v2

**Data:** ___/___/_____
**Executor:** _________________
**Tempo início:** _____:_____
**Tempo fim:** _____:_____

---

## 📋 ANTES DE COMEÇAR

- [ ] Fiz backup do banco de dados
- [ ] Tenho acesso ao Dashboard do Supabase
- [ ] Li o arquivo `EXECUTAR_AGORA.md`
- [ ] Tenho os arquivos SQL abertos no VS Code

---

## 🎯 ETAPA 1: Delegações

**Arquivo:** `create_delegacoes_table.sql`

- [ ] Abri o arquivo no VS Code
- [ ] Copiei TODO o conteúdo (Ctrl+A, Ctrl+C)
- [ ] Acessei o SQL Editor do Supabase
- [ ] Colei o SQL (Ctrl+V)
- [ ] Cliquei em **Run**
- [ ] Vi mensagem: "Success. No rows returned"
- [ ] Executei query de verificação
- [ ] Resultado: `total_colunas: 13` ✅

**Problemas encontrados:**
_________________________________________________________________
_________________________________________________________________

---

## 🎯 ETAPA 2: Preparar Colaboradores

**Arquivo:** `seed_auth_users_CORRIGIDO.sql`

- [ ] Abri o arquivo no VS Code
- [ ] Copiei TODO o conteúdo
- [ ] Deletei SQL anterior do editor
- [ ] Colei o novo SQL
- [ ] Cliquei em **Run**
- [ ] Vi mensagem: "✅ Colaborador Diretoria atualizado"
- [ ] Vi mensagem: "✅ Gestor Administrativo atualizado"
- [ ] Vi mensagem: "✅ Gestor Assessoria atualizado"
- [ ] Vi mensagem: "✅ Gestor Obras atualizado"
- [ ] Vi mensagem: "✅ Colaborador Administrativo atualizado"
- [ ] Vi mensagem: "✅ Colaborador Assessoria atualizado"
- [ ] Executei query de verificação
- [ ] Resultado: 6 colaboradores com IDs corretos ✅

**Problemas encontrados:**
_________________________________________________________________
_________________________________________________________________

---

## 🎯 ETAPA 3: Criar Usuários Auth [MANUAL]

**URL:** https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb/auth/users

### Usuário 1: Diretoria
- [ ] Cliquei em "Add user" → "Create new user"
- [ ] Email: `carlos.diretor@minervaestrutura.com.br`
- [ ] Password: `minerva123`
- [ ] ☑️ Marquei "Auto Confirm User"
- [ ] Expandi "Advanced"
- [ ] User UID: `user-dir-001`
- [ ] Cliquei em "Create user"
- [ ] Usuário apareceu na lista ✅

### Usuário 2: Gestor Administrativo
- [ ] Email: `pedro.gestorcomercial@minervaestrutura.com.br`
- [ ] Password: `minerva123`
- [ ] ☑️ Auto Confirm User
- [ ] User UID: `user-gcom-001`
- [ ] Criado com sucesso ✅

### Usuário 3: Gestor Assessoria
- [ ] Email: `maria.gestorassessoria@minervaestrutura.com.br`
- [ ] Password: `minerva123`
- [ ] ☑️ Auto Confirm User
- [ ] User UID: `user-gass-001`
- [ ] Criado com sucesso ✅

### Usuário 4: Gestor Obras
- [ ] Email: `joao.gestorobras@minervaestrutura.com.br`
- [ ] Password: `minerva123`
- [ ] ☑️ Auto Confirm User
- [ ] User UID: `user-gobr-001`
- [ ] Criado com sucesso ✅

### Usuário 5: Colaborador Administrativo
- [ ] Email: `ana.colabc@minervaestrutura.com.br`
- [ ] Password: `minerva123`
- [ ] ☑️ Auto Confirm User
- [ ] User UID: `user-ccom-001`
- [ ] Criado com sucesso ✅

### Usuário 6: Colaborador Assessoria
- [ ] Email: `bruno.colaba@minervaestrutura.com.br`
- [ ] Password: `minerva123`
- [ ] ☑️ Auto Confirm User
- [ ] User UID: `user-cass-001`
- [ ] Criado com sucesso ✅

### Verificação
- [ ] Executei query de verificação
- [ ] Resultado: `total_usuarios: 6` ✅
- [ ] Executei query de sincronização
- [ ] Resultado: 6 linhas com email, nome e cargo ✅

**Problemas encontrados:**
_________________________________________________________________
_________________________________________________________________

---

## 🎯 ETAPA 4: Sistema de Calendário

**Arquivo:** `create_calendario_tables.sql`

- [ ] Abri o arquivo no VS Code
- [ ] Copiei TODO o conteúdo
- [ ] Deletei SQL anterior do editor
- [ ] Colei o novo SQL
- [ ] Cliquei em **Run**
- [ ] Vi mensagem: "Success. No rows returned"
- [ ] Executei query de verificação (tabelas)
- [ ] Resultado: 2 tabelas (agendamentos, turnos) ✅
- [ ] Executei query de verificação (funções)
- [ ] Resultado: 3 funções ✅

**Problemas encontrados:**
_________________________________________________________________
_________________________________________________________________

---

## 🎯 ETAPA 5: Dados de Exemplo [OPCIONAL]

**Arquivo:** `seed_calendario_data.sql`

- [ ] Decidi executar dados de exemplo
- [ ] Abri o arquivo no VS Code
- [ ] Copiei TODO o conteúdo
- [ ] Deletei SQL anterior do editor
- [ ] Colei o novo SQL
- [ ] Cliquei em **Run**
- [ ] Vi mensagem: "Seed de calendário concluído com sucesso!"
- [ ] Vi mensagem: "Turnos criados: 5"
- [ ] Vi mensagem: "Agendamentos criados: 6"
- [ ] Executei query de verificação
- [ ] Resultado: turnos_ativos: 5, agendamentos_confirmados: 6 ✅

**OU**

- [ ] Decidi NÃO executar dados de exemplo
- [ ] Pularei esta etapa

**Problemas encontrados:**
_________________________________________________________________
_________________________________________________________________

---

## ✅ VERIFICAÇÃO FINAL

- [ ] Executei query de "Resumo completo"
- [ ] Tabelas Criadas: 3 ✅
- [ ] Usuários Auth: 6 ✅
- [ ] Colaboradores Sincronizados: 6 ✅
- [ ] Turnos Ativos: 5 ✅ (ou 0 se pulou etapa 5)
- [ ] Agendamentos: 6 ✅ (ou 0 se pulou etapa 5)
- [ ] Políticas RLS: 13 ✅

**Todos os valores conferiram?**
- [ ] SIM - Tudo OK! 🎉
- [ ] NÃO - Ver seção de problemas abaixo

---

## 🧪 TESTES FINAIS

### Teste 1: Login no Sistema
- [ ] Abri o sistema Minerva v2
- [ ] Fui para página de login
- [ ] Email: `carlos.diretor@minervaestrutura.com.br`
- [ ] Senha: `minerva123`
- [ ] Cliquei em "Entrar"
- [ ] Login bem-sucedido ✅
- [ ] Nome e cargo apareceram corretamente ✅

**Resultado:**
- [ ] ✅ Funcionou perfeitamente
- [ ] ⚠️ Funcionou parcialmente
- [ ] ❌ Não funcionou

**Detalhes:**
_________________________________________________________________
_________________________________________________________________

### Teste 2: Delegação de Tarefa
- [ ] Logado como gestor
- [ ] Abri uma Ordem de Serviço
- [ ] Cliquei em "Delegar Tarefa"
- [ ] Selecionei um colaborador
- [ ] Preenchí descrição (mín. 10 caracteres)
- [ ] Selecionei data de prazo
- [ ] Cliquei em "Delegar"
- [ ] Vi toast: "Tarefa delegada com sucesso!" ✅
- [ ] Verifiquei no banco (query abaixo)

```sql
SELECT * FROM delegacoes ORDER BY created_at DESC LIMIT 1;
```

- [ ] Delegação apareceu no banco ✅

**Resultado:**
- [ ] ✅ Funcionou perfeitamente
- [ ] ⚠️ Funcionou parcialmente
- [ ] ❌ Não funcionou

**Detalhes:**
_________________________________________________________________
_________________________________________________________________

### Teste 3: Calendário
- [ ] Acessei página de calendário
- [ ] Vi turnos listados ✅
- [ ] Tentei criar agendamento
- [ ] Agendamento foi criado ✅
- [ ] Verifiquei disponibilidade de vagas
- [ ] Vagas atualizaram corretamente ✅

**Resultado:**
- [ ] ✅ Funcionou perfeitamente
- [ ] ⚠️ Funcionou parcialmente
- [ ] ❌ Não funcionou
- [ ] ➖ Não testei

**Detalhes:**
_________________________________________________________________
_________________________________________________________________

---

## 📊 RESUMO DA EXECUÇÃO

**Tempo total:** _______ minutos

**Etapas completadas:**
- [ ] Etapa 1: Delegações
- [ ] Etapa 2: Preparar Colaboradores
- [ ] Etapa 3: Criar Usuários Auth
- [ ] Etapa 4: Sistema de Calendário
- [ ] Etapa 5: Dados de Exemplo (opcional)

**Testes realizados:**
- [ ] Teste de Login
- [ ] Teste de Delegação
- [ ] Teste de Calendário

**Status final:**
- [ ] ✅ 100% Completo - Tudo funcionando
- [ ] ⚠️ Parcialmente completo - Ver notas
- [ ] ❌ Incompleto - Ver problemas

---

## 📝 NOTAS E OBSERVAÇÕES

### Problemas encontrados:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

### Soluções aplicadas:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

### Pendências:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

## ✍️ ASSINATURA

**Executor:** _________________
**Data:** ___/___/_____
**Hora:** _____:_____

**Validado por:** _________________
**Data:** ___/___/_____

---

**Arquivo:** CHECKLIST_MIGRATIONS.md
**Versão:** 1.0
**Projeto:** Minerva v2
