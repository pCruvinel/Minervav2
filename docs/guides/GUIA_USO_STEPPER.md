# Guia de Uso: Unified Workflow Stepper

Este guia documenta a API e o uso dos componentes e hooks do sistema de Workflow Unificado.

## Componentes Principais

### `WorkflowStepper`

Componente visual que exibe o progresso e permite navegação entre etapas.

**Props:**
- `steps`: Array de objetos `WorkflowStep` (id, title, status, etc).
- `currentStep`: Número da etapa atual (1-based).
- `onStepClick`: Função chamada ao clicar em um step.
- `completedSteps`: Array de números das etapas concluídas.
- `lastActiveStep`: (Opcional) Última etapa ativa para navegação histórica.

```tsx
<WorkflowStepper 
  steps={steps}
  currentStep={currentStep}
  onStepClick={handleStepClick}
  completedSteps={completedSteps}
/>
```

### `WorkflowFooter`

Barra de ações inferior com botões de navegação padrão.

**Props:**
- `currentStep`: Número da etapa atual.
- `totalSteps`: Total de etapas.
- `onPrevStep`: Handler para voltar.
- `onNextStep`: Handler para avançar.
- `onSaveDraft`: (Opcional) Handler para salvar rascunho.
- `isLoading`: Estado de carregamento.
- `readOnlyMode`: Se true, esconde botões de edição.

## Hooks

### `useWorkflowState`

Gerencia o estado dos dados do formulário e a etapa atual.

**Parâmetros:**
- `osId`: ID da Ordem de Serviço (para persistência).
- `totalSteps`: Número total de etapas.
- `initialStep`: Etapa inicial (padrão: 1).

**Retorno:**
- `currentStep`, `setCurrentStep`
- `formDataByStep`, `setStepData`
- `saveStep(step, isDraft)`
- `isLoading`

### `useWorkflowNavigation`

Gerencia a lógica de transição entre etapas e validação de navegação.

**Parâmetros:**
- `totalSteps`
- `currentStep`
- `setCurrentStep`
- `onSaveStep`: Callback executado antes de avançar.

**Retorno:**
- `handleNextStep`: Avança e salva.
- `handlePrevStep`: Volta sem validar.
- `handleStepClick`: Navega para etapa específica (com restrições).

### `useWorkflowCompletion`

Calcula dinamicamente quais etapas estão concluídas com base em regras.

**Parâmetros:**
- `currentStep`
- `formDataByStep`
- `completionRules`: Objeto mapeando `stepId` -> `função de validação`.

**Retorno:**
- `completedSteps`: Array de IDs de etapas concluídas.
- `isCurrentStepValid`: Booleano indicando se a etapa atual está válida.

## Exemplo Completo

Consulte `src/components/os/os09-workflow-page.tsx` para um exemplo de implementação completa utilizando todos os hooks e componentes.
