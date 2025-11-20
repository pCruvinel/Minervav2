# 📋 Guia de Execução de Migrations - Minerva ERP

**Data:** 19/11/2025
**Autor:** Sistema de Desenvolvimento Minerva
**Versão:** 1.0

---

## ⚠️ ATENÇÃO - LEIA ANTES DE EXECUTAR

**ESTAS MIGRATIONS ALTERAM A ESTRUTURA DO BANCO DE DADOS.**

Antes de executar:
1. ✅ **FAÇA BACKUP COMPLETO DO BANCO**
2. ✅ Execute primeiro em ambiente de **DESENVOLVIMENTO**
3. ✅ Teste todas as funcionalidades após cada migration
4. ✅ Valide com usuários reais de cada role
5. ✅ Só então execute em **PRODUÇÃO**

---

## 🎯 Visão Geral

Total de **9 migrations** criadas para corrigir inconsistências entre o banco de dados e o código TypeScript.

### Migrations Criadas

| # | Arquivo | Prioridade | Descrição |
|---|---------|------------|-----------|
| 1 | `20251119000001_fix_user_role_nivel_enum.sql` | 🔴 CRÍTICA | Expande roles de 4 para 8 valores |
| 2 | `20251119000002_fix_user_setor_enum.sql` | 🔴 CRÍTICA | Renomeia ADM → COMERCIAL |
| 3 | `20251119000003_fix_financeiro_tipo_enum.sql` | 🔴 ALTA | ENTRADA/SAIDA → RECEITA/DESPESA |
| 4 | `20251119000004_create_performance_indexes.sql` | 🟡 ALTA | Cria 30+ índices de performance |
| 5 | `20251119000005_fix_rls_policies.sql` | 🔴 ALTA | Corrige políticas RLS |
| 6 | `20251119000006_create_permission_functions.sql` | 🟡 MÉDIA | Cria funções de validação |
| 7 | `20251119000007_fix_minor_enums.sql` | 🟢 BAIXA | Expande ENUMs secundários |
| 8 | `20251119000008_create_audit_triggers.sql` | 🟡 MÉDIA | Cria triggers de auditoria |
| 9 | `20251119000009_create_dashboard_views.sql` | 🟢 BAIXA | Cria views de dashboard |

---

## 📦 Fase 1: Correções Críticas (Executar em Ordem)

### ⚠️ Passo 0: Backup

```bash
# Via Supabase CLI
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# Ou via Dashboard
# Settings > Database > Database Backups > Create backup
```

### 🔴 Migration 1: Corrigir ENUM user_role_nivel

**Arquivo:** `20251119000001_fix_user_role_nivel_enum.sql`

**O que faz:**
- Expande `user_role_nivel` de 4 valores para 8 valores
- Mapeia valores antigos para novos:
  - `COLABORADOR` → `COLABORADOR_COMERCIAL`
  - `GESTOR_ADM` → `GESTOR_COMERCIAL`
  - `GESTOR_SETOR` → `GESTOR_ASSESSORIA` ⚠️
  - `DIRETORIA` → `DIRETORIA`

**⚠️ Ação Manual Necessária:**
- Usuários com `GESTOR_SETOR` serão convertidos para `GESTOR_ASSESSORIA`
- **VERIFIQUE** se algum deveria ser `GESTOR_OBRAS` e ajuste manualmente!

**Como Executar:**

```bash
# Via Supabase CLI
supabase db push

# Ou via SQL Editor no Dashboard
# Copie e cole o conteúdo do arquivo
```

**Verificação:**

```sql
-- Ver distribuição de roles após migration
SELECT
  role_nivel,
  COUNT(*) as total,
  array_agg(nome_completo) as usuarios
FROM colaboradores
GROUP BY role_nivel
ORDER BY role_nivel;
```

**Rollback (se necessário):**

```sql
-- ATENÇÃO: Só execute se realmente precisar reverter!
-- Este rollback perde a granularidade dos novos roles

BEGIN;

ALTER TYPE user_role_nivel RENAME TO user_role_nivel_new;

CREATE TYPE user_role_nivel AS ENUM (
  'DIRETORIA',
  'GESTOR_ADM',
  'GESTOR_SETOR',
  'COLABORADOR'
);

ALTER TABLE colaboradores
  ALTER COLUMN role_nivel TYPE user_role_nivel
  USING (
    CASE role_nivel::text
      WHEN 'DIRETORIA' THEN 'DIRETORIA'::user_role_nivel
      WHEN 'GESTOR_COMERCIAL' THEN 'GESTOR_ADM'::user_role_nivel
      WHEN 'GESTOR_ASSESSORIA' THEN 'GESTOR_SETOR'::user_role_nivel
      WHEN 'GESTOR_OBRAS' THEN 'GESTOR_SETOR'::user_role_nivel
      ELSE 'COLABORADOR'::user_role_nivel
    END
  );

DROP TYPE user_role_nivel_new;

COMMIT;
```

---

### 🔴 Migration 2: Corrigir ENUM user_setor

**Arquivo:** `20251119000002_fix_user_setor_enum.sql`

**O que faz:**
- Renomeia `ADM` → `COMERCIAL`
- Mantém `ASSESSORIA` e `OBRAS`

**⚠️ IMPORTANTE - Atualizar Código TypeScript:**

Após executar esta migration, **atualize o código TypeScript**:

```typescript
// Arquivo: src/lib/types.ts
// ANTES:
export type Setor = 'COM' | 'ASS' | 'OBR';

// DEPOIS:
export type Setor = 'COMERCIAL' | 'ASSESSORIA' | 'OBRAS';
```

**Buscar e Substituir no Projeto:**

```bash
# Substituir todas as ocorrências
# 'COM' → 'COMERCIAL'
# 'ASS' → 'ASSESSORIA'
# 'OBR' → 'OBRAS'

# Exemplo de áreas a verificar:
# - src/lib/types.ts
# - src/lib/auth-utils.ts
# - src/components/**/*.tsx
```

**Como Executar:**

```bash
supabase db push
```

**Verificação:**

```sql
SELECT setor, COUNT(*) as total
FROM colaboradores
WHERE setor IS NOT NULL
GROUP BY setor;

SELECT setor_padrao, COUNT(*) as total
FROM tipos_os
GROUP BY setor_padrao;
```

---

### 🔴 Migration 3: Corrigir ENUM financeiro_tipo

**Arquivo:** `20251119000003_fix_financeiro_tipo_enum.sql`

**O que faz:**
- Renomeia `ENTRADA` → `RECEITA`
- Renomeia `SAIDA` → `DESPESA`

**Código TypeScript:**
- ✅ Já usa `RECEITA` e `DESPESA`, então está OK!
- Verificar se há referências antigas a `ENTRADA` ou `SAIDA`

**Como Executar:**

```bash
supabase db push
```

**Verificação:**

```sql
SELECT tipo, COUNT(*), SUM(valor)
FROM financeiro_lancamentos
GROUP BY tipo;
```

---

## 📊 Fase 2: Performance e Segurança

### 🟡 Migration 4: Criar Índices de Performance

**Arquivo:** `20251119000004_create_performance_indexes.sql`

**O que faz:**
- Cria 30+ índices estratégicos
- Otimiza queries frequentes
- Melhora performance de filtros

**Impacto:**
- ✅ Queries até 100x mais rápidas
- ⚠️ Espaço em disco aumenta ~10-20%
- ⚠️ Writes ficam ~5-10% mais lentos

**Como Executar:**

```bash
supabase db push
```

**Verificação:**

```sql
-- Ver índices criados
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Monitorar uso dos índices (após 1 semana)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

---

### 🔴 Migration 5: Corrigir Políticas RLS

**Arquivo:** `20251119000005_fix_rls_policies.sql`

**O que faz:**
- Corrige referências a campos inexistentes (`tipo_colaborador`)
- Usa campos corretos (`role_nivel`)
- Adiciona políticas faltantes

**⚠️ CRÍTICO PARA SEGURANÇA:**
- Políticas RLS controlam quem vê o quê
- Erros aqui podem expor dados sensíveis

**Como Executar:**

```bash
supabase db push
```

**Verificação - OBRIGATÓRIA:**

```sql
-- Listar todas as políticas
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Testar com cada role (fazer login como diferentes usuários)
-- 1. Login como DIRETORIA → deve ver tudo
-- 2. Login como GESTOR_COMERCIAL → deve ver tudo
-- 3. Login como GESTOR_ASSESSORIA → deve ver apenas ASSESSORIA
-- 4. Login como COLABORADOR → deve ver apenas suas tarefas
```

---

## 🛠️ Fase 3: Funções, Auditoria e Relatórios

### 🟡 Migration 6: Criar Funções de Permissão

**Arquivo:** `20251119000006_create_permission_functions.sql`

**O que faz:**
- Cria 5 funções SQL de validação:
  1. `pode_ver_os(user_id, os_id)`
  2. `pode_editar_os(user_id, os_id)`
  3. `pode_criar_delegacao(delegante_id, delegado_id, os_id)`
  4. `obter_permissoes_usuario(user_id)`
  5. `eh_superior_hierarquico(user1_id, user2_id)`

**Como Executar:**

```bash
supabase db push
```

**Verificação:**

```sql
-- Testar funções
SELECT obter_permissoes_usuario(auth.uid());

-- Testar se pode ver uma OS
SELECT pode_ver_os(auth.uid(), 'uuid-de-uma-os');
```

---

### 🟢 Migration 7: Corrigir ENUMs Menores

**Arquivo:** `20251119000007_fix_minor_enums.sql`

**O que faz:**
- Expande `cliente_tipo` (adiciona CONSTRUTORA, INCORPORADORA, etc)
- Expande `cc_tipo` (adiciona ADMINISTRATIVO, LABORATORIO, etc)
- Melhora `performance_avaliacao` (OTIMA→EXCELENTE, etc)
- Adiciona status extras

**Como Executar:**

```bash
supabase db push
```

---

### 🟡 Migration 8: Criar Triggers de Auditoria

**Arquivo:** `20251119000008_create_audit_triggers.sql`

**O que faz:**
- Audita mudanças de role de colaboradores
- Audita criação/mudança de status de OS
- Auto-gera códigos de OS (OS-2025-0001)
- Valida alocação de CC (soma não pode exceder 100%)
- Registra tudo em `audit_log`

**Como Executar:**

```bash
supabase db push
```

**Verificação:**

```sql
-- Ver triggers criados
SELECT
  event_object_table,
  trigger_name,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'trigger_%'
ORDER BY event_object_table;

-- Ver últimas ações auditadas
SELECT
  created_at,
  acao,
  tabela_afetada,
  dados_novos
FROM audit_log
ORDER BY created_at DESC
LIMIT 20;
```

---

### 🟢 Migration 9: Criar Views de Dashboard

**Arquivo:** `20251119000009_create_dashboard_views.sql`

**O que faz:**
- Cria 8 views otimizadas para dashboards:
  1. `v_os_por_status` - Resumo de OS por status
  2. `v_performance_colaboradores` - Métricas de colaboradores
  3. `v_os_completa` - OS com todos os dados
  4. `v_resumo_financeiro_mensal` - Resumo financeiro
  5. `v_calendario_proximo_mes` - Calendário de agendamentos
  6. `v_dashboard_diretoria` - KPIs executivos
  7. `v_atividades_recentes` - Últimas 50 atividades
  8. `v_etapas_pendentes_aprovacao` - Etapas aguardando aprovação

**Como Executar:**

```bash
supabase db push
```

**Uso nas Views:**

```sql
-- Dashboard executivo
SELECT * FROM v_dashboard_diretoria;

-- Performance de colaboradores
SELECT * FROM v_performance_colaboradores;

-- OS completas com filtros
SELECT * FROM v_os_completa
WHERE esta_atrasada = true;

-- Calendário
SELECT * FROM v_calendario_proximo_mes
WHERE data BETWEEN '2025-11-19' AND '2025-11-26';
```

---

## 🚀 Execução via Supabase CLI

### Método 1: Push Automático (Recomendado)

```bash
# 1. Navegar para pasta do projeto
cd C:\Users\Usuario\OneDrive\Documentos\claude\Minervav2

# 2. Verificar status
supabase db diff

# 3. Executar migrations pendentes
supabase db push

# 4. Verificar aplicação
supabase db dump --schema=public
```

### Método 2: Aplicar Migration Específica

```bash
# Aplicar uma migration específica
supabase migration up --file supabase/migrations/20251119000001_fix_user_role_nivel_enum.sql

# Ou via SQL Editor
supabase db execute --file supabase/migrations/20251119000001_fix_user_role_nivel_enum.sql
```

### Método 3: Via Dashboard Supabase

1. Acesse https://supabase.com/dashboard
2. Selecione projeto: **MinervaV2**
3. Vá em **SQL Editor**
4. Abra o arquivo da migration
5. Copie e cole o conteúdo
6. Clique em **Run**

---

## ✅ Checklist de Validação

### Após Migration 1 (user_role_nivel)

- [ ] Todos os usuários foram migrados?
- [ ] Nenhum usuário com role NULL?
- [ ] Gestores de setor mapeados corretamente?
- [ ] Login funciona para cada role?
- [ ] Permissões corretas no frontend?

### Após Migration 2 (user_setor)

- [ ] Todos os setores renomeados?
- [ ] Código TypeScript atualizado?
- [ ] Componentes usando nomes novos?
- [ ] Filtros funcionando?

### Após Migration 3 (financeiro_tipo)

- [ ] Lançamentos financeiros migrados?
- [ ] Relatórios financeiros funcionando?
- [ ] Sem referências a ENTRADA/SAIDA no código?

### Após Migration 5 (RLS)

- [ ] Testado login como DIRETORIA?
- [ ] Testado login como GESTOR_COMERCIAL?
- [ ] Testado login como GESTOR_ASSESSORIA?
- [ ] Testado login como GESTOR_OBRAS?
- [ ] Testado login como COLABORADOR?
- [ ] Cada role vê apenas o que deve?

### Após Migration 8 (Triggers)

- [ ] Códigos de OS sendo gerados automaticamente?
- [ ] Mudanças de status auditadas?
- [ ] Validação de alocação CC funcionando?

---

## 🔙 Rollback de Emergência

**Se algo der muito errado:**

```bash
# 1. PARAR TUDO
# Desabilitar acesso ao sistema

# 2. Restaurar backup
supabase db restore backup_20251119.sql

# 3. Verificar integridade
supabase db test

# 4. Investigar problema
# Revisar logs de erro
```

---

## 📞 Suporte

**Dúvidas ou Problemas?**

1. Verificar logs: `supabase logs --db`
2. Verificar audit_log: `SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 50;`
3. Contatar equipe de desenvolvimento

---

## 📚 Documentos Relacionados

- `src/DATABASE_SCHEMA.md` - Schema completo do banco
- `src/docs/usuarios-sistema.md` - Documentação de usuários e permissões
- `supabase/migrations/` - Pasta com todas as migrations

---

**Última atualização:** 19/11/2025
**Versão do Documento:** 1.0
**Autor:** Sistema Minerva ERP
