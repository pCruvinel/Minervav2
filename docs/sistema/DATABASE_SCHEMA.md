# AI Context: Minerva Database Schema (v2.5)

> **SYSTEM NOTE:** Este documento descreve a "Verdade" do banco de dados. Se houver conflito entre este arquivo e o código, este arquivo prevalece em lógica de negócio.

**Contexto:** ERP para Engenharia/Construção.
**Stack:** Supabase (PostgreSQL).
**Auth:** `auth.users` (Supabase Auth) vinculado 1:1 com `public.colaboradores`.
**Padrão:** Tabelas no plural, campos em *snake\_case*.

-----

## 1. Lógica de Acesso & RLS (Row Level Security)

> **⚠️ ATENÇÃO: RLS DESABILITADO**
> Para fins de desenvolvimento ágil, **todas as políticas de RLS (Row Level Security) foram desabilitadas**.
> O controle de acesso deve ser feito temporariamente na camada de aplicação (Frontend/Backend API) até que o RLS seja reativado em produção.

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

-----

## 2. Estrutura de Dados (Compact Schema)

Abaixo a definição relacional atualizada.
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
   custo_mensal numeric,
   created_at timestamp,
   updated_at timestamp,
   tipo_contratacao text,        -- Enum: [CLT, PJ, ESTAGIO]
   salario_base numeric,         -- Salário base para CLT
   custo_dia numeric,            -- Custo diário para PJ
   funcao text,                  -- Função ou cargo do colaborador
   avatar_url text,              -- URL da foto do colaborador
   data_nascimento date,
   endereco text,
   email_pessoal text,
   email_profissional text,
   telefone_pessoal varchar,
   telefone_profissional varchar,
   contato_emergencia_nome text,
   contato_emergencia_telefone text,
   disponibilidade_dias jsonb,   -- Array de dias disponíveis
   turno jsonb,                  -- Configuração de turno
   qualificacao text,
   setor text,                   -- Cache do nome do setor
   gestor text,                  -- Cache do nome do gestor
   remuneracao_contratual numeric,
   rateio_fixo text,
   bloqueado_sistema boolean      -- Se o colaborador está bloqueado
 );
```

### 2.2 Core Business (Ordens de Serviço)

```sql
public.ordens_servico (
   id uuid PK,
   codigo_os varchar UNIQUE,     -- 🆕 Gerado automaticamente via trigger (Ex: 'OS01021225-001')
   cliente_id uuid FK(public.clientes),
   tipo_os_id uuid FK(public.tipos_os),
   responsavel_id uuid FK(public.colaboradores),
   criado_por_id uuid FK(public.colaboradores),
   cc_id uuid FK(public.centros_custo),
   parent_os_id uuid FK(public.ordens_servico), -- 🆕 ID da OS origem (hierarquia)
   status_geral os_status_geral, -- Enum: [em_triagem, em_andamento, concluido, cancelado, aguardando_aprovacao]
   descricao text,
   valor_proposta numeric,
   valor_contrato numeric,
   data_entrada timestamp,
   data_prazo timestamp,
   data_conclusao timestamp,
   updated_at timestamp,
   data_abertura timestamp,      -- Data de abertura da OS
   status_detalhado jsonb,       -- Status detalhado em JSON
   metadata jsonb                -- Metadados adicionais
 );

public.os_etapas (
   id uuid PK,
   os_id uuid FK(public.ordens_servico),
   nome_etapa text,
   status os_etapa_status,       -- Enum: [pendente, em_andamento, concluida, bloqueada, cancelada]
   ordem int,
   dados_etapa jsonb,            -- Payload dinâmico do formulário
   responsavel_id uuid FK(public.colaboradores),
   data_inicio timestamp,
   data_conclusao timestamp,
   ultima_atualizacao timestamp, -- Última atualização da etapa
   dados_snapshot jsonb,         -- Snapshot dos dados
   comentarios_count int,        -- Contador de comentários
   documentos_count int          -- Contador de documentos
 );

public.delegacoes (
   id uuid PK,
   os_id uuid FK(public.ordens_servico),
   delegante_id uuid FK(public.colaboradores),
   delegado_id uuid FK(public.colaboradores),
   status_delegacao delegacao_status, -- Enum: [pendente, aceita, recusada, concluida]
   descricao_tarefa text,
   observacoes text,
   data_prazo date,
   delegante_nome text,          -- Cache do nome
   delegado_nome text,           -- Cache do nome
   created_at timestamp,
   updated_at timestamp
 );
```

### 2.3 Financeiro & CRM

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
   email text,
   telefone varchar,
   status cliente_status,        -- Enum: [lead, ativo, inativo, blacklist]
   responsavel_id uuid FK(public.colaboradores),
   endereco jsonb,               -- Estrutura de endereço completa
   observacoes text,
   created_at timestamp,
   updated_at timestamp,
   senha_acesso varchar,         -- Senha de acesso do cliente ao portal
   nome_responsavel text,
   tipo_cliente tipo_cliente,    -- Enum: [PESSOA_FISICA, PESSOA_JURIDICA]
   tipo_empresa tipo_empresa     -- Enum: [ADMINISTRADORA, CONDOMINIO, CONSTRUTORA, INCORPORADORA, INDUSTRIA, COMERCIO, OUTROS]
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
   ativo boolean,
   tipo_os_id uuid FK(public.tipos_os), -- Tipo de OS que originou este Centro de Custo
   descricao text                      -- Descrição opcional do Centro de Custo
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
   status_anterior os_status_geral,
   status_novo os_status_geral,
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

### 2.5.1 Sistema de Comentários (Redesign 2025)

```sql
public.os_comentarios (
   id uuid PK,
   os_id uuid FK(public.ordens_servico),
   etapa_id uuid FK(public.os_etapas), -- Nullable para comentários gerais da OS
   usuario_id uuid FK(public.colaboradores),
   comentario text,
   tipo varchar,                 -- Tipo do comentário
   metadados jsonb,              -- Metadados adicionais
   criado_em timestamp,
   atualizado_em timestamp
 );
```

### 2.5.2 Timeline de Atividades (Redesign 2025)

```sql
public.os_atividades (
   id uuid PK,
   os_id uuid FK(public.ordens_servico),
   etapa_id uuid FK(public.os_etapas), -- Nullable
   usuario_id uuid FK(public.colaboradores),
   tipo varchar,                 -- Tipo da atividade
   descricao text,
   dados_antigos jsonb,          -- Dados antes da mudança
   dados_novos jsonb,            -- Dados após a mudança
   metadados jsonb,              -- Metadados adicionais
   criado_em timestamp
 );
```

### 2.5.3 Gestão de Documentos (Redesign 2025)

```sql
public.os_documentos (
   id uuid PK,
   os_id uuid FK(public.ordens_servico),
   etapa_id uuid FK(public.os_etapas), -- Nullable
   nome varchar,
   tipo varchar,                 -- Tipo MIME
   caminho_arquivo text,         -- Caminho no storage
   tamanho_bytes int,
   mime_type varchar,
   metadados jsonb,              -- Metadados adicionais
   uploaded_by uuid FK(public.colaboradores),
   criado_em timestamp,
   descricao text                -- Descrição opcional
 );
```

### 2.5.4 Logs Técnicos (Redesign 2025)

```sql
public.os_logs (
   id uuid PK,
   os_id uuid FK(public.ordens_servico),
   usuario_id uuid FK(public.colaboradores), -- Nullable
   nivel varchar,               -- Nível do log
   categoria varchar,           -- Categoria do log
   mensagem text,
   dados_contexto jsonb,        -- Dados de contexto
   ip_address inet,             -- Endereço IP
   user_agent text,             -- User agent
   criado_em timestamp
 );
```

### 2.5.5 Sequências de OS (Redesign 2025)

```sql
public.os_sequences (
   tipo_os_id uuid PK FK(public.tipos_os),
   current_value int,           -- Valor atual da sequência
   updated_at timestamp
 );
```

### 2.5.6 Documentos de Clientes

```sql
public.clientes_documentos (
   id uuid PK,
   cliente_id uuid FK(public.clientes),
   tipo_documento varchar,      -- [contrato_social, comprovante_residencia, documento_foto, logo_cliente]
   nome_arquivo varchar,
   caminho_storage text,        -- Caminho no Supabase Storage
   mime_type varchar,
   tamanho_bytes int,
   uploaded_at timestamp,
   uploaded_by uuid FK(public.colaboradores)
 );
```

### 2.5.7 Registros de Presença

```sql
public.registros_presenca (
   id uuid PK,
   colaborador_id uuid FK(public.colaboradores),
   data date,
   status text,                 -- [OK, ATRASADO, FALTA, FALTA_JUSTIFICADA]
   minutos_atraso int,
   justificativa text,
   performance text,            -- [OTIMA, BOA, REGULAR, RUIM, PESSIMA]
   performance_justificativa text,
   centros_custo jsonb,         -- Centros de custo relacionados
   anexo_url text,              -- URL de anexo
   created_at timestamp,
   updated_at timestamp
 );
```

### 2.5.8 Documentos de Colaboradores

```sql
public.colaboradores_documentos (
   id uuid PK,
   colaborador_id uuid FK(public.colaboradores),
   nome text,
   url text,
   tipo text,                   -- Tipo do documento
   tamanho bigint,
   created_at timestamp,
   updated_at timestamp
 );
```
```

-----

## 3. Referência de Valores (Enums & Checks)

**Status de OS (`os_status_geral`)**

   * `em_triagem` (Default) - OS criada, aguardando classificação inicial
   * `em_andamento` - OS em execução
   * `aguardando_aprovacao` - OS completa, aguardando validação/aprovação do cliente
   * `concluida` - OS finalizada com sucesso
   * `cancelado` - OS cancelada

**Status de Etapa (`os_etapa_status`)**

   * `pendente` (Default) - Etapa não iniciada
   * `em_andamento` - Etapa em execução
   * `concluida` - Etapa finalizada com sucesso
   * `bloqueada` - Etapa impedida por dependência externa (ex: aguardando cliente)
   * `cancelada` - Etapa cancelada

**Status de Cliente (`cliente_status`)**

  * `lead` (Default) - Prospect, ainda não é cliente
  * `ativo` - Cliente com contrato ativo
  * `inativo` - Cliente sem contratos ativos
  * `blacklist` - Cliente bloqueado (inadimplente/problemas)

**Tipo de Cliente (`tipo_cliente`)** ✅ **MIGRADO**

   * `PESSOA_FISICA` - Pessoa física
   * `PESSOA_JURIDICA` - Pessoa jurídica

**Tipo de Empresa (`tipo_empresa`)** 🆕 **ADICIONADO**

   * `ADMINISTRADORA` - Administradora de condomínios
   * `CONDOMINIO` - Condomínio residencial/comercial
   * `CONSTRUTORA` - Empresa construtora
   * `INCORPORADORA` - Incorporadora imobiliária
   * `INDUSTRIA` - Empresa industrial
   * `COMERCIO` - Empresa comercial
   * `OUTROS` - Outros tipos de empresa

**Tipos Financeiros (`financeiro_tipo`)**

  * `receita`
  * `despesa` (Default)

**Status Agendamento**

  * `confirmado` (Default)
  * `cancelado`
  * `realizado`
  * `ausente`

**Status Delegação (`delegacao_status`)**

  * `pendente` (Default) - Delegação criada, aguardando aceitação
  * `aceita` - Delegado aceitou a tarefa e está executando
  * `concluida` - Tarefa finalizada com sucesso
  * `recusada` - Delegado recusou a tarefa

-----

## 6. Sistema de IDs Automáticos e Relacionamentos (v2.5)

### 6.1 Geração Automática de Código de OS

**Implementado em:** 2025-12-02  
**Migrations:** `001-004` em `supabase/migrations/`

#### Padrão de Código

```
OS[TipoCodigo][DDMMYY]-[Sequencial]
```

**Exemplo:** `OS01021225-001`
- `OS` = Prefixo fixo
- `01` = Código do tipo de OS (2 dígitos)
- `021225` = Data 02/12/2025 (DDMMYY)
- `001` = Sequencial diário (3 dígitos, reinicia todo dia)

#### Function PostgreSQL

```sql
generate_codigo_os(tipo_os_codigo VARCHAR) RETURNS VARCHAR
```

**Comportamento:**
- Busca o próximo sequencial do dia para o tipo de OS
- Formata a data atual como DDMMYY
- Retorna código único no padrão especificado
- Sequencial reinicia automaticamente às 00:00

#### Trigger Automático

```sql
before_insert_gerar_codigo_os ON ordens_servico
```

**Quando dispara:** BEFORE INSERT  
**Condição:** Se `codigo_os` for NULL ou vazio  
**Ação:** Popula `codigo_os` automaticamente usando `generate_codigo_os()`

**⚠️ IMPORTANTE:** O campo `codigo_os` NÃO deve ser preenchido manualmente no INSERT. Deixe NULL para geração automática.

### 6.2 Relacionamentos Hierárquicos

#### Campo `parent_os_id`

**Tipo:** `uuid` (FK para `ordens_servico.id`)  
**Nullable:** `true`  
**Índice:** `idx_os_parent` para performance

**Propósito:** Rastrear a origem/pai de uma OS derivada.

#### Cenários de Uso

**Exemplo 1: Lead → Contrato**
```sql
-- 1. Criar OS-02 (Assessoria Lead)
INSERT INTO ordens_servico (tipo_os_id, cliente_id, ...)
VALUES (...);
-- Resultado: codigo_os = 'OS02021225-001', parent_os_id = NULL

-- 2. Lead converte → Criar OS-13 (Contrato Start)
INSERT INTO ordens_servico (tipo_os_id, cliente_id, parent_os_id, ...)
VALUES (..., '<id-da-os-02>', ...);
-- Resultado: codigo_os = 'OS13021225-001', parent_os_id = <id-da-os-02>
```

**Exemplo 2: Contrato → Compras/Contratação**
```sql
-- 3. A partir da OS-13, criar OS-10 (Compras)
INSERT INTO ordens_servico (tipo_os_id, parent_os_id, ...)
VALUES (..., '<id-da-os-13>', ...);
-- Resultado: codigo_os = 'OS10021225-001', parent_os_id = <id-da-os-13>
```

#### Queries de Hierarquia

**Buscar OSs filhas:**
```sql
SELECT * FROM ordens_servico
WHERE parent_os_id = '<id-da-os-pai>';
```

**Buscar OS pai:**
```sql
SELECT parent.*
FROM ordens_servico child
INNER JOIN ordens_servico parent ON parent.id = child.parent_os_id
WHERE child.id = '<id-da-os-filha>';
```

**Buscar árvore completa (recursivo):**
```sql
WITH RECURSIVE os_tree AS (
  -- Nó raiz
  SELECT id, codigo_os, parent_os_id, 1 AS nivel
  FROM ordens_servico
  WHERE id = '<id-raiz>'
  
  UNION ALL
  
  -- Nós filhos
  SELECT o.id, o.codigo_os, o.parent_os_id, t.nivel + 1
  FROM ordens_servico o
  INNER JOIN os_tree t ON o.parent_os_id = t.id
)
SELECT * FROM os_tree ORDER BY nivel, codigo_os;
```

### 6.3 Códigos de Tipos de OS

**Tabela:** `tipos_os.codigo` (varchar, formato "OS-XX")

| Código | Nome | Descrição |
|--------|------|-----------|
| `OS-01` | Perícia de Fachada | Avaliação técnica de fachadas |
| `OS-02` | Revitalização de Fachada | Reforma e revitalização de fachadas |
| `OS-03` | Reforço Estrutural | Serviços de reforço estrutural |
| `OS-04` | Outros (Obras) | Outros serviços de obras |
| `OS-05` | Assessoria Mensal (Lead) | Assessoria mensal para novos leads |
| `OS-06` | Assessoria Avulsa (Lead) | Assessoria avulsa para novos leads |
| `OS-07` | Solicitação de Reforma | Solicitações de reforma |
| `OS-08` | Visita Técnica / Parecer Técnico | Visitas técnicas e pareceres |
| `OS-09` | Requisição de Compras | Processos de compras |
| `OS-10` | Requisição de Mão de Obra | Processos de contratação de mão de obra |
| `OS-11` | Start Contrato Assessoria Mensal | Início de contrato de assessoria mensal |
| `OS-12` | Start Contrato Assessoria Avulsa | Início de contrato de assessoria avulsa |
| `OS-13` | Start de Contrato de Obra | Início de contrato de obra |

**⚠️ IMPORTANTE:** Todos os tipos de OS devem ter um código único no formato "OS-XX" para o sistema funcionar corretamente.

### 6.4 Fluxo de Relacionamentos Típico

```
Lead (OS-02)
    ↓ (converte)
Contrato Start (OS-13)
    ↓ (deriva)
    ├─→ Compras (OS-10)
    └─→ Contratação (OS-11)
```

**Rastreabilidade:** Qualquer OS pode ser rastreada até sua origem através de `parent_os_id`.

-----

**Última atualização:** 2025-12-03
**Versão do Schema:** v2.5