# CLAUDE.md - Diretrizes do Projeto MinervaV2

> **FOCO ATUAL:** Estabilidade, Produção e Eliminação de Dívida Técnica.
> **REGRA DE OURO:** Não use dados mockados para novas funcionalidades. Conecte ao Supabase.

## 📊 Status do Projeto (Atualizado 01/12/2025)

### Supabase - Projeto MinervaV2
- **Project ID**: `zxfevlkssljndqqhxkjb`
- **Região**: sa-east-1
- **Status**: ACTIVE_HEALTHY
- **Edge Functions**: `server` (v12), `generate-pdf` (v7)

### Workflows de OS Implementados

| OS | Nome | Status | Rota |
|----|------|--------|------|
| OS-10 | Requisição Mão de Obra | ✅ Implementado | `/os/criar/requisicao-mao-de-obra` |
| OS-11 | Laudo Pontual | ✅ Implementado | `/os/criar/laudo-pontual` |
| OS-12 | Assessoria Recorrente | ✅ Implementado | `/os/criar/assessoria-recorrente` |

### 10 Funções de Colaborador do Sistema
1. `admin` - Administrador (acesso total)
2. `diretoria` - Diretoria (gestão executiva)
3. `gestor_administrativo` - Gestor Administrativo
4. `gestor_obras` - Gestor de Obras
5. `gestor_assessoria` - Gestor de Assessoria
6. `coordenador_obras` - Coordenador de Obras
7. `coordenador_assessoria` - Coordenador de Assessoria
8. `colaborador` - Colaborador (funcionário interno)
9. `colaborador_obra` - Colaborador de Obra (SEM acesso ao sistema)
10. `mao_de_obra` - Mão de Obra (SEM acesso ao sistema)

## 🛠 Comandos Principais
- **Dev Server**: `npm run dev`
- **Build**: `npm run build` (Garante checagem de tipos TypeScript)
- **Testes**: `npm run test` (Vitest)
- **Lint**: `npm run lint`
- **Banco de Dados (Supabase)**:
  - Migrations (Push): `npx supabase db push`
  - Pull Schema: `npx supabase db pull`
  - Status: `npx supabase status`
  - **Update Types**: `npm run update-types` (Sempre rode após alterar o banco)
    - Requer: Docker Desktop rodando OU login no Supabase CLI (`npx supabase login`)
    - Alternativa local: `npm run update-types:local` (requer Docker Desktop)

## 🏗 Stack Tecnológica (Produção)
- **Frontend**: React 18.3+, TypeScript, Vite.
- **Estilização**: Tailwind CSS, Shadcn/UI (em `src/components/ui`).
- **Roteamento**: **TanStack Router** (File-based em `src/routes`).
  - ✅ **Padrão**: Use `src/routes` para todas as novas telas.
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions).
- **State Management**: React Context + Hooks de Data Fetching (`src/lib/hooks`).
- **Notificações**: Sonner (`toast`).

## 📐 Hooks de Integração com Supabase

### Hook Centralizado: `use-os-workflows.ts`
```typescript
import { 
  useCentrosCusto,
  useCargos,
  useColaboradores,
  useSetores,
  useTurnos,
  useCreateOSWorkflow,
  useUploadDocumentoOS,
  FUNCOES_COLABORADOR,
  TIPOS_CONTRATACAO,
  SLAS_ASSESSORIA,
  FREQUENCIAS_VISITA
} from '@/lib/hooks/use-os-workflows';
```

### Hooks Existentes (Reutilizar)
- `use-clientes.tsx` - CRUD de clientes
- `use-agendamentos.ts` - Agendamentos e turnos
- `use-pdf-generation.ts` - Geração de PDFs via Edge Function
- `use-ordens-servico.ts` - CRUD de ordens de serviço
- `use-centro-custo.ts` - Geração de centro de custo (RPC)

## 📐 Padrões de Arquitetura e Código

### 1. Roteamento e Navegação (TanStack Router)
- **File-Based**: A estrutura de pastas em `src/routes` define a URL.
- **Links**: Use `<Link to="...">`. Evite `<a>` ou `window.location`.
- **Navegação Imperativa**:
  ```typescript
  const navigate = useNavigate()
  navigate({ to: '/os/$osId', params: { osId: '123' } })
  ```

### 2. Workflow de OS (Stepper Pattern)
```typescript
// Usar hooks de workflow
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowNavigation } from '@/lib/hooks/use-workflow-navigation';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';

// Componentes de workflow
import { WorkflowStepper } from '@/components/os/workflow-stepper';
import { WorkflowFooter } from '@/components/os/workflow-footer';
```

## 📝 Convenções de Código

### Logging
- **✅ USE:** `logger.*` de `@/lib/utils/logger`
- **❌ EVITE:** `console.log`, `console.warn`, `console.debug` diretamente
- **Exceção:** `logger.error()` é sempre logado (dev + prod)

```typescript
import { logger } from '@/lib/utils/logger';

// ✅ Correto
logger.log('Debug info');        // Dev only
logger.warn('Warning');           // Dev only
logger.error('Critical error');   // Dev + Prod

// ❌ Evitar
console.log('Debug info');        // Não condicional
```

### Imports
- **✅ USE:** Path alias `@/` para imports absolutos
- **❌ EVITE:** Deep relative imports (`../../../`)

```typescript
// ✅ Correto
import { Button } from '@/components/ui/button';
import { OSTipo } from '@/lib/types';
import { logger } from '@/lib/utils/logger';

// ❌ Evitar
import { Button } from '../../../ui/button';
import { OSTipo } from '../../../../lib/types';
```

### Exports
- **✅ USE:** Named exports
- **❌ EVITE:** Default exports

```typescript
// ✅ Correto
export function MyComponent() { ... }
export const myUtil = () => { ... }

// ❌ Evitar
export default function MyComponent() { ... }
```

### Cores (Design System)
- **✅ USE:** Variáveis do design system
- **❌ EVITE:** Cores hardcoded (blue-500, green-100, etc.)

```typescript
// ✅ Correto
className="bg-primary text-primary-foreground"
className="bg-success/10 text-success"
className="bg-destructive text-destructive-foreground"
className="bg-muted text-muted-foreground"

// ❌ Evitar
className="bg-blue-500 text-white"
className="bg-green-100 text-green-700"
```

### Documentação
- **✅ USE:** JSDoc para componentes públicos
- **Inclua:** Descrição, exemplos, parâmetros importantes

```typescript
/**
 * ComponentName - Descrição breve
 *
 * Descrição detalhada do que o componente faz.
 *
 * @example
 * ```tsx
 * <ComponentName prop="value">
 *   Content
 * </ComponentName>
 * ```
 */
export function ComponentName(props: Props) { ... }
```

### Estrutura de Arquivos
```
src/
├── components/        # Componentes React
│   ├── ui/           # Shadcn/UI base components
│   ├── os/           # Ordem de Serviço components
│   │   ├── steps/    # Steps de workflow por OS
│   │   │   ├── os10/ # Steps OS-10
│   │   │   ├── os11/ # Steps OS-11
│   │   │   └── os12/ # Steps OS-12
│   ├── layout/       # Layout components
│   └── ...           # Feature-based folders
├── lib/
│   ├── hooks/        # Custom hooks
│   │   ├── use-os-workflows.ts  # Hook centralizado OS
│   │   ├── use-clientes.tsx
│   │   ├── use-agendamentos.ts
│   │   └── ...
│   ├── types/        # TypeScript types
│   ├── utils/        # Utility functions
│   └── validations/  # Zod schemas
├── routes/           # TanStack Router (file-based)
│   └── _auth/os/criar/ # Rotas de criação de OS
├── tests/            # Componentes de teste
└── debug/            # Componentes de debug
```

### TODOs e Comentários
- **✅ USE:** Comentários descritivos e contextuais
- **Para pendências de schema:** `// SCHEMA: ...`
- **Para modo frontend-only:** `// FRONTEND-ONLY MODE: ...`

```typescript
// ✅ Correto - Descreve o motivo
// FRONTEND-ONLY MODE: Usando mock data - implementar fetch real quando conectar Supabase
const [data] = useState(mockData);

// SCHEMA: Adicionar campo tipo_contrato na tabela clientes
tipoContrato: 'ASSESSORIA',

// ❌ Evitar - TODO genérico
// TODO: fix this
```

### Performance
- **Logger:** Logs de debug removidos automaticamente em produção
- **Imports:** Use `@/` para facilitar tree-shaking
- **Componentes:** Evite re-renders desnecessários com `memo` quando apropriado

### Referências de Documentação
- **Checklist Desenvolvimento:** Ver `docs/planning/CHECKLIST_DESENVOLVIMENTO_COMPLETO.md`
- **Integração OS 10/11/12:** Ver `docs/planning/INTEGRACAO_OS_10_11_12_SUPABASE.md`
- **Regras de Negócio:** Ver `docs/sistema/REGRAS_NEGOCIO_FUNCIONALIDADES.md`
- **Todas as OS e Etapas:** Ver `docs/sistema/TODAS_OS_E_ETAPAS.md`
- **Audit Completo:** Ver `COMPONENT_AUDIT.md`
- **Plano de Limpeza:** Ver `COMPONENT_CLEANUP_PLAN.md`
- **Análise de Código Morto:** Ver `UNUSED_COMPONENTS_ANALYSIS.md`
