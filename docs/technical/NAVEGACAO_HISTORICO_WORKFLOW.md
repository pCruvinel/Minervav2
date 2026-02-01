# Navegação, Histórico e Estados Read-Only em Workflows

> **Referência**: Implementação padronizada nas OS-05 e OS-06 (Assessoria/Lead).

Este documento descreve o padrão arquitetural para navegação entre etapas, estados de somente leitura (read-only) e o sistema de histórico (adendos) nos workflows de Ordem de Serviço do MinervaV2.

## 1. Conceito de Read-Only

Em um workflow linear ou não-linear (como o Wizard/Stepper), o usuário pode precisar revisitar etapas anteriores. Quando isso acontece, a etapa deve ser apresentada em modo **Read-Only** para evitar edições acidentais em dados já processados, mas permitir a consulta.

### Como funciona

O controle é feito pelo hook `useWorkflowState` e a página principal do workflow (`OSxxWorkflowPage.tsx`).

1.  **Estado Global**: O array `completedSteps` rastreia quais etapas já foram finalizadas.
2.  **Determinação do Modo**:
    ```typescript
    // No componente da página (ex: OS56WorkflowPage.tsx)
    const renderCurrentStepForm = () => {
        // ...
        // Se a etapa atual já estiver na lista de completadas ou a OS inteira for readonly
        const isGlobalReadOnly = readonly || completedSteps.includes(currentStep);
        
        switch (currentStep) {
            case 1:
                return (
                    <StepComponent 
                        data={etapa1Data} 
                        onDataChange={...} 
                        readOnly={isGlobalReadOnly} // <--- Propagação
                    />
                );
            // ...
        }
    };
    ```

## 2. Padrões de Implementação nos Componentes

Os componentes de etapa (`Step...`) devem aceitar uma prop `readOnly?: boolean`. Existem duas estratégias visuais para esse modo:

### Estratégia A: Inputs Desabilitados (Formulário Travado)

Ideal para formulários complexos onde o usuário precisa ver exatamente o que preencheu em cada campo.

```tsx
// Exemplo: StepFollowup1OS5.tsx
export function StepFollowup({ data, onDataChange, readOnly = false }: Props) {
  return (
    <div className="space-y-4">
      <Input 
        value={data.campo} 
        onChange={...} 
        disabled={readOnly} // <--- Travamento direto
      />
      <Select disabled={readOnly}>...</Select>
    </div>
  );
}
```

### Estratégia B: Card de Resumo (Summary View)

Ideal para etapas de seleção simples ou decisão, onde um card resumo é mais elegante que um radio group desabilitado.

```tsx
// Exemplo: StepSelecaoTipoAssessoria.tsx
export function StepSelecao({ data, onDataChange, readOnly = false }: Props) {
  // Retorna visualização alternativa simplificada
  if (readOnly) {
    return (
      <Card className="bg-muted/30">
        <CardContent>
          <div className="text-muted-foreground">Tipo Selecionado:</div>
          <div className="font-bold">{data.tipoOS}</div>
        </CardContent>
      </Card>
    );
  }

  // Retorna formulário normal se não for readOnly
  return (
    <RadioGroup ... />
  );
}
```

## 3. Sistema de Histórico e Adendos

Para permitir que o usuário adicione observações a uma etapa **já concluída** sem alterar seus dados originais (preservando a integridade histórica), utilizamos o padrão de **Adendos**.

### Componente Wrapper: `<StepReadOnlyWithAdendos />`

Este componente envolve o conteúdo da etapa quando ela está visualizada. Se a etapa já foi persistida no banco (possui um `id`), ele exibe uma seção de "Adendos" abaixo do conteúdo.

### Como Implementar na Página

```tsx
// src/components/os/assessoria/os-XX/pages/os-XX-workflow-page.tsx

// 1. Importar o wrapper
import { StepReadOnlyWithAdendos } from '@/components/os/shared/components/step-readonly-with-adendos';

// 2. Na função de renderização do formulário
const renderCurrentStepForm = () => {
    // Buscar definição da etapa atual para ter o ID
    const stepEtapa = etapas?.find(e => e.ordem === currentStep);
    
    // Gerar o conteúdo do formulário (travado ou não)
    const formContent = (
        <StepComponent
            data={...}
            readOnly={isGlobalReadOnly}
        />
    );

    // 3. Envolver com o Wrapper se a etapa existir no banco
    if (stepEtapa?.id) {
        return (
            <StepReadOnlyWithAdendos
                etapaId={stepEtapa.id}
                readonly={isGlobalReadOnly}
            >
                {formContent}
            </StepReadOnlyWithAdendos>
        );
    }

    return formContent;
};
```

### Funcionalidades dos Adendos
- **Listagem**: Mostra comentários adicionados posteriormente, com autor e data.
- **Adição**: Permite inserir novo texto (observação, atualização de status).
- **Persistência**: Usa a tabela `os_etapa_adendos` via hook `useEtapaAdendos`.
- **Integridade**: Não altera os dados JSON da etapa (`dados_etapa`), garantindo que o que foi assinado/aprovado na época se mantém, enquanto novas informações são anexadas.

## 4. Checklist para Novas OSs

Ao criar uma nova OS, garanta que:

1. [ ] Todos os componentes de Step aceitam `readOnly?: boolean`.
2. [ ] O `OSWorkflowPage` passa `readOnly={isGlobalReadOnly}` corretamente.
3. [ ] O `renderCurrentStepForm` utiliza o wrapper `<StepReadOnlyWithAdendos />` quando `stepEtapa.id` existe.

## 5. Marcação de Etapas como Concluídas

Para garantir que o histórico funcione corretamente, as etapas devem ser marcadas como `concluida` no banco de dados.

### Na Criação da OS (Etapa 1)

O hook `useCreateOSWorkflow` cria as etapas como `em_andamento` ou `pendente`. Para a Etapa 1, que geralmente é preenchida antes da criação da OS, devemos forçar a conclusão **imediatamente após a criação**:

```typescript
// Exemplo em OSxxWorkflowPage.tsx - createOSWithClient()

// 1. Criar OS
const result = await createOSWorkflow({ ... });
const newOS = result.os;

// 2. Forçar status concluída para Etapa 1
const etapa1 = result.etapas?.find(e => e.ordem === 1);
if (etapa1?.id) {
    await supabase.from('os_etapas').update({
        status: 'concluida',
        dados_etapa: etapa1Data, // Salvar dados completos
        data_conclusao: new Date().toISOString(),
    }).eq('id', etapa1.id);
}
```

### Ao Avançar Etapas

Use `saveStep(step, false)` (onde false = !isDraft) para marcar como concluída.

```typescript
// Exemplo em handleCustomNextStep()
await saveStep(currentStep, false); // Status = 'concluida'
```

> ⚠️ **Atenção**: Se usar `saveStep(step, true)`, a etapa será salva como `em_andamento` (Draft) e não aparecerá como concluída no histórico/stepper.
