# 🛡️ Sistema de Validação Padrão (Validation System)

> **Regra de Ouro:** Toda validação de formulário deve prover feedback visual imediato (Anéis Verde/Vermelho) e feedback textual claro, seguindo o padrão Zod + useFieldValidation.

---

## 📌 Visão Geral

O sistema de validação do Minerva ERP v2.0 foi desenhado para maximizar a UX (Experiência do Usuário), fornecendo:
1.  **Feedback Visual Positivo (Green Ring):** Confirmação imediata quando um campo está preenchido corretamente.
2.  **Feedback Visual Negativo (Red Ring):** Alerta claro com mensagem quando há erro.
3.  **Validação Híbrida:** Validação em tempo real (`onChange` após `touched`) e final (`onSubmit`).

### Stack Tecnológica
- **Schema:** [Zod](https://zod.dev/)
- **Hook:** `useFieldValidation` (`@/lib/hooks/use-field-validation`)
- **UI Components:** `FormInput`, `FormSelect`, `FormTextarea` (`@/components/ui/*`)

---

## 🏗️ Padrão de UX (O "Green Ring")

A assinatura visual do sistema é o "Green Ring" (Anel Verde) que aparece quando um campo obrigatório é preenchido corretamente.

### Regras de Feedback

| Estado | Visual | Condição Lógica (`FormInput`) |
|--------|--------|-------------------------------|
| **Normal** | Borda padrão (cinza) | `!touched` |
| **Sucesso** | Borda Verde + Ícone Check | `touched && !error && isValid` |
| **Erro** | Borda Vermelha + Ícone Alerta | `touched && error` |

**Nota:** O feedback de sucesso NÃO deve aparecer enquanto o usuário digita pela primeira vez (antes do primeiro `blur`), para evitar "piscar" desnecessário, a menos que o campo já tenha sido tocado.

---

## 🛠️ Guia de Implementação

### 1. Definindo o Schema (Zod)

Crie o schema em `@/lib/validations/`. Cada campo deve ter uma descrição (`.describe()`) e mensagens de erro amigáveis.

```typescript
// src/lib/validations/exemplo-schema.ts
import { z } from 'zod';

export const exemploSchema = z.object({
  nome: z.string()
    .min(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
    .describe('Nome completo do cliente'),
    
  email: z.string()
    .email({ message: 'Email inválido' })
    .describe('Email corporativo'),
    
  idade: z.number()
    .min(18, { message: 'Deve ser maior de 18 anos' })
});

export type ExemploData = z.infer<typeof exemploSchema>;
```

### 2. Configurando o Hook

No componente da página ou etapa (`src/components/...`), inicialize o hook.

```typescript
import { useFieldValidation } from '@/lib/hooks/use-field-validation';
import { exemploSchema } from '@/lib/validations/exemplo-schema';

export function MinhaEtapa({ data, onDataChange }) {
  const {
    errors,          // Objeto { campo: "mensagem" }
    touched,         // Objeto { campo: true }
    validateField,   // (campo, valor) => boolean
    markFieldTouched,// (campo) => void
    validateAll,     // (dados) => boolean
    markAllTouched   // () => void
  } = useFieldValidation(exemploSchema);
  
  // ...
}
```

### 3. Implementando os Componentes UI

Use **sempre** os componentes `Form*` (`FormInput`, `FormSelect`, etc.), pois eles encapsulam a lógica de renderização dos anéis e ícones.

#### Pattern de Props Obrigatórias

Para ativar o sistema de validação, você deve passar 4 props essenciais para cada input:

1.  **`onChange`**: Atualiza estado E valida se já tocado.
2.  **`onBlur`**: Marca como tocado E valida.
3.  **`error`**: Passa a mensagem de erro se o campo foi tocado.
4.  **`success`**: Passa a condição de sucesso.

```typescript
<FormInput
  id="nome"
  label="Nome Completo"
  required
  
  // 1. Value Binding
  value={data.nome}
  
  // 2. Interação Change (Validação Instantânea se tocado)
  onChange={(e) => {
    const newVal = e.target.value;
    onDataChange({ ...data, nome: newVal });
    if (touched.nome) validateField('nome', newVal);
  }}
  
  // 3. Interação Blur (Marca tocado e valida)
  onBlur={() => {
    markFieldTouched('nome');
    validateField('nome', data.nome);
  }}
  
  // 4. Estados Visuais
  error={touched.nome ? errors.nome : undefined}
  success={touched.nome && !errors.nome && data.nome.length >= 3}
  
  helperText="Digite o nome completo"
/>
```

> **Dica Pro:** A prop `success` aceita qualquer boleano. Use-a para lógica customizada (ex: `success={!errors.cpf && validarCPF(data.cpf)}`).

### 4. Validação Final e Scroll-to-Error

Exponha uma função de validação para o componente pai (geralmente o gerenciador de passos do workflow) usando `useImperativeHandle`.

```typescript
useImperativeHandle(ref, () => ({
  validate: () => {
    markAllTouched(); // Dispara o visual de erro em todos os campos vazios
    const isValid = validateAll(data);

    if (!isValid) {
      // UX: Scroll automático para o primeiro erro
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        document.getElementById(firstErrorField)?.focus();
      }
    }
    return isValid;
  }
}));
```

---

## 🧩 Componentes Disponíveis

Todos os componentes abaixo suportam as props `error` e `success`:

| Componente | Uso Principal | Importação |
|------------|---------------|------------|
| `FormInput` | Textos curtos, números | `@/components/ui/form-input` |
| `FormTextarea` | Textos longos, observações | `@/components/ui/form-textarea` |
| `FormSelect` | Seleção simples (Dropdown) | `@/components/ui/form-select` |
| `FormMaskedInput` | CPF, CNPJ, Telefone, Moeda | `@/components/ui/form-masked-input` |
| `FormDatePicker` | Datas | `@/components/ui/form-date-picker` |

---

## ❓ FAQ e Solução de Problemas

**Q: O anel verde não aparece.**
R: Verifique a prop `success`. Ela precisa ser `true`. Geralmente a lógica é `touched.campo && !errors.campo && valor.length > 0`.

**Q: O erro aparece assim que carrega a página.**
R: Você provavelmente passou `error={errors.campo}` direto. O correto é `error={touched.campo ? errors.campo : undefined}`. Erros só devem aparecer se `touched` for true.

**Q: Validação de arrays/listas (ex: uploads)?**
R: O hook `useFieldValidation` suporta arrays se definidos no Zod. Para componentes complexos como Upload, passe o estado de erro para o componente container ou trate a validação na função `validateAll`.

---

*Documentação atualizada em: 20/01/2026*