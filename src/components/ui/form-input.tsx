import React from 'react';
import { Input } from './input';
import { Label } from './label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from './utils';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  id: string;
}

/**
 * FormInput - Input wrapper com validação visual
 *
 * Features:
 * - Borda vermelha + ícone de erro quando há erro
 * - Borda verde + ícone de sucesso quando válido
 * - Mensagem de erro abaixo do campo
 * - Texto de ajuda (helper text)
 * - Label com indicador de campo obrigatório
 * - Acessibilidade com aria-invalid e aria-describedby
 *
 * @example
 * ```tsx
 * <FormInput
 *   id="nome"
 *   label="Nome Completo"
 *   required
 *   value={formData.nome}
 *   onChange={(e) => handleChange('nome', e.target.value)}
 *   onBlur={() => validateField('nome')}
 *   error={errors.nome}
 *   success={!errors.nome && formData.nome.length >= 3}
 *   helperText="Mínimo 3 caracteres"
 * />
 * ```
 */
export function FormInput({
  label,
  error,
  required,
  success,
  helperText,
  className,
  id,
  ...props
}: FormInputProps) {
  const hasError = !!error;
  const hasSuccess = success && !hasError;

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          id={id}
          className={cn(
            className,
            hasError && "border-destructive focus-visible:ring-red-500",
            hasSuccess && "border-success focus-visible:ring-green-500"
          )}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
          {...props}
        />

        {(hasError || hasSuccess) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {hasError && <AlertCircle className="h-4 w-4 text-destructive" />}
            {hasSuccess && <CheckCircle2 className="h-4 w-4 text-success" />}
          </div>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {helperText && !error && (
        <p id={`${id}-helper`} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}
