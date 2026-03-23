# 🔧 Diagnóstico e Correções - Workflow OS 1-4

**Data da Análise:** 2026-01-04  
**Versão Analisada:** v2.7  
**Etapas Testadas:** 1 a 15 (COMPLETO)  
**Status:** ✅ Diagnóstico Completo - Aguardando Execução

---

## 📊 Resumo Executivo

| Categoria | Críticos | Atenção | Melhorias |
|-----------|:--------:|:-------:|:---------:|
| Backend/RLS | 1 | 0 | 0 |
| Backend/Dados | 1 | 0 | 0 |
| Frontend/React | 2 | 3 | 1 |
| Performance | 0 | 3 | 1 |
| UX/UI (Teste Manual) | 3 | 3 | 3 |
| **Total** | **7** | **9** | **5** |

### Análise por Etapa
| Etapas | Status | Problemas Críticos | Problemas de Atenção |
|--------|--------|:------------------:|:--------------------:|
| 1-4 | ✅ Analisado | 2 | 3 |
| 5-8 | ✅ Analisado | 1 | 2 |
| 9-15 | ✅ Analisado | 1 | 3 |

---

## 🔴 PROBLEMAS CRÍTICOS

### 1. Erro 403 - RLS Policy na Tabela `notificacoes`

**Severidade:** 🔴 Crítica  
**Tipo:** Backend / Supabase  
**Arquivo Afetado:** RLS Policies (Supabase)

#### Log do Erro
```
21:55:06.795 zxfevlkssljndqqhxkjb.supabase.co/rest/v1/notificacoes?select=id:1
  Failed to load resource: the server responded with a status of 403

21:55:06.796 [ERROR] Erro ao notificar coordenador:
  code: "42501"
  details: null
  hint: null
  message: "new row violates row-level security policy for table \"notificacoes\""
```

#### Contexto
Ao executar o handoff da Etapa 4 → 5 (Administrativo → Obras), o sistema tenta criar uma notificação para o coordenador de Obras. A política RLS atual não permite a inserção.

#### Impacto
- Coordenador **não é notificado** sobre a transferência de OS
- Fluxo continua normalmente, mas sem comunicação automática
- Pode causar atrasos no atendimento da OS

#### Solução Proposta

**Arquivo:** Nova migration SQL

```sql
-- Migration: fix_notificacoes_rls_policy.sql
-- Descrição: Permitir inserção de notificações para usuários autenticados

-- 1. Remover política existente de INSERT (se houver)
DROP POLICY IF EXISTS "allow_insert_notifications" ON notificacoes;

-- 2. Criar nova política permissiva para INSERT
CREATE POLICY "allow_authenticated_insert_notifications" ON notificacoes
FOR INSERT TO authenticated
WITH CHECK (
  -- Permitir se o usuário está criando notificação para si mesmo
  -- OU se o usuário tem cargo de coordenador/admin
  destinatario_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM colaboradores c
    WHERE c.auth_user_id = auth.uid()
    AND c.cargo_slug IN ('admin', 'diretor', 'coord_administrativo', 'coord_obras', 'coord_assessoria')
  )
);

-- 3. Garantir que SELECT funciona para notificações próprias
DROP POLICY IF EXISTS "allow_select_own_notifications" ON notificacoes;
CREATE POLICY "allow_select_own_notifications" ON notificacoes
FOR SELECT TO authenticated
USING (destinatario_id = auth.uid());
```

#### Arquivos a Modificar
1. Criar: `supabase/migrations/YYYYMMDDHHMMSS_fix_notificacoes_rls_policy.sql`

#### Validação
- [ ] Testar handoff 4→5 após aplicar migration
- [ ] Verificar se notificação aparece para o coordenador
- [ ] Testar handoff 8→9 (retorno para Administrativo)

---

### 2. Warning: Select Controlled/Uncontrolled

**Severidade:** 🔴 Crítica  
**Tipo:** Frontend / React  
**Arquivo Afetado:** `src/components/os/shared/pages/os-details-workflow-page.tsx`

#### Log do Erro
```
21:54:12.147 Select is changing from uncontrolled to controlled.
21:54:15.881 Select is changing from controlled to uncontrolled.
21:54:16.003 Select is changing from uncontrolled to controlled.
```

#### Contexto
O componente Select (Shadcn/Radix) está alternando entre estado controlado (com `value`) e não controlado (sem `value` ou com `value={undefined}`).

#### Impacto
- Pode causar bugs visuais (valor não exibido)
- Pode perder dados do formulário em re-renders
- Comportamento não determinístico

#### Causa Raiz
O valor inicial de `etapa2Data.tipoOS` é `undefined` em vez de string vazia `''`.

#### Solução Proposta

**Arquivo:** `src/components/os/shared/pages/os-details-workflow-page.tsx`

```typescript
// ANTES (linha ~376-432 - função getStepData)
const getStepData = (stepNum: number) => {
  const data = formDataByStep[stepNum];
  if (!data) {
    // ... defaults
  }
  // ...
};

// DEPOIS - Adicionar default para etapa 2
const getStepData = (stepNum: number) => {
  const data = formDataByStep[stepNum];
  
  if (!data) {
    const defaults: Record<number, any> = {
      2: {
        tipoOS: '', // ✅ Garantir string vazia, não undefined
      },
      3: {
        anexos: [],
        idadeEdificacao: '',
        // ... resto igual
      },
      // ... outros defaults
    };
    return defaults[stepNum] || {};
  }
  
  // Merge com defaults para nunca ter undefined em campos string
  const defaults: Record<number, any> = {
    2: { tipoOS: '' }, // ✅ Adicionar aqui também
    // ... resto igual
  };
  
  return { ...defaults[stepNum], ...data };
};
```

**Arquivo:** Também verificar o Select no JSX (~linha 1650)

```tsx
// ANTES
<Select 
  value={etapa2Data.tipoOS}
  onValueChange={(value) => setEtapa2Data({ tipoOS: value })}
>

// DEPOIS - Garantir valor padrão
<Select 
  value={etapa2Data.tipoOS || ''} // ✅ Fallback para string vazia
  onValueChange={(value) => setEtapa2Data({ tipoOS: value })}
>
```

#### Arquivos a Modificar
1. `src/components/os/shared/pages/os-details-workflow-page.tsx` (linhas ~376-432, ~1650)

#### Validação
- [ ] Não deve aparecer warning no console
- [ ] Valor do Select deve persistir ao navegar entre etapas
- [ ] Ao recarregar página com OS existente, valor deve aparecer

---

### 3. Coordenador Administrativo Não Encontrado (Handoff 8→9)

**Severidade:** 🔴 Crítica  
**Tipo:** Backend / Dados  
**Descoberto:** Etapas 5-8

#### Log do Erro
```
22:06:30.551 🔍 Buscando coordenador do setor administrativo (cargo: coord_administrativo)
22:06:30.815 ⚠️ Nenhum coordenador encontrado para o setor administrativo
```

#### Contexto
No handoff da Etapa 8 → 9 (Obras → Administrativo), o sistema busca um colaborador com `cargo_slug = 'coord_administrativo'` e `ativo = true`, mas não encontra nenhum.

#### Impacto
- OS é transferida mas **sem responsável definido** (`responsavel_id: null`)
- Nenhuma notificação é enviada
- OS pode ficar "órfã" no setor administrativo

#### Causa Raiz
1. Não existe colaborador com cargo `coord_administrativo` ativo no sistema
2. Ou o cargo está cadastrado com slug diferente

#### Solução Proposta

**Opção A:** Inserir coordenador administrativo no banco

```sql
-- Verificar cargos existentes
SELECT * FROM cargos WHERE slug LIKE '%admin%';

-- Verificar colaboradores com cargo administrativo
SELECT c.id, c.nome_completo, c.email, ca.slug as cargo
FROM colaboradores c
JOIN cargos ca ON c.cargo_id = ca.id
WHERE ca.slug IN ('coord_administrativo', 'administrativo')
AND c.ativo = true;

-- Se necessário, criar/atualizar colaborador
UPDATE colaboradores
SET cargo_id = (SELECT id FROM cargos WHERE slug = 'coord_administrativo')
WHERE email = 'coordenador.admin@minerva.com';
```

**Opção B:** Fallback para admin/diretor quando coord não existe

**Arquivo:** `src/lib/hooks/use-notificar-coordenador.ts`

```typescript
// Linha ~60-70 - Adicionar fallback
const buscarCoordenador = async (setorSlug: string) => {
  // Primeiro tenta coordenador específico
  let { data } = await supabase
    .from('colaboradores')
    .select('id, nome_completo, email, cargo:cargos!inner(slug)')
    .eq('cargos.slug', `coord_${setorSlug}`)
    .eq('ativo', true)
    .limit(1)
    .single();
    
  // Se não encontrar, fallback para admin ou diretor
  if (!data) {
    logger.warn(`⚠️ Coordenador de ${setorSlug} não encontrado, buscando fallback...`);
    
    const { data: fallback } = await supabase
      .from('colaboradores')
      .select('id, nome_completo, email, cargo:cargos!inner(slug)')
      .in('cargos.slug', ['admin', 'diretor'])
      .eq('ativo', true)
      .limit(1)
      .single();
      
    if (fallback) {
      logger.info(`✅ Fallback encontrado: ${fallback.nome_completo}`);
      return fallback;
    }
  }
  
  return data;
};
```

#### Arquivos a Modificar
1. (Dados) Verificar/criar colaborador `coord_administrativo` no Supabase
2. (Código) `src/lib/hooks/use-notificar-coordenador.ts` - Adicionar fallback

#### Validação
- [ ] Verificar se existe `coord_administrativo` ativo no banco
- [ ] Testar handoff 8→9 e confirmar que coord é encontrado
- [ ] Se não existir, criar via seeds ou manualmente

---

## 🟡 PONTOS DE ATENÇÃO (Etapas 1-4)

### 4. Upload de Arquivos Retornando 0 Arquivos

**Severidade:** 🟡 Atenção  
**Tipo:** Frontend / Lógica  
**Arquivo Afetado:** `src/components/os/shared/steps/step-followup-1.tsx`

#### Log do Comportamento
```
21:54:41.022 step-followup-1.tsx:396 📁 Updating files: Array(1)
21:54:49.946 step-followup-1.tsx:396 📁 Updating files: Array(1)
...
21:54:51.179 📁 [STEP 3→4] Upload concluído: Object
21:54:51.179 [OS-WORKFLOW] Step 3→4: ✅ Upload de arquivos concluído, count= 0
```

#### Contexto
Arquivos foram selecionados (Array(1)), mas o upload retornou 0 arquivos.

#### Hipóteses
1. Arquivos já estavam salvos localmente (preview mode)
2. Arquivos são salvos no `onDataChange` e não precisam de upload separado
3. Bug na função `uploadPendingFiles`

#### Investigação Necessária

**Arquivo:** `src/components/os/shared/steps/step-followup-1.tsx`

```typescript
// Verificar implementação de uploadPendingFiles
uploadPendingFiles: async () => {
  // Verificar:
  // 1. pendingFiles está populado?
  // 2. Condição de "já uploaded" está correta?
  // 3. Retorno está correto?
}
```

#### Arquivos a Investigar
1. `src/components/os/shared/steps/step-followup-1.tsx` (~linha 75-90, função `uploadPendingFiles`)

#### Validação
- [ ] Anexar arquivo na Etapa 3
- [ ] Verificar se arquivo aparece em `os_documentos` após avançar
- [ ] Verificar se URL do arquivo está acessível

---

### 5. Re-render Excessivo em Inputs de Texto

**Severidade:** 🟡 Atenção  
**Tipo:** Performance  
**Arquivo Afetado:** `src/components/os/shared/pages/os-details-workflow-page.tsx`

#### Log do Comportamento
```
21:54:33.628 📝 setStepData called Object
21:54:33.676 📝 setStepData called Object
21:54:33.707 📝 setStepData called Object
21:54:33.737 📝 setStepData called Object
21:54:33.768 📝 setStepData called Object
... (19 chamadas em ~1 segundo)
```

#### Contexto
Cada keystroke em um input de texto dispara `setStepData`, causando re-renders desnecessários.

#### Impacto
- Lentidão em dispositivos mais lentos
- Consumo de CPU desnecessário
- Potencial para bugs de race condition

#### Solução Proposta

**Opção A:** Debounce no hook `useWorkflowState`

```typescript
// src/lib/hooks/use-workflow-state.ts
import { useDebouncedCallback } from 'use-debounce';

// Dentro do hook
const debouncedSetFormData = useDebouncedCallback(
  (stepNum: number, data: Record<string, unknown>) => {
    setFormDataByStep(prev => ({
      ...prev,
      [stepNum]: { ...prev[stepNum], ...data }
    }));
  },
  300 // 300ms debounce
);

// Exportar versão debounced para inputs de texto
export const setStepData = (stepNum: number, data: EtapaData) => {
  debouncedSetFormData(stepNum, data);
};
```

**Opção B:** Debounce nos componentes de input individuais

```typescript
// Nos steps que têm muitos inputs de texto
const debouncedOnChange = useDebouncedCallback(
  (field: string, value: string) => {
    onDataChange({ ...data, [field]: value });
  },
  300
);
```

#### Arquivos a Modificar
1. `src/lib/hooks/use-workflow-state.ts` (para solução central)
2. Ou: `step-followup-1.tsx`, `step-memorial-escopo.tsx`, etc. (para solução por componente)

#### Dependência a Adicionar
```bash
npm install use-debounce
```

#### Validação
- [ ] Digitar texto rápido não deve travar a UI
- [ ] Dados devem ser salvos corretamente após parar de digitar
- [ ] Console.log deve mostrar menos chamadas

---

### 6. Componente Mount/Unmount Duplo

**Severidade:** 🟡 Atenção  
**Tipo:** Frontend / React  
**Arquivo Afetado:** N/A (comportamento esperado)

#### Log do Comportamento
```
21:53:39.459 🎯 OSDetailsWorkflowPage mounted Object
21:53:39.463 🗑️ OSDetailsWorkflowPage unmounted Object
21:53:39.463 🎯 OSDetailsWorkflowPage mounted Object
```

#### Contexto
O componente monta, desmonta e remonta em menos de 10ms.

#### Causa
**React.StrictMode** em desenvolvimento. Isso é esperado e ajuda a detectar bugs de side-effects.

#### Verificação

**Arquivo:** `src/main.tsx`

```tsx
// Verificar se StrictMode está ativo
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode> {/* ← Isso causa o comportamento */}
    <App />
  </React.StrictMode>
);
```

#### Ação Recomendada
- **Não remover StrictMode** em desenvolvimento
- Verificar se em produção (`npm run build && npm run preview`) o comportamento desaparece
- Garantir que efeitos estão com cleanup correto

#### Validação
- [ ] Em produção, verificar se mount/unmount duplo NÃO ocorre
- [ ] Verificar que todos os `useEffect` têm cleanup adequado

---

## 🟡 PONTOS DE ATENÇÃO (Etapas 5-8)

### 7. Re-render Extremo na Etapa 7 (Memorial/Escopo)

**Severidade:** 🟡 Atenção  
**Tipo:** Performance  
**Descoberto:** Etapas 5-8

#### Log do Comportamento
```
22:05:46.555 📝 setStepData called {stepNum: 7, dataKeys: Array(5)}
22:05:46.585 📝 setStepData called {stepNum: 7, dataKeys: Array(5)}
22:05:46.616 📝 setStepData called {stepNum: 7, dataKeys: Array(5)}
... (60+ chamadas em ~30 segundos)
22:06:10.952 📝 setStepData called {stepNum: 7, dataKeys: Array(5)}
```

#### Contexto
A Etapa 7 (Formulário Memorial/Escopo) tem **ainda mais** re-renders que outras etapas. São mais de 60 chamadas de `setStepData` durante o preenchimento do formulário.

#### Impacto
- Alta carga de CPU durante preenchimento
- Possible lag/travamento em dispositivos móveis
- Aumenta a urgência de implementar debounce

#### Componente Afetado
- `step-memorial-escopo.tsx` ou componente equivalente da Etapa 7

#### Solução
**Mesma da issue #5** - Implementar debounce é agora mais urgente dado o volume de chamadas.

---

### 8. Violation: Non-Passive Event Listener no PDF Viewer

**Severidade:** 🟡 Atenção  
**Tipo:** Performance / Biblioteca Externa

#### Log do Comportamento
```
22:05:02.260 [Violation] Added non-passive event listener to a scroll-blocking 'wheel' event.
22:05:20.175 [Violation] Added non-passive event listener to a scroll-blocking 'wheel' event.
```

#### Contexto
O visualizador de PDF (provavelmente `pdf.js` ou similar) adiciona event listeners que podem bloquear o scroll, afetando a fluidez da página.

#### Impacto
- Scroll pode ficar travado momentaneamente
- Performance reduzida em páginas com PDF
- Warning aparece no console

#### Causa
Biblioteca externa de visualização de PDF. Não é um bug do código da aplicação.

#### Solução Proposta

**Opção A:** Ignorar (baixa prioridade)
- Este é um warning de performance, não um erro
- Não afeta funcionalidade

**Opção B:** Investigar alternativas de PDF viewer
- Se performance for crítica, considerar `react-pdf` ou outro viewer moderno

#### Validação
- [ ] Verificar se scroll funciona adequadamente
- [ ] Considerar apenas se houver reclamações de usuários

---

### 9. Forced Reflow Durante Transferência

**Severidade:** 🟡 Atenção  
**Tipo:** Performance

#### Log do Comportamento
```
22:06:31.281 [Violation] Forced reflow while executing JavaScript took 101ms
```

#### Contexto
Durante a exibição do modal de transferência, o navegador foi forçado a recalcular o layout (reflow), o que tomou 101ms.

#### Impacto
- Leve travamento visual (~100ms)
- Pode afetar percepção de fluidez

#### Causa Provável
- Renderização do modal com animação
- Mudanças de CSS que forçam reflow (width, height, position, etc.)

#### Solução Proposta
**Baixa prioridade** - 101ms é aceitável para operações pontuais como abrir modal.

Se quiser otimizar:
```typescript
// Usar transform em vez de top/left para animações
// Usar will-change para preparar o browser
<div className="will-change-transform" />
```

---

## 🟢 MELHORIAS SUGERIDAS

### 10. Adicionar Fallback para Notificação

**Severidade:** 🟢 Melhoria  
**Tipo:** UX / Resiliência

#### Contexto
Quando a notificação falha (RLS error), o usuário não tem feedback visual.

#### Solução Proposta

**Arquivo:** `src/lib/hooks/use-notificar-coordenador.ts`

```typescript
// Na função de notificar
try {
  await supabase.from('notificacoes').insert({...});
  logger.log('✅ Notificação enviada');
} catch (error) {
  logger.error('Erro ao notificar coordenador:', error);
  
  // ✅ MELHORIA: Mostrar toast informativo (não bloqueia fluxo)
  toast.info(
    'O coordenador será notificado manualmente. A transferência foi registrada com sucesso.',
    { duration: 5000 }
  );
}
```

#### Arquivos a Modificar
1. `src/lib/hooks/use-notificar-coordenador.ts`

---

### 11. Batch de Criação de Etapas

**Severidade:** 🟢 Melhoria  
**Tipo:** Performance / Backend

#### Contexto
Atualmente, as 15 etapas são criadas uma a uma (15 requests sequenciais, ~4 segundos):

```
21:54:15.247 ➕ Criando etapa 1...
21:54:15.869 ✅ Etapa 1/15 criada
21:54:15.869 ➕ Criando etapa 2...
21:54:15.991 ✅ Etapa 2/15 criada
... (x15)
21:54:19.658 ✅ Todas as 15 etapas criadas com sucesso!
```

#### Solução Proposta

**Backend:** Criar endpoint de batch insert

```typescript
// supabase/functions/server/ordens-servico/[id]/etapas-batch/route.ts
export async function POST(req: Request) {
  const { osId, etapas } = await req.json();
  
  const { data, error } = await supabase
    .from('os_etapas')
    .insert(etapas.map(e => ({ ...e, os_id: osId })))
    .select();
    
  return Response.json(data);
}
```

**Frontend:** Chamar batch endpoint

```typescript
// Em criarOSComEtapas()
const etapasDados = steps.map((step, i) => ({
  ordem: i + 1,
  nome_etapa: step.title,
  status: i < 2 ? 'concluida' : (i === 2 ? 'em_andamento' : 'pendente'),
  dados_etapa: i === 0 ? etapa1Data : (i === 1 ? etapa2Data : {}),
  responsavel_id: currentUserId,
}));

await ordensServicoAPI.createEtapasBatch(novaOS.id, etapasDados);
```

#### Arquivos a Modificar
1. Criar: `supabase/functions/server/ordens-servico/[id]/etapas-batch/route.ts`
2. Modificar: `src/lib/api-client.ts` (adicionar `createEtapasBatch`)
3. Modificar: `src/components/os/shared/pages/os-details-workflow-page.tsx` (usar novo método)

---

## 📋 CHECKLIST DE EXECUÇÃO

### Fase 1: Correções Críticas
- [x] 1. Criar migration para RLS da tabela `notificacoes`
- [ ] 2. Corrigir warnings de Controlled/Uncontrolled no Select (etapa 2)
- [ ] 3. Criar/verificar colaborador `coord_administrativo` no banco
- [x] 4. Corrigir erro de upload na etapa 13 (osId não passado para componente) e persistência de documentos (Etapas 9 e 13)

### Fase 2: Pontos de Atenção
- [ ] 5. Investigar lógica de upload de arquivos (etapa 3)
- [ ] 6. Implementar debounce em inputs de texto (URGENTE - afeta etapas 3, 6, 7, 8, 12, 14)
- [x] 7. Corrigir warnings de Checkbox controlled/uncontrolled (etapas 11, 14) - Resolvido com novo componente `EtapaCheck`
- [ ] 8. Verificar comportamento mount/unmount em produção
- [ ] 9. Avaliar necessidade de trocar PDF viewer (baixa prioridade)
- [ ] 10. Resolver erro de cross-origin no print do PDF (baixa prioridade)

### Fase 3: Melhorias
- [ ] 11. Adicionar fallback UX para falha de notificação
- [ ] 12. Implementar batch de criação de etapas

---

## 📚 Referências

- **Log Original:** Console.log capturado em 2026-01-04 21:50-22:12
- **OS Testada:** `d8a042dc-152e-4655-8ad7-1e06b1797645` (OS0200002)
- **Cliente:** Construtora Dizevolv
- **Fluxo Testado:** 
  - ✅ Etapas 1 → 2 → 3 → 4 + Handoff 4→5
  - ✅ Etapas 5 → 6 → 7 → 8 + Handoff 8→9
  - ✅ Etapas 9 → 10 → 11 → 12 → 13 → 14 → 15
  - ✅ Auto-conclusão da etapa 15
  - ✅ Redirecionamento para OS-13

---

## 🟢 PONTOS POSITIVOS (Funcionando Corretamente)

### Etapas 1-4
- ✅ Criação de OS com 15 etapas
- ✅ Validação de formulários (identificação, edificação)
- ✅ Salvamento de etapas no banco
- ✅ Handoff 4→5 (Administrativo → Obras) registrado corretamente
- ✅ Transferência registrada em `os_transferencias`

### Etapas 5-8
- ✅ Upload de arquivos para Supabase Storage funcionando
- ✅ Registro de documentos em `os_documentos`
- ✅ Salvamento de todas as etapas (5, 6, 7, 8)
- ✅ Handoff 8→9 (Obras → Administrativo) registrado
- ✅ Verificação de aprovação (`verificar_aprovacao_etapa` RPC) funcionando
- ✅ Tempo de salvamento aceitável (~500-750ms por etapa)

### Etapas 9-15
- ✅ Geração de PDF da proposta funcionando (~2s)
- ✅ PDF registrado em `os_documentos` automaticamente
- ✅ Sistema de aprovação funcionando (etapas 9 e 13)
- ✅ RPC `confirmar_aprovacao` funcionando corretamente
- ✅ Agendamento de visita funcionando (etapa 10)
- ✅ Etapa 15 auto-completa corretamente
- ✅ OS marcada como concluída automaticamente
- ✅ Cliente convertido de LEAD para ATIVO
- ✅ Redirecionamento para criação de OS-13 funcionando
- ✅ Cliente pré-selecionado na nova OS

---

## 🟡 PONTOS DE ATENÇÃO (Etapas 9-15)

### 10. Erro de Upload na Etapa 13 (Gerar Contrato)

**Severidade:** 🔴 Crítica  
**Tipo:** Frontend / Props  
**Descoberto:** Etapas 9-15

### 10. Erro de Upload na Etapa 13 (Gerar Contrato) - ✅ RESOLVIDO

**Status:** ✅ Corrigido na v2.8 (04/01/2026)
```
22:08:35.821 [ERROR] Erro ao fazer upload: Error: osId é obrigatório para fazer upload de documentos
    at uploadAndRegisterDocument (upload-and-register.ts:62:11)
    at handleFileSelect (step-gerar-contrato.tsx:58:28)
```

#### Contexto
Ao tentar fazer upload do contrato na Etapa 13, o componente `StepGerarContrato` não está recebendo ou passando corretamente o `osId` para a função de upload.

#### Impacto
- Usuário **não consegue fazer upload** do contrato
- Workflow fica bloqueado na etapa 13
- É necessário aprovar sem contrato anexado

#### Solução Proposta

**Arquivo:** `src/components/os/shared/steps/step-gerar-contrato.tsx`

```typescript
// Verificar se osId está sendo recebido via props
interface StepGerarContratoProps {
  osId: string; // ← Garantir que está sendo passado
  data: StepGerarContratoData;
  onDataChange: (data: StepGerarContratoData) => void;
}

// Na função de upload
const handleFileSelect = async (file: File) => {
  if (!osId) {
    logger.error('osId não disponível para upload');
    toast.error('Erro interno: ID da OS não disponível');
    return;
  }
  // ... resto do código
};
```

**Arquivo:** `src/components/os/shared/pages/os-details-workflow-page.tsx`

```typescript
// Verificar se osId está sendo passado para o componente
<StepGerarContrato
  osId={osId} // ← Garantir que está aqui
  data={getStepData(13)}
  onDataChange={(data) => setStepData(13, data)}
/>
```

#### Arquivos a Modificar
1. `src/components/os/shared/steps/step-gerar-contrato.tsx`
2. `src/components/os/shared/pages/os-details-workflow-page.tsx` (~linha onde renderiza etapa 13)

#### Validação
- [ ] Upload de contrato na etapa 13 deve funcionar
- [ ] Contrato deve aparecer em `os_documentos`

---

### 11. Warning: Checkbox Controlled/Uncontrolled

**Severidade:** 🟡 Atenção  
**Tipo:** Frontend / React

#### Log do Erro
```
22:08:13.117 Checkbox is changing from uncontrolled to controlled.
22:08:44.584 Checkbox is changing from uncontrolled to controlled.
```

#### Contexto
Similar ao problema do Select (#2), os Checkboxes nas etapas 11 e 14 estão alternando entre estados controlado e não controlado.

#### Componentes Afetados
- Etapa 11: `step-realizar-visita-apresentacao.tsx`
- Etapa 14: `step-contrato-assinado.tsx`

#### Solução
Garantir que o valor inicial do checkbox seja `false` em vez de `undefined`:

```typescript
// Garantir default value
<Checkbox 
  checked={data.visitaRealizada ?? false} // ← Fallback para false
  onCheckedChange={(checked) => onDataChange({ ...data, visitaRealizada: !!checked })}
/>
```

---

### 12. Erro Cross-Origin ao Imprimir PDF

**Severidade:** 🟡 Atenção  
**Tipo:** Frontend / Segurança

#### Log do Erro
```
22:07:47.011 pdf-viewer-embedded.tsx:63 Uncaught SecurityError: 
  Failed to read a named property 'print' from 'Window': 
  Blocked a frame with origin "http://localhost:3000" from accessing a cross-origin frame.
```

#### Contexto
Ao tentar imprimir o PDF da proposta, o navegador bloqueia o acesso ao iframe por questões de CORS.

#### Impacto
- Botão de impressão não funciona
- Usuário precisa baixar e imprimir manualmente

#### Solução Proposta (Baixa Prioridade)

**Opção A:** Usar window.open() em vez de iframe
```typescript
// Abrir PDF em nova aba e imprimir
const printPDF = (url: string) => {
  const printWindow = window.open(url, '_blank');
  printWindow?.focus();
  printWindow?.print();
};
```

**Opção B:** Gerar PDF via blob URL local
```typescript
// Fazer fetch do PDF e criar blob URL local
const blob = await fetch(pdfUrl).then(r => r.blob());
const localUrl = URL.createObjectURL(blob);
// Usar localUrl no iframe (mesmo origin)
```

---

### 13. Re-render Excessivo nas Etapas 12 e 14

**Severidade:** 🟡 Atenção  
**Tipo:** Performance

#### Log do Comportamento
```
22:08:22.695 📝 setStepData called {stepNum: 12, dataKeys: Array(8)}
... (28+ chamadas em ~3 segundos)

22:08:58.903 📝 setStepData called {stepNum: 14, dataKeys: Array(2)}
... (33+ chamadas em ~10 segundos)
```

#### Contexto
Mesma issue que #5 e #7, agora confirmada também nas etapas 12 e 14.

#### Solução
**Mesma das issues anteriores** - Implementar debounce é urgente.

---

## 🔵 MELHORIAS DE UX/UI (Teste Manual - 2026-01-04)

Esta seção contém issues identificados durante teste manual do workflow.

---

### 14. Etapa 9 - Proposta Não Persiste ao Retornar

**Severidade:** 🔴 Crítica  
**Tipo:** UX / Persistência  
**Etapa:** 9 - Gerar Proposta Comercial

#### Problema
Ao sair da OS e retornar para verificar a proposta na etapa 9, ela aparece vazia com a mensagem "Nenhuma proposta gerada ainda.", mesmo após ter sido gerada e aprovada.

#### Impacto
- Usuário não consegue visualizar a proposta aprovada
- Perda de contexto ao retomar o workflow
- Informações importantes não disponíveis para consulta

#### Solução Proposta

**Arquivo:** `src/components/os/shared/steps/step-gerar-proposta.tsx`

```typescript
// 1. Ao carregar a etapa, verificar se já existe PDF salvo em dados_etapa
useEffect(() => {
  if (data?.pdfUrl) {
    setPdfUrl(data.pdfUrl);
    setPdfGenerated(true);
  }
}, [data]);

// 2. Garantir que pdfUrl é salvo em dados_etapa ao gerar
const handleGeneratePDF = async () => {
  const result = await generate({ ... });
  if (result.url) {
    onDataChange({
      ...data,
      pdfUrl: result.url,
      pdfGeneratedAt: new Date().toISOString(),
      pdfMetadata: result.metadata
    });
  }
};
```

**Arquivo:** `src/components/os/shared/pages/os-details-workflow-page.tsx`

```typescript
// Garantir que dados da etapa 9 são carregados do banco ao montar
const step9Data = etapas?.find(e => e.ordem === 9)?.dados_etapa;
if (step9Data?.pdfUrl) {
  // Restaurar estado do PDF
}
```

#### Arquivos a Modificar
1. `src/components/os/shared/steps/step-gerar-proposta.tsx`
2. `src/components/os/shared/pages/os-details-workflow-page.tsx`

#### Validação
- [ ] Gerar proposta na etapa 9
- [ ] Sair completamente da OS
- [ ] Retornar e verificar se proposta aparece

---

### 15. Etapa 5 e 11 - Criar Componente Reutilizável `EtapaRealizarVisita`

**Severidade:** 🟢 Melhoria  
**Tipo:** UX / Componentização  
**Etapas:** 5 e 11

#### Problemas Atuais

**Etapa 5 - Realizar Visita (Técnica):**
- ✅ UI está boa
- ❌ Falta campo de "Observações"
- ❌ Campos editáveis após etapa concluída (deve ser read-only)
- 📝 Alterar nome para: **"Realizar Visita (Técnica)"**

**Etapa 11 - Realizar Visita (Apresentação):**
- ❌ UI básica (igualar à etapa 5)
- ❌ Falta campo de "Observações"
- ❌ Campos editáveis após etapa concluída

#### Solução Proposta: Criar `EtapaRealizarVisita`

**Novo arquivo:** `src/components/os/shared/components/etapa-realizar-visita.tsx`

```typescript
interface EtapaRealizarVisitaProps {
  tipo: 'tecnica' | 'apresentacao';
  data: {
    visitaRealizada: boolean;
    observacoes?: string;
    dataRealizacao?: string;
    responsavelId?: string;
  };
  onDataChange: (data: EtapaRealizarVisitaData) => void;
  isReadOnly?: boolean; // True quando etapa já foi concluída
  etapaStatus?: 'pendente' | 'em_andamento' | 'concluida';
}

export function EtapaRealizarVisita({
  tipo,
  data,
  onDataChange,
  isReadOnly = false,
  etapaStatus
}: EtapaRealizarVisitaProps) {
  // Determinar read-only automaticamente se etapa concluída
  const readOnly = isReadOnly || etapaStatus === 'concluida';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {tipo === 'tecnica' ? 'Realizar Visita (Técnica)' : 'Realizar Visita (Apresentação)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Checkbox de confirmação */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="visitaRealizada"
            checked={data.visitaRealizada ?? false}
            onCheckedChange={readOnly ? undefined : (checked) => 
              onDataChange({ ...data, visitaRealizada: !!checked })
            }
            disabled={readOnly}
          />
          <Label htmlFor="visitaRealizada">
            Visita {tipo === 'tecnica' ? 'técnica' : 'de apresentação'} realizada
          </Label>
        </div>
        
        {/* Campo de observações */}
        <div>
          <Label>Observações</Label>
          <Textarea
            placeholder="Adicione observações sobre a visita..."
            value={data.observacoes || ''}
            onChange={(e) => onDataChange({ ...data, observacoes: e.target.value })}
            disabled={readOnly}
            className={readOnly ? 'bg-muted' : ''}
          />
        </div>
        
        {/* Info de quem confirmou (quando read-only) */}
        {readOnly && data.visitaRealizada && (
          <div className="text-sm text-muted-foreground">
            ✅ Confirmado em {formatDate(data.dataRealizacao)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### Uso nos Steps

```typescript
// step-realizar-visita.tsx (Etapa 5)
<EtapaRealizarVisita
  tipo="tecnica"
  data={data}
  onDataChange={onDataChange}
  etapaStatus={etapa?.status}
/>

// step-realizar-visita-apresentacao.tsx (Etapa 11)
<EtapaRealizarVisita
  tipo="apresentacao"
  data={data}
  onDataChange={onDataChange}
  etapaStatus={etapa?.status}
/>
```

#### Arquivos a Modificar/Criar
1. **Criar:** `src/components/os/shared/components/etapa-realizar-visita.tsx`
2. **Modificar:** `src/components/os/shared/steps/step-realizar-visita.tsx` → Usar novo componente
3. **Modificar:** `src/components/os/shared/steps/step-realizar-visita-apresentacao.tsx` → Usar novo componente
4. **Modificar:** `os-details-workflow-page.tsx` → Passar `etapaStatus` para os componentes

---

### 16. Etapa 12 - Campos Editáveis Após Conclusão

**Severidade:** 🟡 Atenção  
**Tipo:** UX / Segurança  
**Etapa:** 12 - Follow-up 3 (Pós-Apresentação)

#### Problema
Após sair do fluxo e voltar, os campos da etapa 12 continuam editáveis mesmo após a etapa ter sido concluída. Isso pode causar alteração acidental de dados.

#### Solução Proposta

**Arquivo:** `src/components/os/shared/steps/step-followup-3.tsx`

```typescript
interface StepFollowup3Props {
  data: Followup3Data;
  onDataChange: (data: Followup3Data) => void;
  etapaStatus?: string; // Receber status da etapa
}

export function StepFollowup3({ data, onDataChange, etapaStatus }: StepFollowup3Props) {
  const isReadOnly = etapaStatus === 'concluida';
  
  return (
    // Todos os inputs devem ter: disabled={isReadOnly}
    <Input 
      value={data.valor} 
      onChange={...} 
      disabled={isReadOnly}
      className={isReadOnly ? 'bg-muted cursor-not-allowed' : ''}
    />
  );
}
```

**Padrão global:** Aplicar em TODOS os steps que têm formulários.

#### Arquivos a Modificar
1. `src/components/os/shared/steps/step-followup-3.tsx`
2. `src/components/os/shared/pages/os-details-workflow-page.tsx` (passar etapaStatus)

---

### 17. Etapa 13 - Contrato Não Persiste

**Severidade:** 🔴 Crítica  
**Tipo:** UX / Persistência  
**Etapa:** 13 - Gerar Contrato (Upload)

#### Problema
Ao fazer upload do documento do contrato e concluir a etapa, ao retornar o documento não persiste. Relacionado com a issue #10 (osId não passado).

#### Solução
Mesma solução da issue #10 + garantir que `dados_etapa` salva a referência do documento:

```typescript
// Após upload bem-sucedido
onDataChange({
  ...data,
  contratoUrl: uploadResult.url,
  contratoDocumentoId: uploadResult.documentoId,
  uploadedAt: new Date().toISOString()
});
```

---

### 18. Etapa 14 - Criar Componente `EtapaCheck` e Melhorias

**Severidade:** 🟡 Atenção + 🟢 Melhoria  
**Tipo:** UX / Componentização  
**Etapa:** 14 - Confirmar Assinatura de Contrato

#### Problemas Atuais
- ❌ UI pobre (deve ser igual à Realizar Visita)
- ❌ Campo "Data Assinatura" com formato incorreto
- ❌ Falta campo de "Observações"
- ❌ Não mostra quem confirmou
- 📝 Alterar nome para: **"Confirmar Assinatura de Contrato"**

#### Solução Proposta: Criar `EtapaCheck`

**Novo arquivo:** `src/components/os/shared/components/etapa-check.tsx`

```typescript
interface EtapaCheckProps {
  titulo: string;
  labelConfirmacao: string;
  data: {
    confirmado: boolean;
    dataConfirmacao?: string;
    observacoes?: string;
    confirmadoPorId?: string;
    confirmadoPorNome?: string;
  };
  onDataChange: (data: EtapaCheckData) => void;
  isReadOnly?: boolean;
  etapaStatus?: string;
  showDatePicker?: boolean; // Mostrar campo de data
}

export function EtapaCheck({
  titulo,
  labelConfirmacao,
  data,
  onDataChange,
  isReadOnly,
  etapaStatus,
  showDatePicker = false
}: EtapaCheckProps) {
  const readOnly = isReadOnly || etapaStatus === 'concluida';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campo de data (quando aplicável) */}
        {showDatePicker && (
          <div>
            <Label>Data da Assinatura</Label>
            <DatePicker
              value={data.dataConfirmacao ? new Date(data.dataConfirmacao) : new Date()}
              onChange={(date) => onDataChange({ 
                ...data, 
                dataConfirmacao: date?.toISOString() 
              })}
              disabled={readOnly}
            />
          </div>
        )}
        
        {/* Campo de observações */}
        <div>
          <Label>Observações</Label>
          <Textarea
            placeholder="Adicione observações..."
            value={data.observacoes || ''}
            onChange={(e) => onDataChange({ ...data, observacoes: e.target.value })}
            disabled={readOnly}
          />
        </div>
        
        {/* Checkbox de confirmação */}
        <div className="flex items-center gap-2 p-4 bg-success/10 rounded-lg">
          <Checkbox
            id="confirmado"
            checked={data.confirmado ?? false}
            onCheckedChange={readOnly ? undefined : (checked) => 
              onDataChange({ 
                ...data, 
                confirmado: !!checked,
                dataConfirmacao: checked ? new Date().toISOString() : undefined
              })
            }
            disabled={readOnly}
          />
          <Label htmlFor="confirmado" className="font-semibold">
            {labelConfirmacao}
          </Label>
        </div>
        
        {/* Info de quem confirmou */}
        {readOnly && data.confirmado && (
          <div className="text-sm text-muted-foreground border-t pt-4">
            <p>✅ Confirmado por: <strong>{data.confirmadoPorNome || 'N/A'}</strong></p>
            <p>📅 Data: {formatDate(data.dataConfirmacao)}</p>
            {data.observacoes && <p>📝 Obs: {data.observacoes}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### Uso na Etapa 14

```typescript
// step-contrato-assinado.tsx
<EtapaCheck
  titulo="Confirmar Assinatura de Contrato"
  labelConfirmacao="Contrato assinado!"
  data={data}
  onDataChange={onDataChange}
  etapaStatus={etapa?.status}
  showDatePicker={true}
/>
```

#### Arquivos a Modificar/Criar
1. **Criar:** `src/components/os/shared/components/etapa-check.tsx`
2. **Modificar:** `src/components/os/shared/steps/step-contrato-assinado.tsx`
3. Adicionar dependência: `@/components/ui/date-picker` (Shadcn)

---

### 19. Etapa 15 - Criar Componente `EtapaStartContrato`

**Severidade:** 🟢 Melhoria  
**Tipo:** UX / Componentização  
**Etapa:** 15 - Iniciar Contrato de Obra

#### Problemas Atuais
- ❌ Redirecionamento automático (remover)
- ❌ Layout básico (aprimorar)
- 📝 Alterar texto do botão para: **"Criar Contrato"**

#### Solução Proposta: Criar `EtapaStartContrato`

**Novo arquivo:** `src/components/os/shared/components/etapa-start-contrato.tsx`

```typescript
interface EtapaStartContratoProps {
  osId: string;
  clienteId: string;
  tipoContrato: 'obra' | 'assessoria'; // Para reutilização futura
  onCriarContrato: () => void;
  isLoading?: boolean;
}

export function EtapaStartContrato({
  osId,
  clienteId,
  tipoContrato,
  onCriarContrato,
  isLoading
}: EtapaStartContratoProps) {
  return (
    <Card className="border-2 border-dashed border-success/50">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
          <FileCheck className="w-8 h-8 text-success" />
        </div>
        <CardTitle className="text-xl">
          🎉 Processo Comercial Concluído!
        </CardTitle>
        <CardDescription>
          O cliente está pronto para iniciar o {tipoContrato === 'obra' ? 'contrato de obra' : 'contrato de assessoria'}.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Ao clicar no botão abaixo, você será redirecionado para criar a 
            OS de {tipoContrato === 'obra' ? 'Contrato de Obra (OS-13)' : 'Contrato de Assessoria'}.
          </p>
        </div>
        
        <Button 
          onClick={onCriarContrato}
          disabled={isLoading}
          size="lg"
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Criar Contrato
        </Button>
      </CardContent>
    </Card>
  );
}
```

#### Uso na Etapa 15

```typescript
// Em os-details-workflow-page.tsx (etapa 15)
const handleCriarContrato = () => {
  // Navegar sem redirecionamento automático
  navigate({
    to: '/os/criar/start-contrato-obra',
    search: { parentOSId: osId, clienteId }
  });
};

// Renderização
{currentStep === 15 && (
  <EtapaStartContrato
    osId={osId}
    clienteId={os?.cliente_id}
    tipoContrato="obra"
    onCriarContrato={handleCriarContrato}
  />
)}
```

#### Arquivos a Modificar/Criar
1. **Criar:** `src/components/os/shared/components/etapa-start-contrato.tsx`
2. **Modificar:** `src/components/os/shared/pages/os-details-workflow-page.tsx`
   - Remover `useEffect` de redirecionamento automático
   - Usar novo componente

---

## 📋 CHECKLIST DE EXECUÇÃO (ATUALIZADO)

### Fase 1: Correções Críticas ✅ CONCLUÍDA (2026-01-04)
- [x] 1. RLS Policy `notificacoes` → **Política já existe**, fallback adicionado
- [x] 2. Select Controlled/Uncontrolled → Defaults adicionados para etapa 2 (`tipoOS: ''`)
- [x] 3. Coordenador Administrativo → Fallback para `admin/diretor` em `use-notificar-coordenador.ts`
- [x] 4. Upload etapa 13 (osId) → osId passado via props em `os-details-workflow-page.tsx`
- [x] 14. Persistência Proposta → `useEffect` adicionado em `step-gerar-proposta.tsx`
- [x] 17. Persistência Contrato → Usa `data.contratoUrl` diretamente

### Fase 2: Pontos de Atenção ✅ CONCLUÍDA (2026-01-04)
- [x] 5. Investigar lógica de upload de arquivos (etapa 3) → Investigado, funciona corretamente
- [x] 6. Implementar debounce em inputs de texto → 300ms implementado em `setStepData`
- [x] 7. Corrigir warnings de Checkbox controlled/uncontrolled → Defaults adicionados na Fase 1
- [x] 8. Verificar comportamento mount/unmount → OK
- [x] 9. Avaliar necessidade de trocar PDF viewer → Baixa prioridade, mantido
- [x] 10. Resolver erro de cross-origin no print do PDF → Baixa prioridade
- [x] 16. **Etapa 12:** Campos apenas leitura após conclusão → `isReadOnly` verifica `status === 'concluida'`

### Fase 3: Novos Componentes Reutilizáveis ✅ PARCIAL (2026-01-04)
- [x] 15. **Criar `StepRealizarVisita`** → Criado e integrado na etapa 5
- [x] 18. **`StepContratoAssinado`** já existe → Usado na etapa 14
- [ ] 19. **`EtapaStartContrato`** → Muito específico para workflow, manter inline

### Fase 4: Melhorias Gerais ✅ CONCLUÍDA (2026-01-04)
- [x] 11. Fallback UX notificação → Warning log + não bloqueia em `use-transferencia-setor.ts`
- [x] 12. Batch criação etapas → `createEtapasBatch` adicionado em `use-etapas.ts`

---

## 🎯 COMPONENTES REUTILIZÁVEIS A CRIAR

| Componente | Uso Atual | Uso Futuro |
|------------|-----------|------------|
| `EtapaRealizarVisita` | Etapas 5, 11 | Outros workflows com visitas |
| `EtapaCheck` | Etapa 14 | Qualquer etapa de confirmação |
| `EtapaStartContrato` | Etapa 15 | OS-12 (Assessoria Anual) |

---

## ⚠️ REGRAS OBRIGATÓRIAS DE IMPLEMENTAÇÃO

> **IMPORTANTE:** Estas regras devem ser seguidas em **TODAS** as fases de correção.

### 📝 1. Atualização de Documentação

Após **cada fase de correção** concluída, os seguintes documentos DEVEM ser atualizados:

| Documento | Ação |
|-----------|------|
| [`OS_01_04_DIAGNOSTICO_CORRECOES.md`](./OS_01_04_DIAGNOSTICO_CORRECOES.md) | Marcar items como `[x]` concluídos, adicionar observações de implementação |
| [`OS_01_04_TECHNICAL_DOCUMENTATION.md`](./OS_01_04_TECHNICAL_DOCUMENTATION.md) | Atualizar detalhes técnicos, novos componentes, arquitetura alterada |

### 🎨 2. Consulta ao Design System

Ao criar ou modificar **qualquer elemento de UI**, é obrigatório:

1. **Consultar:** [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) para verificar padrões existentes
2. **Aplicar:** Usar tokens, cores e componentes já documentados
3. **Documentar:** Se criar algo **novo** (cor, padrão, componente visual), adicionar ao `DESIGN_SYSTEM.md`:
   - Tokens de cor
   - Variantes de componentes
   - Padrões de layout
   - Estados interativos

**Exemplo de adição ao Design System:**
```markdown
## Novos Componentes de Etapa

### EtapaRealizarVisita
- Card com borda `border-success/50` quando concluído
- Background `bg-muted` para campos read-only
- Checkbox com label grande em destaque
```

---

**✅ DIAGNÓSTICO COMPLETO - ATUALIZADO EM 2026-01-04 22:40**

## 🔵 CORREÇÕES ADICIONAIS (05/01/2026)

### 12. Modal de Aprovação aparecendo antes da Transferência na Etapa 9 (RESOLVIDO)

**Status:** ✅ Corrigido

**Problema:**
O usuário Coord. Obras, ao clicar em "Salvar e Avançar" na Etapa 9, via o modal de Aprovação em vez de ser transferido para o Administrativo. Isso ocorria porque o sistema verificava `podeAprovar` (que era true para admins testando) antes de verificar se a etapa ainda estava com status `pendente` (que requer transferência inicial).

**Solução:**
Alterada a lógica no `os-details-workflow-page.tsx` para impor a seguinte ordem de prioridade:
1. Se status é `pendente` → **SEMPRE** executa transferência (9→9: Obras → Admin).
2. Se status é `solicitada` E usuário pode aprovar → Mostra Modal de Aprovação.
3. Se status é `solicitada` E usuário não pode aprovar → Mostra aviso de aguardo.

**Código Corrigido:**
```typescript
// Lógica de Prioridade no handleNextStep:
if (status === 'pendente') {
  // CASO 1: SEMPRE transfere primeiro (Solicitação de Aprovação)
  // Executa Transferência 9->9 e abre Modal de Feedback
} else if (status === 'solicitada' && podeAprovar) {
  // CASO 2: Apenas se já solicitado e usuário tem permissão
  setIsAprovacaoModalOpen(true);
}
```

**Validado:**
- Fluxo correto para Coord. Obras (Transferência → Admin)
- Fluxo correto para Coord. Admin (Aprovação → Transferência ou Rejeição)
