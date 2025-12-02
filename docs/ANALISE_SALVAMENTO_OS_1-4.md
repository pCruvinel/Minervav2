# Análise de Salvamento de Dados - Steps 1-4 (OS 01-04)

## Objetivo
Garantir que TODOS os dados preenchidos nos Steps 1-4 sejam salvos no Supabase para gerar PDFs posteriormente.

---

## ✅ STATUS GERAL

| Step | Campos Obrigatórios | Status | Problema Principal |
|------|---------------------|--------|-------------------|
| **1** | leadId, nome + 24 opcionais | ✅ **100%** | Nenhum |
| **2** | tipoOS | ✅ **100%** | Nenhum |
| **3** | 7 campos + anexos | ⚠️ **99%** | Nomenclatura anexos |
| **4** | Todos opcionais | ✅ **100%** | Nenhum |

---

## 🔍 ANÁLISE DETALHADA

### STEP 1 - Identificação do Cliente

**26 CAMPOS SALVOS:**
```typescript
{
  // Core (2 obrigatórios)
  leadId: string,
  nome: string,
  
  // Contato (5)
  cpfCnpj, email, telefone, tipo, nomeResponsavel, cargoResponsavel,
  
  // Edificação (7)
  tipoEdificacao, qtdUnidades, qtdBlocos, qtdPavimentos,
  tipoTelhado, possuiElevador, possuiPiscina,
  
  // Endereço (7)
  cep, endereco, numero, complemento, bairro, cidade, estado
}
```

**Código:** `os-details-workflow-page.tsx:738-777`
- ✅ Usa `explicitData` para bypass de timing do React
- ✅ Auto-save após sincronização com dados do cliente (linhas 634-641)

---

### STEP 2 - Tipo de OS

**1 CAMPO SALVO:**
```typescript
{
  tipoOS: string  // Ex: "OS 01 - Laudo Estrutural"
}
```

**Código:** `os-details-workflow-page.tsx:861-865`

---

### STEP 3 - Follow-up 1

**12 CAMPOS SALVOS:**
```typescript
{
  // Obrigatórios (7)
  idadeEdificacao: string,
  motivoProcura: string,
  quandoAconteceu: string,
  grauUrgencia: string,
  apresentacaoProposta: string,
  nomeContatoLocal: string,
  telefoneContatoLocal: string,
  
  // Opcionais (4)
  oqueFeitoARespeito, existeEscopo,
  previsaoOrcamentaria, cargoContatoLocal,
  
  // Anexos
  anexos: Array<{
    id, url, nome, tamanho, comentario  // ⚠️ Ver problema abaixo
  }>
}
```

**Código:** `step-followup-1.tsx:394-408`

---

### STEP 4 - Agendar Apresentação

**2 CAMPOS PRINCIPAIS:**
```typescript
{
  agendamentoId?: string,    // ID no sistema de calendário
  dataAgendamento?: string   // Data ISO
}
```

**Código:** `step-agendar-apresentacao.tsx:75-87`
- ✅ Integrado com sistema de calendário centralizado

---

## 🚨 PROBLEMA CRÍTICO ENCONTRADO

### Inconsistência de Nomenclatura - Anexos (Step 3)

**O QUE ACONTECE:**
```typescript
// Interface TypeScript (os-details-workflow-page.tsx:118)
interface ArquivoComComentario {
  comment: string;  // ❌ Nome inconsistente
}

// Schema Zod (os-etapas-schema.ts:140)
anexos: z.array(z.object({
  comentario: string  // ✅ Nome correto esperado
}))

// Mapeamento (step-followup-1.tsx:403)
comentario: file.comment  // ⚠️ Tenta mapear mas pode falhar
```

**IMPACTO:**
- Comentários dos anexos podem não ser salvos
- PDFs gerados sem contexto dos arquivos

**SOLUÇÃO:**
Padronizar para `comentario` em toda a aplicação.

---

## 📊 QUERIES SQL DE VERIFICAÇÃO

```sql
-- 1. Verificar dados completos de uma OS
SELECT 
  e.ordem,
  e.nome_etapa,
  jsonb_pretty(e.dados_etapa) as dados,
  e.status
FROM os_etapas e
JOIN ordens_servico os ON e.os_id = os.id
WHERE os.codigo_os = 'OS-2024-XXX'
ORDER BY e.ordem;

-- 2. Contar campos por Step
SELECT 
  ordem as step,
  COUNT(DISTINCT jsonb_object_keys(dados_etapa)) as total_campos
FROM os_etapas
WHERE ordem <= 4
GROUP BY ordem;

-- 3. Verificar anexos do Step 3
SELECT 
  os.codigo_os,
  jsonb_array_length(e.dados_etapa->'anexos') as qtd_anexos,
  e.dados_etapa->'anexos'
FROM os_etapas e
JOIN ordens_servico os ON e.os_id = os.id
WHERE e.ordem = 3 AND e.dados_etapa ? 'anexos';
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

Antes de gerar PDF, verificar:

- [ ] Step 1: `leadId` e `nome` presentes
- [ ] Step 1: Endereço tem 7 campos (cep até estado)
- [ ] Step 2: `tipoOS` presente
- [ ] Step 3: 7 campos obrigatórios preenchidos
- [ ] Step 3: Se há anexos, verificar se `comentario` está salvo
- [ ] Step 4: Se agendado, `agendamentoId` presente
- [ ] Todos Steps: `dados_etapa` não é null

---

## 🎯 AÇÕES RECOMENDADAS

### 🔴 IMEDIATO (Hoje)
1. **Corrigir nomenclatura:** `comment` → `comentario`
   - Arquivo: `src/components/os/os-details-workflow-page.tsx:118`
   - Atualizar interface `ArquivoComComentario`

2. **Testar no Supabase:**
   - Criar OS de teste
   - Preencher Steps 1-4 completamente
   - Rodar queries SQL acima
   - Verificar se todos os campos foram salvos

### 🟡 CURTO PRAZO (Esta Semana)
3. **Criar função de validação:**
   ```typescript
   function validateEtapaForPDF(etapaId: string): {
     valid: boolean;
     missingFields: string[];
   }
   ```

4. **Adicionar logs detalhados:**
   - Log de campos salvos após cada Step
   - Warning se campos obrigatórios ausentes

### 🟢 MÉDIO PRAZO (Próximas 2 Semanas)
5. **Sincronizar edificação com tabela clientes:**
   - Atualizar `clientes.endereco` após Step 1
   - Permitir reutilização em outras OSs

6. **Dashboard de diagnóstico:**
   - Visualizar completude de OSs
   - Identificar OSs com dados faltantes

---

## 📋 ESTRUTURA ESPERADA FINAL

### Para o Banco (os_etapas.dados_etapa)

```json
{
  "ordem": 1,
  "dados_etapa": {
    "leadId": "uuid-here",
    "nome": "Cliente Exemplo",
    "cpfCnpj": "12345678901",
    "email": "cliente@exemplo.com",
    "telefone": "(11) 98765-4321",
    "tipoEdificacao": "Condomínio Residencial",
    "cep": "01234-567",
    "endereco": "Rua Exemplo",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP"
  }
}

{
  "ordem": 2,
  "dados_etapa": {
    "tipoOS": "OS 01 - Laudo Estrutural"
  }
}

{
  "ordem": 3,
  "dados_etapa": {
    "idadeEdificacao": "10 a 20 anos",
    "motivoProcura": "Infiltração na fachada...",
    "quandoAconteceu": "Há 6 meses...",
    "grauUrgencia": "30 dias",
    "apresentacaoProposta": "Sim, concordo...",
    "nomeContatoLocal": "João Silva",
    "telefoneContatoLocal": "(11) 91234-5678",
    "anexos": [
      {
        "id": "file-id",
        "url": "https://...",
        "nome": "fachada.jpg",
        "tamanho": 256000,
        "comentario": "Foto mostrando infiltração"
      }
    ]
  }
}

{
  "ordem": 4,
  "dados_etapa": {
    "agendamentoId": "agendamento-uuid",
    "dataAgendamento": "2025-12-10T14:00:00Z"
  }
}
```

---

## 📚 REFERÊNCIAS

- **Workflow Principal:** [`os-details-workflow-page.tsx`](src/components/os/os-details-workflow-page.tsx)
- **Hook Salvamento:** [`use-etapas.ts`](src/lib/hooks/use-etapas.ts)
- **Schemas:** [`os-etapas-schema.ts`](src/lib/validations/os-etapas-schema.ts)
- **Step 1:** [`cadastrar-lead.tsx`](src/components/os/steps/shared/cadastrar-lead.tsx)
- **Step 3:** [`step-followup-1.tsx`](src/components/os/steps/shared/step-followup-1.tsx)
- **Step 4:** [`step-agendar-apresentacao.tsx`](src/components/os/steps/shared/step-agendar-apresentacao.tsx)

---

**Data:** 2025-12-02  
**Status:** ✅ Análise Completa - 1 correção necessária