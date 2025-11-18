# Guia de Integração com API Supabase

**Última atualização:** 10/11/2024  
**Sistema:** Minerva Engenharia - Sistema de Gestão Integrada (ERP)

---

## 📋 Visão Geral

Este documento demonstra como integrar os componentes React com a API Supabase através das rotas criadas no servidor Edge Function.

---

## 🔧 Configuração Inicial

### 1. Estrutura de Arquivos

```
lib/
├── api-client.ts          # Cliente da API (funções para chamar endpoints)
├── hooks/
│   └── use-api.ts         # Hooks React para facilitar uso da API
└── mock-data.ts           # Mock data (sendo gradualmente substituído)

supabase/functions/server/
├── index.tsx              # Servidor Edge Function com todas as rotas
└── kv_store.tsx          # Utilitário KV Store (protegido)
```

### 2. Verificar Conexão

```tsx
import { healthCheck } from './lib/api-client';

// Verificar se o servidor está respondendo
const checkHealth = async () => {
  try {
    const result = await healthCheck();
    console.log('Servidor OK:', result); // { status: "ok" }
  } catch (error) {
    console.error('Erro ao conectar com servidor:', error);
  }
};
```

---

## 🎯 Endpoints Disponíveis

### Clientes/Leads

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/clientes` | Listar todos os clientes/leads |
| GET | `/clientes?status=LEAD` | Filtrar por status |
| GET | `/clientes/:id` | Buscar cliente por ID |
| POST | `/clientes` | Criar novo cliente/lead |
| PUT | `/clientes/:id` | Atualizar cliente |

### Ordens de Serviço

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/ordens-servico` | Listar todas as OS |
| GET | `/ordens-servico?status=Em%20Andamento` | Filtrar por status |
| GET | `/ordens-servico/:id` | Buscar OS por ID |
| POST | `/ordens-servico` | Criar nova OS |
| PUT | `/ordens-servico/:id` | Atualizar OS |
| GET | `/ordens-servico/:osId/etapas` | Listar etapas de uma OS |
| POST | `/ordens-servico/:osId/etapas` | Criar etapa |
| PUT | `/etapas/:id` | Atualizar etapa |

### Tipos de OS

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/tipos-os` | Listar todos os tipos de OS |

---

## 📚 Exemplos de Uso

### Exemplo 1: Listar Clientes/Leads

```tsx
import { useEffect, useState } from 'react';
import { clientesAPI } from './lib/api-client';

function ClientesList() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await clientesAPI.list(); // Todos os clientes
        setClientes(data);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientes();
  }, []);
  
  if (loading) return <div>Carregando...</div>;
  
  return (
    <ul>
      {clientes.map(cliente => (
        <li key={cliente.id}>{cliente.nome_razao_social}</li>
      ))}
    </ul>
  );
}
```

### Exemplo 2: Usando o Hook useApi

```tsx
import { useApi } from './lib/hooks/use-api';
import { clientesAPI } from './lib/api-client';

function ClientesListWithHook() {
  const { data: clientes, loading, error, refetch } = useApi(
    () => clientesAPI.list('LEAD'), // Apenas LEADs
    {
      onSuccess: (data) => console.log('Clientes carregados:', data),
      onError: (error) => console.error('Erro:', error),
    }
  );
  
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;
  
  return (
    <div>
      <button onClick={refetch}>Recarregar</button>
      <ul>
        {clientes?.map(cliente => (
          <li key={cliente.id}>{cliente.nome_razao_social}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Exemplo 3: Criar Novo Cliente/Lead

```tsx
import { useMutation } from './lib/hooks/use-api';
import { clientesAPI } from './lib/api-client';
import { toast } from 'sonner@2.0.3';

function CreateClienteForm() {
  const { mutate: createCliente, loading } = useMutation(
    clientesAPI.create,
    {
      onSuccess: () => {
        toast.success('Cliente criado com sucesso!');
      },
      onError: (error) => {
        toast.error(`Erro ao criar cliente: ${error.message}`);
      },
    }
  );
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const novoCliente = {
      nome_razao_social: 'Construtora Exemplo',
      cpf_cnpj: '12.345.678/0001-90',
      status: 'LEAD',
      tipo_cliente: 'CONSTRUTORA',
      email: 'contato@exemplo.com',
      telefone: '(11) 98765-4321',
      endereco: {
        rua: 'Av. Exemplo',
        numero: '100',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01000-000'
      }
    };
    
    try {
      await createCliente(novoCliente);
    } catch (error) {
      // Erro já tratado pelo hook
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={loading}>
        {loading ? 'Criando...' : 'Criar Cliente'}
      </button>
    </form>
  );
}
```

### Exemplo 4: Atualizar Cliente

```tsx
import { useMutation } from './lib/hooks/use-api';
import { clientesAPI } from './lib/api-client';

function UpdateClienteStatus({ clienteId }: { clienteId: string }) {
  const { mutate: updateCliente, loading } = useMutation(
    (data: any) => clientesAPI.update(clienteId, data)
  );
  
  const handleConvertToCliente = async () => {
    try {
      await updateCliente({ status: 'CLIENTE_ATIVO' });
      alert('Lead convertido para Cliente!');
    } catch (error) {
      alert('Erro ao atualizar status');
    }
  };
  
  return (
    <button onClick={handleConvertToCliente} disabled={loading}>
      Converter para Cliente
    </button>
  );
}
```

### Exemplo 5: Listar Ordens de Serviço

```tsx
import { useApi } from './lib/hooks/use-api';
import { ordensServicoAPI } from './lib/api-client';

function OrdemServicoList() {
  const { data: ordens, loading, error } = useApi(
    () => ordensServicoAPI.list({ status: 'Em Andamento' })
  );
  
  if (loading) return <div>Carregando OS...</div>;
  if (error) return <div>Erro: {error.message}</div>;
  
  return (
    <ul>
      {ordens?.map(os => (
        <li key={os.id}>
          <strong>{os.codigo_os}</strong> - {os.cliente.nome_razao_social}
          <br />
          Status: {os.status_geral}
          <br />
          Tipo: {os.tipo_os.nome}
        </li>
      ))}
    </ul>
  );
}
```

### Exemplo 6: Criar Nova OS

```tsx
import { useMutation } from './lib/hooks/use-api';
import { ordensServicoAPI } from './lib/api-client';

function CreateOSForm({ clienteId, tipoOsId }: any) {
  const { mutate: createOS, loading } = useMutation(ordensServicoAPI.create);
  
  const handleCreate = async () => {
    try {
      const novaOS = {
        cliente_id: clienteId,
        tipo_os_id: tipoOsId,
        criado_por_id: 'user-uuid-here', // UUID do usuário logado
        status_geral: 'Em Triagem',
        descricao: 'Nova ordem de serviço',
      };
      
      const result = await createOS(novaOS);
      console.log('OS criada:', result.codigo_os);
    } catch (error) {
      console.error('Erro:', error);
    }
  };
  
  return (
    <button onClick={handleCreate} disabled={loading}>
      {loading ? 'Criando...' : 'Criar OS'}
    </button>
  );
}
```

### Exemplo 7: Trabalhar com Etapas

```tsx
import { useApi, useMutation } from './lib/hooks/use-api';
import { ordensServicoAPI } from './lib/api-client';

function OSEtapas({ osId }: { osId: string }) {
  const { data: etapas, loading, refetch } = useApi(
    () => ordensServicoAPI.getEtapas(osId)
  );
  
  const { mutate: updateEtapa } = useMutation(
    ({ id, data }: any) => ordensServicoAPI.updateEtapa(id, data),
    {
      onSuccess: () => refetch(), // Recarregar etapas após atualização
    }
  );
  
  const handleConcluirEtapa = async (etapaId: string) => {
    await updateEtapa({
      id: etapaId,
      data: {
        status: 'Concluída',
        data_conclusao: new Date().toISOString(),
      }
    });
  };
  
  if (loading) return <div>Carregando etapas...</div>;
  
  return (
    <ul>
      {etapas?.map(etapa => (
        <li key={etapa.id}>
          {etapa.nome_etapa} - {etapa.status}
          {etapa.status !== 'Concluída' && (
            <button onClick={() => handleConcluirEtapa(etapa.id)}>
              Concluir
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
```

---

## 🔄 Migração de Mock Data para API Real

### Antes (Mock Data)

```tsx
import { mockLeads } from './lib/mock-data';

function LeadsList() {
  const [leads, setLeads] = useState(mockLeads);
  
  return (
    <ul>
      {leads.map(lead => <li key={lead.id}>{lead.nome}</li>)}
    </ul>
  );
}
```

### Depois (API Real)

```tsx
import { useApi } from './lib/hooks/use-api';
import { clientesAPI } from './lib/api-client';

function LeadsList() {
  const { data: leads, loading } = useApi(
    () => clientesAPI.list('LEAD')
  );
  
  if (loading) return <div>Carregando...</div>;
  
  return (
    <ul>
      {leads?.map(lead => (
        <li key={lead.id}>{lead.nome_razao_social}</li>
      ))}
    </ul>
  );
}
```

---

## 🔐 Autenticação (Futuro)

As rotas ainda **não** exigem autenticação. Quando implementado:

```tsx
// O token será passado automaticamente pelo api-client.ts
// Você precisará apenas fornecer o access token do usuário logado
```

---

## 🐛 Tratamento de Erros

### Padrão de Erro

Todos os endpoints retornam erros no formato:

```json
{
  "error": "Mensagem de erro detalhada"
}
```

### Exemplo de Tratamento

```tsx
try {
  const result = await clientesAPI.create(data);
} catch (error) {
  if (error instanceof Error) {
    // Erro de rede ou do servidor
    console.error('Erro:', error.message);
    
    // Exibir para o usuário
    toast.error(`Falha ao criar cliente: ${error.message}`);
  }
}
```

---

## 📊 Estrutura de Dados

### Cliente/Lead

```typescript
interface Cliente {
  id: string;
  created_at: string;
  status: 'LEAD' | 'CLIENTE_ATIVO' | 'CLIENTE_INATIVO';
  nome_razao_social: string;
  cpf_cnpj: string;
  email: string;
  telefone: string;
  nome_responsavel?: string;
  tipo_cliente?: 'PESSOA_FISICA' | 'CONDOMINIO' | 'CONSTRUTORA' | 'INCORPORADORA' | 'INDUSTRIA' | 'COMERCIO' | 'OUTRO';
  endereco?: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  observacoes?: string;
  responsavel_id?: string;
}
```

### Ordem de Serviço

```typescript
interface OrdemServico {
  id: string;
  codigo_os: string; // Ex: "OS-2025-001"
  cliente_id: string;
  tipo_os_id: string;
  responsavel_id?: string;
  criado_por_id: string;
  cc_id?: string;
  status_geral: 'Em Triagem' | 'Em Andamento' | 'Aguardando Aprovação' | 'Concluída' | 'Cancelada' | 'Pausada';
  data_entrada: string;
  data_prazo?: string;
  data_conclusao?: string;
  valor_proposta?: number;
  valor_contrato?: number;
  descricao?: string;
  
  // Relacionamentos (quando incluídos no select)
  cliente?: Cliente;
  tipo_os?: TipoOS;
  responsavel?: Colaborador;
}
```

### Etapa de OS

```typescript
interface OSEtapa {
  id: string;
  os_id: string;
  nome_etapa: string;
  ordem: number;
  status: 'Pendente' | 'Em Andamento' | 'Aguardando Aprovação' | 'Aprovada' | 'Reprovada' | 'Concluída';
  responsavel_id?: string;
  aprovador_id?: string;
  comentarios_aprovacao?: string;
  data_inicio?: string;
  data_conclusao?: string;
  dados_etapa?: any; // JSONB - estrutura flexível
}
```

---

## ⚡ Próximos Passos

- [ ] Implementar autenticação com Supabase Auth
- [ ] Adicionar rotas para anexos (upload/download)
- [ ] Implementar rotas de agendamentos
- [ ] Criar rotas de auditoria
- [ ] Adicionar filtros avançados
- [ ] Implementar paginação
- [ ] Criar webhooks para notificações

---

## 📝 Notas Importantes

1. **Service Role Key**: Está sendo usado no servidor (seguro)
2. **Public Anon Key**: Está sendo usado no frontend (seguro)
3. **CORS**: Habilitado para todos os origins (ajustar em produção)
4. **Logs**: Todos os endpoints logam erros para debugging
5. **Códigos de OS**: Gerados automaticamente no formato `OS-YYYY-NNN`

---

**Documento mantido por:** Equipe de Desenvolvimento Minerva ERP  
**Última revisão:** 10/11/2024
