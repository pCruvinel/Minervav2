# 📋 SEMANA 2 - PLANO DETALHADO DE IMPLEMENTAÇÃO

**Data:** 20 de Novembro de 2025
**Status:** 🟠 Em Preparação
**Duração Estimada:** 30 horas
**Objetivo Principal:** Validações + Performance + UX Melhorado

---

## 📊 Visão Geral de SEMANA 2

```
SEMANA 2 (30h total)
├─ FASE 2.1: Validações Obrigatórias (15h)
│  ├─ Validação de Formulários (8h)
│  ├─ Validação de Horários (4h)
│  └─ Validação de Datas (3h)
├─ FASE 2.2: Performance Optimization (10h)
│  ├─ Lazy Loading (5h)
│  ├─ Code Splitting (3h)
│  └─ Memoization (2h)
└─ FASE 2.3: Melhorias UX (5h)
   ├─ Animações (2h)
   ├─ Skeleton Loading (2h)
   └─ Confirmações (1h)
```

---

## 🎯 FASE 2.1: VALIDAÇÕES OBRIGATÓRIAS (15h)

### Objetivo
Implementar validação completa em formulários e dados antes de enviar ao backend.

### 2.1.1 Validação de Formulários do Modal Criar Turno (8h)

**Arquivo Alvo:** `src/components/calendario/modal-criar-turno.tsx`

#### Validações Requeridas:

1. **Hora Início**
   - [x] Campo obrigatório
   - [ ] Formato HH:MM válido
   - [ ] Deve ser >= 08:00 (início operacional)
   - [ ] Deve ser < 18:00 (fim operacional)
   - [ ] Mensagem: "Horário de início deve ser entre 08:00 e 17:59"

2. **Hora Fim**
   - [x] Campo obrigatório
   - [ ] Formato HH:MM válido
   - [ ] Deve ser > Hora Início
   - [ ] Deve ser <= 18:00
   - [ ] Mensagem: "Horário de fim deve ser após o início e até 18:00"

3. **Data Início (quando aplicável)**
   - [ ] Se recorrência === 'custom':
     - Campo obrigatório
     - Deve ser data futura (>= hoje)
     - Formato YYYY-MM-DD

4. **Data Fim (quando aplicável)**
   - [ ] Se recorrência === 'custom':
     - Campo obrigatório
     - Deve ser >= Data Início
     - Deve ser <= Data Início + 30 dias

5. **Número de Vagas**
   - [x] Campo obrigatório
   - [ ] Deve ser número positivo (> 0)
   - [ ] Máximo 50 vagas (limite de segurança)
   - [ ] Mensagem: "Número de vagas deve ser entre 1 e 50"

6. **Setores**
   - [ ] Pelo menos um setor deve ser selecionado
   - [ ] Se "Todos os Setores" está marcado, ignora lista individual
   - [ ] Mensagem: "Selecione ao menos um setor"

#### Implementação:

```typescript
// Validar estado do form
const [errors, setErrors] = useState<Record<string, string>>({})

const validarFormulario = (): boolean => {
  const novoErros: Record<string, string> = {}

  // Validar horaInicio
  if (!horaInicio) {
    novoErros.horaInicio = "Hora de início é obrigatória"
  } else if (!/^\d{2}:\d{2}$/.test(horaInicio)) {
    novoErros.horaInicio = "Formato inválido (use HH:MM)"
  } else {
    const [horas, minutos] = horaInicio.split(':').map(Number)
    if (horas < 8 || horas >= 18) {
      novoErros.horaInicio = "Deve estar entre 08:00 e 17:59"
    }
  }

  // Validar horaFim
  if (!horaFim) {
    novoErros.horaFim = "Hora de fim é obrigatória"
  } else if (horaFim <= horaInicio) {
    novoErros.horaFim = "Deve ser após a hora de início"
  }

  // ... mais validações

  setErrors(novoErros)
  return Object.keys(novoErros).length === 0
}

// No submit, chamar validarFormulario()
const handleCriarTurno = async () => {
  if (!validarFormulario()) return
  // proceder com criação
}
```

#### Feedback Visual:

```tsx
<Input
  value={horaInicio}
  onChange={(e) => setHoraInicio(e.target.value)}
  placeholder="HH:MM"
  className={errors.horaInicio ? 'border-red-500' : ''}
/>
{errors.horaInicio && (
  <p className="text-sm text-red-500 mt-1">{errors.horaInicio}</p>
)}
```

---

### 2.1.2 Validação de Formulários do Modal Novo Agendamento (4h)

**Arquivo Alvo:** `src/components/calendario/modal-novo-agendamento.tsx`

#### Validações Requeridas:

1. **Categoria**
   - [ ] Campo obrigatório (select dropdown)
   - [ ] Deve estar na lista predefinida
   - [ ] Mensagem: "Selecione uma categoria"

2. **Setor**
   - [ ] Campo obrigatório (select dropdown)
   - [ ] Deve estar na lista predefinida
   - [ ] Mensagem: "Selecione um setor"

3. **Conflito de Agendamento**
   - [ ] Verificar se turno já está lotado
   - [ ] Verificar limite de agendamentos por slot
   - [ ] Mensagem: "Este turno está cheio"

#### Implementação Similar ao Modal Criar Turno

---

### 2.1.3 Validação de Horários (3h)

**Objetivo:** Validar regras de negócio para horários

#### Regras:

1. **Turnos não podem se sobrepor no mesmo dia**
   - [ ] Quando criando turno, verificar outros turnos do mesmo dia
   - [ ] Se sobrepõe, mostrar aviso
   - [ ] Query: `SELECT * FROM turnos WHERE data = ? AND NOT (horaFim <= ? OR horaInicio >= ?)`

2. **Turnos devem respeitar intervalos mínimos**
   - [ ] Duração mínima: 30 minutos
   - [ ] Duração máxima: 4 horas
   - [ ] Validação: `duracao >= 0.5 && duracao <= 4`

3. **Horários operacionais**
   - [ ] Início: 08:00
   - [ ] Fim: 18:00
   - [ ] Validação: `horaInicio >= 08:00 && horaFim <= 18:00`

---

## 🚀 FASE 2.2: PERFORMANCE OPTIMIZATION (10h)

### Objetivo
Otimizar rendering e reduzir bundle size

### 2.2.1 Lazy Loading de Componentes (5h)

**Implementação:**

```typescript
// src/components/calendario/index.ts
export { CalendarioPage } from './calendario-page'

// Lazy load dos componentes filhos
const CalendarioMes = lazy(() => import('./calendario-mes'))
const CalendarioSemana = lazy(() => import('./calendario-semana'))
const CalendarioDia = lazy(() => import('./calendario-dia'))

// No CalendarioPage
<Suspense fallback={<CalendarSkeleton />}>
  {visualizacao === 'mes' && <CalendarioMes ... />}
</Suspense>
```

**Benefícios:**
- Bundle size reduzido em ~30%
- Initial load mais rápido
- Lazy load sob demanda

### 2.2.2 Code Splitting de Modais (3h)

**Implementação:**

```typescript
const ModalCriarTurno = lazy(() => import('./modal-criar-turno'))
const ModalNovoAgendamento = lazy(() => import('./modal-novo-agendamento'))

<Suspense fallback={<div>Carregando...</div>}>
  <ModalCriarTurno open={modalCriarTurno} ... />
</Suspense>
```

### 2.2.3 Memoization Otimizada (2h)

**Implementação:**

```typescript
// Memoizar funções custosas
const calcularEstiloTurno = useMemo(
  () => (turno: TurnoComVagas) => { ... },
  []
)

// Memoizar componentes que recebem muitos props
const BlocoTurnoMemo = memo(BlocoTurno, (prev, next) => {
  return prev.turno.id === next.turno.id &&
         prev.turno.vagasOcupadas === next.turno.vagasOcupadas
})
```

---

## 🎨 FASE 2.3: MELHORIAS UX (5h)

### 2.3.1 Animações de Transição (2h)

**Implementação com Tailwind Animations:**

```tsx
// Modal open/close animation
<div className={`transition-all duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}>
  ...
</div>

// Turno hover effect
<div className="group cursor-pointer hover:scale-[1.02] transition-transform duration-200">
  ...
</div>
```

### 2.3.2 Skeleton Loading States (2h)

**Implementação:**

```tsx
// Criar componente SkeletonLoader
function SkeletonCalendario() {
  return (
    <div className="space-y-4">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  )
}

// Usar em loading state
{loading && <SkeletonCalendario />}
```

### 2.3.3 Confirmações Antes de Ações (1h)

**Implementação:**

```tsx
// Dialog de confirmação para ações destrutivas
const [confirmDelete, setConfirmDelete] = useState(false)

const handleDeleteTurno = async () => {
  if (!confirmDelete) {
    setConfirmDelete(true)
    return
  }

  // Proceder com delete
  await deletarTurno(turnoId)
  setConfirmDelete(false)
}
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### FASE 2.1: Validações

- [ ] Validação de Hora Início (formato, range)
- [ ] Validação de Hora Fim (> início, <= 18:00)
- [ ] Validação de Número de Vagas (1-50)
- [ ] Validação de Setores (pelo menos 1)
- [ ] Validação de Categoria (dropdown)
- [ ] Validação de Setor Agendamento (dropdown)
- [ ] Validação de Sobreposição de Horários
- [ ] Validação de Duração de Turno (30min-4h)
- [ ] Mensagens de Erro Claras
- [ ] Desabilitar Submit enquanto inválido

### FASE 2.2: Performance

- [ ] Lazy load componentes calendario-mes/semana/dia
- [ ] Lazy load modais
- [ ] Adicionar Suspense com fallback
- [ ] Memoizar funções custosas
- [ ] Memoizar componentes BlocoTurno
- [ ] Testar bundle size reduction
- [ ] Testar lazy loading em produção

### FASE 2.3: UX

- [ ] Animação de modal open/close
- [ ] Animação de turno hover
- [ ] Skeleton loading para calendário
- [ ] Confirmação de delete turno
- [ ] Confirmação de delete agendamento
- [ ] Toast messages melhorados
- [ ] Feedback visual em botões

---

## 🧪 TESTE & VALIDAÇÃO

### Performance Metrics

```
Antes de Optimizações:
- Bundle Size: 461 kB (gzip)
- Initial Load: 2.5s
- Lazy Load: N/A

Após Optimizações (Meta):
- Bundle Size: 320 kB (gzip) - 30% reduction
- Initial Load: 1.5s - 40% faster
- Lazy Load: Modal < 500ms
```

### Test Plan Updates

- [ ] Testar cada validação funciona
- [ ] Testar mensagens de erro aparecem
- [ ] Testar submit desabilitado quando inválido
- [ ] Testar performance (DevTools Lighthouse)
- [ ] Testar lazy loading (Network tab)
- [ ] Testar animações (suave, sem glitches)
- [ ] Testar skeleton loading UX

---

## 📊 TIMELINE SEMANA 2

```
Dia 21 (8h):
├─ FASE 2.1.1: Validação Modal Criar Turno
├─ FASE 2.1.2: Validação Modal Agendamento
└─ FASE 2.2.1: Lazy Loading Componentes

Dia 22 (8h):
├─ FASE 2.1.3: Validação de Horários
├─ FASE 2.2.2: Code Splitting Modais
└─ FASE 2.2.3: Memoization

Dia 23 (6h):
├─ FASE 2.3.1: Animações
├─ FASE 2.3.2: Skeleton Loading
├─ FASE 2.3.3: Confirmações
└─ Testes & Validação (2h)

Dia 24 (8h):
├─ Buffer & Ajustes (2h)
├─ Performance Testing (2h)
├─ Documentação (2h)
└─ Final Review (2h)
```

---

## 🚨 Riscos & Mitigação

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| Validação complexa demais | Média | Usar libs (Zod, Yup) |
| Lazy loading quebra UX | Baixa | Testar com Suspense |
| Performance gains pequenos | Baixa | Focar em componentes críticos |
| Animações causam flicker | Baixa | Testar em múltiplos navegadores |

---

## 📞 Referências

- Validação: Zod (recomendado) ou manual
- Performance: React DevTools Profiler
- Animações: Tailwind CSS (built-in)
- Skeleton: shadcn/ui skeleton component

---

**Plano criado em:** 20 de Novembro de 2025
**Próxima atualização:** Após completar FASE 2.1
**Status:** 🟠 PRONTO PARA COMEÇAR
