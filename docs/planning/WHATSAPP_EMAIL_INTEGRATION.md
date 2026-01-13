# 📧 WhatsApp e Email Integration - Plano de Implementação

> **Criado:** 13/01/2026  
> **Status:** Aguardando Aprovação  
> **Versão:** v1.0  
> **Complexidade:** Alta

---

## 📌 Visão Geral

Este documento detalha o plano de implementação para a funcionalidade **"WhatsApp e Email"** do sistema Minerva ERP. 

### Objetivos

1. **Mover** a tab WhatsApp do Dashboard Executivo para Configurações > Sistema
2. **Renomear** para "WhatsApp e Email"
3. **Adicionar** configuração de Email (SMTP)
4. **Criar** sistema de Templates de mensagens (WhatsApp e Email)
5. **Implementar** componente reutilizável "Enviar por Email/WhatsApp"
6. **Registrar** todos os envios no sistema de Auditoria

---

## ✅ Decisões Aprovadas

> [!NOTE]
> **Decisões confirmadas pelo usuário (13/01/2026):**
> 1. **Provedor de Email:** Supabase Auth SMTP
> 2. **Templates com variáveis:** Sim, suportar `{{cliente_nome}}`, `{{os_codigo}}`, etc.
> 3. **Limite de envios:** 30 mensagens/dia (configurável em `app_settings`)
> 4. **Anexos:** Sim, suportar PDFs gerados e documentos

---

## 🏗 Arquitetura Proposta

### Fluxo de Dados

```mermaid
graph TD
    subgraph Frontend
        A[Componente "Enviar"] --> B{Canal}
        B -->|WhatsApp| C[Evolution API Hook]
        B -->|Email| D[Email Service Hook]
    end
    
    subgraph Backend - Edge Functions
        C --> E[send-whatsapp Function]
        D --> F[send-email Function]
    end
    
    subgraph Database
        E --> G[(mensagens_enviadas)]
        F --> G
        G --> H[(audit_log)]
    end
    
    subgraph External APIs
        E --> I[Evolution API]
        F --> J[SMTP / Resend]
    end
```

---

## 📁 Estrutura de Arquivos

### Arquivos Novos

```
src/
├── routes/_auth/configuracoes/
│   └── sistema.tsx                           # [NEW] Nova página de sistema
│
├── components/configuracoes/
│   ├── sistema-page.tsx                      # [NEW] Página principal com tabs
│   ├── whatsapp-email-tab.tsx                # [MOVE+MODIFY] Mover de executive/
│   ├── email-settings-section.tsx            # [NEW] Configuração SMTP/Email
│   └── templates-manager.tsx                 # [NEW] Gerenciador de templates
│
├── components/shared/
│   └── send-message-modal.tsx                # [NEW] Modal reutilizável de envio
│
├── lib/
│   ├── hooks/
│   │   ├── use-send-whatsapp.ts              # [NEW] Hook para envio WhatsApp
│   │   ├── use-send-email.ts                 # [NEW] Hook para envio Email
│   │   └── use-message-templates.ts          # [NEW] Hook para templates
│   └── services/
│       └── messaging-service.ts              # [NEW] Serviço unificado de mensagens
│
supabase/
├── functions/
│   ├── send-whatsapp/
│   │   └── index.ts                          # [NEW] Edge Function WhatsApp
│   └── send-email/
│       └── index.ts                          # [NEW] Edge Function Email
│
└── migrations/
    └── YYYYMMDD_messaging_system.sql         # [NEW] Schema de mensagens
```

### Arquivos Modificados

| Arquivo | Ação |
|---------|------|
| `sidebar.tsx` | Adicionar sub-item "Sistema" |
| `executive-dashboard.tsx` | Remover tab WhatsApp |
| `whatsapp-settings-tab.tsx` | Mover para configuracoes/ |
| `use-app-settings.ts` | Adicionar keys de Email |
| `use-audit-logs.ts` | Adicionar tipo 'mensagem_enviada' |

---

## 🗃️ Schema do Banco de Dados

### Nova Tabela: `mensagem_templates`

```sql
CREATE TABLE mensagem_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  canal TEXT NOT NULL CHECK (canal IN ('whatsapp', 'email', 'ambos')),
  assunto_email VARCHAR(200),
  corpo TEXT NOT NULL,
  variaveis_disponiveis TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT TRUE,
  criado_por UUID REFERENCES colaboradores(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Nova Tabela: `mensagens_enviadas`

```sql
CREATE TABLE mensagens_enviadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canal TEXT NOT NULL CHECK (canal IN ('whatsapp', 'email')),
  destinatario_tipo TEXT NOT NULL,
  destinatario_id UUID,
  destinatario_contato VARCHAR(255) NOT NULL,
  destinatario_nome VARCHAR(255),
  template_id UUID REFERENCES mensagem_templates(id),
  assunto VARCHAR(200),
  corpo TEXT NOT NULL,
  anexos JSONB DEFAULT '[]',
  contexto_tipo TEXT,
  contexto_id UUID,
  contexto_codigo VARCHAR(50),
  status TEXT NOT NULL DEFAULT 'pendente',
  erro_mensagem TEXT,
  enviado_em TIMESTAMPTZ,
  enviado_por UUID REFERENCES colaboradores(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🧩 Componentes Principais

### 1. `sistema-page.tsx`

Tabs: WhatsApp e Email | Templates | Histórico de Envios

### 2. `send-message-modal.tsx`

```typescript
interface SendMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contextoTipo: 'os' | 'cliente' | 'proposta' | 'contrato';
  contextoId: string;
  contextoCodigo?: string;
  destinatario?: {
    tipo: 'cliente' | 'colaborador';
    id: string;
    nome: string;
    email?: string;
    telefone?: string;
  };
  anexos?: Array<{ nome: string; url: string; tipo: string }>;
  onSuccess?: (mensagemId: string) => void;
}
```

### 3. Locais de Uso

| Local | Descrição |
|-------|-----------|
| `os-details-redesign-page.tsx` | Botão "Enviar" no header |
| `step-gerar-proposta.tsx` | Após gerar PDF |
| `step-gerar-contrato.tsx` | Após gerar PDF |
| `step-gerar-documento.tsx` | Após gerar documento |
| `cliente-detalhes-page.tsx` | Ação rápida |

---

## 🔍 Integração com Auditoria

Novos tipos em `use-audit-logs.ts`:

```typescript
export type AuditActionType = 
  // ... existing
  | 'mensagem_whatsapp'
  | 'mensagem_email';
```

---

## 📊 Fases de Implementação

| Fase | Descrição | Estimativa |
|------|-----------|------------|
| 1 | Infraestrutura (DB, mover tab, sidebar) | 1-2 dias |
| 2 | Email Config (SMTP, Edge Function, hook) | 1 dia |
| 3 | Templates (CRUD, variáveis, padrões) | 1 dia |
| 4 | Modal de Envio (component, integrações) | 1-2 dias |
| 5 | Auditoria e Histórico | 0.5 dia |

---

## ✅ Verification Plan

### Testes Manuais

1. **Configuração WhatsApp**: Conectar via QR Code
2. **Configuração Email**: Testar conexão SMTP
3. **Templates**: Criar com variáveis
4. **Enviar de OS**: Usar modal de envio
5. **Auditoria**: Verificar registro

---

## 🧩 Mapa de Componentes Reutilizáveis

> [!IMPORTANT]
> Todos os componentes seguem [DESIGN_SYSTEM.md](../technical/DESIGN_SYSTEM.md)

### Componentes a Criar

| Componente | Diretório | Propósito |
|------------|-----------|-----------|
| `send-message-modal.tsx` | `components/messaging/` | Modal unificado de envio |
| `template-selector.tsx` | `components/messaging/` | Select de templates com preview |
| `template-editor.tsx` | `components/messaging/` | Editor de corpo + variáveis |
| `template-preview.tsx` | `components/messaging/` | Preview do template renderizado |
| `channel-toggle.tsx` | `components/messaging/` | Toggle WhatsApp/Email |
| `recipient-input.tsx` | `components/messaging/` | Input validado de email/telefone |
| `attachments-picker.tsx` | `components/messaging/` | Picker de anexos (PDFs) |
| `message-status-badge.tsx` | `components/messaging/` | Badge de status de envio |
| `variable-chip.tsx` | `components/messaging/` | Chip para `{{variavel}}` |
| `daily-limit-indicator.tsx` | `components/messaging/` | Indicador de limite restante |

### Padrões de Design

| Elemento | Classes Tailwind |
|----------|------------------|
| Modal | `shadow-modal rounded-2xl` |
| Card | `shadow-card hover:shadow-card-hover transition-shadow` |
| Badge Success | `bg-success/10 text-success` |
| Badge Error | `bg-destructive/10 text-destructive` |
| Badge Pending | `bg-warning/10 text-warning` |
| Form Spacing | `space-y-2.5` (data-dense) |
| Input Focus | `focus:ring-primary focus:border-primary` |

---

## 🎨 Conformidade com Design System

### Cores por Elemento

| Elemento | Cor | Classe |
|----------|-----|--------|
| Botão Enviar | Primary | `bg-primary hover:bg-primary-600` |
| WhatsApp Icon | Success | `text-success` |
| Email Icon | Info | `text-info` |
| Erro | Destructive | `bg-destructive/10 text-destructive` |
| Limite Alert | Warning | `bg-warning/10 text-warning` |

### Tipografia

```tsx
// Título Modal
<DialogTitle className="text-xl font-semibold">Enviar Mensagem</DialogTitle>

// Labels
<Label className="text-sm font-medium">Destinatário</Label>

// Variáveis
<span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
  {{cliente_nome}}
</span>
```

---

## 🏗 Arquitetura de Escalabilidade

### Separation of Concerns

```
UI Layer → Hooks Layer → Service Layer → Edge Functions
    ↓           ↓              ↓              ↓
 Modal    useSendMessage  messaging-service  send-whatsapp
Template   useTemplates                      send-email
```

### Type Safety

```typescript
// src/lib/types/messaging.ts
export type MessageChannel = 'whatsapp' | 'email';
export type MessageStatus = 'pendente' | 'enviado' | 'entregue' | 'lido' | 'falhou';
export type ContextType = 'os' | 'cliente' | 'proposta' | 'contrato' | 'laudo';

export interface SendMessagePayload {
  canal: MessageChannel;
  destinatario: { tipo: string; contato: string; nome?: string };
  conteudo: { templateId?: string; corpo: string; variaveis?: Record<string, string> };
  contexto?: { tipo: ContextType; id: string; codigo?: string };
  anexos?: Attachment[];
}
```

---

## 🛡 Plano de Mitigação de Erros

### Erros de API Externa

| Cenário | Mitigação | Fallback |
|---------|-----------|----------|
| Evolution API offline | Retry 3x com backoff | Toast "WhatsApp indisponível" |
| SMTP timeout | Timeout 10s, retry 2x | Registrar como falha |
| QR Code expirado | Auto-refresh 30s | Botão "Gerar Novo QR" |
| Token inválido (401) | Detectar e solicitar reconfig | Modal "Reconectar" |

### Erros de Limite

| Cenário | Mitigação |
|---------|-----------|
| Limite diário atingido | `verificar_limite_envios_diario()` antes de enviar |
| UI | `DailyLimitIndicator` mostra restantes |
| Bypass attempt | RLS policy impede inserção no backend |

### Validações

| Campo | Validação | Mensagem |
|-------|-----------|----------|
| Telefone | Regex internacional | "Formato inválido. Use +55..." |
| Email | RFC 5322 | "Email inválido" |
| Corpo | MinLength 10 | "Mensagem muito curta" |
| Anexo | Max 50MB | "Arquivo muito grande" |

### Tratamento no Frontend

```typescript
const { send, isLoading, error, errorCode, canRetry } = useSendMessage();

// UI mostra feedback apropriado por errorCode
// 'LIMIT_EXCEEDED' → Alert warning
// 'API_ERROR' → Alert destructive + botão retry
// 'VALIDATION' → Erro inline no campo
```

### Logging e Monitoramento

| Evento | Destino |
|--------|---------|
| Envio sucesso | Logger + `mensagens_enviadas` |
| Envio falhou | Logger + DB + Sentry |
| Limite atingido | Logger (WARN) |

---

## 📊 Fases de Implementação (Atualizado)

| Fase | Descrição | Estimativa | Status |
|------|-----------|------------|--------|
| 1 | Infraestrutura (DB, mover tab, sidebar) | 1-2 dias | ✅ Concluído |
| 2 | Email Config (SMTP, Edge Function, hook) | 1 dia | ✅ Concluído |
| 3 | Templates (CRUD, variáveis, padrões) | 1 dia | ✅ Concluído |
| 4 | Modal de Envio (component, integrações) | 1-2 dias | ✅ Concluído |
| 5 | Auditoria e Histórico | 0.5 dia | ✅ Concluído |

---

**Implementação concluída em 13/01/2026.**

