# Diagrama ER - Minerva ERP Backend

**Data:** 18/11/2024
**Análise completa do schema do banco de dados**

---

## Diagrama Entidade-Relacionamento (Mermaid)

```mermaid
erDiagram
    auth_users ||--|| colaboradores : "1:1"
    colaboradores ||--o{ clientes : "responsavel"
    colaboradores ||--o{ ordens_servico : "responsavel"
    colaboradores ||--o{ ordens_servico : "criado_por"
    colaboradores ||--o{ os_etapas : "responsavel"
    colaboradores ||--o{ os_etapas : "aprovador"
    colaboradores ||--o{ os_historico_status : "alterado_por"
    colaboradores ||--o{ colaborador_presenca : "colaborador"
    colaboradores ||--o{ colaborador_presenca : "registrado_por"
    colaboradores ||--o{ colaborador_performance : "colaborador_avaliado"
    colaboradores ||--o{ colaborador_performance : "avaliador"
    colaboradores ||--o{ financeiro_lancamentos : "criado_por"
    colaboradores ||--o{ audit_log : "usuario"
    colaboradores }o--o{ agendamentos : "agendamento_colaboradores"
    colaboradores }o--o{ centros_custo : "colaborador_alocacoes_cc"

    clientes ||--o{ ordens_servico : "cliente"
    clientes ||--o{ centros_custo : "cliente_obra"
    clientes ||--o{ financeiro_lancamentos : "cliente"

    tipos_os ||--o{ ordens_servico : "tipo"

    ordens_servico ||--o{ os_etapas : "ordem"
    ordens_servico ||--o{ os_anexos : "ordem"
    ordens_servico ||--o{ os_historico_status : "historico"
    ordens_servico ||--o{ agendamentos : "agendamento"
    ordens_servico }o--|| centros_custo : "cc"

    os_etapas ||--o{ os_anexos : "etapa"

    centros_custo ||--o{ financeiro_lancamentos : "cc"

    auth_users {
        uuid id PK
        string email
        timestamp created_at
    }

    colaboradores {
        uuid id PK,FK
        string nome_completo
        string cpf
        string telefone
        date data_admissao
        date data_demissao
        boolean ativo
        enum role_nivel
        enum setor
        numeric custo_mensal
        string email
    }

    clientes {
        uuid id PK
        timestamp created_at
        enum status
        string nome_razao_social
        string cpf_cnpj
        string email
        string telefone
        string nome_responsavel
        enum tipo_cliente
        jsonb endereco
        text observacoes
        uuid responsavel_id FK
    }

    tipos_os {
        uuid id PK
        string codigo
        string nome
        enum setor_padrao
        text descricao
        string categoria
        boolean fluxo_especial
        boolean requer_cliente
        boolean ativo
        jsonb etapas_padrao
        jsonb campos_customizados
    }

    ordens_servico {
        uuid id PK
        string codigo_os
        uuid cliente_id FK
        uuid tipo_os_id FK
        uuid responsavel_id FK
        uuid criado_por_id FK
        uuid cc_id FK
        enum status_geral
        timestamp data_entrada
        timestamp data_prazo
        timestamp data_conclusao
        numeric valor_proposta
        numeric valor_contrato
        text descricao
    }

    os_etapas {
        uuid id PK
        uuid os_id FK
        string nome_etapa
        smallint ordem
        enum status
        uuid responsavel_id FK
        uuid aprovador_id FK
        text comentarios_aprovacao
        timestamp data_inicio
        timestamp data_conclusao
        jsonb dados_etapa
    }

    os_anexos {
        uuid id PK
        timestamp created_at
        uuid os_id FK
        uuid etapa_id FK
        string nome_arquivo
        string path_storage
        string tipo_anexo
        text comentarios
    }

    centros_custo {
        uuid id PK
        string nome
        enum tipo
        uuid cliente_id FK
        numeric valor_global
        enum status_cc
    }

    agendamentos {
        uuid id PK
        timestamp created_at
        uuid os_id FK
        string titulo
        text descricao
        timestamp data_inicio
        timestamp data_fim
        enum status
    }

    agendamento_colaboradores {
        uuid agendamento_id PK,FK
        uuid colaborador_id PK,FK
    }

    colaborador_alocacoes_cc {
        uuid colaborador_id PK,FK
        uuid cc_id PK,FK
        numeric percentual_alocado
    }

    financeiro_lancamentos {
        uuid id PK
        uuid criado_por_id FK
        text descricao
        numeric valor
        enum tipo
        date data_vencimento
        date data_pagamento
        boolean conciliado
        uuid cc_id FK
        uuid cliente_id FK
        jsonb recorrencia
        string url_nota_fiscal
    }

    audit_log {
        uuid id PK
        timestamp created_at
        uuid usuario_id FK
        string acao
        string tabela_afetada
        string registro_id_afetado
        jsonb dados_antigos
        jsonb dados_novos
    }

    os_historico_status {
        uuid id PK
        timestamp created_at
        uuid os_id FK
        enum status_anterior
        enum status_novo
        uuid alterado_por_id FK
        text observacoes
    }

    colaborador_presenca {
        uuid id PK
        uuid colaborador_id FK
        date data
        enum status
        text justificativa
        uuid registrado_por_id FK
    }

    colaborador_performance {
        uuid id PK
        uuid colaborador_id FK
        uuid avaliador_id FK
        date data_avaliacao
        enum avaliacao
        text justificativa
    }

    kv_store_5ad7fd2c {
        string key PK
        jsonb value
    }
```

---

## Tabelas por Módulo

### 🔐 Autenticação e Usuários
- `auth.users` (Supabase Auth)
- `colaboradores`

### 👥 Clientes e Leads
- `clientes`

### 📋 Ordens de Serviço (Core)
- `tipos_os`
- `ordens_servico`
- `os_etapas`
- `os_anexos`

### 💰 Financeiro
- `centros_custo`
- `financeiro_lancamentos`
- `colaborador_alocacoes_cc`

### 📅 Agendamento
- `agendamentos`
- `agendamento_colaboradores`

### 📊 Auditoria e Histórico
- `audit_log`
- `os_historico_status`
- `colaborador_presenca`
- `colaborador_performance`

### 🗄️ Armazenamento
- `kv_store_5ad7fd2c` (Key-Value Store)

---

## ENUMs Definidos

### user_role_nivel
```
COLABORADOR
COORDENADOR
GESTOR
DIRETOR
```

### setor_colaborador
```
ASSESORIA
OBRAS
FINANCEIRO
COMERCIAL
```

### cliente_status
```
LEAD
CLIENTE_ATIVO
CLIENTE_INATIVO
```

### tipo_cliente
```
PESSOA_FISICA
CONDOMINIO
CONSTRUTORA
INCORPORADORA
INDUSTRIA
COMERCIO
OUTRO
```

### os_status_geral
```
EM_TRIAGEM
AGUARDANDO_INFORMACOES
EM_ANDAMENTO
EM_VALIDACAO
ATRASADA
CONCLUIDA
CANCELADA
```

### os_etapa_status
```
PENDENTE
EM_ANDAMENTO
AGUARDANDO_APROVACAO
APROVADA
REJEITADA
CONCLUIDA
```

### agendamento_status
```
AGENDADO
EM_ANDAMENTO
CONCLUIDO
CANCELADO
```

### tipo_lancamento
```
RECEITA
DESPESA
```

### tipo_centro_custo
```
OBRA
ADMINISTRATIVO
LABORATORIO
COMERCIAL
GERAL
```

### avaliacao_performance
```
EXCELENTE
BOM
REGULAR
INSATISFATORIO
```

### status_presenca
```
PRESENTE
FALTA
FALTA_JUSTIFICADA
ATESTADO
FERIAS
```

---

## Relacionamentos Principais

### 1:1
- `auth.users` ↔ `colaboradores`

### 1:N (Um para Muitos)
- `colaboradores` → `clientes` (responsável)
- `colaboradores` → `ordens_servico` (responsável, criado_por)
- `clientes` → `ordens_servico`
- `tipos_os` → `ordens_servico`
- `ordens_servico` → `os_etapas`
- `ordens_servico` → `os_anexos`
- `os_etapas` → `os_anexos`
- `centros_custo` → `ordens_servico`

### N:M (Muitos para Muitos)
- `agendamentos` ↔ `colaboradores` (via `agendamento_colaboradores`)
- `colaboradores` ↔ `centros_custo` (via `colaborador_alocacoes_cc`)

---

## Índices Recomendados (ainda não implementados)

```sql
-- Performance em queries de OS
CREATE INDEX idx_os_status ON ordens_servico(status_geral);
CREATE INDEX idx_os_cliente ON ordens_servico(cliente_id);
CREATE INDEX idx_os_responsavel ON ordens_servico(responsavel_id);
CREATE INDEX idx_os_created ON ordens_servico(data_entrada);
CREATE INDEX idx_os_tipo ON ordens_servico(tipo_os_id);

-- Performance em etapas
CREATE INDEX idx_etapas_os ON os_etapas(os_id);
CREATE INDEX idx_etapas_status ON os_etapas(status);
CREATE INDEX idx_etapas_responsavel ON os_etapas(responsavel_id);
CREATE INDEX idx_etapas_ordem ON os_etapas(os_id, ordem);

-- Performance em anexos
CREATE INDEX idx_anexos_os ON os_anexos(os_id);
CREATE INDEX idx_anexos_etapa ON os_anexos(etapa_id);

-- Performance em clientes
CREATE INDEX idx_clientes_status ON clientes(status);
CREATE INDEX idx_clientes_responsavel ON clientes(responsavel_id);
CREATE INDEX idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);

-- Performance em financeiro
CREATE INDEX idx_lancamentos_vencimento ON financeiro_lancamentos(data_vencimento);
CREATE INDEX idx_lancamentos_cc ON financeiro_lancamentos(cc_id);
CREATE INDEX idx_lancamentos_tipo ON financeiro_lancamentos(tipo);
CREATE INDEX idx_lancamentos_conciliado ON financeiro_lancamentos(conciliado);

-- Performance em auditoria
CREATE INDEX idx_audit_usuario ON audit_log(usuario_id);
CREATE INDEX idx_audit_tabela ON audit_log(tabela_afetada);
CREATE INDEX idx_audit_data ON audit_log(created_at);
```

---

## Campos JSONB (Estruturas Flexíveis)

### clientes.endereco
```json
{
  "rua": "string",
  "numero": "string",
  "complemento": "string",
  "bairro": "string",
  "cidade": "string",
  "estado": "string",
  "cep": "string"
}
```

### os_etapas.dados_etapa
```json
{
  "campo_custom_1": "valor",
  "campo_custom_2": "valor",
  "anexos_ids": ["uuid1", "uuid2"]
}
```

### tipos_os.etapas_padrao
```json
[
  {
    "ordem": 1,
    "nome": "Follow-up 1",
    "campos": ["idade_edificacao", "motivo_visita"]
  },
  {
    "ordem": 2,
    "nome": "Aprovação Comercial",
    "campos": ["valor_proposta"]
  }
]
```

### financeiro_lancamentos.recorrencia
```json
{
  "tipo": "mensal",
  "dia": 5,
  "meses": 12
}
```

---

**Gerado pela análise automatizada do backend**
