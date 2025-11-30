# Sistema de Modais - Minerva Design System

## Visão Geral

O sistema de modais do Minerva foi aprimorado para proporcionar consistência visual e facilidade de manutenção. Este documento descreve os novos componentes e padrões implementados.

## Componentes Criados

### 1. ModalHeaderPadrao

Componente padronizado para headers de modais com temas pré-definidos.

#### Uso Básico

```tsx
import { ModalHeaderPadrao } from '../ui/modal-header-padrao';
import { Briefcase } from 'lucide-react';

// Tema de criação (azul-roxo)
<ModalHeaderPadrao
  title="Criar Novo Item"
  description="Preencha os dados abaixo"
  icon={Briefcase}
  theme="create"
/>

// Tema de confirmação (verde)
<ModalHeaderPadrao
  title="Confirmar Ação"
  description="Esta ação não pode ser desfeita"
  theme="confirm"
/>
```

#### Props

| Prop | Tipo | Descrição | Padrão |
|------|------|-----------|---------|
| `title` | `string` | Título do modal | **Obrigatório** |
| `description` | `string` | Descrição opcional | - |
| `icon` | `LucideIcon` | Ícone do Lucide React | - |
| `theme` | `ModalTheme` | Tema visual | `'create'` |
| `customGradient` | `CustomGradient` | Gradiente customizado | - |

#### Temas Disponíveis

- **`create`**: Azul-roxo (criação/edição)
- **`confirm`**: Verde (confirmações/sucessos)
- **`warning`**: Âmbar (avisos)
- **`error`**: Vermelho (erros)
- **`info`**: Ciano (informações)

### 2. Sistema de Temas (`modal-themes.ts`)

Arquivo centralizado com todas as configurações de cores e estilos.

#### Estrutura

```tsx
export const modalThemes = {
  create: {
    gradient: 'from-blue-500 to-purple-600',
    textColor: 'text-blue-50',
    iconBg: 'bg-blue-500/20',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50',
    accentColor: 'text-blue-600'
  },
  // ... outros temas
};
```

#### Gradientes Customizados

```tsx
export const customGradients = {
  'blue-purple': 'from-blue-500 to-purple-600',
  'green-emerald': 'from-green-500 to-emerald-600',
  'purple-pink': 'from-purple-500 to-pink-600',
  'orange-red': 'from-orange-500 to-red-600',
  'teal-cyan': 'from-teal-500 to-cyan-600'
};
```

### 3. MetricCard com Variantes para Modal

O componente MetricCard foi aprimorado com variantes específicas para uso em modais.

#### Variantes

```tsx
// Compacto - para espaços reduzidos
<MetricCard
  title="Total"
  value="1.234"
  icon={DollarSign}
  modalVariant="compact"
/>

// Destaque - com borda e fundo especial
<MetricCard
  title="Receita"
  value="R$ 50.000"
  icon={TrendingUp}
  modalVariant="highlight"
/>

// Minimalista - sem trend e mais limpo
<MetricCard
  title="Clientes"
  value="89"
  icon={Users}
  modalVariant="minimal"
/>
```

#### Características das Variantes

| Variante | Tamanho Ícone | Tamanho Título | Tamanho Valor | Espaçamento | Destaques |
|----------|---------------|----------------|---------------|-------------|-----------|
| `compact` | `w-8 h-8` | `text-xs` | `text-xl` | `mb-2` | Ícones menores |
| `highlight` | `w-10 h-10` | `text-sm` | `text-2xl` | `mb-3` | Fundo gradiente, borda |
| `minimal` | `w-6 h-6` | `text-xs` | `text-lg` | `mb-1` | Sem trend, mais clean |

## Migração dos Modais Existentes

### Antes (Padrão Antigo)

```tsx
<div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-lg">
  <DialogHeader>
    <DialogTitle className="text-white text-2xl font-semibold">
      Título do Modal
    </DialogTitle>
    <DialogDescription className="text-blue-50 mt-2">
      Descrição
    </DialogDescription>
  </DialogHeader>
</div>
```

### Depois (Novo Padrão)

```tsx
<ModalHeaderPadrao
  title="Título do Modal"
  description="Descrição"
  icon={IconComponent}
  theme="create"
/>
```

## Benefícios da Migração

### 1. **Consistência Visual**
- Todos os modais seguem o mesmo padrão
- Cores e espaçamentos padronizados
- Ícones posicionados consistentemente

### 2. **Manutenibilidade**
- Mudanças de tema afetam todos os modais
- Centralização das configurações visuais
- Fácil adição de novos temas

### 3. **Desenvolvimento Acelerado**
- Menos código boilerplate
- Props tipadas e autocompletadas
- Documentação integrada

### 4. **Acessibilidade**
- Estrutura semântica mantida
- Contraste de cores adequado
- Navegação por teclado preservada

## Exemplos de Implementação

### Modal de Criação

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-md p-0">
    <ModalHeaderPadrao
      title="Criar Novo Turno"
      description="Configure os detalhes do turno"
      icon={Briefcase}
      theme="create"
    />

    <div className="p-6">
      {/* Conteúdo do modal */}
    </div>

    <DialogFooter className="p-6">
      {/* Botões */}
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Modal de Confirmação

```tsx
<ModalHeaderPadrao
  title="Confirmar Exclusão"
  description="Esta ação não pode ser desfeita"
  icon={AlertTriangle}
  theme="warning"
/>
```

### Modal de Sucesso

```tsx
<ModalHeaderPadrao
  title="Operação Concluída"
  description="Os dados foram salvos com sucesso"
  icon={CheckCircle}
  theme="confirm"
/>
```

## Boas Práticas

### 1. Escolha do Tema Adequado
- **Create**: Para formulários de criação/edição
- **Confirm**: Para ações positivas e confirmações
- **Warning**: Para alertas e ações destrutivas
- **Error**: Para estados de erro
- **Info**: Para informações neutras

### 2. Uso de Ícones
- Use ícones do Lucide React
- Mantenha consistência semântica
- Ícones devem ser relacionados ao contexto

### 3. Descrições
- Seja conciso e claro
- Explique o propósito da ação
- Use linguagem acessível

### 4. Responsividade
- Teste em diferentes tamanhos de tela
- Considere o contexto de uso (desktop/mobile)

## Arquivos Relacionados

- `src/components/ui/modal-header-padrao.tsx` - Componente principal
- `src/lib/modal-themes.ts` - Configurações de temas
- `src/components/dashboard/metric-card.tsx` - MetricCard aprimorado
- `src/components/ui/dialog.tsx` - Dialog base (Shadcn UI)

## Próximos Passos

1. Migrar modais restantes para o novo padrão
2. Criar mais variantes de tema se necessário
3. Implementar testes automatizados
4. Documentar casos de uso específicos