# 📋 Documentação Técnica: OS-05 e OS-06 - Assessoria Lead

**Última Atualização:** 2026-01-14  
**Versão:** v3.1  
**Status Implementação:** 98% ✅  
**Setor:** Assessoria

> **🎉 ATUALIZAÇÃO v3.1:** Correções de persistência de dados implementadas!

---

## 📌 Visão Geral

As **Ordens de Serviço OS-05 e OS-06** representam o fluxo comercial completo para serviços de **Assessoria** no sistema Minerva ERP. Estas duas OS compartilham o mesmo workflow de 12 etapas, diferindo principalmente no tipo de serviço (Recorrente vs. Pontual) e na OS filha gerada ao final.

### Tipos de OS Compartilhando o Workflow

| Código | Nome | Descrição | OS Filha Gerada |
|--------|------|-----------|-----------------|
| **OS-05** | Assessoria Recorrente (Mensal) | Assessoria técnica contínua com visitas programadas | **OS-12** (Execução) |
| **OS-06** | Assessoria Pontual (Avulsa) | Laudo técnico pontual ou parecer específico | **OS-11** (Execução) |

### Características Principais

- **12 Etapas** compartilhadas entre as duas OS
- **Sem Handoffs** entre setores (todo workflow no Administrativo)
- **Aprovação Obrigatória** em Etapas 6 (Proposta) e 10 (Contrato)
- **Geração Automática de OS Filha** na Etapa 12

---

## 🏗 Arquitetura do Sistema

### 🗂 Estrutura de Arquivos

```
src/
├── components/os/assessoria/os-5-6/
│   ├── pages/
│   │   ├── os-5-6-workflow-page.tsx        # ✅ NOVO - Componente Accordion (783 linhas)
│   │   ├── os-details-assessoria-page.tsx  # ⚠️ DEPRECATED - Legado Stepper
│   │   ├── os05-workflow-page.tsx          # ⚠️ DEPRECATED - Stub
│   │   └── os06-workflow-page.tsx          # ⚠️ DEPRECATED - Stub
│   └── steps/
│       ├── index.ts                          # Exports
│       ├── step-selecao-tipo-assessoria.tsx  # Etapa 2 específica
│       └── step-ativar-contrato-assessoria.tsx # Etapa 12 específica
│
├── components/os/shared/
│   ├── components/
│   │   ├── workflow-accordion.tsx          # ✅ Accordion principal
│   │   ├── workflow-step-summary.tsx       # ✅ Resumo read-only
│   │   ├── field-with-adendos.tsx          # ✅ Campo com adendos
│   │   ├── workflow-footer.tsx             # Footer com ações
│   │   ├── feedback-transferencia.tsx      # Modal de feedback
│   │   └── aprovacao-modal.tsx             # Modal de aprovação
│   └── steps/
│       ├── cadastrar-lead.tsx                # Etapa 1
│       ├── step-followup-1-os5.tsx           # Etapa 3 (OS-05 específico)
│       ├── step-followup-1-os6.tsx           # Etapa 3 (OS-06 específico)
│       ├── step-escopo-assessoria.tsx        # Etapa 4
│       ├── step-precificacao-assessoria.tsx  # Etapa 5
│       ├── step-gerar-proposta.tsx           # Etapa 6
│       ├── step-agendar-apresentacao.tsx     # Etapa 7
│       ├── step-realizar-apresentacao.tsx    # Etapa 8
│       ├── step-analise-relatorio.tsx        # Etapa 9
│       ├── step-gerar-contrato.tsx           # Etapa 10
│       └── step-contrato-assinado.tsx        # Etapa 11
│
├── lib/
│   ├── hooks/
│   │   ├── use-workflow-state.ts             # Estado do workflow
│   │   ├── use-workflow-navigation.ts        # Navegação entre etapas
│   │   ├── use-workflow-completion.ts        # Validação de completude
│   │   ├── use-etapa-adendos.ts              # ✅ NOVO - Sistema de adendos
│   │   ├── use-aprovacao-etapa.ts            # Sistema de aprovação
│   │   ├── use-os-workflows.ts               # Hook centralizado OS
│   │   └── use-os.ts                         # Hook de OS individual
│   └── constants/
│       └── os-ownership-rules.ts             # Regras de responsabilidade
│
└── routes/_auth/os/criar/
    └── assessoria-lead.tsx                   # ✅ Rota atualizada com feature flag
```

### 📜 Arquivos Deprecated

| Arquivo | Status | Motivo |
|---------|--------|--------|
| `os-details-assessoria-page.tsx` | ⚠️ DEPRECATED | Usa WorkflowStepper tradicional |
| `os05-workflow-page.tsx` | ⚠️ DEPRECATED | Stub básico |
| `os06-workflow-page.tsx` | ⚠️ DEPRECATED | Stub básico |

> **Feature Flag:** `USE_OS56_ACCORDION = true` permite rollback rápido.

---

## 🎹 Sistema de Accordion com Adendos (v3.0)

### Visão Geral da Nova Arquitetura

A partir da versão 3.0, o workflow de OS 5-6 utiliza o padrão **WorkflowAccordion** com suporte a **Adendos**, alinhado com OS-07 e OS-08.

### Componente Principal

**Arquivo:** `os-5-6-workflow-page.tsx` (783 linhas)

```typescript
interface OS56WorkflowPageProps {
  onBack?: () => void;
  tipoOS?: 'OS-05' | 'OS-06';
  osId?: string;
  initialStep?: number;
  readonly?: boolean;
  codigoOS?: string;
  tipoOSNome?: string;
}
```

### Hooks Utilizados

| Hook | Função |
|------|--------|
| `useWorkflowState` | Estado do workflow, dados por etapa |
| `useWorkflowCompletion` | Validação de completude |
| `useEtapaAdendos` | CRUD de adendos por campo |
| `useAprovacaoEtapa` | Sistema de aprovação hierárquica |
| `useTransferenciaSetor` | Handoffs entre setores |
| `useCreateOSWorkflow` | Criação de OS e OS filha |

### Componentes Reutilizáveis

```tsx
// Accordion expandível por etapa
<WorkflowAccordion
  steps={STEPS}
  currentStep={currentStep}
  formDataByStep={formDataByStep}
  completedSteps={completedSteps}
  renderForm={renderForm}
  renderSummary={renderSummary}
/>

// Footer com navegação
<WorkflowFooter
  currentStep={currentStep}
  totalSteps={12}
  onPrevStep={handlePrevStep}
  onNextStep={handleNextStep}
  onSaveDraft={handleSaveDraft}
/>
```

### Configuração de Resumo por Etapa

Cada etapa possui uma configuração de campos para exibição read-only:

```typescript
const OS_56_SUMMARY_CONFIG: Record<number, (data: any) => SummaryField[]> = {
  1: (data) => [
    { label: 'Nome/Razão Social', value: data?.nome },
    { label: 'CPF/CNPJ', value: data?.cpfCnpj },
    { label: 'Email', value: data?.email },
    { label: 'Telefone', value: data?.telefone },
  ],
  // ... demais etapas
};
```

### Sistema de Adendos

Campos de etapas concluídas suportam **Adendos** (alterações imutáveis):

```tsx
<FieldWithAdendos
  label="Nome/Razão Social"
  campoKey="nome_razao_social"
  valorOriginal={data?.nome}
  adendos={getAdendosByCampo('nome_razao_social')}
  etapaId={etapa.id}
  onAddAdendo={handleAddAdendo}
  canAddAdendo={isCompleted && !readonly}
/>
```

---

## 🔄 Fluxo de 12 Etapas

### 📊 Tabela Completa de Etapas

| # | Etapa | Responsável | Prazo | Setor | Aprovação Obrigatória |
|:-:|-------|-------------|:-----:|-------|:---------------------:|
| **1** | Identifique o Lead | Administrativo | 1 dia | Administrativo | ❌ |
| **2** | Seleção do Tipo de OS | Administrativo | 1 dia | Administrativo | ❌ |
| **3** | Follow-up 1 (Entrevista Inicial) | Administrativo | 4 dias | Administrativo | ❌ |
| **4** | Memorial (Escopo e Prazos) | Administrativo | 2 dias | Administrativo | ❌ |
| **5** | Precificação (Formulário Financeiro) | Administrativo | 1 dia | Administrativo | ❌ |
| **6** | Gerar Proposta Comercial | Administrativo | 1 dia | Administrativo | ✅ |
| **7** | Agendar Visita (Apresentação) | Administrativo | 3 dias | Administrativo | ❌ |
| **8** | Realizar Visita (Apresentação) | Administrativo | 1 dia | Administrativo | ❌ |
| **9** | Follow-up 3 (Pós-Apresentação) | Administrativo | 2 dias | Administrativo | ❌ |
| **10** | Gerar Contrato (Upload) | Administrativo | 1 dia | Administrativo | ✅ |
| **11** | Contrato Assinado | Administrativo | 2 dias | Administrativo | ❌ |
| **12** | Ativar Contrato | Sistema | -- | Sistema | ❌ |

> **Prazo Total:** 19 dias úteis (sem contar os prazos de aprovação)

---

## 🔀 Ownership Rules (Sem Handoffs)

### Conceito

Diferente das OS de Obras (OS 1-4), as OS de Assessoria **não possuem transferências de setor**. Todo o workflow permanece sob responsabilidade do **Coordenador Administrativo**.

### Definição no Sistema

**Arquivo:** `os-ownership-rules.ts`

```typescript
const OS_ASSESSORIA_BASICA_RULE: OSOwnershipRule = {
  osType: 'OS-05-06',
  os Name: 'Assessoria Básica (Mensal / Laudo Pontual)',
  initiator: 'coord_administrativo',
  totalSteps: 12,
  stageOwners: [
    { range: [1, 12], cargo: 'coord_administrativo', setor: 'administrativo' },
  ],
  handoffPoints: [], // ✅ SEM HANDOFFS - Coord. Admin responsável por todas as etapas
};
```

### Implicações

- ✅ **Fluxo Simplificado**: Sem necessidade de coordenação entre setores
- ✅ **Responsabilidade Única**: Coordenador Administrativo gerencia todo ciclo
- ✅ **Sem Modal de Transferência**: Não exibe feedback de handoff
- ✅ **Agilidade**: Menos pontos de espera para troca de responsável

---

## ✅ Sistema de Aprovação Hierárquica

### Etapas com Aprovação Obrigatória

| Etapa | Nome | Aprovador | Status |
|:-----:|------|-----------|:------:|
| **6** | Gerar Proposta Comercial | Coordenador de Assessoria | ✅ Implementado |
| **10** | Gerar Contrato (Upload) | Diretor | ✅ Implementado |

### Implementação Atual (v2.7)

**Hooks e Componentes:**
- `useAprovacaoEtapa` - Hook para verificar status de aprovação
- `AprovacaoModal` - Modal para solicitar/aprovar/rejeitar

**Fluxo de Aprovação:**
```typescript
// Estado para modal
const [isAprovacaoModalOpen, setIsAprovacaoModalOpen] = useState(false);
const [etapaNomeParaAprovacao, setEtapaNomeParaAprovacao] = useState('');

// Hook de aprovação
const { aprovacaoInfo } = useAprovacaoEtapa(osId, currentStep);

// Verificação antes de avançar (em handleNextStep)
if (aprovacaoInfo?.requerAprovacao && aprovacaoInfo.statusAprovacao !== 'aprovada') {
  if (aprovacaoInfo.statusAprovacao === 'pendente' || aprovacaoInfo.statusAprovacao === 'rejeitada') {
    setEtapaNomeParaAprovacao(etapaNome);
    setIsAprovacaoModalOpen(true);
    return; // Bloqueia avanço
  }
  if (aprovacaoInfo.statusAprovacao === 'solicitada') {
    toast.info('Aguardando aprovação do coordenador.');
    return;
  }
}
```

**Modal de Aprovação:**
```tsx
<AprovacaoModal
  open={isAprovacaoModalOpen}
  onOpenChange={setIsAprovacaoModalOpen}
  osId={osId}
  etapaOrdem={currentStep}
  etapaNome={etapaNomeParaAprovacao}
  onAprovado={async () => {
    setCurrentStep(prev => prev + 1);
    setLastActiveStep(prev => Math.max(prev ?? 0, currentStep + 1));
  }}
/>
```

### Status de Aprovação

| Status | Descrição | Ação do Sistema |
|--------|-----------|----------------|
| `pendente` | Nenhuma solicitação feita | Abre modal para solicitar |
| `solicitada` | Aguardando aprovador | Bloqueia avanço, exibe toast |
| `aprovada` | Aprovador confirmou | Libera botão "Avançar" |
| `rejeitada` | Aprovador negou | Abre modal para re-solicitar |

---

## 💾 Persistência de Dados (v3.1)

> [!IMPORTANT]
> **Atualização v3.1 (2026-01-14):** Correções críticas no fluxo de persistência.

### Arquitetura de Persistência

```
Componente Step                                  
    │ onDataChange(data)                         
    ▼                                            
setStepData(step, data)    ← Atualiza estado LOCAL (formDataByStep)
    │                                            
    ▼                                            
handleNextStep()                                 
    │                                            
    ▼                                            
saveStep(step, false, explicitData)              
    │                                            
    ▼                                            
useEtapas.saveFormData(etapaId, data, markAsComplete)
    │                                            
    ▼                                            
ordensServicoAPI.updateEtapa() → os_etapas.dados_etapa (JSONB)
    │                                            
    ▼                                            
refreshEtapas()            ← ✅ FIX: Sincroniza estado após save
```

### Boas Práticas

1. **Sempre passar dados explícitos** no `saveStep()`:
   ```typescript
   const currentData = formDataByStep[currentStep] || {};
   await saveStep(currentStep, false, currentData);
   ```

2. **Chamar `refreshEtapas()`** após saves para sincronizar estado:
   ```typescript
   await saveStep(currentStep, false, currentData);
   await refreshEtapas(); // ✅ Sincroniza com banco
   ```

3. **Incluir todos os dados no `onLeadChange`**:
   ```typescript
   onLeadChange={(id, data) => {
     setStepData(1, {
       leadId: id,
       // Identificação
       nome: data.identificacao?.nome,
       // Edificação
       tipoEdificacao: data.edificacao?.tipoEdificacao,
       // Endereço (TODOS os campos)
       cep: data.endereco?.cep,
       // ... estruturas aninhadas para compatibilidade
       identificacao: data.identificacao,
       edificacao: data.edificacao,
       endereco: data.endereco,
     });
   }}
   ```

### Debugging

Verificar no Console do navegador:
- `[Minerva] [LOG] 💾 saveStep(X): Using EXPLICIT data (Y fields)`
- `[Minerva] [LOG] 📊 Etapa X data keys: [...]`
- `[Minerva] [WARN] ⚠️ Etapa X: NENHUM dado para salvar!`

---

## 💾 Estrutura de Dados por Etapa

### Etapa 1: Identifique o Lead

**Interface TypeScript:**
```typescript
interface Etapa1Data {
  leadId?: string;
  nome?: string;
  cpfCnpj?: string;
  email?: string;
  telefone?: string;
  tipo?: 'fisica' | 'juridica';
  nomeResponsavel?: string;
  cargoResponsavel?: string;
  // Dados da edificação
  tipoEdificacao?: string;
  qtdUnidades?: string;
  qtdBlocos?: string;
  qtdPavimentos?: string;
  tipoTelhado?: string;
  possuiElevador?: boolean;
  possuiPiscina?: boolean;
  // Endereço
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}
```

**Regra de Completude:** `leadId` deve estar preenchido.

**Componente:** `cadastrar-lead.tsx` (compartilhado)

**Comportamento Especial:**
- Ao avançar de Etapa 1 → 2, o sistema **cria a OS** no banco (diferente de OS 1-4 que cria em 2 → 3):
  ```typescript
  const result = await createOSMutationHook.mutate({
    tipoOSCodigo: tipoOS, // 'OS-05' ou 'OS-06'
    clienteId: leadId,
    responsavelId: currentUser.id,
    descricao: `${tipoOS === 'OS-05' ? 'Assessoria Técnica' : 'Assessoria Pericial'} - Lead em análise`,
    etapas: steps.map((step, index) => ({
      nome_etapa: step.title,
      ordem: index + 1,
      dados_etapa: {}
    }))
  });
  ```

---

### Etapa 2: Seleção do Tipo de OS

**Interface TypeScript:**
```typescript
interface Etapa2Data {
  tipoOS?: 'OS-05' | 'OS-06';
}
```

**Regra de Completude:** `tipoOS` deve ser 'OS-05' ou 'OS-06'.

**Componente:** `step-selecao-tipo-assessория.tsx`

**Opções Disponíveis:**
- **OS-05**: Assessoria Recorrente (Mensal)
- **OS-06**: Assessoria Pontual (Avulsa)

**UI:**
```
┌─────────────────────────────────────┐
│   Selecione o Tipo de Assessoria   │
├─────────────────────────────────────┤
│                                     │
│  ○ OS-05: Assessoria Recorrente     │
│     Visitas técnicas mensais        │
│     Contrato anual                  │
│                                     │
│  ○ OS-06: Assessoria Pontual        │
│     Laudo técnico único             │
│     Parecer específico              │
│                                     │
│             [Continuar]             │
└─────────────────────────────────────┘
```

---

### Etapa 3: Follow-up 1 (Entrevista Inicial)

**Interface TypeScript:**
```typescript
interface Etapa3Data {
  // Campos compartilhados
  idadeEdificacao?: string;
  motivoProcura?: string;
  quandoAconteceu?: string;
  oqueFeitoARespeito?: string;
  existeEscopo?: string;
  previsaoOrcamentaria?: string;
  grauUrgencia?: string;
  apresentacaoProposta?: string;
  nomeContatoLocal?: string;
  telefoneContatoLocal?: string;
  cargoContatoLocal?: string;
  
  // Campos específicos OS-05
  frequenciaVisitas?: string; // 'mensal', 'quinzenal', 'semanal'
  duracaoContrato?: string; // meses
  
  // Campos específicos OS-06
  tipoLaudo?: string; // 'Vistoria', 'Parecer', 'Laudo Técnico'
  prazoEntrega?: string;
}
```

**Componentes:**
- `step-followup-1-os5.tsx` - Versão para Assessoria Recorrente
- `step-followup-1-os6.tsx` - Versão para Assessoria Pontual

**Diferenças entre OS-05 e OS-06:**

OS-05 (Recorrente):
- Pergunta sobre frequência de visitas desejada
- Duração do contrato (meses)
- Tipo de serviço recorrente

OS-06 (Pontual):
- Tipo de laudo/parecer específico
- Prazo de entrega esperado
- Escopo limitado

---

### Etapa 4: Memorial (Escopo e Prazos)

**Interface TypeScript:**
```typescript
interface EspecificacaoTecnica {
  nome: string;
  descricao: string;
}

interface StepEscopoAssessoriaData {
  objetivo?: string;
  especificacoesTecnicas?: EspecificacaoTecnica[];
  metodologia?: string;
  prazo?: {
    planejamentoInicial?: string;
    logisticaTransporte?: string;
    levantamentoCampo?: string;
    composicaoLaudo?: string;
    apresentacaoCliente?: string;
  };
  garantia?: string;
}
```

**Componente:** `step-escopo-assessoria.tsx`

**Funcionalidades:**
- Definição do objetivo do serviço
- Lista de especificações técnicas (ex: "Vistoria de Fachada", "Análise Estrutural")
- Metodologia de execução
- Quebra de prazos por fase
- Garantia oferecida

**UI:**
```
┌─────────────────────────────────────┐
│   Escopo de Assessoria              │
├─────────────────────────────────────┤
│  Objetivo:                          │
│  ┌─────────────────────────────┐   │
│  │ Vistoria técnica predial... │   │
│  └─────────────────────────────┘   │
│                                     │
│  Especificações Técnicas:           │
│  ┌──────────────────────────────┐  │
│  │ [+] Adicionar Especificação  │  │
│  │                              │  │
│  │ • Inspeção Visual de Fachada │  │
│  │   Análise de manifestações.. │  │
│  │                              │  │
│  │ • Análise de Documentação    │  │
│  │   Revisão de projetos...     │  │
│  └──────────────────────────────┘  │
│                                     │
│  Prazos (dias úteis):               │
│  Planejamento:      [2]             │
│  Logística:         [1]             │
│  Levantamento:      [3]             │
│  Composição Laudo:  [5]             │
│  Apresentação:      [2]             │
│                                     │
└─────────────────────────────────────┘
```

---

### Etapa 5: Precificação (Formulário Financeiro)

**Interface TypeScript:**
```typescript
interface Etapa5Data {
  custoBase?: string; // Valor editável manualmente
  percentualImposto?: string; // Default: '14%'
  percentualEntrada?: string; // Default: '40%'
  numeroParcelas?: string; // Default: '2'
  // Calculados automaticamente
  precoFinal?: string;
  valorEntrada?: string;
  valorParcela?: string;
}
```

**Componente:** `step-precificacao-assessoria.tsx`

**Funcionalidades:**
- **Custo Base Editável**: Coordenador define o valor livremente
- Cálculo automático de impostos
- Condições de pagamento (entrada + parcelas)
- Exibição de valores calculados

**Cálculos:**
```typescript
const valorComImposto = custoBase * (1 + percentualImposto / 100);
const valorEntrada = valorComImposto * (percentualEntrada / 100);
const valorRestante = valorComImposto - valorEntrada;
const valorParcela = valorRestante / numeroParcelas;
```

**Diferença de OS 1-4:** 
- Obras: Valor calculado automaticamente a partir de etapas/subetapas
- Assessoria: Valor definido manualmente pelo coordenador

---

### Etapa 6: Gerar Proposta Comercial ✅🔒

**Interface TypeScript:**
```typescript
interface Etapa6Data {
  propostaGerada?: boolean;
  dataGeracao?: string;
  documentoId?: string; // ID do PDF em os_documentos
}
```

**Componente:** `step-gerar-proposta.tsx` (compartilhado)

**Fluxo:**
1. Exibe resumo financeiro (herdado de Etapas 4 e 5)
2. Botão "Gerar Proposta PDF"
3. Chama Edge Function `generate-pdf` com template `'proposta-comercial-assessoria'`
4. Registra PDF em `os_documentos` com `tipo_documento = 'PROPOSTA'`
5. Vincula `documento_id` em `dados_etapa`

**⚠️ Aprovação Obrigatória:**
- **Aprovador:** Coordenador de Assessoria
- **Função RPC:** `verificar_aprovacao_etapa`, `confirmar_aprovacao`
- Após aprovação, libera botão "Avançar"

---

### Etapa 7: Agendar Visita (Apresentação)

**Interface TypeScript:**
```typescript
interface Etapa7Data {
  dataAgendamento?: string; // ISO 8601 datetime
  agendamentoId?: string; // ID da tabela agendamentos
}
```

**Componente:** `step-agendar-apresentacao.tsx` (compartilhado)

**Integração:**
- Cria registro na tabela `agendamentos`
- Categoria: `'Apresentação Comercial'`
- Define `responsavel_id` (executor) e `criado_por` (agendador)

---

### Etapa 8: Realizar Visita (Apresentação)

**Interface TypeScript:**
```typescript
interface Etapa8Data {
  apresentacaoRealizada?: boolean;
  dataApresentacao?: string;
  observacoes?: string;
}
```

**Componente:** `step-realizar-apresentacao.tsx` (compartilhado)

---

### Etapa 9: Follow-up 3 (Pós-Apresentação)

**Interface TypeScript:**
```typescript
interface Etapa9Data {
  propostaApresentada?: string;
  metodoApresentacao?: string; // 'presencial', 'virtual', 'híbrido'
  clienteAchouProposta?: string;
  clienteAchouContrato?: string;
  doresNaoAtendidas?: string;
  indicadorFechamento?: string; // 'alta', 'média', 'baixa'
  quemEstavaNaApresentacao?: string;
  nivelSatisfacao?: string; // 1-5
}
```

**Componente:** `step-analise-relatorio.tsx` (compartilhado)

**Funcionalidades:**
- Análise qualitativa da apresentação
- Avaliação de indicadores de fechamento
- Identificação de objeções
- Previsão de conversão

---

### Etapa 10: Gerar Contrato (Upload) ✅🔒

**Interface TypeScript:**
```typescript
interface Etapa10Data {
  contratoFile?: File | null;
  dataUpload?: string;
  documentoId?: string;
  numeroContrato?: string;
}
```

**Componente:** `step-gerar-contrato.tsx` (compartilhado)

**⚠️ Aprovação Obrigatória:**
- **Aprovador:** Diretor
- Aprovação final antes de ativar contrato

---

### Etapa 11: Contrato Assinado

**Interface TypeScript:**
```typescript
interface Etapa11Data {
  contratoAssinado?: boolean;
  dataAssinatura?: string;
  versaoAssinada?: File | null; // Upload da versão assinada
}
```

**Componente:** `step-contrato-assinado.tsx` (compartilhado)

---

### Etapa 12: Ativar Contrato (Geração Automática de OS Filha)

**Tipo:** Etapa automática (Sistema)

**Componente:** `step-ativar-contrato-assessoria.tsx`

**Comportamento:**

#### Para OS-05 (Recorrente):
```typescript
if (tipoOS === 'OS-05') {
  // Criar OS-12 (Execução de Assessoria Mensal)
  const os12Data = {
    tipoOSCodigo: 'OS-12',
    clienteId: os.cliente_id,
    parentOSId: osId,
    descricao: 'Execução de Assessoria Mensal - Gerado automaticamente',
    etapas: [
      { ordem: 1, nome_etapa: 'Cadastro do Cliente' },
      { ordem: 2, nome_etapa: 'Definição de SLA' },
      { ordem: 3, nome_etapa: 'Setup de Recorrência' },
      { ordem: 4, nome_etapa: 'Alocação de Equipe' },
      { ordem: 5, nome_etapa: 'Configuração de Calendário' },
      { ordem: 6, nome_etapa: 'Início dos Serviços' },
    ]
  };
  await createOSMutationHook.mutate(os12Data);
}
```

#### Para OS-06 (Pontual):
```typescript
if (tipoOS === 'OS-06') {
  // Criar OS-11 (Execução de Laudo Pontual)
  const os11Data = {
    tipoOSCodigo: 'OS-11',
    clienteId: os.cliente_id,
    parentOSId: osId,
    descricao: 'Execução de Laudo Pontual - Gerado automaticamente',
    etapas: [
      { ordem: 1, nome_etapa: 'Cadastrar o Cliente' },
      { ordem: 2, nome_etapa: 'Agendar Visita' },
      { ordem: 3, nome_etapa: 'Realizar Visita e Questionário' },
      { ordem: 4, nome_etapa: 'Anexar RT' },
      { ordem: 5, nome_etapa: 'Gerar Documento Técnico' },
      { ordem: 6, nome_etapa: 'Enviar ao Cliente' },
    ]
  };
  await createOSMutationHook.mutate(os11Data);
}
```

**Após Criação:**
- Marcar OS pai (05 ou 06) como `status_geral = 'concluido'`
- Notificar coordenador sobre nova OS criada
- Exibir toast de sucesso
- Redirecionar para lista de OS ou dashboard

---

## 🎯 Hooks Customizados

### `use-workflow-state.ts`

Mesmo hook usado nas OS 1-4, mas com 12 etapas.

```typescript
const {
  currentStep,
  setCurrentStep,
  lastActiveStep,
  formDataByStep,
  setStepData,
  saveStep,
  completedSteps,
  etapas
} = useWorkflowState({
  osId,
  totalSteps: 12 // ✅ 12 etapas para Assessoria
});
```

---

### `use-os-workflows.ts`

Hook centralizado para criar OS com estrutura completa.

```typescript
const { mutate: createOS } = useCreateOSWorkflow();

// Criar OS-05
await createOS({
  tipoOSCodigo: 'OS-05',
  clienteId: leadId,
  responsavelId: currentUser.id,
  descricao: 'Assessoria Técnica - Lead em análise',
  etapas: [
    { ordem: 1, nome_etapa: 'Identifique o Lead', dados_etapa: {} },
    { ordem: 2, nome_etapa: 'Seleção do Tipo de OS', dados_etapa: {} },
    // ... demais etapas
  ]
});
```

---

## 🗄 Modelo de Dados

### Tabelas Principais

Mesmas tabelas usadas nas OS 1-4:
- `ordens_servico`
- `os_etapas`
- `os_atividades` (audit log)
- `os_documentos`
- `agendamentos`

### Relacionamento Parent-Child

```
OS-05 (Comercial) ──> OS-12 (Execução Recorrente)
  └─ parent_os_id

OS-06 (Comercial) ──> OS-11 (Execução Pontual)
  └─ parent_os_id
```

**Query para buscar OS filhas:**
```sql
SELECT * FROM ordens_servico
WHERE parent_os_id = 'uuid-da-os-05-ou-06';
```

---

## 🔄 Fluxo de Criação de OS

### Diferença das OS 1-4

| Aspecto | OS 1-4 (Obras) | OS 5-6 (Assessoria) |
|---------|----------------|---------------------|
| **Criação da OS** | Etapa 2 → 3 | **Etapa 1 → 2** |
| **Handoffs** | 2 handoffs (Admin ↔ Obras) | **Nenhum handoff** |
| **Responsável** | Muda entre setores | **Sempre Administrativo** |
| **Aprovações** | Etapas 9 e 13 | **Etapas 6 e 10** |
| **OS Filha** | OS-13 (Start de Contrato) | **OS-12 ou OS-11** |

### Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUXO OS 5-6 (Assessoria)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ETAPA 1: Identifique o Lead                                    │
│  ├─ Selecionar/Cadastrar Lead                                   │
│  └─ **CRIAR OS** (diferente de OS 1-4)                          │
│      │                                                           │
│      ▼                                                           │
│  ETAPA 2: Seleção do Tipo                                       │
│  ├─ Escolher OS-05 (Recorrente)                                 │
│  └─ Escolher OS-06 (Pontual)                                    │
│      │                                                           │
│      ▼                                                           │
│  ETAPAS 3-5: Detalhamento Técnico e Financeiro                  │
│  ├─ Follow-up 1 (Entrevista)                                    │
│  ├─ Escopo de Assessoria                                        │
│  └─ Precificação (valor manual)                                 │
│      │                                                           │
│      ▼                                                           │
│  ETAPA 6: 🔒 Gerar Proposta (APROVAÇÃO)                         │
│  └─ Coord. Assessoria aprova                                    │
│      │                                                           │
│      ▼                                                           │
│  ETAPAS 7-9: Apresentação ao Cliente                            │
│  ├─ Agendar Apresentação                                        │
│  ├─ Realizar Apresentação                                       │
│  └─ Follow-up 3 (Análise)                                       │
│      │                                                           │
│      ▼                                                           │
│  ETAPA 10: 🔒 Gerar Contrato (APROVAÇÃO)                        │
│  └─ Diretor aprova                                              │
│      │                                                           │
│      ▼                                                           │
│  ETAPA 11: Contrato Assinado                                    │
│  └─ Upload da versão assinada                                   │
│      │                                                           │
│      ▼                                                           │
│  ETAPA 12: 🔗 Ativar Contrato                                   │
│  ├─ SE OS-05 → Criar **OS-12** (6 etapas)                       │
│  └─ SE OS-06 → Criar **OS-11** (6 etapas)                       │
│      │                                                           │
│      ▼                                                           │
│  ✅ OS COMERCIAL CONCLUÍDA                                      │
│  ✅ OS EXECUÇÃO CRIADA E ATIVA                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testes

### Checklist de Testes

#### ✅ Criação de OS

- [ ] Criar OS-05 na Etapa 1 → 2
- [ ] Criar OS-06 na Etapa 1 → 2
- [ ] Verificar se 12 etapas foram criadas
- [ ] Validar `codigo_os` gerado (ex: OS-05-0001)
- [ ] Cliente vinculado corretamente

#### ✅ Navegação

- [ ] Navegar entre 12 etapas sem handoffs
- [ ] Salvar rascunho em etapas permitidas
- [ ] Voltar para etapas anteriores
- [ ] Impedir pulo de etapas não concluídas

#### ✅ Aprovações

- [ ] Etapa 6: Coordenador de Assessoria pode aprovar
- [ ] Etapa 10: Apenas Diretor pode aprovar
- [ ] Rejeição retorna para etapa anterior
- [ ] Botão "Avançar" bloqueado sem aprovação

#### ✅ Precificação

- [ ] Valor base editável manualmente
- [ ] Cálculo automático de impostos
- [ ] Valores de entrada e parcelas corretos
- [ ] Dados herdados corretamente na Proposta

#### ✅ Geração de OS Filha

- [ ] OS-05 concluída gera OS-12
  - [ ] OS-12 tem 6 etapas (não 8)
  - [ ] `parent_os_id` vinculado corretamente
  - [ ] Cliente herdado
- [ ] OS-06 concluída gera OS-11
  - [ ] OS-11 tem 6 etapas
  - [ ] `parent_os_id` vinculado corretamente
  - [ ] Cliente herdado
- [ ] OS pai marcada como `concluida`

---

## 🐛 Troubleshooting

### Problema: OS não criada na Etapa 1

**Causa:** Validação de lead falhou

**Solução:**
```typescript
// Verificar se stepLeadRef tem o método validate
if (stepLeadRef.current?.validate()) {
  const leadId = await stepLeadRef.current.saveData();
  // Criar OS...
}
```

---

### Problema: OS filha não criada na Etapa 12

**Causa:** Tipo de OS não identificado corretamente

**Solução:**
```typescript
// Garantir que tipoOS esteja definido
const tipoOSSelecionado = formDataByStep[2]?.tipoOS || tipoOS;
logger.log('Tipo de OS selecionado:', tipoOSSelecionado);

// Validar valor
if (tipoOSSelecionado !== 'OS-05' && tipoOSSelecionado !== 'OS-06') {
  toast.error('Tipo de OS inválido');
  return;
}
```

---

### Problema: Valores financeiros incorretos na Proposta

**Causa:** Dados não herdados corretamente

**Solução:**
```typescript
// Usar dados enriquecidos
const etapa6DataEnriquecido = useMemo(() => ({
  ...etapa6Data,
  valorProposta: valoresFinanceiros.valorTotal,
  valorEntrada: valoresFinanceiros.valorEntrada,
  valorParcela: valoresFinanceiros.valorParcela
}), [etapa6Data, valoresFinanceiros]);
```

---

## 📈 Melhorias Futuras

### Curto Prazo
- [ ] Validação Zod para todas as 12 etapas
- [ ] Templates diferentes de proposta para OS-05 vs. OS-06
- [ ] Histórico de alterações de valor (Etapa 5)
- [ ] Preview da proposta antes de gerar PDF

### Médio Prazo
- [ ] Dashboard específico de Assessoria
- [ ] Métricas de conversão (Lead → Contrato)
- [ ] Comparativo de propostas enviadas
- [ ] Alertas de follow-up automáticos

### Longo Prazo
- [ ] Fluxo de renovação de contratos (OS-05)
- [ ] Biblioteca de especificações técnicas pré-definidas
- [ ] Integração com calendário externo (Google Calendar)
- [ ] App mobile para acompanhamento de propostas

---

## 📚 Referências

### Documentação Relacionada

- [TODAS_OS_E_ETAPAS.md](../sistema/TODAS_OS_E_ETAPAS.md) - Visão geral de todas as OS
- [OS_01_04_TECHNICAL_DOCUMENTATION.md](./OS_01_04_TECHNICAL_DOCUMENTATION.md) - Doc técnica OS 1-4
- [ACCORDION_ADENDOS_SYSTEM.md](./ACCORDION_ADENDOS_SYSTEM.md) - Sistema Accordion Adendos
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Schema do banco de dados

### Diferenças Principais vs. OS 1-4

| Aspecto | OS 1-4 (Obras) | OS 5-6 (Assessoria) |
|---------|----------------|---------------------|
| **Etapas** | 15 | 12 |
| **Handoffs** | 2 (Admin ↔ Obras) | 0 (Só Admin) |
| **Criação OS** | Etapa 2 → 3 | Etapa 1 → 2 |
| **Precificação** | Calculada (etapas/subetapas) | Manual (valor base) |
| **OS Filha** | OS-13 (17 etapas) | OS-11 (6) ou OS-12 (6) |
| **Componente** | `os-details-workflow-page.tsx` | `os-5-6-workflow-page.tsx` ✅ |
| **Sistema UI** | WorkflowStepper (legado) | **WorkflowAccordion** ✅ |
| **Adendos** | Não suportado | **Suportado** ✅ |

---

## 📜 Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| v3.0 | 2026-01-13 | Migração para WorkflowAccordion + Adendos |
| v2.7 | 2026-01-04 | Sistema de aprovação hierárquica |
| v1.0 | 2025-12-XX | Versão inicial |

---

**Última Revisão:** 2026-01-13  
**Autor:** Sistema Minerva ERP  
**Versão do Documento:** 3.0.0
