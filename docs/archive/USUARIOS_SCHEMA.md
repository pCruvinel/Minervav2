# 👥 Guia de Usuários e Permissões (v3.0)

**Arquitetura:** Relacional (Tabelas `cargos` e `setores`)  
**Atualizado em:** 2025-12-05  
**Status:** ✅ Sincronizado com migration `20250105_refactor_roles_sectors.sql`

---

## 1. Visão Geral dos Cargos (10 Cargos Padronizados)

| Cargo | Slug | Setor | Nível | Acesso Financeiro | Escopo de Visão |
|:------|:-----|:------|:-----:|:-----------------:|:---------------:|
| **Admin** | `admin` | TI | 10 | ✅ | Global |
| **Diretor** | `diretor` | Diretoria | 9 | ✅ | Global |
| **Coord. Administrativo** | `coord_administrativo` | Administrativo | 6 | ✅ | Global |
| **Coord. de Assessoria** | `coord_assessoria` | Assessoria | 5 | ❌ | Setorial |
| **Coord. de Obras** | `coord_obras` | Obras | 5 | ❌ | Setorial |
| **Operacional Administrativo** | `operacional_admin` | Administrativo | 3 | ❌ | Setorial |
| **Operacional Comercial** | `operacional_comercial` | Administrativo | 3 | ❌ | Setorial |
| **Operacional Assessoria** | `operacional_assessoria` | Assessoria | 2 | ❌ | Setorial |
| **Operacional Obras** | `operacional_obras` | Obras | 2 | ❌ | Setorial |
| **Colaborador Obra** | `colaborador_obra` | Obras | 0 | ❌ | Nenhuma |

---

## 2. Setores do Sistema (5 Setores)

| Setor | Slug | Descrição |
|:------|:-----|:----------|
| **Diretoria** | `diretoria` | Setor estratégico |
| **Administrativo** | `administrativo` | Comercial, Financeiro, RH |
| **Assessoria** | `assessoria` | Laudos e consultoria técnica |
| **Obras** | `obras` | Execução e mão de obra |
| **TI** | `ti` | Tecnologia e sistemas |

---

## 3. Matriz de Permissões (RBAC v3.0)

### 3.1 Escopo de Visão

| Escopo | Quem | O que vê |
|:-------|:-----|:---------|
| **Global** | Admin, Diretor, Coord. Admin | Todas as OSs de todos os setores |
| **Setorial** | Coordenadores e Operacionais | OSs do próprio setor |
| **Próprio** | (não usado atualmente) | Apenas tarefas atribuídas |
| **Nenhuma** | Colaborador Obra | Sem acesso ao sistema |

### 3.2 Acesso Financeiro

Apenas 3 cargos têm acesso ao módulo financeiro:
- `admin`
- `diretor`  
- `coord_administrativo`

> [!IMPORTANT]
> A flag `acesso_financeiro` é verificada via `getPermissoes()` ou hook `usePermissoes()`.

---

## 4. Dashboards por Cargo

O sistema usa um **Dashboard unificado** com renderização RBAC:

| Cargo | Visão no Dashboard |
|:------|:-------------------|
| Admin/Diretor | ManagerTable Global + KPIs executivos |
| Coordenadores (`coord_*`) | ManagerTable Setorial + Link para Kanban |
| Operacionais (`operacional_*`) | ActionKanban pessoal |
| Colaborador Obra | Sem acesso |

**Rota:** `/dashboard` (renderiza componente diferente por cargo)  
**Kanban Pessoal:** `/dashboard/kanban`

---

## 5. Sistema de Delegação

O sistema possui regras de delegação definidas em `os-ownership-rules.ts`:

### 5.1 Pontos de Handoff

Cada tipo de OS define pontos onde a responsabilidade muda de cargo:

```
OS 01-04 (Obras):
  Etapa 4 → 5: coord_administrativo → coord_obras
  Etapa 8 → 9: coord_obras → coord_administrativo
```

### 5.2 Regras de Delegação

- **Coordenadores** podem delegar para operacionais do mesmo setor
- **Coord. Administrativo** tem visão cruzada (pode delegar para outros setores)
- **Operacionais** não podem delegar (apenas receber delegações)
- **Colaborador Obra** está bloqueado do sistema

---

## 6. Verificação de Permissões no Código

### Hook `usePermissoes()`

```typescript
const { 
  podeAcessarFinanceiro,  // boolean
  escopo_visao,           // 'global' | 'setorial' | 'proprio' | 'nenhuma'
  isGestor,               // true se coord_* ou diretor
  isOperacional           // true se operacional_*
} = usePermissoes();
```

### Função `getPermissoes(user)`

```typescript
const permissoes = getPermissoes(currentUser);
if (permissoes.acesso_financeiro) {
  // Mostrar módulo financeiro
}
```

---

## 7. FAQ

**Q: Por que o Coordenador de Obras não vê o Financeiro?**  
R: Comportamento correto. Apenas `admin`, `diretor` e `coord_administrativo` têm `acesso_financeiro = true`.

**Q: Como verificar permissões no frontend?**  
R: Use `usePermissoes()` hook ou `getPermissoes(user)` de `src/lib/types.ts`.

**Q: Posso criar novos cargos?**  
R: Sim, via tabela `cargos` no Supabase. Defina `acesso_financeiro` e `escopo_visao` corretamente.

---

*Documento alinhado com migration `20250105_refactor_roles_sectors.sql`*
