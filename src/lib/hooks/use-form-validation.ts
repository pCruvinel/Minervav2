import { useCallback, useState } from 'react';
import { validateStep, getStepValidationErrors, hasSchemaForStep } from '../validations/os-etapas-schema';
import { toast } from '../utils/safe-toast';

/**
 * Hook para gerenciar validação de formulários de etapas
 *
 * Fornece:
 * - Validação automática com feedback visual
 * - Gestão de erros de validação
 * - Estado de validação (válido/inválido)
 *
 * @example
 * ```tsx
 * const {
 *   validate,
 *   errors,
 *   hasErrors,
 *   showErrors
 * } = useFormValidation();
 *
 * const handleAdvance = () => {
 *   if (validate(currentStep, data)) {
 *     // Avançar
 *   }
 * };
 * ```
 */
export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validatedStep, setValidatedStep] = useState<number | null>(null);

  /**
   * Validar dados de uma etapa
   *
   * @param stepNumber Número da etapa (1-15)
   * @param data Dados a validar
   * @param showToast Se deve exibir toast com erros
   * @returns true se válido, false se inválido
   */
  const validate = useCallback(
    (stepNumber: number, data: any, showToast: boolean = true): boolean => {
      // Se não existe schema para esta etapa, considera válido
      if (!hasSchemaForStep(stepNumber)) {
        setErrors({});
        return true;
      }

      // Validar usando schema Zod
      const { valid, errors: validationErrors } = validateStep(stepNumber, data);

      setErrors(validationErrors);
      setValidatedStep(stepNumber);

      if (!valid && showToast) {
        // Exibir erros de validação
        const errorList = getStepValidationErrors(stepNumber, data);

        if (errorList.length > 0) {
          const errorMessage = errorList.slice(0, 3).join('\n');
          const moreErrors = errorList.length > 3
            ? `\n... e mais ${errorList.length - 3} erro(s)`
            : '';

          try {
            toast.error(`Preencha os campos obrigatórios:\n\n${errorMessage}${moreErrors}`);
          } catch (toastError) {
            console.error('❌ Erro ao exibir toast de validação:', toastError);
          }
        }

        console.warn(`⚠️ Etapa ${stepNumber} inválida:`, validationErrors);
      }

      return valid;
    },
    []
  );

  /**
   * Obter erro de um campo específico
   *
   * @param fieldName Nome do campo
   * @returns Mensagem de erro ou undefined
   */
  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return errors[fieldName];
  }, [errors]);

  /**
   * Verificar se há erros de validação
   */
  const hasErrors = Object.keys(errors).length > 0;

  /**
   * Limpar todos os erros
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Limpar erro de um campo específico
   *
   * @param fieldName Nome do campo
   */
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Mostrar erros em toast (sem revalidar)
   */
  const showErrors = useCallback((stepNumber: number) => {
    if (validatedStep === stepNumber && hasErrors) {
      const errorList = Object.values(errors).filter(error => typeof error === 'string');

      if (errorList.length > 0) {
        const errorMessage = errorList.slice(0, 3).join('\n');
        const moreErrors = errorList.length > 3
          ? `\n... e mais ${errorList.length - 3} erro(s)`
          : '';

        try {
          toast.error(`Erros na validação:\n\n${errorMessage}${moreErrors}`);
        } catch (toastError) {
          console.error('❌ Erro ao exibir toast de erros:', toastError);
        }
      }
    }
  }, [validatedStep, errors, hasErrors]);

  return {
    // Estado
    errors,
    hasErrors,
    validatedStep,

    // Funções
    validate,
    getFieldError,
    clearErrors,
    clearFieldError,
    showErrors,
  };
}
