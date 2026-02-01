---
trigger: always_on
---

# CLAUDE.md - Diretrizes do Projeto MinervaV2

> **FOCO ATUAL:** Estabilidade, Produção e Eliminação de Dívida Técnica.
> **REGRA DE OURO:** Não use dados mockados para novas funcionalidades. Conecte ao Supabase.

## 📊 Status do Projeto (Atualizado 08/01/2026)

### Supabase - Projeto MinervaV2
- **Project ID**: `zxfevlkssljndqqhxkjb`
- **Região**: sa-east-1
- **Status**: ACTIVE_HEALTHY
- **Edge Functions**: `server` (v12), `generate-pdf` (v7)

### Workflows de OS Implementados

**Total**: 13 tipos de OS | **Status Geral**: ~75% implementado

| OS | Nome | Status | Setor | Rota |
|----|------|--------|-------|------|
| OS-01 a 04 | Obras (Perícia/Revitalização/Reforço) | ⚠️ 95% | Obras | `/os/details-workflow/:id` |
| OS-05, 06 | Assessoria Lead (Mensal/Avulsa) | ⚠️ 95% | Assessoria | `/os/criar/assessoria-lead` |
| OS-07 | Aprovação de Reforma | ⚠️ 95% | Assessoria | `/os/criar/aprovacao-reforma` |
| OS-08 | Visita Técnica / Parecer | ⚠️ 95% | Assessoria | `/os/criar/visita-tecnica` |
| OS-09 | Requisição de Compras | ✅ 95% | Administrativo | `/os/criar/requisicao-compras` |
| OS-10 | Requisição Mão de Obra | ✅ 95% | RH | `/os/criar/requisicao-mao-de-obra` |
| OS-11 | Laudo Pontual Assessoria | ✅ 95% | Assessoria | `/os/criar/laudo-pontual` |
| OS-12 | Assessoria Anual (Contrato) | ⚠️ 95% | Assessoria | `/os/criar/assessoria-recorrente` |
| OS-13 | Start de Contrato de Obra | ✅ 95% | Obras | `/os/criar/start-contrato-obra` |

**Legenda**: ✅ Completo e Testado | ⚠️ Implementado (pendente integração completa Supabase)

### 10 Funções de Colaborador do Sistema
1. `admin` - Administrador (acesso total)
2. `diretor` - Diretoria (gestão executiva)
3. `coord_administrativo` - Coordenador Administrativo
4. `coord_obras` - Coordenador de Obras
5. `coord_assessoria` - Coordenador de Assessoria
6. `operacional_admin` - Operacional Administrativo
7. `operacional_obras` - Operacional de Obras
8. `operacional_assessoria` - Operacional de Assessoria
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

#### Hooks de Dados (CRUD)
- `use-clientes.tsx` - CRUD de clientes (leads e clientes)
- `use-ordens-servico.ts` - CRUD de ordens de serviço
- `use-centro-custo.ts` - Geração de centro de custo (RPC)
- `use-agendamentos.ts` - Agendamentos e turnos
- `use-contratos.ts` - Gestão de contratos
- `use-cliente-contratos.ts` - Contratos específicos do cliente

#### Centro de Custo (CC)

**Nomenclatura**
- **Formato:** `CC{TIPO}{SEQ:3}-{APELIDO}`
- **Exemplos:** `CC13001-SOLAR_I`, `CC09015-JOAO`

**Componente Reutilizável**
```typescript
import { CentroCustoSelector } from '@/components/shared/centro-custo-selector';

<CentroCustoSelector
  value={selectedCCId}
  onChange={(ccId, ccData) => handleChange(ccId)}
  showDetails  // Mostrar card de detalhes
  required     // Campo obrigatório
/>
```

**Uso nas OSs**
- **OS-09/10**: Seleção manual via componente
- **OS-11/12/13**: Geração automática no start do contrato

#### Hooks de Documentos (Upload/Download)
- `use-cliente-documentos.ts` - **Upload de docs do cliente** (RG, CNH, Contrato Social, etc.)
- `use-os-document-upload.ts` - **Upload de docs de OS** (ART, relatórios, fotos, etc.)
- `use-pdf-generation.ts` - Geração de PDFs via Edge Function

#### Hooks de Workflow (Estado e Navegação)
- `use-workflow-state.ts` - **Estado do workflow** (etapas, dados, salvamento)
- `use-workflow-navigation.ts` - **Navegação entre etapas** (avançar, voltar, histórico)
- `use-workflow-completion.ts` - **Validação de completude** das etapas

#### Hooks de Transferência e Notificação
- `use-transferencia-setor.ts` - **Handoffs automáticos** entre setores
- `use-notificar-coordenador.ts` - **Notificações** para coordenadores
- `use-notifications.ts` - Sistema geral de notificações

#### Hooks de Dashboard e Métricas
- `use-dashboard-data.ts` - Dados do dashboard por cargo
- `use-coordinators-workload.ts` - Carga de trabalho dos coordenadores
- `use-executive-metrics.ts` - Métricas executivas (direção)

#### Hooks Auxiliares
- `use-permissoes.ts` - Sistema de permissões por cargo
- `use-os-hierarchy.ts` - Hierarquia de OS (pai/filha)
- `use-viacep.ts` - Integração com ViaCEP
- `use-setores.ts` - Gestão de setores
- `use-tipos-os.ts` - Tipos de OS disponíveis

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
- **Imports:** Use `@/` para facilitar tree-shaking
- **Componentes:** Evite re-renders desnecessários com `m