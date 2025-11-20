# 🚀 EXECUTAR AGORA - Migrations Minerva v2

**Tempo estimado:** 15-20 minutos
**Método:** Copiar e colar no Supabase Dashboard

---

## 📍 ACESSO

**URL do SQL Editor:**
https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb/sql/new

**URL do Authentication:**
https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb/auth/users

---

## 🎯 ETAPA 1: Delegações (30 segundos)

### 1.1 Executar SQL

**Arquivo:** `supabase/migrations/create_delegacoes_table.sql`

**Ação:**
1. Abra o arquivo no VS Code
2. Selecione tudo (Ctrl+A)
3. Copie (Ctrl+C)
4. Acesse o SQL Editor (link acima)
5. Cole (Ctrl+V)
6. Clique em **Run** (ou Ctrl+Enter)

### 1.2 Verificar

Cole e execute este SQL:

```sql
SELECT COUNT(*) as total_colunas
FROM information_schema.columns
WHERE table_name = 'delegacoes';
```

**✅ Esperado:** `total_colunas: 13`

Se deu erro, veja seção "Problemas" no final.

---

## 🎯 ETAPA 2: Preparar Colaboradores (15 segundos)

### 2.1 Executar SQL

**Arquivo:** `supabase/migrations/seed_auth_users_CORRIGIDO.sql`

**Ação:**
1. Abra o arquivo no VS Code
2. Selecione tudo (Ctrl+A)
3. Copie (Ctrl+C)
4. No SQL Editor, delete o SQL anterior
5. Cole (Ctrl+V)
6. Clique em **Run**

### 2.2 Verificar

Você deve ver estas mensagens no output:

```
NOTICE: ✅ Colaborador Diretoria atualizado
NOTICE: ✅ Gestor Administrativo atualizado
NOTICE: ✅ Gestor Assessoria atualizado
NOTICE: ✅ Gestor Obras atualizado
NOTICE: ✅ Colaborador Administrativo atualizado
NOTICE: ✅ Colaborador Assessoria atualizado
NOTICE: 📋 IDs dos colaboradores atualizados!
```

Cole e execute este SQL:

```sql
SELECT id, email, nome_completo
FROM colaboradores
WHERE email LIKE '%@minervaestrutura.com.br'
ORDER BY role_nivel DESC;
```

**✅ Esperado:** 6 linhas com IDs começando com "user-"

---

## 🎯 ETAPA 3: Criar Usuários Auth (10 minutos)

⚠️ **Esta etapa é MANUAL via Dashboard**

### 3.1 Acessar

Abra: https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb/auth/users

### 3.2 Criar Usuário 1

1. Clique em **"Add user"** (canto superior direito)
2. Selecione **"Create new user"**
3. Preencha:

```
Email: carlos.diretor@minervaestrutura.com.br
Password: minerva123
☑️ Auto Confirm User (MARCAR!)
```

4. Expanda **"Advanced"** (clique na setinha)
5. No campo **"User UID"**, cole: `user-dir-001`
6. Clique em **"Create user"**

### 3.3 Criar Usuário 2

Repita o processo com:

```
Email: pedro.gestorcomercial@minervaestrutura.com.br
Password: minerva123
☑️ Auto Confirm User
User UID: user-gcom-001
```

### 3.4 Criar Usuário 3

```
Email: maria.gestorassessoria@minervaestrutura.com.br
Password: minerva123
☑️ Auto Confirm User
User UID: user-gass-001
```

### 3.5 Criar Usuário 4

```
Email: joao.gestorobras@minervaestrutura.com.br
Password: minerva123
☑️ Auto Confirm User
User UID: user-gobr-001
```

### 3.6 Criar Usuário 5

```
Email: ana.colabc@minervaestrutura.com.br
Password: minerva123
☑️ Auto Confirm User
User UID: user-ccom-001
```

### 3.7 Criar Usuário 6

```
Email: bruno.colaba@minervaestrutura.com.br
Password: minerva123
☑️ Auto Confirm User
User UID: user-cass-001
```

### 3.8 Verificar

Volte ao SQL Editor e execute:

```sql
SELECT COUNT(*) as total_usuarios
FROM auth.users
WHERE email LIKE '%@minervaestrutura.com.br';
```

**✅ Esperado:** `total_usuarios: 6`

Verificar sincronização:

```sql
SELECT
  u.email,
  c.nome_completo,
  c.role_nivel
FROM auth.users u
INNER JOIN colaboradores c ON c.id = u.id
WHERE u.email LIKE '%@minervaestrutura.com.br'
ORDER BY c.role_nivel DESC;
```

**✅ Esperado:** 6 linhas mostrando email, nome e cargo

---

## 🎯 ETAPA 4: Sistema de Calendário (45 segundos)

### 4.1 Executar SQL

**Arquivo:** `supabase/migrations/create_calendario_tables.sql`

**Ação:**
1. Abra o arquivo no VS Code
2. Selecione tudo (Ctrl+A)
3. Copie (Ctrl+C)
4. No SQL Editor, delete o SQL anterior
5. Cole (Ctrl+V)
6. Clique em **Run**

### 4.2 Verificar

Cole e execute:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('turnos', 'agendamentos')
ORDER BY table_name;
```

**✅ Esperado:** 2 linhas (agendamentos, turnos)

Verificar funções:

```sql
SELECT proname
FROM pg_proc
WHERE proname IN ('verificar_vagas_turno', 'obter_turnos_disponiveis', 'atualizar_timestamp_calendario');
```

**✅ Esperado:** 3 linhas

---

## 🎯 ETAPA 5: Dados de Exemplo [OPCIONAL] (15 segundos)

### 5.1 Executar SQL

**Arquivo:** `supabase/migrations/seed_calendario_data.sql`

**Ação:**
1. Abra o arquivo no VS Code
2. Selecione tudo (Ctrl+A)
3. Copie (Ctrl+C)
4. No SQL Editor, delete o SQL anterior
5. Cole (Ctrl+V)
6. Clique em **Run**

### 5.2 Verificar

Você deve ver:

```
NOTICE: Seed de calendário concluído com sucesso!
NOTICE: ========================================
NOTICE: RESUMO DO SEED:
NOTICE: ========================================
NOTICE: Turnos criados: 5
NOTICE: Agendamentos criados: 6
NOTICE: ========================================
```

Cole e execute:

```sql
SELECT
  (SELECT COUNT(*) FROM turnos WHERE ativo = true) as turnos_ativos,
  (SELECT COUNT(*) FROM agendamentos WHERE status = 'confirmado') as agendamentos_confirmados;
```

**✅ Esperado:**
- turnos_ativos: 5
- agendamentos_confirmados: 6

---

## ✅ VERIFICAÇÃO FINAL

Cole e execute este SQL para verificar tudo:

```sql
-- Resumo completo de todas as migrations
SELECT
  'Tabelas Criadas' as categoria,
  COUNT(*)::text as valor
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('delegacoes', 'turnos', 'agendamentos')

UNION ALL

SELECT
  'Usuários Auth',
  COUNT(*)::text
FROM auth.users
WHERE email LIKE '%@minervaestrutura.com.br'

UNION ALL

SELECT
  'Colaboradores Sincronizados',
  COUNT(*)::text
FROM auth.users u
INNER JOIN colaboradores c ON c.id = u.id
WHERE u.email LIKE '%@minervaestrutura.com.br'

UNION ALL

SELECT
  'Turnos Ativos',
  COUNT(*)::text
FROM turnos
WHERE ativo = true

UNION ALL

SELECT
  'Agendamentos',
  COUNT(*)::text
FROM agendamentos

UNION ALL

SELECT
  'Políticas RLS',
  COUNT(*)::text
FROM pg_policies
WHERE tablename IN ('delegacoes', 'turnos', 'agendamentos');
```

**✅ Resultado esperado:**

| categoria | valor |
|-----------|-------|
| Tabelas Criadas | 3 |
| Usuários Auth | 6 |
| Colaboradores Sincronizados | 6 |
| Turnos Ativos | 5 |
| Agendamentos | 6 |
| Políticas RLS | 13 |

---

## 🎉 PRONTO!

Se todos os valores acima conferirem, você completou com sucesso!

### Próximos passos:

1. **Testar Login no Sistema**
   - Email: `carlos.diretor@minervaestrutura.com.br`
   - Senha: `minerva123`

2. **Testar Delegação**
   - Abrir uma OS
   - Clicar em "Delegar Tarefa"
   - Preencher formulário
   - Verificar que salva no banco

3. **Testar Calendário**
   - Ver turnos disponíveis
   - Criar agendamento
   - Verificar vagas

---

## 🐛 PROBLEMAS COMUNS

### Erro: "relation ordens_servico does not exist"

**Causa:** Tabela principal não existe

**Solução:**
```sql
-- Verificar se existe
SELECT tablename FROM pg_tables WHERE tablename = 'ordens_servico';

-- Se não retornar nada, você está no banco errado
-- ou a aplicação não criou as tabelas principais ainda
```

### Erro: "Colaborador não encontrado" no seed

**Causa:** Email não corresponde ou colaborador não existe

**Solução:**
```sql
-- Ver quais colaboradores existem
SELECT email FROM colaboradores
WHERE email LIKE '%@minervaestrutura.com.br';

-- Se retornar vazio, os colaboradores não foram criados ainda
-- Criar manualmente ou verificar seed anterior
```

### Erro: "duplicate key value" ao criar usuário auth

**Causa:** Usuário já existe com este ID

**Solução:**
- Pule este usuário (já foi criado antes)
- OU delete o usuário existente e crie novamente
- OU use outro User UID

### Erro: "permission denied for schema auth"

**Causa:** Tentando fazer INSERT em auth.users via SQL

**Solução:**
- Criar usuários via Dashboard (Etapa 3)
- NÃO tentar executar `seed_auth_users.sql` (arquivo antigo)

### Warning: "Colaborador X não encontrado" mas script continua

**Causa:** Colaborador com aquele email não existe

**Solução:**
```sql
-- Criar colaborador manualmente
INSERT INTO colaboradores (
  email,
  nome_completo,
  role_nivel,
  status_colaborador,
  setor
)
VALUES (
  'email@minervaestrutura.com.br',
  'Nome Completo',
  'GESTOR_ADMINISTRATIVO',
  'ativo',
  'COM'
);
```

---

## 📞 SUPORTE

Se algo der errado:

1. **Copie a mensagem de erro completa**
2. **Verifique qual etapa falhou**
3. **Execute os comandos de verificação dessa etapa**
4. **Veja se o problema está listado acima**

### Comandos úteis para debug:

```sql
-- Ver todas as tabelas
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Ver todas as colunas de uma tabela
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'nome_da_tabela';

-- Ver todos os usuários
SELECT id, email, created_at
FROM auth.users;

-- Ver todos os colaboradores
SELECT id, email, nome_completo, role_nivel
FROM colaboradores;
```

---

**Última atualização:** 18/11/2025
**Versão:** 1.0
**Banco:** zxfevlkssljndqqhxkjb
