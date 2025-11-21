# Guia de Migração: Unified Workflow Stepper

Este guia descreve o processo de migração de workflows legados para a nova arquitetura unificada do `WorkflowStepper` (OS 5-6).

## Visão Geral

A nova arquitetura utiliza hooks customizados para gerenciar o estado, navegação e persistência, removendo a lógica complexa dos componentes de página.

### Principais Mudanças

1.  **Estado Centralizado:** `useWorkflowState` substitui múltiplos `useState`.
2.  **Navegação Padronizada:** `useWorkflowNavigation` gerencia avançar/voltar.
3.  **Persistência Automática:** Integração direta com `useEtapas` e Supabase.
4.  **Componente Único:** `WorkflowStepper` substitui implementações ad-hoc de steppers.

## Passo a Passo da Migração

### 1. Preparar o Componente da Página

Substitua a gestão de estado manual pelos hooks unificados.

```tsx
// ANTES
const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState({});

// DEPOIS
const {
  currentStep,
  setCurrentStep,
  formDataByStep,
  setStepData,
  saveStep,
  // ... outros retornos
} = useWorkflowState({
  osId,
  totalSteps: steps.length
});
```

### 2. Configurar Navegação

Implemente o hook de navegação para lidar com as ações do usuário.

```tsx
const {
  handleStepClick,
  handleNextStep,
  handlePrevStep
} = useWorkflowNavigation({
  totalSteps: steps.length,
  currentStep,
  setCurrentStep,
  onSaveStep: (step) => saveStep(step, false) // Auto-save
});
```

### 3. Implementar Regras de Conclusão

Defina as regras que determinam se uma etapa está completa.

```tsx
const completionRules = useMemo(() => ({
  1: (data) => !!data.campoObrigatorio,
  2: (data) => data.arquivos.length > 0,
}), []);

const { completedSteps } = useWorkflowCompletion({
  currentStep,
  formDataByStep,
  completionRules
});
```

### 4. Atualizar o JSX

Substitua o stepper antigo e utilize os novos handlers.

```tsx
<WorkflowStepper 
  steps={steps}
  currentStep={currentStep}
  onStepClick={handleStepClick}
  completedSteps={completedSteps}
/>

// ... Renderização das Etapas ...

<WorkflowFooter
  currentStep={currentStep}
  totalSteps={steps.length}
  onPrevStep={handlePrevStep}
  onNextStep={handleNextStep}
/>
```

### 5. Adaptar Componentes de Etapa

Certifique-se de que os componentes de etapa aceitem `data` e `onDataChange`.

```tsx
// Exemplo de Wrapper
const setEtapa1Data = (data) => setStepData(1, data);

<StepComponent
  data={formDataByStep[1] || initialData}
  onDataChange={setEtapa1Data}
  readOnly={isHistoricalNavigation}
/>
```

## Checklist de Verificação

- [ ] O estado é preservado ao recarregar a página?
- [ ] A navegação bloqueia avanço se a etapa for inválida?
- [ ] O modo "Histórico" ativa ao visitar etapas anteriores?
- [ ] O upload de arquivos funciona com o ID do usuário real?
- [ ] O auto-save ocorre ao mudar de etapa?
