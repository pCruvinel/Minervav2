# 04 - Banco de Dados

## 🗄️ Visão Geral

O banco de dados utiliza **PostgreSQL** hospedado no **Supabase**. A arquitetura é centrada na segurança através de **Row Level Security (RLS)**, garantindo que o acesso aos dados seja controlado diretamente no nível do banco, complementando a lógica de aplicação.

### Principais Características
- **Autenticação**: Integrada com Supabase Auth (`auth.users`).
- **Segurança**: RLS habilitado em todas as tabelas sensíveis.
- **Auditoria**: Campos `created_at`, `updated_at`, `criado_por_id` em quase todas as tabelas.
- **Tipagem**: Enums utilizados para status e categorias fixas.

---

## 📋 Tabelas Principais

### 🔐 Controle de Acesso e Usuários

#### `public.users`
Extensão da tabela `auth.users` contendo dados do perfil público.
- **id**: UUID (PK)
- **auth_id**: UUID (FK -> auth.users)
- **nome_completo**: TEXT
- **email**: TEXT
- **cargo_slug**: TEXT (Enum: `admin`, `diretoria`, `gestor_administrativo`, `gestor_obras`, `gestor_assessoria`, `colaborador`)
- **setor_slug**: TEXT (Enum: `administrativo`, `obras`, `assessoria`, `diretoria`)
- **ativo**: BOOLEAN
- **avatar_url**: TEXT
- **telefone**: TEXT
- **cpf**: TEXT

#### `public.roles` (Conceitual/Enum)
Os papéis são definidos via coluna `cargo_slug` na tabela `users`, mapeados na aplicação para níveis de permissão.

---

### 🛠️ Ordens de Serviço (Core)

#### `public.ordens_servico`
Tabela central do sistema. Armazena as OSs.
- **id**: UUID (PK)
- **codigo_os**: TEXT (Ex: "OS-2024-001")
- **cliente_id**: UUID (FK -> clientes)
- **tipo_os_id**: UUID (FK -> tipos_os)
- **responsavel_id**: UUID (FK -> users)
- **status_geral**: TEXT (Enum: `em_triagem`, `em_andamento`, `aguardando_aprovacao`, `concluida`, `cancelada`)
- **descricao**: TEXT
- **valor_proposta**: NUMERIC
- **valor_contrato**: NUMERIC
- **data_entrada**: DATE
- **data_prazo**: DATE
- **data_conclusao**: DATE

#### `public.os_etapas`
Controla o progresso das 15 etapas de cada OS.
- **id**: UUID (PK)
- **os_id**: UUID (FK -> ordens_servico)
- **numero_etapa**: INTEGER (1-15)
- **status**: TEXT (Enum: `pendente`, `em_andamento`, `concluida`, `bloqueada`)
- **dados**: JSONB (Armazena os dados do formulário da etapa)
- **aprovado_por**: UUID (FK -> users)
- **data_aprovacao**: TIMESTAMPTZ

#### `public.delegacoes`
Gerencia a transferência de responsabilidade de tarefas/OSs.
- **id**: UUID (PK)
- **os_id**: UUID (FK -> ordens_servico)
- **delegante_id**: UUID (FK -> users)
- **delegado_id**: UUID (FK -> users)
- **status_delegacao**: TEXT (Enum: `pendente`, `aceita`, `recusada`, `concluida`)
- **descricao_tarefa**: TEXT
- **data_prazo**: TIMESTAMPTZ

---

### 👥 CRM e Clientes

#### `public.clientes`
- **id**: UUID (PK)
- **nome_razao_social**: TEXT
- **cpf_cnpj**: TEXT
- **email**: TEXT
- **telefone**: TEXT
- **status**: TEXT (Enum: `lead`, `ativo`, `inativo`, `blacklist`)
- **endereco**: JSONB (CEP, Rua, Bairro, Cidade, UF)
- **observacoes**: TEXT

---

### 💰 Financeiro

#### `public.financeiro_lancamentos`
Centraliza contas a pagar e receber.
- **id**: UUID (PK)
- **descricao**: TEXT
- **valor**: NUMERIC
- **tipo**: TEXT (`receita`, `despesa`)
- **categoria**: TEXT (`material`, `mao_de_obra`, `impostos`, etc.)
- **data_vencimento**: DATE
- **data_pagamento**: DATE
- **status**: TEXT (`em_aberto`, `pago`, `atrasado`)
- **os_id**: UUID (FK -> ordens_servico, opcional)
- **cliente_id**: UUID (FK -> clientes, opcional)

---

### 📅 Agendamentos e Turnos

#### `public.turnos`
Define a disponibilidade de horários para as equipes.
- **id**: UUID (PK)
- **titulo**: TEXT
- **inicio**: TIME
- **fim**: TIME
- **dias_semana**: INTEGER[] (Array de 0-6)
- **setor_responsavel**: TEXT

#### `public.agendamentos`
Compromissos vinculados a OSs e Turnos.
- **id**: UUID (PK)
- **os_id**: UUID (FK -> ordens_servico)
- **turno_id**: UUID (FK -> turnos)
- **data**: DATE
- **status**: TEXT (`agendado`, `confirmado`, `realizado`, `cancelado`)
- **observacoes**: TEXT

---

## 🔒 Políticas de Segurança (RLS)

As políticas de segurança são aplicadas com base no `cargo_slug` e `setor_slug` do usuário logado (`auth.uid()`).

1.  **Admin/Diretoria**: Acesso total (SELECT, INSERT, UPDATE, DELETE) em todas as tabelas.
2.  **Gestores**:
    - Podem ver todas as OSs do seu setor.
    - Podem criar e editar OSs.
    - Podem delegar tarefas.
    - Acesso financeiro restrito a `gestor_administrativo`.
3.  **Colaboradores**:
    - Visualizam apenas OSs onde são responsáveis OU que foram delegadas a eles.
    - Não podem deletar registros.
    - Edição restrita às etapas que estão responsáveis.

## 🔄 Triggers Importantes

-   **`handle_new_user`**: Cria automaticamente o perfil em `public.users` ao registrar em `auth.users`.
-   **`update_os_status`**: Atualiza o status geral da OS baseado no avanço das etapas.
-   **`audit_log`**: Registra alterações críticas em tabelas de auditoria.