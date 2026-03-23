# 📋 Sistema de Controle de Presença

> **Última Atualização:** 28/01/2026  
> **Status:** ✅ 100% Implementado  
> **Rota Principal:** `/colaboradores/presenca-tabela`

---

## 📋 Visão Geral

O Sistema de Controle de Presença é uma ferramenta de alta produtividade para:

- **Registro diário** de presenças, atrasos e faltas
- **Avaliação de performance** (Ótima, Boa, Regular, Ruim)
- **Alocação de custos** por Centro de Custo com rateio percentual
- **Auditoria completa** com confirmação e histórico de alterações
- **Exportação** para Excel/CSV

---

## 🗂️ Arquitetura de Arquivos

```
src/routes/_auth/colaboradores/
├── presenca-tabela.tsx           # Rota principal (tabela)
├── presenca-tabela.$data.tsx     # Detalhes do dia
├── presenca-historico.tsx        # Histórico e relatórios
└── presenca.tsx                  # Versão calendário (alternativa)

src/components/colaboradores/
├── controle-presenca-tabela-page.tsx  # Componente principal (70KB)
├── presenca-detalhes-page.tsx         # Página de detalhes (35KB)
├── presenca-historico-page.tsx        # Histórico (28KB)
└── controle-presenca-page.tsx         # Versão calendário (37KB)
```

---

## 🗃️ Schema do Banco de Dados

### Tabela: `registros_presenca`

| Coluna | Tipo | NOT NULL | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | ✅ | PK |
| `colaborador_id` | uuid FK | ✅ | → colaboradores.id |
| `data` | date | ✅ | Data do registro |
| `status` | text | ✅ | OK, ATRASADO, FALTA |
| `minutos_atraso` | integer | ❌ | Se ATRASADO |
| `justificativa` | text | ❌ | Justificativa de falta/atraso |
| `performance` | text | ✅ | OTIMA, BOA, REGULAR, RUIM |
| `performance_justificativa` | text | ❌ | Se performance RUIM |
| `centros_custo` | jsonb | ❌ | Array de CC IDs |
| `anexo_url` | text | ❌ | URL do comprovante |
| `confirmed_at` | timestamptz | ❌ | Quando confirmado |
| `confirmed_by` | uuid FK | ❌ | Quem confirmou |
| `confirmed_changes` | jsonb | ❌ | Histórico de auditoria |

---

## 🎨 Interface Principal

### Header

| Elemento | Descrição |
|----------|-----------|
| Título | "Controle de Presença Diária" |
| Seletor de Data | Popover com calendário |
| Badge Confirmação | Aparece quando registros confirmados |
| Botão Histórico | Link para `/presenca-historico` |

### KPIs (Cards)

| Card | Descrição | Cor |
|------|-----------|-----|
| Total | Total de colaboradores | Primary |
| Presentes | Status != FALTA | Success |
| Ausentes | Status == FALTA | Destructive |
| Atrasados | Status == ATRASADO | Warning |

### Tabela Editável

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| ☑ | Checkbox | Seleção para bulk actions |
| Colaborador | Avatar + Nome | Navegável para detalhes |
| Setor | Badge | Departamento |
| Status | Select | OK, ATRASADO, FALTA |
| Performance | Select | OTIMA, BOA, REGULAR, RUIM |
| C. Custos | Multi-select | Centros de custo |
| Justificativa | Modal | Texto + anexo |

---

## 🔧 Funcionalidades

### 1. Bulk Actions Bar

Aparece quando `selecionados.size > 0`:

| Ação | Descrição |
|------|-----------|
| **Marcar OK** | Define status OK para todos |
| **Marcar Falta** | Abre modal de justificativa em massa |
| **Atribuir CC** | Popover para selecionar CCs |
| **Performance** | Popover para definir performance |
| **Por Setor** | Seleciona todos de um setor |
| **Limpar** | Remove todas as seleções |

### 2. Modal de Justificativa

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Justificativa | Textarea | ✅ |
| Minutos de Atraso | Number | Se ATRASADO |
| Anexo | File Upload | ❌ |

**Formatos aceitos:** PDF, JPG, PNG (max 5MB)  
**Storage Bucket:** `comprovantes-presenca`

### 3. Modal de Rateio CC

Quando colaborador tem múltiplos CCs:

| Campo | Descrição |
|-------|-----------|
| CC | Centro de Custo |
| % | Percentual (soma = 100%) |
| Distribuir Igual | Divide igualmente |

### 4. Performance Desabilitada

Quando status = FALTA:
- Campo Performance é **desabilitado**
- Exibe placeholder "N/A"
- Valor enviado como 'BOA' (default)

### 5. Confirmação de Presenças

- Botão "Confirmar Presenças do Dia"
- Salva `confirmed_at` e `confirmed_by`
- Registros confirmados ficam read-only
- Badge verde no header

---

## 📄 Página de Detalhes do Dia

**Rota:** `/colaboradores/presenca-tabela/$data`

### KPIs (5 cards)

Total, Presentes, Faltas, Atrasos, Custo Total

### Tabs

| Tab | Conteúdo |
|-----|----------|
| **Registros** | Tabela completa com filtros |
| **Custos por CC** | Gráfico de barras + tabela |
| **Auditoria** | Timeline de alterações |

### Ações

- Exportar para Excel (CSV)
- Voltar para tabela principal

---

## 📈 Página de Histórico

**Rota:** `/colaboradores/presenca-historico`

### Filtros

| Filtro | Tipo |
|--------|------|
| Período | DateRange |
| Setor | Select |
| Colaborador | Select |
| Status | Select (Perfeito, Com Faltas, Com Atrasos) |
| Busca | Input |

### KPIs (7 cards)

Total colaboradores, presenças, faltas, atrasos, minutos de atraso, taxa de presença, custo total

### Exportação

- Botão "Exportar Excel"
- Gera CSV com todos os filtros aplicados

---

## ✅ Validações de Negócio

| Regra | Condição | Mensagem |
|-------|----------|----------|
| CC Obrigatório | setor != 'administrativo' && status != 'FALTA' && centrosCusto.length === 0 | "Precisa ter pelo menos 1 Centro de Custo" |
| Justificativa Status | (status === 'FALTA' \|\| status === 'ATRASADO') && !justificativaStatus | "Precisa ter justificativa" |
| Justificativa Performance | performance === 'RUIM' && !justificativaPerformance | "Precisa ter justificativa de performance ruim" |
| Arquivo Upload | size > 5MB | "Arquivo muito grande. Máximo 5MB" |
| Arquivo Upload | type not in [PDF, JPG, PNG] | "Formato não suportado" |

---

## 🔄 Fluxo de Dados

### Carregar Registros

```typescript
const fetchRegistrosDoDia = async (date: Date) => {
  const { data, error } = await supabase
    .from('registros_presenca')
    .select(`
      *,
      colaborador:colaborador_id (
        nome_completo, funcao, setor_id, custo_dia
      )
    `)
    .eq('data', format(date, 'yyyy-MM-dd'));
};
```

### Salvar Presença

```typescript
const handleSalvarPresenca = async () => {
  // Para cada colaborador com registro modificado
  const { error } = await supabase
    .from('registros_presenca')
    .upsert({
      colaborador_id,
      data,
      status,
      performance,
      centros_custo,
      justificativa,
      anexo_url
    }, {
      onConflict: 'colaborador_id,data'
    });
};
```

### Confirmar Registros

```typescript
const handleConfirmarPresencas = async () => {
  await supabase
    .from('registros_presenca')
    .update({
      confirmed_at: new Date().toISOString(),
      confirmed_by: userId
    })
    .eq('data', format(dataSelecionada, 'yyyy-MM-dd'));
};
```

---

## 📊 Custo de Mão de Obra

### View: `view_custo_mo_detalhado_os`

Usada para calcular custo de MO por CC:

```typescript
import { useCustoMOPorCC } from '@/lib/hooks/use-custo-mo';

const { data: custoPorCC } = useCustoMOPorCC({
  periodo: { inicio: '2026-01-01', fim: '2026-01-31' }
});

// Retorna
interface CustoMOPorCC {
  cc_id: string;
  cc_nome: string;
  custo_total: number;
  alocacoes: number;
  colaboradores_distintos: number;
  percentual: number;
}
```

---

## 📝 Changelog

| Data | Versão | Descrição |
|------|--------|-----------|
| 09/01/2026 | 1.0 | Implementação inicial |
| 12/01/2026 | 1.1 | Bulk Actions, Upload de arquivos |
| 12/01/2026 | 1.2 | Página de Detalhes, Modal em Massa |
| 28/01/2026 | 1.3 | Consolidação da documentação |

---

*Documentação consolidada em 28/01/2026.*
