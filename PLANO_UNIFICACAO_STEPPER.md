# PLANO DE UNIFICAÇÃO: Componente Stepper Universal para Workflows de OS

**Data**: 19 de Janeiro de 2025
**Status**: 📋 Planejamento Aprovado
**Objetivo**: Criar componente Stepper único baseado no modelo OS 5-6 para todos os workflows

---

## 📊 DIAGNÓSTICO COMPLETO - DIFERENÇAS CONFIRMADAS

### Situação Atual (Confirmada pelo Usuário)

Existem **DUAS implementações diferentes do WorkflowStepper** em produção:

#### 🔴 **OS 1-4 (os-details-workflow-page.tsx)** - Versão Limitada
- ❌ Etapas ficam **TRAVADAS** mesmo após completar
- ❌ **NÃO permite** voltar para etapas anteriores
- ❌ **SEM** indicação verde de progresso
- ❌ Navegação bloqueada após avançar
- ⚠️ Experiência de usuário inferior

**Código atual:**
```typescript
const handleStepClick = (stepId: number) => {
  // Só permite voltar para etapas concluídas ou a etapa atual
  if (stepId <= currentStep) {
    if (stepId < currentStep && !isHistoricalNavigation) {
      setLastActiveStep(currentStep);
      setIsHistoricalNavigation(true);
      toast.info('Visualizando etapa anterior...');
    }
    setCurrentStep(stepId);
  } else {
    toast.warning('Complete as etapas anteriores primeiro', { icon: '🔒' });
  }
};
```

**Problema**: Mesmo com `completedSteps` calculado, a verificação `stepId <= currentStep` impede acesso a etapas já finalizadas que estão "para trás".

---

#### ✅ **OS 5-6 (os-details-assessoria-page.tsx)** - Versão Ideal
- ✅ Etapas ficam **VERDES** quando completadas
- ✅ **PERMITE** voltar e visualizar etapas anteriores
- ✅ Navegação histórica **funcional**
- ✅ Melhor experiência de usuário
- ✅ **ESTA é a implementação preferida**

**Código atual:**
```typescript
const completedSteps = useMemo(() => {
  const completed: number[] = [];

  // Etapa 1: Identificação do Lead
  if (etapa1Data.leadId) completed.push(1);

  // Etapa 2: Tipo de OS
  if (etapa2Data.tipoOS) completed.push(2);

  // Etapa 3: Follow-up 1
  if (etapa3Data.motivoProcura && etapa3Data.quandoAconteceu) completed.push(3);

  // ... continua para todas as etapas

  return completed;
}, [etapa1Data, etapa2Data, etapa3Data, ...]);

const handleStepClick = (stepId: number) => {
  if (stepId <= currentStep) {  // Permite navegar para trás livremente
    setCurrentStep(stepId);
  }
};
```

**Vantagem**: Simples, funcional, permite navegação livre para etapas anteriores.

---

## 🎯 REQUISITOS CONFIRMADOS PELO USUÁRIO

### 1. Visual & Navegação
- ✅ **Usar modelo OS 5-6** como base (o preferido)
- ✅ **Cor verde** quando etapa completa
- ✅ **Permite voltar** para etapas anteriores
- ✅ **Barra de progresso** dentro do stepper (linha colorida)

### 2. Salvamento
- ✅ **Auto-save apenas ao avançar** (não durante digitação)
- ✅ Botão continua como "**Salvar e Avançar**"
- ✅ Persistência no banco de dados (Supabase)

### 3. Modo de Visualização
- ✅ **Híbrido**: Visualização + botão "Editar esta etapa"
- ✅ Campos desabilitados por padrão ao visualizar
- ✅ Botão para habilitar edição se necessário

### 4. Validação
- ✅ **Validação obrigatória** antes de avançar
- ✅ Bloqueia avanço se campos inválidos
- ✅ Mostra bordas vermelhas + mensagens de erro

### 5. Progress Indicator
- ✅ **Barra de progresso** integrada no stepper
- ✅ Linha verde conectando etapas completadas
- ✅ Ícones de status (check verde, dot atual, lock futuro)

---

## 📁 ARQUITETURA DA SOLUÇÃO

### Estrutura de Arquivos

```
src/components/os/
├── workflow-stepper.tsx              ← MELHORAR (adicionar features de OS 5-6)
├── workflow-footer.tsx               ← MANTER (já funcional)
├── workflow-progress-bar.tsx         ← NOVO (barra de progresso)
├── workflow-history-banner.tsx       ← NOVO (banner "visualizando etapa anterior")
└── workflow-edit-mode-toggle.tsx     ← NOVO (botão "Editar esta etapa")

src/lib/hooks/
├── use-workflow-state.ts             ← NOVO (state management unificado)
├── use-workflow-navigation.ts        ← NOVO (navigation + history logic)
└── use-workflow-completion.ts        ← NOVO (calcula etapas completas)

docs/
└── WORKFLOW_STEPPER_GUIA_USO.md      ← NOVO (guia de implementação)
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### FASE 1: Análise e Documentação
- [x] Analisar diferenças entre OS 1-4 e OS 5-6
- [x] Confirmar requisitos com usuário
- [x] Identificar features essenciais
- [x] Criar documento de planejamento
- [ ] Documentar API do componente unificado

---

### FASE 2: Migrar Lógica de OS 5-6 para WorkflowStepper ✅ CONCLUÍDA

#### 2.1 Adicionar Suporte a Etapas Completadas
- [x] Adicionar prop `completedSteps: number[]` ao WorkflowStepper (já existia)
- [x] Modificar lógica de `isAccessible` para incluir etapas completas
- [x] Atualizar estilos para etapas completas (verde) (já existia)
- [x] Adicionar linha verde conectando etapas completas (já existia)
- [x] Testar navegação para etapas anteriores (build + dev server validados)

**Código implementado:**
```typescript
// workflow-stepper.tsx:82
const isAccessible = isCompleted || isCurrent || step.id < currentStep;
// Permite acesso a: completas, atual, ou qualquer anterior ✅ IMPLEMENTADO
```

**Arquivos modificados:**
- `src/components/os/workflow-stepper.tsx` (linha 82)

**Documentação:**
- `IMPLEMENTACAO_FASE2_STEPPER.md` - Guia completo da implementação

**Commit:** `9220147` - feat: Permitir navegação livre para etapas anteriores no Stepper

#### 2.2 Melhorar Visual de Progresso (MOVIDO PARA FASE 8)
- [ ] Adicionar barra de progresso horizontal
- [ ] Calcular percentual de conclusão
- [ ] Animar transição de progresso
- [ ] Adicionar contador "X de Y etapas completas"
- [x] Estilizar linha conectora verde para etapas completas (já existia)

**Referência visual:**
```
[✓]━━━[✓]━━━[●]─ ─ ─[🔒]─ ─ ─[🔒]
 1      2      3        4        5
      60% completo
```

---

### FASE 3: Implementar Modo Híbrido de Visualização ✅ CONCLUÍDA (OS 1-4 e OS 5-6)

#### 3.1 Replicar Navegação Histórica para OS 5-6
- [x] Adicionar estados lastActiveStep e isHistoricalNavigation
- [x] Modificar handleStepClick para detectar navegação histórica
- [x] Criar função handleReturnToActive
- [x] Adicionar botão laranja de retorno rápido
- [x] Adicionar banner azul de modo histórico
- [x] Passar props readOnlyMode e onReturnToActive para WorkflowFooter
- [x] Passar prop lastActiveStep para WorkflowStepper

**Commit:** `e5163d4` - feat: Implementar modo híbrido de navegação histórica em OS 5-6

#### 3.2 Adicionar readOnly aos Componentes (Prioridade: OS 5-6)
- [x] StepFollowup1: Adicionar prop readOnly e disabled em 11 campos
- [x] StepIdentificacaoLeadCompleto: Adicionar readOnly (5 campos validados + combobox)
- [x] StepMemorialEscopo: Adicionar readOnly (1 FormTextarea + 3 Inputs + arrays dinâmicos)
- [ ] Outros componentes shared/ (a fazer conforme necessário)

**Commits:**
- `a502bee` - feat: Adicionar suporte readOnly ao StepFollowup1
- `12b0cfb` - feat: Adicionar suporte readOnly ao StepIdentificacaoLeadCompleto
- `f2a0b84` - feat: Adicionar suporte readOnly ao StepMemorialEscopo

#### 3.3 Integrar readOnly nos Workflows
- [x] OS 5-6: Passar readOnly={isHistoricalNavigation} para StepFollowup1
- [x] OS 5-6: Passar readOnly={isHistoricalNavigation} para StepIdentificacaoLeadCompleto
- [x] OS 1-4: Passar readOnly para StepIdentificacaoLeadCompleto (Etapa 1)
- [x] OS 1-4: Passar readOnly para StepFollowup1 (Etapa 3)
- [x] OS 1-4: Passar readOnly para StepMemorialEscopo (Etapa 7)

**Commit:** `c55ac38` - feat: Integrar readOnly em 3 componentes do OS 1-4

**Mock do Banner:**
```tsx
<Alert className="bg-blue-50 border-blue-200">
  <Info className="h-4 w-4" />
  <AlertDescription>
    Visualizando Etapa 3 - Follow-up 1 (dados salvos)
    <Button onClick={onReturnToActive}>Voltar para Etapa 5</Button>
  </AlertDescription>
</Alert>
```

#### 3.2 Criar Workflow Edit Mode Toggle
- [ ] Criar componente `WorkflowEditModeToggle`
- [ ] Adicionar prop `readOnly: boolean` aos step components
- [ ] Botão "Editar esta Etapa" quando em modo visualização
- [ ] Desabilitar campos quando `readOnly={true}`
- [ ] Adicionar confirmação ao editar etapa anterior

**API do componente:**
```typescript
interface StepComponentProps {
  data: any;
  onDataChange: (data: any) => void;
  readOnly?: boolean;           // NOVO
  onEnableEdit?: () => void;   // NOVO
}
```

#### 3.3 Adicionar Estados de Navegação
- [ ] Adicionar prop `lastActiveStep` ao state
- [ ] Adicionar prop `isHistoricalNavigation` ao state
- [ ] Lógica para detectar navegação para trás
- [ ] Lógica para retornar à etapa ativa
- [ ] Preservar dados ao navegar

---

### FASE 4: Integrar Validação Obrigatória

#### 4.1 Validação Antes de Avançar
- [ ] Modificar `handleNextStep` em todos os workflows
- [ ] Chamar validação do step component (se existir ref)
- [ ] Bloquear avanço se `isValid === false`
- [ ] Mostrar toast com mensagem de erro
- [ ] Scroll para primeiro campo inválido

**Padrão de validação:**
```typescript
// No workflow page
const stepRef = useRef<StepHandle>(null);

const handleNextStep = async () => {
  // Validar step atual
  if (stepRef.current && !stepRef.current.validate()) {
    toast.error('Preencha todos os campos obrigatórios');
    return;
  }

  // Salvar e avançar
  await saveCurrentStepData();
  setCurrentStep(currentStep + 1);
};
```

#### 4.2 Indicadores Visuais no Stepper
- [ ] Adicionar ícone de warning em etapas inválidas
- [ ] Tooltip mostrando campos faltantes
- [ ] Badge com contador de erros (opcional)
- [ ] Cor amarela para etapas parcialmente completas

---

### FASE 5: Implementar Auto-Save ao Avançar

#### 5.1 Salvar Dados no Banco
- [ ] Criar função `saveStepData(stepId, data)` unificada
- [ ] Integrar com Supabase (tabela `ordem_servico_etapas`)
- [ ] Adicionar loading state durante salvamento
- [ ] Tratar erros de salvamento
- [ ] Retry automático em caso de falha

**Fluxo de salvamento:**
```
Usuário clica "Salvar e Avançar"
    ↓
1. Validar dados do step atual
    ↓
2. Se válido: Salvar no banco (Supabase)
    ↓
3. Atualizar completedSteps
    ↓
4. Avançar para próximo step
    ↓
5. Mostrar toast de sucesso
```

#### 5.2 Visual Feedback do Salvamento
- [ ] Spinner no botão "Salvar e Avançar"
- [ ] Desabilitar botão durante salvamento
- [ ] Toast de sucesso após salvar
- [ ] Toast de erro se falhar
- [ ] Botão "Tentar Novamente" em caso de erro

---

### FASE 6: Criar Hooks Utilitários

#### 6.1 useWorkflowState Hook
- [ ] Criar hook `useWorkflowState`
- [ ] Gerenciar state de todos os steps
- [ ] Computed property `completedSteps`
- [ ] Helper `getStepData(stepId)`
- [ ] Helper `setStepData(stepId, data)`

**API do hook:**
```typescript
const {
  currentStep,
  setCurrentStep,
  completedSteps,
  formDataByStep,
  getStepData,
  setStepData,
  isStepComplete,
} = useWorkflowState(steps);
```

#### 6.2 useWorkflowNavigation Hook
- [ ] Criar hook `useWorkflowNavigation`
- [ ] Lógica de navegação (next/prev/goto)
- [ ] Historical navigation tracking
- [ ] Return to active step
- [ ] Validação antes de avançar

**API do hook:**
```typescript
const {
  handleNext,
  handlePrev,
  handleGotoStep,
  handleReturnToActive,
  isHistoricalNavigation,
  lastActiveStep,
} = useWorkflowNavigation({
  currentStep,
  totalSteps,
  validateStep,
  saveStep,
});
```

#### 6.3 useWorkflowCompletion Hook
- [ ] Criar hook `useWorkflowCompletion`
- [ ] Calcular etapas completas automaticamente
- [ ] Regras de completude por tipo de etapa
- [ ] Percentual de progresso
- [ ] Estimated time remaining (opcional)

---

### FASE 7: Migrar Todos os Workflows

#### 7.1 Atualizar OS 1-4 (os-details-workflow-page.tsx)
- [ ] Adicionar lógica de `completedSteps` (copiar de OS 5-6)
- [ ] Modificar `handleStepClick` para permitir navegação
- [ ] Adicionar props necessárias ao WorkflowStepper
- [ ] Testar navegação entre etapas
- [ ] Testar validação antes de avançar
- [ ] Testar salvamento no banco

#### 7.2 Atualizar OS 5-6 (os-details-assessoria-page.tsx)
- [ ] Adicionar modo híbrido (edit/view)
- [ ] Adicionar banner de navegação histórica
- [ ] Integrar validação obrigatória
- [ ] Testar todos os fluxos

#### 7.3 Atualizar OS-08 (os08-workflow-page.tsx)
- [ ] Aplicar padrão unificado
- [ ] Testar completude das 7 etapas

#### 7.4 Atualizar OS-09 (os09-workflow-page.tsx)
- [ ] Aplicar padrão unificado
- [ ] Testar navegação

#### 7.5 Atualizar OS-13 (os13-workflow-page.tsx)
- [ ] Aplicar padrão unificado
- [ ] Testar navegação entre 17 etapas

---

### FASE 8: Componente WorkflowProgressBar

#### 8.1 Criar Barra de Progresso
- [ ] Criar `workflow-progress-bar.tsx`
- [ ] Calcular percentual (completedSteps / totalSteps)
- [ ] Barra horizontal com gradiente verde
- [ ] Animação de preenchimento suave
- [ ] Integrar ao WorkflowStepper

**Mock visual:**
```tsx
<div className="progress-bar-container">
  <div className="progress-bar" style={{ width: `${percentage}%` }}>
    <div className="progress-fill" />
  </div>
  <span className="progress-text">{completed} de {total} etapas</span>
</div>
```

#### 8.2 Posicionamento no Stepper
- [ ] Adicionar abaixo dos círculos de etapa
- [ ] Alinhamento com linha conectora
- [ ] Responsivo (mobile/desktop)
- [ ] Cores consistentes (verde = completo, azul = atual)

---

### FASE 9: Testes Completos

#### 9.1 Testes Funcionais
- [ ] Testar navegação forward (próximo)
- [ ] Testar navegação backward (anterior)
- [ ] Testar validação obrigatória
- [ ] Testar salvamento no banco
- [ ] Testar modo visualização (read-only)
- [ ] Testar modo edição em etapa anterior
- [ ] Testar return to active step
- [ ] Testar progress bar atualização

#### 9.2 Testes de UX
- [ ] Feedback visual claro em cada ação
- [ ] Transições suaves entre etapas
- [ ] Loading states durante salvamento
- [ ] Mensagens de erro úteis
- [ ] Toast notifications apropriados
- [ ] Animações não invasivas

#### 9.3 Testes de Edge Cases
- [ ] Tentar avançar sem validar
- [ ] Erro de rede durante salvamento
- [ ] Navegação rápida entre múltiplas etapas
- [ ] Editar etapa anterior e voltar
- [ ] Completar todas as etapas
- [ ] Workflow com 17 etapas (OS-13)

#### 9.4 Testes de Acessibilidade
- [ ] Keyboard navigation (Tab, Enter, Arrows)
- [ ] Screen reader support (ARIA labels)
- [ ] Focus management
- [ ] Color contrast (WCAG AA)
- [ ] Tooltips informativos

#### 9.5 Testes de Performance
- [ ] Salvamento não trava UI
- [ ] Navegação entre etapas < 100ms
- [ ] Renderização de 17 etapas (OS-13)
- [ ] Memory leaks check
- [ ] Build size impact

---

### FASE 10: Documentação

#### 10.1 Guia de Uso
- [ ] Criar `WORKFLOW_STEPPER_GUIA_USO.md`
- [ ] Como usar o WorkflowStepper
- [ ] Props e API completa
- [ ] Exemplos de implementação
- [ ] Padrões de validação
- [ ] Padrões de salvamento

#### 10.2 Migration Guide
- [ ] Criar guia de migração de workflows antigos
- [ ] Checklist de atualização
- [ ] Breaking changes
- [ ] Exemplos before/after

#### 10.3 API Documentation
- [ ] Documentar todas as props
- [ ] Documentar hooks utilitários
- [ ] Documentar componentes auxiliares
- [ ] TypeScript types exportados

---

## 🎨 DESIGN SPECIFICATIONS

### Visual States

#### Etapa Não Iniciada (Locked)
```
Estado: Futura, não acessível
Ícone: 🔒 Lock (gray)
Círculo: bg-gray-100
Texto: text-gray-400
Linha: bg-gray-200 (dashed)
Hover: Não clicável
```

#### Etapa Atual (Current)
```
Estado: Em andamento
Ícone: ● Dot (azul)
Círculo: bg-blue-100 border-blue-500
Texto: text-blue-700 font-semibold
Linha: bg-gray-200
Hover: Não clicável (já está aqui)
Animação: Pulse suave
```

#### Etapa Completa (Completed)
```
Estado: Finalizada, clicável
Ícone: ✓ Checkmark (verde)
Círculo: bg-green-100
Texto: text-green-700
Linha: bg-green-400 (sólida)
Hover: bg-green-50 + cursor-pointer
Click: Navega para etapa
```

#### Etapa Visualizada (Historical View)
```
Estado: Visualizando dados antigos
Ícone: 👁️ Eye (azul)
Círculo: bg-blue-100 border-blue-300
Texto: text-blue-600
Banner: "Visualizando dados salvos"
Botão: "Voltar para Etapa X"
```

---

### Progress Bar Styles

```css
.progress-container {
  height: 4px;
  background: #e5e7eb; /* gray-200 */
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399); /* green gradient */
  transition: width 0.5s ease-in-out;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.progress-text {
  font-size: 11px;
  color: #6b7280; /* gray-500 */
  margin-top: 4px;
}
```

---

## 📊 MÉTRICAS DE SUCESSO

### Objetivos Quantitativos

| Métrica | Meta | Como Medir |
|---------|------|------------|
| **Redução de código duplicado** | -40% | Lines of code antes/depois |
| **Consistência entre workflows** | 100% | Mesma API em todos os workflows |
| **Performance de navegação** | < 100ms | Time to navigate between steps |
| **Performance de salvamento** | < 500ms | Time to save step data |
| **Cobertura de testes** | > 80% | Unit + integration tests |
| **Acessibilidade** | WCAG AA | Lighthouse audit |
| **Build size increase** | < 10KB | Bundle size analysis |

### Objetivos Qualitativos

- [ ] Um único componente Stepper usado em todos workflows
- [ ] Navegação intuitiva (verde = pode clicar)
- [ ] Validação clara (vermelho = campos faltando)
- [ ] Salvamento confiável (retry em caso de erro)
- [ ] Feedback visual imediato em todas as ações
- [ ] Documentação completa e clara
- [ ] Zero bugs reportados em produção nos primeiros 30 dias

---

## ⏱️ CRONOGRAMA

| Fase | Descrição | Tempo Estimado | Data Início | Data Fim |
|------|-----------|----------------|-------------|----------|
| 1 | Análise e Documentação | ✅ 3h | 19/01 | 19/01 |
| 2 | Migrar Lógica OS 5-6 | ✅ 1h | 19/01 | 19/01 |
| 3 | Modo Híbrido (OS 5-6) | ✅ 3.5h | 19/01 | 19/01 |
| 4 | Validação Obrigatória | 2-3h | - | - |
| 5 | Auto-Save | 3-4h | - | - |
| 6 | Hooks Utilitários | 4-5h | - | - |
| 7 | Migrar Workflows | 6-8h | - | - |
| 8 | Progress Bar | 2-3h | - | - |
| 9 | Testes Completos | 6-8h | - | - |
| 10 | Documentação | 3-4h | - | - |
| **TOTAL** | | **37-49h (5-6 dias)** | | |

---

## 🚨 RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Break existing OS workflows | Média | Alto | Testes extensivos antes de deploy |
| Performance issues com 17 etapas (OS-13) | Baixa | Médio | Virtualization/lazy loading |
| Complexidade de state management | Alta | Médio | Hooks reutilizáveis bem documentados |
| Regressões em validação | Média | Alto | Testes unitários + E2E |
| Confusão de usuários com novo UX | Baixa | Baixo | Banner explicativo + tutorial |

---

## ✅ CRITÉRIOS DE ACEITAÇÃO

### Funcionalidades Essenciais

- [ ] ✅ Etapas completadas ficam **VERDES**
- [ ] ✅ Permite **VOLTAR** para etapas anteriores
- [ ] ✅ **Barra de progresso** visível e funcional
- [ ] ✅ **Validação obrigatória** antes de avançar
- [ ] ✅ **Salvamento** ao clicar "Salvar e Avançar"
- [ ] ✅ **Modo híbrido**: Visualizar + Editar
- [ ] ✅ **Banner** ao visualizar etapa anterior
- [ ] ✅ **Botão** "Voltar para Etapa Atual"

### Qualidade Técnica

- [ ] ✅ Build sem erros TypeScript
- [ ] ✅ Sem warnings no console
- [ ] ✅ Testes passando 100%
- [ ] ✅ Performance aceitável (< 100ms navegação)
- [ ] ✅ Acessibilidade WCAG AA
- [ ] ✅ Documentação completa
- [ ] ✅ Code review aprovado

### User Experience

- [ ] ✅ Feedback visual claro em todas as ações
- [ ] ✅ Transições suaves (não abruptas)
- [ ] ✅ Mensagens de erro úteis (não técnicas)
- [ ] ✅ Loading states durante operações
- [ ] ✅ Responsivo (mobile + desktop)
- [ ] ✅ Intuitivo (não precisa de treinamento)

---

## 📝 PRÓXIMOS PASSOS IMEDIATOS

1. **Confirmar aprovação deste plano** ✅ APROVADO
2. **Iniciar FASE 2**: Migrar lógica de OS 5-6 para WorkflowStepper
3. **Criar branch**: `feature/unified-workflow-stepper`
4. **Primeira implementação**: Adicionar suporte a `completedSteps`
5. **Teste inicial**: Validar navegação em OS 1-4

---

## 🎯 IMPLEMENTAÇÃO PRIORITÁRIA

Com base no feedback do usuário, a ordem de prioridade é:

1. **Navegação livre** (permitir voltar) - CRÍTICO
2. **Cor verde** em etapas completas - CRÍTICO
3. **Barra de progresso** - ALTA
4. **Validação obrigatória** - ALTA
5. **Modo híbrido** (view/edit) - MÉDIA
6. **Banner histórico** - BAIXA

---

**Documento criado em**: 19/01/2025
**Última atualização**: 19/01/2025
**Versão**: 1.0
**Status**: ✅ Aprovado e Pronto para Implementação
