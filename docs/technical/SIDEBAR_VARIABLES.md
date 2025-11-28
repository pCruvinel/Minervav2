# 🎨 Mapeamento de Variáveis da Sidebar

Este documento lista todas as variáveis CSS utilizadas no componente `Sidebar` (`src/components/layout/sidebar.tsx`).

## 📏 Dimensões e Layout
Definidas em: `src/styles/variables.css`

| Variável | Valor Atual | Descrição |
|----------|-------------|-----------|
| `--sidebar-width` | `16rem` (256px) | Largura da sidebar expandida |
| `--sidebar-collapsed` | `4rem` (64px) | Largura da sidebar recolhida |
| `--header-height` | `4rem` (64px) | Altura do cabeçalho (usado para alinhar logo) |
| `--z-sticky` | `1100` | Z-index da sidebar (camada de sobreposição) |

## 🎨 Cores do Tema (Shadcn/Tailwind)
Definidas em: `src/styles/globals.css`
*Valores em formato HSL (Hue Saturation Lightness)*

| Variável | Light Mode | Dark Mode | Uso Principal |
|----------|------------|-----------|---------------|
| `--sidebar` | `0 0% 98%` | `240 5.9% 10%` | Cor de fundo base |
| `--sidebar-foreground` | `240 5.3% 26.1%` | `240 4.8% 95.9%` | Cor do texto principal |
| `--sidebar-primary` | `240 5.9% 10%` | `224.3 76.3% 48%` | Cor de destaque primária |
| `--sidebar-primary-foreground` | `0 0% 98%` | `0 0% 100%` | Texto sobre cor primária |
| `--sidebar-accent` | `240 4.8% 95.9%` | `240 3.7% 15.9%` | Fundo ao passar o mouse (hover) |
| `--sidebar-accent-foreground` | `240 5.9% 10%` | `240 4.8% 95.9%` | Texto ao passar o mouse |
| `--sidebar-border` | `220 13% 91%` | `240 3.7% 15.9%` | Cor da borda direita |
| `--sidebar-ring` | `217.2 91.2% 59.8%` | `217.2 91.2% 59.8%` | Anel de foco |

## 🖌️ Cores Específicas (Design System)
Definidas em: `src/styles/variables.css`
*Usadas diretamente no estilo inline do componente*

### Estados e Interações
| Variável | Valor | Uso |
|----------|-------|-----|
| `--color-primary-50` | `#fcf9f1` | Fundo do item ativo / submenu ativo |
| `--color-primary-100` | `#f7f0dc` | Fundo do avatar / hover do botão toggle |
| `--color-primary-700` | `#a98c2c` | Texto do item ativo / ícone do avatar |
| `--color-neutral-50` | `#fafafa` | Hover em submenu inativo |
| `--color-neutral-100` | `#f4f4f5` | Hover em item inativo / fundo botão toggle |
| `--color-neutral-200` | `#e4e4e7` | Hover do botão toggle |

### Texto e Bordas
| Variável | Valor | Uso |
|----------|-------|-----|
| `--color-neutral-500` | `#71717a` | Texto secundário (cargo do usuário) |
| `--color-neutral-600` | `#52525b` | Texto de submenu inativo |
| `--color-neutral-700` | `#3f3f46` | Texto de item inativo |
| `--color-neutral-900` | `#18181b` | Nome do usuário |
| `--color-border` | `var(--color-neutral-300)` | Borda do submenu |
| `--color-border-light` | `var(--color-neutral-200)` | Bordas divisórias (header/footer) |

## ⏱️ Animações e Espaçamento
Definidas em: `src/styles/variables.css`

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `--transition-base` | `200ms` | Duração da expansão/colapso |
| `--transition-fast` | `150ms` | Duração do hover |
| `--spacing-xs` | `0.25rem` (4px) | Gap entre itens |
| `--spacing-sm` | `0.5rem` (8px) | Padding interno dos itens |
| `--spacing-md` | `1rem` (16px) | Margens e paddings gerais |
| `--spacing-lg` | `1.5rem` (24px) | Padding do container de navegação |
