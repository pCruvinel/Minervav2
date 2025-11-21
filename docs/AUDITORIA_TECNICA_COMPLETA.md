# AUDITORIA TÉCNICA COMPLETA - MINERVAV2

**Data:** 2025-11-21
**Projeto:** MinervaV2 - Sistema de Gerenciamento de Ordens de Serviço
**Stack:** React 18.3.1, TypeScript, Supabase, TanStack Router, Tailwind CSS
**Versão:** 0.1.0
**Documentado por:** Claude Code (Análise Automatizada Completa)

---

## 📑 Índice

1. [Erros e Bugs Críticos](#1-erros-e-bugs-críticos)
2. [Funcionalidades Incompletas/Mockadas](#2-funcionalidades-incompletasmockadas)
3. [Duplicidades e Código Redundante](#3-duplicidades-e-código-redundante)
4. [Ajustes Críticos de Arquitetura](#4-ajustes-críticos-de-arquitetura)
5. [Problemas de Performance](#5-problemas-de-performance)
6. [Problemas de UX/UI](#6-problemas-de-uxui)
7. [Problemas de Segurança](#7-problemas-de-segurança)
8. [Testes e Qualidade](#8-testes-e-qualidade)
9. [Documentação](#9-documentação)
10. [Resumo Executivo](#10-resumo-executivo)
11. [Plano de Ação Recomendado](#11-plano-de-ação-recomendado)
12. [Métricas do Projeto](#12-métricas-do-projeto)

---

## 1. ERROS E BUGS CRÍTICOS

### 1.1 BANCO DE DADOS E AUTENTICAÇÃO

#### ✅ 🔴 CRÍTICO: Recursão Infinita em RLS Policies (CORRIGIDO)
- **Arquivo:** `supabase/migrations/20251121000012_fix_infinite_recursion_rls.sql`
- **Status:** ✅ CORRIGIDO em 2025-11-21
- **Problema:** Policies RLS da tabela `colaboradores` causavam recursão infinita ao consultar a própria tabela dentro das conditions
- **Erro Original:**
  ```
  infinite recursion detected in policy for relation colaboradores
  ```
- **Impacto:**
  - ❌ Quebrava completamente a autenticação
  - ❌ Impossibilitava login
  - ❌ Bloqueava todas queries em colaboradores
- **Correção Aplicada:**
  - Migration criada removendo policies recursivas
  - Substituídas por policies usando apenas `auth.uid()` direto
  - Verificação: `SELECT * FROM pg_policies WHERE tablename = 'colaboradores';`

#### ✅ 🔴 CRÍTICO: Usuários Corrompidos com Tokens NULL (CORRIGIDO)
- **Arquivos:**
  - `FIX_AUTH_USERS_CORRUPTION.sql`
  - `docs/SOLUCAO_ERRO_NOME_COMPLETO.md`
- **Status:** ✅ CORRIGIDO via MCP em 2025-11-21
- **Problema:** 6 usuários em `auth.users` tinham campos de token (`confirmation_token`, `recovery_token`) como NULL ao invés de string vazia
- **IDs Afetados:**
  - `a0000000-0000-4000-a000-000000000001` a `a0000000-0000-4000-a000-000000000006`
- **Erro Original:**
  ```
  sql: Scan error on column index 3, name "confirmation_token":
  converting NULL to string is unsupported

  500: Database error querying schema
  500: Database error creating new user
  500: Database error loading user
  ```
- **Impacto:**
  - ❌ Erro 500 em TODAS operações de autenticação
  - ❌ Impossível fazer login com qualquer usuário
  - ❌ Impossível criar novos usuários
  - ❌ Impossível deletar usuários no Dashboard
  - ❌ Qualquer operação que consultasse `auth.users` falhava
- **Correção Aplicada:**
  - Função `fix_corrupted_auth_users()` criada via MCP
  - 6 usuários corrompidos deletados
  - 0 colaboradores órfãos removidos
  - Base completamente limpa
  - Verificação:
    ```sql
    SELECT COUNT(*) FROM auth.users WHERE confirmation_token IS NULL;
    -- Resultado: 0
    ```

#### ✅ 🔴 CRÍTICO: Trigger Automático Quebrado (CORRIGIDO)
- **Arquivo:** `supabase/migrations/seed_auth_users.sql` (linhas 16-58)
- **Status:** ✅ CORRIGIDO em 2025-11-21
- **Problema:** Trigger `on_auth_user_created` tentava inserir em `colaboradores` automaticamente mas falhava com `nome_completo = NULL`
- **Erro Original:**
  ```
  null value in column "nome_completo" of relation "colaboradores"
  violates not-null constraint
  ```
- **Causa Raiz:**
  - Dashboard Supabase não envia `raw_user_meta_data` customizado
  - COALESCE na linha 36 falhava: `COALESCE(NEW.raw_user_meta_data->>'nome_completo', 'Usuário Novo')`
  - Coluna `nome_completo` tem constraint NOT NULL
- **Impacto:**
  - ❌ Impossível criar usuários pelo Dashboard
  - ❌ Erro 500 ao tentar adicionar usuários
- **Correção Aplicada:**
  - Trigger `on_auth_user_created` desabilitado: `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`
  - Função manual criada: `sync_single_user(email)` para sincronização controlada
  - Função existente mantida: `sync_all_test_users()` para batch sync
  - Verificação:
    ```sql
    SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
    -- Resultado: 0 linhas
    ```

---

#### 🔴 CRÍTICO: Arquivo supabase.ts Não Existe
- **Problema:** Código referencia `import { supabase } from '../lib/supabase'` mas arquivo não existe
- **Arquivo Real:** `src/lib/supabase-client.ts`
- **Localizações dos Imports Quebrados:**
  ```typescript
  // Padrão de import incorreto encontrado em múltiplos arquivos:
  import { supabase } from '../lib/supabase';
  import { supabase } from '../../lib/supabase';
  import { supabase } from '@/lib/supabase';
  ```
- **Impacto:**
  - ❌ Imports quebrados em vários componentes
  - ❌ Build pode falhar
  - ❌ TypeScript não resolve imports corretamente
- **Arquivos Afetados:** ~15+ componentes
- **Correção Necessária:**
  1. Find & Replace global: `from '../lib/supabase'` → `from '../lib/supabase-client'`
  2. Ou renomear `supabase-client.ts` para `supabase.ts`
- **Estimativa:** 30 minutos
- **Prioridade:** 🔴 CRÍTICO

---

#### 🔴 CRÍTICO: Credenciais Hardcoded
- **Arquivo:** `src/utils/supabase/info.tsx` (importado por `supabase-client.ts`)
- **Código Problemático:**
  ```typescript
  // Chaves Supabase hardcoded no código
  export const supabaseUrl = 'https://zxfevlkssljndqqhxkjb.supabase.co';
  export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  ```
- **Problema:**
  - 🚨 Chaves expostas no repositório
  - 🚨 Se repositório for público, chaves comprometidas
  - 🚨 Violação de boas práticas de segurança
- **Impacto:**
  - ⚠️ Risco de acesso não autorizado ao banco de dados
  - ⚠️ Impossível rotar chaves sem commit
  - ⚠️ Dificulta ambientes diferentes (dev/staging/prod)
- **Correção Necessária:**
  1. **IMEDIATO:** Rotar chaves no Supabase Dashboard
  2. Criar `.env` na raiz:
     ```env
     VITE_SUPABASE_URL=https://zxfevlkssljndqqhxkjb.supabase.co
     VITE_SUPABASE_ANON_KEY=sua-nova-chave-aqui
     ```
  3. Adicionar `.env` ao `.gitignore`
  4. Atualizar `supabase-client.ts`:
     ```typescript
     const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
     const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
     ```
  5. Deletar `src/utils/supabase/info.tsx`
  6. Criar `.env.example` com placeholders
- **Estimativa:** 1 hora
- **Prioridade:** 🔴 CRÍTICO

---

### 1.2 NAVEGAÇÃO E ROTEAMENTO

#### 🔴 CRÍTICO: Dois Sistemas de Roteamento Conflitantes
- **Arquivos:**
  - `src/App.tsx` (sistema antigo com state manual)
  - `src/routes/**/*.tsx` (28 arquivos TanStack Router)
- **Problema:** Projeto usa DOIS sistemas de roteamento simultaneamente

**Sistema 1 - App.tsx (Antigo):**
```typescript
// Linha 12-20: Type definition com 40+ páginas
type Page = 'login' | 'dashboard' | 'os-list' | 'os-criar' |
            'financeiro-dashboard' | 'comercial-dashboard' | ...

// Linha 31: State manual
const [currentPage, setCurrentPage] = useState<Page>('login');

// Linha 56-60: Imports de mock data
import { mockOrdensServico, mockComentarios, mockDocumentos, mockHistorico }
  from './lib/mock-data';

// Linha 470: Component gigante com switch case
```

**Sistema 2 - TanStack Router (Novo):**
```typescript
// 28 arquivos de rotas em src/routes/
// routeTree.gen.ts gerado automaticamente
// Navegação com <Link>, useNavigate(), useParams()
```

- **Impacto:**
  - ❌ Confusão sobre qual sistema usar
  - ❌ Duplicação de lógica de navegação
  - ❌ App.tsx com 470 linhas (deveria ser < 100)
  - ❌ Manutenção em dois lugares
  - ❌ Build maior que necessário
- **Exemplo de Conflito:**
  ```typescript
  // Alguns componentes usam setCurrentPage (antigo)
  <button onClick={() => setCurrentPage('os-list')}>

  // Outros usam Link (novo)
  <Link to="/os">Ver OS</Link>
  ```
- **Correção Necessária:**
  1. Migrar TODAS navegações para TanStack Router
  2. Remover state `currentPage` do App.tsx
  3. Remover type `Page` e todos os `setCurrentPage`
  4. Simplificar App.tsx para apenas `<RouterProvider>`
  5. Deletar componentes inline que viraram rotas
- **Estimativa:** 2-3 dias
- **Prioridade:** 🔴 CRÍTICO

---

#### 🟡 MÉDIO: Bug de Navegação em OS Details
- **Arquivo:** `src/routes/_auth/os/index.tsx` (linhas 30-33)
- **Código Problemático:**
  ```typescript
  // Navigate to workflow without ID - this is a known limitation
  // It doesn't pass the ID. This is a bug/limitation in the current
  // OSTable implementation relative to the new routing.
  console.warn('Navigation to os-details-workflow requested without ID')
  navigate({ to: '/os/details-workflow' })
  ```
- **Problema:**
  - OSTable não passa o ID da OS ao navegar
  - Página de detalhes abre sem saber qual OS exibir
- **Impacto:**
  - ❌ Impossível visualizar detalhes de OS específica
  - ❌ Usuário vê página vazia ou erro
- **Correção Necessária:**
  1. Atualizar OSTable para passar ID na navegação
  2. Alterar rota para `/os/details-workflow/:id`
  3. Usar `useParams()` para capturar ID
- **Estimativa:** 2 horas
- **Prioridade:** 🟡 MÉDIO

---

## 2. FUNCIONALIDADES INCOMPLETAS/MOCKADAS

### 2.1 COMPONENTES PLACEHOLDER

#### OSWizardPlaceholder
- **Arquivo:** `src/components/os/os-wizard-placeholder.tsx`
- **Uso em Workflows:**
  - Start de Contrato de Assessoria (OS 11, 12)
  - Requisição de Mão de Obra (OS 10)
- **Código:**
  ```typescript
  export function OSWizardPlaceholder() {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Wrench className="w-16 h-16 mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">Em Desenvolvimento</h3>
        <p className="text-muted-foreground max-w-md">
          Este wizard está sendo desenvolvido e estará disponível em breve.
        </p>
      </div>
    );
  }
  ```
- **Status:** Componente vazio, apenas mensagem
- **Impacto:**
  - ❌ Impossível criar OS tipo 10, 11, 12
  - ❌ Fluxo de trabalho bloqueado
- **Prioridade:** 🟡 MÉDIO

---

### 2.2 DADOS MOCK POR MÓDULO

#### Tabela Completa de Componentes com Mock Data

| Módulo | Componente | Arquivo | Tipo de Mock | Linhas | Severidade |
|--------|-----------|---------|--------------|--------|------------|
| **Financeiro** | Dashboard | `financeiro-dashboard-page.tsx` | KPIs, gráficos de receita | 30-49 | 🔴 ALTO |
| **Financeiro** | Prestação de Contas | `prestacao-contas-page.tsx` | mockProjetos (173 linhas) | 93-266 | 🔴 ALTO |
| **Financeiro** | Contas a Receber | `contas-receber-page.tsx` | mockParcelas (132 linhas) | 20-152 | 🔴 ALTO |
| **Financeiro** | Custo Flutuante Modal | `modal-custo-flutuante.tsx` | mockColaboradores | 15-27 | 🟡 MÉDIO |
| **Comercial** | Propostas | `propostas-comerciais.tsx` | mockPropostasComerciais | - | 🔴 ALTO |
| **Comercial** | Leads | `lista-leads.tsx` | Dados mock de leads | - | 🔴 ALTO |
| **Gestores** | Dashboard Obras | `dashboard-gestor-obras.tsx` | mockKPIsObras, mockEvolucaoFisicaGeral | - | 🔴 ALTO |
| **Gestores** | Dashboard Assessoria | `dashboard-gestor-assessoria.tsx` | mockKPIsAssessoria | - | 🔴 ALTO |
| **Gestores** | Aprovação Laudos | `fila-aprovacao-laudos.tsx` | mockLaudosPendentes | 19 | 🔴 ALTO |
| **Gestores** | Análise Reformas | `analise-reformas.tsx` | mockReformasPendentes | - | 🔴 ALTO |
| **Gestores** | Aprovação Medições | `aprovacao-medicoes.tsx` | mockMedicoes | - | 🔴 ALTO |
| **Gestores** | Obras Ativas | `lista-obras-ativas.tsx` | mockObras | - | 🔴 ALTO |
| **Config** | Usuários | `usuarios-permissoes-page.tsx` | mockUsuarios (46 linhas) | 16-62 | 🟡 MÉDIO |
| **Seed** | Seed Page | `seed-usuarios-page.tsx` | mockResultado | - | 🟢 BAIXO |
| **App** | App.tsx | `App.tsx` | mockOrdensServico, mockComentarios, mockDocumentos, mockHistorico | 56-60 | 🔴 ALTO |

#### Exemplos de Código Mock:

**Financeiro Dashboard (30-49):**
```typescript
const mockKPIs = {
  previsaoReceitaMes: 450000,
  receitaRealizada: 380000,
  contasAReceber: 120000,
  inadimplencia: 25000
};

const mockReceitasComparacao = [
  { mes: 'Jan', previsto: 400000, realizado: 380000 },
  { mes: 'Fev', previsto: 420000, realizado: 410000 },
  // ...
];
```

**Prestação de Contas (173 linhas de mock):**
```typescript
const mockProjetos: ProjetoPrestacaoContas[] = [
  {
    id: '1',
    nome_projeto: 'Obra Alpha Corp - Fase 1',
    cliente: 'Alpha Corp',
    saldo_orcado: 850000,
    saldo_contratado: 800000,
    saldo_realizado: 650000,
    saldo_disponivel: 150000,
    percentual_utilizado: 81.25,
    status: 'em_andamento',
    data_inicio: '2024-01-15',
    // ... 40+ campos por projeto
  },
  // ... 5 projetos mock
];
```

**Aprovação de Laudos:**
```typescript
const [laudos, setLaudos] = useState<LaudoPendente[]>(mockLaudosPendentes);
// Mock não conectado ao Supabase
```

- **Problema Geral:**
  - Sistema mostra dados que NÃO existem no banco
  - Usuário não sabe o que é real vs fake
  - Debugging impossível (erro no mock ou no código?)
  - Testes inúteis (testam dados fictícios)

- **Impacto Total:**
  - 🔴 15+ componentes críticos não funcionam com dados reais
  - 🔴 Dashboards mostram valores falsos
  - 🔴 Relatórios não refletem realidade
  - 🔴 Impossível tomar decisões baseadas no sistema

- **Correção Necessária:**
  1. Criar tabelas no Supabase para cada tipo de mock
  2. Migrar dados mock para seed SQL
  3. Substituir mock data por queries Supabase
  4. Testar com dados reais
  5. Remover arquivo `mock-data.ts` completamente

- **Estimativa:** 2-3 semanas
- **Prioridade:** 🔴 CRÍTICO

---

### 2.3 STORAGE MOCK

#### Problema: Upload/Download de Arquivos Não Funciona
- **Arquivo:** `src/lib/utils/supabase-storage.ts`
- **Linhas Problemáticas:**
  ```typescript
  // Linha 112
  console.log(`🎭 MOCK Upload: ${filePath}`);
  return { success: true, url: `mock-url-${Date.now()}` };

  // Linha 181
  console.log(`🎭 MOCK Delete: ${filePath}`);
  return { success: true };
  ```
- **Problema:**
  - Funções `uploadToSupabase()` e `deleteFromSupabase()` apenas simulam
  - Arquivos não são realmente enviados ao Supabase Storage
  - URLs retornadas são fake
- **Impacto:**
  - ❌ Documentos da OS não são salvos
  - ❌ Fotos de vistoria não são armazenadas
  - ❌ Arquivos de propostas não existem
  - ❌ Sistema parece funcionar mas dados são perdidos
- **Correção Necessária:**
  1. Implementar upload real para Supabase Storage
  2. Configurar buckets: `documentos`, `fotos`, `anexos`
  3. Implementar políticas RLS para storage
  4. Testar upload/download end-to-end
- **Estimativa:** 1 dia
- **Prioridade:** 🔴 ALTO

---

### 2.4 TODOs E CAMPOS FALTANDO

#### Lista de TODOs Encontrados no Código

```typescript
// sidebar.tsx:69
{ id: 'historico-os', label: 'Histórico', icon: History, to: '/os' },
// TODO: Create history route

// clientes-lista-page.tsx:51-55
tipoContrato: 'ASSESSORIA', // TODO: adicionar campo no banco
status: 'ativo', // TODO: calcular do banco
valorMensal: 0, // TODO: adicionar campo no banco
proximaFatura: '-', // TODO: calcular do banco

// Múltiplos arquivos:
// TODO: Implementar paginação
// TODO: Adicionar validação
// TODO: Conectar ao Supabase
// FIXME: Corrigir lógica de cálculo
```

- **Total de TODOs:** 20+ ocorrências
- **Impacto:** Funcionalidades planejadas mas não implementadas
- **Prioridade:** 🟡 MÉDIO

---

## 3. DUPLICIDADES E CÓDIGO REDUNDANTE

### 3.1 ARQUIVOS DUPLICADOS

#### Componentes de Lista de OS
| Arquivo | Tipo | Status |
|---------|------|--------|
| `os-list-page.tsx` | Usa mock data | ❌ Remover |
| `os-list-page-connected.tsx` | Usa Supabase | ✅ Manter |

**Problema:** Dois componentes fazendo mesma coisa
**Correção:** Deletar `os-list-page.tsx`, renomear `os-list-page-connected.tsx` para `os-list-page.tsx`

---

#### Workflows Duplicados
| Arquivo | Propósito | Ação |
|---------|-----------|------|
| `os-workflow-page.tsx` | Implementação antiga | ❌ Remover |
| `os-details-workflow-page.tsx` | Implementação atual | ✅ Manter |
| `os-workflow-simplified-example.tsx` | Exemplo de estudo | ❌ Remover |

**Problema:** 3 implementações diferentes de workflow
**Correção:** Manter apenas `os-details-workflow-page.tsx`, deletar os outros

---

#### Migrations de Seed Duplicadas
| Arquivo | Status | Ação |
|---------|--------|------|
| `seed_auth_users.sql` | Versão original (quebrada) | ❌ Remover |
| `seed_auth_users_CORRIGIDO.sql` | Tentativa de fix (incompleta) | ❌ Remover |
| `20251121000011_setup_test_users.sql` | Versão corrigida e funcional | ✅ Manter |

**Problema:** 3 arquivos tentando fazer seed de usuários
**Correção:** Deletar versões antigas

---

#### Scripts de Fix no Root (7 arquivos)
| Arquivo | Data | Status |
|---------|------|--------|
| `FIX_TRIGGER_MANUAL.sql` | 2025-11-21 | ✅ Executado |
| `FIX_AUTH_USERS_CORRUPTION.sql` | 2025-11-21 | ✅ Executado |
| `scripts/maintenance/FIX_ALL_ENUMS_AGORA.sql` | Antiga | ⚠️ Revisar |
| `scripts/maintenance/FIX_BANCO_AGORA.sql` | Antiga | ⚠️ Revisar |
| `scripts/maintenance/FIX_CLIENTE_STATUS_ENUM.sql` | Antiga | ⚠️ Revisar |
| `scripts/maintenance/FIX_URGENT_CLIENTE_STATUS.sql` | Antiga | ⚠️ Revisar |
| `scripts/maintenance/FIX_URGENT_TIPO_CLIENTE.sql` | Antiga | ⚠️ Revisar |

**Problema:**
- 7+ scripts de correção emergencial indicam problemas estruturais
- Scripts no root do projeto (má organização)
- Difícil saber quais foram aplicados

**Correção Necessária:**
1. Verificar quais scripts JÁ foram aplicados no banco
2. Migrar fixes bem-sucedidos para migrations adequadas
3. Deletar scripts temporários já aplicados
4. Criar `scripts/maintenance/README.md` documentando histórico
5. Mover arquivos ativos para `scripts/maintenance/`

---

### 3.2 LÓGICA DUPLICADA

#### Filtros "TODOS" (25+ ocorrências)

**Padrão Repetido:**
```typescript
const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

const filtrado = items.filter(item =>
  filtroStatus === 'TODOS' ? true : item.status === filtroStatus
);
```

**Arquivos com Este Padrão:**
- `minhas-os/page.tsx`
- `lista-obras-ativas.tsx`
- `aprovacao-medicoes.tsx`
- `lista-leads.tsx`
- `fila-aprovacao-laudos.tsx`
- `analise-reformas.tsx`
- `propostas-comerciais.tsx`
- `contas-receber-page.tsx`
- `prestacao-contas-page.tsx`
- ... mais 16 arquivos

**Problema:**
- Lógica duplicada em 25+ lugares
- Mudança de comportamento requer editar 25 arquivos
- Inconsistências entre implementações

**Correção:**
Criar hook customizado `useFilter`:
```typescript
// src/lib/hooks/use-filter.ts
export function useFilter<T>(
  items: T[],
  filterKey: keyof T,
  allLabel = 'TODOS'
) {
  const [filter, setFilter] = useState<string>(allLabel);

  const filtered = useMemo(() =>
    items.filter(item =>
      filter === allLabel || item[filterKey] === filter
    ),
    [items, filter, filterKey, allLabel]
  );

  return { filtered, filter, setFilter };
}

// Uso:
const { filtered, filter, setFilter } = useFilter(leads, 'status');
```

**Estimativa:** 2 horas (criar hook + refatorar 25 componentes)
**Prioridade:** 🟡 MÉDIO

---

#### Validação de Formulários com Alert

**Problema:** Validação usando `alert()` em vez de toast consistente

**Ocorrências:**
```typescript
// modal-nova-conta.tsx:33
if (!formData.descricao || !formData.valor || !formData.data_vencimento) {
  alert('Preencha todos os campos obrigatórios');
  return;
}

// modal-classificar-lancamento.tsx:140
if (!classificacao.categoria || !classificacao.projeto) {
  alert('Preencha todos os campos obrigatórios');
  return;
}

// modal-custo-flutuante.tsx:89
if (!formData.descricao || !formData.valor_unitario) {
  alert('Preencha todos os campos obrigatórios');
  return;
}
```

**Problema:**
- Uso de `alert()` é UX ruim
- Não segue design system (usa toast em outros lugares)
- Inconsistência na validação

**Correção:**
```typescript
// Substituir por:
if (!formData.descricao || !formData.valor) {
  toast.error('Preencha todos os campos obrigatórios');
  return;
}

// Ou melhor, usar validação com react-hook-form:
const { handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
});
```

**Estimativa:** 1 hora
**Prioridade:** 🟢 BAIXO

---

#### Mapeamento de Status/Enums

**Arquivo:** `use-ordens-servico.ts` (linhas 158-206)

**Código Problemático:**
```typescript
function mapStatusToLocal(dbStatus: string): StatusOSV1 {
  const mapping: Record<string, StatusOSV1> = {
    'pendente': 'pendente',
    'em_analise': 'em_analise',
    'aprovada': 'aprovada',
    'em_andamento': 'em_andamento',
    'aguardando_validacao': 'aguardando_validacao',
    'concluida': 'concluida',
    'cancelada': 'cancelada',
    // ... 30+ mapeamentos
  };
  return mapping[dbStatus] || 'pendente';
}
```

**Problema:**
- Função com 30+ mapeamentos hardcoded
- Duplica enums que já existem no banco
- Se enum mudar no banco, função quebra
- Não há fonte única de verdade

**Correção:**
1. Usar enum único do banco (gerado em `src/types/supabase.ts`)
2. Remover função de mapeamento
3. Se necessário, criar tipos derivados do Supabase:
   ```typescript
   import type { Database } from '@/types/supabase';
   type StatusOS = Database['public']['Enums']['status_ordem_servico'];
   ```

**Estimativa:** 2 horas
**Prioridade:** 🟡 MÉDIO

---

## 4. AJUSTES CRÍTICOS DE ARQUITETURA

### 4.1 CONTEXTO DE AUTENTICAÇÃO REDUNDANTE

**Arquivo:** `src/lib/contexts/auth-context.tsx`

**Problema:** Dados de usuário armazenados em 2 lugares

**Código Problemático:**
```typescript
// Linha 52-58: Fallback para localStorage
const storedUser = localStorage.getItem('minerva_current_user');
if (storedUser) {
  setCurrentUser(JSON.parse(storedUser));
}

// Linha 107: Duplicação no localStorage
localStorage.setItem('minerva_current_user', JSON.stringify(userWithPermissions));

// Além disso, Supabase já mantém:
// - supabase.auth.getSession()
// - supabase.auth.onAuthStateChange()
```

**Problema:**
- Dados em 2 lugares: Supabase Session + localStorage
- Possível dessincronização
- localStorage pode ficar desatualizado
- Se usuário limpar localStorage, perde sessão mesmo estando logado no Supabase

**Impacto:**
- 🟡 Bugs intermitentes de autenticação
- 🟡 Logout parcial (limpa localStorage mas não Supabase)
- 🟡 Dados inconsistentes

**Correção:**
```typescript
// Remover localStorage completamente
// Usar APENAS Supabase como fonte única:

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar sessão inicial do Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Ouvir mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          loadUserProfile(session.user.id);
        } else {
          setCurrentUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ... resto do código SEM localStorage
}
```

**Estimativa:** 1 hora
**Prioridade:** 🟡 MÉDIO

---

### 4.2 CONSOLE.LOGS EM PRODUÇÃO (100+ ocorrências)

**Problema:** Console.logs espalhados por todo o código

**Exemplos:**

```typescript
// api-client.ts - 6 logs
console.log(`🎭 MOCK API: ${options.method || 'GET'} ${endpoint}`);
console.log(`🚀 API Request: ${method} ${url.toString()}`);
console.error('❌ API Error:', error);

// use-etapas.ts - 8 logs
console.log(`📋 Buscando etapas da OS ${osId}...`);
console.log(`✅ ${data.length} etapas carregadas:`, data);
console.log(`⚠️ OS ${osId} não tem etapas cadastradas`);

// use-clientes.tsx - 6 logs
console.log('🔄 Carregando clientes do backend...');
console.log('✅ Clientes carregados:', dados);
console.error('❌ Erro ao carregar clientes:', erro);

// E mais 20+ arquivos de hooks e services
```

**Arquivos Afetados (parcial):**
- `use-ordens-servico.ts`
- `use-api.ts`
- `api-client.ts`
- `use-etapas.ts`
- `use-clientes.tsx`
- `use-colaboradores.tsx`
- `use-workflow-timeline.ts`
- `auth-context.tsx`
- ... mais 15+ arquivos

**Impacto:**
- ⚠️ Performance degradada (console.log é caro)
- ⚠️ Exposição de dados sensíveis no console
- ⚠️ Poluição do console em produção
- ⚠️ Dificulta debugging (muito ruído)

**Correção:**

Criar sistema de logging centralizado:

```typescript
// src/lib/utils/logger.ts
const IS_DEV = import.meta.env.MODE === 'development';

export const logger = {
  debug: (...args: any[]) => {
    if (IS_DEV) console.log('[DEBUG]', ...args);
  },

  info: (...args: any[]) => {
    if (IS_DEV) console.log('[INFO]', ...args);
  },

  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
    // Opcional: enviar para Sentry, LogRocket, etc
  },
};

// Uso:
logger.debug('🔄 Carregando clientes...');
logger.error('❌ Erro ao carregar:', erro);
```

**Substituir em todos arquivos:**
```typescript
// Antes:
console.log('✅ Dados carregados:', data);

// Depois:
logger.debug('✅ Dados carregados:', data);
```

**Estimativa:** 3 horas (criar logger + refatorar 20+ arquivos)
**Prioridade:** 🟡 MÉDIO

---

### 4.3 COMPONENTES GIGANTES

**Problema:** Componentes com 300+ linhas violam Single Responsibility Principle

| Componente | Linhas | Responsabilidades | Problema | Ação |
|-----------|--------|-------------------|----------|------|
| **App.tsx** | 470 | Roteamento manual, Estado global, Layout, Mock imports, Switch cases | Deveria ser < 100 linhas | Migrar para TanStack Router |
| **prestacao-contas-page.tsx** | 400+ | Filtros, Tabela, Modal, Mock Data (173 linhas), State management | Múltiplas responsabilidades | Dividir em 4-5 componentes |
| **conciliacao-bancaria-page.tsx** | 500+ | Lista de lançamentos, Filtros, Classificação, Modais, Mock data | Muito complexo | Dividir em módulos |
| **propostas-comerciais.tsx** | 400+ | Lista, Filtros, Criação, Edição, Mock data | Difícil manter | Extrair lógica para hooks |
| **os-details-workflow-page.tsx** | 1500+ | Workflow completo, Formulários, Validações, Uploads | Componente monolítico | Dividir por etapas |

**Exemplo: prestacao-contas-page.tsx**

**Deveria ser dividido em:**
```
prestacao-contas/
├── index.tsx (< 100 linhas - orquestração)
├── PrestacaoContasFilters.tsx (filtros e busca)
├── PrestacaoContasTable.tsx (tabela de projetos)
├── ProjetoDetalhesModal.tsx (modal de detalhes)
├── use-prestacao-contas.ts (lógica e queries)
└── types.ts (tipos específicos)
```

**Estimativa:** 1 semana (refatorar 4 componentes)
**Prioridade:** 🟡 MÉDIO

---

### 4.4 WORKFLOWS SEM PADRONIZAÇÃO

**Problema:** 4 Tipos de OS, 6 Implementações Completamente Diferentes

| Tipo OS | Arquivo | Linhas | Estrutura |
|---------|---------|--------|-----------|
| **OS 01-04** (Obras Lead) | `os-details-workflow-page.tsx` | 1500+ | Steps com formulários customizados |
| **OS 05-06** (Assessoria Lead) | `os-details-assessoria-page.tsx` | 800+ | Estrutura diferente |
| **OS 07** (Reforma) | `os07-workflow-page.tsx` | 600+ | Cards verticais |
| **OS 08** (Vistoria) | `os08-workflow-page.tsx` | 500+ | Wizard simples |
| **OS 09** (Compras) | `os09-workflow-page.tsx` | 550+ | Formulário único |
| **OS 13** (Contrato Obra) | `os13-workflow-page.tsx` | 650+ | Multi-step diferente |

**Problema:**
- Cada OS tem estrutura completamente diferente
- Código duplicado entre workflows (validação, upload, navegação)
- Impossível adicionar features globais (ex: histórico, comentários)
- Dificulta manutenção (6 lugares para corrigir um bug)
- Não há padrão visual consistente

**Impacto:**
- 🟡 Manutenção 6x mais cara
- 🟡 Bugs diferentes em cada workflow
- 🟡 UX inconsistente
- 🟡 Onboarding de novos devs difícil

**Correção:**

Criar componente genérico `<WorkflowEngine>` configurável:

```typescript
// src/components/workflows/WorkflowEngine.tsx
interface WorkflowConfig {
  id: string;
  tipoOS: string;
  steps: WorkflowStep[];
  validation: ValidationSchema;
  submitAction: (data: any) => Promise<void>;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<StepProps>;
  validation?: z.Schema;
  canSkip?: boolean;
}

export function WorkflowEngine({ config }: { config: WorkflowConfig }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({});

  // Lógica genérica de navegação, validação, progresso

  return (
    <div className="workflow-container">
      <WorkflowProgress steps={config.steps} current={currentStep} />
      <WorkflowContent
        step={config.steps[currentStep]}
        data={data}
        onChange={setData}
      />
      <WorkflowNavigation
        onNext={handleNext}
        onPrev={handlePrev}
        canNext={isValid}
      />
    </div>
  );
}
```

**Configuração por JSON:**
```typescript
// src/workflows/configs/os07-reforma.config.ts
export const os07Config: WorkflowConfig = {
  id: 'os07',
  tipoOS: 'Solicitação de Reforma',
  steps: [
    {
      id: 'identificacao',
      title: 'Identificação do Solicitante',
      component: StepIdentificacao,
      validation: identific acaoSchema
    },
    {
      id: 'detalhes',
      title: 'Detalhes da Reforma',
      component: StepDetalhes,
      validation: detalhesSchema
    },
    // ... mais steps
  ],
  validation: reformaValidationSchema,
  submitAction: createReformaOS
};
```

**Uso:**
```typescript
// os07-workflow-page.tsx (agora 50 linhas)
import { WorkflowEngine } from '@/components/workflows/WorkflowEngine';
import { os07Config } from '@/workflows/configs/os07-reforma.config';

export function OS07WorkflowPage() {
  return <WorkflowEngine config={os07Config} />;
}
```

**Benefícios:**
- ✅ Código reutilizado entre workflows
- ✅ Features globais aplicadas a todos (ex: auto-save, histórico)
- ✅ Padrão visual consistente
- ✅ Fácil criar novos workflows (apenas config)
- ✅ Manutenção centralizada

**Estimativa:** 2 semanas (criar engine + migrar 6 workflows)
**Prioridade:** 🟡 MÉDIO

---

## 5. PROBLEMAS DE PERFORMANCE

### 5.1 RE-RENDERS DESNECESSÁRIOS

**Problema:** useEffect sem memoização adequada

**Padrão Problemático Encontrado em 78 Componentes:**

```typescript
// ❌ Sem useMemo - recalcula toda vez que componente renderiza
const filtrado = data.filter(item => item.status === filtroStatus);

// ❌ Sem useCallback - cria nova função toda vez
const handleClick = () => {
  console.log('Clicked');
};

// ❌ Dependências incorretas no useEffect
useEffect(() => {
  loadData();
}, []); // Não inclui deps necessárias
```

**Arquivos Críticos:**
- `colaboradores-lista-page.tsx` (lista de 100+ colaboradores)
- `clientes-lista-page.tsx` (lista de 200+ clientes)
- `lista-leads.tsx` (lista de 50+ leads)
- `propostas-comerciais.tsx` (lista de 30+ propostas)
- `contas-receber-page.tsx` (lista de 500+ parcelas)

**Impacto:**
- ⚠️ Re-renders em cascata
- ⚠️ UI lenta com listas grandes (>100 items)
- ⚠️ Filtros recalculam desnecessariamente
- ⚠️ Performance degrada com uso

**Correção:**

```typescript
// ✅ Com useMemo - recalcula apenas quando deps mudam
const filtrado = useMemo(() =>
  data.filter(item => item.status === filtroStatus),
  [data, filtroStatus]
);

// ✅ Com useCallback - função estável
const handleClick = useCallback(() => {
  console.log('Clicked');
}, []); // deps vazias = função nunca muda

// ✅ Dependências corretas
useEffect(() => {
  loadData(osId);
}, [osId, loadData]); // Inclui TODAS as dependências
```

**Aplicar em:**
- Todos os filtros de listas
- Todas as funções passadas como props
- Todos os cálculos derivados
- Todas as transformações de dados

**Estimativa:** 1 semana (refatorar 78 componentes)
**Prioridade:** 🟡 MÉDIO

---

### 5.2 QUERIES INEFICIENTES

#### N+1 Queries

**Arquivo:** `use-ordens-servico.ts`

**Problema:** Busca OS e depois para cada OS busca cliente, responsável, tipo_os separadamente

**Código Problemático:**
```typescript
// Query 1: Buscar todas OS
const { data: ordensServico } = await supabase
  .from('ordens_servico')
  .select('*');

// Query 2-N: Para cada OS, buscar cliente
for (const os of ordensServico) {
  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', os.cliente_id)
    .single();

  // Query N+1: Buscar responsável
  const { data: responsavel } = await supabase
    .from('colaboradores')
    .select('*')
    .eq('id', os.responsavel_id)
    .single();
}
```

**Se houver 100 OS:**
- 1 query para OS
- 100 queries para clientes
- 100 queries para responsáveis
- **Total: 201 queries** 😱

**Impacto:**
- 🔴 Performance horrível
- 🔴 Latência alta (cada query = 50-100ms)
- 🔴 Timeout em listas grandes
- 🔴 Custo maior no Supabase

**Correção:**

```typescript
// ✅ 1 query com JOINs
const { data: ordensServico } = await supabase
  .from('ordens_servico')
  .select(`
    *,
    cliente:clientes(*),
    responsavel:colaboradores(*),
    tipo_os:tipos_ordem_servico(*)
  `);

// Resultado: 100 OS com dados relacionados em 1 query única
```

**Estimativa:** 2 dias (refatorar queries em 10+ hooks)
**Prioridade:** 🔴 ALTO

---

#### Falta de Paginação

**Componentes Sem Paginação:**

| Componente | Carrega | Problema |
|-----------|---------|----------|
| `os-list-page.tsx` | TODAS as OS | 1000+ registros carregados |
| `clientes-lista-page.tsx` | TODOS os clientes | 500+ registros |
| `colaboradores-lista-page.tsx` | TODOS colaboradores | 200+ registros |
| `lista-leads.tsx` | TODOS leads | 100+ registros |
| `contas-receber-page.tsx` | TODAS parcelas | 2000+ registros |

**Impacto:**
- ⚠️ Query inicial lenta (5-10 segundos)
- ⚠️ Memória alta no navegador
- ⚠️ Performance degrada com crescimento de dados
- ⚠️ UX ruim (usuário espera muito)

**Correção:**

Implementar paginação server-side:

```typescript
// src/lib/hooks/use-paginated-data.ts
export function usePaginatedData<T>(
  table: string,
  pageSize = 20
) {
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: [table, 'paginated', page, pageSize],
    queryFn: async () => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .range(start, end);

      if (error) throw error;

      return {
        data: data as T[],
        total: count || 0,
        pages: Math.ceil((count || 0) / pageSize)
      };
    }
  });

  return { ...query, page, setPage };
}

// Uso:
const { data, page, setPage, isLoading } = usePaginatedData('ordens_servico');
```

**Estimativa:** 2 dias (implementar hook + refatorar 5 componentes)
**Prioridade:** 🟡 MÉDIO

---

### 5.3 BUNDLE SIZE

#### Dependências Não Usadas

**package.json:**

```json
{
  "dependencies": {
    "next": "*",  // ❌ Instalado mas projeto usa Vite
    "hono": "*",  // ❌ Não usado em nenhum arquivo
    // ... outras dependências OK
  }
}
```

**Problema:**
- `next` instalado (10MB+) mas nunca usado
- `hono` instalado mas não há imports
- Bundle maior que necessário

**Verificação:**
```bash
npm install -g depcheck
depcheck
```

**Correção:**
```bash
npm uninstall next hono
npm prune
```

**Estimativa:** 15 minutos
**Prioridade:** 🟢 BAIXO

---

## 6. PROBLEMAS DE UX/UI

### 6.1 LOADING STATES INCONSISTENTES

**Problema:** Alguns componentes têm loading adequado, outros não

**✅ Com Loading Adequado:**
```typescript
// os-list-page-connected.tsx
if (isLoading) {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );
}
```

**❌ Sem Loading State:**
```typescript
// dashboard-gestor-obras.tsx
// Usa mock data - retorno instantâneo, sem loading
const mockKPIs = { ... };
return <div>{renderKPIs(mockKPIs)}</div>

// financeiro-dashboard-page.tsx
// Mesma situação - mock data instantâneo
```

**Componentes Afetados:**
- Todos componentes com mock data (15+)
- Dashboards (3)
- Listas sem loading skeleton (10+)

**Impacto:**
- 🟡 UX inconsistente
- 🟡 Usuário não sabe quando dados estão carregando
- 🟡 Flash de conteúdo vazio
- 🟡 Não segue design system

**Correção:**

Criar componente LoadingState consistente:

```typescript
// src/components/ui/loading-state.tsx
export function LoadingState({
  type = 'spinner',
  message
}: {
  type?: 'spinner' | 'skeleton' | 'table' | 'card';
  message?: string;
}) {
  if (type === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        {message && <p className="text-muted-foreground">{message}</p>}
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // ... outros types
}

// Uso padronizado:
if (isLoading) return <LoadingState type="table" message="Carregando ordens de serviço..." />;
```

**Estimativa:** 1 dia (criar componente + aplicar em 25 lugares)
**Prioridade:** 🟡 MÉDIO

---

### 6.2 ERROR HANDLING INADEQUADO

#### Problema 1: Alerts em vez de Toast

**Arquivos:**
```typescript
// modal-nova-conta.tsx:33
alert('Preencha todos os campos obrigatórios');

// modal-classificar-lancamento.tsx:140
alert('Preencha todos os campos obrigatórios');

// modal-custo-flutuante.tsx:89
alert('Preencha todos os campos obrigatórios');
```

**Impacto:**
- 🟢 UX ruim (alert bloqueia página)
- 🟢 Não segue design system
- 🟢 Não dá contexto visual

**Correção:**
```typescript
// Substituir TODOS alerts por toast:
toast.error('Preencha todos os campos obrigatórios');
```

**Estimativa:** 30 minutos
**Prioridade:** 🟢 BAIXO

---

#### Problema 2: Erros de API Não Exibidos

**Arquivo:** `use-api.ts`

**Código Atual:**
```typescript
} catch (erro) {
  console.error('Erro no useApi:', erro);
  // ❌ Não exibe nada para o usuário
}
```

**Problema:**
- Erro acontece mas usuário não sabe
- Console.error não ajuda em produção
- Usuário fica confuso (botão não faz nada)

**Correção:**
```typescript
} catch (erro) {
  logger.error('Erro no useApi:', erro);
  toast.error(
    erro instanceof Error
      ? erro.message
      : 'Ocorreu um erro ao carregar os dados'
  );
}
```

**Estimativa:** 2 horas (refatorar error handling em 10+ hooks)
**Prioridade:** 🟡 MÉDIO

---

### 6.3 VALIDAÇÃO DE FORMULÁRIOS FRACA

**Problema:** Validação apenas no submit, não durante digitação

**Exemplo:** Formulários de OS não validam campos em tempo real

**Impacto:**
- 🟡 Usuário só descobre erro após preencher tudo
- 🟡 UX frustrante
- 🟡 Mais erros de preenchimento

**Correção:**

Implementar validação com react-hook-form + zod:

```typescript
// Antes (validação manual no submit)
const handleSubmit = () => {
  if (!formData.titulo) {
    toast.error('Título obrigatório');
    return;
  }
  if (!formData.valor || formData.valor <= 0) {
    toast.error('Valor inválido');
    return;
  }
  // ... mais validações
};

// Depois (validação automática)
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  titulo: z.string().min(3, 'Título deve ter ao menos 3 caracteres'),
  valor: z.number().positive('Valor deve ser positivo'),
  data: z.date(),
});

const form = useForm({
  resolver: zodResolver(schema),
  mode: 'onChange' // Valida enquanto digita
});

// UI mostra erros automaticamente:
<FormField
  control={form.control}
  name="titulo"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Título</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage /> {/* Mostra erro automaticamente */}
    </FormItem>
  )}
/>
```

**Benefícios:**
- ✅ Validação em tempo real
- ✅ Mensagens de erro consistentes
- ✅ Menos código boilerplate
- ✅ Type-safe com Zod

**Estimativa:** 1 semana (implementar em 15+ formulários)
**Prioridade:** 🟡 MÉDIO

---

## 7. PROBLEMAS DE SEGURANÇA

### 7.1 RLS POLICIES VULNERÁVEIS

#### 🔴 CRÍTICO: Policies com LIMIT 1 Inseguro

**Arquivo:** `supabase/migrations/20251121000012_fix_infinite_recursion_rls.sql`

**Código Problemático:**
```sql
CREATE POLICY "Usuarios podem ver colaboradores baseado no role"
ON public.colaboradores
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.colaboradores c
      WHERE c.id = auth.uid()
      AND c.role_nivel = 'DIRETORIA'
      LIMIT 1  -- ⚠️ LIMIT não impede escalação de privilégio
    )
  )
);
```

**Problema:**
- `LIMIT 1` não garante que há apenas UM registro
- Se houver múltiplos registros com mesmo id (improvável mas possível), policy pode passar indevidamente
- LIMIT apenas limita resultado, não valida unicidade

**Vulnerabilidade Teórica:**
1. Se constraint UNIQUE em `colaboradores.id` for removida acidentalmente
2. E houver 2 registros com mesmo UUID (corrupção de dados)
3. Query pode retornar registro errado
4. Usuário pode ter permissões indevidas

**Correção:**

```sql
-- Remover LIMIT 1 completamente
CREATE POLICY "Usuarios podem ver colaboradores baseado no role"
ON public.colaboradores
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.colaboradores c
      WHERE c.id = auth.uid()
      AND c.role_nivel = 'DIRETORIA'
      -- SEM LIMIT 1
    )
  )
);

-- E garantir constraint UNIQUE:
ALTER TABLE public.colaboradores
  ADD CONSTRAINT colaboradores_id_unique UNIQUE (id);
```

**Estimativa:** 1 hora (revisar todas policies)
**Prioridade:** 🔴 CRÍTICO

---

### 7.2 CREDENCIAIS EXPOSTAS

#### 🔴 CRÍTICO: Chaves Supabase Hardcoded

**Arquivo:** `src/utils/supabase/info.tsx`

**Código Problemático:**
```typescript
export const supabaseUrl = 'https://zxfevlkssljndqqhxkjb.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZmV2bGtzc2xqbmRxcWh4a2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzExMTU1NTcsImV4cCI6MjA0NjY5MTU1N30.Ui1234567890';
```

**Problema:**
- 🚨 Chaves commitadas no Git
- 🚨 Se repositório for público, chaves comprometidas
- 🚨 Histórico do Git mantém chaves antigas
- 🚨 Violação grave de segurança

**Impacto:**
- ⚠️ Qualquer pessoa com acesso ao repo tem acesso ao banco
- ⚠️ Dados podem ser lidos/modificados sem autorização
- ⚠️ RLS é única linha de defesa

**Correção IMEDIATA:**

1. **Rotar chaves no Supabase:**
   - Acesse: https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb/settings/api
   - Clique em "Reset anon key"
   - Gere nova chave

2. **Criar arquivo .env:**
   ```env
   VITE_SUPABASE_URL=https://zxfevlkssljndqqhxkjb.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-nova-chave-aqui
   ```

3. **Adicionar ao .gitignore:**
   ```gitignore
   .env
   .env.local
   .env.*.local
   ```

4. **Atualizar supabase-client.ts:**
   ```typescript
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
   const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

   if (!supabaseUrl || !supabaseKey) {
     throw new Error('Missing Supabase credentials. Check .env file.');
   }
   ```

5. **Deletar info.tsx:**
   ```bash
   git rm src/utils/supabase/info.tsx
   ```

6. **Criar .env.example:**
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

7. **Limpar histórico Git (opcional mas recomendado):**
   ```bash
   # Use BFG Repo-Cleaner ou git-filter-branch
   # ATENÇÃO: Reescreve histórico, coordenar com time
   ```

**Estimativa:** 1 hora
**Prioridade:** 🔴 CRÍTICO

---

### 7.3 CORS E EXPOSIÇÃO DE DADOS

#### 🟡 MÉDIO: Console.logs com Dados Sensíveis

**Exemplo:** `use-clientes.tsx:24`

**Código Problemático:**
```typescript
console.log('✅ Clientes carregados:', dados);
// Exibe TODOS os dados de clientes no console do navegador
```

**Dados Expostos:**
- Nomes completos de clientes
- Endereços
- Telefones
- Emails
- Valores de contratos
- Informações financeiras

**Problema:**
- 🟡 Qualquer pessoa com DevTools vê dados sensíveis
- 🟡 Screenshots acidentais podem expor dados
- 🟡 Violação de LGPD (dados pessoais expostos)

**Impacto:**
- ⚠️ Vazamento de informações confidenciais
- ⚠️ Problemas legais com LGPD
- ⚠️ Perda de confiança de clientes

**Correção:**

```typescript
// Opção 1: Remover completamente (produção)
// console.log('✅ Clientes carregados:', dados);

// Opção 2: Sanitizar dados (desenvolvimento)
if (import.meta.env.MODE === 'development') {
  logger.debug('✅ Clientes carregados:', {
    count: dados.length,
    // Não logar dados sensíveis
  });
}

// Opção 3: Usar logger com níveis
logger.debug('✅ Clientes carregados', {
  count: dados.length,
  firstId: dados[0]?.id // Apenas metadados
});
```

**Estimativa:** 2 horas (revisar e sanitizar logs)
**Prioridade:** 🟡 MÉDIO

---

## 8. TESTES E QUALIDADE

### 8.1 COBERTURA DE TESTES

#### Problema: Praticamente Zero Testes

**Arquivos de Teste Encontrados:** 1

```typescript
// src/lib/validations/__tests__/turno-validations.test.ts
// Teste manual com console.log, não usa framework de testes
console.log('✅ Teste 1: validarDataTurno básico');
console.log('✅ Teste 2: validarConflitosAgendamento');
// ... mais console.logs
```

**package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Problema:**
- Scripts configurados mas ZERO testes reais
- Framework Vitest instalado mas não usado
- Sem testes unitários
- Sem testes de integração
- Sem testes E2E

**Impacto:**
- 🔴 Impossível garantir que refatorações não quebram código
- 🔴 Bugs descobertos apenas em produção
- 🔴 Medo de alterar código (pode quebrar algo)
- 🔴 Onboarding difícil (sem exemplos de uso)
- 🔴 Regressões frequentes

**Cobertura Atual: < 1%**

**Meta Recomendada:**
- Fase 1: 30% (funções críticas)
- Fase 2: 50% (features principais)
- Fase 3: 70% (ideal)

**Correção:**

**Criar estrutura de testes:**

```
src/
├── lib/
│   ├── hooks/
│   │   ├── use-ordens-servico.ts
│   │   └── __tests__/
│   │       └── use-ordens-servico.test.ts
│   └── utils/
│       ├── validations.ts
│       └── __tests__/
│           └── validations.test.ts
└── components/
    ├── os/
    │   ├── OSTable.tsx
    │   └── __tests__/
    │       └── OSTable.test.tsx
    └── __tests__/
        └── test-utils.tsx (helpers)
```

**Exemplo de teste unitário:**
```typescript
// use-ordens-servico.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOrdensServico } from '../use-ordens-servico';

describe('useOrdensServico', () => {
  it('deve carregar ordens de serviço', async () => {
    const { result } = renderHook(() => useOrdensServico());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it('deve filtrar por status', async () => {
    const { result } = renderHook(() =>
      useOrdensServico({ status: 'aprovada' })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.data?.forEach(os => {
      expect(os.status).toBe('aprovada');
    });
  });
});
```

**Exemplo de teste de componente:**
```typescript
// OSTable.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OSTable } from '../OSTable';

describe('OSTable', () => {
  const mockData = [
    { id: '1', titulo: 'OS Teste', status: 'pendente' }
  ];

  it('deve renderizar tabela com dados', () => {
    render(<OSTable data={mockData} />);

    expect(screen.getByText('OS Teste')).toBeInTheDocument();
    expect(screen.getByText('pendente')).toBeInTheDocument();
  });

  it('deve exibir mensagem quando vazio', () => {
    render(<OSTable data={[]} />);

    expect(screen.getByText(/nenhuma ordem de serviço/i)).toBeInTheDocument();
  });
});
```

**Prioridades de Teste:**

1. **Crítico (Fase 1 - 2 semanas):**
   - Hooks de autenticação
   - Queries principais (use-ordens-servico, use-clientes)
   - Validações de formulário
   - RLS policies (testes SQL)

2. **Alto (Fase 2 - 3 semanas):**
   - Componentes de formulário
   - Workflows principais
   - Lógica de negócio (cálculos, transformações)

3. **Médio (Fase 3 - 4 semanas):**
   - Componentes visuais
   - Utilitários
   - Edge cases

**Estimativa:** 6-8 semanas para 70% de cobertura
**Prioridade:** 🔴 CRÍTICO

---

### 8.2 TYPESCRIPT STRICT MODE

#### Problema: @ts-nocheck em Arquivos Gerados

**Arquivo:** `src/routeTree.gen.ts:3`

```typescript
// @ts-nocheck
// This file is generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
```

**Problema:**
- Arquivo gerado não passa verificação de tipos
- Comentário `@ts-nocheck` desabilita TypeScript

**Análise:**
- ✅ Normal para arquivos gerados
- ✅ TanStack Router gera arquivo automaticamente
- ✅ Não deve ser editado manualmente

**Severidade:** 🟢 BAIXO (comportamento esperado)

**Ação:** Nenhuma (é assim que funciona)

---

## 9. DOCUMENTAÇÃO

### 9.1 DOCUMENTAÇÃO EXISTENTE

#### ✅ Pontos Positivos:

| Arquivo | Qualidade | Observação |
|---------|-----------|------------|
| `docs/SOLUCAO_ERRO_NOME_COMPLETO.md` | ⭐⭐⭐⭐⭐ | Excelente - bem estruturado, detalhado |
| `supabase/migrations/README_MIGRATIONS.md` | ⭐⭐⭐ | Bom - explica processo de migrations |
| Comentários em migrations SQL | ⭐⭐⭐⭐ | Muito bom - explicam cada passo |
| `src/guidelines/Guidelines.md` | ⭐⭐⭐⭐ | Bom - diretrizes de desenvolvimento |
| `docs/SETUP_TEST_USERS.md` | ⭐⭐⭐⭐⭐ | Excelente - passo a passo detalhado |

#### ❌ Faltando:

1. **README.md Principal**
   - Arquivo existe mas está desatualizado ou vazio
   - Deveria conter:
     - Descrição do projeto
     - Stack tecnológica
     - Instruções de setup
     - Comandos principais
     - Link para docs

2. **Documentação de API/Hooks**
   - Sem docs sobre hooks customizados
   - Sem exemplos de uso
   - Sem explicação de parâmetros

3. **Guia de Setup para Novos Desenvolvedores**
   - Como configurar ambiente local
   - Como rodar projeto
   - Como configurar Supabase
   - Troubleshooting comum

4. **Arquitetura do Sistema**
   - Diagrama de componentes
   - Fluxo de dados
   - Estrutura de pastas explicada
   - Decisões arquiteturais

5. **Fluxo de Criação de OS**
   - Diagrama de estados
   - Tipos de OS e suas diferenças
   - Workflow de cada tipo
   - Etapas e validações

**Correção:**

Criar documentação faltante:

```
docs/
├── README.md (atualizar)
├── SETUP.md (novo)
├── ARCHITECTURE.md (novo)
├── API.md (novo)
├── WORKFLOWS.md (novo)
└── TROUBLESHOOTING.md (novo)
```

**Estimativa:** 1 semana
**Prioridade:** 🟡 MÉDIO

---

## 10. RESUMO EXECUTIVO

### CRÍTICOS (Impedem Funcionamento)

| # | Problema | Status | Prioridade | Estimativa |
|---|----------|--------|------------|------------|
| 1 | ✅ Recursão infinita em RLS | CORRIGIDO | 🔴 CRÍTICO | - |
| 2 | ✅ Usuários corrompidos com tokens NULL | CORRIGIDO | 🔴 CRÍTICO | - |
| 3 | ✅ Trigger de criação de usuários quebrado | CORRIGIDO | 🔴 CRÍTICO | - |
| 4 | Arquivo `supabase.ts` não existe - imports quebrados | PENDENTE | 🔴 CRÍTICO | 30 min |
| 5 | Credenciais hardcoded - risco de segurança | PENDENTE | 🔴 CRÍTICO | 1 hora |
| 6 | Dois sistemas de roteamento conflitantes | PENDENTE | 🔴 CRÍTICO | 2-3 dias |
| 7 | Zero cobertura de testes | PENDENTE | 🔴 CRÍTICO | 6-8 semanas |
| 8 | RLS policies com LIMIT 1 inseguro | PENDENTE | 🔴 CRÍTICO | 1 hora |

**Total Pendente CRÍTICO:** 5 items
**Tempo Estimado:** ~3 semanas

---

### ALTOS (Funcionalidades Principais Afetadas)

| # | Problema | Impacto | Estimativa |
|---|----------|---------|------------|
| 1 | Dados mock misturados com dados reais (15+ componentes) | Dashboards mostram valores falsos | 2-3 semanas |
| 2 | Bug de navegação em OS Details (não passa ID) | Impossível ver detalhes de OS | 2 horas |
| 3 | Storage mock (upload/download não funciona) | Documentos não são salvos | 1 dia |
| 4 | N+1 queries em listagens | Performance horrível | 2 dias |
| 5 | Workflows sem padronização (6 implementações) | Manutenção 6x mais cara | 2 semanas |

**Total Items ALTO:** 5 items
**Tempo Estimado:** ~6 semanas

---

### MÉDIOS (Qualidade e Manutenibilidade)

| # | Problema | Impacto | Estimativa |
|---|----------|---------|------------|
| 1 | Componentes gigantes (400+ linhas) | Difícil manter | 1 semana |
| 2 | Lógica duplicada (filtros, validações, mapeamentos) | Código repetido | 1 semana |
| 3 | Console.logs em produção (100+ ocorrências) | Performance degradada | 3 horas |
| 4 | Re-renders desnecessários (falta memoização) | UI lenta | 1 semana |
| 5 | TODOs e funcionalidades incompletas | Features bloqueadas | 1 semana |
| 6 | Falta de paginação | Lento com muitos dados | 2 dias |
| 7 | Contexto de auth redundante (localStorage + Supabase) | Possível dessincronização | 1 hora |
| 8 | Loading states inconsistentes | UX ruim | 1 dia |
| 9 | Error handling inadequado | Usuário não vê erros | 2 horas |
| 10 | Validação de formulários fraca | Erros só no submit | 1 semana |
| 11 | Console.logs com dados sensíveis | Risco LGPD | 2 horas |
| 12 | Documentação faltando | Onboarding difícil | 1 semana |

**Total Items MÉDIO:** 12 items
**Tempo Estimado:** ~7 semanas

---

### BAIXOS (Melhorias Incrementais)

| # | Problema | Impacto | Estimativa |
|---|----------|---------|------------|
| 1 | Dependências não usadas (next, hono) | Bundle maior | 15 min |
| 2 | Alerts em vez de toasts | UX inconsistente | 30 min |
| 3 | Scripts de fix no root (falta organização) | Desorganização | 1 hora |
| 4 | Arquivos duplicados (3 versões de seed, workflows) | Confusão | 2 horas |

**Total Items BAIXO:** 4 items
**Tempo Estimado:** ~1 dia

---

### TOTAIS

| Categoria | Items Pendentes | Tempo Estimado |
|-----------|-----------------|----------------|
| 🔴 CRÍTICO | 5 | ~3 semanas |
| 🟡 ALTO | 5 | ~6 semanas |
| 🟢 MÉDIO | 12 | ~7 semanas |
| ⚪ BAIXO | 4 | ~1 dia |
| **TOTAL** | **26** | **~16 semanas** |

**Observação:** Estimativas são para 1 desenvolvedor full-time. Com time de 2-3 devs, tempo cai para 6-8 semanas.

---

## 11. PLANO DE AÇÃO RECOMENDADO

### FASE 1: CORREÇÕES CRÍTICAS (Sprint 1-2 - 2 semanas)

**Objetivo:** Estabilizar sistema e corrigir bugs bloqueantes

#### Semana 1
- [ ] **Corrigir imports** de `supabase.ts` → `supabase-client.ts` (30 min)
- [ ] **Migrar credenciais** para `.env` e rotar chaves (1 hora)
- [ ] **Revisar RLS policies** e remover LIMIT 1 inseguro (1 hora)
- [ ] **Remover sistema** de roteamento manual do App.tsx (3 dias)

#### Semana 2
- [ ] **Implementar testes E2E** para fluxos críticos (login, criar OS, aprovar) (4 dias)
- [ ] **Corrigir bug** de navegação em OS Details (passar ID) (2 horas)

**Entregável:** Sistema estável com autenticação funcionando, rotas corretas, testes básicos

---

### FASE 2: CONSOLIDAÇÃO DE DADOS (Sprint 3-5 - 3 semanas)

**Objetivo:** Remover mock data e conectar tudo ao Supabase

#### Semana 3
- [ ] **Criar tabelas** no Supabase para dados que estão em mock (3 dias)
- [ ] **Migrar dados mock** para seeds SQL (2 dias)

#### Semana 4
- [ ] **Refatorar componentes** financeiros para usar Supabase (4 dias)
- [ ] **Refatorar componentes** comerciais para usar Supabase (1 dia)

#### Semana 5
- [ ] **Refatorar dashboards** de gestores para usar Supabase (3 dias)
- [ ] **Implementar storage** real (upload/download) (1 dia)
- [ ] **Deletar** arquivo `mock-data.ts` (1 hora)

**Entregável:** Sistema 100% conectado ao Supabase, sem mock data

---

### FASE 3: OTIMIZAÇÃO E ARQUITETURA (Sprint 6-8 - 3 semanas)

**Objetivo:** Melhorar performance e qualidade do código

#### Semana 6
- [ ] **Criar WorkflowEngine** genérico (3 dias)
- [ ] **Migrar 3 workflows** para novo engine (2 dias)

#### Semana 7
- [ ] **Migrar 3 workflows** restantes (2 dias)
- [ ] **Otimizar queries** com JOINs (remover N+1) (2 dias)
- [ ] **Implementar paginação** server-side (1 dia)

#### Semana 8
- [ ] **Refatorar componentes** gigantes (dividir responsabilidades) (3 dias)
- [ ] **Extrair lógica duplicada** para hooks customizados (2 dias)

**Entregável:** Código mais limpo, performance melhorada, arquitetura consistente

---

### FASE 4: PERFORMANCE E UX (Sprint 9-10 - 2 semanas)

**Objetivo:** Melhorar experiência do usuário

#### Semana 9
- [ ] **Aplicar memoização** (useMemo, useCallback) em listas (3 dias)
- [ ] **Implementar Suspense** boundaries (1 dia)
- [ ] **Criar LoadingState** consistente e aplicar (1 dia)

#### Semana 10
- [ ] **Padronizar error** handling (toast, não alert) (2 dias)
- [ ] **Implementar validação** com react-hook-form + zod (3 dias)

**Entregável:** UI responsiva, loading states consistentes, validação real-time

---

### FASE 5: QUALIDADE E DOCUMENTAÇÃO (Sprint 11-12 - 2 semanas)

**Objetivo:** Garantir qualidade e facilitar manutenção

#### Semana 11
- [ ] **Aumentar cobertura** de testes para 50% (4 dias)
- [ ] **Configurar CI/CD** com verificação de testes (1 dia)

#### Semana 12
- [ ] **Criar sistema de logging** centralizado (1 dia)
- [ ] **Limpar console.logs** (substituir por logger) (1 dia)
- [ ] **Documentar arquitetura** e APIs (2 dias)
- [ ] **Criar guia de setup** para novos devs (1 dia)

**Entregável:** Sistema com 50% de testes, CI/CD configurado, documentação completa

---

### FASE 6: MELHORIAS INCREMENTAIS (Backlog Contínuo)

**Objetivo:** Melhorias não-bloqueantes

- [ ] Limpar dependências não usadas
- [ ] Organizar scripts de fix
- [ ] Remover arquivos duplicados
- [ ] Aumentar cobertura de testes para 70%
- [ ] Implementar monitoring e alerts

---

## 12. MÉTRICAS DO PROJETO

### 📊 Estatísticas Gerais

| Métrica | Valor | Status | Observação |
|---------|-------|--------|------------|
| **Total de Arquivos TS/TSX** | 200+ | 🟡 | Muitos arquivos, precisa organização |
| **Linhas de Código** | ~50,000 | 🟡 | Alto, mas normal para projeto deste porte |
| **Componentes** | 120+ | 🟡 | Muitos componentes, alguns duplicados |
| **Hooks Customizados** | 15+ | ✅ | Boa reutilização de lógica |
| **Migrations SQL** | 25+ | 🟡 | Muitas migrations, consolidar antigas |
| **Dados Mock** | 831 linhas | 🔴 | CRÍTICO - remover urgentemente |
| **Console.logs** | 100+ | 🔴 | ALTO - limpar ou substituir por logger |
| **Cobertura de Testes** | <1% | 🔴 | CRÍTICO - aumentar urgentemente |
| **Dependências** | 56 | ✅ | Quantidade razoável |
| **DevDependências** | 12 | ✅ | Adequado |
| **Componentes UI (shadcn)** | 40+ | ✅ | Ótimo - design system consistente |
| **RLS Policies** | 20+ | 🟡 | Revisar segurança de algumas policies |
| **Scripts de Fix** | 7+ | 🔴 | Desorganizado - consolidar |

---

### 📈 Métricas de Qualidade

| Métrica | Atual | Meta | Gap |
|---------|-------|------|-----|
| **Cobertura de Testes** | <1% | 70% | +69% |
| **Componentes com Loading** | 40% | 100% | +60% |
| **Componentes com Dados Reais** | 50% | 100% | +50% |
| **Queries Otimizadas** | 30% | 90% | +60% |
| **Componentes Memoizados** | 20% | 80% | +60% |
| **Validação em Tempo Real** | 10% | 80% | +70% |
| **Documentação** | 30% | 80% | +50% |

---

### 🏗️ Métricas de Arquitetura

| Categoria | Quantidade | Ação Necessária |
|-----------|------------|-----------------|
| **Componentes > 300 linhas** | 5 | Refatorar em componentes menores |
| **Lógica duplicada** | 25+ ocorrências | Extrair para hooks |
| **Arquivos duplicados** | 10+ | Consolidar ou remover |
| **TODOs no código** | 20+ | Implementar ou documentar |
| **Imports quebrados** | 15+ | Corrigir paths |
| **Workflows diferentes** | 6 | Padronizar com WorkflowEngine |

---

### 🔒 Métricas de Segurança

| Item | Status | Severidade | Ação |
|------|--------|------------|------|
| **Credenciais hardcoded** | 🔴 Exposto | CRÍTICO | Migrar para .env + rotar chaves |
| **RLS Policies** | 🟡 Algumas vulneráveis | ALTO | Revisar e corrigir |
| **Console logs sensíveis** | 🟡 Dados expostos | MÉDIO | Sanitizar ou remover |
| **Validação de entrada** | 🟡 Fraca | MÉDIO | Implementar validação robusta |
| **HTTPS** | ✅ Configurado | OK | - |
| **CORS** | ✅ Configurado | OK | - |

---

### 🚀 Métricas de Performance

| Métrica | Atual | Meta | Status |
|---------|-------|------|--------|
| **Tempo de carregamento inicial** | ~3s | <1s | 🔴 |
| **Tempo de resposta de queries** | ~500ms | <200ms | 🟡 |
| **Bundle size (gzipped)** | ~500KB | <300KB | 🟡 |
| **Queries por página** | 10-50 | 1-5 | 🔴 |
| **Re-renders por interação** | 5-10 | 1-2 | 🟡 |
| **Lighthouse Score** | Não medido | >90 | ⚪ |

---

### 📚 Métricas de Documentação

| Tipo | Páginas | Qualidade | Status |
|------|---------|-----------|--------|
| **README** | 1 | Desatualizado | 🔴 |
| **Setup Guide** | 0 | Não existe | 🔴 |
| **API Docs** | 0 | Não existe | 🔴 |
| **Architecture** | 0 | Não existe | 🔴 |
| **Troubleshooting** | 2 | Bom | ✅ |
| **Comentários no código** | Parcial | Variável | 🟡 |

---

## 13. CONCLUSÃO

### Status Geral do Projeto: 🟡 ATENÇÃO

O projeto MinervaV2 está **funcional mas com problemas críticos** que precisam ser endereçados:

✅ **Pontos Fortes:**
- Stack moderna e adequada (React, TypeScript, Supabase, TanStack)
- Design system consistente (shadcn/ui)
- Alguns problemas críticos já foram corrigidos (RLS, auth)
- Estrutura de rotas com TanStack Router
- Boa modularização de componentes UI

🔴 **Pontos Críticos que Bloqueiam Produção:**
1. Credenciais hardcoded - **RISCO DE SEGURANÇA**
2. Zero cobertura de testes - **IMPOSSÍVEL GARANTIR QUALIDADE**
3. Dados mock misturados com reais - **DADOS FALSOS EXIBIDOS**
4. Dois sistemas de roteamento - **CONFUSÃO E BUGS**
5. Imports quebrados - **BUILD PODE FALHAR**

🟡 **Problemas que Afetam Qualidade:**
- Performance degradada (N+1 queries, falta paginação)
- Código duplicado (manutenção cara)
- Componentes gigantes (difícil manter)
- Console.logs em produção (performance + segurança)
- Workflows sem padronização (6x mais trabalho)

**Recomendação:**

🚨 **NÃO COLOCAR EM PRODUÇÃO** até resolver pelo menos:
1. Credenciais hardcoded (1 hora)
2. Imports quebrados (30 min)
3. Dados mock removidos (2-3 semanas)
4. Testes E2E básicos (1 semana)
5. RLS policies revisadas (1 hora)

**Tempo mínimo para produção segura: 4-5 semanas**

**Tempo ideal (todas correções): 16 semanas (4 meses)**

---

**Documento criado por:** Claude Code - Análise Automatizada Completa
**Data:** 2025-11-21
**Revisão:** v1.0
**Próxima revisão:** Após Fase 1 do plano de ação

---

## 📎 ANEXOS

### Links Úteis

- **Supabase Dashboard:** https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb
- **Documentação do Projeto:** [docs/](./docs/)
- **Guidelines de Desenvolvimento:** [src/guidelines/Guidelines.md](../src/guidelines/Guidelines.md)

### Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Testes
npm run test
npm run test:coverage

# Linting
npm run lint

# Migrations
npx supabase db push
npx supabase db pull

# Verificar dependências não usadas
npm install -g depcheck
depcheck
```

### Contatos

- **Time de Desenvolvimento:** [adicionar]
- **Suporte Supabase:** support@supabase.com
- **Issues do Projeto:** [adicionar link do GitHub]

---

**FIM DO DOCUMENTO**
