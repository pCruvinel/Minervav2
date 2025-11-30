# Estilos dos Botões - Minerva Design System

## Modificação do Primary Button

### Mudança Realizada

O botão **primary** (variante `default`) foi modificado para ter o mesmo estilo visual do botão **outline**, mas com cores douradas em vez das cores padrão.

### Antes (Primary Original)
```tsx
default: "bg-primary text-primary-foreground hover:bg-primary/90"
```
- Fundo dourado sólido
- Texto branco
- Hover: fundo dourado mais escuro

### Depois (Primary Modificado)
```tsx
default: "border border-primary bg-background shadow-xs hover:bg-primary/10 hover:text-primary dark:bg-input/30 dark:border-primary dark:hover:bg-primary/20"
```
- Borda dourada
- Fundo transparente/branco
- Sombra pequena
- Hover: fundo dourado claro (10% opacity) e texto dourado
- Dark mode: fundo input/30, borda dourada, hover dourado/20

### Comparação Visual

| Aspecto | Outline (Original) | Primary (Modificado) |
|---------|-------------------|---------------------|
| **Borda** | `border` (cinza) | `border-primary` (dourada) |
| **Fundo** | `bg-background` | `bg-background` |
| **Sombra** | `shadow-xs` | `shadow-xs` |
| **Hover Fundo** | `hover:bg-accent` | `hover:bg-primary/10` |
| **Hover Texto** | `hover:text-accent-foreground` | `hover:text-primary` |
| **Dark Mode** | `dark:bg-input/30 dark:border-input dark:hover:bg-input/50` | `dark:bg-input/30 dark:border-primary dark:hover:bg-primary/20` |

### Benefícios da Mudança

1. **Consistência Visual**: Primary e Outline agora têm aparência similar
2. **Hierarquia Clara**: Primary mantém destaque através da cor dourada
3. **Acessibilidade**: Contraste mantido com borda dourada
4. **Moderno**: Estilo outline é mais clean e moderno

### Uso Recomendado

- **Primary**: Ações principais (salvar, confirmar, enviar)
- **Outline**: Ações secundárias (cancelar, voltar, editar)
- **Secondary**: Ações terciárias ou em contextos específicos
- **Destructive**: Ações perigosas (excluir, remover)

### Exemplo de Uso

```tsx
// Botão principal (dourado com estilo outline)
<Button variant="default" onClick={handleSave}>
  Salvar Alterações
</Button>

// Botão secundário (outline padrão)
<Button variant="outline" onClick={handleCancel}>
  Cancelar
</Button>
```

### Arquivo Modificado

- `src/components/ui/button.tsx` - Variante `default` atualizada

### Compatibilidade

- ✅ Mantém compatibilidade com código existente
- ✅ TypeScript intacto
- ✅ Dark mode suportado
- ✅ Responsivo
- ✅ Acessibilidade mantida