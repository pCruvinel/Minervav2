# Sistema de Geração de PDFs - Documentação Técnica (v2.0)

> **Última Atualização:** 08/01/2026
> **Arquitetura:** Client-Side (Frontend Only)
> **Engine:** `@react-pdf/renderer` v3.x
> **Project ID:** `zxfevlkssljndqqhxkjb`

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Tipos de PDF Disponíveis](#tipos-de-pdf-disponíveis)
4. [Estrutura de Diretórios](#estrutura-de-diretórios)
5. [Hook: `usePDFGeneration`](#hook-usepdfgeneration)
6. [Templates e Design System](#templates-e-design-system)
7. [Fluxo de Dados](#fluxo-de-dados)
8. [Armazenamento (Storage)](#armazenamento-storage)
9. [Como Adicionar Novo Tipo de PDF](#como-adicionar-novo-tipo-de-pdf)
10. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A partir de **Janeiro/2026 (v2.0)**, o sistema MinervaV2 migrou a geração de documentos PDF de Supabase Edge Functions para uma arquitetura **100% Client-Side**.

Os PDFs são gerados diretamente no navegador do usuário utilizando `@react-pdf/renderer`, resultando em maior performance, menor custo (sem invocações de Edge Function) e melhor experiência de desenvolvimento.

### Stack Tecnológica

| Componente | Tecnologia |
| :--- | :--- |
| Engine de Renderização | `@react-pdf/renderer` (Client-Side) |
| Templates | React Components (`.tsx`) |
| Lógica de Geração | Custom Hook (`use-pdf-generation.tsx`) |
| Storage | Supabase Storage (bucket `uploads`) |
| Upload/Persistência | `pdf-uploader.ts` |
| Banco de Metadados | PostgreSQL (`os_documentos`) |

---

## Arquitetura

```mermaid
graph TD
    User[Usuário] -->|Clica em Gerar PDF| Component[Componente React]
    Component -->|Chama| Hook[usePDFGeneration Hook]
    
    subgraph Browser Client-Side
        Hook -->|Seleciona| Template[Template React (.tsx)]
        Template -->|Renderiza| Engine[@react-pdf/renderer]
        Engine -->|Gera| Blob[Blob Binário (PDF)]
        
        Hook -->|Blob| Uploader[pdf-uploader.ts]
    end
    
    subgraph Supabase
        Uploader -->|Upload| Storage[Bucket 'uploads']
        Uploader -->|Generate| SignedURL[Signed URL]
    end
    
    Uploader -->|Retorna| Result[URL Assinada + Metadados]
    Result -->|Exibe| Preview[PDFViewerEmbedded]
```

---

## Tipos de PDF Disponíveis

| `PDFType` | Template | Contexto de Uso | Descrição |
| :--- | :--- | :--- | :--- |
| `proposta` | `proposta-template.tsx` | OS 1-4 (Obras) | Proposta completa com memorial, cronograma e financeiro. |
| `proposta-ass-anual` | `proposta-ass-anual.tsx` | OS 5 (Assessoria) | Proposta estruturada para contratos recorrentes. |
| `proposta-ass-pontual` | `proposta-ass-pontual.tsx` | OS 6 (Assessoria) | Proposta ou laudo para serviços pontuais. |
| `contrato` | `contrato-template.tsx` | Geral | Minuta de contrato de prestação de serviços. |
| `memorial` | `memorial-template.tsx` | OS 1-4 | Documento técnico detalhando execução (sem valores). |
| `documento-sst` | `documento-sst-template.tsx` | Geral | Documentação de Saúde e Segurança. |
| `parecer-reforma` | `parecer-reforma-template.tsx` | OS 7 | Parecer técnico específico para reformas. |
| `visita-tecnica` | `visita-tecnica-template.tsx` | OS 8 | Relatório de vistoria e visita técnica. |

---

## Estrutura de Diretórios

Toda a lógica de PDF agora reside em `src/lib/pdf/`:

```
src/
└── lib/
    ├── hooks/
    │   └── use-pdf-generation.tsx      # ⚠️ Hook principal (Orquestrador)
    └── pdf/
        ├── pdf-uploader.ts             # Lógica de Upload e Signed URLs
        ├── shared-styles.ts            # Estilos globais (cores, fontes)
        ├── assets.ts                   # Logos e imagens em Base64
        ├── components/                 # Componentes visuais compartilhados
        │   ├── shared-header.tsx       # Cabeçalho padrão
        │   ├── shared-footer.tsx       # Rodapé padrão
        │   └── table-components.tsx    # Tabelas reutilizáveis
        ├── templates/                  # Templates de Documentos
        │   ├── proposta-template.tsx
        │   ├── contrato-template.tsx
        │   ├── ... (outros templates)
        └── utils/
            ├── pdf-formatter.ts        # Formatadores (Moeda, Data, CPF)
            └── validation.ts           # Validadores
```

---

## Hook: `usePDFGeneration`

Este é o ponto de entrada único para geração de documentos.

**Localização:** `src/lib/hooks/use-pdf-generation.tsx`

```typescript
const { generating, generate, error } = usePDFGeneration();

// Exemplo de uso
const handleGenerate = async () => {
  const result = await generate('proposta', osId, dadosDoTemplate);
  
  if (result?.success) {
    console.log('PDF URL:', result.url); // URL Assinada pronta para uso
    console.log('Path:', result.path);   // Caminho no Storage
  }
};
```

### Parâmetros de `generate`

1. **`tipo`** (`PDFType`): Identificador do tipo de documento.
2. **`osId`** (`string`): UUID da Ordem de Serviço (usado para compor o caminho do arquivo).
3. **`dados`** (`any`): Objeto de dados que será passado diretamente ao Template.

### Retorno (`PDFGenerationResponse`)

```typescript
{
  success: boolean;
  url?: string;        // URL assinada temporária (1h) para visualização imediata
  path?: string;       // Caminho persistente no Storage (para salvar no banco)
  error?: string;
  metadata?: {
    filename: string;
    size: number;
    tipo: PDFType;
  };
}
```

---

## Templates e Design System

Os templates são componentes React puros que utilizam primitivos do `@react-pdf/renderer` (`<Document>`, `<Page>`, `<View>`, `<Text>`, `<Image>`).

### Estilização
Utilizamos um arquivo central de estilos em `src/lib/pdf/shared-styles.ts` que reflete a identidade visual da Minerva.

```typescript
import { colors, fonts, commonStyles } from '../shared-styles';

// Exemplo de uso em template
<Text style={[commonStyles.sectionTitle, { color: colors.primary }]}>
  Orçamento
</Text>
```

### Componentes Compartilhados

1. **`SharedHeader`**: Aceita `codigoOS`, `documentTitle`, `documentSubtitle` e `documentDate`.
2. **`SharedFooter`**: Exibe paginação e rodapé da empresa.
3. **`TableComponents`**:
   - `Table`: Container flex.
   - `TableHeaderCell`: Célula de cabeçalho com `style` customizável.
   - `TableCell`: Célula de dados com suporte a `flexValue` (largura) e `style`.

---

## Fluxo de Dados

Diferente da versão anterior (v1) onde a Edge Function buscava dados no banco, a versão v2 **recebe os dados prontos do Frontend**.

1. **Componente Pai (ex: `StepGerarProposta`)**: Coleta dados de todos os steps anteriores (Client, OS, Itens, Financeiro).
2. **Normalização**: Organiza esses dados no formato esperado pelo Template.
3. **Geração**: Passa o objeto normalizado para `generate()`.

**Vantagem**: Garante que o PDF reflita exatamente o que o usuário está vendo na tela, sem necessidade de queries adicionais ou problemas de sincronia.

---

## Armazenamento (Storage)

### Bucket
- **Nome**: `uploads` (Bucket privado/autenticado).
- **Caminho**: `os/{osId}/documentos/{tipo}/{filename}`.

### Upload e URLs
A lógica de upload está isolada em `src/lib/pdf/pdf-uploader.ts`.

1. **Upload**: Envia o Blob para o Supabase Storage.
2. **Assinatura**: Gera imediatamente uma **Signed URL** (validade: 1 hora).
3. **Retorno**: Devolve a URL assinada para o hook, permitindo que o usuário visualize o arquivo imediatamente no `<PDFViewerEmbedded>` sem erros de permissão.

---

## Como Adicionar Novo Tipo de PDF

1. **Criar Template**:
   Crie `src/lib/pdf/templates/novo-tipo-template.tsx`. Use `SharedHeader` e `SharedFooter`.

2. **Definir Interface de Dados**:
   Exporte uma interface `NovoTipoData` definindo o que o template precisa receber.

3. **Registrar no Hook**:
   Em `src/lib/hooks/use-pdf-generation.tsx`, adicione um `case` no `switch`:
   ```typescript
   case 'novo-tipo':
     DocumentComponent = <NovoTipoTemplate data={dados} />;
     break;
   ```

4. **Atualizar Tipos**:
   Adicione `'novo-tipo'` ao type `PDFType` em `src/lib/types.ts`.

---

## Troubleshooting

### Erro: "ReferenceError: window is not defined"
- **Causa**: Tentativa de renderizar PDF no Server Component ou fora do browser.
- **Solução**: `usePDFGeneration` deve ser usado apenas em componentes com `"use client"`.

### Erro: Estilos não aplicados
- **Causa**: O React PDF não suporta herança de estilos CSS (Cascading).
- **Solução**: Passe estilos explicitamente via prop `style` ou array de estilos `[style1, style2]`.

### Imagens quebradas
- **Causa**: URLs de imagem externas com bloqueio de CORS.
- **Solução**: Utilize imagens em Base64 importadas de `assets.ts`.

### PDF em branco ou erro de renderização
- **Causa**: Elemento `undefined` ou `null` sendo renderizado dentro de um `<Text>`.
- **Solução**: Garanta que todos os valores interpolados `{valor}` tenham fallback: `{valor || ''}`.


> **Última Atualização:** 06/01/2026
> **Versão Edge Function:** `generate-pdf` v8
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
│   ├── proposta-template.tsx     # Template Proposta Comercial (~830 linhas)
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

> [!IMPORTANT]
> **`formatarMoeda()` já inclui o símbolo "R$"**. Não adicione manualmente o prefixo "R$" ao usar esta função, caso contrário o valor aparecerá duplicado (ex: "R$ R$ 5.000,00").
> 
> ```tsx
> // ✅ Correto
> <Text>{formatarMoeda(valor)}</Text>
> 
> // ❌ Incorreto - causa "R$ R$ 5.000,00"
> <Text>R$ {formatarMoeda(valor)}</Text>
> ```

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
