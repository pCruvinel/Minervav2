# Sistema de Controle de Presença

> **Última Atualização:** 12/01/2026  
> **Módulo:** Recursos Humanos / Colaboradores  
> **Rota Principal:** `/colaboradores/presenca-tabela`  
> **Rota Histórico:** `/colaboradores/presenca-historico`  
> **Rota Detalhes:** `/colaboradores/presenca-tabela/$data`

## 📋 Visão Geral

O Sistema de Controle de Presença é uma ferramenta de alta produtividade para registro diário de presenças, atrasos, faltas e performance de colaboradores. Permite a alocação de custos por Centro de Custo (CC) com rateio percentual, servindo como base para o cálculo de lucratividade dos contratos.

---

## 🗂️ Arquitetura de Arquivos

```
src/
├── routes/_auth/colaboradores/
│   ├── presenca-tabela.tsx          # Rota principal (tabela)
│   ├── presenca-tabela.$data.tsx    # ⭐ Rota de detalhes do dia (Nova)
│   ├── presenca-historico.tsx       # ⭐ Rota de histórico
│   ├── presenca.tsx                  # Rota alternativa (calendário)
│   └── $colaboradorId.tsx            # Detalhes do colaborador
├── components/colaboradores/
│   ├── controle-presenca-tabela-page.tsx  # ⭐ Componente principal (~1800 linhas)
│   ├── presenca-detalhes-page.tsx         # ⭐ Página de detalhes do dia (Nova)
│   ├── presenca-historico-page.tsx        # ⭐ Página de histórico
│   ├── controle-presenca-page.tsx         # Versão calendário (867 linhas)
│   └── colaborador-detalhes-page.tsx      # Tab "Financeiro & Presença"
├── types/
│   └── colaborador.ts                     # Types de Colaborador
└── lib/hooks/
    └── use-centro-custo.ts               # Hook de Centros de Custo
```

---

## 🗃️ Estrutura do Banco de Dados

### Tabela: `registros_presenca`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `uuid` (PK) | Identificador único |
| `colaborador_id` | `uuid` (FK) | Referência ao colaborador |
| `data` | `date` | Data do registro |
| `status` | `text` | `'OK'`, `'ATRASADO'`, `'FALTA'` |
| `minutos_atraso` | `integer` | Minutos de atraso (se aplicável) |
| `justificativa` | `text` | Justificativa de falta/atraso |
| `performance` | `text` | `'OTIMA'`, `'BOA'`, `'REGULAR'`, `'RUIM'` **(NOT NULL)** |
| `performance_justificativa` | `text` | Justificativa de performance ruim |
| `centros_custo` | `jsonb` | Array de IDs de CCs alocados |
| `anexo_url` | `text` | URL do atestado/comprovante |
| `confirmed_at` | `timestamp` | Quando foi confirmado |
| `confirmed_by` | `uuid` (FK) | Quem confirmou |
| `confirmed_changes` | `jsonb` | Histórico de auditoria |
| `created_at` | `timestamptz` | Data de criação |
| `updated_at` | `timestamptz` | Última atualização |

> **Nota:** Quando status é FALTA, performance recebe valor default 'BOA' para satisfazer constraint NOT NULL.

---

## 🆕 Funcionalidades Implementadas (v1.2 - 12/01/2026)

### 1. Performance Desabilitada quando FALTA

Quando o status de um colaborador é alterado para FALTA:
- O campo Performance é **desabilitado** visualmente
- Exibe placeholder "N/A"
- Estilo visual de campo desativado (opacidade, cursor not-allowed)
- O valor de performance é enviado como 'BOA' (default) para o banco

### 2. Bulk Actions Bar (Ações em Massa)

Quando um ou mais colaboradores são selecionados, aparece uma barra de ações:

| Ação | Descrição |
|------|-----------|
| **Marcar OK** | Define status OK para todos selecionados |
| **Marcar Falta** | Abre modal de justificativa em massa |
| **Atribuir CC** | Popover para selecionar CCs para todos |
| **Performance** | Popover para definir performance para todos |
| **Selecionar por Setor** | Seleciona todos de um setor específico |
| **Limpar seleção** | Remove todas as seleções |

### 3. Modal de Justificativa em Massa *(Novo)*

Ao clicar em "Marcar Falta" na Bulk Actions Bar:
- Abre modal solicitando justificativa
- Campo de texto obrigatório
- Upload de arquivo opcional (PDF/JPG/PNG, max 5MB)
- Aplica a todos os colaboradores selecionados

### 4. Upload de Arquivos na Justificativa

O modal de justificativa suporta upload de comprovantes:
- **Formatos aceitos:** PDF, JPG, PNG
- **Tamanho máximo:** 5MB
- **Storage:** Bucket `comprovantes-presenca` no Supabase Storage

### 5. Página de Detalhes do Dia *(Nova)*

**Rota:** `/colaboradores/presenca-tabela/$data`

**Funcionalidades:**
- Header com data formatada e badge de confirmação
- 5 KPIs (Total, Presentes, Faltas, Atrasos, Custo Total)
- **Tab Registros:** Tabela completa com filtros por status/setor
- **Tab Custos por CC:** Gráfico de barras + tabela de custos por centro de custo
- **Tab Auditoria:** Timeline de alterações e confirmações
- Exportação para Excel (CSV)

**Acesso:** Navegando pela data no header da tabela principal

### 6. Página de Histórico de Presenças

**Rota:** `/colaboradores/presenca-historico`

**Filtros disponíveis:**
- Período (data início/fim)
- Setor
- Colaborador individual
- Status (Perfeito, Com Faltas, Com Atrasos)
- Busca por nome

**7 KPIs exibidos:** Total de colaboradores, presenças, faltas, atrasos, minutos de atraso, taxa de presença, custo total

**Recursos:**
- Tabela com resumo por colaborador
- Badge de status (Perfeito/Atenção/Atrasos/Regular)
- Exportação para Excel (CSV)

---

## 🎨 Componentes da Interface

### Header
- **Título:** "Controle de Presença Diária"
- **Seletor de Data:** Popover com calendário
- **Badge de Confirmação:** Aparece quando registros estão confirmados
- **Botão Ver Histórico:** Link para página de histórico

### KPIs (Cards)
| Card | Descrição | Cor |
|------|-----------|-----|
| Total | Total de colaboradores | Primary |
| Presentes | Status != FALTA | Success |
| Ausentes | Status == FALTA | Destructive |
| Atrasados | Status == ATRASADO | Warning |

### Bulk Actions Bar
Aparece quando `selecionados.size > 0`:
- Contador de selecionados
- Botões de ação em massa (OK, Falta, CC, Performance)
- Opção "Selecionar por Setor"
- Botão limpar seleção

### Modais

#### ModalJustificativa
- **Campos:** Justificativa (textarea), Minutos de Atraso (se aplicável)
- **Upload de arquivo:** Campo para anexar comprovante
- Dispara quando status = FALTA/ATRASADO ou performance = RUIM

#### ModalJustificativaEmMassa *(Novo)*
- **Campos:** Justificativa (obrigatória), Upload de arquivo (opcional)
- Dispara ao clicar "Marcar Falta" na Bulk Actions Bar
- Aplica a todos os selecionados

#### ModalRateioCC
- Lista colaboradores com múltiplos CCs
- Inputs de percentual (soma deve ser 100%)
- Botão "Distribuir igual"

---

## ✅ Validações de Negócio

| Regra | Condição | Mensagem |
|-------|----------|----------|
| CC Obrigatório | `setor != 'administrativo' && status != 'FALTA' && centrosCusto.length === 0` | "Precisa ter pelo menos 1 Centro de Custo" |
| Justificativa Status | `(status === 'FALTA' \|\| status === 'ATRASADO') && !justificativaStatus` | "Precisa ter justificativa de falta/atraso" |
| Justificativa Performance | `performance === 'RUIM' && !justificativaPerformance` | "Precisa ter justificativa de performance ruim" |
| Arquivo Upload | Tamanho > 5MB | "Arquivo muito grande. Máximo 5MB" |
| Arquivo Upload | Tipo != PDF/JPG/PNG | "Formato não suportado. Use PDF, JPG ou PNG" |

---

## 📝 Changelog

| Data | Versão | Descrição |
|------|--------|-----------|
| 09/01/2026 | 1.0 | Documentação inicial criada |
| 12/01/2026 | 1.1 | Bulk Actions Bar, Upload de arquivos, Performance desabilitada no FALTA, Página de Histórico |
| 12/01/2026 | 1.2 | Página de Detalhes do Dia com 3 tabs, Modal de Justificativa em Massa |
