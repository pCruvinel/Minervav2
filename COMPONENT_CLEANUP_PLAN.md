# 📋 PLANO DE CORREÇÃO - Componentes MinervaV2

**Data:** 2025-11-23
**Branch:** `claude/audit-components-checklist-01P2X9iyZeN33EDXWsooj815`

Este documento contém o plano detalhado de execução para correção dos problemas identificados no diagnóstico de componentes.

---

## 🎯 RESUMO EXECUTIVO

### Estatísticas de Problemas
- 🔴 **Críticos:** 10 itens (7 arquivos obsoletos + 4 erros TS)
- 🟡 **Médios:** 79 itens (8 TODOs + 31 console + 40 imports)
- 🟢 **Baixos:** 6 itens (5 exports + análise)

### Tempo Estimado Total
- **Alta prioridade:** 3-5 horas
- **Média prioridade:** 5-8 horas
- **Baixa prioridade:** 2-3 horas
- **TOTAL:** 10-16 horas

---

## 📝 CHECKLIST DE EXECUÇÃO

### 🔴 FASE 1: PROBLEMAS CRÍTICOS (Prioridade Alta)
**Tempo estimado:** 3-5 horas

#### 1.1 Deletar Componentes Obsoletos (15 minutos)

- [ ] **Arquivo 1:** `src/components/os/os-list-page-connected.tsx`
  - Razão: Marcado como "EXEMPLO DE INTEGRAÇÃO"
  - Funcionalidade substituída por: `os-list-page.tsx`
  - Comando: `rm src/components/os/os-list-page-connected.tsx`

- [ ] **Arquivo 2:** `src/components/os/os-wizard-placeholder.tsx`
  - Razão: Placeholder sem funcionalidade real
  - Mostra apenas mensagem "será implementado em breve"
  - Comando: `rm src/components/os/os-wizard-placeholder.tsx`

- [ ] **Arquivo 3:** `src/components/os/step-layout.example.tsx`
  - Razão: Arquivo de exemplo/documentação
  - Não é código de produção
  - Comando: `rm src/components/os/step-layout.example.tsx`

- [ ] **Arquivo 4:** `src/components/os/os-workflow-simplified-example.tsx`
  - Razão: Exemplo simplificado supersedido
  - Implementações reais já existem
  - Comando: `rm src/components/os/os-workflow-simplified-example.tsx`

- [ ] **Verificar imports:** Garantir que nenhum arquivo importa os deletados
  ```bash
  grep -r "os-list-page-connected" src/
  grep -r "os-wizard-placeholder" src/
  grep -r "step-layout.example" src/
  grep -r "os-workflow-simplified-example" src/
  ```

#### 1.2 Corrigir Erros TypeScript (30 minutos)

- [ ] **Arquivo:** `src/lib/hooks/use-dark-mode.ts`
  - Linha 234:31 - `error TS1005: '>' expected`
  - Linha 234:36 - `error TS1005: ')' expected`
  - Linha 236:6 - `error TS1161: Unterminated regular expression literal`
  - Linha 237:3 - `error TS1128: Declaration or statement expected`

  **Ações:**
  1. Abrir arquivo `src/lib/hooks/use-dark-mode.ts`
  2. Ir para linha 234-237
  3. Corrigir sintaxe (provavelmente regex ou generics malformado)
  4. Verificar: `npx tsc --noEmit`

#### 1.3 Reorganizar Componentes de Teste/Debug (30 minutos)

- [ ] **Criar diretórios** (se não existirem)
  ```bash
  mkdir -p src/tests
  mkdir -p src/debug
  ```

- [ ] **Mover:** `src/components/test-supabase-connection.tsx`
  - Destino: `src/tests/test-supabase-connection.tsx`
  - Atualizar imports se necessário
  - Comando: `git mv src/components/test-supabase-connection.tsx src/tests/`

- [ ] **Mover:** `src/components/test-schema-reload.tsx`
  - Destino: `src/debug/test-schema-reload.tsx`
  - Atualizar imports se necessário
  - Comando: `git mv src/components/test-schema-reload.tsx src/debug/`

- [ ] **Condicionar:** `src/components/design-system-showcase.tsx`
  - Opção A: Adicionar gate `if (process.env.NODE_ENV === 'development')`
  - Opção B: Mover para rota dev-only
  - Opção C: Mover para Storybook (se houver)
  - **Decisão:** _____________

- [ ] **Atualizar rotas/imports** que referenciam componentes movidos

#### 1.4 Resolver TODOs/FIXMEs (2-4 horas)

- [ ] **Arquivo 1:** `src/components/comercial/lista-leads.tsx`
  - [ ] Ler TODO/FIXME
  - [ ] Implementar solução OU converter em issue OU deletar se irrelevante
  - [ ] Remover comentário TODO/FIXME

- [ ] **Arquivo 2:** `src/components/comercial/propostas-comerciais.tsx`
  - [ ] Ler TODO/FIXME
  - [ ] Implementar solução OU converter em issue OU deletar se irrelevante
  - [ ] Remover comentário TODO/FIXME

- [ ] **Arquivo 3:** `src/components/obras/lista-obras-ativas.tsx`
  - [ ] Ler TODO/FIXME
  - [ ] Implementar solução OU converter em issue OU deletar se irrelevante
  - [ ] Remover comentário TODO/FIXME

- [ ] **Arquivo 4:** `src/components/obras/aprovacao-medicoes.tsx`
  - [ ] Ler TODO/FIXME
  - [ ] Implementar solução OU converter em issue OU deletar se irrelevante
  - [ ] Remover comentário TODO/FIXME

- [ ] **Arquivo 5:** `src/components/clientes/cliente-detalhes-page.tsx`
  - [ ] Ler TODO/FIXME
  - [ ] Implementar solução OU converter em issue OU deletar se irrelevante
  - [ ] Remover comentário TODO/FIXME

- [ ] **Arquivo 6:** `src/components/clientes/clientes-lista-page.tsx`
  - [ ] Ler TODO/FIXME
  - [ ] Implementar solução OU converter em issue OU deletar se irrelevante
  - [ ] Remover comentário TODO/FIXME

- [ ] **Arquivo 7:** `src/components/os/os-details-workflow-page.tsx`
  - [ ] Ler TODO/FIXME
  - [ ] Implementar solução OU converter em issue OU deletar se irrelevante
  - [ ] Remover comentário TODO/FIXME

- [ ] **Arquivo 8:** `src/components/os/steps/shared/step-identificacao-lead-completo.tsx`
  - [ ] Ler TODO/FIXME
  - [ ] Implementar solução OU converter em issue OU deletar se irrelevante
  - [ ] Remover comentário TODO/FIXME

---

### 🟡 FASE 2: PROBLEMAS MÉDIOS (Prioridade Média)
**Tempo estimado:** 5-8 horas

#### 2.1 Criar Utility de Logging (30 minutos)

- [ ] **Criar arquivo:** `src/lib/utils/logger.ts`
  ```typescript
  // Exemplo de implementação
  const isDev = process.env.NODE_ENV === 'development'

  export const logger = {
    log: (...args: any[]) => isDev && console.log(...args),
    warn: (...args: any[]) => isDev && console.warn(...args),
    error: (...args: any[]) => console.error(...args), // sempre logar erros
    debug: (...args: any[]) => isDev && console.debug(...args),
  }
  ```

- [ ] Testar utility
- [ ] Documentar uso em CLAUDE.md

#### 2.2 Substituir Console Statements (2 horas)

**Módulo Financeiro (8 arquivos):**
- [ ] `src/components/financeiro/financeiro-dashboard-page.tsx`
- [ ] `src/components/financeiro/conciliacao-bancaria-page.tsx`
- [ ] `src/components/financeiro/prestacao-contas-page.tsx`
- [ ] `src/components/financeiro/contas-pagar-page.tsx`
- [ ] `src/components/financeiro/contas-receber-page.tsx`
- [ ] `src/components/financeiro/modal-classificar-lancamento.tsx`
- [ ] `src/components/financeiro/modal-custo-flutuante.tsx`
- [ ] `src/components/financeiro/modal-nova-conta.tsx`

**Módulo Comercial (4 arquivos):**
- [ ] `src/components/comercial/dashboard-comercial.tsx`
- [ ] `src/components/comercial/lista-leads.tsx`
- [ ] `src/components/comercial/detalhes-lead.tsx`
- [ ] `src/components/comercial/propostas-comerciais.tsx`

**Módulo Obras (3 arquivos):**
- [ ] `src/components/obras/lista-obras-ativas.tsx`
- [ ] `src/components/obras/aprovacao-medicoes.tsx`
- [ ] `src/components/obras/modal-atualizar-cronograma.tsx`

**Módulo Clientes (2 arquivos):**
- [ ] `src/components/clientes/clientes-lista-page.tsx`
- [ ] `src/components/clientes/cliente-detalhes-page.tsx`

**Outros módulos (~14 arquivos):**
- [ ] Colaboradores (4 arquivos)
- [ ] OS workflows (vários)
- [ ] Outros componentes

**Para cada arquivo:**
1. Buscar por `console.log`, `console.warn`, `console.debug`
2. Substituir por `logger.log`, `logger.warn`, `logger.debug`
3. Manter `console.error` como `logger.error`
4. Adicionar import: `import { logger } from '@/lib/utils/logger'`

#### 2.3 Configurar Path Aliases (30 minutos)

- [ ] **Verificar** `tsconfig.json` - confirmar que paths está configurado:
  ```json
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["./src/*"]
      }
    }
  }
  ```

- [ ] **Verificar** `vite.config.ts` - confirmar alias:
  ```typescript
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
  ```

- [ ] Se não configurado, adicionar configurações

#### 2.4 Refatorar Deep Relative Imports (1-2 horas)

**OS Steps - Shared (12 arquivos):**
- [ ] `src/components/os/steps/shared/step-identificacao-lead-completo.tsx`
- [ ] `src/components/os/steps/shared/step-followup-1.tsx`
- [ ] `src/components/os/steps/shared/step-followup-2.tsx`
- [ ] `src/components/os/steps/shared/step-followup-3.tsx`
- [ ] `src/components/os/steps/shared/step-precificacao.tsx`
- [ ] `src/components/os/steps/shared/step-gerar-proposta.tsx`
- [ ] `src/components/os/steps/shared/step-gerar-proposta-os01-04.tsx`
- [ ] `src/components/os/steps/shared/step-agendar-apresentacao.tsx`
- [ ] `src/components/os/steps/shared/step-realizar-apresentacao.tsx`
- [ ] `src/components/os/steps/shared/step-gerar-contrato.tsx`
- [ ] `src/components/os/steps/shared/step-contrato-assinado.tsx`
- [ ] `src/components/os/steps/shared/step-memorial-escopo.tsx`
- [ ] `src/components/os/steps/shared/step-anexar-arquivo-generico.tsx`

**OS Steps - Assessoria (3 arquivos):**
- [ ] `src/components/os/steps/assessoria/step-selecao-tipo-assessoria.tsx`
- [ ] `src/components/os/steps/assessoria/step-memorial-escopo-assessoria.tsx`
- [ ] `src/components/os/steps/assessoria/step-ativar-contrato-assessoria.tsx`

**OS Steps - OS08 (7 arquivos):**
- [ ] `src/components/os/steps/os08/step-identificacao-solicitante.tsx`
- [ ] `src/components/os/steps/os08/step-atribuir-cliente.tsx`
- [ ] `src/components/os/steps/os08/step-agendar-visita.tsx`
- [ ] `src/components/os/steps/os08/step-realizar-visita.tsx`
- [ ] `src/components/os/steps/os08/step-formulario-pos-visita.tsx`
- [ ] `src/components/os/steps/os08/step-gerar-documento.tsx`
- [ ] `src/components/os/steps/os08/step-enviar-documento.tsx`

**OS Steps - OS09 (2 arquivos):**
- [ ] `src/components/os/steps/os09/step-requisicao-compra.tsx`
- [ ] `src/components/os/steps/os09/step-upload-orcamentos.tsx`

**OS Steps - OS13 (15 arquivos):**
- [ ] `src/components/os/steps/os13/step-dados-cliente.tsx`
- [ ] `src/components/os/steps/os13/step-agendar-visita-inicial.tsx`
- [ ] `src/components/os/steps/os13/step-realizar-visita-inicial.tsx`
- [ ] `src/components/os/steps/os13/step-imagem-areas.tsx`
- [ ] `src/components/os/steps/os13/step-cronograma-obra.tsx`
- [ ] `src/components/os/steps/os13/step-histograma.tsx`
- [ ] `src/components/os/steps/os13/step-anexar-art.tsx`
- [ ] `src/components/os/steps/os13/step-seguro-obras.tsx`
- [ ] `src/components/os/steps/os13/step-documentos-sst.tsx`
- [ ] `src/components/os/steps/os13/step-placa-obra.tsx`
- [ ] `src/components/os/steps/os13/step-evidencia-mobilizacao.tsx`
- [ ] `src/components/os/steps/os13/step-requisicao-compras.tsx`
- [ ] `src/components/os/steps/os13/step-requisicao-mao-obra.tsx`
- [ ] `src/components/os/steps/os13/step-diario-obra.tsx`
- [ ] `src/components/os/steps/os13/step-relatorio-fotografico.tsx`
- [ ] `src/components/os/steps/os13/step-agendar-visita-final.tsx`
- [ ] `src/components/os/steps/os13/step-realizar-visita-final.tsx`

**Para cada arquivo:**
1. Buscar imports com `../../../`
2. Substituir por `@/` alias
3. Exemplo:
   ```typescript
   // ❌ Antes
   import { OSTipo } from '../../../lib/types'
   import { Button } from '../../../components/ui/button'

   // ✅ Depois
   import { OSTipo } from '@/lib/types'
   import { Button } from '@/components/ui/button'
   ```

#### 2.5 Refatorar Componente Grande (4-8 horas)

- [ ] **Arquivo:** `src/components/os/os-details-workflow-page.tsx` (1,723 linhas)

**Estratégia de refatoração:**

1. [ ] **Análise inicial**
   - Ler arquivo completo
   - Identificar seções lógicas
   - Mapear dependências

2. [ ] **Planejar quebra**
   - Identificar candidatos a sub-componentes
   - Definir props interfaces
   - Planejar estrutura de pastas

3. [ ] **Extrair componentes** (sugestões):
   - [ ] `WorkflowHeader` - Header do workflow
   - [ ] `WorkflowStepper` - Navegação de steps
   - [ ] `WorkflowContent` - Conteúdo do step atual
   - [ ] `WorkflowFooter` - Botões de navegação
   - [ ] `WorkflowSidebar` - Sidebar de informações
   - [ ] Hooks customizados para lógica complexa

4. [ ] **Testar** cada componente extraído

5. [ ] **Integrar** componentes no arquivo principal

6. [ ] **Validar** que funcionalidade permanece igual

**NOTA:** Esta refatoração pode ser feita incrementalmente em várias PRs

---

### 🟢 FASE 3: MELHORIAS (Prioridade Baixa)
**Tempo estimado:** 2-3 horas

#### 3.1 Padronizar Exports (30 minutos)

- [ ] **Arquivo:** `src/components/comercial/lista-leads.tsx`
  ```typescript
  // ❌ Antes
  export default function ListaLeads() { ... }

  // ✅ Depois
  export function ListaLeads() { ... }
  ```

- [ ] Atualizar imports que usam este componente

- [ ] Verificar outros 4 arquivos com default export (se encontrados)

#### 3.2 Análise de Código Morto (1 hora)

- [ ] **Criar script** para encontrar componentes não importados:
  ```bash
  # Salvar em scripts/find-unused-components.sh
  #!/bin/bash
  for file in src/components/**/*.tsx; do
    basename=$(basename "$file" .tsx)
    component_name=$(echo "$basename" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2));}1' | sed 's/ //g')

    # Buscar imports do componente
    grep -r "import.*$component_name" src/ > /dev/null
    if [ $? -ne 0 ]; then
      echo "Potentially unused: $file ($component_name)"
    fi
  done
  ```

- [ ] Executar script
- [ ] Analisar resultados manualmente
- [ ] Criar lista de componentes realmente não utilizados
- [ ] Decidir: deletar ou documentar motivo de manter

#### 3.3 Documentação de Componentes (Contínuo)

- [ ] **Definir padrão** de documentação JSDoc:
  ```typescript
  /**
   * Lista de leads do módulo comercial
   *
   * @description Exibe tabela com todos os leads, permitindo
   * filtrar, ordenar e navegar para detalhes.
   *
   * @example
   * ```tsx
   * <ListaLeads />
   * ```
   */
  export function ListaLeads() { ... }
  ```

- [ ] Documentar componentes principais (começar por):
  - [ ] Componentes de UI customizados
  - [ ] Componentes de layout
  - [ ] Componentes de workflow
  - [ ] Steps mais complexos

- [ ] Adicionar JSDoc gradualmente em novos componentes

---

## 🧪 TESTES E VALIDAÇÃO

### Após cada fase, executar:

- [ ] **Build TypeScript**
  ```bash
  npx tsc --noEmit
  ```
  - Esperado: 0 erros

- [ ] **Build Vite**
  ```bash
  npm run build
  ```
  - Esperado: Build bem-sucedido

- [ ] **Lint**
  ```bash
  npm run lint
  ```
  - Esperado: 0 erros críticos

- [ ] **Dev Server**
  ```bash
  npm run dev
  ```
  - Esperado: Aplicação carrega sem erros

- [ ] **Testes (se houver)**
  ```bash
  npm run test
  ```
  - Esperado: Todos passam

### Teste manual de componentes afetados:

- [ ] Navegar para páginas principais
- [ ] Testar workflows de OS
- [ ] Verificar dashboards
- [ ] Testar formulários
- [ ] Verificar console do navegador (sem erros)

---

## 📊 MÉTRICAS DE SUCESSO

### Antes da Limpeza
```
✅ Named exports:           143 arquivos (96%)
⚠️  Default exports:          5 arquivos (3%)
⚠️  TODOs/FIXMEs:             8 arquivos
⚠️  Console statements:      31 arquivos
⚠️  Deep relative imports:   40+ arquivos
🧪 Test/Debug components:    3 arquivos
🗑️  Obsolete components:     4 arquivos
🐛 TypeScript errors:        4 erros
```

### Depois da Limpeza (Meta)
```
✅ Named exports:           148 arquivos (100%)
✅ Default exports:           0 arquivos (0%)
✅ TODOs/FIXMEs:              0 arquivos (resolvidos ou convertidos em issues)
✅ Console statements:        0 arquivos (usando logger)
✅ Deep relative imports:     0 arquivos (usando @/ alias)
✅ Test/Debug components:     0 em /components (movidos)
✅ Obsolete components:       0 arquivos (deletados)
✅ TypeScript errors:         0 erros
```

---

## 🚀 ESTRATÉGIA DE EXECUÇÃO

### Opção A: Execução Sequencial (Recomendado)
```
FASE 1 → Commit → FASE 2 → Commit → FASE 3 → Commit
```
- **Vantagens:** Mais seguro, fácil de reverter, PRs menores
- **Desvantagens:** Mais tempo total

### Opção B: Execução em Paralelo
```
FASE 1 + FASE 2 (parcial) → Commit
```
- **Vantagens:** Mais rápido
- **Desvantagens:** PRs maiores, mais difícil de revisar

### Opção C: Incremental
```
Fase 1.1 → Commit
Fase 1.2 → Commit
Fase 1.3 → Commit
...
```
- **Vantagens:** Commits atômicos, fácil de rastrear
- **Desvantagens:** Muitos commits

**RECOMENDAÇÃO:** Usar Opção A - executar por fases completas

---

## 📝 TEMPLATE DE COMMIT

### Para deletar componentes obsoletos:
```
refactor(components): remove obsolete and example components

- Delete os-list-page-connected.tsx (superseded by os-list-page.tsx)
- Delete os-wizard-placeholder.tsx (placeholder without functionality)
- Delete step-layout.example.tsx (example/documentation file)
- Delete os-workflow-simplified-example.tsx (example code)

Reduces technical debt and removes unused code.
```

### Para corrigir TypeScript:
```
fix(hooks): fix syntax errors in use-dark-mode.ts

- Fix regex/generics syntax on lines 234-237
- Resolves 4 TypeScript compilation errors

Closes TS1005, TS1161, TS1128 errors.
```

### Para reorganizar teste/debug:
```
refactor(tests): reorganize test and debug components

- Move test-supabase-connection.tsx to src/tests/
- Move test-schema-reload.tsx to src/debug/
- Add dev-only gate to design-system-showcase.tsx

Improves project organization and separates concerns.
```

### Para substituir console statements:
```
refactor(logging): replace console statements with logger utility

- Create src/lib/utils/logger.ts with dev-conditional logging
- Replace console.log/warn/debug in 31 components
- Keep console.error as logger.error (always logged)

Reduces production console noise and improves debugging.
```

### Para refatorar imports:
```
refactor(imports): standardize imports using @/ path alias

- Replace deep relative imports (../../../) with @/ alias
- Update 40+ files in os/steps/* directories
- Improves maintainability and refactoring-friendliness

No functional changes.
```

---

## ✅ CHECKLIST FINAL DE VALIDAÇÃO

Antes de considerar a limpeza completa:

- [ ] ✅ 0 erros TypeScript (`npx tsc --noEmit`)
- [ ] ✅ Build bem-sucedido (`npm run build`)
- [ ] ✅ Lint sem erros críticos (`npm run lint`)
- [ ] ✅ Dev server funciona (`npm run dev`)
- [ ] ✅ Todos os testes passam (`npm run test`)
- [ ] ✅ 0 componentes obsoletos/exemplo em `src/components/`
- [ ] ✅ 0 componentes de teste em `src/components/`
- [ ] ✅ 100% named exports
- [ ] ✅ 0 console.log em produção (usando logger)
- [ ] ✅ 0 deep relative imports (usando @/ alias)
- [ ] ✅ TODOs convertidos em issues ou resolvidos
- [ ] ✅ Documentação atualizada (CLAUDE.md, README)
- [ ] ✅ Commit messages descritivos
- [ ] ✅ PR criado com descrição detalhada

---

## 📚 RECURSOS

### Scripts Úteis

**Encontrar console statements:**
```bash
grep -r "console\." src/components/ --include="*.tsx" --include="*.ts"
```

**Encontrar TODOs/FIXMEs:**
```bash
grep -r "TODO\|FIXME" src/components/ --include="*.tsx" --include="*.ts"
```

**Encontrar deep relative imports:**
```bash
grep -r "\.\./\.\./\.\." src/components/ --include="*.tsx" --include="*.ts"
```

**Encontrar default exports:**
```bash
grep -r "export default" src/components/ --include="*.tsx" --include="*.ts"
```

**Contar linhas por arquivo:**
```bash
wc -l src/components/**/*.tsx | sort -n
```

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Revisar este plano
2. ✅ Aprovar estratégia de execução
3. ⏭️  Executar FASE 1
4. ⏭️  Executar FASE 2
5. ⏭️  Executar FASE 3
6. ⏭️  Validação final
7. ⏭️  Criar PR
8. ⏭️  Code review
9. ⏭️  Merge

---

**FIM DO PLANO DE CORREÇÃO**

Para diagnóstico completo, ver: `COMPONENT_AUDIT.md`
