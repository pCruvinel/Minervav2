# 📐 Arquitetura do Sistema de Geração de PDFs - MinervaV2

## Visão Geral

O sistema de geração de PDFs do MinervaV2 é uma solução **serverless** e **centralizada** que permite gerar documentos profissionais (Propostas, Contratos, Memoriais e Documentos SST) a partir de templates React, com armazenamento automático no Supabase Storage.

### Principais Características

- ✅ **Serverless**: Edge Functions (Deno) - sem servidor para gerenciar
- ✅ **Templates React**: Familiar para desenvolvedores React
- ✅ **Centralizado**: Única Edge Function para todos os tipos de PDF
- ✅ **Type-Safe**: TypeScript end-to-end
- ✅ **Performático**: ~1-3s por PDF, <$0.01/mês em custos
- ✅ **Escalável**: Suporta milhares de PDFs/dia sem modificações

---

## Stack Tecnológica

### Backend (Edge Function)

| Componente | Tecnologia | Versão | Por quê? |
|-----------|-----------|--------|----------|
| **Runtime** | Deno | 1.x | Seguro, rápido, TypeScript nativo |
| **PDF Engine** | @react-pdf/renderer | 3.4.0 | Templates React, layout flexível |
| **Storage** | Supabase Storage | - | Integração nativa, RLS, signed URLs |
| **Database** | PostgreSQL (Supabase) | 15+ | Metadata de documentos |

### Frontend

| Componente | Tecnologia | Versão | Por quê? |
|-----------|-----------|--------|----------|
| **Framework** | React | 18.3+ | Componentes reutilizáveis |
| **Hook** | use-pdf-generation | Custom | Abstração de lógica de geração |
| **UI** | shadcn/ui | - | Componentes prontos (Button, Modal) |

---

## Decisões de Design

### 1. Por que Edge Functions (Supabase)?

**Alternativas consideradas:**
- ❌ Client-side (jsPDF, pdfmake): Limitado em layout, sem controle de servidor
- ❌ Serviços externos (PDFShift, DocRaptor): Custo alto (~$50-200/mês), vendor lock-in
- ❌ Servidor dedicado (Node.js + Puppeteer): Custo de infraestrutura, manutenção complexa

**Por que Edge Functions venceu:**
- ✅ **Custo**: ~$0.002-0.006/mês para 10-20 PDFs/dia (vs $50+/mês em serviços externos)
- ✅ **Simplicidade**: Sem servidor para gerenciar, deploy com 1 comando
- ✅ **Integração**: Nativa com Supabase Storage e Auth
- ✅ **Performance**: Cold start <100ms, execução 1-3s
- ✅ **Escalabilidade**: Auto-scaling automático

### 2. Por que @react-pdf/renderer?

**Alternativas consideradas:**
- ❌ Puppeteer/Playwright: Alto uso de memória (500MB+), slow cold start
- ❌ pdfmake: API complexa, limitações de layout
- ❌ HTML + wkhtmltopdf: Deprecated, problemas de renderização

**Por que @react-pdf/renderer venceu:**
- ✅ **Familiar**: Desenvolvedores já conhecem React/JSX
- ✅ **Flexível**: Layout com Flexbox, suporte a imagens, tabelas
- ✅ **Performático**: Renderização rápida (~500ms-1s)
- ✅ **Type-Safe**: TypeScript support completo
- ✅ **Reutilizável**: Componentes compartilhados entre templates

### 3. Estrutura Centralizada vs Múltiplas Functions

**Decisão**: Uma única Edge Function com múltiplos handlers

**Vantagens:**
- ✅ **Manutenção**: Um único deploy para todos os PDFs
- ✅ **Código compartilhado**: Utils, validação, storage reusados
- ✅ **Custo**: Menos cold starts
- ✅ **Simplicidade**: Menos funções para gerenciar

**Trade-offs:**
- ⚠️ Deploy atualiza todos os tipos (mitigado por testes)
- ⚠️ Função maior (mas ainda <10MB)

---

## Fluxo de Geração de PDF

```
┌──────────────┐
│   Frontend   │
│  (React UI)  │
└───────┬──────┘
        │ 1. Usuário clica "Gerar PDF"
        ▼
┌───────────────────────────────────────┐
│  usePDFGeneration Hook                │
│  - Coleta dados do formulário         │
│  - Obtém token JWT do Supabase Auth   │
│  - Monta request body                 │
└───────┬───────────────────────────────┘
        │ 2. POST /generate-pdf/generate
        ▼        (com Authorization header)
┌───────────────────────────────────────┐
│  Edge Function (Deno)                 │
│  ┌─────────────────────────────────┐  │
│  │ 1. Valida autenticação (JWT)    │  │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │ 2. Roteamento por tipo          │  │
│  │    ├─ proposta-handler.ts       │  │
│  │    ├─ contrato-handler.ts       │  │
│  │    ├─ memorial-handler.ts       │  │
│  │    └─ documento-sst-handler.ts  │  │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │ 3. Validação de dados           │  │
│  │    (validation.ts)              │  │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │ 4. Renderiza template React     │  │
│  │    → @react-pdf/renderer        │  │
│  │    → Gera buffer PDF            │  │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │ 5. Upload para Supabase Storage │  │
│  │    Bucket: uploads              │  │
│  │    Path: os/{osId}/documentos/  │  │
│  │          {tipo}/{timestamp}.pdf │  │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │ 6. Salva metadata em DB         │  │
│  │    Tabela: os_documentos        │  │
│  └─────────────────────────────────┘  │
└───────┬───────────────────────────────┘
        │ 3. Retorna { success, url, metadata }
        ▼
┌───────────────────────────────────────┐
│  Frontend                             │
│  - Mostra toast de sucesso            │
│  - Faz download automático do PDF     │
│  - Atualiza UI (URL, status)          │
└───────────────────────────────────────┘
```

---

## Estrutura de Arquivos

```
supabase/functions/generate-pdf/
├── index.ts                          # 🚪 Entry point
│   ├─ Configuração CORS
│   ├─ Endpoints: /health, /generate
│   └─ Roteamento por tipo de PDF
│
├── deno.json                         # 📦 Dependências Deno
│   ├─ @react-pdf/renderer@3.4.0
│   ├─ react@18.2.0
│   └─ @supabase/supabase-js@2.39.0
│
├── handlers/                         # 🎯 Lógica de geração
│   ├── proposta-handler.ts          # Gera propostas comerciais
│   ├── contrato-handler.ts          # Gera contratos
│   ├── memorial-handler.ts          # Gera memoriais descritivos
│   └── documento-sst-handler.ts     # Gera documentos SST
│
├── templates/                        # 🎨 Templates React PDF
│   ├── proposta-template.tsx        # Layout de proposta
│   ├── contrato-template.tsx        # Layout de contrato
│   ├── memorial-template.tsx        # Layout de memorial
│   ├── documento-sst-template.tsx   # Layout SST
│   └── shared-styles.ts             # 🎨 Design system
│       ├─ Cores (primary, neutral, success, etc.)
│       ├─ Espaçamentos (margins, paddings)
│       └─ Estilos comuns (header, footer, table)
│
└── utils/                            # 🛠 Utilitários
    ├── validation.ts                # Validação de dados
    │   ├─ validateCPF()
    │   ├─ validateCNPJ()
    │   ├─ validateEmail()
    │   ├─ validatePropostaData()
    │   └─ validateContratoData()
    │
    ├── pdf-formatter.ts             # Formatação
    │   ├─ formatarMoeda()
    │   ├─ formatarData()
    │   ├─ formatarCPF()
    │   ├─ formatarCNPJ()
    │   └─ formatarTelefone()
    │
    └── pdf-storage.ts               # Storage
        └─ uploadPDFToStorage()
            ├─ Upload para bucket 'uploads'
            ├─ Gera signed URL
            └─ Salva metadata em os_documentos
```

```
src/ (Frontend)
├── lib/
│   ├── hooks/
│   │   └── use-pdf-generation.ts    # 🎣 Hook principal
│   │       ├─ generate(tipo, osId, dados)
│   │       ├─ Estado: generating, error
│   │       └─ Auto toast em sucesso/erro
│   │
│   └── types.ts                     # 📝 Tipos TypeScript
│       ├─ PDFType = 'proposta' | 'contrato' | ...
│       ├─ PDFGenerationRequest
│       └─ PDFGenerationResponse
│
├── components/pdf/                  # 🧩 Componentes PDF
│   ├── pdf-download-button.tsx     # Botão com loading
│   └── pdf-preview-modal.tsx       # Modal de preview
│
└── routes/_auth/
    └── teste-pdf.tsx                # 🧪 Página de testes
```

---

## Armazenamento e Metadata

### Supabase Storage (Bucket: `uploads`)

**Estrutura de pastas:**
```
uploads/
└── os/
    └── {osId}/                      # Ex: OS-TEST-001
        └── documentos/
            ├── proposta/
            │   ├── proposta_2025-01-15T10-30-00.pdf
            │   └── proposta_2025-01-20T14-15-30.pdf
            ├── contrato/
            │   └── contrato_2025-01-16T11-00-00.pdf
            ├── memorial/
            │   └── memorial_2025-01-17T09-45-00.pdf
            └── documento-sst/
                └── documento-sst_2025-01-18T15-30-00.pdf
```

**Naming convention**: `{tipo}_{ISO_timestamp}.pdf`

### Metadata (Tabela: `os_documentos`)

```sql
CREATE TABLE os_documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  os_id TEXT NOT NULL,
  tipo TEXT NOT NULL,                -- 'proposta', 'contrato', etc.
  nome TEXT NOT NULL,                -- Nome do arquivo
  caminho TEXT NOT NULL,             -- Path no storage
  tamanho INTEGER,                   -- Tamanho em bytes
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
```

**Benefícios:**
- ✅ Histórico completo de documentos
- ✅ Rastreabilidade (quem gerou, quando)
- ✅ Busca rápida por OS ou tipo
- ✅ Fácil auditoria

---

## Performance e Custos

### Performance Esperada

| Métrica | Valor | Observações |
|---------|-------|-------------|
| **Cold Start** | 50-150ms | Primeira chamada após período de inatividade |
| **Warm Start** | 10-30ms | Chamadas subsequentes |
| **Geração de PDF** | 500ms-2s | Depende da complexidade do template |
| **Upload** | 100-300ms | Tamanho típico: 50-200KB |
| **Total (end-to-end)** | 1-3s | Experiência do usuário |
| **Timeout** | 20s | Configuração padrão do Supabase |
| **Memória** | 512MB | Padrão, suficiente para todos os casos |

### Custos Estimados (10-20 PDFs/dia)

**Supabase Edge Functions** (Pricing: $2/mês por 100k invocations)
- PDFs/mês: ~300-600
- Custo: **~$0.006-0.012/mês**

**Supabase Storage** (Pricing: $0.021/GB/mês)
- Tamanho médio PDF: 100KB
- Storage/mês: ~30-60MB = 0.03-0.06GB
- Custo: **~$0.0006-0.0013/mês**

**Total estimado: <$0.02/mês** 🎉

Para comparação:
- Serviços externos (PDFShift, DocRaptor): $50-200/mês
- Economia: **>99%**

---

## Segurança

### Autenticação e Autorização

1. **JWT Token Required**
   - Todos os requests para `/generate` exigem header `Authorization: Bearer {token}`
   - Token validado pelo Supabase Auth

2. **Row Level Security (RLS)**
   - Bucket `uploads` com políticas RLS
   - Usuários só acessam PDFs de suas próprias OSs

3. **Validação de Dados**
   - Todos os inputs são validados antes da geração
   - CPF/CNPJ validados por algoritmo verificador
   - Email validado por regex

### Prevenção de Ataques

| Ataque | Mitigação |
|--------|-----------|
| **Injection** | Validação estrita de tipos, sanitização de inputs |
| **Unauthorized Access** | JWT obrigatório, RLS policies |
| **DoS** | Rate limiting do Supabase (padrão), timeout de 20s |
| **Data Exfiltration** | Signed URLs com expiração, RLS |

---

## Escalabilidade

### Limites Atuais (Supabase Free Tier)

- **Invocations**: 500k/mês (~16k/dia)
- **Bandwidth**: 5GB/mês
- **Storage**: 1GB total

Para 10-20 PDFs/dia:
- Invocations usadas: ~600/mês (0.12% do limite)
- Storage usado: ~60MB/mês (6% do limite)

### Como Escalar

**Cenário 1: 100 PDFs/dia**
- Ainda dentro do free tier
- Custo adicional: $0

**Cenário 2: 1000 PDFs/dia**
- Upgrade para Pro tier ($25/mês base)
- Edge Functions: incluído
- Storage adicional: ~$0.60/mês
- **Total: ~$25.60/mês**

**Cenário 3: 10,000 PDFs/dia**
- Pro tier
- Edge Functions: ~$6/mês
- Storage: ~$6/mês
- **Total: ~$37/mês**

Ainda **muito mais barato** que serviços externos!

---

## Monitoramento e Logs

### Logs da Edge Function

```bash
# Ver logs em tempo real
npx supabase functions logs generate-pdf

# Filtrar por erro
npx supabase functions logs generate-pdf --level error
```

### Métricas Importantes

1. **Taxa de Sucesso**
   - Meta: >99%
   - Monitorar: `success: true` vs `success: false` em responses

2. **Tempo de Geração**
   - Meta: <3s no p95
   - Monitorar: timestamp de início vs fim

3. **Tamanho de PDFs**
   - Meta: <500KB
   - Monitorar: `metadata.size` em responses

4. **Erros de Validação**
   - Meta: <5%
   - Monitorar: `ValidationException` em logs

---

## Próximas Melhorias (Roadmap)

### Curto Prazo (1-3 meses)
- [ ] Suporte a múltiplas páginas em templates
- [ ] Cabeçalho e rodapé customizáveis por template
- [ ] Watermark opcional (ex: "RASCUNHO")
- [ ] Compressão de PDFs grandes (>1MB)

### Médio Prazo (3-6 meses)
- [ ] Geração em batch (múltiplos PDFs de uma vez)
- [ ] Cache de templates renderizados
- [ ] Suporte a gráficos e charts (@react-pdf/charts)
- [ ] Preview em tempo real (sem gerar PDF)

### Longo Prazo (6+ meses)
- [ ] Assinatura digital com certificado
- [ ] OCR para busca em PDFs
- [ ] Versionamento automático de documentos
- [ ] Editor WYSIWYG de templates

---

## Referências

- [Documentação @react-pdf/renderer](https://react-pdf.org/)
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Manual](https://deno.land/manual)
- [Guia do Desenvolvedor](./GUIA_DESENVOLVEDOR.md)
- [API Reference](./API_REFERENCE.md)
- [Templates Guide](./TEMPLATES.md)
