import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from './utils';

interface FormErrorProps {
  /** Mensagem de erro a exibir */
  message?: string;

  /** Classes CSS adicionais */
  className?: string;

  /** Se o erro está visível */
  visible?: boolean;
}

/**
 * Componente para exibir mensagens de erro em formulários
 *
 * Exibe um alerta com ícone e mensagem de erro
 * Útil para feedback de validação de campos
 *
 * @example
 * ```tsx
 * <FormError message="Email é obrigatório" />
 * ```
 */
export function FormError({ message, className, visible = true }: FormErrorProps) {
  if (!visible || !message) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 mt-1 px-3 py-2 bg-red-50 border border-red-200 rounded-md',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
      <span className="text-sm text-red-700 font-medium">{message}</span>
    </div>
  );
}

interface FormFieldErrorProps extends FormErrorProps {
  /** Se há erro no campo */
  hasError?: boolean;

  /** Classes para o input com erro */
  inputClassName?: string;
}

/**
 * Wrapper para campo de formulário com suporte a erro
 *
 * Combina input com exibição de erro
 *
 * @example
 * ```tsx
 * <FormFieldError
 *   message={errors.email}
 *   hasError={!!errors.email}
 * >
 *   <input type="email" />
 * </FormFieldError>
 * ```
 */
export function FormFieldError({
  message,
  className,
  visible = true,
  hasError = false,
  inputClassName,
  children,
}: FormFieldErrorProps & { children?: React.ReactNode }) {
  return (
    <div className={className}>
      {children &&
        React.cloneElement(children as React.ReactElement, {
          className: cn(
            (children as React.ReactElement).props.className,
            hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500'
          ),
        })}
      <FormError message={message} visible={visible && hasError} />
    </div>
  );
}
