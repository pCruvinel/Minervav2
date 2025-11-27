# 🛠️ Plano Técnico de Correção — os-details-redesign-page.tsx

**Data:** 25/11/2025  
**Responsável:** Architect Mode  
**Contexto:** Correção de sintaxe/estrutura reportada pelo Vite (react-swc) ao compilar `src/components/os/os-details-redesign-page.tsx`

---

## 1. Diagnóstico Rápido

| Categoria | Sintoma | Causa Provável |
|-----------|---------|----------------|
| Hook (`useEffect`) | `const` fora de escopo (`const config = getButtonConfig();` seguido de `}, [osId]);`) | Hook incompleto ou `useEffect` truncado durante merge (faltou `useEffect(() => { ... }, [osId])` com abertura/fechamento corretos) |
| Declarações | `'const' declarations must be initialized` e `Expected ';'` | Código solto após fechamento incorreto de hook (trecho `const config = getButtonConfig();` ficou fora de função) |
| JSX | `Return statement is not allowed here` (linhas 522 e 533) | `return (...)` está fora do corpo do componente devido a chaves mal fechadas |
| JSX/Card | `Expected '</', got 'jsx text` (linha 599) | Tags `</CardHeader >` mal formatadas ou `CardHeader/CardContent` fora da hierarquia correta |
| Estrutura geral | Componentes `loading`/`empty` e retorno principal misturados | Blocos `if (loading) return ...` deslocados para fora da função, quebrando AST |

---

## 2. Análise Estrutural

### 2.1 Hooks e Efeitos
- Review do trecho acima da linha 266 mostra `useEffect` presumido:
  ```tsx
  useEffect(() => {
    // ...
    const config = getButtonConfig();
  }, [osId]);
  ```
- Atualmente faltam `import { useEffect }` e/ou `useEffect(() => ...)` foi cortado.
- Necessário reintroduzir `useEffect` completo ou mover `config` para função `loadOSData`.

### 2.2 Funções Auxiliares
- `const loadOSData = async () => { ... }` aparece imediatamente após o hook quebrado → indica que a função deveria estar dentro do componente, mas após o `useEffect`.
- Garantir ordem:
  1. Hooks (`useState`, `useEffect`, etc.)
  2. Funções auxiliares (`loadOSData`, `handleTabs`, etc.)
  3. `if (loading) return ...`
  4. `if (!osDetails) return ...`
  5. `return (...)` principal

### 2.3 Fluxo de Retorno
- `return` para loading/erro devem estar dentro da função componente, antes do `return` final.
- Garantir que `loading` e `!osDetails` checks façam parte do componente principal.

### 2.4 JSX/Card
- Trecho suspeito:
  ```tsx
  <CardTitle ...>
    …
  </CardHeader >
  <CardContent …>
  ```
- Possível mix de `TabsTrigger` + `CardHeader` sem fechar `TabsContent`. Necessário revisar hierarquia e identar.
- Verificar se `Tabs` e `Card` estão combinados ou se layout foi fragmentado pela refatoração.

---

## 3. Plano de Correção

### Passo 1 — Restaurar Estrutura do Componente
1. Reabrir componente `OSDetailsRedesignPage` e localizar `useEffect` quebrado.
2. Reescrever `useEffect` com este padrão:
   ```tsx
   useEffect(() => {
     loadOSData();
     const config = getButtonConfig();
     setActionConfig(config);
   }, [osId]);
   ```
3. Garantir que todas as funções auxiliares (`loadOSData`, `handleTabChange`, etc.) estejam declaradas **antes** de qualquer `return`.

### Passo 2 — Reorganizar Fluxo de Retorno
1. Inserir logo após hooks:
   ```tsx
   if (loading) {
     return (...);
   }

   if (!osDetails) {
     return (...);
   }
   ```
2. Retorno principal fica ao final, encapsulando layout completo (tabs, cards, workflow, etc.).

### Passo 3 — Corrigir JSX Malformado
1. Rodar Prettier ou formatador focando em blocos `CardHeader/CardContent`.
2. Validar que cada `<CardHeader>` possui um `</CardHeader>` imediato antes de `<CardContent>`.
3. Em seções com `Tabs`, garantir estrutura:
   ```tsx
   <Tabs>
     <TabsList>...</TabsList>
     <TabsContent value="...">
       <Card>
         <CardHeader>...</CardHeader>
         <CardContent>...</CardContent>
       </Card>
     </TabsContent>
   </Tabs>
   ```
4. Corrigir classes com espaços errados (`className={`flex items - center ...`}` → remover espaços).

### Passo 4 — Revisar Imports e Dependências
1. Confirmar se `useEffect`, `useMemo`, `useState`, `Link`, `Button` e componentes shadcn estão importados.
2. Checar se `Link` vem do router correto (`@tanstack/react-router`).

### Passo 5 — Testes e Validação
1. Rodar `npm run lint` para garantir ausência de erros de sintaxe.
2. Abrir `/os/$osId` e `/os/details-workflow/$id` para verificar:
   - Loading placeholder exibido corretamente.
   - Estado de “OS não encontrada” renderizado.
   - Tabs e cards sem warnings no console.
3. Executar `npm run test -- os-details-redesign` se existir suite focada.

---

## 4. Checklist Técnico para Implementação

| Etapa | Descrição | Status Esperado |
|-------|-----------|-----------------|
| 1 | Reescrever `useEffect` e blocos auxiliares | ✅ |
| 2 | Reordenar `if (loading)` e `if (!osDetails)` | ✅ |
| 3 | Ajustar JSX/Tabs/Card | ✅ |
| 4 | Revisar imports (Link, useEffect) | ✅ |
| 5 | Testar lint + Vite (sem SWC errors) | ✅ |

---

## 5. Próximos Passos

1. **Implementação em modo Code** com base neste plano.
2. **Revisão** buscando warnings adicionais.
3. **Documentar** no changelog (`docs/planning/REDESIGN_DETALHES_OS_PLANO_ESTRATEGICO.md`) que a correção foi executada.

---

> **Nota:** Nenhuma alteração estrutural de UX/Lógica foi proposta aqui; foco exclusivo em restaurar integridade de sintaxe/estrutura para permitir continuidade do redesign.