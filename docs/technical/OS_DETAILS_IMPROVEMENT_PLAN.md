# Plano de Melhorias: Página de Detalhes da OS

> **Data:** 2026-01-05  
> **Documento de Referência:** [OS_DETAILS_PAGE.md](./OS_DETAILS_PAGE.md)  
> **Status:** ✅ Fase 1 e 2 Concluídas

---

## Visão Geral

Este documento apresenta um plano de melhorias para a página de Detalhes da OS (`/os/:osId`), incluindo correções de bugs reportados e sugestões adicionais de aprimoramento.

---

## Melhorias Reportadas pelo Usuário

### 1. 🏠 Popular Endereço nos Detalhes

**Status:** ✅ **IMPLEMENTADO**

**Problema:** O card de endereço na tab "Visão Geral" mostrava "Endereço não informado" mesmo quando o endereço foi preenchido na Etapa 1.

**Causa Raiz Identificada:** O `setOsDetails()` era chamado antes de buscar os dados da Etapa 1. Quando os dados eram extraídos e o `osData` era atualizado, essa atualização nunca era refletida no estado.

**Solução Implementada:**
1. Modificada a query `os_etapas` para incluir `dados_etapa` (JSONB)
2. Extração dos campos de endereço do `dados_etapa` da Etapa 1 (`ordem === 1`)
3. Mapeamento para novo campo `endereco_obra` (ao invés de `cliente_endereco`)
4. Adicionado `setOsDetails(osData)` após enriquecer com dados da Etapa 1

**Arquivos Modificados:**
- `src/components/os/shared/pages/os-details-redesign-page.tsx`
  - Interface `OSDetails` atualizada com `endereco_obra` e `dados_obra`
  - Função `loadOSData` modificada (linhas 300-365)
  - UI de endereço atualizada (linhas 870-900)

**Campos Mapeados:**
```typescript
endereco_obra: {
  logradouro: dados.endereco || dados.logradouro,
  numero: dados.numero,
  bairro: dados.bairro,
  cidade: dados.cidade,
  estado: dados.estado || dados.uf,
  cep: dados.cep,
  complemento: dados.complemento
}
```

---

### 2. 👤 Exibir Avatar do Responsável Atual

**Status:** ✅ **IMPLEMENTADO**

**Problema:** O avatar do responsável atual não aparecia, mostrando apenas as iniciais (fallback).

**Causa Raiz Identificada:** A view `os_detalhes_completos` não incluía o campo `responsavel_avatar_url` no SELECT.

**Solução Implementada:**
1. Atualizada view `os_detalhes_completos` para incluir `resp.avatar_url AS responsavel_avatar_url`
2. Migration aplicada: `20260105_add_avatar_url_to_os_detalhes_view.sql`

**UI já estava correta:**
```tsx
<AvatarImage
  src={osDetails.responsavel_avatar_url || undefined}
  alt={osDetails.responsavel_nome || 'Responsável'}
/>
```

---

### 3. 📎 Corrigir Campo Descrição nos Anexos

**Status:** ✅ **IMPLEMENTADO**

**Problema:** A coluna "Descrição" na tab Anexos estava exibindo o nome da etapa ao invés do comentário do usuário.

**Solução Implementada:**
1. Modificado `saveComment` em `file-upload-unificado.tsx` para persistir o comentário no campo `description` do documento no Supabase

**Arquivo Modificado:**
- `src/components/ui/file-upload-unificado.tsx` (linhas 283-290)

---

### 4. 🔔 Card de Notificações da OS

**Status:** ✅ **IMPLEMENTADO**

**Problema:** O acordeão "Dados Técnicos" exibia JSON bruto inútil.

**Solução Implementada:**

#### 4.1 Novo Componente `OSNotificationsCard`
- **Arquivo:** `src/components/os/shared/components/os-notifications-card.tsx`
- Busca notificações relacionadas à OS via `link_acao` ou `titulo/mensagem` contendo código da OS
- Exibe lista scrollável com ícones por tipo
- Mostra título e mensagem completos (sem truncamento)
- Design System compliant: `border-border rounded-lg shadow-sm`, header `bg-muted/40`

#### 4.2 Layout 30/70
- Card Progresso: 30% da altura (`grid-rows-[3fr_7fr]`)
- Card Notificações: 70% da altura
- Card Progresso compactado (textos menores, menos padding)

**Arquivos Modificados:**
- `src/components/os/shared/pages/os-details-redesign-page.tsx` (linhas 1032-1065)
- `src/components/os/shared/components/os-notifications-card.tsx` (novo)

**Query de Notificações:**
```typescript
const { data } = await supabase
  .from('notificacoes')
  .select('*')
  .or(`link_acao.ilike.%${osId}%,titulo.ilike.%${codigoOS}%,mensagem.ilike.%${codigoOS}%`)
  .order('created_at', { ascending: false })
  .limit(10);
```

---

### 5. 🏗️ Exibição de Dados Técnicos da Obra

**Status:** ✅ **IMPLEMENTADO** (Bonus)

**Adição:** Nova seção "Detalhes da Obra" na aba Visão Geral exibindo informações técnicas da Etapa 1:
- Tipo de Edificação
- Quantidade de Blocos/Unidades/Pavimentos
- Tipo de Telhado
- Possui Piscina/Elevador (indicadores visuais)
- Responsável Local (nome e cargo)

**Campos Mapeados:**
```typescript
dados_obra: {
  tipoEdificacao, qtdBlocos, qtdUnidades, qtdPavimentos,
  tipoTelhado, possuiPiscina, possuiElevador,
  nomeResponsavel, cargoResponsavel, tipoEmpresa, cpfCnpj
}
```

---

## Sugestões Adicionais de Melhorias

### 6. 📊 Indicador de SLA/Prazo Visual

**Status:** ✅ **IMPLEMENTADO**

**Descrição:** Indicador visual de SLA na tab "Visão Geral" mostrando quanto tempo resta ou quantos dias está atrasado.

**Solução Implementada:**
- Função `getSLAStatus()` calcula dias restantes/atrasados
- Card de "Prazo" com cores dinâmicas:
  - 🟢 Verde/Neutro: > 3 dias restantes ou concluído
  - 🟡 Amarelo: 1-3 dias restantes (alerta)
  - � Vermelho: Prazo vencido (com ícone AlertTriangle)
- Badge mostrando "Xd atrasado" ou "Xd restantes"

**Arquivo Modificado:**
- `src/components/os/shared/pages/os-details-redesign-page.tsx` (linhas 984-1030)

---

### 6. 📱 Melhorar Responsividade do Chat

**Status:** 🔜 Pendente

**Descrição:** O chat na tab "Chat" poderia ter melhor experiência mobile com teclado virtual.

**Prioridade:** 🟢 Baixa  
**Esforço:** ⏱️ 2h

---

### 7. 🔄 Atualização em Tempo Real

**Status:** 🔜 Pendente

**Descrição:** Implementar Supabase Realtime para atualizar dados automaticamente.

**Prioridade:** 🟡 Média  
**Esforço:** ⏱️ 4h

---

### 8. 📋 Ações Rápidas na Visão Geral

**Status:** 🔜 Pendente

**Descrição:** Adicionar botões de ações rápidas no card de detalhes.

**Prioridade:** 🟢 Baixa  
**Esforço:** ⏱️ 3h

---

### 9. 🗂️ Histórico de Atividades

**Status:** 🔜 Pendente

**Descrição:** Adicionar nova tab ou seção mostrando histórico de atividades da OS.

**Prioridade:** 🟡 Média  
**Esforço:** ⏱️ 4h

---

### 10. 🎨 Melhorar Card de Hierarquia

**Status:** 🔜 Pendente

**Descrição:** O `OSHierarchyCard` poderia exibir mais informações e ter design mais visual.

**Prioridade:** 🟢 Baixa  
**Esforço:** ⏱️ 3h

---

## Resumo de Prioridades

| # | Melhoria | Status | Esforço |
|---|----------|--------|---------|
| 1 | Popular Endereço | ✅ Concluído | 2h |
| 2 | Avatar Responsável | ✅ Concluído | 1h |
| 3 | Descrição Anexos | ✅ Concluído | 3h |
| 4 | Card Notificações | ✅ Concluído | 4h |
| 5 | Dados Técnicos Obra | ✅ Concluído | 2h |
| 6 | Indicador SLA | ✅ Concluído | 2h |
| 7 | Responsividade Chat | 🔜 Pendente | 2h |
| 8 | Realtime Updates | 🔜 Pendente | 4h |
| 9 | Ações Rápidas | 🔜 Pendente | 3h |
| 10 | Histórico Atividades | 🔜 Pendente | 4h |
| 11 | Melhorar Hierarquia | 🔜 Pendente | 3h |

**Concluído (Fases 1-3):** 14h  
**Restante Estimado:** ~16h de desenvolvimento

---

## Changelog

| Versão | Data | Alterações |
|--------|------|------------|
| 1.0 | 2026-01-05 | Plano inicial com 4 melhorias do usuário + 6 sugestões |
| 2.1 | 2026-01-05 | Implementado: Indicador Visual de SLA e correção de Avatar |

## Próximos Passos (Recomendado)

Recomenda-se iniciar a **Fase 4 (Histórico de Atividades)** pois trará maior visibilidade sobre o ciclo de vida da OS, complementando as notificações.

1. **Histórico de Atividades (4h)** - Prioridade Média
2. **Realtime Updates (4h)** - Prioridade Média
3. **Ações Rápidas (3h)** - Prioridade Baixa
4. **Responsividade Chat (2h)** - Prioridade Baixa
