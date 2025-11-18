# Schema do Banco de Dados - Minerva ERP

**Última atualização:** 14/11/2024  
**Sistema:** Minerva Engenharia - Sistema de Gestão Integrada (ERP)  
**Banco de Dados:** PostgreSQL (Supabase)

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Tabelas Principais](#tabelas-principais)
3. [Tabelas de Relacionamento](#tabelas-de-relacionamento)
4. [Tabelas de Auditoria](#tabelas-de-auditoria)
5. [Tipos Customizados (ENUMS)](#tipos-customizados-enums)
6. [Diagrama de Relacionamentos](#diagrama-de-relacionamentos)

---

## Visão Geral

O banco de dados do Minerva ERP é estruturado para gerenciar:
- **Ordens de Serviço (OS)** com fluxo de trabalho completo
- **Clientes** e leads
- **Colaboradores** com hierarquia e permissões
- **Centros de Custo** e alocação
- **Financeiro** (lançamentos e conciliação)
- **Agendamentos** e calendário
- **Auditoria** completa de ações
- **Presença** e **Performance** de colaboradores

---

## Tabelas Principais

### 1. `colaboradores`

Armazena todos os colaboradores/usuários do sistema (vinculado ao auth.users do Supabase).

```sql
CREATE TABLE public.colaboradores (
  id uuid NOT NULL,
  nome_completo text NOT NULL,
  cpf character varying UNIQUE,
  telefone character varying,
  data_admissao date,
  data_demissao date,
  ativo boolean DEFAULT true,
  role_nivel USER-DEFINED NOT NULL DEFAULT 'COLABORADOR'::user_role_nivel,
  setor USER-DEFINED,
  custo_mensal numeric DEFAULT 0.00,
  email text,
  
  CONSTRAINT colaboradores_pkey PRIMARY KEY (id),
  CONSTRAINT colaboradores_id_fkey FOREIGN KEY (id) 
    REFERENCES auth.users(id)
);
```

**Campos principais:**
- `id`: UUID do usuário (vem do Supabase Auth)
- `role_nivel`: Nível de acesso (COLABORADOR, COORDENADOR, GESTOR, DIRETOR)
- `setor`: Setor do colaborador (ADM, OBRAS, LABORATORIO, FINANCEIRO, COMERCIAL)
- `custo_mensal`: Custo mensal do colaborador para rateio de CC

---

### 2. `clientes`

Gerencia clientes e leads do sistema.

```sql
CREATE TABLE public.clientes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status USER-DEFINED NOT NULL DEFAULT 'LEAD'::cliente_status,
  nome_razao_social text NOT NULL,
  cpf_cnpj character varying UNIQUE,
  email text,
  telefone character varying,
  nome_responsavel text,
  tipo_cliente USER-DEFINED,
  endereco jsonb,
  observacoes text,
  responsavel_id uuid,
  
  CONSTRAINT clientes_pkey PRIMARY KEY (id),
  CONSTRAINT clientes_responsavel_id_fkey FOREIGN KEY (responsavel_id) 
    REFERENCES public.colaboradores(id)
);
```

**Campos principais:**
- `status`: LEAD, CLIENTE_ATIVO, CLIENTE_INATIVO
- `tipo_cliente`: PESSOA_FISICA, CONDOMINIO, CONSTRUTORA, INCORPORADORA, INDUSTRIA, COMERCIO, OUTRO
- `endereco`: JSONB com estrutura flexível de endereço
- `responsavel_id`: Colaborador responsável pelo cliente

---

### 3. `tipos_os`

Define os tipos de Ordem de Serviço disponíveis no sistema.

```sql
CREATE TABLE public.tipos_os (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codigo character varying NOT NULL UNIQUE,
  nome text NOT NULL,
  setor_padrao USER-DEFINED NOT NULL,
  descricao text,
  categoria character varying,
  fluxo_especial boolean DEFAULT false,
  requer_cliente boolean DEFAULT true,
  ativo boolean DEFAULT true,
  etapas_padrao jsonb DEFAULT '[]'::jsonb,
  campos_customizados jsonb DEFAULT '{}'::jsonb,
  
  CONSTRAINT tipos_os_pkey PRIMARY KEY (id)
);
```

**Campos principais:**
- `codigo`: Código único (ex: OS-01, OS-02, OS-13)
- `fluxo_especial`: Se possui fluxo diferenciado (Lead → Cliente)
- `requer_cliente`: Se requer cliente pré-cadastrado
- `etapas_padrao`: Array JSONB com etapas padrão do fluxo

**Exemplos de tipos:**
- `OS-01`: Novo Lead - Obras (fluxo_especial: true)
- `OS-07`: Termo de Comunicação de Reforma
- `OS-13`: Start de Contrato de Obra

---

### 4. `ordens_servico`

Tabela central do sistema - armazena todas as Ordens de Serviço.

```sql
CREATE TABLE public.ordens_servico (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codigo_os character varying UNIQUE,
  cliente_id uuid NOT NULL,
  tipo_os_id uuid NOT NULL,
  responsavel_id uuid,
  criado_por_id uuid NOT NULL,
  cc_id uuid,
  status_geral USER-DEFINED NOT NULL DEFAULT 'EM_TRIAGEM'::os_status_geral,
  data_entrada timestamp with time zone NOT NULL DEFAULT now(),
  data_prazo timestamp with time zone,
  data_conclusao timestamp with time zone,
  valor_proposta numeric,
  valor_contrato numeric,
  descricao text,
  
  CONSTRAINT ordens_servico_pkey PRIMARY KEY (id),
  CONSTRAINT ordens_servico_cliente_id_fkey FOREIGN KEY (cliente_id) 
    REFERENCES public.clientes(id),
  CONSTRAINT ordens_servico_tipo_os_id_fkey FOREIGN KEY (tipo_os_id) 
    REFERENCES public.tipos_os(id),
  CONSTRAINT ordens_servico_responsavel_id_fkey FOREIGN KEY (responsavel_id) 
    REFERENCES public.colaboradores(id),
  CONSTRAINT ordens_servico_criado_por_id_fkey FOREIGN KEY (criado_por_id) 
    REFERENCES public.colaboradores(id),
  CONSTRAINT ordens_servico_cc_id_fkey FOREIGN KEY (cc_id) 
    REFERENCES public.centros_custo(id)
);
```

**Campos principais:**
- `codigo_os`: Código único da OS (ex: OS-2025-001)
- `status_geral`: Status global da OS (EM_TRIAGEM, EM_ANDAMENTO, CONCLUIDA, CANCELADA)
- `cc_id`: Centro de Custo associado (opcional)
- `valor_proposta`: Valor da proposta comercial
- `valor_contrato`: Valor do contrato fechado

---

### 5. `os_etapas`

Armazena as etapas de cada OS (fluxo de trabalho).

```sql
CREATE TABLE public.os_etapas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  os_id uuid NOT NULL,
  nome_etapa text NOT NULL,
  ordem smallint DEFAULT 0,
  status USER-DEFINED NOT NULL DEFAULT 'PENDENTE'::os_etapa_status,
  responsavel_id uuid,
  aprovador_id uuid,
  comentarios_aprovacao text,
  data_inicio timestamp with time zone,
  data_conclusao timestamp with time zone,
  dados_etapa jsonb,
  
  CONSTRAINT os_etapas_pkey PRIMARY KEY (id),
  CONSTRAINT os_etapas_os_id_fkey FOREIGN KEY (os_id) 
    REFERENCES public.ordens_servico(id),
  CONSTRAINT os_etapas_responsavel_id_fkey FOREIGN KEY (responsavel_id) 
    REFERENCES public.colaboradores(id),
  CONSTRAINT os_etapas_aprovador_id_fkey FOREIGN KEY (aprovador_id) 
    REFERENCES public.colaboradores(id)
);
```

**Campos principais:**
- `ordem`: Ordem de execução da etapa (1, 2, 3...)
- `status`: PENDENTE, EM_ANDAMENTO, AGUARDANDO_APROVACAO, APROVADA, CONCLUIDA
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

---

### 6. `os_anexos`

Armazena todos os anexos/documentos relacionados às OS.

```sql
CREATE TABLE public.os_anexos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  os_id uuid NOT NULL,
  etapa_id uuid,
  nome_arquivo text NOT NULL,
  path_storage text NOT NULL,
  tipo_anexo text,
  comentarios text,
  
  CONSTRAINT os_anexos_pkey PRIMARY KEY (id),
  CONSTRAINT os_anexos_os_id_fkey FOREIGN KEY (os_id) 
    REFERENCES public.ordens_servico(id),
  CONSTRAINT os_anexos_etapa_id_fkey FOREIGN KEY (etapa_id) 
    REFERENCES public.os_etapas(id)
);
```

**Campos principais:**
- `path_storage`: Caminho completo no Supabase Storage
- `etapa_id`: Etapa específica do anexo (opcional)
- `tipo_anexo`: foto_visita, memorial, contrato, proposta, etc.

---

### 7. `centros_custo`

Gerencia os Centros de Custo (CCs) do sistema.

```sql
CREATE TABLE public.centros_custo (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo USER-DEFINED NOT NULL,
  cliente_id uuid,
  valor_global numeric DEFAULT 0.00,
  status_cc USER-DEFINED DEFAULT 'EM_ANDAMENTO'::os_status_geral,
  
  CONSTRAINT centros_custo_pkey PRIMARY KEY (id),
  CONSTRAINT centros_custo_cliente_id_fkey FOREIGN KEY (cliente_id) 
    REFERENCES public.clientes(id)
);
```

**Campos principais:**
- `tipo`: OBRA, ADMINISTRATIVO, LABORATORIO, COMERCIAL, GERAL
- `cliente_id`: Cliente vinculado ao CC (se for uma obra)
- `valor_global`: Valor total do CC

---

### 8. `agendamentos`

Gerencia eventos do calendário.

```sql
CREATE TABLE public.agendamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  os_id uuid,
  titulo text NOT NULL,
  descricao text,
  data_inicio timestamp with time zone NOT NULL,
  data_fim timestamp with time zone NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'AGENDADO'::agendamento_status,
  
  CONSTRAINT agendamentos_pkey PRIMARY KEY (id),
  CONSTRAINT agendamentos_os_id_fkey FOREIGN KEY (os_id) 
    REFERENCES public.ordens_servico(id)
);
```

**Campos principais:**
- `os_id`: OS relacionada ao agendamento (opcional)
- `status`: AGENDADO, EM_ANDAMENTO, CONCLUIDO, CANCELADO

---

### 9. `financeiro_lancamentos`

Gerencia lançamentos financeiros (receitas e despesas).

```sql
CREATE TABLE public.financeiro_lancamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  criado_por_id uuid NOT NULL,
  descricao text NOT NULL,
  valor numeric NOT NULL,
  tipo USER-DEFINED NOT NULL,
  data_vencimento date NOT NULL,
  data_pagamento date,
  conciliado boolean NOT NULL DEFAULT false,
  cc_id uuid,
  cliente_id uuid,
  recorrencia jsonb,
  url_nota_fiscal text,
  
  CONSTRAINT financeiro_lancamentos_pkey PRIMARY KEY (id),
  CONSTRAINT financeiro_lancamentos_criado_por_id_fkey FOREIGN KEY (criado_por_id) 
    REFERENCES public.colaboradores(id),
  CONSTRAINT financeiro_lancamentos_cc_id_fkey FOREIGN KEY (cc_id) 
    REFERENCES public.centros_custo(id),
  CONSTRAINT financeiro_lancamentos_cliente_id_fkey FOREIGN KEY (cliente_id) 
    REFERENCES public.clientes(id)
);
```

**Campos principais:**
- `tipo`: RECEITA, DESPESA
- `conciliado`: Se o lançamento foi conciliado com extrato bancário
- `recorrencia`: JSONB para lançamentos recorrentes

---

### 10. `kv_store_5ad7fd2c`

Armazena dados em formato chave-valor (KV Store).

```sql
CREATE TABLE public.kv_store_5ad7fd2c (
  key text NOT NULL,
  value jsonb NOT NULL,
  
  CONSTRAINT kv_store_5ad7fd2c_pkey PRIMARY KEY (key)
);
```

**Uso:**
- Configurações do sistema
- Cache de dados
- Dados temporários

---

## Tabelas de Relacionamento

### 1. `agendamento_colaboradores`

Relaciona colaboradores aos agendamentos (N para N).

```sql
CREATE TABLE public.agendamento_colaboradores (
  agendamento_id uuid NOT NULL,
  colaborador_id uuid NOT NULL,
  
  CONSTRAINT agendamento_colaboradores_pkey 
    PRIMARY KEY (agendamento_id, colaborador_id),
  CONSTRAINT agendamento_colaboradores_agendamento_id_fkey 
    FOREIGN KEY (agendamento_id) REFERENCES public.agendamentos(id),
  CONSTRAINT agendamento_colaboradores_colaborador_id_fkey 
    FOREIGN KEY (colaborador_id) REFERENCES public.colaboradores(id)
);
```

---

### 2. `colaborador_alocacoes_cc`

Aloca colaboradores aos Centros de Custo com percentual.

```sql
CREATE TABLE public.colaborador_alocacoes_cc (
  colaborador_id uuid NOT NULL,
  cc_id uuid NOT NULL,
  percentual_alocado numeric NOT NULL CHECK (
    percentual_alocado > 0 AND percentual_alocado <= 100
  ),
  
  CONSTRAINT colaborador_alocacoes_cc_pkey 
    PRIMARY KEY (colaborador_id, cc_id),
  CONSTRAINT colaborador_alocacoes_cc_colaborador_id_fkey 
    FOREIGN KEY (colaborador_id) REFERENCES public.colaboradores(id),
  CONSTRAINT colaborador_alocacoes_cc_cc_id_fkey 
    FOREIGN KEY (cc_id) REFERENCES public.centros_custo(id)
);
```

**Regra de negócio:**
- A soma dos `percentual_alocado` de um colaborador deve ser <= 100%

---

## Tabelas de Auditoria

### 1. `audit_log`

Registra todas as ações importantes do sistema.

```sql
CREATE TABLE public.audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  usuario_id uuid,
  acao text NOT NULL,
  tabela_afetada text NOT NULL,
  registro_id_afetado text NOT NULL,
  dados_antigos jsonb,
  dados_novos jsonb,
  
  CONSTRAINT audit_log_pkey PRIMARY KEY (id),
  CONSTRAINT audit_log_usuario_id_fkey FOREIGN KEY (usuario_id) 
    REFERENCES public.colaboradores(id)
);
```

**Exemplos de ações:**
- `CREATE_OS`
- `UPDATE_OS_STATUS`
- `APPROVE_ETAPA`
- `DELETE_CLIENTE`

---

### 2. `os_historico_status`

Histórico de mudanças de status das OS.

```sql
CREATE TABLE public.os_historico_status (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  os_id uuid NOT NULL,
  status_anterior USER-DEFINED,
  status_novo USER-DEFINED NOT NULL,
  alterado_por_id uuid,
  observacoes text,
  
  CONSTRAINT os_historico_status_pkey PRIMARY KEY (id),
  CONSTRAINT os_historico_status_os_id_fkey FOREIGN KEY (os_id) 
    REFERENCES public.ordens_servico(id),
  CONSTRAINT os_historico_status_alterado_por_id_fkey FOREIGN KEY (alterado_por_id) 
    REFERENCES public.colaboradores(id)
);
```

---

### 3. `colaborador_presenca`

Registra presença/ausência dos colaboradores.

```sql
CREATE TABLE public.colaborador_presenca (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL,
  data date NOT NULL,
  status USER-DEFINED NOT NULL,
  justificativa text,
  registrado_por_id uuid,
  
  CONSTRAINT colaborador_presenca_pkey PRIMARY KEY (id),
  CONSTRAINT colaborador_presenca_colaborador_id_fkey 
    FOREIGN KEY (colaborador_id) REFERENCES public.colaboradores(id),
  CONSTRAINT colaborador_presenca_registrado_por_id_fkey 
    FOREIGN KEY (registrado_por_id) REFERENCES public.colaboradores(id)
);
```

**Status possíveis:**
- `PRESENTE`
- `FALTA`
- `FALTA_JUSTIFICADA`
- `ATESTADO`
- `FERIAS`

---

### 4. `colaborador_performance`

Avaliações de performance dos colaboradores.

```sql
CREATE TABLE public.colaborador_performance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL,
  avaliador_id uuid NOT NULL,
  data_avaliacao date NOT NULL DEFAULT CURRENT_DATE,
  avaliacao USER-DEFINED NOT NULL,
  justificativa text,
  
  CONSTRAINT colaborador_performance_pkey PRIMARY KEY (id),
  CONSTRAINT colaborador_performance_colaborador_id_fkey 
    FOREIGN KEY (colaborador_id) REFERENCES public.colaboradores(id),
  CONSTRAINT colaborador_performance_avaliador_id_fkey 
    FOREIGN KEY (avaliador_id) REFERENCES public.colaboradores(id)
);
```

**Avaliações possíveis:**
- `EXCELENTE`
- `BOM`
- `REGULAR`
- `INSATISFATORIO`

---

## Tipos Customizados (ENUMS)

### 1. `user_role_nivel`

```sql
CREATE TYPE user_role_nivel AS ENUM (
  'COLABORADOR',
  'COORDENADOR',
  'GESTOR',
  'DIRETOR'
);
```

**Hierarquia de permissões:**
1. **DIRETOR**: Acesso total, dashboards executivos
2. **GESTOR**: Aprovações, relatórios, gestão de setores
3. **COORDENADOR**: Delegação de tarefas, acompanhamento de equipe
4. **COLABORADOR**: Execução de tarefas, preenchimento de formulários

---

### 2. `setor_colaborador`

```sql
CREATE TYPE setor_colaborador AS ENUM (
  'ADM',
  'OBRAS',
  'LABORATORIO',
  'FINANCEIRO',
  'COMERCIAL'
);
```

---

### 3. `cliente_status`

```sql
CREATE TYPE cliente_status AS ENUM (
  'LEAD',
  'CLIENTE_ATIVO',
  'CLIENTE_INATIVO'
);
```

---

### 4. `tipo_cliente`

```sql
CREATE TYPE tipo_cliente AS ENUM (
  'PESSOA_FISICA',
  'CONDOMINIO',
  'CONSTRUTORA',
  'INCORPORADORA',
  'INDUSTRIA',
  'COMERCIO',
  'OUTRO'
);
```

---

### 5. `os_status_geral`

```sql
CREATE TYPE os_status_geral AS ENUM (
  'EM_TRIAGEM',
  'EM_ANDAMENTO',
  'AGUARDANDO_APROVACAO',
  'CONCLUIDA',
  'CANCELADA',
  'PAUSADA'
);
```

---

### 6. `os_etapa_status`

```sql
CREATE TYPE os_etapa_status AS ENUM (
  'PENDENTE',
  'EM_ANDAMENTO',
  'AGUARDANDO_APROVACAO',
  'APROVADA',
  'REPROVADA',
  'CONCLUIDA'
);
```

---

### 7. `agendamento_status`

```sql
CREATE TYPE agendamento_status AS ENUM (
  'AGENDADO',
  'EM_ANDAMENTO',
  'CONCLUIDO',
  'CANCELADO'
);
```

---

### 8. `tipo_lancamento`

```sql
CREATE TYPE tipo_lancamento AS ENUM (
  'RECEITA',
  'DESPESA'
);
```

---

### 9. `tipo_centro_custo`

```sql
CREATE TYPE tipo_centro_custo AS ENUM (
  'OBRA',
  'ADMINISTRATIVO',
  'LABORATORIO',
  'COMERCIAL',
  'GERAL'
);
```

---

### 10. `avaliacao_performance`

```sql
CREATE TYPE avaliacao_performance AS ENUM (
  'EXCELENTE',
  'BOM',
  'REGULAR',
  'INSATISFATORIO'
);
```

---

### 11. `status_presenca`

```sql
CREATE TYPE status_presenca AS ENUM (
  'PRESENTE',
  'FALTA',
  'FALTA_JUSTIFICADA',
  'ATESTADO',
  'FERIAS'
);
```

---

## Diagrama de Relacionamentos

```
┌─────────────────┐
│  auth.users     │
└────────┬────────┘
         │
         │ 1:1
         ▼
┌─────────────────────────┐
│   colaboradores         │
│  - id (PK, FK)          │
│  - role_nivel           │
│  - setor                │
│  - custo_mensal         │
└──┬───────────┬──────────┘
   │           │
   │ 1:N       │ N:M (alocacao_cc)
   │           │
   │           ▼
   │      ┌─────────────────┐
   │      │ centros_custo   │
   │      │  - tipo         │
   │      │  - valor_global │
   │      └────────┬────────┘
   │               │
   │               │ 1:N
   ▼               ▼
┌──────────────────────────┐
│       clientes           │
│  - status                │
│  - tipo_cliente          │
│  - responsavel_id (FK)   │
└──────────┬───────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────┐
│     ordens_servico          │
│  - codigo_os (UNIQUE)       │
│  - status_geral             │
│  - tipo_os_id (FK)          │
│  - responsavel_id (FK)      │
│  - cc_id (FK)               │
└──┬───────────┬──────────────┘
   │           │
   │ 1:N       │ 1:N
   │           │
   ▼           ▼
┌─────────┐  ┌──────────────┐
│os_etapas│  │  os_anexos   │
│- ordem  │  │- path_storage│
│- status │  │- tipo_anexo  │
│- dados  │  └──────────────┘
└─────────┘

┌──────────────────┐     N:M     ┌─────────────────┐
│  agendamentos    │◄────────────►│  colaboradores  │
│  - os_id (FK)    │              │                 │
└──────────────────┘              └─────────────────┘

┌──────────────────────────┐
│ financeiro_lancamentos   │
│  - tipo (RECEITA/DESPESA)│
│  - cc_id (FK)            │
│  - cliente_id (FK)       │
│  - conciliado            │
└──────────────────────────┘
```

---

## Índices Recomendados

```sql
-- Índices para performance
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

---

## Observações Importantes

### Soft Delete
- Colaboradores: usar campo `ativo` (boolean)
- Clientes: usar campo `status` = 'CLIENTE_INATIVO'
- OS: usar campo `status_geral` = 'CANCELADA'

### JSONB Fields
Os campos JSONB permitem flexibilidade sem alterar schema:
- `clientes.endereco`
- `os_etapas.dados_etapa`
- `financeiro_lancamentos.recorrencia`
- `tipos_os.etapas_padrao`
- `tipos_os.campos_customizados`

### RLS (Row Level Security)
Implementar políticas baseadas em `role_nivel`:
- COLABORADOR: vê apenas suas OS
- COORDENADOR: vê OS do seu setor
- GESTOR: vê todas as OS
- DIRETOR: acesso total

---

## Status da Implementação

1. ✅ Schema criado e implementado no Supabase
2. ✅ ENUMs normalizados (UPPERCASE + SNAKE_CASE)
3. ✅ Triggers de auditoria implementados
4. ✅ RLS policies configuradas
5. ✅ Seed data inicial inserido (5 colaboradores, 6 clientes, 13 tipos de OS)
6. ⏳ Views para dashboards (em andamento)
7. ⏳ Stored procedures para fluxos complexos (planejado)

---

**Documento mantido por:** Equipe de Desenvolvimento Minerva ERP  
**Última sincronização com banco:** 14/11/2024
