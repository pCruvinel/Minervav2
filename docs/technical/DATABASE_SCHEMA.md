Com base no schema SQL fornecido, atualizei a documentação para refletir com precisão a estrutura atual do banco de dados (adicionando campos como `endereco`, datas de controle, campos de auditoria e correções de tipos).

Aqui está a versão **v2.2** pronta para uso.

-----

# AI Context: Minerva Database Schema (v2.2)

> **SYSTEM NOTE:** Este documento descreve a "Verdade" do banco de dados. Se houver conflito entre este arquivo e o código, este arquivo prevalece em lógica de negócio.

**Contexto:** ERP para Engenharia/Construção.
**Stack:** Supabase (PostgreSQL).
**Auth:** `auth.users` (Supabase Auth) vinculado 1:1 com `public.colaboradores`.
**Padrão:** Tabelas no plural, campos em *snake\_case*.

-----

## 1\. Lógica de Acesso & RLS (Row Level Security)

O sistema utiliza uma matriz de **Cargo x Setor**.

### Hierarquia de Cargos (Tabela `cargos`)

| Slug | Nível | Permissões |
| :--- | :--- | :--- |
| `admin` | 10 | **Superuser.** Vê tudo, edita tudo. |
| `diretoria` | 9 | **Vê tudo** (incluindo Financeiro). Pode delegar para qualquer um. |
| `gestor_administrativo` | 5 | **Cross-Sector.** Vê/Edita Financeiro + Obras + Assessoria. |
| `gestor_obras` | 5 | **Isolado.** Apenas dados do setor `obras`. Sem Financeiro. |
| `gestor_assessoria` | 5 | **Isolado.** Apenas dados do setor `assessoria`. Sem Financeiro. |
| `colaborador` | 1 | **Operacional.** Vê apenas o próprio perfil e tarefas onde é responsável. |
| `mao_de_obra` | 0 | **Sem Login.** Apenas para registro de custos/presença. |

### Regras de Delegação

  * **Gestor Obras** só delega para equipe de Obras.
  * **Gestor Assessoria** só delega para equipe de Assessoria.
  * **Diretoria/Admin** delegam para qualquer um.

-----

## 2\. Estrutura de Dados (Compact Schema)

Abaixo a definição relacional atualizada com base no Schema SQL.
*Legenda: `PK` = Primary Key, `FK` = Foreign Key.*

### 2.1 Núcleo de Acesso (RH & Auth)

```sql
public.cargos (
  id uuid PK,
  nome text,       -- Ex: "Gestor de Obras"
  slug text UNIQUE, -- [admin, diretoria, gestor_administrativo, gestor_obras, gestor_assessoria, colaborador]
  nivel_acesso int, -- 10=Admin, 5=Gestor, 1=Colaborador
  descricao text,
  ativo boolean
);

public.setores (
  id uuid PK,
  nome text,       -- Ex: "Obras"
  slug text UNIQUE, -- [obras, assessoria, administrativo, diretoria]
  descricao text,
  ativo boolean
);

public.colaboradores (
  id uuid PK FK(auth.users), -- O ID é o mesmo do Supabase Auth
  nome_completo text,
  email text,
  cpf varchar,
  telefone varchar,
  cargo_id uuid FK(public.cargos),
  setor_id uuid FK(public.setores),
  ativo boolean,
  data_admissao date,
  custo_mensal numeric
);
```

### 2.2 Core Business (Ordens de Serviço)

```sql
public.ordens_servico (
  id uuid PK,
  codigo_os varchar UNIQUE,     -- Gerado auto (Ex: 'OS-2024-001')
  cliente_id uuid FK(public.clientes),
  tipo_os_id uuid FK(public.tipos_os),
  responsavel_id uuid FK(public.colaboradores),
  criado_por_id uuid FK(public.colaboradores),
  cc_id uuid FK(public.centros_custo),
  status_geral text,            -- Enum: [em_triagem, em_andamento, concluido, cancelado]
  descricao text,
  valor_proposta numeric,
  valor_contrato numeric,
  data_entrada timestamp,
  data_prazo timestamp,
  data_conclusao timestamp
);

public.os_etapas (
  id uuid PK,
  os_id uuid FK(public.ordens_servico),
  nome_etapa text,
  status text,                  -- Enum: [pendente, em_andamento, concluida]
  ordem int,
  dados_etapa jsonb,            -- Payload dinâmico do formulário
  responsavel_id uuid FK(public.colaboradores),
  data_inicio timestamp,
  data_conclusao timestamp
);

public.delegacoes (
  id uuid PK,
  os_id uuid FK(public.ordens_servico),
  delegante_id uuid FK(public.colaboradores),
  delegado_id uuid FK(public.colaboradores),
  status_delegacao text,        -- Enum: [pendente, aceita, recusada, concluida]
  descricao_tarefa text,
  observacoes text,
  data_prazo date,
  delegante_nome text,          -- Cache do nome
  delegado_nome text            -- Cache do nome
);
```

### 2.3 Financeiro & CRM

> **Atenção:** A tabela `financeiro_lancamentos` é protegida por RLS estrito.

```sql
public.financeiro_lancamentos (
  id uuid PK,
  descricao text,
  valor numeric,
  tipo text,                    -- Enum: [receita, despesa]
  data_vencimento date,
  data_pagamento date,
  conciliado boolean,
  cc_id uuid FK(public.centros_custo),
  cliente_id uuid FK(public.clientes),
  criado_por_id uuid FK(public.colaboradores)
);

public.clientes (
  id uuid PK,
  nome_razao_social text,
  cpf_cnpj varchar UNIQUE,
  status text,                  -- Enum: [lead, ativo, inativo]
  responsavel_id uuid FK(public.colaboradores),
  email text,
  telefone varchar,
  endereco jsonb,               -- Estrutura de endereço completa
  observacoes text
);
```

### 2.4 Calendário & Agendamento

```sql
public.turnos (
  id uuid PK,
  hora_inicio time,
  hora_fim time,
  vagas_total int,
  setores jsonb,                -- Array de slugs permitidos: ['obras', 'assessoria']
  tipo_recorrencia varchar,     -- Enum: [todos, uteis, custom]
  dias_semana int[],            -- Usado se custom (0=Dom, 6=Sab)
  data_inicio date,             -- Validade do turno
  data_fim date,                -- Validade do turno
  cor varchar,
  ativo boolean,
  criado_por uuid FK(public.colaboradores)
);

public.agendamentos (
  id uuid PK,
  turno_id uuid FK(public.turnos),
  data date,
  horario_inicio time,
  horario_fim time,
  duracao_horas numeric,
  categoria varchar,            -- Ex: "Vistoria", "Reunião"
  setor varchar,                -- Setor do agendamento
  solicitante_nome varchar,     -- Se externo
  solicitante_contato varchar,
  solicitante_observacoes text,
  os_id uuid FK(public.ordens_servico),
  status varchar,               -- Enum: [confirmado, cancelado, realizado, ausente]
  cancelado_em timestamp,
  cancelado_motivo text,
  criado_por uuid FK(public.colaboradores)
);
```

### 2.5 Configuração & Auditoria

```sql
public.centros_custo (
  id uuid PK,
  nome text,
  valor_global numeric,
  cliente_id uuid FK(public.clientes),
  ativo boolean
);

public.tipos_os (
  id uuid PK,
  nome text,
  codigo varchar UNIQUE,        -- Ex: "INST-ELET"
  setor_padrao_id uuid FK(public.setores),
  ativo boolean
);

public.os_historico_status (
  id uuid PK,
  os_id uuid FK(public.ordens_servico),
  status_anterior text,
  status_novo text,
  alterado_por_id uuid FK(public.colaboradores),
  created_at timestamp
);

public.audit_log (
  id uuid PK,
  usuario_id uuid FK(public.colaboradores),
  acao text,                    -- Ex: "DELETE", "UPDATE"
  tabela_afetada text,
  registro_id_afetado text,
  dados_antigos jsonb,
  dados_novos jsonb,
  created_at timestamp
);
```

-----

## 3\. Referência de Valores (Enums & Checks)

**Status de OS (`os_status_geral`)**

  * `em_triagem` (Default)
  * `aguardando_informacoes`
  * `em_andamento`
  * `concluido`
  * `cancelado`

**Status de Cliente (`cliente_status`)**

  * `lead` (Default)
  * `ativo`
  * `inativo`

**Tipos Financeiros (`financeiro_tipo`)**

  * `receita`
  * `despesa` (Default)

**Status Agendamento**

  * `confirmado` (Default)
  * `cancelado`
  * `realizado`
  * `ausente`

**Status Delegação (`delegacao_status`)**

  * `pendente` (Default)
  * `aceita`
  * `recusada`
  * `concluida`

-----

### Principais Alterações nesta Versão (v2.2):

1.  **Clientes:** Adicionado campo `endereco` (JSONB) e `observacoes`.
2.  **Agendamentos:** Adicionados campos de auditoria de cancelamento (`cancelado_em`, `motivo`) e `duracao_horas`.
3.  **Turnos:** Adicionados campos de range de data (`data_inicio`, `data_fim`).
4.  **Financeiro:** Adicionado vínculo com criador (`criado_por_id`).
5.  **Etapas OS:** Adicionados timestamps de execução (`data_inicio`, `data_conclusao`).

Quer que eu gere também os **Tipos TypeScript** (Interfaces) atualizados com base nesta nova documentação para usar no Front-end?