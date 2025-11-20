import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';

/**
 * Estado de erros de validação
 * Mapeia nome do campo -> mensagem de erro
 */
export type ValidationErrors = Record<string, string | undefined>;

/**
 * Estado de campos tocados
 * Mapeia nome do campo -> boolean (foi tocado?)
 */
export type TouchedFields = Record<string, boolean>;

/**
 * Resultado do hook useFieldValidation
 */
export interface UseFieldValidationResult {
  /** Erros de validação atuais */
  errors: ValidationErrors;
  /** Campos que foram tocados (blur foi chamado) */
  touched: TouchedFields;
  /** Valida um campo específico */
  validateField: (fieldName: string, value: any) => boolean;
  /** Valida todos os campos do formulário */
  validateAll: (formData: any) => boolean;
  /** Marca um campo como tocado */
  markFieldTouched: (fieldName: string) => void;
  /** Marca todos os campos como tocados */
  markAllTouched: () => void;
  /** Limpa todos os erros */
  clearErrors: () => void;
  /** Limpa o erro de um campo específico */
  clearFieldError: (fieldName: string) => void;
  /** Verifica se o formulário é válido */
  isValid: boolean;
  /** Verifica se algum campo foi tocado */
  hasAnyTouched: boolean;
}

/**
 * Hook: useFieldValidation
 *
 * Hook para integrar validação Zod com componentes de formulário
 *
 * Features:
 * - Validação por campo (on blur, on change)
 * - Validação de todo o formulário (on submit)
 * - Tracking de campos tocados (para mostrar erros apenas após interação)
 * - Integração com schemas Zod existentes
 * - Suporte a validação parcial (shape)
 *
 * @example
 * ```tsx
 * // No componente
 * const {
 *   errors,
 *   touched,
 *   validateField,
 *   validateAll,
 *   markFieldTouched,
 *   isValid
 * } = useFieldValidation(etapa3Schema);
 *
 * // No input
 * <FormInput
 *   id="nome"
 *   value={formData.nome}
 *   onChange={(e) => {
 *     handleChange('nome', e.target.value);
 *     if (touched.nome) validateField('nome', e.target.value);
 *   }}
 *   onBlur={() => {
 *     markFieldTouched('nome');
 *     validateField('nome', formData.nome);
 *   }}
 *   error={touched.nome ? errors.nome : undefined}
 *   success={touched.nome && !errors.nome && formData.nome.length > 0}
 * />
 *
 * // No submit
 * const handleSubmit = () => {
 *   markAllTouched();
 *   if (!validateAll(formData)) {
 *     toast.error('Corrija os erros antes de continuar');
 *     return;
 *   }
 *   // Continuar...
 * };
 * ```
 */
export function useFieldValidation(schema: z.ZodObject<any>): UseFieldValidationResult {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});

  /**
   * Valida um campo específico usando o schema Zod
   */
  const validateField = useCallback(
    (fieldName: string, value: any): boolean => {
      try {
        // Extrai o schema do campo específico
        const fieldSchema = schema.shape[fieldName];

        if (!fieldSchema) {
          console.warn(`⚠️ Campo "${fieldName}" não encontrado no schema`);
          return true;
        }

        // Valida o valor do campo
        fieldSchema.parse(value);

        // Limpa o erro se validação passou
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });

        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Extrai a mensagem de erro
          const message = error.errors[0]?.message || 'Valor inválido';

          setErrors((prev) => ({
            ...prev,
            [fieldName]: message,
          }));

          return false;
        }

        return true;
      }
    },
    [schema]
  );

  /**
   * Valida todos os campos do formulário
   */
  const validateAll = useCallback(
    (formData: any): boolean => {
      try {
        // Valida o formulário completo
        schema.parse(formData);

        // Limpa todos os erros
        setErrors({});
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Mapeia erros para o formato { fieldName: message }
          const newErrors: ValidationErrors = {};

          error.errors.forEach((err) => {
            const fieldName = err.path[0]?.toString();
            if (fieldName) {
              newErrors[fieldName] = err.message;
            }
          });

          setErrors(newErrors);
          return false;
        }

        return true;
      }
    },
    [schema]
  );

  /**
   * Marca um campo como tocado
   */
  const markFieldTouched = useCallback((fieldName: string) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  }, []);

  /**
   * Marca todos os campos do schema como tocados
   */
  const markAllTouched = useCallback(() => {
    const allFields: TouchedFields = {};
    Object.keys(schema.shape).forEach((fieldName) => {
      allFields[fieldName] = true;
    });
    setTouched(allFields);
  }, [schema]);

  /**
   * Limpa todos os erros
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Limpa o erro de um campo específico
   */
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Verifica se o formulário é válido (não tem erros)
   */
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  /**
   * Verifica se algum campo foi tocado
   */
  const hasAnyTouched = useMemo(() => {
    return Object.values(touched).some((t) => t === true);
  }, [touched]);

  return {
    errors,
    touched,
    validateField,
    validateAll,
    markFieldTouched,
    markAllTouched,
    clearErrors,
    clearFieldError,
    isValid,
    hasAnyTouched,
  };
}

/**
 * Hook alternativo: useSingleFieldValidation
 *
 * Hook simplificado para validar um único campo
 * Útil quando você não precisa de validação de formulário completo
 *
 * @example
 * ```tsx
 * const emailValidation = useSingleFieldValidation(z.string().email());
 *
 * <FormInput
 *   id="email"
 *   value={email}
 *   onChange={(e) => {
 *     setEmail(e.target.value);
 *     emailValidation.validate(e.target.value);
 *   }}
 *   error={emailValidation.error}
 *   success={emailValidation.isValid && email.length > 0}
 * />
 * ```
 */
export function useSingleFieldValidation(fieldSchema: z.ZodType<any>) {
  const [error, setError] = useState<string | undefined>();

  const validate = useCallback(
    (value: any): boolean => {
      try {
        fieldSchema.parse(value);
        setError(undefined);
        return true;
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError(err.errors[0]?.message || 'Valor inválido');
          return false;
        }
        return true;
      }
    },
    [fieldSchema]
  );

  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  const isValid = useMemo(() => error === undefined, [error]);

  return {
    error,
    validate,
    clearError,
    isValid,
  };
}
