# Guia de Implementação: Workflows com Stepper Horizontal

> **Versão:** 3.0  
> **Data:** 2026-01-18  
> **Padrão:** Stepper Horizontal + Adendos  
> **Referência:** OS-08 (primeira implementação completa)

---

## 📋 Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Componentes Reutilizáveis](#componentes-reutilizáveis)
3. [Implementação Passo a Passo](#implementação-passo-a-passo)
4. [Sistema de Adendos](#sistema-de-adendos)
5. [Hooks de Workflow](#hooks-de-workflow)
6. [Exemplos de Código](#exemplos-de-código)
7. [Checklist de Migração](#checklist-de-migração)

---

## Visão Geral da Arquitetura

### Layout Padrão do Stepper

```
┌─────────────────────────────────────────────────────────┐
│  ← Voltar   [Código OS]                    Progresso X/Y│
├─────────────────────────────────────────────────────────┤
│  [OSHeaderDelegacao - Painel de Delegação]              │
├─────────────────────────────────────────────────────────┤
│  ●──●──●──◯──○──○──○  (WorkflowStepper Horizontal)      │
│  E1 E2 E3 E4 E5 E6 E7                                   │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │ Etapa X: [Título]                    [✓ ou ⏳]  │   │
│  │ Setor: [Nome do Setor]                          │   │
│  ├─────────────────────────────────────────────────┤   │
│  │                                                 │   │
│  │   [Formulário da Etapa Ativa]                   │   │
│  │                                                 │   │
│  │   ─────────────────────────────────────────     │   │
│  │   ▼ Adendos (N)                                 │   │
│  │                                                 │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  [← Etapa Anterior]        [Salvar e Avançar]   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Componentes da Arquitetura

| Componente | Caminho | Descrição |
|------------|---------|-----------|
| `WorkflowStepper` | `shared/components/workflow-stepper.tsx` | Navegação horizontal entre etapas |
| `StepReadOnlyWithAdendos` | `shared/components/step-readonly-with-adendos.tsx` | Wrapper com suporte a adendos |
| `OSHeaderDelegacao` | `shared/components/os-header-delegacao.tsx` | Painel de delegação da OS |
| `useWorkflowState` | `lib/hooks/use-workflow-state.ts` | Estado do workflow (dados, salvamento) |
| `useWorkflowCompletion` | `lib/hooks/use-workflow-completion.ts` | Validação de completude |
| `useEtapaAdendos` | `lib/hooks/use-etapa-adendos.ts` | Gerenciamento de adendos |

---

## Componentes Reutilizáveis

### 1. WorkflowStepper

Navegação horizontal visual entre etapas.

```tsx
import { WorkflowStepper } from '@/components/os/shared/components/workflow-stepper';

<WorkflowStepper
  steps={steps}                    // Array de WorkflowStep
  currentStep={currentStep}        // Etapa ativa (1-indexed)
  completedSteps={completedSteps}  // Array de IDs concluídos
  onStepClick={handleStepChange}   // Callback de navegação
/>
```

**Props:**

| Prop | Tipo | Descrição |
|------|------|-----------|
| `steps` | `WorkflowStep[]` | Definição das etapas |
| `currentStep` | `number` | ID da etapa ativa |
| `completedSteps` | `number[]` | IDs das etapas concluídas |
| `onStepClick` | `(stepId) => void` | Callback ao clicar |
| `lastActiveStep` | `number?` | Indica "você estava aqui" |

**Formato do Step:**

```typescript
interface WorkflowStep {
  id: number;
  title: string;      // Nome completo
  short: string;      // Nome abreviado (exibido no stepper)
  responsible?: string;
  setor?: 'administrativo' | 'assessoria' | 'obras';
  setorNome?: string;
}
```

---

### 2. StepReadOnlyWithAdendos

Wrapper que adiciona seção de adendos a qualquer formulário.

```tsx
import { StepReadOnlyWithAdendos } from '@/components/os/shared/components/step-readonly-with-adendos';

<StepReadOnlyWithAdendos
  etapaId={stepEtapa?.id}    // UUID da etapa no banco
  readonly={isReadOnly}       // Se pode adicionar adendos
>
  <SeuFormulario data={data} readOnly={...} />
</StepReadOnlyWithAdendos>
```

**Características:**
- Collapsible com contador de adendos
- Lista de adendos com autor e data
- Formulário inline para novos adendos
- Modo readonly oculta botão de adicionar

---

### 3. useWorkflowState

Hook principal para gerenciar estado do workflow.

```typescript
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';

const {
  currentStep,         // Etapa atual
  setCurrentStep,      // Navegar para etapa
  formDataByStep,      // { [step]: dados }
  setStepData,         // (step, data) => void
  saveStep,            // (step, complete?) => Promise
  completedSteps,      // Array de IDs
  isLoading,           // Estado de carregamento
  etapas,              // Dados das etapas do banco
  createEtapasBatch,   // Criar todas as etapas
  refreshEtapas,       // Recarregar etapas
} = useWorkflowState({
  osId: finalOsId,
  totalSteps: steps.length,
  initialStep: initialStep,
});
```

---

### 4. useWorkflowCompletion

Hook para validar regras de completude.

```typescript
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';

const completionRules = useMemo(() => ({
  1: (data) => !!(data?.nome && data?.cpf),
  2: (data) => !!(data?.descricao),
  // ... regras por etapa
}), []);

const { completedSteps } = useWorkflowCompletion({
  currentStep,
  formDataByStep,
  completionRules,
  completedStepsFromHook,
});
```

---

## Implementação Passo a Passo

### Passo 1: Definir as Etapas

```typescript
const steps = [
  { id: 1, title: 'Identificação do Cliente', short: 'Cliente', setor: 'administrativo' as const, setorNome: 'Administrativo' },
  { id: 2, title: 'Detalhes da Solicitação', short: 'Solicitação', setor: 'administrativo' as const, setorNome: 'Administrativo' },
  // ... adicionar todas as etapas
];
```

> ⚠️ **Importante:** Use `as const` no campo `setor` para evitar erros de tipagem.

---

### Passo 2: Configurar Hooks

```typescript
// Hook de Estado
const {
  currentStep,
  setCurrentStep,
  formDataByStep,
  setStepData,
  saveStep,
  completedSteps: completedStepsFromHook,
  isLoading,
  etapas,
  createEtapasBatch,
  refreshEtapas,
} = useWorkflowState({
  osId: finalOsId,
  totalSteps: steps.length,
  initialStep,
});

// Hook de Completude
const completionRules = useMemo(() => ({
  1: (data) => !!(data?.identificacao?.nome),
  2: (data) => !!(data?.descricao),
  // ...
}), []);

const { completedSteps } = useWorkflowCompletion({
  currentStep,
  formDataByStep,
  completionRules,
  completedStepsFromHook,
});
```

---

### Passo 3: Criar Handler de Navegação

```typescript
const handleStepChange = (step: number) => {
  if (completedSteps.includes(step) || step === currentStep || step < currentStep) {
    setCurrentStep(step);
  }
};

const handlePrevStep = () => {
  if (currentStep > 1) {
    setCurrentStep(currentStep - 1);
  }
};

const handleSaveAndAdvance = async (): Promise<boolean> => {
  try {
    await saveStep(currentStep, false);
    await refreshEtapas();
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
    toast.success('Etapa concluída!');
    return true;
  } catch (error) {
    logger.error('Erro ao salvar etapa:', error);
    return false;
  }
};
```

---

### Passo 4: Criar Função de Renderização

```typescript
const stepEtapa = etapas?.find(e => e.ordem === currentStep);

const renderCurrentStepForm = () => {
  const formContent = (() => {
    switch (currentStep) {
      case 1:
        return <StepIdentificacao data={etapa1Data} onDataChange={setEtapa1Data} />;
      case 2:
        return <StepDetalhes data={etapa2Data} onDataChange={setEtapa2Data} />;
      // ... cases para todas as etapas
      default:
        return null;
    }
  })();

  // Wrapper com adendos quando etapa existe no banco
  if (stepEtapa?.id) {
    return (
      <StepReadOnlyWithAdendos etapaId={stepEtapa.id} readonly={isReadOnly}>
        {formContent}
      </StepReadOnlyWithAdendos>
    );
  }

  return formContent;
};
```

---

### Passo 5: Montar o Layout

```tsx
return (
  <div className="min-h-screen bg-background flex flex-col">
    {/* Header */}
    <div className="bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/os/$osId" params={{ osId: finalOsId }}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{codigoOS || 'Nova OS'}</h1>
            <p className="text-sm text-muted-foreground">{subtitulo}</p>
          </div>
          <Badge variant="outline">{completedSteps.length} / {steps.length}</Badge>
        </div>
      </div>
    </div>

    {/* Delegação */}
    {finalOsId && <OSHeaderDelegacao osId={finalOsId} tipoOS="OS-XX" steps={steps} />}

    {/* Stepper */}
    <div className="bg-card border-b">
      <div className="max-w-5xl mx-auto">
        <WorkflowStepper
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepChange}
        />
      </div>
    </div>

    {/* Conteúdo */}
    <main className="flex-1 px-6 py-6">
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Etapa {currentStep}: {currentStepInfo?.title}</CardTitle>
            <CardDescription>Setor: {currentStepInfo?.setorNome}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {renderCurrentStepForm()}
          </CardContent>

          {/* Footer de Ações - DENTRO do Card */}
          {!isReadOnly && (
            <div className="border-t bg-muted/30 px-6 py-4">
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={handlePrevStep} disabled={currentStep === 1}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Etapa Anterior
                </Button>
                <Button onClick={handleSaveAndAdvance} disabled={isLoading}>
                  {currentStep === steps.length ? 'Concluir OS' : 'Salvar e Avançar'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </main>
  </div>
);
```

---

## Sistema de Adendos

### Banco de Dados

```sql
CREATE TABLE os_etapas_adendos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    etapa_id uuid REFERENCES os_etapas(id) ON DELETE CASCADE,
    campo_referencia text NOT NULL DEFAULT 'geral',
    conteudo text NOT NULL,
    criado_por_id uuid REFERENCES colaboradores(id),
    criado_em timestamptz DEFAULT now()
);
```

### Hook useEtapaAdendos

```typescript
import { useEtapaAdendos } from '@/lib/hooks/use-etapa-adendos';

const { adendos, addAdendo, isLoading } = useEtapaAdendos(etapaId);

// Adicionar novo adendo
await addAdendo('geral', 'Texto do complemento');
```

### Características
- **Append-only:** Adendos não podem ser editados ou excluídos (auditoria)
- **Histórico completo:** Autor e data/hora registrados
- **Integração automática:** `StepReadOnlyWithAdendos` já gerencia tudo

---

## Checklist de Migração

Ao migrar um workflow existente (Accordion → Stepper):

### Preparação
- [ ] Verificar que todos os steps têm prop `readOnly`
- [ ] Confirmar que hooks de workflow estão implementados
- [ ] Identificar lógica especial da Etapa 1 (criação de OS)

### Execução
- [ ] Substituir import de `WorkflowAccordion` por `WorkflowStepper`
- [ ] Reorganizar layout: Header → Stepper → Card (conteúdo + footer)
- [ ] Mover footer para DENTRO do Card (não usar sticky)
- [ ] Renderizar apenas etapa ativa (não todas as etapas)
- [ ] Integrar `StepReadOnlyWithAdendos` quando `stepEtapa?.id` existe
- [ ] Adicionar `as const` nos campos `setor` dos steps

### Verificação
- [ ] Testar fluxo completo (1 até última etapa)
- [ ] Testar navegação histórica (clicar em etapa anterior)
- [ ] Verificar que etapas futuras estão bloqueadas
- [ ] Testar adição de adendos
- [ ] Verificar responsividade em telas menores

---

## Referências

### Arquivos Principais
- `src/components/os/shared/components/workflow-stepper.tsx`
- `src/components/os/shared/components/step-readonly-with-adendos.tsx`
- `src/lib/hooks/use-workflow-state.ts`
- `src/lib/hooks/use-workflow-completion.ts`
- `src/lib/hooks/use-etapa-adendos.ts`

### Implementação de Referência
- `src/components/os/assessoria/os-8/pages/os08-workflow-page.tsx`

---

> **Autor:** Sistema MinervaV2  
> **Última atualização:** 2026-01-18  
> **Versão:** 3.0 - Stepper Horizontal com Adendos integrados
