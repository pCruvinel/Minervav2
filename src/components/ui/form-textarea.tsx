import React from 'react';
import { Textarea } from './textarea';
import { Label } from './label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from './utils';

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  showCharCount?: boolean;
  id: string;
}

/**
 * FormTextarea - Textarea wrapper com validação visual
 *
 * Features:
 * - Borda vermelha + ícone de erro quando há erro
 * - Borda verde + ícone de sucesso quando válido
 * - Mensagem de erro abaixo do campo
 * - Contador de caracteres (opcional)
 * - Texto de ajuda (helper text)
 * - Label com indicador de campo obrigatório
 * - Acessibilidade com aria-invalid e aria-describedby
 *
 * @example
 * ```tsx
 * <FormTextarea
 *   id="observacoes"
 *   label="Observações"
 *   required
 *   maxLength={500}
 *   showCharCount
 *   value={formData.observacoes}
 *   onChange={(e) => handleChange('observacoes', e.target.value)}
 *   onBlur={() => validateField('observacoes')}
 *   error={errors.observacoes}
 *   success={!errors.observacoes && formData.observacoes.length >= 10}
 *   helperText="Mínimo 10 caracteres"
 * />
 * ```
 */
export function FormTextarea({
  label,
  error,
  required,
  success,
  helperText,
  showCharCount,
  className,
  id,
  value,
  maxLength,
  ...props
}: FormTextareaProps) {
  const hasError = !!error;
  const hasSuccess = success && !hasError;
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={id}>
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
          {showCharCount && maxLength && (
            <span className="text-xs text-muted-foreground">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <Textarea
          id={id}
          value={value}
          maxLength={maxLength}
          className={cn(
            className,
            hasError && "border-red-500 focus-visible:ring-red-500",
            hasSuccess && "border-green-500 focus-visible:ring-green-500"
          )}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
          {...props}
        />

        {(hasError || hasSuccess) && (
          <div className="absolute right-3 top-3 pointer-events-none">
            {hasError && <AlertCircle className="h-4 w-4 text-red-500" />}
            {hasSuccess && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </div>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 flex items-center gap-1">
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
