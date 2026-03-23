# 🛠 Guia do Desenvolvedor - Sistema de PDFs v2.0

> **Arquitetura:** Client-Side (100% Frontend)
> **Última Atualização:** 2026-01-14

---

## 📋 Índice

1. [Setup Inicial](#setup-inicial)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Tutorial: Adicionar Novo Tipo de PDF](#tutorial-adicionar-novo-tipo-de-pdf)
4. [Customizar Templates Existentes](#customizar-templates-existentes)
5. [Componentes Compartilhados](#componentes-compartilhados)
6. [Sistema de Estilos](#sistema-de-estilos)
7. [Upload e Storage](#upload-e-storage)
8. [Debugging](#debugging)
9. [Boas Práticas](#boas-práticas)

---

## Setup Inicial

### Dependências

O sistema usa `@react-pdf/renderer` que já está instalado:

```json
{
  "dependencies": {
    "@react-pdf/renderer": "^3.x"
  }
}
```

### Verificar Instalação

```bash
npm run dev
# Navegar para /configuracoes/teste-pdf
# Testar geração de qualquer tipo de PDF
```

---

## Estrutura do Projeto

```
src/lib/
├── hooks/
│   └── use-pdf-generation.tsx     # 🎯 Hook principal
│
├── pdf/
│   ├── pdf-uploader.ts            # Upload para Storage
│   ├── shared-styles.ts           # 🎨 Design system
│   ├── assets.ts                  # Imagens Base64
│   │
│   ├── components/                # Componentes visuais
│   │   ├── index.ts               # Re-exports
│   │   ├── shared-header.tsx      # Cabeçalho padrão
│   │   ├── shared-footer.tsx      # Rodapé com paginação
│   │   └── table-components.tsx   # Tabelas
│   │
│   ├── templates/                 # Templates PDF
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
│       └── pdf-formatter.ts       # Formatadores
│
└── types.ts                       # PDFType, interfaces
```

---

## Tutorial: Adicionar Novo Tipo de PDF

### Passo 1: Criar Interface de Dados

Em `src/lib/types.ts` ou no próprio template:

```typescript
// src/lib/pdf/templates/meu-relatorio-template.tsx

export interface MeuRelatorioData {
  // Obrigatórios
  codigoOS: string;
  titulo: string;
  conteudo: string;
  
  // Opcionais
  dataEmissao?: string;
  autor?: string;
  observacoes?: string;
}
```

### Passo 2: Criar o Template

```tsx
// src/lib/pdf/templates/meu-relatorio-template.tsx

import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors, fonts, fontSize, spacing, commonStyles } from '../shared-styles';
import { SharedHeader, SharedFooter } from '../components';

export interface MeuRelatorioData {
  codigoOS: string;
  titulo: string;
  conteudo: string;
  dataEmissao?: string;
  autor?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: spacing.xl,
    fontFamily: fonts.regular,
    fontSize: fontSize.base,
  },
  body: {
    flex: 1,
    marginTop: spacing.lg,
  },
  titulo: {
    fontSize: fontSize['2xl'],
    fontFamily: fonts.bold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  conteudo: {
    fontSize: fontSize.base,
    lineHeight: 1.5,
    color: colors.neutral700,
  },
});

export default function MeuRelatorioTemplate({ data }: { data: MeuRelatorioData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <SharedHeader 
          codigoOS={data.codigoOS} 
          documentTitle="MEU RELATÓRIO" 
          documentSubtitle={data.titulo}
          documentDate={data.dataEmissao}
        />
        
        <View style={styles.body}>
          <Text style={styles.titulo}>{data.titulo}</Text>
          <Text style={styles.conteudo}>{data.conteudo}</Text>
        </View>
        
        <SharedFooter />
      </Page>
    </Document>
  );
}
```

### Passo 3: Registrar no Hook

Edite `src/lib/hooks/use-pdf-generation.tsx`:

```tsx
// 1. Adicionar import
import MeuRelatorioTemplate from '@/lib/pdf/templates/meu-relatorio-template';

// 2. Adicionar case no switch (dentro da função generate)
switch (tipo) {
  // ... casos existentes ...
  
  case 'meu-relatorio':
    DocumentComponent = <MeuRelatorioTemplate data={dados} />;
    break;
    
  default:
    throw new Error(`Tipo de PDF não suportado: ${tipo}`);
}
```

### Passo 4: Atualizar Tipos

Edite `src/lib/types.ts`:

```typescript
export type PDFType =
  | 'proposta'
  | 'contrato'
  | 'memorial'
  | 'documento-sst'
  | 'parecer-reforma'
  | 'visita-tecnica'
  | 'proposta-ass-anual'
  | 'proposta-ass-pontual'
  | 'meu-relatorio'; // ← Adicionar aqui
```

### Passo 5: Testar

Adicione um botão de teste em `/configuracoes/teste-pdf` ou use diretamente:

```tsx
const { generate } = usePDFGeneration();

const result = await generate('meu-relatorio', osId, {
  codigoOS: 'OS0100001',
  titulo: 'Relatório de Teste',
  conteudo: 'Este é o conteúdo do relatório...',
});
```

---

## Customizar Templates Existentes

### Modificar Layout

1. Abra o template em `src/lib/pdf/templates/`
2. Use `StyleSheet.create()` para novos estilos
3. Use primitivos do React PDF: `<View>`, `<Text>`, `<Image>`

### Adicionar Nova Seção

```tsx
// Dentro do template
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Nova Seção</Text>
  <Text style={styles.sectionContent}>{data.novosCampos}</Text>
</View>
```

### Adicionar Condicional

```tsx
{data.mostrarExtra && (
  <View style={styles.extra}>
    <Text>{data.textoExtra}</Text>
  </View>
)}
```

---

## Componentes Compartilhados

### SharedHeader

```tsx
import { SharedHeader } from '../components';

<SharedHeader 
  codigoOS="OS0100001"
  documentTitle="PROPOSTA COMERCIAL"
  documentSubtitle="Serviços de Engenharia"
  documentDate="2026-01-14"
/>
```

**Props:**
- `codigoOS` (required): Código da OS
- `documentTitle` (required): Título do documento
- `documentSubtitle` (optional): Subtítulo
- `documentDate` (optional): Data de emissão

### SharedFooter

```tsx
import { SharedFooter } from '../components';

<SharedFooter />
```

Renderiza automaticamente:
- Número da página
- Dados da empresa (Minerva)
- Contatos

### TableComponents

```tsx
import { 
  Table, 
  TableHeaderRow, 
  TableHeaderCell, 
  TableRow, 
  TableCell,
  CategoryRow,
  SummaryRow
} from '../components';

<Table>
  <TableHeaderRow>
    <TableHeaderCell flexValue={3}>Descrição</TableHeaderCell>
    <TableHeaderCell flexValue={1}>Valor</TableHeaderCell>
  </TableHeaderRow>
  
  <CategoryRow>Categoria 1</CategoryRow>
  
  <TableRow>
    <TableCell flexValue={3}>Item 1</TableCell>
    <TableCell flexValue={1}>R$ 1.000,00</TableCell>
  </TableRow>
  
  <SummaryRow label="Total" value="R$ 1.000,00" />
</Table>
```

---

## Sistema de Estilos

### Cores (shared-styles.ts)

```typescript
import { colors } from '../shared-styles';

// Primary (Gold Minerva)
colors.primary      // #D3AF37
colors.primaryDark  // #B8941E
colors.primaryLight // #E6C866

// Neutrals
colors.neutral50  // #FAFAFA
colors.neutral100 // #F5F5F5
colors.neutral700 // #404040
colors.neutral900 // #171717

// Semantic
colors.success // #10B981
colors.warning // #F59E0B
colors.error   // #EF4444
colors.info    // #3B82F6

// Table
colors.tableHeaderBg   // #3B82F6
colors.tableHeaderText // #FFFFFF
```

### Fontes

```typescript
import { fonts } from '../shared-styles';

fonts.regular    // 'Helvetica'
fonts.bold       // 'Helvetica-Bold'
fonts.italic     // 'Helvetica-Oblique'
fonts.boldItalic // 'Helvetica-BoldOblique'
```

### Tamanhos de Fonte

```typescript
import { fontSize } from '../shared-styles';

fontSize.xs   // 8
fontSize.sm   // 9
fontSize.base // 10
fontSize.lg   // 11
fontSize.xl   // 12
fontSize['2xl'] // 14
fontSize['3xl'] // 16
fontSize['4xl'] // 18
fontSize['5xl'] // 20
```

### Espaçamentos

```typescript
import { spacing } from '../shared-styles';

spacing.xs   // 4
spacing.sm   // 8
spacing.md   // 12
spacing.lg   // 16
spacing.xl   // 24
spacing['2xl'] // 32
spacing['3xl'] // 48
spacing['4xl'] // 64
```

### Estilos Comuns

```typescript
import { commonStyles } from '../shared-styles';

commonStyles.page       // padding, font padrão
commonStyles.header     // estilo do cabeçalho
commonStyles.footer     // estilo do rodapé
commonStyles.section    // seção genérica
commonStyles.sectionTitle // título de seção
```

---

## Upload e Storage

### Como Funciona

1. Template é renderizado para Blob via `pdf(Component).toBlob()`
2. Blob é enviado para Supabase Storage via `uploadPDFToStorage()`
3. Signed URL (1 hora) é retornada

### Estrutura no Storage

```
uploads/
└── os/
    └── {osId}/
        └── documentos/
            └── {tipo}/
                └── {tipo}_{timestamp}.pdf
```

### pdf-uploader.ts

```typescript
import { uploadPDFToStorage } from '@/lib/pdf/pdf-uploader';

// Usado internamente pelo hook
const result = await uploadPDFToStorage(blob, tipo, osId);
// result = { publicUrl, path }
```

---

## Debugging

### Console Logs

O hook já inclui logs:

```typescript
logger.log(`[PDF Generation] Starting generation for ${tipo}`);
logger.log('[PDF Generation] PDF rendered successfully');
logger.log('[PDF Generation] Success:', result.path);
```

### Verificar Erros de Renderização

Se o PDF gerar em branco:

1. Verifique valores `undefined` dentro de `<Text>`
2. Use fallback: `{valor || ''}`
3. Verifique se imagens estão em Base64

### Verificar Upload

```bash
# Ver Storage no Supabase Dashboard
# Storage > Bucket: uploads > os/{osId}/documentos/
```

### Página de Testes

```
/configuracoes/teste-pdf
```

Permite testar todos os 8 tipos de PDF com dados de exemplo.

---

## Boas Práticas

### 1. Sempre Use Fallback

```tsx
// ❌ Ruim - pode quebrar se undefined
<Text>{data.nome}</Text>

// ✅ Bom - seguro
<Text>{data.nome || 'N/A'}</Text>
```

### 2. Reutilize Componentes

```tsx
// ❌ Ruim - duplicação
<View style={{ flexDirection: 'row', backgroundColor: '#3B82F6' }}>
  <Text style={{ color: '#fff' }}>Coluna 1</Text>
</View>

// ✅ Bom - reutilize
import { TableHeaderRow, TableHeaderCell } from '../components';

<TableHeaderRow>
  <TableHeaderCell>Coluna 1</TableHeaderCell>
</TableHeaderRow>
```

### 3. Use Design System

```tsx
// ❌ Ruim - cores hardcoded
<Text style={{ color: '#D3AF37' }}>Título</Text>

// ✅ Bom - use design system
import { colors } from '../shared-styles';
<Text style={{ color: colors.primary }}>Título</Text>
```

### 4. Tipagem Forte

```tsx
// ❌ Ruim - any
function Template({ data }: { data: any }) { ... }

// ✅ Bom - interface tipada
interface MeuTemplateData {
  codigoOS: string;
  titulo: string;
}
function Template({ data }: { data: MeuTemplateData }) { ... }
```

### 5. Teste Antes de Integrar

Use a página `/configuracoes/teste-pdf` antes de integrar em produção.

---

## Referências

- [MCP_PDF_SYSTEM.md](./MCP_PDF_SYSTEM.md) - Índice completo
- [API_REFERENCE.md](./API_REFERENCE.md) - Referência do hook
- [TEMPLATES.md](./TEMPLATES.md) - Guia de templates
- [@react-pdf/renderer Docs](https://react-pdf.org/)
