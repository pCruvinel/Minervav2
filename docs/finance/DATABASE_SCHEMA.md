# 🗄️ Schema de Banco de Dados - Módulo Financeiro

> **Última Atualização:** 2026-01-25  
> **Supabase Project ID:** `zxfevlkssljndqqhxkjb`

---

## 📋 Índice

1. [Tabelas Principais](#tabelas-principais)
2. [Views](#views)
3. [Funções RPC](#funções-rpc)
4. [Triggers](#triggers)

---

## Tabelas Principais

### `centros_custo`

Centro de custo para agrupamento de receitas e despesas por OS/Cliente.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | NO | `gen_random_uuid()` | PK |
| `nome` | TEXT | NO | - | Nome formatado (ex: CC13001-SOLAR_I) |
| `tipo` | TEXT | YES | `'variavel'` | `fixo` ou `variavel` |
| `valor_global` | NUMERIC | YES | `0` | Valor total do CC |
| `cliente_id` | UUID | YES | - | FK → clientes |
| `tipo_os_id` | UUID | YES | - | FK → tipos_os |
| `os_id` | UUID | YES | - | FK → ordens_servico |
| `descricao` | TEXT | YES | - | Descrição livre |
| `data_inicio` | DATE | YES | `CURRENT_DATE` | Data de início |
| `data_fim` | DATE | YES | - | Data de encerramento |
| `ativo` | BOOLEAN | YES | `true` | Status ativo/inativo |
| `created_at` | TIMESTAMPTZ | YES | `now()` | Timestamp de criação |
| `updated_at` | TIMESTAMPTZ | YES | `now()` | Timestamp de atualização |

**Nomenclatura:** `CC{NUMERO_TIPO_OS}{SEQUENCIAL:3}-{APELIDO_CLIENTE}`
- Exemplo: `CC13001-SOLAR_I` para OS-13, sequência 001, cliente com apelido "SOLAR I"

---

### `contas_pagar`

Despesas e faturas a pagar.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | NO | `gen_random_uuid()` | PK |
| `descricao` | TEXT | NO | - | Descrição da despesa |
| `valor` | NUMERIC | NO | - | Valor da despesa |
| `vencimento` | DATE | NO | - | Data de vencimento |
| `data_pagamento` | DATE | YES | - | Data efetiva do pagamento |
| `status` | TEXT | NO | `'em_aberto'` | `em_aberto`, `pago`, `pendente` |
| `tipo` | USER-DEFINED | NO | `'variavel'` | `fixa` ou `variavel` |
| `favorecido_colaborador_id` | UUID | YES | - | FK → colaboradores (para salários) |
| `favorecido_fornecedor` | TEXT | YES | - | Nome do fornecedor |
| `cc_id` | UUID | YES | - | FK → centros_custo |
| `origem` | TEXT | NO | `'manual'` | `manual`, `salario_auto`, `os_compra` |
| `rateio` | JSONB | YES | - | Rateio entre múltiplos CCs |
| `recorrente` | BOOLEAN | YES | `false` | Se é despesa recorrente |
| `recorrencia_frequencia` | TEXT | YES | - | `mensal`, `trimestral`, `anual`, `unica` |
| `recorrencia_fim` | DATE | YES | - | Data fim da recorrência |
| `forma_pagamento` | TEXT | YES | - | Forma de pagamento |
| `boleto_id` | UUID | YES | - | FK → boletos (se aplicável) |
| `comprovante_url` | TEXT | YES | - | URL do comprovante anexado |
| `categoria` | TEXT | YES | - | ⚠️ DEPRECATED - usar categoria_id |
| `subcategoria` | TEXT | YES | - | ⚠️ DEPRECATED - usar categoria_id |
| `categoria_id` | UUID | YES | - | FK → categorias_financeiras |
| `observacoes` | TEXT | YES | - | Observações |
| `criado_por_id` | UUID | YES | - | FK → users (quem criou) |
| `dia_vencimento` | INTEGER | YES | - | Dia de vencimento da recorrência |
| `created_at` | TIMESTAMPTZ | YES | `now()` | Timestamp de criação |
| `updated_at` | TIMESTAMPTZ | YES | `now()` | Timestamp de atualização |

---

### `contas_receber`

Receitas e parcelas a receber (geradas de contratos).

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | NO | `gen_random_uuid()` | PK |
| `cliente_id` | UUID | NO | - | FK → clientes |
| `os_id` | UUID | YES | - | FK → ordens_servico |
| `cc_id` | UUID | YES | - | FK → centros_custo |
| `contrato_id` | UUID | YES | - | FK → contratos |
| `contrato_numero` | TEXT | YES | - | Número do contrato |
| `parcela` | TEXT | NO | - | Descrição da parcela |
| `parcela_num` | INTEGER | NO | - | Número da parcela (1, 2, 3...) |
| `total_parcelas` | INTEGER | NO | - | Total de parcelas do contrato |
| `valor_previsto` | NUMERIC | NO | - | Valor esperado |
| `valor_recebido` | NUMERIC | YES | - | Valor efetivamente recebido |
| `vencimento` | DATE | NO | - | Data de vencimento |
| `data_recebimento` | DATE | YES | - | Data efetiva do recebimento |
| `status` | TEXT | NO | `'em_aberto'` | `em_aberto`, `pago`, `pendente`, `parcial`, `cancelado` |
| `boleto_id` | UUID | YES | - | FK → boletos |
| `forma_pagamento` | TEXT | YES | - | Pix, Boleto, Transferência |
| `observacoes` | TEXT | YES | - | Observações |
| `comprovante_url` | TEXT | YES | - | URL do comprovante |
| `categoria_id` | UUID | YES | - | FK → categorias_financeiras |
| `created_at` | TIMESTAMPTZ | YES | `now()` | Timestamp de criação |
| `updated_at` | TIMESTAMPTZ | YES | `now()` | Timestamp de atualização |

---

### `alocacao_horas_cc`

Rateio de horas de colaboradores por centro de custo (para cálculo de custo de MO).

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | NO | `gen_random_uuid()` | PK |
| `registro_presenca_id` | UUID | NO | - | FK → registros_presenca |
| `cc_id` | UUID | NO | - | FK → centros_custo |
| `percentual` | NUMERIC | NO | - | Percentual alocado (0-100) |
| `valor_calculado` | NUMERIC | YES | - | Custo calculado para este CC |
| `observacao` | TEXT | YES | - | Observações |
| `created_at` | TIMESTAMPTZ | YES | `now()` | Timestamp de criação |

**Fórmula:**
```
valor_calculado = (salario_base_colaborador / dias_uteis_mes) * (percentual / 100)
```

---

### `plano_contas`

Estrutura hierárquica de contas contábeis (DRE - 4 níveis).

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | NO | `gen_random_uuid()` | PK |
| `codigo` | VARCHAR(20) | NO | - | Código hierárquico (ex: "3.1.01.001") |
| `nome` | TEXT | NO | - | Nome da conta |
| `nivel` | INTEGER | - | - | Nível 1-4. CHECK (nivel BETWEEN 1 AND 4) |
| `natureza` | TEXT | - | - | `receita`, `despesa`, `neutro` |
| `pai_id` | UUID | YES | - | FK → plano_contas (auto-referência) |
| `desprezar_lucro` | BOOLEAN | YES | `false` | Não incluir no cálculo de lucro |
| `usar_custo_dia_flutuante` | BOOLEAN | YES | `false` | Usar custo dia variável |
| `soma_apenas_painel_geral` | BOOLEAN | YES | `false` | Só aparece no painel geral |
| `exige_nf` | BOOLEAN | YES | `true` | Exige nota fiscal para verificação |
| `exige_cc` | BOOLEAN | YES | `true` | Exige centro de custo vinculado |

**Estrutura hierárquica:**
```
Nível 1: Grupo (ex: 3 - DESPESAS)
  └── Nível 2: Subgrupo (ex: 3.1 - Custos Operacionais)
        └── Nível 3: Conta (ex: 3.1.01 - Mão de Obra)
              └── Nível 4: Subconta (ex: 3.1.01.001 - Salários)
```

---

### `lancamentos_bancarios`

Transações bancárias importadas via API (Cora) ou OFX, pendentes de conciliação.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | NO | `gen_random_uuid()` | PK |
| `data` | DATE | NO | - | Data da transação |
| `descricao` | TEXT | NO | - | Descrição da transação (do banco) |
| `entrada` | NUMERIC | YES | - | Valor de crédito |
| `saida` | NUMERIC | YES | - | Valor de débito |
| `saldo_apos` | NUMERIC | YES | - | Saldo após transação |
| `banco` | TEXT | YES | - | Nome do banco (ex: "Cora") |
| `conta_bancaria` | TEXT | YES | - | CNPJ/identificador da conta |
| `arquivo_origem` | TEXT | YES | - | Origem: `api-sync`, `ofx-import` |
| `hash_linha` | TEXT | YES | - | Hash único para evitar duplicatas (ex: `cora-{id}`) |
| `status` | TEXT | NO | `'pendente'` | `pendente`, `conciliado`, `ignorado` |
| `tipo_lancamento` | ENUM | YES | - | `CREDIT` ou `DEBIT` |
| `metodo_transacao` | ENUM | YES | - | `PIX`, `BOLETO`, `TRANSFER`, `OTHER` |
| `contraparte_nome` | TEXT | YES | - | Nome da contraparte (pagador/recebedor) |
| `contraparte_documento` | TEXT | YES | - | CPF/CNPJ da contraparte |
| `cora_entry_id` | TEXT | YES | - | ID original do lançamento no Cora |
| `categoria_id` | UUID | YES | - | FK → categorias_financeiras |
| `setor_id` | UUID | YES | - | FK → setores |
| `cc_id` | UUID | YES | - | FK → centros_custo |
| `rateios` | JSONB | YES | - | Rateio entre múltiplos CCs |
| `conta_pagar_id` | UUID | YES | - | FK → contas_pagar (após conciliação) |
| `conta_receber_id` | UUID | YES | - | FK → contas_receber (após conciliação) |
| `comprovante_url` | TEXT | YES | - | URL do comprovante |
| `nota_fiscal_url` | TEXT | YES | - | URL da NF |
| `observacoes` | TEXT | YES | - | Observações (preenchido pelo usuário) |
| `classificado_por_id` | UUID | YES | - | FK → **colaboradores** (quem classificou) |
| `classificado_em` | TIMESTAMPTZ | YES | - | Data/hora da classificação |
| `historico_classificacao` | JSONB | YES | `'[]'` | Histórico de ações de classificação |
| `created_at` | TIMESTAMPTZ | YES | `now()` | Timestamp de criação |
| `updated_at` | TIMESTAMPTZ | YES | `now()` | Timestamp de atualização |

**Fluxo de Conciliação:**
1. Transação importada via `/sync` → `status = 'pendente'`
2. Usuário abre modal "Classificar" → preenche `categoria_id`, `cc_id`, `observacoes`
3. Sistema vincula a `conta_pagar_id` ou `conta_receber_id` → `status = 'conciliado'`
4. `classificado_por_id` registra o colaborador que fez a ação

---

### `categorias_financeiras`

Categorias para classificação de lançamentos (folhas do plano de contas).

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | NO | `gen_random_uuid()` | PK |
| `plano_conta_id` | UUID | NO | - | FK → plano_contas |
| `codigo` | VARCHAR(30) | NO | - | Código único |
| `nome` | TEXT | NO | - | Nome da categoria |
| `descricao` | TEXT | YES | - | Descrição |
| `tipo` | TEXT | NO | - | `pagar`, `receber`, `ambos` |
| `setor_padrao_id` | UUID | YES | - | FK → setores (setor padrão) |
| `ativo` | BOOLEAN | YES | `true` | Status |
| `created_at` | TIMESTAMPTZ | YES | `now()` | Timestamp de criação |
| `updated_at` | TIMESTAMPTZ | YES | `now()` | Timestamp de atualização |

---

## Views

### `view_custo_mo_detalhado_os`

Custo de mão de obra detalhado por OS/CC/Colaborador.

```sql
SELECT 
    cc.os_id,
    cc.id AS cc_id,
    cc.nome AS cc_nome,
    rp.colaborador_id,
    col.nome_completo AS colaborador_nome,
    col.salario_base,
    rp.data AS data_trabalho,
    rp.status AS status_presenca,
    ahc.percentual AS percentual_alocado,
    ahc.valor_calculado AS custo_alocado
FROM alocacao_horas_cc ahc
JOIN registros_presenca rp ON rp.id = ahc.registro_presenca_id
JOIN centros_custo cc ON cc.id = ahc.cc_id
JOIN colaboradores col ON col.id = rp.colaborador_id
WHERE cc.os_id IS NOT NULL;
```

### `view_financeiro_os_resumo`

Resumo financeiro consolidado por OS.

| Coluna | Descrição |
|--------|-----------|
| `os_id` | ID da Ordem de Serviço |
| `receita_prevista` | Soma de valor_previsto das parcelas |
| `receita_realizada` | Soma de valor_recebido das parcelas |
| `despesa_operacional_total` | Soma de despesas vinculadas ao CC |
| `despesa_operacional_paga` | Soma de despesas pagas |
| `custo_mo_total` | Custo de MO alocado ao CC |
| `colaboradores_alocados` | Quantidade de colaboradores distintos |
| `lucro_bruto_previsto` | Receita prevista - Custos |
| `lucro_bruto_realizado` | Receita realizada - Custos pagos |
| `margem_prevista_pct` | Margem prevista em % |
| `margem_realizada_pct` | Margem realizada em % |

### `view_financeiro_cliente_resumo`

Resumo financeiro agregado por cliente.

### `vw_lucratividade_cc`

Lucratividade por Centro de Custo com breakdown de custos.

### `view_conciliacao_pendente`

Transações bancárias pendentes de conciliação com sugestões automáticas de match.

| Coluna | Descrição |
|--------|-----------|
| `id` | ID do lançamento bancário |
| `data` | Data da transação |
| `descricao` | Descrição do banco |
| `entrada` | Valor de crédito |
| `saida` | Valor de débito |
| `contraparte_nome` | Nome do pagador/recebedor |
| `contraparte_documento` | CPF/CNPJ da contraparte |
| `metodo_transacao` | PIX, BOLETO, TRANSFER, OTHER |
| `status` | Sempre `'pendente'` nesta view |
| `sugestoes_despesa` | JSON array de `contas_pagar` com valor similar |
| `sugestoes_receita` | JSON array de `contas_receber` com valor similar |

**Uso:** Esta view alimenta a tela de Conciliação Bancária, sugerindo automaticamente despesas/receitas que podem ser vinculadas a cada transação.

---

## Funções RPC

### `gerar_centro_custo(p_tipo_os_id UUID, p_cliente_id UUID, p_descricao TEXT)`

Gera um novo Centro de Custo com nome padronizado.

**Retorno:** `TABLE(cc_id UUID, cc_nome TEXT)`

### `validar_fechamento_centro_custo(p_cc_id UUID)`

Valida se um CC pode ser fechado/inativado.

**Retorno:**
```typescript
{
  pode_fechar: boolean,
  pendencias_count: number,
  pendencias: [
    {
      id: string,
      tipo: 'conta_pagar' | 'conta_receber',
      descricao: string,
      valor: number,
      problema: 'Não conciliado' | 'NF não anexada' | 'Não recebido'
    }
  ]
}
```

**Regras de validação:**
1. Todas `contas_pagar` devem estar com status = 'pago'
2. Se `exige_nf = true` na categoria, deve ter `comprovante_url` preenchido
3. Todas `contas_receber` devem estar com status = 'recebido' ou 'cancelado'

### `incrementar_sequencia_cc(p_tipo_os_id UUID)`

Incrementa e retorna o próximo número sequencial para Centro de Custo de um tipo de OS.

**Retorno:** `INTEGER` (próximo sequencial)

---

## Triggers

### `criar_centro_custo_para_os`

**Tabela:** `ordens_servico`  
**Evento:** `BEFORE INSERT`  
**Ação:** Se `cc_id` for NULL, cria automaticamente um CC usando `gerar_centro_custo()`.

```sql
CREATE OR REPLACE FUNCTION criar_centro_custo_para_os()
RETURNS TRIGGER AS $$
DECLARE
  v_cc_record RECORD;
BEGIN
  IF NEW.cc_id IS NULL THEN
    SELECT cc_id, cc_nome INTO v_cc_record
    FROM gerar_centro_custo(
      NEW.tipo_os_id, 
      NEW.cliente_id, 
      'Criado automaticamente para OS ' || COALESCE(NEW.codigo_os, '')
    );
    NEW.cc_id := v_cc_record.cc_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### `fn_gerar_faturas_contrato`

**Tabela:** `contratos`  
**Evento:** `AFTER INSERT OR UPDATE`  
**Ação:** Quando status = 'ativo', gera parcelas em `contas_receber` (idempotente).
