# 📋 Documentação Técnica: OS-10, OS-11, OS-12 e OS-13

**Última Atualização:** 2026-01-04  
**Versão:** v2.7  
**Status Implementação:** 90-95% ✅

---

## 📌 Visão Geral

Este documento cobre as Ordens de Serviço internas e de execução:

| Código | Nome | Setor | Etapas | Aprovações 🔒 |
|--------|------|-------|:------:|:-------------:|
| **OS-10** | Requisição de Mão de Obra | RH | 4 | Etapa 2 |
| **OS-11** | Laudo Pontual Assessoria | Assessoria | 6 | Etapa 5 |
| **OS-12** | Assessoria Anual (Contrato) | Assessoria | 8 | Etapa 3 |
| **OS-13** | Start de Contrato de Obra | Obras | 17 | Etapas 3,5,8,12,15 |

---

# 👥 OS-10: Requisição de Mão de Obra

## 📋 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Setor** | RH (Recursos Humanos) |
| **Responsável Inicial** | Solicitante |
| **Tipo** | OS interna (recrutamento) |
| **Workflow** | 4 etapas |
| **Gatilho** | Manual ou via OS-13 (Etapa 11) |
| **Implementação** | 95% ✅ |

## 🎯 Objetivo

Formalizar a necessidade de contratação de novos colaboradores com gerenciamento de **múltiplas vagas**.

## 🔄 Fluxo de 4 Etapas

| # | Etapa | Responsável | Componente | Aprovação |
|:-:|-------|-------------|------------|:---------:|
| **1** | Abertura da Solicitação | Solicitante | `step-abertura-solicitacao.tsx` | ❌ |
| **2** | Seleção do Centro de Custo | Administrativo | `step-selecao-centro-custo.tsx` | ✅🔒 |
| **3** | Gerenciador de Vagas | Administrativo | `step-gerenciador-vagas.tsx` | ❌ |
| **4** | Revisão e Envio | Administrativo | `step-revisao-envio.tsx` | ❌ |

## 🏗 Arquitetura

```
src/components/os/administrativo/os-10/
├── pages/
│   └── os10-workflow-page.tsx
├── components/
│   ├── modal-adicionar-vaga.tsx     # Modal de nova vaga
│   └── vaga-card.tsx                # Card visual da vaga
└── steps/
    ├── step-abertura-solicitacao.tsx
    ├── step-selecao-centro-custo.tsx
    ├── step-gerenciador-vagas.tsx
    └── step-revisao-envio.tsx

src/routes/_auth/os/criar/
└── requisicao-mao-de-obra.tsx
```

## 💾 Estrutura de Dados

### Etapa 1: Abertura da Solicitação

> [!IMPORTANT]
> Os campos `solicitante` e `departamento` são **preenchidos automaticamente** com os dados do usuário logado e **não podem ser alterados**.

```typescript
interface AberturaData {
  dataAbertura?: string;      // Automático (data atual)
  solicitante?: string;       // Auto-preenchido (currentUser.nome_completo) - READ ONLY
  solicitanteId?: string;     // Auto-preenchido (currentUser.id) - READ ONLY
  departamento?: string;      // Auto-preenchido (currentUser.setor_slug) - READ ONLY
  urgencia?: 'baixa' | 'normal' | 'alta' | 'urgente';
  justificativa?: string;     // Obrigatório
}
```

**Fluxo de Criação da OS:**
1. Etapa 1 → Coleta dados sem criar OS (dados em memória)
2. Etapa 2 → Ao selecionar Centro de Custo e avançar, a OS é criada
3. Dados da Etapa 1 e 2 são salvos após criação da OS

### Etapa 3: Gerenciador de Vagas

```typescript
interface Vaga {
  id: string;
  cargo: string;
  funcao: string;
  quantidade: number;
  requisitos?: string;
  faixaSalarial?: string;
}

interface GerenciadorVagasData {
  vagas: Vaga[];
  totalVagas?: number;
}
```

**Funcionalidades:**
- Adicionar múltiplas vagas na mesma solicitação
- Modal de adicionar vaga individual
- Cards visuais para cada vaga


---

# 🔧 OS-11: Laudo Pontual Assessoria

## 📋 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Setor** | Assessoria |
| **Responsável** | Gestor de Assessoria |
| **Tipo** | Laudo pontual (não recorrente) |
| **Workflow** | 6 etapas |
| **Gatilho** | Gerado após OS-06 |
| **Implementação** | 90% ✅ |

## 🎯 Objetivo

Executar contrato de assessoria limitada focado na entrega de **documento técnico pontual**.

## 🔄 Fluxo de 6 Etapas

| # | Etapa | Responsável | Componente | Aprovação |
|:-:|-------|-------------|------------|:---------:|
| **1** | Cadastrar Cliente | Assessoria | `CadastrarLead` | ❌ |
| **2** | Agendar Visita | Assessoria | `StepAgendarVisita` | ❌ |
| **3** | Realizar Visita | Técnico | `StepRealizarVisita` | ❌ |
| **4** | Anexar RT | Técnico | `StepAnexarRT` | ❌ |
| **5** | Gerar Documento | Sistema | `StepGerarDocumento` | ✅🔒 |
| **6** | Enviar ao Cliente | Sistema | `StepEnviarCliente` | ❌ |

## 🏗 Arquitetura

```
src/components/os/assessoria/os-11/
├── pages/
│   └── os11-workflow-page.tsx
└── steps/
    ├── step-cadastro-cliente.tsx
    ├── step-agendar-visita.tsx
    ├── step-realizar-visita.tsx
    ├── step-anexar-rt.tsx
    ├── step-gerar-documento.tsx
    └── step-enviar-cliente.tsx

src/routes/_auth/os/criar/
└── laudo-pontual.tsx
```

## ⚙️ Regras de Negócio

### Geração Automática de PDF
```typescript
// Edge Function para geração de laudo
await generatePdf('laudo-tecnico', {
  clienteNome: os.cliente?.nome,
  dadosVistoria: etapa3Data,
  rt: etapa4Data.arquivoRT,
  dataGeracao: new Date().toISOString()
});
```

### Etapa 5 com Aprovação 🔒
- Documento gerado requer aprovação antes de envio
- Aprovador: Coordenador de Assessoria

---

# 🔧 OS-12: Assessoria Anual (Contrato)

## 📋 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Setor** | Assessoria |
| **Responsável Inicial** | Coord. Administrativo |
| **Tipo** | Assessoria recorrente (anual) |
| **Workflow** | 8 etapas |
| **Implementação** | 95% ✅ |

## 🎯 Objetivo

Gerenciar contratos de assessoria de **longo prazo** com visitas recorrentes.

## 🔄 Fluxo de 8 Etapas

| # | Etapa | Responsável | Componente | Aprovação |
|:-:|-------|-------------|------------|:---------:|
| **1** | Cadastro Cliente + Portal | Administrativo | `StepCadastroClientePortal` | ❌ |
| **2** | Upload de ART | Assessoria | `StepAnexarART` | ❌ |
| **3** | Plano de Manutenção | Assessoria | `StepPlanoManutencao` | ✅🔒 |
| **4** | Agendar Visita | Administrativo | `StepAgendarVisita` | ❌ |
| **5** | Realizar Visita | Administrativo | `StepRealizarVisita` | ❌ |
| **6** | Agendar Visita Recorrente | Administrativo | `StepAgendarVisitaRec` | ❌ |
| **7** | Realizar Visita Recorrente | Assessoria | `StepRealizarVisitaRec` | ❌ |
| **8** | Concluir Contrato | Assessoria | `StepConcluirContrato` | ❌ |

## 🏗 Arquitetura

```
src/components/os/assessoria/os-12/
├── pages/
│   └── os12-workflow-page.tsx
└── steps/
    ├── step-cadastro-cliente-portal.tsx
    ├── step-anexar-art.tsx
    ├── step-plano-manutencao.tsx
    ├── step-agendar-visita.tsx
    ├── step-realizar-visita.tsx
    ├── step-agendar-visita-recorrente.tsx
    ├── step-realizar-visita-recorrente.tsx
    └── step-concluir-contrato.tsx
```

## 🔀 Handoffs

```
COORD. ADMIN         COORD. ASSESSORIA
┌──────────┐         ┌─────────────────┐
│ 1. Cad.  │ ───────►│ 2. ART          │
└──────────┘         │ 3. Plano 🔒     │
                     └────────┬────────┘
                              │
┌──────────┐◄────────────────┘
│ 4-6. Vis │
└────┬─────┘
     │         ┌─────────────────┐
     └────────►│ 7-8. Recorrente │
               └─────────────────┘
```

---

# 🏗️ OS-13: Start de Contrato de Obra

## 📋 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Setor** | Obras |
| **Responsável** | Coordenador de Obras |
| **Tipo** | Gestão de contrato de obra |
| **Workflow** | 17 etapas |
| **Gatilho** | Criada via OS-01-04 (Etapa 15) |
| **Implementação** | 95% ✅ |

## 🎯 Objetivo

Gerenciamento completo da execução de uma obra, desde documentação inicial até visita final.

## 🔄 Fluxo de 17 Etapas

| # | Etapa | Responsável | Aprovação |
|:-:|-------|-------------|:---------:|
| **1** | Dados do Cliente | Administrativo | ❌ |
| **2** | Anexar ART | Obras | ❌ |
| **3** | Relatório Fotográfico | Obras | ✅🔒 |
| **4** | Imagem de Áreas | Obras | ❌ |
| **5** | Cronograma | Obras | ✅🔒 |
| **6** | Agendar Visita Inicial | Administrativo | ❌ |
| **7** | Realizar Visita Inicial | Administrativo | ❌ |
| **8** | Histograma | Obras | ✅🔒 |
| **9** | Placa de Obra | Obras | ❌ |
| **10** | Requisição de Compras | Obras → OS-09 | ❌ |
| **11** | Requisição de Mão de Obra | Obras → OS-10 | ❌ |
| **12** | Evidência Mobilização | Obras | ✅🔒 |
| **13** | Diário de Obra | Obras | ❌ |
| **14** | Seguro de Obras | Administrativo | ❌ |
| **15** | Documentos SST | Obras | ✅🔒 |
| **16** | Agendar Visita Final | Administrativo | ❌ |
| **17** | Realizar Visita Final | Obras | ❌ |

## 🏗 Arquitetura

```
src/components/os/obras/os-13/
├── pages/
│   └── os13-workflow-page.tsx
└── steps/
    ├── cadastrar-cliente-obra.tsx      # Etapa 1
    ├── step-anexar-art.tsx             # Etapa 2
    ├── step-relatorio-fotografico.tsx  # Etapa 3 🔒
    ├── step-imagem-areas.tsx           # Etapa 4
    ├── step-cronograma-obra.tsx        # Etapa 5 🔒
    ├── step-agendar-visita-inicial.tsx # Etapa 6
    ├── step-realizar-visita-inicial.tsx# Etapa 7
    ├── step-histograma.tsx             # Etapa 8 🔒
    ├── step-placa-obra.tsx             # Etapa 9
    ├── step-requisicao-compras.tsx     # Etapa 10
    ├── step-requisicao-mao-obra.tsx    # Etapa 11
    ├── step-evidencia-mobilizacao.tsx  # Etapa 12 🔒
    ├── step-diario-obra.tsx            # Etapa 13
    ├── step-seguro-obras.tsx           # Etapa 14
    ├── step-documentos-sst.tsx         # Etapa 15 🔒
    ├── step-agendar-visita-final.tsx   # Etapa 16
    └── step-realizar-visita-final.tsx  # Etapa 17
```

## 🔗 Integrações Automáticas

### Etapa 10: Cria OS-09
```typescript
// Ao salvar Requisição de Compras
await createOS({
  tipoOSCodigo: 'OS-09',
  parentOSId: os13Id,
  clienteId: os13.cliente_id,
  descricao: 'Requisição de Materiais - via OS-13'
});
```

### Etapa 11: Cria OS-10
```typescript
// Ao salvar Requisição de Mão de Obra
await createOS({
  tipoOSCodigo: 'OS-10',
  parentOSId: os13Id,
  clienteId: os13.cliente_id,
  descricao: 'Requisição de Contratação - via OS-13'
});
```

---

## 📊 Resumo de Aprovações

| OS | Etapas com Aprovação 🔒 | Aprovador |
|----|-------------------------|-----------|
| **OS-10** | Etapa 2 (Centro de Custo) | Coord. Administrativo |
| **OS-11** | Etapa 5 (Gerar Documento) | Coord. Assessoria |
| **OS-12** | Etapa 3 (Plano Manutenção) | Coord. Assessoria |
| **OS-13** | Etapas 3, 5, 8, 12, 15 | Coord. Obras |

---

## 📚 Referências

- [TODAS_OS_E_ETAPAS.md](../sistema/TODAS_OS_E_ETAPAS.md)
- [OS_01_04_TECHNICAL_DOCUMENTATION.md](./OS_01_04_TECHNICAL_DOCUMENTATION.md)
- [OS_05_06_TECHNICAL_DOCUMENTATION.md](./OS_05_06_TECHNICAL_DOCUMENTATION.md)
- [OS_07_08_09_TECHNICAL_DOCUMENTATION.md](./OS_07_08_09_TECHNICAL_DOCUMENTATION.md)

---

**Última Revisão:** 2026-01-04  
**Autor:** Sistema Minerva ERP  
**Versão:** 1.0.0
