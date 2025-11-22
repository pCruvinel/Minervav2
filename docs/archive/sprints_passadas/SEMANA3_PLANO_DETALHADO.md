# 🚀 SEMANA 3 - PLANO DETALHADO

**Data:** 20 de Novembro de 2025
**Tempo Estimado:** 25 horas
**Status:** Planejado

---

## 🎯 Objetivo Geral

Finalizar o módulo de Calendário com:
1. **Database Sync** - Sincronização em tempo real
2. **Testes Automatizados** - Unit + E2E tests
3. **Otimizações Finais** - Mobile + accessibility
4. **Deploy Pronto** - Pronto para produção

---

## 📋 Estrutura de SEMANA 3

### FASE 3.1: Database Sync (8h)
- Realtime subscriptions com Supabase
- Offline support + sync when online
- Conflict resolution
- Error recovery

### FASE 3.2: Testes Automatizados (10h)
- Unit tests para validações
- Integration tests para workflows
- E2E tests para user journeys
- Test coverage > 80%

### FASE 3.3: Otimizações Finais (5h)
- Mobile responsiveness
- Accessibility (a11y)
- Dark mode support
- Performance final audit

### FASE 3.4: Deploy & Documentação (2h)
- Deploy checklist
- Production documentation
- Monitoring setup
- Rollback procedures

---

## 📝 FASE 3.1: Database Sync (8 horas)

### Tarefa 3.1.1: Realtime Subscriptions (3h)

**Objetivo:** Dados em tempo real do Supabase

```typescript
// Hook para realtime de turnos
export function useTurnosRealtime(dateRange: DateRange) {
  const [turnos, setTurnos] = useState<TurnoComVagas[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Setup realtime subscription
    const subscription = supabase
      .from('turnos')
      .on('*', (payload) => {
        // Update local state
        setTurnos(prev => updateTurnos(prev, payload));
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [dateRange]);

  return { turnos, loading };
}
```

**Benefícios:**
- ✅ Dados sempre atualizados
- ✅ Sem polling (mais eficiente)
- ✅ Reações instantâneas
- ✅ Reduz erros de sincronização

---

### Tarefa 3.1.2: Offline Support (3h)

**Objetivo:** Funcionar sem internet

```typescript
// Persistência local
const CACHE_KEY = 'calendario_turnos_cache';

export function useTurnosWithOfflineSupport() {
  const [turnos, setTurnos] = useState(() => {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
  });

  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    window.addEventListener('online', () => setOnline(true));
    window.addEventListener('offline', () => setOnline(false));

    return () => {
      window.removeEventListener('online', () => {});
      window.removeEventListener('offline', () => {});
    };
  }, []);

  // Sync quando volta online
  useEffect(() => {
    if (online) {
      syncWithServer();
    }
  }, [online]);

  return { turnos, online };
}
```

**Benefícios:**
- ✅ Funciona offline
- ✅ Sincroniza ao conectar
- ✅ Melhor UX
- ✅ Menos erros de rede

---

### Tarefa 3.1.3: Conflict Resolution (2h)

**Objetivo:** Resolver conflitos de sincronização

```typescript
// Estratégia: Last-write-wins (padrão para calendários)
function resolveConflict(local: Turno, remote: Turno): Turno {
  // Sempre usa o mais recente
  if (local.updatedAt > remote.updatedAt) {
    return local;
  }
  return remote;
}
```

---

## 📝 FASE 3.2: Testes Automatizados (10 horas)

### Tarefa 3.2.1: Unit Tests (4h)

**Arquivo:** `src/lib/validations/__tests__/turno-validations.test.ts`

```typescript
describe('turno-validations', () => {
  describe('verificarSobreposicao', () => {
    it('deve detectar sobreposição', () => {
      const turno1 = { horaInicio: '09:00', horaFim: '11:00' };
      const turno2 = { horaInicio: '10:00', horaFim: '12:00' };

      expect(verificarSobreposicao(turno1, turno2)).toBe(true);
    });

    it('não deve detectar turnos adjacentes como sobreposição', () => {
      const turno1 = { horaInicio: '09:00', horaFim: '11:00' };
      const turno2 = { horaInicio: '11:00', horaFim: '13:00' };

      expect(verificarSobreposicao(turno1, turno2)).toBe(false);
    });
  });

  describe('validarDuracao', () => {
    it('deve rejeitar duração menor que 30min', () => {
      const result = validarDuracao('09:00', '09:15');
      expect(result.valido).toBe(false);
    });

    it('deve aceitar duração de 30min até 4h', () => {
      const result = validarDuracao('09:00', '13:00');
      expect(result.valido).toBe(true);
    });
  });
});
```

**Coverage Target:** > 80%

---

### Tarefa 3.2.2: Integration Tests (3h)

**Arquivo:** `src/components/calendario/__tests__/calendario-dia.integration.test.tsx`

```typescript
describe('CalendarioDia Integration', () => {
  it('deve criar turno e atualizar calendário', async () => {
    const { getByText, getByRole } = render(<CalendarioDia {...props} />);

    const button = getByRole('button', { name: /novo turno/i });
    fireEvent.click(button);

    const input = getByRole('textbox', { name: /hora/i });
    fireEvent.change(input, { target: { value: '10:00' } });

    const submitButton = getByRole('button', { name: /criar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(getByText(/09:00 - 11:00/)).toBeInTheDocument();
    });
  });
});
```

---

### Tarefa 3.2.3: E2E Tests (3h)

**Framework:** Cypress ou Playwright

```typescript
// cypress/e2e/calendario.cy.ts
describe('Calendario E2E', () => {
  beforeEach(() => {
    cy.visit('/calendario');
  });

  it('deve navegador entre períodos', () => {
    cy.get('button[aria-label="próximo período"]').click();
    cy.get('h1').should('contain', 'novembro');
  });

  it('deve criar agendamento completo', () => {
    // Click em turno disponível
    cy.get('[data-testid="turno-09:00"]').click();

    // Preencher modal
    cy.get('[name="categoria"]').select('Vistoria Inicial');
    cy.get('[name="setor"]').select('Comercial');

    // Submeter
    cy.get('button[type="submit"]').click();

    // Verificar sucesso
    cy.get('[role="status"]').should('contain', 'Agendamento criado');
  });
});
```

---

## 📝 FASE 3.3: Otimizações Finais (5 horas)

### Tarefa 3.3.1: Mobile Responsiveness (2h)

**Breakpoints:**
```css
mobile:   < 640px  (sm)
tablet:   640-1024 (md/lg)
desktop:  > 1024   (xl/2xl)
```

**Checklist:**
- [ ] Calendário funciona em mobile
- [ ] Modais responsivos
- [ ] Touch-friendly buttons (min 44x44px)
- [ ] Texto legível (min 16px)
- [ ] No horizontal scroll
- [ ] Testado em iPhone + Android

---

### Tarefa 3.3.2: Accessibility (a11y) (2h)

**WCAG 2.1 AA Compliance:**

```html
<!-- Semantic HTML -->
<main>
  <nav aria-label="Calendário">
    <button aria-label="Período anterior">←</button>
    <h1>Novembro 2025</h1>
    <button aria-label="Próximo período">→</button>
  </nav>
</main>

<!-- Keyboard navigation -->
<button onKeyDown={handleEnter}></button>

<!-- Screen reader support -->
<table role="grid" aria-label="Turnos da semana">
  <caption>Semana 17-23 de Novembro</caption>
</table>

<!-- Color contrast -->
<!-- Texto: min 4.5:1, componentes: min 3:1 -->
```

**Testes:**
- [ ] axe DevTools: 0 violations
- [ ] Keyboard navigation: ✅
- [ ] Screen reader: ✅
- [ ] Color contrast: ✅

---

### Tarefa 3.3.3: Dark Mode (1h)

```typescript
// src/hooks/useDarkMode.ts
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  return {
    isDark,
    toggle: () => setIsDark(!isDark),
  };
}

// Uso em tailwind
<div className={isDark ? 'dark' : ''}>
  <button className="bg-white dark:bg-gray-900">
    Toggle Dark Mode
  </button>
</div>
```

---

## 📝 FASE 3.4: Deploy & Documentação (2 horas)

### Tarefa 3.4.1: Production Checklist

```markdown
## Pre-Deploy Checklist

### Code Quality
- [ ] `npm run build` success
- [ ] No TypeScript errors
- [ ] Linting passes
- [ ] Test coverage > 80%

### Performance
- [ ] Bundle size < 2MB
- [ ] Lighthouse score > 80
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 4s

### Security
- [ ] No hardcoded secrets
- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] XSS/CSRF protection

### User Experience
- [ ] Mobile tested
- [ ] Accessibility verified
- [ ] Error messages clear
- [ ] Loading states present

### Monitoring
- [ ] Error tracking (Sentry)
- [ ] Analytics configured
- [ ] Performance monitoring
- [ ] Uptime monitoring
```

---

### Tarefa 3.4.2: Documentation

**Documentos a criar:**
1. **SETUP.md** - Como instalar localmente
2. **DEPLOYMENT.md** - Como fazer deploy
3. **CONTRIBUTING.md** - Como contribuir
4. **API.md** - Documentação de APIs
5. **TROUBLESHOOTING.md** - Problemas comuns

---

## 📊 Timeline & Milestones

```
SEMANA 3 TIMELINE:
├─ FASE 3.1 (8h): Database Sync
│  ├─ Day 1: Realtime (3h)
│  ├─ Day 2: Offline (3h)
│  └─ Day 3: Conflict resolution (2h)
├─ FASE 3.2 (10h): Testes
│  ├─ Day 4-5: Unit tests (4h)
│  ├─ Day 5-6: Integration tests (3h)
│  └─ Day 6-7: E2E tests (3h)
├─ FASE 3.3 (5h): Otimizações
│  ├─ Day 7-8: Mobile (2h)
│  ├─ Day 8: Accessibility (2h)
│  └─ Day 8: Dark mode (1h)
└─ FASE 3.4 (2h): Deploy
   ├─ Day 9: Production checklist
   └─ Day 9: Documentation
```

---

## 🎯 Success Criteria

### Database Sync
- [ ] Realtime updates funcionam
- [ ] Offline mode funciona
- [ ] Sync sem conflitos
- [ ] Zero data loss

### Testes
- [ ] Unit test coverage > 80%
- [ ] Integration tests passar
- [ ] E2E tests passar
- [ ] CI/CD pipeline working

### Otimizações
- [ ] Mobile: 100% funcional
- [ ] Accessibility: WCAG 2.1 AA
- [ ] Dark mode: funcionando
- [ ] Performance: Lighthouse > 80

### Deploy
- [ ] Production URL ativa
- [ ] Monitoring ligado
- [ ] Rollback procedure testado
- [ ] Documentation completa

---

## 🚀 Go-Live Criteria

**Apenas deploy quando:**
- ✅ Todos tests passam
- ✅ Build sem erros
- ✅ Performance OK
- ✅ Security audit OK
- ✅ Accessibility OK
- ✅ Documentation completa

---

## 📞 Próximos Passos Após SEMANA 3

1. **Phase 2:** Integrar módulo de Ordem de Serviço
2. **Phase 3:** Integrar módulo de Gestores
3. **Phase 4:** Analytics & Monitoring
4. **Phase 5:** Mobile App (React Native)

---

**Plano criado em:** 20 de Novembro de 2025
**Status:** 🟡 Pronto para iniciar
**Próximo:** Começar FASE 3.1 (Database Sync)
