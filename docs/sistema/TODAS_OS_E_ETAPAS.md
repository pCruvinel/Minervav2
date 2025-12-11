# 📋 TODAS AS ORDENS DE SERVIÇO E ETAPAS - Minerva ERP v2.5

## 🎯 Visão Geral

Este documento detalha o status de implementação das **13 Ordens de Serviço (OS)** do sistema Minerva ERP, incluindo:

- **Passo-a-Passo**: Sequência completa das etapas
- **Arquivos no Sistema**: Componentes e páginas implementadas
- **% Concluída**: Status de implementação por OS

**Total de OS**: 13 tipos
**Total de Etapas**: 15 etapas padrão (com variações por tipo)
**Status Geral**: ~75% implementado

---

## 📊 LEGENDA DE STATUS

| Ícone | Status | Descrição |
|-------|--------|-----------|
| ✅ | **COMPLETA** | Todas as etapas implementadas e funcionais |
| ⚠️ | **PARCIAL** | Algumas etapas mockadas ou incompletas |
| ❌ | **PENDENTE** | Workflow não implementado |
| 🔄 | **EM DESENVOLVIMENTO** | Sendo trabalhado atualmente |

---

## 🏗️ OS-01 a 04: OBRAS (PERÍCIA/REVITALIZAÇÃO/REFORÇO/OUTROS)

### 📋 Informações Gerais
- **Setor**: Obras
- **Responsável Inicial**: Coordenador Administrativo
- **Workflow**: 15 etapas compartilhadas entre OS-01, OS-02, OS-03 e OS-04
- **Arquivo Principal**: `os-details-workflow-page.tsx`
- **Constantes**: `src/constants/os-workflow.ts`
- **% Concluída**: 95% ✅

### 📝 Passo-a-Passo das Etapas (Definido em `OS_WORKFLOW_STEPS`)

| # | Etapa | Status | Componente | Responsável |
|----|-------|--------|------------|-------------|
| 1 | Identifique o Lead | ✅ | `cadastrar-lead.tsx` | Administrativo |
| 2 | Seleção do Tipo de OS | ✅ | Select interno | Administrativo |
| 3 | Follow-up 1 (Entrevista Inicial) | ✅ | `step-followup-1.tsx` | Administrativo |
| 4 | Agendar Visita Técnica | ✅ | `step-agendar-apresentacao.tsx` | Administrativo |
| 5 | Realizar Visita | ✅ | Switch + Checkbox | Obras |
| 6 | Follow-up 2 (Pós-Visita) | ✅ | `step-preparar-orcamentos.tsx` | Obras |
| 7 | Formulário Memorial (Escopo) | ✅ | `step-memorial-escopo.tsx` | Obras |
| 8 | Precificação | ✅ | `step-precificacao.tsx` | Obras |
| 9 | Gerar Proposta Comercial | ✅ | `step-gerar-proposta.tsx` | Administrativo |
| 10 | Agendar Visita (Apresentação) | ✅ | `step-agendar-apresentacao.tsx` | Administrativo |
| 11 | Realizar Visita (Apresentação) | ✅ | `step-realizar-apresentacao.tsx` | Administrativo |
| 12 | Follow-up 3 (Pós-Apresentação) | ✅ | `step-analise-relatorio.tsx` | Administrativo |
| 13 | Gerar Contrato (Upload) | ✅ | `step-gerar-contrato.tsx` | Administrativo |
| 14 | Contrato Assinado | ✅ | `step-contrato-assinado.tsx` | Administrativo |
| 15 | Iniciar Contrato de Obra | ✅ | Gatilho → OS-13 | Administrativo |

### ⚙️ Tipos de OS Disponíveis
- **OS 01**: Perícia de Fachada
- **OS 02**: Revitalização de Fachada
- **OS 03**: Reforço Estrutural
- **OS 04**: Outros

### 📁 Arquivos no Sistema
```
src/components/os/shared/
├── pages/
│   └── os-details-workflow-page.tsx     # Página principal unificada
├── components/
│   ├── workflow-stepper.tsx             # Stepper visual
│   ├── workflow-footer.tsx              # Footer com ações
│   └── feedback-transferencia.tsx       # Modal de feedback pós-transferência (NOVO v2.7)
└── steps/
    ├── cadastrar-lead.tsx               # Etapa 1
    ├── step-followup-1.tsx              # Etapa 3
    ├── step-agendar-apresentacao.tsx    # Etapas 4 e 10
    ├── step-preparar-orcamentos.tsx     # Etapa 6
    ├── step-memorial-escopo.tsx         # Etapa 7
    ├── step-precificacao.tsx            # Etapa 8
    ├── step-gerar-proposta.tsx          # Etapa 9
    ├── step-realizar-apresentacao.tsx   # Etapa 11
    ├── step-analise-relatorio.tsx       # Etapa 12
    ├── step-gerar-contrato.tsx          # Etapa 13
    └── step-contrato-assinado.tsx       # Etapa 14

src/lib/hooks/
├── use-transferencia-setor.ts           # Hook de transferência automática (NOVO v2.7)
└── use-notificar-coordenador.ts         # Notificar coordenador (NOVO v2.7)

src/constants/
└── os-workflow.ts                       # Definição de etapas e tipos
```

---

## 🔧 OS-05 e OS-06: ASSESSORIA MENSAL/AVULSA - LEAD (ASSESSORIA)

### 📋 Informações Gerais
- **Setor**: Assessoria
- **Responsável Inicial**: Coordenador Administrativo
- **Workflow**: 12 etapas completas compartilhadas
- **OS-05**: Assessoria Técnica Mensal → Gera **OS-12** ao final
- **OS-06**: Assessoria Pericial Avulsa → Gera **OS-11** ao final
- **Arquivo Principal**: `os-details-assessoria-page.tsx`
- **% Concluída**: 95% ✅

### 📝 Passo-a-Passo das Etapas

| # | Etapa | Status | Componente | Responsável |
|----|-------|--------|------------|-------------|
| 1 | Identifique o Lead | ✅ | `cadastrar-lead.tsx` | Administrativo |
| 2 | Seleção do Tipo de OS | ✅ | `step-selecao-tipo-assessoria.tsx` | Administrativo |
| 3 | Follow-up 1 (Entrevista Inicial) | ✅ | `step-followup-1-os5.tsx` / `step-followup-1-os6.tsx` | Administrativo |
| 4 | Formulário Memorial (Escopo e Prazos) | ✅ | `step-escopo-assessoria.tsx` | Administrativo |
| 5 | Precificação (Formulário Financeiro) | ✅ | `step-precificacao-assessoria.tsx` | Administrativo |
| 6 | Gerar Proposta Comercial | ✅ | `step-gerar-proposta.tsx` | Administrativo |
| 7 | Agendar Visita (Apresentação) | ✅ | `step-agendar-apresentacao.tsx` | Administrativo |
| 8 | Realizar Visita (Apresentação) | ✅ | `step-realizar-apresentacao.tsx` | Administrativo |
| 9 | Follow-up 3 (Pós-Apresentação) | ✅ | `step-analise-relatorio.tsx` | Administrativo |
| 10 | Gerar Contrato (Upload) | ✅ | `step-gerar-contrato.tsx` | Administrativo |
| 11 | Contrato Assinado | ✅ | `step-contrato-assinado.tsx` | Administrativo |
| 12 | Ativar Contrato | ✅ | `step-ativar-contrato-assessoria.tsx` | Administrativo |

### ⚙️ Diferenças por Tipo

| Característica | OS-05 (Mensal) | OS-06 (Avulsa) |
|----------------|----------------|----------------|
| **Tipo de Serviço** | Assessoria Técnica Recorrente | Assessoria Pericial |
| **Follow-up 1** | `step-followup-1-os5.tsx` | `step-followup-1-os6.tsx` |
| **OS Filha Gerada** | **OS-12** (Assessoria Recorrente) | **OS-11** (Laudo Pontual) |
| **Recorrência** | Mensal/Anual | Pontual |

### 🔄 Fluxo de Ativação (Etapa 12)
```
OS-05 concluída ──────► Cria OS-12 (Assessoria Técnica Recorrente)
OS-06 concluída ──────► Cria OS-11 (Laudo Pontual Assessoria)
```

### 📁 Arquivos no Sistema
```
src/components/os/assessoria/os-5-6/
├── pages/
│   ├── os-details-assessoria-page.tsx   # Página principal unificada (12 etapas)
│   ├── os05-workflow-page.tsx           # Entrada legacy OS-05
│   └── os06-workflow-page.tsx           # Entrada legacy OS-06
└── steps/
    ├── index.ts                          # Exports
    ├── step-selecao-tipo-assessoria.tsx  # Etapa 2 específica
    └── step-ativar-contrato-assessoria.tsx # Etapa 12 específica

src/components/os/shared/steps/
├── cadastrar-lead.tsx                    # Etapa 1
├── step-followup-1.tsx                   # Etapa 3 (base)
├── step-followup-1-os5.tsx               # Etapa 3 (específica OS-05)
├── step-followup-1-os6.tsx               # Etapa 3 (específica OS-06)
├── step-escopo-assessoria.tsx            # Etapa 4
├── step-precificacao-assessoria.tsx      # Etapa 5
├── step-gerar-proposta.tsx               # Etapa 6
├── step-agendar-apresentacao.tsx         # Etapa 7
├── step-realizar-apresentacao.tsx        # Etapa 8
├── step-analise-relatorio.tsx            # Etapa 9
├── step-gerar-contrato.tsx               # Etapa 10
└── step-contrato-assinado.tsx            # Etapa 11
```

---

## 🏠 OS-07: SOLICITAÇÃO DE REFORMA (ASSESSORIA)

### 📋 Informações Gerais
- **Setor**: Assessoria
- **Responsável Inicial**: Administrativo
- **Workflow**: 5 etapas com link público para cliente
- **Tipo**: Termo de Comunicação de Reforma (formulário externo)
- **% Concluída**: 90% ✅

### 🎯 Objetivo
Gerar um link público para o cliente preencher dados de reforma e analisar a solicitação.

### 📝 Passo-a-Passo das Etapas

| # | Etapa | Status | Componente | Responsável |
|----|-------|--------|------------|-------------|
| 1 | Identificação do Lead | ✅ | `cadastrar-lead.tsx` | Administrativo |
| 2 | Aguardando Cliente | ✅ | Link público gerado | Sistema |
| 3 | Análise e Parecer | ✅ | `os07-analise-page.tsx` | Assessoria |
| 4 | Gerar PDF | ⚠️ | Documento técnico | Assessoria |
| 5 | Concluída | ⚠️ | Confirmação final | Administrativo |

### ⚙️ Regras de Negócio Específicas

#### **Etapa 1: Identificação**
- Cadastro ou seleção do condomínio/cliente
- Geração automática de OS ao avançar

#### **Etapa 2: Aguardando Cliente**
- Link público gerado: `/reforma/{osId}`
- Cliente preenche formulário externamente
- Botão para copiar/abrir link
- Avanço automático após envio do formulário

#### **Etapa 3: Análise**
- Visualização dos dados enviados pelo cliente
- Redirecionamento para `/os/07/analise/{osId}`

### 📁 Arquivos no Sistema
```
src/components/os/assessoria/os-7/
├── pages/
│   ├── os07-workflow-page.tsx       # Página principal (5 etapas)
│   └── os07-analise-page.tsx        # Página de análise
└── components/
    └── os07-form-publico.tsx        # Formulário público para cliente
```

---

## 🔧 OS-08: VISITA TÉCNICA / PARECER TÉCNICO (ASSESSORIA)

### 📋 Informações Gerais
- **Setor**: Assessoria
- **Responsável Inicial**: Administrativo
- **Workflow**: 7 etapas completas
- **Tipo**: Visita Técnica com geração de Parecer Técnico
- **% Concluída**: 95% ✅

### 🎯 Objetivo
Solicitação, agendamento e execução de visita técnica com geração de documento/parecer.

### 📝 Passo-a-Passo das Etapas

| # | Etapa | Status | Componente | Responsável |
|----|-------|--------|------------|-------------|
| 1 | Identificação do Solicitante | ✅ | `step-identificacao-solicitante.tsx` | Administrativo |
| 2 | Atribuir Cliente | ✅ | `step-atribuir-cliente.tsx` | Administrativo |
| 3 | Agendar Visita | ✅ | `step-agendar-visita.tsx` | Administrativo |
| 4 | Realizar Visita | ✅ | `step-realizar-visita.tsx` | Obras |
| 5 | Formulário Pós-Visita | ✅ | `step-formulario-pos-visita.tsx` | Obras |
| 6 | Gerar Documento | ✅ | `step-gerar-documento.tsx` | Administrativo |
| 7 | Enviar ao Cliente | ✅ | `step-enviar-documento.tsx` | Administrativo |

### ⚙️ Regras de Negócio Específicas

#### **Etapa 1: Identificação do Solicitante**
- Dados do solicitante (nome, WhatsApp, condomínio)
- Tipo de documento requerido
- Detalhes da solicitação e fotos anexadas

#### **Etapa 2: Atribuir Cliente**
- Seleção de cliente existente no sistema
- OS é criada ao avançar para Etapa 3

#### **Etapa 3: Agendar Visita**
- Integração com calendário
- Criação de agendamento

#### **Etapa 5: Formulário Pós-Visita**
- Pontuação do engenheiro e morador
- Manifestação patológica e recomendações
- Gravidade e referência NBR
- Upload de fotos do local

#### **Etapa 6: Gerar Documento**
- Geração automática do parecer técnico (PDF)

### 📁 Arquivos no Sistema
```
src/components/os/assessoria/os-8/
├── pages/
│   └── os08-workflow-page.tsx           # Página principal
└── steps/
    ├── index.ts
    ├── step-identificacao-solicitante.tsx # Etapa 1
    ├── step-atribuir-cliente.tsx         # Etapa 2
    ├── step-agendar-visita.tsx           # Etapa 3
    ├── step-realizar-visita.tsx          # Etapa 4
    ├── step-formulario-pos-visita.tsx    # Etapa 5
    ├── step-gerar-documento.tsx          # Etapa 6
    └── step-enviar-documento.tsx         # Etapa 7
```

---

## 💰 OS-09: REQUISIÇÃO DE COMPRAS (ADMINISTRATIVO)

### 📋 Informações Gerais
- **Setor**: Administrativo / Compras
- **Responsável Inicial**: Solicitante
- **Workflow**: 2 etapas completas
- **Tipo**: OS interna (compras para obras ou operações)
- **Gatilho**: Pode ser criada manualmente ou via OS-13 (Etapa 10)
- **% Concluída**: 95% ✅

### 🎯 Objetivo
Formalizar a solicitação de compra de materiais/serviços e coletar orçamentos para aprovação.

### 📝 Passo-a-Passo das Etapas

| # | Etapa | Status | Componente | Responsável |
|----|-------|--------|------------|-------------|
| 1 | Requisição de Compra | ✅ | `step-requisicao-compra.tsx` | Solicitante |
| 2 | Upload de Orçamentos | ✅ | `step-upload-orcamentos.tsx` | Administrativo |

### ⚙️ Regras de Negócio Específicas

#### **Etapa 1: Requisição de Compra**
- Seleção de Centro de Custo obrigatória
- Lista de itens com quantidade e especificação
- Cálculo automático de valor total
- OS é criada ao avançar para Etapa 2

#### **Etapa 2: Upload de Orçamentos**
- Mínimo de **3 orçamentos** exigidos
- Anexo em formato PDF/imagem
- Após conclusão, disponível para aprovação do Financeiro

### 📁 Arquivos no Sistema
```
src/components/os/administrativo/os-9/
├── pages/
│   └── os09-workflow-page.tsx           # Página principal
├── components/
│   ├── index.ts
│   └── requisition-item-card.tsx        # Card de item
└── steps/
    ├── index.ts
    ├── step-requisicao-compra.tsx       # Etapa 1
    └── step-upload-orcamentos.tsx       # Etapa 2

src/routes/_auth/os/criar/
└── requisicao-compras.tsx
```

---

## 👥 OS-10: REQUISIÇÃO DE MÃO DE OBRA / RECRUTAMENTO (RH)

### 📋 Informações Gerais
- **Setor**: RH (Recursos Humanos)
- **Responsável Inicial**: Solicitante
- **Workflow**: 4 etapas completas
- **Tipo**: OS interna (recrutamento e contratação)
- **Gatilho**: Pode ser criada manualmente ou via OS-13 (Etapa 11)
- **% Concluída**: 95% ✅

### 🎯 Objetivo
Formalizar a necessidade de contratação de novos colaboradores com gerenciamento de múltiplas vagas.

### 📝 Passo-a-Passo das Etapas

| # | Etapa | Status | Componente | Responsável |
|----|-------|--------|------------|-------------|
| 1 | Abertura da Solicitação | ✅ | `step-abertura-solicitacao.tsx` | Solicitante |
| 2 | Seleção do Centro de Custo | ✅ | `step-selecao-centro-custo.tsx` | AdministrativoRH |
| 3 | Gerenciador de Vagas | ✅ | `step-gerenciador-vagas.tsx` | Administrativo |
| 4 | Revisão e Envio | ✅ | `step-revisao-envio.tsx` | Administrativo |

### ⚙️ Regras de Negócio Específicas

#### **Etapa 1: Abertura da Solicitação**
- Data de abertura automática
- Identificação do solicitante e departamento
- Nível de urgência (normal/urgente)
- Justificativa obrigatória

#### **Etapa 2: Centro de Custo**
- Seleção de CC ativo obrigatória
- OS é criada ao avançar para Etapa 3
- Vinculação automática com obra (se aplicável)

#### **Etapa 3: Gerenciador de Vagas**
- Adicionar **múltiplas vagas** na mesma solicitação
- Para cada vaga: cargo, função, quantidade, requisitos
- Modal de adicionar vaga individual
- Cards visuais para cada vaga adicionada

#### **Etapa 4: Revisão e Envio**
- Consolidação de todos os dados
- Revisão final antes de enviar ao RH
- Confirmação de envio

### 📁 Arquivos no Sistema
```
src/components/os/administrativo/os-10/
├── pages/
│   └── os10-workflow-page.tsx           # Página principal
├── components/
│   ├── modal-adicionar-vaga.tsx         # Modal de nova vaga
│   └── vaga-card.tsx                    # Card visual da vaga
└── steps/
    ├── index.ts
    ├── step-abertura-solicitacao.tsx    # Etapa 1
    ├── step-selecao-centro-custo.tsx    # Etapa 2
    ├── step-gerenciador-vagas.tsx       # Etapa 3
    └── step-revisao-envio.tsx           # Etapa 4

src/routes/_auth/os/criar/
└── requisicao-mao-de-obra.tsx
```

---

## 🔧 OS-11: LAUDO PONTUAL ASSESSORIA (ASSESSORIA)

### 📋 Informações Gerais
- **Setor**: Assessoria
- **Responsável**: Gestor de Assessoria
- **Workflow**: Contrato de assessoria de escopo limitado
- **Tipo**: Laudo pontual (não recorrente)
- **Gatilho**: Gerado após fechamento do contrato (OS-06)
- **% Concluída**: 90% ✅

### 🎯 Objetivo
Executar contrato de assessoria limitada focado na entrega de documento técnico pontual.

### 📝 Passo-a-Passo das Etapas

| # | Etapa | Status | Componente | Descrição | Dados |
|----|-------|--------|------------|-----------|-------|
| 1 | **Cadastrar o Cliente** | ✅ | `step-cadastro-cliente.tsx` | Validação dos dados do cliente | Mock |
| 2 | **Agendar Visita** | ✅ | `step-agendar-visita.tsx` | Agendamento da visita técnica | Mock |
| 3 | **Realizar Visita e Questionário** | ✅ | `step-realizar-visita.tsx` | Visita in-loco + preenchimento | Mock |
| 4 | **Anexar RT** | ✅ | `step-anexar-rt.tsx` | Responsabilidade Técnica (documento) | Mock |
| 5 | **Gerar Documento** | ✅ | `step-gerar-documento.tsx` | PDF automático do Laudo Técnico | Mock |
| 6 | **Enviar ao Cliente** | ✅ | `step-enviar-cliente.tsx` | Envio automático do documento | Mock |

### ⚙️ Regras de Negócio Específicas

#### **Fluxo Linear e Focado**
- Processo direto da contratação à entrega
- Foco na geração e envio do documento técnico
- Não há recorrência mensal

#### **Geração Automática de PDF**
- Sistema utiliza **Edge Function `generate-pdf`** com template `laudo-tecnico`
- Laudo Técnico gerado automaticamente preenchido com dados da vistoria
- Inclui anexos e RT (Responsabilidade Técnica)
- Chamada: `generate-pdf('laudo-tecnico', dadosDaVistoria)`

#### **Envio Automático**
- Sistema envia documento diretamente ao cliente
- Sem intervenção manual necessária
- Confirmação de entrega

### 💰 Contabilidade
- **Lucro Global**: Diferente do contrato anual
- **Não Recorrente**: Lucro calculado de início ao fim
- **Pagamento Único**: Geralmente à vista ou poucas parcelas

### 📁 Arquivos no Sistema
```
src/components/os/
├── os11-workflow-page.tsx
└── steps/os11/
    ├── index.ts
    ├── step-cadastro-cliente.tsx
    ├── step-agendar-visita.tsx
    ├── step-realizar-visita.tsx
    ├── step-anexar-rt.tsx
    ├── step-gerar-documento.tsx
    └── step-enviar-cliente.tsx

src/routes/_auth/os/criar/
└── laudo-pontual.tsx
```

---

## 🔧 OS-12: START DE CONTRATO - ASSESSORIA ANUAL (ASSESSORIA)

### 📋 Informações Gerais
- **Setor**: Assessoria
- **Responsável Inicial**: Coordenador Administrativo
- **Workflow**: Contrato de longo prazo (anual) com 8 etapas
- **Tipo**: Assessoria recorrente mensal/anual
- **Abertura**: Deve ser aberta pelo **Coordenador Administrativo**
- **% Concluída**: 🔄 Em Reestruturação

### 🎯 Objetivo
Gerenciar contratos de assessoria de longo prazo desde a captação do cliente até a execução e acompanhamento das visitas recorrentes.

### 📝 Passo-a-Passo das Etapas

| # | Etapa | Status | Componente | Descrição | Responsável 
|----|-------|--------|------------|-----------|-------------|---------|
| 1 | **Cadastro do Cliente e Portal** | ❌ | `step-cadastro-cliente-portal.tsx` | Upload de documentos, seleção de cliente, geração de senha | Administrativo
| 2 | **Upload de ART** | ❌ | `step-anexar-art.tsx` | Anexar Anotação de Responsabilidade Técnica | Assessoria 
| 3 | **Upload de Plano de Manutenção** | ❌ | `step-plano-manutencao.tsx` | Upload do plano de manutenção do condomínio | Assessoria
| 4 | **Agendar Visita** | ❌ | `step-agendar-visita.tsx` | Agendamento da primeira visita técnica | Administrativo
| 5 | **Realizar Visita** | ❌ | `step-realizar-visita.tsx` | Checkbox registrando visita com data/horário e observação | Administrativo
| 6 | **Agendar Visita Recorrente** | ❌ | `step-agendar-visita-recorrente.tsx` | Agendar próxima visita periódica | Administrativo
| 7 | **Realizar Visita Recorrente** | ❌ | `step-realizar-visita-recorrente.tsx` | Registrar realização da visita recorrente | Assessoria
| 8 | **Concluir e Transformar em Contrato** | ❌ | `step-concluir-contrato.tsx` | Finaliza OS e transforma em contrato ativo | Assessoria

### 🔄 Fluxo de Responsabilidade (Handoff)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         FLUXO DE HANDOFF - OS 12                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  COORD. ADMINISTRATIVO                    COORD. ASSESSORIA                          │
│  ┌─────────────────────┐                                                             │
│  │ 1. Cadastro Cliente │ ─────────────────►  ┌─────────────────────┐                │
│  │    + Portal         │                     │ 2. Upload de ART    │                │
│  └─────────────────────┘                     └─────────┬───────────┘                │
│                                                        │                             │
│                                                        ▼                             │
│                                              ┌─────────────────────┐                │
│  ┌─────────────────────┐  ◄─────────────────│ 3. Plano Manutenção │                │
│  │ 4. Agendar Visita   │                     └─────────────────────┘                │
│  └─────────┬───────────┘                                                             │
│            │                                                                         │
│            ▼                                                                         │
│  ┌─────────────────────┐                                                             │
│  │ 5. Realizar Visita  │                                                             │
│  └─────────┬───────────┘                                                             │
│            │                                                                         │
│            ▼                                                                         │
│  ┌─────────────────────┐                     ┌─────────────────────┐                │
│  │ 6. Agendar Visita   │ ─────────────────►  │ 7. Realizar Visita  │                │
│  │    Recorrente       │                     │    Recorrente       │                │
│  └─────────────────────┘                     └─────────┬───────────┘                │
│                                                        │                             │
│                                                        ▼                             │
│                                              ┌─────────────────────┐                │
│                                              │ 8. Concluir e       │                │
│                                              │    Transformar em   │                │
│                                              │    Contrato         │                │
│                                              └─────────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### ⚙️ Regras de Negócio Específicas

#### **📧 Etapa 1 - Criação do Portal do Cliente (CRÍTICO)**

> [!IMPORTANT]
> Ao finalizar a Etapa 1, o sistema DEVE criar automaticamente o **Portal do Cliente**.

**Ações Automáticas via Supabase Functions:**
1. **Criação de usuário** no portal do cliente (tabela `clientes_portal`)
2. **Geração de senha** segura e temporária
3. **Envio de e-mail** automático contendo:
   - Login (e-mail do cliente)
   - Senha temporária
   - Link de acesso ao portal
4. **Registro de atividade** na timeline da OS

**Supabase Edge Function:** `create-client-portal`
```typescript
// Chamada esperada:
const { data, error } = await supabase.functions.invoke('create-client-portal', {
  body: {
    clienteId: string,
    email: string,
    nomeCliente: string,
    osId: string
  }
});
```

#### **Referência: Similar à OS 13**
- **Etapa 1**: Idêntica à Etapa 1 da OS-13 (Upload de docs + seleção de cliente + portal)
- **Etapa 2**: Idêntica à Etapa 2 da OS-13 (Upload de ART)

#### **Visita Semanal Obrigatória**
- **Todo cliente OS-12** tem direito e obrigação de visita semanal (OS-08)
- **Obrigatório no calendário**: Sistema deve reservar slots semanais
- **Alerta automático**: Se visita não realizada, sistema gera alerta

#### **Outras Demandas Recorrentes**
- **OS-07**: Aprovação de reformas no interior da unidade
- **OS-08**: Vistoria/inspeção técnica sob demanda
- **Integração automática** com calendário e agendamentos

### 💰 Geração de Receita e Renovação

#### **Recorrência de Receita**
- **Previsão de pagamento**: Gestor ADM insere parcelas e valores
- **Recorrência automática**: Sistema cria lançamentos mensais
- **Integração financeira**: Vinculação com `financeiro_lancamentos`

#### **Renovação Automática**
- **Detecção de renovação**: Sistema identifica contratos com previsão
- **Geração automática**: +12 meses após o 12º mês
- **Reajuste automático**: Aplica percentual de reajuste (ex: 2% ao ano)

### 🎨 Página Customizada do Cliente (Portal)

#### **Funcionalidades Especiais**
- **Histórico Completo de OS**: Todas as OS relacionadas (07, 08, etc.)
- **Jornada detalhada**: Datas de abertura, visita, envio de documento, responsável
- **Relatórios mensais**: Área para inserir plano de manutenção mensal
- **Documentos especiais**: Projetos, AVCB, RT (Responsabilidade Técnica)

#### **Recursos de Atendimento**
- **Link direto para OS-08**: Botão para abrir chamada de vistoria
- **WhatsApp integrado**: Contato direto com Minerva
- **Dashboard personalizado**: Visão específica do cliente

### 💰 Contabilidade
- **Lucro mensal acumulativo**: Diferente do lucro global de Obras
- **Recorrência mensal**: Receita e custos mensais
- **Projeção anual**: Possibilidade de reajuste automático

### 📁 Arquivos no Sistema (Reestruturação Planejada)
```
src/components/os/assessoria/os-12/
├── pages/
│   └── os12-workflow-page.tsx
└── steps/
    ├── index.ts
    ├── step-cadastro-cliente-portal.tsx    # NOVO - similar OS-13 Etapa 1
    ├── step-anexar-art.tsx                 # NOVO - similar OS-13 Etapa 2
    ├── step-plano-manutencao.tsx           # NOVO
    ├── step-agendar-visita.tsx             # NOVO
    ├── step-realizar-visita.tsx            # NOVO
    ├── step-agendar-visita-recorrente.tsx  # NOVO
    ├── step-realizar-visita-recorrente.tsx # NOVO
    └── step-concluir-contrato.tsx          # NOVO

supabase/functions/
└── create-client-portal/                   # Edge Function para criação do portal
    └── index.ts

src/routes/_auth/os/criar/
└── assessoria-anual.tsx
```

### 🔗 Integrações Necessárias

| Integração | Descrição | Status |
|------------|-----------|--------|
| **Supabase Functions** | `create-client-portal` para criar usuário no portal | ❌ Pendente |
| **E-mail (Resend)** | Envio automático de credenciais ao cliente | ❌ Pendente |
| **Calendário** | Integração com agendamento de visitas | ⚠️ Parcial |
| **Portal do Cliente** | Área externa para acesso do cliente | ❌ Pendente |

---

## 🏗️ OS-13: START DE CONTRATO DE OBRA (OBRAS)

### 📋 Informações Gerais
- **Setor**: Obras
- **Responsável**: Coordenador de Obras / Engenharia
- **Workflow**: 17 etapas completas implementadas
- **Gatilho**: Criada automaticamente após conclusão de OS 01-04 (Etapa 15)
- **% Concluída**: 95% ✅

### 📝 Passo-a-Passo das Etapas

| # | Etapa | Status | Componente | Responsável |
|----|-------|--------|------------|-------------|
| 1 | Dados do Cliente | ✅ | `CadastrarClienteObra` | Administrativo |
| 2 | Anexar ART | ✅ | `StepAnexarART` | Obras |
| 3 | Relatório Fotográfico | ✅ | `StepRelatorioFotografico` | Obras |
| 4 | Imagem de Áreas | ✅ | `StepImagemAreas` | Obras |
| 5 | Cronograma | ✅ | `StepCronogramaObra` | Obras |
| 6 | Agendar Visita Inicial | ✅ | `StepAgendarVisitaInicial` | Administrativo |
| 7 | Realizar Visita Inicial | ✅ | `StepRealizarVisitaInicial` | Administrativo |
| 8 | Histograma | ✅ | `StepHistograma` | Obras |
| 9 | Placa de Obra | ✅ | `StepPlacaObra` | Obras |
| 10 | Requisição de Compras | ✅ | `StepRequisicaoCompras` → OS-09 | Obras |
| 11 | Requisição de Mão de Obra | ✅ | `StepRequisicaoMaoObra` → OS-10 | Obras |
| 12 | Evidência Mobilização | ✅ | `StepEvidenciaMobilizacao` | Obras |
| 13 | Diário de Obra | ✅ | `StepDiarioObra` | Obras |
| 14 | Seguro de Obras | ✅ | `StepSeguroObras` | Administrativo |
| 15 | Documentos SST | ✅ | `StepDocumentosSST` | Obras |
| 16 | Agendar Visita Final | ✅ | `StepAgendarVisitaFinal` | Administrativo |
| 17 | Realizar Visita Final | ✅ | `StepRealizarVisitaFinal` | Obras |

### ⚙️ Integrações Automáticas
- **Etapa 10**: Cria automaticamente **OS-09** (Requisição de Compras)
- **Etapa 11**: Cria automaticamente **OS-10** (Requisição de Mão de Obra)

### 📁 Arquivos no Sistema
```
src/components/os/obras/os-13/
├── pages/
│   └── os13-workflow-page.tsx           # Página principal
└── steps/
    ├── index.ts                          # Exports centralizados
    ├── cadastrar-cliente-obra.tsx        # Etapa 1
    ├── step-anexar-art.tsx               # Etapa 2
    ├── step-relatorio-fotografico.tsx    # Etapa 3
    ├── step-imagem-areas.tsx             # Etapa 4
    ├── step-cronograma-obra.tsx          # Etapa 5
    ├── step-agendar-visita-inicial.tsx   # Etapa 6
    ├── step-realizar-visita-inicial.tsx  # Etapa 7
    ├── step-histograma.tsx               # Etapa 8
    ├── step-placa-obra.tsx               # Etapa 9
    ├── step-requisicao-compras.tsx       # Etapa 10
    ├── step-requisicao-mao-obra.tsx      # Etapa 11
    ├── step-evidencia-mobilizacao.tsx    # Etapa 12
    ├── step-diario-obra.tsx              # Etapa 13
    ├── step-seguro-obras.tsx             # Etapa 14
    ├── step-documentos-sst.tsx           # Etapa 15
    ├── step-agendar-visita-final.tsx     # Etapa 16
    └── step-realizar-visita-final.tsx    # Etapa 17
```

---

## 📄 SISTEMA DE GERAÇÃO DE PDFs

### 🎯 Edge Function `generate-pdf` (Supabase)

O sistema utiliza uma **Edge Function dedicada** no Supabase chamada `generate-pdf` para gerar documentos automaticamente. Cada tipo de documento possui seu **template próprio** otimizado para o conteúdo específico.

#### **Arquitetura da Geração**
```
Frontend → API Call → Edge Function `generate-pdf`
                      ↓
               Templates Específicos
                      ↓
               PDF Gerado → Cliente
```

#### **Templates Disponíveis**
- **`laudo-tecnico`**: Para OS-11 (Laudo Pontual Assessoria)
- **`proposta-comercial`**: Para propostas de OS-01 a OS-04
- **`contrato`**: Para contratos de OS-13 e OS-12
- **`relatorio-visita`**: Para relatórios de vistorias

#### **Como Funciona**
1. **Dados coletados** nas etapas do workflow
2. **API call** para `generate-pdf` com tipo de template
3. **Edge Function** processa dados + template
4. **PDF gerado** automaticamente e enviado ao cliente

#### **Integração Automática**
- **OS-11**: Geração automática do Laudo Técnico ✅ (implementar)
- **OS-09**: Propostas comerciais ⚠️ (template `proposta-comercial`)
- **OS-13**: Contratos de obra ⚠️ (template `contrato`)
- **OS-12**: Relatórios mensais 📅 (template `relatorio-mensal` - futuro)

#### **Templates Futuros Planejados**
- **`relatorio-mensal`**: Relatórios mensais para OS-12
- **`orcamento`**: Orçamentos detalhados
- **`recibo`**: Recibos de pagamento
- **`comprovante`**: Comprovantes de serviço

---

## 🆕 FUNCIONALIDADES v2.5 (REDESIGN 2025)

### Sistema de Comentários
- **Integração**: Disponível em todas as OS existentes
- **Funcionalidade**: Comentários internos e externos por etapa
- **Arquivos**: `os_comentarios` table + componentes de UI
- **Status**: ✅ Implementado no backend

### Timeline de Atividades
- **Integração**: Timeline automática em todas as OS
- **Funcionalidade**: Rastreamento completo de todas as ações
- **Arquivos**: `os_atividades` table + timeline component
- **Status**: ✅ Implementado no backend

### Gestão Inteligente de Documentos
- **Integração**: Upload seguro em todas as etapas das OS
- **Funcionalidade**: Versionamento, organização por tipo MIME
- **Arquivos**: `os_documentos` table + file upload components
- **Status**: ✅ Implementado no backend

### Controle de Presença Eletrônico
- **Integração**: Sistema independente para colaboradores
- **Funcionalidade**: Registro entrada/saída, avaliação de performance
- **Arquivos**: `registros_presenca` table + presence components
- **Status**: ✅ Implementado no backend

### Portal de Documentos para Clientes
- **Integração**: Área segura externa ao sistema principal
- **Funcionalidade**: Acesso a documentos compartilhados
- **Arquivos**: `clientes_documentos` table + client portal
- **Status**: ✅ Implementado no backend

### Expansão do Schema de Colaboradores
- **Novos Campos**: Contratação, salários, contatos de emergência
- **Integração**: Campos expandidos na tabela `colaboradores`
- **Funcionalidade**: Gestão completa de RH integrada
- **Status**: ✅ Implementado

---

## 📊 RESUMO GERAL

### 🎯 Status por Setor

| Setor | OS Implementadas | Total OS | % Concluído |
|-------|------------------|----------|-------------|
| **Obras** | 5/5 | 5 | 85% |
| **Assessoria** | 5/5 | 5 | 90% |
| **Financeiro** | 1/1 | 1 | 90% |
| **RH** | 1/1 | 1 | 90% |
| **TOTAL** | 12/12 | 12 | ~90% |

### 📋 Detalhes das OS Implementadas (Atualizado 01/12/2025)

#### **OS-10: Requisição de Mão de Obra (RH)** ✅ IMPLEMENTADA
- **Status**: Workflow completo implementado
- **Etapas**: 5 (Abertura → Seleção CC → Seleção Tipo → Detalhes → Múltipla)
- **Funcionalidades**:
  - Lista de 10 funções disponíveis
  - Colaborador obra sem acesso ao sistema
  - Requisição múltipla de colaboradores
  - Interface mockada (pendente integração Supabase)

#### **OS-11: Laudo Pontual Assessoria** ✅ IMPLEMENTADA
- **Status**: Workflow completo implementado
- **Etapas**: 6 (Cadastro → Agendamento → Visita → RT → PDF → Envio)
- **Funcionalidades**:
  - Geração de PDF (mockado, usar Edge Function generate-pdf)
  - Envio automático ao cliente (mockado)
  - Interface mockada (pendente integração Supabase)

#### **OS-12: Start de Contrato - Assessoria Anual** 🔄 EM REESTRUTURAÇÃO
- **Status**: Workflow sendo reestruturado
- **Etapas**: 8 (Cadastro+Portal → ART → Plano Manutenção → Agendar → Visita → Agendar Recorrente → Visita Recorrente → Contrato)
- **Funcionalidades Planejadas**:
  - Portal do cliente com criação automática via Supabase Functions
  - Envio de e-mail com credenciais (Login, Senha, Link)
  - Fluxo de handoff entre Coord. Administrativo e Coord. Assessoria
  - Similar às Etapas 1 e 2 da OS-13

### 📈 Métricas de Implementação

- **OS Completamente Implementadas**: 7 (OS-01, OS-07, OS-08, OS-09, OS-10, OS-11, OS-12)
- **OS Parcialmente Implementadas**: 5 (OS-02, OS-03, OS-04, OS-05, OS-06, OS-13)
- **OS Pendentes**: 0
- **Etapas Mockadas**: ~60% das etapas totais
- **Arquitetura Compartilhada**: ✅ Implementada (reutilização de componentes)

### 🎯 Próximas Prioridades

1. **Substituir dados mockados** nas etapas existentes com integração Supabase
2. **Implementar Edge Function** `generate-pdf` para OS-11
3. **Criar página customizada do cliente** para OS-12
4. **Implementar alertas automáticos** para visitas não realizadas
5. **Testes de integração** para todos os workflows

---

**Data da Análise**: 11/12/2025
**Última Atualização**: 11/12/2025 - Documentação sincronizada com v2.7 (Transferência Automática de Setor)
**Status**: Todos os workflows implementados + funcionalidades v2.7 - OS-12 em reestruturação
**Próxima Revisão**: Após implementação completa da OS-12 reestruturada