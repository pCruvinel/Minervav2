# Componentes Afetados - Reestruturação CSS

**Data**: 2025-12-01
**Branch**: `refactor/css-architecture-v2`
**Backup**: `backups/styles-backup-20251201/`

## 📋 Resumo Executivo

Esta reestruturação CSS afeta **56 componentes UI** e suas dependências em toda a aplicação.

### Prioridade de Migração

#### 🔴 **PRIORIDADE CRÍTICA** (Problemas Conhecidos - FASE 2 Dias 1-2)
1. **Checkbox** (`src/components/ui/checkbox.tsx`)
   - **Problema**: Check mark desaparece após clicar
   - **Causa**: CSS conflitante com `!important` em `color: inherit`
   - **data-slot**: `checkbox`, `checkbox-indicator`

2. **RadioGroup** (`src/components/ui/radio-group.tsx`)
   - **Problema**: Círculo de seleção não aparece
   - **Causa**: CSS sobrescreve cores do indicator
   - **data-slot**: `radio-group-item`, `radio-group-indicator`

3. **Slider** (`src/components/ui/slider.tsx`)
   - **Problema**: Preenchimento não aparece
   - **Causa**: Falta de estilos específicos para track/range
   - **data-slot**: `slider-root`, `slider-track`, `slider-range`, `slider-thumb`

4. **Switch** (`src/components/ui/switch.tsx`)
   - **Problema**: 3 fontes de verdade conflitantes (index.css, tailwind-fix.css, inline)
   - **Causa**: Estilos duplicados e conflitantes
   - **data-slot**: `switch`, `switch-thumb`

#### 🟡 **PRIORIDADE ALTA** (Complexidade Visual - FASE 2 Dias 3-4)
5. **Dialog** (`src/components/ui/dialog.tsx`)
6. **Popover** (`src/components/ui/popover.tsx`)
7. **Select** (`src/components/ui/select.tsx`)
8. **Accordion** (`src/components/ui/accordion.tsx`)
9. **Dropdown Menu** (`src/components/ui/dropdown-menu.tsx`)
10. **Sheet** (`src/components/ui/sheet.tsx`)

#### 🟢 **PRIORIDADE MÉDIA** (FASE 3)
11. **Tabs** (`src/components/ui/tabs.tsx`)
12. **Progress** (`src/components/ui/progress.tsx`)
13. **Tooltip** (`src/components/ui/tooltip.tsx`)
14. **Navigation Menu** (`src/components/ui/navigation-menu.tsx`)
15. **Menubar** (`src/components/ui/menubar.tsx`)
16. **Context Menu** (`src/components/ui/context-menu.tsx`)
17. **Alert Dialog** (`src/components/ui/alert-dialog.tsx`)
18. **Collapsible** (`src/components/ui/collapsible.tsx`)
19. **Hover Card** (`src/components/ui/hover-card.tsx`)
20. **Carousel** (`src/components/ui/carousel.tsx`)

## 📦 Inventário Completo de Componentes UI

### Radix UI Primitives (31 componentes)
```
✅ accordion.tsx
✅ alert-dialog.tsx
✅ aspect-ratio.tsx
✅ avatar.tsx
✅ badge.tsx (styled component)
✅ breadcrumb.tsx
✅ button.tsx (styled with Radix Slot)
✅ checkbox.tsx ⚠️ CRÍTICO
✅ collapsible.tsx
✅ command.tsx
✅ context-menu.tsx
✅ dialog.tsx
✅ dropdown-menu.tsx
✅ form.tsx (react-hook-form + Radix)
✅ hover-card.tsx
✅ label.tsx
✅ menubar.tsx
✅ navigation-menu.tsx
✅ popover.tsx
✅ progress.tsx
✅ radio-group.tsx ⚠️ CRÍTICO
✅ scroll-area.tsx
✅ select.tsx
✅ separator.tsx
✅ sheet.tsx
✅ sidebar.tsx
✅ slider.tsx ⚠️ CRÍTICO
✅ switch.tsx ⚠️ CRÍTICO
✅ tabs.tsx
✅ toggle.tsx
✅ toggle-group.tsx
✅ tooltip.tsx
```

### Componentes Estilizados (12 componentes)
```
✅ alert.tsx
✅ card.tsx
✅ chart.tsx
✅ drawer.tsx
✅ input.tsx
✅ input-otp.tsx
✅ pagination.tsx
✅ resizable.tsx
✅ skeleton.tsx
✅ sonner.tsx
✅ table.tsx
✅ textarea.tsx
```

### Componentes Custom Minerva (13 componentes)
```
✅ auto-save-status.tsx
✅ avatar-group.tsx
✅ calendar.tsx
✅ file-upload-unificado.tsx
✅ file-upload-with-preview.tsx
✅ form-error.tsx
✅ form-input.tsx
✅ form-masked-input.tsx
✅ form-select.tsx
✅ form-textarea.tsx
✅ modal-header-padrao.tsx
✅ primary-button.tsx
```

## 🔍 Componentes com data-slot (42 total)

Componentes que usam `data-slot` para styling específico:
- accordion
- alert-dialog
- aspect-ratio
- avatar
- badge
- breadcrumb
- card
- carousel
- chart
- checkbox ⚠️
- collapsible
- command
- context-menu
- dialog
- drawer
- dropdown-menu
- form
- hover-card
- input
- input-otp
- label
- menubar
- navigation-menu
- pagination
- popover
- progress
- radio-group ⚠️
- resizable
- scroll-area
- select
- separator
- sheet
- skeleton
- slider ⚠️
- switch ⚠️
- table
- tabs
- textarea
- toggle
- toggle-group
- tooltip

## 🎨 Variáveis CSS Utilizadas

### Cores do Sistema Minerva
```css
--primary: #D3AF37 (Dourado)
--secondary: #DDC063 (Dourado claro)
--background: #f4f4f5
--foreground: #18181b
--border: #d4d4d8
--input: #e4e4e7
--ring: #d3af37
--accent: #fcf9f1
--muted: #f4f4f5
--card: #ffffff
--success: Verde
--warning: Amarelo
--error: Vermelho
--info: Azul
```

### Componentes que Usam Variáveis Específicas
- **Checkbox**: `--primary`, `--background`, `--border`
- **RadioGroup**: `--primary`, `--border`
- **Slider**: `--primary`, `--background`, `--border`
- **Switch**: `--primary`, `--background`
- **Dialog/Popover**: `--popover`, `--popover-foreground`
- **Card**: `--card`, `--card-foreground`

## 🚨 Arquivos CSS Atuais (Antes da Migração)

### Estrutura Atual (Problemática)
```
src/
├── index.css (280KB)
│   └── Contém: Reset, Switch inline, imports
├── styles/
│   ├── globals.css
│   ├── variables.css (38 !important)
│   └── tailwind-fix.css (82 !important) ⚠️ ÓRFÃO - NÃO IMPORTADO
```

### Problemas Identificados
1. **tailwind-fix.css** existe mas NÃO está importado em nenhum lugar
2. **152+ declarações** com `!important` espalhadas
3. **3 fontes de verdade** para Switch (index.css, tailwind-fix.css, inline)
4. **Regras muito agressivas**: `* { color: inherit !important }`
5. **CSS inline** em index.css (Switch ocupa 40+ linhas)

## 📊 Impacto em Páginas/Features

### Features que Usam Componentes Críticos

#### Checkbox
- Formulários de OS (Ordem de Serviço)
- Configurações de usuário
- Filtros de pesquisa
- Seleção de permissões

#### RadioGroup
- Seletor de tipo de OS
- Configurações de turno
- Filtros de status

#### Slider
- Ajuste de prioridade
- Configurações de UI

#### Switch
- Toggle de status
- Configurações on/off
- Dark mode (futuro?)

#### Color Selector (modal-criar-turno.tsx)
- **Problema conhecido**: Botões de cor invisíveis
- **Causa**: CSS forçando `background-color: #ffffff !important` em buttons
- **Usa**: Variáveis de cor do sistema

## 📝 Checklist de Validação Pós-Migração

### Testes Visuais Obrigatórios
- [ ] Checkbox mostra check mark ao clicar
- [ ] Checkbox mantém check mark visível
- [ ] RadioGroup mostra círculo ao selecionar
- [ ] Slider mostra preenchimento (range)
- [ ] Slider thumb é visível e arrastável
- [ ] Switch muda de cor ao ativar
- [ ] Switch thumb se move suavemente
- [ ] Color selector mostra todas as cores
- [ ] Dialog abre e fecha corretamente
- [ ] Popover posiciona corretamente

### Testes de Integração
- [ ] Modal Criar Turno - cores visíveis
- [ ] Formulário OS - todos os inputs funcionam
- [ ] Configurações - switches e checkboxes funcionam
- [ ] Filtros - radio groups e checkboxes funcionam

### Testes de Acessibilidade
- [ ] Todos os componentes navegáveis por teclado
- [ ] Estados focus visíveis
- [ ] Contrast ratio mantido (WCAG AA)
- [ ] Screen readers funcionam

## 🎯 Arquivos a Serem Criados (Nova Estrutura)

```
src/styles/
├── layers.css                          # Define ordem das camadas
├── base/
│   ├── reset.css                       # CSS reset moderno
│   ├── variables.css                   # HSL sem !important
│   └── typography.css                  # Fontes e textos
├── components/
│   ├── radix/
│   │   ├── checkbox.css               # ⚠️ CRÍTICO
│   │   ├── radio-group.css            # ⚠️ CRÍTICO
│   │   ├── slider.css                 # ⚠️ CRÍTICO
│   │   ├── switch.css                 # ⚠️ CRÍTICO
│   │   ├── dialog.css
│   │   ├── popover.css
│   │   ├── select.css
│   │   ├── accordion.css
│   │   └── ...
│   └── custom/
│       ├── color-selector.css         # Para modal-criar-turno
│       ├── form-components.css
│       └── ...
└── overrides/
    └── specificity-fixes.css           # Mínimo de !important
```

## 📅 Timeline de Migração

### FASE 0: Preparação ✅
- [x] Feature branch criada
- [x] Backup completo (backups/styles-backup-20251201/)
- [x] Documentação de componentes
- [ ] Screenshots baseline

### FASE 1: Nova Estrutura (2 dias)
- [ ] Criar layers.css
- [ ] Criar base/reset.css
- [ ] Criar base/variables.css (HSL, sem !important)
- [ ] Criar base/typography.css

### FASE 2: Radix UI (3-4 dias)
- [ ] Dia 1: Checkbox, RadioGroup, Switch
- [ ] Dia 2: Slider
- [ ] Dia 3: Dialog, Popover
- [ ] Dia 4: Select, Accordion

### FASE 3: Custom (2 dias)
- [ ] Migrar componentes custom Minerva
- [ ] Migrar color-selector

### FASE 4: index.css (1 dia)
- [ ] Limpar e reorganizar
- [ ] Importar nova estrutura

### FASE 5: Testes (2 dias)
- [ ] Testes visuais
- [ ] Testes de integração
- [ ] Comparação com baseline

### FASE 6: Limpeza (1 dia)
- [ ] Deletar tailwind-fix.css
- [ ] Remover CSS inline de index.css
- [ ] Documentação final

## 🔗 Referências

- **Plano Completo**: `C:\Users\Usuario\.claude\plans\clever-singing-quail.md`
- **Backup**: `backups/styles-backup-20251201/`
- **Componentes**: `src/components/ui/`
- **Radix UI Docs**: https://www.radix-ui.com/
- **Tailwind CSS Docs**: https://tailwindcss.com/

---

**Nota**: Este documento será atualizado conforme a migração progride.
