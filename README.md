# 🏛️ MinervaV2 ERP

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)
![Vite](https://img.shields.io/badge/Vite-6.3-646CFF.svg?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E.svg?logo=supabase)

Sistema ERP corporativo completo para gestão e operação da Minerva Engenharia. O sistema integra a jornada ponta a ponta desde a captação do lead até a execução da obra, passando pela gestão financeira e recursos humanos.

---

## 🚀 Tecnologias e Arquitetura

O projeto abandonou a arquitetura Next.js em favor de uma Single Page Application (SPA) altamente otimizada:

- **Frontend & Roteamento:** React 18.3, [Vite](https://vitejs.dev/) e [TanStack Router](https://tanstack.com/router) (Roteamento baseado em arquivos).
- **Gerenciamento de Estado & Dados:** TanStack Query e Context API.
- **UI & Estilização:** [Tailwind CSS v3.4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives) e Lucide React para ícones.
- **Formulários & Validação:** React Hook Form integrado com Zod.
- **Backend & Banco de Dados:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Edge Functions).
- **Monitoramento & Analytics:** Sentry (Tracing/Error Tracking) e Vercel Analytics.
- **Geração de Documentos:** `@react-pdf/renderer` para relatórios locais e Edge Functions para processamento isolado.
- **Testes:** Vitest para testes unitários e Playwright para testes end-to-end (E2E).

---

## 🧩 Módulos Principais

1. **Ordens de Serviço (OS)** (`docs/ordens-de-servico/README.md`)
   - 13 tipos distintos de fluxos (Obras, Assessoria, Compras, RH).
   - Workflow contínuo com handoffs automáticos entre setores e sistema de aprovações.
2. **Financeiro** (`docs/finance/README.md`)
   - Dashboard analítico e fluxo de caixa.
   - Master ledger unificado conectando OS a Centros de Custo (CC).
   - Conciliação Bancária via automação de mTLS com **Banco Cora** (`lancamentos_bancarios`).
3. **Recursos Humanos (RH)** (`docs/rh/README.md`)
   - Gestão de colaboradores estruturada em Sistema de Permissionamento RBAC (Admin, Diretor, Coordenadores, Operacional).
   - Controle de presença e turnos com alocação automática de custos na DRE.
   - Workflow OS-10 para Requisição de Mão de Obra e Kanban de recrutamento.

---

## 💻 Como Rodar (Desenvolvimento)

### Pré-requisitos
- **Node.js**: v20 ou superior.
- **Gerenciador de Pacotes**: `npm` (utilizado como padrão pelo package.json).
- **Supabase CLI** (Opcional, para geração de types ou rodar o banco de dados localmente).

### 1. Clonar e Instalar
```bash
git clone <URL_DO_REPOSITORIO> minerva-v2
cd minerva-v2
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com base no `.env.example` (se disponível) ou adicione as credenciais essenciais.
```bash
# [TODO: Adicionar outras variáveis de ambiente necessárias (ex: Sentry, Cora)]
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

### 3. Rodar o Servidor de Desenvolvimento
```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:5173`.

---

## 📁 Estrutura de Pastas

A arquitetura do código adota responsabilidade por domínios e separação de lógica via hooks e rotas isoladas:

```
.
├── src/
│   ├── components/         # Componentes React segregados por módulo
│   │   ├── os/             # Componentes de Ordens de Serviço e fluxos
│   │   ├── financeiro/     # Dashboards, conciliação e componentes financeiros
│   │   ├── colaboradores/  # Perfis, controle de presença, OS-10 (RH)
│   │   ├── ui/             # Elementos base construídos com shadcn/ui
│   │   └── shared/         # Componentes compartilhados
│   ├── lib/                # Lógica central e abstrações
│   │   ├── hooks/          # React Hooks contendo regras de negócio (queries/mutations)
│   │   ├── types/          # Definições TypeScript (incluindo supabase.ts gerado)
│   │   ├── utils/          # Funções utilitárias e logger nativo
│   │   └── validations/    # Schemas de validação Zod
│   ├── routes/             # TanStack Router (File-based Routing)
│   │   └── _auth/          # Todas as rotas autenticadas sob este layout
│   └── styles/             # Sistema de Design Minerva (CSS Layers)
├── supabase/
│   ├── functions/          # Edge functions do Supabase (ex: server, generate-pdf)
│   └── migrations/         # Arquivos RLS e SQL do banco
├── docs/                   # Documentação detalhada em Markdown por módulo
│   ├── finance/            # Documentação específica de Financeiro
│   ├── ordens-de-servico/  # Documentação específica de OS e workflows
│   └── rh/                 # Documentação de Recursos Humanos e permissões
└── tests/                  # Cenários de teste e mocks
```

---

## 🛠️ Scripts Úteis

O `package.json` fornece atalhos essenciais de desenvolvimento e testes:

- `npm run dev` — Inicia o servidor local Vite.
- `npm run build` — Verifica tipos a faz o bundle de produção via Vite.
- `npm run lint` — Executa o ESLint em todo o diretório `src/`.
- `npm run test` — Roda suítes de testes via Vitest.
- `npm run test:ui` — Abre a interface visual do Vitest para debuggação.
- `npm run update-types` — Gera novamente os tipos do TypeScript baseados no banco Supabase hospedado (projeto `zxfevlkssljndqqhxkjb`). Requer Supabase CLI logado.
- `npm run update-types:local` — Como acima, mas aponta para seu contêiner Supabase local.

---

## 👥 Usuários Recomendados (Desenvolvimento/Mock)

Caso prefira navegar em features locais sem impacto produtivo:

| Email (Mock/Sample) | Senha | Perfil RBAC |
|---------------------|-------|-------------|
| diretoria@minerva.com | diretoria123 | Diretoria (Acesso Total) |
| admin@minerva.com | admin123 | Administrador |
| gestor.adm@minerva.com | gestor123 | Coordenador Administrativo |
| gestor.obras@minerva.com | gestor123 | Coordenador de Obras |
| colaborador@minerva.com | colaborador123 | Operacional |

📝 *As senhas acima correspondem aos ambientes de testes ou mock local. Em ambiente de produção, contate o administrador para obter permissões RLS no Supabase Auth.*

---

## 📞 Suporte e Contribuição

- Consulte a pasta de **[`docs/`](./docs/)** para aprofundar-se nativamente no fluxo arquitetural de cada departamento.
- Siga as regras de integração declaradas no arquivo **`CLAUDE.md`** na raiz.
- Use `logger.error` e `logger.warn` do `@/lib/utils/logger` no lugar de `console.log`.

**Minerva Engenharia © 2026.**