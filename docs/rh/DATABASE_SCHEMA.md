# 🗄️ Schema do Banco de Dados - Módulo RH

> **Última Atualização:** 28/01/2026  
> **Projeto Supabase:** `zxfevlkssljndqqhxkjb`

---

## 📊 Visão Geral das Tabelas

| Tabela | Descrição | Colunas | RLS |
|--------|-----------|---------|-----|
| `colaboradores` | Dados mestres de funcionários | 40+ | ✅ |
| `colaboradores_documentos` | Documentos pessoais | 9 | ✅ |
| `cargos` | Cargos/Funções | 6 | ✅ |
| `setores` | Departamentos | 6 | ❌ |
| `turnos` | Configuração de turnos | 15 | ❌ |
| `agendamentos` | Appointments no calendário | 19 | ❌ |
| `os_vagas_recrutamento` | Vagas de emprego (OS-10) | 14 | ❌ |
| `registros_presenca` | Registros diários de presença | 14 | ✅ |

---

## 📋 Tabela: `colaboradores`

> **Total:** 40+ colunas | **RLS:** Habilitado

### Identificação

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | - | PK (= auth.users.id) |
| `nome_completo` | text | YES | - | Nome exibido |
| `cpf` | varchar | YES | - | Documento formatado |
| `data_nascimento` | date | YES | - | - |
| `avatar_url` | text | YES | - | URL da foto |

### Contato

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `email` | text | YES | Email principal (login) |
| `email_pessoal` | text | YES | Email alternativo |
| `email_profissional` | text | YES | Email corporativo |
| `telefone` | varchar | YES | Telefone principal |
| `telefone_pessoal` | text | YES | - |
| `telefone_profissional` | text | YES | - |
| `contato_emergencia_nome` | text | YES | Nome do contato |
| `contato_emergencia_telefone` | text | YES | - |

### Endereço

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `cep` | text | YES | CEP (integração ViaCEP) |
| `logradouro` | text | YES | Rua/Avenida |
| `numero` | text | YES | - |
| `complemento` | text | YES | - |
| `bairro` | text | YES | - |
| `cidade` | text | YES | - |
| `uf` | varchar(2) | YES | Estado |

### Profissional

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `cargo_id` | uuid FK | YES | → `cargos.id` |
| `setor_id` | uuid FK | YES | → `setores.id` |
| `funcao` | text | YES | Slug (ex: `coord_obras`) |
| `qualificacao` | text | YES | ENCARREGADO, OFICIAL, etc. |
| `gestor` | text | YES | Nome do gestor |
| `disponibilidade_dias` | text[] | YES | ['SEG', 'TER', ...] |
| `turno` | text[] | YES | ['MANHA', 'TARDE'] |

### Financeiro

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `tipo_contratacao` | text | YES | CLT, PJ, ESTAGIO |
| `data_admissao` | date | YES | - |
| `salario_base` | numeric | YES | Salário CLT |
| `custo_dia` | numeric | YES | Custo diário (calculado) |
| `custo_mensal` | numeric | YES | Default: 0 |
| `remuneracao_contratual` | numeric | YES | Valor PJ |
| `rateio_fixo` | text | YES | CC fixo para alocação |

### Dados Bancários

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `banco` | text | YES | Código (ex: '001') |
| `agencia` | text | YES | - |
| `conta` | text | YES | - |
| `chave_pix` | text | YES | - |

### Sistema

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `ativo` | boolean | YES | true | Status ativo/inativo |
| `bloqueado_sistema` | boolean | YES | false | Bloqueia acesso |
| `status_convite` | text | YES | 'ativo' | pendente, ativo, expirado |
| `auth_user_id` | uuid | YES | - | Ref alternativa para auth |
| `documentos_obrigatorios` | jsonb | YES | '[]' | Checklist (legacy) |
| `created_at` | timestamptz | YES | now() | - |
| `updated_at` | timestamptz | YES | now() | - |

---

## 🔄 Triggers

### `trigger_sync_colaborador_metadata` (on colaboradores)

Syncs colaborador data TO auth.users when colaborador is created/updated.

```sql
-- ON INSERT or UPDATE → Updates auth.users.raw_user_meta_data
-- with cargo_slug, cargo_nivel, setor_slug, nome_completo, ativo
```

### `trigger_sync_auth_status` (on auth.users)

Syncs email confirmation FROM auth.users TO colaboradores when user confirms email.

```sql
-- ON UPDATE (email_confirmed_at changed)
-- → Sets colaboradores.status_convite = 'ativo'
```

> **Added:** 29/01/2026 - Fixes issue where colaboradores remained "pendente" after email confirmation

---

## 📋 Tabela: `os_vagas_recrutamento`

> **Total:** 14 colunas | Vagas geradas pela OS-10

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `os_id` | uuid | NO | → `ordens_servico.id` |
| `cargo_funcao` | text | NO | Nome do cargo |
| `quantidade` | integer | YES | Default: 1 |
| `salario_base` | numeric | YES | Salário oferecido |
| `habilidades_necessarias` | text | YES | Requisitos técnicos |
| `perfil_comportamental` | text | YES | Soft skills |
| `experiencia_minima` | text | YES | Ex: "2 anos" |
| `escolaridade_minima` | text | YES | Ex: "Ensino Médio" |
| `status` | text | YES | aberta, em_selecao, preenchida, cancelada |
| `urgencia` | text | YES | baixa, normal, alta, critica |
| `data_limite_contratacao` | date | YES | Deadline |
| `created_at` | timestamptz | YES | now() |
| `updated_at` | timestamptz | YES | now() |

---

## 📋 Tabela: `turnos`

> **Total:** 15 colunas | Configuração de turnos de trabalho

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `hora_inicio` | time | NO | Ex: 08:00 |
| `hora_fim` | time | NO | Ex: 17:00 |
| `vagas_total` | integer | NO | Capacidade total |
| `vagas_por_setor` | jsonb | YES | Distribuição por setor |
| `setores` | jsonb | NO | Array de setores permitidos |
| `cor` | varchar | NO | Cor no calendário |
| `tipo_recorrencia` | varchar | NO | todos, uteis, custom |
| `data_inicio` | date | YES | Início da vigência |
| `data_fim` | date | YES | Fim da vigência |
| `dias_semana` | integer[] | YES | [0-6] para custom |
| `ativo` | boolean | NO | Status |
| `criado_por` | uuid | YES | → colaboradores.id |
| `criado_em` | timestamptz | NO | now() |
| `atualizado_em` | timestamptz | NO | now() |

---

## 📋 Tabela: `agendamentos`

> **Total:** 19 colunas | Appointments no calendário

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `turno_id` | uuid | NO | → `turnos.id` |
| `data` | date | NO | Data do agendamento |
| `horario_inicio` | time | NO | Hora início |
| `horario_fim` | time | NO | Hora fim |
| `duracao_horas` | numeric | NO | Duração calculada |
| `categoria` | varchar | NO | Tipo de agendamento |
| `setor` | varchar | NO | Setor responsável |
| `solicitante_nome` | varchar | YES | Nome do solicitante |
| `solicitante_contato` | varchar | YES | Telefone/email |
| `solicitante_observacoes` | text | YES | Observações |
| `os_id` | uuid | YES | → `ordens_servico.id` |
| `responsavel_id` | uuid | YES | → `colaboradores.id` |
| `status` | varchar | NO | confirmado, cancelado, realizado, ausente |
| `cancelado_em` | timestamptz | YES | - |
| `cancelado_motivo` | text | YES | - |
| `criado_por` | uuid | YES | - |
| `criado_em` | timestamptz | NO | now() |
| `atualizado_em` | timestamptz | NO | now() |

---

## 📋 Tabela: `registros_presenca`

> **Total:** 14 colunas | Presença diária com alocação de custos

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `colaborador_id` | uuid | NO | → `colaboradores.id` |
| `data` | date | NO | Data do registro |
| `status` | text | NO | OK, ATRASADO, FALTA |
| `minutos_atraso` | integer | YES | Apenas se ATRASADO |
| `justificativa` | text | YES | Justificativa de falta/atraso |
| `performance` | text | NO | OTIMA, BOA, REGULAR, RUIM |
| `performance_justificativa` | text | YES | Se performance RUIM |
| `centros_custo` | jsonb | YES | Array de CC IDs |
| `anexo_url` | text | YES | URL do comprovante |
| `confirmed_at` | timestamptz | YES | Quando confirmado |
| `confirmed_by` | uuid | YES | Quem confirmou |
| `confirmed_changes` | jsonb | YES | Histórico de auditoria |
| `created_at` | timestamptz | YES | now() |
| `updated_at` | timestamptz | YES | now() |

---

## 📋 Tabela: `setores`

> **Total:** 6 colunas | Departamentos da empresa

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `nome` | text | NO | - | Nome do setor |
| `slug` | text | NO | - | Identificador único |
| `descricao` | text | YES | - | - |
| `ativo` | boolean | YES | true | - |
| `created_at` | timestamptz | YES | now() | - |

---

## 📋 Tabela: `cargos`

> **Total:** 6 colunas | Cargos e níveis de acesso

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `nome` | text | NO | Nome do cargo |
| `slug` | text | NO | Identificador |
| `nivel_acesso` | integer | NO | 0-10 |
| `descricao` | text | YES | - |
| `ativo` | boolean | YES | Default: true |

---

## 📋 Tabela: `colaboradores_documentos`

> **Total:** 9 colunas | Documentos pessoais

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `colaborador_id` | uuid | NO | → `colaboradores.id` |
| `nome` | text | NO | Nome original do arquivo |
| `url` | text | NO | URL pública no Storage |
| `tipo` | text | YES | Extensão (pdf, jpg) |
| `tipo_documento` | text | YES | RG, CPF, CNH, CTPS, etc. |
| `tamanho` | bigint | YES | Tamanho em bytes |
| `created_at` | timestamptz | YES | now() |
| `updated_at` | timestamptz | YES | now() |

---

## 🔗 Views

### `view_custo_mo_detalhado_os`

View para análise de custo de mão de obra por OS e Centro de Custo.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `os_id` | uuid | ID da OS |
| `cc_id` | uuid | ID do Centro de Custo |
| `cc_nome` | text | Nome do CC |
| `colaborador_id` | uuid | ID do colaborador |
| `colaborador_nome` | text | Nome do colaborador |
| `salario_base` | numeric | Salário base |
| `data_trabalho` | date | Data do trabalho |
| `status_presenca` | text | Status da presença |
| `percentual_alocado` | numeric | % alocado ao CC |
| `custo_alocado` | numeric | Custo calculado |

---

## 🔐 RLS Policies

### `colaboradores`

```sql
-- Leitura hierárquica
CREATE POLICY "colaboradores_read_final" ON colaboradores
FOR SELECT USING (
  id = auth.uid() OR
  get_user_nivel() >= 5 OR
  setor_id = get_current_user_setor()
);
```

### `colaboradores_documentos`

```sql
-- Qualquer autenticado pode ler/escrever
CREATE POLICY "Leitura para autenticados" ON colaboradores_documentos
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Escrita para autenticados" ON colaboradores_documentos
FOR ALL USING (auth.role() = 'authenticated');
```

---

*Schema documentado em 28/01/2026 via Supabase MCP Tools.*
