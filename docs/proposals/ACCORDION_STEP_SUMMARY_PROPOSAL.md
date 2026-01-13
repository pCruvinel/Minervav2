# 📋 Proposta: Accordion de Resumo de Etapas

> **Versão:** 1.0  
> **Data:** 2026-01-09  
> **Status:** Proposta de Design  
> **Autor:** Análise Técnica

---

## 1. Contexto

### Problema Atual
O sistema de **"Voltar"** no stepper permite navegar para etapas anteriores, mas:
- Requer múltiplos cliques para revisar dados
- Não oferece visão consolidada do que foi preenchido
- Carrega componentes de formulário completos (pesado)
- Modo histórico pode confundir usuários (precisam "voltar para onde estavam")

### Proposta
Substituir/complementar o sistema de navegação histórica por um **Accordion Colapsável** que exibe um resumo read-only de todas as etapas preenchidas.

---

## 2. Conceito Visual

### 2.1 Layout Proposto

```
┌─────────────────────────────────────────────────────────────────────┐
│  📋 OS-01-0042 - Perícia de Fachada                    [Em Andamento]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ✅ Etapa 1: Identifique o Lead                            [▼]  ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │  • Cliente: Condomínio Solar I                                  ││
│  │  • CPF/CNPJ: 12.345.678/0001-00                                 ││
│  │  • Email: sindico@solar.com                                      ││
│  │  • Tipo Edificação: Residencial                                  ││
│  │  • Blocos: 3 | Unidades: 120 | Pavimentos: 12                   ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ✅ Etapa 2: Seleção do Tipo de OS                         [▼]  ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │  • Tipo: OS-01 Perícia de Fachada                               ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ✅ Etapa 3: Follow-up 1 (Entrevista Inicial)              [▼]  ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │  • Idade da Edificação: 15 anos                                  ││
│  │  • Motivo da Procura: Infiltrações na fachada                   ││
│  │  • Grau de Urgência: Alto                                        ││
│  │  • 📎 3 anexos                                                   ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ 🔵 Etapa 4: Agendar Visita Técnica             [ETAPA ATUAL]   ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │  ┌──────────────────────────────────────────────────────────┐   ││
│  │  │           [FORMULÁRIO DA ETAPA 4 AQUI]                   │   ││
│  │  │                                                           │   ││
│  │  │  Data do Agendamento: [📅 Selecionar data]               │   ││
│  │  │                                                           │   ││
│  │  └──────────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ 🔒 Etapa 5: Realizar Visita                               [▢]  ││
│  │     (Bloqueado - Complete a etapa anterior)                     ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│                        [← Anterior]  [Próxima Etapa →]              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Estados do Accordion Item

| Estado | Ícone | Background | Comportamento |
|--------|-------|------------|---------------|
| **Concluída** | ✅ | `bg-success/5` | Expandível (resumo read-only) |
| **Atual** | 🔵 | `bg-primary/10` | Sempre expandido (formulário editável) |
| **Pendente** | ⏳ | `bg-muted/30` | Colapsada, não expandível |
| **Bloqueada** | 🔒 | `bg-muted/50` | Colapsada, não expandível |

---

## 3. Benefícios

### 3.1 UX/UI

| Aspecto | Sistema Atual (Stepper + Voltar) | Proposta (Accordion) |
|---------|----------------------------------|----------------------|
| Visão Geral | ❌ Precisa clicar em cada etapa | ✅ Tudo visível na mesma página |
| Navegação | Múltiplos cliques | Scroll + Expand |
| Contexto | Perde ao navegar | Mantém sempre |
| Mobile | Stepper muito pequeno | Accordion responsivo nativo |
| Performance | Carrega formulários inteiros | Apenas resumos (leve) |

### 3.2 Técnicos

- **Menor Rerendering**: Apenas resumos são exibidos, não formulários completos
- **Estado Simplificado**: Remove necessidade de `lastActiveStep`, `isHistoricalNavigation`
- **Manutenção**: Um padrão único de exibição para todas as OS
- **Acessibilidade**: Tag `<details>` nativa ou Radix Accordion com ARIA

### 3.3 Escalabilidade

- Fácil adicionar novas OS com qualquer número de etapas
- Configuração via dados (não precisa alterar UI para cada OS)
- Reutilizável entre OS 1-13 sem adaptações

---

## 4. Arquitetura Proposta

### 4.1 Novos Componentes

```
src/components/os/shared/
├── components/
│   ├── workflow-accordion.tsx           # Container principal
│   ├── workflow-accordion-item.tsx      # Item individual
│   ├── workflow-step-summary.tsx        # Resumo read-only
│   └── workflow-step-form.tsx           # Wrapper para formulário editável
```

### 4.2 Interface do Componente Principal

```typescript
// workflow-accordion.tsx

interface WorkflowAccordionProps {
  steps: WorkflowStepDefinition[];     // Definição das etapas
  currentStep: number;                  // Etapa ativa
  formDataByStep: Record<number, any>; // Dados de todas as etapas
  completedSteps: number[];             // Etapas concluídas
  onStepChange: (step: number) => void; // Callback ao mudar etapa
  renderForm: (step: number) => ReactNode; // Renderizador do formulário
  renderSummary: (step: number, data: any) => ReactNode; // Renderizador do resumo
}

export function WorkflowAccordion({
  steps,
  currentStep,
  formDataByStep,
  completedSteps,
  onStepChange,
  renderForm,
  renderSummary
}: WorkflowAccordionProps) {
  return (
    <Accordion type="single" value={`step-${currentStep}`} className="space-y-2">
      {steps.map((step) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = step.id === currentStep;
        const isAccessible = isCompleted || isCurrent;
        
        return (
          <AccordionItem 
            key={step.id} 
            value={`step-${step.id}`}
            disabled={!isAccessible}
          >
            <AccordionTrigger className={cn(
              "px-4 py-3 rounded-lg",
              isCompleted && "bg-success/5 border-success/20",
              isCurrent && "bg-primary/10 border-primary/30",
              !isAccessible && "bg-muted/30 opacity-50"
            )}>
              <div className="flex items-center gap-3">
                {/* Ícone de status */}
                {isCompleted ? <Check className="text-success" /> : 
                 isCurrent ? <Circle className="text-primary" /> : 
                 <Lock className="text-muted-foreground" />}
                
                {/* Título */}
                <span className="font-medium">
                  Etapa {step.id}: {step.title}
                </span>
                
                {/* Badge */}
                {isCurrent && (
                  <Badge variant="default">Atual</Badge>
                )}
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="px-4 pb-4">
              {isCurrent ? (
                // Formulário editável
                renderForm(step.id)
              ) : isCompleted ? (
                // Resumo read-only
                renderSummary(step.id, formDataByStep[step.id])
              ) : null}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
```

### 4.3 Componente de Resumo Genérico

```typescript
// workflow-step-summary.tsx

interface SummaryField {
  label: string;
  value: string | number | boolean | undefined;
  type?: 'text' | 'date' | 'currency' | 'boolean' | 'list' | 'files';
}

interface WorkflowStepSummaryProps {
  fields: SummaryField[];
}

export function WorkflowStepSummary({ fields }: WorkflowStepSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      {fields.map((field, idx) => (
        <div key={idx} className="flex gap-2">
          <span className="text-muted-foreground">{field.label}:</span>
          <span className="font-medium">
            {formatValue(field.value, field.type)}
          </span>
        </div>
      ))}
    </div>
  );
}

function formatValue(value: any, type?: string) {
  if (value === undefined || value === null) return '-';
  
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(value);
    case 'date':
      return new Date(value).toLocaleDateString('pt-BR');
    case 'boolean':
      return value ? 'Sim' : 'Não';
    case 'list':
      return Array.isArray(value) ? value.join(', ') : value;
    case 'files':
      return Array.isArray(value) ? `📎 ${value.length} anexos` : '-';
    default:
      return String(value);
  }
}
```

### 4.4 Configuração de Resumo por OS

```typescript
// os-summary-configs.ts

export const OS_01_04_SUMMARY_CONFIG: Record<number, (data: any) => SummaryField[]> = {
  1: (data) => [
    { label: 'Cliente', value: data.nome },
    { label: 'CPF/CNPJ', value: data.cpfCnpj },
    { label: 'Email', value: data.email },
    { label: 'Telefone', value: data.telefone },
    { label: 'Tipo Edificação', value: data.tipoEdificacao },
    { label: 'Blocos', value: data.qtdBlocos },
    { label: 'Unidades', value: data.qtdUnidades },
    { label: 'CEP', value: data.cep },
    { label: 'Endereço', value: `${data.endereco}, ${data.numero}` },
    { label: 'Cidade/UF', value: `${data.cidade}/${data.estado}` },
  ],
  
  2: (data) => [
    { label: 'Tipo de OS', value: data.tipoOS },
  ],
  
  3: (data) => [
    { label: 'Idade Edificação', value: data.idadeEdificacao },
    { label: 'Motivo da Procura', value: data.motivoProcura },
    { label: 'Grau de Urgência', value: data.grauUrgencia },
    { label: 'Escopo Existente', value: data.existeEscopo },
    { label: 'Anexos', value: data.anexos, type: 'files' },
  ],
  
  // ... configurações para etapas 4-15
};

export const OS_05_06_SUMMARY_CONFIG: Record<number, (data: any) => SummaryField[]> = {
  // Configurações específicas para OS 5-6
};

// etc para cada tipo de OS
```

---

## 5. Uso em Página de Workflow

### Exemplo: OS 1-4 com Accordion

```tsx
// os-details-workflow-page.tsx (refatorado)

import { WorkflowAccordion } from '@/components/os/shared/components/workflow-accordion';
import { WorkflowStepSummary } from '@/components/os/shared/components/workflow-step-summary';
import { OS_01_04_SUMMARY_CONFIG } from '@/lib/constants/os-summary-configs';

export function OSDetailsWorkflowPage({ osId }) {
  const { currentStep, formDataByStep, completedSteps } = useWorkflowState({ osId });
  
  // Renderizar resumo baseado na configuração
  const renderSummary = (step: number, data: any) => {
    const configFn = OS_01_04_SUMMARY_CONFIG[step];
    if (!configFn) return null;
    
    const fields = configFn(data);
    return <WorkflowStepSummary fields={fields} />;
  };
  
  // Renderizar formulário da etapa atual
  const renderForm = (step: number) => {
    switch (step) {
      case 1: return <LeadCadastro {...props} />;
      case 2: return <StepSelecaoTipo {...props} />;
      case 3: return <StepFollowup1 {...props} />;
      // ...
      default: return null;
    }
  };
  
  return (
    <WorkflowAccordion
      steps={OS_WORKFLOW_STEPS}
      currentStep={currentStep}
      formDataByStep={formDataByStep}
      completedSteps={completedSteps}
      onStepChange={setCurrentStep}
      renderForm={renderForm}
      renderSummary={renderSummary}
    />
  );
}
```

---

## 6. Sistema de Adendos (Append-Only)

### 6.1 Conceito

O sistema de adendos permite **adicionar informações complementares** às respostas já enviadas, sem permitir edição ou exclusão do conteúdo original. Isso garante:

- **Auditoria completa**: Todo histórico preservado
- **Compliance**: Dados originais imutáveis
- **Rastreabilidade**: Quem adicionou, quando e o quê

### 6.2 Regras de Negócio

| Ação | Permitida? | Descrição |
|------|:----------:|-----------|
| Ver resposta original | ✅ | Sempre visível |
| Editar resposta original | ❌ | **Proibido** |
| Excluir resposta original | ❌ | **Proibido** |
| Adicionar adendo | ✅ | Permitido para etapas concluídas |
| Editar adendo | ❌ | **Proibido** após salvar |
| Excluir adendo | ❌ | **Proibido** |

### 6.3 Modelo de Dados

```sql
-- Nova tabela para adendos
CREATE TABLE os_etapas_adendos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  etapa_id uuid REFERENCES os_etapas(id) NOT NULL,
  campo_referencia text NOT NULL,           -- Ex: 'motivoProcura', 'observacoes'
  conteudo text NOT NULL,                    -- Texto do adendo
  criado_por_id uuid REFERENCES colaboradores(id) NOT NULL,
  criado_em timestamptz DEFAULT now() NOT NULL,
  
  -- Índices para performance
  CONSTRAINT fk_etapa FOREIGN KEY (etapa_id) REFERENCES os_etapas(id) ON DELETE CASCADE
);

-- Índice para busca rápida
CREATE INDEX idx_adendos_etapa ON os_etapas_adendos(etapa_id);

-- RLS: Apenas leitura para todos, insert para colaboradores autenticados
ALTER TABLE os_etapas_adendos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Adendos são visíveis para todos autenticados"
  ON os_etapas_adendos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Colaboradores podem adicionar adendos"
  ON os_etapas_adendos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = criado_por_id);

-- IMPORTANTE: Sem UPDATE ou DELETE policies = imutável!
```

### 6.4 Interface TypeScript

```typescript
// types/os-adendos.ts

interface EtapaAdendo {
  id: string;
  etapa_id: string;
  campo_referencia: string;    // Campo que está sendo complementado
  conteudo: string;
  criado_por_id: string;
  criado_por_nome?: string;    // Join com colaboradores
  criado_em: string;           // ISO timestamp
}

// Estrutura de dados da etapa com adendos
interface EtapaDataWithAdendos {
  dados_originais: Record<string, any>;  // Dados originais (imutáveis)
  adendos: EtapaAdendo[];                // Lista de adendos
}
```

### 6.5 Conceito Visual

```
┌─────────────────────────────────────────────────────────────────────┐
│ ✅ Etapa 3: Follow-up 1 (Entrevista Inicial)                   [▼] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Motivo da Procura:                                                  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Infiltrações na fachada frontal do bloco A, com             │  │
│  │ manchas de umidade visíveis nos apartamentos do 3º andar.   │  │
│  │                                         📅 02/01/2026 14:30 │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─── ADENDO ──────────────────────────────────────────────────┐   │
│  │ 🔵 Complemento: Cliente informou que as infiltrações       │   │
│  │    também afetam o bloco B, identificadas após a           │   │
│  │    primeira visita.                                         │   │
│  │                        👤 João Silva | 📅 05/01/2026 09:15 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─── ADENDO ──────────────────────────────────────────────────┐   │
│  │ 🔵 Complemento: Síndico solicitou prioridade máxima        │   │
│  │    devido a assembleia marcada para 15/01.                  │   │
│  │                       👤 Maria Costa | 📅 07/01/2026 16:40 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  [ + Adicionar Adendo ]                                              │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                      │
│  Grau de Urgência:                                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Alto                                           📅 02/01/2026 │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  [ + Adicionar Adendo ]                                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.6 Diferenciação Visual (Cores)

```css
/* Design System - Adendos */

/* Resposta Original */
.step-field-value {
  @apply text-foreground;           /* Cor padrão do texto */
  @apply bg-muted/30;               /* Fundo sutil */
  @apply border border-border;
  @apply rounded-md p-3;
}

/* Adendo - Destaque Visual */
.step-field-adendo {
  @apply text-primary;              /* 🔵 Azul primário */
  @apply bg-primary/5;              /* Fundo azul muito suave */
  @apply border-l-4 border-primary; /* Borda esquerda destacada */
  @apply rounded-r-md p-3 ml-4;     /* Indentação + arredondamento */
}

/* Ícone de adendo */
.adendo-icon {
  @apply text-primary;
  @apply mr-2;
}

/* Metadados do adendo (autor, data) */
.adendo-metadata {
  @apply text-xs text-muted-foreground;
  @apply mt-2 flex justify-end gap-3;
}
```

### 6.7 Componente de Campo com Adendos

```tsx
// workflow-field-with-adendos.tsx

interface FieldWithAdendosProps {
  label: string;
  campoKey: string;
  valorOriginal: string;
  dataOriginal: string;
  adendos: EtapaAdendo[];
  etapaId: string;
  canAddAdendo: boolean;      // Permitir adicionar? (ex: etapa concluída)
  onAdendoAdded?: () => void;
}

export function FieldWithAdendos({
  label,
  campoKey,
  valorOriginal,
  dataOriginal,
  adendos,
  etapaId,
  canAddAdendo,
  onAdendoAdded
}: FieldWithAdendosProps) {
  const [isAddingAdendo, setIsAddingAdendo] = useState(false);
  const [novoAdendo, setNovoAdendo] = useState('');
  
  const handleSaveAdendo = async () => {
    if (!novoAdendo.trim()) return;
    
    const { error } = await supabase
      .from('os_etapas_adendos')
      .insert({
        etapa_id: etapaId,
        campo_referencia: campoKey,
        conteudo: novoAdendo.trim(),
        criado_por_id: currentUser.id
      });
    
    if (!error) {
      toast.success('Adendo adicionado com sucesso!');
      setNovoAdendo('');
      setIsAddingAdendo(false);
      onAdendoAdded?.();
    }
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <Label className="text-sm font-medium text-muted-foreground">
        {label}
      </Label>
      
      {/* Valor Original - Imutável */}
      <div className="step-field-value">
        <p>{valorOriginal}</p>
        <span className="text-xs text-muted-foreground mt-2 block text-right">
          📅 {formatDate(dataOriginal)}
        </span>
      </div>
      
      {/* Lista de Adendos */}
      {adendos
        .filter(a => a.campo_referencia === campoKey)
        .sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime())
        .map(adendo => (
          <div key={adendo.id} className="step-field-adendo">
            <div className="flex items-start gap-2">
              <Plus className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-primary">{adendo.conteudo}</p>
            </div>
            <div className="adendo-metadata">
              <span>👤 {adendo.criado_por_nome}</span>
              <span>📅 {formatDateTime(adendo.criado_em)}</span>
            </div>
          </div>
        ))
      }
      
      {/* Botão/Form para Adicionar Adendo */}
      {canAddAdendo && !isAddingAdendo && (
        <Button 
          variant="ghost" 
          size="sm"
          className="text-primary hover:text-primary/80"
          onClick={() => setIsAddingAdendo(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar Adendo
        </Button>
      )}
      
      {isAddingAdendo && (
        <div className="space-y-2 ml-4 border-l-2 border-primary/30 pl-3">
          <Textarea
            placeholder="Digite o complemento à informação original..."
            value={novoAdendo}
            onChange={(e) => setNovoAdendo(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setIsAddingAdendo(false);
                setNovoAdendo('');
              }}
            >
              Cancelar
            </Button>
            <Button 
              size="sm"
              onClick={handleSaveAdendo}
              disabled={!novoAdendo.trim()}
            >
              <Check className="h-4 w-4 mr-1" />
              Salvar Adendo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 6.8 Hook para Gerenciar Adendos

```typescript
// use-etapa-adendos.ts

export function useEtapaAdendos(etapaId: string | undefined) {
  const [adendos, setAdendos] = useState<EtapaAdendo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchAdendos = useCallback(async () => {
    if (!etapaId) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('os_etapas_adendos')
      .select(`
        *,
        colaborador:criado_por_id(nome)
      `)
      .eq('etapa_id', etapaId)
      .order('criado_em', { ascending: true });
    
    if (!error && data) {
      setAdendos(data.map(a => ({
        ...a,
        criado_por_nome: a.colaborador?.nome
      })));
    }
    setIsLoading(false);
  }, [etapaId]);
  
  useEffect(() => {
    fetchAdendos();
  }, [fetchAdendos]);
  
  const addAdendo = async (campoReferencia: string, conteudo: string) => {
    const { data, error } = await supabase
      .from('os_etapas_adendos')
      .insert({
        etapa_id: etapaId,
        campo_referencia: campoReferencia,
        conteudo: conteudo.trim(),
        criado_por_id: currentUser.id
      })
      .select()
      .single();
    
    if (!error && data) {
      await fetchAdendos(); // Refresh list
      return data;
    }
    
    throw error;
  };
  
  return {
    adendos,
    isLoading,
    addAdendo,
    refreshAdendos: fetchAdendos
  };
}
```

### 6.9 Regras de Permissão

```typescript
// Quem pode adicionar adendos?
const canAddAdendo = useMemo(() => {
  // Etapa deve estar concluída
  if (!isCompleted) return false;
  
  // OS não pode estar cancelada
  if (os.status_geral === 'cancelado') return false;
  
  // Usuário deve ter permissão no setor da OS
  const userHasPermission = 
    currentUser.cargo === 'admin' ||
    currentUser.cargo === 'diretor' ||
    currentUser.setor_slug === os.setor_atual_slug;
  
  return userHasPermission;
}, [isCompleted, os.status_geral, currentUser]);
```

### 6.10 Audit Trail

Cada adendo é automaticamente rastreado com:

| Campo | Origem | Descrição |
|-------|--------|-----------|
| `criado_por_id` | `auth.uid()` | Quem adicionou |
| `criado_em` | `now()` | Quando foi adicionado |
| `campo_referencia` | Input | Qual campo está complementando |
| `conteudo` | Input | O texto do adendo |

---

## 7. Migração Incremental

### Fase 1: Componentes Base
- [ ] Criar `WorkflowAccordion`
- [ ] Criar `WorkflowStepSummary`
- [ ] Criar configurações de resumo para OS 1-4

### Fase 2: Sistema de Adendos
- [ ] Criar tabela `os_etapas_adendos` no Supabase
- [ ] Criar hook `useEtapaAdendos`
- [ ] Criar componente `FieldWithAdendos`
- [ ] Adicionar estilos no Design System

### Fase 3: Implementar em OS Piloto
- [ ] Testar em OS-11 (6 etapas - mais simples)
- [ ] Validar UX com usuários

### Fase 4: Migrar OS 1-4
- [ ] Substituir Stepper + navegação histórica por Accordion
- [ ] Manter Stepper como opção (toggle para usuários que preferem)

### Fase 5: Padronizar Todas as OS
- [ ] Migrar OS 5-6, 7, 8, 9, 10, 12, 13
- [ ] Criar configurações de resumo para cada

---

## 8. Considerações

### 7.1 O que Manter
- **Stepper horizontal** (opcional): Pode ser mantido acima do Accordion para visão rápida de progresso geral
- **Hooks existentes**: `useWorkflowState` continua válido para gerenciar estado

### 7.2 O que Remover/Simplificar
- `lastActiveStep` - Não mais necessário
- `isHistoricalNavigation` - Não mais necessário
- `handleReturnToActive` - Não mais necessário
- `readOnlyMode` no Footer - Accordion cuida disso automaticamente

### 7.3 Compatibilidade
- Accordion usa `<Accordion>` do Radix UI (já disponível via shadcn)
- Responsivo por padrão
- Acessível (ARIA compliant)

---

## 9. Próximos Passos

1. **Aprovação do conceito** ← Você está aqui
2. Prototipação do componente `WorkflowAccordion`
3. Implementação em OS-11 (piloto)
4. Testes de usabilidade
5. Rollout para demais OS

---

## 10. Conclusão

A proposta do **Accordion** é:

| Critério | Avaliação |
|----------|-----------|
| **Eficiência** | ✅ Menos cliques para revisar dados |
| **Robustez** | ✅ Estado simplificado, menos edge cases |
| **Escalabilidade** | ✅ Configurável para qualquer número de etapas |
| **Manutenção** | ✅ Um padrão único para todas as OS |
| **UX Mobile** | ✅ Accordion é nativo e responsivo |

**Recomendação:** Aprovar e iniciar implementação na próxima sprint como melhoria de UX do módulo de OS.
