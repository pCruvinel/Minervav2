# Integração Supabase - Minerva ERP

**Data:** 10/11/2024  
**Status:** ✅ **Concluído - Conexões Básicas Implementadas**

---

## 📋 O Que Foi Implementado

### 1. ✅ Servidor Edge Function (`/supabase/functions/server/index.tsx`)

Criadas rotas RESTful completas para:

#### **Clientes/Leads**
- `GET /clientes` - Listar todos (com filtro por status)
- `GET /clientes/:id` - Buscar por ID
- `POST /clientes` - Criar novo
- `PUT /clientes/:id` - Atualizar

#### **Ordens de Serviço**
- `GET /ordens-servico` - Listar todas (com filtros)
- `GET /ordens-servico/:id` - Buscar por ID
- `POST /ordens-servico` - Criar nova (gera código automaticamente)
- `PUT /ordens-servico/:id` - Atualizar

#### **Etapas de OS**
- `GET /ordens-servico/:osId/etapas` - Listar etapas
- `POST /ordens-servico/:osId/etapas` - Criar etapa
- `PUT /etapas/:id` - Atualizar etapa

#### **Tipos de OS**
- `GET /tipos-os` - Listar tipos

---

### 2. ✅ Cliente da API (`/lib/api-client.ts`)

Funções TypeScript para chamar todos os endpoints:

```typescript
// Exemplo de uso
import { clientesAPI, ordensServicoAPI, tiposOSAPI } from './lib/api-client';

// Listar clientes
const clientes = await clientesAPI.list();

// Criar OS
const novaOS = await ordensServicoAPI.create({
  cliente_id: 'uuid',
  tipo_os_id: 'uuid',
  criado_por_id: 'uuid',
});
```

**Características:**
- ✅ Headers automáticos (Authorization com publicAnonKey)
- ✅ Tratamento de erros padronizado
- ✅ Suporte a query parameters
- ✅ TypeScript ready

---

### 3. ✅ Hooks React (`/lib/hooks/use-api.ts`)

Dois hooks para facilitar integração:

#### `useApi<T>` - Para leitura (GET)
```tsx
const { data, loading, error, refetch } = useApi(
  () => clientesAPI.list('LEAD')
);
```

#### `useMutation<T, V>` - Para escrita (POST, PUT, DELETE)
```tsx
const { mutate, loading, error } = useMutation(
  clientesAPI.create,
  {
    onSuccess: () => toast.success('Criado!'),
    onError: (err) => toast.error(err.message),
  }
);

await mutate(dados);
```

---

### 4. ✅ Exemplo de Componente Conectado

Criado `/components/os/os-list-page-connected.tsx` demonstrando:
- ✅ Uso do hook `useApi`
- ✅ Loading states
- ✅ Error handling
- ✅ Filtros locais + API
- ✅ Refresh manual

---

### 5. ✅ Documentação Completa

#### `/API_INTEGRATION_GUIDE.md`
- 📚 Todos os endpoints documentados
- 💡 Exemplos práticos de uso
- 🔄 Guia de migração mock → API real
- 📊 Estruturas de dados TypeScript
- 🐛 Tratamento de erros

---

## 🎯 Como Usar

### Passo 1: Verificar Conexão

```tsx
import { healthCheck } from './lib/api-client';

const test = async () => {
  const result = await healthCheck();
  console.log(result); // { status: "ok" }
};
```

### Passo 2: Usar em Componentes

**Antes (Mock Data):**
```tsx
import { mockLeads } from './lib/mock-data';

const leads = mockLeads;
```

**Depois (API Real):**
```tsx
import { useApi } from './lib/hooks/use-api';
import { clientesAPI } from './lib/api-client';

const { data: leads, loading } = useApi(
  () => clientesAPI.list('LEAD')
);
```

### Passo 3: Criar/Atualizar Dados

```tsx
import { useMutation } from './lib/hooks/use-api';
import { clientesAPI } from './lib/api-client';

const { mutate: createCliente } = useMutation(clientesAPI.create);

await createCliente({
  nome_razao_social: 'Construtora ABC',
  status: 'LEAD',
  // ... outros campos
});
```

---

## 🗂️ Estrutura de Dados

### Cliente/Lead

```typescript
{
  id: string;
  created_at: string;
  status: 'LEAD' | 'CLIENTE_ATIVO' | 'CLIENTE_INATIVO';
  nome_razao_social: string;
  cpf_cnpj: string;
  email: string;
  telefone: string;
  nome_responsavel?: string;
  tipo_cliente?: 'PESSOA_FISICA' | 'CONDOMINIO' | 'CONSTRUTORA' | ...;
  endereco?: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
}
```

### Ordem de Serviço

```typescript
{
  id: string;
  codigo_os: string; // "OS-2025-001" (gerado auto)
  cliente_id: string;
  tipo_os_id: string;
  status_geral: 'Em Triagem' | 'Em Andamento' | 'Concluída' | ...;
  data_entrada: string;
  valor_proposta?: number;
  valor_contrato?: number;
  descricao?: string;
  
  // Relacionamentos (no select)
  cliente?: Cliente;
  tipo_os?: TipoOS;
  responsavel?: Colaborador;
}
```

### Etapa de OS

```typescript
{
  id: string;
  os_id: string;
  nome_etapa: string;
  ordem: number;
  status: 'Pendente' | 'Em Andamento' | 'Concluída' | ...;
  dados_etapa?: any; // JSONB - flexível por etapa
  data_inicio?: string;
  data_conclusao?: string;
}
```

---

## 🔐 Segurança

### ✅ Implementado
- Service Role Key usado apenas no servidor
- Public Anon Key usado no frontend
- CORS habilitado
- Logs de erro detalhados

### ⏳ Próximos Passos
- [ ] Autenticação com Supabase Auth
- [ ] Row Level Security (RLS) policies
- [ ] Rate limiting
- [ ] Validação de schemas (Zod)

---

## 📊 Arquitetura

```
┌─────────────────────────────────────────┐
│         FRONTEND (React)                │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Components (UI)                  │  │
│  │  - OSListPageConnected            │  │
│  │  - CreateOSForm                   │  │
│  └───────────┬───────────────────────┘  │
│              │ usa                      │
│  ┌───────────▼───────────────────────┐  │
│  │  Hooks (/lib/hooks/use-api.ts)   │  │
│  │  - useApi()                       │  │
│  │  - useMutation()                  │  │
│  └───────────┬───────────────────────┘  │
│              │ usa                      │
│  ┌───────────▼───────────────────────┐  │
│  │  API Client (/lib/api-client.ts) │  │
│  │  - clientesAPI                    │  │
│  │  - ordensServicoAPI               │  │
│  │  - tiposOSAPI                     │  │
│  └───────────┬───────────────────────┘  │
└──────────────┼───────────────────────────┘
               │ HTTP (Authorization: Bearer)
               │
┌──────────────▼───────────────────────────┐
│   SUPABASE EDGE FUNCTION                │
│   (/supabase/functions/server)          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Hono Server (index.tsx)        │   │
│  │  - Rotas REST                   │   │
│  │  - CORS + Logging               │   │
│  │  - Error Handling               │   │
│  └─────────────┬───────────────────┘   │
│                │                        │
│  ┌─────────────▼───────────────────┐   │
│  │  Supabase Client                │   │
│  │  (Service Role Key)             │   │
│  └─────────────┬───────────────────┘   │
└────────────────┼─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│       SUPABASE POSTGRES                 │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Tabelas:                       │   │
│  │  - clientes                     │   │
│  │  - ordens_servico               │   │
│  │  - os_etapas                    │   │
│  │  - tipos_os                     │   │
│  │  - colaboradores                │   │
│  │  - os_anexos                    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist de Migração

Para migrar um componente de mock data para API real:

- [ ] Identificar qual entidade (cliente, OS, etapa, etc.)
- [ ] Substituir `import { mockData }` por `import { useApi }`
- [ ] Adicionar tratamento de loading state
- [ ] Adicionar tratamento de error state
- [ ] Testar CRUD completo (Create, Read, Update, Delete)
- [ ] Atualizar tipos TypeScript se necessário
- [ ] Remover dados mockados após confirmação

---

## 🚀 Próximas Implementações

### Alta Prioridade
1. **Upload de Anexos** (Supabase Storage)
   - Rota para upload
   - Rota para download com signed URLs
   - Integração com os_anexos

2. **Autenticação** (Supabase Auth)
   - Login/Logout
   - Rotas protegidas
   - RLS policies

3. **Colaboradores**
   - CRUD de colaboradores
   - Associação com auth.users

### Média Prioridade
4. **Agendamentos**
   - CRUD de eventos
   - Relacionamento com OS

5. **Financeiro**
   - Lançamentos
   - Conciliação

6. **Dashboards**
   - Views otimizadas
   - Agregações

---

## 📝 Exemplos Rápidos

### Listar Leads
```tsx
const { data: leads } = useApi(() => clientesAPI.list('LEAD'));
```

### Criar Cliente
```tsx
const { mutate } = useMutation(clientesAPI.create);
await mutate({ nome_razao_social: 'ABC', status: 'LEAD' });
```

### Buscar OS por ID
```tsx
const { data: os } = useApi(() => ordensServicoAPI.getById('uuid'));
```

### Atualizar Etapa
```tsx
const { mutate } = useMutation(
  (data) => ordensServicoAPI.updateEtapa('etapa-id', data)
);
await mutate({ status: 'Concluída' });
```

---

## 🐛 Troubleshooting

### Erro: "Failed to fetch"
- Verificar se o servidor Supabase está rodando
- Verificar SUPABASE_URL e SUPABASE_ANON_KEY em /utils/supabase/info.tsx

### Erro: "Unauthorized"
- Verificar se o Bearer token está sendo enviado
- Verificar se as RLS policies estão configuradas

### Erro: "404 Not Found"
- Verificar se a rota está correta no servidor
- Verificar se o prefixo `/make-server-5ad7fd2c/` está presente

---

## 📚 Referências

- [Supabase Docs](https://supabase.com/docs)
- [Hono Framework](https://hono.dev/)
- [DATABASE_SCHEMA.md](/DATABASE_SCHEMA.md)
- [API_INTEGRATION_GUIDE.md](/API_INTEGRATION_GUIDE.md)

---

**Implementado por:** Equipe de Desenvolvimento Minerva ERP  
**Última atualização:** 10/11/2024
