# ⚠️ DOCUMENTO DEPRECIADO

> [!CAUTION]
> **Este documento foi DEPRECIADO em 2026-01-02.**  
> Use o documento oficial: **[DESIGN_SYSTEM.md](../technical/DESIGN_SYSTEM.md)**  
> Este arquivo será mantido apenas para referência histórica.

---

# Guia de Estilo e Desenvolvimento - Minerva v2 (DEPRECIADO)

~~Este documento serve como a fonte da verdade para o Design System implícito do projeto Minerva v2.~~ 

**Consulte o documento oficial em `docs/technical/DESIGN_SYSTEM.md`.**

## 1. Design Tokens

O sistema utiliza **Tailwind CSS v4** com variáveis CSS nativas (`--color-*`, `--spacing-*`) definidas no arquivo `src/index.css`.

### 1.1. Cores (Palette)

O projeto utiliza o espaço de cor **OKLCH** para maior vibrância e acessibilidade.

#### Cores Semânticas
As cores semânticas devem ser preferidas em vez das cores literais para garantir suporte a temas (dark mode) e consistência.

| Token | Uso Principal | Referência Visual |
|-------|---------------|-------------------|
| `bg-background` | Fundo principal da página | `oklch(1 0 0)` (Branco) |
| `text-foreground` | Texto principal | `oklch(.145 0 0)` (Preto suave) |
| `bg-card` | Fundo de cartões/elementos | `oklch(1 0 0)` |
| `bg-primary` | Ações principais, botões, destaques | `oklch(.205 0 0)` (Escuro) |
| `text-primary-foreground` | Texto sobre cor primária | `oklch(.985 0 0)` (Claro) |
| `bg-secondary` | Ações secundárias, fundos sutis | `oklch(.97 0 0)` (Cinza muito claro) |
| `text-secondary-foreground` | Texto sobre cor secundária | `oklch(.205 0 0)` |
| `bg-muted` | Elementos desabilitados ou de fundo | `oklch(.97 0 0)` |
| `text-muted-foreground` | Texto de apoio, legendas | `oklch(.556 0 0)` (Cinza médio) |
| `bg-destructive` | Ações destrutivas (excluir, erro) | Vermelho (definido pelo Tailwind) |
| `border-border` | Bordas padrão | `oklch(.922 0 0)` (Cinza claro) |
| `border-input` | Bordas de inputs | `oklch(.922 0 0)` |

#### Paleta Estendida (Literais)
Use com moderação, preferencialmente para status específicos ou ilustrações.

*   **Cinza (Gray/Neutral):** `gray-50` a `gray-900`. Usado para estruturar a hierarquia visual.
*   **Status:**
    *   🟢 **Sucesso/Concluído:** `green-100` (bg) + `green-700` (text) ou `green-600` (ícones).
    *   🔵 **Em Andamento/Info:** `blue-50` (bg) + `blue-800` (text) ou `blue-600` (ícones).
    *   🔴 **Erro/Cancelado/Bloqueado:** `red-50` (bg) + `red-800` (text) ou `red-600` (ícones).
    *   🟡 **Alerta/Atenção:** `yellow-100` (bg) + `yellow-800` (text).
    *   🟣 **Destaque Especial:** `purple-100` (bg) + `purple-800` (text).

### 1.2. Tipografia

A fonte principal é **Open Sans**, com fallback para `ui-sans-serif`.

| Token | Tamanho (`rem`) | Altura de Linha | Uso Recomendado |
|-------|-----------------|-----------------|-----------------|
| `text-xs` | 0.75rem | 1rem | Badges, legendas pequenas |
| `text-sm` | 0.875rem | 1.25rem | Texto de corpo denso, inputs, botões |
| `text-base` | 1rem | 1.5rem | Texto de corpo padrão |
| `text-lg` | 1.125rem | 1.75rem | Títulos de seções, destaques |
| `text-xl` | 1.25rem | 1.75rem | Títulos de cards |
| `text-2xl` | 1.5rem | 2rem | Títulos de página |

**Pesos:**
*   `font-normal` (400): Texto corrido.
*   `font-medium` (500): Labels, botões, destaques sutis.
*   `font-semibold` (600): Títulos, ênfases importantes.
*   `font-bold` (700): Títulos principais.

### 1.3. Espaçamento e Layout

*   **Unidade Base:** `0.25rem` (4px).
    *   `p-4` = 1rem (16px).
    *   `gap-2` = 0.5rem (8px).
*   **Container:** Classes utilitárias `container` com larguras máximas responsivas (`md` a `7xl`).
*   **Radius:**
    *   `rounded-md`: Padrão para botões e inputs.
    *   `rounded-xl`: Padrão para Cards.
    *   `rounded-full`: Avatares e pílulas.

---

## 2. Biblioteca de Componentes (Shadcn UI + Custom)

Os componentes residem em `src/components/ui`. Eles são construídos sobre Radix UI e estilizados com Tailwind.

### 2.1. Botões (`Button`)
*   **Variantes:**
    *   `default`: Fundo primário (preto/escuro), texto claro. Ação principal.
    *   `outline`: Borda cinza, fundo transparente. Ações secundárias.
    *   `ghost`: Fundo transparente, hover sutil. Botões em barras de ferramentas ou ícones.
    *   `destructive`: Fundo vermelho. Ações de risco.
*   **Tamanhos:** `default` (h-9), `sm` (h-8), `lg` (h-10), `icon` (quadrado).

### 2.2. Cards (`Card`)
Estrutura padrão para agrupar conteúdo:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    {/* Opcional: <CardDescription>Subtítulo</CardDescription> */}
  </CardHeader>
  <CardContent>
    {/* Conteúdo principal */}
  </CardContent>
  {/* Opcional: <CardFooter>Ações</CardFooter> */}
</Card>
```

### 2.3. Badges (`Badge`)
Usados para status e etiquetas.
*   **Padrão:** `bg-primary`.
*   **Variantes de Status (Customizadas via className):**
    *   Triagem: `variant="secondary" className="bg-gray-200 text-gray-800"`
    *   Em Andamento: `className="bg-primary/20 text-primary"`
    *   Concluída: `className="bg-green-100 text-green-700"`

### 2.4. Inputs e Formulários
*   **Input:** Altura `h-9`, borda `border-input`.
*   **Label:** Texto `text-sm font-medium`.
*   **Foco:** Anel de foco `focus-visible:ring-ring/50`.

---

## 3. Diretrizes de Desenvolvimento

### 3.1. Estrutura de Páginas
Páginas de detalhes (ex: `OSDetailsRedesignPage`) devem seguir esta estrutura:
1.  **Header Fixo:** Título, Breadcrumbs (se houver), Ações principais.
2.  **Layout de Conteúdo:**
    *   **Grid Principal:** `grid-cols-1 md:grid-cols-3 gap-6`.
    *   **Coluna Esquerda (2/3):** Conteúdo principal (Workflow, Abas de Detalhes).
    *   **Coluna Direita (1/3):** Informações contextuais (Resumo, Datas, Responsáveis).

### 3.2. Ícones
Utilize a biblioteca `lucide-react`.
*   Tamanho padrão em botões: `w-4 h-4 mr-2`.
*   Tamanho padrão solto: `w-5 h-5`.
*   Sempre forneça feedback visual (cor) quando o ícone representar um estado (ex: `text-green-600` para check).

### 3.3. Loading States
Não deixe o usuário esperando sem feedback.
*   **Página Inteira:** Use Skeletons (`animate-pulse bg-gray-200`) que imitam o layout final.
*   **Ações (Botões):** Desabilite o botão e mostre um `Loader2` girando (`animate-spin`).

### 3.4. Tratamento de Erros
*   Use `toast` (`sonner`) para feedback de operações (sucesso/erro).
*   Use blocos `try/catch` em todas as chamadas assíncronas.
*   Para erros de carregamento de dados críticos, exiba uma mensagem amigável no lugar do componente ou redirecione se necessário.

### 3.5. Boas Práticas (Do's and Don'ts)

*   ✅ **DO:** Use as variáveis de cor semânticas (`bg-primary`, `text-muted-foreground`) sempre que possível.
*   ✅ **DO:** Extraia lógica complexa de componentes grandes para funções auxiliares ou hooks.
*   ✅ **DO:** Use `className` para ajustes finos de layout (margens, paddings), mas evite reestilizar componentes base (Button, Card) ad-hoc.
*   ❌ **DON'T:** Não use cores hexadecimais arbitrárias (`#123456`). Adicione ao tema se for uma cor recorrente.
*   ❌ **DON'T:** Não crie componentes duplicados para variações visuais pequenas. Use `props` (ex: `variant`) ou composição.
*   ❌ **DON'T:** Não ignore os estados de `loading` e `error`.

## 4. Dívida Técnica de Design Identificada

*   **Consistência de Cores:** Algumas páginas usam classes de cores literais (`bg-blue-600`) em vez de semânticas ou variantes do tema, dificultando a manutenção do Dark Mode.
*   **Ícones:** Há importações de ícones não utilizados em alguns arquivos.
*   **Responsividade:** O layout de grid precisa ser verificado em mobile (`grid-cols-1`) para garantir que não quebre.
