# 📐 Arquitetura do Sistema de Geração de PDFs - MinervaV2

> **Versão:** 2.0 (Client-Side)
> **Última Atualização:** 2026-01-14

---

## Visão Geral

O sistema de geração de PDFs do MinervaV2 é uma solução **100% Client-Side** que renderiza documentos profissionais diretamente no navegador do usuário utilizando `@react-pdf/renderer`.

### Principais Características

- ✅ **Client-Side**: Renderização no browser - sem servidor
- ✅ **Templates React**: Familiar para desenvolvedores React
- ✅ **Centralizado**: Um único hook para todos os tipos de PDF
- ✅ **Type-Safe**: TypeScript end-to-end
- ✅ **Performático**: ~500ms-2s por PDF, zero custos de servidor
- ✅ **Zero Cold Starts**: Sem latência de função serverless

---

## Stack Tecnológica

### Frontend (100% da geração)

| Componente | Tecnologia | Versão | Por quê? |
|-----------|-----------|--------|----------|
| **Engine PDF** | @react-pdf/renderer | 3.x | Templates React, layout flexível |
| **Framework** | React | 18.3+ | Componentes reutilizáveis |
| **Hook** | usePDFGeneration | Custom | Abstração de lógica de geração |
| **UI** | shadcn/ui | - | Componentes prontos |

### Backend (apenas storage)

| Componente | Tecnologia | Descrição |
|-----------|-----------|-----------|
| **Storage** | Supabase Storage | Bucket `uploads` para PDFs gerados |
| **Database** | PostgreSQL | Metadata em `os_documentos` |

---

## Decisões de Design

### 1. Por que Client-Side?

**Alternativas consideradas:**
- ❌ Edge Functions: Custo adicional, cold starts, complexidade de deploy
- ❌ Serviços externos (PDFShift): $50-200/mês, vendor lock-in
- ❌ Servidor dedicado: Custo de infraestrutura, manutenção

**Por que Client-Side venceu:**
- ✅ **Custo**: Zero (processamento no browser do usuário)
- ✅ **Simplicidade**: Sem deploy de funções, tudo no frontend
- ✅ **Performance**: Sem latência de rede para gerar
- ✅ **Consistência**: PDF reflete exatamente o que o usuário vê na tela

### 2. Por que @react-pdf/renderer?

**Alternativas consideradas:**
- ❌ jsPDF: API complexa, layout limitado
- ❌ pdfmake: Sem suporte a componentes React
- ❌ html2pdf: Qualidade inferior, problemas de renderização

**Por que @react-pdf/renderer venceu:**
- ✅ **Familiar**: Desenvolvedores já conhecem React/JSX
- ✅ **Flexível**: Layout com Flexbox
- ✅ **Type-Safe**: TypeScript support completo
- ✅ **Reutilizável**: Componentes compartilhados entre templates

### 3. Estrutura Centralizada

**Decisão**: Um único hook `usePDFGeneration` para todos os tipos

**Vantagens:**
- ✅ **Manutenção**: Um ponto de entrada único
- ✅ **Código compartilhado**: Utils e componentes reusados
- ✅ **Consistência**: Mesmo padrão para todos os PDFs
- ✅ **Simples**: Fácil de usar e entender

---

## Fluxo de Geração de PDF

```
┌──────────────────────────────────────────────────────────────────┐
│                         BROWSER (Frontend)                        │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  1. Componente React                                        │   │
│  │     └── Botão "Gerar PDF" clicado                          │   │
│  └───────────────────────┬────────────────────────────────────┘   │
│                          │                                         │
│                          ▼                                         │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  2. usePDFGeneration Hook                                   │   │
│  │     ├── Recebe: tipo, osId, dados                          │   │
│  │     └── Seleciona template baseado no tipo                 │   │
│  └───────────────────────┬────────────────────────────────────┘   │
│                          │                                         │
│                          ▼                                         │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  3. Template React (.tsx)                                   │   │
│  │     ├── <Document>, <Page>, <View>, <Text>, <Image>        │   │
│  │     ├── SharedHeader, SharedFooter                         │   │
│  │     └── Dados passados via props                           │   │
│  └───────────────────────┬────────────────────────────────────┘   │
│                          │                                         │
│                          ▼                                         │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  4. @react-pdf/renderer                                     │   │
│  │     ├── pdf(Component).toBlob()                            │   │
│  │     └── Retorna: Blob binário do PDF                       │   │
│  └───────────────────────┬────────────────────────────────────┘   │
│                          │                                         │
│                          ▼                                         │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  5. pdf-uploader.ts                                         │   │
│  │     ├── Upload Blob para Supabase Storage                   │   │
│  │     ├── Gera Signed URL (1 hora)                           │   │
│  │     └── Retorna: { publicUrl, path }                       │   │
│  └───────────────────────┬────────────────────────────────────┘   │
│                          │                                         │
│                          ▼                                         │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  6. Resultado                                               │   │
│  │     ├── success: true                                       │   │
│  │     ├── url: Signed URL para visualização                  │   │
│  │     ├── path: Caminho persistente no Storage               │   │
│  │     └── metadata: { filename, size, tipo }                 │   │
│  └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                   │
│  ┌────────────────────┐  ┌─────────────────────────────────────┐  │
│  │  Storage           │  │  PostgreSQL (opcional)              │  │
│  │  Bucket: uploads   │  │  Tabela: os_documentos              │  │
│  │  Path: os/{id}/    │  │  Registra metadata do documento     │  │
│  │    documentos/     │  │                                     │  │
│  │    {tipo}/         │  │                                     │  │
│  │    {filename}.pdf  │  │                                     │  │
│  └────────────────────┘  └─────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Estrutura de Arquivos

```
src/
└── lib/
    ├── hooks/
    │   └── use-pdf-generation.tsx     # Hook principal (orquestrador)
    │
    ├── pdf/
    │   ├── pdf-uploader.ts            # Upload para Supabase Storage
    │   ├── shared-styles.ts           # Design system (cores, fontes)
    │   ├── assets.ts                  # Logos em Base64
    │   │
    │   ├── components/                # Componentes visuais compartilhados
    │   │   ├── index.ts               # Re-exports
    │   │   ├── shared-header.tsx      # Cabeçalho padrão Minerva
    │   │   ├── shared-footer.tsx      # Rodapé com paginação
    │   │   └── table-components.tsx   # Tabelas reutilizáveis
    │   │
    │   ├── templates/                 # 8 Templates de Documentos
    │   │   ├── proposta-template.tsx     # OS 1-4
    │   │   ├── contrato-template.tsx     # Geral
    │   │   ├── memorial-template.tsx     # OS 1-4
    │   │   ├── documento-sst-template.tsx # Geral
    │   │   ├── parecer-reforma-template.tsx # OS-07
    │   │   ├── visita-tecnica-template.tsx  # OS-08
    │   │   ├── proposta-ass-anual.tsx    # OS-05
    │   │   └── proposta-ass-pontual.tsx  # OS-06
    │   │
    │   └── utils/
    │       └── pdf-formatter.ts       # Formatadores (moeda, data, CPF)
    │
    └── types.ts                       # PDFType, PDFGenerationRequest/Response

src/
└── components/
    └── pdf/                           # Componentes UI para PDF
        ├── pdf-download-button.tsx    # Botão reutilizável
        └── pdf-preview-modal.tsx      # Modal de preview
```

---

## Armazenamento (Storage)

### Bucket

- **Nome**: `uploads` (privado/autenticado)
- **Acesso**: Signed URLs (validade 1 hora)

### Estrutura de Paths

```
uploads/
└── os/
    └── {osId}/
        └── documentos/
            ├── proposta/
            │   └── proposta_2026-01-14T10-30-00-000Z.pdf
            ├── contrato/
            ├── memorial/
            └── visita-tecnica/
```

### Naming Convention

```
{tipo}_{ISO_timestamp}.pdf
```

Exemplo: `proposta_2026-01-14T10-30-00-000Z.pdf`

---

## Performance

| Métrica | Valor Típico |
|---------|--------------|
| **Tempo de Renderização** | 200-500ms |
| **Upload** | 100-300ms |
| **Total (end-to-end)** | 500ms-2s |
| **Tamanho típico PDF** | 50-200KB |
| **Signed URL validade** | 1 hora |

### Comparação com v1 (Edge Function)

| Aspecto | v1 (Edge Function) | v2 (Client-Side) |
|---------|-------------------|------------------|
| Cold start | 50-150ms | 0ms |
| Custo | ~$0.01/mês | $0 |
| Latência rede | +500ms | 0ms |
| Deploy | Separado (npx supabase deploy) | Com frontend |

---

## Segurança

### Autenticação

- Upload para Storage requer token JWT válido
- Signed URLs expiram em 1 hora

### Validação

- Dados são validados no frontend antes da geração
- Templates validam campos obrigatórios
- CPF/CNPJ validados por algoritmo verificador

---

## Escalabilidade

Como a geração é client-side, não há limites de backend:

- ✅ Cada usuário gera seus próprios PDFs
- ✅ Sem gargalos de servidor
- ✅ Sem rate limiting de funções
- ✅ Storage: Pay as you go

### Limites de Storage (Supabase)

| Tier | Limite |
|------|--------|
| Free | 1GB |
| Pro | 100GB |

Para uso típico (10-20 PDFs/dia, ~100KB cada):
- ~60MB/mês de novos PDFs
- Bem dentro dos limites

---

## Próximas Melhorias

### Curto Prazo
- [ ] Preview em tempo real antes de gerar
- [ ] Compressão de PDFs grandes (>1MB)
- [ ] Cache de templates renderizados

### Médio Prazo
- [ ] Geração em batch (múltiplos PDFs)
- [ ] Suporte a gráficos (@react-pdf/charts)
- [ ] Watermark opcional ("RASCUNHO")

### Longo Prazo
- [ ] Assinatura digital
- [ ] Versionamento automático
- [ ] Editor WYSIWYG de templates

---

## Referências

- [Documentação @react-pdf/renderer](https://react-pdf.org/)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [MCP_PDF_SYSTEM.md](./MCP_PDF_SYSTEM.md) - Índice completo para IAs
