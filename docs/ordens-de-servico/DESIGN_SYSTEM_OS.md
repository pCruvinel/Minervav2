# 🎨 Design System — Padrão OS (Ordem de Serviço)

*Documento de Especificação Oficial baseado na **OS 13: Start de Contrato de Obra***
*Versão: 1.0 · Minerva Design System v4.1 · Atualização: 2026-03-08*

> [!IMPORTANT]
> Este documento é a **fonte de verdade (Gold Standard)** para todas as telas de Ordem de Serviço do sistema Minerva ERP.
> Qualquer nova OS deve seguir rigorosamente os tokens, componentes e padrões aqui documentados.

---

## 1. Design Tokens

### 1.1. Paleta de Cores

#### 1.1.1. Cores Primárias — Minerva Gold

| Token CSS             | HSL              | Hex       | Uso                                    | Tailwind Class            |
|----------------------|------------------|-----------|----------------------------------------|---------------------------|
| `--primary`          | `46 64% 52%`    | `#D3AF37` | CTA principal, destaques, brand        | `bg-primary`, `text-primary` |
| `--primary-foreground` | `0 0% 9%`     | `#171717` | Texto sobre fundo primary              | `text-primary-foreground`  |
| `--primary-hover`    | `46 64% 45%`    | `#BD9E32` | Hover do primary                       | `hover:bg-[#AA8C2C]`      |
| `--primary-active`   | `46 64% 40%`    | `#A98C2C` | Active/pressed do primary              | `active:bg-[#A98C2C]`     |
| `--secondary`        | `46 64% 63%`    | `#DDC063` | Elementos secundários, accent suave    | `bg-secondary`             |

**Escala Primary (padrão Tailwind):**

| Nível | Hex       | Uso |
|-------|-----------|-----|
| `50`  | `#FCF9F1` | Background sutil de accent |
| `100` | `#F7F0DC` | Background de cards accent |
| `200` | `#EFE4BA` | Bordas/backgrounds suaves |
| `300` | `#E7D797` | — |
| `400` | `#DFCA75` | — |
| `500` | `#D3AF37` | **Primary (DEFAULT)** |
| `600` | `#BD9E32` | Hover states |
| `700` | `#A98C2C` | Active/pressed |
| `800` | `#7E6921` | Texto sobre background claro |
| `900` | `#544616` | Texto accent forte |

**Minerva Gold Metallic (efeito Premium):**

| Token            | Valor         | Uso                       |
|-----------------|---------------|---------------------------|
| `minerva.gold.light`   | `#FCE38A` | Reflexo/highlight         |
| `minerva.gold.DEFAULT` | `#D4AF37` | Tom médio padrão          |
| `minerva.gold.dark`    | `#AA8C2C` | Sombra metálica           |
| `minerva.gold.shadow`  | `rgba(212,175,55,0.5)` | Sombra translúcida |
| `minerva.gold.foreground` | `#3E2F0A` | Texto contraste       |

#### 1.1.2. Cores Neutras — Zinc Scale

| Token CSS         | HSL             | Hex       | Tailwind Class |
|------------------|-----------------|-----------|----------------|
| `--neutral-50`   | `0 0% 98%`     | `#FAFAFA` | `bg-neutral-50` |
| `--neutral-100`  | `240 5% 96%`   | `#F4F4F5` | `bg-muted` |
| `--neutral-200`  | `240 5% 91%`   | `#E4E4E7` | `bg-input` |
| `--neutral-300`  | `240 6% 83%`   | `#D4D4D8` | `border-border` |
| `--neutral-400`  | `240 5% 65%`   | `#A1A1AA` | — |
| `--neutral-500`  | `240 4% 46%`   | `#71717A` | `text-muted-foreground` |
| `--neutral-600`  | `240 5% 34%`   | `#52525B` | — |
| `--neutral-700`  | `240 5% 26%`   | `#3F3F46` | — |
| `--neutral-800`  | `240 4% 16%`   | `#27272A` | — |
| `--neutral-900`  | `240 6% 10%`   | `#18181B` | — |
| `--neutral-950`  | `240 10% 4%`   | `#09090B` | `text-foreground` |

#### 1.1.3. Cores Semânticas

| Token CSS    | HSL             | Hex       | Uso                          | Tailwind Class |
|-------------|-----------------|-----------|------------------------------|----------------|
| `--success`  | `142 71% 45%`  | `#22C55E` | Etapa concluída, aprovação    | `text-success`, `bg-success/10` |
| `--warning`  | `38 92% 50%`   | `#F59E0B` | Aguardando, "última etapa"    | `text-warning`, `bg-warning/10` |
| `--error`    | `0 72% 51%`    | `#EF4444` | Erro, rejeição, destructive   | `text-destructive`, `bg-destructive/10` |
| `--info`     | `217 91% 60%`  | `#3B82F6` | Informativo, notificação      | `text-info` |

#### 1.1.4. Cores de Superfície

| Token CSS         | Uso                     | Tailwind Class |
|------------------|-------------------------|----------------|
| `--background`   | Fundo da página (#FFF)  | `bg-background` |
| `--card`         | Fundo de cards (#FFF)   | `bg-card` |
| `--muted`        | Fundo sutil/footer      | `bg-muted`, `bg-muted/30`, `bg-muted/50` |
| `--popover`      | Fundo de popovers       | `bg-popover` |
| `--accent`       | Fundo accent (primary-50)| `bg-accent` |
| `--border`       | Bordas padrão           | `border-border` |
| `--input`        | Fundo de inputs         | `border-input` |
| `--ring`         | Focus ring (primary)    | `ring-ring` |

---

### 1.2. Tipografia

#### 1.2.1. Família de Fontes

| Token CSS      | Valor                                           | Tailwind Class |
|---------------|------------------------------------------------|----------------|
| `--font-sans` | `'Plus Jakarta Sans', system-ui, -apple-system, ...` | `font-sans` |
| `--font-mono` | `'IBM Plex Mono', ui-monospace, 'SF Mono', ...`      | `font-mono` |

#### 1.2.2. Escala Tipográfica

| Token CSS          | Tamanho   | Equivalente | Uso na OS                              | Tailwind |
|-------------------|-----------|-------------|----------------------------------------|----------|
| `--font-size-xs`  | `0.75rem` | 12px        | Labels de stepper (`E1`), badges, meta | `text-xs` |
| `--font-size-sm`  | `0.875rem`| 14px        | Descrições, subtítulos, placeholders   | `text-sm` |
| `--font-size-base`| `1rem`    | 16px        | Corpo de texto, labels de formulário   | `text-base` |
| `--font-size-lg`  | `1.125rem`| 18px        | — (reservado)                          | `text-lg` |
| `--font-size-xl`  | `1.25rem` | 20px        | Subtítulos de seção (`h2` interna)     | `text-xl` |
| `--font-size-2xl` | `1.5rem`  | 24px        | Título da página (`h1`)                | `text-2xl` |
| `--font-size-3xl` | `1.875rem`| 30px        | — (reservado)                          | `text-3xl` |

**Stepper interno:** Labels ultra-compactas usam `text-[9px]` (custom).

#### 1.2.3. Pesos

| Token CSS                | Valor | Uso                               | Tailwind |
|-------------------------|-------|------------------------------------|----------|
| `--font-weight-normal`  | 400   | Corpo, descrições, placeholder     | `font-normal` |
| `--font-weight-medium`  | 500   | Labels, stepper info               | `font-medium` |
| `--font-weight-semibold`| 600   | Badges, counters, nomes            | `font-semibold` |
| `--font-weight-bold`    | 700   | Títulos (`h1`, `h2`)               | `font-bold` |

#### 1.2.4. Line-Height

| Token                    | Valor  | Tailwind |
|-------------------------|--------|----------|
| `--line-height-tight`   | 1.25   | `leading-tight` |
| `--line-height-normal`  | 1.5    | `leading-normal` |
| `--line-height-relaxed` | 1.625  | `leading-relaxed` |

---

### 1.3. Espaçamento e Grid

#### 1.3.1. Sistema de Spacing

| Token CSS        | Valor     | px  | Uso principal                        |
|-----------------|-----------|-----|--------------------------------------|
| `--spacing-xs`  | `0.25rem` | 4px | Gap mínimo entre ícone/texto         |
| `--spacing-sm`  | `0.5rem`  | 8px | Padding interno compacto             |
| `--spacing-md`  | `1rem`    | 16px| Espaçamentos padrão entre elementos  |
| `--spacing-lg`  | `1.5rem`  | 24px| Padding de cards, seções             |
| `--spacing-xl`  | `2rem`    | 32px| Margem entre seções principais       |
| `--spacing-2xl` | `3rem`    | 48px| — (reservado)                        |
| `--spacing-3xl` | `4rem`    | 64px| — (reservado)                        |

#### 1.3.2. Padrões de Espaçamento na OS 13

| Contexto                          | Classes Tailwind usadas                    |
|----------------------------------|--------------------------------------------|
| Container principal da main      | `px-6 py-6`                                |
| Header da página                 | `px-6 py-4`                                |
| Stepper                         | `px-6 py-2`                                |
| Conteúdo dentro do Card          | `pt-6` (via `CardContent`)                 |
| Footer (ações)                   | `px-6 py-4`                                |
| Espaço vertical entre campos     | `space-y-4` (gap 16px)                     |
| Espaço entre seções de formulário| `space-y-6` (gap 24px)                     |
| Gap entre ícone e texto no header| `gap-4`                                    |
| Gap entre botões no footer       | `gap-2`                                    |
| Grid de formulário               | `grid grid-cols-1 md:grid-cols-2 gap-4`    |
| Max-width do conteúdo            | `max-w-5xl` (padrão), `max-w-6xl` (etapas de agenda) |

---

### 1.4. Sombras, Bordas e Elevação

#### 1.4.1. Border Radius

| Token CSS        | Valor     | px   | Uso                          | Tailwind |
|-----------------|-----------|------|-------------------------------|----------|
| `--radius`      | `0.5rem`  | 8px  | Padrão (Cards, Modais)        | `rounded-lg` |
| `--radius-sm`   | `0.25rem` | 4px  | Inputs, tags compactas        | `rounded-sm` |
| `--radius-md`   | `0.5rem`  | 8px  | Botões, selects               | `rounded-md` |
| `--radius-lg`   | `0.75rem` | 12px | Cards grandes                 | `rounded-lg` |
| `--radius-xl`   | `1rem`    | 16px | Containers, popovers          | `rounded-xl` |
| `--radius-full` | `9999px`  | ∞    | Circles do stepper, badges pill| `rounded-full` |

#### 1.4.2. Border Patterns

| Padrão                 | Classes Tailwind                            | Uso                    |
|-----------------------|---------------------------------------------|------------------------|
| Borda padrão          | `border border-border`                      | Cards, containers      |
| Borda inferior        | `border-b border-border`                    | Header, CardHeader     |
| Borda superior        | `border-t border-border`                    | Footer                 |
| Borda dashed (upload) | `border-2 border-dashed border-border`      | Área de drag-and-drop  |
| Borda semântica       | `border-success/20`, `border-destructive/20`, `border-primary/20` | Alertas contextuais |
| Separador de seção    | `border-b border-border pb-2`               | Títulos `h3` de grupo  |
| Borda esquerda adendos| `border-l-2 border-muted-foreground/20`     | Lista de adendos       |

#### 1.4.3. Shadows

| Token CSS           | Valor                                                | Uso               |
|--------------------|------------------------------------------------------|--------------------|
| `--shadow-sm`      | `0 1px 2px 0 rgba(0,0,0,0.05)`                      | Botões             |
| `--shadow-md`      | `0 4px 6px -1px rgba(0,0,0,0.1), ...`               | Cards elevados     |
| `--shadow-lg`      | `0 10px 15px -3px rgba(0,0,0,0.1), ...`             | Modais/Dropdowns   |
| `--shadow-card`    | `0 2px 8px 0 rgba(0,0,0,0.08)`                      | Cards default      |
| `--shadow-card-hover`| `0 4px 12px 0 rgba(0,0,0,0.12)`                   | Cards hover        |

#### 1.4.4. Transitions

| Token                 | Valor  | Uso                |
|----------------------|--------|--------------------|
| `--transition-fast`  | 150ms  | Hover colors       |
| `--transition-base`  | 200ms  | Padrão geral       |
| `--transition-slow`  | 300ms  | Abertura de modais |
| `--transition-timing`| `cubic-bezier(0.4, 0, 0.2, 1)` | Easing padrão |

#### 1.4.5. Z-Index Scale

| Token               | Valor | Uso           |
|---------------------|-------|---------------|
| `--z-dropdown`      | 1000  | Selects       |
| `--z-sticky`        | 1100  | Headers fixed |
| `--z-modal-backdrop`| 1300  | Backdrop      |
| `--z-modal`         | 1400  | Dialog        |
| `--z-popover`       | 1500  | Combobox      |
| `--z-tooltip`       | 1600  | Tooltip       |

---

## 2. Componentes (UI Kit)

> Todos os componentes base são do **shadcn/ui** (Radix UI primitives).
> Componentes custom Minerva estendem os primitivos com classes específicas.

---

### 2.1. `PrimaryButton` *(Custom Minerva)*

**Arquivo:** `src/components/ui/primary-button.tsx`
**Descrição:** Botão de ação principal com visual da marca Minerva Gold. Substitui o `Button` do shadcn quando é CTA de workflow.

| Variante   | Background   | Text      | Border     | Hover           | Disabled |
|-----------|-------------|-----------|------------|-----------------|----------|
| `primary` | `#D4AF37`   | `#2A2005` | `#AA8C2C`  | `#AA8C2C`       | `gray-200/400` |
| `secondary`| `secondary` | `secondary-foreground` | — | `secondary/80` | `opacity-50` |
| `danger`  | `destructive`| `destructive-foreground` | — | `destructive/90`| `opacity-50` |
| `ghost`   | transparent | `foreground`| `border`  | `bg-muted`       | `opacity-50` |

**Sizes:** `sm` = `px-2 py-1 text-sm` · `default` = `px-4 py-2 text-base` · `lg` = `px-6 py-3 text-lg`

**Features:** Loading state com `Loader2 animate-spin`, ícone left/right, `fullWidth`, `asChild`.

```tsx
<PrimaryButton onClick={handleNext} isLoading={saving} loadingText="Salvando...">
  Salvar e Continuar
  <ChevronRight className="h-4 w-4 ml-2" />
</PrimaryButton>
```

---

### 2.2. `Button` *(shadcn/ui)*

**Uso na OS 13:** Botões secundários (Voltar, Salvar Rascunho, Cancelar).

| Variante       | Uso na OS                                | Classes de referência |
|---------------|------------------------------------------|-----------------------|
| `outline`     | "Etapa Anterior", "Salvar Rascunho"      | `variant="outline"` |
| `ghost`       | Botão remover arquivo, Adendos toggle    | `variant="ghost" size="sm"` |
| `destructive` | Rejeitar aprovação                       | `variant="destructive"` |
| `default`     | Solicitar Aprovação, Aprovar e Avançar   | (default variant) |

**Estado hover readOnly:** `bg-warning text-white hover:bg-warning/90` para "Voltar para onde estava".

---

### 2.3. `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` *(shadcn/ui)*

**Descrição:** Container principal de cada etapa do workflow.

```tsx
<Card>
  <CardHeader className="border-b">
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>Etapa {n}: {title}</CardTitle>
        <CardDescription>Setor: {setorNome}</CardDescription>
      </div>
      <Badge variant="outline" className="border-primary text-primary">
        Etapa {n} de {total}
      </Badge>
    </div>
  </CardHeader>
  <CardContent className="pt-6">
    {/* Conteúdo da etapa */}
  </CardContent>
</Card>
```

**Regra:** `CardHeader` sempre tem `border-b`. O `CardContent` inicia com `pt-6`.

---

### 2.4. `Badge` *(shadcn/ui)*

| Variante       | Uso na OS                              | Classes adicionais |
|---------------|----------------------------------------|--------------------|
| `outline`     | Counter "X/17", indicador de etapa     | `border-primary text-primary` |
| `secondary`   | Status aguardando, status aprovado     | `bg-warning/10 text-warning` ou `bg-success/10 text-success` |
| `destructive` | Status rejeitado                       | (default destructive) |
| `default`     | Badge setor destino (transferência)    | `bg-primary` |
| `outline` (muted) | Status pendente                   | `bg-muted` |

**Pill Badge (adendos):** `text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full`

---

### 2.5. `Input` *(shadcn/ui)*

**Uso:** Todos os campos de texto do formulário.
**Padrão de agrupamento:**

```tsx
<div className="space-y-2">
  <Label htmlFor="campo">
    Nome do Campo <span className="text-destructive">*</span>
  </Label>
  <Input
    id="campo"
    value={data.campo}
    onChange={(e) => handleInputChange('campo', e.target.value)}
    placeholder="Placeholder descritivo"
    disabled={readOnly}
  />
</div>
```

**Regras:**
- Campos obrigatórios: asterisco `<span className="text-destructive">*</span>`
- Inputs com máscara: CNPJ (`maxLength={18}`), CEP (`maxLength={9}`), Telefone (`maxLength={15}`)
- Estado `disabled` para modo readOnly

---

### 2.6. `Select` *(shadcn/ui)*

```tsx
<Select value={value} onValueChange={handleChange} disabled={readOnly}>
  <SelectTrigger id="campo">
    <SelectValue placeholder="Selecione..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="valor">Label</SelectItem>
  </SelectContent>
</Select>
```

---

### 2.7. `Switch` *(shadcn/ui)*

**Uso:** Campos booleanos (Possui Elevador?, Possui Piscina?).

```tsx
<div className="flex items-center justify-between p-4 border border-border rounded-lg">
  <Label htmlFor="toggle" className="cursor-pointer">Label</Label>
  <Switch id="toggle" checked={value} onCheckedChange={handler} disabled={readOnly} />
</div>
```

---

### 2.8. `RadioGroup` + `Card` *(composite)*

**Uso:** Decisões binárias (Aprovar/Reprovar Seguro).

```tsx
<Card className={`transition-all ${
  selected ? 'border-success bg-success/5' : 'hover:border-border'
} ${readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
  <CardContent className="p-4">
    <div className="flex items-center gap-3">
      <RadioGroupItem value="valor" id="id" />
      <div className="flex-1">
        <Label htmlFor="id" className="cursor-pointer text-base">Título</Label>
        <p className="text-sm text-muted-foreground mt-1">Descrição</p>
      </div>
      {selected && <CheckCircle2 className="w-5 h-5 text-success" />}
    </div>
  </CardContent>
</Card>
```

**Estados do Card-Radio:**

| Estado       | Border                  | Background           |
|-------------|-------------------------|----------------------|
| Não selecionado | `hover:border-border` | — |
| Aprovado    | `border-success`        | `bg-success/5`       |
| Reprovado   | `border-destructive`    | `bg-destructive/5`   |
| ReadOnly    | `opacity-50 cursor-not-allowed` | — |

---

### 2.9. `Alert` *(shadcn/ui)*

| Tipo           | Classes                                          | Ícone |
|---------------|--------------------------------------------------|-------|
| Informativo    | (default)                                       | `AlertCircle` |
| Sucesso        | `bg-success/5 border-success/20`                | `CheckCircle2` (text-success) |
| Erro/Atenção   | `bg-destructive/5 border-destructive/20`        | `AlertCircle` (text-destructive) |

---

### 2.10. `Dialog` (Modal) *(shadcn/ui)*

**Dimensões padrão:** `sm:max-w-md` (feedback), `sm:max-w-lg` (aprovação), `sm:max-w-[450px]` (transferência).

**Estrutura:**

```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="sm:max-w-lg">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">Título {badge}</DialogTitle>
      <DialogDescription>Subtítulo</DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">{/* conteúdo */}</div>
    <DialogFooter className="flex-col sm:flex-row gap-2">
      {/* botões */}
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### 2.11. `Tooltip` *(shadcn/ui)*

**Uso:** Mensagem de campo inválido no botão "Salvar e Continuar".

```tsx
<TooltipContent side="top" className="bg-destructive text-white border-destructive">
  <div className="flex items-center gap-2">
    <AlertCircle className="h-4 w-4" />
    <span>{mensagem}</span>
  </div>
</TooltipContent>
```

---

### 2.12. `FileUploadSection` *(Custom Minerva)*

**Arquivo:** `src/components/os/shared/components/file-upload-section.tsx`

**Área de Upload (Dropzone):**
```
border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer
```

**Ícone:** `Upload h-8 w-8 text-muted-foreground`

**Arquivo pendente (não enviado):**
```
border border-warning/20 bg-warning/5 rounded-lg p-3
Ícone: File h-4 w-4 text-warning
```

**Arquivo enviado:**
```
border border-border rounded-lg p-3
Ícone: File h-4 w-4 text-primary
Spinner: Loader2 h-4 w-4 animate-spin text-primary
```

**Remover:** `Button variant="ghost" size="sm"` com `Trash2 h-4 w-4`.

---

### 2.13. `WorkflowStepper` *(Custom Minerva)*

**Arquivo:** `src/components/os/shared/components/workflow-stepper.tsx`

**Container:** `border-b border-border px-6 py-2`
**Layout:** `flex items-center` (horizontal scroll implícito)

**Step Indicator (Circle):**

| Estado         | Background        | Ícone                           | Classes extra |
|---------------|-------------------|---------------------------------|---------------|
| Completed     | `bg-success/10`   | `Check h-3.5 w-3.5 text-success`| — |
| Current       | `bg-primary/20`   | Dot `w-2 h-2 rounded-full bg-primary` | — |
| Locked        | `bg-muted`        | `Lock h-3 w-3 text-muted-foreground` | `opacity-50 cursor-not-allowed` |
| Last Active   | `bg-warning`      | `ArrowLeft h-3 w-3 text-white`  | `border-2 border-warning/30 animate-pulse` |

**Circle size:** `w-6 h-6 rounded-full`
**Connector line:** `h-0.5 flex-1 min-w-[8px]` — `bg-success` (após completed) ou `bg-muted` (default)
**Label:** `text-[9px] font-medium` (número) + `text-[9px] text-muted-foreground line-clamp-2 leading-tight` (short name)
**"Estava aqui":** `text-[7px] text-warning font-semibold whitespace-nowrap`

---

### 2.14. `WorkflowFooter` *(Custom Minerva)*

**Arquivo:** `src/components/os/shared/components/workflow-footer.tsx`

**Container:** `border-t border-border px-6 py-4 bg-background`
**Layout:** `flex items-center justify-between`

| Posição  | Componente                     | Detalhes |
|---------|-------------------------------|----------|
| Esquerda | `Button variant="outline"`   | "Etapa Anterior" com `ChevronLeft` |
| Centro   | Counter `text-sm`            | `<span className="font-semibold">{n}</span> / {total}` |
| Direita  | `Button variant="outline"` + `PrimaryButton` | "Salvar Rascunho" + "Salvar e Continuar" ou "Concluir OS" |

**Modo ReadOnly:** Substitui botões por `text-sm text-muted-foreground italic` + botão warning "Voltar para onde estava".
**Botão desabilitado:** Tooltip com `bg-destructive text-white` ao hover.

---

### 2.15. `AprovacaoModal` *(Custom Minerva)*

**Arquivo:** `src/components/os/shared/components/aprovacao-modal.tsx`

**Status Badges no Dialog:**

| Status       | Badge                                                |
|-------------|------------------------------------------------------|
| Pendente    | `variant="outline" className="bg-muted"` + `Clock`   |
| Solicitada  | `variant="secondary" className="bg-warning/10 text-warning"` + `Clock` |
| Aprovada    | `variant="secondary" className="bg-success/10 text-success"` + `CheckCircle` |
| Rejeitada   | `variant="destructive"` + `XCircle`                  |

**Containers contextuais:**
- Info box: `p-4 rounded-lg bg-primary/5 border border-primary/20`
- Info box muted: `p-4 rounded-lg bg-muted/50 border`
- Rejection box: `p-4 rounded-lg bg-destructive/10 border border-destructive/20`

---

### 2.16. `FeedbackTransferencia` *(Custom Minerva)*

**Arquivo:** `src/components/os/shared/components/feedback-transferencia.tsx`

**Success circle:** `h-16 w-16 rounded-full bg-success/10` com `CheckCircle h-10 w-10 text-success`
**Transfer flow:** `flex items-center justify-center gap-3 p-4 bg-muted/50 rounded-lg`
**Notification box:** `flex items-center justify-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20`
**Timer:** `Timer animate-pulse` com countdown

---

### 2.17. `StepReadOnlyWithAdendos` *(Custom Minerva)*

**Arquivo:** `src/components/os/shared/components/step-readonly-with-adendos.tsx`

**Separator:** `pt-3 border-t border-border`
**Adendo item:** `bg-muted/20 rounded-lg p-3`
**New adendo form:** `bg-muted/10 rounded-lg p-3 border border-dashed border-primary/30`
**Adendos list border:** `border-l-2 border-muted-foreground/20`

---

### 2.18. `Collapsible` *(shadcn/ui — Radix)*

**Uso:** Seção de adendos.
**Trigger:** `Button variant="ghost" size="sm" className="w-full justify-between py-2 px-3 hover:bg-muted/50"`

---

## 3. Padrões de UX e Interação

### 3.1. Workflow Wizard (Stepper Pattern)

O fluxo da OS segue um **Wizard multi-step linear com revisão histórica**:

1. **Navegação sequencial:** O usuário avança uma etapa por vez com "Salvar e Continuar".
2. **Navegação histórica:** Clicar em etapas anteriores entra em modo **read-only** (histórico).
3. **Retorno ao ativo:** Botão "Voltar para onde estava" (`bg-warning`) retorna à etapa ativa.
4. **Etapas bloqueadas:** Futuras ficam `opacity-50 cursor-not-allowed` com ícone `Lock`.

### 3.2. Validação de Formulários

| Regra                                    | Implementação |
|----------------------------------------|---------------|
| Campos obrigatórios                    | Asterisco `<span className="text-destructive">*</span>` no `Label` |
| Botão bloqueado (form inválido)        | `isFormInvalid` → `disabled` + `Tooltip` destructive |
| Validação imperativa (Etapa 1)         | Via `ref.current.validate()` no `handleNextStep` |
| Validação declarativa (Etapas 2–17)    | `completionRules` — regras por etapa verificam campos |
| Feedback de erro                       | `toast.error(msg)` via `sonner` |
| Feedback de sucesso                    | `toast.success(msg)` |

### 3.3. Sistema de Aprovação

Etapas críticas requerem aprovação do coordenador antes de avançar:

```
Operacional → Solicitar Aprovação → Coordenador → Aprovar/Rejeitar → Avançar
```

- **Gate:** `aprovacaoInfo?.requerAprovacao && statusAprovacao !== 'aprovada'` bloqueia o avanço.
- **Modal:** Exibido automaticamente ao tentar avançar.

### 3.4. Transferência de Setor

Ao avançar entre etapas de setores diferentes:

1. `executarTransferencia()` verifica se há handoff de setor.
2. Modal `FeedbackTransferencia` exibido com countdown de 5s.
3. Redirecionamento automático para OS Details.

### 3.5. Loading States

| Componente     | Loading indicator                        |
|---------------|------------------------------------------|
| Botão CTA      | `Loader2 animate-spin` + texto "Processando..." |
| Upload arquivo  | `Loader2 animate-spin text-primary`     |
| Modal          | `Loader2 w-8 h-8 animate-spin text-muted-foreground` centralizado |
| Stepper        | `animate-pulse` no indicador "última etapa ativa" |

### 3.6. Estados de readOnly

Quando em modo histórico:
- Todos os `Input`, `Select`, `Switch`, `RadioGroup` recebem `disabled={true}`.
- Footer mostra texto italic "Visualizando dados salvos".
- `RadioGroup` cards recebem `opacity-50 cursor-not-allowed`.

### 3.7. Responsividade

| Breakpoint | Comportamento |
|-----------|---------------|
| Mobile (`<md`) | `grid-cols-1` para formulários |
| Desktop (`≥md`) | `grid grid-cols-1 md:grid-cols-2 gap-4` |
| Max-width padrão | `max-w-5xl mx-auto` |
| Max-width ampliado | `max-w-6xl` (etapas de agendamento: 6 e 16) |
| DialogFooter | `flex-col sm:flex-row gap-2` |
| Dialog | `sm:max-w-md` / `sm:max-w-lg` / `sm:max-w-[450px]` |

---

## 4. Estrutura de Layout da OS

### 4.1. Arquitetura de Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  HEADER (bg-background border-b)                                     │
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │ [← Voltar]  OS-13: Start de Contrato de Obra     [5 / 17]      ││
│  │             OS #uuid-aqui                                       ││
│  └──────────────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────────────┤
│  STEPPER (bg-card border-b, max-w-5xl mx-auto)                      │
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │ [✓ E1]──[✓ E2]──[● E3]──[🔒 E4]──[🔒 E5]── ... ──[🔒 E17]    ││
│  │  Cliente   ART   Fotos    Áreas    Crono         Visita Final   ││
│  └──────────────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────────────┤
│  MAIN (flex-1 px-6 py-6)                                            │
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │  CARD (max-w-5xl mx-auto)                                       ││
│  │  ┌──────────────────────────────────────────────────────────────┐││
│  │  │  CardHeader (border-b)                                      │││
│  │  │  Etapa 3: Relatório Fotográfico  [Etapa 3 de 17]           │││
│  │  │  Setor: Obras                                               │││
│  │  ├──────────────────────────────────────────────────────────────┤││
│  │  │  CardContent (pt-6)                                         │││
│  │  │                                                             │││
│  │  │  ┌── Step Component ──────────────────────────────────┐     │││
│  │  │  │  h2 (text-xl) + description (text-sm muted)       │     │││
│  │  │  │  h3 section heading (text-base, primary color)     │     │││
│  │  │  │  grid grid-cols-1 md:grid-cols-2 gap-4             │     │││
│  │  │  │  [Label + Input] [Label + Select]                  │     │││
│  │  │  │  [Switch row]    [Switch row]                      │     │││
│  │  │  │  [Alert info]                                      │     │││
│  │  │  └────────────────────────────────────────────────────┘     │││
│  │  │                                                             │││
│  │  │  ┌── Adendos Section (border-t) ─────────────────────┐     │││
│  │  │  │  [Adendos ▼] (collapsible)                        │     │││
│  │  │  └────────────────────────────────────────────────────┘     │││
│  │  ├──────────────────────────────────────────────────────────────┤││
│  │  │  FOOTER (border-t bg-muted/30, px-6 py-4)                  │││
│  │  │  [← Etapa Anterior]   3 / 17   [Salvar Rascunho] [Avançar→]│││
│  │  └──────────────────────────────────────────────────────────────┘││
│  └──────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

### 4.2. Regiões Semânticas

| Região          | Tag / Classe                                 | Bgcolor           |
|----------------|----------------------------------------------|--------------------|
| Header         | `<div className="bg-background border-b">`   | `bg-background`    |
| Stepper        | `<div className="bg-card border-b">`         | `bg-card`          |
| Main           | `<main className="flex-1 px-6 py-6">`        | (inherit)          |
| Card Wrapper   | `<Card>` (shadcn)                            | `bg-card`          |
| Card Header    | `<CardHeader className="border-b">`          | (inherit)          |
| Card Content   | `<CardContent className="pt-6">`             | (inherit)          |
| Footer         | `<div className="border-t bg-muted/30">`     | `bg-muted/30`      |
| Modais         | `<Dialog>` / `<DialogContent>`               | `bg-popover`       |

### 4.3. Hierarquia de Títulos dentro de uma Etapa

```
h1   → text-2xl font-bold                     (título da página: "OS-13: Start de Contrato de Obra")
h2   → text-xl mb-1                            (título da etapa no step component: "Dados do Cliente")
 p   → text-sm text-muted-foreground           (descrição da etapa)
h3   → text-base border-b pb-2 color:primary   (seção do formulário: "Dados Gerais")
Label→ text-sm font-medium                     (campo de formulário)
```

### 4.4. Ícones (Lucide React)

Biblioteca: `lucide-react`. Ícones padronizados:

| Ícone             | Contexto de uso                  | Size padrão |
|------------------|----------------------------------|-------------|
| `ChevronLeft`    | Voltar, Etapa Anterior           | `w-5 h-5`, `h-4 w-4` |
| `ChevronRight`   | Avançar, Continuar               | `h-4 w-4`  |
| `Check`          | Etapa concluída (stepper)        | `h-3.5 w-3.5` |
| `CheckCircle`    | Aprovação confirmada             | `w-12 h-12`, `w-5 h-5` |
| `Lock`           | Etapa bloqueada                  | `h-3 w-3`  |
| `ArrowLeft`      | Indicador "última etapa ativa"   | `h-3 w-3`  |
| `Upload`         | Área de upload                   | `h-8 w-8`  |
| `File`           | Arquivo anexado                  | `h-4 w-4`  |
| `Trash2`         | Remover arquivo                  | `h-4 w-4`  |
| `Loader2`        | Loading spinner (`animate-spin`) | `h-4 w-4`, `w-8 h-8` |
| `AlertCircle`    | Aviso/erro                       | `h-4 w-4`  |
| `Shield`         | Seguro de obras                  | `w-6 h-6`  |
| `Clock`          | Aguardando aprovação             | `w-3 h-3`, `w-12 h-12` |
| `Send`           | Solicitar aprovação              | `w-4 h-4`  |
| `XCircle`        | Rejeição                         | `w-3 h-3`, `w-5 h-5` |
| `MessageSquarePlus`| Adendos                        | `h-4 w-4`  |
| `User`           | Autor do adendo                  | `h-3 w-3`, `h-4 w-4` |
| `Calendar`       | Data do adendo                   | `h-3 w-3`  |
| `Timer`          | Countdown transferência          | `h-4 w-4`  |
| `ExternalLink`   | Ir para detalhes                 | `h-4 w-4`  |
| `ArrowRight`     | Seta de transferência            | `h-5 w-5`  |
| `Plus`           | Adicionar adendo                 | `h-4 w-4`  |
| `Info`           | (disponível, não usado)          | — |

---

## 5. Regras de Implementação

### 5.1. Checklist para Novas Telas de OS

- [ ] Usar `WorkflowStepper` no header com `steps` tipados como `WorkflowStep[]`
- [ ] Encapsular cada etapa num `Card > CardHeader (border-b) > CardContent (pt-6)`
- [ ] Usar `WorkflowFooter` com `PrimaryButton` como CTA
- [ ] Implementar `StepReadOnlyWithAdendos` para navegação histórica
- [ ] Seguir grid `grid-cols-1 md:grid-cols-2 gap-4` para formulários
- [ ] Marcar campos obrigatórios com `<span className="text-destructive">*</span>`
- [ ] Usar `FileUploadSection` para uploads com padrão drag-and-drop
- [ ] Implementar `completionRules` para validação por etapa
- [ ] Suportar `readOnly` em todos os campos/etapas
- [ ] Respeitar `max-w-5xl mx-auto` para conteúdo (ou `max-w-6xl` para etapas de agenda)
- [ ] Integrar `AprovacaoModal` para etapas que requerem coordenador
- [ ] Integrar `FeedbackTransferencia` para handoffs entre setores

### 5.2. Proibições

> [!CAUTION]
> - **NUNCA** usar cores fora da paleta definida em `variables.css`.
> - **NUNCA** usar `px` fixo para espaçamento; usar tokens Tailwind (`gap-4`, `p-6`, `space-y-6`).
> - **NUNCA** criar botões CTA sem o componente `PrimaryButton`.
> - **NUNCA** omitir o estado `readOnly`/`disabled` em campos de formulário.
> - **NUNCA** usar `z-index` arbitrário; usar a escala definida (`--z-modal`, `--z-tooltip`).

---

*Documento gerado via engenharia reversa da OS 13 · Gold Standard · Minerva Design System v4.1*
