# 🎨 Guia de Templates - Sistema de Geração de PDFs

## Índice

1. [Anatomia de um Template](#anatomia-de-um-template)
2. [Componentes @react-pdf/renderer](#componentes-react-pdfrenderer)
3. [Sistema de Estilos](#sistema-de-estilos)
4. [Formatação de Dados](#formatação-de-dados)
5. [Boas Práticas](#boas-práticas)
6. [Exemplos Práticos](#exemplos-práticos)

---

## Anatomia de um Template

Todo template React PDF segue esta estrutura básica:

```tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, fonts, commonStyles } from './shared-styles.ts';

// 1. Interface de Props
interface MeuTemplateProps {
  data: MeuTipoData;
}

// 2. Estilos do Template
const styles = StyleSheet.create({
  page: commonStyles.page,
  header: commonStyles.header,
  // Estilos específicos do template...
});

// 3. Componente Template
export function MeuTemplate({ data }: MeuTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Conteúdo do PDF */}
      </Page>
    </Document>
  );
}
```

### Estrutura Típica de um PDF

```
┌───────────────────────────────┐
│        HEADER                  │  Logo, Título, Subtítulo
│  [Logo]  TÍTULO                │
│          Subtítulo             │
├───────────────────────────────┤
│                               │
│   SEÇÃO 1: Informações Gerais │
│   ┌─────────────────────────┐ │
│   │ Campo: Valor            │ │
│   │ Campo: Valor            │ │
│   └─────────────────────────┘ │
│                               │
│   SEÇÃO 2: Tabela de Itens    │
│   ┌─────────────────────────┐ │
│   │ Item | Qtd | Valor      │ │
│   │ Item 1 | 2  | R$ 100    │ │
│   │ Item 2 | 1  | R$ 50     │ │
│   └─────────────────────────┘ │
│                               │
│   SEÇÃO 3: Totais             │
│   Subtotal: R$ 150,00         │
│   Total:    R$ 150,00         │
│                               │
├───────────────────────────────┤
│        FOOTER                  │  Data, Assinatura
│   Gerado em: 15/01/2025       │
└───────────────────────────────┘
```

---

## Componentes @react-pdf/renderer

### Componentes Básicos

#### 1. Document

Container raiz de todo PDF.

```tsx
import { Document } from '@react-pdf/renderer';

<Document>
  {/* Pages aqui */}
</Document>
```

**Props:**
- `title`: Título do documento (metadata)
- `author`: Autor (metadata)
- `subject`: Assunto (metadata)

#### 2. Page

Representa uma página do PDF.

```tsx
import { Page } from '@react-pdf/renderer';

<Page size="A4" style={styles.page}>
  {/* Conteúdo da página */}
</Page>
```

**Props:**
- `size`: `'A4'` | `'LETTER'` | `[width, height]`
- `orientation`: `'portrait'` (padrão) | `'landscape'`
- `style`: Estilos da página

**Tamanhos comuns:**
- A4: 210mm x 297mm (595pt x 842pt)
- Letter: 8.5" x 11" (612pt x 792pt)

#### 3. View

Container genérico (como `<div>` no HTML).

```tsx
import { View } from '@react-pdf/renderer';

<View style={styles.section}>
  {/* Outros componentes */}
</View>
```

**Props:**
- `style`: Estilos (flexbox, padding, margin, etc.)
- `wrap`: `boolean` - Permite quebra de página (padrão: true)
- `break`: `boolean` - Força quebra de página

#### 4. Text

Renderiza texto (como `<span>` no HTML).

```tsx
import { Text } from '@react-pdf/renderer';

<Text style={styles.title}>Meu Título</Text>
```

**Props:**
- `style`: Estilos de texto (fontSize, fontWeight, color, etc.)
- `wrap`: `boolean` - Permite quebra de linha
- `orphanControl`: `boolean` - Evita linhas órfãs

**Importante:** Todo texto deve estar dentro de um `<Text>`.

#### 5. Image

Renderiza imagens.

```tsx
import { Image } from '@react-pdf/renderer';

<Image
  src="https://example.com/logo.png"
  style={{ width: 100, height: 50 }}
/>
```

**Props:**
- `src`: URL da imagem (http/https) ou base64
- `style`: Estilos (width, height, object-fit)

**Formatos suportados**: PNG, JPG, SVG

#### 6. Link

Cria links clicáveis.

```tsx
import { Link } from '@react-pdf/renderer';

<Link src="https://minerva.com.br" style={styles.link}>
  Visite nosso site
</Link>
```

---

### Layout com Flexbox

@react-pdf/renderer usa **Flexbox** para layout (similar ao React Native).

```tsx
// Container horizontal
<View style={{ flexDirection: 'row' }}>
  <View style={{ flex: 1 }}>Coluna 1</View>
  <View style={{ flex: 1 }}>Coluna 2</View>
</View>

// Container vertical (padrão)
<View style={{ flexDirection: 'column' }}>
  <View>Linha 1</View>
  <View>Linha 2</View>
</View>
```

**Propriedades Flexbox:**
- `flexDirection`: `'row'` | `'column'` (padrão)
- `justifyContent`: `'flex-start'` | `'center'` | `'flex-end'` | `'space-between'` | `'space-around'`
- `alignItems`: `'flex-start'` | `'center'` | `'flex-end'` | `'stretch'`
- `flex`: número (peso relativo)

---

## Sistema de Estilos

### Shared Styles

Todos os templates compartilham estilos comuns definidos em `shared-styles.ts`:

```typescript
// shared-styles.ts

export const colors = {
  // Brand
  primary: '#FF6B35',
  primaryDark: '#E85D25',

  // Neutrals
  neutral50: '#FAFAFA',
  neutral100: '#F5F5F5',
  neutral200: '#E5E5E5',
  neutral300: '#D4D4D4',
  neutral400: '#A3A3A3',
  neutral500: '#737373',
  neutral600: '#525252',
  neutral700: '#404040',
  neutral800: '#262626',
  neutral900: '#171717',

  // States
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Base
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fonts = {
  family: {
    sans: 'Helvetica',
    serif: 'Times-Roman',
    mono: 'Courier',
  },
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  weight: {
    normal: 'normal' as const,
    bold: 'bold' as const,
  },
};

export const commonStyles = {
  page: {
    flexDirection: 'column' as const,
    backgroundColor: colors.white,
    padding: spacing.lg,
    fontSize: fonts.size.md,
    fontFamily: fonts.family.sans,
  },
  header: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.neutral50,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  section: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral50,
    borderRadius: 4,
  },
  // ... mais estilos comuns
};
```

### Criando Estilos Customizados

```tsx
import { StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, fonts } from './shared-styles.ts';

const styles = StyleSheet.create({
  // Reutilizar estilo comum
  page: commonStyles.page,

  // Estilo customizado
  customSection: {
    ...commonStyles.section,  // Herdar estilo comum
    backgroundColor: colors.info,  // Sobrescrever propriedade
    borderLeft: `4px solid ${colors.primary}`,  // Adicionar nova propriedade
  },

  // Estilo completamente novo
  badge: {
    padding: spacing.xs,
    backgroundColor: colors.success,
    borderRadius: 4,
    color: colors.white,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.bold,
  },
});
```

### Estilos Inline vs StyleSheet

**Recomendado (StyleSheet):**
```tsx
const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold' }
});

<Text style={styles.title}>Título</Text>
```

**Evitar (Inline):**
```tsx
<Text style={{ fontSize: 20, fontWeight: 'bold' }}>Título</Text>
```

**Por quê?**
- StyleSheet é otimizado internamente
- Evita recriação de objetos em cada render
- Melhor performance

---

## Formatação de Dados

Utilitários de formatação estão em `utils/pdf-formatter.ts`:

### 1. Formatação de Moeda

```typescript
import { formatarMoeda } from '../utils/pdf-formatter.ts';

const valorFormatado = formatarMoeda(15000);
// "R$ 15.000,00"

// No template
<Text>Valor: {formatarMoeda(data.valorProposta)}</Text>
```

### 2. Formatação de Data

```typescript
import { formatarData } from '../utils/pdf-formatter.ts';

const dataFormatada = formatarData(new Date());
// "15/01/2025"

const dataHoraFormatada = formatarData(new Date(), true);
// "15/01/2025 10:30"

// No template
<Text>Data: {formatarData(data.dataEmissao)}</Text>
```

### 3. Formatação de CPF/CNPJ

```typescript
import { formatarCPF, formatarCNPJ } from '../utils/pdf-formatter.ts';

const cpfFormatado = formatarCPF('11144477735');
// "111.444.777-35"

const cnpjFormatado = formatarCNPJ('12345678000199');
// "12.345.678/0001-99"

// No template (detecção automática)
<Text>
  CPF/CNPJ: {
    data.cpfCnpj.length === 11
      ? formatarCPF(data.cpfCnpj)
      : formatarCNPJ(data.cpfCnpj)
  }
</Text>
```

### 4. Formatação de Telefone

```typescript
import { formatarTelefone } from '../utils/pdf-formatter.ts';

const telefoneFormatado = formatarTelefone('11987654321');
// "(11) 98765-4321"

// No template
<Text>Tel: {formatarTelefone(data.telefone)}</Text>
```

---

## Boas Práticas

### 1. Estruture o Template em Componentes

**Evitar:**
```tsx
export function MeuTemplate({ data }) {
  return (
    <Document>
      <Page>
        {/* 500 linhas de código aqui... */}
      </Page>
    </Document>
  );
}
```

**Recomendado:**
```tsx
// Componentes auxiliares
function Header({ titulo }: { titulo: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{titulo}</Text>
    </View>
  );
}

function TabelaItens({ itens }: { itens: Item[] }) {
  return (
    <View style={styles.tabela}>
      {itens.map((item, i) => (
        <View key={i} style={styles.tabelaRow}>
          <Text>{item.descricao}</Text>
          <Text>{formatarMoeda(item.valor)}</Text>
        </View>
      ))}
    </View>
  );
}

// Template principal
export function MeuTemplate({ data }) {
  return (
    <Document>
      <Page style={styles.page}>
        <Header titulo={data.titulo} />
        <TabelaItens itens={data.itens} />
      </Page>
    </Document>
  );
}
```

### 2. Use Conditional Rendering

```tsx
// Mostrar seção apenas se houver dados
{data.observacoes && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Observações</Text>
    <Text>{data.observacoes}</Text>
  </View>
)}

// Mostrar badge baseado em condição
<View style={[
  styles.badge,
  data.status === 'aprovado' ? styles.badgeSuccess : styles.badgeError
]}>
  <Text>{data.status.toUpperCase()}</Text>
</View>
```

### 3. Evite Lógica Complexa no Template

**Evitar:**
```tsx
<Text>
  {data.itens.reduce((acc, item) =>
    acc + item.quantidade * item.valorUnitario, 0
  ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
</Text>
```

**Recomendado:**
```tsx
// No handler, antes de renderizar:
const dadosProcessados = {
  ...dados,
  valorTotal: calcularTotal(dados.itens),
  valorTotalFormatado: formatarMoeda(calcularTotal(dados.itens))
};

// No template:
<Text>{dadosProcessados.valorTotalFormatado}</Text>
```

### 4. Mantenha Consistência de Espaçamento

```tsx
// Use valores de spacing.* sempre
<View style={{ marginBottom: spacing.md }}>  // ✅
<View style={{ marginBottom: 16 }}>          // ❌

// Use cores de colors.* sempre
<Text style={{ color: colors.primary }}>    // ✅
<Text style={{ color: '#FF6B35' }}>         // ❌
```

### 5. Teste com Dados Reais

```tsx
// Adicionar validações defensivas
<Text>
  Cliente: {data.clienteNome || 'Nome não informado'}
</Text>

<Text>
  Total: {formatarMoeda(data.valorTotal ?? 0)}
</Text>
```

---

## Exemplos Práticos

### Exemplo 1: Tabela Simples

```tsx
function TabelaSimples({ itens }: { itens: Item[] }) {
  return (
    <View>
      {/* Cabeçalho */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.primary,
        padding: spacing.sm,
        fontWeight: 'bold',
        color: colors.white
      }}>
        <Text style={{ flex: 2 }}>Item</Text>
        <Text style={{ flex: 1, textAlign: 'right' }}>Qtd</Text>
        <Text style={{ flex: 1, textAlign: 'right' }}>Valor</Text>
      </View>

      {/* Linhas */}
      {itens.map((item, index) => (
        <View key={index} style={{
          flexDirection: 'row',
          padding: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.neutral200
        }}>
          <Text style={{ flex: 2 }}>{item.descricao}</Text>
          <Text style={{ flex: 1, textAlign: 'right' }}>{item.quantidade}</Text>
          <Text style={{ flex: 1, textAlign: 'right' }}>{formatarMoeda(item.valor)}</Text>
        </View>
      ))}
    </View>
  );
}
```

### Exemplo 2: Card com Informações

```tsx
function InfoCard({ titulo, dados }: { titulo: string; dados: Record<string, string> }) {
  return (
    <View style={{
      marginBottom: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.neutral50,
      borderLeft: `4px solid ${colors.primary}`
    }}>
      <Text style={{
        fontSize: fonts.size.lg,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.sm
      }}>
        {titulo}
      </Text>

      {Object.entries(dados).map(([label, value]) => (
        <View key={label} style={{
          flexDirection: 'row',
          marginBottom: spacing.xs
        }}>
          <Text style={{ fontWeight: 'bold', width: 120 }}>{label}:</Text>
          <Text style={{ flex: 1 }}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

// Uso:
<InfoCard
  titulo="Informações do Cliente"
  dados={{
    'Nome': data.clienteNome,
    'CPF/CNPJ': formatarCPF(data.clienteCpf),
    'Email': data.clienteEmail,
    'Telefone': formatarTelefone(data.clienteTelefone)
  }}
/>
```

### Exemplo 3: Badge de Status

```tsx
function StatusBadge({ status }: { status: 'aprovado' | 'reprovado' | 'pendente' }) {
  const badgeStyles = {
    aprovado: { backgroundColor: colors.success, color: colors.white },
    reprovado: { backgroundColor: colors.error, color: colors.white },
    pendente: { backgroundColor: colors.warning, color: colors.neutral900 },
  };

  const labels = {
    aprovado: 'APROVADO',
    reprovado: 'REPROVADO',
    pendente: 'PENDENTE',
  };

  return (
    <View style={{
      ...badgeStyles[status],
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 4,
      alignSelf: 'flex-start'
    }}>
      <Text style={{
        fontSize: fonts.size.xs,
        fontWeight: 'bold',
        ...badgeStyles[status]
      }}>
        {labels[status]}
      </Text>
    </View>
  );
}
```

### Exemplo 4: Quebra de Página

```tsx
// Forçar quebra de página antes de uma seção
<View break>
  <Text style={styles.sectionTitle}>Nova Seção (nova página)</Text>
</View>

// Evitar quebra dentro de um bloco
<View wrap={false}>
  <Text style={styles.sectionTitle}>Seção Importante</Text>
  <Text>Este conteúdo não será quebrado entre páginas</Text>
</View>
```

### Exemplo 5: Rodapé com Numeração

```tsx
function Footer({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) {
  return (
    <View fixed style={{
      position: 'absolute',
      bottom: spacing.md,
      left: spacing.lg,
      right: spacing.lg,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.neutral300,
      flexDirection: 'row',
      justifyContent: 'space-between'
    }}>
      <Text style={{ fontSize: fonts.size.xs, color: colors.neutral600 }}>
        Gerado em: {formatarData(new Date(), true)}
      </Text>
      <Text style={{ fontSize: fonts.size.xs, color: colors.neutral600 }}>
        Página {pageNumber} de {totalPages}
      </Text>
    </View>
  );
}

// Uso:
<Page>
  <View>{/* Conteúdo */}</View>
  <Footer pageNumber={1} totalPages={3} />
</Page>
```

---

## Limitações e Workarounds

### 1. Sem Suporte a CSS Grid

**Solução**: Use Flexbox

```tsx
// Grid 2 colunas com Flexbox
<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
  <View style={{ width: '50%' }}>Coluna 1</View>
  <View style={{ width: '50%' }}>Coluna 2</View>
  <View style={{ width: '50%' }}>Coluna 3</View>
  <View style={{ width: '50%' }}>Coluna 4</View>
</View>
```

### 2. Sem Suporte a Gradientes

**Solução**: Use SVG ou imagem de fundo

### 3. Fontes Customizadas Requerem Registro

```tsx
import { Font } from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf'
});

// Uso:
<Text style={{ fontFamily: 'Roboto' }}>Texto</Text>
```

---

## Checklist de Template

Antes de fazer deploy de um novo template:

- [ ] Template renderiza sem erros
- [ ] Todos os dados obrigatórios são exibidos
- [ ] Formatação aplicada (moeda, data, CPF/CNPJ)
- [ ] Espaçamento consistente (`spacing.*`)
- [ ] Cores do design system (`colors.*`)
- [ ] Testado com dados reais
- [ ] Testado com dados mínimos (campos opcionais vazios)
- [ ] Quebras de página apropriadas
- [ ] Tamanho do PDF <500KB (idealmente)
- [ ] Validações defensivas (`|| 'valor padrão'`)

---

## Recursos

- [Documentação @react-pdf/renderer](https://react-pdf.org/)
- [Playground Online](https://react-pdf.org/repl)
- [Exemplos de Layouts](https://react-pdf.org/examples)
- [Lista de Componentes](https://react-pdf.org/components)
- [Estilos Suportados](https://react-pdf.org/styling)
