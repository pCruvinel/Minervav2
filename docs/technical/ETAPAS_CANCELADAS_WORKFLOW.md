# 📋 STATUS 'CANCELADA' NAS ETAPAS DO WORKFLOW

**Data:** 24 de novembro de 2025
**Contexto:** Implementação do status 'cancelada' para etapas do workflow
**Status:** Implementado e Documentado

---

## 🎯 OBJETIVO

Implementar o status 'cancelada' nas etapas do workflow para que, quando uma OS for cancelada, todas as suas etapas sejam automaticamente marcadas como canceladas, impedindo qualquer edição futura mas permitindo visualização histórica.

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### 1. Tipos TypeScript Atualizados

#### `src/lib/types.ts`
```typescript
export type EtapaStatus =
  | 'pendente'
  | 'em_andamento'
  | 'concluida'
  | 'bloqueada'
  | 'cancelada';  // ← NOVO STATUS
```

#### `src/components/os/os-details-redesign-page.tsx`
```typescript
interface WorkflowStep {
  id: string;
  nome_etapa: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'bloqueada' | 'cancelada';  // ← Atualizado
  // ... outros campos
}
```

### 2. Lógica de Navegação Atualizada

#### Regras de Acesso para Etapas Canceladas
```typescript
const determineWorkflowAccess = (step: WorkflowStep, currentStepOrder: number) => {
  // Etapa cancelada: sempre leitura (similar a concluída, mas com visual diferente)
  if (step.status === 'cancelada') {
    return WorkflowAccessRule.COMPLETED_READ_ONLY;
  }
  // ... outras regras
};
```

### 3. Interface Visual Atualizada

#### Ícones por Status
```typescript
const getStepStatusIcon = (status: string) => {
  switch (status) {
    case 'concluida': return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'em_andamento': return <Play className="w-5 h-5 text-blue-600" />;
    case 'bloqueada': return <Lock className="w-5 h-5 text-red-600" />;
    case 'cancelada': return <X className="w-5 h-5 text-red-600" />;  // ← Novo ícone
    default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
  }
};
```

#### Cores por Status
```typescript
const getStepStatusColor = (status: string) => {
  switch (status) {
    case 'concluida': return 'bg-green-50 border-green-200 text-green-800';
    case 'em_andamento': return 'bg-blue-50 border-blue-200 text-blue-800';
    case 'bloqueada': return 'bg-red-50 border-red-200 text-red-800';
    case 'cancelada': return 'bg-red-50 border-red-200 text-red-800';  // ← Mesma cor de bloqueada
    default: return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};
```

#### Labels por Status
```typescript
<Badge variant="outline" className={getStepStatusColor(step.status)}>
  {step.status === 'concluida' ? 'Concluída' :
    step.status === 'em_andamento' ? 'Em Andamento' :
      step.status === 'bloqueada' ? 'Bloqueada' :
        step.status === 'cancelada' ? 'Cancelada' : 'Pendente'}  // ← Novo label
</Badge>
```

---

## 🔄 FLUXO DE CANCELAMENTO

### Quando uma OS é Cancelada

#### 1. Trigger no Banco de Dados
```sql
-- Função que será chamada quando status_geral da OS mudar para 'cancelada'
CREATE OR REPLACE FUNCTION cancelar_etapas_os()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a OS foi cancelada, cancela todas as etapas ativas
  IF NEW.status_geral = 'cancelada' AND OLD.status_geral != 'cancelada' THEN
    UPDATE os_etapas
    SET status = 'cancelada',
        data_conclusao = NOW(),
        updated_at = NOW()
    WHERE os_id = NEW.id
      AND status IN ('pendente', 'em_andamento', 'bloqueada');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger na tabela ordens_servico
CREATE TRIGGER trigger_cancelar_etapas_os
  AFTER UPDATE ON ordens_servico
  FOR EACH ROW
  EXECUTE FUNCTION cancelar_etapas_os();
```

#### 2. Estados das Etapas Após Cancelamento

| Status Anterior | Status Após Cancelamento | Ação |
|-----------------|--------------------------|------|
| `pendente` | `cancelada` | ✅ Cancelada |
| `em_andamento` | `cancelada` | ✅ Cancelada |
| `bloqueada` | `cancelada` | ✅ Cancelada |
| `concluida` | `concluida` | 🔄 Mantém concluída |
| `cancelada` | `cancelada` | 🔄 Já cancelada |

### Regras de Negócio

#### 1. Impossibilidade de Edição
- Etapas canceladas **não podem ser editadas**
- Botão "Ir" mostra apenas "Ver" (leitura)
- Qualquer tentativa de edição é bloqueada

#### 2. Preservação Histórica
- Dados das etapas canceladas são preservados
- Comentários e documentos permanecem acessíveis
- Timeline de atividades mantém histórico completo

#### 3. Visual Distinto
- Ícone "X" vermelho para identificação rápida
- Badge "Cancelada" em vermelho
- Fundo vermelho claro para destaque

---

## 🎨 INTERFACE DO USUÁRIO

### Estados Visuais

#### Etapa Cancelada
```
┌─────────────────────────────────────────────────┐
│  ❌ Etapa X: Nome da Etapa                      │
│  📅 Atualizado em: DD/MM/YYYY                  │
│  👤 Responsável: Nome do Usuário               │
│  💬 5 comentários  📎 2 documentos              │
│                                                 │
│  [Ver] ← Botão de visualização apenas          │
└─────────────────────────────────────────────────┘
```

#### Comparação Visual

| Status | Ícone | Cor | Botão | Ação Permitida |
|--------|-------|-----|-------|----------------|
| Concluída | ✅ | Verde | Ver | Visualização |
| Cancelada | ❌ | Vermelho | Ver | Visualização |
| Em Andamento | ▶️ | Azul | Continuar | Edição |
| Pendente | ⚠️ | Cinza | Iniciar/Ver | Dependendo da ordem |
| Bloqueada | 🔒 | Vermelho | Bloqueado | Nenhuma |

---

## 🔒 CONTROLE DE ACESSO

### Permissões por Status

#### Para Etapas Canceladas
- **Visualização:** ✅ Todos os usuários com acesso à OS
- **Edição:** ❌ Bloqueada para todos
- **Comentários:** ✅ Leitura apenas (não pode adicionar novos)
- **Documentos:** ✅ Download apenas (não pode fazer upload)

#### Validação em Código
```typescript
const validateWorkflowAccess = (step: WorkflowStep, currentStepOrder: number) => {
  if (step.status === 'cancelada') {
    return {
      canAccess: true,
      reason: 'Visualização permitida',
      accessRule: WorkflowAccessRule.COMPLETED_READ_ONLY
    };
  }
  // ... outras validações
};
```

---

## 📊 MONITORAMENTO E LOGGING

### Eventos Logados

#### Quando Etapa é Cancelada
```typescript
await supabase.rpc('registrar_atividade_os', {
  p_os_id: osId,
  p_etapa_id: step.id,
  p_usuario_id: user.id,
  p_tipo: 'etapa_cancelada',
  p_descricao: `Etapa ${step.ordem} cancelada devido ao cancelamento da OS`
});
```

#### Quando Usuário Tenta Acessar Etapa Cancelada
```typescript
await supabase.rpc('registrar_atividade_os', {
  p_os_id: osId,
  p_etapa_id: step.id,
  p_usuario_id: user.id,
  p_tipo: 'tentativa_acesso_etapa_cancelada',
  p_descricao: `Tentativa de acesso à etapa cancelada ${step.ordem}: ${step.nome_etapa}`
});
```

---

## 🧪 ESTRATÉGIA DE TESTES

### Testes Unitários
```typescript
describe('Etapas Canceladas', () => {
  test('should allow read-only access to cancelled steps', () => {
    const step = { status: 'cancelada', ordem: 1 };
    const result = validateWorkflowAccess(step, 2);
    expect(result.canAccess).toBe(true);
    expect(result.accessRule).toBe(WorkflowAccessRule.COMPLETED_READ_ONLY);
  });

  test('should show correct icon for cancelled steps', () => {
    const icon = getStepStatusIcon('cancelada');
    expect(icon).toContain('X');
  });
});
```

### Testes de Integração
```typescript
describe('OS Cancellation Flow', () => {
  test('should cancel all active steps when OS is cancelled', async () => {
    // Cancelar OS
    // Verificar que todas as etapas ativas foram marcadas como 'cancelada'
    // Verificar que etapas concluídas permaneceram concluídas
  });

  test('should prevent editing of cancelled steps', async () => {
    // Tentar editar etapa cancelada
    // Verificar que operação foi bloqueada
    // Verificar que toast de erro foi mostrado
  });
});
```

---

## 🚀 IMPLEMENTAÇÃO NO BANCO DE DADOS

### Migration SQL
```sql
-- Adicionar status 'cancelada' ao enum se necessário
-- Nota: Como estamos usando string, não precisa alterar enum no banco

-- Criar função de cancelamento
CREATE OR REPLACE FUNCTION cancelar_etapas_os()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status_geral = 'cancelada' AND OLD.status_geral != 'cancelada' THEN
    UPDATE os_etapas
    SET status = 'cancelada',
        data_conclusao = COALESCE(data_conclusao, NOW()),
        updated_at = NOW()
    WHERE os_id = NEW.id
      AND status IN ('pendente', 'em_andamento', 'bloqueada');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_cancelar_etapas_os ON ordens_servico;
CREATE TRIGGER trigger_cancelar_etapas_os
  AFTER UPDATE ON ordens_servico
  FOR EACH ROW
  EXECUTE FUNCTION cancelar_etapas_os();
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### ✅ Concluído
- [x] Adicionar 'cancelada' aos tipos TypeScript
- [x] Atualizar lógica de navegação do workflow
- [x] Implementar ícone X para etapas canceladas
- [x] Atualizar cores e labels visuais
- [x] Criar documentação técnica completa

### 🔄 Próximos Passos
- [ ] Criar migration SQL para trigger de cancelamento
- [ ] Implementar função `cancelar_etapas_os()` no Supabase
- [ ] Testar fluxo completo de cancelamento
- [ ] Validar permissões e controles de acesso
- [ ] Atualizar documentação de usuário

---

## 🎯 RESULTADO FINAL

O status 'cancelada' nas etapas do workflow está **totalmente implementado** no frontend e preparado para integração com o backend. Quando uma OS for cancelada, todas as suas etapas serão automaticamente marcadas como canceladas, garantindo:

- **Integridade de dados** através do controle rigoroso de estados
- **Experiência consistente** com feedback visual claro
- **Preservação histórica** para auditoria e análise
- **Segurança robusta** prevenindo edições não autorizadas

**Status:** ✅ **IMPLEMENTADO NO FRONTEND**
**Próximo:** Implementar trigger no Supabase para cancelamento automático