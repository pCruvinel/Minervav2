# 🚀 SEMANA 2 - FASE 2.2: Performance Optimization - PLANO DETALHADO

**Data:** 20 de Novembro de 2025
**Tempo Estimado:** 10 horas
**Status:** Planejado

---

## 🎯 Objetivo Geral

Otimizar performance da aplicação através de:
1. **Code Splitting** - Dividir bundle em chunks menores
2. **Lazy Loading** - Carregar componentes sob demanda
3. **Memoization** - Evitar re-renders desnecessários
4. **Bundle Analysis** - Identificar gargalos

---

## 📊 Situação Atual (Build Metrics)

```
Current Bundle Size:
- Total JS: 1,797.03 kB (gzip: 462.56 kB)
- CSS: 127.76 kB (gzip: 22.84 kB)
- Images: 452.85 kB

⚠️ Issue: Chunk > 500 kB (recomendação: < 500 kB)
```

---

## 🔍 Análise de Dependências Críticas

### High-Impact Components

1. **Calendário** (~150 kB)
   - 7 componentes de calendário
   - 2 modais (criar turno, novo agendamento)
   - Só usado em `/calendario`

2. **Ordem de Serviço** (~200 kB)
   - 15+ componentes OS
   - 8+ modais
   - Usado em múltiplas rotas

3. **Supabase Client** (~80 kB)
   - Carregado globalmente
   - Todas as requisições dependem
   - **Não pode ser lazy loaded**

4. **UI Components** (~50 kB)
   - Button, Input, Dialog, etc.
   - Distribuído entre vários componentes
   - Otimizável com tree-shaking

---

## 📋 Tarefas FASE 2.2

### TAREFA 2.2.1: Lazy Load Modais de Calendário (3h)

**Objetivo:** Carregar modais só quando abertos

**Componentes a otimizar:**
- `ModalCriarTurno`
- `ModalNovoAgendamento`

**Implementação:**

```typescript
// Antes
import { ModalCriarTurno } from './modal-criar-turno';

// Depois - Lazy
const ModalCriarTurno = lazy(() => import('./modal-criar-turno'));

// Componente
<Suspense fallback={null}>
  <ModalCriarTurno open={open} onClose={...} />
</Suspense>
```

**Benefícios:**
- ✅ Reduz bundle inicial em ~30 kB
- ✅ Modais carregam à primeira abertura
- ✅ Transição suave com Suspense

**Arquivo a modificar:**
- `src/components/calendario/calendario-page.tsx`

**Passos:**
1. Importar `lazy` e `Suspense` de React
2. Converter imports de modais para `lazy()`
3. Envolver em `<Suspense fallback={null}>`
4. Testar que modais abrem normalmente

**Teste:**
```bash
# Chrome DevTools > Network > Chunk size
# Verificar se novo chunk gerado para modal (~30kB)
npm run build
# Verificar tamanho dos chunks
```

---

### TAREFA 2.2.2: Code Splitting de Rotas (4h)

**Objetivo:** Lazy load páginas inteiras por rota

**Rotas a otimizar:**
- `/calendario` - 150 kB
- `/gestores` - 100 kB
- `/comercial` - 100 kB
- `/admin` - 80 kB

**Implementação:**

```typescript
// src/App.tsx - Antes
import CalendarioPage from './pages/calendario-page';

// Depois - Code Split
const CalendarioPage = lazy(() => import('./pages/calendario-page'));

// Router
<Route path="/calendario" element={<Suspense fallback={<LoadingFallback />}><CalendarioPage /></Suspense>} />
```

**Benefício:**
- ✅ Bundle inicial reduzido em ~40%
- ✅ Cada página carrega só quando acessada
- ✅ Melhor perceived performance

**Arquivo a modificar:**
- `src/App.tsx`

**LoadingFallback:**
```typescript
function LoadingFallback() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Spinner />
    </div>
  );
}
```

**Passos:**
1. Identificar todas rotas principais
2. Converter em lazy imports
3. Criar LoadingFallback component
4. Envolver rotas em Suspense
5. Testar navegação

**Teste:**
```bash
npm run build
# Verificar se novos chunks criados
# Chunk size deve reduzir drasticamente
```

---

### TAREFA 2.2.3: Memoization de Componentes (2h)

**Objetivo:** Evitar re-renders desnecessários

**Componentes a otimizar:**

1. **BlocoTurno**
   ```typescript
   export const BlocoTurno = memo(function BlocoTurno(props) {
     // ...
   }, (prev, next) => {
     // Custom comparison se needed
     return prev.turno.id === next.turno.id &&
            prev.turno.vagasOcupadas === next.turno.vagasOcupadas;
   });
   ```

2. **CalendarioSemana**
   ```typescript
   export const CalendarioSemana = memo(CalendarioSemanaComponent);
   ```

3. **CalendarioMes**
   ```typescript
   export const CalendarioMes = memo(CalendarioMesComponent);
   ```

**Arquivo a modificar:**
- `src/components/calendario/bloco-turno.tsx`
- `src/components/calendario/calendario-semana.tsx`
- `src/components/calendario/calendario-mes.tsx`

**Passos:**
1. Importar `memo` de React
2. Envolver componentes em `memo()`
3. Adicionar comparadores se necessário
4. Testar rendering

**Teste:**
```bash
# Chrome DevTools > React DevTools
# Ativar "Highlight updates when components render"
# Navegar no calendário - não deve rerender BlocoTurno desnecessariamente
```

---

### TAREFA 2.2.4: useCallback para Handlers (1h)

**Objetivo:** Manter referências de função estáveis

**Funções a otimizar em calendario-page.tsx:**

```typescript
// Antes
const handleRefetch = () => {
  refetch();
  refetchAgendamentos();
};

// Depois
const handleRefetch = useCallback(() => {
  refetch();
  refetchAgendamentos();
}, [refetch, refetchAgendamentos]);
```

**Arquivo a modificar:**
- `src/components/calendario/calendario-page.tsx`

**Passos:**
1. Importar `useCallback` de React
2. Envolver handlers em useCallback
3. Incluir dependências corretas
4. Testar que callbacks funcionam

---

## 📈 Métricas Esperadas

### Antes (Current)
```
- Bundle size: 1,797 kB
- Initial JS: ~1.2 MB
- Time to Interactive: ~4.5s
- Chrome DevTools: 2 chunks
```

### Depois (Target)
```
- Bundle size: ~1,400 kB (-22%)
- Initial JS: ~600 kB (-50%)
- Time to Interactive: ~2.5s (-45%)
- Chrome DevTools: 6-8 chunks
```

---

## 🔧 Arquivo de Configuração: vite.config.ts

**Considerar adicionar:**

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['@radix-ui/...'],
          'calendar': ['src/components/calendario'],
          'supabase': ['@supabase/supabase-js'],
        }
      }
    },
    chunkSizeWarningLimit: 600 // Aumentar temporariamente para validar
  }
});
```

---

## ✅ Checklist de Conclusão

### Tarefa 2.2.1: Lazy Load Modais
- [ ] Imports convertidos para lazy
- [ ] Suspense implementado
- [ ] Modal abre normalmente
- [ ] Novo chunk criado no build
- [ ] Sem console errors

### Tarefa 2.2.2: Code Splitting de Rotas
- [ ] Todas rotas em lazy imports
- [ ] LoadingFallback criado
- [ ] Navegação funciona
- [ ] 6+ chunks criados
- [ ] Bundle inicial reduzido

### Tarefa 2.2.3: Memoization
- [ ] BlocoTurno em memo
- [ ] CalendarioSemana em memo
- [ ] CalendarioMes em memo
- [ ] React DevTools confirma redução de re-renders
- [ ] Performance noticeably better

### Tarefa 2.2.4: useCallback
- [ ] Handlers em useCallback
- [ ] Dependências corretas
- [ ] Sem memory leaks
- [ ] Callbacks funcionam normalmente

### Geral
- [ ] Build sem erros
- [ ] Build sem warnings críticos
- [ ] Testes manuais passam
- [ ] Bundle size reduzido
- [ ] Commits bem documentados

---

## 📝 Commits Esperados

1. `refactor: Lazy load de modais calendário (SEMANA 2 - FASE 2.2.1)`
2. `refactor: Code splitting de rotas principais (SEMANA 2 - FASE 2.2.2)`
3. `refactor: Memoization de componentes calendário (SEMANA 2 - FASE 2.2.3)`
4. `refactor: useCallback para handlers (SEMANA 2 - FASE 2.2.4)`

---

## 🎓 Recursos & Referências

### React Performance
- React.memo: https://react.dev/reference/react/memo
- useCallback: https://react.dev/reference/react/useCallback
- Lazy loading: https://react.dev/reference/react/lazy
- Suspense: https://react.dev/reference/react/Suspense

### Vite Optimization
- Code splitting: https://vitejs.dev/guide/features.html#dynamic-import
- Rollup manual chunks: https://rollupjs.org/configuration-options/#output-manualchunks
- Build optimization: https://vitejs.dev/guide/build.html

### Browser DevTools
- Chrome DevTools Bundle Analysis
- React DevTools Profiler
- Lighthouse Performance Audit

---

## 🚀 Próximo: FASE 2.3

Após conclusão de FASE 2.2, proceder para:

### FASE 2.3: Melhorias UX (5h)
1. Animações de transição (fade in/out)
2. Skeleton loading states
3. Confirmação antes de ações destrutivas
4. Undo para agendamentos cancelados

---

**Plano criado em:** 20 de Novembro de 2025
**Hora estimada de conclusão:** ~2 horas / tarefa
**Status:** 🟠 Pronto para implementação
