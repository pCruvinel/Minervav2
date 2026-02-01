# 📄 Páginas e Rotas - Módulo Financeiro

> **Última Atualização:** 2026-01-26

---

## 📁 Estrutura de Rotas

```
src/routes/_auth/financeiro/
├── index.tsx              → Dashboard principal
├── dashboard-analitico.tsx → Dashboard Analítico (NOVO)
├── receitas-recorrentes.tsx
├── faturas-recorrentes.tsx
├── fluxo-caixa.tsx
├── custo-mao-de-obra.tsx
├── requisicoes.tsx
├── compras.tsx
├── centro-custo/
│   └── $ccId.tsx          → Detalhes do CC
└── conciliacao.tsx        ⏸️ Adiado
```

---

## 🎯 Dashboard Financeiro

**Rota:** `/financeiro`  
**Componente:** `FinanceiroDashboardPage`  
**Arquivo:** `src/components/financeiro/financeiro-dashboard-page.tsx`

### Funcionalidades

- **KPIs principais:** Receita prevista/realizada, despesas, lucro, margem
- **Gráfico de barras:** Receitas previsto vs realizado (últimos 6 meses)
- **Gráfico de barras:** Despesas previsto vs realizado (últimos 6 meses)
- **Filtro de período:** Este mês, mês anterior, trimestre, ano
- **Cards de navegação:** Acesso rápido aos módulos (incluindo Dashboard Analítico)

### Hooks Utilizados

```typescript
useFinanceiroDashboard()
useReceitasComparacao()
useDespesasComparacao()
```

---

## 📊 Dashboard Analítico (NOVO)

**Rota:** `/financeiro/dashboard-analitico`  
**Componente:** `DashboardAnaliticoPage`  
**Arquivo:** `src/components/financeiro/dashboard-analitico-page.tsx`

### Funcionalidades

- **Filtros avançados:** Período (presets e customizado) + Setor (Todos/ASS/OBRAS/ADM)
- **KPIs comparativos:** Lucro, Receita, Custo Total (com breakdown por setor)
- **Gráfico de evolução:** Receita + Lucro (últimos 12 meses)
- **Tabela de custos:** Custos agrupados por categoria financeira
- **Tabela de análise:** Lucratividade por Centro de Custo

### Hooks Utilizados

```typescript
useDashboardAnaliticoKPIs({ periodo })
useTotaisConsolidados({ periodo })
useEvolucaoMensal(12)
useCustosPorCategoria({ periodo, setor })
useAnaliseCentroCusto({ setor })
```

### Componentes

- `PeriodoSelector` - Seletor de período com presets
- `KPICardComparativo` - Card de KPI com breakdown por setor
- `KPIGrid` - Grid responsivo para KPIs

---

## 💵 Receitas Recorrentes

**Rota:** `/financeiro/receitas-recorrentes`  
**Componente:** `ReceitasRecorrentesPage`  
**Arquivo:** `src/components/financeiro/receitas-recorrentes-page.tsx`

### Funcionalidades

- **KPIs:** Total do mês, recebido, pendente, atrasado, contratos ativos
- **Tabela de contratos:** Lista de contratos ativos com status de pagamento
- **Tabela de parcelas:** Parcelas pendentes com dias de atraso
- **Ação:** Marcar parcela como recebida

### Hooks Utilizados

```typescript
useReceitasRecorrentes()
useParcelasPendentes()
useReceitasKPIs()
useMarcarRecebido()
```

### Componentes

- `CompactTableWrapper` para tabelas
- `KPICardFinanceiro` para indicadores

---

## 📋 Faturas Recorrentes

**Rota:** `/financeiro/faturas-recorrentes`  
**Componente:** `FaturasRecorrentesPage`  
**Arquivo:** `src/components/financeiro/faturas-recorrentes-page.tsx`

### Funcionalidades

- **KPIs:** Total do mês, pago, pendente, atrasado, folha de pagamento
- **Tabela de despesas:** Lista de contas a pagar com status
- **Tabela de salários:** Colaboradores com custo total (salário + encargos)
- **Modal Nova Despesa:** Criar despesa recorrente ou parcelada
- **Ação:** Marcar despesa como paga

### Hooks Utilizados

```typescript
useFaturasRecorrentes(referenceDate)
useSalariosPrevistos()
useFaturasKPIs(referenceDate)
useMarcarPago()
useCreateDespesa()
```

### Navegação por Mês

O componente aceita navegação temporal (mês anterior/próximo).

---

## 📈 Fluxo de Caixa

**Rota:** `/financeiro/fluxo-caixa`  
**Componente:** `FluxoCaixaPage`  
**Arquivo:** `src/components/financeiro/fluxo-caixa-page.tsx`

### Funcionalidades

- **KPIs:** Saldo atual, projeção 30 dias, entradas/saídas previstas, dias críticos
- **Gráfico de área:** Projeção diária de fluxo com saldo acumulado
- **Calendário financeiro:** Eventos dos próximos 7 dias
- **Modal de detalhes:** Transações de um dia específico

### Hooks Utilizados

```typescript
useFluxoCaixa(diasProjecao)
useFluxoCaixaKPIs()
useCalendarioFinanceiro(dias)
useDetalhesDia(data)
```

---

## 👷 Custo de Mão de Obra

**Rota:** `/financeiro/custo-mao-de-obra`  
**Componente:** `CustoMaoDeObraPage`  
**Arquivo:** `src/components/financeiro/custo-mao-de-obra-page.tsx`

### Funcionalidades

- **KPIs:** Custo total, custo dia médio, CCs ativos, colaboradores
- **Gráfico de pizza:** Distribuição por Centro de Custo
- **Tabela por CC:** Custo agrupado por Centro de Custo
- **Tabela por colaborador:** Custo agrupado por colaborador
- **Filtro de período:** DateRangePicker para filtrar período

### Hooks Utilizados

```typescript
useCustoMODetalhado(options)
useCustoMOPorCC(options)
useCustoMOPorColaborador(options)
useCustoMOKPIs(options)
```

---

## 🏷️ Centro de Custo - Detalhes

**Rota:** `/financeiro/centro-custo/$ccId`  
**Componente:** `CentroCustoDetalhesPage`  
**Arquivo:** `src/components/financeiro/centro-custo-detalhes-page.tsx`

### Funcionalidades

- **Header:** Nome do CC, cliente, status, período
- **KPIs:** Receita total, despesa total, custo MO, lucro, margem
- **Tabs:**
  - **Resumo:** Visão geral com gráficos
  - **Receitas:** Lista de contas a receber vinculadas
  - **Despesas:** Lista de contas a pagar vinculadas
  - **Mão de Obra:** Alocações de colaboradores
  - **Documentos:** Anexos (ART, contrato, NFs)
- **Gráficos:** Evolução mensal, distribuição de custos
- **Ação de fechamento:** Validar pendências e inativar

### Hooks Utilizados

```typescript
useCustoMODetalhado({ ccId })
```

### Parâmetros de Rota

```typescript
const { ccId } = useParams({ from: '/_auth/financeiro/centro-custo/$ccId' });
```

---

## 🏦 Conciliação Bancária
 
**Rota:** `/financeiro/conciliacao`  
**Componente:** `ConciliacaoBancariaPage`  
**Arquivo:** `src/components/financeiro/conciliacao-bancaria-page.tsx`
 
### Status: ✅ Ativo
 
Esta página realiza a gestão do extrato bancário sincronizado via API Cora.
 
### Funcionalidades
 
- **Sincronização:** Importação automática via API Cora (mTLS)
- **Extrato:** Visualização de lançamentos com data/hora, valor e status
- **Classificação:** Modal para vincular a contas a pagar/receber ou CC
- **Rateio:** Divisão de um lançamento entre múltiplos Centros de Custo
- **Uploads:** Anexo de Nota Fiscal e Comprovante
- **Read-Only:** Visualização detalhada de lançamentos conciliados
- **Saldo:** Feedback visual de entradas/saídas e saldo pós-transação

---

## 🛒 Compras e Requisições

**Rota:** `/financeiro/compras`  
**Componente:** `GestaoComprasPage`  
**Arquivo:** `src/components/financeiro/gestao-compras-page.tsx`

**Rota:** `/financeiro/requisicoes`  
**Arquivo:** `src/routes/_auth/financeiro/requisicoes.tsx`

### Funcionalidades

- Lista de requisições de compra (OS-09)
- Board de aprovação (Kanban style)
- Integração com workflow de OS

---

## 🧩 Componentes Compartilhados

### `KPICardFinanceiro`

Card reutilizável para exibição de KPIs financeiros.

```typescript
import { KPICardFinanceiro, KPIFinanceiroGrid } from '@/components/financeiro/kpi-card-financeiro';

<KPIFinanceiroGrid columns={4}>
  <KPICardFinanceiro
    title="Receita Total"
    value={248000}
    variant="primary"
    loading={isLoading}
  />
</KPIFinanceiroGrid>
```

**Variants:** `primary`, `success`, `warning`, `danger`, `muted`

### `NovaDespesaModal`

Modal para criação de novas despesas.

```typescript
import { NovaDespesaModal } from '@/components/financeiro/modals/nova-despesa-modal';

<NovaDespesaModal
  open={modalOpen}
  onOpenChange={setModalOpen}
  onSuccess={() => refetch()}
/>
```

---

## 🎨 Padrão Visual

Todas as páginas seguem o **Gold Standard** de layout:

```typescript
<div className="container mx-auto p-6 space-y-6">
  <PageHeader
    title="Título da Página"
    description="Descrição opcional"
    showBackButton
  />
  
  <KPIFinanceiroGrid columns={4}>
    {/* KPI Cards */}
  </KPIFinanceiroGrid>
  
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Gráficos */}
  </div>
  
  <Card>
    <CardHeader>
      <CardTitle>Tabela de Dados</CardTitle>
    </CardHeader>
    <CardContent>
      <CompactTableWrapper>
        {/* Tabela */}
      </CompactTableWrapper>
    </CardContent>
  </Card>
</div>
```
