# ANÁLISE DE ARQUITETURA E INFRAESTRUTURA - MINERVA ERP V2

**Data:** 18/11/2025
**Projeto:** Sistema ERP para Gestão de Obras e Assessoria
**Stack:** React 18.3.1 + Vite 6.3.5 + TypeScript + Tailwind CSS v4 + Supabase

---

## 1. MAPA VISUAL DA ARQUITETURA ATUAL

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MINERVA ERP V2 - ARQUITETURA                     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ CAMADA DE ENTRADA                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  index.html → /src/main.tsx → App.tsx (AuthProvider + Router)          │
│                                ↓                                        │
│                      [ 208 arquivos TS/TSX ]                            │
└─────────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ CAMADA DE APRESENTAÇÃO (Presentation Layer)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  /src/app/ - PÁGINAS POR PERFIL (Feature-Based)                        │
│  ├── colaborador/           [6 páginas]                                │
│  ├── gestor-assessoria/     [3 páginas]                                │
│  └── gestor-obras/          [3 páginas]                                │
│                                                                         │
│  /src/components/ - COMPONENTES UI (Domain-Driven) [167 arquivos]      │
│  ├── ui/                    [47 componentes shadcn/ui]                 │
│  ├── os/                    [64 componentes de workflow]               │
│  ├── dashboard/             [10 componentes]                           │
│  ├── financeiro/            [8 componentes]                            │
│  ├── calendario/            [7 componentes]                            │
│  ├── layout/                [5 componentes]                            │
│  ├── colaboradores/         [4 componentes]                            │
│  ├── comercial/             [4 componentes]                            │
│  ├── delegacao/             [4 componentes]                            │
│  ├── obras/                 [3 componentes]                            │
│  ├── clientes/              [2 componentes]                            │
│  ├── assessoria/            [2 componentes]                            │
│  └── [outros módulos]       [7 componentes]                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ CAMADA DE LÓGICA DE NEGÓCIO (Business Logic Layer)                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  /src/lib/contexts/                                                     │
│  └── auth-context.tsx       [Gerenciamento de autenticação]            │
│                                                                         │
│  /src/lib/hooks/                                                        │
│  ├── use-api.ts            [Hook para chamadas API]                    │
│  ├── use-clientes.tsx      [Gestão de clientes]                        │
│  ├── use-etapas.ts         [Gestão de etapas de workflow]              │
│  ├── use-ordens-servico.ts [Gestão de ordens de serviço]               │
│  └── use-permissoes.ts     [Controle de permissões]                    │
│                                                                         │
│  /src/lib/utils/                                                        │
│  ├── date-utils.ts         [Manipulação de datas]                      │
│  ├── safe-toast.ts         [Notificações]                              │
│  └── supabase-storage.ts   [Gestão de storage]                         │
│                                                                         │
│  /src/lib/ [Mock Data - Modo Frontend-Only]                            │
│  ├── mock-data.ts              [20KB - Dados principais]               │
│  ├── mock-data-colaborador.ts [32KB - Dados colaborador]               │
│  ├── mock-data-comercial.ts   [29KB - Dados comercial]                 │
│  └── mock-data-gestores.ts    [12KB - Dados gestores]                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ CAMADA DE ACESSO A DADOS (Data Access Layer)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  /src/lib/api-client.ts                                                │
│  ├── clientesAPI            [CRUD de clientes/leads]                   │
│  ├── ordensServicoAPI       [CRUD de ordens de serviço]                │
│  ├── tiposOSAPI             [Tipos de OS]                              │
│  └── healthCheck            [Health check da API]                      │
│                                                                         │
│  MODO: FRONTEND_ONLY_MODE = false (Backend habilitado)                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ CAMADA DE BACKEND (Supabase)                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Supabase Project: zxfevlkssljndqqhxkjb                                │
│  API URL: https://zxfevlkssljndqqhxkjb.supabase.co                     │
│                                                                         │
│  /src/supabase/functions/server/                                       │
│  ├── index.tsx              [Função serverless principal]              │
│  ├── kv_store.tsx           [Key-value store]                          │
│  └── deno.json              [Config Deno runtime]                      │
│                                                                         │
│  Edge Function: /functions/v1/make-server-5ad7fd2c                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ CAMADA DE PERSISTÊNCIA (Database)                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Supabase PostgreSQL Database                                          │
│  ├── Tabela: clientes                                                  │
│  ├── Tabela: ordens_servico                                            │
│  ├── Tabela: etapas                                                    │
│  ├── Tabela: tipos_os                                                  │
│  └── [Schema detalhado em DATABASE_SCHEMA.md]                          │
│                                                                         │
│  Migrações SQL:                                                        │
│  ├── FIX_ALL_ENUMS_AGORA.sql                                           │
│  ├── FIX_BANCO_AGORA.sql                                               │
│  ├── FIX_CLIENTE_STATUS_ENUM.sql                                       │
│  ├── FIX_URGENT_CLIENTE_STATUS.sql                                     │
│  └── FIX_URGENT_TIPO_CLIENTE.sql                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ CAMADA DE ESTILIZAÇÃO                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Tailwind CSS v4 (278KB compilado)                                     │
│  ├── /src/index.css                [Tailwind principal - 278KB]        │
│  ├── /src/styles/globals.css       [Estilos globais - 27KB]            │
│  ├── /src/styles/components.css    [Componentes - 12KB]                │
│  ├── /src/styles/variables.css     [Variáveis CSS - 6KB]               │
│  └── /src/styles/workflow-animations.css [Animações - 4KB]             │
│                                                                         │
│  Sistema de Design: shadcn/ui + Radix UI (25+ pacotes)                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ SISTEMA DE BUILD E DEPLOY                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Build Tool: Vite 6.3.5                                                │
│  ├── Target: esnext                                                    │
│  ├── Output: /build                                                    │
│  ├── Dev Server: Port 3000 (auto-open)                                 │
│  └── Plugin: @vitejs/plugin-react-swc (Fast Refresh)                   │
│                                                                         │
│  Scripts NPM:                                                          │
│  ├── npm run dev    → Desenvolvimento (port 3000)                      │
│  └── npm run build  → Build de produção                                │
│                                                                         │
│  CI/CD: ❌ NÃO CONFIGURADO                                             │
│  Docker: ❌ NÃO CONFIGURADO                                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. PONTOS CRÍTICOS DE ESCALABILIDADE

### 🔴 CRÍTICO - ALTO IMPACTO

#### 2.1 SEGURANÇA: Credenciais Hardcoded no Repositório
**Localização:** `/src/utils/supabase/info.tsx`

```typescript
export const projectId = "zxfevlkssljndqqhxkjb"
export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Impacto:**
- ⚠️ Chave pública do Supabase exposta no código-fonte
- ⚠️ Project ID exposto no repositório
- ⚠️ Violação de boas práticas de segurança
- ⚠️ Risco de abuso da API se repositório for público

**Prioridade:** 🔴 URGENTE

---

#### 2.2 BUNDLE SIZE: CSS Compilado Muito Pesado
**Problema:** Arquivo `/src/index.css` com 278KB compilado

**Impacto:**
- 📊 First Contentful Paint (FCP) aumentado
- 📊 Tempo de carregamento inicial elevado
- 📊 Desperdício de banda para mobile
- 📊 Tailwind CSS v4 sem tree-shaking efetivo

**Medição:**
```bash
du -sh /home/user/Minervav2/src/index.css
278K    /home/user/Minervav2/src/index.css
```

**Prioridade:** 🔴 ALTA

---

#### 2.3 CODE SPLITTING: Ausência Completa de Lazy Loading
**Problema:** Nenhum componente usa `React.lazy()` ou `dynamic import()`

**Impacto:**
- 📦 Bundle JavaScript monolítico
- 📦 167 componentes carregados de uma só vez
- 📦 Tempo de inicialização elevado
- 📦 Desperdício de recursos em rotas não acessadas

**Evidência:**
```bash
# Busca por lazy loading
grep -r "React.lazy\|lazy(" src/
# Resultado: Nenhum arquivo encontrado
```

**Prioridade:** 🔴 ALTA

---

#### 2.4 AUSÊNCIA DE TypeScript Config
**Problema:** Não há `tsconfig.json` explícito no projeto

**Impacto:**
- ❌ Compilação TypeScript depende de padrões do Vite
- ❌ Sem controle sobre strict mode, target, libs
- ❌ Dificulta configuração de path aliases customizados
- ❌ Sem validação rigorosa de tipos

**Prioridade:** 🟡 MÉDIA

---

#### 2.5 AUSÊNCIA DE Linters e Formatters
**Problema:** Sem ESLint, Prettier, ou qualquer ferramenta de qualidade de código

**Impacto:**
- ❌ Inconsistência de estilo de código
- ❌ Sem validação estática de erros comuns
- ❌ Dificulta code review
- ❌ Aumenta débito técnico

**Evidência:**
```bash
# Arquivos ausentes
.eslintrc.js    ❌
.prettierrc     ❌
.editorconfig   ❌
```

**Prioridade:** 🟡 MÉDIA

---

### 🟠 IMPORTANTE - MÉDIO IMPACTO

#### 2.6 AUSÊNCIA DE Testes Automatizados
**Problema:** Nenhuma configuração de testes (Jest, Vitest, React Testing Library)

**Impacto:**
- ⚠️ Sistema de 167 componentes sem cobertura de testes
- ⚠️ Refatorações arriscadas
- ⚠️ Regressões não detectadas
- ⚠️ Dificulta manutenção a longo prazo

**Prioridade:** 🟠 MÉDIA-ALTA

---

#### 2.7 CI/CD: Ausência Completa de Pipeline
**Problema:** Nenhuma automação de build/deploy

**Impacto:**
- 🔧 Deploys manuais propensos a erro
- 🔧 Sem validação de build em PRs
- 🔧 Sem ambiente de staging
- 🔧 Escalabilidade da equipe comprometida

**Evidência:**
```bash
# Arquivos ausentes
.github/workflows/    ❌
.gitlab-ci.yml        ❌
vercel.json           ❌
netlify.toml          ❌
```

**Prioridade:** 🟠 MÉDIA

---

#### 2.8 DOCKERIZAÇÃO: Não Implementada
**Problema:** Ausência de containerização

**Impacto:**
- 🐳 Ambientes de dev inconsistentes ("funciona na minha máquina")
- 🐳 Deploy mais complexo
- 🐳 Dificuldade em escalar horizontalmente
- 🐳 Sem isolamento de dependências

**Prioridade:** 🟠 MÉDIA

---

### 🟢 OTIMIZAÇÕES - BAIXO IMPACTO IMEDIATO

#### 2.9 Versionamento Frouxo de Dependências
**Problema:** Uso de `*` e `^` em package.json

```json
{
  "clsx": "*",
  "date-fns": "*",
  "hono": "*",
  "next": "*",
  "@jsr/supabase__supabase-js": "^2.49.8"
}
```

**Impacto:**
- 🔄 Builds não reproduzíveis
- 🔄 Breaking changes inesperados
- 🔄 Dificulta debugging

**Prioridade:** 🟢 BAIXA

---

#### 2.10 Aliases Vite Redundantes
**Problema:** 51 aliases no `vite.config.ts` (linhas 11-51)

**Impacto:**
- 🔧 Configuração verbosa e difícil de manter
- 🔧 A maioria é redundante (Vite resolve automaticamente)
- 🔧 Arquivo de config com 62 linhas (deveria ter ~20)

**Prioridade:** 🟢 BAIXA

---

## 3. SUGESTÕES DE REFATORAÇÃO ESTRUTURAL

### 3.1 MIGRAÇÃO PARA VARIÁVEIS DE AMBIENTE

**Ação:** Mover credenciais do Supabase para variáveis de ambiente

**Implementação:**
```bash
# 1. Criar arquivo .env na raiz do projeto
VITE_SUPABASE_PROJECT_ID=zxfevlkssljndqqhxkjb
VITE_SUPABASE_PUBLIC_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 2. Adicionar ao .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore

# 3. Criar .env.example para referência da equipe
VITE_SUPABASE_PROJECT_ID=your_project_id_here
VITE_SUPABASE_PUBLIC_ANON_KEY=your_anon_key_here
```

**Refatorar `/src/utils/supabase/info.tsx`:**
```typescript
// ANTES (❌ INSEGURO)
export const projectId = "zxfevlkssljndqqhxkjb"
export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// DEPOIS (✅ SEGURO)
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID
export const publicAnonKey = import.meta.env.VITE_SUPABASE_PUBLIC_ANON_KEY

// Validação em desenvolvimento
if (!projectId || !publicAnonKey) {
  throw new Error('Variáveis de ambiente Supabase não configuradas')
}
```

**Benefícios:**
- ✅ Credenciais fora do repositório
- ✅ Ambientes diferentes (dev, staging, prod)
- ✅ Conformidade com OWASP Top 10

---

### 3.2 IMPLEMENTAÇÃO DE CODE SPLITTING

**Ação:** Implementar lazy loading para componentes pesados

**Estratégia:**
1. **Rotas/Páginas** - Carregar sob demanda
2. **Modais** - Carregar quando abrir
3. **Componentes pesados** - Recharts, calendário, etc

**Implementação:**

```typescript
// /src/App.tsx - REFATORAÇÃO SUGERIDA

import { lazy, Suspense } from 'react';
import { AuthProvider } from './lib/contexts/auth-context';

// Componentes críticos (carregamento imediato)
import Header from './components/layout/header';
import Sidebar from './components/layout/sidebar';
import LoginPage from './components/auth/login-page';

// Lazy loading de páginas por perfil
const ColaboradorDashboard = lazy(() => import('./app/colaborador/dashboard/page'));
const ColaboradorAgenda = lazy(() => import('./app/colaborador/agenda/page'));
const ColaboradorOS = lazy(() => import('./app/colaborador/minhas-os/page'));

const GestorObrasDashboard = lazy(() => import('./app/gestor-obras/dashboard/page'));
const GestorAssessoriaDashboard = lazy(() => import('./app/gestor-assessoria/dashboard/page'));

// Lazy loading de módulos pesados
const FinanceiroDashboard = lazy(() => import('./components/financeiro/financeiro-dashboard-page'));
const CalendarioPage = lazy(() => import('./components/calendario/calendario-page'));
const OSListPage = lazy(() => import('./components/os/os-list-page'));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        {/* Roteamento com lazy loading */}
      </Suspense>
    </AuthProvider>
  );
}
```

**Ganhos Estimados:**
- 📉 Redução de 40-60% no bundle inicial
- 📉 FCP reduzido em 30-50%
- 📉 TTI (Time to Interactive) melhorado

---

### 3.3 OTIMIZAÇÃO DO TAILWIND CSS

**Ação:** Reduzir CSS compilado de 278KB para ~50KB

**Estratégia:**

1. **Configurar PurgeCSS/Content Detection:**
```typescript
// vite.config.ts - ADICIONAR
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
        require('cssnano')({ // Minificação CSS
          preset: ['default', {
            discardComments: { removeAll: true },
            normalizeWhitespace: true,
          }],
        }),
      ],
    },
  },
  // ... resto da config
});
```

2. **Criar `tailwind.config.ts`:**
```typescript
import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // PurgeCSS automático
  ],
  theme: {
    extend: {
      // Apenas customizações necessárias
    },
  },
  plugins: [],
} satisfies Config;
```

3. **Separar CSS crítico:**
```css
/* /src/styles/critical.css - CSS acima da dobra */
/* Carregar inline no <head> */

/* /src/styles/non-critical.css - Resto do CSS */
/* Carregar async */
```

**Ganhos Estimados:**
- 📉 278KB → ~50KB (redução de 82%)
- 📉 LCP (Largest Contentful Paint) melhorado
- 📉 Economia de banda significativa

---

### 3.4 IMPLEMENTAÇÃO DE ARQUITETURA DE MONOREPO (FUTURO)

**Ação:** Preparar para escalar com múltiplos apps

**Estrutura Sugerida:**
```
minerva-monorepo/
├── apps/
│   ├── erp-web/              # App principal (atual)
│   ├── portal-cliente/       # Portal separado para clientes
│   ├── mobile-app/           # App mobile futuro
│   └── admin-panel/          # Painel administrativo
├── packages/
│   ├── ui/                   # Design system compartilhado
│   ├── api-client/           # Cliente API compartilhado
│   ├── types/                # Tipos TypeScript compartilhados
│   └── utils/                # Utilitários compartilhados
├── pnpm-workspace.yaml
└── turbo.json
```

**Ferramentas:**
- 🏗️ Turborepo ou Nx
- 🏗️ pnpm workspaces
- 🏗️ Changesets para versionamento

**Benefícios:**
- ✅ Reutilização de código entre apps
- ✅ Build cache compartilhado
- ✅ Deploys independentes
- ✅ Escalabilidade da equipe

---

### 3.5 REESTRUTURAÇÃO DE COMPONENTES OS (Ordens de Serviço)

**Problema Atual:** 64 componentes em `/src/components/os/` sem organização clara

**Refatoração Sugerida:**
```
components/os/
├── core/                     # Componentes base
│   ├── OSListPage.tsx
│   ├── OSDetailsPage.tsx
│   ├── OSCreationHub.tsx
│   └── OSCard.tsx
│
├── workflows/                # Workflows por tipo de OS
│   ├── OS07/
│   │   ├── WorkflowPage.tsx
│   │   └── steps/
│   │       ├── Step1.tsx
│   │       └── Step2.tsx
│   ├── OS08/
│   │   ├── WorkflowPage.tsx
│   │   └── steps/
│   │       ├── IdentificacaoSolicitante.tsx
│   │       ├── AtribuirCliente.tsx
│   │       └── [+5 steps]
│   ├── OS09/
│   └── OS13/
│       ├── WorkflowPage.tsx
│       └── steps/
│           ├── DadosCliente.tsx
│           ├── AnexarART.tsx
│           └── [+11 steps]
│
├── shared/                   # Steps compartilhados
│   ├── UploadDocumentos.tsx
│   ├── AgendarVisita.tsx
│   └── RealizarVisita.tsx
│
└── types/                    # Tipos TypeScript
    ├── workflow.types.ts
    └── os.types.ts
```

**Benefícios:**
- ✅ Navegação mais intuitiva
- ✅ Code splitting por workflow
- ✅ Reutilização de steps compartilhados
- ✅ Manutenção simplificada

---

### 3.6 SEPARAÇÃO DE MOCK DATA PARA AMBIENTE DE DEV

**Problema:** 93KB de mock data (4 arquivos) em `/src/lib/`

**Refatoração:**
```
src/
├── lib/
│   └── [arquivos de lógica de negócio]
│
└── __mocks__/                # Nova pasta
    ├── data/
    │   ├── mock-usuarios.ts
    │   ├── mock-colaborador.ts
    │   ├── mock-comercial.ts
    │   └── mock-gestores.ts
    └── handlers/             # MSW handlers para testes
        ├── auth.handlers.ts
        └── os.handlers.ts
```

**Configurar MSW (Mock Service Worker):**
```typescript
// src/__mocks__/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// Iniciar apenas em dev
if (import.meta.env.DEV) {
  worker.start();
}
```

**Benefícios:**
- ✅ Mock data fora do bundle de produção
- ✅ Testes mais robustos
- ✅ Dev experience melhorada

---

## 4. CHECKLIST DE MELHORIAS DE INFRAESTRUTURA

### 🔒 SEGURANÇA (Prioridade 1)

- [ ] **ENV-001:** Migrar credenciais Supabase para variáveis de ambiente
  - [ ] Criar arquivo `.env` na raiz
  - [ ] Adicionar `.env` ao `.gitignore`
  - [ ] Criar `.env.example` para documentação
  - [ ] Refatorar `/src/utils/supabase/info.tsx`
  - [ ] Validar variáveis em tempo de build
  - [ ] Documentar processo no README

- [ ] **ENV-002:** Implementar validação de variáveis de ambiente
  - [ ] Criar `src/config/env.ts` com validação
  - [ ] Usar biblioteca como `zod` ou `envalid`
  - [ ] Falhar build se variáveis faltando

- [ ] **SEC-001:** Implementar Content Security Policy (CSP)
  - [ ] Adicionar CSP headers no index.html
  - [ ] Configurar CSP no servidor de produção

- [ ] **SEC-002:** Configurar CORS adequadamente
  - [ ] Revisar políticas de CORS nas Edge Functions
  - [ ] Whitelist de domínios permitidos

---

### ⚡ PERFORMANCE (Prioridade 1)

- [ ] **PERF-001:** Implementar Code Splitting (Lazy Loading)
  - [ ] Lazy load de rotas/páginas principais
  - [ ] Lazy load de modais e componentes pesados
  - [ ] Lazy load de gráficos (Recharts)
  - [ ] Lazy load de calendário
  - [ ] Implementar Suspense boundaries
  - [ ] Criar skeleton loaders para melhor UX

- [ ] **PERF-002:** Otimizar Tailwind CSS
  - [ ] Criar `tailwind.config.ts` com purge
  - [ ] Configurar cssnano para minificação
  - [ ] Separar CSS crítico vs não-crítico
  - [ ] Meta: Reduzir de 278KB para <50KB

- [ ] **PERF-003:** Implementar Bundle Analysis
  - [ ] Instalar `rollup-plugin-visualizer`
  - [ ] Adicionar script `npm run analyze`
  - [ ] Identificar chunks grandes
  - [ ] Documentar tamanhos de bundle

- [ ] **PERF-004:** Otimizar Assets Estáticos
  - [ ] Comprimir imagem PNG (452KB em `/src/assets`)
  - [ ] Implementar lazy loading de imagens
  - [ ] Considerar WebP/AVIF para imagens

- [ ] **PERF-005:** Implementar Service Worker para Cache
  - [ ] PWA básico com Workbox
  - [ ] Cache de assets estáticos
  - [ ] Estratégia cache-first para CSS/JS

---

### 🛠️ QUALIDADE DE CÓDIGO (Prioridade 2)

- [ ] **QA-001:** Configurar TypeScript Rigoroso
  - [ ] Criar `tsconfig.json` explícito
  - [ ] Habilitar `strict: true`
  - [ ] Configurar `paths` para aliases
  - [ ] Configurar `include` e `exclude`

- [ ] **QA-002:** Implementar ESLint
  - [ ] Instalar `eslint` e `@typescript-eslint`
  - [ ] Configurar regras para React/TypeScript
  - [ ] Adicionar script `npm run lint`
  - [ ] Integrar com pre-commit hook

- [ ] **QA-003:** Implementar Prettier
  - [ ] Instalar `prettier`
  - [ ] Criar `.prettierrc`
  - [ ] Configurar integração com ESLint
  - [ ] Adicionar script `npm run format`

- [ ] **QA-004:** Configurar Husky + lint-staged
  - [ ] Pre-commit: lint + format
  - [ ] Pre-push: type-check
  - [ ] Commit-msg: validar conventional commits

- [ ] **QA-005:** Implementar Testes Automatizados
  - [ ] Configurar Vitest
  - [ ] Configurar React Testing Library
  - [ ] Testes unitários para hooks
  - [ ] Testes de integração para fluxos críticos
  - [ ] Meta: 80% de cobertura

---

### 🚀 CI/CD (Prioridade 2)

- [ ] **CI-001:** Configurar GitHub Actions
  - [ ] Workflow: Build e Type-check
  - [ ] Workflow: Lint
  - [ ] Workflow: Testes
  - [ ] Workflow: Deploy Preview (Vercel/Netlify)

- [ ] **CI-002:** Implementar Ambientes
  - [ ] Ambiente: Development (auto-deploy de `dev`)
  - [ ] Ambiente: Staging (auto-deploy de `staging`)
  - [ ] Ambiente: Production (manual approval)

- [ ] **CI-003:** Configurar Deploy Automatizado
  - [ ] Integração com Vercel ou Netlify
  - [ ] Preview deployments em PRs
  - [ ] Deploy de produção em merge para `main`

- [ ] **CI-004:** Implementar Checks de PR
  - [ ] Status check: Build success
  - [ ] Status check: Tests passing
  - [ ] Status check: Lint passing
  - [ ] Status check: Type-check passing
  - [ ] Bloquear merge se checks falharem

---

### 🐳 CONTAINERIZAÇÃO (Prioridade 3)

- [ ] **DOCKER-001:** Criar Dockerfile Multi-stage
  ```dockerfile
  # Stage 1: Build
  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build

  # Stage 2: Production
  FROM nginx:alpine
  COPY --from=builder /app/build /usr/share/nginx/html
  COPY nginx.conf /etc/nginx/nginx.conf
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
  ```

- [ ] **DOCKER-002:** Criar docker-compose.yml para Dev
  ```yaml
  version: '3.8'
  services:
    app:
      build: .
      ports:
        - "3000:3000"
      volumes:
        - ./src:/app/src
      environment:
        - VITE_SUPABASE_PROJECT_ID=${VITE_SUPABASE_PROJECT_ID}
  ```

- [ ] **DOCKER-003:** Configurar .dockerignore
  - [ ] Excluir `node_modules`, `.git`, `build`

- [ ] **DOCKER-004:** Documentar setup com Docker
  - [ ] README com instruções de build
  - [ ] Instruções de execução local

---

### 📦 GESTÃO DE DEPENDÊNCIAS (Prioridade 3)

- [ ] **DEP-001:** Lock de Versões Exatas
  - [ ] Substituir `*` por versões exatas
  - [ ] Substituir `^` por versões exatas (ou usar ranges específicos)
  - [ ] Gerar `package-lock.json` atualizado

- [ ] **DEP-002:** Auditoria de Segurança
  - [ ] Executar `npm audit`
  - [ ] Corrigir vulnerabilidades encontradas
  - [ ] Configurar GitHub Dependabot

- [ ] **DEP-003:** Limpeza de Aliases Vite
  - [ ] Remover aliases redundantes em `vite.config.ts`
  - [ ] Manter apenas aliases customizados essenciais
  - [ ] Reduzir config de 62 linhas para ~30 linhas

- [ ] **DEP-004:** Migrar para pnpm (Opcional)
  - [ ] Economizar espaço em disco
  - [ ] Builds mais rápidos
  - [ ] Melhor gestão de monorepo (se migrar)

---

### 📊 MONITORAMENTO E OBSERVABILIDADE (Prioridade 4)

- [ ] **OBS-001:** Implementar Error Tracking
  - [ ] Integração com Sentry
  - [ ] Captura de erros React (ErrorBoundary)
  - [ ] Source maps para stack traces

- [ ] **OBS-002:** Implementar Analytics
  - [ ] Google Analytics ou Plausible
  - [ ] Tracking de eventos críticos
  - [ ] Análise de fluxos de conversão

- [ ] **OBS-003:** Implementar Performance Monitoring
  - [ ] Web Vitals tracking
  - [ ] Lighthouse CI integration
  - [ ] Alertas para degradação de performance

- [ ] **OBS-004:** Implementar Logging Estruturado
  - [ ] Biblioteca de logging (pino, winston)
  - [ ] Níveis de log adequados
  - [ ] Integração com CloudWatch/Datadog

---

### 📚 DOCUMENTAÇÃO (Prioridade 4)

- [ ] **DOC-001:** Documentação de Arquitetura
  - [ ] Diagrama C4 Model (Context, Container, Component)
  - [ ] ADRs (Architecture Decision Records)
  - [ ] Documentação de fluxos críticos

- [ ] **DOC-002:** Documentação de Setup
  - [ ] README.md atualizado e completo
  - [ ] Instruções de instalação
  - [ ] Variáveis de ambiente documentadas
  - [ ] Troubleshooting comum

- [ ] **DOC-003:** Documentação de Deploy
  - [ ] Guia de deploy para produção
  - [ ] Rollback procedures
  - [ ] Disaster recovery plan

- [ ] **DOC-004:** Documentação de Componentes
  - [ ] Storybook para design system
  - [ ] Props documentation
  - [ ] Exemplos de uso

---

## 5. ROADMAP DE IMPLEMENTAÇÃO (3 MESES)

### 🗓️ MÊS 1 - FUNDAÇÕES CRÍTICAS

**Semana 1-2: Segurança e Configuração Base**
- ✅ ENV-001: Migrar credenciais para variáveis de ambiente
- ✅ ENV-002: Validação de variáveis de ambiente
- ✅ QA-001: Configurar TypeScript rigoroso
- ✅ QA-002: Implementar ESLint
- ✅ QA-003: Implementar Prettier
- ✅ QA-004: Configurar Husky + lint-staged

**Semana 3-4: Performance Crítica**
- ✅ PERF-001: Implementar Code Splitting (páginas principais)
- ✅ PERF-002: Otimizar Tailwind CSS
- ✅ PERF-003: Bundle Analysis

**Entregáveis:**
- 🎯 Credenciais fora do repositório
- 🎯 Linters e formatters funcionando
- 🎯 Bundle inicial reduzido em 40%

---

### 🗓️ MÊS 2 - QUALIDADE E AUTOMAÇÃO

**Semana 5-6: Testes e CI**
- ✅ QA-005: Configurar Vitest + RTL
- ✅ QA-005: Testes para hooks críticos
- ✅ CI-001: GitHub Actions básico
- ✅ CI-002: Ambientes (dev, staging, prod)

**Semana 7-8: Deploy Automatizado**
- ✅ CI-003: Deploy automatizado
- ✅ CI-004: PR checks
- ✅ DOCKER-001: Dockerfile multi-stage
- ✅ DOCKER-002: docker-compose para dev

**Entregáveis:**
- 🎯 Cobertura de testes básica (>50%)
- 🎯 Pipeline CI/CD funcionando
- 🎯 Deploy automático em ambientes

---

### 🗓️ MÊS 3 - ESCALA E OBSERVABILIDADE

**Semana 9-10: Performance Avançada**
- ✅ PERF-001: Code splitting completo
- ✅ PERF-004: Otimização de assets
- ✅ PERF-005: Service Worker + PWA

**Semana 11-12: Monitoramento**
- ✅ OBS-001: Error tracking (Sentry)
- ✅ OBS-002: Analytics
- ✅ OBS-003: Performance monitoring
- ✅ DOC-001: Documentação de arquitetura

**Entregáveis:**
- 🎯 Bundle otimizado (<200KB inicial)
- 🎯 Monitoramento de produção ativo
- 🎯 Documentação completa

---

## 6. MÉTRICAS DE SUCESSO

### Performance
- ✅ FCP (First Contentful Paint) < 1.5s
- ✅ LCP (Largest Contentful Paint) < 2.5s
- ✅ TTI (Time to Interactive) < 3.5s
- ✅ Bundle size inicial < 200KB (gzipped)
- ✅ Lighthouse Score > 90

### Qualidade
- ✅ Cobertura de testes > 80%
- ✅ Zero vulnerabilidades críticas
- ✅ ESLint zero errors
- ✅ TypeScript strict mode habilitado

### Operacional
- ✅ Deploy time < 5 minutos
- ✅ Zero downtime em deploys
- ✅ MTTR (Mean Time to Recovery) < 30 minutos
- ✅ Error rate < 0.1%

---

## 7. CUSTOS ESTIMADOS

### Ferramentas (Custo Mensal)
- **Sentry (Error Tracking):** $26/mês (plano Team)
- **Vercel (Hosting):** $20/mês (plano Pro) ou $0 (plano Hobby)
- **GitHub Actions:** Incluído no plano GitHub
- **Total:** ~$46/mês ou ~$26/mês (se usar Vercel Hobby)

### Tempo de Implementação
- **Mês 1:** 80 horas (1 dev full-time)
- **Mês 2:** 80 horas (1 dev full-time)
- **Mês 3:** 60 horas (0.75 dev full-time)
- **Total:** 220 horas (~1.5 meses de 1 dev)

---

## 8. RISCOS E MITIGAÇÕES

### Risco 1: Breaking Changes em Refatoração
**Probabilidade:** Alta
**Impacto:** Alto
**Mitigação:**
- Implementar testes ANTES de refatorar
- Refatorações incrementais com feature flags
- Code review rigoroso
- QA manual em staging

### Risco 2: Performance Regression
**Probabilidade:** Média
**Impacto:** Alto
**Mitigação:**
- Lighthouse CI em todos os PRs
- Performance budgets configurados
- Monitoramento de Web Vitals em produção

### Risco 3: Complexidade de Manutenção
**Probabilidade:** Média
**Impacto:** Médio
**Mitigação:**
- Documentação completa
- Treinamento da equipe
- Pair programming em features críticas

---

## 9. CONCLUSÃO

O projeto **Minerva ERP v2** possui uma **base arquitetural sólida** com separação clara de responsabilidades e uso de tecnologias modernas (React 18, Vite, TypeScript, Supabase). No entanto, apresenta **gaps críticos de infraestrutura** que limitam escalabilidade, segurança e performance:

### 🔴 URGENTE
1. Credenciais hardcoded (risco de segurança)
2. Bundle size excessivo (278KB CSS + bundle monolítico)
3. Ausência de code splitting (todos os 167 componentes carregados de uma vez)

### 🟠 IMPORTANTE
4. Falta de testes automatizados
5. Ausência de CI/CD
6. Sem containerização (Docker)

### 🟢 RECOMENDADO
7. Linters e formatters
8. Monitoramento e observabilidade
9. Documentação técnica

**Próximos Passos Imediatos:**
1. ✅ Migrar credenciais para `.env` (1 dia)
2. ✅ Implementar code splitting básico (3 dias)
3. ✅ Otimizar Tailwind CSS (2 dias)
4. ✅ Configurar ESLint + Prettier (1 dia)
5. ✅ Setup GitHub Actions básico (2 dias)

**Total:** ~2 semanas para resolver os bloqueios críticos e estabelecer fundações para escala.

---

**Gerado em:** 18/11/2025
**Autor:** Análise Automatizada de Arquitetura
**Versão:** 1.0.0
