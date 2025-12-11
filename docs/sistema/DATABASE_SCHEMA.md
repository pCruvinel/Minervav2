# 📊 Database Schema - Sistema Minerva ERP

**Última Atualização:** 2025-12-11
**Banco:** Supabase (PostgreSQL)
**Projeto:** zxfevlkssljndqqhxkjb (MinervaV2)
**Versão Schema:** v2.7

---

## Tabelas Principais

### 1. `ordens_servico` - Ordens de Serviço

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK, gerado automaticamente |
| `codigo_os` | text | Código único (OS-XX-NNNN), gerado via trigger |
| `tipo_os_id` | uuid | FK para `tipos_os` |
| `cliente_id` | uuid | FK para `clientes` |
| `responsavel_id` | uuid | FK para `colaboradores` |
| `criado_por_id` | uuid | FK para `colaboradores` |
| `status_geral` | text | 'rascunho', 'em_andamento', 'concluida', 'cancelada' |
| `data_prazo` | date | Prazo da OS |
| `parent_os_id` | uuid | FK para OS pai (hierarquia) |
| `is_contract_active` | boolean | Flag para contratos faturáveis (OS-12, OS-13) |
| `dados_publicos` | jsonb | Dados para formulários externos (OS-07) |
| `setor_atual_id` | uuid | FK para `setores` - setor responsável atual (**Novo v2.7**) |
| `setor_solicitante_id` | uuid | FK para `setores` - setor que originou a OS (**Novo v2.7**) |
| `etapa_atual_ordem` | integer | Número da etapa atual (**Novo v2.7**) |
| `created_at` | timestamptz | Data de criação |
| `updated_at` | timestamptz | Data de atualização |

---

### 2. `os_etapas` - Etapas das OS

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK |
| `os_id` | uuid | FK para `ordens_servico` |
| `ordem` | integer | Número da etapa (1, 2, 3...) |
| `nome` | text | Nome da etapa |
| `status` | text | 'pendente', 'em_andamento', 'concluida', 'bloqueada' |
| `responsavel_id` | uuid | FK para `colaboradores` |
| `data_prazo` | date | Prazo da etapa |
| `dados_etapa` | jsonb | Dados salvos na etapa |

---

### 3. `colaboradores` - Usuários do Sistema

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK |
| `user_id` | uuid | FK para `auth.users` |
| `nome_completo` | text | Nome do colaborador |
| `email` | text | Email único |
| `cargo_id` | uuid | FK para `cargos` |
| `setor_id` | uuid | FK para `setores` |
| `status_colaborador` | text | 'ativo', 'inativo', 'ferias' |

---

### 4. `cargos` - Cargos do Sistema

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK |
| `nome` | text | Nome do cargo |
| `slug` | text | Slug único (admin, coord_obras, etc.) |
| `setor_id` | uuid | FK para `setores` |
| `nivel_acesso` | integer | 0-10 (hierarquia) |
| `acesso_financeiro` | boolean | Flag para módulo financeiro |
| `escopo_visao` | text | 'global', 'setorial', 'proprio', 'nenhuma' |

---

### 5. `setores` - Setores da Empresa

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK |
| `nome` | text | Nome do setor |
| `slug` | text | Slug único (diretoria, obras, assessoria, administrativo, ti) |
| `descricao` | text | Descrição |

---

### 6. `tipos_os` - Tipos de OS

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK |
| `codigo` | text | Código (OS-01, OS-02, etc.) |
| `nome` | text | Nome do tipo |
| `setor_id` | uuid | FK para `setores` |

---

### 7. `clientes` - Clientes

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK |
| `nome` | text | Nome/Razão Social |
| `cpf_cnpj` | text | CPF ou CNPJ |
| `tipo` | text | 'pf' ou 'pj' |
| `email` | text | Email |
| `telefone` | text | Telefone |
| `endereco` | jsonb | Endereço completo |

---

### 8. `os_requisition_items` - Itens de Requisição (OS-09)

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK |
| `os_id` | uuid | FK para `ordens_servico` (nullable) |
| `os_etapa_id` | uuid | FK para `os_etapas` (nullable) |
| `descricao` | text | Descrição do item |
| `quantidade` | numeric | Quantidade |
| `unidade` | text | Unidade de medida |
| `status` | text | Status do item |

> **Constraint:** `os_id IS NOT NULL OR os_etapa_id IS NOT NULL`

---

### 9. `os_vagas_recrutamento` - Vagas de RH (OS-10)

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK |
| `os_id` | uuid | FK para `ordens_servico` |
| `cargo_funcao` | text | Nome do cargo |
| `quantidade` | integer | Número de vagas |
| `salario_base` | numeric | Salário oferecido |
| `habilidades_necessarias` | text | Requisitos |
| `status` | text | 'aberta', 'em_selecao', 'preenchida', 'cancelada' |
| `urgencia` | text | 'baixa', 'normal', 'alta', 'critica' |

---

### 9.5. `agendamentos` - Sistema de Agendamentos

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK |
| `turno_id` | uuid | FK para tabela de turnos |
| `data` | date | Data do agendamento |
| `horario_inicio` | time | Horário de início |
| `horario_fim` | time | Horário de término |
| `duracao_horas` | numeric | Duração em horas |
| `categoria` | text | Tipo: 'Vistoria Inicial', 'Vistoria Técnica', etc. |
| `setor` | text | Setor do agendamento |
| `os_id` | uuid | FK para `ordens_servico` (opcional) |
| `responsavel_id` | uuid | FK para `colaboradores` - **Executor** (dono da agenda) |
| `criado_por` | uuid | FK para `colaboradores` - **Agendador** (audit) |
| `status` | text | 'confirmado', 'cancelado', 'realizado', 'ausente' |

> **Semântica:** `responsavel_id` = quem vai executar (agenda bloqueada).
> `criado_por` = quem criou o registro (rastreabilidade).

## 🆕 Novas Tabelas v2.6 (Financeiro & Cobrança)

### 10. `contas_pagar` - Contas a Pagar

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK |
| `descricao` | text | Descrição da conta |
| `valor` | numeric | Valor da conta |
| `vencimento` | date | Data de vencimento |
| `data_pagamento` | date | Data do pagamento |
| `status` | text | 'em_aberto', 'pago', 'atrasado', 'cancelado' |
| `tipo` | text | 'salario', 'conta_fixa', 'despesa_variavel', etc. |
| `favorecido_colaborador_id` | uuid | FK para `colaboradores` |
| `favorecido_fornecedor` | text | Nome do fornecedor |
| `cc_id` | uuid | FK para `centros_custo` |
| `boleto_id` | uuid | FK para `cora_boletos` |

### 11. `contas_receber` - Contas a Receber

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK |
| `cliente_id` | uuid | FK para `clientes` |
| `os_id` | uuid | FK para `ordens_servico` |
| `cc_id` | uuid | FK para `centros_custo` |
| `valor_previsto` | numeric | Valor esperado |
| `valor_recebido` | numeric | Valor efetivamente recebido |
| `vencimento` | date | Data de vencimento |
| `data_recebimento` | date | Data do recebimento |
| `status` | text | 'em_aberto', 'conciliado', 'inadimplente' |
| `boleto_id` | uuid | FK para `cora_boletos` |

### 12. `cora_boletos` - Boletos Cora (Integração)

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK |
| `cora_boleto_id` | text | ID único no Cora |
| `nosso_numero` | text | Nosso número |
| `linha_digitavel` | text | Linha digitável |
| `codigo_barras` | text | Código de barras |
| `valor` | integer | Valor em centavos |
| `vencimento` | date | Data de vencimento |
| `status` | text | 'PENDENTE', 'PAGO', 'CANCELADO', 'EXPIRADO' |
| `cliente_id` | uuid | FK para `clientes` |
| `os_id` | uuid | FK para `ordens_servico` |

### 13. `contratos` - Contratos de Serviço

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK |
| `numero_contrato` | varchar | Número único do contrato |
| `cliente_id` | uuid | FK para `clientes` |
| `tipo` | text | 'avulso', 'recorrente', 'parceiro', 'obra' |
| `valor_total` | numeric | Valor total do contrato |
| `valor_mensal` | numeric | Valor mensal (se recorrente) |
| `data_inicio` | date | Data de início |
| `data_fim` | date | Data de término |
| `status` | text | 'rascunho', 'ativo', 'suspenso', 'encerrado' |

### 14. `faturas` - Faturas de Contrato

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK |
| `contrato_id` | uuid | FK para `contratos` |
| `numero_fatura` | varchar | Número único da fatura |
| `parcela_num` | integer | Número da parcela |
| `valor_original` | numeric | Valor original |
| `valor_final` | numeric | Valor com juros/multas/descontos |
| `vencimento` | date | Data de vencimento |
| `status` | text | 'pendente', 'pago', 'atrasado', 'cancelado' |
| `boleto_id` | uuid | FK para `cora_boletos` |

### 15. `pagamentos` - Registro de Pagamentos

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK |
| `fatura_id` | uuid | FK para `faturas` |
| `valor_pago` | numeric | Valor efetivamente pago |
| `data_pagamento` | date | Data do pagamento |
| `forma_pagamento` | text | 'boleto', 'pix', 'ted', 'dinheiro', 'cartao' |
| `comprovante_url` | text | URL do comprovante |

### 16. `extratos_bancarios` - Extratos Bancários

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK |
| `data` | date | Data da transação |
| `descricao_banco` | text | Descrição do banco |
| `valor` | numeric | Valor da transação |
| `tipo` | text | 'entrada', 'saida' |
| `status` | text | 'pendente', 'conciliado', 'ignorado' |

### 17. `conciliacoes` - Conciliação Bancária

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK |
| `extrato_id` | uuid | FK para `extratos_bancarios` |
| `tipo_lancamento` | text | 'conta_receber', 'conta_pagar', 'lancamento_manual' |
| `lancamento_id` | uuid | ID do lançamento conciliado |
| `valor_extrato` | numeric | Valor no extrato |
| `valor_lancamento` | numeric | Valor no sistema |
| `status` | text | 'conciliado', 'parcial', 'divergente' |

### 18. `notificacoes` - Notificações do Usuário

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK |
| `usuario_id` | uuid | FK para `colaboradores` |
| `titulo` | text | Título da notificação |
| `mensagem` | text | Conteúdo da notificação |
| `link_acao` | text | Link para redirecionamento (opcional) |
| `lida` | boolean | Status de leitura |
| `tipo` | text | 'info', 'warning', 'error', 'success' |
| `created_at` | timestamptz | Data de criação |

### 19. `sistema_avisos` - Mural de Avisos

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK |
| `titulo` | text | Título do aviso |
| `mensagem` | text | Conteúdo do aviso |
| `tipo` | text | 'info', 'alert', 'warning', 'success' |
| `ativo` | boolean | Se o aviso está visível |
| `validade` | date | Até quando exibir |
| `created_by` | uuid | FK para `colaboradores` |
| `created_at` | timestamptz | Data de criação |

### 20. `os_transferencias` - Histórico de Transferências de Setor (**Novo v2.7**)

| Coluna | Tipo | Descrição |
|:-------|:-----|:----------|
| `id` | uuid | PK |
| `os_id` | uuid | FK para `ordens_servico` |
| `etapa_origem` | integer | Número da etapa de origem |
| `etapa_destino` | integer | Número da etapa de destino |
| `setor_origem_id` | uuid | FK para `setores` |
| `setor_destino_id` | uuid | FK para `setores` |
| `transferido_por_id` | uuid | FK para `colaboradores` - quem executou |
| `coordenador_notificado_id` | uuid | FK para `colaboradores` - coordenador notificado |
| `transferido_em` | timestamptz | Data/hora da transferência |
| `motivo` | text | Motivo: 'avanço_etapa', 'reversão', etc. |
| `metadados` | jsonb | Dados adicionais (osType, cliente, etc.) |

> **Substitui:** Tabela `delegacoes` (deprecated)

---

## ⚡ Edge Functions (Backend)

| Nome | Slug | Descrição | Status |
|:-----|:-----|:----------|:-------|
| `server` | `server` | API Principal (Hono), CRUDs, BFF | Ativo |
| `generate-pdf` | `generate-pdf` | Geração de PDFs (Propostas/OS) | Ativo |
| `invite-user` | `invite-user` | Envio de convites de acesso por email | **Novo** |

---

## Migrations Aplicadas

| Arquivo | Descrição |
|:--------|:----------|
| `001_add_parent_os_id.sql` | Adiciona `parent_os_id` para hierarquia |
| `002_create_function_generate_codigo_os.sql` | Função de geração de código |
| `003_create_trigger_gerar_codigo_os.sql` | Trigger automático para código |
| `005_create_os_requisition_items.sql` | Tabela de itens de requisição |
| `008_os_parent_child_architecture.sql` | `is_contract_active`, `os_vagas_recrutamento` |
| `009_create_delegacoes_table.sql` | Sistema de delegação de tarefas **(DEPRECATED)** |
| `010_create_notifications_system.sql` | Tabelas `notificacoes` e `sistema_avisos` |
| `20250105_refactor_roles_sectors.sql` | Reestruturação RBAC (cargos/setores) |
| `20250106_create_contas_pagar.sql` | Tabela de contas a pagar |
| `20250107_create_contas_receber.sql` | Tabela de contas a receber |
| `20250108_create_cora_boletos.sql` | Integração com Cora (boletos) |
| `20250109_create_contratos.sql` | Sistema de contratos |
| `20250110_create_faturas.sql` | Sistema de faturamento |
| `20250111_create_pagamentos.sql` | Registro de pagamentos |
| `20250112_create_extratos_bancarios.sql` | Importação de extratos |
| `20250113_create_conciliacoes.sql` | Conciliação bancária |
| `20250114_add_colaborador_fields.sql` | Novos campos de RH (Dados Bancários, Docs) |
| `20251211_create_os_transferencias.sql` | **Transferência automática de setor** (substitui delegação) |

---

## Relacionamentos Chave

```
ordens_servico
├── tipos_os (tipo_os_id)
├── clientes (cliente_id)
├── colaboradores (responsavel_id, criado_por_id)
├── ordens_servico (parent_os_id) -- auto-referência
├── os_etapas[] (1:N)
├── os_requisition_items[] (1:N)
├── os_vagas_recrutamento[] (1:N)
├── contas_receber[] (1:N)
├── contratos[] (1:N)
└── cora_boletos[] (1:N)

clientes
├── ordens_servico[] (1:N)
├── contas_receber[] (1:N)
├── contratos[] (1:N)
├── faturas[] (1:N)
├── pagamentos[] (1:N)
├── cora_boletos[] (1:N)
└── clientes_documentos[] (1:N)

colaboradores
├── cargos (cargo_id)
├── setores (setor_id)
├── auth.users (user_id)
├── contas_pagar[] (1:N) -- favorecido
├── notificacoes[] (1:N)
└── registros_presenca[] (1:N)

cargos
├── setores (setor_id)
└── colaboradores[] (1:N)

contratos
├── faturas[] (1:N)
├── clientes (cliente_id)
├── ordens_servico (os_id)
└── centros_custo (cc_id)

faturas
├── pagamentos[] (1:N)
├── contratos (contrato_id)
├── clientes (cliente_id)
└── cora_boletos (boleto_id)

contas_pagar
├── centros_custo (cc_id)
├── colaboradores (favorecido_colaborador_id)
└── cora_boletos (boleto_id)

contas_receber
├── clientes (cliente_id)
├── ordens_servico (os_id)
├── centros_custo (cc_id)
└── cora_boletos (boleto_id)

extratos_bancarios
└── conciliacoes[] (1:N)

conciliacoes
├── extratos_bancarios (extrato_id)
└── [contas_pagar|contas_receber] (lancamento_id)
```

---

## 📊 Estatísticas do Schema v2.6

- **Total de Tabelas:** 28+ tabelas ativas
- **Enums Definidos:** 15 tipos enumerados
- **Edge Functions:** 3 ativas
- **Migrations Aplicadas:** 17+ arquivos SQL
- **Índices de Performance:** 20+ índices criados
- **Políticas RLS:** Ativas em tabelas críticas
- **Triggers Automáticos:** Geração de códigos OS, auditoria

---

*Documentação atualizada com dados reais do Supabase (Projeto: MinervaV2)*
