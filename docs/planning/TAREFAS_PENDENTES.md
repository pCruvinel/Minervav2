# 📋 Tarefas Pendentes - Minerva v2

**Status:** 4 TODOs identificados
**Prioridade:** Média
**Estimado:** 8-10 horas

---

## TODOs Identificados

### 1️⃣ TODO: Integrar Delegação com API/Supabase
**Arquivo:** `src/components/delegacao/modal-delegar-os.tsx:118`
**Status:** ✅ CONCLUÍDA
**Dificuldade:** Média
**Tempo:** 2-3 horas

#### O que fazer:
```typescript
// Substituir:
console.log('📋 Delegação criada:', novaDelegacao);
await new Promise(resolve => setTimeout(resolve, 800)); // Mock delay

// Por:
try {
  const resultado = await ordensServicoAPI.createDelegacao({
    os_id: osId,
    delegante_id: currentUser.id,
    delegado_id: selectedColaborador.id,
    data_prazo: dataPrazo,
    descricao_tarefa: descricaoTarefa,
    observacoes: observacoes || undefined,
  });

  console.log('✅ Delegação criada no Supabase:', resultado);
} catch (error) {
  console.error('❌ Erro ao criar delegação:', error);
  throw error;
}
```

#### Detalhes:
- Implementar chamada ao `ordensServicoAPI.createDelegacao()`
- Validar resposta da API
- Persistir em `delegacoes` table do Supabase
- Atualizar RLS policies se necessário
- Adicionar tipo `CreateDelegacaoData` em `types.ts`

#### Testes:
- [ ] Delegar OS com dados mínimos (colaborador + descrição)
- [ ] Delegar OS com prazo e observações
- [ ] Verificar que delegação aparece na tabela
- [ ] Verificar que notificação é enviada ao delegado
- [ ] Erro handling quando API falha

---

### 2️⃣ TODO: Implementar Lógica de Etapas Concluídas
**Arquivo:** `src/components/os/os-details-assessoria-page.tsx:185`
**Status:** ⏸️ PENDENTE
**Dificuldade:** Baixa
**Tempo:** 1-2 horas

#### O que fazer:
```typescript
// Substituir:
completedSteps={[]} // TODO: Implementar lógica de etapas concluídas

// Por:
const completedSteps = useMemo(() => {
  if (!etapas || etapas.length === 0) return [];

  return etapas
    .filter((etapa: any) => etapa.status === 'APROVADA')
    .map((etapa: any) => etapa.ordem);
}, [etapas]);

// Depois usar:
completedSteps={completedSteps}
```

#### Detalhes:
- Copiar lógica do `os-details-workflow-page.tsx`
- Filtrar etapas com status === 'APROVADA'
- Extrair campo `ordem` (ou `numero_etapa`)
- Integrar com WorkflowStepper existente

#### Testes:
- [ ] Stepper mostra etapas concluídas (verde)
- [ ] Etapa atual mostra (azul)
- [ ] Etapas futuras mostram bloqueadas (cinza)
- [ ] Dados carregam corretamente ao mudar etapas

---

### 3️⃣ TODO: Usar ID do Usuário Logado (Não Mock)
**Arquivo:** `src/components/os/os-details-workflow-page.tsx:230`
**Status:** ✅ CONCLUÍDA
**Dificuldade:** Baixa
**Tempo:** 1 hora

#### O que fazer:
```typescript
// Substituir:
const colaboradorId = 'user-123'; // Mock

// Por:
import { useAuth } from '../../lib/contexts/auth-context';

const { user: currentUser } = useAuth();
const colaboradorId = currentUser?.id || 'user-unknown';

// Com fallback:
if (!colaboradorId || colaboradorId === 'user-unknown') {
  toast.error('Usuário não identificado. Faça login novamente.');
  return;
}
```

#### Detalhes:
- Usar hook `useAuth()` do contexto
- Validar que user está carregado
- Adicionar error handling
- Usar ID real em todos os uploads

#### Testes:
- [ ] Upload salva collaboradorId correto
- [ ] Erro se usuário não está logado
- [ ] Arquivos aparecem com responsável correto

---

### 4️⃣ TODO: Integrar Auth Context com Supabase
**Arquivo:** `src/lib/contexts/auth-context.tsx` (comentário)
**Status:** ✅ CONCLUÍDA
**Dificuldade:** Alta
**Tempo:** 3-4 horas

#### O que fazer:
```typescript
// Substituir mock data por:
import { supabase } from '../supabase-client';

useEffect(() => {
  const loadUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;
      if (!user) {
        setIsLoggedIn(false);
        return;
      }

      // Buscar dados do usuário na tabela usuarios
      const { data: userData, error: fetchError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      setCurrentUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setIsLoggedIn(false);
    }
  };

  loadUser();
}, []);
```

#### Detalhes:
- Conectar com Supabase Auth
- Sincronizar com tabela `usuarios`
- Setup session listener
- Implementar logout
- Refresh token handling

#### Testes:
- [ ] Login com email/password funciona
- [ ] Session persiste ao refresh
- [ ] Logout limpa dados
- [ ] Novo usuário é criado automaticamente

---

## Checklist de Implementação

### FASE 4.1: Corrigir TODOs (PENDENTE)
- [x] TODO 1: Integrar Delegação com API
  - [x] Implementar `createDelegacao()` no API client
  - [x] Adicionar tipos em `types.ts`
  - [x] Atualizar RLS policies
  - [x] Testes

- [x] TODO 2: Implementar Etapas Concluídas
  - [x] Copiar lógica do workflow page
  - [x] Integrar com assessoria page
  - [x] Testes

- [x] TODO 3: Usar ID Real do Usuário
  - [x] Importar useAuth hook
  - [x] Remover mock data
  - [x] Validar user logado
  - [x] Testes

- [x] TODO 4: Integrar Auth Context (Maior)
  - [x] Conectar Supabase Auth
  - [x] Sincronizar usuarios table
  - [x] Session management
  - [x] Testes de autenticação

---

## Prioridade Recomendada

1. **TODO 3** (1 hora) - Rápido win, melhora experience
2. **TODO 2** (1-2 horas) - Integra com stepper existente
3. **TODO 1** (2-3 horas) - Funcionalidade importante
4. **TODO 4** (3-4 horas) - Refactoring significativo, deixar por último

---

## Notas de Implementação

### Quando Implementar
- TODOs 1-3: Podem ser feitos em paralelo após o stepper estar estável
- TODO 4: Depois que auth básica funcionar, pode requerer refactoring maior

### Dependências
- TODO 1 requer: API client methods, tipos, RLS policies
- TODO 2 requer: tipos de etapa já existem
- TODO 3 requer: useAuth hook já existe
- TODO 4 requer: Supabase auth setup, database migration

### Impacto
- Baixo: TODOs 2, 3 (apenas afetam um componente cada)
- Médio: TODO 1 (envolve API e database)
- Alto: TODO 4 (refactoring de contexto global)

---

## Relacionado ao Plano de Ação

Veja [PLANO_ACAO_STEPPER_OS.md](./PLANO_ACAO_STEPPER_OS.md) para:
- Implementação do stepper (✅ COMPLETO)
- Validação de campos (✅ COMPLETO)
- Auto-save (✅ COMPLETO)
- Filtro de etapas (✅ COMPLETO)
