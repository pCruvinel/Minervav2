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

## 🏗 Stack Tecnológica (Produção)
- **Frontend**: React 18.3+, TypeScript, Vite.
- **Estilização**: Tailwind CSS, Shadcn/UI (em `src/components/ui`).
- **Roteamento**: **TanStack Router** (File-based em `src/routes`).
  - ⛔ **Legado**: `react-router-dom` e `src/App.tsx` estão sendo descontinuados.
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