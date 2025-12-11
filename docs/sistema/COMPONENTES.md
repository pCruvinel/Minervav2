# 06 - Documentação de Componentes - Minerva ERP v2.7

## 🧩 Visão Geral

O Minerva ERP utiliza uma arquitetura de componentes baseada em **Shadcn/ui** (Radix + Tailwind) com componentes de domínio específicos para OS, Calendário e Financeiro.

---

## 📦 Componentes UI Base (Shadcn/ui)

Componentes de UI genéricos em `src/components/ui/`:
- `Button`, `PrimaryButton` - Botões com variantes
- `Card`, `CardHeader`, `CardContent` - Containers
- `Dialog`, `DialogContent` - Modais
- `Input`, `Select`, `Textarea` - Formulários
- `Toast` - Notificações
- `Badge` - Labels de status
- `Skeleton` - Loading states

---

## 🎯 Componentes de Domínio

### WorkflowStepper

**Descrição**: Componente visual de progresso de etapas da OS.

**Localização**: `src/components/os/shared/components/workflow-stepper.tsx`

**Props:**
```typescript
interface WorkflowStepperProps {
  steps: StepDefinition[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
}
```

**Uso:**
```tsx
<WorkflowStepper
  steps={OS_WORKFLOW_STEPS}
  currentStep={5}
  completedSteps={[1, 2, 3, 4]}
  onStepClick={handleStepClick}
/>
```

---

### FeedbackTransferencia

**Descrição**: Modal exibido após transferência automática de setor (v2.7).

**Localização**: `src/components/os/shared/components/feedback-transferencia.tsx`

**Props:**
```typescript
interface FeedbackTransferenciaProps {
  isOpen: boolean;
  onClose: () => void;
  transferencia: TransferenciaInfo;
  osId: string;
}
```

**Uso:**
```tsx
<FeedbackTransferencia
  isOpen={showFeedback}
  onClose={() => setShowFeedback(false)}
  transferencia={transferenciaInfo}
  osId={osId}
/>
```

---

### CadastrarLead

**Descrição**: Formulário de cadastro/seleção de cliente (Etapa 1 de OS).

**Localização**: `src/components/os/shared/steps/cadastrar-lead.tsx`

**Props:**
```typescript
interface CadastrarLeadProps {
  initialData?: EtapaData;
  onDataChange: (data: EtapaData) => void;
  onSelectLead?: (cliente: Cliente) => void;
}
```

---

### CalendarioSemana

**Descrição**: Visualização semanal do calendário com turnos e agendamentos.

**Localização**: `src/components/calendario/calendario-semana.tsx`

**Props:**
```typescript
interface CalendarioSemanaProps {
  turnos: Turno[];
  agendamentos: Agendamento[];
  onTurnoClick?: (turno: Turno, data: Date) => void;
}
```

---

## 🗂️ Estrutura de Componentes de OS

```
src/components/os/
├── shared/                    # Componentes compartilhados
│   ├── components/
│   │   ├── workflow-stepper.tsx
│   │   ├── workflow-footer.tsx
│   │   └── feedback-transferencia.tsx   # v2.7
│   ├── pages/
│   │   └── os-details-workflow-page.tsx
│   └── steps/
│       ├── cadastrar-lead.tsx           # Etapa 1
│       ├── step-followup-1.tsx          # Etapa 3
│       ├── step-gerar-proposta.tsx      # Etapa 9
│       └── ...
│
├── obras/                     # OS-01 a OS-04, OS-13
│   └── os-13/
│       ├── pages/
│       └── steps/
│
├── assessoria/               # OS-05 a OS-08, OS-11, OS-12
│   ├── os-5-6/
│   ├── os-7/
│   ├── os-8/
│   ├── os-11/
│   └── os-12/
│
└── administrativo/           # OS-09, OS-10
    ├── os-9/
    └── os-10/
```

---

## 🔧 Hooks Customizados

### useTransferenciaSetor

**Descrição**: Hook para sistema de transferência automática de setor (v2.7).

**Localização**: `src/lib/hooks/use-transferencia-setor.ts`

**Retorno:**
```typescript
{
  verificarMudancaSetor: (osType, etapaAtual, proximaEtapa) => boolean;
  executarTransferencia: (params) => Promise<TransferenciaResult>;
  isProcessing: boolean;
  error: string | null;
}
```

---

### useOrdensServico

**Descrição**: Hook para operações CRUD de Ordens de Serviço.

**Localização**: `src/lib/hooks/use-ordens-servico.ts`

---

### useWorkflowState

**Descrição**: Hook para gerenciar estado do workflow (etapa atual, dados por etapa).

**Localização**: `src/lib/hooks/use-workflow-state.ts`

---

**Status**: ✅ Preenchido para Minerva v2.7
**Última Atualização**: 11/12/2025