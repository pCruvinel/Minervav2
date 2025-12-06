# 📋 ROLLOUT: Padronização de IDs e Persistência Obrigatória

**Data de Criação:** 06/12/2025  
**Objetivo:** Replicar o padrão de "Save on Next" (criação obrigatória de OS na Etapa 1) para TODOS os fluxos de OS do sistema Minerva.

---

## 🎯 Padrão Implementado

### Backend (Já Implementado ✅)
- Tabela `os_sequences` com controle por `tipo_os_id`
- Trigger `trigger_generate_os_id` gera código no formato `OS{TIPO}{SEQUENCIA}`
- Exemplos: `OS1300001`, `OS0500002`, `OS0900023`

### Frontend (Regra a Aplicar)
1. **Remoção do Modo Demo:** Nenhuma OS pode avançar da Etapa 1 para a 2 sem ter um `id` real no banco
2. **Save on Next:** O botão "Avançar" da Etapa 1 deve:
   - Validar dados do formulário
   - Executar `await createOS(dados)` ou método equivalente
   - Receber ID (UUID) e código formatado (ex: `OS1300001`)
   - Atualizar estado interno (`setInternalOsId`)
   - Só então avançar para Step 2

---

## 📊 Status por OS

### ✅ JÁ CORRIGIDOS

| OS | Arquivo | Padrão Usado | Status |
|----|---------|--------------|--------|
| **OS 05-06** | `src/components/os/assessoria/os-5-6/pages/os-details-assessoria-page.tsx` | `handleNextStep` customizado + `stepLeadRef.current.saveData()` | ✅ Modelo de referência |
| **OS 07** | `src/components/os/assessoria/os-7/pages/os07-workflow-page.tsx` | `handleIdentificarCliente` + `ordensServicoAPI.create()` | ✅ Cria OS antes de avançar etapa |
| **OS 08** | `src/components/os/assessoria/os-8/pages/os08-workflow-page.tsx` | `useAutoCreateOS` hook | ✅ **CORRIGIDO 06/12/2025** |
| **OS 09** | `src/components/os/administrativo/os-9/pages/os09-workflow-page.tsx` | `useAutoCreateOS` hook | ✅ Auto-criação na montagem |
| **OS 10** | `src/components/os/administrativo/os-10/pages/os10-workflow-page.tsx` | `useAutoCreateOS` hook | ✅ **CORRIGIDO 06/12/2025** |
| **OS 11** | `src/components/os/assessoria/os-11/pages/os11-workflow-page.tsx` | `useAutoCreateOS` hook | ✅ **CORRIGIDO 06/12/2025** |
| **OS 12** | `src/components/os/assessoria/os-12/pages/os12-workflow-page.tsx` | `useAutoCreateOS` hook | ✅ **CORRIGIDO 06/12/2025** |
| **OS 13** | `src/components/os/obras/os-13/pages/os13-workflow-page.tsx` | `handleNextStep` customizado + `stepLeadRef.current.saveData()` | ✅ Idêntico ao OS 05-06 |

### ⚠️ FASE 2 - Requer Reescrita Completa

| OS | Arquivo | Problema | Ação |
|----|---------|----------|------|
| **OS 1-4** | `src/components/os/obras/os-1-4/pages/workflow-page.tsx` | Componente totalmente mockado com dados estáticos. Não usa hooks de workflow. | **Reescrita completa necessária** - usar `os13-workflow-page.tsx` como base |

---

## 📝 Detalhes Técnicos por OS

### OS 08 - Visita Técnica / Parecer Técnico

**Arquivo:** `src/components/os/assessoria/os-8/pages/os08-workflow-page.tsx`

**Problema Atual:**
```typescript
// Usa useWorkflowNavigation sem customização
const {
  handleStepClick,
  handleReturnToActive,
  handleNextStep, // ❌ handleNextStep padrão não cria OS
  handlePrevStep
} = useWorkflowNavigation({ ... });
```

**Solução:**
1. Não usar `handleNextStep` do hook
2. Criar `handleNextStep` customizado
3. Na Etapa 1, usar `useAutoCreateOS` para criar OS automaticamente

---

### OS 10 - Requisição de Mão de Obra (RH)

**Arquivo:** `src/components/os/administrativo/os-10/pages/os10-workflow-page.tsx`

**Problema Atual:** Mesmo do OS 08 - não cria OS na Etapa 1.

**Solução:** Idêntica ao OS 08 - implementar `useAutoCreateOS`.

---

### OS 11 - Laudo Pontual Assessoria

**Arquivo:** `src/components/os/assessoria/os-11/pages/os11-workflow-page.tsx`

**Problema Atual:**
```typescript
// Usa CadastrarLead mas não cria OS
{currentStep === 1 && (
  <CadastrarLead
    ref={cadastrarLeadRef}
    selectedLeadId={selectedLeadId}
    onSelectLead={(leadId, leadData) => {
      setSelectedLeadId(leadId);
      setStepData(1, { ...etapa1Data, leadId, leadData });
    }}
    // ❌ Não há criação de OS ao avançar
  />
)}
```

**Solução:**
1. Adicionar `useAutoCreateOS` ou criar `handleNextStep` customizado
2. Criar OS usando dados do lead selecionado

---

### OS 12 - Assessoria Técnica Mensal/Anual

**Arquivo:** `src/components/os/assessoria/os-12/pages/os12-workflow-page.tsx`

**Problema Atual:** Mesmo do OS 08/10 - não cria OS na Etapa 1.

**Solução:** Implementar `useAutoCreateOS` para auto-criação.

---

### OS 1-4 - Obras (Perícias, Laudos, etc.)

**Arquivo:** `src/components/os/obras/os-1-4/pages/workflow-page.tsx`

**Problema Atual:**
```typescript
// Componente completamente mockado - NÃO usa:
// - useWorkflowState
// - useWorkflowNavigation
// - useWorkflowCompletion
// - Nenhuma integração com Supabase
// - Dados estáticos hardcoded
```

**Solução:** 
- **Reescrita completa** usando `os13-workflow-page.tsx` como template
- Pode ser adiado para fase 2 do projeto

---

## ✅ Checklist de Execução

### Fase 1: Correções Rápidas (Auto-Create Pattern) - ✅ CONCLUÍDA

- [x] **OS 08** - Adicionado `useAutoCreateOS` + ajustada navegação
- [x] **OS 10** - Adicionado `useAutoCreateOS` + ajustada navegação
- [x] **OS 11** - Adicionado `useAutoCreateOS` + ajustada navegação
- [x] **OS 12** - Adicionado `useAutoCreateOS` + ajustada navegação

### Fase 2: Reescrita Completa - 📋 PENDENTE

- [ ] **OS 1-4** - Reescrever usando arquitetura moderna

### Validação Final

- [ ] Testar criação de cada tipo de OS
- [ ] Verificar formato do código gerado (ex: `OS0800001`)
- [ ] Confirmar ausência de logs "modo demonstração"
- [ ] Validar persistência dos dados após reload

---

## 📐 Template de Correção

```typescript
// 1. Importar hook de auto-criação
import { useAutoCreateOS } from '@/lib/hooks/use-auto-create-os';

// 2. Adicionar hook no componente
const {
  createOSWithFirstStep,
  isCreating: isCreatingOS,
  createdOsId
} = useAutoCreateOS({
  tipoOS: 'OS-XX', // Código do tipo
  nomeEtapa1: 'Nome da Primeira Etapa',
  enabled: !osId
});

// 3. Auto-criar na montagem (se não tiver osId)
useEffect(() => {
  if (!osId && !isCreatingOS) {
    createOSWithFirstStep().catch(console.error);
  }
}, [osId, isCreatingOS, createOSWithFirstStep]);

// 4. Navegar após criação
useEffect(() => {
  if (createdOsId && !osId) {
    navigate({
      to: '/os/criar/tipo-especifico',
      search: { osId: createdOsId },
      replace: true
    });
  }
}, [createdOsId, osId, navigate]);
```

---

## 🔗 Referências

- **Hook de Auto-Criação:** `src/lib/hooks/use-auto-create-os.ts`
- **Hook de Estado:** `src/lib/hooks/use-workflow-state.ts`
- **API de OS:** `src/lib/api-client.ts` → `ordensServicoAPI`
- **Modelo OS 13:** `src/components/os/obras/os-13/pages/os13-workflow-page.tsx`

