# 📊 Módulo Financeiro - Documentação Técnica

> **Última Atualização:** 2026-02-01  
> **Status:** ✅ Backend Completo | ✅ Frontend Integrado | ✅ Conciliação Bancária (Supabase) | ✅ Integração Cora (Sync Ativo)  
> **Supabase Project ID:** `zxfevlkssljndqqhxkjb`

---

## 📁 Índice de Documentos

| Documento | Descrição |
|-----------|-----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitetura, fluxo de dados e diagrama ERD |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Schema completo de tabelas, views e funções SQL |
| [CORA_INTEGRATION.md](./CORA_INTEGRATION.md) | Guia de integração mTLS com Banco Cora |
| [PAGES_AND_ROUTES.md](./PAGES_AND_ROUTES.md) | Mapeamento de rotas e componentes |
| [HOOKS_AND_QUERIES.md](./HOOKS_AND_QUERIES.md) | Documentação dos custom hooks e queries |
| [CENTRO_CUSTO.md](./CENTRO_CUSTO.md) | Sistema de Centro de Custo e integração com OS |
| [BUSINESS_RULES.md](./BUSINESS_RULES.md) | Regras de negócio e cálculos |

---

## 🎯 Visão Geral

O **Módulo Financeiro** do MinervaV2 integra:

- **Ordens de Serviço (OS)** → Centro de Custo → Lucratividade
- **Contratos** → Parcelas → Receitas (contas_receber)
- **Presença de Colaboradores** → Alocação de Horas → Custo de MO
- **Despesas** → Centro de Custo → DRE

### Componentes Principais

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MÓDULO FINANCEIRO                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐               │
│  │  Dashboard  │   │  Dashboard  │   │  Receitas   │               │
│  │  Financeiro │   │  Analítico  │   │ Recorrentes │               │
│  └─────────────┘   └─────────────┘   └─────────────┘               │
│                                                                     │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐               │
│  │  Despesas   │   │ Fluxo Caixa │   │  Custo MO   │               │
│  │ Recorrentes │   └─────────────┘   └─────────────┘               │
│  └─────────────┘                                                    │
│                                                                     │
│  ┌─────────────┐   ✅ Conciliação Bancária (Cora Sync Ativo)       │
│  │ CC Detalhes │                                                    │
│  └─────────────┘                                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Status de Implementação

### ✅ Implementado e Integrado

| Funcionalidade | Frontend | Backend | Observações |
|----------------|----------|---------|-------------|
| Dashboard Financeiro | ✅ | ✅ | KPIs e gráficos comparativos |
| **Dashboard Analítico** | ✅ | ✅ | **NOVO** - KPIs por setor ASS/OBRAS |
| Receitas Recorrentes | ✅ | ✅ | Contratos → Parcelas |
| Faturas Recorrentes | ✅ | ✅ | Despesas + Folha de Pagamento |
| Fluxo de Caixa | ✅ | ✅ | Projeção 30 dias + Calendário |
| Custo de Mão de Obra | ✅ | ✅ | View agregada por CC/Colaborador |
| Centro de Custo Detalhes | ✅ | ✅ | Visão 360° do CC |
| Geração Automática de CC | ✅ | ✅ | Trigger ao criar OS |
| Validação de Fechamento CC | ✅ | ✅ | RPC `validar_fechamento_centro_custo` |
| **Conciliação Bancária** | ✅ | ✅ | Sync via Cora API → `lancamentos_bancarios` |

### ⏸️ Adiado

| Funcionalidade | Motivo |
|----------------|--------|
| Importação OFX | Não necessário (Cora API) |
| DRE Completo | Aguardando plano de contas completo |

### 📋 Backlog

- [ ] Empty states para quando não houver dados
- [ ] Trigger automático de parcelas ao criar contrato
- [ ] Componente `<CategoriaFinanceiraSelect />`
- [ ] Dashboard de lucratividade por cliente
- [ ] Modal Nova Receita

---

## 🗂️ Schema das Tabelas Financeiras

> ⚠️ **IMPORTANTE**: As tabelas `contas_pagar` e `lancamentos_bancarios` têm schemas diferentes!

### `contas_pagar` - Contas a Pagar

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `descricao` | text | Descrição da despesa |
| `valor` | numeric | Valor total |
| `vencimento` | date | Data de vencimento |
| `status` | text | pendente, pago, atrasado, parcial |
| `categoria_id` | uuid | FK → categorias_financeiras |
| `cc_id` | uuid | FK → centros_custo |
| `favorecido_fornecedor` | text | Nome do fornecedor |
| `favorecido_colaborador_id` | uuid | FK → colaboradores |

> ⚠️ **NÃO TEM**: `setor_id` - use apenas em `lancamentos_bancarios`

### `lancamentos_bancarios` - Extrato Bancário (Cora Sync)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `data` | date | Data da transação |
| `descricao` | text | Descrição da transação |
| `entrada` | numeric | Valor de crédito |
| `saida` | numeric | Valor de débito |
| `saldo_apos` | numeric | Saldo após transação (Cora Sync) |
| `status` | text | pendente, conciliado, ignorado |
| `metodo_transacao` | text | PIX, BOLETO, TRANSFER |
| `contraparte_nome` | text | Nome do pagador/recebedor |
| `contraparte_documento` | text | CPF/CNPJ |
| `cora_entry_id` | text | ID original no Cora |
| `categoria_id` | uuid | FK → categorias_financeiras |
| `setor_id` | uuid | FK → setores |
| `cc_id` | uuid | FK → centros_custo |
| `classificado_por_id` | uuid | FK → colaboradores |
| `classificado_em` | timestamp | Data/hora da classificação |
| `conta_pagar_id` | uuid | FK → contas_pagar (vínculo) |
| `conta_receber_id` | uuid | FK → contas_receber (vínculo) |
| `nota_fiscal_url` | text | URL da NF (Upload) |
| `comprovante_url` | text | URL do Comprovante (Upload) |

> ℹ️ **Conciliação**: Quando um lançamento é classificado, usar `classificado_em` e `classificado_por_id` (não existe `conciliado_em`)



## 🔑 Quick Start

### Importar Hooks

```typescript
// Dashboard Financeiro
import { useFinanceiroDashboard, useReceitasComparacao, useDespesasComparacao } from '@/lib/hooks/use-financeiro-dashboard';

// Dashboard Analítico (NOVO)
import { 
  useDashboardAnaliticoKPIs, 
  useEvolucaoMensal, 
  useCustosPorCategoria,
  useAnaliseCentroCusto,
  useTotaisConsolidados,
  getPeriodoPreset,
  type PeriodoFiltro,
  type SetorFiltro,
} from '@/lib/hooks/use-dashboard-analitico';

// Receitas
import { useReceitasRecorrentes, useParcelasPendentes, useReceitasKPIs, useMarcarRecebido } from '@/lib/hooks/use-receitas-recorrentes';

// Despesas
import { useFaturasRecorrentes, useSalariosPrevistos, useFaturasKPIs, useMarcarPago, useCreateDespesa } from '@/lib/hooks/use-faturas-recorrentes';

// Fluxo de Caixa
import { useFluxoCaixa, useFluxoCaixaKPIs, useCalendarioFinanceiro, useDetalhesDia } from '@/lib/hooks/use-fluxo-caixa';

// Custo MO
import { useCustoMODetalhado, useCustoMOPorCC, useCustoMOPorColaborador, useCustoMOKPIs } from '@/lib/hooks/use-custo-mo';

// Centro de Custo
import { useCentroCusto } from '@/lib/hooks/use-centro-custo';
```

### Criar Centro de Custo

```typescript
const { createCentroCustoWithId } = useCentroCusto();

// Criar CC com mesmo ID da OS (padrão)
const cc = await createCentroCustoWithId(
  osId,       // ID a usar para o CC (mesmo da OS)
  tipoOsId,   // ID do tipo de OS (ex: OS-13)
  clienteId,
  'Descrição da obra'
);
// Resultado: { id: "uuid-da-os", nome: "CC13001-SOLAR_I" }
```

---

## 📞 Suporte

Para dúvidas sobre o módulo financeiro, consulte:

1. Este diretório `/docs/finance/`
2. Código fonte em `src/components/financeiro/`
3. Hooks em `src/lib/hooks/use-*.ts`
4. Tipos em `src/lib/types.ts`
