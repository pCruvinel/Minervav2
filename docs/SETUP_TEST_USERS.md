# Setup de Usuários de Teste - Minerva v2

## 📋 Visão Geral

Este documento descreve como configurar os 5 usuários de teste para desenvolvimento e testes da plataforma Minerva v2.

**Status:** ⚠️ **AÇÃO MANUAL NECESSÁRIA**

Os usuários precisam ser criados manualmente no Supabase Dashboard porque a criação via SQL não é permitida por segurança.

---

## 🚀 Processo Completo (Passo a Passo)

### **PASSO 1: Aplicar Migrations** ✅

Estas migrations corrigem ENUMs desatualizados, RLS policies e preparam a estrutura.

```bash
# Na raiz do projeto
npx supabase db push
```

**O que acontece:**
- ✅ Enum `COMERCIAL` renomeado para `ADMINISTRATIVO`
- ✅ Enum `GESTOR_COMERCIAL` renomeado para `GESTOR_ADMINISTRATIVO`
- ✅ Enum `COLABORADOR_COMERCIAL` renomeado para `COLABORADOR_ADMINISTRATIVO`
- ✅ RLS policies simplificadas (sem recursão infinita)
- ✅ Trigger automático `on_auth_user_created` DESABILITADO
- ✅ Funções auxiliares criadas: `upsert_colaborador_if_auth_exists()`, `sync_all_test_users()` e `sync_single_user()`
- ⚠️ Tentativa de criar colaboradores (provavelmente falhará porque usuários ainda não existem)

**IMPORTANTE:** O trigger automático foi desabilitado para evitar erros ao criar usuários manualmente. Agora você precisa sincronizar manualmente após criar os usuários.

---

### **PASSO 2: Criar Usuários no Supabase Dashboard** 🔐

**URL:** https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb/auth/users

#### 2.1. Acessar Authentication

1. Abra o Supabase Dashboard
2. Selecione o projeto: **zxfevlkssljndqqhxkjb**
3. No menu lateral, clique em **Authentication**
4. Clique na aba **Users**

#### 2.2. Adicionar os 5 Usuários

Para cada usuário abaixo, clique em **"Add User"** e preencha:

---

**👤 Usuário 1: Diretor**
```
Email: diretor@minerva.com
Password: minerva123
☑️ Auto Confirm User: SIM (marcar checkbox)
```
- Role no sistema: DIRETORIA
- Setor: ADMINISTRATIVO
- Acesso total ao sistema

---

**👤 Usuário 2: Assessoria**
```
Email: assesoria@minerva.com
Password: minerva123
☑️ Auto Confirm User: SIM
```
- Role no sistema: GESTOR_ASSESSORIA
- Setor: ASSESSORIA
- Gerencia assessoria técnica

**⚠️ Nota:** O email tem "assesoria" (com um 's') conforme solicitado.

---

**👤 Usuário 3: Administrativo**
```
Email: administrativo@minerva.com
Password: minerva123
☑️ Auto Confirm User: SIM
```
- Role no sistema: GESTOR_ADMINISTRATIVO
- Setor: ADMINISTRATIVO
- Gerencia área administrativa/comercial

---

**👤 Usuário 4: Obras**
```
Email: obras@minerva.com
Password: minerva123
☑️ Auto Confirm User: SIM
```
- Role no sistema: GESTOR_OBRAS
- Setor: OBRAS
- Gerencia execução de obras

---

**👤 Usuário 5: Colaborador**
```
Email: colaborador@minerva.com
Password: minerva123
☑️ Auto Confirm User: SIM
```
- Role no sistema: COLABORADOR_ADMINISTRATIVO
- Setor: ADMINISTRATIVO
- Colaborador operacional

---

### **PASSO 3: Sincronizar com Tabela Colaboradores** 🔄

⚠️ **IMPORTANTE:** Com o trigger automático desabilitado, você DEVE sincronizar manualmente.

Após criar os 5 usuários no Dashboard, execute esta query no SQL Editor:

**URL:** https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb/sql/new

**Opção 1: Sincronizar TODOS os 5 usuários de teste de uma vez:**

```sql
SELECT * FROM public.sync_all_test_users();
```

**Resultado esperado:**
```
OK: Colaborador diretor@minerva.com inserido/atualizado com sucesso (UUID: ...)
OK: Colaborador assesoria@minerva.com inserido/atualizado com sucesso (UUID: ...)
OK: Colaborador administrativo@minerva.com inserido/atualizado com sucesso (UUID: ...)
OK: Colaborador obras@minerva.com inserido/atualizado com sucesso (UUID: ...)
OK: Colaborador colaborador@minerva.com inserido/atualizado com sucesso (UUID: ...)
```

**Opção 2: Sincronizar usuários individuais (útil para novos usuários):**

```sql
-- Sincronizar um usuário específico
SELECT public.sync_single_user('diretor@minerva.com');
```

Esta função cria o colaborador com dados padrão extraídos do email. Você pode atualizar os dados depois.

Se vir mensagens "SKIP", significa que alguns usuários não foram criados no Dashboard.

---

### **PASSO 4: Verificar Sincronização** ✅

Execute esta query para confirmar que tudo está correto:

```sql
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  c.nome_completo,
  c.role_nivel,
  c.setor,
  c.ativo
FROM auth.users u
LEFT JOIN public.colaboradores c ON c.id = u.id
WHERE u.email LIKE '%@minerva.com'
ORDER BY
  CASE c.role_nivel
    WHEN 'DIRETORIA' THEN 1
    WHEN 'GESTOR_ASSESSORIA' THEN 2
    WHEN 'GESTOR_ADMINISTRATIVO' THEN 3
    WHEN 'GESTOR_OBRAS' THEN 4
    ELSE 5
  END;
```

**Resultado esperado:** 5 linhas com todos os campos preenchidos

| email | nome_completo | role_nivel | setor | ativo |
|-------|---------------|------------|-------|-------|
| diretor@minerva.com | Diretor Sistema Minerva | DIRETORIA | ADMINISTRATIVO | true |
| assesoria@minerva.com | Gestor Assessoria Técnica | GESTOR_ASSESSORIA | ASSESSORIA | true |
| administrativo@minerva.com | Gestor Administrativo | GESTOR_ADMINISTRATIVO | ADMINISTRATIVO | true |
| obras@minerva.com | Gestor de Obras | GESTOR_OBRAS | OBRAS | true |
| colaborador@minerva.com | Colaborador Administrativo | COLABORADOR_ADMINISTRATIVO | ADMINISTRATIVO | true |

---

### **PASSO 5: Testar Login** 🧪

Abra a aplicação e teste cada usuário:

```bash
npm run dev
```

Acesse: http://localhost:3000/login

**Credenciais para teste:**

| Email | Senha | Acesso |
|-------|-------|--------|
| diretor@minerva.com | minerva123 | Dashboard Diretoria |
| assesoria@minerva.com | minerva123 | Dashboard Assessoria |
| administrativo@minerva.com | minerva123 | Dashboard Administrativo |
| obras@minerva.com | minerva123 | Dashboard Obras |
| colaborador@minerva.com | minerva123 | Dashboard Colaborador |

**O que testar:**
- ✅ Login bem-sucedido sem erro "Database error"
- ✅ Nome do usuário aparece no header
- ✅ Sidebar mostra menus corretos para cada role
- ✅ Redirecionamento para dashboard apropriado

---

## 🔧 Troubleshooting

### Erro: "null value in column 'nome_completo' violates not-null constraint"

**Causa:** Trigger automático antigo tentando criar colaborador sem dados completos

**Solução:**
1. Aplique a migration `20251121000013_fix_handle_new_user_trigger.sql`
2. Execute: `npx supabase db push`
3. O trigger será desabilitado automaticamente
4. Tente criar o usuário novamente no Dashboard
5. Depois sincronize manualmente: `SELECT * FROM public.sync_all_test_users();`

---

### Erro: "Database error querying schema"

**Causa:** Usuários não existem em `auth.users` OU não foram sincronizados com `colaboradores`

**Solução:**
1. Verifique se criou os 5 usuários no Dashboard: `SELECT * FROM auth.users WHERE email LIKE '%@minerva.com';`
2. Se retornar 0 linhas, volte ao PASSO 2
3. Se retornar linhas mas login falha, execute sincronização: `SELECT * FROM public.sync_all_test_users();`

---

### Erro: "User not found" ao logar

**Causa:** Usuário existe em `auth.users` mas não em `colaboradores`

**Solução:**
1. Execute sincronização manual: `SELECT * FROM public.sync_all_test_users();`
2. Verifique sincronização: query do PASSO 4
3. Se o problema persistir, tente sincronizar individualmente: `SELECT public.sync_single_user('seu-email@minerva.com');`

---

### Alguns usuários não sincronizam

**Causa:** Typos nos emails ou emails diferentes

**Solução:**
```sql
-- Ver quais usuários existem em auth.users
SELECT id, email FROM auth.users WHERE email LIKE '%@minerva.com';

-- Ver quais colaboradores existem
SELECT id, email FROM public.colaboradores WHERE email LIKE '%@minerva.com';

-- Encontrar dessincronia
SELECT u.email as auth_email
FROM auth.users u
LEFT JOIN public.colaboradores c ON c.id = u.id
WHERE u.email LIKE '%@minerva.com'
AND c.id IS NULL;
```

---

## 📊 Estrutura de Permissões

### Hierarquia de Roles

```
DIRETORIA (diretor@minerva.com)
  ├── Acesso total
  ├── Pode ver todos os setores
  └── Aprova ações de todos os gestores

GESTOR_ASSESSORIA (assesoria@minerva.com)
  ├── Gerencia assessoria técnica
  ├── Cria/edita laudos e relatórios
  └── Coordena vistorias

GESTOR_ADMINISTRATIVO (administrativo@minerva.com)
  ├── Gerencia área comercial/administrativa
  ├── Cria OSs comerciais (OS-01 a OS-04)
  └── Gerencia propostas e contratos

GESTOR_OBRAS (obras@minerva.com)
  ├── Gerencia execução de obras
  ├── Coordena equipes de campo
  └── Aprova etapas de obra

COLABORADOR_ADMINISTRATIVO (colaborador@minerva.com)
  ├── Executa tarefas operacionais
  ├── Preenche formulários
  └── Acompanha OSs designadas
```

---

## 🔒 Segurança

**Senhas Padrão:** `minerva123`

⚠️ **IMPORTANTE:** Estas credenciais são apenas para **DESENVOLVIMENTO**.

**Para PRODUÇÃO:**
1. Use senhas fortes e únicas
2. Habilite autenticação de dois fatores (2FA)
3. Rotacione senhas periodicamente
4. Use gerenciador de senhas

---

## 📝 Notas Técnicas

### Por que não criar usuários via SQL?

O Supabase Auth usa hashing bcrypt para senhas e gerencia tokens JWT internamente. A criação de usuários via SQL não é recomendada porque:

1. **Segurança:** Senhas devem ser hasheadas pelo auth service
2. **Tokens:** JWT e refresh tokens são gerenciados automaticamente
3. **Triggers:** Auth hooks e triggers executam apenas via API
4. **Auditoria:** Logs de auth ficam consistentes

### Por que desabilitar o trigger automático?

**Problema:** O trigger `on_auth_user_created` tentava criar registros em `colaboradores` automaticamente, mas:
1. Supabase Dashboard não envia metadata customizado ao criar usuários
2. Isso resultava em valores NULL para `nome_completo`, causando erro de constraint
3. Não havia controle sobre role_nivel e setor atribuídos

**Solução:** Desabilitar trigger e usar sincronização manual controlada.

### Função sync_all_test_users()

Esta função pode ser re-executada quantas vezes quiser:
- É **idempotente** (pode executar múltiplas vezes sem efeitos colaterais)
- Usa `ON CONFLICT DO UPDATE` para atualizar registros existentes
- Retorna status para cada usuário
- Permite controle total sobre os dados inseridos

### Função sync_single_user(email)

Nova função para sincronizar usuários individuais:
- Útil quando você cria novos usuários no Dashboard
- Extrai nome do email automaticamente
- Define valores padrão: role=COLABORADOR_ADMINISTRATIVO, setor=ADMINISTRATIVO
- Você pode atualizar os dados depois com UPDATE manual

---

## ✅ Checklist Final

Antes de considerar o setup completo, verifique:

- [ ] Migration aplicada com sucesso (`npx supabase db push`)
- [ ] 5 usuários criados no Dashboard do Supabase
- [ ] Função `sync_all_test_users()` executada
- [ ] Query de verificação retorna 5 linhas com dados completos
- [ ] Login testado com pelo menos 3 usuários diferentes
- [ ] Nenhum erro "Database error querying schema"
- [ ] Sidebars e menus carregam corretamente para cada role

---

## 📞 Suporte

Se encontrar problemas:

1. Consulte a seção **Troubleshooting** acima
2. Verifique logs no Console do navegador (F12)
3. Verifique logs no Supabase Dashboard → Logs
4. Execute queries de diagnóstico SQL fornecidas neste documento

---

**Última atualização:** 2025-11-21
**Migrations relacionadas:**
- `20251121000011_setup_test_users.sql` (corrige ENUMs e cria funções de sync)
- `20251121000012_fix_infinite_recursion_rls.sql` (corrige RLS policies)
- `20251121000013_fix_handle_new_user_trigger.sql` (desabilita trigger automático)
**Versão:** 2.0
