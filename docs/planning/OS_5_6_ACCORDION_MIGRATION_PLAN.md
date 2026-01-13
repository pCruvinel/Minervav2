# 📋 Plano de Migração OS 5-6 para Sistema Accordion

> **Data:** 2026-01-13  
> **Versão:** 2.0  
> **Status:** ✅ **CONCLUÍDO (Fase 1-3)**  
> **Prioridade:** Média  
> **Estimativa:** 16-24 horas de desenvolvimento

> [!TIP]
> **Migração implementada em 2026-01-13.** Novo componente `os-5-6-workflow-page.tsx` criado e integrado com feature flag.

---

## 1. Objetivo

Migrar OS-05 (Assessoria Mensal) e OS-06 (Assessoria Avulsa) do padrão **WorkflowStepper tradicional** para o **Sistema de Accordion com Adendos**, garantindo:

- ✅ Consistência visual com OS-07/08
- ✅ Suporte a adendos em etapas concluídas
- ✅ Navegação via página de Detalhes da OS
- ✅ Badge de Adendo no UnifiedWorkflowStepper
- ✅ Alta qualidade técnica e escalabilidade

---

## 2. Análise do Estado Atual

### 2.1 Arquivos OS 5-6 Existentes

| Arquivo | Linhas | Pattern | Status |
|---------|:------:|---------|--------|
| `os-details-assessoria-page.tsx` | 838 | WorkflowStepper + Steps | ⚠️ **DEPRECIAR** |
| `os05-workflow-page.tsx` | ~320 | Stepper tradicional | ⚠️ **DEPRECIAR** |
| `os06-workflow-page.tsx` | ~320 | Stepper tradicional | ⚠️ **DEPRECIAR** |

### 2.2 Gaps Identificados

| Gap | Atual | Esperado |
|-----|-------|----------|
| Padrão Visual | WorkflowStepper | WorkflowAccordion |
| Sistema de Adendos | ❌ Não implementado | ✅ FieldWithAdendos |
| Navegação URL | ❌ Não suporta `initialStep` | ✅ Props `initialStep` |
| Resumo Read-Only | ❌ Formulário editável | ✅ WorkflowStepSummary |
| Badge Adendo | ❌ Ausente | ✅ UnifiedWorkflowStepper |

---

## 3. Arquivos a Depreciar

> [!CAUTION]
> Os arquivos abaixo devem ser marcados como **DEPRECATED** e removidos após migração completa.

### 3.1 Arquivos Deprecados

```
src/components/os/assessoria/os-5-6/pages/
├── os-details-assessoria-page.tsx    # ❌ DEPRECATED - Substituir por os-5-6-workflow-page.tsx
├── os05-workflow-page.tsx            # ❌ DEPRECATED - Consolidar em os-5-6-workflow-page.tsx
└── os06-workflow-page.tsx            # ❌ DEPRECATED - Consolidar em os-5-6-workflow-page.tsx
```

### 3.2 Header de Deprecação

Adicionar nos arquivos deprecados:

```typescript
/**
 * @deprecated Este arquivo está DEPRECATED desde 2026-01-13.
 * 
 * Motivo: Migração para Sistema de Accordion com Adendos.
 * Substituído por: os-5-6-workflow-page.tsx
 * 
 * Plano: docs/planning/OS_5_6_ACCORDION_MIGRATION_PLAN.md
 * 
 * @see ACCORDION_ADENDOS_SYSTEM.md
 */
```

---

## 4. Arquitetura Proposta

### 4.1 Nova Estrutura de Arquivos

```
src/components/os/assessoria/os-5-6/
├── pages/
│   ├── os-5-6-workflow-page.tsx      # 🆕 Página unificada OS-05 e OS-06
│   ├── os-details-assessoria-page.tsx # ❌ DEPRECATED
│   ├── os05-workflow-page.tsx         # ❌ DEPRECATED
│   └── os06-workflow-page.tsx         # ❌ DEPRECATED
├── components/
│   └── ... (componentes específicos se necessário)
└── types/
    └── os-5-6-types.ts               # 🆕 Tipos e interfaces
```

### 4.2 Diagrama de Componentes

```
┌──────────────────────────────────────────────────────────────┐
│                    OS56WorkflowPage                          │
├──────────────────────────────────────────────────────────────┤
│  Props:                                                      │
│  - osId: string                                              │
│  - tipoOS: 'OS-05' | 'OS-06'                                │
│  - initialStep?: number                                      │
│  - readonly?: boolean                                        │
│  - codigoOS?: string                                         │
│  - tipoOSNome?: string                                       │
├──────────────────────────────────────────────────────────────┤
│                          │                                   │
│    ┌────────────────────────────────────────┐                │
│    │         WorkflowAccordion              │                │
│    │  ├─ renderForm(step)                   │                │
│    │  │   ├─ Step 1: LeadCadastro          │                │
│    │  │   ├─ Step 2: StepFollowup1OS5/6    │                │
│    │  │   ├─ Step 3-11: ...                 │                │
│    │  │   └─ Step 12: StepAtivarContrato   │                │
│    │  └─ renderSummary(step, data)          │                │
│    │      └─ FieldWithAdendos               │                │
│    └────────────────────────────────────────┘                │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Etapas de Implementação

### Fase 1: Preparação (2-4h) ✅ CONCLUÍDA

- [x] Criar arquivo `os-5-6-types.ts` com interfaces
- [x] Criar `OS_56_SUMMARY_CONFIG` em componente principal
- [x] Adicionar header `@deprecated` nos arquivos legados
- [x] Criar esqueleto de `os-5-6-workflow-page.tsx`

### Fase 2: Migração Core (8-12h) ✅ CONCLUÍDA

- [x] Implementar `OS56WorkflowPage` com WorkflowAccordion
- [x] Portar lógica de `handleNextStep` do arquivo legado
- [x] Implementar `renderForm` com switch-case para 12 etapas
- [x] Implementar `renderSummary` com FieldWithAdendos
- [x] Integrar hooks: `useWorkflowState`, `useWorkflowCompletion`, `useEtapaAdendos`

### Fase 3: Integração (2-4h) ✅ CONCLUÍDA

- [x] Atualizar `details-workflow.$id.tsx` para usar novo componente
- [x] Atualizar `assessoria-lead.tsx` (rota de criação)
- [x] Passar props: `initialStep`, `codigoOS`, `tipoOSNome`
- [x] Atualizar navegação "Voltar" para `/os/$osId`
- [ ] Testar navegação via UnifiedWorkflowStepper

### Fase 4: Verificação (4-6h) 🟡 EM ANDAMENTO

- [ ] Testar fluxo completo OS-05 (12 etapas)
- [ ] Testar fluxo completo OS-06 (12 etapas)
- [ ] Verificar persistência de dados
- [ ] Testar adição de adendos em etapas concluídas
- [ ] Verificar badge "Adendo" no UnifiedWorkflowStepper
- [ ] Testar navegação de Detalhes → Workflow → Detalhes

---

## 6. Mitigação de Erros

### 6.1 Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|:-------------:|:-------:|-----------|
| Perda de dados durante migração | Média | Alto | Manter arquivos legados até validação |
| Incompatibilidade de tipos | Baixa | Médio | Usar TypeScript estrito |
| Regressão em fluxos críticos | Média | Alto | Testes manuais completos |
| Navegação quebrada | Baixa | Alto | Testar todos os links |

### 6.2 Estratégia de Rollback

```typescript
// Em details-workflow.$id.tsx - Feature flag temporário
const USE_NEW_ACCORDION = true; // Pode ser env var

case 5:
case 6:
    return USE_NEW_ACCORDION ? (
        <OS56WorkflowPage
            osId={id}
            tipoOS={osNumber === 5 ? 'OS-05' : 'OS-06'}
            initialStep={step}
            codigoOS={os.codigo_os}
            tipoOSNome={os.tipo_os_nome}
        />
    ) : (
        <OSDetailsAssessoriaPage  // Legado
            osId={id}
            tipoOS={osNumber === 5 ? 'OS-05' : 'OS-06'}
        />
    );
```

---

## 7. Checklist de Qualidade

### 7.1 Antes do Merge

- [ ] Build passa sem erros
- [ ] Zero warnings de TypeScript
- [ ] Lint passa (ou warnings documentados)
- [ ] Arquivos deprecados marcados com `@deprecated`
- [ ] Documentação atualizada

### 7.2 Testes Obrigatórios

| Cenário | OS-05 | OS-06 |
|---------|:-----:|:-----:|
| Criar nova OS | ⬜ | ⬜ |
| Completar etapa 1 | ⬜ | ⬜ |
| Navegar entre etapas | ⬜ | ⬜ |
| Adicionar adendo | ⬜ | ⬜ |
| Recarregar página | ⬜ | ⬜ |
| Navegar via Detalhes | ⬜ | ⬜ |
| Badge Adendo visível | ⬜ | ⬜ |
| Completar todas etapas | ⬜ | ⬜ |

---

## 8. Pós-Migração

### 8.1 Limpeza (Sprint Seguinte)

- [ ] Remover arquivos deprecados
- [ ] Remover feature flag de rollback
- [ ] Atualizar documentação final
- [ ] Comunicar equipe sobre mudanças

### 8.2 Monitoramento

- [ ] Verificar logs de erro em produção (7 dias)
- [ ] Coletar feedback de usuários
- [ ] Documentar issues encontrados

---

## 9. Referências

- [ACCORDION_ADENDOS_SYSTEM.md](../technical/ACCORDION_ADENDOS_SYSTEM.md)
- [OS_07_08_09_TECHNICAL_DOCUMENTATION.md](../technical/OS_07_08_09_TECHNICAL_DOCUMENTATION.md)
- [OS 5-6 Sistema Completo](../sistema/OS_05_06_COMPLETA.md)

---

**Última Atualização:** 2026-01-13  
**Autor:** Sistema Minerva ERP
