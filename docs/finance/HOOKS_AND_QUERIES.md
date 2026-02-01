# 🪝 Hooks e Queries - Módulo Financeiro

> **Última Atualização:** 2026-01-26

---

## 📋 Resumo de Hooks

| Hook | Arquivo | Propósito |
|------|---------|-----------|
| `useFinanceiroDashboard` | `use-financeiro-dashboard.ts` | KPIs agregados do dashboard |
| `useReceitasComparacao` | `use-financeiro-dashboard.ts` | Gráfico receitas previsto vs realizado |
| `useDespesasComparacao` | `use-financeiro-dashboard.ts` | Gráfico despesas previsto vs realizado |
| **`useAnaliseVariacao`** | `use-financeiro-dashboard.ts` | **NOVO** - Análise previsto vs realizado mensal |
| **`usePrestacaoContas`** | `use-financeiro-dashboard.ts` | **NOVO** - Lucratividade por tipo de projeto |
| **`useDashboardAnaliticoKPIs`** | `use-dashboard-analitico.ts` | KPIs por setor (ASS/OBRAS) |
| **`useEvolucaoMensal`** | `use-dashboard-analitico.ts` | Evolução 12 meses |
| **`useCustosPorCategoria`** | `use-dashboard-analitico.ts` | Custos agrupados |
| **`useAnaliseCentroCusto`** | `use-dashboard-analitico.ts` | Lucratividade por CC |
| **`useTotaisConsolidados`** | `use-dashboard-analitico.ts` | Totais gerais |
| `useReceitasRecorrentes` | `use-receitas-recorrentes.ts` | Contratos com receitas programadas |
| `useParcelasPendentes` | `use-receitas-recorrentes.ts` | Parcelas em aberto/atrasadas |
| `useReceitasKPIs` | `use-receitas-recorrentes.ts` | KPIs de receitas do mês |
| `useMarcarRecebido` | `use-receitas-recorrentes.ts` | Mutation para baixar parcela |
| `useFaturasRecorrentes` | `use-faturas-recorrentes.ts` | Contas fixas recorrentes |
| `useSalariosPrevistos` | `use-faturas-recorrentes.ts` | Folha de pagamento |
| `useFaturasKPIs` | `use-faturas-recorrentes.ts` | KPIs de despesas do mês |
| `useMarcarPago` | `use-faturas-recorrentes.ts` | Mutation para baixar conta |
| `useCreateDespesa` | `use-faturas-recorrentes.ts` | Mutation para criar despesa |
| `useFluxoCaixa` | `use-fluxo-caixa.ts` | Projeção diária de fluxo |
| `useFluxoCaixaKPIs` | `use-fluxo-caixa.ts` | KPIs de saldo e projeção |
| **`useFluxoMensal`** | `use-fluxo-caixa.ts` | **NOVO** - Evolução mensal (gráfico 12 meses) |
| `useCalendarioFinanceiro` | `use-fluxo-caixa.ts` | Eventos financeiros 7 dias |
| `useDetalhesDia` | `use-fluxo-caixa.ts` | Transações de um dia específico |
| `useCustoMODetalhado` | `use-custo-mo.ts` | Custo MO detalhado por OS |
| `useCustoMOPorCC` | `use-custo-mo.ts` | Custo MO agrupado por CC |
| `useCustoMOPorColaborador` | `use-custo-mo.ts` | Custo MO por colaborador |
| `useCustoMOKPIs` | `use-custo-mo.ts` | KPIs de custo de MO |
| `useCentroCusto` | `use-centro-custo.ts` | CRUD de Centro de Custo |


---

## 📊 Dashboard (`use-financeiro-dashboard.ts`)

### `useFinanceiroDashboard()`

Retorna KPIs agregados do mês atual.

```typescript
interface DashboardKPIs {
  previsaoReceitaMes: number;
  receitaRealizadaMes: number;
  previsaoFaturasMes: number;
  faturasPagasMes: number;
  aReceberHoje: number;
  aPagarHoje: number;
  lucroMes: number;
  margemMes: number;
  totalClientesAtivos: number;
  totalOSAtivas: number;
}
```

**Queries Supabase:**
1. `contas_receber` → vencimento no mês → receitas previstas/realizadas
2. `contas_pagar` → vencimento no mês → despesas previstas/pagas
3. `contas_receber` → vencimento = hoje, status pendente → a receber hoje
4. `contas_pagar` → vencimento = hoje, status pendente → a pagar hoje
5. `clientes` → count onde `cliente_ativo = true`
6. `ordens_servico` → count onde status em `['em_andamento', 'pausada']`

### `useReceitasComparacao()`

Retorna comparação mensal de receitas (últimos 6 meses).

```typescript
interface ComparacaoMensal {
  mes: string;       // "Jan", "Fev", etc.
  previsto: number;
  realizado: number;
}
```

### `useDespesasComparacao()`

Mesma estrutura, para despesas.

### `useAnaliseVariacao()`

> **NOVO** - Adicionado em 2026-01-28

Retorna análise de variação mensal (previsto vs realizado).

```typescript
interface AnaliseVariacao {
  receitas: {
    previsto: number;
    realizado: number;
    variacao: number;
    percentual: number;
  };
  despesas: {
    previsto: number;
    realizado: number;
    variacao: number;
    percentual: number;
  };
  periodo: string;  // "jan./2026"
}
```

**Queries Supabase:**
1. `contas_receber` → vencimento no mês → soma `valor_previsto` e `valor_recebido`
2. `contas_pagar` → vencimento no mês → soma `valor` (previsto) e `valor` onde `status = 'pago'` (realizado)

**Uso no componente:**
```tsx
const { data: analiseVariacao, isLoading } = useAnaliseVariacao();

// Exibe no card "Análise de Variação"
<span>{analiseVariacao?.receitas.percentual}%</span>
```

### `usePrestacaoContas()`

> **NOVO** - Adicionado em 2026-01-28

Retorna lucratividade por tipo de projeto.

```typescript
interface PrestacaoContasTipo {
  tipo: string;               // "Obra", "Assessoria Anual", "Laudo Pontual"
  lucroTotal: number;          // receitas - despesas
  projetosCount: number;       // total de contratos
  projetosEmAndamento: number; // contratos com status 'ativo'
}
```

**Queries Supabase:**
1. `contratos` → status em `['ativo', 'concluido']` → agrupar por `tipo`
2. `contas_receber` → status em `['pago', 'recebido', 'conciliado']` → soma por `contrato_id`
3. `contas_pagar` → status = 'pago' → soma por `contrato_id`

**Lógica:**
1. Mapear receitas e despesas por contrato
2. Calcular lucro = receitas - despesas
3. Normalizar tipo para categorias padrão (Obra, Assessoria Anual, Laudo Pontual)

**Uso no componente:**
```tsx
const { data: prestacaoContas, isLoading } = usePrestacaoContas();

// Renderiza cards dinamicamente
{prestacaoContas?.map(item => (
  <Card key={item.tipo}>
    <h4>{item.tipo}</h4>
    <span>{formatCurrency(item.lucroTotal)}</span>
    <span>({item.projetosCount} projetos)</span>
  </Card>
))}
```

---

## 📊 Dashboard Analítico (`use-dashboard-analitico.ts`)

> **NOVO** - Adicionado em 2026-01-26

### Types Exportados

```typescript
interface PeriodoFiltro {
  inicio: string; // YYYY-MM-DD
  fim: string;    // YYYY-MM-DD
}

type SetorFiltro = 'TODOS' | 'ASS' | 'OBRAS' | 'ADM';

interface DashboardAnaliticoFilters {
  periodo?: PeriodoFiltro;
  setor?: SetorFiltro;
}
```

### `useDashboardAnaliticoKPIs(filters?)`

KPIs consolidados por setor.

```typescript
interface KPIsPorSetor {
  setor: string;
  receita_prevista: number;
  receita_realizada: number;
  custo_operacional: number;
  custo_operacional_pago: number;
  custo_mo: number;
  custo_total: number;
  lucro_realizado: number;
  margem_pct: number;
}
```

**Views Supabase:** `vw_receitas_por_setor`, `vw_despesas_por_setor`

### `useEvolucaoMensal(meses?)`

Evolução mensal (últimos N meses).

```typescript
interface EvolucoMensal {
  mes: string;
  mes_label: string;  // "Jan/26"
  receita_ass: number;
  receita_obras: number;
  receita_total: number;
  custo_ass: number;
  custo_obras: number;
  custo_total: number;
  lucro_ass: number;
  lucro_obras: number;
  lucro_total: number;
}
```

### `useCustosPorCategoria(filters?)`

Custos agrupados por categoria financeira.

```typescript
interface CustoPorCategoria {
  categoria_id: string;
  categoria_nome: string;
  codigo_plano: string;
  nome_plano: string;
  setor: string;
  valor_total: number;
  valor_pago: number;
  total_lancamentos: number;
}
```

**View Supabase:** `vw_custos_por_categoria`

### `useAnaliseCentroCusto(filters?)`

Análise de lucratividade por Centro de Custo.

```typescript
interface AnaliseCentroCusto {
  cc_id: string;
  cc_nome: string;
  setor: string;
  cliente_nome: string | null;
  receita: number;
  custo: number;
  lucro: number;
  margem_pct: number;
  status_os: string | null;
  cc_ativo: boolean;
}
```

**View Supabase:** `vw_analise_centro_custo`

### `useTotaisConsolidados(filters?)`

Totais gerais (soma de todos os setores).

```typescript
{
  receita_prevista: number;
  receita_realizada: number;
  custo_total: number;
  custo_pago: number;
  lucro_realizado: number;
  margem_pct: number;
}
```

### `getPeriodoPreset(preset)`

Função helper para gerar períodos padronizados.

```typescript
getPeriodoPreset('thisMonth')    // Mês atual
getPeriodoPreset('lastMonth')    // Mês anterior
getPeriodoPreset('lastQuarter')  // Último trimestre
getPeriodoPreset('thisYear')     // Ano atual
getPeriodoPreset('last6Months')  // Últimos 6 meses
```

---

## 💰 Receitas (`use-receitas-recorrentes.ts`)

### `useReceitasRecorrentes()`

Lista contratos ativos com status de pagamento.

```typescript
interface ReceitaRecorrente {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  contrato_id: string;
  contrato_numero: string;
  valor_mensal: number;
  dia_vencimento: number;
  parcelas_pagas: number;
  parcelas_total: number;
  status: 'em_dia' | 'atrasado' | 'parcial';
  proxima_cobranca: string;
}
```

**Lógica:**
1. Query `contratos` com status `ativo` ou `em_andamento`
2. Para cada contrato, contar parcelas pagas em `contas_receber`
3. Verificar parcelas atrasadas para determinar status

### `useParcelasPendentes()`

Lista parcelas pendentes de recebimento.

```typescript
interface ParcelaPendente {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  contrato_id: string;
  os_id: string | null;
  cc_id: string | null;
  descricao: string;
  valor_previsto: number;
  valor_recebido: number;
  vencimento: string;
  status: string;
  dias_atraso: number;
  parcela_num: number;
  total_parcelas: number;
}
```

**Query:** `contas_receber` com status em `['em_aberto', 'pendente', 'parcial']`

### `useReceitasKPIs()`

```typescript
interface ReceitasKPIs {
  totalReceitasMes: number;
  recebidoMes: number;
  pendenteMes: number;
  atrasadoMes: number;
  contratosAtivos: number;
  ticketMedio: number;
}
```

### `useMarcarRecebido()`

Mutation para marcar parcela como recebida.

```typescript
const { mutate } = useMarcarRecebido();

mutate({ 
  parcelaId: 'uuid', 
  valorRecebido: 1500.00 
});
```

**Ação:** Update `contas_receber` com `status = 'pago'` e `data_recebimento = now()`

---

## 📋 Despesas (`use-faturas-recorrentes.ts`)

### `useFaturasRecorrentes(referenceDate?: Date)`

Lista faturas a pagar do mês (+ atrasadas).

```typescript
interface FaturaRecorrente {
  id: string;
  descricao: string;
  fornecedor: string;
  categoria: string;
  valor: number;
  dia_vencimento: number;
  cc_id: string | null;
  cc_nome: string | null;
  status: 'pendente' | 'pago' | 'atrasado';
  vencimento: string;
  frequencia: 'mensal' | 'trimestral' | 'anual' | 'unica';
  tipo: 'fixa' | 'variavel';
}
```

**Query OR complexa:**
```sql
(vencimento >= primeiro_dia_mes AND vencimento <= ultimo_dia_mes)
OR
(vencimento < primeiro_dia_mes AND status != 'pago')
```

### `useSalariosPrevistos()`

Lista colaboradores ativos para cálculo de folha.

```typescript
interface SalarioPrevisto {
  colaborador_id: string;
  colaborador_nome: string;
  cargo: string;
  setor: string;
  salario_base: number;
  encargos_estimados: number;  // 46% do salário
  beneficios: number;          // R$ 450 fixo
  custo_total: number;
  data_pagamento: string;
  status: 'pendente' | 'pago';
}
```

### `useFaturasKPIs(referenceDate?: Date)`

```typescript
interface FaturasKPIs {
  totalFaturasMes: number;
  pagoMes: number;
  pendenteMes: number;
  atrasadoMes: number;
  folhaPagamento: number;
  contasFixas: number;
}
```

### `useMarcarPago()`

Mutation para marcar despesa como paga.

```typescript
mutate({
  faturaId: 'uuid',
  valorPago: 1200.00,
  dataPagamento: new Date(),
  comprovanteUrl?: 'https://...',
  observacoes?: 'Pago via PIX'
});
```

### `useCreateDespesa()`

Mutation para criar nova despesa.

```typescript
mutate({
  descricao: 'Aluguel Escritório',
  fornecedor: 'Imobiliária XYZ',
  valor: 5000,
  categoria: 'Aluguel',
  recorrencia: 'MENSAL',         // 'MENSAL' | 'SEMANAL' | 'ANUAL' | 'UNICA'
  diaVencimento?: 10,            // Para recorrentes
  vencimentoData?: new Date(),   // Para únicas
  centroCustoId?: 'uuid',
  parcelar?: true,               // Apenas para UNICA
  numeroParcelas?: 12
});
```

---

## 📈 Fluxo de Caixa (`use-fluxo-caixa.ts`)

### `useFluxoCaixa(diasProjecao = 30)`

Projeção diária de fluxo de caixa.

```typescript
interface FluxoCaixaDia {
  data: string;
  dataFormatada: string;  // "Seg, 25 jan"
  entradas: number;
  saidas: number;
  saldo: number;
  saldoAcumulado: number;
}
```

### `useFluxoCaixaKPIs()`

```typescript
interface FluxoCaixaKPIs {
  saldoAtual: number;
  saldoProjetado30Dias: number;
  entradasProximos30Dias: number;
  saidasProximos30Dias: number;
  diasCriticos: number;  // Dias com saldo negativo projetado
}
```

### `useFluxoMensal(meses = 12)`

> **NOVO** - Adicionado em 2026-01-28

Retorna evolução mensal do fluxo de caixa (últimos N meses).
Usado no gráfico "Evolução do Fluxo de Caixa".

```typescript
interface FluxoMensal {
  mes: string;       // "2026-01"
  mesLabel: string;  // "Jan"
  entradas: number;
  saidas: number;
  saldo: number;
  acumulado: number;
}
```

**Queries Supabase:**
1. `contas_receber` → status em `['pago', 'recebido', 'conciliado']` → agregar por mês
2. `contas_pagar` → status = 'pago' → agregar por mês

**Uso no componente:**
```tsx
const { data: fluxoMensalData, isLoading } = useFluxoMensal(12);

<ComposedChart data={fluxoMensalData || []}>
  <XAxis dataKey="mesLabel" />
  <Bar dataKey="entradas" />
  <Bar dataKey="saidas" />
  <Line dataKey="acumulado" />
</ComposedChart>
```


### `useCalendarioFinanceiro(dias = 7)`

```typescript
interface EventoCalendario {
  id: string;
  data: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  cliente_ou_fornecedor: string;
  status: string;
}
```

### `useDetalhesDia(data: string | null)`

Busca transações de um dia específico (para modal).

```typescript
interface TransacaoDia {
  id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  cliente_ou_fornecedor: string;
  cc_codigo: string | null;
  status: string;
  parcela: string | null;
}
```

---

## 👷 Custo de MO (`use-custo-mo.ts`)

### `useCustoMODetalhado(options?)`

Custo detalhado por registro de presença.

```typescript
useCustoMODetalhado({
  osId?: 'uuid',                    // Filtrar por OS
  ccId?: 'uuid',                    // Filtrar por CC
  periodo?: { inicio: '2026-01-01', fim: '2026-01-31' },
  enabled?: true
});
```

```typescript
interface CustoMODetalhado {
  os_id: string;
  cc_id: string;
  cc_nome: string;
  colaborador_id: string;
  colaborador_nome: string;
  salario_base: number;
  data_trabalho: string;
  status_presenca: string;
  percentual_alocado: number;
  custo_alocado: number;
}
```

### `useCustoMOPorCC(options?)`

Custo agrupado por Centro de Custo.

```typescript
interface CustoMOPorCC {
  cc_id: string;
  cc_nome: string;
  custo_total: number;
  alocacoes: number;               // Quantidade de registros
  colaboradores_distintos: number;
  percentual: number;              // % do total geral
}
```

### `useCustoMOPorColaborador(options?)`

```typescript
interface CustoMOPorColaborador {
  colaborador_id: string;
  colaborador_nome: string;
  salario_base: number;
  custo_total: number;
  dias_trabalhados: number;
  ccs_distintos: number;
  ccs: string[];  // Lista de CCs onde trabalhou
}
```

### `useCustoMOKPIs(options?)`

Retorna objeto com KPIs derivados:

```typescript
{
  custoTotal: number,
  custoDiaMedio: number,
  totalAlocacoes: number,
  ccsAtivos: number,
  colaboradoresAtivos: number,
  custosPorCC: CustoMOPorCC[],
  custosPorColaborador: CustoMOPorColaborador[]
}
```

---

## 🏷️ Centro de Custo (`use-centro-custo.ts`)

### `useCentroCusto()`

Hook para gerenciamento de Centros de Custo.

```typescript
const {
  createCentroCustoWithId,  // Criar CC com ID específico (mesmo da OS)
  generateCentroCusto,      // @deprecated - Criar CC com ID gerado pelo banco
  listCentrosCusto,         // Listar todos CCs ativos
  loading,
  error
} = useCentroCusto();
```

### `createCentroCustoWithId(ccId, tipoOsId, clienteId, descricao?)`

```typescript
const cc = await createCentroCustoWithId(
  osId,       // ID a usar para o CC (mesmo da OS)
  tipoOsId,   // ID do tipo de OS
  clienteId,
  'Descrição da obra'
);
// Retorno: { id: "uuid", nome: "CC13001-SOLAR_I", tipo: "variavel" }
```

**Fluxo interno:**
1. Buscar código do tipo de OS (ex: "OS-13")
2. Buscar apelido ou primeiro nome do cliente
3. Incrementar sequência via RPC `incrementar_sequencia_cc`
4. Formatar nome: `CC{TIPO}{SEQ:3}-{TEXTO}`
5. Inserir com ID específico

### `listCentrosCusto()`

```typescript
const ccs = await listCentrosCusto();
// Retorno ordenado: fixos primeiro, depois variáveis por nome
```

---

## 🔄 Padrão de Uso

```typescript
import { useReceitasRecorrentes, useReceitasKPIs } from '@/lib/hooks/use-receitas-recorrentes';

export function MinhaPage() {
  const { data: receitas, isLoading: receitasLoading } = useReceitasRecorrentes();
  const { data: kpis, isLoading: kpisLoading } = useReceitasKPIs();
  
  const isLoading = receitasLoading || kpisLoading;
  
  // Mock fallback para desenvolvimento
  const dadosReceitas = receitas && receitas.length > 0 ? receitas : mockReceitas;
  
  if (isLoading) {
    return <Skeleton />;
  }
  
  return (
    <div>
      <KPICards data={kpis} />
      <ReceitasTable data={dadosReceitas} />
    </div>
  );
}
```

---

## 🏦 Conciliação Bancária (`use-lancamentos-bancarios.ts`)

### `useLancamentosBancarios(filters?)`

Lista lançamentos bancários com paginação e filtros.

```typescript
// Filtros: dataInicio, dataFim, status (pendente/conciliado), busca
const { data, isLoading } = useLancamentosBancarios(filters);
```

### `useSyncExtrato()`

Mutation para disparar sincronização com Cora.

```typescript
const { mutate: sync, isPending } = useSyncExtrato();
// sync() dispara o endpoint /sync da Edge Function
```

### `useUpdateLancamento()`

Mutation para classificar/conciliar um lançamento.

```typescript
mutate({
  id: 'uuid',
  categoria_id: 'uuid',
  cc_id: 'uuid',
  observacoes: 'Texto',
  rateios: [] // Opcional
});
```

### `useCoraIntegration()` (`use-cora-integration.ts`)

Gerenciamento de credenciais e status da integração (mTLS).
