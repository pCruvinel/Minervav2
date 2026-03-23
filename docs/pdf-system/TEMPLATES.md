# 🎨 Guia de Templates PDF - MinervaV2 v2.0

> **Engine:** @react-pdf/renderer v3.x
> **Última Atualização:** 2026-01-14

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Templates Disponíveis](#templates-disponíveis)
3. [Anatomia de um Template](#anatomia-de-um-template)
4. [Primitivos React PDF](#primitivos-react-pdf)
5. [Sistema de Estilos](#sistema-de-estilos)
6. [Componentes Compartilhados](#componentes-compartilhados)
7. [Formatadores](#formatadores)
8. [Padrões Comuns](#padrões-comuns)
9. [Limitações e Workarounds](#limitações-e-workarounds)

---

## Visão Geral

Os templates são **componentes React puros** que utilizam primitivos especiais do `@react-pdf/renderer` para renderizar PDFs diretamente no navegador.

### Localização

```
src/lib/pdf/templates/
├── proposta-template.tsx       # 32KB - OS 1-4
├── contrato-template.tsx       # 11KB - Geral
├── memorial-template.tsx       # 3KB  - OS 1-4
├── documento-sst-template.tsx  # 8KB  - Geral
├── parecer-reforma-template.tsx # 9KB  - OS-07
├── visita-tecnica-template.tsx # 31KB - OS-08
├── proposta-ass-anual.tsx      # 23KB - OS-05
└── proposta-ass-pontual.tsx    # 25KB - OS-06
```

---

## Templates Disponíveis

### 1. Proposta Comercial (`proposta`)

**Arquivo:** `proposta-template.tsx`  
**OS:** 1-4 (Obras)  
**Tamanho:** ~32KB  

**Seções:**
- Cabeçalho com logo e código OS
- Dados do cliente
- Objetivo e escopo
- Cronograma de execução
- Memorial descritivo (itens e sub-itens)
- Investimentos (tabela detalhada)
- Condições de pagamento
- Garantias
- Rodapé com paginação

---

### 2. Contrato (`contrato`)

**Arquivo:** `contrato-template.tsx`  
**OS:** Geral  
**Tamanho:** ~11KB  

**Seções:**
- Identificação das partes (Contratante/Contratado)
- Objeto do contrato
- Cláusulas contratuais
- Valor e forma de pagamento
- Assinaturas

---

### 3. Memorial Descritivo (`memorial`)

**Arquivo:** `memorial-template.tsx`  
**OS:** 1-4  
**Tamanho:** ~3KB  

**Seções:**
- Cabeçalho
- Seções dinâmicas (título + conteúdo)
- Data e local

---

### 4. Documento SST (`documento-sst`)

**Arquivo:** `documento-sst-template.tsx`  
**OS:** Geral  
**Tamanho:** ~8KB  

**Seções:**
- Cabeçalho
- Tipo de documento
- Checklist de itens (Conforme/Não-conforme/N/A)
- Conclusão
- Responsável técnico

---

### 5. Parecer Reforma (`parecer-reforma`)

**Arquivo:** `parecer-reforma-template.tsx`  
**OS:** OS-07  
**Tamanho:** ~9KB  

**Seções:**
- Dados do imóvel
- Descrição da reforma
- Parecer técnico (Favorável/Condicionado/Desfavorável)
- Observações
- Assinatura do responsável

---

### 6. Visita Técnica (`visita-tecnica`)

**Arquivo:** `visita-tecnica-template.tsx`  
**OS:** OS-08  
**Tamanho:** ~31KB  

**Seções:**
- Cliente e solicitante
- Objetivo da visita
- Área vistoriada
- **Modo Parecer:** Manifestação patológica, gravidade, NBR
- **Modo Recebimento:** Checklist 27 itens (C/NC/NA)
- Fotos com legendas
- Responsável técnico

---

### 7. Proposta Assessoria Anual (`proposta-ass-anual`)

**Arquivo:** `proposta-ass-anual.tsx`  
**OS:** OS-05  
**Tamanho:** ~23KB  

**Seções:**
- Dados do cliente
- Escopo do contrato
- Metodologia
- SLA e horário de funcionamento
- Valor mensal
- Condições

---

### 8. Proposta Assessoria Pontual (`proposta-ass-pontual`)

**Arquivo:** `proposta-ass-pontual.tsx`  
**OS:** OS-06  
**Tamanho:** ~25KB  

**Seções:**
- Dados do cliente
- Escopo do serviço
- Prazo de execução
- Entregáveis
- Valor total
- Condições

---

## Anatomia de um Template

### Estrutura Básica

```tsx
// 1. Imports
import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors, fonts, fontSize, spacing, commonStyles } from '../shared-styles';
import { SharedHeader, SharedFooter } from '../components';

// 2. Interface de Dados
export interface MeuTemplateData {
  codigoOS: string;
  titulo: string;
  // ... campos específicos
}

// 3. Estilos Locais
const styles = StyleSheet.create({
  page: {
    padding: spacing.xl,
    fontFamily: fonts.regular,
    fontSize: fontSize.base,
  },
  section: {
    marginTop: spacing.lg,
  },
});

// 4. Componente Principal
export default function MeuTemplate({ data }: { data: MeuTemplateData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <SharedHeader 
          codigoOS={data.codigoOS} 
          documentTitle="MEU DOCUMENTO" 
        />
        
        {/* Corpo */}
        <View style={styles.section}>
          <Text>{data.titulo || ''}</Text>
        </View>
        
        {/* Rodapé */}
        <SharedFooter />
      </Page>
    </Document>
  );
}
```

---

## Primitivos React PDF

O `@react-pdf/renderer` usa componentes específicos (não HTML):

### Document e Page

```tsx
<Document>
  <Page size="A4" style={styles.page}>
    {/* Conteúdo */}
  </Page>
</Document>
```

**Props do Page:**
- `size`: 'A4' | 'LETTER' | { width, height }
- `orientation`: 'portrait' | 'landscape'
- `style`: objeto de estilos

### View (equivalente a div)

```tsx
<View style={{ flexDirection: 'row', marginBottom: 10 }}>
  <View style={{ flex: 1 }}>Coluna 1</View>
  <View style={{ flex: 1 }}>Coluna 2</View>
</View>
```

### Text

```tsx
<Text style={{ fontSize: 12, fontWeight: 'bold' }}>
  Texto aqui
</Text>
```

> ⚠️ **Importante:** Todo texto DEVE estar dentro de `<Text>`. Não pode haver texto solto.

### Image

```tsx
import { logoBase64 } from '../assets';

<Image 
  src={logoBase64} 
  style={{ width: 100, height: 50 }} 
/>
```

> ⚠️ URLs externas podem ter problemas de CORS. Prefira Base64.

### Link

```tsx
<Link src="https://minerva.com.br">
  Visite nosso site
</Link>
```

---

## Sistema de Estilos

### StyleSheet.create

```tsx
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

// Uso
<View style={styles.container}>
  <Text style={styles.title}>Título</Text>
</View>
```

### Combinando Estilos

```tsx
// Array de estilos (último sobrescreve)
<Text style={[styles.base, styles.bold, { color: 'red' }]}>
  Texto vermelho e negrito
</Text>
```

### Flexbox

React PDF usa modelo Flexbox semelhante ao React Native:

```tsx
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  column: {
    flex: 1,
    padding: 10,
  },
});

<View style={styles.row}>
  <View style={[styles.column, { backgroundColor: '#eee' }]}>
    <Text>Coluna 1</Text>
  </View>
  <View style={styles.column}>
    <Text>Coluna 2</Text>
  </View>
</View>
```

### Propriedades Suportadas

| Categoria | Propriedades |
|-----------|-------------|
| **Layout** | width, height, flex, flexDirection, justifyContent, alignItems |
| **Spacing** | margin, padding (e variantes) |
| **Border** | border, borderRadius, borderColor, borderWidth, borderStyle |
| **Background** | backgroundColor |
| **Text** | fontSize, fontFamily, fontWeight, color, textAlign, lineHeight |
| **Position** | position, top, left, right, bottom |

---

## Componentes Compartilhados

### SharedHeader

```tsx
import { SharedHeader } from '../components';

<SharedHeader 
  codigoOS="OS0100001"
  documentTitle="PROPOSTA COMERCIAL"
  documentSubtitle="Serviços de Engenharia"  // opcional
  documentDate="2026-01-14"                   // opcional
/>
```

### SharedFooter

```tsx
import { SharedFooter } from '../components';

<SharedFooter />

// Renderiza automaticamente:
// - Número da página (Página 1 de 3)
// - Dados da empresa Minerva
// - Contatos
```

### Table Components

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
  {/* Cabeçalho */}
  <TableHeaderRow>
    <TableHeaderCell flexValue={3}>Descrição</TableHeaderCell>
    <TableHeaderCell flexValue={1}>Qtd</TableHeaderCell>
    <TableHeaderCell flexValue={2}>Valor</TableHeaderCell>
  </TableHeaderRow>
  
  {/* Categoria */}
  <CategoryRow>CATEGORIA 1</CategoryRow>
  
  {/* Linhas de dados */}
  <TableRow>
    <TableCell flexValue={3}>Item A</TableCell>
    <TableCell flexValue={1}>2</TableCell>
    <TableCell flexValue={2}>R$ 1.000,00</TableCell>
  </TableRow>
  
  {/* Resumo/Total */}
  <SummaryRow label="TOTAL" value="R$ 1.000,00" />
</Table>
```

---

## Formatadores

Disponíveis em `src/lib/pdf/utils/pdf-formatter.ts`:

```typescript
import { 
  formatarMoeda, 
  formatarData, 
  formatarCPF, 
  formatarCNPJ,
  formatarTelefone,
  formatarCEP,
  capitalize
} from '../utils/pdf-formatter';
```

### Uso

```tsx
// Moeda
formatarMoeda(5000)           // "R$ 5.000,00"
formatarMoeda(5000.5)         // "R$ 5.000,50"

// Data
formatarData('2026-01-14')    // "14/01/2026"

// CPF
formatarCPF('12345678900')    // "123.456.789-00"

// CNPJ
formatarCNPJ('12345678000100') // "12.345.678/0001-00"

// Telefone
formatarTelefone('11999998888') // "(11) 99999-8888"

// CEP
formatarCEP('01310100')       // "01310-100"

// Capitalize
capitalize('são paulo')       // "São Paulo"
```

> ⚠️ **Importante:** `formatarMoeda()` já inclui "R$". Não adicione manualmente!

```tsx
// ✅ Correto
<Text>{formatarMoeda(valor)}</Text>

// ❌ Incorreto - resulta em "R$ R$ 5.000,00"
<Text>R$ {formatarMoeda(valor)}</Text>
```

---

## Padrões Comuns

### Seção com Título

```tsx
const SectionTitle = ({ children }) => (
  <View style={{ marginTop: 16, marginBottom: 8 }}>
    <Text style={{ 
      fontSize: 12, 
      fontFamily: 'Helvetica-Bold',
      color: colors.primary 
    }}>
      {children}
    </Text>
    <View style={{ 
      height: 1, 
      backgroundColor: colors.primary, 
      marginTop: 4 
    }} />
  </View>
);

// Uso
<SectionTitle>DADOS DO CLIENTE</SectionTitle>
```

### Linha de Dados (Label: Valor)

```tsx
const DataRow = ({ label, value }) => (
  <View style={{ flexDirection: 'row', marginBottom: 4 }}>
    <Text style={{ width: 120, fontFamily: 'Helvetica-Bold' }}>
      {label}:
    </Text>
    <Text style={{ flex: 1 }}>
      {value || '-'}
    </Text>
  </View>
);

// Uso
<DataRow label="Nome" value={data.cliente.nome} />
<DataRow label="CPF" value={formatarCPF(data.cliente.cpf)} />
```

### Badge/Status

```tsx
const StatusBadge = ({ status }) => {
  const bgColor = status === 'aprovado' ? colors.success : colors.warning;
  
  return (
    <View style={{ 
      backgroundColor: bgColor, 
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4 
    }}>
      <Text style={{ color: '#fff', fontSize: 8 }}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
};
```

### Quebra de Página

```tsx
<View break>
  {/* Este conteúdo inicia em nova página */}
</View>
```

### Evitar Quebra no Meio

```tsx
<View wrap={false}>
  {/* Este bloco não será dividido entre páginas */}
</View>
```

---

## Limitações e Workarounds

### 1. Sem Herança de Estilos (CSS Cascade)

Diferente do CSS web, estilos não são herdados:

```tsx
// ❌ Não funciona - filho não herda cor
<View style={{ color: 'red' }}>
  <Text>Não será vermelho</Text>
</View>

// ✅ Funciona - aplique direto no Text
<View>
  <Text style={{ color: 'red' }}>Será vermelho</Text>
</View>
```

### 2. Todas as Strings Devem Estar em `<Text>`

```tsx
// ❌ Erro - texto solto
<View>
  Olá mundo
</View>

// ✅ Correto
<View>
  <Text>Olá mundo</Text>
</View>
```

### 3. Valores Undefined Quebram Renderização

```tsx
// ❌ Pode quebrar se data.nome for undefined
<Text>{data.nome}</Text>

// ✅ Use fallback
<Text>{data.nome || ''}</Text>
<Text>{data.nome ?? 'N/A'}</Text>
```

### 4. Imagens Externas Podem Falhar (CORS)

```tsx
// ❌ Pode falhar
<Image src="https://example.com/logo.png" />

// ✅ Use Base64
import { logoBase64 } from '../assets';
<Image src={logoBase64} />
```

### 5. Fontes Limitadas

Fontes padrão disponíveis:
- Helvetica (Regular, Bold, Oblique, BoldOblique)
- Times-Roman (Regular, Bold, Italic, BoldItalic)
- Courier (Regular, Bold, Oblique, BoldOblique)

Para fontes customizadas, registre com `Font.register()`.

### 6. Sem Suporte a Flexbox Gap

```tsx
// ❌ Não suportado
<View style={{ gap: 10 }}>

// ✅ Use margin
<View>
  <View style={{ marginBottom: 10 }}>Item 1</View>
  <View style={{ marginBottom: 10 }}>Item 2</View>
</View>
```

---

## Referências

- [MCP_PDF_SYSTEM.md](./MCP_PDF_SYSTEM.md) - Índice completo
- [GUIA_DESENVOLVEDOR.md](./GUIA_DESENVOLVEDOR.md) - Tutorial prático
- [@react-pdf/renderer Docs](https://react-pdf.org/)
- [API Reference](./API_REFERENCE.md) - Referência do hook
