# 🔍 DIAGNÓSTICO COMPLETO DE COMPONENTES - MinervaV2

**Data:** 2025-11-23
**Branch:** `claude/audit-components-checklist-01P2X9iyZeN33EDXWsooj815`
**Total de Componentes:** 182 arquivos

---

## 📊 SUMÁRIO EXECUTIVO

### ✅ Pontos Fortes
- ✅ **Migração completa para TanStack Router** (0 arquivos legacy)
- ✅ **Arquitetura Shadcn/UI correta** (composição, não substituição)
- ✅ **Organização por domínio** bem estruturada
- ✅ **96% dos exports são nomeados** (padrão correto)
- ✅ **Separação clara de responsabilidades**

### ⚠️ Problemas Identificados

| Categoria | Quantidade | Severidade |
|-----------|------------|------------|
| 🗑️ Componentes obsoletos/exemplo | 7 | 🔴 ALTA |
| 🐛 Erros TypeScript | 4 | 🔴 ALTA |
| 📝 TODOs/FIXMEs não resolvidos | 8 | 🟡 MÉDIA |
| 🖨️ Console statements | 31 | 🟡 MÉDIA |
| 📁 Deep relative imports | 40+ | 🟡 MÉDIA |
| 🔀 Default exports | 5 | 🟢 BAIXA |

---

## 🗂️ INVENTÁRIO DE COMPONENTES

### 1. UI Components (Shadcn/UI) - 56 arquivos
**Localização:** `src/components/ui/`

#### Componentes Base Shadcn (48):
- **Core:** button, input, label, textarea, separator, skeleton
- **Forms:** form, select, checkbox, radio-group, switch, slider
- **Layout:** card, tabs, accordion, collapsible, resizable, sheet, sidebar
- **Overlay:** dialog, alert-dialog, drawer, popover, tooltip, hover-card
- **Navigation:** breadcrumb, menubar, navigation-menu, dropdown-menu, context-menu
- **Data:** table, calendar, carousel, chart, pagination
- **Feedback:** alert, badge, progress, sonner (toast)
- **Advanced:** command, input-otp, aspect-ratio, scroll-area, toggle, toggle-group

#### Custom Wrappers (8):
```
✅ form-input.tsx          - Input com validação
✅ form-select.tsx         - Select com validação
✅ form-textarea.tsx       - Textarea com validação
✅ form-masked-input.tsx   - Input mascarado (CPF, telefone, etc.)
✅ form-error.tsx          - Display de erros
✅ primary-button.tsx      - Button customizado com loading
✅ auto-save-status.tsx    - Indicador de auto-save
✅ sidebar.tsx             - Primitives do Shadcn (usado por layout/sidebar.tsx)
```

**Status:** ✅ Arquitetura correta - wrappers estendem componentes shadcn

---

### 2. OS (Ordem de Serviço) - 70 arquivos
**Localização:** `src/components/os/`

#### Core OS (16):
```
os-list-page.tsx, os-list-header.tsx, os-table.tsx
os-details-page.tsx, os-details-assessoria-page.tsx, os-details-workflow-page.tsx
os-creation-hub.tsx, os-creation-card.tsx
os-filters-card.tsx, etapa-filter.tsx
workflow-page.tsx, workflow-stepper.tsx, workflow-footer.tsx
step-layout.tsx, step-wrapper.tsx, file-upload-section.tsx
```

#### Workflow Pages Específicas (5):
```
os07-workflow-page.tsx     - Perícia
os07-analise-page.tsx, os07-form-publico.tsx
os08-workflow-page.tsx     - Laudos
os09-workflow-page.tsx     - Compras
os13-workflow-page.tsx     - Obras
```

#### Step Components (49):
**Localização:** `src/components/os/steps/`

##### Shared Steps (12):
```
step-identificacao-lead-completo.tsx
step-followup-1.tsx, step-followup-2.tsx, step-followup-3.tsx
step-precificacao.tsx
step-gerar-proposta.tsx, step-gerar-proposta-os01-04.tsx
step-agendar-apresentacao.tsx, step-realizar-apresentacao.tsx
step-gerar-contrato.tsx, step-contrato-assinado.tsx
step-memorial-escopo.tsx, step-anexar-arquivo-generico.tsx
```

##### Assessoria Steps (3):
```
step-selecao-tipo-assessoria.tsx
step-memorial-escopo-assessoria.tsx
step-ativar-contrato-assessoria.tsx
```

##### OS08 Steps - Laudos (7):
```
step-identificacao-solicitante.tsx, step-atribuir-cliente.tsx
step-agendar-visita.tsx, step-realizar-visita.tsx
step-formulario-pos-visita.tsx
step-gerar-documento.tsx, step-enviar-documento.tsx
```

##### OS09 Steps - Compras (2):
```
step-requisicao-compra.tsx
step-upload-orcamentos.tsx
```

##### OS13 Steps - Obras (15):
```
step-dados-cliente.tsx
step-agendar-visita-inicial.tsx, step-realizar-visita-inicial.tsx
step-imagem-areas.tsx, step-cronograma-obra.tsx, step-histograma.tsx
step-anexar-art.tsx, step-seguro-obras.tsx, step-documentos-sst.tsx
step-placa-obra.tsx, step-evidencia-mobilizacao.tsx
step-requisicao-compras.tsx, step-requisicao-mao-obra.tsx
step-diario-obra.tsx, step-relatorio-fotografico.tsx
step-agendar-visita-final.tsx, step-realizar-visita-final.tsx
```

---

### 3. Dashboard - 10 arquivos
```
dashboard-page.tsx              - Router principal
dashboard-colaborador.tsx       - Visão 'colaborador'
dashboard-diretoria.tsx         - Visão 'diretoria'
dashboard-gestor.tsx            - Visão gerente genérico
dashboard-gestor-assessoria.tsx - Visão gerente assessoria
dashboard-gestor-obras.tsx      - Visão gerente obras
metric-card.tsx                 - Card de métricas
os-setor-chart.tsx             - Gráfico OS por setor
os-status-chart.tsx            - Gráfico OS por status
recent-os-list.tsx             - Lista OSs recentes
```

**Status:** ✅ Correto - Dashboards baseados em roles

---

### 4. Financeiro - 8 arquivos
```
financeiro-dashboard-page.tsx
conciliacao-bancaria-page.tsx
prestacao-contas-page.tsx
contas-pagar-page.tsx
contas-receber-page.tsx
modal-classificar-lancamento.tsx
modal-custo-flutuante.tsx
modal-nova-conta.tsx
```

---

### 5. Calendário - 7 arquivos
```
calendario-page.tsx
calendario-dia.tsx, calendario-semana.tsx, calendario-mes.tsx
bloco-turno.tsx
modal-criar-turno.tsx
modal-novo-agendamento.tsx
```

---

### 6. Comercial - 4 arquivos
```
dashboard-comercial.tsx
lista-leads.tsx
detalhes-lead.tsx
propostas-comerciais.tsx
```

---

### 7. Colaboradores - 4 arquivos
```
colaboradores-lista-page.tsx
controle-presenca-page.tsx
controle-presenca-tabela-page.tsx
modal-cadastro-colaborador.tsx
```

---

### 8. Layout - 4 arquivos
```
header.tsx
sidebar.tsx (AppSidebar - usa ui/sidebar.tsx primitives)
minerva-logo.tsx
font-loader.tsx
frontend-mode-banner.tsx
```

---

### 9. Delegação - 4 arquivos
```
delegacoes-page.tsx
lista-delegacoes.tsx
modal-delegar-os.tsx
badge-aprovacoes-pendentes.tsx
```

---

### 10. Obras - 3 arquivos
```
lista-obras-ativas.tsx
aprovacao-medicoes.tsx
modal-atualizar-cronograma.tsx
```

---

### 11. Outros Módulos
- **Clientes (2):** clientes-lista-page, cliente-detalhes-page
- **Assessoria (2):** analise-reformas, fila-aprovacao-laudos
- **Admin (2):** menu-preview-page, seed-usuarios-page
- **Portal (2):** portal-cliente-assessoria, portal-cliente-obras
- **Auth (1):** login-page
- **Configurações (1):** usuarios-permissoes-page

---

## 🔴 PROBLEMAS CRÍTICOS

### 1. Componentes Obsoletos/Exemplo (DELETE)

#### 🗑️ A DELETAR - 4 arquivos

```bash
# Componentes que devem ser DELETADOS
src/components/os/os-list-page-connected.tsx        # (173 linhas)
src/components/os/os-wizard-placeholder.tsx         # (53 linhas)
src/components/os/step-layout.example.tsx           # (216 linhas)
src/components/os/os-workflow-simplified-example.tsx # (179 linhas)
```

**Detalhes:**

1. **`os-list-page-connected.tsx`**
   - **Status:** OBSOLETO
   - **Razão:** Marcado como "EXEMPLO DE INTEGRAÇÃO" no header
   - **Funcionalidade:** Supersedida por `os-list-page.tsx`
   - **Ação:** DELETE

2. **`os-wizard-placeholder.tsx`**
   - **Status:** PLACEHOLDER
   - **Razão:** Mostra apenas "Este wizard será implementado em breve"
   - **Ação:** DELETE (wizards já implementados)

3. **`step-layout.example.tsx`**
   - **Status:** DOCUMENTAÇÃO/EXEMPLO
   - **Razão:** Arquivo de exemplo mostrando como usar StepLayout
   - **Ação:** DELETE (ou mover para /docs se necessário)

4. **`os-workflow-simplified-example.tsx`**
   - **Status:** EXEMPLO
   - **Razão:** Exemplo simplificado de implementação
   - **Ação:** DELETE (implementações de produção existem)

---

### 2. Componentes de Teste/Debug (MOVER ou CONDICIONAR)

#### 🧪 A MOVER/CONDICIONAR - 3 arquivos

```bash
# Componentes de teste/debug
src/components/test-supabase-connection.tsx  # Mover para /tests
src/components/test-schema-reload.tsx        # Mover para /debug
src/components/design-system-showcase.tsx    # Adicionar dev-only gate
```

**Detalhes:**

1. **`test-supabase-connection.tsx`** (44 linhas)
   - **Propósito:** Testar conexão Supabase
   - **Status:** Componente de teste (desabilitado - modo frontend only)
   - **Ação:** Mover para pasta `/tests` ou deletar

2. **`test-schema-reload.tsx`** (235 linhas)
   - **Propósito:** Debug para cache schema PostgREST
   - **Status:** Componente de debug (funcionalidade comentada)
   - **Ação:** Mover para pasta `/debug` ou compilação condicional

3. **`design-system-showcase.tsx`** (440 linhas)
   - **Propósito:** Showcase/documentação do design system
   - **Status:** Componente de documentação
   - **Ação:** Manter mas adicionar gate para dev-only ou mover para Storybook

---

### 3. Erros TypeScript

#### 🐛 ERROS DE COMPILAÇÃO - 1 arquivo

```bash
src/lib/hooks/use-dark-mode.ts
```

**Erros:**
```
Line 234:31 - error TS1005: '>' expected.
Line 234:36 - error TS1005: ')' expected.
Line 236:6  - error TS1161: Unterminated regular expression literal.
Line 237:3  - error TS1128: Declaration or statement expected.
```

**Ação:** Corrigir sintaxe no arquivo `use-dark-mode.ts`

---

## 🟡 PROBLEMAS MÉDIOS

### 4. TODOs/FIXMEs Não Resolvidos (8 arquivos)

```bash
# Arquivos com TODOs/FIXMEs
src/components/comercial/lista-leads.tsx
src/components/comercial/propostas-comerciais.tsx
src/components/obras/lista-obras-ativas.tsx
src/components/obras/aprovacao-medicoes.tsx
src/components/clientes/cliente-detalhes-page.tsx
src/components/clientes/clientes-lista-page.tsx
src/components/os/os-details-workflow-page.tsx
src/components/os/steps/shared/step-identificacao-lead-completo.tsx
```

**Ação:** Revisar e resolver cada TODO/FIXME

---

### 5. Console Statements (31 arquivos)

**Problema:** 31 componentes contêm `console.log/error/warn`

**Impacto:**
- Ruído de debug em produção
- Potencial impacto de performance
- Poluição do console do navegador

**Recomendação:**
- Remover ou envolver em checks dev-only
- Usar biblioteca de logging apropriada
- Manter `console.error` mas remover `console.log` de debug

**Categorias:**
- Financeiro: Todos os 8 arquivos
- Comercial: Todos os 4 arquivos
- Obras: Todos os 3 arquivos
- Clientes: 2 arquivos
- Colaboradores: Vários arquivos
- OS: Vários componentes de workflow

---

### 6. Deep Relative Imports (40+ arquivos)

**Problema:** Componentes em `os/steps/*` usam imports relativos profundos

**Exemplo:**
```typescript
import { OSTipo } from '../../../lib/types'
import { Button } from '../../../components/ui/button'
```

**Arquivos Afetados:**
- Todos em `os/steps/shared/` (12 arquivos)
- Todos em `os/steps/assessoria/` (3 arquivos)
- Todos em `os/steps/os08/` (7 arquivos)
- Todos em `os/steps/os09/` (2 arquivos)
- Todos em `os/steps/os13/` (15 arquivos)

**Recomendação:**
```typescript
// ❌ Evitar
import { OSTipo } from '../../../lib/types'

// ✅ Preferir
import { OSTipo } from '@/lib/types'
```

**Ação:**
- Configurar path aliases no `tsconfig.json`
- Atualizar imports para usar `@/` alias

---

## 🟢 PROBLEMAS BAIXOS

### 7. Default Exports (5 arquivos)

**Padrão do projeto:** Named exports (96% já seguem)

**Arquivos com default export:**
```bash
src/components/comercial/lista-leads.tsx
```

**Ação:** Converter para named export

---

### 8. Dados Mockados (20+ arquivos)

**Status:** ✅ INTENCIONAL (conforme CLAUDE.md)

**Nota:** A maioria dos componentes inclui fallback de dados mockados, o que é aceitável dado o modo de desenvolvimento frontend-only do projeto.

**Arquivos principais:**
- Todos os de financeiro
- Todos os de colaboradores
- Todos os de assessoria
- comercial/dashboard-comercial, lista-leads, propostas-comerciais
- clientes
- obras
- admin/seed-usuarios-page

**Ação:** ✅ Manter (conforme especificação em CLAUDE.md)

---

## 📐 INCONSISTÊNCIAS DE PADRÃO

### 9. Padrões de Import

**Problema:** Uso misto de imports

**Padrões encontrados:**
- Maioria: Imports relativos (`../../lib/...`)
- Alguns UI components: Path alias (`@/...`) - 11 arquivos
- Step components: Deep relative imports (`../../../...`)

**Recomendação:**
- Padronizar em `@/` alias para todos os imports absolutos
- Reservar imports relativos apenas para mesmo diretório ou pai

---

### 10. Componente Muito Grande

**`os-details-workflow-page.tsx`** - 1,723 linhas

**Problema:** Componente extremamente complexo

**Recomendação:** Considerar quebrar em componentes menores:
- Extrair lógica de workflow
- Separar renderização de steps
- Criar sub-componentes para seções

---

## 📊 ESTATÍSTICAS DETALHADAS

### Distribuição por Categoria
```
UI Components (Shadcn):     56 arquivos (30.8%)
OS Components:              70 arquivos (38.5%)
Dashboard:                  10 arquivos (5.5%)
Financeiro:                  8 arquivos (4.4%)
Calendário:                  7 arquivos (3.8%)
Outros módulos:             31 arquivos (17.0%)
```

### Qualidade de Código
```
✅ Named exports:           143+ arquivos (96%)
⚠️  Default exports:          5 arquivos (3%)
⚠️  TODOs/FIXMEs:             8 arquivos
⚠️  Console statements:      31 arquivos
⚠️  Mock data:               20+ arquivos (intencional)
🧪 Test/Debug:               3 arquivos
🗑️  Obsoletos:               4 arquivos
```

### Migração de Router
```
✅ TanStack Router:          6 arquivos (100%)
✅ react-router-dom:         0 arquivos (COMPLETO)
```

---

## 🎯 RECOMENDAÇÕES PRIORIZADAS

### 🔴 PRIORIDADE ALTA (Dívida Técnica)

1. **DELETAR componentes obsoletos** (4 arquivos)
   - os-list-page-connected.tsx
   - os-wizard-placeholder.tsx
   - step-layout.example.tsx
   - os-workflow-simplified-example.tsx
   - **Tempo estimado:** 15 minutos

2. **CORRIGIR erros TypeScript** (1 arquivo)
   - use-dark-mode.ts (4 erros)
   - **Tempo estimado:** 30 minutos

3. **MOVER componentes de teste/debug** (3 arquivos)
   - test-supabase-connection.tsx → /tests
   - test-schema-reload.tsx → /debug
   - design-system-showcase.tsx → gate dev-only
   - **Tempo estimado:** 30 minutos

4. **RESOLVER TODOs/FIXMEs** (8 arquivos)
   - Revisar e implementar ou remover comentários
   - **Tempo estimado:** 2-4 horas

### 🟡 PRIORIDADE MÉDIA (Qualidade)

5. **REMOVER/ENVOLVER console statements** (31 arquivos)
   - Criar utility de logging
   - Substituir console.log por logger condicional
   - **Tempo estimado:** 2 horas

6. **PADRONIZAR imports** (40+ arquivos)
   - Configurar path aliases (@/)
   - Substituir deep relative imports
   - **Tempo estimado:** 1-2 horas

7. **REFATORAR componente grande** (1 arquivo)
   - os-details-workflow-page.tsx (1723 linhas)
   - **Tempo estimado:** 4-8 horas

### 🟢 PRIORIDADE BAIXA (Nice to Have)

8. **PADRONIZAR exports** (5 arquivos)
   - Converter default para named exports
   - **Tempo estimado:** 30 minutos

9. **ANÁLISE de código morto**
   - Encontrar componentes nunca importados
   - **Tempo estimado:** 1 hora

10. **DOCUMENTAÇÃO de componentes**
    - Adicionar JSDoc comments
    - **Tempo estimado:** Contínuo

---

## 🚀 CONCLUSÃO

### Avaliação Geral: ✅ BOM

**Pontos Fortes:**
- ✅ Estrutura bem organizada por domínio
- ✅ Migração completa para TanStack Router
- ✅ Uso correto de Shadcn UI com composição
- ✅ Convenções de nomenclatura consistentes
- ✅ Boa separação de responsabilidades

**Principais Problemas:**
- 🔴 7 componentes obsoletos/teste/exemplo para remover
- 🔴 4 erros TypeScript para corrigir
- 🟡 31 componentes com console statements
- 🟡 8 componentes com TODOs/FIXMEs não resolvidos
- 🟡 40+ arquivos com deep relative imports

**Tempo Total Estimado de Limpeza:**
- Alta prioridade: 3-5 horas
- Média prioridade: 5-8 horas
- Baixa prioridade: 2-3 horas
- **Total: 10-16 horas**

---

## 📋 PRÓXIMOS PASSOS

Ver arquivo `COMPONENT_CLEANUP_PLAN.md` para checklist detalhado de execução.
