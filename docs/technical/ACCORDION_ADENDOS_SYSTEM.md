# 📋 Sistema de Accordion com Adendos para Workflows de OS

> **Versão:** 3.0  
> **Data:** 2026-01-13  
> **Status:** ✅ Produção | OS-07, OS-08 | Detalhes OS  
> **Autor:** Equipe MinervaV2

---

## 1. Visão Geral

O **Sistema de Accordion com Adendos** é a abordagem padrão do MinervaV2 para visualização e gerenciamento de workflows de Ordens de Serviço (OS). 

### 1.1 Características Principais

| Característica | Descrição |
|----------------|-----------|
| **Accordion Múltiplo** | `type="multiple"` permite múltiplas etapas expandidas simultaneamente |
| **Estado Visual Correto** | Etapas concluídas mantêm cor verde mesmo quando expandidas |
| **Resumo Read-Only** | Etapas concluídas exibem resumo dos dados preenchidos |
| **Formulário Editável** | Etapa atual exibe formulário completo para edição |
| **Sistema de Adendos** | Permite adicionar complementos a etapas concluídas |
| **Append-Only** | Adendos são imutáveis após inserção (auditoria) |
| **Navegação Preservada** | Clicar em etapa concluída não altera `currentStep` |
| **Badge Adendo** | 🆕 Exibe badge com contagem de adendos por etapa |

### 1.2 Status de Implementação

| OS | Nome | Status | Pattern |
|----|------|--------|---------|
| ✅ **OS-07** | Termo de Comunicação de Reforma | Implementado | Accordion |
| ✅ **OS-08** | Visita Técnica / Parecer Técnico | Implementado | Accordion |
| ✅ **OS 5-6** | Assessoria Lead | **Implementado (v3.0)** | Accordion |
| ⏳ **OS 1-4** | Workflows de Obras | Implementado | Accordion (parcial) |
| ⏳ **OS 9-13** | Outros | Pendente | Variado |

---

## 2. Arquitetura de Componentes Reutilizáveis


### 2.1 Mapa de Componentes

```
src/
├── lib/hooks/                           # 🔧 HOOKS REUTILIZÁVEIS
│   ├── use-etapa-adendos.ts            # ✅ Core: Gerenciar adendos
│   ├── use-workflow-state.ts           # ✅ Core: Estado do workflow
│   ├── use-workflow-completion.ts      # ✅ Core: Validação de completude
│   ├── use-etapas.ts                   # ✅ Core: CRUD etapas
│   ├── use-unified-workflow.ts         # ✅ Core: Workflow unificado multi-OS
│   ├── use-os-responsabilidade.ts      # 🆕 v3.1: Responsabilidade e delegação
│   ├── use-etapa-permissoes.ts         # 🆕 v3.1: Permissões por etapa
│   ├── use-os-hierarchy.ts             # Hierarquia de OS
│   └── use-workflow-navigation.ts      # Navegação entre etapas
│
├── lib/types/                           # 📝 TIPOS
│   └── os-responsabilidade.ts          # 🆕 v3.1: Tipos de responsabilidade
│
├── components/os/shared/components/     # 🎨 COMPONENTES REUTILIZÁVEIS
│   ├── workflow-accordion.tsx          # ✅ PRINCIPAL: Accordion de etapas
│   ├── workflow-step-summary.tsx       # ✅ PRINCIPAL: Resumo genérico
│   ├── field-with-adendos.tsx          # ✅ PRINCIPAL: Campo com adendos
│   ├── step-responsibility-header.tsx  # 🆕 v3.1: Cabeçalho de responsabilidade
│   ├── delegacao-modal.tsx             # 🆕 v3.1: Modal de delegação
│   ├── os-participantes-panel.tsx      # 🆕 v3.1: Painel de participantes
│   ├── workflow-footer.tsx             # Navegação inferior
│   ├── os-details-accordion.tsx        # Visualização read-only
│   ├── file-upload-section.tsx         # Upload de arquivos
│   └── file-upload-with-description.tsx # Upload com descrição
│
├── components/os/unified/               # 🔄 COMPONENTES UNIFICADOS
│   ├── unified-workflow-stepper.tsx    # ✅ NOVO v3.0: Stepper com badge Adendo
│   ├── quick-actions-panel.tsx         # Painel de ações rápidas
│   └── index.ts
│
└── components/os/shared/pages/          # 📄 PÁGINAS COMPARTILHADAS
    ├── os-details-redesign-page.tsx    # ✅ Detalhes da OS (usa UnifiedWorkflowStepper)
    └── os-details-workflow-page.tsx    # Workflow de Obras
```


---

## 3. Componentes Principais

### 3.1 WorkflowAccordion

**Arquivo:** `src/components/os/shared/components/workflow-accordion.tsx`  
**Linhas:** ~207

O componente central para edição de workflows em formato accordion.

#### Interface

```typescript
export interface WorkflowStepDefinition {
    id: number;
    title: string;
    short?: string;
    responsible?: string;
}

interface WorkflowAccordionProps {
    steps: WorkflowStepDefinition[];
    currentStep: number;
    formDataByStep: Record<number, unknown>;
    completedSteps: number[];
    onStepChange?: (step: number) => void;
    renderForm: (step: number) => ReactNode;
    renderSummary: (step: number, data: unknown) => ReactNode;
    className?: string;
}
```

#### Lógica de Estados

| Estado | Condição | Cor | Badge | Conteúdo |
|--------|----------|-----|-------|----------|
| **Concluída** | `completedSteps.includes(id)` | Verde (`success`) | ✓ Concluída | `renderSummary` |
| **Atual** | `id === currentStep && !isCompleted` | Azul (`primary`) | Atual | `renderForm` |
| **Pendente** | `!isCompleted && !isCurrent` | Cinza (`muted`) | - | Bloqueada |

#### Importação

```typescript
import { WorkflowAccordion, WorkflowStepDefinition } from '@/components/os/shared/components/workflow-accordion';
```

---

### 3.2 UnifiedWorkflowStepper ⭐ NOVO v3.0

**Arquivo:** `src/components/os/unified/unified-workflow-stepper.tsx`  
**Linhas:** ~461

Stepper para visualização **read-only** de workflows hierárquicos (Lead → Contrato) com suporte a badge de Adendos.

#### Interface

```typescript
interface UnifiedWorkflowStepperProps {
    osId: string;
    onStepClick?: (step: UnifiedStep, targetOSId: string) => void;
    isNavigating?: boolean;
}

// UnifiedStep inclui contagem de adendos
interface UnifiedStep {
    id: string;
    nome_etapa: string;
    status: 'pendente' | 'em_andamento' | 'concluida' | 'bloqueada' | 'cancelada';
    ordemOriginal: number;
    ordemUnificada: number;
    osId: string;
    osCodigo: string;
    tipoOS: string;
    fase: 'LEAD' | 'CONTRATO' | 'SATELITE';
    adendosCount?: number;  // 🆕 Contagem de adendos
}
```

#### Badge de Adendo

O componente exibe automaticamente badge rosa quando `step.adendosCount > 0`:

```tsx
{step.adendosCount && step.adendosCount > 0 && (
    <Badge 
        variant="outline" 
        className="bg-secondary/20 text-secondary-foreground border-secondary/40"
    >
        <MessageSquarePlus className="w-3 h-3 mr-1" />
        {step.adendosCount > 1 ? `${step.adendosCount} Adendos` : 'Adendo'}
    </Badge>
)}
```

#### Importação

```typescript
import { UnifiedWorkflowStepper } from '@/components/os/unified';
```

#### Uso na Página de Detalhes

```tsx
// os-details-redesign-page.tsx - Tab "workflow"
<TabsContent value="workflow">
    <UnifiedWorkflowStepper osId={osId} />
</TabsContent>
```

---

### 3.3 WorkflowStepSummary

**Arquivo:** `src/components/os/shared/components/workflow-step-summary.tsx`  
**Linhas:** ~221

Componente genérico para exibir resumo de uma etapa em formato de grid.

#### Interface

```typescript
export type SummaryFieldType = 'text' | 'date' | 'datetime' | 'currency' | 'boolean' | 'list' | 'files';

export interface SummaryField {
    label: string;
    value: string | number | boolean | null | undefined | any[];
    type?: SummaryFieldType;
    fullWidth?: boolean;
}

interface WorkflowStepSummaryProps {
    fields: SummaryField[];
    className?: string;
    columns?: 1 | 2 | 3;
}
```

#### Configuração por OS

```typescript
// Exemplo: OS-08
export const OS_08_SUMMARY_CONFIG: Record<number, (data: any) => SummaryField[]> = {
    1: (data) => [
        { label: 'Nome/Razão Social', value: data?.identificacao?.nome },
        { label: 'CPF/CNPJ', value: data?.identificacao?.cpfCnpj },
        // ...
    ],
    // etapas 2-7...
};
```

---

### 3.4 FieldWithAdendos

**Arquivo:** `src/components/os/shared/components/field-with-adendos.tsx`  
**Linhas:** ~206

Campo que exibe valor original imutável e permite adicionar adendos.

#### Interface

```typescript
interface FieldWithAdendosProps {
    label: string;
    campoKey: string;
    valorOriginal: string | number | boolean | null | undefined;
    dataOriginal?: string;
    adendos: EtapaAdendo[];
    etapaId: string;
    onAddAdendo: (campoKey: string, conteudo: string) => Promise<boolean>;
    canAddAdendo?: boolean;
    className?: string;
}
```

#### Importação

```typescript
import { FieldWithAdendos } from '@/components/os/shared/components/field-with-adendos';
```

---

## 4. Hooks Reutilizáveis

### 4.1 useEtapaAdendos

**Arquivo:** `src/lib/hooks/use-etapa-adendos.ts`

```typescript
import { useEtapaAdendos } from '@/lib/hooks/use-etapa-adendos';

const { adendos, addAdendo, getAdendosByCampo, isLoading, refreshAdendos } = useEtapaAdendos(etapaId);

// Buscar adendos de um campo
const adendosMotivo = getAdendosByCampo('motivo_procura');

// Adicionar adendo
await addAdendo('campo_key', 'Complemento do campo');
```

### 4.2 useWorkflowState

**Arquivo:** `src/lib/hooks/use-workflow-state.ts`

```typescript
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';

const {
    currentStep, setCurrentStep,
    formDataByStep, setStepData,
    saveStep, refreshEtapas,
    completedSteps,
    etapas, isLoading
} = useWorkflowState({ 
    osId,
    totalSteps: steps.length,
    initialStep: initialStep  // 🆕 Navegação direta
});
```

### 4.3 useWorkflowCompletion

**Arquivo:** `src/lib/hooks/use-workflow-completion.ts`

```typescript
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';

const { completedSteps, isStepCompleted, canAdvanceFromStep, progressPercentage } = useWorkflowCompletion({
    currentStep,
    formDataByStep,
    completionRules,
    completedStepsFromHook
});
```

### 4.4 useUnifiedWorkflow

**Arquivo:** `src/lib/hooks/use-unified-workflow.ts`

```typescript
import { useUnifiedWorkflow } from '@/lib/hooks/use-unified-workflow';

// Busca etapas de múltiplas OS (Lead + Contrato) com contagem de adendos
const { 
    phases,        // WorkflowPhase[]
    allSteps,      // UnifiedStep[] com adendosCount
    totalSteps, 
    completedSteps,
    loading,
    childrenOS 
} = useUnifiedWorkflow(osId);
```

---

## 5. Modelo de Dados

### 5.1 Tabela `os_etapas_adendos`

```sql
CREATE TABLE os_etapas_adendos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    etapa_id uuid NOT NULL REFERENCES os_etapas(id) ON DELETE CASCADE,
    campo_referencia text NOT NULL,
    conteudo text NOT NULL,
    criado_por_id uuid NOT NULL REFERENCES colaboradores(id),
    criado_em timestamptz NOT NULL DEFAULT now(),
    
    CONSTRAINT adendo_conteudo_not_empty CHECK (length(trim(conteudo)) > 0)
);

-- Índices
CREATE INDEX idx_os_etapas_adendos_etapa_id ON os_etapas_adendos(etapa_id);
CREATE INDEX idx_os_etapas_adendos_campo ON os_etapas_adendos(etapa_id, campo_referencia);
CREATE INDEX idx_os_etapas_adendos_criado_em ON os_etapas_adendos(criado_em DESC);
```

### 5.2 Row Level Security (RLS)

```sql
-- SELECT: Todos autenticados
CREATE POLICY "adendos_select_authenticated" ON os_etapas_adendos
    FOR SELECT TO authenticated USING (true);

-- INSERT: Apenas autor próprio
CREATE POLICY "adendos_insert_authenticated" ON os_etapas_adendos
    FOR INSERT TO authenticated WITH CHECK (criado_por_id = auth.uid());

-- ❌ SEM policies de UPDATE/DELETE = APPEND-ONLY
```

---

## 6. Integração na Página de Detalhes da OS

### 6.1 Tab "Etapas" (workflow)

A página `os-details-redesign-page.tsx` utiliza o `UnifiedWorkflowStepper` para exibir o workflow unificado:

```tsx
// src/components/os/shared/pages/os-details-redesign-page.tsx

import { UnifiedWorkflowStepper } from '@/components/os/unified';

// Na tab "workflow"
<TabsContent value="workflow" className="space-y-4">
    <Card>
        <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Workflow Completo
            </CardTitle>
        </CardHeader>
        <CardContent>
            <UnifiedWorkflowStepper osId={osId} />
        </CardContent>
    </Card>
</TabsContent>
```

### 6.2 Navegação para Etapa Específica

Ao clicar em uma etapa, o usuário é redirecionado para a página de workflow com `initialStep`:

```tsx
// URL gerada: /os/details-workflow/{osId}?step={ordemOriginal}

// details-workflow.$id.tsx passa initialStep:
<OS08WorkflowPage
    osId={id}
    initialStep={step}      // Da URL
    readonly={readonly}
    codigoOS={os.codigo_os}
    tipoOSNome={os.tipo_os_nome}
/>
```

### 6.3 Badge de Adendo

O `UnifiedWorkflowStepper` exibe badge "Adendo" automaticamente:

```
┌─────────────────────────────────────────────────────────┐
│ Etapa 3: Agendar Visita                                 │
│ Etapa 3 • OS-08-0001                                    │
│        ✓ Concluída   📝 Adendo     [Ver →]              │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Checklist para Implementar em Nova OS

### 7.1 Arquivos Necessários

- [ ] Criar/Atualizar página de workflow: `os-XX-workflow-page.tsx`
- [ ] Criar configuração de summary: `OS_XX_SUMMARY_CONFIG`
- [ ] Atualizar rota em `details-workflow.$id.tsx`

### 7.2 Imports Obrigatórios

```typescript
// Componentes
import { WorkflowAccordion, WorkflowStepDefinition } from '@/components/os/shared/components/workflow-accordion';
import { WorkflowStepSummary } from '@/components/os/shared/components/workflow-step-summary';
import { FieldWithAdendos } from '@/components/os/shared/components/field-with-adendos';
import { WorkflowFooter } from '@/components/os/shared/components/workflow-footer';

// Hooks
import { useWorkflowState } from '@/lib/hooks/use-workflow-state';
import { useWorkflowCompletion } from '@/lib/hooks/use-workflow-completion';
import { useEtapaAdendos } from '@/lib/hooks/use-etapa-adendos';
```

### 7.3 Estrutura da Página

```typescript
export function OSXXWorkflowPage({ osId, initialStep, codigoOS, tipoOSNome }: Props) {
    // 1. Definir etapas
    const steps: WorkflowStepDefinition[] = [...];
    
    // 2. Hooks de estado
    const { currentStep, formDataByStep, saveStep, etapas } = useWorkflowState({
        osId, totalSteps: steps.length, initialStep
    });
    
    // 3. Hook de completude
    const { completedSteps } = useWorkflowCompletion({...});
    
    // 4. Hook de adendos
    const currentEtapa = etapas?.find(e => e.ordem === currentStep);
    const { addAdendo, getAdendosByCampo } = useEtapaAdendos(currentEtapa?.id);
    
    // 5. Renderizar
    return (
        <WorkflowAccordion
            steps={steps}
            currentStep={currentStep}
            formDataByStep={formDataByStep}
            completedSteps={completedSteps}
            renderForm={renderForm}
            renderSummary={renderSummary}
        />
    );
}
```

---

## 8. Changelog

| Versão | Data | Alterações |
|--------|------|------------|
| **3.0** | 2026-01-13 | Adicionado UnifiedWorkflowStepper, badge Adendo, mapeamento completo de componentes |
| 2.0 | 2026-01-13 | Documentação completa após discovery |
| 1.0 | 2026-01-12 | Implementação inicial em OS 7/8 |

---

## 9. Referências

- [OS_07_08_09_TECHNICAL_DOCUMENTATION.md](./OS_07_08_09_TECHNICAL_DOCUMENTATION.md)
- [OS_01_04_TECHNICAL_DOCUMENTATION.md](./OS_01_04_TECHNICAL_DOCUMENTATION.md)
- [OS_5_6_ACCORDION_MIGRATION_PLAN.md](../planning/OS_5_6_ACCORDION_MIGRATION_PLAN.md)
