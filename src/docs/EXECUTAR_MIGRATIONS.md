# 🚀 Como Executar as Migrations - Guia Completo

**Projeto:** MinervaV2
**Banco:** Supabase (zxfevlkssljndqqhxkjb)
**Tempo estimado:** 10-15 minutos

---

## 📋 Status das Migrations

### ✅ Migrations Já Aplicadas
- `20251114121436_create_kv_table_5ad7fd2c` ✅
- `20251117211549_create_kv_table_02355049` ✅

### ⏳ Migrations Pendentes (Aguardando Execução)

1. **create_delegacoes_table.sql** - Sistema de Delegações
   - Cria tabela `delegacoes`
   - Cria enum `delegacao_status`
   - Configura RLS e políticas de acesso

2. **seed_auth_users.sql** - Usuários de Desenvolvimento
   - Cria 6 usuários no `auth.users`
   - Sincroniza com tabela `colaboradores`
   - Senha padrão: `minerva123`

3. **create_calendario_tables.sql** - Sistema de Calendário
   - Cria tabela `turnos`
   - Cria tabela `agendamentos` (atualizada)
   - Funções auxiliares para gerenciamento

4. **seed_calendario_data.sql** - Dados do Calendário
   - Popula 5 turnos de exemplo
   - Popula 6 agendamentos de exemplo

---

## 🎯 Passo 1: Acesso ao Dashboard

1. Abra seu navegador
2. Acesse: **https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb**
3. Faça login se necessário
4. No menu lateral, clique em **SQL Editor**

---

## 🔧 Passo 2: Executar Migrations na Ordem

### 2.1 Migration: Tabela de Delegações

**Arquivo:** `supabase/migrations/create_delegacoes_table.sql`

1. Abra o arquivo no VS Code
2. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou Ctrl+Enter)

**Resultado esperado:**
```
✅ Success. No rows returned
```

**O que foi criado:**
- Tabela `delegacoes` com 13 colunas
- Enum `delegacao_status` (PENDENTE, EM_PROGRESSO, CONCLUIDA, REPROVADA)
- 5 índices para performance
- 7 políticas RLS
- 1 trigger para `updated_at`

---

### 2.2 Migration: Usuários de Desenvolvimento

**Arquivo:** `supabase/migrations/seed_auth_users.sql`

⚠️ **ATENÇÃO:** Esta migration altera dados sensíveis no schema `auth`

1. Abra o arquivo no VS Code
2. Copie TODO o conteúdo
3. Cole no SQL Editor
4. **LEIA a mensagem de aviso antes de executar**
5. Clique em **Run**

**Resultado esperado:**
```
NOTICE:  ✅ Seed de usuários concluído com sucesso!
NOTICE:  📧 Emails criados: 6
NOTICE:  🔑 Senha padrão: minerva123
```

**Usuários criados:**
- carlos.diretor@minervaestrutura.com.br (DIRETORIA)
- pedro.gestorcomercial@minervaestrutura.com.br (GESTOR_COMERCIAL)
- maria.gestorassessoria@minervaestrutura.com.br (GESTOR_ASSESSORIA)
- joao.gestorobras@minervaestrutura.com.br (GESTOR_OBRAS)
- ana.colabc@minervaestrutura.com.br (COLABORADOR_COMERCIAL)
- bruno.colaba@minervaestrutura.com.br (COLABORADOR_ASSESSORIA)

**Senha para todos:** `minerva123`

---

### 2.3 Migration: Tabelas do Calendário

**Arquivo:** `supabase/migrations/create_calendario_tables.sql`

1. Abra o arquivo no VS Code
2. Copie TODO o conteúdo
3. Cole no SQL Editor
4. Clique em **Run**

**Resultado esperado:**
```
✅ Success. No rows returned
```

**O que foi criado:**
- Tabela `turnos` (horários disponíveis)
- Tabela `agendamentos` (agendamentos realizados)
- 6 índices para performance
- Funções auxiliares:
  - `verificar_vagas_turno()`
  - `obter_turnos_disponiveis()`
- Políticas RLS para controle de acesso

---

### 2.4 Migration: Dados do Calendário

**Arquivo:** `supabase/migrations/seed_calendario_data.sql`

1. Abra o arquivo no VS Code
2. Copie TODO o conteúdo
3. Cole no SQL Editor
4. Clique em **Run**

**Resultado esperado:**
```
NOTICE:  Seed de calendário concluído com sucesso!
NOTICE:  ========================================
NOTICE:  RESUMO DO SEED:
NOTICE:  ========================================
NOTICE:  Turnos criados: 5
NOTICE:  Agendamentos criados: 6
NOTICE:  ========================================
```

---

## ✅ Passo 3: Verificação Final

### 3.1 Verificar Tabela de Delegações

```sql
SELECT COUNT(*) as total_colunas
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'delegacoes';
```

**Esperado:** `total_colunas: 13`

### 3.2 Verificar Usuários Auth

```sql
SELECT COUNT(*) as total_usuarios
FROM auth.users
WHERE email LIKE '%@minervaestrutura.com.br';
```

**Esperado:** `total_usuarios: 6`

### 3.3 Verificar Tabelas do Calendário

```sql
SELECT
  (SELECT COUNT(*) FROM turnos) as total_turnos,
  (SELECT COUNT(*) FROM agendamentos) as total_agendamentos;
```

**Esperado:**
- `total_turnos: 5`
- `total_agendamentos: 6`

### 3.4 Verificar Todas as Tabelas

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('delegacoes', 'turnos', 'agendamentos')
ORDER BY table_name;
```

**Esperado:** 3 tabelas listadas

---

## 🎉 Pronto!

Se todas as verificações passaram, você concluiu com sucesso!

**Próximos passos:**

1. **Testar Login**
   - Email: `carlos.diretor@minervaestrutura.com.br`
   - Senha: `minerva123`

2. **Testar Delegação**
   - Criar uma delegação de tarefa
   - Verificar se aparece no banco

3. **Testar Calendário**
   - Visualizar turnos disponíveis
   - Criar um novo agendamento
   - Verificar disponibilidade de vagas

---

## 🐛 Troubleshooting

### ❌ Erro: "relation delegacoes already exists"
**Causa:** Tabela já foi criada anteriormente
**Solução:** Pule esta migration, ela já está aplicada

### ❌ Erro: "relation ordens_servico does not exist"
**Causa:** Tabela principal não existe
**Solução:** Verifique se o banco está correto (zxfevlkssljndqqhxkjb)

### ❌ Erro: "duplicate key value" em auth.users
**Causa:** Usuários já foram criados antes
**Solução:** Delete os usuários antigos ou use ON CONFLICT (já está no script)

### ❌ Erro: "permission denied for schema auth"
**Causa:** Falta de permissões para modificar schema auth
**Solução:** Execute com usuário admin ou service_role

### ❌ Erro: "type colaborador_tipo does not exist"
**Causa:** Migration de calendário espera um tipo que não existe
**Solução:** As políticas RLS serão ajustadas conforme seu schema

---

## 📊 Resumo Técnico

### Estrutura do Banco Após Migrations

**Tabelas Principais:**
- colaboradores (já existia)
- ordens_servico (já existia)
- clientes (já existia)
- delegacoes (nova)
- turnos (nova)
- agendamentos (atualizada)

**Enums Criados:**
- delegacao_status
- agendamento_status (se não existir)

**Triggers:**
- trigger_update_delegacoes_updated_at
- trigger_atualizar_turnos
- trigger_atualizar_agendamentos
- on_auth_user_created (sync auth → colaboradores)

**Funções:**
- verificar_vagas_turno()
- obter_turnos_disponiveis()
- handle_new_user()

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs do Supabase:**
   - Dashboard → Logs → Postgres Logs

2. **Verifique permissões:**
   ```sql
   SELECT current_user, current_database();
   ```

3. **Liste todas as migrations aplicadas:**
   ```sql
   SELECT * FROM supabase_migrations.schema_migrations
   ORDER BY version DESC;
   ```

4. **Verifique tabelas existentes:**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

---

**Documento atualizado em:** 2025-01-18
**Versão do banco:** PostgreSQL 17.6.1.038
**Status:** 4 migrations pendentes de aplicação
