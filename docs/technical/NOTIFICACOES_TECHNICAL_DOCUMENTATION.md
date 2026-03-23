# Documentação Técnica: Sistema de Notificações

**Última Atualização:** 2026-01-05  
**Versão:** v2.0  
**Status Implementação:** 100% Implementado

---

## 📌 Visão Geral

O sistema de notificações do Minerva ERP utiliza:
- **Supabase Realtime** para push de notificações em tempo real
- **Tabela `notificacoes`** para persistência
- **Toasts (Sonner)** para alertas visuais temporários
- **Componente NotificationBell** para listagem no Header

---

## 🗄 Estrutura de Dados

### Tabela: `notificacoes`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único |
| `usuario_id` | UUID | Destinatário (FK para `colaboradores`) |
| `titulo` | TEXT | Título curto da notificação |
| `mensagem` | TEXT | Corpo da mensagem |
| `link_acao` | TEXT | URL para redirecionamento (opcional) |
| `lida` | BOOLEAN | Status de leitura (default: `false`) |
| `tipo` | TEXT | Categoria da notificação |
| `created_at` | TIMESTAMP | Data de criação |

### Tipos de Notificação Suportados

| Tipo | Descrição | Ícone (UI) |
|------|-----------|------------|
| `info` | Informação geral | 🔵 Info |
| `atencao` | Atenção/Alerta | 🟡 AlertTriangle |
| `sucesso` | Sucesso/Conclusão | 🟢 CheckCircle |
| `tarefa` | Nova tarefa atribuída | 🔵 Info |
| `aprovacao` | Fluxo de aprovação | (sem ícone específico) |

---

## 🔔 Gatilhos de Notificação

### 1. Transferência de Setor (Handoff)

**Arquivo:** `src/lib/hooks/use-notificar-coordenador.ts` (linhas 118-171)

**Gatilho:** Quando uma OS muda de setor (ex: Administrativo → Obras)

**Quem é Notificado:** Coordenador do setor destino

**Texto da Notificação (ATUALIZADO v2.0):**
```typescript
{
  titulo: `📍 Nova Visita Técnica - ${payload.setorDestinoNome}`,
  mensagem: `OS ${payload.codigoOS} (${payload.clienteNome}) aguarda sua confirmação de execução na Etapa ${payload.etapaNumero}.`,
  link_acao: `/os/${osId}`,
  tipo: 'tarefa',
}
```

**Exemplo Real:**
- **Título:** "📍 Nova Visita Técnica - Setor de Obras"
- **Mensagem:** "OS OS-01-0042 (Construtora ABC) aguarda sua confirmação de execução na Etapa 5."
- **Link:** `/os/uuid-da-os`

**Etapas que Disparam (OS 01-04):**
| De → Para | Etapa | Descrição |
|-----------|-------|-----------|
| Admin → Obras | 4 → 5 | Após agendar visita técnica |
| Obras → Admin | 9 → 10 | Após aprovação da proposta |

---

### 2. Solicitação de Aprovação

**Arquivo:** `src/lib/hooks/use-aprovacao-etapa.ts` (linhas 109-162)

**Gatilho:** Quando um colaborador solicita aprovação de uma etapa crítica

**Quem é Notificado:** 
- Coordenador Administrativo
- Diretor
- Admin

**Texto da Notificação (ATUALIZADO v2.0):**
```typescript
{
  titulo: `⚠️ Aprovação Pendente: ${tipoDocumento} | ${codigoOS}`,
  mensagem: `${currentUser.nome} solicita aprovação de ${tipoDocumento} para o cliente **${clienteNome}**.${justificativa ? `\n💬 Justificativa: ${justificativa}` : ''}`,
  link_acao: `/os/details-workflow/${osId}`,
  tipo: 'aprovacao',
}
```

**Exemplo Real:**
- **Título:** "⚠️ Aprovação Pendente: Gerar Proposta | OS-01-0042"
- **Mensagem:** "João Silva solicita aprovação de Gerar Proposta para o cliente **Construtora ABC**.\n💬 Justificativa: Proposta comercial finalizada"
- **Link:** `/os/details-workflow/uuid-da-os`

**Etapas que Disparam:**
| OS | Etapa | Nome |
|----|-------|------|
| OS 01-04 | 9 | Gerar Proposta Comercial |
| OS 01-04 | 13 | Gerar Contrato |
| OS 05-06 | 6 | Gerar Proposta Comercial |
| OS 05-06 | 10 | Gerar Contrato |

---

### 3. Confirmação de Aprovação

**Arquivo:** `src/lib/hooks/use-aprovacao-etapa.ts` (linhas 166-223)

**Gatilho:** Quando um coordenador/diretor aprova uma etapa

**Quem é Notificado:**
- Solicitante original
- Coordenador Administrativo
- Diretor
- Admin

**Texto da Notificação (ATUALIZADO v2.1):**
```typescript
{
  titulo: `✅ ${etapaNome} Aprovada!`,
  mensagem: `A ${etapaNome} de *${osDescricao}* para o cliente *${clienteNome}* foi aprovada por *${aprovadorNome}* - ${aprovadorCargo}. O processo agora pode seguir para a etapa de *${proximaEtapaNome}*.`,
  link_acao: `/os/details-workflow/${osId}?step=${proximaEtapa}`,
  tipo: 'aprovacao',
}
```

**Exemplo Real:**
- **Título:** "✅ Proposta Aprovada!"
- **Mensagem:** "A Proposta de *Revitalização de Fachada* para o cliente *João Dias* foi aprovada por *Pedro Cruvinel* - Coord Administrativo. O processo agora pode seguir para a etapa de *Agendar Visita (Apresentação)*."
- **Link:** `/os/details-workflow/uuid?step=10` (direciona para a próxima etapa)

---

### 4. Rejeição de Aprovação

**Arquivo:** `src/lib/hooks/use-aprovacao-etapa.ts` (linhas 227-288)

**Gatilho:** Quando um coordenador/diretor rejeita uma etapa

**Quem é Notificado:**
- Solicitante original
- Coordenador Administrativo
- Diretor
- Admin

**Texto da Notificação (ATUALIZADO v2.1):**
```typescript
{
  titulo: `❌ Ajuste Necessário em ${etapaNome}`,
  mensagem: `A ${etapaNome} de *${clienteNome}* - ${codigoOS} não foi aprovada por *${reprovadorNome}* - ${reprovadorCargo}.\n🚩 **Motivo:** ${motivo}`,
  link_acao: `/os/details-workflow/${osId}?step=${etapaAtual}`,
  tipo: 'aprovacao',
}
```

**Exemplo Real:**
- **Título:** "❌ Ajuste Necessário em Proposta"
- **Mensagem:** "A Proposta de *João Dias* - OS-01-0042 não foi aprovada por *Maria Coordenadora* - Coord Administrativo.\n🚩 **Motivo:** Valores incorretos na proposta"
- **Link:** `/os/details-workflow/uuid?step=9` (direciona para a etapa que precisa de ajuste)

---

## 📦 Componentes de Interface

### NotificationBell

**Arquivo:** `src/components/shared/notification-bell.tsx`

**Funcionalidades:**
- Badge com contagem de não lidas
- Popover com lista de notificações
- Ícones diferentes por tipo
- Botão "Marcar todas como lidas"
- Link para cada notificação

### RecentNotificationsWidget

**Arquivo:** `src/components/home/recent-notifications-widget.tsx`

**Funcionalidades:**
- Widget do dashboard
- Mostra 5 últimas não lidas
- Ícones por tipo de notificação

---

## 🎣 Hooks de Notificação

### useNotifications

**Arquivo:** `src/lib/hooks/use-notifications.ts`

```typescript
const {
  notifications,     // Lista de notificações
  unreadCount,       // Contagem de não lidas
  isLoading,         // Estado de carregamento
  markAsRead,        // Marcar uma como lida
  markAllAsRead,     // Marcar todas como lidas
  sendNotification,  // Enviar nova notificação
  refresh            // Recarregar lista
} = useNotifications();
```

**Realtime:** Escuta inserções na tabela `notificacoes` filtrado por `usuario_id`.

**Toast Automático:** Exibe toast para notificações do tipo `'atencao'` ou `'tarefa'`.

### useNotificarCoordenador

**Arquivo:** `src/lib/hooks/use-notificar-coordenador.ts`

```typescript
const {
  buscarCoordenador,    // Busca coordenador do setor
  notificarCoordenador  // Envia notificação de transferência
} = useNotificarCoordenador();
```

**Fallback:** Se não encontrar coordenador do setor, busca Admin ou Diretor.

---

## 📍 Mapeamento Completo: Etapas → Notificações

### OS 01-04 (Obras)

| Etapa | Ação | Notificação | Destinatário |
|-------|------|-------------|--------------|
| 4 → 5 | Avanço | "Nova OS para Setor de Obras" | Coord. Obras |
| 9 | Solicitar Aprovação | "Solicitação de Aprovação - Etapa 9" | Coord. Admin, Diretor |
| 9 | Aprovar | "Aprovação Confirmada - Etapa 9" | Solicitante + Gestores |
| 9 | Rejeitar | "Aprovação Rejeitada - Etapa 9" | Solicitante + Gestores |
| 9 → 10 | Avanço | "Nova OS para Setor Administrativo" | Coord. Admin |
| 13 | Solicitar Aprovação | "Solicitação de Aprovação - Etapa 13" | Diretor |
| 13 | Aprovar | "Aprovação Confirmada - Etapa 13" | Solicitante + Gestores |
| 13 | Rejeitar | "Aprovação Rejeitada - Etapa 13" | Solicitante + Gestores |

### OS 05-06 (Assessoria)

| Etapa | Ação | Notificação | Destinatário |
|-------|------|-------------|--------------|
| 6 | Solicitar Aprovação | "Solicitação de Aprovação - Etapa 6" | Coord. Assessoria |
| 6 | Aprovar | "Aprovação Confirmada - Etapa 6" | Solicitante + Gestores |
| 6 | Rejeitar | "Aprovação Rejeitada - Etapa 6" | Solicitante + Gestores |
| 10 | Solicitar Aprovação | "Solicitação de Aprovação - Etapa 10" | Diretor |
| 10 | Aprovar | "Aprovação Confirmada - Etapa 10" | Solicitante + Gestores |
| 10 | Rejeitar | "Aprovação Rejeitada - Etapa 10" | Solicitante + Gestores |

### OS-07 (Solicitação de Reforma)

| Etapa | Ação | Notificação | Destinatário |
|-------|------|-------------|--------------|
| 3 | Solicitar Aprovação (Análise/Parecer) | "Solicitação de Aprovação - Etapa 3" | Coord. Assessoria |
| 3 | Aprovar | "Aprovação Confirmada - Etapa 3" | Solicitante + Gestores |
| 3 | Rejeitar | "Aprovação Rejeitada - Etapa 3" | Solicitante + Gestores |

> **Nota:** OS-07 não possui handoffs (todo workflow no setor Assessoria).

### OS-08 (Visita Técnica / Parecer)

| Etapa | Ação | Notificação | Destinatário |
|-------|------|-------------|--------------|
| 2 → 3 | Handoff | "Nova OS para Setor de Assessoria" | Coord. Assessoria |
| 5 | Solicitar Aprovação (Pós-Visita) | "Solicitação de Aprovação - Etapa 5" | Coord. Assessoria |
| 5 | Aprovar | "Aprovação Confirmada - Etapa 5" | Solicitante + Gestores |
| 5 | Rejeitar | "Aprovação Rejeitada - Etapa 5" | Solicitante + Gestores |

### OS-09 (Requisição de Compras)

| Etapa | Ação | Notificação | Destinatário |
|-------|------|-------------|--------------|
| 1 → 2 | Handoff | "Nova OS para Setor Administrativo" | Coord. Administrativo |
| 2 | Solicitar Aprovação (Orçamentos) | "Solicitação de Aprovação - Etapa 2" | Coord. Administrativo |
| 2 | Aprovar | "Aprovação Confirmada - Etapa 2" | Solicitante + Gestores |
| 2 | Rejeitar | "Aprovação Rejeitada - Etapa 2" | Solicitante + Gestores |

### OS-10 (Requisição de Mão de Obra)

| Etapa | Ação | Notificação | Destinatário |
|-------|------|-------------|--------------|
| 2 | Solicitar Aprovação (Centro de Custo) | "Solicitação de Aprovação - Etapa 2" | Coord. Administrativo |
| 2 | Aprovar | "Aprovação Confirmada - Etapa 2" | Solicitante + Gestores |
| 2 | Rejeitar | "Aprovação Rejeitada - Etapa 2" | Solicitante + Gestores |

### OS-11 (Laudo Pontual Assessoria)

| Etapa | Ação | Notificação | Destinatário |
|-------|------|-------------|--------------|
| 5 | Solicitar Aprovação (Gerar Documento) | "Solicitação de Aprovação - Etapa 5" | Coord. Assessoria |
| 5 | Aprovar | "Aprovação Confirmada - Etapa 5" | Solicitante + Gestores |
| 5 | Rejeitar | "Aprovação Rejeitada - Etapa 5" | Solicitante + Gestores |

### OS-12 (Assessoria Anual / Contrato)

| Etapa | Ação | Notificação | Destinatário |
|-------|------|-------------|--------------|
| 1 → 2 | Handoff | "Nova OS para Setor de Assessoria" | Coord. Assessoria |
| 3 | Solicitar Aprovação (Plano Manutenção) | "Solicitação de Aprovação - Etapa 3" | Coord. Assessoria |
| 3 | Aprovar | "Aprovação Confirmada - Etapa 3" | Solicitante + Gestores |
| 3 | Rejeitar | "Aprovação Rejeitada - Etapa 3" | Solicitante + Gestores |
| 3 → 4 | Handoff | "Nova OS para Setor Administrativo" | Coord. Administrativo |
| 6 → 7 | Handoff | "Nova OS para Setor de Assessoria" | Coord. Assessoria |

### OS-13 (Start de Contrato de Obra) - 17 Etapas

| Etapa | Ação | Notificação | Destinatário |
|-------|------|-------------|--------------|
| 3 | Solicitar Aprovação (Relatório Fotográfico) | "Solicitação de Aprovação - Etapa 3" | Coord. Obras |
| 3 | Aprovar/Rejeitar | "Aprovação Confirmada/Rejeitada - Etapa 3" | Solicitante + Gestores |
| 5 | Solicitar Aprovação (Cronograma) | "Solicitação de Aprovação - Etapa 5" | Coord. Obras |
| 5 | Aprovar/Rejeitar | "Aprovação Confirmada/Rejeitada - Etapa 5" | Solicitante + Gestores |
| 8 | Solicitar Aprovação (Histograma) | "Solicitação de Aprovação - Etapa 8" | Coord. Obras |
| 8 | Aprovar/Rejeitar | "Aprovação Confirmada/Rejeitada - Etapa 8" | Solicitante + Gestores |
| 12 | Solicitar Aprovação (Evidência Mobilização) | "Solicitação de Aprovação - Etapa 12" | Coord. Obras |
| 12 | Aprovar/Rejeitar | "Aprovação Confirmada/Rejeitada - Etapa 12" | Solicitante + Gestores |
| 15 | Solicitar Aprovação (Documentos SST) | "Solicitação de Aprovação - Etapa 15" | Coord. Obras |
| 15 | Aprovar/Rejeitar | "Aprovação Confirmada/Rejeitada - Etapa 15" | Solicitante + Gestores |

> **Nota:** OS-13 gera automaticamente OS-09 (Etapa 10) e OS-10 (Etapa 11).

---

## 🛠 Pontos de Personalização

Para **PERSONALIZAR AS NOTIFICAÇÕES**, você pode atuar em:

### 1. Alterar Textos das Notificações

**Arquivos a modificar:**
- `src/lib/hooks/use-notificar-coordenador.ts` (linha 136-137)
- `src/lib/hooks/use-aprovacao-etapa.ts` (linhas 137-138, 198-199, 263-264)

### 2. Adicionar Novos Tipos de Notificação

1. Atualizar tipagem em `src/lib/services/notifications-service.ts`:
```typescript
tipo: 'info' | 'atencao' | 'sucesso' | 'tarefa' | 'aprovacao' | 'prazo_vencido' | 'novo_tipo';
```

2. Adicionar ícone no `src/components/shared/notification-bell.tsx` e `recent-notifications-widget.tsx`

### 3. Criar Novos Gatilhos Automáticos

### 3. Novos Gatilhos Implementados (v2.0)

| Gatilho | Status | Arquivo |
|---------|--------|--------|
| 🆕 OS Criada | ✅ Implementado | `use-os-workflows.ts` |
| ⏰ Prazo Próximo (≤2 dias) | ✅ Via CRON | `supabase/functions/check-deadlines` |
| 🚨 Prazo Vencido | ✅ Via CRON | `supabase/functions/check-deadlines` |
| 📎 Documento Anexado | ✅ Implementado | `use-os-document-upload.ts` |
| 💬 Comentário Adicionado | 🔧 Estrutura pronta | `notifications-service.ts` |
| 💬 Nova Mensagem Chat | 🔧 Estrutura pronta | `notifications-service.ts` |

---

## 🔄 Edge Function: check-deadlines

**Localização:** `supabase/functions/check-deadlines/index.ts`

**Descrição:** Verifica OS com prazos próximos ou vencidos e cria notificações em lote.

**Execução:** Deve ser agendada via CRON diariamente (ex: 08:00 AM).

**Lógica:**
1. Busca OS com `prazo_etapa_atual` entre hoje e +2 dias → Notificação "Prazo Próximo"
2. Busca OS com `prazo_etapa_atual` < hoje → Notificação "Prazo Vencido"
3. Insere notificações em lote na tabela `notificacoes`

**Textos:**
```typescript
// Prazo Próximo
{
  titulo: `⏰ Prazo em ${diasRestantes} dia(s): ${codigoOS}`,
  mensagem: `A etapa "${etapaNome}" da OS **${clienteNome}** vence em ${diasRestantes} dia(s). Priorize para evitar atrasos.`,
  tipo: 'atencao'
}

// Prazo Vencido
{
  titulo: `🚨 ATRASADO: ${codigoOS}`,
  mensagem: `A etapa "${etapaNome}" da OS **${clienteNome}** está atrasada há ${diasAtraso} dia(s)! Ação urgente necessária.`,
  tipo: 'atencao'
}
```

**Implementação:** Adicionar inserts na tabela `notificacoes` nos hooks/componentes correspondentes.

### 4. Alterar Destinatários

**Arquivo:** `src/lib/hooks/use-aprovacao-etapa.ts` (linhas 128-132, 185-189, 250-254)

Atualmente busca por `funcao IN ('coord_administrativo', 'diretor', 'admin')`.

### 5. Estilização Visual

**Arquivos:**
- `src/components/shared/notification-bell.tsx` - Ícones, cores, layout
- `src/components/home/recent-notifications-widget.tsx` - Widget do dashboard

---

## 📐 Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────────┐
│               FLUXO DE NOTIFICAÇÕES - MINERVA ERP               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐                                            │
│  │ TRANSFERÊNCIA   │                                            │
│  │ DE SETOR        │                                            │
│  └────────┬────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────────────────────┐                    │
│  │ useNotificarCoordenador()               │                    │
│  │ ├─ titulo: "Nova OS para {SETOR}"       │                    │
│  │ ├─ mensagem: "{CÓDIGO} - {CLIENTE}..."  │                    │
│  │ └─ tipo: 'tarefa'                       │                    │
│  └────────┬────────────────────────────────┘                    │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────────────────────┐                    │
│  │ INSERT INTO notificacoes                │                    │
│  │ WHERE usuario_id = coord.id             │                    │
│  └────────┬────────────────────────────────┘                    │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────────────────────┐                    │
│  │ Supabase Realtime                       │                    │
│  │ ├─ Canal: 'notifications-changes'       │                    │
│  │ └─ Filtro: usuario_id = currentUser.id  │                    │
│  └────────┬────────────────────────────────┘                    │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────────────────────┐                    │
│  │ useNotifications() Hook                 │                    │
│  │ ├─ Atualiza lista local                 │                    │
│  │ ├─ Incrementa unreadCount               │                    │
│  │ └─ Exibe Toast (se tipo = 'atencao')    │                    │
│  └────────┬────────────────────────────────┘                    │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────────────────────┐                    │
│  │ NotificationBell Component              │                    │
│  │ └─ Exibe badge com contagem             │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Limitações Atuais

1. **Lógica no Frontend:** Toda criação de notificação está no cliente, não há triggers de banco.
2. **Sem Preferências de Usuário:** Não há sistema para o usuário escolher quais notificações receber.
3. **Tipos Limitados:** Apenas 5 tipos definidos.
4. **Sem Notificações por Email/Push:** Apenas in-app.
5. **Sem Agrupamento:** Notificações não são agrupadas por OS ou tipo.

---

## 📁 Arquivos Relacionados

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/lib/services/notifications-service.ts` | CRUD de notificações + helpers (notifyOSCreated, notifyDocumentoAnexado, etc.) |
| `src/lib/hooks/use-notifications.ts` | Hook global + Realtime |
| `src/lib/hooks/use-notificar-coordenador.ts` | Notificação de transferência |
| `src/lib/hooks/use-aprovacao-etapa.ts` | Notificações de aprovação |
| `src/lib/hooks/use-transferencia-setor.ts` | Executa transferência + chama notificação |
| `src/lib/hooks/use-os-workflows.ts` | Criação de OS + notificação |
| `src/lib/hooks/use-os-document-upload.ts` | Upload de documentos + notificação |
| `supabase/functions/check-deadlines/index.ts` | Edge Function CRON para prazos |
| `src/components/shared/notification-bell.tsx` | UI do sino no header |
| `src/components/home/recent-notifications-widget.tsx` | Widget do dashboard |
