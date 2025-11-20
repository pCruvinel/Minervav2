# 📋 Definições de ENUMs do Sistema Minerva

**Data de Padronização:** 11/11/2025  
**Convenção:** MAIÚSCULAS + SNAKE_CASE  
**Sem Acentos:** Todos os valores são ASCII puro

---

## 1. OS_STATUS_GERAL

Status global da Ordem de Serviço.

```sql
CREATE TYPE os_status_geral AS ENUM (
  'EM_TRIAGEM',
  'AGUARDANDO_INFORMACOES',
  'EM_ANDAMENTO',
  'EM_VALIDACAO',
  'ATRASADA',
  'CONCLUIDA',
  'CANCELADA'
);
```

### Valores

| Valor | Descrição |
|-------|-----------|
| `EM_TRIAGEM` | OS recém-criada, aguardando análise inicial |
| `AGUARDANDO_INFORMACOES` | Aguardando informações do cliente/terceiros |
| `EM_ANDAMENTO` | OS em execução ativa |
| `EM_VALIDACAO` | Aguardando validação/revisão interna |
| `ATRASADA` | OS com prazo vencido |
| `CONCLUIDA` | OS finalizada com sucesso |
| `CANCELADA` | OS cancelada |

---

## 2. OS_ETAPA_STATUS

Status de cada etapa individual da OS.

```sql
CREATE TYPE os_etapa_status AS ENUM (
  'PENDENTE',
  'EM_ANDAMENTO',
  'AGUARDANDO_APROVACAO',
  'APROVADA',
  'REJEITADA'
);
```

### Valores

| Valor | Descrição |
|-------|-----------|
| `PENDENTE` | Etapa ainda não iniciada |
| `EM_ANDAMENTO` | Etapa em execução |
| `AGUARDANDO_APROVACAO` | Etapa concluída, aguardando aprovação do gestor |
| `APROVADA` | Etapa aprovada pelo gestor |
| `REJEITADA` | Etapa rejeitada, precisa ser refeita |

---

## 3. AGENDAMENTO_STATUS

Status de agendamentos (visitas, reuniões, etc).

```sql
CREATE TYPE agendamento_status AS ENUM (
  'AGENDADO',
  'CONFIRMADO',
  'REALIZADO',
  'CANCELADO'
);
```

### Valores

| Valor | Descrição |
|-------|-----------|
| `AGENDADO` | Agendamento criado |
| `CONFIRMADO` | Agendamento confirmado pelo cliente |
| `REALIZADO` | Agendamento concluído |
| `CANCELADO` | Agendamento cancelado |

---

## 4. PRESENCA_STATUS

Status de presença de colaboradores.

```sql
CREATE TYPE presenca_status AS ENUM (
  'PRESENTE',
  'ATRASO',
  'FALTA_JUSTIFICADA',
  'FALTA_INJUSTIFICADA',
  'FERIAS',
  'FOLGA'
);
```

### Valores

| Valor | Descrição |
|-------|-----------|
| `PRESENTE` | Colaborador presente |
| `ATRASO` | Colaborador atrasado |
| `FALTA_JUSTIFICADA` | Falta com justificativa |
| `FALTA_INJUSTIFICADA` | Falta sem justificativa |
| `FERIAS` | Colaborador em férias |
| `FOLGA` | Colaborador em folga |

---

## 5. PERFORMANCE_AVALIACAO

Avaliação de performance (colaborador, fornecedor, etc).

```sql
CREATE TYPE performance_avaliacao AS ENUM (
  'OTIMA',
  'BOA',
  'RUIM'
);
```

### Valores

| Valor | Descrição |
|-------|-----------|
| `OTIMA` | Performance excelente |
| `BOA` | Performance satisfatória |
| `RUIM` | Performance insatisfat��ria |

---

## 6. CC_TIPO

Tipos de Centro de Custo.

```sql
CREATE TYPE cc_tipo AS ENUM (
  'ASSESSORIA',
  'OBRA',
  'INTERNO'
);
```

### Valores

| Valor | Descrição |
|-------|-----------|
| `ASSESSORIA` | Centro de custo para assessorias/consultorias |
| `OBRA` | Centro de custo para obras |
| `INTERNO` | Centro de custo interno da empresa |

---

## 7. CLIENTE_STATUS

Status do cliente/lead.

```sql
CREATE TYPE cliente_status AS ENUM (
  'LEAD',
  'CLIENTE_ATIVO',
  'CLIENTE_INATIVO'
);
```

### Valores

| Valor | Descrição |
|-------|-----------|
| `LEAD` | Prospect/lead ainda não convertido |
| `CLIENTE_ATIVO` | Cliente ativo com contrato vigente |
| `CLIENTE_INATIVO` | Cliente inativo ou contrato encerrado |

---

## 8. TIPO_CLIENTE

Tipo/categoria do cliente.

```sql
CREATE TYPE tipo_cliente AS ENUM (
  'PESSOA_FISICA',
  'CONDOMINIO',
  'CONSTRUTORA',
  'INCORPORADORA',
  'INDUSTRIA',
  'COMERCIO',
  'OUTRO'
);
```

### Valores

| Valor | Descrição |
|-------|-----------|
| `PESSOA_FISICA` | Pessoa física |
| `CONDOMINIO` | Condomínio residencial ou comercial |
| `CONSTRUTORA` | Empresa construtora |
| `INCORPORADORA` | Empresa incorporadora |
| `INDUSTRIA` | Indústria/fábrica |
| `COMERCIO` | Estabelecimento comercial |
| `OUTRO` | Outros tipos de cliente |

---

## 9. FINANCEIRO_TIPO

Tipos de movimentação financeira.

```sql
CREATE TYPE financeiro_tipo AS ENUM (
  'ENTRADA',
  'SAIDA'
);
```

### Valores

| Valor | Descrição |
|-------|-----------|
| `ENTRADA` | Receita/entrada de dinheiro |
| `SAIDA` | Despesa/saída de dinheiro |

---

## 🔄 Funções de Normalização

### Backend (Servidor)

Todas as funções de normalização devem converter para MAIÚSCULAS + SNAKE_CASE:

```typescript
const normalizeOsStatusGeral = (status: string | undefined): string | undefined => {
  if (!status) return status;
  
  // Converter para maiúsculas e snake_case
  const normalized = status
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, '_'); // Espaços para underscore
  
  const validValues = [
    'EM_TRIAGEM',
    'AGUARDANDO_INFORMACOES',
    'EM_ANDAMENTO',
    'EM_VALIDACAO',
    'ATRASADA',
    'CONCLUIDA',
    'CANCELADA'
  ];
  
  return validValues.includes(normalized) ? normalized : status;
};
```

### Frontend (TypeScript)

```typescript
// Tipo para Status Geral de OS
type OsStatusGeral = 
  | 'EM_TRIAGEM'
  | 'AGUARDANDO_INFORMACOES'
  | 'EM_ANDAMENTO'
  | 'EM_VALIDACAO'
  | 'ATRASADA'
  | 'CONCLUIDA'
  | 'CANCELADA';

// Tipo para Status de Etapa
type OsEtapaStatus =
  | 'PENDENTE'
  | 'EM_ANDAMENTO'
  | 'AGUARDANDO_APROVACAO'
  | 'APROVADA'
  | 'REJEITADA';
```

---

## 📊 Mapeamento para UI

Para exibir no frontend de forma amigável:

```typescript
const statusLabels: Record<string, string> = {
  // OS_STATUS_GERAL
  'EM_TRIAGEM': 'Em Triagem',
  'AGUARDANDO_INFORMACOES': 'Aguardando Informações',
  'EM_ANDAMENTO': 'Em Andamento',
  'EM_VALIDACAO': 'Em Validação',
  'ATRASADA': 'Atrasada',
  'CONCLUIDA': 'Concluída',
  'CANCELADA': 'Cancelada',
  
  // OS_ETAPA_STATUS
  'PENDENTE': 'Pendente',
  'EM_ANDAMENTO': 'Em Andamento',
  'AGUARDANDO_APROVACAO': 'Aguardando Aprovação',
  'APROVADA': 'Aprovada',
  'REJEITADA': 'Rejeitada',
  
  // AGENDAMENTO_STATUS
  'AGENDADO': 'Agendado',
  'CONFIRMADO': 'Confirmado',
  'REALIZADO': 'Realizado',
  'CANCELADO': 'Cancelado',
  
  // PRESENCA_STATUS
  'PRESENTE': 'Presente',
  'ATRASO': 'Atraso',
  'FALTA_JUSTIFICADA': 'Falta Justificada',
  'FALTA_INJUSTIFICADA': 'Falta Injustificada',
  'FERIAS': 'Férias',
  'FOLGA': 'Folga',
  
  // PERFORMANCE_AVALIACAO
  'OTIMA': 'Ótima',
  'BOA': 'Boa',
  'RUIM': 'Ruim',
  
  // CC_TIPO
  'ASSESSORIA': 'Assessoria',
  'OBRA': 'Obra',
  'INTERNO': 'Interno',
  
  // FINANCEIRO_TIPO
  'ENTRADA': 'Entrada',
  'SAIDA': 'Saída',
};

// Uso:
<Badge>{statusLabels[os.status_geral]}</Badge>
```

---

## 🎨 Cores e Badges (Sugestão)

```typescript
const statusColors: Record<string, string> = {
  // OS_STATUS_GERAL
  'EM_TRIAGEM': 'bg-gray-500',
  'AGUARDANDO_INFORMACOES': 'bg-yellow-500',
  'EM_ANDAMENTO': 'bg-blue-500',
  'EM_VALIDACAO': 'bg-purple-500',
  'ATRASADA': 'bg-red-500',
  'CONCLUIDA': 'bg-green-500',
  'CANCELADA': 'bg-gray-400',
  
  // OS_ETAPA_STATUS
  'PENDENTE': 'bg-gray-400',
  'EM_ANDAMENTO': 'bg-blue-500',
  'AGUARDANDO_APROVACAO': 'bg-yellow-500',
  'APROVADA': 'bg-green-500',
  'REJEITADA': 'bg-red-500',
};
```

---

## ⚠️ IMPORTANTE: Regras de Padronização

1. **SEMPRE usar MAIÚSCULAS**
2. **SEMPRE usar SNAKE_CASE** (underscore `_` entre palavras)
3. **NUNCA usar acentos** (ã, é, í, ó, ú, ç)
4. **NUNCA usar espaços**
5. **Backend normaliza automaticamente** para garantir compatibilidade

---

## 🔄 Histórico de Mudanças

### 11/11/2025 - Padronização Completa
- ✅ Migração de `'Em Andamento'` → `'EM_ANDAMENTO'`
- ✅ Migração de `'Concluída'` → `'CONCLUIDA'`
- ✅ Migração de `'Aguardando Aprovação'` → `'AGUARDANDO_APROVACAO'`
- ✅ Adição de novos status: `AGUARDANDO_INFORMACOES`, `EM_VALIDACAO`, `ATRASADA`
- ✅ Mudança de `REPROVADA` → `REJEITADA`

---

**Documentado por:** Sistema Minerva ERP  
**Última atualização:** 11/11/2025