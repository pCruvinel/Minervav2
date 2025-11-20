# 📅 Sistema de Calendário - Documentação Completa

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Schema do Banco de Dados](#schema-do-banco-de-dados)
4. [Hooks e API](#hooks-e-api)
5. [Componentes](#componentes)
6. [Fluxo de Dados](#fluxo-de-dados)
7. [Segurança (RLS)](#segurança-rls)
8. [Como Usar](#como-usar)

---

## 🎯 Visão Geral

Sistema completo de agendamento com calendário para gerenciar turnos e agendamentos de vistorias/visitas.

### Funcionalidades Implementadas

- ✅ Criação de turnos com recorrência (todos os dias, dias úteis, datas personalizadas)
- ✅ Agendamento em turnos disponíveis
- ✅ Validação automática de conflitos e capacidade
- ✅ 3 visualizações: Mês, Semana, Dia
- ✅ Loading states e feedback visual
- ✅ Integração completa com Supabase
- ✅ RLS (Row Level Security) configurado
- ✅ Verificação de disponibilidade em tempo real

---

## 🏗️ Arquitetura

### Estrutura de Pastas

```
src/
├── components/
│   └── calendario/
│       ├── calendario-page.tsx         # Página principal
│       ├── calendario-semana.tsx       # Visualização semanal
│       ├── calendario-mes.tsx          # Visualização mensal
│       ├── calendario-dia.tsx          # Visualização diária
│       ├── bloco-turno.tsx            # Card de turno
│       ├── modal-criar-turno.tsx      # Modal de criação
│       └── modal-novo-agendamento.tsx # Modal de agendamento
├── lib/
│   └── hooks/
│       ├── use-turnos.ts              # Hook de turnos
│       └── use-agendamentos.ts        # Hook de agendamentos
supabase/
└── migrations/
    ├── create_calendario_tables.sql   # Schema completo
    └── seed_calendario_data.sql       # Dados de exemplo
```

---

## 🗄️ Schema do Banco de Dados

### Tabela: `turnos`

```sql
CREATE TABLE turnos (
  id UUID PRIMARY KEY,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  vagas_total INTEGER NOT NULL,
  setores TEXT[] NOT NULL,
  cor VARCHAR(7) NOT NULL,
  tipo_recorrencia VARCHAR(20) NOT NULL,
  data_inicio DATE,
  data_fim DATE,
  dias_semana INTEGER[],
  ativo BOOLEAN DEFAULT true,
  criado_por UUID REFERENCES auth.users(id),
  criado_em TIMESTAMP WITH TIME ZONE,
  atualizado_em TIMESTAMP WITH TIME ZONE
);
```

**Campos principais:**
- `tipo_recorrencia`: 'todos' | 'uteis' | 'custom'
- `setores`: Array com setores permitidos
- `cor`: Hex color para identificação visual

### Tabela: `agendamentos`

```sql
CREATE TABLE agendamentos (
  id UUID PRIMARY KEY,
  turno_id UUID REFERENCES turnos(id),
  data DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  duracao_horas INTEGER NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  setor VARCHAR(50) NOT NULL,
  solicitante_nome VARCHAR(200),
  solicitante_contato VARCHAR(50),
  solicitante_observacoes TEXT,
  os_id UUID REFERENCES ordens_servico(id),
  status VARCHAR(20) DEFAULT 'confirmado',
  criado_por UUID REFERENCES auth.users(id),
  criado_em TIMESTAMP WITH TIME ZONE,
  atualizado_em TIMESTAMP WITH TIME ZONE,
  cancelado_em TIMESTAMP WITH TIME ZONE,
  cancelado_motivo TEXT
);
```

**Status possíveis:**
- `confirmado`: Agendamento ativo
- `cancelado`: Cancelado pelo usuário
- `realizado`: Visita concluída
- `ausente`: Cliente não compareceu

### Funções SQL

#### `verificar_vagas_turno()`
Verifica se há vagas disponíveis em um turno para determinado horário.

```sql
SELECT verificar_vagas_turno(
  'turno-uuid',
  '2025-01-20',
  '09:00',
  '11:00'
);
-- Retorna: true/false
```

#### `obter_turnos_disponiveis()`
Retorna todos os turnos válidos para uma data com contagem de vagas.

```sql
SELECT * FROM obter_turnos_disponiveis('2025-01-20');
-- Retorna: turno_id, hora_inicio, hora_fim, vagas_total, vagas_ocupadas, setores, cor
```

---

## 🔌 Hooks e API

### `use-turnos.ts`

#### Hooks disponíveis:

```typescript
// Listar todos os turnos
const { turnos, loading, error, refetch } = useTurnos();

// Turnos de uma data específica
const { turnos, loading } = useTurnosPorData('2025-01-20');

// Turnos de uma semana
const { turnosPorDia, loading } = useTurnosPorSemana(
  '2025-01-20',
  '2025-01-24'
);

// Criar turno
const { mutate: criarTurno, loading } = useCreateTurno();
await criarTurno({
  horaInicio: '09:00',
  horaFim: '12:00',
  vagasTotal: 5,
  setores: ['Comercial', 'Obras'],
  cor: '#DBEAFE',
  tipoRecorrencia: 'uteis',
});

// Atualizar turno
const { mutate: atualizarTurno } = useUpdateTurno('turno-id');

// Deletar turno (soft delete)
const { mutate: deletarTurno } = useDeleteTurno();
```

### `use-agendamentos.ts`

#### Hooks disponíveis:

```typescript
// Listar agendamentos com filtros
const { agendamentos, loading } = useAgendamentos({
  data: '2025-01-20',
  status: 'confirmado',
  setor: 'Comercial',
});

// Agendamentos de uma data
const { agendamentos } = useAgendamentosPorData('2025-01-20');

// Criar agendamento
const { mutate: criarAgendamento } = useCreateAgendamento();
await criarAgendamento({
  turnoId: 'turno-uuid',
  data: '2025-01-20',
  horarioInicio: '09:00',
  horarioFim: '11:00',
  duracaoHoras: 2,
  categoria: 'Vistoria Inicial',
  setor: 'Comercial',
});

// Cancelar agendamento
const { mutate: cancelar } = useCancelarAgendamento();
await cancelar({
  id: 'agendamento-id',
  motivo: 'Cliente solicitou cancelamento',
});

// Marcar como realizado/ausente
const { mutate: marcarRealizado } = useMarcarRealizado();
const { mutate: marcarAusente } = useMarcarAusente();
```

---

## 🎨 Componentes

### CalendarioPage

Componente principal que gerencia navegação e visualização.

```tsx
<CalendarioPage />
```

**Props:** Nenhuma

**Estados:**
- `dataAtual`: Data selecionada
- `visualizacao`: 'mes' | 'semana' | 'dia'

### CalendarioSemana

Visualização semanal com turnos e agendamentos.

```tsx
<CalendarioSemana dataAtual={new Date()} />
```

**Funcionalidades:**
- Grid de 5 dias úteis (Seg-Sex)
- Horários de 8h às 18h
- Turnos posicionados por horário
- Click no turno abre modal de agendamento

### ModalCriarTurno

Modal para admin criar novos turnos.

```tsx
<ModalCriarTurno
  open={true}
  onClose={() => {}}
  onSuccess={() => refetch()}
/>
```

**Validações:**
- Horário de fim > horário de início
- Número de vagas > 0
- Pelo menos 1 setor selecionado
- Datas obrigatórias se recorrência = 'custom'

### ModalNovoAgendamento

Modal para criar agendamentos em turnos.

```tsx
<ModalNovoAgendamento
  open={true}
  onClose={() => {}}
  turno={turnoSelecionado}
  dia={new Date()}
  onSuccess={() => refetch()}
/>
```

**Validações:**
- Categoria obrigatória
- Setor deve estar permitido no turno
- Horário dentro do turno
- Verificação de disponibilidade
- Não ultrapassa horário de fim do turno

---

## 🔄 Fluxo de Dados

### 1. Criação de Turno

```mermaid
Usuário → ModalCriarTurno → useCreateTurno → Supabase
                                                  ↓
                                              RLS Check
                                                  ↓
                                            INSERT turnos
                                                  ↓
                                          Trigger timestamp
                                                  ↓
                                            Retorna turno
```

### 2. Criação de Agendamento

```mermaid
Usuário → ModalNovoAgendamento → Validações Locais
                                        ↓
                          verificar_vagas_turno()
                                        ↓
                              Disponível? (Sim)
                                        ↓
                            useCreateAgendamento
                                        ↓
                                    Supabase
                                        ↓
                                 INSERT agendamentos
```

### 3. Visualização de Semana

```mermaid
CalendarioSemana → useTurnosPorSemana → obter_turnos_disponiveis()
                                                  ↓
                   useAgendamentos → SELECT agendamentos
                                                  ↓
                          Combinar dados + Renderizar
```

---

## 🔒 Segurança (RLS)

### Políticas Implementadas

#### Turnos:
1. **SELECT**: Todos podem visualizar turnos ativos
2. **ALL**: Apenas admins podem criar/editar/deletar

#### Agendamentos:
1. **SELECT**: Todos podem visualizar agendamentos confirmados/realizados
2. **INSERT**: Usuários podem criar seus próprios agendamentos
3. **UPDATE**: Usuários podem gerenciar seus próprios agendamentos
4. **ALL**: Admins podem gerenciar todos os agendamentos

### Exemplo de Verificação

```sql
-- Verificar se usuário é admin
SELECT EXISTS (
  SELECT 1 FROM colaboradores
  WHERE id = auth.uid()
  AND tipo_colaborador IN ('admin', 'gestor_comercial')
);
```

---

## 🚀 Como Usar

### 1. Aplicar Migrations

Siga o guia em `apply-calendario-migration.md`

### 2. Acessar o Calendário

```typescript
// Em App.tsx ou roteador
import { CalendarioPage } from './components/calendario/calendario-page';

<Route path="/calendario" element={<CalendarioPage />} />
```

### 3. Criar um Turno

1. Clique em "Configurar Novo Turno"
2. Preencha horário, vagas, setores
3. Escolha recorrência
4. Selecione cor
5. Salvar

### 4. Fazer um Agendamento

1. Na visualização de semana, clique em um turno com vagas
2. Selecione categoria e setor
3. Escolha horário de início e duração
4. Confirmar

### 5. Visualizar Agendamentos

- **Mês**: Resumo visual com contadores
- **Semana**: Turnos detalhados por dia
- **Dia**: Visão completa de um único dia

---

## 📊 Dados de Exemplo (Seed)

Após aplicar o seed, você terá:

- 5 turnos pré-configurados
- 6 agendamentos de exemplo
- Diferentes horários e setores
- Status variados

---

## 🎯 Próximas Melhorias Sugeridas

1. **Notificações**
   - Email/WhatsApp de confirmação
   - Lembretes 1 dia antes

2. **Relatórios**
   - Taxa de ocupação por setor
   - Histórico de agendamentos

3. **Filtros Avançados**
   - Por setor, categoria, status
   - Busca por solicitante

4. **Exportação**
   - PDF com agendamentos do dia
   - Excel com relatórios

5. **Integração com OS**
   - Vincular agendamento à OS
   - Auto-criar OS após visita

---

## 📝 Notas Técnicas

### Performance

- Índices criados em colunas chave (turno_id, data, status)
- Queries otimizadas com LEFT JOIN
- Função SQL para evitar N+1 queries

### Validações

- Frontend: Imediato, UX melhor
- Backend: SQL functions, segurança

### Estados de Loading

Todos os componentes exibem loading states:
- Spinner durante fetch
- Botões desabilitados durante submit
- Skeleton screens (pode ser adicionado)

---

## 🐛 Troubleshooting

### Turnos não aparecem

1. Verifique se `ativo = true`
2. Verifique recorrência (uteis só Seg-Sex)
3. Cheque datas se recorrência = 'custom'

### Erro ao criar agendamento

1. Verifique se turno tem vagas
2. Confirme que setor está no array do turno
3. Horário deve estar dentro do turno

### RLS bloqueando operação

1. Verifique se usuário está autenticado
2. Confirme tipo_colaborador para operações admin
3. Cheque se auth.uid() corresponde ao criado_por

---

**Documentação criada em:** 2025-01-18
**Versão:** 1.0.0
**Autor:** Claude Code
