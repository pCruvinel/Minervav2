# Documentação Técnica: Configuração de Precificação (Pricing Config)

**Última Atualização:** 2026-01-07
**Versão:** v1.1
**Status:** Implementado (OS 1-4 e OS 5-6)

---

## 📌 Visão Geral

O módulo de **Pricing Config** permite que a diretoria configure dinamicamente as taxas percentuais utilizadas nos cálculos de precificação das Ordens de Serviço. O objetivo é flexibilizar margens de lucro, impostos e imprevistos sem necessidade de alterações no código-fonte, além de permitir o bloqueio de edição desses campos pelos usuários operacionais.

### Funcionalidades Principais
1.  **Valores Padrão Dinâmicos:** Definição de valores default para Imprevisto, Lucro e Imposto.
2.  **Controle de Editabilidade:** Toggle para permitir ou bloquear a edição dos campos durante o preenchimento da OS.
3.  **Auditoria Completa:** Registro de quem alterou, quando e qual foi o valor anterior e novo.
4.  **Suporte Multitenant (Logico):** Configurações segregadas por tipo de OS (`OS-01-04`, `OS-05-06`).

---

## 🗄 Banco de Dados (Supabase)

### 1. Tabela: `precificacao_config`

Armazena as configurações atuais.

| Coluna | Tipo | Descrição | Restrições |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Identificador único | PK, Default `gen_random_uuid()` |
| `tipo_os_codigo` | TEXT | Código do grupo de OS | `OS-01-04`, `OS-05-06` |
| `campo_nome` | TEXT | Nome técnico do campo | `percentual_imprevisto`, `percentual_lucro`, `percentual_imposto` |
| `valor_padrao` | NUMERIC(5,2) | Valor percentual padrão | Default `0` |
| `campo_editavel` | BOOLEAN | Se o campo é editável na OS | Default `true` |
| `ativo` | BOOLEAN | Flag lógica de ativação | Default `true` |
| `updated_at` | TIMESTAMPTZ | Data da última atualização | Default `now()` |

**Unique Constraint:** `UNIQUE(tipo_os_codigo, campo_nome)`

### 2. Tabela: `precificacao_config_audit`

Histórico de alterações para auditoria.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `config_id` | UUID | FK para `precificacao_config` |
| `campo_alterado` | TEXT | Nome do campo alterado (ex: 'valor_padrao') |
| `valor_anterior` | TEXT | Valor antigo |
| `valor_novo` | TEXT | Novo valor |
| `alterado_por_id` | UUID | FK para `colaboradores` (quem alterou) |
| `alterado_em` | TIMESTAMPTZ | Data da alteração |

### Security (RLS)

*   **Leitura (`SELECT`):** Permitido para todos usuários autenticados (necessário para carregar defaults na OS).
*   **Escrita (`UPDATE`):** Restrito a usuários com cargos `admin`, `diretor` ou do setor `diretoria`.
*   **Auditoria (`INSERT`):** Automático via aplicação (policy permite insert autenticado).

---

## 🎣 Hooks & Lógica de Negócio

### `use-precificacao-config.ts`

Hook centralizado para gerenciamento das configurações.

**Localização:** `src/lib/hooks/use-precificacao-config.ts`

#### API
```typescript
const { 
  configs,           // Array de configurações carregadas
  isLoading,         // Estado de loading
  updateConfig,      // Função para atualizar (valor ou editabilidade)
  fetchAuditLogs     // Função para buscar histórico de auditoria
} = usePrecificacaoConfig(tipoOS: 'OS-01-04' | 'OS-05-06');
```

#### Funcionalidades do Hook
- **Caches:** Utiliza React Query para cache e revalidação.
- **Auditoria Automática:** Ao chamar `updateConfig`, o hook automaticamente insere o registro correspondente na tabela de auditoria.
- **Tipagem Forte:** Protege contra nomes de campos inválidos.

---

## 💻 Componentes UI

### 1. `TaxasSettingsTab` (Dashboard Executivo)

Componente principal de administração.

**Localização:** `src/components/dashboard/executive/taxas-settings-tab.tsx`

- Organiza as configs em abas por Tipo de OS (Obras vs Assessoria).
- Renderiza uma tabela com:
    - Campo (Nome amigável)
    - Valor Padrão (Input numérico)
    - Editável na OS (Switch/Toggle)
    - Histórico (Botão que abre modal)
- Implementa lógica de "Dirty State" (botões Salvar/Cancelar aparecem apenas se houver mudanças não salvas).

### 2. `StepPrecificacao` (OS 1-4)

Componente de step da OS.

**Localização:** `src/components/os/shared/steps/step-precificacao.tsx`

**Integração:**
1.  Inicializa chamando `usePrecificacaoConfig('OS-01-04')`.
2.  No `useEffect`: Se os campos `percentualImprevisto/Lucro/Imposto` estiverem vazios (nova OS), preenche com `valor_padrao` do banco.
3.  Desabilita os inputs se `config.campo_editavel === false`.

**Cálculo:**
```typescript
ValorTotal = CustoBase * (1 + %Imprevisto + %Lucro + %Imposto)
```
*`CustoBase` é derivado do Memorial.*

### 3. `StepPrecificacaoAssessoria` (OS 5-6)

Componente de step da OS de Assessoria.

**Localização:** `src/components/os/shared/steps/step-precificacao-assessoria.tsx`

**Integração:**
1.  Inicializa chamando `usePrecificacaoConfig('OS-05-06')`.
2.  Idem ao anterior para preenchimento de defaults.
3.  **Novidade:** Adicionados campos visuais para Imprevisto e Lucro (antes inexistentes para Assessoria).

**Cálculo (Novo):**
```typescript
ValorImprevisto = CustoBase * %Imprevisto
ValorLucro = CustoBase * %Lucro
ValorImposto = CustoBase * %Imposto
ValorTotal = CustoBase + ValorImprevisto + ValorLucro + ValorImposto
```
*`CustoBase` é input manual.*

---

## ⚙️ Configuração e Uso

### Como Adicionar Novos Campos
Para suportar novos campos de taxa no futuro:

1.  **Banco de Dados:** Inserir nova linha em `precificacao_config`.
    ```sql
    INSERT INTO precificacao_config (tipo_os_codigo, campo_nome, valor_padrao)
    VALUES ('OS-XX', 'percentual_novo', 10);
    ```
2.  **Frontend (Hook):** Atualizar tipagem se necessário.
3.  **Frontend (Steps):** Mapear o novo `campo_nome` para o state local do componente de step.

### Permissões
Para editar as taxas, o usuário deve ter:
- `admin`
- `diretor`
- Cargo vinculado ao setor `diretoria`

Usuários operacionais (Coord. Obras, etc.) verão apenas os valores aplicados na OS, com os campos possivelmente bloqueados (read-only).

---

## 📄 Aplicação no PDF de Proposta

### Fórmula de Cálculo

Os valores no PDF são calculados automaticamente usando o **fator multiplicador**:

```typescript
// Fator = 1 + (%Imprevisto/100) + (%Lucro/100) + (%Imposto/100)
// Valor Final Item = Custo × Fator

const fatorMultiplicador = 1 + (imprevisto/100) + (lucro/100) + (imposto/100);
const valorFinal = custoItem * fatorMultiplicador;
```

### Implementação no Template

**Arquivo:** `supabase/functions/generate-pdf/templates/proposta-template.tsx`

O componente `SpecsTable` recebe o `fatorMultiplicador` e aplica a cada item:

```tsx
const SpecsTable = ({ etapas, fatorMultiplicador = 1 }) => (
  {etapa.subetapas.map((sub) => {
    const valorFinal = Number(sub.total || 0) * fatorMultiplicador;
    return <Text>{formatarMoeda(valorFinal)}</Text>;
  })}
);
```

---

## 📊 Visualização de Fórmulas (Dashboard Executivo)

A aba **Taxas** no Dashboard Executivo agora exibe:

1. **Fórmula de cálculo por item** - Como cada item do escopo é precificado
2. **Fórmula de valor total** - Soma dos itens com margens
3. **Simulação em tempo real** - Mostra o fator multiplicador baseado nas configurações atuais

**Exemplo com taxas padrão (10% + 40% + 15%):**
- Fator Multiplicador: 1.65x
- Custo R$ 1.000 → Proposta R$ 1.650

