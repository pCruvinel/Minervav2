# 🪝 Hooks Reference - Módulo de OS

> **Última Atualização:** 2026-01-25

## Hooks Principais

### `useWorkflowState`

Gerencia o estado completo do workflow de uma OS.

**Arquivo:** `src/lib/hooks/use-workflow-state.ts`

```typescript
const {
  currentStep,        // number - Etapa atual
  setCurrentStep,     // (step: number) => void
  lastActiveStep,     // number - Última etapa ativa
  formDataByStep,     // Record<number, any> - Dados por etapa
  setStepData,        // (step: number, data: any) => void
  saveStep,           // (step: number, isDraft: boolean, data?: any) => Promise
  completedSteps,     // number[] - Etapas concluídas
  etapas,             // OSEtapa[] - Dados do banco
  refreshEtapas       // () => Promise - Recarrega etapas
} = useWorkflowState({ osId, totalSteps });
```

---

### `useWorkflowCompletion`

Valida completude das etapas e determina se pode avançar.

**Arquivo:** `src/lib/hooks/use-workflow-completion.ts`

```typescript
const {
  isStepCompleted,    // (step: number) => boolean
  canAdvanceFromStep, // (step: number) => boolean
  completedSteps,     // number[]
  readyToAdvanceSteps // number[]
} = useWorkflowCompletion({ formDataByStep, completionRules });
```

---

### `useWorkflowNavigation`

Controla navegação entre etapas do workflow.

**Arquivo:** `src/lib/hooks/use-workflow-navigation.ts`

```typescript
const {
  goToNextStep,       // () => void
  goToPreviousStep,   // () => void
  goToStep,           // (step: number) => void
  canGoBack,          // boolean
  canGoForward        // boolean
} = useWorkflowNavigation({ currentStep, totalSteps, completedSteps });
```

---

### `useTransferenciaSetor`

Gerencia handoffs automáticos entre setores.

**Arquivo:** `src/lib/hooks/use-transferencia-setor.ts` (270 linhas)

```typescript
const {
  executarTransferencia,  // (params) => Promise<TransferenciaResult>
  isTransferindo,         // boolean
  error                   // Error | null
} = useTransferenciaSetor();

// Uso
const result = await executarTransferencia({
  osId: 'uuid',
  osType: 'OS-01',
  codigoOS: 'OS-01-0042',
  clienteNome: 'Cliente',
  etapaAtual: 4,
  proximaEtapa: 5,
  nomeProximaEtapa: 'Realizar Visita'
});
```

---

### `useAprovacaoEtapa`

Sistema de aprovação hierárquica.

**Arquivo:** `src/lib/hooks/use-aprovacao-etapa.ts` (217 linhas)

```typescript
const {
  verificarAprovacao,   // () => Promise<AprovacaoStatus>
  solicitarAprovacao,   // (justificativa: string) => Promise
  confirmarAprovacao,   // () => Promise
  rejeitarAprovacao,    // (motivo: string) => Promise
  statusAprovacao,      // 'pendente' | 'aguardando' | 'aprovado' | 'reprovado'
  isLoading
} = useAprovacaoEtapa(osId, etapaOrdem);
```

---

### `useOSWorkflows` (Centralizado)

Hook central para operações de OS.

**Arquivo:** `src/lib/hooks/use-os-workflows.ts` (645 linhas)

#### Sub-hooks exportados:

| Hook | Propósito |
|------|-----------|
| `useCentrosCusto()` | Lista centros de custo ativos |
| `useCargos()` | Lista cargos disponíveis |
| `useColaboradores(filters?)` | Lista colaboradores com filtros |
| `useSetores()` | Lista setores |
| `useTiposOS()` | Lista tipos de OS |
| `useTurnos()` | Lista turnos de trabalho |
| `useCreateOSWorkflow()` | Mutation para criar OS completa |
| `useUploadDocumentoOS()` | Upload de documentos |

```typescript
// Criar OS com etapas
const { mutate: createOS } = useCreateOSWorkflow();

await createOS({
  tipoOSCodigo: 'OS-05',
  clienteId: 'uuid',
  responsavelId: 'uuid',
  descricao: 'Descrição',
  etapas: [
    { ordem: 1, nome_etapa: 'Etapa 1', dados_etapa: {} }
  ]
});
```

---

### `useNotificarCoordenador`

Envia notificações para coordenadores.

**Arquivo:** `src/lib/hooks/use-notificar-coordenador.ts`

```typescript
const { notificar, isNotificando } = useNotificarCoordenador();

await notificar({
  coordenadorId: 'uuid',
  tipo: 'transferencia',
  osId: 'uuid',
  mensagem: 'Nova OS transferida'
});
```

---

### `useOSDocumentUpload`

Upload de documentos para OS.

**Arquivo:** `src/lib/hooks/use-os-document-upload.ts`

```typescript
const { uploadDocumento, isUploading } = useOSDocumentUpload();

const doc = await uploadDocumento({
  osId: 'uuid',
  etapaId: 'uuid',
  file: fileObject,
  tipo: 'PROPOSTA'
});
```

---

### `useOSHierarchy`

Busca relacionamento pai/filha de OS.

**Arquivo:** `src/lib/hooks/use-os-hierarchy.ts`

```typescript
const { osPai, osFilhas, isLoading } = useOSHierarchy(osId);
```

---

### `useEtapaAdendos`

CRUD de adendos em campos de etapas.

**Arquivo:** `src/lib/hooks/use-etapa-adendos.ts`

```typescript
const {
  adendos,
  addAdendo,
  isAdding
} = useEtapaAdendos(etapaId);
```

---

## Hooks de Dados

| Hook | Arquivo | Propósito |
|------|---------|-----------|
| `useClientes` | `use-clientes.tsx` | CRUD de clientes |
| `useOrdensServico` | `use-ordens-servico.ts` | CRUD de OS |
| `useAgendamentos` | `use-agendamentos.ts` | Gestão de agendamentos |
| `useContratos` | `use-contratos.ts` | Gestão de contratos |
| `useEtapas` | `use-etapas.ts` | Operações em etapas |
| `useDashboardData` | `use-dashboard-data.ts` | Dados do dashboard |

---

## Hooks Auxiliares

| Hook | Propósito |
|------|-----------|
| `usePermissoes` | Sistema de permissões |
| `useViaCEP` | Integração com ViaCEP |
| `usePDFGeneration` | Geração de PDFs |
| `useAutoSave` | Auto-save de formulários |
| `useFieldValidation` | Validação de campos |
