# Dados Mockados - Módulo Colaborador

## 📊 Visão Geral

Este documento descreve os dados mockados implementados nos 7 módulos do fluxo colaborador do Sistema ERP Minerva Engenharia.

## 🗂️ Arquivo Centralizado

**Localização:** `/lib/mock-data-colaborador.ts`

Este arquivo centraliza todos os dados mockados para facilitar manutenção e consistência entre os módulos.

---

## 👤 Usuário Mockado

```typescript
mockUserColaborador = {
  id: 1,
  nome: "Carlos Silva",
  email: "carlos.silva@minervaengenharia.com.br",
  role_nivel: 4, // Colaborador
  setor: "COMERCIAL", // Pode ser "COMERCIAL" ou "OPERACIONAL"
  telefone: "(11) 98765-4321",
  criadoEm: "2024-01-15",
}
```

**Nota:** Altere `setor` para "OPERACIONAL" para testar sem acesso ao módulo de leads.

---

## 📋 Módulos e Dados

### 1. Dashboard Operacional (`/colaborador/dashboard`)

**Dados:**
- **18 Ordens de Serviço** atribuídas ao colaborador
- **KPIs Dinâmicos:** 
  - OS em Aberto (calculado automaticamente)
  - Tarefas para Hoje (baseado em prazo)
  - Prazos Vencidos (calculado comparando com data atual)
- **Top 15 Tarefas** ordenadas por prazo

**Características:**
- Status: ATRASADO, EM_ANDAMENTO, PENDENTE
- Prioridades: ALTA, MEDIA, BAIXA
- Tipos de OS: OS_01 a OS_13
- Diferentes etapas de workflow

### 2. Minhas OS (`/colaborador/minhas-os`)

**Dados:**
- **18 Ordens de Serviço** completas
- Tipos variados (OS_01 a OS_13)
- Clientes diversos de várias cidades

**Filtros Funcionais:**
- Busca por código, cliente ou endereço
- Filtro por status
- Filtro por prioridade

**Exemplos de OS:**
- OS-007-2025 (Vistoria - Construtora ABC - ATRASADO)
- OS-013-2025 (Execução - Empresa XYZ - EM_ANDAMENTO)
- OS-001-2025 (Proposta - Shopping Center - EM_ANDAMENTO)
- OS-010-2024 (Análise - LabVida - ATRASADO)

### 3. Execução de Tarefas (`/colaborador/minhas-os/[id]`)

**Dados:**
- **18 OS detalhadas** com informações completas:
  - Código, tipo, cliente
  - Endereço completo, CEP, telefone, email
  - Etapa atual, status, prioridade
  - Prazo e descrição detalhada
  - Responsável e data de criação

**Formulário de Execução:**
- Checklist de vistoria (5 itens)
- Campos para medições técnicas
- Observações gerais
- Upload de evidências fotográficas
- Botões: Salvar Rascunho / Submeter para Aprovação

### 4. Consulta de Clientes (`/colaborador/clientes`)

**Dados:**
- **30 Clientes** (Pessoa Física e Jurídica)
- Distribuídos em várias cidades brasileiras
- Informações completas: nome, documento, endereço, telefone, email

**Exemplos:**
- **PJ:** Construtora ABC, Hospital São Lucas, Shopping Center Norte
- **PF:** João da Silva, Maria Santos, Pedro Henrique Costa

**Busca Funcional:**
- Por nome, endereço, telefone ou email

### 5. Agenda Pessoal (`/colaborador/agenda`)

**Dados:**
- **18 Eventos/Compromissos** distribuídos ao longo do mês
- Tipos: VISTORIA, REUNIAO, FOLLOW_UP, APRESENTACAO, ANALISE_TECNICA, INSPECAO

**Exemplos de Eventos:**
- 18/11 09:00-11:00 - Vistoria Construtora ABC
- 19/11 14:00-16:00 - Reunião Empresa XYZ
- 20/11 15:00-16:30 - Follow-up Indústria 123
- 17/11 13:00-15:00 - Análise Urgente LabVida

**Recursos:**
- Calendário visual do mês
- Lista de próximos 5 compromissos
- Dialog com detalhes completos
- Link direto para a OS relacionada

### 6. Gestão de Leads (`/colaborador/leads`)

**Dados:**
- **20 Leads comerciais** com informações completas
- Status: NOVO, EM_CONTATO, QUALIFICADO, NAO_QUALIFICADO, CONVERTIDO
- Potencial: ALTO, MEDIO, BAIXO
- Origens: SITE, TELEFONE, EMAIL, INDICACAO, REDES_SOCIAIS

**Exemplos de Leads:**
- Empresa Potencial ABC (NOVO - ALTO)
- Construtora Nova Era (EM_CONTATO - MEDIO)
- Shopping Praça Central (QUALIFICADO - ALTO)
- Indústria Metalúrgica Forte (CONVERTIDO - ALTO)

**KPIs Dinâmicos:**
- Total de Leads
- Novos
- Em Contato
- Qualificados

**Funcionalidades:**
- Criar novo lead
- Editar lead existente
- Filtros por status
- Busca por nome, contato ou email

### 7. Portal do Colaborador (`/colaborador/page`)

**Dados:**
- Informações do usuário logado
- 5 cards de navegação (4 sempre disponíveis + 1 condicional)
- Permissões por perfil
- Dicas contextuais

**Visibilidade Condicional:**
- Módulo de Leads só aparece se `setor === "COMERCIAL"`

---

## 🎨 Padrões de Design

### Cores Minerva
- **Primary:** #D3AF37 (Dourado)
- **Secondary:** #DDC063 (Dourado Claro)
- **Texto:** Sempre preto

### ENUMs
- Padrão: `MAIUSCULAS_SNAKE_CASE` sem acentos
- Exemplos: `EM_ANDAMENTO`, `PESSOA_JURIDICA`, `NAO_QUALIFICADO`

### Status das OS
- `ATRASADO` - Vermelho
- `EM_ANDAMENTO` - Azul
- `PENDENTE` - Amarelo
- `CONCLUIDO` - Verde

### Prioridades
- `ALTA` - Vermelho
- `MEDIA` - Amarelo
- `BAIXA` - Verde

---

## 🔄 Como Modificar os Dados

### 1. Adicionar Mais OS

Edite `/lib/mock-data-colaborador.ts` e adicione no array `mockOrdensServico`:

```typescript
{
  id: 19,
  codigo: "OS-XXX-2025",
  tipo: "OS_07",
  cliente: "Nome do Cliente",
  endereco: "Endereço Completo",
  cep: "00000-000",
  telefone: "(XX) XXXXX-XXXX",
  email: "email@cliente.com.br",
  etapaAtual: "VISTORIA",
  status: "EM_ANDAMENTO",
  prioridade: "ALTA",
  prazo: "2025-XX-XX",
  responsavel: "Carlos Silva",
  descricao: "Descrição da OS",
  criadoEm: "2025-XX-XX",
}
```

### 2. Adicionar Clientes

Adicione no array `mockClientes` (similar à estrutura acima).

### 3. Adicionar Eventos na Agenda

Adicione no array `mockEventosAgenda`:

```typescript
{
  id: 19,
  titulo: "Título do Evento",
  osId: 1, // ID da OS relacionada
  osCodigo: "OS-007-2025",
  cliente: "Nome do Cliente",
  endereco: "Endereço",
  data: "2025-11-XX",
  horaInicio: "10:00",
  horaFim: "12:00",
  tipo: "VISTORIA",
  responsavel: "Carlos Silva",
}
```

### 4. Adicionar Leads

Adicione no array `mockLeads`:

```typescript
{
  id: 21,
  nome: "Nome da Empresa",
  contato: "Nome do Contato",
  telefone: "(XX) XXXXX-XXXX",
  email: "contato@empresa.com",
  origem: "INDICACAO",
  status: "NOVO",
  potencial: "ALTO",
  observacoes: "Observações",
  criadoPor: "Carlos Silva",
  criadoEm: "2025-XX-XX",
}
```

### 5. Mudar Setor do Usuário

Em `/lib/mock-data-colaborador.ts`:

```typescript
export const mockUserColaborador = {
  // ... outros campos
  setor: "OPERACIONAL", // ou "COMERCIAL"
}
```

---

## ✅ Checklist de Funcionalidades

### Dashboard Operacional
- [x] 18 OS delegadas ao colaborador
- [x] KPIs dinâmicos calculados automaticamente
- [x] Top 15 tarefas ordenadas por prazo
- [x] Indicação visual de prazos vencidos
- [x] Links diretos para execução

### Minhas OS
- [x] Lista completa de 18 OS
- [x] Filtros por status e prioridade
- [x] Busca por código/cliente/endereço
- [x] Contador de OS encontradas
- [x] Badges coloridas por tipo

### Execução de Tarefas
- [x] 18 OS com detalhes completos
- [x] Formulário contextual por etapa
- [x] Checklist de vistoria
- [x] Campos de medições e observações
- [x] Upload de fotos
- [x] Salvar rascunho / Submeter para aprovação

### Consulta de Clientes
- [x] 30 clientes (PF e PJ)
- [x] Várias cidades do Brasil
- [x] Busca funcional
- [x] Links para telefone e email
- [x] Badge de acesso somente leitura

### Agenda Pessoal
- [x] 18 eventos distribuídos no mês
- [x] Calendário visual navegável
- [x] Lista de próximos 5 compromissos
- [x] Dialog com detalhes
- [x] Link para OS relacionada
- [x] Legenda de tipos de evento

### Gestão de Leads
- [x] 20 leads completos
- [x] KPIs dinâmicos (Total, Novos, Em Contato, Qualificados)
- [x] Criar novo lead
- [x] Editar lead existente
- [x] Filtros por status
- [x] Busca funcional
- [x] Acesso restrito por setor

### Portal do Colaborador
- [x] 5 cards de navegação
- [x] Visibilidade condicional (Leads)
- [x] Lista de permissões
- [x] Dicas contextuais
- [x] Informações do usuário

---

## 🚀 Como Testar

1. **Dashboard**: Acesse `/colaborador/dashboard`
   - Verá 18 OS em aberto, 7 tarefas para hoje, 3 prazos vencidos
   - Tabela com top 15 tarefas ordenadas por prazo

2. **Minhas OS**: Acesse `/colaborador/minhas-os`
   - Use filtros de status e prioridade
   - Busque por "Construtora", "São Paulo", etc.

3. **Executar OS**: Clique em qualquer "Executar"
   - Preencha formulário
   - Teste "Salvar Rascunho" e "Submeter para Aprovação"

4. **Clientes**: Acesse `/colaborador/clientes`
   - Busque por "Hospital", "(11)", "email.com"
   - Clique em telefones e emails

5. **Agenda**: Acesse `/colaborador/agenda`
   - Navegue entre meses
   - Clique nos eventos do calendário
   - Teste link "Abrir Ordem de Serviço"

6. **Leads** (se setor COMERCIAL): Acesse `/colaborador/leads`
   - Crie novo lead
   - Edite lead existente
   - Use filtros por status

7. **Testar Acesso Restrito**:
   - Mude `setor` para "OPERACIONAL"
   - Leads não deve aparecer na navegação
   - Acesso direto mostra tela de restrição

---

## 📝 Notas Importantes

1. **Responsabilidades:** Todos os dados estão atribuídos a "Carlos Silva"
2. **Consistência:** IDs de OS coincidem entre módulos (agenda usa osId)
3. **Datas Realistas:** Distribuídas entre 15/11 e 02/12/2025
4. **Telefones BR:** Formato (XX) XXXXX-XXXX
5. **Emails Válidos:** Domínios .com.br e .edu.br

---

## 🔧 Integração Futura com API

Para substituir por dados reais da API:

1. Substitua imports de `/lib/mock-data-colaborador.ts`
2. Use hooks customizados (ex: `useOrdensServico()`)
3. Implemente loading states
4. Adicione error handling
5. Mantenha mesma estrutura de dados

**Exemplo:**
```typescript
// Antes
import { mockOrdensServico } from "@/lib/mock-data-colaborador";

// Depois
const { data: ordensServico, loading } = useOrdensServico();
```

---

**Data de Atualização:** 17/11/2025  
**Versão:** 1.0.0  
**Sistema:** ERP Minerva Engenharia - Módulo Colaborador
