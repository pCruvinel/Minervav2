# 🔍 Guia de Debug: Erro ao Avançar Etapa 3 → 4

## O Que Foi Adicionado

Adicionei logs detalhados em **3 locais críticos** para diagnosticar o erro:

### 1. **StepFollowup1 - Validação**
📁 `src/components/os/steps/shared/step-followup-1.tsx` (linhas 100-134)

```typescript
console.log('[STEP-FOLLOWUP-1] ✅ Iniciando validação', {
  isValid,
  errorDetails: errors,
  safeDataValues: { /* valores dos campos */ }
});
```

**O que mostra:**
- Se a validação passou ou falhou
- Quais campos têm erros
- Valores atuais de cada campo obrigatório

### 2. **handleNextStep - Transição Completa**
📁 `src/components/os/os-details-workflow-page.tsx` (linhas 1124-1220)

Logs em vários pontos:
- Início da função
- Resultado da validação
- Status do upload de arquivos
- Status do salvamento
- Avanço para a próxima etapa

### 3. **saveCurrentStepData - Salvamento no Banco**
📁 `src/components/os/os-details-workflow-page.tsx` (linhas 949-985)

```typescript
console.log(`[SAVE-STEP] 💾 Iniciando save da etapa ${currentStep}`);
console.log(`[SAVE-STEP] ✅ Etapa ${currentStep} salva com sucesso`);
```

**O que mostra:**
- Duração do salvamento
- Sucesso/falha da operação

---

## 📋 Como Capturar os Logs

### Passo 1: Abra DevTools
1. Na aplicação, pressione **F12** ou **Ctrl+Shift+I**
2. Vá para a aba **Console**

### Passo 2: Limpe o Console
1. Clique no ícone de "limpar" ou execute: `clear()`

### Passo 3: Preencha a Etapa 3
1. Preencha todos os 7 campos obrigatórios:
   - Idade da edificação
   - Motivo da procura (mín 5 caracteres)
   - Quando aconteceu (mín 5 caracteres)
   - Grau de urgência
   - Apresentação da proposta (mín 5 caracteres)
   - Nome do contato local (mín 2 caracteres)
   - Telefone do contato local (mín 8 caracteres)

2. Adicione arquivos para upload (se aplicável)

### Passo 4: Clique em "Próximo"
1. Observe o console
2. Procure por logs com prefixos:
   - `[STEP-FOLLOWUP-1]` - Validação
   - `[OS-WORKFLOW]` - Fluxo de transição
   - `[SAVE-STEP]` - Salvamento

### Passo 5: Copie os Logs
```
1. Selecione todo o texto do console (Ctrl+A)
2. Copie (Ctrl+C)
3. Cole aqui ou compartilhe
```

---

## 🎯 O Que Procurar

### ✅ Se Funcionar (esperado):
```
[OS-WORKFLOW] Step 3→4: Começando validação
[STEP-FOLLOWUP-1] ✅ Iniciando validação { isValid: true, ... }
[STEP-FOLLOWUP-1] ✅ Validação passou!
[OS-WORKFLOW] Step 3→4: Validação resultado= true
[OS-WORKFLOW] Step 3→4: ✅ Validação passou, continuando...
[SAVE-STEP] 💾 Iniciando save da etapa 3
[SAVE-STEP] ✅ Etapa 3 salva com sucesso (XXXms)
[OS-WORKFLOW] Step 3→4: 📍 Avançando para etapa 4
```

### ❌ Se Falhar na Validação:
```
[STEP-FOLLOWUP-1] ❌ Validação falhou!
{
  errorFields: [...],
  firstError: "motivoProcura",
  allErrors: { motivoProcura: "..." }
}
[OS-WORKFLOW] Step 3→4: ❌ Validação FALHOU - não pode avançar
```

### ❌ Se Falhar no Upload:
```
[OS-WORKFLOW] Step 3→4: Iniciando upload de arquivos
[OS-WORKFLOW] Step 3→4: ❌ Erro no upload: [erro detalhado]
```

### ❌ Se Falhar no Save:
```
[SAVE-STEP] 💾 Iniciando save da etapa 3
[SAVE-STEP] ❌ Erro ao salvar: [erro detalhado]
```

---

## 📊 Próximos Passos

Após capturar os logs:

1. **Se validação falhar**: Identifique qual campo está causando o erro
2. **Se upload falhar**: Verifique o arquivo (tamanho, tipo, permissões)
3. **Se save falhar**: Verifique conexão com Supabase e status da OS

Com os logs, poderei identificar exatamente o ponto de falha e implementar a correção!

---

**Status da Implementação**: ✅ Logs adicionados com sucesso
**Próximo Passo**: Capturar logs durante teste manual
