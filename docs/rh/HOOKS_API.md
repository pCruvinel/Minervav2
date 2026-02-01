# 🔧 API de Hooks - Módulo RH

> **Última Atualização:** 28/01/2026  
> **Localização:** `src/lib/hooks/`

---

## 📊 Visão Geral

| Hook | Finalidade | Arquivo |
|------|------------|---------|
| `useColaboradores` | Lista colaboradores com filtros | use-os-workflows.ts |
| `useCargos` | Lista cargos disponíveis | use-os-workflows.ts |
| `useSetores` | Lista setores | use-os-workflows.ts |
| `useTurnos` | CRUD de turnos | use-turnos.ts |
| `useAgendamentos` | CRUD de agendamentos | use-agendamentos.ts |
| `useRequisicoesMaoDeObra` | Lista OS-10 com vagas | use-recrutamento.ts |
| `useCustoMODetalhado` | Custo de MO por OS/CC | use-custo-mo.ts |
| `useColaboradoresSetor` | Colaboradores por setor | use-colaboradores-setor.ts |

---

## 🔄 Hook Centralizado: `use-os-workflows.ts`

O hook principal para dados de RH nas workflows de OS.

### Import

```typescript
import { 
  useCentrosCusto,
  useCargos,
  useColaboradores,
  useSetores,
  useTurnos,
  useCreateOSWorkflow,
  useUploadDocumentoOS
} from '@/lib/hooks/use-os-workflows';
```

### `useCentrosCusto()`

Retorna lista de centros de custo ativos.

```typescript
const { centrosCusto, loading, error, refetch } = useCentrosCusto();

// Tipo retornado
interface CentroCusto {
  id: string;
  nome: string;
  valor_global: number;
  cliente_id: string | null;
  ativo: boolean;
  tipo_os_id: string | null;
  descricao: string | null;
  cliente?: { nome_razao_social: string };
}
```

### `useCargos()`

Lista cargos para seleção em formulários.

```typescript
const { cargos, loading, error, refetch } = useCargos();

// Tipo retornado
interface Cargo {
  id: string;
  nome: string;
  slug: string;
  nivel_acesso: number;
  descricao: string | null;
  ativo: boolean;
}
```

### `useColaboradores(filters?)`

Lista colaboradores com filtros opcionais.

```typescript
const { colaboradores, loading, error, refetch } = useColaboradores({
  setor_id: 'uuid',
  cargo_id: 'uuid',
  funcao: 'coord_obras',
  ativo: true
});

// Tipo retornado
interface Colaborador {
  id: string;
  nome_completo: string;
  email: string;
  cpf: string | null;
  telefone: string | null;
  cargo_id: string | null;
  setor_id: string | null;
  ativo: boolean;
  funcao: string | null;
  tipo_contratacao: 'CLT' | 'PJ' | 'ESTAGIO' | null;
  avatar_url: string | null;
  cargo?: Cargo;
  setor?: { id: string; nome: string; slug: string };
}
```

### `useSetores()`

Lista setores da empresa.

```typescript
const { setores, loading, error, refetch } = useSetores();

// Tipo retornado
interface Setor {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  ativo: boolean;
}
```

### `useCreateOSWorkflow()`

Cria OS completa com etapas.

```typescript
const { createOS, loading, error } = useCreateOSWorkflow();

// Uso
const result = await createOS({
  tipoOSCodigo: 'OS-10',
  clienteId: 'uuid',
  ccId: 'uuid',
  responsavelId: 'uuid',
  descricao: 'Descrição da OS',
  metadata: { ... },
  etapas: [
    { nome_etapa: 'Abertura', ordem: 1 },
    { nome_etapa: 'Vagas', ordem: 2 }
  ]
});
```

---

## 📅 Hook de Turnos: `use-turnos.ts`

### Import

```typescript
import {
  useTurnos,
  useTurnosPorData,
  useTurnosPorSemana,
  useCreateTurno,
  useUpdateTurno,
  useDeleteTurno,
  useVerificarDisponibilidade,
  turnosAPI
} from '@/lib/hooks/use-turnos';
```

### `useTurnos()`

Lista todos os turnos ativos.

```typescript
const { turnos, loading, error, refetch } = useTurnos();

// Tipo retornado
interface Turno {
  id: string;
  horaInicio: string;
  horaFim: string;
  vagasTotal: number;
  vagasPorSetor: VagasPorSetor;
  setores: string[];
  cor: string;
  tipoRecorrencia: 'uteis' | 'recorrente' | 'custom';
  dataInicio?: string;
  dataFim?: string;
  diasSemana?: number[];
  ativo: boolean;
}
```

### `useTurnosPorData(data: string)`

Turnos disponíveis para uma data específica com vagas ocupadas.

```typescript
const { turnos, loading, refetch } = useTurnosPorData('2026-01-28');

// Tipo retornado (inclui ocupação)
interface TurnoComVagas extends Turno {
  vagasOcupadas: number;
  capacidadePorSetor?: {
    setor: string;
    vagasTotal: number;
    vagasOcupadas: number;
    vagasDisponiveis: number;
  }[];
}
```

### `useCreateTurno()`

Cria novo turno.

```typescript
const { create, loading, error } = useCreateTurno();

await create({
  horaInicio: '08:00',
  horaFim: '12:00',
  vagasTotal: 10,
  setores: ['obras', 'assessoria'],
  cor: '#3b82f6',
  tipoRecorrencia: 'uteis'
});
```

---

## 📆 Hook de Agendamentos: `use-agendamentos.ts`

### Import

```typescript
import {
  useAgendamentos,
  useAgendamentosPorData,
  useAgendamento,
  useCreateAgendamento,
  useUpdateAgendamento,
  useCancelAgendamento,
  useMarcarAgendamentoRealizado,
  agendamentosAPI
} from '@/lib/hooks/use-agendamentos';
```

### `useAgendamentos(filters?)`

Lista agendamentos com filtros.

```typescript
const { agendamentos, loading, refetch } = useAgendamentos({
  turnoId: 'uuid',
  data: '2026-01-28',
  status: 'confirmado',
  setor: 'obras',
  osId: 'uuid'
});

// Tipo retornado
interface AgendamentoComTurno extends Agendamento {
  turno?: {
    horaInicio: string;
    horaFim: string;
    cor: string;
    setores: string[];
  };
  colaborador?: { nome_completo?: string };
  os?: {
    codigo_os?: string;
    status_geral?: string;
    cliente?: { nome_razao_social?: string };
  };
}
```

### `useCreateAgendamento()`

Cria novo agendamento.

```typescript
const { create, loading } = useCreateAgendamento();

await create({
  turnoId: 'uuid',
  data: '2026-01-28',
  horarioInicio: '08:00',
  horarioFim: '12:00',
  duracaoHoras: 4,
  categoria: 'vistoria',
  setor: 'assessoria',
  osId: 'uuid',
  responsavelId: 'uuid'
});
```

---

## 👥 Hook de Recrutamento: `use-recrutamento.ts`

### Import

```typescript
import {
  useRequisicoesMaoDeObra,
  useUpdateVagaStatus,
  useUpdateOSStatus,
  recrutamentoAPI
} from '@/lib/hooks/use-recrutamento';
```

### `useRequisicoesMaoDeObra()`

Lista requisições de mão de obra (OS-10) com vagas para o Kanban.

```typescript
const { requisicoes, loading, error, refetch } = useRequisicoesMaoDeObra();

// Tipo retornado
interface RequisicaoMaoDeObra {
  id: string;
  codigo_os: string;
  status_geral: string;
  descricao: string;
  data_entrada: string;
  cc_id: string | null;
  centro_custo: { id: string; nome: string } | null;
  solicitante: { id: string; nome_completo: string; avatar_url: string | null } | null;
  vagas: VagaRecrutamento[];
  total_vagas: number;
  kanban_status: 'pendente_aprovacao' | 'em_divulgacao' | 'entrevistas' | 'finalizado';
}
```

### `useUpdateVagaStatus()`

Atualiza status de uma vaga no Kanban.

```typescript
const { mutate: updateStatus, loading } = useUpdateVagaStatus();

await updateStatus({
  vagaId: 'uuid',
  status: 'em_selecao' // 'aberta' | 'em_selecao' | 'preenchida' | 'cancelada'
});
```

---

## 💰 Hook de Custo de MO: `use-custo-mo.ts`

### Import

```typescript
import {
  useCustoMODetalhado,
  useCustoMOPorCC,
  useCustoMOPorColaborador,
  useCustoMOKPIs
} from '@/lib/hooks/use-custo-mo';
```

### `useCustoMODetalhado(options?)`

Custo detalhado por OS.

```typescript
const { data: custos } = useCustoMODetalhado({
  osId: 'uuid',
  ccId: 'uuid',
  periodo: { inicio: '2026-01-01', fim: '2026-01-31' }
});

// Tipo retornado
interface CustoMODetalhado {
  os_id: string;
  cc_id: string;
  cc_nome: string;
  colaborador_id: string;
  colaborador_nome: string;
  salario_base: number;
  data_trabalho: string;
  status_presenca: string;
  percentual_alocado: number;
  custo_alocado: number;
}
```

### `useCustoMOPorCC(options?)`

Custo agrupado por Centro de Custo.

```typescript
const { data: custoPorCC } = useCustoMOPorCC({
  periodo: { inicio: '2026-01-01', fim: '2026-01-31' }
});

// Tipo retornado
interface CustoMOPorCC {
  cc_id: string;
  cc_nome: string;
  custo_total: number;
  alocacoes: number;
  colaboradores_distintos: number;
  percentual: number;
}
```

### `useCustoMOKPIs(options?)`

KPIs agregados para dashboards.

```typescript
const kpis = useCustoMOKPIs({ 
  periodo: { inicio: '2026-01-01', fim: '2026-01-31' } 
});

// Retorna
{
  custoTotal: number,
  custoDiaMedio: number,
  totalAlocacoes: number,
  ccsAtivos: number,
  colaboradoresAtivos: number,
  custosPorCC: CustoMOPorCC[],
  custosPorColaborador: CustoMOPorColaborador[]
}
```

---

## 👤 Hooks Auxiliares

### `use-colaboradores-setor.ts`

```typescript
import { useColaboradoresSetor } from '@/lib/hooks/use-colaboradores-setor';

const { colaboradores, loading } = useColaboradoresSetor(setorId);
```

### `use-setores.ts`

```typescript
import { useSetores } from '@/lib/hooks/use-setores';

const { setores, loading } = useSetores();
```

---

## 📚 Constantes Relacionadas

```typescript
// src/lib/constants/colaboradores.ts

export const FUNCOES_COLABORADOR = [
  { value: 'admin', label: 'Admin', setor: 'ti', nivel: 10 },
  { value: 'diretor', label: 'Diretor', setor: 'diretoria', nivel: 9 },
  { value: 'coord_administrativo', label: 'Coord. Admin', setor: 'administrativo', nivel: 6 },
  { value: 'coord_assessoria', label: 'Coord. Assessoria', setor: 'assessoria', nivel: 5 },
  { value: 'coord_obras', label: 'Coord. Obras', setor: 'obras', nivel: 5 },
  // ... mais funções
];

export const TIPOS_CONTRATACAO = ['CLT', 'PJ', 'ESTAGIO'];

export const DOCUMENTOS_OBRIGATORIOS = [
  { value: 'RG', label: 'RG', categoria: 'pessoal' },
  { value: 'CPF', label: 'CPF', categoria: 'pessoal' },
  { value: 'CTPS', label: 'Carteira de Trabalho', categoria: 'clt' },
  // ... 26 tipos no total
];
```

---

*Documentação gerada em 28/01/2026.*
