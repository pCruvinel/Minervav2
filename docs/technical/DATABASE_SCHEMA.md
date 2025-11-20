# Schema do Banco de Dados - Minerva ERP

**Última atualização:** 19/11/2025
**Sistema:** Minerva Engenharia - Sistema de Gestão Integrada (ERP)
**Banco de Dados:** PostgreSQL 17 (Supabase)
**Projeto:** MinervaV2 (zxfevlkssljndqqhxkjb)
**Região:** sa-east-1

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estatísticas do Banco](#estatísticas-do-banco)
3. [Tabelas Principais](#tabelas-principais)
4. [Tabelas de Relacionamento](#tabelas-de-relacionamento)
5. [Tabelas de Auditoria](#tabelas-de-auditoria)
6. [Tipos Customizados (ENUMS)](#tipos-customizados-enums)
7. [Row Level Security (RLS)](#row-level-security-rls)
8. [Extensões PostgreSQL](#extensões-postgresql)
9. [Migrations Aplicadas](#migrations-aplicadas)
10. [Inconsistências Conhecidas](#inconsistências-conhecidas)

---

## 🎯 Visão Geral

O banco de dados do Minerva ERP é estruturado para gerenciar:
- **Ordens de Serviço (OS)** com fluxo de trabalho completo (46 OS cadastradas)
- **Clientes** e leads (2 registros)
- **Colaboradores** com hierarquia e permissões (6 usuários)
- **Centros de Custo** e alocação
- **Financeiro** (lançamentos e conciliação)
- **Calendário** com turnos e agendamentos (5 turnos, 6 agendamentos)
- **Delegações** de tarefas entre colaboradores
- **Auditoria** completa de ações
- **Presença** e **Performance** de colaboradores

---

## 📊 Estatísticas do Banco

### Tabelas e Registros

| Tabela | Registros | RLS Habilitado | Status |
|--------|-----------|----------------|--------|
| `colaboradores` | 6 | ✅ | Ativo |
| `clientes` | 2 | ✅ | Ativo |
| `tipos_os` | 13 | ✅ | Ativo |
| `ordens_servico` | 46 | ✅ | Ativo |
| `os_etapas` | 450 | ✅ | Ativo |
| `os_anexos` | 0 | ✅ | Ativo |
| `os_historico_status` | 20 | ✅ | Ativo |
| `centros_custo` | 0 | ✅ | Ativo |
| `financeiro_lancamentos` | 0 | ✅ | Ativo |
| `colaborador_alocacoes_cc` | 0 | ✅ | Ativo |
| `colaborador_presenca` | 0 | ✅ | Ativo |
| `colaborador_performance` | 0 | ✅ | Ativo |
| `audit_log` | 0 | ✅ | Ativo |
| `delegacoes` | 0 | ✅ | Ativo |
| `turnos` | 5 | ✅ | Ativo |
| `agendamentos` | 6 | ✅ | Ativo |
| `kv_store_5ad7fd2c` | 0 | ✅ | Ativo |
| `kv_store_02355049` | 0 | ✅ | Ativo |

**Total de Tabelas**: 18
**Total de Registros**: ~544

---

## 📋 Tabelas Principais

### 1. `colaboradores`

Armazena todos os colaboradores/usuários do sistema (vinculado ao auth.users do Supabase).

```sql
CREATE TABLE public.colaboradores (
  id uuid PRIMARY KEY,
  nome_completo text NOT NULL,
  cpf character varying UNIQUE,
  telefone character varying,
  data_admissao date,
  data_demissao date,
  ativo boolean DEFAULT true,
  role_nivel user_role_nivel NOT NULL DEFAULT 'COLABORADOR',
  setor user_setor,
  custo_mensal numeric DEFAULT 0.00,
  email text,

  CONSTRAINT colaboradores_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id)
);
```

**Campos principais:**
- `id`: UUID do usuário (vem do Supabase Auth)
- `role_nivel`: Nível de acesso (COLABORADOR, GESTOR_SETOR, GESTOR_ADM, DIRETORIA)
- `setor`: Setor do colaborador (ADM, ASSESSORIA, OBRAS)
- `custo_mensal`: Custo mensal do colaborador para rateio de CC
- `ativo`: Soft delete (true = ativo, false = inativo)

**RLS**: ✅ Habilitado
**Registros**: 6 usuários cadastrados

---

### 2. `clientes`

Gerencia clientes e leads do sistema.

```sql
CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  status cliente_status NOT NULL DEFAULT 'LEAD',
  nome_razao_social text NOT NULL,
  cpf_cnpj character varying UNIQUE,
  email text,
  telefone character varying,
  nome_responsavel text,
  tipo_cliente cliente_tipo,
  endereco jsonb,
  observacoes text,
  responsavel_id uuid REFERENCES colaboradores(id),

  CONSTRAINT clientes_pkey PRIMARY KEY (id)
);
```

**Campos principais:**
- `status`: LEAD, ATIVO, INATIVO
- `tipo_cliente`: PESSOA_FISICA, CONDOMINIO, EMPRESA
- `endereco`: JSONB com estrutura flexível de endereço
- `responsavel_id`: Colaborador responsável pelo cliente

**RLS**: ✅ Habilitado
**Registros**: 2 clientes

---

### 3. `tipos_os`

Define os tipos de Ordem de Serviço disponíveis no sistema.

```sql
CREATE TABLE public.tipos_os (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo character varying NOT NULL UNIQUE,
  nome text NOT NULL,
  setor_padrao user_setor NOT NULL,
  descricao text,
  categoria character varying,
  fluxo_especial boolean DEFAULT false,
  requer_cliente boolean DEFAULT true,
  ativo boolean DEFAULT true,
  etapas_padrao jsonb DEFAULT '[]',
  campos_customizados jsonb DEFAULT '{}',

  CONSTRAINT tipos_os_pkey PRIMARY KEY (id)
);
```

**Campos principais:**
- `codigo`: Código único (ex: OS-01, OS-02, OS-13)
- `setor_padrao`: Setor padrão (ADM, ASSESSORIA, OBRAS)
- `fluxo_especial`: Se possui fluxo diferenciado (Lead → Cliente)
- `requer_cliente`: Se requer cliente pré-cadastrado
- `etapas_padrao`: Array JSONB com etapas padrão do fluxo

**RLS**: ✅ Habilitado
**Registros**: 13 tipos de OS cadastrados

---

### 4. `ordens_servico`

Tabela central do sistema - armazena todas as Ordens de Serviço.

```sql
CREATE TABLE public.ordens_servico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_os character varying UNIQUE,
  cliente_id uuid NOT NULL REFERENCES clientes(id),
  tipo_os_id uuid NOT NULL REFERENCES tipos_os(id),
  responsavel_id uuid REFERENCES colaboradores(id),
  criado_por_id uuid NOT NULL REFERENCES colaboradores(id),
  cc_id uuid REFERENCES centros_custo(id),
  status_geral os_status_geral NOT NULL DEFAULT 'EM_TRIAGEM',
  data_entrada timestamptz NOT NULL DEFAULT now(),
  data_prazo timestamptz,
  data_conclusao timestamptz,
  valor_proposta numeric,
  valor_contrato numeric,
  descricao text,

  CONSTRAINT ordens_servico_pkey PRIMARY KEY (id)
);
```

**Campos principais:**
- `codigo_os`: Código único da OS (ex: OS-2025-001)
- `status_geral`: Status global da OS
- `cc_id`: Centro de Custo associado (opcional)
- `valor_proposta`: Valor da proposta comercial
- `valor_contrato`: Valor do contrato fechado

**RLS**: ✅ Habilitado
**Registros**: 46 OS cadastradas

---

### 5. `os_etapas`

Armazena as etapas de cada OS (fluxo de trabalho).

```sql
CREATE TABLE public.os_etapas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id uuid NOT NULL REFERENCES ordens_servico(id),
  nome_etapa text NOT NULL,
  ordem smallint DEFAULT 0,
  status os_etapa_status NOT NULL DEFAULT 'PENDENTE',
  responsavel_id uuid REFERENCES colaboradores(id),
  aprovador_id uuid REFERENCES colaboradores(id),
  comentarios_aprovacao text,
  data_inicio timestamptz,
  data_conclusao timestamptz,
  dados_etapa jsonb,

  CONSTRAINT os_etapas_pkey PRIMARY KEY (id)
);
```

**Campos principais:**
- `ordem`: Ordem de execução da etapa (1, 2, 3...)
- `status`: PENDENTE, EM_ANDAMENTO, AGUARDANDO_APROVACAO, APROVADA, REJEITADA
- `dados_etapa`: JSONB com dados específicos da etapa (formulários preenchidos)
- `aprovador_id`: Colaborador que aprova a etapa (se necessário)

**Exemplo de `dados_etapa` (Follow-up 1):**
```json
{
  "idade_edificacao": "15 anos",
  "motivo_visita": "Infiltração em fachada",
  "tempo_ocorrencia": "6 meses",
  "grau_urgencia": "Alto",
  "escopo_inicial": "Vistoria completa da fachada...",
  "anexos_ids": ["uuid1", "uuid2"]
}
```

**RLS**: ✅ Habilitado
**Registros**: 450 etapas

---

### 6. `os_anexos`

Armazena todos os anexos/documentos relacionados às OS.

```sql
CREATE TABLE public.os_anexos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  os_id uuid NOT NULL REFERENCES ordens_servico(id),
  etapa_id uuid REFERENCES os_etapas(id),
  nome_arquivo text NOT NULL,
  path_storage text NOT NULL,
  tipo_anexo text,
  comentarios text,

  CONSTRAINT os_anexos_pkey PRIMARY KEY (id)
);
```

**Campos principais:**
- `path_storage`: Caminho completo no Supabase Storage
- `etapa_id`: Etapa específica do anexo (opcional)
- `tipo_anexo`: foto_visita, memorial, contrato, proposta, etc.

**RLS**: ✅ Habilitado
**Registros**: 0 anexos

---

### 7. `centros_custo`

Gerencia os Centros de Custo (CCs) do sistema.

```sql
CREATE TABLE public.centros_custo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo cc_tipo NOT NULL,
  cliente_id uuid REFERENCES clientes(id),
  valor_global numeric DEFAULT 0.00,
  status_cc os_status_geral DEFAULT 'EM_ANDAMENTO',

  CONSTRAINT centros_custo_pkey PRIMARY KEY (id)
);
```

**Campos principais:**
- `tipo`: ASSESSORIA, OBRA, INTERNO
- `cliente_id`: Cliente vinculado ao CC (se for uma obra)
- `valor_global`: Valor total do CC

**RLS**: ✅ Habilitado
**Registros**: 0 CCs

---

### 8. `delegacoes`

Gerencia delegações de tarefas entre colaboradores.

```sql
CREATE TABLE public.delegacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  os_id uuid NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  delegante_id uuid NOT NULL REFERENCES colaboradores(id) ON DELETE RESTRICT,
  delegado_id uuid NOT NULL REFERENCES colaboradores(id) ON DELETE RESTRICT,
  status_delegacao delegacao_status NOT NULL DEFAULT 'PENDENTE',
  descricao_tarefa text NOT NULL CHECK (char_length(descricao_tarefa) >= 10),
  observacoes text,
  data_prazo date,
  delegante_nome text NOT NULL,
  delegado_nome text NOT NULL,

  CONSTRAINT delegacoes_pkey PRIMARY KEY (id),
  CONSTRAINT delegacoes_no_self_delegation CHECK (delegante_id != delegado_id)
);
```

**Campos principais:**
- `status_delegacao`: PENDENTE, EM_PROGRESSO, CONCLUIDA, REPROVADA
- `descricao_tarefa`: Descrição detalhada (mínimo 10 caracteres)
- `delegante_nome`, `delegado_nome`: Cache para performance

**RLS**: ✅ Habilitado com 7 políticas
**Registros**: 0 delegações

**Políticas RLS:**
1. Delegante e delegado visualizam suas delegações
2. Diretoria visualiza todas
3. Apenas gestores+ podem criar
4. Delegante atualiza suas delegações
5. Delegado atualiza status/observações
6. Diretoria atualiza todas
7. Delegante deleta apenas PENDENTES

---

### 9. `turnos`

Armazena os turnos disponíveis para agendamento no calendário.

```sql
CREATE TABLE public.turnos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hora_inicio time NOT NULL,
  hora_fim time NOT NULL CHECK (hora_fim > hora_inicio),
  vagas_total integer NOT NULL DEFAULT 5 CHECK (vagas_total > 0),
  setores text[] NOT NULL DEFAULT '{}',
  cor varchar(7) NOT NULL DEFAULT '#93C5FD',
  tipo_recorrencia varchar(20) NOT NULL DEFAULT 'uteis',
  data_inicio date,
  data_fim date,
  dias_semana integer[],
  ativo boolean NOT NULL DEFAULT true,
  criado_por uuid REFERENCES auth.users(id),
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now(),

  CONSTRAINT turnos_pkey PRIMARY KEY (id)
);
```

**Campos principais:**
- `tipo_recorrencia`: 'todos', 'uteis', 'custom'
- `dias_semana`: Array de dias (0=Domingo, 6=Sábado)
- `setores`: Array de setores permitidos

**RLS**: ✅ Habilitado
**Registros**: 5 turnos cadastrados

---

### 10. `agendamentos`

Armazena os agendamentos realizados em turnos.

```sql
CREATE TABLE public.agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turno_id uuid NOT NULL REFERENCES turnos(id) ON DELETE CASCADE,
  data date NOT NULL,
  horario_inicio time NOT NULL,
  horario_fim time NOT NULL CHECK (horario_fim > horario_inicio),
  duracao_horas integer NOT NULL DEFAULT 1 CHECK (duracao_horas > 0),
  categoria varchar(100) NOT NULL,
  setor varchar(50) NOT NULL,
  solicitante_nome varchar(200),
  solicitante_contato varchar(50),
  solicitante_observacoes text,
  os_id uuid REFERENCES ordens_servico(id),
  status varchar(20) NOT NULL DEFAULT 'confirmado',
  criado_por uuid REFERENCES auth.users(id),
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now(),
  cancelado_em timestamptz,
  cancelado_motivo text,

  CONSTRAINT agendamentos_pkey PRIMARY KEY (id)
);
```

**Campos principais:**
- `status`: 'confirmado', 'cancelado', 'realizado', 'ausente'
- `categoria`: 'Vistoria Inicial', 'Apresentação de Proposta', etc
- `os_id`: OS relacionada ao agendamento (opcional)

**RLS**: ✅ Habilitado
**Registros**: 6 agendamentos

---

### 11. `financeiro_lancamentos`

Gerencia lançamentos financeiros (receitas e despesas).

```sql
CREATE TABLE public.financeiro_lancamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  criado_por_id uuid NOT NULL REFERENCES colaboradores(id),
  descricao text NOT NULL,
  valor numeric NOT NULL,
  tipo financeiro_tipo NOT NULL,
  data_vencimento date NOT NULL,
  data_pagamento date,
  conciliado boolean NOT NULL DEFAULT false,
  cc_id uuid REFERENCES centros_custo(id),
  cliente_id uuid REFERENCES clientes(id),
  recorrencia jsonb,
  url_nota_fiscal text,

  CONSTRAINT financeiro_lancamentos_pkey PRIMARY KEY (id)
);
```

**Campos principais:**
- `tipo`: ENTRADA, SAIDA
- `conciliado`: Se o lançamento foi conciliado com extrato bancário
- `recorrencia`: JSONB para lançamentos recorrentes

**RLS**: ✅ Habilitado
**Registros**: 0 lançamentos

---

## 🔗 Tabelas de Relacionamento

### 1. `colaborador_alocacoes_cc`

Aloca colaboradores aos Centros de Custo com percentual.

```sql
CREATE TABLE public.colaborador_alocacoes_cc (
  colaborador_id uuid NOT NULL REFERENCES colaboradores(id),
  cc_id uuid NOT NULL REFERENCES centros_custo(id),
  percentual_alocado numeric NOT NULL,

  CONSTRAINT colaborador_alocacoes_cc_pkey
    PRIMARY KEY (colaborador_id, cc_id),
  CONSTRAINT percentual_valido
    CHECK (percentual_alocado > 0 AND percentual_alocado <= 100)
);
```

**Regra de negócio:**
- A soma dos `percentual_alocado` de um colaborador deve ser <= 100%

**RLS**: ✅ Habilitado
**Registros**: 0 alocações

---

## 🔍 Tabelas de Auditoria

### 1. `audit_log`

Registra todas as ações importantes do sistema.

```sql
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  usuario_id uuid REFERENCES colaboradores(id),
  acao text NOT NULL,
  tabela_afetada text NOT NULL,
  registro_id_afetado text NOT NULL,
  dados_antigos jsonb,
  dados_novos jsonb,

  CONSTRAINT audit_log_pkey PRIMARY KEY (id)
);
```

**Exemplos de ações:**
- `CREATE_OS`
- `UPDATE_OS_STATUS`
- `APPROVE_ETAPA`
- `DELETE_CLIENTE`

**RLS**: ✅ Habilitado
**Registros**: 0 logs

---

### 2. `os_historico_status`

Histórico de mudanças de status das OS.

```sql
CREATE TABLE public.os_historico_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  os_id uuid NOT NULL REFERENCES ordens_servico(id),
  status_anterior os_status_geral,
  status_novo os_status_geral NOT NULL,
  alterado_por_id uuid REFERENCES colaboradores(id),
  observacoes text,

  CONSTRAINT os_historico_status_pkey PRIMARY KEY (id)
);
```

**RLS**: ✅ Habilitado
**Registros**: 20 mudanças de status

---

### 3. `colaborador_presenca`

Registra presença/ausência dos colaboradores.

```sql
CREATE TABLE public.colaborador_presenca (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES colaboradores(id),
  data date NOT NULL,
  status presenca_status NOT NULL,
  justificativa text,
  registrado_por_id uuid REFERENCES colaboradores(id),

  CONSTRAINT colaborador_presenca_pkey PRIMARY KEY (id)
);
```

**Status possíveis:**
- `PRESENTE`
- `ATRASO`
- `FALTA_JUSTIFICADA`
- `FALTA_INJUSTIFICADA`
- `FERIAS`
- `FOLGA`

**RLS**: ✅ Habilitado
**Registros**: 0 registros

---

### 4. `colaborador_performance`

Avaliações de performance dos colaboradores.

```sql
CREATE TABLE public.colaborador_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES colaboradores(id),
  avaliador_id uuid NOT NULL REFERENCES colaboradores(id),
  data_avaliacao date NOT NULL DEFAULT CURRENT_DATE,
  avaliacao performance_avaliacao NOT NULL,
  justificativa text,

  CONSTRAINT colaborador_performance_pkey PRIMARY KEY (id)
);
```

**Avaliações possíveis:**
- `OTIMA`
- `BOA`
- `RUIM`

**RLS**: ✅ Habilitado
**Registros**: 0 avaliações

---

## 🏷️ Tipos Customizados (ENUMS)

### ⚠️ IMPORTANTE: Discrepância com Código TypeScript

Os ENUMs no banco de dados **NÃO** correspondem aos tipos definidos no código TypeScript (`src/lib/types.ts`). Isso representa uma inconsistência crítica que precisa ser corrigida.

---

### 1. `user_role_nivel` ⚠️

```sql
CREATE TYPE user_role_nivel AS ENUM (
  'DIRETORIA',
  'GESTOR_ADM',
  'GESTOR_SETOR',
  'COLABORADOR'
);
```

**⚠️ Inconsistência**: O código TypeScript usa:
- `GESTOR_ADMINISTRATIVO`, `GESTOR_ASSESSORIA`, `GESTOR_OBRAS`
- Mas o banco tem apenas `GESTOR_ADM` e `GESTOR_SETOR`

**Hierarquia de permissões:**
1. **DIRETORIA**: Acesso total, dashboards executivos
2. **GESTOR_ADM**: Gestor administrativo
3. **GESTOR_SETOR**: Gestor de setor específico
4. **COLABORADOR**: Execução de tarefas, preenchimento de formulários

---

### 2. `user_setor` ⚠️

```sql
CREATE TYPE user_setor AS ENUM (
  'ADM',
  'ASSESSORIA',
  'OBRAS'
);
```

**⚠️ Inconsistência**: O código TypeScript usa:
- `COM` (Comercial), `ASS` (Assessoria), `OBR` (Obras)
- Mas o banco usa `ADM`, `ASSESSORIA`, `OBRAS`

---

### 3. `cliente_status` ⚠️

```sql
CREATE TYPE cliente_status AS ENUM (
  'LEAD',
  'ATIVO',
  'INATIVO'
);
```

**⚠️ Inconsistência**: Documentação antiga mostrava `CLIENTE_ATIVO`, `CLIENTE_INATIVO`

---

### 4. `cliente_tipo` ⚠️

```sql
CREATE TYPE cliente_tipo AS ENUM (
  'PESSOA_FISICA',
  'CONDOMINIO',
  'EMPRESA'
);
```

**⚠️ Inconsistência**: Documentação antiga tinha mais opções (CONSTRUTORA, INCORPORADORA, INDUSTRIA, COMERCIO, OUTRO)

---

### 5. `os_status_geral` ✅

```sql
CREATE TYPE os_status_geral AS ENUM (
  'EM_TRIAGEM',
  'AGUARDANDO_INFORMACOES',
  'EM_ANDAMENTO',
  'EM_VALIDACAO',
  'ATRASADA',
  'CONCLUIDA',
  'CANCELADA'
);
```

**Status**: ✅ Consistente com código TypeScript

---

### 6. `os_etapa_status` ⚠️

```sql
CREATE TYPE os_etapa_status AS ENUM (
  'PENDENTE',
  'EM_ANDAMENTO',
  'AGUARDANDO_APROVACAO',
  'APROVADA',
  'REJEITADA'
);
```

**⚠️ Nota**: Não tem 'CONCLUIDA' como status de etapa

---

### 7. `cc_tipo` ⚠️

```sql
CREATE TYPE cc_tipo AS ENUM (
  'ASSESSORIA',
  'OBRA',
  'INTERNO'
);
```

**⚠️ Inconsistência**: Documentação antiga tinha: ADMINISTRATIVO, LABORATORIO, COMERCIAL, GERAL

---

### 8. `delegacao_status` ✅

```sql
CREATE TYPE delegacao_status AS ENUM (
  'PENDENTE',
  'EM_PROGRESSO',
  'CONCLUIDA',
  'REPROVADA'
);
```

**Status**: ✅ Implementado corretamente

---

### 9. `presenca_status` ⚠️

```sql
CREATE TYPE presenca_status AS ENUM (
  'PRESENTE',
  'ATRASO',
  'FALTA_JUSTIFICADA',
  'FALTA_INJUSTIFICADA',
  'FERIAS',
  'FOLGA'
);
```

**⚠️ Mudança**: Documentação antiga tinha FALTA (genérico) e ATESTADO

---

### 10. `performance_avaliacao` ⚠️

```sql
CREATE TYPE performance_avaliacao AS ENUM (
  'OTIMA',
  'BOA',
  'RUIM'
);
```

**⚠️ Mudança**: Documentação antiga tinha EXCELENTE, BOM, REGULAR, INSATISFATORIO

---

### 11. `financeiro_tipo` ⚠️

```sql
CREATE TYPE financeiro_tipo AS ENUM (
  'ENTRADA',
  'SAIDA'
);
```

**⚠️ Inconsistência**: Código TypeScript usa RECEITA, DESPESA

---

## 🔒 Row Level Security (RLS)

### Status Geral

✅ **TODAS as 18 tabelas possuem RLS HABILITADO**

Isso é uma **melhoria significativa** em relação ao relatório anterior que indicava ausência de RLS em várias tabelas críticas.

### Tabelas com RLS Habilitado

1. ✅ `colaboradores`
2. ✅ `clientes`
3. ✅ `tipos_os`
4. ✅ `centros_custo`
5. ✅ `ordens_servico`
6. ✅ `os_etapas`
7. ✅ `os_anexos`
8. ✅ `os_historico_status`
9. ✅ `colaborador_alocacoes_cc`
10. ✅ `colaborador_presenca`
11. ✅ `colaborador_performance`
12. ✅ `financeiro_lancamentos`
13. ✅ `audit_log`
14. ✅ `kv_store_5ad7fd2c`
15. ✅ `kv_store_02355049`
16. ✅ `delegacoes` (7 políticas implementadas)
17. ✅ `turnos`
18. ✅ `agendamentos`

### ⚠️ Atenção: Políticas RLS

Embora o RLS esteja **habilitado**, é necessário **auditar as políticas** implementadas para garantir que:

1. As políticas estão usando os campos corretos (`role_nivel`, não `tipo_colaborador`)
2. As regras de negócio estão implementadas corretamente
3. Não há brechas de segurança

**Referência**: Ver `src/docs/usuarios-sistema.md` para políticas RLS recomendadas.

---

## 🔌 Extensões PostgreSQL

### Extensões Instaladas

```sql
-- Extensões ativas no projeto
SELECT name, installed_version
FROM pg_available_extensions
WHERE installed_version IS NOT NULL;
```

| Extensão | Versão | Descrição |
|----------|--------|-----------|
| `plpgsql` | 1.0 | Linguagem procedural PL/pgSQL |
| `pgcrypto` | 1.3 | Funções criptográficas |
| `uuid-ossp` | 1.1 | Geração de UUIDs |
| `pg_stat_statements` | 1.11 | Estatísticas de queries |
| `pg_graphql` | 1.5.11 | Suporte GraphQL |
| `supabase_vault` | 0.3.1 | Vault do Supabase |

### Extensões Disponíveis (não instaladas)

- `postgis` - Dados geoespaciais
- `pg_cron` - Agendamento de jobs
- `http` - Cliente HTTP
- `vector` - Dados vetoriais para AI
- `pgroonga` - Full-text search avançado
- E mais 60+ extensões disponíveis

---

## 📜 Migrations Aplicadas

```sql
-- Ver histórico de migrations
SELECT version, name
FROM supabase_migrations.schema_migrations
ORDER BY version;
```

| Versão | Nome | Data |
|--------|------|------|
| `20251114121436` | `create_kv_table_5ad7fd2c` | 14/11/2025 |
| `20251117211549` | `create_kv_table_02355049` | 17/11/2025 |
| `20251118173518` | `create_delegacoes_table` | 18/11/2025 |

**Total**: 3 migrations aplicadas

---

## ⚠️ Inconsistências Conhecidas

### 🔴 CRÍTICAS

#### 1. Divergência ENUM `user_role_nivel`

**Problema**: Código TypeScript define roles que não existem no banco

**No Banco**:
```sql
'DIRETORIA', 'GESTOR_ADM', 'GESTOR_SETOR', 'COLABORADOR'
```

**No Código** (`src/lib/types.ts`):
```typescript
'DIRETORIA', 'GESTOR_ADMINISTRATIVO', 'GESTOR_ASSESSORIA',
'GESTOR_OBRAS', 'COLABORADOR_ADMINISTRATIVO', 'COLABORADOR_ASSESSORIA',
'COLABORADOR_OBRAS', 'MOBRA'
```

**Impacto**: 🔴 Sistema pode não funcionar corretamente
**Ação**: Decidir qual modelo usar e criar migration de correção

---

#### 2. Divergência ENUM `user_setor`

**No Banco**:
```sql
'ADM', 'ASSESSORIA', 'OBRAS'
```

**No Código**:
```typescript
'COM', 'ASS', 'OBR'
```

**Impacto**: 🔴 Setores não correspondem
**Ação**: Normalizar nomenclatura

---

#### 3. Divergência ENUM `financeiro_tipo`

**No Banco**:
```sql
'ENTRADA', 'SAIDA'
```

**No Código**:
```typescript
'RECEITA', 'DESPESA'
```

**Impacto**: 🔴 Módulo financeiro pode falhar
**Ação**: Alinhar nomenclatura

---

### 🟡 MODERADAS

#### 4. Políticas RLS podem usar campos incorretos

**Problema**: Migrations antigas podem referenciar `tipo_colaborador`

**Exemplo** (em `create_calendario_tables.sql`):
```sql
WHERE colaboradores.tipo_colaborador IN ('admin', 'gestor_comercial')
```

**Correto**:
```sql
WHERE colaboradores.role_nivel IN ('DIRETORIA', 'GESTOR_ADM')
```

**Impacto**: 🟡 Políticas RLS não funcionam
**Ação**: Auditar e corrigir todas as políticas RLS

---

#### 5. Faltam Índices de Performance

**Recomendado**:
```sql
CREATE INDEX idx_os_status ON ordens_servico(status_geral);
CREATE INDEX idx_os_cliente ON ordens_servico(cliente_id);
CREATE INDEX idx_os_responsavel ON ordens_servico(responsavel_id);
CREATE INDEX idx_os_created ON ordens_servico(data_entrada);

CREATE INDEX idx_etapas_os ON os_etapas(os_id);
CREATE INDEX idx_etapas_status ON os_etapas(status);
CREATE INDEX idx_etapas_responsavel ON os_etapas(responsavel_id);

CREATE INDEX idx_anexos_os ON os_anexos(os_id);
CREATE INDEX idx_anexos_etapa ON os_anexos(etapa_id);

CREATE INDEX idx_clientes_status ON clientes(status);
CREATE INDEX idx_clientes_responsavel ON clientes(responsavel_id);

CREATE INDEX idx_lancamentos_vencimento ON financeiro_lancamentos(data_vencimento);
CREATE INDEX idx_lancamentos_cc ON financeiro_lancamentos(cc_id);
```

**Impacto**: 🟡 Performance degradada com crescimento
**Ação**: Criar índices para otimização

---

## 📊 Diagrama de Relacionamentos

```
                    ┌─────────────────┐
                    │  auth.users     │
                    │  (Supabase)     │
                    └────────┬────────┘
                             │ 1:1
                             ▼
              ┌──────────────────────────────┐
              │     colaboradores            │
              │  - role_nivel (ENUM)         │
              │  - setor (ENUM)              │
              │  - RLS: ✅                   │
              └──┬───────────┬───────────────┘
                 │           │
        ┌────────┴─────┐     │ N:M (alocacao_cc)
        │ 1:N          │     │
        │              │     ▼
        │         ┌────┴──────────────┐
        │         │  centros_custo    │
        │         │  - tipo (ENUM)    │
        │         │  - RLS: ✅        │
        │         └───────┬───────────┘
        │                 │ 1:N
        ▼                 ▼
┌───────────────┐  ┌──────────────────────┐
│   clientes    │  │ financeiro_lancam.   │
│ - status (ENUM)│ │  - tipo (ENUM)       │
│ - RLS: ✅     │  │  - RLS: ✅           │
└───────┬───────┘  └──────────────────────┘
        │ 1:N
        ▼
┌─────────────────────────────┐
│     ordens_servico          │
│  - status_geral (ENUM)      │
│  - RLS: ✅                  │
└──┬───────────┬──────────────┘
   │ 1:N       │ 1:N
   │           │
   ▼           ▼
┌──────────┐  ┌──────────────┐
│os_etapas │  │  os_anexos   │
│- status  │  │- RLS: ✅     │
│- RLS: ✅ │  └──────────────┘
└──────────┘

┌──────────────────┐
│   delegacoes     │
│  - status (ENUM) │
│  - RLS: ✅ (7x)  │
└──────────────────┘

┌──────────────────┐     1:N     ┌─────────────────┐
│     turnos       │◄────────────┤  agendamentos   │
│  - RLS: ✅       │             │  - RLS: ✅      │
└──────────────────┘             └─────────────────┘
```

---

## 📝 Observações Importantes

### Soft Delete

- **Colaboradores**: usar campo `ativo` (boolean)
- **Clientes**: usar campo `status` = 'INATIVO'
- **OS**: usar campo `status_geral` = 'CANCELADA'
- **Turnos**: usar campo `ativo` (boolean)

### JSONB Fields

Os campos JSONB permitem flexibilidade sem alterar schema:
- `clientes.endereco`
- `os_etapas.dados_etapa`
- `financeiro_lancamentos.recorrencia`
- `tipos_os.etapas_padrao`
- `tipos_os.campos_customizados`

### Funções SQL Criadas

```sql
-- Verificar vagas de turno
CREATE FUNCTION verificar_vagas_turno(
  p_turno_id UUID,
  p_data DATE,
  p_horario_inicio TIME,
  p_horario_fim TIME
) RETURNS BOOLEAN;

-- Obter turnos disponíveis
CREATE FUNCTION obter_turnos_disponiveis(p_data DATE)
RETURNS TABLE (...);
```

### Triggers Implementados

```sql
-- Atualizar timestamp automaticamente
CREATE TRIGGER trigger_update_delegacoes_updated_at
  BEFORE UPDATE ON delegacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_delegacoes_updated_at();

CREATE TRIGGER trigger_atualizar_turnos
  BEFORE UPDATE ON turnos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp_calendario();

CREATE TRIGGER trigger_atualizar_agendamentos
  BEFORE UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp_calendario();
```

---

## ✅ Status da Implementação

1. ✅ Schema criado e implementado no Supabase
2. ✅ **RLS habilitado em TODAS as 18 tabelas**
3. ⚠️ ENUMs **NÃO** correspondem ao código TypeScript
4. ✅ Triggers de auditoria implementados (delegações, turnos, agendamentos)
5. ✅ Seed data inicial inserido
   - 6 colaboradores
   - 2 clientes
   - 13 tipos de OS
   - 46 OS cadastradas
   - 450 etapas
   - 5 turnos
   - 6 agendamentos
6. ⚠️ Faltam índices de performance
7. ⚠️ Políticas RLS precisam ser auditadas
8. ⏳ Views para dashboards (planejado)
9. ✅ Funções SQL para calendário implementadas

---

## 🚨 Ações Recomendadas (Prioridade)

### 🔴 URGENTE

1. **Corrigir ENUMs do banco** ou **atualizar código TypeScript**
   - Decidir modelo definitivo de roles e setores
   - Criar migration de correção
   - Testar sistema completo após mudança

2. **Auditar políticas RLS**
   - Verificar se usam campos corretos
   - Testar permissões de cada role
   - Corrigir políticas de turnos/agendamentos

3. **Alinhar nomenclatura financeiro**
   - ENTRADA/SAIDA vs RECEITA/DESPESA
   - Atualizar código ou banco

### 🟡 IMPORTANTE

4. **Criar índices de performance**
   - Índices em FKs principais
   - Índices em campos de busca frequente

5. **Adicionar mais validações**
   - Constraints adicionais
   - Check constraints de negócio

6. **Documentar políticas RLS**
   - Criar matriz de permissões vs tabelas
   - Testes automatizados de RLS

---

## 📞 Informações do Projeto

**Projeto Supabase**: MinervaV2
**ID**: zxfevlkssljndqqhxkjb
**Região**: sa-east-1 (São Paulo)
**Status**: ACTIVE_HEALTHY
**PostgreSQL**: 17.6.1.038
**Última Sincronização**: 19/11/2025 15:30 UTC

---

**Documento mantido por:** Equipe de Desenvolvimento Minerva ERP
**Próxima Revisão Recomendada:** Após correção de ENUMs

---

## 🔧 Pendências e Correções Necessárias

Esta seção lista todas as tabelas, functions, enums, triggers e políticas RLS que **precisam ser criadas ou corrigidas** para alinhar o banco de dados com o código TypeScript e as regras de negócio.

---

### 📋 Resumo de Pendências

| Item | Status | Prioridade | Impacto |
|------|--------|------------|---------|
| Corrigir ENUM `user_role_nivel` | ⚠️ Pendente | 🔴 CRÍTICA | Sistema pode falhar |
| Corrigir ENUM `user_setor` | ⚠️ Pendente | 🔴 CRÍTICA | Inconsistência de dados |
| Corrigir ENUM `financeiro_tipo` | ⚠️ Pendente | 🔴 ALTA | Módulo financeiro |
| Criar Índices de Performance | ⚠️ Pendente | 🟡 MÉDIA | Performance |
| Auditar Políticas RLS | ⚠️ Pendente | 🔴 ALTA | Segurança |
| Criar Functions de Validação | ⚠️ Pendente | 🟡 MÉDIA | Integridade |
| Criar Views de Dashboard | ⚠️ Pendente | 🟢 BAIXA | Relatórios |
| Criar Triggers de Auditoria | ⚠️ Pendente | 🟡 MÉDIA | Rastreabilidade |

---

## 🔴 PRIORIDADE CRÍTICA

### 1. Migration: Corrigir ENUM `user_role_nivel`

**Problema**: O banco possui apenas 4 roles genéricos, mas o código TypeScript usa 8 roles específicos.

**Arquivo**: `supabase/migrations/fix_user_role_nivel_enum.sql`

```sql
-- ==========================================
-- MIGRATION: Corrigir ENUM user_role_nivel
-- Data: Pendente
-- Descrição: Alinhar roles do banco com código TypeScript
-- ==========================================

-- OPÇÃO 1: Expandir ENUM (Recomendado se já existem dados)
-- Adicionar novos valores ao ENUM existente

-- Primeiro, renomear enum antigo
ALTER TYPE user_role_nivel RENAME TO user_role_nivel_old;

-- Criar novo enum com todos os valores
CREATE TYPE user_role_nivel AS ENUM (
  'MOBRA',                    -- Nível 1 - Sem acesso ao sistema
  'COLABORADOR_ADMINISTRATIVO',    -- Nível 2 - Colaborador setor administrativo
  'COLABORADOR_ASSESSORIA',   -- Nível 2 - Colaborador assessoria
  'COLABORADOR_OBRAS',        -- Nível 2 - Colaborador obras
  'GESTOR_ADMINISTRATIVO',         -- Nível 3 - Gestor comercial
  'GESTOR_ASSESSORIA',        -- Nível 3 - Gestor assessoria
  'GESTOR_OBRAS',             -- Nível 3 - Gestor obras
  'DIRETORIA'                 -- Nível 4 - Diretoria
);

-- Mapeamento de valores antigos para novos
-- COLABORADOR → COLABORADOR_ADMINISTRATIVO (padrão)
-- GESTOR_ADM → GESTOR_ADMINISTRATIVO
-- GESTOR_SETOR → GESTOR_ASSESSORIA (ou GESTOR_OBRAS, precisa análise)
-- DIRETORIA → DIRETORIA (mantém)

-- Atualizar coluna com conversão
ALTER TABLE colaboradores
  ALTER COLUMN role_nivel TYPE user_role_nivel
  USING (
    CASE role_nivel::text
      WHEN 'COLABORADOR' THEN 'COLABORADOR_ADMINISTRATIVO'::user_role_nivel
      WHEN 'GESTOR_ADM' THEN 'GESTOR_ADMINISTRATIVO'::user_role_nivel
      WHEN 'GESTOR_SETOR' THEN 'GESTOR_ASSESSORIA'::user_role_nivel
      WHEN 'DIRETORIA' THEN 'DIRETORIA'::user_role_nivel
      ELSE 'COLABORADOR_ADMINISTRATIVO'::user_role_nivel
    END
  );

-- Atualizar default
ALTER TABLE colaboradores
  ALTER COLUMN role_nivel SET DEFAULT 'COLABORADOR_ADMINISTRATIVO'::user_role_nivel;

-- Remover enum antigo
DROP TYPE user_role_nivel_old;

-- Comentários
COMMENT ON TYPE user_role_nivel IS 'Níveis hierárquicos de usuários: MOBRA (1), COLABORADOR_* (2), GESTOR_* (3), DIRETORIA (4)';

-- ==========================================
-- IMPORTANTE: Antes de executar, fazer backup!
-- ==========================================
```

**Ações Manuais Necessárias**:
1. ✅ Fazer backup completo do banco
2. ✅ Identificar usuários com `GESTOR_SETOR` e determinar setor correto
3. ✅ Executar migration em ambiente de DEV primeiro
4. ✅ Testar login de cada tipo de usuário
5. ✅ Executar em produção apenas após testes

---

### 2. Migration: Corrigir ENUM `user_setor`

**Problema**: Código usa `COM`, `ASS`, `OBR` mas banco usa `ADM`, `ASSESSORIA`, `OBRAS`.

**Arquivo**: `supabase/migrations/fix_user_setor_enum.sql`

```sql
-- ==========================================
-- MIGRATION: Corrigir ENUM user_setor
-- Data: Pendente
-- Descrição: Normalizar setores do sistema
-- ==========================================

-- Decisão: Usar nomes completos por clareza
-- ADM → COMERCIAL (renomear)
-- ASSESSORIA → ASSESSORIA (mantém)
-- OBRAS → OBRAS (mantém)

-- Renomear enum antigo
ALTER TYPE user_setor RENAME TO user_setor_old;

-- Criar novo enum
CREATE TYPE user_setor AS ENUM (
  'COMERCIAL',
  'ASSESSORIA',
  'OBRAS'
);

-- Atualizar tabela colaboradores
ALTER TABLE colaboradores
  ALTER COLUMN setor TYPE user_setor
  USING (
    CASE setor::text
      WHEN 'ADM' THEN 'COMERCIAL'::user_setor
      WHEN 'ASSESSORIA' THEN 'ASSESSORIA'::user_setor
      WHEN 'OBRAS' THEN 'OBRAS'::user_setor
      ELSE NULL::user_setor
    END
  );

-- Atualizar tabela tipos_os
ALTER TABLE tipos_os
  ALTER COLUMN setor_padrao TYPE user_setor
  USING (
    CASE setor_padrao::text
      WHEN 'ADM' THEN 'COMERCIAL'::user_setor
      WHEN 'ASSESSORIA' THEN 'ASSESSORIA'::user_setor
      WHEN 'OBRAS' THEN 'OBRAS'::user_setor
    END
  );

-- Remover enum antigo
DROP TYPE user_setor_old;

-- Comentários
COMMENT ON TYPE user_setor IS 'Setores do sistema: COMERCIAL, ASSESSORIA, OBRAS';

-- ==========================================
-- Atualizar código TypeScript após executar:
-- Mudar 'COM' → 'COMERCIAL'
-- Mudar 'ASS' → 'ASSESSORIA'
-- Mudar 'OBR' → 'OBRAS'
-- ==========================================
```

**Alternativa**: Manter abreviações no banco

```sql
-- ALTERNATIVA: Usar abreviações (menos verboso)
CREATE TYPE user_setor AS ENUM (
  'COM',  -- Comercial
  'ASS',  -- Assessoria
  'OBR'   -- Obras
);

-- Mapeamento:
-- ADM → COM
-- ASSESSORIA → ASS
-- OBRAS → OBR
```

---

### 3. Migration: Corrigir ENUM `financeiro_tipo`

**Problema**: Código usa `RECEITA`/`DESPESA`, banco usa `ENTRADA`/`SAIDA`.

**Arquivo**: `supabase/migrations/fix_financeiro_tipo_enum.sql`

```sql
-- ==========================================
-- MIGRATION: Corrigir ENUM financeiro_tipo
-- Data: Pendente
-- Descrição: Alinhar nomenclatura financeira
-- ==========================================

-- Decisão: Usar RECEITA/DESPESA (mais comum contabilmente)

ALTER TYPE financeiro_tipo RENAME TO financeiro_tipo_old;

CREATE TYPE financeiro_tipo AS ENUM (
  'RECEITA',
  'DESPESA'
);

-- Atualizar tabela (se houver dados)
ALTER TABLE financeiro_lancamentos
  ALTER COLUMN tipo TYPE financeiro_tipo
  USING (
    CASE tipo::text
      WHEN 'ENTRADA' THEN 'RECEITA'::financeiro_tipo
      WHEN 'SAIDA' THEN 'DESPESA'::financeiro_tipo
    END
  );

DROP TYPE financeiro_tipo_old;

COMMENT ON TYPE financeiro_tipo IS 'Tipos de lançamento financeiro: RECEITA ou DESPESA';
```

---

### 4. Migration: Corrigir Outros ENUMs Menores

**Arquivo**: `supabase/migrations/fix_minor_enums.sql`

```sql
-- ==========================================
-- MIGRATION: Corrigir ENUMs Menores
-- Data: Pendente
-- ==========================================

-- 1. Adicionar 'CONCLUIDA' ao os_etapa_status (se necessário)
ALTER TYPE os_etapa_status ADD VALUE IF NOT EXISTS 'CONCLUIDA';

-- 2. Expandir cliente_status (opcional)
-- Se precisar voltar nomenclatura antiga:
-- ALTER TYPE cliente_status RENAME VALUE 'ATIVO' TO 'CLIENTE_ATIVO';
-- ALTER TYPE cliente_status RENAME VALUE 'INATIVO' TO 'CLIENTE_INATIVO';

-- 3. Expandir cliente_tipo (adicionar tipos faltantes)
ALTER TYPE cliente_tipo ADD VALUE IF NOT EXISTS 'CONSTRUTORA';
ALTER TYPE cliente_tipo ADD VALUE IF NOT EXISTS 'INCORPORADORA';
ALTER TYPE cliente_tipo ADD VALUE IF NOT EXISTS 'INDUSTRIA';
ALTER TYPE cliente_tipo ADD VALUE IF NOT EXISTS 'COMERCIO';
ALTER TYPE cliente_tipo ADD VALUE IF NOT EXISTS 'OUTRO';

-- 4. Expandir cc_tipo (opcional)
ALTER TYPE cc_tipo ADD VALUE IF NOT EXISTS 'ADMINISTRATIVO';
ALTER TYPE cc_tipo ADD VALUE IF NOT EXISTS 'LABORATORIO';
ALTER TYPE cc_tipo ADD VALUE IF NOT EXISTS 'COMERCIAL';
ALTER TYPE cc_tipo ADD VALUE IF NOT EXISTS 'GERAL';

-- 5. Ajustar presenca_status (adicionar ATESTADO)
ALTER TYPE presenca_status ADD VALUE IF NOT EXISTS 'ATESTADO';

-- 6. Expandir performance_avaliacao
ALTER TYPE performance_avaliacao RENAME TO performance_avaliacao_old;

CREATE TYPE performance_avaliacao AS ENUM (
  'EXCELENTE',
  'BOM',
  'REGULAR',
  'INSATISFATORIO'
);

ALTER TABLE colaborador_performance
  ALTER COLUMN avaliacao TYPE performance_avaliacao
  USING (
    CASE avaliacao::text
      WHEN 'OTIMA' THEN 'EXCELENTE'::performance_avaliacao
      WHEN 'BOA' THEN 'BOM'::performance_avaliacao
      WHEN 'RUIM' THEN 'INSATISFATORIO'::performance_avaliacao
      ELSE 'REGULAR'::performance_avaliacao
    END
  );

DROP TYPE performance_avaliacao_old;
```

---

## 🔴 PRIORIDADE ALTA

### 5. Migration: Criar Índices de Performance

**Arquivo**: `supabase/migrations/create_performance_indexes.sql`

```sql
-- ==========================================
-- MIGRATION: Criar Índices de Performance
-- Data: Pendente
-- ==========================================

-- Índices para ordens_servico
CREATE INDEX IF NOT EXISTS idx_os_status
  ON ordens_servico(status_geral)
  WHERE status_geral != 'CANCELADA';

CREATE INDEX IF NOT EXISTS idx_os_cliente
  ON ordens_servico(cliente_id);

CREATE INDEX IF NOT EXISTS idx_os_responsavel
  ON ordens_servico(responsavel_id);

CREATE INDEX IF NOT EXISTS idx_os_created
  ON ordens_servico(data_entrada DESC);

CREATE INDEX IF NOT EXISTS idx_os_tipo
  ON ordens_servico(tipo_os_id);

CREATE INDEX IF NOT EXISTS idx_os_cc
  ON ordens_servico(cc_id)
  WHERE cc_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_os_prazo
  ON ordens_servico(data_prazo)
  WHERE data_prazo IS NOT NULL AND status_geral NOT IN ('CONCLUIDA', 'CANCELADA');

-- Índices para os_etapas
CREATE INDEX IF NOT EXISTS idx_etapas_os
  ON os_etapas(os_id);

CREATE INDEX IF NOT EXISTS idx_etapas_status
  ON os_etapas(status)
  WHERE status != 'APROVADA';

CREATE INDEX IF NOT EXISTS idx_etapas_responsavel
  ON os_etapas(responsavel_id)
  WHERE responsavel_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_etapas_ordem
  ON os_etapas(os_id, ordem);

-- Índices para os_anexos
CREATE INDEX IF NOT EXISTS idx_anexos_os
  ON os_anexos(os_id);

CREATE INDEX IF NOT EXISTS idx_anexos_etapa
  ON os_anexos(etapa_id)
  WHERE etapa_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_anexos_tipo
  ON os_anexos(tipo_anexo)
  WHERE tipo_anexo IS NOT NULL;

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_clientes_status
  ON clientes(status);

CREATE INDEX IF NOT EXISTS idx_clientes_responsavel
  ON clientes(responsavel_id)
  WHERE responsavel_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj
  ON clientes(cpf_cnpj)
  WHERE cpf_cnpj IS NOT NULL;

-- Índices para colaboradores
CREATE INDEX IF NOT EXISTS idx_colaboradores_ativo
  ON colaboradores(ativo)
  WHERE ativo = true;

CREATE INDEX IF NOT EXISTS idx_colaboradores_role
  ON colaboradores(role_nivel);

CREATE INDEX IF NOT EXISTS idx_colaboradores_setor
  ON colaboradores(setor)
  WHERE setor IS NOT NULL;

-- Índices para financeiro_lancamentos
CREATE INDEX IF NOT EXISTS idx_lancamentos_vencimento
  ON financeiro_lancamentos(data_vencimento DESC);

CREATE INDEX IF NOT EXISTS idx_lancamentos_tipo
  ON financeiro_lancamentos(tipo);

CREATE INDEX IF NOT EXISTS idx_lancamentos_cc
  ON financeiro_lancamentos(cc_id)
  WHERE cc_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lancamentos_cliente
  ON financeiro_lancamentos(cliente_id)
  WHERE cliente_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lancamentos_conciliado
  ON financeiro_lancamentos(conciliado)
  WHERE conciliado = false;

-- Índices para delegacoes
CREATE INDEX IF NOT EXISTS idx_delegacoes_status
  ON delegacoes(status_delegacao)
  WHERE status_delegacao != 'CONCLUIDA';

CREATE INDEX IF NOT EXISTS idx_delegacoes_prazo
  ON delegacoes(data_prazo)
  WHERE data_prazo IS NOT NULL AND status_delegacao IN ('PENDENTE', 'EM_PROGRESSO');

-- Índices para agendamentos
CREATE INDEX IF NOT EXISTS idx_agendamentos_data
  ON agendamentos(data DESC);

CREATE INDEX IF NOT EXISTS idx_agendamentos_status
  ON agendamentos(status);

CREATE INDEX IF NOT EXISTS idx_agendamentos_os
  ON agendamentos(os_id)
  WHERE os_id IS NOT NULL;

-- Índices para audit_log
CREATE INDEX IF NOT EXISTS idx_audit_created
  ON audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_usuario
  ON audit_log(usuario_id)
  WHERE usuario_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_tabela
  ON audit_log(tabela_afetada);

-- Índices compostos para queries comuns
CREATE INDEX IF NOT EXISTS idx_os_cliente_status
  ON ordens_servico(cliente_id, status_geral);

CREATE INDEX IF NOT EXISTS idx_etapas_os_status
  ON os_etapas(os_id, status);

COMMENT ON INDEX idx_os_status IS 'Otimiza filtros por status de OS';
COMMENT ON INDEX idx_os_prazo IS 'Otimiza busca de OS com prazo próximo';
```

---

### 6. Migration: Auditar e Corrigir Políticas RLS

**Arquivo**: `supabase/migrations/fix_rls_policies.sql`

```sql
-- ==========================================
-- MIGRATION: Corrigir Políticas RLS
-- Data: Pendente
-- Descrição: Corrigir referências a campos inexistentes
-- ==========================================

-- ==========================================
-- 1. CORRIGIR POLÍTICAS DE TURNOS
-- ==========================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Apenas admins podem gerenciar turnos" ON turnos;

-- Criar política corrigida
CREATE POLICY "turnos_manage_admin"
ON turnos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE colaboradores.id = auth.uid()
    AND colaboradores.role_nivel IN ('DIRETORIA', 'GESTOR_ADMINISTRATIVO')
  )
);

COMMENT ON POLICY "turnos_manage_admin" ON turnos IS 'Apenas Diretoria e Gestor Administrativo podem gerenciar turnos';

-- ==========================================
-- 2. CORRIGIR POLÍTICAS DE AGENDAMENTOS
-- ==========================================

DROP POLICY IF EXISTS "Admins podem gerenciar todos agendamentos" ON agendamentos;

CREATE POLICY "agendamentos_manage_admin"
ON agendamentos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE colaboradores.id = auth.uid()
    AND colaboradores.role_nivel IN ('DIRETORIA', 'GESTOR_ADMINISTRATIVO')
  )
);

-- ==========================================
-- 3. ADICIONAR POLÍTICAS FALTANTES
-- ==========================================

-- Políticas para COLABORADORES
CREATE POLICY IF NOT EXISTS "colaboradores_view_diretoria"
ON colaboradores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores c
    WHERE c.id = auth.uid()
    AND c.role_nivel = 'DIRETORIA'
  )
);

CREATE POLICY IF NOT EXISTS "colaboradores_view_gestor_comercial"
ON colaboradores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores c
    WHERE c.id = auth.uid()
    AND c.role_nivel = 'GESTOR_ADMINISTRATIVO'
  )
);

CREATE POLICY IF NOT EXISTS "colaboradores_view_gestor_setor"
ON colaboradores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores c
    WHERE c.id = auth.uid()
    AND c.role_nivel IN ('GESTOR_ASSESSORIA', 'GESTOR_OBRAS')
    AND colaboradores.setor = c.setor
  )
);

CREATE POLICY IF NOT EXISTS "colaboradores_view_self"
ON colaboradores FOR SELECT
USING (id = auth.uid());

-- Políticas para ORDENS_SERVICO
CREATE POLICY IF NOT EXISTS "os_view_diretoria"
ON ordens_servico FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel = 'DIRETORIA'
  )
);

CREATE POLICY IF NOT EXISTS "os_view_gestor_comercial"
ON ordens_servico FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel = 'GESTOR_ADMINISTRATIVO'
  )
);

CREATE POLICY IF NOT EXISTS "os_view_gestor_setor"
ON ordens_servico FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores c
    JOIN tipos_os t ON ordens_servico.tipo_os_id = t.id
    WHERE c.id = auth.uid()
    AND c.role_nivel IN ('GESTOR_ASSESSORIA', 'GESTOR_OBRAS')
    AND t.setor_padrao = c.setor
  )
);

CREATE POLICY IF NOT EXISTS "os_view_colaborador"
ON ordens_servico FOR SELECT
USING (
  responsavel_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM delegacoes
    WHERE delegacoes.os_id = ordens_servico.id
    AND delegacoes.delegado_id = auth.uid()
  )
);

-- Políticas para CLIENTES
CREATE POLICY IF NOT EXISTS "clientes_view_all_managers"
ON clientes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel IN ('DIRETORIA', 'GESTOR_ADMINISTRATIVO', 'GESTOR_ASSESSORIA', 'GESTOR_OBRAS')
  )
);

CREATE POLICY IF NOT EXISTS "clientes_view_responsible"
ON clientes FOR SELECT
USING (responsavel_id = auth.uid());

-- Políticas para FINANCEIRO
CREATE POLICY IF NOT EXISTS "financeiro_view_authorized"
ON financeiro_lancamentos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel IN ('DIRETORIA', 'GESTOR_ADMINISTRATIVO')
  )
);

CREATE POLICY IF NOT EXISTS "financeiro_manage_authorized"
ON financeiro_lancamentos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel IN ('DIRETORIA', 'GESTOR_ADMINISTRATIVO')
  )
);
```

---

## 🟡 PRIORIDADE MÉDIA

### 7. Functions: Validação de Permissões

**Arquivo**: `supabase/migrations/create_permission_functions.sql`

```sql
-- ==========================================
-- FUNCTIONS: Validação de Permissões
-- Data: Pendente
-- ==========================================

-- ==========================================
-- 1. Verificar se usuário pode ver OS
-- ==========================================
CREATE OR REPLACE FUNCTION pode_ver_os(
  p_user_id UUID,
  p_os_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_role user_role_nivel;
  v_setor user_setor;
  v_os_setor user_setor;
BEGIN
  -- Buscar role e setor do usuário
  SELECT role_nivel, setor INTO v_role, v_setor
  FROM colaboradores
  WHERE id = p_user_id AND ativo = true;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- MOBRA não vê OS
  IF v_role = 'MOBRA' THEN
    RETURN false;
  END IF;

  -- Diretoria vê tudo
  IF v_role = 'DIRETORIA' THEN
    RETURN true;
  END IF;

  -- Gestor Administrativo vê tudo
  IF v_role = 'GESTOR_ADMINISTRATIVO' THEN
    RETURN true;
  END IF;

  -- Buscar setor da OS
  SELECT t.setor_padrao INTO v_os_setor
  FROM ordens_servico os
  JOIN tipos_os t ON os.tipo_os_id = t.id
  WHERE os.id = p_os_id;

  -- Gestor de Setor vê apenas seu setor
  IF v_role IN ('GESTOR_ASSESSORIA', 'GESTOR_OBRAS') THEN
    RETURN v_setor = v_os_setor;
  END IF;

  -- Colaborador vê se é responsável ou delegado
  IF v_role LIKE 'COLABORADOR_%' THEN
    RETURN EXISTS (
      SELECT 1 FROM ordens_servico
      WHERE id = p_os_id
      AND (
        responsavel_id = p_user_id OR
        EXISTS (
          SELECT 1 FROM delegacoes
          WHERE os_id = p_os_id
          AND delegado_id = p_user_id
        )
      )
    );
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION pode_ver_os IS 'Verifica se usuário tem permissão para visualizar uma OS';

-- ==========================================
-- 2. Verificar se usuário pode editar OS
-- ==========================================
CREATE OR REPLACE FUNCTION pode_editar_os(
  p_user_id UUID,
  p_os_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_role user_role_nivel;
  v_setor user_setor;
  v_os_setor user_setor;
BEGIN
  SELECT role_nivel, setor INTO v_role, v_setor
  FROM colaboradores
  WHERE id = p_user_id AND ativo = true;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Diretoria pode editar tudo
  IF v_role = 'DIRETORIA' THEN
    RETURN true;
  END IF;

  -- Gestor Administrativo pode editar tudo
  IF v_role = 'GESTOR_ADMINISTRATIVO' THEN
    RETURN true;
  END IF;

  -- Buscar setor da OS
  SELECT t.setor_padrao INTO v_os_setor
  FROM ordens_servico os
  JOIN tipos_os t ON os.tipo_os_id = t.id
  WHERE os.id = p_os_id;

  -- Gestor de Setor pode editar apenas seu setor
  IF v_role IN ('GESTOR_ASSESSORIA', 'GESTOR_OBRAS') THEN
    RETURN v_setor = v_os_setor;
  END IF;

  -- Colaboradores não podem editar OS (apenas etapas)
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. Verificar se pode criar delegação
-- ==========================================
CREATE OR REPLACE FUNCTION pode_criar_delegacao(
  p_delegante_id UUID,
  p_delegado_id UUID,
  p_os_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_delegante_role user_role_nivel;
  v_delegante_setor user_setor;
  v_delegado_role user_role_nivel;
  v_delegado_setor user_setor;
  v_os_setor user_setor;
BEGIN
  -- Buscar dados do delegante
  SELECT role_nivel, setor INTO v_delegante_role, v_delegante_setor
  FROM colaboradores
  WHERE id = p_delegante_id AND ativo = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valido', false,
      'mensagem', 'Delegante não encontrado ou inativo'
    );
  END IF;

  -- Buscar dados do delegado
  SELECT role_nivel, setor INTO v_delegado_role, v_delegado_setor
  FROM colaboradores
  WHERE id = p_delegado_id AND ativo = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valido', false,
      'mensagem', 'Delegado não encontrado ou inativo'
    );
  END IF;

  -- Verificar auto-delegação
  IF p_delegante_id = p_delegado_id THEN
    RETURN jsonb_build_object(
      'valido', false,
      'mensagem', 'Não é possível delegar para si mesmo'
    );
  END IF;

  -- MOBRA não pode receber delegações
  IF v_delegado_role = 'MOBRA' THEN
    RETURN jsonb_build_object(
      'valido', false,
      'mensagem', 'Não é possível delegar para mão de obra (MOBRA)'
    );
  END IF;

  -- Apenas gestores+ podem delegar
  IF v_delegante_role NOT IN ('DIRETORIA', 'GESTOR_ADMINISTRATIVO', 'GESTOR_ASSESSORIA', 'GESTOR_OBRAS') THEN
    RETURN jsonb_build_object(
      'valido', false,
      'mensagem', 'Apenas gestores e diretoria podem delegar tarefas'
    );
  END IF;

  -- Buscar setor da OS
  SELECT t.setor_padrao INTO v_os_setor
  FROM ordens_servico os
  JOIN tipos_os t ON os.tipo_os_id = t.id
  WHERE os.id = p_os_id;

  -- Diretoria e Gestor Administrativo podem delegar para qualquer setor
  IF v_delegante_role IN ('DIRETORIA', 'GESTOR_ADMINISTRATIVO') THEN
    RETURN jsonb_build_object('valido', true);
  END IF;

  -- Gestor de Setor só pode delegar dentro do seu setor
  IF v_delegante_role IN ('GESTOR_ASSESSORIA', 'GESTOR_OBRAS') THEN
    IF v_delegante_setor != v_delegado_setor THEN
      RETURN jsonb_build_object(
        'valido', false,
        'mensagem', 'Gestor de setor só pode delegar dentro do próprio setor'
      );
    END IF;
  END IF;

  RETURN jsonb_build_object('valido', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. Obter permissões do usuário
-- ==========================================
CREATE OR REPLACE FUNCTION obter_permissoes_usuario(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user colaboradores%ROWTYPE;
  v_result JSONB;
BEGIN
  SELECT * INTO v_user
  FROM colaboradores
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  v_result := jsonb_build_object(
    'role', v_user.role_nivel,
    'setor', v_user.setor,
    'pode_criar_os', v_user.role_nivel NOT IN ('MOBRA', 'COLABORADOR_ADMINISTRATIVO', 'COLABORADOR_ASSESSORIA', 'COLABORADOR_OBRAS'),
    'pode_delegar', v_user.role_nivel IN ('DIRETORIA', 'GESTOR_ADMINISTRATIVO', 'GESTOR_ASSESSORIA', 'GESTOR_OBRAS'),
    'pode_aprovar', v_user.role_nivel IN ('DIRETORIA', 'GESTOR_ADMINISTRATIVO', 'GESTOR_ASSESSORIA', 'GESTOR_OBRAS'),
    'pode_gerenciar_usuarios', v_user.role_nivel = 'DIRETORIA',
    'acesso_financeiro', v_user.role_nivel IN ('DIRETORIA', 'GESTOR_ADMINISTRATIVO'),
    'acesso_todos_setores', v_user.role_nivel IN ('DIRETORIA', 'GESTOR_ADMINISTRATIVO')
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 8. Triggers: Auditoria Automática

**Arquivo**: `supabase/migrations/create_audit_triggers.sql`

```sql
-- ==========================================
-- TRIGGERS: Auditoria Automática
-- Data: Pendente
-- ==========================================

-- ==========================================
-- 1. Trigger para mudanças de role
-- ==========================================
CREATE OR REPLACE FUNCTION audit_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role_nivel IS DISTINCT FROM NEW.role_nivel THEN
    INSERT INTO audit_log (
      usuario_id,
      acao,
      tabela_afetada,
      registro_id_afetado,
      dados_antigos,
      dados_novos
    ) VALUES (
      auth.uid(),
      'UPDATE_ROLE',
      'colaboradores',
      NEW.id::text,
      jsonb_build_object(
        'role_nivel', OLD.role_nivel,
        'setor', OLD.setor
      ),
      jsonb_build_object(
        'role_nivel', NEW.role_nivel,
        'setor', NEW.setor
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_audit_role_change ON colaboradores;

CREATE TRIGGER trigger_audit_role_change
  AFTER UPDATE ON colaboradores
  FOR EACH ROW
  WHEN (OLD.role_nivel IS DISTINCT FROM NEW.role_nivel)
  EXECUTE FUNCTION audit_role_change();

-- ==========================================
-- 2. Trigger para criação de OS
-- ==========================================
CREATE OR REPLACE FUNCTION audit_os_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    usuario_id,
    acao,
    tabela_afetada,
    registro_id_afetado,
    dados_novos
  ) VALUES (
    auth.uid(),
    'CREATE_OS',
    'ordens_servico',
    NEW.id::text,
    jsonb_build_object(
      'codigo_os', NEW.codigo_os,
      'cliente_id', NEW.cliente_id,
      'tipo_os_id', NEW.tipo_os_id,
      'responsavel_id', NEW.responsavel_id
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_audit_os_creation ON ordens_servico;

CREATE TRIGGER trigger_audit_os_creation
  AFTER INSERT ON ordens_servico
  FOR EACH ROW
  EXECUTE FUNCTION audit_os_creation();

-- ==========================================
-- 3. Trigger para auto-código de OS
-- ==========================================
CREATE OR REPLACE FUNCTION gerar_codigo_os()
RETURNS TRIGGER AS $$
DECLARE
  v_ano INTEGER;
  v_contador INTEGER;
  v_codigo TEXT;
BEGIN
  IF NEW.codigo_os IS NULL THEN
    v_ano := EXTRACT(YEAR FROM NEW.data_entrada);

    -- Buscar último código do ano
    SELECT COALESCE(
      MAX(
        SUBSTRING(codigo_os FROM 'OS-' || v_ano::text || '-(\d+)')::INTEGER
      ), 0
    ) + 1 INTO v_contador
    FROM ordens_servico
    WHERE codigo_os LIKE 'OS-' || v_ano::text || '-%';

    NEW.codigo_os := 'OS-' || v_ano || '-' || LPAD(v_contador::TEXT, 4, '0');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_gerar_codigo_os ON ordens_servico;

CREATE TRIGGER trigger_gerar_codigo_os
  BEFORE INSERT ON ordens_servico
  FOR EACH ROW
  EXECUTE FUNCTION gerar_codigo_os();

-- ==========================================
-- 4. Trigger para validar soma de alocação
-- ==========================================
CREATE OR REPLACE FUNCTION validar_alocacao_cc()
RETURNS TRIGGER AS $$
DECLARE
  v_total_alocado NUMERIC;
BEGIN
  SELECT COALESCE(SUM(percentual_alocado), 0) INTO v_total_alocado
  FROM colaborador_alocacoes_cc
  WHERE colaborador_id = NEW.colaborador_id
  AND (cc_id != NEW.cc_id OR TG_OP = 'INSERT');

  IF v_total_alocado + NEW.percentual_alocado > 100 THEN
    RAISE EXCEPTION 'Soma das alocações do colaborador não pode exceder 100%%';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validar_alocacao_cc ON colaborador_alocacoes_cc;

CREATE TRIGGER trigger_validar_alocacao_cc
  BEFORE INSERT OR UPDATE ON colaborador_alocacoes_cc
  FOR EACH ROW
  EXECUTE FUNCTION validar_alocacao_cc();
```

---

## 🟢 PRIORIDADE BAIXA

### 9. Views: Dashboards e Relatórios

**Arquivo**: `supabase/migrations/create_dashboard_views.sql`

```sql
-- ==========================================
-- VIEWS: Dashboards e Relatórios
-- Data: Pendente
-- ==========================================

-- ==========================================
-- 1. View: OS Ativas por Status
-- ==========================================
CREATE OR REPLACE VIEW v_os_por_status AS
SELECT
  status_geral,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE data_prazo < NOW()) AS atrasadas,
  COUNT(*) FILTER (WHERE data_prazo BETWEEN NOW() AND NOW() + INTERVAL '7 days') AS urgentes
FROM ordens_servico
WHERE status_geral NOT IN ('CONCLUIDA', 'CANCELADA')
GROUP BY status_geral;

COMMENT ON VIEW v_os_por_status IS 'Resumo de OS ativas agrupadas por status';

-- ==========================================
-- 2. View: Performance de Colaboradores
-- ==========================================
CREATE OR REPLACE VIEW v_performance_colaboradores AS
SELECT
  c.id,
  c.nome_completo,
  c.role_nivel,
  c.setor,
  COUNT(DISTINCT os.id) AS total_os_responsavel,
  COUNT(DISTINCT d.id) AS total_delegacoes_recebidas,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status_delegacao = 'CONCLUIDA') AS delegacoes_concluidas,
  ROUND(
    COUNT(DISTINCT d.id) FILTER (WHERE d.status_delegacao = 'CONCLUIDA')::NUMERIC /
    NULLIF(COUNT(DISTINCT d.id), 0) * 100,
    2
  ) AS taxa_conclusao_delegacoes
FROM colaboradores c
LEFT JOIN ordens_servico os ON os.responsavel_id = c.id
LEFT JOIN delegacoes d ON d.delegado_id = c.id
WHERE c.ativo = true
GROUP BY c.id, c.nome_completo, c.role_nivel, c.setor;

-- ==========================================
-- 3. View: OS com Dados Completos
-- ==========================================
CREATE OR REPLACE VIEW v_os_completa AS
SELECT
  os.id,
  os.codigo_os,
  os.status_geral,
  os.data_entrada,
  os.data_prazo,
  os.data_conclusao,
  os.valor_proposta,
  os.valor_contrato,

  -- Cliente
  cli.nome_razao_social AS cliente_nome,
  cli.status AS cliente_status,

  -- Tipo OS
  t.codigo AS tipo_codigo,
  t.nome AS tipo_nome,
  t.setor_padrao AS setor,

  -- Responsável
  resp.nome_completo AS responsavel_nome,
  resp.role_nivel AS responsavel_role,

  -- Criador
  cria.nome_completo AS criado_por_nome,

  -- Centro de Custo
  cc.nome AS cc_nome,
  cc.tipo AS cc_tipo,

  -- Métricas
  (
    SELECT COUNT(*)
    FROM os_etapas e
    WHERE e.os_id = os.id
  ) AS total_etapas,
  (
    SELECT COUNT(*)
    FROM os_etapas e
    WHERE e.os_id = os.id
    AND e.status = 'APROVADA'
  ) AS etapas_aprovadas,
  (
    SELECT COUNT(*)
    FROM os_anexos a
    WHERE a.os_id = os.id
  ) AS total_anexos,

  -- Delegações
  (
    SELECT COUNT(*)
    FROM delegacoes d
    WHERE d.os_id = os.id
    AND d.status_delegacao != 'CONCLUIDA'
  ) AS delegacoes_pendentes

FROM ordens_servico os
INNER JOIN clientes cli ON cli.id = os.cliente_id
INNER JOIN tipos_os t ON t.id = os.tipo_os_id
LEFT JOIN colaboradores resp ON resp.id = os.responsavel_id
LEFT JOIN colaboradores cria ON cria.id = os.criado_por_id
LEFT JOIN centros_custo cc ON cc.id = os.cc_id;

COMMENT ON VIEW v_os_completa IS 'View com dados completos de OS para relatórios';

-- ==========================================
-- 4. View: Resumo Financeiro
-- ==========================================
CREATE OR REPLACE VIEW v_resumo_financeiro AS
SELECT
  DATE_TRUNC('month', data_vencimento) AS mes,
  tipo,
  COUNT(*) AS total_lancamentos,
  SUM(valor) AS total_valor,
  SUM(valor) FILTER (WHERE conciliado = true) AS valor_conciliado,
  SUM(valor) FILTER (WHERE conciliado = false) AS valor_pendente,
  COUNT(*) FILTER (WHERE data_pagamento IS NULL AND data_vencimento < CURRENT_DATE) AS atrasados
FROM financeiro_lancamentos
GROUP BY DATE_TRUNC('month', data_vencimento), tipo
ORDER BY mes DESC, tipo;

-- ==========================================
-- 5. View: Calendário de Agendamentos
-- ==========================================
CREATE OR REPLACE VIEW v_calendario_resumo AS
SELECT
  a.data,
  t.hora_inicio,
  t.hora_fim,
  t.vagas_total,
  COUNT(a.id) AS vagas_ocupadas,
  t.vagas_total - COUNT(a.id) AS vagas_disponiveis,
  array_agg(a.categoria) FILTER (WHERE a.status = 'confirmado') AS categorias_agendadas
FROM turnos t
CROSS JOIN generate_series(
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  INTERVAL '1 day'
)::date AS data
LEFT JOIN agendamentos a ON a.turno_id = t.id AND a.data = data
WHERE t.ativo = true
GROUP BY a.data, t.id, t.hora_inicio, t.hora_fim, t.vagas_total
ORDER BY a.data, t.hora_inicio;
```

---

## 📝 Checklist de Execução

### Fase 1: Correções Críticas (Semana 1)

- [ ] **Fazer backup completo do banco de dados**
- [ ] Executar `fix_user_role_nivel_enum.sql` em DEV
- [ ] Testar login de cada tipo de usuário
- [ ] Executar `fix_user_setor_enum.sql` em DEV
- [ ] Atualizar código TypeScript (se necessário)
- [ ] Executar `fix_financeiro_tipo_enum.sql`
- [ ] Testar módulo financeiro
- [ ] **Executar em PRODUÇÃO após testes**

### Fase 2: Performance e Segurança (Semana 2)

- [ ] Executar `create_performance_indexes.sql`
- [ ] Analisar planos de execução (EXPLAIN ANALYZE)
- [ ] Executar `fix_rls_policies.sql`
- [ ] Testar permissões de cada role manualmente
- [ ] Executar `create_permission_functions.sql`

### Fase 3: Auditoria e Relatórios (Semana 3)

- [ ] Executar `fix_minor_enums.sql`
- [ ] Executar `create_audit_triggers.sql`
- [ ] Testar auditoria de ações
- [ ] Executar `create_dashboard_views.sql`
- [ ] Criar dashboards usando as views

---

## 📚 Documentos Relacionados

- **`src/docs/usuarios-sistema.md`**: Sistema completo de usuários, roles e permissões
- **`src/lib/types.ts`**: Definições de tipos TypeScript
- **`supabase/migrations/`**: Migrations aplicadas ao banco
