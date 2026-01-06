# Sistema de Geração de PDFs - Documentação Técnica

> **Última Atualização:** 04/01/2026
> **Versão Edge Function:** `generate-pdf` v7
> **Project ID:** `zxfevlkssljndqqhxkjb`

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Tipos de PDF Disponíveis](#tipos-de-pdf-disponíveis)
4. [Templates e Design System](#templates-e-design-system)
5. [Fluxo de Dados](#fluxo-de-dados)
6. [API Reference](#api-reference)
7. [Integração Frontend](#integração-frontend)
8. [Armazenamento e Storage](#armazenamento-e-storage)
9. [Utilitários](#utilitários)
10. [Como Adicionar Novo Tipo de PDF](#como-adicionar-novo-tipo-de-pdf)
11. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O sistema MinervaV2 utiliza **Supabase Edge Functions** (Deno runtime) em conjunto com **@react-pdf/renderer** para gerar documentos PDF server-side. Os PDFs são renderizados a partir de templates React, armazenados no Supabase Storage e registrados na tabela `os_documentos`.

### Stack Tecnológica

| Componente | Tecnologia |
| :--- | :--- |
| Runtime | Deno (Edge Function) |
| Renderização PDF | `@react-pdf/renderer` |
| Templates | React/JSX (`.tsx`) |
| Storage | Supabase Storage (bucket `uploads`) |
| Banco de Metadados | PostgreSQL (`os_documentos`) |
| Frontend Hook | `usePDFGeneration()` |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  usePDFGeneration()                                              │    │
│  │  - generate(tipo, osId, dados)                                  │    │
│  │  - generating: boolean                                           │    │
│  │  - error: Error | null                                           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    ▼ POST /functions/v1/generate-pdf/generate
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────┐
│                         EDGE FUNCTION (Deno)                             │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  index.ts  (Router)                                              │    │
│  │  - /health → Health Check                                        │    │
│  │  - /generate → Switch por tipo                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│           ┌────────────────────────┼───────────────────────┐            │
│           ▼                        ▼                       ▼            │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │ proposta-handler│    │contrato-handler │    │  ...outros...   │     │
│  │  - Busca OS     │    │  - Busca OS     │    │                 │     │
│  │  - Busca Etapas │    │  - Valida dados │    │                 │     │
│  │  - Monta dados  │    │  - Monta dados  │    │                 │     │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘     │
│           │                      │                       │              │
│           └──────────────────────┼───────────────────────┘              │
│                                  ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  TEMPLATES (React PDF)                                           │    │
│  │  - proposta-template.tsx      - contrato-template.tsx            │    │
│  │  - proposta-ass-anual.tsx     - proposta-ass-pontual.tsx         │    │
│  │  - memorial-template.tsx      - documento-sst-template.tsx       │    │
│  │  - parecer-reforma-template.tsx - visita-tecnica-template.tsx    │    │
│  └────────────────────────────────┬────────────────────────────────┘    │
│                                   │ renderToBuffer()                   │
│                                   ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  pdf-storage.ts                                                  │    │
│  │  - uploadPDFToStorage() → Bucket: uploads                        │    │
│  │  - Registra em os_documentos                                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                   │                                     │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
                                    ▼
                         { success: true, url: "...", metadata: {...} }
```

### Estrutura de Diretórios

```
supabase/functions/generate-pdf/
├── index.ts                      # Entry point e router
├── deno.json                     # Configuração Deno + dependências
├── handlers/
│   ├── proposta-handler.ts       # Proposta Comercial (OS 1-4)
│   ├── contrato-handler.ts       # Contrato de Prestação de Serviços
│   ├── memorial-handler.ts       # Memorial Descritivo
│   ├── documento-sst-handler.ts  # Documentos SST
│   ├── parecer-reforma-handler.ts # Parecer de Reforma (OS-07)
│   ├── visita-tecnica-handler.ts # Relatório Visita Técnica (OS-08)
│   ├── proposta-ass-anual-handler.ts   # Proposta Assessoria Anual (OS-05)
│   └── proposta-ass-pontual-handler.ts # Proposta Assessoria Pontual (OS-06)
├── templates/
│   ├── proposta-template.tsx     # Template Proposta Comercial (~873 linhas)
│   ├── contrato-template.tsx     # Template Contrato (~316 linhas)
│   ├── memorial-template.tsx     # Template Memorial
│   ├── documento-sst-template.tsx # Template SST
│   ├── parecer-reforma-template.tsx # Template Parecer Reforma
│   ├── visita-tecnica-template.tsx  # Template Visita Técnica
│   ├── proposta-ass-anual.tsx    # Template Assessoria Anual
│   ├── proposta-ass-pontual.tsx  # Template Assessoria Pontual
│   ├── shared-styles.ts          # Design System para PDFs
│   └── components/
│       ├── index.ts              # Re-exports
│       ├── shared-header.tsx     # Cabeçalho padrão Minerva
│       ├── shared-footer.tsx     # Rodapé padrão
│       └── table-components.tsx  # Componentes de tabela reutilizáveis
└── utils/
    ├── pdf-formatter.ts          # Formatadores (moeda, data, CPF/CNPJ)
    ├── pdf-storage.ts            # Upload e gestão no Storage
    └── validation.ts             # Validação de dados de entrada
```

---

## Tipos de PDF Disponíveis

| `PDFType` | Handler | Template | OS Relacionada | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `proposta` | `proposta-handler.ts` | `proposta-template.tsx` | OS 1-4 | Proposta Comercial completa com cronograma e investimentos |
| `contrato` | `contrato-handler.ts` | `contrato-template.tsx` | Geral | Contrato de Prestação de Serviços |
| `memorial` | `memorial-handler.ts` | `memorial-template.tsx` | OS 1-4 | Memorial Descritivo (sem valores) |
| `documento-sst` | `documento-sst-handler.ts` | `documento-sst-template.tsx` | Geral | Documentos de Saúde e Segurança |
| `parecer-reforma` | `parecer-reforma-handler.ts` | `parecer-reforma-template.tsx` | OS-07 | Parecer Técnico para Reformas |
| `visita-tecnica` | `visita-tecnica-handler.ts` | `visita-tecnica-template.tsx` | OS-08 | Relatório de Visita Técnica |
| `proposta-ass-anual` | `proposta-ass-anual-handler.ts` | `proposta-ass-anual.tsx` | OS-05 | Proposta Assessoria Mensal/Anual |
| `proposta-ass-pontual` | `proposta-ass-pontual-handler.ts` | `proposta-ass-pontual.tsx` | OS-06 | Proposta Assessoria Pontual/Avulsa |

---

## Templates e Design System

### Cores (Brand Minerva)

```typescript
// supabase/functions/generate-pdf/templates/shared-styles.ts

export const colors = {
  // Primary - Gold (Minerva Brand)
  primary: '#D3AF37',
  primaryDark: '#B8941E',
  primaryLight: '#E6C866',

  // Neutral Scale
  neutral50: '#FAFAFA',
  neutral100: '#F5F5F5',
  // ... até neutral900: '#171717'

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Table Header (Azul)
  tableHeaderBg: '#3B82F6',
  tableHeaderText: '#FFFFFF',
};
```

### Tipografia

```typescript
export const fonts = {
  regular: 'Helvetica',
  bold: 'Helvetica-Bold',
  italic: 'Helvetica-Oblique',
  boldItalic: 'Helvetica-BoldOblique',
};

export const fontSize = {
  xs: 8,
  sm: 9,
  base: 10,
  lg: 11,
  xl: 12,
  '2xl': 14,
  '3xl': 16,
  '4xl': 18,
  '5xl': 20,
};
```

### Espaçamento

```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
};
```

### Componentes Reutilizáveis

| Componente | Arquivo | Descrição |
| :--- | :--- | :--- |
| `SharedHeader` | `components/shared-header.tsx` | Cabeçalho com logo Minerva e dados da empresa |
| `SharedFooter` | `components/shared-footer.tsx` | Rodapé com paginação e contatos |
| `Table` | `components/table-components.tsx` | Tabela base |
| `TableHeaderRow` | `components/table-components.tsx` | Linha de cabeçalho |
| `TableRow` | `components/table-components.tsx` | Linha de dados |
| `CategoryRow` | `components/table-components.tsx` | Linha de categoria/seção |
| `SummaryRow` | `components/table-components.tsx` | Linha de totais |

---

## Fluxo de Dados

### Proposta Comercial (OS 1-4) - Exemplo Detalhado

```
1. Frontend chama: generate('proposta', osId, dados)
                            │
                            ▼
2. Edge Function recebe POST /generate
   - Valida Authorization header
   - Extrai tipo, osId, dados do body
                            │
                            ▼
3. proposta-handler.ts
   a) Busca ordens_servico com cliente (JOIN)
      SELECT id, codigo_os, descricao, valor_proposta,
             cliente:clientes(nome_razao_social, cpf_cnpj, ...)
      FROM ordens_servico WHERE id = osId

   b) Busca os_etapas específicas
      SELECT * FROM os_etapas
      WHERE os_id = osId AND ordem IN (1, 7, 8)
      - Etapa 1 (Lead): dados complementares do cliente
      - Etapa 7 (Memorial): etapasPrincipais, subetapas
      - Etapa 8 (Precificação): custos, percentuais

   c) Valida dados obrigatórios:
      - Memorial (Etapa 7) preenchido?
      - Precificação (Etapa 8) preenchida?

   d) Monta objeto PropostaData completo
                            │
                            ▼
4. proposta-template.tsx
   - Renderiza componentes React PDF
   - Seções: Header, DadosCliente, Objetivo,
             EspecificacoesTecnicas, CronogramaObra,
             Garantia, Investimentos, Pagamento, Footer
                            │
                            ▼
5. renderToBuffer(doc)
   - Converte React para PDF binário
                            │
                            ▼
6. uploadPDFToStorage()
   - Upload para: uploads/os/{osId}/documentos/proposta/{timestamp}.pdf
   - INSERT em os_documentos (metadados)
                            │
                            ▼
7. Retorna { success: true, url, metadata }

### Proposta Assessoria (OS 5/6)

```
1. Frontend chama: generate('proposta-ass-anual' | 'proposta-ass-pontual', osId, dados)
                            │
                            ▼
2. Edge Function (Router) → proposta-ass-anual-handler.ts / pontual-handler.ts
                            │
                            ▼
3. Handlers Específicos
   a) Buscam dados da OS e Cliente
   b) Buscam etapas 3/4 (Pontual) ou 4/5 (Anual)
      - Escopo (Especificações, Prazo, Metodologia)
      - Precificação (Valor, Imposto, Pagamento)
   c) Aplicam regras de negócio específicas
      - Pontual: Prazo detalhado em dias úteis
      - Anual: Horário de funcionamento e SLA
                            │
                            ▼
4. Templates (Shared Header/Footer)
   - proposta-ass-anual.tsx
   - proposta-ass-pontual.tsx
   - Usam components/shared-header.tsx (⚠️ Requer logo base64)
                            │
                            ▼
5. Renderização e Upload (mesmo fluxo padrão)
```
```

---

## API Reference

### Endpoint Principal

```
POST {SUPABASE_URL}/functions/v1/generate-pdf/generate
```

### Request

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Body:**
```typescript
interface PDFGenerationRequest {
  tipo: PDFType;  // 'proposta' | 'contrato' | ...
  osId: string;   // UUID da OS
  dados: Record<string, unknown>;  // Dados específicos do tipo
}
```

### Response

**Sucesso (200):**
```typescript
interface PDFGenerationResponse {
  success: true;
  url: string;  // URL pública do PDF
  metadata: {
    filename: string;
    size: number;  // bytes
    tipo: PDFType;
  };
}
```

**Erro (4xx/5xx):**
```typescript
interface PDFGenerationResponse {
  success: false;
  error: string;
}
```

### Health Check

```
GET {SUPABASE_URL}/functions/v1/generate-pdf/health
```

**Response:**
```json
{ "status": "ok", "timestamp": "2026-01-04T23:00:00.000Z" }
```

---

## Integração Frontend

### Hook: `usePDFGeneration`

**Localização:** `src/lib/hooks/use-pdf-generation.ts`

```typescript
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';

function MyComponent({ osId }: { osId: string }) {
  const { generating, error, generate, reset } = usePDFGeneration();

  const handleGenerate = async () => {
    const result = await generate('proposta', osId, {
      clienteCpfCnpj: '12.345.678/0001-00',
      dadosFinanceiros: {
        precoFinal: 50000,
        percentualImposto: 14,
        percentualEntrada: 40,
        numeroParcelas: 3,
      },
    });

    if (result?.success) {
      // Abrir PDF em nova aba
      window.open(result.url, '_blank');
    }
  };

  return (
    <Button onClick={handleGenerate} disabled={generating}>
      {generating ? 'Gerando...' : 'Gerar Proposta PDF'}
    </Button>
  );
}
```

### Tipos TypeScript (Frontend)

**Localização:** `src/lib/types.ts`

```typescript
export type PDFType =
  | 'proposta'
  | 'contrato'
  | 'memorial'
  | 'documento-sst'
  | 'parecer-reforma'
  | 'visita-tecnica'
  | 'proposta-ass-anual'
  | 'proposta-ass-pontual';

export interface PDFGenerationRequest {
  tipo: PDFType;
  osId: string;
  dados: Record<string, unknown>;
}

export interface PDFGenerationResponse {
  success: boolean;
  url?: string;
  error?: string;
  metadata?: {
    filename: string;
    size: number;
    tipo: PDFType;
  };
}
```

---

## Armazenamento e Storage

### Bucket

- **Nome:** `uploads`
- **Tipo:** Público (URLs acessíveis sem autenticação)

### Estrutura de Paths

```
uploads/
└── os/
    └── {osId}/
        └── documentos/
            ├── proposta/
            │   └── proposta_2026-01-04T23-00-00-000Z.pdf
            ├── contrato/
            │   └── contrato_2026-01-04T23-00-00-000Z.pdf
            └── ...outros tipos.../
```

### Tabela `os_documentos`

```sql
CREATE TABLE os_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID REFERENCES ordens_servico(id),
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL,  -- PDFType
  caminho_arquivo TEXT NOT NULL,
  tamanho_bytes INTEGER,
  mime_type VARCHAR(100) DEFAULT 'application/pdf',
  metadados JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Utilitários

### Formatadores (`pdf-formatter.ts`)

| Função | Input | Output |
| :--- | :--- | :--- |
| `formatarMoeda(valor)` | `5000` | `R$ 5.000,00` |
| `formatarData(data)` | `'2026-01-04'` | `04/01/2026` |
| `formatarDataHora(data)` | `'2026-01-04T23:00'` | `04/01/2026 23:00` |
| `formatarCPF(cpf)` | `'12345678900'` | `123.456.789-00` |
| `formatarCNPJ(cnpj)` | `'12345678000100'` | `12.345.678/0001-00` |
| `formatarCpfCnpj(doc)` | Auto-detecta | CPF ou CNPJ formatado |
| `formatarTelefone(tel)` | `'98912345678'` | `(98) 91234-5678` |
| `formatarCEP(cep)` | `'65000000'` | `65000-000` |
| `capitalize(texto)` | `'são luís'` | `São Luís` |
| `truncate(texto, max)` | `'Muito longo...', 10` | `Muito l...` |

### Storage (`pdf-storage.ts`)

| Função | Descrição |
| :--- | :--- |
| `uploadPDFToStorage(supabase, buffer, osId, tipo, metadata)` | Upload + registro em `os_documentos` |
| `getSignedUrl(supabase, path, expiresIn)` | Gera URL temporária (padrão 1h) |
| `listDocumentosByOS(supabase, osId, tipo?)` | Lista PDFs de uma OS |
| `deletePDF(supabase, path)` | Remove do Storage e do banco |

---

## Como Adicionar Novo Tipo de PDF

### 1. Criar Template

```tsx
// supabase/functions/generate-pdf/templates/novo-tipo-template.tsx

import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { colors, fonts, fontSize, commonStyles } from './shared-styles.ts';
import { SharedHeader } from './components/shared-header.tsx';
import { SharedFooter } from './components/shared-footer.tsx';

export interface NovoTipoData {
  codigoOS: string;
  // ... outros campos
}

export function NovoTipoTemplate({ data }: { data: NovoTipoData }) {
  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <SharedHeader codigoOS={data.codigoOS} />
        {/* Conteúdo do PDF */}
        <SharedFooter />
      </Page>
    </Document>
  );
}
```

### 2. Criar Handler

```typescript
// supabase/functions/generate-pdf/handlers/novo-tipo-handler.ts

import { SupabaseClient } from '@supabase/supabase-js';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { NovoTipoTemplate, type NovoTipoData } from '../templates/novo-tipo-template.tsx';
import { uploadPDFToStorage } from '../utils/pdf-storage.ts';
import { PDFGenerationResponse } from '../index.ts';

export async function handleNovoTipoGeneration(
  supabase: SupabaseClient,
  osId: string,
  dados: Record<string, unknown>
): Promise<PDFGenerationResponse> {
  try {
    // 1. Buscar dados necessários do Supabase
    const { data: os, error } = await supabase
      .from('ordens_servico')
      .select('*')
      .eq('id', osId)
      .single();

    if (error || !os) {
      throw new Error('OS não encontrada');
    }

    // 2. Montar dados do template
    const templateData: NovoTipoData = {
      codigoOS: os.codigo_os,
      // ...
    };

    // 3. Renderizar
    const doc = React.createElement(NovoTipoTemplate, { data: templateData });
    const pdfBuffer = await renderToBuffer(doc);

    // 4. Upload
    const result = await uploadPDFToStorage(
      supabase,
      new Uint8Array(pdfBuffer),
      osId,
      'novo-tipo',
      { codigoOS: templateData.codigoOS }
    );

    return {
      success: true,
      url: result.url,
      metadata: {
        filename: result.filename,
        size: result.size,
        tipo: 'novo-tipo',
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}
```

### 3. Registrar no Router

```typescript
// supabase/functions/generate-pdf/index.ts

import { handleNovoTipoGeneration } from './handlers/novo-tipo-handler.ts';

// Adicionar ao type
export type PDFType = 'proposta' | /* ... */ | 'novo-tipo';

// Adicionar ao switch
switch (tipo) {
  // ...casos existentes...
  case 'novo-tipo':
    result = await handleNovoTipoGeneration(supabase, osId, dados);
    break;
}
```

### 4. Atualizar Tipos no Frontend

```typescript
// src/lib/types.ts

export type PDFType =
  | 'proposta'
  // ...
  | 'novo-tipo';
```

### 5. Deploy

```bash
npx supabase functions deploy generate-pdf
```

---

## Troubleshooting

### PDF não gera

1. **Verificar logs:**
   ```bash
   npx supabase functions logs generate-pdf --tail
   ```

2. **Dados obrigatórios ausentes:**
   Cada template tem validações específicas. Verificar se todos os campos requeridos estão preenchidos.

3. **Etapas de workflow não concluídas:**
   Para `proposta` (OS 1-4), as etapas 7 (Memorial) e 8 (Precificação) devem estar preenchidas.

### Erro 401 (Unauthorized)

- Verificar se o token JWT está sendo enviado no header `Authorization`.
- Token pode ter expirado. Verificar sessão do usuário.

### Erro 403 (Forbidden)

- Políticas RLS podem estar bloqueando acesso à OS ou ao bucket.
- Verificar se o usuário tem permissão para acessar os dados.

### Erro de Upload

- Verificar se o bucket `uploads` existe.
- Conferir policies do bucket:
  ```sql
  -- Permitir upload autenticado
  CREATE POLICY "Allow authenticated uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'uploads');
  ```

### Template com erro de renderização

- Verificar sintaxe JSX no template.
- React PDF não suporta todos os elementos HTML. Usar apenas `Document`, `Page`, `View`, `Text`, `Image`, `Link`.
- Estilos devem usar `StyleSheet.create()`.

---

## Comandos Úteis

```bash
# Deploy da Edge Function
npx supabase functions deploy generate-pdf

# Logs em tempo real
npx supabase functions logs generate-pdf --tail

# Servir localmente para desenvolvimento
npx supabase functions serve generate-pdf

# Testar health check
curl -X GET "https://zxfevlkssljndqqhxkjb.supabase.co/functions/v1/generate-pdf/health"
```

---

## Referências

- [Documentação @react-pdf/renderer](https://react-pdf.org/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Deno Runtime](https://deno.land/)
- [CONSTITUICAO.md](file:///c:/Users/Usuario/OneDrive/Documentos/claude/Minervav2/CONSTITUICAO.md) - Regras do projeto
