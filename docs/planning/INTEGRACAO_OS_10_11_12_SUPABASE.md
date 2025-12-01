# Integração OS-10, OS-11, OS-12 com Supabase

## Status: ✅ Parcialmente Concluído

Data: 01/12/2025

---

## 1. Análise do Banco de Dados Supabase

### Projeto: MinervaV2
- **ID**: `zxfevlkssljndqqhxkjb`
- **Região**: sa-east-1
- **Status**: ACTIVE_HEALTHY

### Tabelas Disponíveis (22 tabelas)

| Tabela | Registros | Relevância |
|--------|-----------|------------|
| `centros_custo` | 17 | OS-10, OS-12 |
| `colaboradores` | 2 | OS-10 |
| `cargos` | 7 | OS-10 |
| `setores` | 4 | Todas |
| `clientes` | 1 | OS-11, OS-12 |
| `tipos_os` | 13 | Todas |
| `ordens_servico` | 15 | Todas |
| `os_etapas` | 210 | Todas |
| `turnos` | 4 | OS-11, OS-12 |
| `agendamentos` | 2 | OS-11, OS-12 |
| `os_documentos` | 0 | OS-11 |
| `delegacoes` | 0 | Futuro |
| `financeiro_lancamentos` | 0 | OS-12 |

### Edge Functions Ativas

1. **`server`** (v12) - API REST principal
2. **`generate-pdf`** (v7) - Geração de PDFs para laudos

---

## 2. Hook Centralizado Criado

### Arquivo: `src/lib/hooks/use-os-workflows.ts`

#### Hooks Disponíveis:

```typescript
// Centros de Custo
useCentrosCusto() → { centrosCusto, loading, error, refetch }

// Cargos
useCargos() → { cargos, loading, error, refetch }

// Colaboradores (com filtros)
useColaboradores(filters?) → { colaboradores, loading, error, refetch }

// Setores
useSetores() → { setores, loading, error, refetch }

// Tipos de OS
useTiposOS() → { tiposOS, loading, error, refetch }

// Turnos
useTurnos() → { turnos, loading, error, refetch }

// Criar OS com Etapas
useCreateOSWorkflow() → mutation function

// Upload de Documentos
useUploadDocumentoOS() → mutation function
```

#### Constantes Exportadas:

```typescript
FUNCOES_COLABORADOR   // 10 funções do sistema
TIPOS_CONTRATACAO     // CLT, PJ, Estágio
TURNOS_PADRAO         // Manhã, Tarde, Integral
SLAS_ASSESSORIA       // 4h, 8h, 24h, 48h, 72h
FREQUENCIAS_VISITA    // semanal, quinzenal, mensal, etc.
```

---

## 3. Componentes Atualizados

### OS-10: Requisição de Mão de Obra

| Componente | Status | Integração |
|------------|--------|------------|
| `step-abertura-solicitacao.tsx` | ✅ | Formulário estático |
| `step-selecao-centro-custo.tsx` | ✅ | **Integrado com `useCentrosCusto()`** |
| `step-selecao-colaborador.tsx` | ✅ | **Integrado com `useCargos()` e `FUNCOES_COLABORADOR`** |
| `step-detalhes-vaga.tsx` | ⏳ | Pendente (formulário estático por ora) |
| `step-requisicao-multipla.tsx` | ⏳ | Pendente |

### OS-11: Laudo Pontual

| Componente | Status | Integração |
|------------|--------|------------|
| `step-cadastro-cliente.tsx` | ⏳ | Usar `useClientes`, `useCreateCliente` |
| `step-agendar-visita.tsx` | ⏳ | Usar `useAgendamentos`, `useTurnos` |
| `step-realizar-visita.tsx` | ⏳ | Formulário |
| `step-anexar-rt.tsx` | ⏳ | Usar `useUploadDocumentoOS` |
| `step-gerar-documento.tsx` | ⏳ | Usar `usePDFGeneration` |
| `step-enviar-cliente.tsx` | ⏳ | Envio de email/WhatsApp |

### OS-12: Assessoria Recorrente

| Componente | Status | Integração |
|------------|--------|------------|
| `step-cadastro-cliente-contrato.tsx` | ⏳ | Usar `useClientes` |
| `step-definicao-sla.tsx` | ⏳ | Usar `SLAS_ASSESSORIA` |
| `step-setup-recorrencia.tsx` | ⏳ | Usar `FREQUENCIAS_VISITA` |
| `step-alocacao-equipe.tsx` | ⏳ | Usar `useColaboradores` |
| `step-config-calendario.tsx` | ⏳ | Usar `useTurnos`, `useAgendamentos` |
| `step-inicio-servicos.tsx` | ⏳ | Criar OS |

---

## 4. Hooks Existentes Reutilizados

Esses hooks já existiam no projeto e serão reutilizados:

- `use-clientes.tsx` - CRUD de clientes
- `use-agendamentos.ts` - Agendamentos e turnos
- `use-pdf-generation.ts` - Geração de PDFs via Edge Function
- `use-ordens-servico.ts` - CRUD de ordens de serviço
- `use-centro-custo.ts` - Geração de centro de custo (RPC)

---

## 5. Próximos Passos

### Prioridade Alta
1. [ ] Integrar `step-detalhes-vaga.tsx` com dados de cargos/setores
2. [ ] Integrar OS-11 steps com hooks existentes
3. [ ] Testar criação de OS completa via `useCreateOSWorkflow`

### Prioridade Média
4. [ ] Integrar OS-12 steps com hooks
5. [ ] Configurar upload de documentos para Storage
6. [ ] Testar geração de PDF via Edge Function

### Prioridade Baixa
7. [ ] Adicionar validações de formulário com react-hook-form
8. [ ] Implementar feedback visual de progresso
9. [ ] Adicionar testes unitários para hooks

---

## 6. Resumo da Arquitetura de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────┤
│  Hooks Centralizados:                                        │
│  ├── use-os-workflows.ts (NOVO)                             │
│  ├── use-clientes.tsx                                       │
│  ├── use-agendamentos.ts                                    │
│  ├── use-pdf-generation.ts                                  │
│  └── use-ordens-servico.ts                                  │
├─────────────────────────────────────────────────────────────┤
│                    SUPABASE                                  │
├─────────────────────────────────────────────────────────────┤
│  Edge Functions:                                             │
│  ├── server (API REST)                                      │
│  └── generate-pdf (PDFs)                                    │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL:                                                 │
│  ├── ordens_servico                                         │
│  ├── os_etapas                                              │
│  ├── clientes                                               │
│  ├── colaboradores                                          │
│  ├── centros_custo                                          │
│  ├── agendamentos                                           │
│  └── os_documentos                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Código de Exemplo

### Usando useCentrosCusto em um componente:

```tsx
import { useCentrosCusto } from '@/lib/hooks/use-os-workflows';

function MeuComponente() {
  const { centrosCusto, loading, error } = useCentrosCusto();
  
  if (loading) return <Loader />;
  if (error) return <ErrorMessage />;
  
  return (
    <Select>
      {centrosCusto.map(cc => (
        <SelectItem key={cc.id} value={cc.id}>
          {cc.nome}
        </SelectItem>
      ))}
    </Select>
  );
}
```

### Criando uma OS completa:

```tsx
import { useCreateOSWorkflow } from '@/lib/hooks/use-os-workflows';

function CriarOS() {
  const { mutate, loading } = useCreateOSWorkflow();
  
  const handleSubmit = async () => {
    await mutate({
      tipoOSCodigo: 'OS-10',
      clienteId: 'uuid-cliente',
      ccId: 'uuid-centro-custo',
      responsavelId: null,
      descricao: 'Requisição de mão de obra',
      metadata: { urgente: true },
      etapas: [
        { nome_etapa: 'Abertura', ordem: 1 },
        { nome_etapa: 'Seleção CC', ordem: 2 },
        { nome_etapa: 'Seleção Colaborador', ordem: 3 },
      ]
    });
  };
}