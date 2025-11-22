# AI Context: Minerva Database Schema (v2.1)

> **SYSTEM NOTE:** Este documento descreve a "Verdade" do banco de dados. Se houver conflito entre este arquivo e o código, este arquivo prevalece em lógica de negócio.

**Contexto:** ERP para Engenharia/Construção.
**Stack:** Supabase (PostgreSQL).
**Auth:** `auth.users` (Supabase Auth) vinculado 1:1 com `public.colaboradores`.
**Padrão:** Tabelas no plural, campos em *snake_case*.

---

## 1. Lógica de Acesso & RLS (Row Level Security)

O sistema não usa apenas `roles` simples. Ele usa uma matriz de **Cargo x Setor**.

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

### Regras de Delegação (Trigger)
A tabela `delegacoes` possui um gatilho (`validar_regras_delegacao`) que impede delegações cruzadas inválidas:
* **Gestor Obras** só delega para equipe de Obras.
* **Gestor Assessoria** só delega para equipe de Assessoria.
* **Diretoria/Admin** delegam para qualquer um.

---

## 2. Estrutura de Dados (Compact Schema)

Abaixo a definição relacional simplificada.
*Legenda: `PK` = Primary Key, `FK` = Foreign Key, `Enum` = Valores fixos permitidos.*

### 2.1 Núcleo de Acesso (RH & Auth)

```sql
public.cargos (
  id uuid PK,
  nome text,       -- Ex: "Gestor de Obras"
  slug text UNIQUE -- [admin, diretoria, gestor_administrativo, gestor_obras, gestor_assessoria, colaborador]
  nivel_acesso int -- 10=Admin, 5=Gestor, 1=Colaborador
);

public.setores (
  id uuid PK,
  nome text,       -- Ex: "Obras"
  slug text UNIQUE -- [obras, assessoria, administrativo, diretoria]
);

public.colaboradores (
  id uuid PK FK(auth.users), -- O ID é o mesmo do Supabase Auth
  nome_completo text,
  email text,
  cargo_id uuid FK(public.cargos),
  setor_id uuid FK(public.setores),
  ativo boolean,
  custo_mensal numeric
);
````

### 2.2 Core Business (Ordens de Serviço)

```sql
public.ordens_servico (
  id uuid PK,
  codigo_os text UNIQUE,        -- Gerado auto (Ex: 'OS-2024-001')
  cliente_id uuid FK(public.clientes),
  tipo_os_id uuid FK(public.tipos_os),
  responsavel_id uuid FK(public.colaboradores),
  criado_por_id uuid FK(public.colaboradores),
  status_geral text,            -- Enum: [em_triagem, em_andamento, concluido, cancelado]
  valor_contrato numeric,
  valor_proposta numeric,
  descricao text,
  cc_id uuid FK(public.centros_custo),
  data_prazo timestamp,
  data_conclusao timestamp
);

public.os_etapas (
  id uuid PK,
  os_id uuid FK(public.ordens_servico),
  nome_etapa text,
  status text,                  -- Enum: [pendente, em_andamento, concluida]
  ordem int,
  dados_etapa jsonb,            -- Payload dinâmico do formulário da etapa
  responsavel_id uuid FK(public.colaboradores)
);

public.delegacoes (
  id uuid PK,
  os_id uuid FK(public.ordens_servico),
  delegante_id uuid FK(public.colaboradores),
  delegado_id uuid FK(public.colaboradores),
  status_delegacao text,        -- Enum: [pendente, aceita, recusada, concluida]
  descricao_tarefa text,
  data_prazo date
);
```

### 2.3 Financeiro & CRM

> **Atenção:** A tabela `financeiro_lancamentos` é protegida por RLS estrito. Apenas Admin, Diretoria e Gestor Administrativo conseguem fazer `SELECT`.

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
  cliente_id uuid FK(public.clientes)
);

public.clientes (
  id uuid PK,
  nome_razao_social text,
  cpf_cnpj text,
  status text,                  -- Enum: [lead, ativo, inativo]
  responsavel_id uuid FK(public.colaboradores),
  email text,
  telefone text
);
```

### 2.4 Calendário & Agendamento

```sql
public.turnos (
  id uuid PK,
  hora_inicio time,
  hora_fim time,
  vagas_total int,
  setores jsonb,                -- Array de slugs de setores permitidos: ['obras', 'assessoria']
  tipo_recorrencia text,        -- Enum: [todos, uteis, custom]
  dias_semana int[],            -- Usado se recorrencia='custom' (0=Dom, 6=Sab)
  cor text,
  ativo boolean
);

public.agendamentos (
  id uuid PK,
  turno_id uuid FK(public.turnos),
  data date,
  horario_inicio time,
  horario_fim time,
  os_id uuid FK(public.ordens_servico) NULLABLE,
  status text,                  -- Enum: [confirmado, cancelado, realizado, ausente]
  categoria text,               -- Ex: "Vistoria", "Reunião"
  solicitante_nome text,        -- Se for agendamento externo
  setor text                    -- Setor do agendamento (obras/assessoria)
);
```

### 2.5 Configuração & Auditoria

```sql
public.centros_custo (
  id uuid PK,
  nome text,           -- Ex: "Obra Edifício X"
  valor_global numeric,
  cliente_id uuid FK(public.clientes),
  ativo boolean
);

public.tipos_os (
  id uuid PK,
  nome text,           -- Ex: "Instalação Elétrica"
  codigo text UNIQUE,  -- Ex: "INST-ELET"
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
  acao text,           -- Ex: "DELETE", "UPDATE"
  tabela_afetada text,
  registro_id_afetado text,
  dados_antigos jsonb,
  dados_novos jsonb,
  created_at timestamp
);
```

-----

## 3\. Referência de Valores (Enums)

O sistema espera que strings exatas sejam usadas (Case Sensitive: **Sempre minúsculo**).

**Status de OS (`os_status_geral`)**

  * `em_triagem`
  * `aguardando_informacoes`
  * `em_andamento`
  * `concluido`
  * `cancelado`

**Status de Cliente (`cliente_status`)**

  * `lead`
  * `ativo`
  * `inativo`

**Tipos Financeiros (`financeiro_tipo`)**

  * `receita`
  * `despesa`

**Status Delegação (`delegacao_status`)**

  * `pendente`
  * `aceita`
  * `recusada`
  * `concluida`

<!-- end list -->

```