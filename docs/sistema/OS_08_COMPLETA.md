# 📋 OS-08: Visita Técnica / Parecer Técnico

> **Última Atualização:** 2026-01-13  
> **Setor:** Assessoria  
> **Workflow:** 7 etapas  
> **Prazo Total:** 10 dias úteis  
> **Implementação:** 95% ✅

---

## 🎯 Objetivo

Solicitação, agendamento e execução de **visita técnica** com geração de **parecer/documento técnico** para clientes.

### Regra Especial
> **Clientes com contrato OS-05 (assessoria anual):** Uma OS-08 deve ser agendada **toda semana** como parte do serviço de assessoria recorrente.

---

## 🏗 Arquitetura

### Estrutura de Arquivos

```
src/components/os/assessoria/os-8/
├── pages/
│   └── os08-workflow-page.tsx           # Workflow principal (388 linhas)
├── components/
│   ├── checklist-recebimento.tsx        # Checklist para Recebimento de Unidade (legacy)
│   └── checklist-recebimento-table.tsx  # Checklist em formato tabela (novo)
├── types/
│   └── os08-types.ts                    # Tipos e constantes
└── steps/
    ├── index.ts
    ├── step-detalhes-solicitacao.tsx    # Etapa 2
    ├── step-agendar-visita.tsx          # Etapa 3
    ├── step-realizar-visita.tsx         # Etapa 4
    ├── step-formulario-pos-visita.tsx   # Etapa 5 (dinâmico por finalidade)
    ├── step-gerar-documento.tsx         # Etapa 6
    └── step-enviar-documento.tsx        # Etapa 7
```

> **Nota:** Etapa 1 (Identificação do Cliente) usa o componente compartilhado `LeadCadastro`

### Props do Componente Principal

```typescript
interface OS08WorkflowPageProps {
  onBack?: () => void;
  osId?: string;
  initialStep?: number;   // 🆕 Navegação direta para etapa
  readonly?: boolean;     // 🆕 Modo somente leitura
  codigoOS?: string;      // 🆕 Código da OS (ex: "OS0800047")
  tipoOSNome?: string;    // 🆕 Nome do tipo (ex: "Visita Técnica")
}
```

### Componentes Compartilhados

```
src/components/os/shared/components/
├── workflow-stepper.tsx         # ✅ Stepper horizontal (155 linhas)
├── workflow-step-summary.tsx    # ✅ Resumo de etapa (221 linhas)
├── step-readonly-with-adendos.tsx # ✅ Container read-only com adendos
└── workflow-footer.tsx          # Navegação inferior
```

### Hooks Utilizados

```
src/lib/hooks/
├── use-workflow-state.ts        # Estado do workflow (load/save etapas)
├── use-workflow-completion.ts   # Validação de completude
└── use-etapa-adendos.ts         # ✅ Gerenciamento de adendos (200 linhas)
```

---

## 🎨 Sistema de Stepper Horizontal com Adendos

> **Atualização 2026-01-18:** Migrado de Accordion vertical para Stepper horizontal.

A OS-08 utiliza o **Stepper Horizontal** para navegação entre etapas:

### Características

| Característica | Descrição |
|----------------|------------|
| **Navegação Horizontal** | Stepper no topo com todas as etapas visíveis |
| **Foco Único** | Apenas a etapa ativa é renderizada por vez |
| **Estado Visual** | Etapas concluídas = verde, Atual = azul, Pendentes = cinza |
| **Navegação Histórica** | Clique em etapas anteriores para revisar dados |
| **Sistema de Adendos** | Permite adicionar complementos a etapas concluídas |
| **Footer Fixo** | Botões "Voltar" e "Avançar" no rodapé da tela |

### Integração

```tsx
// os08-workflow-page.tsx
import { WorkflowStepper } from '@/components/os/shared/components/workflow-stepper';
import { StepReadOnlyWithAdendos } from '@/components/os/shared/components/step-readonly-with-adendos';

// Stepper no topo da página
<WorkflowStepper
  steps={steps}
  currentStep={currentStep}
  completedSteps={completedSteps}
  onStepClick={handleStepChange}
/>

// Conteúdo da etapa ativa com suporte a adendos
{viewingCompletedStep && stepEtapa?.id ? (
  <StepReadOnlyWithAdendos etapaId={stepEtapa.id}>
    {formContent}
  </StepReadOnlyWithAdendos>
) : formContent}
```

### Tabela no Banco de Dados

```sql
-- os_etapas_adendos
-- Armazena complementos imutáveis às respostas originais
CREATE TABLE os_etapas_adendos (
    id uuid PRIMARY KEY,
    etapa_id uuid REFERENCES os_etapas(id),
    campo_referencia text NOT NULL,
    conteudo text NOT NULL,
    criado_por_id uuid REFERENCES colaboradores(id),
    criado_em timestamptz DEFAULT now()
);
```

---

## 🔄 Fluxo de 7 Etapas

| # | Etapa | Responsável | Prazo | Componente |
|:-:|-------|-------------|:-----:|------------|
| **1** | Identificação do Cliente | Administrativo | 1 dia | `LeadCadastro` |
| **2** | Detalhes da Solicitação | Administrativo | 1 dia | `step-detalhes-solicitacao.tsx` |
| **3** | Agendar Visita | Administrativo | 2 dias | `step-agendar-visita.tsx` |
| **4** | Realizar Visita | Assessoria | 2 dias | `step-realizar-visita.tsx` |
| **5** | Formulário Pós-Visita | Assessoria | 2 dias | `step-formulario-pos-visita.tsx` |
| **6** | Gerar Documento | Administrativo | 1 dia | `step-gerar-documento.tsx` |
| **7** | Enviar ao Cliente | Sistema | 1 dia | `step-enviar-documento.tsx` |

---

## 🔀 Handoff: Etapa 2 → 3

```
Administrativo (Etapa 2: Detalhes da Solicitação)
        │
        ├─── Transferência Automática ───┐
        │                                  │
        ▼                                  ▼
Assessoria (Etapa 3: Agendar Visita)  Coord. Assessoria Notificado
```

---

## 📝 ETAPA 1: Identificação do Solicitante

**Componente:** `step-identificacao-solicitante.tsx` (299 linhas)  
**Responsável:** Administrativo  
**Prazo:** 1 dia útil

### Seção: Dados Básicos

| Campo | Tipo | Obrigatório | Placeholder/Descrição |
|-------|------|:-----------:|----------------------|
| `nomeCompleto` | `Input` (text) | ✅ | "Digite o nome completo" |
| `contatoWhatsApp` | `Input` (tel) | ✅ | "(00) 00000-0000" |
| `condominio` | `Input` (text) | ✅ | "Nome do condomínio" |
| `cargo` | `Input` (text) | ✅ | "Ex: Síndico, Zelador, etc." |
| `bloco` | `Input` (text) | ✅ | "Ex: Bloco A" (caso seja morador) |
| `unidadeAutonoma` | `Input` (text) | ✅ | "Ex: Apto 101" (caso seja morador) |

### Seção: Tipo de Área

| Campo | Tipo | Obrigatório | Opções |
|-------|------|:-----------:|--------|
| `tipoArea` | `RadioGroup` | ✅ | `unidade_autonoma`, `area_comum` |

### Seção: Questionário 01

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| `unidadesVistoriar` | `Textarea` (3 rows) | ✅ | Unidades a serem vistoriadas |
| `contatoUnidades` | `Input` (tel) | ✅ | Contato das unidades envolvidas |

### Seção: Discriminação

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| `tipoDocumento` | `Input` (text) | ✅ | Parecer técnico ou escopo de intervenção |
| `areaVistoriada` | `RadioGroup` | ✅ | Área a ser vistoriada (9 opções) |
| `detalhesSolicitacao` | `Textarea` (4 rows) | ✅ | O que deve ser vistoriado |
| `tempoSituacao` | `Input` (text) | ✅ | Há quanto tempo a situação ocorre |
| `primeiraVisita` | `Input` (text) | ✅ | "Sim ou Não" |

#### Opções de Área Vistoriada

1. ABASTECIMENTO DE ÁGUA (tubulações, conexões, hidrômetro, reservatórios, bombas, registros e afins) – exceto SPCI
2. SPCI (Qualquer item relacionado ao sistema de proteção e combate ao incêndio)
3. TELEFONE, INTERFONE, ANTENA (cabos, quadros e afins)
4. ESGOTAMENTO E DRENAGEM (tubulações, conexões, caixas coletoras, galerias, sarjetas, grelhas e afins)
5. ARQUITETURA (Fachadas, muros, área verde e afins)
6. ELÉTRICA (Quadros, disjuntores, tomadas, interruptores, centrais de medição e afins)
7. SPDA (captores, malhas, sinalização, cabos e afins)
8. ESTRUTURAL (Fundações, lajes, vigas, pilares e afins)
9. COBERTURA (Telhado, laje, calhas, rufos, platibanda e afins)

### Seção: Anexar Fotos

| Campo | Tipo | Obrigatório | Configuração |
|-------|------|:-----------:|--------------|
| `arquivos` | `FileUploadUnificado` | ❌ | maxFiles: 10, aceita: JPEG, JPG, PNG |

---

## 📝 ETAPA 2: Atribuir Cliente

**Componente:** `step-atribuir-cliente.tsx` (58 linhas)  
**Responsável:** Administrativo  
**Prazo:** 1 dia útil

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| `clienteId` | `LeadCadastro` | ✅ | Seleção de cliente existente |

**Configuração do LeadCadastro:**
- `showEdificacao`: true
- `showEndereco`: true
- `statusFilter`: ['lead', 'ativo']

---

## 📝 ETAPA 3: Agendar Visita

**Componente:** `step-agendar-visita.tsx` (165 linhas)  
**Responsável:** Administrativo  
**Prazo:** 2 dias úteis

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| `agendamentoId` | Sistema | Auto | ID do agendamento criado |
| `dataAgendamento` | `CalendarioIntegracao` | ✅ | Data da visita (ISO 8601) |
| `horarioInicio` | `CalendarioIntegracao` | ✅ | Horário de início |
| `horarioFim` | `CalendarioIntegracao` | ✅ | Horário de fim |
| `duracaoHoras` | Sistema | Auto | Duração calculada |
| `turnoId` | Sistema | Auto | ID do turno selecionado |

**Integração:**
- Usa componente `CalendarioIntegracao` com categoria `"visita"`
- Integra com tabela `agendamentos` no banco
- Valida que horário foi confirmado antes de avançar

---

## 📝 ETAPA 4: Realizar Visita

**Componente:** `step-realizar-visita.tsx` (156 linhas)  
**Responsável:** Assessoria  
**Prazo:** 2 dias úteis

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| `visitaRealizada` | `boolean` | ✅ | Confirmação de realização |
| `dataRealizacao` | `string` (ISO 8601) | Auto | Timestamp da confirmação |

**Ações:**
- Botão "Iniciar Visita" → Define `visitaRealizada = true`
- Botão "Cancelar Confirmação" → Reverte para `false`

---

## 📝 ETAPA 5: Formulário Pós-Visita ⭐

**Componente:** `step-formulario-pos-visita.tsx` (488 linhas)  
**Responsável:** Assessoria  
**Prazo:** 2 dias úteis  
**Status Situação:** **Aguard. Aprovação** (requer validação do Coord. Assessoria)

> **⚠️ Esta é a etapa mais complexa, com dados técnicos detalhados para geração do parecer.**

### Seção: Questionário

| Campo | Tipo | Obrigatório | Pergunta |
|-------|------|:-----------:|----------|
| `pontuacaoEngenheiro` | `Select` | ✅ | "Você foi pontual no horário da visita?" |
| `pontuacaoMorador` | `Select` | ✅ | "O morador foi pontual no horário da visita?" |
| `tipoDocumento` | `Select` | ✅ | "Esta visita técnica é para gerar um parecer técnico ou um escopo de intervenção?" |

**Opções para pontuação:** `sim`, `nao`  
**Opções para tipoDocumento:** `parecer`, `escopo`

### Seção: Área Vistoriada

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| `areaVistoriada` | `RadioGroup` | ✅ | Mesmas 9 opções da Etapa 1 |

### Seção: Informações Técnicas

| Campo | Tipo | Obrigatório | Placeholder |
|-------|------|:-----------:|-------------|
| `manifestacaoPatologica` | `Textarea` (3 rows) | ✅ | "Descreva as manifestações patológicas identificadas" |
| `recomendacoesPrevias` | `Textarea` (3 rows) | ✅ | "Liste as recomendações iniciais" |
| `gravidade` | `Select` | ✅ | Baixa, Média, Alta, Crítica |
| `origemNBR` | `Input` (text) | ✅ | "Ex: NBR 15575" |
| `observacoesGerais` | `Textarea` (4 rows) | ✅ | "Adicione observações relevantes sobre a visita" |

**Opções de gravidade:** `baixa`, `media`, `alta`, `critica`

### Seção: Fotos do Local Vistoriado

| Campo | Tipo | Obrigatório | Configuração |
|-------|------|:-----------:|--------------|
| `fotosLocal` | Upload manual | ✅ | Aceita imagens, preview em grid 2x4 |

### Seção: Resultado da Visita

| Campo | Tipo | Obrigatório | Placeholder |
|-------|------|:-----------:|-------------|
| `resultadoVisita` | `Textarea` (3 rows) | ✅ | "Descreva o resultado geral da visita" |
| `justificativa` | `Textarea` (3 rows) | ✅ | "Justifique o resultado apresentado" |

---

## 📝 ETAPA 6: Gerar Documento

**Componente:** `step-gerar-documento.tsx` (218 linhas)  
**Responsável:** Administrativo  
**Prazo:** 1 dia útil

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| `documentoGerado` | `boolean` | ✅ | Indica se PDF foi gerado |
| `documentoUrl` | `string` | Auto | URL assinada do PDF |

**Integração PDF:**
```typescript
const result = await generatePDF('visita-tecnica', osId, {
  // Dados de todas as etapas anteriores
});
```

**Template:** `visita-tecnica-template.tsx`

---

## 📝 ETAPA 7: Enviar ao Cliente

**Componente:** `step-enviar-documento.tsx` (261 linhas)  
**Responsável:** Sistema  
**Prazo:** 1 dia útil

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| `documentoEnviado` | `boolean` | ✅ | Indica se foi enviado |
| `dataEnvio` | `string` (ISO 8601) | Auto | Timestamp do envio |

**Ações:**
- Visualizar documento antes do envio
- Baixar PDF
- Enviar documento ao cliente (e-mail + portal)

---

## 💾 Interface TypeScript Consolidada

```typescript
interface OS08Data {
  // Etapa 1: Identificação do Solicitante
  etapa1: {
    nomeCompleto: string;
    contatoWhatsApp: string;
    condominio: string;
    cargo: string;
    bloco: string;
    unidadeAutonoma: string;
    tipoArea: 'unidade_autonoma' | 'area_comum';
    unidadesVistoriar: string;
    contatoUnidades: string;
    tipoDocumento: string;
    areaVistoriada: string;
    detalhesSolicitacao: string;
    tempoSituacao: string;
    primeiraVisita: string;
    arquivos?: FileWithComment[];
  };
  
  // Etapa 2: Atribuir Cliente
  etapa2: {
    clienteId: string;
  };
  
  // Etapa 3: Agendar Visita
  etapa3: {
    agendamentoId?: string;
    dataAgendamento?: string;
    horarioInicio?: string;
    horarioFim?: string;
    duracaoHoras?: number;
    turnoId?: string;
  };
  
  // Etapa 4: Realizar Visita
  etapa4: {
    visitaRealizada: boolean;
    dataRealizacao: string;
  };
  
  // Etapa 5: Formulário Pós-Visita
  etapa5: {
    pontuacaoEngenheiro: 'sim' | 'nao';
    pontuacaoMorador: 'sim' | 'nao';
    tipoDocumento: 'parecer' | 'escopo';
    areaVistoriada: string;
    manifestacaoPatologica: string;
    recomendacoesPrevias: string;
    gravidade: 'baixa' | 'media' | 'alta' | 'critica';
    origemNBR: string;
    observacoesGerais: string;
    fotosLocal: string[];
    resultadoVisita: string;
    justificativa: string;
  };
  
  // Etapa 6: Gerar Documento
  etapa6: {
    documentoGerado: boolean;
    documentoUrl: string;
  };
  
  // Etapa 7: Enviar ao Cliente
  etapa7: {
    documentoEnviado: boolean;
    dataEnvio: string;
  };
}
```

---

## 📊 Resumo de Campos

| Etapa | Campos | Uploads |
|:-----:|:------:|:-------:|
| 1 | 14 | 1 (fotos) |
| 2 | 1 | 0 |
| 3 | 6 | 0 |
| 4 | 2 | 0 |
| 5 | 12 | 1 (fotos) |
| 6 | 2 | 0 |
| 7 | 2 | 0 |
| **Total** | **39** | **2** |

---

## 📄 Geração de PDF

| Etapa | Template | Tipo PDF |
|:-----:|----------|----------|
| 6 | `visita-tecnica-template.tsx` | `visita-tecnica` |

**Dados utilizados no PDF:**
- Informações do solicitante (Etapa 1)
- Dados do cliente (Etapa 2)
- Informações do agendamento (Etapa 3)
- Confirmação de realização (Etapa 4)
- **Formulário pós-visita completo** (Etapa 5) - dados técnicos principais
