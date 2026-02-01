# 🏗️ Arquitetura do Módulo de RH

> **Última Atualização:** 28/01/2026

---

## 📊 Diagrama de Relacionamentos

```mermaid
erDiagram
    auth_users ||--o| colaboradores : "id = id"
    colaboradores ||--o{ colaboradores_documentos : "colaborador_id"
    colaboradores ||--o{ registros_presenca : "colaborador_id"
    colaboradores }o--|| cargos : "cargo_id"
    colaboradores }o--|| setores : "setor_id"
    
    ordens_servico ||--o{ os_vagas_recrutamento : "os_id"
    turnos ||--o{ agendamentos : "turno_id"
    agendamentos }o--o| colaboradores : "responsavel_id"
    agendamentos }o--o| ordens_servico : "os_id"
    
    registros_presenca }o--o{ centros_custo : "centros_custo (jsonb)"

    colaboradores {
        uuid id PK
        text nome_completo
        text email
        uuid cargo_id FK
        uuid setor_id FK
        boolean ativo
        numeric salario_base
        numeric custo_dia
    }
    
    os_vagas_recrutamento {
        uuid id PK
        uuid os_id FK
        text cargo_funcao
        integer quantidade
        text status
        text urgencia
    }
    
    turnos {
        uuid id PK
        time hora_inicio
        time hora_fim
        integer vagas_total
        jsonb setores
        text tipo_recorrencia
    }
    
    agendamentos {
        uuid id PK
        uuid turno_id FK
        date data
        time horario_inicio
        text categoria
        text setor
        uuid os_id FK
    }
```

---

## 🔄 Fluxo de Dados - Presença

```mermaid
flowchart TD
    A[Coordenador acessa /colaboradores/presenca-tabela] --> B[Carrega colaboradores do dia]
    B --> C{Para cada colaborador}
    C --> D[Select Status: OK/Atrasado/Falta]
    D -->|Se Falta/Atrasado| E[Modal Justificativa + Anexo]
    E --> F[Select Performance]
    F --> G[Select Centro de Custo]
    G -->|Múltiplos CCs| H[Modal de Rateio %]
    H --> I[Salvar Registros]
    I --> J[Confirmar Presenças do Dia]
    J --> K[(registros_presenca + alocacao_horas_cc)]
```

---

## 🔄 Fluxo de Dados - OS-10 (Requisição MO)

```mermaid
flowchart TD
    A[Coord. cria OS-10] --> B[Step 1: Seleciona Centro de Custo]
    B --> C[Step 2: Dados da Solicitação]
    C --> D[Step 3: Gerenciador de Vagas]
    D --> E{Adicionar Vaga}
    E --> F[Cargo, Qtd, Salário, Requisitos]
    F --> G[Step 4: Revisão e Envio]
    G --> H[Cria OS + Vagas]
    H --> I[(ordens_servico + os_vagas_recrutamento)]
    
    I --> J[Kanban de Recrutamento]
    J --> K[Pendente Aprovação]
    K --> L[Em Divulgação]
    L --> M[Entrevistas]
    M --> N[Finalizado]
```

---

## 🧩 Componentes Principais

```
┌─────────────────────────────────────────────────────────────┐
│                     MÓDULO DE RH                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐     ┌─────────────────┐                │
│  │  COLABORADORES  │     │   PRESENÇA      │                │
│  │  - Lista        │     │   - Tabela      │                │
│  │  - Detalhes     │     │   - Detalhes    │                │
│  │  - Modal CRUD   │     │   - Histórico   │                │
│  └────────┬────────┘     └────────┬────────┘                │
│           │                       │                          │
│           ▼                       ▼                          │
│  ┌─────────────────────────────────────────┐                │
│  │            HOOKS DE DADOS               │                │
│  │  - use-os-workflows (centralizado)      │                │
│  │  - use-turnos                           │                │
│  │  - use-agendamentos                     │                │
│  │  - use-recrutamento                     │                │
│  │  - use-custo-mo                         │                │
│  └────────────────────┬────────────────────┘                │
│                       │                                      │
│                       ▼                                      │
│  ┌─────────────────────────────────────────┐                │
│  │          SUPABASE (PostgreSQL)          │                │
│  │  - colaboradores                        │                │
│  │  - registros_presenca                   │                │
│  │  - turnos / agendamentos                │                │
│  │  - os_vagas_recrutamento                │                │
│  └─────────────────────────────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Integrações

### Supabase Storage

| Bucket | Uso | Padrão de Nome |
|--------|-----|----------------|
| `avatars` | Fotos de perfil | `{user_id}/avatar_{timestamp}.jpg` |
| `documentos-colaboradores` | Docs pessoais | `{colaborador_id}/{tipo}_{timestamp}.ext` |
| `comprovantes-presenca` | Atestados | `{colaborador_id}/{timestamp}_atestado.ext` |

### Integração com Outros Módulos

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  MÓDULO RH   │────▶│   MÓDULO OS  │────▶│  FINANCEIRO  │
│              │     │              │     │              │
│ Colaboradores│     │ Alocação CC  │     │ Custo MO     │
│ Presença     │     │ Agendamentos │     │ Rateio       │
│ Recrutamento │     │ OS-10        │     │ Lucratividade│
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 🔐 RLS (Row Level Security)

### Política de Leitura - `colaboradores`

```sql
-- Nível >= 5 (Coordenadores+) veem todos
-- Demais veem próprio perfil ou mesmo setor
CREATE POLICY "colaboradores_read_final" ON colaboradores
FOR SELECT USING (
  id = auth.uid() OR
  get_user_nivel() >= 5 OR
  setor_id = (SELECT setor_id FROM colaboradores WHERE id = auth.uid())
);
```

### Política - `registros_presenca`

```sql
-- Coordenadores+ podem ler/escrever todos
-- Operacionais apenas do próprio setor
CREATE POLICY "presenca_access" ON registros_presenca
FOR ALL USING (
  get_user_nivel() >= 5 OR
  colaborador_id IN (
    SELECT id FROM colaboradores 
    WHERE setor_id = get_current_user_setor()
  )
);
```

---

## 📦 Dependências de Componentes

```
colaborador-detalhes-page.tsx
├── modal-cadastro-colaborador.tsx
├── DOCUMENTOS_OBRIGATORIOS (constants)
├── use-cliente-documentos (hook)
├── BarChart (recharts)
└── supabase-client

controle-presenca-tabela-page.tsx
├── use-centro-custo (hook)
├── BulkActionsBar (interno)
├── ModalJustificativa (interno)
├── ModalRateioCC (interno)
└── Table (shadcn/ui)

recrutamento-page.tsx
├── recrutamento-kanban.tsx
├── requisicao-card.tsx
├── modal-detalhes-requisicao.tsx
└── use-recrutamento (hook)
```

---

*Diagrama gerado com base na análise do código-fonte e banco de dados.*
