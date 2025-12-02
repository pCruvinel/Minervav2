# 📅 Calendário Custom - Planejamento Completo

## 🎯 Objetivo
Criar calendário semanal custom em React sem FullCalendar, com controle total sobre renderização e sem bugs de timezone.

---

## 🗄️ Schema do Banco (Existente)

### Tabela: `turnos`
```typescript
{
  id: UUID
  hora_inicio: TIME         // "08:00:00"
  hora_fim: TIME           // "12:00:00"
  vagas_total: INTEGER     // 5
  setores: TEXT[]          // ["assessoria", "obras"]
  cor: VARCHAR(7)          // "verde" | "verm" | "azul"
  tipo_recorrencia: TEXT   // "todos" | "uteis" | "custom"
  data_inicio: DATE        // null (se não custom)
  data_fim: DATE           // null (se não custom)
  dias_semana: INTEGER[]   // [1,2,3,4,5] (se custom)
  ativo: BOOLEAN           // true
}
```

### Tabela: `agendamentos`
```typescript
{
  id: UUID
  turno_id: UUID (FK turnos)
  data: DATE               // "2025-12-02"
  horario_inicio: TIME     // "09:00:00"
  horario_fim: TIME        // "11:00:00"
  duracao_horas: INTEGER   // 2
  categoria: TEXT          // "Vistoria Inicial"
  setor: TEXT              // "assessoria"
  status: TEXT             // "confirmado" | "cancelado" | "realizado"
  criado_por: UUID
}
```

---

## 🏗️ Arquitetura de Componentes

```
CalendarioPage
├── CalendarioHeader (Navegação semana)
├── CalendarioGrid (Visualização semanal)
│   ├── HorarioColumn (8h-18h, 1h cada)
│   └── DiaColumn × 7 (Dom-Sáb)
│       └── CelulaTurno (onClick abre modal)
└── Modals
    ├── ModalCriarTurno (Admin)
    ├── ModalEditarTurno (Admin)
    ├── ModalNovoAgendamento (Todos)
    └── ModalDetalhesAgendamento (Todos)
```

---

## 📦 Estrutura de Dados

### Interface: `TurnoProcessado`
```typescript
interface TurnoProcessado {
  id: string;
  horaInicio: string;      // "08:00"
  horaFim: string;         // "12:00"
  vagasTotal: number;
  vagasOcupadas: number;   // Calculado do agendamentos
  setores: string[];
  cor: 'verde' | 'verm' | 'azul';
  recorrencia: 'todos' | 'uteis' | 'custom';
}
```

### Interface: `CelulaData`
```typescript
interface CelulaData {
  data: string;            // "2025-12-02"
  hora: number;            // 9
  turno: TurnoProcessado | null;
  agendamentos: Agendamento[];
  podeAgendar: boolean;    // Baseado em permissões
}
```

---

## 🎨 Layout (CSS Grid)

```css
.calendario-grid {
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr); /* Horários + 7 dias */
  grid-template-rows: 40px repeat(10, 60px);  /* Header + 10 horas */
  gap: 1px;
  background: var(--border);
}

.celula {
  background: white;
  position: relative;
}

.celula.com-turno {
  background: var(--turno-color); /* Verde/Vermelho/Azul com 20% opacity */
  cursor: pointer;
}

.celula.sem-vagas {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## 🔄 Fluxos de Dados

### 1. Carregar Semana
```typescript
// Hook: useSemanaCalendario(dataInicio)
1. Calcular 7 dias da semana
2. Buscar turnos ativos (1 query)
3. Calcular recorrência no frontend
4. Buscar agendamentos da semana (1 query)
5. Combinar: turno + agendamentos por célula
```

### 2. Clicar em Célula
```typescript
onClick(celula: CelulaData) {
  // Validar permissões
  if (!ehAdmin && !celula.turno) {
    toast.error("Sem turno");
    return;
  }
  
  if (!ehAdmin && celula.turno.vagasOcupadas >= celula.turno.vagasTotal) {
    toast.error("Sem vagas");
    return;
  }
  
  // Abrir modal
  setModalAgendamento(celula);
}
```

### 3. Criar Agendamento
```typescript
// Payload
{
  turno_id: turno.id,
  data: "2025-12-02",
  horario_inicio: "09:00:00",
  horario_fim: "11:00:00",
  duracao_horas: 2,
  categoria: "Vistoria Inicial",
  setor: "assessoria"
}
```

---

## 🔒 Regras de Negócio

### Permissões
| Ação | Admin/Diretoria | Colaborador |
|------|----------------|-------------|
| Ver calendário | ✅ | ✅ |
| Criar turno | ✅ | ❌ |
| Editar turno | ✅ | ❌ |
| Deletar turno | ✅ | ❌ |
| Criar agendamento | ✅ Qualquer horário | ⚠️ Só com turno + vagas |

### Validações Criar Agendamento
```typescript
// Colaborador
1. Deve existir turno para o horário ✅
2. Turno deve ter vagas disponíveis ✅
3. Setor do colaborador deve estar no turno.setores ✅

// Admin
1. Nenhuma restrição (pode agendar em qualquer horário)
```

---

## 📁 Estrutura de Arquivos

```
src/components/calendario/
├── calendario-page.tsx              # Página principal
├── calendario-painel-page.tsx       # Painel admin
├── calendario-grid.tsx              # Grid semanal NOVO
├── calendario-header.tsx            # Navegação semana NOVO
├── celula-calendario.tsx            # Célula individual NOVO
├── modal-criar-turno.tsx            # ✅ Existente
├── modal-editar-turno.tsx           # ✅ Existente (modal-detalhes-turno)
├── modal-novo-agendamento.tsx       # ✅ Existente
└── modal-detalhes-agendamento.tsx   # ✅ Existente

src/lib/hooks/
├── use-turnos.ts                    # ✅ Melhorado
├── use-agendamentos.ts              # ✅ Existente
└── use-semana-calendario.ts         # NOVO (combina turnos + agendamentos)
```

---

## ⏱️ Estimativa de Tempo

| Tarefa | Tempo |
|--------|-------|
| CalendarioGrid (grid + células) | 1h |
| CalendarioHeader (navegação) | 30min |
| CelulaCalendario (interatividade) | 1h |
| useSemanaCalendario (lógica) | 1h |
| Integração + testes | 30min |
| **TOTAL** | **4h** |

---

## 🎨 Cores (Design System)

```typescript
// turnoColors (já existe em design-tokens.ts)
{
  verde: { bg: 'rgba(34, 197, 94, 0.2)', border: 'var(--success)' },
  verm: { bg: 'rgba(239, 68, 68, 0.2)', border: 'var(--destructive)' },
  azul: { bg: 'rgba(59, 130, 246, 0.2)', border: 'var(--info)' }
}
```

---

## ✅ Decisão

**Criar calendário custom?**
- ✅ Sim → Controle total, sem bugs
- ❌ Não → Continuar debugando FullCalendar

**Próximo passo:** Aguardo sua decisão.