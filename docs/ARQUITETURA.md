# 02 - Arquitetura Técnica

> **Template**: Preencha este documento com a arquitetura específica do seu projeto

## 🏗️ Visão Geral da Arquitetura

O **Sistema Minerva v2** utiliza uma arquitetura moderna baseada em **React + TypeScript + Vite** para o frontend, com **Supabase** como Backend-as-a-Service completo. A aplicação segue uma arquitetura component-driven com foco em type safety extrema e performance otimizada. A comunicação com o banco de dados acontece através do cliente Supabase, com Row Level Security (RLS) garantindo segurança granular dos dados.

O sistema implementa duas bibliotecas de calendário distintas: **Schedule-X** para a visualização principal e **FullCalendar** para workflows específicos de OS. A arquitetura prioriza a experiência do desenvolvedor (DX) com ferramentas modernas como TanStack Router para roteamento type-safe, shadcn/ui para componentes consistentes, e uma pipeline de build otimizada com Vite.

A aplicação é construída seguindo princípios de **Atomic Design** para organização de componentes, **Custom Hooks** para lógica reutilizável, e **Real-time subscriptions** para sincronização automática de dados. O deployment é realizado na **Vercel** com integração contínua via GitHub Actions.

## 📊 Diagrama de Arquitetura

```
┌─────────────────────────────────┐
│         Browser                 │
│  (Chrome, Firefox, Safari, etc) │
└─────────────┬───────────────────┘
              │ HTTPS/WebSocket
              ▼
┌─────────────────────────────────────────────────────────────┐
│                Vercel Edge Network                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │            Vite + React Application                    │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │         Client Components (SPA)                  │  │  │
│  │  │  ┌────────────────────────────────────────────┐  │  │  │
│  │  │  │  • Calendário (Schedule-X)                 │  │  │  │
│  │  │  │  • Formulários (React Hook Form)           │  │  │  │
│  │  │  │  • Dashboard (Recharts)                     │  │  │  │
│  │  │  │  • Modais (Radix UI)                        │  │  │  │
│  │  │  └────────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │ Supabase Client
                      │ (Auth + PostgreSQL + Storage)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 Supabase Platform                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           PostgreSQL Database                          │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  • Tabelas: turnos, agendamentos, os, etc       │  │  │
│  │  │  • Row Level Security (RLS)                     │  │  │
│  │  │  • Indexes otimizados                           │  │  │
│  │  │  └──────────────────────────────────────────────┘  │  │
│  │  └────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           Authentication (Auth)                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  • JWT + Refresh Tokens                         │  │  │
│  │  │  • OAuth providers (Google, GitHub)             │  │  │
│  │  │  • Password recovery                            │  │  │
│  │  │  └──────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           Real-time Engine                             │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  • WebSocket connections                         │  │  │
│  │  │  • Live subscriptions                            │  │  │
│  │  │  • Broadcast updates                             │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           Storage (File Upload)                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  • Documentos PDF                                │  │  │
│  │  │  • Imagens de perfil                              │  │  │
│  │  │  • Anexos de OS                                  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           Edge Functions (Serverless)                  │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  • Geração de PDF                                │  │  │
│  │  │  • Processamento de webhooks                      │  │  │
│  │  │  • APIs customizadas                             │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

## 🎯 Princípios Arquiteturais

### 1. Type Safety First
- **TypeScript strict mode** habilitado em todas as configurações
- **Tipos gerados automaticamente** do Supabase (schema types)
- **Validação com Zod** em todos os formulários e APIs
- **TanStack Router** com roteamento type-safe
- **Zero `any` types** permitidos no codebase
- **IntelliSense completo** em toda a aplicação

### 2. Component-Driven Architecture
- **Atomic Design** para organização de componentes
- **shadcn/ui** como sistema de design consistente
- **Composition Pattern** para flexibilidade máxima
- **Custom Hooks** para lógica reutilizável
- **Memoização** com React.memo para performance
- **Lazy Loading** de componentes pesados

### 3. Real-time & Performance
- **Supabase Real-time** para sincronização automática
- **Vite HMR** para desenvolvimento ultra-rápido
- **Code Splitting** automático por rotas
- **Bundle optimization** com tree-shaking
- **Edge Functions** para serverless computing
- **Database indexes** otimizados para queries

### 4. Security & Reliability
- **Row Level Security (RLS)** em todas as tabelas
- **JWT Authentication** com refresh tokens
- **Input sanitization** com validação client/server
- **HTTPS obrigatório** em produção
- **Secrets management** via variáveis de ambiente
- **Error boundaries** e monitoring com Sentry

## 📁 Estrutura de Pastas

```
minerva-v2/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rotas autenticadas (grupo de layout)
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # /dashboard
│   │   │   └── loading.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx          # /projects
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # /projects/[id]
│   │   │   └── new/
│   │   │       └── page.tsx      # /projects/new
│   │   └── layout.tsx            # Layout com auth required
│   │
│   ├── (public)/                 # Rotas públicas
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts
│   │   └── webhooks/
│   │       └── route.ts
│   │
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   ├── globals.css               # Global styles
│   └── error.tsx                 # Error boundary
│
├── components/                   # React Components
│   ├── ui/                       # Shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── auth/                     # Auth-related components
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   └── logout-button.tsx
│   ├── projects/                 # Project-related components
│   │   ├── project-card.tsx
│   │   ├── project-form.tsx
│   │   └── project-list.tsx
│   └── shared/                   # Shared components
│       ├── header.tsx
│       ├── footer.tsx
│       └── sidebar.tsx
│
├── lib/                          # Utilities & configurations
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Middleware client
│   ├── utils/
│   │   ├── cn.ts                 # Class name utility
│   │   ├── format-date.ts
│   │   └── format-currency.ts
│   ├── validations/              # Zod schemas
│   │   ├── auth.ts
│   │   ├── project.ts
│   │   └── task.ts
│   └── constants.ts              # App constants
│
├── types/                        # TypeScript types
│   ├── database.types.ts         # Gerado do Supabase
│   ├── api.types.ts
│   └── index.ts
│
├── hooks/                        # Custom React hooks
│   ├── use-user.ts               # Current user hook
│   ├── use-projects.ts           # Projects data hook
│   └── use-toast.ts              # Toast notifications
│
├── middleware.ts                 # Next.js middleware (auth)
├── tailwind.config.ts            # Tailwind configuration
├── next.config.js                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json
```

## 🔐 Camada de Autenticação

### Fluxo de Autenticação

```
1. Usuário acessa /login (rota pública)
2. Preenche email/senha no formulário React Hook Form
3. Validação Zod no cliente + chamada para Supabase Auth
4. Supabase valida credenciais e retorna JWT + Refresh Tokens
5. Tokens armazenados automaticamente pelo Supabase Client
6. TanStack Router redireciona para dashboard baseado no perfil
7. Todas as queries subsequentes usam RLS com auth.uid()
8. Real-time subscriptions filtram dados por usuário/permissões
```

### Estrutura de Usuário

```typescript
interface User {
  id: string;                    // UUID do auth.users
  email: string;                 // Email único
  nome_completo: string;         // Nome completo
  tipo_colaborador: 'colaborador' | 'gestor_assessoria' | 'gestor_obras' | 'admin';
  avatar_url?: string;           // URL da foto de perfil
  telefone?: string;             // Contato telefônico
  criado_em: string;             // Timestamp de criação
  atualizado_em: string;         // Timestamp de atualização
}
```

### Proteção de Rotas

**Proteção baseada em perfis de usuário:**

```typescript
// src/routes/_auth.tsx (roteamento protegido)
export const Route = createRootRouteWithContext<{
  auth: { user: User | null; loading: boolean }
}>()({
  beforeLoad: ({ context, location }) => {
    if (context.auth.loading) return;
    if (!context.auth.user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href }
      });
    }
  }
});

// src/app/colaborador/_layout.tsx (proteção por perfil)
export function ColaboradorLayout() {
  const { user } = useAuth();

  if (user?.tipo_colaborador !== 'colaborador') {
    return <Navigate to="/unauthorized" />;
  }

  return <Outlet />;
}
```

## 🗄️ Camada de Dados

### Estratégias de Fetching

[PREENCHER]

**Exemplo:**

1. **Server Components (SSR/SSG)**
   ```typescript
   // app/projects/page.tsx
   export default async function ProjectsPage() {
     const supabase = createServerClient();
     const { data: projects } = await supabase
       .from('projects')
       .select('*')
       .order('created_at', { ascending: false });

     return <ProjectList projects={projects} />;
   }
   ```

2. **Client Components (CSR)**
   ```typescript
   'use client';

   export function useProjects() {
     const [projects, setProjects] = useState([]);
     const supabase = createBrowserClient();

     useEffect(() => {
       supabase
         .from('projects')
         .select('*')
         .then(({ data }) => setProjects(data));
     }, []);

     return projects;
   }
   ```

3. **Real-time Subscriptions**
   ```typescript
   'use client';

   useEffect(() => {
     const channel = supabase
       .channel('projects-changes')
       .on('postgres_changes',
         { event: '*', schema: 'public', table: 'projects' },
         (payload) => {
           // Handle changes
         }
       )
       .subscribe();

     return () => { channel.unsubscribe(); };
   }, []);
   ```

### Cache Strategy

[PREENCHER]

**Exemplo:**
- **Static Pages**: ISR com revalidate de 60s para páginas públicas
- **Dynamic Pages**: fetch com cache: 'no-store' para dados do usuário
- **API Routes**: Sem cache para mutations
- **Assets**: Cache de 1 ano com hash no nome

## 🎨 Camada de Apresentação

### Component Patterns

[PREENCHER]

**Exemplo:**

1. **Server Components** (padrão)
   - Fetching de dados
   - Operações assíncronas
   - Sem interatividade

2. **Client Components** ('use client')
   - Hooks (useState, useEffect, etc.)
   - Event handlers
   - Browser APIs

3. **Compound Components**
   ```typescript
   <Card>
     <CardHeader>
       <CardTitle>Título</CardTitle>
     </CardHeader>
     <CardContent>
       Conteúdo
     </CardContent>
   </Card>
   ```

### Estilização

[PREENCHER]

**Exemplo:**
- **Tailwind CSS v4** para utility-first
- **cn()** helper para merge de classes
- **CSS Modules** apenas quando absolutamente necessário
- **Variáveis CSS** para temas

```typescript
// Padrão de estilização
<div className="flex items-center gap-4 p-4 bg-background border rounded-lg hover:shadow-md transition-shadow">
```

## 🔄 Fluxos de Dados Principais

### Exemplo: Criar um Projeto

```
[PREENCHER - Descreva fluxo completo]

Exemplo:

1. [Client] Usuário clica "Novo Projeto"
2. [Client] Modal com form aparece (Client Component)
3. [Client] Usuário preenche e submete
4. [Client] Validação Zod no cliente
5. [Client] POST para Server Action ou API Route
6. [Server] Validação Zod no servidor (novamente)
7. [Server] Verifica auth (middleware)
8. [Server] Insere no Supabase com user_id
9. [Database] RLS valida que user pode inserir
10. [Database] Trigger atualiza updated_at
11. [Server] Retorna sucesso + dados
12. [Client] Atualiza UI (optimistic update)
13. [Client] Mostra toast de sucesso
14. [Client] Navega para /projects/[novo-id]
```

## 📦 Dependências Principais

### Produção
```json
{
  "@fullcalendar/daygrid": "^6.1.19",
  "@fullcalendar/interaction": "^6.1.19",
  "@fullcalendar/react": "^6.1.19",
  "@schedule-x/calendar-controls": "^3.4.2",
  "@schedule-x/react": "^3.4.0",
  "@supabase/supabase-js": "^2.81.1",
  "@tanstack/react-router": "^1.139.0",
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-select": "^2.1.6",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-hook-form": "^7.55.0",
  "zod": "^3.23.8",
  "tailwindcss": "^4.1.17",
  "lucide-react": "^0.487.0",
  "sonner": "^2.0.3"
}
```

### Desenvolvimento
```json
{
  "@vitejs/plugin-react-swc": "^3.10.2",
  "@tanstack/router-plugin": "^1.139.0",
  "@types/react": "^18.3.27",
  "@types/react-dom": "^18.3.7",
  "vite": "6.3.5",
  "vitest": "^4.0.12",
  "playwright": "^1.57.0",
  "typescript": "^5.3.0"
}
```

## 🔧 Configurações Importantes

### TypeScript
[PREENCHER]

**Exemplo:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true
  }
}
```

### Next.js
[PREENCHER]

**Exemplo:**
```javascript
module.exports = {
  experimental: {
    serverActions: true
  },
  images: {
    domains: ['your-supabase-url.supabase.co']
  }
}
```

## 📊 ADRs (Architecture Decision Records)

### ADR-001: Next.js App Router vs Pages Router
[PREENCHER - Documente decisões arquiteturais importantes]

**Exemplo:**
- **Data**: 2024-11-15
- **Status**: Aceito
- **Decisão**: Usar App Router
- **Contexto**: Precisamos escolher entre App Router (novo) e Pages Router (estável)
- **Razões**:
  - Server Components reduzem bundle size
  - Melhor performance de carregamento
  - Streaming nativo
  - Futuro do Next.js
- **Consequências**:
  - Menor quantidade de recursos/tutoriais
  - Algumas bibliotecas podem não ser compatíveis
  - Curva de aprendizado

### ADR-002: [Próxima decisão]
[PREENCHER]

---

**Status**: ✅ **COMPLETAMENTE PREENCHIDO**
**Documento Anterior**: [VISAO-GERAL.md](./VISAO-GERAL.md)
**Próximo Documento**: [ESPECIFICACAO.md](./ESPECIFICACAO.md)
**Última Atualização**: 2025-11-28
**Responsável**: Claude Code (Architect Mode)