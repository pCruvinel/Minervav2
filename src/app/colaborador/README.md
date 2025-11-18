# FLUXO COLABORADOR - MINERVA ENGENHARIA ERP

## 📋 Visão Geral

Módulo completo para usuários com perfil **Colaborador (Nível 4)**, focado em execução operacional de tarefas, consulta de informações e gestão de leads (para colaboradores comerciais).

---

## 🎯 Funcionalidades Implementadas

### 1. Dashboard Operacional
**Rota:** `/app/colaborador/dashboard/page.tsx`

**Características:**
- 3 KPIs de execução:
  - Minhas OS em Aberto
  - Tarefas para Hoje
  - Prazos Vencidos
- Tabela de Tarefas Prioritárias ordenada por prazo
- Colunas: Código OS, Cliente, Etapa Atual, Prazo, Status, Prioridade, Ação
- Botão de ação rápida "Executar" para cada tarefa
- Links para Minhas OS e Agenda

**Filtros:**
- Automático: apenas OS onde o usuário logado é responsável

---

### 2. Minhas Ordens de Serviço
**Rota:** `/app/colaborador/minhas-os/page.tsx`

**Características:**
- Lista filtrada automaticamente por responsável
- Busca por código, cliente ou endereço
- Filtros por Status e Prioridade
- Visualização de tipo de OS, etapa atual, prazo
- Acesso direto para executar cada OS

**Permissões:**
- ✅ Visualizar OS delegadas
- ✅ Executar tarefas
- ❌ Aprovar/Reprovar
- ❌ Delegar para outros
- ❌ Visualizar dados financeiros

---

### 3. Detalhes da OS (Execução)
**Rota:** `/app/colaborador/minhas-os/[id]/page.tsx`

**Características:**
- Cabeçalho com informações do cliente e endereço
- Formulário específico da etapa atual:
  - Checklist de Vistoria (para etapa VISTORIA)
  - Medições e dados técnicos
  - Observações gerais
  - Upload de evidências fotográficas
- Sidebar com informações da OS (tipo, cliente, responsável, prazo, prioridade)

**Ações:**
- **Salvar Rascunho:** salva sem enviar
- **Submeter para Aprovação:** envia ao gestor e bloqueia edição

**Restrições:**
- Sem acesso a abas financeiras/custos
- Sem botões de aprovação (exclusivo de gestores)

---

### 4. Consulta de Clientes (Read-Only)
**Rota:** `/app/colaborador/clientes/page.tsx`

**Características:**
- Visualização somente leitura de clientes
- Cards com informações essenciais:
  - Nome, CNPJ/CPF
  - Endereço completo e CEP
  - Telefone (clicável para ligação)
  - E-mail (clicável para envio)
  - Tipo (Pessoa Física/Jurídica)
- Busca por nome, endereço, telefone ou e-mail
- Aviso visual de acesso restrito

**Permissões:**
- ✅ Visualizar informações de contato
- ❌ Criar novos clientes
- ❌ Editar informações
- ❌ Excluir registros

---

### 5. Minha Agenda (Calendário Pessoal)
**Rota:** `/app/colaborador/agenda/page.tsx`

**Características:**
- Calendário mensal interativo
- Filtro automático: apenas eventos onde o colaborador está alocado
- Lista de próximos compromissos
- Modal de detalhes com:
  - Data e horário completos
  - Cliente e local
  - Tipo de evento (Vistoria, Reunião, Follow-up)
  - Link direto para a OS relacionada
- Navegação entre meses
- Botão "Hoje" para retornar ao mês atual

**Tipos de Eventos:**
- 🔵 Vistoria
- 🟣 Reunião
- 🟢 Follow-up

**Permissões:**
- ✅ Visualizar agenda pessoal
- ❌ Criar/editar/excluir compromissos (apenas Gestor)

---

### 6. Gestão de Leads (Comercial)
**Rota:** `/app/colaborador/leads/page.tsx`

**Características:**
- **Controle de Acesso:** exclusivo para colaboradores do setor COMERCIAL
- KPIs: Total de Leads, Novos, Em Contato, Qualificados
- Busca por nome, contato ou e-mail
- Filtro por status do lead
- Cards de leads com:
  - Nome da empresa e contato
  - Telefone e e-mail (clicáveis)
  - Status, Potencial, Origem
  - Observações
  - Data de criação

**Funcionalidades:**
- ✅ Criar novo lead
- ✅ Editar leads existentes
- ✅ Classificar por status (Novo, Em Contato, Qualificado, Não Qualificado, Convertido)
- ✅ Definir potencial (Alto, Médio, Baixo)
- ✅ Registrar origem (Site, Telefone, E-mail, Indicação, Redes Sociais)

**Formulário de Lead:**
- Nome da Empresa*
- Nome do Contato*
- Telefone*
- E-mail*
- Origem*
- Status
- Potencial
- Observações

---

## 🎨 Design System

**Cores:**
- Primary: `#D3AF37` (Dourado Minerva)
- Secondary: `#DDC063` (Dourado Claro)
- Texto: Preto (todas as fontes)

**Componentes:**
- shadcn/ui (Card, Button, Badge, Input, Dialog, etc.)
- Lucide React (ícones)
- Sonner (toasts de notificação)

---

## 🔒 Sistema de Permissões

### Perfil Colaborador (role_nivel: 4)

**Acesso Permitido:**
- Dashboard Operacional
- Minhas OS (apenas as delegadas)
- Execução de tarefas
- Consulta de clientes (somente leitura)
- Agenda pessoal
- Leads (se setor = COMERCIAL)

**Acesso Negado:**
- Aprovação/Reprovação de OS
- Delegação de tarefas
- Visualização de dados financeiros
- Edição de clientes
- Gestão de usuários
- Configurações do sistema

---

## 📊 Hierarquia de Fluxos

```
COLABORADOR
├── Dashboard
│   ├── KPIs de execução
│   └── Tarefas prioritárias
│
├── Minhas OS
│   ├── Lista filtrada (responsável = usuário logado)
│   └── Detalhes e execução
│       ├── Formulário da etapa
│       ├── Salvar rascunho
│       └── Submeter para aprovação
│
├── Clientes (Read-Only)
│   └── Consulta de informações
│
├── Agenda
│   ├── Calendário mensal
│   └── Próximos compromissos
│
└── Leads (COMERCIAL)
    ├── Lista de leads
    ├── Criar/editar leads
    └── Gestão de pipeline de vendas
```

---

## 🚀 Rotas Disponíveis

| Rota | Descrição | Permissão |
|------|-----------|-----------|
| `/colaborador/dashboard` | Dashboard operacional | Colaborador |
| `/colaborador/minhas-os` | Lista de OS delegadas | Colaborador |
| `/colaborador/minhas-os/[id]` | Executar tarefa da OS | Colaborador |
| `/colaborador/clientes` | Consulta de clientes | Colaborador |
| `/colaborador/agenda` | Calendário pessoal | Colaborador |
| `/colaborador/leads` | Gestão de leads | Colaborador (Comercial) |

---

## 📝 Notas de Implementação

1. **Mock Data:** Todas as páginas utilizam dados mockados. Substituir por API real no backend.

2. **Usuário Logado:** Sistema assume usuário mockado:
   ```typescript
   {
     id: 1,
     nome: "Carlos Silva",
     role_nivel: 4,
     setor: "OPERACIONAL" // ou "COMERCIAL" para leads
   }
   ```

3. **Filtros Automáticos:**
   - OS: apenas onde `responsavel === usuário logado`
   - Agenda: apenas eventos onde colaborador está alocado
   - Leads: apenas se `setor === "COMERCIAL"`

4. **Validações:**
   - Formulários possuem campos obrigatórios (*)
   - Toasts de sucesso/erro via Sonner
   - Redirecionamentos após ações

5. **Responsividade:**
   - Grid adaptativo (1 coluna mobile, 2-3 colunas desktop)
   - Tabelas com scroll horizontal
   - Cards empilhados em mobile

---

## 🔄 Integração com Backend

### Endpoints Necessários:

```typescript
// Dashboard
GET /api/colaborador/dashboard - KPIs e tarefas prioritárias

// Minhas OS
GET /api/colaborador/os - Lista de OS (filtradas por responsável)
GET /api/colaborador/os/:id - Detalhes da OS
PATCH /api/colaborador/os/:id/rascunho - Salvar rascunho
POST /api/colaborador/os/:id/submeter - Submeter para aprovação

// Clientes
GET /api/colaborador/clientes - Lista de clientes (read-only)

// Agenda
GET /api/colaborador/agenda - Eventos do colaborador

// Leads
GET /api/colaborador/leads - Lista de leads
POST /api/colaborador/leads - Criar lead
PATCH /api/colaborador/leads/:id - Editar lead
```

---

## ✅ Checklist de Implementação

- [x] Dashboard Operacional com KPIs
- [x] Lista de Minhas OS (filtrada por responsável)
- [x] Detalhes da OS (execução)
- [x] Formulário de execução com checklist
- [x] Salvar rascunho e submeter para aprovação
- [x] Consulta de clientes (read-only)
- [x] Calendário pessoal (agenda)
- [x] Modal de detalhes de eventos
- [x] Gestão de leads (comercial)
- [x] Controle de acesso por setor
- [x] Filtros e buscas
- [x] Badges e indicadores visuais
- [x] Toasts de notificação
- [x] Design System Minerva aplicado
- [x] Responsividade completa

---

## 📌 Próximos Passos

1. Integrar com API backend real
2. Implementar autenticação JWT
3. Adicionar upload real de arquivos/fotos
4. Implementar notificações em tempo real
5. Adicionar relatórios de produtividade
6. Criar sistema de chat/mensagens internas

---

**Desenvolvido para:** Minerva Engenharia  
**Stack:** Next.js 14 + shadcn/ui + Lucide React  
**Design System:** Minerva v1.0  
**Status:** ✅ Completo e Pronto para Integração
