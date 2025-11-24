# CLAUDE.md - Diretrizes do Projeto MinervaV2

> **FOCO ATUAL:** Estabilidade, Produção e Eliminação de Dívida Técnica.
> **REGRA DE OURO:** Não use dados mockados para novas funcionalidades. Conecte ao Supabase.

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

## 📐 Padrões de Arquitetura e Código

### 1. Roteamento e Navegação (TanStack Router)
- **File-Based**: A estrutura de pastas em `src/routes` define a URL.
- **Links**: Use `<Link to="...">`. Evite `<a>` ou `window.location`.
- **Navegação Imperativa**:
  ```typescript
  const navigate = useNavigate()
  navigate({ to: '/os/$osId', params: { osId: '123' } })
## 📝 Convenções de Código (Atualizado 2025-11-23)

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
│   ├── layout/       # Layout components
│   └── ...           # Feature-based folders
├── lib/
│   ├── hooks/        # Custom hooks
│   ├── types/        # TypeScript types
│   ├── utils/        # Utility functions
│   └── validations/  # Zod schemas
├── routes/           # TanStack Router (file-based)
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

### Referências
- **Audit Completo:** Ver `COMPONENT_AUDIT.md`
- **Plano de Limpeza:** Ver `COMPONENT_CLEANUP_PLAN.md`
- **Análise de Código Morto:** Ver `UNUSED_COMPONENTS_ANALYSIS.md`
