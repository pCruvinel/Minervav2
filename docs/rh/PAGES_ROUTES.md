# 📄 Páginas e Rotas - Módulo RH

> **Última Atualização:** 28/01/2026  
> **Roteamento:** TanStack Router (File-based)

---

## 🗺️ Mapa de Rotas

```
/colaboradores/
├── index.tsx              → ColaboradoresListaPage
├── $colaboradorId.tsx     → ColaboradorDetalhesPage
├── presenca.tsx           → ControlePresencaPage (calendário)
├── presenca-tabela.tsx    → ControlePresencaTabelaPage ⭐
├── presenca-tabela.$data.tsx → PresencaDetalhesPage
├── presenca-historico.tsx → PresencaHistoricoPage
└── recrutamento.tsx       → RecrutamentoPage

/os/criar/
└── requisicao-mao-de-obra.tsx → OS10WorkflowPage
```

---

## 📋 Lista de Colaboradores

**Rota:** `/colaboradores`  
**Arquivo:** `src/routes/_auth/colaboradores/index.tsx`  
**Componente:** `ColaboradoresListaPage` (14.889 bytes)

### Funcionalidades

| Feature | Descrição |
|---------|-----------|
| Cards de KPIs | Total ativos, inativos, custo-dia médio |
| Tabela paginada | Nome, cargo, setor, status |
| Filtros | Busca por nome/CPF/email, filtro por setor/status |
| Ações | Convidar colaborador, navegar para detalhes |

### Navegação

```typescript
import { Link } from '@tanstack/react-router';

// Para detalhes
<Link to="/colaboradores/$colaboradorId" params={{ colaboradorId: id }}>
  Ver Detalhes
</Link>

// Para presença
<Link to="/colaboradores/presenca-tabela">
  Controle de Presença
</Link>
```

---

## 👤 Detalhes do Colaborador

**Rota:** `/colaboradores/:colaboradorId`  
**Arquivo:** `src/routes/_auth/colaboradores/$colaboradorId.tsx`  
**Componente:** `ColaboradorDetalhesPage` (54.380 bytes)

### Tabs

| Tab | Conteúdo |
|-----|----------|
| **Visão Geral** | Dados pessoais, contato, profissionais, contratuais, bancários |
| **Financeiro & Presença** | KPIs (6 meses), gráfico de custos, histórico |
| **Documentos** | Upload, download, exclusão (26 tipos) |

### Ações do Header

| Ação | Condição | Função |
|------|----------|--------|
| Reenviar Convite | status_convite = 'pendente' | Dispara email |
| Editar Cadastro | Sempre | Abre modal de edição |
| Ativar/Desativar | Sempre | Toggle status |

### Navegação

```typescript
const { colaboradorId } = useParams({ from: '/_auth/colaboradores/$colaboradorId' });
```

---

## 📊 Controle de Presença (Tabela)

**Rota:** `/colaboradores/presenca-tabela`  
**Arquivo:** `src/routes/_auth/colaboradores/presenca-tabela.tsx`  
**Componente:** `ControlePresencaTabelaPage` (70.230 bytes)

### Funcionalidades

| Feature | Descrição |
|---------|-----------|
| Seletor de Data | Popover com calendário |
| KPIs | Total, presentes, ausentes, atrasados |
| Tabela Editável | Status, performance, CCs, justificativa |
| Bulk Actions | Marcar OK/Falta em massa, atribuir CC/Performance |
| Modal Justificativa | Campo de texto + upload de anexo |
| Modal Rateio CC | Distribuição percentual entre CCs |
| Confirmação | Confirma registros do dia (auditoria) |

### Estados

```typescript
const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
const [registros, setRegistros] = useState<Record<string, RegistroPresenca>>({});
const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
const [modalJustificativaOpen, setModalJustificativaOpen] = useState(false);
```

### Navegação para Detalhes

```typescript
<Link 
  to="/colaboradores/presenca-tabela/$data" 
  params={{ data: format(dataSelecionada, 'yyyy-MM-dd') }}
>
  Ver Detalhes do Dia
</Link>
```

---

## 📅 Detalhes do Dia (Presença)

**Rota:** `/colaboradores/presenca-tabela/:data`  
**Arquivo:** `src/routes/_auth/colaboradores/presenca-tabela.$data.tsx`  
**Componente:** `PresencaDetalhesPage` (35.768 bytes)

### Tabs

| Tab | Conteúdo |
|-----|----------|
| **Registros** | Tabela completa com filtros por status/setor |
| **Custos por CC** | Gráfico de barras + tabela de custos |
| **Auditoria** | Timeline de alterações e confirmações |

### KPIs

| Card | Descrição |
|------|-----------|
| Total | Total de colaboradores |
| Presentes | Status != FALTA |
| Faltas | Status == FALTA |
| Atrasos | Status == ATRASADO |
| Custo Total | Soma de custos do dia |

### Navegação

```typescript
const { data } = useParams({ from: '/_auth/colaboradores/presenca-tabela/$data' });
// data = '2026-01-28'
```

---

## 📈 Histórico de Presenças

**Rota:** `/colaboradores/presenca-historico`  
**Arquivo:** `src/routes/_auth/colaboradores/presenca-historico.tsx`  
**Componente:** `PresencaHistoricoPage` (28.930 bytes)

### Filtros

| Filtro | Tipo | Descrição |
|--------|------|-----------|
| Período | DateRange | Data início/fim |
| Setor | Select | Filtrar por departamento |
| Colaborador | Select | Filtrar por pessoa |
| Status | Select | Perfeito, Com Faltas, Com Atrasos |
| Busca | Input | Nome do colaborador |

### KPIs (7 cards)

Total colaboradores, presenças, faltas, atrasos, minutos de atraso, taxa de presença, custo total

### Ações

| Ação | Descrição |
|------|-----------|
| Exportar Excel | Gera CSV com todos os dados |
| Ver Detalhes | Navega para registro específico |

---

## 📋 Controle de Presença (Calendário)

**Rota:** `/colaboradores/presenca`  
**Arquivo:** `src/routes/_auth/colaboradores/presenca.tsx`  
**Componente:** `ControlePresencaPage` (37.205 bytes)

> Interface alternativa com visualização por calendário mensal.

---

## 📋 Recrutamento (Kanban)

**Rota:** `/colaboradores/recrutamento`  
**Arquivo:** `src/routes/_auth/colaboradores/recrutamento.tsx`  
**Componente:** `RecrutamentoPage` (5.192 bytes)

### Colunas do Kanban

| Coluna | Status | Descrição |
|--------|--------|-----------|
| 🕐 Pendente Aprovação | `pendente_aprovacao` | OS-10 em triagem |
| 📢 Em Divulgação | `em_divulgacao` | Vagas publicadas |
| 👥 Entrevistas | `entrevistas` | Candidatos em seleção |
| ✅ Finalizado | `finalizado` | Vagas preenchidas |

### Componentes do Kanban

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| `RecrutamentoKanban` | recrutamento-kanban.tsx | Layout das colunas |
| `RequisicaoCard` | requisicao-card.tsx | Card de cada requisição |
| `ModalDetalhesRequisicao` | modal-detalhes-requisicao.tsx | Detalhes + vagas |

---

## 🔧 OS-10: Requisição de Mão de Obra

**Rota:** `/os/criar/requisicao-mao-de-obra`  
**Arquivo:** `src/routes/_auth/os/criar/requisicao-mao-de-obra.tsx`  
**Componente:** `OS10WorkflowPage`

### Workflow Steps

| Step | Componente | Descrição |
|------|------------|-----------|
| 1 | `StepSelecaoCentroCusto` | Seleciona Centro de Custo |
| 2 | `StepAberturaSolicitacao` | Dados da solicitação |
| 3 | `StepGerenciadorVagas` | Adiciona/edita vagas |
| 4 | `StepRevisaoEnvio` | Revisão final e envio |

### Navegação

```typescript
import { useNavigate } from '@tanstack/react-router';

const navigate = useNavigate();

// Navegar para workflow
navigate({ to: '/os/criar/requisicao-mao-de-obra' });

// Com OS existente
navigate({ 
  to: '/os/criar/requisicao-mao-de-obra',
  search: { osId: 'uuid' }
});
```

---

## 🔗 Diagrama de Navegação

```
                    ┌─────────────────────────┐
                    │   /colaboradores        │
                    │   (Lista Principal)     │
                    └──────────┬──────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ /$colaboradorId│    │/presenca-tabela │    │  /recrutamento  │
│  (Detalhes)   │    │    (Tabela)     │    │    (Kanban)     │
└───────────────┘    └────────┬────────┘    └─────────────────┘
                              │
               ┌──────────────┼──────────────┐
               │              │              │
               ▼              ▼              ▼
        ┌────────────┐ ┌─────────────┐ ┌────────────────┐
        │/$data      │ │/presenca-   │ │ /os/criar/     │
        │(Detalhes   │ │ historico   │ │ requisicao-    │
        │ do Dia)    │ │             │ │ mao-de-obra    │
        └────────────┘ └─────────────┘ └────────────────┘
```

---

*Documentação gerada em 28/01/2026.*
