# Auditoria de Componentes e Proposta de Reorganização (Atualizado)

## Estrutura de Diretórios Proposta

A nova estrutura agrupa os componentes primeiramente por **Setor** (Obras, Assessoria, Administrativo) e depois por **Grupo de OS**.

```
src/components/os/
├── shared/                     # Componentes compartilhados globalmente
│   ├── components/
│   ├── pages/
│   ├── steps/
│   └── wrappers/
├── obras/                      # Setor de Obras
│   ├── os-1-4/                 # Fluxo Unificado OS 1, 2, 3, 4
│   │   ├── components/
│   │   ├── pages/
│   │   └── steps/
│   └── os-13/                  # Start de Obra
│       ├── components/
│       ├── pages/
│       └── steps/
├── assessoria/                 # Setor de Assessoria
│   ├── os-5-6/                 # Fluxo Unificado OS 5, 6
│   │   ├── components/
│   │   ├── pages/
│   │   └── steps/
│   ├── os-7/                   # OS Individual
│   ├── os-8/                   # OS Individual
│   ├── os-11/                  # OS Individual
│   └── os-12/                  # OS Individual
└── administrativo/             # Setor Administrativo
    ├── os-9/                   # OS Individual
    └── os-10/                  # OS Individual
```

## Tabela de Auditoria

| Nome Atual | Localização Proposta | Setor | Ação Recomendada |
| :--- | :--- | :--- | :--- |
| **Raiz (src/components/os/)** | | | |
| `agendamento-os.tsx` | `shared/components/` | Shared | Mover |
| `calendario-integracao.tsx` | `shared/components/` | Shared | Mover |
| `etapa-filter.tsx` | `shared/components/` | Shared | Mover |
| `file-upload-section.tsx` | `shared/components/` | Shared | Mover |
| `file-upload-with-description.tsx` | `shared/components/` | Shared | Mover |
| `os-creation-card.tsx` | `shared/components/` | Shared | Mover |
| `os-creation-hub.tsx` | `shared/components/` | Shared | Mover |
| `os-details-assessoria-page.tsx` | `assessoria/os-5-6/pages/` | Assessoria | Mover |
| `os-details-page.tsx` | `shared/pages/` | Shared | Mover |
| `os-details-redesign-page.tsx` | `shared/pages/` | Shared | Mover |
| `os-details-workflow-page.tsx` | `shared/pages/` | Shared | Mover |
| `os-filters-card.tsx` | `shared/components/` | Shared | Mover |
| `os-hierarchy-card.tsx` | `shared/components/` | Shared | Mover |
| `os-list-header.tsx` | `shared/components/` | Shared | Mover |
| `os-list-page.tsx` | `shared/pages/` | Shared | Mover |
| `os-table.tsx` | `shared/components/` | Shared | Mover |
| `os-workflow-page.tsx` | `obras/os-1-4/pages/` | Obras | Mover (Renomear: `workflow-page.tsx`) |
| `os05-workflow-page.tsx` | `assessoria/os-5-6/pages/` | Assessoria | Mover |
| `os06-workflow-page.tsx` | `assessoria/os-5-6/pages/` | Assessoria | Mover |
| `os07-analise-page.tsx` | `assessoria/os-7/pages/` | Assessoria | Mover |
| `os07-form-publico.tsx` | `assessoria/os-7/components/` | Assessoria | Mover |
| `os07-workflow-page.tsx` | `assessoria/os-7/pages/` | Assessoria | Mover |
| `os08-workflow-page.tsx` | `assessoria/os-8/pages/` | Assessoria | Mover |
| `os09-workflow-page.tsx` | `administrativo/os-9/pages/` | Admin | Mover |
| `os10-workflow-page.tsx` | `administrativo/os-10/pages/` | Admin | Mover |
| `os11-workflow-page.tsx` | `assessoria/os-11/pages/` | Assessoria | Mover |
| `os12-workflow-page.tsx` | `assessoria/os-12/pages/` | Assessoria | Mover |
| `os13-workflow-page.tsx` | `obras/os-13/pages/` | Obras | Mover |
| `proposta-comercial-print-page.tsx` | `shared/pages/` | Shared | Mover |
| `step-layout.tsx` | `shared/wrappers/` | Shared | Mover |
| `step-wrapper.tsx` | `shared/wrappers/` | Shared | Mover |
| `workflow-footer.tsx` | `shared/components/` | Shared | Mover |
| `workflow-stepper.tsx` | `shared/components/` | Shared | Mover |
| **Steps (src/components/os/steps/)** | | | |
| `assessoria/*` | `assessoria/os-5-6/steps/` | Assessoria | Mover pasta |
| `os08/*` | `assessoria/os-8/steps/` | Assessoria | Mover pasta |
| `os09/*` | `administrativo/os-9/steps/` | Admin | Mover pasta |
| `os10/*` | `administrativo/os-10/steps/` | Admin | Mover pasta |
| `os11/*` | `assessoria/os-11/steps/` | Assessoria | Mover pasta |
| `os12/*` | `assessoria/os-12/steps/` | Assessoria | Mover pasta |
| `os13/*` | `obras/os-13/steps/` | Obras | Mover pasta |
| `shared/step-gerar-proposta-os01-04.tsx` | `obras/os-1-4/steps/` | Obras | Mover |
| `shared/*` (outros) | `shared/steps/` | Shared | Manter |

## Plano de Refatoração de Imports

1.  **Caminhos Absolutos:**
    *   Ex: `import ... from '@/components/os/obras/os-1-4/steps/...'`

2.  **Barrel Files:**
    *   Manter estratégia de `index.ts` por pasta de steps.
