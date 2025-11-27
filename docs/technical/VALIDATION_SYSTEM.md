# Sistema de Validação - Hook useFieldValidation

## Visão Geral

O hook `useFieldValidation` é o componente central do sistema de validação de formulários do Minerva ERP v2.0. Ele integra validação Zod com componentes React, fornecendo validação em tempo real, tracking de campos tocados e feedback visual consistente.

## Arquitetura

### Localização
- **Arquivo**: `src/lib/hooks/use-field-validation.ts`
- **Dependências**: Zod (`zod`), React hooks
- **Integração**: Usado por componentes de formulário em todo o workflow OS

### Funcionalidades Principais

1. **Validação por Campo**: Valida campos individuais conforme schema Zod
2. **Validação Completa**: Valida todo o formulário antes do submit
3. **Tracking de Estado**: Monitora quais campos foram interagidos (touched)
4. **Feedback Visual**: Fornece estados de erro/sucesso para componentes UI
5. **Suporte a Schemas Refinados**: Compatível com `ZodEffects` (schemas com `.refine()`)

## API do Hook

### Interface

```typescript
interface UseFieldValidationResult {
  errors: ValidationErrors;           // Mapa campo -> mensagem de erro
  touched: TouchedFields;             // Mapa campo -> boolean (foi tocado?)
  validateField: (fieldName: string, value: any) => boolean;
  validateAll: (formData: any) => boolean;
  markFieldTouched: (fieldName: string) => void;
  markAllTouched: () => void;
  clearErrors: () => void;
  clearFieldError: (fieldName: string) => void;
  isValid: boolean;
  hasAnyTouched: boolean;
}
```

### Uso Básico

```typescript
import { useFieldValidation } from '@/lib/hooks/use-field-validation';
import { etapa1Schema } from '@/lib/validations/os-etapas-schema';

function MyFormComponent() {
  const {
    errors,
    touched,
    validateField,
    validateAll,
    markFieldTouched,
    isValid
  } = useFieldValidation(etapa1Schema);

  // Uso em componentes de input
  return (
    <FormInput
      value={formData.nome}
      onChange={(e) => {
        setFormData({...formData, nome: e.target.value});
        if (touched.nome) validateField('nome', e.target.value);
      }}
      onBlur={() => {
        markFieldTouched('nome');
        validateField('nome', formData.nome);
      }}
      error={touched.nome ? errors.nome : undefined}
      success={touched.nome && !errors.nome && formData.nome.length > 0}
    />
  );
}
```

## Suporte a Schemas Zod

### Tipos de Schema Suportados

1. **ZodObject Puro**:
   ```typescript
   const schema = z.object({
     nome: z.string().min(1, 'Nome obrigatório'),
     email: z.string().email('Email inválido')
   });
   ```

2. **ZodEffects (Refinados)**:
   ```typescript
   const schema = z.object({
     nome: z.string().min(1),
     email: z.string().email()
   }).refine(
     (data) => data.nome && data.email,
     { message: 'Nome e email são obrigatórios', path: ['nome'] }
   );
   ```

### Extração de Schema Base

Para schemas refinados, o hook utiliza uma função helper `getBaseSchema()` que extrai o `ZodObject` subjacente de um `ZodEffects`:

```typescript
function getBaseSchema(schema: z.ZodType<any>): z.ZodObject<any> {
  if (schema instanceof ZodObject) {
    return schema;
  }
  if (schema instanceof ZodEffects) {
    const innerSchema = schema._def.schema;
    if (innerSchema instanceof ZodObject) {
      return innerSchema;
    }
    return getBaseSchema(innerSchema); // Recursão para efeitos aninhados
  }
  throw new Error('Schema deve ser um ZodObject ou ZodEffects baseado em ZodObject');
}
```

## Integração com Workflow OS

### Uso no Workflow de 15 Etapas

O hook é usado em todas as etapas do workflow OS que possuem validação:

- **Etapa 1**: `etapa1Schema` (identificação do lead)
- **Etapa 3**: `etapa3Schema` (follow-up 1)
- **Etapa 6**: `etapa6Schema` (follow-up 2)
- E outras etapas com validação complexa

### Padrão de Implementação

```typescript
// No componente da etapa
const {
  errors,
  touched,
  validateField,
  validateAll,
  markFieldTouched,
  markAllTouched,
} = useFieldValidation(etapaSchema);

// Validação imperativa no handleNextStep
const handleNextStep = () => {
  markAllTouched();
  if (!validateAll(formData)) {
    toast.error('Corrija os erros antes de continuar');
    return;
  }
  // Prosseguir...
};
```

## Estados e Ciclo de Vida

### Estados Internos

- **`errors`**: Objeto com mensagens de erro por campo
- **`touched`**: Objeto indicando quais campos foram interagidos
- **`isValid`**: Boolean indicando se não há erros
- **`hasAnyTouched`**: Boolean indicando se algum campo foi tocado

### Ciclo de Validação

1. **Inicial**: Formulário vazio, nenhum campo tocado
2. **Interação**: Usuário digita em campo
3. **Blur**: Campo marcado como tocado, validação executada
4. **Submit**: Todos os campos marcados como tocados, validação completa

## Tratamento de Erros

### Tipos de Erro

1. **Erros de Schema**: Validações Zod falham
2. **Erros de Campo**: Campo específico inválido
3. **Erros de Formulário**: Validação cruzada entre campos (`.refine()`)

### Estratégia de Exibição

- **Erros só aparecem após interação** (campo tocado)
- **Feedback visual consistente**: vermelho para erro, verde para sucesso
- **Mensagens claras e específicas** vindas do schema Zod

## Performance

### Otimizações

- **`useMemo`** para extração do schema base (evita recálculos)
- **`useCallback`** para funções de validação (estabilidade de referência)
- **Validação lazy**: só valida quando necessário (onBlur, onSubmit)

### Casos de Uso Pesados

Para formulários muito grandes, considere:
- Dividir em seções menores
- Usar validação assíncrona para campos complexos
- Implementar debouncing para validação em tempo real

## Debugging

### Logs de Desenvolvimento

O hook inclui logs detalhados para debugging:

```typescript
logger.log('🔍 validate(): Resultado da validação:', isValid);
logger.log('🔍 validate(): Erros encontrados:', errors);
```

### Problemas Comuns

1. **Schema não encontrado**: Verificar importação correta
2. **Campos não validados**: Verificar se campo existe no schema.shape
3. **Erros não aparecem**: Verificar se campo foi marcado como touched

## Manutenção

### Atualização de Schemas

Ao modificar schemas Zod:
1. Atualizar tipos TypeScript correspondentes
2. Testar validação em todos os componentes que usam o schema
3. Verificar impacto em outras etapas do workflow

### Extensões Futuras

Possíveis melhorias:
- Suporte a validação assíncrona
- Integração com bibliotecas de máscara (react-input-mask)
- Validação condicional baseada em outros campos
- Suporte a arrays e objetos aninhados complexos

---

*Documentação técnica do hook useFieldValidation - Minerva ERP v2.0*
*Última atualização: 24/11/2025*