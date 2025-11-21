# CHECKLIST DE CORREÇÕES PRIORITÁRIAS - MINERVAV2

**Data:** 2025-11-21
**Última Atualização:** 2025-11-21
**Versão:** 1.0

> 📋 Este documento lista TODAS as correções necessárias no projeto, organizadas por prioridade.
> Use este checklist para rastrear progresso e planejar sprints.

---

## 📊 RESUMO RÁPIDO

| Categoria | Total | Concluído | Pendente | % Completo |
|-----------|-------|-----------|----------|------------|
| 🔴 **CRÍTICO** | 8 | 5 | 3 | 63% |
| 🟡 **ALTO** | 5 | 0 | 5 | 0% |
| 🟢 **MÉDIO** | 12 | 0 | 12 | 0% |
| ⚪ **BAIXO** | 4 | 0 | 4 | 0% |
| **TOTAL** | **29** | **5** | **24** | **17%** |

**Tempo Estimado Total:** ~16 semanas (1 dev) ou ~6-8 semanas (2-3 devs)

---

## ✅ JÁ CORRIGIDO (Última Semana)

### ✅ 1. Recursão Infinita em RLS Policies
- **Data:** 2025-11-21
- **Arquivo:** `supabase/migrations/20251121000012_fix_infinite_recursion_rls.sql`
- **Problema:** Policies RLS causavam recursão infinita ao consultar própria tabela
- **Correção:** Migration criada removendo policies recursivas
- **Verificação:**
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'colaboradores';
  -- Deve mostrar policies sem recursão
  ```
- **Impacto:** ✅ Autenticação 100% funcional

---

### ✅ 2. Usuários Corrompidos com Tokens NULL
- **Data:** 2025-11-21
- **Arquivos:** `FIX_AUTH_USERS_CORRUPTION.sql`, `docs/SOLUCAO_ERRO_NOME_COMPLETO.md`
- **Problema:** 6 usuários com `confirmation_token = NULL` quebrando autenticação
- **Correção:** Função `fix_corrupted_auth_users()` executada via MCP
- **Resultado:**
  - ✅ 6 usuários corrompidos deletados
  - ✅ Base limpa: 0 usuários com tokens NULL
- **Verificação:**
  ```sql
  SELECT COUNT(*) FROM auth.users WHERE confirmation_token IS NULL;
  -- Deve retornar: 0
  ```
- **Impacto:** ✅ Criação de usuários funcionando, login 100% operacional

---

### ✅ 3. Trigger Automático Quebrado
- **Data:** 2025-11-21
- **Arquivo:** `supabase/migrations/seed_auth_users.sql`
- **Problema:** Trigger `on_auth_user_created` falhava com `nome_completo = NULL`
- **Correção:**
  - Trigger desabilitado: `DROP TRIGGER IF EXISTS on_auth_user_created`
  - Função manual criada: `sync_single_user(email)`
- **Verificação:**
  ```sql
  SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  -- Deve retornar: 0 linhas
  ```
- **Impacto:** ✅ Usuários podem ser criados no Dashboard sem erros

---

### ✅ 4. Imports Supabase Padronizados
- **Data:** 2025-11-21
- **Commit:** `e14db79`
- **Arquivos:** 5 componentes atualizados para usar `@/lib/supabase`
- **Problema:** Imports inconsistentes usando caminhos relativos
- **Correção:**
  - Criado `src/lib/supabase.ts` (arquivo principal)
  - Padronizados imports para usar path alias `@/lib/supabase`
  - Removidos imports relativos `../supabase` e `../../lib/supabase`
- **Verificação:**
  ```bash
  npm run build
  # Build passa com sucesso
  npm run dev
  # HMR funcionando corretamente
  ```
- **Impacto:** ✅ Código consistente seguindo diretrizes do projeto

---

### ✅ 5. Credenciais Hardcoded Migradas para .env
- **Data:** 2025-11-21
- **Commit:** `85a711b`
- **Arquivos:** `src/utils/supabase/info.tsx` deletado, `.env` criado
- **Problema:** Chaves Supabase expostas no código-fonte
- **Correção:**
  - Criado `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
  - Atualizado `.gitignore` para ignorar arquivos `.env*`
  - Criado `.env.example` para documentação
  - Migrados 5 arquivos para usar `import.meta.env`
  - Deletado `info.tsx` com credenciais hardcoded
- **Verificação:**
  ```bash
  grep -r "eyJhbG" src/
  # Retorna: Nenhuma chave hardcoded encontrada
  npm run build
  # Build passa com sucesso
  ```
- **Impacto:** ✅ Segurança resolvida, credenciais protegidas

---

## 🔴 CRÍTICO (Fazer AGORA - Bloqueia Produção)

### 🔴 6. Remover Sistema de Roteamento Duplo
- [ ] **Pendente**
- **Arquivos:** `src/App.tsx` (470 linhas), `src/routes/**/*.tsx` (28 arquivos)
- **Problema:** Dois sistemas de roteamento coexistindo (state manual + TanStack Router)
- **Impacto:** Confusão, bugs de navegação, App.tsx gigante
- **Correção (ETAPAS):**

**1. Migrar navegações para TanStack Router:**
  ```typescript
  // ANTES (App.tsx)
  <button onClick={() => setCurrentPage('os-list')}>

  // DEPOIS (usando Link)
  import { Link } from '@tanstack/react-router';
  <Link to="/os">Ver OS</Link>
  ```

**2. Simplificar App.tsx:**
  ```typescript
  // App.tsx (novo - 50 linhas)
  import { RouterProvider } from '@tanstack/react-router';
  import { router } from './routes';

  export function App() {
    return <RouterProvider router={router} />;
  }
  ```

**3. Deletar código antigo:**
  - Remover type `Page`
  - Remover state `currentPage`
  - Remover todos `setCurrentPage`
  - Remover switch cases

- **Estimativa:** 2-3 dias
- **Responsável:** _______
- **Sprint:** _______
- **Arquivos para editar:**
  - [ ] `src/App.tsx`
  - [ ] `src/components/layout/sidebar.tsx`
  - [ ] `src/components/layout/header.tsx`
  - [ ] Todos componentes com `setCurrentPage`
- **Verificação:**
  ```bash
  grep -r "setCurrentPage" src/
  # Deve retornar: 0 ocorrências
  ```

---

### 🔴 7. Implementar Testes E2E Básicos
- [ ] **Pendente**
- **Problema:** Zero cobertura de testes (<1%)
- **RISCO:** Impossível garantir que refatorações não quebram código
- **Correção (FASE 1 - Testes Críticos):**

**1. Setup do Vitest (já configurado):**
  ```bash
  npm run test
  # Verifica se Vitest está funcionando
  ```

**2. Criar testes de autenticação:**
  ```typescript
  // src/lib/contexts/__tests__/auth-context.test.tsx
  import { describe, it, expect } from 'vitest';
  import { renderHook, waitFor } from '@testing-library/react';
  import { useAuth } from '../auth-context';

  describe('AuthContext', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const { result } = renderHook(() => useAuth());

      await result.current.login('diretor@minerva.com', 'minerva123');

      await waitFor(() => {
        expect(result.current.currentUser).toBeDefined();
        expect(result.current.currentUser?.email).toBe('diretor@minerva.com');
      });
    });

    it('deve rejeitar credenciais inválidas', async () => {
      const { result } = renderHook(() => useAuth());

      await expect(
        result.current.login('fake@test.com', 'wrong')
      ).rejects.toThrow();
    });
  });
  ```

**3. Criar testes de queries principais:**
  ```typescript
  // src/lib/hooks/__tests__/use-ordens-servico.test.ts
  import { describe, it, expect } from 'vitest';
  import { renderHook, waitFor } from '@testing-library/react';
  import { useOrdensServico } from '../use-ordens-servico';

  describe('useOrdensServico', () => {
    it('deve carregar lista de OS', async () => {
      const { result } = renderHook(() => useOrdensServico());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(Array.isArray(result.current.data)).toBe(true);
    });
  });
  ```

**4. Criar testes E2E com Playwright:**
  ```typescript
  // tests/e2e/auth.spec.ts
  import { test, expect } from '@playwright/test';

  test('deve fazer login e ver dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000');

    await page.fill('[name="email"]', 'diretor@minerva.com');
    await page.fill('[name="password"]', 'minerva123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
  ```

- **Estimativa:** 1 semana
- **Responsável:** _______
- **Sprint:** _______
- **Arquivos para criar:**
  - [ ] `src/lib/contexts/__tests__/auth-context.test.tsx`
  - [ ] `src/lib/hooks/__tests__/use-ordens-servico.test.ts`
  - [ ] `src/lib/hooks/__tests__/use-clientes.test.tsx`
  - [ ] `tests/e2e/auth.spec.ts`
  - [ ] `tests/e2e/os-create.spec.ts`
- **Meta:** 30% de cobertura
- **Verificação:**
  ```bash
  npm run test:coverage
  # Coverage deve ser >= 30%
  ```

---

### 🔴 8. Revisar e Corrigir RLS Policies
- [ ] **Pendente**
- **Arquivo:** `supabase/migrations/20251121000012_fix_infinite_recursion_rls.sql`
- **Problema:** Policies com `LIMIT 1` inseguro
- **RISCO:** Possível escalação de privilégio se constraint UNIQUE for removida
- **Correção:**

**1. Remover LIMIT 1 desnecessário:**
  ```sql
  -- ANTES (inseguro)
  EXISTS (
    SELECT 1 FROM public.colaboradores c
    WHERE c.id = auth.uid() AND c.role_nivel = 'DIRETORIA'
    LIMIT 1  -- ⚠️ Não garante unicidade
  )

  -- DEPOIS (correto)
  EXISTS (
    SELECT 1 FROM public.colaboradores c
    WHERE c.id = auth.uid() AND c.role_nivel = 'DIRETORIA'
    -- SEM LIMIT
  )
  ```

**2. Adicionar constraint UNIQUE:**
  ```sql
  ALTER TABLE public.colaboradores
    ADD CONSTRAINT colaboradores_id_unique UNIQUE (id);
  ```

**3. Testar policies:**
  ```sql
  -- Como usuário DIRETORIA
  SELECT * FROM colaboradores; -- Deve ver todos

  -- Como usuário COLABORADOR
  SELECT * FROM colaboradores; -- Deve ver apenas ele mesmo
  ```

- **Estimativa:** 2 horas
- **Responsável:** _______
- **Sprint:** _______
- **Policies para revisar:**
  - [ ] `colaboradores` (SELECT, UPDATE, DELETE)
  - [ ] `ordens_servico` (todas)
  - [ ] `clientes` (todas)
  - [ ] `documentos` (todas)
- **Verificação:**
  ```sql
  -- Verificar todas policies
  SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
  FROM pg_policies
  WHERE schemaname = 'public'
  ORDER BY tablename, policyname;

  -- Não deve haver LIMIT em nenhuma policy
  SELECT * FROM pg_policies WHERE qual LIKE '%LIMIT%';
  ```

---

## 🟡 ALTO (Próxima Sprint - Funcionalidades Principais)

### 🟡 9. Remover TODOS os Dados Mock
- [ ] **Pendente**
- **Arquivos Afetados:** 15+ componentes
- **Problema:** Sistema mostra dados que NÃO existem no banco
- **Impacto:** Dashboards falsos, relatórios incorretos, usuário confuso
- **Correção (PLANO COMPLETO):**

**FASE 1: Criar Tabelas no Supabase (2 dias)**

```sql
-- 1. Tabela de KPIs Financeiros
CREATE TABLE public.kpis_financeiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_referencia DATE NOT NULL,
  previsao_receita_mes DECIMAL(15,2),
  receita_realizada DECIMAL(15,2),
  contas_a_receber DECIMAL(15,2),
  inadimplencia DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Projetos Prestação de Contas
CREATE TABLE public.projetos_prestacao_contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_projeto TEXT NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id),
  saldo_orcado DECIMAL(15,2),
  saldo_contratado DECIMAL(15,2),
  saldo_realizado DECIMAL(15,2),
  percentual_utilizado DECIMAL(5,2),
  status TEXT,
  data_inicio DATE,
  data_fim_prevista DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Propostas Comerciais
CREATE TABLE public.propostas_comerciais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_proposta TEXT UNIQUE NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id),
  titulo TEXT NOT NULL,
  valor_total DECIMAL(15,2),
  status TEXT,
  data_criacao DATE,
  validade_dias INTEGER,
  responsavel_id UUID REFERENCES public.colaboradores(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ... mais 5 tabelas
```

**FASE 2: Migrar Mock Data para Seeds (1 dia)**

```sql
-- seed_mock_data.sql
INSERT INTO public.kpis_financeiros (data_referencia, previsao_receita_mes, ...)
SELECT
  '2025-11-01'::date,
  450000,
  ...
FROM (VALUES (1)) v(id);

-- Migrar todos os 831 linhas de mock-data.ts para SQL
```

**FASE 3: Refatorar Componentes (1 semana)**

Por componente:
1. Remover import de mock data
2. Criar query Supabase
3. Usar useQuery do TanStack
4. Adicionar loading state
5. Adicionar error handling
6. Testar com dados reais

**Componentes para refatorar:**
- [ ] `financeiro-dashboard-page.tsx`
- [ ] `prestacao-contas-page.tsx`
- [ ] `contas-receber-page.tsx`
- [ ] `propostas-comerciais.tsx`
- [ ] `lista-leads.tsx`
- [ ] `dashboard-gestor-obras.tsx`
- [ ] `dashboard-gestor-assessoria.tsx`
- [ ] `fila-aprovacao-laudos.tsx`
- [ ] `analise-reformas.tsx`
- [ ] `aprovacao-medicoes.tsx`
- [ ] `lista-obras-ativas.tsx`
- [ ] `usuarios-permissoes-page.tsx`
- [ ] `App.tsx` (remover imports de mock)

**FASE 4: Deletar Mock Data (30 min)**

```bash
git rm src/lib/mock-data.ts
git commit -m "chore: Remove all mock data - using real Supabase queries"
```

- **Estimativa:** 2-3 semanas
- **Responsável:** _______
- **Sprint:** _______
- **Verificação:**
  ```bash
  grep -r "mock" src/
  # Deve retornar apenas nomes de variáveis, não imports de mock-data.ts

  grep -r "from.*mock-data" src/
  # Deve retornar: 0 ocorrências
  ```

---

### 🟡 10. Corrigir Bug de Navegação em OS Details
- [ ] **Pendente**
- **Arquivo:** `src/routes/_auth/os/index.tsx` (linhas 30-33)
- **Problema:** OSTable não passa ID ao navegar, página abre vazia
- **Correção:**

**1. Atualizar rota para aceitar ID:**
```typescript
// src/routes/_auth/os/details-workflow.$id.tsx (novo arquivo)
import { useParams } from '@tanstack/react-router';

export function OSDetailsWorkflow() {
  const { id } = useParams({ from: '/_auth/os/details-workflow/$id' });

  // Agora tem acesso ao ID da OS
  const { data: os } = useOrdensServico({ id });

  return <WorkflowPage os={os} />;
}
```

**2. Atualizar OSTable para passar ID:**
```typescript
// OSTable.tsx
<TableRow
  className="cursor-pointer hover:bg-muted/50"
  onClick={() => navigate({
    to: '/os/details-workflow/$id',
    params: { id: os.id } // ✅ Passa ID
  })}
>
```

**3. Remover console.warn:**
```typescript
// Deletar:
console.warn('Navigation to os-details-workflow requested without ID')
```

- **Estimativa:** 2 horas
- **Responsável:** _______
- **Sprint:** _______
- **Arquivos para editar:**
  - [ ] `src/routes/_auth/os/index.tsx`
  - [ ] `src/components/os/OSTable.tsx`
  - [ ] `src/routes/_auth/os/details-workflow.tsx` → renomear para `details-workflow.$id.tsx`
- **Verificação:**
  1. Clicar em OS na lista
  2. Deve abrir página de detalhes com dados da OS correta
  3. URL deve ser `/os/details-workflow/uuid-da-os`

---

### 🟡 11. Implementar Storage Real (Upload/Download)
- [ ] **Pendente**
- **Arquivo:** `src/lib/utils/supabase-storage.ts`
- **Problema:** Upload/download apenas simulados, arquivos não são salvos
- **Correção:**

**1. Criar buckets no Supabase:**
```sql
-- No Supabase Dashboard → Storage
-- Criar buckets:
-- - documentos (público para leitura, privado para escrita)
-- - fotos (público)
-- - anexos (privado)
```

**2. Configurar RLS para storage:**
```sql
-- Policies para bucket 'documentos'
CREATE POLICY "Usuários autenticados podem fazer upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documentos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Todos podem fazer download de documentos públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'documentos');
```

**3. Implementar upload real:**
```typescript
// supabase-storage.ts
export async function uploadToSupabase(
  file: File,
  bucket: string,
  path: string
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    logger.error('Erro no upload:', error);
    throw error;
  }

  // Obter URL pública
  const { data: publicURL } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return {
    success: true,
    url: publicURL.publicUrl,
    path: data.path
  };
}
```

**4. Implementar download:**
```typescript
export async function downloadFromSupabase(
  bucket: string,
  path: string
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);

  if (error) {
    logger.error('Erro no download:', error);
    throw error;
  }

  return data; // Blob
}
```

**5. Remover mocks:**
```typescript
// Deletar:
console.log(`🎭 MOCK Upload: ${filePath}`);
console.log(`🎭 MOCK Delete: ${filePath}`);
```

- **Estimativa:** 1 dia
- **Responsável:** _______
- **Sprint:** _______
- **Tarefas:**
  - [ ] Criar buckets no Supabase
  - [ ] Configurar RLS policies
  - [ ] Implementar upload real
  - [ ] Implementar download real
  - [ ] Implementar delete real
  - [ ] Testar com arquivos reais
- **Verificação:**
  1. Upload de documento em OS
  2. Verificar arquivo no Supabase Storage
  3. Download do arquivo
  4. Arquivo deve estar correto

---

### 🟡 12. Otimizar Queries (Remover N+1)
- [ ] **Pendente**
- **Arquivo:** `src/lib/hooks/use-ordens-servico.ts`
- **Problema:** 1 query para OS + N queries para clientes + N queries para responsáveis = 201 queries para 100 OS
- **Impacto:** Performance horrível, latência alta, timeout
- **Correção:**

**ANTES (N+1 queries):**
```typescript
// Query 1: Buscar OS
const { data: ordensServico } = await supabase
  .from('ordens_servico')
  .select('*');

// Query 2-N: Para cada OS
for (const os of ordensServico) {
  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', os.cliente_id)
    .single();

  const { data: responsavel } = await supabase
    .from('colaboradores')
    .select('*')
    .eq('id', os.responsavel_id)
    .single();
}
// Total: 1 + 100 + 100 = 201 queries 😱
```

**DEPOIS (1 query com JOINs):**
```typescript
// ✅ 1 query única com JOINs
const { data: ordensServico } = await supabase
  .from('ordens_servico')
  .select(`
    *,
    cliente:clientes(*),
    responsavel:colaboradores(*),
    tipo_os:tipos_ordem_servico(*),
    etapas:etapas_os(*)
  `);

// Resultado: 100 OS com TODOS dados relacionados em 1 query
// Performance: ~50ms vs ~5000ms
```

- **Estimativa:** 2 dias
- **Responsável:** _______
- **Sprint:** _______
- **Hooks para otimizar:**
  - [ ] `use-ordens-servico.ts`
  - [ ] `use-clientes.tsx`
  - [ ] `use-colaboradores.tsx`
  - [ ] `use-etapas.ts`
  - [ ] `use-workflow-timeline.ts`
  - [ ] `use-financeiro.ts`
  - [ ] `use-propostas.ts`
  - [ ] `use-leads.ts`
- **Verificação:**
  ```typescript
  // Adicionar logging
  const startTime = performance.now();
  const data = await query();
  const endTime = performance.now();
  console.log(`Query time: ${endTime - startTime}ms`);

  // Deve ser < 200ms para 100 registros
  ```

---

### 🟡 13. Padronizar Workflows com WorkflowEngine
- [ ] **Pendente**
- **Arquivos:** 6 workflows diferentes
- **Problema:** Cada OS tem estrutura completamente diferente, código duplicado 6x
- **Correção:**

**Criar componente genérico WorkflowEngine** (ver detalhes na auditoria completa)

- **Estimativa:** 2 semanas
- **Responsável:** _______
- **Sprint:** _______
- **Workflows para migrar:**
  - [ ] `os-details-workflow-page.tsx` (OS 01-04)
  - [ ] `os-details-assessoria-page.tsx` (OS 05-06)
  - [ ] `os07-workflow-page.tsx` (Reforma)
  - [ ] `os08-workflow-page.tsx` (Vistoria)
  - [ ] `os09-workflow-page.tsx` (Compras)
  - [ ] `os13-workflow-page.tsx` (Contrato Obra)

---

## 🟢 MÉDIO (Backlog - Qualidade e Manutenibilidade)

### 🟢 14. Refatorar Componentes Gigantes
- [ ] **Pendente**
- **Componentes > 300 linhas:** 5
- **Estimativa:** 1 semana
- **Sprint:** _______

### 🟢 15. Extrair Lógica Duplicada (Filtros)
- [ ] **Pendente**
- **Ocorrências:** 25+ componentes com filtro "TODOS"
- **Estimativa:** 2 horas (criar hook) + 3 horas (refatorar)
- **Sprint:** _______

### 🟢 16. Criar Sistema de Logging Centralizado
- [ ] **Pendente**
- **Console.logs para remover:** 100+
- **Estimativa:** 3 horas
- **Sprint:** _______

### 🟢 17. Aplicar Memoização (useMemo, useCallback)
- [ ] **Pendente**
- **Componentes sem memoização:** 78
- **Estimativa:** 1 semana
- **Sprint:** _______

### 🟢 18. Implementar Paginação Server-Side
- [ ] **Pendente**
- **Componentes sem paginação:** 5
- **Estimativa:** 2 dias
- **Sprint:** _______

### 🟢 19. Padronizar Loading States
- [ ] **Pendente**
- **Componentes inconsistentes:** 25+
- **Estimativa:** 1 dia
- **Sprint:** _______

### 🟢 20. Padronizar Error Handling
- [ ] **Pendente**
- **Alerts para substituir:** 10+
- **Estimativa:** 2 horas
- **Sprint:** _______

### 🟢 21. Implementar Validação com react-hook-form
- [ ] **Pendente**
- **Formulários sem validação real-time:** 15+
- **Estimativa:** 1 semana
- **Sprint:** _______

### 🟢 22. Sanitizar Console.logs com Dados Sensíveis
- [ ] **Pendente**
- **Logs com dados pessoais:** 20+
- **Estimativa:** 2 horas
- **Sprint:** _______

### 🟢 23. Remover localStorage Redundante (Auth)
- [ ] **Pendente**
- **Arquivo:** `src/lib/contexts/auth-context.tsx`
- **Estimativa:** 1 hora
- **Sprint:** _______

### 🟢 24. Remover Função mapStatusToLocal()
- [ ] **Pendente**
- **Arquivo:** `use-ordens-servico.ts` (linhas 158-206)
- **Estimativa:** 2 horas
- **Sprint:** _______

### 🟢 25. Criar Documentação Completa
- [ ] **Pendente**
- **Docs para criar:** 6 arquivos
- **Estimativa:** 1 semana
- **Sprint:** _______

---

## ⚪ BAIXO (Melhorias Incrementais)

### ⚪ 26. Limpar Dependências Não Usadas
- [ ] **Pendente**
- **Pacotes:** `next`, `hono`
- **Correção:**
  ```bash
  npm uninstall next hono
  npm prune
  ```
- **Estimativa:** 15 minutos
- **Sprint:** _______

### ⚪ 27. Substituir Alerts por Toasts
- [ ] **Pendente**
- **Arquivos:** 3 modais
- **Estimativa:** 30 minutos
- **Sprint:** _______

### ⚪ 28. Organizar Scripts de Fix
- [ ] **Pendente**
- **Scripts no root:** 7+
- **Correção:** Mover para `scripts/maintenance/` com README
- **Estimativa:** 1 hora
- **Sprint:** _______

### ⚪ 29. Remover Arquivos Duplicados
- [ ] **Pendente**
- **Arquivos:** 10+ (workflows, seeds, listas)
- **Estimativa:** 2 horas
- **Sprint:** _______

---

## 📈 PROGRESSO POR SPRINT

### Sprint 1 (Semana 1-2) - Correções Críticas
- [ ] #4: Corrigir imports supabase.ts
- [ ] #5: Migrar credenciais para .env
- [ ] #8: Revisar RLS policies
- [ ] #6: Remover roteamento duplo (início)

**Meta:** Sistema estável com autenticação segura

---

### Sprint 2 (Semana 3-4) - Testes e Navegação
- [ ] #6: Remover roteamento duplo (conclusão)
- [ ] #7: Implementar testes E2E básicos
- [ ] #10: Corrigir bug de navegação OS Details

**Meta:** Navegação funcional, 30% de testes

---

### Sprint 3-5 (Semana 5-9) - Dados Reais
- [ ] #9: Remover TODOS dados mock (Fase 1-4)
- [ ] #11: Implementar storage real
- [ ] #12: Otimizar queries N+1

**Meta:** 100% dados reais do Supabase

---

### Sprint 6-8 (Semana 10-14) - Arquitetura
- [ ] #13: Padronizar workflows (WorkflowEngine)
- [ ] #14: Refatorar componentes gigantes
- [ ] #15: Extrair lógica duplicada
- [ ] #16: Sistema de logging

**Meta:** Código limpo e mantível

---

### Sprint 9-10 (Semana 15-16) - UX e Qualidade
- [ ] #17: Aplicar memoização
- [ ] #18: Implementar paginação
- [ ] #19: Padronizar loading states
- [ ] #20: Padronizar error handling
- [ ] #21: Validação react-hook-form

**Meta:** UX consistente e performático

---

## 🎯 METAS POR MILESTONE

### Milestone 1: Produção Segura (4-5 semanas)
**Bloqueadores resolvidos:**
- ✅ Credenciais em .env
- ✅ Imports corrigidos
- ✅ Roteamento único
- ✅ RLS policies seguras
- ✅ Testes E2E básicos (30%)

**Status:** APTO PARA PRODUÇÃO

---

### Milestone 2: Dados Reais (9 semanas)
**100% Supabase:**
- ✅ Zero mock data
- ✅ Storage funcionando
- ✅ Queries otimizadas
- ✅ Performance < 200ms

**Status:** DADOS CONFIÁVEIS

---

### Milestone 3: Arquitetura Limpa (14 semanas)
**Código mantível:**
- ✅ Workflows padronizados
- ✅ Componentes < 300 linhas
- ✅ Lógica reutilizada
- ✅ 50% de testes

**Status:** MANUTENÇÃO FÁCIL

---

### Milestone 4: Produção Ideal (16 semanas)
**Sistema otimizado:**
- ✅ UX consistente
- ✅ Performance otimizada
- ✅ 70% de testes
- ✅ Documentação completa

**Status:** PRODUÇÃO IDEAL

---

## 📊 TRACKING DE TEMPO

| Desenvolvedor | Sprint Atual | Horas Gastas | Horas Estimadas | Items Completos |
|---------------|--------------|--------------|-----------------|-----------------|
| Dev 1 | Sprint 1 | 0h | 80h | 0/4 |
| Dev 2 | Sprint 1 | 0h | 80h | 0/4 |
| Dev 3 | Sprint 1 | 0h | 80h | 0/4 |

---

## 🔗 LINKS ÚTEIS

- **Auditoria Completa:** [AUDITORIA_TECNICA_COMPLETA.md](./AUDITORIA_TECNICA_COMPLETA.md)
- **Quick Wins:** [QUICK_WINS.md](./QUICK_WINS.md)
- **Supabase Dashboard:** https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb
- **Guidelines:** [../src/guidelines/Guidelines.md](../src/guidelines/Guidelines.md)

---

**Documento mantido por:** Time de Desenvolvimento
**Atualização:** Semanal (toda segunda-feira)
**Revisão:** Após cada sprint

---

**FIM DO CHECKLIST**
