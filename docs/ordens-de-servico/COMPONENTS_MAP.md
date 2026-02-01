# 🗂️ Components Map - Módulo de OS

> **Última Atualização:** 2026-01-25

## Estrutura de Diretórios

```
src/components/os/
├── shared/                          # 67 arquivos - Componentes reutilizáveis
│   ├── components/
│   │   ├── workflow-stepper.tsx     # Stepper visual horizontal
│   │   ├── workflow-accordion.tsx   # Accordion de etapas
│   │   ├── workflow-footer.tsx      # Footer com botões Voltar/Avançar
│   │   ├── workflow-step-summary.tsx # Resumo read-only de etapa
│   │   ├── feedback-transferencia.tsx # Modal pós-handoff
│   │   ├── aprovacao-modal.tsx      # Modal de aprovação
│   │   ├── field-with-adendos.tsx   # Campo com suporte a adendos
│   │   └── step-readonly-with-adendos.tsx # Wrapper read-only
│   └── steps/                       # Steps compartilhados entre OS
│       ├── cadastrar-lead.tsx
│       ├── step-followup-1.tsx
│       ├── step-agendar-apresentacao.tsx
│       ├── step-preparar-orcamentos.tsx
│       ├── step-memorial-escopo.tsx
│       ├── step-precificacao.tsx
│       ├── step-gerar-proposta.tsx
│       ├── step-realizar-apresentacao.tsx
│       ├── step-analise-relatorio.tsx
│       ├── step-gerar-contrato.tsx
│       └── step-contrato-assinado.tsx
│
├── obras/                           # 25 arquivos - OS de Obras
│   ├── os-1-4/
│   │   └── pages/
│   │       └── os-1-4-workflow-page.tsx
│   └── os-13/
│       ├── pages/
│       │   └── os13-workflow-page.tsx
│       └── steps/
│           ├── cadastrar-cliente-obra.tsx
│           ├── step-anexar-art.tsx
│           ├── step-relatorio-fotografico.tsx
│           ├── step-imagem-areas.tsx
│           ├── step-cronograma-obra.tsx
│           ├── step-agendar-visita-inicial.tsx
│           ├── step-realizar-visita-inicial.tsx
│           ├── step-histograma.tsx
│           ├── step-placa-obra.tsx
│           ├── step-requisicao-compras.tsx
│           ├── step-requisicao-mao-obra.tsx
│           ├── step-evidencia-mobilizacao.tsx
│           ├── step-diario-obra.tsx
│           ├── step-seguro-obras.tsx
│           ├── step-documentos-sst.tsx
│           ├── step-agendar-visita-final.tsx
│           └── step-realizar-visita-final.tsx
│
├── assessoria/                      # 45 arquivos - OS de Assessoria
│   ├── os-5-6/
│   │   ├── pages/
│   │   │   └── os-5-6-workflow-page.tsx
│   │   └── steps/
│   │       ├── step-selecao-tipo-assessoria.tsx
│   │       └── step-ativar-contrato-assessoria.tsx
│   ├── os-7/
│   │   ├── pages/
│   │   │   ├── os07-workflow-page.tsx
│   │   │   └── os07-analise-page.tsx
│   │   └── components/
│   │       └── os07-form-publico.tsx
│   ├── os-8/
│   │   ├── pages/
│   │   │   └── os08-workflow-page.tsx
│   │   ├── components/
│   │   │   └── checklist-recebimento.tsx
│   │   └── steps/
│   │       ├── step-detalhes-solicitacao.tsx
│   │       ├── step-agendar-visita.tsx
│   │       ├── step-realizar-visita.tsx
│   │       ├── step-formulario-pos-visita.tsx
│   │       ├── step-gerar-documento.tsx
│   │       └── step-enviar-documento.tsx
│   ├── os-11/
│   │   ├── pages/
│   │   │   └── os11-workflow-page.tsx
│   │   └── steps/
│   │       └── ... (6 steps)
│   └── os-12/
│       ├── pages/
│       │   └── os12-workflow-page.tsx
│       └── steps/
│           └── ... (8 steps)
│
├── administrativo/                  # 15 arquivos - OS Administrativas
│   ├── os-9/
│   │   ├── pages/
│   │   │   └── os09-workflow-page.tsx
│   │   ├── components/
│   │   │   └── requisition-item-card.tsx
│   │   └── steps/
│   │       ├── step-requisicao-compra.tsx
│   │       └── step-upload-orcamentos.tsx
│   └── os-10/
│       ├── pages/
│       │   └── os10-workflow-page.tsx
│       ├── components/
│       │   ├── modal-adicionar-vaga.tsx
│       │   └── vaga-card.tsx
│       └── steps/
│           ├── step-abertura-solicitacao.tsx
│           ├── step-selecao-centro-custo.tsx
│           ├── step-gerenciador-vagas.tsx
│           └── step-revisao-envio.tsx
│
├── unified/                         # 3 arquivos - Componentes unificados
│   └── ...
│
└── linked-os-detail-modal.tsx       # Modal de OS vinculadas
```

---

## Componentes Principais

### Workflow Pages

| Componente | OS | Linhas |
|------------|-----|:------:|
| `os-1-4-workflow-page.tsx` | OS-01-04 | ~400 |
| `os-5-6-workflow-page.tsx` | OS-05-06 | ~350 |
| `os07-workflow-page.tsx` | OS-07 | ~200 |
| `os08-workflow-page.tsx` | OS-08 | ~555 |
| `os09-workflow-page.tsx` | OS-09 | ~200 |
| `os10-workflow-page.tsx` | OS-10 | ~250 |
| `os11-workflow-page.tsx` | OS-11 | ~200 |
| `os12-workflow-page.tsx` | OS-12 | ~300 |
| `os13-workflow-page.tsx` | OS-13 | ~450 |

### Shared Components

| Componente | Propósito |
|------------|-----------|
| `workflow-stepper.tsx` | Stepper horizontal de navegação |
| `workflow-accordion.tsx` | Accordion com etapas expansíveis |
| `workflow-footer.tsx` | Footer com Voltar/Avançar/Salvar |
| `feedback-transferencia.tsx` | Modal de feedback após handoff |
| `aprovacao-modal.tsx` | Modal para aprovar/reprovar etapa |

---

## Rotas

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/os` | `os/index.tsx` | Lista de OS |
| `/os/$osId` | `os/$osId.tsx` | Detalhes da OS |
| `/os/details-workflow/$id` | `details-workflow.$id.tsx` | Workflow da OS |
| `/os/criar/requisicao-compras` | `criar/requisicao-compras.tsx` | Criar OS-09 |
| `/os/criar/requisicao-mao-de-obra` | `criar/requisicao-mao-de-obra.tsx` | Criar OS-10 |
| `/os/criar/laudo-pontual` | `criar/laudo-pontual.tsx` | Criar OS-11 |
| `/os/criar/assessoria-recorrente` | `criar/assessoria-recorrente.tsx` | Criar OS-12 |
| `/os/criar/start-contrato-obra` | `criar/start-contrato-obra.tsx` | Criar OS-13 |
| `/os/criar/assessoria-lead` | `criar/assessoria-lead.tsx` | Criar OS-05/06 |
