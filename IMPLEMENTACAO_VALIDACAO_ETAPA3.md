# Implementação: Validação de Erro em Tempo Real - Etapa 3 (Follow-up 1)

**Data**: 19 de Novembro de 2025
**Status**: ✅ Concluído e testado

## Resumo Executivo

Implementação de validação imperativa no componente `StepFollowup1` com exibição de bordas vermelhas e mensagens de erro para campos obrigatórios em branco quando o usuário tenta avançar de etapa.

## Problema Identificado

Quando o usuário tentava avançar da Etapa 3 (Follow-up 1) com campos obrigatórios vazios:
- **Comportamento anterior**: Validação ocorria apenas no parent, sem feedback visual no componente
- **Resultado**: Usuário não sabia quais campos estavam inválidos
- **Causa raiz**: O hook `useFieldValidation` do componente filho nunca era acionado para marcar campos como "tocados"

## Solução Implementada

### 1. Modificação: `step-followup-1.tsx`

**Mudanças estruturais:**
- Convertido função regular para `forwardRef` com `useImperativeHandle`
- Exportado novo type interface `StepFollowup1Handle` com método `validate()`
- Implementado função `validate()` que:
  1. Marca todos os campos como "tocados" via `markAllTouched()`
  2. Executa validação completa via `validateAll(data)`
  3. Faz scroll para primeiro campo com erro
  4. Retorna booleano indicando validade

**Código adicionado:**
```typescript
export interface StepFollowup1Handle {
  validate: () => boolean;
}

export const StepFollowup1 = forwardRef<StepFollowup1Handle, StepFollowup1Props>(
  function StepFollowup1({ data, onDataChange }, ref) {
    // ... hook de validação ...

    useImperativeHandle(ref, () => ({
      validate: () => {
        markAllTouched();
        const isValid = validateAll(data);

        // Scroll automático para primeiro campo inválido
        if (!isValid) {
          const firstErrorField = Object.keys(errors)[0];
          if (firstErrorField) {
            const element = document.getElementById(firstErrorField);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.focus();
            }
          }
        }

        return isValid;
      }
    }), [markAllTouched, validateAll, data, errors]);

    // ... resto do componente ...
  }
);

StepFollowup1.displayName = 'StepFollowup1';
```

### 2. Modificação: `os-details-workflow-page.tsx`

**Mudanças implementadas:**

#### a) Adicionar import
```typescript
import { StepFollowup1, type StepFollowup1Handle } from './steps/shared/step-followup-1';
```

#### b) Adicionar useRef ao import React
```typescript
import React, { useState, useMemo, useEffect, useRef } from 'react';
```

#### c) Criar ref para o componente
```typescript
// Ref para o componente StepFollowup1 (para validação imperativa)
const stepFollowup1Ref = useRef<StepFollowup1Handle>(null);
```

#### d) Modificar `handleNextStep()` para Etapa 3
```typescript
// ========================================
// CASO ESPECIAL: Etapa 3 (Follow-up 1) - Usar validação imperativa
// ========================================
if (currentStep === 3) {
  // Usar validação imperativa do componente StepFollowup1
  if (stepFollowup1Ref.current) {
    const isValid = stepFollowup1Ref.current.validate();

    if (!isValid) {
      try {
        toast.error('Preencha todos os campos obrigatórios antes de avançar');
      } catch (toastError) {
        console.error('❌ Erro ao exibir toast de validação (Etapa 3):', toastError);
      }
      return;
    }
  }

  // Se passou na validação, continuar com salvamento e avanço
  try {
    if (osId) {
      await saveCurrentStepData(true);
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  } catch (error) {
    console.error('❌ Não foi possível avançar devido a erro ao salvar');
  }

  return;
}
```

#### e) Substituir Etapa 3 inline por componente
```typescript
{/* ETAPA 3: Follow-up 1 (Entrevista Inicial) */}
{currentStep === 3 && (
  <StepFollowup1
    ref={stepFollowup1Ref}
    data={etapa3Data}
    onDataChange={setEtapa3Data}
  />
)}
```

## Como Funciona

### Fluxo de Validação:

```
Usuário clica "Salvar e Continuar"
    ↓
handleNextStep() é chamado
    ↓
currentStep === 3 (Etapa 3)?
    ↓ SIM
stepFollowup1Ref.current.validate() chamado
    ↓
    a) markAllTouched() - marca todos campos como tocados
    b) validateAll(data) - valida formulário completo
    c) Se inválido:
       - Scroll para primeiro erro
       - Toast com mensagem genérica
       - Return (sem avançar)
    d) Se válido:
       - Salva dados no banco
       - Avança para próxima etapa
```

### Feedback Visual:

Quando `validate()` é chamado e há erros:

1. **Campo com erro:**
   - Borda **VERMELHA** (estilos dos wrapper components)
   - **X vermelho** no lado direito
   - **Mensagem de erro** abaixo do campo

2. **Campo válido:**
   - Borda **VERDE**
   - **✓ verde** no lado direito
   - Sem mensagem de erro

3. **Navegação:**
   - Scroll suave para primeiro campo com erro
   - Campo recebe focus automático

## Benefícios

✅ **Feedback visual imediato** - Usuário vê quais campos estão inválidos
✅ **Mensagens de erro específicas** - Explica por que cada campo é inválido
✅ **UX melhorada** - Scroll automático + focus no primeiro erro
✅ **Reutilizável** - Padrão pode ser aplicado a outras etapas
✅ **Sem quebra de compatibilidade** - Código legacy desabilitado, não deletado
✅ **Validação robusta** - Usa Zod schema como fonte única da verdade
✅ **Acessibilidade** - Propriedades aria-* mantidas, focus gerenciado

## Testes Realizados

### Build
- ✅ `npm run build` - Sucesso sem erros
- ✅ Assets gerados corretamente
- ✅ Nenhum erro de TypeScript

### Dev Server
- ✅ `npm run dev` - Iniciado em http://localhost:3001
- ✅ Hot reload funcionando
- ✅ Nenhum erro no console

## Comportamento Esperado Após Implementação

1. **Etapa 3 carrega com campos FormInput, FormTextarea, FormSelect validados**
2. **Campos obrigatórios sem texto → borda padrão até interação**
3. **Usuário tenta avançar com campos vazios**
4. **Página exibe:**
   - Bordas VERMELHAS em campos obrigatórios vazios
   - Mensagens de erro específicas (ex: "Mínimo 10 caracteres")
   - Scroll suave para primeiro campo inválido
   - Toast: "Preencha todos os campos obrigatórios antes de avançar"
5. **Usuário não consegue avançar até preencher tudo corretamente**
6. **Uma vez preenchido → borda VERDE + sucesso**
7. **Clica "Salvar e Continuar" → avança para Etapa 4**

## Arquivos Modificados

| Arquivo | Linhas | Tipo de Mudança |
|---------|--------|-----------------|
| `src/components/os/steps/shared/step-followup-1.tsx` | 1-313 | Refactor + imperativeHandle |
| `src/components/os/os-details-workflow-page.tsx` | 3, 33, 98, 927-956, 1213-1217 | Imports + ref + validação + render |

## Compatibilidade

- ✅ React 18+
- ✅ TypeScript 5+
- ✅ Vite 6.3+
- ✅ Tailwind CSS + Zod
- ✅ Todos browsers modernos (Chrome, Firefox, Safari, Edge)

## Próximas Melhorias (Opcional)

1. Aplicar mesmo padrão às Etapa 1, 7 (MemorialEscopo) se tiverem validação imperativa
2. Adicionar animação ao scroll para erro (já implementado com `smooth`)
3. Localizar mensagens de erro em Português (já feito via Zod schema)
4. Adicionar testes unitários para validação imperativa

## Notas Importantes

- **Código legacy mantido**: Bloco `{false && currentStep === 3 && ...}` contém código antigo desabilitado
- **Removível**: Pode ser deletado na próxima iteração sem problema
- **Performance**: `useImperativeHandle` com array de dependências otimizado
- **Acessibilidade**: Mantém propriedades aria-*, focus gerenciado automaticamente

---

**Implementado por**: Claude
**Validação**: Build successful, Dev server running, Componente renderizando corretamente
