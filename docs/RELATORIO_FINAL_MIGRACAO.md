# 📋 RELATÓRIO FINAL DE AUDITORIA - Migração Sistema Minerva

**Data:** 2025-12-05  
**Versão:** v2.1  
**Escopo:** Arquitetura Híbrida de OS, RBAC, Dashboards

---

## 📊 RESUMO EXECUTIVO

| Categoria | Status | Criticidade |
|:----------|:------:|:-----------:|
| Dashboards RBAC | ✅ OK | - |
| Hook useDashboardData | ✅ OK | - |
| Delegação de Etapas | ✅ OK | - |
| Código Morto | ⚠️ 5 arquivos | MÉDIA |
| Lógica Legada | ⚠️ 1 arquivo | ALTA |
| Migrations Schema | ✅ OK | - |
| Documentação | ❌ Desatualizada | ALTA |

---

## 📍 FASE 1: Verificação de Integridade (Sanity Check)

### ✅ 1.1 Dashboard Principal (`dashboard.tsx`)

**Arquivo:** `src/routes/_auth/dashboard.tsx`

- Importa corretamente `DashboardPage` de `@/components/dashboard/dashboard-page`
- Componente interno busca dados via `useDashboardData()`

**Arquivo:** `src/components/dashboard/dashboard-page.tsx`

- **Imports corretos:** `ActionKanban`, `ManagerTable`, `MetricCard`
- **Switch por cargo implementado:**
  - `['admin', 'diretor', 'diretoria']` → ManagerTable Global + KPIs
  - `cargoSlug.startsWith('coord_')` → ManagerTable Setorial + Link Kanban
  - `cargoSlug.startsWith('operacional_')` → ActionKanban pessoal
  - Fallback para `escopo_visao === 'nenhuma'` → Mensagem de bloqueio

### ✅ 1.2 Hook `useDashboardData`

**Arquivo:** `src/lib/hooks/use-dashboard-data.ts`

- **Tratamento de `user` null:** ✅ Linha 148 verifica `if (!userId) return []`
- **Relacionamentos na query:** Utiliza `useOrdensServico()` internamente
- **Filtragem RBAC:** Corretamente filtra por `permissoes.escopo_visao`
- **Extração de etapa atual:** Função `extrairDadosEtapaAtual` processa `os_etapas`

> [!NOTE]
> O hook depende de `getPermissoes()` de `src/lib/types.ts` para determinar escopo de visão.

### ✅ 1.3 Componente de Delegação

**Arquivo:** `src/components/os/shared/components/workflow-footer-with-delegation.tsx`

- **Integração com regras:** Importa `checkDelegationRequired` de `os-ownership-rules.ts`
- **Validação de handoff:** Linhas 111-116 verificam se delegação é necessária antes de avançar
- **Modal de delegação:** Componente `DelegationModal` é renderizado condicionalmente

**Arquivo:** `src/lib/constants/os-ownership-rules.ts`

- **501 linhas** de regras bem documentadas
- Todos os tipos de OS (OS-01 a OS-13) têm regras definidas
- Funções utilitárias: `getStepOwner()`, `getHandoffPoint()`, `checkDelegationRequired()`

---

## 📍 FASE 2: Caça ao Código Morto (Dead Code Hunt)

### ⚠️ 2.1 Dashboards Obsoletos (CANDIDATOS À DELEÇÃO)

| Arquivo | Linha | Status | Razão |
|:--------|:-----:|:------:|:------|
| `src/components/dashboard/dashboard-gestor.tsx` | 328 | 🗑️ DELETAR | Substituído pela lógica unificada em `dashboard-page.tsx` |
| `src/components/dashboard/dashboard-gestor-assessoria.tsx` | N/A | 🗑️ DELETAR | Não utilizado após unificação RBAC |
| `src/components/dashboard/dashboard-gestor-obras.tsx` | N/A | 🗑️ DELETAR | Não utilizado após unificação RBAC |
| `src/components/dashboard/dashboard-diretoria.tsx` | N/A | 🗑️ DELETAR | Visão de diretoria agora em `dashboard-page.tsx` |
| `src/components/comercial/dashboard-comercial.tsx` | 309 | 🗑️ DELETAR | Usa mock data (`mock-data-comercial.ts`), não integrado |
| `src/components/dashboard/dashboard-colaborador.tsx` | N/A | ⚠️ AVALIAR | Pode estar sendo usado em algum lugar |

### ⚠️ 2.2 Lógica de Permissão Legada (AÇÃO CORRETIVA NECESSÁRIA)

**Arquivo:** `src/lib/auth-utils.ts`

```typescript
// ❌ LÓGICA ANTIGA (hardcoded role_nivel):
if (delegante.role_nivel === 'mao_de_obra') { ... }      // Linha 32
if (delegante.role_nivel === 'colaborador') { ... }      // Linha 37
if (delegante.role_nivel === 'diretoria') { ... }        // Linha 42
if (delegante.role_nivel === 'gestor_administrativo') { ... } // Linha 47
// ... até linha 182
```

> [!WARNING]
> **Ação Corretiva:** Refatorar `auth-utils.ts` para usar o hook `usePermissoes()` ou a função `getPermissoes()`. O sistema novo usa `cargo_slug` e `escopo_visao` ao invés de `role_nivel`.

**Arquivo com lógica legada adicional:** `src/components/os/shared/pages/os-list-page.tsx`
- Linha 175: `currentUser.role_nivel === 'diretoria' || currentUser.role_nivel === 'gestor_administrativo'`

### ✅ 2.3 Componentes de Steps

**Constante `OS_WORKFLOW_STEPS`:** Definida em `src/constants/os-workflow.ts`
- Utilizada corretamente em `os-details-workflow-page.tsx`
- Nenhum componente de step órfão identificado

---

## 📍 FASE 3: Validação de Banco de Dados (Schema)

### ✅ 3.1 Migrations Verificadas

| Migration | Conteúdo | Status |
|:----------|:---------|:------:|
| `001_add_parent_os_id.sql` | Adiciona `parent_os_id` | ✅ OK |
| `008_os_parent_child_architecture.sql` | `is_contract_active`, `dados_publicos`, `os_vagas_recrutamento` | ✅ OK |
| `20250105_refactor_roles_sectors.sql` | `acesso_financeiro`, `escopo_visao`, 5 setores, 10 cargos | ✅ OK |

### ✅ 3.2 Colunas Confirmadas

- **`parent_os_id`:** Criada via `001_add_parent_os_id.sql`
- **`is_contract_active`:** Criada via `008_...sql`, boolean DEFAULT false
- **`os_vagas_recrutamento`:** Tabela criada para OS-10 (RH)

### ❌ 3.3 Documentação de Schema

**Arquivo:** `docs/sistema/DATABASE_SCHEMA.md`
- **Status:** ❌ VAZIO (0 bytes)
- **Ação:** Precisa ser populado com o schema atual

---

## 📍 FASE 4: Documentação

### 📚 Arquivos a Atualizar

| Arquivo | Problema | Urgência |
|:--------|:---------|:--------:|
| `docs/sistema/DATABASE_SCHEMA.md` | Completamente vazio | 🔴 CRÍTICA |
| `docs/technical/USUARIOS_SCHEMA.md` | Cargos antigos (`gestor_administrativo`, `gestor_obras`, `gestor_assessoria`, `colaborador`, `mao_de_obra`). Não menciona novos slugs: `coord_administrativo`, `coord_assessoria`, `coord_obras`, `operacional_*` | 🔴 CRÍTICA |
| `docs/technical/Manual de Permissões e Controle de Acesso.md` | Precisa revisar se está alinhado com novas permissões | 🟡 MÉDIA |

### 📚 Arquivos Provavelmente OK

| Arquivo | Observação |
|:--------|:-----------|
| `docs/technical/PLAN_OS_ARCHITECTURE_V2.md` | Plano de arquitetura recente |
| `docs/technical/DESIGN_SYSTEM.md` | Sistema de design (CSS) |
| `docs/technical/VALIDATION_SYSTEM.md` | Sistema de validação |

---

## 🗑️ LISTA DE ARQUIVOS PARA DELETAR

```
src/components/dashboard/dashboard-gestor.tsx
src/components/dashboard/dashboard-gestor-assessoria.tsx
src/components/dashboard/dashboard-gestor-obras.tsx
src/components/dashboard/dashboard-diretoria.tsx
src/components/comercial/dashboard-comercial.tsx
```

> [!CAUTION]
> Antes de deletar, verifique se há imports desses arquivos em outros lugares com `grep_search`.

---

## 🔧 AÇÕES CORRETIVAS IMEDIATAS

### 1. 🔴 CRÍTICA: Refatorar `auth-utils.ts`

**Problema:** Lógica hardcoded com `role_nivel` antigos  
**Solução:** Substituir verificações por `getPermissoes()` ou `usePermissoes()`

### 2. 🔴 CRÍTICA: Atualizar `USUARIOS_SCHEMA.md`

**Problema:** Documenta cargos antigos  
**Solução:** Atualizar com os 10 novos cargos:
- `admin`, `diretor`
- `coord_administrativo`, `coord_assessoria`, `coord_obras`
- `operacional_admin`, `operacional_comercial`, `operacional_assessoria`, `operacional_obras`
- `colaborador_obra`

### 3. 🔴 CRÍTICA: Popular `DATABASE_SCHEMA.md`

**Problema:** Arquivo vazio  
**Solução:** Gerar documentação do schema via Supabase CLI ou manualmente

### 4. 🟡 MÉDIA: Remover Dashboards Obsoletos

**Problema:** 5 arquivos de dashboard não utilizados  
**Solução:** Deletar após confirmar que não há imports

### 5. 🟡 MÉDIA: Corrigir `os-list-page.tsx` Linha 175

**Problema:** Usa `role_nivel` ao invés de `cargo_slug`  
**Solução:** Refatorar para `getPermissoes(currentUser).escopo_visao === 'global'`

---

## ✅ O QUE ESTÁ FUNCIONANDO

1. **Dashboard RBAC:** Switch por cargo implementado corretamente
2. **Hook `useDashboardData`:** Tratamento de null e filtragem RBAC
3. **Delegação de Etapas:** Integração com `os-ownership-rules.ts`
4. **Migrations:** Todas as colunas críticas criadas
5. **Kanban Operacional:** Movido para `/dashboard/kanban`

---

## ⚠️ O QUE PARECE FRÁGIL

1. **`auth-utils.ts`:** Lógica antiga coexiste com sistema novo
2. **Documentação:** Desatualizada em relação ao código
3. **Dashboards Legados:** Arquivos mortos ocupando espaço e confundindo

---

*Relatório gerado automaticamente pela auditoria de migração v2.1*
