# 🏗️ Arquitetura do Módulo Financeiro

> **Última Atualização:** 2026-01-25

---

## 📊 Visão Geral da Arquitetura

O módulo financeiro segue uma arquitetura em camadas que integra:

1. **Frontend** → React + TanStack Router + React Query
2. **Backend** → Supabase (PostgreSQL + Edge Functions)
3. **Integrações** → OS, Contratos, Presença, Centro de Custo

---

## 🔄 Fluxo de Dados

```mermaid
graph TD
    subgraph Frontend
        A[Páginas Financeiras] --> B[Hooks React Query]
        B --> C[Supabase Client]
    end
    
    subgraph Backend Supabase
        C --> D[Tables]
        C --> E[Views]
        C --> F[RPCs]
        
        D --> G[contas_receber]
        D --> H[contas_pagar]
        D --> I[alocacao_horas_cc]
        D --> J[centros_custo]
        D --> K[plano_contas]
        D --> L[categorias_financeiras]
        
        E --> M[view_financeiro_os_resumo]
        E --> N[view_custo_mo_detalhado_os]
        E --> O[view_financeiro_cliente_resumo]
        E --> P[vw_lucratividade_cc]
        
        F --> Q[gerar_centro_custo]
        F --> R[gerar_parcelas_contrato]
        F --> S[validar_fechamento_centro_custo]
    end
    
    subgraph Triggers
        T[criar_centro_custo_para_os] --> J
        U[fn_gerar_faturas_contrato] --> G
    end
```

---

## 🧩 Componentes do Sistema

### Camada de Apresentação (Frontend)

| Componente | Rota | Propósito |
|------------|------|-----------|
| `FinanceiroDashboardPage` | `/financeiro` | KPIs + Gráficos comparativos |
| `ReceitasRecorrentesPage` | `/financeiro/receitas-recorrentes` | Contratos + Parcelas pendentes |
| `FaturasRecorrentesPage` | `/financeiro/faturas-recorrentes` | Despesas + Folha de pagamento |
| `FluxoCaixaPage` | `/financeiro/fluxo-caixa` | Projeção diária + Calendário |
| `CustoMaoDeObraPage` | `/financeiro/custo-mao-de-obra` | Custo MO por CC/Colaborador |
| `CentroCustoDetalhesPage` | `/financeiro/centro-custo/$ccId` | Visão 360° do CC |
| `ConciliacaoBancariaPage` | `/financeiro/conciliacao` | ⏸️ Adiado |

### Camada de Dados (Hooks)

| Hook | Arquivo | Propósito |
|------|---------|-----------|
| `useFinanceiroDashboard` | `use-financeiro-dashboard.ts` | KPIs agregados |
| `useReceitasRecorrentes` | `use-receitas-recorrentes.ts` | Contratos ativos |
| `useParcelasPendentes` | `use-receitas-recorrentes.ts` | Parcelas em aberto |
| `useFaturasRecorrentes` | `use-faturas-recorrentes.ts` | Despesas do mês |
| `useFluxoCaixa` | `use-fluxo-caixa.ts` | Projeção de fluxo |
| `useCustoMODetalhado` | `use-custo-mo.ts` | Custo MO por OS |
| `useCentroCusto` | `use-centro-custo.ts` | CRUD de CC |

### Camada de Banco de Dados

```mermaid
erDiagram
    plano_contas ||--o{ categorias_financeiras : "contém"
    plano_contas ||--o{ plano_contas : "pai_id"
    
    categorias_financeiras ||--o{ contas_pagar : "categoria_id"
    categorias_financeiras ||--o{ contas_receber : "categoria_id"
    
    contratos ||--o{ contas_receber : "contrato_id"
    contratos }o--|| clientes : "cliente_id"
    contratos }o--o| ordens_servico : "os_id"
    
    contas_pagar }o--o| centros_custo : "cc_id"
    contas_receber }o--o| centros_custo : "cc_id"
    contas_receber }o--|| clientes : "cliente_id"
    
    centros_custo }o--o| ordens_servico : "os_id"
    centros_custo }o--o| clientes : "cliente_id"
    centros_custo }o--o| tipos_os : "tipo_os_id"
    
    alocacao_horas_cc }o--|| centros_custo : "cc_id"
    alocacao_horas_cc }o--|| registros_presenca : "registro_presenca_id"
    registros_presenca }o--|| colaboradores : "colaborador_id"
```

---

## 🔗 Integrações

### Centro de Custo ↔ Ordem de Serviço

A criação de uma OS dispara automaticamente a criação de um Centro de Custo via trigger:

```
OS Criada → Trigger criar_centro_custo_para_os() → CC Gerado
                                                     ↓
                                               OS.cc_id = CC.id
```

**Formato do nome do CC:**
```
CC{NUMERO_TIPO_OS}{SEQUENCIAL_3_DIGITOS}-{APELIDO_CLIENTE}
Exemplo: CC13001-SOLAR_I
```

### Contrato ↔ Parcelas

A ativação de um contrato gera parcelas em `contas_receber`:

```
Contrato status='ativo' → Trigger fn_gerar_faturas_contrato() → Parcelas geradas
```

### Presença ↔ Custo de MO

O custo de mão de obra é calculado através de alocação de horas:

```
Registro Presença → Alocação Horas CC → Custo calculado por CC
         ↓                    ↓
   colaborador_id         percentual + valor_calculado
```

---

## 📁 Estrutura de Arquivos

```
src/
├── components/financeiro/
│   ├── centro-custo-detalhes-page.tsx  (749 linhas)
│   ├── conciliacao-bancaria-page.tsx   (574 linhas) ⏸️
│   ├── custo-mao-de-obra-page.tsx      (480 linhas)
│   ├── faturas-recorrentes-page.tsx    (945 linhas)
│   ├── financeiro-dashboard-page.tsx   (507 linhas)
│   ├── fluxo-caixa-page.tsx            (620 linhas)
│   ├── receitas-recorrentes-page.tsx   (800 linhas)
│   ├── kpi-card-financeiro.tsx         (componente KPI)
│   └── modals/
│       └── nova-despesa-modal.tsx
│
├── lib/hooks/
│   ├── use-financeiro-dashboard.ts     (219 linhas)
│   ├── use-receitas-recorrentes.ts     (298 linhas)
│   ├── use-faturas-recorrentes.ts      (454 linhas)
│   ├── use-fluxo-caixa.ts              (403 linhas)
│   ├── use-custo-mo.ts                 (261 linhas)
│   └── use-centro-custo.ts             (276 linhas)
│
└── routes/_auth/financeiro/
    ├── index.tsx                        → Dashboard
    ├── receitas-recorrentes.tsx
    ├── faturas-recorrentes.tsx
    ├── fluxo-caixa.tsx
    ├── custo-mao-de-obra.tsx
    ├── conciliacao.tsx                  ⏸️
    └── centro-custo.$ccId.tsx
```

---

## 🔐 Considerações de Segurança

1. **RLS (Row Level Security)**: Atualmente desabilitado nas tabelas financeiras. Recomendado habilitar antes de produção.

2. **Funções SECURITY DEFINER**: 
   - `criar_centro_custo_para_os` executa com privilégios elevados para garantir criação automática de CC.

3. **Validações**:
   - Fechamento de CC só permitido com todas as contas conciliadas
   - NF obrigatória para despesas quando `exige_nf=true` no plano de contas
