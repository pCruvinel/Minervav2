# 🎨 SEMANA 2 - FASE 2.3: Melhorias UX - PLANO DETALHADO

**Data:** 20 de Novembro de 2025
**Tempo Estimado:** 5 horas
**Status:** Planejado

---

## 🎯 Objetivo Geral

Melhorar experiência do usuário através de:
1. **Animações de Transição** - Modal fade in/out, período slide
2. **Skeleton Loading** - Placeholder durante carregamento
3. **Confirmações** - Modal antes de ações destrutivas
4. **Feedback Visual** - Melhor resposta visual ao usuário

---

## 📋 Tarefas FASE 2.3

### TAREFA 2.3.1: Animações de Transição (2h)

**Objetivo:** Adicionar transições suaves aos componentes

#### 1. Modal Fade In/Out

**Usar:** `tailwindcss` com `transition` classes

```typescript
// Modal com animação
<div
  className={`
    transition-all duration-200
    ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
  `}
>
  {/* Modal content */}
</div>
```

**Arquivo:** `src/components/ui/dialog.tsx` ou wrapper

#### 2. Período Slide

**Descrição:** Transição suave ao navegar entre períodos

```typescript
// Ao mudar período
<div
  className={`
    transition-all duration-300
    ${isChanging ? 'opacity-50 translate-x-4' : 'opacity-100 translate-x-0'}
  `}
>
  {/* Conteúdo do calendário */}
</div>
```

**Arquivo:** `calendario-page.tsx`

#### 3. Loading Spinner Animado

**Usar:** Framer Motion ou CSS keyframes

```css
@keyframes spin-smooth {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin-smooth {
  animation: spin-smooth 1s linear infinite;
}
```

**Arquivo:** CSS global ou `tailwind.config.js`

**Benefícios:**
- ✅ Transições suaves melhoram UX
- ✅ Feedback visual claro
- ✅ Sem sobrecarregar o navegador

---

### TAREFA 2.3.2: Skeleton Loading (2h)

**Objetivo:** Mostrar placeholder enquanto dados carregam

#### 1. Skeleton Component

```typescript
// src/components/ui/skeleton.tsx
export function Skeleton() {
  return (
    <div className="animate-pulse rounded-lg bg-neutral-200 h-12 w-full" />
  );
}
```

#### 2. Skeleton para Turno

```typescript
// Mientras cargando
{loading ? (
  <div className="space-y-2">
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-16 w-full" />
  </div>
) : (
  // Conteúdo real
)}
```

**Arquivos a modificar:**
- `calendario-semana.tsx` - Skeleton grid de turnos
- `calendario-dia.tsx` - Skeleton coluna de turnos
- `calendario-mes.tsx` - Skeleton grid de dias

#### 3. Skeleton Pattern

**CSS Animation:**
```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #e0e0e0 50%,
    #f0f0f0 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

**Benefícios:**
- ✅ Melhora percepção de velocidade
- ✅ Feedback visual durante carregamento
- ✅ Menos sensação de congelamento

---

### TAREFA 2.3.3: Confirmações e Undo (1h)

**Objetivo:** Evitar ações destrutivas não intencionais

#### 1. Confirmação para Deletar

```typescript
// Modal de confirmação
<AlertDialog>
  <AlertDialogTrigger>Deletar</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta ação não pode ser desfeita
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Deletar
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Arquivo:** Componente que faz delete

#### 2. Toast com Undo

```typescript
// Toast com ação de undo
toast.success('Agendamento criado', {
  action: {
    label: 'Desfazer',
    onClick: () => {
      // Chamar API para deletar
      deleteAgendamento(id);
      toast.success('Agendamento desfeito');
    }
  },
  duration: 5000 // 5 segundos para fazer undo
});
```

**Usar:** `sonner` toast library (já instalada)

**Arquivo:** `calendario-dia.tsx`, `calendario-semana.tsx`

**Benefícios:**
- ✅ Evita erros do usuário
- ✅ Permite desfazer ações
- ✅ Melhor confiança

---

## 📊 Métricas Esperadas

### UX Improvements
```
- Transições: 200-300ms (imperceptível)
- Skeleton: Melhora percepção em ~30%
- Confirmações: 0 ações acidentais
- Undo window: 5 segundos
```

### DevTools Metrics (esperado)
```
- FCP (First Contentful Paint): -50ms
- LCP (Largest Contentful Paint): -100ms
- CLS (Cumulative Layout Shift): -0.1
- TTI (Time to Interactive): -100ms
```

---

## 🎨 Design System

### Colors (Tauri Colors)
```
- Primary: #2563eb (blue-600)
- Success: #16a34a (green-600)
- Warning: #ea580c (orange-600)
- Danger: #dc2626 (red-600)
- Neutral: #737373 (neutral-600)
```

### Transitions
```
- Fast: 150ms (hover states)
- Normal: 300ms (modal)
- Slow: 500ms (page load)
```

### Z-Index
```
- Modal: 1000
- Toast: 1100
- Tooltip: 1050
```

---

## ✅ Checklist de Conclusão

### Tarefa 2.3.1: Animações
- [ ] Modal fade in/out (200ms)
- [ ] Período slide transição (300ms)
- [ ] Loading spinner animado
- [ ] Sem lag em animações
- [ ] Smooth em 60fps

### Tarefa 2.3.2: Skeleton
- [ ] Skeleton component criado
- [ ] Skeleton para turno implementado
- [ ] Skeleton para calendário implementado
- [ ] Animação shimmer funcionando
- [ ] Fallback para sem dados

### Tarefa 2.3.3: Confirmações
- [ ] Modal de confirmação implementado
- [ ] Toast com undo implementado
- [ ] 5 segundos de janela
- [ ] Undo API chamada corretamente
- [ ] Feedback visual após undo

### Geral
- [ ] Build sem erros
- [ ] Testes visuais completos
- [ ] Performance validada
- [ ] Commits bem documentados

---

## 📝 Commits Esperados

1. `feat: Adicionar animações de transição (SEMANA 2 - FASE 2.3.1)`
2. `feat: Implementar skeleton loading (SEMANA 2 - FASE 2.3.2)`
3. `feat: Adicionar confirmações e undo (SEMANA 2 - FASE 2.3.3)`

---

## 🎓 Recursos & Referências

### Animações
- Tailwind CSS transitions: https://tailwindcss.com/docs/transition
- Framer Motion: https://www.framer.com/motion/
- CSS Animations: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations

### Skeleton Loading
- Skeleton UI concept: https://www.nngroup.com/articles/skeleton-screens/
- Tailwind animate-pulse: https://tailwindcss.com/docs/animation#pulse

### Confirmations
- Alert Dialog: https://radix-ui.com/docs/primitives/components/alert-dialog
- Toast notifications: https://sonner.emilkowal.ski/

---

## 🚀 Timeline Estimado

```
TAREFA 2.3.1: 2h
├─ Fade in/out: 30min
├─ Slide transition: 45min
└─ Spinner animado: 45min

TAREFA 2.3.2: 2h
├─ Skeleton component: 30min
├─ Integração turno: 45min
└─ Integração calendário: 45min

TAREFA 2.3.3: 1h
├─ Confirmação: 30min
└─ Undo toast: 30min

TOTAL: 5h (conforme estimado)
```

---

## 💡 Notas de Implementação

### Performance
- Usar `will-change` com cuidado
- CSS animations melhor que JS
- Memoizar componentes animados
- Testar em dispositivos lentos

### Accessibility
- Respeitar `prefers-reduced-motion`
- Manter focus visible
- Acessibilidade de teclado
- Screen reader support

### Browser Support
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

---

**Plano criado em:** 20 de Novembro de 2025
**Status:** 🟠 Pronto para implementação após FASE 2.2
**Próximo:** Iniciar FASE 2.3 - Melhorias UX
