# 📋 Documentação Técnica: OS-07, OS-08 e OS-09

**Última Atualização:** 2026-01-13  
**Versão:** v2.9  
**Status Implementação:** 95% ✅

---

## 📌 Visão Geral

Este documento cobre três tipos de Ordens de Serviço com fluxos distintos:

| Código | Nome | Setor | Etapas | Handoffs |
|--------|------|-------|:------:|:--------:|
| **OS-07** | Solicitação de Reforma | Assessoria | 5 | 0 |
| **OS-08** | Visita Técnica / Parecer | Assessoria | 7 | 1 |
| **OS-09** | Requisição de Compras | Administrativo | 2 | 1 |

---

# 🏠 OS-07: Solicitação de Reforma

## 📋 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Setor** | Assessoria |
| **Responsável Inicial** | Administrativo |
| **Tipo** | Termo de Comunicação de Reforma |
| **Workflow** | 5 etapas + Formulário Público |
| **Iniciador** | Cliente (via link externo) |
| **Implementação** | 90% ✅ |

## 🎯 Objetivo

Gerar um **link público** para que o cliente preencha os dados da reforma desejada em seu condomínio. Após preenchimento, a equipe de Assessoria analisa e emite parecer técnico.

## 🏗 Arquitetura

### Estrutura de Arquivos

```
src/components/os/assessoria/os-7/
├── pages/
│   ├── os07-workflow-page.tsx       # Workflow principal (5 etapas)
│   └── os07-analise-page.tsx        # Página de análise técnica
└── components/
    └── os07-form-publico.tsx        # Formulário público para cliente
```

## 🔄 Fluxo de 5 Etapas

| # | Etapa | Responsável | Prazo | Componente |
|:-:|-------|-------------|:-----:|------------|
| **1** | Identificação do Lead | Administrativo | 1 dia | `cadastrar-lead.tsx` |
| **2** | Aguardando Cliente | Cliente | 4 dias | Link público |
| **3** | Análise e Parecer | Assessoria | 3 dias | `os07-analise-page.tsx` |
| **4** | Gerar PDF | Assessoria | 2 dias | Documento técnico |
| **5** | Concluída | Sistema | 1 dia | Confirmação final |

> **Prazo Total:** 11 dias úteis

## 🔐 Ownership Rules

```typescript
const OS_07_RULE: OSOwnershipRule = {
  osType: 'OS-07',
  osName: 'Solicitação do Cliente (Reforma)',
  initiator: 'CLIENTE', // Inicia por link público
  totalSteps: 10,
  stageOwners: [
    { range: [1, 10], cargo: 'coord_assessoria', setor: 'assessoria' },
  ],
  handoffPoints: [], // Sem handoffs - Cliente abre direto para Assessoria
};
```

**Características:**
- ✅ **SEM handoffs** - Todo fluxo no setor Assessoria
- ✅ **Iniciador Cliente** - Inicia via link público
- ✅ **Formulário Externo** - Cliente preenche sem login

## 💾 Estrutura de Dados

### Etapa 1: Identificação do Lead

```typescript
interface Etapa1Data {
  leadId?: string;
  condominioNome?: string;
  // Dados padrão de cadastro
}
```

### Etapa 2: Formulário Público (Cliente)

```typescript
interface FormularioReformaData {
  unidade?: string;            // Número da unidade
  proprietario?: string;       // Nome do proprietário
  responsavelReforma?: string; // Nome do responsável
  telefone?: string;
  email?: string;
  descricaoReforma?: string;   // Descrição detalhada
  tipoReforma?: string;        // 'estrutural', 'hidraulica', 'eletrica', etc.
  dataPrevisao?: string;       // Previsão de início
  anexos?: File[];             // Fotos/documentos
}
```

**Acesso:** `/reforma/{osId}` (rota pública)

### Etapa 3: Análise e Parecer

```typescript
interface AnaliseReformaData {
  analiseAprovada?: boolean;
  observacoesTecnicas?: string;
  requisitosSeguran?: string[];
  parecerEngenheiro?: string;
  dataAnalise?: string;
}
```

**Página:** `/os/07/analise/{osId}`

## 🔀 Fluxo Visual

```
┌───────────────────────────────────────────────────────────────┐
│                     FLUXO OS-07 (Reforma)                     │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ETAPA 1: Identificação do Lead                               │
│  └─ Cadastrar condomínio/cliente                              │
│      │                                                         │
│      ▼                                                         │
│  ETAPA 2: 📧 Aguardando Cliente                               │
│  ├─ Gerar link público: /reforma/{osId}                       │
│  ├─ Cliente preenche formulário externamente                  │
│  └─ **AVANÇO AUTOMÁTICO** após envio do formulário            │
│      │                                                         │
│      ▼                                                         │
│  ETAPA 3: 🔍 Análise e Parecer                                │
│  └─ Coord. Assessoria analisa dados enviados                  │
│      │                                                         │
│      ▼                                                         │
│  ETAPA 4: 📄 Gerar PDF                                        │
│  └─ Geração do Termo de Comunicação de Reforma                │
│      │                                                         │
│      ▼                                                         │
│  ETAPA 5: ✅ Concluída                                        │
│  └─ OS finalizada                                             │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## 📁 Rota Pública

**Componente:** `os07-form-publico.tsx`

**URL:** `/reforma/{osId}`

**Características:**
- Não requer autenticação
- Busca dados da OS via ID
- Salva respostas em `dados_etapa` da Etapa 2
- Avança OS automaticamente para Etapa 3 após submit

---

# 🔧 OS-08: Visita Técnica / Parecer

## 📋 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Setor** | Assessoria |
| **Responsável Inicial** | Administrativo (triagem) |
| **Tipo** | Visita Técnica com Geração de Parecer |
| **Workflow** | 7 etapas |
| **Handoffs** | 1 (Admin → Assessoria) |
| **Implementação** | 95% ✅ |

## 🎯 Objetivo

Solicitação, agendamento e execução de **visita técnica** com geração de **parecer/documento técnico**.

### Regra Especial

> **Clientes com contrato OS-05 (anual):** Uma OS-08 deve ser agendada **toda semana** como parte do serviço de assessoria recorrente.

## 🏗 Arquitetura

### Estrutura de Arquivos

```
src/components/os/assessoria/os-8/
├── pages/
│   └── os08-workflow-page.tsx           # Workflow principal (555 linhas)
├── components/
│   └── checklist-recebimento.tsx        # Checklist Recebimento Unidade
├── types/
│   └── os08-types.ts                    # Tipos e constantes
└── steps/
    ├── index.ts
    ├── step-detalhes-solicitacao.tsx    # Etapa 2: Detalhes da Solicitação
    ├── step-agendar-visita.tsx          # Etapa 3
    ├── step-realizar-visita.tsx         # Etapa 4
    ├── step-formulario-pos-visita.tsx   # Etapa 5 (dinâmico por finalidade)
    ├── step-gerar-documento.tsx         # Etapa 6
    └── step-enviar-documento.tsx        # Etapa 7
```

> **Nota:** Etapa 1 (Identificação do Cliente) usa o componente compartilhado `LeadCadastro`

## 🔄 Fluxo de 7 Etapas

| # | Etapa | Responsável | Prazo | Setor |
|:-:|-------|-------------|:-----:|-------|
| **1** | Identificação do Cliente | Administrativo | 1 dia | Administrativo |
| **2** | Detalhes da Solicitação | Administrativo | 1 dia | Administrativo |
| **3** | Agendar Visita | Administrativo | 2 dias | Administrativo |
| **4** | Realizar Visita | Assessoria | 2 dias | Assessoria |
| **5** | Formulário Pós-Visita | Assessoria | 2 dias | Assessoria |
| **6** | Gerar Documento | Administrativo | 1 dia | Assessoria |
| **7** | Enviar ao Cliente | Sistema | 1 dia | Assessoria |

> **Prazo Total:** 10 dias úteis

## 🔐 Ownership Rules

```typescript
const OS_08_RULE: OSOwnershipRule = {
  osType: 'OS-08',
  osName: 'Visita Técnica / Parecer Técnico',
  initiator: 'CLIENTE',
  totalSteps: 8,
  stageOwners: [
    { range: [1, 2], cargo: 'coord_administrativo', setor: 'administrativo' }, // Triagem
    { range: [3, 8], cargo: 'coord_assessoria', setor: 'assessoria' },
  ],
  handoffPoints: [
    {
      fromStep: 2,
      toStep: 3,
      toCargo: 'coord_assessoria',
      toSetor: 'assessoria',
      description: 'Transferir para Coordenação de Assessoria após agendamento',
    },
  ],
};
```

**Características:**
- ✅ **1 Handoff:** Admin → Assessoria (Etapa 2 → 3)
- ✅ **Triagem Inicial:** Administrativo recebe e classifica
- ✅ **Execução Técnica:** Assessoria executa visita e gera documento

## 🔀 Handoff: Etapa 2 → 3

```
Administrativo (Etapa 2: Atribuir Cliente)
        │
        ├─── Transferência Automática ───┐
        │                                  │
        ▼                                  ▼
Assessoria (Etapa 3: Agendar Visita)  Coord. Assessoria Notificado
```

**Ações Executadas:**
1. Atualiza `ordens_servico.setor_atual_id` → Assessoria
2. Atualiza `ordens_servico.responsavel_id` → Coord. Assessoria
3. Cria registro em `os_transferencias`
4. Registra em `os_atividades`
5. Notifica Coord. Assessoria

## 💾 Estrutura de Dados

### Etapa 1: Identificação do Solicitante

```typescript
interface Etapa1OS08Data {
  solicitanteNome?: string;
  solicitanteWhatsapp?: string;
  condominioNome?: string;
  tipoDocumentoRequerido?: string; // 'Parecer', 'Laudo', 'Vistoria'
  detalhesSolicitacao?: string;
  fotosSolicitacao?: File[];
}
```

### Etapa 2: Atribuir Cliente

```typescript
interface Etapa2OS08Data {
  clienteId?: string;  // ID do cliente selecionado
  // OS criada ao avançar para Etapa 3
}
```

### Etapa 3: Agendar Visita

```typescript
interface Etapa3OS08Data {
  dataAgendamento?: string; // ISO 8601
  horaAgendamento?: string;
  localVisita?: string;
  observacoesAgendamento?: string;
  // Integra com tabela 'agendamentos'
}
```

### Etapa 4: Realizar Visita

```typescript
interface Etapa4OS08Data {
  visitaRealizada?: boolean;
  dataRealizacao?: string;
  observacoesVisita?: string;
}
```

### Etapa 5: Formulário Pós-Visita ⭐

```typescript
interface FormularioPosVisitaData {
  // Pontuação e avaliações
  pontuacaoEngenheiro?: number; // 1-5
  pontuacaoMorador?: number;    // 1-5
  
  // Manifestação patológica
  manifestacaoPatologica?: string;
  gravidadeProblema?: 'baixa' | 'media' | 'alta' | 'critica';
  
  // Recomendações
  recomendacoesTecnicas?: string;
  referenciaNBR?: string;  // Norma técnica aplicável
  
  // Fotos
  fotosLocal?: File[];
  fotosManifestacao?: File[];
  
  // Laudo
  conclusaoTecnica?: string;
}
```

> **Nota:** Esta é a etapa mais rica em dados, contendo informações técnicas detalhadas para geração do parecer.

### Etapa 6: Gerar Documento

```typescript
interface Etapa6OS08Data {
  documentoGerado?: boolean;
  documentoId?: string; // ID em os_documentos
  tipoDocumento?: 'Parecer' | 'Laudo' | 'Vistoria';
  dataGeracao?: string;
}
```

**Integração:** Edge Function `generate-pdf` com template `'parecer-tecnico'`

### Etapa 7: Enviar ao Cliente

```typescript
interface Etapa7OS08Data {
  enviado?: boolean;
  dataEnvio?: string;
  metodoEnvio?: 'email' | 'whatsapp' | 'portal';
  confirmacaoRecebimento?: boolean;
}
```

## 🔀 Fluxo Visual

```
┌───────────────────────────────────────────────────────────────┐
│                  FLUXO OS-08 (Visita Técnica)                 │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  SETOR: ADMINISTRATIVO (Triagem)                              │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  ETAPA 1: Identificação do Solicitante                  │  │
│  │  └─ Dados do solicitante, tipo de documento, fotos      │  │
│  │                    │                                     │  │
│  │                    ▼                                     │  │
│  │  ETAPA 2: Atribuir Cliente                              │  │
│  │  └─ Selecionar cliente existente no sistema             │  │
│  └─────────────────────│────────────────────────────────────┘  │
│                        │                                       │
│                   🔀 HANDOFF                                   │
│                        │                                       │
│  SETOR: ASSESSORIA     ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  ETAPA 3: Agendar Visita                                │  │
│  │  └─ Integra com calendário                              │  │
│  │                    │                                     │  │
│  │                    ▼                                     │  │
│  │  ETAPA 4: Realizar Visita                               │  │
│  │  └─ Confirmação de execução                             │  │
│  │                    │                                     │  │
│  │                    ▼                                     │  │
│  │  ETAPA 5: 📝 Formulário Pós-Visita                      │  │
│  │  └─ Pontuação, manifestação, NBR, fotos                 │  │
│  │                    │                                     │  │
│  │                    ▼                                     │  │
│  │  ETAPA 6: 📄 Gerar Documento                            │  │
│  │  └─ Parecer técnico via Edge Function                   │  │
│  │                    │                                     │  │
│  │                    ▼                                     │  │
│  │  ETAPA 7: ✉️ Enviar ao Cliente                          │  │
│  │  └─ E-mail, WhatsApp ou Portal                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## 🛠️ Correções Recentes (v2.9 - 2026-01-13)

### 0. Navegação e Cabeçalho (v2.9)

**Problema:** Ao clicar em uma etapa no "Detalhes da OS", a página de workflow abria na Etapa 1 ao invés da etapa selecionada.

**Correções Aplicadas:**

| Arquivo | Alteração |
|---------|----------|
| `details-workflow.$id.tsx` | Adicionadas props `initialStep`, `readonly`, `codigoOS`, `tipoOSNome` |
| `os08-workflow-page.tsx` | Interface atualizada para aceitar novas props |
| `os08-workflow-page.tsx` | Botão Voltar usa `Link` para `/os/$osId` |
| `os08-workflow-page.tsx` | Cabeçalho exibe `codigoOS` + `tipoOSNome` |

```tsx
// details-workflow.$id.tsx
<OS08WorkflowPage
  osId={id}
  initialStep={step}        // ✅ Navegação direta para etapa
  readonly={readonly}       // ✅ Modo somente leitura
  codigoOS={os.codigo_os}   // ✅ Título principal
  tipoOSNome={os.tipo_os_nome} // ✅ Subtítulo
  onBack={handleBack}
/>
```

---

### 1. WorkflowAccordion - Navegação Re-projetada

**Problema:** Ao clicar em etapa concluída, ela mudava para "Atual" e perdia status verde/concluída.

**Correções Aplicadas:**

| Componente | Antes | Depois |
|------------|-------|--------|
| Accordion Type | `type="single"` | `type="multiple"` |
| Controle de Expansão | Via `onStepChange` (mudava currentStep) | Estado local `expandedSteps` |
| Prioridade Visual | `isCurrent` > `isCompleted` | `isCompleted` > `isCurrent` |
| Etapa Concluída | Mostrava formulário editável | Mostra `renderSummary` read-only |

**Arquivo:** `src/components/os/shared/components/workflow-accordion.tsx`

```typescript
// ✅ Accordion permite múltiplas etapas expandidas
<Accordion type="multiple" value={expandedSteps}>

// ✅ Handler não muda currentStep
const handleValueChange = (values: string[]) => {
    const currentStepValue = `step-${currentStep}`;
    if (!values.includes(currentStepValue)) {
        values = [...values, currentStepValue]; // Etapa atual nunca colapsa
    }
    setExpandedSteps(values);
};

// ✅ Badge prioriza isCompleted
{isCompleted ? (
    <Badge className="text-success">✓ Concluída</Badge>
) : isCurrent ? (
    <Badge>Atual</Badge>
) : null}
```

---

### 2. FieldWithAdendos - Redesign Visual

**Problema:** Cards de adendo com cores fortes (amarelo) e emojis inconsistentes.

**Correções Aplicadas:**

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Background | `bg-primary/5` (amarelo) | `bg-muted/20` (neutro) |
| Borda | `border-l-4 border-primary` | `border-l-2 border-muted-foreground/30` |
| Ícone Plus | Sim (no texto) | Removido |
| Texto | `text-primary` | `text-muted-foreground italic` |
| Usuário | 👤 emoji | `<User />` Lucide icon |
| Data | 📅 emoji | `<Calendar />` Lucide icon |

**Arquivo:** `src/components/os/shared/components/field-with-adendos.tsx`

```tsx
// Novo estilo minimalista
<div className="bg-muted/20 border-l-2 border-muted-foreground/30 rounded-r-md p-3 ml-4">
    <p className="text-sm text-muted-foreground italic">{adendo.conteudo}</p>
    <div className="flex justify-end gap-3 mt-2 text-xs text-muted-foreground/70">
        <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {adendo.criado_por_nome}
        </span>
        <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDateTime(adendo.criado_em)}
        </span>
    </div>
</div>
```

---

### 3. useWorkflowCompletion - Separação de Estados

**Problema:** `completedSteps` misturava dados locais com status do banco, causando badge prematuro.

**Correções Aplicadas:**

```typescript
// ✅ completedSteps: APENAS do banco (etapas realmente salvas como concluídas)
const completedSteps = useMemo(() => {
    return [...completedStepsFromHook].sort((a, b) => a - b);
}, [completedStepsFromHook]);

// ✅ readyToAdvanceSteps: dados locais que satisfazem regras (permite avançar)
const readyToAdvanceSteps = useMemo(() => { ... }, [formDataByStep, completionRules]);

// ✅ Funções separadas
const isStepCompleted = (step: number) => completedSteps.includes(step);
const canAdvanceFromStep = (step: number) => readyToAdvanceSteps.includes(step);
```

**Arquivo:** `src/lib/hooks/use-workflow-completion.ts`

---

### 4. os08-workflow-page - Salvamento Correto

**Problema:** `saveStep(currentStep, true)` passava `isDraft=true`, salvando como `'em_andamento'`.

**Correções Aplicadas:**

```typescript
// ✅ handleNextStep agora marca como concluída
await saveStep(currentStep, false); // isDraft=false → status='concluida'

// ✅ Refresh após save para atualizar completedSteps
await refreshEtapas();
```

**Arquivo:** `src/components/os/assessoria/os-8/pages/os08-workflow-page.tsx`

---

### 5. AccordionTrigger - Setas Duplicadas

**Problema:** ChevronDown manual + ChevronDown automático do Shadcn UI.

**Correção:** Removido o ChevronDown manual do `workflow-accordion.tsx`. O Shadcn AccordionTrigger já inclui automaticamente.

---

# 💰 OS-09: Requisição de Compras

## 📋 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Setor** | Administrativo / Compras |
| **Responsável Inicial** | Solicitante (geralmente Obras) |
| **Tipo** | OS Interna (compras para obras/operações) |
| **Workflow** | 2 etapas documentadas |
| **Handoffs** | 1 (Obras → Administrativo) |
| **Gatilho** | Manual ou via OS-13 (Etapa 10) |
| **Implementação** | 95% ✅ |

## 🎯 Objetivo

**Formalizar a solicitação de compra** de materiais/serviços e coletar orçamentos para aprovação financeira.

## 🏗 Arquitetura

### Estrutura de Arquivos

```
src/components/os/administrativo/os-9/
├── pages/
│   └── os09-workflow-page.tsx           # Workflow principal
├── components/
│   ├── index.ts
│   └── requisition-item-card.tsx        # Card de item de requisição
└── steps/
    ├── index.ts
    ├── step-requisicao-compra.tsx       # Etapa 1
    └── step-upload-orcamentos.tsx       # Etapa 2

src/routes/_auth/os/criar/
└── requisicao-compras.tsx               # Rota de criação
```

## 🔄 Fluxo de 2 Etapas (Documentado)

| # | Etapa | Responsável | Componente | Aprovação |
|:-:|-------|-------------|------------|:---------:|
| **1** | Requisição de Compra | Solicitante (Obras) | `step-requisicao-compra.tsx` | ❌ |
| **2** | Upload de Orçamentos | Administrativo | `step-upload-orcamentos.tsx` | ✅🔒 |


## 🔐 Ownership Rules

```typescript
const OS_09_RULE: OSOwnershipRule = {
  osType: 'OS-09',
  osName: 'Requisição de Compras/Materiais',
  initiator: 'LIVRE', // Qualquer setor pode solicitar
  totalSteps: 5,
  stageOwners: [
    { range: [1, 1], cargo: 'coord_obras', setor: 'obras' },        // Quem solicita
    { range: [2, 5], cargo: 'coord_administrativo', setor: 'administrativo' }, // Orçamentos
  ],
  handoffPoints: [
    {
      fromStep: 1,
      toStep: 2,
      toCargo: 'coord_administrativo',
      toSetor: 'administrativo',
      description: 'Transferir para Coordenação Administrativa para orçamentos',
    },
  ],
};
```

**Características:**
- ✅ **1 Handoff:** Obras → Administrativo (Etapa 1 → 2)
- ✅ **Iniciador Livre:** Qualquer colaborador pode solicitar
- ✅ **Centro de Custo:** Obrigatório para rastreamento financeiro

## 🔀 Handoff: Etapa 1 → 2

```
Obras (Etapa 1: Requisição de Compra)
        │
        ├─── Transferência Automática ───┐
        │                                  │
        ▼                                  ▼
Administrativo (Etapa 2: Orçamentos)   Coord. Admin Notificado
```

## 💾 Estrutura de Dados

### Etapa 1: Requisição de Compra

```typescript
interface ItemRequisicao {
  id: string;
  descricao: string;
  quantidade: number;
  unidade: string;        // 'un', 'kg', 'm', 'm²', etc.
  especificacao?: string;
  valorEstimado?: number;
}

interface Etapa1OS09Data {
  centroCustoId: string;      // ✅ OBRIGATÓRIO
  centroCustoNome?: string;
  itens: ItemRequisicao[];    // Lista de itens
  valorTotalEstimado?: number; // Calculado automaticamente
  justificativa?: string;
  urgencia?: 'baixa' | 'media' | 'alta';
  dataNecessidade?: string;
  observacoes?: string;
  
  // Vínculo com OS pai (se criado via OS-13)
  osOrigemId?: string;
  osOrigemCodigo?: string;
}
```

**Regras:**
- Centro de Custo é **obrigatório**
- Valor total calculado automaticamente: `∑(quantidade × valorEstimado)`
- OS criada ao avançar para Etapa 2

### Etapa 2: Upload de Orçamentos

```typescript
interface Orcamento {
  id: string;
  fornecedorNome: string;
  fornecedorCnpj?: string;
  arquivo: File;          // PDF ou imagem
  valorTotal: number;
  prazoEntrega?: string;
  observacoes?: string;
}

interface Etapa2OS09Data {
  orcamentos: Orcamento[];  // ✅ MÍNIMO 3 ORÇAMENTOS
  orcamentoSelecionadoId?: string;
  justificativaEscolha?: string;
  statusAprovacao?: 'pendente' | 'aprovado' | 'reprovado';
  aprovadorId?: string;
  dataAprovacao?: string;
}
```

**Regra de Negócio:**
> ⚠️ **Mínimo de 3 orçamentos** é obrigatório para conclusão da etapa.

## 🔀 Fluxo Visual

```
┌───────────────────────────────────────────────────────────────┐
│               FLUXO OS-09 (Requisição de Compras)             │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  GATILHO:                                                     │
│  ┌────────────┐               ┌─────────────────────┐        │
│  │  Manual    │      OU       │  Via OS-13 Etapa 10 │        │
│  │  (Qualquer │               │  (Automático)       │        │
│  │  colabora) │               │                     │        │
│  └─────┬──────┘               └──────────┬──────────┘        │
│        │                                  │                   │
│        └─────────────┬───────────────────┘                   │
│                      │                                        │
│                      ▼                                        │
│  SETOR: OBRAS        ┌─────────────────────────────────────┐ │
│  ┌───────────────────│                                     │ │
│  │  ETAPA 1: 📋 Requisição de Compra                       │ │
│  │  ├─ Selecionar Centro de Custo (obrigatório)            │ │
│  │  ├─ Adicionar itens (quantidade, especificação)         │ │
│  │  ├─ Valor total calculado automaticamente               │ │
│  │  └─ Definir urgência e justificativa                    │ │
│  └───────────────────│─────────────────────────────────────┘ │
│                      │                                        │
│                 🔀 HANDOFF                                    │
│                      │                                        │
│  SETOR: ADMIN        ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  ETAPA 2: 📎 Upload de Orçamentos                       │ │
│  │  ├─ ⚠️ MÍNIMO 3 ORÇAMENTOS                              │ │
│  │  ├─ Anexar PDFs/imagens                                 │ │
│  │  ├─ Registrar valores e fornecedores                    │ │
│  │  └─ Selecionar orçamento vencedor                       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                      │                                        │
│                      ▼                                        │
│  APROVAÇÃO FINANCEIRA (fora do workflow OS-09)               │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## 🔗 Integração com OS-13

Quando criada via **OS-13 (Start de Contrato de Obra) - Etapa 10**:

```typescript
// Em OS-13, Etapa 10 cria OS-09 automaticamente
const os09Data = {
  tipoOSCodigo: 'OS-09',
  clienteId: os13.cliente_id,
  parentOSId: os13.id,
  descricao: 'Requisição de Materiais - Gerado via OS-13',
  metadata: {
    osOrigemId: os13.id,
    osOrigemCodigo: os13.codigo_os,
    centroCustoId: os13.cc_id,
  }
};
```

---

## 📊 Comparação: OS-07 vs. OS-08 vs. OS-09

| Aspecto | OS-07 (Reforma) | OS-08 (Visita Técnica) | OS-09 (Compras) |
|---------|-----------------|------------------------|-----------------|
| **Etapas** | 5 | 7 | 2 |
| **Handoffs** | 0 | 1 (Admin→Assessoria) | 1 (Obras→Admin) |
| **Iniciador** | Cliente | Cliente | Livre |
| **Formulário Público** | ✅ Sim | ❌ Não | ❌ Não |
| **Geração de PDF** | ✅ Parecer | ✅ Parecer | ❌ Não |
| **Integração Calendário** | ❌ Não | ✅ Sim | ❌ Não |
| **Mínimo 3 Orçamentos** | ❌ Não | ❌ Não | ✅ Sim |
| **Vínculo com OS-13** | ❌ Não | ❌ Não | ✅ Etapa 10 |

---

## 🧪 Testes

### Checklist OS-07

- [ ] Criar OS com identificação de lead
- [ ] Gerar link público `/reforma/{osId}`
- [ ] Cliente consegue acessar formulário sem login
- [ ] Dados salvos em `dados_etapa` da Etapa 2
- [ ] Avanço automático para Etapa 3 após submit
- [ ] Análise de parecer funciona em `/os/07/analise/{osId}`
- [ ] Geração de PDF do Termo de Reforma

### Checklist OS-08

- [x] Identificação do solicitante com fotos
- [x] Atribuição de cliente existente
- [x] Handoff Etapa 2 → 3 (Admin → Assessoria)
- [x] Agendamento integrado com calendário
- [x] Formulário pós-visita completo (pontuação, NBR, fotos)
- [x] Geração de parecer técnico via Edge Function
- [x] Envio ao cliente (e-mail/WhatsApp)
- [ ] Regra OS-05 (assessoria anual → OS-08 semanal)
- [x] **v2.8:** WorkflowAccordion `type="multiple"` para navegação histórica
- [x] **v2.8:** Etapas concluídas mantêm status verde ao expandir
- [x] **v2.8:** Adendos com visual minimalista (ícones Lucide)
- [x] **v2.8:** saveStep marca como `concluida` ao avançar

### Checklist OS-09

- [ ] Centro de Custo obrigatório
- [ ] Adicionar múltiplos itens
- [ ] Cálculo automático de valor total
- [ ] Handoff Etapa 1 → 2 (Obras → Admin)
- [ ] Upload de mínimo 3 orçamentos
- [ ] Validação de quantidade de orçamentos
- [ ] Seleção de orçamento vencedor
- [ ] Criação via OS-13 Etapa 10 funciona

---

## 🐛 Troubleshooting

### OS-07: Formulário público não salva dados

**Causa:** Falta de permissão RLS para acesso anônimo

**Solução:**
```sql
-- Permitir leitura e escrita anônima para formulários públicos
CREATE POLICY "allow_public_form_read" ON os_etapas
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM ordens_servico os
    WHERE os.id = os_etapas.os_id
    AND os.tipo_os_nome = 'OS-07'
  )
);
```

### OS-08: Handoff não dispara

**Causa:** `osType` incorreto no hook de transferência

**Solução:**
```typescript
// Verificar se osType está no formato correto
const osType = 'OS-08'; // NÃO 'OS 08: Visita Técnica'
```

### OS-09: Menos de 3 orçamentos permitidos

**Causa:** Validação de frontend não está bloqueando avanço

**Solução:**
```typescript
// Adicionar validação antes de handleNextStep
if (currentStep === 2 && orcamentos.length < 3) {
  toast.error('É necessário anexar no mínimo 3 orçamentos');
  return;
}
```

---

## 📈 Melhorias Futuras

### OS-07
- [ ] Notificação push quando cliente preencher formulário
- [ ] Preview do formulário antes de gerar link
- [ ] Templates de parecer personalizáveis

### OS-08
- [ ] Checklist de itens a inspecionar na visita
- [ ] Integração com Google Maps (localização exata)
- [ ] Assinatura digital do parecer
- [ ] Disparo automático de OS-08 semanal para contratos OS-05

### OS-09
- [ ] Integração com fornecedores cadastrados
- [ ] Comparativo automático de orçamentos
- [ ] Aprovação via app mobile
- [ ] Dashboard de compras pendentes

---

## 📚 Referências

### Documentação Relacionada

- [TODAS_OS_E_ETAPAS.md](../sistema/TODAS_OS_E_ETAPAS.md) - Visão geral de todas as OS
- [OS_01_04_TECHNICAL_DOCUMENTATION.md](./OS_01_04_TECHNICAL_DOCUMENTATION.md) - Doc técnica OS 1-4
- [OS_05_06_TECHNICAL_DOCUMENTATION.md](./OS_05_06_TECHNICAL_DOCUMENTATION.md) - Doc técnica OS 5-6
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Schema do banco de dados
- **[ACCORDION_ADENDOS_SYSTEM.md](./ACCORDION_ADENDOS_SYSTEM.md)** - Sistema de Accordion com Adendos (OS-07/08)

---

**Última Revisão:** 2026-01-13  
**Autor:** Sistema Minerva ERP  
**Versão do Documento:** 2.9.0
