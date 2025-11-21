````markdown
# CLAUDE.md - Diretrizes do Projeto MinervaV2

## 🛠 Comandos Principais
- **Dev Server**: `npm run dev`
- **Build**: `npm run build`
- **Testes**: `npm run test` (Vitest)
- **Lint**: `npm run lint`
- **Banco de Dados (Supabase)**:
  - Migrations (Push): `npx supabase db push`
  - Pull Schema: `npx supabase db pull`
  - Status: `npx supabase status`

## 🏗 Stack Tecnológica
- **Frontend**: React 18.3+, TypeScript, Vite.
- **Estilização**: Tailwind CSS, Shadcn/UI (em `src/components/ui`).
- **Roteamento**: **TanStack Router** (File-based em `src/routes`).
  - ⚠️ Estamos migrando de um roteamento manual legado. **Sempre prefira TanStack Router** para novas telas.
- **Backend/BaaS**: Supabase (Auth, Database, Storage, Edge Functions).
- **Ícones**: Lucide React.
- **Gerenciamento de Estado**: React Context + Hooks Customizados (ex: `use-ordens-servico`).
- **Notificações**: Sonner (`toast`).

## 📐 Padrões de Arquitetura e Código

### 1. Roteamento e Navegação
- Utilize componentes `<Link>` do TanStack Router. Evite tags `<a>` para navegação interna.
- **NUNCA** crie novas rotas manuais no `src/App.tsx`. Use o sistema de arquivos em `src/routes/_auth/`.
- Ao navegar passando parâmetros, use a sintaxe tipada do TanStack Router:
  ```typescript
  navigate({ to: '/os/$osId', params: { osId: '123' } })
````

### 2\. Integração com Supabase

  - Importe o cliente de: `@/lib/supabase-client`.
  - **NUNCA** utilize dados mockados (`mock-data.ts`) para novas funcionalidades. Conecte diretamente ao banco.
  - Evite queries N+1. Use `.select('*, tabela_relacionada(*)')` para buscar dados relacionados em uma única query.

### 3\. Estilo de Código (TypeScript/React)

  - **Interfaces**: Prefira `interface` sobre `type` para definições de objetos.
  - **Imports**: Use Absolute Imports (`@/components/...`).
  - **Componentes**: Use Function Components com PascalCase.
  - **Hook Rules**: Memoize arrays/objetos em dependências de `useEffect` usando `useMemo` para evitar re-renders.

### 4\. UI/UX e Design System

  - Use componentes do shadcn/ui sempre que possível.
  - **Erro Handling**:
      - ❌ NÃO use `alert()`.
      - ❌ NÃO use `console.error` exposto em produção.
      - ✅ USE `toast.error('Mensagem')` (Sonner).
      - ✅ USE `logger.error(...)` (se disponível) ou sanitiza logs em prod.
  - **Formulários**: Use `react-hook-form` + `zod` para validação.

### 5\. Segurança

  - **Credenciais**: NUNCA commite chaves de API ou segredos no código. Use `import.meta.env`.
  - **RLS**: Sempre considere as Row Level Security policies ao criar queries. Não confie apenas na filtragem do frontend.

## ⚠️ Known Issues / Contexto de Migração

  - **Rotas Mistas**: O projeto tem arquivos de rota antigos. Ignore o switch/case gigante no `App.tsx` se estiver refatorando para TanStack Router.
  - **Dados Mock**: Existem muitos arquivos usando mocks. O objetivo atual é substituí-los por chamadas reais ao Supabase.
  - **Supabase Client**: Certifique-se de que `supabase-client.ts` trata erros de variáveis de ambiente ausentes.

<!-- end list -->

```
