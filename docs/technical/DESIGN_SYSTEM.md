# Minerva Design System v2.0

> **📖 BÍBLIA OFICIAL DO DESIGN SYSTEM**  
> **Última atualização:** 2026-01-02  
> **Versão:** 2.1 (Padronização de Páginas de Listagem)  
> **Projeto:** Minerva Engenharia - Sistema de Gestão Integrada (ERP)

---

## ⚠️ AVISOS IMPORTANTES

> 🆘 **Erro no console?** Consulte `/COMMON_ERRORS.md` para soluções rápidas

### ❌ NÃO use estas classes (não existem):
```tsx
// Classes que NÃO funcionam
bg-primary-hover
hover:bg-primary-hover
text-primary-hover
hover:text-secondary-hover
bg-success-hover

// Escalas numéricas só funcionam para bg-*
text-primary-200        // ❌ Não funciona
border-primary-300      // ❌ Não funciona
text-secondary-500      // ❌ Não funciona
```

### ✅ Use estas alternativas:
```tsx
// Opção 1: Componentes base (recomendado)
<Button>Hover automático</Button>

// Opção 2: Escala numérica (APENAS para bg-*)
<div className="bg-primary-500 hover:bg-primary-600">

// Opção 3: Para text/border, use cores diretas
<p className="text-primary">          // ✅ Funciona
<div className="border-primary">      // ✅ Funciona
<p className="text-neutral-600">      // ✅ Funciona (neutral tem escala)

// Opção 4: RGB direto
<div style={{ backgroundColor: 'rgb(189 158 50)' }}>
<div style={{ borderColor: 'rgb(231 215 151)' }}>
```

---

## 🎨 Paleta de Cores

### Cores Primárias

#### Primary (Dourado) - Escala Completa

- **HEX:** `#D3AF37`
- **RGB:** `rgb(211, 175, 55)`
- **Uso:** Botões principais, CTAs, destaques, logo
- **Classes Tailwind:** `bg-primary`, `text-primary`, `border-primary`

**Escala de Tons:**
```css
primary-50:  rgb(252, 249, 241)  /* Muito claro - backgrounds sutis */
primary-100: rgb(247, 240, 220)  /* Hover suave */
primary-200: rgb(239, 228, 186)  /* Disabled state */
primary-300: rgb(231, 215, 151)  
primary-400: rgb(223, 202, 117)  
primary-500: rgb(211, 175, 55)   /* DEFAULT */
primary-600: rgb(189, 158, 50)   /* Hover state */
primary-700: rgb(169, 140, 44)   /* Active/pressed state */
primary-800: rgb(126, 105, 33)   
primary-900: rgb(84, 70, 22)     /* Muito escuro - textos em fundos claros */
```

**Estados Especiais:**
```css
primary-hover:    rgb(189, 158, 50)  /* primary-600 */
primary-active:   rgb(169, 140, 44)  /* primary-700 */
primary-disabled: rgb(239, 228, 186) /* primary-200 */
```

> **⚠️ IMPORTANTE - Uso de Hover States:**  
> Para aplicar cores de hover, use a escala numérica do Tailwind:
> ```tsx
> // ✅ CORRETO
> <div className="bg-primary-500 hover:bg-primary-600">
> 
> // ❌ INCORRETO (não funciona)
> <div className="bg-primary hover:bg-primary-hover">
> ```
> Os tokens `hover`, `active` e `disabled` estão disponíveis mas devem ser usados via style inline ou nos componentes base.

#### Secondary (Dourado Claro) - Escala Completa

- **HEX:** `#DDC063`
- **RGB:** `rgb(221, 192, 99)`
- **Uso:** Botões secundários, destaques suaves, badges de status positivo
- **Classes Tailwind:** `bg-secondary`, `text-secondary`, `border-secondary`

**Escala de Tons:**
```css
secondary-50:  rgb(253, 250, 243)
secondary-100: rgb(249, 243, 227)
secondary-200: rgb(243, 228, 186)  /* Disabled state */
secondary-300: rgb(237, 213, 145)
secondary-400: rgb(229, 202, 122)
secondary-500: rgb(221, 192, 99)   /* DEFAULT */
secondary-600: rgb(209, 180, 87)   /* Hover state */
secondary-700: rgb(197, 168, 75)   /* Active state */
secondary-800: rgb(147, 126, 56)
secondary-900: rgb(98, 84, 37)
```

**Estados Especiais:**
```css
secondary-hover:    rgb(209, 180, 87)  /* secondary-600 */
secondary-active:   rgb(197, 168, 75)  /* secondary-700 */
secondary-disabled: rgb(243, 228, 186) /* secondary-200 */
```

---

### Cores Neutras (Gray/Zinc)

```css
neutral-50:  rgb(250, 250, 250)  /* Fundos muito claros */
neutral-100: rgb(244, 244, 245)  /* Background padrão */
neutral-200: rgb(228, 228, 231)  /* Bordas suaves */
neutral-300: rgb(212, 212, 216)  /* Bordas padrão */
neutral-400: rgb(161, 161, 170)  /* Texto desabilitado */
neutral-500: rgb(113, 113, 122)  /* Texto secundário */
neutral-600: rgb(82, 82, 91)     /* Texto muted */
neutral-700: rgb(63, 63, 70)     /* Texto escuro */
neutral-800: rgb(39, 39, 42)     /* Backgrounds escuros */
neutral-900: rgb(24, 24, 27)     /* Texto principal */
```

---

### Cores Semânticas (com Estados)

#### Success (Verde)
```css
success-DEFAULT: rgb(34, 197, 94)   /* #22c55e */
success-hover:   rgb(22, 163, 74)   /* Hover */
success-active:  rgb(21, 128, 61)   /* Active */
```

#### Warning (Laranja/Âmbar)
```css
warning-DEFAULT: rgb(245, 158, 11)  /* #f59e0b */
warning-hover:   rgb(217, 119, 6)   /* Hover */
warning-active:  rgb(180, 83, 9)    /* Active */
```

#### Error/Destructive (Vermelho)
```css
error-DEFAULT: rgb(239, 68, 68)     /* #ef4444 */
error-hover:   rgb(220, 38, 38)     /* Hover */
error-active:  rgb(185, 28, 28)     /* Active */
```

#### Info (Azul)
```css
info-DEFAULT: rgb(59, 130, 246)     /* #3b82f6 */
info-hover:   rgb(37, 99, 235)      /* Hover */
info-active:  rgb(29, 78, 216)      /* Active */
```

> **💡 DICA - Cores Semânticas:**  
> Use diretamente `bg-success`, `bg-warning`, `bg-error`, `bg-info`.  
> Para hover customizado, prefira usar os componentes Button/Badge com variants.

---

## 🌑 Sistema de Elevação (Sombras)

### Sombras Padrão (Override Tailwind)

```css
shadow-xs:   0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow-sm:   0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
shadow-md:   0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
shadow-lg:   0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
shadow-xl:   0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
shadow-2xl:  0 25px 50px -12px rgb(0 0 0 / 0.25)
```

### Sombras Customizadas Minerva

```css
shadow-card:         0 2px 8px 0 rgb(0 0 0 / 0.08)    /* Cards padrão */
shadow-card-hover:   0 4px 12px 0 rgb(0 0 0 / 0.12)   /* Cards hover */
shadow-card-active:  0 6px 16px 0 rgb(0 0 0 / 0.16)   /* Cards active */
shadow-modal:        0 20px 40px -8px rgb(0 0 0 / 0.2) /* Modais */
shadow-dropdown:     0 4px 12px 0 rgb(0 0 0 / 0.1)    /* Dropdowns */
shadow-elevated:     0 8px 24px 0 rgb(0 0 0 / 0.12)   /* Elementos elevados */
shadow-float:        0 12px 32px 0 rgb(0 0 0 / 0.16)  /* Elementos flutuantes */
```

### Sombras Internas

```css
shadow-inner-sm: inset 0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow-inner:    inset 0 2px 4px 0 rgb(0 0 0 / 0.06)
```

**Uso:**
```tsx
// Card padrão
<div className="shadow-card">...</div>

// Card interativo
<div className="shadow-card hover:shadow-card-hover transition-shadow">...</div>

// Modal
<div className="shadow-modal">...</div>
```

---

## 📐 Border Radius

### Escala Refinada

```css
rounded-none:  0
rounded-xs:    0.125rem   /* 2px */
rounded-sm:    0.25rem    /* 4px */
rounded-md:    0.375rem   /* 6px */
rounded:       0.5rem     /* 8px - DEFAULT */
rounded-lg:    0.75rem    /* 12px */
rounded-xl:    1rem       /* 16px */
rounded-2xl:   1.5rem     /* 24px */
rounded-3xl:   2rem       /* 32px */
rounded-full:  9999px
```

**Uso:**
```tsx
// Botões
<Button className="rounded-lg">...</Button>

// Cards
<Card className="rounded-xl">...</Card>

// Avatares
<Avatar className="rounded-full">...</Avatar>
```

---

## 📏 Spacing Data-Dense

### Escala Expandida (além dos defaults Tailwind)

```css
/* Micro espaçamentos */
0.5:  0.125rem   /* 2px */
1.5:  0.375rem   /* 6px */
2.5:  0.625rem   /* 10px */
3.5:  0.875rem   /* 14px */
4.5:  1.125rem   /* 18px */
5.5:  1.375rem   /* 22px */

/* Espaçamentos intermediários */
6.5:  1.625rem   /* 26px */
7.5:  1.875rem   /* 30px */
8.5:  2.125rem   /* 34px */
9.5:  2.375rem   /* 38px */

/* Espaçamentos grandes */
13:   3.25rem    /* 52px */
15:   3.75rem    /* 60px */
17:   4.25rem    /* 68px */
18:   4.5rem     /* 72px */
19:   4.75rem    /* 76px */
21:   5.25rem    /* 84px */
22:   5.5rem     /* 88px */
26:   6.5rem     /* 104px */
30:   7.5rem     /* 120px */

/* Espaçamentos extra-grandes */
88:   22rem      /* 352px */
100:  25rem      /* 400px */
112:  28rem      /* 448px */
128:  32rem      /* 512px */
```

**Uso Data-Dense:**
```tsx
// Formulários compactos
<div className="space-y-2.5">...</div>

// Padding compacto
<div className="px-3.5 py-1.5">...</div>

// Gap em grids
<div className="grid gap-2.5">...</div>
```

---

## ⏱️ Transições & Animações

### Durações

```css
transition-fast:   150ms
transition:        200ms  /* DEFAULT */
transition-slow:   300ms
transition-slower: 500ms
```

### Timing Functions

```css
ease-smooth:          cubic-bezier(0.4, 0, 0.2, 1)
ease-in-out-smooth:   cubic-bezier(0.645, 0.045, 0.355, 1)
ease-spring:          cubic-bezier(0.175, 0.885, 0.32, 1.275)
```

### Animações Pré-definidas

```css
animate-fade-in
animate-fade-out
animate-slide-in-from-top
animate-slide-in-from-bottom
animate-slide-in-from-left
animate-slide-in-from-right
animate-accordion-down
animate-accordion-up
```

**Uso:**
```tsx
// Transição suave em hover
<div className="transition-all duration-200 ease-smooth hover:shadow-card-hover">
  ...
</div>

// Fade in animation
<div className="animate-fade-in">...</div>

// Spring effect no hover
<Button className="transition-transform duration-200 ease-spring hover:scale-105">
  Clique aqui
</Button>
```

---

## 📚 Z-Index Hierárquico

```css
z-base:            0
z-dropdown:        1000
z-sticky:          1100
z-fixed:           1200
z-modal-backdrop:  1300
z-modal:           1400
z-popover:         1500
z-tooltip:         1600
```

**Uso:**
```tsx
<div className="z-modal">...</div>
<div className="z-dropdown">...</div>
```

---

## 📏 Tipografia

### Hierarquia de Headings

```css
h1: text-3xl leading-tight tracking-tight font-semibold     /* 30px, 1.25, -0.025em */
h2: text-2xl leading-snug tracking-tight font-semibold      /* 24px, 1.375, -0.025em */
h3: text-xl leading-snug font-semibold                       /* 20px, 1.375 */
h4: text-lg leading-normal font-medium                       /* 18px, 1.5 */
h5: text-base leading-normal font-medium                     /* 16px, 1.5 */
h6: text-sm leading-normal font-medium                       /* 14px, 1.5 */
```

### Elementos de Texto

```css
p:      text-base leading-relaxed        /* 16px, 1.625 */
small:  text-sm leading-normal           /* 14px, 1.5 */
code:   text-sm font-mono                /* 14px, monospace */
```

### Pesos de Fonte

```css
font-light:      300
font-normal:     400
font-medium:     500
font-semibold:   600
font-bold:       700
font-extrabold:  800
```

### Classes Utilitárias de Texto

```tsx
// Caption (legendas, metadados)
<span className="text-caption">Última atualização: 09/11/2025</span>

// Overline (labels superiores)
<span className="text-overline">Categoria</span>

// Label (rótulos de formulários)
<label className="text-label">Nome Completo</label>

// Body Small
<p className="text-body-small">Texto menor para detalhes</p>

// Body (padrão)
<p className="text-body">Texto padrão do corpo</p>

// Body Large
<p className="text-body-large">Texto destacado</p>

// Muted (texto secundário)
<p className="text-muted">Informação complementar</p>

// Estados semânticos
<p className="text-error">Erro de validação</p>
<p className="text-success">Operação bem-sucedida</p>
<p className="text-warning">Atenção necessária</p>
```

### Line Clamp (Truncar Texto)

```tsx
// 1 linha
<p className="line-clamp-1">Texto muito longo que será truncado...</p>

// 2 linhas
<p className="line-clamp-2">Texto muito longo...</p>

// 3 linhas
<p className="line-clamp-3">Texto muito longo...</p>
```

### Font Features

O sistema já aplica automaticamente:
- **Kerning:** `'kern' 1` - Ajuste de espaçamento entre letras
- **Ligatures:** `'liga' 1` - Ligaduras tipográficas
- **Contextual Alternates:** `'calt' 1` - Alternativas contextuais

### CSS Custom Properties (Tokens)

```css
/* Tamanhos */
--font-size-xs: 0.75rem      /* 12px */
--font-size-sm: 0.875rem     /* 14px */
--font-size-base: 1rem       /* 16px */
--font-size-lg: 1.125rem     /* 18px */
--font-size-xl: 1.25rem      /* 20px */
--font-size-2xl: 1.5rem      /* 24px */
--font-size-3xl: 1.875rem    /* 30px */

/* Line Heights */
--leading-tight: 1.25
--leading-snug: 1.375
--leading-normal: 1.5
--leading-relaxed: 1.625

/* Letter Spacing */
--tracking-tight: -0.025em
--tracking-normal: 0
--tracking-wide: 0.025em
--tracking-wider: 0.05em
```

> **IMPORTANTE:** Não use classes de tamanho/peso de fonte (`text-2xl`, `font-bold`) a menos que seja explicitamente necessário. O sistema já define valores padrão otimizados para cada elemento HTML.

---

## 💵 Inputs Numéricos (Golden Standard)

> [!IMPORTANT]
> **Padrão obrigatório** para todos os campos de entrada numéricos do sistema.  
> Última atualização: 2026-02-04

### Tipos de Inputs Numéricos

| Tipo | Componente | Uso | Formato |
|------|------------|-----|---------|
| **Inteiro** | `IntegerInput` | Quantidade, Idade, Parcelas | `1.234` |
| **Moeda** | `CurrencyInput` | Valores financeiros | `R$ 1.234,56` |
| **Porcentagem** | `PercentageInput` | Taxas, Rateios | `12,50%` |

---

### 🔴 7 Regras Obrigatórias

#### 1. Select All on Focus (Resolve o bug '01')

Ao clicar ou navegar com Tab para o campo, **todo o conteúdo deve ser selecionado automaticamente**.

```tsx
// ✅ OBRIGATÓRIO em todos os inputs numéricos
onFocus={(e) => e.target.select()}
```

**Por que?** Se o campo tem `0` e o usuário digita `1`:
- ❌ **Sem Select All:** `0` + `1` = `01` (string concatenation)
- ✅ **Com Select All:** `0` é substituído por `1` = `1`

#### 2. Máscaras em Tempo Real

Formatação automática de separadores de milhar e decimal **enquanto o usuário digita**.

```tsx
// Entrada do usuário → Exibição formatada
1000 → "1.000"
1000.5 → "1.000,50"
1234567.89 → "1.234.567,89"
```

**Biblioteca recomendada:** `react-number-format`

#### 3. Alinhamento à Direita (Right Aligned)

Todos os valores numéricos financeiros devem ser alinhados à direita para facilitar comparação visual.

```tsx
<Input className="text-right tabular-nums" />
```

| Texto Alinhado Esquerda | Número Alinhado Direita |
|-------------------------|-------------------------|
| Nome do Item            |              R$ 1.234,56 |
| Outro Item              |                R$ 567,89 |
| Total                   |              R$ 1.802,45 |

#### 4. Nunca Vazio (Fallback Value)

O campo **nunca deve ficar vazio**. No `onBlur`, se o valor for inválido ou vazio, aplicar fallback:

```tsx
onBlur={() => {
  if (!value || isNaN(value)) {
    setValue(0); // Inteiro: 0
    // ou setValue(0.00); // Moeda: 0,00
  }
}}
```

| Tipo | Fallback |
|------|----------|
| Inteiro | `0` |
| Moeda | `0,00` |
| Porcentagem | `0,00%` |

#### 5. Teclado Numérico Mobile

Forçar teclado numérico em dispositivos móveis:

```tsx
// Para inteiros
<Input inputMode="numeric" pattern="[0-9]*" />

// Para decimais (moeda, porcentagem)
<Input inputMode="decimal" />
```

#### 6. Centavos Automáticos (Money Input)

> [!TIP]
> **Padrão para valores monetários.** Elimina a necessidade de digitar vírgula.

O usuário digita apenas números, e o sistema posiciona automaticamente os centavos:

```
Usuário digita: 1     → Exibe: R$ 0,01
Usuário digita: 2     → Exibe: R$ 0,12
Usuário digita: 5     → Exibe: R$ 1,25
Usuário digita: 0     → Exibe: R$ 12,50
Usuário digita: 0     → Exibe: R$ 125,00
```

**Algoritmo:** Novo dígito entra à direita, desloca os anteriores para esquerda.

```tsx
// Implementação conceitual
const handleChange = (digits: string) => {
  const numericValue = parseInt(digits, 10);
  const floatValue = numericValue / 100; // Converte para centavos
  setValue(floatValue);
};
```

#### 7. Feedback Visual (Integração VALIDATION_SYSTEM)

Aplicar o padrão de **Green Ring / Red Ring** do [VALIDATION_SYSTEM.md](./VALIDATION_SYSTEM.md):

```tsx
<CurrencyInput
  value={valor}
  onValueChange={({ floatValue }) => {
    setValor(floatValue);
    if (touched.valor) validateField('valor', floatValue);
  }}
  onBlur={() => {
    markFieldTouched('valor');
    validateField('valor', valor);
  }}
  error={touched.valor ? errors.valor : undefined}
  success={touched.valor && !errors.valor && valor > 0}
/>
```

---

### 📦 Implementação Recomendada

**Biblioteca:** [`react-number-format`](https://github.com/s-yadav/react-number-format)

#### Instalação
```bash
npm install react-number-format
```

#### Exemplo Completo: CurrencyInput

```tsx
import { NumericFormat } from 'react-number-format';
import { Input } from '@/components/ui/input';
import { forwardRef } from 'react';

interface CurrencyInputProps {
  value: number;
  onValueChange: (value: number) => void;
  error?: string;
  success?: boolean;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, error, success, ...props }, ref) => {
    return (
      <NumericFormat
        getInputRef={ref}
        customInput={Input}
        value={value}
        onValueChange={(values) => {
          onValueChange(values.floatValue ?? 0);
        }}
        
        // 🎯 Formatação brasileira
        thousandSeparator="."
        decimalSeparator=","
        prefix="R$ "
        decimalScale={2}
        fixedDecimalScale
        
        // 🎯 Comportamento obrigatório
        onFocus={(e) => e.target.select()}
        inputMode="decimal"
        
        // 🎯 Estilo Right Aligned
        className={cn(
          "text-right tabular-nums",
          error && "border-error focus:ring-error",
          success && "border-success focus:ring-success"
        )}
        
        {...props}
      />
    );
  }
);
```

#### Separação Valor/Display

> [!IMPORTANT]
> **Sempre salvar o valor numérico (`floatValue`), nunca a string formatada.**

```tsx
// ❌ ERRADO: Salvar string
const valorDB = "R$ 1.234,56"; // String não pode ser somada

// ✅ CORRETO: Salvar número
const valorDB = 1234.56; // Float para cálculos e banco de dados
```

A biblioteca `react-number-format` fornece:
- `floatValue`: Número para cálculos e banco (ex: `1234.56`)
- `formattedValue`: String para exibição (ex: `"R$ 1.234,56"`)

---

### 🧪 Critérios de Aceitação

| Critério | Teste |
|----------|-------|
| Select All | Ao clicar/tab no campo com valor, todo texto é selecionado |
| Máscara | Digitar `1000` exibe `1.000` |
| Alinhamento | Valores alinhados à direita visualmente |
| Fallback | Apagar tudo e sair do campo → valor volta para `0` |
| Teclado | Em mobile, abre teclado numérico |
| Centavos | Digitar `125` em moeda → `R$ 1,25` |
| Validação | Campo inválido mostra borda vermelha |

---

## 🔧 CSS Custom Properties (tokens.css)

O arquivo `tokens.css` fornece variáveis CSS para valores que podem ser acessados em JavaScript ou em cálculos dinâmicos.

### Uso em CSS

```css
.custom-element {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--elevation-2);
  transition: var(--transition-base);
}
```

### Uso em JavaScript

```typescript
// Acessar valores CSS
const spacing = getComputedStyle(document.documentElement)
  .getPropertyValue('--spacing-md');

// Definir valores dinamicamente
document.documentElement.style.setProperty('--custom-value', '20px');
```

### Tokens Disponíveis

- **Spacing:** `--spacing-xs` até `--spacing-2xl`
- **Border:** `--border-radius-sm` até `--border-radius-3xl`
- **Elevação:** `--elevation-1` até `--elevation-5`
- **Transições:** `--transition-fast`, `--transition-base`, `--transition-slow`
- **Tipografia:** `--font-size-xs` até `--font-size-3xl`
- **Z-Index:** `--z-dropdown`, `--z-modal`, `--z-tooltip`
- **Dimensões:** `--sidebar-width`, `--header-height`, `--input-height-md`

---

## ♿ Acessibilidade

### Screen Reader Only

```tsx
// Ocultar visualmente mas manter acessível
<span className="sr-only">Descrição para leitores de tela</span>

// Mostrar apenas para leitores de tela em hover/focus
<button>
  <span className="sr-only">Fechar modal</span>
  <XIcon />
</button>
```

### Focus Visible

```tsx
// Focus ring padrão (já aplicado globalmente)
<button className="focus-visible:ring-2 focus-visible:ring-primary">
  Botão
</button>

// Customizar focus
<input className="focus:ring-primary focus:border-primary" />
```

### Reduced Motion

O sistema detecta automaticamente a preferência do usuário por movimento reduzido:

```css
@media (prefers-reduced-motion: reduce) {
  /* Todas as animações são reduzidas para 0.01ms */
  /* Scroll behavior vira 'auto' */
}
```

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  /* Bordas usam currentColor automaticamente */
}
```

### ARIA Labels

```tsx
// Sempre forneça labels descritivos
<button aria-label="Fechar modal de confirmação">
  <XIcon />
</button>

<input 
  aria-label="Buscar ordens de serviço"
  placeholder="Buscar..."
/>

// Estados
<button aria-pressed={isActive}>
  {isActive ? 'Ativo' : 'Inativo'}
</button>
```

---

## 🎯 Componentes

### Botões

```tsx
// Botão Primário (Dourado)
<Button>Ação Principal</Button>

// Botão Primário (usa as cores padrão do componente)
<Button>
  Ação Principal
</Button>

// Botão Secundário
<Button variant="secondary">Ação Secundária</Button>

// Botão Outline
<Button variant="outline">Ação Terciária</Button>

// Botão Destrutivo
<Button variant="destructive">Deletar</Button>

// Botão com cores customizadas (hover via Tailwind)
<Button className="bg-success hover:bg-success-600 text-white">
  Aprovar
</Button>
```

### Badges

```tsx
// Badge Primário
<Badge>Ativo</Badge>

// Badge Secundário
<Badge variant="secondary">Em Andamento</Badge>

// Badge Success
<Badge className="bg-success text-white">Concluído</Badge>

// Badge Warning
<Badge className="bg-warning text-white">Atenção</Badge>

// Badge Error
<Badge variant="destructive">Cancelado</Badge>

// Badge Info
<Badge className="bg-info text-white">Informação</Badge>
```

### Badges de Status de OS

> **📖 Documentação completa:** [STATUS_SYSTEM.md](./STATUS_SYSTEM.md)

#### Status Geral (Ciclo de Vida)

| Status | Classes | Uso |
|--------|---------|-----|
| Em Triagem | `bg-muted text-muted-foreground` | `<Badge className="bg-muted text-muted-foreground">Em Triagem</Badge>` |
| Em Andamento | `bg-primary/10 text-primary` | `<Badge className="bg-primary/10 text-primary">Em Andamento</Badge>` |
| Concluído | `bg-success/10 text-success` | `<Badge className="bg-success/10 text-success">Concluído</Badge>` |
| Cancelado | `bg-destructive/10 text-destructive` | `<Badge variant="destructive">Cancelado</Badge>` |

#### Status Situação (Ação Pendente)

| Situação | Classes | Prioridade |
|----------|---------|:----------:|
| Atrasado | `bg-destructive text-destructive-foreground` | 1 |
| Aguard. Aprovação | `bg-secondary text-secondary-foreground` | 2 |
| Aguard. Info | `bg-warning/20 text-warning` | 3 |
| Alerta Prazo | `bg-warning text-warning-foreground` | 4 |
| Ação Pendente | `bg-primary/10 text-primary` | 5 |
| Finalizado | `bg-muted text-muted-foreground` | 6 |

**Uso via Configuração:**
```tsx
import { STATUS_SITUACAO_CONFIG, type StatusSituacao } from '@/lib/types';

function SituacaoBadge({ situacao }: { situacao: StatusSituacao }) {
    const config = STATUS_SITUACAO_CONFIG[situacao];
    if (!config || situacao === 'finalizado') return null;
    return <Badge className={config.className}>{config.label}</Badge>;
}
```

### Cards

```tsx
// Card básico com sombra Minerva
<Card className="shadow-card">
  <CardHeader className="bg-primary">
    <CardTitle className="text-primary-foreground">Título</CardTitle>
  </CardHeader>
  <CardContent className="p-6">
    Conteúdo
  </CardContent>
</Card>

// Card interativo
<Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
  ...
</Card>

// Card elevado
<Card className="shadow-elevated rounded-xl">
  ...
</Card>
```

---

## 📄 Estrutura de Páginas de Listagem

> [!IMPORTANT]
> **Padrão obrigatório** para todas as páginas de listagem do sistema.  
> Referência: `/comercial/contratos`

### Estrutura de Rotas e Páginas (Padrão Ouro)
Use exatamente este padrão para garantir consistência visual e evitar margens duplas (double container).

**1. No Arquivo de Rota (`src/routes/...`)**
Use a classe `content-wrapper` para envolver o componente da página. Isso garante que o layout base seja respeitado sem forçar larguras fixas prematuramente.

```tsx
export const Route = createFileRoute('/path')({
  component: PageRoute,
});

function PageRoute() {
  return (
    <div className="content-wrapper">
      <MyPage />
    </div>
  );
}
```

**2. No Componente da Página (`src/components/...`)**
O componente deve gerenciar seu próprio container.

```tsx
export function MyPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader ... />
      {/* Conteúdo da página */}
    </div>
  );
}
```

### Header da Página

> **NOVO PADRÃO**: Utilize o componente `PageHeader` para garantir consistência.

```tsx
import { PageHeader } from '@/components/shared/page-header';

<PageHeader
  title="Título da Página"
  subtitle="Descrição breve"
  showBackButton={true} // OBRIGATÓRIO: Use true para todas as páginas internas (não-dashboard)
>
  {/* Ações renderizadas à direita */}
  <Button>
    <Plus className="w-4 h-4 mr-2" />
    Ação Principal
  </Button>
</PageHeader>
```

### Cards KPI (Resumo)

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600">Label</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">Valor</p>
        </div>
        {/* Ícone em círculo colorido */}
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
</div>
```

**Cores de ícones por tipo:**
| Tipo | Background | Ícone |
|------|------------|-------|
| Primário | `bg-primary/10` | `text-primary` |
| Sucesso | `bg-green-100` | `text-green-600` |
| Info/Valor | `bg-blue-100` | `text-blue-600` |
| Alerta | `bg-yellow-100` | `text-yellow-600` |
| Erro | `bg-red-100` | `text-red-600` |

### Card de Filtros (Separado)

```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-xl">Filtros</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex flex-col md:flex-row gap-4">
      {/* Input de busca com ícone */}
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar..." className="pl-8" />
      </div>
      
      {/* Selects de filtro */}
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Ativo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </CardContent>
</Card>
```

### Tabela Compacta (Padrão Financeiro)

> **NOVO PADRÃO**: Para listagens com alta densidade de dados (ex: Financeiro, Extratos), use os componentes `CompactTable`.

```tsx
import { 
  CompactTableWrapper, 
  CompactTableHead, 
  CompactTableRow, 
  CompactTableCell 
} from '@/components/shared/compact-table';

<CompactTableWrapper
  title="Lançamentos"
  subtitle="Exibindo dados importados"
  totalItems={100}
  currentCount={10}
  page={1}
  totalPages={10}
  onPageChange={setPage}
  itemsPerPage={10}
  onItemsPerPageChange={setItemsPerPage}
>
  <Table>
    <TableHeader>
      <TableRow className="bg-muted/40">
        <CompactTableHead onSort={() => handleSort('data')}>Data</CompactTableHead>
        <CompactTableHead>Descrição</CompactTableHead>
        <CompactTableHead align="right">Valor</CompactTableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((item) => (
        <CompactTableRow key={item.id} onClick={() => handleClick(item)}>
          <CompactTableCell>{formatDate(item.data)}</CompactTableCell>
          <CompactTableCell>{item.descricao}</CompactTableCell>
          <CompactTableCell className="text-right">{formatCurrency(item.valor)}</CompactTableCell>
        </CompactTableRow>
      ))}
    </TableBody>
  </Table>
</CompactTableWrapper>
```

**Regras de Estilo para Tabelas Financeiras:**
1.  **CompactTableRow**: Adiciona hover suave e cursor pointer se clicável.
2.  **CompactTableCell**: Padding reduzido e fonte levemente menor (`text-sm`).
3.  **Badges**: Use estilo "outline" com fundo suave (`bg-success/10 border-success/30`).
4.  **Valores**: Dinheiro sempre alinhado à direita (`text-right`) e com fonte tabular (`tabular-nums`).
5.  **Data**: Formato horizontal e conciso: `dd/MM/yy - HH:mm`.

### Card da Tabela

```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-xl">Lista de Items</CardTitle>
    <CardDescription>N item(s) encontrado(s)</CardDescription>
  </CardHeader>
  <CardContent>
    {isLoading ? (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-neutral-600">Carregando...</span>
      </div>
    ) : (
      <Table>...</Table>
    )}
  </CardContent>
</Card>
```

### Tabela de Dados (Padrão Compacto)

> **NOVO PADRÃO**: Para tabelas com alta densidade de dados (Financeiro, Listagens Operacionais), use o componente `CompactTableWrapper`.

**Benefícios:**
- Padroniza o Card, Título e Contadores
- Implementa paginação e suporte a quantidade por página
- Estilização compacta consistente

```tsx
import {
  CompactTableWrapper,
  CompactTableHead,
  CompactTableRow,
  CompactTableCell
} from '@/components/shared/compact-table';

// Exemplo de uso
<CompactTableWrapper
  title="Lançamentos Bancários"
  subtitle="Exibindo dados importados"
  totalItems={150}
  currentCount={10}
  page={currentPage}
  totalPages={Math.ceil(150 / 10)}
  onPageChange={setCurrentPage}
  itemsPerPage={itemsPerPage}
  onItemsPerPageChange={setItemsPerPage}
>
  <Table>
    <TableHeader>
      <TableRow className="bg-muted/40">
        {/* Use CompactTableHead para header denso */}
        <CompactTableHead>Data</CompactTableHead>
        <CompactTableHead>Descrição</CompactTableHead>
        <CompactTableHead className="text-right">Valor</CompactTableHead>
        <CompactTableHead className="text-center">Status</CompactTableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((item) => (
        // Use CompactTableRow para hover sutil
        <CompactTableRow key={item.id}>
          {/* Use CompactTableCell para padding reduzido */}
          <CompactTableCell>{item.date}</CompactTableCell>
          <CompactTableCell>{item.description}</CompactTableCell>
          <CompactTableCell className="text-right">R$ {item.value}</CompactTableCell>
          <CompactTableCell className="text-center">
             <Badge>{item.status}</Badge>
          </CompactTableCell>
        </CompactTableRow>
      ))}
    </TableBody>
  </Table>
</CompactTableWrapper>
```

---

## 🎭 Princípios de Design

1. **Corporativo:** Visual profissional e confiável
2. **Minimalista:** Sem elementos decorativos desnecessários
3. **Data-Dense:** Priorizar densidade de informação
4. **Gestão à Vista:** Informações críticas sempre visíveis
5. **Hierarquia Clara:** Estrutura visual bem definida
6. **Performance:** Transições leves e responsivas
7. **Acessibilidade:** Estados visuais claros (hover, focus, disabled)

---

## 🚀 Uso Prático

### Criar um Card com Header Dourado Interativo

```tsx
<Card className="shadow-card hover:shadow-card-hover transition-all duration-200 rounded-xl overflow-hidden">
  <div className="bg-primary px-6 py-4">
    <h3 className="text-primary-foreground">Título do Card</h3>
  </div>
  <CardContent className="p-6 space-y-4">
    <p className="text-neutral-600">Conteúdo do card...</p>
    <Button>
      Ação Principal
    </Button>
  </CardContent>
</Card>

### Card com Header Destacado (Separador)

```tsx
<Card className="border-border rounded-lg shadow-sm overflow-hidden">
  <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
    <CardTitle className="text-base font-semibold flex items-center gap-2">
      <Icon className="w-5 h-5 text-primary" />
      Título do Card
      <Badge variant="secondary" className="ml-auto">Badge Opcional</Badge>
    </CardTitle>
  </CardHeader>
  <CardContent className="pt-6">
    Conteúdo com espaçamento adequado...
  </CardContent>
</Card>
```
```

### Status com Badges Coloridos e Estados

```tsx
const statusBadges = {
  'aberto': <Badge className="bg-info text-white">Aberto</Badge>,
  'em_andamento': <Badge className="bg-warning text-white">Em Andamento</Badge>,
  'concluido': <Badge className="bg-success text-white">Concluído</Badge>,
  'cancelado': <Badge variant="destructive">Cancelado</Badge>
}
```

### Formulário Data-Dense

```tsx
<form className="space-y-2.5">
  <div className="space-y-1.5">
    <Label htmlFor="nome" className="text-sm">Nome</Label>
    <Input 
      id="nome" 
      className="h-9 text-sm focus:ring-primary focus:border-primary" 
    />
  </div>
  
  <div className="space-y-1.5">
    <Label htmlFor="email" className="text-sm">Email</Label>
    <Input 
      id="email" 
      type="email"
      className="h-9 text-sm focus:ring-primary focus:border-primary" 
    />
  </div>
  
  <Button className="w-full mt-4">
    Salvar
  </Button>
</form>
```

### Modal com Sombra Customizada

```tsx
<Dialog>
  <DialogContent className="shadow-modal rounded-2xl">
    <DialogHeader>
      <DialogTitle>Título do Modal</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      {/* Conteúdo */}
    </div>
  </DialogContent>
</Dialog>
```

---

## 🗂️ Tabs (Abas)

> [!IMPORTANT]
> **Componente Padrão:** `@/components/ui/tabs` (Tabs-01 do Shadcn Studio)  
> **API:** `{ Tabs, TabsList, TabsTrigger, TabsContent }`

### Uso Padrão

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Definir array de tabs para consistência
const tabs = [
  { name: 'Geral', value: 'geral', content: <ConteudoGeral /> },
  { name: 'Detalhes', value: 'detalhes', content: <ConteudoDetalhes /> },
  { name: 'Histórico', value: 'historico', content: <ConteudoHistorico /> },
];

// Renderização padrão
<Tabs defaultValue="geral">
  <TabsList>
    {tabs.map(tab => (
      <TabsTrigger key={tab.value} value={tab.value}>
        {tab.name}
      </TabsTrigger>
    ))}
  </TabsList>

  {tabs.map(tab => (
    <TabsContent key={tab.value} value={tab.value}>
      {tab.content}
    </TabsContent>
  ))}
</Tabs>
```

### Estilização

O componente já possui estilização padrão:
- **TabsList:** `bg-muted text-muted-foreground rounded-xl`
- **TabsTrigger (ativo):** `bg-card` com transição suave
- **TabsTrigger (inativo):** `text-muted-foreground`

Para customização adicional:

```tsx
// Container responsivo
<div className="w-full max-w-md">
  <Tabs defaultValue="tab1">...</Tabs>
</div>

// Conteúdo com estilo muted
<TabsContent value="tab1">
  <p className="text-muted-foreground text-sm">{conteudo}</p>
</TabsContent>

// Texto destacado dentro do conteúdo
<span className="text-foreground font-semibold">texto destacado</span>
```

### ✅ Boas Práticas

| Prática | Exemplo |
|---------|---------|
| Usar array de configuração | `const tabs = [{ name, value, content }]` |
| Iteração com `.map()` | Evita duplicação de código |
| `defaultValue` sempre definido | `<Tabs defaultValue="primeiro">` |
| Keys únicas nos loops | `key={tab.value}` |

### ❌ Evitar

```tsx
// ❌ NÃO faça - Tabs hardcoded repetitivas
<TabsTrigger value="tab1">Tab 1</TabsTrigger>
<TabsTrigger value="tab2">Tab 2</TabsTrigger>
<TabsTrigger value="tab3">Tab 3</TabsTrigger>

// ❌ NÃO faça - Estilos inline no TabsList
<TabsList className="bg-blue-500"> // Use o estilo padrão

// ❌ NÃO faça - Tabs sem defaultValue
<Tabs> // Causa comportamento inesperado
```

### Quando Usar

| Cenário | Recomendação |
|---------|--------------|
| Páginas de detalhes (Cliente, Colaborador, OS) | ✅ Usar Tabs |
| Alternância de visualizações (Lista/Grid) | ✅ Usar Tabs |
| Configurações com múltiplas seções | ✅ Usar Tabs |
| Formulários multi-step | ❌ Usar Stepper/Wizard |
| Navegação principal | ❌ Usar Menu lateral |

---

## 📋 Checklist de Implementação

### ✅ Fase 1: Tailwind Config (Concluída)

- ✅ Paleta de cores expandida (primary/secondary com 10 tons cada)
- ✅ Estados de cor (hover, active, disabled)
- ✅ Sistema de elevação hierárquico (9 níveis de sombra)
- ✅ Border radius refinado (9 variações)
- ✅ Spacing data-dense (30+ valores customizados)
- ✅ Transições padronizadas (durations + timing functions)
- ✅ Animações pré-definidas (8 animações)
- ✅ Z-index hierárquico (8 níveis)
- ✅ Cores semânticas com estados (success, warning, error, info)
- ✅ Eliminação de anti-patterns (color-override.css deletado)
- ✅ Configuração centralizada no tailwind.config.js

### ✅ Fase 2: Globals.css & Tokens (Concluída)

- ✅ CSS Custom Properties (tokens.css criado)
- ✅ Sistema tipográfico expandido (h1-h6 com line-height otimizado)
- ✅ Resets melhorados (box-model, forms, tables)
- ✅ Scrollbar customizada (webkit + firefox)
- ✅ Font feature settings (kerning, ligatures)
- ✅ Classes utilitárias de texto (.text-caption, .text-overline, etc)
- ✅ Line clamp utilities (1, 2, 3 linhas)
- ✅ Selection styling customizado
- ✅ Print styles otimizados
- ✅ Acessibilidade (sr-only, reduced motion, high contrast)
- ✅ Performance optimizations (will-change, contain)

---

## 🔄 Guia de Migração (Fase 2)

### Mudanças nos Imports

**ANTES:**
```tsx
import './styles/globals.css';
```

**DEPOIS:**
```tsx
import './styles/tokens.css';
import './styles/globals.css';
```

### Novas Classes Disponíveis

```tsx
// Antes: texto genérico
<p className="text-sm text-gray-600">Legenda</p>

// Depois: classe semântica
<p className="text-caption">Legenda</p>

// Antes: truncar manualmente
<p className="overflow-hidden whitespace-nowrap text-ellipsis">...</p>

// Depois: line-clamp
<p className="line-clamp-1">...</p>
```

### Scrollbar Customizada

Agora todos os scrollbars são estilizados automaticamente. Não é necessário código adicional.

### Selection Color

O texto selecionado agora usa a cor dourada clara automaticamente (rgb(239 228 186) - equivalente a primary-200).

---

## 🔍 Troubleshooting

### Cores não aparecem / ficam pretas

1. **Verificar imports no App.tsx (ordem importa!)**
   ```tsx
   import './styles/tokens.css';
   import './styles/globals.css';
   ```

2. **Limpar cache do navegador** (Ctrl+Shift+R / Cmd+Shift+R)

3. **Reiniciar servidor de desenvolvimento**

4. **Verificar console do navegador** para erros de compilação do Tailwind

### Classes Tailwind não aplicam

- Verificar se o arquivo está listado no `content` do tailwind.config.js
- Conferir se não há typos nas classes
- Usar DevTools para inspecionar elementos e verificar classes aplicadas
- Verificar ordem de imports no App.tsx (tokens.css primeiro, depois globals.css)

### Sombras não aparecem

- Verificar se o elemento tem background-color definido
- Conferir z-index do elemento
- Testar com `shadow-xl` para debug

### Tipografia parece diferente

- Verifique se não está usando classes de tamanho/peso desnecessárias
- Remova `text-xl`, `font-bold` etc se estiver usando `<h1>`, `<h2>`, etc
- O sistema já aplica valores otimizados automaticamente

### Focus rings não aparecem

- Use `:focus-visible` ao invés de `:focus`
- Teste com Tab (teclado) ao invés de clique do mouse
- Focus rings só aparecem para navegação por teclado

### Custom Properties não funcionam

- Verifique se `tokens.css` está sendo importado
- Use `var(--token-name)` com prefixo `var()`
- Não funciona em atributos inline, apenas em CSS/styled components

### Erro: "Cannot apply unknown utility class: bg-primary-200" ou similar

**Problema:** Classes como `bg-primary-hover`, `bg-success-hover` não são reconhecidas.

**Solução:**

```tsx
// ❌ INCORRETO - Essas classes não existem no Tailwind
<div className="bg-primary-hover">
<div className="hover:bg-primary-hover">

// ✅ CORRETO - Use a escala numérica
<div className="bg-primary-600">           // para cor estática
<div className="hover:bg-primary-600">      // para hover

// ✅ CORRETO - Use inline styles para tokens customizados
<div style={{ backgroundColor: 'rgb(189 158 50)' }}>

// ✅ CORRETO - Use os componentes com suas variants
<Button>Default (já tem hover correto)</Button>
<Badge className="bg-success text-white">Badge</Badge>
```

**Explicação:**  
O Tailwind não gera classes para tokens customizados como `hover`, `active`, `disabled` automaticamente. Use:
- Escala numérica (`primary-500`, `primary-600`) com `hover:` prefix
- Componentes base (Button, Badge) que já têm estados corretos
- Inline styles quando necessário

---

## 📖 Próximas Fases

### Fase 3: Utilities.css (Data-Dense)
- [ ] Classes de densidade (data-dense, data-dense-compact)
- [ ] Utilitários de card
- [ ] Layouts compactos
- [ ] Form utilities

### Fase 4: Animations.css
- [ ] Transições suaves customizadas
- [ ] Hover effects avançados
- [ ] Loading states
- [ ] Micro-interactions

---

**Fase 1 Concluída em:** 2025-11-09  
**Fase 2 Concluída em:** 2025-11-09  
**Próxima Fase:** Fase 3 - Utilities Data-Dense  
**Responsável:** Design System Team
