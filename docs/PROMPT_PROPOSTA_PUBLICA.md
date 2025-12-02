# 📋 Prompt para Nova Tarefa: Visualização Pública de Proposta

## 🎯 Objetivo

Criar uma página pública (SEM autenticação) para visualizar propostas comerciais da Minerva Engenharia que pode ser compartilhada com clientes via link direto.

---

## 📝 Requisitos Funcionais

### 1. Rota Pública
- **URL:** `/proposta/:osId` (fora de `/_auth`)
- **Sem autenticação:** Qualquer pessoa com o link pode acessar
- **Formato:** A4 otimizado para impressão
- **Um botão:** "Imprimir Proposta" (Ctrl+P)

### 2. Dados a Exibir

**Buscar do Supabase (endpoint público):**
- Etapa 1: Dados do cliente
- Etapa 2: Tipo de OS
- Etapa 7: Memorial de escopo (etapas e subetapas)
- Etapa 8: Precificação (valores calculados)
- Etapa 9: Dados da proposta (código, validade, garantia)

**Cálculos automáticos:**
- Valor total (com impostos/lucro/imprevistos)
- Valor de entrada (% configurado)
- Valor de cada parcela
- Prazo total em dias úteis

### 3. Design

**Elementos visuais:**
- ✅ Logo Minerva no cabeçalho
- ✅ Cores do sistema (variáveis CSS `--primary`)
- ✅ Seções com bordas laterais primary
- ✅ Valor total destacado (fundo primary, texto branco)
- ✅ Cards de entrada e parcelas (border primary)
- ✅ Formato A4 para impressão profissional

**Responsivo:**
- Desktop: Máx 900px de largura centralizado
- Impressão: 100% largura, margens 1cm

---

## 🔧 Implementação Técnica

### Passo 1: Criar Componente Público

**Arquivo:** `src/components/os/proposta-publica-page.tsx`

**Características:**
```typescript
// SEM usar useAuth (não precisa de autenticação)
// SEM usar hooks que dependem de contexto autenticado
// Buscar dados via API pública ou função serverless
```

### Passo 2: Criar Endpoint Público no Supabase

**Opção A: Edge Function Pública**
```typescript
// supabase/functions/get-proposta-publica/index.ts
// GET /proposta/:osId
// Retorna dados formatados para visualização
```

**Opção B: Ajustar RLS**
```sql
-- Criar política pública de leitura para os_etapas
CREATE POLICY "public_read_proposta" ON os_etapas
FOR SELECT
USING (
  ordem IN (1, 2,7, 8, 9) 
  AND EXISTS (
    SELECT 1 FROM ordens_servico 
    WHERE id = os_etapas.os_id 
    AND status_geral != 'cancelado'
  )
);
```

### Passo 3: Criar Rota

**Arquivo:** `src/routes/proposta.$osId.tsx` (já criado)

**Registrar no router:**
```typescript
// Rota fora de _auth para acesso público
export const Route = createFileRoute('/proposta/$osId')({
  component: PropostaPublicaPage,
});
```

### Passo 4: Atualizar Link no Step 9

**Arquivo:** `src/components/os/steps/shared/step-gerar-proposta-os01-04.tsx:430`

```typescript
// MUDAR de:
onClick={() => window.open(`/os/proposta/${osId}`, '_blank')}

// PARA:
onClick={() => window.open(`/proposta/${osId}`, '_blank')}
```

---

## 🔒 Considerações de Segurança

### Dados Públicos (OK para exibir)
- ✅ Nome do cliente
- ✅ Tipo de serviço
- ✅ Escopo técnico
- ✅ Valores comerciais
- ✅ Prazos

### Dados Sensíveis (OCULTAR)
- ❌ Dados internos da empresa (custos, margens)
- ❌ Comentários internos
- ❌ Dados de responsáveis/colaboradores
- ❌ Histórico de aprovações

### Rate Limiting
- Implementar cache (30 minutos)
- Limitar requests por IP (10/min)
- Validar UUID do osId

---

## ✅ Critérios de Aceitação

- [ ] Página acessível via `/proposta/:osId` SEM login
- [ ] Exibe dados reais do Supabase (não mock)
- [ ] Design profissional com logo e cores Minerva
- [ ] Formato A4 otimizado para impressão
- [ ] Botão "Imprimir Proposta" funcional
- [ ] Impressão SEM sidebar/navegação
- [ ] Valores e prazos calculados corretamente
- [ ] Funciona em navegador sem cache (aba anônima)
- [ ] Performance < 2s para carregar

---

## 📚 Referências

- **Template atual:** [`proposta-comercial-print-page.tsx`](src/components/os/proposta-comercial-print-page.tsx)
- **Cores do sistema:** [`src/styles/base/variables.css`](src/styles/base/variables.css)
- **Print styles:** [`src/styles/globals.css`](src/styles/globals.css)
- **Schema database:** [`docs/technical/DATABASE_SCHEMA.md`](docs/technical/DATABASE_SCHEMA.md)

---

## 🚀 Próxima Ação

Use este prompt com o mode **Code** ou **Architect**:

> "Criar página pública de visualização de proposta comercial conforme especificado em [`docs/PROMPT_PROPOSTA_PUBLICA.md`](docs/PROMPT_PROPOSTA_PUBLICA.md). A página deve ser acessível via `/proposta/:osId` sem autenticação, buscar dados reais do Supabase, exibir design profissional com logo Minerva e cores do sistema, e ter formato A4 otimizado para impressão com um botão Print."

---

**Documento criado:** Este arquivo serve como especificação completa para a próxima tarefa.