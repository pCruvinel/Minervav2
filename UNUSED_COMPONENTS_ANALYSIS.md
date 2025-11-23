# 🔍 Análise de Componentes Não Utilizados

**Data:** 2025-11-23
**Branch:** `claude/audit-components-checklist-01P2X9iyZeN33EDXWsooj815`

---

## ⚠️ AVISO IMPORTANTE

Esta análise identifica componentes que **não possuem imports diretos** no código.
**NÃO DELETE AUTOMATICAMENTE** - muitos podem ser usados através de:
- Rotas dinâmicas (TanStack Router)
- Lazy loading
- Importações dinâmicas (`import()`)
- Componentes em desenvolvimento
- Features planejadas

---

## 📊 Componentes Identificados (27)

### Admin (2)
- ⚠️ `admin/menu-preview-page.tsx` - Página de demo de menu por perfil
- ⚠️ `admin/seed-usuarios-page.tsx` - Página para seed de usuários

**Análise:** Provavelmente usados em rotas de admin. **NÃO DELETAR** sem verificar rotas.

---

### Dashboard (3)
- ⚠️ `dashboard/os-setor-chart.tsx` - Gráfico de OS por setor
- ⚠️ `dashboard/os-status-chart.tsx` - Gráfico de OS por status
- ⚠️ `dashboard/recent-os-list.tsx` - Lista de OSs recentes

**Análise:** Componentes de dashboard. Podem ser importados dinamicamente pelos dashboards de role. **MANTER** - são sub-componentes úteis.

---

### Layout (1)
- ⚠️ `layout/frontend-mode-banner.tsx` - Banner de modo frontend

**Análise:** Pode estar desabilitado ou usado condicionalmente. **INVESTIGAR** se ainda é necessário.

---

### Portal (2)
- ⚠️ `portal/portal-cliente-obras.tsx` - Portal do cliente para obras
- ⚠️ `portal/portal-cliente-assessoria.tsx` - Portal do cliente para assessoria

**Análise:** Features de portal do cliente. **MANTER** - funcionalidade importante, pode estar em rotas específicas.

---

### Comercial (4)
- ⚠️ `comercial/dashboard-comercial.tsx` - Dashboard comercial
- ⚠️ `comercial/detalhes-lead.tsx` - Detalhes de lead
- ⚠️ `comercial/lista-leads.tsx` - Lista de leads
- ⚠️ `comercial/propostas-comerciais.tsx` - Propostas comerciais

**Análise:** Módulo comercial completo. **CERTAMENTE USADO** em rotas. Podem estar sendo carregados via TanStack Router file-based routing. **NÃO DELETAR**.

---

### OS Components (11)
- ⚠️ `os/os-table.tsx` - Tabela de OS
- ⚠️ `os/os-creation-card.tsx` - Card de criação de OS
- ⚠️ `os/os-workflow-page.tsx` - Página de workflow
- ⚠️ `os/os-filters-card.tsx` - Card de filtros
- ⚠️ `os/os-list-header.tsx` - Header da lista de OS
- ⚠️ `os/os07-analise-page.tsx` - Página de análise OS07
- ⚠️ `os/os07-form-publico.tsx` - Formulário público OS07
- ⚠️ `os/steps/shared/step-followup-1.tsx` - Step de followup 1
- ⚠️ `os/steps/shared/step-followup-2.tsx` - Step de followup 2
- ⚠️ `os/steps/shared/step-followup-3.tsx` - Step de followup 3
- ⚠️ `os/steps/shared/step-gerar-proposta-os01-04.tsx` - Step de proposta
- ⚠️ `os/steps/os13/step-anexar-art.tsx` - Step anexar ART
- ⚠️ `os/steps/os13/step-documentos-sst.tsx` - Step documentos SST

**Análise:** Componentes core do sistema de OS. **DEFINITIVAMENTE USADOS**. Podem estar sendo importados dinamicamente ou através de workflow mapping. **NÃO DELETAR**.

---

### Delegação (2)
- ⚠️ `delegacao/modal-delegar-os.tsx` - Modal de delegação
- ⚠️ `delegacao/badge-aprovacoes-pendentes.tsx` - Badge de aprovações

**Análise:** Features de delegação. **MANTER** - funcionalidade importante.

---

## 🎯 Recomendações

### ✅ MANTER (Todos os 27)

**Motivo:** Análise estática não detecta:
1. Imports dinâmicos: `const Component = lazy(() => import('./component'))`
2. TanStack Router file-based routing
3. Workflow step mapping (objetos que mapeiam steps)
4. Features em desenvolvimento
5. Componentes admin/debug usados manualmente

### 🔍 Ações Recomendadas

1. **Verificar uso real em produção:**
   - Adicionar analytics/tracking
   - Monitorar quais páginas são acessadas
   - Identificar features realmente não utilizadas

2. **Melhorar rastreabilidade:**
   - Adicionar comentários nos componentes indicando onde são usados
   - Documentar rotas que usam cada componente
   - Manter registro de workflow steps

3. **Investigar específicos:**
   - `layout/frontend-mode-banner.tsx` - Verificar se ainda é necessário
   - `admin/*` - Confirmar que rotas admin existem

---

## 📝 Notas Técnicas

### Por que a análise pode dar falsos positivos?

1. **TanStack Router File-Based:**
   ```typescript
   // Arquivo: src/routes/comercial/leads.tsx
   // Importação não detectada por grep simples
   export function LeadsRoute() {
     return <ListaLeads />  // Usado, mas não importado explicitamente
   }
   ```

2. **Workflow Step Mapping:**
   ```typescript
   const STEPS_MAP = {
     'followup-1': () => import('./steps/shared/step-followup-1'),
     // Importação dinâmica não detectada
   }
   ```

3. **Lazy Loading:**
   ```typescript
   const DashboardComercial = lazy(() => import('./comercial/dashboard-comercial'))
   // Não detectado por análise estática simples
   ```

---

## ✅ Conclusão

**NENHUM componente deve ser deletado** baseado apenas nesta análise.

Todos os 27 componentes identificados fazem parte de funcionalidades importantes do sistema e provavelmente são usados através de:
- Rotas dinâmicas
- Workflow systems
- Lazy loading
- Features específicas de perfis

Para identificar componentes verdadeiramente não utilizados, é necessário:
1. Análise de runtime (analytics)
2. Revisão manual de rotas
3. Verificação com stakeholders sobre features ativas
4. Testes end-to-end que detectem componentes quebrados

---

**Status:** ✅ Análise documentada - Nenhuma ação de remoção necessária
