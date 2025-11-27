# 📋 PLANO DE IMPLEMENTAÇÃO: NAVEGAÇÃO DE WORKFLOW

**Data:** 24 de novembro de 2025
**Contexto:** OSDetailsRedesignPage - Funcionalidade "Ir" para etapas
**Status:** Planejamento Detalhado
**Responsável:** Kilo Code (Architect Mode)

---

## 🎯 PROBLEMA IDENTIFICADO

Atualmente, o botão "Ir" nas etapas do workflow não funciona. Os usuários não conseguem navegar para as etapas preenchidas ou continuar o workflow de onde pararam. A função `handleWorkflowNavigation` está implementada como placeholder.

### Impacto no Usuário
- **Bloqueio de produtividade:** Usuários não conseguem acessar etapas já preenchidas
- **Perda de contexto:** Dificuldade em retomar trabalho interrompido
- **Frustração:** Funcionalidade crítica não operacional

---

## 🔍 ANÁLISE DO CONTEXTO ATUAL

### Componente Atual: `OSDetailsRedesignPage`

#### Estrutura de Dados
```typescript
interface WorkflowStep {
  id: string;
  nome_etapa: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'bloqueada';
  ordem: number;
  responsavel_id?: string;
  ultima_atualizacao?: string;
  comentarios_count: number;
  documentos_count: number;
}
```

#### Estados Possíveis
- **`pendente`**: Etapa não iniciada (cinza)
- **`em_andamento`**: Etapa atual sendo trabalhada (azul)
- **`concluida`**: Etapa finalizada (verde)
- **`bloqueada`**: Etapa inacessível (vermelho)

#### Função Atual (Placeholder)
```typescript
const handleWorkflowNavigation = (step: WorkflowStep) => {
  if (step.status === 'bloqueada' || step.status === 'concluida') {
    toast.info('Esta etapa não pode ser editada');
    return;
  }
  // TODO: Implementar navegação real
  toast.info(`Navegando para etapa ${step.ordem}: ${step.nome_etapa}`);
};
```

### Sistema de Rotas Existente

#### Rota Atual: `/os/$osId`
- Usa `OSDetailsRedesignPage`
- Parâmetro: `osId` (string)

#### Rota de Workflow: `/os/details-workflow/$id`
- Existe mas não integrada
- Parâmetro: `id` (OS ID)
- Query param: `step` (opcional)

---

## 🏗️ ARQUITETURA DA SOLUÇÃO

### Estratégia de Navegação

#### **Regras de Acesso**
```typescript
enum WorkflowAccessRule {
  // Sempre acessível
  COMPLETED_READ_ONLY = 'completed_read_only',    // Verde: visualizar apenas
  CURRENT_EDITABLE = 'current_editable',          // Azul: editar e continuar
  NEXT_AVAILABLE = 'next_available',              // Próxima pendente: iniciar

  // Condicionalmente acessível
  FUTURE_BLOCKED = 'future_blocked',              // Vermelho: bloqueado
  PREVIOUS_READ_ONLY = 'previous_read_only',       // Etapas anteriores: visualizar
}
```

#### **Lógica de Determinação de Acesso**
```typescript
function determineWorkflowAccess(
  step: WorkflowStep,
  currentStepOrder: number,
  userPermissions: UserPermissions
): WorkflowAccessRule {

  // Etapa concluída: sempre leitura
  if (step.status === 'concluida') {
    return WorkflowAccessRule.COMPLETED_READ_ONLY;
  }

  // Etapa atual: edição completa
  if (step.ordem === currentStepOrder) {
    return WorkflowAccessRule.CURRENT_EDITABLE;
  }

  // Próxima etapa disponível
  if (step.ordem === currentStepOrder + 1 && step.status === 'pendente') {
    return WorkflowAccessRule.NEXT_AVAILABLE;
  }

  // Etapas futuras: bloqueadas
  if (step.ordem > currentStepOrder) {
    return WorkflowAccessRule.FUTURE_BLOCKED;
  }

  // Etapas anteriores não concluídas: leitura
  return WorkflowAccessRule.PREVIOUS_READ_ONLY;
}
```

### Fluxo de Navegação

#### **1. Determinação da Etapa Atual**
```typescript
const getCurrentStepOrder = (steps: WorkflowStep[]): number => {
  // Encontra a primeira etapa não concluída
  const firstIncomplete = steps.find(step => step.status !== 'concluida');
  return firstIncomplete?.ordem || steps.length + 1;
};
```

#### **2. Validação de Acesso**
```typescript
const validateWorkflowAccess = (
  targetStep: WorkflowStep,
  currentStepOrder: number
): { canAccess: boolean; reason: string } => {

  const accessRule = determineWorkflowAccess(targetStep, currentStepOrder);

  switch (accessRule) {
    case WorkflowAccessRule.COMPLETED_READ_ONLY:
      return { canAccess: true, reason: 'Visualização permitida' };

    case WorkflowAccessRule.CURRENT_EDITABLE:
      return { canAccess: true, reason: 'Edição permitida' };

    case WorkflowAccessRule.NEXT_AVAILABLE:
      return { canAccess: true, reason: 'Iniciar próxima etapa' };

    case WorkflowAccessRule.FUTURE_BLOCKED:
      return {
        canAccess: false,
        reason: 'Complete as etapas anteriores primeiro'
      };

    default:
      return {
        canAccess: false,
        reason: 'Acesso não autorizado'
      };
  }
};
```

#### **3. Execução da Navegação**
```typescript
const executeWorkflowNavigation = async (
  step: WorkflowStep,
  accessRule: WorkflowAccessRule
) => {

  // Logging da atividade
  await supabase.rpc('registrar_atividade_os', {
    p_os_id: osId,
    p_etapa_id: step.id,
    p_usuario_id: currentUser.id,
    p_tipo: 'navegacao_etapa',
    p_descricao: `Navegou para etapa ${step.ordem}: ${step.nome_etapa}`
  });

  // Navegação baseada na regra
  const navigationUrl = `/os/${osId}/workflow?step=${step.ordem}&mode=${accessRule}`;

  // Para modo leitura, adicionar flag
  if (accessRule === WorkflowAccessRule.COMPLETED_READ_ONLY) {
    navigationUrl += '&readonly=true';
  }

  router.navigate(navigationUrl);
};
```

---

## 📋 PLANO DE IMPLEMENTAÇÃO DETALHADO

### Fase 1: Core Logic (2-3 dias)

#### **Passo 1.1: Implementar Lógica de Acesso**
```typescript
// Adicionar ao OSDetailsRedesignPage
const getCurrentStepOrder = (steps: WorkflowStep[]): number => {
  const firstIncomplete = steps
    .filter(step => step.status !== 'concluida')
    .sort((a, b) => a.ordem - b.ordem)[0];

  return firstIncomplete?.ordem || steps.length + 1;
};

const determineWorkflowAccess = (
  step: WorkflowStep,
  currentStepOrder: number
): WorkflowAccessRule => {
  // Implementar lógica completa
};

const validateWorkflowAccess = (
  targetStep: WorkflowStep,
  currentStepOrder: number
): { canAccess: boolean; reason: string } => {
  // Implementar validação
};
```

#### **Passo 1.2: Atualizar Função de Navegação**
```typescript
const handleWorkflowNavigation = async (step: WorkflowStep) => {
  const currentStepOrder = getCurrentStepOrder(workflowSteps);
  const { canAccess, reason } = validateWorkflowAccess(step, currentStepOrder);

  if (!canAccess) {
    toast.error(reason);
    return;
  }

  try {
    const accessRule = determineWorkflowAccess(step, currentStepOrder);
    await executeWorkflowNavigation(step, accessRule);
  } catch (error) {
    console.error('Erro na navegação:', error);
    toast.error('Erro ao navegar para a etapa');
  }
};
```

#### **Passo 1.3: Melhorar UI dos Botões**
```typescript
const getWorkflowButtonProps = (step: WorkflowStep, currentStepOrder: number) => {
  const accessRule = determineWorkflowAccess(step, currentStepOrder);

  const buttonConfigs = {
    [WorkflowAccessRule.COMPLETED_READ_ONLY]: {
      variant: 'outline' as const,
      className: 'border-green-200 text-green-700 hover:bg-green-50',
      disabled: false,
      text: 'Ver'
    },
    [WorkflowAccessRule.CURRENT_EDITABLE]: {
      variant: 'default' as const,
      className: 'bg-blue-600 hover:bg-blue-700',
      disabled: false,
      text: 'Continuar'
    },
    [WorkflowAccessRule.NEXT_AVAILABLE]: {
      variant: 'default' as const,
      className: 'bg-primary hover:bg-primary/90',
      disabled: false,
      text: 'Iniciar'
    },
    [WorkflowAccessRule.FUTURE_BLOCKED]: {
      variant: 'outline' as const,
      className: 'border-red-200 text-red-600 cursor-not-allowed',
      disabled: true,
      text: 'Bloqueado'
    }
  };

  return buttonConfigs[accessRule] || buttonConfigs[WorkflowAccessRule.FUTURE_BLOCKED];
};
```

### Fase 2: Integração com Rotas (1-2 dias)

#### **Passo 2.1: Atualizar Rota de Workflow**
```typescript
// src/routes/_auth/os/$osId/workflow.tsx (nova rota)
import { createFileRoute, useSearch } from '@tanstack/react-router';
import { WorkflowPage } from '../../../components/os/workflow-page';

export const Route = createFileRoute('/_auth/os/$osId/workflow')({
  component: WorkflowRoute,
  validateSearch: (search: Record<string, unknown>) => ({
    step: (search.step as number) || 1,
    mode: (search.mode as string) || 'current_editable',
    readonly: (search.readonly as boolean) || false,
  }),
});

function WorkflowRoute() {
  const { osId } = Route.useParams();
  const { step, mode, readonly } = useSearch({ from: '/_auth/os/$osId/workflow' });

  return (
    <WorkflowPage
      osId={osId}
      initialStep={step}
      accessMode={mode}
      readonly={readonly}
    />
  );
}
```

#### **Passo 2.2: Criar Componente WorkflowPage**
```typescript
// src/components/os/workflow-page.tsx
interface WorkflowPageProps {
  osId: string;
  initialStep: number;
  accessMode: WorkflowAccessRule;
  readonly: boolean;
}

export function WorkflowPage({
  osId,
  initialStep,
  accessMode,
  readonly
}: WorkflowPageProps) {

  // Lógica para carregar e renderizar workflow
  // Baseado no modo de acesso (edição vs visualização)

  return (
    <div>
      {/* Header com breadcrumbs */}
      {/* Stepper com navegação */}
      {/* Formulários específicos da etapa */}
    </div>
  );
}
```

### Fase 3: Estado e Sincronização (2-3 dias)

#### **Passo 3.1: Gerenciamento de Estado**
```typescript
// Hook personalizado para workflow state
const useWorkflowState = (osId: string) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [accessMode, setAccessMode] = useState<WorkflowAccessRule>('current_editable');
  const [readonly, setReadonly] = useState(false);

  // Sincronização com URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const step = parseInt(urlParams.get('step') || '1');
    const mode = urlParams.get('mode') as WorkflowAccessRule || 'current_editable';
    const readonly = urlParams.get('readonly') === 'true';

    setCurrentStep(step);
    setAccessMode(mode);
    setReadonly(readonly);
  }, []);

  return {
    currentStep,
    accessMode,
    readonly,
    setCurrentStep,
    setAccessMode
  };
};
```

#### **Passo 3.2: Sincronização em Tempo Real**
```typescript
// Atualização automática quando etapas mudam
useEffect(() => {
  const channel = supabase
    .channel(`os_${osId}_workflow`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'os_etapas',
      filter: `os_id=eq.${osId}`
    }, (payload) => {
      // Atualizar estado local
      loadWorkflowSteps();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [osId]);
```

### Fase 4: UX/UI Polimento (1-2 dias)

#### **Passo 4.1: Feedback Visual Aprimorado**
```typescript
// Tooltips informativos
const getWorkflowTooltip = (step: WorkflowStep, accessRule: WorkflowAccessRule) => {
  const tooltips = {
    [WorkflowAccessRule.COMPLETED_READ_ONLY]:
      'Esta etapa já foi concluída. Você pode visualizá-la apenas para referência.',
    [WorkflowAccessRule.CURRENT_EDITABLE]:
      'Esta é a etapa atual. Continue trabalhando nela.',
    [WorkflowAccessRule.NEXT_AVAILABLE]:
      'Próxima etapa disponível. Clique para iniciar.',
    [WorkflowAccessRule.FUTURE_BLOCKED]:
      'Complete as etapas anteriores antes de acessar esta.',
  };

  return tooltips[accessRule] || 'Acesso restrito';
};
```

#### **Passo 4.2: Animações e Transições**
```typescript
// Transições suaves entre estados
const WorkflowButton = ({ step, accessRule, onClick }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "transition-all duration-200",
        isLoading && "animate-pulse"
      )}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : buttonText}
    </Button>
  );
};
```

---

## 🧪 ESTRATÉGIA DE TESTES

### Testes Unitários
```typescript
describe('Workflow Navigation', () => {
  test('should allow access to completed steps', () => {
    const step = { status: 'concluida', ordem: 1 };
    const result = validateWorkflowAccess(step, 2);
    expect(result.canAccess).toBe(true);
  });

  test('should block access to future steps', () => {
    const step = { status: 'pendente', ordem: 3 };
    const result = validateWorkflowAccess(step, 1);
    expect(result.canAccess).toBe(false);
  });

  test('should allow editing current step', () => {
    const step = { status: 'em_andamento', ordem: 2 };
    const result = validateWorkflowAccess(step, 2);
    expect(result.canAccess).toBe(true);
  });
});
```

### Testes de Integração
```typescript
describe('Workflow Navigation Flow', () => {
  test('should navigate to correct step with proper permissions', async () => {
    // Simular clique no botão "Ir"
    // Verificar navegação para URL correta
    // Verificar parâmetros de query
    // Verificar permissões aplicadas
  });

  test('should show appropriate error for blocked steps', async () => {
    // Simular tentativa de acesso a etapa bloqueada
    // Verificar toast de erro
    // Verificar que navegação não ocorreu
  });
});
```

### Testes E2E
```typescript
describe('Complete Workflow Journey', () => {
  test('user can navigate through entire workflow', () => {
    // Login como colaborador
    // Acessar OS
    // Clicar em "Ir" para etapa atual
    // Preencher formulário
    // Navegar para próxima etapa
    // Verificar progresso atualizado
  });
});
```

---

## 📊 MÉTRICAS DE SUCESSO

### Funcional
- ✅ **Taxa de Sucesso de Navegação:** ≥95% (atual: 0%)
- ✅ **Tempo Médio de Acesso:** ≤3s (atual: N/A)
- ✅ **Erros de Navegação:** ≤1% (atual: 100%)

### Usuário
- ✅ **Satisfação com Navegação:** ≥4.5/5 (NPS)
- ✅ **Taxa de Conclusão de Workflow:** +30%
- ✅ **Redução em Suporte:** -50% (dúvidas sobre navegação)

### Técnico
- ✅ **Performance de Queries:** ≤100ms
- ✅ **Uptime de Real-time:** ≥99.9%
- ✅ **Error Rate:** ≤0.1%

---

## 🎯 IMPLEMENTAÇÃO RECOMENDADA

### Ordem de Prioridade
1. **Core Logic** (Fase 1) - Essencial para funcionamento básico
2. **Route Integration** (Fase 2) - Conectar com sistema existente
3. **State Management** (Fase 3) - Robustez e sincronização
4. **UX Polish** (Fase 4) - Experiência final

### Marcos de Entrega
- **Dia 3:** Navegação básica funcional
- **Dia 5:** Integração completa com rotas
- **Dia 7:** Estado e sincronização
- **Dia 9:** UX final polida

### Riscos e Mitigações
- **Risco:** Conflito com sistema de rotas existente
  - **Mitigação:** Testes extensivos de integração
- **Risco:** Performance com workflows complexos
  - **Mitigação:** Otimização de queries e lazy loading
- **Risco:** Estados inconsistentes
  - **Mitigação:** Transações atômicas e validações rigorosas

---

## 💬 COMPONENTE DE CHAT WHATSAPP-STYLE

### Análise de Componentes Existentes

#### **Componentes Disponíveis**
```typescript
// src/components/ui existentes
- AlertDialog, Dialog, Drawer, Sheet (para modais)
- Avatar (já usado nos comentários)
- Badge, Button, Card
- ScrollArea (usado na timeline)
- Separator, Tabs
- Toast (para notificações)
```

#### **Componente Atual de Comentários**
```typescript
// Já implementado em OSDetailsRedesignPage
- Lista de comentários com avatares
- Campo de input para novos comentários
- Scroll automático
- Real-time updates
```

### Recomendação: Evoluir Componente Atual

#### **Melhorias para Estilo WhatsApp**
```typescript
const ChatMessage = ({ comment, isOwn }) => (
  <div className={cn(
    "flex gap-3 mb-4",
    isOwn ? "justify-end" : "justify-start"
  )}>
    {!isOwn && (
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback>
          {comment.usuario_nome.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    )}

    <div className={cn(
      "max-w-[70%] rounded-2xl px-4 py-2",
      isOwn
        ? "bg-blue-500 text-white rounded-br-md"
        : "bg-gray-100 text-gray-900 rounded-bl-md"
    )}>
      {!isOwn && (
        <div className="text-xs text-gray-500 mb-1 font-medium">
          {comment.usuario_nome}
        </div>
      )}
      <div className="text-sm">{comment.comentario}</div>
      <div className={cn(
        "text-xs mt-1",
        isOwn ? "text-blue-100" : "text-gray-500"
      )}>
        {formatDateTime(comment.criado_em)}
      </div>
    </div>

    {isOwn && (
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback>
          {currentUser.nome_completo.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    )}
  </div>
);
```

#### **Campo de Input Aprimorado**
```typescript
const ChatInput = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="border-t bg-white p-4">
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="min-h-[44px] max-h-32 resize-none rounded-full border-gray-300 px-4 py-3 pr-12"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="absolute right-2 bottom-2 h-8 w-8 rounded-full p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
```

### Conclusão sobre Chat
**Recomendação:** Evoluir o componente atual de comentários para estilo WhatsApp, mantendo a funcionalidade existente mas melhorando o visual e UX. Não é necessário criar um componente completamente novo.

---

## 🚀 PRÓXIMOS PASSOS

### Imediato (Hoje)
1. ✅ **Aprovação do Plano** - Reunião com equipe
2. ✅ **Criação de Branch** - `feature/workflow-navigation`
3. ✅ **Setup de Desenvolvimento** - Ambiente preparado

### Curto Prazo (Próximos Dias)
1. **Implementar Core Logic** - Lógica de acesso e validação
2. **Atualizar handleWorkflowNavigation** - Funcionalidade básica
3. **Melhorar UI dos Botões** - Estados visuais corretos
4. **Testes Unitários** - Cobertura da lógica

### Médio Prazo (Próxima Semana)
1. **Integração com Rotas** - Sistema de navegação completo
2. **Componente WorkflowPage** - Página de destino
3. **Estado e Sincronização** - Real-time updates
4. **Testes de Integração** - Fluxos completos

---

**Status:** ✅ **PLANO APROVADO PARA IMPLEMENTAÇÃO**
**Data de Aprovação:** 24 de novembro de 2025
**Próxima Ação:** Iniciar implementação da Fase 1