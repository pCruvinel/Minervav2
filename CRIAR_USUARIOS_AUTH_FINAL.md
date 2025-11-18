# 🎯 CRIAR USUÁRIOS AUTH - Instruções Finais

**Data:** 18/11/2025
**Status:** Pronto para execução
**Tempo estimado:** 10 minutos

---

## ✅ MIGRATIONS JÁ EXECUTADAS

As seguintes migrations foram executadas com sucesso via MCP Supabase:

- ✅ **Tabela delegacoes** criada (12 colunas, 7 políticas RLS)
- ✅ **Tabela turnos** criada (13 colunas, 2 políticas RLS)
- ✅ **Tabela agendamentos** criada (17 colunas, 4 políticas RLS)
- ✅ **5 turnos** de exemplo criados
- ✅ **6 agendamentos** de exemplo criados
- ✅ **5 colaboradores** já possuem emails @minervaestrutura.com.br

---

## 📋 PRÓXIMO PASSO: CRIAR USUÁRIOS AUTH

Acesse o Supabase Dashboard para criar os usuários de autenticação:

**URL:** https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb/auth/users

---

## 👥 USUÁRIOS PARA CRIAR

### Usuário 1: Diretor
```
Email: carlos.diretor@minervaestrutura.com.br
Password: minerva123
User UID (Advanced): 3acbed3a-7254-42b6-8a1b-9ad8a7d3da5d
☑️ Auto Confirm User
```

### Usuário 2: Gestora ADM
```
Email: maria.gestorassessoria@minervaestrutura.com.br
Password: minerva123
User UID (Advanced): af3cfe56-ed73-4aa1-a645-4f5578d10d90
☑️ Auto Confirm User
```

### Usuário 3: Gestora Setor
```
Email: paula.gestoraassessoria@minervaestrutura.com.br
Password: minerva123
User UID (Advanced): b615102c-e889-4384-aae4-bdcecfbaba7c
☑️ Auto Confirm User
```

### Usuário 4: João (Colaborador)
```
Email: joao.gestorobras@minervaestrutura.com.br
Password: minerva123
User UID (Advanced): ef01a82d-5f20-479d-af42-3a8996313023
☑️ Auto Confirm User
```

### Usuário 5: Ana (Colaboradora)
```
Email: ana.colaboradora@minervaestrutura.com.br
Password: minerva123
User UID (Advanced): 3bbc2217-2adc-4404-a9d5-4004182e11bb
☑️ Auto Confirm User
```

---

## 🔧 COMO CRIAR CADA USUÁRIO

1. Clique em **"Add user"** → **"Create new user"**
2. Preencha:
   - Email
   - Password
   - ☑️ **Marque** "Auto Confirm User"
3. Clique em **"Advanced"** para expandir
4. Cole o **User UID** correspondente
5. Clique em **"Create user"**
6. Repita para os próximos usuários

---

## ✅ VERIFICAÇÃO APÓS CRIAR OS USUÁRIOS

Execute este SQL no SQL Editor para verificar:

```sql
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  c.nome_completo,
  c.role_nivel
FROM auth.users u
INNER JOIN colaboradores c ON c.id = u.id
WHERE u.email LIKE '%@minervaestrutura.com.br'
ORDER BY c.role_nivel;
```

**Resultado esperado:** 5 linhas mostrando a sincronização entre auth.users e colaboradores

---

## 🎉 TESTE DE LOGIN

Após criar os usuários, teste o login:

**URL da aplicação:** http://localhost:3000 (ou onde o app estiver rodando)

**Credenciais de teste:**
- Email: `carlos.diretor@minervaestrutura.com.br`
- Senha: `minerva123`

---

## 📊 RESUMO DO QUE FOI IMPLEMENTADO

### 1. Sistema de Delegações
- Tabela `delegacoes` com 12 colunas
- 7 políticas RLS (delegante, delegado, diretoria)
- Trigger de updated_at
- Validações: auto-delegação proibida, descrição mínima 10 chars

### 2. Sistema de Calendário
- Tabela `turnos` com recorrência (todos/úteis/custom)
- Tabela `agendamentos` com status (confirmado/cancelado/realizado/ausente)
- 2 funções auxiliares:
  - `verificar_vagas_turno()` - verifica disponibilidade
  - `obter_turnos_disponiveis()` - lista turnos disponíveis por data
- 13 índices para performance
- 6 políticas RLS

### 3. Dados de Exemplo
- 5 turnos configurados (manhã/tarde, diferentes setores)
- 6 agendamentos de exemplo (hoje, amanhã, depois de amanhã)

---

## 🚨 IMPORTANTE

⚠️ **NÃO COMPARTILHE** as senhas em produção!
   Use senhas fortes e únicas para cada usuário.

⚠️ Os **User UIDs** devem corresponder EXATAMENTE aos IDs dos colaboradores
   caso contrário a sincronização não funcionará.

---

**Versão:** 1.0
**Projeto:** Minerva v2
**Banco:** zxfevlkssljndqqhxkjb (MinervaV2)
