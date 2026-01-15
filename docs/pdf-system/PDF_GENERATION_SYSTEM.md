# Sistema de Geração de PDFs - Documentação Técnica v2.0

> **Última Atualização:** 2026-01-14  
> **Arquitetura:** Client-Side (100% Frontend)  
> **Engine:** `@react-pdf/renderer` v3.x  
> **Project ID:** `zxfevlkssljndqqhxkjb`

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Tipos de PDF Disponíveis](#tipos-de-pdf-disponíveis)
4. [Estrutura de Diretórios](#estrutura-de-diretórios)
5. [Hook: usePDFGeneration](#hook-usepdfgeneration)
6. [Templates e Design System](#templates-e-design-system)
7. [Fluxo de Dados](#fluxo-de-dados)
8. [Armazenamento (Storage)](#armazenamento-storage)
9. [Como Adicionar Novo Tipo de PDF](#como-adicionar-novo-tipo-de-pdf)
10. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O sistema MinervaV2 gera documentos PDF utilizando uma arquitetura **100% Client-Side**. Os PDFs são renderizados diretamente no navegador do usuário utilizando `@react-pdf/renderer`, resultando em:

- ✅ **Zero custos de servidor** - processamento no browser
- ✅ **Melhor performance** - sem latência de rede para gerar
- ✅ **Desenvolvimento simples** - sem deploy de funções separadas
- ✅ **Consistência** - PDF reflete exatamente o que o usuário vê

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
        Hook -->|Seleciona| Template[Template React .tsx]
        Template -->|Renderiza| Engine[@react-pdf/renderer]
        Engine -->|Gera| Blob[Blob Binário PDF]
        
        Hook -->|Blob| Uploader[pdf-uploader.ts]
    end
    
    subgraph Supabase
        Uploader -->|Upload| Storage[Bucket 'uploads']
        Uploader -->|Generate| SignedURL[Signed URL]
    end
    
    Uploader -->|Retorna| Result[URL Assinada + Metadados]
    Result -->|Exibe| Preview[Download/Preview]
```

---

## Tipos de PDF Disponíveis

| `PDFType` | Template | Contexto de Uso | Descrição |
| :--- | :--- | :--- | :--- |
| `proposta` | `proposta-template.tsx` | OS 1-4 (Obras) | Proposta completa com memorial, cronograma e financeiro |
| `contrato` | `contrato-template.tsx` | Geral | Minuta de contrato de prestação de serviços |
| `memorial` | `memorial-template.tsx` | OS 1-4 | Documento técnico detalhando execução (sem valores) |
| `documento-sst` | `documento-sst-template.tsx` | Geral | Documentação de Saúde e Segurança |
| `parecer-reforma` | `parecer-reforma-template.tsx` | OS-07 | Parecer técnico específico para reformas |
| `visita-tecnica` | `visita-tecnica-template.tsx` | OS-08 | Relatório de vistoria e visita técnica |
| `proposta-ass-anual` | `proposta-ass-anual.tsx` | OS-05 | Proposta estruturada para contratos recorrentes |
| `proposta-ass-pontual` | `proposta-ass-pontual.tsx` | OS-06 | Proposta ou laudo para serviços pontuais |

---

## Estrutura de Diretórios

```
src/
└── lib/
    ├── hooks/
    │   └── use-pdf-generation.tsx      # ⭐ Hook principal (Orquestrador)
    │
    ├── pdf/
    │   ├── pdf-uploader.ts             # Upload e Signed URLs
    │   ├── shared-styles.ts            # Estilos globais (cores, fontes)
    │   ├── assets.ts                   # Logos e imagens em Base64
    │   │
    │   ├── components/                 # Componentes visuais compartilhados
    │   │   ├── index.ts                # Re-exports
    │   │   ├── shared-header.tsx       # Cabeçalho padrão
    │   │   ├── shared-footer.tsx       # Rodapé padrão
    │   │   └── table-components.tsx    # Tabelas reutilizáveis
    │   │
    │   ├── templates/                  # Templates de Documentos
    │   │   ├── proposta-template.tsx
    │   │   ├── contrato-template.tsx
    │   │   ├── memorial-template.tsx
    │   │   ├── documento-sst-template.tsx
    │   │   ├── parecer-reforma-template.tsx
    │   │   ├── visita-tecnica-template.tsx
    │   │   ├── proposta-ass-anual.tsx
    │   │   └── proposta-ass-pontual.tsx
    │   │
    │   └── utils/
    │       └── pdf-formatter.ts        # Formatadores (Moeda, Data, CPF)
    │
    └── types.ts                        # PDFType, interfaces
```

---

## Hook: usePDFGeneration

Este é o **ponto de entrada único** para geração de documentos.

**Localização:** `src/lib/hooks/use-pdf-generation.tsx`

### Assinatura

```typescript
function usePDFGeneration(): {
  generating: boolean;
  error: Error | null;
  generate: (tipo: PDFType, osId: string, dados: any) => Promise<PDFGenerationResponse | null>;
  reset: () => void;
}
```

### Exemplo de Uso

```typescript
const { generating, generate, error } = usePDFGeneration();

const handleGenerate = async () => {
  const result = await generate('proposta', osId, dadosDoTemplate);
  
  if (result?.success) {
    console.log('PDF URL:', result.url); // URL Assinada pronta para uso
    console.log('Path:', result.path);   // Caminho no Storage
  }
};
```

### Retorno (`PDFGenerationResponse`)

```typescript
{
  success: boolean;
  url?: string;        // URL assinada temporária (1h) para visualização
  path?: string;       // Caminho persistente no Storage
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

Os templates são componentes React puros que utilizam primitivos do `@react-pdf/renderer`:
- `<Document>`, `<Page>`, `<View>`, `<Text>`, `<Image>`

### Estilização

Arquivo central de estilos: `src/lib/pdf/shared-styles.ts`

```typescript
import { colors, fonts, commonStyles } from '../shared-styles';

// Exemplo de uso em template
<Text style={[commonStyles.sectionTitle, { color: colors.primary }]}>
  Orçamento
</Text>
```

### Componentes Compartilhados

| Componente | Descrição |
| :--- | :--- |
| `SharedHeader` | Cabeçalho com logo, código OS, título e data |
| `SharedFooter` | Rodapé com paginação e contatos |
| `Table` | Container de tabela flex |
| `TableHeaderCell` | Célula de cabeçalho |
| `TableCell` | Célula de dados |

---

## Fluxo de Dados

A versão v2 **recebe os dados prontos do Frontend** (diferente da v1 que buscava do banco):

1. **Componente Pai** (ex: `StepGerarProposta`): Coleta dados de todos os steps anteriores
2. **Normalização**: Organiza dados no formato esperado pelo Template
3. **Geração**: Passa objeto normalizado para `generate()`
4. **Upload**: PDF é enviado para Supabase Storage
5. **Retorno**: URL assinada é retornada para visualização

**Vantagem:** O PDF reflete exatamente o que o usuário vê na tela.

---

## Armazenamento (Storage)

### Bucket

- **Nome:** `uploads` (privado/autenticado)
- **Caminho:** `os/{osId}/documentos/{tipo}/{filename}`

### Upload e URLs

A lógica de upload está em `src/lib/pdf/pdf-uploader.ts`:

1. **Upload:** Envia Blob para Supabase Storage
2. **Assinatura:** Gera Signed URL (validade 1 hora)
3. **Retorno:** URL assinada para visualização imediata

---

## Como Adicionar Novo Tipo de PDF

### 1. Criar Template

```tsx
// src/lib/pdf/templates/novo-tipo-template.tsx
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { SharedHeader, SharedFooter } from '../components';

export interface NovoTipoData {
  codigoOS: string;
  // ... outros campos
}

export default function NovoTipoTemplate({ data }: { data: NovoTipoData }) {
  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <SharedHeader codigoOS={data.codigoOS} documentTitle="NOVO DOCUMENTO" />
        {/* Conteúdo */}
        <SharedFooter />
      </Page>
    </Document>
  );
}
```

### 2. Registrar no Hook

```typescript
// src/lib/hooks/use-pdf-generation.tsx

import NovoTipoTemplate from '@/lib/pdf/templates/novo-tipo-template';

// Adicionar case no switch
case 'novo-tipo':
  DocumentComponent = <NovoTipoTemplate data={dados} />;
  break;
```

### 3. Atualizar Tipos

```typescript
// src/lib/types.ts
export type PDFType =
  | 'proposta'
  | /* ... */
  | 'novo-tipo';
```

---

## Troubleshooting

### Erro: "ReferenceError: window is not defined"

- **Causa:** Tentativa de renderizar PDF no Server Component
- **Solução:** Use `usePDFGeneration` apenas em componentes com `"use client"`

### Erro: Estilos não aplicados

- **Causa:** React PDF não suporta herança de estilos CSS
- **Solução:** Passe estilos explicitamente via `style={[style1, style2]}`

### Imagens quebradas

- **Causa:** URLs de imagem externas com bloqueio de CORS
- **Solução:** Use imagens em Base64 de `assets.ts`

### PDF em branco

- **Causa:** Elemento `undefined` ou `null` dentro de `<Text>`
- **Solução:** Use fallback: `{valor || ''}`

### Upload falha

- **Causa:** Bucket não existe ou RLS bloqueando
- **Solução:** Verificar bucket `uploads` e policies no Supabase

---

## Documentação Relacionada

- [MCP_PDF_SYSTEM.md](./MCP_PDF_SYSTEM.md) - Índice completo para IAs
- [API_REFERENCE.md](./API_REFERENCE.md) - Referência do hook
- [GUIA_DESENVOLVEDOR.md](./GUIA_DESENVOLVEDOR.md) - Tutorial prático
- [TEMPLATES.md](./TEMPLATES.md) - Guia de templates
- [ARQUITETURA.md](./ARQUITETURA.md) - Decisões de design

---

## Referências

- [Documentação @react-pdf/renderer](https://react-pdf.org/)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [CONSTITUICAO.md](file:///c:/Users/Usuario/OneDrive/Documentos/claude/Minervav2/CONSTITUICAO.md) - Regras do projeto
